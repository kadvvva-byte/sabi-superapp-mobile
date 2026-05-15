import type { WalletProviderStatus } from "../../../../shared/wallet/wallet-foundation";

export type CryptoProviderFamily =
  | "custody"
  | "market_data"
  | "blockchain"
  | "risk_admin"
  | "wallet_backend"
  | "onramp"
  | "offramp";

export type CryptoAsset = {
  id: string;
  name: string;
  symbol: string;
  networkId: string;
  networkName?: string | null;
  balance: number;
  price: number;
  fiatValue: number;
  change24h: number;
  address: string;
  providerStatus?: WalletProviderStatus;
  providerAssetId?: string | null;
  providerPriceSource?: string | null;
  providerReference?: string | null;
};

export type CryptoTransactionStatus =
  | "pending"
  | "completed"
  | "failed"
  | "provider_pending"
  | "blockchain_pending"
  | "confirmed"
  | "rejected"
  | "restricted";

export type CryptoTransactionType =
  | "send"
  | "receive"
  | "swap"
  | "buy"
  | "sell";

export type CryptoTransaction = {
  id: string;
  assetSymbol: string;
  amount: number;
  type: CryptoTransactionType;
  status: CryptoTransactionStatus;
  createdAt: string;
  networkId?: string | null;
  txHash?: string | null;
  providerReference?: string | null;
  ledgerReference?: string | null;
  providerStatus?: WalletProviderStatus;
};
