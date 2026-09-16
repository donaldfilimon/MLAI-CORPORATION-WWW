# MLAI Design-Derived Static Export Verification

Verified on June 19, 2026.

## Scope

This project is a design-derived static export for the MLAI website handoff. It is not the authoritative production application. The production website remains `/Users/donald/sources/repos/MLAI-CORPORATION-WWW`, which uses Next.js App Router, React, and Bun.

This handoff keeps the same architectural boundaries:

- Static pages are exported through Next.js with `output: "export"` and `trailingSlash: true`.
- Browser scripts are generated from Bun/TypeScript sources into `public/neural.js` and `public/canvases.js`.
- The exported artifact is `out/`; direct static-host paths should resolve through folder `index.html` files.
- External claims should stay grounded in checked-in functionality. Unsupported performance, security, compliance, or distribution claims should be framed as targets or removed.

## Verification Performed

The current `out/` artifact was served locally with:

```bash
python3 -m http.server 8125
```

The following paths returned HTTP 200:

- `/`
- `/platform/`
- `/research/`
- `/contact/`
- `/abbey/`
- `/abi/`
- `/architecture/`
- `/wdbx/`
- `/services/`
- `/company/`
- `/investors/`
- `/docs/`
- `/404/`
- `/sitemap.xml`
- `/robots.txt`
- `/neural.js`
- `/canvases.js`
- `/og/og-home.png`
- `/og/og-personas.png`
- `/og/og-wdbx.png`

## OG Assets

The route-specific Open Graph cards are present in both `public/og/` and `out/og/`.

All three cards are valid 1200 x 630 PNG files:

- `og-home.png`
- `og-personas.png`
- `og-wdbx.png`

The source and exported copies have matching SHA-256 hashes for each card, so the current export is in sync with the checked-in public assets.

## Handoff Notes

- Keep `next.config.ts` as TypeScript; do not replace it with a `.mjs` config.
- If OG cards are replaced by temporary generic copies in a future export, update `public/og/README.txt` and the generated `out/og/README.txt` before handoff.
- If routes are added, re-run the local static-server route check against the trailing-slash paths and update this file.
