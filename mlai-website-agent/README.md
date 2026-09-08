# MLAI website agent scaffold

This package is a retained Eve scaffold for a possible future MLAI agent adapter. It is deliberately **non-deployable** and is not the application's production agent runtime. The deployable product remains the application-owned implementation under `../src/lib/server/agent-*`, where Better Auth sessions, workspace authorization, model consent, source access, proposals, confirmation, leases, replay protection, cancellation, and invalidation are enforced together.

## Current fail-closed boundary

- The Eve channel accepts only Eve's synthetic local-development identity. Anonymous callers, Bearer tokens, Vercel OIDC identities, and every non-development caller receive `401` before session dispatch.
- The model is a dynamic refusal. No model identifier, Vercel AI Gateway route, hosted credential, direct provider, or fallback is configured.
- Eve's optional default tools are disabled and this package declares no authored tools or connections.
- The package is private. `bun run deploy` exits with status 1 and explains why deployment is blocked.
- `eve build` is only a compilation check. A successful build is not deployment readiness or permission to publish the output.

Local development can inspect the channel and compiled agent, but every model step still fails deliberately. Use the main MLAI application for real local-model and authorized agent workflows.

## Verification

Run from this directory:

```bash
bun run verify
```

The verification sequence runs the Node behavior tests, TypeScript, and the Eve build. The behavior tests exercise the production route handlers, the dynamic model resolver, disabled default-tool configuration, and the refusing deployment command.

## Better Auth decision

Do not create another Better Auth instance in this package. Authentication is not sufficient by itself: MLAI authorization also resolves and verifies the workspace, membership, role, resource access, request origin, rate limit, and session-only agent policy. Eve route authentication does not add durable-session ownership checks.

A future adapter may reuse the existing `../src/lib/server/auth.ts` instance only when Eve runs on the same origin and application runtime, shares the same private SQLite/auth state, and can enforce the application-owned checks below on every route. Importing Better Auth into an independent deployment, accepting a Vercel identity, or merely validating the MLAI cookie does not satisfy this boundary.

## Prerequisites before deployment can be enabled

All of the following require separate evidence tied to the source being deployed:

1. Mount Eve behind the existing Next.js application on the same origin and runtime. Do not deploy it as an independently authenticated service or create separate auth tables, cookies, secrets, or workspace state.
2. Add a session-only adapter around the existing Better Auth session lookup. Reject every `Authorization` header, validate request origin, resolve a server-controlled or validated workspace, verify current membership and role, and attach stable user and workspace identifiers.
3. Persist the initiating user and workspace for each Eve session. Reauthorize ownership on session creation, follow-up, inspection, streaming, cancellation, clearing, compaction, reset, resume, and every callback or continuation surface. Membership revocation must remove access immediately.
4. Resolve the model from MLAI's operator-owned connection configuration and the authenticated workspace's stored selection. Recheck the selection and hosted consent before every hosted call and after provider or consent changes. A failed local provider must stop the turn without contacting AI Gateway or another provider.
5. Keep `defaultTools: false`. Add back only reviewed capabilities whose reads use workspace-scoped resource authorization and whose writes preserve proposal, initiating-user confirmation, revision checks, lease ownership, idempotency, cancellation, replay protection, and source invalidation.
6. Verify that runtime storage, workflow persistence, logs, traces, error reporting, and deployment artifacts exclude raw prompts, document bodies, source excerpts, cookies, credentials, and secrets. Define and test retention and deletion behavior for Eve session state.
7. Run a frozen Bun install and prove there is no undeclared hoisted dependency. Review current vulnerability, malware, license, and policy evidence for Better Auth, Eve, AI SDK, Vercel Connect, Nitro, and their transitive dependencies. Eve `0.52.2` is preview software and uses a beta Nitro runtime, so compatibility and upgrade behavior need explicit acceptance.
8. Record distinct passing evidence for type/build, production authentication, cross-user and cross-workspace isolation, durable-session ownership, membership revocation, local-only failure, explicitly consented hosted processing, no-silent-fallback, trace redaction, persistence/recovery, and browser acceptance. Only then may the deployment refusal and model refusal be reconsidered.

The current package intentionally provides no escape hatch or environment variable that bypasses these prerequisites.
