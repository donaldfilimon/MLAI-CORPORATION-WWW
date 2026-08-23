import { cn } from "@/lib/utils";
import { accentClasses, type Accent } from "./accent";

export interface AccentGlowProps {
  /** Product accent that tints the ambient glow. */
  accent: Accent;
  className?: string;
}

/**
 * A soft ambient wash for the top of a hero or panel.
 *
 * Purely decorative: `aria-hidden`, `pointer-events-none`, and absolutely
 * positioned, so it needs a `relative` parent with `overflow-hidden`. The
 * radial gradient is inlined because the accent color varies at runtime —
 * this is the one place in these components where a token can't do the job.
 */
export function AccentGlow({ accent, className }: AccentGlowProps) {
  const { glowRgb } = accentClasses(accent);
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0", className)}
      style={{
        background: `radial-gradient(60% 55% at 50% 0%, rgb(${glowRgb} / 0.16) 0%, rgb(${glowRgb} / 0.05) 45%, transparent 75%)`,
      }}
    />
  );
}
