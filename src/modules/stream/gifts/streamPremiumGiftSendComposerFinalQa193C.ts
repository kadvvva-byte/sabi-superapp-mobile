import {
  getStreamPremiumGiftSendComposerLocalPreview193A,
  streamPremiumGiftSendComposerLocalPreviewSummary193A,
  type StreamPremiumGiftSendComposerLocalPreview193AOptions,
} from "./streamPremiumGiftSendComposerLocalPreview193A";
import {
  getStreamPremiumGiftSendComposerInteractionPolish193B,
  streamPremiumGiftSendComposerInteractionModes193B,
  streamPremiumGiftSendComposerInteractionPolishBaseRows193B,
  streamPremiumGiftSendComposerInteractionPolishSummary193B,
  type StreamPremiumGiftSendComposerInteractionModeKey193B,
} from "./streamPremiumGiftSendComposerInteractionPolish193B";

export type StreamPremiumGiftSendComposerFinalQa193COptions = StreamPremiumGiftSendComposerLocalPreview193AOptions & {
  activeMode: StreamPremiumGiftSendComposerInteractionModeKey193B;
};

export type StreamPremiumGiftSendComposerFinalQa193C = {
  assetId: string;
  displayNameRu: string;
  displayName: string;
  qaTitleRu: string;
  qaSubtitleRu: string;
  qaStatusRu: string;
  localPreviewQaRu: string;
  interactionQaRu: string;
  confirmGateQaRu: string;
  priceDisclosureQaRu: string;
  safetyDisclosureQaRu: string;
  selectedModeLabelRu: string;
  qaRowsRu: readonly string[];
  qaChipsRu: readonly string[];
  userFacingOnly: true;
  finalQaOnly: true;
  localComposerPreviewOnly: true;
  localComposerControlsOnly: true;
  sourceRuntimeChangedNow: false;
  backendRuntimeEnabledNow: false;
  paymentRuntimeEnabledNow: false;
  providerRuntimeEnabledNow: false;
  payoutRuntimeEnabledNow: false;
  sendRuntimeEnabledNow: false;
  walletMutationEnabledNow: false;
  actualAnimationPlaybackRuntimeEnabledNow: false;
  actualSoundAutoplayRuntimeEnabledNow: false;
  randomWinRuntimeEnabledNow: false;
};

export const streamPremiumGiftSendComposerFinalQaBaseRows193C = streamPremiumGiftSendComposerInteractionPolishBaseRows193B.map((gift) => ({
  assetId: gift.assetId,
  displayNameRu: gift.displayNameRu,
  displayName: gift.displayName,
  localPreviewReady: gift.localComposerPreviewReady,
  recipientControlReady: gift.recipientControlReady,
  quantityControlReady: gift.quantityControlReady,
  messageControlReady: gift.messageControlReady,
  confirmGateReady: gift.confirmGateReady,
  localComposerFinalQaReady: true as const,
  userFacingOnly: true as const,
  finalQaOnly: true as const,
  sendRuntimeEnabledNow: false as const,
  paymentRuntimeEnabledNow: false as const,
  walletMutationEnabledNow: false as const,
}));

