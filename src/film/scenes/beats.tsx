// beats.tsx — composite high-energy beats for the Vision Trailer.
// Ported from trailer_scenes.jsx: explicit ES-module imports + TypeScript types,
// no window globals for module wiring. Visuals/geometry/timings unchanged.
// Uses brand (C, FONT, step), fx, and trailer_fx primitives.

import { type CSSProperties, type ReactNode } from "react";
import { C, FONT, clamp } from "../tokens";
import { Easing, step } from "../easing";
import { useTime, useSprite } from "../engine";
import { DiagramSVG, Wire, PulseRing, SignalDots, Rotor, hexOf } from "../fx";
import { Beat, SpeedLines, Shockwave, impactK } from "./trailer_fx";

// Moving-shimmer text style: returns a style object for a sweeping highlight on
// gradient text. Module-private helper (not part of the shared fx surface).
function shimmerTextStyle(lt: number, base: string, hi = '#ffffff', speed = 0.22): CSSProperties {
  const pos = (1 - (((lt * speed) % 1 + 1) % 1)) * 200;
  return {
    backgroundImage: `linear-gradient(100deg, ${base} 0%, ${base} 35%, ${hi} 50%, ${base} 65%, ${base} 100%)`,
    backgroundSize: '220% 100%',
    backgroundPositionX: `${pos}%`,
    WebkitBackgroundClip: 'text', backgroundClip: 'text',
    WebkitTextFillColor: 'transparent', color: 'transparent',
  };
}

// ── Beat 1: cold-open — epic power-up buildup into the unknown ────────────────
export function BeatOpen() {
  const { localTime: lt } = useSprite();
  const grow = step(lt, 0.15, 0.7, Easing.easeOutCubic);
  // charge: energy gathers 0→2.2s, then releases
  const charge = clamp(lt / 2.2, 0, 1);
  const released = lt > 2.2;
  const shock = released ? Math.max(0, 1 - (lt - 2.2) / 0.5) : 0;
  const jit = (released ? Math.sin(lt * 41) * Math.sin(lt * 6.3) * 7 : Math.sin(lt * 30) * 2 * charge);
  const flick = released ? (Math.sin(lt * 23) > -0.82 ? 1 : 0.35) : charge * 0.5;
  const qScale = released ? (0.6 + 0.4 * grow + shock * 0.25) : 0.2 + charge * 0.3;

  return (
    <Beat>
      <DiagramSVG>
        {/* collapsing charge rings that converge on center, then a release ring */}
        {[0, 1, 2, 3].map(i => {
          const ph = (charge + i * 0.25) % 1;
          const r = released ? (240 + (lt - 2.2) * 1400) : (520 * (1 - ph) + 30);
          const op = released ? Math.max(0, 1 - (lt - 2.2) / 0.55) * 0.8 : ph * 0.5 * charge;
          return <circle key={i} cx={960} cy={500} r={r} fill="none"
            stroke={i % 2 ? C.cyan : C.blue} strokeWidth={released ? 3 : 1.6} opacity={op}
            style={{ filter: `drop-shadow(0 0 10px ${i % 2 ? C.cyan : C.blue})` }} />;
        })}
        <PulseRing cx={960} cy={500} lt={lt} period={1.6} maxR={260} minR={40} color={C.dim2} width={1.4} opacity={0.5 * grow} />
        {/* gathering core glow */}
        <circle cx={960} cy={500} r={10 + charge * 26} fill={C.cyanHi}
          opacity={released ? shock : charge * 0.7} style={{ filter: `drop-shadow(0 0 ${20 + charge * 40}px ${C.cyan})` }} />
      </DiagramSVG>

      {/* boot scan line during charge */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 250, textAlign: 'center',
        fontFamily: FONT.mono, fontSize: 18, letterSpacing: '0.5em', color: C.cyan,
        opacity: released ? 0 : charge * 0.8 }}>
        INITIALIZING&nbsp;COGNITIVE&nbsp;RUNTIME
      </div>

      <div style={{ position: 'absolute', left: 960, top: 500, transform: `translate(-50%,-50%) translateX(${jit}px) scale(${qScale})`,
        fontFamily: FONT.display, fontWeight: 800, fontSize: 360, lineHeight: 1, color: C.dim2, opacity: flick * Math.max(grow, charge * 0.4),
        textShadow: `${5 + shock * 18}px 0 rgba(248,80,80,${0.5 + shock * 0.4}), ${-(5 + shock * 18)}px 0 rgba(56,220,255,${0.5 + shock * 0.4})` }}>?</div>

      <div style={{ position: 'absolute', left: 0, right: 0, top: 730, textAlign: 'center',
        fontFamily: FONT.mono, fontSize: 22, letterSpacing: '0.4em', color: C.red, opacity: step(lt, 2.3, 0.5) }}>
        DECISION&nbsp;:&nbsp;UNKNOWN
      </div>
    </Beat>
  );
}

