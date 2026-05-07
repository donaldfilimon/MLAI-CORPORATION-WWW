/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "./lib/utils";
import { PERSONAS, PersonaType } from "./constants/personas";
import { Tooltip } from "./components/Tooltip";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { useAutoSave } from "./lib/useAutoSave";
import { InquiryForm } from "./components/InquiryForm";
import { BrandTab } from "./components/tabs/BrandTab";
import { FrameworkTab } from "./components/tabs/FrameworkTab";
import { BenchmarksTab } from "./components/tabs/BenchmarksTab";
import { AbbeyTab } from "./components/tabs/AbbeyTab";
import { PortfolioTab } from "./components/tabs/PortfolioTab";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

import {
  Maximize2,
  Minimize2,
  Settings2,
  Play,
  Pause,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Database,
  Cpu,
  Activity,
  Eye,
  Book,
  Share2,
  Zap,
  Volume2,
  VolumeX,
  ArrowUpRight,
  Info,
  Globe,
  ShieldAlert,
  Network,
  Layers,
  Terminal,
  Shield,
  FlaskConical,
  Scale,
  AlertCircle,
} from "lucide-react";

const PERSONA_ICONS: Record<string, React.ElementType> = {
  ABBEY: Shield,
  AVIVA: FlaskConical,
  ABI: Scale,
};

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [audioStarted, setAudioStarted] = useState(false);
  const noiseGainRef = useRef<GainNode | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);
  const envFilterRef = useRef<BiquadFilterNode | null>(null);
  const envGainRef = useRef<GainNode | null>(null);
  const movementRef = useRef(0);
  const framesRef = useRef(0);
  const lastTimeRef = useRef(performance.now());

  // Load initial settings from localStorage once
  useEffect(() => {
    const saved = localStorage.getItem('mlai-settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.speed !== undefined) setSpeed(parsed.speed);
      if (parsed.lighting !== undefined) setLighting(parsed.lighting);
      if (parsed.zoom !== undefined) setZoom(parsed.zoom);
      if (parsed.yaw !== undefined) setYaw(parsed.yaw);
      if (parsed.pitch !== undefined) setPitch(parsed.pitch);
      if (parsed.proximity !== undefined) setProximity(parsed.proximity);
      if (parsed.wind !== undefined) setWind(parsed.wind);
      if (parsed.colorMode !== undefined) setColorMode(parsed.colorMode);
      if (parsed.isPaused !== undefined) setIsPaused(parsed.isPaused);
      if (parsed.renderMode !== undefined) setRenderMode(parsed.renderMode);
    }
  }, []);

  const [speed, setSpeed] = useState(0.2);
  const [lighting, setLighting] = useState(1.0);
  const [zoom, setZoom] = useState(1.69);
  const [yaw, setYaw] = useState(33 * (Math.PI / 180));
  const [pitch, setPitch] = useState(-17 * (Math.PI / 180));
  const [proximity, setProximity] = useState(-1.8);
  const [wind, setWind] = useState(1.0);
  const [colorMode, setColorMode] = useState("cyan");
  const [isPaused, setIsPaused] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<
    | "controls"
    | "landscape"
    | "minimap"
    | "telemetry"
    | "network"
    | "archive"
    | "brand"
    | "framework"
    | "benchmarks"
    | "abbey"
    | "portfolio"
  >("landscape");
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [renderMode, setRenderMode] = useState(0); // 0: Mandelbulb, 1: Neural Brain
  const [neuralActivity, setNeuralActivity] = useState(1.0);
  const [fps, setFps] = useState(0);
  const [activePersona, setActivePersona] = useState<PersonaType>("ABBEY");
  const [isAutoPersona, setIsAutoPersona] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [abbeyPulse, setAbbeyPulse] = useState(1.0);
  const [avivaGlitch, setAvivaGlitch] = useState(0.85);
  const [abiFlicker, setAbiFlicker] = useState(1.0);
  
  const settings = { speed, lighting, zoom, yaw, pitch, proximity, wind, colorMode, isPaused, renderMode };
  const autoSaveStatus = useAutoSave(settings, 'mlai-settings', 3000);
  const [sequence, setSequence] = useState<"landing" | "connecting" | "active">(
    "landing",
  );
