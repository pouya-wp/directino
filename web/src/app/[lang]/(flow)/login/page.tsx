import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/i18n/dictionaries";
import { getAppDict } from "@/i18n/app";
import { AuthForm } from "@/components/auth/auth-form";

export default async function Page({ params }: PageProps<"/[lang]/login">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const app = getAppDict(lang);
  return <AuthForm mode="login" a={app.auth} links={app.links} hero={getDictionary(lang).hero} lang={lang} />;
}