// ── Beat 4: architecture assembly ────────────────────────────────────────────
const TLAYERS: [string, string][] = [['Storage', 'partial'], ['Index', 'partial'], ['Compute', 'partial'], ['Security', 'current'], ['Cluster', 'partial'], ['Transport', 'partial']];

export function BeatArch() {
  const { localTime: lt } = useSprite();
  const T = useTime();
  const pw = 720, px = (1920 - pw) / 2, rowH = 78, gap = 12, n = 6;
  const totalH = n * rowH + (n - 1) * gap, top = (1080 - totalH) / 2 + 40;
  const label = step(lt, 3.2, 0.7, Easing.easeOutBack);
  return (
    <Beat>
      <SpeedLines lt={T} intensity={clamp((lt - 0.2) / 1.4, 0, 1) * 0.7} color={C.blue} />
      {TLAYERS.map((L, i) => {
        const a = step(lt, 0.2 + i * 0.3, 0.5, Easing.easeOutBack);
        const dx = (1 - a) * (i % 2 === 0 ? -760 : 760);
        const c = L[1] === 'current' ? C.green : C.amber;
        return (
          <div key={i} style={{ position: 'absolute', left: px, top: top + i * (rowH + gap), width: pw, height: rowH,
            opacity: clamp(a, 0, 1), transform: `translateX(${dx}px)`,
            borderRadius: 14, border: `1px solid ${C.lineHi}`, background: 'linear-gradient(160deg, rgba(20,20,30,0.96), rgba(8,8,14,0.96))',
            display: 'flex', alignItems: 'center', padding: '0 26px', gap: 16,
            boxShadow: `0 16px 40px rgba(0,0,0,0.5)` }}>
            <span style={{ fontFamily: FONT.mono, fontSize: 14, color: C.dim2, width: 28 }}>{String(i + 1).padStart(2, '0')}</span>
            <span style={{ flex: 1, fontFamily: FONT.display, fontWeight: 700, fontSize: 30, color: C.text }}>{L[0]}</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 12px', borderRadius: 999, border: `1px solid ${c}66`, background: `${c}18` }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: c, boxShadow: `0 0 8px ${c}` }} />
              <span style={{ fontFamily: FONT.mono, fontSize: 12, letterSpacing: '0.12em', color: c }}>{L[1].toUpperCase()}</span>
            </span>
          </div>
        );
      })}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 120, textAlign: 'center', opacity: label,
        transform: `scale(${0.9 + 0.1 * label})`,
        fontFamily: FONT.display, fontWeight: 800, fontSize: 64, letterSpacing: '-0.02em', color: C.text }}>
        WDBX RUNTIME
      </div>
    </Beat>
  );
}

