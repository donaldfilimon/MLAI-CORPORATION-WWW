import { test, expect, afterEach } from "bun:test";
import { tmpdir } from "node:os";
import { PreviewManager } from "./preview";

const cwd = tmpdir();

const serveCommand = (p: number): string[] => [
  "bun",
  "-e",
  `Bun.serve({ port: ${p}, fetch: () => new Response("ok") }); setInterval(() => {}, 1e9);`,
];

async function isPortUp(port: number): Promise<boolean> {
  try {
    const res = await fetch(`http://localhost:${port}/`, { signal: AbortSignal.timeout(300) });
    return res.status === 200;
  } catch {
    return false;
  }
}

let manager: PreviewManager | undefined;

afterEach(async () => {
  if (manager) await manager.stopAll();
  manager = undefined;
});

test("start spawns a working server and reports running, stop tears it down", async () => {
  const port = 45231;
  manager = new PreviewManager({
    command: (_siteDir, p) => [
      "bun",
      "-e",
      `Bun.serve({ port: ${p}, fetch: () => new Response("ok") }); setInterval(() => {}, 1e9);`,
    ],
  });

  const status = await manager.start("site-a", cwd, port);
  expect(status.state).toBe("running");
  expect(status.port).toBe(port);
  expect(status.url).toBe(`http://localhost:${port}`);

  expect(manager.status("site-a")).toEqual(status);

  await manager.stop("site-a");
  expect(manager.status("site-a").state).toBe("stopped");
}, 15000);

test("start reports crashed when the process exits immediately", async () => {
  const port = 45232;
  manager = new PreviewManager({
    command: () => ["bun", "-e", "process.exit(1)"],
  });

  const status = await manager.start("site-b", cwd, port);
  expect(status.state).toBe("crashed");
}, 15000);

test("start resolves crashed (not a rejected promise) when the command itself cannot spawn", async () => {
  manager = new PreviewManager({
    command: () => ["definitely-not-a-real-executable-xyz"],
  });

  const status = await manager.start("site-c", cwd, 45233);
  expect(status.state).toBe("crashed");
  expect(status.url).toBeNull();
});

test("concurrent start() calls for the same siteId leave exactly one tracked entry and no orphaned process", async () => {
  const portA = 45241;
  const portB = 45242;
  manager = new PreviewManager({
    command: (_siteDir, p) => serveCommand(p),
  });

  const [statusA, statusB] = await Promise.all([
    manager.start("site-race", cwd, portA),
    manager.start("site-race", cwd, portB),
  ]);

  // Each call reports a definite outcome for its own process.
  expect(["running", "crashed"]).toContain(statusA.state);
  expect(["running", "crashed"]).toContain(statusB.state);

  // Exactly one of the two ports is the tracked slot for this siteId.
  const tracked = manager.status("site-race");
  expect(tracked.port).not.toBeNull();
  expect([portA, portB]).toContain(tracked.port as number);

  await manager.stopAll();

  // Neither port should still be answering: the tracked one was stopped by
  // stopAll(), and the "losing" racer must have been torn down by start()
  // itself rather than leaked as an untracked orphan.
  expect(await isPortUp(portA)).toBe(false);
  expect(await isPortUp(portB)).toBe(false);
}, 20000);

test("stop() racing a still-polling start() leaves the entry stopped, not resurrected to crashed", async () => {
  const port = 45243;
  manager = new PreviewManager({
    command: (_siteDir, p) => [
      "bun",
      "-e",
      `await new Promise((r) => setTimeout(r, 1500)); Bun.serve({ port: ${p}, fetch: () => new Response("ok") }); setInterval(() => {}, 1e9);`,
    ],
  });

  const startPromise = manager.start("site-race-2", cwd, port);
  // Let start() spawn and enter its poll loop, then kill it out from under
  // itself well before the server would ever come up (~1500ms).
  await new Promise((resolve) => setTimeout(resolve, 200));
  await manager.stop("site-race-2");

  await startPromise;

  // stop()'s explicit "stopped" must win: start()'s own completion (which
  // will see its process already dead) must not overwrite it to "crashed".
  expect(manager.status("site-race-2").state).toBe("stopped");
  expect(await isPortUp(port)).toBe(false);
}, 20000);

test("status returns a default stopped status for unknown siteId", () => {
  manager = new PreviewManager();
  expect(manager.status("nope")).toEqual({
    state: "stopped",
    port: null,
    url: null,
    logTail: [],
  });
});
