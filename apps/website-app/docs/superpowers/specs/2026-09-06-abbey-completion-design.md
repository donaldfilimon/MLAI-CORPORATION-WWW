# MLAI completion and Abbey agents design

Approved by Donald's explicit implementation request on 2026-09-06. The full accepted plan in the task is authoritative. Baseline is commit `1d4b727`; existing UI, accounts, source storage and customer operations must remain intact.

## Delivery boundaries

Complete the shared `packages/ui` integration and project `.claude/agents/abbey.md` development agent, then add an in-app Agent mode separate from ordinary chat. The concurrent integration task owns the shared UI, package/build configuration, development-agent validation and baseline release receipts. This plan's controller owns application-agent changes and their integration. Coordinate shared-file edits before modifying them. Work on local main as explicitly requested; preserve concurrent changes and stage only owned paths.

## Application agent

A session-authenticated workspace member starts an agent run associated with a conversation and optional selected documents. Read tools are list_projects, list_documents, search_documents, inspect_source and read_interpretations. Writes are create_project, update_project (name/description only), associate_document (project or null) and interpret_documents (existing summary/classification/key_facts/action_items/comparison kinds). Every write requires its own immutable review card and explicit confirmation by the requesting user. Viewers may investigate but cannot propose/confirm writes. Rejection stops the pending run; no replacement write is substituted. No deletion/archive, permission/provider/key/customer changes, shell, arbitrary destinations or development tools.

Use the existing local/hosted adapter with validated structured JSON output; malformed plans fail without tool execution. Preserve visible selected provider/model and no automatic fallback. Recheck actor membership, hosted consent and selected provider before calls and writes. Limit runs to eight tool steps and 300 seconds of active processing, excluding waiting for approval. Bound tool context and model output. Final answers reuse authorized citation validation. Documents remain untrusted data.

## State and interfaces

Add shared schemas and `/api/v1/agent/runs` POST, `/runs/:id` GET, `/runs/:id/events` GET, `/runs/:id/cancel` POST, and `/actions/:id/confirm|reject` POST. All are session-only. Creation accepts conversation_id, objective and optional document_ids. GET returns run identity/status/provider, steps, immutable actions with affected-resource revisions and decision/result states, answer/citations and sanitized error. SSE uses durable run revision as event ID and can send a refreshed run DTO on reconnect. Conversation detail exposes agent run summaries so reopening conversations restores history without depending on volatile component state.

Store runs, tool-step metadata/source references, proposals, approvals and results in SQLite migrations. Add monotonic resource revisions needed to reject stale project/document proposals. Never persist retrieved source excerpts as tool logs; hydrate authorized references for model context. Source deletion invalidates affected proposals/runs, removes their source references, and marks historical citations removed. Keep user conversation content according to existing history semantics.

Worker leases recover queued/running work. Approval persists approval only; worker applies the stored action. Write and action-result publication share a SQLite transaction with deterministic new-record IDs, making replay/restart exactly-once for project creation and interpretation jobs. Waiting-for-confirmation releases worker capacity. Cancellation aborts model/extraction/indexing children and prevents later publication. Backup includes agent records; restore requeues interrupted work but retains waiting proposals and their revisions.

## Acceptance

Keep baseline tests. Add authorization, viewer/key/foreign-workspace, tampering, stale/revoked/deleted source, duplicate-confirmation, invalid JSON, forbidden tools, injection, provider-failure/no-fallback, limits/cancel/lease recovery tests. Browser flows cover pending/confirmed/rejected proposals and source inspection at 390/768/1440 with keyboard focus. Run a real local-model investigation, answer/citation, confirmed project action and queued interpretation. Restore a pending proposal in a separate installation and prove authorization/idempotency. Final source must pass formatting, check, browser, live integrations and clean install. Hosted live checks remain explicitly unverified without credentials. No hosting, billing, mail, global configuration or sibling edits.
