use std::{sync::Arc, time::Duration};

use axum::{
    Json, Router,
    extract::{Query, State},
    http::{HeaderMap, StatusCode},
    response::{IntoResponse, Redirect, Response},
    routing::{get, patch, post},
};
use reqwest::Client;
use serde::Deserialize;
use serde_json::json;
use sqlx::SqlitePool;
use tower_cookies::{CookieManagerLayer, Cookies, Key};
use tower_http::{
    services::{ServeDir, ServeFile},
    trace::TraceLayer,
};
use url::Url;

use crate::{
    config::Config,
    llm,
    models::{ChatMessage, Inquiry, InquiryRequest, ProfilePatch, PublicSessionUser, SessionData},
    rate_limit::RateLimiter,
    session, workos,
};

#[derive(Clone)]
pub struct AppState {
    pub config: Arc<Config>,
    pub db: SqlitePool,
    pub http: Client,
    pub cookie_key: Key,
    pub rate_limiter: RateLimiter,
}

pub fn router(state: AppState) -> Router {
    let static_files = ServeDir::new("dist").not_found_service(ServeFile::new("dist/index.html"));

    Router::new()
        .route("/api/auth/login", get(auth_login))
        .route("/api/auth/signup", get(auth_signup))
        .route("/api/auth/callback", get(auth_callback))
        .route("/api/auth/me", get(auth_me))
        .route("/api/auth/logout", post(auth_logout))
        .route("/api/auth/features", get(auth_features))
        .route("/api/auth/verify-user", get(verify_user))
        .route("/api/profile", patch(update_profile))
        .route("/api/llm/status", get(llm_status))
        .route("/api/llm/chat", post(llm_chat))
        .route("/api/billing/plans", get(billing_plans))
        .route("/api/billing/checkout", post(billing_checkout))
        .route("/api/inquiries", post(create_inquiry).get(list_inquiries))
        .fallback_service(static_files)
        .layer(CookieManagerLayer::new())
        .layer(TraceLayer::new_for_http())
        .with_state(state)
}

#[derive(Debug, Deserialize)]
struct AuthQuery {
    #[serde(rename = "returnTo")]
    return_to: Option<String>,
}

#[derive(Debug, Deserialize)]
struct CallbackQuery {
    code: Option<String>,
    error: Option<String>,
    state: Option<String>,
}

#[derive(Debug, Deserialize)]
struct ChatRequest {
    messages: Option<Vec<ChatMessage>>,
}

fn json_error(status: StatusCode, message: impl Into<String>) -> Response {
    (status, Json(json!({ "error": message.into() }))).into_response()
}

fn get_return_to(value: Option<&str>) -> String {
    let Some(value) = value else {
        return "/".to_owned();
    };
    if !value.starts_with('/') || value.starts_with("//") || value.starts_with("/api/") {
        "/".to_owned()
    } else {
        value.to_owned()
    }
}

fn redirect_to_frontend(config: &Config, path: Option<&str>) -> String {
    let return_to = get_return_to(path);
    Url::parse(&config.frontend_url)
        .and_then(|base| base.join(&return_to))
        .map(|url| url.to_string())
        .unwrap_or(return_to)
}

fn clean_opt(value: Option<String>, max_chars: usize) -> Option<String> {
    let value = value?.trim().chars().take(max_chars).collect::<String>();
    if value.is_empty() { None } else { Some(value) }
}

fn current_user(cookies: &Cookies, headers: &HeaderMap, state: &AppState) -> Option<SessionData> {
    session::get_session(cookies, &state.cookie_key, headers)
}

fn require_user(
    cookies: &Cookies,
    headers: &HeaderMap,
    state: &AppState,
) -> Result<SessionData, Response> {
    let user = current_user(cookies, headers, state)
        .ok_or_else(|| json_error(StatusCode::UNAUTHORIZED, "Unauthorized"))?;

    if let Err(err) = session::set_session(
        cookies,
        &state.cookie_key,
        user.clone(),
        headers,
        state.config.secure_cookies(),
    ) {
        tracing::warn!(error = %err, "failed to renew session cookie");
    }

    Ok(user)
}

async fn auth_login(
    State(state): State<AppState>,
    Query(query): Query<AuthQuery>,
    headers: HeaderMap,
) -> Response {
    if let Err(limit) = state
        .rate_limiter
        .check(
            &headers,
            "/api/auth/login",
            Duration::from_secs(15 * 60),
            100,
        )
        .await
    {
        return limit.into_response();
    }

    if !state.config.auth_configured() {
        return Redirect::temporary("/login?error=auth_not_configured").into_response();
    }

    match workos::authorization_url(
        &state.config,
        "sign-in",
        &get_return_to(query.return_to.as_deref()),
    ) {
        Ok(url) => Redirect::temporary(&url).into_response(),
        Err(err) => {
            tracing::warn!(error = %err, "failed to build WorkOS login URL");
            Redirect::temporary("/login?error=auth_not_configured").into_response()
        }
    }
}

