import type {
  SabiQrExecuteResponse,
  SabiQrFunctionCode,
  SabiQrRail,
  SabiQrSurface,
} from "../contracts/universalQr.contracts";

export type SabiQrModuleHistoryBucket =
  | "identity_activity"
  | "wallet_transactions"
  | "coin_wallet_transactions"
  | "crypto_wallet_activity"
  | "merchant_orders"
  | "business_invoices"
  | "messenger_activity"
  | "marketplace_orders"
  | "stream_donations"
  | "taxi_trips"
  | "delivery_orders"
  | "school_attendance"
  | "work_attendance"
  | "virtual_card_operations"
  | "provider_admin_activity";

export type SabiQrModuleStatusTarget =
  | "profile_runtime"
  | "sabi_wallet_runtime"
  | "coin_wallet_runtime"
  | "crypto_wallet_runtime"
  | "merchant_wallet_runtime"
  | "business_wallet_runtime"
  | "messenger_runtime"
  | "marketplace_runtime"
  | "stream_wallet_runtime"
  | "taxi_runtime"
  | "delivery_runtime"
  | "school_attendance_runtime"
  | "work_attendance_runtime"
  | "virtual_card_runtime"
  | "admin_provider_runtime";

export type SabiQrAdminRiskCategory =
  | "none"
  | "payment_compliance_review"
  | "merchant_business_review"
  | "coin_wallet_review"
  | "crypto_aml_review"
  | "attendance_integrity_review"
  | "virtual_card_provider_review"
  | "provider_configuration_review";

export type SabiQrModuleIntegrationPlan = {
  functionCode: SabiQrFunctionCode;
  surface: SabiQrSurface;
  rail: SabiQrRail;
  moduleTitleKey: string;
  statusTarget: SabiQrModuleStatusTarget;
  statusTargetKey: string;
  historyBucket: SabiQrModuleHistoryBucket;
  historyBucketKey: string;
  adminRiskCategory: SabiQrAdminRiskCategory;
  adminRiskKey: string;
  shouldCreateHistoryRecord: boolean;
  shouldCreateAdminSignalOn:
    | "never"
    | "pending_review_or_restricted"
    | "non_success"
    | "provider_setup";
};

export type SabiQrAdminRiskSignal = {
  shouldReport: boolean;
  category: SabiQrAdminRiskCategory;
  functionCode: SabiQrFunctionCode;
  surface: SabiQrSurface;
  rail: SabiQrRail;
  status: SabiQrExecuteResponse["status"];
  tokenId?: string;
  transactionId?: string;
  attendanceRecordId?: string;
  reviewId?: string;
  reason?: string;
  createdAt: string;
};

export type SabiQrModuleStatusRecord = {
  id: string;
  functionCode: SabiQrFunctionCode;
  surface: SabiQrSurface;
  rail: SabiQrRail;
  status: SabiQrExecuteResponse["status"];
  ok: boolean;
  statusTarget: SabiQrModuleStatusTarget;
  historyBucket: SabiQrModuleHistoryBucket;
  moduleTitleKey: string;
  statusTargetKey: string;
  historyBucketKey: string;
  adminRiskCategory: SabiQrAdminRiskCategory;
  adminRiskKey: string;
  tokenId?: string;
  transactionId?: string;
  attendanceRecordId?: string;
  reviewId?: string;
  reason?: string;
  createdAt: string;
  adminRiskSignal: SabiQrAdminRiskSignal;
};

export type SabiQrResultIntegrationSummary = {
  plan: SabiQrModuleIntegrationPlan;
  record: SabiQrModuleStatusRecord;
  historyLabelKey: string;
  statusLabelKey: string;
  adminLabelKey: string;
};

const WALLET_STATUS_KEY = "qr.mobile.integration.status.wallet";
const WALLET_HISTORY_KEY = "qr.mobile.integration.history.wallet";
const PAYMENT_ADMIN_KEY = "qr.mobile.integration.admin.paymentCompliance";

