import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync, realpathSync } from "node:fs";
import { join, relative } from "node:path";

/**
 * The repository installs every app through one root Bun workspace, so a
 * frozen install of this app needs the root lockfile, the linker settings and
 * every workspace manifest the lockfile names, plus the shared `packages/`
 * sources. This lists that slice (paths relative to the repository root),
 * excluding this app's own files, which the release source already covers.
 */
export function workspaceSlice(appDirectory = process.cwd()) {
  // Git reports the real path, so compare against the real app path too.
  const app = realpathSync(appDirectory);
  const root = execFileSync("git", ["rev-parse", "--show-toplevel"], {
    cwd: app,
    encoding: "utf8",
  }).trim();
  const appPrefix = `${relative(root, app)}/`;
  const manifest = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
  const workspaces: string[] = manifest.workspaces ?? [];
  const pathspecs = [
    "package.json",
    "bun.lock",
    "bunfig.toml",
    "packages",
    ...workspaces.map((pattern) => `:(glob)${pattern}/package.json`),
  ];
  const files = [
    ...new Set(
      execFileSync(
        "git",
        [
          "ls-files",
          "--cached",
          "--others",
          "--exclude-standard",
          "-z",
          "--",
          ...pathspecs,
        ],
        { cwd: root, encoding: "utf8" },
      )
        .split("\0")
        .filter(Boolean),
    ),
  ]
    .filter((file) => !file.startsWith(appPrefix))
    .sort();
  for (const required of ["package.json", "bun.lock", "bunfig.toml"])
    if (!files.includes(required))
      throw new Error(`Workspace slice is missing ${required}.`);
  const sha256 = createHash("sha256");
  for (const file of files) {
    sha256.update(`${file}\0`);
    sha256.update(readFileSync(join(root, file)));
    sha256.update("\0");
  }
  return {
    root,
    appPath: relative(root, app),
    files,
    sha256: sha256.digest("hex"),
  };
}
