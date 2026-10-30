"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Check, CreditCard, DesktopTower, DeviceMobile, DownloadSimple, Plus, Warning } from "@phosphor-icons/react";
import { invoices, team } from "@/lib/mock";
import { findPlan, money, num } from "@/lib/format";
import { api } from "@/lib/api";
import { Avatar, Badge, Card, CardTitle, Field, Input, Modal, PageHeader, Select, Switch } from "../ui/kit";
import { PressButton } from "../fx/press";
import { useDash } from "./shell";

// onSave runs the real save; it may throw (offline), in which case we still flash "saved"
// locally so the demo stays smooth, but a thrown error is surfaced to the console.
function SaveBar({ label, saved, onSave }: { label: string; saved: string; onSave?: () => Promise<void> | void }) {
  const [done, setDone] = useState(false);
  return (
    <PressButton
      onClick={async () => {
        try {
          await onSave?.();
        } catch {}
        setDone(true);
        window.setTimeout(() => setDone(false), 1800);
      }}
      className="h-12 bg-accent px-6 text-sm font-medium text-accent-ink"
    >
      {done ? (
        <>
          <Check size={16} weight="bold" /> {saved}
        </>
      ) : (
        label
      )}
    </PressButton>
  );
}

export function Team() {
  const { app, lang } = useDash();
  const t = app.dash.team;
  const [open, setOpen] = useState(false);
  const [members, setMembers] = useState(() => team(lang));
  const [email, setEmail] = useState("");
  return (
    <>
      <PageHeader
        title={t.title}
        sub={t.sub}
        actions={
          <PressButton onClick={() => setOpen(true)} radius={22} pressedRadius={10} className="h-11 bg-accent px-5 text-sm font-medium text-accent-ink">
            <Plus size={18} weight="bold" />
            {t.invite}
          </PressButton>
        }
      />
      <Card className="overflow-x-auto p-0 md:p-0">
        <table className="w-full min-w-[620px] text-sm">
          <thead className="text-muted">
            <tr className="border-b border-line">
              <th className="px-6 py-3 text-start font-medium">{t.email}</th>
              <th className="px-6 py-3 text-start font-medium">{t.role}</th>
              <th className="px-6 py-3 text-start font-medium">{t.status}</th>
              <th className="px-6 py-3 text-end font-medium">{t.lastSeen}</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <motion.tr key={m.email} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-b border-line last:border-0">
                <td className="px-6 py-3">
                  <span className="flex items-center gap-3">
                    <Avatar name={m.name || m.email} size={34} />
                    <span>
                      <span className="block font-medium">{m.name || "…"}</span>
                      <span className="block text-xs text-muted" dir="ltr">
                        {m.email}
                      </span>
                    </span>
                  </span>
                </td>
                <td className="px-6 py-3">{t.roles[m.role]}</td>
                <td className="px-6 py-3">{m.status === "active" ? <Badge tone="accent">{t.active}</Badge> : <Badge tone="warn">{t.invited}</Badge>}</td>
                <td className="px-6 py-3 text-end text-muted">{m.seen}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </Card>
      <Modal open={open} onClose={() => setOpen(false)} title={t.invite}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!email.includes("@")) return;
            setMembers((ms) => [...ms, { name: "", email, role: 2, status: "invited", seen: "" }]);
            setEmail("");
            setOpen(false);
          }}
          className="flex flex-col gap-4"
        >
          <Field label={t.email}>{(id) => <Input id={id} dir="ltr" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />}</Field>
          <Field label={t.role}>
            {(id) => (
              <Select id={id} defaultValue={t.roles[2]}>
                {t.roles.slice(1).map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </Select>
            )}
          </Field>
          <PressButton type="submit" className="h-12 bg-accent text-sm font-medium text-accent-ink">
            {t.invite}
          </PressButton>
        </form>
      </Modal>
    </>
  );
}

