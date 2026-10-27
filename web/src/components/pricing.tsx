"use client";

import { motion, useReducedMotion } from "motion/react";
import { Check } from "@phosphor-icons/react";
import type { Dict } from "@/i18n/dictionaries";
import { PressNav } from "./fx/press-nav";
import { plans } from "@/lib/format";
import { RevealText } from "./fx/reveal-text";

export function Pricing({ p, lang }: { p: Dict["pricing"]; lang: "fa" | "en" }) {
  const reduce = useReducedMotion();

  return (
    <section id="pricing" className="mx-auto max-w-[1400px] px-4 py-28 md:px-8 md:py-36">
      <p className="text-sm uppercase tracking-[0.18em] text-muted">{p.eyebrow}</p>
      <RevealText text={p.title} className="mt-5 max-w-[18ch] text-[clamp(2.25rem,4.4vw,4rem)] font-semibold leading-[1.05] tracking-tighter" />

      <div className="mt-16 grid items-end gap-4 [perspective:1600px] lg:grid-cols-[1fr_1.2fr_1fr]">
        {p.plans.map((plan, i) => {
          const featured = i === 1;
          return (
            <motion.article
              key={plan.name}
              initial={reduce ? false : { opacity: 0, y: 120, rotateX: 30, rotateZ: i === 0 ? -4 : i === 2 ? 4 : 0 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0, rotateZ: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ type: "spring", stiffness: 70, damping: 16, delay: featured ? 0 : 0.12 + i * 0.05 }}
              whileHover={reduce ? undefined : { y: -10 }}
              className={`relative flex flex-col rounded-[28px] p-7 md:p-9 ${
                featured ? "featured-ring bg-accent text-accent-ink lg:min-h-[600px]" : "border border-line bg-surface lg:min-h-[520px]"
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-xl font-medium">{plan.name}</h3>
                {featured && <span className="rounded-full bg-accent-ink px-3 py-1 text-xs font-medium text-accent">{p.popular}</span>}
              </div>
              <p className={`mt-2 ${featured ? "opacity-75" : "text-muted"}`}>{plan.desc}</p>
              <p className="mt-10 flex flex-wrap items-baseline gap-x-2">
                <span className="text-4xl font-semibold tracking-tighter md:text-5xl">{plan.price}</span>
                <span className={featured ? "opacity-70" : "text-muted"}>{p.period}</span>
              </p>
              <ul className="mt-10 flex flex-1 flex-col gap-3.5">
                {plan.items.map((item, j) => (
                  <motion.li
                    key={item}
                    className="flex items-center gap-3"
                    initial={reduce ? false : { opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 + j * 0.06, duration: 0.5 }}
                  >
                    <span className={`grid size-5 place-items-center rounded-full ${featured ? "bg-accent-ink text-accent" : "bg-accent text-accent-ink"}`}>
                      <Check size={11} weight="bold" aria-hidden />
                    </span>
                    {item}
                  </motion.li>
                ))}
              </ul>
              <PressNav href={"/" + lang + "/checkout?plan=" + plans[i].id} label={plan.name} className={`mt-10 h-14 w-full text-base font-medium ${featured ? "bg-accent-ink text-accent" : "bg-ink text-bg"}`}>
                {p.cta}
              </PressNav>
            </motion.article>
          );
        })}
      </div>
      <p className="mt-8 text-center text-muted">{p.note}</p>
    </section>
  );
}
