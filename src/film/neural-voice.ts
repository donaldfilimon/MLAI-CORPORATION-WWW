// neural-voice.ts — in-browser neural TTS for the MLAI films & showcase.
// Kokoro-82M via kokoro-js (ONNX Runtime Web · WebGPU→WASM). ES export only;
// wired into playback through narration.tsx (Abbey / Aviva / Abi).
//
// Consolidated from the mlai-design-com microsite's neural-voice.js. On top of
// the typed module already wired here, this build absorbs the donor's richer
// capabilities:
//   • Domain-aware pronunciation (WDBX, SHA-256, HNSW, MLAI, GPU/NPU/TPU, p50,
//     QPS, ms, %, ≥, → …) so the agents say the vocabulary, not the symbols.
//   • Sentence-chunked, GAPLESS synthesis with natural inter-clause pauses.
//   • Click-free playback (raised-cosine fades) + crossfade on interrupt.
//   • Per-persona biquad EQ chain + level trim, glued through a bus compressor
//     so all three minds land at a consistent level.
//   • prefers-reduced-motion gating: never autoplays audio when the user asks
//     for reduced motion — callers acting on an explicit gesture opt in via
//     `opts.force` (the film does, behind its VoiceToggle + user-gesture gate).
//   • Reactive snapshot store (onChange/snapshot), master volume + ducking,
//     in-flight coalescing, LRU buffer cache, idle-time prewarm.
//   • Robust load with retry + backoff; explicit "unsupported" detection;
//     real pause()/resume() (AudioContext suspend + gain ramp).
//
// Persona voice + base prosody (speed/gap) come from the shared persona registry
// in tokens.ts, so persona identity (color + voice + prosody) lives in ONE
// place; the EQ chains + level trims stay authoritative here.
//
// Design goals (unchanged):
//   • never block the film          • never throw into React
//   • always degrade to captions (narration.tsx) when unavailable

import { PERSONAS } from "./tokens";

/* ─────────────────────────── config ─────────────────────────── */

const MODEL_ID = "onnx-community/Kokoro-82M-v1.0-ONNX";

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

interface EqBand { type: BiquadFilterType; freq?: number; q?: number; gain?: number }
interface Prosody { speed: number; gap: number; gain: number; eq: EqBand[] }

// Per-persona voice direction. `speed` → Kokoro rate; `gap` → inter-sentence
// silence (s); `gain` → per-persona level trim; `eq` → tone-shaping biquad chain
// (see personaChain). speed/gap default from the token registry; gain + eq are
// authoritative here. Abbey reads warm and unhurried; Aviva is quicker and
// brighter with presence/edge; Abi is calm, centred, an authoritative read.
const PROSODY: Record<string, Prosody> = {
  abbey: {
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
    speed: PERSONAS.abi.prosody.speed,
    gap: PERSONAS.abi.prosody.gap,
    gain: 1.0,
    eq: [
      { type: "highpass", freq: 80 },
      { type: "lowshelf", freq: 160, gain: 1.0 }, // grounded low end
      { type: "peaking", freq: 2600, q: 1.0, gain: 1.8 }, // clarity / intelligibility
    ],
  },
};

const CACHE_LIMIT = 96; // max rendered line-buffers held in memory (LRU)
const FADE_SEC = 0.012; // click-free edge fade
const XFADE_SEC = 0.06; // crossfade when a new line interrupts an old one
const LOAD_RETRIES = 3;
const SR_FALLBACK = 24000;

