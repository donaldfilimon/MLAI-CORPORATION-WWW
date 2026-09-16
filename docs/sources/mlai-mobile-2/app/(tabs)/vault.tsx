import React, { useCallback, useEffect, useState } from "react";
import { View, StyleSheet, TextInput, RefreshControl, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Animated, { FadeIn, FadeInDown, Layout as LayoutAnim } from "react-native-reanimated";
import { Txt, Eyebrow } from "@/components/ui/Text";
import { Surface } from "@/components/ui/Surface";
import { PressableScale } from "@/components/ui/Motion";
import { useAuth } from "@/lib/auth";
import {
  listItems,
  addItem,
  removeItem,
  getStatus,
  describeStatus,
  type VaultItem,
  type VaultStatus,
} from "@/lib/cloud";
import { color, space, accentColor, type as t } from "@/lib/theme";

export default function Vault() {
  const { user } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<VaultItem[]>([]);
  const [status, setStatus] = useState<VaultStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const [s, list] = await Promise.all([getStatus(), listItems()]);
    setStatus(s);
    setItems(list);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await load();
      } finally {
        setLoading(false);
      }
    })();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  }, [load]);

  const onAdd = useCallback(async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const created = await addItem(title.trim(), body.trim());
      setItems((prev) => [created, ...prev]);
      setTitle("");
      setBody("");
    } finally {
      setSaving(false);
    }
  }, [title, body]);

  const onDelete = useCallback(async (recordName: string) => {
    setItems((prev) => prev.filter((i) => i.recordName !== recordName));
    await removeItem(recordName).catch(() => {});
  }, []);

  const desc = status ? describeStatus(status) : null;
  const initials =
    user?.name?.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase() ||
    (user?.provider === "guest" ? "PV" : "ID");

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={color.wdbx} />}
      >
        {/* header */}
        <View style={styles.head}>
          <View style={styles.eyebrowRow}>
            <View style={[styles.tick, { backgroundColor: accentColor.wdbx }]} />
            <Eyebrow color={accentColor.wdbx}>Vault</Eyebrow>
          </View>
          <PressableScale onPress={() => router.push("/account")} haptic={false} style={styles.avatar}>
            <Txt variant="mono" color={color.text}>{initials}</Txt>
          </PressableScale>
        </View>

        <Txt variant="h1" color={color.white}>Private by storage</Txt>
        <Txt variant="small" color={color.textDim} style={{ marginTop: 6 }}>
          Notes saved here are written to your own iCloud — proof of the thesis, not a demo of it.
        </Txt>

        {/* status banner */}
        {desc ? (
          <Animated.View entering={FadeIn.duration(400)} style={[styles.banner, { borderColor: (desc.ok ? accentColor.abbey : color.warn) + "44" }]}>
            <View style={[styles.dot, { backgroundColor: desc.ok ? accentColor.abbey : color.warn }]} />
            <Txt variant="small" color={color.text} style={{ flex: 1 }}>{desc.label}</Txt>
          </Animated.View>
        ) : null}

        {/* composer */}
        <Surface style={{ marginTop: space.lg }}>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Title"
            placeholderTextColor={color.textFaint}
            style={[t.bodyMed, styles.input, { color: color.white }]}
          />
          <View style={styles.inputDivider} />
          <TextInput
            value={body}
            onChangeText={setBody}
            placeholder="Anything you want kept private…"
            placeholderTextColor={color.textFaint}
            multiline
            style={[t.body, styles.input, { color: color.text, minHeight: 44 }]}
          />
          <PressableScale onPress={onAdd} style={[styles.addBtn, { opacity: title.trim() ? 1 : 0.4 }]}>
            {saving ? (
              <ActivityIndicator color={color.ink} size="small" />
            ) : (
              <Txt variant="mono" color={color.ink}>SAVE TO VAULT →</Txt>
            )}
          </PressableScale>
        </Surface>

        {/* list */}
        <View style={{ marginTop: space.xl, gap: space.md }}>
          {loading ? (
            <ActivityIndicator color={color.wdbx} style={{ marginTop: space.xl }} />
          ) : items.length === 0 ? (
            <Txt variant="small" color={color.textMute} style={{ marginTop: space.md }}>
              Nothing saved yet. Add your first private note above.
            </Txt>
          ) : (
            items.map((item, i) => (
              <Animated.View key={item.recordName} entering={FadeInDown.delay(i * 40).duration(360)} layout={LayoutAnim}>
                <Surface accent="wdbx">
                  <View style={styles.rowHead}>
                    <Txt variant="h3" color={color.white} style={{ flex: 1 }}>{item.title}</Txt>
                    <PressableScale onPress={() => onDelete(item.recordName)} haptic style={styles.del}>
                      <Txt variant="mono" color={color.textMute}>✕</Txt>
                    </PressableScale>
                  </View>
                  {item.body ? (
                    <Txt variant="small" color={color.textDim} style={{ marginTop: 6 }}>{item.body}</Txt>
                  ) : null}
                  <Txt variant="mono" color={color.textFaint} style={{ marginTop: 10 }}>
                    {new Date(item.createdAt).toLocaleString()}
                  </Txt>
                </Surface>
              </Animated.View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.ink },
  scroll: { paddingHorizontal: space.xl, paddingTop: space.md, paddingBottom: 100 },
  head: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: space.lg },
  eyebrowRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  tick: { width: 18, height: 1.5, borderRadius: 1 },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: color.panel,
    borderWidth: 1,
    borderColor: color.lineStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: space.lg,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: color.panel,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  input: { paddingVertical: 8 },
  inputDivider: { height: 1, backgroundColor: color.line, marginVertical: 4 },
  addBtn: {
    marginTop: space.md,
    backgroundColor: color.wdbx,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  rowHead: { flexDirection: "row", alignItems: "center", gap: space.md },
  del: { width: 28, height: 28, alignItems: "center", justifyContent: "center", borderRadius: 8, backgroundColor: color.panelRaised },
});
