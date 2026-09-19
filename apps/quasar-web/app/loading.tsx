/**
 * Root loading UI (App Router streaming fallback). Kept deliberately quiet —
 * a centered brand pulse on the ink canvas so slow segments never flash a
 * white screen. Server component; no client JS.
 */

export default function Loading() {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-bg"
      role="status"
      aria-label="Loading"
    >
      <div className="flex flex-col items-center gap-4">
        <span className="relative flex h-10 w-10">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400/30" />
          <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-cyan-500/30">
            <span className="h-2 w-2 rounded-full bg-cyan-400" />
          </span>
        </span>
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-text-dim/70">
          Loading
        </span>
      </div>
    </div>
  );
}
