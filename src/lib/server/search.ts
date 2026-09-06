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
) {
  signal?.throwIfAborted();
  const keyword = search(workspaceId, query, projectId, documentIds, limit);
  if (!query.trim())
    return { mode: "keyword", results: [], reason: "Enter a search query." };
  try {
    const { semanticSearch } = await import("./embeddings");
    const semantic = await semanticSearch(
      workspaceId,
      query,
      projectId,
      documentIds,
      limit,
      signal,
    );
    const merged = new Map<string, Source>();
    for (const source of [...semantic, ...keyword])
      merged.set(source.id, source);
    return { mode: "hybrid", results: [...merged.values()].slice(0, limit) };
  } catch {
    signal?.throwIfAborted();
    return {
      mode: "keyword",
      results: keyword,
      reason:
        "Local semantic embeddings are unavailable or indexing is incomplete.",
    };
  }
}
