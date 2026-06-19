import React from "react";
import { View, StyleSheet } from "react-native";
import { Link, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Txt } from "@/components/ui/Text";
import { Surface } from "@/components/ui/Surface";
import { color, space } from "@/lib/theme";

export default function NotFound() {
  return (
    <SafeAreaView style={styles.screen}>
      <Stack.Screen options={{ title: "Not found", headerShown: false }} />
      <View style={styles.wrap}>
        <Txt variant="mono" color={color.warn}>recall@10 = 0.000</Txt>
        <Txt variant="hero" color={color.white} style={{ marginTop: space.md }}>404</Txt>
        <Surface style={{ marginTop: space.lg }}>
          <Txt variant="mono" color={color.textMute}>
            <Txt variant="mono" color={color.wdbx}>$ </Txt>{'wdbx query --route "this screen" --k 10'}
          </Txt>
          <Txt variant="mono" color={color.textMute} style={{ marginTop: 4 }}>
            … 0 hits · route not present
          </Txt>
        </Surface>
        <Link href="/" style={styles.link}>
          <Txt variant="mono" color={color.ink}>BACK TO HOME →</Txt>
        </Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.ink },
  wrap: { flex: 1, justifyContent: "center", paddingHorizontal: space.xl },
  link: {
    marginTop: space.xl,
    backgroundColor: color.wdbx,
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 12,
    alignSelf: "flex-start",
    overflow: "hidden",
  },
});
