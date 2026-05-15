declare const process:
  | {
      env?: Record<string, string | undefined>
    }
  | undefined

export const AI_SABI_VOICE_COMMAND_MOBILE_VERSION = "AI-40.1" as const

export type AiSabiVoiceCommandStatus =
  | "contract_only"
  | "provider_not_configured"
  | "foundation_not_ready"
  | "ready"
  | "disabled"
  | "blocked"

export type AiSabiVoiceCommandSource =
  | "wake_word"
  | "push_to_talk"
  | "quick_action"
  | "voice_screen"
  | "messenger_call"
  | "system"

export type AiSabiVoiceCommandManifest = {
  area: "sabi_voice_command"
  version: "AI-40.1"
  status: AiSabiVoiceCommandStatus
  enabled: boolean
  commandWakeWord: "SABI"
  fakePolicy: {
    fakeSttAllowed: false
    fakeTtsAllowed: false
    fakeCommandExecutionAllowed: false
    fakeProviderKeysAllowed: false
    fallbackExecutionAllowed: false
  }
  routes: {
    manifest: "/api/ai/sabi-voice/manifest"
    status: "/api/ai/sabi-voice/status"
    prepareCommand: "/api/ai/sabi-voice/prepare-command"
  }
  providers: Array<{
    area: string
    configured: boolean
    status: AiSabiVoiceCommandStatus
    requiredEnv: string[]
    serverOnly: true
    mobileApiKeyAllowed: false
  }>
  foundation: Array<{
    module: string
    ready: boolean
    status: AiSabiVoiceCommandStatus
    requiredFor: string[]
    note: string
  }>
  capabilities: Array<{
    key: string
    title: string
    enabled: boolean
    status: AiSabiVoiceCommandStatus
    requiresPremium: boolean
    requiresProvider: boolean
    requiresFoundationModules: string[]
    executionPolicy: string
  }>
  allowedActions: Array<{
    actionKey: string
    module: string
    riskLevel: string
    requiresConfirmation: boolean
    requiresPremium: boolean
    executionPolicy: string
    route?: string
    aliases: string[]
  }>
  launchRule: "connect_real_server_keys_before_enabling"
  currentMode: "foundation_only_no_runtime_execution"
}

export type AiSabiVoiceCommandStatusSnapshot = {
  userId?: string
  status: AiSabiVoiceCommandStatus
  enabled: boolean
  wakeWord: "SABI"
  providerConfigured: boolean
  foundationReady: boolean
  canListen: boolean
  canExecuteCommand: boolean
  canSpeakReply: boolean
  message: string
  manifest: AiSabiVoiceCommandManifest
}

export type AiSabiVoiceCommandPrepareRequest = {
  userId: string
  transcript: string
  source?: AiSabiVoiceCommandSource
  locale?: string
  deviceId?: string
  sessionId?: string
  premiumEnabled?: boolean
  metadata?: Record<string, unknown>
}

export type AiSabiVoiceCommandPrepareResult = {
  ok: boolean
  status: AiSabiVoiceCommandStatus
  code: string
  message: string
  userId: string
  wakeWordDetected: boolean
  transcript: string
  source: AiSabiVoiceCommandSource
  preparedAction?: {
    actionKey: string
    module: string
    route?: string
    riskLevel: string
    requiresConfirmation: boolean
    requiresPremium: boolean
    executionPolicy: string
    clientDispatchAllowed: boolean
    params: Record<string, unknown>
  }
  providerConfigured: boolean
  foundationReady: boolean
  fakePolicy: AiSabiVoiceCommandManifest["fakePolicy"]
}

type ApiResult<T> =
  | {
      ok: true
      data: T
    }
  | {
      ok: false
      error: {
        code: string
        message: string
        status?: number
        details?: unknown
      }
    }

type SabiVoiceApiConfig = {
  apiBaseUrl?: string | null
  accessToken?: string | null
  currentUserId?: string | null
  timeoutMs?: number
}

const DEFAULT_TIMEOUT_MS = 30_000

let runtimeConfig: SabiVoiceApiConfig = {
  apiBaseUrl: process?.env?.EXPO_PUBLIC_API_BASE_URL || process?.env?.EXPO_PUBLIC_AI_API_BASE_URL || null,
  accessToken: null,
  currentUserId: null,
  timeoutMs: DEFAULT_TIMEOUT_MS,
}

