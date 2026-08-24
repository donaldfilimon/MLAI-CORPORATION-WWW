import { cn } from "@/lib/utils";

export interface LogoMarkProps {
  /** Visual size of the square glyph. */
  size?: "sm" | "md";
  /** Render single-color (currentColor) instead of the cyan→sky gradient. */
  mono?: boolean;
  className?: string;
  /**
   * Accessible label. Defaults to empty, i.e. decorative — the mark is almost
   * always accompanied by the wordmark or a labeled link, and announcing it
   * twice is worse than not announcing it at all.
   */
  title?: string;
}

/**
 * MLAI brand mark — a node-graph glyph evoking WDBX's weighted backtrace
 * paths, set on the "Lab" cyan→sky gradient.
 *
 * Deliberately kept in its own module with **no router import**: `Logo.tsx`
 * pulls in `react-router-dom` (aliased to the `next/navigation` shim), and any
 * module that transitively imports Next's client runtime can't initialize in
 * the standalone design-system bundle — `next/link` reads `process.env.__NEXT_*`
 * at module scope, which throws in a plain browser and takes every other export
 * down with it. Keep this file router-free.
 */
export function LogoMark({ size = "md", mono = false, className, title }: LogoMarkProps) {
  const box = size === "sm" ? "h-7 w-7" : "h-9 w-9";
  return (
    <span
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-[1.03]",
        mono
          ? "text-current"
          : "bg-linear-to-br from-cyan-400 to-sky-500 text-white shadow-sm shadow-cyan-500/15 ring-1 ring-white/10",
        box,
        className,
      )}
      role={title ? "img" : undefined}
      aria-label={title || undefined}
      aria-hidden={title ? undefined : "true"}
    >
      <svg
        viewBox="0 0 32 32"
        fill="none"
        className={size === "sm" ? "h-[18px] w-[18px]" : "h-[22px] w-[22px]"}
        aria-hidden="true"
      >
        {/* M-shaped weighted directed backtrace (the WDBX mark). Strokes take
            currentColor so the mono variant collapses to a single ink. */}
        <path
          d="M8 23 L8 10 L16 16 L24 10 L24 23"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.95"
        />
        <circle cx="8" cy="23" r="2.7" fill="currentColor" />
        <circle cx="8" cy="10" r="2.3" fill="currentColor" />
        <circle cx="16" cy="16" r="2" fill="currentColor" />
        <circle cx="24" cy="10" r="2.3" fill="currentColor" />
        <circle cx="24" cy="23" r="2.7" fill="currentColor" opacity="0.92" />
      </svg>
    </span>
  );
}
