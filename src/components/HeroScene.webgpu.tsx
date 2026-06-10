import { useEffect, useRef, useState } from "react";
import regl from "regl";

// HeroScene.webgpu.tsx - A WebGL2-based hero scene using regl
// Draws multiple rings, a core, and radial lines — plus micro-interactions
// that tell the neural-backtrace story:
//   · pointer parallax — the structure leans toward the cursor
//   · hover brightening — proximity raises line intensity
//   · click → backtrace pulse — sparks travel INWARD along the radial spokes
//     to the core (walking the chain backward), which flashes on arrival.
// All interaction is disabled under prefers-reduced-motion.

const PULSE_DURATION_MS = 1100;
const MAX_PULSES = 4;

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

const HeroSceneWebGPU = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hintVisible, setHintVisible] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Initialize regl (WebGL2 wrapper)
    const reglInstance = regl({
      canvas,
      extensions: ["OES_vertex_array_object"],
      pixelRatio: Math.min(window.devicePixelRatio || 1, 2),
    });

    // Reduced motion check
    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    if (reducedMotionQuery.matches) {
      // For reduced motion, render a simple static version (transparent)
      reglInstance.frame(() => {
        reglInstance.clear({
          color: [0, 0, 0, 0], // Transparent
        });
      });
      return () => {
        reglInstance.destroy();
      };
    }

    // Precompute geometry for rings (as line loops)
    const RING_COUNT = 4;
    const RADIAL_SEGMENTS = 64; // More segments for smoother rings
    // Unit ring geometry (vec2, 2 floats/vertex). Per-ring scale and Y offset
    // are applied once, in the shader, via uniforms — not baked here.
    const ringVertices: number[][] = []; // Array of arrays, each for a ring
    for (let ring = 0; ring < RING_COUNT; ring++) {
      const vertices: number[] = [];
      for (let i = 0; i <= RADIAL_SEGMENTS; i++) {
        const angle = (Math.PI * 2 * i) / RADIAL_SEGMENTS;
        vertices.push(Math.cos(angle), Math.sin(angle) * 0.32); // squashed unit ring
      }
      ringVertices.push(vertices);
    }

    // Precompute geometry for core (as a triangle fan - approximating a circle)
    const CORE_SEGMENTS = 32;
    const coreVertices: number[] = [0, 0]; // Center point (vec2)
    for (let i = 0; i <= CORE_SEGMENTS; i++) {
      const angle = (Math.PI * 2 * i) / CORE_SEGMENTS;
      const radius = 0.36; // contained core radius
      coreVertices.push(Math.cos(angle) * radius, Math.sin(angle) * radius);
    }

    // Precompute geometry for radial lines (as lines from inner to outer radius)
    const LINE_COUNT = 18;
    const LINE_INNER_RADIUS = 0.4 * 0.36; // inner radius of the line
    const LINE_OUTER_RADIUS = 1.0 * 0.36; // outer radius of the line
    const lineVertices: number[] = [];
    const lineAngles: number[] = [];
    for (let i = 0; i < LINE_COUNT; i++) {
      const angle = (Math.PI * 2 * i) / LINE_COUNT;
      lineAngles.push(angle);
      lineVertices.push(
        Math.cos(angle) * LINE_INNER_RADIUS,
        Math.sin(angle) * LINE_INNER_RADIUS,
        Math.cos(angle) * LINE_OUTER_RADIUS,
        Math.sin(angle) * LINE_OUTER_RADIUS,
      ); // two vec2 points per line
    }

    // ── Interaction state ────────────────────────────────────────────────
    // Pointer parallax target (normalized -1..1 from canvas center) and the
    // lerped value the render loop follows.
    let targetX = 0;
    let targetY = 0;
    let px = 0;
    let py = 0;
    let hoverBoost = 0; // 0..1 — raises line/ring intensity near the cursor
    let coreFlash = 0; // spikes when a backtrace pulse reaches the core
    const pulses: number[] = []; // start timestamps (performance.now())

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      targetX = Math.max(-1.4, Math.min(1.4, nx));
      targetY = Math.max(-1.4, Math.min(1.4, ny));
    };
    const onPointerLeave = () => {
      targetX = 0;
      targetY = 0;
    };
    const onPointerDown = () => {
      if (pulses.length < MAX_PULSES) {
        pulses.push(performance.now());
      }
    };

    // Parallax follows the pointer anywhere over the hero; the backtrace
    // pulse fires on the canvas itself.
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointerleave", onPointerLeave);

    // Per-draw geometry, supplied to the regl commands via closures (regl
    // evaluates these functions at draw time, so the buffers actually bind).
    let curPos: number[] = [];
    let curCount = 0;
    let curScale = 1;
    let curYOffset = 0;
    let curPointSize = 6;
    let curPulseAlpha = 0;

    const projectionUniform = () => {
      const projection = new Float32Array(16);
      const aspect =
        reglInstance._gl.canvas.width / reglInstance._gl.canvas.height;
      projection[0] = 2 / (aspect * 2);
      projection[5] = 2 / 2;
      projection[10] = -1;
      projection[15] = 1;
      return projection;
    };
    const viewUniform = () => {
      const view = new Float32Array(16);
      view[0] = 1;
      view[5] = 1;
      view[10] = 1;
      view[15] = 1;
      return view;
    };
    // The whole structure leans gently toward the cursor.
    const offsetUniform = () => [px * 0.05, -py * 0.04] as [number, number];

    // Create regl draw calls for rings, core, and lines
    const drawRing = reglInstance({
      vert: `
        precision mediump float;
        attribute vec2 position;
        uniform mat4 projection;
        uniform mat4 view;
        uniform float rotation;
        uniform float scale;
        uniform float ringYOffset; // Y offset for each ring
        uniform vec2 offset;
        void main() {
          vec2 pos = position * scale;
          float cosR = cos(rotation);
          float sinR = sin(rotation);
          vec2 rotated = vec2(
            pos.x * cosR - pos.y * sinR + ringYOffset, // Apply ring-specific Y offset
            pos.x * sinR + pos.y * cosR
          );
          gl_Position = projection * view * vec4(rotated + offset, 0.0, 1.0);
        }
      `,
      frag: `
        precision mediump float;
        uniform vec4 color;
        void main() {
          gl_FragColor = color;
        }
      `,
      attributes: {
        position: () => curPos, // set per ring in the frame loop
      },
      count: () => curCount,
      primitive: "line loop",
      uniforms: {
        projection: projectionUniform,
        view: viewUniform,
        rotation: ({ tick }) => tick * 0.004,
        scale: () => curScale,
        ringYOffset: () => curYOffset,
        offset: offsetUniform,
        // indigo line; intensity rises with hover proximity + core flash
        color: () => [0.49, 0.55, 0.96, 0.3 * (1 + hoverBoost * 0.7 + coreFlash * 0.5)],
      },
    });

    const drawCore = reglInstance({
      vert: `
        precision mediump float;
        attribute vec2 position;
        uniform mat4 projection;
        uniform mat4 view;
        uniform float rotation;
        uniform vec2 offset;
        void main() {
          vec2 rotated = vec2(
            position.x * cos(rotation) - position.y * sin(rotation),
            position.x * sin(rotation) + position.y * cos(rotation)
          );
          gl_Position = projection * view * vec4(rotated + offset, 0.0, 1.0);
        }
      `,
      frag: `
        precision mediump float;
        uniform vec4 color;
        void main() {
          gl_FragColor = color;
        }
      `,
      attributes: {
        position: () => curPos, // coreVertices, set in the frame loop
      },
      count: () => curCount,
      primitive: "triangle fan",
      uniforms: {
        projection: projectionUniform,
        view: viewUniform,
        rotation: ({ tick }) => tick * 0.004,
        offset: offsetUniform,
        // sky glow; flashes when a backtrace pulse arrives
        color: () => [
          0.49 + coreFlash * 0.3,
          0.83 + coreFlash * 0.12,
          0.99,
          0.4 + coreFlash * 0.45,
        ],
      },
    });

    const drawLines = reglInstance({
      vert: `
        precision mediump float;
        attribute vec2 position;
        uniform mat4 projection;
        uniform mat4 view;
        uniform float rotation;
        uniform vec2 offset;
        void main() {
          vec2 rotated = vec2(
            position.x * cos(rotation) - position.y * sin(rotation),
            position.x * sin(rotation) + position.y * cos(rotation)
          );
          gl_Position = projection * view * vec4(rotated + offset, 0.0, 1.0);
        }
      `,
      frag: `
        precision mediump float;
        uniform vec4 color;
        void main() {
          gl_FragColor = color;
        }
      `,
      attributes: {
        position: () => curPos, // lineVertices, set in the frame loop
      },
      count: () => curCount,
      primitive: "lines",
      uniforms: {
        projection: projectionUniform,
        view: viewUniform,
        rotation: ({ tick }) => tick * 0.004,
        offset: offsetUniform,
        color: () => [1.0, 1.0, 1.0, 0.22 * (1 + hoverBoost)],
      },
    });

    // Backtrace pulse markers — bright points travelling inward along the
    // radial spokes. Same rotation/offset as everything else so they ride
    // the spokes exactly.
    const drawPulses = reglInstance({
      vert: `
        precision mediump float;
        attribute vec2 position;
        uniform mat4 projection;
        uniform mat4 view;
        uniform float rotation;
        uniform vec2 offset;
        uniform float pointSize;
        void main() {
          vec2 rotated = vec2(
            position.x * cos(rotation) - position.y * sin(rotation),
            position.x * sin(rotation) + position.y * cos(rotation)
          );
          gl_Position = projection * view * vec4(rotated + offset, 0.0, 1.0);
          gl_PointSize = pointSize;
        }
      `,
      frag: `
        precision mediump float;
        uniform vec4 color;
        void main() {
          // round point sprite with soft edge
          vec2 d = gl_PointCoord - vec2(0.5);
          float r = length(d);
          if (r > 0.5) discard;
          float soft = smoothstep(0.5, 0.18, r);
          gl_FragColor = vec4(color.rgb, color.a * soft);
        }
      `,
      attributes: {
        position: () => curPos,
      },
      count: () => curCount,
      primitive: "points",
      blend: {
        enable: true,
        func: { src: "src alpha", dst: "one" }, // additive — sparks glow
      },
      depth: { enable: false },
      uniforms: {
        projection: projectionUniform,
        view: viewUniform,
        rotation: ({ tick }) => tick * 0.004,
        offset: offsetUniform,
        pointSize: () => curPointSize,
        color: () => [0.55, 0.85, 1.0, curPulseAlpha], // sky spark
      },
    });

    // Main render loop
    reglInstance.frame(() => {
      // Smooth interaction state toward targets.
      px += (targetX - px) * 0.06;
      py += (targetY - py) * 0.06;
      const dist = Math.min(1, Math.hypot(targetX, targetY));
      hoverBoost += ((1 - dist) * 0.9 - hoverBoost) * 0.08;
      coreFlash *= 0.93;

      // Clear with transparent background
      reglInstance.clear({
        color: [0, 0, 0, 0],
      });

      // Draw rings — set the per-ring geometry/uniform closures, then draw.
      for (let ring = 0; ring < RING_COUNT; ring++) {
        curPos = ringVertices[ring] ?? [];
        curCount = curPos.length / 2; // vec2 → 2 floats per vertex
        curScale = (1 + ring * 0.1) * 0.62;
        curYOffset = ring * 0.1;
        drawRing();
      }

      // Draw core
      curPos = coreVertices;
      curCount = coreVertices.length / 2;
      drawCore();

      // Draw lines
      curPos = lineVertices;
      curCount = lineVertices.length / 2;
      drawLines();

      // Advance + draw backtrace pulses (outer edge → core, eased).
      if (pulses.length > 0) {
        const now = performance.now();
        for (let i = pulses.length - 1; i >= 0; i--) {
          const t = (now - pulses[i]!) / PULSE_DURATION_MS;
          if (t >= 1) {
            pulses.splice(i, 1);
            coreFlash = Math.min(1.2, coreFlash + 0.9); // arrival flash
            continue;
          }
          const eased = easeInOutCubic(t);
          // Start out past the ring band (visible against the dark field)
          // and dive to the core edge — inside the core disc the additive
          // sparks would have no contrast.
          const PULSE_START = 0.78;
          const PULSE_END = LINE_OUTER_RADIUS;
          const radius = PULSE_START - (PULSE_START - PULSE_END) * eased;
          const pts: number[] = [];
          for (let l = 0; l < LINE_COUNT; l++) {
            const angle = lineAngles[l]!;
            pts.push(Math.cos(angle) * radius, Math.sin(angle) * radius);
          }
          curPos = pts;
          curCount = LINE_COUNT;
          curPointSize =
            (5 + 7 * (1 - t)) * Math.min(window.devicePixelRatio || 1, 2);
          curPulseAlpha = 0.85 * (1 - t * t);
          drawPulses();
        }
      }
    });

    // Handle canvas resize
    const resizeObserver = new ResizeObserver(() => {
      if (reglInstance) {
        reglInstance._gl.canvas.width = Math.max(
          1,
          Math.floor(
            canvas.getBoundingClientRect().width *
              Math.min(window.devicePixelRatio || 1, 2),
          ),
        );
        reglInstance._gl.canvas.height = Math.max(
          1,
          Math.floor(
            canvas.getBoundingClientRect().height *
              Math.min(window.devicePixelRatio || 1, 2),
          ),
        );
        reglInstance({});
      }
    });
    resizeObserver.observe(canvas);

    // Cleanup function
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      resizeObserver.disconnect();
      reglInstance.destroy();
    };
  }, []);

  return (
    <div
      className="relative h-full w-full"
      onMouseEnter={() => setHintVisible(true)}
      onMouseLeave={() => setHintVisible(false)}
    >
      <canvas
        ref={canvasRef}
        className="h-full w-full cursor-pointer outline-none"
      />
      <span
        className={`pointer-events-none absolute bottom-10 left-1/2 -translate-x-1/2 rounded-full border border-white/10 bg-black/30 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-text-dim/70 backdrop-blur-sm transition-opacity duration-500 motion-reduce:hidden ${hintVisible ? "opacity-100" : "opacity-0"}`}
      >
        click — trace it back
      </span>
    </div>
  );
};

export default HeroSceneWebGPU;
