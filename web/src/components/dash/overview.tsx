"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, ArrowUpRight, CheckCircle } from "@phosphor-icons/react";
import { channelSplit, dailyConversations } from "@/lib/mock";
import { useLive } from "@/lib/useLive";
import { dayLabels, num } from "@/lib/format";
import { getDictionary } from "@/i18n/dictionaries";
import { ChannelIcon } from "../channel-icon";
import { Avatar, Badge, Card, CardTitle, PageHeader, Segmented } from "../ui/kit";
import { BarList, CountUp, LineChart } from "./charts";
import { useDash } from "./shell";

const rangeDays = [1, 7, 30, 90];

export function Overview() {
  const { app, lang, base, agentLive } = useDash();
  const reduce = useReducedMotion();
  const o = app.dash.overview;
  const [range, setRange] = useState("2");
  const days = rangeDays[Number(range)];
  const { conversations: convs } = useLive(lang);
  const needs = convs.filter((c) => c.status === "needs");

  // The chart always shows up to 30 days; the KPIs scale with the selected range.
  const series = dailyConversations.slice(-Math.min(30, Math.max(days, 7)));
  const labels = dayLabels(series.length, lang);
  const total = dailyConversations.slice(-Math.min(days, 30)).reduce((a, b) => a + b, 0) * (days === 90 ? 2.9 : 1);

  const kpis = [
    { label: o.kpis[0].label, value: Math.round(total), delta: 12.4 },
    { label: o.kpis[1].label, value: 91.6, digits: 1, suffix: "%", delta: 3.1 },
    { label: o.kpis[2].label, value: 8, suffix: lang === "fa" ? " ثانیه" : "s", delta: -18 },
    { label: o.kpis[3].label, value: Math.round(total * 0.047), delta: 9.8 },
  ];

  // Live feed: replays the storm messages as fresh activity.
  const stream = getDictionary(lang).hero.messages;
  const [feed, setFeed] = useState(() => stream.slice(0, 4).map((m, i) => ({ ...m, id: i })));
  useEffect(() => {
    if (reduce || !agentLive) return;
    let n = 4;
    const t = window.setInterval(() => {
      const m = stream[n % stream.length];
      setFeed((f) => [{ ...m, id: n++ }, ...f].slice(0, 5));
    }, 3500);
    return () => window.clearInterval(t);
  }, [reduce, agentLive, stream]);

  return (
    <>
      <PageHeader
        title={o.greeting}
        sub={o.sub}
        actions={<Segmented layoutId="range" value={range} onChange={setRange} options={app.dash.ranges.map((r, i) => ({ value: String(i), label: r }))} />}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k, i) => (
          <motion.div key={k.label} initial={reduce ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06, type: "spring", stiffness: 140, damping: 18 }}>
            <Card className={i === 0 ? "bg-night text-night-ink" : ""}>
              <p className={`text-sm ${i === 0 ? "text-night-muted" : "text-muted"}`}>{k.label}</p>
              <p className="mt-3 text-3xl font-semibold tracking-tight">
                <CountUp key={range} value={k.value} lang={lang} digits={k.digits} suffix={k.suffix} />
              </p>
              <p className={`mt-2 inline-flex items-center gap-1 text-xs ${i === 0 ? "text-accent" : "text-accent-text"}`}>
                <ArrowUpRight size={12} weight="bold" className={k.delta < 0 ? "rotate-90" : ""} aria-hidden />
                {num(Math.abs(k.delta), lang, 1)}%
              </p>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardTitle>{o.chartTitle}</CardTitle>
          <LineChart data={series} labels={labels} lang={lang} title={o.chartTitle} tableLabels={{ show: o.table, hide: o.hideTable, x: o.day, y: o.value }} />
        </Card>
        <Card>
          <CardTitle>{o.byChannel}</CardTitle>
          <BarList
            lang={lang}
            items={channelSplit.map((c) => ({
              key: c.channel,
              value: Math.round((c.value * days) / 30),
              label: (
                <>
                  <ChannelIcon channel={c.channel} size={16} />
                  {getDictionary(lang).hero.channelNames[c.channel]}
                </>
              ),
            }))}
          />
        </Card>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <Card>
          <CardTitle
            action={
              <Link href={`${base}/inbox`} className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
                {o.viewAll}
                <ArrowRight size={14} className="rtl:-scale-x-100" />
              </Link>
            }
          >
            {o.needsYou} <Badge tone="warn">{num(needs.length, lang)}</Badge>
          </CardTitle>
          {needs.length ? (
            <ul className="flex flex-col gap-2">
              {needs.map((c) => (
                <li key={c.id}>
                  <Link href={`${base}/inbox?c=${c.id}`} className="flex items-center gap-3 rounded-2xl p-3 transition-colors hover:bg-surface-2">
                    <Avatar name={c.contact.name} />
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-2 text-sm font-medium">
                        {c.contact.name}
                        <ChannelIcon channel={c.channel} size={14} className="text-muted" />
                      </p>
                      <p className="truncate text-sm text-muted">{c.messages[c.messages.length - 1].text}</p>
                    </div>
                    <span className="text-xs text-muted">{c.time}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="flex items-center gap-2 text-muted">
              <CheckCircle size={18} className="text-accent-text" />
              {o.needsYouEmpty}
            </p>
          )}
        </Card>

        <Card>
          <CardTitle>
            <span className="flex items-center gap-2">
              {agentLive && (
                <span className="relative size-2 rounded-full bg-accent-text">
                  <span className="absolute inset-0 animate-ping rounded-full bg-accent-text motion-reduce:hidden" />
                </span>
              )}
              {o.activity}
            </span>
          </CardTitle>
          <ul className="flex flex-col gap-2">
            <AnimatePresence initial={false}>
              {feed.map((m) => (
                <motion.li
                  key={m.id}
                  layout
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 24 }}
                  className="flex items-start gap-3 rounded-2xl bg-surface-2 p-3 text-sm"
                >
                  <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-accent text-accent-ink">
                    <ChannelIcon channel={m.channel} size={14} />
                  </span>
                  <span className="min-w-0">
                    <span className="font-medium" dir="auto">{m.from}</span>
                    <span className="block truncate text-muted">{m.reply}</span>
                  </span>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </Card>
      </div>
    </>
  );
}
