// kokoro-loader.ts — the one place apps/web knows about Kokoro and ONNX Runtime.
//
// AudioEngine (@mlai/trailer-engine) takes a `LoadTTS` function and owns the
// retries; this file owns one attempt: the CDN import, device detection, the
// dtype choice, and the ORT log filter. Keeping the runtime a client-only
// dynamic import means it never enters the server bundle or the initial chunk;
// it is fetched only when load() first runs. src/lib/csp.ts allowlists the
// jsDelivr and Hugging Face origins this needs.

import type { LoadTTS, TTSHandle } from "@mlai/trailer-engine";

export const MODEL_ID = "onnx-community/Kokoro-82M-v1.0-ONNX";
const CDN_URL = "https://cdn.jsdelivr.net/npm/kokoro-js@1.2.1/dist/kokoro.web.js";

async function detectDevice(): Promise<string> {
  try {
    const nav = navigator as Navigator & { gpu?: { requestAdapter: () => Promise<unknown> } };
    if (nav.gpu && (await nav.gpu.requestAdapter())) return "webgpu";
  } catch {
    /* no WebGPU */
  }
  return "wasm";
}

// ONNX Runtime Web prints a benign warning on session creation when shape/CPU
// ops fall back off the preferred EP ("VerifyEachNodeIsAssignedToAnEp … Some
// nodes were not assigned to the preferred execution providers"). It is
// informational, but ORT logs it via console.error, which trips the Next.js
// dev error overlay. Filter ONLY that line; everything else passes through.
// Process-global and installed once; it is deliberately not part of the engine.
let ortFilterInstalled = false;
function installOrtLogFilter(): void {
  if (ortFilterInstalled || typeof console === "undefined") return;
  ortFilterInstalled = true;
  const BENIGN = /onnxruntime|VerifyEachNodeIsAssignedToAnEp|nodes were not assigned to the preferred/i;
  for (const level of ["warn", "error"] as const) {
    const orig = console[level].bind(console);
    console[level] = (...args: unknown[]) => {
      if (typeof args[0] === "string" && BENIGN.test(args[0])) return;
      orig(...args);
    };
  }
}

/** One Kokoro load attempt. Throws on failure; AudioEngine retries with backoff. */
export const loadKokoro: LoadTTS = async (report) => {
  installOrtLogFilter(); // before session creation, so the notice is quiet at the source
  const mod: any = await import(/* webpackIgnore: true */ /* @vite-ignore */ CDN_URL);
  const KokoroTTS = mod.KokoroTTS || (mod.default && mod.default.KokoroTTS);
  if (!KokoroTTS) throw new Error("KokoroTTS export not found");
  const device = await detectDevice();
  const dtype = device === "webgpu" ? "fp32" : "q8";
  const tts: TTSHandle = await KokoroTTS.from_pretrained(MODEL_ID, {
    dtype,
    device,
    // ORT log severity 3 = ERROR: stop the benign WARNING-level EP-assignment
    // notices at the source (transformers.js forwards session_options to the
    // InferenceSession). The console filter above is the fallback for builds
    // that ignore this.
    session_options: { logSeverityLevel: 3 },
    progress_callback: (p: { progress?: number }) => {
      if (p && typeof p.progress === "number") report(p.progress / 100);
    },
  });
  return { tts, device };
};
