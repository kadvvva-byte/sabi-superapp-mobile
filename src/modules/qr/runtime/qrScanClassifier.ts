import type {
  SabiQrFunctionCode,
  SabiQrRail,
  SabiQrSurface,
} from "../contracts/universalQr.contracts";
import { SABI_QR_FUNCTION_CATALOG } from "../data/qrFunctionCatalog";

export const SABI_QR_SCAN_CLASSIFIER_VERSION = "QR-100.13" as const;

export type SabiQrScanClassificationKind =
  | "sabi_server_token"
  | "sabi_app_link"
  | "sabi_client_preview"
  | "phone_number"
  | "external_url"
  | "unsupported";

export type SabiQrScanClassification = {
  kind: SabiQrScanClassificationKind;
  handledLocally: boolean;
  ok: boolean;
  status: "success" | "failed" | "restricted";
  titleKey: string;
  descriptionKey: string;
  labelKey: string;
  displayValue: string;
  safeValue: string;
  reasonKey?: string;
  functionCode?: SabiQrFunctionCode;
  surface?: SabiQrSurface;
  rail?: SabiQrRail;
  routePath?: string;
  routeParam?: string;
};

const DANGEROUS_SCHEMES = [
  "javascript:",
  "data:text/html",
  "file:",
  "content:",
];
const SUPPORTED_EXTERNAL_PROTOCOLS = new Set(["http:", "https:"]);
const FUNCTION_CODES = new Set(
  SABI_QR_FUNCTION_CATALOG.map((item) => item.code),
);
const SURFACE_TO_FUNCTION: Partial<Record<SabiQrSurface, SabiQrFunctionCode>> =
  {
    profile: "profile_identity",
    wallet: "wallet_receive",
    coin_wallet: "coin_wallet_receive",
    crypto_wallet: "crypto_wallet_receive",
    merchant: "merchant_static_entry",
    business: "business_invoice",
    messenger: "messenger_profile",
    marketplace: "marketplace_order",
    stream: "stream_donation",
    taxi: "taxi_trip_payment",
    delivery: "delivery_order",
    school_attendance: "school_check_in",
    work_attendance: "work_check_in",
    virtual_card: "virtual_card_payment",
    verification: "profile_identity",
  };

const SURFACE_TO_RAIL: Partial<Record<SabiQrSurface, SabiQrRail>> = {
  profile: "messenger",
  wallet: "sabi_wallet",
  coin_wallet: "coin_wallet",
  crypto_wallet: "crypto_wallet",
  merchant: "merchant_wallet",
  business: "business_wallet",
  messenger: "messenger",
  marketplace: "marketplace",
  stream: "stream",
  taxi: "taxi",
  delivery: "delivery",
  school_attendance: "school",
  work_attendance: "work",
  virtual_card: "virtual_card_provider",
  verification: "messenger",
};

function normalizeText(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(/\u0000/g, "").trim();
}

