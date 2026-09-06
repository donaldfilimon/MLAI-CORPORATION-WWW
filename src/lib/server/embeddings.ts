import { spawn, type ChildProcess } from "node:child_process";
import { resolve } from "node:path";
import { all } from "./db";
import type { Source } from "./search";
export const embeddingSpace =
  "sentence-transformers/all-MiniLM-L6-v2@1110a243fdf4706b3f48f1d95db1a4f5529b4d41:normalized:384:v1";
/** Only use with children spawned detached, which own their process group. */
export function stopOwnedProcess(child: ChildProcess) {
  try {
    if (process.platform !== "win32" && child.pid) process.kill(-child.pid, "SIGKILL");
    else child.kill("SIGKILL");
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== "ESRCH") child.kill("SIGKILL");
  }
}
export async function embed(
  texts: string[],
  signal?: AbortSignal,
): Promise<{ space: string; vectors: number[][] }> {
  signal?.throwIfAborted();
  return new Promise((resolvePromise, reject) => {
    const child = spawn(
      resolve("worker/.venv/bin/python"),
      ["worker/embed.py"],
      {
        stdio: ["pipe", "pipe", "ignore"],
        detached: process.platform !== "win32",
        env: {
          ...process.env,
          HF_HUB_OFFLINE: "1",
          TOKENIZERS_PARALLELISM: "false",
        },
      },
    );
    let output = "", failure: unknown;
    const stop = (reason: unknown) => {
      failure ||= reason;
      stopOwnedProcess(child);
    };
    const abort = () => stop(signal?.reason || new DOMException("Embedding cancelled.", "AbortError"));
    signal?.addEventListener("abort", abort, { once: true });
    const timer = setTimeout(() => {
      stop(new Error("Local embedding timed out."));
    }, 120000);
    child.stdout.on("data", (b) => {
      output += b;
      if (output.length > 100 * 1024 * 1024) {
        stop(new Error("Embedding output exceeded limit."));
      }
    });
    child.stdin.on("error", () => {});
    child.on("error", (e) => {
      clearTimeout(timer);
      signal?.removeEventListener("abort", abort);
      reject(e);
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      signal?.removeEventListener("abort", abort);
      try {
        if (failure) throw failure;
        signal?.throwIfAborted();
        const parsed = JSON.parse(output);
        if (
          code !== 0 ||
          parsed.space !== embeddingSpace ||
          parsed.vectors?.length !== texts.length
        )
          throw new Error("Pinned local embedding model is unavailable.");
        resolvePromise(parsed);
      } catch (e) {
        reject(e);
      }
    });
    child.stdin.end(JSON.stringify(texts));
    if (signal?.aborted) abort();
  });
}
const queryCache = new Map<string, number[]>();
export async function semanticSearch(
  workspaceId: string,
  query: string,
  projectId?: string,
  documentIds?: string[],
  limit = 8,
  signal?: AbortSignal,
): Promise<Source[]> {
  signal?.throwIfAborted();
  const params: unknown[] = [workspaceId, embeddingSpace];
  let filter = "";
  if (projectId) {
    filter += " AND d.project_id=?";
    params.push(projectId);
  }
  if (documentIds?.length) {
    filter += ` AND d.id IN (${documentIds.map(() => "?").join(",")})`;
    params.push(...documentIds);
  }
  const rows = all<{
    id: string;
    document_id: string;
    name: string;
    content: string;
    location: string;
    vector: string;
  }>(
    `SELECT c.*,d.name,e.vector FROM embeddings e JOIN chunks c ON c.id=e.chunk_id JOIN documents d ON d.id=c.document_id WHERE c.workspace_id=? AND e.space=? AND d.status IN ('ready','partial') ${filter}`,
    ...params,
  );
  if (!rows.length)
    throw new Error("No compatible local semantic index is available.");
  let vector = queryCache.get(query);
  if (!vector) {
    vector = (await embed([query.slice(0, 8000)], signal)).vectors[0];
    signal?.throwIfAborted();
    if (queryCache.size > 100) queryCache.clear();
    queryCache.set(query, vector);
  }
  const q = vector;
  return rows
    .map((r) => {
      const v: number[] = JSON.parse(r.vector);
      const score =
        v.length === q.length ? v.reduce((n, x, i) => n + x * q[i], 0) : -1;
      return {
        id: r.id,
        documentId: r.document_id,
        name: r.name,
        content: r.content,
        location: JSON.parse(r.location),
        score,
      };
    })
    .filter((r) => r.score > 0.15)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
