import React, { useState } from "react";
import { View, StyleSheet, Alert, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as AppleAuthentication from "expo-apple-authentication";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
import { LogoMark } from "@/components/Logo";
import { Txt, GradientText } from "@/components/ui/Text";
import { PressableScale } from "@/components/ui/Motion";
import { useAuth } from "@/lib/auth";
import { color, space, type as t } from "@/lib/theme";

export default function SignIn() {
  const { signInWithApple, continueAsGuest, appleAvailable } = useAuth();
  const [busy, setBusy] = useState(false);

  const onApple = async () => {
    try {
      setBusy(true);
      await signInWithApple();
    } catch (e: any) {
      if (e?.code !== "ERR_REQUEST_CANCELED") {
        Alert.alert("Sign in failed", e?.message ?? "Please try again.");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <LinearGradient colors={[color.wdbx + "22", "transparent"]} style={styles.glow} pointerEvents="none" />

      <View style={styles.body}>
        <Animated.View entering={FadeIn.duration(500)} style={styles.brand}>
          <LogoMark size={40} />
          <Txt style={[t.h3, { letterSpacing: 6, color: color.white }]}>MLAI</Txt>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(120).duration(500).springify().damping(18)}>
          <Txt variant="h1" color={color.white}>Your data,</Txt>
          <GradientText variant="h1">your iCloud.</GradientText>
          <Txt variant="body" color={color.textDim} style={{ marginTop: space.lg, maxWidth: 340 }}>
            Sign in with Apple. What you save lives in your own private iCloud database via CloudKit — there is no MLAI
            server in the path, and nothing to phone home to.
          </Txt>
        </Animated.View>
      </View>

      <Animated.View entering={FadeInDown.delay(280).duration(500)} style={styles.actions}>
        {appleAvailable ? (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
            cornerRadius={12}
            style={styles.appleBtn}
            onPress={onApple}
          />
        ) : (
          <View style={styles.unavailable}>
            <Txt variant="small" color={color.textDim} style={{ textAlign: "center" }}>
              Sign in with Apple is available on iOS. {Platform.OS !== "ios" ? "You're on a preview platform — " : ""}
              continue in preview mode to explore.
            </Txt>
            <PressableScale onPress={continueAsGuest} style={styles.previewBtn}>
              <Txt variant="mono" color={color.ink}>CONTINUE IN PREVIEW →</Txt>
            </PressableScale>
          </View>
        )}

        <Txt variant="mono" color={color.textFaint} style={{ textAlign: "center", marginTop: space.lg }}>
          {"Built on Apple's public frameworks"}
        </Txt>
      </Animated.View>

      {busy ? <View style={styles.veil} pointerEvents="none" /> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.ink, paddingHorizontal: space.xl },
  glow: { position: "absolute", top: -40, left: -60, width: 320, height: 320, borderRadius: 220 },
  body: { flex: 1, justifyContent: "center" },
  brand: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: space.xxxl },
  actions: { paddingBottom: space.xxl },
  appleBtn: { height: 50, width: "100%" },
  unavailable: { gap: space.lg },
  previewBtn: {
    backgroundColor: color.wdbx,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  veil: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(5,7,11,0.4)" },
});
