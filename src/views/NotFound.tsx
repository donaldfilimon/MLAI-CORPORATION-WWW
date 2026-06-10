import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";

const SUGGESTED = [
  { to: "/research", label: "Research" },
  { to: "/docs", label: "Docs" },
  { to: "/benchmarks", label: "Benchmarks" },
  { to: "/blog", label: "Lab notes" },
];

export function NotFound() {
  return (
    <div
      className="container-custom pt-32 pb-24 min-h-screen font-sans flex items-center"
      role="main"
      aria-labelledby="notfound-heading"
    >
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-indigo-400 uppercase">
          404 — Page not found
        </span>
        <h1
          id="notfound-heading"
          className="mt-4 text-4xl md:text-5xl font-display font-bold text-white tracking-tight leading-[1.1]"
        >
          This path doesn&apos;t resolve.
        </h1>
        <p className="mt-5 text-base md:text-lg text-text-dim leading-relaxed container-prose">
          The page you&apos;re looking for may have been moved, renamed, or never
          existed. Let&apos;s get you back to something real.
        </p>

        <div className="mt-8 flex items-center justify-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-white hover:text-indigo-400 transition-colors"
          >
            <ArrowLeft className="w-3 h-3" /> Back to home
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
                className="group inline-flex items-center gap-1.5 rounded-full border border-white/10 px-4 py-1.5 text-sm text-text-dim transition-colors hover:border-indigo-500/30 hover:text-indigo-400"
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