export const SABI_QR_MODULE_INTEGRATION_PLANS: Record<SabiQrFunctionCode, SabiQrModuleIntegrationPlan> = {
  profile_identity: {
    functionCode: "profile_identity",
    surface: "profile",
    rail: "messenger",
    moduleTitleKey: "qr.mobile.integration.module.profile",
    statusTarget: "profile_runtime",
    statusTargetKey: "qr.mobile.integration.status.profile",
    historyBucket: "identity_activity",
    historyBucketKey: "qr.mobile.integration.history.identity",
    adminRiskCategory: "none",
    adminRiskKey: "qr.mobile.integration.admin.none",
    shouldCreateHistoryRecord: true,
    shouldCreateAdminSignalOn: "never",
  },
  wallet_receive: {
    functionCode: "wallet_receive",
    surface: "wallet",
    rail: "sabi_wallet",
    moduleTitleKey: "qr.mobile.integration.module.wallet",
    statusTarget: "sabi_wallet_runtime",
    statusTargetKey: WALLET_STATUS_KEY,
    historyBucket: "wallet_transactions",
    historyBucketKey: WALLET_HISTORY_KEY,
    adminRiskCategory: "payment_compliance_review",
    adminRiskKey: PAYMENT_ADMIN_KEY,
    shouldCreateHistoryRecord: true,
    shouldCreateAdminSignalOn: "pending_review_or_restricted",
  },
  wallet_user_payment: {
    functionCode: "wallet_user_payment",
    surface: "wallet",
    rail: "sabi_wallet",
    moduleTitleKey: "qr.mobile.integration.module.wallet",
    statusTarget: "sabi_wallet_runtime",
    statusTargetKey: WALLET_STATUS_KEY,
    historyBucket: "wallet_transactions",
    historyBucketKey: WALLET_HISTORY_KEY,
    adminRiskCategory: "payment_compliance_review",
    adminRiskKey: PAYMENT_ADMIN_KEY,
    shouldCreateHistoryRecord: true,
    shouldCreateAdminSignalOn: "pending_review_or_restricted",
  },
  merchant_static_entry: {
    functionCode: "merchant_static_entry",
    surface: "merchant",
    rail: "merchant_wallet",
    moduleTitleKey: "qr.mobile.integration.module.merchant",
    statusTarget: "merchant_wallet_runtime",
    statusTargetKey: "qr.mobile.integration.status.merchant",
    historyBucket: "merchant_orders",
    historyBucketKey: "qr.mobile.integration.history.merchant",
    adminRiskCategory: "merchant_business_review",
    adminRiskKey: "qr.mobile.integration.admin.merchantBusiness",
    shouldCreateHistoryRecord: true,
    shouldCreateAdminSignalOn: "non_success",
  },
  merchant_dynamic_order: {
    functionCode: "merchant_dynamic_order",
    surface: "merchant",
    rail: "merchant_wallet",
    moduleTitleKey: "qr.mobile.integration.module.merchant",
    statusTarget: "merchant_wallet_runtime",
    statusTargetKey: "qr.mobile.integration.status.merchant",
    historyBucket: "merchant_orders",
    historyBucketKey: "qr.mobile.integration.history.merchant",
    adminRiskCategory: "merchant_business_review",
    adminRiskKey: "qr.mobile.integration.admin.merchantBusiness",
    shouldCreateHistoryRecord: true,
    shouldCreateAdminSignalOn: "non_success",
  },
  business_invoice: {
    functionCode: "business_invoice",
    surface: "business",
    rail: "business_wallet",
    moduleTitleKey: "qr.mobile.integration.module.business",
    statusTarget: "business_wallet_runtime",
    statusTargetKey: "qr.mobile.integration.status.business",
    historyBucket: "business_invoices",
    historyBucketKey: "qr.mobile.integration.history.business",
    adminRiskCategory: "merchant_business_review",
    adminRiskKey: "qr.mobile.integration.admin.merchantBusiness",
    shouldCreateHistoryRecord: true,
    shouldCreateAdminSignalOn: "non_success",
  },
  coin_wallet_receive: {
    functionCode: "coin_wallet_receive",
    surface: "coin_wallet",
    rail: "coin_wallet",
    moduleTitleKey: "qr.mobile.integration.module.coinWallet",
    statusTarget: "coin_wallet_runtime",
    statusTargetKey: "qr.mobile.integration.status.coinWallet",
    historyBucket: "coin_wallet_transactions",
    historyBucketKey: "qr.mobile.integration.history.coinWallet",
    adminRiskCategory: "coin_wallet_review",
    adminRiskKey: "qr.mobile.integration.admin.coinWallet",
    shouldCreateHistoryRecord: true,
    shouldCreateAdminSignalOn: "pending_review_or_restricted",
  },
  coin_wallet_transfer: {
    functionCode: "coin_wallet_transfer",
    surface: "coin_wallet",
    rail: "coin_wallet",
    moduleTitleKey: "qr.mobile.integration.module.coinWallet",
    statusTarget: "coin_wallet_runtime",
    statusTargetKey: "qr.mobile.integration.status.coinWallet",
    historyBucket: "coin_wallet_transactions",
    historyBucketKey: "qr.mobile.integration.history.coinWallet",
    adminRiskCategory: "coin_wallet_review",
    adminRiskKey: "qr.mobile.integration.admin.coinWallet",
    shouldCreateHistoryRecord: true,
    shouldCreateAdminSignalOn: "pending_review_or_restricted",
  },
  crypto_wallet_receive: {
    functionCode: "crypto_wallet_receive",
    surface: "crypto_wallet",
    rail: "crypto_wallet",
    moduleTitleKey: "qr.mobile.integration.module.cryptoWallet",
    statusTarget: "crypto_wallet_runtime",
    statusTargetKey: "qr.mobile.integration.status.cryptoWallet",
    historyBucket: "crypto_wallet_activity",
    historyBucketKey: "qr.mobile.integration.history.cryptoWallet",
    adminRiskCategory: "crypto_aml_review",
    adminRiskKey: "qr.mobile.integration.admin.cryptoAml",
    shouldCreateHistoryRecord: true,
    shouldCreateAdminSignalOn: "non_success",
  },
  messenger_profile: {
    functionCode: "messenger_profile",
    surface: "messenger",
    rail: "messenger",
    moduleTitleKey: "qr.mobile.integration.module.messenger",
    statusTarget: "messenger_runtime",
    statusTargetKey: "qr.mobile.integration.status.messenger",
    historyBucket: "messenger_activity",
    historyBucketKey: "qr.mobile.integration.history.messenger",
    adminRiskCategory: "none",
    adminRiskKey: "qr.mobile.integration.admin.none",
    shouldCreateHistoryRecord: true,
    shouldCreateAdminSignalOn: "never",
  },
  messenger_payment: {
    functionCode: "messenger_payment",
    surface: "messenger",
    rail: "messenger",
    moduleTitleKey: "qr.mobile.integration.module.messenger",
    statusTarget: "messenger_runtime",
    statusTargetKey: "qr.mobile.integration.status.messenger",
    historyBucket: "messenger_activity",
    historyBucketKey: "qr.mobile.integration.history.messenger",
    adminRiskCategory: "payment_compliance_review",
    adminRiskKey: PAYMENT_ADMIN_KEY,
    shouldCreateHistoryRecord: true,
    shouldCreateAdminSignalOn: "pending_review_or_restricted",
  },
  marketplace_order: {
    functionCode: "marketplace_order",
    surface: "marketplace",
    rail: "marketplace",
    moduleTitleKey: "qr.mobile.integration.module.marketplace",
    statusTarget: "marketplace_runtime",
    statusTargetKey: "qr.mobile.integration.status.marketplace",
    historyBucket: "marketplace_orders",
    historyBucketKey: "qr.mobile.integration.history.marketplace",
    adminRiskCategory: "payment_compliance_review",
    adminRiskKey: PAYMENT_ADMIN_KEY,
    shouldCreateHistoryRecord: true,
    shouldCreateAdminSignalOn: "pending_review_or_restricted",
  },
  stream_donation: {
    functionCode: "stream_donation",
    surface: "stream",
    rail: "stream",
    moduleTitleKey: "qr.mobile.integration.module.stream",
    statusTarget: "stream_wallet_runtime",
    statusTargetKey: "qr.mobile.integration.status.stream",
    historyBucket: "stream_donations",
    historyBucketKey: "qr.mobile.integration.history.stream",
    adminRiskCategory: "payment_compliance_review",
    adminRiskKey: PAYMENT_ADMIN_KEY,
    shouldCreateHistoryRecord: true,
    shouldCreateAdminSignalOn: "pending_review_or_restricted",
  },
  taxi_trip_payment: {
    functionCode: "taxi_trip_payment",
    surface: "taxi",
    rail: "taxi",
    moduleTitleKey: "qr.mobile.integration.module.taxi",
    statusTarget: "taxi_runtime",
    statusTargetKey: "qr.mobile.integration.status.taxi",
    historyBucket: "taxi_trips",
    historyBucketKey: "qr.mobile.integration.history.taxi",
    adminRiskCategory: "payment_compliance_review",
    adminRiskKey: PAYMENT_ADMIN_KEY,
    shouldCreateHistoryRecord: true,
    shouldCreateAdminSignalOn: "pending_review_or_restricted",
  },
  delivery_order: {
    functionCode: "delivery_order",
    surface: "delivery",
    rail: "delivery",
    moduleTitleKey: "qr.mobile.integration.module.delivery",
    statusTarget: "delivery_runtime",
    statusTargetKey: "qr.mobile.integration.status.delivery",
    historyBucket: "delivery_orders",
    historyBucketKey: "qr.mobile.integration.history.delivery",
    adminRiskCategory: "payment_compliance_review",
    adminRiskKey: PAYMENT_ADMIN_KEY,
    shouldCreateHistoryRecord: true,
    shouldCreateAdminSignalOn: "pending_review_or_restricted",
  },
  school_check_in: {
    functionCode: "school_check_in",
    surface: "school_attendance",
    rail: "school",
    moduleTitleKey: "qr.mobile.integration.module.school",
    statusTarget: "school_attendance_runtime",
    statusTargetKey: "qr.mobile.integration.status.school",
    historyBucket: "school_attendance",
    historyBucketKey: "qr.mobile.integration.history.school",
    adminRiskCategory: "attendance_integrity_review",
    adminRiskKey: "qr.mobile.integration.admin.attendance",
    shouldCreateHistoryRecord: true,
    shouldCreateAdminSignalOn: "non_success",
  },
  school_check_out: {
    functionCode: "school_check_out",
    surface: "school_attendance",
    rail: "school",
    moduleTitleKey: "qr.mobile.integration.module.school",
    statusTarget: "school_attendance_runtime",
    statusTargetKey: "qr.mobile.integration.status.school",
    historyBucket: "school_attendance",
    historyBucketKey: "qr.mobile.integration.history.school",
    adminRiskCategory: "attendance_integrity_review",
    adminRiskKey: "qr.mobile.integration.admin.attendance",
    shouldCreateHistoryRecord: true,
    shouldCreateAdminSignalOn: "non_success",
  },
  work_check_in: {
    functionCode: "work_check_in",
    surface: "work_attendance",
    rail: "work",
    moduleTitleKey: "qr.mobile.integration.module.work",
    statusTarget: "work_attendance_runtime",
    statusTargetKey: "qr.mobile.integration.status.work",
    historyBucket: "work_attendance",
    historyBucketKey: "qr.mobile.integration.history.work",
    adminRiskCategory: "attendance_integrity_review",
    adminRiskKey: "qr.mobile.integration.admin.attendance",
    shouldCreateHistoryRecord: true,
    shouldCreateAdminSignalOn: "non_success",
  },
  work_check_out: {
    functionCode: "work_check_out",
    surface: "work_attendance",
    rail: "work",
    moduleTitleKey: "qr.mobile.integration.module.work",
    statusTarget: "work_attendance_runtime",
    statusTargetKey: "qr.mobile.integration.status.work",
    historyBucket: "work_attendance",
    historyBucketKey: "qr.mobile.integration.history.work",
    adminRiskCategory: "attendance_integrity_review",
    adminRiskKey: "qr.mobile.integration.admin.attendance",
    shouldCreateHistoryRecord: true,
    shouldCreateAdminSignalOn: "non_success",
  },
  virtual_card_issuance: {
    functionCode: "virtual_card_issuance",
    surface: "virtual_card",
    rail: "virtual_card_provider",
    moduleTitleKey: "qr.mobile.integration.module.virtualCard",
    statusTarget: "virtual_card_runtime",
    statusTargetKey: "qr.mobile.integration.status.virtualCard",
    historyBucket: "virtual_card_operations",
    historyBucketKey: "qr.mobile.integration.history.virtualCard",
    adminRiskCategory: "virtual_card_provider_review",
    adminRiskKey: "qr.mobile.integration.admin.virtualCard",
    shouldCreateHistoryRecord: true,
    shouldCreateAdminSignalOn: "non_success",
  },
  virtual_card_payment: {
    functionCode: "virtual_card_payment",
    surface: "virtual_card",
    rail: "virtual_card_provider",
    moduleTitleKey: "qr.mobile.integration.module.virtualCard",
    statusTarget: "virtual_card_runtime",
    statusTargetKey: "qr.mobile.integration.status.virtualCard",
    historyBucket: "virtual_card_operations",
    historyBucketKey: "qr.mobile.integration.history.virtualCard",
    adminRiskCategory: "virtual_card_provider_review",
    adminRiskKey: "qr.mobile.integration.admin.virtualCard",
    shouldCreateHistoryRecord: true,
    shouldCreateAdminSignalOn: "non_success",
  },
  provider_api_admin: {
    functionCode: "provider_api_admin",
    surface: "verification",
    rail: "admin_provider_registry",
    moduleTitleKey: "qr.mobile.integration.module.adminProvider",
    statusTarget: "admin_provider_runtime",
    statusTargetKey: "qr.mobile.integration.status.adminProvider",
    historyBucket: "provider_admin_activity",
    historyBucketKey: "qr.mobile.integration.history.adminProvider",
    adminRiskCategory: "provider_configuration_review",
    adminRiskKey: "qr.mobile.integration.admin.providerConfiguration",
    shouldCreateHistoryRecord: true,
    shouldCreateAdminSignalOn: "provider_setup",
  },
};

