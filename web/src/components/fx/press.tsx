"use client";

import { useRef, useState, type ComponentPropsWithoutRef, type PointerEvent } from "react";
import { AnimatePresence, motion, useReducedMotion, type HTMLMotionProps } from "motion/react";

type Ripple = { id: number; x: number; y: number; size: number };

/*
  Material 3 Expressive style press: the pill morphs toward a squircle and squashes
  on press, then springs back past its rest shape. A ripple grows from the touch point.
*/
function usePress(radius: number, pressedRadius: number) {
  const reduce = useReducedMotion();
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const next = useRef(0);

  const onPointerDown = (e: PointerEvent<HTMLElement>) => {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    const size = Math.hypot(r.width, r.height) * 1.25;
    const id = next.current++;
    setRipples((prev) => [...prev, { id, x: e.clientX - r.left, y: e.clientY - r.top, size }]);
    window.setTimeout(() => setRipples((prev) => prev.filter((p) => p.id !== id)), 1300);
  };

  const motionProps = reduce
    ? { style: { borderRadius: radius } }
    : {
        initial: { borderRadius: radius },
        whileHover: { borderRadius: radius * 0.8 },
        whileTap: { borderRadius: pressedRadius, scaleX: 1.04, scaleY: 0.92 },
        transition: { type: "spring" as const, stiffness: 600, damping: 14, mass: 0.6 },
      };

  const layer = (
    <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
      <AnimatePresence>
        {ripples.map((r) => (
          <motion.span
            key={r.id}
            className="absolute"
            style={{ left: r.x - r.size / 2, top: r.y - r.size / 2, width: r.size, height: r.size }}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 1, opacity: [1, 1, 0] }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
            transition={{ scale: { duration: 1, ease: [0.2, 0, 0, 1] }, opacity: { duration: 1.1, times: [0, 0.6, 1] } }}
          >
            {/* Android 12 ink sparkle: soft-edged fill plus noise sparkles riding the wavefront. */}
            <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle,currentColor_0%,currentColor_35%,transparent_70%)] opacity-[0.22]" />
            <span className="ink-sparkle absolute inset-0 rounded-full" />
            <span className="ink-sparkle ink-sparkle-b absolute inset-0 rounded-full" />
          </motion.span>
        ))}
      </AnimatePresence>
    </span>
  );

  return { onPointerDown, motionProps, layer };
}

type Common = { radius?: number; pressedRadius?: number };

export function PressLink({ radius = 28, pressedRadius = 12, className, children, onPointerDown, ...rest }: Common & ComponentPropsWithoutRef<"a">) {
  const press = usePress(radius, pressedRadius);
  return (
    <motion.a
      {...(rest as HTMLMotionProps<"a">)}
      {...press.motionProps}
      onPointerDown={(e) => {
        press.onPointerDown(e);
        onPointerDown?.(e);
      }}
      className={`relative isolate inline-flex select-none items-center justify-center overflow-hidden whitespace-nowrap ${className ?? ""}`}
    >
      {press.layer}
      <span className="relative inline-flex items-center gap-2">{children}</span>
    </motion.a>
  );
}

export function PressButton({ radius = 28, pressedRadius = 12, className, children, onPointerDown, ...rest }: Common & ComponentPropsWithoutRef<"button">) {
  const press = usePress(radius, pressedRadius);
  return (
    <motion.button
      type="button"
      {...(rest as HTMLMotionProps<"button">)}
      {...press.motionProps}
      onPointerDown={(e) => {
        press.onPointerDown(e);
        onPointerDown?.(e);
      }}
      className={`relative isolate inline-flex select-none items-center justify-center overflow-hidden whitespace-nowrap ${className ?? ""}`}
    >
      {press.layer}
      <span className="relative inline-flex items-center gap-2">{children}</span>
    </motion.button>
  );
}
