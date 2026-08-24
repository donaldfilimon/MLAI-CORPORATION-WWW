# Quesar production infrastructure

This OpenTofu root provisions the Google half of Quesar's hybrid edge:

- a regional-HA PostgreSQL 16 Cloud SQL instance with automated backups,
  seven days of PITR logs, deletion protection, and a stable maintenance window;
- KMS envelope-key wrapping and Secret Manager containers for every runtime secret;
- least-privilege runtime, scheduler, and GitHub deployer service accounts;
- GitHub OIDC restricted through the standard `workflow_ref` claim to this
  repository's `deploy-cloudrun.yml` on `main` and the `production` environment;
- Artifact Registry, a serverless NEG, Google-managed TLS, an external HTTPS load
  balancer, and a Cloud Armor origin ACL containing only current Cloudflare proxy
  ranges;
- a daily OIDC-authenticated retention call through `quesar.cloud`.

The Cloud Run service itself is deployed by GitHub Actions. That workflow keeps
revision-specific settings together: image SHA, secrets, Cloud SQL mount, ingress,
and disabled `run.app` URL. Its deployer may inspect Secret Manager version
metadata for fail-fast preflight, but cannot read secret payloads.
GitHub emits `job_workflow_ref` only for reusable workflows; using that claim
here would reject the normal deployment workflow before Google authentication.

## Bootstrap

The state bucket and initial apply use an administrator's short-lived Google ADC;
GitHub OIDC cannot exist until this root creates it. State contains the generated
database password, so use a versioned, uniform-access GCS bucket and never commit
local state.

```bash
gcloud auth application-default login
gcloud storage buckets create gs://YOUR_PROJECT_ID-quesar-tofu-state \
  --project YOUR_PROJECT_ID --location us-east1 --uniform-bucket-level-access
gcloud storage buckets update gs://YOUR_PROJECT_ID-quesar-tofu-state --versioning

tofu -chdir=infra init \
  -backend-config="bucket=YOUR_PROJECT_ID-quesar-tofu-state"
tofu -chdir=infra plan -var="project_id=YOUR_PROJECT_ID" -out=production.tfplan
tofu -chdir=infra apply production.tfplan
```

Before every apply, compare `var.cloudflare_ip_ranges` with the authoritative
`https://www.cloudflare.com/ips-v4` and `/ips-v6` lists. Add new ranges before
removing old ranges so the origin is never accidentally cut off.

## Secrets and deployment variables

OpenTofu creates the secret containers and populates only `DATABASE_PASSWORD`.
Add production values as new Secret Manager versions for `WORKOS_API_KEY`,
`WORKOS_CLIENT_ID`, `SESSION_SECRET`, `CLOUDFLARE_AI_GATEWAY_TOKEN`,
`AUDIT_SUBJECT_PEPPER`, `TURNSTILE_SECRET`, and `ADMIN_EMAILS`. Keep values out
of shell history; use `gcloud secrets versions add NAME --data-file=-`.

Use `tofu -chdir=infra output -json runtime_configuration` to populate the
matching GitHub Actions variables. Also set `APP_URL=https://quesar.cloud`,
`WORKOS_ORGANIZATION_ID`, `WORKOS_MFA_POLICY_VERIFIED`,
`WORKOS_SSO_MFA_POLICY_VERIFIED=false` (until the IdP MFA policy is verified),
`CLOUDFLARE_AI_GATEWAY_URL`,
`CLOUDFLARE_AI_GATEWAY_ID`,
`NEXT_PUBLIC_TURNSTILE_SITE_KEY`, and `TURNSTILE_HOSTNAMES=quesar.cloud,www.quesar.cloud`.

Do not switch DNS until the Cloud Run revision, load balancer, WorkOS redirect,
Cloudflare gateway, Turnstile widget, and preserved mail records have all been
verified. The managed certificate remains provisioning until the DNS path points
at the load balancer.
