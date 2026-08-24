import React from "react";
import { Text, TextProps, StyleSheet, View } from "react-native";
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import { color, type as t, font , gradient } from "@/lib/theme";

type Variant = keyof typeof t;

export function Txt({
  variant = "body",
  color: c = color.text,
  style,
  children,
  ...rest
}: TextProps & { variant?: Variant; color?: string }) {
  return (
    <Text style={[t[variant], { color: c }, style]} {...rest}>
      {children}
    </Text>
  );
}

export function Eyebrow({ children, color: c = color.wdbx }: { children: React.ReactNode; color?: string }) {
  return (
    <Text style={[t.eyebrow, { color: c, textTransform: "uppercase" }]}>{children}</Text>
  );
}

/** Gradient-filled text via MaskedView — used sparingly for hero accents. */
export function GradientText({
  children,
  variant = "hero",
  colors = gradient,
}: {
  children: React.ReactNode;
  variant?: Variant;
  colors?: [string, string, ...string[]];
}) {
  return (
    <MaskedView
      maskElement={
        <Text style={[t[variant], { color: color.white, backgroundColor: "transparent" }]}>{children}</Text>
      }
    >
      <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
        <Text style={[t[variant], { opacity: 0 }]}>{children}</Text>
      </LinearGradient>
    </MaskedView>
  );
}

export const styles = StyleSheet.create({
  monoRow: { fontFamily: font.mono },
});

export { View };
