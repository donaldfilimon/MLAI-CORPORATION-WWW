# Abbey Completion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Finish the approved local MLAI release with a persistent application agent whose writes require confirmation, alongside the project development agent.

**Architecture:** Keep Next/Node, existing authorized services, SQLite/Drizzle and the local/hosted provider adapter. Add a typed, durable agent runner and an Agent mode in the current Abbey view. Shared UI and development-agent integration are owned by the concurrent release task and must be preserved.

**Tech Stack:** Strict TypeScript, React, Next.js, Bun commands on Node, SQLite/Drizzle, Zod, Python/uv, Vitest and Playwright.

**Spec:** `docs/superpowers/specs/2026-09-06-abbey-completion-design.md`

## Global Constraints

- Work on local main; do not create branches/worktrees or overwrite another task's files.
- Every resource is workspace-authorized; only the requesting browser-session user may approve a proposal. No API-key access to agent endpoints.
- Eight tool steps, 300 seconds active processing; approval waiting excludes the budget. All writes need explicit individual approval.
- No automatic hosted fallback; hosted consent and configured provider are rechecked. No arbitrary shell/destinations, customer/staff actions, permission/provider/key changes, deletion or archive tools.
- No source excerpts or credentials in agent operational records. Source references are hydrated only after authorization.
- Preserve original logo, existing approved layouts and regular chat; test at 390/768/1440.
- Do not spawn helpers/reviewers from an implementation agent. The controller dispatches reviews.

### Task 1: Durable agent services, tools and lifecycle

**Own:** new `src/lib/server/agent*.ts`, `src/lib/agent-contracts.ts`, new numbered Drizzle migrations and journal entry, `tests/agent.test.ts`, and required integration edits to `src/lib/server/api.ts`, `src/lib/server/workspace.ts`, `src/lib/server/documents.ts`, `src/lib/server/embeddings.ts`, `scripts/worker.ts`, `scripts/restore.ts`, `src/lib/openapi.ts`. Do not change package/build/UI files or baseline verification scripts owned by the concurrent task.

**Interfaces:** Export run DTO/types and request schemas from agent-contracts. Export agentRoutes(req,path,ctx), acquireAgentRun(workerId), processAgentRun(run,workerId,signal), and source invalidation helpers from small server modules. Existing API dispatch mounts agent routes session-only. Worker shares bounded slots with extraction jobs and processes durable approved actions before further planning. Conversation detail returns agentRuns summaries for UI history. The implementation report must document exact exports and event names for Task 2.

- [ ] Add failing Vitest tests using isolated MLAI_DATA_DIR before server imports, fixture Better Auth sessions and stubbed generate output. Concrete invariants: POST run with foreign conversation is 404; API key access is 403; a create_project proposal creates zero projects before confirmation; double confirmation and expired-lease replay create exactly one project; a changed revision is stale; reject creates none; viewer write proposals fail; unknown tool/invalid JSON executes nothing; removed membership/deleted source prevent use; stopping run prevents results. Test provider failure makes zero hosted calls.
- [ ] Implement strict structured decisions with a Zod discriminated union. The shape is `{kind:"tool",tool:<allowlisted name>,input:<typed object>}` or `{kind:"answer",content:string}`. Use source-number citations with the existing checkedCitations function. Reject unknown fields/tools and malformed output; do not extract executable text or route user-supplied function names.
- [ ] Implement read tools with workspace/selection filters and bounded output; persist only counts, resource IDs and source references. Implement immutable write proposals for create_project(name,description?), update_project(project_id,name?,description?), associate_document(document_id,project_id|null), interpret_documents(document_id,kind,compare_with?). Include affected names/values and revisions in DTOs; no input replacement on confirm.
- [ ] Add migrations for runs, steps, actions, decisions and results, resource revisions and indexes. Create deterministic target IDs when proposing, then atomically apply approved writes and publish results in one transaction. Reuse/refactor existing service logic so agent and manual routes share validation and notifications.
- [ ] Implement leases, active-time accounting, consent/provider rechecks, cancellation, failure status, approval waiting and SSE revision replay. Recover running leases and approved actions after restart; never auto-approve. Restore preserves pending proposals. Delete sources invalidates references/proposals without retaining excerpts.
- [ ] Extend extraction/embedding cancellation to abort indexing and owned parser descendants, enforce processing deadlines throughout, and reject publication after cancel/delete. Keep graceful-stop requeue state truthful.
- [ ] Run `bunx vitest run tests/agent.test.ts tests/api.test.ts tests/models.test.ts` and `bun run typecheck`. Format only owned files. Commit only owned paths after checking staging. Write the report with exact commands/output, exported contracts, migration and lifecycle decisions.

