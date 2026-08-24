import React from "react";
import { View, TextInput, StyleSheet, ActivityIndicator } from "react-native";
import { Txt } from "@/components/ui/Text";
import { PressableScale } from "@/components/ui/Motion";
import { color, space, type as t } from "@/lib/theme";

/* Shared title/body note form — backs both the Vault composer (no onCancel:
   full-width SAVE) and the inline card editor (onCancel: CANCEL + UPDATE row). */
export function NoteForm({
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

const styles = StyleSheet.create({
  input: { paddingVertical: 8 },
  inputDivider: { height: 1, backgroundColor: color.line, marginVertical: 4 },
  addBtn: { marginTop: space.md, backgroundColor: color.wdbx, borderRadius: 10, paddingVertical: 12, alignItems: "center" },
  editActions: { flexDirection: "row", justifyContent: "flex-end", gap: space.sm, marginTop: space.md },
  cancelBtn: { borderWidth: 1, borderColor: color.line, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },
  updateBtn: { backgroundColor: color.wdbx, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10, minWidth: 96, alignItems: "center" },
});
