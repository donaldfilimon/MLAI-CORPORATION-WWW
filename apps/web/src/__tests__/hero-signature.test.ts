import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Hero signature (BacktracePanel) invariants.
 *
 * Each assertion below corresponds to a bug that actually shipped into a
 * build during the redesign and was only caught by screenshotting the page —
 * none of them fail a type-check, a unit test, or a link crawl, and two of
 * them are invisible to anyone developing on a desktop with motion enabled.
 * These are source-level guards (the real defect is visual/CSS), which is a
 * deliberate trade: cheap and deterministic, versus a full visual-regression
 * rig this repo doesn't have.
 */

const ROOT = resolve(__dirname, "../..");
const panel = readFileSync(resolve(ROOT, "src/components/BacktracePanel.tsx"), "utf8");
const hero = readFileSync(resolve(ROOT, "src/components/Hero.tsx"), "utf8");

describe("hero signature — BacktracePanel", () => {
  it("anchors the chain rail to the node centreline", () => {
    // Rail offset must equal container padding (px-5 = 1.25rem) + half the
    // node (w-2.5 = 0.625rem) = 1.5625rem. Any other value renders the
    // "chain" as disconnected dots — which is the entire point of the visual.
    expect(panel).toContain("left-[1.5625rem]");
    expect(panel).toContain("px-5 pb-5");
    expect(panel).toMatch(/h-2\.5 w-2\.5 rounded-full/);
  });

  it("encodes the weight in the meter's width, not only in an animation", () => {
    // Animating scaleX from 0 -> weight on a full-width bar leaves every
    // meter at 100% under prefers-reduced-motion: a 0.38 weight reads 1.00.
    // The width carries the data; motion may only fill it in.
    expect(panel).toContain("width: `${block.weight * 100}%`");
    expect(panel).not.toMatch(/animate=\{[^}]*scaleX:\s*block\.weight/);
  });

  it("degrades correctly under prefers-reduced-motion", () => {
    expect(panel).toContain("useReducedMotion");
    // Variants must be skipped (not merely shortened) when motion is reduced,
    // so the chain renders settled rather than stuck in its hidden state.
    expect(panel).toMatch(/initial=\{reduce \? false :/);
  });

  it("labels the trace as illustrative (external-claims discipline)", () => {
    expect(panel.toLowerCase()).toContain("illustrative");
    // No performance claims may appear in the hero — see the claims audit.
    expect(panel).not.toMatch(/\b\d+\s?(ms|qps|req\/s)\b/i);
  });
});

describe("hero layout", () => {
  it("gives the signature column min-w-0", () => {
    // Grid items default to min-width:auto, so the panel's unshrinkable
    // monospace (hashes, block ids) pushes the column past the viewport and
    // shifts/clips the ENTIRE hero on phones. Both hero columns need this.
    const columns = hero.match(/className="[^"]*min-w-0[^"]*"/g) ?? [];
    expect(columns.length).toBeGreaterThanOrEqual(2);
    expect(hero).toMatch(/relative mt-2 min-w-0/);
  });

  it("renders the signature on mobile, not desktop-only", () => {
    // The particle canvas this replaced was `hidden lg:block`, which hid the
    // page's most product-specific element from phone traffic.
    expect(hero).not.toMatch(/hidden[^"]*lg:block[^"]*">\s*\{\/\* Hero signature/);
    expect(hero).toContain("<BacktracePanel />");
  });
});
