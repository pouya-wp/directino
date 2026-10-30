import { notFound } from "next/navigation";
import { hasLocale } from "@/i18n/dictionaries";
import { getAppDict } from "@/i18n/app";
import { DashShell } from "@/components/dash/shell";

export default async function AppLayout({ children, params }: LayoutProps<"/[lang]/app">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  return (
    <DashShell app={getAppDict(lang)} lang={lang}>
      {children}
    </DashShell>
  );
}
