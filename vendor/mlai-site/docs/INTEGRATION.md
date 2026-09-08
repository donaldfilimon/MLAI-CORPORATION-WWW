# Integrating the review into the existing MLAI application

## Correct starting point

`donaldfilimon/MLAI-CORPORATION-WWW` already exists. The reviewed application README at commit `f08203c58ce1c1ab5ce69f5790597a72d1bad830` identifies `apps/web` as the active Quesar by MLAI website. It explicitly rejects restoring the prior Vite/Hono/Rust web migration directions. The review export is not a proposed replacement runtime.

Source: https://github.com/donaldfilimon/MLAI-CORPORATION-WWW/blob/f08203c58ce1c1ab5ce69f5790597a72d1bad830/apps/web/README.md

## Migration order

1. Work in a separately authorized branch/worktree of the actual repository. Re-read its current instructions, package manifest, and design-token contracts; the reviewed revision may no longer be main.
2. Inventory the existing public routes and private console. Do not overwrite auth, API routes, session/cookie handling, provider gateways, infrastructure, analytics/consent, or mobile/Quasar packages.
3. Port only the approved visual components, scoped content model, and documentation routes. Map the review CSS into the existing token system. Preserve the distinction between the ABI product and the Abi persona.
4. Evaluate the Next 15-to-16 upgrade separately. The manifest included here is an isolated candidate, not proof that the existing application can be upgraded by replacing package.json. Check async APIs, routing, cache behavior, middleware/proxy choices, runtime requirements, and package peer ranges against the actual app.
5. Install and compile the chosen Fumadocs combination. Generate real `.source` files, check MDX imports and heading anchors, and verify client/server boundaries. The review does not ship fake generated dependency types.
6. Replace native controls with the existing app's Base UI/shadcn wrappers only where they add value. Recheck dialogs, keyboard handling, responsive menus, clipboard fallback, and styling after that change.
7. Run actual repository gates from the correct checkout, including topology and web checks. Mobile and Quasar have independent verification boundaries; a web pass is not their pass.
8. Review source descriptions at an exact revision. Remove or update stale claims. Require artifacts for measured figures, and retain synthetic/reference labels where appropriate.
9. Deploy a no-index review only after explicit authorization. Test real route loads, hydration, headers, canonical/OG metadata, search, 404 handling, accessibility, Safari/Firefox, and production asset paths. Release to the actual domain only after its own approval.

## Required completion evidence

A real resolved lockfile; successful frozen install; clean lint and full type-check; successful production framework build; MDX rendering; direct HTTP route responses; no hydration/runtime errors; browser and accessibility tests; native clipboard success where supported; verified route-specific metadata; preserved private-app integration; rollback plan. None of these application-level checks is replaced by the offline HTML review tests.

## Official references used for the candidate

- https://nextjs.org/docs/app/getting-started/installation
- https://www.fumadocs.dev/docs/mdx/next
- https://www.fumadocs.dev/docs/mdx/collections
- https://www.fumadocs.dev/docs/mdx/entry
- https://raw.githubusercontent.com/fuma-nama/fumadocs/main/packages/core/package.json
- https://raw.githubusercontent.com/fuma-nama/fumadocs/main/packages/mdx/package.json

Current documentation shows a macro API; the inspected 15.0.7 MDX package manifest does not export `/macro`. This candidate therefore uses the documented configuration/`.source/server` entry API instead. Compatibility must still be confirmed by installation and build.
