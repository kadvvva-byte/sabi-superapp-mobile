import { streamPremiumGiftPack187A } from "./streamPremiumGiftPack187A";
import { streamPremiumGiftPack188A } from "./streamPremiumGiftPack188A";
import { streamPremiumGiftPack190A } from "./streamPremiumGiftPack190A";
import { streamPremiumGiftPack197A } from "./streamPremiumGiftPack197A";
import { streamPremiumGiftDiamondTopUpPolicy197C, streamPremiumGiftPack197C, streamPremiumGiftPack197CIds } from "./streamPremiumGiftPack197C";
import { streamPremiumGiftPack197D, streamPremiumGiftPack197DIds } from "./streamPremiumGiftPack197D";
import { streamPremiumGiftPack197E, streamPremiumGiftPack197EIds, streamPremiumGiftPack197ESummary } from "./streamPremiumGiftPack197E";

export type StreamPremiumGiftDiamondEconomy197E = {
  assetId: string;
  displayNameRu: string;
  displayName: string;
  packLabelRu: string;
  diamondPrice: number;
  diamondPriceLabelRu: string;
  topUpMinimumLabelRu: string;
  priceQualityRuleRu: string;
  pack7QualityPromiseRu: string;
  userDisclosureRu: string;
  chipsRu: readonly string[];
  checklistRu: readonly string[];
  userFacingOnly: true;
  pricingMetadataOnly: true;
  realTopUpRuntimeEnabledNow: false;
  paymentRuntimeEnabledNow: false;
  providerRuntimeEnabledNow: false;
  walletMutationEnabledNow: false;
  realSendRuntimeEnabledNow: false;
  payoutRuntimeEnabledNow: false;
};

type GiftMeta197E = { id: string; displayNameRu: string; displayName: string; localCostLabel: string; rarityLabel: string; qualityLabel: string; effectLabel: string; diamondPrice?: number; qualityPromiseRu?: string };

const legacyGifts197E: GiftMeta197E[] = [...streamPremiumGiftPack187A, ...streamPremiumGiftPack188A, ...streamPremiumGiftPack190A, ...streamPremiumGiftPack197A];
const allGifts197E: GiftMeta197E[] = [...legacyGifts197E, ...streamPremiumGiftPack197C, ...streamPremiumGiftPack197D, ...streamPremiumGiftPack197E];
const explicitDiamondPriceByAssetId197E = new Map([...streamPremiumGiftPack197C, ...streamPremiumGiftPack197D, ...streamPremiumGiftPack197E].map((gift) => [gift.id, gift.diamondPrice] as const));

function getLegacyDiamondPrice197E(gift: GiftMeta197E): number {
  const explicit = explicitDiamondPriceByAssetId197E.get(gift.id);
  if (typeof explicit === "number") return explicit;
  const match = gift.localCostLabel.match(/\d+/);
  const parsed = match ? Number(match[0]) : 25;
  return Math.max(streamPremiumGiftDiamondTopUpPolicy197C.giftPriceMinDiamonds, Math.min(streamPremiumGiftDiamondTopUpPolicy197C.giftPriceMaxDiamonds, parsed));
}

function getPackLabel197E(assetId: string): string {
  if (streamPremiumGiftPack197EIds.has(assetId)) return "Pack 7 · Celestial Dynasty";
  if (streamPremiumGiftPack197DIds.has(assetId)) return "Pack 6 · Royal Mythic";
  if (streamPremiumGiftPack197CIds.has(assetId)) return "Pack 5 · Diamond Range";
  if (streamPremiumGiftPack197A.some((gift) => gift.id === assetId)) return "Pack 4 · Ultra Premium";
  if (streamPremiumGiftPack190A.some((gift) => gift.id === assetId)) return "Pack 3 · Premium Live";
  if (streamPremiumGiftPack188A.some((gift) => gift.id === assetId)) return "Pack 2 · Ultra Stage";
  return "Pack 1 · Classic Anime";
}

function diamondLabel197E(price: number): string {
  return price === 1 ? "1 алмаз" : `${price} алмазов`;
}

