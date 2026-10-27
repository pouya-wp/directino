"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

/*
  Each site page fades in under the opening curtain. Opacity only: a transform or filter
  here would become the containing block for fixed and GSAP-pinned elements inside the page.
*/
export default function SiteTemplate({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.15 }}>
      {children}
    </motion.div>
  );
}
