// Trailer.tsx — the MLAI "Vision Trailer". A high-octane, ~62s hype cut in the
// MLAI visual system: kinetic typography that slams in, stamp punches, a fabric
// build, a massive title drop — hosted by Abbey in trailer cadence. The honest
// VISION · ROADMAP tag still rides the north-star beat at the peak.
//
// Reuses the film engine (Stage/Sprite/useSprite) and the shared speech engine
// (speak + lineSpeechDur) so the agent voice stays consistent across surfaces.

import { useRef, useEffect, useMemo, type ReactNode } from "react";
import { C, FONT, clamp } from "../film/tokens";
import { step, fade, Easing } from "../film/easing";
import { Stage, Sprite, useSprite, useTimeline } from "../film/engine";
import { Grain, Vignette, GridBG, Orb } from "../film/primitives";
import { DiagramSVG, PulseRing, SignalDots } from "../film/fx";
import { speak, lineSpeechDur, stopSpeech, setSpeechPlaying, primeNeural, useVoiceReady } from "../film/narration";
import { VoiceToggle } from "../film/narration";

const DURATION = 62;

/* ── trailer VO (Abbey, trailer cadence) ──────────────────────────── */

interface TLine { t: number; text: string; dur: number }
const RAW: Array<Omit<TLine, "dur">> = [
  { t: 0.9, text: "They gave you an answer." },
  { t: 4.0, text: "But could it ever prove it?" },
  { t: 7.4, text: "So we rebuilt the machine." },
  { t: 9.3, text: "From the substrate up." },
  { t: 11.4, text: "One runtime. Six honest layers." },
  { t: 14.6, text: "Memory. Compute. Security. Proven." },
  { t: 17.4, text: "Not one model pretending to be everything." },
  { t: 20.2, text: "Three minds. In concert." },
  { t: 26.4, text: "A memory you can verify." },
  { t: 29.6, text: "Tamper with one block. The chain rejects it." },
  { t: 32.4, text: "Every answer, weighed against six principles." },
  { t: 35.6, text: "Truth. Safety. Privacy. Enforced." },
  { t: 38.4, text: "It doesn't just respond." },
  { t: 40.6, text: "It reasons." },
  { t: 43.4, text: "And this is only the beginning." },
  { t: 47.2, text: "A fabric, across every tier of hardware." },
  { t: 51.2, text: "Still vision. Already in motion." },
  { t: 55.6, text: "This is MLAI." },
  { t: 57.8, text: "Infrastructure for resilient intelligence." },
];
const TRAILER_SCRIPT: TLine[] = RAW.map((l) => ({ ...l, dur: clamp(l.text.length / 16 + 0.8, 2.0, 4.4) }));

function activeLine(time: number): TLine | null {
  let cur: TLine | null = null;
  for (const l of TRAILER_SCRIPT) if (time >= l.t && time <= l.t + l.dur) cur = l;
  return cur;
}

function TrailerNarration() {
  // Off the true playhead (clock), not the hover-preview time. See narration.tsx.
  const { clock: time, playing } = useTimeline();
  const prev = useRef(0);
  const spoken = useRef<Set<number>>(new Set());
  useEffect(() => { primeNeural(TRAILER_SCRIPT); return () => stopSpeech(); }, []);
  useEffect(() => {
    const p = prev.current; prev.current = time;
    if (time < p - 0.35) {
      stopSpeech();
      spoken.current = new Set(TRAILER_SCRIPT.filter((l) => l.t <= time + 0.05).map((l) => l.t));
      return;
    }
    if (!playing) return;
    for (const line of TRAILER_SCRIPT) {
      if (p < line.t && time >= line.t && !spoken.current.has(line.t)) {
        spoken.current.add(line.t);
        speak("abbey", line.text);
      }
    }
  }, [time, playing]);
  useEffect(() => { setSpeechPlaying(playing); }, [playing]);
  return null;
}

