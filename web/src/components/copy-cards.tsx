"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Copy } from "@phosphor-icons/react";
import { Magnetic } from "./fx/magnetic";

// Contact channels you can grab with one click; the card flips its icon to a check.
export function CopyCards({ items, copy, copied }: { items: { label: string; value: string }[]; copy: string; copied: string }) {
  const [done, setDone] = useState<string | null>(null);
  return (
    <div className="flex flex-col gap-4">
      {items.map((ch) => (
        <Magnetic key={ch.label} strength={0.08} className="block">
          <button
            type="button"
            title={copy}
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(ch.value);
              } catch {}
              setDone(ch.label);
              window.setTimeout(() => setDone(null), 1500);
            }}
            className="group relative w-full overflow-hidden rounded-[24px] bg-surface-2 p-6 text-start transition-colors hover:bg-accent hover:text-accent-ink"
          >
            <p className="text-sm opacity-70">{ch.label}</p>
            <p dir="auto" className="mt-1 text-lg font-medium">
              {ch.value}
            </p>
            <span className="absolute end-5 top-1/2 -translate-y-1/2">
              <AnimatePresence mode="wait" initial={false}>
                {done === ch.label ? (
                  <motion.span key="ok" initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }} className="flex items-center gap-1 text-sm font-medium">
                    <Check size={18} weight="bold" />
                    {copied}
                  </motion.span>
                ) : (
                  <motion.span key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="opacity-40 group-hover:opacity-100">
                    <Copy size={18} />
                  </motion.span>
                )}
              </AnimatePresence>
            </span>
          </button>
        </Magnetic>
      ))}
    </div>
  );
}
