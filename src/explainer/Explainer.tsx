// Explainer.tsx — the MLAI "What is MLAI?" cut. A calm, ~2:12 explainer that
// sits between the 62s vision trailer and the longer brand film. It is a pure
// curation of the existing system — every scene, the engine, the neural field,
// and the shared Web Speech voice are reused unchanged, so this cut stays in
// sync with every fix made to the underlying components (zero new scene code).
//
// Register: a fresh, clear Abbey narration — warm, metaphor-first, one tight
// thought per beat — over a steady (no impact-rig) neural background with
// modern emerald captions. Claims-disciplined: vision is labeled, not asserted.

import { useRef, useEffect, useMemo } from "react";
import { C, FONT, clamp } from "../film/tokens";
import { fade } from "../film/easing";
import { Stage, Sprite, useTime, useTimeline } from "../film/engine";
import { Grain, Vignette, GridBG } from "../film/primitives";
import { NeuralLayer } from "../film/neural";
import { speak, lineSpeechDur, VoiceToggle, stopSpeech, setSpeechPlaying, primeNeural, useVoiceReady } from "../film/narration";
import { SceneOpen, SceneClose } from "../film/scenes/title";
import { Scene3 } from "../film/scenes/intro";
import { SceneStorage } from "../film/scenes/extra";
import { ScenePersonaRouting, SceneVerifiableMemory } from "../film/scenes/core";
import { SceneGovernance, SceneNorthStar } from "../film/scenes/outro";
import { BeatPersona } from "../film/scenes/beats";

/* ── scene slots [start, end] in seconds — aligned to the narration ── */
const T = {
  open:    [0, 10],
  runtime: [10, 28],
  storage: [28, 43],
  memory:  [43, 60],
  minds:   [60, 76],
  pAbbey:  [76, 79],
  pAviva:  [79, 82],
  pAbi:    [82, 85],
  govern:  [85, 101],
  vision:  [101, 120],
  close:   [120, 132],
} as const;
const DURATION = 132;

/* ── narration: Abbey, clear register (one thought per beat) ── */
interface ELine { t: number; text: string; dur: number }
const RAW: Array<Omit<ELine, "dur">> = [
  { t: 1.2,  text: "This is MLAI — infrastructure for intelligence you can actually trust." },
  { t: 5.6,  text: "Let me walk you through it, calmly, one idea at a time." },
  // the runtime
  { t: 11.0, text: "Most AI is a single black box. We built something you can open." },
  { t: 16.4, text: "One runtime, in honest layers — memory, compute, and safety, each doing one job." },
  { t: 22.6, text: "Nothing hidden. Every layer is something you can name and inspect." },
  // storage
  { t: 29.0, text: "Underneath it all is WDBX — a memory that writes things down and keeps them." },
  { t: 35.6, text: "Think of it as a notebook the system can never quietly erase." },
  // verifiable memory
  { t: 44.0, text: "And that memory is verifiable." },
  { t: 47.8, text: "Every entry is sealed in a chain, each block signed by the one before it." },
  { t: 53.6, text: "Change a single word, and the whole chain notices. Tampering can't hide." },
  // three minds
  { t: 61.0, text: "On top of that memory live three minds — not one model pretending to be everything." },
  { t: 67.6, text: "Each question is scored, then sent to whoever should answer it." },
  { t: 76.2, text: "Abbey — the careful one, for proof and verified answers." },
  { t: 79.2, text: "Aviva — the explorer, for research and what comes next." },
  { t: 82.2, text: "Abi — the quick one, routing each request to the right place." },
  // governance
  { t: 86.4, text: "Before any answer reaches you, it's weighed against six principles." },
  { t: 92.0, text: "Truthfulness, safety, helpfulness, fairness, privacy, transparency." },
  { t: 97.0, text: "Six checks. Every response, governed." },
  // vision
  { t: 102.4, text: "The longer-term aim is a fabric of intelligence across every kind of hardware." },
  { t: 108.6, text: "That part is still vision — a direction we're honest about, not a promise." },
  { t: 114.2, text: "What's real today is the runtime, the memory, and the three minds." },
  // close
  { t: 121.4, text: "That's MLAI." },
  { t: 124.6, text: "Infrastructure for resilient intelligence — clear, verifiable, and yours." },
];
const SCRIPT: ELine[] = RAW.map((l) => ({ ...l, dur: clamp(l.text.length / 15 + 1.0, 3.0, 7.0) }));

function activeLine(time: number): ELine | null {
  let cur: ELine | null = null;
  for (const l of SCRIPT) if (time >= l.t && time <= l.t + l.dur) cur = l;
  return cur;
}

