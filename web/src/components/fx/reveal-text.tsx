"use client";

import { Fragment } from "react";
import { motion, useReducedMotion } from "motion/react";

/*
  Section headings rise word by word when they enter the viewport.
  Words, not letters, so Persian keeps its joins.
*/
export function RevealText({ text, as = "h2", className }: { text: string; as?: "h1" | "h2" | "h3" | "p"; className?: string }) {
  const reduce = useReducedMotion();
  const Tag = as;
  const words = text.split(" ");
  return (
    <Tag className={className}>
      <motion.span
        className="block"
        initial={reduce ? false : "hidden"}
        whileInView="shown"
        viewport={{ once: true, amount: 0.6 }}
        transition={{ staggerChildren: 0.06 }}
      >
        {words.map((word, i) => (
          <Fragment key={i}>
            <span className="inline-block overflow-hidden pb-[0.14em] align-top">
              <motion.span
                className="inline-block"
                variants={{ hidden: { y: "115%", rotate: 5 }, shown: { y: 0, rotate: 0 } }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              >
                {word}
              </motion.span>
            </span>
            {i < words.length - 1 && " "}
          </Fragment>
        ))}
      </motion.span>
    </Tag>
  );
}