### Task 2: Agent workspace controls and confirmed-action browser flow

**Own:** new `src/components/agent-view.tsx`, new agent-specific stylesheet imported by that view if needed, edits to `src/components/chat-view.tsx`, `src/components/app-context.tsx`, `src/components/use-drawer-focus.ts`, and `tests/e2e/agent.spec.ts`. Shared packages/ui and global CSS are owned by the concurrent task: use existing classes or a scoped stylesheet. Read Task 1's exact DTO/exports from its report before implementing.

**Interfaces:** Consume agent run DTO/schema; POST /agent/runs with conversation_id, objective and document_ids. Subscribe to run snapshot events with persistent event IDs. Use conversation.agentRuns on reopening. Confirmation/rejection POST only stored action ID; never send replacement tool inputs. Normal chat remains the initial/default mode.

- [ ] Add a browser fixture test with deterministic structured-provider responses and isolated account/workspace: start Agent mode, inspect authorized source, observe pending create-project card and unchanged project list, refresh, confirm, verify one project, reload again, reject a second proposal and verify none. Verify comparison/interpretation cards show queued job IDs rather than claiming completed summaries.
- [ ] Implement an Ask/Agent mode switch, objective composer, provider/model display, activity/steps, citations and cancellation. Review cards show exact affected records and proposed values with Confirm/Reject. Show queued/processing/waiting/complete/failed/cancelled/stale/provider unavailable states. Disable writes for viewers and stop rejected runs without alternative writes.
- [ ] Preserve mode/run/conversation selection across refresh and reopening using query parameters plus conversation summaries. Close streams on unmount/workspace change. Fix useData stale-response publication with a generation guard so older requests cannot populate a newly selected workspace or resource.
- [ ] Make drawers react to viewport changes, manage focus/restoration and Escape/Tab correctly, and expose accessible names. Wait for loaded records and settled transitions before screenshot assertions. Test no horizontal overflow at 390, 768 and 1440.
- [ ] Run the new agent browser workflow and existing account/chat/workspace browser regressions using the coordinated test-server slot; do not kill another task's processes. Run typecheck and format owned files. Commit owned paths and report exact screenshots/test evidence.

### Task 3: Real local agent and restored-proposal acceptance

**Own:** new `scripts/verify-agent.ts`, `scripts/verify-agent-restored.ts`, agent-specific verification receipts and developer notes. Coordinate any package command/README/ledger edits with the concurrent task. Do not alter its baseline verification scripts.

**Interfaces:** Exercise the actual agent API/worker through isolated accounts and data, explicit MLAI_MODEL_URL/ID, and the existing backup/restore commands. Use shared contracts, not unchecked response casting. Add `verify:agent` through coordinated package configuration once the script is ready.

- [ ] Create an isolated fixture installation, connect explicitly to the existing dedicated local model, upload a known architecture source and run a real Agent investigation. Assert actual returned answer/citations resolve to that fixture and no invented tool succeeds.
- [ ] Ask for a project creation, assert waiting state and unchanged records, confirm and assert exactly one project. Request interpretation and verify a persisted job followed by real completion. Record actual provider/model and outcome without prompt/excerpt logs.
- [ ] Back up while a new proposal waits. Restore into a different temporary data directory and fresh process, retain waiting status, test unauthorized confirmation, confirm with the requester, replay confirmation and prove no duplicate. Repeat a representative customer workflow and sourced answer.
- [ ] Verify cancellation, expired leases, deleted sources and pending proposals survive/recover or fail explicitly. Preserve user services and private state; cleanup only exact generated fixture directories and owned child processes.
- [ ] Run format/type/unit/browser gates and coordinated combined release checks. Save source identity and separate agent/development/UI/baseline receipts. Update the ledger only after results exist, preserving hosted-unverified status when credentials are absent. Commit owned work and hand final review the whole committed range plus remaining working-tree inventory.
