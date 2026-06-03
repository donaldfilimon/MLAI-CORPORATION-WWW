---
name: abi-refactor-architecture
description: Use when redesigning or refactoring the ABI Zig framework, planning module boundaries, splitting features, simplifying APIs, or changing GPU, WDBX, MCP, CLI, AI, scheduler, memory, plugin, or connector architecture.
---

# ABI Refactor Architecture

Use this skill for ABI redesign and refactoring. Prefer the smallest correct change. Preserve shipped behavior unless explicitly asked. Keep `mod.zig` and `stub.zig` synchronized. Keep library `src/` imports relative; build-defined adapters such as `src/mcp/handlers.zig` may import the public `abi` package. Do not edit generated `src/plugin_registry.zig`. Plan source truth, API impact, steps, and verification before broad edits.
