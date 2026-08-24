import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { Stack, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Txt, Eyebrow } from "@/components/ui/Text";
import { Surface } from "@/components/ui/Surface";
import { PressableScale } from "@/components/ui/Motion";
import { useAuth, initialsFor } from "@/lib/auth";
import { getStatus, describeStatus, type VaultStatus } from "@/lib/cloud";
import { color, space, accentColor } from "@/lib/theme";

export default function Account() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [status, setStatus] = useState<VaultStatus | null>(null);

  useEffect(() => {
    // The Account screen is a dismissable modal — guard against resolving the
    // status probe after the user has already closed it (setState on unmount).
    let mounted = true;
    getStatus()
      .then((s) => {
        if (mounted) setStatus(s);
      })
      .catch(() => {
        if (mounted) setStatus(null);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const initials = initialsFor(user);

  const desc = status ? describeStatus(status) : null;

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false, presentation: "modal" }} />
      <View style={styles.head}>
        <PressableScale onPress={() => router.back()} haptic={false}>
          <Txt variant="mono" color={color.textDim}>← close</Txt>
        </PressableScale>
      </View>

      <View style={styles.body}>
        <View style={styles.eyebrowRow}>
          <View style={[styles.tick, { backgroundColor: accentColor.abbey }]} />
          <Eyebrow color={accentColor.abbey}>Account</Eyebrow>
        </View>

        <View style={styles.avatarRow}>
          <View style={styles.avatar}>
            <Txt variant="h3" color={color.white}>{initials}</Txt>
          </View>
          <View style={{ flex: 1 }}>
            <Txt variant="h2" color={color.white}>{user?.name ?? "Signed in"}</Txt>
            <Txt variant="small" color={color.textDim}>
              {user?.email ?? (user?.provider === "apple" ? "Apple ID · hidden email" : "Preview session")}
            </Txt>
          </View>
        </View>

        <Surface style={{ marginTop: space.xl }}>
          <Txt variant="mono" color={color.textMute}>Provider</Txt>
          <Txt variant="bodyMed" color={color.white} style={{ marginTop: 4 }}>
            {user?.provider === "apple" ? "Sign in with Apple" : "Preview (no sign-in)"}
          </Txt>
        </Surface>

        <Surface style={{ marginTop: space.md }}>
          <Txt variant="mono" color={color.textMute}>Storage</Txt>
          <View style={styles.statusRow}>
            <View
              style={[
                styles.dot,
                { backgroundColor: desc?.ok ? accentColor.abbey : color.warn },
              ]}
            />
            <Txt variant="bodyMed" color={color.white}>
              {status?.backend === "cloudkit" ? "CloudKit · private database" : "On-device · encrypted"}
            </Txt>
          </View>
          {desc ? (
            <Txt variant="small" color={color.textDim} style={{ marginTop: 6 }}>{desc.label}</Txt>
          ) : null}
        </Surface>

        <PressableScale
          onPress={async () => {
            await signOut();
            router.replace("/(auth)/sign-in");
          }}
          style={styles.signOut}
        >
          <Txt variant="mono" color={color.warn}>SIGN OUT</Txt>
        </PressableScale>

        <Txt variant="mono" color={color.textFaint} style={{ marginTop: space.xl }}>
          {"Built on Apple's public frameworks — Metal, Accelerate, Core ML."}
        </Txt>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.ink },
  head: { paddingHorizontal: space.xl, paddingTop: space.sm, paddingBottom: space.md },
  body: { flex: 1, paddingHorizontal: space.xl },
  eyebrowRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: space.lg },
  tick: { width: 18, height: 1.5, borderRadius: 1 },
  avatarRow: { flexDirection: "row", alignItems: "center", gap: space.lg },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: color.panel,
    borderWidth: 1,
    borderColor: color.lineStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  signOut: {
    marginTop: space.xxl,
    borderWidth: 1,
    borderColor: color.warn + "55",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
});
