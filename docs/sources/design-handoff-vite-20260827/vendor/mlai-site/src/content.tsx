import * as React from "react";
import type { Accent } from "./brand";
import { accentHex } from "./ui";

const accentText: Record<Accent, string> = {
  wdbx: "text-wdbx",
  abi: "text-abi",
  abbey: "text-abbey",
};

/* ── Prose ───────────────────────────────────────────────────────────────────
   Long-form body copy with Apple-grade measure and rhythm. Generous line
   length cap, relaxed leading, muted color so headings carry the contrast. */
export function Prose({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`max-w-2xl space-y-4 text-[15px] leading-[1.75] text-slate-400 ${className}`}>
      {children}
    </div>
  );
}

/* A labelled long-form block: a sticky-ish left rail label + prose, the
   editorial two-column rhythm Apple uses on its product deep-dives. */
export function SplitSection({
  kicker,
  title,
  accent = "wdbx",
  children,
}: {
  kicker?: string;
  title: string;
  accent?: Accent;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-8 border-t border-line py-12 md:grid-cols-[0.4fr_0.6fr]">
      <div>
        {kicker ? (
          <div className={`mb-2 flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.25em] ${accentText[accent]}`}>
            <span aria-hidden className="h-px w-6" style={{ background: accentHex[accent], opacity: 0.7 }} />
            {kicker}
          </div>
        ) : null}
        <h3 className="font-display text-2xl font-semibold tracking-tight text-white">{title}</h3>
      </div>
      <Prose>{children}</Prose>
    </div>
  );
}

/* ── Deep-dive card grid ─────────────────────────────────────────────────────
   Richer than FeatureCard: title, longer body, optional code/meta footer. */
export function DeepDive({
  items,
  accent = "wdbx",
  cols = 2,
}: {
  items: readonly { title: string; body: string; meta?: string }[];
  accent?: Accent;
  cols?: 2 | 3;
}) {
  return (
    <div className={`grid gap-5 ${cols === 3 ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
      {items.map((it) => (
        <div
          key={it.title}
          className="surface surface-hover accent-edge flex flex-col p-6"
          style={{ ["--accent" as string]: accentHex[accent] }}
        >
          <h4 className="font-display text-lg font-semibold text-white">{it.title}</h4>
          <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-400">{it.body}</p>
          {it.meta ? (
            <p className="mt-4 border-t border-line pt-3 font-mono text-[11px] text-slate-600">{it.meta}</p>
          ) : null}
        </div>
      ))}
    </div>
  );
}

/* ── Numbered steps ──────────────────────────────────────────────────────────
   For real sequences only (request lifecycle, build flow). */
export function StepList({
  steps,
  accent = "wdbx",
}: {
  steps: readonly { title: string; body: string }[];
  accent?: Accent;
}) {
  return (
    <ol className="space-y-4">
      {steps.map((s, i) => (
        <li
          key={s.title}
          className="surface accent-edge flex gap-4 p-5"
          style={{ ["--accent" as string]: accentHex[accent] }}
        >
          <span
            className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full font-mono text-xs font-bold"
            style={{ background: `${accentHex[accent]}1a`, color: accentHex[accent] }}
          >
            {String(i + 1).padStart(2, "0")}
          </span>
          <div>
            <h4 className="font-display text-base font-semibold text-white">{s.title}</h4>
            <p className="mt-1 text-sm leading-relaxed text-slate-400">{s.body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

/* ── Callout ─────────────────────────────────────────────────────────────────
   An accent-washed aside for a single important idea or integrity note. */
export function Callout({
  label,
  children,
  accent = "wdbx",
}: {
  label?: string;
  children: React.ReactNode;
  accent?: Accent;
}) {
  return (
    <div
      className="surface accent-edge p-6"
      style={{ ["--accent" as string]: accentHex[accent] }}
    >
      {label ? (
        <div className={`mb-2 font-mono text-xs uppercase tracking-[0.2em] ${accentText[accent]}`}>{label}</div>
      ) : null}
      <p className="text-[15px] leading-relaxed text-slate-300">{children}</p>
    </div>
  );
}

/* ── FAQ ─────────────────────────────────────────────────────────────────────
   Native <details> for zero-JS progressive disclosure. */
export function FAQList({
  items,
  accent = "wdbx",
}: {
  items: readonly { q: string; a: string }[];
  accent?: Accent;
}) {
  return (
    <div className="divide-y divide-line overflow-hidden rounded-xl border border-line">
      {items.map((it) => (
        <details key={it.q} className="group bg-panel/40 px-6 py-4 [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-medium text-white">
            {it.q}
            <span
              className={`shrink-0 font-mono text-lg transition-transform group-open:rotate-45 ${accentText[accent]}`}
              aria-hidden
            >
              +
            </span>
          </summary>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400">{it.a}</p>
        </details>
      ))}
    </div>
  );
}

/* ── Glossary ────────────────────────────────────────────────────────────────
   Term + definition list — the vocabulary of the system, stated plainly. */
export function Glossary({ items }: { items: readonly { term: string; def: string }[] }) {
  return (
    <dl className="grid gap-x-10 gap-y-6 md:grid-cols-2">
      {items.map((it) => (
        <div key={it.term} className="border-l-2 border-line pl-4">
          <dt className="font-mono text-sm font-semibold text-white">{it.term}</dt>
          <dd className="mt-1 text-sm leading-relaxed text-slate-400">{it.def}</dd>
        </div>
      ))}
    </dl>
  );
}

/* ── Pull quote ──────────────────────────────────────────────────────────────
   One line, large, for a thesis statement. No attribution to real people. */
export function PullQuote({ children, accent = "wdbx" }: { children: React.ReactNode; accent?: Accent }) {
  return (
    <blockquote className="relative max-w-3xl py-2">
      <span
        aria-hidden
        className="absolute -left-1 top-0 h-full w-[3px] rounded-full"
        style={{ background: accentHex[accent], opacity: 0.7 }}
      />
      <p className="pl-6 font-display text-2xl font-medium leading-snug tracking-tight text-slate-200 md:text-[28px]">
        {children}
      </p>
    </blockquote>
  );
}

/* ── Spec table ──────────────────────────────────────────────────────────────
   Tight label/value list for technical specs (no provenance — these are config
   facts, not benchmarks). */
export function SpecList({ rows }: { rows: readonly { k: string; v: string }[] }) {
  return (
    <div className="surface overflow-hidden">
      {rows.map((r, i) => (
        <div
          key={r.k}
          className={`flex items-baseline justify-between gap-6 px-5 py-3.5 ${i % 2 ? "bg-white/[0.015]" : ""}`}
        >
          <span className="text-sm text-slate-400">{r.k}</span>
          <span className="text-right font-mono text-sm text-slate-200">{r.v}</span>
        </div>
      ))}
    </div>
  );
}
