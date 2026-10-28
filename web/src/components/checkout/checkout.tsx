"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { animate, AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowCounterClockwise, CalendarCheck, Check, CreditCard, LockKey, Seal, Sparkle, Tag } from "@phosphor-icons/react";
import type { AppDict } from "@/i18n/app";
import { findPlan, money, num, plans, taxRate, type Lang, type PlanId } from "@/lib/format";
import { Card, Field, Input, Segmented } from "../ui/kit";
import { PressButton } from "../fx/press";
import { useTransitionNav } from "../fx/transitions";
import { LogoMark } from "../logo";

// Test codes until coupons come from the billing backend. BEYONDEX100 is the owner's full-discount test code.
const COUPONS: Record<string, number> = { DIRECT20: 0.2, BEYONDEX100: 1 };
const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

// Counts to the new amount instead of jumping, so price changes read as cause and effect.
function Amount({ value, lang, className }: { value: number; lang: Lang; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const prev = useRef(value);
  const reduce = useReducedMotion();
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduce) {
      el.textContent = money(value, lang);
      prev.current = value;
      return;
    }
    const c = animate(prev.current, value, {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => (el.textContent = money(lang === "fa" ? Math.round(v / 1000) * 1000 : Math.round(v * 100) / 100, lang)),
    });
    prev.current = value;
    return () => c.stop();
  }, [value, lang, reduce]);
  return (
    <span ref={ref} className={`tabular-nums ${className ?? ""}`}>
      {money(value, lang)}
    </span>
  );
}

