"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";

const BRAND = "beyondex.one".split("");

// Wisps of steam: each path draws upward, drifts and fades, on its own loop.
const STEAM = [
  "M20 90 C 5 70, 35 55, 20 35 S 30 5, 20 -10",
  "M50 90 C 65 72, 35 52, 52 32 S 40 4, 50 -12",
  "M80 90 C 68 68, 95 52, 80 30 S 88 2, 80 -10",
];

/*
  Studio credit, served like a dish: steam rises off the line, and the brand letters
  drop into the pot one by one with a little splash bounce.
*/
export function KitchenCredit({ lead, href }: { lead: string; href: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const reduce = useReducedMotion();

  return (
    <div ref={ref} className="relative overflow-hidden rounded-[32px] border border-line bg-surface px-6 pb-14 pt-28 text-center md:px-12 md:pt-36">
      {/* Steam */}
      <svg aria-hidden viewBox="0 -14 100 106" className="absolute left-1/2 top-4 h-28 w-28 -translate-x-1/2 md:h-36 md:w-36" fill="none">
        {STEAM.map((d, i) => (
          <motion.path
            key={i}
            d={d}
            stroke="var(--muted)"
            strokeWidth={3}
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0, y: 10 }}
            animate={
              reduce || !inView
                ? { pathLength: inView ? 1 : 0, opacity: inView ? 0.35 : 0 }
                : { pathLength: [0, 1, 1], opacity: [0, 0.55, 0], y: [10, -6, -18] }
            }
            transition={{ duration: 2.8, delay: 1.2 + i * 0.45, repeat: reduce ? 0 : Infinity, ease: "easeOut" }}
          />
        ))}
      </svg>

      <motion.p
        className="text-2xl text-muted md:text-3xl"
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        {lead}
      </motion.p>

      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        dir="ltr"
        className="group mt-4 inline-flex font-[family-name:var(--font-geist)] text-[clamp(3rem,11vw,9rem)] font-semibold leading-none tracking-[-0.05em]"
      >
        {BRAND.map((ch, i) => (
          <motion.span
            key={i}
            className={`inline-block ${ch === "." ? "text-accent-text" : "text-ink"} transition-colors duration-300 group-hover:text-accent-text`}
            initial={reduce ? false : { y: "-160%", rotate: (i % 2 ? 1 : -1) * (20 + i * 3), opacity: 0 }}
            animate={inView ? { y: 0, rotate: 0, opacity: 1 } : undefined}
            whileHover={reduce ? undefined : { y: "-12%", rotate: (i % 2 ? 1 : -1) * 8 }}
            transition={{ type: "spring", stiffness: 380, damping: 11, mass: 0.9, delay: 0.4 + i * 0.07 }}
          >
            {ch}
          </motion.span>
        ))}
      </a>

      {/* The pot rim the letters land in. */}
      <motion.div
        aria-hidden
        className="mx-auto mt-6 h-3 rounded-full bg-accent"
        initial={reduce ? false : { width: 0 }}
        animate={inView ? { width: "min(70%, 560px)" } : undefined}
        transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  );
}
