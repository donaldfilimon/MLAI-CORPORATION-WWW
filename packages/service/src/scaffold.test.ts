import { test, expect, beforeEach } from "bun:test";
import { mkdtemp, mkdir, writeFile, readFile, readdir, realpath } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { scaffoldSite } from "./scaffold";

let templateDir: string;
let siteDir: string;

beforeEach(async () => {
  templateDir = await realpath(await mkdtemp(path.join(tmpdir(), "quasar-scaffold-template-")));
  const siteRoot = await realpath(await mkdtemp(path.join(tmpdir(), "quasar-scaffold-site-")));
  siteDir = path.join(siteRoot, "site");

  await writeFile(path.join(templateDir, "a.txt"), "a contents");
  await mkdir(path.join(templateDir, "sub"), { recursive: true });
  await writeFile(path.join(templateDir, "sub", "b.txt"), "b contents");
  await mkdir(path.join(templateDir, "node_modules"), { recursive: true });
  await writeFile(path.join(templateDir, "node_modules", "skip.js"), "skip me");
});

test("scaffoldSite copies files recursively, skipping node_modules/.next/.git", async () => {
  await mkdir(path.join(templateDir, ".next"), { recursive: true });
  await writeFile(path.join(templateDir, ".next", "cache.bin"), "cache");
  await mkdir(path.join(templateDir, ".git"), { recursive: true });
  await writeFile(path.join(templateDir, ".git", "HEAD"), "ref: refs/heads/main");

  await scaffoldSite(templateDir, siteDir, { install: false });

  const a = await readFile(path.join(siteDir, "a.txt"), "utf8");
  const b = await readFile(path.join(siteDir, "sub", "b.txt"), "utf8");
  expect(a).toBe("a contents");
  expect(b).toBe("b contents");

  await expect(readFile(path.join(siteDir, "node_modules", "skip.js"), "utf8")).rejects.toThrow();
  await expect(readFile(path.join(siteDir, ".next", "cache.bin"), "utf8")).rejects.toThrow();
  await expect(readFile(path.join(siteDir, ".git", "HEAD"), "utf8")).rejects.toThrow();
});

test("scaffoldSite defaults to no install when opts omitted: no node_modules is created", async () => {
  await scaffoldSite(templateDir, siteDir);
  const a = await readFile(path.join(siteDir, "a.txt"), "utf8");
  expect(a).toBe("a contents");

  const top = await readdir(siteDir);
  expect(top).not.toContain("node_modules");
});

test("scaffoldSite with install:true actually runs `bun install` in siteDir", async () => {
  // A zero-network, offline-resolvable dependency: a local `file:` package
  // living alongside the site in the template, so bun install has something
  // real to link without touching the network.
  await mkdir(path.join(templateDir, "local-dep"), { recursive: true });
  await writeFile(
    path.join(templateDir, "local-dep", "package.json"),
    JSON.stringify({ name: "local-dep", version: "1.0.0", main: "index.js" })
  );
  await writeFile(path.join(templateDir, "local-dep", "index.js"), "module.exports = 42;");
  await writeFile(
    path.join(templateDir, "package.json"),
    JSON.stringify({ name: "site", private: true, dependencies: { "local-dep": "file:./local-dep" } })
  );

  await scaffoldSite(templateDir, siteDir, { install: true });

  // the copied tree is intact
  await expect(readFile(path.join(siteDir, "a.txt"), "utf8")).resolves.toBe("a contents");

  // bun install actually ran: it linked the local dependency into node_modules
  const installed = await readdir(path.join(siteDir, "node_modules"));
  expect(installed).toContain("local-dep");
}, 15000);

test("scaffoldSite rejects when `bun install` fails, surfacing exit code + stderr tail", async () => {
  // Invalid JSON guarantees `bun install` fails fast, offline, with no retries.
  await writeFile(path.join(templateDir, "package.json"), "{ this is not valid json");

  let error: unknown;
  try {
    await scaffoldSite(templateDir, siteDir, { install: true });
  } catch (err) {
    error = err;
  }

  expect(error).toBeInstanceOf(Error);
  const message = (error as Error).message;
  expect(message).toMatch(/install/i);
  expect(message).toMatch(/exit \d+/);
  // the stderr tail is actually included, not just an "install failed" stub
  expect(message).toMatch(/Parser|json/i);
}, 15000);
