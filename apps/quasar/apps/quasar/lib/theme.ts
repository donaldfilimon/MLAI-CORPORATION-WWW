/* The "Lab" identity, shared with www and mlai-mobile. Values trace to
   `www/src/index.css` `:root`; the oklch-only tokens were converted to sRGB
   with gamut clipping (converter validated against known Lab values). */
export const color = {
  ink: "#05070D", // Lab --ink
  panel: "#0E1218", // Lab --secondary, oklch(0.18 0.014 260)
  line: "rgba(255,255,255,0.10)", // Lab --border
  text: "#E8EBF1", // Lab --foreground, oklch(0.94 0.008 255)
  textDim: "#94A0AE", // Lab --muted-foreground, oklch(0.70 0.025 255)
  accent: "#22D3EE", // Lab --cyan (was the standalone amber #F59E0B)
  danger: "#FF5352", // Lab --destructive, oklch(0.68 0.21 25)
  ok: "#34D399", // Lab --emerald — already matched
};

export const space = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
};

export const radius = {
  m: 12,
  l: 16,
};
