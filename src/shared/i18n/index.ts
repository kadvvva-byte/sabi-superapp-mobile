import { useMemo, useSyncExternalStore } from "react";
import { I18nManager } from "react-native";

import { appStorage, STORAGE_KEYS } from "../storage/app-storage";
import {
  LANGUAGES,
  type SupportedLanguageCode,
} from "../data/languages";
import BASE_TRANSLATIONS from "./base-translations";
import LOCALES from "./locales";

export type TranslationLanguage = SupportedLanguageCode;
export type TranslationParams = Record<
  string,
  string | number | boolean | null | undefined
>;

type TranslationTree = Record<string, unknown>;

const FALLBACK_LANGUAGE: TranslationLanguage = "en";
const listeners = new Set<() => void>();

let currentLanguage: TranslationLanguage = FALLBACK_LANGUAGE;
let didHydrateLanguage = false;

function normalizeCode(input?: string | null): string {
  return String(input || "")
    .trim()
    .replace(/_/g, "-")
    .toLowerCase();
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getByPath(source: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (!isObject(acc)) return undefined;
    return acc[key];
  }, source);
}

function interpolate(template: string, params?: TranslationParams): string {
  if (!params) return template;

  return template.replace(/\{\{(.*?)\}\}/g, (_, key) => {
    const value = params[key.trim()];
    return value === null || value === undefined ? "" : String(value);
  });
}

function resolveSupportedLanguage(input?: string | null): TranslationLanguage {
  const normalized = normalizeCode(input);
  if (!normalized) return FALLBACK_LANGUAGE;

  const exact = LANGUAGES.find(
    (item) => normalizeCode(item.code) === normalized,
  );
  if (exact) return exact.code as TranslationLanguage;

  const base = normalized.split("-")[0];
  const baseMatch = LANGUAGES.find(
    (item) => normalizeCode(item.code) === base,
  );
  if (baseMatch) return baseMatch.code as TranslationLanguage;

  return FALLBACK_LANGUAGE;
}

function isRTL(code: string): boolean {
  const normalized = normalizeCode(code);
  return (
    normalized === "ar" ||
    normalized === "ur" ||
    normalized === "ps" ||
    normalized === "fa-af"
  );
}

function getLocale(language: TranslationLanguage): TranslationTree {
  return (
    (LOCALES[language] as TranslationTree | undefined) ??
    (LOCALES[FALLBACK_LANGUAGE] as TranslationTree | undefined) ??
    (BASE_TRANSLATIONS as TranslationTree)
  );
}

