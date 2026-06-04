use reqwest::Client;
use serde::{Deserialize, Serialize};
use serde_json::json;
use url::Url;

use crate::{config::Config, models::SessionData};

const WORKOS_API_BASE: &str = "https://api.workos.com";

#[derive(Debug, thiserror::Error)]
pub enum WorkosError {
    #[error("WorkOS is not configured")]
    NotConfigured,
    #[error("invalid WorkOS URL: {0}")]
    Url(#[from] url::ParseError),
    #[error("WorkOS request failed: {0}")]
    Http(#[from] reqwest::Error),
    #[error("WorkOS returned {status}: {body}")]
    Api {
        status: reqwest::StatusCode,
        body: String,
    },
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct WorkosUser {
    pub id: String,
    pub email: String,
    #[serde(default, alias = "email_verified")]
    pub email_verified: bool,
    #[serde(default, alias = "first_name")]
    pub first_name: Option<String>,
    #[serde(default, alias = "last_name")]
    pub last_name: Option<String>,
    #[serde(default, alias = "profile_picture_url")]
    pub profile_picture_url: Option<String>,
    #[serde(default, alias = "created_at")]
    pub created_at: Option<String>,
    #[serde(default, alias = "updated_at")]
    pub updated_at: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct AuthenticateResponse {
    user: WorkosUser,
    #[serde(alias = "access_token")]
    access_token: String,
    #[serde(default, alias = "refresh_token")]
    refresh_token: Option<String>,
    #[serde(default, alias = "organization_id")]
    organization_id: Option<String>,
    #[serde(default, alias = "authentication_method")]
    authentication_method: Option<String>,
}

pub fn authorization_url(
    config: &Config,
    screen_hint: &str,
    state: &str,
) -> Result<String, WorkosError> {
    let client_id = config
        .workos_client_id
        .as_ref()
        .ok_or(WorkosError::NotConfigured)?;
    let mut url = Url::parse(&format!("{WORKOS_API_BASE}/user_management/authorize"))?;
    url.query_pairs_mut()
        .append_pair("provider", "authkit")
        .append_pair("redirect_uri", &config.redirect_uri)
        .append_pair("client_id", client_id)
        .append_pair("state", state)
        .append_pair("screen_hint", screen_hint);
    Ok(url.to_string())
}

pub async fn authenticate_with_code(
    http: &Client,
    config: &Config,
    code: &str,
) -> Result<SessionData, WorkosError> {
    let api_key = config
        .workos_api_key
        .as_ref()
        .ok_or(WorkosError::NotConfigured)?;
    let client_id = config
        .workos_client_id
        .as_ref()
        .ok_or(WorkosError::NotConfigured)?;

    let response = http
        .post(format!("{WORKOS_API_BASE}/user_management/authenticate"))
        .bearer_auth(api_key)
        .json(&json!({
            "client_id": client_id,
            "code": code,
            "grant_type": "authorization_code"
        }))
        .send()
        .await?;

    if !response.status().is_success() {
        let status = response.status();
        let body = response.text().await.unwrap_or_default();
        return Err(WorkosError::Api { status, body });
    }

    let auth = response.json::<AuthenticateResponse>().await?;
    Ok(SessionData {
        user_id: auth.user.id,
        email: auth.user.email,
        first_name: auth.user.first_name,
        last_name: auth.user.last_name,
        avatar_url: auth.user.profile_picture_url,
        organization_id: auth.organization_id,
        authentication_method: auth.authentication_method,
        access_token: auth.access_token,
        refresh_token: auth.refresh_token,
        client_ip: None,
        user_agent: None,
    })
}

pub async fn get_user(
    http: &Client,
    config: &Config,
    user_id: &str,
) -> Result<WorkosUser, WorkosError> {
    let api_key = config
        .workos_api_key
        .as_ref()
        .ok_or(WorkosError::NotConfigured)?;
    let response = http
        .get(format!("{WORKOS_API_BASE}/user_management/users/{user_id}"))
        .bearer_auth(api_key)
        .send()
        .await?;

    if !response.status().is_success() {
        let status = response.status();
        let body = response.text().await.unwrap_or_default();
        return Err(WorkosError::Api { status, body });
    }

    Ok(response.json::<WorkosUser>().await?)
}

pub async fn update_user_profile(
    http: &Client,
    config: &Config,
    user_id: &str,
    first_name: Option<String>,
    last_name: Option<String>,
    company: Option<String>,
    use_case: Option<String>,
) -> Result<WorkosUser, WorkosError> {
    let api_key = config
        .workos_api_key
        .as_ref()
        .ok_or(WorkosError::NotConfigured)?;
    let response = http
        .patch(format!("{WORKOS_API_BASE}/user_management/users/{user_id}"))
        .bearer_auth(api_key)
        .json(&json!({
            "first_name": first_name,
            "last_name": last_name,
            "metadata": {
                "company": company,
                "use_case": use_case
            }
        }))
        .send()
        .await?;

    if !response.status().is_success() {
        let status = response.status();
        let body = response.text().await.unwrap_or_default();
        return Err(WorkosError::Api { status, body });
    }

    Ok(response.json::<WorkosUser>().await?)
}
