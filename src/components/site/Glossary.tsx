import { cn } from "@/lib/utils";

export interface GlossaryItem {
  term: string;
  def: string;
}

export interface GlossaryProps {
  /** Term/definition pairs rendered as a two-column `<dl>`. */
  items: readonly GlossaryItem[];
  className?: string;
}

/** A vocabulary list — term on the left, definition on the right. */
export function Glossary({ items, className }: GlossaryProps) {
  return (
    <dl className={cn("space-y-6", className)}>
      {items.map((item) => (
        <div
          key={item.term}
          className="grid gap-x-6 gap-y-1 sm:grid-cols-[minmax(0,10rem)_minmax(0,1fr)]"
        >
          <dt
            className="text-sm font-semibold text-cyan-300"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {item.term}
          </dt>
          <dd className="text-sm leading-relaxed text-text-dim text-pretty">{item.def}</dd>
        </div>
      ))}
    </dl>
  );
}
