import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { color, space, type as t } from "@/lib/theme";

/* The crash-recovery UI rendered by the root ErrorBoundary (app/_layout.tsx).
   Pure RN primitives only (no fonts/providers/router), so it renders even when
   those are what failed — and so it can be unit-tested in isolation. */
export function ErrorScreen({ error, retry }: { error?: Error | null; retry: () => void }) {
  return (
    <View style={styles.screen}>
      <View style={styles.wrap}>
        <Text style={[t.mono, { color: color.warn }]}>recall@10 = 0.000 · runtime fault</Text>
        <Text style={[t.hero, { color: color.white, marginTop: space.md }]}>Something broke.</Text>
        <Text style={[t.small, { color: color.textDim, marginTop: space.sm }]}>
          The screen hit an error it could not recover from on its own. Nothing left the device.
        </Text>
        <View style={styles.detail}>
          <Text style={[t.mono, { color: color.textMute }]} numberOfLines={4}>
            {error?.message ?? "Unknown error"}
          </Text>
        </View>
        <Pressable accessibilityRole="button" onPress={retry} style={styles.btn}>
          <Text style={[t.mono, { color: color.ink }]}>TRY AGAIN →</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.ink },
  wrap: { flex: 1, justifyContent: "center", paddingHorizontal: space.xl },
  detail: {
    marginTop: space.lg,
    padding: space.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: color.line,
    backgroundColor: color.panel,
  },
  btn: {
    marginTop: space.xl,
    backgroundColor: color.wdbx,
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 12,
    alignSelf: "flex-start",
  },
});
