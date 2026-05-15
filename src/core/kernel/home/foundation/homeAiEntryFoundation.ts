export type SabiHomeAiEntryStatus =
  | "free_ready"
  | "provider_not_configured"
  | "premium_required"
  | "restricted"
  | "unavailable";

export type SabiHomeAiEntry = {
  version: "HOME-100.1";
  route: "/ai";
  freeFeatures: readonly ["basic_chat", "text_translation"];
  premiumFeatures: readonly [
    "voice_ai",
    "voice_app_control",
    "sabi_wake_word",
    "sabi_voice_reply",
    "call_translation",
    "media_translation_realtime",
  ];
  status: SabiHomeAiEntryStatus;
  providerConfigured: boolean;
  fakeFallbackAllowed: false;
};

export const SABI_HOME_AI_ENTRY_FOUNDATION: SabiHomeAiEntry = {
  version: "HOME-100.1",
  route: "/ai",
  freeFeatures: ["basic_chat", "text_translation"],
  premiumFeatures: [
    "voice_ai",
    "voice_app_control",
    "sabi_wake_word",
    "sabi_voice_reply",
    "call_translation",
    "media_translation_realtime",
  ],
  status: "provider_not_configured",
  providerConfigured: false,
  fakeFallbackAllowed: false,
};

export function resolveSabiHomeAiEntryStatus(input: {
  providerConfigured?: boolean;
  restricted?: boolean;
  premiumRequired?: boolean;
}): SabiHomeAiEntryStatus {
  if (input.restricted) return "restricted";
  if (input.premiumRequired) return "premium_required";
  if (input.providerConfigured) return "free_ready";
  return "provider_not_configured";
}
