export type Channel = "instagram" | "whatsapp" | "telegram";

export type StormMessage = {
  channel: Channel;
  kind: "dm" | "comment";
  from: string;
  text: string;
  reply: string;
};

const en = {
  meta: {
    title: "Directino | Your DMs answer themselves",
    description:
      "An AI agent that answers every DM and comment on Instagram, WhatsApp and Telegram, in your brand's voice.",
  },
  nav: {
    how: "How it works",
    features: "Features",
    pricing: "Pricing",
    faq: "FAQ",
    cta: "Start free",
    switchLabel: "فارسی",
    switchHref: "/fa",
    live: "Replied to",
    liveAgo: "just now",
  },
  hero: {
    headlineA: "Your DMs",
    headlineB: "answer themselves.",
    sub: "An AI agent that answers every DM and comment on Instagram, WhatsApp and Telegram. In your voice, all night.",
    primary: "Start free",
    secondary: "See it work",
    counterLabel: "replied tonight",
    typing: "Directino is typing",
    channelNames: { instagram: "Instagram", whatsapp: "WhatsApp", telegram: "Telegram" },
    commentTag: "comment",
    messages: [
      { channel: "instagram", kind: "dm", from: "@lena.studio", text: "How much is the linen set?", reply: "Hi Lena! The linen set is $84, sizes XS to XL in stock. I just sent you the checkout link." },
      { channel: "whatsapp", kind: "dm", from: "Marco Bellini", text: "Do you ship to Milan?", reply: "We do. Milan takes 3 to 4 business days, and shipping is free over $120." },
      { channel: "instagram", kind: "comment", from: "@jules.k", text: "price??", reply: "Sent you the details in DM, Jules." },
      { channel: "telegram", kind: "dm", from: "Aisha Rahman", text: "Where is my order 48217?", reply: "Order 48217 left our warehouse this morning. Tracking: DHL 7739 2018 44." },
      { channel: "instagram", kind: "dm", from: "@noah.wav", text: "Can I switch to size M after ordering?", reply: "Yes, until it ships. I've switched your order to M. Anything else?" },
      { channel: "whatsapp", kind: "dm", from: "Hana Sato", text: "Is the black one back in stock?", reply: "It is, 6 left in black. Want me to hold one for you for 24 hours?" },
    ] satisfies StormMessage[],
  },
  manifesto:
    "Every DM left on read is a customer *walking* *out* the door. Directino answers in seconds, at 3 AM, on every channel, in *your* *voice.*",
  marquee: ["Instagram DMs", "Instagram comments", "WhatsApp", "Telegram", "Story replies", "Telegram Business"],
  night: {
    eyebrow: "While you sleep",
    title: "One night, zero missed messages.",
    lead: "Most sales happen after midnight. Here is what Directino does with them.",
    panels: [
      { time: "23:40", title: "A reel goes viral.", body: "212 comments asking for the price. Each one gets a public reply and the full details in DM.", bubble: "Sent you the price in DM!" },
      { time: "01:12", title: "An order closes in chat.", body: "Size, color, address and payment link, collected without a human in the loop.", bubble: "Order confirmed. Delivery on Thursday." },
      { time: "03:05", title: "An angry customer.", body: "Low confidence and a negative tone. The chat is paused and flagged for your team.", bubble: "Handed to a human at 03:05" },
      { time: "05:48", title: "Spam gets buried.", body: "Bot comments and competitor links are hidden before anyone sees them.", bubble: "37 spam comments hidden" },
    ],
    dawnTime: "07:30",
    dawnTitle: "You wake up to a clean inbox.",
    dawnBody: "Every conversation answered, every order logged, a short summary waiting for you.",
  },
  comment: {
    title: "The “price?” comment, solved.",
    body: "Every price question under your posts gets a short public reply and the full answer in DM. Comments turn into conversations, conversations into orders.",
    postCaption: "New drop. Linen set in three colors.",
    run: "Replay",
    publicReply: "Sent you the details in DM",
    dmSent: "DM sent",
    comments: [
      { from: "@mira.lane", text: "price?" },
      { from: "@tom_hk", text: "how much for the blue one" },
      { from: "@sofi.r", text: "price pls" },
      { from: "@dee.v", text: "what sizes do you have?" },
    ],
  },
  features: {
    title: "An admin that knows your shop.",
    voice: { title: "Talks like you", body: "Learns your tone from your past chats. Formal, playful, short. Your call.", samples: ["Hi! The set is $84.", "Heyy, it's $84 and it's gorgeous on.", "The set is $84. Link below."] },
    catalog: { title: "Never invents a price", body: "Prices and stock come from your catalog, synced from your store or a simple sheet.", rows: [["Linen set", "$84", "In stock"], ["Silk scarf", "$32", "6 left"], ["Wool coat", "$210", "Sold out"]] },
    handoff: { title: "Knows when to stop", body: "Unsure or upset customer? The chat goes to your team with full context." },
    spam: { title: "Spam shield", body: "Hides bot comments, scams and abuse before your audience sees them." },
    lang: { title: "Speaks Finglish too", body: "Understands slang, typos and mixed-script messages in Persian and English.", words: ["chande?", "چنده؟", "how much", "gheymat?"] },
  },
  modes: {
    title: "You decide how much it does alone.",
    tabs: [
      { key: "draft", label: "Draft", body: "Directino writes the reply. You read it and send it yourself." },
      { key: "approve", label: "Approve", body: "Replies wait for a single tap. Approve ten chats in ten seconds." },
      { key: "auto", label: "Autopilot", body: "Confident replies go out instantly. Only the tricky ones reach you." },
    ],
    incoming: "Do you have this in green?",
    reply: "Not in green yet, but the olive is very close and in stock in every size. Want a photo?",
    actions: { draft: "Copy draft", approve: "Approve and send", auto: "Sent automatically" },
  },
  pricing: {
    eyebrow: "Pricing",
    title: "Pay for conversations, not seats.",
    period: "/month",
    popular: "Most picked",
    cta: "Start free",
    note: "14 days free. No card needed.",
    plans: [
      { name: "Starter", price: "$19", desc: "For a single shop page.", items: ["1 Instagram account", "1,000 AI conversations", "Comment to DM", "Catalog of 100 products"] },
      { name: "Growth", price: "$49", desc: "For brands selling every day.", items: ["3 channels", "5,000 AI conversations", "Human handoff inbox", "Unlimited catalog", "Brand voice training"] },
      { name: "Scale", price: "$129", desc: "For agencies and big catalogs.", items: ["10 channels", "20,000 AI conversations", "Team seats and roles", "API and webhooks"] },
    ],
  },
  faq: {
    title: "Questions",
    items: [
      { q: "Do I need a business account?", a: "No. Directino connects to regular Instagram, WhatsApp and Telegram accounts, and works with business accounts too." },
      { q: "What if the AI gets it wrong?", a: "It only answers when it is confident. Anything else waits for you, and you can switch to Draft or Approve mode at any time." },
      { q: "Where do prices and stock come from?", a: "From your catalog. Connect your store or upload a sheet. The agent never makes up a price." },
      { q: "Can my team still reply manually?", a: "Yes. Everyone shares one inbox, and the agent pauses on any chat a human joins." },
      { q: "Does it support Persian?", a: "Fully, including Finglish, slang and typos. It answers in the language the customer writes in." },
    ],
  },
  final: {
    title: "Go to sleep.",
    sub: "Directino has the inbox.",
    cta: "Start free",
  },
  assistant: {
    title: "Directino assistant",
    status: "Online · replies instantly",
    hint: "Questions? Ask me.",
    open: "Chat with the assistant",
    close: "Close chat",
    send: "Send",
    placeholder: "Type your question…",
    greeting: "Hi! I'm the Directino assistant. Ask me anything about pricing, channels or how it works.",
    chips: ["How much does it cost?", "Which channels?", "How do I set it up?", "Talk to a human"],
    fallback: "I'm not sure about that one yet. Use the Contact link at the bottom of the page and the team will get back to you within an hour.",
    intents: [
      { keys: ["hi", "hello", "hey", "salam"], answer: "Hey! How can I help you today?" },
      { keys: ["price", "cost", "plan", "pricing", "how much", "expensive", "cheap"], answer: "Three plans: Starter $19, Growth $49 and Scale $129 per month. All of them start with 14 days free, no card needed." },
      { keys: ["channel", "instagram", "whatsapp", "telegram", "dm", "comment", "story"], answer: "Instagram (DMs, comments and story replies), WhatsApp and Telegram. Everything lands in one shared inbox." },
      { keys: ["setup", "set up", "start", "connect", "install", "how does", "how do"], answer: "Three steps: connect your accounts, upload your catalog or FAQ, and pick a mode (Draft, Approve or Autopilot). Most shops are live in under 10 minutes." },
      { keys: ["free", "trial", "test", "try"], answer: "You get 14 days completely free, and you don't need a card to start." },
      { keys: ["wrong", "mistake", "error", "accurate", "trust"], answer: "It only answers when it is confident. Anything else waits for you, and you can switch to Draft or Approve mode at any time." },
      { keys: ["catalog", "stock", "product", "inventory", "shopify", "woocommerce", "store"], answer: "Prices and stock come from your catalog. Connect your store or upload a sheet. The agent never makes up a price." },
      { keys: ["persian", "farsi", "finglish", "language", "english"], answer: "It replies in whatever language the customer writes in: Persian, Finglish or English, slang and typos included." },
      { keys: ["human", "person", "support", "contact", "talk", "agent", "team"], answer: "Sure. Use the Contact link at the bottom of the page and a real person from the team will reply within an hour." },
    ],
  },
  footer: {
    rights: "Directino. All rights reserved.",
    liveA: "While you read this page, Directino answered",
    liveB: "messages for its customers.",
    top: "Back to top",
    product: "Product",
    channels: "Channels",
    links: ["Privacy", "Terms", "Contact"],
  },
};

