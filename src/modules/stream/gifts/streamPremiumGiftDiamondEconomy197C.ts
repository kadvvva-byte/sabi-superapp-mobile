import { streamPremiumGiftPack187A } from "./streamPremiumGiftPack187A";
import { streamPremiumGiftPack188A } from "./streamPremiumGiftPack188A";
import { streamPremiumGiftPack190A } from "./streamPremiumGiftPack190A";
import { streamPremiumGiftPack197A } from "./streamPremiumGiftPack197A";
import { streamPremiumGiftDiamondTopUpPolicy197C, streamPremiumGiftPack197C, streamPremiumGiftPack197CIds, streamPremiumGiftPack197CSummary } from "./streamPremiumGiftPack197C";

export type StreamPremiumGiftDiamondEconomy197C = {
  assetId: string;
  displayNameRu: string;
  displayName: string;
  packLabelRu: string;
  diamondPrice: number;
  diamondPriceLabelRu: string;
  topUpMinimumLabelRu: string;
  priceQualityRuleRu: string;
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

type GiftMeta197C = { id: string; displayNameRu: string; displayName: string; localCostLabel: string; rarityLabel: string; qualityLabel: string; effectLabel: string };

const legacyGifts197C: GiftMeta197C[] = [...streamPremiumGiftPack187A, ...streamPremiumGiftPack188A, ...streamPremiumGiftPack190A, ...streamPremiumGiftPack197A];
const allGifts197C: GiftMeta197C[] = [...legacyGifts197C, ...streamPremiumGiftPack197C];
const explicitDiamondPriceByAssetId197C = new Map(streamPremiumGiftPack197C.map((gift) => [gift.id, gift.diamondPrice] as const));

function getLegacyDiamondPrice197C(gift: GiftMeta197C): number {
  const explicit = explicitDiamondPriceByAssetId197C.get(gift.id);
  if (typeof explicit === "number") return explicit;
  const match = gift.localCostLabel.match(/\d+/);
  const parsed = match ? Number(match[0]) : 25;
  return Math.max(1, Math.min(10000, parsed));
}

function getPackLabel197C(assetId: string): string {
  if (streamPremiumGiftPack197CIds.has(assetId)) return "Pack 5 · Diamond Range";
  if (streamPremiumGiftPack197A.some((gift) => gift.id === assetId)) return "Pack 4 · Ultra Premium";
  if (streamPremiumGiftPack190A.some((gift) => gift.id === assetId)) return "Pack 3 · Premium Live";
  if (streamPremiumGiftPack188A.some((gift) => gift.id === assetId)) return "Pack 2 · Ultra Stage";
  return "Pack 1 · Classic Anime";
}

function diamondLabel197C(price: number): string {
  return price === 1 ? "1 алмаз" : `${price} алмазов`;
}

function qualityBand197C(price: number): string {
  if (price >= 10000) return "ultra top gift: full cinematic quality required";
  if (price >= 1000) return "mythic gift: palace-level appearance required";
  if (price >= 250) return "legendary gift: strong screen moment required";
  if (price >= 75) return "epic gift: premium entrance required";
  if (price >= 10) return "clean gift: polished poster + readable FX required";
  return "micro gift: still must look clean, not cheap or garbage";
}

export const streamPremiumGiftDiamondEconomyRows197C: readonly StreamPremiumGiftDiamondEconomy197C[] = allGifts197C.map((gift) => {
  const diamondPrice = getLegacyDiamondPrice197C(gift);
  return {
    assetId: gift.id,
    displayNameRu: gift.displayNameRu,
    displayName: gift.displayName,
    packLabelRu: getPackLabel197C(gift.id),
    diamondPrice,
    diamondPriceLabelRu: diamondLabel197C(diamondPrice),
    topUpMinimumLabelRu: `Минимум пополнения: ${streamPremiumGiftDiamondTopUpPolicy197C.minimumTopUpCoins} coins = $${streamPremiumGiftDiamondTopUpPolicy197C.minimumTopUpUsd}`,
    priceQualityRuleRu: `${qualityBand197C(diamondPrice)} · ${gift.rarityLabel} · ${gift.qualityLabel}`,
    userDisclosureRu: "Цены подарков показываются в алмазах. Пополнение и покупка сейчас не выполняются: backend/provider/Wallet/send runtime disabled.",
    chipsRu: ["197C", `${diamondPrice} diamonds`, "fair price", "no fake payment", "no Wallet mutation"],
    checklistRu: [
      "price must stay between 1 and 10000 diamonds",
      "minimum top-up disclosure is 10 coins = $10",
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

export const streamPremiumGiftDiamondEconomySummary197C = {
  version: "STREAM-GAME-GIFTS-197C",
  totalGiftCount: streamPremiumGiftDiamondEconomyRows197C.length,
  cumulativeGiftCount: streamPremiumGiftDiamondEconomyRows197C.length,
  pack5Count: streamPremiumGiftPack197CSummary.pack5Count,
  addedGiftCount: streamPremiumGiftPack197CSummary.addedGiftCount,
  diamondPriceMin: Math.min(...streamPremiumGiftDiamondEconomyRows197C.map((row) => row.diamondPrice)),
  diamondPriceMax: Math.max(...streamPremiumGiftDiamondEconomyRows197C.map((row) => row.diamondPrice)),
  minimumTopUpCoins: streamPremiumGiftDiamondTopUpPolicy197C.minimumTopUpCoins,
  minimumTopUpUsd: streamPremiumGiftDiamondTopUpPolicy197C.minimumTopUpUsd,
  fairPricingCoverage: streamPremiumGiftDiamondEconomyRows197C.length,
  userFacingOnly: true,
  pricingMetadataOnly: true,
  realTopUpRuntimeEnabledNow: false,
  paymentRuntimeEnabledNow: false,
  providerRuntimeEnabledNow: false,
  walletMutationEnabledNow: false,
  realSendRuntimeEnabledNow: false,
  payoutRuntimeEnabledNow: false,
} as const;

export function getStreamPremiumGiftDiamondEconomy197C(assetId: string): StreamPremiumGiftDiamondEconomy197C {
  return streamPremiumGiftDiamondEconomyRows197C.find((row) => row.assetId === assetId) ?? streamPremiumGiftDiamondEconomyRows197C[0];
}
