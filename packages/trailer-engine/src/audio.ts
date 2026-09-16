// audio.ts — neural narration engine. Zero imports, no DOM globals.
//
// Everything a browser would supply is injected: the TTS loader, the audio
// context factory, the reduced-motion query and the scheduler. That keeps the
// engine free of brand data and testable in Node with hand-written fakes, and
// it is what lets the persona registry be a constructor argument rather than an
// import. The brand adapter (apps/web/src/film/neural-voice.ts) owns the
// personas, the pronunciation vocabulary and the Kokoro CDN import.
//
// Disposal follows playback.ts: every async continuation captures the current
// generation on entry and bails before touching state if dispose() has since
// moved it, so a late model load or synthesis cannot resurrect a torn-down
// engine.

/* ─────────────────────────── injected shapes ─────────────────────────── */

export type EqBandType =
  | "lowshelf"
  | "highshelf"
  | "peaking"
  | "highpass"
  | "lowpass"
  | "notch"
  | "bandpass"
  | "allpass";

export interface EqBand {
  type: EqBandType;
  freq?: number;
  q?: number;
  gain?: number;
}

/** One speaker's voice direction: Kokoro voice id plus prosody and tone. */
export interface PersonaVoice {
  voice: string;
  /** TTS rate multiplier. */
  speed: number;
  /** Inter-sentence silence in seconds. */
  gap: number;
  /** Per-speaker level trim, 0..1. */
  gain: number;
  eq: EqBand[];
}

export interface PersonaVoiceRegistry {
  speakers: Readonly<Record<string, PersonaVoice>>;
  /** Speaker used by warm() when a line names none. */
  defaultSpeaker: string;
  /** Voice id used for a speaker the registry does not know. */
  fallbackVoice: string;
}

export interface TTSAudio {
  audio?: Float32Array;
  data?: Float32Array;
  sampling_rate?: number;
  sr?: number;
}

export interface TTSHandle {
  generate(text: string, opts: { voice: string; speed: number }): Promise<TTSAudio>;
}

/**
 * One load attempt. Retries and backoff live in the engine; the loader reports
 * download progress in 0..1 and resolves with the synthesizer and the device
 * it landed on ("webgpu" | "wasm" | anything the adapter reports).
 */
export type LoadTTS = (reportProgress: (p01: number) => void) => Promise<{ tts: TTSHandle; device: string }>;

export interface Scheduler {
  setTimeout(fn: () => void, ms: number): unknown;
  clearTimeout(handle: unknown): void;
  /** Run `fn` when the host is idle. Returns a cancel function. */
  idle(fn: () => void): () => void;
}

export interface AudioParamLike {
  value: number;
  cancelScheduledValues(t: number): unknown;
  setValueAtTime(v: number, t: number): unknown;
  linearRampToValueAtTime(v: number, t: number): unknown;
}

export interface AudioNodeLike {
  connect(destination: AudioNodeLike): unknown;
}

export interface GainNodeLike extends AudioNodeLike {
  gain: AudioParamLike;
}

export interface BiquadNodeLike extends AudioNodeLike {
  type: string;
  frequency: AudioParamLike;
  Q: AudioParamLike;
  gain: AudioParamLike;
}

export interface CompressorNodeLike extends AudioNodeLike {
  threshold: AudioParamLike;
  knee: AudioParamLike;
  ratio: AudioParamLike;
  attack: AudioParamLike;
  release: AudioParamLike;
}

export interface AudioBufferLike {
  duration: number;
  getChannelData(channel: number): Float32Array;
}

export interface BufferSourceLike extends AudioNodeLike {
  buffer: AudioBufferLike | null;
  onended: (() => void) | null;
  start(when?: number): void;
  stop(when?: number): void;
}

export interface AudioContextLike {
  state: string;
  currentTime: number;
  destination: AudioNodeLike;
  resume(): Promise<unknown>;
  suspend(): Promise<unknown>;
  close?(): Promise<unknown>;
  createGain(): GainNodeLike;
  createDynamicsCompressor(): CompressorNodeLike;
  createBiquadFilter(): BiquadNodeLike;
  createBuffer(channels: number, length: number, sampleRate: number): AudioBufferLike;
  createBufferSource(): BufferSourceLike;
}

