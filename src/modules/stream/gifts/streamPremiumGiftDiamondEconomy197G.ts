import { streamPremiumGiftPack187A } from "./streamPremiumGiftPack187A";
import { streamPremiumGiftPack188A } from "./streamPremiumGiftPack188A";
import { streamPremiumGiftPack190A } from "./streamPremiumGiftPack190A";
import { streamPremiumGiftPack197A } from "./streamPremiumGiftPack197A";
import { streamPremiumGiftDiamondTopUpPolicy197C, streamPremiumGiftPack197C, streamPremiumGiftPack197CIds } from "./streamPremiumGiftPack197C";
import { streamPremiumGiftPack197D, streamPremiumGiftPack197DIds } from "./streamPremiumGiftPack197D";
import { streamPremiumGiftPack197E, streamPremiumGiftPack197EIds } from "./streamPremiumGiftPack197E";
import { streamPremiumGiftPack197F, streamPremiumGiftPack197FIds } from "./streamPremiumGiftPack197F";
import { streamPremiumGiftPack197G, streamPremiumGiftPack197GIds, streamPremiumGiftPack197GSummary } from "./streamPremiumGiftPack197G";

export type StreamPremiumGiftDiamondEconomy197G = {
  assetId: string;
  displayNameRu: string;
  displayName: string;
  packLabelRu: string;
  diamondPrice: number;
  diamondPriceLabelRu: string;
  topUpMinimumLabelRu: string;
  priceQualityRuleRu: string;
  pack9QualityPromiseRu: string;
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

type GiftMeta197G = { id: string; displayNameRu: string; displayName: string; localCostLabel: string; rarityLabel: string; qualityLabel: string; effectLabel: string; diamondPrice?: number; qualityPromiseRu?: string };

const legacyGifts197G: GiftMeta197G[] = [...streamPremiumGiftPack187A, ...streamPremiumGiftPack188A, ...streamPremiumGiftPack190A, ...streamPremiumGiftPack197A];
const allGifts197G: GiftMeta197G[] = [...legacyGifts197G, ...streamPremiumGiftPack197C, ...streamPremiumGiftPack197D, ...streamPremiumGiftPack197E, ...streamPremiumGiftPack197F, ...streamPremiumGiftPack197G];
const explicitDiamondPriceByAssetId197G = new Map([...streamPremiumGiftPack197C, ...streamPremiumGiftPack197D, ...streamPremiumGiftPack197E, ...streamPremiumGiftPack197F, ...streamPremiumGiftPack197G].map((gift) => [gift.id, gift.diamondPrice] as const));

function getLegacyDiamondPrice197G(gift: GiftMeta197G): number {
  const explicit = explicitDiamondPriceByAssetId197G.get(gift.id);
  if (typeof explicit === "number") return explicit;
  const match = gift.localCostLabel.match(/\d+/);
  const parsed = match ? Number(match[0]) : 25;
  return Math.max(streamPremiumGiftDiamondTopUpPolicy197C.giftPriceMinDiamonds, Math.min(streamPremiumGiftDiamondTopUpPolicy197C.giftPriceMaxDiamonds, parsed));
}

function getPackLabel197G(assetId: string): string {
  if (streamPremiumGiftPack197GIds.has(assetId)) return "Pack 9 · Royal Ocean Legends";
  if (streamPremiumGiftPack197FIds.has(assetId)) return "Pack 8 · Imperial Galaxy";
  if (streamPremiumGiftPack197EIds.has(assetId)) return "Pack 7 · Celestial Dynasty";
  if (streamPremiumGiftPack197DIds.has(assetId)) return "Pack 6 · Royal Mythic";
  if (streamPremiumGiftPack197CIds.has(assetId)) return "Pack 5 · Diamond Range";
  if (streamPremiumGiftPack197A.some((gift) => gift.id === assetId)) return "Pack 4 · Ultra Premium";
  if (streamPremiumGiftPack190A.some((gift) => gift.id === assetId)) return "Pack 3 · Premium Live";
  if (streamPremiumGiftPack188A.some((gift) => gift.id === assetId)) return "Pack 2 · Ultra Stage";
  return "Pack 1 · Classic Anime";
}

function diamondLabel197G(price: number): string {
  return price === 1 ? "1 алмаз" : `${price} алмазов`;
}

function qualityBand197G(price: number): string {
  if (price >= 10000) return "maximum ultra-top gift: must look truly premium, never fake expensive";
  if (price >= 9000) return "ultra mythic gift: palace/emperor-level cinematic appearance required";
  if (price >= 4000) return "mythic gift: strong royal ocean scene required";
  if (price >= 990) return "legendary gift: visible premium ocean bloom required";
  if (price >= 450) return "epic gift: clean premium ocean impact required";
  if (price >= 10) return "clean gift: polished poster + readable FX required";
  return "micro gift: still clean and premium, never garbage";
}

export const streamPremiumGiftDiamondEconomyRows197G: readonly StreamPremiumGiftDiamondEconomy197G[] = allGifts197G.map((gift) => {
  const diamondPrice = getLegacyDiamondPrice197G(gift);
  return {
    assetId: gift.id,
    displayNameRu: gift.displayNameRu,
    displayName: gift.displayName,
    packLabelRu: getPackLabel197G(gift.id),
    diamondPrice,
    diamondPriceLabelRu: diamondLabel197G(diamondPrice),
    topUpMinimumLabelRu: `Минимум пополнения: ${streamPremiumGiftDiamondTopUpPolicy197C.minimumTopUpCoins} coins = $${streamPremiumGiftDiamondTopUpPolicy197C.minimumTopUpUsd}`,
    priceQualityRuleRu: `${qualityBand197G(diamondPrice)} · ${gift.rarityLabel} · ${gift.qualityLabel}`,
    pack9QualityPromiseRu: gift.qualityPromiseRu ?? "Цена должна соответствовать качеству: clean poster, controlled FX, readable safe-area, no fake expensive.",
    userDisclosureRu: "Цены подарков показываются в алмазах. Пополнение и покупка сейчас не выполняются: backend/provider/Wallet/send runtime disabled.",
    chipsRu: ["197G", `${diamondPrice} diamonds`, "fair price", "Pack 9 ready", "no Wallet mutation"],
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

export const streamPremiumGiftDiamondEconomySummary197G = {
  version: "STREAM-GAME-GIFTS-197G",
  totalGiftCount: streamPremiumGiftDiamondEconomyRows197G.length,
  cumulativeGiftCount: streamPremiumGiftDiamondEconomyRows197G.length,
  pack9Count: streamPremiumGiftPack197GSummary.pack9Count,
  addedGiftCount: streamPremiumGiftPack197GSummary.addedGiftCount,
  diamondPriceMin: Math.min(...streamPremiumGiftDiamondEconomyRows197G.map((row) => row.diamondPrice)),
  diamondPriceMax: Math.max(...streamPremiumGiftDiamondEconomyRows197G.map((row) => row.diamondPrice)),
  minimumTopUpCoins: streamPremiumGiftDiamondTopUpPolicy197C.minimumTopUpCoins,
  minimumTopUpUsd: streamPremiumGiftDiamondTopUpPolicy197C.minimumTopUpUsd,
  fairPricingCoverage: streamPremiumGiftDiamondEconomyRows197G.length,
  userFacingOnly: true,
  pricingMetadataOnly: true,
  realTopUpRuntimeEnabledNow: false,
  paymentRuntimeEnabledNow: false,
  providerRuntimeEnabledNow: false,
  walletMutationEnabledNow: false,
  realSendRuntimeEnabledNow: false,
  payoutRuntimeEnabledNow: false,
} as const;

export function getStreamPremiumGiftDiamondEconomy197G(assetId: string): StreamPremiumGiftDiamondEconomy197G {
  return streamPremiumGiftDiamondEconomyRows197G.find((row) => row.assetId === assetId) ?? streamPremiumGiftDiamondEconomyRows197G[0];
}
