const SABI_AI_123_EXTRA_TEXT: Record<string, Record<string, string>> = {};

import {
  t as translateApp,
  type TranslationLanguage,
  type TranslationParams,
} from "../../../shared/i18n";
import type { AiMobileApiError } from "./aiMobileTypes";

export function normalizeAiMobileKey(key: string): string {
  return key.startsWith("ai.mobile.") ? key : `ai.mobile.${key}`;
}

export function denormalizeAiMobileKey(key: string): string {
  return key.startsWith("ai.mobile.") ? key.slice("ai.mobile.".length) : key;
}

export function isMissingAiMobileText(value: string, key: string): boolean {
  const normalizedKey = normalizeAiMobileKey(key);
  const localKey = denormalizeAiMobileKey(key);

  return value === normalizedKey || value === key || value === localKey;
}

function aiMobileTextBase(
  _language: TranslationLanguage | string | null | undefined,
  key: string,
  params?: TranslationParams,
): string {
  const normalizedKey = normalizeAiMobileKey(key);
  const value = translateApp(normalizedKey, params);

  if (!isMissingAiMobileText(value, key)) {
    return value;
  }

  return denormalizeAiMobileKey(key);
}

export function aiMobileTextOrFallback(
  language: TranslationLanguage | string | null | undefined,
  key: string,
  fallback: string,
  params?: TranslationParams,
): string {
  const value = aiMobileText(language, key, params);
  return isMissingAiMobileText(value, key) ? fallback : value;
}

export function aiMobileErrorText(
  language: TranslationLanguage | string | null | undefined,
  error: AiMobileApiError | string | null | undefined,
  fallbackKey = "common.requestFailed",
): string {
  if (typeof error === "object" && error?.code) {
    const codeText = aiMobileText(language, `error.${error.code}`);

    if (!isMissingAiMobileText(codeText, `error.${error.code}`)) {
      return codeText;
    }
  }

  if (typeof error === "string" && error.trim()) {
    const codeText = aiMobileText(language, `error.${error}`);

    if (!isMissingAiMobileText(codeText, `error.${error}`)) {
      return codeText;
    }
  }

  return aiMobileText(language, fallbackKey);
}

export function aiMobileText(...args: Parameters<typeof aiMobileTextBase>): ReturnType<typeof aiMobileTextBase> {
  const language = String(args[0] ?? "en").toLowerCase();
  const key = String(args[1] ?? "");
  const shortLanguage = language.split("-")[0] || "en";
  const extra =
    SABI_AI_123_EXTRA_TEXT[language]?.[key] ??
    SABI_AI_123_EXTRA_TEXT[shortLanguage]?.[key] ??
    (shortLanguage === "en" ? SABI_AI_123_EXTRA_TEXT.en?.[key] : undefined);

  if (extra) {
    return extra as ReturnType<typeof aiMobileTextBase>;
  }

  return aiMobileTextBase(...args);
}
