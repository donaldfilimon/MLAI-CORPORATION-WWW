import React from "react";
import { View, StyleSheet } from "react-native";
import { Txt } from "@/components/ui/Text";
import { Surface } from "@/components/ui/Surface";
import { color, space, radius, accentColor } from "@/lib/theme";
import { personaAccent, personaLabel, type Turn } from "@/lib/chat";

/** One transcript row. Four kinds, four treatments — the recall chips and the
   trace line are deliberately NOT collapsed into the answer bubble: the point of
   the screen is that you can see what was retrieved and why this register spoke. */
export function ChatTurn({ turn }: { turn: Turn }) {
  if (turn.kind === "user") {
    return (
      <View style={styles.userWrap}>
        <Txt variant="body" color={color.text} style={styles.userText}>
          {turn.text}
        </Txt>
      </View>
    );
  }

  if (turn.kind === "recall") {
    return (
      <View style={styles.recallRow}>
        <Txt variant="mono" color={color.textMute} style={styles.recallLabel}>
          ◆ RECALLED
        </Txt>
        {turn.chips.map((chip) => (
          <View key={chip.label} style={styles.chip}>
            <Txt variant="mono" color={color.wdbx} style={styles.chipText}>
              {chip.label}
            </Txt>
            <Txt variant="mono" color={color.textFaint} style={styles.chipText}>
              {chip.score}
            </Txt>
          </View>
        ))}
      </View>
    );
  }

  if (turn.kind === "trace") {
    return (
      <View style={styles.traceRow}>
        <View style={styles.traceDot} />
        <Txt variant="mono" color={color.textFaint} style={styles.traceText}>
          {turn.text}
        </Txt>
      </View>
    );
  }

  const accent = accentColor[personaAccent[turn.persona]];
  return (
    <View style={styles.personaWrap}>
      <View style={styles.personaHead}>
        <View style={[styles.personaDot, { backgroundColor: accent, shadowColor: accent }]} />
        <Txt variant="mono" color={accent} style={styles.personaName}>
          {personaLabel[turn.persona]}
        </Txt>
      </View>
      <Surface style={styles.personaBubble}>
        <Txt variant="body" color={color.text} style={styles.personaText}>
          {turn.text}
        </Txt>
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  userWrap: {
    alignSelf: "flex-end",
    maxWidth: "78%",
    backgroundColor: color.panelRaised,
    borderWidth: 1,
    borderColor: color.line,
    borderRadius: radius.lg,
    borderBottomRightRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  userText: { fontSize: 14, lineHeight: 21 },

  recallRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 6 },
  recallLabel: { fontSize: 10, letterSpacing: 1 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: "rgba(34,211,238,0.3)",
    backgroundColor: "rgba(34,211,238,0.08)",
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  chipText: { fontSize: 10 },

  traceRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingLeft: 2 },
  traceDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: color.wdbx, opacity: 0.7 },
  traceText: { fontSize: 10.5 },

  personaWrap: { alignSelf: "flex-start", maxWidth: "86%" },
  personaHead: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 5 },
  personaDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    shadowOpacity: 0.6,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  personaName: { fontSize: 10, letterSpacing: 1.5 },
  personaBubble: {
    borderRadius: radius.lg,
    borderTopLeftRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  personaText: { fontSize: 14, lineHeight: 21 },
});

/** Three dots that fade in sequence while a reply is in flight. */
export function TypingBubble() {
  return (
    <Surface style={styles.personaBubble}>
      <View style={{ flexDirection: "row", gap: 5, alignItems: "center" }}>
        {[0, 1, 2].map((i) => (
          <View
            key={i}
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: color.textDim,
              opacity: 0.25 + i * 0.25,
            }}
          />
        ))}
      </View>
    </Surface>
  );
}
