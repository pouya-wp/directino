"use client";

import { motion, useReducedMotion } from "motion/react";
import type { AppDict } from "@/i18n/app";
import { LogoMark } from "../logo";
import { PressNav } from "../fx/press-nav";

// Deterministic burst so server and client agree.
const BURST = Array.from({ length: 22 }, (_, i) => {
  const angle = (i / 22) * Math.PI * 2 + (i % 3) * 0.2;
  const dist = 160 + ((i * 47) % 120);
  return { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist * 0.7, r: ((i * 53) % 60) - 30, s: 0.6 + ((i * 29) % 50) / 100, accent: i % 3 !== 0 };
});

export function Success({ c, dashboard, lang }: { c: AppDict["checkout"]; dashboard: string; lang: "fa" | "en" }) {
  const reduce = useReducedMotion();
  return (
    <main className="mx-auto flex min-h-[calc(100dvh-5rem)] max-w-[720px] flex-col items-center justify-center px-4 pb-16 text-center">
      <div className="relative grid place-items-center">
        {!reduce &&
          BURST.map((b, i) => (
            <motion.span
              key={i}
              aria-hidden
              className={`absolute h-5 w-9 rounded-full rounded-ee-sm ${b.accent ? "bg-accent" : "bg-ink"}`}
              initial={{ x: 0, y: 0, scale: 0, rotate: 0, opacity: 1 }}
              animate={{ x: b.x, y: b.y, scale: b.s, rotate: b.r, opacity: [1, 1, 0] }}
              transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.3 + (i % 5) * 0.03, opacity: { duration: 1.6, times: [0, 0.7, 1], delay: 0.3 } }}
            />
          ))}
        <motion.div initial={reduce ? false : { scale: 0, rotate: -40 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 200, damping: 12 }}>
          <LogoMark size={120} />
        </motion.div>
      </div>
      <motion.h1
        initial={reduce ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.7 }}
        className="mt-10 text-5xl font-semibold tracking-tight md:text-6xl"
      >
        {c.successTitle}
      </motion.h1>
      <motion.p initial={reduce ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.62, duration: 0.7 }} className="mt-5 max-w-[46ch] text-lg text-muted">
        {c.successBody}
      </motion.p>
      <motion.div initial={reduce ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.74, duration: 0.7 }} className="mt-10 flex flex-col items-center gap-4">
        <PressNav href={`/${lang}/app/channels`} label={dashboard} className="h-14 bg-accent px-10 text-base font-medium text-accent-ink">
          {c.successCta}
        </PressNav>
        <p className="text-sm text-muted">{c.receipt}</p>
      </motion.div>
    </main>
  );
}
