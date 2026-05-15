import type { TranslationLanguage } from "../../../shared/i18n";

export type AiTranslationLanguageCode = string;

export type AiTranslationLanguageItem = {
  code: AiTranslationLanguageCode;
  nativeName: string;
  englishName: string;
  flag: string;
  searchText: string;
  rtl?: boolean;
};

const AUTO_LANGUAGE: AiTranslationLanguageItem = {
  code: "auto",
  nativeName: "Auto",
  englishName: "Detect language",
  flag: "AI",
  searchText:
    "auto detect automatic avtomatik авто определить tilni aniqlash detect language",
};

const PROVIDER_TRANSLATION_LANGUAGES: AiTranslationLanguageItem[] = [
  { code: "af", nativeName: "Afrikaans", englishName: "Afrikaans", flag: "AF", searchText: "afrikaans af" },
  { code: "sq", nativeName: "Shqip", englishName: "Albanian", flag: "SQ", searchText: "albanian shqip sq" },
  { code: "am", nativeName: "አማርኛ", englishName: "Amharic", flag: "AM", searchText: "amharic am አማርኛ" },
  { code: "ar", nativeName: "العربية", englishName: "Arabic", flag: "AR", searchText: "arabic ar العربية арабский arabcha", rtl: true },
  { code: "hy", nativeName: "Հայերեն", englishName: "Armenian", flag: "HY", searchText: "armenian hy հայերեն армянский armancha" },
  { code: "az", nativeName: "Azərbaycan", englishName: "Azerbaijani", flag: "AZ", searchText: "azerbaijani az ozarbayjoncha азербайджанский" },
  { code: "eu", nativeName: "Euskara", englishName: "Basque", flag: "EU", searchText: "basque eu euskara" },
  { code: "be", nativeName: "Беларуская", englishName: "Belarusian", flag: "BE", searchText: "belarusian be беларуская белорусский belaruscha" },
  { code: "bn", nativeName: "বাংলা", englishName: "Bengali", flag: "BN", searchText: "bengali bangla bn বাংলা" },
  { code: "bs", nativeName: "Bosanski", englishName: "Bosnian", flag: "BS", searchText: "bosnian bs bosanski" },
  { code: "bg", nativeName: "Български", englishName: "Bulgarian", flag: "BG", searchText: "bulgarian bg български" },
  { code: "ca", nativeName: "Català", englishName: "Catalan", flag: "CA", searchText: "catalan ca català" },
  { code: "ceb", nativeName: "Cebuano", englishName: "Cebuano", flag: "CEB", searchText: "cebuano ceb" },
  { code: "zh", nativeName: "中文", englishName: "Chinese", flag: "ZH", searchText: "chinese zh 中文 китайский xitoycha" },
  { code: "zh-CN", nativeName: "简体中文", englishName: "Chinese Simplified", flag: "ZH", searchText: "chinese simplified zh-cn 简体中文" },
  { code: "zh-TW", nativeName: "繁體中文", englishName: "Chinese Traditional", flag: "ZH", searchText: "chinese traditional zh-tw 繁體中文" },
  { code: "hr", nativeName: "Hrvatski", englishName: "Croatian", flag: "HR", searchText: "croatian hr hrvatski" },
  { code: "cs", nativeName: "Čeština", englishName: "Czech", flag: "CS", searchText: "czech cs čeština" },
  { code: "da", nativeName: "Dansk", englishName: "Danish", flag: "DA", searchText: "danish da dansk" },
  { code: "nl", nativeName: "Nederlands", englishName: "Dutch", flag: "NL", searchText: "dutch nl nederlands" },
  { code: "en", nativeName: "English", englishName: "English", flag: "EN", searchText: "english en английский inglizcha" },
  { code: "eo", nativeName: "Esperanto", englishName: "Esperanto", flag: "EO", searchText: "esperanto eo" },
  { code: "et", nativeName: "Eesti", englishName: "Estonian", flag: "ET", searchText: "estonian et eesti" },
  { code: "fi", nativeName: "Suomi", englishName: "Finnish", flag: "FI", searchText: "finnish fi suomi" },
  { code: "fr", nativeName: "Français", englishName: "French", flag: "FR", searchText: "french fr français французский fransuzcha" },
  { code: "gl", nativeName: "Galego", englishName: "Galician", flag: "GL", searchText: "galician gl galego" },
  { code: "ka", nativeName: "ქართული", englishName: "Georgian", flag: "KA", searchText: "georgian ka ქართული" },
  { code: "de", nativeName: "Deutsch", englishName: "German", flag: "DE", searchText: "german de deutsch немецкий nemischa" },
  { code: "el", nativeName: "Ελληνικά", englishName: "Greek", flag: "EL", searchText: "greek el ελληνικά" },
  { code: "gu", nativeName: "ગુજરાતી", englishName: "Gujarati", flag: "GU", searchText: "gujarati gu ગુજરાતી" },
  { code: "ht", nativeName: "Kreyòl ayisyen", englishName: "Haitian Creole", flag: "HT", searchText: "haitian creole ht kreyol" },
  { code: "ha", nativeName: "Hausa", englishName: "Hausa", flag: "HA", searchText: "hausa ha" },
  { code: "he", nativeName: "עברית", englishName: "Hebrew", flag: "HE", searchText: "hebrew he עברית", rtl: true },
  { code: "hi", nativeName: "हिन्दी", englishName: "Hindi", flag: "HI", searchText: "hindi hi हिन्दी хинди hindcha" },
  { code: "hu", nativeName: "Magyar", englishName: "Hungarian", flag: "HU", searchText: "hungarian hu magyar" },
  { code: "is", nativeName: "Íslenska", englishName: "Icelandic", flag: "IS", searchText: "icelandic is íslenska" },
  { code: "ig", nativeName: "Igbo", englishName: "Igbo", flag: "IG", searchText: "igbo ig" },
  { code: "id", nativeName: "Indonesia", englishName: "Indonesian", flag: "ID", searchText: "indonesian id indonesia" },
  { code: "ga", nativeName: "Gaeilge", englishName: "Irish", flag: "GA", searchText: "irish ga gaeilge" },
  { code: "it", nativeName: "Italiano", englishName: "Italian", flag: "IT", searchText: "italian it italiano итальянский italyancha" },
  { code: "ja", nativeName: "日本語", englishName: "Japanese", flag: "JA", searchText: "japanese ja 日本語 японский yaponcha" },
  { code: "jv", nativeName: "Jawa", englishName: "Javanese", flag: "JV", searchText: "javanese jv jawa" },
  { code: "kn", nativeName: "ಕನ್ನಡ", englishName: "Kannada", flag: "KN", searchText: "kannada kn ಕನ್ನಡ" },
  { code: "kk", nativeName: "Қазақша", englishName: "Kazakh", flag: "KK", searchText: "kazakh kk қазақша казахский qozoqcha" },
  { code: "km", nativeName: "ខ្មែរ", englishName: "Khmer", flag: "KM", searchText: "khmer km ខ្មែរ" },
  { code: "ko", nativeName: "한국어", englishName: "Korean", flag: "KO", searchText: "korean ko 한국어 корейский koreyscha" },
  { code: "ku", nativeName: "Kurdî", englishName: "Kurdish", flag: "KU", searchText: "kurdish ku kurdi" },
  { code: "ky", nativeName: "Кыргызча", englishName: "Kyrgyz", flag: "KY", searchText: "kyrgyz ky кыргызча qirgizcha" },
  { code: "lo", nativeName: "ລາວ", englishName: "Lao", flag: "LO", searchText: "lao lo ລາວ" },
  { code: "la", nativeName: "Latina", englishName: "Latin", flag: "LA", searchText: "latin la latina" },
  { code: "lv", nativeName: "Latviešu", englishName: "Latvian", flag: "LV", searchText: "latvian lv latviešu" },
  { code: "lt", nativeName: "Lietuvių", englishName: "Lithuanian", flag: "LT", searchText: "lithuanian lt lietuvių" },
  { code: "lb", nativeName: "Lëtzebuergesch", englishName: "Luxembourgish", flag: "LB", searchText: "luxembourgish lb" },
  { code: "mk", nativeName: "Македонски", englishName: "Macedonian", flag: "MK", searchText: "macedonian mk македонски" },
  { code: "mg", nativeName: "Malagasy", englishName: "Malagasy", flag: "MG", searchText: "malagasy mg" },
  { code: "ms", nativeName: "Melayu", englishName: "Malay", flag: "MS", searchText: "malay ms melayu" },
  { code: "ml", nativeName: "മലയാളം", englishName: "Malayalam", flag: "ML", searchText: "malayalam ml മലയാളം" },
  { code: "mt", nativeName: "Malti", englishName: "Maltese", flag: "MT", searchText: "maltese mt malti" },
  { code: "mi", nativeName: "Māori", englishName: "Maori", flag: "MI", searchText: "maori mi māori" },
  { code: "mr", nativeName: "मराठी", englishName: "Marathi", flag: "MR", searchText: "marathi mr मराठी" },
  { code: "mn", nativeName: "Монгол", englishName: "Mongolian", flag: "MN", searchText: "mongolian mn монгол" },
  { code: "my", nativeName: "မြန်မာ", englishName: "Myanmar", flag: "MY", searchText: "myanmar burmese my မြန်မာ" },
  { code: "ne", nativeName: "नेपाली", englishName: "Nepali", flag: "NE", searchText: "nepali ne नेपाली" },
  { code: "no", nativeName: "Norsk", englishName: "Norwegian", flag: "NO", searchText: "norwegian no norsk" },
  { code: "ny", nativeName: "Chichewa", englishName: "Chichewa", flag: "NY", searchText: "chichewa ny" },
  { code: "or", nativeName: "ଓଡ଼ିଆ", englishName: "Odia", flag: "OR", searchText: "odia or ଓଡ଼ିଆ" },
  { code: "ps", nativeName: "پښتو", englishName: "Pashto", flag: "PS", searchText: "pashto ps پښتو пушту pushtu", rtl: true },
  { code: "fa", nativeName: "فارسی", englishName: "Persian", flag: "FA", searchText: "persian fa farsi فارسی персидский forscha", rtl: true },
  { code: "fa-AF", nativeName: "دری", englishName: "Dari", flag: "FA", searchText: "dari fa-af dariy дари", rtl: true },
  { code: "pl", nativeName: "Polski", englishName: "Polish", flag: "PL", searchText: "polish pl polski" },
  { code: "pt", nativeName: "Português", englishName: "Portuguese", flag: "PT", searchText: "portuguese pt português" },
  { code: "pa", nativeName: "ਪੰਜਾਬੀ", englishName: "Punjabi", flag: "PA", searchText: "punjabi pa ਪੰਜਾਬੀ" },
  { code: "ro", nativeName: "Română", englishName: "Romanian", flag: "RO", searchText: "romanian ro română" },
  { code: "ru", nativeName: "Русский", englishName: "Russian", flag: "RU", searchText: "russian ru русский ruscha" },
  { code: "sm", nativeName: "Samoan", englishName: "Samoan", flag: "SM", searchText: "samoan sm" },
  { code: "gd", nativeName: "Gàidhlig", englishName: "Scots Gaelic", flag: "GD", searchText: "scots gaelic gd gàidhlig" },
  { code: "sr", nativeName: "Српски", englishName: "Serbian", flag: "SR", searchText: "serbian sr српски" },
  { code: "st", nativeName: "Sesotho", englishName: "Sesotho", flag: "ST", searchText: "sesotho st" },
  { code: "sn", nativeName: "Shona", englishName: "Shona", flag: "SN", searchText: "shona sn" },
  { code: "sd", nativeName: "سنڌي", englishName: "Sindhi", flag: "SD", searchText: "sindhi sd سنڌي", rtl: true },
  { code: "si", nativeName: "සිංහල", englishName: "Sinhala", flag: "SI", searchText: "sinhala si සිංහල" },
  { code: "sk", nativeName: "Slovenčina", englishName: "Slovak", flag: "SK", searchText: "slovak sk slovenčina" },
  { code: "sl", nativeName: "Slovenščina", englishName: "Slovenian", flag: "SL", searchText: "slovenian sl slovenščina" },
  { code: "so", nativeName: "Soomaali", englishName: "Somali", flag: "SO", searchText: "somali so soomaali" },
  { code: "es", nativeName: "Español", englishName: "Spanish", flag: "ES", searchText: "spanish es español испанский ispancha" },
  { code: "su", nativeName: "Sunda", englishName: "Sundanese", flag: "SU", searchText: "sundanese su sunda" },
  { code: "sw", nativeName: "Kiswahili", englishName: "Swahili", flag: "SW", searchText: "swahili sw kiswahili" },
  { code: "sv", nativeName: "Svenska", englishName: "Swedish", flag: "SV", searchText: "swedish sv svenska" },
  { code: "tg", nativeName: "Тоҷикӣ", englishName: "Tajik", flag: "TG", searchText: "tajik tg тоҷикӣ tojikcha" },
  { code: "ta", nativeName: "தமிழ்", englishName: "Tamil", flag: "TA", searchText: "tamil ta தமிழ்" },
  { code: "tt", nativeName: "Татарча", englishName: "Tatar", flag: "TT", searchText: "tatar tt татарча" },
  { code: "te", nativeName: "తెలుగు", englishName: "Telugu", flag: "TE", searchText: "telugu te తెలుగు" },
  { code: "th", nativeName: "ไทย", englishName: "Thai", flag: "TH", searchText: "thai th ไทย taycha" },
  { code: "tr", nativeName: "Türkçe", englishName: "Turkish", flag: "TR", searchText: "turkish tr türkçe turkcha" },
  { code: "tk", nativeName: "Türkmençe", englishName: "Turkmen", flag: "TK", searchText: "turkmen tk türkmençe turkmancha" },
  { code: "uk", nativeName: "Українська", englishName: "Ukrainian", flag: "UK", searchText: "ukrainian uk українська ukraincha" },
  { code: "ur", nativeName: "اردو", englishName: "Urdu", flag: "UR", searchText: "urdu ur اردو", rtl: true },
  { code: "ug", nativeName: "ئۇيغۇرچە", englishName: "Uyghur", flag: "UG", searchText: "uyghur ug ئۇيغۇرچە", rtl: true },
  { code: "uz", nativeName: "O‘zbekcha", englishName: "Uzbek", flag: "UZ", searchText: "uzbek uz o‘zbekcha узбекский" },
  { code: "vi", nativeName: "Tiếng Việt", englishName: "Vietnamese", flag: "VI", searchText: "vietnamese vi tiếng việt" },
  { code: "cy", nativeName: "Cymraeg", englishName: "Welsh", flag: "CY", searchText: "welsh cy cymraeg" },
  { code: "xh", nativeName: "isiXhosa", englishName: "Xhosa", flag: "XH", searchText: "xhosa xh isixhosa" },
  { code: "yi", nativeName: "יידיש", englishName: "Yiddish", flag: "YI", searchText: "yiddish yi יידיש", rtl: true },
  { code: "yo", nativeName: "Yorùbá", englishName: "Yoruba", flag: "YO", searchText: "yoruba yo yorùbá" },
  { code: "zu", nativeName: "Zulu", englishName: "Zulu", flag: "ZU", searchText: "zulu zu" },
];

