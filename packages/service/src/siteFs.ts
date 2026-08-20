import path from "node:path";
import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { resolveSitePath, MAX_FILE_BYTES, PathGuardError, BLOCKED } from "./paths";

async function collectFiles(rootReal: string, dir: string, out: string[]): Promise<void> {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (BLOCKED.has(entry.name.toLowerCase())) continue;
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await collectFiles(rootReal, abs, out);
    } else if (entry.isFile()) {
      out.push(path.relative(rootReal, abs).split(path.sep).join("/"));
    }
  }
}

export async function listSiteFiles(siteDir: string): Promise<string[]> {
  const rootReal = await resolveSitePath(siteDir, ".");
  const out: string[] = [];
  await collectFiles(rootReal, rootReal, out);
  out.sort();
  return out;
}

export async function readSiteFile(siteDir: string, relPath: string): Promise<string> {
  const abs = await resolveSitePath(siteDir, relPath);
  return readFile(abs, "utf8");
}

export async function writeSiteFile(siteDir: string, relPath: string, content: string): Promise<void> {
  if (Buffer.byteLength(content, "utf8") > MAX_FILE_BYTES) {
    throw new PathGuardError("file too large");
  }
  const abs = await resolveSitePath(siteDir, relPath);
  await mkdir(path.dirname(abs), { recursive: true });
  await writeFile(abs, content, "utf8");
}
