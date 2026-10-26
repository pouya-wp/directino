"use client";

import { Fragment } from "react";
import { motion, useReducedMotion } from "motion/react";

/*
  Masked word-by-word rise. Splits on words, never letters,
  so Persian glyphs keep their joined shapes.
*/
export function WordReveal({ text, delay = 0, className }: { text: string; delay?: number; className?: string }) {
  const reduce = useReducedMotion();
  const words = text.split(" ");
  return (
    <span className={className}>
      {words.map((word, i) => (
        <Fragment key={i}>
          <span className="inline-block overflow-hidden pb-[0.12em] align-top">
            <motion.span
              className="inline-block"
              initial={reduce ? false : { y: "110%", rotate: 4 }}
              animate={{ y: 0, rotate: 0 }}
              transition={{ duration: 1, delay: delay + i * 0.07, ease: [0.16, 1, 0.3, 1] }}
            >
              {word}
            </motion.span>
          </span>
          {i < words.length - 1 && " "}
        </Fragment>
      ))}
    </span>
  );
}
