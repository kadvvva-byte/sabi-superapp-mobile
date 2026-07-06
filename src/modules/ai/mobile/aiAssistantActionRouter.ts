import {
  getSabiAssistantCommandExamples,
  SABI_ASSISTANT_APP_FUNCTIONS,
  type SabiAssistantAppFunction,
} from "./aiAssistantAppFunctionCatalog";

export type SabiAssistantClientActionKind =
  | "navigate"
  | "web_search"
  | "open_url"
  | "blocked_sensitive"
  | "capabilities";

export type SabiAssistantClientAction = {
  kind: SabiAssistantClientActionKind;
  route?: string;
  url?: string;
  query?: string;
  title: string;
  assistantText: string;
  meta?: string;
};

type ResolveOptions = {
  language?: string | null;
};

const NAVIGATION_WORDS = [
  "открой",
  "открыть",
  "перейди",
  "перейти",
  "запусти",
  "запустить",
  "покажи",
  "найди в приложении",
  "где находится",
  "где найти",
  "как открыть",
  "open",
  "go to",
  "show",
  "find in app",
  "where is",
  "qayerda",
  "och",
  "ochib ber",
  "ko'rsat",
  "kursat",
];

const WEB_SEARCH_WORDS = [
  "найди в интернете",
  "поиск в интернете",
  "поищи в интернете",
  "загугли",
  "найди в google",
  "найди в yandex",
  "ищи в интернете",
  "интернетдан",
  "internetdan qidir",
  "internetda qidir",
  "google qidir",
  "search internet",
  "search web",
  "web search",
  "find online",
  "look up online",
];

const GENERAL_SEARCH_WORDS = ["найди", "поищи", "найти", "search", "find", "qidir", "izla"];

const OPEN_URL_WORDS = [
  "открой сайт",
  "перейди на сайт",
  "open site",
  "open website",
  "saytni och",
  "saytga o't",
  "saytga ot",
];

const CAPABILITY_WORDS = [
  "что ты умеешь",
  "что умеешь",
  "команды",
  "помощь",
  "как пользоваться",
  "что может sabi",
  "what can you do",
  "help",
  "commands",
  "nima qila olasan",
  "yordam",
];

const INTERNET_HINT_WORDS = [
  "кино",
  "фильм",
  "фильмы",
  "сериал",
  "новости",
  "погода",
  "медиа",
  "music",
  "movie",
  "movies",
  "news",
  "weather",
  "internet",
  "online",
  "kino",
  "serial",
  "yangilik",
];

const SENSITIVE_AUTORUN_WORDS = [
  "оплати",
  "заплати",
  "переведи деньги",
  "отправь деньги",
  "send money",
  "transfer money",
  "pay now",
  "удали аккаунт",
  "delete account",
  "отправь сообщение",
  "send message",
  "переведи coin",
  "send coin",
];

