"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { CheckCircle, Copy, Lightning } from "@phosphor-icons/react";
import type { Dict } from "@/i18n/dictionaries";
import { ChannelIcon } from "./channel-icon";
import { RevealText } from "./fx/reveal-text";

type ModeKey = "draft" | "approve" | "auto";

export function Modes({ m }: { m: Dict["modes"] }) {
  const reduce = useReducedMotion();
  const [mode, setMode] = useState<ModeKey>("approve");
  const active = m.tabs.find((t) => t.key === mode)!;

  return (
    <section className="mx-auto max-w-[1100px] px-4 py-28 md:px-8 md:py-36">
      <RevealText text={m.title} className="mx-auto max-w-[18ch] text-center text-[clamp(2.25rem,4.4vw,4rem)] font-semibold leading-[1.05] tracking-tighter" />

      <div role="tablist" aria-label={m.title} className="mx-auto mt-12 flex w-fit gap-1 rounded-full border border-line bg-surface p-1.5">
        {m.tabs.map((t) => (
          <motion.button
            key={t.key}
            whileTap={reduce ? undefined : { scale: 0.92 }}
            transition={{ type: "spring", stiffness: 600, damping: 15 }}
            role="tab"
            type="button"
            aria-selected={mode === t.key}
            onClick={() => setMode(t.key as ModeKey)}
            className={`relative h-12 rounded-full px-6 text-sm font-medium transition-colors md:px-8 ${
              mode === t.key ? "text-accent-ink" : "text-muted hover:text-ink"
            }`}
          >
            {mode === t.key && (
              <motion.span
                layoutId="mode-pill"
                className="absolute inset-0 rounded-full bg-accent"
                transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <span className="relative">{t.label}</span>
          </motion.button>
        ))}
      </div>

      <div className="mt-12 grid items-center gap-10 md:grid-cols-[1fr_1.2fr]">
        <AnimatePresence mode="wait">
          <motion.p
            key={mode}
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35 }}
            className="text-2xl leading-snug tracking-tight md:text-3xl"
          >
            {active.body}
          </motion.p>
        </AnimatePresence>

        <div className="rounded-[28px] border border-line bg-surface p-5 md:p-6">
          <div className="flex items-center gap-2 text-xs text-muted">
            <ChannelIcon channel="instagram" size={14} />
            <span className="font-medium text-ink" dir="ltr">@roya.atelier</span>
          </div>
          <p className="mt-3 w-fit rounded-[18px] rounded-ss-md bg-surface-2 px-4 py-2.5 text-[15px]">{m.incoming}</p>
          <motion.p
            layout
            className={`ms-auto mt-3 w-fit max-w-[88%] rounded-[18px] rounded-se-md px-4 py-2.5 text-[15px] leading-relaxed transition-colors duration-300 ${
              mode === "auto" ? "bg-accent text-accent-ink" : "border border-dashed border-muted/50 text-ink"
            }`}
          >
            {m.reply}
          </motion.p>
          <div className="mt-5 flex justify-end">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={mode}
                initial={reduce ? false : { opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ type: "spring", stiffness: 260, damping: 24 }}
                className={`inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-medium ${
                  mode === "approve" ? "bg-ink text-bg" : mode === "auto" ? "text-accent-text" : "border border-line text-ink"
                }`}
              >
                {mode === "draft" && <Copy size={16} aria-hidden />}
                {mode === "approve" && <CheckCircle size={16} aria-hidden />}
                {mode === "auto" && <Lightning size={16} weight="fill" aria-hidden />}
                {m.actions[mode]}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
