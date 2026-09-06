import {
  agentRunDetailSchema,
  agentRunSummarySchema,
  type AgentRunStatus,
  type AgentSourceReference,
} from "../agent-contracts";
import { all, one, run, type Row } from "./db";
import { fail, now, resource, type Context } from "./http";
import type { ModelSelection } from "./models";

export interface AgentRunRow {
  id: string;
  workspace_id: string;
  user_id: string;
  conversation_id: string;
  objective: string;
  document_ids: string;
  project_id: string | null;
  status: AgentRunStatus;
  revision: number;
  step_count: number;
  active_ms: number;
  active_since: number | null;
  lease_until: number | null;
  lease_token: string | null;
  worker_id: string | null;
  selection: string;
  provider: string;
  model: string;
  error: string | null;
  created_at: number;
  updated_at: number;
}

export function agentRun(id: string): AgentRunRow {
  const row = one<AgentRunRow>("SELECT * FROM agent_runs WHERE id=?", id);
  if (!row) fail(404, "not_found", "Agent run not found.");
  return row;
}

export function authorizedRun(id: string, ctx: Context) {
  const row = agentRun(id);
  if (row.workspace_id !== ctx.workspaceId)
    fail(404, "not_found", "Agent run not found.");
  resource("conversations", row.conversation_id, ctx);
  return row;
}

/** Reconstruct authority from current membership, never a saved role. */
export function agentActor(row: AgentRunRow): Context {
  const member = one<{ role: Context["role"] }>(
    "SELECT role FROM memberships WHERE workspace_id=? AND user_id=?",
    row.workspace_id,
    row.user_id,
  );
  if (!member)
    fail(
      403,
      "workspace_forbidden",
      "The requester no longer belongs to this workspace.",
    );
  const ctx: Context = {
    userId: row.user_id,
    workspaceId: row.workspace_id,
    role: member.role,
    name: "",
    staff: false,
    apiKey: false,
  };
  const conversation = resource("conversations", row.conversation_id, ctx);
  if ((conversation.project_id || null) !== row.project_id)
    fail(
      409,
      "source_changed",
      "The conversation's project changed. Start a new run.",
    );
  if (row.project_id) resource("projects", row.project_id, ctx);
  return ctx;
}

export function writableAgent(ctx: Context) {
  if (ctx.role === "viewer" || ctx.apiKey)
    fail(
      403,
      "read_only",
      "This membership may investigate but cannot propose or confirm changes.",
    );
}

export function selectedDocuments(row: AgentRunRow): string[] {
  return JSON.parse(row.document_ids) as string[];
}

export function agentDocument(row: AgentRunRow, ctx: Context, did: string) {
  const doc = resource("documents", did, ctx);
  const selected = selectedDocuments(row);
  if (
    (row.project_id && doc.project_id !== row.project_id) ||
    (selected.length && !selected.includes(did))
  )
    fail(404, "not_found", "Document is outside this investigation.");
  return doc;
}

export function validateAgentSources(row: AgentRunRow, ctx: Context) {
  for (const did of selectedDocuments(row)) agentDocument(row, ctx, did);
  for (const source of all<{
    chunk_id: string;
    document_id: string;
    revision: number;
  }>("SELECT * FROM agent_sources WHERE run_id=?", row.id)) {
    const doc = agentDocument(row, ctx, source.document_id);
    if (
      doc.revision !== source.revision ||
      !one(
        "SELECT id FROM chunks WHERE id=? AND document_id=? AND workspace_id=?",
        source.chunk_id,
        source.document_id,
        ctx.workspaceId,
      )
    )
      fail(
        409,
        "source_changed",
        "An investigation source changed or was removed. Start a new run.",
      );
  }
}

export function expectedSelection(row: AgentRunRow): ModelSelection {
  return JSON.parse(row.selection) as ModelSelection;
}

export function ownsAgentLease(row: AgentRunRow, workerId: string) {
  return !!one(
    "SELECT id FROM agent_runs WHERE id=? AND status='running' AND worker_id=? AND lease_token=? AND lease_until>?",
    row.id,
    workerId,
    row.lease_token,
    now(),
  );
}

export function requireAgentLease(row: AgentRunRow, workerId: string) {
  if (!ownsAgentLease(row, workerId))
    fail(409, "lease_lost", "Agent execution no longer owns this run.");
}

export function bumpAgent(id: string) {
  run(
    "UPDATE agent_runs SET revision=revision+1,updated_at=? WHERE id=?",
    now(),
    id,
  );
}

export function finishAgentLease(
  row: AgentRunRow,
  workerId: string,
  status: AgentRunStatus,
  error: string | null = null,
) {
  const time = now();
  run(
    "UPDATE agent_runs SET status=?,error=?,active_ms=active_ms+max(0,?-coalesce(active_since,?)),active_since=NULL,worker_id=NULL,lease_until=NULL,lease_token=NULL,revision=revision+1,updated_at=? WHERE id=? AND status='running' AND worker_id=? AND lease_token=?",
    status,
    error,
    time,
    time,
    time,
    row.id,
    workerId,
    row.lease_token,
  );
}

export function cancelAgentJobs(id: string) {
  run(
    "UPDATE jobs SET status='cancelled',lease_until=NULL WHERE id IN (SELECT job_id FROM agent_jobs WHERE run_id=?) AND status IN ('queued','running')",
    id,
  );
}

