/* ════════════════════════════════════════════════════════════════
   MLAI Design Upgrade v2 — Depth, Components, Applied & Tokens
   Light system · component gallery · hero before/after · tokens export
   ════════════════════════════════════════════════════════════════ */
import { useState, type ReactNode, type CSSProperties } from "react";
import { Mark, Eyebrow, SectionHead, Glass, BeforeAfter, Mono, CodeBlock } from "./core.tsx";
import { PERSONA, CSS_TABS, USAGE } from "./tokens.ts";

/* ──────────────────────── 6 · LIGHT SYSTEM ──────────────────────── */
const GLOW_RGB: readonly [string, string, string] = ["59,130,246", "52,211,153", "251,191,36"];
const GLOW_HEX: readonly [string, string, string] = ["#3b82f6", "#34d399", "#fbbf24"];

export function LightSection(): ReactNode {
  const [after, setAfter] = useState(true);
  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <SectionHead kicker="05 · Light & depth" color="var(--ds-accent)"
          title="One light direction, declared once"
          lede="Before: every component invented its own glow, so highlights fought each other. After: a single key light (cyan, top-center) and a violet fill (bottom-right) are declared at the page root. Components inherit the direction; only semantic tints change." />
        <div className="pb-1"><BeforeAfter value={after} onChange={setAfter} /></div>
      </div>

      <div className="relative rounded-3xl overflow-hidden" style={{ height: 440, background: "#050509", border: "1px solid rgba(255,255,255,0.07)" }}>
        {/* ambient light layers */}
        {after ? (
          <>
            <div className="absolute inset-0 transition-opacity duration-700" style={{ background: "radial-gradient(60% 50% at 50% -8%, rgba(34,211,238,0.18), transparent 70%)" }} />
            <div className="absolute inset-0 transition-opacity duration-700" style={{ background: "radial-gradient(45% 55% at 92% 108%, rgba(168,85,247,0.16), transparent 70%)" }} />
          </>
        ) : (
          <div className="absolute inset-0" style={{ background: "radial-gradient(40% 40% at 20% 20%, rgba(59,130,246,0.1), transparent 60%), radial-gradient(30% 40% at 78% 38%, rgba(52,211,153,0.12), transparent 60%), radial-gradient(35% 30% at 45% 90%, rgba(251,191,36,0.1), transparent 60%)" }} />
        )}
        {/* sample cards catching the light */}
        <div className="relative h-full flex items-center justify-center gap-5 px-8">
          {[0, 1, 2].map((i) => {
            const glowRgb = GLOW_RGB[i] ?? GLOW_RGB[0];
            const glowHex = GLOW_HEX[i] ?? GLOW_HEX[0];
            return (
              <div key={i} className="rounded-2xl p-6 w-48 transition-all duration-700"
                style={{
                  background: "linear-gradient(145deg,rgba(255,255,255,0.05),rgba(255,255,255,0.012))",
                  border: "1px solid rgba(255,255,255,0.09)",
                  backdropFilter: "blur(12px)",
                  boxShadow: after
                    ? `0 18px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,${0.14 - i * 0.03})`
                    : `0 6px 20px rgba(0,0,0,0.4), 0 0 22px rgba(${glowRgb},0.25)`,
                }}>
                <div className="w-8 h-8 rounded-lg mb-4" style={{ background: after ? "linear-gradient(135deg,#22d3ee,#3b82f6)" : glowHex }} />
                <div className="h-2 rounded-full bg-white/20 mb-2" style={{ width: "80%" }} />
                <div className="h-2 rounded-full bg-white/10" style={{ width: "55%" }} />
              </div>
            );
          })}
        </div>
        <div className="absolute bottom-4 left-5">
          <Mono className="text-[11px]" style={{ color: after ? "#22d3ee" : "#fbbf24" }}>
            {after ? "unified key + fill · inherited highlight" : "ad-hoc per-card glow · competing highlights"}
          </Mono>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────── 7 · COMPONENTS ──────────────────────── */
function CompShell({
  after, children, label,
}: {
  after: boolean;
  children: ReactNode;
  label: string;
}): ReactNode {
  return (
    <div className="rounded-2xl p-6 transition-all duration-500" style={{ background: after ? "#0b0c14" : "#0e0e15", border: "1px solid rgba(255,255,255,0.06)" }}>
      <Mono className="text-[10px] text-slate-600 mb-4 block">{label}</Mono>
      {children}
    </div>
  );
}

const CHIPS: readonly (readonly [string, string])[] = [
  ["Privacy-first", "#22d3ee"], ["WDBX runtime", "#60a5fa"], ["SOC 2 track", "#34d399"], ["295× target", "#fbbf24"],
];
const STATS: readonly (readonly [string, string, string])[] = [
  ["295×", "GPU speedup", "#22d3ee"], ["0.8ms", "search latency", "#60a5fa"], ["16.5k", "throughput", "#a855f7"],
];

export function ComponentsSection(): ReactNode {
  const [after, setAfter] = useState(true);
  const r = after ? 999 : 8;
  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <SectionHead kicker="06 · Components" color="var(--ds-accent)"
          title="The same primitives, now on-system"
          lede="Buttons, chips, cards and stats rebuilt against the new tokens — consistent radius, inherited light, action-blue reserved for action, and elevation that matches the ramp. Toggle to see the before." />
        <div className="pb-1"><BeforeAfter value={after} onChange={setAfter} /></div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* buttons */}
        <CompShell after={after} label="Buttons">
          <div className="flex flex-wrap gap-3 items-center">
            <button type="button" className="px-5 py-2.5 font-medium text-white text-sm transition-all duration-500" style={{ borderRadius: r, background: after ? "linear-gradient(180deg,#3b82f6,#2563eb)" : "#3b82f6", boxShadow: after ? "0 8px 20px -6px rgba(59,130,246,0.7), inset 0 1px 0 rgba(255,255,255,0.25)" : "0 2px 8px rgba(59,130,246,0.4)" }}>Request access</button>
            <button type="button" className="px-5 py-2.5 font-medium text-sm transition-all duration-500" style={{ borderRadius: r, background: after ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.12)", color: "#e2e8f0" }}>View benchmarks</button>
            <button type="button" className="px-4 py-2.5 text-sm transition-all duration-500" style={{ borderRadius: r, color: "#22d3ee" }}>Docs →</button>
          </div>
        </CompShell>

        {/* chips */}
        <CompShell after={after} label="Label chips">
          <div className="flex flex-wrap gap-2.5">
            {CHIPS.map(([t, c]) => (
              <span key={t} className="inline-flex items-center gap-2 px-3.5 py-1.5 text-[11px] font-semibold uppercase transition-all duration-500" style={{ borderRadius: after ? 999 : 6, letterSpacing: "0.1em", color: after ? c : "#94a3b8", background: after ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.08)", border: `1px solid ${after ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.14)"}`, fontFamily: "JetBrains Mono, monospace" }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: after ? c : "#64748b" }} />{t}
              </span>
            ))}
          </div>
        </CompShell>

        {/* glass card */}
        <CompShell after={after} label="Feature card">
          <div className="rounded-2xl p-5 transition-all duration-500" style={{ background: after ? "linear-gradient(145deg,rgba(255,255,255,0.05),rgba(255,255,255,0.012))" : "rgba(255,255,255,0.04)", border: `1px solid ${after ? "rgba(255,255,255,0.09)" : "rgba(255,255,255,0.1)"}`, boxShadow: after ? "0 14px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.08)" : "0 4px 16px rgba(0,0,0,0.3)", backdropFilter: "blur(12px)" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: after ? "linear-gradient(135deg,#22d3ee,#3b82f6)" : "#3b82f6" }}><span className="text-white font-bold">◆</span></div>
            <h4 className="text-white font-semibold mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>Trace Layer</h4>
            <p className="text-[13px] text-slate-400 leading-relaxed">Every retrieval path and policy check captured as an inspectable event.</p>
          </div>
        </CompShell>

        {/* stat */}
        <CompShell after={after} label="Stat block">
          <div className="grid grid-cols-3 gap-3">
            {STATS.map(([v, l, c]) => (
              <div key={l} className="rounded-xl p-4 text-center transition-all duration-500" style={{ background: after ? "rgba(255,255,255,0.025)" : "rgba(255,255,255,0.05)", border: `1px solid ${after ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.1)"}` }}>
                <div className="font-bold text-[22px]" style={{ fontFamily: "Outfit, sans-serif", color: after ? "#fff" : c, background: after ? `linear-gradient(135deg,#fff,${c})` : "none", WebkitBackgroundClip: after ? "text" : "border-box", WebkitTextFillColor: after ? "transparent" : c }}>{v}</div>
                <Mono className="text-[10px] text-slate-500 mt-1 block">{l}</Mono>
              </div>
            ))}
          </div>
        </CompShell>
      </div>
    </section>
  );
}

