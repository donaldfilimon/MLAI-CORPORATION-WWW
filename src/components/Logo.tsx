import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LogoMark } from "./LogoMark";

export { LogoMark, type LogoMarkProps } from "./LogoMark";

interface LogoProps {
  /** Render the "MLAI CORP" wordmark next to the mark. */
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
        <span className="font-display font-bold tracking-tight leading-none">
          <span className={mono ? "text-current" : "text-white"}>MLAI</span>
          <span className={cn("ml-1", mono ? "text-current opacity-70" : "text-text-dim/70")}>
            CORP
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
    <Link to="/" className={classes} aria-label="MLAI Corporation — home">
      {content}
    </Link>
  );
}
