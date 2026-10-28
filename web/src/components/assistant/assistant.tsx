"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { PaperPlaneRight, X } from "@phosphor-icons/react";
import type { Dict } from "@/i18n/dictionaries";
import { LogoMark } from "../logo";
import { PressButton } from "../fx/press";
import { ask } from "./brain";

type Msg = { id: number; from: "bot" | "user"; text: string };

const spring = { type: "spring" as const, stiffness: 320, damping: 28 };

// Bot replies appear word by word, like the agent typing them out.
function StreamedText({ text, animate }: { text: string; animate: boolean }) {
  const words = text.split(" ");
  return (
    <motion.span initial={animate ? "hidden" : false} animate="shown" transition={{ staggerChildren: 0.025 }}>
      {words.map((w, i) => (
        <motion.span key={i} variants={{ hidden: { opacity: 0, filter: "blur(3px)" }, shown: { opacity: 1, filter: "blur(0px)" } }}>
          {w}{" "}
        </motion.span>
      ))}
    </motion.span>
  );
}

export function Assistant({ a, rtl }: { a: Dict["assistant"]; rtl: boolean }) {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [hint, setHint] = useState(false);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([{ id: 0, from: "bot", text: a.greeting }]);
  const nextId = useRef(1);
  const scroller = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLInputElement>(null);

  // A one-time nudge bubble next to the launcher.
  useEffect(() => {
    const show = window.setTimeout(() => setHint(true), 5000);
    const hide = window.setTimeout(() => setHint(false), 12000);
    return () => {
      window.clearTimeout(show);
      window.clearTimeout(hide);
    };
  }, []);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: reduce ? "auto" : "smooth" });
  }, [msgs, typing, reduce]);

  useEffect(() => {
    if (open) window.setTimeout(() => field.current?.focus(), 250);
  }, [open]);

  const send = async (text: string) => {
    const clean = text.trim();
    if (!clean || typing) return;
    setInput("");
    setMsgs((m) => [...m, { id: nextId.current++, from: "user", text: clean }]);
    setTyping(true);
    const [answer] = await Promise.all([ask(clean, a), new Promise((r) => setTimeout(r, reduce ? 0 : 900))]);
    setTyping(false);
    setMsgs((m) => [...m, { id: nextId.current++, from: "bot", text: answer }]);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void send(input);
  };

  const side = rtl ? "left-4 md:left-6" : "right-4 md:right-6";
  const asked = msgs.some((m) => m.from === "user");

  return (
    <div className={`fixed bottom-4 z-[55] md:bottom-6 ${side}`}>
      <AnimatePresence>
        {open && (
          <motion.section
            key="panel"
            role="dialog"
            aria-label={a.title}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.9 }}
            transition={spring}
            style={{ transformOrigin: rtl ? "bottom left" : "bottom right" }}
            className={`absolute bottom-20 flex h-[min(600px,calc(100dvh-7rem))] w-[min(400px,calc(100vw-2rem))] flex-col overflow-hidden rounded-[28px] border border-line bg-surface shadow-[0_40px_100px_-30px_rgb(0_0_0/0.6)] ${
              rtl ? "left-0" : "right-0"
            }`}
          >
            <header className="flex items-center gap-3 border-b border-line px-4 py-3.5">
              <LogoMark size={40} typing={typing} />
              <div className="flex-1">
                <p className="font-semibold">{a.title}</p>
                <p className="flex items-center gap-1.5 text-xs text-muted">
                  <span className="size-1.5 rounded-full bg-accent-text" />
                  {a.status}
                </p>
              </div>
              <PressButton aria-label={a.close} onClick={() => setOpen(false)} radius={20} pressedRadius={10} className="size-10 text-muted hover:bg-surface-2">
                <X size={18} aria-hidden />
              </PressButton>
            </header>

            <div ref={scroller} data-lenis-prevent className="flex flex-1 flex-col gap-3 overflow-y-auto overscroll-contain px-4 py-5">
              {msgs.map((m) => (
                <motion.div
                  key={m.id}
                  initial={reduce ? false : { opacity: 0, y: 12, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={spring}
                  className={`flex items-end gap-2 ${m.from === "user" ? "justify-end" : ""}`}
                >
                  {m.from === "bot" && <LogoMark size={26} />}
                  <p
                    className={`max-w-[80%] px-4 py-2.5 text-[15px] leading-relaxed ${
                      m.from === "user"
                        ? "rounded-[20px] rounded-ee-md bg-ink text-bg"
                        : "rounded-[20px] rounded-es-md bg-surface-2 text-ink"
                    }`}
                  >
                    {m.from === "bot" ? <StreamedText text={m.text} animate={!reduce && m.id !== 0} /> : m.text}
                  </p>
                </motion.div>
              ))}
              <AnimatePresence>
                {typing && (
                  <motion.div
                    key="typing"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-end gap-2"
                  >
                    <LogoMark size={26} typing />
                    <span className="inline-flex gap-1 rounded-[20px] rounded-es-md bg-surface-2 px-4 py-3.5">
                      {[0, 1, 2].map((d) => (
                        <motion.span
                          key={d}
                          className="size-1.5 rounded-full bg-muted"
                          animate={{ y: [0, -4, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: d * 0.12 }}
                        />
                      ))}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <AnimatePresence initial={false}>
              {!asked && (
                <motion.div
                  key="chips"
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-wrap gap-2 px-4 pb-3"
                >
                  {a.chips.map((c, i) => (
                    <motion.button
                      key={c}
                      type="button"
                      onClick={() => void send(c)}
                      initial={reduce ? false : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ ...spring, delay: 0.15 + i * 0.05 }}
                      whileTap={{ scale: 0.94 }}
                      className="rounded-full border border-line px-3.5 py-2 text-sm text-ink transition-colors hover:border-accent hover:bg-accent hover:text-accent-ink"
                    >
                      {c}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={onSubmit} className="flex items-center gap-2 border-t border-line p-3">
              <label htmlFor="dx-assistant-input" className="sr-only">
                {a.placeholder}
              </label>
              <input
                id="dx-assistant-input"
                ref={field}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={a.placeholder}
                autoComplete="off"
                className="h-12 flex-1 rounded-full bg-surface-2 px-5 text-[15px] text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <PressButton
                type="submit"
                aria-label={a.send}
                disabled={!input.trim() || typing}
                radius={24}
                pressedRadius={12}
                className="size-12 bg-accent text-accent-ink disabled:opacity-40"
              >
                <PaperPlaneRight size={20} weight="fill" className="rtl:-scale-x-100" aria-hidden />
              </PressButton>
            </form>
          </motion.section>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {hint && !open && (
          <motion.button
            key="hint"
            type="button"
            onClick={() => {
              setOpen(true);
              setHint(false);
            }}
            initial={{ opacity: 0, x: rtl ? -12 : 12, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={spring}
            className={`absolute bottom-3 whitespace-nowrap rounded-[20px] rounded-ee-md bg-ink px-4 py-2.5 text-sm font-medium text-bg shadow-lg ${rtl ? "left-[4.5rem]" : "right-[4.5rem]"}`}
          >
            {a.hint}
          </motion.button>
        )}
      </AnimatePresence>

      <PressButton
        aria-label={open ? a.close : a.open}
        aria-expanded={open}
        onClick={() => {
          setOpen((v) => !v);
          setHint(false);
        }}
        radius={30}
        pressedRadius={16}
        className="size-16 bg-ink text-bg shadow-[0_20px_40px_-15px_rgb(0_0_0/0.6)]"
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X size={24} aria-hidden />
            </motion.span>
          ) : (
            <motion.span key="mark" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }}>
              <LogoMark size={38} />
            </motion.span>
          )}
        </AnimatePresence>
      </PressButton>
    </div>
  );
}
