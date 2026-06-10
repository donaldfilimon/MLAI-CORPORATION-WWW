---
title: CLI Reference
---

# CLI Reference

## Core Modes

```bash
cargo run -- --status
cargo run -- --chat
cargo run -- --demo "prompt"
cargo run -- --db
cargo run -- --neural
cargo run -- --metrics
cargo run -- --network
cargo run -- --providers
cargo run -- --prompt
cargo run -- --governance
```

## API

```bash
cargo run -- --api --api-host 127.0.0.1 --api-port 3000
```

## Capabilities And Protocols

```bash
cargo run -- --acceleration
cargo run -- --protocols
cargo run -- --mcp
cargo run -- --lsp
cargo run -- --acp
cargo run -- --discord-status
cargo run -- --discord-message '!abbey help'
DISCORD_BOT_TOKEN=... cargo run -- --discord-gateway
cargo run -- --generate-completions bash
```

## Multimodal Demo

The multimodal telemetry demo syntax is strict:

```bash
cargo run -- --multimodal-demo 'telemetry:sensor=therm-01;values=25.5,26.0'
```

Invalid specs return an error instead of silently doing nothing.
