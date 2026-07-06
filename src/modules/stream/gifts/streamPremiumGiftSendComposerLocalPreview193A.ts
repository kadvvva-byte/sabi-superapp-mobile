import {
  getStreamPremiumGiftCatalogFinalQa192C,
  streamPremiumGiftCatalogFinalQaRows192C,
  streamPremiumGiftCatalogFinalQaSummary192C,
} from "./streamPremiumGiftCatalogFinalQa192C";

export type StreamPremiumGiftSendComposerLocalPreview193AOptions = {
  quantity: number;
  recipientLabel: string;
  recipientMeta: string;
  moodLabel: string;
  moodNote: string;
  sendStateLabel: string;
  composerMeta: string;
};

export type StreamPremiumGiftSendComposerLocalPreview193A = {
  assetId: string;
  displayNameRu: string;
  displayName: string;
  composerTitleRu: string;
  composerSubtitleRu: string;
  receiverPreviewRu: string;
  quantityPreviewRu: string;
  moodPreviewRu: string;
  messagePreviewRu: string;
  draftStatePreviewRu: string;
  overlayPreviewRu: string;
  priceDisclosureRu: string;
  safetyCopyRu: string;
  composerRowsRu: readonly string[];
  composerChipsRu: readonly string[];
  localPreviewOnly: true;
  userFacingOnly: true;
  composerPolishOnly: true;
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

export const streamPremiumGiftSendComposerLocalPreviewBaseRows193A = streamPremiumGiftCatalogFinalQaRows192C.map((gift) => ({
  assetId: gift.assetId,
  displayNameRu: gift.displayNameRu,
  displayName: gift.displayName,
  catalogCoverageRu: gift.coverageLabelRu,
  storefrontQaRu: gift.storefrontQaRu,
  packLaneQaRu: gift.packLaneQaRu,
  priceDisclosureRu: gift.priceDisclosureQaRu,
  safetyDisclosureRu: gift.safetyDisclosureQaRu,
  userFacingOnly: true as const,
  localPreviewOnly: true as const,
  sendRuntimeEnabledNow: false as const,
  paymentRuntimeEnabledNow: false as const,
}));

export const streamPremiumGiftSendComposerLocalPreviewSummary193A = {
  version: "STREAM-GAME-GIFTS-193A",
  giftCount: streamPremiumGiftSendComposerLocalPreviewBaseRows193A.length,
  totalCatalogGifts: streamPremiumGiftCatalogFinalQaSummary192C.giftCount,
  catalogQaCoverage: streamPremiumGiftCatalogFinalQaSummary192C.qaPassedCount,
  localComposerPreviewCoverage: streamPremiumGiftSendComposerLocalPreviewBaseRows193A.length,
  quantityPreviewSupported: true,
  receiverPreviewSupported: true,
  moodPreviewSupported: true,
  sendStatePreviewSupported: true,
  localPreviewOnly: true,
  userFacingOnly: true,
  composerPolishOnly: true,
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

export function getStreamPremiumGiftSendComposerLocalPreview193A(
  assetId: string,
  options: StreamPremiumGiftSendComposerLocalPreview193AOptions,
): StreamPremiumGiftSendComposerLocalPreview193A {
  const gift = getStreamPremiumGiftCatalogFinalQa192C(assetId);
  const safeQuantity = Math.max(1, Math.min(99, Math.trunc(options.quantity || 1)));
  return {
    assetId: gift.assetId,
    displayNameRu: gift.displayNameRu,
    displayName: gift.displayName,
    composerTitleRu: `${gift.displayNameRu} · local composer preview`,
    composerSubtitleRu: `${options.composerMeta} · ${gift.coverageLabelRu}`,
    receiverPreviewRu: `${options.recipientLabel} · ${options.recipientMeta} · получатель только в локальном preview`,
    quantityPreviewRu: `${safeQuantity}× · ${gift.priceDisclosureQaRu}`,
    moodPreviewRu: `${options.moodLabel} · ${options.moodNote}`,
    messagePreviewRu: `${options.moodNote} · ${gift.storefrontQaRu}`,
    draftStatePreviewRu: `${options.sendStateLabel} · локальный черновик без отправки`,
    overlayPreviewRu: `${gift.packLaneQaRu} · ${gift.rarityLaneQaRu}`,
    priceDisclosureRu: gift.priceDisclosureQaRu,
    safetyCopyRu: "193A показывает только локальный composer preview: без backend, без списания, без оплаты, без provider, без Wallet mutation, без payout и без реальной отправки.",
    composerRowsRu: [
      `Подарок: ${gift.displayNameRu}`,
      `Получатель: ${options.recipientLabel}`,
      `Количество: ${safeQuantity}×`,
      `Настроение: ${options.moodLabel}`,
      `State: ${options.sendStateLabel}`,
      "Action: preview only, real send locked",
    ],
    composerChipsRu: ["composer", "local", "no charge", "no send", "32 gifts", "safe"],
    localPreviewOnly: true,
    userFacingOnly: true,
    composerPolishOnly: true,
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
