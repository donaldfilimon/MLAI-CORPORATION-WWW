import { useSyncExternalStore } from "react";
import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { connection } from "./api";
import { color, space } from "./theme";
export function useOrigin() {
  return useSyncExternalStore(connection.subscribe, () => connection.origin, () => connection.origin);
}
export function Recovery({ retry }: { retry: () => void }) {
  return <View style={{ flexDirection: "row", gap: space.l, paddingVertical: space.s }}>
    <Pressable accessibilityRole="button" onPress={retry}><Text style={{ color: color.accent }}>Retry / refresh state</Text></Pressable>
    <Link href="/settings" style={{ color: color.accent }}>Open settings</Link>
  </View>;
}
