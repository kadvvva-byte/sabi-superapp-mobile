export type SupportedLanguageCode =
  | "en" |
  "ru" |
  "zh" |
  "ko" |
  "ja" |
  "uz" |
  "tg" |
  "ky" |
  "kk" |
  "fa-AF" |
  "ps" |
  "tk" |
  "az" |
  "tr" |
  "hi" |
  "ur" |
  "ar" |
  "be" |
  "uk" |
  "de" |
  "th" |
  "sw" |
  "am" |
  "af" |
  "hy";

export type LanguageItem = {
  code: SupportedLanguageCode;
  englishName: string;
  nativeName: string;
  name: string;
  label: string;
  searchText: string;
  region: string;
  countryCode: string;
  flag: string;
  rtl?: boolean;
  enabled: true;
};

export const LANGUAGES: LanguageItem[] = [
  {
    code: "en",
    englishName: "English",
    nativeName: "English",
    name: "English",
    label: "English",
    searchText: "en english english global us",
    region: "Global",
    countryCode: "US",
    flag: "🇺🇸",
    enabled: true,
  },
  {
    code: "ru",
    englishName: "Russian",
    nativeName: "Русский",
    name: "Russian",
    label: "Русский — Russian",
    searchText: "ru russian русский eastern europe / central asia ru",
    region: "Eastern Europe / Central Asia",
    countryCode: "RU",
    flag: "🇷🇺",
    enabled: true,
  },
  {
    code: "zh",
    englishName: "Chinese",
    nativeName: "中文",
    name: "Chinese",
    label: "中文 — Chinese",
    searchText: "zh chinese 中文 china cn",
    region: "China",
    countryCode: "CN",
    flag: "🇨🇳",
    enabled: true,
  },
  {
    code: "ko",
    englishName: "Korean",
    nativeName: "한국어",
    name: "Korean",
    label: "한국어 — Korean",
    searchText: "ko korean 한국어 south korea kr",
    region: "South Korea",
    countryCode: "KR",
    flag: "🇰🇷",
    enabled: true,
  },
  {
    code: "ja",
    englishName: "Japanese",
    nativeName: "日本語",
    name: "Japanese",
    label: "日本語 — Japanese",
    searchText: "ja japanese 日本語 japan jp",
    region: "Japan",
    countryCode: "JP",
    flag: "🇯🇵",
    enabled: true,
  },
  {
    code: "uz",
    englishName: "Uzbek",
    nativeName: "Oʻzbekcha",
    name: "Uzbek",
    label: "Oʻzbekcha — Uzbek",
    searchText: "uz uzbek oʻzbekcha uzbekistan uz",
    region: "Uzbekistan",
    countryCode: "UZ",
    flag: "🇺🇿",
    enabled: true,
  },
  {
    code: "tg",
    englishName: "Tajik",
    nativeName: "Тоҷикӣ",
    name: "Tajik",
    label: "Тоҷикӣ — Tajik",
    searchText: "tg tajik тоҷикӣ tajikistan tj",
    region: "Tajikistan",
    countryCode: "TJ",
    flag: "🇹🇯",
    enabled: true,
  },
  {
    code: "ky",
    englishName: "Kyrgyz",
    nativeName: "Кыргызча",
    name: "Kyrgyz",
    label: "Кыргызча — Kyrgyz",
    searchText: "ky kyrgyz кыргызча kyrgyzstan kg",
    region: "Kyrgyzstan",
    countryCode: "KG",
    flag: "🇰🇬",
    enabled: true,
  },
  {
    code: "kk",
    englishName: "Kazakh",
    nativeName: "Қазақша",
    name: "Kazakh",
    label: "Қазақша — Kazakh",
    searchText: "kk kazakh қазақша kazakhstan kz",
    region: "Kazakhstan",
    countryCode: "KZ",
    flag: "🇰🇿",
    enabled: true,
  },
  {
    code: "fa-AF",
    englishName: "Dari",
    nativeName: "دری",
    name: "Dari",
    label: "دری — Dari",
    searchText: "fa-AF dari دری afghanistan af",
    region: "Afghanistan",
    countryCode: "AF",
    flag: "🇦🇫",
    enabled: true,
    rtl: true,
  },
  {
    code: "ps",
    englishName: "Pashto",
    nativeName: "پښتو",
    name: "Pashto",
    label: "پښتو — Pashto",
    searchText: "ps pashto پښتو afghanistan af",
    region: "Afghanistan",
    countryCode: "AF",
    flag: "🇦🇫",
    enabled: true,
    rtl: true,
  },
  {
    code: "tk",
    englishName: "Turkmen",
    nativeName: "Türkmençe",
    name: "Turkmen",
    label: "Türkmençe — Turkmen",
    searchText: "tk turkmen türkmençe turkmenistan tm",
    region: "Turkmenistan",
    countryCode: "TM",
    flag: "🇹🇲",
    enabled: true,
  },
  {
    code: "az",
    englishName: "Azerbaijani",
    nativeName: "Azərbaycanca",
    name: "Azerbaijani",
    label: "Azərbaycanca — Azerbaijani",
    searchText: "az azerbaijani azərbaycanca azerbaijan az",
    region: "Azerbaijan",
    countryCode: "AZ",
    flag: "🇦🇿",
    enabled: true,
  },
  {
    code: "tr",
    englishName: "Turkish",
    nativeName: "Türkçe",
    name: "Turkish",
    label: "Türkçe — Turkish",
    searchText: "tr turkish türkçe türkiye tr",
    region: "Türkiye",
    countryCode: "TR",
    flag: "🇹🇷",
    enabled: true,
  },
  {
    code: "hi",
    englishName: "Hindi",
    nativeName: "हिन्दी",
    name: "Hindi",
    label: "हिन्दी — Hindi",
    searchText: "hi hindi हिन्दी india in",
    region: "India",
    countryCode: "IN",
    flag: "🇮🇳",
    enabled: true,
  },
  {
    code: "ur",
    englishName: "Urdu",
    nativeName: "اردو",
    name: "Urdu",
    label: "اردو — Urdu",
    searchText: "ur urdu اردو pakistan pk",
    region: "Pakistan",
    countryCode: "PK",
    flag: "🇵🇰",
    enabled: true,
    rtl: true,
  },
  {
    code: "ar",
    englishName: "Arabic",
    nativeName: "العربية",
    name: "Arabic",
    label: "العربية — Arabic",
    searchText: "ar arabic العربية middle east / north africa sa",
    region: "Middle East / North Africa",
    countryCode: "SA",
    flag: "🇸🇦",
    enabled: true,
    rtl: true,
  },
  {
    code: "be",
    englishName: "Belarusian",
    nativeName: "Беларуская",
    name: "Belarusian",
    label: "Беларуская — Belarusian",
    searchText: "be belarusian беларуская belarus by",
    region: "Belarus",
    countryCode: "BY",
    flag: "🇧🇾",
    enabled: true,
  },
  {
    code: "uk",
    englishName: "Ukrainian",
    nativeName: "Українська",
    name: "Ukrainian",
    label: "Українська — Ukrainian",
    searchText: "uk ukrainian українська ukraine ua",
    region: "Ukraine",
    countryCode: "UA",
    flag: "🇺🇦",
    enabled: true,
  },
  {
    code: "de",
    englishName: "German",
    nativeName: "Deutsch",
    name: "German",
    label: "Deutsch — German",
    searchText: "de german deutsch germany de",
    region: "Germany",
    countryCode: "DE",
    flag: "🇩🇪",
    enabled: true,
  },
  {
    code: "th",
    englishName: "Thai",
    nativeName: "ไทย",
    name: "Thai",
    label: "ไทย — Thai",
    searchText: "th thai ไทย thailand th",
    region: "Thailand",
    countryCode: "TH",
    flag: "🇹🇭",
    enabled: true,
  },
  {
    code: "sw",
    englishName: "Swahili",
    nativeName: "Kiswahili",
    name: "Swahili",
    label: "Kiswahili — Swahili",
    searchText: "sw swahili kiswahili east africa ke",
    region: "East Africa",
    countryCode: "KE",
    flag: "🇰🇪",
    enabled: true,
  },
  {
    code: "am",
    englishName: "Amharic",
    nativeName: "አማርኛ",
    name: "Amharic",
    label: "አማርኛ — Amharic",
    searchText: "am amharic አማርኛ ethiopia et",
    region: "Ethiopia",
    countryCode: "ET",
    flag: "🇪🇹",
    enabled: true,
  },
  {
    code: "af",
    englishName: "Afrikaans",
    nativeName: "Afrikaans",
    name: "Afrikaans",
    label: "Afrikaans",
    searchText: "af afrikaans afrikaans south africa za",
    region: "South Africa",
    countryCode: "ZA",
    flag: "🇿🇦",
    enabled: true,
  },
  {
    code: "hy",
    englishName: "Armenian",
    nativeName: "Հայերեն",
    name: "Armenian",
    label: "Հայերեն — Armenian",
    searchText: "hy armenian հայերեն armenia am",
    region: "Armenia",
    countryCode: "AM",
    flag: "🇦🇲",
    enabled: true,
  }
];

