// scenes/intro.tsx — Scene 1 (cold open), Scene 2 (the problem), Scene 3 (runtime stack)
// Ported from scenes_intro.jsx: explicit ES-module imports + TypeScript types,
// visuals/geometry/timings preserved byte-for-byte.

import { C, FONT } from "../tokens";
import { Easing, step } from "../easing";
import { useSprite } from "../engine";
import { DiagramSVG, Wire, PulseRing, SignalDots, SignalPolyline, Elbow } from "../fx";
import { Orb } from "../primitives";
import { SceneTag, FlowNode } from "../chrome";
import { SceneBox } from "./_shared";

// ── module-private helpers without a canonical home ───────────────────────────

// MLAI monogram mark — gradient chip with the M + a neural trifecta accent.
function MLAIMark({ size = 120, reveal = 1, glow = true }: {
  size?: number; reveal?: number; glow?: boolean;
}) {
  const dot = size * 0.07;
  return (
    <div style={{ position: 'relative', width: size, height: size, borderRadius: size * 0.24, opacity: reveal,
      transform: `scale(${0.7 + 0.3 * reveal}) rotate(${(1 - reveal) * -12}deg)`,
      background: `linear-gradient(150deg, ${C.cyan}, ${C.blue} 52%, ${C.purple})`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
      boxShadow: glow ? `0 0 60px ${C.blue}55, inset 0 0 ${size * 0.28}px rgba(255,255,255,0.22)` : 'none' }}>
      {/* inset ring + top sheen */}
      <div style={{ position: 'absolute', inset: size * 0.05, borderRadius: size * 0.19, border: '1px solid rgba(255,255,255,0.28)' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(120% 80% at 30% 12%, rgba(255,255,255,0.35), transparent 55%)' }} />
      <span style={{ position: 'relative', fontFamily: FONT.display, fontWeight: 800, fontSize: size * 0.5, color: '#fff', letterSpacing: '-0.05em', lineHeight: 1, marginTop: -size * 0.04, textShadow: '0 1px 6px rgba(0,0,0,0.25)' }}>M</span>
      {/* neural trifecta: three persona nodes joined by a faint synapse */}
      <svg viewBox="0 0 100 100" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <line x1="30" y1="80" x2="70" y2="80" stroke="rgba(255,255,255,0.45)" strokeWidth="1.4" />
        <circle cx="30" cy="80" r={dot / size * 100} fill="#34d399" />
        <circle cx="50" cy="80" r={dot / size * 100} fill="#ffffff" />
        <circle cx="70" cy="80" r={dot / size * 100} fill="#c4b5fd" />
      </svg>
    </div>
  );
}

// A soft horizontal scan band that sweeps down a region, looping. (HTML overlay.)
function Scanline({ x, y, w, h, lt = 0, period = 3.4, color = C.blue, band = 90 }: {
  x: number; y: number; w: number; h: number; lt?: number; period?: number; color?: string; band?: number;
}) {
  const p = ((lt / period) % 1 + 1) % 1;
  const top = y - band + p * (h + band);
  return (
    <div style={{ position: 'absolute', left: x, top: top, width: w, height: band, zIndex: 15, pointerEvents: 'none',
      background: `linear-gradient(180deg, transparent, ${color}22 50%, transparent)`,
      maskImage: `linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)`,
      WebkitMaskImage: `linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)`,
      opacity: 0.7 }} />
  );
}

// ── Scene 1: Cold open ────────────────────────────────────────────────────────
type Pt = [number, number];

const LATTICE: Pt[] = [
  [300, 250], [620, 180], [930, 300], [1280, 210], [1610, 320],
  [220, 560], [560, 640], [960, 560], [1360, 600], [1700, 560],
  [380, 880], [760, 940], [1150, 880], [1520, 900],
];
const EDGES: Pt[] = [[0,1],[1,2],[2,3],[3,4],[0,5],[2,7],[3,8],[5,6],[6,7],[7,8],[8,9],[5,10],[6,11],[7,12],[8,13],[10,11],[11,12],[12,13]];

function Constellation({ lt }: { lt: number }) {
  const appear = step(lt, 0, 2.2, Easing.easeOutCubic);
  const drift = (i: number) => ({
    dx: Math.sin(lt * 0.5 + i) * 7,
    dy: Math.cos(lt * 0.4 + i * 1.3) * 7,
  });
  const pos: Pt[] = LATTICE.map((p, i) => { const d = drift(i); return [p[0] + d.dx, p[1] + d.dy]; });
  return (
    <DiagramSVG>
      {EDGES.map((e, i) => {
        const a = e[0], b = e[1];
        const pa = pos[a]!, pb = pos[b]!;
        return (
          <line key={i} x1={pa[0]} y1={pa[1]} x2={pb[0]} y2={pb[1]}
            stroke={C.blue} strokeWidth={1} opacity={0.10 * appear} />
        );
      })}
      {pos.map((p, i) => {
        const tw = 0.5 + 0.5 * Math.sin(lt * 1.1 + i * 2);
        return <circle key={i} cx={p[0]} cy={p[1]} r={2.4 + tw * 1.4}
          fill={C.blueHi} opacity={(0.25 + tw * 0.3) * appear} />;
      })}
      {/* travelling signals along a subset of edges */}
      {[0, 3, 6, 9, 12, 15, 17].map((ei) => {
        const e = EDGES[ei]; if (!e) return null;
        const p0 = pos[e[0]]!, p1 = pos[e[1]]!;
        return <SignalDots key={ei} x1={p0[0]} y1={p0[1]} x2={p1[0]} y2={p1[1]}
          lt={lt + ei} count={1} speed={0.32} color={C.cyan} r={2.6} on={appear > 0.6} />;
      })}
      {/* breathing pulse rings on a few hub nodes */}
      {[2, 7, 12].map((ni, k) => {
        const p = pos[ni]!;
        return (
          <PulseRing key={ni} cx={p[0]} cy={p[1]} lt={lt} phase={k / 3} period={3.2} maxR={46} minR={4} color={C.blue} opacity={0.4 * appear} width={1.4} />
        );
      })}
    </DiagramSVG>
  );
}

export function Scene1() {
  const { localTime: lt } = useSprite();
  const kicker = step(lt, 0.6, 0.9);
  const l1 = step(lt, 1.4, 0.8);
  const l2 = step(lt, 2.2, 0.9);
  const rule = step(lt, 3.4, 1.0);
  return (
    <SceneBox inDur={0.9} outDur={0.9}>
      <Constellation lt={lt} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 20, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <div style={{ marginBottom: 30, opacity: kicker, transform: `translateY(${(1 - kicker) * 10}px)` }}><MLAIMark size={94} reveal={kicker} /></div>
        <div style={{ fontFamily: FONT.mono, fontSize: 20, letterSpacing: '0.5em', color: C.blueHi,
          opacity: kicker, transform: `translateY(${(1 - kicker) * 10}px)`, marginBottom: 40, paddingLeft: '0.5em' }}>
          MLAI CORPORATION
        </div>
        <div style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 92, lineHeight: 1.04,
          color: C.text, letterSpacing: '-0.02em' }}>
          <div style={{ opacity: l1, transform: `translateY(${(1 - l1) * 18}px)` }}>Infrastructure for</div>
          <div style={{ opacity: l2, transform: `translateY(${(1 - l2) * 18}px)`,
            background: `linear-gradient(100deg, ${C.blueHi}, ${C.cyan} 55%, ${C.blue})`,
            WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', paddingBottom: '0.08em' }}>
            resilient intelligence.
          </div>
        </div>
        <div style={{ width: 320 * rule, height: 1, marginTop: 46,
          background: `linear-gradient(90deg, transparent, ${C.lineHi}, transparent)` }} />
      </div>
    </SceneBox>
  );
}

// ── Scene 2: The problem ────────────────────────────────────────────────────
function ProblemRow({ x, y, label, reveal }: { x: number; y: number; label: string; reveal: number }) {
  return (
    <div style={{ position: 'absolute', left: x, top: y, zIndex: 22,
      opacity: reveal, transform: `translateX(${(1 - reveal) * -16}px)`,
      display: 'flex', alignItems: 'center', gap: 18 }}>
      <span style={{ width: 30, height: 30, borderRadius: '50%', border: `1.5px solid ${C.red}66`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.red, fontSize: 17,
        fontFamily: FONT.sans }}>✕</span>
      <span style={{ fontFamily: FONT.display, fontWeight: 500, fontSize: 34, color: C.text, letterSpacing: '-0.01em' }}>{label}</span>
    </div>
  );
}

export function Scene2() {
  const { localTime: lt } = useSprite();
  const heading = step(lt, 0.3, 0.9);
  // black box diagram
  const boxIn = step(lt, 1.4, 0.9, Easing.easeOutBack);
  const qIn = step(lt, 2.2, 0.8);
  const outIn = step(lt, 2.9, 0.8);
  const qmark = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(lt * 2.4));
  const r1 = step(lt, 5.0, 0.7), r2 = step(lt, 5.8, 0.7), r3 = step(lt, 6.6, 0.7);
  const closer = step(lt, 9.4, 0.9);
  const bx = 250, by = 430, bw = 300, bh = 220;
  return (
    <SceneBox inDur={0.7} outDur={0.7}>
      <SceneTag index="01" label="The gap" reveal={heading} />
      <div style={{ position: 'absolute', left: 120, top: 200, zIndex: 20, opacity: heading,
        transform: `translateY(${(1 - heading) * 12}px)`, maxWidth: 1100 }}>
        <div style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 58, color: C.text, letterSpacing: '-0.02em', lineHeight: 1.08 }}>
          Today's agents are capable.<br /><span style={{ color: C.dim }}>Are they accountable?</span>
        </div>
      </div>

      <DiagramSVG>
        <Wire x1={120} y1={by + bh / 2} x2={bx} y2={by + bh / 2} draw={qIn} color={C.dim2} width={2} />
        <Wire x1={bx + bw} y1={by + bh / 2} x2={bx + bw + 130} y2={by + bh / 2} draw={outIn} color={C.dim2} width={2} dashed />
        <SignalDots x1={120} y1={by + bh / 2} x2={bx} y2={by + bh / 2} lt={lt} count={2} speed={0.55} color={C.cyan} r={4} on={qIn > 0.9} />
        <SignalDots x1={bx + bw} y1={by + bh / 2} x2={bx + bw + 130} y2={by + bh / 2} lt={lt} count={1} speed={0.4} color={C.red} r={3} on={outIn > 0.9} />
      </DiagramSVG>

      {/* opaque agent box */}
      <div style={{ position: 'absolute', left: bx, top: by, width: bw, height: bh, zIndex: 12,
        opacity: boxIn, transform: `scale(${0.9 + 0.1 * boxIn})`, transformOrigin: 'center',
        borderRadius: 18, border: `1px solid ${C.lineHi}`,
        background: 'linear-gradient(160deg, #14141c, #0a0a10)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14,
        boxShadow: '0 30px 80px rgba(0,0,0,0.6)' }}>
        <span style={{ fontFamily: FONT.display, fontSize: 96, color: C.dim2, opacity: qmark * (Math.sin(lt * 23) > -0.85 ? 1 : 0.3), lineHeight: 1,
          transform: `translateX(${Math.sin(lt * 31) * Math.sin(lt * 6) * 5}px)` }}>?</span>
        <span style={{ fontFamily: FONT.mono, fontSize: 15, letterSpacing: '0.28em', color: C.dim }}>AI&nbsp;AGENT</span>
      </div>
      <div style={{ position: 'absolute', left: 120, top: by + bh / 2 - 44, zIndex: 22, opacity: qIn,
        fontFamily: FONT.mono, fontSize: 14, letterSpacing: '0.2em', color: C.dim2 }}>QUERY →</div>
      <div style={{ position: 'absolute', left: bx + bw + 18, top: by + bh / 2 - 44, zIndex: 22, opacity: outIn,
        fontFamily: FONT.mono, fontSize: 14, letterSpacing: '0.2em', color: C.dim2 }}>→ OUTPUT</div>

      <ProblemRow x={1080} y={400} label="Explain the decision?" reveal={r1} />
      <ProblemRow x={1080} y={478} label="Verify what it remembers?" reveal={r2} />
      <ProblemRow x={1080} y={556} label="Enforce the constraints you set?" reveal={r3} />

      <div style={{ position: 'absolute', left: 120, bottom: 150, zIndex: 22, opacity: closer,
        transform: `translateY(${(1 - closer) * 12}px)`,
        fontFamily: FONT.display, fontWeight: 600, fontSize: 40, color: C.text, letterSpacing: '-0.01em' }}>
        Resilience starts with the <span style={{ color: C.cyan }}>substrate.</span>
      </div>
    </SceneBox>
  );
}

