import type {
  SabiQrExecuteResponse,
  SabiQrFunctionDefinition,
  SabiQrRail,
  SabiQrSurface,
  SabiQrTokenRecord,
} from "../../modules/qr/contracts/universalQr.contracts";
import {
  getWalletFoundationSnapshot,
  getWalletQrCurrencyCodeForSurface,
  walletPayloadContainsForbiddenCardData,
  type WalletProviderStatus,
} from "./wallet-foundation";
import { buildWalletComplianceView } from "./wallet-compliance";
import {
  buildWalletMoneyMovementGuard,
  type WalletMoneyMovementRiskStatus,
} from "./wallet-money-movement";
import type {
  WalletLedgerProviderStatus,
  WalletLedgerRiskStatus,
  WalletLedgerRoute,
} from "./wallet-ledger";

export const WALLET_QR_INTEGRATION_VERSION = "WALLET-100.11" as const;

export type WalletQrProviderFamily =
  | "sabi_wallet_bank_provider"
  | "card_provider"
  | "virtual_card_issuer"
  | "coin_wallet_provider"
  | "crypto_provider"
  | "merchant_wallet_provider"
  | "business_wallet_provider"
  | "none";

export type WalletQrIntegrationMetadata = Record<string, string | number | boolean | null | undefined> & {
  walletQrIntegrationVersion: typeof WALLET_QR_INTEGRATION_VERSION;
  walletRoute: WalletLedgerRoute;
  walletRail: SabiQrRail;
  walletSurface: SabiQrSurface;
  providerFamily: WalletQrProviderFamily;
  providerRequired: boolean;
  providerStatus: WalletProviderStatus;
  ledgerProviderStatus: WalletLedgerProviderStatus;
  riskStatus: WalletMoneyMovementRiskStatus;
  ledgerRiskStatus: WalletLedgerRiskStatus;
  guardReason: string;
  canPrepareWalletRoute: boolean;
  tokenOnlyStorage: true;
  providerTokenStorageOnly: true;
  rawCardDataBlocked: boolean;
  panStorageAllowed: false;
  cvvStorageAllowed: false;
  manualIdentityInputAllowed: false;
  businessMerchantRouteSeparated: boolean;
  personalWalletSettlementForbidden: boolean;
  merchantBusinessAccountingSeparated: true;
  complianceStatus: string;
  kycStatus: string;
  amlStatus: string;
  adminReviewStatus: string;
  adminReviewRequired: boolean;
  safeHoldRequired: boolean;
  safeHoldReason: string;
  restrictedReason: string;
};

export type WalletQrResultParams = Record<string, string>;

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function metadataString(metadata: unknown, key: string): string {
  if (!isRecord(metadata)) return "";
  const value = metadata[key];
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (typeof value === "boolean") return value ? "true" : "false";
  return "";
}

function normalizeAmount(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return Math.max(0, value);
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value.replace(",", "."));
    return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
  }
  return 0;
}

function normalizeRiskStatus(value: unknown): WalletMoneyMovementRiskStatus {
  const status = readString(value).toLowerCase();
  if (status === "pending_review" || status === "safe_hold" || status === "restricted" || status === "blocked") {
    return status;
  }
  return "clear";
}

export function resolveWalletQrLedgerRoute(definition: Pick<SabiQrFunctionDefinition, "code" | "surface" | "rail" | "domain">): WalletLedgerRoute {
  switch (definition.code) {
    case "wallet_receive":
      return "wallet_receive";
    case "wallet_user_payment":
    case "messenger_payment":
      return "qr_pay";
    case "merchant_static_entry":
    case "merchant_dynamic_order":
      return "merchant";
    case "business_invoice":
      return "business";
    case "coin_wallet_receive":
    case "coin_wallet_transfer":
      return "coin_bridge";
    case "crypto_wallet_receive":
      return "crypto_provider";
    case "virtual_card_issuance":
    case "virtual_card_payment":
      return "virtual_card";
    default:
      if (definition.rail === "coin_wallet") return "coin_bridge";
      if (definition.rail === "crypto_wallet") return "crypto_provider";
      if (definition.rail === "merchant_wallet") return "merchant";
      if (definition.rail === "business_wallet") return "business";
      if (definition.rail === "virtual_card_provider") return "virtual_card";
      if (definition.domain === "payment" || definition.domain === "invoice" || definition.domain === "order" || definition.domain === "donation") return "qr_pay";
      return "wallet";
  }
}

