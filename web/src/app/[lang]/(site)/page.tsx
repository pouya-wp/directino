import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/i18n/dictionaries";
import { getAppDict } from "@/i18n/app";
import { Preloader } from "@/components/fx/preloader";
import { Hero } from "@/components/hero";
import { ChannelMarquee } from "@/components/channel-marquee";
import { Manifesto } from "@/components/manifesto";
import { NightShift } from "@/components/night-shift";
import { CommentDemo } from "@/components/comment-demo";
import { Features } from "@/components/features";
import { Modes } from "@/components/modes";
import { Pricing } from "@/components/pricing";
import { Trust } from "@/components/trust";
import { Faq } from "@/components/faq";
import { FinalCta } from "@/components/final-cta";

export default async function Page({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const app = getAppDict(lang);

  return (
    <>
      <Preloader label="Directino" />
      <main>
        <Hero dict={dict} lang={lang} slogan={app.slogan} signup={app.links.signup} />
        <ChannelMarquee items={dict.marquee} rtl={lang === "fa"} />
        <Manifesto text={dict.manifesto} />
        <NightShift night={dict.night} rtl={lang === "fa"} />
        <CommentDemo comment={dict.comment} />
        <Features f={dict.features} rtl={lang === "fa"} />
        <Modes m={dict.modes} />
        <Pricing p={dict.pricing} lang={lang} />
        <Trust t={app.trust} />
        <Faq faq={dict.faq} rtl={lang === "fa"} />
        <FinalCta dict={dict} app={app} lang={lang} />
      </main>
    </>
  );
}
