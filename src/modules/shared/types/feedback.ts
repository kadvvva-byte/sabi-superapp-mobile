export type FeedbackTone =
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "danger"
  | "compliance";

export type WarningType =
  | "network_mismatch"
  | "memo_required"
  | "suspicious_address"
  | "irreversible_transfer"
  | "large_transfer"
  | "maintenance"
  | "provider_unavailable"
  | "verification_required"
  | "under_review"
  | "restricted_asset";