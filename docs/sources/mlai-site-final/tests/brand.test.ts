import { test, expect } from "bun:test";
import * as brand from "@/lib/brand";
import { colors, products, founder, type Stat, type Accent } from "@/lib/brand";
import { accentHex } from "@/components/ui";
import tailwindConfig from "@/tailwind.config";

const PROVENANCE = ["measured", "target", "reported"] as const;
const HEX = /^#[0-9A-Fa-f]{6}$/;
const ACCENTS: Accent[] = ["wdbx", "abi", "abbey"];

// ── Palette: one source of truth, every representation in sync ───────────────
// lib/brand.ts `colors` is canonical. ui.tsx `accentHex` is derived from it and
// tailwind.config.ts must mirror it. This test fails on drift between the three.

test("all color tokens are valid #RRGGBB hex", () => {
  for (const [name, hex] of Object.entries(colors)) {
    expect(hex, `colors.${name}`).toMatch(HEX);
  }
});

test("accentHex (ui.tsx) matches the canonical brand palette", () => {
  for (const key of ACCENTS) {
    expect(accentHex[key], `accentHex.${key}`).toBe(colors[key]);
  }
});

test("tailwind theme colors mirror the brand palette", () => {
  // satisfies Config keeps this typed loosely; index in to the extend block.
  const twColors = (tailwindConfig.theme?.extend?.colors ?? {}) as Record<string, string>;
  for (const key of [...ACCENTS, "ink", "panel"] as const) {
    expect(twColors[key], `tailwind color ${key}`).toBe(colors[key]);
  }
});

// ── Products: each accent present and valid ──────────────────────────────────

test("products map has wdbx/abi/abbey each with a valid accent", () => {
  for (const key of ACCENTS) {
    const product = products[key];
    expect(product, `products.${key}`).toBeDefined();
    expect(ACCENTS, `products.${key}.accent`).toContain(product.accent);
  }
});

// ── Provenance contract: EVERY stat anywhere in brand.ts is tagged ───────────
// A Stat is identified structurally (value + label + tag), so publication tags
// like "Core Architecture" are correctly excluded and any new stat added
// anywhere in the brand data is covered automatically — no test edit required.

function collectStats(node: unknown, acc: Stat[] = []): Stat[] {
  if (Array.isArray(node)) {
    for (const item of node) collectStats(item, acc);
  } else if (node && typeof node === "object") {
    const obj = node as Record<string, unknown>;
    if ("value" in obj && "label" in obj && "tag" in obj) {
      acc.push(obj as unknown as Stat);
    }
    for (const value of Object.values(obj)) collectStats(value, acc);
  }
  return acc;
}

const allStats = collectStats(brand);

test("brand data exposes the expected stat surface", () => {
  // Guards against a future edit silently dropping the stat coverage this
  // contract depends on (33 value+label+tag stats at time of writing;
  // scaleBench.tag is a table-caption provenance, intentionally not a Stat).
  expect(allStats.length).toBeGreaterThanOrEqual(33);
});

test("every Stat carries a known provenance tag", () => {
  for (const stat of allStats) {
    expect(PROVENANCE, `stat "${stat.label}" tag`).toContain(stat.tag);
  }
});

test("every Stat has a non-empty value and label", () => {
  for (const stat of allStats) {
    expect(stat.value.length, `stat value for "${stat.label}"`).toBeGreaterThan(0);
    expect(stat.label.length, "stat label").toBeGreaterThan(0);
  }
});

// ── Content integrity: founder-led framing, deliberate Apple wording ─────────

test("Apple framing stays integrity-gated (no partnership/endorsement claims)", () => {
  expect(brand.company.appleFraming).toContain("public frameworks");
  expect(brand.company.appleFraming).not.toMatch(
    /\b(partner|partnership|official|endorsed|sponsored|certified)\b/i
  );
});

test("founder identity is the single named leader", () => {
  expect(founder.name).toBe("Donald Filimon");
});
