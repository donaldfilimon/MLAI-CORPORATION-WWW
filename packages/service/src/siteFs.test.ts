import { test, expect, beforeEach } from "bun:test";
import { mkdtemp, mkdir, writeFile, realpath } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { PathGuardError } from "./paths";
import { listSiteFiles, readSiteFile, writeSiteFile } from "./siteFs";

let site: string;
beforeEach(async () => {
  site = await realpath(await mkdtemp(path.join(tmpdir(), "quasar-sitefs-")));
});

test("listSiteFiles returns sorted relative paths, skipping blocked dirs", async () => {
  await mkdir(path.join(site, "app"), { recursive: true });
  await mkdir(path.join(site, "node_modules"), { recursive: true });
  await mkdir(path.join(site, ".git"), { recursive: true });
  await mkdir(path.join(site, ".next"), { recursive: true });
  await writeFile(path.join(site, "app", "page.tsx"), "hello");
  await writeFile(path.join(site, "README.md"), "readme");
  await writeFile(path.join(site, "node_modules", "skip.js"), "skip");
  await writeFile(path.join(site, ".git", "HEAD"), "ref: refs/heads/main");
  await writeFile(path.join(site, ".next", "cache.bin"), "cache");

  const files = await listSiteFiles(site);
  expect(files).toEqual(["README.md", "app/page.tsx"]);
});

test("writeSiteFile creates parent dirs and round-trips with readSiteFile", async () => {
  await writeSiteFile(site, "nested/dir/file.txt", "hello world");
  const content = await readSiteFile(site, "nested/dir/file.txt");
  expect(content).toBe("hello world");
});

test("writeSiteFile rejects content larger than MAX_FILE_BYTES", async () => {
  const big = "x".repeat(512 * 1024 + 1);
  await expect(writeSiteFile(site, "big.txt", big)).rejects.toBeInstanceOf(PathGuardError);
});

test("readSiteFile rejects path traversal", async () => {
  await expect(readSiteFile(site, "../x")).rejects.toBeInstanceOf(PathGuardError);
});
