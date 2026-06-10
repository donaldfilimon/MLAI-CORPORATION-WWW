// math.tsx — Aviva's deep-math act (~6 min). Ported from scenes_math.jsx.
// Data-driven MathScene + animated motifs. Aviva accent = purple/cyan.
// Math reflects ABI/WDBX architecture (cosine, HNSW, hybrid rank, SHA-256, WAL/CRC,
// int8 quant, additive HE, Raft, persona loss-blend) — design, not benchmark claims.

import type { ReactNode } from "react";
import { C, FONT } from "../tokens";
import { Easing, step } from "../easing";
import { useSprite } from "../engine";
import { PulseRing, Rotor, hexOf } from "../fx";
import { Orb } from "../primitives";
import { SceneTag, StatusBadge } from "../chrome";
import { SceneBox } from "./_shared";

const AV = "#a78bfa";
const AVC = "#22d3ee";

// little formula helpers
function Sub({ children }: { children: ReactNode }) {
  return <sub style={{ fontSize: "0.62em", opacity: 0.85 }}>{children}</sub>;
}
function Sup({ children }: { children: ReactNode }) {
  return <sup style={{ fontSize: "0.62em", opacity: 0.85 }}>{children}</sup>;
}
function Tok({ c, children }: { c: string; children: ReactNode }) {
  return <span style={{ color: c }}>{children}</span>;
}

// ── Motifs (always animating) ────────────────────────────────────────────────
type MotifProps = { lt: number; color?: string };
type Pt = [number, number];

function MotifVectors({ lt }: MotifProps) {
  const cx = 260, cy = 260, R = 180;
  const a = -0.5 + Math.sin(lt * 0.5) * 0.5;
  const b = a + 1.0 + Math.sin(lt * 0.33) * 0.6;
  const A: Pt = [cx + Math.cos(a) * R, cy + Math.sin(a) * R];
  const B: Pt = [cx + Math.cos(b) * R, cy + Math.sin(b) * R];
  const cosv = Math.cos(b - a);
  return (
    <svg viewBox="0 0 520 520" style={{ width: "100%", height: "100%", overflow: "visible" }}>
      <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(255,255,255,0.08)" />
      <path d={`M ${cx} ${cy} L ${A[0]} ${A[1]}`} stroke={AVC} strokeWidth={3} />
      <path d={`M ${cx} ${cy} L ${B[0]} ${B[1]}`} stroke={AV} strokeWidth={3} />
      <circle cx={A[0]} cy={A[1]} r={6} fill={AVC} style={{ filter: `drop-shadow(0 0 8px ${AVC})` }} />
      <circle cx={B[0]} cy={B[1]} r={6} fill={AV} style={{ filter: `drop-shadow(0 0 8px ${AV})` }} />
      <circle cx={cx} cy={cy} r={4} fill="#fff" />
      <text x={cx} y={cy + 240} textAnchor="middle" fill={cosv > 0.4 ? C.green : cosv > -0.1 ? C.amber : C.red}
        style={{ font: "600 38px JetBrains Mono, monospace" }}>cos θ = {cosv.toFixed(3)}</text>
    </svg>
  );
}

function MotifGraph({ lt }: MotifProps) {
  // 3 HNSW layers, greedy descent dot
  const layers: Pt[][] = [
    [[120, 120], [260, 90], [400, 140]],
    [[100, 250], [230, 230], [360, 260], [440, 240]],
    [[90, 400], [200, 390], [300, 410], [400, 395], [460, 380]],
  ];
  const path: Pt[] = [[260, 90], [230, 230], [300, 410]];
  const t = (lt * 0.4) % 1;
  const seg = Math.min(1, t * 2);
  const idx = t < 0.5 ? 0 : 1;
  const p0 = path[idx]!;
  const p1 = path[idx + 1] ?? p0;
  const lp = t < 0.5 ? seg : (t - 0.5) * 2;
  const dot: Pt = [p0[0] + (p1[0] - p0[0]) * lp, p0[1] + (p1[1] - p0[1]) * lp];
  return (
    <svg viewBox="0 0 520 520" style={{ width: "100%", height: "100%", overflow: "visible" }}>
      {layers.map((L, li) => L.map((n, ni) => {
        const next = layers[li]![ni + 1];
        return next
          ? <line key={`e${li}-${ni}`} x1={n[0]} y1={n[1]} x2={next[0]} y2={next[1]} stroke="rgba(167,139,250,0.25)" strokeWidth={1.4} />
          : null;
      }))}
      {path.slice(0, -1).map((p, i) => {
        const nx = path[i + 1]!;
        return <line key={i} x1={p[0]} y1={p[1]} x2={nx[0]} y2={nx[1]} stroke={AVC} strokeWidth={2.2} opacity={0.7} />;
      })}
      {layers.map((L, li) => L.map((n, ni) => (
        <circle key={`n${li}-${ni}`} cx={n[0]} cy={n[1]} r={li === 0 ? 7 : 5} fill={AV} opacity={0.5 + 0.3 * Math.sin(lt * 2 + li + ni)} />
      )))}
      <circle cx={dot[0]} cy={dot[1]} r={9} fill={AVC} style={{ filter: `drop-shadow(0 0 12px ${AVC})` }} />
      {[0, 1, 2].map((i) => (
        <text key={i} x={20} y={130 + i * 130} fill={C.dim2} style={{ font: "500 18px JetBrains Mono, monospace" }}>L{2 - i}</text>
      ))}
    </svg>
  );
}

