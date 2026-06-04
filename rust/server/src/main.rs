mod config;
mod llm;
mod models;
mod rate_limit;
mod routes;
mod session;
mod workos;

use std::{net::SocketAddr, str::FromStr, sync::Arc};

use anyhow::Context;
use reqwest::Client;
use sqlx::sqlite::{SqliteConnectOptions, SqlitePoolOptions};
use tracing_subscriber::{EnvFilter, layer::SubscriberExt, util::SubscriberInitExt};

use crate::{
    config::Config,
    rate_limit::RateLimiter,
    routes::{AppState, router},
    session::derive_cookie_key,
};

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenvy::dotenv().ok();

    tracing_subscriber::registry()
        .with(
            EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "mlai_www_server=info,tower_http=info".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    let config = Arc::new(Config::from_env());

    if !config.auth_configured() {
        tracing::warn!(
            "WorkOS auth is not fully configured. Set WORKOS_API_KEY, WORKOS_CLIENT_ID, and SESSION_SECRET."
        );
    }

    let db_options = SqliteConnectOptions::from_str(&config.database_url)
        .with_context(|| format!("invalid DATABASE_URL: {}", config.database_url))?
        .create_if_missing(true);
    let db = SqlitePoolOptions::new()
        .max_connections(5)
        .connect_with(db_options)
        .await
        .context("failed to open SQLite database")?;

    sqlx::query(include_str!("../migrations/0001_create_inquiries.sql"))
        .execute(&db)
        .await
        .context("failed to initialize inquiries table")?;

    let state = AppState {
        config: Arc::clone(&config),
        db,
        http: Client::builder()
            .user_agent("mlai-www-server/0.1")
            .build()
            .context("failed to build HTTP client")?,
        cookie_key: derive_cookie_key(&config.session_secret),
        rate_limiter: RateLimiter::default(),
    };

    let addr = SocketAddr::from(([0, 0, 0, 0], config.port));
    let listener = tokio::net::TcpListener::bind(addr)
        .await
        .with_context(|| format!("failed to bind {addr}"))?;

    tracing::info!(%addr, app_url = %config.app_url, "MLAI Rust 2024 server listening");
    axum::serve(listener, router(state))
        .with_graceful_shutdown(shutdown_signal())
        .await
        .context("server failed")?;

    Ok(())
}

async fn shutdown_signal() {
    let ctrl_c = async {
        if let Err(err) = tokio::signal::ctrl_c().await {
            tracing::warn!(error = %err, "failed to install Ctrl-C handler");
        }
    };

    #[cfg(unix)]
    let terminate = async {
        match tokio::signal::unix::signal(tokio::signal::unix::SignalKind::terminate()) {
            Ok(mut signal) => {
                signal.recv().await;
            }
            Err(err) => tracing::warn!(error = %err, "failed to install SIGTERM handler"),
        }
    };

    #[cfg(not(unix))]
    let terminate = std::future::pending::<()>();

    tokio::select! {
        _ = ctrl_c => {},
        _ = terminate => {},
    }

    tracing::info!("shutdown signal received");
}
