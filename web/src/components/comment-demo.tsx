"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useInView, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ArrowCounterClockwise, Heart, PaperPlaneTilt } from "@phosphor-icons/react";
import type { Dict } from "@/i18n/dictionaries";
import { PressButton } from "./fx/press";
import { RevealText } from "./fx/reveal-text";

const STEP_MS = 900;

export function CommentDemo({ comment }: { comment: Dict["comment"] }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const total = comment.comments.length;
  const [done, setDone] = useState(reduce ? total : 0);
  const [run, setRun] = useState(0);
  const section = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: section, offset: ["start end", "center center"] });
  const rotateX = useTransform(scrollYProgress, [0, 1], [28, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.86, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [120, 0]);
  const imgScale = useTransform(scrollYProgress, [0, 1], [1.35, 1]);

  useEffect(() => {
    if (reduce || !inView) return;
    const timers = comment.comments.map((_, i) => window.setTimeout(() => setDone(i + 1), 600 + i * STEP_MS));
    return () => timers.forEach(window.clearTimeout);
  }, [inView, run, reduce, comment.comments]);

  const replay = useCallback(() => {
    setDone(0);
    setRun((r) => r + 1);
  }, []);

  return (
    <section ref={section} className="mx-auto grid max-w-[1400px] items-center gap-14 px-4 py-28 md:px-8 md:py-40 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
      <div className="max-w-[560px]">
        <RevealText text={comment.title} className="text-[clamp(2.25rem,4.4vw,4rem)] font-semibold leading-[1.05] tracking-tighter" />
        <p className="mt-6 max-w-[48ch] text-lg leading-relaxed text-muted">{comment.body}</p>
      </div>

      <motion.div
        ref={ref}
        style={reduce ? undefined : { rotateX, scale, y, transformPerspective: 1200 }}
        className="grid origin-bottom gap-4 rounded-[28px] border border-line bg-surface p-3 shadow-[0_60px_120px_-60px_rgb(18_21_17/0.5)] sm:grid-cols-[0.85fr_1fr] md:p-4"
      >
        <div className="relative aspect-[4/5] overflow-hidden rounded-[18px] bg-surface-2">
          {/* TODO: replace with a real product photo, 1080x1350 */}
          <motion.div className="absolute inset-0" style={reduce ? undefined : { scale: imgScale }}>
            <Image
              src="https://picsum.photos/seed/directino-linen-drop/1080/1350"
              alt={comment.postCaption}
              fill
              sizes="(min-width: 1024px) 300px, 90vw"
              className="object-cover"
            />
          </motion.div>
        </div>
        <div className="flex flex-col p-2">
          <p className="text-[15px] leading-relaxed text-ink">{comment.postCaption}</p>
          <ul className="mt-5 flex flex-1 flex-col gap-4">
            {comment.comments.map((c, i) => {
              const answered = i < done;
              return (
                <li key={c.from} className="text-[15px]">
                  <div className="flex items-start justify-between gap-3">
                    <p dir="auto">
                      <span className="font-medium text-ink">{c.from}</span> <span className="text-muted">{c.text}</span>
                    </p>
                    <Heart size={14} className="mt-1 shrink-0 text-muted" aria-hidden />
                  </div>
                  <AnimatePresence initial={false}>
                    {answered && (
                      <motion.div
                        initial={reduce ? false : { opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ type: "spring", stiffness: 160, damping: 22 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-2 flex flex-wrap items-center gap-2 ps-4">
                          <span className="text-muted">{comment.publicReply}</span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-ink">
                            <PaperPlaneTilt size={12} weight="fill" aria-hidden />
                            {comment.dmSent}
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </ul>
          <PressButton
            onClick={replay}
            disabled={done < total}
            radius={22}
            pressedRadius={8}
            className="mt-6 h-11 w-fit border border-line px-5 text-sm text-ink disabled:opacity-40"
          >
            <ArrowCounterClockwise size={15} aria-hidden />
            {comment.run}
          </PressButton>
        </div>
      </motion.div>
    </section>
  );
}
