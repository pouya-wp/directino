import { notFound } from "next/navigation";
import { hasLocale } from "@/i18n/dictionaries";
import { getAppDict } from "@/i18n/app";
import { Success } from "@/components/checkout/success";

export default async function SuccessPage({ params }: PageProps<"/[lang]/checkout/success">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const app = getAppDict(lang);
  return <Success c={app.checkout} dashboard={app.links.dashboard} lang={lang} />;
}
