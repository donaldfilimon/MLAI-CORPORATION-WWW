import type * as React from "react";
import { products } from "./brand";
import type { Accent } from "./brand";

const accentVar: Record<Accent, string> = {
  wdbx: "#00D4FF",
  abi: "#7C3AED",
  abbey: "#10B981",
};
const accentText: Record<Accent, string> = {
  wdbx: "text-wdbx",
  abi: "text-abi",
  abbey: "text-abbey",
};

/* Ambient accent glow — turns hero whitespace into intentional colored space.
   Purely decorative, so aria-hidden and pointer-events-none. */
export function AccentGlow({ accent }: { accent: Accent }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute -top-24 right-0 -z-0 h-[28rem] w-[28rem] rounded-full blur-[120px]"
      style={{
        background: `radial-gradient(circle, ${accentVar[accent]}22, transparent 70%)`,
      }}
    />
  );
}

/* Shared card chrome — mirrors the homepage benchmark terminal so every hero
   speaks the same visual language. */
function CardShell({
  accent,
  label,
  footer,
  children,
}: {
  accent: Accent;
  label: string;
  footer: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="surface accent-edge w-full overflow-hidden"
      style={{ ["--accent" as string]: accentVar[accent] }}
    >
      <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: accentVar[accent] }}
          />
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-500">
            {label}
          </span>
        </div>
        <span className="font-mono text-[10px] text-slate-600">live structure</span>
      </div>
      <div className="px-5 py-5">{children}</div>
      <div className="border-t border-line px-5 py-2.5">
        <span className="font-mono text-[10.5px] text-slate-600">{footer}</span>
      </div>
    </div>
  );
}

/* WDBX — HNSW layer structure. Sparse at the top, dense at L0. */
export function IndexCard() {
  const layers = [
    { name: "L2", dots: 2, count: "2 nodes" },
    { name: "L1", dots: 6, count: "≈ 40 nodes" },
    { name: "L0", dots: 22, count: "1,000,000 vectors" },
  ];
  return (
    <CardShell accent="wdbx" label="wdbx · index · hnsw" footer="M=16 · efC=200 · 95% recall @ 8.2ms">
      <div className="space-y-3.5">
        {layers.map((l) => (
          <div key={l.name} className="flex items-center gap-3">
            <span className="w-7 font-mono text-xs text-wdbx/80">{l.name}</span>
            <div className="flex flex-1 flex-wrap gap-[3px]">
              {Array.from({ length: l.dots }).map((_, i) => (
                <span
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-wdbx"
                  style={{ opacity: 0.35 + (0.65 * (i + 1)) / l.dots }}
                />
              ))}
            </div>
            <span className="font-mono text-[10.5px] tabular-nums text-slate-500">{l.count}</span>
          </div>
        ))}
      </div>
    </CardShell>
  );
}

/* ABI — GPU matmul speedup ladder, log-scaled bars. */
export function ThroughputCard() {
  const rows = products.abi.gpuBench.filter((b) => b.value.endsWith("×"));
  const nums = rows.map((r) => parseInt(r.value));
  const max = Math.max(...nums);
  const labelFor: Record<string, string> = {
    "5×": "128²",
    "84×": "1024²",
    "295×": "4096²",
    "13×": "10-layer",
  };
  return (
    <CardShell accent="abi" label="abi · gpu · matmul speedup" footer="vs single-thread CPU baseline">
      <div className="space-y-3">
        {rows.map((r) => {
          const n = parseInt(r.value);
          const pct = Math.max(8, (Math.log(n) / Math.log(max)) * 100);
          const isTarget = r.tag === "target";
          return (
            <div key={r.value} className="flex items-center gap-3">
              <span className="w-16 font-mono text-[10.5px] text-slate-500">{labelFor[r.value]}</span>
              <div className="h-2.5 flex-1 overflow-hidden rounded-sm bg-white/[0.04]">
                <div
                  className="h-full rounded-sm"
                  style={{
                    width: `${pct}%`,
                    background: isTarget
                      ? "repeating-linear-gradient(90deg, #7C3AED, #7C3AED 4px, transparent 4px, transparent 7px)"
                      : "#7C3AED",
                  }}
                />
              </div>
              <span className="w-14 text-right font-mono text-xs font-bold text-abi tabular-nums">
                {r.value}
                {isTarget ? <span className="ml-0.5 text-warn">○</span> : null}
              </span>
            </div>
          );
        })}
      </div>
    </CardShell>
  );
}

/* Abbey — the three personas, one core. Each row carries its own accent edge. */
export function PersonaCard() {
  const personas = products.abbey.personas;
  return (
    <CardShell accent="abbey" label="abbey · personas · one core" footer="argmax P(persona | input, context)">
      <div className="space-y-2.5">
        {personas.map((p) => (
          <div
            key={p.name}
            className="flex items-baseline gap-3 border-l-2 pl-3"
            style={{ borderColor: accentVar[p.accent] }}
          >
            <span className={`w-14 font-display text-sm font-semibold ${accentText[p.accent]}`}>
              {p.name}
            </span>
            <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-slate-400">
              {p.role}
            </span>
          </div>
        ))}
      </div>
    </CardShell>
  );
}
