// narration.tsx — Abbey / Aviva / Abi voiceover for the brand film.
//
// Ported from the design bundle's narration.jsx into a typed, self-contained
// React module. Three "minds" host the film, synced to the timeline:
//   · Abbey  — empathic polymath (proof / verified)   · green
//   · Aviva  — research / vision                       · violet
//   · Abi    — adaptive router (interactive / fast)    · cyan
//
// Speech rides the Web Speech API and degrades to captions-only gracefully.
// A small external store carries live settings (voice on/off, rate, pitch …) so
// the toggle, controller, and caption bar stay in sync without prop-drilling.

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { C, FONT, PERSONAS, clamp, type PersonaKey } from "./tokens";
import { step, fade } from "./easing";
import { useTimeline } from "./engine";
import { NeuralVoice } from "./neural-voice";

/* ── script: lines pinned to the 69s, six-scene timeline ──────────── */

interface ScriptLine { t: number; who: PersonaKey; text: string; dur: number }

const RAW: Array<Omit<ScriptLine, "dur">> = [
  // 00 · cold open  [0–9]
  { t: 1.0, who: "abbey", text: "Hello — I'm Abbey, one of three minds inside this system." },
  { t: 4.6, who: "abbey", text: "Infrastructure for resilient intelligence. Let me show you how it holds." },
  // 01 · persona routing  [9–22]
  { t: 9.6, who: "abi", text: "I'm Abi. Every query is scored, then routed to the right mind." },
  { t: 13.8, who: "abi", text: "Analysis goes to Abbey, creative work to Aviva, fast execution to me." },
  { t: 18.2, who: "abi", text: "Deterministic, local, explainable — you always know who answered, and why." },
  // 02 · verifiable memory  [22–37]
  { t: 22.8, who: "abbey", text: "What we learn, we remember — searchable by meaning." },
  { t: 27.4, who: "abbey", text: "And sealed in a SHA-256 chain, where every block hashes the one before it." },
  { t: 32.2, who: "abbey", text: "Alter a single block and the whole chain rejects it. Tampering can't hide." },
  // 03 · governance  [37–51]
  { t: 37.8, who: "abbey", text: "Before any response reaches you, it's checked against six principles." },
  { t: 42.4, who: "abbey", text: "Truthfulness, safety, helpfulness, fairness, privacy, transparency." },
  { t: 47.0, who: "abbey", text: "Six principles. Every response, governed." },
  // 04 · north-star (vision)  [51–60]
  { t: 51.6, who: "aviva", text: "I'm Aviva. The north-star is a distributed cognitive fabric, across every tier of hardware." },
  { t: 56.2, who: "aviva", text: "That part is still vision — a direction, not yet a promise." },
  // 05 · resolution  [60–69]
  { t: 60.6, who: "abbey", text: "Phase one is real and tested. Everything beyond it is the plan." },
  { t: 64.8, who: "abbey", text: "This is MLAI. Infrastructure for resilient intelligence." },
];

export const SCRIPT: ScriptLine[] = RAW
  .map((l) => ({ ...l, dur: clamp(l.text.length / 15 + 1.0, 3.2, 8) }))
  .sort((a, b) => a.t - b.t);

/* speaker styling — drives the caption avatar + waveform */
const SPEAKERS: Record<PersonaKey, { name: string; accent: string; g0: string; g1: string; wave: string }> = {
  abbey: { name: "ABBEY", accent: C.green, g0: "#6ee7b7", g1: "#047857", wave: "#34d399" },
  aviva: { name: "AVIVA", accent: C.violet, g0: "#c4b5fd", g1: "#6d28d9", wave: "#c084fc" },
  abi: { name: "ABI", accent: C.cyan, g0: "#a5f3fc", g1: "#0e7490", wave: "#22d3ee" },
};

/* ── settings store (external, subscribable) ──────────────────────── */

interface Settings { voiceOn: boolean; captions: boolean; rate: number; volume: number }
// Reassigned (not mutated) on every change so getSnapshot returns a fresh reference —
// useSyncExternalStore compares snapshots by Object.is, so an in-place mutation would
// be ignored and the toggle/captions UI would never re-render. (`rate` only scales the
// caption karaoke estimate; the neural model owns prosody — see PROSODY in neural-voice.ts.)
let settings: Settings = { voiceOn: true, captions: true, rate: 0.98, volume: 1 };
const listeners = new Set<() => void>();
function emit() { for (const l of listeners) l(); }
function subscribe(fn: () => void) { listeners.add(fn); return () => { listeners.delete(fn); }; }
export function setSetting<K extends keyof Settings>(k: K, v: Settings[K]) { settings = { ...settings, [k]: v }; emit(); }
function useSettings(): Settings { return useSyncExternalStore(subscribe, () => settings, () => settings); }

