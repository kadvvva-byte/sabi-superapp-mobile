import { streamPremiumGiftEffects188A, streamPremiumGiftPack188A } from "./streamPremiumGiftPack188A";
import type { StreamPremiumGiftAsset187A } from "./streamPremiumGiftPack187A";
import type { StreamGiftHapticImpactStyle187B, StreamPremiumGiftEffectProfile187B } from "./streamPremiumGiftEffects187B";

export type StreamPremiumGiftPack188CSoundHapticQaRow = {
  assetId: string;
  displayNameRu: string;
  qaStatusLabelRu: string;
  soundAssetFile: string;
  soundCueDurationLabel: string;
  soundCuePassLabelRu: string;
  hapticImpactStyle: StreamGiftHapticImpactStyle187B;
  hapticPatternRu: string;
  hapticPassLabelRu: string;
  safetyChipsRu: readonly string[];
  previewOnlyCopyRu: string;
  fallbackCopyRu: string;
  localSoundAssetReadyNow: boolean;
  localHapticMetadataReadyNow: boolean;
  soundAutoplayRuntimeEnabledNow: false;
  realSendRuntimeEnabledNow: false;
  paymentRuntimeEnabledNow: false;
  providerRuntimeEnabledNow: false;
  payoutRuntimeEnabledNow: false;
};

const hapticPatternByImpact: Record<StreamGiftHapticImpactStyle187B, string> = {
  soft: "soft tap · gentle preview",
  light: "light pulse · safe preview",
  medium: "medium rhythm · local vibe",
  strong: "strong impact · local only",
  finale: "finale impact · preview only",
};

const formatDuration = (durationMs: number): string => `${durationMs} ms cue · label only`;

const getPackTwoAsset = (assetId: string): StreamPremiumGiftAsset187A => {
  return streamPremiumGiftPack188A.find((asset: StreamPremiumGiftAsset187A) => asset.id === assetId) ?? streamPremiumGiftPack188A[0];
};

const buildQaRow = (effect: StreamPremiumGiftEffectProfile187B): StreamPremiumGiftPack188CSoundHapticQaRow => {
  const asset = getPackTwoAsset(effect.assetId);
  return {
    assetId: effect.assetId,
    displayNameRu: asset.displayNameRu,
    qaStatusLabelRu: "sound cue + haptic metadata ready",
    soundAssetFile: effect.soundCueFile,
    soundCueDurationLabel: formatDuration(effect.soundCueDurationMs),
    soundCuePassLabelRu: `${effect.soundCueLabelRu} · WAV asset mapped`,
    hapticImpactStyle: effect.hapticImpactStyle,
    hapticPatternRu: hapticPatternByImpact[effect.hapticImpactStyle],
    hapticPassLabelRu: `${effect.hapticLabel} · metadata ready`,
    safetyChipsRu: ["no autoplay", "local haptic", "preview only", "no charge"],
    previewOnlyCopyRu: "Звук и вибрация показаны как premium preview metadata: без автозапуска, без отправки, без оплаты.",
    fallbackCopyRu: effect.reducedMotionFallback,
    localSoundAssetReadyNow: effect.localSoundAssetReady,
    localHapticMetadataReadyNow: effect.localHapticMetadataReady,
    soundAutoplayRuntimeEnabledNow: false,
    realSendRuntimeEnabledNow: false,
    paymentRuntimeEnabledNow: false,
    providerRuntimeEnabledNow: false,
    payoutRuntimeEnabledNow: false,
  };
};

export const streamPremiumGiftPack188CSoundHapticQaRows: readonly StreamPremiumGiftPack188CSoundHapticQaRow[] = streamPremiumGiftEffects188A.map((effect: StreamPremiumGiftEffectProfile187B): StreamPremiumGiftPack188CSoundHapticQaRow => buildQaRow(effect));

export const getStreamPremiumGiftPack188CSoundHapticQa = (assetId: string): StreamPremiumGiftPack188CSoundHapticQaRow => {
  return streamPremiumGiftPack188CSoundHapticQaRows.find((row: StreamPremiumGiftPack188CSoundHapticQaRow) => row.assetId === assetId) ?? streamPremiumGiftPack188CSoundHapticQaRows[0];
};

export const streamPremiumGiftPack188CSoundHapticQaSafety = {
  version: "STREAM-GAME-GIFTS-188C",
  packTwoGiftCount: streamPremiumGiftPack188A.length,
  qaRowCount: streamPremiumGiftPack188CSoundHapticQaRows.length,
  soundCueAssetCount: streamPremiumGiftPack188CSoundHapticQaRows.filter((row: StreamPremiumGiftPack188CSoundHapticQaRow) => row.localSoundAssetReadyNow).length,
  hapticMetadataCount: streamPremiumGiftPack188CSoundHapticQaRows.filter((row: StreamPremiumGiftPack188CSoundHapticQaRow) => row.localHapticMetadataReadyNow).length,
  userFacingOnly: true,
  previewOnlyNow: true,
  soundAutoplayRuntimeEnabledNow: false,
  realSendRuntimeEnabledNow: false,
  paymentRuntimeEnabledNow: false,
  providerRuntimeEnabledNow: false,
  payoutRuntimeEnabledNow: false,
} as const;