const LOCALIZED_NAMES: Partial<
  Record<TranslationLanguage | string, Partial<Record<string, string>>>
> = {
  en: {
    auto: "Detect language",
  },
  ru: {
    auto: "Определить язык",
  },
  uz: {
    auto: "Tilni aniqlash",
  },
};

function normalizeLocale(appLanguage: TranslationLanguage | string | null | undefined): string {
  const value = String(appLanguage || "uz").toLowerCase();
  if (value.startsWith("ru")) return "ru";
  if (value.startsWith("en")) return "en";
  return "uz";
}

function uniqueByCode(items: AiTranslationLanguageItem[]): AiTranslationLanguageItem[] {
  const map = new Map<string, AiTranslationLanguageItem>();

  for (const item of items) {
    map.set(item.code, item);
  }

  return Array.from(map.values());
}

export const AI_TRANSLATION_LANGUAGES: AiTranslationLanguageItem[] = uniqueByCode([
  AUTO_LANGUAGE,
  ...PROVIDER_TRANSLATION_LANGUAGES,
]);

export const AI_TRANSLATION_TARGET_LANGUAGES: AiTranslationLanguageItem[] =
  AI_TRANSLATION_LANGUAGES.filter((item) => item.code !== "auto");

export function isAiTranslationLanguageCode(code: string): code is AiTranslationLanguageCode {
  return AI_TRANSLATION_LANGUAGES.some((item) => item.code === code);
}

