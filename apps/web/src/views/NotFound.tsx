"use client";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";

const SUGGESTED = [
  { to: "/research", label: "Research" },
  { to: "/docs", label: "Docs" },
  { to: "/benchmarks", label: "Benchmarks" },
  { to: "/blog", label: "Lab notes" },
];

type Recovery = {
  eyebrow: string;
  title: string;
  body: string;
  backTo: string;
  backLabel: string;
};

const SECTION_RECOVERY = {
  docs: {
    eyebrow: "404 — Document not found",
    title: "That document doesn't exist.",
    body: "It may have been renamed or retired. Browse the documentation instead.",
    backTo: "/docs",
    backLabel: "All documentation",
  },
  blog: {
    eyebrow: "404 — Note not found",
    title: "That lab note doesn't exist.",
    body: "It may have been renamed or retired. Browse the latest notes instead.",
    backTo: "/blog",
    backLabel: "All notes",
  },
  research: {
    eyebrow: "404 — Paper not found",
    title: "That research note doesn't exist.",
    body: "It may have been renamed or retired. Browse the research archive instead.",
    backTo: "/research",
    backLabel: "Research archive",
  },
  products: {
    eyebrow: "404 — Product not found",
    title: "That product doesn't exist.",
    body: "It may have been renamed or retired. Browse the current products instead.",
    backTo: "/products",
    backLabel: "All products",
  },
  projects: {
    eyebrow: "404 — Project not found",
    title: "That project doesn't exist.",
    body: "It may have been renamed or retired. Browse the projects directory instead.",
    backTo: "/projects",
    backLabel: "All projects",
  },
  team: {
    eyebrow: "404 — Profile not found",
    title: "That profile doesn't exist.",
    body: "The profile may have moved. Return to the leadership directory instead.",
    backTo: "/team",
    backLabel: "Back to leadership",
  },
} as const;

const DEFAULT_RECOVERY = {
  eyebrow: "404 — Page not found",
  title: "This path doesn't resolve.",
  body: "The page you're looking for may have been moved, renamed, or never existed. Let's get you back to something real.",
  backTo: "/",
  backLabel: "Back to home",
} as const;

export function recoveryForPathname(pathname: string): Recovery {
  const section = pathname.split("/")[1] as keyof typeof SECTION_RECOVERY;
  return SECTION_RECOVERY[section] ?? DEFAULT_RECOVERY;
}

export function NotFound() {
  const [recovery, setRecovery] = useState<Recovery>(DEFAULT_RECOVERY);

  useEffect(() => setRecovery(recoveryForPathname(window.location.pathname)), []);

  return (
    <div
      className="container-custom pt-32 pb-24 min-h-screen font-sans flex items-center"
      role="main"
      aria-labelledby="notfound-heading"
    >
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-cyan-400 uppercase">
          {recovery.eyebrow}
        </span>
        <h1
          id="notfound-heading"
          className="mt-4 text-4xl md:text-5xl font-display font-bold text-white tracking-tight leading-[1.1]"
        >
          {recovery.title}
        </h1>
        <p className="mt-5 text-base md:text-lg text-text-dim leading-relaxed container-prose">
          {recovery.body}
        </p>

        <div className="mt-8 flex items-center justify-center">
          <Link
            to={recovery.backTo}
            className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-white hover:text-cyan-400 transition-colors"
          >
            <ArrowLeft className="w-3 h-3" /> {recovery.backLabel}
          </Link>
        </div>

        <div className="mt-12 border-t border-white/10 pt-8">
          <p className="text-xs font-mono uppercase tracking-widest text-text-dim/50 mb-4">
            Or jump to
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {SUGGESTED.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="group inline-flex items-center gap-1.5 rounded-full border border-white/10 px-4 py-1.5 text-sm text-text-dim transition-colors hover:border-cyan-500/30 hover:text-cyan-400"
              >
                {item.label}
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