const SABI_MESSENGER_GROUP_MENU_TRANSLATIONS: Partial<Record<TranslationLanguage, TranslationTree>> = {
  "en": {
    "sabiMessengerGroupMenu": {"groupAddMember":"Add member","groupAddMemberSubtitle":"Invite a user to this group","groupInvite":"Invite link","groupInviteSubtitle":"Open group invite link","groupShare":"Share group","groupShareSubtitle":"Share this group","groupInviteReady":"Invite link","groupInviteMissing":"Invite link is not ready","groupShareReady":"Group shared"},
  },
  "ru": {
    "sabiMessengerGroupMenu": {"groupAddMember":"Добавить участника","groupAddMemberSubtitle":"Пригласить пользователя в эту группу","groupInvite":"Ссылка приглашения","groupInviteSubtitle":"Открыть ссылку приглашения","groupShare":"Поделиться группой","groupShareSubtitle":"Поделиться этой группой","groupInviteReady":"Ссылка приглашения","groupInviteMissing":"Ссылка приглашения не готова","groupShareReady":"Группа отправлена"},
  },
  "zh": {
    "sabiMessengerGroupMenu": {"groupAddMember":"Add member","groupAddMemberSubtitle":"Invite a user to this group","groupInvite":"Invite link","groupInviteSubtitle":"Open group invite link","groupShare":"Share group","groupShareSubtitle":"Share this group","groupInviteReady":"Invite link","groupInviteMissing":"Invite link is not ready","groupShareReady":"Group shared"},
  },
  "ko": {
    "sabiMessengerGroupMenu": {"groupAddMember":"Add member","groupAddMemberSubtitle":"Invite a user to this group","groupInvite":"Invite link","groupInviteSubtitle":"Open group invite link","groupShare":"Share group","groupShareSubtitle":"Share this group","groupInviteReady":"Invite link","groupInviteMissing":"Invite link is not ready","groupShareReady":"Group shared"},
  },
  "ja": {
    "sabiMessengerGroupMenu": {"groupAddMember":"Add member","groupAddMemberSubtitle":"Invite a user to this group","groupInvite":"Invite link","groupInviteSubtitle":"Open group invite link","groupShare":"Share group","groupShareSubtitle":"Share this group","groupInviteReady":"Invite link","groupInviteMissing":"Invite link is not ready","groupShareReady":"Group shared"},
  },
  "uz": {
    "sabiMessengerGroupMenu": {"groupAddMember":"Ishtirokchi qo‘shish","groupAddMemberSubtitle":"Foydalanuvchini guruhga taklif qilish","groupInvite":"Taklif havolasi","groupInviteSubtitle":"Guruh taklif havolasini ochish","groupShare":"Guruhni ulashish","groupShareSubtitle":"Bu guruhni ulashish","groupInviteReady":"Taklif havolasi","groupInviteMissing":"Taklif havolasi tayyor emas","groupShareReady":"Guruh ulashildi"},
  },
  "tg": {
    "sabiMessengerGroupMenu": {"groupAddMember":"Иловаи иштирокчӣ","groupAddMemberSubtitle":"Даъвати корбар ба гурӯҳ","groupInvite":"Пайванди даъват","groupInviteSubtitle":"Кушодани пайванди даъват","groupShare":"Мубодилаи гурӯҳ","groupShareSubtitle":"Мубодилаи ин гурӯҳ","groupInviteReady":"Пайванди даъват","groupInviteMissing":"Пайванди даъват омода нест","groupShareReady":"Гурӯҳ мубодила шуд"},
  },
  "ky": {
    "sabiMessengerGroupMenu": {"groupAddMember":"Катышуучу кошуу","groupAddMemberSubtitle":"Колдонуучуну топко чакыруу","groupInvite":"Чакыруу шилтемеси","groupInviteSubtitle":"Топ чакыруу шилтемесин ачуу","groupShare":"Топту бөлүшүү","groupShareSubtitle":"Бул топту бөлүшүү","groupInviteReady":"Чакыруу шилтемеси","groupInviteMissing":"Чакыруу шилтемеси даяр эмес","groupShareReady":"Топ бөлүшүлдү"},
  },
  "kk": {
    "sabiMessengerGroupMenu": {"groupAddMember":"Қатысушы қосу","groupAddMemberSubtitle":"Пайдаланушыны топқа шақыру","groupInvite":"Шақыру сілтемесі","groupInviteSubtitle":"Топ шақыру сілтемесін ашу","groupShare":"Топпен бөлісу","groupShareSubtitle":"Осы топпен бөлісу","groupInviteReady":"Шақыру сілтемесі","groupInviteMissing":"Шақыру сілтемесі дайын емес","groupShareReady":"Топ бөлісілді"},
  },
  "fa-AF": {
    "sabiMessengerGroupMenu": {"groupAddMember":"Add member","groupAddMemberSubtitle":"Invite a user to this group","groupInvite":"Invite link","groupInviteSubtitle":"Open group invite link","groupShare":"Share group","groupShareSubtitle":"Share this group","groupInviteReady":"Invite link","groupInviteMissing":"Invite link is not ready","groupShareReady":"Group shared"},
  },
  "ps": {
    "sabiMessengerGroupMenu": {"groupAddMember":"Add member","groupAddMemberSubtitle":"Invite a user to this group","groupInvite":"Invite link","groupInviteSubtitle":"Open group invite link","groupShare":"Share group","groupShareSubtitle":"Share this group","groupInviteReady":"Invite link","groupInviteMissing":"Invite link is not ready","groupShareReady":"Group shared"},
  },
  "tk": {
    "sabiMessengerGroupMenu": {"groupAddMember":"Add member","groupAddMemberSubtitle":"Invite a user to this group","groupInvite":"Invite link","groupInviteSubtitle":"Open group invite link","groupShare":"Share group","groupShareSubtitle":"Share this group","groupInviteReady":"Invite link","groupInviteMissing":"Invite link is not ready","groupShareReady":"Group shared"},
  },
  "az": {
    "sabiMessengerGroupMenu": {"groupAddMember":"Add member","groupAddMemberSubtitle":"Invite a user to this group","groupInvite":"Invite link","groupInviteSubtitle":"Open group invite link","groupShare":"Share group","groupShareSubtitle":"Share this group","groupInviteReady":"Invite link","groupInviteMissing":"Invite link is not ready","groupShareReady":"Group shared"},
  },
  "tr": {
    "sabiMessengerGroupMenu": {"groupAddMember":"Üye ekle","groupAddMemberSubtitle":"Bu gruba kullanıcı davet et","groupInvite":"Davet bağlantısı","groupInviteSubtitle":"Grup davet bağlantısını aç","groupShare":"Grubu paylaş","groupShareSubtitle":"Bu grubu paylaş","groupInviteReady":"Davet bağlantısı","groupInviteMissing":"Davet bağlantısı hazır değil","groupShareReady":"Grup paylaşıldı"},
  },
  "hi": {
    "sabiMessengerGroupMenu": {"groupAddMember":"Add member","groupAddMemberSubtitle":"Invite a user to this group","groupInvite":"Invite link","groupInviteSubtitle":"Open group invite link","groupShare":"Share group","groupShareSubtitle":"Share this group","groupInviteReady":"Invite link","groupInviteMissing":"Invite link is not ready","groupShareReady":"Group shared"},
  },
  "ur": {
    "sabiMessengerGroupMenu": {"groupAddMember":"Add member","groupAddMemberSubtitle":"Invite a user to this group","groupInvite":"Invite link","groupInviteSubtitle":"Open group invite link","groupShare":"Share group","groupShareSubtitle":"Share this group","groupInviteReady":"Invite link","groupInviteMissing":"Invite link is not ready","groupShareReady":"Group shared"},
  },
  "ar": {
    "sabiMessengerGroupMenu": {"groupAddMember":"Add member","groupAddMemberSubtitle":"Invite a user to this group","groupInvite":"Invite link","groupInviteSubtitle":"Open group invite link","groupShare":"Share group","groupShareSubtitle":"Share this group","groupInviteReady":"Invite link","groupInviteMissing":"Invite link is not ready","groupShareReady":"Group shared"},
  },
  "be": {
    "sabiMessengerGroupMenu": {"groupAddMember":"Add member","groupAddMemberSubtitle":"Invite a user to this group","groupInvite":"Invite link","groupInviteSubtitle":"Open group invite link","groupShare":"Share group","groupShareSubtitle":"Share this group","groupInviteReady":"Invite link","groupInviteMissing":"Invite link is not ready","groupShareReady":"Group shared"},
  },
  "uk": {
    "sabiMessengerGroupMenu": {"groupAddMember":"Add member","groupAddMemberSubtitle":"Invite a user to this group","groupInvite":"Invite link","groupInviteSubtitle":"Open group invite link","groupShare":"Share group","groupShareSubtitle":"Share this group","groupInviteReady":"Invite link","groupInviteMissing":"Invite link is not ready","groupShareReady":"Group shared"},
  },
  "de": {
    "sabiMessengerGroupMenu": {"groupAddMember":"Add member","groupAddMemberSubtitle":"Invite a user to this group","groupInvite":"Invite link","groupInviteSubtitle":"Open group invite link","groupShare":"Share group","groupShareSubtitle":"Share this group","groupInviteReady":"Invite link","groupInviteMissing":"Invite link is not ready","groupShareReady":"Group shared"},
  },
  "th": {
    "sabiMessengerGroupMenu": {"groupAddMember":"Add member","groupAddMemberSubtitle":"Invite a user to this group","groupInvite":"Invite link","groupInviteSubtitle":"Open group invite link","groupShare":"Share group","groupShareSubtitle":"Share this group","groupInviteReady":"Invite link","groupInviteMissing":"Invite link is not ready","groupShareReady":"Group shared"},
  },
  "sw": {
    "sabiMessengerGroupMenu": {"groupAddMember":"Add member","groupAddMemberSubtitle":"Invite a user to this group","groupInvite":"Invite link","groupInviteSubtitle":"Open group invite link","groupShare":"Share group","groupShareSubtitle":"Share this group","groupInviteReady":"Invite link","groupInviteMissing":"Invite link is not ready","groupShareReady":"Group shared"},
  },
  "am": {
    "sabiMessengerGroupMenu": {"groupAddMember":"Add member","groupAddMemberSubtitle":"Invite a user to this group","groupInvite":"Invite link","groupInviteSubtitle":"Open group invite link","groupShare":"Share group","groupShareSubtitle":"Share this group","groupInviteReady":"Invite link","groupInviteMissing":"Invite link is not ready","groupShareReady":"Group shared"},
  },
  "af": {
    "sabiMessengerGroupMenu": {"groupAddMember":"Add member","groupAddMemberSubtitle":"Invite a user to this group","groupInvite":"Invite link","groupInviteSubtitle":"Open group invite link","groupShare":"Share group","groupShareSubtitle":"Share this group","groupInviteReady":"Invite link","groupInviteMissing":"Invite link is not ready","groupShareReady":"Group shared"},
  },
  "hy": {
    "sabiMessengerGroupMenu": {"groupAddMember":"Add member","groupAddMemberSubtitle":"Invite a user to this group","groupInvite":"Invite link","groupInviteSubtitle":"Open group invite link","groupShare":"Share group","groupShareSubtitle":"Share this group","groupInviteReady":"Invite link","groupInviteMissing":"Invite link is not ready","groupShareReady":"Group shared"},
  },
};