// Telemetry
  const [telemetryData, setTelemetryData] = useState(
    Array.from({ length: 20 }).map((_, i) => ({
      name: i,
      value: 50 + Math.random() * 10,
    })),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetryData((prev) => {
        const next = [...prev.slice(1), { name: prev[19].name + 1, value: 50 + Math.random() * 10 }];
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const colors = {
    cyan: [0.0, 0.8, 1.0],
    purple: [0.6, 0.2, 1.0],
    lime: [0.2, 1.0, 0.2],
    orange: [1.0, 0.5, 0.0],
  };

  const [logs, setLogs] = useState<string[]>([
    "> BOOTING WDBX_KERNEL_V3.4...",
    "> MAPPING NEURAL_SYNAPSE_GRID...",
    "> PROTOCOL: ABBEY_LEVEL_SECURE",
  ]);

  const PERSONA_MESSAGES: Record<PersonaType, string[]> = {
    ABBEY: [
      "> SWITCH: PERSONA_ABBEY",
      "> STATUS: ETHICAL_COMPLIANCE_NOMINAL",
      "> ENFORCING_INTEGRITY_SHIELD...",
    ],
    AVIVA: [
      "> SWITCH: PERSONA_AVIVA",
      "> STATUS: RESEARCH_CORE_ACTIVE",
      "> OVERCLOCKING_SYNAPSE_GRID...",
    ],
    ABI: [
      "> SWITCH: PERSONA_ABI",
      "> STATUS: MODERATOR_LAYER_ENGAGED",
      "> SYNCING_REGULATORY_BUFFER...",
    ],
  };

  const playPersonaCue = useCallback(
    (persona: PersonaType, type: string = "SWITCH") => {
      if (!audioContextRef.current || !audioStarted) return;
      const ctx = audioContextRef.current;
      if (ctx.state === "suspended") ctx.resume();

      const cueGain = ctx.createGain();
      const cueFilter = ctx.createBiquadFilter();
      cueFilter.type = "lowpass";
      cueFilter.frequency.setValueAtTime(3000, ctx.currentTime);
      cueGain.connect(cueFilter);
      cueFilter.connect(ctx.destination);

      const playOsc = (freq: number, type: OscillatorType, dur: number, attack: number, volume: number) => {
        const osc = ctx.createOscillator();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + attack);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + dur);
        osc.connect(gain);
        gain.connect(cueGain);
        osc.start();
        osc.stop(ctx.currentTime + dur);
      };

      if (persona === "ABBEY") {
        if (type === "SWITCH") {
            playOsc(523.25, "sine", 0.5, 0.05, 0.05);
            playOsc(659.25, "sine", 0.5, 0.1, 0.05);
        } else if (type === "EVENT_SECURE" || type === "EVENT_SECURITY_ALERT") {
             const baseFreq = type === "EVENT_SECURITY_ALERT" ? 440 : 783.99;
             // Rhythmic pulse for alert
             for (let i = 0; i < (type === "EVENT_SECURITY_ALERT" ? 3 : 1); i++) {
                setTimeout(() => playOsc(baseFreq, "square", 0.1, 0.01, 0.03), i * 150);
             }
        }
      } else if (persona === "AVIVA") {
        if (type === "SWITCH") {
           playOsc(150, "sine", 0.3, 0.05, 0.04);
           playOsc(400, "sine", 0.3, 0.1, 0.04);
        } else if (type === "EVENT_RESEARCH" || type === "EVENT_DATA_SURGE") {
           const type_ = type === "EVENT_DATA_SURGE" ? "sawtooth" : "sine";
           for (let i = 0; i < (type === "EVENT_DATA_SURGE" ? 5 : 1); i++) {
               setTimeout(() => playOsc(200 + i * 100, type_, 0.2, 0.02, 0.03), i * 50);
           }
        }
      } else if (persona === "ABI") {
        if (type === "SWITCH") {
          playOsc(800, "triangle", 0.15, 0.02, 0.08);
        } else if (type === "EVENT_CONFIRM" || type === "EVENT_REGULATORY_NOTIFICATION") {
           const freq1 = type === "EVENT_REGULATORY_NOTIFICATION" ? 440 : 1200;
           const freq2 = type === "EVENT_REGULATORY_NOTIFICATION" ? 659.25 : 1200;
           playOsc(freq1, "square", 0.1, 0.02, 0.05);
           setTimeout(() => playOsc(freq2, "square", 0.1, 0.02, 0.05), 100);
        }
      }
    },
    [audioStarted],
  );

  useEffect(() => {
    const newLogs = [
      ...logs,
      ...PERSONA_MESSAGES[activePersona],
    ].slice(-12);
    setLogs(newLogs);

    playPersonaCue(activePersona);
  }, [activePersona, playPersonaCue]);

  useEffect(() => {
      // Determine effect based on tab for persona cues
      if (activePersona === "ABBEY" && activeTab === "security") {
          playPersonaCue("ABBEY", "EVENT_SECURE");
      } else if (activePersona === "AVIVA" && (activeTab === "landscape" || activeTab === "telemetry")) {
          playPersonaCue("AVIVA", "EVENT_RESEARCH");
      } else if (activePersona === "ABI" && activeTab === "blueprint") {
          playPersonaCue("ABI", "EVENT_CONFIRM");
      }
  }, [activeTab, activePersona, playPersonaCue]);

  useEffect(() => {
    (window as any)._shaderSpeed = speed;
    (window as any)._shaderLighting = lighting;
    (window as any)._shaderZoom = zoom;
    (window as any)._shaderYaw = yaw;
    (window as any)._shaderPitch = pitch;
    (window as any)._shaderDepth = proximity;
    (window as any)._shaderWind = wind;
    (window as any)._shaderMode = renderMode;
    (window as any)._shaderActivity = neuralActivity;
    (window as any)._shaderPaused = isPaused;

    const personaKeys = Object.keys(PERSONAS) as PersonaType[];
    const pIdx = personaKeys.indexOf(activePersona);
    (window as any)._shaderPersona = pIdx;

    (window as any)._shaderColor = (colors as any)[colorMode] || [0.0, 0.8, 1.0];

    (window as any)._shaderAbbeyPulse = abbeyPulse;
    (window as any)._shaderAvivaGlitch = avivaGlitch;
    (window as any)._shaderAbiFlicker = abiFlicker;
  }, [
    speed,
    lighting,
    zoom,
    yaw,
    pitch,
    proximity,
    wind,
    colorMode,
    renderMode,
    neuralActivity,
    isPaused,
    activePersona,
    abbeyPulse,
    avivaGlitch,
    abiFlicker,
  ]);

  const theme = PERSONAS[activePersona];

  const personaConfig = PERSONAS[activePersona];

  // Keyboard shortcuts for persona switching
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName))
        return;

      const personaKeys = Object.keys(PERSONAS) as PersonaType[];
      const index = parseInt(e.key) - 1;
      
      if (index >= 0 && index < personaKeys.length) {
        setActivePersona(personaKeys[index]);
        setIsAutoPersona(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Diagnostic logic
  useEffect(() => {
    let frameId: number;
    const updateFPS = () => {
      framesRef.current++;
      const now = performance.now();

      // Update Active Persona every 5 seconds for effect
      if (isAutoPersona) {
        const seconds = Math.floor(now / 5000);
        const personaKeys = Object.keys(PERSONAS) as PersonaType[];
        setActivePersona(personaKeys[seconds % personaKeys.length]);
      }

      // Modulate neural activity
      setNeuralActivity(
        0.8 + Math.random() * 0.4 + Math.sin(now * 0.002) * 0.2,
      );

      if (now >= lastTimeRef.current + 1000) {
        setFps(
          Math.round((framesRef.current * 1000) / (now - lastTimeRef.current)),
        );
        framesRef.current = 0;
        lastTimeRef.current = now;
      }
      frameId = requestAnimationFrame(updateFPS);
    };
    frameId = requestAnimationFrame(updateFPS);
    return () => cancelAnimationFrame(frameId);
  }, []);

  // Wheel zoom logic
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      setZoom((prev) => Math.max(1.0, Math.min(4.0, prev - e.deltaY * 0.001)));
    };
    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, []);

  const resetNavigation = () => {
    setYaw(33 * (Math.PI / 180));
    setPitch(-17 * (Math.PI / 180));
    setZoom(1.69);
    setProximity(-1.8);
    setWind(1.0);
    setSpeed(0.2);
  };

  const startAudio = () => {
    if (audioStarted) return;

    const ctx = new (
      window.AudioContext || (window as any).webkitAudioContext
    )();
    audioContextRef.current = ctx;

    // Resume context (browser security)
    if (ctx.state === "suspended") {
      ctx.resume();
    }

    // 1. Base Drone
    const osc = ctx.createOscillator();
    const droneGain = ctx.createGain();
    osc.type = "sine";
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
    noiseFilter.type = "bandpass";
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
    envFilter.type = "lowpass";
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
        noiseGainRef.current.gain.setTargetAtTime(
          targetGain,
          ctx.currentTime,
          0.1,
        );

        // Modulate filter frequency (creature "chirps")
        const targetFreq =
          500 + movementRef.current * 4000 + Math.sin(Date.now() * 0.005) * 200;
        filterRef.current.frequency.setTargetAtTime(
          targetFreq,
          ctx.currentTime,
          0.1,
        );
      }
      frame = requestAnimationFrame(updateAudio);
    };

    frame = requestAnimationFrame(updateAudio);
    return () => cancelAnimationFrame(frame);
  }, [audioStarted]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeObserver = new ResizeObserver(() => {
      if (!canvas) return;
      const displayWidth = canvas.clientWidth;
      const displayHeight = canvas.clientHeight;
      if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
      }
    });

    resizeObserver.observe(canvas);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Check for explicit WebGPU parameter or use WebGL2 by default for performance
    const gl = (canvas.getContext("webgl2", {
      antialias: false,
      powerPreference: "high-performance",
      alpha: false,
    }) ||
      canvas.getContext("webgl", {
        antialias: false,
        powerPreference: "high-performance",
        alpha: false,
      })) as WebGLRenderingContext | null;

    if (!gl) {
      console.error("WebGL not supported");
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
      uniform float u_neural_activity;
      uniform int u_mode;
      uniform int u_persona;
      uniform float u_abbey_pulse;
      uniform float u_aviva_glitch;
      uniform float u_abi_flicker;

      #define MAX_STEPS 90
      #define SURF_DIST 0.001
      #define MAX_DIST 15.0
      #define ITERATIONS 8
      
      bool g_simplified = false;

      // --- FAST UTILS ---
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
        int octaves = g_simplified ? 2 : 4;
        for (int i = 0; i < 4; ++i) {
          if (i >= octaves) break;
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

      // --- BRAIN/NEURAL MATH ---
      float sdLine(vec3 p, vec3 a, vec3 b) {
        vec3 pa = p - a, ba = b - a;
        float h = clamp(dot(pa, ba)/dot(ba, ba), 0.0, 1.0);
        return length(pa - ba * h);
      }

      float neuralBrain(vec3 p, out float orbit) {
        float d = 1e10;
        orbit = 0.0;
        float totalOrbit = 0.0;
        
        // --- PERSONA INFLUENCE ---
        // 0: Abbey, 1: Aviva, 2: Abi
        
        // Optimize loops by reducing iterations when possible
        int maxLayers = g_simplified ? 1 : 2; // Reduced layers
        int neuralsPerCell = g_simplified ? 1 : 2; // Reduced neurons per cell
        int filamentCount = g_simplified ? 1 : (u_persona == 1 ? 4 : 2); // Reduced filaments

        // --- DOMAIN WARPING ---
        float warpScale = 0.5;
        if (u_persona == 1) warpScale = 1.8; // Reduced chaos frequency
        if (u_persona == 2) warpScale = 0.1;
        
        float warpSpeed = u_persona == 1 ? 0.6 : 0.15;
        float warp = 0.0;
        
        // Skip FBM if simplified or far away
        if (g_simplified) {
             vec3 wp = p * warpScale + u_time * warpSpeed;
             warp = (sin(wp.x) + cos(wp.y) + sin(wp.z)) * 0.2;
        } else {
             warp = fbm(p * warpScale + u_time * warpSpeed);
        }
        
        p += warp * 0.1 * u_wind * (u_persona == 1 ? 1.5 : 1.0);

        // Multiple layers for depth
        for(int j=0; j<2; j++) {
          if (j >= maxLayers) break;
          float scale = 0.7 + float(j) * 1.5;
          vec3 pIter = p * scale;
          
          if (u_persona == 0) {
            // Abbey: Perfect Cube Grid - Simplified grid
            pIter = (floor(pIter * 4.0) + 0.5) / 4.0; 
          }
          
          vec3 cell = floor(pIter / 3.0);
          vec3 localP = mod(pIter, 3.0) - 1.5;
          float cellHash = hash(cell + float(j) * 17.7);
          
          if (u_persona == 2) {
            // Abi: Digital Discretization
            float quantization = 8.0; // Less quantization
            localP = floor(localP * quantization) / quantization;
          }

          // Neurons (Physical Nodes)
          for(int i=0; i<2; i++) {
            if (i >= neuralsPerCell) break;                
            vec3 offset = vec3(
              hash(cell + float(i) * 0.57), 
              hash(cell + float(i) * 0.23 + 0.5), 
              hash(cell + float(i) * 0.85 + 0.9)
            ) * 2.0 - 1.0;
            
            float pFreq = 1.0 + cellHash; // Reduced frequency
            float pulseTime = u_time * (1.0 + (u_persona == 0 ? u_abbey_pulse * 0.2 : 0.0));
            float pulse = sin(pulseTime * pFreq + cellHash * 50.0) * 0.5 + 0.5;
            float size = 0.02 + pulse * 0.04 * (u_persona == 1 ? 1.5 : (u_persona == 0 ? 0.6 + u_abbey_pulse * 0.3 : 0.6));
            
            float s;
            if (u_persona == 0) {
              vec3 b = abs(localP - offset) - size * 1.0;
              s = (length(max(b, 0.0)) + min(max(b.x, max(b.y, b.z)), 0.0)) / scale;
            } else if (u_persona == 1) {
              s = (length(localP - offset) - size) / scale; // Simplified plasma
            } else {
              vec3 b = abs(localP - offset) - size * 0.5;
              s = (length(max(b, 0.0)) + min(max(b.x, max(b.y, b.z)), 0.0)) / scale;
            }
            
            d = min(d, s);
            
            if (s < 0.2 / scale) {
              float influence = smoothstep(0.2 / scale, 0.0, s);
              float iPulse = (0.4 + pulse * 1.0 * u_neural_activity);
              if (u_persona == 0) iPulse *= (1.0 + u_abbey_pulse * 0.5);
              totalOrbit += influence * iPulse;
            }
          }
          
          // Synapses (Interconnections)
          if (u_lighting > 0.05) {
            for(int i=0; i<4; i++) {
              if (i >= filamentCount) break;
              vec3 a = vec3(hash(cell + float(i)), hash(cell + float(i) + 14.1), hash(cell + float(i) + 27.2)) * 2.0 - 1.0;
              vec3 b = vec3(hash(cell + float(i+1)), hash(cell + float(i+1) + 14.1), hash(cell + float(i+1) + 27.2)) * 2.0 - 1.0;
              
              vec3 dir = b - a;
              float len = length(dir);
              dir /= len;
              
              float distAlong = dot(localP - a, dir);
              vec3 pProj = a + dir * distAlong;
              float lateralDist = length(localP - pProj);
              
              // Path Deformation
              float wiggle = 0.0;
              if (u_persona == 1) wiggle = noise(localP * 5.0 + u_time * 3.0) * 0.01;
              if (u_persona == 2) lateralDist += 0.02 * step(0.95, hash(vec3(distAlong))); // Simplified jitter
              
              float radius = 0.002;
              float l = (lateralDist + wiggle - radius) / scale;
              
              if (distAlong < 0.0 || distAlong > len) l = 1e10;
              d = min(d, l);
              
              float pSpeed = (u_persona == 1 ? 4.0 : 2.0);
              float flow = fract(distAlong * 1.0 - u_time * pSpeed);
              float packet = smoothstep(0.1, 0.0, abs(flow - 0.5) - 0.02);
              
              if (l < 0.05 / scale) {
                float lInf = smoothstep(0.05 / scale, 0.0, l);
                totalOrbit += packet * lInf * u_neural_activity;
              }
            }
          }
        }
        
        orbit = clamp(totalOrbit, 0.0, 1.2);
        return d;
      }

      float map(vec3 p, out float orbit) {
        if (u_mode == 1) return neuralBrain(p, orbit);
        return mandelbulb(p, orbit);
      }

      float mapSimple(vec3 p) {
        float o;
        g_simplified = true;
        float d;
        if (u_mode == 1) d = neuralBrain(p, o);
        else d = mandelbulb(p, o);
        g_simplified = false;
        return d;
      }

      vec3 getNormal(vec3 p) {
        vec2 e = vec2(0.005, 0.0); // optimized epsilon
        return normalize(vec3(
          mapSimple(p + e.xyy) - mapSimple(p - e.xyy),
          mapSimple(p + e.yxy) - mapSimple(p - e.yxy),
          mapSimple(p + e.yyx) - mapSimple(p - e.yyx)
        ));
      }

      float calcAO(vec3 p, vec3 n) {
        float occ = 0.0;
        float sca = 1.0;
        for (int i = 0; i < 4; i++) { // Optimized AO samples
          float hr = 0.015 + 0.1 * float(i) / 3.0;
          float d = mapSimple(p + n * hr);
          occ += -(d - hr) * sca;
          sca *= 0.9;
        }
        return clamp(1.0 - 2.5 * occ, 0.0, 1.0);
      }

      float softShadow(vec3 ro, vec3 rd, float mint, float tmax) {
        float res = 1.0;
        float t = mint;
        for (int i = 0; i < 16; i++) { // Optimized steps
          float h = mapSimple(ro + rd * t);
          res = min(res, 12.0 * h / t);
          t += clamp(h, 0.02, 0.4);
          if (h < 0.002 || t > tmax) break;
        }
        return clamp(res, 0.0, 1.0);
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
        vec2 screenUV = gl_FragCoord.xy / u_resolution.xy;
        
        // Offset UV to move the object to the bottom right (only in mode 0)
        if (u_mode == 0) uv += vec2(-0.25, 0.25);
        
        vec3 ro = vec3(0.0, 0.0, u_depth);
        vec3 rd = normalize(vec3(uv, u_zoom));
        
        float pitch = u_rotation.y;
        float yaw = u_rotation.x;
        ro.yz *= rot(pitch);
        rd.yz *= rot(pitch);
        ro.xz *= rot(yaw);
        rd.xz *= rot(yaw);

        // --- PERSONA SIGNATURE EFFECTS ---
        float personaPulse = 0.5 + 0.5 * sin(u_time * 2.0);
        float finalTitleGlow = 0.0;
        
        // Center-left region where title usually resides
        vec2 titlePos = vec2(0.25, 0.5);
        float distToTitle = length(screenUV - titlePos);
        float titleMask = smoothstep(0.4, 0.0, distToTitle);
        
        vec3 personaSignColor = vec3(0.0);
        
        if (u_persona == 0) {
          // Abbey: Pronounced cyan glow with calming wave-like motion
          float calmTime = u_time * (0.5 + u_abbey_pulse * 0.1);
          float wave = sin(calmTime * 2.0 + screenUV.y * 5.0) * 0.2 * u_abbey_pulse;
          float pulse = 0.6 + (0.4 + wave) * sin(calmTime * 2.0) * (0.8 + u_abbey_pulse * 0.4);
          personaSignColor = vec3(0.1, 0.8, 1.2) * pulse * (1.0 + u_abbey_pulse * 0.8);
          finalTitleGlow = titleMask * pulse * (2.0 + u_abbey_pulse * 2.0);
        } else if (u_persona == 1) {
          // Aviva: Intensified purple glitch with pronounced distortion and chromatic aberration
          float neuralPulse = 0.8 + 0.2 * sin(u_time * 5.0); // Subtle pulse based on 'neural activity'
          vec2 distortedUV = screenUV;
          // Pronounced electric jitter, more frequency and amplitude
          distortedUV.x += sin(u_time * 150.0 + distortedUV.y * 60.0) * 0.025 * step(0.4, hash12(vec2(u_time * 70.0, 0.0)));
          float glitch = step(0.4, hash12(vec2(u_time * 60.0, distortedUV.y * 40.0)));
          // Combine color with neural pulse
          personaSignColor = vec3(1.2, 0.4, 2.0) * (0.5 + glitch * 2.5) * neuralPulse;
          finalTitleGlow = titleMask * (1.8 + glitch * 5.0) * neuralPulse;
        } else if (u_persona == 2) {
          // Abi: Highly dynamic amber flicker with sharp intensity spikes
          float pulse = 0.7 + 0.3 * sin(u_time * 8.0);
          float flicker = step(0.2, hash12(vec2(u_time * 90.0, 0.0)));
          // Sharp dynamic spikes
          float spike = step(0.95, hash12(vec2(u_time * 120.0, 0.0)));
          flicker += spike * 2.5;
          personaSignColor = vec3(1.8, 1.1, 0.3) * pulse * flicker * 2.0;
          finalTitleGlow = titleMask * pulse * (flicker + spike * 0.5) * 6.0;
        }

        // --- BACKGROUND ---
        float distToCenter = length(screenUV - vec2(0.75, 0.25));
        vec3 bgColor = mix(vec3(0.0, 0.05, 0.06), vec3(0.0), smoothstep(0.2, 0.8, distToCenter));
        
        // Persona Patterns
        float pattern = 0.0;
        if (u_persona == 0) {
           // Abbey: Grid
           vec2 grid = abs(fract(screenUV * 15.0 - 0.5) - 0.5) / 0.05;
           pattern = 1.0 - min(grid.x, grid.y);
           pattern *= 0.03;                
        } else if (u_persona == 1) {
           // Aviva: Flow
           pattern = sin(screenUV.x * 10.0 + u_time * 0.5) * cos(screenUV.y * 8.0 + u_time * 0.3) * 0.05;
        } else if (u_persona == 2) {
           // Abi: Segmented
           pattern = step(0.4, fract(screenUV.x * 6.0)) * step(0.4, fract(screenUV.y * 6.0)) * 0.03;
        }
        
        bgColor += vec3(pattern);
        
        if (u_mode == 1) bgColor = vec3(0.01, 0.005, 0.02) + vec3(pattern); // Refined purple for brain
        
        // Inject persona signature into background
        bgColor += (personaSignColor * 0.6 + finalTitleGlow * 0.4);
        
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
          
          if (u_mode == 1) {
            glow += 0.003 / (0.005 + d * d) * u_neural_activity;
          } else {
            glow += 0.01 / (0.01 + d * d);
          }
          
          if (t < 5.0) {
              float warp = noise(p * 0.5 + u_time * 0.2 * u_wind);
              // optimized fbm loop for fog
              float n = noise(p * 1.5 + warp + u_time * 0.4 * u_wind); 
              fogDensity += n * exp(-d * 6.0) * 0.05;
          }

          if (d < SURF_DIST) {
            hit = true;
            finalOrbit = orbit;
            break;
          }
          if (t > MAX_DIST) break;
          t += d;
        }

        vec3 haloColor = u_color;
        if (u_mode == 1) {
          color += haloColor * glow * 0.2; // Stronger glow in brain mode
          color += haloColor * fogDensity * 0.2;
          
          // Post-process scanlines or noise based on persona
          if (u_persona == 0) {
             color *= 0.9 + 0.1 * sin(uv.y * 500.0 + u_time * 10.0); // Abbey scanlines
          } else if (u_persona == 2) {
             if (hash12(floor(uv * 40.0 + u_time)) > 0.98) color += 0.2 * u_color; // Abi digital noise
          }
        } else {
          color += haloColor * glow * 0.015;
          color += haloColor * fogDensity * 0.4;
        }

        if (hit) {
          vec3 p = ro + rd * t;
          vec3 n = getNormal(p);
          vec3 lightPos = vec3(2.0, 4.0, -3.0);
          vec3 lightDir = normalize(lightPos - p);
          
          float ao = calcAO(p, n);
          float shadow = softShadow(p, lightDir, 0.02, 2.5);
          
          vec3 baseColor = mix(vec3(0.1), u_color, finalOrbit);
          if (u_mode == 1) {
            vec3 abbeyColor = vec3(0.0, 0.8, 1.0);
            vec3 avivaColor = vec3(0.85, 0.3, 1.0);
            vec3 abiColor = vec3(1.0, 0.5, 0.0);
            
            vec3 personaColor = abbeyColor;
            if (u_persona == 2) personaColor = abiColor;
            else if (u_persona == 1) personaColor = avivaColor;
            
            baseColor = mix(vec3(0.01, 0.01, 0.02), personaColor, finalOrbit * 3.0);
            
            // Add iridescence to base color for that surreal look
            float fresnelOuter = 1.0 - max(dot(n, normalize(ro - p)), 0.0);
            vec3 iridescent = 0.5 + 0.5 * cos(u_time * 0.5 + p.yxy * 2.0 + vec3(0.0, 2.0, 4.0));
            baseColor += iridescent * pow(fresnelOuter, 3.0) * 0.6 * u_neural_activity;
            
            // Extra visual flavor
            if (u_persona == 1) {
                // Aviva: Electric Overclock (Chromatic Aberration style jitter)
                float electric = step(0.92, hash12(p.xy + u_time * 20.0));
                baseColor += electric * vec3(0.5, 0.0, 1.0);
                baseColor *= 1.0 + 0.6 * sin(u_time * 15.0 + p.z * 10.0);
            }
            if (u_persona == 0) {
                // Abbey: Grid Integrity
                float grid = smoothstep(0.01, 0.0, abs(fract(p.x * 20.0) - 0.5)) + 
                             smoothstep(0.01, 0.0, abs(fract(p.y * 20.0) - 0.5));
                float calmPulse = 0.8 + 0.3 * sin(u_time * 1.5) * u_abbey_pulse;
                baseColor += grid * abbeyColor * 0.3 * calmPulse * (1.0 + u_abbey_pulse * 0.5);
            }
            if (u_persona == 2) {
                // Abi: Binary Stream
                float block = step(0.9, hash12(floor(p.xy * 15.0) + floor(u_time * 8.0)));
                baseColor += block * abiColor * 0.5;
            }
          }
          
          float diff = max(dot(n, lightDir), 0.0);
          float spec = pow(max(dot(normalize(ro - p), reflect(-lightDir, n)), 0.0), 32.0);
          
          color = baseColor * (diff * shadow * u_lighting + 0.05) * ao;
          // Add a secondary fill light from below
          vec3 fillLightDir = normalize(vec3(-1.0, -2.0, 1.0));
          float fillDiff = max(dot(n, fillLightDir), 0.0);
          color += baseColor * fillDiff * 0.15 * ao * u_color;
          
          color += vec3(0.8, 0.9, 1.0) * spec * shadow * 0.6 * u_lighting;
          
          float rim = pow(1.0 - max(dot(n, -rd), 0.0), 3.0);
          color += haloColor * rim * 0.8 * u_lighting;
        }

        // --- POST PROCESSING: FLOWING MIST ---
        float mist = 0.0;
        vec3 mpos1 = vec3(uv * 1.5, u_time * 0.1 * u_wind);
        mpos1.x -= u_time * 0.8 * u_wind;
        mist += smoothstep(0.3, 0.8, fbm(mpos1)) * 0.15;
        
        vec3 mistColor = haloColor * mist;
        color += mistColor;
        if (hit) color += mistColor * 0.5;

        float fogAmount = clamp((t - 1.0) / (MAX_DIST - 1.0), 0.0, 1.0);
        vec3 finalFogColor = vec3(0.01, 0.02, 0.03);
        if (u_mode == 1) finalFogColor = vec3(0.005, 0.0, 0.01);
        color = mix(color, finalFogColor, fogAmount);

        // Chromatic aberration at screen edges for deep immersion
        float rf = length(uv - 0.5) * 0.1;
        
        color = pow(color, vec3(0.4545));
        gl_FragColor = vec4(color, 1.0);
      }
    `;

    // --- WEBGL SETUP ---
    function createShader(
      gl: WebGLRenderingContext,
      type: number,
      source: string,
    ) {
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

    const positionAttributeLocation = gl.getAttribLocation(
      program,
      "aVertexPosition",
    );
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    const timeLoc = gl.getUniformLocation(program, "u_time");
    const resLoc = gl.getUniformLocation(program, "u_resolution");
    const rotationLoc = gl.getUniformLocation(program, "u_rotation");
    const speedLoc = gl.getUniformLocation(program, "u_speed");
    const lightLoc = gl.getUniformLocation(program, "u_lighting");
    const zoomLoc = gl.getUniformLocation(program, "u_zoom");
    const depthLoc = gl.getUniformLocation(program, "u_depth");
    const windLoc = gl.getUniformLocation(program, "u_wind");
    const colorLoc = gl.getUniformLocation(program, "u_color");
    const modeLoc = gl.getUniformLocation(program, "u_mode");
    const personaLoc = gl.getUniformLocation(program, "u_persona");
    const activityLoc = gl.getUniformLocation(program, "u_neural_activity");
    const abbeyPulseLoc = gl.getUniformLocation(program, "u_abbey_pulse");
    const avivaGlitchLoc = gl.getUniformLocation(program, "u_aviva_glitch");
    const abiFlickerLoc = gl.getUniformLocation(program, "u_abi_flicker");

    let isDragging = false;
    let lastMouseX = 0,
      lastMouseY = 0;

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
      const clampedPitch = Math.max(
        -Math.PI / 2,
        Math.min(Math.PI / 2, newPitch),
      );

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

    const handleWheel = (e: WheelEvent) => {
      const zoomSensitivity = 0.001;
      const delta = e.deltaY * -zoomSensitivity;
      const currentZoom = (window as any)._shaderZoom || 1.69;
      const newZoom = Math.max(0.5, Math.min(8.0, currentZoom + delta));

      (window as any)._shaderZoom = newZoom;
      setZoom(newZoom);
    };

    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("wheel", handleWheel, { passive: true });

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    window.addEventListener("resize", resize);
    resize();

    let animationFrameId: number;
    let lastTime = 0;
    let frames = 0;
    let lastFpsUpdate = 0;

    const render = (time: number) => {
      const deltaTime = time - lastTime;
      lastTime = time;

      // FPS Calculation
      frames++;
      if (time > lastFpsUpdate + 1000) {
        setFps(Math.round((frames * 1000) / (time - lastFpsUpdate)));
        frames = 0;
        lastFpsUpdate = time;
      }

      gl.uniform1f(timeLoc, time * 0.001);
      gl.uniform2f(resLoc, canvas.width, canvas.height);

      // Update rotation if not paused
      if (!(window as any)._shaderPaused) {
        const currentYaw = (window as any)._shaderYaw || 0;
        const currentSpeed = (window as any)._shaderSpeed || 1.0;
        const newYaw = currentYaw + 0.00001 * currentSpeed * deltaTime;
        (window as any)._shaderYaw = newYaw;
        // Sync back to React state occasionally to prevent too many renders
        // but often enough to see the slider move if activeTab is controls
        if (Math.random() > 0.95) setYaw(newYaw);
      }

      gl.uniform2f(
        rotationLoc,
        (window as any)._shaderYaw || 0,
        (window as any)._shaderPitch || 0,
      );

      const getVal = (key: string, fallback: number) => {
        const val = (window as any)[key];
        return typeof val === "number" ? val : fallback;
      };

      gl.uniform1f(speedLoc, getVal("_shaderSpeed", 1.0));
      gl.uniform1f(lightLoc, getVal("_shaderLighting", 1.0));
      gl.uniform1f(zoomLoc, getVal("_shaderZoom", 1.2));
      gl.uniform1f(depthLoc, getVal("_shaderDepth", -1.8));
      gl.uniform1f(windLoc, getVal("_shaderWind", 1.0));
      const c = (window as any)._shaderColor || [0.0, 0.8, 1.0];
      gl.uniform3f(colorLoc, c[0], c[1], c[2]);
      gl.uniform1i(modeLoc, getVal("_shaderMode", 0));
      gl.uniform1i(personaLoc, getVal("_shaderPersona", 0));
      gl.uniform1f(activityLoc, getVal("_shaderActivity", 1.0));
      gl.uniform1f(abbeyPulseLoc, getVal("_shaderAbbeyPulse", 1.0));
      gl.uniform1f(avivaGlitchLoc, getVal("_shaderAvivaGlitch", 0.85));
      gl.uniform1f(abiFlickerLoc, getVal("_shaderAbiFlicker", 1.0));

      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const resetCamera = () => {
    setYaw(33 * (Math.PI / 180));
    setPitch(-17 * (Math.PI / 180));
    setZoom(1.69);
    setProximity(-1.8);
    movementRef.current = 1.0;
  };

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
    if (settings.renderMode !== undefined) setRenderMode(settings.renderMode);
    else setRenderMode(0);
    setIsCollapsed(true);

    // Update Environment Audio
    if (
      audioContextRef.current &&
      envFilterRef.current &&
      envGainRef.current &&
      landscape.audio
    ) {
      const ctx = audioContextRef.current;
      const audio = landscape.audio;
      envFilterRef.current.type = audio.type as BiquadFilterType;
      envFilterRef.current.frequency.setTargetAtTime(
        audio.freq,
        ctx.currentTime,
        0.5,
      );
      envFilterRef.current.Q.setTargetAtTime(audio.q, ctx.currentTime, 0.5);
      envGainRef.current.gain.setTargetAtTime(audio.gain, ctx.currentTime, 0.5);
    }

    // Trigger audio movement
    movementRef.current = 1.0;
  };

  const landscapes = [
    {
      id: "cave",
      name: "The Cave",
      image:
        "https://lh3.googleusercontent.com/pw/AP1GczMdSHG7AfLrUH_b3sLjtG340ZEp3eywkEuo5n7zrFw-TfA0ZwJBk7Ry0z9yWoGSW9leVAtzxqOrrBbxa_VPAh46gowm9Cop5uqMyGl0LR4JnrVHqfO7-ssNRjbpI8uy_hj0md_X8tI8K5C1eF6XJBL5=w2606-h1416-s-no-gm?authuser=0",
      settings: {
        speed: 0.2,
        lighting: 1.0,
        zoom: 2.02,
        yaw: -79 * (Math.PI / 180),
        pitch: -27 * (Math.PI / 180),
        proximity: -0.78,
        wind: 0,
        isPaused: false,
        colorMode: "lime",
      },
      audio: {
        freq: 150,
        q: 8,
        type: "lowpass",
        gain: 0.2,
      },
    },
    {
      id: "peak",
      name: "The Peak",
      image:
        "https://lh3.googleusercontent.com/pw/AP1GczO4s-8i-WwoohnEi6cV3q_g5g8Y0kqm6XJSBL51Pitm5HCtRk4ywtjVn0HfhCRA3ehY9j1MN7AaElD4Lw7EsXx3r1mPaznRSu5K9LXsGstebQVBKONjxdqPVsBlnjyJO1wsyfSk8p2hF2FvqKBKUjNd=w2192-h1480-s-no-gm?authuser=0",
      settings: {
        speed: 0.1,
        lighting: 0.59,
        zoom: 2.09,
        proximity: -2.2,
        wind: 1.86,
        yaw: 19 * (Math.PI / 180),
        pitch: -14 * (Math.PI / 180),
        isPaused: true,
        colorMode: "cyan",
      },
      audio: {
        freq: 400,
        q: 0.5,
        type: "bandpass",
        gain: 0.25,
      },
    },
    {
      id: "void",
      name: "The Void",
      image:
        "https://lh3.googleusercontent.com/pw/AP1GczODtYaSgO3R8EPfEfgpsmGlugQJoXtx-AYNAo9mAJHW9Gc9lJ8h6NR3joe7491Qk5rdmdblFTtJLp657-w9V0R2wCBcZ0MEvtLXk23C2puJtXzuMF6mCPcscvOayF1vBSzJZ039_z6xlNyk1cYo1AmX=w2146-h1320-s-no-gm?authuser=0",
      settings: {
        speed: 0.3,
        lighting: 1.43,
        zoom: 2.98,
        proximity: -1.85,
        wind: 0.0,
        yaw: -189 * (Math.PI / 180),
        pitch: -5 * (Math.PI / 180),
        isPaused: false,
        colorMode: "purple",
      },
      audio: {
        freq: 800,
        q: 15,
        type: "bandpass",
        gain: 0.18,
      },
    },
    {
      id: "fauna",
      name: "The Fauna",
      image:
        "https://lh3.googleusercontent.com/pw/AP1GczMBmxjrTBIebX8DF9LfMixa96_mmrTIQHKeWBlHk-EhqL4e1qPnMerboxyhTpD1uT9hYhdKFQ7ujQpoMRwjOmjX6Yqes7K8XR_n_mC3dfq_AoOwx3DIH49PYvgGUEu9oLyuEMqBX1ii_KwhJG58MLrS=w2628-h1658-s-no-gm?authuser=0",
      settings: {
        speed: 0.44,
        lighting: 1.46,
        zoom: 2.98,
        yaw: -185 * (Math.PI / 180),
        pitch: 79 * (Math.PI / 180),
        proximity: -1.06,
        wind: 0.12,
        isPaused: false,
        colorMode: "orange",
      },
      audio: {
        freq: 1200,
        q: 4,
        type: "lowpass",
        gain: 0.15,
      },
    },
    {
      id: "brain",
      name: "WDBX Brain",
      image:
        "https://images.unsplash.com/photo-1559757175-5700dde675bc?q=80&w=2071&auto=format&fit=crop",
      settings: {
        speed: 0.5,
        lighting: 1.5,
        zoom: 1.5,
        yaw: 0,
        pitch: 0,
        proximity: -2.0,
        wind: 1.0,
        isPaused: false,
        colorMode: "cyan",
        renderMode: 1,
      },
      audio: {
        freq: 2000,
        q: 1,
        type: "highpass",
        gain: 0.1,
      },
    },
    {
      id: "crystals",
      name: "The Crystals",
      image:
        "https://lh3.googleusercontent.com/pw/AP1GczN_BNuBAP4RA4smaqfbvvuuspP9IzqBqqX7VZqtGnXvah1zdksPKyA3wN-QC8MGVdiGxx6jgF_ov322Xr8BVzSShL9PTCDsFmhLhqW31T2IWZtSK1xoTzDGzq012f_1LWWG1cVOkyqu15jpsTH--KE2=w2710-h1678-s-no-gm?authuser=0",
      settings: {
        speed: 0.2,
        lighting: 1.26,
        zoom: 1.2,
        yaw: 315 * (Math.PI / 180),
        pitch: 19 * (Math.PI / 180),
        proximity: -1.07,
        wind: 0.0,
        isPaused: false,
        colorMode: "cyan",
      },
      audio: {
        freq: 600,
        q: 2,
        type: "bandpass",
        gain: 0.15,
      },
    },
  ];

  return (
    <ErrorBoundary>
      <AnimatePresence>
        {sequence !== "active" && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black"
          >
            <div className="absolute inset-0 bg-grid opacity-[0.08]" />
            <div className="absolute inset-0 bg-radial-gradient from-accent/5 to-transparent opacity-50" />
            <div className="scanlines opacity-[0.02]" />
            <div className="scanning-bar opacity-[0.04]" />

            {/* Immersive background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <motion.div
                animate={{
                  opacity: [0.03, 0.08, 0.03],
                  scale: [1, 1.1, 1],
                }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-accent blur-[120px]"
              />
              <motion.div
                animate={{
                  opacity: [0.02, 0.05, 0.02],
                  scale: [1.2, 1, 1.2],
                }}
                transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-accent blur-[150px]"
              />
            </div>

            {/* Background Decorative Globe */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none overflow-hidden">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
              >
                <Globe className="w-[1200px] h-[1200px]" />
              </motion.div>
            </div>

            {/* Left Sidebar - Terminal Feed */}
            <motion.div
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
              className="absolute top-1/2 -translate-y-1/2 left-8 w-64 hidden xl:block space-y-6 opacity-30 hover:opacity-100 transition-opacity duration-500"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-2 border-b border-white/10">
                  <Terminal className={cn("w-4 h-4", theme.accentClass)} />
                  <span className={cn("technical-label", theme.accentClass)}>
                    Terminal_Mainframe_Feed
                  </span>
                </div>
                <div className="p-4 bg-black/60 border border-white/10 font-mono text-[10px] space-y-1 text-text-dim h-48 overflow-hidden relative">
                  <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black to-transparent pointer-events-none" />
                  {logs.map((log, i) => (
                    <motion.p
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      key={`${i}-${log}`}
                      className={cn(
                        log.includes("SUCCESS") || log.includes("NOMINAL")
                          ? "text-emerald-500"
                          : log.includes("SWITCH")
                            ? theme.accentClass
                            : log.includes("WARNING")
                              ? "text-amber-500"
                              : "text-text-dim",
                      )}
                    >
                      {log}
                    </motion.p>
                  ))}
                  <motion.div
                    animate={{ opacity: [1, 0] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    className={`w-1 h-2 inline-block align-middle ml-1 ${theme.accentClass.replace("text", "bg")}`}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <span className="technical-label">Active_Sub_Protocols</span>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 border border-white/5 bg-white/[0.02] flex flex-col">
                    <span className="micro-label opacity-40">ETHIC</span>
                    <span className="technical-value text-[9px] text-emerald-500">
                      NOMINAL
                    </span>
                  </div>
                  <div className="p-2 border border-white/5 bg-white/[0.02] flex flex-col">
                    <span className="micro-label opacity-40">LOGIC</span>
                    <span className="technical-value text-[9px] text-emerald-500">
                      NOMINAL
                    </span>
                  </div>
                  <div className="p-2 border border-white/5 bg-white/[0.02] flex flex-col">
                    <span className="micro-label opacity-40">CALC</span>
                    <span className="technical-value text-[9px] text-emerald-500">
                      HIGH_LOAD
                    </span>
                  </div>
                  <div className="p-2 border border-white/5 bg-white/[0.02] flex flex-col">
                    <span className="micro-label opacity-40">SYNC</span>
                    <span className="technical-value text-[9px] text-accent">
                      WAITING
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Sidebar - Neural Status */}
            <motion.div
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 1.2, duration: 1 }}
              className="absolute top-1/2 -translate-y-1/2 right-8 w-64 hidden xl:block space-y-6 opacity-30 hover:opacity-100 transition-opacity duration-500"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-2 border-b border-white/10">
                  <Activity className={cn("w-4 h-4", theme.accentClass)} />
                  <span className={cn("technical-label", theme.accentClass)}>
                    Neural_Stability_Grid
                  </span>
                </div>
                <div className="h-32 flex items-end gap-1 px-4 border-l border-white/10 bg-black/40 pt-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
                    <motion.div
                      key={i}
                      animate={{
                        height: [
                          `${20 + Math.random() * 60}%`,
                          `${30 + Math.random() * 70}%`,
                          `${20 + Math.random() * 60}%`,
                        ],
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 1 + Math.random(),
                        ease: "easeInOut",
                      }}
                      className={cn(
                        "flex-1 transition-colors duration-1000",
                        theme.bgClass.replace("/5", "/20"),
                        activePersona === "ABBEY"
                          ? "border-accent"
                          : activePersona === "AVIVA"
                            ? "border-accent"
                            : "border-accent",
                        "border-t",
                      )}
                    />
                  ))}
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex justify-between items-center px-2 py-1 border-b border-white/5">
                    <span className="technical-label text-[8px]">
                      Synapse_Pulse
                    </span>
                    <span className="technical-value text-white">0.042ms</span>
                  </div>
                  <div className="flex justify-between items-center px-2 py-1 border-b border-white/5">
                    <span className="technical-label text-[8px]">
                      Cortex_Entropy
                    </span>
                    <span className="technical-value text-white">LOW</span>
                  </div>
                  <div className="flex justify-between items-center px-2 py-1 border-b border-white/5">
                    <span className="technical-label text-[8px]">
                      Cognitive_Uplink
                    </span>
                    <span className="technical-value text-emerald-500">
                      STABLE
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-accent/5 border border-accent/20 technical-panel">
                <span
                  className={cn(
                    "technical-label block mb-2 text-center uppercase tracking-[0.3em]",
                    theme.accentLightClass,
                  )}
                >
                  Warning
                </span>
                <p className="text-[8px] font-mono leading-relaxed text-text-dim text-center italic">
                  Biometric synchronization requires active neural consensus
                  from all three persona layers.
                </p>
              </div>
            </motion.div>

            <div className="relative z-10 flex flex-col items-center justify-center min-h-[85vh] w-full max-w-7xl px-6 mx-auto">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                className="w-40 h-40 mb-12 relative flex items-center justify-center"
              >
                <div
                  className={`absolute inset-0 border-2 rounded-[32px] rotate-45 opacity-20 ${theme.borderClass} animate-[ping_4s_linear_infinite]`}
                />
                <div
                  className={`absolute inset-4 border rounded-[24px] rotate-[15deg] animate-pulse blur-md ${theme.borderClass}`}
                />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                  className={`absolute inset-[-15%] border border-dashed rounded-full ${theme.borderClass} opacity-40`}
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
                  className={`absolute inset-[-30%] border border-dotted rounded-full ${theme.borderClass} opacity-20`}
                />
                <div
                  className={`w-20 h-20 rounded-[16px] flex items-center justify-center transition-all duration-1000 relative group overflow-hidden ${theme.orbClass}`}
                  style={{ boxShadow: `0 0 60px ${theme.hex}66` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-50" />
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse shadow-[0_0_15px_#fff]" />
                </div>
              </motion.div>

              <div className="text-center space-y-6 mb-20">
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="relative"
                >
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-6 opacity-40 w-full max-w-2xl">
                    <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent to-white/30" />
                    <span className="technical-label tracking-[1.2em] text-[10px] whitespace-nowrap">
                      DISTRIBUTED_INTELLIGENCE_CORE
                    </span>
                    <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent to-white/30" />
                  </div>
                  <h1 className="text-white font-display text-8xl md:text-[12rem] lg:text-[14rem] leading-[0.85] uppercase group cursor-default relative flex flex-col md:flex-row items-center justify-center gap-2 md:gap-6 tracking-tighter">
                    <span className="glitch-text relative" data-text="MLAI">
                      MLAI
                      <div className="absolute -bottom-2 left-0 w-full h-[2px] bg-white/5" />
                    </span>
                    <span
                      className={cn(
                        "transition-colors duration-1000 glitch-text font-serif italic",
                        theme.accentClass,
                      )}
                      data-text="CORP"
                    >
                      CORP
                    </span>
                  </h1>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1, duration: 0.8 }}
                  className="flex flex-col items-center gap-8 mt-12"
                >
                  <div className="flex items-center justify-center gap-8">
                    <div className="h-[1px] w-16 bg-gradient-to-r from-transparent to-white/10" />
                    <p className="technical-label tracking-[0.8em] text-white/50 uppercase text-[11px] font-medium">
                      Neural_Nexus_v3.42_Stable
                    </p>
                    <div className="h-[1px] w-16 bg-gradient-to-l from-transparent to-white/10" />
                  </div>
                  
                  <div className="flex flex-wrap items-center justify-center gap-4">
                    <div className="flex flex-col items-center min-w-[120px] py-4 px-8 border border-white/5 bg-black/40 backdrop-blur-md rounded-[16px]">
                      <span className="technical-label opacity-40 mb-2 tracking-widest text-[8px]">PROTOCOL</span>
                      <span className="font-mono text-xs text-white tracking-widest font-bold">SECURE_L7</span>
                    </div>
                    <div className="flex flex-col items-center min-w-[120px] py-4 px-8 border border-white/5 bg-black/40 backdrop-blur-md rounded-[16px] relative overflow-hidden group">
                      <div className={cn("absolute inset-0 opacity-10 animate-pulse mix-blend-screen", theme.bgClass)} />
                      <span className="technical-label opacity-40 mb-2 tracking-widest text-[8px]">CORE_STATE</span>
                      <span className={cn("font-mono text-xs tracking-widest font-bold drop-shadow-md", theme.accentClass)}>ACTIVE</span>
                    </div>
                    <div className="flex flex-col items-center min-w-[120px] py-4 px-8 border border-white/5 bg-black/40 backdrop-blur-md rounded-[16px]">
                      <span className="technical-label opacity-40 mb-2 tracking-widest text-[8px]">UPLINK_STS</span>
                      <span className="font-mono text-xs text-emerald-400 tracking-widest font-bold">ENCRYPTED</span>
                    </div>
                  </div>
                </motion.div>
              </div>

              {sequence === "landing" ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mt-6"
                >
                  <motion.button
                    key="landing-button"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2, duration: 0.8 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSequence("connecting");
                      setTimeout(() => {
                        setSequence("active");
                        startAudio();
                      }, 3500);
                    }}
                    className={cn(
                      "group relative px-12 py-6 bg-white/5 backdrop-blur-md rounded-[20px] transition-all overflow-hidden border",
                      theme.borderClass,
                      "hover:bg-white/10"
                    )}
                    style={{ boxShadow: `0 0 40px ${theme.hex}22` }}
                  >
                  <div
                    className={cn(
                      "absolute inset-0 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-700 ease-out opacity-20",
                      theme.bgClass.replace("/5", "/40"),
                    )}
                  />
                  
                  {/* Scanning bar effect on hover */}
                  <div className="absolute top-0 left-0 bottom-0 w-1 bg-white/20 -translate-x-full group-hover:animate-[scan_2s_linear_infinite]" style={{ boxShadow: `0 0 20px ${theme.hex}` }} />

                  <div className="relative z-10 flex flex-col items-center gap-4">
                    <span
                      className={cn(
                        "font-mono text-sm tracking-[0.4em] font-bold transition-colors uppercase group-hover:text-white",
                        theme.accentClass,
                      )}
                    >
                      INITIALIZE_UPLINK
                    </span>
                    <div className="flex items-center gap-3 w-full max-w-[200px]">
                      <div className="flex-1 h-[1px] bg-white/10 group-hover:bg-white/30 transition-colors" />
                      <div className={cn("w-1.5 h-1.5 rounded-full transition-colors")} style={{ backgroundColor: theme.hex }} />
                      <div className="flex-1 h-[1px] bg-white/10 group-hover:bg-white/30 transition-colors" />
                    </div>
                  </div>
                </motion.button>
              </motion.div>
              ) : (
                <motion.div
                  key={sequence}
                  initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  className="flex flex-col items-center gap-8"
                >
                  <div className="flex flex-col items-center gap-6">
                    <motion.div
                      animate={{ 
                        rotate: 360,
                        scale: (sequence === "connecting" && activePersona === "ABBEY") ? [1, 1.2, 1] : 1
                      }}
                      transition={{ 
                        rotate: { duration: 1.5, repeat: Infinity, ease: "linear" },
                        scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
                      }}
                      className={cn(
                        "w-16 h-16 border-2 border-t-current border-r-transparent border-b-current border-l-transparent rounded-full",
                        (sequence === "connecting" && activePersona === "ABBEY") && "animate-pulse"
                      )}
                      style={{ color: theme.hex }}
                    />
                    <div className="flex gap-3">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <motion.div
                          key={i}
                          animate={{
                            height: (sequence === "connecting" && activePersona === "ABBEY") ? [24, 80, 24] : [24, 60, 24],
                            opacity: [0.3, 1, 0.3],
                          }}
                          transition={{
                            repeat: Infinity,
                            duration: 1.2,
                            delay: i * 0.15,
                            ease: "easeInOut",
                          }}
                          className={cn(
                            "w-1 bg-accent shadow-[0_0_15px_var(--accent)]",
                            (sequence === "connecting" && activePersona === "ABBEY") && "w-2 !bg-white shadow-[0_0_20px_white]"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <span className="technical-label text-accent animate-pulse tracking-[0.3em]">
                      Synching_Neural_Backtrace...
                    </span>
                    <span className="micro-label opacity-30">
                      Attempting hand-shake with US-West-2...
                    </span>
                  </div>

                  <div className="w-64 space-y-1 font-mono text-[7px] text-accent/40 uppercase">
                    <div className="flex justify-between">
                      <span>&gt; handshake_protocol</span>{" "}
                      <span className="text-white">active</span>
                    </div>
                    <div className="flex justify-between">
                      <span>&gt; metadata_integrity</span>{" "}
                      <span className="text-white">verified</span>
                    </div>
                    <div className="flex justify-between">
                      <span>&gt; wdbx_cortex_uplink</span>{" "}
                      <span className="text-white">established</span>
                    </div>
                    <div className="flex justify-between">
                      <span>&gt; ethical_sync_v4</span>{" "}
                      <span className="text-white">pending...</span>
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="absolute bottom-12 text-center flex flex-col gap-2">
                <p className="micro-label opacity-30 tracking-[0.3em]">
                  MLAI INTEGRATED CORE SECTOR 7-B
                </p>
                <div className="flex items-center justify-center gap-4 opacity-10">
                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className={cn(
          `fixed inset-0 overflow-hidden transition-all duration-1000 theme-${activePersona} selection:bg-accent selection:text-white`,
          activePersona === "AVIVA"
            ? "bg-[#0b0614]"
            : activePersona === "ABI"
              ? "bg-[#120b04]"
              : "bg-[#060b14]",
        )}
        style={
          {
            "--accent": theme.hex,
            "--color-accent": theme.hex,
            "--color-accent-light":
              activePersona === "AVIVA"
                ? "#e59bff"
                : activePersona === "ABI"
                  ? "#ffd280"
                  : "#80d4ff",
          } as any
        }
      >
        <div
          className={cn(
            "grain-overlay pointer-events-none transition-opacity duration-1000",
            activePersona === "AVIVA"
              ? "opacity-[0.05] blend-overlay"
              : "opacity-[0.02]",
          )}
        />
        <div className="scanlines opacity-50" />
        <div
          className={cn(
            "fixed inset-0 bg-grid pointer-events-none transition-opacity duration-1000",
            activePersona === "ABBEY" ? "opacity-30" : "opacity-15",
          )}
        />
        
        {activePersona === "ABBEY" && (
          <div className="absolute inset-x-0 top-0 overflow-hidden h-40 pointer-events-none opacity-20">
            <motion.div 
               animate={{ y: [0, -100] }}
               transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
               className="flex flex-col gap-1 p-4"
            >
              {[...Array(20)].map((_, i) => (
                <div key={i} className="h-[1px] w-full bg-accent/20" />
              ))}
            </motion.div>
          </div>
        )}

        {activePersona === "AVIVA" && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ x: "-100%", opacity: 0 }}
                animate={{ 
                  x: ["100%", "-100%"],
                  opacity: [0, 0.2, 0],
                  top: [`${Math.random() * 100}%`, `${Math.random() * 100}%`] 
                }}
                transition={{ 
                  duration: 0.2 + Math.random() * 0.5, 
                  repeat: Infinity, 
                  repeatDelay: 2 + Math.random() * 5,
                  delay: i * 1.2
                }}
                className="absolute h-px w-full bg-accent/40 shadow-[0_0_8px_var(--color-accent)]"
              />
            ))}
          </div>
        )}

        {activePersona === "ABI" && (
          <div className="absolute inset-0 pointer-events-none border-[20px] border-accent/5 overflow-hidden">
             <div className="absolute top-0 left-0 w-32 h-32 border-l border-t border-accent/20" />
             <div className="absolute top-0 right-0 w-32 h-32 border-r border-t border-accent/20" />
             <div className="absolute bottom-0 left-0 w-32 h-32 border-l border-b border-accent/20" />
             <div className="absolute bottom-0 right-0 w-32 h-32 border-r border-b border-accent/20" />
          </div>
        )}

        <canvas ref={canvasRef} className="w-full h-full block touch-none mix-blend-screen opacity-90 transition-opacity duration-1000" />

        {/* System Status Bar */}
        <div className="fixed top-0 left-0 right-0 z-[60] h-10 flex items-center justify-between px-6 border-b border-white/10 bg-black/60 backdrop-blur-md pointer-events-none">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-start">
                <span className="text-[10px] font-bold text-white tracking-[0.4em]">
                  MLAI
                </span>
                <span
                  className={`text-[7px] font-mono leading-none ${theme.accentClass}`}
                >
                  CORP_INFRA
                </span>
              </div>
              <div className="w-[1px] h-6 bg-white/10" />
              <div className="flex items-center gap-2">
                <div className="flex bg-white/[0.02] p-1 rounded-full border border-white/[0.05] gap-1 pointer-events-auto backdrop-blur-md shadow-inner">
                  {Object.keys(PERSONAS).map((p, index) => {
                    const personaKey = p as keyof typeof PERSONAS;
                    const config = PERSONAS[personaKey];
                    const Icon = PERSONA_ICONS[p] || Shield;

                    return (
                      <button
                        key={p}
                        onClick={() => {
                          setActivePersona(p);
                          setIsAutoPersona(false);
                        }}
                        className={cn(
                          "group flex items-center gap-2 px-3 py-1.5 text-[10px] font-semibold tracking-wide transition-all duration-300 rounded-full border",
                          activePersona === p
                            ? `${config.bgClass} text-white border-white/30 shadow-[0_0_15px_rgba(255,255,255,0.1)]`
                            : "bg-white/[0.02] text-[#9aa4b2] border-transparent hover:bg-white/[0.06] hover:text-white",
                        )}
                        style={ activePersona === p ? { boxShadow: `0 0 15px ${config.hex}40` } : {} }
                      >
                        <Icon
                          className={cn(
                            "w-3 h-3 transition-transform duration-500",
                            activePersona === p ? config.animationClass : "opacity-60 group-hover:scale-110",
                          )}
                        />
                        {p}
                        <span className="text-[7px] font-mono opacity-40 ml-1 group-hover:opacity-100 transition-opacity">[{index + 1}]</span>
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setIsAutoPersona(!isAutoPersona)}
                  className={cn(
                    "px-3 py-1.5 text-[9px] font-bold tracking-[0.2em] transition-all duration-300 rounded-full border shadow-sm pointer-events-auto active:scale-95 ml-2",
                    isAutoPersona
                      ? "text-[#042024] bg-gradient-to-r from-accent to-[#6ee7cf] border-transparent shadow-[0_0_15px_var(--accent)]"
                      : "bg-white/[0.03] text-[#9aa4b2] border-white/[0.05] hover:bg-white/[0.08] hover:text-white hover:border-white/20",
                  )}
                >
                  AUTO
                </button>
              </div>
            </div>
            <div className="hidden lg:flex items-center gap-8 pointer-events-auto">
              <Tooltip
                text="NODE_IDENTIFIER / US_WEST_2"
                activePersona={activePersona}
              >
                <div className="flex flex-col cursor-help">
                  <span className="technical-label text-text-dim/40 leading-none">
                    Node_Identifier
                  </span>
                  <span className="technical-value text-[#e6eef6] tracking-tight font-medium drop-shadow-sm">
                    WDBX-US-W2-092
                  </span>
                </div>
              </Tooltip>
              <Tooltip
                text="CURRENT_PACKET_LATENCY"
                activePersona={activePersona}
              >
                <div className="flex flex-col cursor-help">
                  <span className="technical-label text-text-dim/40 leading-none">
                    Network_Latency
                  </span>
                  <span className="technical-value text-white">0.82ms</span>
                </div>
              </Tooltip>
              <Tooltip
                text="PACKET_LOSS_STABILITY"
                activePersona={activePersona}
              >
                <div className="flex flex-col cursor-help">
                  <span className="technical-label text-text-dim/40 leading-none">
                    Packet_Loss
                  </span>
                  <span className="technical-value text-white">0.00%</span>
                </div>
              </Tooltip>
              <Tooltip
                text="PERFORMANCE_FRAME_RATE"
                activePersona={activePersona}
              >
                <div className="flex flex-col cursor-help">
                  <span className="technical-label text-text-dim/40 leading-none">
                    Diagnostic_Hz
                  </span>
                  <span
                    className={cn("technical-value", theme.accentLightClass)}
                  >
                    {fps} FPS
                  </span>
                </div>
              </Tooltip>
              <div className="flex items-end gap-[2px] h-4 pb-[2px]">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <motion.div
                    key={i}
                    animate={{
                      height: [
                        `${Math.random() * 40 + 20}%`,
                        `${Math.random() * 60 + 40}%`,
                        `${Math.random() * 40 + 20}%`,
                      ],
                    }}
                    transition={{
                      duration: 0.5 + Math.random(),
                      repeat: Infinity,
                    }}
                    className="w-[2px] bg-accent/40"
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-8 pointer-events-auto">
            <div className="hidden lg:flex items-center gap-8">
              <div className="flex flex-col items-end">
                <span className="technical-label text-text-dim/40 leading-none">
                  Uptime_Metric
                </span>
                <span className="technical-value text-white">99.999%</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="technical-label text-text-dim/40 leading-none">
                  Diagnostic_FPS
                </span>
                <span
                  className={`technical-value ${fps < 30 ? "text-red-500" : "text-emerald-500"}`}
                >
                  {fps}_HZ
                </span>
              </div>
              <div className="w-[1px] h-3 bg-white/10" />
              <div className="flex flex-col items-end">
                <span className="technical-label text-text-dim/40 leading-none">
                  Encryption
                </span>
                <span className="technical-value text-white">AES-256-GCM</span>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-2 mb-1">
                {activePersona === "ABBEY" ? (
                  <motion.div
                    key="ABBEY-icon"
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 10 }}
                  >
                    <Shield className="w-3 h-3 text-accent animate-abbey" />
                  </motion.div>
                ) : activePersona === "AVIVA" ? (
                  <motion.div
                    key="AVIVA-icon"
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 10 }}
                  >
                    <FlaskConical className="w-3 h-3 text-accent animate-aviva" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="ABI-icon"
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 10 }}
                  >
                    <Scale className="w-3 h-3 text-accent animate-abi" />
                  </motion.div>
                )}
                <span className="technical-label text-text-dim/40 leading-none">
                  Active_Persona
                </span>
              </div>
              <span
                className={cn(
                  "technical-value font-bold uppercase tracking-widest",
                  theme.accentLightClass,
                )}
              >
                {activePersona}
              </span>
              <span className="text-[8px] font-mono uppercase tracking-[0.2em] text-[#cbd5e1] opacity-70 mt-1.5 mix-blend-screen flex items-center gap-1">
                {personaConfig.protocol}
                <span className="opacity-50">{autoSaveStatus !== 'saved' ? `[${autoSaveStatus}]` : '[saved]'}</span>
              </span>
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
                    <div
                      className={cn(
                        "inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-[10px] font-bold tracking-[0.2em] uppercase",
                        theme.accentLightClass,
                      )}
                    >
                      <span className="w-1 h-1 rounded-full bg-accent animate-pulse" />
                      MLAI Corporation • WDBX Engine v3.1
                    </div>
                    <h1
                      className={cn(
                        "font-display text-5xl md:text-7xl leading-[0.85] tracking-tight relative transition-all duration-500",
                        activePersona === "AVIVA"
                          ? "glitch-text text-accent [text-shadow:2px_0_10px_var(--accent)]"
                          : activePersona === "ABBEY"
                            ? "animate-pulse text-accent [text-shadow:0_0_25px_var(--accent)]"
                            : "animate-[pulse_2s_ease-in-out_infinite] text-accent [text-shadow:0_0_15px_var(--accent)] ring-1 ring-accent/20 rounded-lg p-2",
                      )}
                      data-text="Abbey-Aviva-Abi Multi-Persona AI"
                    >
                      <span
                        className={
                          activePersona === "ABI" ? "animate-pulse" : ""
                        }
                      >
                        Abbey-Aviva-Abi
                      </span>{" "}
                      <br />
                      <span className="italic transition-colors duration-500 text-accent/80">
                        Multi-Persona AI
                      </span>
                    </h1>
                  </div>

                  <p className="text-text-secondary text-lg leading-relaxed max-w-md font-light">
                    A pioneering approach in AI system design, integrating
                    specialized personas to balance ethical governance with
                    advanced computational capabilities. Powered by the Weighted
                    Directed Backtrace Neural Network (WDBX).
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
                      <div className="technical-label mt-1">
                        Active Personas
                      </div>
                    </div>
                    <div>
                      <div className="text-3xl font-display text-white">
                        10k
                      </div>
                      <div className="technical-label mt-1">
                        Req/Sec Throughput
                      </div>
                    </div>
                    <div>
                      <div className="text-3xl font-display text-white">
                        95%
                      </div>
                      <div className="technical-label mt-1">
                        Response Accuracy
                      </div>
                    </div>
                  </div>
                </div>

                <div className="hidden md:block relative aspect-square">
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-transparent rounded-3xl blur-3xl" />
                  <div className="relative h-full w-full rounded-3xl border border-white/10 overflow-hidden glass-card">
                    <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:40px_40px]" />
                    <div className="p-8 space-y-6">
                      <div className="flex justify-between items-center">
                        <div
                          className={cn(
                            "text-[10px] font-mono tracking-widest uppercase",
                            theme.accentLightClass,
                          )}
                        >
                          System_Status
                        </div>
                        <div className="text-[10px] font-mono text-text-dim uppercase">
                          v3.1.0-stable
                        </div>
                      </div>
                      <div className="space-y-4">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className="h-1 w-full bg-white/5 rounded-full overflow-hidden"
                          >
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.random() * 60 + 30}%` }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                repeatType: "reverse",
                                delay: i * 0.2,
                              }}
                              className="h-full bg-accent/40"
                            />
                          </div>
                        ))}
                      </div>
                      <div className="pt-4 font-mono text-[10px] text-text-dim leading-relaxed">
                        &gt; Initializing WDBX_ENGINE...
                        <br />
                        &gt; Loading Persona: ABBEY (Ethical)...
                        <br />
                        &gt; Loading Persona: AVIVA (Research)...
                        <br />
                        &gt; Loading Persona: ABI (Regulatory)...
                        <br />
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
        <div
          className={`fixed z-50 ${isCollapsed ? "top-6 right-6" : "inset-0 md:top-6 md:right-6 md:inset-auto"}`}
        >
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
                      type: "spring",
                      damping: 25,
                      stiffness: 200,
                    }}
                    className={`w-full h-full md:w-[320px] md:h-auto technical-panel md:rounded-none overflow-hidden flex flex-col border-white/20 transition-all duration-700 ${theme.bgClass}`}
                  >
                    <div className={`scanning-bar bg-accent/30`} />
                    {/* Corner Accents */}
                    <div
                      className={`corner-accent top-0 left-0 border-t-2 border-l-2 ${theme.borderClass}`}
                    />
                    <div
                      className={`corner-accent top-0 right-0 border-t-2 border-r-2 ${theme.borderClass}`}
                    />
                    <div
                      className={`corner-accent bottom-0 left-0 border-b-2 border-l-2 ${theme.borderClass}`}
                    />
                    <div
                      className={`corner-accent bottom-0 right-0 border-b-2 border-r-2 ${theme.borderClass}`}
                    />

                    {/* Header / Toggle */}
                    <div className="border-b border-white/10 bg-white/5 relative overflow-hidden">
                      {/* Persona Specific Glow */}
                      <div
                        className={`absolute top-0 right-0 w-32 h-32 blur-3xl opacity-20 -mr-16 -mt-16 pointer-events-none bg-accent`}
                      />

                      <button
                        onClick={() => setIsCollapsed(true)}
                        className="w-full flex items-center justify-between p-4 hover:bg-white/10 transition-colors group relative z-10"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-1.5 h-1.5 rounded-full animate-pulse bg-accent`}
                          />
                          <h2 className="technical-label text-white">
                            WDBX_Engine_Terminal_v3.1
                          </h2>
                        </div>
                        <span className="technical-value opacity-30 group-hover:opacity-100 transition-opacity">
                          [ ESC ]
                        </span>
                      </button>

                      <div className="flex px-4 pt-2 gap-6 overflow-x-auto scrollbar-none">
                        <Tooltip
                          text="BROWSE_LANDSCAPES"
                          activePersona={activePersona}
                        >
                          <motion.button
                            onClick={() => setActiveTab("landscape")}
                            className={cn(
                              "relative px-4 py-2 technical-label transition-all",
                              activeTab === "landscape" ? "text-white" : "text-text-dim hover:text-white",
                              activePersona === "ABBEY" && activeTab === "landscape" && "persona-glow",
                              activePersona === "ABI" && activeTab === "landscape" && "persona-outline"
                            )}
                          >
                            {activeTab === "landscape" && (
                              <motion.div
                                layoutId="activeTabIndicator"
                                className="absolute inset-0 bg-white/5 border border-white/20 rounded-md"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                              />
                            )}
                            <span className="relative z-10">Landscape</span>
                          </motion.button>
                        </Tooltip>
                        <Tooltip
                          text="SYSTEM_PARAMETERS"
                          activePersona={activePersona}
                        >
                          <motion.button
                            onClick={() => setActiveTab("controls")}
                            className={`relative px-4 py-2 technical-label transition-all ${activeTab === "controls" ? "text-white" : "text-text-dim hover:text-white"}`}
                          >
                            {activeTab === "controls" && (
                              <motion.div
                                layoutId="activeTabIndicator"
                                className="absolute inset-0 bg-white/5 border border-white/20 rounded-md"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                              />
                            )}
                            <span className="relative z-10">Controls</span>
                          </motion.button>
                        </Tooltip>
                        <Tooltip
                          text="SPATIAL_AWARENESS"
                          activePersona={activePersona}
                        >
                          <motion.button
                            onClick={() => setActiveTab("minimap")}
                            className={`relative px-4 py-2 technical-label transition-all ${activeTab === "minimap" ? "text-white" : "text-text-dim hover:text-white"}`}
                          >
                            {activeTab === "minimap" && (
                              <motion.div
                                layoutId="activeTabIndicator"
                                className="absolute inset-0 bg-white/5 border border-white/20 rounded-md"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                              />
                            )}
                            <span className="relative z-10">Scanner</span>
                          </motion.button>
                        </Tooltip>
                        <Tooltip
                          text="LIVE_SYSTEM_TELEMETRY"
                          activePersona={activePersona}
                        >
                          <motion.button
                            onClick={() => setActiveTab("telemetry")}
                            className={`relative px-4 py-2 technical-label transition-all ${activeTab === "telemetry" ? "text-white" : "text-text-dim hover:text-white"}`}
                          >
                            {activeTab === "telemetry" && (
                              <motion.div
                                layoutId="activeTabIndicator"
                                className="absolute inset-0 bg-white/5 border border-white/20 rounded-md"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                              />
                            )}
                            <span className="relative z-10">Telemetry</span>
                          </motion.button>
                        </Tooltip>
                        <Tooltip
                          text="MLAI_CORPORATION_BRAND"
                          activePersona={activePersona}
                        >
                          <motion.button
                            onClick={() => setActiveTab("brand")}
                            className={`relative px-4 py-2 technical-label transition-all ${activeTab === "brand" ? "text-white" : "text-text-dim hover:text-white"}`}
                          >
                            {activeTab === "brand" && (
                              <motion.div
                                layoutId="activeTabIndicator"
                                className="absolute inset-0 bg-white/5 border border-white/20 rounded-md"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                              />
                            )}
                            <span className="relative z-10">Brand</span>
                          </motion.button>
                        </Tooltip>
                        <Tooltip
                          text="ABI_MULTI_PERSONA_FRAMEWORK"
                          activePersona={activePersona}
                        >
                          <motion.button
                            onClick={() => setActiveTab("framework")}
                            className={`relative px-4 py-2 technical-label transition-all ${activeTab === "framework" ? "text-white" : "text-text-dim hover:text-white"}`}
                          >
                            {activeTab === "framework" && (
                              <motion.div
                                layoutId="activeTabIndicator"
                                className="absolute inset-0 bg-white/5 border border-white/20 rounded-md"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                              />
                            )}
                            <span className="relative z-10">Framework</span>
                          </motion.button>
                        </Tooltip>
                        <Tooltip
                          text="WDBX_VECTOR_ENGINE_BENCHMARKS"
                          activePersona={activePersona}
                        >
                          <motion.button
                            onClick={() => setActiveTab("benchmarks")}
                            className={`relative px-4 py-2 technical-label transition-all ${activeTab === "benchmarks" ? "text-white" : "text-text-dim hover:text-white"}`}
                          >
                            {activeTab === "benchmarks" && (
                              <motion.div
                                layoutId="activeTabIndicator"
                                className="absolute inset-0 bg-white/5 border border-white/20 rounded-md"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                              />
                            )}
                            <span className="relative z-10">Benchmarks</span>
                          </motion.button>
                        </Tooltip>
                        <Tooltip
                          text="ABBEY_PERSONA"
                          activePersona={activePersona}
                        >
                          <motion.button
                            onClick={() => setActiveTab("abbey")}
                            className={`relative px-4 py-2 technical-label transition-all ${activeTab === "abbey" ? "text-white" : "text-text-dim hover:text-white"}`}
                          >
                            {activeTab === "abbey" && (
                              <motion.div
                                layoutId="activeTabIndicator"
                                className="absolute inset-0 bg-white/5 border border-white/20 rounded-md"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                              />
                            )}
                            <span className="relative z-10">Abbey</span>
                          </motion.button>
                        </Tooltip>
                        <Tooltip
                          text="HISTORICAL_DATA_LOGS"
                          activePersona={activePersona}
                        >
                          <motion.button
                            onClick={() => setActiveTab("archive")}
                            className={`relative px-4 py-2 technical-label transition-all ${activeTab === "archive" ? "text-white" : "text-text-dim hover:text-white"}`}
                          >
                            {activeTab === "archive" && (
                              <motion.div
                                layoutId="activeTabIndicator"
                                className="absolute inset-0 bg-white/5 border border-white/20 rounded-md"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                              />
                            )}
                            <span className="relative z-10">Archive</span>
                          </motion.button>
                        </Tooltip>
                        <Tooltip
                          text="CREATOR_PORTFOLIO"
                          activePersona={activePersona}
                        >
                          <motion.button
                            onClick={() => setActiveTab("portfolio")}
                            className={`relative px-4 py-2 technical-label transition-all ${activeTab === "portfolio" ? "text-white" : "text-text-dim hover:text-white"}`}
                          >
                            {activeTab === "portfolio" && (
                              <motion.div
                                layoutId="activeTabIndicator"
                                className="absolute inset-0 bg-white/5 border border-white/20 rounded-md"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                              />
                            )}
                            <span className="relative z-10">Portfolio</span>
                          </motion.button>
                        </Tooltip>
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
                          {activeTab === "controls" && (
                            <div className="space-y-6 pt-6">
                              {/* Pause Toggle */}
                              <div className="flex items-center justify-between">
                                <span className="technical-label">
                                  Auto-Rotation
                                </span>
                                <button
                                  onClick={() => setIsPaused(!isPaused)}
                                  className={`px-3 py-1 rounded-md technical-label transition-all ${isPaused ? "bg-white/5 text-text-dim border border-white/5" : "bg-accent/20 text-accent-light border border-accent/40"}`}
                                >
                                  {isPaused ? "Paused" : "Active"}
                                </button>
                              </div>

                              {/* Speed Control */}
                              <div className="space-y-3">
                                <div className="flex justify-between">
                                  <span className="technical-label">
                                    Temporal Speed
                                  </span>
                                  <span className="technical-value">
                                    {speed.toFixed(2)}x
                                  </span>
                                </div>
                                <input
                                  type="range"
                                  min="0"
                                  max="2"
                                  step="0.01"
                                  value={speed}
                                  onChange={(e) =>
                                    setSpeed(parseFloat(e.target.value))
                                  }
                                  className="w-full"
                                />
                              </div>

                              {/* Lighting Control */}
                              <div className="space-y-3">
                                <div className="flex justify-between">
                                  <Tooltip
                                    text="ADJUST_GLOBAL_ILLUMINATION"
                                    activePersona={activePersona}
                                  >
                                    <span className="technical-label cursor-help border-b border-dotted border-white/20">
                                      Luminance
                                    </span>
                                  </Tooltip>
                                  <span className="technical-value">
                                    {lighting.toFixed(2)}x
                                  </span>
                                </div>
                                <input
                                  type="range"
                                  min="0"
                                  max="2"
                                  step="0.01"
                                  value={lighting}
                                  onChange={(e) =>
                                    setLighting(parseFloat(e.target.value))
                                  }
                                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
                                />
                              </div>

                              {/* Persona Effect Controls */}
                              <div className="space-y-4 pt-4 border-t border-white/5">
                                <span className="technical-label text-[10px] opacity-50">PERSONA_EFFECTS</span>
                                
                                {/* Abbey Pulse */}
                                <div className="space-y-2">
                                  <div className="flex justify-between text-[10px]">
                                    <span className="technical-label">Abbey Pulse Intensity</span>
                                    <span className="technical-value">{abbeyPulse.toFixed(2)}x</span>
                                  </div>
                                  <input type="range" min="0" max="2" step="0.01" value={abbeyPulse} onChange={(e) => setAbbeyPulse(parseFloat(e.target.value))} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent" />
                                </div>
                                
                                {/* Aviva Glitch */}
                                <div className="space-y-2">
                                  <div className="flex justify-between text-[10px]">
                                    <span className="technical-label">Aviva Glitch</span>
                                    <span className="technical-value">{avivaGlitch.toFixed(2)}</span>
                                  </div>
                                  <input type="range" min="0" max="1" step="0.01" value={avivaGlitch} onChange={(e) => setAvivaGlitch(parseFloat(e.target.value))} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent" />
                                </div>
                                
                                {/* Abi Flicker */}
                                <div className="space-y-2">
                                  <div className="flex justify-between text-[10px]">
                                    <span className="technical-label">Abi Flicker</span>
                                    <span className="technical-value">{abiFlicker.toFixed(2)}</span>
                                  </div>
                                  <input type="range" min="0" max="2" step="0.01" value={abiFlicker} onChange={(e) => setAbiFlicker(parseFloat(e.target.value))} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent" />
                                </div>
                              </div>

                              {/* Zoom Control */}
                              <div className="space-y-3">
                                <div className="flex justify-between">
                                  <Tooltip
                                    text="ADJUST_MAGNIFICATION_LEVEL"
                                    activePersona={activePersona}
                                  >
                                    <span className="technical-label cursor-help border-b border-dotted border-white/20">
                                      Focal Zoom
                                    </span>
                                  </Tooltip>
                                  <span className="technical-value">
                                    {zoom.toFixed(2)}
                                  </span>
                                </div>
                                <input
                                  type="range"
                                  min="0.5"
                                  max="8"
                                  step="0.01"
                                  value={zoom}
                                  onChange={(e) =>
                                    setZoom(parseFloat(e.target.value))
                                  }
                                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
                                />
                                <div className="flex gap-2">
                                  <Tooltip
                                    text="STEP_DECREASE [-]"
                                    activePersona={activePersona}
                                  >
                                    <button
                                      onClick={() =>
                                        setZoom((prev) =>
                                          Math.max(0.5, prev - 0.1),
                                        )
                                      }
                                      className="flex-1 py-1.5 technical-panel bg-white/5 border-white/10 hover:bg-white/10 text-[9px] text-text-dim uppercase tracking-widest"
                                    >
                                      DECR [-]
                                    </button>
                                  </Tooltip>
                                  <Tooltip
                                    text="STEP_INCREASE [+]"
                                    activePersona={activePersona}
                                  >
                                    <button
                                      onClick={() =>
                                        setZoom((prev) =>
                                          Math.min(8.0, prev + 0.1),
                                        )
                                      }
                                      className="flex-1 py-1.5 technical-panel bg-white/5 border-white/10 hover:bg-white/10 text-[9px] text-text-dim uppercase tracking-widest"
                                    >
                                      INCR [+]
                                    </button>
                                  </Tooltip>
                                </div>
                              </div>

                              <Tooltip
                                text="RESTORE_DEFAULT_COORDINATES"
                                activePersona={activePersona}
                              >
                                <button
                                  onClick={resetNavigation}
                                  className={`w-full py-3 technical-panel bg-white/5 border-white/10 hover:border-white/40 text-[10px] uppercase tracking-[0.2em] transition-all ${theme.accentClass}`}
                                >
                                  [ Execute_Resync_Sequence ]
                                </button>
                              </Tooltip>

                              {/* Proximity Control */}
                              <div className="space-y-3">
                                <div className="flex justify-between">
                                  <Tooltip
                                    text="ADJUST_NEURAL_SURFACE_PROXIMITY"
                                    activePersona={activePersona}
                                  >
                                    <span className="technical-label cursor-help border-b border-dotted border-white/20">
                                      Proximity
                                    </span>
                                  </Tooltip>
                                  <span className="technical-value">
                                    {proximity.toFixed(2)}
                                  </span>
                                </div>
                                <input
                                  type="range"
                                  min="-2.5"
                                  max="0.5"
                                  step="0.01"
                                  value={proximity}
                                  onChange={(e) =>
                                    setProximity(parseFloat(e.target.value))
                                  }
                                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
                                />
                              </div>

                              {/* Wind Control */}
                              <div className="space-y-3">
                                <div className="flex justify-between">
                                  <Tooltip
                                    text="SIMULATE_ATMOSPHERIC_TURBULENCE"
                                    activePersona={activePersona}
                                  >
                                    <span className="technical-label cursor-help border-b border-dotted border-white/20">
                                      Wind Intensity
                                    </span>
                                  </Tooltip>
                                  <span className="technical-value">
                                    {wind.toFixed(2)}x
                                  </span>
                                </div>
                                <input
                                  type="range"
                                  min="0"
                                  max="5"
                                  step="0.01"
                                  value={wind}
                                  onChange={(e) =>
                                    setWind(parseFloat(e.target.value))
                                  }
                                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
                                />
                              </div>

                              {/* Persona VFX Controls */}
                              <div className="pt-4 border-t border-white/10 space-y-6">
                                <span
                                  className={cn(
                                    "technical-label",
                                    theme.accentClass,
                                  )}
                                >
                                  Persona Diagnostics
                                </span>

                                {/* Abbey Pulse */}
                                <div className="space-y-3">
                                  <div className="flex justify-between">
                                    <Tooltip
                                      text="ADJUST_ETHICAL_MONITOR_PULSE"
                                      activePersona={activePersona}
                                    >
                                      <span className="technical-label text-cyan-400 cursor-help border-b border-dotted border-white/20">
                                        Abbey Pulse Intensity
                                      </span>
                                    </Tooltip>
                                    <span className="technical-value">
                                      {abbeyPulse.toFixed(2)}x
                                    </span>
                                  </div>
                                  <input
                                    type="range"
                                    min="0"
                                    max="3"
                                    step="0.01"
                                    value={abbeyPulse}
                                    onChange={(e) =>
                                      setAbbeyPulse(parseFloat(e.target.value))
                                    }
                                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                                  />
                                </div>

                                {/* Aviva Glitch */}
                                <div className="space-y-3">
                                  <div className="flex justify-between">
                                    <Tooltip
                                      text="ADJUST_NEURAL_INSTABILITY"
                                      activePersona={activePersona}
                                    >
                                      <span className="technical-label text-purple-400 cursor-help border-b border-dotted border-white/20">
                                        Aviva Glitch
                                      </span>
                                    </Tooltip>
                                    <span className="technical-value">
                                      {avivaGlitch.toFixed(2)}x
                                    </span>
                                  </div>
                                  <input
                                    type="range"
                                    min="0"
                                    max="2"
                                    step="0.01"
                                    value={avivaGlitch}
                                    onChange={(e) =>
                                      setAvivaGlitch(parseFloat(e.target.value))
                                    }
                                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-400"
                                  />
                                </div>

                                {/* Abi Flicker */}
                                <div className="space-y-3">
                                  <div className="flex justify-between">
                                    <Tooltip
                                      text="ADJUST_REGULATORY_INTERFERENCE"
                                      activePersona={activePersona}
                                    >
                                      <span className="technical-label text-amber-500 cursor-help border-b border-dotted border-white/20">
                                        Abi Flicker
                                      </span>
                                    </Tooltip>
                                    <span className="technical-value">
                                      {abiFlicker.toFixed(2)}x
                                    </span>
                                  </div>
                                  <input
                                    type="range"
                                    min="0"
                                    max="3"
                                    step="0.01"
                                    value={abiFlicker}
                                    onChange={(e) =>
                                      setAbiFlicker(parseFloat(e.target.value))
                                    }
                                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-500"
                                  />
                                </div>
                              </div>

                              {/* Yaw Control */}
                              <div className="space-y-3">
                                <div className="flex justify-between">
                                  <Tooltip
                                    text="ROTATION_ON_HORIZONTAL_AXIS"
                                    activePersona={activePersona}
                                  >
                                    <span className="technical-label cursor-help border-b border-dotted border-white/20">
                                      Horizontal Axis
                                    </span>
                                  </Tooltip>
                                  <span className="technical-value">
                                    {(yaw * (180 / Math.PI)).toFixed(0)}°
                                  </span>
                                </div>
                                <input
                                  type="range"
                                  min={-Math.PI}
                                  max={Math.PI}
                                  step="0.01"
                                  value={yaw}
                                  onChange={(e) =>
                                    setYaw(parseFloat(e.target.value))
                                  }
                                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
                                />
                              </div>

                              {/* Pitch Control */}
                              <div className="space-y-3">
                                <div className="flex justify-between">
                                  <Tooltip
                                    text="ROTATION_ON_VERTICAL_AXIS"
                                    activePersona={activePersona}
                                  >
                                    <span className="technical-label cursor-help border-b border-dotted border-white/20">
                                      Vertical Axis
                                    </span>
                                  </Tooltip>
                                  <span className="technical-value">
                                    {(pitch * (180 / Math.PI)).toFixed(0)}°
                                  </span>
                                </div>
                                <input
                                  type="range"
                                  min={-Math.PI / 2}
                                  max={Math.PI / 2}
                                  step="0.01"
                                  value={pitch}
                                  onChange={(e) =>
                                    setPitch(parseFloat(e.target.value))
                                  }
                                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
                                />
                              </div>

                              {/* Color Mode Control */}
                              <div className="space-y-3">
                                <Tooltip
                                  text="SELECT_ENVIRONMENT_ATMOSPHERE"
                                  activePersona={activePersona}
                                >
                                  <span className="technical-label cursor-help border-b border-dotted border-white/20">
                                    Atmospheric Hue
                                  </span>
                                </Tooltip>
                                <div className="grid grid-cols-4 gap-2">
                                  {Object.keys(colors).map((mode) => (
                                    <Tooltip
                                      key={mode}
                                      text={`ACTIVATE_${mode.toUpperCase()}_SPECTRAL_RANGE`}
                                      activePersona={activePersona}
                                    >
                                      <button
                                        onClick={() => setColorMode(mode)}
                                        className={`h-8 w-full rounded-md border transition-all ${
                                          colorMode === mode
                                            ? "border-accent ring-1 ring-accent/20"
                                            : "border-white/5 hover:border-white/20"
                                        }`}
                                        style={{
                                          backgroundColor: `rgb(${(colors as any)[mode][0] * 255}, ${(colors as any)[mode][1] * 255}, ${(colors as any)[mode][2] * 255}, 0.2)`,
                                        }}
                                      />
                                    </Tooltip>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                          {activeTab === "landscape" && (
                            <div className="grid grid-cols-1 gap-4 pt-6">
                              <input
                                type="text"
                                placeholder="Search infrastructure nodes..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 p-2 text-white text-xs font-mono placeholder:text-white/20 focus:border-accent outline-none"
                              />
                              {landscapes
                                .filter((l) => l.name.toLowerCase().includes(searchTerm.toLowerCase()))
                                .map((landscape) => (
                                  <button
                                    key={landscape.id}
                                    onClick={() => applyLandscape(landscape)}
                                    className="w-full text-left group overflow-hidden"
                                  >
                                  <div className="relative aspect-[21/9] w-full rounded-none overflow-hidden border border-white/10 bg-black/40 card-hover flex">
                                    <div className="w-1/3 h-full overflow-hidden border-r border-white/5 relative">
                                      <img
                                        src={landscape.image}
                                        alt={landscape.name}
                                        className="w-full h-full object-cover grayscale opacity-50 group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-700 scale-110 group-hover:scale-100"
                                        referrerPolicy="no-referrer"
                                      />
                                      <div className="absolute inset-0 bg-accent/10 opacity-0 group-hover:opacity-20 transition-opacity" />
                                    </div>
                                    <div className="flex-1 p-4 flex flex-col justify-between bg-black/20">
                                      <div className="flex justify-between items-start">
                                        <h3
                                          className={cn(
                                            "technical-label text-white text-[11px] transition-colors",
                                            theme.accentLightClass.replace(
                                              "text-",
                                              "group-hover:text-",
                                            ),
                                          )}
                                        >
                                          {landscape.name}
                                        </h3>
                                        <span className="technical-label text-[8px] opacity-20 font-light tracking-widest">
                                          REF_{landscape.id.toUpperCase()}_0X
                                        </span>
                                      </div>
                                      <div className="space-y-1">
                                        <div className="flex gap-1 mb-2">
                                          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                            <div
                                              key={i}
                                              className={`w-3 h-0.5 ${i <= 3 ? "bg-accent/60" : "bg-white/5"}`}
                                            />
                                          ))}
                                        </div>
                                        <Tooltip
                                          text={`LOAD_SEQUENCE_${landscape.id.toUpperCase()}`}
                                          activePersona={activePersona}
                                        >
                                          <span className="technical-label text-accent font-bold tracking-[0.2em] group-hover:animate-pulse">
                                            [ EXECUTE_SEQUENCE ]
                                          </span>
                                        </Tooltip>
                                      </div>
                                    </div>
                                    {/* Geometric scanning decoration */}
                                    <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none opacity-20 group-hover:opacity-100 transition-opacity">
                                      <div className="absolute top-2 right-2 w-1.5 h-1.5 border-t border-r border-accent" />
                                    </div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}

                          {activeTab === "minimap" && (
                            <div className="pt-6 space-y-8">
                              {/* Radar Visualization */}
                              <div className="relative aspect-square w-full bg-white/[0.02] rounded-2xl border border-white/5 flex items-center justify-center overflow-hidden">
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{
                                    duration: 4,
                                    repeat: Infinity,
                                    ease: "linear",
                                  }}
                                  className="absolute inset-0 bg-gradient-to-r from-accent/20 to-transparent origin-center pointer-events-none"
                                  style={{
                                    clipPath:
                                      "polygon(50% 50%, 100% 0, 100% 100%)",
                                  }}
                                />
                                <div
                                  className="absolute inset-0 opacity-5"
                                  style={{
                                    backgroundImage:
                                      "radial-gradient(circle, white 1px, transparent 1px)",
                                    backgroundSize: "32px 32px",
                                  }}
                                />
                                {[1, 2, 3].map((i) => (
                                  <div
                                    key={i}
                                    className="absolute rounded-full border border-white/5"
                                    style={{
                                      width: `${i * 33}%`,
                                      height: `${i * 33}%`,
                                    }}
                                  />
                                ))}
                                <div className="relative w-48 h-48">
                                  <div className="absolute inset-0 rounded-full border border-white/10 bg-white/[0.02] shadow-[inset_0_0_40px_rgba(255,255,255,0.02)]" />
                                  <div className="absolute inset-0 rounded-full border border-white/5 scale-90 rotate-45" />
                                  <div className="absolute inset-0 rounded-full border border-white/5 scale-90 -rotate-45" />
                                  {renderMode === 0 ? (
                                    (() => {
                                      const r = 96;
                                      let x = 0,
                                        y = 0,
                                        z = -1;
                                      const cosP = Math.cos(pitch),
                                        sinP = Math.sin(pitch);
                                      const py = y * cosP - z * sinP,
                                        pz = y * sinP + z * cosP;
                                      y = py;
                                      z = pz;
                                      const cosY = Math.cos(yaw),
                                        sinY = Math.sin(yaw);
                                      const yx = x * cosY - z * sinY,
                                        yz = x * sinY + z * cosY;
                                      x = yx;
                                      z = yz;
                                      const screenX = 96 + x * r,
                                        screenY = 96 + y * r;
                                      const opacity = z > 0 ? 1 : 0.2,
                                        scale = 1 + z * 0.4;
                                      return (
                                        <div
                                          className="absolute w-2.5 h-2.5 bg-accent rounded-full shadow-[0_0_20px_rgba(59,130,246,0.8)] transition-all duration-100"
                                          style={{
                                            left: `${screenX}px`,
                                            top: `${screenY}px`,
                                            transform: `translate(-50%, -50%) scale(${scale})`,
                                            opacity: opacity,
                                            zIndex: z > 0 ? 10 : 0,
                                          }}
                                        />
                                      );
                                    })()
                                  ) : (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <div className="w-32 h-32 relative">
                                        {[1, 2, 3].map((i) => (
                                          <motion.div
                                            key={i}
                                            animate={{
                                              scale: [1, 1.2, 1],
                                              opacity: [0.3, 0.1, 0.3],
                                            }}
                                            transition={{
                                              duration: 2,
                                              delay: i * 0.5,
                                              repeat: Infinity,
                                            }}
                                            className="absolute inset-0 border border-accent rounded-full"
                                          />
                                        ))}
                                        <div className="absolute inset-0 flex items-center justify-center">
                                          <span
                                            className={cn(
                                              "technical-label animate-pulse",
                                              theme.accentLightClass,
                                            )}
                                          >
                                            NEURAL_DEEP_SYNC
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-white/40 rounded-full blur-[1px]" />
                                </div>
                              </div>

                              <div className="space-y-4">
                                <div className="flex justify-between">
                                  <span className="technical-label">
                                    Vector_Coordinates
                                  </span>
                                  <span
                                    className={cn(
                                      "technical-label",
                                      theme.accentLightClass,
                                    )}
                                  >
                                    Live_Feed
                                  </span>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5">
                                    <span className="technical-label text-text-dim/50 block mb-1">
                                      AZIMUTH
                                    </span>
                                    <span className="technical-value">
                                      {(yaw * (180 / Math.PI)).toFixed(1)}°
                                    </span>
                                  </div>
                                  <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5">
                                    <span className="technical-label text-text-dim/50 block mb-1">
                                      ELEVATION
                                    </span>
                                    <span className="technical-value">
                                      {(pitch * (180 / Math.PI)).toFixed(1)}°
                                    </span>
                                  </div>
                                  <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5">
                                    <span className="technical-label text-text-dim/50 block mb-1">
                                      PROXIMITY
                                    </span>
                                    <span className="technical-value">
                                      {Math.abs(proximity).toFixed(2)}u
                                    </span>
                                  </div>
                                  <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5">
                                    <span className="technical-label text-text-dim/50 block mb-1">
                                      MAGNIFICATION
                                    </span>
                                    <span className="technical-value">
                                      {zoom.toFixed(2)}x
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {activeTab === "telemetry" && (
                            <div className="pt-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-white/5 border border-white/10 industrial-border space-y-4">
                                  <div className="flex items-center justify-between">
                                    <span className="technical-label opacity-40">
                                      Neural_Load
                                    </span>
                                    <span
                                      className={cn(
                                        "technical-value",
                                        theme.accentClass,
                                      )}
                                    >
                                      {(80 + Math.random() * 5).toFixed(1)}%
                                    </span>
                                  </div>
                                  <div className="h-32 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                      <LineChart
                                        data={telemetryData}
                                      >
                                        <Line
                                          type="monotone"
                                          dataKey="value"
                                          stroke={theme.hex}
                                          strokeWidth={2}
                                          dot={false}
                                          isAnimationActive={false}
                                        />
                                      </LineChart>
                                    </ResponsiveContainer>
                                  </div>
                                </div>
                                <div className="p-4 bg-white/5 border border-white/10 industrial-border space-y-4">
                                  <div className="flex items-center justify-between">
                                    <span className="technical-label opacity-40">
                                      Signal_Stability
                                    </span>
                                    <span
                                      className={`technical-value ${theme.accentClass}`}
                                    >
                                      99.9{Math.floor(Math.random() * 10)}%
                                    </span>
                                  </div>
                                  <div className="h-32 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                      <BarChart
                                        data={Array.from({ length: 15 }).map((_, i) => ({
                                          v: 80 + Math.random() * 20,
                                        }))}
                                      >
                                        <Bar dataKey="v" fill={theme.hex} />
                                      </BarChart>
                                    </ResponsiveContainer>
                                  </div>
                                </div>
                              </div>

                              <div className="p-4 bg-white/5 border border-white/10 industrial-border space-y-4">
                                <div className="flex items-center justify-between">
                                  <h3 className="technical-label text-white">
                                    Consensus_Integrity
                                  </h3>
                                  <span
                                    className={`technical-label ${theme.accentClass}`}
                                  >
                                    Verified
                                  </span>
                                </div>
                                <div className="grid grid-cols-1 gap-2 h-24">
                                  <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                      layout="vertical"
                                      data={[
                                        { name: 'Layer 1', v: 100 },
                                        { name: 'Layer 2', v: 60 },
                                        { name: 'Layer 3', v: 40 },
                                      ]}
                                    >
                                      <XAxis type="number" hide />
                                      <YAxis dataKey="name" type="category" hide />
                                      <Bar dataKey="v" fill={theme.hex.replace("text-", "bg-")} />
                                    </BarChart>
                                  </ResponsiveContainer>
                                </div>
                              </div>

                              <div className="p-4 bg-white/5 border border-white/10 industrial-border">
                                <div className="flex items-center justify-between mb-4">
                                  <h3 className="technical-label text-white">
                                    Cross_Persona_Mediation
                                  </h3>
                                  <div className="flex gap-2">
                                    {Object.keys(PERSONAS).map((p) => (
                                      <div
                                        key={p}
                                        className={cn(
                                          "w-2 h-2 rounded-full",
                                          activePersona === p
                                            ? "bg-accent animate-pulse"
                                            : "bg-white/10",
                                        )}
                                      />
                                    ))}
                                  </div>
                                </div>
                                <div className="space-y-3 font-mono text-[9px] leading-relaxed opacity-60">
                                  <div className="flex justify-between">
                                    <span>MED_SYN_THROUGHPUT:</span>
                                    <span className="text-white">
                                      1.024 TB/S
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>CORE_TEMP_STATUS:</span>
                                    <span className="text-white text-green-400">
                                      OPTIMAL (42°C)
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>THREAT_LEVEL:</span>
                                    <span className="text-white uppercase">
                                      NEGLIGIBLE
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {activeTab === "brand" && <BrandTab theme={theme} />}
                          {activeTab === "framework" && <FrameworkTab theme={theme} />}
                          {activeTab === "benchmarks" && <BenchmarksTab theme={theme} />}
                          {activeTab === "abbey" && <AbbeyTab theme={theme} />}
                          {activeTab === "archive" && (
                            <div className="pt-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="technical-label">
                                  Memory_Dump_Sequence
                                </h3>
                                <div className="flex gap-2">
                                  <span className="micro-label opacity-40">
                                    STORAGE: 82%
                                  </span>
                                  <span className="micro-label text-accent font-bold">
                                    READY
                                  </span>
                                </div>
                              </div>
                              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {[
                                  {
                                    date: "2026.04.12",
                                    title: "Neural_Synthesis_V4_Release",
                                    status: "SUCCESS",
                                    type: "CORE",
                                  },
                                  {
                                    date: "2026.03.28",
                                    title: "Abbey_Ethical_Guardrails_Patch",
                                    status: "FAILURE",
                                    type: "PATCH",
                                  },
                                  {
                                    date: "2026.03.15",
                                    title: "WDBX_Memory_Uplink_Upgrade",
                                    status: "SUCCESS",
                                    type: "HARDWARE",
                                  },
                                  {
                                    date: "2026.02.10",
                                    title: "Aviva_Experimental_Buffer_A",
                                    status: "SUCCESS",
                                    type: "LABS",
                                  },
                                  {
                                    date: "2026.01.05",
                                    title: "Original_Handshake_Established",
                                    status: "SUCCESS",
                                    type: "CORE",
                                  },
                                  {
                                    date: "2025.11.22",
                                    title: "Conceptual_Phase_Bravo",
                                    status: "SUCCESS",
                                    type: "PLAN",
                                  },
                                  {
                                    date: "2025.09.11",
                                    title: "Sector_7_Foundation_Protocol",
                                    status: "SUCCESS",
                                    type: "CORE",
                                  },
                                ].map((log, i) => (
                                  <div
                                    key={i}
                                    className="group p-4 bg-white/[0.02] border border-white/5 hover:border-accent/40 transition-all flex items-center justify-between"
                                  >
                                    <div className="flex items-center gap-4">
                                      <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center technical-label text-[10px] opacity-40">
                                        {i + 1}
                                      </div>
                                      <div className="flex flex-col">
                                        <span className="technical-value text-white text-xs">
                                          {log.title}
                                        </span>
                                        <div className="flex gap-2 items-center">
                                          <span className="micro-label opacity-40">
                                            {log.date}
                                          </span>
                                          <span
                                            className={cn(
                                              "micro-label px-1 bg-accent/10",
                                              theme.accentLightClass,
                                            )}
                                          >
                                            {log.type}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <span
                                        className={cn(
                                          "technical-label text-[9px]",
                                          log.status === "SUCCESS"
                                            ? "text-emerald-500"
                                            : "text-red-500",
                                        )}
                                      >
                                        {log.status}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <button className="w-full py-4 border border-dashed border-white/10 text-white/20 hover:text-white/40 hover:border-white/20 transition-all uppercase technical-label text-[9px]">
                                Download_Full_Archive_.pkg
                              </button>
                            </div>
                          )}

                          {activeTab === "portfolio" && <PortfolioTab theme={theme} />}
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {/* Interactive HUD - Zoom Shortcuts */}
        {audioStarted && (
          <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-6 py-3 technical-panel bg-black/60 backdrop-blur-xl border border-white/10">
            <div className="corner-accent top-0 left-0 border-t-2 border-l-2" />
            <div className="corner-accent bottom-0 right-0 border-b-2 border-r-2" />

            <Tooltip
              text="ZOOM_OUT (MOUSE_WHEEL_DOWN)"
              activePersona={activePersona}
            >
              <button
                onClick={() => setZoom((prev) => Math.max(0.5, prev - 0.25))}
                className="w-10 h-10 flex items-center justify-center technical-label text-white hover:text-accent transition-colors border border-white/5 bg-white/5"
              >
                -
              </button>
            </Tooltip>
            <div className="h-4 w-[1px] bg-white/10" />
            <div className="flex flex-col items-center min-w-[80px]">
              <span className="technical-label text-[8px] opacity-30">
                MAG_LEVEL
              </span>
              <span className="technical-value text-accent">
                {zoom.toFixed(2)}x
              </span>
            </div>
            <div className="h-4 w-[1px] bg-white/10" />
            <Tooltip
              text="ZOOM_IN (MOUSE_WHEEL_UP)"
              activePersona={activePersona}
            >
              <button
                onClick={() => setZoom((prev) => Math.min(8.0, prev + 0.25))}
                className="w-10 h-10 flex items-center justify-center technical-label text-white hover:text-accent transition-colors border border-white/5 bg-white/5"
              >
                +
              </button>
            </Tooltip>

            <div className="absolute -top-[1px] left-1/4 right-1/4 h-[1px] bg-accent/40" />
          </div>
        )}

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
              <div className="text-text-dim">
                &gt; [
                {new Date().toLocaleTimeString("en-GB", { hour12: false })}]
                WDBX_ENGINE_START
              </div>
              <div className="text-text-dim">
                &gt; [
                {new Date().toLocaleTimeString("en-GB", { hour12: false })}]
                ACTIVE_PERSONA: {activePersona}
              </div>
              <div className="text-text-dim">
                &gt; [
                {new Date().toLocaleTimeString("en-GB", { hour12: false })}]
                NEURAL_BACKTRACE_SYNCED
              </div>
              <div className="text-text-dim">
                &gt; [
                {new Date().toLocaleTimeString("en-GB", { hour12: false })}]
                ETHICAL_GOVERNANCE_ACTIVE
              </div>
              <motion.div
                key={activePersona}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-accent-light"
              >
                &gt; [
                {new Date().toLocaleTimeString("en-GB", { hour12: false })}]{" "}
                {activePersona}_PROCESSING_STREAM...
              </motion.div>
            </div>
          </div>
        </div>

        {/* Global Footer */}
        <div className="fixed bottom-0 left-0 right-0 z-[60] h-8 flex items-center justify-between px-6 border-t border-white/5 bg-black/40 backdrop-blur-md pointer-events-none">
          <div className="flex items-center gap-6">
            <span className="technical-label text-text-dim/40">
              © 2026 MLAI CORPORATION / MLAI FOUNDATION
            </span>
            <div className="hidden md:flex items-center gap-4">
              <span className="technical-label text-text-dim/40 hover:text-white cursor-pointer pointer-events-auto transition-colors">
                Terms_of_Service
              </span>
              <span className="technical-label text-text-dim/40 hover:text-white cursor-pointer pointer-events-auto transition-colors">
                Privacy_Protocol
              </span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="technical-label text-text-dim/40">
                  Status:
                </span>
                <span className="technical-value text-emerald-500">
                  OPTIMAL
                </span>
              </div>
              <div className="w-[1px] h-3 bg-white/10" />
              <div className="flex items-center gap-2">
                <span className="technical-label text-text-dim/40">
                  Region:
                </span>
                <span className="technical-value">GLOBAL_EDGE</span>
              </div>
            </div>
          </div>
        </div>
        <AnimatePresence>
          {isInquiryOpen && (
            <InquiryForm
              isOpen={isInquiryOpen}
              onClose={() => setIsInquiryOpen(false)}
              activePersona={activePersona}
            />
          )}
        </AnimatePresence>
      </div>
    </ErrorBoundary>
  );
}
