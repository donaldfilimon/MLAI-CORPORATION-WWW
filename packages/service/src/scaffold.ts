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

const STDERR_TAIL_LINES = 10;

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
      stderr: "pipe",
    });
    const [exitCode, stderr] = await Promise.all([proc.exited, new Response(proc.stderr).text()]);
    if (exitCode !== 0) {
      const tail = stderr
        .split("\n")
        .filter((line) => line.length > 0)
        .slice(-STDERR_TAIL_LINES)
        .join("\n");
      throw new Error(`bun install failed in ${siteDir} (exit ${exitCode})${tail ? `:\n${tail}` : ""}`);
    }
  }
}
