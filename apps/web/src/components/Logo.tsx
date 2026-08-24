import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LogoMark } from "./LogoMark";

export { LogoMark, type LogoMarkProps } from "./LogoMark";

interface LogoProps {
  /** Render the Quesar product wordmark and MLAI endorsement. */
  withWordmark?: boolean;
  /** Visual size of the mark. */
  size?: "sm" | "md";
  className?: string;
  /** When false, renders a plain div instead of a link to "/". */
  asLink?: boolean;
  /**
   * Collapse the gradient plate to `currentColor` — for monochrome contexts
   * (print, single-color spots, a dark-on-light header).
   */
  mono?: boolean;
}

export function Logo({
  withWordmark = true,
  size = "md",
  className,
  asLink = true,
  mono = false,
}: LogoProps) {
  const content = (
    <>
      <LogoMark size={size} mono={mono} />
      {withWordmark && (
        <span className="flex flex-col leading-none">
          <span className={cn("font-display font-bold tracking-tight", mono ? "text-current" : "text-white")}>Quesar</span>
          <span className={cn("mt-1 font-mono text-[8px] font-medium uppercase tracking-[0.22em]", mono ? "text-current opacity-60" : "text-cyan-200/55")}>
            by MLAI
          </span>
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
    <Link to="/" className={classes} aria-label="Quesar by MLAI — home">
      {content}
    </Link>
  );
}
