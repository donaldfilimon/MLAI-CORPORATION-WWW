use axum::http::{HeaderMap, header};
use serde_json::Result as JsonResult;
use sha2::{Digest, Sha512};
use time::Duration;
use tower_cookies::{Cookie, Cookies, Key, cookie::SameSite};

use crate::models::SessionData;

pub const COOKIE_NAME: &str = "mlai_session";
pub const COOKIE_MAX_AGE_SECONDS: i64 = 60 * 60 * 24 * 7;

pub fn derive_cookie_key(secret: &str) -> Key {
    let digest = Sha512::digest(secret.as_bytes());
    let mut key = [0_u8; 64];
    key.copy_from_slice(&digest);
    Key::from(&key)
}

pub fn client_ip(headers: &HeaderMap) -> String {
    header_string(headers, "x-forwarded-for")
        .and_then(|value| value.split(',').next().map(|part| part.trim().to_owned()))
        .filter(|value| !value.is_empty())
        .or_else(|| header_string(headers, "x-real-ip"))
        .unwrap_or_else(|| "unknown".to_owned())
}

pub fn user_agent(headers: &HeaderMap) -> String {
    header_string(headers, header::USER_AGENT.as_str()).unwrap_or_else(|| "unknown".to_owned())
}

fn header_string(headers: &HeaderMap, name: &str) -> Option<String> {
    headers
        .get(name)
        .and_then(|value| value.to_str().ok())
        .map(str::to_owned)
}

pub fn set_session(
    cookies: &Cookies,
    key: &Key,
    mut data: SessionData,
    headers: &HeaderMap,
    secure: bool,
) -> JsonResult<()> {
    data.client_ip = Some(client_ip(headers));
    data.user_agent = Some(user_agent(headers));
    let value = serde_json::to_string(&data)?;
    let mut cookie = Cookie::build((COOKIE_NAME, value))
        .path("/")
        .http_only(true)
        .same_site(SameSite::Lax)
        .max_age(Duration::seconds(COOKIE_MAX_AGE_SECONDS))
        .build();
    if secure {
        cookie.set_secure(true);
    }
    cookies.private(key).add(cookie);
    Ok(())
}

pub fn get_session(cookies: &Cookies, key: &Key, headers: &HeaderMap) -> Option<SessionData> {
    let cookie = cookies.private(key).get(COOKIE_NAME)?;
    let data = serde_json::from_str::<SessionData>(cookie.value()).ok()?;

    let current_ip = client_ip(headers);
    let current_ua = user_agent(headers);

    if data
        .client_ip
        .as_deref()
        .is_some_and(|value| value != current_ip)
    {
        tracing::warn!(user_id = %data.user_id, expected = ?data.client_ip, actual = %current_ip, "session IP mismatch");
        return None;
    }

    if data
        .user_agent
        .as_deref()
        .is_some_and(|value| value != current_ua)
    {
        tracing::warn!(user_id = %data.user_id, "session User-Agent mismatch");
        return None;
    }

    Some(data)
}

pub fn destroy_session(cookies: &Cookies, key: &Key, secure: bool) {
    let mut cookie = Cookie::build((COOKIE_NAME, ""))
        .path("/")
        .http_only(true)
        .same_site(SameSite::Lax)
        .max_age(Duration::seconds(0))
        .build();
    if secure {
        cookie.set_secure(true);
    }
    cookies.private(key).remove(cookie);
}
