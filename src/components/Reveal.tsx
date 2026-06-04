import { type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

export const Reveal = ({
  children,
  width = "fit-content",
}: {
  children: ReactNode;
  width?: "fit-content" | "100%";
}) => {
  const shouldReduceMotion = useReducedMotion();
  const motionProps = shouldReduceMotion
    ? { initial: false }
    : {
        initial: { opacity: 0, y: 30 },
        whileInView: { opacity: 1, y: 0 },
        transition: { duration: 0.6, ease: "easeOut" as const },
      };

  return (
    <motion.div
      {...motionProps}
      viewport={{ once: true, margin: "-100px" }}
      style={{ width }}
    >
      {children}
    </motion.div>
  );
};
