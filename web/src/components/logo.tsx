"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";

/*
  Mascot mark: a speech bubble with a face. The eyes follow the cursor and blink;
  on hover the face turns into the three typing dots, because that is what it does all night.
*/
export function LogoMark({ size = 34, typing: forced, gaze, shy = false }: { size?: number; typing?: boolean; gaze?: { x: number; y: number } | null; shy?: boolean }) {
  const reduce = useReducedMotion();
  const ref = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState(false);
  const [blink, setBlink] = useState(false);
  const lookX = useSpring(useMotionValue(0), { stiffness: 200, damping: 18 });
  const lookY = useSpring(useMotionValue(0), { stiffness: 200, damping: 18 });
  const typing = forced ?? hover;

  // A caller can steer the eyes (e.g. to follow a text caret) instead of the pointer.
  useEffect(() => {
    if (!gaze) return;
    lookX.set(gaze.x * 2.4);
    lookY.set(gaze.y * 1.8);
  }, [gaze, lookX, lookY]);

  useEffect(() => {
    if (reduce) return;
    const onMove = (e: PointerEvent) => {
      const r = ref.current?.getBoundingClientRect();
      if (!r || ref.current?.dataset.steered === "1") return;
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const d = Math.max(1, Math.hypot(dx, dy));
      lookX.set((dx / d) * Math.min(2.2, d / 60));
      lookY.set((dy / d) * Math.min(1.6, d / 60));
    };
    let t: number;
    const loop = () => {
      t = window.setTimeout(() => {
        setBlink(true);
        window.setTimeout(() => setBlink(false), 140);
        loop();
      }, 2600 + Math.random() * 2600);
    };
    loop();
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("pointermove", onMove);
    };
  }, [reduce, lookX, lookY]);

  return (
    <motion.svg
      ref={ref}
      data-steered={gaze ? "1" : "0"}
      width={size}
      height={size}
      viewBox="0 0 40 40"
      aria-hidden
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      whileHover={reduce ? undefined : { rotate: -8, scale: 1.08 }}
      transition={{ type: "spring", stiffness: 400, damping: 12 }}
      className="shrink-0 overflow-visible"
    >
      {/* The bubble is a capital D: flat spine on the left, round bowl on the right, tail at the foot. */}
      <path
        d="M4 7.5A3.5 3.5 0 0 1 7.5 4H18a14 14 0 0 1 0 28h-6.2l-5.3 4.6c-1 .9-2.5.2-2.5-1.1V7.5z"
        fill="var(--accent)"
      />
      {/* AI sparkle that twinkles on its own. */}
      <motion.path
        d="M34.5 1c.5 2.9 1.6 4 4.5 4.5-2.9.5-4 1.6-4.5 4.5-.5-2.9-1.6-4-4.5-4.5 2.9-.5 4-1.6 4.5-4.5z"
        fill="var(--accent)"
        style={{ transformOrigin: "34.5px 5.5px" }}
        animate={reduce ? undefined : { scale: [1, 0.55, 1.15, 1], rotate: [0, 45, 90, 90], opacity: [1, 0.6, 1, 1] }}
        transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 1.6, ease: "easeInOut" }}
      />
      <motion.g style={reduce ? undefined : { x: lookX, y: lookY }}>
        {typing
          ? [12.5, 18.5, 24.5].map((cx, i) => (
              <motion.circle
                key={cx}
                cx={cx}
                cy={18}
                r={2.2}
                fill="var(--accent-ink)"
                initial={{ scale: 0 }}
                animate={reduce ? { scale: 1 } : { scale: 1, y: [0, -2.2, 0] }}
                transition={{ scale: { type: "spring", stiffness: 500, damping: 18 }, y: { duration: 0.6, repeat: Infinity, delay: i * 0.12 } }}
              />
            ))
          : shy
            ? [14, 23].map((cx) => (
                <motion.path
                  key={cx}
                  d={`M${cx - 2.6} 16.2q2.6 -2.6 5.2 0`}
                  fill="none"
                  stroke="var(--accent-ink)"
                  strokeWidth={2}
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.18 }}
                />
              ))
            : [14, 23].map((cx) => (
              <motion.ellipse
                key={cx}
                cx={cx}
                cy={15.5}
                rx={2.2}
                fill="var(--accent-ink)"
                initial={false}
                animate={{ ry: blink ? 0.4 : 3.1 }}
                transition={{ duration: 0.08 }}
              />
            ))}
        {shy && (
          <>
            <ellipse cx={10.5} cy={21} rx={2.4} ry={1.4} fill="#ff8fa3" opacity={0.7} />
            <ellipse cx={26.5} cy={21} rx={2.4} ry={1.4} fill="#ff8fa3" opacity={0.7} />
          </>
        )}
        <motion.path
          d="M13.8 22.2c1.4 1.8 3 2.7 4.7 2.7s3.3-.9 4.7-2.7"
          fill="none"
          stroke="var(--accent-ink)"
          strokeWidth={2.2}
          strokeLinecap="round"
          animate={{ opacity: typing ? 0 : 1, pathLength: typing ? 0 : 1 }}
          transition={{ duration: 0.2 }}
        />
      </motion.g>
    </motion.svg>
  );
}

// Wordmark: lowercase, both i-dots are little lime bubbles that hop on hover.
export function Logo({ size = 34 }: { size?: number }) {
  const reduce = useReducedMotion();
  const letters = "dırectıno".split("");
  let dotIndex = 0;
  return (
    <motion.span className="group inline-flex items-center gap-2" dir="ltr" initial="rest" whileHover="hover" animate="rest">
      <LogoMark size={size} />
      <span className="flex font-[family-name:var(--font-geist)] text-[19px] font-semibold tracking-[-0.04em] text-ink">
        {letters.map((ch, i) => {
          if (ch !== "ı") return <span key={i}>{ch}</span>;
          const n = dotIndex++;
          return (
            <span key={i} className="relative">
              ı
              <motion.span
                aria-hidden
                className="absolute left-1/2 top-[0.2em] size-[0.24em] -translate-x-1/2 rounded-full bg-accent"
                variants={reduce ? undefined : { rest: { y: 0 }, hover: { y: [0, -5, 0], transition: { duration: 0.45, delay: n * 0.12, repeat: Infinity, repeatDelay: 0.6 } } }}
              />
            </span>
          );
        })}
      </span>
    </motion.span>
  );
}
