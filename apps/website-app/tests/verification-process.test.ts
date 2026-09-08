import { EventEmitter } from "node:events";
import { afterEach, expect, it, vi } from "vitest";
import { type ChildProcess, execFileSync, spawn } from "node:child_process";
import {
  stopProcessTree,
  portAvailable,
} from "../scripts/verification-process";

vi.mock("node:child_process", async (importOriginal) => {
  const actual = await importOriginal<typeof import("node:child_process")>();
  return { ...actual, execFileSync: vi.fn(actual.execFileSync) };
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.mocked(execFileSync).mockReset();
  vi.useRealTimers();
});

const exitedChild = {
  pid: 123456,
  exitCode: 0,
  signalCode: null,
} as ChildProcess;
const denied = () => Object.assign(new Error("kill EPERM"), { code: "EPERM" });
function denyFinalKill() {
  const error = denied();
  vi.spyOn(process, "kill").mockImplementation((_pid, signal) => {
    if (signal === "SIGKILL") throw error;
    return true;
  });
  return error;
}

it.skipIf(process.platform === "win32")(
  "accepts EPERM only after the exiting process group disappears",
  async () => {
    denyFinalKill();
    vi.mocked(execFileSync)
      .mockReturnValueOnce("123457 123456 ?E\n")
      .mockReturnValueOnce("");
    await expect(stopProcessTree(exitedChild, 0)).resolves.toBeUndefined();
    expect(execFileSync).toHaveBeenCalledTimes(2);
  },
);
it.skipIf(process.platform === "win32")(
  "accepts a group containing only terminated zombies",
  async () => {
    denyFinalKill();
    vi.mocked(execFileSync).mockReturnValue("123457 123456 Z+\n999 999 S\n");
    await expect(stopProcessTree(exitedChild, 0)).resolves.toBeUndefined();
  },
);
it.skipIf(process.platform === "win32")(
  "preserves EPERM when a descendant stays alive despite the free port",
  async () => {
    const error = denyFinalKill();
    vi.mocked(execFileSync).mockReturnValue("123457 123456 S\n");
    await expect(stopProcessTree(exitedChild, 0)).rejects.toBe(error);
  },
);
it.skipIf(process.platform === "win32")(
  "fails closed when group inspection fails",
  async () => {
    denyFinalKill();
    vi.mocked(execFileSync).mockImplementation(() => {
      throw new Error("ps failed");
    });
    await expect(stopProcessTree(exitedChild, 0)).rejects.toThrow("ps failed");
  },
);
it.skipIf(process.platform === "win32")(
  "rejects malformed group inspection output",
  async () => {
    denyFinalKill();
    vi.mocked(execFileSync).mockReturnValue("unknown output");
    await expect(stopProcessTree(exitedChild, 0)).rejects.toThrow(
      "Cannot inspect",
    );
  },
);
it.skipIf(process.platform === "win32")(
  "kills a grandchild that closes its port but remains alive after SIGTERM",
  async () => {
    const listener = `const s=require('node:net').createServer(); setInterval(()=>{},1000); process.on('SIGTERM',()=>s.close()); s.listen(0,'127.0.0.1',()=>console.log(JSON.stringify({port:s.address().port,pid:process.pid})));`;
    const wrapper = `require('node:child_process').spawn(process.execPath,['-e',${JSON.stringify(listener)}],{stdio:'inherit'})`;
    const child = spawn(process.execPath, ["-e", wrapper], {
      detached: true,
      stdio: ["ignore", "pipe", "pipe"],
    });
    const { port, pid } = await new Promise<{ port: number; pid: number }>(
      (resolve, reject) => {
        child.once("error", reject);
        child.stdout!.once("data", (data) => resolve(JSON.parse(String(data))));
      },
    );
    try {
      await stopProcessTree(child, port);
      expect(await portAvailable(port)).toBe(true);
      const deadline = Date.now() + 1000;
      let live = true;
      while (live && Date.now() < deadline) {
        const rows = execFileSync("ps", ["-axo", "pid=,stat="], {
          encoding: "utf8",
        })
          .trim()
          .split("\n");
        live = rows.some((row) => {
          const [id, state] = row.trim().split(/\s+/);
          return Number(id) === pid && !state.startsWith("Z");
        });
        if (live) await new Promise((resolve) => setTimeout(resolve, 25));
      }
      expect(live).toBe(false);
    } finally {
      try {
        process.kill(-child.pid!, "SIGKILL");
      } catch (error) {
        if (
          !["ESRCH", "EPERM"].includes(
            (error as NodeJS.ErrnoException).code ?? "",
          )
        )
          throw error;
      }
    }
  },
);

it.skipIf(process.platform === "win32")(
  "rejects escalation permission failures through the cleanup promise",
  async () => {
    vi.useFakeTimers();
    const child = Object.assign(new EventEmitter(), {
      pid: 123456,
      exitCode: null,
      signalCode: null,
    }) as ChildProcess;
    const error = Object.assign(new Error("kill EACCES"), { code: "EACCES" });
    vi.spyOn(process, "kill").mockImplementation((_pid, signal) => {
      if (signal === "SIGKILL") throw error;
      return true;
    });
    const result = expect(stopProcessTree(child, 0)).rejects.toBe(error);
    await vi.advanceTimersByTimeAsync(10000);
    await result;
  },
);
