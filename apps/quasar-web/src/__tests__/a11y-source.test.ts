import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Source guards for fixes from the 2026-09-17 axe-core audit (WCAG 2.2 A/AA,
 * Chromium, local `next dev`). Each one is easy to undo silently: the markup
 * still renders and no Node test would notice.
 */

const ROOT = resolve(__dirname, "../..");
const read = (p: string) => readFileSync(resolve(ROOT, p), "utf8");

describe("a11y source guards", () => {
  it("only app/providers.tsx declares the main landmark", () => {
    // providers.tsx wraps every route in <main id="main-content">; a second
    // <main> or role="main" inside a view nests landmarks.
    for (const file of [
      "src/views/Console.tsx",
      "src/views/Docs.tsx",
      "src/views/DocPage.tsx",
      "src/views/FounderProfile.tsx",
      "src/views/ProjectPage.tsx",
      "src/views/NotFound.tsx",
      "src/components/article.tsx",
    ]) {
      const src = read(file);
      expect(src, file).not.toMatch(/<main[\s>]/);
      expect(src, file).not.toContain('role="main"');
    }
  });

  it("the Navbar sign-in control is one focusable element, not a button inside a link", () => {
    expect(read("src/components/Navbar.tsx")).not.toMatch(/<Link to="\/login"[^>]*>\s*<Button/);
  });

  it("every range input in the demos has an accessible name", () => {
    for (const file of ["src/components/demos/CosineSimDemo.tsx", "src/components/demos/ShardingLatencyDemo.tsx"]) {
      const inputs = read(file).match(/<input[\s\S]*?\/>/g) ?? [];
      expect(inputs.length, file).toBeGreaterThan(0);
      for (const input of inputs) expect(input, file).toMatch(/\b(id=|aria-label=|aria-labelledby=)/);
    }
  });

  it("scrollable BlockMath boxes are keyboard-focusable", () => {
    expect(read("src/components/Math.tsx").match(/tabIndex=\{0\}/g)?.length).toBe(2);
  });

  it("flagged small metadata text does not drop below text-dim/80", () => {
    for (const file of ["src/components/article.tsx", "src/views/Changelog.tsx", "src/components/demos/WdbxLiveDemo.tsx"]) {
      expect(read(file), file).not.toMatch(/(?<!placeholder:)text-text-dim\/[5-7]0\b/);
    }
  });
});
