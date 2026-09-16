import React from "react";
import { View, StyleSheet } from "react-native";
import { Txt } from "@/components/ui/Text";
import { PressableScale } from "@/components/ui/Motion";
import { color, space, radius, accentColor } from "@/lib/theme";
import { personaAccent, personaLabel, type Persona } from "@/lib/chat";

export type PickerValue = Persona | "auto";

const ORDER: PickerValue[] = ["auto", "abbey", "aviva", "abi"];

/** Four pills: let Abi route, or pin a register. Active pill fills with the
   persona's own color and flips its label to ink, so the pinned register is
   readable at a glance without a legend. */
export function PersonaPicker({
  value,
  onChange,
}: {
  value: PickerValue;
  onChange: (next: PickerValue) => void;
}) {
  return (
    <View style={styles.row}>
      {ORDER.map((option) => {
        const active = option === value;
        const fill = option === "auto" ? color.text : accentColor[personaAccent[option]];
        return (
          <PressableScale
            key={option}
            onPress={() => onChange(option)}
            haptic={false}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={option === "auto" ? "Let Abi route" : `Pin ${personaLabel[option]}`}
            style={[
              styles.pill,
              active
                ? { backgroundColor: fill, borderColor: "transparent" }
                : { backgroundColor: "rgba(255,255,255,0.04)", borderColor: color.line },
            ]}
          >
            <Txt variant="mono" color={active ? color.ink : color.textDim} style={styles.label}>
              {option === "auto" ? "AUTO" : personaLabel[option]}
            </Txt>
          </PressableScale>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 6, marginTop: space.md },
  pill: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 7,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  label: { fontSize: 10, letterSpacing: 1 },
});
