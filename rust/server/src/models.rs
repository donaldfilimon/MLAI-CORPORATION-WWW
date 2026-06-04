use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SessionData {
    pub user_id: String,
    pub email: String,
    pub first_name: Option<String>,
    pub last_name: Option<String>,
    pub avatar_url: Option<String>,
    pub organization_id: Option<String>,
    pub authentication_method: Option<String>,
    pub access_token: String,
    pub refresh_token: Option<String>,
    pub client_ip: Option<String>,
    pub user_agent: Option<String>,
}

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PublicSessionUser {
    pub user_id: String,
    pub email: String,
    pub first_name: Option<String>,
    pub last_name: Option<String>,
    pub avatar_url: Option<String>,
    pub organization_id: Option<String>,
    pub authentication_method: Option<String>,
    pub client_ip: Option<String>,
    pub user_agent: Option<String>,
}

impl From<&SessionData> for PublicSessionUser {
    fn from(data: &SessionData) -> Self {
        Self {
            user_id: data.user_id.clone(),
            email: data.email.clone(),
            first_name: data.first_name.clone(),
            last_name: data.last_name.clone(),
            avatar_url: data.avatar_url.clone(),
            organization_id: data.organization_id.clone(),
            authentication_method: data.authentication_method.clone(),
            client_ip: data.client_ip.clone(),
            user_agent: data.user_agent.clone(),
        }
    }
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ChatMessage {
    pub role: String,
    pub content: String,
}

#[derive(Clone, Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct InquiryRequest {
    pub name: Option<String>,
    pub email: Option<String>,
    pub company: Option<String>,
    pub project_type: Option<String>,
    pub message: Option<String>,
}

#[derive(Clone, Debug, Serialize, sqlx::FromRow)]
pub struct Inquiry {
    pub id: i64,
    pub name: String,
    pub email: String,
    pub company: String,
    pub project_type: String,
    pub message: String,
    pub created_at: String,
}

#[derive(Clone, Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProfilePatch {
    pub first_name: Option<String>,
    pub last_name: Option<String>,
    pub company: Option<String>,
    pub use_case: Option<String>,
}
