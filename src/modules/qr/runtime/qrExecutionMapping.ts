import type {
  SabiQrDomain,
  SabiQrExecuteResponse,
  SabiQrExecutionPolicy,
  SabiQrFunctionCode,
  SabiQrFunctionDefinition,
  SabiQrRail,
  SabiQrSurface,
  SabiQrTokenRecord,
} from "../contracts/universalQr.contracts";

export type SabiQrExecutorKey =
  | "profile.identity.open"
  | "wallet.receive.intent"
  | "wallet.user.payment"
  | "coin.receive.intent"
  | "coin.transfer.intent"
  | "crypto.receive.provider"
  | "merchant.static.entry"
  | "merchant.dynamic.order"
  | "business.invoice"
  | "messenger.profile.open"
  | "messenger.payment.intent"
  | "marketplace.order.intent"
  | "stream.donation.intent"
  | "taxi.trip.payment"
  | "delivery.order.payment"
  | "school.attendance.check_in"
  | "school.attendance.check_out"
  | "work.attendance.check_in"
  | "work.attendance.check_out"
  | "virtual_card.issuance"
  | "virtual_card.payment"
  | "admin.provider.registry";

export type SabiQrProviderKey =
  | "profile_core"
  | "sabi_wallet_core"
  | "coin_wallet_core"
  | "crypto_provider"
  | "merchant_wallet_core"
  | "business_wallet_core"
  | "messenger_core"
  | "marketplace_core"
  | "stream_wallet_core"
  | "taxi_payment_core"
  | "delivery_payment_core"
  | "school_attendance_core"
  | "work_attendance_core"
  | "virtual_card_provider"
  | "admin_provider_registry";

export type SabiQrExecutionMappingItem = {
  functionCode: SabiQrFunctionCode;
  surface: SabiQrSurface;
  domain: SabiQrDomain;
  rail: SabiQrRail;
  executionPolicy: SabiQrExecutionPolicy;
  executorKey: SabiQrExecutorKey;
  providerKey: SabiQrProviderKey;
  providerRequired: boolean;
  adminProviderRequired: boolean;
  unavailableStatus: Exclude<SabiQrExecuteResponse["status"], "success">;
};

