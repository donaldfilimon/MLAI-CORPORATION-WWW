import type { PreviewStatus } from "@quasar/shared";

const LOG_TAIL_SIZE = 50;
const HEALTH_POLL_TRIES = 30;
const HEALTH_POLL_INTERVAL_MS = 500;

type CommandFn = (siteDir: string, port: number) => string[];

const defaultCommand: CommandFn = (_siteDir, port) => ["bun", "x", "next", "dev", "--port", String(port)];

function stoppedStatus(): PreviewStatus {
  return { state: "stopped", port: null, url: null, logTail: [] };
}

interface Entry {
  proc: ReturnType<typeof Bun.spawn> | null;
  status: PreviewStatus;
}

function cloneStatus(status: PreviewStatus): PreviewStatus {
  return { ...status, logTail: [...status.logTail] };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function pushLine(logTail: string[], line: string): void {
  logTail.push(line);
  if (logTail.length > LOG_TAIL_SIZE) logTail.shift();
}

async function pumpLines(stream: ReadableStream<Uint8Array> | null | undefined, logTail: string[]): Promise<void> {
  if (!stream) return;
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) pushLine(logTail, line);
    }
    if (buffer.length > 0) pushLine(logTail, buffer);
  } catch {
    // stream closed/killed underneath us; nothing more to read
  }
}

export class PreviewManager {
  private readonly command: CommandFn;
  private readonly procs = new Map<string, Entry>();

  constructor(opts?: { command?: CommandFn }) {
    this.command = opts?.command ?? defaultCommand;
  }

  async start(siteId: string, siteDir: string, port: number): Promise<PreviewStatus> {
    await this.stop(siteId);

    const cmd = this.command(siteDir, port);
    const logTail: string[] = [];

    let proc: ReturnType<typeof Bun.spawn>;
    try {
      proc = Bun.spawn(cmd, {
        cwd: siteDir,
        stdout: "pipe",
        stderr: "pipe",
      });
    } catch (err) {
      pushLine(logTail, err instanceof Error ? err.message : String(err));
      const status: PreviewStatus = { state: "crashed", port, url: null, logTail };
      this.procs.set(siteId, { proc: null, status });
      return cloneStatus(status);
    }

    const entry: Entry = {
      proc,
      status: { state: "starting", port, url: null, logTail },
    };
    this.procs.set(siteId, entry);

    void pumpLines(proc.stdout as ReadableStream<Uint8Array> | undefined, logTail);
    void pumpLines(proc.stderr as ReadableStream<Uint8Array> | undefined, logTail);

    proc.exited.then(() => {
      const current = this.procs.get(siteId);
      if (current && current.proc === proc && current.status.state === "running") {
        current.status = { ...current.status, state: "crashed" };
      }
    });

    let running = false;
    for (let i = 0; i < HEALTH_POLL_TRIES; i++) {
      if (proc.exitCode !== null) break;
      try {
        const res = await fetch(`http://localhost:${port}/`);
        if (res.status === 200) {
          running = true;
          break;
        }
      } catch {
        // server not up yet
      }
      if (proc.exitCode !== null) break;
      await sleep(HEALTH_POLL_INTERVAL_MS);
    }

    // The health check can succeed on a response emitted just before the
    // process died; re-check exit status before declaring victory.
    if (running && proc.exitCode !== null) running = false;

    if (running) {
      entry.status = { state: "running", port, url: `http://localhost:${port}`, logTail };
    } else {
      if (proc.exitCode === null) {
        proc.kill();
        await proc.exited.catch(() => {});
      }
      entry.status = { state: "crashed", port, url: null, logTail };
    }

    this.procs.set(siteId, entry);
    return cloneStatus(entry.status);
  }

  async stop(siteId: string): Promise<void> {
    const entry = this.procs.get(siteId);
    if (!entry) return;
    if (entry.proc && entry.proc.exitCode === null) {
      entry.proc.kill();
      await entry.proc.exited.catch(() => {});
    }
    entry.status = { state: "stopped", port: null, url: null, logTail: entry.status.logTail };
    this.procs.set(siteId, entry);
  }

  status(siteId: string): PreviewStatus {
    const entry = this.procs.get(siteId);
    return entry ? cloneStatus(entry.status) : stoppedStatus();
  }

  async stopAll(): Promise<void> {
    await Promise.all([...this.procs.keys()].map((siteId) => this.stop(siteId)));
  }
}
