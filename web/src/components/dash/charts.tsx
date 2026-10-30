"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { num, type Lang } from "@/lib/format";

/*
  Single-series charts in the validated series color (--viz-1). Time always reads
  left to right, even in RTL, so the svg is forced LTR. Labels use text tokens.
*/

function useWidth() {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(600);
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(240, e.contentRect.width)));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

const niceMax = (v: number) => {
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  return Math.ceil(v / p) * p;
};

export function LineChart({
  data,
  labels,
  lang,
  title,
  unit = "",
  height = 240,
  tableLabels,
}: {
  data: number[];
  labels: string[];
  lang: Lang;
  title: string;
  unit?: string;
  height?: number;
  tableLabels: { show: string; hide: string; x: string; y: string };
}) {
  const [box, width] = useWidth();
  const reduce = useReducedMotion();
  const gid = useId().replace(/:/g, "");
  const [hover, setHover] = useState<number | null>(null);
  const [table, setTable] = useState(false);

  const pad = { t: 12, r: 12, b: 28, l: 40 };
  const w = width - pad.l - pad.r;
  const h = height - pad.t - pad.b;
  const max = niceMax(Math.max(...data) * 1.1);
  const x = (i: number) => pad.l + (i / (data.length - 1)) * w;
  const y = (v: number) => pad.t + h - (v / max) * h;
  const line = data.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const area = `${line} L${x(data.length - 1)},${pad.t + h} L${x(0)},${pad.t + h} Z`;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(max * f));
  const every = Math.ceil(data.length / 6);

  const onMove = (clientX: number) => {
    const r = box.current?.getBoundingClientRect();
    if (!r) return;
    const i = Math.round(((clientX - r.left - pad.l) / w) * (data.length - 1));
    setHover(Math.max(0, Math.min(data.length - 1, i)));
  };

  return (
    <figure>
      <figcaption className="sr-only">{title}</figcaption>
      <div
        ref={box}
        className="relative outline-none"
        dir="ltr"
        tabIndex={0}
        role="img"
        aria-label={title}
        onPointerMove={(e) => onMove(e.clientX)}
        onPointerLeave={() => setHover(null)}
        onFocus={() => setHover(data.length - 1)}
        onBlur={() => setHover(null)}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") setHover((h0) => Math.max(0, (h0 ?? data.length - 1) - 1));
          if (e.key === "ArrowRight") setHover((h0) => Math.min(data.length - 1, (h0 ?? 0) + 1));
        }}
      >
        <svg width={width} height={height} className="block">
          <defs>
            <linearGradient id={`g${gid}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--viz-1)" stopOpacity="0.22" />
              <stop offset="100%" stopColor="var(--viz-1)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={pad.l} x2={width - pad.r} y1={y(t)} y2={y(t)} stroke="var(--line)" strokeDasharray={t === 0 ? undefined : "2 4"} />
              <text x={pad.l - 8} y={y(t)} dy="0.32em" textAnchor="end" className="fill-muted text-[11px]">
                {num(t, lang)}
              </text>
            </g>
          ))}
          {labels.map((l, i) =>
            i % every === 0 || i === labels.length - 1 ? (
              <text key={i} x={x(i)} y={height - 8} textAnchor="middle" className="fill-muted text-[11px]">
                {l}
              </text>
            ) : null,
          )}
          <motion.path d={area} fill={`url(#g${gid})`} initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.4 }} />
          <motion.path
            d={line}
            fill="none"
            stroke="var(--viz-1)"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
            initial={reduce ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.2, ease: [0.65, 0, 0.35, 1] }}
          />
          <circle cx={x(data.length - 1)} cy={y(data[data.length - 1])} r={4} fill="var(--viz-1)" stroke="var(--surface)" strokeWidth={2} />
          {hover !== null && (
            <g>
              <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={pad.t + h} stroke="var(--muted)" strokeOpacity={0.5} />
              <circle cx={x(hover)} cy={y(data[hover])} r={5} fill="var(--viz-1)" stroke="var(--surface)" strokeWidth={2} />
            </g>
          )}
        </svg>
        {hover !== null && (
          <div
            className="pointer-events-none absolute top-1 z-10 min-w-28 rounded-xl border border-line bg-surface px-3 py-2 text-sm shadow-lg"
            style={{ left: Math.min(Math.max(x(hover) - 56, 0), width - 120) }}
          >
            <p className="text-base font-semibold tabular-nums">
              {num(data[hover], lang)} {unit}
            </p>
            <p className="flex items-center gap-1.5 text-xs text-muted">
              <span className="inline-block h-0.5 w-3 rounded-full bg-viz-1" />
              {labels[hover]}
            </p>
          </div>
        )}
      </div>
      <button type="button" onClick={() => setTable((t) => !t)} className="mt-2 text-xs text-muted underline-offset-4 hover:text-ink hover:underline">
        {table ? tableLabels.hide : tableLabels.show}
      </button>
      {table && (
        <div className="mt-2 max-h-56 overflow-auto rounded-xl border border-line">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-surface-2 text-muted">
              <tr>
                <th className="px-3 py-2 text-start font-medium">{tableLabels.x}</th>
                <th className="px-3 py-2 text-end font-medium">{tableLabels.y}</th>
              </tr>
            </thead>
            <tbody>
              {data.map((v, i) => (
                <tr key={i} className="border-t border-line">
                  <td className="px-3 py-1.5">{labels[i]}</td>
                  <td className="px-3 py-1.5 text-end tabular-nums">{num(v, lang)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </figure>
  );
}

// Horizontal bars, one series color, direct value labels.
export function BarList({ items, lang, suffix = "" }: { items: { label: ReactNode; value: number; key: string }[]; lang: Lang; suffix?: string }) {
  const reduce = useReducedMotion();
  const max = Math.max(...items.map((i) => i.value));
  return (
    <ul className="flex flex-col gap-3">
      {items.map((it, i) => (
        <li key={it.key} className="group" title={`${num(it.value, lang)}${suffix}`}>
          <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-2">{it.label}</span>
            <span className="font-semibold tabular-nums">
              {num(it.value, lang)}
              {suffix}
            </span>
          </div>
          <div className="h-2">
            <motion.div
              className="h-full origin-left rounded-full bg-viz-1 transition-opacity group-hover:opacity-80 rtl:origin-right"
              style={{ width: `${(it.value / max) * 100}%` }}
              initial={reduce ? false : { scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

// Animated count-up for stat tiles.
export function CountUp({ value, lang, digits = 0, suffix = "" }: { value: number; lang: Lang; digits?: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();
  useEffect(() => {
    const el = ref.current;
    if (!el || reduce) return;
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / 1100);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = num(value * eased, lang, digits) + suffix;
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, lang, digits, suffix, reduce]);
  return (
    <span ref={ref} className="tabular-nums">
      {num(value, lang, digits) + suffix}
    </span>
  );
}
