// neural-voice.ts — brand adapter over @mlai/trailer-engine's AudioEngine.
// Kokoro-82M via kokoro-js (ONNX Runtime Web · WebGPU→WASM). ES export only;
// wired into playback through narration.tsx (Abbey / Aviva / Abi).
//
// The engine itself (chunked gapless synthesis, click-free fades, crossfade on
// interrupt, per-speaker EQ chain through a bus compressor, reduced-motion
// gating, snapshot store, LRU cache, idle prewarm, retrying load, real
// pause/resume) lives in packages/trailer-engine/src/audio.ts and knows no
// brand. This file supplies what is MLAI's: the persona registry (voice ids and
// base prosody from tokens.ts, EQ chains and level trims authoritative here),
// the domain vocabulary Kokoro would otherwise mangle, the Kokoro loader, and
// the browser plumbing. The exported `NeuralVoice` object keeps the same
// surface it always had, so narration.tsx is unchanged.
//
// Design goals (unchanged):
//   • never block the film          • never throw into React
//   • always degrade to captions (narration.tsx) when unavailable

import {
  AudioEngine,
  type AudioContextLike,
  type PersonaVoiceRegistry,
  type Scheduler,
  type SpeakOptions,
  type VoiceSnapshot,
} from "@mlai/trailer-engine";

import { loadKokoro, MODEL_ID } from "./kokoro-loader";
import { PERSONAS } from "./tokens";

export type { VoiceSnapshot };

/* ─────────────────────────── brand data ─────────────────────────── */

// Persona → Kokoro voice, sourced from the persona registry (tokens.ts).
const DEFAULT_VOICES: Record<string, string> = {
  abbey: PERSONAS.abbey.voice,
  aviva: PERSONAS.aviva.voice,
  abi: PERSONAS.abi.voice,
};

// Selectable voices (handy for a future picker / debugging pronunciation).
const VOICE_CATALOG: { id: string; label: string }[] = [
  { id: "af_heart", label: "Heart · US ♀ (warm)" },
  { id: "af_bella", label: "Bella · US ♀ (bright)" },
  { id: "af_nicole", label: "Nicole · US ♀ (soft)" },
  { id: "af_aoede", label: "Aoede · US ♀ (clear)" },
  { id: "af_kore", label: "Kore · US ♀ (steady)" },
  { id: "af_sarah", label: "Sarah · US ♀ (calm)" },
  { id: "bf_emma", label: "Emma · UK ♀ (crisp)" },
  { id: "bf_isabella", label: "Isabella · UK ♀ (poised)" },
  { id: "am_michael", label: "Michael · US ♂" },
  { id: "am_adam", label: "Adam · US ♂" },
  { id: "bm_george", label: "George · UK ♂" },
  { id: "bm_lewis", label: "Lewis · UK ♂" },
];

// Per-persona voice direction. speed/gap come from the token registry; gain and
// eq are authoritative here. Abbey reads warm and unhurried; Aviva is quicker
// and brighter with presence/edge; Abi is calm, centred, an authoritative read.
const REGISTRY: PersonaVoiceRegistry = {
  speakers: {
    abbey: {
      voice: PERSONAS.abbey.voice,
      speed: PERSONAS.abbey.prosody.speed,
      gap: PERSONAS.abbey.prosody.gap,
      gain: 1.0,
      eq: [
        { type: "lowshelf", freq: 220, gain: 2.0 }, // body / warmth
        { type: "peaking", freq: 2400, q: 0.9, gain: 1.0 },
        { type: "highshelf", freq: 7000, gain: -1.5 }, // soften sibilance
      ],
    },
    aviva: {
      voice: PERSONAS.aviva.voice,
      speed: PERSONAS.aviva.prosody.speed,
      gap: PERSONAS.aviva.prosody.gap,
      gain: 0.98,
      eq: [
        { type: "highpass", freq: 90 }, // tighten lows
        { type: "peaking", freq: 3600, q: 1.1, gain: 3.0 }, // presence / edge
        { type: "highshelf", freq: 8500, gain: 1.5 }, // air
      ],
    },
    abi: {
      voice: PERSONAS.abi.voice,
      speed: PERSONAS.abi.prosody.speed,
      gap: PERSONAS.abi.prosody.gap,
      gain: 1.0,
      eq: [
        { type: "highpass", freq: 80 },
        { type: "lowshelf", freq: 160, gain: 1.0 }, // grounded low end
        { type: "peaking", freq: 2600, q: 1.0, gain: 1.8 }, // clarity / intelligibility
      ],
    },
  },
  defaultSpeaker: "abbey",
  fallbackVoice: "af_heart",
};

