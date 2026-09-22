// Mega.tsx — the MLAI Mega-Trailer. A 282s "longest, hardest-hitting cut" that
// interleaves kinetic trailer beats with the substantive film scenes over a
// full-bleed 3D neural field, driven by a handheld + impact camera rig.
//
// Incorporated from the design bundle's MLAI.html (the in-browser Babel build)
// into the typed module graph: every scene/beat/fx that the cut composes is now
// an explicit import from src/film/*, not a window global.
//
// Reuses the already-ported film scenes (Scene4/5/6/7) under their cut names,
// and hosts Abbey's voiceover via the shared Web Speech engine.

import { useRef, useEffect, useMemo } from "react";
import { C, FONT } from "../film/tokens";
import { clamp, fade } from "../film/easing";
import { Stage, Sprite, useTime, useTimeline } from "../film/engine";
import { Grain, Vignette, GridBG } from "../film/primitives";
import { NeuralLayer } from "../film/neural";
import { speak, lineSpeechDur, VoiceToggle, stopSpeech, setSpeechPlaying, primeNeural, useVoiceReady } from "../film/narration";
import type { ReactNode } from "react";

// trailer fx + kinetic beats
import { SlamText, Stamp } from "../film/scenes/trailer_fx";
import { BeatOpen, BeatBigWord, BeatPersona, BeatMemory, BeatReason, BeatVision, BeatClose } from "../film/scenes/beats";
// substantive film scenes (Scene4/5/6/7 reuse the canonical ports under cut names)
import { Scene3 } from "../film/scenes/intro";
import { SceneStorage, SceneTemporal, ScenePersonaDeep, SceneClaims, SceneManifesto, SceneRoadmap } from "../film/scenes/extra";
import { ScenePersonaRouting as Scene4, SceneVerifiableMemory as Scene5 } from "../film/scenes/core";
import { SceneGovernance as Scene6, SceneNorthStar as Scene7 } from "../film/scenes/outro";
import { MathScene, MATH } from "../film/scenes/math";

/* ── timeline (seconds). Each entry [start, end]; scenes keep their length. ── */
const M: Record<string, [number, number]> = {
  open: [0, 3.5], ask: [3.5, 7], fixed: [7, 11],
  oneRun: [11, 14.5], s3: [14.5, 32.5], stor: [32.5, 48.5], temp: [48.5, 65.5],
  threeM: [65.5, 69], pAbbey: [69, 70.8], pAviva: [70.8, 72.6], pAbi: [72.6, 74.6],
  s4: [74.6, 92.1], pDeep: [92.1, 113.1],
  verify: [113.1, 116.6], s5: [116.6, 133.1], mem: [133.1, 138.1], s6: [138.1, 154.1],
  claims: [154.1, 171.1], reason: [171.1, 176.1],
  roadW: [176.1, 179.6], s7: [179.6, 198.1], vis: [198.1, 204.1], road: [204.1, 227.1],
  manif: [227.1, 241.1], math: [241.1, 273.1],
  word: [273.1, 277.1], close: [277.1, 282],
};
const DURATION = 282;

// fixed cinematic rig multipliers (no live Tweaks panel here)
const RIG = { shake: 0.4, zoom: 0.6, drift: 0.4, flash: 0.4 };

/* ── beat-aligned camera impacts (every hard cut kicks + flashes) ── */
const MEGA_IMPACTS = Object.values(M).map((w) => w[0]).concat([2.2]).sort((a, b) => a - b);
function megaImpactK(t: number, dur = 0.42): number {
  let k = 0;
  for (const im of MEGA_IMPACTS) { const dt = t - im; if (dt >= 0 && dt < dur) k = Math.max(k, 1 - dt / dur); }
  return k;
}
function megaImpactKick(t: number, dur = 0.42): number {
  let best = 0, sign = 1;
  MEGA_IMPACTS.forEach((im, i) => { const dt = t - im; if (dt >= 0 && dt < dur && 1 - dt / dur > best) { best = 1 - dt / dur; sign = i % 2 ? 1 : -1; } });
  return best * sign;
}

/* ── neural background colour-act per time ── */
function megaMode(t: number): string {
  if (t < 7) return "chaos";
  if (t < 113.1) return "build";
  if (t < 171.1) return "resolve";
  if (t < 176.1) return "reason";
  if (t < 198.1) return "order";
  if (t < 241.1) return "fabric";
  if (t < 273.1) return "order";
  return "bloom";
}
function MegaNeural() {
  const t = useTime();
  return <NeuralLayer mode={megaMode(t)} opacity={1} />;
}

