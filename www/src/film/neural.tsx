// neural.tsx — 3D neural-network background that morphs across the trailer.
// A layered MLP rendered in rotating perspective; activations propagate layer→layer;
// it warps into a radial "fabric" for the vision act and blooms at the title. Paints
// its own deep-black base for high contrast. Reads window.__tw.neural for intensity.
// Ported from trailer_neural.jsx. Exports: NeuralCanvas, NeuralLayer, neuralModeForTime, NL_MODES.

import { useRef, useEffect, type CSSProperties } from "react";
import { C } from "./tokens";
import { Easing, clamp } from "./easing";
import { useTime } from "./engine";

// `C` is part of the canonical token surface for film modules; referenced to keep the
// import intentional even though the deep-black base below is painted with literal stops.
void C;

/* ── 3D net structure ─────────────────────────────────────────── */

interface NetNode {
  nx: number; ny: number; nz: number;
  li: number; i: number; ph: number;
  rx: number; ry: number; rz: number;
}
interface NetEdge { a: number; b: number; w: number; ph: number; }
interface NetStar { nx: number; ny: number; nz: number; tw: number; }
interface Net { nodes: NetNode[]; edges: NetEdge[]; stars: NetStar[]; }

const NL_LAYERS = [6, 9, 12, 14, 12, 9, 6];

function buildNet3D(): Net {
  const nodes: NetNode[] = [], edges: NetEdge[] = [], L = NL_LAYERS.length;
  const layerStart: number[] = []; let off = 0;
  NL_LAYERS.forEach((cnt, li) => {
    layerStart[li] = off; off += cnt;
    const nx = (li / (L - 1) - 0.5) * 2.4;
    for (let i = 0; i < cnt; i++) {
      const ny = (cnt === 1 ? 0 : (i / (cnt - 1) - 0.5)) * 1.62;
      const nz = (Math.random() - 0.5) * 0.6;
      nodes.push({ nx, ny, nz, li, i, ph: Math.random() * 6.28, rx: 0, ry: 0, rz: 0 });
    }
  });
  // radial fabric targets — concentric rings, varied depth
  nodes.forEach((n, idx) => {
    const ring = 1 + (n.li % 3);
    const ang = (idx / nodes.length) * Math.PI * 4;
    const rr = 0.34 + ring * 0.30;
    n.rx = Math.cos(ang) * rr;
    n.ry = Math.sin(ang) * rr;
    n.rz = Math.sin(ang * 2) * 0.25;
  });
  for (let li = 0; li < L - 1; li++) {
    for (let a = 0; a < NL_LAYERS[li]!; a++) for (let b = 0; b < NL_LAYERS[li + 1]!; b++) {
      const w = Math.random() * 2 - 1;
      if (Math.abs(w) < 0.40) continue; // prune weak edges → cleaner, higher-contrast read
      edges.push({ a: layerStart[li]! + a, b: layerStart[li + 1]! + b, w, ph: Math.random() * 6.28 });
    }
  }
  // far starfield for parallax depth / complexity
  const stars: NetStar[] = Array.from({ length: 90 }, () => {
    const th = Math.random() * 6.28, r = 1.4 + Math.random() * 1.3;
    return { nx: Math.cos(th) * r, ny: (Math.random() - 0.5) * 1.8, nz: Math.sin(th) * r, tw: Math.random() * 6.28 };
  });
  return { nodes, edges, stars };
}

export const NL_MODES = {
  chaos:   { order: 0.05, radial: 0, hue: [255, 90, 84],  spd: 1.5, waves: 3, glow: 0.8 },
  resolve: { order: 0.55, radial: 0, hue: [90, 230, 170],  spd: 1.1, waves: 2, glow: 1.0 },
  build:   { order: 0.93, radial: 0, hue: [80, 175, 255],  spd: 1.6, waves: 2, glow: 1.15 },
  order:   { order: 1.0,  radial: 0, hue: [95, 205, 255],  spd: 2.0, waves: 3, glow: 1.2 },
  reason:  { order: 1.0,  radial: 0, hue: [120, 230, 255], spd: 2.7, waves: 4, glow: 1.4 },
  fabric:  { order: 1.0,  radial: 1, hue: [185, 140, 255], spd: 1.2, waves: 2, glow: 1.2 },
  bloom:   { order: 1.0,  radial: 1, hue: [215, 238, 255], spd: 0.8, waves: 1, glow: 1.55 },
} as const;

export type NeuralMode = keyof typeof NL_MODES;

interface ModeState { order: number; radial: number; hue: number[]; spd: number; waves: number; glow: number; }

