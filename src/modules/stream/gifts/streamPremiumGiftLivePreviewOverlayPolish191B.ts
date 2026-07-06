import {
  streamPremiumGiftLivePreviewRuntimeShellProfiles191A,
  type StreamPremiumGiftLivePreviewPhaseKey191A,
} from "./streamPremiumGiftLivePreviewRuntimeShell191A";

export type StreamPremiumGiftLivePreviewOverlayPolish191B = {
  assetId: string;
  displayNameRu: string;
  overlayTitleRu: string;
  stageFrameRu: string;
  phaseMeterRu: string;
  luxuryLayerRu: string;
  soundBadgeRu: string;
  hapticBadgeRu: string;
  cameraCopyRu: string;
  reduceMotionFallbackRu: string;
  selectedPhaseDefault: StreamPremiumGiftLivePreviewPhaseKey191A;
  polishChipsRu: readonly string[];
  safetyCopyRu: string;
  userFacingOnly: true;
  localPhasePlaybackOnly: true;
  actualAnimationPlaybackRuntimeEnabledNow: false;
  actualMediaPlaybackRuntimeEnabledNow: false;
  actualSoundAutoplayRuntimeEnabledNow: false;
  realSendRuntimeEnabledNow: false;
  backendRuntimeEnabledNow: false;
  paymentRuntimeEnabledNow: false;
  providerRuntimeEnabledNow: false;
  payoutRuntimeEnabledNow: false;
  randomWinRuntimeEnabledNow: false;
};

const overlayThemes191B = [
  { frame: "crystal stage frame", meter: "thin luxury phase meter", layer: "aura glass + soft spotlight", camera: "slow push-in, safe-area crop" },
  { frame: "anime cinema frame", meter: "three-step phase meter", layer: "particle halo + glow rim", camera: "center lock, no shake" },
  { frame: "stream spotlight frame", meter: "premium timing ribbon", layer: "poster-first sparkle shell", camera: "gentle tilt, reduce-motion ready" },
] as const;

export const streamPremiumGiftLivePreviewOverlayPolishProfiles191B: StreamPremiumGiftLivePreviewOverlayPolish191B[] = streamPremiumGiftLivePreviewRuntimeShellProfiles191A.map((profile, index) => {
  const theme = overlayThemes191B[index % overlayThemes191B.length];
  const phaseLabels = profile.phases.map((phase) => phase.labelRu).join(" → ");
  return {
    assetId: profile.assetId,
    displayNameRu: profile.displayNameRu,
    overlayTitleRu: `${profile.displayNameRu} · polished live overlay`,
    stageFrameRu: `${theme.frame} · ${profile.stageLayerCount} layers · poster-first`,
    phaseMeterRu: `${theme.meter} · ${phaseLabels}`,
    luxuryLayerRu: `${theme.layer} · readable on dark stream video`,
    soundBadgeRu: "Sound badge: visible cue only, no autoplay",
    hapticBadgeRu: "Haptic badge: local tap hint only, no required vibration",
    cameraCopyRu: `${theme.camera} · live-safe overlay copy`,
    reduceMotionFallbackRu: "Reduce motion: static poster glow + phase labels + progress meter only.",
    selectedPhaseDefault: profile.selectedPhaseDefault,
    polishChipsRu: ["polished frame", "phase meter", "sound badge", "haptic badge", "safe overlay", "no real send"],
    safetyCopyRu: "191B improves only the local live preview overlay UI. It does not enable backend, payment, provider, payout, real send, audio autoplay, media playback or random win runtime.",
    userFacingOnly: true,
    localPhasePlaybackOnly: true,
    actualAnimationPlaybackRuntimeEnabledNow: false,
    actualMediaPlaybackRuntimeEnabledNow: false,
    actualSoundAutoplayRuntimeEnabledNow: false,
    realSendRuntimeEnabledNow: false,
    backendRuntimeEnabledNow: false,
    paymentRuntimeEnabledNow: false,
    providerRuntimeEnabledNow: false,
    payoutRuntimeEnabledNow: false,
    randomWinRuntimeEnabledNow: false,
  };
});

export const streamPremiumGiftLivePreviewOverlayPolishSummary191B = {
  version: "STREAM-GAME-GIFTS-191B",
  giftCount: streamPremiumGiftLivePreviewOverlayPolishProfiles191B.length,
  overlayFrameCoverage: streamPremiumGiftLivePreviewOverlayPolishProfiles191B.length,
  phaseMeterCoverage: streamPremiumGiftLivePreviewOverlayPolishProfiles191B.length,
  soundBadgeCoverage: streamPremiumGiftLivePreviewOverlayPolishProfiles191B.length,
  hapticBadgeCoverage: streamPremiumGiftLivePreviewOverlayPolishProfiles191B.length,
  localPhasePlaybackOnly: true,
  userFacingOnly: true,
  actualAnimationPlaybackRuntimeEnabledNow: false,
  actualMediaPlaybackRuntimeEnabledNow: false,
  actualSoundAutoplayRuntimeEnabledNow: false,
  realSendRuntimeEnabledNow: false,
  backendRuntimeEnabledNow: false,
  paymentRuntimeEnabledNow: false,
  providerRuntimeEnabledNow: false,
  payoutRuntimeEnabledNow: false,
  randomWinRuntimeEnabledNow: false,
} as const;

export function getStreamPremiumGiftLivePreviewOverlayPolish191B(assetId: string): StreamPremiumGiftLivePreviewOverlayPolish191B {
  return streamPremiumGiftLivePreviewOverlayPolishProfiles191B.find((profile) => profile.assetId === assetId) ?? streamPremiumGiftLivePreviewOverlayPolishProfiles191B[0];
}
