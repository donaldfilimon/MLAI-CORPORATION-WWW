/**
 * The **product** accent axis shared by the `site/` section components.
 *
 * Harvested from the `mlai-site` design system, re-tokenized onto this repo's
 * canonical "Lab" ramps (see `src/index.css`). Three products, three ramps:
 *
 *   wdbx  → cyan    (the brand primary — retrieval/storage surfaces)
 *   abi   → violet  (the runtime/GPU layer)
 *   abbey → emerald (the agent/persona layer)
 *
 * **Do not confuse this with the persona color axis.** Personas are a separate,
 * fixed mapping used by `PersonaLegend.tsx` and `public/neural.js` — Abbey is
 * emerald, Aviva is violet, Abi is *cyan*. The product named "abi" is violet
 * here; the persona named "Abi" is cyan there. They are different axes that
 * happen to share a name, so always pick the one matching what you're labeling.
 */
export type Accent = "wdbx" | "abi" | "abbey";

export const ACCENTS: readonly Accent[] = ["wdbx", "abi", "abbey"] as const;

interface AccentClasses {
  /** Foreground text at label/kicker weight. */
  text: string;
  /** Hairline border, for rules and left-edge quote bars. */
  border: string;
  /** Low-alpha fill for chips and callout grounds. */
  bg: string;
  /** Ring used on hover/emphasis states. */
  ring: string;
  /** Solid fill for small markers (dots, step numerals). */
  dot: string;
  /** Radial-glow color as an `rgb()` triple, for AccentGlow. */
  glowRgb: string;
}

/**
 * Static class strings — never build these by interpolation. Tailwind scans
 * source text for complete class names, so `text-${accent}-300` silently
 * produces no CSS.
 */
const MAP: Record<Accent, AccentClasses> = {
  wdbx: {
    text: "text-cyan-300",
    border: "border-cyan-400/25",
    bg: "bg-cyan-400/5",
    ring: "ring-cyan-400/20",
    dot: "bg-cyan-400",
    glowRgb: "34 211 238",
  },
  abi: {
    text: "text-violet-300",
    border: "border-violet-400/25",
    bg: "bg-violet-400/5",
    ring: "ring-violet-400/20",
    dot: "bg-violet-400",
    glowRgb: "167 139 250",
  },
  abbey: {
    text: "text-emerald-300",
    border: "border-emerald-400/25",
    bg: "bg-emerald-400/5",
    ring: "ring-emerald-400/20",
    dot: "bg-emerald-400",
    glowRgb: "52 211 153",
  },
};

export function accentClasses(accent: Accent = "wdbx"): AccentClasses {
  return MAP[accent] ?? MAP.wdbx;
}
