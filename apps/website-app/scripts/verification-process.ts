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

// macOS can report EPERM while the last group members are exiting. A free
// port alone does not prove cleanup: an idle descendant can still be alive.
async function groupHasExited(pid: number) {
  const deadline = Date.now() + 1000;
  do {
    const rows = execFileSync("ps", ["-axo", "pid=,pgid=,stat="], {
      encoding: "utf8",
    }).trim();
    const members = rows
      ? rows
          .split("\n")
          .map((row) => {
            const match = row.match(/^\s*(\d+)\s+(\d+)\s+(\S+)\s*$/);
            if (!match)
              throw new Error("Cannot inspect verifier process group.");
            return { group: Number(match[2]), state: match[3] };
          })
          .filter((member) => member.group === pid)
      : [];
    if (members.every((member) => member.state.startsWith("Z"))) return true;
    if (Date.now() >= deadline) return false;
    await new Promise((resolve) => setTimeout(resolve, 25));
  } while (true);
}

/** Only pass a child started by this verifier with detached:true on POSIX. */
export async function stopProcessTree(child: ChildProcess, port: number) {
  const exited =
    child.exitCode === null && child.signalCode === null
      ? once(child, "exit")
      : Promise.resolve();
  const signal = async (name: NodeJS.Signals) => {
    try {
      if (process.platform === "win32")
        execFileSync("taskkill", ["/pid", String(child.pid), "/T", "/F"], {
          stdio: "ignore",
        });
      else if (child.pid) process.kill(-child.pid, name);
    } catch (error) {
      if (process.platform === "win32") return;
      const code = (error as NodeJS.ErrnoException).code;
      if (code === "ESRCH") return;
      if (code === "EPERM" && child.pid && (await groupHasExited(child.pid)))
        return;
      throw error;
    }
  };
  await signal("SIGTERM");
  let timer: ReturnType<typeof setTimeout>;
  const escalation = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(() => {
      void signal("SIGKILL").catch(reject);
    }, 10000);
  });
  try {
    await Promise.race([exited, escalation]);
    const deadline = Date.now() + 15000;
    while (!(await portAvailable(port))) {
      if (Date.now() >= deadline)
        throw new Error("Verifier process tree did not release its port.");
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  } finally {
    clearTimeout(timer!);
    await signal("SIGKILL");
  }
}