const records: SabiQrModuleStatusRecord[] = [];
const listeners = new Set<(records: SabiQrModuleStatusRecord[]) => void>();

function notifySabiQrModuleRecords() {
  const snapshot = getSabiQrModuleStatusRecords();
  listeners.forEach((listener) => listener(snapshot));
}

function nowIso(): string {
  return new Date().toISOString();
}

function makeRecordId(functionCode: SabiQrFunctionCode, result: SabiQrExecuteResponse, tokenId?: string): string {
  const reference =
    result.transactionId ||
    result.attendanceRecordId ||
    result.reviewId ||
    tokenId ||
    Date.now().toString(36);

  return `${functionCode}:${result.status}:${reference}`;
}

function isKnownSabiQrFunctionCode(value: string | null | undefined): value is SabiQrFunctionCode {
  return Boolean(value && Object.prototype.hasOwnProperty.call(SABI_QR_MODULE_INTEGRATION_PLANS, value));
}

function shouldCreateAdminSignal(
  plan: SabiQrModuleIntegrationPlan,
  status: SabiQrExecuteResponse["status"],
): boolean {
  if (plan.shouldCreateAdminSignalOn === "never") return false;
  if (plan.shouldCreateAdminSignalOn === "provider_setup") {
    return status === "provider_not_configured" || status === "executor_not_configured" || status === "pending_review";
  }
  if (plan.shouldCreateAdminSignalOn === "pending_review_or_restricted") {
    return status === "pending_review" || status === "restricted";
  }
  return status !== "success";
}