export interface AudioEngineOptions {
  registry: PersonaVoiceRegistry;
  loadTTS: LoadTTS;
  createAudioContext: () => AudioContextLike | null;
  /** Host capability check (WebAssembly, AudioContext). Defaults to supported. */
  isSupported?: () => boolean;
  /** Evaluated per speak() so a media-query change is honoured without a reload. */
  prefersReducedMotion: () => boolean;
  scheduler: Scheduler;
  /** Brand pronunciation rows, applied before the engine's symbol rows. */
  pronounce?: ReadonlyArray<readonly [RegExp, string]>;
  /** Diagnostic sink. Defaults to silence; the engine never touches console. */
  warn?: (message: string, error?: unknown) => void;
  cacheLimit?: number;
  loadRetries?: number;
  retryBackoffMs?: number;
  fadeSec?: number;
  crossfadeSec?: number;
  sampleRateFallback?: number;
}

export interface VoiceSnapshot {
  status: string;
  progress: number;
  device: string | null;
  voices: Record<string, string>;
  volume: number;
  paused: boolean;
}

export interface SpeakOptions {
  volume?: number;
  /** Start offset in seconds. */
  when?: number;
  /** Crossfade out the current line first. Default true. */
  interrupt?: boolean;
  /** Play even under prefers-reduced-motion (explicit user gesture). */
  force?: boolean;
}

interface VoiceNode {
  src: BufferSourceLike;
  gain: GainNodeLike;
}

/* ───────────────────── engine-owned text normalization ───────────────────── */

// Symbols every TTS mangles. Brand vocabulary is the adapter's, via `pronounce`.
const SYMBOL_ROWS: ReadonlyArray<readonly [RegExp, string]> = [
  [/%/g, " percent"],
  [/≥/g, " at least "],
  [/≈/g, " about "],
  [/@/g, " at "],
  [/×/g, " by "],
  [/→/g, " to "],
  [/·/g, ", "],
  [/—/g, ", "],
  [/–/g, ", "],
  [/\s+/g, " "],
];

/** Split a normalized line on sentence boundaries, merging short fragments. */
export function chunkText(text: string): string[] {
  const raw = text.match(/[^.!?…]+[.!?…]*/g) || [text];
  const out: string[] = [];
  for (let piece of raw) {
    piece = piece.trim();
    if (!piece) continue;
    const last = out[out.length - 1];
    if (last !== undefined && (last.length < 14 || piece.length < 14)) {
      out[out.length - 1] = `${last} ${piece}`.trim();
    } else {
      out.push(piece);
    }
  }
  return out.length ? out : [text];
}

/* ─────────────────────────────── engine ─────────────────────────────── */

export class AudioEngine {
  private readonly registry: PersonaVoiceRegistry;
  private readonly loadTTS: LoadTTS;
  private readonly createAudioContext: () => AudioContextLike | null;
  private readonly supported: () => boolean;
  private readonly prefersReducedMotion: () => boolean;
  private readonly scheduler: Scheduler;
  private readonly pronounce: ReadonlyArray<readonly [RegExp, string]>;
  private readonly warn: (message: string, error?: unknown) => void;
  private readonly cacheLimit: number;
  private readonly loadRetries: number;
  private readonly retryBackoffMs: number;
  private readonly fadeSec: number;
  private readonly crossfadeSec: number;
  private readonly sampleRateFallback: number;

  private status_ = "idle"; // idle | loading | ready | error | unsupported
  private progress = 0;
  private device: string | null = null;
  private tts: TTSHandle | null = null;
  private ctx: AudioContextLike | null = null;
  private master: GainNodeLike | null = null;
  private current: VoiceNode | null = null;
  private volume = 1;
  private paused = false;
  private readonly voices: Record<string, string>;
  private readonly cache = new Map<string, AudioBufferLike>();
  private readonly inflight = new Map<string, Promise<AudioBufferLike | null>>();
  private readonly listeners = new Set<(s: VoiceSnapshot) => void>();
  private loadPromise: Promise<boolean> | null = null;
  private warmQueue: { who: string; text: string }[] = [];
  private warming = false;

