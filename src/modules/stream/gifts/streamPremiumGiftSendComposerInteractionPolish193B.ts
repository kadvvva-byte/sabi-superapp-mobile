import {
  getStreamPremiumGiftSendComposerLocalPreview193A,
  streamPremiumGiftSendComposerLocalPreviewBaseRows193A,
  streamPremiumGiftSendComposerLocalPreviewSummary193A,
  type StreamPremiumGiftSendComposerLocalPreview193AOptions,
} from "./streamPremiumGiftSendComposerLocalPreview193A";

export const streamPremiumGiftSendComposerInteractionModes193B = [
  {
    key: "recipient",
    labelRu: "Кому",
    metaRu: "Переключатель получателя только обновляет локальный composer preview.",
    icon: "person-add-outline",
  },
  {
    key: "quantity",
    labelRu: "Кол-во",
    metaRu: "Quantity chip показывает draft amount без списания и без оплаты.",
    icon: "add-circle-outline",
  },
  {
    key: "message",
    labelRu: "Текст",
    metaRu: "Message/mood chip меняет только локальную подпись preview.",
    icon: "chatbubble-ellipses-outline",
  },
  {
    key: "confirm",
    labelRu: "Проверка",
    metaRu: "Confirm gate показывает checklist, но real send остаётся locked.",
    icon: "shield-checkmark-outline",
  },
] as const;

export type StreamPremiumGiftSendComposerInteractionModeKey193B = typeof streamPremiumGiftSendComposerInteractionModes193B[number]["key"];

export type StreamPremiumGiftSendComposerInteractionPolish193BOptions = StreamPremiumGiftSendComposerLocalPreview193AOptions & {
  activeMode: StreamPremiumGiftSendComposerInteractionModeKey193B;
};

export type StreamPremiumGiftSendComposerInteractionPolish193B = {
  assetId: string;
  displayNameRu: string;
  displayName: string;
  interactionTitleRu: string;
  interactionSubtitleRu: string;
  activeMode: StreamPremiumGiftSendComposerInteractionModeKey193B;
  activeModeLabelRu: string;
  activeModeMetaRu: string;
  recipientControlRu: string;
  quantityControlRu: string;
  messageControlRu: string;
  confirmGateRu: string;
  localPreviewDeckRu: string;
  stateCopyRu: string;
  safetyCopyRu: string;
  controlRowsRu: readonly string[];
  interactionChipsRu: readonly string[];
  localComposerControlsOnly: true;
  userFacingOnly: true;
  previewOnly: true;
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

export const streamPremiumGiftSendComposerInteractionPolishBaseRows193B = streamPremiumGiftSendComposerLocalPreviewBaseRows193A.map((gift) => ({
  assetId: gift.assetId,
  displayNameRu: gift.displayNameRu,
  displayName: gift.displayName,
  localComposerPreviewReady: true as const,
  recipientControlReady: true as const,
  quantityControlReady: true as const,
  messageControlReady: true as const,
  confirmGateReady: true as const,
  localComposerControlsOnly: true as const,
  sendRuntimeEnabledNow: false as const,
  paymentRuntimeEnabledNow: false as const,
}));

export const streamPremiumGiftSendComposerInteractionPolishSummary193B = {
  version: "STREAM-GAME-GIFTS-193B",
  giftCount: streamPremiumGiftSendComposerInteractionPolishBaseRows193B.length,
  localComposerPreviewCoverage: streamPremiumGiftSendComposerLocalPreviewSummary193A.localComposerPreviewCoverage,
  interactionModeCount: streamPremiumGiftSendComposerInteractionModes193B.length,
  recipientControlCoverage: streamPremiumGiftSendComposerInteractionPolishBaseRows193B.length,
  quantityControlCoverage: streamPremiumGiftSendComposerInteractionPolishBaseRows193B.length,
  messageControlCoverage: streamPremiumGiftSendComposerInteractionPolishBaseRows193B.length,
  confirmGateCoverage: streamPremiumGiftSendComposerInteractionPolishBaseRows193B.length,
  localComposerControlsOnly: true,
  userFacingOnly: true,
  previewOnly: true,
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

export function getStreamPremiumGiftSendComposerInteractionPolish193B(
  assetId: string,
  options: StreamPremiumGiftSendComposerInteractionPolish193BOptions,
): StreamPremiumGiftSendComposerInteractionPolish193B {
  const preview = getStreamPremiumGiftSendComposerLocalPreview193A(assetId, options);
  const activeMode = streamPremiumGiftSendComposerInteractionModes193B.find((mode) => mode.key === options.activeMode) ?? streamPremiumGiftSendComposerInteractionModes193B[0];
  const safeQuantity = Math.max(1, Math.min(99, Math.trunc(options.quantity || 1)));

  return {
    assetId: preview.assetId,
    displayNameRu: preview.displayNameRu,
    displayName: preview.displayName,
    interactionTitleRu: `${preview.displayNameRu} · composer controls preview`,
    interactionSubtitleRu: `${activeMode.labelRu} · ${options.sendStateLabel} · local only`,
    activeMode: activeMode.key,
    activeModeLabelRu: activeMode.labelRu,
    activeModeMetaRu: activeMode.metaRu,
    recipientControlRu: `${options.recipientLabel} · ${options.recipientMeta} · local recipient chip`,
    quantityControlRu: `${safeQuantity}× · quantity stepper preview only · no charge`,
    messageControlRu: `${options.moodLabel} · ${options.moodNote} · local message chip`,
    confirmGateRu: `${options.sendStateLabel} · confirm gate locked for real send`,
    localPreviewDeckRu: `${preview.overlayPreviewRu} · ${preview.priceDisclosureRu}`,
    stateCopyRu: `${preview.draftStatePreviewRu} · interaction polish only`,
    safetyCopyRu: "193B controls are local composer UI only: no real send, no backend call, no payment, no provider, no Wallet mutation, no payout.",
    controlRowsRu: [
      `Recipient: ${options.recipientLabel}`,
      `Quantity: ${safeQuantity}×`,
      `Message mood: ${options.moodLabel}`,
      `Preview state: ${options.sendStateLabel}`,
      `Active control: ${activeMode.labelRu}`,
      "Action: local composer controls only",
    ],
    interactionChipsRu: ["recipient", "quantity", "message", "confirm gate", "local only", "no real send"],
    localComposerControlsOnly: true,
    userFacingOnly: true,
    previewOnly: true,
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
