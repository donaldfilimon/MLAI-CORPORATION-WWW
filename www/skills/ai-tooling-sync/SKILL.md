---
name: ai-tooling-sync
description: Use when cleaning, syncing, or configuring hidden AI-tool directories such as .claude, .config/opencode, .opencode, .gemini, .agents, .codex, .copilot, or plugin and skill stores.
---

# AI Tooling Sync

Sync durable authored skills, markdown agents, durable instructions, and safe local plugin source. Do not blindly sync OAuth tokens, API keys, chat history, session databases, browser profiles, marketplace caches, temp folders, generated logs, or unknown app-managed state.

Durable locations: `~/.config/opencode/skills`, `~/.claude/skills`, and `~/.gemini/skills`. Gemini loads these references from `~/.gemini/GEMINI.md`.