export function terminalAgent(
  id: string,
  status: "cancelled" | "failed",
  message: string | null,
  actionStatus: "cancelled" | "stale" = "cancelled",
) {
  const time = now();
  run(
    "UPDATE agent_actions SET status=? WHERE run_id=? AND status IN ('pending','approved')",
    actionStatus,
    id,
  );
  cancelAgentJobs(id);
  run(
    "UPDATE agent_runs SET status=?,error=?,active_ms=active_ms+CASE WHEN active_since IS NULL THEN 0 ELSE max(0,?-active_since) END,active_since=NULL,worker_id=NULL,lease_until=NULL,lease_token=NULL,revision=revision+1,updated_at=? WHERE id=?",
    status,
    message,
    time,
    time,
    id,
  );
}

function summary(row: AgentRunRow) {
  return agentRunSummarySchema.parse({ ...row, requester_id: row.user_id });
}

export function agentSummaries(conversationId: string) {
  return all<AgentRunRow>(
    "SELECT * FROM agent_runs WHERE conversation_id=? ORDER BY created_at DESC,id DESC",
    conversationId,
  ).map(summary);
}

function sourceReferences(
  value: string,
  workspaceId: string,
): AgentSourceReference[] {
  return (JSON.parse(value) as AgentSourceReference[]).map((source) => ({
    ...source,
    removed:
      !!source.removed ||
      !one(
        "SELECT c.id FROM chunks c JOIN documents d ON d.id=c.document_id WHERE c.id=? AND c.document_id=? AND c.workspace_id=?",
        source.id,
        source.documentId,
        workspaceId,
      ),
  }));
}

export function agentDetail(row: AgentRunRow) {
  const steps = all<Row>(
    "SELECT * FROM agent_steps WHERE run_id=? ORDER BY created_at,rowid",
    row.id,
  ).map((s) => ({
    ...s,
    resource_ids: JSON.parse(String(s.resource_ids)),
    sources: sourceReferences(String(s.sources), row.workspace_id),
  }));
  const actions = all<Row>(
    "SELECT * FROM agent_actions WHERE run_id=? ORDER BY created_at,rowid",
    row.id,
  ).map((a) => ({
    ...a,
    input: JSON.parse(String(a.input)),
    affected: JSON.parse(String(a.affected)),
  }));
  const results = all<Row>(
    "SELECT r.*,coalesce(j.status,r.status) status FROM agent_results r LEFT JOIN agent_jobs aj ON aj.job_id=r.resource_id AND aj.run_id=r.run_id LEFT JOIN jobs j ON j.id=aj.job_id WHERE r.run_id=? ORDER BY r.created_at,r.rowid",
    row.id,
  ).map((r) => ({
    ...r,
    citations: sourceReferences(String(r.citations), row.workspace_id),
  }));
  return agentRunDetailSchema.parse({
    ...summary(row),
    steps,
    actions,
    results,
  });
}

/** Called in the deleting/reprocessing transaction, before source rows disappear. */
export function invalidateAgentSources(
  documentId: string,
  workspaceId: string,
) {
  const rows = all<AgentRunRow>(
    `SELECT DISTINCT r.* FROM agent_runs r WHERE r.workspace_id=? AND (
    EXISTS(SELECT 1 FROM agent_sources s WHERE s.run_id=r.id AND s.document_id=?) OR
    EXISTS(SELECT 1 FROM json_each(r.document_ids) WHERE value=?) OR
    EXISTS(SELECT 1 FROM agent_steps step,json_each(step.resource_ids) ref WHERE step.run_id=r.id AND step.tool!='list_projects' AND ref.value=?) OR
    EXISTS(SELECT 1 FROM agent_actions a,json_each(a.affected) f WHERE a.run_id=r.id AND json_extract(f.value,'$.table')='documents' AND json_extract(f.value,'$.id')=?))`,
    workspaceId,
    documentId,
    documentId,
    documentId,
    documentId,
  );
  for (const row of rows) {
    if (["queued", "running", "awaiting_approval"].includes(row.status))
      terminalAgent(
        row.id,
        "failed",
        "An investigation source was removed or reprocessed. Start a new run.",
        "stale",
      );
    else {
      cancelAgentJobs(row.id);
      bumpAgent(row.id);
    }
    run(
      "DELETE FROM agent_sources WHERE run_id=? AND document_id=?",
      row.id,
      documentId,
    );
    for (const step of all<{
      id: string;
      sources: string;
      resource_ids: string;
    }>(
      "SELECT id,sources,resource_ids FROM agent_steps WHERE run_id=?",
      row.id,
    )) {
      const sources = (
        JSON.parse(step.sources) as AgentSourceReference[]
      ).filter((s) => s.documentId !== documentId);
      const ids = (JSON.parse(step.resource_ids) as string[]).filter(
        (id) => id !== documentId,
      );
      run(
        "UPDATE agent_steps SET sources=?,resource_ids=? WHERE id=?",
        JSON.stringify(sources),
        JSON.stringify(ids),
        step.id,
      );
    }
    for (const result of all<{ id: string; citations: string }>(
      "SELECT id,citations FROM agent_results WHERE run_id=?",
      row.id,
    )) {
      const citations = (
        JSON.parse(result.citations) as AgentSourceReference[]
      ).map((s) => (s.documentId === documentId ? { ...s, removed: true } : s));
      run(
        "UPDATE agent_results SET citations=? WHERE id=?",
        JSON.stringify(citations),
        result.id,
      );
    }
  }
}
