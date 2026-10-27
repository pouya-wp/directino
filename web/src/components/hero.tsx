"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowDown } from "@phosphor-icons/react";
import type { Dict } from "@/i18n/dictionaries";
import { InboxStorm } from "./inbox-storm";
import { BubbleField } from "./fx/bubble-field";
import { Magnetic } from "./fx/magnetic";
import { Tilt } from "./fx/tilt";
import { WordReveal } from "./fx/word-reveal";
import { introDelay } from "./fx/intro";
import { PressLink } from "./fx/press";
import { PressNav } from "./fx/press-nav";

const ease = [0.16, 1, 0.3, 1] as const;

export function Hero({ dict, lang, slogan, signup }: { dict: Dict; lang: "fa" | "en"; slogan: string; signup: string }) {
  const reduce = useReducedMotion();
  const [d] = useState(introDelay);
  const rise = (delay: number) =>
    reduce
      ? {}
      : { initial: { opacity: 0, y: 28 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.9, delay: d + delay, ease } };

  return (
    <section id="top" className="relative isolate overflow-hidden">
      <BubbleField className="absolute inset-0 -z-10 size-full [mask-image:linear-gradient(to_right,transparent_8%,black_62%)] rtl:[mask-image:linear-gradient(to_left,transparent_8%,black_62%)] max-lg:[mask-image:linear-gradient(to_bottom,transparent_30%,black_80%)]" />
      <div className="mx-auto grid min-h-[100dvh] max-w-[1400px] items-center gap-14 px-4 pb-16 pt-28 md:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:pt-24">
        <div className="max-w-[640px]">
          <motion.p className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-bg/60 py-1.5 ps-1.5 pe-4 text-sm text-muted backdrop-blur" {...rise(0)}>
            <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-accent-ink">AI</span>
            {slogan}
          </motion.p>
          <h1 className="text-[clamp(2.75rem,6.2vw,5.5rem)] font-semibold leading-[1.02] tracking-tighter">
            <WordReveal text={dict.hero.headlineA} delay={d} className="block text-muted" />
            <WordReveal text={dict.hero.headlineB} delay={d + 0.12} className="block" />
          </h1>
          <motion.p className="mt-7 max-w-[46ch] text-lg leading-relaxed text-muted" {...rise(0.35)}>
            {dict.hero.sub}
          </motion.p>
          <motion.div className="mt-10 flex flex-wrap items-center gap-3" {...rise(0.45)}>
            <Magnetic>
              <PressNav href={"/" + lang + "/signup"} label={signup} className="h-14 bg-accent px-8 text-base font-medium text-accent-ink">
                {dict.hero.primary}
              </PressNav>
            </Magnetic>
            <Magnetic strength={0.2}>
              <PressLink href="#how" className="group h-14 border border-line bg-bg/60 px-7 text-base text-ink backdrop-blur">
                {dict.hero.secondary}
                <ArrowDown size={16} className="transition-transform duration-300 group-hover:translate-y-1" aria-hidden />
              </PressLink>
            </Magnetic>
          </motion.div>
        </div>

        <motion.div
          className="relative isolate mx-auto w-full max-w-[520px]"
          initial={reduce ? false : { opacity: 0, y: 80, rotateX: 25, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
          transition={{ duration: 1.3, delay: d + 0.2, ease }}
          style={{ transformPerspective: 1400 }}
        >
          <motion.div
            aria-hidden
            className="absolute -inset-x-2 -bottom-8 top-10 -z-10 rounded-[28px] bg-accent/80 md:-inset-x-6"
            initial={reduce ? false : { rotate: 0, scale: 0.9 }}
            animate={{ rotate: lang === "fa" ? 4 : -4, scale: 1 }}
            transition={{ type: "spring", stiffness: 60, damping: 12, delay: d + 0.7 }}
          />
          <Tilt max={7}>
            <InboxStorm hero={dict.hero} lang={lang} />
          </Tilt>
        </motion.div>
      </div>
    </section>
  );
}
