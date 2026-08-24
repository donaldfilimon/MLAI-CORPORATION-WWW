import React from "react";
import { View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeIn,
  FadeInDown,
} from "react-native-reanimated";
import { LogoMark } from "@/components/Logo";
import { Txt, GradientText } from "@/components/ui/Text";
import { color, space, type as t } from "@/lib/theme";

export function Hero() {
  return (
    <View style={styles.wrap}>
      {/* ambient glows */}
      <LinearGradient
        colors={[color.wdbx + "26", "transparent"]}
        style={[styles.glow, { top: -80, left: -60 }]}
        pointerEvents="none"
      />
      <LinearGradient
        colors={[color.abi + "22", "transparent"]}
        style={[styles.glow, { top: 40, right: -80 }]}
        pointerEvents="none"
      />

      <Animated.View entering={FadeIn.duration(500)} style={styles.brandRow}>
        <LogoMark size={30} />
        <Txt style={[t.h3, { letterSpacing: 6, color: color.white }]}>MLAI</Txt>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(120).duration(500).springify().damping(18)}>
        <Txt variant="hero" color={color.white}>AI infrastructure that</Txt>
        <GradientText variant="hero">never phones home.</GradientText>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(260).duration(500)}>
        <Txt variant="body" color={color.textDim} style={{ marginTop: space.lg, maxWidth: 360 }}>
          Privacy-first AI for Apple Silicon — the inference, the index, and the data on the same chip you already own.
        </Txt>
      </Animated.View>

      {/* Source-backed architecture strip. Performance figures remain absent
          until a reproducible harness and methodology exist. */}
      <Animated.View entering={FadeInDown.delay(400).duration(500)} style={styles.evidenceRow}>
        <View>
          <Txt variant="h3" color={color.wdbx}>HNSW + MVCC</Txt>
          <Txt variant="mono" color={color.textMute}>inspectable retrieval</Txt>
        </View>
        <View style={styles.evidenceDivider} />
        <View>
          <Txt variant="h3" color={color.abi}>CPU oracle</Txt>
          <Txt variant="mono" color={color.textMute}>verified accelerator parity</Txt>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingTop: space.xl, position: "relative" },
  glow: { position: "absolute", width: 280, height: 280, borderRadius: 200, opacity: 0.6 },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: space.xxl },
  evidenceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.xl,
    marginTop: space.xxl,
  },
  evidenceDivider: { width: 1, height: 40, backgroundColor: color.line },
});
