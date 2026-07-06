export type AiMobileConnectionStatus =
  | "ready"
  | "limited"
  | "not_connected"
  | "error";

export type AiMobileRoute =
  | "/ai"
  | "/ai/chat"
  | "/ai/voice"
  | "/ai/translation"
  | "/ai/history"
  | "/ai/tasks"
  | "/ai/memory"
  | "/ai/settings"
  | "/ai/premium"
  | "/profile/ai"
  | "/profile/premium"
  | "/tabs/chats"
  | "/tabs/wallet"
  | "/wallet/coin"
  | "/wallet/qr";

export type AiMobileAction = {
  key: string;
  title: string;
  description: string;
  route: AiMobileRoute;
  status?: AiMobileConnectionStatus;
  badge?: string;
};

export type AiMobileCapability = {
  key: string;
  title: string;
  status: AiMobileConnectionStatus;
  description?: string;
};

export type AiMobileSnapshot = {
  userId: string | null;
  apiBaseUrl: string | null;
  status: AiMobileConnectionStatus;
  statusText: string;
  fetchedAt: string | null;
  source: "backend" | "local_contract";
  shell: Record<string, unknown> | null;
  home: Record<string, unknown> | null;
  chat: Record<string, unknown> | null;
  voice: Record<string, unknown> | null;
  translation: Record<string, unknown> | null;
  activity: Record<string, unknown> | null;
  settings: Record<string, unknown> | null;
  premium: Record<string, unknown> | null;
  personalization: Record<string, unknown> | null;
  safety: Record<string, unknown> | null;
  capabilities: AiMobileCapability[];
  quickActions: AiMobileAction[];
  raw: Record<string, unknown> | null;
};

export type AiMobileApiError = {
  code: string;
  message: string;
  status?: number;
};

export type AiMobileApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: AiMobileApiError };

export type AiMobileAttachmentKind = "photo" | "video" | "document" | "audio";

export type AiMobileAttachment = {
  id: string;
  kind: AiMobileAttachmentKind;
  uri: string;
  name?: string | null;
  mimeType?: string | null;
  size?: number | null;
  raw?: Record<string, unknown> | null;
};

export type AiMobileAssistantMode =
  | "chatgpt"
  | "business"
  | "student"
  | "applicant"
  | "teacher";

export type AiMobileFoundationMode =
  | "general"
  | "business"
  | "education"
  | "student"
  | "abiturient"
  | "teacher"
  | "translation"
  | "search";

export type AiMobileProviderHint =
  | "chatgpt"
  | "openai"
  | "google_search"
  | "google_translate"
  | "google"
  | "yandex"
  | "internal"
  | "sabi_ai";

export type AiMobileProviderRouteKind = "assistant" | "search" | "translation" | "voice";

export type AiMobileProviderRoute = {
  kind: AiMobileProviderRouteKind;
  provider: string;
  label: string;
  status: string;
  configured: boolean;
  requiresGateway: boolean;
  safeForMobile?: boolean;
  reason?: string;
  raw?: Record<string, unknown> | null;
};

export type AiMobileSafetyApprovalDecision = {
  policyVersion?: string;
  category: string;
  riskLevel: "none" | "low" | "medium" | "high" | string;
  allowed: boolean;
  autoExecuteAllowed: boolean;
  requiresConfirmation: boolean;
  requiresTargetModuleConfirmation: boolean;
  blockedReason?: string | null;
  confirmationReason?: string | null;
  warnings: string[];
  raw?: Record<string, unknown> | null;
};

export type AiMobileSafetyPolicy = {
  requiresUserConfirmationForActions: boolean;
  blockAutonomousMoneyTransfer: boolean;
  blockAutonomousMessageSending: boolean;
  blockAutonomousExternalActions: boolean;
  promptInjectionGuard: boolean;
};

export type AiMobileVoiceOutputPreference = {
  enabled: boolean;
  preferredVoiceGender?: "female" | "male" | "neutral";
};

export type AiMobileConversationMessage = {
  role: "user" | "assistant" | "system";
  text: string;
  createdAt?: string | null;
};

export type AiMobileAssistantMessageInput = {
  message: string;
  assistantMode?: AiMobileAssistantMode;
  attachments?: AiMobileAttachment[];
  webSearchEnabled?: boolean;
  providerHint?: AiMobileProviderHint | string;
  source?: string;
  safetyPolicy?: AiMobileSafetyPolicy;
  voiceOutput?: AiMobileVoiceOutputPreference;
  providerRoute?: AiMobileProviderRoute | null;
  safetyApproval?: AiMobileSafetyApprovalDecision | null;
  clientCapabilities?: string[];
  conversationHistory?: AiMobileConversationMessage[];
};

export type AiMobileChatMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  text: string;
  attachments?: AiMobileAttachment[];
  createdAt: string;
  status?: "sending" | "sent" | "error" | "awaiting_confirmation";
  meta?: string | null;
};

export type AiMobileVoiceSession = {
  sessionId: string | null;
  status: AiMobileConnectionStatus;
  stateText: string;
  nativeBridgeStatus?: AiMobileConnectionStatus;
  raw?: Record<string, unknown> | null;
};

export type AiMobileTranslationInputKind = "text" | "camera" | "photo" | "messenger_contract";

export type AiMobileTranslationResult = {
  translatedText: string | null;
  sourceLanguage: string | null;
  targetLanguage: string | null;
  provider: string | null;
  inputKind?: AiMobileTranslationInputKind;
  sourceText?: string | null;
  imageUri?: string | null;
  raw?: Record<string, unknown> | null;
};

export type AiMobileTranslationImageInput = {
  imageUri: string;
  fileName?: string | null;
  mimeType?: string | null;
  sourceLanguage?: string | null;
  targetLanguage: string;
  inputKind: "camera" | "photo";
};

export type AiMobileListItem = {
  id: string;
  title: string;
  description: string;
  meta?: string;
  status?: string;
  raw?: Record<string, unknown> | null;
};

export type AiMobilePrivacyMode = "strict" | "balanced" | "adaptive";