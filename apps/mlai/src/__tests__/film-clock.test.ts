import { describe, expect, it } from "vitest";

import { MAX_FRAME_DT, frameDelta } from "@mlai/trailer-engine";
import * as filmEasing from "@/film/easing";

// The film clock advances the playhead by the gap between two rAF timestamps.
// rAF does not run in a backgrounded tab, but the last timestamp is retained,
// so the first frame after returning reports the entire time away. The audio
// context suspends on its own schedule, so an unclamped step lands the picture
// seconds ahead of the narration. frameDelta is the guard.
describe("frameDelta", () => {
  it("converts an ordinary frame gap to seconds", () => {
    // ~60Hz
    expect(frameDelta(1016.7, 1000)).toBeCloseTo(0.0167, 4);
    // ~120Hz
    expect(frameDelta(1008.3, 1000)).toBeCloseTo(0.0083, 4);
  });

  it("clamps a backgrounded-tab gap instead of jumping the playhead", () => {
    // Two minutes away. Unclamped this would advance the timeline by 120s,
    // running the whole trailer out while the tab was hidden.
    expect(frameDelta(121_000, 1_000)).toBe(MAX_FRAME_DT);
  });

  it("clamps at the boundary but not below it", () => {
    const ms = MAX_FRAME_DT * 1000;
    expect(frameDelta(1000 + ms, 1000)).toBe(MAX_FRAME_DT);
    expect(frameDelta(1000 + ms - 1, 1000)).toBeLessThan(MAX_FRAME_DT);
  });

  it("never returns a negative step if timestamps arrive out of order", () => {
    // A non-monotonic timestamp would otherwise run the playhead backwards.
    expect(frameDelta(900, 1000)).toBe(0);
  });

  it("keeps the clamp short enough to be imperceptible as a single hitch", () => {
    expect(MAX_FRAME_DT).toBeLessThanOrEqual(0.1);
  });
});

// film/easing.ts re-exports the clock so the ~20 existing `./easing` importers
// keep working after the move. If the re-export is dropped, this fails rather
// than the breakage surfacing at runtime in a scene.
describe("film/easing re-export", () => {
  it("still exposes the same clock primitives", () => {
    expect(filmEasing.frameDelta).toBe(frameDelta);
    expect(filmEasing.MAX_FRAME_DT).toBe(MAX_FRAME_DT);
  });
});
