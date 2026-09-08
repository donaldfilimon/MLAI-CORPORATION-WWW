import { spawn } from "node:child_process";
import { createHash } from "node:crypto";

/** Stream large initial imports without execFileSync's output buffer limit. */
export function gitDiffHash(
  paths: string[],
  cwd = process.cwd(),
): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = createHash("sha256");
    const child = spawn("git", ["diff", "HEAD", "--", ...paths], {
      cwd,
      stdio: ["ignore", "pipe", "ignore"],
    });
    child.stdout.on("data", (chunk: Buffer) => hash.update(chunk));
    child.stdout.on("error", reject);
    child.on("error", reject);
    child.on("close", (code) => {
      if (code !== 0)
        reject(new Error(`git diff failed with exit code ${code}`));
      else resolve(hash.digest("hex"));
    });
  });
}
