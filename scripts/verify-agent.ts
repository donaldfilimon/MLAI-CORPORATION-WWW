import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import {
  fixtureAccount,
  fixtureApi,
  fixtureJson,
  startFixtureRun,
  startFixtureWorker,
  stopFixtureWorker,
  waitFor,
  waitRun,
} from "./agent-verification";
import { releaseSource } from "./release-source";

const modelUrl = process.env.MLAI_MODEL_URL,
  modelId = process.env.MLAI_MODEL_ID;
if (!modelUrl || !modelId)
  throw new Error(
    "Set MLAI_MODEL_URL and MLAI_MODEL_ID to the explicitly selected local model.",
  );
const url = new URL(modelUrl);
assert.ok(
  ["127.0.0.1", "localhost", "[::1]"].includes(url.hostname),
  "Agent verification requires a loopback model.",
);
const source = releaseSource();
const fixture = mkdtempSync(join(tmpdir(), "mlai-agent-live-")),
  data = join(fixture, "data");
mkdirSync(data, { mode: 0o700 });
process.env.MLAI_DATA_DIR = data;
process.env.APP_URL = "http://127.0.0.1:3198";
process.env.MLAI_CONNECTIONS_FILE = join(data, "connections.json");
writeFileSync(
  process.env.MLAI_CONNECTIONS_FILE,
  JSON.stringify([
    {
      id: "agent-local",
      name: "Explicit local agent verification",
      kind: "local",
      url: modelUrl,
      model: modelId,
    },
  ]),
  { mode: 0o600 },
);
const { one, run, sqlite } = await import("../src/lib/server/db");
let worker: ReturnType<typeof startFixtureWorker> | undefined;
try {
  const requester = await fixtureAccount("agent-live"),
    peer = await fixtureAccount("agent-peer");
  run(
    "INSERT INTO memberships(workspace_id,user_id,role) VALUES(?,?,'member')",
    requester.workspace,
    peer.userId,
  );
  worker = startFixtureWorker();
  const uploaded = await fixtureApi(
    requester,
    "documents",
    "POST",
    undefined,
    "# Architecture review\n\nMorgan owns the architecture review. The review deadline is Friday. The next action is to check the persistence recovery checklist.",
  );
  assert.equal(uploaded.status, 201);
  const docId = z.object({ id: z.string() }).parse(await uploaded.json()).id;
  const documentSchema = z.object({
    status: z.string(),
    jobs: z.array(z.object({ id: z.string(), status: z.string() })).optional(),
  });
  await waitFor(
    async () =>
      documentSchema.parse(await fixtureJson(requester, `documents/${docId}`)),
    (d) => ["ready", "partial"].includes(d.status),
    "source extraction",
  );
  console.log("PASS isolated fixture extraction through actual worker");
  const investigation = await startFixtureRun(
    requester,
    "Search the selected source for architecture review. Then answer who owns the review and its deadline, citing the source. Use search_documents to obtain evidence before answering.",
    [docId],
  );
  const answer = await waitRun(requester, investigation.id, "completed");
  const sourced = answer.results.find((r) => r.kind === "answer");
  assert.ok(sourced);
  assert.match(sourced.content, /Friday/i);
  assert.match(sourced.content, /Morgan/i);
  assert.ok(
    sourced.citations.some((c) => c.documentId === docId && !c.removed),
  );
  console.log("PASS real local investigation and authorized citations");
  const name = `Verified agent ${randomBytes(6).toString("hex")}`;
  const proposed = await startFixtureRun(
    requester,
    `Create one project named "${name}" with description "Architecture review". Propose create_project, wait for confirmation, then report the completed result.`,
  );
  const pending = await waitRun(requester, proposed.id, "awaiting_approval");
  assert.equal(pending.actions[0].tool, "create_project");
  assert.equal(
    one<{ n: number }>(
      "SELECT count(*) n FROM projects WHERE workspace_id=? AND name=?",
      requester.workspace,
      name,
    )!.n,
    0,
  );
  await fixtureJson(
    requester,
    `agent/actions/${pending.actions[0].id}/confirm`,
    "POST",
    {},
  );
  await waitRun(requester, proposed.id, "completed");
  await fixtureJson(
    requester,
    `agent/actions/${pending.actions[0].id}/confirm`,
    "POST",
    {},
  );
  assert.equal(
    one<{ n: number }>(
      "SELECT count(*) n FROM projects WHERE workspace_id=? AND name=?",
      requester.workspace,
      name,
    )!.n,
    1,
  );
  console.log("PASS real proposed project and exactly-once confirmed write");
  const interpretation = await startFixtureRun(
    requester,
    `Request an action_items interpretation of document ${docId}. Use interpret_documents with kind action_items. After confirmation, report that its job was queued; do not claim its interpretation is complete.`,
    [docId],
  );
  const interpretPending = await waitRun(
    requester,
    interpretation.id,
    "awaiting_approval",
  );
  assert.equal(interpretPending.actions[0].tool, "interpret_documents");
  await fixtureJson(
    requester,
    `agent/actions/${interpretPending.actions[0].id}/confirm`,
    "POST",
    {},
  );
  const interpretDone = await waitRun(
    requester,
    interpretation.id,
    "completed",
  );
  const jobId = interpretDone.results.find(
    (r) => r.kind === "write",
  )?.resource_id;
  assert.ok(jobId);
  await waitFor(
    async () =>
      documentSchema.parse(await fixtureJson(requester, `documents/${docId}`)),
    (d) =>
      d.jobs?.some((j) => j.id === jobId && j.status === "complete") === true,
    "real interpretation",
  );
  assert.ok(
    one(
      "SELECT id FROM insights WHERE document_id=? AND kind='action_items'",
      docId,
    ),
  );
  console.log("PASS real approved interpretation job and persisted completion");
  const restoreName = `Restored agent ${randomBytes(6).toString("hex")}`;
  const restoreRun = await startFixtureRun(
    requester,
    `Create one project named "${restoreName}". Propose create_project, wait for confirmation, and report its success only after execution.`,
  );
  const restorePending = await waitRun(
    requester,
    restoreRun.id,
    "awaiting_approval",
  );
  const backup = join(fixture, "backup"),
    restored = join(fixture, "restored");
  await stopFixtureWorker(worker);
  worker = undefined;
  execFileSync(
    process.execPath,
    ["--import", "tsx", "scripts/backup.ts", backup],
    {
      env: process.env,
      stdio: ["ignore", "ignore", "inherit"],
      timeout: 60_000,
    },
  );
  execFileSync(
    process.execPath,
    ["--import", "tsx", "scripts/restore.ts", backup, restored],
    {
      env: process.env,
      stdio: ["ignore", "ignore", "inherit"],
      timeout: 60_000,
    },
  );
  execFileSync(
    process.execPath,
    ["--import", "tsx", "scripts/verify-agent-restored.ts"],
    {
      env: {
        ...process.env,
        MLAI_DATA_DIR: restored,
        MLAI_CONNECTIONS_FILE: join(restored, "connections.json"),
      },
      input: JSON.stringify({
        requester,
        peer,
        runId: restoreRun.id,
        actionId: restorePending.actions[0].id,
        projectName: restoreName,
        documentId: docId,
      }),
      stdio: ["pipe", "inherit", "inherit"],
      timeout: 360_000,
    },
  );
  assert.equal(
    releaseSource().runtimeSourceSha256,
    source.runtimeSourceSha256,
    "Source changed during agent verification; rerun after source freeze.",
  );
  const receipt = {
    checkedAt: new Date().toISOString(),
    source,
    provider: { kind: "local", model: modelId },
    extraction: true,
    investigation: true,
    authorizedCitations: true,
    proposedProject: true,
    confirmationWritesExactlyOnce: true,
    interpretationQueuedAndCompleted: true,
    restoredPendingProposal: true,
    restoredRequesterAuthorization: true,
    restoredIdempotency: true,
    restoredSourceDownload: true,
    restoredCustomerWorkflow: true,
    hostedLive: "unverified: no hosted credentials supplied",
  };
  mkdirSync(resolve("docs/verification"), { recursive: true });
  writeFileSync(
    resolve("docs/verification/agent-live.json"),
    JSON.stringify(receipt, null, 2) + "\n",
  );
  console.log("PASS live agent and separate restored-installation acceptance");
} finally {
  if (worker) await stopFixtureWorker(worker);
  sqlite.close();
  rmSync(fixture, { recursive: true, force: true });
}
