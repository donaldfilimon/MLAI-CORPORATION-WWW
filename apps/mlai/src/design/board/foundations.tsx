/* ════════════════════════════════════════════════════════════════
   MLAI Design Upgrade v2 — Foundations
   Review · Color · Elevation · Spacing · Type
   ════════════════════════════════════════════════════════════════ */
import { useState, type ReactNode } from "react";
import { Eyebrow, SectionHead, Glass, Mono } from "./core.tsx";
import { COLOR, PERSONA, ELEVATION, SPACING, RHYTHM, TYPE, type ColorEntry } from "./tokens.ts";

/* ──────────────────────── 1 · REVIEW ──────────────────────── */
type Verdict = "already-strong" | "real-gap";
type VerdictRow = readonly [title: string, verdict: Verdict, detail: string];
type TagSpec = readonly [label: string, fg: string, bg: string];

const VERDICTS: readonly VerdictRow[] = [
  ["Typography refresh", "already-strong", "A Major-Third modular scale (h00→h5) and an Outfit / Inter / JetBrains split already ship. We tune leading & tracking rather than rebuild."],
  ["Visual depth / glass", "already-strong", "glass-card, layered noise and blur are in place. The gap isn't more glass — it's consistent light direction and a real elevation ramp."],
  ["Premium noise globally", "already-strong", "Shipping at opacity 0.015 with mix-blend overlay. Keep as-is; no change needed."],
  ["Inconsistent spacing", "real-gap", "The most honest line in the spec. Solved with a spacing scale + rhythm tokens, not utility-by-utility guesswork."],
  ["Two-step surfaces", "real-gap", "bg → surface is only two tiers; cards-on-cards muddy. A 4-tier elevation ramp fixes depth system-wide."],
  ["Color split", "real-gap", "Brand board runs a 6-color spectrum; the site runs one blue. They must reconcile into action vs. identity vs. semantic roles."],
];

const TAG: Readonly<Record<Verdict, TagSpec>> = {
  "already-strong": ["Already strong", "#34D399", "rgba(52,211,153,0.12)"],
  "real-gap": ["Real upgrade", "#FBBF24", "rgba(251,191,36,0.12)"],
};

const PRIORITIES: readonly string[] = [
  "Reconcile color into action / identity / semantic roles",
  "Define a 4-tier surface elevation ramp",
  "Commit to one ambient light direction",
  "Formalize spacing + vertical rhythm tokens",
];

export function ReviewSection(): ReactNode {
  return (
    <section>
      <SectionHead kicker="00 · Review" color="var(--ds-accent)"
        title="The spec is right about the symptom, not the cure"
        lede="The upgrade doc asks for glass, a modular scale, and global noise — all of which already ship. Executing it literally changes nothing visible. The real upgrade is the system underneath: spacing rhythm, a true elevation ramp, one light direction, and a reconciled palette. Here's the line-by-line read." />
      <div className="grid sm:grid-cols-2 gap-4">
        {VERDICTS.map(([t, v, d]) => {
          const [label, fg, bg] = TAG[v];
          return (
            <Glass key={t} level={2} className="p-6">
              <div className="flex items-start justify-between gap-4 mb-3">
                <h3 className="font-semibold text-white text-[17px]" style={{ fontFamily: "Outfit, sans-serif" }}>{t}</h3>
                <span className="shrink-0 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full" style={{ color: fg, background: bg, letterSpacing: "0.08em", fontFamily: "JetBrains Mono, monospace" }}>{label}</span>
              </div>
              <p className="text-[13.5px] leading-relaxed text-slate-400">{d}</p>
            </Glass>
          );
        })}
      </div>
      <Glass level={3} className="mt-6 p-7" style={{ background: "linear-gradient(145deg,rgba(34,211,238,0.06),rgba(168,85,247,0.04))" }}>
        <Eyebrow color="var(--ds-accent3)">The four priorities</Eyebrow>
        <ol className="grid sm:grid-cols-2 gap-x-8 gap-y-3 mt-2">
          {PRIORITIES.map((s, i) => (
            <li key={s} className="flex gap-3 items-baseline text-[15px] text-slate-200">
              <Mono className="text-[13px]" style={{ color: "#22d3ee" }}>{String(i + 1).padStart(2, "0")}</Mono>
              <span>{s}</span>
            </li>
          ))}
        </ol>
      </Glass>
    </section>
  );
}

/* ──────────────────────── 2 · COLOR ──────────────────────── */
const LIGHT_SWATCHES: readonly string[] = ["#FAFAFA", "#FBBF24", "#34D399", "#22D3EE", "#60A5FA"];

