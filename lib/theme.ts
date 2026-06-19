/* MLAI mobile — design tokens. Mirrors the web identity: near-black surfaces,
   three product accents, Sora / Manrope / JetBrains Mono. */

import { Platform } from "react-native";

export const color = {
  ink: "#05070B",
  panel: "#0A0E16",
  panelRaised: "#0D121C",
  line: "rgba(255,255,255,0.08)",
  lineStrong: "rgba(255,255,255,0.16)",

  wdbx: "#00D4FF",
  abi: "#7C3AED",
  abbey: "#10B981",
  warn: "#F59E0B",

  white: "#FFFFFF",
  text: "#CBD5E1", // slate-300
  textDim: "#94A3B8", // slate-400
  textMute: "#64748B", // slate-500
  textFaint: "#475569", // slate-600
} as const;

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
  display: "Sora_700Bold",
  displaySemi: "Sora_600SemiBold",
  body: "Manrope_400Regular",
  bodyMed: "Manrope_500Medium",
  bodySemi: "Manrope_600SemiBold",
  mono: "JetBrainsMono_500Medium",
} as const;

export const type = {
  hero: { fontFamily: font.display, fontSize: 40, lineHeight: 44, letterSpacing: -1 },
  h1: { fontFamily: font.display, fontSize: 30, lineHeight: 34, letterSpacing: -0.6 },
  h2: { fontFamily: font.displaySemi, fontSize: 22, lineHeight: 27, letterSpacing: -0.3 },
  h3: { fontFamily: font.displaySemi, fontSize: 18, lineHeight: 23 },
  body: { fontFamily: font.body, fontSize: 15, lineHeight: 24 },
  bodyMed: { fontFamily: font.bodyMed, fontSize: 15, lineHeight: 24 },
  small: { fontFamily: font.body, fontSize: 13, lineHeight: 20 },
  mono: { fontFamily: font.mono, fontSize: 12, lineHeight: 18, letterSpacing: 0.5 },
  eyebrow: { fontFamily: font.mono, fontSize: 11, lineHeight: 14, letterSpacing: 2 },
} as const;
