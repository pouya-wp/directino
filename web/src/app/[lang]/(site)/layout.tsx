import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/i18n/dictionaries";
import { getAppDict } from "@/i18n/app";
import { SmoothScroll } from "@/components/smooth-scroll";
import { Nav } from "@/components/nav";
import { Assistant } from "@/components/assistant/assistant";

export default async function SiteLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const app = getAppDict(lang);
  return (
    <>
      <SmoothScroll />
      <Nav dict={dict} app={app} lang={lang} />
      {children}
      <Assistant a={dict.assistant} rtl={lang === "fa"} />
    </>
  );
}
