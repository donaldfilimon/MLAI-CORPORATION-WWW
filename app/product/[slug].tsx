import React from "react";
import { View, StyleSheet, Linking, Pressable } from "react-native";
import { useLocalSearchParams, useRouter, Stack, Redirect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView } from "react-native";
import { Txt, Eyebrow } from "@/components/ui/Text";
import { Surface } from "@/components/ui/Surface";
import { StatBlock, ProvLegend } from "@/components/ui/StatBlock";
import { FeatureCard } from "@/components/ui/Layout";
import { Reveal, PressableScale } from "@/components/ui/Motion";
import { color, space, accentColor, type Accent } from "@/lib/theme";
import { products, links } from "@/lib/brand";

export default function ProductDetail() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();

  // A deep link to an unknown slug (e.g. /product/foo) must not masquerade as a
  // real product — send it to the branded 404 instead of silently showing WDBX.
  if (!slug || !(slug in products)) {
    return <Redirect href="/+not-found" />;
  }

  const key = slug as Accent;
  const product = products[key];
  const accent = product.accent;

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* header */}
        <View style={styles.header}>
          <LinearGradient
            colors={[accentColor[accent] + "26", "transparent"]}
            style={styles.headerGlow}
            pointerEvents="none"
          />
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            style={styles.back}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Txt variant="mono" color={color.textDim}>← back</Txt>
          </Pressable>

          <Reveal>
            <View style={styles.eyebrowRow}>
              <View style={[styles.tick, { backgroundColor: accentColor[accent] }]} />
              <Eyebrow color={accentColor[accent]}>{product.kicker}</Eyebrow>
            </View>
            <Txt variant="hero" color={color.white}>{product.name}</Txt>
            <Txt variant="body" color={color.textDim} style={{ marginTop: space.md, maxWidth: 360 }}>
              {product.blurb}
            </Txt>
          </Reveal>
        </View>

        {/* stats */}
        <Reveal delay={80} style={styles.section}>
          <View style={styles.statGrid}>
            {product.stats.map((s) => (
              <View key={s.label} style={styles.statCell}>
                <StatBlock stat={s} accent={accent} />
              </View>
            ))}
          </View>
          <View style={{ marginTop: space.lg }}>
            <ProvLegend />
          </View>
        </Reveal>

        {/* how it works */}
        <Reveal delay={60} style={styles.section}>
          <View style={styles.eyebrowRow}>
            <View style={[styles.tick, { backgroundColor: accentColor[accent] }]} />
            <Eyebrow color={accentColor[accent]}>How it works</Eyebrow>
          </View>
          {product.intro.map((para, i) => (
            <Txt key={i} variant="body" color={color.textDim} style={{ marginTop: i ? space.md : space.sm }}>
              {para}
            </Txt>
          ))}
        </Reveal>

        {/* features */}
        <Reveal delay={60} style={styles.section}>
          <View style={styles.eyebrowRow}>
            <View style={[styles.tick, { backgroundColor: accentColor[accent] }]} />
            <Eyebrow color={accentColor[accent]}>What's inside</Eyebrow>
          </View>
          <View style={{ gap: space.md, marginTop: space.sm }}>
            {product.features.map((f) => (
              <FeatureCard key={f.title} title={f.title} desc={f.desc} accent={accent} />
            ))}
          </View>
        </Reveal>

        {/* cta */}
        <Reveal delay={40} style={styles.section}>
          <Surface accent={accent} style={{ alignItems: "flex-start" }}>
            <Txt variant="h3" color={color.white}>Open source, Apache-2.0</Txt>
            <Txt variant="small" color={color.textDim} style={{ marginTop: 6 }}>
              Start with the core; reach out for Pro or enterprise terms.
            </Txt>
            <PressableScale
              onPress={() => Linking.openURL(links.github).catch(() => {})}
              style={[styles.btn, { backgroundColor: accentColor[accent] }]}
            >
              <Txt variant="mono" color={color.ink}>VIEW ON GITHUB →</Txt>
            </PressableScale>
          </Surface>
        </Reveal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.ink },
  scroll: { paddingHorizontal: space.xl, paddingBottom: 80 },
  header: { position: "relative", paddingTop: space.md },
  headerGlow: { position: "absolute", top: -60, left: -80, width: 320, height: 320, borderRadius: 220 },
  back: { paddingVertical: space.md, alignSelf: "flex-start" },
  section: { marginTop: space.xxxl },
  eyebrowRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: space.sm },
  tick: { width: 18, height: 1.5, borderRadius: 1 },
  statGrid: { flexDirection: "row", flexWrap: "wrap", gap: space.md },
  statCell: { width: "47%", flexGrow: 1 },
  btn: { marginTop: space.lg, borderRadius: 10, paddingHorizontal: 18, paddingVertical: 11 },
});
