import { cn } from "@/lib/utils";
import { accentClasses, type Accent } from "./accent";

export interface DeepDiveItem {
  title: string;
  body: string;
  /** Optional mono footnote — config facts, not measurements. */
  meta?: string;
}

export interface DeepDiveProps {
  items: readonly DeepDiveItem[];
  /** Product accent. @default "wdbx" */
  accent?: Accent;
  /** Grid columns at `md` and up. @default 2 */
  cols?: 2 | 3;
  className?: string;
}

/** A grid of longer-form explanation cards, each with an optional mono footnote. */
export function DeepDive({ items, accent = "wdbx", cols = 2, className }: DeepDiveProps) {
  const a = accentClasses(accent);
  return (
    <div
      className={cn(
        "grid gap-5",
        cols === 3 ? "md:grid-cols-2 lg:grid-cols-3" : "md:grid-cols-2",
        className,
      )}
    >
      {items.map((item) => (
        <article key={item.title} className="glass-card flex flex-col gap-3">
          <h3 className="font-display text-base font-semibold text-white">{item.title}</h3>
          <p className="flex-1 text-sm leading-relaxed text-text-dim text-pretty">{item.body}</p>
          {item.meta && (
            <p
              className={cn("border-t border-white/6 pt-3 text-[11px]", a.text)}
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {item.meta}
            </p>
          )}
        </article>
      ))}
    </div>
  );
}
