import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, ChevronLeft } from "lucide-react";
import { cn } from "../lib/utils";

interface InquiryFormProps {
  isOpen: boolean;
  onClose: () => void;
  activePersona: string;
}

export const InquiryForm = ({
  isOpen,
  onClose,
  activePersona,
}: InquiryFormProps) => {
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
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const validate = () => {
    setError(null);
    const p = activePersona;

    if (step === 0) {
      if (!formData.name.trim()) {
        if (p === "ABBEY") setError("Identity verification required. Please provide your full name for ethical tracing.");
        else if (p === "AVIVA") setError("Data source undefined. Please input the lead investigator's name for documentation.");
        else setError("Strict protocol violation: Subject name is mandatory for regulatory compliance.");
        return false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        if (p === "ABBEY") setError("Communication integrity check failed. Please provide a correctly formatted email.");
        else if (p === "AVIVA") setError("Neural uplink address invalid. Verification of email format is required for sync.");
        else setError("Registry error: Input email must meet global standardization criteria.");
        return false;
      }
    } else if (step === 1) {
      if (!formData.company.trim()) {
        if (p === "ABBEY") setError("Organizational context missing. Which entity will be collaborating with us?");
        else if (p === "AVIVA") setError("Research origin unknown. Please define the originating firm or laboratory.");
        else setError("Entity verification failed. Corporate lineage must be declared for regulatory clearance.");
        return false;
      }
      if (formData.services.length === 0) {
        if (p === "ABBEY") setError("Intentional focus required. Please select the areas of ethical engagement.");
        else if (p === "AVIVA") setError("Experimental parameters empty. Select at least one service for neural mapping.");
        else setError("Operational scope undefined. At least one service module must be licensed.");
        return false;
      }
    } else if (step === 2) {
      if (!formData.budget) {
        if (p === "ABBEY") setError("Resource allocation audit required. Please select a sustainable budget range.");
        else if (p === "AVIVA") setError("Research funding unknown. Budget parameters are needed to scale the compute node.");
        else setError("Fiscal data missing. Budget disclosure is mandatory as per section 7-B guidelines.");
        return false;
      }
      if (!formData.message.trim()) {
        if (p === "ABBEY") setError("Contextual depth missing. Please explain the ethical purpose of your inquiry.");
        else if (p === "AVIVA") setError("Research abstract empty. Provide a detailed summary for the neural analyzer.");
        else setError("Documentation incomplete. Narrative project description is required for audit trails.");
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (step < 3) {
      if (validate()) {
        setStep((s) => Math.min(s + 1, 3));
      }
    } else {
      onClose();
    }
  };

  const prevStep = () => {
    setStep((s) => Math.max(s - 1, 0));
    setError(null);
  };

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
        className={cn(
          "relative w-full max-w-[500px] bg-[#131316] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl",
          activePersona === "ABBEY" && "shadow-[0_0_50px_rgba(0,242,255,0.15)] border-cyan-500/20",
          activePersona === "AVIVA" && "shadow-[0_0_50px_rgba(168,85,247,0.15)] border-purple-500/20",
          activePersona === "ABI" && "ring-1 ring-orange-500/20 animate-pulse border-orange-500/30"
        )}
        style={{
          filter: activePersona === "AVIVA" ? "contrast(1.1) brightness(1.1)" : "none",
        }}
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
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full bg-[#0f0f12] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent/40 transition-colors"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-widest font-bold text-white/30 ml-1">
                            Work Email
                          </label>
                          <input
                            placeholder="jane@company.com"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className="w-full bg-[#0f0f12] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent/40 transition-colors"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-widest font-bold text-white/30 ml-1">
                            Phone
                          </label>
                          <input
                            placeholder="+1234567890"
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
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
                            value={formData.company}
                            onChange={(e) => setFormData({...formData, company: e.target.value})}
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
                                const newServices = formData.services.includes(s)
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
                          <select 
                            value={formData.budget}
                            onChange={(e) => setFormData({...formData, budget: e.target.value})}
                            className="w-full bg-[#0f0f12] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent/40 transition-colors appearance-none cursor-pointer">
                            <option value="">Select a budget</option>
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
                            value={formData.message}
                            onChange={(e) => setFormData({...formData, message: e.target.value})}
                            className="w-full bg-[#0f0f12] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent/40 transition-colors resize-none"
                          />
                        </div>
                      </>
                    )}
                  </div>

                  <AnimatePresence mode="wait">
                    {error && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                        animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] font-mono leading-tight">
                          <AlertCircle className="size-3 shrink-0" />
                          <span>{error}</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
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
