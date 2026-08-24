import React, { useCallback, useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Stack, useRouter, useSegments, type ErrorBoundaryProps } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as SystemUI from "expo-system-ui";
import { useFonts, Spectral_600SemiBold, Spectral_700Bold } from "@expo-google-fonts/spectral";
import { Geist_400Regular, Geist_500Medium, Geist_600SemiBold } from "@expo-google-fonts/geist";
import { JetBrainsMono_500Medium } from "@expo-google-fonts/jetbrains-mono";
import { AuthProvider, useAuth } from "@/lib/auth";
import { ErrorScreen } from "@/components/ErrorScreen";
import { color } from "@/lib/theme";

SplashScreen.preventAutoHideAsync().catch(() => {});

/* Root error boundary. expo-router renders any `ErrorBoundary` exported from a
   layout when a descendant render throws — without it, an uncaught error is a
   blank crash. Delegates to ErrorScreen (pure primitives, no fonts/providers),
   so it renders even if those are what failed. */
export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return <ErrorScreen error={error} retry={retry} />;
}

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
    Spectral_600SemiBold,
    Spectral_700Bold,
    Geist_400Regular,
    Geist_500Medium,
    Geist_600SemiBold,
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
