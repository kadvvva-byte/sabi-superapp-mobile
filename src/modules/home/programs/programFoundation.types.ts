export type SabiHomeProgramCode =
  | "home"
  | "messenger"
  | "wallet"
  | "qr"
  | "ai"
  | "gallery"
  | "network_game_center"
  | "marketplace"
  | "hotels"
  | "taxi"
  | "supermarket"
  | "food_delivery"
  | "wholesale_market"
  | "stream"
  | "delivery"
  | "business"
  | "merchant"
  | "notifications"
  | "events"
  | "documents"
  | "wifi_cast";

export type SabiProgramRuntimeStatus =
  | "ready"
  | "foundation_ready"
  | "provider_required"
  | "temporarily_disabled"
  | "admin_only"
  | "api_unavailable";

export type SabiProgramProviderStatus =
  | "not_required"
  | "configured"
  | "provider_required"
  | "api_key_required"
  | "contract_required"
  | "api_unavailable";

export type SabiProgramCapability = {
  id: string;
  title: string;
  status: SabiProgramRuntimeStatus;
  providerStatus: SabiProgramProviderStatus;
  route?: string;
  apiPath?: string;
  notes?: string[];
};

export type SabiProgramFoundation = {
  code: SabiHomeProgramCode;
  title: string;
  mobileRoute: string;
  apiBasePath: string;
  runtimeStatus: SabiProgramRuntimeStatus;
  providerStatus: SabiProgramProviderStatus;
  enabledOnHome: boolean;
  fakeDataAllowed: false;
  paymentsRouteThroughWallet: boolean;
  qrEnabled: boolean;
  notificationsEnabled: boolean;
  aiHooksEnabled: boolean;
  adminReviewRequired: boolean;
  capabilities: SabiProgramCapability[];
  requiredProviders: string[];
  safetyHooks: string[];
  historyStreams: string[];
};

export type SabiProgramFoundationStatus = {
  ok: true;
  version: string;
  generatedAt: string;
  program: SabiProgramFoundation;
};

export type SabiProgramFoundationSource = "backend" | "local_unavailable";

export type SabiProgramFoundationLoadState =
  | { state: "idle" | "loading" }
  | { state: "loaded"; source: SabiProgramFoundationSource; status: SabiProgramFoundationStatus }
  | { state: "api_unavailable"; source: SabiProgramFoundationSource; status: SabiProgramFoundationStatus };
