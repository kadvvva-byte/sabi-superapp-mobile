import type {
  WalletComplianceStatus,
  WalletFoundationSnapshot,
  WalletProviderStatus,
} from "./wallet-foundation";

export type WalletFinalIntegrityArea =
  | "fiat_wallet"
  | "bank_cards"
  | "virtual_card"
  | "merchant"
  | "business"
  | "coin_wallet"
  | "crypto_wallet"
  | "qr_pay"
  | "admin_compliance";

export type WalletFinalIntegrityStatus = "ready" | "provider_not_configured" | "blocked";

export type WalletFinalIntegrityCheck = {
  area: WalletFinalIntegrityArea;
  status: WalletFinalIntegrityStatus;
  providerStatus: WalletProviderStatus;
  complianceStatus: WalletComplianceStatus;
  tokenOnly: boolean;
  liveExecutionAllowed: boolean;
  reason: string;
};

export type WalletFinalIntegritySnapshot = {
  canRunLiveMoneyMovement: boolean;
  canBindCard: boolean;
  canIssueVirtualCard: boolean;
  canRunMerchantSettlement: boolean;
  canRunBusinessPayout: boolean;
  canRunCoinBridge: boolean;
  canRunCryptoRoute: boolean;
  checks: WalletFinalIntegrityCheck[];
};

const BLOCKING_COMPLIANCE_STATUSES: WalletComplianceStatus[] = [
  "kyc_required",
  "aml_review",
  "admin_review",
  "safe_hold",
  "restricted",
  "blocked",
];

function isProviderReady(status: WalletProviderStatus) {
  return status === "ready";
}

function isComplianceClear(status: WalletComplianceStatus) {
  return !BLOCKING_COMPLIANCE_STATUSES.includes(status);
}

function buildCheck(params: {
  area: WalletFinalIntegrityArea;
  providerStatus: WalletProviderStatus;
  complianceStatus: WalletComplianceStatus;
  tokenOnly: boolean;
  reasonWhenProviderBlocked: string;
  reasonWhenComplianceBlocked: string;
}): WalletFinalIntegrityCheck {
  const providerReady = isProviderReady(params.providerStatus);
  const complianceClear = isComplianceClear(params.complianceStatus);
  const liveExecutionAllowed = providerReady && complianceClear && params.tokenOnly;

  return {
    area: params.area,
    status: liveExecutionAllowed
      ? "ready"
      : !providerReady
        ? "provider_not_configured"
        : "blocked",
    providerStatus: params.providerStatus,
    complianceStatus: params.complianceStatus,
    tokenOnly: params.tokenOnly,
    liveExecutionAllowed,
    reason: liveExecutionAllowed
      ? "ready"
      : !providerReady
        ? params.reasonWhenProviderBlocked
        : params.reasonWhenComplianceBlocked,
  };
}

export function buildWalletFinalIntegritySnapshot(
  snapshot: WalletFoundationSnapshot,
): WalletFinalIntegritySnapshot {
  const checks: WalletFinalIntegrityCheck[] = [
    buildCheck({
      area: "fiat_wallet",
      providerStatus: snapshot.bankProviderStatus,
      complianceStatus: snapshot.complianceStatus,
      tokenOnly: true,
      reasonWhenProviderBlocked: "bank_provider_not_configured",
      reasonWhenComplianceBlocked: "wallet_compliance_not_clear",
    }),
    buildCheck({
      area: "bank_cards",
      providerStatus: snapshot.cardProviderStatus,
      complianceStatus: snapshot.complianceStatus,
      tokenOnly: true,
      reasonWhenProviderBlocked: "card_provider_not_configured",
      reasonWhenComplianceBlocked: "card_compliance_not_clear",
    }),
    buildCheck({
      area: "virtual_card",
      providerStatus: snapshot.virtualCardProviderStatus,
      complianceStatus: snapshot.complianceStatus,
      tokenOnly: true,
      reasonWhenProviderBlocked: "virtual_card_issuer_not_configured",
      reasonWhenComplianceBlocked: "virtual_card_compliance_not_clear",
    }),
    buildCheck({
      area: "merchant",
      providerStatus: snapshot.merchantProviderStatus,
      complianceStatus: snapshot.complianceStatus,
      tokenOnly: true,
      reasonWhenProviderBlocked: "merchant_provider_not_configured",
      reasonWhenComplianceBlocked: "merchant_compliance_not_clear",
    }),
    buildCheck({
      area: "business",
      providerStatus: snapshot.businessProviderStatus,
      complianceStatus: snapshot.complianceStatus,
      tokenOnly: true,
      reasonWhenProviderBlocked: "business_provider_not_configured",
      reasonWhenComplianceBlocked: "business_compliance_not_clear",
    }),
    buildCheck({
      area: "coin_wallet",
      providerStatus: snapshot.coinProviderStatus,
      complianceStatus: snapshot.complianceStatus,
      tokenOnly: true,
      reasonWhenProviderBlocked: "coin_provider_not_configured",
      reasonWhenComplianceBlocked: "coin_compliance_not_clear",
    }),
    buildCheck({
      area: "crypto_wallet",
      providerStatus: snapshot.cryptoProviderStatus,
      complianceStatus: snapshot.complianceStatus,
      tokenOnly: true,
      reasonWhenProviderBlocked: "crypto_provider_not_configured",
      reasonWhenComplianceBlocked: "crypto_compliance_not_clear",
    }),
    buildCheck({
      area: "qr_pay",
      providerStatus: snapshot.bankProviderStatus,
      complianceStatus: snapshot.complianceStatus,
      tokenOnly: true,
      reasonWhenProviderBlocked: "wallet_qr_provider_not_configured",
      reasonWhenComplianceBlocked: "wallet_qr_compliance_not_clear",
    }),
    buildCheck({
      area: "admin_compliance",
      providerStatus: isComplianceClear(snapshot.complianceStatus) ? "ready" : "review_required",
      complianceStatus: snapshot.complianceStatus,
      tokenOnly: true,
      reasonWhenProviderBlocked: "admin_or_compliance_review_required",
      reasonWhenComplianceBlocked: "admin_or_compliance_review_required",
    }),
  ];

  const byArea = new Map(checks.map((check) => [check.area, check]));

  return {
    canRunLiveMoneyMovement: Boolean(byArea.get("fiat_wallet")?.liveExecutionAllowed),
    canBindCard: Boolean(byArea.get("bank_cards")?.liveExecutionAllowed),
    canIssueVirtualCard: Boolean(byArea.get("virtual_card")?.liveExecutionAllowed),
    canRunMerchantSettlement: Boolean(byArea.get("merchant")?.liveExecutionAllowed),
    canRunBusinessPayout: Boolean(byArea.get("business")?.liveExecutionAllowed),
    canRunCoinBridge: Boolean(byArea.get("coin_wallet")?.liveExecutionAllowed),
    canRunCryptoRoute: Boolean(byArea.get("crypto_wallet")?.liveExecutionAllowed),
    checks,
  };
}

export function walletFinalIntegrityAllowsLiveLaunch(snapshot: WalletFoundationSnapshot) {
  return buildWalletFinalIntegritySnapshot(snapshot).checks.every(
    (check) => check.liveExecutionAllowed,
  );
}
