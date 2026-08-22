---
title: Getting Started
---

# Getting Started

## Requirements

- Rust `>=1.85`
- Rust edition 2024

## Verify The Repo

```bash
cargo fmt --check
cargo test -p wdbx
cargo clippy -- -D warnings
cargo build
```

## First Commands

```bash
cargo run -- --status
cargo run -- --demo "explain WDBX memory"
cargo run -- --chat
```

## API And Dashboard

```bash
cargo run -- --api --api-host 127.0.0.1 --api-port 3000
```

Open `http://127.0.0.1:3000/dashboard`.