  /** Bumped by dispose(); every async continuation checks it before writing. */
  private generation = 0;
  private readonly timers = new Set<unknown>();
  private readonly idleCancels = new Set<() => void>();
  private readonly sleepers = new Set<() => void>();
  private disposed = false;

  constructor(opts: AudioEngineOptions) {
    this.registry = opts.registry;
    this.loadTTS = opts.loadTTS;
    this.createAudioContext = opts.createAudioContext;
    this.supported = opts.isSupported ?? (() => true);
    this.prefersReducedMotion = opts.prefersReducedMotion;
    this.scheduler = opts.scheduler;
    this.pronounce = opts.pronounce ?? [];
    this.warn = opts.warn ?? (() => {});
    this.cacheLimit = opts.cacheLimit ?? 96;
    this.loadRetries = opts.loadRetries ?? 3;
    this.retryBackoffMs = opts.retryBackoffMs ?? 600;
    this.fadeSec = opts.fadeSec ?? 0.012;
    this.crossfadeSec = opts.crossfadeSec ?? 0.06;
    this.sampleRateFallback = opts.sampleRateFallback ?? 24000;
    this.voices = {};
    for (const [who, persona] of Object.entries(opts.registry.speakers)) this.voices[who] = persona.voice;
  }

  /* ── snapshot store ── */

  snapshot(): VoiceSnapshot {
    return {
      status: this.status_,
      progress: this.progress,
      device: this.device,
      voices: { ...this.voices },
      volume: this.volume,
      paused: this.paused,
    };
  }

  onChange(fn: (s: VoiceSnapshot) => void): () => void {
    this.listeners.add(fn);
    try {
      fn(this.snapshot());
    } catch {
      /* listener errors never reach the engine */
    }
    return () => {
      this.listeners.delete(fn);
    };
  }

  private emit(): void {
    const s = this.snapshot();
    this.listeners.forEach((f) => {
      try {
        f(s);
      } catch {
        /* see onChange */
      }
    });
  }

  /* ── status ── */

  status(): string {
    return this.status_;
  }

  isReady(): boolean {
    return this.status_ === "ready";
  }

  isSupported(): boolean {
    return this.supported();
  }

  /* ── voices ── */

  setVoice(who: string, id: string): void {
    if (!(who in this.voices)) return;
    this.voices[who] = id;
    this.emit();
  }

  getVoice(who: string): string | undefined {
    return this.voices[who];
  }

  private resolveSpeaker(who: string): PersonaVoice {
    const persona = this.registry.speakers[who];
    if (persona) return { ...persona, voice: this.voices[who] ?? persona.voice };
    return { voice: this.registry.fallbackVoice, speed: 1, gap: 0.16, gain: 1, eq: [] };
  }

  /* ── text ── */

  normalizeText(text: unknown): string {
    let t = String(text || "").trim();
    for (const [re, rep] of this.pronounce) t = t.replace(re, rep);
    for (const [re, rep] of SYMBOL_ROWS) t = t.replace(re, rep);
    return t.trim();
  }

  chunkText(text: string): string[] {
    return chunkText(text);
  }

  /* ── scheduling helpers, all generation-aware ── */

  private sleep(ms: number): Promise<void> {
    return new Promise<void>((resolve) => {
      let handle: unknown;
      const finish = () => {
        this.timers.delete(handle);
        this.sleepers.delete(finish);
        resolve();
      };
      handle = this.scheduler.setTimeout(finish, ms);
      this.timers.add(handle);
      this.sleepers.add(finish);
    });
  }

  private idle(): Promise<void> {
    return new Promise<void>((resolve) => {
      const cancel = this.scheduler.idle(() => {
        this.idleCancels.delete(cancel);
        resolve();
      });
      this.idleCancels.add(cancel);
    });
  }

  /* ── audio graph ── */

