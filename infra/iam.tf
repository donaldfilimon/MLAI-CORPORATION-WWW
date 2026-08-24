resource "google_service_account" "runtime" {
  account_id   = "quesar-runtime"
  display_name = "Quesar Cloud Run runtime"
}

resource "google_service_account" "deployer" {
  account_id   = "quesar-github-deployer"
  display_name = "Quesar GitHub deployer"
}

resource "google_service_account" "scheduler" {
  account_id   = "quesar-audit-scheduler"
  display_name = "Quesar audit-retention scheduler"
}

resource "google_project_iam_member" "runtime_cloud_sql" {
  project = var.project_id
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:${google_service_account.runtime.email}"
}

resource "google_project_iam_member" "deployer_run_admin" {
  project = var.project_id
  role    = "roles/run.admin"
  member  = "serviceAccount:${google_service_account.deployer.email}"
}

resource "google_artifact_registry_repository_iam_member" "deployer_writer" {
  location   = google_artifact_registry_repository.app.location
  repository = google_artifact_registry_repository.app.name
  role       = "roles/artifactregistry.writer"
  member     = "serviceAccount:${google_service_account.deployer.email}"
}

resource "google_service_account_iam_member" "deployer_uses_runtime" {
  service_account_id = google_service_account.runtime.name
  role               = "roles/iam.serviceAccountUser"
  member             = "serviceAccount:${google_service_account.deployer.email}"
}

resource "google_iam_workload_identity_pool" "github" {
  workload_identity_pool_id = "quesar-github"
  display_name              = "Quesar GitHub Actions"
  description               = "OIDC identities for the exact Quesar repository"

  depends_on = [google_project_service.required]
}

resource "google_iam_workload_identity_pool_provider" "github" {
  workload_identity_pool_id          = google_iam_workload_identity_pool.github.workload_identity_pool_id
  workload_identity_pool_provider_id = "github"
  display_name                       = "GitHub Actions"

  attribute_mapping = {
    "google.subject"             = "assertion.sub"
    "attribute.repository"       = "assertion.repository"
    "attribute.repository_owner" = "assertion.repository_owner"
    "attribute.ref"              = "assertion.ref"
    "attribute.workflow"         = "assertion.workflow"
    "attribute.job_workflow_ref" = "assertion.job_workflow_ref"
  }
  attribute_condition = "assertion.repository == '${var.github_repository}' && assertion.repository_owner == '${split("/", var.github_repository)[0]}' && assertion.ref == 'refs/heads/main' && assertion.job_workflow_ref == '${var.github_repository}/.github/workflows/deploy-cloudrun.yml@refs/heads/main'"

  oidc {
    issuer_uri = "https://token.actions.githubusercontent.com/"
  }
}

resource "google_service_account_iam_member" "github_impersonates_deployer" {
  service_account_id = google_service_account.deployer.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "principalSet://iam.googleapis.com/${google_iam_workload_identity_pool.github.name}/attribute.repository/${var.github_repository}"
}

resource "google_project_service_identity" "scheduler" {
  provider = google-beta
  project  = var.project_id
  service  = "cloudscheduler.googleapis.com"

  depends_on = [google_project_service.required]
}

resource "google_project_iam_member" "scheduler_service_agent" {
  project = var.project_id
  role    = "roles/cloudscheduler.serviceAgent"
  member  = "serviceAccount:${google_project_service_identity.scheduler.email}"
}

resource "google_service_account_iam_member" "scheduler_mints_oidc" {
  service_account_id = google_service_account.scheduler.name
  role               = "roles/iam.serviceAccountTokenCreator"
  member             = "serviceAccount:${google_project_service_identity.scheduler.email}"
}
