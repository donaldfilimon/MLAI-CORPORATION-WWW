---
name: abi-lsp-zig-workflow
description: Use when configuring zls, OpenCode LSP, Zig diagnostics, abi-lsp workflows, editor integration, or troubleshooting Zig 0.17 language-server/build issues in the ABI repo.
---

# ABI LSP Zig Workflow

Use this skill for ZLS/OpenCode LSP and Zig diagnostics. Prefer `zvm install --zls master` for nightly compatibility. Current fallback ZLS binary may be `/Users/donald/.local/bin/zls-master`. OpenCode LSP config uses `lsp.zig.command` as an array and extensions `[".zig", ".zon"]`. Trust `./build.sh check` over LSP diagnostics when they disagree.
