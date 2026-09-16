import { Stack } from "expo-router";
import { color } from "@/lib/theme";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: color.ink },
        animation: "fade",
      }}
    />
  );
}
