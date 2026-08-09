# Deploying to Google Cloud Run

This app is a **single Next.js 15 process** that serves the marketing pages **and**
the `/api/*` route handlers (WorkOS AuthKit, the protected console, LLM, billing,
inquiries, telemetry). It needs a running server, so it is deployed to **Cloud Run**,
not a static host.

> GitHub Pages / static export is **not** a supported target: it would drop every
> `/api/*` route and break auth, the console, billing, inquiries, and telemetry.

## What's in the repo

- [`Dockerfile`](../Dockerfile) — multi-stage `oven/bun` build; the runner executes
  `next start` on Cloud Run's injected `$PORT`.
- [`.dockerignore`](../.dockerignore) — keeps secrets (`.env`), the local SQLite DB
  (`inquiries.db`), `.git`, and `node_modules` out of the image.
- [`.github/workflows/deploy-cloudrun.yml`](../.github/workflows/deploy-cloudrun.yml) —
  deploys **after a successful CI run for a push to `main` in this repository**
  (and via **Run workflow**). It runs `gcloud run deploy --source .`, which builds
  the Dockerfile with Cloud Build.

  The job's `if:` requires all three of `conclusion == 'success'`,
  `event == 'push'`, and `head_repository.full_name == github.repository`. That
  last clause is the trust boundary: the repo is public, and for a pull request
  opened from a fork's own `main` the `workflow_run` payload reports
  `head_branch == "main"`, so a branch-name filter alone would let a fork's
  commit be checked out and handed to Cloud Build **with the production secrets
  attached**. Do not relax any of the three.

## One-time setup

### 1. GCP project + APIs

```bash
gcloud config set project YOUR_PROJECT_ID
gcloud services enable run.googleapis.com cloudbuild.googleapis.com \
  artifactregistry.googleapis.com secretmanager.googleapis.com
```

### 2. Runtime secrets in Secret Manager

The workflow wires these in with `--set-secrets`. Required:

```bash
printf '%s' "sk_live_..."                 | gcloud secrets create WORKOS_API_KEY   --data-file=-
printf '%s' "client_..."                  | gcloud secrets create WORKOS_CLIENT_ID --data-file=-
printf '%s' "$(openssl rand -base64 32)"  | gcloud secrets create SESSION_SECRET   --data-file=-
```

Optional (add them to the `--set-secrets` list in the workflow once created):
`GEMINI_API_KEY`, `STRIPE_PAYMENT_LINK`, `ADMIN_EMAILS`, `ADMIN_REQUIRE_MFA`.
See [`.env.example`](../.env.example) for what each one does.

> **`APP_URL` is not in that list, and is not a secret.** It is a public origin and a
> **required repo variable** (next section). It used to be filed here as an optional
> secret, and that misclassification is why it was never set: `workos.ts` builds the
> OAuth redirect URI as `${APP_URL}/api/auth/callback` and defaults to
> `http://localhost:3000`, which WorkOS does not have registered — so **every deployed
> revision had login and signup broken for every visitor**, while the pages themselves
> still returned 200 and both verification `curl`s below still passed.
>
> Setting it by hand in the Cloud Run console does not stick either: the workflow's
> `--set-env-vars` **replaces the entire env set** on each deploy. The workflow now
> fails fast with an `::error::` if the `APP_URL` variable is unset, rather than
> shipping a site nobody can sign in to. Allowlist the same origin in the WorkOS
> dashboard. Chicken-and-egg on a brand-new service: run the "Manual deploy without CI"
> command below once to mint the `*.run.app` URL, then set the variable.

### 3. Deployer service account

Grant a service account the roles to build + deploy, then give the GitHub workflow
its key (or, preferred, use Workload Identity Federation — no long-lived key):

```bash
gcloud iam service-accounts create gh-deployer
PROJECT=YOUR_PROJECT_ID; SA=gh-deployer@$PROJECT.iam.gserviceaccount.com
for role in run.admin cloudbuild.builds.editor iam.serviceAccountUser \
            artifactregistry.writer secretmanager.secretAccessor; do
  gcloud projects add-iam-policy-binding $PROJECT \
    --member="serviceAccount:$SA" --role="roles/$role"
done
gcloud iam service-accounts keys create key.json --iam-account=$SA   # then delete locally after upload
```

### 4. GitHub repo configuration

`Settings → Secrets and variables → Actions`:

| Kind     | Name                 | Required | Value                                          |
|----------|----------------------|----------|------------------------------------------------|
| Variable | `GCP_PROJECT_ID`     | yes      | your project id                                |
| Variable | `GCP_REGION`         | yes      | e.g. `us-central1`                             |
| Variable | `CLOUD_RUN_SERVICE`  | yes      | e.g. `mlai-www`                                |
| Variable | `APP_URL`            | **yes**  | deployed origin, e.g. `https://mlai-corp.com` — OAuth redirect base; **the deploy fails without it** |
| Variable | `FRONTEND_URL`       | no       | only if the frontend is served somewhere other than `APP_URL`. Leave the variable **absent**, not blank — the workflow omits the key when it is empty, because `workos.ts`'s `?? APP_URL` fallback does not catch `""` |
| Variable | `RUNTIME_SA`         | no (recommended) | minimal runtime service account; unset means the revision runs as the default Compute SA (project Editor) |
| Secret   | `GCP_SA_KEY`         | yes      | contents of `key.json` (or use WIF)            |

## Deploy

- **Automatic:** a successful **CI** run for a **push to `main`** in this repository.
  Pull requests never deploy, and pull requests from forks never deploy — see the
  `if:` note above.
