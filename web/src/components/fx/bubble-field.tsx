"use client";

import { useEffect, useRef } from "react";

type Bubble = { x: number; y: number; w: number; h: number; vx: number; vy: number; phase: number; accent: boolean; dir: 1 | -1 };

/*
  Hero backdrop: a slow drift of chat bubbles that scatter away from the cursor.
  Canvas 2D, paused off-screen, single static frame under reduced motion.
*/
export function BubbleField({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dark = window.matchMedia("(prefers-color-scheme: dark)");
    let colors = { line: "", fill: "", accent: "", dot: "" };
    const readColors = () => {
      const s = getComputedStyle(document.documentElement);
      colors = {
        line: s.getPropertyValue("--line").trim(),
        fill: s.getPropertyValue("--surface").trim(),
        accent: s.getPropertyValue("--accent").trim(),
        dot: s.getPropertyValue("--muted").trim(),
      };
    };
    readColors();
    dark.addEventListener("change", readColors);

    let w = 0;
    let h = 0;
    let bubbles: Bubble[] = [];
    const mouse = { x: -9999, y: -9999 };

    const seed = () => {
      const count = Math.round(Math.min(46, (w * h) / 26000));
      bubbles = Array.from({ length: count }, () => {
        const size = 0.6 + Math.random() * 0.9;
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          w: 54 * size + Math.random() * 40,
          h: 28 * size,
          vx: (Math.random() - 0.5) * 0.12,
          vy: -(0.12 + Math.random() * 0.28),
          phase: Math.random() * Math.PI * 2,
          accent: Math.random() < 0.16,
          dir: Math.random() < 0.5 ? 1 : -1,
        };
      });
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };

    const drawBubble = (b: Bubble, t: number) => {
      const r = b.h / 2;
      const x = b.x;
      const y = b.y + Math.sin(t * 0.0008 + b.phase) * 6;
      ctx.beginPath();
      ctx.roundRect(x, y, b.w, b.h, [r, r, b.dir === 1 ? r : 4, b.dir === 1 ? 4 : r]);
      ctx.fillStyle = b.accent ? colors.accent : colors.fill;
      ctx.globalAlpha = b.accent ? 0.85 : 0.9;
      ctx.fill();
      ctx.globalAlpha = 1;
      if (!b.accent) {
        ctx.strokeStyle = colors.line;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.fillStyle = b.accent ? "rgba(20,26,5,0.7)" : colors.dot;
      for (let i = 0; i < 3; i++) {
        const pulse = 0.35 + 0.65 * Math.max(0, Math.sin(t * 0.004 - i * 0.6 + b.phase));
        ctx.globalAlpha = b.accent ? 0.8 : 0.35 * pulse + 0.15;
        ctx.beginPath();
        ctx.arc(x + r + i * 9, y + r, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    let raf = 0;
    let running = false;
    const frame = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      for (const b of bubbles) {
        const cx = b.x + b.w / 2;
        const cy = b.y + b.h / 2;
        const dx = cx - mouse.x;
        const dy = cy - mouse.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 180 && dist > 0.1) {
          const f = (1 - dist / 180) * 1.6;
          b.vx += (dx / dist) * f * 0.6;
          b.vy += (dy / dist) * f * 0.6;
        }
        b.vx *= 0.94;
        b.vy = b.vy * 0.94 + -(0.2 + (b.w % 7) * 0.03) * 0.06;
        b.x += b.vx;
        b.y += b.vy;
        if (b.y + b.h < -20) {
          b.y = h + 20;
          b.x = Math.random() * w;
        }
        if (b.x > w + 60) b.x = -b.w;
        if (b.x + b.w < -60) b.x = w;
        drawBubble(b, t);
      }
      if (running) raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (running || reduce) return;
      running = true;
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const onLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };

    resize();
    if (reduce) frame(0);
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()));
    io.observe(canvas);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      dark.removeEventListener("change", readColors);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className={className} />;
}
