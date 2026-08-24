resource "random_password" "database" {
  length  = 32
  special = false
}

resource "google_sql_database_instance" "app" {
  name             = var.database_instance
  region           = var.region
  database_version = "POSTGRES_16"

  deletion_protection = true

  settings {
    tier                        = var.database_tier
    edition                     = "ENTERPRISE"
    availability_type           = "REGIONAL"
    deletion_protection_enabled = true
    disk_type                   = "PD_SSD"
    disk_size                   = 20
    disk_autoresize             = true

    backup_configuration {
      enabled                        = true
      point_in_time_recovery_enabled = true
      start_time                     = "07:00"
      transaction_log_retention_days = 7

      backup_retention_settings {
        retained_backups = 30
        retention_unit   = "COUNT"
      }
    }

    maintenance_window {
      day          = 7
      hour         = 8
      update_track = "stable"
    }

    ip_configuration {
      ipv4_enabled = true
      ssl_mode     = "ENCRYPTED_ONLY"
    }

    insights_config {
      query_insights_enabled  = true
      query_string_length     = 1024
      record_application_tags = true
      record_client_address   = false
    }
  }

  depends_on = [google_project_service.required]
}

resource "google_sql_database" "app" {
  name     = var.database_name
  instance = google_sql_database_instance.app.name
}

resource "google_sql_user" "app" {
  name     = var.database_user
  instance = google_sql_database_instance.app.name
  password = random_password.database.result
}

locals {
  runtime_secret_names = toset([
    "WORKOS_API_KEY",
    "WORKOS_CLIENT_ID",
    "SESSION_SECRET",
    "DATABASE_PASSWORD",
    "CLOUDFLARE_AI_GATEWAY_TOKEN",
    "AUDIT_SUBJECT_PEPPER",
    "TURNSTILE_SECRET",
    "ADMIN_EMAILS",
  ])
}

resource "google_secret_manager_secret" "runtime" {
  for_each  = local.runtime_secret_names
  secret_id = each.value

  replication {
    auto {}
  }

  depends_on = [google_project_service.required]
}

resource "google_secret_manager_secret_version" "database_password" {
  secret      = google_secret_manager_secret.runtime["DATABASE_PASSWORD"].id
  secret_data = random_password.database.result
}

resource "google_secret_manager_secret_iam_member" "runtime_access" {
  for_each  = google_secret_manager_secret.runtime
  secret_id = each.value.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.runtime.email}"
}

# The deployment workflow verifies that every required secret has a latest
# version before it builds. Viewer grants version metadata only; the deployer
# cannot read secret payloads (the runtime account remains the sole accessor).
resource "google_secret_manager_secret_iam_member" "deployer_version_metadata" {
  for_each  = google_secret_manager_secret.runtime
  secret_id = each.value.id
  role      = "roles/secretmanager.viewer"
  member    = "serviceAccount:${google_service_account.deployer.email}"
}

resource "google_kms_key_ring" "audit" {
  name     = "quesar-audit"
  location = var.region

  depends_on = [google_project_service.required]
}

resource "google_kms_crypto_key" "audit" {
  name            = "conversation-audits"
  key_ring        = google_kms_key_ring.audit.id
  rotation_period = "7776000s"

  lifecycle {
    prevent_destroy = true
  }
}

resource "google_kms_crypto_key_iam_member" "runtime" {
  crypto_key_id = google_kms_crypto_key.audit.id
  role          = "roles/cloudkms.cryptoKeyEncrypterDecrypter"
  member        = "serviceAccount:${google_service_account.runtime.email}"
}
