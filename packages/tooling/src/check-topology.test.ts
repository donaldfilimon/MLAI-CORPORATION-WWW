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
  writeGuides(root, ".", canonicalAgents, pointerClaude);
  return root;
}

const canonicalAgents = "# AGENTS.md\n\nThis is the canonical guide; `CLAUDE.md` points here.\n";
const pointerClaude = "# CLAUDE.md\n\n`AGENTS.md` is canonical; read it first.\n";

function writeGuides(root: string, dir: string, agents?: string, claude?: string) {
  mkdirSync(join(root, dir), { recursive: true });
  if (agents !== undefined) writeFileSync(join(root, dir, "AGENTS.md"), agents);
  if (claude !== undefined) writeFileSync(join(root, dir, "CLAUDE.md"), claude);
}

const guideProblem = (dir: string, claims: string) =>
  `guides: ${dir} needs exactly one canonical guide (${claims} claim it) and the other naming it ("\`AGENTS.md\` is canonical") in its first 15 lines`;

test("a complete single-workspace layout passes", () => {
  expect(checkTopology(fixture())).toEqual([]);
});

test("reports a missing required path", () => {
  const root = fixture();
  rmSync(join(root, "apps/mlai/package.json"));
  expect(checkTopology(root)).toEqual(["missing: apps/mlai/package.json"]);
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

test("accepts a canonical guide paired with a pointer, in either direction", () => {
  const root = fixture();
  writeGuides(root, "apps/mlai", canonicalAgents, pointerClaude);
  writeGuides(root, "apps/quasar", "# AGENTS.md\n\n`CLAUDE.md` is the canonical guide.\n", "# CLAUDE.md\n\nCanonical guidance.\n");
  expect(checkTopology(root)).toEqual([]);
});

test("accepts a directory with one guide or none", () => {
  const root = fixture();
  writeGuides(root, "apps/mlai", canonicalAgents);
  writeGuides(root, "apps/quasar", undefined, "# CLAUDE.md\n");
  expect(checkTopology(root)).toEqual([]);
});

test("rejects two guides that both claim to be canonical", () => {
  const root = fixture();
  writeGuides(root, "apps/mlai", canonicalAgents, "# CLAUDE.md\n\nCanonical guidance for this app.\n");
  expect(checkTopology(root)).toEqual([guideProblem("apps/mlai", "AGENTS.md, CLAUDE.md")]);
});

test("rejects two guides where neither declares a canonical file", () => {
  const root = fixture();
  writeGuides(root, "apps/mlai", "# Repository Guide\n", "# CLAUDE.md\n\nRead AGENTS.md too.\n");
  expect(checkTopology(root)).toEqual([guideProblem("apps/mlai", "none")]);
});

test("rejects a canonical guide whose sibling does not name it", () => {
  const root = fixture();
  writeGuides(root, "apps/mlai", canonicalAgents, "# CLAUDE.md\n\nSee the other file.\n");
  expect(checkTopology(root)).toEqual([guideProblem("apps/mlai", "AGENTS.md")]);
});

test("reads only the opening lines of each guide", () => {
  const root = fixture();
  const late = "\n".repeat(20) + "`AGENTS.md` is canonical.\n";
  writeGuides(root, "apps/mlai", canonicalAgents, "# CLAUDE.md\n" + late);
  expect(checkTopology(root)).toEqual([guideProblem("apps/mlai", "AGENTS.md")]);
});

test("the real repository passes and the CLI exits zero", () => {
  const result = spawnSync("bun", [resolve(import.meta.dir, "check-topology.ts")], { encoding: "utf8" });
  expect(result.stderr).toBe("");
  expect(result.status).toBe(0);
  expect(result.stdout).toContain("MLAI topology OK");
});
