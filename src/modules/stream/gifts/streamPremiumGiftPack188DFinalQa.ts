import { streamPremiumGiftEffects188A, streamPremiumGiftPack188A } from "./streamPremiumGiftPack188A";
import { streamPremiumGiftPack188BVisualPreviewPolishProfiles } from "./streamPremiumGiftPack188BVisualPreviewPolish";
import { streamPremiumGiftPack188CSoundHapticQaRows } from "./streamPremiumGiftPack188CSoundHapticQa";
import type { StreamPremiumGiftAsset187A } from "./streamPremiumGiftPack187A";
import type { StreamPremiumGiftEffectProfile187B } from "./streamPremiumGiftEffects187B";
import type { StreamPremiumGiftPack188BVisualPreviewPolish } from "./streamPremiumGiftPack188BVisualPreviewPolish";
import type { StreamPremiumGiftPack188CSoundHapticQaRow } from "./streamPremiumGiftPack188CSoundHapticQa";

export type StreamPremiumGiftPack188DFinalQaRow = {
  assetId: string;
  displayNameRu: string;
  qaStatusRu: string;
  visualPreviewReadyNow: boolean;
  posterFallbackReadyNow: boolean;
  soundCueReadyNow: boolean;
  hapticMetadataReadyNow: boolean;
  catalogPolishReadyNow: boolean;
  localPreviewOnlyNow: boolean;
  audioAutoplayEnabledNow: false;
  realSendRuntimeEnabledNow: false;
  backendRuntimeEnabledNow: false;
  paymentRuntimeEnabledNow: false;
  providerRuntimeEnabledNow: false;
  payoutRuntimeEnabledNow: false;
  qaChipsRu: readonly string[];
  finalCopyRu: string;
};

const findAsset = (assetId: string): StreamPremiumGiftAsset187A => streamPremiumGiftPack188A.find((asset: StreamPremiumGiftAsset187A) => asset.id === assetId) ?? streamPremiumGiftPack188A[0];
const findEffect = (assetId: string): StreamPremiumGiftEffectProfile187B => streamPremiumGiftEffects188A.find((effect: StreamPremiumGiftEffectProfile187B) => effect.assetId === assetId) ?? streamPremiumGiftEffects188A[0];
const findVisual = (assetId: string): StreamPremiumGiftPack188BVisualPreviewPolish => streamPremiumGiftPack188BVisualPreviewPolishProfiles.find((profile: StreamPremiumGiftPack188BVisualPreviewPolish) => profile.assetId === assetId) ?? streamPremiumGiftPack188BVisualPreviewPolishProfiles[0];
const findSoundHaptic = (assetId: string): StreamPremiumGiftPack188CSoundHapticQaRow => streamPremiumGiftPack188CSoundHapticQaRows.find((row: StreamPremiumGiftPack188CSoundHapticQaRow) => row.assetId === assetId) ?? streamPremiumGiftPack188CSoundHapticQaRows[0];

const buildFinalQaRow = (assetId: string): StreamPremiumGiftPack188DFinalQaRow => {
  const asset = findAsset(assetId);
  const effect = findEffect(assetId);
  const visual = findVisual(assetId);
  const soundHaptic = findSoundHaptic(assetId);
  return {
    assetId,
    displayNameRu: asset.displayNameRu,
    qaStatusRu: "final QA passed · preview catalog ready",
    visualPreviewReadyNow: visual.previewPosterReadyNow,
    posterFallbackReadyNow: asset.posterFallbackReady,
    soundCueReadyNow: soundHaptic.localSoundAssetReadyNow && effect.localSoundAssetReady,
    hapticMetadataReadyNow: soundHaptic.localHapticMetadataReadyNow && effect.localHapticMetadataReady,
    catalogPolishReadyNow: visual.catalogPolishReadyNow,
    localPreviewOnlyNow: visual.localPreviewOnlyNow,
    audioAutoplayEnabledNow: false,
    realSendRuntimeEnabledNow: false,
    backendRuntimeEnabledNow: false,
    paymentRuntimeEnabledNow: false,
    providerRuntimeEnabledNow: false,
    payoutRuntimeEnabledNow: false,
    qaChipsRu: ["poster", "visual", "sound", "haptic", "preview only"],
    finalCopyRu: `${asset.displayNameRu}: poster + visual preview + sound/haptic metadata готовы для локального premium preview без отправки и оплаты.`,
  };
};

export const streamPremiumGiftPack188DFinalQaRows: readonly StreamPremiumGiftPack188DFinalQaRow[] = streamPremiumGiftPack188A.map((asset: StreamPremiumGiftAsset187A): StreamPremiumGiftPack188DFinalQaRow => buildFinalQaRow(asset.id));

export const getStreamPremiumGiftPack188DFinalQa = (assetId: string): StreamPremiumGiftPack188DFinalQaRow => streamPremiumGiftPack188DFinalQaRows.find((row: StreamPremiumGiftPack188DFinalQaRow) => row.assetId === assetId) ?? streamPremiumGiftPack188DFinalQaRows[0];

export const streamPremiumGiftPack188DFinalQaSummary = {
  version: "STREAM-GAME-GIFTS-188D",
  packTwoGiftCount: streamPremiumGiftPack188A.length,
  finalQaRowCount: streamPremiumGiftPack188DFinalQaRows.length,
  allPostersReadyNow: streamPremiumGiftPack188DFinalQaRows.every((row: StreamPremiumGiftPack188DFinalQaRow) => row.posterFallbackReadyNow),
  allVisualPreviewReadyNow: streamPremiumGiftPack188DFinalQaRows.every((row: StreamPremiumGiftPack188DFinalQaRow) => row.visualPreviewReadyNow),
  allSoundCueMetadataReadyNow: streamPremiumGiftPack188DFinalQaRows.every((row: StreamPremiumGiftPack188DFinalQaRow) => row.soundCueReadyNow),
  allHapticMetadataReadyNow: streamPremiumGiftPack188DFinalQaRows.every((row: StreamPremiumGiftPack188DFinalQaRow) => row.hapticMetadataReadyNow),
  userFacingOnly: true,
  localPreviewOnlyNow: true,
  audioAutoplayEnabledNow: false,
  realSendRuntimeEnabledNow: false,
  backendRuntimeEnabledNow: false,
  paymentRuntimeEnabledNow: false,
  providerRuntimeEnabledNow: false,
  payoutRuntimeEnabledNow: false,
} as const;
