import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface LogoProps {
  /** Render the "MLAI CORP" wordmark next to the mark. */
  withWordmark?: boolean;
  /** Visual size of the mark. */
  size?: "sm" | "md";
  className?: string;
  /** When false, renders a plain div instead of a link to "/". */
  asLink?: boolean;
}

/**
 * MLAI brand mark — a node-graph glyph evoking WDBX's weighted backtrace
 * paths, set on the emerald→teal "Signal" gradient. Reused in the navbar,
 * footer, and auth surfaces so the identity stays consistent in one place.
 */
function Mark({ size = "md" }: { size?: "sm" | "md" }) {
  const box = size === "sm" ? "h-7 w-7" : "h-9 w-9";
  return (
    <span
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/25 ring-1 ring-white/15 transition-transform group-hover:scale-105",
        box,
      )}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className={size === "sm" ? "h-4 w-4" : "h-5 w-5"}
      >
        {/* weighted backtrace edges */}
        <path
          d="M6.5 16.5 L12 7.5 L17.5 13.5"
          stroke="white"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.95"
        />
        {/* nodes */}
        <circle cx="6.5" cy="16.5" r="2.1" fill="white" />
        <circle cx="12" cy="7.5" r="2.1" fill="white" />
        <circle cx="17.5" cy="13.5" r="2.1" fill="white" opacity="0.85" />
      </svg>
    </span>
  );
}

export function Logo({
  withWordmark = true,
  size = "md",
  className,
  asLink = true,
}: LogoProps) {
  const content = (
    <>
      <Mark size={size} />
      {withWordmark && (
        <span className="font-display font-bold tracking-tight leading-none">
          <span className="text-white">MLAI</span>
          <span className="ml-1 text-text-dim/70">CORP</span>
        </span>
      )}
    </>
  );

  const classes = cn(
    "group inline-flex items-center gap-2.5",
    size === "sm" ? "text-base" : "text-xl",
    className,
  );

  if (!asLink) {
    return <div className={classes}>{content}</div>;
  }

  return (
    <Link to="/" className={classes} aria-label="MLAI Corporation — home">
      {content}
    </Link>
  );
}
