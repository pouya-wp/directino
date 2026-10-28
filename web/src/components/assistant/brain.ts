import type { Dict } from "@/i18n/dictionaries";

/*
  Local stand-in for the assistant. It picks the best matching answer from the page's own
  copy. When the Go backend is ready, replace the body of `ask` with a call to its chat
  endpoint; the widget only depends on this signature.
*/
const normalize = (s: string) =>
  s
    .toLowerCase()
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/‌/g, " ")
    .replace(/[؟?!.,،]/g, " ");

export async function ask(text: string, a: Dict["assistant"]): Promise<string> {
  const q = ` ${normalize(text)} `;
  let best: { score: number; answer: string } = { score: 0, answer: a.fallback };
  for (const intent of a.intents) {
    let score = 0;
    for (const key of intent.keys) {
      if (q.includes(normalize(key))) score += key.length;
    }
    if (score > best.score) best = { score, answer: intent.answer };
  }
  return best.answer;
}
