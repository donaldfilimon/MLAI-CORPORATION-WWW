import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * WCAG 2.2 SC 1.4.10 (Reflow) source-level guards.
 *
 * A CSS grid with no explicit column template gets an implicit `auto` track,
 * which grows to its widest child's min-content. A single unbreakable KaTeX
 * equation therefore widened the whole `/products/abi` band to 463px inside a
 * 320px viewport (measured in Chromium against a production build,
 * 2026-09-17). `grid-cols-1` is `minmax(0, 1fr)`, which lets the equation
 * scroll inside its own `BlockMath` container instead. The class looks
 * redundant on a one-column grid, which is why it is pinned here.
 */

const ROOT = resolve(__dirname, "../..");
const read = (p: string) => readFileSync(resolve(ROOT, p), "utf8");

describe("reflow — single-column grids use minmax(0, 1fr)", () => {
  it("SplitSection's stacked grid is an explicit grid-cols-1", () => {
    expect(read("src/components/site/Section.tsx")).toContain(
      "container-custom grid grid-cols-1 gap-10 lg:grid-cols-",
    );
  });

  it("the product equation and pillar grids are explicit grid-cols-1", () => {
    const product = read("src/views/Product.tsx");
    expect(product).toContain("grid grid-cols-1 gap-5 text-foreground md:grid-cols-2");
    // Pillars can carry a KaTeX loss function (the ABI persona cards).
    expect(product).toContain('"grid grid-cols-1 gap-5",');
    expect(product).not.toMatch(/"grid gap-5"/);
  });

  it("BlockMath scrolls wide equations within its own box", () => {
    const math = read("src/components/Math.tsx");
    expect(math.match(/overflow-x-auto/g)?.length).toBeGreaterThanOrEqual(2);
  });
});
