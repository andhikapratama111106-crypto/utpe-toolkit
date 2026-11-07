"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { motion as tokens } from "@/lib/design-system";

/** Fade + 8px rise on mount. No animation under prefers-reduced-motion. */
export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div className={className} initial={reduce ? false : tokens.reveal.initial} animate={tokens.reveal.animate} transition={{ ...tokens.reveal.transition, delay }}>
      {children}
    </motion.div>
  );
}
