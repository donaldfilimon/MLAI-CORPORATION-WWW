import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { accentClasses, type Accent } from "./accent";

export interface CalloutProps {
  /** Optional mono label above the body. */
  label?: string;
  children: ReactNode;
  /** Product accent. @default "wdbx" */
  accent?: Accent;
  className?: string;
}

/** An aside set off from the surrounding prose by an accent edge. */
export function Callout({ label, children, accent = "wdbx", className }: CalloutProps) {
  const a = accentClasses(accent);
  return (
    <aside
      // `a.border` is used verbatim, NOT rewritten to `border-l-*`: Tailwind
      // scans source text for complete class names, so a name built by
      // `.replace()` is never emitted and the accent silently falls back to the
      // global gray border. Preflight sets `border: 0 solid` on everything, so
      // an all-sides color paired with `border-l-2` paints only the left edge.
      className={cn("rounded-r-xl border-l-2 py-4 pr-5 pl-5", a.border, a.bg, className)}
    >
      {label && (
        <p
          className={cn("font-mono mb-2 text-[11px] font-bold uppercase tracking-[0.18em]", a.text)}
        >
          {label}
        </p>
      )}
      <div className="text-sm leading-relaxed text-text-dim text-pretty">{children}</div>
    </aside>
  );
}

export interface PullQuoteProps {
  children: ReactNode;
  /** Product accent for the quote rule. @default "wdbx" */
  accent?: Accent;
  /** Optional attribution rendered under the quote. */
  cite?: string;
  className?: string;
}

/** A display-weight quotation, set in the Spectral serif. */
export function PullQuote({ children, accent = "wdbx", cite, className }: PullQuoteProps) {
  const a = accentClasses(accent);
  return (
    <figure className={cn("my-8", className)}>
      {/* `a.border` verbatim — see the note in Callout above. */}
      <blockquote className={cn("border-l-2 py-1 pl-6", a.border)}>
        <p className="font-display text-xl leading-snug text-white text-balance italic">
          {children}
        </p>
      </blockquote>
      {cite && (
        <figcaption className={cn("mt-3 pl-6 text-xs", a.text)}>{cite}</figcaption>
      )}
    </figure>
  );
}
