/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [speed, setSpeed] = useState(0.2);
  const [lighting, setLighting] = useState(1.0);
  const [zoom, setZoom] = useState(1.69);
  const [yaw, setYaw] = useState(33 * (Math.PI / 180));
  const [pitch, setPitch] = useState(-17 * (Math.PI / 180));
  const [proximity, setProximity] = useState(-1.8);
  const [wind, setWind] = useState(1.0);
  const [colorMode, setColorMode] = useState('cyan');
  const [isPaused, setIsPaused] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'controls' | 'landscape' | 'minimap'>('landscape');

  const colors = {
    cyan: [0.0, 0.8, 1.0],
    orange: [1.0, 0.4, 0.0],
    purple: [0.7, 0.2, 1.0],
    lime: [0.6, 1.0, 0.0]
  };
  const [audioStarted, setAudioStarted] = useState(false);
  const noiseGainRef = useRef<GainNode | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);
  const envFilterRef = useRef<BiquadFilterNode | null>(null);
  const envGainRef = useRef<GainNode | null>(null);
  const movementRef = useRef(0);

  const startAudio = () => {
    if (audioStarted) return;
    
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioContextRef.current = ctx;

    // Resume context (browser security)
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    // 1. Base Drone
    const osc = ctx.createOscillator();
    const droneGain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(40, ctx.currentTime); // Deeper drone
    droneGain.gain.setValueAtTime(0.25, ctx.currentTime);
    osc.connect(droneGain);
    droneGain.connect(ctx.destination);
    osc.start();

    // 2. Reactive Noise (Creature signals)
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(1000, ctx.currentTime);
    noiseFilter.Q.setValueAtTime(10, ctx.currentTime);
    filterRef.current = noiseFilter;

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.05, ctx.currentTime); // Base whisper
    noiseGainRef.current = noiseGain;

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noiseSource.start();

    // 3. Environment Texture (Landscape specific)
    const envSource = ctx.createBufferSource();
    envSource.buffer = noiseBuffer;
    envSource.loop = true;

    const envFilter = ctx.createBiquadFilter();
    envFilter.type = 'lowpass';
    envFilter.frequency.setValueAtTime(200, ctx.currentTime);
    envFilterRef.current = envFilter;

    const envGain = ctx.createGain();
    envGain.gain.setValueAtTime(0.1, ctx.currentTime);
    envGainRef.current = envGain;

    envSource.connect(envFilter);
    envFilter.connect(envGain);
    envGain.connect(ctx.destination);
    envSource.start();

    setAudioStarted(true);
  };

  // Audio modulation loop
  useEffect(() => {
    if (!audioStarted) return;

    let frame: number;
    const updateAudio = () => {
      if (noiseGainRef.current && filterRef.current) {
        const ctx = audioContextRef.current!;
        
        // Decay movement
        movementRef.current *= 0.95;
        
        // Modulate volume based on movement
        const targetGain = 0.05 + movementRef.current * 0.4;
        noiseGainRef.current.gain.setTargetAtTime(targetGain, ctx.currentTime, 0.1);
        
        // Modulate filter frequency (creature "chirps")
        const targetFreq = 500 + movementRef.current * 4000 + Math.sin(Date.now() * 0.005) * 200;
        filterRef.current.frequency.setTargetAtTime(targetFreq, ctx.currentTime, 0.1);
      }
      frame = requestAnimationFrame(updateAudio);
    };
    
    frame = requestAnimationFrame(updateAudio);
    return () => cancelAnimationFrame(frame);
  }, [audioStarted]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl');
    if (!gl) {
      console.error('WebGL not supported');
      return;
    }

    // --- SHADER SOURCES ---
    const vsSource = `
      attribute vec4 aVertexPosition;
      void main() {
        gl_Position = aVertexPosition;
      }
    `;

    const fsSource = `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_rotation;
      uniform vec3 u_color;
      uniform float u_speed;
      uniform float u_lighting;
      uniform float u_zoom;
      uniform float u_depth;
      uniform float u_wind;

      #define MAX_STEPS 192
      #define SURF_DIST 0.0002
      #define MAX_DIST 20.0
      #define ITERATIONS 12
      
      // --- UTILS ---
      float hash(vec3 p) {
        p = fract(p * vec3(123.34, 456.21, 789.18));
        p += dot(p, p.yzx + 19.19);
        return fract((p.x + p.y) * p.z);
      }

      float hash12(vec2 p) {
        vec3 p3  = fract(vec3(p.xyx) * .1031);
        p3 += dot(p3, p3.yzx + 33.33);
        return fract((p3.x + p3.y) * p3.z);
      }

      float noise(vec3 p) {
        vec3 i = floor(p);
        vec3 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(mix(mix(hash(i + vec3(0, 0, 0)), hash(i + vec3(1, 0, 0)), f.x),
                       mix(hash(i + vec3(0, 1, 0)), hash(i + vec3(1, 1, 0)), f.x), f.y),
                   mix(mix(hash(i + vec3(0, 0, 1)), hash(i + vec3(1, 0, 1)), f.x),
                       mix(hash(i + vec3(0, 1, 1)), hash(i + vec3(1, 1, 1)), f.x), f.y), f.z);
      }

      float fbm(vec3 p) {
        float v = 0.0;
        float a = 0.5;
        vec3 shift = vec3(100);
        for (int i = 0; i < 4; ++i) {
          v += a * noise(p);
          p = p * 2.0 + shift;
          a *= 0.5;
        }
        return v;
      }

      mat2 rot(float a) {
        float s = sin(a), c = cos(a);
        return mat2(c, -s, s, c);
      }

      // --- MANDELBULB MATH ---
      float mandelbulb(vec3 p, out float orbit) {
        vec3 z = p;
        float dr = 1.0;
        float r = 0.0;
        orbit = 1e10;
        
        for (int i = 0; i < ITERATIONS; i++) {
          r = length(z);
          if (r > 2.0) break;
          orbit = min(orbit, r);
          float theta = acos(z.z / r);
          float phi = atan(z.y, z.x);
          dr = pow(r, 7.0) * 8.0 * dr + 1.0;
          float zr = pow(r, 8.0);
          theta = theta * 8.0;
          phi = phi * 8.0;
          z = zr * vec3(sin(theta) * cos(phi), sin(phi) * sin(theta), cos(theta));
          z += p;
        }
        return 0.5 * log(r) * r / dr;
      }

      float map(vec3 p, out float orbit) {
        return mandelbulb(p, orbit);
      }

      float mapSimple(vec3 p) {
        float o;
        return mandelbulb(p, o);
      }

      vec3 getNormal(vec3 p) {
        vec2 e = vec2(0.001, 0.0);
        return normalize(vec3(
          mapSimple(p + e.xyy) - mapSimple(p - e.xyy),
          mapSimple(p + e.yxy) - mapSimple(p - e.yxy),
          mapSimple(p + e.yyx) - mapSimple(p - e.yyx)
        ));
      }

      float calcAO(vec3 p, vec3 n) {
        float occ = 0.0;
        float sca = 1.0;
        for (int i = 0; i < 5; i++) {
          float hr = 0.01 + 0.12 * float(i) / 4.0;
          float d = mapSimple(p + n * hr);
          occ += -(d - hr) * sca;
          sca *= 0.95;
        }
        return clamp(1.0 - 3.0 * occ, 0.0, 1.0);
      }

      float softShadow(vec3 ro, vec3 rd, float mint, float tmax) {
        float res = 1.0;
        float t = mint;
        for (int i = 0; i < 24; i++) {
          float h = mapSimple(ro + rd * t);
          res = min(res, 16.0 * h / t);
          t += clamp(h, 0.01, 0.3);
          if (h < 0.001 || t > tmax) break;
        }
        return clamp(res, 0.0, 1.0);
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
        vec2 screenUV = gl_FragCoord.xy / u_resolution.xy;
        
        // Offset UV to move the object to the bottom right
        uv += vec2(-0.25, 0.25);
        
        vec3 ro = vec3(0.0, 0.0, u_depth);
        vec3 rd = normalize(vec3(uv, u_zoom));
        
        float pitch = u_rotation.y;
        float yaw = u_rotation.x;
        ro.yz *= rot(pitch);
        rd.yz *= rot(pitch);
        ro.xz *= rot(yaw);
        rd.xz *= rot(yaw);

        // --- BACKGROUND ---
        // Radial Gradient: Deep Void to Ominous Teal
        float distToCenter = length(screenUV - vec2(0.75, 0.25)); // Centered on planet
        vec3 bgColor = mix(vec3(0.0, 0.05, 0.06), vec3(0.0), smoothstep(0.2, 0.8, distToCenter));
        
        // Parallax Starfield (3 layers)
        float stars = 0.0;
        for(float i=1.0; i<=3.0; i++) {
            vec2 starUV = uv * (i * 150.0);
            starUV += vec2(u_time * 0.02 * i, u_time * 0.01);
            float h = hash12(floor(starUV));
            if(h > 0.995) {
                float m = sin(u_time * 2.0 + h * 6.28) * 0.5 + 0.5;
                stars += pow(h, 10.0) * m * (1.0 / i);
            }
        }
        vec3 color = bgColor + stars * vec3(0.8, 0.9, 1.0);

        // --- RAYMARCHING ---
        float t = 0.0;
        float orbit = 0.0;
        float finalOrbit = 0.0;
        float glow = 0.0;
        float fogDensity = 0.0;
        bool hit = false;
        
        for (int i = 0; i < MAX_STEPS; i++) {
          vec3 p = ro + rd * t;
          float d = map(p, orbit);
          
          // Volumetric Fog Accumulation (Domain Warped)
          if (t < 5.0) {
              float warp = noise(p * 0.5 + u_time * 0.2 * u_wind);
              float n = fbm(p * 1.5 + warp + u_time * 0.4 * u_wind);
              fogDensity += n * exp(-d * 6.0) * 0.025;
          }

          glow += 0.01 / (0.01 + d * d);
          
          if (d < SURF_DIST) {
            hit = true;
            finalOrbit = orbit;
            break;
          }
          if (t > MAX_DIST) break;
          t += d;
        }

        // Cyan Atmospheric Glow (Halo)
        vec3 haloColor = u_color;
        color += haloColor * glow * 0.015;
        
        // Volumetric Fog Color
        color += haloColor * fogDensity * 0.4;

        if (hit) {
          vec3 p = ro + rd * t;
          vec3 n = getNormal(p);
          vec3 lightPos = vec3(2.0, 4.0, -3.0);
          vec3 lightDir = normalize(lightPos - p);
          
          float ao = calcAO(p, n);
          float shadow = softShadow(p, lightDir, 0.02, 2.5);
          
          vec3 boneColor = vec3(0.9, 0.85, 0.8);
          vec3 rootColor = vec3(0.1, 0.1, 0.12);
          vec3 baseColor = mix(rootColor, boneColor, clamp(pow(finalOrbit, 0.4), 0.0, 1.0));
          
          float diff = max(dot(n, lightDir), 0.0);
          
          // Specular Highlights (Enhanced)
          vec3 viewDir = normalize(ro - p);
          vec3 reflectDir = reflect(-lightDir, n);
          float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
          
          color = baseColor * (diff * shadow * u_lighting + 0.05) * ao;
          color += vec3(0.8, 0.9, 1.0) * spec * shadow * 0.4 * u_lighting; // Bright specular
          
          // Cyan rim lighting for the silhouette
          float rim = pow(1.0 - max(dot(n, -rd), 0.0), 3.0);
          color += haloColor * rim * 0.4 * u_lighting;
          
          color += vec3(0.1, 0.3, 0.4) * (1.0 - ao) * 0.2 * u_lighting;
        }

        // --- POST PROCESSING: FLOWING MIST ---
        float mist = 0.0;
        // Layer 1: Faster, larger clouds
        vec3 mpos1 = vec3(uv * 1.5, u_time * 0.1 * u_wind);
        mpos1.x -= u_time * 0.8 * u_wind;
        float m1 = fbm(mpos1);
        mist += smoothstep(0.3, 0.8, m1) * 0.15;
        
        // Layer 2: Slower, smaller details
        vec3 mpos2 = vec3(uv * 3.0, u_time * 0.05 * u_wind);
        mpos2.x -= u_time * 0.4 * u_wind;
        float m2 = fbm(mpos2);
        mist += smoothstep(0.4, 0.9, m2) * 0.1;
        
        // Apply mist color and additive glow
        vec3 mistColor = haloColor * mist;
        color += mistColor;
        
        // Additive glow where mist overlaps the fractal (hit is true)
        if (hit) {
            color += mistColor * 0.5;
        }

        float fogAmount = clamp((t - 1.0) / (MAX_DIST - 1.0), 0.0, 1.0);
        vec3 finalFogColor = vec3(0.01, 0.02, 0.03);
        color = mix(color, finalFogColor, fogAmount);

        color = pow(color, vec3(0.4545));
        gl_FragColor = vec4(color, 1.0);
      }
    `;

    // --- WEBGL SETUP ---
    function createShader(gl: WebGLRenderingContext, type: number, source: string) {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = new Float32Array([-1, 1, 1, 1, -1, -1, 1, -1]);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const positionAttributeLocation = gl.getAttribLocation(program, 'aVertexPosition');
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    const timeLoc = gl.getUniformLocation(program, 'u_time');
    const resLoc = gl.getUniformLocation(program, 'u_resolution');
    const rotationLoc = gl.getUniformLocation(program, 'u_rotation');
    const speedLoc = gl.getUniformLocation(program, 'u_speed');
    const lightLoc = gl.getUniformLocation(program, 'u_lighting');
    const zoomLoc = gl.getUniformLocation(program, 'u_zoom');
    const depthLoc = gl.getUniformLocation(program, 'u_depth');
    const windLoc = gl.getUniformLocation(program, 'u_wind');
    const colorLoc = gl.getUniformLocation(program, 'u_color');

    let isDragging = false;
    let lastMouseX = 0, lastMouseY = 0;

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - lastMouseX;
      const dy = e.clientY - lastMouseY;
      
      const newYaw = ((window as any)._shaderYaw || 0) - dx * 0.01;
      const newPitch = ((window as any)._shaderPitch || 0) + dy * 0.01;
      const clampedPitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, newPitch));
      
      (window as any)._shaderYaw = newYaw;
      (window as any)._shaderPitch = clampedPitch;
      
      // Trigger audio movement
      movementRef.current = Math.min(1.0, movementRef.current + 0.05);
      
      // We don't call setYaw/setPitch here to avoid 60fps React re-renders during drag
      // But we might want to if we want the sliders to move.
      // Let's use a small trick: update state only occasionally or use a ref for the UI to poll?
      // Actually, for "precise control", the user expects the sliders to move.
      // Let's try updating state. If it's too slow, we'll optimize.
      setYaw(newYaw);
      setPitch(clampedPitch);
      
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    window.addEventListener('resize', resize);
    resize();

    let animationFrameId: number;
    let lastTime = 0;

    const render = (time: number) => {
      const deltaTime = time - lastTime;
      lastTime = time;

      gl.uniform1f(timeLoc, time * 0.001);
      gl.uniform2f(resLoc, canvas.width, canvas.height);
      
      // Update rotation if not paused
      if (!(window as any)._shaderPaused) {
        const currentYaw = (window as any)._shaderYaw || 0;
        const currentSpeed = (window as any)._shaderSpeed || 1.0;
        const newYaw = currentYaw + 0.00001 * currentSpeed * deltaTime;
        (window as any)._shaderYaw = newYaw;
        // Sync back to React state so the slider moves
        setYaw(newYaw);
      }

      gl.uniform2f(rotationLoc, (window as any)._shaderYaw || 0, (window as any)._shaderPitch || 0);
      
      const getVal = (key: string, fallback: number) => {
        const val = (window as any)[key];
        return typeof val === 'number' ? val : fallback;
      };

      gl.uniform1f(speedLoc, getVal('_shaderSpeed', 1.0));
      gl.uniform1f(lightLoc, getVal('_shaderLighting', 1.0));
      gl.uniform1f(zoomLoc, getVal('_shaderZoom', 1.2));
      gl.uniform1f(depthLoc, getVal('_shaderDepth', -1.8));
      gl.uniform1f(windLoc, getVal('_shaderWind', 1.0));
      const c = (window as any)._shaderColor || [0.0, 0.8, 1.0];
      gl.uniform3f(colorLoc, c[0], c[1], c[2]);

      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const applyLandscape = (landscape: any) => {
    const settings = landscape.settings;
    if (settings.speed !== undefined) setSpeed(settings.speed);
    if (settings.lighting !== undefined) setLighting(settings.lighting);
    if (settings.zoom !== undefined) setZoom(settings.zoom);
    if (settings.yaw !== undefined) setYaw(settings.yaw);
    if (settings.pitch !== undefined) setPitch(settings.pitch);
    if (settings.proximity !== undefined) setProximity(settings.proximity);
    if (settings.wind !== undefined) setWind(settings.wind);
    if (settings.isPaused !== undefined) setIsPaused(settings.isPaused);
    if (settings.colorMode !== undefined) setColorMode(settings.colorMode);
    setIsCollapsed(true);
    
    // Update Environment Audio
    if (audioContextRef.current && envFilterRef.current && envGainRef.current && landscape.audio) {
      const ctx = audioContextRef.current;
      const audio = landscape.audio;
      envFilterRef.current.type = audio.type as BiquadFilterType;
      envFilterRef.current.frequency.setTargetAtTime(audio.freq, ctx.currentTime, 0.5);
      envFilterRef.current.Q.setTargetAtTime(audio.q, ctx.currentTime, 0.5);
      envGainRef.current.gain.setTargetAtTime(audio.gain, ctx.currentTime, 0.5);
    }

    // Trigger audio movement
    movementRef.current = 1.0;
  };

  const landscapes = [
    {
      id: 'cave',
      name: 'The Cave',
      image: 'https://lh3.googleusercontent.com/pw/AP1GczMdSHG7AfLrUH_b3sLjtG340ZEp3eywkEuo5n7zrFw-TfA0ZwJBk7Ry0z9yWoGSW9leVAtzxqOrrBbxa_VPAh46gowm9Cop5uqMyGl0LR4JnrVHqfO7-ssNRjbpI8uy_hj0md_X8tI8K5C1eF6XJBL5=w2606-h1416-s-no-gm?authuser=0',
      settings: {
        speed: 0.2,
        lighting: 1.0,
        zoom: 2.02,
        yaw: -79 * (Math.PI / 180),
        pitch: -27 * (Math.PI / 180),
        proximity: -0.78,
        wind: 0,
        isPaused: false,
        colorMode: 'lime'
      },
      audio: {
        freq: 150,
        q: 8,
        type: 'lowpass',
        gain: 0.2
      }
    },
    {
      id: 'peak',
      name: 'The Peak',
      image: 'https://lh3.googleusercontent.com/pw/AP1GczO4s-8i-WwoohnEi6cV3q_g5g8Y0kqm6XJSBL51Pitm5HCtRk4ywtjVn0HfhCRA3ehY9j1MN7AaElD4Lw7EsXx3r1mPaznRSu5K9LXsGstebQVBKONjxdqPVsBlnjyJO1wsyfSk8p2hF2FvqKBKUjNd=w2192-h1480-s-no-gm?authuser=0',
      settings: {
        speed: 0.1,
        lighting: 0.59,
        zoom: 2.09,
        proximity: -2.2,
        wind: 1.86,
        yaw: 19 * (Math.PI / 180),
        pitch: -14 * (Math.PI / 180),
        isPaused: true,
        colorMode: 'cyan'
      },
      audio: {
        freq: 400,
        q: 0.5,
        type: 'bandpass',
        gain: 0.25
      }
    },
    {
      id: 'void',
      name: 'The Void',
      image: 'https://lh3.googleusercontent.com/pw/AP1GczODtYaSgO3R8EPfEfgpsmGlugQJoXtx-AYNAo9mAJHW9Gc9lJ8h6NR3joe7491Qk5rdmdblFTtJLp657-w9V0R2wCBcZ0MEvtLXk23C2puJtXzuMF6mCPcscvOayF1vBSzJZ039_z6xlNyk1cYo1AmX=w2146-h1320-s-no-gm?authuser=0',
      settings: {
        speed: 0.30,
        lighting: 1.43,
        zoom: 2.98,
        proximity: -1.85,
        wind: 0.00,
        yaw: -189 * (Math.PI / 180),
        pitch: -5 * (Math.PI / 180),
        isPaused: false,
        colorMode: 'purple'
      },
      audio: {
        freq: 800,
        q: 15,
        type: 'bandpass',
        gain: 0.18
      }
    },
    {
      id: 'fauna',
      name: 'The Fauna',
      image: 'https://lh3.googleusercontent.com/pw/AP1GczMBmxjrTBIebX8DF9LfMixa96_mmrTIQHKeWBlHk-EhqL4e1qPnMerboxyhTpD1uT9hYhdKFQ7ujQpoMRwjOmjX6Yqes7K8XR_n_mC3dfq_AoOwx3DIH49PYvgGUEu9oLyuEMqBX1ii_KwhJG58MLrS=w2628-h1658-s-no-gm?authuser=0',
      settings: {
        speed: 0.44,
        lighting: 1.46,
        zoom: 2.98,
        yaw: -185 * (Math.PI / 180),
        pitch: 79 * (Math.PI / 180),
        proximity: -1.06,
        wind: 0.12,
        isPaused: false,
        colorMode: 'orange'
      },
      audio: {
        freq: 1200,
        q: 4,
        type: 'lowpass',
        gain: 0.15
      }
    },
    {
      id: 'crystals',
      name: 'The Crystals',
      image: 'https://lh3.googleusercontent.com/pw/AP1GczN_BNuBAP4RA4smaqfbvvuuspP9IzqBqqX7VZqtGnXvah1zdksPKyA3wN-QC8MGVdiGxx6jgF_ov322Xr8BVzSShL9PTCDsFmhLhqW31T2IWZtSK1xoTzDGzq012f_1LWWG1cVOkyqu15jpsTH--KE2=w2710-h1678-s-no-gm?authuser=0',
      settings: {
        speed: 0.20,
        lighting: 1.26,
        zoom: 1.20,
        yaw: 315 * (Math.PI / 180),
        pitch: 19 * (Math.PI / 180),
        proximity: -1.07,
        wind: 0.00,
        isPaused: false,
        colorMode: 'cyan'
      },
      audio: {
        freq: 600,
        q: 2,
        type: 'bandpass',
        gain: 0.15
      }
    }
  ];

  // Sync state to window for the render loop to pick up
  useEffect(() => {
    (window as any)._shaderSpeed = speed;
    (window as any)._shaderLighting = lighting;
    (window as any)._shaderZoom = zoom;
    (window as any)._shaderYaw = yaw;
    (window as any)._shaderPitch = pitch;
    (window as any)._shaderPaused = isPaused;
    (window as any)._shaderDepth = proximity;
    (window as any)._shaderWind = wind;
    (window as any)._shaderColor = (colors as any)[colorMode];
  }, [speed, lighting, zoom, yaw, pitch, isPaused, proximity, wind, colorMode]);

  return (
    <div className="fixed inset-0 bg-bg overflow-hidden selection:bg-accent selection:text-white">
      <div className="grain-overlay" />
      <div className="scanlines" />
      <div className="fixed inset-0 bg-grid pointer-events-none opacity-20" />
      
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* System Status Bar */}
      <div className="fixed top-0 left-0 right-0 z-[60] h-10 flex items-center justify-between px-6 border-b border-white/10 bg-black/60 backdrop-blur-md pointer-events-none">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse block" />
              <span className="absolute inset-0 w-2 h-2 rounded-full bg-accent animate-ping opacity-40" />
            </div>
            <span className="technical-label text-accent font-bold tracking-[0.3em]">System_Online</span>
          </div>
          <div className="hidden lg:flex items-center gap-8">
            <div className="flex flex-col">
              <span className="technical-label text-text-dim/40 leading-none">Node_Identifier</span>
              <span className="technical-value text-white">WDBX-US-W2-092</span>
            </div>
            <div className="flex flex-col">
              <span className="technical-label text-text-dim/40 leading-none">Network_Latency</span>
              <span className="technical-value text-white">0.82ms</span>
            </div>
            <div className="flex flex-col">
              <span className="technical-label text-text-dim/40 leading-none">Packet_Loss</span>
              <span className="technical-value text-white">0.00%</span>
            </div>
            <div className="flex items-end gap-[2px] h-4 pb-[2px]">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <motion.div 
                  key={i}
                  animate={{ height: [`${Math.random() * 40 + 20}%`, `${Math.random() * 60 + 40}%`, `${Math.random() * 40 + 20}%`] }}
                  transition={{ duration: 0.5 + Math.random(), repeat: Infinity }}
                  className="w-[2px] bg-accent/40"
                />
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-8">
          <div className="hidden lg:flex items-center gap-8">
            <div className="flex flex-col items-end">
              <span className="technical-label text-text-dim/40 leading-none">Uptime_Metric</span>
              <span className="technical-value text-white">99.999%</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="technical-label text-text-dim/40 leading-none">Encryption</span>
              <span className="technical-value text-white">AES-256-GCM</span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="technical-label text-text-dim/40 leading-none">Active_Persona</span>
            <span className="technical-value text-accent-light uppercase">AUTO_MODULATION</span>
          </div>
        </div>
      </div>
      
      {/* Entry Lobby Overlay */}
      <AnimatePresence>
        {!audioStarted && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="absolute inset-0 z-[100] flex items-center justify-center p-6 bg-bg/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
            >
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent-light text-[10px] font-bold tracking-[0.2em] uppercase">
                    <span className="w-1 h-1 rounded-full bg-accent animate-pulse" />
                    MLAI Corporation • WDBX Engine v3.1
                  </div>
                  <h1 className="text-white font-display text-5xl md:text-7xl leading-[0.85] tracking-tight relative group">
                    <span className="relative z-10">Abbey-Aviva-Abi <br/><span className="italic text-gradient">Multi-Persona AI</span></span>
                    <span className="absolute inset-0 text-accent opacity-0 group-hover:opacity-20 group-hover:translate-x-1 transition-all duration-75 pointer-events-none">Abbey-Aviva-Abi <br/>Multi-Persona AI</span>
                    <span className="absolute inset-0 text-cyan-400 opacity-0 group-hover:opacity-20 group-hover:-translate-x-1 transition-all duration-75 pointer-events-none">Abbey-Aviva-Abi <br/>Multi-Persona AI</span>
                  </h1>
                </div>

                <p className="text-text-secondary text-lg leading-relaxed max-w-md font-light">
                  A pioneering approach in AI system design, integrating specialized personas to balance ethical governance with advanced computational capabilities. Powered by the Weighted Directed Backtrace Neural Network (WDBX).
                </p>

                <div className="flex flex-wrap gap-4 pt-4">
                  <button 
                    onClick={startAudio}
                    className="px-8 py-4 bg-accent text-white font-mono text-[11px] uppercase tracking-[0.3em] border border-accent/40 hover:bg-accent/80 transition-all active:scale-95 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                  >
                    [ Initialize_Sequence ]
                  </button>
                  <a 
                    href="https://github.com/donaldfilimon" 
                    target="_blank" 
                    className="px-8 py-4 border border-white/10 text-white font-mono text-[11px] uppercase tracking-[0.3em] hover:bg-white/5 transition-all"
                  >
                    [ View_Source ]
                  </a>
                </div>

                <div className="pt-8 border-t border-line flex gap-12">
                  <div>
                    <div className="text-3xl font-display text-white">03</div>
                    <div className="technical-label mt-1">Active Personas</div>
                  </div>
                  <div>
                    <div className="text-3xl font-display text-white">10k</div>
                    <div className="technical-label mt-1">Req/Sec Throughput</div>
                  </div>
                  <div>
                    <div className="text-3xl font-display text-white">95%</div>
                    <div className="technical-label mt-1">Response Accuracy</div>
                  </div>
                </div>
              </div>

              <div className="hidden md:block relative aspect-square">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-transparent rounded-3xl blur-3xl" />
                <div className="relative h-full w-full rounded-3xl border border-white/10 overflow-hidden glass-card">
                  <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:40px_40px]" />
                  <div className="p-8 space-y-6">
                    <div className="flex justify-between items-center">
                      <div className="text-[10px] font-mono text-accent-light tracking-widest uppercase">System_Status</div>
                      <div className="text-[10px] font-mono text-text-dim uppercase">v3.1.0-stable</div>
                    </div>
                    <div className="space-y-4">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.random() * 60 + 30}%` }}
                            transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse', delay: i * 0.2 }}
                            className="h-full bg-accent/40"
                          />
                        </div>
                      ))}
                    </div>
                    <div className="pt-4 font-mono text-[10px] text-text-dim leading-relaxed">
                      &gt; Initializing WDBX_ENGINE...<br/>
                      &gt; Loading Persona: ABBEY (Ethical)...<br/>
                      &gt; Loading Persona: AVIVA (Research)...<br/>
                      &gt; Loading Persona: ABI (Regulatory)...<br/>
                      &gt; MULTI-PERSONA FRAMEWORK READY
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* UI Panel */}
      <div className={`fixed z-50 ${isCollapsed ? 'top-6 right-6' : 'inset-0 md:top-6 md:right-6 md:inset-auto'}`}>
        <AnimatePresence>
          {audioStarted && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="w-full h-full flex flex-col items-end justify-start"
            >
              {isCollapsed ? (
                <motion.button 
                  key="collapsed"
                  layoutId="system-panel"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  onClick={() => setIsCollapsed(false)}
                  className="w-10 h-10 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center hover:bg-white/10 transition-all shadow-2xl group"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-white/40 group-hover:bg-white/80 transition-colors" />
                </motion.button>
              ) : (
                  <motion.div 
                    key="expanded"
                    layoutId="system-panel"
                    transition={{ 
                      type: 'spring', 
                      damping: 25, 
                      stiffness: 200
                    }}
                    className="w-full h-full md:w-[320px] md:h-auto technical-panel md:rounded-none overflow-hidden flex flex-col border-white/20"
                  >
                    <div className="scanning-bar" />
                    {/* Corner Accents */}
                    <div className="corner-accent top-0 left-0 border-t-2 border-l-2" />
                    <div className="corner-accent top-0 right-0 border-t-2 border-r-2" />
                    <div className="corner-accent bottom-0 left-0 border-b-2 border-l-2" />
                    <div className="corner-accent bottom-0 right-0 border-b-2 border-r-2" />

                    {/* Header / Toggle */}
                    <div className="border-b border-white/10 bg-white/5">
                      <button 
                        onClick={() => setIsCollapsed(true)}
                        className="w-full flex items-center justify-between p-4 hover:bg-white/10 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                          <h2 className="technical-label text-white">WDBX_Engine_Terminal_v3.1</h2>
                        </div>
                        <span className="technical-value opacity-30 group-hover:opacity-100 transition-opacity">
                          [ ESC ]
                        </span>
                      </button>

                      <div className="flex px-4 pt-2 gap-6">
                        <button 
                          onClick={() => setActiveTab('landscape')}
                          className={`technical-label pb-3 -mb-[1px] border-b transition-all ${activeTab === 'landscape' ? 'text-white border-white' : 'text-text-dim border-transparent hover:text-text-secondary'}`}
                        >
                          Landscape
                        </button>
                        <button 
                          onClick={() => setActiveTab('controls')}
                          className={`technical-label pb-3 -mb-[1px] border-b transition-all ${activeTab === 'controls' ? 'text-white border-white' : 'text-text-dim border-transparent hover:text-text-secondary'}`}
                        >
                          Controls
                        </button>
                        <button 
                          onClick={() => setActiveTab('minimap')}
                          className={`technical-label pb-3 -mb-[1px] border-b transition-all ${activeTab === 'minimap' ? 'text-white border-white' : 'text-text-dim border-transparent hover:text-text-secondary'}`}
                        >
                          Minimap
                        </button>
                      </div>
                    </div>
                    
                    <div className="px-6 pb-6 space-y-6 flex-1 md:max-h-[600px] overflow-y-auto">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={activeTab}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                        >
                          {activeTab === 'controls' && (
                            <div className="space-y-6 pt-6">
                              {/* Pause Toggle */}
                              <div className="flex items-center justify-between">
                                <span className="technical-label">Auto-Rotation</span>
                                <button 
                                  onClick={() => setIsPaused(!isPaused)}
                                  className={`px-3 py-1 rounded-md technical-label transition-all ${isPaused ? 'bg-white/5 text-text-dim border border-white/5' : 'bg-accent/20 text-accent-light border border-accent/40'}`}
                                >
                                  {isPaused ? 'Paused' : 'Active'}
                                </button>
                              </div>

                              {/* Speed Control */}
                              <div className="space-y-3">
                                <div className="flex justify-between">
                                  <span className="technical-label">Temporal Speed</span>
                                  <span className="technical-value">{speed.toFixed(2)}x</span>
                                </div>
                                <input 
                                  type="range" min="0" max="2" step="0.01" value={speed}
                                  onChange={(e) => setSpeed(parseFloat(e.target.value))}
                                  className="w-full"
                                />
                              </div>

                              {/* Lighting Control */}
                              <div className="space-y-3">
                                <div className="flex justify-between">
                                  <span className="technical-label">Luminance</span>
                                  <span className="technical-value">{lighting.toFixed(2)}x</span>
                                </div>
                                <input 
                                  type="range" min="0" max="2" step="0.01" value={lighting}
                                  onChange={(e) => setLighting(parseFloat(e.target.value))}
                                  className="w-full"
                                />
                              </div>

                              {/* Zoom Control */}
                              <div className="space-y-3">
                                <div className="flex justify-between">
                                  <span className="technical-label">Focal Zoom</span>
                                  <span className="technical-value">{zoom.toFixed(2)}</span>
                                </div>
                                <input 
                                  type="range" min="1.2" max="3" step="0.01" value={zoom}
                                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                                  className="w-full"
                                />
                              </div>

                              {/* Proximity Control */}
                              <div className="space-y-3">
                                <div className="flex justify-between">
                                  <span className="technical-label">Proximity</span>
                                  <span className="technical-value">{proximity.toFixed(2)}</span>
                                </div>
                                <input 
                                  type="range" min="-2.5" max="0.5" step="0.01" value={proximity}
                                  onChange={(e) => setProximity(parseFloat(e.target.value))}
                                  className="w-full"
                                />
                              </div>

                              {/* Wind Control */}
                              <div className="space-y-3">
                                <div className="flex justify-between">
                                  <span className="technical-label">Wind Intensity</span>
                                  <span className="technical-value">{wind.toFixed(2)}x</span>
                                </div>
                                <input 
                                  type="range" min="0" max="5" step="0.01" value={wind}
                                  onChange={(e) => setWind(parseFloat(e.target.value))}
                                  className="w-full"
                                />
                              </div>

                              {/* Yaw Control */}
                              <div className="space-y-3">
                                <div className="flex justify-between">
                                  <span className="technical-label">Horizontal Axis</span>
                                  <span className="technical-value">{(yaw * (180/Math.PI)).toFixed(0)}°</span>
                                </div>
                                <input 
                                  type="range" min={-Math.PI} max={Math.PI} step="0.01" value={yaw}
                                  onChange={(e) => setYaw(parseFloat(e.target.value))}
                                  className="w-full"
                                />
                              </div>

                              {/* Pitch Control */}
                              <div className="space-y-3">
                                <div className="flex justify-between">
                                  <span className="technical-label">Vertical Axis</span>
                                  <span className="technical-value">{(pitch * (180/Math.PI)).toFixed(0)}°</span>
                                </div>
                                <input 
                                  type="range" min={-Math.PI/2} max={Math.PI/2} step="0.01" value={pitch}
                                  onChange={(e) => setPitch(parseFloat(e.target.value))}
                                  className="w-full"
                                />
                              </div>

                              {/* Color Mode Control */}
                              <div className="space-y-3">
                                <span className="technical-label">Atmospheric Hue</span>
                                <div className="grid grid-cols-4 gap-2">
                                  {Object.keys(colors).map((mode) => (
                                    <button
                                      key={mode}
                                      onClick={() => setColorMode(mode)}
                                      className={`h-8 rounded-md border transition-all ${
                                        colorMode === mode 
                                          ? 'border-accent ring-1 ring-accent/20' 
                                          : 'border-white/5 hover:border-white/20'
                                      }`}
                                      style={{ 
                                        backgroundColor: `rgb(${(colors as any)[mode][0]*255}, ${(colors as any)[mode][1]*255}, ${(colors as any)[mode][2]*255}, 0.2)` 
                                      }}
                                      title={mode}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                          {activeTab === 'landscape' && (
                            <div className="grid grid-cols-1 gap-4 pt-6">
                              {landscapes.map((landscape) => (
                                <button
                                  key={landscape.id}
                                  onClick={() => applyLandscape(landscape)}
                                  className="w-full text-left group"
                                >
                                  <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden border border-white/5 bg-white/5 card-hover">
                                    <img 
                                      src={landscape.image} 
                                      alt={landscape.name}
                                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                                      referrerPolicy="no-referrer"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-bg/80 to-transparent opacity-60 group-hover:opacity-20 transition-opacity duration-500" />
                                    <div className="absolute bottom-3 left-3">
                                      <span className="technical-label text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        Load_Sequence
                                      </span>
                                    </div>
                                  </div>
                                  <h3 className="technical-label mt-3 group-hover:text-accent-light transition-colors text-center">
                                    {landscape.name}
                                  </h3>
                                </button>
                              ))}
                            </div>
                          )}

                          {activeTab === 'minimap' && (
                            <div className="pt-6 space-y-8">
                              <div className="relative aspect-square w-full bg-white/[0.02] rounded-2xl border border-white/5 flex items-center justify-center overflow-hidden">
                                {/* Radar Scanning Line */}
                                <motion.div 
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                  className="absolute inset-0 bg-gradient-to-r from-accent/20 to-transparent origin-center pointer-events-none"
                                  style={{ clipPath: 'polygon(50% 50%, 100% 0, 100% 100%)' }}
                                />
                                
                                {/* Grid Background */}
                                <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
                                
                                {/* Concentric Rings */}
                                {[1, 2, 3].map((i) => (
                                  <div key={i} className="absolute rounded-full border border-white/5" style={{ width: `${i * 33}%`, height: `${i * 33}%` }} />
                                ))}
                                
                                {/* The Sphere Visualization */}
                                <div className="relative w-48 h-48">
                                  {/* Core Sphere */}
                                  <div className="absolute inset-0 rounded-full border border-white/10 bg-white/[0.02] shadow-[inset_0_0_40px_rgba(255,255,255,0.02)]" />
                                  
                                  {/* Orbital Rings */}
                                  <div className="absolute inset-0 rounded-full border border-white/5 scale-90 rotate-45" />
                                  <div className="absolute inset-0 rounded-full border border-white/5 scale-90 -rotate-45" />
                                  
                                  {/* User Position Dot */}
                                  {(() => {
                                    const r = 96; // Radius of the visualization sphere
                                    
                                    // Initial position (0, 0, -1)
                                    let x = 0;
                                    let y = 0;
                                    let z = -1;
                                    
                                    // Pitch rotation (YZ plane)
                                    const cosP = Math.cos(pitch);
                                    const sinP = Math.sin(pitch);
                                    const py = y * cosP - z * sinP;
                                    const pz = y * sinP + z * cosP;
                                    y = py;
                                    z = pz;
                                    
                                    // Yaw rotation (XZ plane)
                                    const cosY = Math.cos(yaw);
                                    const sinY = Math.sin(yaw);
                                    const yx = x * cosY - z * sinY;
                                    const yz = x * sinY + z * cosY;
                                    x = yx;
                                    z = yz;
                                    
                                    // Project to 2D (simple orthographic for the minimap look)
                                    const screenX = 96 + x * r;
                                    const screenY = 96 + y * r;
                                    const opacity = z > 0 ? 1 : 0.2; // Dim if behind the sphere
                                    const scale = 1 + z * 0.4; // Scale based on depth
                                    
                                    return (
                                      <div 
                                        className="absolute w-2.5 h-2.5 bg-accent rounded-full shadow-[0_0_20px_rgba(59,130,246,0.8)] transition-all duration-100"
                                        style={{ 
                                          left: `${screenX}px`, 
                                          top: `${screenY}px`,
                                          transform: `translate(-50%, -50%) scale(${scale})`,
                                          opacity: opacity,
                                          zIndex: z > 0 ? 10 : 0
                                        }}
                                      />
                                    );
                                  })()}

                                  {/* Center Point */}
                                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-white/40 rounded-full blur-[1px]" />
                                </div>
                              </div>

                              <div className="space-y-4">
                                <div className="flex justify-between">
                                  <span className="technical-label">Vector_Coordinates</span>
                                  <span className="technical-label text-accent-light">Live_Feed</span>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5">
                                    <span className="technical-label text-text-dim/50 block mb-1">AZIMUTH</span>
                                    <span className="technical-value">{(yaw * (180/Math.PI)).toFixed(1)}°</span>
                                  </div>
                                  <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5">
                                    <span className="technical-label text-text-dim/50 block mb-1">ELEVATION</span>
                                    <span className="technical-value">{(pitch * (180/Math.PI)).toFixed(1)}°</span>
                                  </div>
                                  <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5">
                                    <span className="technical-label text-text-dim/50 block mb-1">PROXIMITY</span>
                                    <span className="technical-value">{Math.abs(proximity).toFixed(2)}u</span>
                                  </div>
                                  <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5">
                                    <span className="technical-label text-text-dim/50 block mb-1">MAGNIFICATION</span>
                                    <span className="technical-value">{zoom.toFixed(2)}x</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {/* System Logs (Bottom Left) */}
      <div className="fixed bottom-12 left-6 z-50 pointer-events-none hidden md:block">
        <div className="technical-panel p-4 w-64 space-y-3 bg-black/80 border-white/10">
          <div className="scanning-bar" />
          <div className="corner-accent top-0 left-0 border-t border-l border-white/40" />
          <div className="corner-accent bottom-0 right-0 border-b border-r border-white/40" />
          
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <span className="technical-label text-accent">Kernel_Logs</span>
            <span className="technical-label opacity-30">Live</span>
          </div>
          <div className="space-y-1 font-mono text-[9px] leading-tight">
            <div className="text-text-dim">&gt; [18:56:38] WDBX_ENGINE_START</div>
            <div className="text-text-dim">&gt; [18:56:39] MODULATION_LAYER_SYNC</div>
            <div className="text-text-dim">&gt; [18:56:40] ABBEY_AVIVA_ABI_ONLINE</div>
            <motion.div 
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-accent-light"
            >
              &gt; [18:56:41] AWAITING_USER_INPUT...
            </motion.div>
          </div>
        </div>
      </div>

      {/* Global Footer */}
      <div className="fixed bottom-0 left-0 right-0 z-[60] h-8 flex items-center justify-between px-6 border-t border-white/5 bg-black/40 backdrop-blur-md pointer-events-none">
        <div className="flex items-center gap-6">
          <span className="technical-label text-text-dim/40">© 2026 MLAI CORPORATION / MLAI FOUNDATION</span>
          <div className="hidden md:flex items-center gap-4">
            <span className="technical-label text-text-dim/40 hover:text-white cursor-pointer pointer-events-auto transition-colors">Terms_of_Service</span>
            <span className="technical-label text-text-dim/40 hover:text-white cursor-pointer pointer-events-auto transition-colors">Privacy_Protocol</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="technical-label text-text-dim/40">Status:</span>
              <span className="technical-value text-emerald-500">OPTIMAL</span>
            </div>
            <div className="w-[1px] h-3 bg-white/10" />
            <div className="flex items-center gap-2">
              <span className="technical-label text-text-dim/40">Region:</span>
              <span className="technical-value">GLOBAL_EDGE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
