// sequencer.ts — the scene grammar. Pure, no DOM at module scope.
//
// A LifecycleScene has explicit phases: enter() runs exactly once when the
// playhead moves into its cue, update(dt) runs once per frame with a clamped
// step, draw() paints, exit() runs once when the playhead leaves. This is what
// structurally rules out three defects the prototype this replaces had:
// one-shot transitions written inside the per-frame path (they belong in
// enter), targets re-rolled every frame (enter seeds them once, from a seeded
// RNG so a scrub replays the same layout), and timers that outlive their scene
// (a scene owns nothing across exit; the sequencer calls exit on every switch
// and on dispose).
//
// Seeking is a first-class case, not an edge: moving backwards inside a cue
// re-enters it, because the picture at local time t is defined as "enter, then
// integrate t seconds", and integrating a negative dt is not a thing this
// engine does.

import { MAX_FRAME_DT } from "./clock";
import type { ParticleBuffer } from "./particles";
import { createRandom } from "./random";
import type { DrawContext, Scene } from "./renderer";

export interface SceneContext {
  /** Seeded per activation from the cue's seed; deterministic across scrubs. */
  random: () => number;
  particles: ParticleBuffer;
  width: number;
  height: number;
  /**
   * 0..1 detail budget, set by the host from measured frame time, never from
   * the user agent. Scenes scale their particle counts by it on enter; it is
   * read at activation, so a change takes effect at the next cue or seek.
   */
  quality: number;
}

export interface LifecycleScene {
  /** One-shot setup: seed particles, place targets, choose layout. */
  enter(ctx: SceneContext): void;
  /** Integrate `dt` seconds (already clamped). `local` is time since enter. */
  update(dt: number, local: number, ctx: SceneContext): void;
  draw(ctx: DrawContext, width: number, height: number, local: number): void;
  /** Release anything held. Called on every switch and on dispose. */
  exit(): void;
}

export interface SceneCue {
  name: string;
  scene: LifecycleScene;
  /** Cue start on the timeline, seconds. */
  start: number;
  duration: number;
  /** RNG seed for this activation; the same seed replays the same layout. */
  seed: number;
}

export interface SequencerOptions {
  particles: ParticleBuffer;
  /** Longest integration step per frame. Defaults to MAX_FRAME_DT. */
  maxDt?: number;
  /** Fixed substep for integration; a large frame is split into several. Defaults to no substepping. */
  maxSubstep?: number;
  onSwitch?: (from: SceneCue | null, to: SceneCue | null) => void;
}

/**
 * Drives LifecycleScenes from a Renderer's draw(t) call, so the host keeps
 * cadence and the sequencer keeps the lifecycle honest.
 */
export class SceneSequencer implements Scene {
  private readonly cues: SceneCue[];
  private readonly particles: ParticleBuffer;
  private readonly maxDt: number;
  private readonly maxSubstep: number;
  private readonly onSwitch?: (from: SceneCue | null, to: SceneCue | null) => void;

  private active: SceneCue | null = null;
  private ctx: SceneContext | null = null;
  private quality = 1;
  /** Local time the active scene has been integrated to. */
  private integrated = 0;
  /** Local time of the last draw, used to detect a backward move. */
  private lastLocal = 0;
  private disposed = false;

  constructor(cues: readonly SceneCue[], opts: SequencerOptions) {
    // Sorted by start so lookup is a linear scan in order; overlaps resolve to
    // the later cue, which is the useful behaviour for a hard cut.
    this.cues = [...cues].sort((a, b) => a.start - b.start);
    for (const c of this.cues) {
      if (!(c.duration > 0)) throw new RangeError(`cue "${c.name}" needs a positive duration`);
    }
    this.particles = opts.particles;
    this.maxDt = opts.maxDt ?? MAX_FRAME_DT;
    this.maxSubstep = opts.maxSubstep ?? Infinity;
    this.onSwitch = opts.onSwitch;
  }

  /** The cue whose window contains `t`, or null in a gap. */
  cueAt(t: number): SceneCue | null {
    let hit: SceneCue | null = null;
    for (const c of this.cues) {
      if (t >= c.start && t < c.start + c.duration) hit = c;
    }
    return hit;
  }

  get activeCue(): SceneCue | null {
    return this.active;
  }

  /** Local time of the active scene, or 0. */
  get localTime(): number {
    return this.integrated;
  }

  /** Detail budget handed to scenes at their next activation. Clamped to 0..1. */
  setQuality(q: number): void {
    this.quality = Math.max(0, Math.min(1, q));
  }

  get currentQuality(): number {
    return this.quality;
  }

  private activate(cue: SceneCue | null, width: number, height: number): void {
    const from = this.active;
    if (from) {
      from.scene.exit();
      this.active = null;
      this.ctx = null;
    }
    this.integrated = 0;
    this.lastLocal = 0;
    if (cue) {
      this.ctx = { random: createRandom(cue.seed), particles: this.particles, width, height, quality: this.quality };
      this.active = cue;
      cue.scene.enter(this.ctx);
    }
    if (from !== cue) this.onSwitch?.(from, cue);
  }

  draw(ctx: DrawContext, width: number, height: number, t: number): void {
    if (this.disposed) return;
    const cue = this.cueAt(t);
    const local = cue ? t - cue.start : 0;

    // Enter on a switch, and re-enter on a backward move inside the same cue:
    // integrating a negative dt is not a thing this engine does, so the frame
    // at an earlier local time is "enter, then integrate forward" again.
    if (cue !== this.active || local < this.lastLocal) this.activate(cue, width, height);
    if (!cue || !this.ctx) return;
    if (this.ctx.width !== width || this.ctx.height !== height) {
      // A resize re-lays the scene out rather than stretching it.
      this.activate(cue, width, height);
    }
    this.lastLocal = local;

    // draw() cannot tell a scrub from a stalled tab, so a forward jump is
    // treated as a stall and clamped: the picture may lag but cannot skip a
    // beat. A host that knows it is scrubbing calls seek() instead.
    this.integrate(cue, Math.min(local - this.integrated, this.maxDt));
    cue.scene.draw(ctx, width, height, this.integrated);
  }

  /**
   * Jump to timeline time `t`: re-enter the cue and integrate to the local
   * time in bounded steps, so a scrub lands on the exact frame the scene would
   * have reached by playing, at a cost proportional to the distance.
   */
  seek(t: number, width: number, height: number): void {
    if (this.disposed) return;
    const cue = this.cueAt(t);
    this.activate(cue, width, height);
    if (!cue) return;
    this.lastLocal = t - cue.start;
    this.integrate(cue, this.lastLocal);
  }

  private integrate(cue: SceneCue, seconds: number): void {
    const step = Math.min(this.maxDt, this.maxSubstep);
    let remaining = seconds;
    while (remaining > 1e-9) {
      const dt = Math.min(remaining, step);
      this.integrated += dt;
      cue.scene.update(dt, this.integrated, this.ctx as SceneContext);
      remaining -= dt;
    }
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    if (this.active) {
      this.active.scene.exit();
      this.onSwitch?.(this.active, null);
    }
    this.active = null;
    this.ctx = null;
  }
}
