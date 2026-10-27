import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/i18n/dictionaries";
import { getAppDict } from "@/i18n/app";
import { PageIntro, Prose, SiteFooter } from "@/components/site-shell";
import { ContactForm } from "@/components/contact-form";
import { CopyCards } from "@/components/copy-cards";

export default async function ContactPage({ params }: PageProps<"/[lang]/contact">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const app = getAppDict(lang);
  const c = app.contact;

  return (
    <>
      <main>
        <PageIntro title={c.title} lead={c.lead} />
        <Prose>
          <div className="grid gap-10 lg:grid-cols-[1.3fr_0.7fr]">
            <ContactForm c={c} />
            <aside className="flex flex-col gap-4">
              <p className="text-sm text-muted">{c.direct}</p>
              <CopyCards items={c.channels} copy={c.copy} copied={c.copied} />
            </aside>
          </div>
        </Prose>
      </main>
      <SiteFooter dict={dict} app={app} lang={lang} />
    </>
  );
}
