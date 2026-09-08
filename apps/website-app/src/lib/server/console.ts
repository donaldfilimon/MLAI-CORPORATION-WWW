import { z } from "zod";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { execFile } from "node:child_process";
import * as grpc from "@grpc/grpc-js";
import * as loader from "@grpc/proto-loader";
import { one, run } from "./db";
import { connection, connections, Connection } from "./config";
import { Context, body, fail, json, now, owner, trace } from "./http";
import { embed } from "./embeddings";
import { capabilities } from "./documents";
import { probe } from "./models";
const definitions = loader.loadSync(resolve("src/lib/server/gateway.proto"), {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const descriptor = grpc.loadPackageDefinition(definitions) as unknown as {
  abi: {
    wdbx: { gateway: { v1: { WdbxGateway: grpc.ServiceClientConstructor } } };
  };
};
const schemas: Record<string, z.ZodType> = {
  TextSearch: z
    .object({
      text: z.string().trim().min(1).max(8000),
      limit: z.number().int().min(1).max(100).default(5),
    })
    .strict(),
  Stats: z.object({}).strict(),
  PutVector: z
    .object({
      vectors: z
        .array(
          z.object({ values: z.array(z.number().finite()).min(1).max(4096) }),
        )
        .min(1)
        .max(128),
    })
    .strict(),
  Search: z
    .object({
      query: z.array(z.number().finite()).min(1).max(4096),
      limit: z.number().int().min(1).max(100).default(5),
    })
    .strict(),
  PutKv: z
    .object({
      entries: z
        .array(
          z.object({
            key: z.string().min(1).max(1024),
            value: z.string().max(64000),
          }),
        )
        .min(1)
        .max(128),
    })
    .strict(),
  GetKv: z.object({ key: z.string().min(1).max(1024) }).strict(),
};
function bindingKey(c: Connection) {
  return `wdbx:${c.url
    ?.toLowerCase()
    .replace(/^localhost:/, "127.0.0.1:")
    .replace(/^\[::1\]:/, "127.0.0.1:")}`;
}
function binding(c: Connection, ctx: Context) {
  if (!c.url)
    fail(503, "connection_unconfigured", "Gateway address is missing.");
  const key = bindingKey(c);
  const b = one<{ workspace_id: string }>(
    "SELECT workspace_id FROM bindings WHERE connection_id=?",
    key,
  );
  if (!b || b.workspace_id !== ctx.workspaceId)
    fail(
      403,
      "gateway_not_bound",
      "A workspace owner must bind this gateway exclusively to this workspace.",
    );
}
function client(c: Connection) {
  if (!c.url || !c.tokenFile)
    fail(
      503,
      "connection_unconfigured",
      "WDBX requires an operator-configured address and bearer-token file.",
    );
  const tls = !!c.caFile;
  if (tls && /^(?:\d{1,3}\.){3}\d{1,3}:|^\[/.test(c.url))
    fail(
      503,
      "tls_hostname_required",
      "Configure the gateway with the DNS name in its TLS certificate, for example localhost. Node TLS does not accept an IP address as the server name.",
    );
  const credentials = tls
    ? grpc.credentials.createSsl(
        readFileSync(c.caFile!),
        c.keyFile ? readFileSync(c.keyFile) : undefined,
        c.certFile ? readFileSync(c.certFile) : undefined,
      )
    : grpc.credentials.createInsecure();
  if (!tls && !/^(127\.0\.0\.1|localhost|\[::1\]):\d+$/.test(c.url))
    fail(503, "tls_required", "Non-loopback gateways require TLS.");
  const api = new descriptor.abi.wdbx.gateway.v1.WdbxGateway(
    c.url,
    credentials,
    { "grpc.max_receive_message_length": 1024 * 1024 },
  );
  const metadata = new grpc.Metadata();
  metadata.set(
    "authorization",
    `Bearer ${readFileSync(c.tokenFile, "utf8").trim()}`,
  );
  return { api, metadata };
}
export async function consoleRoutes(
  req: Request,
  path: string[],
  ctx: Context,
): Promise<Response | undefined> {
  const [section, key, action] = path;
  if (section === "connections") {
    if (req.method === "GET")
      return json(
        connections().map((c) => ({
          id: c.id,
          name: c.name,
          kind: c.kind,
          model: c.model || null,
          bound:
            c.kind === "wdbx"
              ? one<{ workspace_id: string }>(
                  "SELECT workspace_id FROM bindings WHERE connection_id=?",
                  bindingKey(c),
                )?.workspace_id === ctx.workspaceId
              : undefined,
        })),
      );
    const c = key ? connection(key) : undefined;
    if (!c) fail(404, "not_found", "Connection not found.");
    if (action === "bind" && req.method === "POST") {
      owner(ctx);
      if (c.kind !== "wdbx")
        fail(
          400,
          "invalid_connection",
          "Only WDBX gateways require a binding.",
        );
      const bindingId = bindingKey(c);
      const existing = one<{ workspace_id: string }>(
        "SELECT workspace_id FROM bindings WHERE connection_id=?",
        bindingId,
      );
      if (existing && existing.workspace_id !== ctx.workspaceId)
        fail(
          409,
          "gateway_in_use",
          "This gateway is already assigned to another workspace.",
        );
      run(
        "INSERT OR IGNORE INTO bindings(connection_id,workspace_id) VALUES(?,?)",
        bindingId,
        ctx.workspaceId,
      );
      if (
        one<{ workspace_id: string }>(
          "SELECT workspace_id FROM bindings WHERE connection_id=?",
          bindingId,
        )?.workspace_id !== ctx.workspaceId
      )
        fail(
          409,
          "gateway_in_use",
          "This gateway is already assigned to another workspace.",
        );
      return json({ ok: true });
    }
    if (action === "probe" && req.method === "POST") {
      if (
        c.kind === "hosted" &&
        !one(
          "SELECT id FROM workspaces WHERE id=? AND hosted_consent=1",
          ctx.workspaceId,
        )
      )
        fail(
          403,
          "hosted_consent_required",
          "Enable hosted processing before contacting this provider.",
        );
      const start = now(),
        result = await probe(c);
      trace(
        ctx,
        "provider.probe",
        c.name,
        result.connected ? "complete" : "unavailable",
        start,
      );
      return json(result);
    }
  }
  if (section !== "playground") return;
  if (req.method !== "POST")
    fail(405, "method_not_allowed", "Playground requests use POST.");
  const data = await body(
    req,
    z.object({
      connection_id: z.string(),
      operation: z.string(),
      input: z.record(z.string(), z.unknown()).default({}),
    }),
  );
  const c = connection(data.connection_id);
  if (!c) fail(404, "not_found", "Connection not found.");
  const start = now();
  try {
    if (c.kind === "abi") {
      const args =
        data.operation === "snapshot"
          ? ["dashboard", "--once", "--json"]
          : data.operation === "backends"
            ? ["backends"]
            : undefined;
      if (!args) fail(400, "invalid_operation", "Choose snapshot or backends.");
      if (!c.binary)
        fail(
          503,
          "connection_unconfigured",
          "The operator has not configured an ABI executable.",
        );
      const result = await new Promise<{ stdout: string; stderr: string }>(
        (resolve, reject) =>
          execFile(
            c.binary!,
            args,
            {
              timeout: 10000,
              maxBuffer: 1024 * 1024,
              env: { ...process.env, ABI_WDBX_PERSIST: "0" },
            },
            (error, stdout, stderr) =>
              error ? reject(error) : resolve({ stdout, stderr }),
          ),
      );
      let output: unknown = result.stdout || result.stderr;
      try {
        output = JSON.parse(String(output));
      } catch {}
      trace(ctx, `abi.${data.operation}`, c.name, "complete", start);
      return json({ result: output });
    }
    if (c.kind !== "wdbx")
      fail(
        400,
        "invalid_connection",
        "Choose ABI or WDBX for service requests.",
      );
    binding(c, ctx);
    const schema = schemas[data.operation];
    if (!schema)
      fail(
        400,
        "invalid_operation",
        "This operation is not exposed by the playground.",
      );
    const input = schema.safeParse(data.input);
    if (!input.success)
      fail(
        400,
        "invalid_input",
        input.error.issues
          .map((i) => `${i.path.join(".")}: ${i.message}`)
          .join("; "),
      );
    let requestInput: unknown = input.data;
    if (data.operation === "TextSearch") {
      const textInput = input.data as { text: string; limit: number };
      try {
        requestInput = {
          query: (await embed([textInput.text])).vectors[0],
          limit: textInput.limit,
        };
      } catch {
        fail(
          503,
          "embedding_unavailable",
          "Install the pinned local embedding model before text-to-vector search.",
        );
      }
    }
    const { api, metadata } = client(c);
    try {
      const output = await new Promise<unknown>((resolve, reject) => {
        const method = api[
          data.operation === "TextSearch" ? "Search" : data.operation
        ] as (
          input: unknown,
          meta: grpc.Metadata,
          options: grpc.CallOptions,
          callback: (err: Error | null, value: unknown) => void,
        ) => void;
        method.call(
          api,
          requestInput,
          metadata,
          { deadline: Date.now() + 10000 },
          (err, value) => (err ? reject(err) : resolve(value)),
        );
      });
      trace(ctx, `wdbx.${data.operation}`, c.name, "complete", start);
      return json({ result: output });
    } finally {
      api.close();
    }
  } catch (e) {
    trace(ctx, `${c.kind}.${data.operation}`, c.name, "failed", start);
    if (e instanceof Error && "status" in e) throw e;
    fail(
      502,
      "service_unavailable",
      "The service request failed. Check the configured address, credentials, and service status.",
    );
  }
}
export function mutationEvents(
  req: Request,
  connectionId: string,
  ctx: Context,
) {
  const c = connection(connectionId);
  if (!c || c.kind !== "wdbx")
    fail(404, "not_found", "WDBX connection not found.");
  binding(c, ctx);
  const { api, metadata } = client(c);
  const method = api.WatchMutations as (
    input: unknown,
    metadata: grpc.Metadata,
    options: grpc.CallOptions,
  ) => grpc.ClientReadableStream<unknown>;
  const call = method.call(api, {}, metadata, { deadline: Date.now() + 60000 });
  let closed = false;
  const stream = new ReadableStream({
    start(controller) {
      const enc = new TextEncoder();
      function end() {
        if (closed) return;
        closed = true;
        call.cancel();
        api.close();
        try {
          controller.close();
        } catch {}
      }
      call.on("data", (event) => {
        if (!closed)
          controller.enqueue(
            enc.encode(`event: mutation\ndata: ${JSON.stringify(event)}\n\n`),
          );
      });
      call.on("error", () => {
        if (!closed)
          controller.enqueue(
            enc.encode(
              'event: error\ndata: {"message":"Mutation stream disconnected."}\n\n',
            ),
          );
        end();
      });
      call.on("end", end);
      req.signal.addEventListener("abort", end, { once: true });
    },
    cancel() {
      closed = true;
      call.cancel();
      api.close();
    },
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}
