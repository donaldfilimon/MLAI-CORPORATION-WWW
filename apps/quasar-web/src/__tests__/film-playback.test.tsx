import { afterEach, describe, expect, it, vi } from "vitest";
import { REDUCED_MOTION_QUERY, prefersReducedMotion } from "../film/engine";

/**
 * The Stage clock in `src/film/engine.tsx` holds its playhead while the OS asks
 * for reduced motion. The gate is `prefersReducedMotion`, which takes the
 * matchMedia function as a parameter precisely so this can be pinned in the
 * Node-only Vitest environment (no jsdom, no component rendering — see
 * AGENTS.md "Commands And Gates"). Rendering `<Stage>` itself would need a DOM,
 * ResizeObserver and requestAnimationFrame, none of which exist here.
 */

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("prefersReducedMotion", () => {
  it("asks for the standard reduced-motion media query", () => {
    const matchMedia = vi.fn().mockReturnValue({ matches: false });
    prefersReducedMotion(matchMedia);
    expect(matchMedia).toHaveBeenCalledTimes(1);
    expect(matchMedia).toHaveBeenCalledWith(REDUCED_MOTION_QUERY);
    expect(REDUCED_MOTION_QUERY).toBe("(prefers-reduced-motion: reduce)");
  });

  it("holds the clock when the query matches", () => {
    expect(prefersReducedMotion(() => ({ matches: true }))).toBe(true);
  });

  it("lets the clock run when the query does not match", () => {
    expect(prefersReducedMotion(() => ({ matches: false }))).toBe(false);
  });

  it("treats a non-boolean `matches` as not reduced rather than truthy", () => {
    // A broken polyfill returning e.g. a string must not freeze the film.
    expect(prefersReducedMotion(() => ({ matches: "yes" as unknown as boolean }))).toBe(false);
  });

  it("answers false with no DOM (server render, Node tests)", () => {
    expect(typeof window).toBe("undefined");
    expect(prefersReducedMotion()).toBe(false);
  });

  it("answers false when the browser has no matchMedia", () => {
    vi.stubGlobal("window", {});
    expect(prefersReducedMotion()).toBe(false);
  });

  it("reads window.matchMedia by default when present", () => {
    const matchMedia = vi.fn().mockReturnValue({ matches: true });
    vi.stubGlobal("window", { matchMedia });
    expect(prefersReducedMotion()).toBe(true);
    expect(matchMedia).toHaveBeenCalledWith(REDUCED_MOTION_QUERY);
  });

  it("fails open (clock runs) when matchMedia throws", () => {
    expect(
      prefersReducedMotion(() => {
        throw new Error("unsupported");
      }),
    ).toBe(false);
  });
});
