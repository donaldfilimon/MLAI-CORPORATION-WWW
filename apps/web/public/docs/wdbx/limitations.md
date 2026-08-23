---
title: Limitations
---

# Limitations

Keep docs and UI honest about implementation status.

- CPU vector acceleration is implemented; WebGPU/TPU execution is not production dispatch yet.
- WGSL files are static shader assets until a real `wgpu` backend compiles and dispatches them.
- Network transports model routing and encrypted envelopes; they are not full send/receive implementations.
- Discord support is currently configuration/status/message-routing scaffolding, not a connected gateway bot.
- Do not claim production benchmark numbers without fresh benchmark evidence.
- `mlx_model/model.safetensors` is too large for normal GitHub history; use Git LFS or external model storage.
