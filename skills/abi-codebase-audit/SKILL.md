---
name: abi-codebase-audit
description: Use when auditing the ABI Zig codebase, reviewing feature parity, checking stale docs, finding safety risks, or preparing code review findings for GPU, WDBX, MCP, CLI, AI routing, connectors, scheduler, memory, or plugin changes.
---

# ABI Codebase Audit

Use this skill for ABI framework audits, reviews, and parity checks. Read `tasks/lessons.md` and `tasks/todo.md` first. Treat executable config and source as truth. Inspect mod/stub pairs for public APIs. Prioritize correctness, races, ownership, protocol regressions, and missing tests. Verify with `./build.sh check`, `zig build check-parity`, `zig build test-integration`, and `zig build benchmarks` as relevant.
