# Build notes — read before shipping

## Deploying to GitHub Pages from docs/

    bun run build

Settings → Pages → Source: **Deploy from a branch**, Branch `main`, Folder `/docs`.

**Project site** (username.github.io/repo):

    BASE_PATH=/mlai bun run build

**Custom domain**: leave BASE_PATH unset and add `public/CNAME` containing the domain.

## This project is nested inside mlai-website-app

The generator assumes `mlai-web` is its own repository. Here it lives as a
subdirectory, which changes two things:

- **`.github/workflows/pages.yml` does not run.** GitHub only reads workflows from
  the repository root. To deploy from here, either split `mlai-web/` out into its
  own repository (the generator's intent), or move the workflow to the parent's
  `.github/workflows/` and add `working-directory: mlai-web` to every step — noting
  that it would then commit `mlai-web/docs/` onto the parent's default branch.
- **It is outside the parent's own gates,** by construction. The root
  `tsconfig.json` includes only `src/`, `scripts/`, `tests/` and root `*.ts`, and
  `format:check` names its paths explicitly, so the root `bun run check` neither
  typechecks nor formats this project — and nothing here can break it. This project
  is checked instead by `.github/workflows/mlai-web.yml` at the repository root,
  which runs `lint`, `typecheck`, `build` and asserts all 11 routes rendered,
  filtered to `mlai-web/**`. It verifies only; it does not deploy.

## Deliberate omissions

- **No /investors page.** A public page announcing a raise and inviting investor
  enquiries is general solicitation, which is incompatible with a Rule 506(b)
  private offering. Add it back only under 506(c), or behind authentication, with
  counsel's sign-off.
- **No /services page.** The system design lists nine engagements; there is no
  evidence of a services business yet, and inventing one repeats the failure mode
  the repository's claims audit exists to prevent.
- **No entity form claimed.** `org` in brand.ts says "MLAI", not "Inc." Verify the
  Delaware registration on the Division of Corporations entity search before adding
  it back. Claiming a corporate form you do not have removes the liability shield
  you were trying to invoke.

## Open items

1. **Trademark clearance.** "Aviva" is a large multinational insurer with an active
   enforcement history; "Abbey" has financial-services history. Renaming a persona
   costs nothing today and a great deal after launch.
2. **Legal pages** are drafts full of [BRACKETS]. Not legal advice.
3. **Self-host fonts** (`@fontsource/sora`, `@fontsource/manrope`,
   `@fontsource/jetbrains-mono`) to drop the Google Fonts request. The privacy page
   currently discloses it.
4. **Benchmarks stay em-dash** until a reproducible harness exists. `lib/brand.ts`
   is the only file to edit when that changes — never a component.
5. **The repository moved from Zig to Rust.** Docs copy in `lib/content.ts` and the
   build commands in `app/docs/page.tsx` still say `zig build`. Reconcile against
   whatever the main branch actually is before launch.

## Architecture contract

- `lib/brand.ts` — facts. Every metric has a provenance tag.
- `lib/content.ts` — prose. Introduces zero new numbers.
- `components/` — render data. Never hard-code a claim.

If you find yourself typing a number into a component, it belongs in brand.ts with
a tag instead.
