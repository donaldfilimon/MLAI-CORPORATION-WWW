import "./env";
import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { join, resolve } from "node:path";
import {
  mkdirSync,
  readFileSync,
  writeFileSync,
  rmSync,
  existsSync,
  copyFileSync,
} from "node:fs";
import { all, one, run, sqlite } from "../src/lib/server/db";
import { runInterpretation } from "../src/lib/server/documents";
import type { Context } from "../src/lib/server/http";
import { embed } from "../src/lib/server/embeddings";
import { dataDir, uploadsDir } from "../src/lib/server/config";
const workerId = randomUUID(),
  concurrency = Math.max(
    1,
    Math.min(Number(process.env.WORKER_CONCURRENCY || 2), 4),
  ),
  timeoutMs = Number(process.env.DOCUMENT_TIMEOUT_SECONDS || 300) * 1000;
let stopping = false;
const active = new Set<string>();
interface Job {
  kind: string;
  payload: string;
  id: string;
  document_id: string;
  extension: string;
  workspace_id: string;
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
function acquire(): Job | undefined {
  return sqlite.transaction(() => {
    run(
      "UPDATE jobs SET status='queued',worker_id=NULL WHERE status='running' AND lease_until<?",
      Date.now(),
    );
    const job = one<Job>(
      "SELECT j.id,j.document_id,j.kind,j.payload,d.extension,d.workspace_id FROM jobs j JOIN documents d ON d.id=j.document_id WHERE j.status='queued' AND d.status NOT IN ('cancelled') ORDER BY j.created_at LIMIT 1",
    );
    if (!job) return;
    run(
      "UPDATE jobs SET status='running',worker_id=?,lease_until=?,attempts=attempts+1 WHERE id=?",
      workerId,
      Date.now() + 30000,
      job.id,
    );
    if (job.kind !== "interpret")
      run(
        "UPDATE documents SET status='processing',progress='Extracting content and recognizing text',updated_at=? WHERE id=?",
        Date.now(),
        job.document_id,
      );
    return job;
  })();
}
async function processJob(job: Job) {
  active.add(job.id);
  if (job.kind === "interpret") {
    await processInterpretation(job);
    active.delete(job.id);
    return;
  }
  const tmp = join(dataDir, "tmp", job.id);
  mkdirSync(tmp, { recursive: true, mode: 0o700 });
  const output = join(tmp, "result.json");
  const python = resolve("worker/.venv/bin/python");
  const sandbox = process.platform === "darwin";
  const child = spawn(
    sandbox ? "/usr/bin/sandbox-exec" : python,
    [
      ...(sandbox
        ? ["-p", "(version 1)(allow default)(deny network*)", python]
        : []),
      "worker/extract.py",
      join(uploadsDir, job.document_id, `original.${job.extension}`),
      output,
    ],
    {
      stdio: ["ignore", "pipe", "pipe"],
      env: {
        ...process.env,
        HF_HUB_DISABLE_PROGRESS_BARS: "1",
        TOKENIZERS_PARALLELISM: "false",
      },
    },
  );
  let stdout = "",
    stderr = "";
  child.stdout.on("data", (b) => {
    stdout = (stdout + b.toString()).slice(-2000);
  });
  child.stderr.on("data", (b) => {
    stderr = (stderr + b.toString()).slice(-2000);
  });
  let expired = false;
  const deadline = setTimeout(() => {
    expired = true;
    child.kill("SIGKILL");
  }, timeoutMs);
  const heartbeat = setInterval(() => {
    const exists = one<{ status: string }>(
      "SELECT status FROM jobs WHERE id=? AND worker_id=?",
      job.id,
      workerId,
    );
    if (stopping || !exists || exists.status !== "running") {
      child.kill("SIGKILL");
      return;
    }
    run(
      "UPDATE jobs SET lease_until=? WHERE id=? AND worker_id=?",
      Date.now() + 30000,
      job.id,
      workerId,
    );
  }, 5000);
  try {
    const code = await new Promise<number | null>((resolve, reject) => {
      child.on("exit", resolve);
      child.on("error", reject);
    });
    if (code !== 0) {
      let message = expired
        ? "Processing exceeded its time limit. Try a smaller file."
        : "Document parsing failed. Check the format and parser installation.";
      try {
        const parsed = JSON.parse(stdout.trim().split("\n").at(-1) || "{}");
        if (parsed.error) message = String(parsed.error);
      } catch {}
      throw new Error(message);
    }
    const result = JSON.parse(readFileSync(output, "utf8")) as Extraction;
    if (!Array.isArray(result.chunks) || !result.chunks.length)
      throw new Error("No readable content was extracted.");
    let semantic: Awaited<ReturnType<typeof embed>> | undefined;
    try {
      run(
        "UPDATE documents SET progress='Building local semantic index' WHERE id=? AND status='processing'",
        job.document_id,
      );
      semantic = await embed(result.chunks.map((c) => c.content));
    } catch {
      result.warnings.push(
        "Semantic embeddings are unavailable. Keyword search is enabled.",
      );
    }
    sqlite.transaction(() => {
      const current = one(
        "SELECT j.id FROM jobs j JOIN documents d ON d.id=j.document_id WHERE j.id=? AND j.worker_id=? AND j.status='running' AND d.status='processing'",
        job.id,
        workerId,
      );
      if (!current) return;
      run("DELETE FROM chunks WHERE document_id=?", job.document_id);
      run("DELETE FROM insights WHERE document_id=?", job.document_id);
      for (const [i, chunk] of result.chunks.entries()) {
        const chunkId = randomUUID();
        run(
          "INSERT INTO chunks(id,document_id,workspace_id,ordinal,content,location) VALUES(?,?,?,?,?,?)",
          chunkId,
          job.document_id,
          job.workspace_id,
          i,
          chunk.content,
          JSON.stringify(chunk.location),
        );
        if (semantic)
          run(
            "INSERT INTO embeddings(chunk_id,space,vector) VALUES(?,?,?)",
            chunkId,
            semantic.space,
            JSON.stringify(semantic.vectors[i]),
          );
      }
      copyFileSync(output, join(uploadsDir, job.document_id, "result.json"));
      run(
        "UPDATE documents SET status=?,progress='Ready to search',warnings=?,metadata=?,updated_at=? WHERE id=?",
        result.warnings.length ? "partial" : "ready",
        JSON.stringify(result.warnings),
        JSON.stringify({
          parser: result.parser,
          version: result.version,
          chunks: result.chunks.length,
          tables: result.tables.length,
        }),
        Date.now(),
        job.document_id,
      );
      run(
        "UPDATE jobs SET status='complete',lease_until=NULL WHERE id=?",
        job.id,
      );
    })();
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Document processing failed.";
    sqlite.transaction(() => {
      if (
        !one(
          "SELECT id FROM jobs WHERE id=? AND status='running' AND worker_id=?",
          job.id,
          workerId,
        )
      )
        return;
      run(
        "UPDATE jobs SET status=?,error=?,lease_until=NULL WHERE id=?",
        stopping ? "queued" : "failed",
        message.slice(0, 500),
        job.id,
      );
      run(
        "UPDATE documents SET status='failed',progress=?,updated_at=? WHERE id=?",
        message.slice(0, 500),
        Date.now(),
        job.document_id,
      );
    })();
  } finally {
    clearTimeout(deadline);
    clearInterval(heartbeat);
    rmSync(tmp, { recursive: true, force: true });
    active.delete(job.id);
  }
}
async function processInterpretation(job: Job) {
  const controller = new AbortController(),
    data = JSON.parse(job.payload) as {
      kind: string;
      compare_with?: string[];
      userId: string;
    };
  const heartbeat = setInterval(() => {
    if (
      stopping ||
      !one(
        "SELECT id FROM jobs WHERE id=? AND worker_id=? AND status='running'",
        job.id,
        workerId,
      )
    )
      controller.abort();
    else
      run(
        "UPDATE jobs SET lease_until=? WHERE id=? AND worker_id=?",
        Date.now() + 30000,
        job.id,
        workerId,
      );
  }, 1000);
  try {
    const member = one<{ role: Context["role"] }>(
      "SELECT role FROM memberships WHERE workspace_id=? AND user_id=?",
      job.workspace_id,
      data.userId,
    );
    if (!member || member.role === "viewer")
      throw new Error("Membership no longer permits interpretation.");
    await runInterpretation(
      {
        userId: data.userId,
        name: "",
        workspaceId: job.workspace_id,
        role: member.role,
        staff: false,
        apiKey: false,
      },
      job.document_id,
      data,
      controller.signal,
    );
    run(
      "UPDATE jobs SET status='complete',lease_until=NULL WHERE id=? AND worker_id=? AND status='running'",
      job.id,
      workerId,
    );
  } catch (e) {
    run(
      "UPDATE jobs SET status=?,error=?,lease_until=NULL WHERE id=? AND worker_id=? AND status='running'",
      stopping ? "queued" : controller.signal.aborted ? "cancelled" : "failed",
      e instanceof Error ? e.message.slice(0, 300) : "Interpretation failed.",
      job.id,
      workerId,
    );
  } finally {
    clearInterval(heartbeat);
  }
}
for (const signal of ["SIGINT", "SIGTERM"] as const)
  process.on(signal, () => {
    stopping = true;
  });
console.log(`MLAI document worker started (${concurrency} slots).`);
while (!stopping) {
  for (const cleanup of all<{ id: string }>(
    "SELECT id FROM artifact_cleanup LIMIT 20",
  )) {
    try {
      rmSync(join(uploadsDir, cleanup.id), { recursive: true, force: true });
      run("DELETE FROM artifact_cleanup WHERE id=?", cleanup.id);
    } catch {
      /* Retry after restart or when storage becomes writable. */
    }
  }

  run(
    "UPDATE messages SET status='interrupted' WHERE status='streaming' AND created_at<?",
    Date.now() - 180000,
  );
  while (active.size < concurrency) {
    const job = acquire();
    if (!job) break;
    void processJob(job);
  }
  await new Promise((r) => setTimeout(r, 1000));
}
while (active.size) await new Promise((r) => setTimeout(r, 100));
