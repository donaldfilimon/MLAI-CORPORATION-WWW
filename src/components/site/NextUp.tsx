import type { ElementType } from "react";
import { cn } from "@/lib/utils";
import { accentClasses, type Accent } from "./accent";

export interface NextUpItem {
  label: string;
  href: string;
  desc: string;
  accent: Accent;
}

export interface NextUpProps {
  /** Continue-reading links rendered as a 2-up grid. */
  items: readonly NextUpItem[];
  /**
   * Component to render each link with. Defaults to a plain `<a>` so this
   * component carries no router dependency — that portability is what lets it
   * ship in the design-system bundle, which has no Next runtime. Pass
   * `next/link` (or any component taking `href`) for client-side navigation.
   */
  linkComponent?: ElementType;
  className?: string;
}

/** End-of-page "keep reading" links. */
export function NextUp({ items, linkComponent, className }: NextUpProps) {
  const L: ElementType = linkComponent ?? "a";
  return (
    <nav className={cn("grid gap-4 sm:grid-cols-2", className)} aria-label="Continue reading">
      {items.map((item) => {
        const a = accentClasses(item.accent);
        return (
          <L
            key={item.href}
            href={item.href}
            className={cn(
              "group/next glass-card flex flex-col gap-2 no-underline transition-colors",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400",
            )}
          >
            <span
              className={cn("font-mono text-[11px] font-bold uppercase tracking-[0.18em]", a.text)}
            >
              {item.label}
            </span>
            <span className="text-sm leading-relaxed text-text-dim text-pretty">{item.desc}</span>
            <span
              className={cn("mt-1 text-sm transition-transform group-hover/next:translate-x-1", a.text)}
              aria-hidden="true"
            >
              →
            </span>
          </L>
        );
      })}
    </nav>
  );
}
