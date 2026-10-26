"use client";

import { useId, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

/*
  Product UI kit. Shapes: inputs and buttons are pills, cards 24px, inner tiles 16px.
  Calmer than the marketing site on purpose.
*/

export function Card({ className = "", children, ...rest }: ComponentPropsWithoutRef<"section">) {
  return (
    <section {...rest} className={`rounded-[24px] border border-line bg-surface p-5 md:p-6 ${className}`}>
      {children}
    </section>
  );
}

export function CardTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h3 className="text-[15px] font-semibold">{children}</h3>
      {action}
    </div>
  );
}

type Tone = "accent" | "neutral" | "warn" | "danger" | "ink";
const tones: Record<Tone, string> = {
  accent: "bg-accent/25 text-accent-text dark:bg-accent/15",
  neutral: "bg-surface-2 text-muted",
  warn: "bg-[#f5c451]/25 text-[#8a5a00] dark:text-[#f5c451]",
  danger: "bg-[#ef6b5b]/20 text-[#b3261e] dark:text-[#ff8a7a]",
  ink: "bg-ink text-bg",
};

export function Badge({ tone = "neutral", children, icon }: { tone?: Tone; children: ReactNode; icon?: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${tones[tone]}`}>
      {icon}
      {children}
    </span>
  );
}

export function Field({
  label,
  hint,
  error,
  children,
  id,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: (id: string, describedBy?: string) => ReactNode;
  id?: string;
}) {
  const auto = useId();
  const fid = id ?? auto;
  const desc = error ? `${fid}-err` : hint ? `${fid}-hint` : undefined;
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={fid} className="text-sm font-medium text-ink">
        {label}
      </label>
      {children(fid, desc)}
      {error ? (
        <p id={`${fid}-err`} className="text-sm text-[#b3261e] dark:text-[#ff8a7a]">
          {error}
        </p>
      ) : hint ? (
        <p id={`${fid}-hint`} className="text-sm text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

const inputBase =
  "w-full rounded-2xl border bg-bg px-4 text-[15px] text-ink placeholder:text-muted transition-colors focus:outline-none focus:ring-2 focus:ring-accent";

export function Input({ invalid, className = "", ...rest }: ComponentPropsWithoutRef<"input"> & { invalid?: boolean }) {
  return (
    <input
      {...rest}
      aria-invalid={invalid || undefined}
      className={`${inputBase} h-12 ${invalid ? "border-[#b3261e] dark:border-[#ff8a7a]" : "border-line"} ${className}`}
    />
  );
}

export function Textarea({ invalid, className = "", ...rest }: ComponentPropsWithoutRef<"textarea"> & { invalid?: boolean }) {
  return (
    <textarea
      {...rest}
      aria-invalid={invalid || undefined}
      className={`${inputBase} min-h-32 py-3 ${invalid ? "border-[#b3261e] dark:border-[#ff8a7a]" : "border-line"} ${className}`}
    />
  );
}

export function Select({ className = "", children, ...rest }: ComponentPropsWithoutRef<"select">) {
  return (
    <select {...rest} className={`${inputBase} h-12 border-line ${className}`}>
      {children}
    </select>
  );
}

// Material-style switch with a springy thumb.
export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  const reduce = useReducedMotion();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-8 w-14 shrink-0 items-center rounded-full border-2 transition-colors ${
        checked ? "border-accent bg-accent" : "border-line bg-surface-2"
      }`}
    >
      <motion.span
        layout={!reduce}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={`mx-1 block rounded-full ${checked ? "ms-auto size-6 bg-accent-ink" : "size-4 bg-muted"}`}
      />
    </button>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  layoutId,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  layoutId: string;
}) {
  const reduce = useReducedMotion();
  return (
    <div role="tablist" className="inline-flex flex-wrap gap-1 rounded-full border border-line bg-surface p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="tab"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={`relative h-9 rounded-full px-4 text-sm font-medium transition-colors ${value === o.value ? "text-accent-ink" : "text-muted hover:text-ink"}`}
        >
          {value === o.value && (
            <motion.span
              layoutId={layoutId}
              className="absolute inset-0 rounded-full bg-accent"
              transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 32 }}
            />
          )}
          <span className="relative">{o.label}</span>
        </button>
      ))}
    </div>
  );
}

// Initials avatar with a hue derived from the name, so the same person keeps the same color.
export function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
  const hue = [...name].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return (
    <span
      aria-hidden
      className="grid shrink-0 place-items-center rounded-full text-[0.8em] font-semibold"
      style={{ width: size, height: size, fontSize: size * 0.38, background: `oklch(0.86 0.07 ${hue})`, color: `oklch(0.3 0.06 ${hue})` }}
    >
      {initials || "•"}
    </span>
  );
}

export function PageHeader({ title, sub, actions }: { title: string; sub?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{title}</h1>
        {sub && <p className="mt-1.5 max-w-[60ch] text-muted">{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

// Centered dialog with a springy entrance; Escape and the scrim close it.
export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="modal"
          className="fixed inset-0 z-[60] grid place-items-center bg-black/50 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          onKeyDown={(e) => e.key === "Escape" && onClose()}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            onClick={(e) => e.stopPropagation()}
            initial={reduce ? false : { opacity: 0, y: 30, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="w-full max-w-md rounded-[28px] border border-line bg-surface p-6 shadow-2xl"
          >
            <h2 className="text-xl font-semibold [font-family:var(--app-sans)]">{title}</h2>
            <div className="mt-4">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
