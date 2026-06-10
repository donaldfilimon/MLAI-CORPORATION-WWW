import { useState } from "react";
import { Send, Workflow } from "lucide-react";

// Illustrative router: keyword-sentiment scoring of the blend coefficient α.
// The production router is a learned classifier — this demonstrates the
// blending concept (R_final = α·R_Abbey + (1−α)·R_Aviva), not the model.
const TECH_WORDS = ["code", "bug", "error", "function", "compile", "api", "build", "deploy", "zig", "gpu", "vector", "latency", "throughput", "optimize", "performance", "algorithm", "syntax", "debug", "kernel"];
const EMO_WORDS = ["help", "stuck", "confused", "frustrated", "scared", "anxious", "lost", "overwhelmed", "hard", "struggling", "worried", "explain", "understand", "patient", "sorry", "please", "thanks", "feel"];

const EXAMPLES = [
  "Optimize this CUDA kernel for throughput",
  "I feel completely lost and overwhelmed",
  "Explain HNSW — I'm new and a bit anxious",
];

export function PersonaRouterDemo() {
  const [text, setText] = useState(
    "I'm so confused by this Zig compile error, please help me understand it",
  );
  const lc = text.toLowerCase();
  const tech = TECH_WORDS.filter((w) => lc.includes(w)).length;
  const emo = EMO_WORDS.filter((w) => lc.includes(w)).length;
  const alpha = (emo + 0.5) / (emo + tech + 1);
  const route =
    alpha > 0.66
      ? { label: "Abbey", cls: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" }
      : alpha < 0.34
        ? { label: "Aviva", cls: "bg-violet-500/20 text-violet-300 border-violet-500/30" }
        : { label: "Blend", cls: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30" };

  return (
    <div className="glass-card p-6">
      <div className="mb-3 flex items-center gap-2">
        <Workflow className="h-4 w-4 text-indigo-400" aria-hidden="true" />
        <span className="text-sm font-semibold text-white">Abi — live routing (illustrative)</span>
      </div>
      <div className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a user message…"
          className="flex-1 rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-400/50"
        />
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/20">
          <Send className="h-4 w-4 text-indigo-300" aria-hidden="true" />
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            onClick={() => setText(ex)}
            className="rounded-full border border-white/10 px-2 py-1 text-[10px] text-text-dim transition-colors hover:border-white/25 hover:text-white"
          >
            {ex}
          </button>
        ))}
      </div>
      <div className="mt-5">
        <div className="mb-1.5 flex justify-between text-xs">
          <span className="text-emerald-400">Abbey (empathetic)</span>
          <span className="text-violet-400">Aviva (technical)</span>
        </div>
        <div className="flex h-3 overflow-hidden rounded-full bg-violet-500/20">
          <div
            className="h-full bg-linear-to-r from-emerald-500 to-emerald-400 transition-all duration-300"
            style={{ width: `${alpha * 100}%` }}
          />
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="font-mono text-xs text-text-dim">
            α = {alpha.toFixed(2)} · tech:{tech} emo:{emo}
          </span>
          <span className={`rounded-full border px-3 py-1 text-xs font-bold ${route.cls}`}>
            → {route.label}
          </span>
        </div>
      </div>
      <p className="mt-4 font-mono text-xs text-text-dim/70">
        R_final = α·R_Abbey + (1 − α)·R_Aviva
      </p>
    </div>
  );
}
