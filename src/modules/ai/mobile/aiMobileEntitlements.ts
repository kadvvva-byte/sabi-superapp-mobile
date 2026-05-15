export type AiPremiumFeatureKey =
  | "ai_assistant_modes"
  | "ai_web_search"
  | "ai_voice"
  | "ai_attachments"
  | "ai_translation_media"
  | "ai_translation_realtime"
  | "ai_extended_memory"
  | "ai_business_assistant"
  | "ai_education_assistant";

export type AiPremiumEntitlementSource =
  | "mobile_ui_premium_contract"
  | "workspace_premium_contract"
  | "server_entitlement_contract"
  | "none";

export type AiPremiumEntitlementState = {
  enabled: boolean;
  source: AiPremiumEntitlementSource;
  planKey: string | null;
  activeFeatures: string[];
  coinBalance: number | null;
  currency: "COIN";
  raw: unknown;
};

const FREE_PLAN_KEYS = new Set(["", "free", "base", "basic", "none", "disabled"]);

const FEATURE_ALIASES: Record<AiPremiumFeatureKey, string[]> = {
  ai_assistant_modes: [
    "premium_ai",
    "ai_assistant_modes",
    "ai_business",
    "ai_education",
    "business_assistant",
    "education_assistant",
    "ai_business_assistant",
    "ai_education_assistant",
  ],
  ai_web_search: [
    "premium_ai",
    "ai_web_search",
    "web_search",
    "internet_search",
    "google_search",
    "ai_google_search",
  ],
  ai_voice: [
    "premium_ai",
    "ai_voice",
    "voice_ai",
    "voice_control",
    "ai_voice_tts",
    "ai_voice_translation",
    "ai_translation_voice",
  ],
  ai_attachments: [
    "premium_ai",
    "ai_attachments",
    "attachments",
    "file_upload",
    "document_upload",
    "image_upload",
    "media_upload",
  ],
  ai_translation_media: [
    "premium_ai",
    "ai_translation_media",
    "ai_photo_translation",
    "ai_camera_translation",
    "photo_translation",
    "camera_translation",
    "ocr_translation",
  ],
  ai_translation_realtime: [
    "premium_ai",
    "ai_translation_realtime",
    "realtime_translation",
    "call_translation",
    "messenger_translation",
  ],
  ai_extended_memory: ["premium_ai", "ai_extended_memory", "extended_memory", "premium_memory"],
  ai_business_assistant: ["premium_ai", "ai_business", "business_assistant", "ai_business_assistant"],
  ai_education_assistant: ["premium_ai", "ai_education", "education_assistant", "ai_education_assistant"],
};

function toRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function toStringValue(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function readBoolean(value: unknown): boolean | null {
  if (typeof value === "boolean") return value;

  if (typeof value === "number") {
    if (value === 1) return true;
    if (value === 0) return false;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "active", "enabled", "premium", "paid", "yes", "1"].includes(normalized)) return true;
    if (["false", "inactive", "disabled", "free", "no", "0"].includes(normalized)) return false;
  }

  return null;
}

function readNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function readStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => toStringValue(item))
      .filter((item): item is string => Boolean(item));
  }

  if (typeof value === "string" && value.trim()) {
    return value
      .split(/[;,]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function normalizeFeatureKey(value: string): string {
  return value.trim().toLowerCase().replace(/[\s:-]+/g, "_");
}

type AiPremiumCandidate = {
  source: Exclude<AiPremiumEntitlementSource, "none">;
  record: Record<string, unknown>;
};

function collectPremiumCandidates(snapshot: unknown): AiPremiumCandidate[] {
  const root = toRecord(snapshot);
  if (!root) return [];

  const raw = toRecord(root.raw);
  const rootPremium = toRecord(root.premium);
  const rootPremiumInner = toRecord(rootPremium?.premium);
  const rawPremium = toRecord(raw?.premium);
  const rawPremiumInner = toRecord(rawPremium?.premium);
  const rawWorkspace = toRecord(raw?.workspace);
  const rawWorkspacePremium = toRecord(rawWorkspace?.premium);
  const rootEntitlements = toRecord(root.entitlements);
  const rawEntitlements = toRecord(raw?.entitlements);
  const rootAiPremium = toRecord(rootEntitlements?.aiPremium) || toRecord(rootEntitlements?.premiumAi);
  const rawAiPremium = toRecord(rawEntitlements?.aiPremium) || toRecord(rawEntitlements?.premiumAi);
  const rootAiAccess = toRecord(root.aiAccess);
  const rawAiAccess = toRecord(raw?.aiAccess);

  const candidates: AiPremiumCandidate[] = [];

  const pushCandidate = (
    source: AiPremiumCandidate["source"],
    record: Record<string, unknown> | null,
  ) => {
    if (record) {
      candidates.push({ source, record });
    }
  };

  pushCandidate("mobile_ui_premium_contract", rootPremiumInner);
  pushCandidate("mobile_ui_premium_contract", rawPremiumInner);
  pushCandidate("mobile_ui_premium_contract", rootPremium);
  pushCandidate("mobile_ui_premium_contract", rawPremium);
  pushCandidate("workspace_premium_contract", rawWorkspacePremium);
  pushCandidate("server_entitlement_contract", rootAiPremium);
  pushCandidate("server_entitlement_contract", rawAiPremium);
  pushCandidate("server_entitlement_contract", rootAiAccess);
  pushCandidate("server_entitlement_contract", rawAiAccess);

  return candidates;
}

function buildStateFromCandidate(
  source: AiPremiumEntitlementSource,
  record: Record<string, unknown>,
): AiPremiumEntitlementState | null {
  const planKey =
    toStringValue(record.planKey) ||
    toStringValue(record.plan) ||
    toStringValue(record.subscriptionPlan) ||
    null;

  const activeFeatures = Array.from(
    new Set(
      [
        ...readStringArray(record.activeFeatures),
        ...readStringArray(record.features),
        ...readStringArray(record.enabledFeatures),
        ...readStringArray(record.premiumFeatures),
      ].map(normalizeFeatureKey),
    ),
  );

  const explicitEnabled =
    readBoolean(record.enabled) ??
    readBoolean(record.premiumEnabled) ??
    readBoolean(record.active) ??
    readBoolean(record.aiPremiumActive) ??
    readBoolean(record.hasAiPremium) ??
    null;

  const hasPaidPlan = planKey ? !FREE_PLAN_KEYS.has(planKey.trim().toLowerCase()) : false;
  const enabled = explicitEnabled === true || hasPaidPlan || activeFeatures.length > 0;

  if (!enabled) {
    return null;
  }

  return {
    enabled: true,
    source,
    planKey,
    activeFeatures,
    coinBalance:
      readNumber(record.coinBalance) ??
      readNumber(record.coin_balance) ??
      readNumber(record.balanceCoin) ??
      null,
    currency: "COIN",
    raw: record,
  };
}

export function getAiPremiumEntitlementState(snapshot: unknown): AiPremiumEntitlementState {
  const candidates = collectPremiumCandidates(snapshot);

  for (const candidate of candidates) {
    const state = buildStateFromCandidate(candidate.source, candidate.record);
    if (state) return state;
  }

  return {
    enabled: false,
    source: "none",
    planKey: null,
    activeFeatures: [],
    coinBalance: null,
    currency: "COIN",
    raw: null,
  };
}

export function hasAiPremiumAccess(snapshot: unknown): boolean {
  return getAiPremiumEntitlementState(snapshot).enabled;
}

export function hasAiPremiumFeature(snapshot: unknown, feature: AiPremiumFeatureKey): boolean {
  const state = getAiPremiumEntitlementState(snapshot);
  if (!state.enabled) return false;

  if (state.activeFeatures.length === 0) {
    return true;
  }

  const active = new Set(state.activeFeatures.map(normalizeFeatureKey));
  const aliases = FEATURE_ALIASES[feature].map(normalizeFeatureKey);

  return aliases.some((alias) => active.has(alias));
}

export function resolveAiPremiumEntitlement(snapshot: unknown): AiPremiumEntitlementState {
  return getAiPremiumEntitlementState(snapshot);
}
