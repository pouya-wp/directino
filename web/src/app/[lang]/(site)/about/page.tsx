import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/i18n/dictionaries";
import { getAppDict } from "@/i18n/app";
import { PageIntro, Prose, SiteFooter } from "@/components/site-shell";
import { Reveal } from "@/components/fx/reveal";
import { LogoMark } from "@/components/logo";
import { KitchenCredit } from "@/components/kitchen-credit";
import { ScrollLit } from "@/components/fx/scroll-lit";

export default async function AboutPage({ params }: PageProps<"/[lang]/about">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const app = getAppDict(lang);
  const a = app.about;

  return (
    <>
      <main>
        <PageIntro title={a.title} lead={a.lead} />
        <Prose>
          <div className="grid gap-12 border-t border-line pt-16 lg:grid-cols-[0.8fr_1.2fr]">
            <h2 className="text-3xl font-semibold tracking-tight">{a.storyTitle}</h2>
            <div className="flex flex-col gap-6">
              {a.story.map((p, i) => (
                <ScrollLit key={i} text={p} className="text-xl leading-relaxed md:text-3xl md:leading-snug" />
              ))}
            </div>
          </div>

          <div className="mt-24 rounded-[32px] bg-night p-8 text-night-ink md:p-14">
            <div className="flex items-center gap-4">
              <LogoMark size={56} />
              <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">{a.valuesTitle}</h2>
            </div>
            <div className="mt-12 grid gap-10 md:grid-cols-3">
              {a.values.map((v, i) => (
                <Reveal key={v.title} delay={i * 0.1}>
                  <span aria-hidden className="block h-1 w-10 rounded-full bg-accent" />
                  <h3 className="mt-5 text-xl font-semibold">{v.title}</h3>
                  <p className="mt-3 leading-relaxed text-night-muted">{v.body}</p>
                </Reveal>
              ))}
            </div>
          </div>

          <div className="mt-24">
            <KitchenCredit lead={a.credit} href="https://beyondex.one" />
          </div>
        </Prose>
      </main>
      <SiteFooter dict={dict} app={app} lang={lang} />
    </>
  );
}
