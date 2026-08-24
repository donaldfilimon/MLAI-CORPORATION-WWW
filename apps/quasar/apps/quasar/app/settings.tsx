import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { getBaseUrl, setBaseUrl } from "../lib/api";
import { color, radius, space } from "../lib/theme";

export default function Settings() {
  const [url, setUrl] = useState(getBaseUrl());
  const [saved, setSaved] = useState(false);

  function save() {
    setBaseUrl(url.trim());
    setSaved(true);
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
      <Pressable style={styles.button} onPress={save}>
        <Text style={styles.buttonText}>Save</Text>
      </Pressable>
      {saved ? <Text style={styles.saved}>Saved for this session.</Text> : null}
      <Text style={styles.note}>
        This is stored in memory only for now — it resets to the default the next time the app
        starts.
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
