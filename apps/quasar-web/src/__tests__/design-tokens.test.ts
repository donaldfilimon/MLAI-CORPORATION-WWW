import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { labColor } from "@mlai/design-tokens";

// Web keeps the Lab palette in CSS (Tailwind v4 reads it there), while the
// Expo apps import the same raw hex values from @mlai/design-tokens. This test
// is what keeps the two copies from drifting apart.
const css = readFileSync(path.resolve(__dirname, "../index.css"), "utf8");

function declared(name: string): string[] {
  const pattern = new RegExp(`^\\s*${name}:\\s*(#[0-9a-fA-F]{6})\\s*;`, "gm");
  return [...css.matchAll(pattern)].map((m) => (m[1] ?? "").toUpperCase());
}

describe("Lab raw colors", () => {
  it.each([
    ["--ink", labColor.ink],
    ["--cyan", labColor.cyan],
    ["--violet", labColor.violet],
    ["--emerald", labColor.emerald],
    ["--amber", labColor.amber],
  ])("index.css %s equals @mlai/design-tokens", (token, expected) => {
    const values = declared(token);
    expect(values.length).toBeGreaterThan(0);
    for (const value of values) expect(value).toBe(expected.toUpperCase());
  });

  it("keeps the legacy @theme hex block on the same palette", () => {
    expect(declared("--color-bg")).toEqual([labColor.ink.toUpperCase()]);
    expect(declared("--color-primary")).toEqual([labColor.cyan.toUpperCase()]);
  });
});