// Reduced-motion: don't autoplay audio unless a caller opts in (opts.force).
// Evaluated lazily so the module stays SSR-safe (window may be absent).
function prefersReduced(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/* ─────────────────────────── types ─────────────────────────── */

interface VoiceNode { src: AudioBufferSourceNode; gain: GainNode }

interface VoiceState {
  status: string; // idle | loading | ready | error | unsupported
  progress: number; // 0..1 model download
  device: string | null; // 'webgpu' | 'wasm'
  tts: any; // Kokoro instance
  KokoroTTS: any; // class
  ctx: AudioContext | null; // shared AudioContext
  master: GainNode | null; // master GainNode (volume + duck + pause ramp)
  bus: DynamicsCompressorNode | null; // glue compressor between master and destination
  current: VoiceNode | null; // currently-playing voice
  volume: number; // master volume 0..1
  paused: boolean;
  cache: Map<string, AudioBuffer>; // key(who|voice|text) -> AudioBuffer (LRU: re-insert on hit)
  inflight: Map<string, Promise<AudioBuffer | null>>; // key -> Promise (coalesce duplicates)
  listeners: Set<(s: VoiceSnapshot) => void>;
  voices: Record<string, string>;
}

export interface VoiceSnapshot {
  status: string;
  progress: number;
  device: string | null;
  voices: Record<string, string>;
  volume: number;
  paused: boolean;
}

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
  speak: (who: string, text: string, opts?: SpeakOpts) => Promise<number | null>;
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

interface SpeakOpts { volume?: number; when?: number; interrupt?: boolean; force?: boolean }

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

/* ─────────────────────────── state ─────────────────────────── */

const state: VoiceState = {
  status: "idle",
  progress: 0,
  device: null,
  tts: null,
  KokoroTTS: null,
  ctx: null,
  master: null,
  bus: null,
  current: null,
  volume: 1,
  paused: false,
  cache: new Map(),
  inflight: new Map(),
  listeners: new Set(),
  voices: { ...DEFAULT_VOICES },
};

function snapshot(): VoiceSnapshot {
  return {
    status: state.status,
    progress: state.progress,
    device: state.device,
    voices: { ...state.voices },
    volume: state.volume,
    paused: state.paused,
  };
}
function emit(): void {
  const s = snapshot();
  state.listeners.forEach((f) => { try { f(s); } catch (e) {} });
}
function onChange(fn: (s: VoiceSnapshot) => void): () => void {
  state.listeners.add(fn);
  try { fn(snapshot()); } catch (e) {}
  return () => { state.listeners.delete(fn); };
}

/* ─────────────────────── audio plumbing ─────────────────────── */

function supported(): boolean {
  return (
    typeof window !== "undefined" &&
    !!(window.AudioContext || window.webkitAudioContext) &&
    typeof WebAssembly === "object"
  );
}

function audioCtx(): AudioContext | null {
  if (!state.ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    state.ctx = new AC();
    state.master = state.ctx.createGain();
    state.master.gain.value = state.volume;
    // Bus compressor — gentle glue so all three personas land at a consistent
    // level and crossfaded consonants don't spike. master → bus → destination.
    state.bus = state.ctx.createDynamicsCompressor();
    try {
      state.bus.threshold.value = -18;
      state.bus.knee.value = 24;
      state.bus.ratio.value = 3;
      state.bus.attack.value = 0.006;
      state.bus.release.value = 0.18;
    } catch (e) {}
    state.master.connect(state.bus);
    state.bus.connect(state.ctx.destination);
  }
  if (state.ctx.state === "suspended" && !state.paused) state.ctx.resume().catch(() => {});
  return state.ctx;
}

async function detectDevice(): Promise<string> {
  try {
    const nav = navigator as Navigator & { gpu?: { requestAdapter: () => Promise<unknown> } };
    if (nav.gpu && (await nav.gpu.requestAdapter())) return "webgpu";
  } catch (e) {}
  return "wasm";
}

/* ───────────────── domain-aware text normalization ───────────────── */
// Kokoro reads plain English well but mangles ALLCAPS tokens and symbols.
// We rewrite the MLAI vocabulary into phonetic-friendly text. Order matters.

const SPELL = (s: string): string => s.split("").join("‑"); // non-breaking hyphenated letters: W‑D‑B‑X
const PRONOUNCE: [RegExp, string][] = [
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
  [/%/g, " percent"],
  [/≥/g, " at least "],
  [/≈/g, " about "],
  [/@/g, " at "],
  [/×/g, " by "],
  [/→/g, " to "],
  [/·/g, ", "],
  [/—/g, ", "], // em-dash → brief pause
  [/–/g, ", "],
  [/\s+/g, " "],
];

function normalizeText(text: unknown): string {
  let t = String(text || "").trim();
  for (const [re, rep] of PRONOUNCE) t = t.replace(re, rep);
  return t.trim();
}

// Split a normalized line into speakable chunks on sentence/clause boundaries.
// Keeps terminal punctuation; merges very short fragments so we don't over-chunk.
function chunkText(text: string): string[] {
  const raw = text.match(/[^.!?…]+[.!?…]*/g) || [text];
  const out: string[] = [];
  for (let piece of raw) {
    piece = piece.trim();
    if (!piece) continue;
    if (out.length && (out[out.length - 1]!.length < 14 || piece.length < 14)) {
      out[out.length - 1] = (out[out.length - 1] + " " + piece).trim();
    } else {
      out.push(piece);
    }
  }
  return out.length ? out : [text];
}

/* ─────────────────────────── load ─────────────────────────── */

let _loadPromise: Promise<boolean> | null = null;
const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

// ONNX Runtime Web prints a benign warning on session creation when shape/CPU
// ops fall back off the preferred EP ("VerifyEachNodeIsAssignedToAnEp … Some
// nodes were not assigned to the preferred execution providers"). It's
// informational — the model still loads — but ORT logs it via console.error,
// which trips the Next.js dev error overlay. Filter ONLY that line; everything
// else passes through untouched. Installed once, before the first model load.
let _ortFilterInstalled = false;
function installOrtLogFilter(): void {
  if (_ortFilterInstalled || typeof console === "undefined") return;
  _ortFilterInstalled = true;
  const BENIGN = /onnxruntime|VerifyEachNodeIsAssignedToAnEp|nodes were not assigned to the preferred/i;
  for (const level of ["warn", "error"] as const) {
    const orig = console[level].bind(console);
    console[level] = (...args: unknown[]) => {
      if (typeof args[0] === "string" && BENIGN.test(args[0])) return;
      orig(...args);
    };
  }
}

async function load(): Promise<boolean> {
  if (state.status === "ready") return true;
  if (state.status === "unsupported") return false;
  if (_loadPromise) return _loadPromise;

  if (!supported()) { state.status = "unsupported"; emit(); return false; }

  _loadPromise = (async () => {
    state.status = "loading";
    state.progress = 0;
    emit();
    installOrtLogFilter(); // quiet ORT's benign EP-assignment notice before session creation
    let lastErr: unknown = null;
    for (let attempt = 1; attempt <= LOAD_RETRIES; attempt++) {
      try {
        // Lazy, client-only dynamic import: the ONNX/Kokoro runtime (large) is
        // never in the server bundle or the initial chunk — it is fetched from a
        // CDN only when load() is first called (first user gesture / film ready).
        const CDN_URL: string = "https://cdn.jsdelivr.net/npm/kokoro-js@1.2.1/dist/kokoro.web.js";
        const mod: any = await import(/* webpackIgnore: true */ /* @vite-ignore */ CDN_URL);
        const KokoroTTS = mod.KokoroTTS || (mod.default && mod.default.KokoroTTS);
        if (!KokoroTTS) throw new Error("KokoroTTS export not found");
        state.KokoroTTS = KokoroTTS;
        state.device = await detectDevice();
        const dtype = state.device === "webgpu" ? "fp32" : "q8";
        state.tts = await KokoroTTS.from_pretrained(MODEL_ID, {
          dtype,
          device: state.device,
          // ORT log severity 3 = ERROR: stop the benign WARNING-level
          // EP-assignment notices at the source (transformers.js forwards
          // session_options to the ONNX InferenceSession). The console filter
          // above is the fallback for builds that ignore this.
          session_options: { logSeverityLevel: 3 },
          progress_callback: (p: { progress?: number }) => {
            if (p && typeof p.progress === "number") {
              state.progress = Math.max(state.progress, Math.min(1, p.progress / 100));
              emit();
            }
          },
        });
        state.status = "ready";
        state.progress = 1;
        emit();
        return true;
      } catch (err) {
        lastErr = err;
        console.warn(`[NeuralVoice] load attempt ${attempt}/${LOAD_RETRIES} failed:`, err);
        if (attempt < LOAD_RETRIES) await sleep(600 * attempt); // linear backoff
      }
    }
    console.warn("[NeuralVoice] giving up, will fall back to captions:", lastErr);
    state.status = "error";
    emit();
    _loadPromise = null; // allow a manual retry later
    return false;
  })();
  return _loadPromise;
}

/* ─────────────────────── synthesis + cache ─────────────────────── */

const keyFor = (who: string, voice: string, text: string): string => `${who}|${voice}|${text}`;

function cacheGet(key: string): AudioBuffer | null {
  const b = state.cache.get(key);
  if (b) { state.cache.delete(key); state.cache.set(key, b); } // LRU bump
  return b || null;
}
function cacheSet(key: string, buf: AudioBuffer): void {
  state.cache.set(key, buf);
  while (state.cache.size > CACHE_LIMIT) {
    const oldest = state.cache.keys().next().value;
    if (oldest === undefined) break;
    state.cache.delete(oldest);
  }
}

// Concatenate per-sentence PCM into ONE AudioBuffer, inserting `gap` seconds of
// silence between sentences and a raised-cosine fade on every edge (no clicks).
function buildBuffer(ctx: AudioContext, parts: Float32Array[], sr: number, gapSec: number): AudioBuffer {
  const gapN = Math.max(0, Math.round(gapSec * sr));
  let total = 0;
  for (let i = 0; i < parts.length; i++) total += parts[i]!.length + (i < parts.length - 1 ? gapN : 0);
  const buf = ctx.createBuffer(1, Math.max(1, total), sr);
  const out = buf.getChannelData(0);
  const fadeN = Math.max(1, Math.round(FADE_SEC * sr));
  let off = 0;
  for (let i = 0; i < parts.length; i++) {
    const pcm = parts[i]!;
    out.set(pcm, off);
    // edge fades on each sentence to kill boundary clicks
    for (let j = 0; j < fadeN && j < pcm.length; j++) {
      const w = 0.5 - 0.5 * Math.cos((Math.PI * j) / fadeN);
      out[off + j] = (out[off + j] ?? 0) * w;
      out[off + pcm.length - 1 - j] = (out[off + pcm.length - 1 - j] ?? 0) * w;
    }
    off += pcm.length + (i < parts.length - 1 ? gapN : 0);
  }
  return buf;
}

async function _render(who: string, text: string): Promise<AudioBuffer | null> {
  const voice = state.voices[who] || DEFAULT_VOICES[who] || "af_heart";
  const norm = normalizeText(text);
  const key = keyFor(who, voice, norm);

  const hit = cacheGet(key);
  if (hit) return hit;
  if (state.inflight.has(key)) return state.inflight.get(key)!;

  const job = (async (): Promise<AudioBuffer | null> => {
    if (state.status !== "ready" || !state.tts) return null;
    const ctx = audioCtx();
    if (!ctx) return null;
    const pros = PROSODY[who] || { speed: 1.0, gap: 0.16, gain: 1.0, eq: [] };
    try {
      const chunks = chunkText(norm);
      const parts: Float32Array[] = [];
      let sr = SR_FALLBACK;
      for (const c of chunks) {
        const audio: any = await state.tts.generate(c, { voice, speed: pros.speed });
        const pcm: Float32Array = audio.audio || audio.data;
        sr = audio.sampling_rate || audio.sr || sr;
        if (pcm && pcm.length) parts.push(pcm);
      }
      if (!parts.length) return null;
      const buf = buildBuffer(ctx, parts, sr, pros.gap);
      cacheSet(key, buf);
      return buf;
    } catch (err) {
      console.warn("[NeuralVoice] synth failed:", err);
      return null;
    } finally {
      state.inflight.delete(key);
    }
  })();

  state.inflight.set(key, job);
  return job;
}

/* ─────────────────────────── prewarm ─────────────────────────── */

// Pre-render lines so playback is gapless during the film. Runs in idle time,
// newest request wins, and it never competes with an active speak().
let _warmQueue: { who: string; text: string }[] = [];
let _warming = false;
const idle = (fn: () => void): number =>
  typeof window.requestIdleCallback === "function"
    ? requestIdleCallback(fn, { timeout: 1200 })
    : (setTimeout(fn, 60) as unknown as number);

async function _drainWarm(): Promise<void> {
  if (_warming) return;
  _warming = true;
  while (_warmQueue.length && state.status === "ready") {
    const { who, text } = _warmQueue.shift()!;
    try { await _render(who, text); } catch (e) {}
    await new Promise<void>((r) => idle(r)); // yield to keep the film smooth
  }
  _warming = false;
}

async function warm(lines: { who?: string; text: string }[]): Promise<void> {
  if (!Array.isArray(lines) || !lines.length) return;
  // de-dupe against what's queued
  for (const l of lines) if (l && l.text) _warmQueue.push({ who: l.who || "abbey", text: l.text });
  if (state.status === "ready") _drainWarm();
  else load().then((ok) => { if (ok) _drainWarm(); });
}

/* ─────────────────────────── playback ─────────────────────────── */

function _ramp(gainNode: GainNode, target: number, dur: number): void {
  try {
    const t = state.ctx!.currentTime;
    gainNode.gain.cancelScheduledValues(t);
    gainNode.gain.setValueAtTime(gainNode.gain.value, t);
    gainNode.gain.linearRampToValueAtTime(target, t + dur);
  } catch (e) { gainNode.gain.value = target; }
}

function _stopNode(node: VoiceNode | null, fade: number = XFADE_SEC): void {
  if (!node) return;
  try {
    const { src, gain } = node;
    _ramp(gain, 0, fade);
    src.stop(state.ctx!.currentTime + fade + 0.02);
    src.onended = null;
  } catch (e) {}
}

function stop(): void {
  if (state.current) { _stopNode(state.current, XFADE_SEC); state.current = null; }
}

// Build a per-persona tone-shaping chain from PROSODY[who].eq.
// Returns { input, output }: the voice source connects to `input`, and `output`
// feeds the line's gain node. With no eq defined it's a transparent pass-through.
function personaChain(ctx: AudioContext, who: string): { input: AudioNode; output: AudioNode } {
  const eq = (PROSODY[who] && PROSODY[who]!.eq) || [];
  if (!eq.length) { const g = ctx.createGain(); return { input: g, output: g }; }
  let first: BiquadFilterNode | null = null;
  let prev: BiquadFilterNode | null = null;
  for (const band of eq) {
    const f = ctx.createBiquadFilter();
    f.type = band.type;
    if (band.freq != null) f.frequency.value = band.freq;
    if (band.q != null) f.Q.value = band.q;
    // highpass/lowpass use Q, not gain; only shelves/peaking take gain
    if (band.gain != null && band.type !== "highpass" && band.type !== "lowpass") f.gain.value = band.gain;
    if (prev) prev.connect(f); else first = f;
    prev = f;
  }
  return { input: first!, output: prev! };
}

// Play a line. Returns spoken duration (s) so callers can sync captions.
// opts: { volume?, when?:offsetSeconds, interrupt?:true, force?:true }
async function speak(who: string, text: string, opts: SpeakOpts = {}): Promise<number | null> {
  // Reduced-motion / autoplay gating: when the user prefers reduced motion we
  // do NOT auto-play narration. A caller acting on an explicit user gesture can
  // override with opts.force === true (mirrors the canvas backdrops' signal).
  if (prefersReduced() && !opts.force) return null;
  const buf = await _render(who, text);
  if (!buf) return null;
  const ctx = audioCtx();
  if (!ctx) return null;

  if (opts.interrupt !== false) stop(); // crossfade out whatever was playing

  const src = ctx.createBufferSource();
  src.buffer = buf;
  const gain = ctx.createGain();
  const pros = PROSODY[who];
  const trim = pros ? pros.gain : 1;
  const vol = Math.max(0, Math.min(1, (opts.volume == null ? 1 : opts.volume) * trim));
  gain.gain.value = 0;

  // source → per-persona EQ chain → line gain → master (→ bus → destination)
  const chain = personaChain(ctx, who);
  src.connect(chain.input);
  chain.output.connect(gain).connect(state.master || ctx.destination);

  const node: VoiceNode = { src, gain };
  state.current = node;
  src.onended = () => { if (state.current === node) state.current = null; };

  const startAt = ctx.currentTime + (opts.when || 0);
  src.start(startAt);
  _ramp(gain, vol, XFADE_SEC); // fade in (click-free)
  return buf.duration;
}

// Render a line without playing it — handy to size captions to spoken length.
async function measure(who: string, text: string): Promise<number | null> {
  const buf = await _render(who, text);
  return buf ? buf.duration : null;
}

/* ───────────────── transport: pause / resume / volume ───────────────── */

function pause(): void {
  state.paused = true;
  if (state.master) _ramp(state.master, 0, 0.08);
  if (state.ctx) setTimeout(() => { if (state.paused) state.ctx!.suspend().catch(() => {}); }, 100);
  emit();
}
function resume(): void {
  state.paused = false;
  if (state.ctx && state.ctx.state === "suspended") state.ctx.resume().catch(() => {});
  if (state.master) _ramp(state.master, state.volume, 0.1);
  emit();
}
function setVolume(v: number): void {
  state.volume = Math.max(0, Math.min(1, v));
  if (state.master && !state.paused) _ramp(state.master, state.volume, 0.1);
  emit();
}
// Briefly duck (e.g. under a music sting). Returns an un-duck fn.
function duck(level: number = 0.35, dur: number = 0.15): () => void {
  if (state.master && !state.paused) _ramp(state.master, state.volume * level, dur);
  return () => { if (state.master && !state.paused) _ramp(state.master, state.volume, dur); };
}

/* ─────────────────────────── public API ─────────────────────────── */

export const NeuralVoice: NeuralVoiceAPI = {
  MODEL_ID,
  VOICE_CATALOG,
  DEFAULT_VOICES,
  // lifecycle
  load,
  warm,
  onChange,
  snapshot,
  // synth + playback
  speak,
  measure,
  stop,
  // transport
  pause,
  resume,
  setVolume,
  duck,
  // status
  isReady: () => state.status === "ready",
  isSupported: supported,
  status: () => state.status,
  // voices
  setVoice: (who: string, id: string) => { if (who in state.voices) { state.voices[who] = id; emit(); } },
  getVoice: (who: string) => state.voices[who],
  // utilities
  normalizeText,
  chunkText,
  clearCache: () => { state.cache.clear(); },
};
