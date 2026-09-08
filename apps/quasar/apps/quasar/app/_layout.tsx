import { useEffect, useState } from "react";
import { Text, View, Pressable } from "react-native";
import { connection } from "../lib/api";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { color } from "../lib/theme";

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { connection.hydrate().then(() => setReady(true)).catch(err => setError(String(err))); }, []);
  if (!ready) return <View style={{ padding: 24, backgroundColor: color.ink, flex: 1 }}>
    <Text style={{ color: color.text }}>{error || "Loading saved connection…"}</Text>
    {error ? <Pressable onPress={() => connection.save("http://localhost:4700").then(() => setReady(true)).catch(err => setError(String(err)))}><Text style={{ color: color.accent }}>Reset connection to localhost</Text></Pressable> : null}
  </View>;
  return (
    <>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: color.ink },
          headerTintColor: color.text,
          contentStyle: { backgroundColor: color.ink },
        }}
      >
        <Stack.Screen name="index" options={{ title: "Sites" }} />
        <Stack.Screen name="new" options={{ title: "New site" }} />
        <Stack.Screen name="site/[id]" options={{ title: "Site" }} />
        <Stack.Screen name="settings" options={{ title: "Settings" }} />
      </Stack>
      <StatusBar style="light" />
    </>
  );
}