// ── Beat 5: persona reveal (reused 3×) ───────────────────────────────────────
// Each mind reveals with its own cinematic motion signature so the three reads as
// three distinct characters (shared by the trailer, mega-trailer, and explainer):
//   · Abbey → a warm emerald bloom        · Aviva → a sharp violet blade sweep
//   · Abi   → calm cyan concentric rings
type PersonaSig = "bloom" | "blade" | "rings";
function sigForName(name: string): PersonaSig {
  const n = name.toLowerCase();
  if (n.startsWith("aviva")) return "blade";
  if (n.startsWith("abi")) return "rings";
  return "bloom"; // Abbey + fallback
}

// Abbey — a soft glow that blooms outward and settles. Warm, unhurried.
function PersonaBloom({ lt, color }: { lt: number; color: string }) {
  const g = step(lt, 0, 0.66, Easing.easeOutCubic);
  const r = 120 + g * 540;
  return (
    <>
      <circle cx={960} cy={540} r={r} fill={color} opacity={(1 - g) * 0.22} style={{ filter: `blur(46px)` }} />
      <PulseRing cx={960} cy={540} lt={lt} period={2.4} maxR={460} minR={120} color={color} width={2} opacity={0.4 * g} />
      <PulseRing cx={960} cy={540} lt={lt} phase={0.5} period={2.4} maxR={460} minR={120} color={color} width={1.2} opacity={0.26 * g} />
    </>
  );
}

// Aviva — a hard-edged blade of light sweeps across the frame. Sharp, decisive.
function PersonaBlade({ lt, color }: { lt: number; color: string }) {
  const sweep = step(lt, 0.05, 0.5, Easing.easeOutCubic);
  const x = -460 + sweep * 2840;
  const op = Math.sin(Math.PI * clamp(sweep, 0, 1));
  const w = 150, lean = 320;
  const pts = `${x},0 ${x + w},0 ${x + w - lean},1080 ${x - lean},1080`;
  return (
    <>
      <polygon points={pts} fill={color} opacity={op * 0.5} style={{ filter: `drop-shadow(0 0 36px ${color})` }} />
      <line x1={x + w} y1={0} x2={x + w - lean} y2={1080} stroke="#fff" strokeWidth={3} opacity={op * 0.85} />
    </>
  );
}

// Abi — concentric rings ripple outward at an even cadence. Calm, deterministic.
function PersonaRings({ lt, color }: { lt: number; color: string }) {
  return (
    <>
      {[0, 1, 2, 3].map((i) => {
        const ph = step(lt, 0.1 + i * 0.2, 1.5, Easing.easeOutCubic);
        const r = 70 + ph * 540;
        return <circle key={i} cx={960} cy={540} r={r} fill="none" stroke={color} strokeWidth={2}
          opacity={(1 - ph) * 0.5} style={{ filter: `drop-shadow(0 0 10px ${color})` }} />;
      })}
      <circle cx={960} cy={540} r={42} fill={color} opacity={0.3} style={{ filter: `drop-shadow(0 0 32px ${color})` }} />
    </>
  );
}