export type Dict = typeof en;

const fa: Dict = {
  meta: {
    title: "دایرکتینو | دایرکت‌هات خودشون جواب می‌دن",
    description: "ایجنت هوش مصنوعی که به همه‌ی دایرکت‌ها و کامنت‌های اینستاگرام، واتساپ و تلگرام با لحن برند شما جواب می‌ده.",
  },
  nav: {
    how: "چطور کار می‌کنه",
    features: "امکانات",
    pricing: "قیمت‌ها",
    faq: "سؤالات",
    cta: "شروع رایگان",
    switchLabel: "English",
    switchHref: "/en",
    live: "جواب داد به",
    liveAgo: "همین الان",
  },
  hero: {
    headlineA: "دایرکت‌هات",
    headlineB: "خودشون جواب می‌دن.",
    sub: "ایجنت هوش مصنوعی که به همه‌ی دایرکت‌ها و کامنت‌های اینستاگرام، واتساپ و تلگرام جواب می‌ده. با لحن خودت، تمام شب.",
    primary: "شروع رایگان",
    secondary: "ببین چطور کار می‌کنه",
    counterLabel: "جواب امشب",
    typing: "دایرکتینو در حال نوشتن",
    channelNames: { instagram: "اینستاگرام", whatsapp: "واتساپ", telegram: "تلگرام" },
    commentTag: "کامنت",
    messages: [
      { channel: "instagram", kind: "dm", from: "@mahsa.style", text: "قیمت این مانتو چنده؟", reply: "سلام مهسا جان! مانتو کتان سایز ۳۸ تا ۴۶ موجوده، قیمتش ۱٫۴۸۰٫۰۰۰ تومنه. لینک خرید رو برات فرستادم." },
      { channel: "telegram", kind: "dm", from: "رضا کاظمی", text: "ارسال به شیراز دارین؟", reply: "بله، ارسال به شیراز ۲ تا ۳ روز کاریه و برای خرید بالای ۲ میلیون رایگانه." },
      { channel: "instagram", kind: "comment", from: "@arash.km", text: "قیمت؟", reply: "قیمت رو دایرکت فرستادیم آرش جان." },
      { channel: "whatsapp", kind: "dm", from: "نیلوفر احمدی", text: "سفارشم کی می‌رسه؟ کد ۴۸۲۱۷", reply: "سفارش ۴۸۲۱۷ امروز صبح تحویل پست شد. کد رهگیری رو همین الان برات فرستادم." },
      { channel: "instagram", kind: "dm", from: "@sara.mvd", text: "chande in kif? meshkish hast?", reply: "سلام سارا! کیف چرم مشکی موجوده، ۲٫۳۵۰٫۰۰۰ تومن. می‌خوای یکی برات نگه دارم؟" },
      { channel: "telegram", kind: "dm", from: "پویان رستمی", text: "می‌شه سایزمو بعد از سفارش عوض کنم؟", reply: "حتماً، تا قبل از ارسال می‌شه. سفارشت رو به سایز ۴۲ تغییر دادم." },
    ],
  },
  manifesto:
    "هر دایرکتی که بی‌جواب می‌مونه، یه مشتریه که *از* *در* *بیرون* *می‌ره.* دایرکتینو توی چند ثانیه جواب می‌ده، ساعت ۳ صبح، توی همه‌ی کانال‌ها، با *لحن* *خودت.*",
  marquee: ["دایرکت اینستاگرام", "کامنت اینستاگرام", "واتساپ", "تلگرام", "ریپلای استوری", "تلگرام بیزنس"],
  night: {
    eyebrow: "وقتی خوابی",
    title: "یک شب، بدون حتی یک پیام بی‌جواب.",
    lead: "بیشتر فروش‌ها بعد از نیمه‌شب اتفاق می‌افته. دایرکتینو باهاشون این کارو می‌کنه.",
    panels: [
      { time: "۲۳:۴۰", title: "یه ریل وایرال می‌شه.", body: "۲۱۲ کامنت «قیمت؟». زیر هر کدوم یه جواب کوتاه و توی دایرکت قیمت کامل.", bubble: "قیمت رو دایرکت فرستادیم!" },
      { time: "۰۱:۱۲", title: "یه سفارش توی چت بسته می‌شه.", body: "سایز، رنگ، آدرس و لینک پرداخت، بدون اینکه کسی بیدار باشه.", bubble: "سفارش ثبت شد. ارسال پنجشنبه." },
      { time: "۰۳:۰۵", title: "یه مشتری عصبانی.", body: "اطمینان پایین و لحن منفی. چت متوقف می‌شه و برای تیمت علامت می‌خوره.", bubble: "ساعت ۰۳:۰۵ به اپراتور سپرده شد" },
      { time: "۰۵:۴۸", title: "اسپم‌ها پاک می‌شن.", body: "کامنت‌های ربات و لینک رقبا قبل از دیده شدن مخفی می‌شن.", bubble: "۳۷ کامنت اسپم مخفی شد" },
    ],
    dawnTime: "۰۷:۳۰",
    dawnTitle: "صبح با یه اینباکس تمیز بیدار می‌شی.",
    dawnBody: "همه‌ی گفتگوها جواب گرفتن، همه‌ی سفارش‌ها ثبت شدن و یه خلاصه منتظرته.",
  },
  comment: {
    title: "کامنت «قیمت؟» دیگه مشکل نیست.",
    body: "زیر هر سؤال قیمت یه جواب کوتاه عمومی، و جواب کامل توی دایرکت. کامنت‌ها تبدیل به گفتگو می‌شن و گفتگوها تبدیل به سفارش.",
    postCaption: "کالکشن جدید. ست کتان در سه رنگ.",
    run: "دوباره",
    publicReply: "قیمت رو دایرکت فرستادیم",
    dmSent: "دایرکت ارسال شد",
    comments: [
      { from: "@mina.lne", text: "قیمت؟" },
      { from: "@ali_hk", text: "آبیش چنده" },
      { from: "@sofi.rz", text: "gheymat lotfan" },
      { from: "@dena.v", text: "چه سایزهایی دارین؟" },
    ],
  },
  features: {
    title: "ادمینی که مغازه‌ت رو می‌شناسه.",
    voice: { title: "مثل خودت حرف می‌زنه", body: "لحنت رو از چت‌های قبلی یاد می‌گیره. رسمی، صمیمی یا کوتاه. انتخاب با خودته.", samples: ["سلام، قیمت ست ۱٫۴۸۰ تومنه.", "سلام عزیزم! ۱٫۴۸۰ تومنه، خیلی خوش‌دوخته.", "قیمت: ۱٫۴۸۰٫۰۰۰ تومان. لینک خرید پایین."] },
    catalog: { title: "قیمت از خودش نمی‌سازه", body: "قیمت و موجودی از کاتالوگ خودت میاد؛ از سایتت یا یه فایل اکسل ساده.", rows: [["ست کتان", "۱٫۴۸۰", "موجود"], ["شال ابریشم", "۵۹۰", "۶ عدد"], ["کت پشمی", "۴٫۲۰۰", "ناموجود"]] },
    handoff: { title: "می‌دونه کی کنار بکشه", body: "مطمئن نیست یا مشتری ناراحته؟ چت با همه‌ی جزئیات به تیمت می‌رسه." },
    spam: { title: "سپر اسپم", body: "کامنت ربات‌ها، کلاهبرداری و توهین قبل از دیده شدن مخفی می‌شه." },
    lang: { title: "فینگلیش هم بلده", body: "زبان محاوره، غلط تایپی و پیام‌های فینگلیش رو کامل می‌فهمه.", words: ["chande?", "چنده؟", "how much", "gheymat?"] },
  },
  modes: {
    title: "خودت تعیین کن چقدر تنهایی کار کنه.",
    tabs: [
      { key: "draft", label: "پیش‌نویس", body: "دایرکتینو جواب رو می‌نویسه. خودت می‌خونی و می‌فرستی." },
      { key: "approve", label: "تأیید", body: "جواب‌ها منتظر یه تپ تو می‌مونن. ده تا چت در ده ثانیه." },
      { key: "auto", label: "خودکار", body: "جواب‌های مطمئن فوری می‌رن. فقط موارد سخت به تو می‌رسن." },
    ],
    incoming: "سبزش هم دارین؟",
    reply: "سبز فعلاً نداریم، ولی زیتونی خیلی نزدیکشه و همه‌ی سایزها موجوده. عکسش رو بفرستم؟",
    actions: { draft: "کپی پیش‌نویس", approve: "تأیید و ارسال", auto: "خودکار ارسال شد" },
  },
  pricing: {
    eyebrow: "قیمت‌ها",
    title: "پول گفتگو رو بده، نه صندلی.",
    period: "/ ماهانه",
    popular: "انتخاب اکثر فروشگاه‌ها",
    cta: "شروع رایگان",
    note: "۱۴ روز رایگان. بدون نیاز به کارت.",
    plans: [
      { name: "پایه", price: "۴۹۰ هزار تومان", desc: "برای یک پیج فروشگاهی.", items: ["۱ پیج اینستاگرام", "۱٬۰۰۰ گفتگوی هوشمند", "کامنت به دایرکت", "کاتالوگ ۱۰۰ محصول"] },
      { name: "رشد", price: "۱٫۲۹ میلیون تومان", desc: "برای برندهایی که هر روز می‌فروشن.", items: ["۳ کانال", "۵٬۰۰۰ گفتگوی هوشمند", "اینباکس تحویل به اپراتور", "کاتالوگ نامحدود", "آموزش لحن برند"] },
      { name: "حرفه‌ای", price: "۳٫۴ میلیون تومان", desc: "برای آژانس‌ها و کاتالوگ‌های بزرگ.", items: ["۱۰ کانال", "۲۰٬۰۰۰ گفتگوی هوشمند", "چند کاربر با سطح دسترسی", "API و وب‌هوک"] },
    ],
  },
  faq: {
    title: "سؤالات",
    items: [
      { q: "حتماً اکانت بیزنس لازمه؟", a: "نه. دایرکتینو به اکانت‌های معمولی اینستاگرام، واتساپ و تلگرام وصل می‌شه و با اکانت بیزنس هم کار می‌کنه." },
      { q: "اگه هوش مصنوعی اشتباه جواب بده چی؟", a: "فقط وقتی مطمئنه جواب می‌ده. بقیه منتظر تو می‌مونن و هر وقت بخوای می‌تونی روی حالت پیش‌نویس یا تأیید بذاریش." },
      { q: "قیمت و موجودی از کجا میاد؟", a: "از کاتالوگ خودت. سایتت رو وصل کن یا یه فایل اکسل آپلود کن. ایجنت هیچ‌وقت قیمت از خودش نمی‌سازه." },
      { q: "تیمم هنوز می‌تونه دستی جواب بده؟", a: "بله. همه یه اینباکس مشترک دارن و هر چتی که یه آدم واردش بشه، ایجنت متوقف می‌شه." },
      { q: "انگلیسی هم جواب می‌ده؟", a: "بله. به همون زبانی جواب می‌ده که مشتری نوشته، فارسی، فینگلیش یا انگلیسی." },
    ],
  },
  final: {
    title: "برو بخواب.",
    sub: "اینباکس با دایرکتینو.",
    cta: "شروع رایگان",
  },
  assistant: {
    title: "دستیار دایرکتینو",
    status: "آنلاین · فوری جواب می‌ده",
    hint: "سؤالی داری؟ بپرس!",
    open: "گفتگو با دستیار",
    close: "بستن گفتگو",
    send: "ارسال",
    placeholder: "سؤالت رو بنویس…",
    greeting: "سلام! من دستیار دایرکتینو هستم. هر سؤالی درباره‌ی قیمت، کانال‌ها یا نحوه‌ی کار داری بپرس.",
    chips: ["قیمت پلن‌ها چنده؟", "با کدوم کانال‌ها کار می‌کنه؟", "چطور راه‌اندازیش کنم؟", "با یه آدم حرف بزنم"],
    fallback: "این یکی رو هنوز مطمئن نیستم. از لینک «تماس» پایین صفحه پیام بده، تیم ما زیر یک ساعت جواب می‌ده.",
    intents: [
      { keys: ["سلام", "درود", "هلو", "salam", "hi"], answer: "سلام! چطور می‌تونم کمکت کنم؟" },
      { keys: ["قیمت", "هزینه", "پلن", "تعرفه", "چنده", "چند", "گرون", "ارزون", "gheymat", "chande"], answer: "سه پلن داریم: پایه ۴۹۰ هزار، رشد ۱٫۲۹ میلیون و حرفه‌ای ۳٫۴ میلیون تومان در ماه. هر سه ۱۴ روز رایگان شروع می‌شن و کارت هم لازم نیست." },
      { keys: ["کانال", "اینستاگرام", "اینستا", "واتساپ", "تلگرام", "دایرکت", "کامنت", "استوری"], answer: "اینستاگرام (دایرکت، کامنت و ریپلای استوری)، واتساپ و تلگرام. همه توی یه اینباکس مشترک جمع می‌شن." },
      { keys: ["راه‌اندازی", "راه اندازی", "شروع", "نصب", "وصل", "چطور", "چجوری"], answer: "سه قدم: اکانت‌هات رو وصل کن، کاتالوگ یا سؤالات پرتکرارت رو آپلود کن، و حالت کار رو انتخاب کن (پیش‌نویس، تأیید یا خودکار). کمتر از ۱۰ دقیقه طول می‌کشه." },
      { keys: ["رایگان", "مجانی", "تست", "امتحان", "آزمایشی"], answer: "۱۴ روز کاملاً رایگان، بدون نیاز به کارت بانکی." },
      { keys: ["اشتباه", "غلط", "مطمئن", "اعتماد", "خطا"], answer: "فقط وقتی مطمئنه جواب می‌ده. بقیه منتظر تو می‌مونن و هر وقت بخوای می‌تونی روی حالت پیش‌نویس یا تأیید بذاریش." },
      { keys: ["کاتالوگ", "موجودی", "محصول", "سایت", "ووکامرس", "شاپیفای", "اکسل", "انبار"], answer: "قیمت و موجودی از کاتالوگ خودت میاد. سایتت رو وصل کن یا یه فایل اکسل آپلود کن. ایجنت هیچ‌وقت قیمت از خودش نمی‌سازه." },
      { keys: ["فارسی", "فینگلیش", "انگلیسی", "زبان", "لهجه"], answer: "به همون زبانی جواب می‌ده که مشتری نوشته: فارسی، فینگلیش یا انگلیسی، با زبان محاوره و غلط تایپی." },
      { keys: ["آدم", "اپراتور", "پشتیبانی", "تماس", "مشاوره", "حرف بزنم", "تیم"], answer: "حتماً. از لینک «تماس» پایین صفحه پیام بده، یکی از تیم ما زیر یک ساعت جوابت رو می‌ده." },
    ],
  },
  footer: {
    rights: "دایرکتینو. همه‌ی حقوق محفوظ است.",
    liveA: "از وقتی این صفحه رو باز کردی، دایرکتینو به",
    liveB: "پیام مشتری‌ها جواب داده.",
    top: "برگشت به بالا",
    product: "محصول",
    channels: "کانال‌ها",
    links: ["حریم خصوصی", "قوانین", "تماس"],
  },
};

const dictionaries = { en, fa } as const;

export type Locale = keyof typeof dictionaries;
export const locales: Locale[] = ["fa", "en"];

export const hasLocale = (value: string): value is Locale => value in dictionaries;

export const getDictionary = (locale: Locale): Dict => dictionaries[locale];
