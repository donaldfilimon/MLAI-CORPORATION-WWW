import { cn } from "@/lib/utils";
import { accentClasses, type Accent } from "./accent";

export interface FAQItem {
  q: string;
  a: string;
}

export interface FAQListProps {
  /** Question/answer pairs rendered as zero-JS `<details>` elements. */
  items: readonly FAQItem[];
  /** Product accent. @default "wdbx" */
  accent?: Accent;
  /**
   * Zero-based index of an item to render already expanded.
   *
   * Sets the native `open` attribute, so the answer is in the server HTML and
   * stays open without JavaScript — the point of building this on `<details>`.
   */
  defaultOpenIndex?: number;
  className?: string;
}

/**
 * A disclosure list built on native `<details>`/`<summary>` — no JavaScript,
 * keyboard-accessible for free, and it still works if hydration never runs.
 *
 * This is the generic primitive. The site's own answers live in
 * `src/data/categories/faq.ts` and are rendered by `src/components/FAQ.tsx`,
 * which supplies them to this component.
 */
export function FAQList({
  items,
  accent = "wdbx",
  defaultOpenIndex,
  className,
}: FAQListProps) {
  const a = accentClasses(accent);
  return (
    <div className={cn("divide-y divide-white/6 overflow-hidden rounded-xl border border-white/8", className)}>
      {items.map((item, i) => (
        <details key={item.q} className="group/faq" open={i === defaultOpenIndex}>
          <summary
            className={cn(
              "flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-sm font-medium text-white transition-colors hover:bg-white/2",
              "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-cyan-400",
            )}
          >
            {item.q}
            <span
              className={cn("shrink-0 text-lg leading-none transition-transform group-open/faq:rotate-45", a.text)}
              aria-hidden="true"
            >
              +
            </span>
          </summary>
          <p className="px-5 pb-4 text-sm leading-relaxed text-text-dim text-pretty">{item.a}</p>
        </details>
      ))}
    </div>
  );
}
