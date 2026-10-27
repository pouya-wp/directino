"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { ArrowUp } from "@phosphor-icons/react";
import type { Dict } from "@/i18n/dictionaries";
import type { AppDict } from "@/i18n/app";
import { ChannelIcon } from "./channel-icon";
import { Magnetic } from "./fx/magnetic";
import { PressButton } from "./fx/press";
import { TLink } from "./fx/transitions";
import { LangSwitch } from "./lang-switch";

const WORDMARK = "Directino".split("");

// Roughly one reply every 1.4s across customers; a feel number for the live line, not a metric.
function useLiveCount(lang: "fa" | "en") {
  const [n, setN] = useState(0);
  useEffect(() => {
    const t = window.setInterval(() => setN((v) => v + 1), 1400);
    return () => window.clearInterval(t);
  }, []);
  return new Intl.NumberFormat(lang === "fa" ? "fa-IR" : "en-US").format(n);
}

export function Footer({ dict, app, lang }: { dict: Dict; app: AppDict; lang: "fa" | "en" }) {
  const reduce = useReducedMotion();
  const count = useLiveCount(lang);
  const mark = useRef<HTMLDivElement>(null);
  const markIn = useInView(mark, { once: true, amount: 0.4 });
  const base = `/${lang}`;

  const links = [
    { href: `${base}#how`, label: dict.nav.how },
    { href: `${base}#features`, label: dict.nav.features },
    { href: `${base}#pricing`, label: dict.nav.pricing },
    { href: `${base}/about`, label: app.links.about },
    { href: `${base}/security`, label: app.links.security },
    { href: `${base}/contact`, label: app.links.contact },
  ];
  const legal = [
    { href: `${base}/legal/terms`, label: app.links.terms },
    { href: `${base}/legal/privacy`, label: app.links.privacy },
    { href: `${base}/legal/refund`, label: app.links.refund },
  ];

  return (
    <footer className="relative overflow-hidden border-t border-white/10 text-night-ink">
      <div className="mx-auto grid max-w-[1400px] gap-12 px-4 pt-16 md:grid-cols-[1.2fr_auto_auto_auto] md:gap-x-16 md:px-8">
        <p className="max-w-[24ch] text-2xl leading-snug tracking-tight md:text-3xl">
          {dict.footer.liveA}{" "}
          <motion.span
            key={count}
            initial={reduce ? false : { y: "60%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
            className="inline-block rounded-full bg-accent px-3 font-mono font-medium text-accent-ink tabular-nums"
          >
            {count}
          </motion.span>{" "}
          {dict.footer.liveB}
        </p>

        <nav aria-label={dict.footer.product}>
          <p className="mb-4 text-sm text-night-muted">{dict.footer.product}</p>
          <ul className="grid grid-cols-2 gap-x-10 gap-y-2.5 whitespace-nowrap">
            {links.map((l) => {
              const inner = (
                <>
                  {l.label}
                  <span className="absolute inset-x-0 -bottom-0.5 h-px scale-x-0 bg-accent transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100 ltr:origin-left rtl:origin-right" />
                </>
              );
              return (
                <li key={l.href}>
                  {l.href.includes("#") ? (
                    <a href={l.href} className="group relative inline-block text-lg">
                      {inner}
                    </a>
                  ) : (
                    <TLink href={l.href} label={l.label} className="group relative inline-block text-lg">
                      {inner}
                    </TLink>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <div>
          <p className="mb-4 text-sm text-night-muted">{dict.footer.channels}</p>
          <div className="flex gap-2">
            {(["instagram", "whatsapp", "telegram"] as const).map((c) => (
              <Magnetic key={c} strength={0.4}>
                <span className="grid size-12 place-items-center rounded-full border border-white/15 transition-colors duration-300 hover:border-accent hover:bg-accent hover:text-accent-ink">
                  <ChannelIcon channel={c} size={20} />
                </span>
              </Magnetic>
            ))}
          </div>
          <LangSwitch lang={lang} className="mt-4 -ms-3 !text-night-muted hover:!text-night-ink" />
        </div>

        <Magnetic strength={0.3}>
          <PressButton
            aria-label={dict.footer.top}
            onClick={() => window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" })}
            radius={40}
            pressedRadius={18}
            className="size-20 bg-accent text-accent-ink"
          >
            <ArrowUp size={26} weight="bold" aria-hidden />
          </PressButton>
        </Magnetic>
      </div>

      {/* Giant wordmark: letters rise in, then hop under the cursor. */}
      <div ref={mark} dir="ltr" aria-hidden className="mt-16 flex select-none justify-center overflow-hidden px-2 leading-[0.8]">
        {WORDMARK.map((ch, i) => (
          <motion.span
            key={i}
            className="inline-block cursor-default font-[family-name:var(--font-geist)] text-[20.5vw] font-semibold tracking-[-0.06em] text-night-ink/90 transition-colors duration-300 hover:text-accent"
            initial={reduce ? false : { y: "100%" }}
            animate={markIn ? { y: "18%" } : undefined}
            whileHover={reduce ? undefined : { y: "0%", transition: { type: "spring", stiffness: 500, damping: 12 } }}
            transition={{ type: "spring", stiffness: 90, damping: 14, delay: i * 0.05 }}
          >
            {ch}
          </motion.span>
        ))}
      </div>

      <div className="relative border-t border-white/10">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-4 px-4 py-6 text-sm text-night-muted md:px-8">
          <p>
            © 2026 {dict.footer.rights} <span className="text-accent">{app.slogan}</span>
          </p>
          <ul className="flex gap-6">
            {legal.map((l) => (
              <li key={l.href}>
                <TLink href={l.href} label={l.label} className="transition-colors hover:text-night-ink">
                  {l.label}
                </TLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
