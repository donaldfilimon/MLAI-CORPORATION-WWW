import { execFileSync, spawn } from "node:child_process";
import {
  mkdtempSync,
  mkdirSync,
  copyFileSync,
  writeFileSync,
  rmSync,
} from "node:fs";
import { join, resolve, dirname } from "node:path";
import { tmpdir } from "node:os";
import assert from "node:assert/strict";
import { createServer } from "node:net";
const origin = process.cwd(),
  clean = mkdtempSync(join(tmpdir(), "mlai-clean-"));
const files = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" })
  .split("\0")
  .filter(Boolean);
for (const file of files) {
  const destination = join(clean, file);
  mkdirSync(dirname(destination), { recursive: true });
  copyFileSync(join(origin, file), destination);
}
const socket = createServer();
await new Promise<void>((r) => socket.listen(0, "127.0.0.1", r));
const port = (socket.address() as { port: number }).port;
await new Promise<void>((r) => socket.close(() => r()));
const base = `http://127.0.0.1:${port}`,
  env = {
    ...process.env,
    MLAI_DATA_DIR: join(clean, ".data"),
    APP_URL: base,
    MLAI_TIKA_JAR: resolve(".tools/tika-app-3.3.2.jar"),
    NEXT_DIST_DIR: ".next",
  };
let server: ReturnType<typeof spawn> | undefined;
try {
  for (const args of [
    ["install", "--frozen-lockfile"],
    ["run", "setup"],
    ["run", "check"],
  ]) {
    console.log(`Clean install: bun ${args.join(" ")}`);
    execFileSync("bun", args, {
      cwd: clean,
      env,
      stdio: "inherit",
      timeout: 600000,
    });
  }
  server = spawn("bun", ["start"], {
    cwd: clean,
    env,
    stdio: ["ignore", "ignore", "ignore"],
  });
  const started = Date.now();
  for (;;) {
    try {
      if ((await fetch(base + "/api/v1/health")).ok) break;
    } catch {}
    if (Date.now() - started > 30000)
      throw new Error("Clean server did not start.");
    await new Promise((r) => setTimeout(r, 250));
  }
  assert.equal((await fetch(base)).status, 200);
  const signup = await fetch(base + "/api/auth/sign-up/email", {
    method: "POST",
    headers: { Origin: base, "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Clean fixture",
      email: "clean@example.test",
      password: "Clean-install-test-2026!",
    }),
  });
  assert.equal(signup.status, 200);
  const cookie = signup.headers
    .getSetCookie()
    .map((c) => c.split(";")[0])
    .join("; ");
  assert.equal(
    (
      await fetch(base + "/api/v1/projects", {
        method: "POST",
        headers: {
          Origin: base,
          Cookie: cookie,
          "Content-Type": "application/json",
        },
        body: '{"name":"Clean installation project"}',
      })
    ).status,
    201,
  );
  mkdirSync(join(origin, "docs/verification"), { recursive: true });
  writeFileSync(
    join(origin, "docs/verification/clean-install.json"),
    JSON.stringify(
      {
        checkedAt: new Date().toISOString(),
        freshSourceCopy: true,
        frozenBunInstall: true,
        frozenPythonInstall: true,
        setupAndFormatValidation: true,
        allChecks: true,
        productionServer: true,
        accountAndProject: true,
        dependencyModelCachesReused: true,
      },
      null,
      2,
    ) + "\n",
  );
  console.log(
    "PASS clean install, setup, check and production account workflow",
  );
} finally {
  server?.kill("SIGTERM");
  await new Promise((r) => setTimeout(r, 1000));
  if (server?.exitCode === null) server.kill("SIGKILL");
  rmSync(clean, { recursive: true, force: true });
}
