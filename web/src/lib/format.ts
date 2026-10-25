export type Lang = "fa" | "en";

export const num = (n: number, lang: Lang, digits = 0) =>
  new Intl.NumberFormat(lang === "fa" ? "fa-IR" : "en-US", { maximumFractionDigits: digits }).format(n);

// Toman for the Iran edition, dollars for international.
export const money = (n: number, lang: Lang) => (lang === "fa" ? `${num(n, lang)} تومان` : `$${num(n, lang, 2)}`);

export const plans = [
  { id: "starter", fa: { name: "پایه", price: 490_000 }, en: { name: "Starter", price: 19 }, limit: 1000 },
  { id: "growth", fa: { name: "رشد", price: 1_290_000 }, en: { name: "Growth", price: 49 }, limit: 5000 },
  { id: "scale", fa: { name: "حرفه‌ای", price: 3_400_000 }, en: { name: "Scale", price: 129 }, limit: 20000 },
] as const;

export type PlanId = (typeof plans)[number]["id"];
export const findPlan = (id: string | null) => plans.find((p) => p.id === id) ?? plans[1];

// VAT applies to the Iran edition only.
export const taxRate = (lang: Lang) => (lang === "fa" ? 0.1 : 0);

// Day labels ending today; fixed anchor date so server and client agree.
const ANCHOR = Date.UTC(2026, 9, 13);
export function dayLabels(n: number, lang: Lang) {
  const f = new Intl.DateTimeFormat(lang === "fa" ? "fa-IR-u-ca-persian" : "en-US", { day: "numeric", month: "short", timeZone: "UTC" });
  return Array.from({ length: n }, (_, i) => f.format(new Date(ANCHOR - (n - 1 - i) * 86_400_000)));
}
