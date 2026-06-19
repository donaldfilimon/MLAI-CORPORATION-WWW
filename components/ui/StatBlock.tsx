import React from "react";
import { View, StyleSheet } from "react-native";
import { Txt } from "./Text";
import { Surface } from "./Surface";
import { color, accentColor, type as t } from "@/lib/theme";
import { provenanceMeta, type Stat } from "@/lib/brand";

const provColor = (c: "wdbx" | "abi" | "abbey" | "warn") =>
  c === "warn" ? color.warn : accentColor[c];

export function ProvTag({ provenance }: { provenance: Stat["provenance"] }) {
  const m = provenanceMeta[provenance];
  return (
    <View style={styles.tagRow}>
      <Txt variant="mono" color={provColor(m.color)}>
        {m.glyph}
      </Txt>
      <Txt variant="mono" color={color.textMute}>
        {m.label}
      </Txt>
    </View>
  );
}

export function ProvLegend() {
  return (
    <View style={styles.legend}>
      {(["measured", "target", "reported"] as const).map((p) => {
        const m = provenanceMeta[p];
        return (
          <View key={p} style={styles.tagRow}>
            <Txt variant="mono" color={provColor(m.color)}>{m.glyph}</Txt>
            <Txt variant="mono" color={color.textMute}>{m.label}</Txt>
          </View>
        );
      })}
    </View>
  );
}

export function StatBlock({ stat, accent = "wdbx" }: { stat: Stat; accent?: "wdbx" | "abi" | "abbey" }) {
  return (
    <Surface accent={accent} style={styles.stat}>
      <Txt style={[t.h1, { color: accentColor[accent] }]}>{stat.value}</Txt>
      <Txt variant="small" color={color.text} style={{ marginTop: 2 }}>
        {stat.label}
      </Txt>
      <View style={{ marginTop: 8 }}>
        <ProvTag provenance={stat.provenance} />
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  tagRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  legend: { flexDirection: "row", flexWrap: "wrap", gap: 14 },
  stat: { flex: 1, minWidth: 150 },
});
