import { streamPremiumGiftPack187A, streamPremiumGiftPack187AAssetBasePath } from "./streamPremiumGiftPack187A";
import { getStreamPremiumGiftEffectProfile187B } from "./streamPremiumGiftEffects187B";
import { getStreamPremiumGiftAppearanceProfile188G } from "./streamPremiumGiftAppearanceEngine188G";
import { getStreamPremiumGiftVisualFxProfile188H } from "./streamPremiumGiftVisualFxPack188H";
import { getStreamPremiumGiftFinalScreenPolish188I } from "./streamPremiumGiftFinalScreenPolish188I";
import {
  getStreamPremiumGiftEffectProfile188A,
  getStreamPremiumGiftFinalPolish188A,
  getStreamPremiumGiftPreviewExperience188A,
  streamPremiumGiftPack188A,
  streamPremiumGiftPack188ABasePath,
} from "./streamPremiumGiftPack188A";
import {
  getStreamPremiumGiftAppearanceProfile190A,
  getStreamPremiumGiftEffectProfile190A,
  getStreamPremiumGiftFinalPolish190A,
  getStreamPremiumGiftFinalScreenPolish190A,
  getStreamPremiumGiftPreviewExperience190A,
  getStreamPremiumGiftVisualFxProfile190A,
  streamPremiumGiftPack190A,
  streamPremiumGiftPack190ABasePath,
  streamPremiumGiftPack190AIds,
} from "./streamPremiumGiftPack190A";
import {
  getStreamPremiumGiftAppearanceProfile197A,
  getStreamPremiumGiftEffectProfile197A,
  getStreamPremiumGiftFinalPolish197A,
  getStreamPremiumGiftFinalScreenPolish197A,
  getStreamPremiumGiftPreviewExperience197A,
  getStreamPremiumGiftVisualFxProfile197A,
  streamPremiumGiftPack197A,
  streamPremiumGiftPack197ABasePath,
  streamPremiumGiftPack197AIds,
  streamPremiumGiftPack197ASummary,
} from "./streamPremiumGiftPack197A";
import {
  getStreamPremiumGiftAppearanceProfile197C,
  getStreamPremiumGiftEffectProfile197C,
  getStreamPremiumGiftFinalPolish197C,
  getStreamPremiumGiftFinalScreenPolish197C,
  getStreamPremiumGiftPreviewExperience197C,
  getStreamPremiumGiftVisualFxProfile197C,
  streamPremiumGiftPack197C,
  streamPremiumGiftPack197CBasePath,
  streamPremiumGiftPack197CIds,
} from "./streamPremiumGiftPack197C";
import { getStreamPremiumGiftUltraPremiumAppearanceUpgrade197A } from "./streamPremiumGiftUltraPremiumAppearanceUpgrade197A";

export type StreamPremiumGiftUltraPremiumFxPriceTier197B = "micro" | "value" | "premium" | "legendary" | "mythic" | "ultra_mythic";

