import type { ReactNode } from "react";
import type { Dict } from "@/i18n/dictionaries";
import type { AppDict } from "@/i18n/app";
import { Footer } from "./footer";
import { RevealText } from "./fx/reveal-text";

// Hero block shared by the content pages.
export function PageIntro({ title, lead, eyebrow }: { title: string; lead?: string; eyebrow?: string }) {
  return (
    <header className="mx-auto max-w-[1400px] px-4 pb-16 pt-40 md:px-8 md:pt-48">
      {eyebrow && <p className="mb-6 text-sm uppercase tracking-[0.18em] text-muted">{eyebrow}</p>}
      <RevealText as="h1" text={title} className="max-w-[18ch] text-[clamp(2.5rem,6vw,5.5rem)] font-semibold leading-[1.02] tracking-tighter" />
      {lead && <p className="mt-8 max-w-[56ch] text-lg leading-relaxed text-muted md:text-xl">{lead}</p>}
    </header>
  );
}

export function SiteFooter({ dict, app, lang }: { dict: Dict; app: AppDict; lang: "fa" | "en" }) {
  return (
    <div className="mt-24 bg-night">
      <Footer dict={dict} app={app} lang={lang} />
    </div>
  );
}

export function Prose({ children }: { children: ReactNode }) {
  return <div className="mx-auto max-w-[1400px] px-4 md:px-8">{children}</div>;
}
