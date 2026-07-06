import {
  streamPremiumGiftLivePreviewOverlayPolishProfiles191B,
} from "./streamPremiumGiftLivePreviewOverlayPolish191B";
import {
  streamPremiumGiftLivePreviewPhaseOptions191A,
  type StreamPremiumGiftLivePreviewPhaseKey191A,
} from "./streamPremiumGiftLivePreviewRuntimeShell191A";

export type StreamPremiumGiftLivePreviewInteractionModeKey191C = "replay" | "focus" | "reduceMotion";

export type StreamPremiumGiftLivePreviewInteractionMode191C = {
  key: StreamPremiumGiftLivePreviewInteractionModeKey191C;
  labelRu: string;
  metaRu: string;
  icon: string;
};

export type StreamPremiumGiftLivePreviewInteractionPolish191C = {
  assetId: string;
  displayNameRu: string;
  interactionTitleRu: string;
  controlDeckRu: string;
  selectedPhaseDefault: StreamPremiumGiftLivePreviewPhaseKey191A;
  phaseControlLabelsRu: readonly string[];
  replayCopyRu: string;
  focusCopyRu: string;
  reduceMotionCopyRu: string;
  touchTargetCopyRu: string;
  localStateCopyRu: string;
  interactionChipsRu: readonly string[];
  safetyCopyRu: string;
  userFacingOnly: true;
  localPreviewControlsOnly: true;
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

export const streamPremiumGiftLivePreviewInteractionModes191C: readonly StreamPremiumGiftLivePreviewInteractionMode191C[] = [
  { key: "replay", labelRu: "Replay", metaRu: "restart local preview phase copy", icon: "refresh-outline" },
  { key: "focus", labelRu: "Focus", metaRu: "pin selected phase as hero control", icon: "scan-outline" },
  { key: "reduceMotion", labelRu: "Lite", metaRu: "show reduce-motion preview labels", icon: "leaf-outline" },
] as const;

export const streamPremiumGiftLivePreviewInteractionPolishProfiles191C: StreamPremiumGiftLivePreviewInteractionPolish191C[] = streamPremiumGiftLivePreviewOverlayPolishProfiles191B.map((profile) => ({
  assetId: profile.assetId,
  displayNameRu: profile.displayNameRu,
  interactionTitleRu: `${profile.displayNameRu} · premium local preview controls`,
  controlDeckRu: "Replay / Focus / Lite controls are local UI state only.",
  selectedPhaseDefault: profile.selectedPhaseDefault,
  phaseControlLabelsRu: streamPremiumGiftLivePreviewPhaseOptions191A.map((phase) => phase.labelRu),
  replayCopyRu: "Replay refreshes only the visible preview labels and phase meter state. No media restarts, no autoplay.",
  focusCopyRu: "Focus pins the selected phase as the hero card for design review. No room event is sent.",
  reduceMotionCopyRu: "Lite mode presents static poster-first copy, progress labels and safe badges for reduced motion.",
  touchTargetCopyRu: "Large rounded controls for thumb reach, readable on compact phones and safe-area friendly.",
  localStateCopyRu: "Local state lives only inside StreamGiftPanel preview controls and is not persisted to backend.",
  interactionChipsRu: ["replay control", "phase focus", "lite preview", "local state", "no autoplay", "no real send"],
  safetyCopyRu: "191C adds only local preview interaction polish. It does not enable backend, payment, provider, payout, real send, audio autoplay, media playback or random win runtime.",
  userFacingOnly: true,
  localPreviewControlsOnly: true,
  actualAnimationPlaybackRuntimeEnabledNow: false,
  actualMediaPlaybackRuntimeEnabledNow: false,
  actualSoundAutoplayRuntimeEnabledNow: false,
  realSendRuntimeEnabledNow: false,
  backendRuntimeEnabledNow: false,
  paymentRuntimeEnabledNow: false,
  providerRuntimeEnabledNow: false,
  payoutRuntimeEnabledNow: false,
  randomWinRuntimeEnabledNow: false,
}));

export const streamPremiumGiftLivePreviewInteractionPolishSummary191C = {
  version: "STREAM-GAME-GIFTS-191C",
  giftCount: streamPremiumGiftLivePreviewInteractionPolishProfiles191C.length,
  interactionModeCount: streamPremiumGiftLivePreviewInteractionModes191C.length,
  phaseControlCount: streamPremiumGiftLivePreviewPhaseOptions191A.length,
  userFacingOnly: true,
  localPreviewControlsOnly: true,
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

export function getStreamPremiumGiftLivePreviewInteractionPolish191C(assetId: string): StreamPremiumGiftLivePreviewInteractionPolish191C {
  return streamPremiumGiftLivePreviewInteractionPolishProfiles191C.find((profile) => profile.assetId === assetId) ?? streamPremiumGiftLivePreviewInteractionPolishProfiles191C[0];
}