/* ── speech: the neural model is the only engine ──────────────────────
   All three minds (Abbey/Aviva/Abi) speak through Kokoro (neural-voice.ts).
   Playback is gated on the model being ready (see useVoiceReady), so a line is
   never crossed before the voice exists — nothing is dropped or silent. If the
   model is unsupported or fails to load, the gate opens anyway and captions
   carry the words. ──────────────────────────────────────────────────────── */

export function speak(who: PersonaKey, text: string) {
  if (typeof window === "undefined" || !settings.voiceOn) return;
  if (!NeuralVoice.isSupported()) return;        // no engine → captions carry the words
  NeuralVoice.speak(who, text, { volume: clamp(settings.volume, 0, 1) }).catch(() => {});
}

// Stop speech (e.g. seek-back, voice-off, navigation).
export function stopSpeech() {
  try { NeuralVoice.stop(); } catch { /* noop */ }
}

// Mirror play/pause to the model so neural audio doesn't keep playing on pause.
export function setSpeechPlaying(playing: boolean) {
  try {
    if (!NeuralVoice.isSupported()) return;
    if (playing) NeuralVoice.resume(); else NeuralVoice.pause();
  } catch { /* noop */ }
}

// Pre-render a script's lines in idle time so playback is gapless. warm() itself
// kicks the model download.
export function primeNeural(lines: Array<{ who?: PersonaKey | string; text: string }>) {
  if (typeof window === "undefined") return;
  try {
    if (!NeuralVoice.isSupported()) return;
    NeuralVoice.warm(lines.map((l) => ({ who: (l.who ?? "abbey") as string, text: l.text })));
  } catch { /* noop */ }
}

// True once playback may start: the model is ready, OR it can't/needn't run
// (muted, unsupported, or it gave up) — so we never hang the film forever.
function voiceGateOpen(): boolean {
  if (!settings.voiceOn) return true;
  if (typeof window === "undefined" || !NeuralVoice.isSupported()) return true;
  const s = NeuralVoice.status();
  return s === "ready" || s === "error";
}

// Hook for a <Stage ready={…}> gate: kicks the model load and flips true when the
// voice is ready (polls status — load has no synchronous "done" signal).
export function useVoiceReady(): boolean {
  const [ready, setReady] = useState(() => voiceGateOpen());
  useEffect(() => {
    if (ready) return;
    NeuralVoice.load().catch(() => {});
    const iv = setInterval(() => { if (voiceGateOpen()) { setReady(true); clearInterval(iv); } }, 200);
    return () => clearInterval(iv);
  }, [ready]);
  return ready;
}

// karaoke timing: estimate spoken duration accounting for punctuation pauses
export function lineSpeechDur(text: string, rate: number): number {
  const words = text.trim().split(/\s+/).length;
  const commas = (text.match(/[,;:—]/g) || []).length;
  const stops = (text.match(/[.!?]/g) || []).length;
  return Math.max(1.4, words / (2.75 * (rate || 1)) + commas * 0.18 + stops * 0.32 + 0.35);
}

function activeLine(time: number): ScriptLine | null {
  let cur: ScriptLine | null = null;
  for (const l of SCRIPT) if (time >= l.t && time <= l.t + l.dur) cur = l;
  return cur;
}

/* ── controller: fires speech off the playhead ────────────────────── */

export function NarrationController() {
  // Fire speech off the true playhead (clock), not the hover-preview time — otherwise
  // brushing the scrubber marks lines "spoken" and skips them during real playback.
  const { clock: time, playing } = useTimeline();
  const prev = useRef(0);
  const spoken = useRef<Set<number>>(new Set());

  // prewarm the neural model with this film's lines (idle-time, gapless playback);
  // stop all speech when the surface unmounts (e.g. navigating back).
  useEffect(() => { primeNeural(SCRIPT); return () => stopSpeech(); }, []);

  useEffect(() => {
    const p = prev.current; prev.current = time;
    if (time < p - 0.35) { // seek / loop back
      stopSpeech();
      spoken.current = new Set(SCRIPT.filter((l) => l.t <= time + 0.05).map((l) => l.t));
      return;
    }
    if (!playing) return;
    for (const line of SCRIPT) {
      if (p < line.t && time >= line.t && !spoken.current.has(line.t)) {
        spoken.current.add(line.t);
        speak(line.who, line.text);
      }
    }
  }, [time, playing]);

  useEffect(() => { setSpeechPlaying(playing); }, [playing]);

  return null;
}

/* ── caption bar with karaoke highlight ───────────────────────────── */

