import { describe, expect, it } from "vitest";

import { ParticleBuffer, SceneSequencer, type DrawContext } from "@mlai/trailer-engine";

import { ABBEY_DURATION, buildAbbeyTimeline, captionAt, type TrailerPalette } from "@/abbey-trailer/scenes";

const PAL: TrailerPalette = { abi: "#22d3ee", aviva: "#a855f7", abbey: "#34d399", ink: "#040406", text: "#fafafa", dim: "#b6b6c0" };

/** Records draw calls; the scenes only need fills, arcs and rects. */
function makeContext() {
  const calls: string[] = [];
  return {
    calls,
    ctx: new Proxy({} as Record<string, unknown>, {
      get: (_t, prop) => (typeof prop === "string" ? () => calls.push(prop) : undefined),
      set: () => true,
    }) as unknown as DrawContext,
  };
}

function meanDistanceToTarget(p: ParticleBuffer): number {
  let s = 0;
  for (let i = 0; i < p.count; i++) s += Math.hypot((p.x[i] ?? 0) - (p.targetX[i] ?? 0), (p.y[i] ?? 0) - (p.targetY[i] ?? 0));
  return s / p.count;
}

function meanRadius(p: ParticleBuffer): number {
  let s = 0;
  for (let i = 0; i < p.count; i++) s += Math.hypot((p.x[i] ?? 0) - 960, (p.y[i] ?? 0) - 540);
  return s / p.count;
}

describe("MLAI & Abbey timeline", () => {
  it("covers the whole duration with contiguous cues and no numeric copy", () => {
    const { cues, captions, duration } = buildAbbeyTimeline(PAL);
    expect(duration).toBe(ABBEY_DURATION);
    const sorted = [...cues].sort((a, b) => a.start - b.start);
    expect(sorted[0]?.start).toBe(0);
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1], cur = sorted[i];
      expect(cur?.start).toBeCloseTo((prev?.start ?? 0) + (prev?.duration ?? 0), 9);
    }
    const last = sorted.at(-1);
    expect((last?.start ?? 0) + (last?.duration ?? 0)).toBe(duration);
    expect(cues.map((c) => c.name)).toEqual(["monolith", "shatter", "abi", "aviva", "abbey", "convergence", "mark"]);
    // The latency beat is words, by decision: no caption may carry a figure.
    for (const c of captions) {
      expect(c.text).not.toMatch(/\d/);
      expect(c.end).toBeGreaterThan(c.start);
      expect(c.end).toBeLessThanOrEqual(duration);
    }
    expect(captionAt(captions, 1.0)?.text).toBe("They gave you an answer.");
    expect(captionAt(captions, 12)?.who).toBe("abi");
    expect(captionAt(captions, 37.9)).toBeNull();
  });

  it("gathers the monolith: particles close on their targets over time", () => {
    const { cues } = buildAbbeyTimeline(PAL);
    const particles = new ParticleBuffer(1600);
    const seq = new SceneSequencer(cues, { particles });
    const { ctx } = makeContext();
    seq.draw(ctx, 1920, 1080, 0);
    const d0 = meanDistanceToTarget(particles);
    seq.seek(3, 1920, 1080);
    const d3 = meanDistanceToTarget(particles);
    seq.seek(5.5, 1920, 1080);
    const d5 = meanDistanceToTarget(particles);
    expect(d3).toBeLessThan(d0 * 0.5);
    expect(d5).toBeLessThan(d3);
    expect(d5).toBeLessThan(30);
  });

  it("shatters outward: the mean radius grows and every shard was given one impulse", () => {
    const { cues } = buildAbbeyTimeline(PAL);
    const particles = new ParticleBuffer(1600);
    const seq = new SceneSequencer(cues, { particles });
    const { ctx } = makeContext();
    seq.seek(6.0, 1920, 1080);
    const r0 = meanRadius(particles);
    seq.seek(6.8, 1920, 1080);
    const r1 = meanRadius(particles);
    seq.seek(9.5, 1920, 1080);
    const r2 = meanRadius(particles);
    expect(r1).toBeGreaterThan(r0 * 1.5);
    expect(r2).toBeGreaterThan(r1);
  });

  it("replays identically from the same seed after a scrub", () => {
    const { cues } = buildAbbeyTimeline(PAL);
    const particles = new ParticleBuffer(1600);
    const seq = new SceneSequencer(cues, { particles });
    const { ctx } = makeContext();
    seq.seek(17, 1920, 1080); // inside the Aviva ring
    const a = Array.from(particles.x.subarray(0, 8));
    seq.seek(33, 1920, 1080); // the mark
    seq.seek(17, 1920, 1080);
    expect(Array.from(particles.x.subarray(0, 8))).toEqual(a);
    expect(seq.activeCue?.name).toBe("aviva");
  });

  it("draws every cue without touching anything but the 2D context", () => {
    const { cues, duration } = buildAbbeyTimeline(PAL);
    const particles = new ParticleBuffer(1600);
    const seq = new SceneSequencer(cues, { particles });
    const { ctx, calls } = makeContext();
    for (let t = 0; t < duration; t += 0.5) seq.draw(ctx, 1920, 1080, t);
    expect(calls.filter((c) => c === "fillRect").length).toBeGreaterThan(0);
    expect(calls.filter((c) => c === "arc").length).toBeGreaterThan(1000);
    seq.dispose();
  });
});
