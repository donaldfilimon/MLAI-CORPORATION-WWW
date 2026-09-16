import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withDelay,
  Easing,
  FadeIn,
  FadeInDown,
} from "react-native-reanimated";
import { TextInput } from "react-native";
import { LogoMark } from "@/components/Logo";
import { Txt, GradientText } from "@/components/ui/Text";
import { color, space, type as t, font } from "@/lib/theme";

const AnimatedInput = Animated.createAnimatedComponent(TextInput);

/* A number that animates from 0 → target on mount, formatted as "x.xms". */
function CountUp({ to, suffix, decimals = 1 }: { to: number; suffix: string; decimals?: number }) {
  const v = useSharedValue(0);
  useEffect(() => {
    v.value = withDelay(350, withTiming(to, { duration: 1100, easing: Easing.out(Easing.cubic) }));
  }, [to, v]);

  const props = useAnimatedProps(() => {
    return { text: `${v.value.toFixed(decimals)}${suffix}`, defaultValue: `0${suffix}` } as any;
  });

  return (
    <AnimatedInput
      editable={false}
      underlineColorAndroid="transparent"
      style={[t.h1, styles.metric]}
      animatedProps={props}
    />
  );
}

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

      {/* live metric strip */}
      <Animated.View entering={FadeInDown.delay(400).duration(500)} style={styles.metricRow}>
        <View>
          <CountUp to={2.3} suffix="ms" />
          <Txt variant="mono" color={color.textMute}>p50 search · measured</Txt>
        </View>
        <View style={styles.metricDivider} />
        <View>
          <CountUp to={98.2} suffix="%" />
          <Txt variant="mono" color={color.textMute}>recall@10 · measured</Txt>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingTop: space.xl, position: "relative" },
  glow: { position: "absolute", width: 280, height: 280, borderRadius: 200, opacity: 0.6 },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: space.xxl },
  metricRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.xl,
    marginTop: space.xxl,
  },
  metricDivider: { width: 1, height: 40, backgroundColor: color.line },
  metric: { color: color.wdbx, padding: 0, margin: 0, fontFamily: font.display },
});