export function BeatPersona({ name, role, accent }: { name: string; role: string; accent: string }) {
  const { localTime: lt, duration } = useSprite();
  const T = useTime();
  const sig = sigForName(name);
  const slam = step(lt, 0.0, sig === "blade" ? 0.18 : 0.3, Easing.easeOutBack);
  const out = lt > duration - 0.16 ? clamp((lt - (duration - 0.16)) / 0.16, 0, 1) : 0;
  const op = Math.min(clamp(lt / 0.12, 0, 1), 1 - out);
  const scale = (1.4 - 0.4 * slam) + 0.12 * out;
  // chromatic split on the name — stronger for the blade, calmer for the rings.
  const baseO = 2 + 7 * impactK(T, 0.34);
  const o = sig === "blade" ? baseO * 2.4 : sig === "rings" ? baseO * 0.6 : baseO;
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: op }}>
      <DiagramSVG>
        <Shockwave cx={960} cy={540} color={accent} maxR={sig === "rings" ? 620 : 900} rings={sig === "rings" ? 1 : 2} width={sig === "blade" ? 6 : 4} />
        {sig === "bloom" && <PersonaBloom lt={lt} color={accent} />}
        {sig === "blade" && <PersonaBlade lt={lt} color={accent} />}
        {sig === "rings" && <PersonaRings lt={lt} color={accent} />}
      </DiagramSVG>
      {/* ghost letter */}
      <div style={{ position: 'absolute', left: 960, top: 520, transform: 'translate(-50%,-50%)',
        fontFamily: FONT.display, fontWeight: 800, fontSize: 760, lineHeight: 1, color: accent, opacity: 0.1 }}>{name[0]}</div>
      {/* name */}
      <div style={{ position: 'absolute', left: 960, top: 500, transform: `translate(-50%,-50%) scale(${scale})`,
        fontFamily: FONT.display, fontWeight: 800, fontSize: 230, letterSpacing: '-0.03em', color: C.text,
        textShadow: `${o}px 0 rgba(248,80,80,0.6), ${-o}px 0 rgba(56,220,255,0.6)` }}>{name}</div>
      {/* role */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 660, textAlign: 'center', opacity: step(lt, 0.25, 0.3),
        fontFamily: FONT.mono, fontSize: 28, letterSpacing: '0.34em', color: accent, textTransform: 'uppercase' }}>{role}</div>
    </div>
  );
}

// ── Beat 6: verifiable memory (chain snap) ───────────────────────────────────
const TBLOCKS: [string, string][] = [['Abbey', '#60a5fa'], ['Aviva', '#a78bfa'], ['Abi', '#22d3ee'], ['Abbey', '#60a5fa']];
export function BeatMemory() {
  const { localTime: lt } = useSprite();
  const T = useTime();
  const n = 4, bw = 300, gap = 34, totalW = n * bw + (n - 1) * gap, bx = (1920 - totalW) / 2, by = 430, bh = 220;
  const green = lt > 2.6;
  return (
    <Beat>
      <SpeedLines lt={T} intensity={0.4} color={C.cyan} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 200, textAlign: 'center', opacity: step(lt, 0.0, 0.4),
        fontFamily: FONT.mono, fontSize: 22, letterSpacing: '0.34em', color: C.dim }}>SHA-256 LINKED HISTORY</div>
      <DiagramSVG>
        {TBLOCKS.slice(0, -1).map((_, i) => {
          const dr = step(lt, 0.4 + i * 0.4, 0.3);
          const xa = bx + i * (bw + gap) + bw, xb = bx + (i + 1) * (bw + gap);
          const col = green ? C.green : C.lineHi;
          return <g key={i}>
            <Wire x1={xa} y1={by + bh / 2} x2={xb} y2={by + bh / 2} draw={dr} color={col} width={3} />
            <SignalDots x1={xa} y1={by + bh / 2} x2={xb} y2={by + bh / 2} lt={T} count={1} speed={1.1} color={col} r={4} on={dr > 0.9} />
          </g>;
        })}
      </DiagramSVG>
      {TBLOCKS.map((b, i) => {
        const a = step(lt, 0.2 + i * 0.22, 0.4, Easing.easeOutBack);
        const c = green ? C.green : b[1];
        return (
          <div key={i} style={{ position: 'absolute', left: bx + i * (bw + gap), top: by, width: bw, height: bh,
            opacity: clamp(a, 0, 1), transform: `translateY(${(1 - a) * 80}px) scale(${0.9 + 0.1 * a})`,
            borderRadius: 16, border: `1.5px solid ${c}cc`, background: 'linear-gradient(160deg, rgba(20,20,30,0.96), rgba(8,8,14,0.96))',
            boxShadow: green ? `0 0 30px ${C.green}44` : `0 16px 40px rgba(0,0,0,0.5)`, padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: FONT.mono, fontSize: 14, color: C.dim2 }}>block {String(i).padStart(2, '0')}</span>
              <span style={{ fontFamily: FONT.mono, fontSize: 13, color: b[1], border: `1px solid ${b[1]}66`, borderRadius: 6, padding: '2px 8px' }}>{b[0]}</span>
            </div>
            <div style={{ marginTop: 22, fontFamily: FONT.mono, fontSize: 13, color: C.dim2 }}>hash</div>
            <div style={{ fontFamily: FONT.mono, fontSize: 22, color: green ? C.green : b[1] }}>{hexOf(i + 11) + '…'}</div>
            {green && <span style={{ position: 'absolute', right: 16, bottom: 14, color: C.green, fontSize: 24 }}>✓</span>}
          </div>
        );
      })}
    </Beat>
  );
}

