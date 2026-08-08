import { cn } from "@/lib/utils";
import { accentClasses, type Accent } from "./accent";

export interface Step {
  title: string;
  body: string;
}

export interface StepListProps {
  /** Ordered steps; auto-numbered 01, 02, … */
  steps: readonly Step[];
  /** Product accent. @default "wdbx" */
  accent?: Accent;
  className?: string;
}

/**
 * An ordered walkthrough — numbered rail on the left, step body on the right.
 *
 * Renders a real `<ol>`, so the ordering is conveyed structurally; the printed
 * numerals are decorative and hidden from assistive tech to avoid the
 * "01 one, 02 two" double-announcement.
 */
export function StepList({ steps, accent = "wdbx", className }: StepListProps) {
  const a = accentClasses(accent);
  return (
    // `role="list"` is load-bearing: Tailwind Preflight sets `list-style: none`,
    // and WebKit strips list semantics from a list styled that way. Without it
    // the ordering is announced nowhere — the printed numerals are aria-hidden
    // precisely because the <ol> was supposed to carry it.
    <ol role="list" className={cn("space-y-8", className)}>
      {steps.map((step, i) => (
        <li key={step.title} className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-5">
          <div className="flex flex-col items-center gap-2" aria-hidden="true">
            <span
              className={cn(
                "font-mono flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold",
                a.border,
                a.bg,
                a.text,
              )}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            {i < steps.length - 1 && <span className="w-px flex-1 bg-white/8" />}
          </div>
          <div className="pb-2">
            <h3 className="font-display text-base font-semibold text-white">
              {/* Belt-and-braces: the ordinal survives even where list-role
                  behavior doesn't. */}
              <span className="sr-only">Step {i + 1}: </span>
              {step.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-text-dim text-pretty">{step.body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
