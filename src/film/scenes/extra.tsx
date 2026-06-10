// scenes/extra.tsx — additional scenes for the long-form (~4:20) cut.
// Ported from scenes_extra.jsx. Reuses SceneBox + brand + fx primitives.

import { C, FONT } from "../tokens";
import { Easing, step, fade } from "../easing";
import { useSprite } from "../engine";
import { DiagramSVG, Wire, PulseRing, SignalDots, SignalPolyline, Rotor, hexOf } from "../fx";
import { Orb } from "../primitives";
import { SceneTag, StatusBadge } from "../chrome";
import { SceneBox } from "./_shared";
import type { ReactNode } from "react";

// ── Act title card ───────────────────────────────────────────────────────────
export function ActCard({ num, title, accent = C.blueHi }: { num: ReactNode; title: ReactNode; accent?: string }) {
  const { localTime: lt, duration } = useSprite();
  const op = fade(lt, duration, 0.8, 0.7);
  const numIn = step(lt, 0.2, 0.7, Easing.easeOutBack);
  const titleIn = step(lt, 0.6, 0.9);
  const rule = step(lt, 1.1, 1.0);
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: op, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center' }}>
      <Orb x={960} y={540} size={640} color={accent} opacity={0.10} />
      <div style={{ fontFamily: FONT.mono, fontSize: 24, letterSpacing: '0.5em', color: accent,
        opacity: numIn, transform: `translateY(${(1 - numIn) * 10}px)`, paddingLeft: '0.5em' }}>ACT {num}</div>
      <div style={{ width: 380 * rule, height: 1, margin: '34px 0',
        background: `linear-gradient(90deg, transparent, ${C.lineHi}, transparent)` }} />
      <div style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 96, letterSpacing: '-0.02em', color: C.text,
        opacity: titleIn, transform: `translateY(${(1 - titleIn) * 14}px) scale(${0.96 + 0.04 * titleIn})` }}>{title}</div>
    </div>
  );
}

// ── WDBX · Storage — write-ahead log deep zoom ───────────────────────────────
export function SceneStorage() {
  const { localTime: lt } = useSprite();
  const head = step(lt, 0.4, 0.8);
  const badge = step(lt, 0.8, 0.6);
  const cols = 6;
  const fx = 360, fy = 300, fw = 1200, rh = 64, rgap = 12;
  const replay = step(lt, 8.5, 2.5);
  const cap = step(lt, 6.5, 0.8);
  const profiles = ['abbey', 'aviva', 'abi', 'abbey', 'abi', 'aviva'] as const;
  return (
    <SceneBox>
      <SceneTag index="WAL" label="Storage" reveal={head} />
      <StatusBadge kind="partial" x={120} y={150} reveal={badge} />
      <Orb x={960} y={540} size={560} color={C.blue} opacity={0.08} />
      <div style={{ position: 'absolute', left: fx, top: fy - 56, zIndex: 20, opacity: head,
        fontFamily: FONT.mono, fontSize: 16, letterSpacing: '0.22em', color: C.dim2 }}>APPEND-ONLY · CRC32 FRAMED</div>
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const at = 0.8 + i * 0.5;
        const k = step(lt, at, 0.45, Easing.easeOutCubic);
        const verified = replay > i / cols;
        const c = verified ? C.green : C.blueHi;
        const profile = profiles[i]!;
        return (
          <div key={i} style={{ position: 'absolute', left: fx, top: fy + i * (rh + rgap), width: fw, height: rh, zIndex: 14,
            opacity: k, transform: `translateX(${(1 - k) * -30}px)`,
            borderRadius: 12, border: `1px solid ${c}55`, background: `linear-gradient(100deg, ${c}12, rgba(255,255,255,0.02))`,
            display: 'flex', alignItems: 'center', padding: '0 22px', gap: 18 }}>
            <span style={{ fontFamily: FONT.mono, fontSize: 14, color: C.dim2, width: 70 }}>rec {String(i).padStart(2, '0')}</span>
            <span style={{ flex: 1, fontFamily: FONT.mono, fontSize: 17, color: C.dim }}>profile={profile} · vec={hexOf(i + 3, 6)}</span>
            <span style={{ fontFamily: FONT.mono, fontSize: 15, color: c }}>crc:{hexOf(i + 20, 8)}</span>
            <span style={{ fontFamily: FONT.mono, fontSize: 16, color: verified ? C.green : C.dim2, width: 22, textAlign: 'center' }}>{verified ? '✓' : '·'}</span>
          </div>
        );
      })}
      {replay > 0.02 && (
        <div style={{ position: 'absolute', left: fx - 16, top: fy + replay * (cols * (rh + rgap)) - 14, width: fw + 32, zIndex: 16,
          height: 2, background: `linear-gradient(90deg, transparent, ${C.green}, transparent)`, boxShadow: `0 0 14px ${C.green}` }} />
      )}
      <div style={{ position: 'absolute', left: fx, bottom: 150, zIndex: 20, opacity: cap, width: 1200,
        fontFamily: FONT.display, fontWeight: 600, fontSize: 38, color: C.text, letterSpacing: '-0.01em' }}>
        Durable by construction — <span style={{ color: C.green }}>replayed and checksum-verified.</span>
      </div>
    </SceneBox>
  );
}

