// scenes/core.tsx — persona routing + verifiable memory.
// Ported from scenes_core.jsx into the typed import graph.

import { C, FONT } from "../tokens";
import { step, Easing, clamp } from "../easing";
import { useSprite } from "../engine";
import { Orb } from "../primitives";
import { DiagramSVG, Wire, PulseRing, SignalDots, SignalPolyline, Elbow, hexOf } from "../fx";
import { SceneTag, StatusBadge, FlowNode } from "../chrome";
import { SceneBox } from "./_shared";

/* ── Scene: multi-persona routing ─────────────────────────────── */

const QUERY_TOKENS = [
  { t: "Compare ", hot: true }, { t: "these two designs and " }, { t: "flag ", hot: true },
  { t: "the ", hot: false }, { t: "risks", hot: true }, { t: ".", hot: false },
];
const ROUTE_PERSONAS = [
  { name: "Abbey", role: "Analytical · supportive", w: 0.62, accent: "#60a5fa" },
  { name: "Aviva", role: "Creative · exploratory", w: 0.14, accent: "#a78bfa" },
  { name: "Abi", role: "Concise · action", w: 0.24, accent: "#22d3ee" },
];

export function ScenePersonaRouting() {
  const { localTime: lt } = useSprite();
  const head = step(lt, 0.4, 0.8);
  const badge = step(lt, 0.8, 0.7);
  const queryIn = step(lt, 1.2, 0.7, Easing.easeOutBack);
  const typed = step(lt, 1.8, 1.6, Easing.linear);
  const hot = step(lt, 3.5, 0.6);
  const routerIn = step(lt, 3.8, 0.7, Easing.easeOutBack);
  const cardsBase = 5.0;
  const wireWin = step(lt, 8.4, 0.9);
  const cap = step(lt, 10.0, 0.8);

  const fullText = QUERY_TOKENS.map((t) => t.t).join("");
  const showChars = Math.floor(typed * fullText.length);

  const router = { x: 250, y: 560, w: 240, h: 84 };
  const cardX = 1140, cardW = 540, cardH = 150, cardGap = 26, cardTop = 250;
  const winnerIdx = 0;
  const winnerCY = cardTop + cardH / 2;

  let acc = 0;
  const tokenEls = QUERY_TOKENS.map((tok, i) => {
    const start = acc; acc += tok.t.length;
    const vis = Math.max(0, Math.min(tok.t.length, showChars - start));
    const shown = tok.t.slice(0, vis);
    const isHot = tok.hot && hot > 0.1;
    return <span key={i} style={{ color: isHot ? C.cyan : C.text, textShadow: isHot ? `0 0 16px ${C.cyan}88` : "none",
      borderBottom: isHot ? `2px solid ${C.cyan}` : "2px solid transparent", paddingBottom: 2 }}>{shown}</span>;
  });

  const elbowPts: [number, number][] = [
    [router.x + router.w, router.y + router.h / 2], [1040, router.y + router.h / 2], [1040, winnerCY], [cardX, winnerCY],
  ];

  return (
    <SceneBox>
      <SceneTag index="03" label="Persona routing" reveal={head} />
      <StatusBadge kind="current" x={120} y={150} reveal={badge} />
      <Orb x={1300} y={500} size={560} color={C.blue} opacity={0.1} />

      <div style={{ position: "absolute", left: 250, top: 360, width: 760, zIndex: 20, opacity: queryIn, transform: `translateY(${(1 - queryIn) * 16}px)` }}>
        <div style={{ fontFamily: FONT.mono, fontSize: 14, letterSpacing: "0.2em", color: C.dim2, marginBottom: 14 }}>INCOMING QUERY</div>
        <div style={{ borderRadius: 16, border: `1px solid ${C.lineHi}`, background: "rgba(255,255,255,0.03)", padding: "22px 26px", fontFamily: FONT.display, fontWeight: 500, fontSize: 30, lineHeight: 1.3, minHeight: 44 }}>
          {tokenEls}<span style={{ opacity: typed < 1 ? (Math.sin(lt * 8) > 0 ? 1 : 0) : 0, color: C.cyan }}>▎</span>
        </div>
      </div>

      <FlowNode x={router.x} y={router.y} w={router.w} h={router.h} reveal={routerIn} title="Router" subtitle="weighted scoring" accent={C.cyan} />

      <div style={{ position: "absolute", left: 560, top: 548, width: 460, zIndex: 20 }}>
        {ROUTE_PERSONAS.map((p, i) => {
          const bw = step(lt, 4.4 + i * 0.35, 1.0, Easing.easeOutCubic) * p.w;
          const isWin = i === winnerIdx;
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16, opacity: step(lt, 4.2 + i * 0.35, 0.5) }}>
              <span style={{ width: 64, fontFamily: FONT.mono, fontSize: 15, color: isWin ? p.accent : C.dim, textAlign: "right" }}>{p.name}</span>
              <div style={{ flex: 1, height: 14, borderRadius: 7, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                <div style={{ width: `${bw * 100}%`, height: "100%", borderRadius: 7, background: p.accent, boxShadow: isWin ? `0 0 14px ${p.accent}` : "none" }} />
              </div>
              <span style={{ width: 52, fontFamily: FONT.mono, fontSize: 15, color: isWin ? p.accent : C.dim2 }}>{bw.toFixed(2)}</span>
            </div>
          );
        })}
      </div>

      <DiagramSVG>
        <Elbow pts={elbowPts} draw={wireWin} color={ROUTE_PERSONAS[winnerIdx]!.accent} width={2.5} />
        <SignalPolyline pts={elbowPts} lt={lt} count={2} speed={0.5} color={C.cyan} r={4.5} />
        {lt > 8.7 && <PulseRing cx={cardX + 60} cy={winnerCY} lt={lt} period={1.9} maxR={50} minR={28} color={ROUTE_PERSONAS[winnerIdx]!.accent} width={1.6} opacity={0.7} />}
      </DiagramSVG>

      {ROUTE_PERSONAS.map((p, i) => {
        const rv = step(lt, cardsBase + i * 0.3, 0.7, Easing.easeOutCubic);
        const isWin = i === winnerIdx;
        const glow = isWin ? step(lt, 8.6, 0.8) : 0;
        return (
          <div key={i} style={{ position: "absolute", left: cardX, top: cardTop + i * (cardH + cardGap), width: cardW, height: cardH, zIndex: 16,
            opacity: rv, transform: `translateX(${(1 - rv) * 26}px) scale(${1 + glow * 0.02})`, borderRadius: 18,
            border: `1px solid ${isWin ? p.accent + "aa" : C.line}`,
            background: isWin ? `linear-gradient(150deg, ${p.accent}1f, rgba(10,10,16,0.92))` : "rgba(255,255,255,0.025)",
            boxShadow: glow ? `0 24px 60px rgba(0,0,0,0.5), 0 0 40px ${p.accent}33` : "0 18px 44px rgba(0,0,0,0.4)",
            padding: "0 32px", display: "flex", alignItems: "center", gap: 24 }}>
            <span style={{ width: 56, height: 56, borderRadius: 14, flexShrink: 0, background: `${p.accent}22`, border: `1px solid ${p.accent}66`,
              display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT.display, fontWeight: 700, fontSize: 26, color: p.accent }}>{p.name[0]}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 32, color: C.text }}>{p.name}</div>
              <div style={{ fontFamily: FONT.mono, fontSize: 15, color: C.dim, letterSpacing: "0.04em", marginTop: 3 }}>{p.role}</div>
            </div>
            {isWin && glow > 0.3 && (
              <span style={{ fontFamily: FONT.mono, fontSize: 13, letterSpacing: "0.14em", color: p.accent, border: `1px solid ${p.accent}66`, borderRadius: 999, padding: "6px 12px", opacity: glow }}>SELECTED</span>
            )}
          </div>
        );
      })}

      <div style={{ position: "absolute", left: 250, bottom: 150, zIndex: 20, opacity: cap, width: 760, transform: `translateY(${(1 - cap) * 12}px)` }}>
        <div style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 40, color: C.text, letterSpacing: "-0.01em" }}>
          Routing that's <span style={{ color: C.cyan }}>deterministic, local, explainable.</span>
        </div>
      </div>
    </SceneBox>
  );
}

