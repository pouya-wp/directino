"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowsClockwise, FileXls, MagnifyingGlass, Plus, UploadSimple } from "@phosphor-icons/react";
import { faqs, products } from "@/lib/mock";
import { money, num } from "@/lib/format";
import { Badge, Card, CardTitle, Input, PageHeader, Segmented, Switch, Textarea } from "../ui/kit";
import { PressButton } from "../fx/press";
import { LogoMark } from "../logo";
import { useDash } from "./shell";

type Tab = "0" | "1" | "2";

// What the sample reply looks like at each tone and length, so the setting has a visible effect.
const samples = {
  fa: [
    ["سبز موجود نیست. رنگ زیتونی موجوده.", "سبز فعلاً موجود نیست، ولی زیتونی خیلی نزدیکشه و همه‌ی سایزها موجوده.", "متأسفانه رنگ سبز فعلاً موجود نیست. پیشنهاد ما رنگ زیتونیه که از نظر تُن خیلی نزدیکه، در همه‌ی سایزها موجوده و ارسالش هم ۲ روز کاریه."],
    ["سبزش تموم شده، ولی زیتونی داریم!", "سبزش فعلاً تموم شده ولی زیتونی خیلی شبیهشه و همه‌ی سایزها هست. عکسش رو بفرستم؟", "آخ سبزش فعلاً تموم شده! ولی زیتونی رو ببین، خیلی نزدیکشه و همه‌ی سایزها موجوده. می‌خوای عکس تنت رو هم بفرستم؟"],
    ["سبز؟ نه. زیتونی؟ آره!", "سبز رو مشتری‌ها تموم کردن! زیتونی ولی هنوز هست و به نظرم حتی قشنگ‌تره.", "سبز رو مشتری‌های زرنگ‌تر از ما تموم کردن! ولی زیتونی هنوز هست، همه‌ی سایزها، و بین خودمون باشه، قشنگ‌تره. عکسش رو بفرستم؟"],
  ],
  en: [
    ["Green is out. Olive is available.", "Green is out of stock, but olive is very close and available in every size.", "Unfortunately green is currently out of stock. We'd suggest olive, which is very close in tone, available in every size, and ships in 2 business days."],
    ["Green's sold out, but we have olive!", "Green is sold out for now, but olive is super close and in every size. Want a photo?", "Oh, green just sold out! Olive is really close though, and we have every size. Want me to send a photo of it on?"],
    ["Green? Gone. Olive? Yes!", "Green got snapped up! Olive is still here though, and honestly it's even nicer.", "Green got snapped up by faster shoppers! Olive is still here in every size, and between us, it's nicer. Want a photo?"],
  ],
};

