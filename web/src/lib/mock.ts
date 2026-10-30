import type { Channel } from "@/i18n/dictionaries";
import type { Lang } from "./format";
import type { Conversation as ApiConversation } from "./types";

/*
  Mock workspace data for the dashboard frontend. Deterministic so server and client
  render the same thing. Replace with API calls when the Go backend lands.
*/

export type Author = "customer" | "ai" | "human";
export type ConvStatus = "needs" | "ai" | "closed";

export type Conversation = {
  id: string;
  channel: Channel;
  name: string;
  handle: string;
  time: string;
  status: ConvStatus;
  unread: number;
  messages: { from: Author; text: string; time: string }[];
  draft?: { text: string; confidence: number };
  customer: { since: string; spent: number; orders: { id: string; item: string; status: string }[]; tags: string[] };
};

const L = <T,>(lang: Lang, fa: T, en: T) => (lang === "fa" ? fa : en);

export function conversations(lang: Lang): Conversation[] {
  return [
    {
      id: "c1",
      channel: "instagram",
      name: L(lang, "مهسا رحیمی", "Lena Fischer"),
      handle: L(lang, "@mahsa.style", "@lena.studio"),
      time: L(lang, "۲ دقیقه", "2m"),
      status: "needs",
      unread: 2,
      messages: [
        { from: "customer", text: L(lang, "سلام، این مانتو سایز ۵۰ هم داره؟", "Hi, does the linen set come in XXL?"), time: "23:41" },
        { from: "customer", text: L(lang, "برای عروسی می‌خوام، تا پنجشنبه می‌رسه؟", "I need it for a wedding, can it arrive by Thursday?"), time: "23:42" },
      ],
      draft: {
        text: L(lang, "سلام مهسا جان! سایز ۵۰ فعلاً موجود نیست، ولی ۴۸ با ۲ سانت گشادی موجوده. اگه امشب سفارش بدی، پنجشنبه می‌رسه.", "Hi Lena! XXL is out right now, but XL runs large and is in stock. Order tonight and it arrives Thursday."),
        confidence: 0.64,
      },
      customer: {
        since: L(lang, "فروردین ۱۴۰۴", "March 2025"),
        spent: L(lang, 4_850_000, 212),
        orders: [{ id: "48211", item: L(lang, "شال ابریشم", "Silk scarf"), status: L(lang, "تحویل‌شده", "Delivered") }],
        tags: [L(lang, "مشتری وفادار", "Returning"), L(lang, "سایز بزرگ", "Plus size")],
      },
    },
    {
      id: "c2",
      channel: "whatsapp",
      name: L(lang, "نیلوفر احمدی", "Marco Bellini"),
      handle: "+98 912 •••• 418",
      time: L(lang, "۵ دقیقه", "5m"),
      status: "ai",
      unread: 0,
      messages: [
        { from: "customer", text: L(lang, "سفارشم کی می‌رسه؟ کد ۴۸۲۱۷", "Where is my order 48217?"), time: "23:30" },
        { from: "ai", text: L(lang, "سفارش ۴۸۲۱۷ امروز صبح تحویل پست شد. کد رهگیری: ۲۰۴۸۸۱۹۳۲۷.", "Order 48217 left our warehouse this morning. Tracking: DHL 7739 2018 44."), time: "23:30" },
        { from: "customer", text: L(lang, "مرسی 🙏", "Thanks!"), time: "23:31" },
      ],
      customer: { since: L(lang, "مهر ۱۴۰۵", "Sep 2026"), spent: L(lang, 1_480_000, 84), orders: [{ id: "48217", item: L(lang, "ست کتان", "Linen set"), status: L(lang, "ارسال‌شده", "Shipped") }], tags: [L(lang, "مشتری جدید", "New")] },
    },
    {
      id: "c3",
      channel: "telegram",
      name: L(lang, "رضا کاظمی", "Aisha Rahman"),
      handle: L(lang, "@reza_k", "@aisha.r"),
      time: L(lang, "۱۲ دقیقه", "12m"),
      status: "ai",
      unread: 0,
      messages: [
        { from: "customer", text: L(lang, "ارسال به شیراز دارین؟", "Do you ship to Milan?"), time: "23:18" },
        { from: "ai", text: L(lang, "بله، ارسال به شیراز ۲ تا ۳ روز کاریه و برای خرید بالای ۲ میلیون رایگانه.", "We do. Milan takes 3 to 4 business days, free over $120."), time: "23:18" },
      ],
      customer: { since: L(lang, "امروز", "Today"), spent: 0, orders: [], tags: [] },
    },
    {
      id: "c4",
      channel: "instagram",
      name: L(lang, "سارا موسوی", "Hana Sato"),
      handle: L(lang, "@sara.mvd", "@hana.sato"),
      time: L(lang, "۲۰ دقیقه", "20m"),
      status: "needs",
      unread: 1,
      messages: [
        { from: "customer", text: L(lang, "سفارش قبلیم پاره بود، خیلی ناراحتم", "My last order arrived torn. Really disappointed."), time: "23:10" },
      ],
      draft: {
        text: L(lang, "سارا جان واقعاً متأسفیم. لطفاً یه عکس از محصول بفرست تا همین امروز تعویضش رو هماهنگ کنیم.", "Hana, we're really sorry. Could you send a photo? We'll arrange a replacement today."),
        confidence: 0.41,
      },
      customer: { since: L(lang, "دی ۱۴۰۴", "Jan 2026"), spent: L(lang, 2_350_000, 140), orders: [{ id: "47902", item: L(lang, "کیف چرم", "Leather bag"), status: L(lang, "تحویل‌شده", "Delivered") }], tags: [L(lang, "شکایت", "Complaint")] },
    },
    {
      id: "c5",
      channel: "instagram",
      name: L(lang, "آرش کریمی", "Jules Martin"),
      handle: L(lang, "@arash.km", "@jules.k"),
      time: L(lang, "۳۵ دقیقه", "35m"),
      status: "closed",
      unread: 0,
      messages: [
        { from: "customer", text: L(lang, "قیمت؟", "price??"), time: "22:55" },
        { from: "ai", text: L(lang, "قیمت ست کتان ۱٫۴۸۰٫۰۰۰ تومنه. لینک خرید رو برات فرستادم.", "The linen set is $84. Checkout link sent!"), time: "22:55" },
        { from: "customer", text: L(lang, "خریدم 😍", "Just ordered"), time: "23:02" },
      ],
      customer: { since: L(lang, "امروز", "Today"), spent: L(lang, 1_480_000, 84), orders: [{ id: "48220", item: L(lang, "ست کتان", "Linen set"), status: L(lang, "در حال آماده‌سازی", "Preparing") }], tags: [L(lang, "از کامنت", "From comment")] },
    },
    {
      id: "c6",
      channel: "whatsapp",
      name: L(lang, "پویان رستمی", "Noah Weber"),
      handle: "+98 935 •••• 207",
      time: L(lang, "۱ ساعت", "1h"),
      status: "closed",
      unread: 0,
      messages: [
        { from: "customer", text: L(lang, "می‌شه سایزمو بعد از سفارش عوض کنم؟", "Can I switch to size M after ordering?"), time: "22:10" },
        { from: "ai", text: L(lang, "حتماً، تا قبل از ارسال می‌شه. سفارشت رو به سایز ۴۲ تغییر دادم.", "Yes, until it ships. I've switched your order to M."), time: "22:10" },
      ],
      customer: { since: L(lang, "شهریور ۱۴۰۵", "Aug 2026"), spent: L(lang, 3_100_000, 168), orders: [{ id: "48190", item: L(lang, "کت پشمی", "Wool coat"), status: L(lang, "ثبت‌شده", "Placed") }], tags: [] },
    },
  ];
}

