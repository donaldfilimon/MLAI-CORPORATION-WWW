output "load_balancer_ip" {
  description = "Create proxied Cloudflare A records for @ and www to this address."
  value       = google_compute_global_address.app.address
}

output "cloud_sql_connection_name" {
  value = google_sql_database_instance.app.connection_name
}

output "runtime_service_account" {
  value = google_service_account.runtime.email
}

output "scheduler_service_account" {
  value = google_service_account.scheduler.email
}

output "audit_kms_key_name" {
  value = google_kms_crypto_key.audit.id
}

output "workload_identity_provider" {
  value = google_iam_workload_identity_pool_provider.github.name
}

output "deployer_service_account" {
  value = google_service_account.deployer.email
}

output "artifact_image_prefix" {
  value = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.app.repository_id}/${var.cloud_run_service}"
}

output "runtime_configuration" {
  description = "Non-secret GitHub Actions variables derived from the infrastructure."
  value = {
    GCP_PROJECT_ID                  = var.project_id
    GCP_REGION                      = var.region
    CLOUD_RUN_SERVICE               = var.cloud_run_service
    ARTIFACT_REPOSITORY             = google_artifact_registry_repository.app.repository_id
    RUNTIME_SA                      = google_service_account.runtime.email
    WIF_PROVIDER                    = google_iam_workload_identity_pool_provider.github.name
    DEPLOYER_SA                     = google_service_account.deployer.email
    CLOUD_SQL_CONNECTION_NAME       = google_sql_database_instance.app.connection_name
    DATABASE_NAME                   = google_sql_database.app.name
    DATABASE_USER                   = google_sql_user.app.name
    AUDIT_KMS_KEY_NAME              = google_kms_crypto_key.audit.id
    AUDIT_SCHEDULER_SERVICE_ACCOUNT = google_service_account.scheduler.email
    AUDIT_SCHEDULER_AUDIENCE        = local.audit_expiry_url
  }
}
