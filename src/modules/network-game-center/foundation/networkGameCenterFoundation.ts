import { resolveSabiApiBaseUrl } from "../../../shared/api/apiBaseUrl";
export type SabiFoundationProviderStatus =
  | "not_required"
  | "provider_required"
  | "api_key_required"
  | "contract_required"
  | "disabled";

export type SabiNetworkGameCenterCapability = {
  id: string;
  title: string;
  runtimeStatus: "foundation_ready" | "provider_required" | "disabled";
  providerStatus: SabiFoundationProviderStatus;
  route?: string;
  apiPath?: string;
  notes?: string[];
};

export type SabiNetworkGameCenterFoundationStatus = {
  ok: true;
  version: "HOME-100.4";
  module: "network_game_center";
  mobileRoute: "/network-game-center";
  apiBasePath: "/api/v2/network-game-center";
  runtimeStatus: "foundation_ready" | "api_unavailable";
  fakeDataAllowed: false;
  multiplayerProviderStatus: "provider_required";
  rewardsProviderStatus: "provider_required";
  walletRouteRequired: true;
  adminReviewSupported: true;
  capabilities: SabiNetworkGameCenterCapability[];
  rewardPolicy: {
    freePromoRewardsAreIncome: false;
    wonPromoGiftsAreIncome: false;
    financialIncomeRequiresPaidSource: true;
    coinRewardRequiresCoinWalletProvider: true;
    inventoryRewardsExpireDays: 30;
    notes: string[];
  };
};

function getApiBaseUrl() {
  return resolveSabiApiBaseUrl(undefined, { port: "4001" }).replace(/\/+$/, "");
}

export const SABI_NETWORK_GAME_CENTER_MOBILE_FOUNDATION: SabiNetworkGameCenterFoundationStatus = {
  ok: true,
  version: "HOME-100.4",
  module: "network_game_center",
  mobileRoute: "/network-game-center",
  apiBasePath: "/api/v2/network-game-center",
  runtimeStatus: "foundation_ready",
  fakeDataAllowed: false,
  multiplayerProviderStatus: "provider_required",
  rewardsProviderStatus: "provider_required",
  walletRouteRequired: true,
  adminReviewSupported: true,
  capabilities: [
    {
      id: "game_lobby",
      title: "Network lobby foundation",
      runtimeStatus: "foundation_ready",
      providerStatus: "provider_required",
      route: "/network-game-center",
    },
    {
      id: "realtime_matchmaking",
      title: "Realtime matchmaking",
      runtimeStatus: "provider_required",
      providerStatus: "provider_required",
    },
    {
      id: "leaderboards",
      title: "Leaderboards",
      runtimeStatus: "foundation_ready",
      providerStatus: "provider_required",
    },
    {
      id: "coin_rewards",
      title: "Coin and inventory reward hooks",
      runtimeStatus: "provider_required",
      providerStatus: "contract_required",
    },
  ],
  rewardPolicy: {
    freePromoRewardsAreIncome: false,
    wonPromoGiftsAreIncome: false,
    financialIncomeRequiresPaidSource: true,
    coinRewardRequiresCoinWalletProvider: true,
    inventoryRewardsExpireDays: 30,
    notes: [
      "Free, storage, won and promo gifts are inventory/activity only and must never be counted as income.",
      "Paid rewards need wallet, provider and admin/compliance hooks before financial history.",
    ],
  },
};

export async function fetchSabiNetworkGameCenterFoundationStatus(): Promise<SabiNetworkGameCenterFoundationStatus> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/api/v2/network-game-center/status`);
    if (!response.ok) {
      return { ...SABI_NETWORK_GAME_CENTER_MOBILE_FOUNDATION, runtimeStatus: "api_unavailable" };
    }

    const data = (await response.json()) as Partial<SabiNetworkGameCenterFoundationStatus>;
    return {
      ...SABI_NETWORK_GAME_CENTER_MOBILE_FOUNDATION,
      ...data,
      ok: true,
      fakeDataAllowed: false,
      runtimeStatus: data.runtimeStatus === "foundation_ready" ? "foundation_ready" : SABI_NETWORK_GAME_CENTER_MOBILE_FOUNDATION.runtimeStatus,
    };
  } catch {
    return { ...SABI_NETWORK_GAME_CENTER_MOBILE_FOUNDATION, runtimeStatus: "api_unavailable" };
  }
}
