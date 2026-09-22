import { cn } from "@/lib/utils";
import { CardPanel } from "./CardPanel";
import { accentClasses, type Accent } from "./accent";

export interface FeatureCardProps {
  title: string;
  desc: string;
  /** Product accent. @default "wdbx" */
  accent?: Accent;
  className?: string;
  /**
   * Heading element. Use `"h2"` when the card band sits directly under the
   * page `<h1>` with no section heading between, so levels rise by one
   * (axe `heading-order`). @default "h3"
   */
  headingLevel?: "h2" | "h3";
}

/**
 * A single capability card — accent rule, title, description.
 *
 * Uses the shared `.glass-card` depth treatment so it sits at the same
 * elevation as every other card on the site (see the glass-depth note in
 * CLAUDE.md — `.glass-card` and `Card variant="glass"` are kept in sync).
 */
export function FeatureCard({ title, desc, accent = "wdbx", className, headingLevel = "h3" }: FeatureCardProps) {
  const a = accentClasses(accent);
  const Heading = headingLevel;
  return (
    <CardPanel gap="sm" className={className}>
      <span className={cn("h-px w-10 rounded-full", a.dot)} aria-hidden="true" />
      <Heading className="font-display text-lg font-semibold text-white">{title}</Heading>
      <p className="text-sm leading-relaxed text-text-dim text-pretty">{desc}</p>
    </CardPanel>
  );
}
