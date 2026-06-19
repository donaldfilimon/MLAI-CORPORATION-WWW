import React from "react";
import { View, StyleSheet, Linking } from "react-native";
import { Screen, Section, FeatureCard } from "@/components/ui/Layout";
import { Surface } from "@/components/ui/Surface";
import { StatBlock } from "@/components/ui/StatBlock";
import { PressableScale } from "@/components/ui/Motion";
import { Txt } from "@/components/ui/Text";
import { color, space } from "@/lib/theme";
import { company, investorHighlights, links } from "@/lib/brand";

export default function CompanyScreen() {
  return (
    <Screen>
      <Section eyebrow="Company" title="Why MLAI exists" accent="abbey">
        <Txt variant="body" color={color.textDim}>
          The most capable AI is also the most opaque and least private. The bet behind {company.short} is that Apple
          Silicon finally makes the alternative practical — capable AI that runs where you can see it.
        </Txt>
        <Surface style={{ marginTop: space.lg }}>
          <Txt variant="mono" color={color.textMute}>{company.entity} · {company.location}</Txt>
          <Txt variant="bodyMed" color={color.white} style={{ marginTop: 8 }}>{company.founder}</Txt>
          <Txt variant="small" color={color.textDim}>{company.founderRole}</Txt>
        </Surface>
      </Section>

      <Section eyebrow="How we operate" title="The approach" accent="abbey" delay={40}>
        <View style={{ gap: space.md }}>
          {company.principles.map((p) => (
            <FeatureCard key={p.title} title={p.title} desc={p.body} accent="abbey" />
          ))}
        </View>
      </Section>

      <Section eyebrow="Investors" title="A timing bet" accent="wdbx" delay={40}>
        <View style={styles.statGrid}>
          {investorHighlights.map((s) => (
            <View key={s.label} style={styles.statCell}>
              <StatBlock stat={s} accent="wdbx" />
            </View>
          ))}
        </View>
      </Section>

      <Section delay={20}>
        <Surface style={{ alignItems: "flex-start" }}>
          <Txt variant="h2" color={color.white}>Get in touch</Txt>
          <Txt variant="small" color={color.textDim} style={{ marginTop: 6 }}>
            Deploy, pilot, partner, or invest — one inbox, read by the people who build it.
          </Txt>
          <View style={styles.linkRow}>
            {[
              { label: "GITHUB", url: links.github },
              { label: "WEB", url: links.site },
              { label: "X", url: links.x },
            ].map((l) => (
              <PressableScale key={l.label} onPress={() => Linking.openURL(l.url).catch(() => {})} style={styles.linkBtn}>
                <Txt variant="mono" color={color.text}>{l.label}</Txt>
              </PressableScale>
            ))}
          </View>
        </Surface>
        <Txt variant="mono" color={color.textFaint} style={{ marginTop: space.lg }}>
          {company.appleFraming}
        </Txt>
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  statGrid: { flexDirection: "row", flexWrap: "wrap", gap: space.md },
  statCell: { width: "47%", flexGrow: 1 },
  linkRow: { flexDirection: "row", gap: space.sm, marginTop: space.lg },
  linkBtn: {
    borderWidth: 1,
    borderColor: color.line,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
});
