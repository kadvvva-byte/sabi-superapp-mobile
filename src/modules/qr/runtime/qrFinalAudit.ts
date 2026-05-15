import type { SabiQrExecuteResponse, SabiQrFunctionCode } from "../contracts/universalQr.contracts";
import { SABI_QR_ENTRY_FUNCTIONS } from "./qrEntryRoutes";
import { getSabiQrExecutionMapping } from "./qrExecutionMapping";
import { getSabiQrModuleIntegrationPlan } from "./qrModuleIntegration";

export const SABI_QR_100_FINAL_AUDIT_VERSION = "QR-100.10.1" as const;

export const SABI_QR_100_ALL_FUNCTION_CODES = [
  "profile_identity",
  "wallet_receive",
  "wallet_user_payment",
  "merchant_static_entry",
  "merchant_dynamic_order",
  "business_invoice",
  "coin_wallet_receive",
  "coin_wallet_transfer",
  "crypto_wallet_receive",
  "messenger_profile",
  "messenger_payment",
  "marketplace_order",
  "stream_donation",
  "taxi_trip_payment",
  "delivery_order",
  "school_check_in",
  "school_check_out",
  "work_check_in",
  "work_check_out",
  "virtual_card_issuance",
  "virtual_card_payment",
  "provider_api_admin",
] as const satisfies readonly SabiQrFunctionCode[];

export const SABI_QR_100_VISIBLE_ROUTE_PATHS = {
  profile_identity: "/qr",
  wallet_receive: "/qr/wallet",
  wallet_user_payment: "/qr/wallet-payment",
  merchant_static_entry: "/qr/merchant",
  merchant_dynamic_order: "/qr/merchant-order",
  business_invoice: "/qr/business",
  coin_wallet_receive: "/qr/coin",
  coin_wallet_transfer: "/qr/coin-transfer",
  crypto_wallet_receive: "/qr/crypto",
  messenger_profile: "/qr/messenger",
  messenger_payment: "/qr/messenger-payment",
  marketplace_order: "/qr/marketplace",
  stream_donation: "/qr/stream",
  taxi_trip_payment: "/qr/taxi",
  delivery_order: "/qr/delivery",
  school_check_in: "/qr/school",
  school_check_out: "/qr/school-out",
  work_check_in: "/qr/work",
  work_check_out: "/qr/work-out",
  virtual_card_issuance: "/qr/virtual-card",
  virtual_card_payment: "/qr/virtual-card-payment",
} as const satisfies Partial<Record<SabiQrFunctionCode, string>>;

type SabiQr100VisibleRouteFunctionCode = keyof typeof SABI_QR_100_VISIBLE_ROUTE_PATHS;

function hasVisibleRoutePath(
  functionCode: SabiQrFunctionCode,
): functionCode is SabiQr100VisibleRouteFunctionCode {
  return Object.prototype.hasOwnProperty.call(SABI_QR_100_VISIBLE_ROUTE_PATHS, functionCode);
}

function getVisibleRoutePath(functionCode: SabiQrFunctionCode): string | undefined {
  if (!hasVisibleRoutePath(functionCode)) return undefined;
  return SABI_QR_100_VISIBLE_ROUTE_PATHS[functionCode];
}

export type SabiQr100AuditStatus =
  | "mobile_ready"
  | "mobile_ready_provider_pending"
  | "internal_admin_only"
  | "missing_entry_route"
  | "missing_execution_mapping"
  | "missing_module_integration";

export type SabiQr100FinalAuditItem = {
  functionCode: SabiQrFunctionCode;
  routePath?: string;
  hasVisibleRoute: boolean;
  hasEntryFunction: boolean;
  hasExecutionMapping: boolean;
  hasModuleIntegration: boolean;
  providerRequired: boolean;
  adminProviderRequired: boolean;
  unavailableStatus?: Exclude<SabiQrExecuteResponse["status"], "success">;
  executorKey?: string;
  providerKey?: string;
  status: SabiQr100AuditStatus;
  mobileReady: boolean;
};

