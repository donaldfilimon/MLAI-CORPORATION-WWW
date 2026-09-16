import React from "react";
import { View, ViewStyle, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { color, radius, accentColor, type Accent } from "@/lib/theme";

/* A raised card: subtle top-down sheen, hairline border, and an optional
   accent top-edge that fades out — the mobile analogue of the web .surface. */
export function Surface({
  children,
  accent,
  style,
  padded = true,
}: {
  children: React.ReactNode;
  accent?: Accent;
  style?: ViewStyle;
  padded?: boolean;
}) {
  return (
    <View style={[styles.surface, padded && styles.padded, style]}>
      <LinearGradient
        colors={["rgba(255,255,255,0.04)", "rgba(255,255,255,0)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.5 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      {accent ? (
        <LinearGradient
          colors={[accentColor[accent], "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.7, y: 0 }}
          style={styles.edge}
          pointerEvents="none"
        />
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  surface: {
    backgroundColor: color.panel,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: color.line,
    overflow: "hidden",
  },
  padded: { padding: 18 },
  edge: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    opacity: 0.9,
  },
});
