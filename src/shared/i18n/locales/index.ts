import type { SupportedLanguageCode } from "../../data/languages";

import AI_MOBILE_TRANSLATIONS from "../ai-mobile-translations";
import { HOME_MOBILE_TRANSLATIONS } from "../home-mobile-locale-source";
import MESSENGER_MOBILE_TRANSLATIONS from "../messenger-mobile-translations";
import { QR_MOBILE_TRANSLATIONS } from "../qr-mobile-translations";
import WALLET_MOBILE_TRANSLATIONS from "../wallet-mobile-translations";

import AF_LOCALE from "./af";
import AF_AI_MOBILE_LOCALE from "./af-ai-mobile";
import AM_LOCALE from "./am";
import AM_AI_MOBILE_LOCALE from "./am-ai-mobile";
import AR_LOCALE from "./ar";
import AR_AI_MOBILE_LOCALE from "./ar-ai-mobile";
import AZ_LOCALE from "./az";
import AZ_AI_MOBILE_LOCALE from "./az-ai-mobile";
import BE_LOCALE from "./be";
import BE_AI_MOBILE_LOCALE from "./be-ai-mobile";
import DE_LOCALE from "./de";
import DE_AI_MOBILE_LOCALE from "./de-ai-mobile";
import EN_LOCALE from "./en";
import EN_COMPLETION_LOCALE from "./en-completion";
import EN_AI_MOBILE_LOCALE from "./en-ai-mobile";
import FA_AF_LOCALE from "./fa-AF";
import FA_AF_AI_MOBILE_LOCALE from "./fa-AF-ai-mobile";
import HI_LOCALE from "./hi";
import HI_AI_MOBILE_LOCALE from "./hi-ai-mobile";
import HY_LOCALE from "./hy";
import HY_AI_MOBILE_LOCALE from "./hy-ai-mobile";
import JA_LOCALE from "./ja";
import JA_AI_MOBILE_LOCALE from "./ja-ai-mobile";
import KK_LOCALE from "./kk";
import KK_AI_MOBILE_LOCALE from "./kk-ai-mobile";
import KO_LOCALE from "./ko";
import KO_AI_MOBILE_LOCALE from "./ko-ai-mobile";
import KY_LOCALE from "./ky";
import KY_AI_MOBILE_LOCALE from "./ky-ai-mobile";
import PS_LOCALE from "./ps";
import PS_AI_MOBILE_LOCALE from "./ps-ai-mobile";
import RU_LOCALE from "./ru";
import RU_AI_MOBILE_LOCALE from "./ru-ai-mobile";
import SW_LOCALE from "./sw";
import SW_AI_MOBILE_LOCALE from "./sw-ai-mobile";
import TG_LOCALE from "./tg";
import TG_AI_MOBILE_LOCALE from "./tg-ai-mobile";
import TH_LOCALE from "./th";
import TH_AI_MOBILE_LOCALE from "./th-ai-mobile";
import TK_LOCALE from "./tk";
import TK_AI_MOBILE_LOCALE from "./tk-ai-mobile";
import TR_LOCALE from "./tr";
import TR_AI_MOBILE_LOCALE from "./tr-ai-mobile";
import UK_LOCALE from "./uk";
import UK_AI_MOBILE_LOCALE from "./uk-ai-mobile";
import UR_LOCALE from "./ur";
import UR_AI_MOBILE_LOCALE from "./ur-ai-mobile";
import UZ_LOCALE from "./uz";
import UZ_AI_MOBILE_LOCALE from "./uz-ai-mobile";
import ZH_LOCALE from "./zh";
import ZH_AI_MOBILE_LOCALE from "./zh-ai-mobile";

type LocaleTree = Record<string, unknown>;
type LocaleSourceMap = Partial<Record<SupportedLanguageCode | string, LocaleTree | Record<string, string> | undefined>>;

