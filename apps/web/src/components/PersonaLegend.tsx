// PersonaLegend — the three minds, color-keyed to the hero's tri-persona galaxy
// clusters (Abbey = emerald, Aviva = violet, Abi = cyan). Ported from the Lab
// design system's `.persona-legend`. Presentational; no state.

const PERSONAS = [
  {
    name: "Abbey",
    role: "Empathetic polymath",
    dot: "bg-emerald-400",
    glow: "shadow-[0_0_10px_rgba(52,211,153,0.7)]",
  },
  {
    name: "Aviva",
    role: "Unfiltered expert",
    dot: "bg-violet-400",
    glow: "shadow-[0_0_10px_rgba(168,85,247,0.7)]",
  },
  {
    name: "Abi",
    role: "Adaptive router",
    dot: "bg-cyan-400",
    glow: "shadow-[0_0_10px_rgba(34,211,238,0.7)]",
  },
] as const;

export function PersonaLegend({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex flex-wrap items-center justify-center gap-x-8 gap-y-4 rounded-2xl border border-white/8 bg-white/2 px-6 py-4 backdrop-blur ${className}`}
    >
      {PERSONAS.map((p, i) => (
        <div key={p.name} className="flex items-center gap-5">
          {i > 0 ? (
            <span className="h-7 w-px bg-white/10" aria-hidden="true" />
          ) : null}
          <span className="flex items-center gap-3">
            <span
              className={`h-2.5 w-2.5 shrink-0 rounded-full ${p.dot} ${p.glow}`}
              aria-hidden="true"
            />
            <span className="flex flex-col leading-tight">
              <span className="text-sm font-semibold text-white">{p.name}</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-dim/70">
                {p.role}
              </span>
            </span>
          </span>
        </div>
      ))}
    </div>
  );
}