  private audioCtx(): AudioContextLike | null {
    if (!this.ctx) {
      const ctx = this.createAudioContext();
      if (!ctx) return null;
      this.ctx = ctx;
      const master = ctx.createGain();
      master.gain.value = this.volume;
      // Bus compressor: gentle glue so every speaker lands at a consistent
      // level and crossfaded consonants do not spike. master → bus → out.
      const bus = ctx.createDynamicsCompressor();
      try {
        bus.threshold.value = -18;
        bus.knee.value = 24;
        bus.ratio.value = 3;
        bus.attack.value = 0.006;
        bus.release.value = 0.18;
      } catch {
        /* a fake or a locked param leaves the defaults */
      }
      master.connect(bus);
      bus.connect(ctx.destination);
      this.master = master;
    }
    if (this.ctx.state === "suspended" && !this.paused) this.ctx.resume().catch(() => {});
    return this.ctx;
  }

  private ramp(gainNode: GainNodeLike, target: number, dur: number): void {
    const ctx = this.ctx;
    try {
      if (!ctx) throw new Error("no context");
      const t = ctx.currentTime;
      gainNode.gain.cancelScheduledValues(t);
      gainNode.gain.setValueAtTime(gainNode.gain.value, t);
      gainNode.gain.linearRampToValueAtTime(target, t + dur);
    } catch {
      gainNode.gain.value = target;
    }
  }

  private stopNode(node: VoiceNode | null, fade: number): void {
    if (!node) return;
    try {
      this.ramp(node.gain, 0, fade);
      node.src.stop((this.ctx?.currentTime ?? 0) + fade + 0.02);
      node.src.onended = null;
    } catch {
      /* already stopped */
    }
  }

  private personaChain(ctx: AudioContextLike, eq: EqBand[]): { input: AudioNodeLike; output: AudioNodeLike } {
    if (!eq.length) {
      const g = ctx.createGain();
      return { input: g, output: g };
    }
    let first: BiquadNodeLike | null = null;
    let prev: BiquadNodeLike | null = null;
    for (const band of eq) {
      const f = ctx.createBiquadFilter();
      f.type = band.type;
      if (band.freq != null) f.frequency.value = band.freq;
      if (band.q != null) f.Q.value = band.q;
      // highpass/lowpass use Q, not gain; only shelves and peaking take gain.
      if (band.gain != null && band.type !== "highpass" && band.type !== "lowpass") f.gain.value = band.gain;
      if (prev) prev.connect(f);
      else first = f;
      prev = f;
    }
    return { input: first as BiquadNodeLike, output: prev as BiquadNodeLike };
  }

  private buildBuffer(ctx: AudioContextLike, parts: Float32Array[], sr: number, gapSec: number): AudioBufferLike {
    const gapN = Math.max(0, Math.round(gapSec * sr));
    let total = 0;
    for (let i = 0; i < parts.length; i++) total += (parts[i] as Float32Array).length + (i < parts.length - 1 ? gapN : 0);
    const buf = ctx.createBuffer(1, Math.max(1, total), sr);
    const out = buf.getChannelData(0);
    const fadeN = Math.max(1, Math.round(this.fadeSec * sr));
    let off = 0;
    for (let i = 0; i < parts.length; i++) {
      const pcm = parts[i] as Float32Array;
      out.set(pcm, off);
      // Raised-cosine edge fades on every sentence kill boundary clicks.
      for (let j = 0; j < fadeN && j < pcm.length; j++) {
        const w = 0.5 - 0.5 * Math.cos((Math.PI * j) / fadeN);
        out[off + j] = (out[off + j] ?? 0) * w;
        out[off + pcm.length - 1 - j] = (out[off + pcm.length - 1 - j] ?? 0) * w;
      }
      off += pcm.length + (i < parts.length - 1 ? gapN : 0);
    }
    return buf;
  }

  /* ── load ── */

