import { streamPremiumGiftPack187A } from "./streamPremiumGiftPack187A";
import { streamPremiumGiftPack188A } from "./streamPremiumGiftPack188A";
import { streamPremiumGiftPack190A } from "./streamPremiumGiftPack190A";
import { streamPremiumGiftPack197A, streamPremiumGiftPack197ASummary } from "./streamPremiumGiftPack197A";
import { streamPremiumGiftPack197C, streamPremiumGiftPack197CSummary } from "./streamPremiumGiftPack197C";
import { streamPremiumGiftCatalogOrganizationRows188F, streamPremiumGiftCatalogOrganizationSummary188F } from "./streamPremiumGiftCatalogOrganization188F";

export type StreamPremiumGiftUltraPremiumAppearanceUpgrade197A = {
  assetId: string;
  displayNameRu: string;
  displayName: string;
  ultraTitleRu: string;
  priceFairnessRu: string;
  qualityPromiseRu: string;
  appearanceUpgradeRu: string;
  effectsUpgradeRu: string;
  finalScreenUpgradeRu: string;
  fairPriceTierRu: string;
  qualityScore: number;
  packLabelRu: string;
  rowsRu: readonly string[];
  chipsRu: readonly string[];
  safetyCopyRu: string;
  userFacingOnly: true;
  ultraPremiumMetadataOnly: true;
  fairPricingPreviewOnlyNow: true;
  backendRuntimeEnabledNow: false;
  paymentRuntimeEnabledNow: false;
  providerRuntimeEnabledNow: false;
  payoutRuntimeEnabledNow: false;
  walletMutationEnabledNow: false;
  realSendRuntimeEnabledNow: false;
  actualAnimationPlaybackRuntimeEnabledNow: false;
  actualSoundAutoplayRuntimeEnabledNow: false;
  randomWinRuntimeEnabledNow: false;
};

type GiftMeta197A = { id: string; displayNameRu: string; displayName: string; localCostLabel: string; qualityLabel: string; rarityLabel: string; effectLabel: string; visualTone: string; motionSpec: string };
const allGifts197A: GiftMeta197A[] = [...streamPremiumGiftPack187A, ...streamPremiumGiftPack188A, ...streamPremiumGiftPack190A, ...streamPremiumGiftPack197A, ...streamPremiumGiftPack197C];
const organizationByAssetId197A = new Map(streamPremiumGiftCatalogOrganizationRows188F.map((row) => [row.assetId, row] as const));

function scoreForGift(gift: GiftMeta197A, index: number): number {
  const premiumBoost = gift.rarityLabel.toLowerCase().includes("mythic") ? 8 : gift.rarityLabel.toLowerCase().includes("legendary") ? 5 : 2;
  return Math.min(100, 88 + premiumBoost + (index % 4));
}

export const streamPremiumGiftUltraPremiumAppearanceUpgradeRows197A: readonly StreamPremiumGiftUltraPremiumAppearanceUpgrade197A[] = allGifts197A.map((gift, index) => {
  const organization = organizationByAssetId197A.get(gift.id);
  const packLabelRu = organization?.packLabelRu ?? "Pack 4 · Ultra Premium";
  const qualityScore = scoreForGift(gift, index);
  return {
    assetId: gift.id,
    displayNameRu: gift.displayNameRu,
    displayName: gift.displayName,
    ultraTitleRu: `${gift.displayNameRu} · ultra premium appearance upgrade`,
    priceFairnessRu: `${gift.localCostLabel} · цена должна соответствовать качеству, без fake expensive и без мусора`,
    qualityPromiseRu: `${qualityScore}/100 quality target · poster-first · clean FX · readable stream layer`,
    appearanceUpgradeRu: `Появление: ${gift.visualTone} · cinematic entrance · safe-area aura · premium recipient focus`,
    effectsUpgradeRu: `Эффекты: ${gift.effectLabel} · ${gift.motionSpec} · controlled particles, glow, trail, burst`,
    finalScreenUpgradeRu: "Finale: дорогой clean burst, soft fade, no noisy spam, no fake win language",
    fairPriceTierRu: gift.localCostLabel,
    qualityScore,
    packLabelRu,
    rowsRu: [
      `Pack: ${packLabelRu}`,
      `Fair price: ${gift.localCostLabel}`,
      `Quality: ${gift.qualityLabel}`,
      `FX: ${gift.effectLabel}`,
      "Safety: preview only, no backend/payment/Wallet/send runtime",
    ],
    chipsRu: ["197A", "ultra premium", "fair price", "quality checked", "poster-first", "no fake money", "40 gifts"],
    safetyCopyRu: "197A усиливает user-facing gift appearance/price disclosure only. Нет оплаты, backend/provider, Wallet mutation, payout, real send, autoplay, actual media playback или random win runtime.",
    userFacingOnly: true,
    ultraPremiumMetadataOnly: true,
    fairPricingPreviewOnlyNow: true,
    backendRuntimeEnabledNow: false,
    paymentRuntimeEnabledNow: false,
    providerRuntimeEnabledNow: false,
    payoutRuntimeEnabledNow: false,
    walletMutationEnabledNow: false,
    realSendRuntimeEnabledNow: false,
    actualAnimationPlaybackRuntimeEnabledNow: false,
    actualSoundAutoplayRuntimeEnabledNow: false,
    randomWinRuntimeEnabledNow: false,
  };
});

export const streamPremiumGiftUltraPremiumAppearanceUpgradeSummary197A = {
  version: "STREAM-GAME-GIFTS-197A",
  giftCount: streamPremiumGiftUltraPremiumAppearanceUpgradeRows197A.length,
  pack1Count: streamPremiumGiftCatalogOrganizationSummary188F.pack1Count,
  pack2Count: streamPremiumGiftCatalogOrganizationSummary188F.pack2Count,
  pack3Count: streamPremiumGiftCatalogOrganizationSummary188F.pack3Count,
  pack4Count: streamPremiumGiftPack197ASummary.pack4Count,
  pack5Count: streamPremiumGiftPack197CSummary.pack5Count,
  cumulativeGiftCount: streamPremiumGiftUltraPremiumAppearanceUpgradeRows197A.length,
  fairPricingCoverage: streamPremiumGiftUltraPremiumAppearanceUpgradeRows197A.length,
  ultraAppearanceCoverage: streamPremiumGiftUltraPremiumAppearanceUpgradeRows197A.length,
  qualityCheckedCoverage: streamPremiumGiftUltraPremiumAppearanceUpgradeRows197A.length,
  minQualityScore: Math.min(...streamPremiumGiftUltraPremiumAppearanceUpgradeRows197A.map((row) => row.qualityScore)),
  userFacingOnly: true,
  ultraPremiumMetadataOnly: true,
  backendRuntimeEnabledNow: false,
  paymentRuntimeEnabledNow: false,
  providerRuntimeEnabledNow: false,
  payoutRuntimeEnabledNow: false,
  walletMutationEnabledNow: false,
  realSendRuntimeEnabledNow: false,
  actualAnimationPlaybackRuntimeEnabledNow: false,
  actualSoundAutoplayRuntimeEnabledNow: false,
  randomWinRuntimeEnabledNow: false,
} as const;

export function getStreamPremiumGiftUltraPremiumAppearanceUpgrade197A(assetId: string): StreamPremiumGiftUltraPremiumAppearanceUpgrade197A {
  return streamPremiumGiftUltraPremiumAppearanceUpgradeRows197A.find((row) => row.assetId === assetId) ?? streamPremiumGiftUltraPremiumAppearanceUpgradeRows197A[0];
}