async fn auth_signup(
    State(state): State<AppState>,
    Query(query): Query<AuthQuery>,
    headers: HeaderMap,
) -> Response {
    if let Err(limit) = state
        .rate_limiter
        .check(
            &headers,
            "/api/auth/signup",
            Duration::from_secs(15 * 60),
            100,
        )
        .await
    {
        return limit.into_response();
    }

    if !state.config.auth_configured() {
        return Redirect::temporary("/login?error=auth_not_configured").into_response();
    }

    match workos::authorization_url(
        &state.config,
        "sign-up",
        &get_return_to(query.return_to.as_deref()),
    ) {
        Ok(url) => Redirect::temporary(&url).into_response(),
        Err(err) => {
            tracing::warn!(error = %err, "failed to build WorkOS signup URL");
            Redirect::temporary("/login?error=auth_not_configured").into_response()
        }
    }
}

async fn auth_callback(
    State(state): State<AppState>,
    Query(query): Query<CallbackQuery>,
    cookies: Cookies,
    headers: HeaderMap,
) -> Response {
    if !state.config.auth_configured() {
        return Redirect::temporary(&redirect_to_frontend(
            &state.config,
            Some("/login?error=auth_not_configured"),
        ))
        .into_response();
    }

    if let Some(error) = query.error {
        return Redirect::temporary(&redirect_to_frontend(
            &state.config,
            Some(&format!("/login?error={}", urlencoding_like(&error))),
        ))
        .into_response();
    }

    let Some(code) = query.code else {
        return Redirect::temporary(&redirect_to_frontend(
            &state.config,
            Some("/login?error=missing_code"),
        ))
        .into_response();
    };

    match workos::authenticate_with_code(&state.http, &state.config, &code).await {
        Ok(session_data) => {
            if let Err(err) = session::set_session(
                &cookies,
                &state.cookie_key,
                session_data,
                &headers,
                state.config.secure_cookies(),
            ) {
                tracing::error!(error = %err, "failed to seal session");
                return Redirect::temporary(&redirect_to_frontend(
                    &state.config,
                    Some("/login?error=auth_failed"),
                ))
                .into_response();
            }
            Redirect::temporary(&redirect_to_frontend(&state.config, query.state.as_deref()))
                .into_response()
        }
        Err(err) => {
            tracing::error!(error = %err, "WorkOS auth error");
            Redirect::temporary(&redirect_to_frontend(
                &state.config,
                Some("/login?error=auth_failed"),
            ))
            .into_response()
        }
    }
}

async fn auth_me(State(state): State<AppState>, cookies: Cookies, headers: HeaderMap) -> Response {
    let user = current_user(&cookies, &headers, &state).map(|user| PublicSessionUser::from(&user));
    Json(json!({ "user": user })).into_response()
}

async fn auth_logout(State(state): State<AppState>, cookies: Cookies) -> Response {
    session::destroy_session(&cookies, &state.cookie_key, state.config.secure_cookies());
    Json(json!({ "ok": true })).into_response()
}

async fn auth_features(State(state): State<AppState>) -> Response {
    Json(json!({
        "authkit": state.config.auth_configured(),
        "cookies": {
            "name": session::COOKIE_NAME,
            "httpOnly": true,
            "sameSite": "Lax",
            "secureInProduction": true,
            "maxAgeDays": 7,
        },
        "capabilities": {
            "signIn": true,
            "signUp": true,
            "autoLogin": true,
            "mfa": "Configure MFA policies in the WorkOS dashboard for this AuthKit environment.",
            "passkeys": "Enable passkeys in the WorkOS dashboard; hosted AuthKit will present them automatically when available.",
        }
    }))
    .into_response()
}

