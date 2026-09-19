// fx.tsx — animated diagram/motion primitives. Imports tokens + easing.
// Depended on by the scene modules.

import { C, clamp } from "./tokens";
import type { ReactNode } from "react";

export function DiagramSVG({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible", zIndex: 10 }}>
      {children}
    </svg>
  );
}

// Animated straight wire. `draw` 0..1 reveals start→end.
export function Wire({ x1, y1, x2, y2, draw = 1, color = C.line, width = 2, dashed = false, glow = false }: {
  x1: number; y1: number; x2: number; y2: number; draw?: number; color?: string; width?: number; dashed?: boolean; glow?: boolean;
}) {
  const len = Math.hypot(x2 - x1, y2 - y1);
  return (
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={width} strokeLinecap="round"
      strokeDasharray={dashed ? "2 9" : len} strokeDashoffset={dashed ? 0 : len * (1 - clamp(draw))}
      style={glow ? { filter: `drop-shadow(0 0 6px ${color})` } : undefined} />
  );
}

// Expanding pulse ring; loops every `period`.
export function PulseRing({ cx, cy, color = C.cyan, period = 2.2, maxR = 70, minR = 6, width = 2, lt = 0, phase = 0, opacity = 0.6 }: {
  cx: number; cy: number; color?: string; period?: number; maxR?: number; minR?: number; width?: number; lt?: number; phase?: number; opacity?: number;
}) {
  const p = (((lt / period) + phase) % 1 + 1) % 1;
  const r = minR + p * (maxR - minR);
  return <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={width} opacity={(1 - p) * opacity}
    style={{ filter: `drop-shadow(0 0 6px ${color})` }} />;
}

// Dots travelling along a straight segment, looping.
export function SignalDots({ x1, y1, x2, y2, lt = 0, count = 2, speed = 0.5, color = C.cyan, r = 4, on = true }: {
  x1: number; y1: number; x2: number; y2: number; lt?: number; count?: number; speed?: number; color?: string; r?: number; on?: boolean;
}) {
  if (!on) return null;
  const out: ReactNode[] = [];
  for (let i = 0; i < count; i++) {
    const t = (((lt * speed) + i / count) % 1 + 1) % 1;
    const x = x1 + (x2 - x1) * t, y = y1 + (y2 - y1) * t;
    out.push(<circle key={i} cx={x} cy={y} r={r} fill={color} opacity={0.25 + 0.7 * Math.sin(Math.PI * t)}
      style={{ filter: `drop-shadow(0 0 7px ${color})` }} />);
  }
  return <g>{out}</g>;
}

// Deterministic fake hex (SHA-256 chain visuals).
export function hexOf(seed: number, n = 10): string {
  const ch = "0123456789abcdef";
  let s = "", x = (seed * 2654435761) >>> 0;
  for (let i = 0; i < n; i++) { x = (x * 1103515245 + 12345) >>> 0; s += ch[(x >>> 8) & 15]; }
  return s;
}

// Rotating SVG group — wrap children, rotate around (cx,cy) over time.
export function Rotor({ cx, cy, lt = 0, speed = 6, children }: {
  cx: number; cy: number; lt?: number; speed?: number; children: ReactNode;
}) {
  return <g transform={`rotate(${(lt * speed) % 360} ${cx} ${cy})`}>{children}</g>;
}

type Pt = [number, number];

// Elbow / polyline wire, drawn with a stroke-dash reveal (draw 0..1).
export function Elbow({ pts, draw = 1, color = C.line, width = 2 }: {
  pts: Pt[]; draw?: number; color?: string; width?: number;
}) {
  let total = 0;
  for (let i = 1; i < pts.length; i++) { const a = pts[i]!, b = pts[i - 1]!; total += Math.hypot(a[0] - b[0], a[1] - b[1]); }
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0]} ${p[1]}`).join(" ");
  return <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round"
    strokeDasharray={total} strokeDashoffset={total * (1 - clamp(draw, 0, 1))} />;
}

// Dots travelling along an arbitrary polyline, looping.
export function SignalPolyline({ pts, lt = 0, count = 2, speed = 0.4, color = C.cyan, r = 4 }: {
  pts: Pt[]; lt?: number; count?: number; speed?: number; color?: string; r?: number;
}) {
  let total = 0; const seg: number[] = [];
  for (let i = 1; i < pts.length; i++) { const a = pts[i]!, b = pts[i - 1]!; const l = Math.hypot(a[0] - b[0], a[1] - b[1]); seg.push(l); total += l; }
  const at = (t: number): Pt => {
    let d = t * total;
    for (let i = 0; i < seg.length; i++) {
      const sl = seg[i]!;
      if (d <= sl) { const u = sl === 0 ? 0 : d / sl; const a = pts[i]!, b = pts[i + 1]!; return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u]; }
      d -= sl;
    }
    return pts[pts.length - 1]!;
  };
  const out: ReactNode[] = [];
  for (let i = 0; i < count; i++) {
    const t = (((lt * speed) + i / count) % 1 + 1) % 1;
    const [x, y] = at(t);
    out.push(<circle key={i} cx={x} cy={y} r={r} fill={color} opacity={0.25 + 0.7 * Math.sin(Math.PI * t)} style={{ filter: `drop-shadow(0 0 7px ${color})` }} />);
  }
  return <g>{out}</g>;
}
