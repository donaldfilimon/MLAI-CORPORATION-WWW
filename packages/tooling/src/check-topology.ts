import { existsSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dir, "../../..");
const required = [
  "AGENTS.md",
  "CLAUDE.md",
  "README.md",
  "apps/web/package.json",
  "apps/mobile/package.json",
  "apps/quasar/package.json",
  "packages/contracts/package.json",
  "packages/design-tokens/package.json",
];

const missing = required.filter((path) => !existsSync(join(root, path)));
if (missing.length) {
  console.error(`Missing MLAI topology entries:\n${missing.join("\n")}`);
  process.exit(1);
}

console.log(`MLAI topology OK (${required.length} required paths)`);