function Swatch({
  name, value, note, big = false,
}: {
  name: string;
  value: string;
  note?: string;
  big?: boolean;
}): ReactNode {
  const [copied, setCopied] = useState(false);
  const light = LIGHT_SWATCHES.includes(value);
  return (
    <button
      type="button"
      onClick={() => { navigator.clipboard?.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 900); }}
      className="text-left group"
    >
      <div className="relative rounded-2xl overflow-hidden ring-1 ring-white/10 transition-transform group-hover:scale-[1.015]" style={{ height: big ? 96 : 64, background: value }}>
        <span className="absolute bottom-2 right-2.5 text-[10px] font-mono opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: light ? "#0a0a12" : "#fff" }}>{copied ? "copied ✓" : "click to copy"}</span>
      </div>
      <div className="mt-2.5">
        <Mono className="text-[12px] text-slate-200 block">{name}</Mono>
        <Mono className="text-[11px] text-slate-500 block">{value}</Mono>
        {note && <p className="text-[11.5px] text-slate-500 mt-1 leading-snug">{note}</p>}
      </div>
    </button>
  );
}

function ColorGroup({
  label, color, items, big = false,
}: {
  label: string;
  color: string;
  items: readonly ColorEntry[];
  big?: boolean;
}): ReactNode {
  return (
    <div>
      <Eyebrow color={color}>{label}</Eyebrow>
      <div className={`grid gap-4 ${big ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2 sm:grid-cols-4"}`}>
        {items.map((it) => <Swatch key={it.token} name={it.token} value={it.value} note={it.note} big={big} />)}
      </div>
    </div>
  );
}