// ── WDBX · Index — hybrid ranker ─────────────────────────────────────────────
interface RankFactor { k: string; d: string; c: string; }
const RANK_FACTORS: RankFactor[] = [
  { k: 'semantic', d: 'HNSW cosine', c: C.cyan },
  { k: 'temporal', d: 'recency decay', c: C.blueHi },
  { k: 'causal',   d: 'cause proximity', c: C.green },
  { k: 'persona',  d: 'router weight', c: C.purple },
];
export function SceneTemporal() {
  const { localTime: lt } = useSprite();
  const head = step(lt, 0.4, 0.8);
  const badge = step(lt, 0.8, 0.6);
  const formula = step(lt, 1.0, 1.0);
  const cap = step(lt, 9.5, 0.8);
  const bx = 360, by = 380, bw = 560, rh = 96, rgap = 26;
  return (
    <SceneBox>
      <SceneTag index="IDX" label="Hybrid ranking" reveal={head} />
      <StatusBadge kind="partial" x={120} y={150} reveal={badge} />
      <Orb x={1300} y={520} size={560} color={C.purple} opacity={0.08} />
      {/* formula */}
      <div style={{ position: 'absolute', left: 360, top: 250, zIndex: 20, opacity: formula,
        fontFamily: FONT.mono, fontSize: 30, color: C.text, letterSpacing: '0.02em' }}>
        score <span style={{ color: C.dim2 }}>=</span> <span style={{ color: C.cyan }}>semantic</span> <span style={{ color: C.dim2 }}>×</span> <span style={{ color: C.blueHi }}>temporal</span> <span style={{ color: C.dim2 }}>×</span> <span style={{ color: C.green }}>causal</span> <span style={{ color: C.dim2 }}>×</span> <span style={{ color: C.purple }}>persona</span>
      </div>
      {RANK_FACTORS.map((f, i) => {
        const at = 2.0 + i * 0.7;
        const k = step(lt, at, 0.6);
        const base = 0.5 + 0.32 * Math.abs(Math.sin(i * 1.3 + 1));
        const fill = step(lt, at + 0.3, 1.2) * base * (0.9 + 0.1 * Math.sin(lt * 1.8 + i * 1.5));
        return (
          <div key={i} style={{ position: 'absolute', left: bx, top: by + i * (rh + rgap), width: bw, zIndex: 16, opacity: k,
            transform: `perspective(1000px) rotateY(${Math.sin(lt * 0.5 + i * 0.8) * 6}deg)`, transformOrigin: 'left center' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 26, color: f.c }}>{f.k}</span>
              <span style={{ fontFamily: FONT.mono, fontSize: 16, color: C.dim }}>{f.d}</span>
            </div>
            <div style={{ height: 14, borderRadius: 7, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
              <div style={{ width: `${fill * 100}%`, height: '100%', borderRadius: 7, background: f.c, boxShadow: `0 0 ${10 + 10 * Math.abs(Math.sin(lt * 2 + i))}px ${f.c}` }} />
            </div>
          </div>
        );
      })}
      <DiagramSVG>
        {RANK_FACTORS.map((f, i) => (
          <SignalPolyline key={i} pts={[[bx + bw + 10, by + i * (rh + rgap) + 30], [1360, by + i * (rh + rgap) + 30], [1450, 570]]}
            lt={lt + i} count={2} speed={0.7} color={f.c} r={4} />
        ))}
        <Rotor cx={1450} cy={570} lt={lt} speed={22}><circle cx={1450} cy={570} r={94} fill="none" stroke={C.cyan} strokeWidth={1.2} strokeDasharray="3 11" opacity={0.5} /></Rotor>
        <Rotor cx={1450} cy={570} lt={lt} speed={-14}><circle cx={1450} cy={570} r={120} fill="none" stroke={C.cyanHi} strokeWidth={1} strokeDasharray="2 16" opacity={0.3} /></Rotor>
        <PulseRing cx={1450} cy={570} lt={lt} period={1.8} maxR={130} minR={74} color={C.cyan} width={1.6} opacity={0.6} />
      </DiagramSVG>
      <div style={{ position: 'absolute', left: 1380, top: 500, width: 140, height: 140, zIndex: 18, opacity: step(lt, 4, 0.8),
        transform: `scale(${1 + 0.06 * Math.sin(lt * 2.4)})`,
        borderRadius: '50%', border: `1.5px solid ${C.cyanHi}`, background: `radial-gradient(circle, ${C.cyan}33, rgba(10,10,16,0.9))`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT.mono, fontSize: 18, color: C.cyanHi,
        boxShadow: `0 0 40px ${C.cyan}44` }}>rank</div>
      <div style={{ position: 'absolute', left: 360, bottom: 130, zIndex: 20, opacity: cap, width: 1200,
        fontFamily: FONT.display, fontWeight: 600, fontSize: 38, color: C.text, letterSpacing: '-0.01em' }}>
        Memory ranked by <span style={{ color: C.cyan }}>meaning, recency, cause, and persona.</span>
      </div>
    </SceneBox>
  );
}

// ── The minds — persona deep dive ────────────────────────────────────────────
interface DeepPersona { name: string; role: string; traits: string[]; c: string; }
const DEEP_PERSONAS: DeepPersona[] = [
  { name: 'Abbey', role: 'Empathic polymath', traits: ['Structured explanation', 'Safety-oriented review', 'Scaffolding protocol'], c: '#60a5fa' },
  { name: 'Aviva', role: 'Unfiltered expert',  traits: ['Idea generation', 'Alternative perspectives', 'Concise + dense'], c: '#a78bfa' },
  { name: 'Abi',   role: 'Adaptive moderator', traits: ['Intent routing', 'Response blending', 'Action-oriented'], c: '#22d3ee' },
];
export function ScenePersonaDeep() {
  const { localTime: lt } = useSprite();
  const head = step(lt, 0.4, 0.8);
  const badge = step(lt, 0.8, 0.6);
  const cardW = 500, cardH = 460, gap = 40, totalW = 3 * cardW + 2 * gap;
  const left = 960 - totalW / 2, top = 300;
  const blend = step(lt, 11.5, 1.0);
  return (
    <SceneBox>
      <SceneTag index="A·A·A" label="Three minds" reveal={head} />
      <StatusBadge kind="current" x={120} y={150} reveal={badge} />
      {DEEP_PERSONAS.map((p, i) => {
        const at = 1.0 + i * 0.6;
        const k = step(lt, at, 0.7, Easing.easeOutCubic);
        return (
          <div key={i} style={{ position: 'absolute', left: left + i * (cardW + gap), top, width: cardW, height: cardH, zIndex: 14,
            opacity: k, transform: `translateY(${(1 - k) * 36}px)`,
            borderRadius: 22, border: `1px solid ${p.c}55`, background: `linear-gradient(160deg, ${p.c}16, rgba(10,10,16,0.92))`,
            boxShadow: `0 30px 80px rgba(0,0,0,0.5), inset 0 0 40px ${p.c}0f`, padding: '40px 36px' }}>
            <div style={{ width: 88, height: 88, borderRadius: 22, background: `${p.c}26`, border: `1px solid ${p.c}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT.display, fontWeight: 800, fontSize: 46, color: p.c,
              marginBottom: 28, boxShadow: `0 0 30px ${p.c}44` }}>{p.name[0]}</div>
            <div style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 44, color: C.text }}>{p.name}</div>
            <div style={{ fontFamily: FONT.mono, fontSize: 17, color: p.c, letterSpacing: '0.06em', marginTop: 6, marginBottom: 26 }}>{p.role}</div>
            {p.traits.map((tr, j) => {
              const tk = step(lt, at + 0.4 + j * 0.2, 0.5);
              return <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, opacity: tk }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: p.c, boxShadow: `0 0 8px ${p.c}` }} />
                <span style={{ fontFamily: FONT.sans, fontSize: 21, color: C.dim }}>{tr}</span>
              </div>;
            })}
          </div>
        );
      })}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 130, textAlign: 'center', zIndex: 20, opacity: blend,
        fontFamily: FONT.mono, fontSize: 26, color: C.dim }}>
        R<span style={{ fontSize: 18 }}>final</span> = <span style={{ color: '#60a5fa' }}>α·Abbey</span> + <span style={{ color: '#a78bfa' }}>(1−α)·Aviva</span> — <span style={{ color: '#22d3ee' }}>moderated by Abi</span>
      </div>
    </SceneBox>
  );
}

// ── Claims discipline ────────────────────────────────────────────────────────
interface ClaimCol { t: string; c: string; items: string[]; }
const CLAIM_COLS: ClaimCol[] = [
  { t: 'CURRENT', c: C.green, items: ['SHA-256 chain', 'HNSW · SIMD search', 'Persona routing', 'Constitution'] },
  { t: 'PARTIAL', c: C.amber, items: ['WAL + snapshots', 'Temporal ranker', 'GPU fallback', 'In-process Raft'] },
  { t: 'PROPOSED', c: C.purple, items: ['Multi-host cluster', 'NPU / TPU dispatch', 'Neural compression', 'Homomorphic query'] },
];
export function SceneClaims() {
  const { localTime: lt } = useSprite();
  const head = step(lt, 0.4, 0.8);
  const colW = 460, gap = 50, totalW = 3 * colW + 2 * gap, left = 960 - totalW / 2, top = 320;
  const cap = step(lt, 9.0, 0.9);
  return (
    <SceneBox>
      <SceneTag index="00" label="Claims discipline" reveal={head} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 170, textAlign: 'center', zIndex: 20, opacity: head,
        fontFamily: FONT.display, fontWeight: 600, fontSize: 44, color: C.text, letterSpacing: '-0.01em' }}>
        We publish only what the source can prove.
      </div>
      {CLAIM_COLS.map((col, i) => {
        const at = 1.2 + i * 0.8;
        const k = step(lt, at, 0.6);
        return (
          <div key={i} style={{ position: 'absolute', left: left + i * (colW + gap), top, width: colW, zIndex: 14, opacity: k,
            transform: `translateY(${(1 - k) * 24}px)` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: col.c, boxShadow: `0 0 10px ${col.c}` }} />
              <span style={{ fontFamily: FONT.mono, fontSize: 20, letterSpacing: '0.18em', color: col.c }}>{col.t}</span>
            </div>
            {col.items.map((it, j) => {
              const ik = step(lt, at + 0.4 + j * 0.18, 0.5);
              return <div key={j} style={{ opacity: ik, marginBottom: 14, padding: '16px 20px', borderRadius: 12,
                border: `1px solid ${col.c}33`, background: `${col.c}0d`, fontFamily: FONT.sans, fontWeight: 500, fontSize: 22, color: C.text }}>{it}</div>;
            })}
          </div>
        );
      })}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 110, textAlign: 'center', zIndex: 20, opacity: cap,
        fontFamily: FONT.mono, fontSize: 20, letterSpacing: '0.06em', color: C.dim }}>
        Proposed work is labeled proposed — <span style={{ color: C.purple }}>never shipped as fact.</span>
      </div>
    </SceneBox>
  );
}

// ── Roadmap timeline ─────────────────────────────────────────────────────────
interface Phase { n: string; t: string; s: string; c: string; }
const PHASES: Phase[] = [
  { n: '1', t: 'Single-node runtime', s: 'in progress', c: C.green },
  { n: '2', t: 'Multi-node cluster', s: 'proposed', c: C.purple },
  { n: '3', t: 'Neural compression', s: 'proposed', c: C.purple },
  { n: '4', t: 'Homomorphic query', s: 'research', c: C.purple },
  { n: '5', t: 'Self-optimizing planner', s: 'proposed', c: C.purple },
  { n: '6', t: 'Cognitive fabric', s: 'north-star', c: C.purple },
];
export function SceneRoadmap() {
  const { localTime: lt } = useSprite();
  const head = step(lt, 0.4, 0.8);
  const lineY = 560, x0 = 220, x1 = 1700, span = x1 - x0;
  const draw = step(lt, 1.0, 2.0);
  const cap = step(lt, 11, 0.8);
  return (
    <SceneBox>
      <SceneTag index="MAP" label="Phased roadmap" reveal={head} />
      <Orb x={1100} y={560} size={620} color={C.purple} opacity={0.08} />
      <DiagramSVG>
        <Wire x1={x0} y1={lineY} x2={x1} y2={lineY} draw={draw} color={C.lineHi} width={2} />
        <SignalDots x1={x0} y1={lineY} x2={x1} y2={lineY} lt={lt} count={2} speed={0.3} color={C.purple} r={4} on={draw > 0.95} />
      </DiagramSVG>
      {PHASES.map((p, i) => {
        const px = x0 + (span * i) / (PHASES.length - 1);
        const at = 1.4 + i * 0.7;
        const k = step(lt, at, 0.6, Easing.easeOutBack);
        const up = i % 2 === 0;
        const cur = i === 0;
        return (
          <div key={i}>
            <div style={{ position: 'absolute', left: px - 13, top: lineY - 13, width: 26, height: 26, zIndex: 16,
              borderRadius: '50%', background: cur ? p.c : 'rgba(14,12,20,0.95)', border: `2px solid ${p.c}`,
              transform: `scale(${k})`, boxShadow: cur ? `0 0 22px ${p.c}` : 'none' }} />
            <div style={{ position: 'absolute', left: px - 150, top: up ? lineY - 150 : lineY + 40, width: 300, textAlign: 'center', zIndex: 14,
              opacity: k, transform: `translateY(${(1 - k) * (up ? -14 : 14)}px)` }}>
              <div style={{ fontFamily: FONT.mono, fontSize: 14, letterSpacing: '0.16em', color: p.c, marginBottom: 8 }}>PHASE {p.n} · {p.s.toUpperCase()}</div>
              <div style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 26, color: C.text, lineHeight: 1.15 }}>{p.t}</div>
            </div>
          </div>
        );
      })}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 90, textAlign: 'center', zIndex: 20, opacity: cap,
        fontFamily: FONT.mono, fontSize: 19, letterSpacing: '0.06em', color: C.dim }}>
        Phase 1 is real and tested. Everything beyond it is <span style={{ color: C.purple }}>the plan.</span>
      </div>
    </SceneBox>
  );
}

// ── Manifesto ────────────────────────────────────────────────────────────────
type ManifestoLine = [string, string, string];
const MANIFESTO: ManifestoLine[] = [
  ['Memory you can', 'verify.', C.green],
  ['Reasoning you can', 'route.', C.cyan],
  ['Limits you can', 'enforce.', C.blueHi],
  ['Intelligence that stays', 'resilient.', C.purple],
];
export function SceneManifesto() {
  const { localTime: lt } = useSprite();
  return (
    <SceneBox>
      <Orb x={960} y={540} size={680} color={C.blue} opacity={0.10} />
      <DiagramSVG>
        <PulseRing cx={960} cy={540} lt={lt} period={3} maxR={520} minR={120} color={C.blue} width={1.4} opacity={0.2} />
      </DiagramSVG>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 18 }}>
        {MANIFESTO.map((m, i) => {
          const at = 0.6 + i * 2.2;
          const k = step(lt, at, 0.9, Easing.easeOutCubic);
          const out = i < MANIFESTO.length - 1 ? step(lt, at + 6.5, 0.8) : 0;
          const op = k * (1 - out * 0.0); // keep all visible, stack
          void op; // declared in source but unused; preserved for fidelity
          const [m0, m1, m2] = m;
          return (
            <div key={i} style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 58, letterSpacing: '-0.02em',
              opacity: k, transform: `translateY(${(1 - k) * 18}px)`, color: C.text }}>
              {m0} <span style={{ color: m2 }}>{m1}</span>
            </div>
          );
        })}
      </div>
    </SceneBox>
  );
}