// 30 days of conversation counts with a weekly rhythm and a growth trend.
export const dailyConversations = Array.from({ length: 30 }, (_, i) => {
  const weekly = [0.92, 0.88, 0.95, 1.02, 1.1, 1.24, 1.18][i % 7];
  return Math.round((96 + i * 2.4) * weekly + ((i * 37) % 11) - 5);
});

export const responseSeconds = Array.from({ length: 30 }, (_, i) => Math.round(9 + ((i * 53) % 7) - i * 0.12));

export const channelSplit = [
  { channel: "instagram" as Channel, value: 2148 },
  { channel: "whatsapp" as Channel, value: 1022 },
  { channel: "telegram" as Channel, value: 614 },
];

export function products(lang: Lang) {
  return [
    { name: L(lang, "ست کتان", "Linen set"), sku: "LN-001", price: L(lang, 1_480_000, 84), stock: 38 },
    { name: L(lang, "شال ابریشم", "Silk scarf"), sku: "SK-014", price: L(lang, 590_000, 32), stock: 6 },
    { name: L(lang, "کت پشمی", "Wool coat"), sku: "WC-203", price: L(lang, 4_200_000, 210), stock: 0 },
    { name: L(lang, "کیف چرم مشکی", "Black leather bag"), sku: "BG-110", price: L(lang, 2_350_000, 129), stock: 12 },
    { name: L(lang, "مانتو کتان", "Linen shirt dress"), sku: "MD-077", price: L(lang, 1_890_000, 96), stock: 4 },
    { name: L(lang, "شلوار راسته", "Straight trousers"), sku: "TR-031", price: L(lang, 980_000, 58), stock: 21 },
  ];
}

export function faqs(lang: Lang) {
  return [
    { q: L(lang, "ارسال به شهرستان دارین؟", "Do you ship internationally?"), a: L(lang, "بله، به همه‌ی شهرها با پست پیشتاز. ۲ تا ۴ روز کاری.", "Yes, to the EU and UK. 3 to 5 business days.") },
    { q: L(lang, "امکان تعویض هست؟", "Can I exchange an item?"), a: L(lang, "تا ۷ روز بعد از تحویل، در صورت سالم بودن محصول.", "Within 14 days of delivery, if unworn.") },
    { q: L(lang, "پرداخت در محل دارین؟", "Do you offer cash on delivery?"), a: L(lang, "فقط برای تهران.", "No, card and PayPal only.") },
    { q: L(lang, "جنس پارچه‌ها چیه؟", "What fabrics do you use?"), a: L(lang, "کتان و ابریشم طبیعی، تولید داخل.", "Natural linen and silk, made in Portugal.") },
  ];
}

