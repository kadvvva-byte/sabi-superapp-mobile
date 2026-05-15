import type {
  WalletFoundationSnapshot,
  WalletProviderStatus,
} from "./wallet-foundation";
import {
  isWalletProviderReady,
  walletPayloadContainsForbiddenCardData,
} from "./wallet-foundation";

export type CryptoWalletProviderOperation =
  | "assets"
  | "portfolio"
  | "assetDetails"
  | "buy"
  | "sell"
  | "swap"
  | "send"
  | "receive"
  | "history"
  | "transactionDetails"
  | "confirm"
  | "market"
  | "watchlist"
  | "networks"
  | "manageTokens"
  | "importToken"
  | "addressBook"
  | "addAddress"
  | "seedCreate"
  | "seedBackup"
  | "seedVerify";

export type CryptoWalletProviderReadinessReason =
  | "ready"
  | WalletProviderStatus
  | "provider_launch_not_configured"
  | "custody_provider_not_configured"
  | "market_data_provider_not_configured"
  | "blockchain_route_not_configured"
  | "risk_admin_not_configured"
  | "operation_disabled"
  | "raw_card_data_blocked";

export type CryptoWalletProviderReadiness = {
  providerStatus: WalletProviderStatus;
  operation: CryptoWalletProviderOperation;
  canOpenScreen: boolean;
  canExecute: boolean;
  canReadProviderBalances: boolean;
  canReadMarketData: boolean;
  canReadHistory: boolean;
  canIssueReceiveAddress: boolean;
  custodyProviderConfigured: boolean;
  marketDataProviderConfigured: boolean;
  blockchainRouteConfigured: boolean;
  riskAdminConfigured: boolean;
  walletBackendConfigured: boolean;
  reason: CryptoWalletProviderReadinessReason;
  policy: {
    fiatWalletSeparated: true;
    coinWalletSeparated: true;
    noFakePrices: true;
    noFakeBalances: true;
    noFakeTransactions: true;
    sabiDoesNotStorePrivateKeys: true;
    sabiDoesNotStoreSeedPhrase: true;
    providerOrBlockchainRequired: true;
  };
};

export type CryptoWalletProviderPayloadSanitization = {
  isValid: boolean;
  reason: "ok" | "raw_card_data_blocked" | "provider_not_configured";
  blockedRawCardData: boolean;
};

const CRYPTO_PROVIDER_OPERATION_REQUIRES_EXECUTION: CryptoWalletProviderOperation[] = [
  "buy",
  "sell",
  "swap",
  "send",
  "confirm",
  "importToken",
  "addAddress",
  "seedCreate",
  "seedBackup",
  "seedVerify",
];

const CRYPTO_PROVIDER_OPERATION_REQUIRES_MARKET_DATA: CryptoWalletProviderOperation[] = [
  "assets",
  "portfolio",
  "assetDetails",
  "buy",
  "sell",
  "swap",
  "history",
  "transactionDetails",
  "market",
  "watchlist",
  "manageTokens",
  "importToken",
];

function normalizeCryptoProviderStatus(value: unknown): WalletProviderStatus {
  if (
    value === "ready" ||
    value === "kyc_required" ||
    value === "review_required" ||
    value === "restricted" ||
    value === "provider_not_configured"
  ) {
    return value;
  }

  return "provider_not_configured";
}

export function isCryptoWalletProviderLaunchConfigured() {
  // Keep false until backend/admin connects real custody, blockchain, market-data,
  // KYC/AML/risk and provider execution routes. Never simulate crypto.
  return false;
}

