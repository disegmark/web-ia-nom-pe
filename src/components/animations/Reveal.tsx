"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
};

/** Reusable entrance motion. Every section gets the same restrained cinematic language. */
export function Reveal({ children, className, delay = 0, y = 20 }: RevealProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={{
        opacity: 0,
        y: shouldReduceMotion ? 0 : y,
        scale: shouldReduceMotion ? 1 : 0.985,
        filter: shouldReduceMotion ? "none" : "blur(5px)",
      }}
      whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-72px" }}
      transition={{
        duration: shouldReduceMotion ? 0.18 : 0.72,
        delay: shouldReduceMotion ? 0 : delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