export function getSabiQrModuleIntegrationPlan(
  functionCode: SabiQrFunctionCode | string | null | undefined,
): SabiQrModuleIntegrationPlan | null {
  return isKnownSabiQrFunctionCode(functionCode) ? SABI_QR_MODULE_INTEGRATION_PLANS[functionCode] : null;
}

export function buildSabiQrAdminRiskSignal(params: {
  plan: SabiQrModuleIntegrationPlan;
  result: SabiQrExecuteResponse;
  tokenId?: string;
}): SabiQrAdminRiskSignal {
  const { plan, result, tokenId } = params;

  return {
    shouldReport: shouldCreateAdminSignal(plan, result.status),
    category: plan.adminRiskCategory,
    functionCode: plan.functionCode,
    surface: plan.surface,
    rail: plan.rail,
    status: result.status,
    tokenId,
    transactionId: result.transactionId,
    attendanceRecordId: result.attendanceRecordId,
    reviewId: result.reviewId,
    reason: result.reason,
    createdAt: nowIso(),
  };
}

export function buildSabiQrModuleStatusRecord(params: {
  functionCode: SabiQrFunctionCode | string | null | undefined;
  result: SabiQrExecuteResponse;
  tokenId?: string;
}): SabiQrModuleStatusRecord | null {
  const plan = getSabiQrModuleIntegrationPlan(params.functionCode);
  if (!plan) return null;

  const adminRiskSignal = buildSabiQrAdminRiskSignal({
    plan,
    result: params.result,
    tokenId: params.tokenId,
  });

  return {
    id: makeRecordId(plan.functionCode, params.result, params.tokenId),
    functionCode: plan.functionCode,
    surface: plan.surface,
    rail: plan.rail,
    status: params.result.status,
    ok: params.result.ok && params.result.status === "success",
    statusTarget: plan.statusTarget,
    historyBucket: plan.historyBucket,
    moduleTitleKey: plan.moduleTitleKey,
    statusTargetKey: plan.statusTargetKey,
    historyBucketKey: plan.historyBucketKey,
    adminRiskCategory: plan.adminRiskCategory,
    adminRiskKey: plan.adminRiskKey,
    tokenId: params.tokenId,
    transactionId: params.result.transactionId,
    attendanceRecordId: params.result.attendanceRecordId,
    reviewId: params.result.reviewId,
    reason: params.result.reason,
    createdAt: adminRiskSignal.createdAt,
    adminRiskSignal,
  };
}

