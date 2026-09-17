import { writeVerificationReceipt } from "./verification-receipt";
import { spawn } from "node:child_process";
import { mkdtempSync, mkdirSync, copyFileSync, rmSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { tmpdir } from "node:os";
import assert from "node:assert/strict";
import { createServer } from "node:net";
import { releaseSource } from "./release-source";
import { workspaceSlice } from "./workspace-slice";
import { portAvailable, stopProcessTree } from "./verification-process";
import {
  runVerificationCommand,
  VerificationCleanupError,
  selectedLocalModel,
  verificationCommandEnvironment,
} from "./verification-command";
const origin = process.cwd(),
  retain = process.env.MLAI_KEEP_RELEASE === "1";
const model = selectedLocalModel(process.env);
const source = releaseSource(origin);
const slice = workspaceSlice(origin);
const parent = retain ? resolve(".data/releases") : tmpdir();
mkdirSync(parent, { recursive: true });
// The app installs through the repository's root Bun workspace, so the fresh
// copy mirrors that layout: the root lockfile, linker settings, every
// workspace manifest and packages/ at the copy's root, and this app at its
// repository path beneath it.
const workspace = mkdtempSync(join(parent, "mlai-clean-"));
const clean = join(workspace, slice.appPath);
for (const file of slice.files) {
  const destination = join(workspace, file);
  mkdirSync(dirname(destination), { recursive: true });
  copyFileSync(join(slice.root, file), destination);
}
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
    ...model,
    MLAI_DATA_DIR: join(clean, ".data"),
    MLAI_CONNECTIONS_FILE: join(clean, ".data/connections.json"),
    APP_URL: base,
    MLAI_TIKA_JAR: resolve(".tools/tika-app-3.3.2.jar"),
    NEXT_DIST_DIR: ".next",
  };
let server: ReturnType<typeof spawn> | undefined;
let passed = false;
let cleanupConfirmed = true;
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
  const steps: [string[], string][] = [
    // The root workspace (@mlai/platform) holds the @types/react fallback
    // that dependency declarations resolve through; see the root bunfig.toml.
    [
      [
        "install",
        "--filter",
        "@mlai/platform",
        "--filter",
        "mlai-website-app",
        "--frozen-lockfile",
      ],
      workspace,
    ],
    [["run", "setup"], clean],
    [["run", "check"], clean],
  ];
  for (const [args, cwd] of steps) {
    console.log(`Clean install: bun ${args.join(" ")}`);
    await runVerificationCommand("bun", args, {
      cwd,
      env: verificationCommandEnvironment(args, env),
      stdio: "inherit",
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
  await stopServer();
  assert.equal(
    releaseSource(origin).runtimeSourceSha256,
    source.runtimeSourceSha256,
    "Source changed during clean-install verification; rerun against the final source.",
  );
  writeVerificationReceipt(
    join(origin, "docs/verification/clean-install.json"),
    {
      checkedAt: new Date().toISOString(),
      source,
      workspaceSlice: { files: slice.files, sha256: slice.sha256 },
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
  );
  console.log(
    "PASS clean install, setup, check and production account workflow",
  );
  passed = true;
} catch (error) {
  if (error instanceof VerificationCleanupError) cleanupConfirmed = false;
  throw error;
} finally {
  await stopServer();
  if (!cleanupConfirmed)
    console.error(
      "Retained artifact because command cleanup failed:",
      workspace,
    );
  else if (!retain || !passed)
    rmSync(workspace, { recursive: true, force: true });
  else
    console.log(
      "Retained verified source, locked runtime and production build:",
      clean,
    );
}