function safeDisplayValue(value: string, maxLength = 96): string {
  const compact = value.replace(/\s+/g, " ").trim();
  if (!compact) return "—";
  return compact.length > maxLength
    ? `${compact.slice(0, maxLength - 1)}…`
    : compact;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function pickString(
  record: Record<string, unknown>,
  keys: string[],
): string | undefined {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return undefined;
}

function parseJsonObject(value: string): Record<string, unknown> | null {
  if (!value.startsWith("{") && !value.startsWith("%7B")) return null;

  const candidates = [value];
  try {
    const decoded = decodeURIComponent(value);
    if (decoded !== value) candidates.push(decoded);
  } catch {
    // Keep raw only.
  }

  for (const candidate of candidates) {
    try {
      return asRecord(JSON.parse(candidate));
    } catch {
      // Try next candidate.
    }
  }

  return null;
}

function normalizePhone(value: string): string | null {
  const withoutTel = value.replace(/^tel:/i, "").trim();
  const cleaned = withoutTel.replace(/[()\-\s.]/g, "");
  if (!/^\+?\d{7,15}$/.test(cleaned)) return null;
  return cleaned.startsWith("+") ? cleaned : `+${cleaned}`;
}

function normalizeSurface(
  value: string | undefined,
): SabiQrSurface | undefined {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
  const aliases: Record<string, SabiQrSurface> = {
    profile: "profile",
    user: "profile",
    contact: "profile",
    id: "profile",
    wallet: "wallet",
    pay: "wallet",
    payment: "wallet",
    sabi_wallet: "wallet",
    coin: "coin_wallet",
    coin_wallet: "coin_wallet",
    crypto: "crypto_wallet",
    crypto_wallet: "crypto_wallet",
    merchant: "merchant",
    merchant_wallet: "merchant",
    business: "business",
    business_wallet: "business",
    messenger: "messenger",
    chat: "messenger",
    marketplace: "marketplace",
    market: "marketplace",
    stream: "stream",
    taxi: "taxi",
    delivery: "delivery",
    school: "school_attendance",
    school_attendance: "school_attendance",
    work: "work_attendance",
    work_attendance: "work_attendance",
    virtual_card: "virtual_card",
    card: "virtual_card",
    verification: "verification",
  };

  return aliases[normalized];
}

function normalizeFunctionCode(
  value: string | undefined,
  surface?: SabiQrSurface,
): SabiQrFunctionCode | undefined {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
  if (FUNCTION_CODES.has(normalized as SabiQrFunctionCode))
    return normalized as SabiQrFunctionCode;
  return surface ? SURFACE_TO_FUNCTION[surface] : undefined;
}

function parseUrl(value: string): URL | null {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

function getFirstPathSegment(url: URL): string | undefined {
  return url.pathname
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean)[0];
}

function getLastPathSegment(url: URL): string | undefined {
  const parts = url.pathname
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean);
  return parts[parts.length - 1];
}

function isLikelySabiHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return (
    host === "sabi" ||
    host === "sabi.app" ||
    host.endsWith(".sabi.app") ||
    host.includes("sabi")
  );
}

function isLikelyServerToken(value: string | undefined): boolean {
  if (!value) return false;
  const normalized = value.trim();
  return (
    /^sabi[_:-]/i.test(normalized) ||
    /^qr[_:-]/i.test(normalized) ||
    /^[A-Z]{1,4}-[A-Za-z0-9_-]{6,80}$/.test(normalized) ||
    /^[A-Za-z0-9_-]{16,120}$/.test(normalized)
  );
}

function createServerTokenClassification(): SabiQrScanClassification {
  return {
    kind: "sabi_server_token",
    handledLocally: false,
    ok: true,
    status: "success",
    titleKey: "qr.mobile.scan.sabiToken.title",
    descriptionKey: "qr.mobile.scan.sabiToken.description",
    labelKey: "qr.mobile.scan.detectedData",
    displayValue: "Sabi QR",
    safeValue: "Sabi QR",
  };
}

function getSabiShortTokenFromUrl(url: URL): string | undefined {
  const parts = url.pathname
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean);
  const first = parts[0]?.toLowerCase();
  if (!first || !["q", "qr", "token", "scan"].includes(first)) return undefined;
  const token = parts[1] ?? parts[0];
  return isLikelyServerToken(token) ? token : undefined;
}

function getCleanExternalUrlLabel(url: URL): string {
  const host = url.hostname.replace(/^www\./i, "");
  const firstPath = getFirstPathSegment(url);
  return safeDisplayValue(firstPath ? `${host}/${firstPath}` : host, 72);
}

function classifySabiUrl(
  url: URL,
  rawValue: string,
): SabiQrScanClassification | null {
  const isSabiScheme =
    url.protocol === "sabi:" || url.protocol === "sabi-superapp:";
  const isSabiWeb =
    SUPPORTED_EXTERNAL_PROTOCOLS.has(url.protocol) &&
    isLikelySabiHost(url.hostname);
  if (!isSabiScheme && !isSabiWeb) return null;

  const shortToken = getSabiShortTokenFromUrl(url);
  if (shortToken) return createServerTokenClassification();

  const hostSurface = normalizeSurface(url.hostname);
  const pathSurface = normalizeSurface(getFirstPathSegment(url));
  const querySurface = normalizeSurface(
    url.searchParams.get("surface") ?? undefined,
  );
  const surface = querySurface ?? hostSurface ?? pathSurface ?? "profile";
  const functionCode = normalizeFunctionCode(
    url.searchParams.get("functionCode") ??
      url.searchParams.get("function") ??
      undefined,
    surface,
  );
  const routeParam =
    url.searchParams.get("userId") ??
    url.searchParams.get("profileId") ??
    url.searchParams.get("phone") ??
    url.searchParams.get("walletId") ??
    url.searchParams.get("merchantId") ??
    url.searchParams.get("businessId") ??
    getLastPathSegment(url) ??
    undefined;

  return {
    kind: "sabi_app_link",
    handledLocally: true,
    ok: true,
    status: "success",
    titleKey: "qr.mobile.scan.sabiLink.title",
    descriptionKey: "qr.mobile.scan.sabiLink.description",
    labelKey: "qr.mobile.scan.detectedData",
    displayValue: safeDisplayValue(functionCode || surface || "Sabi QR"),
    safeValue: "Sabi QR",
    functionCode,
    surface,
    rail: surface ? SURFACE_TO_RAIL[surface] : undefined,
    routePath: url.pathname || url.hostname || undefined,
    routeParam: routeParam ? safeDisplayValue(routeParam) : undefined,
  };
}

