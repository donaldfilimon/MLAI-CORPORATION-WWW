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
  ink: "#05070D",
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
 * shadcn semantic tokens for the web. OKLCH where a value is a tuned
 * lightness step; `var(--cyan)` where the value *is* the brand colour, so the
 * rendered primary equals the token the Expo apps use (the previous
 * `oklch(0.79 0.13 207)` rendered ≈#25D1E5 against a documented #22D3EE).
 */
export const semantic = {
  background: "oklch(0.07 0.012 260)",
  foreground: "oklch(0.94 0.008 255)",
  card: "oklch(0.13 0.014 260 / 0.80)",
  "card-foreground": "oklch(0.96 0.006 255)",
  popover: "oklch(0.11 0.014 260)",
  "popover-foreground": "oklch(0.96 0.006 255)",
  primary: "var(--cyan)",
  "primary-foreground": "oklch(0.10 0.015 260)",
  secondary: "oklch(0.18 0.014 260)",
  "secondary-foreground": "oklch(0.95 0.006 255)",
  muted: "oklch(0.18 0.014 260 / 0.80)",
  "muted-foreground": "oklch(0.70 0.025 255)",
  accent: "oklch(0.30 0.045 215)",
  "accent-foreground": "oklch(0.95 0.02 210)",
  destructive: "oklch(0.68 0.21 25)",
  "destructive-foreground": "oklch(0.15 0.02 25)",
  border: "oklch(1 0 0 / 10%)",
  input: "oklch(1 0 0 / 12%)",
  ring: "var(--cyan)",
  "chart-1": "var(--cyan)",
  "chart-2": "oklch(0.62 0.22 305)",
  "chart-3": "oklch(0.78 0.14 165)",
  "chart-4": "oklch(0.83 0.16 85)",
  "chart-5": "oklch(0.72 0.13 235)",
  sidebar: "oklch(0.11 0.014 260)",
  "sidebar-foreground": "oklch(0.96 0.006 255)",
  "sidebar-primary": "var(--cyan)",
  "sidebar-primary-foreground": "oklch(0.10 0.015 260)",
  "sidebar-accent": "oklch(0.18 0.014 260)",
  "sidebar-accent-foreground": "oklch(0.95 0.006 255)",
  "sidebar-border": "oklch(1 0 0 / 10%)",
  "sidebar-ring": "var(--cyan)",
} as const;

/** Legacy web utility colours (`bg-bg`, `text-text-dim`, `hover:bg-primary-hover`). */
export const legacyWeb = {
  bg: labColor.ink,
  surface: "#0A0E16",
  "primary-hover": "#06B6D4",
  text: "#E8EDF6",
  "text-dim": "#94A3B8",
} as const;

/** Web radius: the shadcn base and the multiplier scale Tailwind reads. */
export const radius = {
  base: "0.7rem",
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
