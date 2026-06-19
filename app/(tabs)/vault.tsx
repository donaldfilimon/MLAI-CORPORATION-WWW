import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  RefreshControl,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Animated, { FadeIn, FadeInDown, Layout as LayoutAnim } from "react-native-reanimated";
import { Txt, Eyebrow } from "@/components/ui/Text";
import { Surface } from "@/components/ui/Surface";
import { PressableScale } from "@/components/ui/Motion";
import { useAuth, initialsFor } from "@/lib/auth";
import {
  listItems,
  addItem,
  removeItem,
  updateItem,
  reinsertSorted,
  applyEdit,
  filterItems,
  getStatus,
  describeStatus,
  type VaultItem,
  type VaultStatus,
} from "@/lib/cloud";
import { color, space, accentColor, tabScrollPadding, type as t } from "@/lib/theme";

/* Shared title/body note form — backs both the top composer (no onCancel:
   full-width SAVE) and the inline card editor (onCancel: CANCEL + UPDATE row). */
function NoteForm({
  title,
  body,
  onChangeTitle,
  onChangeBody,
  onSubmit,
  submitLabel,
  busy,
  onCancel,
  autoFocus,
  titleLabel,
  bodyLabel,
}: {
  title: string;
  body: string;
  onChangeTitle: (s: string) => void;
  onChangeBody: (s: string) => void;
  onSubmit: () => void;
  submitLabel: string;
  busy: boolean;
  onCancel?: () => void;
  autoFocus?: boolean;
  titleLabel: string;
  bodyLabel: string;
}) {
  const submit = (
    <PressableScale
      onPress={onSubmit}
      style={[onCancel ? styles.updateBtn : styles.addBtn, { opacity: title.trim() ? 1 : 0.4 }]}
      accessibilityLabel={onCancel ? "Save changes" : undefined}
    >
      {busy ? <ActivityIndicator color={color.ink} size="small" /> : <Txt variant="mono" color={color.ink}>{submitLabel}</Txt>}
    </PressableScale>
  );
  return (
    <>
      <TextInput
        value={title}
        onChangeText={onChangeTitle}
        placeholder="Title"
        placeholderTextColor={color.textFaint}
        accessibilityLabel={titleLabel}
        autoFocus={autoFocus}
        style={[t.bodyMed, styles.input, { color: color.white }]}
      />
      <View style={styles.inputDivider} />
      <TextInput
        value={body}
        onChangeText={onChangeBody}
        placeholder="Anything you want kept private…"
        placeholderTextColor={color.textFaint}
        accessibilityLabel={bodyLabel}
        multiline
        style={[t.body, styles.input, { color: color.text, minHeight: 44 }]}
      />
      {onCancel ? (
        <View style={styles.editActions}>
          <PressableScale onPress={onCancel} haptic={false} style={styles.cancelBtn} accessibilityLabel="Cancel editing">
            <Txt variant="mono" color={color.textDim}>CANCEL</Txt>
          </PressableScale>
          {submit}
        </View>
      ) : (
        submit
      )}
    </>
  );
}

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
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    const [s, list] = await Promise.all([getStatus(), listItems()]);
    setStatus(s);
    setItems(list);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await load();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not load your vault.");
      } finally {
        setLoading(false);
      }
    })();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    try {
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not refresh your vault.");
    } finally {
      setRefreshing(false);
    }
  }, [load]);

  const onAdd = useCallback(async () => {
    if (!title.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const created = await addItem(title.trim(), body.trim());
      setItems((prev) => [created, ...prev]);
      setTitle("");
      setBody("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save to your vault.");
    } finally {
      setSaving(false);
    }
  }, [title, body]);

  const onDelete = useCallback(async (recordName: string) => {
    // Capture just the removed item inside the updater (not a whole-list
    // snapshot), so a failed delete rolls back by re-inserting that one item
    // into the *current* list — preserving any notes added during the in-flight
    // delete. Keeps the callback referentially stable (no `items` dependency).
    let removed: VaultItem | undefined;
    setItems((cur) => {
      removed = cur.find((i) => i.recordName === recordName);
      return cur.filter((i) => i.recordName !== recordName);
    });
    try {
      await removeItem(recordName);
    } catch (e) {
      if (removed) setItems((cur) => reinsertSorted(cur, removed!));
      setError(e instanceof Error ? e.message : "Could not delete that item.");
    }
  }, []);

  const startEdit = useCallback((item: VaultItem) => {
    setEditingId(item.recordName);
    setEditTitle(item.title);
    setEditBody(item.body);
    setError(null);
  }, []);

  const cancelEdit = useCallback(() => setEditingId(null), []);

  const onSaveEdit = useCallback(
    async (item: VaultItem) => {
      const title = editTitle.trim();
      if (!title) return;
      const body = editBody.trim();
      setSavingEdit(true);
      setError(null);
      setItems((cur) => applyEdit(cur, item.recordName, title, body));
      try {
        await updateItem(item.recordName, title, body, item.createdAt);
        setEditingId(null); // close only on success — keep the form (and spinner) up during the save
      } catch (e) {
        // Revert just this item's fields in the current list (not a whole-list
        // snapshot), so notes touched meanwhile are preserved. Leave the form
        // open, pre-filled with the attempted text, so the user can retry.
        setItems((cur) => applyEdit(cur, item.recordName, item.title, item.body));
        setError(e instanceof Error ? e.message : "Could not update that item.");
      } finally {
        setSavingEdit(false);
      }
    },
    [editTitle, editBody],
  );

  // If a search query filters out the note currently being edited, close the
  // edit form rather than leaving it stranded off-screen with unsaved text.
  useEffect(() => {
    if (editingId && query.trim() && !filterItems(items, query).some((i) => i.recordName === editingId)) {
      setEditingId(null);
    }
  }, [editingId, query, items]);

  const desc = status ? describeStatus(status) : null;
  const initials = initialsFor(user);
  const visible = filterItems(items, query);

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={color.wdbx} />}
      >
        {/* header */}
        <View style={styles.head}>
          <View style={styles.eyebrowRow}>
            <View style={[styles.tick, { backgroundColor: accentColor.wdbx }]} />
            <Eyebrow color={accentColor.wdbx}>Vault</Eyebrow>
          </View>
          <PressableScale
            onPress={() => router.push("/account")}
            haptic={false}
            style={styles.avatar}
            accessibilityLabel="Open account"
            accessibilityHint="Shows your identity, storage status, and sign out"
          >
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
          <NoteForm
            title={title}
            body={body}
            onChangeTitle={setTitle}
            onChangeBody={setBody}
            onSubmit={onAdd}
            submitLabel="SAVE TO VAULT →"
            busy={saving}
            titleLabel="Note title"
            bodyLabel="Note body"
          />
        </Surface>

        {error ? (
          <Animated.View entering={FadeIn.duration(240)} style={styles.errorRow}>
            <View style={[styles.dot, { backgroundColor: color.warn }]} />
            <Txt variant="small" color={color.warn} style={{ flex: 1 }}>{error}</Txt>
          </Animated.View>
        ) : null}

        {/* search */}
        {items.length > 0 ? (
          <View style={styles.search}>
            <Txt variant="mono" color={color.textMute}>⌕</Txt>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search notes"
              placeholderTextColor={color.textFaint}
              accessibilityLabel="Search notes"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
              style={[t.body, { flex: 1, color: color.white, paddingVertical: 0 }]}
            />
            {query ? (
              <PressableScale onPress={() => setQuery("")} haptic={false} style={styles.del} accessibilityLabel="Clear search">
                <Txt variant="mono" color={color.textMute}>✕</Txt>
              </PressableScale>
            ) : null}
          </View>
        ) : null}

        {/* list */}
        <View style={{ marginTop: space.lg, gap: space.md }}>
          {loading ? (
            <ActivityIndicator color={color.wdbx} style={{ marginTop: space.xl }} />
          ) : items.length === 0 ? (
            <Txt variant="small" color={color.textMute} style={{ marginTop: space.md }}>
              Nothing saved yet. Add your first private note above.
            </Txt>
          ) : visible.length === 0 ? (
            <Txt variant="small" color={color.textMute} style={{ marginTop: space.md }}>
              No notes match “{query.trim()}”.
            </Txt>
          ) : (
            visible.map((item, i) => (
              <Animated.View key={item.recordName} entering={FadeInDown.delay(i * 40).duration(360)} layout={LayoutAnim}>
                <Surface accent="wdbx">
                  {editingId === item.recordName ? (
                    <NoteForm
                      title={editTitle}
                      body={editBody}
                      onChangeTitle={setEditTitle}
                      onChangeBody={setEditBody}
                      onSubmit={() => onSaveEdit(item)}
                      submitLabel="UPDATE →"
                      busy={savingEdit}
                      onCancel={cancelEdit}
                      autoFocus
                      titleLabel="Edit note title"
                      bodyLabel="Edit note body"
                    />
                  ) : (
                    <>
                      <View style={styles.rowHead}>
                        <Txt variant="h3" color={color.white} style={{ flex: 1 }}>{item.title}</Txt>
                        <PressableScale
                          onPress={() => startEdit(item)}
                          haptic={false}
                          style={styles.iconBtn}
                          accessibilityLabel={`Edit ${item.title}`}
                        >
                          <Txt variant="mono" color={color.textMute}>edit</Txt>
                        </PressableScale>
                        <PressableScale
                          onPress={() => onDelete(item.recordName)}
                          haptic
                          style={styles.del}
                          accessibilityLabel={`Delete ${item.title}`}
                        >
                          <Txt variant="mono" color={color.textMute}>✕</Txt>
                        </PressableScale>
                      </View>
                      {item.body ? (
                        <Txt variant="small" color={color.textDim} style={{ marginTop: 6 }}>{item.body}</Txt>
                      ) : null}
                      <Txt variant="mono" color={color.textFaint} style={{ marginTop: 10 }}>
                        {new Date(item.createdAt).toLocaleString()}
                      </Txt>
                    </>
                  )}
                </Surface>
              </Animated.View>
            ))
          )}
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.ink },
  scroll: { paddingHorizontal: space.xl, paddingTop: space.md, paddingBottom: tabScrollPadding },
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
  errorRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: space.md },
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    marginTop: space.xl,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: color.line,
    backgroundColor: color.panel,
  },
  input: { paddingVertical: 8 },
  inputDivider: { height: 1, backgroundColor: color.line, marginVertical: 4 },
  addBtn: {
    marginTop: space.md,
    backgroundColor: color.wdbx,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  rowHead: { flexDirection: "row", alignItems: "center", gap: space.sm },
  iconBtn: { height: 28, paddingHorizontal: 10, alignItems: "center", justifyContent: "center", borderRadius: 8, backgroundColor: color.panelRaised },
  del: { width: 28, height: 28, alignItems: "center", justifyContent: "center", borderRadius: 8, backgroundColor: color.panelRaised },
  editActions: { flexDirection: "row", justifyContent: "flex-end", gap: space.sm, marginTop: space.md },
  cancelBtn: { borderWidth: 1, borderColor: color.line, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },
  updateBtn: { backgroundColor: color.wdbx, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10, minWidth: 96, alignItems: "center" },
});
