import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";

import { LANGUAGES, type SupportedLanguageCode } from "../data/languages";
import { getAppLanguage } from ".";

const FALLBACK_LANGUAGE: SupportedLanguageCode = "en";

function normalizeCode(input?: string | null): string {
  return String(input || "")
    .trim()
    .replace(/_/g, "-")
    .toLowerCase();
}

function resolveRuntimeLanguage(language?: string | null): SupportedLanguageCode {
  const normalized = normalizeCode(language);

  if (!normalized) return FALLBACK_LANGUAGE;

  const exact = LANGUAGES.find(
    (item) => normalizeCode(item.code) === normalized,
  );
  if (exact) return exact.code;

  const base = normalized.split("-")[0];
  const baseMatch = LANGUAGES.find(
    (item) => normalizeCode(item.code) === base,
  );

  return baseMatch?.code ?? FALLBACK_LANGUAGE;
}

export function useRuntimeLanguage(): SupportedLanguageCode {
  const [language, setLanguage] = useState<SupportedLanguageCode>(() =>
    resolveRuntimeLanguage(getAppLanguage()),
  );

  useFocusEffect(
    useCallback(() => {
      setLanguage(resolveRuntimeLanguage(getAppLanguage()));
      return () => {};
    }, []),
  );

  return language;
}

export function normalizeRuntimeLanguage(
  language?: string | null,
): SupportedLanguageCode {
  return resolveRuntimeLanguage(language);
}

export function pickRuntimeDictionary<T>(
  language: string | null | undefined,
  dictionaries: Partial<Record<SupportedLanguageCode | string, T>>,
  fallback: SupportedLanguageCode | string = FALLBACK_LANGUAGE,
): T {
  const normalized = normalizeCode(language);
  const resolved = resolveRuntimeLanguage(language);
  const short = normalized.split("-")[0];
  const fallbackCode = resolveRuntimeLanguage(fallback);
  const normalizedFallback = normalizeCode(fallback);
  const fallbackShort = normalizedFallback.split("-")[0];

  const value =
    dictionaries[resolved] ??
    dictionaries[normalized] ??
    dictionaries[short] ??
    dictionaries[fallbackCode] ??
    dictionaries[normalizedFallback] ??
    dictionaries[fallbackShort];

  if (value !== undefined) return value;

  const firstValue = Object.values(dictionaries).find(
    (item): item is T => item !== undefined,
  );

  if (firstValue !== undefined) return firstValue;

  throw new Error("pickRuntimeDictionary: dictionaries is empty");
}
