// neural-scene.ts — the 3D neural-network backdrop as a Scene.
//
// A layered MLP rendered in rotating perspective; activations propagate
// layer→layer; it warps into a radial "fabric" and blooms on demand. Paints its
// own deep-black base for contrast control. Moved here from apps/quasar-web's
// neural.tsx with three injections in place of globals: the random source
// (default Math.random, preserving the old non-reproducibility; tests seed it),
// the intensity read (the app supplies window.__tw.neural), and the colour
// presets, which are brand data and arrive through setMode().

import { Easing, clamp } from "./easing";
import type { DrawContext, Scene } from "./renderer";

export interface NetNode {
  nx: number; ny: number; nz: number;
  li: number; i: number; ph: number;
  rx: number; ry: number; rz: number;
}
export interface NetEdge { a: number; b: number; w: number; ph: number }
export interface NetStar { nx: number; ny: number; nz: number; tw: number }
export interface Net { nodes: NetNode[]; edges: NetEdge[]; stars: NetStar[] }

export const NL_LAYERS: readonly number[] = [6, 9, 12, 14, 12, 9, 6];

/** A colour/motion preset the scene eases toward. `hue` is an RGB triple. */
export interface NeuralModePreset {
  order: number;
  radial: number;
  hue: readonly [number, number, number];
  spd: number;
  waves: number;
  glow: number;
}

interface ModeState {
  order: number;
  radial: number;
  hue: [number, number, number];
  spd: number;
  waves: number;
  glow: number;
}

export function buildNet3D(layers: readonly number[] = NL_LAYERS, random: () => number = Math.random): Net {
  const nodes: NetNode[] = [], edges: NetEdge[] = [], L = layers.length;
  const layerStart: number[] = [];
  let off = 0;
  layers.forEach((cnt, li) => {
    layerStart[li] = off;
    off += cnt;
    const nx = (li / (L - 1) - 0.5) * 2.4;
    for (let i = 0; i < cnt; i++) {
      const ny = (cnt === 1 ? 0 : i / (cnt - 1) - 0.5) * 1.62;
      const nz = (random() - 0.5) * 0.6;
      nodes.push({ nx, ny, nz, li, i, ph: random() * 6.28, rx: 0, ry: 0, rz: 0 });
    }
  });
  // radial fabric targets: concentric rings, varied depth
  nodes.forEach((n, idx) => {
    const ring = 1 + (n.li % 3);
    const ang = (idx / nodes.length) * Math.PI * 4;
    const rr = 0.34 + ring * 0.3;
    n.rx = Math.cos(ang) * rr;
    n.ry = Math.sin(ang) * rr;
    n.rz = Math.sin(ang * 2) * 0.25;
  });
  for (let li = 0; li < L - 1; li++) {
    const here = layers[li] ?? 0, next = layers[li + 1] ?? 0;
    for (let a = 0; a < here; a++) {
      for (let b = 0; b < next; b++) {
        const w = random() * 2 - 1;
        if (Math.abs(w) < 0.4) continue; // prune weak edges: cleaner, higher-contrast read
        edges.push({ a: (layerStart[li] ?? 0) + a, b: (layerStart[li + 1] ?? 0) + b, w, ph: random() * 6.28 });
      }
    }
  }
  // far starfield for parallax depth
  const stars: NetStar[] = Array.from({ length: 90 }, () => {
    const th = random() * 6.28, r = 1.4 + random() * 1.3;
    return { nx: Math.cos(th) * r, ny: (random() - 0.5) * 1.8, nz: Math.sin(th) * r, tw: random() * 6.28 };
  });
  return { nodes, edges, stars };
}

// rotate (x,y,z) by yaw (Y axis) then pitch (X axis)
function rot3(x: number, y: number, z: number, cy: number, sy: number, cx: number, sx: number): [number, number, number] {
  const x1 = x * cy + z * sy, z1 = -x * sy + z * cy;
  const y2 = y * cx - z1 * sx, z2 = y * sx + z1 * cx;
  return [x1, y2, z2];
}

