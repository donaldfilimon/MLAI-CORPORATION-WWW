# Next handoff excerpts (Research / Company / Contact / Investors)

Adapted from `design_handoff_mlai_next/README.md` (2026-09-05). Site `*.dc.html` files remain **visual references only** — do not ship them. Port views/data into this app’s composed pages + `@mlai/ui`; do not dump a second Next tree or a second design system.

## Architecture freeze (this polish lane)

1. Port Research / Company / Contact / Investors first.
2. `/knowledge` + `/repositories` later.
3. `/quesar/*` = private-ops UI — **never** IWL naming.
4. Do **not** lift Home/Benchmarks StatBlocks until provenance exists.
5. Lab tokens already on `main` — no Sora / Manrope / `#00D4FF` regression.
6. Reuse `@mlai/ui` + existing `/docs` shell; thin App Router → client/composed views; content in data modules.
7. Swift Abbey Manager is out of this repo.

## Claims discipline (non-negotiable)

- Every public figure needs provenance (`measured` | `target` | `reported`) before it ships as a StatBlock / ThroughputCard.
- Do not add QPS / latency / accuracy / TAM / raise figures without a harness or brand artifact.
- Investors stays **deliberately non-numeric** on public surfaces.
- Product accents (wdbx cyan · abi violet · abbey emerald) are separate from persona colors (Abbey emerald · Aviva violet · Abi cyan).
- **IWL** is Abbey **product** naming only — not console / Quesar / private-ops.

## Screen intent (ported into existing pages)

### Research (`src/components/research-pages.tsx`)

- Hero: figures with receipts; library inventory counts only.
- Three thematic lines of work (WDBX Core · Agent Safety · Runtime Performance) linking into source-reviewed overviews.
- Keep the existing publication index / filters (do not replace with a second archive).
- Formal model section may show WDBX scoring / authority / hash-chain equations from papers — **not** comparative “vs GPT-4” grids or energy StatBlocks from the HTML mock.
- NextUp → WDBX + Platform.

### Company (`src/components/company-page.tsx`)

- Why MLAI exists; Delaware C-Corp · Orlando.
- Founder split, operating principles, registration facts (SpecList), public projects, hiring seats.
- IWL only when naming the assistant product surface.
- NextUp → Investors + Contact.

### Contact (`src/components/contact-page.tsx`)

- Two-up: copy + privacy callout + elsewhere links | wired `@mlai/ui` ContactForm → `/api/v1/inquiries`.
- Same inbox for deploy · pilot · partner · invest.

### Investors (`src/components/investors-page.tsx`)

- Figure-free thesis cards + open-core model facts.
- Explicit refusals: no TAM, ARR, customers, funding rounds, or invented team size on this page.
- Deck request via Contact; diligence via Research / Architecture.

## Deferred (do not sneak into this PR)

- Home / Benchmarks StatBlock grids from handoff.
- Knowledge / Repositories claims ledgers.
- ~~Quesar consent / audit mocks.~~ Shipped on `redesign/quesar-private-ops` (`/quesar`, `/quesar/consent`, `/quesar/audit`).
- Wholesale chrome replace (nav/footer already shipped in earlier slices).