const STOP_WORDS = [
  "sabi",
  "саби",
  "hey",
  "эй",
  "пожалуйста",
  "please",
  "iltimos",
  ...NAVIGATION_WORDS,
  ...WEB_SEARCH_WORDS,
  ...OPEN_URL_WORDS,
];

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[“”«»]/g, '"')
    .replace(/[.,!?;:()[\]{}]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function hasAny(text: string, words: string[]): boolean {
  return words.some((word) => text.includes(normalizeText(word)));
}

function stripWakeWord(text: string): string {
  return text
    .replace(/^\s*(sabi|саби|саби ai|sabi ai)[,\s:;-]+/i, "")
    .replace(/^\s*(эй\s+саби|hey\s+sabi)[,\s:;-]+/i, "")
    .trim();
}

function extractUrl(text: string): string | null {
  const explicit = text.match(/https?:\/\/[^\s]+/i)?.[0];
  if (explicit) return explicit.replace(/[),.]+$/, "");

  const domain = text.match(/\b([a-z0-9-]+\.)+[a-z]{2,}(\/[^\s]*)?/i)?.[0];
  if (!domain) return null;
  return `https://${domain.replace(/[),.]+$/, "")}`;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function cleanSearchQuery(text: string): string {
  let cleaned = normalizeText(stripWakeWord(text));
  [...WEB_SEARCH_WORDS, ...OPEN_URL_WORDS, ...GENERAL_SEARCH_WORDS].forEach((word) => {
    cleaned = cleaned.replace(new RegExp(escapeRegExp(normalizeText(word)), "gi"), " ");
  });
  return cleaned.replace(/\s+/g, " ").trim();
}

function tokenize(text: string): string[] {
  const normalizedStops = new Set(STOP_WORDS.flatMap((word) => normalizeText(word).split(" ")));
  return normalizeText(text)
    .split(" ")
    .map((token) => token.trim())
    .filter((token) => token.length >= 2 && !normalizedStops.has(token));
}

function webSearchUrl(query: string): string {
  return `https://yandex.com/search/?text=${encodeURIComponent(query)}`;
}

function capabilitiesText(language: string | null | undefined): string {
  const lang = String(language ?? "ru").toLowerCase();
  if (lang.startsWith("uz")) {
    return "Men Sabi ichida yo‘l ko‘rsataman: QR skaner, Messenger, Wallet, Profile, AI tarjimon, kontaktlar, qo‘ng‘iroqlar, guruhlar, kanallar, Coin, Crypto, Marketplace, Taxi va boshqa bo‘limlarni topib ochaman. Internetdan ma’lumot qidiraman, saytlarni ochaman, suhbatni davom ettiraman. Xavfli ishlar — pul yuborish, xabar jo‘natish, accountni o‘chirish — faqat siz tasdiqlaganingizdan keyin. Men yordamchiman, sehrgar emasman, lekin sehrgarga yaqinlashamiz 😉";
  }
  if (lang.startsWith("en")) {
    return "I can guide you through Sabi: open QR scanner, Messenger, Wallet, Profile, AI translator, Contacts, Calls, Groups, Channels, Coin, Crypto, Marketplace, Taxi and more. I can search the web, open websites, and keep a conversation going. Sensitive actions — sending money, messages, or deleting an account — need your confirmation. I’m not magic yet, but I’m aiming dangerously close 😉";
  }
  return "Я могу быть проводником по Sabi: открыть QR сканер, Messenger, Wallet, Profile, AI переводчик, контакты, звонки, группы, каналы, Coin, Crypto, Marketplace, Taxi и другие разделы. Могу искать информацию в интернете, открывать сайты и поддерживать разговор. Оплату, отправку денег, сообщений и удаление аккаунта без подтверждения не делаю — тут я не рискую твоими нервами и деньгами 😉";
}

function assistantText(language: string | null | undefined, kind: SabiAssistantClientActionKind, title: string, value?: string): string {
  const lang = String(language ?? "ru").toLowerCase();

  if (kind === "capabilities") return capabilitiesText(language);

  if (kind === "blocked_sensitive") {
    if (lang.startsWith("uz")) return "Bu nozik amal. Men uni tasdiqsiz bajarmayman — xavfsiz bo‘lishi uchun kerakli oynani ochaman, qarorni siz tasdiqlaysiz.";
    if (lang.startsWith("en")) return "That’s a sensitive action. I won’t run it without confirmation — I’ll open the right screen and you stay in control.";
    return "Это уже серьёзное действие. Без подтверждения не выполняю — открою нужный экран, а решение останется за тобой.";
  }

  if (kind === "web_search") {
    if (lang.startsWith("uz")) return `Qidiryapman, hozir topamiz: ${value || title}`;
    if (lang.startsWith("en")) return `Searching the web — let’s find it: ${value || title}`;
    return `Ищу в интернете — сейчас вытащим нужное: ${value || title}`;
  }

  if (kind === "open_url") {
    if (lang.startsWith("uz")) return `Saytni ochyapman: ${value || title}`;
    if (lang.startsWith("en")) return `Opening the website: ${value || title}`;
    return `Открываю сайт: ${value || title}`;
  }

  if (lang.startsWith("uz")) return `Ochyapman: ${title}`;
  if (lang.startsWith("en")) return `Opening: ${title}`;
  return `Открываю: ${title}`;
}

function scoreFunctionMatch(message: string, appFunction: SabiAssistantAppFunction): number {
  const text = normalizeText(message);
  const messageTokens = tokenize(message);
  let score = 0;

  for (const keyword of appFunction.keywords) {
    const normalizedKeyword = normalizeText(keyword);
    if (!normalizedKeyword) continue;

    if (text === normalizedKeyword) score += 120;
    if (text.includes(normalizedKeyword)) score += Math.min(90, 30 + normalizedKeyword.length);

    const keywordTokens = normalizedKeyword.split(" ").filter(Boolean);
    const matchedTokens = keywordTokens.filter((token) => messageTokens.includes(token));
    score += matchedTokens.length * 14;
    if (matchedTokens.length === keywordTokens.length && keywordTokens.length > 1) score += 22;
  }

  if (appFunction.category === "qr" && /\bqr\b/.test(text)) score += 10;
  if (appFunction.category === "wallet" && /(wallet|кошелек|кошелёк|валет|hamyon|деньги|баланс)/.test(text)) score += 8;
  if (appFunction.category === "messenger" && /(chat|чат|messenger|мессенджер|сообщени|xabar)/.test(text)) score += 8;
  if (appFunction.category === "ai" && /(ai|ии|sabi|помощник|ассистент)/.test(text)) score += 8;
  if (appFunction.category === "profile" && /(profile|профиль|profil|account|аккаунт)/.test(text)) score += 8;

  return score;
}

function findBestAppFunction(message: string): SabiAssistantAppFunction | null {
  const scored = SABI_ASSISTANT_APP_FUNCTIONS
    .map((item) => ({ item, score: scoreFunctionMatch(message, item) }))
    .sort((left, right) => right.score - left.score);

  const best = scored[0];
  if (!best || best.score < 24) return null;
  return best.item;
}

function resolveSensitiveRoute(message: string): SabiAssistantAppFunction {
  const best = findBestAppFunction(message);
  if (best?.category === "wallet") return best;
  return SABI_ASSISTANT_APP_FUNCTIONS.find((item) => item.id === "wallet") ?? SABI_ASSISTANT_APP_FUNCTIONS[0];
}

export function resolveSabiAssistantClientAction(
  rawMessage: string,
  options: ResolveOptions = {},
): SabiAssistantClientAction | null {
  const original = stripWakeWord(rawMessage);
  const text = normalizeText(original);
  if (!text) return null;

  if (hasAny(text, CAPABILITY_WORDS)) {
    return {
      kind: "capabilities",
      title: "Sabi AI capabilities",
      assistantText: assistantText(options.language, "capabilities", "Sabi AI capabilities"),
      meta: "sabi_assistant_capabilities",
    };
  }

  const explicitUrl = extractUrl(original);
  if (explicitUrl && (hasAny(text, OPEN_URL_WORDS) || /https?:\/\//i.test(original))) {
    return {
      kind: "open_url",
      url: explicitUrl,
      title: explicitUrl.replace(/^https?:\/\//i, ""),
      assistantText: assistantText(options.language, "open_url", explicitUrl, explicitUrl.replace(/^https?:\/\//i, "")),
      meta: "external_browser",
    };
  }

  if (hasAny(text, SENSITIVE_AUTORUN_WORDS)) {
    const safeRoute = resolveSensitiveRoute(original);
    return {
      kind: "blocked_sensitive",
      route: safeRoute.route,
      title: safeRoute.title,
      assistantText: assistantText(options.language, "blocked_sensitive", safeRoute.title),
      meta: "sensitive_action_confirmation_required",
    };
  }

  const bestAppFunction = findBestAppFunction(original);
  const isNavigationRequest = hasAny(text, NAVIGATION_WORDS) || text.includes("где ") || text.includes("qayerda ") || text.startsWith("qr");

  if (bestAppFunction && isNavigationRequest) {
    return {
      kind: "navigate",
      route: bestAppFunction.route,
      title: bestAppFunction.title,
      assistantText: assistantText(options.language, "navigate", bestAppFunction.title),
      meta: `sabi_app_navigation:${bestAppFunction.id}`,
    };
  }

  if (hasAny(text, WEB_SEARCH_WORDS) || (hasAny(text, GENERAL_SEARCH_WORDS) && hasAny(text, INTERNET_HINT_WORDS))) {
    const query = cleanSearchQuery(original) || original;
    return {
      kind: "web_search",
      url: webSearchUrl(query),
      query,
      title: "Internet search",
      assistantText: assistantText(options.language, "web_search", "Internet search", query),
      meta: "external_search",
    };
  }

  return null;
}

export { getSabiAssistantCommandExamples };