export function commentsFeed(lang: Lang) {
  return [
    { id: 1, from: L(lang, "@mina.lne", "@mira.lane"), text: L(lang, "قیمت؟", "price?"), post: L(lang, "ست کتان", "Linen set"), state: "dm" as const, time: L(lang, "۳ دقیقه", "3m") },
    { id: 2, from: L(lang, "@ali_hk", "@tom_hk"), text: L(lang, "آبیش چنده", "how much for the blue one"), post: L(lang, "ست کتان", "Linen set"), state: "dm" as const, time: L(lang, "۸ دقیقه", "8m") },
    { id: 3, from: L(lang, "@followers.fast", "@cheap.followers"), text: L(lang, "فالوور ارزون بخر 👉 bit.ly", "buy followers 👉 bit.ly"), post: L(lang, "کالکشن پاییز", "Fall drop"), state: "spam" as const, time: L(lang, "۱۲ دقیقه", "12m") },
    { id: 4, from: L(lang, "@dena.v", "@dee.v"), text: L(lang, "سایز بزرگ هم میاد؟", "will you restock XXL?"), post: L(lang, "مانتو کتان", "Shirt dress"), state: "review" as const, time: L(lang, "۲۰ دقیقه", "20m") },
    { id: 5, from: L(lang, "@sofi.rz", "@sofi.r"), text: L(lang, "gheymat lotfan", "price pls"), post: L(lang, "کیف چرم", "Leather bag"), state: "dm" as const, time: L(lang, "۳۱ دقیقه", "31m") },
    { id: 6, from: L(lang, "@narges.design", "@nora.design"), text: L(lang, "چقدر قشنگه 😍", "so pretty"), post: L(lang, "کالکشن پاییز", "Fall drop"), state: "replied" as const, time: L(lang, "۴۰ دقیقه", "40m") },
  ];
}

export function team(lang: Lang) {
  return [
    { name: L(lang, "سارا نوری", "Sara Novak"), email: "sara@roya.shop", role: 0, status: "active" as const, seen: L(lang, "الان", "Now") },
    { name: L(lang, "امیر تهرانی", "Amir Haddad"), email: "amir@roya.shop", role: 1, status: "active" as const, seen: L(lang, "۲ ساعت پیش", "2h ago") },
    { name: L(lang, "الهام صدری", "Elena Ruiz"), email: "elham@roya.shop", role: 2, status: "active" as const, seen: L(lang, "دیروز", "Yesterday") },
    { name: "", email: "support@roya.shop", role: 2, status: "invited" as const, seen: "" },
  ];
}

export function invoices(lang: Lang) {
  return [
    { id: "INV-2026-10", date: L(lang, "۱ مهر ۱۴۰۵", "Oct 1, 2026"), amount: L(lang, 1_419_000, 49) },
    { id: "INV-2026-09", date: L(lang, "۱ شهریور ۱۴۰۵", "Sep 1, 2026"), amount: L(lang, 1_419_000, 49) },
    { id: "INV-2026-08", date: L(lang, "۱ مرداد ۱۴۰۵", "Aug 1, 2026"), amount: L(lang, 539_000, 19) },
  ];
}

export function topQuestions(lang: Lang) {
  return [
    { q: L(lang, "قیمت", "Price"), n: 1284 },
    { q: L(lang, "موجودی و سایز", "Stock and sizes"), n: 812 },
    { q: L(lang, "زمان ارسال", "Shipping time"), n: 604 },
    { q: L(lang, "وضعیت سفارش", "Order status"), n: 457 },
    { q: L(lang, "تعویض و مرجوعی", "Returns"), n: 189 },
  ];
}

export const handoffShare = [41, 27, 19, 13];

// demoConversations maps the rich demo data into the API Conversation shape so the
// dashboard's live hook can fall back to it unchanged when no backend is connected.

export function demoConversations(lang: Lang): ApiConversation[] {
  const base = Date.now();
  return conversations(lang).map((c, i) => ({
    id: c.id,
    workspace: "demo",
    channel: c.channel,
    account: "demo",
    threadId: c.id,
    contact: { id: c.handle, handle: c.handle, name: c.name },
    status: c.status,
    humanOnly: false,
    messages: c.messages.map((m, j) => ({ id: `${c.id}-${j}`, from: m.from, text: m.text, at: m.time })),
    draft: c.draft ? { text: c.draft.text, confidence: c.draft.confidence, intent: "other", handoff: c.draft.confidence < 0.5, reason: "" } : null,
    updatedAt: new Date(base - i * 60000).toISOString(),
    time: c.time,
    unread: c.unread,
    customer: c.customer,
  }));
}
