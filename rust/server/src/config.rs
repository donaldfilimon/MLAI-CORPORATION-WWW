use std::env;

#[derive(Clone, Debug)]
pub struct Config {
    pub port: u16,
    pub app_url: String,
    pub frontend_url: String,
    pub redirect_uri: String,
    pub database_url: String,
    pub session_secret: String,
    pub node_env: String,
    pub workos_api_key: Option<String>,
    pub workos_client_id: Option<String>,
    pub llm_provider: String,
    pub gemini_api_key: Option<String>,
    pub gemini_model: String,
    pub billing_provider: String,
    pub stripe_payment_link: Option<String>,
}

impl Config {
    pub fn from_env() -> Self {
        let port = env::var("PORT")
            .ok()
            .and_then(|value| value.parse::<u16>().ok())
            .unwrap_or(3001);
        let app_url = env::var("APP_URL").unwrap_or_else(|_| "http://localhost:3001".to_owned());
        let frontend_url = env::var("FRONTEND_URL").unwrap_or_else(|_| app_url.clone());
        let redirect_uri = format!("{app_url}/api/auth/callback");
        let session_secret = env::var("SESSION_SECRET")
            .unwrap_or_else(|_| "development-only-change-me-32-characters-minimum".to_owned());

        Self {
            port,
            app_url,
            frontend_url,
            redirect_uri,
            database_url: env::var("DATABASE_URL")
                .unwrap_or_else(|_| "sqlite://inquiries.db".to_owned()),
            session_secret,
            node_env: env::var("NODE_ENV").unwrap_or_else(|_| "development".to_owned()),
            workos_api_key: env::var("WORKOS_API_KEY")
                .ok()
                .filter(|value| !value.is_empty()),
            workos_client_id: env::var("WORKOS_CLIENT_ID")
                .ok()
                .filter(|value| !value.is_empty()),
            llm_provider: env::var("LLM_PROVIDER").unwrap_or_else(|_| "gemini".to_owned()),
            gemini_api_key: env::var("GEMINI_API_KEY")
                .ok()
                .filter(|value| !value.is_empty()),
            gemini_model: env::var("GEMINI_MODEL")
                .unwrap_or_else(|_| "gemini-1.5-flash".to_owned()),
            billing_provider: env::var("BILLING_PROVIDER").unwrap_or_else(|_| "manual".to_owned()),
            stripe_payment_link: env::var("STRIPE_PAYMENT_LINK")
                .ok()
                .filter(|value| !value.is_empty()),
        }
    }

    pub fn auth_configured(&self) -> bool {
        self.workos_api_key.is_some()
            && self.workos_client_id.is_some()
            && self.session_secret != "development-only-change-me-32-characters-minimum"
    }

    pub fn secure_cookies(&self) -> bool {
        self.node_env == "production"
    }
}
