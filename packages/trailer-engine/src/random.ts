// random.ts — seeded RNG. Pure, zero imports.
//
// Scene output has to be reproducible: a test that asserts where a particle
// lands is worthless if Math.random() moved it, and a shatter that re-rolls its
// impulse every run cannot be reviewed frame-by-frame. Every stochastic value
// in a scene comes from here, seeded once on enter().

/**
 * mulberry32 — small, fast, and good enough for visual scatter. Not for
 * cryptography, and deliberately not seeded from the clock.
 *
 * The same seed yields the same sequence on every platform, which is the whole
 * point: a scene seeded `1` looks identical in CI, in review, and in the browser.
 */
export function createRandom(seed: number): () => number {
  // Coerce to uint32 so a negative or fractional seed still produces a stable
  // sequence rather than NaN propagating through every draw.
  let a = seed >>> 0;
  return function next(): number {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
