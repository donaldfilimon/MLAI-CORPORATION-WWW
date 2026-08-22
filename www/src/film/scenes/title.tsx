// scenes/title.tsx — opening tagline + closing wordmark. Demonstrates the scene
// pattern: import tokens + easing + primitives + fx + engine hooks, export a
// component that reads useSprite() for its local timeline.

import { C, FONT } from "../tokens";
import { step, fade, Easing } from "../easing";
import { useSprite } from "../engine";
import { Orb } from "../primitives";
import { DiagramSVG, PulseRing, SignalDots } from "../fx";
import type { ReactNode } from "react";

// shared scene-edge fade wrapper
function SceneBox({ inDur = 0.8, outDur = 0.8, children }: { inDur?: number; outDur?: number; children: ReactNode }) {
  const { localTime, duration } = useSprite();
  return <div style={{ position: "absolute", inset: 0, opacity: fade(localTime, duration, inDur, outDur) }}>{children}</div>;
}

const NODES: [number, number][] = [
  [300, 250], [620, 180], [930, 300], [1280, 210], [1610, 320],
  [220, 560], [560, 640], [960, 560], [1360, 600], [1700, 560],
  [380, 880], [760, 940], [1150, 880], [1520, 900],
];
const EDGES: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [2, 7], [3, 8], [5, 6], [6, 7],
  [7, 8], [8, 9], [5, 10], [6, 11], [7, 12], [8, 13], [10, 11], [11, 12], [12, 13],
];

function Constellation({ lt }: { lt: number }) {
  const appear = step(lt, 0, 2.2, Easing.easeOutCubic);
  const pos = NODES.map((p, i) => [p[0] + Math.sin(lt * 0.5 + i) * 7, p[1] + Math.cos(lt * 0.4 + i * 1.3) * 7] as const);
  return (
    <DiagramSVG>
      {EDGES.map(([a, b], i) => {
        const pa = pos[a]!, pb = pos[b]!;
        return <line key={i} x1={pa[0]} y1={pa[1]} x2={pb[0]} y2={pb[1]} stroke={C.blue} strokeWidth={1} opacity={0.1 * appear} />;
      })}
      {EDGES.filter((_, i) => i % 3 === 0).map(([a, b], i) => {
        const pa = pos[a]!, pb = pos[b]!;
        return <SignalDots key={`s${i}`} x1={pa[0]} y1={pa[1]} x2={pb[0]} y2={pb[1]} lt={lt + i} count={1} speed={0.32} color={C.cyan} r={2.6} on={appear > 0.6} />;
      })}
      {pos.map((p, i) => {
        const tw = 0.5 + 0.5 * Math.sin(lt * 1.1 + i * 2);
        return <circle key={i} cx={p[0]} cy={p[1]} r={2.4 + tw * 1.4} fill={C.blueHi} opacity={(0.25 + tw * 0.3) * appear} />;
      })}
      {[2, 7, 12].map((ni, k) => {
        const p = pos[ni]!;
        return <PulseRing key={ni} cx={p[0]} cy={p[1]} lt={lt} phase={k / 3} period={3.2} maxR={46} minR={4} color={C.blue} opacity={0.4 * appear} width={1.4} />;
      })}
    </DiagramSVG>
  );
}

export function SceneOpen() {
  const { localTime: lt } = useSprite();
  const kicker = step(lt, 0.6, 0.9);
  const l1 = step(lt, 1.4, 0.8);
  const l2 = step(lt, 2.2, 0.9);
  const rule = step(lt, 3.4, 1.0);
  return (
    <SceneBox inDur={0.9} outDur={0.9}>
      <Constellation lt={lt} />
      <div style={{ position: "absolute", inset: 0, zIndex: 20, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        <div style={{ fontFamily: FONT.mono, fontSize: 20, letterSpacing: "0.5em", color: C.blueHi, opacity: kicker, transform: `translateY(${(1 - kicker) * 10}px)`, marginBottom: 40, paddingLeft: "0.5em" }}>
          MLAI CORPORATION
        </div>
        <div style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 92, lineHeight: 1.04, color: C.text, letterSpacing: "-0.02em" }}>
          <div style={{ opacity: l1, transform: `translateY(${(1 - l1) * 18}px)` }}>Infrastructure for</div>
          <div style={{
            opacity: l2, transform: `translateY(${(1 - l2) * 18}px)`,
            background: `linear-gradient(100deg, ${C.blueHi}, ${C.cyan} 55%, ${C.blue})`,
            WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", paddingBottom: "0.08em",
          }}>
            resilient intelligence.
          </div>
        </div>
        <div style={{ width: 320 * rule, height: 1, marginTop: 46, background: `linear-gradient(90deg, transparent, ${C.lineHi}, transparent)` }} />
      </div>
    </SceneBox>
  );
}

export function SceneClose() {
  const { localTime: lt } = useSprite();
  const mark = step(lt, 0.3, 1.0, Easing.easeOutCubic);
  const tag = step(lt, 1.4, 0.9);
  const prod = step(lt, 2.6, 0.9);
  return (
    <SceneBox inDur={0.9} outDur={1.2}>
      <Constellation lt={lt + 4} />
      <Orb x={960} y={520} size={620} color={C.blue} opacity={0.1} />
      <div style={{ position: "absolute", inset: 0, zIndex: 20, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        <div style={{
          fontFamily: FONT.display, fontWeight: 700, fontSize: 132, letterSpacing: "-0.03em", color: C.text,
          opacity: mark, transform: `translateY(${(1 - mark) * 16}px)`,
          background: `linear-gradient(110deg, ${C.text}, ${C.blueHi} 60%, ${C.cyan})`,
          WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent", paddingBottom: "0.06em",
        }}>
          MLAI
        </div>
        <div style={{ fontFamily: FONT.display, fontWeight: 500, fontSize: 40, color: C.text, letterSpacing: "-0.01em", opacity: tag, transform: `translateY(${(1 - tag) * 12}px)`, marginTop: 8 }}>
          Infrastructure for <span style={{ color: C.cyan }}>resilient intelligence.</span>
        </div>
        <div style={{ fontFamily: FONT.mono, fontSize: 19, letterSpacing: "0.34em", color: C.dim, marginTop: 38, opacity: prod, transform: `translateY(${(1 - prod) * 10}px)` }}>
          WDBX&nbsp;&nbsp;·&nbsp;&nbsp;ABBEY&nbsp;&nbsp;·&nbsp;&nbsp;AVIVA&nbsp;&nbsp;·&nbsp;&nbsp;ABI
        </div>
      </div>
    </SceneBox>
  );
}