const SABI_QR_EXECUTION_MAPPING: Record<SabiQrFunctionCode, SabiQrExecutionMappingItem> = {
  profile_identity: {
    functionCode: "profile_identity",
    surface: "profile",
    domain: "identity",
    rail: "messenger",
    executionPolicy: "identity_open_only",
    executorKey: "profile.identity.open",
    providerKey: "profile_core",
    providerRequired: false,
    adminProviderRequired: false,
    unavailableStatus: "executor_not_configured",
  },
  wallet_receive: {
    functionCode: "wallet_receive",
    surface: "wallet",
    domain: "payment",
    rail: "sabi_wallet",
    executionPolicy: "server_validate_only",
    executorKey: "wallet.receive.intent",
    providerKey: "sabi_wallet_core",
    providerRequired: true,
    adminProviderRequired: false,
    unavailableStatus: "provider_not_configured",
  },
  wallet_user_payment: {
    functionCode: "wallet_user_payment",
    surface: "wallet",
    domain: "payment",
    rail: "sabi_wallet",
    executionPolicy: "wallet_payment_intent_required",
    executorKey: "wallet.user.payment",
    providerKey: "sabi_wallet_core",
    providerRequired: true,
    adminProviderRequired: false,
    unavailableStatus: "provider_not_configured",
  },
  merchant_static_entry: {
    functionCode: "merchant_static_entry",
    surface: "merchant",
    domain: "payment",
    rail: "merchant_wallet",
    executionPolicy: "wallet_payment_intent_required",
    executorKey: "merchant.static.entry",
    providerKey: "merchant_wallet_core",
    providerRequired: true,
    adminProviderRequired: true,
    unavailableStatus: "provider_not_configured",
  },
  merchant_dynamic_order: {
    functionCode: "merchant_dynamic_order",
    surface: "merchant",
    domain: "order",
    rail: "merchant_wallet",
    executionPolicy: "wallet_payment_intent_required",
    executorKey: "merchant.dynamic.order",
    providerKey: "merchant_wallet_core",
    providerRequired: true,
    adminProviderRequired: true,
    unavailableStatus: "provider_not_configured",
  },
  business_invoice: {
    functionCode: "business_invoice",
    surface: "business",
    domain: "invoice",
    rail: "business_wallet",
    executionPolicy: "wallet_payment_intent_required",
    executorKey: "business.invoice",
    providerKey: "business_wallet_core",
    providerRequired: true,
    adminProviderRequired: true,
    unavailableStatus: "provider_not_configured",
  },
  coin_wallet_receive: {
    functionCode: "coin_wallet_receive",
    surface: "coin_wallet",
    domain: "transfer",
    rail: "coin_wallet",
    executionPolicy: "coin_wallet_intent_required",
    executorKey: "coin.receive.intent",
    providerKey: "coin_wallet_core",
    providerRequired: true,
    adminProviderRequired: false,
    unavailableStatus: "executor_not_configured",
  },
  coin_wallet_transfer: {
    functionCode: "coin_wallet_transfer",
    surface: "coin_wallet",
    domain: "transfer",
    rail: "coin_wallet",
    executionPolicy: "coin_wallet_intent_required",
    executorKey: "coin.transfer.intent",
    providerKey: "coin_wallet_core",
    providerRequired: true,
    adminProviderRequired: false,
    unavailableStatus: "executor_not_configured",
  },
  crypto_wallet_receive: {
    functionCode: "crypto_wallet_receive",
    surface: "crypto_wallet",
    domain: "transfer",
    rail: "crypto_wallet",
    executionPolicy: "crypto_receive_only",
    executorKey: "crypto.receive.provider",
    providerKey: "crypto_provider",
    providerRequired: true,
    adminProviderRequired: true,
    unavailableStatus: "provider_not_configured",
  },
  messenger_profile: {
    functionCode: "messenger_profile",
    surface: "messenger",
    domain: "identity",
    rail: "messenger",
    executionPolicy: "identity_open_only",
    executorKey: "messenger.profile.open",
    providerKey: "messenger_core",
    providerRequired: false,
    adminProviderRequired: false,
    unavailableStatus: "executor_not_configured",
  },
  messenger_payment: {
    functionCode: "messenger_payment",
    surface: "messenger",
    domain: "payment",
    rail: "messenger",
    executionPolicy: "wallet_payment_intent_required",
    executorKey: "messenger.payment.intent",
    providerKey: "messenger_core",
    providerRequired: true,
    adminProviderRequired: false,
    unavailableStatus: "executor_not_configured",
  },
  marketplace_order: {
    functionCode: "marketplace_order",
    surface: "marketplace",
    domain: "order",
    rail: "marketplace",
    executionPolicy: "server_execute_required",
    executorKey: "marketplace.order.intent",
    providerKey: "marketplace_core",
    providerRequired: true,
    adminProviderRequired: true,
    unavailableStatus: "executor_not_configured",
  },
  stream_donation: {
    functionCode: "stream_donation",
    surface: "stream",
    domain: "donation",
    rail: "stream",
    executionPolicy: "server_execute_required",
    executorKey: "stream.donation.intent",
    providerKey: "stream_wallet_core",
    providerRequired: true,
    adminProviderRequired: true,
    unavailableStatus: "executor_not_configured",
  },
  taxi_trip_payment: {
    functionCode: "taxi_trip_payment",
    surface: "taxi",
    domain: "payment",
    rail: "taxi",
    executionPolicy: "server_execute_required",
    executorKey: "taxi.trip.payment",
    providerKey: "taxi_payment_core",
    providerRequired: true,
    adminProviderRequired: true,
    unavailableStatus: "executor_not_configured",
  },
  delivery_order: {
    functionCode: "delivery_order",
    surface: "delivery",
    domain: "order",
    rail: "delivery",
    executionPolicy: "server_execute_required",
    executorKey: "delivery.order.payment",
    providerKey: "delivery_payment_core",
    providerRequired: true,
    adminProviderRequired: true,
    unavailableStatus: "executor_not_configured",
  },
  school_check_in: {
    functionCode: "school_check_in",
    surface: "school_attendance",
    domain: "attendance",
    rail: "school",
    executionPolicy: "attendance_record_required",
    executorKey: "school.attendance.check_in",
    providerKey: "school_attendance_core",
    providerRequired: true,
    adminProviderRequired: true,
    unavailableStatus: "executor_not_configured",
  },
  school_check_out: {
    functionCode: "school_check_out",
    surface: "school_attendance",
    domain: "attendance",
    rail: "school",
    executionPolicy: "attendance_record_required",
    executorKey: "school.attendance.check_out",
    providerKey: "school_attendance_core",
    providerRequired: true,
    adminProviderRequired: true,
    unavailableStatus: "executor_not_configured",
  },
  work_check_in: {
    functionCode: "work_check_in",
    surface: "work_attendance",
    domain: "attendance",
    rail: "work",
    executionPolicy: "attendance_record_required",
    executorKey: "work.attendance.check_in",
    providerKey: "work_attendance_core",
    providerRequired: true,
    adminProviderRequired: true,
    unavailableStatus: "executor_not_configured",
  },
  work_check_out: {
    functionCode: "work_check_out",
    surface: "work_attendance",
    domain: "attendance",
    rail: "work",
    executionPolicy: "attendance_record_required",
    executorKey: "work.attendance.check_out",
    providerKey: "work_attendance_core",
    providerRequired: true,
    adminProviderRequired: true,
    unavailableStatus: "executor_not_configured",
  },
  virtual_card_issuance: {
    functionCode: "virtual_card_issuance",
    surface: "virtual_card",
    domain: "card_issuing",
    rail: "virtual_card_provider",
    executionPolicy: "card_issuing_provider_required",
    executorKey: "virtual_card.issuance",
    providerKey: "virtual_card_provider",
    providerRequired: true,
    adminProviderRequired: true,
    unavailableStatus: "provider_not_configured",
  },
  virtual_card_payment: {
    functionCode: "virtual_card_payment",
    surface: "virtual_card",
    domain: "payment",
    rail: "virtual_card_provider",
    executionPolicy: "card_issuing_provider_required",
    executorKey: "virtual_card.payment",
    providerKey: "virtual_card_provider",
    providerRequired: true,
    adminProviderRequired: true,
    unavailableStatus: "provider_not_configured",
  },
  provider_api_admin: {
    functionCode: "provider_api_admin",
    surface: "verification",
    domain: "provider_setup",
    rail: "admin_provider_registry",
    executionPolicy: "provider_admin_required",
    executorKey: "admin.provider.registry",
    providerKey: "admin_provider_registry",
    providerRequired: true,
    adminProviderRequired: true,
    unavailableStatus: "restricted",
  },
};

