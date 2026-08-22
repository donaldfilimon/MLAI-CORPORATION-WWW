// scenes/outro.tsx — governance gate + north-star (vision/roadmap).
// Ported from scenes_outro.jsx. (The resolution beat lives in scenes/title.tsx
// as SceneClose, so it isn't duplicated here.)

import { C, FONT } from "../tokens";
import { step, Easing } from "../easing";
import { useSprite } from "../engine";
import { Orb } from "../primitives";
import { DiagramSVG, Wire, PulseRing, SignalDots, Rotor } from "../fx";
import { SceneTag, StatusBadge } from "../chrome";
import { SceneBox } from "./_shared";

/* ── Scene: constitution governance ───────────────────────────── */

const PRINCIPLES = ["Truthfulness", "Safety", "Helpfulness", "Fairness", "Privacy", "Transparency"];

export function SceneGovernance() {
  const { localTime: lt } = useSprite();
  const head = step(lt, 0.4, 0.8);
  const badge = step(lt, 0.8, 0.7);
  const respIn = step(lt, 1.2, 0.7, Easing.easeOutBack);
  const gateIn = step(lt, 2.0, 0.8, Easing.easeOutCubic);
  const wIn = step(lt, 1.9, 0.6);
  const wOut = step(lt, 7.4, 0.7);
  const passIn = step(lt, 7.6, 0.8, Easing.easeOutBack);
  const cap = step(lt, 8.6, 0.8);

  const gate = { x: 730, y: 360, w: 460, h: 360 };
  const cols = 2, gw = 200, gh = 64, ggap = 18;
  const gridX = gate.x + 30, gridY = gate.y + 96;

  return (
    <SceneBox>
      <SceneTag index="05" label="Governance" reveal={head} />
      <StatusBadge kind="current" x={120} y={150} reveal={badge} />
      <Orb x={960} y={540} size={620} color={C.green} opacity={0.07} />

      <div style={{ position: "absolute", left: 150, top: gate.y + gate.h / 2 - 46, width: 360, zIndex: 18, opacity: respIn, transform: `translateX(${(1 - respIn) * -16}px)` }}>
        <div style={{ fontFamily: FONT.mono, fontSize: 13, letterSpacing: "0.2em", color: C.dim2, marginBottom: 12 }}>GENERATED RESPONSE</div>
        <div style={{ borderRadius: 14, border: `1px solid ${C.line}`, background: "rgba(255,255,255,0.03)", padding: "18px 20px", fontFamily: FONT.sans, fontSize: 19, color: C.dim, lineHeight: 1.4 }}>
          "Here's a structured comparison, with the risks flagged…"
        </div>
      </div>

      <DiagramSVG>
        <Wire x1={510} y1={gate.y + gate.h / 2} x2={gate.x} y2={gate.y + gate.h / 2} draw={wIn} color={C.lineHi} width={2} />
        <Wire x1={gate.x + gate.w} y1={gate.y + gate.h / 2} x2={gate.x + gate.w + 150} y2={gate.y + gate.h / 2} draw={wOut} color={C.green} width={2.5} glow />
        <SignalDots x1={510} y1={gate.y + gate.h / 2} x2={gate.x} y2={gate.y + gate.h / 2} lt={lt} count={1} speed={0.6} color={C.cyan} r={4} on={wIn > 0.9} />
        <SignalDots x1={gate.x + gate.w} y1={gate.y + gate.h / 2} x2={gate.x + gate.w + 150} y2={gate.y + gate.h / 2} lt={lt} count={2} speed={0.7} color={C.green} r={4} on={wOut > 0.9} />
        {passIn > 0.3 && <PulseRing cx={gate.x + gate.w + 170 + 60} cy={gate.y + gate.h / 2} lt={lt} period={1.8} maxR={90} minR={62} color={C.green} width={1.6} opacity={0.7} />}
      </DiagramSVG>

      <div style={{ position: "absolute", left: gate.x, top: gate.y, width: gate.w, height: gate.h, zIndex: 14, opacity: gateIn, transform: `translateY(${(1 - gateIn) * 18}px)`,
        borderRadius: 22, border: `1px solid ${C.lineHi}`, background: "linear-gradient(160deg, rgba(18,22,20,0.95), rgba(8,10,9,0.95))", boxShadow: "0 40px 100px rgba(0,0,0,0.55)" }}>
        <div style={{ padding: "22px 30px 0" }}>
          <span style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 26, color: C.text }}>Constitution</span>
          <span style={{ fontFamily: FONT.mono, fontSize: 14, color: C.dim2, marginLeft: 12 }}>evaluateResponse()</span>
        </div>
      </div>
      {PRINCIPLES.map((p, i) => {
        const r = i % cols, c = Math.floor(i / cols);
        const onAt = 2.8 + i * 0.55;
        const on = step(lt, onAt, 0.5, Easing.easeOutBack);
        const lit = lt >= onAt + 0.1;
        return (
          <div key={i} style={{ position: "absolute", left: gridX + r * (gw + ggap), top: gridY + c * (gh + ggap), width: gw, height: gh, zIndex: 16, opacity: gateIn,
            borderRadius: 12, border: `1px solid ${lit ? C.green + "88" : C.line}`, background: lit ? `${C.green}14` : "rgba(255,255,255,0.02)",
            display: "flex", alignItems: "center", gap: 10, padding: "0 14px", boxShadow: lit ? `0 0 16px ${C.green}22` : "none" }}>
            <span style={{ width: 22, height: 22, borderRadius: "50%", flexShrink: 0, border: `1.5px solid ${lit ? C.green : C.dim2}`, background: lit ? C.green : "transparent",
              display: "flex", alignItems: "center", justifyContent: "center", color: "#06120c", fontSize: 13, transform: `scale(${0.6 + 0.4 * on})` }}>{lit ? "✓" : ""}</span>
            <span style={{ fontFamily: FONT.sans, fontWeight: 500, fontSize: 18, color: lit ? C.text : C.dim }}>{p}</span>
          </div>
        );
      })}

      <div style={{ position: "absolute", left: gate.x + gate.w + 170, top: gate.y + gate.h / 2 - 60, zIndex: 20, opacity: passIn, transform: `scale(${0.8 + 0.2 * passIn})`, transformOrigin: "left center" }}>
        <div style={{ width: 120, height: 120, borderRadius: "50%", border: `2px solid ${C.green}`, background: `${C.green}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 56, color: C.green, boxShadow: `0 0 40px ${C.green}44` }}>✓</div>
        <div style={{ fontFamily: FONT.mono, fontSize: 16, letterSpacing: "0.14em", color: C.green, marginTop: 16, textAlign: "center" }}>APPROVED</div>
      </div>

      <div style={{ position: "absolute", left: 150, bottom: 140, zIndex: 20, opacity: cap, width: 1200, transform: `translateY(${(1 - cap) * 12}px)` }}>
        <div style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 40, color: C.text, letterSpacing: "-0.01em" }}>
          Six principles. <span style={{ color: C.green }}>Every response, governed.</span>
        </div>
      </div>
    </SceneBox>
  );
}

/* ── Scene: north-star (vision / roadmap) ─────────────────────── */

const TIERS = ["CPU", "GPU", "NPU", "TPU"];

export function SceneNorthStar() {
  const { localTime: lt } = useSprite();
  const badge = step(lt, 0.4, 1.0, Easing.easeOutBack);
  const coreIn = step(lt, 1.4, 0.9, Easing.easeOutBack);
  const ringIn = step(lt, 2.4, 1.4);
  const meshIn = step(lt, 3.4, 1.6);
  const cap = step(lt, 5.0, 0.9);

  const cx = 960, cy = 560, R = 230;
  const tierPos = TIERS.map((t, i) => {
    const a = -Math.PI / 2 + (i / TIERS.length) * Math.PI * 2;
    return { t, x: cx + Math.cos(a) * R, y: cy + Math.sin(a) * R };
  });

  return (
    <SceneBox>
      <Orb x={960} y={540} size={680} color={C.violet} opacity={0.12} />

      <div style={{ position: "absolute", left: 0, right: 0, top: 150, zIndex: 24, display: "flex", justifyContent: "center", opacity: badge, transform: `translateY(${(1 - badge) * -12}px)` }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 14, padding: "12px 26px", borderRadius: 999, border: `1px solid ${C.violet}77`, background: `${C.violet}16` }}>
          <span style={{ width: 9, height: 9, borderRadius: "50%", background: C.violet, boxShadow: `0 0 12px ${C.violet}` }} />
          <span style={{ fontFamily: FONT.mono, fontSize: 18, letterSpacing: "0.3em", color: C.violet, whiteSpace: "nowrap" }}>VISION · ROADMAP</span>
        </div>
      </div>

      <DiagramSVG>
        {tierPos.map((p, i) => tierPos.map((q, j) => (j > i ? (
          <line key={`${i}-${j}`} x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke={C.violet} strokeWidth={1.2} strokeDasharray="3 8" opacity={0.35 * meshIn} />
        ) : null)))}
        {tierPos.map((p, i) => (
          <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke={C.violet} strokeWidth={2} strokeDasharray="4 7" opacity={0.6 * ringIn} />
        ))}
        {tierPos.map((p, i) => (
          <SignalDots key={"s" + i} x1={cx} y1={cy} x2={p.x} y2={p.y} lt={lt + i * 0.5} count={1} speed={0.4} color={C.violet} r={3.5} on={ringIn > 0.5} />
        ))}
        <Rotor cx={cx} cy={cy} lt={lt} speed={11}>
          <circle cx={cx} cy={cy} r={188} fill="none" stroke={C.violet} strokeWidth={1.2} strokeDasharray="2 14" opacity={0.55 * coreIn} />
        </Rotor>
        <Rotor cx={cx} cy={cy} lt={lt} speed={-7}>
          <circle cx={cx} cy={cy} r={305} fill="none" stroke={C.violet} strokeWidth={1} strokeDasharray="2 22" opacity={0.3 * meshIn} />
        </Rotor>
        <PulseRing cx={cx} cy={cy} lt={lt} period={2.6} maxR={135} minR={78} color={C.violet} width={1.6} opacity={0.5 * coreIn} />
      </DiagramSVG>

      <div style={{ position: "absolute", left: cx, top: cy, zIndex: 18, transform: `translate(-50%,-50%) scale(${0.7 + 0.3 * coreIn})`, opacity: coreIn }}>
        <div style={{ width: 150, height: 150, borderRadius: "50%", border: `1.5px solid ${C.violet}aa`, background: `radial-gradient(circle, ${C.violet}33, rgba(10,10,16,0.95))`,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: `0 0 50px ${C.violet}55` }}>
          <span style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 30, color: C.text }}>WDBX</span>
          <span style={{ fontFamily: FONT.mono, fontSize: 12, color: C.violet, letterSpacing: "0.16em", marginTop: 4 }}>FABRIC</span>
        </div>
      </div>

      {tierPos.map((p, i) => {
        const rv = step(lt, 2.6 + i * 0.18, 0.6, Easing.easeOutBack);
        return (
          <div key={i} style={{ position: "absolute", left: p.x, top: p.y, zIndex: 16, transform: `translate(-50%,-50%) scale(${0.7 + 0.3 * rv})`, opacity: rv,
            width: 110, height: 110, borderRadius: "50%", border: `1px solid ${C.violet}66`, background: "rgba(14,12,20,0.92)",
            display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT.mono, fontSize: 22, fontWeight: 500, color: C.violet, letterSpacing: "0.06em" }}>
            {p.t}
          </div>
        );
      })}

      <div style={{ position: "absolute", left: 0, right: 0, bottom: 150, zIndex: 20, textAlign: "center", opacity: cap, transform: `translateY(${(1 - cap) * 12}px)` }}>
        <div style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 44, color: C.text, letterSpacing: "-0.01em" }}>
          A distributed cognitive fabric, across hardware tiers.
        </div>
        <div style={{ fontFamily: FONT.mono, fontSize: 18, color: C.violet, marginTop: 18, letterSpacing: "0.06em" }}>
          Proposed direction — not a current capability.
        </div>
      </div>
    </SceneBox>
  );
}
