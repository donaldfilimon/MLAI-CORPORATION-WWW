import { describe, expect, it } from "vitest";

import { advance } from "@mlai/trailer-engine";

// The playhead arithmetic the rAF loop runs each frame. Extracted from the
// React effect precisely so these boundary cases are reachable in Node.
describe("advance", () => {
  const DUR = 48;

  it("advances by dt in the ordinary case", () => {
    const r = advance(10, 1 / 60, DUR, true);
    expect(r.time).toBeCloseTo(10 + 1 / 60, 6);
    expect(r.ended).toBe(false);
  });

  it("does not report ended before the last frame", () => {
    expect(advance(DUR - 0.001, 0, DUR, false).ended).toBe(false);
  });

  it("clamps a non-looping timeline to exactly duration and reports ended", () => {
    // Overshoot: the final frame must land ON the end, not past it, or the
    // last beat renders at a time no scene covers.
    const r = advance(DUR - 0.01, 5, DUR, false);
    expect(r.time).toBe(DUR);
    expect(r.ended).toBe(true);
  });

  it("treats landing exactly on duration as ended, not as a playable frame", () => {
    const r = advance(DUR - 1, 1, DUR, false);
    expect(r.time).toBe(DUR);
    expect(r.ended).toBe(true);
  });

  it("wraps a looping timeline and keeps the overshoot", () => {
    // Snapping to 0 instead would silently drop up to one frame of time every
    // lap, so a long autoplay loop would drift against the audio.
    const r = advance(DUR - 0.01, 0.03, DUR, true);
    expect(r.time).toBeCloseTo(0.02, 6);
    expect(r.ended).toBe(false);
  });

  it("never reports ended while looping", () => {
    expect(advance(DUR, 10, DUR, true).ended).toBe(false);
  });
});
