import type {
  WalletFoundationSnapshot,
  WalletProviderStatus,
} from "./wallet-foundation";
import {
  isWalletProviderReady,
  walletPayloadContainsForbiddenCardData,
} from "./wallet-foundation";
import type {
  WalletLedgerProviderStatus,
  WalletLedgerRiskStatus,
  WalletLedgerRoute,
} from "./wallet-ledger";

export const WALLET_COIN_BRIDGE_VERSION = "WALLET-100.9" as const;

export type CoinWalletBridgeRouteKind =
  | "view"
  | "topup"
  | "send"
  | "receive"
  | "history"
  | "cashout_to_sabi_wallet"
  | "cashout_to_card"
  | "coin_to_diamond"
  | "diamond_to_coin"
  | "deposit_open"
  | "deposit_interest"
  | "deposit_release"
  | "gift_income_settlement"
  | "stream_income_settlement"
  | "qr_receive"
  | "qr_pay"
  | "use_cases";

export type CoinWalletBridgeRiskStatus =
  | "clear"
  | "pending_review"
  | "safe_hold"
  | "restricted"
  | "blocked";

export type CoinWalletBridgeBlockedReason =
  | "ok"
  | "invalid_amount"
  | "provider_not_configured"
  | "provider_not_ready"
  | "risk_not_clear"
  | "raw_card_data_blocked"
  | "direct_card_withdraw_blocked"
  | "sabi_wallet_bridge_not_configured"
  | "route_launch_not_configured";

export type CoinWalletBridgeGuardInput = {
  snapshot?: Partial<WalletFoundationSnapshot> | null;
  routeKind: CoinWalletBridgeRouteKind;
  amountCoin?: number | null;
  riskStatus?: CoinWalletBridgeRiskStatus | null;
  payload?: unknown;
};

export type CoinWalletBridgeGuard = {
  version: typeof WALLET_COIN_BRIDGE_VERSION;
  routeKind: CoinWalletBridgeRouteKind;
  walletRoute: WalletLedgerRoute;
  providerStatus: WalletProviderStatus;
  ledgerProviderStatus: WalletLedgerProviderStatus;
  riskStatus: CoinWalletBridgeRiskStatus;
  ledgerRiskStatus: WalletLedgerRiskStatus;
  amountCoin: number;
  providerRequired: boolean;
  ledgerRequired: true;
  adminReviewRequired: boolean;
  sabiWalletBridgeRequired: boolean;
  directCardCashoutBlocked: boolean;
  rawCardDataBlocked: boolean;
  canProcess: boolean;
  blockedReason: CoinWalletBridgeBlockedReason;
};

function normalizeAmount(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) return 0;
  return Math.max(0, value);
}

function normalizeRiskStatus(value?: CoinWalletBridgeRiskStatus | null): CoinWalletBridgeRiskStatus {
  if (value === "pending_review" || value === "safe_hold" || value === "restricted" || value === "blocked") {
    return value;
  }
  return "clear";
}

function toLedgerProviderStatus(providerStatus: WalletProviderStatus): WalletLedgerProviderStatus {
  if (providerStatus === "ready") return "provider_pending";
  if (providerStatus === "restricted") return "provider_restricted";
  if (providerStatus === "review_required" || providerStatus === "kyc_required") return "provider_pending";
  return "provider_not_configured";
}

function toLedgerRiskStatus(riskStatus: CoinWalletBridgeRiskStatus): WalletLedgerRiskStatus {
  return riskStatus;
}

function routeRequiresAmount(routeKind: CoinWalletBridgeRouteKind) {
  return [
    "topup",
    "send",
    "cashout_to_sabi_wallet",
    "cashout_to_card",
    "coin_to_diamond",
    "diamond_to_coin",
    "deposit_open",
    "gift_income_settlement",
    "stream_income_settlement",
    "qr_pay",
  ].includes(routeKind);
}

function routeRequiresSabiWalletBridge(routeKind: CoinWalletBridgeRouteKind) {
  return [
    "cashout_to_sabi_wallet",
    "diamond_to_coin",
    "deposit_release",
    "gift_income_settlement",
    "stream_income_settlement",
  ].includes(routeKind);
}

