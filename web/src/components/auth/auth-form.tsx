"use client";

import { useState, type FormEvent } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Eye, EyeSlash, GoogleLogo } from "@phosphor-icons/react";
import type { AppDict } from "@/i18n/app";
import type { Dict } from "@/i18n/dictionaries";
import { Field, Input } from "../ui/kit";
import { PressButton } from "../fx/press";
import { TLink, useTransitionNav } from "../fx/transitions";
import { LogoMark } from "../logo";
import { InboxStorm } from "../inbox-storm";
import { BubbleField } from "../fx/bubble-field";
import { api, ApiError } from "@/lib/api";

const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

// Shared login / signup screen, wired to the backend auth endpoints (session cookie).
export function AuthForm({ mode, a, links, hero, lang }: { mode: "login" | "signup"; a: AppDict["auth"]; links: AppDict["links"]; hero: Dict["hero"]; lang: "fa" | "en" }) {
  const reduce = useReducedMotion();
  const { go } = useTransitionNav();
  const [v, setV] = useState({ name: "", business: "", email: "", password: "" });
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof typeof v, string>>>({});
  const [formError, setFormError] = useState("");
  const [focus, setFocus] = useState<keyof typeof v | null>(null);
  // The mascot reads along: eyes track the email as it grows, and it looks away from passwords.
  const gaze = focus === "email" ? { x: Math.min(1, v.email.length / 22) * 2 - 1, y: 0.8 } : focus ? { x: 0, y: 0.8 } : null;
  const shy = focus === "password" && !show;
  const signup = mode === "signup";

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError("");
    const next: typeof errors = {};
    if (signup && !v.name.trim()) next.name = a.errors.name;
    if (!emailOk(v.email)) next.email = a.errors.email;
    if (v.password.length < 8) next.password = a.errors.password;
    setErrors(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    try {
      if (signup) {
        await api.signup({ name: v.name, email: v.email, business: v.business, password: v.password, edition: lang });
      } else {
        await api.login({ email: v.email, password: v.password });
      }
      go(`/${lang}/app`, { label: links.dashboard });
    } catch (err) {
      setBusy(false);
      if (err instanceof ApiError && err.status === 409) setFormError(a.errors.taken);
      else if (err instanceof ApiError && err.status === 401) setFormError(a.errors.badLogin);
      else setFormError(a.errors.offline);
    }
  };

  const rise = (i: number) => (reduce ? {} : { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.1 + i * 0.05, duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } });

  return (
    <div className="relative isolate mx-auto grid max-w-[1400px] gap-8 px-4 pb-16 md:px-8 lg:min-h-[calc(100dvh-5rem)] lg:grid-cols-2 lg:items-center">
      <BubbleField className="absolute inset-0 -z-10 size-full opacity-60 [mask-image:radial-gradient(60%_60%_at_25%_50%,black,transparent)] rtl:[mask-image:radial-gradient(60%_60%_at_75%_50%,black,transparent)]" />
      <div className="mx-auto w-full max-w-[440px]">
        <motion.div {...rise(0)} className="mb-6 w-fit">
          <motion.div animate={reduce ? undefined : shy ? { rotate: -10, y: 4 } : { rotate: 0, y: 0 }} transition={{ type: "spring", stiffness: 300, damping: 14 }}>
            <LogoMark size={76} gaze={gaze} shy={shy} typing={busy} />
          </motion.div>
        </motion.div>
        <motion.h1 {...rise(0)} className="text-4xl font-semibold tracking-tight md:text-5xl">
          {signup ? a.signupTitle : a.loginTitle}
        </motion.h1>
        <motion.p {...rise(1)} className="mt-3 text-lg text-muted">
          {signup ? a.signupSub : a.loginSub}
        </motion.p>

        <motion.div {...rise(2)} className="mt-8">
          <PressButton className="h-12 w-full border border-line bg-surface text-[15px] font-medium text-ink">
            <GoogleLogo size={20} weight="bold" aria-hidden />
            {a.google}
          </PressButton>
        </motion.div>
        <motion.div {...rise(3)} className="my-6 flex items-center gap-3 text-sm text-muted">
          <span className="h-px flex-1 bg-line" />
          {a.or}
          <span className="h-px flex-1 bg-line" />
        </motion.div>

        <form onSubmit={submit} noValidate className="flex flex-col gap-5">
          {signup && (
            <motion.div {...rise(4)} className="grid gap-5 sm:grid-cols-2">
              <Field label={a.name} error={errors.name}>
                {(id, d) => <Input id={id} aria-describedby={d} invalid={!!errors.name} autoComplete="name" value={v.name} onFocus={() => setFocus("name")} onBlur={() => setFocus(null)} onChange={(e) => setV({ ...v, name: e.target.value })} />}
              </Field>
              <Field label={a.business}>
                {(id) => <Input id={id} autoComplete="organization" value={v.business} onFocus={() => setFocus("business")} onBlur={() => setFocus(null)} onChange={(e) => setV({ ...v, business: e.target.value })} />}
              </Field>
            </motion.div>
          )}
          <motion.div {...rise(5)}>
            <Field label={a.email} error={errors.email}>
              {(id, d) => <Input id={id} dir="ltr" type="email" aria-describedby={d} invalid={!!errors.email} autoComplete="email" value={v.email} onFocus={() => setFocus("email")} onBlur={() => setFocus(null)} onChange={(e) => setV({ ...v, email: e.target.value })} />}
            </Field>
          </motion.div>
          <motion.div {...rise(6)}>
            <Field label={a.password} hint={signup ? a.passwordHint : undefined} error={errors.password}>
              {(id, d) => (
                <div className="relative">
                  <Input
                    id={id}
                    dir="ltr"
                    type={show ? "text" : "password"}
                    aria-describedby={d}
                    invalid={!!errors.password}
                    autoComplete={signup ? "new-password" : "current-password"}
                    value={v.password} onFocus={() => setFocus("password")} onBlur={() => setFocus(null)}
                    onChange={(e) => setV({ ...v, password: e.target.value })}
                    className="pe-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShow((s) => !s)}
                    aria-label={a.password}
                    className="absolute end-3 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-muted hover:text-ink"
                  >
                    {show ? <EyeSlash size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              )}
            </Field>
            {!signup && (
              <a href="#" className="mt-2 inline-block text-sm text-muted underline-offset-4 hover:text-ink hover:underline">
                {a.forgot}
              </a>
            )}
          </motion.div>
          {formError && (
            <motion.p
              initial={reduce ? false : { opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              role="alert"
              className="rounded-2xl bg-[#ef6b5b]/15 px-4 py-3 text-sm text-[#b3261e] dark:text-[#ff8a7a]"
            >
              {formError}
            </motion.p>
          )}
          <motion.div {...rise(7)}>
            <PressButton type="submit" disabled={busy} className="h-14 w-full bg-accent text-base font-medium text-accent-ink disabled:opacity-80">
              {busy ? <LogoMark size={30} typing /> : signup ? a.create : a.login}
            </PressButton>
          </motion.div>
        </form>

        <motion.p {...rise(8)} className="mt-6 text-sm text-muted">
          {signup ? a.haveAccount : a.noAccount}{" "}
          <TLink href={`/${lang}/${signup ? "login" : "signup"}`} label={signup ? links.login : links.signup} className="font-medium text-ink underline-offset-4 hover:underline">
            {signup ? links.login : links.signup}
          </TLink>
        </motion.p>
        {signup && <p className="mt-3 text-xs text-muted">{a.agree}</p>}
      </div>

      <motion.aside
        initial={reduce ? false : { opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="relative hidden overflow-hidden rounded-[32px] bg-night p-10 text-night-ink lg:block"
      >
        <div aria-hidden className="absolute -end-24 -top-24 size-72 rounded-full bg-accent/20 blur-3xl" />
        <h2 className="relative text-4xl font-semibold leading-tight tracking-tight">{a.sideTitle}</h2>
        <p className="relative mt-4 max-w-[36ch] text-lg text-night-muted">{a.sideQuote}</p>
        <div className="relative mt-10 max-w-[440px] [&_.bg-surface]:bg-white/[0.06] [&_.bg-surface-2]:bg-white/[0.04] [&_.text-ink]:text-night-ink [&_.text-muted]:text-night-muted [&_.border-line]:border-white/10">
          <InboxStorm hero={hero} lang={lang} />
        </div>
      </motion.aside>
    </div>
  );
}
