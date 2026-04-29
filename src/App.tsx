/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { cn } from "./lib/utils";
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
} from "lucide-react";

const InquiryForm = ({
  isOpen,
  onClose,
  activePersona,
}: {
  isOpen: boolean;
  onClose: () => void;
  activePersona: string;
}) => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    services: [] as string[],
    budget: "",
    message: "",
  });

  if (!isOpen) return null;

  const nextStep = () => setStep((s) => Math.min(s + 1, 3));
  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  const steps = [
    { title: "Contact", label: "Step 1 of 3", sub: "Let's start with you." },
    { title: "Business", label: "Step 2 of 3", sub: "About your business." },
    { title: "Scope", label: "Step 3 of 3", sub: "Project scope." },
    { title: "Done", label: "✓", sub: "Inquiry received." },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-bg/90 backdrop-blur-xl overflow-y-auto"
    >
      <div className="absolute inset-0 bg-grid opacity-5" />
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="relative w-full max-w-[500px] bg-[#131316] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl"
      >
        <div className="flex border-b border-white/5">
          {steps.map((s, i) => (
            <div
              key={i}
              className={cn(
                "flex-1 flex flex-col items-center py-5 px-1 relative transition-all duration-500",
                step === i ? "opacity-100" : "opacity-40",
                step > i && "opacity-60",
              )}
            >
              <div
                className={cn(
                  "w-7 h-7 rounded-full border flex items-center justify-center text-[11px] font-bold transition-all duration-500",
                  step === i
                    ? "border-accent text-accent shadow-[0_0_15px_var(--accent)]"
                    : "border-white/10 text-white/40",
                  step > i && "bg-accent border-accent text-bg",
                )}
              >
                {step > i ? "✓" : i + 1}
              </div>
              <span className="text-[9px] uppercase tracking-widest font-bold mt-2 text-white/40">
                {s.title}
              </span>
              {i < 3 && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[1px] h-4 bg-white/5" />
              )}
            </div>
          ))}
        </div>

        <div className="h-1 bg-white/5 w-full">
          <motion.div
            className="h-full bg-accent transition-colors duration-1000"
            animate={{ width: `${((step + 1) / 4) * 100}%` }}
          />
        </div>

        <div className="p-8 md:p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {step < 3 ? (
                <>
                  <div className="space-y-2">
                    <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/30">
                      {steps[step].label}
                    </div>
                    <h3 className="text-2xl font-bold text-white">
                      {steps[step].title}
                    </h3>
                    <p className="text-text-dim text-sm">{steps[step].sub}</p>
                  </div>

                  <div className="space-y-4 pt-4">
                    {step === 0 && (
                      <>
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-widest font-bold text-white/30 ml-1">
                            Full Name
                          </label>
                          <input
                            placeholder="Jane Smith"
                            className="w-full bg-[#0f0f12] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent/40 transition-colors"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-widest font-bold text-white/30 ml-1">
                            Work Email
                          </label>
                          <input
                            placeholder="jane@company.com"
                            className="w-full bg-[#0f0f12] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent/40 transition-colors"
                          />
                        </div>
                      </>
                    )}
                    {step === 1 && (
                      <>
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-widest font-bold text-white/30 ml-1">
                            Company Name
                          </label>
                          <input
                            placeholder="Acme Corp"
                            className="w-full bg-[#0f0f12] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent/40 transition-colors"
                          />
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          {[
                            "ML Model Development",
                            "AI Integration",
                            "Data Strategy",
                          ].map((s) => (
                            <button
                              key={s}
                              onClick={() => {
                                const newServices = formData.services.includes(
                                  s,
                                )
                                  ? formData.services.filter((x) => x !== s)
                                  : [...formData.services, s];
                                setFormData({
                                  ...formData,
                                  services: newServices,
                                });
                              }}
                              className={cn(
                                "flex items-center gap-3 p-3 rounded-xl border transition-all text-left group",
                                formData.services.includes(s)
                                  ? "bg-white/10 border-white/40"
                                  : "bg-white/5 border-white/5 hover:border-white/20",
                              )}
                            >
                              <div
                                className={cn(
                                  "w-4 h-4 rounded border flex items-center justify-center transition-all",
                                  formData.services.includes(s)
                                    ? "bg-white border-white"
                                    : "border-white/20",
                                )}
                              >
                                {formData.services.includes(s) && (
                                  <div className="w-2 h-2 bg-bg rounded-sm" />
                                )}
                              </div>
                              <span
                                className={cn(
                                  "text-xs transition-colors",
                                  formData.services.includes(s)
                                    ? "text-white"
                                    : "text-white/40 group-hover:text-white/60",
                                )}
                              >
                                {s}
                              </span>
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                    {step === 2 && (
                      <>
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-widest font-bold text-white/30 ml-1">
                            Budget Range
                          </label>
                          <select className="w-full bg-[#0f0f12] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent/40 transition-colors appearance-none cursor-pointer">
                            <option>Under $25k</option>
                            <option>$25k - $100k</option>
                            <option>$100k+</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-widest font-bold text-white/30 ml-1">
                            Message
                          </label>
                          <textarea
                            rows={4}
                            placeholder="Describe your project..."
                            className="w-full bg-[#0f0f12] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent/40 transition-colors resize-none"
                          />
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex gap-3 pt-6">
                    {step > 0 && (
                      <button
                        onClick={prevStep}
                        className="px-6 py-4 border border-white/10 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={nextStep}
                      className={cn(
                        "flex-1 px-8 py-4 bg-white text-bg rounded-xl font-bold text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all",
                        activePersona === "AVIVA" && "bg-purple-400",
                        activePersona === "ABI" && "bg-accent",
                      )}
                    >
                      Continue
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center space-y-8 py-10">
                  <div className="w-20 h-20 rounded-full border-2 border-accent/20 flex items-center justify-center mx-auto mb-6 relative">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-12 h-12 bg-accent rounded-full flex items-center justify-center"
                    >
                      <div className="w-6 h-[2px] bg-bg rotate-45 translate-y-[2px]" />
                      <div className="w-3 h-[2px] bg-bg -rotate-45 translate-x-[-10px] translate-y-[-2px]" />
                    </motion.div>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-3xl font-bold text-white">
                      Inquiry Sent.
                    </h3>
                    <p className="text-text-dim text-sm leading-relaxed px-4">
                      Our system has registered your request. An analyst from
                      the MLAI Corporation will review your telemetry and
                      respond within 24-48 hours.
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-full py-4 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 hover:text-white transition-all"
                  >
                    Close_Terminal
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

const PERSONAS = {
  ABBEY: {
    color: "cyan",
    hex: "#00ccff",
    label: "Ethical_Compliance",
    mission: "PRESERVING_CORE_INTEGRITY",
    protocol: "ABBEY_V4_SECURE",
    accentClass: "text-accent",
    accentLightClass: "text-accent-light",
    borderClass: "border-accent/40",
    bgClass: "bg-accent/5",
    glowClass: "from-accent/20 to-transparent",
    orbClass: "bg-accent shadow-[0_0_60px_var(--accent)]",
  },
  AVIVA: {
    color: "purple",
    hex: "#b233ff",
    label: "Advanced_Research",
    mission: "NEURAL_SYNTHETIC_EXPANSION",
    protocol: "AVIVA_HYPER_COMPUTE",
    accentClass: "text-accent",
    accentLightClass: "text-accent-light",
    borderClass: "border-accent/40",
    bgClass: "bg-accent/5",
    glowClass: "from-accent/20 to-transparent",
    orbClass: "bg-accent shadow-[0_0_60px_var(--accent)]",
  },
  ABI: {
    color: "orange",
    hex: "#ff9900",
    label: "Regulatory_Oversight",
    mission: "DYNAMIC_MODERATION_SYNC",
    protocol: "ABI_MEDIATION_LAYER",
    accentClass: "text-accent",
    accentLightClass: "text-accent-light",
    borderClass: "border-accent/40",
    bgClass: "bg-accent/5",
    glowClass: "from-accent/20 to-transparent",
    orbClass: "bg-accent shadow-[0_0_60px_var(--accent)]",
  },
} as const;

const Tooltip = ({
  children,
  text,
  activePersona,
}: {
  children: ReactNode;
  text: string;
  activePersona: string;
  key?: string;
}) => {
  const [show, setShow] = useState(false);
  const theme =
    PERSONAS[activePersona as keyof typeof PERSONAS] || PERSONAS.ABBEY;
  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute z-[100] bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-black/90 border border-white/20 technical-panel whitespace-nowrap pointer-events-none"
          >
            <div className="corner-accent top-0 left-0 border-t-2 border-l-2 w-1 h-1" />
            <div className="corner-accent bottom-0 right-0 border-b-2 border-r-2 w-1 h-1" />
            <span
              className={cn(
                "font-mono text-[9px] uppercase tracking-widest",
                theme.accentLightClass,
              )}
            >
              {text}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
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
    | "docs"
    | "telemetry"
    | "network"
    | "security"
    | "blueprint"
    | "archive"
    | "about"
  >("landscape");
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [renderMode, setRenderMode] = useState(0); // 0: Mandelbulb, 1: Neural Brain
  const [neuralActivity, setNeuralActivity] = useState(1.0);
  const [fps, setFps] = useState(0);
  const [activePersona, setActivePersona] = useState("ABBEY");
  const [isAutoPersona, setIsAutoPersona] = useState(true);
  const [abbeyPulse, setAbbeyPulse] = useState(1.0);
  const [avivaGlitch, setAvivaGlitch] = useState(0.85);
  const [abiFlicker, setAbiFlicker] = useState(1.0);
  const [logs, setLogs] = useState<string[]>([
    "> BOOTING WDBX_KERNEL_V3.4...",
    "> MAPPING NEURAL_SYNAPSE_GRID...",
    "> PROTOCOL: ABBEY_LEVEL_SECURE",
  ]);

  const playPersonaCue = useCallback(
    (persona: string, type: string = "SWITCH") => {
      if (!audioContextRef.current || !audioStarted) return;
      const ctx = audioContextRef.current;
      if (ctx.state === "suspended") ctx.resume();

      const cueGain = ctx.createGain();

      // We pass it through a gentle lowpass so it's not too harsh in the mix
      const cueFilter = ctx.createBiquadFilter();
      cueFilter.type = "lowpass";
      cueFilter.frequency.setValueAtTime(3000, ctx.currentTime);

      cueGain.connect(cueFilter);
      cueFilter.connect(ctx.destination);

      if (persona === "ABBEY") {
        if (type === "SWITCH") {
            // Subtle, reassuring chime for secure operations (Pure sine waves, harmonious)
            const osc1 = ctx.createOscillator();
            const osc2 = ctx.createOscillator();
            osc1.type = "sine";
            osc2.type = "sine";

            osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
            osc2.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5

            cueGain.gain.setValueAtTime(0, ctx.currentTime);
            cueGain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.05);
            cueGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);

            osc1.connect(cueGain);
            osc2.connect(cueGain);

            osc1.start();
            osc2.start(ctx.currentTime + 0.1);
            osc1.stop(ctx.currentTime + 1.5);
            osc2.stop(ctx.currentTime + 1.5);
        } else if (type === "EVENT_SECURE") {
            // Reassuring chime for security
            const osc = ctx.createOscillator();
            osc.type = "sine";
            osc.frequency.setValueAtTime(783.99, ctx.currentTime); // G5
            osc.frequency.exponentialRampToValueAtTime(523.25, ctx.currentTime + 0.5); // C5
            cueGain.gain.setValueAtTime(0, ctx.currentTime);
            cueGain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.05);
            cueGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
            osc.connect(cueGain);
            osc.start();
            osc.stop(ctx.currentTime + 0.5);
        }
      } else if (persona === "AVIVA") {
        if (type === "SWITCH") {
            // Complex, data-driven soundscape for research (Glitchy, rising sweep)
            const osc1 = ctx.createOscillator();
            const osc2 = ctx.createOscillator();
            osc1.type = "square";
            osc2.type = "sawtooth";

            osc1.frequency.setValueAtTime(150, ctx.currentTime);
            osc1.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.3);

            osc2.frequency.setValueAtTime(200, ctx.currentTime + 0.1);
            osc2.frequency.exponentialRampToValueAtTime(
              1200,
              ctx.currentTime + 0.4,
            );

            cueGain.gain.setValueAtTime(0, ctx.currentTime);
            cueGain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.05);
            cueGain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 0.2);
            cueGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);

            // Add a bandpass filter sweep for extra glitch character
            cueFilter.type = "bandpass";
            cueFilter.frequency.setValueAtTime(600, ctx.currentTime);
            cueFilter.frequency.exponentialRampToValueAtTime(
              3000,
              ctx.currentTime + 0.3,
            );

            osc1.connect(cueGain);
            osc2.connect(cueGain);

            osc1.start();
            osc2.start(ctx.currentTime + 0.1);
            osc1.stop(ctx.currentTime + 0.8);
            osc2.stop(ctx.currentTime + 0.8);
        } else if (type === "EVENT_RESEARCH") {
            // Complex data-driven soundscape
            const osc = ctx.createOscillator();
            osc.type = "sawtooth";
            osc.frequency.setValueAtTime(200, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.5);
            cueGain.gain.setValueAtTime(0, ctx.currentTime);
            cueGain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.1);
            cueGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
            osc.connect(cueGain);
            osc.start();
            osc.stop(ctx.currentTime + 0.5);
        }
      } else if (persona === "ABI") {
        if (type === "SWITCH") {
            // Precise, sharp tone for regulatory confirmations (Short, snappy, descending)
            const osc = ctx.createOscillator();
            osc.type = "triangle";

            osc.frequency.setValueAtTime(1200, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.15);

            cueGain.gain.setValueAtTime(0, ctx.currentTime);
            cueGain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.02);
            cueGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);

            osc.connect(cueGain);
            osc.start();
            osc.stop(ctx.currentTime + 0.25);

            // Secondary confirmation beep
            const beepOsc = ctx.createOscillator();
            beepOsc.type = "square";
            beepOsc.frequency.setValueAtTime(1600, ctx.currentTime + 0.15);

            const beepGain = ctx.createGain();
            beepGain.gain.setValueAtTime(0, ctx.currentTime);
            beepGain.gain.setValueAtTime(0.05, ctx.currentTime + 0.15);
            beepGain.gain.exponentialRampToValueAtTime(
              0.01,
              ctx.currentTime + 0.25,
            );
            beepGain.connect(cueFilter);

            beepOsc.connect(beepGain);
            beepOsc.start(ctx.currentTime + 0.15);
            beepOsc.stop(ctx.currentTime + 0.25);
        } else if (type === "EVENT_CONFIRM") {
             // Precise, sharp confirmation
            const osc = ctx.createOscillator();
            osc.type = "square";
            osc.frequency.setValueAtTime(1000, ctx.currentTime);
            cueGain.gain.setValueAtTime(0, ctx.currentTime);
            cueGain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.02);
            cueGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
            osc.connect(cueGain);
            osc.start();
            osc.stop(ctx.currentTime + 0.1);
        }
      }

      // Cleanup to avoid memory leaks
      setTimeout(() => {
        try {
          cueGain.disconnect();
          cueFilter.disconnect();
        } catch (e) {}
      }, 2000);
    },
    [audioStarted],
  );

  useEffect(() => {
    const personaMessages = {
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
    const newLogs = [
      ...logs,
      ...personaMessages[activePersona as keyof typeof personaMessages],
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

    const pIdx =
      activePersona === "ABBEY" ? 0 : activePersona === "AVIVA" ? 1 : 2;
    (window as any)._shaderPersona = pIdx;

    if (colorMode === "cyan") (window as any)._shaderColor = [0.0, 0.8, 1.0];
    else if (colorMode === "magenta")
      (window as any)._shaderColor = [1.0, 0.0, 0.8];
    else if (colorMode === "amber")
      (window as any)._shaderColor = [1.0, 0.7, 0.0];

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
  const framesRef = useRef(0);
  const lastTimeRef = useRef(performance.now());

  const [sequence, setSequence] = useState<"landing" | "connecting" | "active">(
    "landing",
  );

  const getTheme = () => PERSONAS[activePersona as keyof typeof PERSONAS];
  const theme = getTheme();

  const personaConfig = (PERSONAS as any)[activePersona];

  // Keyboard shortcuts for persona switching
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input (though there aren't many in this UI)
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName))
        return;

      if (e.key === "1") {
        setActivePersona("ABBEY");
        setIsAutoPersona(false);
      } else if (e.key === "2") {
        setActivePersona("AVIVA");
        setIsAutoPersona(false);
      } else if (e.key === "3") {
        setActivePersona("ABI");
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
        const personaList = ["ABBEY", "AVIVA", "ABI"];
        setActivePersona(personaList[seconds % 3]);
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

  const colors = {
    cyan: [0.0, 0.8, 1.0],
    orange: [1.0, 0.4, 0.0],
    purple: [0.7, 0.2, 1.0],
    lime: [0.6, 1.0, 0.0],
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
            float pulse = sin(u_time * pFreq + cellHash * 50.0) * 0.5 + 0.5;
            float size = 0.02 + pulse * 0.04 * (u_persona == 1 ? 1.5 : 0.6);
            
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
          // Abbey: Pronounced cyan glow with subtle wave-like motion
          float wave = sin(u_time * 3.0 + screenUV.y * 15.0) * 0.15;
          float pulse = 0.7 + (0.5 + wave) * sin(u_time * 3.0);
          personaSignColor = vec3(0.0, 0.95, 1.6) * pulse * 1.6;
          finalTitleGlow = titleMask * pulse * 3.0;
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
                baseColor += grid * abbeyColor * 0.3;
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
    (window as any)._shaderMode = renderMode;
    (window as any)._shaderPersona =
      activePersona === "ABBEY" ? 0 : activePersona === "AVIVA" ? 1 : 2;
    (window as any)._shaderActivity = neuralActivity;
    (window as any)._shaderAbbeyPulse = abbeyPulse;
    (window as any)._shaderAvivaGlitch = avivaGlitch;
    (window as any)._shaderAbiFlicker = abiFlicker;
  }, [
    speed,
    lighting,
    zoom,
    yaw,
    pitch,
    isPaused,
    proximity,
    wind,
    colorMode,
    renderMode,
    neuralActivity,
    activePersona,
    abbeyPulse,
    avivaGlitch,
    abiFlicker,
  ]);

  return (
    <>
      <AnimatePresence>
        {sequence !== "active" && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black"
          >
            <div className="absolute inset-0 bg-grid opacity-10" />
            <div className="scanlines opacity-5" />
            <div className="scanning-bar opacity-10" />

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

            <div className="relative z-10 flex flex-col items-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="w-32 h-32 mb-16 relative flex items-center justify-center"
              >
                <div
                  className={`absolute inset-0 border rounded-full animate-ping ${theme.borderClass}`}
                />
                <div
                  className={`absolute inset-2 border rounded-full animate-pulse blur-sm ${theme.borderClass}`}
                />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                  className={`absolute inset-[-10%] border border-dashed rounded-full ${theme.borderClass} opacity-50`}
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                  className={`absolute inset-[-20%] border border-dashed rounded-full ${theme.borderClass} opacity-30`}
                />
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-1000 ${theme.orbClass}`}
                >
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                </div>
              </motion.div>

              <div className="text-center space-y-4 mb-24">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="relative"
                >
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-4 opacity-20">
                    <div className="w-12 h-[1px] bg-white" />
                    <span className="technical-label tracking-[1em]">
                      CORE_IDENTIFIER
                    </span>
                    <div className="w-12 h-[1px] bg-white" />
                  </div>
                  <h1 className="text-white font-display text-8xl md:text-[10rem] leading-none italic group cursor-default relative flex items-center justify-center gap-4">
                    <span className="glitch-text" data-text="MLAI">MLAI</span>
                    <span
                      className={cn(
                        "transition-colors duration-1000 glitch-text",
                        theme.accentClass,
                      )}
                      data-text="CORP"
                    >
                      CORP
                    </span>
                    {/* Floating decorators */}
                    <motion.div
                      animate={{ opacity: [0.1, 0.5, 0.1], y: [-5, 5, -5] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute -top-12 -right-24 hidden md:block"
                    >
                      <div
                        className={cn(
                          "technical-panel px-3 py-2 transition-all duration-1000 flex items-center gap-2",
                          theme.borderClass,
                          theme.bgClass,
                        )}
                      >
                        <div className={cn("w-2 h-2 rounded-full animate-pulse", theme.bgClass.replace('bg-', 'bg-').replace('/5', ''))} style={{ backgroundColor: theme.hex }} />
                        <span
                          className={cn(
                            "micro-label transition-colors duration-1000 text-[9px] tracking-widest",
                            theme.accentClass,
                          )}
                        >
                          WDBX_SYN_{activePersona.charAt(0)}
                        </span>
                      </div>
                    </motion.div>
                  </h1>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="flex flex-col items-center gap-6 mt-6"
                >
                  <div className="flex items-center justify-center gap-6">
                    <div className="h-[1px] w-12 bg-white/10" />
                    <p className="technical-label tracking-[0.6em] text-white/40 uppercase">
                      Abbey_Aviva_Abi_Framework_v3.4
                    </p>
                    <div className="h-[1px] w-12 bg-white/10" />
                  </div>
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center border border-white/5 py-2 px-6 bg-white/[0.01]">
                      <span className="technical-label opacity-40 mb-1">S_PROTO</span>
                      <span className="font-mono text-xs text-white">0.42</span>
                    </div>
                    <div className="flex flex-col items-center border border-white/5 py-2 px-6 bg-white/[0.01]">
                      <span className="technical-label opacity-40 mb-1">N_CORE</span>
                      <span className={cn("font-mono text-xs", theme.accentClass)}>ACTIVE</span>
                    </div>
                    <div className="flex flex-col items-center border border-white/5 py-2 px-6 bg-white/[0.01]">
                      <span className="technical-label opacity-40 mb-1">UPLINK</span>
                      <span className="font-mono text-xs text-white">READY</span>
                    </div>
                  </div>
                </motion.div>
              </div>

              {sequence === "landing" ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.button
                    key="landing-button"
                    initial={{ opacity: 0, scale: 0.8, y: 50 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      y: 0,
                      boxShadow: [
                        `0 0 0px ${theme.hex}00`,
                        `0 0 20px ${theme.hex}33`,
                        `0 0 0px ${theme.hex}00`,
                      ],
                    }}
                    transition={{
                      boxShadow: {
                        repeat: Infinity,
                        duration: 2,
                      },
                    }}
                    exit={{ opacity: 0, y: -50 }}
                    whileHover={{ scale: 1.05, boxShadow: `0 0 30px ${theme.hex}` }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSequence("connecting");
                      setTimeout(() => {
                        setSequence("active");
                        startAudio();
                      }, 3500);
                    }}
                    className={cn(
                      "group relative px-20 py-8 technical-panel transition-all overflow-hidden",
                      theme.borderClass,
                      "hover:border-white/50",
                    )}
                  >
                  <div
                    className={cn(
                      "absolute inset-0 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-700 ease-out opacity-20",
                      theme.bgClass.replace("/5", "/40"),
                    )}
                  />
                  
                  {/* Scanning bar effect on hover */}
                  <div className="absolute top-0 left-0 bottom-0 w-1 bg-white/20 -translate-x-full group-hover:animate-[scan_2s_linear_infinite]" style={{ boxShadow: `0 0 20px ${theme.hex}` }} />

                  <div
                    className={cn(
                      "absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 opacity-0 group-hover:opacity-100 transition-all duration-500 -translate-x-2 -translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0",
                      theme.borderClass,
                    )}
                  />
                  <div
                    className={cn(
                      "absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-2 translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0",
                      theme.borderClass,
                    )}
                  />

                  <div className="relative z-10 flex flex-col items-center gap-3">
                    <span
                      className={cn(
                        "technical-label group-hover:text-white transition-colors text-xs tracking-[0.6em] font-bold",
                        theme.accentClass,
                      )}
                    >
                      INITIALIZE_NEURAL_UPLINK
                    </span>
                    <div className="flex items-center gap-2 w-full">
                      <div className={cn("flex-1 h-[1px] transition-colors opacity-20")} style={{ backgroundColor: theme.hex }} />
                      <div className={cn("w-1.5 h-1.5 rounded-full transition-colors")} style={{ backgroundColor: theme.hex }} />
                      <div className={cn("flex-1 h-[1px] transition-colors opacity-20")} style={{ backgroundColor: theme.hex }} />
                    </div>
                    <span className="technical-label opacity-40 group-hover:opacity-100 transition-opacity">
                      ESTABLISH_WDBX_HANDSHAKE
                    </span>
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
                  <div className="flex gap-3">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                      <motion.div
                        key={i}
                        animate={{
                          height: [24, 60, 24],
                          opacity: [0.3, 1, 0.3],
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 1.2,
                          delay: i * 0.15,
                          ease: "easeInOut",
                        }}
                        className="w-1 bg-accent shadow-[0_0_15px_var(--accent)]"
                      />
                    ))}
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
        className={`fixed inset-0 overflow-hidden transition-all duration-1000 theme-${activePersona} selection:bg-accent selection:text-white ${activePersona === "AVIVA" ? "bg-[#0a050f]" : activePersona === "ABI" ? "bg-[#0f0a05]" : "bg-bg"}`}
        style={
          {
            "--accent": theme.hex,
            "--color-accent": theme.hex,
            "--color-accent-light":
              activePersona === "AVIVA"
                ? "#d884ff"
                : activePersona === "ABI"
                  ? "#ffcc66"
                  : "#60A5FA",
          } as any
        }
      >
        <div
          className={`grain-overlay pointer-events-none ${activePersona === "AVIVA" ? "opacity-20 blend-overlay" : ""}`}
        />
        <div className="scanlines" />
        <div className="fixed inset-0 bg-grid pointer-events-none opacity-20" />

        <canvas ref={canvasRef} className="w-full h-full block" />

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
                <div className="flex bg-white/5 p-1 rounded-md border border-white/10 gap-1 pointer-events-auto">
                  {["ABBEY", "AVIVA", "ABI"].map((p, index) => {
                    const Icon =
                      p === "ABBEY"
                        ? Shield
                        : p === "AVIVA"
                          ? FlaskConical
                          : Scale;
                    return (
                      <button
                        key={p}
                        onClick={() => {
                          setActivePersona(p);
                          setIsAutoPersona(false);
                        }}
                        className={cn(
                          "flex items-center gap-1.5 px-2 py-0.5 text-[8px] font-bold transition-all rounded",
                          activePersona === p
                            ? `${PERSONAS[p as keyof typeof PERSONAS].bgClass.replace("bg-", "bg-") || "bg-white/20"} ${PERSONAS[p as keyof typeof PERSONAS].accentClass} border border-white/20`
                            : "text-white/20 hover:text-white/40",
                        )}
                      >
                        <Icon
                          className={cn(
                            "w-3 h-3",
                            activePersona === p
                              ? p === "ABBEY"
                                ? "animate-abbey"
                                : p === "AVIVA"
                                  ? "animate-aviva"
                                  : "animate-abi"
                              : "",
                          )}
                        />
                        {p}
                        <span className="opacity-50 ml-1">[{index + 1}]</span>
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setIsAutoPersona(!isAutoPersona)}
                  className={cn(
                    "micro-label px-2 py-1 rounded transition-all pointer-events-auto",
                    isAutoPersona
                      ? "text-accent bg-accent/10"
                      : "text-white/20 hover:text-white/40",
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
                  <span className="technical-value text-white">
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
              <span className="micro-label opacity-20 mt-1">
                {personaConfig.protocol}
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
                            className={`relative px-4 py-2 technical-label transition-all ${activeTab === "landscape" ? "text-white" : "text-text-dim hover:text-white"}`}
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
                          text="MLAI_DOCUMENTATION"
                          activePersona={activePersona}
                        >
                          <motion.button
                            onClick={() => setActiveTab("docs")}
                            className={`relative px-4 py-2 technical-label transition-all ${activeTab === "docs" ? "text-white" : "text-text-dim hover:text-white"}`}
                          >
                            {activeTab === "docs" && (
                              <motion.div
                                layoutId="activeTabIndicator"
                                className="absolute inset-0 bg-white/5 border border-white/20 rounded-md"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                              />
                            )}
                            <span className="relative z-10">Docs</span>
                          </motion.button>
                        </Tooltip>
                        <Tooltip
                          text="GLOBAL_NETWORK_STATUS"
                          activePersona={activePersona}
                        >
                          <motion.button
                            onClick={() => setActiveTab("network")}
                            className={`relative px-4 py-2 technical-label transition-all ${activeTab === "network" ? "text-white" : "text-text-dim hover:text-white"}`}
                          >
                            {activeTab === "network" && (
                              <motion.div
                                layoutId="activeTabIndicator"
                                className="absolute inset-0 bg-white/5 border border-white/20 rounded-md"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                              />
                            )}
                            <span className="relative z-10">Network</span>
                          </motion.button>
                        </Tooltip>
                        <Tooltip
                          text="THREAT_DETECTION"
                          activePersona={activePersona}
                        >
                          <motion.button
                            onClick={() => setActiveTab("security")}
                            className={`relative px-4 py-2 technical-label transition-all ${activeTab === "security" ? "text-white" : "text-text-dim hover:text-white"}`}
                          >
                            {activeTab === "security" && (
                              <motion.div
                                layoutId="activeTabIndicator"
                                className="absolute inset-0 bg-white/5 border border-white/20 rounded-md"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                              />
                            )}
                            <span className="relative z-10">Security</span>
                          </motion.button>
                        </Tooltip>
                        <Tooltip
                          text="SYSTEM_BLUEPRINT"
                          activePersona={activePersona}
                        >
                          <motion.button
                            onClick={() => setActiveTab("blueprint")}
                            className={`relative px-4 py-2 technical-label transition-all ${activeTab === "blueprint" ? "text-white" : "text-text-dim hover:text-white"}`}
                          >
                            {activeTab === "blueprint" && (
                              <motion.div
                                layoutId="activeTabIndicator"
                                className="absolute inset-0 bg-white/5 border border-white/20 rounded-md"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                              />
                            )}
                            <span className="relative z-10">Blueprint</span>
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
                          text="CORPORATION_INTEL"
                          activePersona={activePersona}
                        >
                          <motion.button
                            onClick={() => setActiveTab("about")}
                            className={`relative px-4 py-2 technical-label transition-all ${activeTab === "about" ? "text-white" : "text-text-dim hover:text-white"}`}
                          >
                            {activeTab === "about" && (
                              <motion.div
                                layoutId="activeTabIndicator"
                                className="absolute inset-0 bg-white/5 border border-white/20 rounded-md"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                              />
                            )}
                            <span className="relative z-10">About</span>
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
                                    <span className="technical-label">Abbey Pulse</span>
                                    <span className="technical-value">{abbeyPulse.toFixed(2)}</span>
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
                                        Abbey Pulse
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
                              {landscapes.map((landscape) => (
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
                                    <ResponsiveContainer
                                      width="100%"
                                      height="100%"
                                    >
                                      <AreaChart
                                        data={Array.from({ length: 20 }).map(
                                          (_, i) => ({
                                            value:
                                              60 +
                                              Math.random() * 20 +
                                              Math.sin(
                                                i * 0.5 +
                                                  performance.now() * 0.001,
                                              ) *
                                                10,
                                          }),
                                        )}
                                      >
                                        <defs>
                                          <linearGradient
                                            id={`colorValue-${activePersona}`}
                                            x1="0"
                                            y1="0"
                                            x2="0"
                                            y2="1"
                                          >
                                            <stop
                                              offset="5%"
                                              stopColor={theme.hex}
                                              stopOpacity={0.3}
                                            />
                                            <stop
                                              offset="95%"
                                              stopColor={theme.hex}
                                              stopOpacity={0}
                                            />
                                          </linearGradient>
                                        </defs>
                                        <Area
                                          type="monotone"
                                          dataKey="value"
                                          stroke={theme.hex}
                                          fillOpacity={1}
                                          fill={`url(#colorValue-${activePersona})`}
                                          strokeWidth={2}
                                        />
                                      </AreaChart>
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
                                    <ResponsiveContainer
                                      width="100%"
                                      height="100%"
                                    >
                                      <LineChart
                                        data={Array.from({ length: 20 }).map(
                                          (_, i) => ({
                                            value: 98 + Math.random() * 2,
                                          }),
                                        )}
                                      >
                                        <Line
                                          type="stepAfter"
                                          dataKey="value"
                                          stroke={theme.hex}
                                          dot={false}
                                          strokeWidth={2}
                                        />
                                      </LineChart>
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
                                <div className="grid grid-cols-3 gap-2 h-2">
                                  <div
                                    className={`h-full transition-all duration-1000 ${theme.accentClass.replace("text", "bg")} opacity-100`}
                                  />
                                  <div
                                    className={`h-full transition-all duration-1000 ${theme.accentClass.replace("text", "bg")} ${isPaused ? "opacity-20" : "opacity-60"}`}
                                  />
                                  <div
                                    className={`h-full transition-all duration-1000 ${theme.accentClass.replace("text", "bg")} ${neuralActivity > 1 ? "opacity-50" : "opacity-20"}`}
                                  />
                                </div>
                              </div>

                              <div className="p-4 bg-white/5 border border-white/10 industrial-border">
                                <div className="flex items-center justify-between mb-4">
                                  <h3 className="technical-label text-white">
                                    Cross_Persona_Mediation
                                  </h3>
                                  <div className="flex gap-2">
                                    {["ABBEY", "AVIVA", "ABI"].map((p) => (
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

                          {activeTab === "docs" && (
                            <div className="pt-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                              <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-1.5 h-1.5 bg-accent" />
                                  <h3 className="technical-label text-white tracking-[0.4em]">
                                    ABI: Multi-Layer Persona Design
                                  </h3>
                                </div>
                                <div className="p-4 bg-white/5 border border-white/10 industrial-border">
                                  <p className="font-mono text-[10px] text-text-secondary leading-relaxed italic">
                                    "Unlocking the Power of Multi-Layer,
                                    Multi-Persona AI Assistants with Distributed
                                    WDBX for Enhanced Performance, Scalability,
                                    and Ethical Considerations."
                                  </p>
                                </div>
                              </div>

                              <div className="space-y-4 font-light text-[11px] leading-relaxed text-text-dim px-2">
                                <p>
                                  This research presents ABI, a groundbreaking
                                  multi-layer, multi-persona AI assistant system
                                  that leverages the Weighted Distributed Block
                                  Exchange (WDBX) architecture.
                                </p>
                                <div className="grid grid-cols-1 gap-1">
                                  {[
                                    {
                                      name: "ABBEY",
                                      role: "Empathetic Polymath",
                                    },
                                    {
                                      name: "AVIVA",
                                      role: "Unfiltered Expert",
                                    },
                                    { name: "ABI", role: "Adaptive Moderator" },
                                  ].map((p) => (
                                    <div
                                      key={p.name}
                                      className="flex justify-between items-center py-1 border-b border-white/5"
                                    >
                                      <span
                                        className={cn(
                                          "technical-label",
                                          theme.accentLightClass,
                                        )}
                                      >
                                        {p.name}
                                      </span>
                                      <span className="micro-label opacity-60">
                                        {p.role}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                                <p>
                                  Key innovations include adaptive routing
                                  protocols, real-time performance optimization,
                                  and comprehensive ethical safeguards.
                                </p>
                              </div>

                              <button
                                onClick={() => setIsInquiryOpen(true)}
                                className="w-full py-4 bg-accent text-white font-mono text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-2 hover:bg-accent/80 transition-all border border-accent/20 shadow-[0_0_20px_rgba(59,130,246,0.3)] animate-pulse"
                              >
                                [ Initialize_Inquiry ]
                                <ArrowUpRight className="w-3 h-3" />
                              </button>

                              <div className="p-4 technical-panel border-accent/20 bg-accent/5">
                                <p
                                  className={cn(
                                    "text-[9px] font-mono leading-relaxed italic",
                                    theme.accentLightClass,
                                  )}
                                >
                                  WARNING: Unauthorized access to the WDBX
                                  MEDIATION LAYER is strictly prohibited by MLAI
                                  Corp International Security Protocols.
                                </p>
                              </div>
                            </div>
                          )}

                          {activeTab === "network" && (
                            <div className="pt-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                              <div className="aspect-video bg-white/5 border border-white/10 relative overflow-hidden flex items-center justify-center">
                                <Globe className="w-24 h-24 text-accent/20 animate-pulse" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-3/4 h-3/4 border border-dashed border-accent/10 rounded-full animate-[spin_60s_linear_infinite]" />
                                  <div className="absolute w-full h-[1px] bg-accent/10 top-1/2" />
                                  <div className="absolute h-full w-[1px] bg-accent/10 left-1/2" />
                                </div>
                                <div className="absolute top-4 left-4 p-2 bg-black/60 border border-white/5 technical-panel">
                                  <span className="technical-label text-[8px]">
                                    Global_Sync_Status
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <div
                                      className={`w-1 h-1 rounded-full ${activePersona === "ABI" ? "bg-emerald-500" : "bg-accent"}`}
                                    />
                                    <span className="technical-value text-[10px]">
                                      99.8% Online
                                    </span>
                                  </div>
                                </div>
                                <div className="absolute bottom-4 right-4 p-2 bg-black/60 border border-white/5 technical-panel space-y-1">
                                  <div className="flex justify-between gap-4">
                                    <span className="technical-label text-[8px]">
                                      North_America
                                    </span>
                                    <span className="technical-value text-[8px] text-emerald-500">
                                      Normal
                                    </span>
                                  </div>
                                  <div className="flex justify-between gap-4">
                                    <span className="technical-label text-[8px]">
                                      Europe_Region
                                    </span>
                                    <span className="technical-value text-[8px] text-emerald-500">
                                      Normal
                                    </span>
                                  </div>
                                  <div className="flex justify-between gap-4">
                                    <span className="technical-label text-[8px]">
                                      Asia_Pacific
                                    </span>
                                    <span className="technical-value text-[8px] text-accent">
                                      High_Load
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-white/5 border border-white/5 space-y-2">
                                  <span className="technical-label block">
                                    Ingress_Bandwidth
                                  </span>
                                  <span className="technical-value text-xl">
                                    12.4 TB/s
                                  </span>
                                </div>
                                <div className="p-4 bg-white/5 border border-white/5 space-y-2">
                                  <span className="technical-label block">
                                    Egress_Bandwidth
                                  </span>
                                  <span className="technical-value text-xl">
                                    8.1 TB/s
                                  </span>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <h3 className="technical-label text-accent/60">
                                  Active_Infrastructure_Nodes
                                </h3>
                                <div className="space-y-1">
                                  {[
                                    {
                                      id: "HK-92",
                                      location: "Hong Kong",
                                      status: "Active",
                                    },
                                    {
                                      id: "US-W2",
                                      location: "Oregon, USA",
                                      status: "Active",
                                    },
                                    {
                                      id: "EU-C1",
                                      location: "Frankfurt, GER",
                                      status: "Syncing",
                                    },
                                  ].map((node) => (
                                    <div
                                      key={node.id}
                                      className="flex justify-between items-center p-3 bg-white/[0.02] border border-white/5"
                                    >
                                      <div className="flex flex-col">
                                        <span className="technical-value text-white">
                                          {node.id}
                                        </span>
                                        <span className="micro-label opacity-40">
                                          {node.location}
                                        </span>
                                      </div>
                                      <span
                                        className={cn(
                                          "technical-label text-[8px]",
                                          node.status === "Active"
                                            ? "text-emerald-500"
                                            : "text-accent",
                                        )}
                                      >
                                        {node.status}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                          {activeTab === "security" && (
                            <div className="pt-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                              <div className="p-6 bg-red-500/5 border border-red-500/20 technical-panel flex items-start gap-4">
                                <ShieldAlert className="w-8 h-8 text-red-500 animate-pulse mt-1" />
                                <div className="space-y-1">
                                  <h3 className="technical-label text-red-500 text-[11px]">
                                    Firewall_Status: Compromised_Containment
                                  </h3>
                                  <p className="text-[10px] text-text-dim leading-relaxed">
                                    Automated threat detection has isolated 3
                                    attempted brute-force injections in the
                                    primary memory buffer. Sector 4-C is
                                    currently in lockdown.
                                  </p>
                                </div>
                              </div>
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <h3 className="technical-label">
                                    Recent_Threat_Log
                                  </h3>
                                  <span
                                    className={`micro-label font-bold animate-pulse ${theme.accentClass}`}
                                  >
                                    Scanning_Live...
                                  </span>
                                </div>
                                <div className="space-y-1 font-mono text-[9px]">
                                  {[
                                    {
                                      time: "14:22:01",
                                      event:
                                        "Invalid Handshake (IP: 192.168.1.1)",
                                      type: "WARN",
                                    },
                                    {
                                      time: "14:21:45",
                                      event: "Packet Fragmentation in Buffer B",
                                      type: "INFO",
                                    },
                                    {
                                      time: "14:20:12",
                                      event:
                                        "Unauthorized Access Attempt - Persona: AVIVA",
                                      type: "CRITICAL",
                                    },
                                    {
                                      time: "14:18:55",
                                      event:
                                        "Sync Pulse Detected from External Node",
                                      type: "INFO",
                                    },
                                  ].map((log, i) => (
                                    <div
                                      key={i}
                                      className="flex gap-4 p-2 bg-white/[0.02] border-b border-white/5"
                                    >
                                      <span className="opacity-40">
                                        {log.time}
                                      </span>
                                      <span
                                        className={cn(
                                          "font-bold",
                                          log.type === "CRITICAL"
                                            ? "text-red-500"
                                            : log.type === "WARN"
                                              ? "text-amber-500"
                                              : theme.accentClass,
                                        )}
                                      >
                                        [{log.type}]
                                      </span>
                                      <span className="text-text-secondary truncate">
                                        {log.event}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button className="flex-1 py-3 bg-red-500/10 border border-red-500/40 text-red-500 technical-label hover:bg-red-500/20 transition-all">
                                  Hard_Lockdown
                                </button>
                                <button
                                  className={`flex-1 py-3 bg-white/5 border border-white/10 hover:border-white/40 technical-label transition-all ${theme.accentClass}`}
                                >
                                  Clear_Logs
                                </button>
                              </div>
                            </div>
                          )}

                          {activeTab === "blueprint" && (
                            <div className="pt-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                              <div className="aspect-square bg-grid relative border border-white/10 p-8 flex items-center justify-center">
                                <div className="absolute inset-4 border border-dashed border-white/10 flex items-center justify-center">
                                  <Layers className="w-32 h-32 text-accent/10" />
                                  {/* Schematic overlays */}
                                  <div className="absolute top-0 w-full h-[1px] bg-accent/30" />
                                  <div className="absolute bottom-0 w-full h-[1px] bg-accent/30" />
                                  <div className="absolute left-0 h-full w-[1px] bg-accent/30" />
                                  <div className="absolute right-0 h-full w-[1px] bg-accent/30" />

                                  <motion.div
                                    animate={{
                                      height: ["40%", "60%", "40%"],
                                      top: ["30%", "20%", "30%"],
                                    }}
                                    transition={{
                                      duration: 2,
                                      repeat: Infinity,
                                      ease: "easeInOut",
                                    }}
                                    className="absolute left-4 w-[2px] bg-accent shadow-[0_0_15px_var(--accent)]"
                                  />
                                </div>
                                <div className="relative z-10 w-full h-full flex flex-col justify-between">
                                  <div className="flex justify-between">
                                    <span className="technical-label text-[8px] bg-bg px-2">
                                      Layer_01: Input_Cortex
                                    </span>
                                    <span className="technical-label text-[8px] bg-bg px-2">
                                      v4.2.1-final
                                    </span>
                                  </div>
                                  <div className="flex justify-center">
                                    <div className="blueprint-node">
                                      <span
                                        className={`technical-label font-bold ${theme.accentClass}`}
                                      >
                                        WDBX_Core_v4
                                      </span>
                                      <div className="mt-2 space-y-1">
                                        <div className="h-1 w-24 bg-white/5 rounded-full overflow-hidden">
                                          <motion.div
                                            animate={{ width: ["0%", "100%"] }}
                                            transition={{
                                              duration: 3,
                                              repeat: Infinity,
                                            }}
                                            className={`h-full ${theme.accentClass.replace("text", "bg")}`}
                                          />
                                        </div>
                                        <span className="micro-label opacity-40">
                                          Processing_Weight: 1.42
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="technical-label text-[8px] bg-bg px-2">
                                      Relativity_Buffer_Shift
                                    </span>
                                    <span className="technical-label text-[8px] bg-bg px-2">
                                      MLAI_Proprietary
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-4">
                                <h3 className="technical-label">
                                  Architecture_Specs
                                </h3>
                                <div className="grid grid-cols-1 gap-2">
                                  {[
                                    { k: "Cores", v: "128x Neural Quantum" },
                                    { k: "Buffer", v: "2.4 PB L1 Cache" },
                                    { k: "Integrity", v: "99.99% Guaranteed" },
                                  ].map((spec) => (
                                    <div
                                      key={spec.k}
                                      className="flex justify-between border-b border-white/5 py-2"
                                    >
                                      <span className="technical-label opacity-40">
                                        {spec.k}
                                      </span>
                                      <span className="technical-value text-white">
                                        {spec.v}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
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

                          {activeTab === "about" && (
                            <div className="pt-6 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                              <div className="relative aspect-video bg-white/5 border border-white/10 overflow-hidden group">
                                <img
                                  src="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=800"
                                  alt="Robotics Lab"
                                  className="w-full h-full object-cover opacity-40 grayscale group-hover:grayscale-0 transition-all duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/20 to-transparent" />
                                <div className="absolute bottom-6 left-6 right-6">
                                  <h3
                                    className={cn(
                                      "technical-label text-xl mb-1",
                                      theme.accentLightClass,
                                    )}
                                  >
                                    MLAI_CORPORATION
                                  </h3>
                                  <p className="micro-label opacity-60">
                                    Founded 2024 / Silicon Valley Research Wing
                                  </p>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-4">
                                  <h4 className="technical-label text-white uppercase tracking-[0.2em]">
                                    Our_Mission
                                  </h4>
                                  <p className="text-[11px] leading-relaxed text-text-dim font-light">
                                    To bridge the gap between human intuition
                                    and machine throughput through multi-layered
                                    persona architectures that prioritize
                                    ethical safety as much as computational
                                    speed.
                                  </p>
                                </div>
                                <div className="space-y-4">
                                  <h4 className="technical-label text-white uppercase tracking-[0.2em]">
                                    The_Tri-Layer
                                  </h4>
                                  <p className="text-[11px] leading-relaxed text-text-dim font-light">
                                    Our proprietary WDBX engine utilizes a
                                    dynamic trifecta of personas (Abbey, Aviva,
                                    Abi) to ensure every neural step is
                                    calculated, reviewed, and balanced.
                                  </p>
                                </div>
                              </div>

                              <div className="space-y-4 pt-4">
                                <h4 className="technical-label text-white uppercase tracking-[0.2em] px-2 border-l-2 border-accent">
                                  Leadership_Grid
                                </h4>
                                <div className="grid grid-cols-3 gap-2">
                                  {[
                                    {
                                      name: "Dr. Sarah Lynch",
                                      role: "Chief_Architect",
                                    },
                                    {
                                      name: "Marcus Vane",
                                      role: "Ethical_Director",
                                    },
                                    {
                                      name: "Elena Korova",
                                      role: "Uplink_Specialist",
                                    },
                                  ].map((p, i) => (
                                    <div
                                      key={i}
                                      className="p-3 bg-white/[0.02] border border-white/5"
                                    >
                                      <span className="technical-value text-white block text-[10px]">
                                        {p.name}
                                      </span>
                                      <span className="micro-label opacity-40 uppercase">
                                        {p.role}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="p-4 technical-panel bg-white/5 border-white/10 flex items-center justify-between">
                                <span className="technical-label text-[10px]">
                                  Contact_Corporation
                                </span>
                                <button
                                  onClick={() => setIsInquiryOpen(true)}
                                  className="px-4 py-2 bg-white text-bg font-bold text-[9px] uppercase tracking-widest hover:bg-accent-light hover:text-white transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                                >
                                  Open_Channel
                                </button>
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
    </>
  );
}
