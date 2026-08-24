import React from "react";
import { View, StyleSheet, ScrollView, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Txt, Eyebrow } from "./Text";
import { Surface } from "./Surface";
import { Reveal } from "./Motion";
import { color, space, accentColor, radius, tint, tabScrollPadding, type Accent } from "@/lib/theme";

/* Screen — safe-area + scroll container with the ink background. */
export function Screen({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <ScrollView
        contentContainerStyle={[styles.scroll, style]}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

/* Section — eyebrow + title + body, revealed on mount. */
export function Section({
  eyebrow,
  title,
  accent = "wdbx",
  children,
  delay = 0,
}: {
  eyebrow?: string;
  title?: string;
  accent?: Accent;
  children?: React.ReactNode;
  delay?: number;
}) {
  return (
    <Reveal delay={delay} style={styles.section}>
      {eyebrow ? (
        <View style={styles.eyebrowRow}>
          <View style={[styles.tick, { backgroundColor: accentColor[accent] }]} />
          <Eyebrow color={accentColor[accent]}>{eyebrow}</Eyebrow>
        </View>
      ) : null}
      {title ? (
        <Txt variant="h1" color={color.white} style={{ marginBottom: space.md }}>
          {title}
        </Txt>
      ) : null}
      {children}
    </Reveal>
  );
}

export function Pill({ label, accent = "wdbx" }: { label: string; accent?: Accent }) {
  return (
    <View style={[styles.pill, { backgroundColor: tint(accentColor[accent], 0.1), borderColor: tint(accentColor[accent], 0.3) }]}>
      <View style={[styles.dot, { backgroundColor: accentColor[accent] }]} />
      <Txt variant="mono" color={color.text}>{label}</Txt>
    </View>
  );
}

export function FeatureCard({
  title,
  desc,
  accent = "wdbx",
}: {
  title: string;
  desc: string;
  accent?: Accent;
}) {
  return (
    <Surface accent={accent}>
      <Txt variant="h3" color={color.white}>{title}</Txt>
      <Txt variant="small" color={color.textDim} style={{ marginTop: 6 }}>{desc}</Txt>
    </Surface>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.ink },
  scroll: { paddingHorizontal: space.xl, paddingBottom: tabScrollPadding },
  section: { marginTop: space.xxxl },
  eyebrowRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: space.sm },
  tick: { width: 18, height: 1.5, borderRadius: 1 },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: "flex-start",
  },
  dot: { width: 7, height: 7, borderRadius: 4 },
});
