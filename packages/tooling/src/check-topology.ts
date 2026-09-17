import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

// Every app installs through the one root Bun workspace (root bun.lock plus the
// isolated linker in bunfig.toml). These paths must exist for that layout.
export const requiredPaths = [
  "AGENTS.md",
  "CLAUDE.md",
  "README.md",
  "package.json",
  "bun.lock",
  "bunfig.toml",
  "apps/web/package.json",
  "apps/mobile/package.json",
  "apps/mobile/metro.config.js",
  "apps/mobile/tsconfig.typecheck.json",
  "apps/quasar/package.json",
  "apps/quasar/packages/shared/package.json",
  "apps/quasar/packages/service/package.json",
  "apps/quasar/apps/quasar/package.json",
  "apps/quasar/apps/quasar/metro.config.js",
  "apps/quasar/apps/quasar/tsconfig.typecheck.json",
  "apps/website-app/package.json",
  "apps/website-app/packages/ui/package.json",
  "apps/website-app/mlai-website-agent/package.json",
  "apps/website-app/worker/pyproject.toml",
  "apps/website-app/worker/uv.lock",
  "apps/research-sites/package.json",
  "apps/research-sites/public/research-manifest.json",
  "packages/contracts/package.json",
  "packages/design-tokens/package.json",
  "packages/trailer-engine/package.json",
];

// A second lockfile would silently resolve a different tree from the root one.
// (apps/quasar/templates/next-site stays outside the workspace and keeps its own.)
export const forbiddenPaths = [
  "apps/web/bun.lock",
  "apps/mobile/bun.lock",
  "apps/quasar/bun.lock",
  "apps/website-app/bun.lock",
];

// Only the root manifest may declare workspaces; Bun ignores nested ones and
// their presence would suggest an install boundary that no longer exists.
export const nestedManifests = requiredPaths.filter(
  (path) => path.endsWith("package.json") && path !== "package.json",
);

export function checkTopology(root: string): string[] {
  const problems: string[] = [];
  for (const path of requiredPaths) {
    if (!existsSync(join(root, path))) problems.push(`missing: ${path}`);
  }
  for (const path of forbiddenPaths) {
    if (existsSync(join(root, path))) problems.push(`forbidden app lockfile: ${path}`);
  }
  for (const path of nestedManifests) {
    const file = join(root, path);
    if (!existsSync(file)) continue;
    const manifest = JSON.parse(readFileSync(file, "utf8")) as Record<string, unknown>;
    if ("workspaces" in manifest) problems.push(`nested workspaces field: ${path}`);
  }
  const bunfig = join(root, "bunfig.toml");
  if (existsSync(bunfig) && !/^\s*linker\s*=\s*"isolated"\s*$/m.test(readFileSync(bunfig, "utf8"))) {
    problems.push('bunfig.toml must set linker = "isolated"');
  }
  return problems;
}

if (import.meta.main) {
  const problems = checkTopology(join(import.meta.dir, "../../.."));
  if (problems.length) {
    console.error(`MLAI topology problems:\n${problems.join("\n")}`);
    process.exit(1);
  }
  console.log(
    `MLAI topology OK (${requiredPaths.length} required paths, ${forbiddenPaths.length} forbidden lockfiles)`,
  );
}
