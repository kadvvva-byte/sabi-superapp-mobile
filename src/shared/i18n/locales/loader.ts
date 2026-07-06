import type { SupportedLanguageCode } from "../../data/languages";

export type LocaleTree = Record<string, unknown>;
type LocaleModule = { default?: LocaleTree } & LocaleTree;

type LocaleImporter = () => Promise<LocaleModule>;

function isPlainObject(value: unknown): value is LocaleTree {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function deepMergeLocale(base: LocaleTree, override: LocaleTree): LocaleTree {
  const result: LocaleTree = { ...base };

  for (const [key, overrideValue] of Object.entries(override)) {
    const baseValue = result[key];

    if (isPlainObject(baseValue) && isPlainObject(overrideValue)) {
      result[key] = deepMergeLocale(baseValue, overrideValue);
      continue;
    }

    if (Array.isArray(overrideValue)) {
      result[key] = [...overrideValue];
      continue;
    }

    result[key] = overrideValue;
  }

  return result;
}

function readDefault(module: LocaleModule): LocaleTree {
  return ((module.default ?? module) as LocaleTree) || {};
}

const BASE_LOCALE_LOADERS: Record<SupportedLanguageCode, LocaleImporter> = {
  en: () => import("./en"),
  ru: () => import("./ru"),
  zh: () => import("./zh"),
  ko: () => import("./ko"),
  ja: () => import("./ja"),
  uz: () => import("./uz"),
  tg: () => import("./tg"),
  ky: () => import("./ky"),
  kk: () => import("./kk"),
  "fa-AF": () => import("./fa-AF"),
  ps: () => import("./ps"),
  tk: () => import("./tk"),
  az: () => import("./az"),
  tr: () => import("./tr"),
  hi: () => import("./hi"),
  ur: () => import("./ur"),
  ar: () => import("./ar"),
  be: () => import("./be"),
  uk: () => import("./uk"),
  de: () => import("./de"),
  th: () => import("./th"),
  sw: () => import("./sw"),
  am: () => import("./am"),
  af: () => import("./af"),
  hy: () => import("./hy"),
};

const AI_LOCALE_LOADERS: Record<SupportedLanguageCode, LocaleImporter> = {
  en: () => import("./en-ai-mobile"),
  ru: () => import("./ru-ai-mobile"),
  zh: () => import("./zh-ai-mobile"),
  ko: () => import("./ko-ai-mobile"),
  ja: () => import("./ja-ai-mobile"),
  uz: () => import("./uz-ai-mobile"),
  tg: () => import("./tg-ai-mobile"),
  ky: () => import("./ky-ai-mobile"),
  kk: () => import("./kk-ai-mobile"),
  "fa-AF": () => import("./fa-AF-ai-mobile"),
  ps: () => import("./ps-ai-mobile"),
  tk: () => import("./tk-ai-mobile"),
  az: () => import("./az-ai-mobile"),
  tr: () => import("./tr-ai-mobile"),
  hi: () => import("./hi-ai-mobile"),
  ur: () => import("./ur-ai-mobile"),
  ar: () => import("./ar-ai-mobile"),
  be: () => import("./be-ai-mobile"),
  uk: () => import("./uk-ai-mobile"),
  de: () => import("./de-ai-mobile"),
  th: () => import("./th-ai-mobile"),
  sw: () => import("./sw-ai-mobile"),
  am: () => import("./am-ai-mobile"),
  af: () => import("./af-ai-mobile"),
  hy: () => import("./hy-ai-mobile"),
};

const MOBILE_COMPLETION_LOADERS: Record<SupportedLanguageCode, LocaleImporter> = {
  en: () => import("./mobile-completion/en"),
  ru: () => import("./mobile-completion/ru"),
  zh: () => import("./mobile-completion/zh"),
  ko: () => import("./mobile-completion/ko"),
  ja: () => import("./mobile-completion/ja"),
  uz: () => import("./mobile-completion/uz"),
  tg: () => import("./mobile-completion/tg"),
  ky: () => import("./mobile-completion/ky"),
  kk: () => import("./mobile-completion/kk"),
  "fa-AF": () => import("./mobile-completion/fa-AF"),
  ps: () => import("./mobile-completion/ps"),
  tk: () => import("./mobile-completion/tk"),
  az: () => import("./mobile-completion/az"),
  tr: () => import("./mobile-completion/tr"),
  hi: () => import("./mobile-completion/hi"),
  ur: () => import("./mobile-completion/ur"),
  ar: () => import("./mobile-completion/ar"),
  be: () => import("./mobile-completion/be"),
  uk: () => import("./mobile-completion/uk"),
  de: () => import("./mobile-completion/de"),
  th: () => import("./mobile-completion/th"),
  sw: () => import("./mobile-completion/sw"),
  am: () => import("./mobile-completion/am"),
  af: () => import("./mobile-completion/af"),
  hy: () => import("./mobile-completion/hy"),
};

let englishCompletionBasePromise: Promise<LocaleTree> | null = null;

async function loadEnglishCompletionBase(): Promise<LocaleTree> {
  if (!englishCompletionBasePromise) {
    englishCompletionBasePromise = Promise.all([
      import("./en"),
      import("./en-completion"),
      import("./mobile-completion/en"),
    ]).then(([enLocale, enCompletion, enMobileCompletion]) =>
      deepMergeLocale(
        deepMergeLocale(readDefault(enLocale), readDefault(enCompletion)),
        readDefault(enMobileCompletion),
      ),
    );
  }

  return englishCompletionBasePromise;
}

export async function loadLocaleTree(languageCode: SupportedLanguageCode): Promise<LocaleTree> {
  const baseLoader = BASE_LOCALE_LOADERS[languageCode] ?? BASE_LOCALE_LOADERS.en;
  const aiLoader = AI_LOCALE_LOADERS[languageCode] ?? AI_LOCALE_LOADERS.en;
  const mobileLoader = MOBILE_COMPLETION_LOADERS[languageCode] ?? MOBILE_COMPLETION_LOADERS.en;

  const [englishCompletionBase, baseLocale, aiLocale, mobileCompletion] = await Promise.all([
    loadEnglishCompletionBase(),
    baseLoader(),
    aiLoader(),
    mobileLoader(),
  ]);

  const selectedLocale = deepMergeLocale(readDefault(baseLocale), readDefault(aiLocale));

  return deepMergeLocale(
    deepMergeLocale(englishCompletionBase, selectedLocale),
    readDefault(mobileCompletion),
  );
}
