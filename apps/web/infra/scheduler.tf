locals {
  audit_expiry_url = "https://${var.domain}/api/internal/audits/expire"
}

resource "google_cloud_scheduler_job" "audit_expiry" {
  name        = "quesar-audit-expiry"
  description = "Delete expired encrypted conversation payloads and log the retention action"
  region      = var.region
  schedule    = "17 4 * * *"
  time_zone   = "Etc/UTC"

  attempt_deadline = "300s"

  retry_config {
    retry_count          = 3
    min_backoff_duration = "30s"
    max_backoff_duration = "300s"
    max_retry_duration   = "900s"
  }

  http_target {
    http_method = "POST"
    uri         = local.audit_expiry_url
    headers     = { "Content-Type" = "application/json" }
    body        = base64encode("{}")

    oidc_token {
      service_account_email = google_service_account.scheduler.email
      audience              = local.audit_expiry_url
    }
  }

  depends_on = [
    google_project_service.required,
    google_project_iam_member.scheduler_service_agent,
    google_service_account_iam_member.scheduler_mints_oidc,
  ]
}
