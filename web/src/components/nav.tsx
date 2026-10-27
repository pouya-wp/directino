"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Dict } from "@/i18n/dictionaries";
import { Logo } from "./logo";
import { ChannelIcon } from "./channel-icon";
import { ScrollProgress } from "./fx/scroll-progress";
import { PressNav } from "./fx/press-nav";
import { TLink } from "./fx/transitions";
import { LangSwitch } from "./lang-switch";
import type { AppDict } from "@/i18n/app";

const spring = { type: "spring" as const, stiffness: 260, damping: 28 };

// Link label slides up and a copy rolls in from below on hover.
function RollLink({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} className="group relative block overflow-hidden px-3 py-2 text-sm">
      <span className="block transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-full">{label}</span>
      <span aria-hidden className="absolute inset-x-3 top-full block text-ink transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-full">
        {label}
      </span>
    </a>
  );
}

// Center "island": a live line of replies the agent is sending right now.
function LiveIsland({ dict }: { dict: Dict }) {
  const reduce = useReducedMotion();
  const items = dict.hero.messages;
  const [i, setI] = useState(0);
  useEffect(() => {
    if (reduce) return;
    const t = window.setInterval(() => setI((v) => (v + 1) % items.length), 2800);
    return () => window.clearInterval(t);
  }, [reduce, items.length]);
  const m = items[i];

  return (
    <div className="flex h-10 items-center gap-2.5 overflow-hidden rounded-full bg-ink ps-1.5 pe-4 text-xs text-bg">
      <span className="relative grid size-7 place-items-center rounded-full bg-accent text-accent-ink">
        <ChannelIcon channel={m.channel} size={14} />
        <span className="absolute -end-0.5 -top-0.5 size-2 rounded-full bg-accent ring-2 ring-ink">
          <span className="absolute inset-0 animate-ping rounded-full bg-accent motion-reduce:hidden" />
        </span>
      </span>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={i}
          initial={{ y: 18, opacity: 0, filter: "blur(4px)" }}
          animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
          exit={{ y: -18, opacity: 0, filter: "blur(4px)" }}
          transition={spring}
          className="whitespace-nowrap"
        >
          {dict.nav.live} <span dir="auto" className="font-medium text-accent">{m.from}</span>
          <span className="opacity-50"> · {dict.nav.liveAgo}</span>
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

// Calm, fixed header: logo, a slow live line of replies, links and the CTA. No collapsing on scroll.
export function Nav({ dict, app, lang }: { dict: Dict; app: AppDict; lang: "fa" | "en" }) {
  const base = `/${lang}`;
  const links = [
    { href: `${base}#how`, label: dict.nav.how },
    { href: `${base}#features`, label: dict.nav.features },
    { href: `${base}#pricing`, label: dict.nav.pricing },
    { href: `${base}#faq`, label: dict.nav.faq },
  ];

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4">
      <nav className="relative mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-3 rounded-full border border-line bg-bg/70 ps-3 pe-2 backdrop-blur-xl shadow-[inset_0_1px_0_rgb(255_255_255/0.06),0_20px_50px_-30px_rgb(0_0_0/0.5)]">
        <TLink href={base} label={app.common.home} aria-label="Directino" className="flex items-center">
          <Logo size={36} />
        </TLink>
        <div className="hidden xl:block">
          <LiveIsland dict={dict} />
        </div>
        <div className="flex items-center gap-1">
          <ul className="me-1 hidden items-center text-muted lg:flex">
            {links.map((l) => (
              <li key={l.href}>
                <RollLink href={l.href} label={l.label} />
              </li>
            ))}
          </ul>
          <LangSwitch lang={lang} />
          <TLink href={`${base}/login`} label={app.links.login} className="hidden h-11 items-center rounded-full px-3 text-sm text-muted transition-colors hover:text-ink sm:inline-flex">
            {app.links.login}
          </TLink>
          <PressNav href={`${base}/signup`} label={app.links.signup} radius={24} pressedRadius={10} className="h-12 bg-ink px-5 text-sm font-medium text-bg md:px-6">
            {dict.nav.cta}
          </PressNav>
        </div>
        <ScrollProgress />
      </nav>
    </header>
  );
}