function hasText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeErrorCode(value: unknown): string {
  return hasText(value) ? value.trim().toLowerCase() : "";
}

export function getSabiQrExecutionMapping(functionCode: SabiQrFunctionCode): SabiQrExecutionMappingItem {
  return SABI_QR_EXECUTION_MAPPING[functionCode];
}

export function createSabiQrExecutionContext(
  definition: SabiQrFunctionDefinition,
  token: SabiQrTokenRecord,
): Record<string, string | boolean> {
  const mapping = getSabiQrExecutionMapping(definition.code);

  return {
    qrFunctionCode: definition.code,
    qrSurface: definition.surface,
    qrDomain: definition.domain,
    qrRail: definition.rail,
    qrExecutionPolicy: definition.executionPolicy,
    qrExecutorKey: mapping.executorKey,
    qrProviderKey: mapping.providerKey,
    qrProviderRequired: mapping.providerRequired,
    qrAdminProviderRequired: mapping.adminProviderRequired,
    qrTrustState: token.trustState,
    qrActorUserId: token.actorUserId,
  };
}

export function getSabiQrExecuteReasonForStatus(status: SabiQrExecuteResponse["status"]): string {
  switch (status) {
    case "provider_not_configured":
      return "qr.mobile.result.providerNotConfigured.description";
    case "executor_not_configured":
      return "qr.mobile.result.executorNotConfigured.description";
    case "restricted":
      return "qr.mobile.result.restricted.description";
    case "pending_review":
      return "qr.mobile.result.pendingReview.description";
    case "success":
      return "qr.mobile.result.success.description";
    case "failed":
    default:
      return "qr.mobile.result.failed.description";
  }
}

