// primitives.tsx — ambient brand layers. Imports the token root.
// Depended on by fx.tsx and scenes.

import { C } from "./tokens";

const GRAIN_URL =
  "data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E";

export function Grain() {
  return (
    <div
      style={{
        position: "absolute", inset: 0, opacity: 0.04, zIndex: 60,
        backgroundImage: `url("${GRAIN_URL}")`, mixBlendMode: "overlay", pointerEvents: "none",
      }}
    />
  );
}

export function Vignette() {
  return (
    <div
      style={{
        position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
        background: "radial-gradient(120% 90% at 50% 42%, transparent 40%, rgba(0,0,0,0.55) 100%)",
      }}
    />
  );
}

export function GridBG({ opacity = 1 }: { opacity?: number }) {
  return (
    <div
      style={{
        position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none", opacity,
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px)," +
          "linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
        backgroundSize: "64px 64px",
        maskImage: "radial-gradient(110% 100% at 50% 45%, #000 35%, transparent 78%)",
        WebkitMaskImage: "radial-gradient(110% 100% at 50% 45%, #000 35%, transparent 78%)",
      }}
    />
  );
}

export function Orb({ x, y, size, color, opacity = 0.18 }: {
  x: number; y: number; size: number; color: string; opacity?: number;
}) {
  return (
    <div
      style={{
        position: "absolute", left: x, top: y, width: size, height: size,
        marginLeft: -size / 2, marginTop: -size / 2, borderRadius: "50%",
        background: color, filter: "blur(120px)", opacity, zIndex: 0, pointerEvents: "none",
      }}
    />
  );
}

export { C };