function MotifCurve({ lt }: MotifProps) {
  const draw = (lt * 0.3) % 1;
  const pts: Pt[] = [];
  for (let i = 0; i <= 60; i++) {
    const x = i / 60;
    const y = Math.exp(-3.0 * x);
    pts.push([40 + x * 440, 420 - y * 360]);
  }
  const shown = Math.floor(pts.length * Math.min(1, draw * 2 + 0.3));
  const d = pts.slice(0, shown).map((p, i) => `${i ? "L" : "M"}${p[0]} ${p[1]}`).join(" ");
  const last = pts[shown - 1];
  return (
    <svg viewBox="0 0 520 520" style={{ width: "100%", height: "100%", overflow: "visible" }}>
      <line x1={40} y1={420} x2={500} y2={420} stroke="rgba(255,255,255,0.12)" />
      <line x1={40} y1={60} x2={40} y2={420} stroke="rgba(255,255,255,0.12)" />
      <path d={d} fill="none" stroke={AVC} strokeWidth={3} style={{ filter: `drop-shadow(0 0 8px ${AVC})` }} />
      {shown > 2 && last && <circle cx={last[0]} cy={last[1]} r={6} fill={AV} />}
      <text x={300} y={150} fill={C.dim} style={{ font: "500 24px JetBrains Mono, monospace" }}>e<tspan dy="-10" fontSize="16">−λΔt</tspan></text>
      <text x={420} y={448} fill={C.dim2} style={{ font: "400 16px JetBrains Mono, monospace" }}>Δt →</text>
    </svg>
  );
}

function MotifChain({ lt }: MotifProps) {
  return (
    <svg viewBox="0 0 520 520" style={{ width: "100%", height: "100%", overflow: "visible" }}>
      {[0, 1, 2].map((i) => {
        const y = 90 + i * 140;
        return (
          <g key={i}>
            {i < 2 && <line x1={260} y1={y + 80} x2={260} y2={y + 140} stroke={AVC} strokeWidth={2} opacity={0.6 + 0.4 * Math.sin(lt * 3 + i)} />}
            <rect x={150} y={y} width={220} height={80} rx={12} fill="rgba(167,139,250,0.1)" stroke={AV} strokeWidth={1.5} />
            <text x={170} y={y + 32} fill={C.dim2} style={{ font: "400 15px JetBrains Mono, monospace" }}>block {String(i).padStart(2, "0")}</text>
            <text x={170} y={y + 58} fill={AVC} style={{ font: "500 18px JetBrains Mono, monospace" }}>{hexOf(i + 11, 10)}…</text>
          </g>
        );
      })}
    </svg>
  );
}

function MotifBlend({ lt }: MotifProps) {
  const a = 0.5 + 0.4 * Math.sin(lt * 0.6);
  return (
    <svg viewBox="0 0 520 520" style={{ width: "100%", height: "100%", overflow: "visible" }}>
      <circle cx={180} cy={200} r={90 + a * 30} fill="#60a5fa" opacity={0.35 + a * 0.3} style={{ filter: "blur(2px)" }} />
      <circle cx={340} cy={200} r={90 + (1 - a) * 30} fill={AV} opacity={0.35 + (1 - a) * 0.3} style={{ filter: "blur(2px)" }} />
      <circle cx={260} cy={350} r={70} fill="none" stroke={AVC} strokeWidth={2} opacity={0.7} />
      <text x={260} y={358} textAnchor="middle" fill={AVC} style={{ font: "700 26px Outfit, sans-serif" }}>Abi</text>
      <text x={260} y={460} textAnchor="middle" fill={C.text} style={{ font: "500 30px JetBrains Mono, monospace" }}>α = {a.toFixed(2)}</text>
    </svg>
  );
}

