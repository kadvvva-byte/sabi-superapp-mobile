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

export function aiMobileText(
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