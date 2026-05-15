import type {
  WalletFoundationSnapshot,
  WalletProviderStatus,
} from "./wallet-foundation";
import {
  isWalletProviderReady,
  walletPayloadContainsForbiddenCardData,
} from "./wallet-foundation";
import { buildWalletComplianceView } from "./wallet-compliance";
import type {
  WalletLedgerProviderStatus,
  WalletLedgerRiskStatus,
  WalletLedgerRoute,
} from "./wallet-ledger";

export type WalletMoneyMovementFlow =
  | "sabi-wallet-transfer"
  | "card-to-card"
  | "sabi-wallet-to-card"
  | "card-to-sabi-wallet"
  | "topup"
  | "withdraw"
  | "receive"
  | "request-money"
  | "merchant-payment"
  | "merchant-settlement"
  | "business-payout"
  | "business-invoice"
  | "business-settlement"
  | "coin-topup"
  | "coin-send"
  | "coin-receive"
  | "coin-cashout-to-sabi-wallet"
  | "coin-cashout-to-card"
  | "coin-deposit"
  | "coin-diamond-conversion"
  | "wallet"
  | string;

export type WalletMoneyMovementRiskStatus =
  | "clear"
  | "pending_review"
  | "safe_hold"
  | "restricted"
  | "blocked";

export type WalletMoneyMovementBlockedReason =
  | "ok"
  | "invalid_amount"
  | "currency_not_configured"
  | "provider_not_configured"
  | "provider_not_ready"
  | "provider_token_required"
  | "risk_not_clear"
  | "kyc_required"
  | "aml_review_required"
  | "admin_review_required"
  | "safe_hold"
  | "wallet_restricted"
  | "compliance_blocked"
  | "raw_card_data_blocked";

export type WalletMoneyMovementGuardInput = {
  snapshot?: Partial<WalletFoundationSnapshot> | null;
  flow: WalletMoneyMovementFlow;
  amount: number;
  currencyCode?: string | null;
  providerTokenId?: string | null;
  riskStatus?: WalletMoneyMovementRiskStatus | null;
  payload?: unknown;
};

export type WalletMoneyMovementGuard = {
  flow: string;
  amount: number;
  currencyCode: string;
  providerRequired: boolean;
  providerStatus: WalletProviderStatus;
  ledgerProviderStatus: WalletLedgerProviderStatus;
  riskStatus: WalletMoneyMovementRiskStatus;
  ledgerRiskStatus: WalletLedgerRiskStatus;
  walletRoute: WalletLedgerRoute;
  requiresProviderToken: boolean;
  canPrepare: boolean;
  blockedReason: WalletMoneyMovementBlockedReason;
  blockedFieldsDetected: boolean;
};

function normalizeFlow(flow: WalletMoneyMovementFlow) {
  return String(flow || "wallet").trim().toLowerCase() || "wallet";
}

function normalizeAmount(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, value);
}

function normalizeCurrencyCode(value?: string | null) {
  return String(value || "").trim().toUpperCase();
}

function normalizeRiskStatus(value?: WalletMoneyMovementRiskStatus | null): WalletMoneyMovementRiskStatus {
  if (
    value === "pending_review" ||
    value === "safe_hold" ||
    value === "restricted" ||
    value === "blocked"
  ) {
    return value;
  }
  return "clear";
}

function riskPriority(value: WalletMoneyMovementRiskStatus) {
  switch (value) {
    case "blocked":
      return 4;
    case "restricted":
      return 3;
    case "safe_hold":
      return 2;
    case "pending_review":
      return 1;
    case "clear":
    default:
      return 0;
  }
}

function mergeRiskStatus(
  inputRisk: WalletMoneyMovementRiskStatus,
  complianceRisk: WalletMoneyMovementRiskStatus,
): WalletMoneyMovementRiskStatus {
  return riskPriority(complianceRisk) > riskPriority(inputRisk) ? complianceRisk : inputRisk;
}

function flowUsesCardProvider(flow: string) {
  return (
    flow.includes("card") ||
    flow.includes("topup") ||
    flow.includes("withdraw") ||
    flow.includes("virtual")
  );
}

function flowUsesExternalProvider(flow: string) {
  return (
    flowUsesCardProvider(flow) ||
    flow.includes("merchant") ||
    flow.includes("business") ||
    flow.includes("qr") ||
    flow.includes("coin") ||
    flow.includes("crypto") ||
    flow.includes("request") ||
    flow.includes("receive") ||
    flow.includes("transfer")
  );
}

function flowRequiresProviderToken(flow: string) {
  return flowUsesCardProvider(flow);
}

function resolveProviderStatus(
  snapshot: Partial<WalletFoundationSnapshot> | null | undefined,
  flow: string,
): WalletProviderStatus {
  if (flow.includes("crypto")) return snapshot?.cryptoProviderStatus || "provider_not_configured";
  if (flow.includes("coin")) return snapshot?.coinProviderStatus || "provider_not_configured";
  if (flow.includes("virtual")) return snapshot?.virtualCardProviderStatus || "provider_not_configured";
  if (flow.includes("merchant")) return snapshot?.merchantProviderStatus || "provider_not_configured";
  if (flow.includes("business")) return snapshot?.businessProviderStatus || "provider_not_configured";
  if (flowUsesCardProvider(flow)) return snapshot?.cardProviderStatus || "provider_not_configured";
  return snapshot?.bankProviderStatus || "provider_not_configured";
}

