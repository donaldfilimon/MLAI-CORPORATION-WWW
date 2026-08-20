import path from "node:path";
import { readdir, mkdir, copyFile } from "node:fs/promises";
import { BLOCKED } from "./paths";

async function copyDir(src: string, dest: string): Promise<void> {
  await mkdir(dest, { recursive: true });
  const entries = await readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    if (BLOCKED.has(entry.name.toLowerCase())) continue;
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else if (entry.isFile()) {
      await mkdir(dest, { recursive: true });
      await copyFile(srcPath, destPath);
    }
  }
}

export async function scaffoldSite(
  templateDir: string,
  siteDir: string,
  opts?: { install?: boolean }
): Promise<void> {
  await copyDir(templateDir, siteDir);

  if (opts?.install) {
    const proc = Bun.spawn(["bun", "install"], {
      cwd: siteDir,
      stdout: "ignore",
      stderr: "ignore",
    });
    await proc.exited;
  }
}
