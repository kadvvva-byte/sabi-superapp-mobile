import type { WalletFoundationSnapshot } from "../../../../shared/wallet/wallet-foundation";
import {
  getCryptoWalletProviderReadiness,
  sanitizeCryptoWalletProviderPayload,
  type CryptoWalletProviderOperation,
  type CryptoWalletProviderReadiness,
} from "../../../../shared/wallet/wallet-crypto-provider";
import type { CryptoAsset, CryptoTransaction } from "../types/crypto.types";

export type CryptoProviderStatus = CryptoWalletProviderReadiness & {
  configured: boolean;
  custodyProviderReady: boolean;
  marketDataProviderReady: boolean;
  adminControlsReady: boolean;
};

function toCryptoProviderStatus(readiness: CryptoWalletProviderReadiness): CryptoProviderStatus {
  return {
    ...readiness,
    configured: readiness.reason === "ready",
    custodyProviderReady: readiness.custodyProviderConfigured,
    marketDataProviderReady: readiness.marketDataProviderConfigured,
    adminControlsReady: readiness.riskAdminConfigured,
  };
}

function assertCryptoOperationAllowed(
  operation: CryptoWalletProviderOperation,
  snapshot?: Partial<WalletFoundationSnapshot> | null,
  payload?: unknown,
) {
  const readiness = getCryptoWalletProviderReadiness(snapshot, operation);
  const sanitized = sanitizeCryptoWalletProviderPayload(payload ?? {}, snapshot);

  if (!sanitized.isValid) {
    throw new Error(`crypto_provider_payload_blocked:${sanitized.reason}`);
  }

  if (readiness.reason !== "ready" || !readiness.canExecute) {
    throw new Error(`crypto_provider_not_ready:${readiness.reason}`);
  }

  return readiness;
}

export const cryptoService = {
  async getProviderStatus(
    snapshot?: Partial<WalletFoundationSnapshot> | null,
    operation: CryptoWalletProviderOperation = "portfolio",
  ): Promise<CryptoProviderStatus> {
    return toCryptoProviderStatus(getCryptoWalletProviderReadiness(snapshot, operation));
  },

  async getAssets(snapshot?: Partial<WalletFoundationSnapshot> | null): Promise<CryptoAsset[]> {
    const readiness = getCryptoWalletProviderReadiness(snapshot, "assets");
    if (!readiness.canReadProviderBalances || !readiness.canReadMarketData) {
      return [];
    }

    // Real assets must come from the connected crypto provider/backend.
    // Do not return local/demo BTC/ETH rows here.
    return [];
  },

  async getAssetById(
    _id: string,
    snapshot?: Partial<WalletFoundationSnapshot> | null,
  ): Promise<CryptoAsset | undefined> {
    const readiness = getCryptoWalletProviderReadiness(snapshot, "assetDetails");
    if (!readiness.canReadProviderBalances || !readiness.canReadMarketData) {
      return undefined;
    }

    // Real asset details must come from the provider/backend.
    return undefined;
  },

  async getTransactions(
    snapshot?: Partial<WalletFoundationSnapshot> | null,
  ): Promise<CryptoTransaction[]> {
    const readiness = getCryptoWalletProviderReadiness(snapshot, "history");
    if (!readiness.canReadHistory) {
      return [];
    }

    // Real transaction history must come from provider/blockchain synchronization.
    return [];
  },

  async prepareExecution(params: {
    operation: CryptoWalletProviderOperation;
    snapshot?: Partial<WalletFoundationSnapshot> | null;
    payload?: unknown;
  }) {
    return assertCryptoOperationAllowed(params.operation, params.snapshot, params.payload);
  },
};
