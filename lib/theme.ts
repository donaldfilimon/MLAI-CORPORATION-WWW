/* MLAI mobile — design tokens. The "Lab" identity, shared with www: near-black
   surfaces, three product accents, Spectral / Geist / JetBrains Mono.

   Every value below is traceable to `www/src/index.css` `:root`. Raw hex tokens
   (--ink, --cyan, --violet, --emerald, --amber) are copied verbatim. The three
   that exist only as oklch (--foreground, --muted-foreground, --secondary) were
   converted to sRGB with gamut clipping; the converter was validated against
   known values first (oklch(0.79 0.13 207) -> #25D1E5 vs the documented
   #22D3EE). Two values are extrapolated because mobile needs a surface Lab does
   not define — both are marked below. */

import { Platform } from "react-native";

export const color = {
  ink: "#05070D", // Lab --ink, verbatim
  panel: "#0E1218", // Lab --secondary, oklch(0.18 0.014 260)
  panelRaised: "#171B21", // extrapolated: one Lab step (+0.04 L) above --secondary
  line: "rgba(255,255,255,0.10)", // Lab --border
  lineStrong: "rgba(255,255,255,0.16)", // no Lab equivalent; mobile-only emphasis

  /* Accents are Lab's raw hex. Keep these 6-digit — `tint()` and four call
     sites concatenate a 2-char alpha suffix directly onto them. */
  wdbx: "#22D3EE", // Lab --cyan
  abi: "#A855F7", // Lab --violet
  abbey: "#34D399", // Lab --emerald
  warn: "#FBBF24", // Lab --amber

  white: "#FFFFFF",
  text: "#E8EBF1", // Lab --foreground, oklch(0.94 0.008 255)
  textDim: "#94A0AE", // Lab --muted-foreground, oklch(0.70 0.025 255)
  textMute: "#717B89", // ramp continuation, oklch(0.58 0.025 255)
  textFaint: "#505964", // ramp continuation, oklch(0.46 0.022 255)
} as const;

/** Lab's signature gradient (--grad: cyan -> blue -> violet). */
export const gradient: [string, string, string] = ["#22D3EE", "#60A5FA", "#A855F7"];

export type Accent = "wdbx" | "abi" | "abbey";

export const accentColor: Record<Accent, string> = {
  wdbx: color.wdbx,
  abi: color.abi,
  abbey: color.abbey,
};

/** 0x33 ~ 20% alpha tint of an accent, for soft fills. */
export function tint(hex: string, alpha = 0.12): string {
  const a = Math.round(alpha * 255).toString(16).padStart(2, "0");
  return `${hex}${a}`;
}

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  pill: 999,
} as const;

/** Height of the absolute, blurred tab bar. Single source of truth shared by
   the tab bar itself and every scroll container that must clear it. */
export const tabBarHeight = Platform.OS === "ios" ? 84 : 64;

/** Bottom padding a tabbed scroll view needs so its last row clears the bar. */
export const tabScrollPadding = tabBarHeight + space.lg;

export const font = {
  display: "Spectral_700Bold", // Lab --font-display (serif headings, h1-h3)
  displaySemi: "Spectral_600SemiBold",
  body: "Geist_400Regular", // Lab body sans
  bodyMed: "Geist_500Medium",
  bodySemi: "Geist_600SemiBold",
  mono: "JetBrainsMono_500Medium", // unchanged; Lab uses the same face
} as const;

/* Heading tracking mirrors Lab's -0.015em on h1-h3; line-heights stay
   mobile-tuned (Lab's 1.08 is desktop copy).

   `hero` dropped 40 -> 34 when the display face became Spectral: the serif sets
   wider than Sora, and at 40 the Home hero's first line ("AI infrastructure
   that") wrapped, orphaning "that". Lab handles the same problem the same way —
   its page hero is `text-h3 sm:text-h2 md:text-h1`, stepping down to
   --text-h3 (1.953rem ~ 31px) at narrow widths. */
export const type = {
  hero: { fontFamily: font.display, fontSize: 34, lineHeight: 40, letterSpacing: -0.51 },
  h1: { fontFamily: font.display, fontSize: 30, lineHeight: 34, letterSpacing: -0.45 },
  h2: { fontFamily: font.displaySemi, fontSize: 22, lineHeight: 27, letterSpacing: -0.33 },
  h3: { fontFamily: font.displaySemi, fontSize: 18, lineHeight: 23, letterSpacing: -0.27 },
  body: { fontFamily: font.body, fontSize: 15, lineHeight: 24 },
  bodyMed: { fontFamily: font.bodyMed, fontSize: 15, lineHeight: 24 },
  small: { fontFamily: font.body, fontSize: 13, lineHeight: 20 },
  mono: { fontFamily: font.mono, fontSize: 12, lineHeight: 18, letterSpacing: 0.5 },
  eyebrow: { fontFamily: font.mono, fontSize: 11, lineHeight: 14, letterSpacing: 2 },
} as const;
