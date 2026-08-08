import { cn } from "@/lib/utils";

export interface SpecRow {
  k: string;
  v: string;
}

export interface SpecListProps {
  /**
   * Key/value spec rows. These are *configuration facts* (index type, graph
   * degree, distance metric) — not measurements, which is why no provenance
   * tag appears here. If a row would carry a number that needs qualifying, it
   * belongs in a `StatBlock` instead.
   */
  rows: readonly SpecRow[];
  className?: string;
}

/** A two-column definition list of configuration facts. */
export function SpecList({ rows, className }: SpecListProps) {
  return (
    <dl className={cn("divide-y divide-white/6 overflow-hidden rounded-xl border border-white/8", className)}>
      {rows.map((row) => (
        <div
          key={row.k}
          className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 px-4 py-3 transition-colors hover:bg-white/2"
        >
          <dt className="text-sm text-text-dim">{row.k}</dt>
          <dd
            className="text-sm font-medium text-white"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {row.v}
          </dd>
        </div>
      ))}
    </dl>
  );
}
