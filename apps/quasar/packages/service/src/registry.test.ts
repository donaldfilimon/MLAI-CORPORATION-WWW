import { test, expect, beforeEach } from "bun:test";
import { mkdtemp, readdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import type { Site } from "@quasar/shared";
import { readRegistry, writeRegistry } from "./registry";

let dir: string;
beforeEach(async () => {
  dir = await mkdtemp(path.join(tmpdir(), "quasar-registry-"));
});

function makeSite(id: string): Site {
  return {
    id,
    name: `Site ${id}`,
    slug: `site-${id}`,
    createdAt: new Date().toISOString(),
    status: "idle",
    previewPort: null,
    promptHistory: [],
  };
}

test("readRegistry returns [] when file is missing", async () => {
  const file = path.join(dir, "registry.json");
  const sites = await readRegistry(file);
  expect(sites).toEqual([]);
});

test("writeRegistry then readRegistry round-trips", async () => {
  const file = path.join(dir, "registry.json");
  const sites = [makeSite("a"), makeSite("b")];
  await writeRegistry(file, sites);
  const read = await readRegistry(file);
  expect(read).toEqual(sites);
});

test("writeRegistry leaves no .tmp file behind", async () => {
  const file = path.join(dir, "registry.json");
  await writeRegistry(file, [makeSite("a")]);
  const entries = await readdir(dir);
  expect(entries).toEqual(["registry.json"]);
});

test("writeRegistry creates parent directories", async () => {
  const file = path.join(dir, "nested", "sub", "registry.json");
  const sites = [makeSite("a")];
  await writeRegistry(file, sites);
  const read = await readRegistry(file);
  expect(read).toEqual(sites);
});
