---
title: API And Dashboard
---

# API And Dashboard

Start the API:

```bash
cargo run -- --api --api-host 127.0.0.1 --api-port 3000
```

Useful routes:

- `/health`
- `/api/status`
- `/api/network`
- `/api/shards`
- `/api/acceleration`
- `/api/acceleration/bench`
- `/dashboard`
- `/dashboard/yew-template`
- `/mcp`
- `/lsp`
- `/acp`

`/action` is allowlisted. Unsupported actions should return explicit errors, not partial-success stubs.

API state uses `tokio::sync::RwLock<Pipeline>` to avoid blocking Tokio worker threads.
