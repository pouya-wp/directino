"use client";

import { usePathname } from "next/navigation";
import { Translate } from "@phosphor-icons/react";
import { useTransitionNav } from "./fx/transitions";

// Swaps the locale prefix and plays the curtain in the new reading direction.
export function LangSwitch({ lang, className = "" }: { lang: "fa" | "en"; className?: string }) {
  const { go } = useTransitionNav();
  const pathname = usePathname();
  const to = lang === "fa" ? "en" : "fa";
  const label = to === "fa" ? "فارسی" : "English";
  const href = pathname.replace(/^\/(fa|en)(?=\/|$)/, `/${to}`) || `/${to}`;
  return (
    <a
      href={href}
      onClick={(e) => {
        e.preventDefault();
        go(href, { label, hard: true, to });
      }}
      className={`group inline-flex h-11 items-center gap-1.5 whitespace-nowrap rounded-full px-3 text-sm text-muted transition-colors hover:text-ink ${className}`}
    >
      <Translate size={16} aria-hidden className="transition-transform duration-500 group-hover:rotate-[360deg]" />
      <span lang={to} className={to === "fa" ? "font-[family-name:var(--font-peyda)]" : "font-[family-name:var(--font-geist)]"}>
        {label}
      </span>
    </a>
  );
}