function isPlainObject(value: unknown): value is LocaleTree {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function deepMergeLocale(base: LocaleTree, override: LocaleTree): LocaleTree {
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

function setByPath(target: LocaleTree, path: string, value: unknown) {
  const parts = path.split(".").filter(Boolean);
  if (!parts.length) return;

  let cursor: LocaleTree = target;

  for (let index = 0; index < parts.length - 1; index += 1) {
    const part = parts[index];
    const next = cursor[part];

    if (!isPlainObject(next)) {
      cursor[part] = {};
    }

    cursor = cursor[part] as LocaleTree;
  }

  cursor[parts[parts.length - 1]] = value;
}

function flatRecordToTree(record?: Record<string, string>): LocaleTree {
  const result: LocaleTree = {};
  if (!record) return result;

  for (const [key, value] of Object.entries(record)) {
    setByPath(result, key, value);
  }

  return result;
}

function sourceForLanguage(
  source: LocaleSourceMap,
  languageCode: SupportedLanguageCode,
): LocaleTree {
  const direct = source[languageCode];
  const normalized = languageCode.toLowerCase();
  const baseCode = normalized.split("-")[0];
  const base = source[baseCode];
  const selected = direct ?? base;

  if (!selected) return {};

  const values = selected as Record<string, unknown>;
  const hasFlatKeys = Object.keys(values).some((key) => key.includes("."));

  return hasFlatKeys
    ? flatRecordToTree(selected as Record<string, string>)
    : (selected as LocaleTree);
}

function buildMobileLocaleCompletion(languageCode: SupportedLanguageCode): LocaleTree {
  const wallet = sourceForLanguage(WALLET_MOBILE_TRANSLATIONS as unknown as LocaleSourceMap, languageCode);
  const messenger = sourceForLanguage(MESSENGER_MOBILE_TRANSLATIONS as unknown as LocaleSourceMap, languageCode);
  const home = sourceForLanguage(HOME_MOBILE_TRANSLATIONS as unknown as LocaleSourceMap, languageCode);
  const qr = sourceForLanguage(QR_MOBILE_TRANSLATIONS as unknown as LocaleSourceMap, languageCode);
  const ai = sourceForLanguage(AI_MOBILE_TRANSLATIONS as unknown as LocaleSourceMap, languageCode);

  return [wallet, messenger, home, qr, ai].reduce<LocaleTree>(
    (acc, source) => deepMergeLocale(acc, source),
    {},
  );
}

const AF_WITH_AI_MOBILE = deepMergeLocale(
  AF_LOCALE as LocaleTree,
  AF_AI_MOBILE_LOCALE as LocaleTree,
);

const AM_WITH_AI_MOBILE = deepMergeLocale(
  AM_LOCALE as LocaleTree,
  AM_AI_MOBILE_LOCALE as LocaleTree,
);

const AR_WITH_AI_MOBILE = deepMergeLocale(
  AR_LOCALE as LocaleTree,
  AR_AI_MOBILE_LOCALE as LocaleTree,
);

const AZ_WITH_AI_MOBILE = deepMergeLocale(
  AZ_LOCALE as LocaleTree,
  AZ_AI_MOBILE_LOCALE as LocaleTree,
);

const BE_WITH_AI_MOBILE = deepMergeLocale(
  BE_LOCALE as LocaleTree,
  BE_AI_MOBILE_LOCALE as LocaleTree,
);

const DE_WITH_AI_MOBILE = deepMergeLocale(
  DE_LOCALE as LocaleTree,
  DE_AI_MOBILE_LOCALE as LocaleTree,
);

const EN_WITH_AI_MOBILE = deepMergeLocale(
  EN_LOCALE as LocaleTree,
  EN_AI_MOBILE_LOCALE as LocaleTree,
);

const FA_AF_WITH_AI_MOBILE = deepMergeLocale(
  FA_AF_LOCALE as LocaleTree,
  FA_AF_AI_MOBILE_LOCALE as LocaleTree,
);

const HI_WITH_AI_MOBILE = deepMergeLocale(
  HI_LOCALE as LocaleTree,
  HI_AI_MOBILE_LOCALE as LocaleTree,
);

const HY_WITH_AI_MOBILE = deepMergeLocale(
  HY_LOCALE as LocaleTree,
  HY_AI_MOBILE_LOCALE as LocaleTree,
);

const JA_WITH_AI_MOBILE = deepMergeLocale(
  JA_LOCALE as LocaleTree,
  JA_AI_MOBILE_LOCALE as LocaleTree,
);

const KK_WITH_AI_MOBILE = deepMergeLocale(
  KK_LOCALE as LocaleTree,
  KK_AI_MOBILE_LOCALE as LocaleTree,
);

const KO_WITH_AI_MOBILE = deepMergeLocale(
  KO_LOCALE as LocaleTree,
  KO_AI_MOBILE_LOCALE as LocaleTree,
);

const KY_WITH_AI_MOBILE = deepMergeLocale(
  KY_LOCALE as LocaleTree,
  KY_AI_MOBILE_LOCALE as LocaleTree,
);

const PS_WITH_AI_MOBILE = deepMergeLocale(
  PS_LOCALE as LocaleTree,
  PS_AI_MOBILE_LOCALE as LocaleTree,
);

const RU_WITH_AI_MOBILE = deepMergeLocale(
  RU_LOCALE as LocaleTree,
  RU_AI_MOBILE_LOCALE as LocaleTree,
);

const SW_WITH_AI_MOBILE = deepMergeLocale(
  SW_LOCALE as LocaleTree,
  SW_AI_MOBILE_LOCALE as LocaleTree,
);

const TG_WITH_AI_MOBILE = deepMergeLocale(
  TG_LOCALE as LocaleTree,
  TG_AI_MOBILE_LOCALE as LocaleTree,
);

const TH_WITH_AI_MOBILE = deepMergeLocale(
  TH_LOCALE as LocaleTree,
  TH_AI_MOBILE_LOCALE as LocaleTree,
);

const TK_WITH_AI_MOBILE = deepMergeLocale(
  TK_LOCALE as LocaleTree,
  TK_AI_MOBILE_LOCALE as LocaleTree,
);

const TR_WITH_AI_MOBILE = deepMergeLocale(
  TR_LOCALE as LocaleTree,
  TR_AI_MOBILE_LOCALE as LocaleTree,
);

const UK_WITH_AI_MOBILE = deepMergeLocale(
  UK_LOCALE as LocaleTree,
  UK_AI_MOBILE_LOCALE as LocaleTree,
);

const UR_WITH_AI_MOBILE = deepMergeLocale(
  UR_LOCALE as LocaleTree,
  UR_AI_MOBILE_LOCALE as LocaleTree,
);

const UZ_WITH_AI_MOBILE = deepMergeLocale(
  UZ_LOCALE as LocaleTree,
  UZ_AI_MOBILE_LOCALE as LocaleTree,
);

const ZH_WITH_AI_MOBILE = deepMergeLocale(
  ZH_LOCALE as LocaleTree,
  ZH_AI_MOBILE_LOCALE as LocaleTree,
);

const RAW_LOCALES: Record<SupportedLanguageCode, LocaleTree> = {
  en: EN_WITH_AI_MOBILE,
  ru: RU_WITH_AI_MOBILE,
  zh: ZH_WITH_AI_MOBILE,
  ko: KO_WITH_AI_MOBILE,
  ja: JA_WITH_AI_MOBILE,
  uz: UZ_WITH_AI_MOBILE,
  tg: TG_WITH_AI_MOBILE,
  ky: KY_WITH_AI_MOBILE,
  kk: KK_WITH_AI_MOBILE,
  "fa-AF": FA_AF_WITH_AI_MOBILE,
  ps: PS_WITH_AI_MOBILE,
  tk: TK_WITH_AI_MOBILE,
  az: AZ_WITH_AI_MOBILE,
  tr: TR_WITH_AI_MOBILE,
  hi: HI_WITH_AI_MOBILE,
  ur: UR_WITH_AI_MOBILE,
  ar: AR_WITH_AI_MOBILE,
  be: BE_WITH_AI_MOBILE,
  uk: UK_WITH_AI_MOBILE,
  de: DE_WITH_AI_MOBILE,
  th: TH_WITH_AI_MOBILE,
  sw: SW_WITH_AI_MOBILE,
  am: AM_WITH_AI_MOBILE,
  af: AF_WITH_AI_MOBILE,
  hy: HY_WITH_AI_MOBILE,
};

const EN_COMPLETION_BASE = deepMergeLocale(
  deepMergeLocale(EN_LOCALE as LocaleTree, EN_COMPLETION_LOCALE as LocaleTree),
  buildMobileLocaleCompletion("en"),
);

export const LOCALES: Record<SupportedLanguageCode, LocaleTree> =
  Object.fromEntries(
    Object.entries(RAW_LOCALES).map(([languageCode, locale]) => {
      const code = languageCode as SupportedLanguageCode;
      const languageMobileCompletion = buildMobileLocaleCompletion(code);

      return [
        code,
        deepMergeLocale(
          deepMergeLocale(EN_COMPLETION_BASE, locale),
          languageMobileCompletion,
        ),
      ];
    }),
  ) as Record<SupportedLanguageCode, LocaleTree>;

export default LOCALES;


