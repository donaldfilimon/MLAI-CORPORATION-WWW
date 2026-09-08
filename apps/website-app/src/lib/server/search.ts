import { all } from "./db";
export interface Source {
  id: string;
  documentId: string;
  name: string;
  content: string;
  location: Record<string, unknown>;
  score?: number;
}
export function search(
  workspaceId: string,
  query: string,
  projectId?: string,
  documentIds?: string[],
  limit = 8,
): Source[] {
  const words = query.match(/[\p{L}\p{N}_-]+/gu)?.slice(0, 20) || [];
  if (!words.length) return [];
  const params: unknown[] = [
    words.map((w) => `"${w.replace(/"/g, "")}"`).join(" OR "),
    workspaceId,
  ];
  let filter = "";
  if (projectId) {
    filter += " AND d.project_id=?";
    params.push(projectId);
  }
  if (documentIds?.length) {
    filter += ` AND d.id IN (${documentIds.map(() => "?").join(",")})`;
    params.push(...documentIds);
  }
  params.push(limit);
  return all<{
    id: string;
    document_id: string;
    name: string;
    content: string;
    location: string;
    score: number;
  }>(
    `SELECT c.*,d.name,bm25(chunks_fts) score FROM chunks_fts JOIN chunks c ON c.id=chunks_fts.chunk_id JOIN documents d ON d.id=c.document_id WHERE chunks_fts MATCH ? AND c.workspace_id=? AND d.status IN ('ready','partial') ${filter} ORDER BY score LIMIT ?`,
    ...params,
  ).map((r) => ({
    id: r.id,
    documentId: r.document_id,
    name: r.name,
    content: r.content,
    location: JSON.parse(r.location),
    score: r.score,
  }));
}

export async function retrieve(
  workspaceId: string,
  query: string,
  projectId?: string,
  documentIds?: string[],
  limit = 8,
  signal?: AbortSignal,
  options: { semanticTimeoutMs?: number } = {},
) {
  signal?.throwIfAborted();
  const keyword = search(workspaceId, query, projectId, documentIds, limit);
  if (!query.trim())
    return { mode: "keyword", results: [], reason: "Enter a search query." };
  const controller = new AbortController();
  const cancel = () => controller.abort(signal?.reason);
  signal?.addEventListener("abort", cancel, { once: true });
  if (signal?.aborted) cancel();
  let timedOut = false;
  const timer =
    options.semanticTimeoutMs === undefined
      ? undefined
      : setTimeout(() => {
          timedOut = true;
          controller.abort(
            new DOMException("Semantic search timed out.", "TimeoutError"),
          );
        }, options.semanticTimeoutMs);
  let onAbort: () => void = () => {};
  const cancelled = new Promise<never>((_, reject) => {
    onAbort = () => reject(controller.signal.reason);
    controller.signal.addEventListener("abort", onAbort, { once: true });
    if (controller.signal.aborted) onAbort();
  });
  try {
    // Bound the response as well as cancelling the owned embedding process.
    const semantic = await Promise.race([
      (async () => {
        const { semanticSearch } = await import("./embeddings");
        controller.signal.throwIfAborted();
        return semanticSearch(
          workspaceId,
          query,
          projectId,
          documentIds,
          limit,
          controller.signal,
        );
      })(),
      cancelled,
    ]);
    signal?.throwIfAborted();
    const merged = new Map<string, Source>();
    for (const source of [...semantic, ...keyword])
      merged.set(source.id, source);
    return { mode: "hybrid", results: [...merged.values()].slice(0, limit) };
  } catch {
    signal?.throwIfAborted();
    return {
      mode: "keyword",
      results: keyword,
      reason: timedOut
        ? "Semantic search timed out. Showing keyword matches; try again for semantic results."
        : "Local semantic embeddings are unavailable or indexing is incomplete.",
    };
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", cancel);
    controller.signal.removeEventListener("abort", onAbort);
  }
}
