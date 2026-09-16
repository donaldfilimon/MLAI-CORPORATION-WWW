import type * as React from "react";
import Link from "./next-link";
import type { Accent, Provenance, Stat } from "./brand";
import { nav, company, colors } from "./brand";
import { LogoMark } from "./Logo";
export { Nav } from "./Nav";

// ── Accent utilities ─────────────────────────────────────────────────────────

export const accentText: Record<Accent, string> = {
  wdbx: "text-wdbx",
  abi: "text-abi",
  abbey: "text-abbey",
};
export const accentBorder: Record<Accent, string> = {
  wdbx: "border-wdbx/40",
  abi: "border-abi/40",
  abbey: "border-abbey/40",
};
export const accentBg: Record<Accent, string> = {
  wdbx: "bg-wdbx",
  abi: "bg-abi",
  abbey: "bg-abbey",
};
// Derived from the canonical palette in lib/brand.ts — do not re-inline hex here.
export const accentHex: Record<Accent, string> = {
  wdbx: colors.wdbx,
  abi: colors.abi,
  abbey: colors.abbey,
};

// ── Provenance tag — the site's signature element ────────────────────────────
// Every number renders through <ProvTag/>; honest engineering, visibly enforced.

const provStyles: Record<Provenance, { dot: string; label: string; cls: string }> = {
  measured: { dot: "●", label: "measured", cls: "text-abbey" },
  target: { dot: "○", label: "target", cls: "text-warn" },
  reported: { dot: "◆", label: "reported", cls: "text-abi" },
};

export function ProvTag({ tag }: { tag: Provenance }) {
  const s = provStyles[tag];
  return (
    <span
      className={`inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.15em] ${s.cls}`}
      title={
        tag === "measured"
          ? "Reproduced on MLAI hardware; harness in repo"
          : tag === "target"
            ? "Engineering goal, not yet achieved"
            : "Figure from cited research document"
      }
    >
      <span aria-hidden>{s.dot}</span>
      {s.label}
    </span>
  );
}

export function ProvLegend() {
  return (
    <div className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-[10px] uppercase tracking-[0.15em] text-slate-500">
      <span>
        <span className="text-abbey">●</span> measured — reproduced on our hardware
      </span>
      <span>
        <span className="text-warn">○</span> target — engineering goal
      </span>
      <span>
        <span className="text-abi">◆</span> reported — cited research figure
      </span>
    </div>
  );
}

export function StatBlock({ stat, accent = "wdbx" }: { stat: Stat; accent?: Accent }) {
  return (
    <div
      className="surface surface-hover accent-edge p-5"
      style={{ ["--accent" as string]: accentHex[accent] }}
    >
      <div className={`font-mono text-3xl font-bold tracking-tight ${accentText[accent]}`}>
        {stat.value}
      </div>
      <div className="mt-1 text-sm text-slate-300">{stat.label}</div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <ProvTag tag={stat.tag} />
        {stat.note ? <span className="text-[11px] text-slate-600">{stat.note}</span> : null}
      </div>
    </div>
  );
}

// ── Section primitives ───────────────────────────────────────────────────────

export function Eyebrow({ children, accent = "wdbx" }: { children: React.ReactNode; accent?: Accent }) {
  return (
    <div className={`mb-3 flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.25em] ${accentText[accent]}`}>
      <span aria-hidden className={`h-px w-6 ${accentBg[accent]} opacity-70`} />
      {children}
    </div>
  );
}

export function Section({
  eyebrow,
  title,
  accent = "wdbx",
  children,
  lead,
}: {
  eyebrow?: string;
  title?: string;
  accent?: Accent;
  lead?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-line py-16">
      <div className="mx-auto max-w-6xl px-6">
        {eyebrow ? <Eyebrow accent={accent}>{eyebrow}</Eyebrow> : null}
        {title ? (
          <h2 className="font-display text-3xl font-semibold tracking-tight text-white md:text-4xl">
            {title}
          </h2>
        ) : null}
        {lead ? <p className="mt-3 max-w-3xl text-slate-400">{lead}</p> : null}
        <div className={title || lead ? "mt-10" : ""}>{children}</div>
      </div>
    </section>
  );
}

