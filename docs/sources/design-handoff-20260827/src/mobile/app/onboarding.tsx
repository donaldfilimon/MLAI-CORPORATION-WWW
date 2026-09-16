import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Txt, Eyebrow } from "@/components/ui/Text";
import { Surface } from "@/components/ui/Surface";
import { PressableScale } from "@/components/ui/Motion";
import { ProvLegend } from "@/components/ui/StatBlock";
import { color, space, accentColor, type Accent } from "@/lib/theme";
import { personaAccent, personaLabel, type Persona } from "@/lib/chat";

export const ONBOARDED_KEY = "mlai.onboarded";

type Card = {
  eyebrow: string;
  title: string;
  body: string;
  accent: Accent;
  cta: string;
  show?: "personas" | "provenance";
};

/* Three quiet cards: what the product is, who answers, and how figures are
   labeled. Deliberately not a feature tour — the claims contract is the third
   card because every screen after this one depends on the reader knowing it. */
const CARDS: Card[] = [
  {
    eyebrow: "Private by default",
    title: "Runs where the data lives.",
    body: "Inference, index, and data on the same chip you already own. Nothing phones home.",
    accent: "wdbx",
    cta: "CONTINUE →",
  },
  {
    eyebrow: "Three minds",
    title: "One system, three registers.",
    body: "Abi classifies intent and routes each turn to the right register — or blends them.",
    accent: "abbey",
    cta: "CONTINUE →",
    show: "personas",
  },
  {
    eyebrow: "Verifiable",
    title: "Every number carries its proof.",
    body: "Measured on MLAI hardware, a stated target, or a cited figure — never conflated.",
    accent: "abi",
    cta: "ENTER MLAI →",
    show: "provenance",
  },
];

const PERSONA_ROLES: Record<Persona, string> = {
  abbey: "Empathic polymath",
  aviva: "Unfiltered expert",
  abi: "Adaptive moderator",
};

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const router = useRouter();
  const card = CARDS[step];

  const advance = async () => {
    if (step < CARDS.length - 1) {
      setStep(step + 1);
      return;
    }
    // Best-effort: a keychain failure must not trap the user on onboarding.
    try {
      await SecureStore.setItemAsync(ONBOARDED_KEY, "1");
    } catch {
      /* ignore */
    }
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.body}>
        <Animated.View key={step} entering={FadeInDown.duration(400)}>
          <Surface accent={card.accent} style={styles.card}>
            <View style={styles.eyebrowRow}>
              <View style={[styles.tick, { backgroundColor: accentColor[card.accent] }]} />
              <Eyebrow color={accentColor[card.accent]}>{card.eyebrow}</Eyebrow>
            </View>
            <Txt variant="h2" color={color.white}>
              {card.title}
            </Txt>

            {card.show === "personas" ? (
              <View style={styles.personaList}>
                {(Object.keys(PERSONA_ROLES) as Persona[]).map((p) => (
                  <View key={p} style={styles.personaRow}>
                    <View
                      style={[styles.dot, { backgroundColor: accentColor[personaAccent[p]] }]}
                    />
                    <Txt variant="bodyMed" color={color.white}>
                      {titleCase(personaLabel[p])}
                    </Txt>
                    <Txt variant="mono" color={color.textMute}>
                      {PERSONA_ROLES[p].toUpperCase()}
                    </Txt>
                  </View>
                ))}
              </View>
            ) : null}

            {card.show === "provenance" ? (
              <View style={{ marginTop: space.lg }}>
                <ProvLegend />
              </View>
            ) : null}

            <Txt variant="small" color={color.textDim} style={{ marginTop: space.md }}>
              {card.body}
            </Txt>
          </Surface>
        </Animated.View>
      </View>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {CARDS.map((_, i) => (
            <View
              key={i}
              style={[
                styles.pageDot,
                { backgroundColor: i === step ? color.wdbx : "rgba(255,255,255,0.18)" },
              ]}
            />
          ))}
        </View>
        <PressableScale onPress={advance} style={styles.btn} accessibilityRole="button">
          <Txt variant="mono" color={color.ink}>
            {card.cta}
          </Txt>
        </PressableScale>
      </View>
    </SafeAreaView>
  );
}

function titleCase(value: string) {
  return value.charAt(0) + value.slice(1).toLowerCase();
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.ink, paddingHorizontal: space.xl },
  body: { flex: 1, justifyContent: "center" },
  card: { paddingVertical: 28, paddingHorizontal: 22 },
  eyebrowRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  tick: { width: 18, height: 1.5, borderRadius: 1 },
  personaList: { gap: space.md, marginTop: space.lg },
  personaRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: space.xxl,
  },
  dots: { flexDirection: "row", gap: 7 },
  pageDot: { width: 7, height: 7, borderRadius: 4 },
  btn: { backgroundColor: color.wdbx, borderRadius: 10, paddingHorizontal: 18, paddingVertical: 11 },
});
