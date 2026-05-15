import { resolveSabiApiBaseUrl } from "../../../shared/api/apiBaseUrl";
import type {
  SabiHomeProgramCode,
  SabiProgramFoundationStatus,
  SabiProgramProviderStatus,
  SabiProgramRuntimeStatus,
} from "./programFoundation.types";
import { buildLocalSabiProgramStatus } from "./programFoundationRegistry";

export type SabiProgramFoundationFetchResult = {
  source: "backend" | "local_unavailable";
  status: SabiProgramFoundationStatus;
};

export type SabiFoundationLocale = "en" | "ru" | "uz";

export function resolveSabiFoundationLocale(language?: string | null): SabiFoundationLocale {
  const normalized = String(language || "").trim().toLowerCase();
  if (normalized.startsWith("ru")) return "ru";
  if (normalized.startsWith("uz")) return "uz";
  return "en";
}

function getApiBaseUrl() {
  return resolveSabiApiBaseUrl(undefined, { port: "4001" }).replace(/\/+$/, "");
}

export async function fetchSabiProgramFoundationStatus(
  code: SabiHomeProgramCode,
): Promise<SabiProgramFoundationFetchResult> {
  const fallback = buildLocalSabiProgramStatus(code);

  try {
    const response = await fetch(`${getApiBaseUrl()}/api/v2/programs/${code}/status`, {
      method: "GET",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      return { source: "local_unavailable", status: fallback };
    }

    const json = (await response.json()) as SabiProgramFoundationStatus;
    if (!json || json.ok !== true || !json.program) {
      return { source: "local_unavailable", status: fallback };
    }

    return { source: "backend", status: json };
  } catch {
    return { source: "local_unavailable", status: fallback };
  }
}

const RUNTIME_LABELS: Record<SabiProgramRuntimeStatus, Record<SabiFoundationLocale, string>> = {
  ready: { en: "ready", ru: "готово", uz: "tayyor" },
  foundation_ready: { en: "foundation ready", ru: "основа готова", uz: "asos tayyor" },
  provider_required: { en: "provider required", ru: "нужен провайдер", uz: "provider kerak" },
  temporarily_disabled: { en: "temporarily disabled", ru: "временно выключено", uz: "vaqtincha o‘chirilgan" },
  admin_only: { en: "admin only", ru: "только админ", uz: "faqat admin" },
  api_unavailable: { en: "API unavailable", ru: "API недоступен", uz: "API mavjud emas" },
};

const PROVIDER_LABELS: Record<SabiProgramProviderStatus, Record<SabiFoundationLocale, string>> = {
  not_required: { en: "not required", ru: "не требуется", uz: "kerak emas" },
  configured: { en: "configured", ru: "подключён", uz: "ulangan" },
  provider_required: { en: "provider required", ru: "нужен провайдер", uz: "provider kerak" },
  api_key_required: { en: "API key required", ru: "нужен API-ключ", uz: "API kalit kerak" },
  contract_required: { en: "contract required", ru: "нужен договор", uz: "shartnoma kerak" },
  api_unavailable: { en: "API unavailable", ru: "API недоступен", uz: "API mavjud emas" },
};

export function formatSabiProgramRuntimeStatus(status: string, language?: string | null) {
  const locale = resolveSabiFoundationLocale(language);
  return RUNTIME_LABELS[status as SabiProgramRuntimeStatus]?.[locale] ?? status;
}

export function formatSabiProgramProviderStatus(status: string, language?: string | null) {
  const locale = resolveSabiFoundationLocale(language);
  return PROVIDER_LABELS[status as SabiProgramProviderStatus]?.[locale] ?? status;
}

export function formatSabiProgramBoolean(value: boolean, language?: string | null) {
  const locale = resolveSabiFoundationLocale(language);
  return value
    ? ({ en: "enabled", ru: "включено", uz: "yoqilgan" }[locale])
    : ({ en: "disabled", ru: "выключено", uz: "o‘chirilgan" }[locale]);
}

export function formatSabiFoundationSource(source: SabiProgramFoundationFetchResult["source"], language?: string | null) {
  const locale = resolveSabiFoundationLocale(language);

  if (source === "backend") {
    return { en: "backend connected", ru: "backend подключён", uz: "backend ulangan" }[locale];
  }

  return {
    en: "local foundation; backend unavailable",
    ru: "локальная основа; backend недоступен",
    uz: "lokal asos; backend mavjud emas",
  }[locale];
}
