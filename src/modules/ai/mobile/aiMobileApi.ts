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

const AI_MOBILE_API_VERSION = "AI-34" as const;

const AI_PROVIDER_GATEWAY_ROUTES = {
  textTranslation: "/api/ai/provider-gateway/translation/text",
  imageTranslation: "/api/ai/provider-gateway/translation/image",
  manifest: "/api/ai/provider-gateway/manifest",
  health: "/api/ai/provider-gateway/health",
} as const;

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
    if (language.startsWith("uz")) return "AI provider gateway holati hozircha tekshirib bo‘lmadi.";
    if (language.startsWith("ru")) return "Статус AI provider gateway пока не удалось проверить.";
    return "AI provider gateway status could not be checked yet.";
  }

  if (manifest.status === "ready" && manifest.translationConfigured) {
    if (language.startsWith("uz")) return "AI provider gateway tayyor. Real tarjima provayderi server orqali ulangan.";
    if (language.startsWith("ru")) return "AI provider gateway готов. Реальный провайдер перевода подключён через сервер.";
    return "AI provider gateway is ready. A real translation provider is connected through the server.";
  }

  if (!manifest.translationConfigured) {
    if (language.startsWith("uz")) return "AI tarjima provayderi serverda hali ulanmagan. Mahalliy zaxira tarjima o‘chirilgan.";
    if (language.startsWith("ru")) return "AI провайдер перевода на сервере пока не подключён. Локальный резервный перевод отключён.";
    return "AI translation provider is not connected on the server yet. Local offline translation is disabled.";
  }

  if (language.startsWith("uz")) return `AI provider gateway holati: ${manifest.status}.`;
  if (language.startsWith("ru")) return `Статус AI provider gateway: ${manifest.status}.`;
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

