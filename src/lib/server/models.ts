import { createHash } from "node:crypto";
import { connection, connections, Connection } from "./config";
import { one } from "./db";
import { ApiError, fail } from "./http";
export interface ModelMessage {
  role: "system" | "user" | "assistant";
  content: string;
}
function endpoint(c: Connection, path: string) {
  if (!c.url)
    fail(503, "provider_unconfigured", "The model endpoint is not configured.");
  const url = new URL(c.url.replace(/\/$/, "") + path);
  if (
    c.kind === "local" &&
    (!["127.0.0.1", "localhost", "[::1]"].includes(url.hostname) ||
      !["http:", "https:"].includes(url.protocol))
  )
    fail(
      503,
      "invalid_local_endpoint",
      "Local providers must use a loopback endpoint.",
    );
  if (c.kind === "hosted" && url.protocol !== "https:")
    fail(503, "invalid_hosted_endpoint", "Hosted providers require HTTPS.");
  if (url.username || url.password)
    fail(
      503,
      "invalid_endpoint",
      "Endpoint credentials must be supplied separately.",
    );
  return url;
}
function headers(c: Connection) {
  const key = c.keyEnv ? process.env[c.keyEnv] : undefined;
  return {
    "Content-Type": "application/json",
    ...(key ? { Authorization: `Bearer ${key}` } : {}),
  };
}
export async function probe(c: Connection, signal?: AbortSignal) {
  signal?.throwIfAborted();
  if (!["local", "hosted"].includes(c.kind))
    return {
      connected: false,
      reason: "Use the service playground to test this connection.",
    };
  try {
    const res = await fetch(endpoint(c, "/models"), {
      headers: headers(c),
      signal: signal
        ? AbortSignal.any([signal, AbortSignal.timeout(5000)])
        : AbortSignal.timeout(5000),
      redirect: "error",
    });
    if (!res.ok)
      return {
        connected: false,
        reason: `Provider returned HTTP ${res.status}.`,
      };
    const data = await res.json();
    const models = Array.isArray(data.data)
      ? data.data
          .map((m: { id?: string }) => m.id)
          .filter((v: unknown) => typeof v === "string")
      : [];
    return {
      connected: models.length > 0,
      models,
      reason: models.length ? undefined : "No models are currently loaded.",
    };
  } catch (e) {
    signal?.throwIfAborted();
    return {
      connected: false,
      reason:
        e instanceof ApiError
          ? e.message
          : "The configured model endpoint is not reachable.",
    };
  }
}
function selectedConnection(workspaceId: string) {
  const w = one<{ provider_id: string | null; hosted_consent: number }>(
    "SELECT provider_id,hosted_consent FROM workspaces WHERE id=?",
    workspaceId,
  );
  const c = w?.provider_id
    ? connection(w.provider_id)
    : connections().find((c) => c.kind === "local");
  if (!c || !["local", "hosted"].includes(c.kind))
    fail(
      503,
      "provider_unconfigured",
      "Select a model connection in Settings.",
    );
  if (c.kind === "hosted" && !w?.hosted_consent)
    fail(
      403,
      "hosted_consent_required",
      "Hosted processing is disabled for this workspace.",
    );
  endpoint(c, "/models");
  return c;
}
export type ModelSelection = {
  connectionId: string;
  model: string;
  fingerprint: string;
};
export function modelSelection(
  selected: Awaited<ReturnType<typeof selectedModel>>,
): ModelSelection {
  const c = selected.connection;
  return {
    connectionId: c.id,
    model: selected.model,
    fingerprint: createHash("sha256").update(JSON.stringify({
      id: c.id, kind: c.kind, url: c.url, configuredModel: c.model || "",
      model: selected.model, keyEnv: c.keyEnv, tokenFile: c.tokenFile,
      caFile: c.caFile, certFile: c.certFile, keyFile: c.keyFile,
    })).digest("hex"),
  };
}
function compareSelection(actual: ModelSelection, expected: ModelSelection) {
  if (actual.connectionId !== expected.connectionId ||
      actual.model !== expected.model || actual.fingerprint !== expected.fingerprint)
    fail(409, "provider_changed", "The selected provider configuration or model changed. Start a new run.");
}
export function validateModelSelection(workspaceId: string, expected: ModelSelection): void {
  const c = selectedConnection(workspaceId);
  compareSelection(modelSelection({ connection: c, model: c.model || expected.model }), expected);
}
export async function assertModelSelection(workspaceId: string, expected: ModelSelection): Promise<void> {
  validateModelSelection(workspaceId, expected);
  compareSelection(modelSelection(await selectedModel(workspaceId)), expected);
}
export async function selectedModel(workspaceId: string, signal?: AbortSignal) {
  signal?.throwIfAborted();
  const c = selectedConnection(workspaceId);
  let model = c.model;
  if (!model) {
    const result = await probe(c, signal);
    if (!result.connected)
      fail(503, "provider_unavailable", result.reason || "No model is loaded.");
    model = result.models?.[0];
  }
  if (!model)
    fail(
      503,
      "model_unavailable",
      "Configure a model identifier for this connection.",
    );
  if (c.kind === "local" && /(?:[:_-]cloud)(?:$|[:_-])/i.test(model))
    fail(
      403,
      "remote_model_in_local_mode",
      "This model is marked as a cloud model. Configure a hosted connection and explicitly enable hosted processing instead.",
    );
  const selected = { connection: c, model };
  signal?.throwIfAborted();
  validateModelSelection(workspaceId, modelSelection(selected));
  return selected;
}
export async function* generate(
  workspaceId: string,
  messages: ModelMessage[],
  signal?: AbortSignal,
  expected?: ModelSelection,
): AsyncGenerator<{
  text?: string;
  usage?: { input?: number; output?: number };
  provider?: string;
}> {
  signal?.throwIfAborted();
  if (expected) validateModelSelection(workspaceId, expected);
  const selected = await selectedModel(workspaceId, signal),
    c = selected.connection;
  if (expected) compareSelection(modelSelection(selected), expected);
  yield { provider: `${c.name} / ${selected.model}` };
  let response: Response;
  try {
    signal?.throwIfAborted();
    validateModelSelection(workspaceId, expected || modelSelection(selected));
    response = await fetch(endpoint(c, "/chat/completions"), {
      method: "POST",
      headers: headers(c),
      redirect: "error",
      signal: signal
        ? AbortSignal.any([signal, AbortSignal.timeout(120000)])
        : AbortSignal.timeout(120000),
      body: JSON.stringify({
        model: selected.model,
        messages,
        stream: true,
        stream_options: { include_usage: true },
        temperature: 0.3,
        max_tokens: 2048,
      }),
    });
  } catch (e) {
    if (signal?.aborted) throw e;
    fail(
      503,
      "provider_unavailable",
      "The selected model did not respond. Your provider selection has not changed.",
    );
  }
  if (!response.ok)
    fail(
      502,
      "provider_error",
      `The selected provider returned HTTP ${response.status}.`,
    );
  if (!response.body)
    fail(502, "empty_response", "The provider returned no stream.");
  const reader = response.body.getReader(),
    decoder = new TextDecoder();
  let pending = "",
    hasText = false;
  try {
    for (;;) {
      signal?.throwIfAborted();
      const { done, value } = await reader.read();
      signal?.throwIfAborted();
      pending += done
        ? decoder.decode()
        : decoder.decode(value, { stream: true });
      const lines = pending.split(/\r?\n/);
      pending = lines.pop() || "";
      if (done && pending) {
        lines.push(pending);
        pending = "";
      }
      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const raw = line.slice(5).trim();
        if (raw === "[DONE]") continue;
        let data;
        try {
          data = JSON.parse(raw);
        } catch {
          continue;
        }
        if (data.error)
          fail(
            502,
            "provider_error",
            "The model reported an error during generation.",
          );
        const text = data.choices?.[0]?.delta?.content;
        if (typeof text === "string" && text) {
          hasText = true;
          yield { text };
        }
        if (data.usage)
          yield {
            usage: {
              input: data.usage.prompt_tokens,
              output: data.usage.completion_tokens,
            },
          };
      }
      if (done) break;
    }
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
  if (!hasText) fail(502, "empty_response", "The model returned no answer.");
}
