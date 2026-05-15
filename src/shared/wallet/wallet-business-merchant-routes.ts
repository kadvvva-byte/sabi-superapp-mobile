import type {
  WalletFoundationSnapshot,
  WalletProviderStatus,
} from "./wallet-foundation";
import { isWalletProviderReady, walletPayloadContainsForbiddenCardData } from "./wallet-foundation";
import {
  buildWalletMoneyMovementGuard,
  type WalletMoneyMovementRiskStatus,
} from "./wallet-money-movement";
import type {
  WalletLedgerProviderStatus,
  WalletLedgerRiskStatus,
  WalletLedgerRoute,
} from "./wallet-ledger";

export const WALLET_BUSINESS_MERCHANT_ROUTE_VERSION = "WALLET-100.8" as const;

export type WalletBusinessMerchantRouteKind = "merchant" | "business";
export type WalletBusinessMerchantFundingSource = "wallet" | "merchant" | "business";

export type WalletBusinessMerchantBlockedReason =
  | "ok"
  | "invalid_amount"
  | "currency_not_configured"
  | "route_mismatch"
  | "provider_not_configured"
  | "provider_not_ready"
  | "risk_not_clear"
  | "raw_card_data_blocked"
  | "route_launch_not_configured";

export type WalletBusinessMerchantRouteGuardInput = {
  snapshot?: Partial<WalletFoundationSnapshot> | null;
  routeKind: WalletBusinessMerchantRouteKind;
  fundingSource: WalletBusinessMerchantFundingSource;
  amount: number;
  currencyCode?: string | null;
  riskStatus?: WalletMoneyMovementRiskStatus | null;
  payload?: unknown;
};

export type WalletBusinessMerchantRouteGuard = {
  version: typeof WALLET_BUSINESS_MERCHANT_ROUTE_VERSION;
  routeKind: WalletBusinessMerchantRouteKind;
  fundingSource: WalletBusinessMerchantFundingSource;
  walletRoute: WalletLedgerRoute;
  providerStatus: WalletProviderStatus;
  ledgerProviderStatus: WalletLedgerProviderStatus;
  riskStatus: WalletMoneyMovementRiskStatus;
  ledgerRiskStatus: WalletLedgerRiskStatus;
  amount: number;
  currencyCode: string;
  providerRequired: true;
  kybRequired: boolean;
  adminReviewRequired: boolean;
  settlementRequired: boolean;
  personalWalletBridgeOnly: boolean;
  rawCardDataBlocked: boolean;
  canProcess: boolean;
  blockedReason: WalletBusinessMerchantBlockedReason;
};

function normalizeAmount(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, value);
}

function normalizeCurrencyCode(value?: string | null) {
  return String(value || "").trim().toUpperCase();
}

function normalizeRiskStatus(value?: WalletMoneyMovementRiskStatus | null): WalletMoneyMovementRiskStatus {
  if (value === "pending_review" || value === "safe_hold" || value === "restricted" || value === "blocked") {
    return value;
  }
  return "clear";
}

function resolveRouteProviderStatus(
  snapshot: Partial<WalletFoundationSnapshot> | null | undefined,
  routeKind: WalletBusinessMerchantRouteKind,
): WalletProviderStatus {
  if (routeKind === "merchant") return snapshot?.merchantProviderStatus || "provider_not_configured";
  return snapshot?.businessProviderStatus || "provider_not_configured";
}

function toLedgerProviderStatus(providerStatus: WalletProviderStatus): WalletLedgerProviderStatus {
  if (providerStatus === "ready") return "provider_pending";
  if (providerStatus === "restricted") return "provider_restricted";
  return "provider_not_configured";
}

function toLedgerRiskStatus(riskStatus: WalletMoneyMovementRiskStatus): WalletLedgerRiskStatus {
  return riskStatus;
}

function routeMatchesFundingSource(
  routeKind: WalletBusinessMerchantRouteKind,
  fundingSource: WalletBusinessMerchantFundingSource,
) {
  if (fundingSource === "wallet") return true;
  return routeKind === fundingSource;
}