function MotifOrbit({ lt, color = AV }: MotifProps) {
  return (
    <svg viewBox="0 0 520 520" style={{ width: "100%", height: "100%", overflow: "visible" }}>
      <Rotor cx={260} cy={260} lt={lt} speed={20}><circle cx={260} cy={260} r={150} fill="none" stroke={color} strokeWidth={1.4} strokeDasharray="3 12" opacity={0.5} /></Rotor>
      <Rotor cx={260} cy={260} lt={lt} speed={-13}><circle cx={260} cy={260} r={200} fill="none" stroke={AVC} strokeWidth={1} strokeDasharray="2 18" opacity={0.35} /></Rotor>
      <PulseRing cx={260} cy={260} lt={lt} period={2} maxR={150} minR={60} color={color} width={1.6} opacity={0.6} />
      <circle cx={260} cy={260} r={56} fill={`${color}22`} stroke={color} strokeWidth={1.5} />
    </svg>
  );
}

const MOTIFS: Record<string, (props: MotifProps) => ReactNode> = {
  vectors: MotifVectors,
  graph: MotifGraph,
  curve: MotifCurve,
  chain: MotifChain,
  blend: MotifBlend,
  orbit: MotifOrbit,
};

// ── Math act data ─────────────────────────────────────────────────────────────
interface MathEq {
  tex: ReactNode;
  note?: string;
}

export interface MathDef {
  idx: string;
  label: string;
  badge?: "current" | "partial" | "vision";
  note?: string;
  title: string;
  motif: string;
  eqs: MathEq[];
  bullets: string[];
}

// ── MathScene (data-driven) ──────────────────────────────────────────────────
export function MathScene({ d }: { d: MathDef }) {
  const { localTime: lt } = useSprite();
  const head = step(lt, 0.4, 0.8);
  const badge = step(lt, 0.8, 0.6);
  const titleIn = step(lt, 0.6, 0.8);
  const Motif = MOTIFS[d.motif] ?? MotifOrbit;
  return (
    <SceneBox>
      <SceneTag index={d.idx} label={d.label} reveal={head} />
      {d.badge && <StatusBadge kind={d.badge} x={120} y={150} reveal={badge} note={d.note} />}
      <Orb x={1340} y={520} size={620} color={AV} opacity={0.09} />

      {/* left: title + equations + bullets */}
      <div style={{ position: "absolute", left: 130, top: 250, width: 1000, zIndex: 20 }}>
        <div style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 60, letterSpacing: "-0.02em", color: C.text,
          opacity: titleIn, transform: `translateY(${(1 - titleIn) * 14}px)` }}>{d.title}</div>

        <div style={{ marginTop: 36, display: "flex", flexDirection: "column", gap: 18 }}>
          {d.eqs.map((eq, i) => {
            const k = step(lt, 1.4 + i * 0.7, 0.7, Easing.easeOutCubic);
            return (
              <div key={i} style={{ opacity: k, transform: `translateX(${(1 - k) * -22}px)`,
                borderRadius: 14, border: `1px solid ${AV}44`, background: "rgba(167,139,250,0.06)", padding: "20px 26px" }}>
                <div style={{ fontFamily: FONT.mono, fontSize: 32, color: C.text, lineHeight: 1.3 }}>{eq.tex}</div>
                {eq.note && <div style={{ fontFamily: FONT.sans, fontSize: 18, color: C.dim, marginTop: 10 }}>{eq.note}</div>}
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 30, display: "flex", flexDirection: "column", gap: 14 }}>
          {d.bullets.map((b, i) => {
            const k = step(lt, 2.4 + d.eqs.length * 0.7 + i * 0.4, 0.6);
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, opacity: k, transform: `translateX(${(1 - k) * -16}px)` }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: AVC, boxShadow: `0 0 8px ${AVC}` }} />
                <span style={{ fontFamily: FONT.sans, fontSize: 24, color: C.dim }}>{b}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* right: animated motif */}
      <div style={{ position: "absolute", left: 1240, top: 280, width: 540, height: 540, zIndex: 16, opacity: step(lt, 1.0, 1.0) }}>
        <Motif lt={lt} />
      </div>
    </SceneBox>
  );
}

