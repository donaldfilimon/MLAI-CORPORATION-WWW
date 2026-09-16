// particles.ts — structure-of-arrays particle storage. Pure, zero imports.
//
// Deliberately NOT an array of objects. At the scale a full-screen scene wants,
// per-particle objects each carrying a generated color string turn every frame
// into allocation the collector then has to chase. Typed arrays keep the whole
// system in a handful of contiguous buffers, so a scene's update loop is an
// indexed pass over numbers and produces no garbage at all.

/**
 * Fixed-capacity particle state.
 *
 * Every field is a parallel array indexed by particle id, `0 .. count - 1`.
 * Capacity is fixed at construction: scenes vary how many particles they *use*
 * (see {@link ParticleBuffer.count}), never how many exist, so no scene
 * transition allocates.
 */
export class ParticleBuffer {
  /** Number of particles the current scene is using. Never exceeds capacity. */
  count: number;

  readonly capacity: number;
  readonly x: Float32Array;
  readonly y: Float32Array;
  readonly vx: Float32Array;
  readonly vy: Float32Array;
  readonly targetX: Float32Array;
  readonly targetY: Float32Array;
  readonly radius: Float32Array;
  /** Scene-defined grouping (persona, ring, shard index …). */
  readonly group: Uint8Array;
  /**
   * Per-particle stable randomness, assigned once. Scenes read this instead of
   * calling the RNG per frame, which is what makes a monolith stop shimmering
   * and a logo settle instead of jittering.
   */
  readonly seed: Float32Array;

  constructor(capacity: number) {
    if (!Number.isInteger(capacity) || capacity < 0) {
      throw new RangeError(`ParticleBuffer capacity must be a non-negative integer, got ${capacity}`);
    }
    this.capacity = capacity;
    this.count = capacity;
    this.x = new Float32Array(capacity);
    this.y = new Float32Array(capacity);
    this.vx = new Float32Array(capacity);
    this.vy = new Float32Array(capacity);
    this.targetX = new Float32Array(capacity);
    this.targetY = new Float32Array(capacity);
    this.radius = new Float32Array(capacity);
    this.group = new Uint8Array(capacity);
    this.seed = new Float32Array(capacity);
  }

  /**
   * Set how many particles the current scene uses. Clamped to capacity so an
   * adaptive-quality step can ask for more than exists without a bounds error.
   */
  resize(count: number): void {
    this.count = Math.max(0, Math.min(this.capacity, Math.floor(count)));
  }

  /**
   * Assign each particle its stable seed. Call once, on scene enter — never per
   * frame, which is the defect that makes randomised scenes shimmer.
   */
  seedAll(random: () => number): void {
    for (let i = 0; i < this.capacity; i++) this.seed[i] = random();
  }

  /** Zero every buffer and restore `count` to capacity. */
  reset(): void {
    this.x.fill(0);
    this.y.fill(0);
    this.vx.fill(0);
    this.vy.fill(0);
    this.targetX.fill(0);
    this.targetY.fill(0);
    this.radius.fill(0);
    this.group.fill(0);
    this.seed.fill(0);
    this.count = this.capacity;
  }
}