// Fires Abbey's lines off the true playhead (clock), so brushing the scrubber
// never mis-triggers speech. Mirrors the film/trailer/mega controllers.
function ExplainerNarration() {
  const { clock: time, playing } = useTimeline();
  const prev = useRef(0);
  const spoken = useRef<Set<number>>(new Set());
  useEffect(() => { primeNeural(SCRIPT); return () => stopSpeech(); }, []);
  useEffect(() => {
    const p = prev.current; prev.current = time;
    if (time < p - 0.35) {
      stopSpeech();
      spoken.current = new Set(SCRIPT.filter((l) => l.t <= time + 0.05).map((l) => l.t));
      return;
    }
    if (!playing) return;
    for (const line of SCRIPT) {
      if (p < line.t && time >= line.t && !spoken.current.has(line.t)) {
        spoken.current.add(line.t);
        speak("abbey", line.text);
      }
    }
  }, [time, playing]);
  useEffect(() => { setSpeechPlaying(playing); }, [playing]);
  return null;
}

// Modern emerald caption with karaoke highlight. Token split is memoized per line.
function ExplainerCaption() {
  const { time, playing } = useTimeline();
  const line = activeLine(time);
  const { tokens, wordIdx } = useMemo(() => {
    if (!line) return { tokens: [] as string[], wordIdx: [] as number[] };
    const tk = line.text.split(/(\s+)/);
    return { tokens: tk, wordIdx: tk.map((t, i) => (/\S/.test(t) ? i : -1)).filter((i) => i >= 0) };
  }, [line]);
  if (!line) return null;
  const op = fade(time - line.t, line.dur, 0.3, 0.45);
  const frac = clamp((time - line.t) / lineSpeechDur(line.text, 0.97), 0, 1);
  const spokenCount = Math.floor(frac * wordIdx.length);
  let seen = 0;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 64, zIndex: 42, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18, opacity: op, maxWidth: 1500, padding: "14px 30px", borderRadius: 999, background: "rgba(6,14,10,0.62)", border: `1px solid ${C.green}33`, backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", boxShadow: `0 18px 60px rgba(0,0,0,0.5)` }}>
        <span style={{ width: 9, height: 9, borderRadius: "50%", background: C.green, boxShadow: `0 0 14px ${C.green}`, opacity: playing ? 0.55 + 0.45 * Math.sin(time * 6) : 0.4, flexShrink: 0 }} />
        <span style={{ fontFamily: FONT.mono, fontSize: 13, letterSpacing: "0.28em", color: C.green, flexShrink: 0 }}>ABBEY</span>
        <span style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 32, letterSpacing: "-0.01em", textShadow: "0 2px 24px rgba(0,0,0,0.85)" }}>
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

/* ── calm neural background: an even colour drift, no impact rig ── */
function explainerMode(t: number): string {
  if (t < T.runtime[1]) return "build";
  if (t < T.minds[1]) return "resolve";
  if (t < T.govern[1]) return "order";
  if (t < T.vision[1]) return "fabric";
  return "bloom";
}
function ExplainerNeural() {
  const t = useTime();
  return <NeuralLayer mode={explainerMode(t)} opacity={0.6} />;
}

/* ── the cut ── */
export function Explainer() {
  const ready = useVoiceReady();
  return (
    <Stage width={1920} height={1080} duration={DURATION} background="#040406" persistKey="mlai-explainer" ready={ready}>
      <ExplainerNeural />
      <GridBG opacity={0.26} />
      <Vignette />

      <Sprite start={T.open[0]} end={T.open[1]}><SceneOpen /></Sprite>
      <Sprite start={T.runtime[0]} end={T.runtime[1]}><Scene3 /></Sprite>
      <Sprite start={T.storage[0]} end={T.storage[1]}><SceneStorage /></Sprite>
      <Sprite start={T.memory[0]} end={T.memory[1]}><SceneVerifiableMemory /></Sprite>
      <Sprite start={T.minds[0]} end={T.minds[1]}><ScenePersonaRouting /></Sprite>

      {/* three minds — each reveals with its own motion signature */}
      <Sprite start={T.pAbbey[0]} end={T.pAbbey[1]}><BeatPersona name="Abbey" role="proof · verified" accent={C.green} /></Sprite>
      <Sprite start={T.pAviva[0]} end={T.pAviva[1]}><BeatPersona name="Aviva" role="research · vision" accent={C.purple} /></Sprite>
      <Sprite start={T.pAbi[0]} end={T.pAbi[1]}><BeatPersona name="Abi" role="interactive · fast" accent={C.cyan} /></Sprite>

      <Sprite start={T.govern[0]} end={T.govern[1]}><SceneGovernance /></Sprite>
      <Sprite start={T.vision[0]} end={T.vision[1]}><SceneNorthStar /></Sprite>
      <Sprite start={T.close[0]} end={T.close[1]}><SceneClose /></Sprite>

      {/* Abbey voiceover + caption */}
      <ExplainerNarration />
      <ExplainerCaption />
      <VoiceToggle />

      <Grain />
    </Stage>
  );
}

export default Explainer;
