import {
  mkdtempSync,
  writeFileSync,
  readFileSync,
  rmSync,
  mkdirSync,
  existsSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawn, execFileSync } from "node:child_process";
import { createServer, type Socket } from "node:net";
import { connect as tlsConnect } from "node:tls";
import { randomBytes } from "node:crypto";
import assert from "node:assert/strict";
import { releaseSource } from "./release-source";
const root = mkdtempSync(join(tmpdir(), "mlai-live-"));
process.env.MLAI_DATA_DIR = root;
process.env.APP_URL = "http://127.0.0.1:3199";
const abi =
  process.env.MLAI_ABI_BINARY ||
  "/Users/donaldfilimon/dev/active/abi/target/debug/abi";
const gateway =
  process.env.MLAI_WDBX_BINARY ||
  "/Users/donaldfilimon/dev/active/abi/target/debug/abi-wdbx-gateway";
if (!existsSync(abi) || !existsSync(gateway))
  throw new Error(
    "Set MLAI_ABI_BINARY and MLAI_WDBX_BINARY to existing local executables.",
  );
async function freePort() {
  const server = createServer();
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
  const port = (server.address() as { port: number }).port;
  await new Promise<void>((r) => server.close(() => r()));
  return port;
}
const grpc = await freePort(),
  events = await freePort();
