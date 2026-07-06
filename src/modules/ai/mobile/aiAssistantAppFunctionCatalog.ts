export type SabiAssistantFunctionCategory =
  | "core"
  | "qr"
  | "messenger"
  | "profile"
  | "wallet"
  | "ai"
  | "media"
  | "commerce"
  | "mobility"
  | "system";

export type SabiAssistantAppFunction = {
  id: string;
  route: string;
  title: string;
  category: SabiAssistantFunctionCategory;
  keywords: string[];
  description?: string;
  requiresConfirmation?: boolean;
};

export const SABI_ASSISTANT_APP_FUNCTIONS: SabiAssistantAppFunction[] = [
  {
    id: "home",
    route: "/tabs/index",
    title: "Home",
    category: "core",
    keywords: ["home", "главная", "домой", "главный экран", "asosiy", "bosh sahifa", "start"],
  },
  {
    id: "global_search",
    route: "/search",
    title: "Search",
    category: "core",
    keywords: ["поиск", "глобальный поиск", "найти в приложении", "search", "qidiruv", "qidir"],
  },
  {
    id: "notifications",
    route: "/notifications",
    title: "Notifications",
    category: "core",
    keywords: ["уведомления", "уведомление", "notifications", "alerts", "bildirishnoma", "xabarlar"],
  },
  {
    id: "language",
    route: "/language",
    title: "Language",
    category: "system",
    keywords: ["язык", "сменить язык", "language", "change language", "til", "tilni almashtir"],
  },
  {
    id: "qr_scanner",
    route: "/qr/scanner",
    title: "QR scanner",
    category: "qr",
    keywords: ["qr scanner", "qr scan", "сканер qr", "qr сканер", "сканировать qr", "скан qr", "секанер qr", "qr ni skaner", "qr skaner", "сканировать код", "считать qr"],
  },
  {
    id: "qr_center",
    route: "/qr",
    title: "QR Center",
    category: "qr",
    keywords: ["qr", "qr center", "qr центр", "qr markaz", "qr bo'lim", "qr раздел", "функции qr", "qr функции", "центр qr"],
  },
  {
    id: "qr_create",
    route: "/qr/create",
    title: "Create QR",
    category: "qr",
    keywords: ["создать qr", "сделать qr", "qr yarat", "make qr", "create qr", "qr создание", "генератор qr"],
  },
  {
    id: "qr_history",
    route: "/qr/history",
    title: "QR history",
    category: "qr",
    keywords: ["история qr", "qr history", "qr tarixi", "последние qr"],
  },
  {
    id: "messenger",
    route: "/tabs/chats",
    title: "Messenger",
    category: "messenger",
    keywords: ["messenger", "мессенджер", "сообщения", "чат", "чаты", "chats", "xabar", "xabarl", "chatlar", "переписка"],
  },
  {
    id: "contacts",
    route: "/tabs/contacts",
    title: "Contacts",
    category: "messenger",
    keywords: ["contacts", "контакты", "контакт", "kontakt", "kontaktlar", "список контактов", "люди"],
  },
  {
    id: "calls",
    route: "/tabs/calls",
    title: "Calls",
    category: "messenger",
    keywords: ["calls", "звонки", "вызовы", "qo'ng'iroq", "qongiroq", "video call", "audio call", "видеозвонок", "аудиозвонок"],
  },
  {
    id: "groups",
    route: "/tabs/groups",
    title: "Groups",
    category: "messenger",
    keywords: ["groups", "группы", "группа", "guruh", "guruhlar"],
  },
  {
    id: "channels",
    route: "/tabs/channels",
    title: "Channels",
    category: "messenger",
    keywords: ["channels", "каналы", "канал", "kanal", "kanallar"],
  },
  {
    id: "bots",
    route: "/tabs/bots",
    title: "Bots",
    category: "messenger",
    keywords: ["bots", "боты", "бот", "botlar", "bot"],
  },
  {
    id: "profile",
    route: "/profile",
    title: "Profile",
    category: "profile",
    keywords: ["мой профиль", "профиль", "profile", "profil", "аккаунт", "account"],
  },
  {
    id: "profile_edit",
    route: "/profile/edit",
    title: "Profile settings",
    category: "profile",
    keywords: ["настройки профиля", "изменить профиль", "редактировать профиль", "profile settings", "edit profile", "profil sozlam", "profilni tahrir", "данные профиля"],
  },
  {
    id: "public_profile",
    route: "/profile/public",
    title: "Public profile",
    category: "profile",
    keywords: ["публичный профиль", "public profile", "ochiq profil", "profil ommaviy", "как меня видят"],
  },
  {
    id: "profile_security",
    route: "/profile/security",
    title: "Profile security",
    category: "profile",
    keywords: ["безопасность профиля", "security", "защита аккаунта", "пароль", "devices", "устройства", "xavfsizlik"],
  },
  {
    id: "profile_privacy",
    route: "/profile/privacy",
    title: "Privacy",
    category: "profile",
    keywords: ["приватность", "privacy", "конфиденциальность", "махфийлик", "maxfiylik"],
  },
  {
    id: "profile_qr",
    route: "/profile/qr",
    title: "Profile QR",
    category: "profile",
    keywords: ["qr профиля", "profile qr", "мой qr", "profil qr", "личный qr"],
  },
  {
    id: "wallet",
    route: "/wallet",
    title: "Sabi Wallet",
    category: "wallet",
    keywords: ["wallet", "кошелек", "кошелёк", "валет", "hamyon", "sabi wallet", "деньги", "баланс"],
  },
  {
    id: "wallet_receive",
    route: "/wallet/receive",
    title: "Receive money",
    category: "wallet",
    keywords: ["получить деньги", "принять деньги", "receive money", "qabul qilish", "пополнить", "получить оплату"],
  },
  {
    id: "wallet_send",
    route: "/wallet/send",
    title: "Send money",
    category: "wallet",
    keywords: ["отправить деньги", "send money", "перевести деньги", "pul yuborish", "transfer"],
    requiresConfirmation: true,
  },
  {
    id: "wallet_history",
    route: "/wallet/history",
    title: "Wallet history",
    category: "wallet",
    keywords: ["история кошелька", "история платежей", "wallet history", "transaction history", "операции", "транзакции"],
  },
  {
    id: "wallet_cards",
    route: "/wallet/cards",
    title: "Cards",
    category: "wallet",
    keywords: ["карты", "мои карты", "cards", "bank card", "karta", "kartalar"],
  },
  {
    id: "coin_wallet",
    route: "/wallet/coin",
    title: "SABI COIN",
    category: "wallet",
    keywords: ["coin wallet", "sabi coin", "coin", "коин", "саби коин", "coin hamyon", "алмазы", "diamonds"],
  },
  {
    id: "crypto_wallet",
    route: "/wallet/crypto",
    title: "Crypto Wallet",
    category: "wallet",
    keywords: ["crypto", "крипто", "crypto wallet", "крипто кошелек", "kripto", "bitcoin", "btc", "ethereum", "eth"],
  },
  {
    id: "crypto_market",
    route: "/wallet/crypto/market",
    title: "Crypto market",
    category: "wallet",
    keywords: ["crypto market", "рынок крипто", "курс крипто", "market crypto", "цены крипто"],
  },
  {
    id: "ai_chat",
    route: "/ai/chat",
    title: "Sabi AI Chat",
    category: "ai",
    keywords: ["ai chat", "ии чат", "sabi ai", "sabi помощник", "ai yordamchi", "помощник", "ассистент", "чат ии"],
  },
  {
    id: "ai_translation",
    route: "/ai/translation",
    title: "AI Translation",
    category: "ai",
    keywords: ["переводчик", "перевод", "translation", "translate", "tarjima", "ai перевод", "переведи текст"],
  },
  {
    id: "ai_voice",
    route: "/ai/voice",
    title: "Voice AI",
    category: "ai",
    keywords: ["voice ai", "голосовой ии", "голосовой помощник", "ovozli ai", "voice assistant", "голос sabi"],
  },
  {
    id: "ai_voice_control",
    route: "/ai/voice-control",
    title: "Voice control",
    category: "ai",
    keywords: ["голосовое управление", "voice control", "команды голосом", "ovoz bilan boshqarish"],
  },
  {
    id: "ai_premium",
    route: "/ai/premium",
    title: "AI Premium",
    category: "ai",
    keywords: ["ai premium", "премиум ии", "premium ai", "ai obuna", "расширенный ии", "подписка ai"],
  },
  {
    id: "ai_history",
    route: "/ai/history",
    title: "AI history",
    category: "ai",
    keywords: ["история ии", "ai history", "история помощника", "ai tarixi"],
  },
  {
    id: "ai_tasks",
    route: "/ai/tasks",
    title: "AI tasks",
    category: "ai",
    keywords: ["задачи ии", "ai tasks", "tasks", "vazifalar", "напоминания ии"],
  },
  {
    id: "camera",
    route: "/camera",
    title: "Camera",
    category: "media",
    keywords: ["camera", "камера", "kamera", "открой камеру", "фото камера", "снять фото"],
  },
  {
    id: "gallery",
    route: "/gallery",
    title: "Gallery",
    category: "media",
    keywords: ["gallery", "галерея", "фото", "rasm", "media", "медиа", "изображения", "картинки"],
  },
  {
    id: "files",
    route: "/files",
    title: "Files",
    category: "media",
    keywords: ["files", "файлы", "documents", "документы", "hujjat", "файл"],
  },
  {
    id: "marketplace",
    route: "/marketplace",
    title: "Marketplace",
    category: "commerce",
    keywords: ["marketplace", "маркет", "магазин", "bozor", "market", "купить", "товары"],
  },
  {
    id: "business",
    route: "/business",
    title: "Business",
    category: "commerce",
    keywords: ["business", "бизнес", "biznes", "business account", "бизнес аккаунт"],
  },
  {
    id: "merchant",
    route: "/merchant",
    title: "Merchant",
    category: "commerce",
    keywords: ["merchant", "мерчант", "savdo", "продавец", "торговец", "merchant account"],
  },
  {
    id: "delivery",
    route: "/delivery",
    title: "Delivery",
    category: "commerce",
    keywords: ["delivery", "доставка", "yetkazib", "курьер", "заказ доставки"],
  },
  {
    id: "food_delivery",
    route: "/food-delivery",
    title: "Food delivery",
    category: "commerce",
    keywords: ["еда", "доставка еды", "food delivery", "ovqat", "овкат"],
  },
  {
    id: "supermarket",
    route: "/supermarket",
    title: "Supermarket",
    category: "commerce",
    keywords: ["supermarket", "супермаркет", "продукты", "oziq ovqat", "магазин продуктов"],
  },
  {
    id: "wholesale_market",
    route: "/wholesale-market",
    title: "Wholesale market",
    category: "commerce",
    keywords: ["оптовый рынок", "wholesale", "ulgurji", "опт"],
  },
  {
    id: "taxi",
    route: "/taxi",
    title: "Taxi",
    category: "mobility",
    keywords: ["taxi", "такси", "машина", "поездка", "ride", "yo'l", "yol"],
  },
  {
    id: "stream",
    route: "/stream",
    title: "Stream",
    category: "media",
    keywords: ["stream", "стрим", "efir", "live", "прямой эфир"],
  },
  {
    id: "games",
    route: "/games",
    title: "Games",
    category: "media",
    keywords: ["games", "игры", "game center", "o'yin", "oyin", "игровой центр"],
  },
  {
    id: "mini_apps",
    route: "/mini-apps",
    title: "Mini apps",
    category: "core",
    keywords: ["mini apps", "мини приложения", "mini ilova", "мини апп"],
  },
  {
    id: "events",
    route: "/events",
    title: "Events",
    category: "core",
    keywords: ["events", "события", "мероприятия", "tadbir"],
  },
  {
    id: "hotels",
    route: "/hotels",
    title: "Hotels",
    category: "commerce",
    keywords: ["hotels", "отели", "гостиница", "mehmonxona"],
  },
];

export function getSabiAssistantCommandExamples(language?: string | null): string[] {
  const lang = String(language ?? "ru").toLowerCase();
  if (lang.startsWith("uz")) {
    return [
      "Sabi, QR skanerni och",
      "Sabi, Messenger ni och",
      "Sabi, hamyonni och",
      "Sabi, AI tarjimonni och",
      "Sabi, internetda 2026 eng yaxshi filmlarni qidir",
      "Sabi, google.com saytini och",
      "Sabi, nimalarni qila olasan?",
    ];
  }
  if (lang.startsWith("en")) {
    return [
      "Sabi, open QR scanner",
      "Sabi, open Messenger",
      "Sabi, open Wallet",
      "Sabi, open AI translator",
      "Sabi, search online for the best movies 2026",
      "Sabi, open google.com",
      "Sabi, what can you do?",
    ];
  }
  return [
    "Sabi, открой QR сканер",
    "Sabi, открой мессенджер",
    "Sabi, открой кошелёк",
    "Sabi, открой AI переводчик",
    "Sabi, найди в интернете лучшие фильмы 2026",
    "Sabi, открой сайт google.com",
    "Sabi, что ты умеешь?",
  ];
}
