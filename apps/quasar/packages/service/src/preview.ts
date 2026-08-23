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

// Bun leaves `exitCode` null when a process dies from a signal (e.g. our own
// `.kill()`) — only `signalCode` gets set in that case. Any "has this
// process already terminated?" check needs both, or it'll miss kills.
function hasExited(proc: ReturnType<typeof Bun.spawn>): boolean {
  return proc.exitCode !== null || proc.signalCode !== null;
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
      if (hasExited(proc)) break;
      try {
        const res = await fetch(`http://localhost:${port}/`);
        if (res.status === 200) {
          running = true;
          break;
        }
      } catch {
        // server not up yet
      }
      if (hasExited(proc)) break;
      await sleep(HEALTH_POLL_INTERVAL_MS);
    }

    // The health check can succeed on a response emitted just before the
    // process died; re-check exit status before declaring victory.
    if (running && hasExited(proc)) running = false;

    if (!running && !hasExited(proc)) {
      proc.kill();
      await proc.exited.catch(() => {});
    }

    const finalStatus: PreviewStatus = running
      ? { state: "running", port, url: `http://localhost:${port}`, logTail }
      : { state: "crashed", port, url: null, logTail };

    // Another start()/stop() may have raced us while we were awaiting the
    // health poll / kill above. Only claim the tracked slot for this siteId
    // if we're still the entry that's there (by proc identity) and nobody
    // has explicitly stopped it out from under us in the meantime.
    const current = this.procs.get(siteId);
    if (current && current.proc === proc && current.status.state !== "stopped") {
      current.status = finalStatus;
    } else if (!hasExited(proc)) {
      // We lost the race: someone else now owns this siteId's slot (or it
      // was explicitly stopped). Don't leak our own untracked child process.
      proc.kill();
      await proc.exited.catch(() => {});
    }

    return cloneStatus(finalStatus);
  }

  async stop(siteId: string): Promise<void> {
    const entry = this.procs.get(siteId);
    if (!entry) return;
    const proc = entry.proc;
    if (proc && !hasExited(proc)) {
      proc.kill();
      await proc.exited.catch(() => {});
    }
    // Re-fetch after the await: a concurrent start() may have already
    // replaced this siteId's entry with a new (different) process. Only
    // write "stopped" back if we're still looking at the entry we killed.
    const current = this.procs.get(siteId);
    if (current && current.proc === proc) {
      current.status = { state: "stopped", port: null, url: null, logTail: current.status.logTail };
    }
  }

  status(siteId: string): PreviewStatus {
    const entry = this.procs.get(siteId);
    return entry ? cloneStatus(entry.status) : stoppedStatus();
  }

  async stopAll(): Promise<void> {
    await Promise.all([...this.procs.keys()].map((siteId) => this.stop(siteId)));
  }
}
