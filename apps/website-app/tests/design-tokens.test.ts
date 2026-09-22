import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { labColor } from "@mlai/design-tokens";
import {
  renderWebsiteAppTokensCss,
  renderWebsiteAppTokensTs,
} from "@mlai/design-tokens/generate";

// packages/ui's token sheet and its TypeScript twin are rendered from
// @mlai/design-tokens, so this app shares one palette with the website and the
// Expo apps. A hand edit here fails until the model changes instead.
const css = readFileSync(resolve("packages/ui/src/styles/tokens.css"), "utf8");
const ts = readFileSync(resolve("packages/ui/src/tokens.ts"), "utf8");

describe("design tokens", () => {
  it("tokens.css is the generator's output (run `bun run tokens:generate`)", () => {
    expect(css).toBe(renderWebsiteAppTokensCss());
  });

  it("tokens.ts is the generator's output", () => {
    expect(ts).toBe(renderWebsiteAppTokensTs());
  });

  it("keeps this app's aliases pointing at the canonical Lab names", () => {
    expect(css).toMatch(/^\s*--bg: var\(--ink\);/m);
    expect(css).toMatch(/^\s*--purple: var\(--violet\);/m);
    expect(css).toMatch(/^\s*--green: var\(--emerald\);/m);
    expect(css).toMatch(/^\s*--warn: var\(--amber\);/m);
    expect(css).toMatch(
      new RegExp(`^\\s*--cyan: ${labColor.cyan.toLowerCase()};`, "m"),
    );
  });

  it("keeps every layout name the app's stylesheet consumes", () => {
    for (const name of [
      "--space-1",
      "--space-12",
      "--size-display-lg",
      "--radius-pill",
      "--text-body",
      "--leading-display",
    ]) {
      expect(css, name).toContain(`${name}:`);
    }
  });
});
