import { afterEach, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { checkTopology, forbiddenPaths, requiredPaths } from "./check-topology";

const scratch: string[] = [];
afterEach(() => {
  for (const path of scratch.splice(0)) rmSync(path, { recursive: true, force: true });
});

function fixture() {
  const root = mkdtempSync(join(tmpdir(), "mlai-topology-test-"));
  scratch.push(root);
  for (const path of requiredPaths) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    const body = path.endsWith(".json") ? "{}\n" : path === "bunfig.toml" ? '[install]\nlinker = "isolated"\n' : "";
    writeFileSync(join(root, path), body);
  }
  return root;
}

test("a complete single-workspace layout passes", () => {
  expect(checkTopology(fixture())).toEqual([]);
});

test("reports a missing required path", () => {
  const root = fixture();
  rmSync(join(root, "apps/mobile/metro.config.js"));
  expect(checkTopology(root)).toEqual(["missing: apps/mobile/metro.config.js"]);
});

test("rejects every app-level lockfile", () => {
  const root = fixture();
  for (const path of forbiddenPaths) writeFileSync(join(root, path), "{}\n");
  expect(checkTopology(root)).toEqual(forbiddenPaths.map((path) => `forbidden app lockfile: ${path}`));
});

test("rejects a nested workspaces field but allows the root one", () => {
  const root = fixture();
  writeFileSync(join(root, "package.json"), JSON.stringify({ workspaces: ["packages/*"] }));
  writeFileSync(join(root, "apps/quasar/package.json"), JSON.stringify({ workspaces: ["packages/*"] }));
  expect(checkTopology(root)).toEqual(["nested workspaces field: apps/quasar/package.json"]);
});

test("requires the isolated linker", () => {
  const root = fixture();
  writeFileSync(join(root, "bunfig.toml"), '[install]\nlinker = "hoisted"\n');
  expect(checkTopology(root)).toEqual(['bunfig.toml must set linker = "isolated"']);
});

test("the real repository passes and the CLI exits zero", () => {
  const result = spawnSync("bun", [resolve(import.meta.dir, "check-topology.ts")], { encoding: "utf8" });
  expect(result.stderr).toBe("");
  expect(result.status).toBe(0);
  expect(result.stdout).toContain("MLAI topology OK");
});
