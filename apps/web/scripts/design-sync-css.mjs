/**
 * design-sync CSS compile step — produces `.design-sync/lab-compiled.css`,
 * the `cssEntry` that `.design-sync/config.json` points at.
 *
 * Why this exists: the design system's styling is **Tailwind v4 utilities**,
 * not CSS-in-JS, and the app ships no standalone stylesheet — so the design
 * converter reports `[CSS_RUNTIME]` (no styles) unless we hand it a compiled
 * one. This runs the repo's own `@tailwindcss/postcss` over `src/index.css`,
 * producing the real "Lab" OKLCH token set plus every utility the components
 * actually use.
 *
 * `.design-sync/NOTES.md` documented this step but the script lived only in
 * the external converter checkout (`.ds-sync/compile-css.mjs`), so the
 * artifact could not be regenerated from a fresh clone. It's committed here
 * instead: the output is a build artifact (gitignored), the recipe is source.
 *
 * Run: bun run design-sync:css
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import postcss from "postcss";
import tailwind from "@tailwindcss/postcss";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const input = resolve(root, "src/index.css");
const output = resolve(root, ".design-sync/lab-compiled.css");

const css = readFileSync(input, "utf8");

const result = await postcss([tailwind()]).process(css, { from: input, to: output });

mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, result.css);

const kb = (result.css.length / 1024).toFixed(0);
console.log(`Wrote .design-sync/lab-compiled.css (${kb} KB) from src/index.css`);

// Sanity-check the two things the converter actually depends on: the Lab
// OKLCH token set, and that real utilities were emitted (not just tokens).
const hasTokens = /--background:\s*oklch\(/.test(result.css);
const hasUtilities = /\.bg-primary\b/.test(result.css);
if (!hasTokens || !hasUtilities) {
  console.error(
    `design-sync: compiled CSS looks wrong (tokens=${hasTokens}, utilities=${hasUtilities}).`,
  );
  process.exit(1);
}
console.log("design-sync: OKLCH tokens + utilities present.");
