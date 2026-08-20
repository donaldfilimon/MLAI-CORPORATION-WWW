import { createElement, useCallback, useEffect, useRef, useState } from "react";
import {
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import type { GenerationEvent, PreviewStatus, Site } from "@quasar/shared";
import {
  deleteSite,
  editSite,
  getBaseUrl,
  getEvents,
  getSite,
  previewStart,
  previewStatus,
  previewStop,
} from "../../lib/api";
import { color, radius, space } from "../../lib/theme";

function toolIcon(name: "list_files" | "read_file" | "write_file"): string {
  if (name === "write_file") return "✎";
  if (name === "read_file") return "👁";
  return "☰";
}

function statusColor(status: Site["status"]): string {
  if (status === "generating") return color.accent;
  if (status === "error") return color.danger;
  return color.textDim;
}

// react-native-web renders host elements as strings; the RN types don't know
// about "iframe", so this is the one place we escape-hatch through
// createElement to render a real DOM iframe on web.
function WebPreviewFrame({ url }: { url: string }) {
  return createElement("iframe", {
    src: url,
    style: { width: "100%", height: 420, border: "none", borderRadius: radius.m },
  });
}

export default function SiteDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [site, setSite] = useState<Site | null>(null);
  const [events, setEvents] = useState<GenerationEvent[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [preview, setPreview] = useState<PreviewStatus | null>(null);
  const [previewPending, setPreviewPending] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [editPrompt, setEditPrompt] = useState("");
  const [editPending, setEditPending] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [deleteArmed, setDeleteArmed] = useState(false);
  const [deletePending, setDeletePending] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const cursorRef = useRef(0);
  // Guards against overlapping ticks (a slow request outliving the 1s
  // interval), and against a stale in-flight tick clobbering state after
  // an edit resets the cursor (epoch bump invalidates it).
  const inFlightRef = useRef(false);
  const epochRef = useRef(0);
  const prevStatusRef = useRef<Site["status"] | null>(null);
  const previewPendingRef = useRef(false);

  useEffect(() => {
    if (!id) return;
    // Reset all id-scoped state up front so a param change (web back/forward,
    // or navigating detail -> detail) can't leak site A's cursor/feed/preview
    // into site B while this effect spins back up. This includes the
    // destructive delete-arm state: an armed delete must never carry across
    // ids, or a stray tap on the confirm button for the new site could
    // delete it immediately.
    cursorRef.current = 0;
    inFlightRef.current = false;
    epochRef.current += 1;
    prevStatusRef.current = null;
    previewPendingRef.current = false;
    setSite(null);
    setEvents([]);
    setLoadError(null);
    setPreview(null);
    setPreviewError(null);
    setPreviewPending(false);
    setEditPrompt("");
    setEditPending(false);
    setEditError(null);
    setDeleteArmed(false);
    setDeletePending(false);
    setDeleteError(null);

    let cancelled = false;

    async function tick() {
      if (inFlightRef.current) return;
      inFlightRef.current = true;
      const epoch = epochRef.current;
      try {
        const nextSite = await getSite(id);
        if (cancelled || epoch !== epochRef.current) return;
        setSite(nextSite);
        setLoadError(null);

        if (nextSite.status === "generating") {
          const page = await getEvents(id, cursorRef.current);
          if (cancelled || epoch !== epochRef.current) return;
          cursorRef.current = page.next;
          if (page.events.length > 0) {
            setEvents((prev) => [...prev, ...page.events]);
          }
        } else if (prevStatusRef.current === "generating") {
          // Status just flipped away from generating — drain any trailing
          // events (the final text chunk / the "done" event) once.
          try {
            const page = await getEvents(id, cursorRef.current);
            if (!cancelled && epoch === epochRef.current) {
              cursorRef.current = page.next;
              if (page.events.length > 0) {
                setEvents((prev) => [...prev, ...page.events]);
              }
            }
          } catch {
            // best-effort drain; not worth surfacing as a load error
          }
        }
        prevStatusRef.current = nextSite.status;

        // Fold preview polling into the same tick so a "starting" preview
        // is observed transitioning to "running" without a manual refresh.
        // Skipped while a manual Start/Stop call is in flight to avoid
        // clobbering its result with a stale read.
        if (!previewPendingRef.current) {
          try {
            const status = await previewStatus(id);
            if (!cancelled && epoch === epochRef.current) {
              setPreview(status);
              setPreviewError(null);
            }
          } catch (err) {
            if (!cancelled && epoch === epochRef.current) {
              setPreviewError(err instanceof Error ? err.message : String(err));
            }
          }
        }
      } catch (err) {
        if (!cancelled && epoch === epochRef.current) {
          setLoadError(err instanceof Error ? err.message : String(err));
        }
      } finally {
        // A tick from a previous id/epoch must not clear the flag: the
        // id-change reset already zeroed it for the new epoch, and a slow
        // stale tick resolving late would otherwise stomp it back to false
        // while the new epoch's own tick is genuinely in flight, letting
        // two ticks run concurrently for the new id.
        if (epoch === epochRef.current) {
          inFlightRef.current = false;
        }
      }
    }

    tick();
    const interval = setInterval(tick, 1000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [id]);

  const startPreview = useCallback(async () => {
    if (!id) return;
    const epoch = epochRef.current;
    previewPendingRef.current = true;
    setPreviewPending(true);
    setPreviewError(null);
    try {
      const status = await previewStart(id);
      if (epoch === epochRef.current) {
        setPreview(status);
      }
    } catch (err) {
      if (epoch === epochRef.current) {
        setPreviewError(err instanceof Error ? err.message : String(err));
      }
    } finally {
      // A stale call from a previous id/epoch must not clear the pending
      // flag: both epoch-bump sites (id change and edit submission) zero it
      // for the new epoch, and this reset must not stomp back over a
      // genuinely in-flight call for the new epoch.
      if (epoch === epochRef.current) {
        previewPendingRef.current = false;
        setPreviewPending(false);
      }
    }
  }, [id]);

  const stopPreview = useCallback(async () => {
    if (!id) return;
    const epoch = epochRef.current;
    previewPendingRef.current = true;
    setPreviewPending(true);
    setPreviewError(null);
    try {
      const status = await previewStop(id);
      if (epoch === epochRef.current) {
        setPreview(status);
      }
    } catch (err) {
      if (epoch === epochRef.current) {
        setPreviewError(err instanceof Error ? err.message : String(err));
      }
    } finally {
      // A stale call from a previous id/epoch must not clear the pending
      // flag: both epoch-bump sites (id change and edit submission) zero it
      // for the new epoch, and this reset must not stomp back over a
      // genuinely in-flight call for the new epoch.
      if (epoch === epochRef.current) {
        previewPendingRef.current = false;
        setPreviewPending(false);
      }
    }
  }, [id]);

  // Rewrites the preview host from "localhost" to the hostname of the
  // configured base URL, so the preview works when this app is opened from
  // another device pointed at a LAN base URL (a no-op when the base URL
  // host is itself localhost).
  const toDisplayUrl = useCallback((url: string) => {
    let host = "localhost";
    try {
      host = new URL(getBaseUrl()).hostname;
    } catch {
      // keep default
    }
    return url.replace("localhost", host);
  }, []);

  const displayUrl = preview?.url ? toDisplayUrl(preview.url) : null;

  const openNative = useCallback(() => {
    if (!preview?.url) return;
    Linking.openURL(toDisplayUrl(preview.url));
  }, [preview, toDisplayUrl]);

  const submitEdit = useCallback(async () => {
    if (!id || editPrompt.trim().length === 0) return;
    setEditPending(true);
    setEditError(null);
    try {
      const nextSite = await editSite(id, editPrompt.trim());
      // Invalidate any in-flight poll tick so it can't write a stale
      // cursor/events back in after this reset. A tick from the prior
      // epoch now skips its own inFlightRef reset (see tick's finally), so
      // this reset must claim it for the new epoch here or the poll loop
      // would deadlock forever on the next tick. Same reasoning applies to
      // previewPendingRef/setPreviewPending: a stale startPreview/stopPreview
      // call from the prior epoch skips its own reset in its finally block
      // (see there), so this bump must also reset it here or the preview
      // buttons and tick's preview polling would stay stuck forever.
      epochRef.current += 1;
      inFlightRef.current = false;
      previewPendingRef.current = false;
      setPreviewPending(false);
      setSite(nextSite);
      prevStatusRef.current = nextSite.status;
      setEditPrompt("");
      cursorRef.current = 0;
      setEvents([]);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : String(err));
    } finally {
      setEditPending(false);
    }
  }, [id, editPrompt]);

  const handleDelete = useCallback(async () => {
    if (!id) return;
    if (!deleteArmed) {
      setDeleteArmed(true);
      return;
    }
    setDeletePending(true);
    setDeleteError(null);
    try {
      await deleteSite(id);
      router.back();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : String(err));
      setDeletePending(false);
      setDeleteArmed(false);
    }
  }, [id, deleteArmed]);

  const generating = site?.status === "generating";

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {loadError ? <Text style={styles.error}>{loadError}</Text> : null}

      {site ? (
        <View style={styles.header}>
          <Text style={styles.name}>{site.name}</Text>
          <Text style={[styles.status, { color: statusColor(site.status) }]}>
            {site.status}
          </Text>
          {site.status === "error" && site.lastError ? (
            <Text style={styles.error}>{site.lastError}</Text>
          ) : null}
        </View>
      ) : (
        <Text style={styles.dim}>Loading…</Text>
      )}

      <Text style={styles.sectionTitle}>Feed</Text>
      <View style={styles.feed}>
        {events.length === 0 ? (
          <Text style={styles.dim}>No events yet.</Text>
        ) : (
          events.map((event, index) => {
            if (event.type === "text") {
              return (
                <Text key={index} style={styles.feedText}>
                  {event.text}
                </Text>
              );
            }
            if (event.type === "tool") {
              return (
                <Text key={index} style={styles.feedTool}>
                  {toolIcon(event.name)}
                  {event.path ? ` ${event.path}` : ""}
                </Text>
              );
            }
            if (event.type === "error") {
              return (
                <Text key={index} style={styles.error}>
                  {event.message}
                </Text>
              );
            }
            return (
              <Text key={index} style={styles.dim}>
                done
              </Text>
            );
          })
        )}
      </View>

      <Text style={styles.sectionTitle}>Preview</Text>
      <View style={styles.card}>
        {previewError ? <Text style={styles.error}>{previewError}</Text> : null}
        <Text style={styles.dim}>State: {preview?.state ?? "unknown"}</Text>
        {preview?.state === "running" && preview.url && displayUrl ? (
          <>
            <Text selectable style={styles.previewUrl}>
              {displayUrl}
            </Text>
            {Platform.OS === "web" ? (
              <WebPreviewFrame url={displayUrl} />
            ) : (
              <Pressable style={styles.button} onPress={openNative}>
                <Text style={styles.buttonText}>Open preview</Text>
              </Pressable>
            )}
          </>
        ) : null}
        <View style={styles.row}>
          <Pressable
            style={[styles.button, styles.rowButton, previewPending && styles.buttonDisabled]}
            onPress={startPreview}
            disabled={previewPending}
          >
            <Text style={styles.buttonText}>Start</Text>
          </Pressable>
          <Pressable
            style={[styles.buttonOutline, styles.rowButton, previewPending && styles.buttonDisabled]}
            onPress={stopPreview}
            disabled={previewPending}
          >
            <Text style={styles.buttonOutlineText}>Stop</Text>
          </Pressable>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Edit</Text>
      <View style={styles.card}>
        <TextInput
          value={editPrompt}
          onChangeText={setEditPrompt}
          placeholder="Describe the change you want..."
          placeholderTextColor={color.textDim}
          style={[styles.input, styles.multiline]}
          multiline
          editable={!generating && !editPending}
        />
        {editError ? <Text style={styles.error}>{editError}</Text> : null}
        <Pressable
          style={[
            styles.button,
            (generating || editPending || editPrompt.trim().length === 0) &&
              styles.buttonDisabled,
          ]}
          onPress={submitEdit}
          disabled={generating || editPending || editPrompt.trim().length === 0}
        >
          <Text style={styles.buttonText}>{editPending ? "Sending..." : "Send edit"}</Text>
        </Pressable>
      </View>

      <Text style={styles.sectionTitle}>Danger zone</Text>
      <View style={styles.card}>
        {deleteError ? <Text style={styles.error}>{deleteError}</Text> : null}
        <Pressable
          style={[styles.buttonDanger, deletePending && styles.buttonDisabled]}
          onPress={handleDelete}
          disabled={deletePending}
        >
          <Text style={styles.buttonText}>
            {deletePending ? "Deleting..." : deleteArmed ? "Tap again to confirm" : "Delete site"}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.ink,
  },
  content: {
    padding: space.m,
    gap: space.m,
  },
  header: {
    gap: space.xs,
  },
  name: {
    color: color.text,
    fontSize: 22,
    fontWeight: "700",
  },
  status: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  dim: {
    color: color.textDim,
  },
  error: {
    color: color.danger,
  },
  sectionTitle: {
    color: color.textDim,
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    marginTop: space.m,
  },
  feed: {
    backgroundColor: color.panel,
    borderRadius: radius.m,
    borderWidth: 1,
    borderColor: color.line,
    padding: space.m,
    gap: space.xs,
  },
  feedText: {
    color: color.text,
    fontSize: 14,
  },
  feedTool: {
    color: color.textDim,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    fontSize: 13,
  },
  previewUrl: {
    color: color.textDim,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    fontSize: 13,
  },
  card: {
    backgroundColor: color.panel,
    borderRadius: radius.m,
    borderWidth: 1,
    borderColor: color.line,
    padding: space.m,
    gap: space.m,
  },
  row: {
    flexDirection: "row",
    gap: space.m,
  },
  rowButton: {
    flex: 1,
  },
  input: {
    backgroundColor: color.ink,
    borderRadius: radius.m,
    borderWidth: 1,
    borderColor: color.line,
    color: color.text,
    padding: space.m,
    fontSize: 15,
  },
  multiline: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  button: {
    backgroundColor: color.accent,
    borderRadius: radius.m,
    padding: space.m,
    alignItems: "center",
  },
  buttonOutline: {
    borderRadius: radius.m,
    padding: space.m,
    alignItems: "center",
    borderWidth: 1,
    borderColor: color.line,
  },
  buttonDanger: {
    backgroundColor: color.danger,
    borderRadius: radius.m,
    padding: space.m,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: color.ink,
    fontWeight: "700",
    fontSize: 15,
  },
  buttonOutlineText: {
    color: color.text,
    fontWeight: "700",
    fontSize: 15,
  },
});
