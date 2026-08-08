import { cn } from "@/lib/utils";
import { accentClasses, type Accent } from "./accent";

export interface IndexLayer {
  /** Layer name, e.g. "L2". */
  name: string;
  /** Node count as display text, e.g. "2" or "1,000,000". */
  nodes: string;
  /** What the layer does, e.g. "entry points". */
  role: string;
}

export interface IndexCardProps {
  /**
   * The layers to illustrate, coarsest first. Structural facts about an index
   * shape — no measurements, so no provenance tags.
   */
  layers: readonly IndexLayer[];
  title?: string;
  /** Product accent. @default "wdbx" */
  accent?: Accent;
  className?: string;
}

/**
 * An illustration of a layered index structure: each layer gets a bar whose
 * width grows toward the dense base, plus its node count and role.
 *
 * The bars are proportional to layer *position*, not to the node counts — a
 * linear bar of 2 vs 1,000,000 would be unreadable, and this is a schematic,
 * not a chart.
 */
export function IndexCard({ layers, title = "Index structure", accent = "wdbx", className }: IndexCardProps) {
  const a = accentClasses(accent);
  return (
    <div className={cn("glass-card flex flex-col gap-4", className)}>
      <h3 className="font-display text-base font-semibold text-white">{title}</h3>
      <ul role="list" className="space-y-3">
        {layers.map((layer, i) => (
          <li key={layer.name} className="flex items-center gap-3">
            <span
              className={cn("w-8 shrink-0 text-[11px] font-bold", a.text)}
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {layer.name}
            </span>
            <span
              className={cn("h-1.5 rounded-full", a.dot)}
              style={{ width: `${((i + 1) / layers.length) * 60 + 12}%`, opacity: 0.35 + (i / layers.length) * 0.65 }}
              aria-hidden="true"
            />
            <span className="ml-auto shrink-0 text-right">
              <span
                className="block text-xs text-white"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {layer.nodes}
              </span>
              <span className="block text-[11px] text-text-dim">{layer.role}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