function TrailerCaption() {
  const { time, playing } = useTimeline();
  const line = activeLine(time);
  // Memoize the token split per line; only the karaoke fraction changes each frame.
  const { tokens, wordIdx } = useMemo(() => {
    if (!line) return { tokens: [] as string[], wordIdx: [] as number[] };
    const tk = line.text.split(/(\s+)/);
    return { tokens: tk, wordIdx: tk.map((t, i) => (/\S/.test(t) ? i : -1)).filter((i) => i >= 0) };
  }, [line]);
  if (!line) return null;
  const op = fade(time - line.t, line.dur, 0.22, 0.34);
  const frac = clamp((time - line.t) / lineSpeechDur(line.text, 0.95), 0, 1);
  const spokenCount = Math.floor(frac * wordIdx.length);
  let seen = 0;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 64, zIndex: 42, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, opacity: op, maxWidth: 1500, padding: "0 40px" }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: C.cyan, boxShadow: `0 0 12px ${C.cyan}`, opacity: playing ? 0.5 + 0.5 * Math.sin(time * 7) : 0.4, flexShrink: 0 }} />
        <span style={{ fontFamily: FONT.mono, fontSize: 13, letterSpacing: "0.28em", color: C.blueHi, flexShrink: 0 }}>ABBEY</span>
        <span style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 34, letterSpacing: "-0.01em", textShadow: "0 2px 24px rgba(0,0,0,0.85)" }}>
          {tokens.map((tk, i) => {
            if (!/\S/.test(tk)) return tk;
            const lit = seen < spokenCount; seen++;
            return <span key={i} style={{ color: lit ? C.text : C.dim, transition: "color 90ms linear" }}>{tk}</span>;
          })}
        </span>
      </div>
    </div>
  );
}

/* ── kinetic primitives ───────────────────────────────────────────── */

// A word/phrase that slams in (scale + de-blur), holds, then snaps away.
function Kinetic({ text, size = 150, color = C.text, gradient, weight = 800 }: {
  text: string; size?: number; color?: string; gradient?: string; weight?: number;
}) {
  const { localTime: lt, duration } = useSprite();
  const inT = step(lt, 0, 0.32, Easing.easeOutExpo);
  const outStart = Math.max(0, duration - 0.3);
  const outT = lt > outStart ? Easing.easeInQuad(clamp((lt - outStart) / 0.3, 0, 1)) : 0;
  const scale = 0.7 + 0.3 * inT + 0.06 * outT;
  const blur = (1 - inT) * 16;
  const grad = gradient
    ? { background: gradient, WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent", color: "transparent" }
    : { color };
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 20 }}>
      <div style={{ fontFamily: FONT.display, fontWeight: weight, fontSize: size, letterSpacing: "-0.03em", textAlign: "center", lineHeight: 0.98,
        opacity: inT * (1 - outT), transform: `scale(${scale})`, filter: `blur(${blur}px)`, textShadow: "0 8px 50px rgba(0,0,0,0.7)", ...grad }}>
        {text}
      </div>
    </div>
  );
}