export function Checkout({ c, common, lang }: { c: AppDict["checkout"]; common: AppDict["common"]; lang: Lang }) {
  const params = useSearchParams();
  const { go } = useTransitionNav();
  const [plan, setPlan] = useState<PlanId>(findPlan(params.get("plan")).id);
  const [cycle, setCycle] = useState<"monthly" | "yearly">("monthly");
  const [method, setMethod] = useState(c.methods[0].id);
  const [code, setCode] = useState("");
  const [coupon, setCoupon] = useState<"none" | "ok" | "bad">("none");
  const [form, setForm] = useState({ name: "", email: "", company: "" });
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [busy, setBusy] = useState(false);

  const p = plans.find((x) => x.id === plan)!;
  const base = p[lang].price * (cycle === "yearly" ? 10 : 1);
  const rate = COUPONS[code.trim().toUpperCase()] ?? 0;
  const discount = coupon === "ok" ? base * rate : 0;
  const tax = (base - discount) * taxRate(lang);
  const total = base - discount + tax;

  const pay = async (e: FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!form.name.trim()) next.name = common.required;
    if (!emailOk(form.email)) next.email = common.required;
    setErrors(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    await new Promise((r) => setTimeout(r, 1100));
    go(`/${lang}/checkout/success?plan=${plan}`, { label: c.successTitle });
  };

  return (
    <form onSubmit={pay} noValidate className="mx-auto grid max-w-[1200px] gap-6 px-4 pb-20 md:px-8 lg:grid-cols-[1.25fr_0.75fr]">
      <div className="flex flex-col gap-6">
        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">{c.title}</h1>

        <Card>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-[15px] font-semibold [font-family:var(--app-sans)]">{c.plan}</h2>
            <Segmented
              layoutId="cycle"
              value={cycle}
              onChange={setCycle}
              options={[
                { value: "monthly", label: c.monthly },
                { value: "yearly", label: `${c.yearly} · ${c.yearlyNote}` },
              ]}
            />
          </div>
          <div role="radiogroup" aria-label={c.plan} className="grid gap-3 sm:grid-cols-3">
            {plans.map((x) => {
              const active = x.id === plan;
              return (
                <motion.button
                  key={x.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setPlan(x.id)}
                  whileTap={{ scale: 0.97 }}
                  className={`relative rounded-2xl border-2 p-4 text-start transition-colors ${active ? "border-accent bg-accent/10" : "border-line hover:border-muted/40"}`}
                >
                  <span className="flex items-center justify-between">
                    <span className="font-semibold">{x[lang].name}</span>
                    <span className={`grid size-5 place-items-center rounded-full border-2 ${active ? "border-accent bg-accent text-accent-ink" : "border-line"}`}>
                      {active && <Check size={11} weight="bold" />}
                    </span>
                  </span>
                  <span className="mt-2 block text-sm text-muted">
                    {money(x[lang].price, lang)} {common.perMonth}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </Card>

        <Card>
          <h2 className="mb-5 text-[15px] font-semibold [font-family:var(--app-sans)]">{c.details}</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label={c.name} error={errors.name}>
              {(id, d) => <Input id={id} aria-describedby={d} invalid={!!errors.name} autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />}
            </Field>
            <Field label={c.email} error={errors.email}>
              {(id, d) => <Input id={id} dir="ltr" type="email" aria-describedby={d} invalid={!!errors.email} autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />}
            </Field>
            <div className="sm:col-span-2">
              <Field label={c.company}>{(id) => <Input id={id} autoComplete="organization" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />}</Field>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="mb-5 text-[15px] font-semibold [font-family:var(--app-sans)]">{c.payWith}</h2>
          <div role="radiogroup" aria-label={c.payWith} className="grid gap-3 sm:grid-cols-2">
            {c.methods.map((m) => {
              const active = m.id === method;
              return (
                <button
                  key={m.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setMethod(m.id)}
                  className={`flex items-center gap-3 rounded-2xl border-2 p-4 text-start transition-colors ${active ? "border-accent bg-accent/10" : "border-line hover:border-muted/40"}`}
                >
                  <span className="grid size-10 place-items-center rounded-xl bg-surface-2">
                    <CreditCard size={20} aria-hidden />
                  </span>
                  <span className="flex-1">
                    <span className="block font-medium">{m.label}</span>
                    <span className="block text-sm text-muted">{m.note}</span>
                  </span>
                  <span className={`grid size-5 place-items-center rounded-full border-2 ${active ? "border-accent bg-accent text-accent-ink" : "border-line"}`}>{active && <Check size={11} weight="bold" />}</span>
                </button>
              );
            })}
          </div>
        </Card>
      </div>

      <aside className="lg:sticky lg:top-6 lg:self-start">
        <Card className="bg-night text-night-ink">
          <div className="flex items-center gap-3">
            <LogoMark size={40} />
            <div>
              <p className="text-sm text-night-muted">{c.summary}</p>
              <AnimatePresence mode="wait">
                <motion.p key={plan + cycle} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="font-semibold">
                  {p[lang].name} · {cycle === "monthly" ? c.monthly : c.yearly}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>

          <div className="relative mt-6 flex gap-2">
            {/* Celebration when a coupon lands. */}
            {coupon === "ok" && (
              <span aria-hidden className="pointer-events-none absolute inset-0">
                {Array.from({ length: 12 }, (_, i) => {
                  const a = (i / 12) * Math.PI * 2;
                  return (
                    <motion.span
                      key={i}
                      className="absolute left-1/2 top-1/2 text-accent"
                      initial={{ x: 0, y: 0, scale: 0, rotate: 0 }}
                      animate={{ x: Math.cos(a) * (70 + (i % 3) * 30), y: Math.sin(a) * (40 + (i % 2) * 20), scale: [0, 1.2, 0], rotate: 180 }}
                      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <Sparkle size={14} weight="fill" />
                    </motion.span>
                  );
                })}
              </span>
            )}
            <label htmlFor="coupon" className="sr-only">
              {c.coupon}
            </label>
            <div className="relative flex-1">
              <Tag size={16} className="absolute start-3.5 top-1/2 -translate-y-1/2 text-night-muted" aria-hidden />
              <input
                id="coupon"
                dir="ltr"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setCoupon("none");
                }}
                placeholder={c.coupon}
                className="h-11 w-full rounded-full border border-white/15 bg-white/5 ps-10 pe-4 text-sm text-night-ink placeholder:text-night-muted focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <PressButton
              onClick={() => setCoupon(code.trim().toUpperCase() in COUPONS ? "ok" : "bad")}
              radius={22}
              pressedRadius={10}
              className="h-11 bg-white/10 px-4 text-sm font-medium text-night-ink"
            >
              {c.apply}
            </PressButton>
          </div>
          <AnimatePresence>
            {coupon !== "none" && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                role="status"
                className={`mt-2 text-sm ${coupon === "ok" ? "text-accent" : "text-[#ff8a7a]"}`}
              >
                {coupon === "ok" ? `${c.couponOk} ${num(Math.round(rate * 100), lang)}%` : c.couponBad}
              </motion.p>
            )}
          </AnimatePresence>

          <dl className="mt-6 flex flex-col gap-3 border-t border-white/10 pt-6 text-sm">
            <div className="flex justify-between">
              <dt className="text-night-muted">{c.subtotal}</dt>
              <dd><Amount value={base} lang={lang} /></dd>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-accent">
                <dt>{c.discount}</dt>
                <dd>− <Amount value={discount} lang={lang} /></dd>
              </div>
            )}
            {taxRate(lang) > 0 && (
              <div className="flex justify-between">
                <dt className="text-night-muted">{c.tax}</dt>
                <dd><Amount value={tax} lang={lang} /></dd>
              </div>
            )}
            <div className="flex items-end justify-between border-t border-white/10 pt-4">
              <dt className="text-night-muted">{c.total}</dt>
              <dd className="text-2xl font-semibold">
                <Amount value={0} lang={lang} />
              </dd>
            </div>
            <p className="text-night-muted">
              {c.trialNote} <span className="text-night-ink">(<Amount value={total} lang={lang} />)</span>
            </p>
          </dl>

          <PressButton type="submit" disabled={busy} className="mt-6 h-14 w-full bg-accent text-base font-medium text-accent-ink disabled:opacity-80">
            {busy ? <LogoMark size={30} typing /> : (
              <>
                <LockKey size={18} weight="bold" aria-hidden />
                {c.pay}
              </>
            )}
          </PressButton>
          <p className="mt-3 text-center text-xs text-night-muted">{c.secure}</p>
        </Card>

        <ul className="mt-4 grid gap-2 text-sm">
          {[
            { icon: ArrowCounterClockwise, text: c.guarantee },
            { icon: CalendarCheck, text: c.cancel },
            { icon: Seal, text: c.encrypted },
          ].map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3 rounded-2xl bg-surface px-4 py-3">
              <Icon size={20} weight="duotone" className="text-accent-text" aria-hidden />
              {text}
            </li>
          ))}
        </ul>
      </aside>
    </form>
  );
}
