import { afterEach, expect, test } from "bun:test";
import { mkdtempSync, readFileSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const scratch: string[] = [];
afterEach(() => {
  for (const path of scratch.splice(0)) rmSync(path, { recursive: true, force: true });
});

function run(options: { override?: string; fail?: string } = {}) {
  const root = mkdtempSync(join(tmpdir(), "mlai-tooling-test-"));
  scratch.push(root);
  const log = join(root, "commands");
  writeFileSync(join(root, "bun"), `#!/bin/sh\nprintf '%s|%s|%s\\n' "$2" "$MLAI_DATA_DIR" "$PWD" >> "$TEST_LOG"\nmkdir -p "$MLAI_DATA_DIR"\nprintf 'data' > "$MLAI_DATA_DIR/fixture"\nif [ "$2" = "$TEST_FAIL" ]; then exit 7; fi\n`, { mode: 0o755 });
  const env: NodeJS.ProcessEnv = { ...process.env, PATH: `${root}:${process.env.PATH}`, TMPDIR: root, TEST_LOG: log, TEST_FAIL: options.fail ?? "" };
  delete env.MLAI_DATA_DIR;
  if (options.override !== undefined) env.MLAI_DATA_DIR = options.override;
  const result = spawnSync("sh", [resolve(import.meta.dir, "../scripts/check-website-app.sh")], { env, encoding: "utf8" });
  const entries = existsSync(log) ? readFileSync(log, "utf8").trim().split("\n").map(line => line.split("|")) : [];
  return { result, entries };
}

test("migration and check share isolated data and the app cwd, then clean up", () => {
  const { result, entries } = run();
  expect(result.status).toBe(0);
  expect(entries.map(entry => entry[0])).toEqual(["db:migrate", "check"]);
  expect(entries[0][1]).toBe(entries[1][1]);
  expect(entries[0][1]).toContain("mlai-website-app-check.");
  expect(entries.map(entry => entry[2])).toEqual(Array(2).fill(resolve(import.meta.dir, "../../../apps/website-app")));
  expect(existsSync(entries[0][1])).toBe(false);
});

for (const fail of ["db:migrate", "check"]) {
  test(`preserves ${fail} failure and cleans owned data`, () => {
    const { result, entries } = run({ fail });
    expect(result.status).toBe(7);
    expect(entries.map(entry => entry[0])).toEqual(fail === "db:migrate" ? ["db:migrate"] : ["db:migrate", "check"]);
    expect(existsSync(entries[0][1])).toBe(false);
  });
}

test("preserves explicit data override and its contents even on failure", () => {
  const override = mkdtempSync(join(tmpdir(), "mlai-explicit data-"));
  scratch.push(override);
  writeFileSync(join(override, "keep"), "existing data");
  const { result, entries } = run({ override, fail: "check" });
  expect(result.status).toBe(7);
  expect(entries.map(entry => entry[1])).toEqual([override, override]);
  expect(readFileSync(join(override, "keep"), "utf8")).toBe("existing data");
  expect(existsSync(join(override, "fixture"))).toBe(true);
});

test("rejects an empty explicit override before migration", () => {
  const { result, entries } = run({ override: "" });
  expect(result.status).toBe(1);
  expect(result.stderr).toContain("MLAI_DATA_DIR must be nonempty");
  expect(entries).toEqual([]);
});
