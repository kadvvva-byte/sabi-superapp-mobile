export type SabiGameCenterMode = "foundation_only" | "live";

export type SabiGameRewardRoute =
  | "inventory_only"
  | "coin_wallet_pending"
  | "gift_storage"
  | "no_reward";

export type SabiGameCenterPolicy = {
  mode: SabiGameCenterMode;
  realMoneyEconomyEnabled: boolean;
  directRevenueCreditEnabled: boolean;
  requiresUnifiedUserId: boolean;
  requiresCoinWalletRuntime: boolean;
  requiresGiftInventoryRuntime: boolean;
  requiresAdminAudit: boolean;
  rewardRoute: SabiGameRewardRoute;
  note: string;
};

export const SABI_GAME_CENTER_FOUNDATION_POLICY: SabiGameCenterPolicy = {
  mode: "foundation_only",
  realMoneyEconomyEnabled: false,
  directRevenueCreditEnabled: false,
  requiresUnifiedUserId: true,
  requiresCoinWalletRuntime: true,
  requiresGiftInventoryRuntime: true,
  requiresAdminAudit: true,
  rewardRoute: "inventory_only",
  note:
    "Game Center entries may exist before launch, but rewards, wheel/fishing economics, coin movement and gift inventory must stay disabled until real Coin Wallet, inventory, anti-fraud and admin audit are connected.",
};

export function assertSabiGameCenterLiveEconomyAllowed(policy = SABI_GAME_CENTER_FOUNDATION_POLICY) {
  if (policy.mode !== "live" || !policy.realMoneyEconomyEnabled) {
    throw new Error("sabi_game_center_live_economy_not_configured");
  }

  return true;
}
