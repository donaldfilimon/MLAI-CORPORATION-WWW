// tokens.ts — MLAI brand tokens (the dependency root). No imports; everything
// else in the graph imports from here. Values mirror the MLAI Design System:
// near-black base, electric cyan→blue→violet spectrum, persona colors.

export const C = {
  bg: "#040406",
  bg2: "#0a0a12",
  surface: "#0e0f18",
  surfaceHi: "#161721",
  line: "rgba(255,255,255,0.09)",
  lineHi: "rgba(255,255,255,0.18)",
  // electric spectrum
  blue: "#3b82f6",
  blueLo: "#1d4ed8",
  blueHi: "#7cb0ff",
  cyan: "#22d3ee",
  cyanHi: "#7fecff",
  violet: "#a855f7",
  violetHi: "#c4b5fd",
  // persona + semantic
  green: "#34d399", // Abbey
  purple: "#a855f7", // Aviva
  amber: "#fbbf24",
  red: "#f87171",
  // ink
  text: "#fafafa",
  dim: "#b6b6c0",
  dim2: "#86868f",
} as const;

export type Palette = typeof C;

export const FONT = {
  display: "'Outfit', sans-serif",
  sans: "'Inter', system-ui, sans-serif",
  mono: "'JetBrains Mono', ui-monospace, monospace",
} as const;

// persona registry — single source of truth for the three minds
export const PERSONAS = {
  abbey: { name: "Abbey", role: "proof · verified", color: C.green },
  aviva: { name: "Aviva", role: "research · vision", color: C.violet },
  abi: { name: "Abi", role: "interactive · fast", color: C.cyan },
} as const;

export type PersonaKey = keyof typeof PERSONAS;

// small math helpers used across the graph
export const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