/* ── camera rig: continuous handheld drift + impact shake/zoom ── */
function MegaCamera({ children }: { children: ReactNode }) {
  const t = useTime();
  const { shake, zoom: zoomT, drift } = RIG;
  const k = megaImpactK(t), kick = megaImpactKick(t);
  const hx = (Math.sin(t * 0.6) * 8 + Math.sin(t * 0.27 + 1) * 5) * drift;
  const hy = (Math.cos(t * 0.5) * 6 + Math.cos(t * 0.33 + 2) * 4) * drift;
  const hrot = (Math.sin(t * 0.43) * 0.28 + Math.sin(t * 0.21) * 0.16) * drift;
  const sx = (k ? Math.sin(t * 94) * 14 * k : 0) * shake + kick * 26 * shake;
  const sy = (k ? Math.cos(t * 86) * 14 * k : 0) * shake;
  const srot = (k ? Math.sin(t * 70) * 0.7 * k : 0) * shake;
  const zoom = 1 + 0.022 * Math.sin(t * 0.4) + 0.075 * k * zoomT;
  return (
    <div style={{ position: "absolute", inset: 0, transform: `translate(${hx + sx}px, ${hy + sy}px) scale(${zoom}) rotate(${hrot + srot}deg)`, transformOrigin: "center", willChange: "transform" }}>
      {children}
    </div>
  );
}

function MegaFlash({ color = "#bfe0ff" }: { color?: string }) {
  const t = useTime();
  let op = 0;
  for (const im of MEGA_IMPACTS) { const dt = t - im; if (dt >= 0 && dt < 0.18) op = Math.max(op, (1 - dt / 0.18) * 0.5); }
  op *= RIG.flash;
  if (op < 0.01) return null;
  return <div style={{ position: "absolute", inset: 0, background: color, opacity: op, zIndex: 80, mixBlendMode: "screen", pointerEvents: "none" }} />;
}

/* ── Abbey VO — one smooth utterance per line, aligned to the timeline ── */
interface MLine { t: number; who: "abbey"; text: string; dur: number }
const RAW: Array<{ t: number; text: string }> = [
  { t: 0.9, text: "They gave you an answer." },
  { t: 4.0, text: "But could it ever prove it?" },
  { t: 7.6, text: "So we rebuilt the machine. From the substrate up." },
  { t: 11.6, text: "One runtime. Six honest layers." },
  { t: 15.5, text: "Durable storage. A write-ahead log. Every byte checksummed." },
  { t: 24.5, text: "Fast vector compute, with a GPU fallback." },
  { t: 33.5, text: "Storage that survives a crash." },
  { t: 41.5, text: "Snapshots. Recovery. Built in." },
  { t: 49.5, text: "Memory, indexed by meaning — and by time." },
  { t: 58.0, text: "Recency, causality, persona. Weighed at once." },
  { t: 66.0, text: "Not one model pretending to be everything." },
  { t: 69.6, text: "Three minds." },
  { t: 71.2, text: "Abbey. Aviva. Abi." },
  { t: 75.5, text: "Every query, scored and routed." },
  { t: 84.5, text: "Deterministic. Local. Explainable." },
  { t: 93.5, text: "Each persona — its own voice, its own discipline." },
  { t: 104.0, text: "One system. Three ways of thinking." },
  { t: 113.6, text: "A memory you can verify." },
  { t: 117.5, text: "Embeddings, searched by meaning." },
  { t: 125.5, text: "Sealed into a cryptographic chain." },
  { t: 133.6, text: "Tamper with one block —" },
  { t: 135.8, text: "— and the chain rejects it." },
  { t: 139.5, text: "Every answer, weighed against six principles." },
  { t: 147.5, text: "Truth. Safety. Privacy. Enforced." },
  { t: 155.5, text: "We claim only what our tests can prove." },
  { t: 163.5, text: "Current. Partial. Vision. Labeled honestly." },
  { t: 171.6, text: "It doesn't just respond. It reasons." },
  { t: 176.6, text: "And this is only the beginning." },
  { t: 180.5, text: "A distributed fabric." },
  { t: 188.5, text: "Across every tier of hardware." },
  { t: 198.6, text: "Still vision. Already in motion." },
  { t: 205.5, text: "A roadmap — not a promise." },
  { t: 215.0, text: "Built in the open. Proven in code." },
  { t: 228.0, text: "This is how we build." },
  { t: 242.5, text: "And the mathematics that makes it real." },
  { t: 256.0, text: "Precision, all the way down." },
  { t: 273.6, text: "This is MLAI." },
  { t: 275.8, text: "Infrastructure for resilient intelligence." },
];
const MEGA_SCRIPT: MLine[] = RAW.map((l) => ({ ...l, who: "abbey", dur: clamp(l.text.length / 16 + 0.9, 2.2, 5.2) }));

