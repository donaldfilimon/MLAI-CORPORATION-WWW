import React, { useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";
import { PERSONAS } from "../constants/personas";

interface TooltipProps {
  children: ReactNode;
  text: string;
  activePersona: string;
  key?: string | number;
}

export const Tooltip = ({
  children,
  text,
  activePersona,
}: TooltipProps) => {
  const [show, setShow] = useState(false);
  const theme = PERSONAS[activePersona as keyof typeof PERSONAS] || PERSONAS.ABBEY;
  
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
