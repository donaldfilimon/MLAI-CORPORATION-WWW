import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

// The one Next app, the Quasar URL sidecar, and the shared packages install
// through the root Bun workspace (root bun.lock plus the isolated linker).
// These paths must exist for that layout.
export const requiredPaths = [
  "AGENTS.md",
  "CLAUDE.md",
  "README.md",
  "package.json",
  "bun.lock",
  "bunfig.toml",
  "apps/mlai/package.json",
  "apps/mlai/capacitor.config.json",
  "apps/mlai/research/public/research-manifest.json",
  "apps/quasar/package.json",
  "apps/quasar/packages/shared/package.json",
  "apps/quasar/packages/service/package.json",
  "sidecars/python-worker/pyproject.toml",
  "sidecars/python-worker/uv.lock",
  "packages/store/package.json",
  "packages/capacitor-cloudkit/package.json",
  "packages/contracts/package.json",
  "packages/design-tokens/package.json",
  "packages/trailer-engine/package.json",
];

// A second lockfile would silently resolve a different tree from the root one.
// (apps/quasar/templates/next-site stays outside the workspace and keeps its own.)
export const forbiddenPaths = ["apps/mlai/bun.lock", "apps/quasar/bun.lock"];

// Only the root manifest may declare workspaces; Bun ignores nested ones and
// their presence would suggest an install boundary that no longer exists.
export const nestedManifests = requiredPaths.filter(
  (path) => path.endsWith("package.json") && path !== "package.json",
);

// Directories whose agent guides must name one canonical file. The list is
// explicit (never an apps/* glob, which would also walk leftover build trees).
export const guideDirs = [".", "apps/mlai", "apps/quasar"];
const guideFiles = ["AGENTS.md", "CLAUDE.md"] as const;
const guideHeadLines = 15;

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * When a directory carries both guides, exactly one must declare itself
 * canonical within its first lines and the other must name it as canonical
 * ("`AGENTS.md` is canonical ..."). A directory with one guide or none passes
 * (apps/quasar keeps only README.md by design): this check never asks for a new
 * instruction file.
 */
export function checkGuides(root: string, dir: string): string[] {
  const present = guideFiles.filter((name) => existsSync(join(root, dir, name)));
  if (present.length < 2) return [];
  const head = (name: string) =>
    readFileSync(join(root, dir, name), "utf8").split("\n").slice(0, guideHeadLines).join("\n");
  const names = (other: string) => new RegExp(`\`?${escapeRegExp(other)}\`? is (?:the )?canonical`, "i");
  const [a, b] = guideFiles;
  const heads = { [a]: head(a), [b]: head(b) };
  const points = { [a]: names(b).test(heads[a]), [b]: names(a).test(heads[b]) };
  const claims = guideFiles.filter((name) => /\bcanonical\b/i.test(heads[name]) && !points[name]);
  const canonical = claims.length === 1 ? claims[0] : undefined;
  const pointer = canonical === a ? b : a;
  if (canonical && points[pointer]) return [];
  return [
    `guides: ${dir} needs exactly one canonical guide (${claims.length ? claims.join(", ") : "none"} claim it) ` +
      `and the other naming it ("\`AGENTS.md\` is canonical") in its first ${guideHeadLines} lines`,
  ];
}

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
  for (const dir of guideDirs) problems.push(...checkGuides(root, dir));
  return problems;
}

if (import.meta.main) {
  const problems = checkTopology(join(import.meta.dir, "../../.."));
  if (problems.length) {
    console.error(`MLAI topology problems:\n${problems.join("\n")}`);
    process.exit(1);
  }
  console.log(
    `MLAI topology OK (${requiredPaths.length} required paths, ${forbiddenPaths.length} forbidden lockfiles, ${guideDirs.length} guide dirs)`,
  );
}
