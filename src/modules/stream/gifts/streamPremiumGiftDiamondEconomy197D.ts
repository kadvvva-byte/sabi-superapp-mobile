import { streamPremiumGiftPack187A } from "./streamPremiumGiftPack187A";
import { streamPremiumGiftPack188A } from "./streamPremiumGiftPack188A";
import { streamPremiumGiftPack190A } from "./streamPremiumGiftPack190A";
import { streamPremiumGiftPack197A } from "./streamPremiumGiftPack197A";
import { streamPremiumGiftDiamondTopUpPolicy197C, streamPremiumGiftPack197C, streamPremiumGiftPack197CIds } from "./streamPremiumGiftPack197C";
import { streamPremiumGiftPack197D, streamPremiumGiftPack197DIds, streamPremiumGiftPack197DSummary } from "./streamPremiumGiftPack197D";

export type StreamPremiumGiftDiamondEconomy197D = {
  assetId: string;
  displayNameRu: string;
  displayName: string;
  packLabelRu: string;
  diamondPrice: number;
  diamondPriceLabelRu: string;
  topUpMinimumLabelRu: string;
  priceQualityRuleRu: string;
  pack6QualityPromiseRu: string;
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

type GiftMeta197D = { id: string; displayNameRu: string; displayName: string; localCostLabel: string; rarityLabel: string; qualityLabel: string; effectLabel: string; diamondPrice?: number; qualityPromiseRu?: string };

const legacyGifts197D: GiftMeta197D[] = [...streamPremiumGiftPack187A, ...streamPremiumGiftPack188A, ...streamPremiumGiftPack190A, ...streamPremiumGiftPack197A];
const allGifts197D: GiftMeta197D[] = [...legacyGifts197D, ...streamPremiumGiftPack197C, ...streamPremiumGiftPack197D];
const explicitDiamondPriceByAssetId197D = new Map([...streamPremiumGiftPack197C, ...streamPremiumGiftPack197D].map((gift) => [gift.id, gift.diamondPrice] as const));

function getLegacyDiamondPrice197D(gift: GiftMeta197D): number {
  const explicit = explicitDiamondPriceByAssetId197D.get(gift.id);
  if (typeof explicit === "number") return explicit;
  const match = gift.localCostLabel.match(/\d+/);
  const parsed = match ? Number(match[0]) : 25;
  return Math.max(streamPremiumGiftDiamondTopUpPolicy197C.giftPriceMinDiamonds, Math.min(streamPremiumGiftDiamondTopUpPolicy197C.giftPriceMaxDiamonds, parsed));
}

function getPackLabel197D(assetId: string): string {
  if (streamPremiumGiftPack197DIds.has(assetId)) return "Pack 6 · Royal Mythic";
  if (streamPremiumGiftPack197CIds.has(assetId)) return "Pack 5 · Diamond Range";
  if (streamPremiumGiftPack197A.some((gift) => gift.id === assetId)) return "Pack 4 · Ultra Premium";
  if (streamPremiumGiftPack190A.some((gift) => gift.id === assetId)) return "Pack 3 · Premium Live";
  if (streamPremiumGiftPack188A.some((gift) => gift.id === assetId)) return "Pack 2 · Ultra Stage";
  return "Pack 1 · Classic Anime";
}

function diamondLabel197D(price: number): string {
  return price === 1 ? "1 алмаз" : `${price} алмазов`;
}

function qualityBand197D(price: number): string {
  if (price >= 9000) return "ultra top gift: cinematic quality must fully justify the price";
  if (price >= 5000) return "ultra mythic gift: cosmic-stage appearance required";
  if (price >= 1000) return "mythic gift: palace-level appearance required";
  if (price >= 500) return "legendary gift: strong motion scene required";
  if (price >= 150) return "epic gift: premium entrance required";
  if (price >= 10) return "clean gift: polished poster + readable FX required";
  return "micro gift: still clean and premium, never garbage";
}

export const streamPremiumGiftDiamondEconomyRows197D: readonly StreamPremiumGiftDiamondEconomy197D[] = allGifts197D.map((gift) => {
  const diamondPrice = getLegacyDiamondPrice197D(gift);
  return {
    assetId: gift.id,
    displayNameRu: gift.displayNameRu,
    displayName: gift.displayName,
    packLabelRu: getPackLabel197D(gift.id),
    diamondPrice,
    diamondPriceLabelRu: diamondLabel197D(diamondPrice),
    topUpMinimumLabelRu: `Минимум пополнения: ${streamPremiumGiftDiamondTopUpPolicy197C.minimumTopUpCoins} coins = $${streamPremiumGiftDiamondTopUpPolicy197C.minimumTopUpUsd}`,
    priceQualityRuleRu: `${qualityBand197D(diamondPrice)} · ${gift.rarityLabel} · ${gift.qualityLabel}`,
    pack6QualityPromiseRu: gift.qualityPromiseRu ?? "Цена должна соответствовать качеству: clean poster, controlled FX, readable safe-area, no fake expensive.",
    userDisclosureRu: "Цены подарков показываются в алмазах. Пополнение и покупка сейчас не выполняются: backend/provider/Wallet/send runtime disabled.",
    chipsRu: ["197D", `${diamondPrice} diamonds`, "fair price", "Pack 6 ready", "no Wallet mutation"],
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

export const streamPremiumGiftDiamondEconomySummary197D = {
  version: "STREAM-GAME-GIFTS-197D",
  totalGiftCount: streamPremiumGiftDiamondEconomyRows197D.length,
  cumulativeGiftCount: streamPremiumGiftDiamondEconomyRows197D.length,
  pack6Count: streamPremiumGiftPack197DSummary.pack6Count,
  addedGiftCount: streamPremiumGiftPack197DSummary.addedGiftCount,
  diamondPriceMin: Math.min(...streamPremiumGiftDiamondEconomyRows197D.map((row) => row.diamondPrice)),
  diamondPriceMax: Math.max(...streamPremiumGiftDiamondEconomyRows197D.map((row) => row.diamondPrice)),
  minimumTopUpCoins: streamPremiumGiftDiamondTopUpPolicy197C.minimumTopUpCoins,
  minimumTopUpUsd: streamPremiumGiftDiamondTopUpPolicy197C.minimumTopUpUsd,
  fairPricingCoverage: streamPremiumGiftDiamondEconomyRows197D.length,
  userFacingOnly: true,
  pricingMetadataOnly: true,
  realTopUpRuntimeEnabledNow: false,
  paymentRuntimeEnabledNow: false,
  providerRuntimeEnabledNow: false,
  walletMutationEnabledNow: false,
  realSendRuntimeEnabledNow: false,
  payoutRuntimeEnabledNow: false,
} as const;

export function getStreamPremiumGiftDiamondEconomy197D(assetId: string): StreamPremiumGiftDiamondEconomy197D {
  return streamPremiumGiftDiamondEconomyRows197D.find((row) => row.assetId === assetId) ?? streamPremiumGiftDiamondEconomyRows197D[0];
}
