import { describe, expect, it } from "vitest";

import {
  AudioEngine,
  type AudioContextLike,
  type AudioEngineOptions,
  type AudioParamLike,
  type LoadTTS,
  type PersonaVoiceRegistry,
  type Scheduler,
  type TTSHandle,
} from "@mlai/trailer-engine";

/* ───────────── fakes: written by hand, the way film-playback does ───────────── */

function makeScheduler() {
  let nextId = 1;
  const timers = new Map<number, () => void>();
  const idles = new Map<number, () => void>();
  const s: Scheduler & { pending(): number; flush(): void } = {
    setTimeout(fn, _ms) {
      const id = nextId++;
      timers.set(id, fn);
      return id;
    },
    clearTimeout(handle) {
      timers.delete(handle as number);
    },
    idle(fn) {
      const id = nextId++;
      idles.set(id, fn);
      return () => {
        idles.delete(id);
      };
    },
    pending() {
      return timers.size + idles.size;
    },
    flush() {
      for (const [id, fn] of [...timers]) {
        timers.delete(id);
        fn();
      }
      for (const [id, fn] of [...idles]) {
        idles.delete(id);
        fn();
      }
    },
  };
  return s;
}

function makeParam(initial = 1): AudioParamLike & { ramps: number[] } {
  return {
    value: initial,
    ramps: [],
    cancelScheduledValues() {},
    setValueAtTime(v) {
      this.value = v;
    },
    linearRampToValueAtTime(v) {
      this.ramps.push(v);
      this.value = v;
    },
  };
}

function makeAudioContext() {
  const sources: { started: number[]; stopped: number[]; buffer: unknown }[] = [];
  const counters = { resumes: 0, suspends: 0, closes: 0 };
  const master = { gain: makeParam(1), connect() {} };
  let gains = 0;
  const ctx: AudioContextLike & { counters: typeof counters; sources: typeof sources; master: typeof master } = {
    state: "running",
    currentTime: 0,
    destination: { connect() {} },
    counters,
    sources,
    master,
    async resume() {
      counters.resumes++;
      this.state = "running";
    },
    async suspend() {
      counters.suspends++;
      this.state = "suspended";
    },
    async close() {
      counters.closes++;
      this.state = "closed";
    },
    createGain() {
      // The first gain the engine creates is the master bus input.
      if (gains++ === 0) return master;
      return { gain: makeParam(1), connect() {} };
    },
    createDynamicsCompressor() {
      return {
        threshold: makeParam(),
        knee: makeParam(),
        ratio: makeParam(),
        attack: makeParam(),
        release: makeParam(),
        connect() {},
      };
    },
    createBiquadFilter() {
      return { type: "peaking", frequency: makeParam(), Q: makeParam(), gain: makeParam(), connect() {} };
    },
    createBuffer(_channels, length, sampleRate) {
      const data = new Float32Array(length);
      return { duration: length / sampleRate, getChannelData: () => data };
    },
    createBufferSource() {
      const node = {
        buffer: null,
        onended: null,
        started: [] as number[],
        stopped: [] as number[],
        connect() {},
        start(when = 0) {
          node.started.push(when);
        },
        stop(when = 0) {
          node.stopped.push(when);
        },
      };
      sources.push(node);
      return node;
    },
  };
  return ctx;
}

function makeTTS(sr = 24000, samplesPerChunk = 2400) {
  const calls: { text: string; voice: string; speed: number }[] = [];
  const tts: TTSHandle & { calls: typeof calls } = {
    calls,
    async generate(text, opts) {
      calls.push({ text, voice: opts.voice, speed: opts.speed });
      return { audio: new Float32Array(samplesPerChunk), sampling_rate: sr };
    },
  };
  return tts;
}

function makeLoader(opts: { gate?: Promise<void>; failFirst?: boolean; tts?: TTSHandle } = {}) {
  let calls = 0;
  const tts = opts.tts ?? makeTTS();
  const load: LoadTTS & { calls: () => number } = Object.assign(
    async (report: (p: number) => void) => {
      calls++;
      if (opts.failFirst && calls === 1) throw new Error("cdn unreachable");
      report(0.5);
      if (opts.gate) await opts.gate;
      report(1);
      return { tts, device: "wasm" };
    },
    { calls: () => calls },
  );
  return load;
}

const REGISTRY: PersonaVoiceRegistry = {
  speakers: {
    a: { voice: "v_a", speed: 1.1, gap: 0.2, gain: 0.9, eq: [{ type: "lowshelf", freq: 200, gain: 2 }, { type: "highpass", freq: 90 }] },
    b: { voice: "v_b", speed: 1, gap: 0.1, gain: 1, eq: [] },
  },
  defaultSpeaker: "a",
  fallbackVoice: "v_fallback",
};

function makeEngine(overrides: Partial<AudioEngineOptions> = {}) {
  const scheduler = makeScheduler();
  const ctx = makeAudioContext();
  const tts = makeTTS();
  const loader = makeLoader({ tts });
  const engine = new AudioEngine({
    registry: REGISTRY,
    loadTTS: loader,
    createAudioContext: () => ctx,
    prefersReducedMotion: () => false,
    scheduler,
    ...overrides,
  });
  return { engine, scheduler, ctx, tts, loader };
}

/* ─────────────────────────────── tests ─────────────────────────────── */

