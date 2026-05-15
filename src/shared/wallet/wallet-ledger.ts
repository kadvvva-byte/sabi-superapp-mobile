import { walletPayloadContainsForbiddenCardData } from "./wallet-foundation";

export type WalletLedgerRoute =
  | "wallet"
  | "wallet_send"
  | "wallet_receive"
  | "wallet_topup"
  | "wallet_withdraw"
  | "card_provider"
  | "virtual_card"
  | "qr_pay"
  | "merchant"
  | "business"
  | "coin_bridge"
  | "crypto_provider"
  | "unknown";

export type WalletLedgerProviderStatus =
  | "provider_not_required"
  | "provider_not_configured"
  | "provider_pending"
  | "provider_confirmed"
  | "provider_failed"
  | "provider_restricted";

export type WalletLedgerRiskStatus =
  | "clear"
  | "pending_review"
  | "safe_hold"
  | "restricted"
  | "blocked"
  | "unknown";

export type WalletLedgerView = {
  route: WalletLedgerRoute;
  providerStatus: WalletLedgerProviderStatus;
  riskStatus: WalletLedgerRiskStatus;
  ledgerReference: string;
  providerReference: string;
  walletId: string;
  sourceModule: string;
  hasRawCardData: boolean;
  requiresProvider: boolean;
  isProviderReady: boolean;
  isRiskClear: boolean;
  complianceStatus: string;
  kycStatus: string;
  amlStatus: string;
  adminReviewStatus: string;
  safeHoldReason: string;
  restrictedReason: string;
  adminReviewRequired: boolean;
  safeHoldRequired: boolean;
};

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function readNumberString(value: unknown): string {
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return readString(value);
}

function readRecordField(record: UnknownRecord, keys: string[]) {
  for (const key of keys) {
    if (record[key] !== undefined && record[key] !== null) return record[key];
  }
  return undefined;
}

function readDeepField(value: unknown, keys: string[]): unknown {
  if (!isRecord(value)) return undefined;

  const direct = readRecordField(value, keys);
  if (direct !== undefined) return direct;

  const payload = value.payload;
  if (isRecord(payload)) {
    const nested = readRecordField(payload, keys);
    if (nested !== undefined) return nested;

    const provider = payload.provider;
    if (isRecord(provider)) {
      const providerNested = readRecordField(provider, keys);
      if (providerNested !== undefined) return providerNested;
    }

    const ledger = payload.ledger;
    if (isRecord(ledger)) {
      const ledgerNested = readRecordField(ledger, keys);
      if (ledgerNested !== undefined) return ledgerNested;
    }

    const risk = payload.risk;
    if (isRecord(risk)) {
      const riskNested = readRecordField(risk, keys);
      if (riskNested !== undefined) return riskNested;
    }
  }

  return undefined;
}

function normalizeToken(value: unknown) {
  return String(value || "")
    .trim()
    .replace(/[\s_-]+/g, "_")
    .toLowerCase();
}

function inferRouteFromKind(kind: string, sourceModule: string): WalletLedgerRoute {
  const normalizedKind = normalizeToken(kind);
  const normalizedSource = normalizeToken(sourceModule);

  if (normalizedKind.includes("merchant") || normalizedSource.includes("merchant")) return "merchant";
  if (normalizedKind.includes("business") || normalizedSource.includes("business")) return "business";
  if (normalizedKind.includes("qr") || normalizedSource.includes("qr")) return "qr_pay";
  if (normalizedKind.includes("topup") || normalizedKind.includes("deposit")) return "wallet_topup";
  if (normalizedKind.includes("withdraw")) return "wallet_withdraw";
  if (normalizedKind.includes("refund") || normalizedKind.includes("payment")) return "card_provider";
  if (normalizedKind.includes("p2p_sent") || normalizedKind.includes("send")) return "wallet_send";
  if (normalizedKind.includes("p2p_received") || normalizedKind.includes("receive")) return "wallet_receive";
  if (normalizedSource.includes("coin")) return "coin_bridge";
  if (normalizedSource.includes("crypto")) return "crypto_provider";
  if (normalizedSource.includes("virtual")) return "virtual_card";
  if (normalizedKind.includes("wallet")) return "wallet";

  return "unknown";
}

function normalizeRoute(value: unknown, kind: string, sourceModule: string): WalletLedgerRoute {
  const route = normalizeToken(value);
  if (route === "wallet" || route === "wallet_core") return "wallet";
  if (route === "wallet_send" || route === "send" || route === "p2p_send") return "wallet_send";
  if (route === "wallet_receive" || route === "receive" || route === "p2p_receive") return "wallet_receive";
  if (route === "wallet_topup" || route === "topup" || route === "deposit") return "wallet_topup";
  if (route === "wallet_withdraw" || route === "withdraw") return "wallet_withdraw";
  if (route === "card_provider" || route === "card" || route === "payment_provider") return "card_provider";
  if (route === "virtual_card" || route === "issuer" || route === "issuer_provider") return "virtual_card";
  if (route === "qr" || route === "qr_pay" || route === "qr_payment") return "qr_pay";
  if (route === "merchant") return "merchant";
  if (route === "business") return "business";
  if (route === "coin" || route === "coin_bridge") return "coin_bridge";
  if (route === "crypto" || route === "crypto_provider") return "crypto_provider";
  return inferRouteFromKind(kind, sourceModule);
}

function routeRequiresProvider(route: WalletLedgerRoute) {
  return [
    "wallet_topup",
    "wallet_withdraw",
    "card_provider",
    "virtual_card",
    "qr_pay",
    "merchant",
    "business",
    "coin_bridge",
    "crypto_provider",
  ].includes(route);
}