// ── Beat 7: governance flash ─────────────────────────────────────────────────
const TPRIN = ['Truth', 'Safety', 'Help', 'Fairness', 'Privacy', 'Transparency'];
export function BeatGovernance() {
  const { localTime: lt } = useSprite();
  const n = 6, cw = 270, gap = 20, totalW = n * cw + (n - 1) * gap, sx = (1920 - totalW) / 2;
  return (
    <Beat>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', opacity: step(lt, 0, 0.3),
        fontFamily: FONT.mono, fontSize: 22, letterSpacing: '0.34em', color: C.dim }}>THE CONSTITUTION</div>
      {TPRIN.map((p, i) => {
        const on = step(lt, 0.2 + i * 0.26, 0.32, Easing.easeOutBack);
        const lit = lt >= 0.2 + i * 0.26 + 0.05;
        return (
          <div key={i} style={{ position: 'absolute', left: sx + i * (cw + gap), top: 470, width: cw, height: 140,
            opacity: clamp(on, 0, 1), transform: `scale(${0.6 + 0.4 * on})`,
            borderRadius: 16, border: `1.5px solid ${lit ? C.green + 'cc' : C.line}`, background: lit ? `${C.green}1a` : 'rgba(255,255,255,0.03)',
            boxShadow: lit ? `0 0 26px ${C.green}44` : 'none',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <span style={{ width: 40, height: 40, borderRadius: '50%', border: `2px solid ${C.green}`, background: lit ? C.green : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#06120c', fontSize: 22 }}>{lit ? '✓' : ''}</span>
            <span style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 24, color: lit ? C.text : C.dim }}>{p}</span>
          </div>
        );
      })}
    </Beat>
  );
}