export function getCryptoWalletProviderReadiness(
  snapshot?: Partial<WalletFoundationSnapshot> | null,
  operation: CryptoWalletProviderOperation = "portfolio",
): CryptoWalletProviderReadiness {
  const providerStatus = normalizeCryptoProviderStatus(snapshot?.cryptoProviderStatus);
  const providerReady = isWalletProviderReady(providerStatus);
  const launchConfigured = isCryptoWalletProviderLaunchConfigured();
  const requiresExecution = CRYPTO_PROVIDER_OPERATION_REQUIRES_EXECUTION.includes(operation);
  const requiresMarketData = CRYPTO_PROVIDER_OPERATION_REQUIRES_MARKET_DATA.includes(operation);

  const base: Omit<CryptoWalletProviderReadiness, "reason"> = {
    providerStatus,
    operation,
    canOpenScreen: true,
    canExecute: false,
    canReadProviderBalances: false,
    canReadMarketData: false,
    canReadHistory: false,
    canIssueReceiveAddress: false,
    custodyProviderConfigured: providerReady && launchConfigured,
    marketDataProviderConfigured: providerReady && launchConfigured,
    blockchainRouteConfigured: providerReady && launchConfigured,
    riskAdminConfigured: providerReady && launchConfigured,
    walletBackendConfigured: providerReady && launchConfigured,
    policy: {
      fiatWalletSeparated: true,
      coinWalletSeparated: true,
      noFakePrices: true,
      noFakeBalances: true,
      noFakeTransactions: true,
      sabiDoesNotStorePrivateKeys: true,
      sabiDoesNotStoreSeedPhrase: true,
      providerOrBlockchainRequired: true,
    },
  };

  if (!providerReady) {
    return {
      ...base,
      reason: providerStatus,
    };
  }

  if (!launchConfigured) {
    return {
      ...base,
      reason: "provider_launch_not_configured",
    };
  }

  if (requiresMarketData && !base.marketDataProviderConfigured) {
    return {
      ...base,
      reason: "market_data_provider_not_configured",
    };
  }

  if ((operation === "send" || operation === "receive") && !base.blockchainRouteConfigured) {
    return {
      ...base,
      reason: "blockchain_route_not_configured",
    };
  }

  if (requiresExecution && !base.riskAdminConfigured) {
    return {
      ...base,
      reason: "risk_admin_not_configured",
    };
  }

  return {
    ...base,
    canExecute: requiresExecution,
    canReadProviderBalances: true,
    canReadMarketData: true,
    canReadHistory: true,
    canIssueReceiveAddress: operation === "receive",
    reason: "ready",
  };
}

export function formatCryptoWalletProviderStatusLabel(
  reason: CryptoWalletProviderReadinessReason,
) {
  switch (reason) {
    case "ready":
      return "Ready";
    case "provider_not_configured":
      return "Provider not configured";
    case "kyc_required":
      return "KYC required";
    case "review_required":
      return "Admin review required";
    case "restricted":
      return "Restricted";
    case "provider_launch_not_configured":
      return "Provider launch not configured";
    case "custody_provider_not_configured":
      return "Custody provider not configured";
    case "market_data_provider_not_configured":
      return "Market data provider not configured";
    case "blockchain_route_not_configured":
      return "Blockchain route not configured";
    case "risk_admin_not_configured":
      return "Risk/admin not configured";
    case "operation_disabled":
      return "Operation disabled";
    case "raw_card_data_blocked":
      return "Raw card data blocked";
  }
}

export function getCryptoWalletProviderReadinessText(
  reason: CryptoWalletProviderReadinessReason,
) {
  switch (reason) {
    case "ready":
      return "Crypto provider route is ready for provider-backed data and execution.";
    case "provider_not_configured":
      return "Crypto actions stay disabled until a real custody/wallet provider, market data route, blockchain route and admin controls are connected.";
    case "kyc_required":
      return "Crypto provider access requires verified KYC before any execution route can open.";
    case "review_required":
      return "Crypto provider access is waiting for admin/compliance review.";
    case "restricted":
      return "Crypto provider access is restricted by risk/compliance state.";
    case "provider_launch_not_configured":
      return "Provider status is ready, but the live backend/provider launch route is not connected yet.";
    case "custody_provider_not_configured":
      return "Custody provider is required before balances, addresses or transactions can appear.";
    case "market_data_provider_not_configured":
      return "Market data provider is required before prices, charts and fiat values can appear.";
    case "blockchain_route_not_configured":
      return "Blockchain route is required before send/receive execution can open.";
    case "risk_admin_not_configured":
      return "Risk/admin controls are required before crypto execution can open.";
    case "operation_disabled":
      return "This crypto operation is disabled until real provider execution is connected.";
    case "raw_card_data_blocked":
      return "Raw card data is blocked. Crypto routes must not receive PAN, CVV or card number payloads.";
  }
}

export function sanitizeCryptoWalletProviderPayload(
  payload: unknown,
  snapshot?: Partial<WalletFoundationSnapshot> | null,
): CryptoWalletProviderPayloadSanitization {
  if (walletPayloadContainsForbiddenCardData(payload)) {
    return {
      isValid: false,
      reason: "raw_card_data_blocked",
      blockedRawCardData: true,
    };
  }

  const readiness = getCryptoWalletProviderReadiness(snapshot);
  if (readiness.reason !== "ready") {
    return {
      isValid: false,
      reason: "provider_not_configured",
      blockedRawCardData: false,
    };
  }

  return {
    isValid: true,
    reason: "ok",
    blockedRawCardData: false,
  };
}