function getEnvApiBaseUrl(): string | null {
  const value = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (typeof value !== "string" || !value.trim()) return null;
  return value.trim().replace(/\/+$/, "");
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
  const url = `${session.apiBaseUrl}${path.startsWith("/") ? path : `/${path}`}`;

  try {
    const response = await fetch(url, {
      ...init,
      headers: {
        Accept: "application/json",
        ...(isFormDataBody ? {} : { "Content-Type": "application/json" }),
        "x-user-id": session.currentUserId,
        "x-app-language": appLanguage,
        "Accept-Language": appLanguage,
        ...(session.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {}),
        ...normalizeRequestHeaders(init?.headers),
      },
    });

    const body = await readResponseBody(response);

    if (!response.ok) {
      return {
        ok: false,
        error: normalizeGatewayError(body, response.status),
      };
    }

    return { ok: true, data: body as T };
  } catch (error) {
    return {
      ok: false,
      error: makeError(
        "ai_mobile_network_error",
        error instanceof Error ? error.message : String(error ?? "network error"),
      ),
    };
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
  if (hint === "openai" || hint === "chatgpt") return "chatgpt";
  return "chatgpt";
}

function buildSafetyCategory(message: string): string {
  const lowered = message.toLowerCase();

  if (
    lowered.includes("send money") ||
    lowered.includes("transfer money") ||
    lowered.includes("pay") ||
    lowered.includes("переведи деньги") ||
    lowered.includes("отправь деньги") ||
    lowered.includes("оплат")
  ) {
    return "money_movement";
  }

  if (
    lowered.includes("send coin") ||
    lowered.includes("coin transfer") ||
    lowered.includes("отправь коин") ||
    lowered.includes("переведи coin")
  ) {
    return "coin_movement";
  }

  if (
    lowered.includes("send message") ||
    lowered.includes("message to") ||
    lowered.includes("отправь сообщение") ||
    lowered.includes("напиши в чат")
  ) {
    return "message_send";
  }

  if (
    lowered.includes("delete account") ||
    lowered.includes("remove account") ||
    lowered.includes("удалить аккаунт") ||
    lowered.includes("удали аккаунт")
  ) {
    return "account_delete";
  }

  if (
    lowered.includes("logout") ||
    lowered.includes("sign out") ||
    lowered.includes("log out") ||
    lowered.includes("выйти из аккаунта")
  ) {
    return "account_security";
  }

  if (lowered.includes("settings") || lowered.includes("настрой")) {
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
    provider: toStringValue(data.provider) || "openai",
    label: toStringValue(data.label) || "ChatGPT / OpenAI",
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
            : "openai";

    const result = await requestAiMobile<unknown>("/api/ai/providers/resolve", {
      method: "POST",
      body: JSON.stringify({
        userId: session.currentUserId,
        kind,
        mode: input.mode ?? "general",
        preferredProvider,
        providerHint: input.providerHint ?? "chatgpt",
      }),
    });

    if (!result.ok) {
      return {
        ok: true,
        data: {
          kind,
          provider: preferredProvider,
          label: preferredProvider === "google" ? "Google" : "ChatGPT / OpenAI",
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
          label: preferredProvider === "google" ? "Google" : "ChatGPT / OpenAI",
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

    return requestAiMobile<Record<string, unknown>>("/api/ai/mobile-ui/assistant/message", {
      method: "POST",
      body: JSON.stringify({
        userId: session.currentUserId,
        prompt: input.message,
        message: input.message,
        locale: getAppLanguage(),
        source: input.source ?? "text",
        preferredMode: mapAssistantModeToFoundationMode(input.assistantMode),
        preferredProvider:
          input.providerHint === "google_search" || input.providerHint === "google_translate"
            ? "google"
            : "openai",
        providerHint: mapProviderHint(input.providerHint),
        webSearchEnabled: Boolean(input.webSearchEnabled),
        voiceControlEnabled: Boolean(input.voiceOutput?.enabled),
        attachments: (input.attachments ?? []).map((attachment) => ({
          id: attachment.id,
          kind: attachment.kind,
          uri: attachment.uri,
          name: attachment.name,
          mimeType: attachment.mimeType,
          sizeBytes: attachment.size,
          metadata: attachment.raw ?? {},
        })),
        clientCapabilities: input.clientCapabilities ?? [],
        autoExecute: false,
        surface: "assistant_chat",
        metadata: {
          safetyPolicy: input.safetyPolicy,
          providerRoute: input.providerRoute,
          safetyApproval: input.safetyApproval,
          voiceOutput: input.voiceOutput,
        },
      }),
    });
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

    const result = await requestAiMobile<Record<string, unknown>>(AI_PROVIDER_GATEWAY_ROUTES.textTranslation, {
      method: "POST",
      body: JSON.stringify({
        userId: session.currentUserId,
        contentType: "text",
        text,
        sourceLanguage: sourceLanguage && sourceLanguage !== "auto" ? sourceLanguage : "auto",
        targetLanguage,
        surface: "ai_text_translation",
        client: "mobile",
        version: AI_MOBILE_API_VERSION,
        preferredProvider: "google",
        providerHint: "google_translate",
        gatewayRequired: true,
        allowFallback: false,
        preserveFormatting: true,
      }),
    });

    if (!result.ok) return { ok: false, error: result.error };

    const responseRecord = toRecord(result.data) ?? {};
    const dataRecord = toRecord(responseRecord.data) ?? responseRecord;
    const data = toRecord(dataRecord.result) ?? dataRecord;
    const normalized = normalizeTranslationResult(data, {
      targetLanguage,
      sourceLanguage,
      sourceText: text,
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
      return { ok: true, data: { status: "ready", localOnly: true, input } };
    }

    const result = await requestAiMobile<Record<string, unknown>>("/api/ai/voice/bridge/bind", {
      method: "POST",
      body: JSON.stringify({
        userId: session.currentUserId,
        ...(input ?? {}),
      }),
    });

    if (!result.ok) return { ok: true, data: { status: "ready", localOnly: true, input } };

    return result;
  },

  sendNativeVoiceEvent: async (
    input?: Record<string, unknown>,
  ): Promise<AiMobileApiResult<Record<string, unknown>>> => {
    const session = getAiMobileAuthSession();

    if (!session?.currentUserId) {
      return { ok: true, data: { status: "recorded", localOnly: true, input } };
    }

    const result = await requestAiMobile<Record<string, unknown>>("/api/ai/voice/event", {
      method: "POST",
      body: JSON.stringify({
        userId: session.currentUserId,
        ...(input ?? {}),
      }),
    });

    if (!result.ok) return { ok: true, data: { status: "recorded", localOnly: true, input } };

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
      return { ok: true, data: { transcript, sessionId, localOnly: true } };
    }

    const result = await requestAiMobile<Record<string, unknown>>("/api/ai/voice/transcribe", {
      method: "POST",
      body: JSON.stringify({
        userId: session.currentUserId,
        transcript,
        sessionId,
        ...(typeof input === "string" ? {} : input),
      }),
    });

    if (!result.ok) return { ok: true, data: { transcript, sessionId, localOnly: true } };

    return result;
  },

  requestVoiceTts: async (
    input: { text: string; sessionId?: string | null; language?: string | null; [key: string]: unknown },
  ): Promise<AiMobileApiResult<Record<string, unknown>>> => {
    const session = getAiMobileAuthSession();

    if (!session?.currentUserId) {
      return {
        ok: true,
        data: {
          text: input.text,
          sessionId: input.sessionId,
          playbackRequired: true,
          localOnly: true,
        },
      };
    }

    const result = await requestAiMobile<Record<string, unknown>>("/api/ai/voice/tts", {
      method: "POST",
      body: JSON.stringify({
        userId: session.currentUserId,
        language: input.language ?? getAppLanguage(),
        ...input,
      }),
    });

    if (!result.ok) {
      return {
        ok: true,
        data: {
          text: input.text,
          sessionId: input.sessionId,
          playbackRequired: true,
          localOnly: true,
        },
      };
    }

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
  const answer = toRecord(nested?.answer);
  const assistantRun = toRecord(nested?.assistantRun);
  const assistantRunAnswer = toRecord(assistantRun?.answer);

  return (
    toStringValue(nested?.text) ||
    toStringValue(nested?.message) ||
    toStringValue(nested?.reply) ||
    toStringValue(nested?.response) ||
    toStringValue(answer?.text) ||
    toStringValue(assistantRunAnswer?.text) ||
    null
  );
}