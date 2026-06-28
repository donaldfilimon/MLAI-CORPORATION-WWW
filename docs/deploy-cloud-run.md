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
  deploys on push to `main` (and via **Run workflow**). It runs
  `gcloud run deploy --source .`, which builds the Dockerfile with Cloud Build.

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
`GEMINI_API_KEY`, `STRIPE_PAYMENT_LINK`, `APP_URL`, `FRONTEND_URL`, `ADMIN_REQUIRE_MFA`.
See [`.env.example`](../.env.example) for what each one does.

> `APP_URL` / `FRONTEND_URL` are the deployed Cloud Run URL — set them after the first
> deploy prints the service URL (or after you attach a custom domain), then redeploy.
> They are the OAuth redirect base, so WorkOS must allowlist the same URL.

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

| Kind     | Name                 | Value                                  |
|----------|----------------------|----------------------------------------|
| Variable | `GCP_PROJECT_ID`     | your project id                        |
| Variable | `GCP_REGION`         | e.g. `us-central1`                     |
| Variable | `CLOUD_RUN_SERVICE`  | e.g. `mlai-www`                        |
| Secret   | `GCP_SA_KEY`         | contents of `key.json` (or use WIF)    |

## Deploy

- **Automatic:** push to `main`.
- **Manual:** Actions → *Deploy to Cloud Run* → **Run workflow**.

### Manual deploy without CI (local `gcloud`)

```bash
gcloud run deploy mlai-www \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production \
  --set-secrets "WORKOS_API_KEY=WORKOS_API_KEY:latest,WORKOS_CLIENT_ID=WORKOS_CLIENT_ID:latest,SESSION_SECRET=SESSION_SECRET:latest"
```

## Verify after deploy

```bash
URL=$(gcloud run services describe mlai-www --region us-central1 --format='value(status.url)')
curl -fsS "$URL/api/llm/status"       # 200 JSON — confirms route handlers run
curl -fsS "$URL/financial-model"      # 200 HTML — the static page renders
```

Auth degrades gracefully if WorkOS/session secrets are missing (redirects with
`?error=auth_not_configured`), so a 200 on the pages doesn't by itself prove auth is
wired — sign in once to confirm the WorkOS callback + `APP_URL` round-trip.