export function resolveWalletQrProviderFamily(definition: Pick<SabiQrFunctionDefinition, "code" | "rail" | "surface">): WalletQrProviderFamily {
  switch (definition.code) {
    case "coin_wallet_receive":
    case "coin_wallet_transfer":
      return "coin_wallet_provider";
    case "crypto_wallet_receive":
      return "crypto_provider";
    case "virtual_card_issuance":
    case "virtual_card_payment":
      return "virtual_card_issuer";
    case "merchant_static_entry":
    case "merchant_dynamic_order":
      return "merchant_wallet_provider";
    case "business_invoice":
      return "business_wallet_provider";
    default:
      if (definition.rail === "coin_wallet") return "coin_wallet_provider";
      if (definition.rail === "crypto_wallet") return "crypto_provider";
      if (definition.rail === "virtual_card_provider" || definition.surface === "virtual_card") return "virtual_card_issuer";
      if (definition.rail === "merchant_wallet") return "merchant_wallet_provider";
      if (definition.rail === "business_wallet") return "business_wallet_provider";
      return definition.rail === "sabi_wallet" || definition.surface === "wallet" ? "sabi_wallet_bank_provider" : "none";
  }
}

function flowForQr(definition: SabiQrFunctionDefinition): string {
  switch (resolveWalletQrLedgerRoute(definition)) {
    case "wallet_receive":
      return "qr-wallet-receive";
    case "merchant":
      return "qr-merchant-payment";
    case "business":
      return "qr-business-invoice";
    case "coin_bridge":
      return "qr-coin-transfer";
    case "crypto_provider":
      return "qr-crypto-receive";
    case "virtual_card":
      return "qr-virtual-card";
    case "qr_pay":
      return "qr-wallet-payment";
    default:
      return `qr-${definition.rail}`;
  }
}

function resultRiskStatus(status: SabiQrExecuteResponse["status"], metadataRisk: string): WalletLedgerRiskStatus {
  if (status === "restricted") return "restricted";
  if (status === "pending_review") return "pending_review";
  if (status === "failed") return "unknown";
  if (metadataRisk === "safe_hold" || metadataRisk === "restricted" || metadataRisk === "blocked" || metadataRisk === "pending_review" || metadataRisk === "clear") {
    return metadataRisk;
  }
  return "clear";
}

function resultProviderStatus(
  status: SabiQrExecuteResponse["status"],
  metadataProvider: string,
): WalletLedgerProviderStatus {
  if (status === "provider_not_configured" || metadataProvider === "provider_not_configured") return "provider_not_configured";
  if (status === "restricted") return "provider_restricted";
  if (status === "success") return "provider_confirmed";
  if (status === "failed") return metadataProvider === "provider_not_required" ? "provider_not_required" : "provider_failed";
  if (metadataProvider === "provider_not_required") return "provider_not_required";
  if (metadataProvider === "provider_confirmed" || metadataProvider === "provider_pending" || metadataProvider === "provider_failed" || metadataProvider === "provider_restricted") {
    return metadataProvider;
  }
  return "provider_pending";
}

export async function buildWalletQrIntegrationMetadata(params: {
  definition: SabiQrFunctionDefinition;
  amount?: string | number | null;
  currency?: string | null;
  riskStatus?: WalletMoneyMovementRiskStatus | null;
  payload?: unknown;
}): Promise<WalletQrIntegrationMetadata> {
  const snapshot = await getWalletFoundationSnapshot();
  const walletRoute = resolveWalletQrLedgerRoute(params.definition);
  const providerFamily = resolveWalletQrProviderFamily(params.definition);
  const amount = params.definition.requiresAmount ? normalizeAmount(params.amount) : 1;
  const riskStatus = normalizeRiskStatus(params.riskStatus);
  const currencyCode = readString(params.currency) || getWalletQrCurrencyCodeForSurface(params.definition.surface, snapshot) || (params.definition.rail === "crypto_wallet" ? "CRYPTO" : "");
  const guard = buildWalletMoneyMovementGuard({
    snapshot,
    flow: flowForQr(params.definition),
    amount,
    currencyCode,
    riskStatus,
    payload: params.payload,
  });
  const complianceView = buildWalletComplianceView(snapshot, {
    providerStatus: guard.providerStatus,
    payload: params.payload,
  });
  const rawCardDataBlocked = walletPayloadContainsForbiddenCardData(params.payload);

  return {
    walletQrIntegrationVersion: WALLET_QR_INTEGRATION_VERSION,
    walletRoute,
    walletRail: params.definition.rail,
    walletSurface: params.definition.surface,
    providerFamily,
    providerRequired: guard.providerRequired || params.definition.requiresProvider || providerFamily !== "none",
    providerStatus: guard.providerStatus,
    ledgerProviderStatus: guard.ledgerProviderStatus,
    riskStatus: guard.riskStatus,
    ledgerRiskStatus: guard.ledgerRiskStatus,
    guardReason: guard.blockedReason,
    canPrepareWalletRoute: guard.canPrepare,
    tokenOnlyStorage: true,
    providerTokenStorageOnly: true,
    rawCardDataBlocked,
    panStorageAllowed: false,
    cvvStorageAllowed: false,
    manualIdentityInputAllowed: false,
    businessMerchantRouteSeparated: walletRoute === "merchant" || walletRoute === "business",
    personalWalletSettlementForbidden: walletRoute === "merchant" || walletRoute === "business",
    merchantBusinessAccountingSeparated: true,
    complianceStatus: complianceView.complianceStatus,
    kycStatus: complianceView.kycStatus,
    amlStatus: complianceView.amlStatus,
    adminReviewStatus: complianceView.adminReviewStatus,
    adminReviewRequired: complianceView.adminReviewRequired,
    safeHoldRequired: complianceView.safeHoldRequired,
    safeHoldReason: complianceView.safeHoldReason,
    restrictedReason: complianceView.restrictedReason,
  };
}

