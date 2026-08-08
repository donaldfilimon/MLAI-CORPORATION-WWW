import { cn } from "@/lib/utils";

/**
 * Provenance classes, per `docs/master-reference.md`. Every metric this site
 * publishes carries exactly one of these, and they are never conflated:
 *
 *   ● measured — reproduced on MLAI hardware
 *   ○ target   — an engineering goal, not yet a measured result
 *   ◆ reported — a cited or internal-eval figure
 */
export type Provenance = "measured" | "target" | "reported";

const MARKS: Record<Provenance, { glyph: string; label: string; className: string }> = {
  measured: {
    glyph: "●",
    label: "Measured",
    className: "border-emerald-400/25 bg-emerald-400/5 text-emerald-300",
  },
  target: {
    glyph: "○",
    label: "Target",
    className: "border-amber-400/25 bg-amber-400/5 text-amber-300",
  },
  // Violet, matching the legend this replaced in `Footer.tsx` — the shipped
  // site already established this color for "reported", so keep it.
  reported: {
    glyph: "◆",
    label: "Reported",
    className: "border-violet-400/25 bg-violet-400/5 text-violet-300",
  },
};

export interface ProvTagProps {
  /** Which provenance class the figure carries. */
  tag: Provenance;
  className?: string;
}

/**
 * The provenance chip that accompanies a published figure.
 *
 * The glyph is decorative (`aria-hidden`); the word carries the meaning, so the
 * distinction survives for screen readers and for anyone who can't resolve
 * ●/○/◆ apart at small sizes.
 */
export function ProvTag({ tag, className }: ProvTagProps) {
  const mark = MARKS[tag];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]",
        mark.className,
        className,
      )}
      style={{ fontFamily: "var(--font-mono)" }}
    >
      <span aria-hidden="true">{mark.glyph}</span>
      {mark.label}
    </span>
  );
}

const DESCRIPTIONS: Record<Provenance, string> = {
  measured: "reproduced on our hardware",
  target: "engineering goal",
  reported: "cited research figure",
};

/** Dot styling for the `inline` variant, matching the site-wide footer legend. */
const DOTS: Record<Provenance, string> = {
  measured: "bg-emerald-400 shadow-[0_0_8px] shadow-emerald-400/60",
  target: "border border-amber-400",
  reported: "bg-violet-400 shadow-[0_0_8px] shadow-violet-400/60",
};

export interface ProvLegendProps {
  /**
   * `chips` renders the same `ProvTag` pills used beside figures — good in
   * page content. `inline` is the compact mono/dot row the footer carries
   * site-wide.
   * @default "chips"
   */
  variant?: "chips" | "inline";
  className?: string;
}

const ORDER: readonly Provenance[] = ["measured", "target", "reported"] as const;

/**
 * The standing legend explaining the three provenance classes.
 *
 * One definition, two presentations — before this existed the footer carried
 * its own hand-rolled copy, which is exactly how a legend drifts out of step
 * with the tags it explains.
 */
export function ProvLegend({ variant = "chips", className }: ProvLegendProps) {
  if (variant === "inline") {
    return (
      <dl
        className={cn(
          // Full-strength text-dim, not /70: composited at 70% over the ink
          // canvas this lands at 4.26:1, under the 4.5:1 AA floor for text
          // below 18.66px. At full opacity it is 7.86:1.
          "flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[11px] uppercase tracking-[0.12em] text-text-dim",
          className,
        )}
      >
        {ORDER.map((tag) => (
          <div key={tag} className="flex items-center gap-2">
            {/* The dot lives inside the <dt>: a bare <span> as a direct child
                of <dl> is outside its content model and breaks term/definition
                pairing in some assistive tech. */}
            <dt className="flex items-center gap-2 font-semibold">
              <span className={cn("h-2 w-2 rounded-full", DOTS[tag])} aria-hidden="true" />
              {tag}
            </dt>
            <dd>— {DESCRIPTIONS[tag]}</dd>
          </div>
        ))}
      </dl>
    );
  }

  return (
    <dl
      className={cn("flex flex-wrap items-center gap-x-6 gap-y-2", className)}
      aria-label="How figures on this site are labeled"
    >
      {ORDER.map((tag) => (
        <div key={tag} className="flex items-center gap-2">
          {/* The chip IS the term — `ProvTag` renders its label as real text
              with only the glyph aria-hidden, so an extra sr-only <dt> would
              announce the word twice. */}
          <dt>
            <ProvTag tag={tag} />
          </dt>
          <dd className="text-xs text-text-dim">{DESCRIPTIONS[tag]}</dd>
        </div>
      ))}
    </dl>
  );
}
