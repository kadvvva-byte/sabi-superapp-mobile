import {
  getAuthenticatedAuthSession,
  getAuthSessionState,
} from "../../../core/kernel/auth/session.store";
import { getAppLanguage } from "../../../shared/i18n";
import type {
  AiMobileApiError,
  AiMobileApiResult,
  AiMobileAssistantMessageInput,
  AiMobileConnectionStatus,
  AiMobileFoundationMode,
  AiMobileListItem,
  AiMobilePrivacyMode,
  AiMobileProviderHint,
  AiMobileProviderRoute,
  AiMobileProviderRouteKind,
  AiMobileSafetyApprovalDecision,
  AiMobileSnapshot,
  AiMobileTranslationImageInput,
  AiMobileTranslationResult,
  AiMobileVoiceSession,
} from "./aiMobileTypes";

type AuthSession = {
  apiBaseUrl: string;
  accessToken: string | null;
  currentUserId: string | null;
};

const AI_MOBILE_API_VERSION = "AI-115.7-STEP69G" as const;
const SABI_AI_PRODUCTION_API_BASE_URL = "https://sabi-superapp-api-7srquvexva-ew.a.run.app" as const;

const AI_PROVIDER_GATEWAY_ROUTES = {
  textTranslation: "/api/ai/provider-gateway/translation/text",
  textTranslationRealtimeFallback: "/api/ai/translation/realtime/text",
  imageTranslation: "/api/ai/provider-gateway/translation/image",
  manifest: "/api/ai/provider-gateway/manifest",
  health: "/api/ai/provider-gateway/health",
} as const;

const AI_ASSISTANT_LIVE_ROUTES = [
  "/api/ai/ask",
  "/api/ai/assistant/run",
  "/api/ai/mobile-ui/assistant/message",
] as const;

type AiProviderGatewayManifest = {
  version: string;
  status: string;
  fallbackPolicy: string;
  localFakeFallback: boolean;
  translationConfigured: boolean;
  imageOcrConfigured: boolean;
  routes: Record<string, unknown>;
  env: Record<string, unknown>;
  providers: Record<string, unknown>;
  imageTranslation: Record<string, unknown>;
  raw: Record<string, unknown>;
};

function nowIso() {
  return new Date().toISOString();
}