export async function buildWalletQrTokenMetadata(
  definition: SabiQrFunctionDefinition,
  input: {
    amount?: string | number | null;
    currency?: string | null;
    reference?: string | null;
    counterpartyId?: string | null;
    organizationId?: string | null;
  },
): Promise<WalletQrIntegrationMetadata> {
  return buildWalletQrIntegrationMetadata({
    definition,
    amount: input.amount,
    currency: input.currency,
    payload: input,
  });
}

export async function buildWalletQrExecuteMetadata(params: {
  definition: SabiQrFunctionDefinition;
  token: SabiQrTokenRecord;
}): Promise<WalletQrIntegrationMetadata & {
  tokenId: string;
  tokenActorUserId: string;
  unifiedUserId: string;
  qrReference: string | null;
}> {
  const metadata = await buildWalletQrIntegrationMetadata({
    definition: params.definition,
    amount: params.token.amount,
    currency: params.token.currency,
    payload: params.token.metadata ?? params.token,
  });

  return {
    ...metadata,
    tokenId: params.token.tokenId,
    tokenActorUserId: params.token.actorUserId,
    unifiedUserId: params.token.verifiedIdentity?.userId ?? params.token.actorUserId,
    qrReference: params.token.reference ?? null,
  };
}

export function buildWalletQrResultParams(token: SabiQrTokenRecord, result: SabiQrExecuteResponse): WalletQrResultParams {
  const metadata = token.metadata ?? {};
  const ledgerProviderStatus = resultProviderStatus(
    result.status,
    metadataString(metadata, "ledgerProviderStatus"),
  );
  const ledgerRiskStatus = resultRiskStatus(result.status, metadataString(metadata, "ledgerRiskStatus"));
  const walletRoute = metadataString(metadata, "walletRoute") || resolveWalletQrLedgerRoute({ code: token.functionCode, surface: token.surface, rail: token.rail, domain: token.domain });
  const providerStatus = result.status === "provider_not_configured"
    ? "provider_not_configured"
    : metadataString(metadata, "providerStatus");

  const params: WalletQrResultParams = {
    walletQrIntegrationVersion: metadataString(metadata, "walletQrIntegrationVersion") || WALLET_QR_INTEGRATION_VERSION,
    walletRoute,
    walletRail: token.rail,
    walletSurface: token.surface,
    providerFamily: metadataString(metadata, "providerFamily"),
    providerRequired: metadataString(metadata, "providerRequired"),
    providerStatus,
    ledgerProviderStatus,
    riskStatus: ledgerRiskStatus,
    ledgerRiskStatus,
    guardReason: metadataString(metadata, "guardReason"),
    ledgerReference: result.transactionId || token.reference || metadataString(metadata, "ledgerReference"),
    providerReference: metadataString(metadata, "providerReference"),
    tokenOnlyStorage: "true",
    providerTokenStorageOnly: "true",
    panStorageAllowed: "false",
    cvvStorageAllowed: "false",
    businessMerchantRouteSeparated: metadataString(metadata, "businessMerchantRouteSeparated"),
    personalWalletSettlementForbidden: metadataString(metadata, "personalWalletSettlementForbidden"),
    merchantBusinessAccountingSeparated: metadataString(metadata, "merchantBusinessAccountingSeparated") || "true",
    complianceStatus: metadataString(metadata, "complianceStatus"),
    kycStatus: metadataString(metadata, "kycStatus"),
    amlStatus: metadataString(metadata, "amlStatus"),
    adminReviewStatus: metadataString(metadata, "adminReviewStatus"),
    adminReviewRequired: metadataString(metadata, "adminReviewRequired"),
    safeHoldRequired: metadataString(metadata, "safeHoldRequired"),
    safeHoldReason: metadataString(metadata, "safeHoldReason"),
    restrictedReason: metadataString(metadata, "restrictedReason"),
  };

  Object.keys(params).forEach((key) => {
    if (!params[key]) delete params[key];
  });

  return params;
}

export function hasWalletQrResultParams(params: {
  walletRoute?: string;
  ledgerProviderStatus?: string;
  ledgerRiskStatus?: string;
  providerStatus?: string;
  providerFamily?: string;
  complianceStatus?: string;
  adminReviewStatus?: string;
  safeHoldRequired?: string;
}) {
  return Boolean(
    params.walletRoute ||
    params.ledgerProviderStatus ||
    params.ledgerRiskStatus ||
    params.providerStatus ||
    params.providerFamily ||
    params.complianceStatus ||
    params.adminReviewStatus ||
    params.safeHoldRequired
  );
}
