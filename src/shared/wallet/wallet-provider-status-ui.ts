import type { WalletTranslator } from "./wallet-i18n";
import { walletText } from "./wallet-i18n";
import type {
  WalletAdminReviewStatus,
  WalletAmlStatus,
  WalletComplianceStatus,
  WalletFoundationSnapshot,
  WalletKycStatus,
  WalletProviderStatus,
} from "./wallet-foundation";

export type WalletProviderStatusPanelScope =
  | "wallet"
  | "settings"
  | "cards"
  | "virtual-card"
  | "coin"
  | "crypto";

export type WalletProviderStatusTone = "ready" | "pending" | "blocked" | "neutral";

export type WalletProviderStatusRow = {
  id: string;
  label: string;
  value: string;
  tone: WalletProviderStatusTone;
  detail?: string;
};

function statusTone(status: WalletProviderStatus): WalletProviderStatusTone {
  if (status === "ready") return "ready";
  if (status === "kyc_required" || status === "review_required") return "pending";
  if (status === "restricted") return "blocked";
  return "neutral";
}

function complianceTone(status: WalletComplianceStatus): WalletProviderStatusTone {
  if (status === "clear") return "ready";
  if (status === "kyc_required" || status === "aml_review" || status === "admin_review") return "pending";
  if (status === "safe_hold" || status === "restricted" || status === "blocked") return "blocked";
  return "neutral";
}

export function getWalletProviderStatusLabel(t: WalletTranslator, status: WalletProviderStatus) {
  switch (status) {
    case "ready":
      return walletText(t, "wallet.providerStatus.ready", "Ready");
    case "kyc_required":
      return walletText(t, "wallet.providerStatus.kycRequired", "KYC required");
    case "review_required":
      return walletText(t, "wallet.providerStatus.reviewRequired", "Review required");
    case "restricted":
      return walletText(t, "wallet.providerStatus.restricted", "Restricted");
    case "provider_not_configured":
    default:
      return walletText(t, "wallet.providerStatus.providerNotConfigured", "Provider not configured");
  }
}

export function getWalletComplianceStatusLabel(t: WalletTranslator, status: WalletComplianceStatus) {
  switch (status) {
    case "clear":
      return walletText(t, "wallet.complianceStatus.clear", "Clear");
    case "kyc_required":
      return walletText(t, "wallet.complianceStatus.kycRequired", "KYC required");
    case "aml_review":
      return walletText(t, "wallet.complianceStatus.amlReview", "AML review");
    case "admin_review":
      return walletText(t, "wallet.complianceStatus.adminReview", "Admin review");
    case "safe_hold":
      return walletText(t, "wallet.complianceStatus.safeHold", "Safe hold");
    case "restricted":
      return walletText(t, "wallet.complianceStatus.restricted", "Restricted");
    case "blocked":
    default:
      return walletText(t, "wallet.complianceStatus.blocked", "Blocked");
  }
}

export function getWalletKycStatusLabel(t: WalletTranslator, status: WalletKycStatus) {
  switch (status) {
    case "verified":
      return walletText(t, "wallet.kycStatus.verified", "Verified");
    case "required":
      return walletText(t, "wallet.kycStatus.required", "Required");
    case "pending":
      return walletText(t, "wallet.kycStatus.pending", "Pending");
    case "rejected":
      return walletText(t, "wallet.kycStatus.rejected", "Rejected");
    case "not_required":
    default:
      return walletText(t, "wallet.kycStatus.notRequired", "Not required");
  }
}

export function getWalletAmlStatusLabel(t: WalletTranslator, status: WalletAmlStatus) {
  switch (status) {
    case "monitoring":
      return walletText(t, "wallet.amlStatus.monitoring", "Monitoring");
    case "review_required":
      return walletText(t, "wallet.amlStatus.reviewRequired", "Review required");
    case "safe_hold":
      return walletText(t, "wallet.amlStatus.safeHold", "Safe hold");
    case "blocked":
      return walletText(t, "wallet.amlStatus.blocked", "Blocked");
    case "clear":
    default:
      return walletText(t, "wallet.amlStatus.clear", "Clear");
  }
}

export function getWalletAdminReviewStatusLabel(t: WalletTranslator, status: WalletAdminReviewStatus) {
  switch (status) {
    case "pending":
      return walletText(t, "wallet.adminReviewStatus.pending", "Pending");
    case "approved":
      return walletText(t, "wallet.adminReviewStatus.approved", "Approved");
    case "rejected":
      return walletText(t, "wallet.adminReviewStatus.rejected", "Rejected");
    case "escalated":
      return walletText(t, "wallet.adminReviewStatus.escalated", "Escalated");
    case "not_required":
    default:
      return walletText(t, "wallet.adminReviewStatus.notRequired", "Not required");
  }
}

function providerRow(
  t: WalletTranslator,
  id: string,
  labelKey: string,
  fallbackLabel: string,
  status: WalletProviderStatus,
  detail?: string,
): WalletProviderStatusRow {
  return {
    id,
    label: walletText(t, labelKey, fallbackLabel),
    value: getWalletProviderStatusLabel(t, status),
    tone: statusTone(status),
    detail,
  };
}

function complianceRow(t: WalletTranslator, snapshot: WalletFoundationSnapshot): WalletProviderStatusRow {
  return {
    id: "compliance",
    label: walletText(t, "wallet.providerPanel.compliance", "Compliance"),
    value: getWalletComplianceStatusLabel(t, snapshot.complianceStatus),
    tone: complianceTone(snapshot.complianceStatus),
    detail: snapshot.safeHoldReason || snapshot.restrictedReason || undefined,
  };
}