function classifyJsonPayload(
  record: Record<string, unknown>,
  rawValue: string,
): SabiQrScanClassification | null {
  const version = pickString(record, ["version", "v"]);
  const functionCode = normalizeFunctionCode(
    pickString(record, ["functionCode", "function", "type", "code"]),
  );
  const surface = normalizeSurface(
    pickString(record, ["surface", "module", "target", "kind"]),
  );
  const normalizedFunction =
    functionCode ?? normalizeFunctionCode(undefined, surface);
  const owner = pickString(record, [
    "ownerUserId",
    "actorUserId",
    "userId",
    "profileId",
    "publicProfileId",
    "targetUserId",
  ]);
  const routeParam =
    owner ??
    pickString(record, [
      "phone",
      "phoneNumber",
      "walletId",
      "merchantId",
      "businessId",
      "organizationId",
    ]);

  if (version === "QR-100") {
    return {
      kind: "sabi_server_token",
      handledLocally: false,
      ok: true,
      status: "success",
      titleKey: "qr.mobile.scan.sabiToken.title",
      descriptionKey: "qr.mobile.scan.sabiToken.description",
      labelKey: "qr.mobile.scan.detectedData",
      displayValue: "Sabi QR",
      safeValue: "Sabi QR",
      functionCode: normalizedFunction,
      surface,
      rail: surface ? SURFACE_TO_RAIL[surface] : undefined,
      routeParam: routeParam ? safeDisplayValue(routeParam) : undefined,
    };
  }

  if (version === "QR-100_CLIENT_PREVIEW") {
    return {
      kind: "sabi_client_preview",
      handledLocally: true,
      ok: false,
      status: "restricted",
      titleKey: "qr.mobile.scan.unsignedPreview.title",
      descriptionKey: "qr.mobile.scan.unsignedPreview.description",
      labelKey: "qr.mobile.scan.detectedData",
      displayValue: safeDisplayValue(normalizedFunction || surface || "Sabi QR preview"),
      safeValue: "Sabi QR preview",
      reasonKey: "qr.mobile.scan.unsignedPreview.reason",
      functionCode: normalizedFunction,
      surface,
      rail: surface ? SURFACE_TO_RAIL[surface] : undefined,
      routeParam: routeParam ? safeDisplayValue(routeParam) : undefined,
    };
  }

  if (surface || normalizedFunction) {
    return {
      kind: "sabi_app_link",
      handledLocally: true,
      ok: true,
      status: "success",
      titleKey: "qr.mobile.scan.sabiPayload.title",
      descriptionKey: "qr.mobile.scan.sabiPayload.description",
      labelKey: "qr.mobile.scan.detectedData",
      displayValue: "Sabi QR",
      safeValue: "Sabi QR",
      functionCode: normalizedFunction,
      surface,
      rail: surface ? SURFACE_TO_RAIL[surface] : undefined,
      routeParam: routeParam ? safeDisplayValue(routeParam) : undefined,
    };
  }

  return null;
}

