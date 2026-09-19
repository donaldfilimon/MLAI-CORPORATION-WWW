import { cn } from "@/lib/utils";

/**
 * Provenance classes, per `docs/master-reference.md`. Every metric this site
 * publishes carries exactly one of these, and they are never conflated.
 */
export type Provenance = "measured" | "target" | "reported";

/**
 * One row per provenance class — glyph, label, description, and both color
 * treatments. Deliberately a single table: these were previously three parallel
 * `Record<Provenance, …>` maps plus a hand-maintained order array, so adding a
 * fourth class meant editing four places, and only three of them were
 * type-checked.
 *
 * Declaration order is render order; `PROVENANCE_ORDER` derives from it rather
 * than being kept in sync alongside it.
 */
const PROVENANCE = {
  measured: {
    glyph: "●",
    label: "Measured",
    description: "reproduced on our hardware",
    chip: "border-emerald-400/25 bg-emerald-400/5 text-emerald-300",
    dot: "bg-emerald-400 shadow-[0_0_8px] shadow-emerald-400/60",
  },
  target: {
    glyph: "○",
    label: "Target",
    description: "engineering goal",
    chip: "border-amber-400/25 bg-amber-400/5 text-amber-300",
    // Outline rather than fill — a target is not a result.
    dot: "border border-amber-400",
  },
  reported: {
    glyph: "◆",
    label: "Reported",
    description: "cited research figure",
    // Violet, matching the legend this replaced in `Footer.tsx` — the shipped
    // site had already established this color for "reported".
    chip: "border-violet-400/25 bg-violet-400/5 text-violet-300",
    dot: "bg-violet-400 shadow-[0_0_8px] shadow-violet-400/60",
  },
} satisfies Record<Provenance, { glyph: string; label: string; description: string; chip: string; dot: string }>;

const PROVENANCE_ORDER = Object.keys(PROVENANCE) as readonly Provenance[];

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
  const { glyph, label, chip } = PROVENANCE[tag];
  return (
    <span
      className={cn(
        "font-mono inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]",
        chip,
        className,
      )}
    >
      <span aria-hidden="true">{glyph}</span>
      {label}
    </span>
  );
}

export interface ProvLegendProps {
  /**
   * `chips` renders the same `ProvTag` pills used beside figures — good in page
   * content. `inline` is the compact mono/dot row the footer carries site-wide.
   * @default "chips"
   */
  variant?: "chips" | "inline";
  className?: string;
}

/**
 * The standing legend explaining the three provenance classes.
 *
 * One definition, two presentations — before this existed the footer carried
 * its own hand-rolled copy, which is exactly how a legend drifts out of step
 * with the tags it explains.
 */
export function ProvLegend({ variant = "chips", className }: ProvLegendProps) {
  const inline = variant === "inline";
  return (
    <dl
      className={cn(
        "flex flex-wrap items-center gap-x-6 gap-y-2",
        // Full-strength text-dim, not /70: composited at 70% over the ink
        // canvas that lands at 4.26:1, under the 4.5:1 AA floor for text below
        // 18.66px. At full opacity it is 7.86:1.
        inline && "font-mono text-[11px] uppercase tracking-[0.12em] text-text-dim",
        className,
      )}
      aria-label="How figures on this site are labeled"
    >
      {PROVENANCE_ORDER.map((tag) => (
        <div key={tag} className="flex items-center gap-2">
          {/* The chip or dot lives inside the <dt>: a bare <span> as a direct
              child of <dl> is outside its content model and breaks term/
              definition pairing in some assistive tech. In the chip variant the
              chip IS the term — `ProvTag` renders its label as real text, so an
              extra sr-only <dt> would announce the word twice. */}
          <dt className={cn(inline && "flex items-center gap-2 font-semibold")}>
            {inline ? (
              <>
                <span
                  className={cn("h-2 w-2 rounded-full", PROVENANCE[tag].dot)}
                  aria-hidden="true"
                />
                {tag}
              </>
            ) : (
              <ProvTag tag={tag} />
            )}
          </dt>
          <dd className={cn(!inline && "text-xs text-text-dim")}>
            {inline && "— "}
            {PROVENANCE[tag].description}
          </dd>
        </div>
      ))}
    </dl>
  );
}
