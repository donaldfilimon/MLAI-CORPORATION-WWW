import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { describeCameraError } from "../views/TFPoseDemo";

/**
 * `/tf-pose-demo` source guards.
 *
 * Until 2026-09-17 the view returned early while loading and on error, and
 * rendered `<video>` only in the final branch (never a `<canvas>`), so the
 * setup effect always found null refs and showed "Media elements not found"
 * in Chromium, Firefox and WebKit. The suite is Node-only, so the render order
 * is pinned at source level; the browser behaviour was verified with
 * Playwright against a production build.
 */

const ROOT = resolve(__dirname, "../..");
const read = (p: string) => readFileSync(resolve(ROOT, p), "utf8");
const VIEW = "src/views/TFPoseDemo.tsx";

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return walk(path);
    return /\.(ts|tsx)$/.test(name) ? [path] : [];
  });

describe("TFPoseDemo render order", () => {
  const src = read(VIEW);
  const body = src.slice(src.indexOf("const TFPoseDemo = () =>"));
  const jsx = body.slice(body.indexOf("\n  return ("));

  it("has exactly one render return, so no state can hide the media elements", () => {
    expect(body.match(/\n {2}return \(/g)).toHaveLength(1);
    expect(body).not.toMatch(/if \((isLoading|error|status[^)]*)\)\s*\{?\s*return\s*\(/);
  });

  it("renders the video and the canvas unconditionally", () => {
    for (const tag of ["<video", "<canvas"]) {
      const at = jsx.indexOf(tag);
      expect(at, `${tag} is rendered`).toBeGreaterThan(0);
      // Not inside a `cond && (` or ternary branch: nothing conditional opens before it.
      const before = jsx.slice(0, at);
      expect(before).not.toMatch(/&&\s*\(\s*$|\?\s*\(\s*$/);
      expect(before).not.toMatch(/\{[^{}]*&&\s*\([^)]*$/);
    }
    expect(jsx).toMatch(/<video\s+ref=\{videoRef\}/);
    expect(jsx).toMatch(/<canvas\s+ref=\{canvasRef\}/);
  });

  it("announces loading and errors through live regions that stay mounted", () => {
    expect(jsx).toContain('role="status"');
    expect(jsx).toContain('role="alert"');
    expect(jsx).toContain("aria-busy={busy}");
  });

  it("awaits playback inside the guarded setup instead of throwing from .catch", () => {
    expect(src).toContain("await video.play()");
    expect(src).not.toMatch(/\.catch\(\s*\([^)]*\)\s*=>\s*\{\s*throw/);
    expect(src).toMatch(/run\(\)\.catch\(/);
  });

  it("stops a stream that arrives after cleanup already ran", () => {
    expect(src).toMatch(/if \(cancelled\) \{\s*\/\/[^\n]*\n\s*stream\.getTracks\(\)\.forEach/);
  });

  it("sizes the video element, which PoseNet reads instead of the stream size", () => {
    expect(src).toContain("video.width = video.videoWidth");
    expect(src).toContain("video.height = video.videoHeight");
  });
});

describe("TFPoseDemo isolation", () => {
  it("loads TensorFlow only through dynamic imports in the view", () => {
    const src = read(VIEW);
    expect(src).toContain('await import("@tensorflow/tfjs")');
    expect(src).toContain('await import("@tensorflow-models/posenet")');
    expect(src).not.toMatch(/^import[^;]*from\s+["']@tensorflow/m);
  });

  it("has no other importer of TensorFlow in src/ or app/", () => {
    const importers = [...walk(resolve(ROOT, "src")), ...walk(resolve(ROOT, "app"))]
      .map((file) => relative(ROOT, file))
      .filter((file) => !file.startsWith("src/__tests__/"))
      .filter((file) => /["']@tensorflow/.test(readFileSync(resolve(ROOT, file), "utf8")));
    expect(importers).toEqual([VIEW]);
  });

  it("is mounted client-only through a default-export next/dynamic", () => {
    const client = read("app/tf-pose-demo/client.tsx");
    expect(client).toContain('dynamic(() => import("@/views/TFPoseDemo"), {');
    expect(client).toContain("ssr: false");
    expect(client).not.toContain(".then(");
  });
});

describe("describeCameraError", () => {
  const named = (name: string) => new DOMException("x", name);

  it("explains a denied camera", () => {
    expect(describeCameraError(named("NotAllowedError"))).toMatch(/blocked/);
    expect(describeCameraError(named("SecurityError"))).toMatch(/blocked/);
  });

  it("explains a missing camera", () => {
    expect(describeCameraError(named("NotFoundError"))).toMatch(/No camera/);
    expect(describeCameraError(named("OverconstrainedError"))).toMatch(/No camera/);
  });

  it("explains a browser that cannot capture (headless Chromium reports this)", () => {
    expect(describeCameraError(named("NotSupportedError"))).toMatch(/not available/);
  });

  it("explains a busy camera and falls back for anything else", () => {
    expect(describeCameraError(named("NotReadableError"))).toMatch(/in use/);
    expect(describeCameraError(new Error("boom"))).toBe("The camera could not be started.");
    expect(describeCameraError("nope")).toBe("The camera could not be started.");
  });
});