/* ──────────────────────── 8 · APPLIED PAGE ──────────────────────── */
const APPLIED_NAV: readonly string[] = ["Platform", "Research", "Benchmarks", "Docs"];

function HeroApplied({ after }: { after: boolean }): ReactNode {
  return (
    <div className="relative h-full overflow-hidden" style={{ background: "#050509" }}>
      {/* ambient light */}
      {after ? (
        <>
          <div className="absolute inset-0" style={{ background: "radial-gradient(55% 45% at 50% -10%, rgba(34,211,238,0.16), transparent 70%)" }} />
          <div className="absolute inset-0" style={{ background: "radial-gradient(40% 50% at 95% 110%, rgba(168,85,247,0.14), transparent 70%)" }} />
          <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)", backgroundSize: "48px 48px", maskImage: "radial-gradient(ellipse 70% 60% at 50% 40%, black, transparent)" }} />
        </>
      ) : (
        <div className="absolute inset-0" style={{ background: "radial-gradient(40% 40% at 25% 30%, rgba(59,130,246,0.12), transparent 60%), radial-gradient(35% 35% at 80% 70%, rgba(52,211,153,0.1), transparent 60%)" }} />
      )}

      <div className="relative h-full flex flex-col px-8 sm:px-14 py-8">
        {/* nav */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5"><Mark size={30} /><span className="font-bold tracking-[0.18em] text-white text-sm">MLAI</span></div>
          <div className="hidden sm:flex items-center" style={{ gap: after ? 28 : 18 }}>
            {APPLIED_NAV.map((t) => <span key={t} className="text-[13px] text-slate-400">{t}</span>)}
            <button type="button" className="px-4 py-2 text-[13px] font-medium text-white" style={{ borderRadius: after ? 999 : 6, background: after ? "linear-gradient(180deg,#3b82f6,#2563eb)" : "#3b82f6", boxShadow: after ? "0 8px 20px -6px rgba(59,130,246,0.7)" : "none" }}>Request access</button>
          </div>
        </div>

        {/* hero body */}
        <div className="flex-1 flex flex-col justify-center" style={{ maxWidth: 760, marginTop: after ? 0 : 8 }}>
          <div className="inline-flex items-center gap-2 self-start px-3.5 py-1.5 mb-6" style={{ borderRadius: after ? 999 : 6, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#22d3ee", boxShadow: after ? "0 0 8px #22d3ee" : "none" }} />
            <Mono className="text-[10.5px] uppercase" style={{ letterSpacing: "0.18em", color: after ? "#22d3ee" : "#94a3b8" }}>Privacy-first AI infrastructure</Mono>
          </div>
          <h1 className="font-bold text-white" style={{ fontFamily: "Outfit, sans-serif", fontSize: "clamp(34px,5.6vw,64px)", lineHeight: after ? 1.02 : 1.12, letterSpacing: after ? "-0.03em" : "-0.01em" }}>
            Infrastructure for{after ? <br /> : " "}
            <span style={after ? { background: "linear-gradient(100deg,#67e8f9,#60a5fa,#c084fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" } : { color: "#60a5fa" }}>resilient intelligence</span>
          </h1>
          <p className="text-slate-400 mt-5 leading-relaxed" style={{ fontSize: "clamp(14px,1.6vw,18px)", maxWidth: 520, marginTop: after ? 20 : 14 }}>
            WDBX · ABI · Abbey — orchestration you can trace, benchmark and run entirely on your own infrastructure.
          </p>
          <div className="flex flex-wrap items-center mt-8" style={{ gap: after ? 14 : 10 }}>
            <button type="button" className="px-6 py-3 font-medium text-white text-[15px]" style={{ borderRadius: after ? 999 : 6, background: after ? "linear-gradient(180deg,#3b82f6,#2563eb)" : "#3b82f6", boxShadow: after ? "0 12px 30px -8px rgba(59,130,246,0.8), inset 0 1px 0 rgba(255,255,255,0.25)" : "0 2px 10px rgba(59,130,246,0.4)" }}>Request access</button>
            <button type="button" className="px-6 py-3 font-medium text-[15px] text-slate-200" style={{ borderRadius: after ? 999 : 6, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}>View benchmarks</button>
          </div>
        </div>

        {/* persona row */}
        <div className="flex flex-wrap" style={{ gap: after ? 12 : 8 }}>
          {PERSONA.map((p) => (
            <div key={p.name} className="flex items-center gap-2.5 px-4 py-2.5 transition-all duration-500" style={{ borderRadius: after ? 14 : 6, background: after ? "linear-gradient(145deg,rgba(255,255,255,0.05),rgba(255,255,255,0.012))" : "rgba(255,255,255,0.05)", border: `1px solid ${after ? "rgba(255,255,255,0.09)" : "rgba(255,255,255,0.1)"}`, backdropFilter: "blur(10px)" }}>
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: p.color, boxShadow: after ? `0 0 10px ${p.color}` : "none" }} />
              <div><div className="text-[13px] font-semibold text-white leading-none">{p.name}</div><div className="text-[10.5px] text-slate-500 mt-0.5">{p.role}</div></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AppliedSection(): ReactNode {
  const [after, setAfter] = useState(true);
  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <SectionHead kicker="07 · Applied" color="var(--ds-accent)"
          title="The whole system, on one real page"
          lede="Color roles, the elevation ramp, the light direction, spacing rhythm and refined type — applied to the MLAI home hero. Toggle between the current build and the upgrade." />
        <div className="pb-1"><BeforeAfter value={after} onChange={setAfter} labels={["Current", "Upgraded"]} /></div>
      </div>
      <div className="rounded-3xl overflow-hidden ring-1 ring-white/10" style={{ height: 600 }}>
        <HeroApplied after={after} />
      </div>
      <p className="text-center text-[12px] text-slate-600 mt-4"><Mono>Same content · same brand · system-level difference</Mono></p>
    </section>
  );
}

/* ──────────────────────── 9 · TOKENS / CSS ──────────────────────── */
export function TokensSection(): ReactNode {
  const tabs = Object.keys(CSS_TABS);
  const [tab, setTab] = useState<string>(tabs[0] ?? "Color");
  const code = CSS_TABS[tab] ?? "";
  return (
    <section>
      <SectionHead kicker="08 · Tokens" color="var(--ds-accent)"
        title="One file. Drop it into src/index.css."
        lede="Everything on this page compiles to CSS custom properties. Components consume roles — var(--action), var(--surface-2), var(--space-card) — so a change at the token level cascades to every page at once. This is the mechanism that 'applies the upgrade everywhere.'" />

      {/* drop-in callout */}
      <Glass level={3} className="p-6 mb-8 flex flex-wrap items-center justify-between gap-4" style={{ background: "linear-gradient(145deg,rgba(59,130,246,0.08),rgba(168,85,247,0.05))" }}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg,#22d3ee,#3b82f6 48%,#a855f7)", boxShadow: "0 8px 20px -6px rgba(59,130,246,0.6)" }}>
            <span className="text-white font-bold text-lg">{"{ }"}</span>
          </div>
          <div>
            <Mono className="text-[13px] text-white block">src/index.css</Mono>
            <span className="text-[12.5px] text-slate-400">≈190 custom properties · color · elevation · spacing · type · motion</span>
          </div>
        </div>
        <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-semibold" style={{ background: "rgba(52,211,153,0.12)", color: "#34d399", fontFamily: "JetBrains Mono, monospace" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />ready to ship
        </span>
      </Glass>

      <div className="grid lg:grid-cols-2 gap-8 items-start">
        {/* token tabs */}
        <div>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {tabs.map((t) => {
              const style: CSSProperties = tab === t
                ? { background: "linear-gradient(90deg,#22d3ee,#3b82f6)", color: "#fff", boxShadow: "0 4px 14px -4px rgba(59,130,246,0.6)" }
                : { background: "rgba(255,255,255,0.05)", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.08)" };
              return (
                <button key={t} type="button" onClick={() => setTab(t)}
                  className="px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all duration-300"
                  style={style}>
                  {t}
                </button>
              );
            })}
          </div>
          <CodeBlock code={code} label={`tokens · ${tab.toLowerCase()}`} />
        </div>

        {/* usage before/after */}
        <div>
          <Eyebrow color="var(--ds-accent3)">Consuming the tokens</Eyebrow>
          <CodeBlock code={USAGE} label="component.css" />
          <p className="text-[12.5px] text-slate-500 mt-4 leading-relaxed">
            No component hard-codes a hex, a shadow or a pixel. Re-theme the whole product — a lighter mode, a campaign accent, denser spacing — by editing one <Mono className="text-cyan-400 text-[12px]">:root</Mono> block.
          </p>
        </div>
      </div>
    </section>
  );
}
