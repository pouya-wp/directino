"use client";

import { useRef, type ReactNode } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";

// 3D tilt that follows the cursor over the panel and settles back when it leaves.
export function Tilt({ children, max = 8, className }: { children: ReactNode; max?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rx = useSpring(useTransform(py, [-1, 1], [max, -max]), { stiffness: 120, damping: 18 });
  const ry = useSpring(useTransform(px, [-1, 1], [-max, max]), { stiffness: 120, damping: 18 });

  return (
    <div
      className={`[perspective:1400px] ${className ?? ""}`}
      onPointerMove={(e) => {
        if (reduce || e.pointerType !== "mouse" || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        px.set(Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (r.width / 1.2))));
        py.set(Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (r.height / 1.2))));
      }}
      onPointerLeave={() => {
        px.set(0);
        py.set(0);
      }}
    >
      <motion.div ref={ref} style={reduce ? undefined : { rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}>
        {children}
      </motion.div>
    </div>
  );
}
