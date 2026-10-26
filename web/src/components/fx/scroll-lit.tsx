"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";

// A paragraph whose words light up as it scrolls through the reading line.
export function ScrollLit({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.5"] });
  const words = text.split(" ");
  if (reduce) return <p className={className}>{text}</p>;
  return (
    <p ref={ref} className={className}>
      {words.map((w, i) => (
        <Word key={i} p={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>
          {w}
        </Word>
      ))}
    </p>
  );
}

function Word({ children, p, range }: { children: string; p: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(p, range, [0.18, 1]);
  return (
    <>
      <motion.span style={{ opacity }}>{children}</motion.span>{" "}
    </>
  );
}
