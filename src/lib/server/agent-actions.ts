import {
  agentToolDecisionSchema,
  type AgentAffectedResource,
  type AgentToolDecision,
} from "../agent-contracts";
import {
  agentActor,
  agentDocument,
  expectedSelection,
  validateAgentSources,
  writableAgent,
  type AgentRunRow,
} from "./agent-store";
import { all, one, run } from "./db";
import { fail, id, now, resource, type Context } from "./http";
import { queueInterpretation, validateInterpretation } from "./documents";
import { validateModelSelection } from "./models";
export interface ActionRow {
  id: string;
  run_id: string;
  tool: string;
  input: string;
  target_id: string;
  affected: string;
  status: string;
}
export function writeTool(tool: string) {
  return [
    "create_project",
    "update_project",
    "associate_document",
    "interpret_documents",
  ].includes(tool);
}
function affectedResource(
  table: "projects" | "documents",
  key: string,
  ctx: Context,
): AgentAffectedResource {
  const r = resource(table, key, ctx);
  return {
    table,
    id: key,
    name: String(r.name),
    revision: Number(r.revision),
    values:
      table === "projects"
        ? { name: r.name, description: r.description, archived: r.archived }
        : { project_id: r.project_id, status: r.status },
  };
}
export function writeResources(
  row: AgentRunRow,
  ctx: Context,
  decision: AgentToolDecision,
) {
  writableAgent(ctx);
  const affected: AgentAffectedResource[] = [];
  const document = (did: string) => {
    agentDocument(row, ctx, did);
    affected.push(affectedResource("documents", did, ctx));
  };
  const project = (pid: string) =>
    affected.push(affectedResource("projects", pid, ctx));
  switch (decision.tool) {
    case "create_project":
      break;
    case "update_project":
      project(decision.input.project_id);
      break;
    case "associate_document":
      document(decision.input.document_id);
      if (decision.input.project_id) project(decision.input.project_id);
      break;
    case "interpret_documents":
      validateInterpretation(ctx, decision.input.document_id, decision.input);
      for (const did of new Set([
        decision.input.document_id,
        ...(decision.input.compare_with || []),
      ])) {
        document(did);
        if (
          !["ready", "partial"].includes(
            String(agentDocument(row, ctx, did).status),
          )
        )
          fail(409, "not_ready", "Wait for extraction before interpreting.");
      }
      break;
    default:
      fail(400, "invalid_tool", "This tool cannot create a proposal.");
  }
  return affected;
}
export function proposeAction(
  row: AgentRunRow,
  ctx: Context,
  decision: AgentToolDecision,
) {
  const affected = writeResources(row, ctx, decision);
  run(
    "INSERT INTO agent_actions(id,run_id,tool,input,target_id,affected,created_at) VALUES(?,?,?,?,?,?,?)",
    id(),
    row.id,
    decision.tool,
    JSON.stringify(decision.input),
    id(),
    JSON.stringify(affected),
    now(),
  );
}
export function validateAction(row: AgentRunRow, action: ActionRow) {
  const ctx = agentActor(row);
  validateAgentSources(row, ctx);
  validateModelSelection(row.workspace_id, expectedSelection(row));
  const decision = agentToolDecisionSchema.parse({
    kind: "tool",
    tool: action.tool,
    input: JSON.parse(action.input),
  });
  writeResources(row, ctx, decision);
  for (const affected of JSON.parse(
    action.affected,
  ) as AgentAffectedResource[]) {
    const current = resource(affected.table, affected.id, ctx);
    if (current.revision !== affected.revision)
      fail(
        409,
        "source_changed",
        "A proposed resource changed. Start a new run.",
      );
  }
  return { ctx, decision };
}
/** Caller holds the run lease and an immediate SQLite transaction. */
export function applyAction(row: AgentRunRow, action: ActionRow) {
  const { ctx, decision } = validateAction(row, action);
  if (
    !one(
      "SELECT action_id FROM agent_decisions WHERE action_id=? AND user_id=? AND decision='approved'",
      action.id,
      row.user_id,
    )
  )
    fail(
      403,
      "confirmation_required",
      "The requester must confirm this action.",
    );
  let target = action.target_id,
    status = "complete";
  switch (decision.tool) {
    case "create_project":
      run(
        "INSERT INTO projects(id,workspace_id,name,description,created_at,updated_at) VALUES(?,?,?,?,?,?)",
        target,
        ctx.workspaceId,
        decision.input.name,
        decision.input.description || "",
        now(),
        now(),
      );
      break;
    case "update_project":
      target = decision.input.project_id;
      run(
        "UPDATE projects SET name=coalesce(?,name),description=coalesce(?,description),updated_at=? WHERE id=? AND workspace_id=?",
        decision.input.name ?? null,
        decision.input.description ?? null,
        now(),
        target,
        ctx.workspaceId,
      );
      break;
    case "associate_document":
      target = decision.input.document_id;
      run(
        "UPDATE documents SET project_id=?,updated_at=? WHERE id=? AND workspace_id=?",
        decision.input.project_id,
        now(),
        target,
        ctx.workspaceId,
      );
      break;
    case "interpret_documents":
      status = "queued";
      queueInterpretation(
        ctx,
        decision.input.document_id,
        decision.input,
        target,
        expectedSelection(row),
      );
      run("INSERT INTO agent_jobs(job_id,run_id) VALUES(?,?)", target, row.id);
      break;
    default:
      fail(400, "invalid_tool", "This action cannot be applied.");
  }
  run(
    "UPDATE agent_actions SET status='completed' WHERE id=? AND status='approved'",
    action.id,
  );
  run(
    "INSERT INTO agent_results(id,run_id,action_id,kind,content,resource_id,status,created_at) VALUES(?,?,?,'write',?,?,?,?)",
    id(),
    row.id,
    action.id,
    status === "queued"
      ? "Interpretation queued."
      : "Confirmed change applied.",
    target,
    status,
    now(),
  );
}
export function approvedActions(runId: string) {
  return all<ActionRow>(
    "SELECT * FROM agent_actions WHERE run_id=? AND status='approved' ORDER BY created_at,rowid",
    runId,
  );
}
