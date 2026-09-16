import { describe, expect, it } from "vitest";

import {
  MAX_FRAME_DT,
  ParticleBuffer,
  SceneSequencer,
  type DrawContext,
  type LifecycleScene,
  type SceneContext,
  type SceneCue,
} from "@mlai/trailer-engine";

/** A scene that records its lifecycle and the RNG values it was handed. */
function makeScene(name: string, log: string[]) {
  const scene: LifecycleScene & { rolls: number[]; updates: number[] } = {
    rolls: [],
    updates: [],
    enter(ctx: SceneContext) {
      log.push(`${name}:enter`);
      scene.rolls.push(ctx.random());
    },
    update(dt) {
      scene.updates.push(dt);
    },
    draw(_ctx, _w, _h, local) {
      log.push(`${name}:draw@${local.toFixed(3)}`);
    },
    exit() {
      log.push(`${name}:exit`);
    },
  };
  return scene;
}

const ctx = {} as DrawContext;

function setup() {
  const log: string[] = [];
  const a = makeScene("a", log);
  const b = makeScene("b", log);
  const cues: SceneCue[] = [
    { name: "a", scene: a, start: 0, duration: 2, seed: 1 },
    { name: "b", scene: b, start: 2, duration: 3, seed: 2 },
  ];
  const seq = new SceneSequencer(cues, { particles: new ParticleBuffer(8) });
  return { log, a, b, seq };
}

describe("SceneSequencer", () => {
  it("enters once, updates per frame, and exits on the boundary", () => {
    const { log, a, b, seq } = setup();
    seq.draw(ctx, 100, 100, 0);
    seq.draw(ctx, 100, 100, 0.016);
    seq.draw(ctx, 100, 100, 0.032);
    seq.draw(ctx, 100, 100, 2.01);
    expect(log.filter((e) => e.endsWith(":enter"))).toEqual(["a:enter", "b:enter"]);
    expect(log.indexOf("a:exit")).toBeLessThan(log.indexOf("b:enter"));
    expect(a.updates.map((d) => +d.toFixed(3))).toEqual([0.016, 0.016]);
    expect(b.updates.map((d) => +d.toFixed(3))).toEqual([0.01]);
  });

  it("re-enters on a backward move and replays the same seeded layout", () => {
    const { a, seq } = setup();
    seq.draw(ctx, 100, 100, 1.0);
    seq.draw(ctx, 100, 100, 1.05);
    seq.draw(ctx, 100, 100, 0.5); // the playhead moved back inside the same cue
    expect(a.rolls).toHaveLength(2);
    expect(a.rolls[0]).toBe(a.rolls[1]);
    expect(seq.localTime).toBeCloseTo(MAX_FRAME_DT, 9); // integrated from enter, clamped
  });

  it("seek lands on the exact frame playing would have reached", () => {
    const { a, b, seq } = setup();
    seq.draw(ctx, 100, 100, 0.2);
    seq.seek(3.0, 100, 100); // into cue b, one second in
    expect(seq.activeCue?.name).toBe("b");
    expect(seq.localTime).toBeCloseTo(1.0, 9);
    expect(b.updates.length).toBe(Math.ceil(1.0 / MAX_FRAME_DT));
    expect(b.updates.reduce((s, d) => s + d, 0)).toBeCloseTo(1.0, 9);
    seq.seek(0.5, 100, 100); // back into a: re-enter, same seed
    expect(a.rolls).toHaveLength(2);
    expect(a.rolls[0]).toBe(a.rolls[1]);
    expect(seq.localTime).toBeCloseTo(0.5, 9);
  });

  it("clamps a stalled frame to MAX_FRAME_DT instead of skipping the beat", () => {
    const { a, seq } = setup();
    seq.draw(ctx, 100, 100, 0);
    seq.draw(ctx, 100, 100, 1.5); // a 1.5 s stall
    expect(a.updates).toEqual([MAX_FRAME_DT]);
    expect(seq.localTime).toBeCloseTo(MAX_FRAME_DT, 9);
  });

  it("splits a frame into substeps when asked", () => {
    const log: string[] = [];
    const a = makeScene("a", log);
    const seq = new SceneSequencer([{ name: "a", scene: a, start: 0, duration: 5, seed: 3 }], {
      particles: new ParticleBuffer(1),
      maxSubstep: 0.01,
    });
    seq.draw(ctx, 10, 10, 0);
    seq.draw(ctx, 10, 10, 0.035);
    expect(a.updates.length).toBe(4);
    expect(a.updates.reduce((s, d) => s + d, 0)).toBeCloseTo(0.035, 9);
  });

  it("draws nothing in a gap and exits the previous scene", () => {
    const log: string[] = [];
    const a = makeScene("a", log);
    const seq = new SceneSequencer([{ name: "a", scene: a, start: 1, duration: 1, seed: 1 }], {
      particles: new ParticleBuffer(1),
    });
    seq.draw(ctx, 10, 10, 0.5);
    expect(log).toEqual([]);
    seq.draw(ctx, 10, 10, 1.2);
    seq.draw(ctx, 10, 10, 2.5);
    expect(log).toEqual(["a:enter", "a:draw@0.067", "a:exit"]);
    expect(seq.activeCue).toBeNull();
  });

  it("re-lays out on resize and exits the active scene on dispose", () => {
    const { log, seq } = setup();
    const switches: string[] = [];
    seq.draw(ctx, 100, 100, 0.5);
    seq.draw(ctx, 200, 100, 0.52);
    expect(log.filter((e) => e === "a:enter")).toHaveLength(2);
    seq.dispose();
    expect(log.at(-1)).toBe("a:exit");
    seq.draw(ctx, 100, 100, 3);
    expect(log.at(-1)).toBe("a:exit");
    expect(switches).toEqual([]);
  });

  it("rejects a cue without a positive duration", () => {
    expect(() => new SceneSequencer([{ name: "x", scene: makeScene("x", []), start: 0, duration: 0, seed: 1 }], { particles: new ParticleBuffer(1) })).toThrow(RangeError);
  });
});
