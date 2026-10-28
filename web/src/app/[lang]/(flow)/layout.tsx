import { notFound } from "next/navigation";
import { hasLocale } from "@/i18n/dictionaries";
import { getAppDict } from "@/i18n/app";
import { TLink } from "@/components/fx/transitions";
import { Logo } from "@/components/logo";
import { LangSwitch } from "@/components/lang-switch";

// Focused flows (auth, checkout): no marketing nav, just the way home.
export default async function FlowLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const app = getAppDict(lang);
  return (
    <div className="min-h-[100dvh]">
      <header className="mx-auto flex h-20 max-w-[1400px] items-center justify-between px-4 md:px-8">
        <TLink href={`/${lang}`} label={app.common.home} aria-label="Directino">
          <Logo size={34} />
        </TLink>
        <LangSwitch lang={lang} />
      </header>
      {children}
    </div>
  );
}
