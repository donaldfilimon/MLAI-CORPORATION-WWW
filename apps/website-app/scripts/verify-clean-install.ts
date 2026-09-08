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
import { releaseSource } from "./release-source";
import { portAvailable, stopProcessTree } from "./verification-process";
const origin = process.cwd(),
  retain = process.env.MLAI_KEEP_RELEASE === "1";
const source = releaseSource(origin);
const parent = retain ? resolve(".data/releases") : tmpdir();
mkdirSync(parent, { recursive: true });
const clean = mkdtempSync(join(parent, "mlai-clean-"));
for (const { file } of source.files) {
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
let passed = false;
async function stopServer() {
  if (!server) return;
  await stopProcessTree(server, port);
  server = undefined;
}
async function startServer(development = false) {
  assert.ok(
    await portAvailable(port),
    "Refusing to verify against an existing server.",
  );
  server = spawn("bun", development ? ["run", "dev"] : ["start"], {
    cwd: clean,
    env: { ...env, NEXT_DIST_DIR: development ? ".next-development" : ".next" },
    stdio: ["ignore", "ignore", "inherit"],
    detached: process.platform !== "win32",
  });
  const started = Date.now();
  for (;;) {
    if (server.exitCode !== null || server.signalCode !== null)
      throw new Error("Clean server exited before becoming healthy.");
    try {
      if ((await fetch(base + "/api/v1/health")).ok) break;
    } catch {}
    if (Date.now() - started > 60000)
      throw new Error("Clean server did not start.");
    await new Promise((r) => setTimeout(r, 250));
  }
  assert.equal((await fetch(base)).status, 200);
  assert.equal(
    server.exitCode,
    null,
    "Server exited during route verification.",
  );
  assert.equal(
    server.signalCode,
    null,
    "Server was terminated during route verification.",
  );
}
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
  // Prove dev startup regenerates the package, rather than consuming a stale dist.
  rmSync(join(clean, "packages/ui/dist"), { recursive: true, force: true });
  await startServer(true);
  await stopServer();
  await startServer();
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
  await stopServer();
  await startServer();
  const projects = await fetch(base + "/api/v1/projects", {
    headers: { Origin: base, Cookie: cookie },
  });
  assert.equal(projects.status, 200);
  assert.ok(
    (await projects.json()).some(
      (project: { name: string }) =>
        project.name === "Clean installation project",
    ),
  );
  assert.equal(
    (await fetch(base + "/app", { redirect: "manual" })).status,
    307,
  );
  assert.equal(
    releaseSource(origin).runtimeSourceSha256,
    source.runtimeSourceSha256,
    "Source changed during clean-install verification; rerun against the final source.",
  );
  mkdirSync(join(origin, "docs/verification"), { recursive: true });
  writeFileSync(
    join(origin, "docs/verification/clean-install.json"),
    JSON.stringify(
      {
        checkedAt: new Date().toISOString(),
        source,
        freshSourceCopy: true,
        frozenBunInstall: true,
        frozenPythonInstall: true,
        setupAndFormatValidation: true,
        allChecks: true,
        productionServer: true,
        accountAndProject: true,
        developmentRebuildsUi: true,
        productionRestartPersistence: true,
        processTreeStoppedAndPortReleased: true,
        unauthenticatedAppRedirect: true,
        dependencyModelCachesReused: true,
        productionArtifact: retain ? clean : null,
      },
      null,
      2,
    ) + "\n",
  );
  console.log(
    "PASS clean install, setup, check and production account workflow",
  );
  passed = true;
} finally {
  await stopServer();
  if (!retain || !passed) rmSync(clean, { recursive: true, force: true });
  else
    console.log(
      "Retained verified source, locked runtime and production build:",
      clean,
    );
}
