import React from "react";
import { View, StyleSheet, Linking } from "react-native";
import { Hero } from "@/components/Hero";
import { ProductCard } from "@/components/ProductCard";
import { Screen, Section, FeatureCard, Pill } from "@/components/ui/Layout";
import { Surface } from "@/components/ui/Surface";
import { PressableScale } from "@/components/ui/Motion";
import { Txt } from "@/components/ui/Text";
import { ProvLegend } from "@/components/ui/StatBlock";
import { color, space } from "@/lib/theme";
import { products, productOrder, whyNow, links, company } from "@/lib/brand";

export default function HomeScreen() {
  return (
    <Screen>
      <Hero />

      <Section eyebrow="The stack" title="Three layers. One chip." accent="wdbx" delay={80}>
        <View style={{ gap: space.md }}>
          {productOrder.map((slug) => (
            <ProductCard key={slug} product={products[slug]} />
          ))}
        </View>
        <View style={{ marginTop: space.lg }}>
          <ProvLegend />
        </View>
      </Section>

      <Section eyebrow="Why now" title="Four forces, one direction" accent="abi" delay={60}>
        <View style={{ gap: space.md }}>
          {whyNow.map((w) => (
            <FeatureCard key={w.title} title={w.title} desc={w.body} accent="abi" />
          ))}
        </View>
      </Section>

      <Section eyebrow="The premise" title="Private by default" accent="abbey" delay={60}>
        <Txt variant="body" color={color.textDim}>
          On-device inference means data never leaves hardware the user controls. Privacy stops being a policy you
          have to trust and becomes a property of where the computation physically runs.
        </Txt>
        <View style={styles.pills}>
          <Pill label="WDBX" accent="wdbx" />
          <Pill label="ABI" accent="abi" />
          <Pill label="Abbey" accent="abbey" />
        </View>
      </Section>

      <Section delay={40}>
        <Surface style={styles.cta}>
          <Txt variant="h2" color={color.white}>Build on the open core.</Txt>
          <Txt variant="small" color={color.textDim} style={{ marginTop: 6 }}>
            The WDBX and ABI core is Apache-2.0. {company.appleFraming}
          </Txt>
          <PressableScale onPress={() => Linking.openURL(links.github).catch(() => {})} style={styles.btn}>
            <Txt variant="mono" color={color.ink}>OPEN GITHUB →</Txt>
          </PressableScale>
        </Surface>
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  pills: { flexDirection: "row", gap: space.sm, marginTop: space.lg },
  cta: { alignItems: "flex-start" },
  btn: {
    marginTop: space.lg,
    backgroundColor: color.wdbx,
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 11,
  },
});
