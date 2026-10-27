"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";

/*
  A statement that lights up word by word as it scrolls through the viewport.
  Words wrapped in *asterisks* in the copy take the accent color.
*/
export function Manifesto({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });
  const words = text.split(" ");

  return (
    <section className="mx-auto max-w-[1400px] px-4 py-32 md:px-8 md:py-48">
      <p ref={ref} className="font-display max-w-[22ch] text-[clamp(2.1rem,5.2vw,4.8rem)] font-semibold leading-[1.12] tracking-tighter">
        {words.map((raw, i) => {
          const accent = raw.startsWith("*");
          const word = raw.replaceAll("*", "");
          return reduce ? (
            <span key={i} className={accent ? "text-accent-text" : ""}>
              {word}{" "}
            </span>
          ) : (
            <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} accent={accent}>
              {word}
            </Word>
          );
        })}
      </p>
    </section>
  );
}

function Word({ children, progress, range, accent }: { children: string; progress: MotionValue<number>; range: [number, number]; accent: boolean }) {
  const opacity = useTransform(progress, range, [0.12, 1]);
  const y = useTransform(progress, range, [10, 0]);
  return (
    <>
      <motion.span style={{ opacity, y }} className={`inline-block ${accent ? "text-accent-text" : ""}`}>
        {children}
      </motion.span>{" "}
    </>
  );
}
