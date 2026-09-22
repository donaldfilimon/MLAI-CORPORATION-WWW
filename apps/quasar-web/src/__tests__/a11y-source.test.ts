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

  it("flagged small metadata text does not drop below text-dim/80", () => {
    for (const file of ["src/components/article.tsx", "src/views/Changelog.tsx", "src/components/demos/WdbxLiveDemo.tsx"]) {
      expect(read(file), file).not.toMatch(/(?<!placeholder:)text-text-dim\/[5-7]0\b/);
    }
  });
});