async fn verify_user(
    State(state): State<AppState>,
    cookies: Cookies,
    headers: HeaderMap,
) -> Response {
    let user = match require_user(&cookies, &headers, &state) {
        Ok(user) => user,
        Err(response) => return response,
    };

    if !state.config.auth_configured() {
        return json_error(StatusCode::SERVICE_UNAVAILABLE, "WorkOS is not configured");
    }

    match workos::get_user(&state.http, &state.config, &user.user_id).await {
        Ok(workos_user) => Json(json!({
            "ok": true,
            "user": PublicSessionUser::from(&user),
            "workos": {
                "id": workos_user.id,
                "email": workos_user.email,
                "emailVerified": workos_user.email_verified,
                "firstName": workos_user.first_name,
                "lastName": workos_user.last_name,
                "profilePictureUrl": workos_user.profile_picture_url,
                "createdAt": workos_user.created_at.unwrap_or_default(),
                "updatedAt": workos_user.updated_at.unwrap_or_default(),
            }
        }))
        .into_response(),
        Err(err) => {
            tracing::error!(error = %err, "WorkOS user verification error");
            json_error(
                StatusCode::BAD_GATEWAY,
                "User could not be verified with WorkOS",
            )
        }
    }
}

async fn update_profile(
    State(state): State<AppState>,
    cookies: Cookies,
    headers: HeaderMap,
    Json(body): Json<ProfilePatch>,
) -> Response {
    let user = match require_user(&cookies, &headers, &state) {
        Ok(user) => user,
        Err(response) => return response,
    };

    if !state.config.auth_configured() {
        return json_error(StatusCode::SERVICE_UNAVAILABLE, "WorkOS is not configured");
    }

    let first_name = clean_opt(body.first_name, 80);
    let last_name = clean_opt(body.last_name, 80);
    let company = clean_opt(body.company, 120);
    let use_case = clean_opt(body.use_case, 240);

    match workos::update_user_profile(
        &state.http,
        &state.config,
        &user.user_id,
        first_name,
        last_name,
        company,
        use_case,
    )
    .await
    {
        Ok(updated) => {
            let updated_session = SessionData {
                first_name: updated.first_name.clone(),
                last_name: updated.last_name.clone(),
                avatar_url: updated.profile_picture_url.clone().or(user.avatar_url),
                ..user
            };
            if let Err(err) = session::set_session(
                &cookies,
                &state.cookie_key,
                updated_session.clone(),
                &headers,
                state.config.secure_cookies(),
            ) {
                tracing::warn!(error = %err, "failed to update profile session cookie");
            }
            Json(json!({ "ok": true, "user": PublicSessionUser::from(&updated_session) }))
                .into_response()
        }
        Err(err) => {
            tracing::error!(error = %err, "WorkOS profile update error");
            json_error(StatusCode::BAD_GATEWAY, "Profile update failed")
        }
    }
}

async fn llm_status(
    State(state): State<AppState>,
    cookies: Cookies,
    headers: HeaderMap,
) -> Response {
    let user = match require_user(&cookies, &headers, &state) {
        Ok(user) => user,
        Err(response) => return response,
    };

    Json(json!({
        "ok": true,
        "user": PublicSessionUser::from(&user),
        "llm": {
            "provider": state.config.llm_provider.as_str(),
            "configured": state.config.llm_provider == "gemini" && state.config.gemini_api_key.is_some(),
            "model": state.config.gemini_model.as_str(),
        }
    }))
    .into_response()
}

async fn llm_chat(
    State(state): State<AppState>,
    cookies: Cookies,
    headers: HeaderMap,
    Json(body): Json<ChatRequest>,
) -> Response {
    if let Err(limit) = state
        .rate_limiter
        .check(&headers, "/api/llm/chat", Duration::from_secs(60), 10)
        .await
    {
        return limit.into_response();
    }

    let user = match require_user(&cookies, &headers, &state) {
        Ok(user) => user,
        Err(response) => return response,
    };

    let mut messages = body
        .messages
        .unwrap_or_default()
        .into_iter()
        .filter(|message| {
            matches!(message.role.as_str(), "system" | "user" | "assistant")
                && !message.content.trim().is_empty()
        })
        .collect::<Vec<_>>();

    if messages.len() > 12 {
        messages = messages.split_off(messages.len() - 12);
    }
    if messages.is_empty() {
        return json_error(StatusCode::BAD_REQUEST, "At least one message is required");
    }

    match llm::generate_llm_response(&state.http, &state.config, &messages, &user).await {
        Ok(response) => Json(json!({
            "ok": true,
            "provider": response.provider,
            "model": response.model,
            "text": response.text,
        }))
        .into_response(),
        Err(err) => {
            tracing::error!(error = %err, "LLM API error");
            json_error(StatusCode::BAD_GATEWAY, "LLM request failed")
        }
    }
}

