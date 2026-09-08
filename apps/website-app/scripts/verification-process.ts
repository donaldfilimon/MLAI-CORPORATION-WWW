import { type ChildProcess, execFileSync } from "node:child_process";
import { once } from "node:events";
import { createServer } from "node:net";

export async function portAvailable(port: number) {
  const probe = createServer();
  return new Promise<boolean>((resolve, reject) => {
    probe.once("error", (error: NodeJS.ErrnoException) => {
      if (error.code === "EADDRINUSE") resolve(false);
      else reject(error);
    });
    probe.listen(port, "127.0.0.1", () => probe.close(() => resolve(true)));
  });
}

/** Only pass a child started by this verifier with detached:true on POSIX. */
export async function stopProcessTree(child: ChildProcess, port: number) {
  const exited =
    child.exitCode === null && child.signalCode === null
      ? once(child, "exit")
      : Promise.resolve();
  const signal = (name: NodeJS.Signals) => {
    try {
      if (process.platform === "win32")
        execFileSync("taskkill", ["/pid", String(child.pid), "/T", "/F"], {
          stdio: "ignore",
        });
      else if (child.pid) process.kill(-child.pid, name);
    } catch (error) {
      if (
        process.platform !== "win32" &&
        (error as NodeJS.ErrnoException).code !== "ESRCH"
      )
        throw error;
    }
  };
  signal("SIGTERM");
  const timer = setTimeout(() => signal("SIGKILL"), 10000);
  try {
    await exited;
    const deadline = Date.now() + 15000;
    while (!(await portAvailable(port))) {
      if (Date.now() >= deadline)
        throw new Error("Verifier process tree did not release its port.");
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  } finally {
    clearTimeout(timer);
    signal("SIGKILL");
  }
}
