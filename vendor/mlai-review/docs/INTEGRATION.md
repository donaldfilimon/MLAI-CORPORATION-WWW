# Integrating the review without replacing the existing platform

## What was inspected

The existing MLAI integration repository was read at commit `f08203c58ce1c1ab5ce69f5790597a72d1bad830`. Its root README distinguishes web, mobile and Quasar validation. The `apps/web` README identifies the active Next.js application and warns against restoring the abandoned web migrations. This package changes none of those files.

Primary pointers:
- Existing root: https://github.com/donaldfilimon/MLAI-CORPORATION-WWW/blob/f08203c58ce1c1ab5ce69f5790597a72d1bad830/README.md
- Existing web surface: https://github.com/donaldfilimon/MLAI-CORPORATION-WWW/blob/f08203c58ce1c1ab5ce69f5790597a72d1bad830/apps/web/README.md
- Existing web package: https://github.com/donaldfilimon/MLAI-CORPORATION-WWW/blob/f08203c58ce1c1ab5ce69f5790597a72d1bad830/apps/web/package.json

## Safe migration sequence

1. Read the current app-local README, AGENTS instructions, content contracts and tests in a dedicated worktree. Preserve console/auth/API routes, runtime configuration, app-specific lockfile, provider policies and deployment workflows. Do not overwrite `apps/web` with this directory.
2. Port the approved visual system and relevant reusable components to existing app conventions. Keep product accents distinct from persona colors. Move revised public content into the existing canonical content layer, preserving claim provenance and source references rather than creating an independent second authority.
3. Treat a Next.js major-version upgrade as a separate, testable change. Verify async route APIs, build configuration, runtime behavior and security patches against current official documentation. The existing repository’s runtime and deployment model are not automatically replaced by the new brief’s Vercel preference.
4. Resolve the docs/content approach explicitly. The included headless Fumadocs integration is a candidate, not an installed or verified migration. Review its current APIs and MDX handling against the selected package versions, then confirm page-body compilation, routes, metadata, search content, source links and failure behavior in a real Next build.
5. Run the existing web gates, then focused browser tests against the actual Next server. The reviewed root README names `bun run check:web`; that gate is not evidence for mobile or Quasar. Validate React hydration, StrictMode cleanup, framework navigation, deep links, 404s, accessible dialogs, mobile breakpoint behavior and CSP requirements. Replace review-only assumptions only with verified application behavior.
6. Establish an approved production origin before enabling canonicals, sitemap, social metadata, indexing or deployment. Keep preview deployments noindex. Validate redirects and preserve established URLs. This package deliberately does not guess domain ownership or DNS settings.
7. Require a separate explicit rollout instruction before changing the production branch or domain. Retain an immutable rollback artifact and observe the real deployment health; do not infer success from a generated preview or an upstream README.

## Deliberate scope exclusions

No actual AI service, database, authentication, lead submission, billing, email, analytics, remote execution, operational telemetry, data migration, cloud provisioning or public deployment is added here. The brief composer is local-only. Do not convert its “prepared” message into a “sent” message without a verified delivery integration and appropriate user authorization.

## Visual choices to reconcile

The review uses native focus-managed dialogs, CSS transitions and system fonts. It does not pretend the requested shadcn/Base UI, Motion or Geist packages were installed. If the existing application already uses its own component primitives and token contracts, keep those contracts and transfer the design rather than duplicating incompatible primitives.

## Verification still required

A real dependency install and lockfile; full framework TypeScript resolution; a Next production build; headless Fumadocs macro/body compilation; React hydration and actual server navigation; browser coverage beyond Chromium; an automated accessibility audit plus manual assistive-technology review; approved-host SEO and CSP; and deployment/rollback checks. The offline review suite does not substitute for any of these.
