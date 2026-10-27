"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { LockKey, LockKeyOpen } from "@phosphor-icons/react";

const GLYPHS = "0123456789abcdef";
const toCipher = (i: number, tick: number) => GLYPHS[(i * 7 + tick * 3) % 16];

/*
  A message seals itself into ciphertext letter by letter, holds, then opens again.
  Persian is scrambled per character on purpose: once sealed, it should not read.
*/
export function EncryptDemo({ label, plain, note }: { label: string; plain: string; note: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.5 });
  const reduce = useReducedMotion();
  const [sealed, setSealed] = useState(0);
  const [locked, setLocked] = useState(false);
  const [tick, setTick] = useState(0);
  const chars = [...plain];

  useEffect(() => {
    if (!inView || reduce) return;
    let n = 0;
    let dir = 1;
    let hold = 0;
    const t = window.setInterval(() => {
      setTick((x) => x + 1);
      if (hold > 0) {
        hold--;
        return;
      }
      n += dir;
      if (n >= chars.length) {
        n = chars.length;
        dir = -1;
        hold = 28;
        setLocked(true);
      } else if (n <= 0) {
        n = 0;
        dir = 1;
        hold = 22;
        setLocked(false);
      }
      setSealed(n);
    }, 55);
    return () => window.clearInterval(t);
  }, [inView, reduce, chars.length]);

  return (
    <div ref={ref} className="relative overflow-hidden rounded-[32px] bg-night p-6 text-night-ink md:p-10">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-night-muted">{label}</p>
        <motion.span
          key={String(locked)}
          initial={{ scale: 0.4, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 14 }}
          className={`grid size-11 place-items-center rounded-full ${locked ? "bg-accent text-accent-ink" : "bg-white/10"}`}
        >
          {locked ? <LockKey size={20} weight="fill" /> : <LockKeyOpen size={20} />}
        </motion.span>
      </div>
      <p className="mt-6 min-h-[2.6em] break-all font-mono text-2xl leading-snug md:text-4xl" dir="auto">
        {chars.map((c, i) => {
          const isSealed = i < sealed;
          return (
            <span key={i} className={isSealed ? "text-accent" : ""}>
              {isSealed && c !== " " ? toCipher(i, tick) : c}
            </span>
          );
        })}
      </p>
      <p className="mt-6 max-w-[56ch] text-night-muted">{note}</p>
    </div>
  );
}
