import { cn } from "@/lib/utils";
import { CardPanel } from "./CardPanel";
import { ProvTag, type Provenance } from "./ProvTag";
import { accentClasses, type Accent } from "./accent";

export interface Stat {
  value: string;
  label: string;
  /**
   * Required, deliberately. A published figure without a provenance class is
   * exactly the thing `docs/master-reference.md` forbids, so the type makes it
   * impossible to render one by omission.
   */
  tag: Provenance;
  note?: string;
}

export interface StatBlockProps {
  /** The stat to display; its value always renders with a provenance tag. */
  stat: Stat;
  /** Product accent. @default "wdbx" */
  accent?: Accent;
  className?: string;
}

/**
 * A single headline figure with its provenance chip.
 *
 * Supply `stat` from `src/data/categories/stats.ts` (or another content
 * module) — never inline a number here. The component carries no sample data
 * for the same reason the content layer exists.
 */
export function StatBlock({ stat, accent = "wdbx", className }: StatBlockProps) {
  const a = accentClasses(accent);
  return (
    <CardPanel gap="xs" className={className}>
      <div className="flex items-start justify-between gap-3">
        <span className={cn("font-display text-h4 font-bold leading-none", a.text)}>
          {stat.value}
        </span>
        <ProvTag tag={stat.tag} />
      </div>
      <p className="text-sm font-medium text-white">{stat.label}</p>
      {stat.note && <p className="text-xs text-text-dim">{stat.note}</p>}
    </CardPanel>
  );
}