async fn billing_plans(
    State(state): State<AppState>,
    cookies: Cookies,
    headers: HeaderMap,
) -> Response {
    if let Err(response) = require_user(&cookies, &headers, &state) {
        return response;
    }

    Json(json!({
        "ok": true,
        "plans": [
            {
                "id": "pilot",
                "name": "Pilot",
                "price": "$2,500/mo",
                "description": "Private console access, protected LLM API, readiness audit support, and prototype evaluation gates."
            },
            {
                "id": "platform",
                "name": "Platform",
                "price": "Custom",
                "description": "Team workspaces, private deployment support, custom retrieval pipelines, and production reliability reviews."
            }
        ],
        "provider": state.config.billing_provider.as_str(),
        "checkoutConfigured": state.config.stripe_payment_link.is_some(),
    }))
    .into_response()
}

async fn billing_checkout(
    State(state): State<AppState>,
    cookies: Cookies,
    headers: HeaderMap,
) -> Response {
    let user = match require_user(&cookies, &headers, &state) {
        Ok(user) => user,
        Err(response) => return response,
    };

    let Some(payment_link) = &state.config.stripe_payment_link else {
        return (
            StatusCode::SERVICE_UNAVAILABLE,
            Json(json!({
                "ok": false,
                "error": "Billing checkout is not configured yet.",
                "nextStep": "Set STRIPE_PAYMENT_LINK or replace this endpoint with Stripe Checkout session creation."
            })),
        )
            .into_response();
    };

    match Url::parse(payment_link) {
        Ok(mut url) => {
            url.query_pairs_mut()
                .append_pair("prefilled_email", &user.email)
                .append_pair("client_reference_id", &user.user_id);
            Json(json!({ "ok": true, "url": url.to_string() })).into_response()
        }
        Err(_) => json_error(
            StatusCode::SERVICE_UNAVAILABLE,
            "Billing checkout URL is invalid",
        ),
    }
}

async fn create_inquiry(
    State(state): State<AppState>,
    headers: HeaderMap,
    Json(body): Json<InquiryRequest>,
) -> Response {
    if let Err(limit) = state
        .rate_limiter
        .check(&headers, "/api/inquiries", Duration::from_secs(5 * 60), 5)
        .await
    {
        return limit.into_response();
    }

    let name = body.name.unwrap_or_default().trim().to_owned();
    let email = body.email.unwrap_or_default().trim().to_owned();
    let company = body.company.unwrap_or_default().trim().to_owned();
    let project_type = body
        .project_type
        .unwrap_or_else(|| "research".to_owned())
        .trim()
        .to_owned();
    let message = body.message.unwrap_or_default().trim().to_owned();

    if name.chars().count() < 2 {
        return json_error(
            StatusCode::BAD_REQUEST,
            "Name must be at least 2 characters",
        );
    }
    if !email.contains('@') {
        return json_error(StatusCode::BAD_REQUEST, "Invalid email address");
    }
    if company.chars().count() < 2 {
        return json_error(StatusCode::BAD_REQUEST, "Company name is required");
    }
    if message.chars().count() < 10 {
        return json_error(
            StatusCode::BAD_REQUEST,
            "Message must be at least 10 characters",
        );
    }

    match sqlx::query(
        "INSERT INTO inquiries (name, email, company, project_type, message) VALUES (?, ?, ?, ?, ?)",
    )
    .bind(&name)
    .bind(&email)
    .bind(&company)
    .bind(&project_type)
    .bind(&message)
    .execute(&state.db)
    .await
    {
        Ok(_) => Json(json!({ "ok": true, "message": "Inquiry submitted successfully." })).into_response(),
        Err(err) => {
            tracing::error!(error = %err, "Database error saving inquiry");
            json_error(StatusCode::INTERNAL_SERVER_ERROR, "Failed to store inquiry")
        }
    }
}

async fn list_inquiries(
    State(state): State<AppState>,
    cookies: Cookies,
    headers: HeaderMap,
) -> Response {
    if let Err(response) = require_user(&cookies, &headers, &state) {
        return response;
    }

    match sqlx::query_as::<_, Inquiry>(
        "SELECT id, name, email, company, project_type, message, created_at FROM inquiries ORDER BY created_at DESC",
    )
    .fetch_all(&state.db)
    .await
    {
        Ok(inquiries) => Json(json!({ "ok": true, "inquiries": inquiries })).into_response(),
        Err(err) => {
            tracing::error!(error = %err, "Database error loading inquiries");
            json_error(StatusCode::INTERNAL_SERVER_ERROR, "Failed to load inquiries")
        }
    }
}

fn urlencoding_like(value: &str) -> String {
    url::form_urlencoded::byte_serialize(value.as_bytes()).collect()
}
