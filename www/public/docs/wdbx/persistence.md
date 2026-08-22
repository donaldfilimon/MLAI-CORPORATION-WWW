---
title: Persistence
---

# Persistence

## WDBX Snapshots

```bash
cargo run -- --demo "explain persistent memory" --save-db ./wdbx.snapshot.json
cargo run -- --neural --load-db ./wdbx.snapshot.json
```

Snapshots save and restore vector records plus block-chain memory.

## Soul Prompt Bootstrap

Soul prompt files can be Markdown or CSV:

```bash
cargo run -- --neural --soul-prompt ./training/abbey.md
cargo run -- --chat --soul ./training/abbey.md
```

Bootstrap errors should be surfaced. Do not silently ignore `Pipeline::bootstrap_soul_layout` failures.
