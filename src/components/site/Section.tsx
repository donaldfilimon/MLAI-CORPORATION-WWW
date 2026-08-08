import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Eyebrow } from "./Eyebrow";
import type { Accent } from "./accent";

export interface SectionProps {
  /** Small mono label above the title. */
  eyebrow?: string;
  title?: string;
  /** Supporting line under the title. */
  lead?: string;
  /** Product accent. @default "wdbx" */
  accent?: Accent;
  children: ReactNode;
  className?: string;
  /** Set when the heading needs to be referenced by `aria-labelledby`. */
  id?: string;
}

/**
 * A full page band: vertical rhythm, page gutter, and an optional
 * eyebrow/title/lead header above the content.
 *
 * Composes the repo's own `.section-y` / `.container-custom` /
 * `.section-title` / `.section-subtitle` utilities rather than redefining
 * spacing, so it stays in step with the rest of the site when those change.
 */
export function Section({
  eyebrow,
  title,
  lead,
  accent = "wdbx",
  children,
  className,
  id,
}: SectionProps) {
  const hasHeader = Boolean(eyebrow || title || lead);
  // `id` goes on the <section>, with a derived id for the heading. Previously it
  // landed only on the <h2>, so `<Section id="pricing">` with no `title`
  // rendered nothing carrying that id and every #pricing anchor silently
  // did nothing.
  const headingId = id ? `${id}-title` : undefined;
  return (
    <section
      id={id}
      className={cn("section-y", className)}
      aria-labelledby={title && headingId ? headingId : undefined}
    >
      <div className="container-custom">
        {hasHeader && (
          <header className="mb-12 space-y-4">
            {eyebrow && <Eyebrow accent={accent}>{eyebrow}</Eyebrow>}
            {title && (
              <h2 id={headingId} className="section-title mb-0">
                {title}
              </h2>
            )}
            {lead && <p className="section-subtitle mb-0">{lead}</p>}
          </header>
        )}
        {children}
      </div>
    </section>
  );
}

export interface SplitSectionProps {
  /** Small mono label above the title. */
  kicker?: string;
  title: string;
  /** Product accent. @default "wdbx" */
  accent?: Accent;
  children: ReactNode;
  className?: string;
}

/**
 * Two-column editorial band — sticky heading on the left, prose on the right.
 * Collapses to a single stacked column below `lg`.
 */
export function SplitSection({
  kicker,
  title,
  accent = "wdbx",
  children,
  className,
}: SplitSectionProps) {
  return (
    <section className={cn("section-y", className)}>
      <div className="container-custom grid gap-10 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          {kicker && <Eyebrow accent={accent}>{kicker}</Eyebrow>}
          <h2 className="section-title mt-4 mb-0 text-h4 sm:text-h3 md:text-h2">{title}</h2>
        </div>
        <div className="space-y-5 text-base leading-relaxed text-text-dim [&_p]:text-pretty">
          {children}
        </div>
      </div>
    </section>
  );
}