export const streamPremiumGiftSendComposerFinalQaSummary193C = {
  version: "STREAM-GAME-GIFTS-193C",
  giftCount: streamPremiumGiftSendComposerFinalQaBaseRows193C.length,
  localComposerPreviewCoverage: streamPremiumGiftSendComposerLocalPreviewSummary193A.localComposerPreviewCoverage,
  interactionPolishCoverage: streamPremiumGiftSendComposerInteractionPolishSummary193B.giftCount,
  interactionModeCount: streamPremiumGiftSendComposerInteractionModes193B.length,
  recipientControlCoverage: streamPremiumGiftSendComposerInteractionPolishSummary193B.recipientControlCoverage,
  quantityControlCoverage: streamPremiumGiftSendComposerInteractionPolishSummary193B.quantityControlCoverage,
  messageControlCoverage: streamPremiumGiftSendComposerInteractionPolishSummary193B.messageControlCoverage,
  confirmGateCoverage: streamPremiumGiftSendComposerInteractionPolishSummary193B.confirmGateCoverage,
  finalQaCoverage: streamPremiumGiftSendComposerFinalQaBaseRows193C.length,
  userFacingOnly: true,
  finalQaOnly: true,
  localComposerPreviewOnly: true,
  localComposerControlsOnly: true,
  sourceRuntimeChangedNow: false,
  backendRuntimeEnabledNow: false,
  paymentRuntimeEnabledNow: false,
  providerRuntimeEnabledNow: false,
  payoutRuntimeEnabledNow: false,
  sendRuntimeEnabledNow: false,
  walletMutationEnabledNow: false,
  actualAnimationPlaybackRuntimeEnabledNow: false,
  actualSoundAutoplayRuntimeEnabledNow: false,
  randomWinRuntimeEnabledNow: false,
} as const;

export function getStreamPremiumGiftSendComposerFinalQa193C(
  assetId: string,
  options: StreamPremiumGiftSendComposerFinalQa193COptions,
): StreamPremiumGiftSendComposerFinalQa193C {
  const preview = getStreamPremiumGiftSendComposerLocalPreview193A(assetId, options);
  const interaction = getStreamPremiumGiftSendComposerInteractionPolish193B(assetId, options);
  const mode = streamPremiumGiftSendComposerInteractionModes193B.find((item) => item.key === options.activeMode) ?? streamPremiumGiftSendComposerInteractionModes193B[0];
  const safeQuantity = Math.max(1, Math.min(99, Math.trunc(options.quantity || 1)));

  return {
    assetId: preview.assetId,
    displayNameRu: preview.displayNameRu,
    displayName: preview.displayName,
    qaTitleRu: `${preview.displayNameRu} · composer final QA`,
    qaSubtitleRu: `${mode.labelRu} · ${options.sendStateLabel} · 193A+193B coverage`,
    qaStatusRu: "Composer QA passed",
    localPreviewQaRu: `${preview.receiverPreviewRu} · ${preview.quantityPreviewRu}`,
    interactionQaRu: `${interaction.activeModeLabelRu} · ${interaction.activeModeMetaRu}`,
    confirmGateQaRu: `${interaction.confirmGateRu} · real send locked`,
    priceDisclosureQaRu: preview.priceDisclosureRu,
    safetyDisclosureQaRu: "193C проверяет composer только как локальный preview: без backend, оплаты, provider, Wallet mutation, payout и real send.",
    selectedModeLabelRu: mode.labelRu,
    qaRowsRu: [
      `193A preview: ${preview.draftStatePreviewRu}`,
      `193B controls: ${interaction.activeModeLabelRu}`,
      `Recipient: ${options.recipientLabel}`,
      `Quantity: ${safeQuantity}× no charge`,
      `Message: ${options.moodLabel}`,
      "Confirm gate: locked for real send",
      "Runtime: no backend/payment/provider/Wallet/payout/send",
    ],
    qaChipsRu: ["193A", "193B", "final QA", mode.labelRu, "no send", "no charge", "safe"],
    userFacingOnly: true,
    finalQaOnly: true,
    localComposerPreviewOnly: true,
    localComposerControlsOnly: true,
    sourceRuntimeChangedNow: false,
    backendRuntimeEnabledNow: false,
    paymentRuntimeEnabledNow: false,
    providerRuntimeEnabledNow: false,
    payoutRuntimeEnabledNow: false,
    sendRuntimeEnabledNow: false,
    walletMutationEnabledNow: false,
    actualAnimationPlaybackRuntimeEnabledNow: false,
    actualSoundAutoplayRuntimeEnabledNow: false,
    randomWinRuntimeEnabledNow: false,
  };
}
