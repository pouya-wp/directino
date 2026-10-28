import { Suspense } from "react";
import { notFound } from "next/navigation";
import { hasLocale } from "@/i18n/dictionaries";
import { getAppDict } from "@/i18n/app";
import { Checkout } from "@/components/checkout/checkout";

export default async function CheckoutPage({ params }: PageProps<"/[lang]/checkout">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const app = getAppDict(lang);
  // The plan comes from the query string, read on the client inside Suspense.
  return (
    <Suspense>
      <Checkout c={app.checkout} common={app.common} lang={lang} />
    </Suspense>
  );
}
