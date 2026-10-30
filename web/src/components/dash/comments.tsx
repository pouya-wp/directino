"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChatCircle, Eye, EyeSlash, PaperPlaneTilt, Warning } from "@phosphor-icons/react";
import { commentsFeed } from "@/lib/mock";
import { Avatar, Badge, Card, PageHeader, Segmented } from "../ui/kit";
import { PressButton } from "../fx/press";
import { useDash } from "./shell";

type F = "0" | "1" | "2" | "3";

export function Comments() {
  const { app, lang } = useDash();
  const t = app.dash.comments;
  const [items, setItems] = useState(() => commentsFeed(lang));
  const [f, setF] = useState<F>("0");
  const shown = items.filter((c) => f === "0" || (f === "1" && c.state === "dm") || (f === "2" && c.state === "spam") || (f === "3" && c.state === "review"));

  const setState = (id: number, state: (typeof items)[number]["state"]) => setItems((xs) => xs.map((x) => (x.id === id ? { ...x, state } : x)));

  return (
    <>
      <PageHeader title={t.title} sub={t.sub} actions={<Segmented layoutId="cm-filter" value={f} onChange={setF} options={t.filters.map((x, i) => ({ value: String(i) as F, label: x }))} />} />
      <div className="grid gap-3 lg:grid-cols-2">
        <AnimatePresence initial={false} mode="popLayout">
          {shown.map((c) => (
            <motion.div key={c.id} layout initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ type: "spring", stiffness: 260, damping: 26 }}>
              <Card className={c.state === "spam" ? "opacity-60" : ""}>
                <div className="flex items-start gap-3">
                  <Avatar name={c.from.replace("@", "")} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold" dir="ltr">
                        {c.from}
                      </p>
                      <span className="text-xs text-muted">
                        {t.post}: {c.post} · {c.time}
                      </span>
                    </div>
                    <p className={`mt-1.5 text-[15px] ${c.state === "spam" ? "line-through" : ""}`} dir="auto">
                      {c.text}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {c.state === "dm" && (
                        <>
                          <Badge tone="accent" icon={<ChatCircle size={12} weight="fill" />}>{t.replied}</Badge>
                          <Badge tone="accent" icon={<PaperPlaneTilt size={12} weight="fill" />}>{t.dmSent}</Badge>
                        </>
                      )}
                      {c.state === "replied" && <Badge tone="accent">{t.replied}</Badge>}
                      {c.state === "spam" && <Badge tone="danger" icon={<EyeSlash size={12} />}>{t.hidden}</Badge>}
                      {c.state === "review" && <Badge tone="warn" icon={<Warning size={12} />}>{t.review}</Badge>}
                      <span className="ms-auto flex gap-1">
                        {c.state === "spam" && (
                          <PressButton onClick={() => setState(c.id, "review")} radius={18} pressedRadius={8} className="h-9 border border-line px-3 text-xs text-ink">
                            <Eye size={14} />
                            {t.unhide}
                          </PressButton>
                        )}
                        {c.state === "review" && (
                          <PressButton onClick={() => setState(c.id, "dm")} radius={18} pressedRadius={8} className="h-9 bg-accent px-3 text-xs font-medium text-accent-ink">
                            <PaperPlaneTilt size={14} weight="fill" />
                            {t.reply}
                          </PressButton>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}
