import type { ProductAccent } from "@mlai/contracts";

/**
 * The one source of MLAI's "Lab" design data. Every surface derives from
 * these values: `apps/quasar-web/src/tokens.generated.css` and
 * `apps/website-app/packages/ui/src/{styles/tokens.css,tokens.ts}` are
 * rendered by `./generate.ts` (`bun run tokens:generate` at the root) and
 * drift-tested; the Expo apps import the objects directly.
 */

/** Raw Lab colors. The only place the five brand hex values are written. */
export const labColor = {
  /** Preset b6VP9Bgmwr dark olive canvas (oklch(0.153 0.006 107.1)). */
  ink: "#0C0C09",
  cyan: "#22D3EE",
  violet: "#A855F7",
  emerald: "#34D399",
  amber: "#FBBF24",
} as const;
export type LabColorName = keyof typeof labColor;

/** Product accents. AGENTS.md fixes these three: WDBX cyan, ABI violet, Abbey emerald. */
export const productColor: Record<ProductAccent, string> = {
  wdbx: labColor.cyan,
  abi: labColor.violet,
  abbey: labColor.emerald,
};

/**
 * Persona colours are a different axis from product accents: the Abi
 * *persona* is cyan while the ABI *product* is violet. Both maps are kept,
 * named distinctly, so neither silently overwrites the other.
 */
export const personaColor = {
  abbey: labColor.emerald,
  aviva: labColor.violet,
  abi: labColor.cyan,
} as const;
export type Persona = keyof typeof personaColor;

/** Signature gradient stops: cyan -> blue -> violet. */
export const gradient = [labColor.cyan, "#60A5FA", labColor.violet] as const;

/** Web font stacks (the site self-hosts Geist Variable; display and mono load async). */
export const font = {
  sans: '"Geist Variable", ui-sans-serif, system-ui, sans-serif',
  display: '"Spectral", Georgia, "Times New Roman", serif',
  mono: '"JetBrains Mono", ui-monospace, monospace',
} as const;

/** Modular type scale, Major Third (1.250), in rem. */
export const typeScale = {
  h5: "1.25rem",
  h4: "1.563rem",
  h3: "1.953rem",
  h2: "2.441rem",
  h1: "3.052rem",
  h0: "3.815rem",
  h00: "4.768rem",
} as const;

/**
 * shadcn semantic tokens for the web, from preset b6VP9Bgmwr (mira / olive /
 * cyan, dark values). The site is dark-only (`html.dark`), so `:root` carries
 * the preset's `.dark` olive neutrals. Primary, ring, and sidebar-primary stay
 * `var(--cyan)`: the preset's dark primary (oklch 0.45) fails WCAG as link text
 * on this canvas, and persona/product cyan is the light brand mark.
 * Secondary is the olive muted/accent pair, not the preset's zinc hue 286.
 * Chart 2–5 are the preset's orange ramp.
 */
export const semantic = {
  background: "oklch(0.153 0.006 107.1)",
  foreground: "oklch(0.988 0.003 106.5)",
  card: "oklch(0.228 0.013 107.4)",
  "card-foreground": "oklch(0.988 0.003 106.5)",
  popover: "oklch(0.228 0.013 107.4)",
  "popover-foreground": "oklch(0.988 0.003 106.5)",
  primary: "var(--cyan)",
  "primary-foreground": "oklch(0.10 0.015 260)",
  secondary: "oklch(0.286 0.016 107.4)",
  "secondary-foreground": "oklch(0.988 0.003 106.5)",
  muted: "oklch(0.286 0.016 107.4)",
  "muted-foreground": "oklch(0.737 0.021 106.9)",
  accent: "oklch(0.286 0.016 107.4)",
  "accent-foreground": "oklch(0.988 0.003 106.5)",
  destructive: "oklch(0.704 0.191 22.216)",
  "destructive-foreground": "oklch(0.15 0.02 25)",
  border: "oklch(1 0 0 / 10%)",
  input: "oklch(1 0 0 / 15%)",
  ring: "var(--cyan)",
  "chart-1": "var(--cyan)",
  "chart-2": "oklch(0.705 0.213 47.604)",
  "chart-3": "oklch(0.646 0.222 41.116)",
  "chart-4": "oklch(0.553 0.195 38.402)",
  "chart-5": "oklch(0.47 0.157 37.304)",
  sidebar: "oklch(0.228 0.013 107.4)",
  "sidebar-foreground": "oklch(0.988 0.003 106.5)",
  "sidebar-primary": "var(--cyan)",
  "sidebar-primary-foreground": "oklch(0.10 0.015 260)",
  "sidebar-accent": "oklch(0.286 0.016 107.4)",
  "sidebar-accent-foreground": "oklch(0.988 0.003 106.5)",
  "sidebar-border": "oklch(1 0 0 / 10%)",
  "sidebar-ring": "var(--cyan)",
} as const;