  async load(): Promise<boolean> {
    if (this.status_ === "ready") return true;
    if (this.status_ === "unsupported" || this.disposed) return false;
    if (this.loadPromise) return this.loadPromise;
    if (!this.supported()) {
      this.status_ = "unsupported";
      this.emit();
      return false;
    }
    const gen = this.generation;
    this.loadPromise = (async (): Promise<boolean> => {
      this.status_ = "loading";
      this.progress = 0;
      this.emit();
      let lastErr: unknown = null;
      for (let attempt = 1; attempt <= this.loadRetries; attempt++) {
        try {
          const report = (p: number) => {
            if (gen !== this.generation) return;
            this.progress = Math.max(this.progress, Math.min(1, Math.max(0, p)));
            this.emit();
          };
          const { tts, device } = await this.loadTTS(report);
          if (gen !== this.generation) return false;
          this.tts = tts;
          this.device = device;
          this.status_ = "ready";
          this.progress = 1;
          this.emit();
          return true;
        } catch (err) {
          if (gen !== this.generation) return false;
          lastErr = err;
          this.warn(`load attempt ${attempt}/${this.loadRetries} failed`, err);
          if (attempt < this.loadRetries) await this.sleep(this.retryBackoffMs * attempt);
          if (gen !== this.generation) return false;
        }
      }
      this.warn("giving up; captions only", lastErr);
      this.status_ = "error";
      this.emit();
      this.loadPromise = null; // allow a manual retry later
      return false;
    })();
    return this.loadPromise;
  }

  /* ── synthesis + cache ── */

  private cacheGet(key: string): AudioBufferLike | null {
    const b = this.cache.get(key);
    if (b) {
      this.cache.delete(key);
      this.cache.set(key, b); // LRU bump
    }
    return b ?? null;
  }

  private cacheSet(key: string, buf: AudioBufferLike): void {
    this.cache.set(key, buf);
    while (this.cache.size > this.cacheLimit) {
      const oldest = this.cache.keys().next().value;
      if (oldest === undefined) break;
      this.cache.delete(oldest);
    }
  }

  private render(who: string, text: string): Promise<AudioBufferLike | null> {
    const speaker = this.resolveSpeaker(who);
    const norm = this.normalizeText(text);
    const key = `${who}|${speaker.voice}|${norm}`;
    const hit = this.cacheGet(key);
    if (hit) return Promise.resolve(hit);
    const pending = this.inflight.get(key);
    if (pending) return pending;

    const gen = this.generation;
    const job = (async (): Promise<AudioBufferLike | null> => {
      if (this.status_ !== "ready" || !this.tts) return null;
      const ctx = this.audioCtx();
      if (!ctx) return null;
      try {
        const parts: Float32Array[] = [];
        let sr = this.sampleRateFallback;
        for (const chunk of chunkText(norm)) {
          const audio = await this.tts.generate(chunk, { voice: speaker.voice, speed: speaker.speed });
          if (gen !== this.generation) return null;
          const pcm = audio.audio ?? audio.data;
          sr = audio.sampling_rate ?? audio.sr ?? sr;
          if (pcm && pcm.length) parts.push(pcm);
        }
        if (!parts.length) return null;
        const buf = this.buildBuffer(ctx, parts, sr, speaker.gap);
        this.cacheSet(key, buf);
        return buf;
      } catch (err) {
        if (gen === this.generation) this.warn("synth failed", err);
        return null;
      } finally {
        this.inflight.delete(key);
      }
    })();
    this.inflight.set(key, job);
    return job;
  }

  /* ── prewarm ── */

  private async drainWarm(): Promise<void> {
    if (this.warming) return;
    this.warming = true;
    const gen = this.generation;
    try {
      while (this.warmQueue.length && this.status_ === "ready" && gen === this.generation) {
        const line = this.warmQueue.shift();
        if (!line) break;
        try {
          await this.render(line.who, line.text);
        } catch {
          /* a failed prewarm is not an error; playback renders on demand */
        }
        if (gen !== this.generation) return;
        await this.idle(); // yield so the film stays smooth
      }
    } finally {
      if (gen === this.generation) this.warming = false;
    }
  }

  async warm(lines: { who?: string; text: string }[]): Promise<void> {
    if (!Array.isArray(lines) || !lines.length || this.disposed) return;
    for (const l of lines) if (l && l.text) this.warmQueue.push({ who: l.who || this.registry.defaultSpeaker, text: l.text });
    if (this.status_ === "ready") void this.drainWarm();
    else {
      const gen = this.generation;
      const ok = await this.load();
      if (ok && gen === this.generation) void this.drainWarm();
    }
  }

