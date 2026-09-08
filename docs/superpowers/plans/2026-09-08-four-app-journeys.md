# Four-app core journeys implementation plan

User-approved roadmap from 2026-09-08. Baseline: 720b403. Deliver independently in order:

1. Abbey: derived onboarding, explicit provider reachability, recoverable document/question flows, transparent citation inspection, and 3 scenarios × 5 local-model evaluations with every result retained.
2. Web: Products/Research/Docs/Company + Get started navigation; equal ABI/Abbey/WDBX/Quasar discovery; accurate setup actions and reciprocal research links; metadata, sitemap and static Pages parity.
3. Mobile: preserve unreadable local vault bytes, validated serialized mutations, recoverable UI and stale-refresh protection; accurate CloudKit availability.
4. Quasar: persist/validate origin, hydrate before requests, bounded cancellable requests, isolate stale server responses, reconnect without automatic mutation replay, separate preview/generation state.

Keep public HTTP contracts, schemas, authentication, native CloudKit records, app-owned copy and independent workspaces. Retain visual identity, active installation and provider settings. No production cutover, provisioning, Vercel deletion or standalone agent deployment.

Each milestone: targeted regressions, app-native gates, scoped review/commit on canonical main, normal push, all five CI jobs, Pages publication and Cloud Run readiness outcome. Final: all four gates, immutable receipts, explicit manual/device/provider gaps. New browser output and receipt names preserve historical evidence.
