---
title: Abbey WDBX
---

# Abbey WDBX

Abbey WDBX is a Rust 2024 project for a multi-profile assistant system built around Abbey, Aviva, and Abi plus WDBX vector/block memory.

Core motto: **Care first. Clarity always. Competence throughout.**

## Start Here

- [Getting Started](getting-started.md)
- [CLI Reference](cli.md)
- [Architecture](architecture.md)
- [API And Dashboard](api.md)
- [MCP, LSP, And ACP](protocols.md)
- [Acceleration](acceleration.md)
- [Persistence](persistence.md)
- [Discord Bot](discord.md)
- [Limitations](limitations.md)

## Implementation Reality

- The CPU vector backend is the authoritative acceleration path today.
- WebGPU/TPU support is currently capability scaffolding and static WGSL assets, not production dispatch.
- Network transports model topology, envelopes, and routing; they are not full distributed send/receive transports yet.
- Treat benchmark numbers as targets unless produced by fresh checked-in benchmark runs.
