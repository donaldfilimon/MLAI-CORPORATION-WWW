locals {
  cloudflare_range_chunks = chunklist(var.cloudflare_ip_ranges, 10)
}

resource "google_compute_global_address" "app" {
  name = "quesar-edge-ip"
}

resource "google_compute_region_network_endpoint_group" "cloud_run" {
  name                  = "quesar-cloud-run"
  region                = var.region
  network_endpoint_type = "SERVERLESS"

  cloud_run {
    service = var.cloud_run_service
  }
}

resource "google_compute_security_policy" "cloudflare_only" {
  name        = "quesar-cloudflare-only"
  description = "Origin ACL: only Cloudflare HTTP proxy egress ranges reach Quesar"
  type        = "CLOUD_ARMOR"

  dynamic "rule" {
    for_each = { for index, ranges in local.cloudflare_range_chunks : index => ranges }
    content {
      action   = "allow"
      priority = 1000 + rule.key
      match {
        versioned_expr = "SRC_IPS_V1"
        config {
          src_ip_ranges = rule.value
        }
      }
      description = "Cloudflare proxy ranges ${rule.key + 1}"
    }
  }

  rule {
    action   = "deny(403)"
    priority = 2147483647
    match {
      versioned_expr = "SRC_IPS_V1"
      config {
        src_ip_ranges = ["*"]
      }
    }
    description = "Deny traffic that bypasses Cloudflare"
  }
}

resource "google_compute_backend_service" "app" {
  name                  = "quesar-web"
  protocol              = "HTTP"
  load_balancing_scheme = "EXTERNAL_MANAGED"
  security_policy       = google_compute_security_policy.cloudflare_only.id
  timeout_sec           = 60

  backend {
    group = google_compute_region_network_endpoint_group.cloud_run.id
  }
}

resource "google_compute_managed_ssl_certificate" "app" {
  name = "quesar-managed-certificate"
  managed {
    domains = [var.domain, "www.${var.domain}"]
  }
}

resource "google_compute_url_map" "https" {
  name            = "quesar-https"
  default_service = google_compute_backend_service.app.id
}

resource "google_compute_target_https_proxy" "app" {
  name             = "quesar-https"
  url_map          = google_compute_url_map.https.id
  ssl_certificates = [google_compute_managed_ssl_certificate.app.id]
}

resource "google_compute_global_forwarding_rule" "https" {
  name                  = "quesar-https"
  ip_address            = google_compute_global_address.app.id
  port_range            = "443"
  target                = google_compute_target_https_proxy.app.id
  load_balancing_scheme = "EXTERNAL_MANAGED"
}

resource "google_compute_url_map" "http_redirect" {
  name = "quesar-http-redirect"
  default_url_redirect {
    https_redirect = true
    strip_query    = false
  }
}

resource "google_compute_target_http_proxy" "redirect" {
  name    = "quesar-http-redirect"
  url_map = google_compute_url_map.http_redirect.id
}

resource "google_compute_global_forwarding_rule" "http" {
  name                  = "quesar-http"
  ip_address            = google_compute_global_address.app.id
  port_range            = "80"
  target                = google_compute_target_http_proxy.redirect.id
  load_balancing_scheme = "EXTERNAL_MANAGED"
}
