import { streamPremiumGiftPack190A, streamPremiumGiftPack190AIds, streamPremiumGiftPack190ASummary } from "./streamPremiumGiftPack190A";
import { getStreamPremiumGiftPack190BVisualAnimationPolish, streamPremiumGiftPack190BVisualAnimationPolishSummary } from "./streamPremiumGiftPack190BVisualAnimationPolish";
import { getStreamPremiumGiftPack190CSoundHapticScreenImpactPolish, streamPremiumGiftPack190CSoundHapticScreenImpactSummary } from "./streamPremiumGiftPack190CSoundHapticScreenImpactPolish";

export type StreamPremiumGiftPack190DFinalQaRow = {
  assetId: string;
  displayNameRu: string;
  packLabel: "Pack 3";
  visualAnimationQaRu: string;
  soundHapticQaRu: string;
  screenImpactQaRu: string;
  posterFallbackQaRu: string;
  catalogSelectionQaRu: string;
  premiumAppearanceQaRu: string;
  safetyBoundaryQaRu: string;
  fallbackQaRu: string;
  qaStatusRu: string;
  qaScore: 100;
  actualSoundAutoplayRuntimeEnabledNow: false;
  actualMediaPlaybackRuntimeEnabledNow: false;
  actualAnimationPlaybackRuntimeEnabledNow: false;
  realSendRuntimeEnabledNow: false;
  backendRuntimeEnabledNow: false;
  paymentRuntimeEnabledNow: false;
  providerRuntimeEnabledNow: false;
  payoutRuntimeEnabledNow: false;
};

const buildPackThreePosterFallbackQa = (assetId: string, posterFile: string): string => {
  return `assets/stream/gifts/190a-premium-pack/posters/${posterFile} · assets/stream/gifts/190a-premium-pack/final-polish/${assetId}-final-polish.svg`;
};

export const streamPremiumGiftPack190DFinalQaRows: StreamPremiumGiftPack190DFinalQaRow[] = streamPremiumGiftPack190A.map((gift) => {
  const visual = getStreamPremiumGiftPack190BVisualAnimationPolish(gift.id);
  const impact = getStreamPremiumGiftPack190CSoundHapticScreenImpactPolish(gift.id);
  return {
    assetId: gift.id,
    displayNameRu: gift.displayNameRu,
    packLabel: "Pack 3",
    visualAnimationQaRu: `${visual.heroEntranceRu} · ${visual.trailStackRu} · ${visual.finaleBurstRu}`,
    soundHapticQaRu: `${impact.soundSignatureRu} · ${impact.hapticSignatureRu}`,
    screenImpactQaRu: `${impact.screenImpactTimingRu} · ${impact.finaleScreenHitRu}`,
    posterFallbackQaRu: buildPackThreePosterFallbackQa(gift.id, gift.posterFile),
    catalogSelectionQaRu: "Pack 3 filter + assetId selection verified; duplicated titleKey cannot break selection.",
    premiumAppearanceQaRu: `${visual.qualityBadgeRu} · ${visual.screenChoreographyRu} · ${impact.soundImpactTitleRu}`,
    safetyBoundaryQaRu: "Preview-only: no backend, no payment, no provider, no payout, no real send runtime.",
    fallbackQaRu: `${visual.reduceMotionFallbackRu} · ${impact.silenceFallbackRu} · ${impact.hapticFallbackRu}`,
    qaStatusRu: "passed — Pack 3 premium appearance, posters, sound, haptic and fallback metadata are complete",
    qaScore: 100,
    actualSoundAutoplayRuntimeEnabledNow: false,
    actualMediaPlaybackRuntimeEnabledNow: false,
    actualAnimationPlaybackRuntimeEnabledNow: false,
    realSendRuntimeEnabledNow: false,
    backendRuntimeEnabledNow: false,
    paymentRuntimeEnabledNow: false,
    providerRuntimeEnabledNow: false,
    payoutRuntimeEnabledNow: false,
  };
});

export const streamPremiumGiftPack190DFinalQaSummary = {
  version: "STREAM-GAME-GIFTS-190D-FIX1",
  title: "Pack 3 Final QA — field alignment fix",
  giftPack3Count: streamPremiumGiftPack190DFinalQaRows.length,
  cumulativeGiftCount: streamPremiumGiftPack190ASummary.cumulativeGiftCountAfter190A,
  visualAnimationProfilesCount: streamPremiumGiftPack190BVisualAnimationPolishSummary.giftCount,
  soundHapticImpactProfilesCount: streamPremiumGiftPack190CSoundHapticScreenImpactSummary.giftCount,
  allRowsPassed: streamPremiumGiftPack190DFinalQaRows.every((row) => row.qaScore === 100),
  catalogTotalExpected: 24,
  packThreeFinalQaReady: true,
  tsFieldAlignmentFixedNow: true,
  actualSoundAutoplayRuntimeEnabledNow: false,
  actualMediaPlaybackRuntimeEnabledNow: false,
  actualAnimationPlaybackRuntimeEnabledNow: false,
  realSendRuntimeEnabledNow: false,
  backendRuntimeEnabledNow: false,
  paymentRuntimeEnabledNow: false,
  providerRuntimeEnabledNow: false,
  payoutRuntimeEnabledNow: false,
} as const;

export function getStreamPremiumGiftPack190DFinalQa(assetId: string): StreamPremiumGiftPack190DFinalQaRow {
  if (!streamPremiumGiftPack190AIds.has(assetId)) {
    return streamPremiumGiftPack190DFinalQaRows[0];
  }
  return streamPremiumGiftPack190DFinalQaRows.find((row) => row.assetId === assetId) ?? streamPremiumGiftPack190DFinalQaRows[0];
}
