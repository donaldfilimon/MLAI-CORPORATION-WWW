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
      />
      <StatusBar style="light" />
    </>
  );
}
