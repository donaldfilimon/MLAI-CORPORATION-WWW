import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { accentClasses, type Accent } from "./accent";

export interface EyebrowProps {
  children: ReactNode;
  /** Product accent. @default "wdbx" */
  accent?: Accent;
  className?: string;
}

/**
 * The mono, wide-tracked kicker that sits above a section title.
 *
 * Builds on the `.eyebrow` utility in `src/index.css` (which is cyan by
 * default) and overrides only the color when a non-wdbx product accent is
 * requested.
 */
export function Eyebrow({ children, accent = "wdbx", className }: EyebrowProps) {
  const a = accentClasses(accent);
  return (
    <p className={cn("eyebrow", accent !== "wdbx" && a.text, className)}>
      {children}
    </p>
  );
}
