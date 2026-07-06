import type { SabiHomeDockFoundation, SabiHomeFoundationManifest, SabiHomeWidgetFoundation } from "./homeFoundation.types";

export const SABI_HOME_WIDGET_FOUNDATIONS: SabiHomeWidgetFoundation[] = [
  { code: "messenger", title: "Messenger", route: "/tabs/chats", runtimeStatus: "ready", providerStatus: "not_required", visibleOnHome: true, fakeDataAllowed: false, notificationsEnabled: true, aiHooksEnabled: true, qrHooksEnabled: true, walletRouteRequired: true, adminReviewHook: true },
  { code: "wallet", title: "Wallet", route: "/wallet/home", runtimeStatus: "provider_required", providerStatus: "contract_required", visibleOnHome: true, fakeDataAllowed: false, notificationsEnabled: true, aiHooksEnabled: true, qrHooksEnabled: true, walletRouteRequired: true, adminReviewHook: true },
  { code: "qr", title: "QR", route: "/qr", runtimeStatus: "foundation_ready", providerStatus: "provider_required", visibleOnHome: true, fakeDataAllowed: false, notificationsEnabled: true, aiHooksEnabled: true, qrHooksEnabled: true, walletRouteRequired: true, adminReviewHook: true },
  { code: "alerts", title: "Alerts", route: "/notifications", runtimeStatus: "foundation_ready", providerStatus: "not_required", visibleOnHome: true, fakeDataAllowed: false, notificationsEnabled: true, aiHooksEnabled: true, qrHooksEnabled: true, walletRouteRequired: false, adminReviewHook: true },
  { code: "events", title: "Events", route: "/events", runtimeStatus: "foundation_ready", providerStatus: "not_required", visibleOnHome: true, fakeDataAllowed: false, notificationsEnabled: true, aiHooksEnabled: false, qrHooksEnabled: false, walletRouteRequired: false, adminReviewHook: false },
  { code: "ai", title: "AI", route: "/ai", runtimeStatus: "provider_required", providerStatus: "api_key_required", visibleOnHome: true, fakeDataAllowed: false, notificationsEnabled: true, aiHooksEnabled: true, qrHooksEnabled: false, walletRouteRequired: false, adminReviewHook: true },
  { code: "sabi_voice", title: "SABI Voice", route: "/ai/voice-control", runtimeStatus: "foundation_ready", providerStatus: "api_key_required", visibleOnHome: true, fakeDataAllowed: false, notificationsEnabled: true, aiHooksEnabled: true, qrHooksEnabled: false, walletRouteRequired: false, adminReviewHook: true },
  { code: "gallery", title: "Gallery", route: "/gallery", runtimeStatus: "foundation_ready", providerStatus: "not_required", visibleOnHome: true, fakeDataAllowed: false, notificationsEnabled: true, aiHooksEnabled: true, qrHooksEnabled: false, walletRouteRequired: false, adminReviewHook: true },
  { code: "game_center", title: "Game Center", route: "/network-game-center", runtimeStatus: "foundation_ready", providerStatus: "provider_required", visibleOnHome: true, fakeDataAllowed: false, notificationsEnabled: true, aiHooksEnabled: false, qrHooksEnabled: false, walletRouteRequired: true, adminReviewHook: true },
  { code: "marketplace", title: "SilkRoad", route: "/marketplace", runtimeStatus: "foundation_ready", providerStatus: "contract_required", visibleOnHome: true, fakeDataAllowed: false, notificationsEnabled: true, aiHooksEnabled: true, qrHooksEnabled: true, walletRouteRequired: true, adminReviewHook: true },
  { code: "hotels", title: "Hotels", route: "/hotels", runtimeStatus: "foundation_ready", providerStatus: "contract_required", visibleOnHome: true, fakeDataAllowed: false, notificationsEnabled: true, aiHooksEnabled: true, qrHooksEnabled: true, walletRouteRequired: true, adminReviewHook: true },
  { code: "taxi", title: "Taxi", route: "/taxi", runtimeStatus: "foundation_ready", providerStatus: "contract_required", visibleOnHome: true, fakeDataAllowed: false, notificationsEnabled: true, aiHooksEnabled: true, qrHooksEnabled: true, walletRouteRequired: true, adminReviewHook: true },
  { code: "supermarket", title: "Supermarket", route: "/supermarket", runtimeStatus: "foundation_ready", providerStatus: "contract_required", visibleOnHome: true, fakeDataAllowed: false, notificationsEnabled: true, aiHooksEnabled: true, qrHooksEnabled: true, walletRouteRequired: true, adminReviewHook: true },
  { code: "food_delivery", title: "Food Delivery", route: "/food-delivery", runtimeStatus: "foundation_ready", providerStatus: "contract_required", visibleOnHome: true, fakeDataAllowed: false, notificationsEnabled: true, aiHooksEnabled: true, qrHooksEnabled: true, walletRouteRequired: true, adminReviewHook: true },
  { code: "wholesale_market", title: "Wholesale", route: "/wholesale-market", runtimeStatus: "foundation_ready", providerStatus: "contract_required", visibleOnHome: true, fakeDataAllowed: false, notificationsEnabled: true, aiHooksEnabled: true, qrHooksEnabled: true, walletRouteRequired: true, adminReviewHook: true },
  { code: "stream", title: "Stream", route: "/stream", runtimeStatus: "foundation_ready", providerStatus: "contract_required", visibleOnHome: true, fakeDataAllowed: false, notificationsEnabled: true, aiHooksEnabled: true, qrHooksEnabled: true, walletRouteRequired: true, adminReviewHook: true },
  { code: "business", title: "Business", route: "/business", runtimeStatus: "foundation_ready", providerStatus: "contract_required", visibleOnHome: true, fakeDataAllowed: false, notificationsEnabled: true, aiHooksEnabled: true, qrHooksEnabled: true, walletRouteRequired: true, adminReviewHook: true },
  { code: "merchant", title: "Merchant", route: "/merchant", runtimeStatus: "foundation_ready", providerStatus: "contract_required", visibleOnHome: true, fakeDataAllowed: false, notificationsEnabled: true, aiHooksEnabled: true, qrHooksEnabled: true, walletRouteRequired: true, adminReviewHook: true },
  { code: "documents", title: "Documents", route: "/documents", runtimeStatus: "foundation_ready", providerStatus: "not_required", visibleOnHome: true, fakeDataAllowed: false, notificationsEnabled: true, aiHooksEnabled: false, qrHooksEnabled: false, walletRouteRequired: false, adminReviewHook: false },
  { code: "camera", title: "Camera", route: "/camera", runtimeStatus: "foundation_ready", providerStatus: "not_required", visibleOnHome: true, fakeDataAllowed: false, notificationsEnabled: false, aiHooksEnabled: true, qrHooksEnabled: false, walletRouteRequired: false, adminReviewHook: true },
  { code: "wifi_cast", title: "Wi‑Fi Cast", route: "/wifi-cast", runtimeStatus: "foundation_ready", providerStatus: "not_required", visibleOnHome: true, fakeDataAllowed: false, notificationsEnabled: false, aiHooksEnabled: false, qrHooksEnabled: false, walletRouteRequired: false, adminReviewHook: false },
];