export function isBusinessMerchantRouteLaunchConfigured() {
  // Live acquiring/settlement must be connected through backend/admin provider config.
  // Keep disabled until real bank/payment provider + KYB/KYC + ledger settlement route exists.
  return false;
}

export function buildWalletBusinessMerchantRouteGuard(
  input: WalletBusinessMerchantRouteGuardInput,
): WalletBusinessMerchantRouteGuard {
  const routeKind = input.routeKind;
  const amount = normalizeAmount(input.amount);
  const currencyCode = normalizeCurrencyCode(input.currencyCode);
  const riskStatus = normalizeRiskStatus(input.riskStatus);
  const providerStatus = resolveRouteProviderStatus(input.snapshot, routeKind);
  const walletRoute: WalletLedgerRoute = routeKind;
  const rawCardDataBlocked = walletPayloadContainsForbiddenCardData(input.payload);
  const movementGuard = buildWalletMoneyMovementGuard({
    snapshot: input.snapshot,
    flow: routeKind === "merchant" ? "merchant-payment" : "business-payout",
    amount,
    currencyCode,
    riskStatus,
    payload: input.payload,
  });

  let blockedReason: WalletBusinessMerchantBlockedReason = "ok";

  if (amount <= 0 || movementGuard.blockedReason === "invalid_amount") {
    blockedReason = "invalid_amount";
  } else if (!currencyCode || movementGuard.blockedReason === "currency_not_configured") {
    blockedReason = "currency_not_configured";
  } else if (rawCardDataBlocked || movementGuard.blockedReason === "raw_card_data_blocked") {
    blockedReason = "raw_card_data_blocked";
  } else if (!routeMatchesFundingSource(routeKind, input.fundingSource)) {
    blockedReason = "route_mismatch";
  } else if (riskStatus !== "clear" || movementGuard.blockedReason === "risk_not_clear") {
    blockedReason = "risk_not_clear";
  } else if (providerStatus === "provider_not_configured") {
    blockedReason = "provider_not_configured";
  } else if (!isWalletProviderReady(providerStatus)) {
    blockedReason = "provider_not_ready";
  } else if (!isBusinessMerchantRouteLaunchConfigured()) {
    blockedReason = "route_launch_not_configured";
  }

  return {
    version: WALLET_BUSINESS_MERCHANT_ROUTE_VERSION,
    routeKind,
    fundingSource: input.fundingSource,
    walletRoute,
    providerStatus,
    ledgerProviderStatus: toLedgerProviderStatus(providerStatus),
    riskStatus,
    ledgerRiskStatus: toLedgerRiskStatus(riskStatus),
    amount,
    currencyCode,
    providerRequired: true,
    kybRequired: true,
    adminReviewRequired: true,
    settlementRequired: true,
    personalWalletBridgeOnly: input.fundingSource === "wallet",
    rawCardDataBlocked,
    canProcess: blockedReason === "ok",
    blockedReason,
  };
}

export function walletBusinessMerchantRouteParams(guard: WalletBusinessMerchantRouteGuard) {
  return {
    walletRouteVersion: guard.version,
    walletRoute: guard.walletRoute,
    routeKind: guard.routeKind,
    fundingSource: guard.fundingSource,
    providerStatus: guard.providerStatus,
    ledgerProviderStatus: guard.ledgerProviderStatus,
    riskStatus: guard.riskStatus,
    ledgerRiskStatus: guard.ledgerRiskStatus,
    guardReason: guard.blockedReason,
    providerRequired: String(guard.providerRequired),
    kybRequired: String(guard.kybRequired),
    adminReviewRequired: String(guard.adminReviewRequired),
    settlementRequired: String(guard.settlementRequired),
    personalWalletBridgeOnly: String(guard.personalWalletBridgeOnly),
    rawCardDataBlocked: String(guard.rawCardDataBlocked),
  };
}
