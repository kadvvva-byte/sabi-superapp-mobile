export type SabiHomeFoundationRuntimeStatus =
  | "ready"
  | "foundation_ready"
  | "provider_required"
  | "backend_unavailable"
  | "disabled";

export type SabiHomeProviderStatus =
  | "not_required"
  | "api_key_required"
  | "contract_required"
  | "provider_required"
  | "unavailable";

export type SabiHomeWidgetCode =
  | "messenger"
  | "wallet"
  | "qr"
  | "alerts"
  | "events"
  | "ai"
  | "sabi_voice"
  | "gallery"
  | "game_center"
  | "marketplace"
  | "hotels"
  | "taxi"
  | "supermarket"
  | "food_delivery"
  | "wholesale_market"
  | "stream"
  | "business"
  | "merchant"
  | "documents"
  | "camera"
  | "wifi_cast";

export type SabiHomeWidgetFoundation = {
  code: SabiHomeWidgetCode;
  title: string;
  route: string;
  runtimeStatus: SabiHomeFoundationRuntimeStatus;
  providerStatus: SabiHomeProviderStatus;
  visibleOnHome: boolean;
  fakeDataAllowed: false;
  notificationsEnabled: boolean;
  aiHooksEnabled: boolean;
  qrHooksEnabled: boolean;
  walletRouteRequired: boolean;
  adminReviewHook: boolean;
};

export type SabiHomeDockCode = "call" | "chat" | "wallet" | "mini_apps";

export type SabiHomeDockFoundation = {
  code: SabiHomeDockCode;
  title: string;
  route: string;
  mobileVisible: boolean;
  webVisible: boolean;
};

export type SabiHomeNotificationDigest = {
  missedCalls: number | null;
  unreadMessages: number | null;
  events: number | null;
  aiAlerts: number | null;
  securityAlerts: number | null;
  walletAlerts: number | null;
};

export type SabiHomeNotificationPolicy = {
  defaultVisibleOnHome: false;
  persistentHomeBannerAllowed: false;
  overlayAboveOtherAppsAllowed: false;
  externalAppOverlayAllowed: false;
  accessMode: "home_top_swipe_drawer_only";
  allowedSurface: "home_only";
};

export type SabiHomeVoiceFoundation = {
  entryRoute: "/ai/voice-control";
  wakeWords: readonly ["SABI", "Саби"];
  runtimeStatus: SabiHomeFoundationRuntimeStatus;
  providerStatus: SabiHomeProviderStatus;
  fakeListeningAllowed: false;
  fakeCommandSuccessAllowed: false;
  premiumRequiredForAdvancedVoice: boolean;
};

export type SabiHomeFoundationManifest = {
  ok: true;
  version: "HOME-100.17";
  generatedAt: string;
  mobileHomeRoute: "/";
  legacyHomeRouteBlocked: true;
  fakeDataAllowed: false;
  widgets: SabiHomeWidgetFoundation[];
  dock: SabiHomeDockFoundation[];
  notificationDigest: SabiHomeNotificationDigest;
  notificationPolicy: SabiHomeNotificationPolicy;
  voice: SabiHomeVoiceFoundation;
  search: {
    internalRegistryEnabled: true;
    internetSearchOpensBrowser: true;
    fakeExternalResultsAllowed: false;
  };
};

export type SabiHomeFoundationState = {
  manifest: SabiHomeFoundationManifest;
  source: "backend" | "local_fallback";
};