export const SUPPORTED_LANGUAGE_CODES: SupportedLanguageCode[] = LANGUAGES.map(
  (item) => item.code
);

export const RTL_LANGUAGE_CODES: SupportedLanguageCode[] = LANGUAGES.filter(
  (item) => item.rtl
).map((item) => item.code);

export const LANGUAGE_MAP = Object.freeze(
  Object.fromEntries(LANGUAGES.map((item) => [item.code, item]))
) as Readonly<Record<SupportedLanguageCode, LanguageItem>>;

export function findLanguage(code?: string | null): LanguageItem | undefined {
  if (!code) return undefined;
  const normalized = code.toLowerCase().replace(/_/g, "-");
  return (
    LANGUAGES.find((item) => item.code.toLowerCase() === normalized) ??
    LANGUAGES.find((item) => item.code.toLowerCase() === normalized.split("-")[0])
  );
}

export function getDefaultLanguageByCountry(
  countryCode: string
): SupportedLanguageCode {
  const normalized = countryCode.trim().toUpperCase();

  switch (normalized) {
    case "UZ":
      return "uz";
    case "TJ":
      return "tg";
    case "KG":
      return "ky";
    case "KZ":
      return "kk";
    case "AF":
      return "fa-AF";
    case "TM":
      return "tk";
    case "AZ":
      return "az";
    case "TR":
      return "tr";
    case "IN":
      return "hi";
    case "PK":
      return "ur";
    case "BY":
      return "be";
    case "UA":
      return "uk";
    case "DE":
    case "AT":
    case "CH":
    case "LI":
    case "LU":
      return "de";
    case "TH":
      return "th";
    case "KE":
    case "TZ":
      return "sw";
    case "ET":
      return "am";
    case "ZA":
    case "NA":
      return "af";
    case "AM":
      return "hy";
    case "CN":
    case "HK":
    case "MO":
    case "TW":
      return "zh";
    case "KR":
    case "KP":
      return "ko";
    case "JP":
      return "ja";
    case "RU":
      return "ru";
    case "SA":
    case "AE":
    case "QA":
    case "KW":
    case "OM":
    case "BH":
    case "IQ":
    case "JO":
    case "LB":
    case "SY":
    case "YE":
    case "EG":
    case "LY":
    case "TN":
    case "DZ":
    case "MA":
    case "SD":
    case "SS":
    case "PS":
      return "ar";
    default:
      return "en";
  }
}

export default LANGUAGES;