- **Manual:** Actions → *Deploy to Cloud Run* → **Run workflow**.

### Manual deploy without CI (local `gcloud`)

This mirrors the workflow; keep the two in sync. Omitting `APP_URL` or `DATABASE_URL`
here reproduces the exact defects the workflow now guards against.

```bash
gcloud run deploy mlai-www \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --max-instances=1 \
  --set-env-vars "NODE_ENV=production,DATABASE_URL=/app/data/inquiries.db,APP_URL=https://your-origin.example" \
  --set-secrets "WORKOS_API_KEY=WORKOS_API_KEY:latest,WORKOS_CLIENT_ID=WORKOS_CLIENT_ID:latest,SESSION_SECRET=SESSION_SECRET:latest"
```

## Persisting the SQLite database

**Read this before treating inquiries or telemetry as durable.** The app writes
`inquiries.db` (inquiries + `telemetry_events`) with `node:sqlite`. `DATABASE_URL`
points at `/app/data/inquiries.db`, a directory the `Dockerfile` prepares and chowns —
but **the deploy mounts no volume there**. On Cloud Run that path is the container's
writable layer, which is *in-memory tmpfs counted against the memory limit*.

What the workflow does today (`--max-instances=1`) is a **stopgap**. It fixes one of
the three problems and leaves the others:

| Problem | With `--max-instances=1` |
|---|---|
| Sharding — at the default `max-instances=100`, instance #2 answering `GET /api/inquiries` reads an empty DB while instance #1 holds the rows, and `db.ts` recreates the tables on open, so the admin view shows a plausible-looking subset rather than an error | **fixed** |
| Data lost on scale-to-zero / container recycle | **still broken** |
| Data lost on every redeploy (new revision = new container = empty tmpfs) | **still broken** |
| DB growth consumes container RAM until OOM | **still broken**, just bounded to one instance |

Pick one of the following. **Option A is the current state; it is not sufficient for
real sales leads.**

### Option A — single instance (current, stopgap)

Already in the workflow. It is a **trade, not free**: one instance at Cloud Run's
default per-instance concurrency of 80 is now the ceiling for the *entire site*, so a
launch, a link-aggregator front page, or a crawler burst will queue and then start
returning 429s. You are buying data coherence with availability. If that ceiling
matters more than the admin view being coherent, go to Option B or C rather than
raising `--max-instances` — see the warning below.

> ⚠ `--max-instances=1` is passed on every deploy, so raising it in the Cloud Run
> console is **stomped back to 1 by the next deploy**, with nothing in the logs
> explaining why throttling returned. Change it in the workflow, not the console.
> `--min-instances` is deliberately *not* passed, so that one **does** persist.

Optionally narrow the loss window to redeploys only by keeping one instance warm —
this incurs **always-on billing**, so it is left as a deliberate operator action
rather than a workflow default:

```bash
gcloud run services update mlai-www --region us-central1 --min-instances=1
```

Note this survives *idling*, not deploys: the next revision still starts empty.

### Option B — Cloud Storage FUSE volume mount

Gives the file a home outside the container, and is the smallest change that survives
a redeploy — **but read the caveat.** Requires a bucket you create first; there is
deliberately no bucket name baked into the workflow.

```bash
gcloud storage buckets create gs://YOUR_BUCKET --location=us-central1
# grant the RUNTIME service account roles/storage.objectAdmin on the bucket, then:
gcloud run deploy mlai-www \
  --source . \
  --region us-central1 \
  --add-volume=name=data,type=cloud-storage,bucket=YOUR_BUCKET \
  --add-volume-mount=volume=data,mount-path=/app/data \
  ... # same --set-env-vars / --set-secrets as above
```

> ⚠ **Cloud Storage FUSE is not a POSIX filesystem and provides no file locking.**
> Google's own limitation text: *"Cloud Storage FUSE does not provide concurrency
> control for multiple writes (file locking) to the same file. When multiple writes
> try to replace a file, the last write wins and all previous writes are lost."*
> SQLite depends on locking and on partial in-place writes for its journal/WAL, so
> this mount can **corrupt the database** if more than one writer ever exists. It is
> only defensible in combination with `--max-instances=1`, and even then it is a
> known-risky pattern, not a clean fix.

### Option C — a real database (the actually-correct fix)

Move inquiries + telemetry off SQLite onto Cloud SQL (Postgres) — or any managed
store — and connect over the Cloud SQL connector. This is the only option with real
durability, concurrent-writer safety, and backups. It is a code change in
`src/lib/server/db.ts` and its callers, not a deploy-flag change, so it is out of
scope for the deploy configuration and is recorded here as the intended destination.

## Verify after deploy

```bash
URL=$(gcloud run services describe mlai-www --region us-central1 --format='value(status.url)')
curl -fsS "$URL/api/llm/status"       # 200 JSON — confirms route handlers run
curl -fsS "$URL/financial-model"      # 200 HTML — the static page renders

# Confirm APP_URL actually landed on the revision. --set-env-vars replaces the
# whole env set, so this is the only reliable check that it survived the deploy.
gcloud run services describe mlai-www --region us-central1 \
  --format='value(spec.template.spec.containers[0].env)'
```

Auth degrades gracefully if WorkOS/session secrets are missing (redirects with
`?error=auth_not_configured`), so a 200 on the pages doesn't by itself prove auth is
wired — **sign in once** to confirm the WorkOS callback + `APP_URL` round-trip. A wrong
or missing `APP_URL` shows up only here: every other probe passes.

Also confirm the fork-PR guard held the first time a pull request lands: the
*Deploy to Cloud Run* job should appear as **skipped**, not run, for a PR's CI
completion.
