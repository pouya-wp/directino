"use client";

import { useEffect, useState, type PointerEvent } from "react";

import { motion, useReducedMotion } from "motion/react";
import { HandWaving, ShieldCheck, UserSwitch } from "@phosphor-icons/react";
import type { Dict } from "@/i18n/dictionaries";
import { RevealText } from "./fx/reveal-text";

// Index that advances on a timer; frozen at 0 under reduced motion.
function useTick(count: number, ms: number, off: boolean | null) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (off) return;
    const t = window.setInterval(() => setI((v) => (v + 1) % count), ms);
    return () => window.clearInterval(t);
  }, [count, ms, off]);
  return i;
}

const reveal = (reduce: boolean | null, i: number) =>
  reduce
    ? {}
    : {
        initial: { opacity: 0, y: 32 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.25 },
        transition: { duration: 0.8, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] as const },
      };

// Feeds the cursor position to every card so the glow travels across tile borders.
function trackSpot(e: PointerEvent<HTMLDivElement>) {
  for (const card of e.currentTarget.querySelectorAll<HTMLElement>("[data-spot]")) {
    const r = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${e.clientX - r.left}px`);
    card.style.setProperty("--my", `${e.clientY - r.top}px`);
  }
}

export function Features({ f, rtl }: { f: Dict["features"]; rtl: boolean }) {
  const reduce = useReducedMotion();
  const voiceAt = useTick(f.voice.samples.length, 2400, reduce);
  const wordAt = useTick(f.lang.words.length, 1300, reduce);
  const rowAt = useTick(f.catalog.rows.length, 1700, reduce);

  return (
    <section id="features" className="mx-auto max-w-[1400px] px-4 py-28 md:px-8 md:py-36">
      <RevealText text={f.title} className="max-w-[16ch] text-[clamp(2.25rem,4.4vw,4rem)] font-semibold leading-[1.05] tracking-tighter" />

      <div className="mt-16 grid grid-cols-1 gap-4 md:grid-cols-6" onPointerMove={trackSpot}>
        {/* Brand voice: wide tile with three tones side by side */}
        <motion.article {...reveal(reduce, 0)} data-spot className="relative flex flex-col justify-between gap-10 rounded-[28px] border border-line bg-surface p-7 md:col-span-4 md:p-9 overflow-hidden">
          <span aria-hidden className="spot" />
          <div className="max-w-[42ch]">
            <h3 className="text-2xl font-medium tracking-tight">{f.voice.title}</h3>
            <p className="mt-3 leading-relaxed text-muted">{f.voice.body}</p>
          </div>
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-end">
            {f.voice.samples.map((s, i) => (
              <motion.p
                key={s}
                animate={{ y: i === voiceAt ? -12 : 0, scale: i === voiceAt ? 1.03 : 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 18 }}
                className={`rounded-[18px] px-4 py-3 text-[15px] leading-relaxed transition-colors duration-500 ${
                  i === voiceAt ? "bg-accent text-accent-ink" : "bg-surface-2 text-ink"
                }`}
              >
                {s}
              </motion.p>
            ))}
          </div>
        </motion.article>

        {/* Finglish: accent tile, type is the visual */}
        <motion.article {...reveal(reduce, 1)} data-spot className="relative flex min-h-[320px] flex-col justify-between rounded-[28px] bg-accent p-7 text-accent-ink [--spot-color:rgb(255_255_255/0.45)] md:col-span-2 md:p-9 overflow-hidden">
          <span aria-hidden className="spot" />
          <div className="flex flex-col gap-1 text-4xl font-semibold leading-[1.1] tracking-tighter md:text-[2.6rem]" dir="auto">
            {f.lang.words.map((w, i) => (
              <motion.span
                key={w}
                dir="auto"
                animate={{ opacity: i === wordAt ? 1 : 0.3, x: i === wordAt ? (rtl ? -10 : 10) : 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              >
                {w}
              </motion.span>
            ))}
          </div>
          <div className="mt-8">
            <h3 className="text-xl font-medium tracking-tight">{f.lang.title}</h3>
            <p className="mt-2 leading-relaxed opacity-75">{f.lang.body}</p>
          </div>
        </motion.article>

        {/* Catalog: ink tile with live rows */}
        <motion.article {...reveal(reduce, 2)} data-spot className="relative flex flex-col justify-between gap-10 rounded-[28px] bg-ink p-7 text-bg md:col-span-2 md:p-9 overflow-hidden">
          <span aria-hidden className="spot" />
          <ul className="flex flex-col gap-2 text-sm">
            {f.catalog.rows.map(([name, price, stock], i) => (
              <li
                key={name}
                className={`grid grid-cols-[1fr_auto_auto] items-center gap-4 rounded-[14px] px-4 py-3 transition-[background-color,color,translate] duration-500 ${
                  i === rowAt ? "translate-x-1 bg-accent text-accent-ink rtl:-translate-x-1" : "bg-bg/[0.07]"
                }`}
              >
                <span>{name}</span>
                <span className="font-mono tabular-nums">{price}</span>
                <span className="opacity-60">{stock}</span>
              </li>
            ))}
          </ul>
          <div>
            <h3 className="text-xl font-medium tracking-tight">{f.catalog.title}</h3>
            <p className="mt-2 leading-relaxed opacity-70">{f.catalog.body}</p>
          </div>
        </motion.article>

        <motion.article {...reveal(reduce, 3)} data-spot className="relative flex flex-col justify-between gap-10 rounded-[28px] border border-line bg-surface p-7 md:col-span-2 md:p-9 overflow-hidden">
          <span aria-hidden className="spot" />
          <div className="flex items-center gap-3">
            <span className="grid size-14 place-items-center rounded-full bg-surface-2">
              <HandWaving size={24} aria-hidden />
            </span>
            <span className="relative h-px flex-1 overflow-hidden bg-line">
              <motion.span
                className="absolute inset-y-0 start-0 w-full"
                initial={{ x: rtl ? "100%" : "-100%" }}
                animate={reduce ? undefined : { x: [rtl ? "100%" : "-100%", "0%"] }}
                transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 0.6, ease: [0.65, 0, 0.35, 1] }}
              >
                <span className="absolute -top-[3px] end-0 size-[7px] rounded-full bg-accent-text shadow-[0_0_12px_var(--accent)]" />
              </motion.span>
            </span>
            <span className="grid size-14 place-items-center rounded-full bg-accent text-accent-ink">
              <UserSwitch size={24} aria-hidden />
            </span>
          </div>
          <div>
            <h3 className="text-xl font-medium tracking-tight">{f.handoff.title}</h3>
            <p className="mt-2 leading-relaxed text-muted">{f.handoff.body}</p>
          </div>
        </motion.article>

        <motion.article {...reveal(reduce, 4)} data-spot className="relative flex flex-col justify-between gap-10 rounded-[28px] bg-surface-2 p-7 md:col-span-2 md:p-9 overflow-hidden">
          <span aria-hidden className="spot" />
          <div className="relative flex flex-col gap-2 text-sm" aria-hidden>
            {["win a free iPhone >> bit.ly", "check my page for cheaper!!", "DM for followers 10k"].map((s, i) => (
              <motion.span
                key={s}
                dir="ltr"
                className="relative w-fit rounded-full bg-surface px-4 py-2 text-muted"
                initial={reduce ? false : { filter: "blur(0px)", opacity: 1 }}
                whileInView={{ filter: "blur(1.5px)", opacity: 0.55 }}
                viewport={{ once: true, amount: 1 }}
                transition={{ delay: 0.5 + i * 0.35, duration: 0.4 }}
              >
                {s}
                <motion.span
                  className="absolute inset-x-3 top-1/2 h-px origin-left bg-muted"
                  initial={reduce ? false : { scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true, amount: 1 }}
                  transition={{ delay: 0.2 + i * 0.35, duration: 0.35, ease: [0.65, 0, 0.35, 1] }}
                />
              </motion.span>
            ))}
            <motion.span
              className="absolute end-0 top-1/2 -translate-y-1/2 text-accent-text"
              initial={reduce ? false : { scale: 0, rotate: -40 }}
              whileInView={{ scale: 1, rotate: 0 }}
              viewport={{ once: true, amount: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 12, delay: 1.5 }}
            >
              <ShieldCheck size={44} weight="fill" />
            </motion.span>
          </div>
          <div>
            <h3 className="text-xl font-medium tracking-tight">{f.spam.title}</h3>
            <p className="mt-2 leading-relaxed text-muted">{f.spam.body}</p>
          </div>
        </motion.article>
      </div>
    </section>
  );
}