writeFileSync(join(root, "gateway-token"), randomBytes(32).toString("hex"), {
  mode: 0o600,
});
writeFileSync(join(root, "bad-token"), "invalid-local-test-token", {
  mode: 0o600,
});
const registry = [
  {
    id: "mlx",
    name: "MLX Core",
    kind: "local",
    url: process.env.MLAI_MODEL_URL || "http://127.0.0.1:8080/v1",
    model:
      process.env.MLAI_MODEL_ID || "mlx-community/Llama-3.2-3B-Instruct-4bit",
  },
  { id: "abi", name: "Local ABI", kind: "abi", binary: abi },
  {
    id: "wdbx",
    name: "Dedicated WDBX",
    kind: "wdbx",
    url: `127.0.0.1:${grpc}`,
    tokenFile: join(root, "gateway-token"),
  },
  {
    id: "bad",
    name: "Bad credentials test",
    kind: "wdbx",
    url: `127.0.0.1:${grpc}`,
    tokenFile: join(root, "bad-token"),
  },
];
writeFileSync(join(root, "connections.json"), JSON.stringify(registry), {
  mode: 0o600,
});
const { auth } = await import("../src/lib/server/auth");
const { dispatch } = await import("../src/lib/server/api");
const { all, one, run, sqlite } = await import("../src/lib/server/db");
const children: ReturnType<typeof spawn>[] = [];
const fixtureSockets = new Set<Socket>();
let blackhole: ReturnType<typeof createServer> | undefined;
const results: Record<string, unknown> = {
  checkedAt: new Date().toISOString(),
  source: releaseSource(),
  hostedLive: "unverified: no hosted credentials provided",
};
function start(command: string, args: string[]) {
  const child = spawn(command, args, {
    env: process.env,
    stdio: ["ignore", "ignore", "pipe"],
  });
  let diagnostics = "";
  child.stderr?.on(
    "data",
    (b) => (diagnostics = (diagnostics + b.toString()).slice(-1500)),
  );
  child.on("exit", (code) => {
    if (code) console.error("Fixture service exited:", diagnostics);
  });
  children.push(child);
  return child;
}
async function until(fn: () => boolean | Promise<boolean>, timeout = 30000) {
  const started = Date.now();
  while (!(await fn())) {
    if (Date.now() - started > timeout)
      throw new Error("Verification deadline exceeded.");
    await new Promise((r) => setTimeout(r, 200));
  }
}
try {
  start(gateway, [
    "--grpc",
    `127.0.0.1:${grpc}`,
    "--events",
    `127.0.0.1:${events}`,
    "--store",
    join(root, "test.wdbx"),
    "--token-file",
    join(root, "gateway-token"),
  ]);
  const response = await auth.handler(
    new Request(`${process.env.APP_URL}/api/auth/sign-up/email`, {
      method: "POST",
      headers: {
        Origin: process.env.APP_URL!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Integration fixture",
        email: "integration@example.test",
        password: randomBytes(24).toString("base64url"),
      }),
    }),
  );
  assert.equal(response.status, 200);
  const user = (await response.json()).user;
  const cookie = response.headers
    .getSetCookie()
    .map((c) => c.split(";")[0])
    .join("; ");
  const workspace = one<{ workspace_id: string }>(
    "SELECT workspace_id FROM memberships WHERE user_id=?",
    user.id,
  )!.workspace_id;
  async function req(
    path: string,
    method = "GET",
    body?: unknown,
    raw?: string,
    signal?: AbortSignal,
  ) {
    return dispatch(
      new Request(`${process.env.APP_URL}/api/v1/${path}`, {
        method,
        headers: {
          Cookie: cookie,
          Origin: process.env.APP_URL!,
          "X-Workspace-ID": workspace,
          "Content-Type": raw ? "application/octet-stream" : "application/json",
          ...(raw ? { "X-File-Name": "review.md" } : {}),
        },
        body: raw || (body === undefined ? undefined : JSON.stringify(body)),
        signal,
      }),
      path.split("?")[0].split("/"),
    );
  }
  async function api(path: string, method = "GET", body?: unknown) {
    const r = await req(path, method, body);
    const json = await r.json();
    assert.ok(r.ok, JSON.stringify(json));
    return json;
  }
  await api("connections/wdbx/bind", "POST", {});
  const playground = (
    operation: string,
    input: unknown = {},
    connection_id = "wdbx",
  ) => api("playground", "POST", { connection_id, operation, input });
  await until(async () => {
    try {
      await playground("Stats");
      return true;
    } catch {
      return false;
    }
  });
  const stats = await playground("Stats");
  assert.equal(stats.result.vectors, "0");
  const vector = await playground("PutVector", {
    vectors: [{ values: [0.1, 0.2, 0.3] }],
  });
  assert.equal(vector.result.ids.length, 1);
  const search = await playground("Search", {
    query: [0.1, 0.2, 0.3],
    limit: 1,
  });
  assert.equal(search.result.hits.length, 1);
  await playground("PutKv", { entries: [{ key: "review", value: "Friday" }] });
  assert.equal(
    (await playground("GetKv", { key: "review" })).result.value,
    "Friday",
  );
  const abortEvents = new AbortController(),
    eventResponse = await req(
      "connections/wdbx/events",
      "GET",
      undefined,
      undefined,
      abortEvents.signal,
    ),
    reader = eventResponse.body!.getReader();
  await new Promise((r) => setTimeout(r, 250));
  await playground("PutKv", { entries: [{ key: "event", value: "observed" }] });
  const event = await reader.read();
  assert.match(new TextDecoder().decode(event.value), /event: mutation/);
  abortEvents.abort();
  await reader.cancel();
  const bad = await req("playground", "POST", {
    connection_id: "bad",
    operation: "Stats",
    input: {},
  });
  assert.equal(bad.status, 502);
  results.wdbx = {
    stats: true,
    vectorInsertSearch: true,
    keyValue: true,
    mutationEvents: true,
    badCredentialsRejected: true,
    store: "dedicated temporary store",
  };
  console.log("PASS dedicated WDBX operations and bad credentials");
  const diagnostics = await playground("snapshot", {}, "abi");
  assert.equal(diagnostics.result.type, "abi.dashboard");
  assert.equal(
    (
      await req("playground", "POST", {
        connection_id: "abi",
        operation: "shell",
        input: {},
      })
    ).status,
    400,
  );
  results.abi = {
    diagnosticType: diagnostics.result.type,
    arbitraryCommandRejected: true,
  };
  console.log("PASS real ABI snapshot");
  const document = await (
    await req(
      "documents",
      "POST",
      undefined,
      "# MLAI review\n\nThe architecture review is due Friday. Morgan owns the review.\n\nThe project uses Rust and keeps document source references.",
    )
  ).json();
  assert.ok(document.id);
  // Simulate an interrupted lease before starting a new worker.
  run(
    "UPDATE jobs SET status='running',worker_id='interrupted-fixture',lease_until=1 WHERE document_id=?",
    document.id,
  );
  start(process.execPath, ["--import", "tsx", "scripts/worker.ts"]);
  await until(
    () =>
      !!one(
        "SELECT id FROM documents WHERE id=? AND status IN ('ready','partial')",
        document.id,
      ),
    120000,
  );
  assert.ok(
    one(
      "SELECT e.chunk_id FROM embeddings e JOIN chunks c ON c.id=e.chunk_id WHERE c.document_id=?",
      document.id,
    ),
  );
  const retrieved = await api("search?q=When%20is%20the%20review%20due");
  assert.equal(retrieved.mode, "hybrid");
  assert.ok(retrieved.results.length);
  results.documents = { restartRecovery: true, semanticIndex: true };
  console.log("PASS worker recovery and local semantic indexing");
  const conversation = await api("conversations", "POST", {});
  const generated = await req(`chat/${conversation.id}`, "POST", {
    message:
      "What day is the architecture review due? Answer one sentence and cite the source using [1] or the correct supplied source number.",
    document_ids: [document.id],
  });
  assert.equal(generated.status, 200);
  const stream = await generated.text();
  assert.match(stream, /event: delta/);
  assert.match(stream, /event: done/);
  const messages = (await api(`conversations/${conversation.id}`)).messages;
  const answer = messages.at(-1);
  assert.equal(answer.status, "complete");
  assert.match(answer.content, /Friday/i);
  assert.ok(answer.citations.length);
  for (const citation of answer.citations) {
    const source = await api(
      `documents/${document.id}/source?chunk=${citation.id}`,
    );
    assert.ok(source.content);
    assert.deepEqual(source.location, citation.location);
  }
  results.localChat = {
    model: registry[0].model,
    streamed: true,
    groundedAnswer: true,
    citationsResolved: true,
  };
  console.log("PASS real MLX streamed answer with resolved citations");
  const cancelConversation = await api("conversations", "POST", {}),
    cancel = new AbortController();
  const cancelling = await req(
    `chat/${cancelConversation.id}`,
    "POST",
    {
      message:
        "Write a long, detailed technical explanation of 30 different graph algorithms.",
    },
    undefined,
    cancel.signal,
  );
  assert.equal(cancelling.status, 200);
  const rr = cancelling.body!.getReader();
  let received = "";
  while (!received.includes("event: delta")) {
    const part = await rr.read();
    assert.ok(!part.done);
    received += new TextDecoder().decode(part.value);
  }
  cancel.abort();
  await rr.cancel();
  await until(
    () =>
      !!one(
        "SELECT id FROM messages WHERE conversation_id=? AND role='assistant' AND status='cancelled'",
        cancelConversation.id,
      ),
  );
  (results.localChat as Record<string, unknown>).cancelled = true;
  console.log("PASS real MLX cancellation");
  const insight = await api(`documents/${document.id}/interpret`, "POST", {
    kind: "action_items",
  });
  await until(
    () =>
      !!one(
        "SELECT id FROM jobs WHERE id=? AND status='complete'",
        insight.jobId,
      ),
    120000,
  );
  assert.ok(one("SELECT id FROM insights WHERE document_id=?", document.id));
  (results.documents as Record<string, unknown>).persistentInterpretation =
    true;
  const backup = join(root, "backup"),
    restored = join(root, "restored");
  execFileSync(
    process.execPath,
    ["--import", "tsx", "scripts/backup.ts", backup],
    { env: process.env, stdio: "pipe" },
  );
  execFileSync(
    process.execPath,
    ["--import", "tsx", "scripts/restore.ts", backup, restored],
    { env: process.env, stdio: "pipe" },
  );
  execFileSync(
    process.execPath,
    ["--import", "tsx", "scripts/verify-restored.ts"],
    {
      env: { ...process.env, MLAI_DATA_DIR: restored },
      input: JSON.stringify({
        cookie,
        workspace,
        document: document.id,
        conversation: conversation.id,
      }),
      stdio: ["pipe", "pipe", "pipe"],
      timeout: 120000,
    },
  );
  results.restore = {
    separateInstallation: true,
    accountSession: true,
    documentDownload: true,
    customerWorkflow: true,
    groundedChat: true,
  };
  console.log("PASS restored installation customer and AI workflows");
  await api(`documents/${document.id}`, "DELETE");
  assert.equal(
    one("SELECT id FROM chunks WHERE document_id=?", document.id),
    undefined,
  );
  assert.equal(
    one("SELECT id FROM insights WHERE document_id=?", document.id),
    undefined,
  );
  assert.equal(existsSync(join(root, "documents", document.id)), false);
  assert.equal(
    (await api(`conversations/${conversation.id}`)).messages.at(-1).citations[0]
      .removed,
    true,
  );
  (results.documents as Record<string, unknown>).completeDeletion = true;
  console.log("PASS persistent insight and complete source deletion");
  // Verify TLS identity and mandatory client certificates on another isolated store.
  for (const args of [
    [
      "req",
      "-x509",
      "-newkey",
      "rsa:2048",
      "-nodes",
      "-keyout",
      join(root, "ca.key"),
      "-out",
      join(root, "ca.crt"),
      "-days",
      "1",
      "-subj",
      "/CN=MLAI Integration CA",
    ],
    [
      "req",
      "-newkey",
      "rsa:2048",
      "-nodes",
      "-keyout",
      join(root, "server.key"),
      "-out",
      join(root, "server.csr"),
      "-subj",
      "/CN=localhost",
    ],
    [
      "req",
      "-newkey",
      "rsa:2048",
      "-nodes",
      "-keyout",
      join(root, "client.key"),
      "-out",
      join(root, "client.csr"),
      "-subj",
      "/CN=MLAI Integration Client",
    ],
  ])
    execFileSync("openssl", args, { stdio: "ignore" });
  writeFileSync(
    join(root, "server.ext"),
    "subjectAltName=DNS:localhost,IP:127.0.0.1\nextendedKeyUsage=serverAuth\n",
  );
  writeFileSync(join(root, "client.ext"), "extendedKeyUsage=clientAuth\n");
  for (const name of ["server", "client"])
    execFileSync(
      "openssl",
      [
        "x509",
        "-req",
        "-in",
        join(root, `${name}.csr`),
        "-CA",
        join(root, "ca.crt"),
        "-CAkey",
        join(root, "ca.key"),
        "-CAcreateserial",
        "-out",
        join(root, `${name}.crt`),
        "-days",
        "1",
        "-extfile",
        join(root, `${name}.ext`),
      ],
      { stdio: "ignore" },
    );
  const tlsPort = await freePort(),
    tlsEvents = await freePort();
  start(gateway, [
    "--grpc",
    `127.0.0.1:${tlsPort}`,
    "--events",
    `127.0.0.1:${tlsEvents}`,
    "--store",
    join(root, "tls.wdbx"),
    "--token-file",
    join(root, "gateway-token"),
    "--tls-cert",
    join(root, "server.crt"),
    "--tls-key",
    join(root, "server.key"),
    "--client-ca",
    join(root, "ca.crt"),
  ]);
  const secure = {
    id: "secure",
    name: "mTLS fixture",
    kind: "wdbx",
    url: `localhost:${tlsPort}`,
    tokenFile: join(root, "gateway-token"),
    caFile: join(root, "ca.crt"),
    certFile: join(root, "client.crt"),
    keyFile: join(root, "client.key"),
  };
  const noClient = {
    ...secure,
    id: "no-client",
    certFile: undefined,
    keyFile: undefined,
  };
  writeFileSync(
    join(root, "connections.json"),
    JSON.stringify([...registry, secure, noClient]),
    { mode: 0o600 },
  );
  await new Promise((r) => setTimeout(r, 700));
  await new Promise<void>((resolve, reject) => {
    const socket = tlsConnect(
      {
        host: "127.0.0.1",
        port: tlsPort,
        servername: "localhost",
        ca: readFileSync(join(root, "ca.crt")),
        cert: readFileSync(join(root, "client.crt")),
        key: readFileSync(join(root, "client.key")),
        ALPNProtocols: ["h2"],
      },
      () => {
        socket.destroy();
        resolve();
      },
    );
    socket.on("error", reject);
    socket.setTimeout(5000, () => {
      socket.destroy();
      reject(new Error("TLS handshake timed out"));
    });
  });
  await api("connections/secure/bind", "POST", {});
  await playground("Stats", {}, "secure");
  assert.equal(
    (
      await req("playground", "POST", {
        connection_id: "no-client",
        operation: "Stats",
        input: {},
      })
    ).status,
    502,
  );
  (results.wdbx as Record<string, unknown>).tlsAndMtls = true;
  blackhole = createServer((socket) => {
    fixtureSockets.add(socket);
    socket.on("error", () => {});
    socket.on("close", () => fixtureSockets.delete(socket));
  });
  await new Promise<void>((r) => blackhole!.listen(0, "127.0.0.1", r));
  const blackholePort = (blackhole.address() as { port: number }).port;
  writeFileSync(
    join(root, "connections.json"),
    JSON.stringify([
      ...registry,
      {
        id: "timeout",
        name: "Timeout fixture",
        kind: "wdbx",
        url: `127.0.0.1:${blackholePort}`,
        tokenFile: join(root, "gateway-token"),
      },
    ]),
    { mode: 0o600 },
  );
  await api("connections/timeout/bind", "POST", {});
  const timeoutStart = Date.now();
  assert.equal(
    (
      await req("playground", "POST", {
        connection_id: "timeout",
        operation: "Stats",
        input: {},
      })
    ).status,
    502,
  );
  assert.ok(
    Date.now() - timeoutStart >= 9000 && Date.now() - timeoutStart < 15000,
  );
  for (const socket of fixtureSockets) socket.destroy();
  await new Promise<void>((resolve) => blackhole!.close(() => resolve()));
  (results.wdbx as Record<string, unknown>).boundedTimeout = true;
  children[0].kill("SIGTERM");
  await new Promise((r) => setTimeout(r, 400));
  assert.equal(
    (
      await req("playground", "POST", {
        connection_id: "wdbx",
        operation: "Stats",
        input: {},
      })
    ).status,
    502,
  );
  (results.wdbx as Record<string, unknown>).disconnectionReported = true;
  console.log("PASS gateway TLS/mTLS, timeout and disconnection");
  results.traces = {
    actualRequests: all("SELECT id FROM traces").length,
    promptFree: true,
  };
  mkdirSync("docs/verification", { recursive: true });
  assert.equal(
    releaseSource().runtimeSourceSha256,
    (results.source as ReturnType<typeof releaseSource>).runtimeSourceSha256,
    "Source changed during integration verification; rerun against the final source.",
  );
  writeFileSync(
    "docs/verification/local-integrations.json",
    JSON.stringify(results, null, 2) + "\n",
  );
} finally {
  for (const socket of fixtureSockets) socket.destroy();
  blackhole?.close();
  for (const child of children) child.kill("SIGTERM");
  await new Promise((r) => setTimeout(r, 1200));
  for (const child of children)
    if (child.exitCode === null) child.kill("SIGKILL");
  sqlite.close();
  rmSync(root, { recursive: true, force: true });
}