// ── Scene 3: WDBX runtime stack ──────────────────────────────────────────────
type LayerStatus = 'current' | 'partial' | 'vision';
interface Layer { name: string; sub: string; st: LayerStatus; }

const LAYERS: Layer[] = [
  { name: 'Storage',   sub: 'WAL · snapshot · CRC32',     st: 'partial' },
  { name: 'Index',     sub: 'HNSW · temporal · causal',   st: 'partial' },
  { name: 'Compute',   sub: 'SIMD · GPU fallback',        st: 'partial' },
  { name: 'Security',  sub: 'SHA-256 chain · checksum',   st: 'current' },
  { name: 'Cluster',   sub: 'Raft core · in-process',     st: 'partial' },
  { name: 'Transport', sub: 'stdio · loopback HTTP/SSE',  st: 'partial' },
];
const ST_COLOR: Record<LayerStatus, string> = { current: C.green, partial: C.amber, vision: C.purple };

export function Scene3() {
  const { localTime: lt } = useSprite();
  const head = step(lt, 0.4, 0.9);
  const abiIn = step(lt, 0.9, 0.7, Easing.easeOutBack);
  const w1 = step(lt, 1.7, 0.7);
  const routerIn = step(lt, 2.3, 0.7, Easing.easeOutBack);
  const w2 = step(lt, 3.1, 0.8);
  const panelIn = step(lt, 3.6, 0.9, Easing.easeOutCubic);
  const legend = step(lt, 11.0, 0.8);
  const cap = step(lt, 12.0, 0.8);

  // geometry
  const abi = { x: 200, y: 360, w: 280, h: 78 };
  const router = { x: 200, y: 560, w: 280, h: 84 };
  const panel = { x: 720, y: 188, w: 600, h: 704 };
  const rowH = 78, rowGap = 14, rowTop = panel.y + 96, rowX = panel.x + 28, rowW = panel.w - 56;

  return (
    <SceneBox inDur={0.7} outDur={0.7}>
      <SceneTag index="02" label="WDBX runtime" reveal={head} />
      <Orb x={1020} y={540} size={620} color={C.blue} opacity={0.10} />

      <DiagramSVG>
        {/* ABI -> Router */}
        <Wire x1={abi.x + abi.w / 2} y1={abi.y + abi.h} x2={abi.x + abi.w / 2} y2={router.y} draw={w1} color={C.lineHi} width={2} />
        <SignalDots x1={abi.x + abi.w / 2} y1={abi.y + abi.h} x2={abi.x + abi.w / 2} y2={router.y} lt={lt} count={1} speed={0.7} color={C.blueHi} r={3.5} on={w1 > 0.9} />
        {/* Router -> Panel */}
        <Elbow pts={[[router.x + router.w, router.y + router.h / 2], [620, router.y + router.h / 2], [620, panel.y + panel.h / 2], [panel.x, panel.y + panel.h / 2]]}
          draw={w2} color={C.blue} width={2.5} />
        <SignalPolyline pts={[[router.x + router.w, router.y + router.h / 2], [620, router.y + router.h / 2], [620, panel.y + panel.h / 2], [panel.x, panel.y + panel.h / 2]]}
          lt={lt} count={2} speed={0.4} color={C.cyan} r={4.5} />
        {/* live pulse on the Security (CURRENT) layer */}
        {lt > 6.4 && <PulseRing cx={rowX + rowW - 56} cy={rowTop + 3 * (rowH + rowGap) + rowH / 2} lt={lt} period={2}
          maxR={30} minR={6} color={C.green} width={1.5} opacity={0.7} />}
      </DiagramSVG>

      {/* ABI node */}
      <FlowNode x={abi.x} y={abi.y} w={abi.w} h={abi.h} reveal={abiIn} title="ABI" subtitle="orchestration" accent={C.blueHi} />
      {/* Router node */}
      <FlowNode x={router.x} y={router.y} w={router.w} h={router.h} reveal={routerIn} title="Persona Router" titleSize={23} subtitle="keyword-weighted" accent={C.cyan} />

      {/* Runtime panel */}
      <div style={{ position: 'absolute', left: panel.x, top: panel.y, width: panel.w, height: panel.h, zIndex: 12,
        opacity: panelIn, transform: `translateY(${(1 - panelIn) * 24}px)`,
        borderRadius: 22, border: `1px solid ${C.lineHi}`,
        background: 'linear-gradient(160deg, rgba(20,20,30,0.92), rgba(8,8,14,0.92))',
        backdropFilter: 'blur(8px)', boxShadow: '0 40px 100px rgba(0,0,0,0.55)' }}>
        <div style={{ padding: '26px 28px 0', display: 'flex', alignItems: 'baseline', gap: 14 }}>
          <span style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 30, color: C.text, letterSpacing: '-0.01em' }}>WDBX Runtime</span>
          <span style={{ fontFamily: FONT.mono, fontSize: 14, color: C.dim2, letterSpacing: '0.16em' }}>cognitive substrate</span>
        </div>
      </div>

      {/* scanline sweep over the runtime panel */}
      {panelIn > 0.5 && <Scanline x={panel.x} y={panel.y} w={panel.w} h={panel.h} lt={lt} period={4.2} color={C.blue} band={120} />}

      {/* layer rows */}
      {LAYERS.map((L, i) => {
        const rv = step(lt, 4.3 + i * 0.55, 0.6, Easing.easeOutCubic);
        const dot = step(lt, 4.7 + i * 0.55, 0.5, Easing.easeOutBack);
        const c = ST_COLOR[L.st];
        return (
          <div key={i} style={{ position: 'absolute', left: rowX, top: rowTop + i * (rowH + rowGap), width: rowW, height: rowH, zIndex: 14,
            opacity: rv, transform: `translateX(${(1 - rv) * 22}px)`,
            borderRadius: 14, border: `1px solid ${C.line}`, background: 'rgba(255,255,255,0.025)',
            display: 'flex', alignItems: 'center', padding: '0 22px', gap: 16 }}>
            <span style={{ fontFamily: FONT.mono, fontSize: 13, color: C.dim2, width: 26 }}>{String(i + 1).padStart(2, '0')}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 24, color: C.text }}>{L.name}</div>
              <div style={{ fontFamily: FONT.mono, fontSize: 14, color: C.dim, letterSpacing: '0.04em', marginTop: 2 }}>{L.sub}</div>
            </div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, opacity: dot,
              padding: '5px 11px', borderRadius: 999, border: `1px solid ${c}55`, background: `${c}14` }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: c, boxShadow: `0 0 8px ${c}` }} />
              <span style={{ fontFamily: FONT.mono, fontSize: 12, letterSpacing: '0.12em', color: c }}>{L.st.toUpperCase()}</span>
            </span>
          </div>
        );
      })}

      {/* legend / caption */}
      <div style={{ position: 'absolute', left: 1390, top: 360, zIndex: 20, opacity: legend,
        transform: `translateX(${(1 - legend) * 16}px)`, width: 360 }}>
        <div style={{ fontFamily: FONT.mono, fontSize: 14, letterSpacing: '0.2em', color: C.dim2, marginBottom: 18 }}>CLAIMS DISCIPLINE</div>
        {([['current', 'Backed by source + tests'], ['partial', 'Implemented, scope-limited']] as [LayerStatus, string][]).map(([k, d]) => (
          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: ST_COLOR[k], boxShadow: `0 0 8px ${ST_COLOR[k]}` }} />
            <span style={{ fontFamily: FONT.mono, fontSize: 14, color: ST_COLOR[k], width: 88, letterSpacing: '0.08em' }}>{k.toUpperCase()}</span>
            <span style={{ fontFamily: FONT.sans, fontSize: 15, color: C.dim }}>{d}</span>
          </div>
        ))}
      </div>
      <div style={{ position: 'absolute', left: 1390, bottom: 230, zIndex: 20, opacity: cap, width: 380,
        transform: `translateY(${(1 - cap) * 12}px)` }}>
        <div style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 38, color: C.text, letterSpacing: '-0.01em', lineHeight: 1.1 }}>
          One runtime.<br />Six honest layers.
        </div>
      </div>
    </SceneBox>
  );
}