export function ColorSection(): ReactNode {
  return (
    <section>
      <SectionHead kicker="01 · Color" color="var(--ds-accent)"
        title="One action blue. A disciplined spectrum. Clear semantic roles."
        lede="The brand board's six colors and the site's lone blue reconcile into a role-based system: a single action blue carries every interaction; the cyan→violet spectrum belongs to identity, data and the three personas; proof / signal / danger carry meaning. No color is decorative." />
      <div className="grid lg:grid-cols-2 gap-x-10 gap-y-9">
        <ColorGroup label="Action — interaction only" color="#3B82F6" items={COLOR.action} />
        <ColorGroup label="Spectrum — identity & data" color="#A855F7" items={COLOR.spectrum} />
        <ColorGroup label="Semantic — meaning" color="#34D399" items={COLOR.semantic} />
        <ColorGroup label="Neutral — text & hairlines" color="#A1A1AA" items={COLOR.neutral} />
      </div>

      {/* persona binding */}
      <div className="mt-12">
        <Eyebrow color="var(--ds-accent2)">Persona ↔ color binding</Eyebrow>
        <div className="grid sm:grid-cols-3 gap-4">
          {PERSONA.map((p) => (
            <Glass key={p.name} level={2} className="p-5 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-30" style={{ background: p.color }} />
              <div className="relative flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-black/80" style={{ background: p.color, boxShadow: `0 0 18px -2px ${p.color}` }}>{p.name[0]}</span>
                <div>
                  <div className="text-white font-semibold" style={{ fontFamily: "Outfit, sans-serif" }}>{p.name}</div>
                  <div className="text-[12px] text-slate-400">{p.role}</div>
                </div>
              </div>
              <Mono className="text-[11px] text-slate-500 mt-4 block">var({p.token})</Mono>
            </Glass>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────── 3 · ELEVATION ──────────────────────── */
export function ElevationSection(): ReactNode {
  const l2 = ELEVATION[2];
  const l3 = ELEVATION[3];
  const l4 = ELEVATION[4];
  if (!l2 || !l3 || !l4) return null;
  return (
    <section>
      <SectionHead kicker="02 · Elevation" color="var(--ds-accent)"
        title="Four surfaces, so depth reads the same everywhere"
        lede="Two tiers (bg → surface) can't express a popover on a card on a page. A four-step ramp — Sunken, Surface, Raised, Overlay — pairs each level with a fixed shadow and border so depth is a system decision, not a per-component guess." />

      {/* stacked live demo */}
      <div className="grid lg:grid-cols-[1.1fr_1fr] gap-8 items-start">
        <div className="rounded-3xl p-8 sm:p-12 flex items-center justify-center" style={{ background: "#050509", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="w-full max-w-sm">
            <Mono className="text-[10px] text-slate-600 mb-3 block">L0 · Canvas</Mono>
            <div className="rounded-2xl p-6" style={{ background: l2.bg, border: `1px solid ${l2.border}`, boxShadow: l2.shadow }}>
              <Mono className="text-[10px] text-slate-500 mb-3 block">L2 · Surface card</Mono>
              <div className="rounded-xl p-5" style={{ background: l3.bg, border: `1px solid ${l3.border}`, boxShadow: l3.shadow, backdropFilter: "blur(10px)" }}>
                <Mono className="text-[10px] text-slate-400 mb-3 block">L3 · Raised nested</Mono>
                <div className="rounded-lg p-4 relative" style={{ background: l4.bg, border: `1px solid ${l4.border}`, boxShadow: l4.shadow }}>
                  <Mono className="text-[10px] text-slate-300">L4 · Overlay / popover</Mono>
                  <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-emerald-300"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />depth resolves cleanly</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {ELEVATION.map((e) => (
            <div key={e.n} className="flex items-center gap-4 rounded-2xl p-3.5" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="w-14 h-14 rounded-xl shrink-0" style={{ background: e.bg.length > 7 ? e.bg.slice(0, 7) : e.bg, border: `1px solid ${e.border}`, boxShadow: e.shadow }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-white font-semibold text-[15px]" style={{ fontFamily: "Outfit, sans-serif" }}>{e.name}</span>
                  <Mono className="text-[11px] text-slate-500">{e.n}</Mono>
                </div>
                <div className="text-[12.5px] text-slate-400">{e.use}</div>
                <Mono className="text-[10.5px] text-slate-600 mt-0.5 block truncate">var({e.token}) · {e.bg.slice(0, 7)}</Mono>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────── 4 · SPACING ──────────────────────── */
export function SpacingSection(): ReactNode {
  return (
    <section>
      <SectionHead kicker="03 · Spacing & rhythm" color="var(--ds-accent)"
        title="A 4px scale, and a rhythm built on top of it"
        lede="The spec's truest observation — inconsistent spacing — is a tokens problem. A 4px-based scale removes one-off pixel values, and five rhythm tokens (section, block, card, stack, inline) make every page breathe identically." />
      <div className="grid lg:grid-cols-2 gap-10 items-start">
        {/* scale */}
        <div>
          <Eyebrow color="var(--ds-accent2)">Base scale · 4px</Eyebrow>
          <div className="space-y-2.5">
            {SPACING.map(([n, rem, px]) => (
              <div key={n} className="flex items-center gap-4">
                <Mono className="text-[12px] text-slate-500 w-16 shrink-0">space-{n}</Mono>
                <div className="h-3.5 rounded-md" style={{ width: Math.min(px, 220), background: "linear-gradient(90deg,#22d3ee,#3b82f6)", opacity: 0.85 }} />
                <Mono className="text-[11px] text-slate-600">{px}px · {rem}</Mono>
              </div>
            ))}
          </div>
        </div>
        {/* rhythm */}
        <div>
          <Eyebrow color="var(--ds-accent3)">Rhythm tokens</Eyebrow>
          <Glass level={1} className="p-2 divide-y divide-white/5">
            {RHYTHM.map(([t, v, note]) => (
              <div key={t} className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <Mono className="text-[12.5px] text-slate-200">{t}</Mono>
                  <Mono className="text-[11px] text-cyan-400">{v}</Mono>
                </div>
                <p className="text-[12px] text-slate-500 mt-1">{note}</p>
              </div>
            ))}
          </Glass>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────── 5 · TYPE ──────────────────────── */
export function TypeSection(): ReactNode {
  return (
    <section>
      <SectionHead kicker="04 · Typography" color="var(--ds-accent)"
        title="The scale was right — the leading and tracking weren't"
        lede="Outfit for display, Inter for text, JetBrains Mono for labels and code. We keep the Major-Third scale and fix what was missing: negative tracking that tightens as size grows, and leading that loosens as size shrinks." />
      <Glass level={1} className="divide-y divide-white/6 overflow-hidden">
        {TYPE.map(([label, , size, lh, ls, font, weight, use]) => (
          <div key={label} className="flex items-center gap-6 px-6 py-5 hover:bg-white/1.5 transition-colors">
            <div className="w-20 shrink-0">
              <div className="text-white font-semibold text-[13px]">{label}</div>
              <Mono className="text-[10px] text-slate-600">{size}</Mono>
            </div>
            <div className="flex-1 min-w-0 overflow-hidden">
              <div className="text-white truncate" style={{ fontFamily: font + ", sans-serif", fontSize: `min(${size}, 7vw)`, lineHeight: lh, letterSpacing: ls, fontWeight: weight }}>
                {font === "JetBrains Mono" ? "MLAI · resilient intelligence" : "Resilient intelligence"}
              </div>
            </div>
            <div className="hidden md:block w-44 shrink-0 text-right">
              <Mono className="text-[10.5px] text-slate-500 block">{font} {weight}</Mono>
              <Mono className="text-[10px] text-slate-600 block">lh {lh} · ls {ls}</Mono>
              <span className="text-[11px] text-slate-500">{use}</span>
            </div>
          </div>
        ))}
      </Glass>
    </section>
  );
}
