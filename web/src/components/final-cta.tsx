"use client";

import { useRef, type PointerEvent } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import type { Dict } from "@/i18n/dictionaries";
import { Footer } from "./footer";
import { Magnetic } from "./fx/magnetic";
import { PressNav } from "./fx/press-nav";
import type { AppDict } from "@/i18n/app";

/*
  "Lights off": the page dims to night as this section arrives, and the
  headline is only readable inside a flashlight that follows the cursor.
  Bookends the night section, so it shares its palette.
*/
export function FinalCta({ dict, app, lang }: { dict: Dict; app: AppDict; lang: "fa" | "en" }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start 0.25"] });
  const dark = useTransform(scrollYProgress, [0, 1], [0, 1]);

  const move = (e: PointerEvent<HTMLElement>) => {
    const light = ref.current?.querySelector(".flashlight");
    if (!ref.current || !light) return;
    const r = light.getBoundingClientRect();
    ref.current.style.setProperty("--fx", `${e.clientX - r.left}px`);
    ref.current.style.setProperty("--fy", `${e.clientY - r.top}px`);
    ref.current.dataset.pointer = "on";
  };

  return (
    <section ref={ref} onPointerMove={move} className="lights-off relative isolate overflow-hidden text-night-ink">
      <motion.div aria-hidden className="absolute inset-0 -z-10 bg-night" style={{ opacity: reduce ? 1 : dark }} />

      <div className="relative mx-auto max-w-[1400px] px-4 pb-24 pt-32 md:px-8 md:pt-48">
        <div className="relative">
          <h2 aria-hidden className="text-[clamp(4rem,15vw,14rem)] font-semibold leading-[0.98] tracking-tighter text-[color-mix(in_srgb,white_7%,var(--night))]">
            {dict.final.title}
          </h2>
          <h2 className="flashlight absolute inset-0 text-[clamp(4rem,15vw,14rem)] font-semibold leading-[0.98] tracking-tighter text-accent">
            {dict.final.title}
          </h2>
        </div>
        <div className="mt-12 flex flex-wrap items-center justify-between gap-6">
          <p className="text-2xl text-night-muted md:text-3xl">{dict.final.sub}</p>
          <Magnetic>
            <PressNav href={"/" + lang + "/signup"} label={app.links.signup} radius={32} pressedRadius={14} className="h-16 bg-accent px-10 text-lg font-medium text-accent-ink shadow-[0_0_60px_-10px_rgb(196_236_79/0.7)]">
              {dict.final.cta}
            </PressNav>
          </Magnetic>
        </div>
      </div>

      <Footer dict={dict} app={app} lang={lang} />
    </section>
  );
}
