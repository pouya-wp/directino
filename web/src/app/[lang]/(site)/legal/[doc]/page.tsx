import { notFound } from "next/navigation";
import { getDictionary, hasLocale, locales } from "@/i18n/dictionaries";
import { getAppDict } from "@/i18n/app";
import { PageIntro, Prose, SiteFooter } from "@/components/site-shell";
import { TLink } from "@/components/fx/transitions";
import { LegalBody } from "@/components/legal-body";

const docs = ["terms", "privacy", "refund"] as const;
type Doc = (typeof docs)[number];
const isDoc = (d: string): d is Doc => (docs as readonly string[]).includes(d);

export async function generateStaticParams() {
  return locales.flatMap((lang) => docs.map((doc) => ({ lang, doc })));
}

export default async function LegalPage({ params }: PageProps<"/[lang]/legal/[doc]">) {
  const { lang, doc } = await params;
  if (!hasLocale(lang) || !isDoc(doc)) notFound();
  const dict = getDictionary(lang);
  const app = getAppDict(lang);
  const l = app.legal;
  const d = l.docs[doc];

  return (
    <>
      <main>
        <PageIntro title={d.title} lead={`${l.updated}: ${l.date}`} />
        <Prose>
          <div className="grid gap-12 lg:grid-cols-[0.22fr_0.78fr]">
            <nav className="flex flex-row flex-wrap gap-2 lg:sticky lg:top-32 lg:flex-col lg:self-start">
              {docs.map((k) => (
                <TLink
                  key={k}
                  href={`/${lang}/legal/${k}`}
                  label={l.docs[k].title}
                  className={`rounded-full px-4 py-2 text-sm transition-colors ${k === doc ? "bg-ink text-bg" : "text-muted hover:bg-surface"}`}
                >
                  {l.docs[k].title}
                </TLink>
              ))}
            </nav>
            <LegalBody sections={d.sections} note={l.draftNote} onThisPage={l.onThisPage} />
          </div>
        </Prose>
      </main>
      <SiteFooter dict={dict} app={app} lang={lang} />
    </>
  );
}
