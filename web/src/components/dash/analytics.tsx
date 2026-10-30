"use client";

import { useState } from "react";
import { dailyConversations, handoffShare, responseSeconds, topQuestions } from "@/lib/mock";
import { dayLabels, num } from "@/lib/format";
import { Card, CardTitle, PageHeader, Segmented } from "../ui/kit";
import { BarList, CountUp, LineChart } from "./charts";
import { useDash } from "./shell";

export function Analytics() {
  const { app, lang } = useDash();
  const t = app.dash.analytics;
  const o = app.dash.overview;
  const [range, setRange] = useState("2");
  const labels = dayLabels(30, lang);
  const aiShare = 91.6;
  const total = dailyConversations.reduce((a, b) => a + b, 0);

  return (
    <>
      <PageHeader title={t.title} actions={<Segmented layoutId="an-range" value={range} onChange={setRange} options={app.dash.ranges.map((r, i) => ({ value: String(i), label: r }))} />} />
      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardTitle>{t.responseTitle}</CardTitle>
          <LineChart data={responseSeconds} labels={labels} lang={lang} title={t.responseTitle} unit={t.responseLegend} tableLabels={{ show: o.table, hide: o.hideTable, x: o.day, y: t.responseLegend }} />
        </Card>
        {/* A single headline number reads better as a stat than as a chart. */}
        <Card className="flex flex-col justify-between bg-night text-night-ink">
          <CardTitle>{t.automationTitle}</CardTitle>
          <div>
            <p className="text-7xl font-semibold tracking-tighter text-accent">
              <CountUp value={aiShare} lang={lang} digits={1} suffix="%" />
            </p>
            <p className="mt-3 text-night-muted">
              {num(Math.round((total * aiShare) / 100), lang)} / {num(total, lang)} {o.kpis[0].label}
            </p>
          </div>
        </Card>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardTitle>{t.topQuestions}</CardTitle>
          <BarList lang={lang} items={topQuestions(lang).map((q) => ({ key: q.q, label: q.q, value: q.n }))} />
        </Card>
        <Card>
          <CardTitle>{t.handoffReasons}</CardTitle>
          <BarList lang={lang} suffix="%" items={t.reasons.map((r, i) => ({ key: r, label: r, value: handoffShare[i] }))} />
        </Card>
      </div>
    </>
  );
}