export function normalizeSabiQrExecuteFailure(
  rawCode: unknown,
  httpStatus?: number,
  fallbackFunctionCode?: SabiQrFunctionCode,
): SabiQrExecuteResponse {
  const code = normalizeErrorCode(rawCode);

  if (code.includes("auth_required") || code.includes("actor_user_id_required")) {
    return { ok: false, status: "failed", reason: "qr.mobile.error.authRequired" };
  }

  if (code.includes("amount_required") || code.includes("qr_amount_required")) {
    return { ok: false, status: "failed", reason: "qr.mobile.error.amountRequired" };
  }

  if (code.includes("reference_required")) {
    return { ok: false, status: "failed", reason: "qr.mobile.error.referenceRequired" };
  }

  if (code.includes("counterparty_required")) {
    return { ok: false, status: "failed", reason: "qr.mobile.error.counterpartyRequired" };
  }

  if (code.includes("invalid_qr") || code.includes("qr_token_not_found") || code.includes("expired")) {
    return { ok: false, status: "failed", reason: "qr.mobile.error.expiredOrMissing" };
  }

  if (
    code.includes("provider_not_configured") ||
    code.includes("provider_not_connected") ||
    code.includes("provider_unavailable") ||
    code.includes("provider_required") ||
    code.includes("signing_secret_not_configured") ||
    code.includes("api_key_not_configured") ||
    code.includes("virtual_card_provider") ||
    code.includes("crypto_provider")
  ) {
    return {
      ok: false,
      status: "provider_not_configured",
      reason: getSabiQrExecuteReasonForStatus("provider_not_configured"),
    };
  }

  if (
    code.includes("restricted") ||
    code.includes("forbidden") ||
    code.includes("blocked") ||
    code.includes("safe_hold") ||
    code.includes("compliance") ||
    code.includes("aml") ||
    code.includes("kyc") ||
    code.includes("kyb") ||
    code.includes("risk_hold")
  ) {
    return {
      ok: false,
      status: "restricted",
      reason: getSabiQrExecuteReasonForStatus("restricted"),
    };
  }

  if (
    code.includes("pending_review") ||
    code.includes("review_required") ||
    code.includes("admin_review") ||
    code.includes("manual_review")
  ) {
    return {
      ok: false,
      status: "pending_review",
      reason: getSabiQrExecuteReasonForStatus("pending_review"),
    };
  }

  if (
    code.includes("executor_not_configured") ||
    code.includes("executor_required") ||
    code.includes("execution_not_configured") ||
    code.includes("route_not_supported") ||
    code.includes("not_supported") ||
    code.includes("not_implemented") ||
    code.includes("module_not_ready") ||
    code.includes("feature_not_ready") ||
    httpStatus === 404 ||
    httpStatus === 501
  ) {
    const mappedStatus = fallbackFunctionCode
      ? getSabiQrExecutionMapping(fallbackFunctionCode).unavailableStatus
      : "executor_not_configured";

    return {
      ok: false,
      status: mappedStatus,
      reason: getSabiQrExecuteReasonForStatus(mappedStatus),
    };
  }

  return {
    ok: false,
    status: "failed",
    reason: hasText(rawCode) && rawCode.startsWith("qr.mobile.") ? rawCode : getSabiQrExecuteReasonForStatus("failed"),
  };
}

export function normalizeSabiQrExecuteStatus(value: unknown): SabiQrExecuteResponse["status"] {
  const status = normalizeErrorCode(value);
  if (status === "success" || status === "successfully_executed" || status === "executed") return "success";
  if (status === "pending_review" || status === "review_required") return "pending_review";
  if (status === "provider_not_configured") return "provider_not_configured";
  if (status === "executor_not_configured") return "executor_not_configured";
  if (status === "restricted") return "restricted";
  if (status === "success" || status === "SUCCESS".toLowerCase()) return "success";
  if (status === "failed" || status === "error" || status === "rejected") return "failed";
  return "failed";
}
