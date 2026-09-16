import { describe, expect, it } from "vitest";

import { PlaybackController, type PlaybackState } from "@mlai/trailer-engine";

/** Counts live resources the way an AudioContext would behave. */
function makeResource() {
  const log: string[] = [];
  let live = 0;
  return {
    log,
    get live() { return live; },
    onStart: () => { live++; log.push("start"); },
    onDispose: () => { if (live > 0) live--; log.push("dispose"); },
  };
}

describe("PlaybackController", () => {
  it("runs the documented happy path", async () => {
    const seen: PlaybackState[] = [];
    const c = new PlaybackController({ onStateChange: (s) => seen.push(s) });
    expect(c.state).toBe("idle");
    await c.start();
    expect(c.state).toBe("playing");
    c.pause();
    c.resume();
    c.end();
    expect(c.state).toBe("ended");
    expect(seen).toEqual(["starting", "playing", "paused", "playing", "ended"]);
  });

  it("goes to error, not playing, when acquisition fails", async () => {
    const c = new PlaybackController({ onStart: () => { throw new Error("no audio"); } });
    await c.start();
    expect(c.state).toBe("error");
  });

  it("can restart from ended and from error", async () => {
    const c = new PlaybackController();
    await c.start();
    c.end();
    await c.start();
    expect(c.state).toBe("playing");
  });

  it("ignores a second start while already starting or playing", async () => {
    const r = makeResource();
    const c = new PlaybackController(r);
    await c.start();
    await c.start();
    await c.start();
    // A double-click must not open a second audio graph.
    expect(r.live).toBe(1);
    expect(r.log.filter((e) => e === "start")).toHaveLength(1);
  });

  it("never leaves more than one live resource across replay", async () => {
    const r = makeResource();
    const c = new PlaybackController(r);
    await c.start();
    c.end();
    await c.stop();
    await c.start();
    expect(r.live).toBe(1);
  });

  it("play -> pause -> resume keeps exactly one resource", async () => {
    const r = makeResource();
    const c = new PlaybackController(r);
    await c.start();
    c.pause();
    c.resume();
    expect(r.live).toBe(1);
  });

  it("a superseded slow start cannot overwrite the newer run's state", async () => {
    // The prototype's actual bug, in state-machine form: an in-flight teardown
    // or start from run N must not act on run N+1's resources.
    let release!: () => void;
    const gate = new Promise<void>((r) => { release = r; });
    let starts = 0;
    const c = new PlaybackController({
      onStart: async () => { starts++; if (starts === 1) await gate; },
    });

    const slow = c.start();          // run 1, blocks in onStart
    await c.stop();                  // supersedes run 1
    const fast = c.start();          // run 2
    release();
    await Promise.all([slow, fast]);

    // Run 1 resolving late must not have clobbered run 2.
    expect(c.state).toBe("playing");
  });

  it("a superseded start cannot drag a PAUSED newer run back to playing", async () => {
    // This is the assertion that actually pins the generation guard. The test
    // above cannot: there both runs end in `playing`, so a missing guard is
    // unobservable (set() no-ops when the state already matches). Here the newer
    // run is paused when the older one resolves, so an unguarded set("playing")
    // is visible — and it is exactly the prototype's bug, where a stale run
    // reached in and changed the state of the run that replaced it.
    let release!: () => void;
    const gate = new Promise<void>((r) => { release = r; });
    let starts = 0;
    const c = new PlaybackController({
      onStart: async () => { starts++; if (starts === 1) await gate; },
    });

    const slow = c.start();
    await c.stop();
    const fast = c.start();
    await fast;
    c.pause();
    expect(c.state).toBe("paused");

    release();
    await slow;

    expect(c.state).toBe("paused");
  });

  it("a superseded failing start cannot force the newer run into error", async () => {
    let release!: () => void;
    const gate = new Promise<void>((r) => { release = r; });
    let starts = 0;
    const c = new PlaybackController({
      onStart: async () => {
        starts++;
        if (starts === 1) { await gate; throw new Error("late failure"); }
      },
    });

    const slow = c.start();
    await c.stop();
    const fast = c.start();
    release();
    await Promise.all([slow, fast]);

    expect(c.state).toBe("playing");
  });

  it("stop is idempotent and always lands on idle", async () => {
    const r = makeResource();
    const c = new PlaybackController(r);
    await c.start();
    await c.stop();
    await c.stop();
    expect(c.state).toBe("idle");
    expect(r.live).toBe(0);
  });

  it("play -> finish -> replay holds one resource, with no stop() in between", async () => {
    // The plan's lifecycle list has this path with no stop(), and an earlier
    // version of this class leaked here: it disposed only when coming from
    // `paused`, so replaying from `ended` acquired a second resource while the
    // first was still live. Ownership is now tracked, not inferred from state.
    const r = makeResource();
    const c = new PlaybackController(r);
    await c.start();
    c.end();
    await c.start();
    expect(r.live).toBe(1);
  });

  it("replaying after a failed start does not strand the partial acquisition", async () => {
    const r = makeResource();
    let first = true;
    const c = new PlaybackController({
      onStart: () => { r.onStart(); if (first) { first = false; throw new Error("failed after acquiring"); } },
      onDispose: r.onDispose,
    });
    await c.start();
    expect(c.state).toBe("error");
    await c.start();
    expect(r.live).toBe(1);
  });

  it("reports holdsResources through end(), since ending frees nothing", async () => {
    const c = new PlaybackController();
    expect(c.holdsResources).toBe(false);
    await c.start();
    expect(c.holdsResources).toBe(true);
    c.pause();
    expect(c.holdsResources).toBe(true);
    c.end();
    // Reaching the end of the timeline does not release the audio graph.
    expect(c.holdsResources).toBe(true);
    await c.stop();
    expect(c.holdsResources).toBe(false);
  });

  it("ignores transitions that are not legal from the current state", async () => {
    const c = new PlaybackController();
    c.pause();
    expect(c.state).toBe("idle");
    c.resume();
    expect(c.state).toBe("idle");
    c.end();
    expect(c.state).toBe("idle");
  });
});
