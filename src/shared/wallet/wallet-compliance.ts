import type {
  WalletAdminReviewStatus,
  WalletAmlStatus,
  WalletComplianceStatus,
  WalletFoundationSnapshot,
  WalletKycStatus,
  WalletProviderStatus,
} from "./wallet-foundation";
import { walletPayloadContainsForbiddenCardData } from "./wallet-foundation";

export type WalletComplianceRiskStatus =
  | "clear"
  | "pending_review"
  | "safe_hold"
  | "restricted"
  | "blocked";

export type WalletComplianceBlockingReason =
  | "ok"
  | "raw_card_data_blocked"
  | "kyc_required"
  | "aml_review_required"
  | "admin_review_required"
  | "safe_hold"
  | "wallet_restricted"
  | "compliance_blocked"
  | "provider_not_configured";

export type WalletComplianceView = {
  complianceStatus: WalletComplianceStatus;
  kycStatus: WalletKycStatus;
  amlStatus: WalletAmlStatus;
  adminReviewStatus: WalletAdminReviewStatus;
  providerStatus: WalletProviderStatus;
  riskStatus: WalletComplianceRiskStatus;
  blockingReason: WalletComplianceBlockingReason;
  canProceed: boolean;
  adminReviewRequired: boolean;
  safeHoldRequired: boolean;
  providerConfigurationRequired: boolean;
  tokenOnlyCardData: true;
  panStorageAllowed: false;
  cvvStorageAllowed: false;
  safeHoldReason: string;
  restrictedReason: string;
};

export type WalletComplianceViewInput = {
  providerStatus?: WalletProviderStatus | null;
  payload?: unknown;
};

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeComplianceStatus(value: unknown): WalletComplianceStatus {
  const status = normalizeText(value).toLowerCase();
  if (
    status === "kyc_required" ||
    status === "aml_review" ||
    status === "admin_review" ||
    status === "safe_hold" ||
    status === "restricted" ||
    status === "blocked"
  ) {
    return status;
  }
  return "clear";
}

function normalizeKycStatus(value: unknown): WalletKycStatus {
  const status = normalizeText(value).toLowerCase();
  if (status === "required" || status === "pending" || status === "verified" || status === "rejected") {
    return status;
  }
  return "not_required";
}

function normalizeAmlStatus(value: unknown): WalletAmlStatus {
  const status = normalizeText(value).toLowerCase();
  if (status === "monitoring" || status === "review_required" || status === "safe_hold" || status === "blocked") {
    return status;
  }
  return "clear";
}

function normalizeAdminReviewStatus(value: unknown): WalletAdminReviewStatus {
  const status = normalizeText(value).toLowerCase();
  if (status === "pending" || status === "approved" || status === "rejected" || status === "escalated") {
    return status;
  }
  return "not_required";
}

function resolveProviderStatus(
  snapshot?: Partial<WalletFoundationSnapshot> | null,
  providerStatus?: WalletProviderStatus | null,
): WalletProviderStatus {
  return (
    providerStatus ||
    snapshot?.bankProviderStatus ||
    snapshot?.cardProviderStatus ||
    "provider_not_configured"
  );
}

export function buildWalletComplianceView(
  snapshot?: Partial<WalletFoundationSnapshot> | null,
  input: WalletComplianceViewInput = {},
): WalletComplianceView {
  const complianceStatus = normalizeComplianceStatus(snapshot?.complianceStatus);
  const kycStatus = normalizeKycStatus(snapshot?.kycStatus);
  const amlStatus = normalizeAmlStatus(snapshot?.amlStatus);
  const adminReviewStatus = normalizeAdminReviewStatus(snapshot?.adminReviewStatus);
  const providerStatus = resolveProviderStatus(snapshot, input.providerStatus);
  const rawCardDataBlocked = walletPayloadContainsForbiddenCardData(input.payload);
  const providerConfigurationRequired = providerStatus === "provider_not_configured";

  let riskStatus: WalletComplianceRiskStatus = "clear";
  let blockingReason: WalletComplianceBlockingReason = "ok";

  if (rawCardDataBlocked) {
    riskStatus = "blocked";
    blockingReason = "raw_card_data_blocked";
  } else if (complianceStatus === "blocked" || amlStatus === "blocked" || kycStatus === "rejected") {
    riskStatus = "blocked";
    blockingReason = "compliance_blocked";
  } else if (complianceStatus === "restricted" || providerStatus === "restricted") {
    riskStatus = "restricted";
    blockingReason = "wallet_restricted";
  } else if (complianceStatus === "safe_hold" || amlStatus === "safe_hold") {
    riskStatus = "safe_hold";
    blockingReason = "safe_hold";
  } else if (complianceStatus === "aml_review" || amlStatus === "review_required") {
    riskStatus = "safe_hold";
    blockingReason = "aml_review_required";
  } else if (complianceStatus === "admin_review" || adminReviewStatus === "pending" || adminReviewStatus === "escalated") {
    riskStatus = "pending_review";
    blockingReason = "admin_review_required";
  } else if (complianceStatus === "kyc_required" || kycStatus === "required" || kycStatus === "pending") {
    riskStatus = "pending_review";
    blockingReason = "kyc_required";
  } else if (providerConfigurationRequired) {
    riskStatus = "clear";
    blockingReason = "provider_not_configured";
  }

  return {
    complianceStatus,
    kycStatus,
    amlStatus,
    adminReviewStatus,
    providerStatus,
    riskStatus,
    blockingReason,
    canProceed: blockingReason === "ok",
    adminReviewRequired:
      blockingReason === "admin_review_required" ||
      blockingReason === "aml_review_required" ||
      adminReviewStatus === "pending" ||
      adminReviewStatus === "escalated",
    safeHoldRequired:
      riskStatus === "safe_hold" ||
      blockingReason === "aml_review_required" ||
      blockingReason === "safe_hold",
    providerConfigurationRequired,
    tokenOnlyCardData: true,
    panStorageAllowed: false,
    cvvStorageAllowed: false,
    safeHoldReason: normalizeText(snapshot?.safeHoldReason),
    restrictedReason: normalizeText(snapshot?.restrictedReason),
  };
}

export function walletComplianceStatusLabel(status: WalletComplianceStatus) {
  switch (status) {
    case "kyc_required":
      return "KYC required";
    case "aml_review":
      return "AML review";
    case "admin_review":
      return "Admin review";
    case "safe_hold":
      return "Safe hold";
    case "restricted":
      return "Restricted";
    case "blocked":
      return "Blocked";
    case "clear":
    default:
      return "Clear";
  }
}