export function neuralModeForTime(t: number): NeuralMode {
  if (t < 7) return 'chaos';
  if (t < 11) return 'resolve';
  if (t < 26) return 'build';
  if (t < 38) return 'order';
  if (t < 43) return 'reason';
  if (t < 59) return 'fabric';
  return 'bloom';
}

// rotate (x,y,z) by yaw (Y axis) then pitch (X axis)
function rot3(x: number, y: number, z: number, cy: number, sy: number, cx: number, sx: number): [number, number, number] {
  const x1 = x * cy + z * sy, z1 = -x * sy + z * cy;
  const y2 = y * cx - z1 * sx, z2 = y * sx + z1 * cx;
  return [x1, y2, z2];
}

function nlDraw(ctx: CanvasRenderingContext2D, W: number, H: number, t: number, cu: ModeState, net: Net): void {
  const tw = (window as unknown as { __tw?: { neural?: number } }).__tw || {};
  const intensity = tw.neural != null ? tw.neural : 1;
  const [hr, hg, hb] = cu.hue as [number, number, number], order = cu.order, radial = cu.radial, glow = cu.glow;
  const L = NL_LAYERS.length;

  // ── deep base (own background → full contrast control) ──
  const bg = ctx.createRadialGradient(W / 2, H * 0.46, 0, W / 2, H * 0.46, Math.max(W, H) * 0.7);
  bg.addColorStop(0, '#070c18'); bg.addColorStop(0.5, '#04060d'); bg.addColorStop(1, '#020305');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  // faint perspective grid for complexity
  ctx.strokeStyle = 'rgba(110,150,210,0.032)'; ctx.lineWidth = 1;
  for (let gx = 0; gx <= 10; gx++) { const x = (gx / 10) * W; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let gy = 0; gy <= 6; gy++) { const y = (gy / 6) * H; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

  if (intensity <= 0.01) return;

  // ── camera: epic slow 3D push-in + yaw sweep on the open, gentle drift after ──
  const intro = clamp(t / 6, 0, 1), ie = Easing.easeInOutCubic(intro);
  const yaw = (-0.62 + 0.92 * ie) + Math.sin(t * 0.19) * 0.18;
  const pitch = 0.10 * Math.sin(t * 0.16) + 0.05;
  const cy = Math.cos(yaw), sy = Math.sin(yaw), cx = Math.cos(pitch), sx = Math.sin(pitch);
  const camZ = 3.2 - 1.05 * ie;                         // dolly in (closer = bigger)
  const S = Math.min(W, H) * (0.50 + 0.46 * ie);        // grow to fill the frame
  const ox = W / 2, oy = H * 0.5;
  const proj = (x: number, y: number, z: number) => {
    const [xr, yr, zr] = rot3(x, y, z, cy, sy, cx, sx);
    const p = 1 / (camZ - zr);
    return { x: ox + xr * p * S, y: oy + yr * p * S, n: clamp((p - 0.22) / 0.5, 0, 1) };
  };

  ctx.globalCompositeOperation = 'lighter';

  // far starfield (parallax depth)
  for (const s of net.stars) {
    const P = proj(s.nx, s.ny, s.nz);
    const a = (0.06 + 0.10 * (0.5 + 0.5 * Math.sin(t * 0.9 + s.tw))) * P.n * intensity;
    ctx.fillStyle = `rgba(150,180,230,${a})`;
    ctx.beginPath(); ctx.arc(P.x, P.y, 0.6 + P.n * 1.0, 0, 6.3); ctx.fill();
  }

  // node live positions (3D) + activation
  const np = net.nodes.map((n) => {
    const jit = (1 - order) * 0.6 * intensity;
    let x = n.nx + Math.sin(t * 1.25 + n.ph) * jit;
    let y = n.ny + Math.cos(t * 1.05 + n.ph * 1.3) * jit;
    let z = n.nz + Math.sin(t * 0.8 + n.ph) * jit * 0.6;
    if (radial > 0.001) { x = x * (1 - radial) + n.rx * radial; y = y * (1 - radial) + n.ry * radial; z = z * (1 - radial) + n.rz * radial; }
    const prog = n.li / (L - 1);
    let act = 0;
    for (let wv = 0; wv < cu.waves; wv++) {
      const front = ((t * cu.spd + wv / cu.waves) % 1 + 1) % 1;
      const d = prog - front; act = Math.max(act, Math.exp(-d * d * 22));
    }
    const P = proj(x, y, z);
    return { x: P.x, y: P.y, n: P.n, act };
  });

  // edges — high contrast: dim when idle, bright + traveling pulse when active
  for (const e of net.edges) {
    const A = np[e.a]!, B = np[e.b]!, ea = (A.act + B.act) * 0.5, depth = (A.n + B.n) * 0.5;
    const a = (0.025 + Math.abs(e.w) * 0.06 + ea * 0.62) * intensity * glow * (0.4 + depth * 0.6);
    if (a < 0.012) continue;
    ctx.strokeStyle = `rgba(${hr | 0},${hg | 0},${hb | 0},${clamp(a, 0, 1)})`;
    ctx.lineWidth = (0.5 + Math.abs(e.w) * 0.8 + ea * 2.0) * (0.6 + depth * 0.7);
    ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y); ctx.stroke();
    if (ea > 0.32) {
      const pp = ((t * 1.6 + e.ph) % 1 + 1) % 1, px = A.x + (B.x - A.x) * pp, py = A.y + (B.y - A.y) * pp;
      ctx.fillStyle = `rgba(${Math.min(255, hr + 90) | 0},${Math.min(255, hg + 70) | 0},255,${ea * 0.9 * intensity})`;
      ctx.beginPath(); ctx.arc(px, py, 1.8 + ea * 2.6, 0, 6.3); ctx.fill();
    }
  }

  // nodes — bright near-white cores when firing (depth-scaled for 3D)
  for (const P of np) {
    const a = (0.10 + P.act * 0.9) * intensity * glow * (0.35 + P.n * 0.75);
    const rad = (1.2 + P.act * 5.2) * (0.55 + P.n * 0.7);
    if (P.act > 0.45) {
      const g = ctx.createRadialGradient(P.x, P.y, 0, P.x, P.y, rad * 3.2);
      g.addColorStop(0, `rgba(${Math.min(255, hr + 110) | 0},${Math.min(255, hg + 90) | 0},255,${P.act * 0.5 * intensity})`);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(P.x, P.y, rad * 3.2, 0, 6.3); ctx.fill();
    }
    ctx.fillStyle = P.act > 0.6
      ? `rgba(235,248,255,${clamp(a + 0.15, 0, 1)})`
      : `rgba(${Math.min(255, hr + 40) | 0},${Math.min(255, hg + 30) | 0},${hb | 0},${clamp(a, 0, 1)})`;
    ctx.beginPath(); ctx.arc(P.x, P.y, rad, 0, 6.3); ctx.fill();
  }

  // edge vignette to deepen corners — light touch so the network fills the frame
  ctx.globalCompositeOperation = 'source-over';
  const vg = ctx.createRadialGradient(W / 2, H * 0.5, Math.min(W, H) * 0.42, W / 2, H * 0.5, Math.max(W, H) * 0.78);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(1,2,5,0.66)');
  ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
}

