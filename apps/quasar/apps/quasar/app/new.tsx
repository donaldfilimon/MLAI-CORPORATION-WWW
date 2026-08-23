import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import { createSite } from "../lib/api";
import { color, radius, space } from "../lib/theme";

export default function New() {
  const [name, setName] = useState("");
  const [prompt, setPrompt] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const disabled = pending || name.trim().length === 0 || prompt.trim().length === 0;

  async function submit() {
    if (disabled) return;
    setPending(true);
    setError(null);
    try {
      const site = await createSite({ name: name.trim(), prompt: prompt.trim() });
      router.replace(`/site/${site.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setPending(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text style={styles.label}>Name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="My site"
        placeholderTextColor={color.textDim}
        style={styles.input}
        editable={!pending}
      />
      <Text style={styles.label}>Prompt</Text>
      <TextInput
        value={prompt}
        onChangeText={setPrompt}
        placeholder="Describe the site you want built..."
        placeholderTextColor={color.textDim}
        style={[styles.input, styles.multiline]}
        multiline
        editable={!pending}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable
        style={[styles.button, disabled && styles.buttonDisabled]}
        onPress={submit}
        disabled={disabled}
      >
        <Text style={styles.buttonText}>{pending ? "Creating..." : "Create site"}</Text>
      </Pressable>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.ink,
    padding: space.m,
  },
  label: {
    color: color.textDim,
    fontSize: 13,
    marginBottom: space.xs,
    marginTop: space.m,
  },
  input: {
    backgroundColor: color.panel,
    borderRadius: radius.m,
    borderWidth: 1,
    borderColor: color.line,
    color: color.text,
    padding: space.m,
    fontSize: 15,
  },
  multiline: {
    minHeight: 140,
    textAlignVertical: "top",
  },
  error: {
    color: color.danger,
    marginTop: space.m,
  },
  button: {
    backgroundColor: color.accent,
    borderRadius: radius.m,
    padding: space.m,
    alignItems: "center",
    marginTop: space.l,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: color.ink,
    fontWeight: "700",
    fontSize: 15,
  },
});
