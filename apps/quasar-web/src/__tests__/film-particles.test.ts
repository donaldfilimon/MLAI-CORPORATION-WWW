import { describe, expect, it } from "vitest";

import { ParticleBuffer, createRandom } from "@mlai/trailer-engine";

describe("createRandom", () => {
  it("is deterministic for a given seed", () => {
    const a = createRandom(42);
    const b = createRandom(42);
    const seqA = [a(), a(), a(), a()];
    const seqB = [b(), b(), b(), b()];
    expect(seqA).toEqual(seqB);
  });

  it("produces different sequences for different seeds", () => {
    expect(createRandom(1)()).not.toBe(createRandom(2)());
  });

  it("stays in [0, 1)", () => {
    const r = createRandom(7);
    for (let i = 0; i < 2000; i++) {
      const v = r();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it("survives a negative or fractional seed instead of emitting NaN", () => {
    for (const seed of [-1, -99999, 3.7]) {
      const v = createRandom(seed)();
      expect(Number.isNaN(v)).toBe(false);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe("ParticleBuffer", () => {
  it("allocates parallel typed arrays at capacity", () => {
    const p = new ParticleBuffer(128);
    expect(p.capacity).toBe(128);
    expect(p.count).toBe(128);
    for (const buf of [p.x, p.y, p.vx, p.vy, p.targetX, p.targetY, p.radius, p.seed]) {
      expect(buf).toBeInstanceOf(Float32Array);
      expect(buf.length).toBe(128);
    }
    expect(p.group).toBeInstanceOf(Uint8Array);
    expect(p.group.length).toBe(128);
  });

  it("clamps resize to capacity so adaptive quality cannot overrun", () => {
    const p = new ParticleBuffer(100);
    p.resize(250);
    expect(p.count).toBe(100);
    p.resize(-5);
    expect(p.count).toBe(0);
    p.resize(37.9);
    expect(p.count).toBe(37);
  });

  it("rejects an invalid capacity rather than allocating something unusable", () => {
    expect(() => new ParticleBuffer(-1)).toThrow(RangeError);
    expect(() => new ParticleBuffer(1.5)).toThrow(RangeError);
  });

  it("seeds every particle once, reproducibly", () => {
    const a = new ParticleBuffer(64);
    const b = new ParticleBuffer(64);
    a.seedAll(createRandom(5));
    b.seedAll(createRandom(5));
    expect(Array.from(a.seed)).toEqual(Array.from(b.seed));
    // Seeds must actually vary — an all-zero buffer would pass a naive equality
    // check while making every particle identical.
    expect(new Set(Array.from(a.seed)).size).toBeGreaterThan(1);
  });

  it("seeds the whole capacity, not just the active count", () => {
    // Otherwise raising quality mid-scene exposes unseeded particles at 0.
    const p = new ParticleBuffer(32);
    p.resize(4);
    p.seedAll(createRandom(11));
    expect(p.seed[31]).not.toBe(0);
  });

  it("reset clears every buffer and restores full count", () => {
    const p = new ParticleBuffer(16);
    p.x[0] = 5; p.vy[3] = -2; p.group[7] = 9; p.seed[1] = 0.5;
    p.resize(2);
    p.reset();
    expect(p.count).toBe(16);
    expect(p.x[0]).toBe(0);
    expect(p.vy[3]).toBe(0);
    expect(p.group[7]).toBe(0);
    expect(p.seed[1]).toBe(0);
  });
});
