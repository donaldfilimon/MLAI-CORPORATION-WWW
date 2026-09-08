import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { expect, it } from "vitest";
import { gitDiffHash } from "../scripts/git-diff-hash";

it("hashes a large nested app import and excludes sibling changes", async () => {
  const root = mkdtempSync(join(tmpdir(), "mlai-diff-hash-"));
  const git = (...args: string[]) =>
    execFileSync("git", args, { cwd: root, stdio: "pipe" });
  try {
    git("init");
    git(
      "-c",
      "user.name=Test",
      "-c",
      "user.email=test@example.test",
      "commit",
      "--allow-empty",
      "-m",
      "base",
    );
    const app = join(root, "apps/local");
    mkdirSync(join(app, "src"), { recursive: true });
    writeFileSync(
      join(app, "src/large.txt"),
      "imported source\n".repeat(100000),
    );
    writeFileSync(join(root, "sibling.txt"), "unrelated source");
    git("add", ".");
    const bytes = execFileSync("git", ["diff", "HEAD", "--", "src"], {
      cwd: app,
      maxBuffer: 4 * 1024 * 1024,
    });
    expect(bytes.length).toBeGreaterThan(1024 * 1024);
    const expected = createHash("sha256").update(bytes).digest("hex");
    expect(await gitDiffHash(["src"], app)).toBe(expected);
    writeFileSync(join(root, "sibling.txt"), "changed sibling");
    expect(await gitDiffHash(["src"], app)).toBe(expected);
    await expect(gitDiffHash(["src"], tmpdir())).rejects.toThrow(
      "git diff failed",
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