export function getTranslationLanguageItem(
  code: AiTranslationLanguageCode | string | null | undefined,
): AiTranslationLanguageItem | null {
  const normalized = String(code || "auto");
  return AI_TRANSLATION_LANGUAGES.find((item) => item.code === normalized) ?? null;
}

export function getTranslationLanguageLabel(
  code: AiTranslationLanguageCode | string | null | undefined,
  appLanguage: TranslationLanguage | string | null | undefined,
): string {
  const normalized = String(code || "auto");
  const locale = normalizeLocale(appLanguage);
  const localized = LOCALIZED_NAMES[locale]?.[normalized];

  if (localized) return localized;

  const found = getTranslationLanguageItem(normalized);

  if (found?.nativeName) return found.nativeName;

  return normalized;
}

export function getTranslationLanguageNativeLabel(
  code: AiTranslationLanguageCode | string | null | undefined,
  appLanguage?: TranslationLanguage | string | null | undefined,
): string {
  return getTranslationLanguageLabel(code, appLanguage);
}

export function getTranslationLanguageSearchText(
  item: AiTranslationLanguageItem,
  appLanguage: TranslationLanguage | string | null | undefined,
): string {
  return [
    item.code,
    item.nativeName,
    item.englishName,
    getTranslationLanguageLabel(item.code, appLanguage),
    item.searchText,
  ]
    .join(" ")
    .toLowerCase();
}