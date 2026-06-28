"use client";

// PersonaVoices — let a visitor hear Abbey / Aviva / Abi on a marketing surface,
// using the same in-browser neural TTS engine that powers the brand film.
//
// It reuses the film's NeuralVoice engine and the shared persona registry
// (tokens.ts), and mirrors narration.tsx's discipline:
//   • Opt-in + user-gesture-gated — nothing loads until the visitor clicks a
//     persona. The heavy ONNX/Kokoro runtime is fetched lazily from a CDN inside
//     NeuralVoice.load() (dynamic import), so it never enters the server bundle
//     or the initial marketing chunk.
//   • Reduced-motion respected — audio only plays on the explicit click (we pass
//     `force: true`, the same opt-in the film uses); the subtle "speaking" pulse
//     is gated behind motion-safe. No autoplay, ever.
//   • Degrades to a silent caption — when the engine is unsupported or fails to
//     load, the persona's line is shown as text and nothing is spoken.

import { useCallback, useEffect, useRef, useState } from "react";
import { Volume2, Loader2 } from "lucide-react";
import { NeuralVoice, type VoiceSnapshot } from "@/film/neural-voice";
import { PERSONAS, type PersonaKey } from "@/film/tokens";

type PersonaCard = {
  key: PersonaKey;
  role: string;
  line: string;
  dot: string;
  ring: string;
  text: string;
};

// Short, on-brand sample lines (no unbacked metrics — external-claims policy).
const CARDS: PersonaCard[] = [
  {
    key: "abbey",
    role: "Empathetic polymath",
    line: "I'm Abbey — I keep answers grounded in verified, traceable memory.",
    dot: "bg-emerald-400",
    ring: "hover:border-emerald-300/40 aria-pressed:border-emerald-300/60",
    text: "text-emerald-300",
  },
  {
    key: "aviva",
    role: "Unfiltered expert",
    line: "I'm Aviva — I push the research and the long-term vision forward.",
    dot: "bg-violet-400",
    ring: "hover:border-violet-300/40 aria-pressed:border-violet-300/60",
    text: "text-violet-300",
  },
  {
    key: "abi",
    role: "Adaptive router",
    line: "I'm Abi — I score each request and route it to the right mind.",
    dot: "bg-cyan-400",
    ring: "hover:border-cyan-300/40 aria-pressed:border-cyan-300/60",
    text: "text-cyan-300",
  },
];

export function PersonaVoices({ className = "" }: { className?: string }) {
  const [supported, setSupported] = useState(true);
  const [snap, setSnap] = useState<VoiceSnapshot | null>(null);
  const [active, setActive] = useState<PersonaKey | null>(null); // line currently shown / speaking
  const [pending, setPending] = useState<PersonaKey | null>(null); // clicked, awaiting model load
  const clearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setSupported(NeuralVoice.isSupported());
    const unsub = NeuralVoice.onChange((s) => setSnap(s));
    return () => {
      unsub();
      if (clearTimer.current) clearTimeout(clearTimer.current);
      // Don't leave the engine speaking after the visitor navigates away.
      try {
        NeuralVoice.stop();
      } catch {
        /* noop */
      }
    };
  }, []);

  const play = useCallback(
    async (card: PersonaCard) => {
      if (clearTimer.current) clearTimeout(clearTimer.current);
      setActive(card.key);

      // Unsupported engine → show the caption, stay silent.
      if (!NeuralVoice.isSupported()) return;

      setPending(card.key);
      const ok = await NeuralVoice.load(); // gesture-gated; lazily fetches the runtime
      setPending(null);
      if (!ok) return; // load failed → caption already visible, silent fallback

      // force: true — this is an explicit user gesture (mirrors narration.tsx),
      // so it speaks even under prefers-reduced-motion; interrupt crossfades any
      // line already playing.
      const dur = await NeuralVoice.speak(card.key, card.line, { force: true });
      if (dur) {
        clearTimer.current = setTimeout(() => setActive((cur) => (cur === card.key ? null : cur)), dur * 1000 + 600);
      }
    },
    [],
  );

  const loadingPct =
    snap && snap.status === "loading" ? Math.round((snap.progress || 0) * 100) : null;

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div
        className="flex flex-wrap items-center justify-center gap-3"
        role="group"
        aria-label="Hear each persona's voice"
      >
        {CARDS.map((card) => {
          const isActive = active === card.key;
          const isPending = pending === card.key;
          return (
            <button
              key={card.key}
              type="button"
              onClick={() => play(card)}
              aria-pressed={isActive}
              disabled={isPending}
              title={supported ? `Hear ${PERSONAS[card.key].name}` : "Voice unavailable in this browser — caption only"}
              className={`group flex items-center gap-2.5 rounded-full border border-white/10 bg-white/3 px-4 py-2 text-sm font-medium text-white backdrop-blur transition-colors disabled:cursor-progress ${card.ring}`}
            >
              <span
                className={`h-2.5 w-2.5 shrink-0 rounded-full ${card.dot} ${isActive ? "motion-safe:animate-pulse" : ""}`}
                aria-hidden="true"
              />
              <span>{PERSONAS[card.key].name}</span>
              {isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-text-dim" aria-hidden="true" />
              ) : (
                <Volume2 className={`h-3.5 w-3.5 ${card.text}`} aria-hidden="true" />
              )}
            </button>
          );
        })}
      </div>

      {/* Caption + status — also the graceful fallback when audio can't play. */}
      <p className="mt-3 min-h-[1.25rem] max-w-xl text-center text-sm text-text-dim" aria-live="polite">
        {active
          ? CARDS.find((c) => c.key === active)?.line
          : !supported
            ? "Voice playback isn't available in this browser — captions shown instead."
            : loadingPct !== null
              ? `Loading neural voice… ${loadingPct}%`
              : "Tap a name to hear it speak — neural voice runs entirely in your browser."}
      </p>
    </div>
  );
}
