"use client";

import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle, PaperPlaneTilt } from "@phosphor-icons/react";
import type { AppDict } from "@/i18n/app";
import { Field, Input, Select, Textarea } from "./ui/kit";
import { PressButton } from "./fx/press";
import { LogoMark } from "./logo";

const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

// Front-end only for now: validates and shows the success state. Wire to the backend later.
export function ContactForm({ c }: { c: AppDict["contact"] }) {
  const [values, setValues] = useState({ name: "", email: "", topic: c.topics[0], message: "" });
  const [errors, setErrors] = useState<Partial<Record<"name" | "email" | "message", string>>>({});
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!values.name.trim()) next.name = c.errors.name;
    if (!emailOk(values.email)) next.email = c.errors.email;
    if (values.message.trim().length < 5) next.message = c.errors.message;
    setErrors(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    await new Promise((r) => setTimeout(r, 900));
    setBusy(false);
    setSent(true);
  };

  return (
    <div className="relative rounded-[28px] border border-line bg-surface p-6 md:p-10">
      <AnimatePresence mode="wait" initial={false}>
        {sent ? (
          <motion.div
            key="sent"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex min-h-[420px] flex-col items-center justify-center gap-5 text-center"
            role="status"
          >
            <motion.span initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 260, damping: 14 }}>
              <CheckCircle size={64} weight="fill" className="text-accent-text" />
            </motion.span>
            <p className="max-w-[32ch] text-xl">{c.sent}</p>
          </motion.div>
        ) : (
          <motion.form key="form" exit={{ opacity: 0, y: -10 }} onSubmit={submit} noValidate className="flex flex-col gap-5">
            <div className="grid gap-5 md:grid-cols-2">
              <Field label={c.name} error={errors.name}>
                {(id, d) => <Input id={id} aria-describedby={d} invalid={!!errors.name} value={values.name} onChange={(e) => setValues({ ...values, name: e.target.value })} autoComplete="name" />}
              </Field>
              <Field label={c.email} error={errors.email}>
                {(id, d) => (
                  <Input id={id} dir="ltr" type="email" aria-describedby={d} invalid={!!errors.email} value={values.email} onChange={(e) => setValues({ ...values, email: e.target.value })} autoComplete="email" />
                )}
              </Field>
            </div>
            <Field label={c.topic}>
              {(id) => (
                <Select id={id} value={values.topic} onChange={(e) => setValues({ ...values, topic: e.target.value })}>
                  {c.topics.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </Select>
              )}
            </Field>
            <Field label={c.message} hint={c.messageHint} error={errors.message}>
              {(id, d) => <Textarea id={id} aria-describedby={d} invalid={!!errors.message} value={values.message} onChange={(e) => setValues({ ...values, message: e.target.value })} />}
            </Field>
            <div className="relative">
            {/* The message takes off when it sends. */}
            <AnimatePresence>
              {busy && (
                <motion.span
                  key="plane"
                  aria-hidden
                  className="pointer-events-none absolute start-6 top-3 z-10 text-accent-text"
                  initial={{ x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 }}
                  animate={{ x: [0, 60, 260, 520].map((v) => (document.documentElement.dir === "rtl" ? -v : v)), y: [0, -40, -140, -320], rotate: [0, -10, -25, -35].map((v) => (document.documentElement.dir === "rtl" ? -v : v)), scale: [1, 1.3, 1.1, 0.6], opacity: [1, 1, 1, 0] }}
                  transition={{ duration: 0.9, ease: "easeIn" }}
                >
                  <PaperPlaneTilt size={36} weight="fill" className="rtl:-scale-x-100" />
                </motion.span>
              )}
            </AnimatePresence>
            <PressButton type="submit" disabled={busy} className="mt-2 h-14 bg-accent px-8 text-base font-medium text-accent-ink disabled:opacity-70 md:w-fit">
              {busy ? <LogoMark size={28} typing /> : c.submit}
            </PressButton>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
