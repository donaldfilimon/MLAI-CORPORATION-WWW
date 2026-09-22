/* The "Lab" identity, shared with apps/quasar-web and apps/mobile. Raw hex and
   the sRGB conversions of the web's OKLCH semantics both come from
   @mlai/design-tokens, the one source every surface renders from. */
import { labColor, nativeColor } from "@mlai/design-tokens";

export const color = {
  ink: labColor.ink, // Lab --ink
  panel: nativeColor.panel, // Lab --secondary
  line: nativeColor.line, // Lab --border
  text: nativeColor.text, // Lab --foreground
  textDim: nativeColor.textDim, // Lab --muted-foreground
  accent: labColor.cyan, // Lab --cyan (was the standalone amber #F59E0B)
  danger: nativeColor.danger, // Lab --destructive
  ok: labColor.emerald, // Lab --emerald
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