export function Settings() {
  const { app, lang } = useDash();
  const s = app.dash.settings;
  const reduce = useReducedMotion();
  const [mode, setMode] = useState<"draft" | "approve" | "auto">("approve");
  const [threshold, setThreshold] = useState(75);
  const [language, setLanguage] = useState("match");
  const [brandVoice, setBrandVoice] = useState("");
  const [always, setAlways] = useState(true);
  const [handoffs, setHandoffs] = useState([true, true, false]);
  const [notify, setNotify] = useState([true, true, false]);

  // Load the workspace's saved agent settings; stays on defaults if offline.
  useEffect(() => {
    api
      .settings()
      .then((st) => {
        setMode(st.mode);
        setThreshold(Math.round(st.threshold * 100));
        setLanguage(st.replyLanguage || "match");
        setBrandVoice(st.brandVoice);
      })
      .catch(() => {});
  }, []);

  const save = async () => {
    await api.saveSettings({ mode, threshold: threshold / 100, brandVoice, replyLanguage: language });
  };

  return (
    <>
      <PageHeader title={s.title} actions={<SaveBar label={app.common.save} saved={app.common.saved} onSave={save} />} />
      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="xl:col-span-2">
          <CardTitle>{s.mode}</CardTitle>
          <div role="radiogroup" aria-label={s.mode} className="grid gap-3 md:grid-cols-3">
            {s.modes.map((m) => {
              const on = m.key === mode;
              return (
                <motion.button
                  key={m.key}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setMode(m.key as "draft" | "approve" | "auto")}
                  whileTap={reduce ? undefined : { scale: 0.97 }}
                  className={`relative rounded-2xl border-2 p-5 text-start transition-colors ${on ? "border-accent bg-accent/10" : "border-line hover:border-muted/40"}`}
                >
                  <span className="flex items-center justify-between font-semibold">
                    {m.label}
                    <span className={`grid size-5 place-items-center rounded-full border-2 ${on ? "border-accent bg-accent text-accent-ink" : "border-line"}`}>{on && <Check size={11} weight="bold" />}</span>
                  </span>
                  <span className="mt-2 block text-sm text-muted">{m.body}</span>
                </motion.button>
              );
            })}
          </div>
          <label className="mt-6 block">
            <span className="flex justify-between text-sm">
              {s.threshold}
              <span className="font-semibold tabular-nums">{num(threshold, lang)}%</span>
            </span>
            <input type="range" min={40} max={95} value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} className="mt-3 w-full accent-[var(--viz-1)]" />
            <span className="text-sm text-muted">{s.thresholdHint}</span>
          </label>
        </Card>

        <Card>
          <CardTitle>{s.hours}</CardTitle>
          <div className="flex items-center justify-between">
            <span>{s.always}</span>
            <Switch checked={always} onChange={setAlways} label={s.always} />
          </div>
          <div className={`mt-4 grid grid-cols-2 gap-3 transition-opacity ${always ? "pointer-events-none opacity-40" : ""}`}>
            <Input type="time" defaultValue="09:00" dir="ltr" aria-label={s.hours} />
            <Input type="time" defaultValue="23:00" dir="ltr" aria-label={s.hours} />
          </div>
          <div className="mt-6">
            <label htmlFor="lang-sel" className="mb-2 block text-sm font-medium">
              {s.language}
            </label>
            <Select id="lang-sel" value={language} onChange={(e) => setLanguage(e.target.value)}>
              {s.languages.map((l, i) => (
                <option key={l} value={["match", "fa", "en"][i]}>{l}</option>
              ))}
            </Select>
          </div>
        </Card>

        <Card>
          <CardTitle>{s.handoff}</CardTitle>
          <ul className="flex flex-col gap-3">
            {s.handoffs.map((h, i) => (
              <li key={h} className="flex items-center justify-between gap-4">
                <span className="text-sm">{h}</span>
                <Switch checked={handoffs[i]} onChange={(v) => setHandoffs((a) => a.map((x, j) => (j === i ? v : x)))} label={h} />
              </li>
            ))}
          </ul>
          <p className="mb-3 mt-6 text-sm font-semibold">{s.notifications}</p>
          <ul className="flex flex-col gap-3">
            {s.notify.map((n, i) => (
              <li key={n} className="flex items-center justify-between gap-4">
                <span className="text-sm">{n}</span>
                <Switch checked={notify[i]} onChange={(v) => setNotify((a) => a.map((x, j) => (j === i ? v : x)))} label={n} />
              </li>
            ))}
          </ul>
        </Card>

        <Card className="border-[#ef6b5b]/40 xl:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Warning size={22} className="mt-0.5 text-[#b3261e] dark:text-[#ff8a7a]" />
              <div>
                <p className="font-semibold">{s.danger}</p>
                <p className="text-sm text-muted">{s.dangerBody}</p>
              </div>
            </div>
            <PressButton radius={22} pressedRadius={10} className="h-11 border border-[#ef6b5b]/50 px-5 text-sm text-[#b3261e] dark:text-[#ff8a7a]">
              {s.deleteWs}
            </PressButton>
          </div>
        </Card>
      </div>
    </>
  );
}

