---
title: Acceleration
---

# Acceleration

The current authoritative backend is CPU.

Implemented today:

- `VectorKernelBackend`
- `CpuVectorBackend`
- `dot`
- `normalize`
- `cosine`
- `batch_cosine`
- static WGSL shader assets in `src/shaders/`

Current reality:

- WebGPU is not selected until real `wgpu` adapter/device probing and dispatch exist.
- TPU delegate support is not selected until a real delegate runtime is integrated.
- CPU fallback must remain deterministic and tested.

Inspection:

```bash
cargo run -- --acceleration
```
