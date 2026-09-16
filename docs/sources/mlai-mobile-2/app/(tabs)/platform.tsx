import React from "react";
import { View } from "react-native";
import { Screen, Section } from "@/components/ui/Layout";
import { Surface } from "@/components/ui/Surface";
import { Txt } from "@/components/ui/Text";
import { color, space } from "@/lib/theme";
import { platformLayers } from "@/lib/brand";

export default function PlatformScreen() {
  return (
    <Screen>
      <Section eyebrow="Platform" title="Autonomy you can answer for" accent="abi">
        <Txt variant="body" color={color.textDim}>
          An agent that plans, calls tools, and acts is useful exactly to the degree you can see what it did and
          constrain what it may do. Four layers make on-device autonomy inspectable.
        </Txt>
        <View style={{ gap: space.md, marginTop: space.xl }}>
          {platformLayers.map((l, i) => (
            <Surface key={l.title} accent="abi">
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Txt variant="h3" color={color.white}>{l.title}</Txt>
                <Txt variant="mono" color={color.textFaint}>{String(i + 1).padStart(2, "0")}</Txt>
              </View>
              <Txt variant="small" color={color.textDim} style={{ marginTop: 6 }}>{l.body}</Txt>
              <Txt variant="mono" color={color.textMute} style={{ marginTop: 10 }}>{l.meta}</Txt>
            </Surface>
          ))}
        </View>
      </Section>
    </Screen>
  );
}
