"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Dict, StormMessage } from "@/i18n/dictionaries";
import { ChannelIcon } from "./channel-icon";

type Thread = { id: number; msg: StormMessage; replied: boolean };

const VISIBLE = 3;
const CYCLE_MS = 3600;
const REPLY_DELAY_MS = 1500;

export function InboxStorm({ hero, lang }: { hero: Dict["hero"]; lang: "fa" | "en" }) {
  const reduce = useReducedMotion();
  const messages = hero.messages;
  const [threads, setThreads] = useState<Thread[]>(() =>
    messages.slice(0, VISIBLE).map((msg, i) => ({ id: i, msg, replied: true })).reverse(),
  );
  const [count, setCount] = useState(1284);
  const next = useRef(VISIBLE);

  useEffect(() => {
    if (reduce) return;
    const timers: number[] = [];
    const interval = window.setInterval(() => {
      const id = next.current++;
      const msg = messages[id % messages.length];
      setThreads((prev) => [{ id, msg, replied: false }, ...prev].slice(0, VISIBLE));
      timers.push(
        window.setTimeout(() => {
          setThreads((prev) => prev.map((t) => (t.id === id ? { ...t, replied: true } : t)));
          setCount((c) => c + 1);
        }, REPLY_DELAY_MS),
      );
    }, CYCLE_MS);
    return () => {
      window.clearInterval(interval);
      timers.forEach(window.clearTimeout);
    };
  }, [reduce, messages]);

  const formatted = new Intl.NumberFormat(lang === "fa" ? "fa-IR" : "en-US").format(count);

  return (
    <div className="relative w-full rounded-[28px] border border-line bg-surface p-3 shadow-[0_40px_80px_-40px_rgb(18_21_17/0.35)] md:p-4">
      <div className="flex items-end justify-between px-3 pb-4 pt-3">
        <div>
          <motion.p
            key={count}
            initial={reduce ? false : { y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="font-mono text-4xl font-medium tracking-tight text-ink tabular-nums md:text-5xl"
          >
            {formatted}
          </motion.p>
          <p className="mt-1 text-sm text-muted">{hero.counterLabel}</p>
        </div>
        <div className="flex gap-1.5 text-muted">
          {(["instagram", "whatsapp", "telegram"] as const).map((c) => (
            <span key={c} className="grid size-9 place-items-center rounded-full bg-surface-2" title={hero.channelNames[c]}>
              <ChannelIcon channel={c} size={17} />
            </span>
          ))}
        </div>
      </div>

      <ul className="flex flex-col gap-2" aria-live="off">
        <AnimatePresence initial={false} mode="popLayout">
          {threads.map((t) => (
            <motion.li
              key={t.id}
              layout
              initial={{ opacity: 0, y: -24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.25 } }}
              transition={{ type: "spring", stiffness: 140, damping: 20 }}
              className="rounded-[18px] bg-surface-2 p-4"
            >
              <div className="mb-3 flex items-center gap-2 text-xs text-muted">
                <ChannelIcon channel={t.msg.channel} size={14} />
                <span dir="auto" className="font-medium text-ink">{t.msg.from}</span>
                {t.msg.kind === "comment" && (
                  <span className="rounded-full border border-line px-2 py-0.5">{hero.commentTag}</span>
                )}
              </div>
              <p dir="auto" className="w-fit max-w-[85%] rounded-[18px] rounded-ss-md bg-surface px-3.5 py-2 text-[15px] leading-relaxed text-ink">
                {t.msg.text}
              </p>
              <div className="mt-2 flex justify-end">
                <AnimatePresence mode="wait" initial={false}>
                  {t.replied ? (
                    <motion.p
                      key="reply"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ type: "spring", stiffness: 180, damping: 22 }}
                      className="max-w-[88%] rounded-[18px] rounded-se-md bg-accent px-3.5 py-2 text-[15px] leading-relaxed text-accent-ink"
                    >
                      {t.msg.reply}
                    </motion.p>
                  ) : (
                    <motion.span
                      key="typing"
                      exit={{ opacity: 0 }}
                      className="inline-flex items-center gap-1 rounded-full bg-accent/40 px-3.5 py-3"
                      aria-label={hero.typing}
                    >
                      {[0, 1, 2].map((d) => (
                        <motion.span
                          key={d}
                          className="size-1.5 rounded-full bg-accent-ink"
                          animate={{ opacity: [0.25, 1, 0.25] }}
                          transition={{ duration: 0.9, repeat: Infinity, delay: d * 0.15 }}
                        />
                      ))}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}