export function buildSabiQrScanResultParams(
  classification: SabiQrScanClassification,
): Record<string, string> {
  const params: Record<string, string> = {
    status: classification.status,
    ok: classification.ok ? "1" : "0",
    scanKind: classification.kind,
    scanTitleKey: classification.titleKey,
    scanDescriptionKey: classification.descriptionKey,
    scanLabelKey: classification.labelKey,
    scanValue: classification.displayValue,
    scanSafeValue: classification.safeValue,
    scanClassifierVersion: SABI_QR_SCAN_CLASSIFIER_VERSION,
  };

  if (classification.reasonKey) params.reason = classification.reasonKey;
  if (classification.functionCode)
    params.functionCode = classification.functionCode;
  if (classification.surface) params.surface = classification.surface;
  if (classification.rail) params.rail = classification.rail;
  if (classification.routePath) params.scanRoutePath = classification.routePath;
  if (classification.routeParam)
    params.scanRouteParam = classification.routeParam;

  return params;
}

export function classifySabiQrScanValue(
  rawInput: string,
): SabiQrScanClassification {
  const rawValue = normalizeText(rawInput);
  const lower = rawValue.toLowerCase();

  if (!rawValue) {
    return {
      kind: "unsupported",
      handledLocally: true,
      ok: false,
      status: "failed",
      titleKey: "qr.mobile.scan.unsupported.title",
      descriptionKey: "qr.mobile.scan.unsupported.description",
      labelKey: "qr.mobile.scan.detectedData",
      displayValue: "—",
      safeValue: "—",
      reasonKey: "qr.mobile.confirm.emptyPayload",
    };
  }

  if (DANGEROUS_SCHEMES.some((scheme) => lower.startsWith(scheme))) {
    return {
      kind: "unsupported",
      handledLocally: true,
      ok: false,
      status: "restricted",
      titleKey: "qr.mobile.scan.unsupported.title",
      descriptionKey: "qr.mobile.scan.blockedDangerous.description",
      labelKey: "qr.mobile.scan.detectedData",
      displayValue: "—",
      safeValue: safeDisplayValue(rawValue),
      reasonKey: "qr.mobile.error.invalidQr",
    };
  }

  const phone = lower.startsWith("tel:")
    ? normalizePhone(rawValue)
    : normalizePhone(rawValue);
  if (phone) {
    return {
      kind: "phone_number",
      handledLocally: true,
      ok: true,
      status: "success",
      titleKey: "qr.mobile.scan.phone.title",
      descriptionKey: "qr.mobile.scan.phone.description",
      labelKey: "qr.mobile.scan.phone.label",
      displayValue: phone,
      safeValue: phone,
      routeParam: phone,
    };
  }

  const json = parseJsonObject(rawValue);
  if (json) {
    const jsonClassification = classifyJsonPayload(json, rawValue);
    if (jsonClassification) return jsonClassification;
  }

  const url = parseUrl(rawValue);
  if (url) {
    const sabiUrl = classifySabiUrl(url, rawValue);
    if (sabiUrl) return sabiUrl;

    if (SUPPORTED_EXTERNAL_PROTOCOLS.has(url.protocol)) {
      return {
        kind: "external_url",
        handledLocally: true,
        ok: true,
        status: "success",
        titleKey: "qr.mobile.scan.externalUrl.title",
        descriptionKey: "qr.mobile.scan.externalUrl.description",
        labelKey: "qr.mobile.scan.externalUrl.label",
        displayValue: getCleanExternalUrlLabel(url),
        safeValue: getCleanExternalUrlLabel(url),
        routePath: url.hostname,
      };
    }

    return {
      kind: "unsupported",
      handledLocally: true,
      ok: false,
      status: "failed",
      titleKey: "qr.mobile.scan.unsupported.title",
      descriptionKey: "qr.mobile.scan.unsupported.description",
      labelKey: "qr.mobile.scan.detectedData",
      displayValue: "—",
      safeValue: safeDisplayValue(rawValue),
      reasonKey: "qr.mobile.error.invalidQr",
    };
  }

  if (isLikelyServerToken(rawValue)) {
    return createServerTokenClassification();
  }

  return {
    kind: "unsupported",
    handledLocally: true,
    ok: false,
    status: "failed",
    titleKey: "qr.mobile.scan.unsupported.title",
    descriptionKey: "qr.mobile.scan.unsupported.description",
    labelKey: "qr.mobile.scan.detectedData",
    displayValue: "—",
    safeValue: safeDisplayValue(rawValue),
    reasonKey: "qr.mobile.scanner.resolveFailed",
  };
}
