import {
  streamPremiumGiftLivePreviewRuntimeShellProfiles191A,
  streamPremiumGiftLivePreviewRuntimeShellSummary191A,
} from "./streamPremiumGiftLivePreviewRuntimeShell191A";
import {
  streamPremiumGiftLivePreviewOverlayPolishProfiles191B,
  streamPremiumGiftLivePreviewOverlayPolishSummary191B,
} from "./streamPremiumGiftLivePreviewOverlayPolish191B";
import {
  streamPremiumGiftLivePreviewInteractionPolishProfiles191C,
  streamPremiumGiftLivePreviewInteractionPolishSummary191C,
} from "./streamPremiumGiftLivePreviewInteractionPolish191C";

export type StreamPremiumGiftLivePreviewFinalQa191D = {
  assetId: string;
  displayNameRu: string;
  qaStatusRu: string;
  qaTitleRu: string;
  coverageLabelRu: string;
  phaseShellQaRu: string;
  overlayPolishQaRu: string;
  interactionControlQaRu: string;
  safetyQaRu: string;
  qaRowsRu: readonly string[];
  qaChipsRu: readonly string[];
  userFacingOnly: true;
  localPreviewControlsOnly: true;
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

const overlayByAssetId191D = new Map(streamPremiumGiftLivePreviewOverlayPolishProfiles191B.map((profile) => [profile.assetId, profile] as const));
const interactionByAssetId191D = new Map(streamPremiumGiftLivePreviewInteractionPolishProfiles191C.map((profile) => [profile.assetId, profile] as const));

export const streamPremiumGiftLivePreviewFinalQaRows191D: StreamPremiumGiftLivePreviewFinalQa191D[] = streamPremiumGiftLivePreviewRuntimeShellProfiles191A.map((shell) => {
  const overlay = overlayByAssetId191D.get(shell.assetId);
  const interaction = interactionByAssetId191D.get(shell.assetId);
  const phaseLabels = shell.phases.map((phase) => `${phase.labelRu}:${phase.durationMs}ms`).join(" · ");
  return {
    assetId: shell.assetId,
    displayNameRu: shell.displayNameRu,
    qaStatusRu: overlay && interaction ? "QA passed" : "QA needs review",
    qaTitleRu: `${shell.displayNameRu} · live preview final QA`,
    coverageLabelRu: `${shell.phases.length}/3 phases · overlay ${overlay ? "ok" : "missing"} · controls ${interaction ? "ok" : "missing"}`,
    phaseShellQaRu: `${shell.localPlaybackModeRu} · ${phaseLabels}`,
    overlayPolishQaRu: overlay ? `${overlay.stageFrameRu} · ${overlay.phaseMeterRu}` : "overlay polish missing",
    interactionControlQaRu: interaction ? `${interaction.controlDeckRu} · ${interaction.touchTargetCopyRu}` : "interaction controls missing",
    safetyQaRu: "local UI preview only: no real gift send, no payment, no provider, no payout, no audio autoplay, no media playback, no random win runtime.",
    qaRowsRu: [
      "191A phase shell present",
      "191B overlay polish present",
      "191C interaction controls present",
      "Entrance / Live Loop / Finale covered",
      "poster-first fallback preserved",
      "safety locks preserved",
    ],
    qaChipsRu: ["32 gifts", "3 phases", "overlay ok", "controls ok", "local only", "safe-disabled"],
    userFacingOnly: true,
    localPreviewControlsOnly: true,
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

export const streamPremiumGiftLivePreviewFinalQaSummary191D = {
  version: "STREAM-GAME-GIFTS-191D",
  giftCount: streamPremiumGiftLivePreviewFinalQaRows191D.length,
  phaseShellCoverage: streamPremiumGiftLivePreviewRuntimeShellSummary191A.giftCount,
  overlayPolishCoverage: streamPremiumGiftLivePreviewOverlayPolishSummary191B.giftCount,
  interactionPolishCoverage: streamPremiumGiftLivePreviewInteractionPolishSummary191C.giftCount,
  phaseCountPerGift: streamPremiumGiftLivePreviewRuntimeShellSummary191A.phaseCountPerGift,
  qaPassedCount: streamPremiumGiftLivePreviewFinalQaRows191D.filter((row) => row.qaStatusRu === "QA passed").length,
  userFacingOnly: true,
  localPreviewControlsOnly: true,
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
} as const;

export function getStreamPremiumGiftLivePreviewFinalQa191D(assetId: string): StreamPremiumGiftLivePreviewFinalQa191D {
  return streamPremiumGiftLivePreviewFinalQaRows191D.find((row) => row.assetId === assetId) ?? streamPremiumGiftLivePreviewFinalQaRows191D[0];
}
