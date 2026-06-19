import React, { useCallback, useEffect } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Stack, useRouter, useSegments, type ErrorBoundaryProps } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as SystemUI from "expo-system-ui";
import { useFonts, Sora_600SemiBold, Sora_700Bold } from "@expo-google-fonts/sora";
import { Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold } from "@expo-google-fonts/manrope";
import { JetBrainsMono_500Medium } from "@expo-google-fonts/jetbrains-mono";
import { AuthProvider, useAuth } from "@/lib/auth";
import { color, space, type as t } from "@/lib/theme";

SplashScreen.preventAutoHideAsync().catch(() => {});

/* Root error boundary. expo-router renders any `ErrorBoundary` exported from a
   layout when a descendant render throws — without it, an uncaught error is a
   blank crash. Branded to match the 404, with a retry that re-mounts the tree.
   Uses plain primitives only (no fonts/providers), so it renders even if those
   are what failed. */
export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return (
    <View style={eb.screen}>
      <View style={eb.wrap}>
        <Text style={[t.mono, { color: color.warn }]}>recall@10 = 0.000 · runtime fault</Text>
        <Text style={[t.hero, { color: color.white, marginTop: space.md }]}>Something broke.</Text>
        <Text style={[t.small, { color: color.textDim, marginTop: space.sm }]}>
          The screen hit an error it could not recover from on its own. Nothing left the device.
        </Text>
        <View style={eb.detail}>
          <Text style={[t.mono, { color: color.textMute }]} numberOfLines={4}>
            {error?.message ?? "Unknown error"}
          </Text>
        </View>
        <Pressable accessibilityRole="button" onPress={retry} style={eb.btn}>
          <Text style={[t.mono, { color: color.ink }]}>TRY AGAIN →</Text>
        </Pressable>
      </View>
    </View>
  );
}

const eb = StyleSheet.create({
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

/* Redirect based on auth state: signed-out users are pushed to the auth group;
   signed-in users are kept out of it. */
function useProtectedRoute(status: ReturnType<typeof useAuth>["status"]) {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    const inAuthGroup = segments[0] === "(auth)";
    if (status === "signedOut" && !inAuthGroup) {
      router.replace("/(auth)/sign-in");
    } else if (status === "signedIn" && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [status, segments, router]);
}

function RootNavigator() {
  const { status } = useAuth();
  useProtectedRoute(status);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: color.ink },
        animation: "fade",
      }}
    >
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="account" options={{ presentation: "modal", animation: "slide_from_bottom" }} />
      <Stack.Screen name="product/[slug]" options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Sora_600SemiBold,
    Sora_700Bold,
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    JetBrainsMono_500Medium,
  });

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(color.ink).catch(() => {});
  }, []);

  const onReady = useCallback(async () => {
    if (loaded || error) await SplashScreen.hideAsync().catch(() => {});
  }, [loaded, error]);

  useEffect(() => {
    onReady();
  }, [onReady]);

  if (!loaded && !error) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: color.ink }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