export function Narrator() {
  const { time, playing } = useTimeline();
  const c = useSettings();
  const line = activeLine(time);
  // tokens/wordIdx are constant while a line is active (~3s); only the karaoke
  // fraction is time-dependent. Memoize the split instead of re-running it every frame.
  const { tokens, wordIdx } = useMemo(() => {
    if (!line) return { tokens: [] as string[], wordIdx: [] as number[] };
    const tk = line.text.split(/(\s+)/);
    return { tokens: tk, wordIdx: tk.map((t, i) => (/\S/.test(t) ? i : -1)).filter((i) => i >= 0) };
  }, [line]);
  if (!c.captions) return null;
  const sp = SPEAKERS[line?.who ?? "abbey"];
  const intro = step(Math.max(0, time - 0.4), 0, 0.8);
  const speaking = !!line && playing && c.voiceOn;
  const localOpacity = line ? fade(time - line.t, line.dur, 0.35, 0.5) : 0;
  const frac = line ? clamp((time - line.t) / lineSpeechDur(line.text, c.rate), 0, 1) : 0;
  const spokenCount = Math.floor(frac * wordIdx.length);
  let wordSeen = 0;

  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 40, zIndex: 40, display: "flex", justifyContent: "center", pointerEvents: "none", opacity: intro, transform: `translateY(${(1 - intro) * 18}px)` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 22, maxWidth: 1500, padding: "16px 30px 16px 18px", borderRadius: 999, background: "rgba(8,10,18,0.66)", border: `1px solid ${C.line}`, backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", boxShadow: "0 18px 60px rgba(0,0,0,0.5)" }}>
        {/* avatar */}
        <div style={{ position: "relative", width: 56, height: 56, flexShrink: 0 }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: `radial-gradient(circle at 35% 30%, ${sp.g0}, ${sp.g1})`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT.display, fontWeight: 700, fontSize: 27, color: "#fff", boxShadow: speaking ? `0 0 22px ${sp.accent}cc` : `0 0 10px ${sp.accent}55`, transition: "background 400ms, box-shadow 200ms" }}>{sp.name[0]}</div>
          {speaking && <span style={{ position: "absolute", inset: -4, borderRadius: "50%", border: `1.5px solid ${sp.wave}`, opacity: 0.4 + 0.4 * Math.sin(time * 6) }} />}
        </div>
        {/* name + waveform */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0, width: 96 }}>
          <span style={{ fontFamily: FONT.mono, fontSize: 13, letterSpacing: "0.24em", color: sp.accent }}>{sp.name}</span>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 16 }}>
            {[0, 1, 2, 3, 4].map((i) => {
              const h = speaking ? 4 + 11 * Math.abs(Math.sin(time * (5 + i) + i)) : 3;
              return <span key={i} style={{ width: 3, height: h, borderRadius: 2, background: speaking ? sp.wave : C.dim2 }} />;
            })}
          </div>
        </div>
        {/* caption with karaoke highlight */}
        <div style={{ minWidth: 0, maxWidth: 1180, fontFamily: FONT.sans, fontWeight: 500, fontSize: 30, lineHeight: 1.3, opacity: localOpacity }}>
          {tokens.map((tk, i) => {
            if (!/\S/.test(tk)) return tk;
            const lit = wordSeen < spokenCount; wordSeen++;
            return <span key={i} style={{ color: lit ? C.text : C.dim, transition: "color 90ms linear" }}>{tk}</span>;
          })}
        </div>
      </div>
    </div>
  );
}

/* ── always-visible voice toggle ──────────────────────────────────── */

export function VoiceToggle() {
  const c = useSettings();
  useEffect(() => {
    // browsers gate the AudioContext behind a user gesture — use the first
    // interaction to start downloading the neural model.
    const kick = () => {
      try { if (NeuralVoice.isSupported()) NeuralVoice.load().catch(() => {}); } catch { /* noop */ }
    };
    window.addEventListener("pointerdown", kick);
    return () => window.removeEventListener("pointerdown", kick);
  }, []);
  const toggle = () => {
    const next = !settings.voiceOn;
    setSetting("voiceOn", next);
    if (!next) stopSpeech();
  };
  const on = c.voiceOn;
  return (
    <button onClick={toggle} title="Agent voiceover" style={{ position: "absolute", top: 14, right: 14, zIndex: 9998, display: "flex", alignItems: "center", gap: 9, padding: "9px 15px 9px 11px", borderRadius: 999, cursor: "pointer", background: on ? "rgba(52,211,153,0.16)" : "rgba(20,20,28,0.8)", border: `1px solid ${on ? C.green + "88" : C.line}`, color: on ? C.green : C.dim, fontFamily: FONT.mono, fontSize: 13, letterSpacing: "0.12em", backdropFilter: "blur(10px)" }}>
      <span style={{ fontSize: 15 }}>{on ? "🔊" : "🔇"}</span>
      VOICE {on ? "ON" : "OFF"}
    </button>
  );
}

export { PERSONAS };