function resolveWalletRoute(flow: string): WalletLedgerRoute {
  if (flow.includes("topup") || flow === "card-to-sabi-wallet") return "wallet_topup";
  if (flow.includes("withdraw") || flow === "sabi-wallet-to-card") return "wallet_withdraw";
  if (flow.includes("receive") || flow.includes("request")) return "wallet_receive";
  if (flow.includes("card")) return "card_provider";
  if (flow.includes("merchant")) return "merchant";
  if (flow.includes("business")) return "business";
  if (flow.includes("qr")) return "qr_pay";
  if (flow.includes("coin")) return "coin_bridge";
  if (flow.includes("crypto")) return "crypto_provider";
  if (flow.includes("transfer") || flow.includes("send")) return "wallet_send";
  return "wallet";
}

function toLedgerProviderStatus(
  providerRequired: boolean,
  providerStatus: WalletProviderStatus,
): WalletLedgerProviderStatus {
  if (!providerRequired) return "provider_not_required";
  if (providerStatus === "ready") return "provider_pending";
  if (providerStatus === "restricted") return "provider_restricted";
  return "provider_not_configured";
}

function toLedgerRiskStatus(riskStatus: WalletMoneyMovementRiskStatus): WalletLedgerRiskStatus {
  return riskStatus;
}

function hasProviderToken(value?: string | null) {
  return String(value || "").trim().length >= 8;
}

export function buildWalletMoneyMovementGuard(
  input: WalletMoneyMovementGuardInput,
): WalletMoneyMovementGuard {
  const flow = normalizeFlow(input.flow);
  const amount = normalizeAmount(input.amount);
  const currencyCode = normalizeCurrencyCode(input.currencyCode);
  const providerRequired = flowUsesExternalProvider(flow);
  const providerStatus = resolveProviderStatus(input.snapshot, flow);
  const requiresProviderToken = flowRequiresProviderToken(flow);
  const complianceView = buildWalletComplianceView(input.snapshot, {
    providerStatus,
    payload: input.payload,
  });
  const riskStatus = mergeRiskStatus(normalizeRiskStatus(input.riskStatus), complianceView.riskStatus);
  const walletRoute = resolveWalletRoute(flow);
  const blockedFieldsDetected = walletPayloadContainsForbiddenCardData(input.payload);

  let blockedReason: WalletMoneyMovementBlockedReason = "ok";

  if (amount <= 0) {
    blockedReason = "invalid_amount";
  } else if (!currencyCode) {
    blockedReason = "currency_not_configured";
  } else if (blockedFieldsDetected) {
    blockedReason = "raw_card_data_blocked";
  } else if (complianceView.blockingReason === "kyc_required") {
    blockedReason = "kyc_required";
  } else if (complianceView.blockingReason === "aml_review_required") {
    blockedReason = "aml_review_required";
  } else if (complianceView.blockingReason === "admin_review_required") {
    blockedReason = "admin_review_required";
  } else if (complianceView.blockingReason === "safe_hold") {
    blockedReason = "safe_hold";
  } else if (complianceView.blockingReason === "wallet_restricted") {
    blockedReason = "wallet_restricted";
  } else if (complianceView.blockingReason === "compliance_blocked") {
    blockedReason = "compliance_blocked";
  } else if (riskStatus !== "clear") {
    blockedReason = "risk_not_clear";
  } else if (providerRequired && providerStatus === "provider_not_configured") {
    blockedReason = "provider_not_configured";
  } else if (providerRequired && !isWalletProviderReady(providerStatus)) {
    blockedReason = "provider_not_ready";
  } else if (requiresProviderToken && !hasProviderToken(input.providerTokenId)) {
    blockedReason = "provider_token_required";
  }

  return {
    flow,
    amount,
    currencyCode,
    providerRequired,
    providerStatus,
    ledgerProviderStatus: toLedgerProviderStatus(providerRequired, providerStatus),
    riskStatus,
    ledgerRiskStatus: toLedgerRiskStatus(riskStatus),
    walletRoute,
    requiresProviderToken,
    canPrepare: blockedReason === "ok",
    blockedReason,
    blockedFieldsDetected,
  };
}

export function walletMoneyMovementGuardParams(guard: WalletMoneyMovementGuard) {
  return {
    walletRoute: guard.walletRoute,
    providerRequired: String(guard.providerRequired),
    providerStatus: guard.providerStatus,
    ledgerProviderStatus: guard.ledgerProviderStatus,
    riskStatus: guard.riskStatus,
    ledgerRiskStatus: guard.ledgerRiskStatus,
    complianceReason: guard.blockedReason,
    guardReason: guard.blockedReason,
  };
}

export function isRawCardNumberLike(value: string) {
  const digits = String(value || "").replace(/\D/g, "");
  return digits.length >= 12 && digits.length <= 19;
}
