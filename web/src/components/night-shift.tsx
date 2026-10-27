"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "motion/react";
import type { Dict } from "@/i18n/dictionaries";

gsap.registerPlugin(ScrollTrigger);

// Deterministic starfield so server and client markup match.
const STARS = (() => {
  let s = 7;
  const rand = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
  return Array.from({ length: 90 }, () => ({ x: rand() * 200, y: rand() * 70, r: rand() * 1.6 + 0.4, o: rand() * 0.6 + 0.25 }));
})();

const START_MIN = 23 * 60 + 40;
const SPAN_MIN = 7 * 60 + 50; // 23:40 -> 07:30

/*
  The one deliberate theme switch on the page: the story happens at night,
  so this block is always dark. Scrolling moves the clock, sets the moon and brings up the dawn.
*/
export function NightShift({ night, rtl }: { night: Dict["night"]; rtl: boolean }) {
  const wrap = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const clock = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce || !wrap.current || !track.current) return;
    if (!window.matchMedia("(min-width: 768px)").matches) return;

    const fmt = new Intl.NumberFormat(rtl ? "fa-IR" : "en-US", { minimumIntegerDigits: 2 });
    const setClock = (p: number) => {
      const m = Math.round(START_MIN + SPAN_MIN * p) % 1440;
      if (clock.current) clock.current.textContent = `${fmt.format(Math.floor(m / 60))}:${fmt.format(m % 60)}`;
    };

    const ctx = gsap.context(() => {
      const getDistance = () => Math.max(0, track.current!.scrollWidth - wrap.current!.clientWidth);
      const dir = rtl ? 1 : -1;
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: wrap.current,
          start: "top top",
          end: () => `+=${getDistance()}`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => setClock(self.progress),
        },
      });
      tl.to(track.current, { x: () => dir * getDistance() }, 0)
        .to("[data-stars]", { x: () => dir * getDistance() * 0.12 }, 0)
        .to("[data-moon]", { yPercent: 260, opacity: 0.2 }, 0)
        .fromTo("[data-dawn]", { opacity: 0 }, { opacity: 1, duration: 0.45 }, 0.55)
        .to("[data-stars]", { opacity: 0, duration: 0.35 }, 0.62);
      gsap.utils.toArray<HTMLElement>("[data-float]").forEach((el, i) => {
        tl.fromTo(el, { y: i % 2 ? 60 : -40 }, { y: i % 2 ? -50 : 40 }, 0);
      });
    }, wrap);
    return () => ctx.revert();
  }, [reduce, rtl]);

  return (
    // Stable wrapper: GSAP inserts its pin-spacer here, so React never loses track of the section.
    <div>
    <section
      id="how"
      ref={wrap}
      aria-label={night.title}
      className={`relative isolate w-full bg-night text-night-ink ${reduce ? "overflow-x-auto" : "overflow-hidden"}`}
    >
      {/* Sky layers */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div data-stars className="absolute inset-y-0 start-0 w-[200%]">
          {STARS.map((s, i) => (
            <span
              key={i}
              className="absolute rounded-full bg-white"
              style={{ left: `${s.x / 2}%`, top: `${s.y}%`, width: s.r * 2, height: s.r * 2, opacity: s.o }}
            />
          ))}
        </div>
        <div data-moon className="absolute end-[12%] top-[10%] size-24 md:size-32">
          {/* Glow behind, then a crescent cut with a mask so no dark disc is ever drawn. */}
          <span className="absolute inset-[-40%] rounded-full bg-[radial-gradient(circle,rgb(242_240_230/0.16),transparent_62%)]" />
          <span className="moon absolute inset-0 rounded-full bg-[radial-gradient(circle_at_35%_40%,#fbfaf3,#e4e1d2_70%)]" />
        </div>
        <div
          data-dawn
          className="absolute inset-0 opacity-0 bg-[radial-gradient(90%_70%_at_50%_95%,rgb(247_213_138/0.5)_0%,rgb(196_236_79/0.16)_45%,transparent_75%)] [mask-image:linear-gradient(to_bottom,black_55%,transparent_100%)]"
        />
      </div>

      <div aria-hidden className="pointer-events-none absolute bottom-8 end-8 z-10 hidden md:block">
        <span ref={clock} dir="ltr" className="font-mono text-sm tracking-[0.2em] text-night-muted tabular-nums">
          {rtl ? "۲۳:۴۰" : "23:40"}
        </span>
      </div>

      <div
        ref={track}
        className="flex w-full flex-col gap-4 px-4 py-20 md:h-[100dvh] md:w-max md:flex-row md:items-center md:gap-6 md:px-8 md:py-24"
      >
        <div className="flex shrink-0 flex-col justify-center md:w-[min(600px,80vw)] md:pe-16">
          <p className="mb-6 text-sm uppercase tracking-[0.18em] text-night-muted">{night.eyebrow}</p>
          <h2 className="text-[clamp(2.25rem,4.8vw,4.5rem)] font-semibold leading-[1.04] tracking-tighter">{night.title}</h2>
          <p className="mt-6 max-w-[40ch] text-lg leading-relaxed text-night-muted">{night.lead}</p>
        </div>

        {night.panels.map((p, i) => (
          <article
            key={p.time}
            data-float
            className={`group relative flex shrink-0 flex-col justify-between overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] p-7 backdrop-blur-sm md:h-[66vh] md:w-[400px] md:p-9 ${
              i % 2 ? "md:rotate-[1.5deg]" : "md:-rotate-[1.5deg]"
            }`}
          >
            <p className="relative font-mono text-6xl font-light tracking-tight text-night-ink md:text-7xl" dir="ltr">
              {p.time}
            </p>
            <div className="relative mt-16">
              <h3 className="text-2xl font-medium tracking-tight">{p.title}</h3>
              <p className="mt-3 leading-relaxed text-night-muted">{p.body}</p>
              <p className="ms-auto mt-7 w-fit rounded-[18px] rounded-se-md bg-accent px-4 py-2.5 text-[15px] text-accent-ink shadow-[0_10px_40px_-10px_rgb(196_236_79/0.6)]">
                {p.bubble}
              </p>
            </div>
          </article>
        ))}

        <article className="relative flex shrink-0 flex-col justify-between overflow-hidden rounded-[28px] p-7 text-accent-ink md:h-[78vh] md:w-[min(680px,85vw)] md:p-12">
          <div aria-hidden className="absolute inset-0 bg-[radial-gradient(120%_90%_at_80%_110%,#f7d58a_0%,#c4ec4f_45%,#9fd13a_100%)]" />
          <div aria-hidden className="absolute -bottom-24 end-10 size-56 rounded-full bg-[#fff3c4] blur-2xl opacity-80" />
          <p className="relative font-mono text-6xl font-light tracking-tight md:text-8xl" dir="ltr">
            {night.dawnTime}
          </p>
          <div className="relative mt-16">
            <h3 className="text-[clamp(1.9rem,3.4vw,3rem)] font-semibold leading-[1.08] tracking-tighter">{night.dawnTitle}</h3>
            <p className="mt-4 max-w-[38ch] text-lg leading-relaxed opacity-80">{night.dawnBody}</p>
          </div>
        </article>
      </div>
    </section>
    {/* Sunrise bridge: carries the dawn glow out of the pinned section into the page. */}
    <div
      aria-hidden
      className="pointer-events-none relative z-10 -mt-[30vh] h-[75vh] bg-[radial-gradient(65%_38%_at_50%_40%,rgb(247_213_138/0.3),rgb(196_236_79/0.08)_50%,transparent_75%),linear-gradient(to_bottom,transparent_40%,var(--night)_40%,var(--bg)_100%)]"
    />
    </div>
  );
}
