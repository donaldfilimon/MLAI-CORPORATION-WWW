import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
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

  it("the voice toggle keeps its real size: it portals to the Stage's unscaled root and exposes its state", () => {
    // Inside the scaled picture the toggle measured 22×7 px at a 320 px viewport
    // (2026-09-17 acceptance). The Stage publishes its unscaled root as `chrome`
    // on the timeline context and the toggle renders there through a portal.
    const engine = read("src/film/engine.tsx");
    expect(engine).toMatch(/chrome: HTMLElement \| null;/);
    expect(engine).toMatch(/setChrome\(el\)/);
    const narration = read("src/film/narration.tsx");
    expect(narration).toContain('import { createPortal } from "react-dom";');
    expect(narration).toMatch(/return chrome \? createPortal\(button, chrome\) : button;/);
    expect(narration).toMatch(/<button type="button" onClick=\{toggle\}[^>]*aria-pressed=\{on\}/);
  });

  it("the scrubber seeks through resolveSeek, so End holds at the last frame", () => {
    const engine = read("src/film/engine.tsx");
    expect(engine).toMatch(/onSeek=\{seekTo\}/);
    expect(engine).toMatch(/if \(r\.atEnd\) setPlaying\(false\);/);
    expect(engine).not.toMatch(/onSeek=\{\(t\) => setTime\(t\)\}/);
  });

  it("the PREPARING VOICE pulse honors prefers-reduced-motion", () => {
    expect(read("src/film/engine.tsx")).toMatch(
      /@media \(prefers-reduced-motion: reduce\)\{\.mlai-voice-pulse\{animation:none/,
    );
  });

  it("design-lab toggle buttons expose aria-pressed", () => {
    // The board switcher, the before/after segmented control and the token tabs
    // all style an active state that assistive tech could not otherwise read.
    expect(read("src/design/DesignHub.tsx")).toMatch(/aria-pressed=\{active\}/);
    expect(read("src/design/board/core.tsx")).toMatch(/aria-pressed=\{selected\}/);
    expect(read("src/design/board/depth.tsx")).toMatch(/aria-pressed=\{tab === t\}/);
  });

  it("the Terms link inside the login/signup footer sentence is not distinguished by color alone", () => {
    // axe link-in-text-block on /login and /signup (both render Login): a link
    // inside running text needs a non-color cue, so it is underlined.
    const login = read("src/views/Login.tsx");
    const terms = login.match(/<Link to="\/terms"[^>]*>/)?.[0];
    expect(terms).toBeDefined();
    expect(terms).toMatch(/\bunderline\b/);
  });

  it("heading levels rise by one: footer columns and first-band cards are h2, not h4/h3 under an h1", () => {
    // axe heading-order, 2026-09-22 audit of 40 routes on next dev: 35 failed,
    // every one through the footer's <h4> columns, and six more through a card
    // band that followed the page <h1> with no <h2> between.
    expect(read("src/components/Footer.tsx")).not.toMatch(/<h4[\s>]/);
    const card = read("src/components/site/FeatureCard.tsx");
    expect(card).toMatch(/headingLevel\?: "h2" \| "h3";/);
    expect(card).toMatch(/headingLevel = "h3"/);
    for (const file of ["src/views/About.tsx", "src/views/Blog.tsx", "src/views/Docs.tsx"]) {
      expect(read(file), file).toMatch(/headingLevel="h2"/);
    }
    for (const file of ["src/views/Services.tsx", "src/views/Team.tsx", "src/views/Projects.tsx"]) {
      expect(read(file), file).not.toMatch(/<h3[\s>]/);
    }
  });

  it("site KaTeX emits MathML for screen readers, with the stylesheet that hides it visually", () => {
    const math = read("src/components/Math.tsx");
    expect(math).toContain('output: "htmlAndMathml"');
    expect(math).not.toContain('output: "html",');
    expect(read("app/layout.tsx")).toContain('import "katex/dist/katex.min.css";');
  });

  it("reduced motion never leaves server-rendered hidden content un-animated", () => {
    // 2026-09-22: Hero's lower block and BacktracePanel rendered `initial="hidden"`
    // (opacity 0) on the server, then set `animate` to undefined when
    // useReducedMotion() was true on the client, so they stayed invisible for
    // every reduced-motion visitor. MotionConfig reducedMotion="user" in
    // app/providers.tsx already makes transforms instant; always animate.
    // The same shape hid Reveal (every page using it), Product, Services and
    // Showcase: a bare `{ initial: false }` branch with no `animate` target.
    // PageHeader's branch is the pattern: initial false, animate to the visible
    // state, duration 0.
    const files = ["src", "app"].flatMap((dir) =>
      readdirSync(resolve(ROOT, dir), { recursive: true, encoding: "utf8" })
        .filter((p) => p.endsWith(".tsx") && !p.includes("__tests__"))
        .map((p) => `${dir}/${p}`),
    );
    for (const file of files) {
      const src = read(file);
      expect(src, file).not.toMatch(/animate=\{\s*\w+\s*\?\s*undefined/);
      expect(src, file).not.toMatch(/variants=\{\s*\w+\s*\?\s*undefined/);
      expect(src, file).not.toMatch(/\{\s*initial:\s*false(\s+as\s+const)?\s*\}/);
    }
    expect(read("src/components/Reveal.tsx")).toMatch(/initial: false, animate: \{ opacity: 1, y: 0 \}/);
    expect(read("app/providers.tsx")).toContain('<MotionConfig reducedMotion="user">');
  });

  it("small metadata text does not drop below text-dim/80 anywhere in the app", () => {
    // Pixel-sampled contrast audit, 2026-09-22 (39 routes x 1280/375, next dev):
    // text-dim at /50 measured 2.68:1, /60 3.39:1 and /70 4.26:1 on the site's
    // darkest surfaces, all under the 4.5:1 floor for small text; /80 is >= 5.02:1.
    // Exempt: placeholder text (kept by the earlier audit) and non-text icons.
    const files = ["src", "app"].flatMap((dir) =>
      readdirSync(resolve(ROOT, dir), { recursive: true, encoding: "utf8" })
        .filter((p) => p.endsWith(".tsx") && !p.includes("__tests__"))
        .map((p) => `${dir}/${p}`),
    );
    expect(files.length).toBeGreaterThan(50);
    const offenders: string[] = [];
    for (const file of files) {
      read(file)
        .split("\n")
        .forEach((line, i) => {
          if (/<ArrowUpRight/.test(line)) return;
          if (/(?<!placeholder:)text-text-dim\/[1-7]\d\b/.test(line)) offenders.push(`${file}:${i + 1}`);
        });
    }
    expect(offenders).toEqual([]);
  });
});
