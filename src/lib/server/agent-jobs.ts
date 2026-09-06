import { validateAction, type ActionRow } from "./agent-actions";
import { expectedSelection, type AgentRunRow } from "./agent-store";
import { one, run } from "./db";
import { runInterpretation } from "./documents";
import { fail, now } from "./http";

/** The persisted proposal and linkage are authoritative, not the job payload. */
export async function processAgentInterpretation(
  jobId: string,
  workerId: string,
  attempts: number,
  signal: AbortSignal,
): Promise<void> {
  const validate = () => {
    signal.throwIfAborted();
    const job = one<{ document_id: string; run_id: string }>(
      "SELECT j.document_id,aj.run_id FROM jobs j JOIN agent_jobs aj ON aj.job_id=j.id WHERE j.id=? AND j.kind='interpret' AND j.status='running' AND j.worker_id=? AND j.attempts=? AND j.lease_until>?",
      jobId,
      workerId,
      attempts,
      now(),
    );
    if (!job)
      fail(409, "lease_lost", "Interpretation no longer owns this job.");
    const row = one<AgentRunRow>(
      "SELECT * FROM agent_runs WHERE id=?",
      job.run_id,
    );
    if (!row || ["cancelled", "failed"].includes(row.status))
      fail(409, "agent_stopped", "The requesting agent run has stopped.");
    const action = one<ActionRow>(
      "SELECT * FROM agent_actions WHERE run_id=? AND target_id=? AND tool='interpret_documents' AND status='completed'",
      row.id,
      jobId,
    );
    if (
      !action ||
      !one(
        "SELECT action_id FROM agent_decisions WHERE action_id=? AND user_id=? AND decision='approved'",
        action.id,
        row.user_id,
      )
    )
      fail(
        403,
        "confirmation_required",
        "The requester must confirm this interpretation.",
      );
    const { ctx, decision } = validateAction(row, action);
    if (
      decision.tool !== "interpret_documents" ||
      decision.input.document_id !== job.document_id
    )
      fail(
        409,
        "invalid_job",
        "The interpretation does not match its confirmed action.",
      );
    return { row, ctx, input: decision.input };
  };
  const selected = validate();
  const { document_id, ...data } = selected.input;
  await runInterpretation(
    selected.ctx,
    document_id,
    data,
    signal,
    expectedSelection(selected.row),
    () => {
      validate();
      // runInterpretation invokes this guard in the same transaction as its insight.
      run(
        "UPDATE jobs SET status='complete',worker_id=NULL,lease_until=NULL,error=NULL WHERE id=? AND worker_id=? AND attempts=? AND status='running'",
        jobId,
        workerId,
        attempts,
      );
    },
  );
}
