use std::{
    collections::HashMap,
    sync::Arc,
    time::{Duration, Instant},
};

use axum::{Json, http::HeaderMap};
use serde_json::{Value, json};
use tokio::sync::Mutex;

use crate::session::client_ip;

#[derive(Clone, Default)]
pub struct RateLimiter {
    inner: Arc<Mutex<HashMap<String, RateBucket>>>,
}

#[derive(Clone, Debug)]
struct RateBucket {
    count: u32,
    reset_at: Instant,
}

impl RateLimiter {
    pub async fn check(
        &self,
        headers: &HeaderMap,
        path: &str,
        window: Duration,
        max: u32,
    ) -> Result<(), (axum::http::StatusCode, Json<Value>)> {
        let ip = client_ip(headers);
        let key = format!("{ip}:{path}");
        let now = Instant::now();
        let mut buckets = self.inner.lock().await;
        let bucket = buckets.entry(key).or_insert_with(|| RateBucket {
            count: 0,
            reset_at: now + window,
        });

        if now > bucket.reset_at {
            bucket.count = 1;
            bucket.reset_at = now + window;
        } else {
            bucket.count += 1;
        }

        if bucket.count > max {
            Err((
                axum::http::StatusCode::TOO_MANY_REQUESTS,
                Json(json!({ "error": "Too many requests, please try again later." })),
            ))
        } else {
            Ok(())
        }
    }
}