export type SabiQr100FinalAuditReport = {
  version: typeof SABI_QR_100_FINAL_AUDIT_VERSION;
  generatedAt: string;
  totalFunctions: number;
  mobileReady: boolean;
  providerPendingCount: number;
  internalAdminOnlyCount: number;
  missingCount: number;
  items: SabiQr100FinalAuditItem[];
};

function resolveItemStatus(params: {
  functionCode: SabiQrFunctionCode;
  hasVisibleRoute: boolean;
  hasExecutionMapping: boolean;
  hasModuleIntegration: boolean;
  providerRequired: boolean;
  adminProviderRequired: boolean;
}): SabiQr100AuditStatus {
  if (!params.hasExecutionMapping) return "missing_execution_mapping";
  if (!params.hasModuleIntegration) return "missing_module_integration";
  if (params.functionCode === "provider_api_admin") return "internal_admin_only";
  if (!params.hasVisibleRoute) return "missing_entry_route";
  if (params.providerRequired || params.adminProviderRequired) return "mobile_ready_provider_pending";
  return "mobile_ready";
}

function isMobileReadyStatus(status: SabiQr100AuditStatus): boolean {
  return status === "mobile_ready" || status === "mobile_ready_provider_pending" || status === "internal_admin_only";
}

export function runSabiQr100FinalAudit(now: Date = new Date()): SabiQr100FinalAuditReport {
  const entryFunctions = new Set<SabiQrFunctionCode>(Object.values(SABI_QR_ENTRY_FUNCTIONS));

  const items = SABI_QR_100_ALL_FUNCTION_CODES.map((functionCode): SabiQr100FinalAuditItem => {
    const routePath = getVisibleRoutePath(functionCode);
    const mapping = getSabiQrExecutionMapping(functionCode);
    const integrationPlan = getSabiQrModuleIntegrationPlan(functionCode);
    const status = resolveItemStatus({
      functionCode,
      hasVisibleRoute: Boolean(routePath),
      hasExecutionMapping: Boolean(mapping),
      hasModuleIntegration: Boolean(integrationPlan),
      providerRequired: Boolean(mapping?.providerRequired),
      adminProviderRequired: Boolean(mapping?.adminProviderRequired),
    });

    return {
      functionCode,
      routePath,
      hasVisibleRoute: Boolean(routePath),
      hasEntryFunction: entryFunctions.has(functionCode) || functionCode === "profile_identity" || functionCode === "provider_api_admin",
      hasExecutionMapping: Boolean(mapping),
      hasModuleIntegration: Boolean(integrationPlan),
      providerRequired: Boolean(mapping?.providerRequired),
      adminProviderRequired: Boolean(mapping?.adminProviderRequired),
      unavailableStatus: mapping?.unavailableStatus,
      executorKey: mapping?.executorKey,
      providerKey: mapping?.providerKey,
      status,
      mobileReady: isMobileReadyStatus(status),
    };
  });

  return {
    version: SABI_QR_100_FINAL_AUDIT_VERSION,
    generatedAt: now.toISOString(),
    totalFunctions: items.length,
    mobileReady: items.every((item) => item.mobileReady),
    providerPendingCount: items.filter((item) => item.status === "mobile_ready_provider_pending").length,
    internalAdminOnlyCount: items.filter((item) => item.status === "internal_admin_only").length,
    missingCount: items.filter((item) => !item.mobileReady).length,
    items,
  };
}

export const SABI_QR_100_FINAL_SECURITY_RULES = {
  fakeExecutionAllowed: false,
  manualIdentityInputAllowed: false,
  mobileProviderSecretsAllowed: false,
  mobilePanOrCvvStorageAllowed: false,
  successRequiresExplicitBackendSuccessStatus: true,
  unsignedClientPreviewExecuteAllowed: false,
  executorUserMustComeFromAuthSession: true,
  providerUnavailableMustBeUserVisible: true,
} as const;
