"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { CheckCircle, Heartbeat } from "@phosphor-icons/react";
import type { Channel } from "@/i18n/dictionaries";
import { getDictionary } from "@/i18n/dictionaries";
import { num } from "@/lib/format";
import { ChannelIcon } from "../channel-icon";
import { Badge, Card, Field, Input, Modal, PageHeader } from "../ui/kit";
import { PressButton } from "../fx/press";
import { LogoMark } from "../logo";
import { QRCodeSVG } from "qrcode.react";
import { api } from "@/lib/api";
import { useDash } from "./shell";

type State = { connected: boolean; handle: string; last: string; limit: number };

/*
  Placeholder QR pattern. The real code comes from the backend session (WhatsApp / Telegram
  linked-device login); this only reserves the space and shows the scanning state.
*/
function FakeQr() {
  const n = 25;
  const cells: [number, number][] = [];
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++) {
      const finder = (x < 7 && y < 7) || (x > n - 8 && y < 7) || (x < 7 && y > n - 8);
      if (finder) continue;
      if (((x * 73 + y * 151 + x * y * 7) % 11) < 5) cells.push([x, y]);
    }
  const finderAt = (fx: number, fy: number) => (
    <g key={`${fx}-${fy}`}>
      <rect x={fx} y={fy} width={7} height={7} rx={1.6} fill="var(--ink)" />
      <rect x={fx + 1} y={fy + 1} width={5} height={5} rx={1} fill="var(--surface)" />
      <rect x={fx + 2} y={fy + 2} width={3} height={3} rx={0.8} fill="var(--ink)" />
    </g>
  );
  return (
    <svg viewBox={`-1 -1 ${n + 2} ${n + 2}`} className="size-56" aria-hidden>
      {cells.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x + 0.1} y={y + 0.1} width={0.8} height={0.8} rx={0.3} fill="var(--ink)" />
      ))}
      {finderAt(0, 0)}
      {finderAt(n - 7, 0)}
      {finderAt(0, n - 7)}
    </svg>
  );
}