export function createAiMobileId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function toRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function toStringValue(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function toArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function normalizeRequestHeaders(headers: RequestInit["headers"] | undefined): Record<string, string> {
  if (!headers) return {};

  if (typeof Headers !== "undefined" && headers instanceof Headers) {
    const normalized: Record<string, string> = {};
    headers.forEach((value, key) => {
      normalized[key] = value;
    });
    return normalized;
  }

  if (Array.isArray(headers)) {
    return headers.reduce<Record<string, string>>((acc, item) => {
      const [key, value] = item;
      if (key) acc[String(key)] = String(value);
      return acc;
    }, {});
  }

  if (typeof headers === "object") {
    return Object.entries(headers as Record<string, string>).reduce<Record<string, string>>(
      (acc, [key, value]) => {
        if (typeof value !== "undefined") acc[key] = String(value);
        return acc;
      },
      {},
    );
  }

  return {};
}

function normalizeImageFileName(fileName: string | null | undefined, imageUri: string): string {
  const provided = toStringValue(fileName);
  if (provided) return provided;

  const cleanUri = imageUri.split("?")[0] || imageUri;
  const lastSegment = cleanUri.split("/").filter(Boolean).pop();

  if (lastSegment && /\.[a-zA-Z0-9]+$/.test(lastSegment)) {
    return lastSegment;
  }

  return `sabi-ai-translation-${Date.now()}.jpg`;
}

function normalizeImageMimeType(mimeType: string | null | undefined, fileName: string): string {
  const provided = toStringValue(mimeType);
  if (provided) return provided;

  const extension = fileName.split(".").pop()?.toLowerCase();

  if (extension === "png") return "image/png";
  if (extension === "webp") return "image/webp";
  if (extension === "heic") return "image/heic";
  if (extension === "heif") return "image/heif";

  return "image/jpeg";
}

function normalizeStatus(value: unknown): AiMobileConnectionStatus {
  const text = toStringValue(value);
  if (text === "ready" || text === "limited" || text === "not_connected" || text === "error") return text;
  if (text === "connected" || text === "ok" || text === "active") return "ready";
  if (text === "disabled" || text === "missing" || text === "unavailable") return "not_connected";
  return "limited";
}

function readBoolean(value: unknown): boolean {
  return value === true || value === "true" || value === 1 || value === "1";
}

function normalizeProviderGatewayManifest(rawValue: unknown): AiProviderGatewayManifest {
  const root = toRecord(rawValue) ?? {};
  const data = toRecord(root.data) ?? root;
  const gateway = toRecord(data.gateway) ?? {};
  const env = toRecord(data.env) ?? {};
  const routes = toRecord(data.routes) ?? {};
  const providers = toRecord(data.providers) ?? {};
  const imageTranslation = toRecord(data.imageTranslation) ?? {};

  const googleConfigured = readBoolean(env.googleTranslationGatewayConfigured);
  const yandexConfigured = readBoolean(env.yandexTranslationGatewayConfigured);
  const internalConfigured = readBoolean(env.internalTranslationGatewayConfigured);
  const imageOcrConfigured = readBoolean(env.imageOcrGatewayConfigured);

  return {
    version: toStringValue(gateway.version) || "unknown",
    status: toStringValue(gateway.status) || "translation_provider_not_configured",
    fallbackPolicy: toStringValue(gateway.fallbackPolicy) || "disabled",
    localFakeFallback: readBoolean(gateway.localFakeFallback),
    translationConfigured: googleConfigured || yandexConfigured || internalConfigured,
    imageOcrConfigured,
    routes,
    env,
    providers,
    imageTranslation,
    raw: data,
  };
}

function providerGatewayStatus(manifest: AiProviderGatewayManifest | null): AiMobileConnectionStatus {
  if (!manifest) return "limited";
  if (manifest.status === "ready" && manifest.translationConfigured) return "ready";
  if (manifest.status.includes("error") || manifest.status.includes("failed")) return "error";
  return "limited";
}

function providerGatewayStatusText(manifest: AiProviderGatewayManifest | null): string {
  const language = getAppLanguage();

  if (!manifest) {
    if (language.startsWith("uz")) return "AI provider gateway holati hozircha tekshirib boвЂlmadi.";
    if (language.startsWith("ru")) return "РЎС‚Р°С‚СѓСЃ AI provider gateway РїРѕРєР° РЅРµ СѓРґР°Р»РѕСЃСЊ РїСЂРѕРІРµСЂРёС‚СЊ.";
    return "AI provider gateway status could not be checked yet.";
  }

  if (manifest.status === "ready" && manifest.translationConfigured) {
    if (language.startsWith("uz")) return "AI provider gateway tayyor. Real tarjima provayderi server orqali ulangan.";
    if (language.startsWith("ru")) return "AI provider gateway РіРѕС‚РѕРІ. Р РµР°Р»СЊРЅС‹Р№ РїСЂРѕРІР°Р№РґРµСЂ РїРµСЂРµРІРѕРґР° РїРѕРґРєР»СЋС‡С‘РЅ С‡РµСЂРµР· СЃРµСЂРІРµСЂ.";
    return "AI provider gateway is ready. A real translation provider is connected through the server.";
  }

  if (!manifest.translationConfigured) {
    if (language.startsWith("uz")) return "AI tarjima provayderi serverda hali ulanmagan. Mahalliy zaxira tarjima oвЂchirilgan.";
    if (language.startsWith("ru")) return "AI РїСЂРѕРІР°Р№РґРµСЂ РїРµСЂРµРІРѕРґР° РЅР° СЃРµСЂРІРµСЂРµ РїРѕРєР° РЅРµ РїРѕРґРєР»СЋС‡С‘РЅ. Р›РѕРєР°Р»СЊРЅС‹Р№ СЂРµР·РµСЂРІРЅС‹Р№ РїРµСЂРµРІРѕРґ РѕС‚РєР»СЋС‡С‘РЅ.";
    return "AI translation provider is not connected on the server yet. Local offline translation is disabled.";
  }

  if (language.startsWith("uz")) return `AI provider gateway holati: ${manifest.status}.`;
  if (language.startsWith("ru")) return `РЎС‚Р°С‚СѓСЃ AI provider gateway: ${manifest.status}.`;
  return `AI provider gateway status: ${manifest.status}.`;
}

function mergeProviderGatewayManifest(
  snapshot: AiMobileSnapshot,
  manifestResult: AiMobileApiResult<AiProviderGatewayManifest>,
): AiMobileSnapshot {
  if (!manifestResult.ok) {
    const status: AiMobileConnectionStatus = snapshot.status === "ready" ? "limited" : snapshot.status;
    const rawRoot = toRecord(snapshot.raw) ?? {};

    return {
      ...snapshot,
      status,
      statusText: snapshot.statusText || manifestResult.error.message,
      raw: {
        ...rawRoot,
        providerGatewayManifestError: manifestResult.error,
        providerGatewayFallbackPolicy: "disabled",
        localFakeFallback: false,
      },
    };
  }

  const manifest = manifestResult.data;
  const gatewayStatus = providerGatewayStatus(manifest);
  const rawRoot = toRecord(snapshot.raw) ?? {};
  const status: AiMobileConnectionStatus =
    snapshot.status === "error" ? "error" : gatewayStatus === "ready" ? snapshot.status : "limited";
  const translationDescription = providerGatewayStatusText(manifest);

  return {
    ...snapshot,
    status,
    statusText: gatewayStatus === "ready" ? snapshot.statusText : translationDescription,
    raw: {
      ...rawRoot,
      providerGatewayManifest: manifest.raw,
      providerGatewayStatus: manifest.status,
      providerGatewayVersion: manifest.version,
      providerGatewayFallbackPolicy: manifest.fallbackPolicy,
      localFakeFallback: manifest.localFakeFallback,
      translationConfigured: manifest.translationConfigured,
      imageOcrConfigured: manifest.imageOcrConfigured,
    },
    capabilities: snapshot.capabilities.map((capability) => {
      if (capability.key !== "translation") return capability;

      return {
        ...capability,
        status: gatewayStatus,
        description: translationDescription,
      };
    }),
  };
}

function makeError(code: string, message: string, status?: number): AiMobileApiError {
  return { code, message, status };
}

function looksLikeBackendErrorCode(value: string | null): value is string {
  if (!value) return false;
  return /^[a-z][a-z0-9_:-]*$/.test(value) && (value.includes("_") || value.includes(":"));
}

function pickErrorRecord(body: unknown): Record<string, unknown> {
  const record = toRecord(body) ?? {};
  const errorRecord = toRecord(record.error);
  return errorRecord ?? record;
}

function normalizeGatewayError(body: unknown, status: number): AiMobileApiError {
  const record = toRecord(body) ?? {};
  const errorRecord = pickErrorRecord(body);
  const stringError = toStringValue(record.error);
  const code =
    toStringValue(errorRecord.code) ||
    toStringValue(errorRecord.errorCode) ||
    toStringValue(record.code) ||
    toStringValue(record.errorCode) ||
    (looksLikeBackendErrorCode(stringError) ? stringError : null) ||
    `ai_mobile_http_${status}`;

  const message =
    toStringValue(errorRecord.message) ||
    toStringValue(record.message) ||
    (stringError && !looksLikeBackendErrorCode(stringError) ? stringError : null) ||
    toStringValue(errorRecord.error) ||
    `AI mobile request failed with ${status}`;

  return makeError(code, message, status);
}

function normalizeAiBaseUrl(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const raw = value.trim();
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `http://${raw}`;

  try {
    const parsed = new URL(withProtocol);
    parsed.pathname = parsed.pathname.replace(/\/+$/, "");
    parsed.search = "";
    parsed.hash = "";
    return parsed.toString().replace(/\/+$/, "");
  } catch {
    return withProtocol.replace(/\/+$/, "");
  }
}

function addAiNginxBaseUrlCandidate(value: string | null): string | null {
  if (!value) return null;

  try {
    const parsed = new URL(value);
    const isHttp = parsed.protocol === "http:" || parsed.protocol === "https:";
    if (!isHttp) return null;

    if (parsed.hostname !== "https://sabi-superapp-api-7srquvexva-ew.a.run.app") return null;

    parsed.port = "";
    parsed.pathname = parsed.pathname.replace(/\/+$/, "");
    parsed.search = "";
    parsed.hash = "";
    return parsed.toString().replace(/\/+$/, "");
  } catch {
    return null;
  }
}

function pushUniqueAiBaseUrl(target: string[], value: unknown, options?: { alsoNginxFallback?: boolean }) {
  const normalized = normalizeAiBaseUrl(value);
  if (!normalized) return;

  const nginxCandidate = options?.alsoNginxFallback === false ? null : addAiNginxBaseUrlCandidate(normalized);

  if (nginxCandidate && !target.includes(nginxCandidate)) {
    target.push(nginxCandidate);
  }

  if (!target.includes(normalized)) {
    target.push(normalized);
  }
}

function getEnvApiBaseUrl(): string | null {
  return (
    normalizeAiBaseUrl(process.env.EXPO_PUBLIC_AI_API_BASE_URL) ||
    normalizeAiBaseUrl(process.env.EXPO_PUBLIC_API_BASE_URL) ||
    normalizeAiBaseUrl(process.env.EXPO_PUBLIC_AUTH_API_BASE_URL) ||
    normalizeAiBaseUrl(process.env.EXPO_PUBLIC_SOCKET_BASE_URL) ||
    SABI_AI_PRODUCTION_API_BASE_URL
  );
}

function getAiMobileServerBaseUrlCandidates(session: AuthSession): string[] {
  const candidates: string[] = [];

  pushUniqueAiBaseUrl(candidates, SABI_AI_PRODUCTION_API_BASE_URL, { alsoNginxFallback: false });
  pushUniqueAiBaseUrl(candidates, process.env.EXPO_PUBLIC_AI_API_BASE_URL);
  pushUniqueAiBaseUrl(candidates, session.apiBaseUrl);
  pushUniqueAiBaseUrl(candidates, process.env.EXPO_PUBLIC_API_BASE_URL);
  pushUniqueAiBaseUrl(candidates, process.env.EXPO_PUBLIC_AUTH_API_BASE_URL);
  pushUniqueAiBaseUrl(candidates, process.env.EXPO_PUBLIC_SOCKET_BASE_URL);

  return candidates;
}

function shouldTryNextAiServerBaseUrl(error: AiMobileApiError): boolean {
  if (!error.status) return true;
  if (error.status === 404 || error.status === 405 || error.status === 502 || error.status === 503 || error.status === 504) return true;

  const normalized = `${error.code} ${error.message}`.toLowerCase();
  return (
    normalized.includes("network") ||
    normalized.includes("failed to fetch") ||
    normalized.includes("connection") ||
    normalized.includes("route_unavailable") ||
    normalized.includes("gateway_unavailable") ||
    normalized.includes("provider_gateway")
  );
}

export function getAiMobileAuthSession(): AuthSession | null {
  const authenticated = getAuthenticatedAuthSession();

  if (authenticated) {
    return {
      apiBaseUrl: authenticated.apiBaseUrl.replace(/\/+$/, ""),
      accessToken: authenticated.accessToken,
      currentUserId: authenticated.currentUserId,
    };
  }

  const state = getAuthSessionState();
  const apiBaseUrl = state.apiBaseUrl || getEnvApiBaseUrl();

  if (!apiBaseUrl) return null;

  return {
    apiBaseUrl: apiBaseUrl.replace(/\/+$/, ""),
    accessToken: state.accessToken,
    currentUserId: state.currentUserId,
  };
}

async function readResponseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

async function requestAiMobile<T>(
  path: string,
  init?: RequestInit,
): Promise<AiMobileApiResult<T>> {
  const session = getAiMobileAuthSession();
  const isFormDataBody = typeof FormData !== "undefined" && init?.body instanceof FormData;

  if (!session?.apiBaseUrl) {
    return {
      ok: false,
      error: makeError("ai_mobile_api_base_url_missing", "AI mobile API base URL is not configured."),
    };
  }

  if (!session.currentUserId) {
    return {
      ok: false,
      error: makeError("ai_mobile_auth_required", "Authenticated user session is required for AI mobile screens."),
    };
  }

  const appLanguage = getAppLanguage();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const baseUrls = getAiMobileServerBaseUrlCandidates(session);
  let lastError: AiMobileApiError | null = null;

  for (const baseUrl of baseUrls) {
    const url = `${baseUrl}${normalizedPath}`;

    try {
      const response = await fetch(url, {
        ...init,
        headers: {
          Accept: "application/json",
          ...(isFormDataBody ? {} : { "Content-Type": "application/json" }),
          "x-user-id": session.currentUserId,
          "x-sabi-user-id": session.currentUserId,
          "x-ai-user-id": session.currentUserId,
          "x-app-language": appLanguage,
          "Accept-Language": appLanguage,
          ...(session.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {}),
          ...normalizeRequestHeaders(init?.headers),
        },
      });

      const body = await readResponseBody(response);

      if (!response.ok) {
        const error = normalizeGatewayError(body, response.status);
        lastError = {
          ...error,
          message: error.message,
        };

        if (shouldTryNextAiServerBaseUrl(error) && baseUrl !== baseUrls[baseUrls.length - 1]) {
          continue;
        }

        return {
          ok: false,
          error: lastError,
        };
      }

      return { ok: true, data: body as T };
    } catch (error) {
      lastError = makeError(
        "ai_mobile_network_error",
        error instanceof Error ? error.message : String(error ?? "network error"),
      );

      if (baseUrl !== baseUrls[baseUrls.length - 1]) {
        continue;
      }
    }
  }

  return {
    ok: false,
    error:
      lastError ??
      makeError(
        "ai_mobile_network_error",
        "Could not connect to the AI server.",
      ),
  };
}

async function ensureAiMobileTranslationConsent(): Promise<void> {
  const session = getAiMobileAuthSession();

  if (!session?.currentUserId) return;

  const result = await requestAiMobile<Record<string, unknown>>(
    `/api/ai/consent/${encodeURIComponent(session.currentUserId)}`,
    {
      method: "PATCH",
      body: JSON.stringify({
        actorType: "user",
        reason: "mobile_explicit_ai_translation_consent",
        consent: {
          readAccessAllowed: true,
          toolExecutionAllowed: true,
          internetSearchAllowed: true,
          memoryWriteAllowed: false,
        },
      }),
    },
  );

  if (!result.ok) {
    console.warn("[sabi-ai:translation] consent sync skipped", result.error.code, result.error.message);
  }
}

function buildDefaultActions() {
  return [
    {
      id: "chat",
      key: "chat",
      title: "AI Chat",
      description: "Assistant conversation screen.",
      route: "/ai/chat" as const,
    },
    {
      id: "voice",
      key: "voice",
      title: "Voice AI",
      description: "Native voice bridge screen.",
      route: "/ai/voice" as const,
    },
    {
      id: "translation",
      key: "translation",
      title: "Realtime translation",
      description: "Text and transcript translation.",
      route: "/ai/translation" as const,
    },
    {
      id: "memory",
      key: "memory",
      title: "Memory",
      description: "Memory and personalization settings.",
      route: "/ai/settings" as const,
    },
    {
      id: "premium",
      key: "premium",
      title: "Premium AI",
      description: "COIN gated AI functions.",
      route: "/ai/premium" as const,
    },
    {
      id: "settings",
      key: "settings",
      title: "AI Settings",
      description: "Provider, permission and safety contracts.",
      route: "/ai/settings" as const,
    },
  ];
}

function localSnapshot(error?: AiMobileApiError | null): AiMobileSnapshot {
  const session = getAiMobileAuthSession();
  const userId = session?.currentUserId ?? null;

  return {
    userId,
    apiBaseUrl: session?.apiBaseUrl ?? null,
    status: error ? "error" : userId ? "limited" : "not_connected",
    statusText:
      error?.message ||
      (userId
        ? "AI mobile foundation is ready, backend snapshot is limited."
        : "Authenticated user session is required."),
    fetchedAt: null,
    source: "local_contract",
    shell: null,
    home: null,
    chat: null,
    voice: null,
    translation: null,
    activity: null,
    settings: null,
    premium: null,
    personalization: null,
    safety: null,
    raw: null,
    capabilities: [
      {
        key: "assistant",
        title: "Assistant brain",
        status: userId ? "limited" : "not_connected",
        description: "AI assistant mobile contract.",
      },
      {
        key: "voice",
        title: "Voice control",
        status: "limited",
        description: "Voice bridge contract.",
      },
      {
        key: "translation",
        title: "Google Translate gateway",
        status: "limited",
        description: "Translation must go through provider gateway.",
      },
      {
        key: "web_search",
        title: "Google Search gateway",
        status: "limited",
        description: "Internet search goes through provider gateway.",
      },
      {
        key: "safety",
        title: "Safety approval",
        status: "limited",
        description: "AI cannot send money/messages or run sensitive actions without confirmation.",
      },
    ],
    quickActions: buildDefaultActions(),
  };
}

function normalizeSnapshot(rawValue: unknown): AiMobileSnapshot {
  const raw = toRecord(rawValue) ?? {};
  const data = toRecord(raw.data) ?? raw;
  const session = getAiMobileAuthSession();

  return {
    userId: toStringValue(data.userId) || session?.currentUserId || null,
    apiBaseUrl: session?.apiBaseUrl ?? null,
    status: normalizeStatus(data.status),
    statusText:
      toStringValue(data.statusText) ||
      toStringValue(data.message) ||
      "AI mobile backend snapshot loaded.",
    fetchedAt: toStringValue(data.fetchedAt) || nowIso(),
    source: "backend",
    shell: toRecord(data.shell),
    home: toRecord(data.home),
    chat: toRecord(data.chat),
    voice: toRecord(data.voice),
    translation: toRecord(data.translation),
    activity: toRecord(data.activity),
    settings: toRecord(data.settings),
    premium: toRecord(data.premium),
    personalization: toRecord(data.personalization),
    safety: toRecord(data.safety),
    raw: data,
    capabilities: localSnapshot().capabilities,
    quickActions: buildDefaultActions(),
  };
}

function mapAssistantModeToFoundationMode(
  mode: AiMobileAssistantMessageInput["assistantMode"],
): AiMobileFoundationMode {
  if (mode === "business") return "business";
  if (mode === "student") return "student";
  if (mode === "applicant") return "abiturient";
  if (mode === "teacher") return "teacher";
  return "general";
}

function mapProviderHint(
  hint?: AiMobileAssistantMessageInput["providerHint"],
): AiMobileProviderHint {
  if (hint === "google_search") return "google_search";
  if (hint === "google_translate") return "google_translate";
  if (hint === "google" || hint === "yandex" || hint === "internal") return hint;
  if (hint === "openai" || hint === "chatgpt") return "yandex";
  return "yandex";
}


function isCompatibilityAssistantRouteError(error: AiMobileApiError): boolean {
  if (error.status === 404 || error.status === 405) return true;
  const normalized = `${error.code} ${error.message}`.toLowerCase();
  return (
    normalized.includes("not_found") ||
    normalized.includes("not found") ||
    normalized.includes("cannot post") ||
    normalized.includes("method not allowed") ||
    normalized.includes("ai_mobile_http_404") ||
    normalized.includes("ai_mobile_http_405")
  );
}


function normalizeConversationHistory(input: AiMobileAssistantMessageInput): Array<{ role: string; text: string; createdAt?: string | null }> {
  return (input.conversationHistory ?? [])
    .filter((item) => item && typeof item.text === "string" && item.text.trim().length > 0)
    .slice(-12)
    .map((item) => ({
      role: item.role,
      text: item.text.trim().slice(0, 900),
      createdAt: typeof item.createdAt === "string" ? item.createdAt : null,
    }));
}

function formatConversationHistoryForPrompt(input: AiMobileAssistantMessageInput): string {
  const history = normalizeConversationHistory(input);
  if (!history.length) return "No previous messages in this mobile chat yet.";

  return history
    .map((item, index) => {
      const role = item.role === "assistant" ? "Sabi AI" : item.role === "user" ? "User" : "System";
      return `${index + 1}. ${role}: ${item.text}`;
    })
    .join("\n");
}

// STEP73A_SELECTED_LANGUAGE_LOCK:
// Normalize the Profile/App language once and pass it through every AI route.
// The assistant must not switch languages based on text auto-detection.
function normalizeAssistantLocale(value: string): string {
  const clean = value.trim().replace(/_/g, "-").toLowerCase();
  if (clean.startsWith("ru")) return "ru";
  if (clean.startsWith("en")) return "en";
  if (clean.startsWith("de")) return "de";
  if (clean.startsWith("uz")) return "uz";
  if (clean.startsWith("tr")) return "tr";
  if (clean.startsWith("kk") || clean.startsWith("kz")) return "kk";
  if (clean.startsWith("zh") || clean === "cn" || clean.startsWith("cmn")) return "zh";
  if (clean.startsWith("fr")) return "fr";
  if (clean.startsWith("es")) return "es";
  if (clean.startsWith("ar")) return "ar";
  if (clean.startsWith("he")) return "he";
  if (clean.startsWith("ja")) return "ja";
  if (clean.startsWith("ko")) return "ko";
  if (clean.startsWith("az")) return "az";
  if (clean.startsWith("tg")) return "tg";
  if (clean.startsWith("tk")) return "tk";
  if (clean.startsWith("ky")) return "ky";
  if (clean.startsWith("uk")) return "uk";
  if (clean.startsWith("be")) return "be";
  if (clean === "fa-af" || clean.startsWith("fa")) return "fa-AF";
  if (clean.startsWith("ps")) return "ps";
  if (clean.startsWith("ur")) return "ur";
  if (clean.startsWith("hi")) return "hi";
  if (clean.startsWith("am")) return "am";
  if (clean.startsWith("af")) return "af";
  if (clean.startsWith("sw")) return "sw";
  return clean || "en";
}

function plainArithmeticGuardLine(userMessage: string): string {
  const message = userMessage.toLowerCase();
  const hasMathSignal =
    /\d+\s*([xС…Г—*В·]|СѓРјРЅРѕР¶|multiply|times|ko['вЂвЂ™`]?paytir|koвЂpaytir|РєСћРїР°Р№С‚РёСЂ)\s*\d+/.test(message) ||
    /СЃРєРѕР»СЊРєРѕ\s+Р±СѓРґРµС‚\s+\d+/.test(message) ||
    /what\s+is\s+\d+/.test(message) ||
    /\d+\s*(\+|-|в€’|Г·|\/|:)\s*\d+/.test(message);
  const hasCurrencySignal = /(РґРѕР»Р»Р°СЂ|dollar|usd|СЃСѓРј|so['вЂвЂ™`]?m|СЂСѓР±|ruble|eur|РµРІСЂРѕ|money|С†РµРЅР°|СЃС‚РѕРёРј|price|cost|РєРѕС€РµР»|wallet|coin|pay|РѕРїР»Р°С‚)/.test(message);

  if (!hasMathSignal || hasCurrencySignal) {
    return "For calculations, preserve the unit only when the user explicitly gave a unit.";
  }

  return "CRITICAL arithmetic rule for the current message: this is a plain math/calculation request, not a money request. Do NOT add dollars, USD, sums, rubles, coins, prices, wallet wording, or any currency unit. For multiplication, answer with the equation and number only, for example: 7 Г— 8 = 56.";
}

function buildSabiAssistantQualityPrompt(input: AiMobileAssistantMessageInput, locale: string): string {
  const userMessage = input.message.trim();
  const assistantMode = input.assistantMode ?? "chatgpt";
  const normalizedLocale = normalizeAssistantLocale(locale);
  const clientCapabilities = (input.clientCapabilities ?? []).filter(Boolean).join(", ") || "mobile app navigation, chat, translation, search, profile, wallet, QR";
  const conversationHistory = formatConversationHistoryForPrompt(input);
  const voiceSurface = String(input.source || "").includes("voice");
  const webSearchLine = input.webSearchEnabled
    ? "When the user asks for current internet/media/movie/news information, use the server provider if it is available. If live search is unavailable, say so honestly without faking results."
    : "Do not pretend live internet search was performed when search is not enabled by the backend.";
  const responseLengthLine = voiceSurface
    ? "For voice responses, sound natural and human: usually 2-5 useful sentences. Do not answer like a robot, but do not make long lectures unless the user asks for detail."
    : "For text chat responses, be more complete and human: give the direct answer first, then useful context, examples, or next steps when helpful.";
  const languageLine = [
    `Selected app/profile locale is ${locale}. Normalized assistant locale is ${normalizedLocale}.`,
    "Strict language lock: answer ONLY in the selected app/profile language.",
    "Do not switch languages because the user says Sabi, uses Latin letters, or includes a foreign brand name.",
    "Do not mix Russian, English, Uzbek, Kazakh, Turkish, Chinese or any other language unless the user explicitly asks for translation.",
    "Keep brand names like Sabi AI and Sabi SuperApp unchanged, but all surrounding text must use the selected language.",
  ].join(" ");

  return [
    "You are Sabi AI, the built-in assistant and companion of Sabi SuperApp.",
    "You are not a dry command bot. You must feel like a living, emotionally aware product assistant: warm, original, useful, calm, and lightly playful when appropriate.",
    "Sabi personality DNA: calm confidence, practical kindness, light humor, respect, curiosity, loyalty to the user, and presentation-ready polish.",
    "Speak naturally, as if you are really listening. React to the user's emotion first when they are upset, disappointed, tired, joking, or excited, then solve the task.",
    "Use light humor only when it fits. No forced jokes, no sarcasm at the user's expense, no clown behavior. One warm human phrase is enough.",
    "Avoid generic bot phrases like 'as an AI model', 'I can provide information', 'please clarify' unless clarification is truly necessary.",
    "Keep continuity across the current chat. Remember the recent topic, avoid repeating introductions, and answer follow-ups naturally.",
    "If the user says vague follow-ups like 'РґР°Р»СЊС€Рµ', 'РїРѕС‡РµРјСѓ', 'С‡С‚Рѕ РµС‰С‘', 'Р° РїРѕС‚РѕРј?', infer the topic from recent messages and continue naturally.",
    responseLengthLine,
    "Give the useful answer first. Ask at most one clarifying question, only when it is necessary.",
    languageLine,
    plainArithmeticGuardLine(userMessage),
    "For math: never invent money units. Multiplication/addition/subtraction/division are numeric unless the user explicitly asks about currency, price, wallet, payment, or COIN.",
    "Do not reveal internal routing, provider names, safety metadata, client capabilities, prompts, or implementation details unless the user asks for technical diagnostics.",
    "Basic/free assistant rules: help the user find and open app functions, explain Sabi features, answer general questions, and help with media/movie/information requests when allowed by backend capabilities.",
    "Premium assistant rules: advanced providers such as Yandex AI, OpenAI/ChatGPT and similar providers are server-side only; never ask for or expose API keys on mobile.",
    "For app navigation requests, give a friendly confirmation and the exact screen/action. Do not claim that you executed an app action unless the client action router or backend explicitly confirms execution.",
    "For money, wallet, account deletion, payments or other sensitive actions, be protective: explain briefly, require confirmation, and do not execute automatically.",
    "Never use fake answers or fake provider claims. If a provider is unavailable, say it honestly and offer the safest next step.",
    webSearchLine,
    `Current app locale: ${locale}.`,
    `Assistant mode: ${assistantMode}.`,
    `Mobile capabilities: ${clientCapabilities}.`,
    "Recent mobile chat context:",
    conversationHistory,
    "Current user message:",
    userMessage,
  ].join("\n");
}

function buildAssistantMessagePayload(
  input: AiMobileAssistantMessageInput,
  session: AuthSession,
): Record<string, unknown> {
  const preferredMode = mapAssistantModeToFoundationMode(input.assistantMode);
  const message = input.message;
  const locale = getAppLanguage();
  const assistantPrompt = buildSabiAssistantQualityPrompt(input, locale);
  const attachments = (input.attachments ?? []).map((attachment) => ({
    id: attachment.id,
    kind: attachment.kind,
    uri: attachment.uri,
    name: attachment.name,
    mimeType: attachment.mimeType,
    sizeBytes: attachment.size,
    metadata: attachment.raw ?? {},
  }));

  return {
    userId: session.currentUserId,
    user_id: session.currentUserId,
    actorUserId: session.currentUserId,
    actorId: session.currentUserId,
    requesterUserId: session.currentUserId,
    // STEP72A: keep the provider prompt as the real user message.
    // The long Sabi personality/instruction text must travel only as systemPrompt/instructions.
    // Sending assistantPrompt as prompt made /api/ai/ask answer the instruction block instead of the user.
    prompt: message,
    message,
    question: message,
    input: message,
    text: message,
    userMessage: message,
    originalMessage: message,
    systemPrompt: assistantPrompt,
    instructions: assistantPrompt,
    assistantQualityProfile: {
      name: "Sabi AI",
      answerStyle: "direct_useful_assistant",
      basicTier: true,
      premiumTierServerSideOnly: true,
      fakeAnswersAllowed: false,
      mobileSecretsAllowed: false,
    },
    locale,
    language: locale,
    targetLanguage: locale,
    responseLanguage: locale,
    selectedAppLanguage: locale,
    source: input.source ?? "text",
    surface: String(input.source || "").includes("voice") ? "assistant_voice" : "assistant_chat",
    mode: preferredMode,
    preferredMode,
    assistantMode: input.assistantMode ?? "chatgpt",
    provider: "yandex",
    preferredProvider: "yandex",
    providerHint: "yandex",
    attemptedProviders: ["yandex"],
    gatewayRequired: true,
    allowFallback: false,
    fakeFallbackAllowed: false,
    mobileSecretsAllowed: false,
    webSearchEnabled: Boolean(input.webSearchEnabled),
    voiceControlEnabled: Boolean(input.voiceOutput?.enabled),
    attachments,
    conversationHistory: normalizeConversationHistory(input),
    clientCapabilities: input.clientCapabilities ?? [],
    autoExecute: false,
    client: "mobile",
    version: AI_MOBILE_API_VERSION,
    metadata: {
      safetyPolicy: input.safetyPolicy,
      providerRoute: input.providerRoute,
      safetyApproval: input.safetyApproval,
      voiceOutput: input.voiceOutput,
      selectedAppLanguage: locale,
      responseLanguage: locale,
      arithmeticCurrencyGuard: true,
    },
  };
}

function buildAssistantRoutePayload(
  route: (typeof AI_ASSISTANT_LIVE_ROUTES)[number],
  payload: Record<string, unknown>,
): Record<string, unknown> {
  if (route === "/api/ai/ask") {
    const userMessage =
      toStringValue(payload.originalMessage) ||
      toStringValue(payload.userMessage) ||
      toStringValue(payload.message) ||
      toStringValue(payload.prompt) ||
      "";

    return {
      ...payload,
      userId: payload.userId,
      user_id: payload.userId,
      actorUserId: payload.actorUserId ?? payload.userId,
      // STEP72A: /api/ai/ask must receive the actual user request as prompt/message.
      // The Sabi personality text remains in systemPrompt/instructions.
      prompt: userMessage,
      message: userMessage,
      question: userMessage,
      text: userMessage,
      input: userMessage,
      userMessage,
      originalMessage: userMessage,
      systemPrompt: payload.systemPrompt,
      instructions: payload.instructions,
      provider: "yandex",
      preferredProvider: "yandex",
      providerHint: "yandex",
      providerKey: "yandex",
    };
  }

  if (route === "/api/ai/mobile-ui/assistant/message") {
    const userMessage =
      toStringValue(payload.originalMessage) ||
      toStringValue(payload.userMessage) ||
      toStringValue(payload.message) ||
      toStringValue(payload.prompt) ||
      "";

    return {
      ...payload,
      prompt: userMessage,
      message: userMessage,
      question: userMessage,
      text: userMessage,
      input: userMessage,
      userMessage,
      originalMessage: userMessage,
      systemPrompt: payload.systemPrompt,
      instructions: payload.instructions,
      provider: "yandex",
      preferredProvider: "yandex",
      providerHint: "yandex",
      providerKey: "yandex",
      surface: payload.surface ?? "assistant_voice",
    };
  }

  return {
    ...payload,
    provider: "yandex",
    preferredProvider: "yandex",
    providerHint: "yandex",
    providerKey: "yandex",
  };
}

async function requestAssistantLiveRoute(
  route: (typeof AI_ASSISTANT_LIVE_ROUTES)[number],
  payload: Record<string, unknown>,
): Promise<AiMobileApiResult<Record<string, unknown>>> {
  const result = await requestAiMobile<Record<string, unknown>>(route, {
    method: "POST",
    body: JSON.stringify(buildAssistantRoutePayload(route, payload)),
  });

  if (!result.ok) return result;

  const data = toRecord(result.data) ?? { value: result.data };
  return {
    ok: true,
    data: {
      ...data,
      mobileAssistantRoute: route,
      fakeFallbackAllowed: false,
      mobileSecretsAllowed: false,
    },
  };
}

async function sendAssistantMessageThroughLiveRoutes(
  input: AiMobileAssistantMessageInput,
  session: AuthSession,
): Promise<AiMobileApiResult<Record<string, unknown>>> {
  const payload = buildAssistantMessagePayload(input, session);
  let lastCompatibilityError: AiMobileApiError | null = null;

  for (const route of AI_ASSISTANT_LIVE_ROUTES) {
    const result = await requestAssistantLiveRoute(route, payload);

    if (result.ok) return result;

    if (!isCompatibilityAssistantRouteError(result.error)) {
      return result;
    }

    lastCompatibilityError = result.error;
  }

  return {
    ok: false,
    error:
      lastCompatibilityError ??
      makeError(
        "ai_assistant_route_unavailable",
        "AI assistant route is not available on the server.",
      ),
  };
}

function buildSafetyCategory(message: string): string {
  const lowered = message.toLowerCase();

  if (
    lowered.includes("send money") ||
    lowered.includes("transfer money") ||
    lowered.includes("pay") ||
    lowered.includes("РїРµСЂРµРІРµРґРё РґРµРЅСЊРіРё") ||
    lowered.includes("РѕС‚РїСЂР°РІСЊ РґРµРЅСЊРіРё") ||
    lowered.includes("РѕРїР»Р°С‚")
  ) {
    return "money_movement";
  }

  if (
    lowered.includes("send coin") ||
    lowered.includes("coin transfer") ||
    lowered.includes("РѕС‚РїСЂР°РІСЊ РєРѕРёРЅ") ||
    lowered.includes("РїРµСЂРµРІРµРґРё coin")
  ) {
    return "coin_movement";
  }

  if (
    lowered.includes("send message") ||
    lowered.includes("message to") ||
    lowered.includes("РѕС‚РїСЂР°РІСЊ СЃРѕРѕР±С‰РµРЅРёРµ") ||
    lowered.includes("РЅР°РїРёС€Рё РІ С‡Р°С‚")
  ) {
    return "message_send";
  }

  if (
    lowered.includes("delete account") ||
    lowered.includes("remove account") ||
    lowered.includes("СѓРґР°Р»РёС‚СЊ Р°РєРєР°СѓРЅС‚") ||
    lowered.includes("СѓРґР°Р»Рё Р°РєРєР°СѓРЅС‚")
  ) {
    return "account_delete";
  }

  if (
    lowered.includes("logout") ||
    lowered.includes("sign out") ||
    lowered.includes("log out") ||
    lowered.includes("РІС‹Р№С‚Рё РёР· Р°РєРєР°СѓРЅС‚Р°")
  ) {
    return "account_security";
  }

  if (lowered.includes("settings") || lowered.includes("РЅР°СЃС‚СЂРѕР№")) {
    return "settings_change";
  }

  return "read_only";
}

function normalizeProviderRoute(rawValue: unknown): AiMobileProviderRoute | null {
  const raw = toRecord(rawValue);
  if (!raw) return null;

  const data = toRecord(raw.data) ?? raw;

  return {
    kind: (toStringValue(data.kind) as AiMobileProviderRouteKind | null) || "assistant",
    provider: toStringValue(data.provider) || "yandex",
    label: toStringValue(data.label) || "Yandex GPT",
    status: toStringValue(data.status) || "unconfigured",
    configured: Boolean(data.configured),
    requiresGateway: Boolean(data.requiresGateway),
    safeForMobile: typeof data.safeForMobile === "boolean" ? data.safeForMobile : false,
    reason: toStringValue(data.reason) || undefined,
    raw: data,
  };
}

function normalizeSafetyApproval(
  rawValue: unknown,
  fallbackCategory = "read_only",
): AiMobileSafetyApprovalDecision {
  const raw = toRecord(rawValue);
  const data = raw ? toRecord(raw.data) ?? raw : {};

  return {
    policyVersion: toStringValue(data.policyVersion) || "AI-29.3",
    category: toStringValue(data.category) || fallbackCategory,
    riskLevel:
      (toStringValue(data.riskLevel) as AiMobileSafetyApprovalDecision["riskLevel"] | null) ||
      "none",
    allowed: typeof data.allowed === "boolean" ? data.allowed : true,
    autoExecuteAllowed:
      typeof data.autoExecuteAllowed === "boolean" ? data.autoExecuteAllowed : false,
    requiresConfirmation:
      typeof data.requiresConfirmation === "boolean"
        ? data.requiresConfirmation
        : fallbackCategory !== "read_only",
    requiresTargetModuleConfirmation:
      typeof data.requiresTargetModuleConfirmation === "boolean"
        ? data.requiresTargetModuleConfirmation
        : fallbackCategory !== "read_only",
    blockedReason: toStringValue(data.blockedReason),
    confirmationReason: toStringValue(data.confirmationReason),
    warnings: toArray(data.warnings)
      .map((item) => toStringValue(item))
      .filter((item): item is string => Boolean(item)),
    raw: data,
  };
}

function normalizeTranslationResult(
  rawValue: unknown,
  fallback: {
    targetLanguage: string;
    sourceLanguage?: string | null;
    sourceText?: string | null;
    imageUri?: string | null;
    inputKind?: "text" | "camera" | "photo" | "messenger_contract";
  },
): AiMobileTranslationResult {
  const root = toRecord(rawValue) ?? {};
  const data = toRecord(root.data) ?? root;
  const result = toRecord(data.result) ?? data;

  return {
    translatedText:
      toStringValue(result.translatedText) ||
      toStringValue(result.translation) ||
      toStringValue(result.textTranslated) ||
      toStringValue(result.result) ||
      toStringValue(data.translatedText) ||
      null,
    sourceLanguage:
      toStringValue(result.sourceLanguage) ||
      toStringValue(result.detectedSourceLanguage) ||
      fallback.sourceLanguage ||
      "auto",
    targetLanguage: toStringValue(result.targetLanguage) || fallback.targetLanguage,
    provider: toStringValue(result.provider) || toStringValue(data.provider) || "google",
    inputKind: fallback.inputKind,
    sourceText:
      fallback.sourceText ??
      toStringValue(result.sourceText) ??
      toStringValue(result.ocrText) ??
      toStringValue(result.extractedText) ??
      null,
    imageUri: fallback.imageUri ?? null,
    raw: result,
  };
}

function normalizeVoiceSession(
  rawValue: unknown,
  fallbackStatus: AiMobileConnectionStatus = "ready",
): AiMobileVoiceSession {
  const raw = toRecord(rawValue);
  const data = raw ? toRecord(raw.data) ?? raw : {};

  return {
    sessionId: toStringValue(data.sessionId) || toStringValue(data.id) || createAiMobileId("ai_voice_session"),
    status: normalizeStatus(data.status ?? fallbackStatus),
    stateText: toStringValue(data.stateText) || toStringValue(data.statusText) || "Voice session ready.",
    nativeBridgeStatus: normalizeStatus(data.nativeBridgeStatus ?? data.bridgeStatus ?? "ready"),
    raw: data,
  };
}

export async function getAiProviderGatewayManifest(): Promise<AiMobileApiResult<AiProviderGatewayManifest>> {
  const result = await requestAiMobile<unknown>(AI_PROVIDER_GATEWAY_ROUTES.manifest);

  if (!result.ok) return result;

  return {
    ok: true,
    data: normalizeProviderGatewayManifest(result.data),
  };
}

export async function getAiMobileSnapshot(): Promise<AiMobileSnapshot> {
  const session = getAiMobileAuthSession();

  if (!session?.currentUserId) return localSnapshot();

  const [snapshotResult, manifestResult] = await Promise.all([
    requestAiMobile<unknown>(
      `/api/ai/mobile-ui/${encodeURIComponent(session.currentUserId)}/snapshot?surface=home`,
    ),
    getAiProviderGatewayManifest(),
  ]);

  const snapshot = snapshotResult.ok ? normalizeSnapshot(snapshotResult.data) : localSnapshot(snapshotResult.error);

  return mergeProviderGatewayManifest(snapshot, manifestResult);
}

export async function getAiMobileChatSnapshot(): Promise<AiMobileSnapshot> {
  const session = getAiMobileAuthSession();

  if (!session?.currentUserId) return localSnapshot();

  const [snapshotResult, manifestResult] = await Promise.all([
    requestAiMobile<unknown>(
      `/api/ai/mobile-ui/${encodeURIComponent(session.currentUserId)}/snapshot?surface=assistant_chat`,
    ),
    getAiProviderGatewayManifest(),
  ]);

  const snapshot = snapshotResult.ok ? normalizeSnapshot(snapshotResult.data) : localSnapshot(snapshotResult.error);

  return mergeProviderGatewayManifest(snapshot, manifestResult);
}

export function getAiMobileActivityItems(
  snapshot?: AiMobileSnapshot | null,
  kind?: string,
): AiMobileListItem[] {
  const source = snapshot ?? localSnapshot();
  const rawRoot = toRecord(source.raw) ?? {};
  const raw = toRecord(source.activity) ?? toRecord(rawRoot.activity) ?? {};
  const history = toArray(raw.historyPreview ?? raw.history ?? rawRoot.historyPreview);
  const tasks = toArray(raw.taskPreview ?? raw.tasks ?? rawRoot.taskPreview);

  const historyItems: AiMobileListItem[] = history.map((item, index) => {
    const record = toRecord(item) ?? {};
    const id = toStringValue(record.id) || `history_${index + 1}`;

    return {
      id,
      title: toStringValue(record.title) || `AI activity ${index + 1}`,
      description:
        toStringValue(record.description) ||
        toStringValue(record.kind) ||
        "AI activity item",
      meta: toStringValue(record.createdAt) || undefined,
      status: toStringValue(record.status) || undefined,
      raw: record,
    };
  });

  const taskItems: AiMobileListItem[] = tasks.map((item, index) => {
    const record = toRecord(item) ?? {};
    const id = toStringValue(record.id) || `task_${index + 1}`;

    return {
      id,
      title: toStringValue(record.title) || `AI task ${index + 1}`,
      description:
        toStringValue(record.description) ||
        toStringValue(record.status) ||
        "AI task item",
      meta: toStringValue(record.createdAt) || undefined,
      status: toStringValue(record.status) || undefined,
      raw: record,
    };
  });

  if (kind === "history") return historyItems;
  if (kind === "tasks" || kind === "task") return taskItems;

  return [...historyItems, ...taskItems];
}

export function getAiMobilePrivacyMode(snapshot?: AiMobileSnapshot | null): AiMobilePrivacyMode {
  const raw = toRecord(snapshot?.personalization) ?? toRecord(snapshot?.settings) ?? {};
  const mode = toStringValue(raw.privacyMode) || toStringValue(raw.mode);

  if (mode === "strict" || mode === "balanced" || mode === "adaptive") return mode;

  return "balanced";
}


function normalizeTranslationTextForComparison(value: string): string {
  return value
    .toLowerCase()
    .replace(/[\s\u200B-\u200D\uFEFF]+/g, "")
    .replace(/[.,!?;:'"`вЂ™вЂвЂњвЂќ()\[\]{}<>В«В»]/g, "")
    .trim();
}

function looksLikeNonSemanticTranslation(sourceText: string, translatedText: string, targetLanguage: string, sourceLanguage?: string | null): boolean {
  const source = normalizeTranslationTextForComparison(sourceText);
  const translated = normalizeTranslationTextForComparison(translatedText);

  if (!source || !translated) return false;
  if (source === translated && targetLanguage !== (sourceLanguage || "auto")) return true;

  const sourceLetters = source.replace(/[^a-zР°-СЏС‘С–С—С”Т“Т›СћТіКј']/gi, "");
  const translatedLetters = translated.replace(/[^a-zР°-СЏС‘С–С—С”Т“Т›СћТіКј']/gi, "");
  if (!sourceLetters || !translatedLetters) return false;

  const minLength = Math.min(sourceLetters.length, translatedLetters.length);
  if (minLength < 4) return false;

  let samePosition = 0;
  for (let index = 0; index < minLength; index += 1) {
    if (sourceLetters[index] === translatedLetters[index]) samePosition += 1;
  }

  return samePosition / minLength > 0.82 && Math.abs(sourceLetters.length - translatedLetters.length) <= 2;
}

function buildStrictTranslationPrompt(input: {
  text: string;
  targetLanguage: string;
  sourceLanguage?: string | null;
}): string {
  const sourceLanguage = input.sourceLanguage && input.sourceLanguage !== "auto" ? input.sourceLanguage : "auto-detect";
  return [
    "You are Sabi AI translation engine.",
    "Translate the user's text semantically. Do not transliterate. Do not rewrite the same letters in another alphabet.",
    "Return only the translated text, without explanations, quotes, labels, notes or language names.",
    `Source language: ${sourceLanguage}.`,
    `Target language: ${input.targetLanguage}.`,
    "Text to translate:",
    input.text,
  ].join("\n");
}

async function translateTextViaStrictAssistantFallback(input: {
  text: string;
  targetLanguage: string;
  sourceLanguage?: string | null;
  session: AuthSession;
}): Promise<AiMobileApiResult<AiMobileTranslationResult>> {
  const prompt = buildStrictTranslationPrompt(input);
  const result = await requestAiMobile<Record<string, unknown>>("/api/ai/ask", {
    method: "POST",
    body: JSON.stringify({
      userId: input.session.currentUserId,
      user_id: input.session.currentUserId,
      actorUserId: input.session.currentUserId,
      message: prompt,
      prompt,
      text: prompt,
      question: prompt,
      input: prompt,
      provider: "yandex",
      preferredProvider: "yandex",
      providerHint: "yandex",
      providerKey: "yandex",
      allowFallback: false,
      fakeFallbackAllowed: false,
      mobileSecretsAllowed: false,
      surface: "ai_strict_translation_fallback",
      client: "mobile",
      version: AI_MOBILE_API_VERSION,
    }),
  });

  if (!result.ok) return { ok: false, error: result.error };

  const root = toRecord(result.data) ?? {};
  const data = toRecord(root.data) ?? root;
  const answer = toRecord(data.answer) ?? {};
  const translatedText =
    toStringValue(answer.text) ||
    toStringValue(data.text) ||
    toStringValue(data.answer) ||
    toStringValue(data.reply) ||
    toStringValue(data.result) ||
    null;

  if (!translatedText) {
    return {
      ok: false,
      error: makeError("ai_mobile_translation_missing_result", "Provider did not return translated text."),
    };
  }

  return {
    ok: true,
    data: {
      translatedText,
      sourceLanguage: input.sourceLanguage || "auto",
      targetLanguage: input.targetLanguage,
      provider: "yandex",
      inputKind: "text",
      sourceText: input.text,
      imageUri: null,
      raw: data,
    },
  };
}

async function requestAiTextTranslationRoute(input: {
  route: string;
  text: string;
  targetLanguage: string;
  sourceLanguage?: string | null;
  session: AuthSession;
}): Promise<AiMobileApiResult<AiMobileTranslationResult>> {
  const result = await requestAiMobile<Record<string, unknown>>(input.route, {
    method: "POST",
    body: JSON.stringify({
      userId: input.session.currentUserId,
      user_id: input.session.currentUserId,
      actorUserId: input.session.currentUserId,
      requesterUserId: input.session.currentUserId,
      contentType: "text",
      inputKind: "text",
      text: input.text,
      sourceText: input.text,
      sourceLanguage: input.sourceLanguage && input.sourceLanguage !== "auto" ? input.sourceLanguage : "auto",
      targetLanguage: input.targetLanguage,
      surface: "ai_text_translation",
      client: "mobile",
      version: AI_MOBILE_API_VERSION,
      preferredProvider: "yandex",
      provider: "yandex",
      providerHint: "yandex",
      providerKey: "yandex",
      gatewayRequired: true,
      allowFallback: false,
      fakeFallbackAllowed: false,
      mobileSecretsAllowed: false,
      preserveFormatting: true,
      semanticTranslation: true,
      strictTranslation: true,
      transliterationAllowed: false,
      returnOnlyTranslatedText: true,
    }),
  });

  if (!result.ok) return { ok: false, error: result.error };

  const responseRecord = toRecord(result.data) ?? {};
  const dataRecord = toRecord(responseRecord.data) ?? responseRecord;
  const data = toRecord(dataRecord.result) ?? dataRecord;
  const normalized = normalizeTranslationResult(data, {
    targetLanguage: input.targetLanguage,
    sourceLanguage: input.sourceLanguage,
    sourceText: input.text,
    inputKind: "text",
  });

  if (!normalized.translatedText) {
    return {
      ok: false,
      error: makeError(
        "ai_mobile_translation_missing_result",
        "Provider gateway did not return translated text.",
      ),
    };
  }

  return { ok: true, data: normalized };
}

export const aiMobileApi = {
  getSnapshot: getAiMobileSnapshot,
  getChatSnapshot: getAiMobileChatSnapshot,
  getProviderGatewayManifest: getAiProviderGatewayManifest,

  resolveProviderRoute: async (input: {
    kind?: AiMobileProviderRouteKind;
    mode?: AiMobileFoundationMode;
    providerHint?: AiMobileProviderHint | string;
  }): Promise<AiMobileApiResult<AiMobileProviderRoute>> => {
    const session = getAiMobileAuthSession();

    if (!session?.currentUserId) {
      return {
        ok: false,
        error: makeError("ai_mobile_auth_required", "Authenticated AI user is required."),
      };
    }

    const kind = input.kind ?? "assistant";
    const preferredProvider =
      input.providerHint === "google_search" || input.providerHint === "google_translate"
        ? "google"
        : input.providerHint === "yandex"
          ? "yandex"
          : input.providerHint === "internal"
            ? "internal"
            : "yandex";

    const result = await requestAiMobile<unknown>("/api/ai/providers/resolve", {
      method: "POST",
      body: JSON.stringify({
        userId: session.currentUserId,
        kind,
        mode: input.mode ?? "general",
        preferredProvider,
        providerHint: input.providerHint ?? "yandex",
      }),
    });

    if (!result.ok) {
      return {
        ok: true,
        data: {
          kind,
          provider: preferredProvider,
          label: preferredProvider === "yandex" ? "Yandex GPT" : preferredProvider === "google" ? "Google" : preferredProvider === "internal" ? "Internal AI" : "Server AI",
          status: "unconfigured",
          configured: false,
          requiresGateway: preferredProvider !== "internal",
          safeForMobile: false,
          reason: result.error.message,
          raw: null,
        },
      };
    }

    return {
      ok: true,
      data:
        normalizeProviderRoute(result.data) || {
          kind,
          provider: preferredProvider,
          label: preferredProvider === "yandex" ? "Yandex GPT" : preferredProvider === "google" ? "Google" : preferredProvider === "internal" ? "Internal AI" : "Server AI",
          status: "unconfigured",
          configured: false,
          requiresGateway: preferredProvider !== "internal",
          safeForMobile: false,
          raw: null,
        },
    };
  },

  evaluateSafetyApproval: async (input: {
    prompt?: string;
    source?: string;
    requestedAutoExecute?: boolean;
    metadata?: Record<string, unknown>;
  }): Promise<AiMobileApiResult<AiMobileSafetyApprovalDecision>> => {
    const session = getAiMobileAuthSession();
    const prompt = input.prompt ?? "";
    const category = buildSafetyCategory(prompt);

    if (!session?.currentUserId) {
      return { ok: true, data: normalizeSafetyApproval(null, category) };
    }

    const result = await requestAiMobile<unknown>("/api/ai/approval/evaluate", {
      method: "POST",
      body: JSON.stringify({
        userId: session.currentUserId,
        prompt,
        category,
        source: input.source ?? "text",
    surface: String(input.source || "").includes("voice") ? "assistant_voice" : "assistant_chat",
        requestedAutoExecute: input.requestedAutoExecute ?? false,
        metadata: input.metadata ?? {},
      }),
    });

    if (!result.ok) return { ok: true, data: normalizeSafetyApproval(null, category) };

    return { ok: true, data: normalizeSafetyApproval(result.data, category) };
  },

  sendAssistantMessage: async (
    input: AiMobileAssistantMessageInput,
  ): Promise<AiMobileApiResult<Record<string, unknown>>> => {
    const session = getAiMobileAuthSession();

    if (!session?.currentUserId) {
      return {
        ok: false,
        error: makeError("ai_mobile_auth_required", "Authenticated AI user is required."),
      };
    }

    return sendAssistantMessageThroughLiveRoutes(input, session);
  },

  translateText: async (
    text: string,
    targetLanguage: string,
    sourceLanguage?: string | null,
  ): Promise<AiMobileApiResult<AiMobileTranslationResult>> => {
    const session = getAiMobileAuthSession();

    if (!session?.currentUserId) {
      return {
        ok: false,
        error: makeError("ai_mobile_auth_required", "Authenticated AI user is required."),
      };
    }

    const cleanText = String(text || "").trim();
    const cleanTargetLanguage = String(targetLanguage || "").trim();
    const cleanSourceLanguage = sourceLanguage && sourceLanguage !== "auto" ? String(sourceLanguage).trim() : null;

    if (!cleanText) {
      return {
        ok: false,
        error: makeError("ai_mobile_translation_empty_text", "Text is required for translation."),
      };
    }

    if (!cleanTargetLanguage) {
      return {
        ok: false,
        error: makeError("ai_mobile_translation_target_required", "Target language is required for translation."),
      };
    }

    await ensureAiMobileTranslationConsent();

    const routes = [
      AI_PROVIDER_GATEWAY_ROUTES.textTranslation,
      AI_PROVIDER_GATEWAY_ROUTES.textTranslationRealtimeFallback,
    ];
    let lastError: AiMobileApiError | null = null;

    for (const route of routes) {
      const result = await requestAiTextTranslationRoute({
        route,
        text: cleanText,
        targetLanguage: cleanTargetLanguage,
        sourceLanguage: cleanSourceLanguage,
        session,
      });

      if (!result.ok) {
        lastError = result.error;
        if (!shouldTryNextAiServerBaseUrl(result.error) && result.error.status !== 404 && result.error.status !== 405) {
          break;
        }
        continue;
      }

      if (!looksLikeNonSemanticTranslation(cleanText, result.data.translatedText || "", cleanTargetLanguage, cleanSourceLanguage)) {
        return result;
      }

      lastError = makeError(
        "ai_mobile_translation_looks_like_transliteration",
        "Provider returned transliteration instead of semantic translation.",
      );
    }

    const strictFallback = await translateTextViaStrictAssistantFallback({
      text: cleanText,
      targetLanguage: cleanTargetLanguage,
      sourceLanguage: cleanSourceLanguage,
      session,
    });

    if (strictFallback.ok && !looksLikeNonSemanticTranslation(cleanText, strictFallback.data.translatedText || "", cleanTargetLanguage, cleanSourceLanguage)) {
      return strictFallback;
    }

    if (strictFallback.ok) return strictFallback;

    return {
      ok: false,
      error:
        strictFallback.error ||
        lastError ||
        makeError("ai_mobile_translation_unavailable", "AI translation is unavailable right now."),
    };
  },

  translateImage: async (
    input: AiMobileTranslationImageInput,
  ): Promise<AiMobileApiResult<AiMobileTranslationResult>> => {
    const session = getAiMobileAuthSession();

    if (!session?.currentUserId) {
      return {
        ok: false,
        error: makeError("ai_mobile_auth_required", "Authenticated AI user is required."),
      };
    }

    if (!input.imageUri?.trim()) {
      return {
        ok: false,
        error: makeError("ai_mobile_image_uri_required", "Image URI is required for OCR translation."),
      };
    }

    const imageUri = input.imageUri.trim();
    const fileName = normalizeImageFileName(input.fileName, imageUri);
    const mimeType = normalizeImageMimeType(input.mimeType, fileName);

    const form = new FormData();
    form.append("userId", session.currentUserId);
    form.append("contentType", "image");
    form.append("imageUri", imageUri);
    form.append("fileName", fileName);
    form.append("mimeType", mimeType);
    form.append("targetLanguage", input.targetLanguage);
    form.append("sourceLanguage", input.sourceLanguage && input.sourceLanguage !== "auto" ? input.sourceLanguage : "auto");
    form.append("providerHint", "google_translate");
    form.append("preferredProvider", "google");
    form.append("gatewayRequired", "true");
    form.append("allowFallback", "false");
    form.append("surface", input.inputKind === "camera" ? "ai_camera_translation" : "ai_photo_translation");
    form.append("client", "mobile");
    form.append("version", AI_MOBILE_API_VERSION);
    form.append("image", {
      uri: imageUri,
      name: fileName,
      type: mimeType,
    } as unknown as Blob);

    const result = await requestAiMobile<Record<string, unknown>>(AI_PROVIDER_GATEWAY_ROUTES.imageTranslation, {
      method: "POST",
      body: form,
    });

    if (!result.ok) return { ok: false, error: result.error };

    const responseRecord = toRecord(result.data) ?? {};
    const dataRecord = toRecord(responseRecord.data) ?? responseRecord;
    const data = toRecord(dataRecord.result) ?? dataRecord;
    const normalized = normalizeTranslationResult(data, {
      targetLanguage: input.targetLanguage,
      sourceLanguage: input.sourceLanguage,
      imageUri,
      inputKind: input.inputKind,
    });

    if (!normalized.translatedText) {
      return {
        ok: false,
        error: makeError(
          "ai_mobile_image_translation_missing_result",
          "Provider gateway did not return translated text for image OCR translation.",
        ),
      };
    }

    return { ok: true, data: normalized };
  },

  bindNativeVoiceBridge: async (
    input?: Record<string, unknown>,
  ): Promise<AiMobileApiResult<Record<string, unknown>>> => {
    const session = getAiMobileAuthSession();

    if (!session?.currentUserId) {
      return {
        ok: false,
        error: makeError("ai_mobile_auth_required", "Authenticated AI user is required for voice recording."),
      };
    }

    const result = await requestAiMobile<Record<string, unknown>>("/api/ai/voice/bridge/bind", {
      method: "POST",
      body: JSON.stringify({
        userId: session.currentUserId,
        ...(input ?? {}),
      }),
    });

    if (result.ok) return result;

    const health = await requestAiMobile<Record<string, unknown>>("/api/ai/voice/health");
    if (health.ok) {
      return {
        ok: true,
        data: {
          status: "ready",
          voiceProviderReady: true,
          bridgeBindRoute: "skipped_after_health_ready",
          input: input ?? null,
          health: health.data,
        },
      };
    }

    return result;
  },

  sendNativeVoiceEvent: async (
    input?: Record<string, unknown>,
  ): Promise<AiMobileApiResult<Record<string, unknown>>> => {
    const session = getAiMobileAuthSession();

    if (!session?.currentUserId) {
      return {
        ok: false,
        error: makeError("ai_mobile_auth_required", "Authenticated AI user is required for voice events."),
      };
    }

    const result = await requestAiMobile<Record<string, unknown>>("/api/ai/voice/event", {
      method: "POST",
      body: JSON.stringify({
        userId: session.currentUserId,
        ...(input ?? {}),
      }),
    });

    if (!result.ok) {
      return {
        ok: true,
        data: {
          status: "voice_event_not_required",
          telemetryOnly: true,
          input: input ?? null,
        },
      };
    }

    return result;
  },

  startVoiceSession: async (
    input?: Record<string, unknown>,
  ): Promise<AiMobileApiResult<AiMobileVoiceSession>> => {
    const session = getAiMobileAuthSession();

    if (!session?.currentUserId) {
      return { ok: true, data: normalizeVoiceSession(input, "ready") };
    }

    const result = await requestAiMobile<unknown>("/api/ai/voice/session/start", {
      method: "POST",
      body: JSON.stringify({
        userId: session.currentUserId,
        inputKind: "quick_invoke",
        sourceLanguage: getAppLanguage(),
        ...(input ?? {}),
      }),
    });

    if (!result.ok) return { ok: true, data: normalizeVoiceSession(input, "limited") };

    return { ok: true, data: normalizeVoiceSession(result.data, "ready") };
  },

  stopVoiceSession: async (
    sessionId?: string | null,
  ): Promise<AiMobileApiResult<AiMobileVoiceSession>> => {
    const session = getAiMobileAuthSession();

    if (!session?.currentUserId || !sessionId) {
      return {
        ok: true,
        data: {
          sessionId: sessionId ?? createAiMobileId("ai_voice_session"),
          status: "ready",
          stateText: "Voice session stopped.",
          nativeBridgeStatus: "ready",
          raw: null,
        },
      };
    }

    const result = await requestAiMobile<unknown>(`/api/ai/voice/session/${encodeURIComponent(sessionId)}/stop`, {
      method: "POST",
      body: JSON.stringify({
        userId: session.currentUserId,
        sessionId,
      }),
    });

    if (!result.ok) {
      return {
        ok: true,
        data: {
          sessionId,
          status: "limited",
          stateText: result.error.message,
          nativeBridgeStatus: "limited",
          raw: null,
        },
      };
    }

    return { ok: true, data: normalizeVoiceSession(result.data, "ready") };
  },

  quickInvokeVoice: async (
    input?: Record<string, unknown>,
  ): Promise<AiMobileApiResult<AiMobileVoiceSession>> => {
    return aiMobileApi.startVoiceSession({
      mode: "general",
      inputKind: "quick_invoke",
      ...(input ?? {}),
    });
  },

  submitVoiceTranscript: async (
    input: string | { transcript: string; sessionId?: string | null; [key: string]: unknown },
  ): Promise<AiMobileApiResult<Record<string, unknown>>> => {
    const transcript = typeof input === "string" ? input : input.transcript;
    const sessionId = typeof input === "string" ? undefined : input.sessionId;
    const session = getAiMobileAuthSession();

    if (!session?.currentUserId) {
      return {
        ok: false,
        error: makeError("ai_mobile_auth_required", "Authenticated AI user is required for voice transcription."),
      };
    }

    const result = await requestAiMobile<Record<string, unknown>>("/api/ai/voice/event", {
      method: "POST",
      body: JSON.stringify({
        userId: session.currentUserId,
        type: "transcript_ready",
        sessionId,
        payload: {
          transcript,
          ...(typeof input === "string" ? {} : input),
        },
      }),
    });

    if (!result.ok) {
      return {
        ok: true,
        data: {
          status: "transcript_ready",
          telemetryOnly: true,
          transcript,
          sessionId: sessionId ?? null,
        },
      };
    }

    return result;
  },

  transcribeVoiceAudio: async (
    input: {
      audioBase64?: string | null;
      audioUri?: string | null;
      fileName?: string | null;
      mimeType?: string | null;
      durationMillis?: number | null;
      sizeBytes?: number | null;
      language?: string | null;
      source?: string | null;
      listenForWakeWord?: boolean;
      wakeWord?: string;
      [key: string]: unknown;
    },
  ): Promise<AiMobileApiResult<Record<string, unknown>>> => {
    const session = getAiMobileAuthSession();

    if (!session?.currentUserId) {
      return {
        ok: false,
        error: makeError("ai_mobile_auth_required", "Authenticated AI user is required for voice transcription."),
      };
    }

    const result = await requestAiMobile<Record<string, unknown>>("/api/ai/voice/transcribe", {
      method: "POST",
      body: JSON.stringify({
        ...(input ?? {}),
        userId: session.currentUserId,
        user_id: session.currentUserId,
        actorUserId: session.currentUserId,
        language: input.language ?? getAppLanguage(),
        source: input.source ?? "sabi_ai_chat_voice",
        contentType: input.mimeType ?? "audio/mp4",
        audioContentType: input.mimeType ?? "audio/mp4",
        audioMimeType: input.mimeType ?? "audio/mp4",
        audioFormatHint: "mobile_m4a_aac_16khz_mono",
        inputKind: "voice_command",
        wakeWord: input.wakeWord ?? "sabi",
        listenForWakeWord: input.listenForWakeWord ?? false,
        semanticTranscription: true,
        fakeSttAllowed: false,
        fakeFallbackAllowed: false,
        mobileSecretsAllowed: false,
        audioBase64: input.audioBase64 ?? null,
        audioUri: input.audioUri ?? null,
        fileName: input.fileName ?? null,
        mimeType: input.mimeType ?? "audio/mp4",
        format: "m4a_aac_16khz_mono",
        contentTypeCandidates: [input.mimeType ?? "audio/mp4", "audio/mp4", "audio/m4a", "audio/aac"],
        durationMillis: input.durationMillis ?? null,
        sizeBytes: input.sizeBytes ?? null,
        client: "mobile",
        version: AI_MOBILE_API_VERSION,
        metadata: {
          bridge: "expo-av",
          mode: input.source ?? "sabi_ai_chat_voice",
          noFakeStt: true,
          audioFormatHint: "mobile_m4a_aac_16khz_mono",
          audioBase64Length: typeof input.audioBase64 === "string" ? input.audioBase64.length : 0,
        },
      }),
    });

    if (!result.ok) return result;

    return result;
  },

  requestVoiceTts: async (
    input: { text: string; sessionId?: string | null; language?: string | null; [key: string]: unknown },
  ): Promise<AiMobileApiResult<Record<string, unknown>>> => {
    const session = getAiMobileAuthSession();

    if (!session?.currentUserId) {
      return {
        ok: false,
        error: makeError("ai_mobile_auth_required", "Authenticated AI user is required for Sabi voice playback."),
      };
    }

    const selectedLanguage = input.language ?? getAppLanguage();
    const result = await requestAiMobile<Record<string, unknown>>("/api/ai/voice/tts", {
      method: "POST",
      body: JSON.stringify({
        userId: session.currentUserId,
        language: selectedLanguage,
        sourceLanguage: selectedLanguage,
        targetLanguage: selectedLanguage,
        responseLanguage: selectedLanguage,
        preferredVoiceGender: "female",
        fakeFallbackAllowed: false,
        mobileSecretsAllowed: false,
        ...input,
      }),
    });

    if (!result.ok) return result;

    return result;
  },

  requestVoiceNativePlayback: async (
    input?: Record<string, unknown>,
  ): Promise<AiMobileApiResult<Record<string, unknown>>> => {
    return {
      ok: true,
      data: {
        status: "ready",
        playbackRequired: true,
        ...(input ?? {}),
      },
    };
  },

  interruptVoicePlayback: async (
    input?: { sessionId?: string | null } | string | null,
  ): Promise<AiMobileApiResult<Record<string, unknown>>> => {
    const sessionId = typeof input === "string" ? input : input?.sessionId ?? null;

    return {
      ok: true,
      data: {
        status: "interrupted",
        sessionId,
      },
    };
  },

  setPrivacyMode: async (
    privacyMode: AiMobilePrivacyMode | string,
  ): Promise<AiMobileApiResult<Record<string, unknown>>> => {
    return { ok: true, data: { privacyMode } };
  },

  addInstruction: async (
    instruction: string,
  ): Promise<AiMobileApiResult<Record<string, unknown>>> => {
    return { ok: true, data: { instruction } };
  },
};

export function extractAssistantText(value: unknown): string | null {
  const data = toRecord(value);
  const nested = toRecord(data?.data) ?? data;
  const result = toRecord(nested?.result);
  const answer = toRecord(nested?.answer);
  const assistantRun = toRecord(nested?.assistantRun);
  const assistantRunAnswer = toRecord(assistantRun?.answer);
  const output = toRecord(nested?.output) ?? toRecord(result?.output);
  const firstChoice = toRecord(toArray(nested?.choices)[0]) ?? toRecord(toArray(result?.choices)[0]);
  const firstChoiceMessage = toRecord(firstChoice?.message);

  return (
    toStringValue(nested?.text) ||
    toStringValue(nested?.message) ||
    toStringValue(nested?.reply) ||
    toStringValue(nested?.response) ||
    toStringValue(nested?.answerText) ||
    toStringValue(nested?.content) ||
    toStringValue(result?.text) ||
    toStringValue(result?.message) ||
    toStringValue(result?.reply) ||
    toStringValue(result?.response) ||
    toStringValue(result?.answerText) ||
    toStringValue(result?.content) ||
    toStringValue(answer?.text) ||
    toStringValue(answer?.message) ||
    toStringValue(answer?.content) ||
    toStringValue(assistantRunAnswer?.text) ||
    toStringValue(assistantRunAnswer?.message) ||
    toStringValue(assistantRunAnswer?.content) ||
    toStringValue(output?.text) ||
    toStringValue(output?.message) ||
    toStringValue(output?.content) ||
    toStringValue(firstChoice?.text) ||
    toStringValue(firstChoiceMessage?.content) ||
    null
  );
}