export const SABI_HOME_DOCK_FOUNDATIONS: SabiHomeDockFoundation[] = [
  { code: "call", title: "Calls", route: "/tabs/calls", mobileVisible: true, webVisible: true },
  { code: "chat", title: "Chats", route: "/tabs/chats", mobileVisible: true, webVisible: true },
  { code: "wallet", title: "Wallet", route: "/wallet/home", mobileVisible: true, webVisible: true },
  { code: "mini_apps", title: "Mini Apps", route: "/mini-apps", mobileVisible: false, webVisible: true },
];

export function buildLocalSabiHomeFoundationManifest(): SabiHomeFoundationManifest {
  return {
    ok: true,
    version: "HOME-100.17",
    generatedAt: new Date().toISOString(),
    mobileHomeRoute: "/",
    legacyHomeRouteBlocked: true,
    fakeDataAllowed: false,
    widgets: SABI_HOME_WIDGET_FOUNDATIONS,
    dock: SABI_HOME_DOCK_FOUNDATIONS,
    notificationDigest: {
      missedCalls: null,
      unreadMessages: null,
      events: null,
      aiAlerts: null,
      securityAlerts: null,
      walletAlerts: null,
    },
    notificationPolicy: {
      defaultVisibleOnHome: false,
      persistentHomeBannerAllowed: false,
      overlayAboveOtherAppsAllowed: false,
      externalAppOverlayAllowed: false,
      accessMode: "home_top_swipe_drawer_only",
      allowedSurface: "home_only",
    },
    voice: {
      entryRoute: "/ai/voice-control",
      wakeWords: ["SABI", "Саби"],
      runtimeStatus: "foundation_ready",
      providerStatus: "api_key_required",
      fakeListeningAllowed: false,
      fakeCommandSuccessAllowed: false,
      premiumRequiredForAdvancedVoice: true,
    },
    search: {
      internalRegistryEnabled: true,
      internetSearchOpensBrowser: true,
      fakeExternalResultsAllowed: false,
    },
  };
}
