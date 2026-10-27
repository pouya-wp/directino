import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/i18n/dictionaries";
import { getAppDict } from "@/i18n/app";
import { PageIntro, Prose, SiteFooter } from "@/components/site-shell";
import { SecurityGrid } from "@/components/security-grid";
import { EncryptDemo } from "@/components/encrypt-demo";

export default async function SecurityPage({ params }: PageProps<"/[lang]/security">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const app = getAppDict(lang);

  return (
    <>
      <main>
        <PageIntro title={app.security.title} lead={app.security.lead} />
        <Prose>
          <EncryptDemo label={app.security.demoLabel} plain={app.security.demoPlain} note={app.security.demoNote} />
          <div className="mt-4">
            <SecurityGrid items={app.security.items} />
          </div>
        </Prose>
      </main>
      <SiteFooter dict={dict} app={app} lang={lang} />
    </>
  );
}