export function Channels() {
  const { app, lang } = useDash();
  const t = app.dash.channels;
  const names = getDictionary(lang).hero.channelNames;
  const reduce = useReducedMotion();
  const [state, setState] = useState<Record<Channel, State>>({
    instagram: { connected: true, handle: lang === "fa" ? "@roya.atelier" : "@linen.and.co", last: lang === "fa" ? "۱ دقیقه پیش" : "1 min ago", limit: 400 },
    whatsapp: { connected: true, handle: "+98 912 •••• 418", last: lang === "fa" ? "۵ دقیقه پیش" : "5 min ago", limit: 300 },
    telegram: { connected: false, handle: "", last: "", limit: 300 },
  });
  const [connecting, setConnecting] = useState<Channel | null>(null);
  const [scanned, setScanned] = useState(false);

  // Simulated scan: the backend will push a "linked" event instead.
  // Real QR string from the backend link stream (whatsmeow), when a backend is present.
  const [realQr, setRealQr] = useState("");

  const finish = (c: Channel) => {
    setState((s) => ({ ...s, [c]: { ...s[c], connected: true, handle: s[c].handle || (c === "telegram" ? "@roya_shop" : s[c].handle), last: lang === "fa" ? "همین الان" : "Just now" } }));
    setConnecting(null);
    setScanned(false);
    setRealQr("");
  };

  // WhatsApp links over a live SSE stream; falls back to a simulated scan when offline.
  useEffect(() => {
    if (connecting !== "whatsapp") return;
    const es = new EventSource(api.linkUrl("whatsapp"), { withCredentials: true });
    let simulate: number | undefined;
    es.addEventListener("login", (e) => {
      try {
        const step = JSON.parse((e as MessageEvent).data) as { kind: string; payload?: string };
        if (step.kind === "qr" && step.payload) setRealQr(step.payload);
        if (step.kind === "connected") {
          setScanned(true);
          window.setTimeout(() => finish("whatsapp"), 1200);
        }
      } catch {}
    });
    es.onerror = () => {
      // No backend: show the demo scan so the flow is still demonstrable.
      es.close();
      if (simulate === undefined) simulate = window.setTimeout(() => setScanned(true), 3200);
    };
    return () => {
      es.close();
      if (simulate) window.clearTimeout(simulate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connecting]);

  return (
    <>
      <PageHeader title={t.title} sub={t.sub} />
      <div className="grid gap-4 lg:grid-cols-3">
        {(Object.keys(state) as Channel[]).map((c, i) => {
          const s = state[c];
          return (
            <motion.div key={c} initial={reduce ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08, type: "spring", stiffness: 140, damping: 18 }}>
              <Card className="flex h-full flex-col gap-5">
                <div className="flex items-start justify-between">
                  <span className={`grid size-14 place-items-center rounded-2xl ${s.connected ? "bg-accent text-accent-ink" : "bg-surface-2 text-muted"}`}>
                    <ChannelIcon channel={c} size={28} />
                  </span>
                  <Badge tone={s.connected ? "accent" : "neutral"} icon={s.connected ? <CheckCircle size={12} weight="fill" /> : undefined}>
                    {s.connected ? t.connected : t.disconnected}
                  </Badge>
                </div>
                <div>
                  <h2 className="text-xl font-semibold [font-family:var(--app-sans)]">{names[c]}</h2>
                  {s.connected && (
                    <p className="text-sm text-muted" dir="ltr">
                      {s.handle}
                    </p>
                  )}
                </div>
                {s.connected && (
                  <dl className="grid grid-cols-2 gap-2 text-sm">
                    <div className="rounded-2xl bg-surface-2 p-3">
                      <dt className="text-xs text-muted">{t.lastSync}</dt>
                      <dd className="mt-1 font-medium">{s.last}</dd>
                    </div>
                    <div className="rounded-2xl bg-surface-2 p-3">
                      <dt className="text-xs text-muted">{t.health}</dt>
                      <dd className="mt-1 flex items-center gap-1 font-medium text-accent-text">
                        <Heartbeat size={14} weight="bold" />
                        {t.healthy}
                      </dd>
                    </div>
                  </dl>
                )}
                {s.connected && (
                  <label className="block text-sm">
                    <span className="flex justify-between text-muted">
                      {t.limits}
                      <span className="font-semibold tabular-nums text-ink">{num(s.limit, lang)}</span>
                    </span>
                    <input
                      type="range"
                      min={50}
                      max={1000}
                      step={50}
                      value={s.limit}
                      onChange={(e) => setState((st) => ({ ...st, [c]: { ...st[c], limit: Number(e.target.value) } }))}
                      className="mt-2 w-full accent-[var(--viz-1)]"
                    />
                  </label>
                )}
                <div className="mt-auto">
                  {s.connected ? (
                    <PressButton
                      onClick={() => setState((st) => ({ ...st, [c]: { ...st[c], connected: false } }))}
                      className="h-11 w-full border border-line text-sm text-ink"
                      radius={22}
                      pressedRadius={10}
                    >
                      {t.disconnect}
                    </PressButton>
                  ) : (
                    <PressButton onClick={() => setConnecting(c)} className="h-11 w-full bg-accent text-sm font-medium text-accent-ink" radius={22} pressedRadius={10}>
                      {t.connect}
                    </PressButton>
                  )}
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <Modal
        open={connecting !== null}
        onClose={() => {
          setConnecting(null);
          setScanned(false);
        }}
        title={connecting === "instagram" ? t.loginTitle : t.scanTitle}
      >
        {connecting === "instagram" ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              finish("instagram");
            }}
            className="flex flex-col gap-4"
          >
            <p className="text-sm text-muted">{t.loginBody}</p>
            <Field label={t.username}>{(id) => <Input id={id} dir="ltr" autoComplete="off" />}</Field>
            <Field label={t.password}>{(id) => <Input id={id} dir="ltr" type="password" autoComplete="off" />}</Field>
            <PressButton type="submit" className="h-12 bg-accent text-sm font-medium text-accent-ink">
              {t.connect}
            </PressButton>
          </form>
        ) : (
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-sm text-muted">{t.scanBody}</p>
            <div className="relative rounded-3xl border border-line bg-surface p-4">
              <motion.div animate={{ opacity: scanned ? 0.15 : 1 }}>
                {realQr ? <QRCodeSVG value={realQr} size={224} bgColor="transparent" fgColor="var(--ink)" level="M" /> : <FakeQr />}
              </motion.div>
              {!scanned && !reduce && (
                <motion.span
                  aria-hidden
                  className="absolute inset-x-4 h-0.5 rounded-full bg-accent shadow-[0_0_16px_var(--accent)]"
                  animate={{ top: ["12%", "88%", "12%"] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                />
              )}
              {scanned && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 14 }} className="absolute inset-0 grid place-items-center">
                  <CheckCircle size={72} weight="fill" className="text-accent-text" />
                </motion.div>
              )}
            </div>
            {scanned ? (
              <PressButton onClick={() => connecting && finish(connecting)} className="h-12 w-full bg-accent text-sm font-medium text-accent-ink">
                {t.connected}
              </PressButton>
            ) : (
              <p className="flex items-center gap-2 text-sm text-muted">
                <LogoMark size={24} typing />
                {t.waiting}
              </p>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}
