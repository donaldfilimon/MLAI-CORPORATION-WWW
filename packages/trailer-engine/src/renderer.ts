// renderer.ts — the seam between scene semantics and the drawing surface.
//
// A Scene draws into a DrawContext at a logical size; a Renderer owns the
// surface, its device-pixel scaling and the scene handle. Canvas2DRenderer is
// the only implementation today. The interface exists so a WebGL renderer can
// arrive later without touching a scene or a control, and so a scene can be
// exercised in Node against a recording context.
//
// The renderer owns no animation loop. The host decides cadence (the React
// shell renders once per timeline tick), which is what keeps output identical
// to the code this replaced.

/** The subset of CanvasRenderingContext2D the scenes use. Types only; no DOM at runtime. */
export type DrawContext = Pick<
  CanvasRenderingContext2D,
  | "setTransform"
  | "fillRect"
  | "clearRect"
  | "createRadialGradient"
  | "beginPath"
  | "arc"
  | "fill"
  | "moveTo"
  | "lineTo"
  | "stroke"
  | "fillStyle"
  | "strokeStyle"
  | "lineWidth"
  | "globalCompositeOperation"
>;

/** What a Canvas2DRenderer needs from its surface. An HTMLCanvasElement satisfies it. */
export interface RenderTarget {
  width: number;
  height: number;
  getContext(kind: "2d"): DrawContext | null;
}

export interface Scene {
  /** Draw one frame at playhead `t` (seconds) into a `width`×`height` logical space. */
  draw(ctx: DrawContext, width: number, height: number, t: number): void;
}

export interface Renderer {
  /** Logical size plus the device-pixel ratio the host chose. */
  resize(width: number, height: number, dpr: number): void;
  setScene(scene: Scene | null): void;
  render(t: number): void;
  dispose(): void;
}

export class Canvas2DRenderer implements Renderer {
  private ctx: DrawContext | null;
  private scene: Scene | null = null;
  private width = 0;
  private height = 0;
  private disposed = false;

  constructor(private readonly target: RenderTarget) {
    this.ctx = target.getContext("2d");
  }

  resize(width: number, height: number, dpr: number): void {
    if (this.disposed) return;
    this.width = width;
    this.height = height;
    this.target.width = width * dpr;
    this.target.height = height * dpr;
    this.ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  setScene(scene: Scene | null): void {
    if (this.disposed) return;
    this.scene = scene;
  }

  render(t: number): void {
    if (this.disposed || !this.ctx || !this.scene) return;
    this.scene.draw(this.ctx, this.width, this.height, t);
  }

  dispose(): void {
    this.disposed = true;
    this.scene = null;
    this.ctx = null;
  }
}
