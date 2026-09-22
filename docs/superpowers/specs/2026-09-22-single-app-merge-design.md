# Single-app merge design — 2026-09-22

Status: approved design, execution in phases. Supersedes the "apps remain
independent" boundaries listed in §Superseded boundaries. Decisions are
Donald's (2026-09-22); capability statements are grounded in repository
source, never in the WDBX research narrative.

## Goal

Merge the five MLAI surfaces (`apps/quasar-web`, `apps/mobile`, `apps/quasar`,
`apps/website-app`, `apps/research-sites`) into **one Next.js 16 application**
at `apps/mlai`, served on the web from Cloud Run and on iOS/Android through a
**Capacitor** shell, with **one identity (Better Auth)**, **one design system**,
and **one store contract (`@mlai/store`)**. Motivation: too much code to
maintain; visual design unified in-repo.

Measured starting point: the five apps share three types
(`@mlai/contracts`) and five colours (`@mlai/design-tokens`). The real
duplication is the design layer (tokens in three places, two component
libraries). Everything else is disjoint: Next 15 vs 16, react `19.2.5` exact
vs 19.3, TypeScript 6 vs 7, Vitest 4 vs 5, WorkOS invite-only vs Better Auth
open signup, Postgres-only vs SQLite-only, Bun runtime vs Node-only native
addons and Python subprocesses.

## Decisions

| Area | Decision | Retires |
|---|---|---|
| Shape | One codebase, one app, one deployable | Five app gates and five entry points |
| Host runtime | Next.js 16 App Router; RSC, route handlers, standalone Cloud Run image, CSP pipeline stay | Expo apps as separate runtimes |
| Native | Capacitor shell loading the hosted origin; plugins: Apple sign-in, secure storage, a Swift CloudKit plugin ported from `apps/mobile/modules/mlai-cloudkit` | expo-router, Metro, jest-expo |
| Identity | Better Auth only (reference: `apps/website-app/src/lib/server/auth.ts`); Apple via a Better Auth social provider; admin reads stay fail-closed on an allowlist | WorkOS AuthKit, its MFA policy, the audited admin path, the request-access funnel (`apps/quasar-web/AGENTS.md:68`) |
| Design | `packages/design-tokens` is the runtime source for every surface, including a generated `src/index.css`; one `@mlai/ui` on shadcn + `@base-ui/react` | `apps/website-app/packages/ui` (radix), per-app token copies |
| Store | `@mlai/store` interface with two backends: **WDBX** for episodes, provenance receipts and vectors (over the existing gRPC gateway contract); **Postgres (Cloud SQL)** for relational state and Better Auth | SQLite (`better-sqlite3`), drizzle SQL migrations, quasar-web's inline `MIGRATIONS` array as a separate mechanism |
| Vault | Stays on-device: CloudKit on iOS, encrypted local storage elsewhere. Never server-side without a separate privacy decision | nothing |
| Sidecars | Quasar's `@quasar/service` and website-app's Python worker are optional local services discovered by configuration, health-checked, reported "unavailable" when absent; no `child_process` spawns in the Next server | in-process spawning |
| Execution | Incremental in the monorepo; `bun run check` green after every phase | big-bang rewrite |

## Store: what WDBX implements today (grounded 2026-09-22)

Sources: `~/dev/active/wdbx/crates/abi-wdbx`, `~/dev/active/abi/crates/abi-wdbx-gateway`,
`apps/website-app/src/lib/server/{console.ts,gateway.proto}`, and abi's
`docs/contracts/external-claims-audit.mdx`.

