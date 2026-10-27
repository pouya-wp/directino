"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChatCircleDots } from "@phosphor-icons/react";
import type { Dict } from "@/i18n/dictionaries";
import { RevealText } from "./fx/reveal-text";
import { LogoMark } from "./logo";

const TYPING_MS = 750;

// FAQ as a conversation: each question is the customer's bubble, the answer is Directino replying.
export function Faq({ faq, rtl }: { faq: Dict["faq"]; rtl: boolean }) {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState<number | null>(0);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    if (!typing) return;
    const t = window.setTimeout(() => setTyping(false), TYPING_MS);
    return () => window.clearTimeout(t);
  }, [typing]);

  const toggle = (i: number) => {
    if (open === i) {
      setOpen(null);
      return;
    }
    setOpen(i);
    setTyping(!reduce);
  };

  return (
    <section id="faq" className="mx-auto grid max-w-[1400px] gap-12 px-4 py-28 md:px-8 md:py-36 lg:grid-cols-[0.75fr_1.25fr]">
      <div className="lg:sticky lg:top-32 lg:self-start">
        <RevealText text={faq.title} className="text-[clamp(2.25rem,4.4vw,4rem)] font-semibold leading-[1.05] tracking-tighter" />
        <ChatCircleDots size={56} weight="fill" className="mt-8 text-accent-text" aria-hidden />
      </div>

      <ul className="flex flex-col gap-3">
        {faq.items.map((item, i) => {
          const active = open === i;
          return (
            <motion.li
              key={item.q}
              initial={reduce ? false : { opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ type: "spring", stiffness: 120, damping: 18, delay: i * 0.05 }}
              className="flex flex-col"
            >
              <motion.button
                type="button"
                aria-expanded={active}
                onClick={() => toggle(i)}
                whileTap={reduce ? undefined : { scale: 0.97 }}
                whileHover={reduce ? undefined : { x: rtl ? -6 : 6 }}
                transition={{ type: "spring", stiffness: 500, damping: 22 }}
                className={`w-fit max-w-full rounded-[24px] rounded-es-md px-6 py-4 text-start text-lg font-medium transition-colors duration-300 ${
                  active ? "bg-ink text-bg" : "bg-surface text-ink hover:bg-surface-2"
                }`}
              >
                {item.q}
              </motion.button>

              {/* Height opens smoothly; the bubble keeps its final size while the agent is typing, so nothing below jumps. */}
              <AnimatePresence initial={false}>
                {active && (
                  <motion.div
                    key="answer"
                    initial={reduce ? false : { height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ height: { duration: 0.45, ease: [0.16, 1, 0.3, 1] }, opacity: { duration: 0.25 } }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-end justify-end gap-2.5 pt-3">
                      <motion.div
                        initial={reduce ? false : { scale: 0.85, y: 12 }}
                        animate={{ scale: 1, y: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="relative max-w-[56ch] origin-bottom-right rounded-[24px] rounded-ee-md bg-accent px-6 py-4 leading-relaxed text-accent-ink rtl:origin-bottom-left"
                      >
                        <motion.p
                          initial="hidden"
                          animate={typing ? "hidden" : "shown"}
                          transition={{ staggerChildren: 0.018 }}
                        >
                          {item.a.split(" ").map((w, j) => (
                            <motion.span key={j} variants={{ hidden: { opacity: 0 }, shown: { opacity: 1 } }} transition={{ duration: 0.2 }}>
                              {w}{" "}
                            </motion.span>
                          ))}
                        </motion.p>
                        <AnimatePresence>
                          {typing && (
                            <motion.span
                              exit={{ opacity: 0 }}
                              className="absolute inset-0 flex items-center justify-center gap-1"
                              aria-hidden
                            >
                              {[0, 1, 2].map((d) => (
                                <motion.span
                                  key={d}
                                  className="size-2 rounded-full bg-accent-ink"
                                  animate={{ y: [0, -5, 0] }}
                                  transition={{ duration: 0.6, repeat: Infinity, delay: d * 0.12 }}
                                />
                              ))}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </motion.div>
                      <LogoMark size={34} typing={typing} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.li>
          );
        })}
      </ul>
    </section>
  );
}
