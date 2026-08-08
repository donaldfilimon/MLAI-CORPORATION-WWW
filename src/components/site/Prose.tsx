import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface ProseProps {
  children: ReactNode;
  className?: string;
  /** Constrain to the ~68ch editorial measure. @default true */
  measured?: boolean;
}

/**
 * Long-form reading shell — typographic rules for raw HTML children.
 *
 * Composes the repo's `.container-prose` measure rather than inventing a
 * second one. Note this is for *ad-hoc* prose; structured article bodies
 * (blog posts, research papers) go through `ArticleSections` in
 * `src/components/article.tsx`, which renders from the content layer.
 */
export function Prose({ children, className, measured = true }: ProseProps) {
  return (
    <div
      className={cn(
        "space-y-5 text-base leading-relaxed text-text-dim",
        "[&_p]:text-pretty",
        // `[&_a]:hover:` not `hover:[&_a]:` — the leftmost variant is outermost,
        // so the inverted order compiles to "container hovered → recolor every
        // link", highlighting all of them at once instead of the one under the
        // cursor.
        "[&_a]:text-cyan-300 [&_a]:underline [&_a]:underline-offset-2 [&_a]:hover:text-cyan-200",
        "[&_strong]:font-semibold [&_strong]:text-white",
        "[&_h2]:font-display [&_h2]:text-h4 [&_h2]:font-bold [&_h2]:text-white [&_h2]:mt-10",
        "[&_h3]:font-display [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-white [&_h3]:mt-8",
        "[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mt-1.5",
        "[&_code]:rounded [&_code]:bg-white/6 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[0.9em]",
        measured && "container-prose",
        className,
      )}
    >
      {children}
    </div>
  );
}
