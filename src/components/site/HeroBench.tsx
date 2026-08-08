"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface HeroBenchProps {
  /**
   * The terminal transcript, one entry per line. Supply real command output
   * from the content layer — this component ships no sample lines, because a
   * fabricated benchmark transcript is exactly the claim the site can't make.
   */
  lines: readonly string[];
  /** Prompt string shown before the first line. @default "$" */
  prompt?: string;
  /**
   * Type the transcript out line by line instead of showing it at once.
   *
   * Defaults to **false** on purpose: the transcript is the information, and
   * animating from an empty terminal means the content is missing from the
   * server HTML, missing without JavaScript, and missing from any static
   * screenshot. Opt in only where the motion earns its keep.
   */
  animate?: boolean;
  /** Milliseconds between lines when `animate` is set. @default 420 */
  interval?: number;
  className?: string;
}

/**
 * A terminal transcript, optionally typed out line by line.
 *
 * `prefers-reduced-motion` forces the full transcript immediately — the
 * information is the point, the animation is decoration. The live region is
 * `off` deliberately: announcing each line as it appears would flood a screen
 * reader with what is, semantically, one static block of output.
 */
export function HeroBench({
  lines,
  prompt = "$",
  animate = false,
  interval = 420,
  className,
}: HeroBenchProps) {
  const reduceMotion = useReducedMotion();
  const typing = animate && !reduceMotion;
  const [shown, setShown] = useState(lines.length);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!typing) {
      setShown(lines.length);
      return;
    }
    setShown(0);
    timer.current = setInterval(() => {
      setShown((n) => {
        if (n >= lines.length) {
          if (timer.current) clearInterval(timer.current);
          return n;
        }
        return n + 1;
      });
    }, interval);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
    // Depend on `lines.length`, not `lines`: an inline array literal is a new
    // reference every render, which would tear down and restart the animation
    // — a parent re-rendering faster than `interval` would reset the transcript
    // forever without it.
  }, [lines.length, interval, typing]);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-white/8 bg-black/40 backdrop-blur-sm",
        className,
      )}
    >
      <div className="flex items-center gap-1.5 border-b border-white/6 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" aria-hidden="true" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" aria-hidden="true" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" aria-hidden="true" />
      </div>
      <pre
        // tabIndex: the transcript scrolls horizontally, and without it a
        // keyboard-only user can never reach the tail of a long command. The
        // explicit outline is needed because the parent is overflow-hidden,
        // which would clip the global box-shadow focus ring.
        tabIndex={0}
        className="overflow-x-auto px-4 py-3 text-xs leading-relaxed text-text-dim focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-cyan-400 font-mono"
        aria-live="off"
      >
        {/* <span className="block">, not <div>: <pre> takes phrasing content,
            and a block box interrupting it can drop some screen readers out of
            preformatted reading mode. Renders identically. */}
        {lines.slice(0, shown).map((line, i) => (
          <span key={i} className="block">
            {i === 0 && <span className="text-cyan-300">{prompt} </span>}
            {/* A blank separator line would collapse to zero height and vanish,
                so an empty string still renders one line-box. */}
            {line === "" ? " " : line}
          </span>
        ))}
        {shown < lines.length && (
          <span className="inline-block h-3 w-2 translate-y-0.5 bg-cyan-300" aria-hidden="true" />
        )}
      </pre>
    </div>
  );
}
