"use client";

import { motion, useReducedMotion } from "motion/react";
import { ArrowCounterClockwise, CalendarCheck, LockKey, PauseCircle } from "@phosphor-icons/react";
import type { AppDict } from "@/i18n/app";
import { RevealText } from "./fx/reveal-text";

const icons = [CalendarCheck, ArrowCounterClockwise, LockKey, PauseCircle];

// Guarantees, stated plainly, as a staggered row of promises.
export function Trust({ t }: { t: AppDict["trust"] }) {
  const reduce = useReducedMotion();
  return (
    <section className="mx-auto max-w-[1400px] px-4 pb-12 md:px-8">
      <div className="rounded-[32px] bg-surface p-6 md:p-12">
        <RevealText text={t.title} className="max-w-[22ch] text-[clamp(1.9rem,3.4vw,3rem)] font-semibold leading-[1.1] tracking-tighter" />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {t.items.map((item, i) => {
            const Icon = icons[i % icons.length];
            return (
              <motion.div
                key={item.title}
                initial={reduce ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ type: "spring", stiffness: 120, damping: 18, delay: i * 0.08 }}
              >
                <motion.span
                  className="grid size-12 place-items-center rounded-2xl bg-accent text-accent-ink"
                  whileHover={reduce ? undefined : { rotate: -8, scale: 1.08 }}
                >
                  <Icon size={24} weight="duotone" aria-hidden />
                </motion.span>
                <h3 className="mt-5 text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 leading-relaxed text-muted">{item.body}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
