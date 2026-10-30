"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  Bell,
  Books,
  ChartLineUp,
  ChatCircleText,
  GearSix,
  Lightning,
  List,
  MagnifyingGlass,
  PlugsConnected,
  Receipt,
  SignOut,
  SquaresFour,
  Tray,
  UserCircle,
  UsersThree,
  X,
} from "@phosphor-icons/react";
import type { AppDict } from "@/i18n/app";
import type { Lang } from "@/lib/format";
import { num } from "@/lib/format";
import { Logo, LogoMark } from "../logo";
import { TLink, useTransitionNav } from "../fx/transitions";
import { LangSwitch } from "../lang-switch";
import { Avatar, Badge } from "../ui/kit";
import { api } from "@/lib/api";

type Profile = { name: string; email: string; workspaceName: string };
type Ctx = { app: AppDict; lang: Lang; base: string; agentLive: boolean; setAgentLive: (v: boolean) => void; profile: Profile; signOut: () => void };
const DashCtx = createContext<Ctx | null>(null);
export const useDash = () => {
  const c = useContext(DashCtx);
  if (!c) throw new Error("useDash outside DashShell");
  return c;
};

const groups = [
  { key: "work", items: [{ key: "overview", path: "", icon: SquaresFour }, { key: "inbox", path: "/inbox", icon: Tray, count: 2 }, { key: "comments", path: "/comments", icon: ChatCircleText }, { key: "analytics", path: "/analytics", icon: ChartLineUp }] },
  { key: "setup", items: [{ key: "channels", path: "/channels", icon: PlugsConnected }, { key: "knowledge", path: "/knowledge", icon: Books }, { key: "automations", path: "/automations", icon: Lightning }] },
  { key: "workspace", items: [{ key: "team", path: "/team", icon: UsersThree }, { key: "settings", path: "/settings", icon: GearSix }, { key: "billing", path: "/billing", icon: Receipt }, { key: "account", path: "/account", icon: UserCircle }] },
] as const;

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { app, lang, base, agentLive, setAgentLive, profile, signOut } = useDash();
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const d = app.dash;

  return (
    <div className="flex h-full flex-col gap-6 p-4">
      <div className="flex items-center justify-between px-2 pt-1">
        <TLink href={`/${lang}`} label={app.common.home} aria-label="Directino">
          <Logo size={30} />
        </TLink>
      </div>

      <div className="flex items-center gap-3 rounded-2xl bg-surface-2 p-3">
        <Avatar name={profile.workspaceName} size={36} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{profile.workspaceName}</p>
          <Badge tone="accent">{d.planBadge}</Badge>
        </div>
      </div>

      {/* Agent master switch: the one control that matters most, always in reach. */}
      <button
        type="button"
        onClick={() => setAgentLive(!agentLive)}
        className={`group flex items-center gap-3 rounded-2xl p-3 text-start transition-colors ${agentLive ? "bg-night text-night-ink" : "border border-dashed border-line"}`}
        aria-pressed={agentLive}
      >
        <LogoMark size={34} typing={agentLive} />
        <span className="flex-1">
          <span className="block text-xs opacity-70">{d.agent.label}</span>
          <span className="flex items-center gap-1.5 text-sm font-semibold">
            {agentLive && <span className="relative size-2 rounded-full bg-accent"><span className="absolute inset-0 animate-ping rounded-full bg-accent motion-reduce:hidden" /></span>}
            {agentLive ? d.agent.live : d.agent.paused}
          </span>
        </span>
        <span className="text-xs opacity-60 group-hover:opacity-100">{agentLive ? d.agent.pause : d.agent.resume}</span>
      </button>

      <nav className="flex flex-1 flex-col gap-5 overflow-y-auto">
        {groups.map((g) => (
          <div key={g.key}>
            <p className="mb-1.5 px-3 text-xs font-medium text-muted">{d.groups[g.key]}</p>
            <ul className="flex flex-col gap-0.5">
              {g.items.map((it) => {
                const href = `${base}${it.path}`;
                const active = it.path === "" ? pathname === base : pathname.startsWith(href);
                const Icon = it.icon;
                return (
                  <li key={it.key}>
                    <Link
                      href={href}
                      onClick={onNavigate}
                      className={`relative flex h-10 items-center gap-3 rounded-xl px-3 text-sm transition-colors ${active ? "font-semibold text-ink" : "text-muted hover:bg-surface-2 hover:text-ink"}`}
                    >
                      {active && (
                        <motion.span
                          layoutId="dash-nav"
                          className="absolute inset-0 rounded-xl bg-surface-2"
                          transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 34 }}
                        />
                      )}
                      <Icon size={19} weight={active ? "fill" : "regular"} className={`relative ${active ? "text-accent-text" : ""}`} aria-hidden />
                      <span className="relative flex-1">{d.nav[it.key]}</span>
                      {"count" in it && it.count ? (
                        <span className="relative grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1.5 text-[11px] font-semibold text-accent-ink">{num(it.count, lang)}</span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="flex items-center gap-3 border-t border-line px-2 pt-4">
        <Avatar name={profile.name} size={34} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{profile.name}</p>
          <p className="truncate text-xs text-muted" dir="ltr">{profile.email}</p>
        </div>
        <button type="button" onClick={signOut} aria-label={app.common.signOut} className="grid size-9 place-items-center rounded-full text-muted hover:bg-surface-2 hover:text-ink">
          <SignOut size={18} className="rtl:-scale-x-100" />
        </button>
      </div>
    </div>
  );
}

export function DashShell({ app, lang, children }: { app: AppDict; lang: Lang; children: ReactNode }) {
  const [agentLive, setAgentLive] = useState(true);
  const [drawer, setDrawer] = useState(false);
  const pathname = usePathname();
  const { go } = useTransitionNav();
  const base = `/${lang}/app`;

  // Demo identity until the real session loads; keeps the dashboard viewable without a backend.
  const demo: Profile = { name: lang === "fa" ? "سارا نوری" : "Sara Novak", email: "sara@roya.shop", workspaceName: app.dash.workspace };
  const [profile, setProfile] = useState<Profile>(demo);
  useEffect(() => {
    let cancelled = false;
    api
      .me()
      .then((u) => {
        if (!cancelled) setProfile({ name: u.name, email: u.email, workspaceName: u.workspaceName || u.name });
      })
      .catch(() => {}); // no session: stay on demo identity
    return () => {
      cancelled = true;
    };
  }, []);

  const signOut = () => {
    void api.logout().catch(() => {});
    go(`/${lang}/login`, { label: app.links.login });
  };

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    const t = window.setTimeout(() => setDrawer(false), 0);
    return () => window.clearTimeout(t);
  }, [pathname]);

  return (
    <DashCtx.Provider value={{ app, lang, base, agentLive, setAgentLive, profile, signOut }}>
      <div className="flex min-h-[100dvh] bg-bg">
        <aside className="sticky top-0 hidden h-[100dvh] w-[272px] shrink-0 border-e border-line bg-surface lg:block">
          <Sidebar />
        </aside>

        <AnimatePresence>
          {drawer && (
            <>
              <motion.div key="scrim" className="fixed inset-0 z-40 bg-black/40 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDrawer(false)} />
              <motion.aside
                key="drawer"
                className="fixed inset-y-0 start-0 z-50 w-[290px] bg-surface shadow-2xl lg:hidden"
                initial={{ x: lang === "fa" ? "100%" : "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: lang === "fa" ? "100%" : "-100%" }}
                transition={{ type: "spring", stiffness: 320, damping: 34 }}
              >
                <button type="button" onClick={() => setDrawer(false)} aria-label={app.common.cancel} className="absolute end-3 top-4 grid size-9 place-items-center rounded-full hover:bg-surface-2">
                  <X size={18} />
                </button>
                <Sidebar onNavigate={() => setDrawer(false)} />
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-bg/80 px-4 backdrop-blur-xl md:px-6">
            <button type="button" onClick={() => setDrawer(true)} aria-label="Menu" className="grid size-10 place-items-center rounded-full hover:bg-surface-2 lg:hidden">
              <List size={20} />
            </button>
            <label className="relative hidden max-w-sm flex-1 sm:block">
              <span className="sr-only">{app.common.search}</span>
              <MagnifyingGlass size={16} className="absolute start-3.5 top-1/2 -translate-y-1/2 text-muted" aria-hidden />
              <input placeholder={app.common.search} className="h-10 w-full rounded-full border border-line bg-surface ps-10 pe-14 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent" />
              <kbd className="absolute end-3 top-1/2 -translate-y-1/2 rounded-md border border-line px-1.5 text-[11px] text-muted" dir="ltr">
                ⌘K
              </kbd>
            </label>
            <div className="ms-auto flex items-center gap-1">
              <LangSwitch lang={lang} />
              <button type="button" aria-label="Notifications" className="relative grid size-10 place-items-center rounded-full hover:bg-surface-2">
                <Bell size={20} />
                <span className="absolute end-2.5 top-2.5 size-2 rounded-full bg-accent ring-2 ring-bg" />
              </button>
            </div>
          </header>
          <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
        </div>
      </div>
    </DashCtx.Provider>
  );
}