export const MATH: MathDef[] = [
  { idx: "M1", label: "Similarity", badge: "current", title: "Cosine distance", motif: "vectors",
    eqs: [{ tex: <span>cos θ = (<Tok c={AVC}>a</Tok>·<Tok c={AV}>b</Tok>) / (‖<Tok c={AVC}>a</Tok>‖ ‖<Tok c={AV}>b</Tok>‖)</span>, note: "Relevance is the angle between two embeddings." }],
    bullets: ["Vectors normalized to unit length", "Dot product over 768+ dimensions", "Zig @Vector SIMD — many lanes per cycle"] },
  { idx: "M2", label: "Index", badge: "partial", title: "HNSW search", motif: "graph",
    eqs: [{ tex: <span>search ≈ O(<Tok c={AVC}>log N</Tok>) &nbsp; · &nbsp; M=16, ef=200</span>, note: "A hierarchical navigable small-world graph." }],
    bullets: ["Coarse top layers, dense bottom layer", "Greedy descent toward the query", "Results returned in non-increasing score"] },
  { idx: "M3", label: "Hybrid rank", badge: "partial", title: "Beyond similarity", motif: "curve",
    eqs: [{ tex: <span>score = <Tok c={AVC}>sem</Tok> × <Tok c="#60a5fa">temp</Tok> × <Tok c={C.green}>causal</Tok> × <Tok c={AV}>persona</Tok></span> },
          { tex: <span><Tok c="#60a5fa">temporal</Tok> = e<Sup>−λΔt</Sup></span>, note: "Recency decays on a half-life; cause is BFS hop-distance." }],
    bullets: ["Recency half-life decay", "Causal-edge proximity", "Router persona weight"] },
  { idx: "M4", label: "Integrity", badge: "current", title: "SHA-256 chaining", motif: "chain",
    eqs: [{ tex: <span>H<Sub>n</Sub> = SHA256( H<Sub>n−1</Sub> ‖ ts ‖ profile ‖ q ‖ r )</span>, note: "Each block commits to its predecessor." }],
    bullets: ["Tamper-evident by construction", "verifyBlocks() re-derives every hash", "One flipped bit breaks the chain"] },
  { idx: "M5", label: "Durability", badge: "partial", title: "Write-ahead log", motif: "orbit",
    eqs: [{ tex: <span>frame = [ len ‖ payload ‖ <Tok c={AVC}>crc32</Tok> ]</span>, note: "CRC-32 is polynomial division over GF(2)." }],
    bullets: ["Append-only, framed records", "Corruption fails the checksum", "Replay rebuilds state deterministically"] },
  { idx: "M6", label: "Compression", badge: "partial", title: "int8 quantization", motif: "orbit",
    eqs: [{ tex: <span>q = round( x / s ), &nbsp; s = max|x| / 127</span>, note: "Float-32 → int-8, one scale factor per vector." }],
    bullets: ["~4× smaller footprint", "Bounded reconstruction error", "Dequantize on the hot path"] },
  { idx: "M7", label: "Privacy", badge: "partial", title: "Homomorphic sums", motif: "orbit",
    eqs: [{ tex: <span>Enc(<Tok c={AVC}>a</Tok>) + Enc(<Tok c={AV}>b</Tok>) = Enc(<Tok c={AVC}>a</Tok>+<Tok c={AV}>b</Tok>) &nbsp; (mod p)</span>, note: "Additive, single-key homomorphism over GF(p)." }],
    bullets: ["Aggregate without decrypting", "Sums decrypt to plaintext sums", "Full multiply — still research"] },
  { idx: "M8", label: "Consensus", badge: "partial", title: "Raft replication", motif: "orbit",
    eqs: [{ tex: <span>commit ⟺ acks ≥ ⌊n/2⌋ + 1</span>, note: "Agreement by majority quorum." }],
    bullets: ["Single leader per term", "Log replicated to followers", "In-process today — networked is proposed"] },
  { idx: "M9", label: "The minds", badge: "current", title: "Three loss functions", motif: "blend",
    eqs: [{ tex: <span><Tok c="#60a5fa">L<Sub>Abbey</Sub></Tok> = L<Sub>NLL</Sub> + λ·L<Sub>emp</Sub> + L<Sub>tech</Sub></span> },
          { tex: <span><Tok c={AV}>L<Sub>Aviva</Sub></Tok> = L<Sub>fact</Sub> + γ·L<Sub>direct</Sub></span> },
          { tex: <span>R<Sub>final</Sub> = <Tok c="#60a5fa">α·R<Sub>Abbey</Sub></Tok> + <Tok c={AV}>(1−α)·R<Sub>Aviva</Sub></Tok></span>, note: "Abi sets α — empathy vs. directness." }],
    bullets: ["Each persona is an objective", "Blended in a single pass", "Moderated, never averaged blindly"] },
  { idx: "M10", label: "QED", title: "The proof is the math", motif: "orbit",
    eqs: [{ tex: <span>resilient ⟸ verifiable ∧ governed ∧ routed</span>, note: "Everything Abbey promised — formalized." }],
    bullets: ["No hand-waving", "Every layer, a definition", "And the math checks out"] },
];
