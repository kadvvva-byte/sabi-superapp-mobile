export type HomeAiVoiceCommandDomain =
  | "home"
  | "messenger"
  | "wallet"
  | "qr"
  | "gallery"
  | "games"
  | "marketplace"
  | "taxi"
  | "hotels"
  | "supermarket"
  | "ai";

export type HomeAiVoiceCommandCapability = {
  id: string;
  domain: HomeAiVoiceCommandDomain;
  examples: string[];
  route?: string;
  premiumRequired: boolean;
  providerRequired: boolean;
  enabledBeforeProvider: boolean;
};

export const SABI_HOME_AI_VOICE_FOUNDATION_VERSION = "HOME-100.2.1";

export const SABI_HOME_AI_VOICE_WAKE_WORDS = ["SABI", "Саби"] as const;

export const SABI_HOME_AI_VOICE_COMMANDS: HomeAiVoiceCommandCapability[] = [
  { id: "open_home", domain: "home", examples: ["Саби, открой главный экран"], route: "/home", premiumRequired: false, providerRequired: false, enabledBeforeProvider: true },
  { id: "open_messenger", domain: "messenger", examples: ["Саби, открой сообщения"], route: "/tabs/chats", premiumRequired: false, providerRequired: false, enabledBeforeProvider: true },
  { id: "open_wallet", domain: "wallet", examples: ["Саби, открой Wallet"], route: "/wallet/home", premiumRequired: false, providerRequired: false, enabledBeforeProvider: true },
  { id: "open_qr", domain: "qr", examples: ["Саби, открой QR"], route: "/qr", premiumRequired: false, providerRequired: false, enabledBeforeProvider: true },
  { id: "open_gallery", domain: "gallery", examples: ["Саби, открой Gallery"], route: "/gallery", premiumRequired: false, providerRequired: false, enabledBeforeProvider: true },
  { id: "open_games", domain: "games", examples: ["Саби, открой Game Center"], route: "/network-game-center", premiumRequired: false, providerRequired: false, enabledBeforeProvider: true },
  { id: "open_marketplace", domain: "marketplace", examples: ["Саби, открой Marketplace"], route: "/marketplace", premiumRequired: false, providerRequired: false, enabledBeforeProvider: true },
  { id: "open_taxi", domain: "taxi", examples: ["Саби, открой Taxi"], route: "/taxi", premiumRequired: false, providerRequired: false, enabledBeforeProvider: true },
  { id: "open_hotels", domain: "hotels", examples: ["Саби, найди гостиницу"], route: "/hotels", premiumRequired: false, providerRequired: false, enabledBeforeProvider: true },
  { id: "open_supermarket", domain: "supermarket", examples: ["Саби, открой Supermarket"], route: "/supermarket", premiumRequired: false, providerRequired: false, enabledBeforeProvider: true },
  { id: "voice_assistant", domain: "ai", examples: ["Саби, помоги мне"], route: "/ai/voice", premiumRequired: true, providerRequired: true, enabledBeforeProvider: false },
];

export type HomeAiVoiceProviderState =
  | "provider_not_configured"
  | "wake_word_not_configured"
  | "ready_for_navigation_commands"
  | "ready_for_full_voice_ai";

export function getHomeAiVoiceProviderState(params: {
  providerConfigured: boolean;
  wakeWordConfigured: boolean;
  premiumEnabled: boolean;
}): HomeAiVoiceProviderState {
  if (!params.wakeWordConfigured) return "wake_word_not_configured";
  if (!params.providerConfigured) return "ready_for_navigation_commands";
  if (!params.premiumEnabled) return "ready_for_navigation_commands";
  return "ready_for_full_voice_ai";
}

export function resolveHomeAiVoiceCommandByRoute(route: string) {
  return SABI_HOME_AI_VOICE_COMMANDS.find((command) => command.route === route) ?? null;
}
