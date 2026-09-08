import { execFileSync, spawn, type SpawnOptions } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

export class VerificationCleanupError extends Error {}

/** Only inspect/signal a detached group created by this verifier. */
export function signalVerificationGroup(
  pid: number,
  signal: NodeJS.Signals | 0,
) {
  try {
    process.kill(-pid, signal);
    return true;
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ESRCH") return false;
    if (code === "EPERM" && process.platform === "darwin") {
      // Darwin can report EPERM while a terminated group disappears. Require
      // independent absence evidence; never reinterpret a populated group.
      const groups = execFileSync("/bin/ps", ["-axo", "pgid="], {
        encoding: "utf8",
        timeout: 5000,
        stdio: ["ignore", "pipe", "pipe"],
      })
        .trim()
        .split(/\s+/);
      if (
        groups.length &&
        groups.every((group) => /^\d+$/.test(group)) &&
        !groups.some((group) => Number(group) === pid)
      )
        return false;
    }
    throw error;
  }
}

export function verificationCommandEnvironment(
  args: readonly string[],
  environment: NodeJS.ProcessEnv,
) {
  const env = { ...environment };
  // Model tests own their registries through per-test MLAI_DATA_DIR values.
  if (args[0] === "run" && args[1] === "check")
    delete env.MLAI_CONNECTIONS_FILE;
  return env;
}

export function selectedLocalModel(
  environment: Record<string, string | undefined>,
) {
  const url = environment.MLAI_LOCAL_MODEL_URL || environment.MLAI_MODEL_URL;
  const model = environment.MLAI_LOCAL_MODEL_ID || environment.MLAI_MODEL_ID;
  if (!url || !model?.trim())
    throw new Error(
      "Clean verification requires an explicitly selected local model URL and ID.",
    );
  for (const [local, live] of [
    [environment.MLAI_LOCAL_MODEL_URL, environment.MLAI_MODEL_URL],
    [environment.MLAI_LOCAL_MODEL_ID, environment.MLAI_MODEL_ID],
  ])
    if (local && live && local !== live)
      throw new Error("Conflicting explicit local model selections.");
  const parsed = new URL(url);
  if (
    !["127.0.0.1", "localhost", "[::1]"].includes(parsed.hostname) ||
    !["http:", "https:"].includes(parsed.protocol) ||
    parsed.username ||
    parsed.password
  )
    throw new Error(
      "Clean verification requires a credential-free loopback model URL.",
    );
  return { MLAI_LOCAL_MODEL_URL: url, MLAI_LOCAL_MODEL_ID: model };
}

/** Commands own a detached process group; never pass an unrelated process ID. */
export async function runVerificationCommand(
  command: string,
  args: string[],
  options: Pick<SpawnOptions, "cwd" | "env" | "stdio">,
  timeoutMs = 600_000,
  graceMs = 10_000,
) {
  if (process.platform === "win32")
    throw new Error(
      "Clean verification requires POSIX process-group ownership.",
    );
  const child = spawn(command, args, { ...options, detached: true });
  let timer: ReturnType<typeof setTimeout> | undefined;
  const finished = new Promise<void>((resolve, reject) => {
    child.once("error", reject);
    child.once("exit", (code, signal) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} exited with ${signal || code}.`));
    });
    timer = setTimeout(
      () => reject(new Error(`${command} timed out after ${timeoutMs}ms.`)),
      timeoutMs,
    );
  });
  const signalGroup = (signal: NodeJS.Signals | 0) => {
    if (!child.pid) return false;
    return signalVerificationGroup(child.pid, signal);
  };
  try {
    await finished;
  } finally {
    clearTimeout(timer);
    try {
      if (signalGroup("SIGTERM")) {
        const deadline = Date.now() + graceMs;
        while (signalGroup(0) && Date.now() < deadline) await delay(50);
        if (signalGroup("SIGKILL")) {
          const deadline = Date.now() + 5000;
          while (signalGroup(0) && Date.now() < deadline) await delay(50);
          if (signalGroup(0)) throw new Error("Process group still exists.");
        }
      }
    } catch (cause) {
      throw new VerificationCleanupError(
        "Verifier command cleanup could not be confirmed; retain its working directory.",
        { cause },
      );
    }
  }
}
