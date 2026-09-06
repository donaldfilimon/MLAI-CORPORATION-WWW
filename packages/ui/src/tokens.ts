/**
 * The token values in styles/tokens.css, exported for consumers that need them
 * in TypeScript. Keep this in sync with that file; it is the same design data
 * in a second form, not a second source of truth.
 */
export const color = {
  bg: "#05070b",
  panel: "#0a0e16",
  line: "#252d37",
  text: "#f1f3f6",
  muted: "#98a1af",
  cyan: "#00d4ff",
  purple: "#a878f6",
  green: "#10b981",
} as const;
export const productAccent = {
  wdbx: color.cyan,
  abi: color.purple,
  abbey: color.green,
} as const;
export const font = {
  body: '"Manrope", sans-serif',
  heading: '"Sora", sans-serif',
  mono: '"JetBrains Mono", monospace',
} as const;
export type ProductAccent = keyof typeof productAccent;