export function getWalletProviderPanelTitle(t: WalletTranslator, scope: WalletProviderStatusPanelScope) {
  switch (scope) {
    case "settings":
      return walletText(t, "wallet.providerPanel.settingsTitle", "Provider & compliance");
    case "cards":
      return walletText(t, "wallet.providerPanel.cardsTitle", "Card provider readiness");
    case "virtual-card":
      return walletText(t, "wallet.providerPanel.virtualCardTitle", "Issuer readiness");
    case "coin":
      return walletText(t, "wallet.providerPanel.coinTitle", "Coin bridge readiness");
    case "crypto":
      return walletText(t, "wallet.providerPanel.cryptoTitle", "Crypto provider readiness");
    case "wallet":
    default:
      return walletText(t, "wallet.providerPanel.walletTitle", "Provider readiness");
  }
}

export function getWalletProviderPanelHint(t: WalletTranslator, scope: WalletProviderStatusPanelScope) {
  switch (scope) {
    case "settings":
      return walletText(t, "wallet.providerPanel.settingsHint", "Backend/admin controlled; no secrets on mobile");
    case "cards":
      return walletText(t, "wallet.providerPanel.cardsHint", "Bank SDK/iFrame token route required");
    case "virtual-card":
      return walletText(t, "wallet.providerPanel.virtualCardHint", "Issuer provider and KYC must be ready");
    case "coin":
      return walletText(t, "wallet.providerPanel.coinHint", "COIN cash-out only through Sabi Wallet bridge");
    case "crypto":
      return walletText(t, "wallet.providerPanel.cryptoHint", "No fake prices, keys or blockchain transactions");
    case "wallet":
    default:
      return walletText(t, "wallet.providerPanel.walletHint", "Live operations require real bank/provider readiness");
  }
}

export function getWalletProviderStatusRows(
  t: WalletTranslator,
  snapshot: WalletFoundationSnapshot,
  scope: WalletProviderStatusPanelScope,
): WalletProviderStatusRow[] {
  switch (scope) {
    case "cards":
      return [
        providerRow(t, "card", "wallet.providerPanel.cardTokenization", "Card tokenization", snapshot.cardProviderStatus),
        providerRow(t, "bank", "wallet.providerPanel.bankGateway", "Bank gateway", snapshot.bankProviderStatus),
        providerRow(t, "virtual", "wallet.providerPanel.virtualIssuer", "Virtual issuer", snapshot.virtualCardProviderStatus),
        complianceRow(t, snapshot),
      ];
    case "virtual-card":
      return [
        providerRow(t, "virtual", "wallet.providerPanel.virtualIssuer", "Virtual issuer", snapshot.virtualCardProviderStatus),
        providerRow(t, "card", "wallet.providerPanel.cardTokenization", "Card tokenization", snapshot.cardProviderStatus),
        complianceRow(t, snapshot),
      ];
    case "coin":
      return [
        providerRow(t, "coin", "wallet.providerPanel.coinLedger", "Coin ledger", snapshot.coinProviderStatus),
        providerRow(t, "bank", "wallet.providerPanel.sabiWalletBridge", "Sabi Wallet bridge", snapshot.bankProviderStatus),
        complianceRow(t, snapshot),
      ];
    case "crypto":
      return [
        providerRow(t, "crypto", "wallet.providerPanel.cryptoCustody", "Crypto custody", snapshot.cryptoProviderStatus),
        complianceRow(t, snapshot),
      ];
    case "settings":
      return [
        providerRow(t, "bank", "wallet.providerPanel.bankGateway", "Bank gateway", snapshot.bankProviderStatus),
        providerRow(t, "card", "wallet.providerPanel.cardTokenization", "Card tokenization", snapshot.cardProviderStatus),
        providerRow(t, "virtual", "wallet.providerPanel.virtualIssuer", "Virtual issuer", snapshot.virtualCardProviderStatus),
        providerRow(t, "merchant", "wallet.providerPanel.merchantAcquiring", "Merchant acquiring", snapshot.merchantProviderStatus),
        providerRow(t, "business", "wallet.providerPanel.businessPayout", "Business payout", snapshot.businessProviderStatus),
        providerRow(t, "coin", "wallet.providerPanel.coinLedger", "Coin ledger", snapshot.coinProviderStatus),
        providerRow(t, "crypto", "wallet.providerPanel.cryptoCustody", "Crypto custody", snapshot.cryptoProviderStatus),
        complianceRow(t, snapshot),
      ];
    case "wallet":
    default:
      return [
        providerRow(t, "bank", "wallet.providerPanel.bankGateway", "Bank gateway", snapshot.bankProviderStatus),
        providerRow(t, "card", "wallet.providerPanel.cardTokenization", "Card tokenization", snapshot.cardProviderStatus),
        providerRow(t, "coin", "wallet.providerPanel.coinLedger", "Coin ledger", snapshot.coinProviderStatus),
        providerRow(t, "crypto", "wallet.providerPanel.cryptoCustody", "Crypto custody", snapshot.cryptoProviderStatus),
        complianceRow(t, snapshot),
      ];
  }
}

export function getWalletProviderTokenOnlyPolicyText(t: WalletTranslator) {
  return walletText(
    t,
    "wallet.providerPanel.tokenOnlyPolicy",
    "Token-only: PAN/CVV, API secrets, seed phrases and private keys are never stored on Sabi mobile or Sabi infrastructure.",
  );
}
