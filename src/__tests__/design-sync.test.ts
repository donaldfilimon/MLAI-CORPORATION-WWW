import { describe, expect, it } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

/**
 * design-sync integrity guards.
 *
 * `.design-sync/config.json` describes this repo's de-facto design system
 * (the shadcn-style primitives in `src/components/ui/`) to an external
 * converter. Because that converter lives outside the repo, nothing here
 * fails when the config silently rots — a renamed or deleted component would
 * only surface as a broken sync run much later. These tests pin the config
 * against the real filesystem, and catch the class of bug found during the
 * MLAI sync: a semantic color utility referenced by components whose token
 * was never defined, so Tailwind emitted no rule and the style silently
 * did nothing.
 */

const ROOT = resolve(__dirname, "../..");
const cfg = JSON.parse(readFileSync(resolve(ROOT, ".design-sync/config.json"), "utf8")) as {
  entry: string;
  cssEntry: string;
  componentSrcMap: Record<string, string>;
};
const indexCss = readFileSync(resolve(ROOT, "src/index.css"), "utf8");
const uiDir = resolve(ROOT, "src/components/ui");

describe("design-sync config", () => {
  it("every mapped component source file exists", () => {
    for (const [name, path] of Object.entries(cfg.componentSrcMap)) {
      expect(existsSync(resolve(ROOT, path)), `${name} → ${path}`).toBe(true);
    }
  });

  it("the bundle entry exists and re-exports every mapped component's module", () => {
    const entryPath = resolve(ROOT, cfg.entry);
    expect(existsSync(entryPath)).toBe(true);
    const barrel = readFileSync(entryPath, "utf8");
    for (const path of Object.values(cfg.componentSrcMap)) {
      const mod = path.split("/").pop()!.replace(/\.tsx?$/, "");
      expect(barrel, `barrel must export ./${mod}`).toContain(`./${mod}`);
    }
  });
});

describe("design-system tokens", () => {
  // Every `text-<x>-foreground` / `bg-<x>` semantic utility used by the
  // primitives must resolve to a token defined in :root AND re-exposed to
  // Tailwind through the `@theme inline` block — CLAUDE.md's "update both"
  // rule. A missing definition is silent: Tailwind emits nothing.
  const SEMANTIC = [
    "background",
    "foreground",
    "card",
    "card-foreground",
    "popover",
    "popover-foreground",
    "primary",
    "primary-foreground",
    "secondary",
    "secondary-foreground",
    "muted",
    "muted-foreground",
    "accent",
    "accent-foreground",
    "destructive",
    "destructive-foreground",
    "border",
    "input",
    "ring",
  ];

  it.each(SEMANTIC)("--%s is defined in :root", (token) => {
    expect(indexCss).toMatch(new RegExp(`^\\s*--${token}:`, "m"));
  });

  it.each(SEMANTIC)("--color-%s is re-exposed via @theme inline", (token) => {
    expect(indexCss).toMatch(new RegExp(`--color-${token}:\\s*var\\(--${token}\\)`));
  });

  it("no primitive references a semantic color utility with no backing token", () => {
    const used = new Set<string>();
    for (const file of ["badge", "toast", "button", "alert", "card", "input", "select"]) {
      const path = resolve(uiDir, `${file}.tsx`);
      if (!existsSync(path)) continue;
      const src = readFileSync(path, "utf8");
      for (const m of src.matchAll(/(?:text|bg|border|ring)-([a-z]+(?:-foreground)?)\b/g)) {
        const name = m[1]!;
        if (name.endsWith("-foreground") || SEMANTIC.includes(name)) used.add(name);
      }
    }
    const undefinedTokens = [...used].filter(
      (t) => SEMANTIC.includes(t) && !new RegExp(`^\\s*--${t}:`, "m").test(indexCss),
    );
    expect(undefinedTokens).toEqual([]);
  });
});
