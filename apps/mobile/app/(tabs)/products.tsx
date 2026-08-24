import React from "react";
import { View } from "react-native";
import { Screen, Section } from "@/components/ui/Layout";
import { ProductCard } from "@/components/ProductCard";
import { Txt } from "@/components/ui/Text";
import { ProvLegend } from "@/components/ui/StatBlock";
import { color, space } from "@/lib/theme";
import { products, productOrder } from "@/lib/brand";

export default function ProductsScreen() {
  return (
    <Screen>
      <Section eyebrow="The stack" title="Three products, one chip" accent="wdbx">
        <Txt variant="body" color={color.textDim}>
          Each is useful on its own; together they are a private AI stack that never has to phone home. Tap any layer
          to go deeper.
        </Txt>
        <View style={{ gap: space.md, marginTop: space.xl }}>
          {productOrder.map((slug) => (
            <ProductCard key={slug} product={products[slug]} />
          ))}
        </View>
        <View style={{ marginTop: space.xl }}>
          <ProvLegend />
        </View>
      </Section>
    </Screen>
  );
}
