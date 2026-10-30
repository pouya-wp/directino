"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowsClockwise, HandPalm, PaperPlaneRight, PencilSimple, Robot, Sparkle } from "@phosphor-icons/react";
import { money, num } from "@/lib/format";
import { useLive } from "@/lib/useLive";
import type { ConvStatus } from "@/lib/types";
import { ChannelIcon } from "../channel-icon";
import { Avatar, Badge, Segmented, Textarea } from "../ui/kit";
import { PressButton } from "../fx/press";
import { LogoMark } from "../logo";
import { useDash } from "./shell";

type Filter = "0" | "1" | "2" | "3";
const statusFor: Record<Filter, ConvStatus | null> = { "0": null, "1": "needs", "2": "ai", "3": "closed" };

export function Inbox() {
  const { app, lang } = useDash();
  const t = app.dash.inbox;
  const reduce = useReducedMotion();
  const params = useSearchParams();
  const { conversations: convs, approve: apiApprove, reply: apiReply, handback: apiHandback, patch } = useLive(lang);
  const [filter, setFilter] = useState<Filter>("0");
  const [sel, setSel] = useState<string | null>(params.get("c"));
  const [editing, setEditing] = useState(false);
  const [draftText, setDraftText] = useState("");
  const [replyText, setReplyText] = useState("");
  const [note, setNote] = useState("");
  const scroller = useRef<HTMLDivElement>(null);

  const list = convs.filter((c) => !statusFor[filter] || c.status === statusFor[filter]);
  const active = convs.find((c) => c.id === sel) ?? null;
  const isHuman = active?.humanOnly ?? false;

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: reduce ? "auto" : "smooth" });
  }, [active?.messages.length, sel, reduce]);

  const approve = () => {
    if (!active?.draft) return;
    void apiApprove(active.id, editing ? draftText : undefined);
    setEditing(false);
  };

  // Regenerate is a local nicety in demo mode; the live agent owns real drafts.
  const regenerate = () => {
    if (!active?.draft) return;
    const alt = lang === "fa" ? " اگه سؤال دیگه‌ای داشتی همین‌جا بپرس." : " Anything else I can help with?";
    patch(active.id, (c) => ({ ...c, draft: c.draft ? { ...c.draft, text: c.draft.text.replace(alt, "") + alt, confidence: Math.min(0.95, c.draft.confidence + 0.12) } : c.draft }));
  };

  const send = () => {
    if (!active || !replyText.trim()) return;
    void apiReply(active.id, replyText.trim());
    setReplyText("");
  };

  const toggleHuman = () => {
    if (!active) return;
    if (isHuman) void apiHandback(active.id);
    else patch(active.id, (c) => ({ ...c, humanOnly: true })); // confirmed on the server once you send
  };

  const counts = useMemo(() => ({ needs: convs.filter((c) => c.status === "needs").length }), [convs]);

  return (
    <div className="-mx-4 -my-6 grid h-[calc(100dvh-4rem)] md:-mx-8 md:-my-8 lg:grid-cols-[340px_1fr] xl:grid-cols-[340px_1fr_300px]">
      {/* List */}
      <section className={`flex min-h-0 flex-col border-e border-line ${active ? "hidden lg:flex" : "flex"}`}>
        <div className="flex flex-col gap-3 border-b border-line p-4">
          <h1 className="flex items-center gap-2 text-xl font-semibold">
            {t.title}
            {counts.needs > 0 && <Badge tone="warn">{num(counts.needs, lang)}</Badge>}
          </h1>
          <div className="overflow-x-auto">
            <Segmented layoutId="inbox-filter" value={filter} onChange={setFilter} options={t.filters.map((f, i) => ({ value: String(i) as Filter, label: f }))} />
          </div>
        </div>
        <ul className="min-h-0 flex-1 overflow-y-auto p-2">
          <AnimatePresence initial={false}>
            {list.map((c) => {
              const last = c.messages[c.messages.length - 1];
              const unread = c.unread ?? 0;
              return (
                <motion.li key={c.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, height: 0 }}>
                  <button
                    type="button"
                    onClick={() => {
                      setSel(c.id);
                      setEditing(false);
                      patch(c.id, (x) => ({ ...x, unread: 0 }));
                    }}
                    className={`flex w-full items-start gap-3 rounded-2xl p-3 text-start transition-colors ${sel === c.id ? "bg-surface-2" : "hover:bg-surface-2/60"}`}
                  >
                    <span className="relative">
                      <Avatar name={c.contact.name} size={42} />
                      <span className="absolute -bottom-0.5 -end-0.5 grid size-5 place-items-center rounded-full bg-surface ring-2 ring-bg">
                        <ChannelIcon channel={c.channel} size={12} />
                      </span>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-semibold">{c.contact.name}</span>
                        {c.time && <span className="shrink-0 text-xs text-muted">{c.time}</span>}
                      </span>
                      <span className="mt-0.5 flex items-center gap-1.5">
                        {last?.from === "ai" && <Robot size={13} className="shrink-0 text-accent-text" aria-hidden />}
                        <span className={`truncate text-sm ${unread ? "font-medium text-ink" : "text-muted"}`}>{last?.text}</span>
                      </span>
                      <span className="mt-1.5 flex items-center gap-1.5">
                        {c.status === "needs" && <Badge tone="warn">{t.filters[1]}</Badge>}
                        {c.status === "ai" && <Badge tone="accent">{t.filters[2]}</Badge>}
                        {unread > 0 && (
                          <span className="grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1.5 text-[11px] font-semibold text-accent-ink">{num(unread, lang)}</span>
                        )}
                      </span>
                    </span>
                  </button>
                </motion.li>
              );
            })}
          </AnimatePresence>
          {list.length === 0 && <li className="p-6 text-center text-sm text-muted">{t.noMessages}</li>}
        </ul>
      </section>

      {/* Thread */}
      <section className={`min-h-0 flex-col ${active ? "flex" : "hidden lg:flex"}`}>
        {active ? (
          <>
            <header className="flex items-center gap-3 border-b border-line px-4 py-3">
              <button type="button" onClick={() => setSel(null)} className="grid size-9 place-items-center rounded-full hover:bg-surface-2 lg:hidden" aria-label={app.common.back}>
                <ArrowLeft size={18} className="rtl:-scale-x-100" />
              </button>
              <Avatar name={active.contact.name} size={38} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{active.contact.name}</p>
                <p className="flex items-center gap-1.5 text-xs text-muted" dir="auto">
                  <ChannelIcon channel={active.channel} size={12} />
                  {active.contact.handle}
                </p>
              </div>
              <PressButton
                onClick={toggleHuman}
                radius={20}
                pressedRadius={10}
                className={`h-10 px-4 text-sm font-medium ${isHuman ? "bg-accent text-accent-ink" : "border border-line text-ink"}`}
              >
                {isHuman ? <Robot size={16} aria-hidden /> : <HandPalm size={16} aria-hidden />}
                {isHuman ? t.handBack : t.takeOver}
              </PressButton>
            </header>

            <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto px-4 py-6">
              <ul className="mx-auto flex max-w-[680px] flex-col gap-3">
                <AnimatePresence initial={false}>
                  {active.messages.map((m) => (
                    <motion.li
                      key={m.id}
                      initial={reduce ? false : { opacity: 0, y: 10, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ type: "spring", stiffness: 260, damping: 22 }}
                      className={`flex flex-col ${m.from === "customer" ? "items-start" : "items-end"}`}
                    >
                      <p
                        className={`max-w-[78%] px-4 py-2.5 text-[15px] leading-relaxed ${
                          m.from === "customer"
                            ? "rounded-[20px] rounded-ss-md bg-surface-2"
                            : m.from === "ai"
                              ? "rounded-[20px] rounded-se-md bg-accent text-accent-ink"
                              : "rounded-[20px] rounded-se-md bg-ink text-bg"
                        }`}
                        dir="auto"
                      >
                        {m.text}
                      </p>
                      <span className="mt-1 flex items-center gap-1 text-[11px] text-muted">
                        {m.from === "ai" && <Sparkle size={11} weight="fill" className="text-accent-text" />}
                        {m.at}
                      </span>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            </div>

            <AnimatePresence>
              {active.draft && !isHuman && (
                <motion.div
                  key="draft"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20, transition: { duration: 0.2 } }}
                  className="mx-4 mb-3 rounded-[24px] border-2 border-dashed border-accent-text/50 bg-accent/10 p-4"
                >
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2 text-sm font-semibold">
                      <LogoMark size={24} />
                      {t.aiDraft}
                    </span>
                    <span className="flex items-center gap-2 text-xs text-muted">
                      {t.confidence}
                      <span className="h-1.5 w-20 overflow-hidden rounded-full bg-surface-2">
                        <motion.span
                          className={`block h-full rounded-full ${active.draft.confidence < 0.5 ? "bg-[#e0a21b]" : "bg-viz-1"}`}
                          animate={{ width: `${active.draft.confidence * 100}%` }}
                          transition={{ type: "spring", stiffness: 120, damping: 20 }}
                        />
                      </span>
                      <span className="font-semibold tabular-nums text-ink">{num(Math.round(active.draft.confidence * 100), lang)}%</span>
                    </span>
                  </div>
                  {editing ? (
                    <Textarea value={draftText} onChange={(e) => setDraftText(e.target.value)} className="min-h-24" aria-label={t.edit} />
                  ) : (
                    <p className="text-[15px] leading-relaxed" dir="auto">
                      {active.draft.text}
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <PressButton onClick={approve} radius={20} pressedRadius={10} className="h-10 bg-accent px-4 text-sm font-medium text-accent-ink">
                      <PaperPlaneRight size={16} weight="fill" className="rtl:-scale-x-100" aria-hidden />
                      {t.approve}
                    </PressButton>
                    <PressButton
                      onClick={() => {
                        setDraftText(active.draft!.text);
                        setEditing((e) => !e);
                      }}
                      radius={20}
                      pressedRadius={10}
                      className="h-10 border border-line px-4 text-sm text-ink"
                    >
                      <PencilSimple size={16} aria-hidden />
                      {t.edit}
                    </PressButton>
                    <PressButton onClick={regenerate} radius={20} pressedRadius={10} className="h-10 px-4 text-sm text-muted">
                      <ArrowsClockwise size={16} aria-hidden />
                      {t.regenerate}
                    </PressButton>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {isHuman && <p className="mx-4 mb-2 rounded-xl bg-surface-2 px-3 py-2 text-xs text-muted">{t.humanMode}</p>}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
              className="flex items-center gap-2 border-t border-line p-3"
            >
              <label htmlFor="dx-reply" className="sr-only">
                {t.composer}
              </label>
              <input
                id="dx-reply"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={t.composer}
                className="h-12 flex-1 rounded-full bg-surface-2 px-5 text-[15px] placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <PressButton type="submit" aria-label={t.send} disabled={!replyText.trim()} radius={24} pressedRadius={12} className="size-12 bg-ink text-bg disabled:opacity-40">
                <PaperPlaneRight size={20} weight="fill" className="rtl:-scale-x-100" />
              </PressButton>
            </form>
          </>
        ) : (
          <div className="grid flex-1 place-items-center p-8 text-center text-muted">
            <div className="flex flex-col items-center gap-4">
              <LogoMark size={64} />
              <p>{t.empty}</p>
            </div>
          </div>
        )}
      </section>

      {/* Customer */}
      <aside className="hidden min-h-0 overflow-y-auto border-s border-line p-5 xl:block">
        {active && (
          <motion.div key={active.id} initial={reduce ? false : { opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-6">
            <div className="flex flex-col items-center text-center">
              <Avatar name={active.contact.name} size={72} />
              <p className="mt-3 font-semibold">{active.contact.name}</p>
              <p className="text-sm text-muted" dir="auto">
                {active.contact.handle}
              </p>
            </div>
            {active.customer && (
              <>
                <dl className="grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-2xl bg-surface-2 p-3">
                    <dt className="text-xs text-muted">{t.since}</dt>
                    <dd className="mt-1 font-medium">{active.customer.since}</dd>
                  </div>
                  <div className="rounded-2xl bg-surface-2 p-3">
                    <dt className="text-xs text-muted">{t.spent}</dt>
                    <dd className="mt-1 font-medium tabular-nums">{money(active.customer.spent, lang)}</dd>
                  </div>
                </dl>
                {active.customer.orders.length > 0 && (
                  <div>
                    <p className="mb-2 text-sm font-semibold">{t.orders}</p>
                    <ul className="flex flex-col gap-2">
                      {active.customer.orders.map((o) => (
                        <li key={o.id} className="flex items-center justify-between rounded-2xl border border-line px-3 py-2.5 text-sm">
                          <span>
                            <span className="block font-medium">{o.item}</span>
                            <span className="text-xs text-muted tabular-nums">#{num(Number(o.id), lang).replace(/[,٬]/g, "")}</span>
                          </span>
                          <Badge>{o.status}</Badge>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {active.customer.tags.length > 0 && (
                  <div>
                    <p className="mb-2 text-sm font-semibold">{t.tags}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {active.customer.tags.map((tag) => (
                        <Badge key={tag} tone="accent">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
            <div>
              <label htmlFor="dx-note" className="mb-2 block text-sm font-semibold">
                {t.notes}
              </label>
              <Textarea id="dx-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder={t.notePlaceholder} className="min-h-24 text-sm" />
            </div>
          </motion.div>
        )}
      </aside>
    </div>
  );
}