function nlDraw(ctx: DrawContext, W: number, H: number, t: number, cu: ModeState, net: Net, intensity: number, layerCount: number): void {
  const [hr, hg, hb] = cu.hue, order = cu.order, radial = cu.radial, glow = cu.glow;
  const L = layerCount;

  // deep base (own background gives full contrast control)
  const bg = ctx.createRadialGradient(W / 2, H * 0.46, 0, W / 2, H * 0.46, Math.max(W, H) * 0.7);
  bg.addColorStop(0, "#070c18"); bg.addColorStop(0.5, "#04060d"); bg.addColorStop(1, "#020305");
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  // faint perspective grid for complexity
  ctx.strokeStyle = "rgba(110,150,210,0.032)"; ctx.lineWidth = 1;
  for (let gx = 0; gx <= 10; gx++) { const x = (gx / 10) * W; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let gy = 0; gy <= 6; gy++) { const y = (gy / 6) * H; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

  if (intensity <= 0.01) return;

  // camera: slow 3D push-in plus yaw sweep on the open, gentle drift after
  const intro = clamp(t / 6, 0, 1), ie = Easing.easeInOutCubic(intro);
  const yaw = (-0.62 + 0.92 * ie) + Math.sin(t * 0.19) * 0.18;
  const pitch = 0.1 * Math.sin(t * 0.16) + 0.05;
  const cy = Math.cos(yaw), sy = Math.sin(yaw), cx = Math.cos(pitch), sx = Math.sin(pitch);
  const camZ = 3.2 - 1.05 * ie; // dolly in (closer = bigger)
  const S = Math.min(W, H) * (0.5 + 0.46 * ie); // grow to fill the frame
  const ox = W / 2, oy = H * 0.5;
  const proj = (x: number, y: number, z: number) => {
    const [xr, yr, zr] = rot3(x, y, z, cy, sy, cx, sx);
    const p = 1 / (camZ - zr);
    return { x: ox + xr * p * S, y: oy + yr * p * S, n: clamp((p - 0.22) / 0.5, 0, 1) };
  };

  ctx.globalCompositeOperation = "lighter";

  // far starfield (parallax depth)
  for (const s of net.stars) {
    const P = proj(s.nx, s.ny, s.nz);
    const a = (0.06 + 0.1 * (0.5 + 0.5 * Math.sin(t * 0.9 + s.tw))) * P.n * intensity;
    ctx.fillStyle = `rgba(150,180,230,${a})`;
    ctx.beginPath(); ctx.arc(P.x, P.y, 0.6 + P.n * 1.0, 0, 6.3); ctx.fill();
  }

  // node live positions (3D) plus activation
  const np = net.nodes.map((n) => {
    const jit = (1 - order) * 0.6 * intensity;
    let x = n.nx + Math.sin(t * 1.25 + n.ph) * jit;
    let y = n.ny + Math.cos(t * 1.05 + n.ph * 1.3) * jit;
    let z = n.nz + Math.sin(t * 0.8 + n.ph) * jit * 0.6;
    if (radial > 0.001) { x = x * (1 - radial) + n.rx * radial; y = y * (1 - radial) + n.ry * radial; z = z * (1 - radial) + n.rz * radial; }
    const prog = n.li / (L - 1);
    let act = 0;
    for (let wv = 0; wv < cu.waves; wv++) {
      const front = (((t * cu.spd + wv / cu.waves) % 1) + 1) % 1;
      const d = prog - front;
      act = Math.max(act, Math.exp(-d * d * 22));
    }
    const P = proj(x, y, z);
    return { x: P.x, y: P.y, n: P.n, act };
  });

  // edges: dim when idle, bright with a travelling pulse when active
  for (const e of net.edges) {
    const A = np[e.a], B = np[e.b];
    if (!A || !B) continue;
    const ea = (A.act + B.act) * 0.5, depth = (A.n + B.n) * 0.5;
    const a = (0.025 + Math.abs(e.w) * 0.06 + ea * 0.62) * intensity * glow * (0.4 + depth * 0.6);
    if (a < 0.012) continue;
    ctx.strokeStyle = `rgba(${hr | 0},${hg | 0},${hb | 0},${clamp(a, 0, 1)})`;
    ctx.lineWidth = (0.5 + Math.abs(e.w) * 0.8 + ea * 2.0) * (0.6 + depth * 0.7);
    ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y); ctx.stroke();
    if (ea > 0.32) {
      const pp = (((t * 1.6 + e.ph) % 1) + 1) % 1, px = A.x + (B.x - A.x) * pp, py = A.y + (B.y - A.y) * pp;
      ctx.fillStyle = `rgba(${Math.min(255, hr + 90) | 0},${Math.min(255, hg + 70) | 0},255,${ea * 0.9 * intensity})`;
      ctx.beginPath(); ctx.arc(px, py, 1.8 + ea * 2.6, 0, 6.3); ctx.fill();
    }
  }

  // nodes: bright near-white cores when firing, depth-scaled for 3D
  for (const P of np) {
    const a = (0.1 + P.act * 0.9) * intensity * glow * (0.35 + P.n * 0.75);
    const rad = (1.2 + P.act * 5.2) * (0.55 + P.n * 0.7);
    if (P.act > 0.45) {
      const g = ctx.createRadialGradient(P.x, P.y, 0, P.x, P.y, rad * 3.2);
      g.addColorStop(0, `rgba(${Math.min(255, hr + 110) | 0},${Math.min(255, hg + 90) | 0},255,${P.act * 0.5 * intensity})`);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(P.x, P.y, rad * 3.2, 0, 6.3); ctx.fill();
    }
    ctx.fillStyle = P.act > 0.6
      ? `rgba(235,248,255,${clamp(a + 0.15, 0, 1)})`
      : `rgba(${Math.min(255, hr + 40) | 0},${Math.min(255, hg + 30) | 0},${hb | 0},${clamp(a, 0, 1)})`;
    ctx.beginPath(); ctx.arc(P.x, P.y, rad, 0, 6.3); ctx.fill();
  }

  // edge vignette to deepen corners, a light touch so the network fills the frame
  ctx.globalCompositeOperation = "source-over";
  const vg = ctx.createRadialGradient(W / 2, H * 0.5, Math.min(W, H) * 0.42, W / 2, H * 0.5, Math.max(W, H) * 0.78);
  vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(1,2,5,0.66)");
  ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
}

