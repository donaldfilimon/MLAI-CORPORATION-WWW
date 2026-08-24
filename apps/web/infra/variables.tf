variable "project_id" {
  description = "Existing Google Cloud project with billing enabled."
  type        = string
}

variable "region" {
  description = "Primary application, KMS, scheduler, and Cloud SQL region."
  type        = string
  default     = "us-east1"
}

variable "domain" {
  description = "Canonical public Quesar hostname."
  type        = string
  default     = "quesar.cloud"
}

variable "github_repository" {
  description = "Exact owner/repository trusted by the GitHub OIDC provider."
  type        = string
  default     = "donaldfilimon/MLAI-CORPORATION-WWW"
}

variable "cloud_run_service" {
  type    = string
  default = "quesar-web"
}

variable "artifact_repository" {
  type    = string
  default = "quesar"
}

variable "database_instance" {
  type    = string
  default = "quesar-postgres"
}

variable "database_name" {
  type    = string
  default = "quesar"
}

variable "database_user" {
  type    = string
  default = "quesar_app"
}

variable "database_tier" {
  description = "Regional HA requires a non-shared-core tier."
  type        = string
  default     = "db-custom-2-7680"
}

variable "cloudflare_ip_ranges" {
  description = "Cloudflare HTTP proxy egress ranges from https://www.cloudflare.com/ips/. Refresh before apply."
  type        = list(string)
  default = [
    "173.245.48.0/20",
    "103.21.244.0/22",
    "103.22.200.0/22",
    "103.31.4.0/22",
    "141.101.64.0/18",
    "108.162.192.0/18",
    "190.93.240.0/20",
    "188.114.96.0/20",
    "197.234.240.0/22",
    "198.41.128.0/17",
    "162.158.0.0/15",
    "104.16.0.0/13",
    "104.24.0.0/14",
    "172.64.0.0/13",
    "131.0.72.0/22",
    "2400:cb00::/32",
    "2606:4700::/32",
    "2803:f800::/32",
    "2405:b500::/32",
    "2405:8100::/32",
    "2a06:98c0::/29",
    "2c0f:f248::/32",
  ]
}
