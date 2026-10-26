"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ComponentPropsWithoutRef, type MouseEvent, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { LogoMark } from "../logo";

/*
  Curtain transitions. Five strips sweep across in the reading direction: a lime leading
  edge, then night. The mascot types in the middle while the destination's name rises.
  Language switches are full reloads (different root layout), so the reveal half is
  handed over through sessionStorage and a pre-paint class on <html>.
*/

type Phase = "idle" | "cover" | "hold" | "reveal";
type Veil = { label: string; dir: "ltr" | "rtl"; font: "fa" | "en" };

const KEY = "dx-veil";
const STRIPS = 5;
const ease = [0.76, 0, 0.24, 1] as const;

// Read the handoff once per page load, so a StrictMode effect re-run still sees it.
let handoff: Veil | null | undefined;
function takeHandoff(): Veil | null {
  if (handoff !== undefined) return handoff;
  let found: Veil | null = null;
  try {
    const raw = sessionStorage.getItem(KEY);
    if (raw) found = JSON.parse(raw);
    sessionStorage.removeItem(KEY);
  } catch {}
  handoff = found;
  return found;
}

const Ctx = createContext<{ go: (href: string, opts?: { label?: string; hard?: boolean; to?: "fa" | "en" }) => void }>({
  go: () => {},
});

export const useTransitionNav = () => useContext(Ctx);

export function Transitions({ lang, children }: { lang: "fa" | "en"; children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("idle");
  const [veil, setVeil] = useState<Veil>({ label: "", dir: lang === "fa" ? "rtl" : "ltr", font: lang });
  const pending = useRef<string | null>(null);

  // Pick up a reveal handed over by a hard navigation (language switch).
  useEffect(() => {
    const saved = takeHandoff();
    if (!saved) {
      document.documentElement.classList.remove("veil-on");
      return;
    }
    const v = saved;
    const raf = requestAnimationFrame(() => {
      setVeil(v);
      setPhase("hold");
    });
    const t = window.setTimeout(() => {
      handoff = null;
      document.documentElement.classList.remove("veil-on");
      setPhase("reveal");
    }, 700);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(t);
    };
  }, []);

  // Soft navigation finished: open the curtain.
  useEffect(() => {
    if (phase === "hold" && pending.current && pending.current === pathname) {
      pending.current = null;
      const t = window.setTimeout(() => setPhase("reveal"), 120);
      return () => window.clearTimeout(t);
    }
  }, [pathname, phase]);

  const go = useCallback(
    (href: string, opts?: { label?: string; hard?: boolean; to?: "fa" | "en" }) => {
      const to = opts?.to ?? lang;
      if (reduce) {
        if (opts?.hard) window.location.assign(href);
        else router.push(href);
        return;
      }
      const v: Veil = { label: opts?.label ?? "", dir: to === "fa" ? "rtl" : "ltr", font: to };
      setVeil(v);
      setPhase("cover");
      window.setTimeout(() => {
        if (opts?.hard) {
          try {
            sessionStorage.setItem(KEY, JSON.stringify(v));
          } catch {}
          window.location.assign(href);
          return;
        }
        pending.current = href.split("#")[0].split("?")[0];
        setPhase("hold");
        router.push(href);
        // Same path (only a query/hash change): open right away.
        if (pending.current === pathname) {
          pending.current = null;
          window.setTimeout(() => setPhase("reveal"), 150);
        }
      }, 760);
    },
    [lang, pathname, reduce, router],
  );

  const covering = phase === "cover" || phase === "hold";
  const fromEnd = veil.dir === "rtl";

  return (
    <Ctx.Provider value={{ go }}>
      {children}
      <AnimatePresence>
        {phase !== "idle" && (
          <motion.div key="veil" aria-hidden className="pointer-events-auto fixed inset-0 z-[80] flex" dir="ltr" exit={{ opacity: 0, transition: { duration: 0.01 } }}>
            {Array.from({ length: STRIPS }, (_, i) => {
              const order = fromEnd ? STRIPS - 1 - i : i;
              const startCovered = phase === "hold" || phase === "reveal";
              return (
                <div key={i} className="relative h-full flex-1">
                  <motion.span
                    className="absolute inset-0 origin-bottom bg-accent"
                    initial={{ scaleY: startCovered ? 1 : 0 }}
                    animate={{ scaleY: covering ? 1 : 0, transformOrigin: covering ? "50% 100%" : "50% 0%" }}
                    transition={{ duration: 0.55, ease, delay: covering ? order * 0.05 : order * 0.05 + 0.12 }}
                  />
                  <motion.span
                    className="absolute inset-0 origin-bottom bg-night"
                    initial={{ scaleY: startCovered ? 1 : 0 }}
                    animate={{ scaleY: covering ? 1 : 0, transformOrigin: covering ? "50% 100%" : "50% 0%" }}
                    transition={{ duration: 0.55, ease, delay: covering ? order * 0.05 + 0.1 : order * 0.05 }}
                    onAnimationComplete={() => {
                      if (phase === "reveal" && i === (fromEnd ? 0 : STRIPS - 1)) setPhase("idle");
                    }}
                  />
                </div>
              );
            })}
            <motion.div
              className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-6 text-night-ink"
              initial={{ opacity: phase === "hold" ? 1 : 0 }}
              animate={{ opacity: covering ? 1 : 0 }}
              transition={{ duration: 0.3, delay: covering ? 0.45 : 0 }}
            >
              <LogoMark size={72} typing />
              {veil.label && (
                <span className="overflow-hidden pb-2">
                  <motion.span
                    dir={veil.font === "fa" ? "rtl" : "ltr"}
                    className={`block text-[clamp(2.5rem,8vw,6rem)] leading-none ${veil.font === "fa" ? "font-[family-name:var(--font-gofteh)]" : "font-[family-name:var(--font-geist)] font-semibold tracking-tighter"}`}
                    initial={{ y: "110%" }}
                    animate={{ y: covering ? 0 : "-110%" }}
                    transition={{ duration: 0.6, ease, delay: covering ? 0.5 : 0 }}
                  >
                    {veil.label}
                  </motion.span>
                </span>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Ctx.Provider>
  );
}

// Link that plays the curtain before a client navigation. Modifier clicks behave normally.
export function TLink({ href, label, className, children, onClick: userClick, ...rest }: { href: string; label?: string; className?: string; children: ReactNode } & Omit<ComponentPropsWithoutRef<"a">, "href">) {
  const { go } = useTransitionNav();
  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    userClick?.(e);
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    go(href, { label });
  };
  return (
    <Link {...rest} href={href} onClick={onClick} className={className}>
      {children}
    </Link>
  );
}