function normalizeProviderStatus(value: unknown, requiresProvider: boolean): WalletLedgerProviderStatus {
  const status = normalizeToken(value);

  if (!status) return requiresProvider ? "provider_not_configured" : "provider_not_required";
  if (status.includes("not_configured") || status.includes("missing") || status.includes("unavailable")) return "provider_not_configured";
  if (status.includes("restricted") || status.includes("hold") || status.includes("blocked")) return "provider_restricted";
  if (status.includes("fail") || status.includes("error") || status.includes("declin") || status.includes("reject")) return "provider_failed";
  if (status.includes("pending") || status.includes("created") || status.includes("authoriz") || status.includes("processing") || status.includes("review")) return "provider_pending";
  if (status.includes("ready") || status.includes("verified") || status.includes("confirm") || status.includes("success") || status.includes("complete") || status.includes("settled")) return "provider_confirmed";

  return requiresProvider ? "provider_pending" : "provider_not_required";
}

function normalizeRiskStatus(value: unknown): WalletLedgerRiskStatus {
  const status = normalizeToken(value);

  if (!status) return "unknown";
  if (status === "clear" || status === "ok" || status === "approved" || status === "normal") return "clear";
  if (status.includes("kyc") || status.includes("pending") || status.includes("review")) return "pending_review";
  if (status.includes("aml") || status.includes("safe_hold") || status.includes("hold")) return "safe_hold";
  if (status.includes("restrict")) return "restricted";
  if (status.includes("block") || status.includes("reject") || status.includes("deny")) return "blocked";

  return "unknown";
}

function normalizePlainStatus(value: unknown, fallback: string) {
  const status = normalizeToken(value);
  return status || fallback;
}

function riskPriority(value: WalletLedgerRiskStatus) {
  switch (value) {
    case "blocked":
      return 5;
    case "restricted":
      return 4;
    case "safe_hold":
      return 3;
    case "pending_review":
      return 2;
    case "unknown":
      return 1;
    case "clear":
    default:
      return 0;
  }
}

function strictestRiskStatus(...values: WalletLedgerRiskStatus[]) {
  return values.reduce<WalletLedgerRiskStatus>((selected, item) => {
    return riskPriority(item) > riskPriority(selected) ? item : selected;
  }, "clear");
}

function buildFallbackLedgerReference(item: UnknownRecord) {
  return (
    readNumberString(readDeepField(item, ["ledgerReference", "ledgerRef", "ledgerId"])) ||
    readNumberString(readDeepField(item, ["transactionId", "operationId", "paymentId", "qrExecutionId"])) ||
    readNumberString(readDeepField(item, ["reference", "providerReference", "id"]))
  );
}

export function buildWalletLedgerView(value: unknown): WalletLedgerView {
  const item = isRecord(value) ? value : {};
  const kind = readString(item.kind);
  const sourceModule = readString(readDeepField(item, ["sourceModule", "source", "module"]));
  const route = normalizeRoute(readDeepField(item, ["walletRoute", "route", "ledgerRoute", "paymentRoute"]), kind, sourceModule);
  const requiresProvider = routeRequiresProvider(route);
  const providerStatus = normalizeProviderStatus(
    readDeepField(item, [
      "providerStatus",
      "paymentProviderStatus",
      "bankProviderStatus",
      "issuerProviderStatus",
      "provider_state",
      "providerState",
    ]),
    requiresProvider,
  );
  const complianceStatus = normalizePlainStatus(
    readDeepField(item, ["complianceStatus", "walletComplianceStatus", "compliance_state"]),
    "clear",
  );
  const kycStatus = normalizePlainStatus(readDeepField(item, ["kycStatus", "kyc_state"]), "not_required");
  const amlStatus = normalizePlainStatus(readDeepField(item, ["amlStatus", "aml_state"]), "clear");
  const adminReviewStatus = normalizePlainStatus(
    readDeepField(item, ["adminReviewStatus", "admin_review_status", "reviewStatus"]),
    "not_required",
  );
  const riskStatus = strictestRiskStatus(
    normalizeRiskStatus(readDeepField(item, ["riskStatus", "risk_state", "riskState"])),
    normalizeRiskStatus(complianceStatus),
    normalizeRiskStatus(amlStatus),
    normalizeRiskStatus(adminReviewStatus),
    kycStatus === "required" || kycStatus === "pending" || kycStatus === "rejected" ? "pending_review" : "clear",
  );

  return {
    route,
    providerStatus,
    riskStatus,
    ledgerReference: buildFallbackLedgerReference(item),
    providerReference: readNumberString(
      readDeepField(item, ["providerReference", "providerRef", "providerTransactionId", "bankReference", "issuerReference"]),
    ),
    walletId: readNumberString(readDeepField(item, ["walletId", "sourceWalletId", "destinationWalletId"])),
    sourceModule,
    hasRawCardData: walletPayloadContainsForbiddenCardData(value),
    requiresProvider,
    isProviderReady: providerStatus === "provider_confirmed" || providerStatus === "provider_not_required",
    isRiskClear: riskStatus === "clear" || riskStatus === "unknown",
    complianceStatus,
    kycStatus,
    amlStatus,
    adminReviewStatus,
    safeHoldReason: readString(readDeepField(item, ["safeHoldReason", "safe_hold_reason", "holdReason"])),
    restrictedReason: readString(readDeepField(item, ["restrictedReason", "restricted_reason", "restrictionReason"])),
    adminReviewRequired: riskStatus === "pending_review" || riskStatus === "safe_hold",
    safeHoldRequired: riskStatus === "safe_hold",
  };
}
