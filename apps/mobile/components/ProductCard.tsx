import React from "react";
import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Txt } from "@/components/ui/Text";
import { Surface } from "@/components/ui/Surface";
import { PressableScale } from "@/components/ui/Motion";
import { color, accentColor } from "@/lib/theme";
import type { Product } from "@/lib/brand";

export function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  return (
    <PressableScale
      onPress={() => router.push(`/product/${product.slug}`)}
      accessibilityLabel={`${product.name} — ${product.kicker}`}
      accessibilityHint="Opens product detail"
    >
      <Surface accent={product.accent}>
        <View style={styles.head}>
          <Txt variant="mono" color={accentColor[product.accent]}>{product.kicker}</Txt>
          <Txt variant="mono" color={color.textFaint} accessibilityElementsHidden importantForAccessibility="no">→</Txt>
        </View>
        <Txt variant="h2" color={color.white} style={{ marginTop: 4 }}>{product.name}</Txt>
        <Txt variant="small" color={color.textDim} style={{ marginTop: 6 }}>{product.blurb}</Txt>
      </Surface>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
});