export function buildSabiQrResultIntegrationSummary(params: {
  functionCode: SabiQrFunctionCode | string | null | undefined;
  result: SabiQrExecuteResponse;
  tokenId?: string;
}): SabiQrResultIntegrationSummary | null {
  const plan = getSabiQrModuleIntegrationPlan(params.functionCode);
  const record = buildSabiQrModuleStatusRecord(params);
  if (!plan || !record) return null;

  return {
    plan,
    record,
    historyLabelKey: plan.historyBucketKey,
    statusLabelKey: plan.statusTargetKey,
    adminLabelKey: record.adminRiskSignal.shouldReport
      ? plan.adminRiskKey
      : "qr.mobile.integration.admin.none",
  };
}

export function recordSabiQrModuleStatus(record: SabiQrModuleStatusRecord): SabiQrModuleStatusRecord {
  const nextRecords = [record, ...records.filter((item) => item.id !== record.id)].slice(0, 50);
  records.splice(0, records.length, ...nextRecords);
  notifySabiQrModuleRecords();
  return record;
}

export function recordSabiQrModuleStatusFromResult(params: {
  functionCode: SabiQrFunctionCode | string | null | undefined;
  result: SabiQrExecuteResponse;
  tokenId?: string;
}): SabiQrModuleStatusRecord | null {
  const record = buildSabiQrModuleStatusRecord(params);
  return record ? recordSabiQrModuleStatus(record) : null;
}

export function getSabiQrModuleStatusRecords(): SabiQrModuleStatusRecord[] {
  return [...records];
}

export function subscribeSabiQrModuleStatusRecords(
  listener: (records: SabiQrModuleStatusRecord[]) => void,
): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