export function configureSabiVoiceCommandFoundation(config: SabiVoiceApiConfig) {
  runtimeConfig = {
    ...runtimeConfig,
    ...config,
  }
}

export function isSabiWakeWordTranscript(transcript: string): boolean {
  const cleaned = transcript.trim().toLowerCase()
  return cleaned === "sabi" || cleaned.startsWith("sabi ") || cleaned.startsWith("саби ") || cleaned.startsWith("саби,")
}

export async function getSabiVoiceCommandManifest(): Promise<ApiResult<AiSabiVoiceCommandManifest>> {
  return requestJson<AiSabiVoiceCommandManifest>("/api/ai/sabi-voice/manifest")
}

export async function getSabiVoiceCommandStatus(userId?: string): Promise<ApiResult<AiSabiVoiceCommandStatusSnapshot>> {
  const query = userId ? `?userId=${encodeURIComponent(userId)}` : ""
  return requestJson<AiSabiVoiceCommandStatusSnapshot>(`/api/ai/sabi-voice/status${query}`)
}

export async function prepareSabiVoiceCommand(
  input: AiSabiVoiceCommandPrepareRequest,
): Promise<ApiResult<AiSabiVoiceCommandPrepareResult>> {
  return requestJson<AiSabiVoiceCommandPrepareResult>("/api/ai/sabi-voice/prepare-command", {
    method: "POST",
    body: input,
  })
}

export function getSabiVoiceUnavailableMessage(language: string) {
  if (language.startsWith("uz")) {
    return "SABI ovozli boshqaruvi hali server provayderlari va asosiy modullar bilan ulanmagan. Soxta STT/TTS yoki soxta buyruq bajarish yoqilmagan."
  }

  if (language.startsWith("ru")) {
    return "Голосовое управление SABI пока не подключено к реальным серверным провайдерам и базовым модулям. Фейковый STT/TTS и фейковое выполнение команд отключены."
  }

  return "SABI voice control is not connected to real server providers and foundation modules yet. Fake STT/TTS and fake command execution are disabled."
}

async function requestJson<T>(
  path: string,
  init?: {
    method?: "GET" | "POST"
    body?: unknown
  },
): Promise<ApiResult<T>> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), runtimeConfig.timeoutMs || DEFAULT_TIMEOUT_MS)

  try {
    const response = await fetch(`${getBaseUrl()}${path}`, {
      method: init?.method || "GET",
      signal: controller.signal,
      headers: buildHeaders(Boolean(init?.body)),
      body: init?.body ? JSON.stringify(init.body) : undefined,
    })

    const text = await response.text()
    const payload = safeJsonParse(text)
    const record = toRecord(payload)

    if (!response.ok || record?.ok === false) {
      const errorRecord = toRecord(record?.error)
      return {
        ok: false,
        error: {
          status: response.status,
          code: readString(errorRecord?.code) || readString(errorRecord?.error) || `ai_sabi_voice_http_${response.status}`,
          message:
            readString(errorRecord?.message) ||
            readString(errorRecord?.error) ||
            "SABI voice command request failed.",
          details: payload,
        },
      }
    }

    return {
      ok: true,
      data: (record?.data ?? payload) as T,
    }
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return {
        ok: false,
        error: {
          code: "ai_sabi_voice_timeout",
          message: "SABI voice command request timed out.",
          details: error,
        },
      }
    }

    return {
      ok: false,
      error: {
        code: "ai_sabi_voice_network_error",
        message: error instanceof Error ? error.message : "SABI voice command network request failed.",
        details: error,
      },
    }
  } finally {
    clearTimeout(timeout)
  }
}

function getBaseUrl(): string {
  const baseUrl = runtimeConfig.apiBaseUrl?.trim()
  if (!baseUrl) {
    throw new Error("ai_sabi_voice_api_base_url_missing")
  }
  return baseUrl.replace(/\/+$/, "")
}

function buildHeaders(hasBody: boolean): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "x-ai-client": "sabi-mobile",
    "x-ai-mobile-version": AI_SABI_VOICE_COMMAND_MOBILE_VERSION,
  }

  if (hasBody) {
    headers["Content-Type"] = "application/json"
  }

  if (runtimeConfig.accessToken) {
    headers.Authorization = `Bearer ${runtimeConfig.accessToken}`
  }

  if (runtimeConfig.currentUserId) {
    headers["x-user-id"] = runtimeConfig.currentUserId
  }

  return headers
}

function safeJsonParse(text: string): unknown {
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

function toRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null
}

function readString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null
}