  /* ── playback ── */

  stop(): void {
    if (this.current) {
      this.stopNode(this.current, this.crossfadeSec);
      this.current = null;
    }
  }

  /** Play a line. Resolves to the spoken duration in seconds, or null. */
  async speak(who: string, text: string, opts: SpeakOptions = {}): Promise<number | null> {
    if (this.disposed) return null;
    // Never autoplay narration under reduced motion; an explicit gesture opts in.
    if (this.prefersReducedMotion() && !opts.force) return null;
    const gen = this.generation;
    const buf = await this.render(who, text);
    if (!buf || gen !== this.generation) return null;
    const ctx = this.audioCtx();
    if (!ctx) return null;

    if (opts.interrupt !== false) this.stop();

    const speaker = this.resolveSpeaker(who);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const gain = ctx.createGain();
    const vol = Math.max(0, Math.min(1, (opts.volume == null ? 1 : opts.volume) * speaker.gain));
    gain.gain.value = 0;

    // source → per-speaker EQ chain → line gain → master (→ bus → destination)
    const chain = this.personaChain(ctx, speaker.eq);
    src.connect(chain.input);
    chain.output.connect(gain);
    gain.connect(this.master ?? ctx.destination);

    const node: VoiceNode = { src, gain };
    this.current = node;
    src.onended = () => {
      if (this.current === node) this.current = null;
    };
    src.start(ctx.currentTime + (opts.when || 0));
    this.ramp(gain, vol, this.crossfadeSec);
    return buf.duration;
  }

  /** Render without playing, to size captions to the spoken length. */
  async measure(who: string, text: string): Promise<number | null> {
    const buf = await this.render(who, text);
    return buf ? buf.duration : null;
  }

  /* ── transport ── */

  pause(): void {
    this.paused = true;
    if (this.master) this.ramp(this.master, 0, 0.08);
    const ctx = this.ctx;
    if (ctx) {
      const gen = this.generation;
      let handle: unknown;
      handle = this.scheduler.setTimeout(() => {
        this.timers.delete(handle);
        if (gen !== this.generation) return;
        if (this.paused && ctx.state === "running") ctx.suspend().catch(() => {});
      }, 100);
      this.timers.add(handle);
    }
    this.emit();
  }

  resume(): void {
    this.paused = false;
    if (this.ctx && this.ctx.state === "suspended") this.ctx.resume().catch(() => {});
    if (this.master) this.ramp(this.master, this.volume, 0.1);
    this.emit();
  }

  setVolume(v: number): void {
    this.volume = Math.max(0, Math.min(1, v));
    if (this.master && !this.paused) this.ramp(this.master, this.volume, 0.1);
    this.emit();
  }

  /** Briefly duck, for example under a music sting. Returns the un-duck. */
  duck(level = 0.35, dur = 0.15): () => void {
    if (this.master && !this.paused) this.ramp(this.master, this.volume * level, dur);
    return () => {
      if (this.master && !this.paused) this.ramp(this.master, this.volume, dur);
    };
  }

  clearCache(): void {
    this.cache.clear();
  }

  /* ── teardown ── */

  /**
   * Release everything. Pending loads and syntheses resolve without touching
   * state, tracked timers and idle callbacks are cancelled, and the audio
   * context is closed. Idempotent.
   */
  dispose(): void {
    this.generation++;
    this.disposed = true;
    for (const handle of this.timers) this.scheduler.clearTimeout(handle);
    this.timers.clear();
    for (const finish of [...this.sleepers]) finish();
    for (const cancel of this.idleCancels) cancel();
    this.idleCancels.clear();
    this.stop();
    this.cache.clear();
    this.inflight.clear();
    this.warmQueue = [];
    this.warming = false;
    this.listeners.clear();
    this.loadPromise = null;
    this.tts = null;
    this.status_ = "idle";
    this.progress = 0;
    const ctx = this.ctx;
    this.ctx = null;
    this.master = null;
    if (ctx?.close) ctx.close().catch(() => {});
  }
}
