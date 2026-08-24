---
title: Architecture
---

# Architecture

## Profiles

- Abbey: empathetic polymath, warm and technically deep.
- Aviva: direct expert, concise and execution-focused.
- Abi: adaptive moderator/router, safety and context aware.

## Main Modules

- `src/main.rs`: CLI parsing and mode dispatch.
- `src/lib.rs`: library exports.
- `src/pipeline.rs`: main Abbey/WDBX execution path.
- `src/abi/*`: profile routing and persona behavior.
- `src/database/*`: vector store, block-chain memory, sharding, snapshots, network topology models.
- `src/neural/*`: point neural network and soul prompt layout.
- `src/tui/*`: ratatui/crossterm interactive UI.
- `src/api/*`: HTTP API controller.
- `src/protocols/*`: MCP, LSP, and ACP JSON-RPC surfaces.
- `src/web.rs`: dashboard HTML and Yew template.
- `src/features/acceleration.rs`: CPU vector backend plus WebGPU/TPU capability reporting.
- `src/features/discord.rs`: Discord bot configuration/status and safe message routing foundation.

## Pipeline Shape

Input flows through guardrails, Abi routing, neural processing, WDBX retrieval, local/provider generation, constitutional validation, memory write, and telemetry.
