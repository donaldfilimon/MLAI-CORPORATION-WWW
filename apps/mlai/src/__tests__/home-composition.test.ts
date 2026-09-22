import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * The `/` route renders `Home` from `app/client.tsx`. Hooks in that view
 * (inquiry, motion) block a full Node render, so this test reads the shipped
 * modules and the stylesheet they load.
 */
const ROOT = resolve(__dirname, "../..");
const home = readFileSync(resolve(ROOT, "src/views/Home.tsx"), "utf8");
const hero = readFileSync(resolve(ROOT, "src/components/Hero.tsx"), "utf8");
const route = readFileSync(resolve(ROOT, "app/page.tsx"), "utf8");
const css = readFileSync(resolve(ROOT, "src/index.css"), "utf8");

describe("quasar-web home composition", () => {
  it("is the view the root route renders", () => {
    expect(route).toContain("<Home />");
    expect(home).toContain("<Hero />");
  });

  it("keeps the sourced WDBX facts and the invite-only, fail-closed boundaries", () => {
    expect(home).toContain("M = 16");
    expect(home).toContain("EF_CONSTRUCTION = 40");
    expect(home).toContain("EF_SEARCH = 32");
    expect(home).toContain("An invite-only operations console. Not a public chatbot.");
    expect(home).toContain("Quesar does not return an unaudited response.");
    expect(hero).toContain("Invite-only private AI operations");
    expect(hero).toContain("Get started");
    expect(hero).toContain("Review the trust boundary");
    expect(hero).toContain('id="hero-heading"');
  });

  it("stacks the first screen under a max-width rule and stops the hero entrance when motion is reduced", () => {
    expect(css).toMatch(
      /@media\s*\(\s*max-width:\s*420px\s*\)[\s\S]*\.home-hero-grid\s*\{[\s\S]*grid-template-columns:\s*minmax\(0,\s*1fr\)/,
    );
    expect(css).toMatch(
      /@media\s*\(\s*prefers-reduced-motion:\s*reduce\s*\)[\s\S]*\.home-hero-enter[\s\S]*transform:\s*none\s*!important/,
    );
    expect(css).toMatch(/\.home-primary:focus-visible\s*\{[\s\S]*outline:\s*2px solid/);
    expect(hero).toContain("home-hero-grid");
    expect(hero).toContain("home-hero-enter");
    expect(hero).toContain("home-primary");
  });
});
