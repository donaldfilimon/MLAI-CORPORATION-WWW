// chrome.tsx — scene chrome: the top-left scene tag, the claims-discipline status
// badge, and the flow-diagram node. Imports tokens.

import { C, FONT } from "./tokens";

export function SceneTag({ index, label, reveal = 1 }: { index: string; label: string; reveal?: number }) {
  return (
    <div style={{ position: "absolute", left: 120, top: 96, zIndex: 20, opacity: reveal,
      transform: `translateY(${(1 - reveal) * 10}px)`, display: "flex", alignItems: "baseline", gap: 18 }}>
      <span style={{ fontFamily: FONT.mono, fontSize: 18, color: C.blueHi, letterSpacing: "0.18em" }}>{index}</span>
      <span style={{ width: 46, height: 1, background: C.lineHi, transform: "translateY(-6px)", display: "inline-block" }} />
      <span style={{ fontFamily: FONT.mono, fontSize: 18, color: C.dim, letterSpacing: "0.32em", textTransform: "uppercase" }}>{label}</span>
    </div>
  );
}

type StatusKind = "current" | "partial" | "vision";
export function StatusBadge({ kind = "current", x, y, scale = 1, reveal = 1, note }: {
  kind?: StatusKind; x: number; y: number; scale?: number; reveal?: number; note?: string;
}) {
  const map: Record<StatusKind, { c: string; t: string }> = {
    current: { c: C.green, t: "CURRENT" },
    partial: { c: C.amber, t: "PARTIAL" },
    vision: { c: C.violet, t: "VISION · ROADMAP" },
  };
  const m = map[kind];
  return (
    <div style={{ position: "absolute", left: x, top: y, zIndex: 22, transform: `scale(${scale})`, transformOrigin: "left center",
      opacity: reveal, display: "inline-flex", alignItems: "center", gap: 9, padding: "7px 14px", borderRadius: 999,
      border: `1px solid ${m.c}55`, background: `${m.c}14`, fontFamily: FONT.mono, fontSize: 14, letterSpacing: "0.16em", color: m.c, whiteSpace: "nowrap" }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: m.c, boxShadow: `0 0 10px ${m.c}` }} />
      {m.t}{note ? <span style={{ color: C.dim2, letterSpacing: "0.08em" }}>· {note}</span> : null}
    </div>
  );
}

export function FlowNode({ x, y, w, h, reveal, title, subtitle, accent, titleSize = 26 }: {
  x: number; y: number; w: number; h: number; reveal: number; title: string; subtitle: string; accent: string; titleSize?: number;
}) {
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, zIndex: 14, opacity: reveal,
      transform: `scale(${0.85 + 0.15 * reveal})`, transformOrigin: "center", borderRadius: 14,
      border: `1px solid ${accent}66`, background: `linear-gradient(160deg, ${accent}1a, rgba(10,10,16,0.9))`,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4,
      boxShadow: `0 18px 50px rgba(0,0,0,0.5), inset 0 0 24px ${accent}10` }}>
      <span style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: titleSize, color: C.text, whiteSpace: "nowrap", lineHeight: 1 }}>{title}</span>
      <span style={{ fontFamily: FONT.mono, fontSize: 13, color: accent, letterSpacing: "0.1em", whiteSpace: "nowrap" }}>{subtitle}</span>
    </div>
  );
}
