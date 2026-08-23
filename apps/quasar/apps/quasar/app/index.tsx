import { useCallback, useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Link, Stack, useFocusEffect } from "expo-router";
import type { Site } from "@quasar/shared";
import { getBaseUrl, listSites } from "../lib/api";
import { color, radius, space } from "../lib/theme";

function statusColor(status: Site["status"]): string {
  if (status === "generating") return color.accent;
  if (status === "error") return color.danger;
  return color.textDim;
}

export default function Index() {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listSites();
      setSites(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <View style={styles.headerRight}>
              <Link href="/new" style={styles.headerLink}>
                ＋ New
              </Link>
              <Link href="/settings" style={styles.headerLink}>
                ⚙
              </Link>
            </View>
          ),
        }}
      />
      {error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.errorHint}>Base URL: {getBaseUrl()} — check Settings.</Text>
        </View>
      ) : null}
      <FlatList
        data={sites}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={load} tintColor={color.text} />
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No sites yet. Tap ＋ New to create one.</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <Link href={`/site/${item.id}`} asChild>
            <Pressable style={styles.row}>
              <View style={styles.rowMain}>
                <Text style={styles.rowName}>{item.name}</Text>
                <Text style={styles.rowSlug}>{item.slug}</Text>
              </View>
              <View style={[styles.chip, { borderColor: statusColor(item.status) }]}>
                <Text style={[styles.chipText, { color: statusColor(item.status) }]}>
                  {item.status}
                </Text>
              </View>
            </Pressable>
          </Link>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.ink,
  },
  headerRight: {
    flexDirection: "row",
    gap: space.m,
    paddingRight: space.s,
  },
  headerLink: {
    color: color.text,
    fontSize: 16,
  },
  errorBanner: {
    margin: space.m,
    padding: space.m,
    borderRadius: radius.m,
    backgroundColor: color.panel,
    borderWidth: 1,
    borderColor: color.danger,
  },
  errorText: {
    color: color.danger,
    fontWeight: "600",
  },
  errorHint: {
    color: color.textDim,
    marginTop: space.xs,
    fontSize: 12,
  },
  listContent: {
    padding: space.m,
    flexGrow: 1,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: space.xl,
  },
  emptyText: {
    color: color.textDim,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: color.panel,
    borderRadius: radius.m,
    padding: space.m,
    marginBottom: space.s,
    borderWidth: 1,
    borderColor: color.line,
  },
  rowMain: {
    flex: 1,
    gap: space.xs,
  },
  rowName: {
    color: color.text,
    fontSize: 16,
    fontWeight: "600",
  },
  rowSlug: {
    color: color.textDim,
    fontSize: 13,
  },
  chip: {
    borderWidth: 1,
    borderRadius: radius.m,
    paddingHorizontal: space.s,
    paddingVertical: space.xs,
    marginLeft: space.m,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
});