function emitChange() {
  listeners.forEach((listener) => listener());
}

function hydrateStoredLanguage() {
  if (didHydrateLanguage) return;
  didHydrateLanguage = true;

  Promise.resolve(appStorage.getString(STORAGE_KEYS.language))
    .then((storedValue) => {
      const nextLanguage = resolveSupportedLanguage(
        typeof storedValue === "string" ? storedValue : undefined,
      );

      if (nextLanguage !== currentLanguage) {
        currentLanguage = nextLanguage;
        emitChange();
      }
    })
    .catch(() => {
      // Ignore storage read errors and keep fallback language.
    });
}

function subscribe(listener: () => void) {
  hydrateStoredLanguage();
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function getAppLanguage(): TranslationLanguage {
  hydrateStoredLanguage();
  return currentLanguage;
}

export async function setAppLanguage(
  language: string,
): Promise<TranslationLanguage> {
  const nextLanguage = resolveSupportedLanguage(language);

  if (nextLanguage !== currentLanguage) {
    currentLanguage = nextLanguage;
    emitChange();
  }

  try {
    await Promise.resolve(
      appStorage.setString(STORAGE_KEYS.language, nextLanguage),
    );
  } catch {
    // Keep runtime language even if persisting fails.
  }

  return nextLanguage;
}

export function t(key: string, params?: TranslationParams): string {
  const activeLocale = getLocale(currentLanguage);
  const activeValue = getByPath(activeLocale, key);

  if (typeof activeValue === "string") {
    return interpolate(activeValue, params);
  }

  const fallbackValue = getByPath(BASE_TRANSLATIONS, key);
  if (typeof fallbackValue === "string") {
    return interpolate(fallbackValue, params);
  }

  return key;
}

export function useI18n() {
  const language = useSyncExternalStore(subscribe, getAppLanguage, getAppLanguage);

  return useMemo(() => {
    const direction = isRTL(language) ? "rtl" : "ltr";

    return {
      language,
      direction,
      isRTL: direction === "rtl" || I18nManager.isRTL,
      t: (key: string, params?: TranslationParams) => t(key, params),
      languages: LANGUAGES,
      setLanguage: setAppLanguage,
    };
  }, [language]);
}

export default useI18n;
