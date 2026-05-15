export const SABI_QR_VERSION = "QR-100" as const;

export type SabiQrMode =
  | "merchant_presented_static"
  | "merchant_presented_dynamic"
  | "merchant_presented_private"
  | "user_presented_dynamic"
  | "identity_static"
  | "attendance_dynamic"
  | "provider_setup";

export type SabiQrSurface =
  | "profile"
  | "wallet"
  | "coin_wallet"
  | "crypto_wallet"
  | "merchant"
  | "business"
  | "messenger"
  | "marketplace"
  | "stream"
  | "taxi"
  | "delivery"
  | "school_attendance"
  | "work_attendance"
  | "virtual_card"
  | "verification";

export type SabiQrDomain =
  | "identity"
  | "payment"
  | "transfer"
  | "invoice"
  | "order"
  | "attendance"
  | "donation"
  | "card_issuing"
  | "provider_setup";

export type SabiQrRail =
  | "sabi_wallet"
  | "coin_wallet"
  | "crypto_wallet"
  | "merchant_wallet"
  | "business_wallet"
  | "messenger"
  | "marketplace"
  | "stream"
  | "taxi"
  | "delivery"
  | "school"
  | "work"
  | "virtual_card_provider"
  | "admin_provider_registry";

export type SabiQrFunctionCode =
  | "profile_identity"
  | "wallet_receive"
  | "wallet_user_payment"
  | "merchant_static_entry"
  | "merchant_dynamic_order"
  | "business_invoice"
  | "coin_wallet_receive"
  | "coin_wallet_transfer"
  | "crypto_wallet_receive"
  | "messenger_profile"
  | "messenger_payment"
  | "marketplace_order"
  | "stream_donation"
  | "taxi_trip_payment"
  | "delivery_order"
  | "school_check_in"
  | "school_check_out"
  | "work_check_in"
  | "work_check_out"
  | "virtual_card_issuance"
  | "virtual_card_payment"
  | "provider_api_admin";

export type SabiQrRiskLevel = "low" | "medium" | "high" | "critical";

export type SabiQrExecutionPolicy =
  | "identity_open_only"
  | "server_validate_only"
  | "server_execute_required"
  | "wallet_payment_intent_required"
  | "coin_wallet_intent_required"
  | "crypto_receive_only"
  | "attendance_record_required"
  | "provider_admin_required"
  | "card_issuing_provider_required";

export type SabiQrTrustState =
  | "server_signed"
  | "server_validated"
  | "pending_admin_setup"
  | "provider_not_configured"
  | "expired"
  | "rejected"
  | "client_preview_unsigned";


export type SabiQrVerifiedIdentitySnapshot = {
  userId: string;
  firstName?: string | null;
  lastName?: string | null;
  displayName?: string | null;
  username?: string | null;
  sabiDisplayId?: string | null;
  verificationStatus?: string | null;
  profileCompleted?: boolean;
  source?: "verified_auth_profile" | string;
};

export type SabiQrFunctionDefinition = {
  code: SabiQrFunctionCode;
  title: string;
  subtitle: string;
  surface: SabiQrSurface;
  domain: SabiQrDomain;
  rail: SabiQrRail;
  mode: SabiQrMode;
  executionPolicy: SabiQrExecutionPolicy;
  riskLevel: SabiQrRiskLevel;
  requiresAmount: boolean;
  requiresReference: boolean;
  requiresCounterparty: boolean;
  requiresKyc: boolean;
  requiresKyb: boolean;
  requiresProvider: boolean;
  requiresAdminProviderConfig: boolean;
  tokenTtlSeconds: number;
  brandTone: "blue" | "emerald" | "purple" | "gold" | "cyan" | "rose" | "slate";
};

export type SabiQrTokenRequest = {
  functionCode: SabiQrFunctionCode;
  actorUserId: string;
  amount?: string | null;
  currency?: string | null;
  reference?: string | null;
  counterpartyId?: string | null;
  organizationId?: string | null;
  verifiedIdentity?: SabiQrVerifiedIdentitySnapshot;
  metadata?: Record<string, string | number | boolean | null | undefined>;
};

