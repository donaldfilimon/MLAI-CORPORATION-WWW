import React, { useCallback, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Txt, Eyebrow } from "@/components/ui/Text";
import { PressableScale } from "@/components/ui/Motion";
import { ChatTurn, TypingBubble } from "@/components/ChatTurn";
import { PersonaPicker, type PickerValue } from "@/components/PersonaPicker";
import { color, space, radius, accentColor, tabScrollPadding, type as t } from "@/lib/theme";
import { demoThread, routeTurn, traceLine, personaLabel, type Turn } from "@/lib/chat";

let seq = 0;
const nextId = (prefix: string) => `${prefix}${++seq}`;

export default function ChatScreen() {
  const [turns, setTurns] = useState<Turn[]>(demoThread);
  const [pinned, setPinned] = useState<PickerValue>("auto");
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const scroller = useRef<ScrollView | null>(null);

  const send = useCallback(() => {
    const text = draft.trim();
    if (!text || typing) return;

    const routing = routeTurn(text, pinned === "auto" ? undefined : pinned);
    setDraft("");
    setTurns((cur) => [...cur, { kind: "user", id: nextId("u"), text }]);
    setTyping(true);

    // Reference implementation: the routing decision is computed locally so the
    // trace line and the reply can never disagree. Swap for the runtime call.
    const timer = setTimeout(() => {
      setTurns((cur) => [
        ...cur,
        { kind: "trace", id: nextId("t"), text: traceLine(routing) },
        {
          kind: "persona",
          id: nextId("p"),
          persona: routing.primary,
          text: replyFor(routing.primary),
        },
      ]);
      setTyping(false);
    }, 900);
    return () => clearTimeout(timer);
  }, [draft, pinned, typing]);

  const placeholder =
    pinned === "auto" ? "Message — Abi routes it" : `Direct to ${titleCase(personaLabel[pinned])}`;

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <View style={styles.headRow}>
            <View style={styles.eyebrowRow}>
              <View style={[styles.tick, { backgroundColor: accentColor.abbey }]} />
              <Eyebrow color={accentColor.abbey}>Abbey</Eyebrow>
            </View>
            <Txt variant="mono" color={color.textFaint} style={{ fontSize: 11, letterSpacing: 1 }}>
              LOCAL · WDBX MEMORY
            </Txt>
          </View>
          <PersonaPicker value={pinned} onChange={setPinned} />
        </View>

        <ScrollView
          ref={scroller}
          contentContainerStyle={styles.thread}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          onContentSizeChange={() => scroller.current?.scrollToEnd({ animated: true })}
        >
          {turns.map((turn, i) => (
            <Animated.View key={turn.id} entering={FadeInDown.delay(Math.min(i, 6) * 40).duration(360)}>
              <ChatTurn turn={turn} />
            </Animated.View>
          ))}
          {typing ? (
            <Animated.View entering={FadeInDown.duration(240)} style={{ alignSelf: "flex-start" }}>
              <TypingBubble />
            </Animated.View>
          ) : null}
        </ScrollView>

        <View style={styles.composerWrap}>
          <View style={styles.composer}>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder={placeholder}
              placeholderTextColor={color.textFaint}
              accessibilityLabel="Message Abbey"
              returnKeyType="send"
              onSubmitEditing={send}
              multiline
              style={[t.body, styles.input]}
            />
            <PressableScale
              onPress={send}
              accessibilityRole="button"
              accessibilityLabel="Send message"
              style={styles.send}
            >
              <Txt variant="mono" color={color.ink} style={{ fontSize: 13 }}>
                ↑
              </Txt>
            </PressableScale>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function titleCase(value: string) {
  return value.charAt(0) + value.slice(1).toLowerCase();
}

/** Register-appropriate stand-in copy. Real replies come from the runtime. */
function replyFor(persona: "abbey" | "aviva" | "abi") {
  if (persona === "aviva") return "M=16, efConstruction=200. Cosine for the text corpus. Done.";
  if (persona === "abbey")
    return "You'd just watched a black-box index miss a memory you knew was there. Cosine plus a traceable graph meant every recall could show its path — you chose the version of fast you could explain.";
  return "Routing this one myself: the ask is a policy question, so it stays with me until a plan clears review.";
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.ink },
  header: {
    paddingHorizontal: space.xl,
    paddingBottom: space.md,
    borderBottomWidth: 1,
    borderBottomColor: color.line,
  },
  headRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  eyebrowRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  tick: { width: 18, height: 1.5, borderRadius: 1 },
  thread: {
    paddingHorizontal: space.xl,
    paddingTop: space.lg,
    paddingBottom: space.lg,
    gap: space.md,
  },
  composerWrap: { paddingHorizontal: space.xl, paddingBottom: tabScrollPadding - space.lg },
  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: space.md,
    backgroundColor: color.panel,
    borderWidth: 1,
    borderColor: color.line,
    borderRadius: radius.pill,
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 6,
  },
  input: { flex: 1, color: color.white, maxHeight: 96, paddingVertical: 8 },
  send: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: color.wdbx,
    alignItems: "center",
    justifyContent: "center",
  },
});
