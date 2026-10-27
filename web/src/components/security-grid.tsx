"use client";

import { motion, useReducedMotion } from "motion/react";
import { ClockCountdown, Database, FileText, GlobeHemisphereEast, LockKey, PlugsConnected } from "@phosphor-icons/react";

const icons = [LockKey, ClockCountdown, PlugsConnected, FileText, Database, GlobeHemisphereEast];

// Security promises as tiles; the lock tile is the visual anchor.
export function SecurityGrid({ items }: { items: { title: string; body: string }[] }) {
  const reduce = useReducedMotion();
  return (
    <div className="grid gap-4 md:grid-cols-6">
      {items.map((item, i) => {
        const Icon = icons[i % icons.length];
        const big = i === 0;
        return (
          <motion.article
            key={item.title}
            initial={reduce ? false : { opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ type: "spring", stiffness: 110, damping: 18, delay: (i % 3) * 0.07 }}
            className={`flex flex-col justify-between gap-10 rounded-[28px] p-7 md:p-9 ${
              big ? "bg-night text-night-ink md:col-span-4 md:row-span-2" : i === 3 ? "bg-accent text-accent-ink md:col-span-2" : "border border-line bg-surface md:col-span-2"
            }`}
          >
            <motion.span
              className={`grid place-items-center rounded-2xl ${big ? "size-20 bg-accent text-accent-ink" : i === 3 ? "size-12 bg-accent-ink text-accent" : "size-12 bg-surface-2"}`}
              animate={big && !reduce ? { rotate: [0, -6, 6, 0] } : undefined}
              transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 2 }}
            >
              <Icon size={big ? 40 : 24} weight="duotone" aria-hidden />
            </motion.span>
            <div>
              <h3 className={`font-semibold tracking-tight ${big ? "text-3xl md:text-4xl" : "text-xl"}`}>{item.title}</h3>
              <p className={`mt-3 leading-relaxed ${big ? "max-w-[44ch] text-lg text-night-muted" : i === 3 ? "opacity-80" : "text-muted"}`}>{item.body}</p>
            </div>
          </motion.article>
        );
      })}
    </div>
  );
}
