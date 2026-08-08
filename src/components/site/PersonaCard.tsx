import { cn } from "@/lib/utils";

/**
 * Persona accent colors. **This is the persona axis, not the product accent
 * axis** in `accent.ts` — Abbey is emerald, Aviva is violet, Abi is cyan,
 * matching `PersonaLegend.tsx` and the galaxy in `public/neural.js`.
 */
export type PersonaKey = "abbey" | "aviva" | "abi";

const PERSONA_CLASSES: Record<PersonaKey, { dot: string; text: string }> = {
  abbey: { dot: "bg-emerald-400", text: "text-emerald-300" },
  aviva: { dot: "bg-violet-400", text: "text-violet-300" },
  abi: { dot: "bg-cyan-400", text: "text-cyan-300" },
};

export interface Persona {
  key: PersonaKey;
  name: string;
  /** One-line register, e.g. "empathetic, open-ended reasoning". */
  role: string;
}

export interface PersonaCardProps {
  /**
   * The personas to list. Supply from the content layer — this component
   * holds no copy of its own.
   */
  personas: readonly Persona[];
  title?: string;
  className?: string;
}

/** A compact roster of the routing personas, each with its fixed accent dot. */
export function PersonaCard({ personas, title = "Persona routing", className }: PersonaCardProps) {
  return (
    <div className={cn("glass-card flex flex-col gap-4", className)}>
      <h3 className="font-display text-base font-semibold text-white">{title}</h3>
      <ul role="list" className="space-y-3">
        {personas.map((p) => {
          const c = PERSONA_CLASSES[p.key];
          return (
            <li key={p.key} className="flex items-start gap-3">
              <span
                className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", c.dot)}
                aria-hidden="true"
              />
              <span className="min-w-0">
                <span className={cn("text-sm font-semibold", c.text)}>{p.name}</span>
                <span className="block text-xs leading-relaxed text-text-dim">{p.role}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
