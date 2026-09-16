// timeline.ts — playhead advance. Pure, zero imports, no DOM, no React.
//
// This is the arithmetic the rAF loop runs once per frame. It lives here rather
// than inside the React effect so it can be tested in Node against the boundary
// cases a browser makes awkward to reach: the exact frame the playhead lands on
// `duration`, a step that overshoots the end, and a looping wrap.

/** Outcome of advancing the playhead by one frame. */
export interface AdvanceResult {
  /** The new playhead position, in seconds. */
  time: number;
  /**
   * True only when a non-looping timeline reached its end on this step, i.e.
   * the caller should stop playback. A looping timeline never reports `ended`.
   */
  ended: boolean;
}

/**
 * Advance `time` by `dt` seconds within `[0, duration]`.
 *
 * A non-looping timeline clamps to exactly `duration` and reports `ended`, so
 * the final frame lands on the last frame rather than past it. A looping one
 * wraps with the remainder, which preserves sub-frame overshoot instead of
 * snapping to zero and dropping it.
 *
 * `dt` is expected to be pre-clamped by `frameDelta`; this function does not
 * clamp it, so passing a raw timestamp difference will skip content.
 */
export function advance(
  time: number,
  dt: number,
  duration: number,
  loop: boolean,
): AdvanceResult {
  const next = time + dt;
  if (next < duration) return { time: next, ended: false };
  if (loop) return { time: next % duration, ended: false };
  return { time: duration, ended: true };
}