function qualityBand197E(price: number): string {
  if (price >= 10000) return "maximum ultra-top gift: must look truly premium, never fake expensive";
  if (price >= 7500) return "ultra mythic gift: palace-level cinematic appearance required";
  if (price >= 2500) return "mythic gift: strong celestial scene required";
  if (price >= 777) return "legendary gift: visible premium motion required";
  if (price >= 120) return "epic gift: clean premium entrance required";
  if (price >= 10) return "clean gift: polished poster + readable FX required";
  return "micro gift: still clean and premium, never garbage";
}

export const streamPremiumGiftDiamondEconomyRows197E: readonly StreamPremiumGiftDiamondEconomy197E[] = allGifts197E.map((gift) => {
  const diamondPrice = getLegacyDiamondPrice197E(gift);
  return {
    assetId: gift.id,
    displayNameRu: gift.displayNameRu,
    displayName: gift.displayName,
    packLabelRu: getPackLabel197E(gift.id),
    diamondPrice,
    diamondPriceLabelRu: diamondLabel197E(diamondPrice),
    topUpMinimumLabelRu: `Минимум пополнения: ${streamPremiumGiftDiamondTopUpPolicy197C.minimumTopUpCoins} coins = $${streamPremiumGiftDiamondTopUpPolicy197C.minimumTopUpUsd}`,
    priceQualityRuleRu: `${qualityBand197E(diamondPrice)} · ${gift.rarityLabel} · ${gift.qualityLabel}`,
    pack7QualityPromiseRu: gift.qualityPromiseRu ?? "Цена должна соответствовать качеству: clean poster, controlled FX, readable safe-area, no fake expensive.",
    userDisclosureRu: "Цены подарков показываются в алмазах. Пополнение и покупка сейчас не выполняются: backend/provider/Wallet/send runtime disabled.",
    chipsRu: ["197E", `${diamondPrice} diamonds`, "fair price", "Pack 7 ready", "no Wallet mutation"],
    checklistRu: [
      "gift price must stay between 1 and 10000 diamonds",
      "minimum top-up disclosure stays 10 coins = $10",
      "low-price gifts must still look clean and premium",
      "high-price gifts must justify price with visible quality",
      "no real top-up, provider call, Wallet mutation, payout or send runtime now",
    ],
    userFacingOnly: true,
    pricingMetadataOnly: true,
    realTopUpRuntimeEnabledNow: false,
    paymentRuntimeEnabledNow: false,
    providerRuntimeEnabledNow: false,
    walletMutationEnabledNow: false,
    realSendRuntimeEnabledNow: false,
    payoutRuntimeEnabledNow: false,
  };
});

export const streamPremiumGiftDiamondEconomySummary197E = {
  version: "STREAM-GAME-GIFTS-197E",
  totalGiftCount: streamPremiumGiftDiamondEconomyRows197E.length,
  cumulativeGiftCount: streamPremiumGiftDiamondEconomyRows197E.length,
  pack7Count: streamPremiumGiftPack197ESummary.pack7Count,
  addedGiftCount: streamPremiumGiftPack197ESummary.addedGiftCount,
  diamondPriceMin: Math.min(...streamPremiumGiftDiamondEconomyRows197E.map((row) => row.diamondPrice)),
  diamondPriceMax: Math.max(...streamPremiumGiftDiamondEconomyRows197E.map((row) => row.diamondPrice)),
  minimumTopUpCoins: streamPremiumGiftDiamondTopUpPolicy197C.minimumTopUpCoins,
  minimumTopUpUsd: streamPremiumGiftDiamondTopUpPolicy197C.minimumTopUpUsd,
  fairPricingCoverage: streamPremiumGiftDiamondEconomyRows197E.length,
  userFacingOnly: true,
  pricingMetadataOnly: true,
  realTopUpRuntimeEnabledNow: false,
  paymentRuntimeEnabledNow: false,
  providerRuntimeEnabledNow: false,
  walletMutationEnabledNow: false,
  realSendRuntimeEnabledNow: false,
  payoutRuntimeEnabledNow: false,
} as const;

export function getStreamPremiumGiftDiamondEconomy197E(assetId: string): StreamPremiumGiftDiamondEconomy197E {
  return streamPremiumGiftDiamondEconomyRows197E.find((row) => row.assetId === assetId) ?? streamPremiumGiftDiamondEconomyRows197E[0];
}
