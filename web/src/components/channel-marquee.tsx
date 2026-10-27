"use client";

import { useRef } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  wrap,
} from "motion/react";
import { ChatCircleDots } from "@phosphor-icons/react";
import type { Dict } from "@/i18n/dictionaries";

const BASE_SPEED = 2.2; // percent of one copy per second

// The page's only marquee. Scrolling speeds it up, reverses it and leans the type into the motion.
export function ChannelMarquee({ items, rtl }: { items: Dict["marquee"]; rtl: boolean }) {
  const reduce = useReducedMotion();
  const base = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 });
  const factor = useTransform(velocity, [-1500, 0, 1500], [-5, 0, 5], { clamp: false });
  const skew = useTransform(velocity, [-2500, 2500], [12, -12]);
  const dir = useRef(1);
  const sign = rtl ? 1 : -1;
  const x = useTransform(base, (v) => `${rtl ? wrap(0, 50, v) : wrap(-50, 0, v)}%`);

  useAnimationFrame((_, delta) => {
    if (reduce) return;
    const f = factor.get();
    if (f < 0) dir.current = -1;
    else if (f > 0) dir.current = 1;
    let move = dir.current * BASE_SPEED * (delta / 1000);
    move += move * Math.abs(f);
    base.set(base.get() + sign * move);
  });

  const row = [...items, ...items];
  return (
    <section aria-label="Channels" className="overflow-hidden border-y border-line py-10">
      <motion.div className="flex w-max items-center" style={{ x, skewX: reduce ? 0 : skew }}>
        {[0, 1].map((copy) => (
          <div key={copy} className="flex items-center gap-12 pe-12" aria-hidden={copy === 1}>
            {row.map((item, i) => (
              <span key={`${copy}-${i}`} className="flex items-center gap-12 font-display whitespace-nowrap text-4xl font-medium tracking-tighter text-ink md:text-6xl">
                <span className={i % 3 === 1 ? "rounded-full bg-accent px-6 pb-2 pt-1 text-accent-ink md:px-8" : ""}>{item}</span>
                <ChatCircleDots size={40} weight="fill" className="text-accent-text" aria-hidden />
              </span>
            ))}
          </div>
        ))}
      </motion.div>
    </section>
  );
}
