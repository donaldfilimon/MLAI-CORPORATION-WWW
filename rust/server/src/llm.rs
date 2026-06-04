use reqwest::Client;
use serde::Deserialize;
use serde_json::json;

use crate::{
    config::Config,
    models::{ChatMessage, SessionData},
};

#[derive(Clone, Debug, serde::Serialize)]
pub struct LlmResponse {
    pub provider: String,
    pub model: String,
    pub text: String,
}

#[derive(Debug, Deserialize)]
struct GeminiResponse {
    #[serde(default)]
    candidates: Vec<GeminiCandidate>,
}

#[derive(Debug, Deserialize)]
struct GeminiCandidate {
    content: Option<GeminiContent>,
}

#[derive(Debug, Deserialize)]
struct GeminiContent {
    #[serde(default)]
    parts: Vec<GeminiPart>,
}

#[derive(Debug, Deserialize)]
struct GeminiPart {
    text: Option<String>,
}

pub async fn generate_llm_response(
    http: &Client,
    config: &Config,
    messages: &[ChatMessage],
    user: &SessionData,
) -> anyhow::Result<LlmResponse> {
    let last_user_message = messages
        .iter()
        .rev()
        .find(|message| message.role == "user")
        .map(|message| message.content.as_str())
        .unwrap_or_default();

    if config.llm_provider == "gemini" {
        if let Some(api_key) = &config.gemini_api_key {
            let prompt = messages
                .iter()
                .map(|message| format!("{}: {}", message.role.to_uppercase(), message.content))
                .collect::<Vec<_>>()
                .join("\n\n");
            let url = format!(
                "https://generativelanguage.googleapis.com/v1beta/models/{}:generateContent?key={}",
                config.gemini_model, api_key
            );
            let response = http
                .post(url)
                .json(&json!({
                    "contents": [{
                        "role": "user",
                        "parts": [{
                            "text": format!(
                                "You are MLAI's private AI systems assistant. Be direct, technical, and safety-conscious. The signed-in user is {}.\n\n{}",
                                user.email, prompt
                            )
                        }]
                    }],
                    "generationConfig": {
                        "temperature": 0.4,
                        "maxOutputTokens": 900
                    }
                }))
                .send()
                .await?;

            if response.status().is_success() {
                let data = response.json::<GeminiResponse>().await?;
                let text = data
                    .candidates
                    .first()
                    .and_then(|candidate| candidate.content.as_ref())
                    .map(|content| {
                        content
                            .parts
                            .iter()
                            .filter_map(|part| part.text.as_deref())
                            .collect::<Vec<_>>()
                            .join("")
                            .trim()
                            .to_owned()
                    })
                    .filter(|value| !value.is_empty());

                if let Some(text) = text {
                    return Ok(LlmResponse {
                        provider: config.llm_provider.clone(),
                        model: config.gemini_model.clone(),
                        text,
                    });
                }
            } else {
                let status = response.status();
                let detail = response.text().await.unwrap_or_default();
                anyhow::bail!("Gemini request failed: {status} {detail}");
            }
        }
    }

    Ok(LlmResponse {
        provider: "local-fallback".to_owned(),
        model: "mlai-safe-scaffold".to_owned(),
        text: format!(
            "LLM provider is not configured yet, so this protected API returned a scaffolded response. Received request: {}\n\nNext steps: set GEMINI_API_KEY or another provider key server-side, keep calls behind WorkOS sessions, and add workflow-specific policies before enabling production actions.",
            if last_user_message.is_empty() {
                "No prompt provided."
            } else {
                last_user_message
            }
        ),
    })
}
