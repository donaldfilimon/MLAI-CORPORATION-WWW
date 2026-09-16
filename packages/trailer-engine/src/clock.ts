// clock.ts — playback-clock primitives. Pure, zero imports, no DOM, no React.
//
// This is the first runtime (non-type) export to cross the package boundary in
// this monorepo: @mlai/contracts is imported type-only and @mlai/design-tokens
// has no consumers, so nothing here had yet proven that apps/web's bundler will
// transpile raw TypeScript out of a `file:` workspace package. That is why the
// clock came over first and alone — it is the smallest thing that can prove it.

/**
 * Longest simulation step a single frame may advance the playhead, in seconds.
 *
 * requestAnimationFrame does not run in a backgrounded tab, but the caller's
 * last timestamp is retained, so the first frame after returning reports the
 * entire time away. The same happens after a debugger pause or a device stall.
 * The audio context suspends on its own schedule, so an unclamped step lands
 * the picture seconds ahead of the narration.
 *
 * 1/15s is about four frames at 60Hz: long enough to absorb ordinary jitter,
 * short enough that a gap cannot skip a beat.
 */
export const MAX_FRAME_DT = 1 / 15;

/** Seconds elapsed between two rAF timestamps, clamped to {@link MAX_FRAME_DT}. */
export const frameDelta = (ts: number, lastTs: number): number =>
  Math.min(Math.max(0, (ts - lastTs) / 1000), MAX_FRAME_DT);
