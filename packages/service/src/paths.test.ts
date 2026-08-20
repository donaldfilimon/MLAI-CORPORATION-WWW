import { test, expect, beforeEach } from "bun:test";
import { mkdtemp, mkdir, symlink, writeFile, realpath } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { resolveSitePath, PathGuardError } from "./paths";

let site: string;
beforeEach(async () => { site = await realpath(await mkdtemp(path.join(tmpdir(), "quasar-site-"))); });

test("resolves a normal relative path", async () => {
  expect(await resolveSitePath(site, "app/page.tsx")).toBe(path.join(site, "app/page.tsx"));
});
test("rejects absolute paths", async () => {
  await expect(resolveSitePath(site, "/etc/passwd")).rejects.toBeInstanceOf(PathGuardError);
});
test("rejects .. traversal", async () => {
  await expect(resolveSitePath(site, "../outside.txt")).rejects.toBeInstanceOf(PathGuardError);
  await expect(resolveSitePath(site, "a/../../b")).rejects.toBeInstanceOf(PathGuardError);
});
test("rejects blocked segments", async () => {
  for (const p of [".git/config", "node_modules/x.js", ".next/cache"]) {
    await expect(resolveSitePath(site, p)).rejects.toBeInstanceOf(PathGuardError);
  }
});
test("rejects case-insensitive blocked segments", async () => {
  for (const p of [".GIT/config", "NODE_MODULES/x.js", ".NEXT/cache", ".Git/config", "Node_Modules/lib"]) {
    await expect(resolveSitePath(site, p)).rejects.toBeInstanceOf(PathGuardError);
  }
});
test("rejects symlink escape", async () => {
  const outside = await mkdtemp(path.join(tmpdir(), "quasar-out-"));
  await symlink(outside, path.join(site, "leak"));
  await expect(resolveSitePath(site, "leak/x.txt")).rejects.toBeInstanceOf(PathGuardError);
});