// ── Beat 8: vision build ─────────────────────────────────────────────────────
const TTIERS = ['CPU', 'GPU', 'NPU', 'TPU'];
export function BeatVision() {
  const { localTime: lt } = useSprite();
  const T = useTime();
  const cx = 960, cy = 560, R = 250;
  const tier = TTIERS.map((t, i) => { const a = -Math.PI / 2 + (i / 4) * Math.PI * 2; return { t, x: cx + Math.cos(a) * R, y: cy + Math.sin(a) * R }; });
  const core = step(lt, 0.3, 0.6, Easing.easeOutBack);
  const ring = step(lt, 0.8, 1.0);
  return (
    <Beat>
      <SpeedLines lt={T} intensity={clamp(lt / 1.2, 0, 1) * 1.0} color={C.purple} />
      {/* giant ghost VISION */}
      <div style={{ position: 'absolute', left: 960, top: 540, transform: 'translate(-50%,-50%)',
        fontFamily: FONT.display, fontWeight: 800, fontSize: 420, letterSpacing: '-0.03em', color: C.purple, opacity: 0.08 * step(lt, 0.2, 0.8) }}>VISION</div>
      <DiagramSVG>
        {tier.map((p, i) => <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke={C.purple} strokeWidth={2} strokeDasharray="4 7" opacity={0.6 * ring} />)}
        {tier.map((p, i) => <SignalDots key={'s' + i} x1={cx} y1={cy} x2={p.x} y2={p.y} lt={T + i * 0.4} count={1} speed={0.7} color={C.purple} r={4} on={ring > 0.5} />)}
        <Rotor cx={cx} cy={cy} lt={T} speed={26}><circle cx={cx} cy={cy} r={195} fill="none" stroke={C.purple} strokeWidth={1.4} strokeDasharray="2 14" opacity={0.6 * core} /></Rotor>
        <Rotor cx={cx} cy={cy} lt={T} speed={-18}><circle cx={cx} cy={cy} r={320} fill="none" stroke={C.purple} strokeWidth={1} strokeDasharray="2 22" opacity={0.4 * ring} /></Rotor>
        <PulseRing cx={cx} cy={cy} lt={T} period={1.4} maxR={150} minR={80} color={C.purple} width={2} opacity={0.6 * core} />
      </DiagramSVG>
      {tier.map((p, i) => {
        const a = step(lt, 0.9 + i * 0.12, 0.4, Easing.easeOutBack);
        return <div key={i} style={{ position: 'absolute', left: p.x, top: p.y, transform: `translate(-50%,-50%) scale(${0.6 + 0.4 * a})`, opacity: clamp(a, 0, 1),
          width: 116, height: 116, borderRadius: '50%', border: `1.5px solid ${C.purple}88`, background: 'rgba(14,12,20,0.95)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT.mono, fontSize: 24, color: C.purple }}>{p.t}</div>;
      })}
      <div style={{ position: 'absolute', left: cx, top: cy, transform: `translate(-50%,-50%) scale(${0.6 + 0.4 * core})`, opacity: clamp(core, 0, 1),
        width: 160, height: 160, borderRadius: '50%', border: `1.5px solid ${C.purple}cc`, background: `radial-gradient(circle, ${C.purple}44, rgba(10,10,16,0.96))`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 60px ${C.purple}66` }}>
        <span style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 34, color: C.text }}>WDBX</span>
        <span style={{ fontFamily: FONT.mono, fontSize: 13, color: C.purple, letterSpacing: '0.18em' }}>FABRIC</span>
      </div>
      {/* honest tag */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 150, display: 'flex', justifyContent: 'center', opacity: step(lt, 0.4, 0.5) }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, padding: '12px 26px', borderRadius: 999, border: `1px solid ${C.purple}88`, background: `${C.purple}1c` }}>
          <span style={{ width: 9, height: 9, borderRadius: '50%', background: C.purple, boxShadow: `0 0 12px ${C.purple}` }} />
          <span style={{ fontFamily: FONT.mono, fontSize: 18, letterSpacing: '0.3em', color: C.purple, whiteSpace: 'nowrap' }}>VISION · ROADMAP</span>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 130, textAlign: 'center', opacity: step(lt, 1.2, 0.6),
        fontFamily: FONT.sans, fontSize: 22, color: C.dim2 }}>proposed direction — not a current capability</div>
    </Beat>
  );
}

// ── Beat 9: big word title drop (shimmer slam) ───────────────────────────────
export function BeatBigWord({ word, size = 360 }: { word: string; size?: number }) {
  const { localTime: lt, duration } = useSprite();
  const T = useTime();
  const slam = step(lt, 0, 0.3, Easing.easeOutBack);
  const out = lt > duration - 0.18 ? clamp((lt - (duration - 0.18)) / 0.18, 0, 1) : 0;
  const op = Math.min(clamp(lt / 0.1, 0, 1), 1 - out);
  const scale = (1.5 - 0.5 * slam) + 0.14 * out;
  return (
    <div style={{ position: 'absolute', left: 960, top: 540, transform: `translate(-50%,-50%) scale(${scale})`, opacity: op,
      fontFamily: FONT.display, fontWeight: 800, fontSize: size, letterSpacing: '-0.04em', lineHeight: 1, whiteSpace: 'nowrap',
      ...shimmerTextStyle(T, C.blueHi, '#ffffff', 0.35) }}>{word}</div>
  );
}

// ── Beat 10: close ───────────────────────────────────────────────────────────
export function BeatClose() {
  const { localTime: lt } = useSprite();
  const T = useTime();
  const tag = step(lt, 0.3, 0.8);
  const prod = step(lt, 1.4, 0.8);
  return (
    <Beat>
      <DiagramSVG>
        <PulseRing cx={960} cy={470} lt={T} period={3} maxR={520} minR={120} color={C.blue} width={1.4} opacity={0.2} />
        <PulseRing cx={960} cy={470} lt={T} phase={0.5} period={3} maxR={520} minR={120} color={C.cyan} width={1.2} opacity={0.16} />
      </DiagramSVG>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 380, textAlign: 'center' }}>
        <div style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 132, letterSpacing: '-0.03em',
          opacity: step(lt, 0, 0.6), ...shimmerTextStyle(T, C.blueHi, '#ffffff', 0.25) }}>MLAI</div>
        <div style={{ marginTop: 26, fontFamily: FONT.display, fontWeight: 500, fontSize: 42, color: C.text, letterSpacing: '-0.01em',
          opacity: tag, transform: `translateY(${(1 - tag) * 12}px)` }}>
          Infrastructure for <span style={{ color: C.cyan }}>resilient intelligence.</span>
        </div>
        <div style={{ marginTop: 40, fontFamily: FONT.mono, fontSize: 20, letterSpacing: '0.34em', color: C.dim,
          opacity: prod, transform: `translateY(${(1 - prod) * 10}px)` }}>
          WDBX&nbsp;&nbsp;·&nbsp;&nbsp;ABBEY&nbsp;&nbsp;·&nbsp;&nbsp;AVIVA&nbsp;&nbsp;·&nbsp;&nbsp;ABI
        </div>
      </div>
    </Beat>
  );
}

// ── Beat: reasoning (lets the neural-net background take the stage) ───────────
export function BeatReason() {
  const { localTime: lt } = useSprite();
  const T = useTime();
  const label = step(lt, 0.2, 0.6);
  const slam = step(lt, 0.5, 0.3, Easing.easeOutBack);
  const chips = ['attention', 'recency', 'causality', 'persona'];
  return (
    <Beat>
      {/* dim scrim so the neural bg reads as the hero */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(60% 60% at 50% 50%, transparent, rgba(4,5,9,0.5))' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 250, textAlign: 'center', opacity: label,
        fontFamily: FONT.mono, fontSize: 22, letterSpacing: '0.36em', color: C.cyan }}>FORWARD PASS</div>
      <div style={{ position: 'absolute', left: 960, top: 540, transform: `translate(-50%,-50%) scale(${0.85 + 0.15 * slam})`, opacity: slam,
        fontFamily: FONT.display, fontWeight: 800, fontSize: 150, letterSpacing: '-0.03em', color: C.text,
        textShadow: `0 0 60px ${C.cyan}55` }}>IT REASONS.</div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 250, display: 'flex', justifyContent: 'center', gap: 18 }}>
        {chips.map((c, i) => {
          const a = step(lt, 1.4 + i * 0.25, 0.4, Easing.easeOutBack);
          const pulse = 0.5 + 0.5 * Math.sin(T * 3 + i);
          return <span key={i} style={{ opacity: clamp(a, 0, 1), transform: `translateY(${(1 - a) * 16}px)`,
            padding: '9px 18px', borderRadius: 999, border: `1px solid ${C.cyan}${pulse > 0.5 ? '88' : '44'}`,
            background: `${C.cyan}${pulse > 0.6 ? '1e' : '10'}`, fontFamily: FONT.mono, fontSize: 17, letterSpacing: '0.1em', color: C.cyanHi }}>{c}</span>;
        })}
      </div>
    </Beat>
  );
}