export function NeuralCanvas({ t, mode, opacity = 1 }: { t: number; mode: string; opacity?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const net = useRef<Net | null>(null);
  const cu = useRef<ModeState>({ order: 0.05, radial: 0, hue: [255, 90, 84], spd: 1.5, waves: 3, glow: 0.8 });
  const W = 1920, H = 1080;

  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext('2d')!; const dpr = 2;
    c.width = W * dpr; c.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    net.current = buildNet3D();
  }, []);

  const inited = useRef(false);
  useEffect(() => {
    const c = ref.current; if (!c || !net.current) return;
    const ctx = c.getContext('2d')!;
    const M = (NL_MODES as unknown as Record<string, ModeState>)[mode] || (NL_MODES.build as unknown as ModeState), o = cu.current;
    // snap to the target mode on the very first frame (so seeks show the right color),
    // then ease between modes during playback
    const k = inited.current ? 0.06 : 1; inited.current = true;
    o.order += (M.order - o.order) * k;
    o.radial += (M.radial - o.radial) * k;
    o.glow += (M.glow - o.glow) * k;
    o.spd += (M.spd - o.spd) * k;
    o.waves = M.waves;
    o.hue = o.hue.map((v, i) => v + (M.hue[i]! - v) * k);
    nlDraw(ctx, W, H, t, o, net.current);
  }, [t, mode]);

  const style: CSSProperties = { position: 'absolute', inset: 0, width: '100%', height: '100%', opacity, pointerEvents: 'none' };
  return <canvas ref={ref} style={style} />;
}

export function NeuralLayer({ opacity = 1, mode }: { opacity?: number; mode?: string }) {
  const t = useTime();
  return <NeuralCanvas t={t} mode={mode || neuralModeForTime(t)} opacity={opacity} />;
}