// Kokoro reads plain English well but mangles ALLCAPS tokens. Rewrite the MLAI
// vocabulary into phonetic-friendly text; the engine handles bare symbols
// (%, ≥, →, dashes) after these rows. Order matters.
const SPELL = (s: string): string => s.split("").join("‑"); // non-breaking hyphenated letters: W‑D‑B‑X
const PRONOUNCE: ReadonlyArray<readonly [RegExp, string]> = [
  [/\bWDBX\b/g, SPELL("WDBX")],
  [/\bMLAI\b/g, SPELL("MLAI")],
  [/\bHNSW\b/g, SPELL("HNSW")],
  [/\bSIMD\b/g, SPELL("SIMD")],
  [/\bABI\b/g, SPELL("ABI")], // the framework, not the persona "Abi"
  [/\bAPI\b/g, SPELL("API")],
  [/\bGPU\b/g, SPELL("GPU")],
  [/\bCPU\b/g, SPELL("CPU")],
  [/\bNPU\b/g, SPELL("NPU")],
  [/\bTPU\b/g, SPELL("TPU")],
  [/\bRAG\b/g, "rag"],
  [/\bSHA-?256\b/gi, "S‑H‑A two-fifty-six"],
  [/\bSHA\b/g, SPELL("SHA")],
  [/\bAI\b/g, "A.I."],
  [/\bMVCC\b/g, SPELL("MVCC")],
  [/\bWAL\b/g, "wall"],
  [/\bRaft\b/g, "raft"],
  [/\bZig\b/g, "Zig"],
  [/\bRecall@10\b/gi, "recall at ten"],
  [/\b(\d+(?:\.\d+)?)\s*ms\b/gi, "$1 milliseconds"],
  [/\bp50\b/gi, "p fifty"],
  [/\bp99\b/gi, "p ninety-nine"],
  [/\bQPS\b/g, "queries per second"],
  [/\bTOPS\b/g, "tops"],
  [/\bM4\b/g, "M four"],
  [/\bGB\/s\b/g, "gigabytes per second"],
  [/\bkWh\b/g, "kilowatt hours"],
  [/\bAviva\b/g, "Aveeva"],
  [/\bAbi\b/g, "Abbie"],
  [/\bvs\.?\b/gi, "versus"],
  [/(\d+(?:\.\d+)?)\s*×(?!\s*\d)/g, "$1 times"],
];

/* ─────────────────────────── browser plumbing ─────────────────────────── */

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

// Evaluated lazily so the module stays SSR-safe (window may be absent).
function prefersReduced(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function supported(): boolean {
  return (
    typeof window !== "undefined" &&
    !!(window.AudioContext || window.webkitAudioContext) &&
    typeof WebAssembly === "object"
  );
}

function createAudioContext(): AudioContextLike | null {
  const AC = window.AudioContext || window.webkitAudioContext;
  return AC ? (new AC() as unknown as AudioContextLike) : null;
}

const browserScheduler: Scheduler = {
  setTimeout: (fn, ms) => setTimeout(fn, ms),
  clearTimeout: (handle) => clearTimeout(handle as ReturnType<typeof setTimeout>),
  idle: (fn) => {
    if (typeof window !== "undefined" && typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(fn, { timeout: 1200 });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(fn, 60);
    return () => clearTimeout(id);
  },
};

// A module singleton, as before: the film and the persona cards share one
// model, one AudioContext and one cache. dispose() exists for tests and for a
// future per-Stage lifetime; nothing in the app calls it today.
const engine = new AudioEngine({
  registry: REGISTRY,
  loadTTS: loadKokoro,
  createAudioContext,
  isSupported: supported,
  prefersReducedMotion: prefersReduced,
  scheduler: browserScheduler,
  pronounce: PRONOUNCE,
  warn: (message, error) => console.warn(`[NeuralVoice] ${message}:`, error),
});

/* ─────────────────────────── public API ─────────────────────────── */

export interface NeuralVoiceAPI {
  MODEL_ID: string;
  VOICE_CATALOG: { id: string; label: string }[];
  DEFAULT_VOICES: Record<string, string>;
  // lifecycle
  load: () => Promise<boolean>;
  warm: (lines: { who?: string; text: string }[]) => Promise<void>;
  onChange: (fn: (s: VoiceSnapshot) => void) => () => void;
  snapshot: () => VoiceSnapshot;
  // synth + playback
  speak: (who: string, text: string, opts?: SpeakOptions) => Promise<number | null>;
  measure: (who: string, text: string) => Promise<number | null>;
  stop: () => void;
  // transport
  pause: () => void;
  resume: () => void;
  setVolume: (v: number) => void;
  duck: (level?: number, dur?: number) => () => void;
  // status
  isReady: () => boolean;
  isSupported: () => boolean;
  status: () => string;
  // voices
  setVoice: (who: string, id: string) => void;
  getVoice: (who: string) => string | undefined;
  // utilities
  normalizeText: (text: unknown) => string;
  chunkText: (text: string) => string[];
  clearCache: () => void;
}

export const NeuralVoice: NeuralVoiceAPI = {
  MODEL_ID,
  VOICE_CATALOG,
  DEFAULT_VOICES,
  load: () => engine.load(),
  warm: (lines) => engine.warm(lines),
  onChange: (fn) => engine.onChange(fn),
  snapshot: () => engine.snapshot(),
  speak: (who, text, opts) => engine.speak(who, text, opts),
  measure: (who, text) => engine.measure(who, text),
  stop: () => engine.stop(),
  pause: () => engine.pause(),
  resume: () => engine.resume(),
  setVolume: (v) => engine.setVolume(v),
  duck: (level, dur) => engine.duck(level, dur),
  isReady: () => engine.isReady(),
  isSupported: () => engine.isSupported(),
  status: () => engine.status(),
  setVoice: (who, id) => engine.setVoice(who, id),
  getVoice: (who) => engine.getVoice(who),
  normalizeText: (text) => engine.normalizeText(text),
  chunkText: (text) => engine.chunkText(text),
  clearCache: () => engine.clearCache(),
};
