// abbey-trailer/scenes.ts — the "MLAI & Abbey" scene grammar.
//
// Seven cues on the trailer-engine SceneSequencer: a monolith gathers, it
// shatters, each of the three minds draws the shards into its own ring, the
// rings converge, and the final mark settles. Every scene is a LifecycleScene:
// enter() seeds the layout once from the cue's RNG (so a scrub replays the same
// picture), update(dt) integrates a damped spring toward per-particle targets,
// draw() paints from the structure-of-arrays ParticleBuffer, exit() holds
// nothing. Nothing here touches the DOM, so the whole grammar runs in Node.
//
// Persona colours come in through the palette argument (tokens.ts PERSONAS in
// the app); this module never imports brand data itself. Caption copy carries
// no figures: the latency line is written as words, by decision.

import { Easing, clamp, type DrawContext, type LifecycleScene, type SceneContext, type SceneCue } from "@mlai/trailer-engine";

export interface PersonaPalette {
  abi: string;
  aviva: string;
  abbey: string;
}

export interface TrailerPalette extends PersonaPalette {
  ink: string;
  text: string;
  dim: string;
}

/** A caption shown for a window of the timeline. No digits, by design. */
export interface Caption {
  start: number;
  end: number;
  who?: "abi" | "aviva" | "abbey";
  text: string;
}

export const ABBEY_DURATION = 38;
export const PARTICLE_COUNT = 1400;
const CX = 960, CY = 540;

/* ───────────────────────── shared integration ───────────────────────── */

/** Damped spring toward targetX/targetY. Frame-rate independent for the clamped dt this engine feeds it. */
function springStep(ctx: SceneContext, dt: number, stiffness: number, damping: number): void {
  const p = ctx.particles, n = p.count;
  const drag = Math.exp(-damping * dt);
  for (let i = 0; i < n; i++) {
    const ax = ((p.targetX[i] ?? 0) - (p.x[i] ?? 0)) * stiffness;
    const ay = ((p.targetY[i] ?? 0) - (p.y[i] ?? 0)) * stiffness;
    p.vx[i] = ((p.vx[i] ?? 0) + ax * dt) * drag;
    p.vy[i] = ((p.vy[i] ?? 0) + ay * dt) * drag;
    p.x[i] = (p.x[i] ?? 0) + (p.vx[i] ?? 0) * dt;
    p.y[i] = (p.y[i] ?? 0) + (p.vy[i] ?? 0) * dt;
  }
}

/** Scatter every particle across the frame with a seeded layout. */
function scatter(ctx: SceneContext): void {
  const p = ctx.particles;
  p.resize(PARTICLE_COUNT);
  p.seedAll(ctx.random);
  for (let i = 0; i < p.count; i++) {
    p.x[i] = ctx.random() * ctx.width;
    p.y[i] = ctx.random() * ctx.height;
    p.vx[i] = 0;
    p.vy[i] = 0;
    p.radius[i] = 1.2 + ctx.random() * 1.6;
    p.group[i] = i % 3;
  }
}

/** Points inside the monolith slab, deterministic for a given RNG. */
function slabTargets(ctx: SceneContext, w = 360, h = 620): void {
  const p = ctx.particles;
  for (let i = 0; i < p.count; i++) {
    p.targetX[i] = CX + (ctx.random() - 0.5) * w;
    p.targetY[i] = CY + (ctx.random() - 0.5) * h;
  }
}

function paintBase(ctx: DrawContext, w: number, h: number, ink: string): void {
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = ink;
  ctx.fillRect(0, 0, w, h);
}

function paintParticles(ctx: DrawContext, p: SceneContext["particles"], colorOf: (i: number) => string, alpha: number, scale = 1): void {
  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < p.count; i++) {
    ctx.fillStyle = colorOf(i);
    ctx.beginPath();
    ctx.arc(p.x[i] ?? 0, p.y[i] ?? 0, (p.radius[i] ?? 1) * scale, 0, 6.3);
    ctx.fill();
  }
  void alpha;
}

