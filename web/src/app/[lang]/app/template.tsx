"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

// Dashboard pages fade in quickly; opacity only so fixed dialogs inside pages keep the viewport.
export default function AppTemplate({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>
      {children}
    </motion.div>
  );
}