// A rotated stamp that punches in with overshoot.
function Stamp({ text, x, y, rot = -8, color = C.cyan, delay = 0 }: {
  text: string; x: number; y: number; rot?: number; color?: string; delay?: number;
}) {
  const { localTime: lt } = useSprite();
  const p = step(lt, delay, 0.34, Easing.easeOutBack);
  return (
    <div style={{ position: "absolute", left: x, top: y, zIndex: 24, opacity: p, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${0.6 + 0.4 * p})`,
      fontFamily: FONT.mono, fontSize: 30, fontWeight: 500, letterSpacing: "0.12em", color, padding: "10px 22px", borderRadius: 8,
      border: `2px solid ${color}`, boxShadow: `0 0 30px ${color}55`, background: `${color}10`, whiteSpace: "nowrap" }}>
      {text}
    </div>
  );
}

// Camera shake / zoom-punch driver applied to the whole frame at beat times.
function ShakeRig({ beats, children }: { beats: number[]; children: ReactNode }) {
  const time = useTimeline().time;
  let amp = 0;
  for (const b of beats) {
    const d = time - b;
    if (d >= 0 && d < 0.32) amp = Math.max(amp, (1 - d / 0.32));
  }
  const dx = amp * Math.sin(time * 90) * 7;
  const dy = amp * Math.cos(time * 78) * 7;
  const sc = 1 + amp * 0.025;
  return <div style={{ position: "absolute", inset: 0, transform: `translate(${dx}px, ${dy}px) scale(${sc})` }}>{children}</div>;
}

function SpeedLines() {
  const time = useTimeline().time;
  return (
    <DiagramSVG>
      {Array.from({ length: 14 }, (_, i) => {
        const y = 60 + i * 72;
        const t = ((time * 0.9 + i * 0.13) % 1);
        const x = -400 + t * 2700;
        return <line key={i} x1={x} y1={y} x2={x + 320} y2={y} stroke={i % 2 ? C.cyan : C.blueHi} strokeWidth={2} opacity={0.10 + 0.10 * Math.sin(time * 3 + i)} />;
      })}
    </DiagramSVG>
  );
}

/* ── persona triad beat ───────────────────────────────────────────── */

const TRIAD = [
  { name: "Abbey", role: "PROOF · VERIFIED", color: C.green },
  { name: "Aviva", role: "RESEARCH · VISION", color: C.violet },
  { name: "Abi", role: "INTERACTIVE · FAST", color: C.cyan },
];

function TriadBeat() {
  const { localTime: lt } = useSprite();
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 56, zIndex: 20 }}>
      {TRIAD.map((p, i) => {
        const r = step(lt, 0.2 + i * 0.28, 0.5, Easing.easeOutBack);
        return (
          <div key={p.name} style={{ width: 380, height: 460, borderRadius: 26, opacity: r, transform: `translateY(${(1 - r) * 50}px) scale(${0.9 + 0.1 * r})`,
            border: `1px solid ${p.color}66`, background: `linear-gradient(160deg, ${p.color}1c, rgba(8,8,14,0.92))`, boxShadow: `0 30px 80px rgba(0,0,0,0.6), inset 0 0 40px ${p.color}12`,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 22 }}>
            <div style={{ width: 130, height: 130, borderRadius: "50%", background: `radial-gradient(circle at 35% 30%, ${p.color}, ${p.color}55)`, display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: FONT.display, fontWeight: 700, fontSize: 64, color: "#06120c", boxShadow: `0 0 50px ${p.color}aa` }}>{p.name[0]}</div>
            <div style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 52, color: C.text }}>{p.name}</div>
            <div style={{ fontFamily: FONT.mono, fontSize: 16, letterSpacing: "0.18em", color: p.color }}>{p.role}</div>
          </div>
        );
      })}
    </div>
  );
}

/* ── fabric finale ────────────────────────────────────────────────── */

function FabricBeat() {
  const { localTime: lt } = useSprite();
  const cx = 960, cy = 540, R = 250;
  const n = 6;
  const pts = Array.from({ length: n }, (_, i) => {
    const a = -Math.PI / 2 + (i / n) * Math.PI * 2;
    return { x: cx + Math.cos(a) * R, y: cy + Math.sin(a) * R };
  });
  const build = step(lt, 0.2, 1.4);
  return (
    <>
      <Orb x={cx} y={cy} size={760} color={C.violet} opacity={0.16} />
      <DiagramSVG>
        {pts.map((p, i) => pts.map((q, j) => (j > i ? (
          <line key={`${i}-${j}`} x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke={C.violet} strokeWidth={1.2} strokeDasharray="3 9" opacity={0.4 * build} />
        ) : null)))}
        {pts.map((p, i) => (
          <SignalDots key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} lt={lt + i * 0.4} count={1} speed={0.6} color={C.violet} r={4} on={build > 0.4} />
        ))}
        <PulseRing cx={cx} cy={cy} lt={lt} period={2.0} maxR={180} minR={70} color={C.violet} width={1.8} opacity={0.6} />
      </DiagramSVG>
      <div style={{ position: "absolute", left: 0, right: 0, top: 150, display: "flex", justifyContent: "center", zIndex: 24 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 14, padding: "12px 26px", borderRadius: 999, border: `1px solid ${C.violet}77`, background: `${C.violet}16`, opacity: build }}>
          <span style={{ width: 9, height: 9, borderRadius: "50%", background: C.violet, boxShadow: `0 0 12px ${C.violet}` }} />
          <span style={{ fontFamily: FONT.mono, fontSize: 18, letterSpacing: "0.3em", color: C.violet }}>VISION · ROADMAP</span>
        </div>
      </div>
    </>
  );
}

/* ── title drop ───────────────────────────────────────────────────── */

function TitleDrop() {
  const { localTime: lt } = useSprite();
  const mark = step(lt, 0.2, 0.9, Easing.easeOutExpo);
  const tag = step(lt, 1.6, 0.9);
  const prod = step(lt, 2.8, 0.9);
  return (
    <>
      <Orb x={960} y={520} size={680} color={C.blue} opacity={0.14} />
      <div style={{ position: "absolute", inset: 0, zIndex: 20, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        <div style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 220, letterSpacing: "-0.04em", lineHeight: 0.9,
          opacity: mark, transform: `scale(${0.8 + 0.2 * mark})`, filter: `blur(${(1 - mark) * 14}px)`,
          background: `linear-gradient(110deg, ${C.text}, ${C.blueHi} 55%, ${C.cyan})`, WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent", paddingBottom: "0.06em" }}>
          MLAI
        </div>
        <div style={{ fontFamily: FONT.display, fontWeight: 500, fontSize: 46, color: C.text, letterSpacing: "-0.01em", opacity: tag, transform: `translateY(${(1 - tag) * 14}px)`, marginTop: 4 }}>
          Infrastructure for <span style={{ color: C.cyan }}>resilient intelligence.</span>
        </div>
        <div style={{ fontFamily: FONT.mono, fontSize: 20, letterSpacing: "0.34em", color: C.dim, marginTop: 40, opacity: prod, transform: `translateY(${(1 - prod) * 10}px)` }}>
          WDBX&nbsp;&nbsp;·&nbsp;&nbsp;ABBEY&nbsp;&nbsp;·&nbsp;&nbsp;AVIVA&nbsp;&nbsp;·&nbsp;&nbsp;ABI
        </div>
      </div>
    </>
  );
}

/* ── compose ──────────────────────────────────────────────────────── */

// beat times for the camera-shake rig (aligned to the harder VO hits)
const BEATS = [0.9, 4.0, 7.4, 11.4, 14.6, 20.2, 29.6, 35.6, 40.6, 47.2, 55.6];

export function Trailer() {
  const ready = useVoiceReady();
  return (
    <Stage width={1920} height={1080} duration={DURATION} background="#040406" persistKey="mlai-trailer" ready={ready}>
      <GridBG opacity={0.5} />
      <Vignette />
      <SpeedLines />

      <ShakeRig beats={BEATS}>
        {/* opening provocation */}
        <Sprite start={0.6} end={3.9}><Kinetic text={"They gave you\nan answer."} size={120} /></Sprite>
        <Sprite start={3.9} end={7.3}><Kinetic text="But could it prove it?" size={104} gradient={`linear-gradient(100deg, ${C.red}, ${C.amber})`} /></Sprite>

        {/* rebuild */}
        <Sprite start={7.3} end={11.3}><Kinetic text={"Rebuilt.\nFrom the substrate up."} size={92} /></Sprite>

        {/* stamps */}
        <Sprite start={11.3} end={17.3}>
          <Kinetic text="One runtime." size={120} gradient={`linear-gradient(100deg, ${C.cyan}, ${C.blue})`} />
          <Stamp text="MEMORY" x={520} y={760} rot={-7} color={C.cyan} delay={0.4} />
          <Stamp text="COMPUTE" x={960} y={820} rot={4} color={C.blueHi} delay={0.9} />
          <Stamp text="SECURITY" x={1410} y={760} rot={-5} color={C.green} delay={1.4} />
          <Stamp text="PROVEN" x={960} y={300} rot={3} color={C.green} delay={2.6} />
        </Sprite>

        {/* three minds */}
        <Sprite start={17.3} end={26.3}><TriadBeat /></Sprite>

        {/* verifiable memory */}
        <Sprite start={26.3} end={32.3}>
          <Kinetic text={"A memory you\ncan verify."} size={104} gradient={`linear-gradient(100deg, ${C.cyanHi}, ${C.cyan})`} />
          <Stamp text="TAMPER-PROOF" x={960} y={300} rot={-4} color={C.cyan} delay={2.6} />
        </Sprite>

        {/* governance */}
        <Sprite start={32.3} end={38.3}>
          <Kinetic text="Six principles." size={120} gradient={`linear-gradient(100deg, ${C.green}, ${C.cyan})`} />
          <Stamp text="GOVERNED" x={960} y={300} rot={3} color={C.green} delay={2.4} />
        </Sprite>

        {/* it reasons */}
        <Sprite start={38.3} end={43.3}><Kinetic text="It reasons." size={150} gradient={`linear-gradient(100deg, ${C.blueHi}, ${C.cyan} 60%, ${C.violet})`} /></Sprite>

        {/* fabric / vision */}
        <Sprite start={43.3} end={55.4}><FabricBeat /></Sprite>

        {/* title drop */}
        <Sprite start={55.4} end={DURATION}><TitleDrop /></Sprite>
      </ShakeRig>

      <TrailerNarration />
      <TrailerCaption />
      <VoiceToggle />
      <Grain />
    </Stage>
  );
}
