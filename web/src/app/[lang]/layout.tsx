import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Geist, Geist_Mono } from "next/font/google";
import { gofteh, peyda } from "@/fonts";
import { getDictionary, hasLocale, locales } from "@/i18n/dictionaries";
import { Transitions } from "@/components/fx/transitions";
import { InlineScript } from "@/components/inline-script";
import "../globals.css";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = getDictionary(lang);
  return {
    title: dict.meta.title,
    description: dict.meta.description,
    alternates: { languages: { fa: "/fa", en: "/en" } },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f1f3ef" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0e0c" },
  ],
};

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  return (
    <html
      lang={lang}
      dir={lang === "fa" ? "rtl" : "ltr"}
      suppressHydrationWarning
      className={`${geist.variable} ${geistMono.variable} ${peyda.variable} ${gofteh.variable} antialiased`}
    >
      <head>
        {/* Hide the preloader before first paint on repeat visits. */}
        <InlineScript html={"try{var c=document.documentElement.classList;if(sessionStorage.getItem('dx-intro-seen')==='1')c.add('intro-seen');if(sessionStorage.getItem('dx-veil'))c.add('veil-on','intro-seen')}catch(e){}"} />
      </head>
      <body>
        <Transitions lang={lang}>{children}</Transitions>
      </body>
    </html>
  );
}
