import { StyleSheet, Text, View } from "react-native";
import { color, space } from "../lib/theme";

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quasar</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: color.ink,
    padding: space.l,
  },
  title: {
    color: color.text,
    fontSize: 24,
    fontWeight: "600",
  },
});
