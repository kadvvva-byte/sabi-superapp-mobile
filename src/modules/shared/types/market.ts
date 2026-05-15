export type MarketTrend = "up" | "down" | "flat";
export type MarketStatus = "live" | "delayed" | "maintenance" | "unavailable";
export type QuoteStatus = "ready" | "loading" | "expired" | "unavailable";
export type ProviderStatus = "online" | "degraded" | "offline" | "maintenance";

export interface AssetMarketSnapshot {
  symbol: string;
  name: string;
  price: number | null;
  change24h: number | null;
  trend: MarketTrend;
  marketStatus: MarketStatus;
}