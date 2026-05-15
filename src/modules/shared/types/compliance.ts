export type ComplianceLevel =
  | "none"
  | "basic"
  | "identity_verified"
  | "enhanced"
  | "approved";

export type ComplianceStatus =
  | "not_started"
  | "in_progress"
  | "under_review"
  | "approved"
  | "rejected"
  | "restricted";

export interface ComplianceProfile {
  level: ComplianceLevel;
  status: ComplianceStatus;
  canBuyCrypto: boolean;
  canSellCryptoToFiat: boolean;
  canWithdrawFiat: boolean;
  requiresSourceOfFunds: boolean;
  reviewMessage?: string;
}