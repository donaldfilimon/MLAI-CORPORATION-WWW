"use client";

/**
 * Route-segment error boundary (App Router). Renders inside the root layout,
 * so page chrome (Navbar/Footer) and global styles stay intact — this covers
 * render/runtime failures in any page below `app/layout.tsx`. Full layout
 * failures fall through to `app/global-error.tsx`.
 */

import { useEffect } from "react";
import { ArrowLeft, RotateCcw } from "lucide-react";

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface for local debugging; production telemetry stays event-allowlisted
    // (see /api/telemetry) so we deliberately do NOT ship error payloads.
    console.error(error);
  }, [error]);

  return (
    <div
      className="container-custom flex min-h-screen items-center pt-32 pb-24 font-sans"
      role="alert"
      aria-labelledby="route-error-heading"
    >
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-cyan-400 uppercase">
          500 — Something failed
        </span>
        <h1
          id="route-error-heading"
          className="mt-4 text-4xl md:text-5xl font-display font-bold text-white tracking-tight leading-[1.1]"
        >
          This page hit an unexpected error.
        </h1>
        <p className="mt-5 text-base md:text-lg text-text-dim leading-relaxed container-prose">
          The rest of the site is fine — this route failed to render. You can
          retry the page, or head back to solid ground.
          {error.digest ? (
            <span className="mt-3 block font-mono text-xs text-text-dim/60">
              Reference: {error.digest}
            </span>
          ) : null}
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 px-5 py-2 text-sm font-bold uppercase tracking-widest text-cyan-400 transition-colors hover:border-cyan-400/60 hover:text-cyan-300"
          >
            <RotateCcw className="h-3 w-3" /> Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-white transition-colors hover:text-cyan-400"
          >
            <ArrowLeft className="h-3 w-3" /> Back to home
          </a>
        </div>
      </div>
    </div>
  );
}
