export type SabiAppLanguage =
  | "ru"
  | "en"
  | "uz"
  | "zh"
  | "ar"
  | "tr"
  | "fr"
  | "de"
  | "es"
  | "it"
  | "pt"
  | "hi"
  | "ur"
  | "fa"
  | "ko"
  | "ja"
  | "id"
  | "ms"
  | "th"
  | "vi"
  | "kk"
  | "ky"
  | "tg"
  | "az"
  | "pl";

const SABI_SUPPORTED_LANGUAGES: readonly SabiAppLanguage[] = [
  "ru",
  "en",
  "uz",
  "zh",
  "ar",
  "tr",
  "fr",
  "de",
  "es",
  "it",
  "pt",
  "hi",
  "ur",
  "fa",
  "ko",
  "ja",
  "id",
  "ms",
  "th",
  "vi",
  "kk",
  "ky",
  "tg",
  "az",
  "pl",
];

const GLOBAL_LANGUAGE_KEY = "__SABI_GLOBAL_PROFILE_LANGUAGE__";
const listeners = new Set<(language: SabiAppLanguage) => void>();

function isSabiAppLanguage(value: unknown): value is SabiAppLanguage {
  return typeof value === "string" && SABI_SUPPORTED_LANGUAGES.includes(value as SabiAppLanguage);
}

function getGlobalStore(): Record<string, unknown> {
  return globalThis as unknown as Record<string, unknown>;
}

export function getSabiGlobalProfileLanguage(): SabiAppLanguage {
  const current = getGlobalStore()[GLOBAL_LANGUAGE_KEY];
  return isSabiAppLanguage(current) ? current : "ru";
}

export function setSabiGlobalProfileLanguageFromProfile(language: SabiAppLanguage) {
  if (!isSabiAppLanguage(language)) return;

  getGlobalStore()[GLOBAL_LANGUAGE_KEY] = language;

  listeners.forEach((listener) => {
    listener(language);
  });
}

export function subscribeSabiGlobalProfileLanguage(listener: (language: SabiAppLanguage) => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}