| Capability | Status | Evidence |
|---|---|---|
| Durable single-node store | Implemented | `durable.rs`, `versioned.rs`, CRC32 WAL with `sync_all`, v1→v2 migration with byte-verified backup; 368 tests |
| Vector search | Implemented | HNSW cosine; v2 ≤ 4096 dims |
| Provenance / episodes | Partial | append-only ledger, digest-chained receipts, Ed25519 signing; queries by `guild_ref` window or digest only; 64 MiB cap |
| Relational data | Not implemented | no SQL/table/schema; KV is exact-key string→string, no scan, range, delete or secondary index |
| Transactions | Partial | atomic multi-mutation `commit`; no isolation levels, no interactive sessions |
| Tenant scoping / RBAC | Not implemented | one bearer token per gateway; audit marks RBAC "False" |
| gRPC gateway | Implemented | 10 RPCs (`PutVector, Search, PutKv, GetKv, ResolveConflict, Stats, MembershipChange, WatchMutations, ProposeEpisodeWrite, VerifyEpisode`); fronts exactly one store; TLS/mTLS; 22 integration tests |
| Backup / restore | Partial | checkpoints, compaction, exact transaction export/import; no restore command, no PITR |
| Replication | Partial | quorum replicate, read repair, rebalance over an in-process trait; loopback 3–9 process demo; **not wired to the gateway** |
| Sharding | Vision | types only; `docs/spec/cluster-mtls-ops.mdx`: "Not implemented (stays Proposed)" |
| Multi-node hosting | Vision | `cluster.rs`: "not yet integrated into durable consensus, data movement, or production multi-host operation"; `cluster serve` uses a scratch store deleted on exit |

Better Auth's adapter contract (`CustomAdapter`: `create, update, updateMany,
findOne, findMany, delete, deleteMany, count`, eleven `where` operators,
`sortBy`, `offset`, optional `join`) has no primitive on the gateway
contract, and the app's relational model (37 tables, cascades, partial
unique indexes, FTS triggers, transactions in 15 call sites) cannot be
expressed on exact-key KV. Therefore:

- `@mlai/store` exposes repositories, not a database. Backends: `wdbx`
  (episodes, receipts, vectors, mutation watch) and `postgres` (everything
  relational, including Better Auth through its Postgres adapter).
- Workspace exclusivity of a WDBX gateway (`apps/website-app/AGENTS.md:53`)
  is kept as a Postgres `bindings` row per gateway URL, exactly as today.
- "Multi-node hosting" means N stateless app instances on Cloud Run behind
  the existing load balancer (`apps/quasar-web/infra/{edge,services}.tf`).
  The WDBX tier is one gateway node per bound workspace with checkpoint plus
  transaction-export backups. Replication and sharding are `wdbx` repository
  work and are not claimed here.

## Superseded boundaries (dated annotations, text retained)

- Root `AGENTS.md` Boundaries: website not an Expo mock; mobile's CloudKit vs
  local split; root is orchestration only.
- `docs/four-app-journeys.md:15` "Authentication and storage stay independent."
- `docs/integration-hardening.md:7-8` "Four apps remain independent."
- `docs/website-app-integration.md:26-27` "authentication, data stores and public routes remain distinct."
- `apps/website-app/AGENTS.md:8-9` (quasar-web canonical; WDBX external) and
  `:51` (local AI never falls back to hosted) → per-workspace explicit model
  choice with hosted allowed as a default.
- `apps/mobile/AGENTS.md:107` "There is no shared MLAI backend" → accounts and
  workspaces are shared; Vault data is not.
- `apps/research-sites/AGENTS.md:35-36` distinct from website-app → becomes a
  build output of the merged app after publication is approved from the new path.

## Phases (each ends with `bun run check` green)

0. Ground the store decision (done above).
1. Revise boundaries in writing; this spec; ledger entry.
2. Close code-side finish items; hand over the external-stop list.
3. One toolchain: quasar-web to Next 16 / react 19.x caret / TS 7 / Vitest 5.
4. One design system: tokens generated from `packages/design-tokens`; `@mlai/ui`
   on shadcn + base-ui; website-app screens ported.
5. One Next app `apps/mlai`: rename; Better Auth on `@mlai/store`; workspace
   routes under `/app/*`; sidecars by URL; Quasar screens as routes;
   research export as build output; CSP extended.
6. Capacitor shell with Apple sign-in, secure storage and the CloudKit plugin.
7. Remove `apps/website-app`, `apps/mobile`, `apps/quasar/apps/quasar`,
   `apps/research-sites`; trim workspaces, `check:*`, CI, `check-topology.ts`,
   `bunfig.toml` `hoistPattern`.

## What is not claimed

No hosted deployment, CloudKit sync, live Anthropic generation, or WDBX
multi-node behaviour is claimed from local builds. External stops (Donald):
VoiceOver pass, `/tf-pose-demo` with a webcam, signed-device CloudKit, an
Anthropic key for Quasar acceptance, the self-hosted runner registration
token, Cloud Run `WIF_PROVIDER`/`GCP_PROJECT_ID`, research-sites publication.
