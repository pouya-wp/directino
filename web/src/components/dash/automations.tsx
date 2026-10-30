"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Lightning, Plus } from "@phosphor-icons/react";
import { num } from "@/lib/format";
import { Card, PageHeader, Switch } from "../ui/kit";
import { PressButton } from "../fx/press";
import { useDash } from "./shell";

const runs = [214, 96, 7, 0, 38];

export function Automations() {
  const { app, lang } = useDash();
  const t = app.dash.automations;
  const reduce = useReducedMotion();
  const [rules, setRules] = useState(t.rules);

  return (
    <>
      <PageHeader
        title={t.title}
        sub={t.sub}
        actions={
          <PressButton radius={22} pressedRadius={10} className="h-11 bg-accent px-5 text-sm font-medium text-accent-ink">
            <Plus size={18} weight="bold" />
            {t.new}
          </PressButton>
        }
      />
      <div className="flex flex-col gap-3">
        {rules.map((r, i) => (
          <motion.div key={r.name} initial={reduce ? false : { opacity: 0, x: lang === "fa" ? -16 : 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05, type: "spring", stiffness: 160, damping: 20 }}>
            <Card className={`transition-opacity ${r.enabled ? "" : "opacity-60"}`}>
              <div className="flex flex-wrap items-center gap-4">
                <span className={`grid size-11 place-items-center rounded-2xl ${r.enabled ? "bg-accent text-accent-ink" : "bg-surface-2 text-muted"}`}>
                  <Lightning size={20} weight="fill" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{r.name}</p>
                  <p className="mt-1.5 flex flex-wrap items-center gap-2 text-sm">
                    <span className="rounded-full bg-surface-2 px-3 py-1">
                      <span className="text-muted">{t.when} </span>
                      {r.when}
                    </span>
                    <ArrowRight size={14} className="text-muted rtl:-scale-x-100" aria-hidden />
                    <span className="rounded-full bg-accent/20 px-3 py-1 text-accent-text">
                      <span className="opacity-70">{t.then} </span>
                      {r.then}
                    </span>
                  </p>
                </div>
                <div className="text-end">
                  <p className="text-xs text-muted">{t.runs}</p>
                  <p className="font-semibold tabular-nums">{num(r.enabled ? runs[i] : 0, lang)}</p>
                </div>
                <Switch checked={r.enabled} onChange={(v) => setRules((rs) => rs.map((x, j) => (j === i ? { ...x, enabled: v } : x)))} label={r.name} />
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </>
  );
}
