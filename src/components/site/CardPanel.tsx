import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface CardPanelProps {
  /** Optional heading rendered above the body in the shared card-title style. */
  title?: string;
  children: ReactNode;
  /** Vertical gap between the title and the body. @default "md" */
  gap?: "xs" | "sm" | "md";
  className?: string;
}

const GAP = { xs: "gap-2", sm: "gap-3", md: "gap-4" } as const;

/**
 * The glass card shell shared by the `site/` card components.
 *
 * Exists because six components had hand-rolled `glass-card flex flex-col
 * gap-*` scaffolding and five repeated the same card-title `<h3>` verbatim —
 * so the title typography could drift in five places independently. The depth
 * treatment itself still lives in `.glass-card` (`src/index.css`), which is
 * kept in sync with the shadcn `Card variant="glass"`; this only owns the
 * layout and the heading.
 */
export function CardPanel({ title, children, gap = "md", className }: CardPanelProps) {
  return (
    <div className={cn("glass-card flex flex-col", GAP[gap], className)}>
      {title && <h3 className="font-display text-base font-semibold text-white">{title}</h3>}
      {children}
    </div>
  );
}
