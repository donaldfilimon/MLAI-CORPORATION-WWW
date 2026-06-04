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
    const ringVertices: number[][] = []; // Array of arrays, each for a ring
    for (let ring = 0; ring < RING_COUNT; ring++) {
      const scale = 1 + ring * 0.1; // Matches original: scale increases per ring
      const vertices: number[] = [];
      for (let i = 0; i <= RADIAL_SEGMENTS; i++) {
        const angle = (Math.PI * 2 * i) / RADIAL_SEGMENTS;
        vertices.push(
          Math.cos(angle) * scale,
          Math.sin(angle) * scale * 0.32 + ring * 0.1, // Note: original had y offset per ring
          0,
        );
      }
      ringVertices.push(vertices);
    }

    // Precompute geometry for core (as a triangle fan - approximating a circle)
    const CORE_SEGMENTS = 32;
    const coreVertices: number[] = [0, 0, 0]; // Center point
    for (let i = 0; i <= CORE_SEGMENTS; i++) {
      const angle = (Math.PI * 2 * i) / CORE_SEGMENTS;
      const radius = 0.58; // Matches original core radius
      coreVertices.push(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
    }

    // Precompute geometry for radial lines (as lines from inner to outer radius)
    const LINE_COUNT = 18;
    const LINE_INNER_RADIUS = 0.4 * 0.58; // Match original: inner radius of the line
    const LINE_OUTER_RADIUS = 1.0 * 0.58; // Match original: outer radius of the line
    const lineVertices: number[] = [];
    for (let i = 0; i < LINE_COUNT; i++) {
      const angle = (Math.PI * 2 * i) / LINE_COUNT;
      const x1 = Math.cos(angle) * LINE_INNER_RADIUS;
      const y1 = Math.sin(angle) * LINE_INNER_RADIUS;
      const x2 = Math.cos(angle) * LINE_OUTER_RADIUS;
      const y2 = Math.sin(angle) * LINE_OUTER_RADIUS;
      lineVertices.push(x1, y1, 0, x2, y2, 0); // Two points per line
    }

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
        position: [], // Will be set dynamically per ring
      },
      count: RADIAL_SEGMENTS + 1, // +1 to close the loop
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
        scale: 1.0, // Will be set per ring in the attributes
        ringYOffset: 0.0, // Will be set per ring
        color: () => [0.49, 0.83, 0.99, 0.28], // rgba(125, 211, 252, 0.28)
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
        position: [], // Will be set to coreVertices
      },
      count: CORE_SEGMENTS + 2, // Center point + perimeter points
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
        color: () => [0.49, 0.83, 0.99, 0.4], // rgba(125, 211, 252, 0.4) - approximate glow
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
        position: [], // Will be set to lineVertices
      },
      count: LINE_COUNT * 2, // Two points per line
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

      // Draw rings
      for (let ring = 0; ring < RING_COUNT; ring++) {
        drawRing({
          // Update the attributes for this ring
          attributes: {
            position: ringVertices[ring],
          },
          // Update uniforms that change per ring
          uniforms: {
            ringYOffset: ring * 0.1, // Match original y offset per ring
            scale: 1 + ring * 0.1, // Match original scale per ring
          },
        });
      }

      // Draw core
      drawCore({
        attributes: {
          position: coreVertices,
        },
      });

      // Draw lines
      drawLines({
        attributes: {
          position: lineVertices,
        },
      });

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
