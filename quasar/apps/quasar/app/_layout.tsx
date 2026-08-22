import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { color } from "../lib/theme";

export default function RootLayout() {
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
