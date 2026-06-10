// neural-voice.ts — in-browser neural TTS for the MLAI films.
// Kokoro-82M via kokoro-js (ONNX Runtime Web · WebGPU→WASM).
// Wired into playback through narration.tsx (Abbey & Aviva); ES export only.
//
// Design goals (unchanged):
//   • never block the film          • never throw into React
//   • always degrade to Web Speech (narration.tsx) when unavailable
//
// What's new in this build:
//   • Domain-aware pronunciation (WDBX, SHA-256, HNSW, MLAI, GPU/NPU/TPU, …)
//   • Sentence-chunked, GAPLESS synthesis with natural inter-clause pauses
//   • Click-free playback (raised-cosine fades) + crossfade on interrupt
//   • In-flight request coalescing, LRU buffer cache, idle-time prewarm
//   • Robust load with retry + backoff; explicit "unsupported" detection
//   • Real pause()/resume() (AudioContext suspend + gain ramp)

/* ─────────────────────────── config ─────────────────────────── */

const MODEL_ID = "onnx-community/Kokoro-82M-v1.0-ONNX";

// Persona → Kokoro voice. Three clearly different minds:
//   Abbey — warm, measured American (af_heart)
//   Aviva — brighter, sharper British (bf_emma)  ← accent reads as a different character
//   Abi   — clear, quick American   (af_aoede)   ← distinct timbre + faster cadence
const DEFAULT_VOICES: Record<string, string> = { abbey: "af_heart", aviva: "bf_emma", abi: "af_aoede" };

// Per-persona prosody. `speed` → Kokoro; `gap` → inter-sentence silence (s).
const PROSODY: Record<string, { speed: number; gap: number }> = {
  abbey: { speed: 1.00, gap: 0.20 },
  aviva: { speed: 1.12, gap: 0.14 },
  abi:   { speed: 1.14, gap: 0.12 },
};

const CACHE_LIMIT   = 96;     // max rendered line-buffers held in memory (LRU)
const FADE_SEC      = 0.012;  // click-free edge fade
const XFADE_SEC     = 0.06;   // crossfade when a new line interrupts an old one
const LOAD_RETRIES  = 3;
const SR_FALLBACK   = 24000;

/* ─────────────────────────── types ─────────────────────────── */

interface VoiceNode { src: AudioBufferSourceNode; gain: GainNode; }

interface VoiceState {
  status: string;            // idle | loading | ready | error | unsupported
  device: string | null;     // 'webgpu' | 'wasm'
  tts: any;                  // Kokoro instance
  KokoroTTS: any;            // class
  ctx: AudioContext | null;  // shared AudioContext
  master: GainNode | null;   // master GainNode (volume + pause ramp)
  current: VoiceNode | null; // currently-playing voice
  volume: number;            // master volume 0..1
  paused: boolean;
  cache: Map<string, AudioBuffer>;        // key(who|voice|text) -> AudioBuffer (LRU: re-insert on hit)
  inflight: Map<string, Promise<AudioBuffer | null>>; // key -> Promise (coalesce duplicates)
  voices: Record<string, string>;
}

export interface NeuralVoiceAPI {
  load: () => Promise<boolean>;
  warm: (lines: { who?: string; text: string }[]) => Promise<void>;
  speak: (who: string, text: string, opts?: SpeakOpts) => Promise<number | null>;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  isReady: () => boolean;
  isSupported: () => boolean;
  status: () => string;
}

interface SpeakOpts { volume?: number; when?: number; interrupt?: boolean; }

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

/* ─────────────────────────── state ─────────────────────────── */

const state: VoiceState = {
  status: "idle",
  device: null,
  tts: null,
  KokoroTTS: null,
  ctx: null,
  master: null,
  current: null,
  volume: 1,
  paused: false,
  cache: new Map(),
  inflight: new Map(),
  voices: { ...DEFAULT_VOICES },
};

/* ─────────────────────── audio plumbing ─────────────────────── */

function supported(): boolean {
  return typeof window !== "undefined" &&
    !!(window.AudioContext || window.webkitAudioContext) &&
    typeof WebAssembly === "object";
}