export type StreamPremiumGiftUltraPremiumFxPolish197B = {
  assetId: string;
  displayNameRu: string;
  displayName: string;
  packLabelRu: string;
  fairPriceTier: StreamPremiumGiftUltraPremiumFxPriceTier197B;
  fairPriceRu: string;
  fairPriceReasonRu: string;
  qualityScore: number;
  fxScore: number;
  premiumAppearanceRu: string;
  premiumEntranceRu: string;
  cinematicLayerRu: string;
  particleDisciplineRu: string;
  finalePolishRu: string;
  assetPosterPath: string;
  soundCuePath: string;
  livePreviewRowsRu: readonly string[];
  premiumChecklistRu: readonly string[];
  chipsRu: readonly string[];
  safetyCopyRu: string;
  userFacingOnly: true;
  sourceOnlyPolish: true;
  realAssetPathMapped: true;
  posterFirstFallbackReady: true;
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

type GiftMeta197B = (typeof streamPremiumGiftPack187A)[number];

const streamPremiumGiftPack188AIds197B = new Set(streamPremiumGiftPack188A.map((gift) => gift.id));
const streamPremiumGiftPack187AIds197B = new Set(streamPremiumGiftPack187A.map((gift) => gift.id));
const allGiftAssets197B: GiftMeta197B[] = [
  ...streamPremiumGiftPack187A,
  ...streamPremiumGiftPack188A,
  ...streamPremiumGiftPack190A,
  ...streamPremiumGiftPack197A,
  ...streamPremiumGiftPack197C,
];

function getPosterPath197B(gift: GiftMeta197B): string {
  if (streamPremiumGiftPack197CIds.has(gift.id)) {
    return `${streamPremiumGiftPack197CBasePath}/posters/${gift.posterFile}`;
  }
  if (streamPremiumGiftPack197AIds.has(gift.id)) {
    return `${streamPremiumGiftPack197ABasePath}/posters/${gift.posterFile}`;
  }
  if (streamPremiumGiftPack190AIds.has(gift.id)) {
    return `${streamPremiumGiftPack190ABasePath}/posters/${gift.posterFile}`;
  }
  if (streamPremiumGiftPack188AIds197B.has(gift.id)) {
    return `${streamPremiumGiftPack188ABasePath}/${gift.posterFile}`;
  }
  return `${streamPremiumGiftPack187AAssetBasePath}/${gift.posterFile}`;
}

function getEffectProfile197B(gift: GiftMeta197B) {
  if (streamPremiumGiftPack197CIds.has(gift.id)) return getStreamPremiumGiftEffectProfile197C(gift.id);
  if (streamPremiumGiftPack197AIds.has(gift.id)) return getStreamPremiumGiftEffectProfile197A(gift.id);
  if (streamPremiumGiftPack190AIds.has(gift.id)) return getStreamPremiumGiftEffectProfile190A(gift.id);
  if (streamPremiumGiftPack188AIds197B.has(gift.id)) return getStreamPremiumGiftEffectProfile188A(gift.id);
  return getStreamPremiumGiftEffectProfile187B(gift.id);
}

function getAppearanceProfile197B(gift: GiftMeta197B) {
  if (streamPremiumGiftPack197CIds.has(gift.id)) return getStreamPremiumGiftAppearanceProfile197C(gift.id);
  if (streamPremiumGiftPack197AIds.has(gift.id)) return getStreamPremiumGiftAppearanceProfile197A(gift.id);
  if (streamPremiumGiftPack190AIds.has(gift.id)) return getStreamPremiumGiftAppearanceProfile190A(gift.id);
  return getStreamPremiumGiftAppearanceProfile188G(gift.id);
}

function getVisualFxProfile197B(gift: GiftMeta197B) {
  if (streamPremiumGiftPack197CIds.has(gift.id)) return getStreamPremiumGiftVisualFxProfile197C(gift.id);
  if (streamPremiumGiftPack197AIds.has(gift.id)) return getStreamPremiumGiftVisualFxProfile197A(gift.id);
  if (streamPremiumGiftPack190AIds.has(gift.id)) return getStreamPremiumGiftVisualFxProfile190A(gift.id);
  return getStreamPremiumGiftVisualFxProfile188H(gift.id);
}

function getFinalScreenProfile197B(gift: GiftMeta197B) {
  if (streamPremiumGiftPack197CIds.has(gift.id)) return getStreamPremiumGiftFinalScreenPolish197C(gift.id);
  if (streamPremiumGiftPack197AIds.has(gift.id)) return getStreamPremiumGiftFinalScreenPolish197A(gift.id);
  if (streamPremiumGiftPack190AIds.has(gift.id)) return getStreamPremiumGiftFinalScreenPolish190A(gift.id);
  return getStreamPremiumGiftFinalScreenPolish188I(gift.id);
}

function getPreviewLabel197B(gift: GiftMeta197B): string {
  if (streamPremiumGiftPack197CIds.has(gift.id)) return getStreamPremiumGiftPreviewExperience197C(gift.id).motionQualityLabel;
  if (streamPremiumGiftPack197AIds.has(gift.id)) return getStreamPremiumGiftPreviewExperience197A(gift.id).motionQualityLabel;
  if (streamPremiumGiftPack190AIds.has(gift.id)) return getStreamPremiumGiftPreviewExperience190A(gift.id).motionQualityLabel;
  if (streamPremiumGiftPack188AIds197B.has(gift.id)) return getStreamPremiumGiftPreviewExperience188A(gift.id).motionQualityLabel;
  return gift.previewRu;
}

function getFinalQualityLabel197B(gift: GiftMeta197B): string {
  if (streamPremiumGiftPack197CIds.has(gift.id)) return getStreamPremiumGiftFinalPolish197C(gift.id).premiumBadge;
  if (streamPremiumGiftPack197AIds.has(gift.id)) return getStreamPremiumGiftFinalPolish197A(gift.id).premiumBadge;
  if (streamPremiumGiftPack190AIds.has(gift.id)) return getStreamPremiumGiftFinalPolish190A(gift.id).premiumBadge;
  if (streamPremiumGiftPack188AIds197B.has(gift.id)) return getStreamPremiumGiftFinalPolish188A(gift.id).premiumBadge;
  return gift.qualityLabel;
}

function getPackLabel197B(gift: GiftMeta197B): string {
  if (streamPremiumGiftPack197CIds.has(gift.id)) return "Pack 5 · Diamond Range";
  if (streamPremiumGiftPack197AIds.has(gift.id)) return "Pack 4 · Ultra Premium";
  if (streamPremiumGiftPack190AIds.has(gift.id)) return "Pack 3 · Premium expansion";
  if (streamPremiumGiftPack188AIds197B.has(gift.id)) return "Pack 2 · Premium polish";
  if (streamPremiumGiftPack187AIds197B.has(gift.id)) return "Pack 1 · Base premium";
  return "Gift pack";
}

function getFairPriceTier197B(gift: GiftMeta197B): StreamPremiumGiftUltraPremiumFxPriceTier197B {
  const rarity = gift.rarityLabel.toLowerCase();
  if (rarity.includes("ultra mythic")) return "ultra_mythic";
  if (rarity.includes("mythic")) return "mythic";
  if (rarity.includes("legendary")) return "legendary";
  if (rarity.includes("epic")) return "premium";
  if (rarity.includes("rare")) return "value";
  return "micro";
}

const fairPriceBands197B: Record<StreamPremiumGiftUltraPremiumFxPriceTier197B, string> = {
  micro: "18–35 preview units · small clean gift",
  value: "36–65 preview units · better motion/detail",
  premium: "66–95 preview units · premium entrance + aura",
  legendary: "96–180 preview units · full-screen premium moment",
  mythic: "181–260 preview units · cinematic mythic effect",
  ultra_mythic: "261–340 preview units · top ultra-premium finale",
};

function scoreForGift197B(gift: GiftMeta197B, index: number): number {
  const tier = getFairPriceTier197B(gift);
  const baseByTier: Record<StreamPremiumGiftUltraPremiumFxPriceTier197B, number> = {
    micro: 88,
    value: 90,
    premium: 92,
    legendary: 94,
    mythic: 96,
    ultra_mythic: 98,
  };
  return Math.min(100, baseByTier[tier] + (index % 3));
}

export const streamPremiumGiftUltraPremiumFxPolishRows197B: readonly StreamPremiumGiftUltraPremiumFxPolish197B[] = allGiftAssets197B.map((gift, index) => {
  const appearance = getAppearanceProfile197B(gift);
  const visualFx = getVisualFxProfile197B(gift);
  const finalScreen = getFinalScreenProfile197B(gift);
  const effect = getEffectProfile197B(gift);
  const appearanceUpgrade = getStreamPremiumGiftUltraPremiumAppearanceUpgrade197A(gift.id);
  const fairPriceTier = getFairPriceTier197B(gift);
  const qualityScore = Math.max(scoreForGift197B(gift, index), appearanceUpgrade.qualityScore);
  const fxScore = Math.max(qualityScore, visualFx.premiumFxScore);
  return {
    assetId: gift.id,
    displayNameRu: gift.displayNameRu,
    displayName: gift.displayName,
    packLabelRu: getPackLabel197B(gift),
    fairPriceTier,
    fairPriceRu: `${gift.localCostLabel} · ${fairPriceBands197B[fairPriceTier]}`,
    fairPriceReasonRu: `Цена привязана к rarity=${gift.rarityLabel}, FX score=${fxScore}, duration=${gift.loopLabel}; нельзя делать fake expensive без качества.`,
    qualityScore,
    fxScore,
    premiumAppearanceRu: `${appearance.appearanceTitleRu} · ${appearance.luxuryMoodRu}`,
    premiumEntranceRu: `${appearance.entranceRu} · ${getPreviewLabel197B(gift)}`,
    cinematicLayerRu: `${appearance.fullScreenLayerRu} · ${visualFx.screenImpactRu} · safe-area clean layer`,
    particleDisciplineRu: `${visualFx.particleBurstRu} · controlled density=${visualFx.particleDensityLabel}; no noisy spam`,
    finalePolishRu: `${finalScreen.finaleCloseRu} · ${finalScreen.reduceMotionFallbackRu}`,
    assetPosterPath: getPosterPath197B(gift),
    soundCuePath: effect.soundCueFile,
    livePreviewRowsRu: [
      `Poster: ${getPosterPath197B(gift)}`,
      `Sound cue: ${effect.soundCueLabelRu} · ${effect.soundCueDurationMs}ms · autoplay disabled`,
      `Entrance: ${appearance.entranceRu}`,
      `Loop/finale: ${appearance.loopRu} → ${finalScreen.finaleCloseRu}`,
      `Quality gate: ${getFinalQualityLabel197B(gift)}`,
    ],
    premiumChecklistRu: [
      "clean premium entrance, no cheap jump-cut",
      "safe-area recipient focus, no chat-covering spam",
      "poster-first fallback before any future MP4/WebP playback",
      "fair price band matches rarity and visible quality",
      "reduce-motion and lite-device copy stays readable",
      "no fake win, no cash-out wording, no money movement",
    ],
    chipsRu: ["197B", "real asset path", "fair price", "ultra FX", "poster-first", "no autoplay", "40 gifts"],
    safetyCopyRu: "197B is mobile user-facing metadata/polish only. It maps real poster/sound paths and improves FX copy, but keeps backend, provider, Wallet, payment, payout, real send, autoplay, actual animation playback and random-win runtime disabled.",
    userFacingOnly: true,
    sourceOnlyPolish: true,
    realAssetPathMapped: true,
    posterFirstFallbackReady: true,
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

export const streamPremiumGiftUltraPremiumFxPolishSummary197B = {
  version: "STREAM-GAME-GIFTS-197B",
  giftCount: streamPremiumGiftUltraPremiumFxPolishRows197B.length,
  cumulativeGiftCount: streamPremiumGiftUltraPremiumFxPolishRows197B.length,
  pack4GiftCount: streamPremiumGiftPack197ASummary.pack4Count,
  fairPricingCoverage: streamPremiumGiftUltraPremiumFxPolishRows197B.length,
  realAssetPathMappedCoverage: streamPremiumGiftUltraPremiumFxPolishRows197B.length,
  posterFirstFallbackCoverage: streamPremiumGiftUltraPremiumFxPolishRows197B.length,
  ultraPremiumFxCoverage: streamPremiumGiftUltraPremiumFxPolishRows197B.length,
  minQualityScore: Math.min(...streamPremiumGiftUltraPremiumFxPolishRows197B.map((row) => row.qualityScore)),
  minFxScore: Math.min(...streamPremiumGiftUltraPremiumFxPolishRows197B.map((row) => row.fxScore)),
  userFacingOnly: true,
  sourceOnlyPolish: true,
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

export function getStreamPremiumGiftUltraPremiumFxPolish197B(assetId: string): StreamPremiumGiftUltraPremiumFxPolish197B {
  return streamPremiumGiftUltraPremiumFxPolishRows197B.find((row) => row.assetId === assetId) ?? streamPremiumGiftUltraPremiumFxPolishRows197B[0];
}
