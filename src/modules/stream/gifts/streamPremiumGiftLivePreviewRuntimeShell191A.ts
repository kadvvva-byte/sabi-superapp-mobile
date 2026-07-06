import { streamPremiumGiftPack187A, type StreamPremiumGiftAsset187A } from "./streamPremiumGiftPack187A";
import { streamPremiumGiftPack188A } from "./streamPremiumGiftPack188A";
import { streamPremiumGiftPack190A } from "./streamPremiumGiftPack190A";
import { streamPremiumGiftPack197A } from "./streamPremiumGiftPack197A";

export type StreamPremiumGiftLivePreviewPhaseKey191A = "entrance" | "loop" | "finale";

export type StreamPremiumGiftLivePreviewPhase191A = {
  key: StreamPremiumGiftLivePreviewPhaseKey191A;
  labelRu: string;
  durationMs: number;
  progressPercent: number;
  phaseCopyRu: string;
  screenLayerRu: string;
  progressLabelRu: string;
  soundCueRu: string;
  hapticCueRu: string;
  debugFrameCueRu: string;
};

export type StreamPremiumGiftLivePreviewRuntimeShell191A = {
  assetId: string;
  displayNameRu: string;
  runtimeShellTitleRu: string;
  localPlaybackModeRu: string;
  previewQueuePolicyRu: string;
  selectedPhaseDefault: StreamPremiumGiftLivePreviewPhaseKey191A;
  totalPreviewDurationMs: number;
  stageLayerCount: number;
  phases: StreamPremiumGiftLivePreviewPhase191A[];
  controlChipsRu: readonly string[];
  fallbackCopyRu: string;
  safetyCopyRu: string;
  userFacingOnly: true;
  localPhasePlaybackShellReady: true;
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

export const streamPremiumGiftLivePreviewPhaseOptions191A: Array<{
  key: StreamPremiumGiftLivePreviewPhaseKey191A;
  labelRu: string;
  metaRu: string;
  iconName: "play-outline" | "sync-outline" | "sparkles-outline";
}> = [
  { key: "entrance", labelRu: "Entrance", metaRu: "вход на экран", iconName: "play-outline" },
  { key: "loop", labelRu: "Live Loop", metaRu: "живёт в эфире", iconName: "sync-outline" },
  { key: "finale", labelRu: "Finale", metaRu: "финальный burst", iconName: "sparkles-outline" },
];

const streamPremiumGiftAllCatalog191A: StreamPremiumGiftAsset187A[] = [
  ...streamPremiumGiftPack187A,
  ...streamPremiumGiftPack188A,
  ...streamPremiumGiftPack190A,
  ...streamPremiumGiftPack197A,
];

function buildPhaseProfile191A(gift: StreamPremiumGiftAsset187A, index: number): StreamPremiumGiftLivePreviewPhase191A[] {
  const entranceMs = 760 + (index % 6) * 40;
  const loopMs = 1840 + (index % 8) * 55;
  const finaleMs = 720 + (index % 5) * 45;
  return [
    {
      key: "entrance",
      labelRu: "Entrance",
      durationMs: entranceMs,
      progressPercent: 32,
      phaseCopyRu: `${gift.displayNameRu}: дорогой вход, premium glow, подготовка full-screen overlay`,
      screenLayerRu: `poster-first layer · ${gift.visualTone} · ${gift.effectLabel}`,
      progressLabelRu: `${entranceMs}ms entrance preview shell`,
      soundCueRu: "sound label only, no autoplay",
      hapticCueRu: "optional local tap preview only",
      debugFrameCueRu: `frame cue 01 · ${gift.id} · entrance`,
    },
    {
      key: "loop",
      labelRu: "Live Loop",
      durationMs: loopMs,
      progressPercent: 68,
      phaseCopyRu: `${gift.displayNameRu}: живой loop, aura, trail, particles и recipient focus`,
      screenLayerRu: `safe-area loop · ${gift.motionSpec}`,
      progressLabelRu: `${loopMs}ms live loop preview shell`,
      soundCueRu: "sound cue label visible, playback disabled",
      hapticCueRu: "haptic label visible, no blocking state",
      debugFrameCueRu: `frame cue 02 · ${gift.id} · loop`,
    },
    {
      key: "finale",
      labelRu: "Finale",
      durationMs: finaleMs,
      progressPercent: 100,
      phaseCopyRu: `${gift.displayNameRu}: финальный burst, clean fade и no-charge close`,
      screenLayerRu: `finale burst layer · ${gift.rarityLabel}`,
      progressLabelRu: `${finaleMs}ms finale preview shell`,
      soundCueRu: "final hit label only, no autoplay",
      hapticCueRu: "final impact preview metadata only",
      debugFrameCueRu: `frame cue 03 · ${gift.id} · finale`,
    },
  ];
}

export const streamPremiumGiftLivePreviewRuntimeShellProfiles191A: StreamPremiumGiftLivePreviewRuntimeShell191A[] = streamPremiumGiftAllCatalog191A.map((gift, index) => {
  const phases = buildPhaseProfile191A(gift, index);
  return {
    assetId: gift.id,
    displayNameRu: gift.displayNameRu,
    runtimeShellTitleRu: `${gift.displayNameRu} · live preview shell`,
    localPlaybackModeRu: "Локальный phase preview: Entrance → Live Loop → Finale. Без реальной отправки, оплаты и autoplay.",
    previewQueuePolicyRu: "Preview queue local only: показывает фазу на экране, не создаёт транзакцию и не отправляет подарок.",
    selectedPhaseDefault: "entrance",
    totalPreviewDurationMs: phases.reduce((sum, phase) => sum + phase.durationMs, 0),
    stageLayerCount: 8,
    phases,
    controlChipsRu: ["local phase", "poster-first", "sound label", "haptic label", "no payment", "no real send"],
    fallbackCopyRu: "Reduce motion / weak device: poster pulse + readable phase labels, без heavy animation playback.",
    safetyCopyRu: "191A включает только локальную оболочку preview фаз. Backend, payment, provider, payout, real send, audio autoplay, media playback и random win не включены.",
    userFacingOnly: true,
    localPhasePlaybackShellReady: true,
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

export const streamPremiumGiftLivePreviewRuntimeShellSummary191A = {
  version: "STREAM-GAME-GIFTS-191A",
  giftCount: streamPremiumGiftLivePreviewRuntimeShellProfiles191A.length,
  phaseCountPerGift: 3,
  stageLayerCountPerGift: 8,
  localPhasePlaybackShellReady: true,
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

export function getStreamPremiumGiftLivePreviewRuntimeShell191A(assetId: string): StreamPremiumGiftLivePreviewRuntimeShell191A {
  return streamPremiumGiftLivePreviewRuntimeShellProfiles191A.find((profile) => profile.assetId === assetId) ?? streamPremiumGiftLivePreviewRuntimeShellProfiles191A[0];
}
