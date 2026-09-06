import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, lstatSync, readFileSync } from "node:fs";
import { join } from "node:path";

/** Include new package sources, but never ignored runtime state or generated output. */
export function releaseSource(root = process.cwd()) {
  const files = [
    ...new Set(
      execFileSync(
        "git",
        ["ls-files", "--cached", "--others", "--exclude-standard", "-z"],
        { cwd: root, encoding: "utf8" },
      )
        .split("\0")
        .filter(Boolean),
    ),
  ]
    .filter((file) => file !== "next-env.d.ts" && existsSync(join(root, file)))
    .sort();
  const manifest = files.map((file) => {
    if (!lstatSync(join(root, file)).isFile())
      throw new Error(`Release source must be a regular file: ${file}`);
    return {
      file,
      sha256: createHash("sha256")
        .update(readFileSync(join(root, file)))
        .digest("hex"),
    };
  });
  // Documentation and receipts may be updated after verification without changing the program.
  const runtime = manifest.filter(
    ({ file }) =>
      !file.startsWith("docs/") &&
      !["README.md", "AGENTS.md", "CLAUDE.md"].includes(file),
  );
  return {
    baseCommit: execFileSync("git", ["rev-parse", "HEAD"], {
      cwd: root,
      encoding: "utf8",
    }).trim(),
    runtimeSourceSha256: createHash("sha256")
      .update(JSON.stringify(runtime))
      .digest("hex"),
    files: manifest,
  };
}
