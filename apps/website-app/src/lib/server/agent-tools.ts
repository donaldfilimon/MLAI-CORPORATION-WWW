import { agentLimits, type AgentToolDecision } from "../agent-contracts";
import {
  agentDocument,
  selectedDocuments,
  type AgentRunRow,
} from "./agent-store";
import { all, one, run } from "./db";
import { fail, id, now, resource, type Context } from "./http";
import { search, type Source } from "./search";
export function agentSources(row: AgentRunRow, ctx: Context): Source[] {
  return all<{ chunk_id: string; document_id: string }>(
    "SELECT * FROM agent_sources WHERE run_id=? ORDER BY rowid",
    row.id,
  ).map((s) => {
    const doc = agentDocument(row, ctx, s.document_id);
    const chunk = one<{ content: string; location: string }>(
      "SELECT content,location FROM chunks WHERE id=? AND document_id=? AND workspace_id=?",
      s.chunk_id,
      s.document_id,
      ctx.workspaceId,
    );
    if (!chunk)
      fail(409, "source_changed", "An investigation source was removed.");
    return {
      id: s.chunk_id,
      documentId: s.document_id,
      name: String(doc.name),
      content: chunk.content.slice(0, agentLimits.excerptChars),
      location: JSON.parse(chunk.location),
    };
  });
}
function rememberSources(row: AgentRunRow, ctx: Context, sources: Source[]) {
  for (const source of sources) {
    const doc = agentDocument(row, ctx, source.documentId);
    if (
      !one(
        "SELECT chunk_id FROM agent_sources WHERE run_id=? AND chunk_id=?",
        row.id,
        source.id,
      ) &&
      one<{ n: number }>(
        "SELECT count(*) n FROM agent_sources WHERE run_id=?",
        row.id,
      )!.n >= agentLimits.sources
    )
      break;
    run(
      "INSERT OR IGNORE INTO agent_sources(run_id,chunk_id,document_id,revision) VALUES(?,?,?,?)",
      row.id,
      source.id,
      source.documentId,
      doc.revision,
    );
  }
}
export function readTool(
  row: AgentRunRow,
  ctx: Context,
  decision: AgentToolDecision,
) {
  let ids: string[] = [],
    sources: Source[] = [];
  switch (decision.tool) {
    case "list_projects":
      ids = all<{ id: string }>(
        "SELECT id FROM projects WHERE workspace_id=? ORDER BY id LIMIT ?",
        ctx.workspaceId,
        agentLimits.list,
      ).map((r) => r.id);
      break;
    case "list_documents": {
      const selected = selectedDocuments(row);
      ids = all<{ id: string }>(
        `SELECT id FROM documents WHERE workspace_id=? AND (? IS NULL OR project_id=?) ${selected.length ? `AND id IN (${selected.map(() => "?").join(",")})` : ""} ORDER BY id LIMIT ?`,
        ctx.workspaceId,
        row.project_id,
        row.project_id,
        ...selected,
        agentLimits.list,
      ).map((r) => r.id);
      break;
    }
    case "search_documents":
      sources = search(
        ctx.workspaceId,
        decision.input.query,
        row.project_id || undefined,
        selectedDocuments(row),
        agentLimits.sources,
      );
      ids = [...new Set(sources.map((s) => s.documentId))];
      break;
    case "inspect_source": {
      const doc = agentDocument(row, ctx, decision.input.document_id);
      const chunk = one<{ id: string; content: string; location: string }>(
        "SELECT id,content,location FROM chunks WHERE id=? AND document_id=? AND workspace_id=?",
        decision.input.chunk_id,
        decision.input.document_id,
        ctx.workspaceId,
      );
      if (!chunk) fail(404, "not_found", "Source not found.");
      sources = [
        {
          id: chunk.id,
          documentId: decision.input.document_id,
          name: String(doc.name),
          content: chunk.content,
          location: JSON.parse(chunk.location),
        },
      ];
      ids = [decision.input.document_id];
      break;
    }
    case "read_interpretations": {
      agentDocument(row, ctx, decision.input.document_id);
      ids = [decision.input.document_id];
      for (const insight of all<{ citations: string }>(
        "SELECT citations FROM insights WHERE document_id=? ORDER BY created_at DESC LIMIT 5",
        decision.input.document_id,
      )) {
        for (const ref of JSON.parse(insight.citations) as {
          id: string;
          documentId: string;
        }[]) {
          const doc = agentDocument(row, ctx, ref.documentId);
          const chunk = one<{ content: string; location: string }>(
            "SELECT content,location FROM chunks WHERE id=? AND document_id=? AND workspace_id=?",
            ref.id,
            ref.documentId,
            ctx.workspaceId,
          );
          if (!chunk)
            fail(
              409,
              "source_changed",
              "An interpretation source was removed.",
            );
          sources.push({
            id: ref.id,
            documentId: ref.documentId,
            name: String(doc.name),
            content: chunk.content,
            location: JSON.parse(chunk.location),
          });
        }
      }
      break;
    }
    default:
      fail(400, "invalid_tool", "Unsupported read tool.");
  }
  rememberSources(row, ctx, sources);
  const saved = new Set(agentSources(row, ctx).map((s) => s.id));
  run(
    "INSERT INTO agent_steps(id,run_id,tool,count,resource_ids,sources,created_at) VALUES(?,?,?,?,?,?,?)",
    id(),
    row.id,
    decision.tool,
    ids.length,
    JSON.stringify(ids),
    JSON.stringify(
      sources
        .filter((s) => saved.has(s.id))
        .map(({ content: _content, score: _score, ...ref }) => ref),
    ),
    now(),
  );
}
/** Hydrate authorized records at each call; excerpts never enter step logs. */
export function toolContext(row: AgentRunRow, ctx: Context) {
  const steps = all<{ tool: string; resource_ids: string }>(
    "SELECT tool,resource_ids FROM agent_steps WHERE run_id=? ORDER BY rowid",
    row.id,
  );
  return steps.map((step) => ({
    tool: step.tool,
    records: (JSON.parse(step.resource_ids) as string[]).map((key) => {
      if (step.tool === "list_projects") {
        const p = resource("projects", key, ctx);
        return { id: p.id, name: p.name, description: p.description };
      }
      const d = agentDocument(row, ctx, key);
      const record = {
        id: d.id,
        name: d.name,
        status: d.status,
        project_id: d.project_id,
      };
      if (step.tool !== "read_interpretations") return record;
      const insights = all<{
        content: string;
        citations: string;
        kind: string;
      }>(
        "SELECT content,citations,kind FROM insights WHERE document_id=? ORDER BY created_at DESC LIMIT 5",
        key,
      )
        .filter((insight) => {
          // Derived output can cite other documents; do not disclose outside the selection.
          try {
            for (const source of JSON.parse(insight.citations) as {
              documentId: string;
            }[])
              agentDocument(row, ctx, source.documentId);
            return true;
          } catch {
            return false;
          }
        })
        .map((i) => ({
          kind: i.kind,
          content: i.content.slice(0, agentLimits.excerptChars),
        }));
      return { ...record, interpretations: insights };
    }),
  }));
}