export function FeatureCard({
  title,
  desc,
  accent,
}: {
  title: string;
  desc: string;
  accent: Accent;
}) {
  return (
    <div className={`surface surface-hover border-l-2 ${accentBorder[accent]} p-5`}>
      <h3 className="font-display text-base font-semibold text-white">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{desc}</p>
    </div>
  );
}

export function DataTable({
  cols,
  rows,
  accent = "wdbx",
  highlightCol,
}: {
  cols: readonly string[];
  rows: readonly (readonly string[])[];
  accent?: Accent;
  highlightCol?: number;
}) {
  return (
    <div
      className="surface accent-edge overflow-x-auto"
      style={{ ["--accent" as string]: accentHex[accent] }}
    >
      <table className="w-full font-mono text-sm">
        <thead>
          <tr className="border-b border-line bg-white/[0.02]">
            {cols.map((c, i) => (
              <th
                key={i}
                className={`p-4 text-left text-xs uppercase tracking-wider ${
                  i === highlightCol ? accentText[accent] : "text-slate-500"
                }`}
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr
              key={i}
              className="border-b border-line/50 last:border-0 even:bg-white/[0.015]"
            >
              {r.map((cell, j) => (
                <td
                  key={j}
                  className={`p-4 ${
                    j === highlightCol ? "bg-white/[0.02]" : ""
                  } ${
                    j === 0
                      ? "text-slate-300"
                      : j === highlightCol
                        ? `font-semibold ${accentText[accent]}`
                        : "text-slate-500"
                  }`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Nav & footer ─────────────────────────────────────────────────────────────


export function Footer() {
  return (
    <footer className="relative border-t border-line">
      <div className="brand-seam absolute inset-x-0 top-0" aria-hidden />
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col justify-between gap-8 md:flex-row">
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5">
              <LogoMark size={30} />
              <span className="font-display text-lg font-bold tracking-[0.2em] text-white">MLAI</span>
            </div>
            <p className="mt-3 text-sm text-slate-500">{company.tagline}</p>
            <p className="mt-3 text-xs leading-relaxed text-slate-600">{company.appleFraming}</p>
          </div>
          <div className="flex gap-12">
            <div className="grid grid-cols-2 gap-x-10 gap-y-2 font-mono text-xs uppercase tracking-[0.15em]">
              {nav.map((item) => (
                <Link key={item.href} href={item.href} className="text-slate-500 hover:text-white">
                  {item.label}
                </Link>
              ))}
              <Link href="/contact" className="text-slate-500 hover:text-white">
                Contact
              </Link>
            </div>
            <div className="flex flex-col gap-2 font-mono text-xs uppercase tracking-[0.15em]">
              <a
                href="https://github.com/donaldfilimon/abi"
                className="text-slate-500 hover:text-white"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub ↗
              </a>
              <a
                href="https://donaldfilimon.github.io/abi/"
                className="text-slate-500 hover:text-white"
                target="_blank"
                rel="noopener noreferrer"
              >
                Docs ↗
              </a>
              <a
                href="https://donaldfilimon.com"
                className="text-slate-500 hover:text-white"
                target="_blank"
                rel="noopener noreferrer"
              >
                Founder ↗
              </a>
            </div>
          </div>
        </div>
        <div className="mt-10 border-t border-line pt-6">
          <ProvLegend />
          <p className="mt-4 font-mono text-[11px] text-slate-600">
            © 2026 {company.legalName} · {company.entity} · {company.location}
          </p>
        </div>
      </div>
    </footer>
  );
}

export function NextUp({
  items,
}: {
  items: { label: string; href: string; desc: string; accent: Accent }[];
}) {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-20">
      <div className="grid gap-px border border-line bg-line md:grid-cols-2">
        {items.map((it) => (
          <Link key={it.href} href={it.href} className="group bg-panel p-6 hover:bg-panel/60">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
              Continue
            </span>
            <div className={`mt-2 font-display text-lg font-semibold ${accentText[it.accent]}`}>
              {it.label} <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
            </div>
            <p className="mt-1 text-sm text-slate-500">{it.desc}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
