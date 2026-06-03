import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export const Reveal = ({ children, width = "fit-content" }: { children: React.ReactNode, width?: "fit-content" | "100%" }) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 30 }}
      whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={shouldReduceMotion ? undefined : { duration: 0.6, ease: "easeOut" }}
      style={{ width }}
    >
      {children}
    </motion.div>
  );
};
