import "./env";
import { acquireAgentRun, processAgentRun } from "../src/lib/server/agent-runtime";
import { processAgentInterpretation } from "../src/lib/server/agent-jobs";
import { invalidateAgentSources } from "../src/lib/server/agent-store";
import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { mkdirSync, readFileSync, rmSync, copyFileSync } from "node:fs";
import { all, one, run, sqlite } from "../src/lib/server/db";
import { runInterpretation } from "../src/lib/server/documents";
import { ApiError, fail, type Context } from "../src/lib/server/http";
import { embed, stopOwnedProcess } from "../src/lib/server/embeddings";
import { dataDir, uploadsDir } from "../src/lib/server/config";
import { validateModelSelection, type ModelSelection } from "../src/lib/server/models";

interface Job {
  kind: string;
  payload: string;
  id: string;
  document_id: string;
  extension: string;
  workspace_id: string;
  attempts: number;
}
interface Extraction {
  chunks: { content: string; location: Record<string, unknown> }[];
  text: string;
  tables: unknown[];
  outline: string[];
  warnings: string[];
  parser: string;
  version: string;
}
const leaseMs = 30_000;
function requireJob(job: Job, workerId: string) {
  const current = one<{ status: string }>(
    "SELECT d.status FROM jobs j JOIN documents d ON d.id=j.document_id WHERE j.id=? AND j.worker_id=? AND j.attempts=? AND j.status='running' AND j.lease_until>? AND d.workspace_id=?",
    job.id, workerId, job.attempts, Date.now(), job.workspace_id,
  );
  if (!current) fail(409, "lease_lost", "Document execution no longer owns this job.");
  if (job.kind === "interpret" ? !["ready", "partial"].includes(current.status) : current.status !== "processing")
    fail(409, "source_changed", "The source is no longer available for processing.");
  const agent = one<{ status: string; selection: string; workspace_id: string }>(
    "SELECT r.status,r.selection,r.workspace_id FROM agent_jobs aj JOIN agent_runs r ON r.id=aj.run_id WHERE aj.job_id=?", job.id,
  );
  if (agent) {
    if (["cancelled", "failed"].includes(agent.status) || agent.workspace_id !== job.workspace_id)
      fail(409, "agent_stopped", "The requesting agent run has stopped.");
    validateModelSelection(job.workspace_id, JSON.parse(agent.selection) as ModelSelection);
  }
}
export function acquireDocumentJob(workerId: string): Job | undefined {
  return sqlite.transaction(() => {
    run("UPDATE jobs SET status='queued',worker_id=NULL,lease_until=NULL WHERE status='running' AND lease_until<=?", Date.now());
    run("UPDATE jobs SET status='cancelled',worker_id=NULL,lease_until=NULL WHERE status IN ('queued','running') AND id IN (SELECT aj.job_id FROM agent_jobs aj JOIN agent_runs r ON r.id=aj.run_id WHERE r.status IN ('failed','cancelled'))");
    const job = one<Job>(
      "SELECT j.id,j.document_id,j.kind,j.payload,j.attempts,d.extension,d.workspace_id FROM jobs j JOIN documents d ON d.id=j.document_id WHERE j.status='queued' AND d.status!='cancelled' ORDER BY j.created_at,j.rowid LIMIT 1",
    );
    if (!job) return;
    run("UPDATE jobs SET status='running',worker_id=?,lease_until=?,attempts=attempts+1,error=NULL WHERE id=?", workerId, Date.now() + leaseMs, job.id);
    if (job.kind !== "interpret")
      run("UPDATE documents SET status='processing',progress='Extracting content and recognizing text',updated_at=? WHERE id=?", Date.now(), job.document_id);
    return { ...job, attempts: job.attempts + 1 };
  }).immediate();
}
async function parseDocument(job: Job, output: string, signal: AbortSignal) {
  signal.throwIfAborted();
  const python = resolve("worker/.venv/bin/python"), sandbox = process.platform === "darwin";
  const child = spawn(sandbox ? "/usr/bin/sandbox-exec" : python, [
    ...(sandbox ? ["-p", "(version 1)(allow default)(deny network*)", python] : []),
    "worker/extract.py", join(uploadsDir, job.document_id, `original.${job.extension}`), output,
  ], {
    detached: process.platform !== "win32", stdio: ["ignore", "ignore", "ignore"],
    env: { ...process.env, HF_HUB_DISABLE_PROGRESS_BARS: "1", TOKENIZERS_PARALLELISM: "false" },
  });
  const abort = () => stopOwnedProcess(child);
  signal.addEventListener("abort", abort, { once: true });
  try {
    const code = await new Promise<number | null>((resolvePromise, reject) => {
      child.once("error", reject);
      // Descendants share the group even when the parser exits before them.
      child.once("exit", () => stopOwnedProcess(child));
      child.once("close", resolvePromise);
      if (signal.aborted) abort();
    });
    signal.throwIfAborted();
    if (code !== 0) throw new Error("Document parsing failed.");
    const result = JSON.parse(readFileSync(output, "utf8")) as Extraction;
    if (!Array.isArray(result.chunks) || !result.chunks.length || !Array.isArray(result.warnings) || !Array.isArray(result.tables))
      throw new Error("No readable content was extracted.");
    return result;
  } finally { signal.removeEventListener("abort", abort); }
}
async function processExtraction(job: Job, workerId: string, signal: AbortSignal) {
  // An attempt-specific directory prevents a stale worker from deleting a new lease's output.
  const tmp = join(dataDir, "tmp", `${job.id}-${job.attempts}-${workerId}`);
  mkdirSync(tmp, { recursive: true, mode: 0o700 });
  try {
    const output = join(tmp, "result.json"), result = await parseDocument(job, output, signal);
    signal.throwIfAborted(); requireJob(job, workerId);
    let semantic: Awaited<ReturnType<typeof embed>> | undefined;
    try {
      run("UPDATE documents SET progress='Building local semantic index' WHERE id=? AND status='processing'", job.document_id);
      semantic = await embed(result.chunks.map(c => c.content), signal);
    } catch {
      signal.throwIfAborted(); requireJob(job, workerId);
      result.warnings.push("Semantic embeddings are unavailable. Keyword search is enabled.");
    }
    sqlite.transaction(() => {
      signal.throwIfAborted(); requireJob(job, workerId);
      invalidateAgentSources(job.document_id, job.workspace_id);
      run("DELETE FROM chunks WHERE document_id=?", job.document_id);
      run("DELETE FROM insights WHERE document_id=? OR EXISTS (SELECT 1 FROM json_each(insights.citations) WHERE json_extract(value,'$.documentId')=?)", job.document_id, job.document_id);
      for (const [i, chunk] of result.chunks.entries()) {
        const chunkId = randomUUID();
        run("INSERT INTO chunks(id,document_id,workspace_id,ordinal,content,location) VALUES(?,?,?,?,?,?)", chunkId, job.document_id, job.workspace_id, i, chunk.content, JSON.stringify(chunk.location));
        if (semantic)
          run("INSERT INTO embeddings(chunk_id,space,vector) VALUES(?,?,?)", chunkId, semantic.space, JSON.stringify(semantic.vectors[i]));
      }
      copyFileSync(output, join(uploadsDir, job.document_id, "result.json"));
      run("UPDATE documents SET status=?,progress='Ready to search',warnings=?,metadata=?,updated_at=? WHERE id=?", result.warnings.length ? "partial" : "ready", JSON.stringify(result.warnings), JSON.stringify({parser:result.parser,version:result.version,chunks:result.chunks.length,tables:result.tables.length}), Date.now(), job.document_id);
      run("UPDATE jobs SET status='complete',worker_id=NULL,lease_until=NULL,error=NULL WHERE id=?", job.id);
    }).immediate();
  } finally { rmSync(tmp, { recursive: true, force: true }); }
}
async function processInterpretation(job: Job, workerId: string, signal: AbortSignal) {
  const data = JSON.parse(job.payload) as {kind: string; compare_with?: string[]; userId:string; selection?:ModelSelection; agentRunId?:string};
  if (data.agentRunId || one("SELECT job_id FROM agent_jobs WHERE job_id=?", job.id)) {
    await processAgentInterpretation(job.id, workerId, job.attempts, signal);
    return;
  }
  const member = one<{role:Context["role"]}>("SELECT role FROM memberships WHERE workspace_id=? AND user_id=?", job.workspace_id, data.userId);
  if (!member || member.role === "viewer") fail(403, "workspace_forbidden", "Membership no longer permits interpretation.");
  await runInterpretation({userId:data.userId,name:"",workspaceId:job.workspace_id,role:member.role,staff:false,apiKey:false}, job.document_id, {kind:data.kind,compare_with:data.compare_with}, signal, data.selection, () => {
    signal.throwIfAborted(); requireJob(job, workerId);
    run("UPDATE jobs SET status='complete',worker_id=NULL,lease_until=NULL,error=NULL WHERE id=? AND worker_id=? AND attempts=? AND status='running'", job.id, workerId, job.attempts);
  });
}
export async function processDocumentJob(job: Job, workerId: string, stopping: AbortSignal, timeoutMs: number) {
  const controller = new AbortController(), signal = AbortSignal.any([stopping, controller.signal]);
  const deadline = setTimeout(() => controller.abort(new DOMException("Document processing exceeded its time limit.", "TimeoutError")), timeoutMs);
  const heartbeat = setInterval(() => {
    try {
      signal.throwIfAborted(); requireJob(job, workerId);
      run("UPDATE jobs SET lease_until=? WHERE id=? AND worker_id=? AND attempts=? AND status='running' AND lease_until>?", Date.now()+leaseMs, job.id, workerId, job.attempts, Date.now());
    } catch (error) { controller.abort(error); }
  }, 1000);
  try {
    signal.throwIfAborted(); requireJob(job, workerId);
    if (job.kind === "interpret") await processInterpretation(job, workerId, signal);
    else await processExtraction(job, workerId, signal);
  } catch (error) {
    const timeout = signal.reason instanceof DOMException && signal.reason.name === "TimeoutError";
    const message = timeout ? "Processing exceeded its time limit. Try a smaller file." : error instanceof ApiError ? error.message : job.kind === "interpret" ? "Interpretation failed. Check source access and the selected provider." : "Document processing failed. Check the format and parser installation.";
    sqlite.transaction(() => {
      if (!one("SELECT id FROM jobs WHERE id=? AND status='running' AND worker_id=? AND attempts=? AND lease_until>?", job.id, workerId, job.attempts, Date.now())) return;
      run("UPDATE jobs SET status=?,error=?,worker_id=NULL,lease_until=NULL WHERE id=?", stopping.aborted ? "queued" : "failed", stopping.aborted ? null : message, job.id);
      if (job.kind !== "interpret")
        run("UPDATE documents SET status=?,progress=?,updated_at=? WHERE id=? AND status='processing'", stopping.aborted ? "queued" : "failed", stopping.aborted ? "Waiting for worker" : message, Date.now(), job.document_id);
    }).immediate();
  } finally { clearInterval(heartbeat); clearTimeout(deadline); controller.abort(); }
}
export async function runWorker(stopping: AbortSignal) {
  const workerId = randomUUID();
  const configuredSlots = Number(process.env.WORKER_CONCURRENCY || 2);
  const concurrency = Number.isFinite(configuredSlots) ? Math.max(1,Math.min(Math.floor(configuredSlots),4)) : 2;
  const configuredTimeout = Number(process.env.DOCUMENT_TIMEOUT_SECONDS || 300)*1000;
  const timeoutMs = Number.isFinite(configuredTimeout) && configuredTimeout > 0 ? configuredTimeout : 300000;
  const active = new Set<Promise<void>>();
  let preferAgent = false;
  function start(processing: Promise<void>) {
    const pending = processing.catch(() => { console.error("Worker task stopped before completion; its lease will recover."); }).finally(() => active.delete(pending));
    active.add(pending);
  }
  console.log(`MLAI worker started (${concurrency} shared slots).`);
  while (!stopping.aborted) {
    for (const cleanup of all<{id:string}>("SELECT id FROM artifact_cleanup LIMIT 20")) {
      try { rmSync(join(uploadsDir,cleanup.id),{recursive:true,force:true}); run("DELETE FROM artifact_cleanup WHERE id=?",cleanup.id); }
      catch { /* Retry after restart or when storage becomes writable. */ }
    }
    run("UPDATE messages SET status='interrupted' WHERE status='streaming' AND created_at<?",Date.now()-180000);
    while (!stopping.aborted && active.size < concurrency) {
      // Alternate the preferred queue across acquisitions, including single-slot workers.
      const agent = preferAgent ? acquireAgentRun(workerId) : undefined;
      if (agent) { preferAgent=false; start(processAgentRun(agent,workerId,stopping)); continue; }
      const job = acquireDocumentJob(workerId);
      if (job) { preferAgent=true; start(processDocumentJob(job,workerId,stopping,timeoutMs)); continue; }
      const next = !preferAgent ? acquireAgentRun(workerId) : undefined;
      if (!next) break;
      preferAgent=false; start(processAgentRun(next,workerId,stopping));
    }
    if (!stopping.aborted) await new Promise(resolve => setTimeout(resolve,250));
  }
  await Promise.all(active);
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const stopping = new AbortController();
  for (const signal of ["SIGINT", "SIGTERM"] as const) process.on(signal, () => stopping.abort());
  await runWorker(stopping.signal);
}
