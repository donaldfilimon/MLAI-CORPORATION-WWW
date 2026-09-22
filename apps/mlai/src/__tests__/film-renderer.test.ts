import { describe, expect, it } from "vitest";

import {
  Canvas2DRenderer,
  NL_LAYERS,
  NeuralScene,
  buildNet3D,
  createRandom,
  type DrawContext,
  type NeuralModePreset,
  type RenderTarget,
  type Scene,
} from "@mlai/trailer-engine";

/** A DrawContext that records every method name it is asked for. */
function makeRecordingContext() {
  const calls: string[] = [];
  const gradient = { addColorStop() {} };
  const ctx = new Proxy({} as Record<string, unknown>, {
    get(_target, prop) {
      if (typeof prop !== "string") return undefined;
      if (prop === "createRadialGradient") return () => gradient;
      return (...args: unknown[]) => {
        calls.push(prop);
        if (prop === "setTransform") calls.push(`setTransform(${args.join(",")})`);
      };
    },
    set() {
      return true; // fillStyle, strokeStyle, lineWidth, globalCompositeOperation
    },
  }) as unknown as DrawContext;
  return { ctx, calls };
}

function makeTarget() {
  const rec = makeRecordingContext();
  const target: RenderTarget & { calls: string[] } = {
    width: 0,
    height: 0,
    calls: rec.calls,
    getContext: () => rec.ctx,
  };
  return target;
}

const CHAOS: NeuralModePreset = { order: 0.05, radial: 0, hue: [255, 90, 84], spd: 1.5, waves: 3, glow: 0.8 };
const BUILD: NeuralModePreset = { order: 0.93, radial: 0, hue: [80, 175, 255], spd: 1.6, waves: 2, glow: 1.15 };

describe("Canvas2DRenderer", () => {
  it("sizes the surface by the device-pixel ratio and scales the transform", () => {
    const target = makeTarget();
    const r = new Canvas2DRenderer(target);
    r.resize(1920, 1080, 2);
    expect(target.width).toBe(3840);
    expect(target.height).toBe(2160);
    expect(target.calls).toContain("setTransform(2,0,0,2,0,0)");
  });

  it("hands the scene the logical size and the playhead", () => {
    const target = makeTarget();
    const r = new Canvas2DRenderer(target);
    r.resize(1920, 1080, 2);
    const seen: unknown[][] = [];
    const scene: Scene = { draw: (_ctx, w, h, t) => seen.push([w, h, t]) };
    r.render(1.5); // no scene yet: nothing happens
    r.setScene(scene);
    r.render(2.5);
    expect(seen).toEqual([[1920, 1080, 2.5]]);
    r.dispose();
    r.render(3.5);
    expect(seen).toHaveLength(1);
  });
});

describe("buildNet3D", () => {
  it("is deterministic under a seeded random source", () => {
    const a = buildNet3D(NL_LAYERS, createRandom(1));
    const b = buildNet3D(NL_LAYERS, createRandom(1));
    const c = buildNet3D(NL_LAYERS, createRandom(2));
    expect(a.nodes).toHaveLength(68);
    expect(a.stars).toHaveLength(90);
    expect(a.edges.length).toBe(b.edges.length);
    expect(a.nodes[0]).toEqual(b.nodes[0]);
    expect(a.edges[0]).toEqual(b.edges[0]);
    expect(a.nodes[0]?.nz).not.toBe(c.nodes[0]?.nz);
  });
});

describe("NeuralScene", () => {
  it("snaps to the target on the first draw and eases after", () => {
    const rec = makeRecordingContext();
    const scene = new NeuralScene({ initial: CHAOS, random: createRandom(7) });
    scene.setMode(BUILD);
    scene.draw(rec.ctx, 1920, 1080, 0);
    expect(scene.current.order).toBe(BUILD.order);
    scene.setMode(CHAOS);
    scene.draw(rec.ctx, 1920, 1080, 0.1);
    expect(scene.current.order).toBeCloseTo(BUILD.order + (CHAOS.order - BUILD.order) * 0.06, 9);
    expect(scene.current.hue[0]).toBeCloseTo(80 + (255 - 80) * 0.06, 9);
  });

  it("draws only the base and grid at zero intensity", () => {
    const rec = makeRecordingContext();
    const scene = new NeuralScene({ initial: CHAOS, random: createRandom(7), intensity: () => 0 });
    scene.draw(rec.ctx, 1920, 1080, 1);
    expect(rec.calls.filter((c) => c === "fillRect")).toHaveLength(1);
    expect(rec.calls.filter((c) => c === "arc")).toHaveLength(0);
    const lit = makeRecordingContext();
    new NeuralScene({ initial: CHAOS, random: createRandom(7) }).draw(lit.ctx, 1920, 1080, 1);
    expect(lit.calls.filter((c) => c === "arc").length).toBeGreaterThan(90);
  });
});