describe("AudioEngine", () => {
  it("loads once, reports progress, and coalesces concurrent loads", async () => {
    const { engine, loader } = makeEngine();
    const seen: string[] = [];
    engine.onChange((s) => seen.push(`${s.status}:${s.progress}`));
    expect(seen).toEqual(["idle:0"]); // onChange emits the current snapshot synchronously
    const [a, b] = await Promise.all([engine.load(), engine.load()]);
    expect(a).toBe(true);
    expect(b).toBe(true);
    expect(loader.calls()).toBe(1);
    expect(engine.status()).toBe("ready");
    expect(seen.at(-1)).toBe("ready:1");
    expect(seen).toContain("loading:0");
  });

  it("reports unsupported hosts without touching the audio context", async () => {
    let contexts = 0;
    const { engine } = makeEngine({
      isSupported: () => false,
      createAudioContext: () => {
        contexts++;
        return makeAudioContext();
      },
    });
    expect(await engine.load()).toBe(false);
    expect(engine.status()).toBe("unsupported");
    expect(contexts).toBe(0);
  });

  it("dispose cancels a pending retry timer and settles the load as false", async () => {
    const { engine, scheduler } = makeEngine({ loadTTS: makeLoader({ failFirst: true }) });
    const p = engine.load();
    await Promise.resolve();
    await Promise.resolve();
    expect(scheduler.pending()).toBe(1); // the backoff sleep
    engine.dispose();
    expect(scheduler.pending()).toBe(0);
    expect(await p).toBe(false);
    expect(engine.status()).not.toBe("ready");
  });

  it("dispose ignores a load that resolves late", async () => {
    let release!: () => void;
    const gate = new Promise<void>((r) => {
      release = r;
    });
    const { engine } = makeEngine({ loadTTS: makeLoader({ gate }) });
    const emitted: string[] = [];
    engine.onChange((s) => emitted.push(s.status));
    const p = engine.load();
    engine.dispose();
    const before = emitted.length;
    release();
    expect(await p).toBe(false);
    expect(engine.status()).not.toBe("ready");
    expect(emitted.length).toBe(before); // no emit after dispose
  });

  it("gates speak on reduced motion unless the caller forces it", async () => {
    const { engine, tts } = makeEngine({ prefersReducedMotion: () => true });
    await engine.load();
    expect(await engine.speak("a", "Hello there.")).toBeNull();
    expect(tts.calls).toHaveLength(0);
    const d = await engine.speak("a", "Hello there.", { force: true });
    expect(d).toBeGreaterThan(0);
    expect(tts.calls).toHaveLength(1);
  });

  it("falls back explicitly for an unknown speaker and keeps its voice map closed", async () => {
    const { engine, tts, scheduler } = makeEngine();
    await engine.load();
    await engine.speak("zed", "Hello there.", { force: true });
    expect(tts.calls[0]).toMatchObject({ voice: "v_fallback", speed: 1 });
    expect(engine.getVoice("zed")).toBeUndefined();
    engine.setVoice("zed", "x");
    expect(engine.snapshot().voices).toEqual({ a: "v_a", b: "v_b" });
    engine.setVoice("a", "v_a2");
    expect(engine.getVoice("a")).toBe("v_a2");
    // warm() without a speaker uses the registry default (now with the swapped voice).
    await engine.warm([{ text: "Warm line." }]);
    scheduler.flush();
    expect(tts.calls.at(-1)).toMatchObject({ voice: "v_a2", speed: 1.1 });
  });

  it("pauses through a deferred suspend and resumes with a ramp back to volume", async () => {
    const { engine, ctx, scheduler } = makeEngine();
    await engine.load();
    await engine.speak("b", "One.", { force: true });
    engine.setVolume(0.8);
    engine.pause();
    expect(engine.snapshot().paused).toBe(true);
    expect(ctx.counters.suspends).toBe(0);
    expect(ctx.master.gain.ramps.at(-1)).toBe(0);
    scheduler.flush();
    expect(ctx.counters.suspends).toBe(1);
    ctx.state = "suspended";
    engine.resume();
    expect(ctx.counters.resumes).toBe(1);
    expect(engine.snapshot().paused).toBe(false);
    expect(ctx.master.gain.ramps.at(-1)).toBe(0.8);
    // pause then resume before the timer fires must not suspend.
    engine.pause();
    engine.resume();
    scheduler.flush();
    expect(ctx.counters.suspends).toBe(1);
  });

  it("crossfades an interrupted line, caches renders, and joins sentences with the speaker gap", async () => {
    const { engine, ctx, tts } = makeEngine();
    await engine.load();
    const d1 = await engine.speak("a", "First sentence here. Second sentence here.");
    // two chunks of 2400 samples plus one 0.2 s gap at 24 kHz
    expect(d1).toBeCloseTo((2 * 2400 + 0.2 * 24000) / 24000, 6);
    expect(tts.calls).toHaveLength(2);
    await engine.speak("a", "First sentence here. Second sentence here.");
    expect(tts.calls).toHaveLength(2); // cache hit
    expect(ctx.sources).toHaveLength(2);
    expect(ctx.sources[0]?.stopped).toHaveLength(1); // crossfaded out by the second speak
    expect(ctx.sources[1]?.started).toHaveLength(1);
  });

  it("normalizes brand rows before the built-in symbol rows", () => {
    const { engine } = makeEngine({ pronounce: [[/\bWDBX\b/g, "W-D-B-X"]] });
    expect(engine.normalizeText("WDBX → 90% recall")).toBe("W-D-B-X to 90 percent recall");
  });

  it("closes the audio context and clears listeners on dispose", async () => {
    const { engine, ctx } = makeEngine();
    let emits = 0;
    engine.onChange(() => emits++);
    await engine.load();
    await engine.speak("a", "Hello there.");
    const before = emits;
    engine.dispose();
    engine.dispose();
    expect(ctx.counters.closes).toBe(1);
    engine.setVolume(0.5);
    expect(emits).toBe(before);
    expect(await engine.speak("a", "Hello there.")).toBeNull();
  });
});
