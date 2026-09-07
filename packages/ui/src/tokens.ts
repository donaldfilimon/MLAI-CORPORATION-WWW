/**
 * The token values in styles/tokens.css, exported for consumers that need them
 * in TypeScript. Keep this in sync with that file; it is the same design data
 * in a second form, not a second source of truth.
 */
export const color = {
  bg: "#05070d",
  panel: "#0e1218",
  panelRaised: "#171b21",
  line: "rgba(255, 255, 255, 0.1)",
  text: "#e6edf6",
  muted: "#93a4ba",
  cyan: "#22d3ee",
  purple: "#a855f7",
  green: "#34d399",
  warn: "#fbbf24",
} as const;
export const productAccent = {
  wdbx: color.cyan,
  abi: color.purple,
  abbey: color.green,
} as const;
export const font = {
  body: '"Geist Sans", "Geist", system-ui, sans-serif',
  heading: '"Spectral", Georgia, serif',
  mono: '"JetBrains Mono", ui-monospace, monospace',
} as const;
export type ProductAccent = keyof typeof productAccent;