export function isCoinWalletProviderLaunchConfigured() {
  // Live COIN operations must be connected through backend/admin provider config.
  // Keep disabled until real Coin ledger, provider settlement, unified user ID and risk hooks exist.
  return false;
}

export function isCoinSabiWalletBridgeConfigured() {
  // COIN can cash out only through controlled Sabi Wallet bridge.
  // Direct bank-card withdrawal from Coin Wallet is not allowed.
  return false;
}

export function isCoinDirectCardCashoutAllowed() {
  return false;
}

export function buildCoinWalletBridgeGuard(input: CoinWalletBridgeGuardInput): CoinWalletBridgeGuard {
  const routeKind = input.routeKind;
  const amountCoin = normalizeAmount(input.amountCoin);
  const riskStatus = normalizeRiskStatus(input.riskStatus);
  const providerStatus = input.snapshot?.coinProviderStatus || "provider_not_configured";
  const rawCardDataBlocked = walletPayloadContainsForbiddenCardData(input.payload);
  const directCardCashoutBlocked = routeKind === "cashout_to_card" && !isCoinDirectCardCashoutAllowed();
  const sabiWalletBridgeRequired = routeRequiresSabiWalletBridge(routeKind);
  const providerRequired = routeKind !== "view" && routeKind !== "history";

  let blockedReason: CoinWalletBridgeBlockedReason = "ok";

  if (rawCardDataBlocked) {
    blockedReason = "raw_card_data_blocked";
  } else if (directCardCashoutBlocked) {
    blockedReason = "direct_card_withdraw_blocked";
  } else if (routeRequiresAmount(routeKind) && amountCoin <= 0) {
    blockedReason = "invalid_amount";
  } else if (riskStatus !== "clear") {
    blockedReason = "risk_not_clear";
  } else if (providerRequired && providerStatus === "provider_not_configured") {
    blockedReason = "provider_not_configured";
  } else if (providerRequired && !isWalletProviderReady(providerStatus)) {
    blockedReason = "provider_not_ready";
  } else if (sabiWalletBridgeRequired && !isCoinSabiWalletBridgeConfigured()) {
    blockedReason = "sabi_wallet_bridge_not_configured";
  } else if (providerRequired && !isCoinWalletProviderLaunchConfigured()) {
    blockedReason = "route_launch_not_configured";
  }

  return {
    version: WALLET_COIN_BRIDGE_VERSION,
    routeKind,
    walletRoute: "coin_bridge",
    providerStatus,
    ledgerProviderStatus: toLedgerProviderStatus(providerStatus),
    riskStatus,
    ledgerRiskStatus: toLedgerRiskStatus(riskStatus),
    amountCoin,
    providerRequired,
    ledgerRequired: true,
    adminReviewRequired: true,
    sabiWalletBridgeRequired,
    directCardCashoutBlocked,
    rawCardDataBlocked,
    canProcess: blockedReason === "ok",
    blockedReason,
  };
}

export function coinWalletBridgeParams(guard: CoinWalletBridgeGuard): Record<string, string> {
  return {
    walletBridgeVersion: guard.version,
    walletRoute: guard.walletRoute,
    routeKind: guard.routeKind,
    providerStatus: guard.providerStatus,
    ledgerProviderStatus: guard.ledgerProviderStatus,
    riskStatus: guard.riskStatus,
    ledgerRiskStatus: guard.ledgerRiskStatus,
    guardReason: guard.blockedReason,
    providerRequired: String(guard.providerRequired),
    ledgerRequired: String(guard.ledgerRequired),
    adminReviewRequired: String(guard.adminReviewRequired),
    sabiWalletBridgeRequired: String(guard.sabiWalletBridgeRequired),
    directCardCashoutBlocked: String(guard.directCardCashoutBlocked),
    rawCardDataBlocked: String(guard.rawCardDataBlocked),
  };
}

export function assertCoinWalletProviderExecution(action: string): never {
  throw new Error(
    `${action} requires the real Sabi Wallet backend, Coin provider, unified user ID, ledger and risk/admin confirmation. Local COIN mutation is disabled.`,
  );
}
