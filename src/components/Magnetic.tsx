import { useRef, useState, type MouseEvent, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

export const Magnetic = ({ children }: { children: ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const shouldReduceMotion = useReducedMotion();

  const handleMouseMove = (e: MouseEvent) => {
    if (shouldReduceMotion) return;
    const { clientX, clientY } = e;
    if (ref.current) {
      const { width, height, left, top } = ref.current.getBoundingClientRect();
      const x = clientX - (left + width / 2);
      const y = clientY - (top + height / 2);
      setPosition({ x: x * 0.35, y: y * 0.35 });
    }
  };

  const handleMouseLeave = () => {
    if (shouldReduceMotion) return;
    setPosition({ x: 0, y: 0 });
  };

  const { x, y } = position;
  const motionProps = shouldReduceMotion
    ? {}
    : {
        animate: { x, y },
        transition: {
          type: "spring" as const,
          stiffness: 150,
          damping: 15,
          mass: 0.1,
        },
      };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
};
