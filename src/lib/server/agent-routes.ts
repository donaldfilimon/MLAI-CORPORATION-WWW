import {
  agentActionDecisionSchema,
  agentRunRequestSchema,
} from "../agent-contracts";
import { validateAction, type ActionRow } from "./agent-actions";
import {
  agentActor,
  agentDetail,
  agentRun,
  authorizedRun,
  terminalAgent,
  validateAgentSources,
  expectedSelection,
} from "./agent-store";
import { one, run, sqlite } from "./db";
import {
  body,
  context,
  fail,
  id,
  json,
  now,
  resource,
  type Context,
} from "./http";
import {
  assertModelSelection,
  validateModelSelection,
  modelSelection,
  selectedModel,
} from "./models";
export async function agentRoutes(req: Request, path: string[], ctx: Context) {
  if (path[0] !== "agent") return;
  if (ctx.apiKey || req.headers.has("authorization"))
    fail(
      403,
      "session_required",
      "Agent operations require a browser session.",
    );
  const [, section, key, action] = path;
  if (section === "runs" && !key && req.method === "POST") {
    const data = await body(req, agentRunRequestSchema);
    resource("conversations", data.conversation_id, ctx);
    const selection = modelSelection(await selectedModel(ctx.workspaceId));
    return sqlite
      .transaction(() => {
        const conversation = resource(
          "conversations",
          data.conversation_id,
          ctx,
        );
        validateModelSelection(ctx.workspaceId, selection);
        if (
          one(
            "SELECT id FROM agent_runs WHERE conversation_id=? AND status IN ('queued','running','awaiting_approval')",
            data.conversation_id,
          )
        )
          fail(
            409,
            "agent_active",
            "An agent run is already active in this conversation.",
          );
        const key = id(),
          time = now();
        run(
          "INSERT INTO agent_runs(id,workspace_id,user_id,conversation_id,objective,document_ids,project_id,selection,provider,model,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)",
          key,
          ctx.workspaceId,
          ctx.userId,
          data.conversation_id,
          data.objective,
          JSON.stringify([...new Set(data.document_ids || [])]),
          conversation.project_id || null,
          JSON.stringify(selection),
          selection.connectionId,
          selection.model,
          time,
          time,
        );
        const row = agentRun(key);
        validateAgentSources(row, agentActor(row));
        return json(agentDetail(row), 201);
      })
      .immediate();
  }
  if (section === "runs" && key) {
    const row = authorizedRun(key, ctx);
    if (req.method === "GET" && !action) return json(agentDetail(row));
    if (req.method === "GET" && action === "events")
      return agentEvents(req, key);
    if (req.method === "POST" && action === "cancel") {
      await body(req, agentActionDecisionSchema);
      if (row.user_id !== ctx.userId)
        fail(
          403,
          "requester_required",
          "Only the requester may cancel this run.",
        );
      sqlite
        .transaction(() => {
          const current = authorizedRun(key, ctx);
          if (current.status !== "cancelled" && current.status !== "failed")
            terminalAgent(key, "cancelled", null);
        })
        .immediate();
      return json(agentDetail(agentRun(key)));
    }
  }
  if (
    section === "actions" &&
    key &&
    req.method === "POST" &&
    ["confirm", "reject"].includes(action)
  ) {
    await body(req, agentActionDecisionSchema);
    const stored = one<ActionRow>(
      "SELECT * FROM agent_actions WHERE id=?",
      key,
    );
    if (!stored) fail(404, "not_found", "Proposal not found.");
    const row = authorizedRun(stored.run_id, ctx);
    if (row.user_id !== ctx.userId)
      fail(
        403,
        "requester_required",
        "Only the requester may decide this proposal.",
      );
    let providerValid = true;
    if (action === "confirm" && stored.status === "pending") {
      try {
        await assertModelSelection(row.workspace_id, expectedSelection(row));
      } catch {
        providerValid = false;
      }
    }
    const stale = sqlite
      .transaction(() => {
        const row = authorizedRun(stored.run_id, ctx);
        const current = one<ActionRow>(
          "SELECT * FROM agent_actions WHERE id=?",
          key,
        )!;
        if (
          action === "confirm" &&
          ["approved", "completed"].includes(current.status)
        )
          return false;
        if (action === "reject" && current.status === "rejected") return false;
        if (current.status !== "pending" || row.status !== "awaiting_approval")
          fail(409, "proposal_inactive", "This proposal is no longer pending.");
        if (action === "confirm") {
          if (agentActor(row).role === "viewer")
            fail(403, "read_only", "This membership cannot confirm changes.");
          try {
            if (!providerValid)
              fail(409, "provider_changed", "Provider changed.");
            validateAction(row, current);
          } catch {
            terminalAgent(
              row.id,
              "failed",
              "The proposal is stale or its authority/provider changed. Start a new run.",
              "stale",
            );
            return true;
          }
        }
        const decision = action === "confirm" ? "approved" : "rejected";
        run(
          "INSERT INTO agent_decisions(action_id,user_id,decision,created_at) VALUES(?,?,?,?)",
          key,
          ctx.userId,
          decision,
          now(),
        );
        run("UPDATE agent_actions SET status=? WHERE id=?", decision, key);
        if (action === "confirm")
          run(
            "UPDATE agent_runs SET status='queued',revision=revision+1,updated_at=? WHERE id=?",
            now(),
            row.id,
          );
        else terminalAgent(row.id, "cancelled", "The proposal was rejected.");
        return false;
      })
      .immediate();
    if (stale)
      fail(409, "proposal_stale", "The proposal is stale. Start a new run.");
    return json(agentDetail(agentRun(row.id)));
  }
  fail(404, "not_found", "Agent route not found.");
}
function agentEvents(req: Request, key: string) {
  let stop = () => {};
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      let closed = false,
        revision = -1,
        busy = false;
      const close = () => {
        if (closed) return;
        closed = true;
        clearInterval(timer);
        req.signal.removeEventListener("abort", close);
        try {
          controller.close();
        } catch {}
      };
      const tick = async () => {
        if (closed || busy) return;
        busy = true;
        try {
          const ctx = await context(req, "read");
          const row = authorizedRun(key, ctx);
          if (closed) return;
          if (row.revision !== revision) {
            revision = row.revision;
            controller.enqueue(
              new TextEncoder().encode(
                `id: ${revision}\nevent: snapshot\ndata: ${JSON.stringify(agentDetail(row))}\n\n`,
              ),
            );
          }
          // Queued interpretation jobs can revise a completed run; reconnect always snapshots.
          if (
            ["failed", "cancelled"].includes(row.status) ||
            (row.status === "completed" &&
              !one(
                "SELECT j.id FROM jobs j JOIN agent_jobs a ON a.job_id=j.id WHERE a.run_id=? AND j.status IN ('queued','running')",
                key,
              ))
          )
            close();
        } catch {
          close();
        } finally {
          busy = false;
        }
      };
      const timer = setInterval(() => void tick(), 1000);
      stop = close;
      req.signal.addEventListener("abort", close, { once: true });
      if (req.signal.aborted) close();
      else void tick();
    },
    cancel() {
      stop();
    },
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
