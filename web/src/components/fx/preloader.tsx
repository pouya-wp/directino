"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion } from "motion/react";
import { INTRO_SECONDS, introSeen, markIntroSeen } from "./intro";
import { LogoMark } from "../logo";

/*
  Server-rendered overlay with a CSS fallback exit, so the page never stays
  covered if JS is slow. The client drives the counter and skips repeat visits.
*/
export function Preloader({ label }: { label: string }) {
  const [gone, setGone] = useState(false);
  const counter = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // Repeat visits and reduced motion are already hidden by CSS before paint.
    if (introSeen() || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const controls = animate(0, 100, {
      duration: INTRO_SECONDS - 0.6,
      ease: [0.65, 0, 0.35, 1],
      onUpdate: (v) => {
        if (counter.current) counter.current.textContent = String(Math.round(v)).padStart(3, "0");
      },
    });
    const t = window.setTimeout(() => {
      markIntroSeen();
      setGone(true);
    }, INTRO_SECONDS * 1000 + 600);
    return () => {
      controls.stop();
      window.clearTimeout(t);
    };
  }, []);

  if (gone) return null;

  return (
    <div aria-hidden className="preloader fixed inset-0 z-[70] flex flex-col justify-between bg-night p-6 text-night-ink md:p-10">
      <motion.div
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 14, delay: 0.1 }}
        className="w-fit"
      >
        <LogoMark size={64} typing />
      </motion.div>
      <div className="flex items-end justify-between gap-6" dir="ltr">
        <span className="overflow-hidden text-[clamp(3rem,10vw,9rem)] font-semibold leading-none tracking-tighter">
          <motion.span
            className="block"
            initial={{ y: "105%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          >
            {label}
          </motion.span>
        </span>
        <span ref={counter} className="font-mono text-[clamp(2rem,6vw,5rem)] font-light leading-none tabular-nums text-accent">
          000
        </span>
      </div>
    </div>
  );
}