export type SabiQrTokenRecord = {
  version: typeof SABI_QR_VERSION;
  tokenId: string;
  qrValue: string;
  shortValue: string;
  functionCode: SabiQrFunctionCode;
  surface: SabiQrSurface;
  domain: SabiQrDomain;
  rail: SabiQrRail;
  mode: SabiQrMode;
  executionPolicy: SabiQrExecutionPolicy;
  trustState: SabiQrTrustState;
  actorUserId: string;
  amount?: string | null;
  currency?: string | null;
  reference?: string | null;
  counterpartyId?: string | null;
  organizationId?: string | null;
  verifiedIdentity?: SabiQrVerifiedIdentitySnapshot;
  metadata?: Record<string, string | number | boolean | null | undefined>;
  issuedAt: string;
  expiresAt: string;
  signaturePreview: string;
  adminRequired: boolean;
  providerRequired: boolean;
};

export type SabiQrResolveResponse = {
  ok: boolean;
  token?: SabiQrTokenRecord;
  function?: SabiQrFunctionDefinition;
  reason?: string;
  adminAction?: string;
};

export type SabiQrValidateResponse = {
  valid: boolean;
  trustState: SabiQrTrustState;
  reason?: string;
  token?: SabiQrTokenRecord;
  function?: SabiQrFunctionDefinition;
};

export type SabiQrExecuteResponse = {
  ok: boolean;
  status:
    | "success"
    | "failed"
    | "pending_review"
    | "provider_not_configured"
    | "executor_not_configured"
    | "restricted";
  transactionId?: string;
  attendanceRecordId?: string;
  reviewId?: string;
  reason?: string;
};

export type SabiQrProviderKeyVisibility =
  | "admin_secret_only"
  | "server_env_only"
  | "provider_vault_reference_only";

export type SabiQrProviderRegistryItem = {
  providerId: string;
  title: string;
  module: SabiQrSurface | "payments" | "ai" | "sms" | "maps" | "cards";
  status: "not_configured" | "sandbox" | "production" | "disabled" | "review_required";
  keyVisibility: SabiQrProviderKeyVisibility;
  mobileCanReadSecret: false;
  requiredAdminFields: string[];
  requiredWebhooks: string[];
  tokenOnlyStorage: boolean;
};

// Backward-compatible aliases for pre-QR-100 builders/screens.
export type SabiQrPayload = SabiQrTokenRecord | {
  version: string;
  qrId?: string;
  tokenId?: string;
  mode?: SabiQrMode | string;
  surface?: SabiQrSurface | string;
  rail?: SabiQrRail | string;
  ownerUserId?: string;
  actorUserId?: string;
  [key: string]: unknown;
};

export type SabiQrIdentityPayload = SabiQrPayload & {
  publicProfileId?: string | null;
  username?: string | null;
  phoneMasked?: string | null;
};

export type SabiQrMoneyPayload = SabiQrPayload & {
  rail: SabiQrRail;
  amount?: string | null;
  currency?: string | null;
  coinAmount?: string | null;
  orderId?: string | null;
  paymentPurpose?: string | null;
  receiverWalletId?: string | null;
  payerWalletId?: string | null;
};

export type SabiQrAttendancePayload = SabiQrPayload & {
  organizationId: string;
  attendanceSessionId: string;
  locationId?: string | null;
};

export function getSabiQrDefaultRail(surface: SabiQrSurface): SabiQrRail {
  switch (surface) {
    case "wallet":
      return "sabi_wallet";
    case "coin_wallet":
      return "coin_wallet";
    case "crypto_wallet":
      return "crypto_wallet";
    case "merchant":
      return "merchant_wallet";
    case "business":
      return "business_wallet";
    case "marketplace":
      return "marketplace";
    case "stream":
      return "stream";
    case "taxi":
      return "taxi";
    case "delivery":
      return "delivery";
    case "school_attendance":
      return "school";
    case "work_attendance":
      return "work";
    case "virtual_card":
      return "virtual_card_provider";
    case "profile":
    case "messenger":
    case "verification":
    default:
      return "messenger";
  }
}
