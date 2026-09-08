import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { getBaseUrl, setBaseUrl, testConnection } from "../lib/api";
import { color, radius, space } from "../lib/theme";

export default function Settings() {
  const [url, setUrl] = useState(getBaseUrl());
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function save(test = false) {
    if (pending) return;
    setPending(true);
    setMessage("");
    setSaved(false);
    try {
      await setBaseUrl(url);
      setUrl(getBaseUrl());
      setSaved(true);
      if (test) { const sites = await testConnection(); setMessage(`Connected. ${sites.length} sites available.`); }
    } catch (err) { setMessage(err instanceof Error ? err.message : String(err)); }
    finally { setPending(false); }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Server base URL</Text>
      <TextInput
        value={url}
        onChangeText={(text) => {
          setUrl(text);
          setSaved(false);
        }}
        placeholder="http://localhost:4700"
        placeholderTextColor={color.textDim}
        autoCapitalize="none"
        autoCorrect={false}
        style={styles.input}
      />
      <Pressable style={styles.button} disabled={pending} onPress={() => save()}>
        <Text style={styles.buttonText}>Save</Text>
      </Pressable>
      <Pressable style={styles.button} disabled={pending} onPress={() => save(true)}>
        <Text style={styles.buttonText}>{pending ? "Connecting…" : "Save and test connection"}</Text>
      </Pressable>
      {message ? <Text style={styles.note}>{message}</Text> : null}
      {saved ? <Text style={styles.saved}>Saved on this device.</Text> : null}
      <Text style={styles.note}>
        The server origin persists on this device. Connection testing reads the sites list only.
        For a phone, use your Mac’s LAN address. No credentials are stored here.
      </Text>
    </View>
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
  button: {
    backgroundColor: color.accent,
    borderRadius: radius.m,
    padding: space.m,
    alignItems: "center",
    marginTop: space.l,
  },
  buttonText: {
    color: color.ink,
    fontWeight: "700",
    fontSize: 15,
  },
  saved: {
    color: color.ok,
    marginTop: space.m,
    textAlign: "center",
  },
  note: {
    color: color.textDim,
    fontSize: 12,
    marginTop: space.xl,
    lineHeight: 18,
  },
});