export interface NeuralSceneOptions {
  /** Preset the scene starts on. */
  initial: NeuralModePreset;
  /** Stochastic source for the net layout. Seed it for reproducible output. */
  random?: () => number;
  /** 0..1 dimmer read every frame; 0 draws only the base and grid. */
  intensity?: () => number;
  layers?: readonly number[];
  /** Per-frame easing toward the target preset after the first snap. */
  easeRate?: number;
}

export class NeuralScene implements Scene {
  private readonly net: Net;
  private readonly layerCount: number;
  private readonly intensity: () => number;
  private readonly easeRate: number;
  private readonly state: ModeState;
  private target: NeuralModePreset;
  private inited = false;

  constructor(opts: NeuralSceneOptions) {
    const layers = opts.layers ?? NL_LAYERS;
    this.net = buildNet3D(layers, opts.random ?? Math.random);
    this.layerCount = layers.length;
    this.intensity = opts.intensity ?? (() => 1);
    this.easeRate = opts.easeRate ?? 0.06;
    this.target = opts.initial;
    this.state = { ...opts.initial, hue: [...opts.initial.hue] };
  }

  /** The preset to ease toward. Applied on the next draw. */
  setMode(target: NeuralModePreset): void {
    this.target = target;
  }

  /** Current eased mode, for tests and inspection. */
  get current(): Readonly<ModeState> {
    return this.state;
  }

  draw(ctx: DrawContext, width: number, height: number, t: number): void {
    // Snap to the target on the very first frame so a seek shows the right
    // colour; ease between modes during playback.
    const k = this.inited ? this.easeRate : 1;
    this.inited = true;
    const o = this.state, M = this.target;
    o.order += (M.order - o.order) * k;
    o.radial += (M.radial - o.radial) * k;
    o.glow += (M.glow - o.glow) * k;
    o.spd += (M.spd - o.spd) * k;
    o.waves = M.waves;
    o.hue = [o.hue[0] + (M.hue[0] - o.hue[0]) * k, o.hue[1] + (M.hue[1] - o.hue[1]) * k, o.hue[2] + (M.hue[2] - o.hue[2]) * k];
    nlDraw(ctx, width, height, t, o, this.net, this.intensity(), this.layerCount);
  }
}
