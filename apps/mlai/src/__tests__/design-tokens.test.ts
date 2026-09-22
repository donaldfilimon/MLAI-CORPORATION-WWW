import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { labColor, semantic } from "@mlai/design-tokens";
import { renderWebTokensCss } from "@mlai/design-tokens/generate";

// The web token sheet is generated from @mlai/design-tokens, the same package
// the Expo apps import at runtime. These tests keep the committed sheet equal
// to the generator's output, keep index.css free of token declarations of its
// own, and pin the effective values (the previous hand-written sheet declared
// --color-primary twice and the test only saw the shadowed copy).
const generated = readFileSync(path.resolve(__dirname, "../tokens.generated.css"), "utf8");
const index = readFileSync(path.resolve(__dirname, "../index.css"), "utf8");

function declarations(css: string): Map<string, string[]> {
  const out = new Map<string, string[]>();
  for (const m of css.matchAll(/^\s*(--[a-z0-9-]+):\s*([^;]+);/gm)) {
    const name = m[1] ?? "";
    out.set(name, [...(out.get(name) ?? []), (m[2] ?? "").trim()]);
  }
  return out;
}

const decl = declarations(generated);

describe("web token sheet", () => {
  it("is the generator's output (run `bun run tokens:generate` after editing the model)", () => {
    expect(generated).toBe(renderWebTokensCss());
  });

  it("is imported by index.css, which declares no token of its own", () => {
    expect(index).toContain('@import "./tokens.generated.css";');
    for (const name of ["--ink", "--cyan", "--primary", "--color-primary", "--color-border", "--radius"]) {
      expect(declarations(index).has(name), `${name} declared in index.css`).toBe(false);
    }
  });

  it("declares every custom property exactly once", () => {
    const duplicates = [...decl.entries()].filter(([, v]) => v.length > 1).map(([k]) => k);
    expect(duplicates).toEqual([]);
  });

  it.each([
    ["--ink", labColor.ink],
    ["--cyan", labColor.cyan],
    ["--violet", labColor.violet],
    ["--emerald", labColor.emerald],
    ["--amber", labColor.amber],
  ])("%s equals @mlai/design-tokens", (token, expected) => {
    expect(decl.get(token)).toEqual([expected.toLowerCase()]);
  });

  it("renders primary, ring and chart-1 from the cyan token, not an OKLCH approximation", () => {
    for (const name of ["--primary", "--ring", "--chart-1", "--sidebar-primary"]) {
      expect(decl.get(name), name).toEqual(["var(--cyan)"]);
      expect(semantic[name.slice(2) as keyof typeof semantic]).toBe("var(--cyan)");
    }
    expect(decl.get("--color-primary")).toEqual(["var(--primary)"]);
    expect(decl.get("--color-bg")).toEqual([labColor.ink.toLowerCase()]);
  });
});