export function Knowledge() {
  const { app, lang } = useDash();
  const t = app.dash.knowledge;
  const [tab, setTab] = useState<Tab>("0");
  const [q, setQ] = useState("");
  const [faqList, setFaqList] = useState(() => faqs(lang));
  const [tone, setTone] = useState("1");
  const [length, setLength] = useState("1");
  const [emoji, setEmoji] = useState(false);
  const items = useMemo(() => products(lang).filter((p) => p.name.toLowerCase().includes(q.toLowerCase())), [lang, q]);
  const sample = samples[lang][Number(tone)][Number(length)] + (emoji ? (tone === "0" ? "" : " ✨") : "");

  return (
    <>
      <PageHeader title={t.title} sub={t.sub} actions={<Segmented layoutId="kn-tab" value={tab} onChange={setTab} options={t.tabs.map((x, i) => ({ value: String(i) as Tab, label: x }))} />} />
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
          {tab === "0" && (
            <Card>
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <label className="relative flex-1">
                  <span className="sr-only">{app.common.search}</span>
                  <MagnifyingGlass size={16} className="absolute start-3.5 top-1/2 -translate-y-1/2 text-muted" />
                  <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={app.common.search} className="h-11 ps-10" />
                </label>
                <PressButton radius={22} pressedRadius={10} className="h-11 border border-line px-4 text-sm text-ink">
                  <FileXls size={18} />
                  {t.import}
                </PressButton>
                <PressButton radius={22} pressedRadius={10} className="h-11 border border-line px-4 text-sm text-ink">
                  <ArrowsClockwise size={18} />
                  {t.sync}
                </PressButton>
                <PressButton radius={22} pressedRadius={10} className="h-11 bg-accent px-4 text-sm font-medium text-accent-ink">
                  <Plus size={18} weight="bold" />
                  {t.addProduct}
                </PressButton>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-sm">
                  <thead className="text-muted">
                    <tr className="border-b border-line">
                      <th className="py-3 text-start font-medium">{t.product}</th>
                      <th className="py-3 text-start font-medium">SKU</th>
                      <th className="py-3 text-end font-medium">{t.price}</th>
                      <th className="py-3 text-end font-medium">{t.stock}</th>
                      <th className="py-3 text-end font-medium">{t.status}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((p, i) => (
                      <motion.tr key={p.sku} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="border-b border-line last:border-0 hover:bg-surface-2/50">
                        <td className="py-3 font-medium">{p.name}</td>
                        <td className="py-3 font-mono text-muted" dir="ltr">
                          {p.sku}
                        </td>
                        <td className="py-3 text-end tabular-nums">{money(p.price, lang)}</td>
                        <td className="py-3 text-end tabular-nums">{num(p.stock, lang)}</td>
                        <td className="py-3 text-end">
                          {p.stock === 0 ? <Badge tone="danger">{t.out}</Badge> : p.stock < 8 ? <Badge tone="warn">{t.low}</Badge> : <Badge tone="accent">{t.inStock}</Badge>}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {tab === "1" && (
            <div className="flex flex-col gap-3">
              <AnimatePresence initial={false}>
                {faqList.map((f, i) => (
                  <motion.div key={i} layout initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                    <Card className="grid gap-3 md:grid-cols-2">
                      <label className="flex flex-col gap-1.5 text-sm">
                        <span className="text-muted">{t.question}</span>
                        <Input value={f.q} onChange={(e) => setFaqList((l) => l.map((x, j) => (j === i ? { ...x, q: e.target.value } : x)))} />
                      </label>
                      <label className="flex flex-col gap-1.5 text-sm">
                        <span className="text-muted">{t.answer}</span>
                        <Input value={f.a} onChange={(e) => setFaqList((l) => l.map((x, j) => (j === i ? { ...x, a: e.target.value } : x)))} />
                      </label>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
              <PressButton onClick={() => setFaqList((l) => [...l, { q: "", a: "" }])} className="h-12 w-fit border border-dashed border-line px-5 text-sm text-ink">
                <Plus size={18} />
                {t.addFaq}
              </PressButton>
            </div>
          )}

          {tab === "2" && (
            <div className="grid gap-4 lg:grid-cols-2">
              <Card className="flex flex-col gap-6">
                <CardTitle>{t.voiceTitle}</CardTitle>
                <div className="flex flex-col gap-2">
                  <p className="text-sm text-muted">{t.tone}</p>
                  <Segmented layoutId="tone" value={tone} onChange={setTone} options={t.tones.map((x, i) => ({ value: String(i), label: x }))} />
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-sm text-muted">{t.length}</p>
                  <Segmented layoutId="len" value={length} onChange={setLength} options={t.lengths.map((x, i) => ({ value: String(i), label: x }))} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">{t.emoji}</span>
                  <Switch checked={emoji} onChange={setEmoji} label={t.emoji} />
                </div>
                <div className="rounded-2xl border border-dashed border-line p-4">
                  <p className="font-medium">{t.examples}</p>
                  <p className="mt-1 text-sm text-muted">{t.examplesBody}</p>
                  <PressButton radius={20} pressedRadius={10} className="mt-3 h-10 border border-line px-4 text-sm text-ink">
                    <UploadSimple size={16} />
                    {t.upload}
                  </PressButton>
                </div>
              </Card>
              <Card className="bg-night text-night-ink">
                <CardTitle>{t.sample}</CardTitle>
                <p className="w-fit max-w-[85%] rounded-[20px] rounded-ss-md bg-white/10 px-4 py-2.5">{t.samplePrompt}</p>
                <div className="mt-3 flex items-end justify-end gap-2">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={sample}
                      initial={{ opacity: 0, y: 10, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ type: "spring", stiffness: 260, damping: 22 }}
                      className="max-w-[85%] rounded-[20px] rounded-se-md bg-accent px-4 py-2.5 leading-relaxed text-accent-ink"
                    >
                      {sample}
                    </motion.p>
                  </AnimatePresence>
                  <LogoMark size={30} />
                </div>
                <Textarea className="mt-6 min-h-20 border-white/10 bg-white/5 text-sm text-night-ink" placeholder={lang === "fa" ? "یه دستور خاص برای لحن بنویس…" : "Add a custom style instruction…"} aria-label={t.voiceTitle} />
              </Card>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