/** Legacy web utility colours (`bg-bg`, `text-text-dim`, `hover:bg-primary-hover`). */
export const legacyWeb = {
  bg: labColor.ink,
  surface: "#1D1D16",
  "primary-hover": "#06B6D4",
  text: "#FBFBF9",
  "text-dim": "#ABAB9C",
} as const;

/** Web radius: the shadcn base and the multiplier scale Tailwind reads. */
export const radius = {
  base: "0.625rem",
  scale: { sm: 0.6, md: 0.8, lg: 1, xl: 1.4, "2xl": 1.8, "3xl": 2.2, "4xl": 2.6 },
} as const;

/**
 * Semantic colours as sRGB for native surfaces. The OKLCH web values were
 * converted with gamut clipping (converter validated first: oklch(0.79 0.13
 * 207) -> #25D1E5). `panelRaised` and the text ramp below `textDim` extend the
 * Lab ramp by one step each because mobile needs surfaces Lab does not define.
 */
export const nativeColor = {
  panel: "#0E1218",
  panelRaised: "#171B21",
  line: "rgba(255,255,255,0.10)",
  lineStrong: "rgba(255,255,255,0.16)",
  text: "#E8EBF1",
  textDim: "#94A0AE",
  textMute: "#717B89",
  textFaint: "#505964",
  danger: "#FF5352",
} as const;

/**
 * apps/website-app's layout vocabulary: the px scales its layout sheet
 * consumes by name. Kept as a projection of the same palette until that app
 * is ported onto the shared component package.
 */
export const websiteApp = {
  color: {
    panel: "#0e1218",
    panelRaised: "#171b21",
    line: "rgba(255, 255, 255, 0.1)",
    text: "#e6edf6",
    muted: "#93a4ba",
    textBody: "#c0c6cf",
    textFaint: "#64748b",
    primaryForeground: "#041016",
    destructive: "#f87171",
  },
  font: {
    body: '"Geist Sans", "Geist", system-ui, sans-serif',
    heading: '"Spectral", Georgia, serif',
    mono: '"JetBrains Mono", ui-monospace, monospace',
  },
  radiusPx: { xs: "3px", sm: "5px", md: "8px", lg: "14px", xl: "16px", pill: "999px" },
  size: {
    "1": "11px",
    "2": "12px",
    "3": "14px",
    "4": "18px",
    "5": "22px",
    "6": "27px",
    "7": "clamp(28px, 3vw, 36px)",
    display: "clamp(40px, 4.8vw, 56px)",
    "display-lg": "clamp(40px, 4.6vw, 65px)",
  },
  trackingDisplay: "-0.02em",
  leadingDisplay: "1.08",
  space: {
    "1": "4px",
    "2": "8px",
    "3": "12px",
    "4": "16px",
    "5": "20px",
    "6": "24px",
    "7": "32px",
    "8": "40px",
    "9": "48px",
    "10": "56px",
    "11": "64px",
    "12": "80px",
  },
} as const;
