import { test, expect, afterEach } from "bun:test";
import { tmpdir } from "node:os";
import { PreviewManager } from "./preview";

const cwd = tmpdir();

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

test("status returns a default stopped status for unknown siteId", () => {
  manager = new PreviewManager();
  expect(manager.status("nope")).toEqual({
    state: "stopped",
    port: null,
    url: null,
    logTail: [],
  });
});
