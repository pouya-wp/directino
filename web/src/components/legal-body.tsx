"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring } from "motion/react";

// Long-form legal text with a reading progress rail and a section list that follows you.
export function LegalBody({ sections, note, onThisPage }: { sections: { h: string; p: string }[]; note: string; onThisPage: string }) {
  const article = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: article, offset: ["start 0.3", "end 0.7"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });
  const [active, setActive] = useState(0);

  useEffect(() => {
    const els = article.current?.querySelectorAll("section[data-i]");
    if (!els) return;
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (vis) setActive(Number((vis.target as HTMLElement).dataset.i));
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="grid gap-10 md:grid-cols-[1fr_220px]">
      <article ref={article} className="relative max-w-[68ch] ps-6">
        <span aria-hidden className="absolute inset-y-0 start-0 w-1 rounded-full bg-surface-2" />
        <motion.span aria-hidden className="absolute inset-y-0 start-0 w-1 origin-top rounded-full bg-accent" style={{ scaleY: progress }} />
        <p className="mb-10 rounded-2xl border border-dashed border-line px-4 py-3 text-sm text-muted">{note}</p>
        {sections.map((s, i) => (
          <section key={s.h} id={`s${i}`} data-i={i} className="mb-12 scroll-mt-32">
            <h2 className={`text-xl font-semibold tracking-tight transition-colors [font-family:var(--app-sans)] ${active === i ? "text-ink" : "text-muted"}`}>{s.h}</h2>
            <p className="mt-3 text-lg leading-relaxed text-muted">{s.p}</p>
          </section>
        ))}
      </article>
      <nav aria-label={onThisPage} className="hidden md:sticky md:top-32 md:block md:self-start">
        <p className="mb-3 text-xs text-muted">{onThisPage}</p>
        <ul className="flex flex-col gap-1">
          {sections.map((s, i) => (
            <li key={s.h}>
              <a href={`#s${i}`} className={`relative block rounded-lg px-3 py-1.5 text-sm transition-colors ${active === i ? "text-ink" : "text-muted hover:text-ink"}`}>
                {active === i && <motion.span layoutId="legal-active" className="absolute inset-0 rounded-lg bg-surface-2" transition={{ type: "spring", stiffness: 400, damping: 34 }} />}
                <span className="relative">{s.h}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
