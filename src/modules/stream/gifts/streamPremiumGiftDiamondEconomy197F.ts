import { streamPremiumGiftPack187A } from "./streamPremiumGiftPack187A";
import { streamPremiumGiftPack188A } from "./streamPremiumGiftPack188A";
import { streamPremiumGiftPack190A } from "./streamPremiumGiftPack190A";
import { streamPremiumGiftPack197A } from "./streamPremiumGiftPack197A";
import { streamPremiumGiftDiamondTopUpPolicy197C, streamPremiumGiftPack197C, streamPremiumGiftPack197CIds } from "./streamPremiumGiftPack197C";
import { streamPremiumGiftPack197D, streamPremiumGiftPack197DIds } from "./streamPremiumGiftPack197D";
import { streamPremiumGiftPack197E, streamPremiumGiftPack197EIds } from "./streamPremiumGiftPack197E";
import { streamPremiumGiftPack197F, streamPremiumGiftPack197FIds, streamPremiumGiftPack197FSummary } from "./streamPremiumGiftPack197F";

export type StreamPremiumGiftDiamondEconomy197F = {
  assetId: string;
  displayNameRu: string;
  displayName: string;
  packLabelRu: string;
  diamondPrice: number;
  diamondPriceLabelRu: string;
  topUpMinimumLabelRu: string;
  priceQualityRuleRu: string;
  pack8QualityPromiseRu: string;
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

type GiftMeta197F = { id: string; displayNameRu: string; displayName: string; localCostLabel: string; rarityLabel: string; qualityLabel: string; effectLabel: string; diamondPrice?: number; qualityPromiseRu?: string };

const legacyGifts197F: GiftMeta197F[] = [...streamPremiumGiftPack187A, ...streamPremiumGiftPack188A, ...streamPremiumGiftPack190A, ...streamPremiumGiftPack197A];
const allGifts197F: GiftMeta197F[] = [...legacyGifts197F, ...streamPremiumGiftPack197C, ...streamPremiumGiftPack197D, ...streamPremiumGiftPack197E, ...streamPremiumGiftPack197F];
const explicitDiamondPriceByAssetId197F = new Map([...streamPremiumGiftPack197C, ...streamPremiumGiftPack197D, ...streamPremiumGiftPack197E, ...streamPremiumGiftPack197F].map((gift) => [gift.id, gift.diamondPrice] as const));

function getLegacyDiamondPrice197F(gift: GiftMeta197F): number {
  const explicit = explicitDiamondPriceByAssetId197F.get(gift.id);
  if (typeof explicit === "number") return explicit;
  const match = gift.localCostLabel.match(/\d+/);
  const parsed = match ? Number(match[0]) : 25;
  return Math.max(streamPremiumGiftDiamondTopUpPolicy197C.giftPriceMinDiamonds, Math.min(streamPremiumGiftDiamondTopUpPolicy197C.giftPriceMaxDiamonds, parsed));
}

function getPackLabel197F(assetId: string): string {
  if (streamPremiumGiftPack197FIds.has(assetId)) return "Pack 8 · Imperial Galaxy";
  if (streamPremiumGiftPack197EIds.has(assetId)) return "Pack 7 · Celestial Dynasty";
  if (streamPremiumGiftPack197DIds.has(assetId)) return "Pack 6 · Royal Mythic";
  if (streamPremiumGiftPack197CIds.has(assetId)) return "Pack 5 · Diamond Range";
  if (streamPremiumGiftPack197A.some((gift) => gift.id === assetId)) return "Pack 4 · Ultra Premium";
  if (streamPremiumGiftPack190A.some((gift) => gift.id === assetId)) return "Pack 3 · Premium Live";
  if (streamPremiumGiftPack188A.some((gift) => gift.id === assetId)) return "Pack 2 · Ultra Stage";
  return "Pack 1 · Classic Anime";
}

function diamondLabel197F(price: number): string {
  return price === 1 ? "1 алмаз" : `${price} алмазов`;
}

function qualityBand197F(price: number): string {
  if (price >= 10000) return "maximum ultra-top gift: must look truly premium, never fake expensive";
  if (price >= 8800) return "ultra mythic gift: jet/crown-level cinematic appearance required";
  if (price >= 3000) return "mythic gift: strong royal galaxy scene required";
  if (price >= 888) return "legendary gift: visible premium bloom required";
  if (price >= 300) return "epic gift: clean premium screen arc required";
  if (price >= 10) return "clean gift: polished poster + readable FX required";
  return "micro gift: still clean and premium, never garbage";
}

export const streamPremiumGiftDiamondEconomyRows197F: readonly StreamPremiumGiftDiamondEconomy197F[] = allGifts197F.map((gift) => {
  const diamondPrice = getLegacyDiamondPrice197F(gift);
  return {
    assetId: gift.id,
    displayNameRu: gift.displayNameRu,
    displayName: gift.displayName,
    packLabelRu: getPackLabel197F(gift.id),
    diamondPrice,
    diamondPriceLabelRu: diamondLabel197F(diamondPrice),
    topUpMinimumLabelRu: `Минимум пополнения: ${streamPremiumGiftDiamondTopUpPolicy197C.minimumTopUpCoins} coins = $${streamPremiumGiftDiamondTopUpPolicy197C.minimumTopUpUsd}`,
    priceQualityRuleRu: `${qualityBand197F(diamondPrice)} · ${gift.rarityLabel} · ${gift.qualityLabel}`,
    pack8QualityPromiseRu: gift.qualityPromiseRu ?? "Цена должна соответствовать качеству: clean poster, controlled FX, readable safe-area, no fake expensive.",
    userDisclosureRu: "Цены подарков показываются в алмазах. Пополнение и покупка сейчас не выполняются: backend/provider/Wallet/send runtime disabled.",
    chipsRu: ["197F", `${diamondPrice} diamonds`, "fair price", "Pack 8 ready", "no Wallet mutation"],
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

export const streamPremiumGiftDiamondEconomySummary197F = {
  version: "STREAM-GAME-GIFTS-197F",
  totalGiftCount: streamPremiumGiftDiamondEconomyRows197F.length,
  cumulativeGiftCount: streamPremiumGiftDiamondEconomyRows197F.length,
  pack8Count: streamPremiumGiftPack197FSummary.pack8Count,
  addedGiftCount: streamPremiumGiftPack197FSummary.addedGiftCount,
  diamondPriceMin: Math.min(...streamPremiumGiftDiamondEconomyRows197F.map((row) => row.diamondPrice)),
  diamondPriceMax: Math.max(...streamPremiumGiftDiamondEconomyRows197F.map((row) => row.diamondPrice)),
  minimumTopUpCoins: streamPremiumGiftDiamondTopUpPolicy197C.minimumTopUpCoins,
  minimumTopUpUsd: streamPremiumGiftDiamondTopUpPolicy197C.minimumTopUpUsd,
  fairPricingCoverage: streamPremiumGiftDiamondEconomyRows197F.length,
  userFacingOnly: true,
  pricingMetadataOnly: true,
  realTopUpRuntimeEnabledNow: false,
  paymentRuntimeEnabledNow: false,
  providerRuntimeEnabledNow: false,
  walletMutationEnabledNow: false,
  realSendRuntimeEnabledNow: false,
  payoutRuntimeEnabledNow: false,
} as const;

export function getStreamPremiumGiftDiamondEconomy197F(assetId: string): StreamPremiumGiftDiamondEconomy197F {
  return streamPremiumGiftDiamondEconomyRows197F.find((row) => row.assetId === assetId) ?? streamPremiumGiftDiamondEconomyRows197F[0];
}
