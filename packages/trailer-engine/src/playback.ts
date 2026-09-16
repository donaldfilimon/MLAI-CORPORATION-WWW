// playback.ts — playback lifecycle. Pure state machine, zero imports, no DOM.
//
// This exists because of a specific defect class, not for tidiness. The
// prototype this engine replaces tore its audio down on a 2s timer that read a
// mutable global, so replaying inside that window destroyed the *new* audio
// context rather than the old one. Any design where "dispose the old thing" and
// "the current thing" are the same mutable reference has that bug latent in it.
//
// The fix here is structural: every start claims a generation, and a teardown
// only acts if its generation is still current. A superseded teardown is a
// no-op, so a replay cannot be killed by the run it replaced no matter how the
// timing falls.

/**
 * `starting` is distinct from `playing` because acquiring resources (an
 * AudioContext, a model) is async and can fail. Collapsing them is what lets a
 * second start slip in mid-acquisition.
 */
export type PlaybackState = "idle" | "starting" | "playing" | "paused" | "ended" | "error";

export interface PlaybackHooks {
  /** Acquire resources. Rejecting sends the machine to `error`, not `playing`. */
  onStart?: () => Promise<void> | void;
  /** Release resources. Never called for a superseded generation. */
  onDispose?: () => Promise<void> | void;
  onStateChange?: (state: PlaybackState, previous: PlaybackState) => void;
}

export class PlaybackController {
  private _state: PlaybackState = "idle";
  /** Bumped by every start(); teardown compares against it before acting. */
  private generation = 0;
  /**
   * Whether a run currently owns resources. Tracked explicitly rather than
   * inferred from the state, because the mapping is not one-to-one: `ended`
   * and `error` both still hold them. Inferring it is what produced a
   * two-live-resource replay — see the note on start().
   */
  private held = false;
  private readonly hooks: PlaybackHooks;

  constructor(hooks: PlaybackHooks = {}) {
    this.hooks = hooks;
  }

  get state(): PlaybackState {
    return this._state;
  }

  /**
   * Whether a dispose would have something to release. True in `ended` and
   * `error` too: reaching the end of the timeline does not free the audio
   * graph, only stop() or the next start() does.
   */
  get holdsResources(): boolean {
    return this.held;
  }

  private set(next: PlaybackState): void {
    if (next === this._state) return;
    const previous = this._state;
    this._state = next;
    this.hooks.onStateChange?.(next, previous);
  }

  /**
   * Start, or restart. Safe to call from `idle`, `ended` or `error`; ignored
   * while already starting or playing so a double-click cannot open two audio
   * graphs. Disposes any previous run's resources first.
   */
  async start(): Promise<void> {
    if (this._state === "starting" || this._state === "playing") return;

    // Tear down the previous run under its own generation before claiming a new
    // one, so its disposal can never reach into this start's resources.
    //
    // This is gated on `held`, NOT on the state. An earlier version disposed
    // only from `paused`, which left play -> end -> start (the plain replay
    // path, with no stop() in between) holding TWO live resources — the exact
    // defect this class exists to prevent, reintroduced by inferring ownership
    // from the state machine instead of tracking it.
    if (this.held) await this.disposeCurrent();

    const generation = ++this.generation;
    this.set("starting");
    // Marked before acquisition, not after: if onStart throws partway it may
    // have already taken a context, and an unreleased partial acquisition is
    // the same leak by a quieter route.
    this.held = true;
    try {
      await this.hooks.onStart?.();
    } catch {
      // A start that lost the race must not overwrite the newer run's state.
      if (generation === this.generation) this.set("error");
      return;
    }
    if (generation !== this.generation) return;
    this.set("playing");
  }

  pause(): void {
    if (this._state !== "playing") return;
    this.set("paused");
  }

  resume(): void {
    if (this._state !== "paused") return;
    this.set("playing");
  }

  /** The timeline reached its end. Resources stay held until stop() or start(). */
  end(): void {
    if (this._state !== "playing" && this._state !== "paused") return;
    this.set("ended");
  }

  /** Release resources and return to `idle`. Idempotent. */
  async stop(): Promise<void> {
    // Claim a new generation so anything still in flight is superseded.
    this.generation++;
    if (this.held) await this.disposeCurrent();
    this.set("idle");
  }

  private async disposeCurrent(): Promise<void> {
    this.held = false;
    await this.hooks.onDispose?.();
  }
}
