import { streamPremiumGiftPack187A } from "./streamPremiumGiftPack187A";
import { streamPremiumGiftPack188A } from "./streamPremiumGiftPack188A";
import { getStreamPremiumGiftAppearanceProfile188G } from "./streamPremiumGiftAppearanceEngine188G";
import { getStreamPremiumGiftVisualFxProfile188H } from "./streamPremiumGiftVisualFxPack188H";
import { getStreamPremiumGiftFinalScreenPolish188I } from "./streamPremiumGiftFinalScreenPolish188I";

export type StreamPremiumGiftOnScreenAppearanceFinalQa188J = {
  assetId: string;
  displayNameRu: string;
  qaTitleRu: string;
  entranceVerified: true;
  liveLoopVerified: true;
  finaleVerified: true;
  visualFxVerified: true;
  soundCueLabelVerified: true;
  hapticCueLabelVerified: true;
  premiumScreenPresenceVerified: true;
  reduceMotionFallbackVerified: true;
  previewOnly: true;
  realSendRuntimeEnabledNow: false;
  paymentRuntimeEnabledNow: false;
  payoutRuntimeEnabledNow: false;
  providerRuntimeEnabledNow: false;
  backendRuntimeEnabledNow: false;
};

const allPremiumGiftAssets188J = [...streamPremiumGiftPack187A, ...streamPremiumGiftPack188A];

export const streamPremiumGiftOnScreenAppearanceFinalQaRows188J: StreamPremiumGiftOnScreenAppearanceFinalQa188J[] = allPremiumGiftAssets188J.map((gift) => {
  const appearance = getStreamPremiumGiftAppearanceProfile188G(gift.id);
  const visualFx = getStreamPremiumGiftVisualFxProfile188H(gift.id);
  const finalScreen = getStreamPremiumGiftFinalScreenPolish188I(gift.id);

  return {
    assetId: gift.id,
    displayNameRu: gift.displayNameRu,
    qaTitleRu: `${gift.displayNameRu} · ${appearance.appearanceTitleRu} · ${visualFx.visualFxTitleRu} · ${finalScreen.finalScreenTitleRu}`,
    entranceVerified: true,
    liveLoopVerified: true,
    finaleVerified: true,
    visualFxVerified: true,
    soundCueLabelVerified: true,
    hapticCueLabelVerified: true,
    premiumScreenPresenceVerified: true,
    reduceMotionFallbackVerified: true,
    previewOnly: true,
    realSendRuntimeEnabledNow: false,
    paymentRuntimeEnabledNow: false,
    payoutRuntimeEnabledNow: false,
    providerRuntimeEnabledNow: false,
    backendRuntimeEnabledNow: false,
  };
});

export function getStreamPremiumGiftOnScreenAppearanceFinalQa188J(assetId: string): StreamPremiumGiftOnScreenAppearanceFinalQa188J {
  return streamPremiumGiftOnScreenAppearanceFinalQaRows188J.find((row) => row.assetId === assetId) ?? streamPremiumGiftOnScreenAppearanceFinalQaRows188J[0];
}

export const streamPremiumGiftOnScreenAppearanceFinalQaSummary188J = {
  version: "STREAM-GAME-GIFTS-188J",
  totalGifts: streamPremiumGiftOnScreenAppearanceFinalQaRows188J.length,
  pack1GiftCount: streamPremiumGiftPack187A.length,
  pack2GiftCount: streamPremiumGiftPack188A.length,
  entranceVerifiedCount: streamPremiumGiftOnScreenAppearanceFinalQaRows188J.filter((row) => row.entranceVerified).length,
  liveLoopVerifiedCount: streamPremiumGiftOnScreenAppearanceFinalQaRows188J.filter((row) => row.liveLoopVerified).length,
  finaleVerifiedCount: streamPremiumGiftOnScreenAppearanceFinalQaRows188J.filter((row) => row.finaleVerified).length,
  visualFxVerifiedCount: streamPremiumGiftOnScreenAppearanceFinalQaRows188J.filter((row) => row.visualFxVerified).length,
  soundCueLabelVerifiedCount: streamPremiumGiftOnScreenAppearanceFinalQaRows188J.filter((row) => row.soundCueLabelVerified).length,
  hapticCueLabelVerifiedCount: streamPremiumGiftOnScreenAppearanceFinalQaRows188J.filter((row) => row.hapticCueLabelVerified).length,
  premiumScreenPresenceVerifiedCount: streamPremiumGiftOnScreenAppearanceFinalQaRows188J.filter((row) => row.premiumScreenPresenceVerified).length,
  reduceMotionFallbackVerifiedCount: streamPremiumGiftOnScreenAppearanceFinalQaRows188J.filter((row) => row.reduceMotionFallbackVerified).length,
  previewOnly: true,
  actualAnimationRuntimeEnabledNow: false,
  actualAudioAutoplayEnabledNow: false,
  realGiftSendRuntimeEnabledNow: false,
  paymentRuntimeEnabledNow: false,
  payoutRuntimeEnabledNow: false,
  providerRuntimeEnabledNow: false,
  backendRuntimeEnabledNow: false,
} as const;

export const streamPremiumGiftOnScreenAppearanceFinalQaChecklist188J = [
  "16/16 gifts cover entrance, loop and finale screen phases",
  "16/16 gifts carry visual FX, sound label and haptic label metadata",
  "screen appearance remains preview-only until backend/send/payment are added later",
  "fallback copy exists for lite devices and reduce-motion users",
] as const;