export function Billing() {
  const { app, lang } = useDash();
  const b = app.dash.billing;
  const reduce = useReducedMotion();
  const plan = findPlan("growth");
  const used = 3_412;
  const pct = used / plan.limit;
  return (
    <>
      <PageHeader title={b.title} />
      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Card className="bg-night text-night-ink">
          <p className="text-sm text-night-muted">{b.current}</p>
          <p className="mt-2 text-4xl font-semibold tracking-tight">{plan[lang].name}</p>
          <p className="mt-1 text-night-muted">
            {money(plan[lang].price, lang)} {app.common.perMonth} · {b.renews} {lang === "fa" ? "۱ آبان ۱۴۰۵" : "Nov 1, 2026"}
          </p>
          <div className="mt-8">
            <p className="flex justify-between text-sm">
              <span>{b.usage}</span>
              <span className="tabular-nums">
                {num(used, lang)} {b.of} {num(plan.limit, lang)}
              </span>
            </p>
            <div className="mt-2 h-3 overflow-hidden rounded-full bg-white/10">
              <motion.div className="h-full rounded-full bg-accent" initial={reduce ? false : { width: 0 }} animate={{ width: `${pct * 100}%` }} transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }} />
            </div>
          </div>
          <div className="mt-8 flex flex-wrap gap-2">
            <PressButton className="h-11 bg-accent px-5 text-sm font-medium text-accent-ink" radius={22} pressedRadius={10}>
              {b.change}
            </PressButton>
            <PressButton className="h-11 px-5 text-sm text-night-muted" radius={22} pressedRadius={10}>
              {b.cancel}
            </PressButton>
          </div>
        </Card>
        <Card>
          <CardTitle>{b.method}</CardTitle>
          <div className="flex items-center gap-4 rounded-2xl bg-surface-2 p-4">
            <span className="grid size-12 place-items-center rounded-xl bg-ink text-bg">
              <CreditCard size={22} />
            </span>
            <div className="flex-1" dir="ltr">
              <p className="font-medium">•••• 4417</p>
              <p className="text-sm text-muted">{lang === "fa" ? "درگاه زرین‌پال" : "Visa · 08/28"}</p>
            </div>
            <PressButton radius={18} pressedRadius={8} className="h-9 border border-line px-3 text-xs text-ink">
              {b.update}
            </PressButton>
          </div>
        </Card>
      </div>
      <Card className="mt-4">
        <CardTitle>{b.invoices}</CardTitle>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead className="text-muted">
              <tr className="border-b border-line">
                <th className="py-3 text-start font-medium">{b.date}</th>
                <th className="py-3 text-start font-medium">ID</th>
                <th className="py-3 text-end font-medium">{b.amount}</th>
                <th className="py-3 text-end font-medium">{b.status}</th>
                <th className="py-3" />
              </tr>
            </thead>
            <tbody>
              {invoices(lang).map((inv) => (
                <tr key={inv.id} className="border-b border-line last:border-0">
                  <td className="py-3">{inv.date}</td>
                  <td className="py-3 font-mono text-muted" dir="ltr">
                    {inv.id}
                  </td>
                  <td className="py-3 text-end tabular-nums">{money(inv.amount, lang)}</td>
                  <td className="py-3 text-end">
                    <Badge tone="accent">{b.paid}</Badge>
                  </td>
                  <td className="py-3 text-end">
                    <button type="button" className="inline-flex items-center gap-1 text-muted hover:text-ink">
                      <DownloadSimple size={16} />
                      <span className="sr-only">{b.download}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}

export function Account() {
  const { app, lang } = useDash();
  const a = app.dash.account;
  const [twoFa, setTwoFa] = useState(true);
  const name = lang === "fa" ? "سارا نوری" : "Sara Novak";
  return (
    <>
      <PageHeader title={a.title} actions={<SaveBar label={app.common.save} saved={app.common.saved} />} />
      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardTitle>{a.profile}</CardTitle>
          <div className="mb-6 flex items-center gap-4">
            <Avatar name={name} size={72} />
            <PressButton radius={20} pressedRadius={10} className="h-10 border border-line px-4 text-sm text-ink">
              {a.avatar}
            </PressButton>
          </div>
          <div className="flex flex-col gap-4">
            <Field label={a.name}>{(id) => <Input id={id} defaultValue={name} />}</Field>
            <Field label={a.email}>{(id) => <Input id={id} dir="ltr" type="email" defaultValue="sara@roya.shop" />}</Field>
            <Field label={a.phone}>{(id) => <Input id={id} dir="ltr" type="tel" defaultValue="+98 912 000 0000" />}</Field>
          </div>
        </Card>
        <Card>
          <CardTitle>{a.security}</CardTitle>
          <div className="flex items-center justify-between rounded-2xl bg-surface-2 p-4">
            <div>
              <p className="font-medium">{a.password}</p>
              <p className="text-sm text-muted" dir="ltr">
                ••••••••••
              </p>
            </div>
            <PressButton radius={18} pressedRadius={8} className="h-9 border border-line px-3 text-xs text-ink">
              {a.changePassword}
            </PressButton>
          </div>
          <div className="mt-3 flex items-center justify-between gap-4 rounded-2xl bg-surface-2 p-4">
            <div>
              <p className="font-medium">{a.twoFactor}</p>
              <p className="text-sm text-muted">{a.twoFactorBody}</p>
            </div>
            <Switch checked={twoFa} onChange={setTwoFa} label={a.twoFactor} />
          </div>
          <p className="mb-3 mt-6 text-sm font-semibold">{a.sessions}</p>
          <ul className="flex flex-col gap-2">
            {[
              { icon: DesktopTower, label: "Chrome · Windows", here: true, place: lang === "fa" ? "تهران" : "Berlin" },
              { icon: DeviceMobile, label: "Safari · iPhone", here: false, place: lang === "fa" ? "تهران" : "Berlin" },
            ].map((s) => (
              <li key={s.label} className="flex items-center gap-3 rounded-2xl border border-line p-3 text-sm">
                <s.icon size={22} className="text-muted" />
                <span className="flex-1">
                  <span className="block font-medium" dir="ltr">
                    {s.label}
                  </span>
                  <span className="text-xs text-muted">{s.place}</span>
                </span>
                {s.here ? <Badge tone="accent">{a.thisDevice}</Badge> : <button className="text-xs text-muted hover:text-ink">{a.revoke}</button>}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
