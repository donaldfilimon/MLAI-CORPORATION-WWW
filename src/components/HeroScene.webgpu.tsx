import { useEffect, useRef } from "react";
import regl from "regl";

// HeroScene.webgpu.tsx - A WebGL2-based hero scene using regl
// This version aims to replicate the original HeroScene effect using WebGL2 via regl.
// It draws multiple rings, a core, and radial lines.

const HeroSceneWebGPU = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
    for (let i = 0; i < LINE_COUNT; i++) {
      const angle = (Math.PI * 2 * i) / LINE_COUNT;
      lineVertices.push(
        Math.cos(angle) * LINE_INNER_RADIUS,
        Math.sin(angle) * LINE_INNER_RADIUS,
        Math.cos(angle) * LINE_OUTER_RADIUS,
        Math.sin(angle) * LINE_OUTER_RADIUS,
      ); // two vec2 points per line
    }

    // Per-draw geometry, supplied to the regl commands via closures (regl
    // evaluates these functions at draw time, so the buffers actually bind).
    let curPos: number[] = [];
    let curCount = 0;
    let curScale = 1;
    let curYOffset = 0;

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
        void main() {
          vec2 pos = position * scale;
          float cosR = cos(rotation);
          float sinR = sin(rotation);
          vec2 rotated = vec2(
            pos.x * cosR - pos.y * sinR + ringYOffset, // Apply ring-specific Y offset
            pos.x * sinR + pos.y * cosR
          );
          gl_Position = projection * view * vec4(rotated, 0.0, 1.0);
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
        projection: () => {
          const projection = new Float32Array(16);
          const aspect =
            reglInstance._gl.canvas.width / reglInstance._gl.canvas.height;
          projection[0] = 2 / (aspect * 2);
          projection[5] = 2 / 2;
          projection[10] = -1;
          projection[15] = 1;
          return projection;
        },
        view: () => {
          const view = new Float32Array(16);
          view[0] = 1;
          view[5] = 1;
          view[10] = 1;
          view[15] = 1;
          return view;
        },
        rotation: ({ tick }) => tick * 0.004,
        scale: () => curScale,
        ringYOffset: () => curYOffset,
        color: () => [0.49, 0.55, 0.96, 0.3], // indigo line, rgba(125,140,245,0.3)
      },
    });

    const drawCore = reglInstance({
      vert: `
        precision mediump float;
        attribute vec2 position;
        uniform mat4 projection;
        uniform mat4 view;
        uniform float rotation;
        void main() {
          vec2 rotated = vec2(
            position.x * cos(rotation) - position.y * sin(rotation),
            position.x * sin(rotation) + position.y * cos(rotation)
          );
          gl_Position = projection * view * vec4(rotated, 0.0, 1.0);
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
        projection: () => {
          const projection = new Float32Array(16);
          const aspect =
            reglInstance._gl.canvas.width / reglInstance._gl.canvas.height;
          projection[0] = 2 / (aspect * 2);
          projection[5] = 2 / 2;
          projection[10] = -1;
          projection[15] = 1;
          return projection;
        },
        view: () => {
          const view = new Float32Array(16);
          view[0] = 1;
          view[5] = 1;
          view[10] = 1;
          view[15] = 1;
          return view;
        },
        rotation: ({ tick }) => tick * 0.004,
        color: () => [0.49, 0.83, 0.99, 0.4], // rgba(94, 234, 212, 0.4) - approximate glow
      },
    });

    const drawLines = reglInstance({
      vert: `
        precision mediump float;
        attribute vec2 position;
        uniform mat4 projection;
        uniform mat4 view;
        uniform float rotation;
        void main() {
          vec2 rotated = vec2(
            position.x * cos(rotation) - position.y * sin(rotation),
            position.x * sin(rotation) + position.y * cos(rotation)
          );
          gl_Position = projection * view * vec4(rotated, 0.0, 1.0);
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
        projection: () => {
          const projection = new Float32Array(16);
          const aspect =
            reglInstance._gl.canvas.width / reglInstance._gl.canvas.height;
          projection[0] = 2 / (aspect * 2);
          projection[5] = 2 / 2;
          projection[10] = -1;
          projection[15] = 1;
          return projection;
        },
        view: () => {
          const view = new Float32Array(16);
          view[0] = 1;
          view[5] = 1;
          view[10] = 1;
          view[15] = 1;
          return view;
        },
        rotation: ({ tick }) => tick * 0.004,
        color: () => [1.0, 1.0, 1.0, 0.22], // rgba(255, 255, 255, 0.22)
      },
    });

    let frame = 0;

    // Main render loop
    reglInstance.frame(() => {
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

      frame += 1;
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
      resizeObserver.disconnect();
      reglInstance.destroy();
    };
  }, []);

  return <canvas ref={canvasRef} className="h-full w-full outline-none" />;
};

export default HeroSceneWebGPU;
