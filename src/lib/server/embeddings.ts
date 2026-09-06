import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { all } from "./db";
import type { Source } from "./search";
export const embeddingSpace =
  "sentence-transformers/all-MiniLM-L6-v2@1110a243fdf4706b3f48f1d95db1a4f5529b4d41:normalized:384:v1";
export async function embed(
  texts: string[],
): Promise<{ space: string; vectors: number[][] }> {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(
      resolve("worker/.venv/bin/python"),
      ["worker/embed.py"],
      {
        stdio: ["pipe", "pipe", "ignore"],
        env: {
          ...process.env,
          HF_HUB_OFFLINE: "1",
          TOKENIZERS_PARALLELISM: "false",
        },
      },
    );
    let output = "";
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error("Local embedding timed out."));
    }, 120000);
    child.stdout.on("data", (b) => {
      output += b;
      if (output.length > 100 * 1024 * 1024) {
        child.kill("SIGKILL");
        reject(new Error("Embedding output exceeded limit."));
      }
    });
    child.stdin.on("error", () => {});
    child.on("error", (e) => {
      clearTimeout(timer);
      reject(e);
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      try {
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
  });
}
const queryCache = new Map<string, number[]>();
export async function semanticSearch(
  workspaceId: string,
  query: string,
  projectId?: string,
  documentIds?: string[],
  limit = 8,
): Promise<Source[]> {
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
    vector = (await embed([query.slice(0, 8000)])).vectors[0];
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