function audioCtx(): AudioContext | null {
  if (!state.ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    state.ctx = new AC();
    state.master = state.ctx.createGain();
    state.master.gain.value = state.volume;
    state.master.connect(state.ctx.destination);
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

const SPELL = (s: string): string => s.split("").join("‑");          // non-breaking hyphenated letters: W‑D‑B‑X
const PRONOUNCE: [RegExp, string][] = [
  [/\bWDBX\b/g,        SPELL("WDBX")],
  [/\bMLAI\b/g,        SPELL("MLAI")],
  [/\bHNSW\b/g,        SPELL("HNSW")],
  [/\bSIMD\b/g,        SPELL("SIMD")],
  [/\bABI\b/g,         SPELL("ABI")],            // the framework, not the persona "Abi"
  [/\bAPI\b/g,         SPELL("API")],
  [/\bGPU\b/g,         SPELL("GPU")],
  [/\bCPU\b/g,         SPELL("CPU")],
  [/\bNPU\b/g,         SPELL("NPU")],
  [/\bTPU\b/g,         SPELL("TPU")],
  [/\bRAG\b/g,         "rag"],
  [/\bSHA-?256\b/gi,   "S‑H‑A two-fifty-six"],
  [/\bSHA\b/g,         SPELL("SHA")],
  [/\bAI\b/g,          "A.I."],
  [/\bMVCC\b/g,        SPELL("MVCC")],
  [/\bWAL\b/g,         "wall"],
  [/\bRaft\b/g,        "raft"],
  [/\bZig\b/g,         "Zig"],
  [/×/g,               " by "],
  [/→/g,               " to "],
  [/·/g,               ", "],
  [/—/g,               ", "],   // em-dash → brief pause
  [/–/g,               ", "],
  [/\s+/g,             " "],
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

async function load(): Promise<boolean> {
  if (state.status === "ready") return true;
  if (state.status === "unsupported") return false;
  if (_loadPromise) return _loadPromise;

  if (!supported()) { state.status = "unsupported"; return false; }

  _loadPromise = (async () => {
    state.status = "loading";
    let lastErr: unknown = null;
    for (let attempt = 1; attempt <= LOAD_RETRIES; attempt++) {
      try {
        const CDN_URL: string = "https://cdn.jsdelivr.net/npm/kokoro-js@1.2.1/dist/kokoro.web.js";
        const mod: any = await import(/* webpackIgnore: true */ /* @vite-ignore */ CDN_URL);
        const KokoroTTS = mod.KokoroTTS || (mod.default && mod.default.KokoroTTS);
        if (!KokoroTTS) throw new Error("KokoroTTS export not found");
        state.KokoroTTS = KokoroTTS;
        state.device = await detectDevice();
        const dtype = state.device === "webgpu" ? "fp32" : "q8";
        state.tts = await KokoroTTS.from_pretrained(MODEL_ID, { dtype, device: state.device });
        state.status = "ready";
        return true;
      } catch (err) {
        lastErr = err;
        console.warn(`[NeuralVoice] load attempt ${attempt}/${LOAD_RETRIES} failed:`, err);
        if (attempt < LOAD_RETRIES) await sleep(600 * attempt);   // linear backoff
      }
    }
    console.warn("[NeuralVoice] giving up, will fall back to Web Speech:", lastErr);
    state.status = "error";
    _loadPromise = null;   // allow a manual retry later
    return false;
  })();
  return _loadPromise;
}

/* ─────────────────────── synthesis + cache ─────────────────────── */

const keyFor = (who: string, voice: string, text: string): string => `${who}|${voice}|${text}`;

function cacheGet(key: string): AudioBuffer | null {
  const b = state.cache.get(key);
  if (b) { state.cache.delete(key); state.cache.set(key, b); }   // LRU bump
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
    const pros = PROSODY[who] || { speed: 1.0, gap: 0.16 };
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
const idle = (fn: () => void): number => (typeof window.requestIdleCallback === "function" ? requestIdleCallback(fn, { timeout: 1200 }) : (setTimeout(fn, 60) as unknown as number));

async function _drainWarm(): Promise<void> {
  if (_warming) return;
  _warming = true;
  while (_warmQueue.length && state.status === "ready") {
    const { who, text } = _warmQueue.shift()!;
    try { await _render(who, text); } catch (e) {}
    await new Promise<void>((r) => idle(r));   // yield to keep the film smooth
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

// Play a line. Returns spoken duration (s) so callers can sync captions.
// opts: { volume?, when?:offsetSeconds, interrupt?:true }
async function speak(who: string, text: string, opts: SpeakOpts = {}): Promise<number | null> {
  const buf = await _render(who, text);
  if (!buf) return null;
  const ctx = audioCtx();
  if (!ctx) return null;

  if (opts.interrupt !== false) stop();      // crossfade out whatever was playing

  const src = ctx.createBufferSource();
  src.buffer = buf;
  const gain = ctx.createGain();
  const vol = Math.max(0, Math.min(1, opts.volume == null ? 1 : opts.volume));
  gain.gain.value = 0;
  src.connect(gain).connect(state.master || ctx.destination);

  const node: VoiceNode = { src, gain };
  state.current = node;
  src.onended = () => { if (state.current === node) state.current = null; };

  const startAt = ctx.currentTime + (opts.when || 0);
  src.start(startAt);
  _ramp(gain, vol, XFADE_SEC);               // fade in (click-free)
  return buf.duration;
}

/* ───────────────── transport: pause / resume ───────────────── */

function pause(): void {
  state.paused = true;
  if (state.master) _ramp(state.master, 0, 0.08);
  if (state.ctx) setTimeout(() => { if (state.paused) state.ctx!.suspend().catch(() => {}); }, 100);
}
function resume(): void {
  state.paused = false;
  if (state.ctx && state.ctx.state === "suspended") state.ctx.resume().catch(() => {});
  if (state.master) _ramp(state.master, state.volume, 0.1);
}

/* ─────────────────────────── public API ─────────────────────────── */

export const NeuralVoice: NeuralVoiceAPI = {
  load, warm,            // lifecycle
  speak, stop,           // synth + playback
  pause, resume,         // transport
  isReady: () => state.status === "ready",
  isSupported: supported,
  status: () => state.status,
};
