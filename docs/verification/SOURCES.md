# Implementation references

- Original MLAI SVG: archived `MLAI-final-bun-site/public/brand/mlai-mark.svg`. Design references in `docs/design` are the user-selected concepts, not interactive UI assets.
- ABI interface verified against `/Users/donaldfilimon/dev/active/abi`: `abi dashboard --once --json` and `abi backends`.
- WDBX protocol copied from `crates/abi-wdbx-gateway/proto/gateway.proto` in that repository. Actual gRPC statistics, vector/KV operations and mutation events were exercised against a temporary store. Existing gateway storage was not modified.
- [Next.js server deployment](https://nextjs.org/docs/app/guides/self-hosting), [Better Auth local credentials](https://better-auth.com/docs/authentication/email-password), [Docling supported formats](https://docling-project.github.io/docling/usage/supported_formats/).
- [Apache Tika 3.3.2 maintained release](https://tika.apache.org/download.html); its official SHA-512 digest is verified during setup.
- Local embedding model: [all-MiniLM-L6-v2](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2), revision `1110a243fdf4706b3f48f1d95db1a4f5529b4d41`, normalized 384-dimensional vectors. Runtime encoding loads only cached assets.
- [MLX-LM server](https://github.com/ml-explore/mlx-lm/blob/main/mlx_lm/SERVER.md), version 0.31.3, provided the dedicated loopback runtime used for live chat checks. This did not modify the existing MLX Core service at port 8080.
- Synthetic document fixtures were created for this project. Files in `worker/tests/fixtures/upstream` come from the Apache Tika test corpus; individual source links and Apache-2.0 attribution are in that folder's `SOURCES.md`.

No unsupported performance figures, Apple partnership claims, production customer records, provider credentials, or production deployment configuration were copied into this repository.