const rgba = (hex: string, a: number): string => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${clamp(a, 0, 1)})`;
};

/* ─────────────────────────────── scenes ─────────────────────────────── */

/** Scattered dust gathers into one slab: "one model pretending to be everything". */
export class MonolithScene implements LifecycleScene {
  private ctx: SceneContext | null = null;
  constructor(private readonly pal: TrailerPalette) {}
  enter(ctx: SceneContext): void {
    this.ctx = ctx;
    scatter(ctx);
    slabTargets(ctx);
  }
  update(dt: number): void {
    if (this.ctx) springStep(this.ctx, dt, 9, 4.5);
  }
  draw(ctx: DrawContext, w: number, h: number, local: number): void {
    if (!this.ctx) return;
    paintBase(ctx, w, h, this.pal.ink);
    const a = 0.25 + 0.55 * Easing.easeOutCubic(clamp(local / 4, 0, 1));
    paintParticles(ctx, this.ctx.particles, () => rgba(this.pal.text, a), a);
  }
  exit(): void {
    this.ctx = null;
  }
}

/** The slab breaks: one seeded outward impulse per shard, decided in enter. */
export class ShatterScene implements LifecycleScene {
  private ctx: SceneContext | null = null;
  constructor(private readonly pal: TrailerPalette) {}
  enter(ctx: SceneContext): void {
    this.ctx = ctx;
    scatter(ctx);
    slabTargets(ctx);
    const p = ctx.particles;
    for (let i = 0; i < p.count; i++) {
      // Start on the slab and fly away from its centre; the impulse is rolled
      // once here, never in update, so the burst is reviewable frame by frame.
      p.x[i] = p.targetX[i] ?? CX;
      p.y[i] = p.targetY[i] ?? CY;
      const dx = (p.x[i] ?? CX) - CX, dy = (p.y[i] ?? CY) - CY;
      const len = Math.hypot(dx, dy) || 1;
      const speed = 380 + ctx.random() * 720;
      const wobble = (ctx.random() - 0.5) * 0.9;
      p.vx[i] = (dx / len) * speed + wobble * speed * 0.35;
      p.vy[i] = (dy / len) * speed - wobble * speed * 0.35;
    }
  }
  update(dt: number): void {
    const c = this.ctx;
    if (!c) return;
    const p = c.particles, drag = Math.exp(-1.6 * dt);
    for (let i = 0; i < p.count; i++) {
      p.vx[i] = (p.vx[i] ?? 0) * drag;
      p.vy[i] = (p.vy[i] ?? 0) * drag;
      p.x[i] = (p.x[i] ?? 0) + (p.vx[i] ?? 0) * dt;
      p.y[i] = (p.y[i] ?? 0) + (p.vy[i] ?? 0) * dt;
    }
  }
  draw(ctx: DrawContext, w: number, h: number, local: number): void {
    if (!this.ctx) return;
    paintBase(ctx, w, h, this.pal.ink);
    const mix = Easing.easeInOutCubic(clamp(local / 3, 0, 1));
    const byGroup = [this.pal.abi, this.pal.aviva, this.pal.abbey];
    const p = this.ctx.particles;
    paintParticles(ctx, p, (i) => (mix > (p.seed[i] ?? 0) ? rgba(byGroup[p.group[i] ?? 0] ?? this.pal.text, 0.8) : rgba(this.pal.text, 0.75)), 1);
  }
  exit(): void {
    this.ctx = null;
  }
}

/** Shards settle into a slowly turning ring in one persona's colour. */
export class PersonaRingScene implements LifecycleScene {
  private ctx: SceneContext | null = null;
  private angle0: Float32Array | null = null;
  constructor(private readonly pal: TrailerPalette, private readonly who: keyof PersonaPalette, private readonly radius = 300) {}
  enter(ctx: SceneContext): void {
    this.ctx = ctx;
    scatter(ctx);
    const p = ctx.particles;
    this.angle0 = new Float32Array(p.count);
    for (let i = 0; i < p.count; i++) {
      this.angle0[i] = ctx.random() * Math.PI * 2;
      p.radius[i] = 1.0 + ctx.random() * 2.2;
    }
    this.layout(0);
  }
  private layout(local: number): void {
    const c = this.ctx, a0 = this.angle0;
    if (!c || !a0) return;
    const p = c.particles, turn = local * 0.25;
    for (let i = 0; i < p.count; i++) {
      const r = this.radius + ((p.seed[i] ?? 0) - 0.5) * 70;
      const ang = (a0[i] ?? 0) + turn;
      p.targetX[i] = CX + Math.cos(ang) * r;
      p.targetY[i] = CY + Math.sin(ang) * r * 0.62;
    }
  }
  update(dt: number, local: number): void {
    if (!this.ctx) return;
    this.layout(local);
    springStep(this.ctx, dt, 11, 5);
  }
  draw(ctx: DrawContext, w: number, h: number, local: number): void {
    if (!this.ctx) return;
    paintBase(ctx, w, h, this.pal.ink);
    const color = this.pal[this.who];
    const a = 0.35 + 0.5 * Easing.easeOutCubic(clamp(local / 2, 0, 1));
    paintParticles(ctx, this.ctx.particles, () => rgba(color, a), a);
  }
  exit(): void {
    this.ctx = null;
    this.angle0 = null;
  }
}

/** Three rings spiral into one cluster: "three minds, in concert". */
export class ConvergenceScene implements LifecycleScene {
  private ctx: SceneContext | null = null;
  private angle0: Float32Array | null = null;
  constructor(private readonly pal: TrailerPalette) {}
  enter(ctx: SceneContext): void {
    this.ctx = ctx;
    scatter(ctx);
    const p = ctx.particles;
    this.angle0 = new Float32Array(p.count);
    for (let i = 0; i < p.count; i++) {
      const g = p.group[i] ?? 0;
      // Start on three separate rings, one per mind.
      const ang = ctx.random() * Math.PI * 2;
      this.angle0[i] = ang;
      const ox = (g - 1) * 480;
      p.x[i] = CX + ox + Math.cos(ang) * 150;
      p.y[i] = CY + Math.sin(ang) * 95;
    }
  }
  update(dt: number, local: number): void {
    const c = this.ctx, a0 = this.angle0;
    if (!c || !a0) return;
    const p = c.particles;
    const k = Easing.easeInOutCubic(clamp(local / 4.5, 0, 1));
    for (let i = 0; i < p.count; i++) {
      const g = p.group[i] ?? 0;
      const ang = (a0[i] ?? 0) + local * (0.35 + g * 0.1);
      const r = 150 * (1 - k) + 210 * k + ((p.seed[i] ?? 0) - 0.5) * 60 * k;
      const ox = (g - 1) * 480 * (1 - k);
      p.targetX[i] = CX + ox + Math.cos(ang) * r;
      p.targetY[i] = CY + Math.sin(ang) * r * 0.62;
    }
    springStep(c, dt, 10, 4.8);
  }
  draw(ctx: DrawContext, w: number, h: number, local: number): void {
    if (!this.ctx) return;
    paintBase(ctx, w, h, this.pal.ink);
    const byGroup = [this.pal.abi, this.pal.aviva, this.pal.abbey];
    const p = this.ctx.particles;
    const a = 0.75 + 0.15 * Math.sin(local * 2);
    paintParticles(ctx, p, (i) => rgba(byGroup[p.group[i] ?? 0] ?? this.pal.text, a), a);
  }
  exit(): void {
    this.ctx = null;
    this.angle0 = null;
  }
}

/** The cluster settles into the mark: a hexagonal constellation that holds. */
export class FinalMarkScene implements LifecycleScene {
  private ctx: SceneContext | null = null;
  constructor(private readonly pal: TrailerPalette) {}
  enter(ctx: SceneContext): void {
    this.ctx = ctx;
    scatter(ctx);
    const p = ctx.particles;
    for (let i = 0; i < p.count; i++) {
      // Start near the centre (where convergence left the cluster), settle on
      // the hexagon outline with a seeded position along its perimeter.
      const ang = ctx.random() * Math.PI * 2;
      p.x[i] = CX + Math.cos(ang) * 210;
      p.y[i] = CY + Math.sin(ang) * 130;
      const side = Math.floor(ctx.random() * 6), t = ctx.random();
      const a1 = (side / 6) * Math.PI * 2, a2 = ((side + 1) / 6) * Math.PI * 2, R = 250;
      const jitter = ((p.seed[i] ?? 0) - 0.5) * 14;
      p.targetX[i] = CX + (Math.cos(a1) * (1 - t) + Math.cos(a2) * t) * R + jitter;
      p.targetY[i] = CY + (Math.sin(a1) * (1 - t) + Math.sin(a2) * t) * R + jitter;
      p.radius[i] = 1.0 + (p.seed[i] ?? 0) * 1.6;
    }
  }
  update(dt: number): void {
    if (this.ctx) springStep(this.ctx, dt, 12, 6);
  }
  draw(ctx: DrawContext, w: number, h: number, local: number): void {
    if (!this.ctx) return;
    paintBase(ctx, w, h, this.pal.ink);
    const byGroup = [this.pal.abi, this.pal.aviva, this.pal.abbey];
    const p = this.ctx.particles;
    const settle = Easing.easeOutCubic(clamp(local / 2.5, 0, 1));
    paintParticles(ctx, p, (i) => rgba(byGroup[p.group[i] ?? 0] ?? this.pal.text, 0.55 + 0.4 * settle), 1, 1 + 0.4 * settle);
  }
  exit(): void {
    this.ctx = null;
  }
}

/* ─────────────────────────────── timeline ─────────────────────────────── */

export interface AbbeyTimeline {
  cues: SceneCue[];
  captions: Caption[];
  duration: number;
}

export function buildAbbeyTimeline(pal: TrailerPalette): AbbeyTimeline {
  const cues: SceneCue[] = [
    { name: "monolith", scene: new MonolithScene(pal), start: 0, duration: 6, seed: 101 },
    { name: "shatter", scene: new ShatterScene(pal), start: 6, duration: 4, seed: 202 },
    { name: "abi", scene: new PersonaRingScene(pal, "abi"), start: 10, duration: 5, seed: 303 },
    { name: "aviva", scene: new PersonaRingScene(pal, "aviva"), start: 15, duration: 5, seed: 404 },
    { name: "abbey", scene: new PersonaRingScene(pal, "abbey"), start: 20, duration: 5, seed: 505 },
    { name: "convergence", scene: new ConvergenceScene(pal), start: 25, duration: 6, seed: 606 },
    { name: "mark", scene: new FinalMarkScene(pal), start: 31, duration: 7, seed: 707 },
  ];
  // Copy already shipped in the Vision Trailer; nothing new is claimed and no
  // figure appears. The three persona roles are the tokens.ts registry's.
  const captions: Caption[] = [
    { start: 0.8, end: 3.4, text: "They gave you an answer." },
    { start: 3.6, end: 6.0, text: "But could it ever prove it?" },
    { start: 6.4, end: 9.8, text: "Not one model pretending to be everything." },
    { start: 10.6, end: 14.6, who: "abi", text: "Abi. Interactive. Fast." },
    { start: 15.6, end: 19.6, who: "aviva", text: "Aviva. Research. Vision." },
    { start: 20.6, end: 24.6, who: "abbey", text: "Abbey. Proof. Verified." },
    { start: 25.8, end: 30.4, text: "Three minds. In concert." },
    { start: 31.8, end: 34.4, text: "This is MLAI." },
    { start: 34.6, end: 37.8, text: "Infrastructure for resilient intelligence." },
  ];
  return { cues, captions, duration: ABBEY_DURATION };
}

export function captionAt(captions: readonly Caption[], t: number): Caption | null {
  let hit: Caption | null = null;
  for (const c of captions) if (t >= c.start && t <= c.end) hit = c;
  return hit;
}