/* ── Scene: verifiable memory ─────────────────────────────────── */

function vfield(n: number, ox: number, oy: number, w: number, h: number): [number, number][] {
  const pts: [number, number][] = []; let s = 7;
  const rnd = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
  for (let i = 0; i < n; i++) pts.push([ox + rnd() * w, oy + rnd() * h]);
  return pts;
}
const VEC_PTS = vfield(30, 170, 360, 560, 380);
const QUERY_PT: [number, number] = [430, 540];
const NN = VEC_PTS.map((p, i) => ({ i, d: Math.hypot(p[0] - QUERY_PT[0], p[1] - QUERY_PT[1]) }))
  .sort((a, b) => a.d - b.d).slice(1, 6).map((o) => o.i);

const MEM_BLOCKS = [
  { profile: "Abbey", accent: "#60a5fa" },
  { profile: "Aviva", accent: "#a78bfa" },
  { profile: "Abi", accent: "#22d3ee" },
];

export function SceneVerifiableMemory() {
  const { localTime: lt } = useSprite();
  const head = step(lt, 0.4, 0.8);
  const badge = step(lt, 0.8, 0.7);
  const fieldIn = step(lt, 1.2, 1.0);
  const search = step(lt, 3.0, 1.2);
  const capL = step(lt, 4.2, 0.7);
  const tamper = step(lt, 8.4, 0.7);
  const reject = step(lt, 9.2, 0.7);
  const verify = step(lt, 10.6, 1.0);
  const capR = step(lt, 5.6, 0.7);

  const bx = 1000, by = 380, bw = 235, bh = 200, bgap = 48;
  const tamperPulse = tamper > 0 && verify < 0.5 ? 0.5 + 0.5 * Math.sin(lt * 14) : 0;

  return (
    <SceneBox>
      <SceneTag index="04" label="Verifiable memory" reveal={head} />
      <StatusBadge kind="current" x={120} y={150} reveal={badge} />
      <Orb x={500} y={520} size={520} color={C.cyan} opacity={0.08} />

      <div style={{ position: "absolute", left: 120, top: 280, zIndex: 20, opacity: fieldIn, fontFamily: FONT.mono, fontSize: 14, letterSpacing: "0.2em", color: C.dim2 }}>SEMANTIC RECALL · HNSW</div>
      <DiagramSVG>
        {NN.map((idx, k) => {
          const dr = step(lt, 3.0 + k * 0.12, 0.5);
          const vp = VEC_PTS[idx]!;
          return <Wire key={k} x1={QUERY_PT[0]} y1={QUERY_PT[1]} x2={vp[0]} y2={vp[1]} draw={dr * search} color={C.cyan} width={1.6} glow />;
        })}
        {VEC_PTS.map((p, i) => {
          const isNN = NN.includes(i);
          const tw = 0.5 + 0.5 * Math.sin(lt * 1.2 + i);
          const op = fieldIn * (isNN ? 1 : 0.35 + tw * 0.15);
          return <circle key={i} cx={p[0]} cy={p[1]} r={isNN ? 6 : 3.4} fill={isNN ? C.cyanHi : C.dim2} opacity={op} style={isNN ? { filter: `drop-shadow(0 0 7px ${C.cyan})` } : undefined} />;
        })}
        <circle cx={QUERY_PT[0]} cy={QUERY_PT[1]} r={10 * fieldIn} fill={C.blue} style={{ filter: `drop-shadow(0 0 14px ${C.blue})` }} />
        {fieldIn > 0.5 && <PulseRing cx={QUERY_PT[0]} cy={QUERY_PT[1]} lt={lt} period={2.4} maxR={120} minR={10} color={C.cyan} width={1.6} opacity={0.5} />}
        {fieldIn > 0.5 && <PulseRing cx={QUERY_PT[0]} cy={QUERY_PT[1]} lt={lt} phase={0.5} period={2.4} maxR={120} minR={10} color={C.blue} width={1.4} opacity={0.4} />}
      </DiagramSVG>
      <div style={{ position: "absolute", left: 120, top: 790, width: 600, zIndex: 20, opacity: capL, fontFamily: FONT.sans, fontSize: 22, color: C.dim, lineHeight: 1.4 }}>
        Embeddings searched by SIMD cosine distance — <span style={{ color: C.text }}>nearest memory, instantly.</span>
      </div>

      <div style={{ position: "absolute", left: bx, top: 280, zIndex: 20, opacity: badge, fontFamily: FONT.mono, fontSize: 14, letterSpacing: "0.2em", color: C.dim2 }}>SHA-256 LINKED HISTORY</div>
      <DiagramSVG>
        {MEM_BLOCKS.slice(0, -1).map((_, i) => {
          const dr = step(lt, 5.6 + i * 0.5, 0.5);
          const xa = bx + i * (bw + bgap) + bw;
          const xb = bx + (i + 1) * (bw + bgap);
          const col = verify > 0.2 ? C.green : C.cyan;
          return (
            <g key={i}>
              <Wire x1={xa} y1={by + bh / 2} x2={xb} y2={by + bh / 2} draw={dr} color={C.lineHi} width={2} />
              <SignalDots x1={xa} y1={by + bh / 2} x2={xb} y2={by + bh / 2} lt={lt} count={1} speed={0.8} color={col} r={3.5} on={dr > 0.9} />
            </g>
          );
        })}
      </DiagramSVG>
      {MEM_BLOCKS.map((b, i) => {
        const rv = step(lt, 5.6 + i * 0.5, 0.6, Easing.easeOutBack);
        const flash = i === 1 ? tamperPulse : 0;
        const ok = verify > 0.2;
        const borderC = flash > 0.1 ? C.red : ok ? C.green : b.accent;
        return (
          <div key={i} style={{ position: "absolute", left: bx + i * (bw + bgap), top: by, width: bw, height: bh, zIndex: 16,
            opacity: rv, transform: `translateY(${(1 - rv) * 20}px) scale(${1 + flash * 0.03})`, borderRadius: 16,
            border: `1.5px solid ${borderC}${flash > 0.1 ? "ff" : "88"}`,
            background: flash > 0.1 ? "rgba(40,12,12,0.9)" : "linear-gradient(160deg, rgba(20,20,30,0.95), rgba(8,8,14,0.95))",
            boxShadow: flash > 0.1 ? `0 0 36px ${C.red}66` : ok ? `0 0 22px ${C.green}22` : "0 18px 44px rgba(0,0,0,0.45)",
            padding: "18px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontFamily: FONT.mono, fontSize: 13, color: C.dim2 }}>block {String(i).padStart(2, "0")}</span>
              <span style={{ fontFamily: FONT.mono, fontSize: 12, letterSpacing: "0.1em", color: b.accent, border: `1px solid ${b.accent}55`, borderRadius: 6, padding: "3px 8px" }}>{b.profile}</span>
            </div>
            <div style={{ marginTop: 4 }}>
              <div style={{ fontFamily: FONT.mono, fontSize: 12, color: C.dim2 }}>prev</div>
              <div style={{ fontFamily: FONT.mono, fontSize: 16, color: C.dim }}>{i === 0 ? "genesis" : hexOf(i + 10) + "…"}</div>
            </div>
            <div>
              <div style={{ fontFamily: FONT.mono, fontSize: 12, color: C.dim2 }}>hash</div>
              <div style={{ fontFamily: FONT.mono, fontSize: 16, color: ok ? C.green : b.accent }}>{hexOf(i + 11) + "…"}</div>
            </div>
            {ok && <span style={{ position: "absolute", right: 16, bottom: 14, color: C.green, fontSize: 18, opacity: verify }}>✓</span>}
          </div>
        );
      })}

      {reject > 0.05 && verify < 0.6 && (
        <div style={{ position: "absolute", left: bx + (bw + bgap), top: by + bh + 26, width: bw, zIndex: 24, opacity: reject * (1 - verify), transform: `translateY(${(1 - reject) * -8}px)`, textAlign: "center" }}>
          <div style={{ fontFamily: FONT.mono, fontSize: 16, color: C.red, letterSpacing: "0.04em" }}>✕ ChecksumMismatch</div>
          <div style={{ fontFamily: FONT.sans, fontSize: 15, color: C.dim, marginTop: 4 }}>tamper rejected</div>
        </div>
      )}
      <div style={{ position: "absolute", left: bx, top: by + bh + 40, width: 3 * bw + 2 * bgap, zIndex: 24, opacity: verify, textAlign: "center" }}>
        <span style={{ fontFamily: FONT.mono, fontSize: 18, color: C.green, letterSpacing: "0.08em" }}>verifyBlocks() ✓ chain intact</span>
      </div>
      <div style={{ position: "absolute", left: bx, top: 800, width: 760, zIndex: 20, opacity: capR, fontFamily: FONT.sans, fontSize: 22, color: C.dim, lineHeight: 1.4 }}>
        Every exchange hashed into an append-only chain. <span style={{ color: C.text }}>Tampering can't hide.</span>
      </div>
    </SceneBox>
  );
}
