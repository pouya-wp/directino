"use client";

import { motion, useScroll, useSpring } from "motion/react";

// Hairline under the nav that fills with page progress.
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });
  return (
    <motion.span
      aria-hidden
      className="absolute inset-x-6 bottom-0 h-px origin-left bg-accent rtl:origin-right"
      style={{ scaleX }}
    />
  );
}
