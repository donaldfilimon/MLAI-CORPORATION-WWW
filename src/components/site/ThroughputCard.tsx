import { cn } from "@/lib/utils";
import { ProvTag, type Provenance } from "./ProvTag";
import { accentClasses, type Accent } from "./accent";

export interface ThroughputRow {
  /** What was run, e.g. a workload size. */
  label: string;
  /** Display value, e.g. "12×". */
  value: string;
  /** Where the figure comes from — required, same rule as `StatBlock`. */
  tag: Provenance;
  /**
   * Bar fill, 0–1, relative to the largest row. Supply it explicitly rather
   * than parsing `value`: the display strings are free-form and a parser would
   * guess wrong on "≈ 40" or "1.8 GB".
   *
   * **A bar is an assertion even when no number is printed.** Keep `fill`
   * proportional to the countable thing in `value` — a bar whose length implies
   * a ratio the data doesn't support is a claim, and falls under the same
   * external-claims rule as a printed figure.
   */
  fill: number;
}

export interface ThroughputCardProps {
  /** The ladder rows, in the order they should render. */
  rows: readonly ThroughputRow[];
  title?: string;
  /** Product accent. @default "abi" */
  accent?: Accent;
  className?: string;
}

/**
 * A labeled ladder of throughput/speedup figures.
 *
 * Every row carries its own provenance tag, so a measured figure and a target
 * can sit in the same ladder without being conflated — which is the whole
 * reason this renders tags per row instead of one tag for the card.
 */
export function ThroughputCard({
  rows,
  title = "Throughput",
  accent = "abi",
  className,
}: ThroughputCardProps) {
  const a = accentClasses(accent);
  return (
    <div className={cn("glass-card flex flex-col gap-4", className)}>
      <h3 className="font-display text-base font-semibold text-white">{title}</h3>
      <ul role="list" className="space-y-3">
        {/* Keyed by label+tag, not label alone: the whole point of this card is
            that a measured figure and a target can share a ladder, so two rows
            with the same label and different tags is the designed-in case. */}
        {rows.map((row) => (
          <li key={`${row.label}-${row.tag}`} className="space-y-1.5">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-xs text-text-dim">{row.label}</span>
              <span className="flex items-center gap-2">
                <span
                  className={cn("text-sm font-semibold", a.text)}
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {row.value}
                </span>
                <ProvTag tag={row.tag} />
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/6">
              <div
                className={cn("h-full rounded-full", a.dot)}
                // A non-finite fill (e.g. a division by a missing baseline)
                // yields "NaN%", which the browser drops — leaving width:auto,
                // i.e. a FULL bar. Bad input must not render the strongest
                // possible claim, so it clamps to empty instead.
                style={{
                  width: `${Number.isFinite(row.fill) ? Math.max(0, Math.min(1, row.fill)) * 100 : 0}%`,
                }}
                aria-hidden="true"
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