function MegaNarration() {
  // Off the true playhead (clock), not the hover-preview time. See narration.tsx.
  const { clock: time, playing } = useTimeline();
  const prev = useRef(0);
  const spoken = useRef<Set<number>>(new Set());
  useEffect(() => { primeNeural(MEGA_SCRIPT); return () => stopSpeech(); }, []);
  useEffect(() => {
    const p = prev.current; prev.current = time;
    if (time < p - 0.35) {
      stopSpeech();
      spoken.current = new Set(MEGA_SCRIPT.filter((l) => l.t <= time + 0.05).map((l) => l.t));
      return;
    }
    if (!playing) return;
    for (const line of MEGA_SCRIPT) {
      if (p < line.t && time >= line.t && !spoken.current.has(line.t)) {
        spoken.current.add(line.t);
        speak("abbey", line.text);
      }
    }
  }, [time, playing]);
  useEffect(() => { setSpeechPlaying(playing); }, [playing]);
  return null;
}

function megaActiveLine(time: number): MLine | null {
  let cur: MLine | null = null;
  for (const l of MEGA_SCRIPT) if (time >= l.t && time <= l.t + l.dur) cur = l;
  return cur;
}

function MegaCaption() {
  const { time, playing } = useTimeline();
  const line = megaActiveLine(time);
  // Memoize the token split per line; only the karaoke fraction changes each frame.
  const { tokens, wordIdx } = useMemo(() => {
    if (!line) return { tokens: [] as string[], wordIdx: [] as number[] };
    const tk = line.text.split(/(\s+)/);
    return { tokens: tk, wordIdx: tk.map((t, i) => (/\S/.test(t) ? i : -1)).filter((i) => i >= 0) };
  }, [line]);
  if (!line) return null;
  const op = fade(time - line.t, line.dur, 0.22, 0.34);
  const frac = clamp((time - line.t) / lineSpeechDur(line.text, 0.96), 0, 1);
  const spokenCount = Math.floor(frac * wordIdx.length);
  let seen = 0;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 84, zIndex: 42, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, opacity: op, maxWidth: 1500, padding: "12px 30px", borderRadius: 16, background: "radial-gradient(120% 180% at 50% 50%, rgba(4,6,14,0.82), rgba(4,6,14,0))" }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: C.cyan, boxShadow: `0 0 12px ${C.cyan}`, opacity: playing ? 0.5 + 0.5 * Math.sin(time * 7) : 0.4, flexShrink: 0 }} />
        <span style={{ fontFamily: FONT.mono, fontSize: 12, letterSpacing: "0.28em", color: C.blueHi, flexShrink: 0 }}>ABBEY</span>
        <span style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 29, letterSpacing: "-0.01em", textShadow: "0 2px 24px rgba(0,0,0,0.95)" }}>
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

function ScreenLabel() {
  const t = useTime();
  const sec = Math.floor(t);
  useEffect(() => { const r = document.getElementById("video-root"); if (r) r.setAttribute("data-screen-label", `t=${sec}s`); }, [sec]);
  return null;
}

function MegaGrain() { useTime(); return <Grain />; }

