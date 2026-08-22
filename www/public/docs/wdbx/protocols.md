---
title: Protocols
---

# MCP, LSP, And ACP

WDBX exposes lightweight JSON-RPC surfaces for protocol integration.

## MCP

Implemented methods include:

- `initialize`
- `tools/list`
- `tools/call`
- `resources/list`
- `resources/read`
- `prompts/list`
- `prompts/get`

Advertised tools include WDBX status, acceleration status, and memory-search request validation. `/mcp` runs against live API `Pipeline` state, so `wdbx.memory.search` returns WDBX matches when the API owns memory records. The standalone CLI handshake remains stateless.

## LSP

Implemented methods include:

- `initialize`
- `initialized`
- `shutdown`
- `textDocument/hover`
- `textDocument/completion`
- `textDocument/semanticTokens/full`

## ACP

Implemented methods include:

- `session/new`
- `observe/status`
- `message/send`
- `teach/note`
- `compute/status`

Keep advertised capabilities aligned with implemented handlers.
The `/acp` API endpoint runs against live API `Pipeline` state. `message/send` executes a pipeline turn, `teach/note` writes append-only WDBX memory, and `observe/status` reports current telemetry and configured topology. The topology is still the repository's WDBX transport model, not a guaranteed external cluster transport.