/* ── the cut ── */
export function Mega() {
  const math0 = MATH[0]!;
  const ready = useVoiceReady();
  return (
    <Stage width={1920} height={1080} duration={DURATION} background="#030408" persistKey="mlai-mega" ready={ready}>
      <GridBG opacity={0.34} />
      <Vignette />

      <MegaCamera>
        {/* full-bleed neural field behind everything */}
        <MegaNeural />

        {/* ACT 0 — power-up */}
        <Sprite start={M.open![0]} end={M.open![1]}><BeatOpen /></Sprite>
        <Sprite start={0.4} end={M.open![1]}><SlamText text={"AN ANSWER."} size={150} x={960} y={862} color={C.text} /></Sprite>
        <Sprite start={M.ask![0]} end={M.ask![1]}>
          <div style={{ position: "absolute", inset: 0 }}><SlamText text={"CAN IT"} size={120} x={960} y={430} color={C.dim} chroma={false} /></div>
        </Sprite>
        <Sprite start={M.ask![0] + 0.4} end={M.ask![1]}><Stamp text={"PROVE IT?"} color={C.red} x={960} y={604} rotate={-7} size={110} /></Sprite>
        <Sprite start={M.fixed![0]} end={M.fixed![1]}><BeatBigWord word={"WE FIXED THAT."} size={150} /></Sprite>

        {/* ACT I — the runtime */}
        <Sprite start={M.oneRun![0]} end={M.oneRun![1]}><BeatBigWord word={"ONE RUNTIME."} size={170} /></Sprite>
        <Sprite start={M.s3![0]} end={M.s3![1]}><Scene3 /></Sprite>
        <Sprite start={M.stor![0]} end={M.stor![1]}><SceneStorage /></Sprite>
        <Sprite start={M.temp![0]} end={M.temp![1]}><SceneTemporal /></Sprite>

        {/* ACT II — three minds */}
        <Sprite start={M.threeM![0]} end={M.threeM![1]}><BeatBigWord word={"THREE MINDS."} size={200} /></Sprite>
        <Sprite start={M.pAbbey![0]} end={M.pAbbey![1]}><BeatPersona name="Abbey" role="proof · verified" accent={C.green} /></Sprite>
        <Sprite start={M.pAviva![0]} end={M.pAviva![1]}><BeatPersona name="Aviva" role="research · vision" accent={C.purple} /></Sprite>
        <Sprite start={M.pAbi![0]} end={M.pAbi![1]}><BeatPersona name="Abi" role="interactive · fast" accent={C.cyan} /></Sprite>
        <Sprite start={M.s4![0]} end={M.s4![1]}><Scene4 /></Sprite>
        <Sprite start={M.pDeep![0]} end={M.pDeep![1]}><ScenePersonaDeep /></Sprite>

        {/* ACT III — the proof */}
        <Sprite start={M.verify![0]} end={M.verify![1]}><BeatBigWord word={"VERIFIABLE."} size={200} /></Sprite>
        <Sprite start={M.s5![0]} end={M.s5![1]}><Scene5 /></Sprite>
        <Sprite start={M.mem![0]} end={M.mem![1]}><BeatMemory /></Sprite>
        <Sprite start={M.mem![0] + 1.9} end={M.mem![1] - 0.5}><Stamp text={"TAMPER-PROOF"} color={C.green} x={960} y={764} rotate={-6} size={70} /></Sprite>
        <Sprite start={M.s6![0]} end={M.s6![1]}><Scene6 /></Sprite>
        <Sprite start={M.s6![1] - 4} end={M.s6![1] - 0.5}><Stamp text={"GOVERNED"} color={C.cyan} x={960} y={880} rotate={5} size={72} /></Sprite>
        <Sprite start={M.claims![0]} end={M.claims![1]}><SceneClaims /></Sprite>

        {/* ACT IV — reasoning */}
        <Sprite start={M.reason![0]} end={M.reason![1]}><BeatReason /></Sprite>

        {/* ACT V — the vision */}
        <Sprite start={M.roadW![0]} end={M.roadW![1]}><BeatBigWord word={"THE ROADMAP."} size={170} /></Sprite>
        <Sprite start={M.s7![0]} end={M.s7![1]}><Scene7 /></Sprite>
        <Sprite start={M.vis![0]} end={M.vis![1]}><BeatVision /></Sprite>
        <Sprite start={M.road![0]} end={M.road![1]}><SceneRoadmap /></Sprite>
        <Sprite start={M.manif![0]} end={M.manif![1]}><SceneManifesto /></Sprite>

        {/* ACT VI — the mathematics */}
        <Sprite start={M.math![0]} end={M.math![1]}><MathScene d={math0} /></Sprite>

        {/* ACT VII — title + close */}
        <Sprite start={M.word![0]} end={M.word![1]}><BeatBigWord word={"MLAI"} size={420} /></Sprite>
        <Sprite start={M.close![0]} end={M.close![1]}><BeatClose /></Sprite>
      </MegaCamera>

      <MegaFlash />
      <MegaGrain />

      <MegaNarration />
      <MegaCaption />
      <ScreenLabel />
      <VoiceToggle />
    </Stage>
  );
}
