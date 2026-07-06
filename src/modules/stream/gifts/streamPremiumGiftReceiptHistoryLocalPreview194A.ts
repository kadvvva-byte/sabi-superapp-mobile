import {
  getStreamPremiumGiftSendComposerFinalQa193C,
  streamPremiumGiftSendComposerFinalQaBaseRows193C,
  streamPremiumGiftSendComposerFinalQaSummary193C,
  type StreamPremiumGiftSendComposerFinalQa193COptions,
} from "./streamPremiumGiftSendComposerFinalQa193C";

export type StreamPremiumGiftReceiptHistoryLocalPreview194AOptions = StreamPremiumGiftSendComposerFinalQa193COptions & {
  draftCount: number;
  preparedQuantityTotal: number;
  latestStatusLabel: string;
};

export type StreamPremiumGiftReceiptHistoryLocalPreview194A = {
  assetId: string;
  displayNameRu: string;
  displayName: string;
  receiptTitleRu: string;
  historyTitleRu: string;
  receiptStatusRu: string;
  receiverLineRu: string;
  quantityLineRu: string;
  messageLineRu: string;
  ledgerPreviewRu: string;
  timelineRowsRu: readonly string[];
  receiptRowsRu: readonly string[];
  historyRowsRu: readonly string[];
  receiptChipsRu: readonly string[];
  safetyCopyRu: string;
  userFacingOnly: true;
  receiptPreviewOnly: true;
  historyPreviewOnly: true;
  sourceRuntimeChangedNow: false;
  backendRuntimeEnabledNow: false;
  dbReadRuntimeEnabledNow: false;
  dbWriteRuntimeEnabledNow: false;
  paymentRuntimeEnabledNow: false;
  providerRuntimeEnabledNow: false;
  payoutRuntimeEnabledNow: false;
  sendRuntimeEnabledNow: false;
  walletMutationEnabledNow: false;
  actualAnimationPlaybackRuntimeEnabledNow: false;
  actualSoundAutoplayRuntimeEnabledNow: false;
  randomWinRuntimeEnabledNow: false;
};

export const streamPremiumGiftReceiptHistoryLocalPreviewBaseRows194A = streamPremiumGiftSendComposerFinalQaBaseRows193C.map((gift) => ({
  assetId: gift.assetId,
  displayNameRu: gift.displayNameRu,
  displayName: gift.displayName,
  receiptPreviewReady: true as const,
  historyPreviewReady: true as const,
  timelinePreviewReady: true as const,
  localComposerFinalQaReady: gift.localComposerFinalQaReady,
  userFacingOnly: true as const,
  receiptPreviewOnly: true as const,
  historyPreviewOnly: true as const,
  sendRuntimeEnabledNow: false as const,
  backendRuntimeEnabledNow: false as const,
  dbReadRuntimeEnabledNow: false as const,
  dbWriteRuntimeEnabledNow: false as const,
  paymentRuntimeEnabledNow: false as const,
  walletMutationEnabledNow: false as const,
}));

export const streamPremiumGiftReceiptHistoryLocalPreviewSummary194A = {
  version: "STREAM-GAME-GIFTS-194A",
  giftCount: streamPremiumGiftReceiptHistoryLocalPreviewBaseRows194A.length,
  composerFinalQaCoverage: streamPremiumGiftSendComposerFinalQaSummary193C.finalQaCoverage,
  receiptPreviewCoverage: streamPremiumGiftReceiptHistoryLocalPreviewBaseRows194A.length,
  historyPreviewCoverage: streamPremiumGiftReceiptHistoryLocalPreviewBaseRows194A.length,
  timelinePreviewCoverage: streamPremiumGiftReceiptHistoryLocalPreviewBaseRows194A.length,
  userFacingOnly: true,
  receiptPreviewOnly: true,
  historyPreviewOnly: true,
  sourceRuntimeChangedNow: false,
  backendRuntimeEnabledNow: false,
  dbReadRuntimeEnabledNow: false,
  dbWriteRuntimeEnabledNow: false,
  paymentRuntimeEnabledNow: false,
  providerRuntimeEnabledNow: false,
  payoutRuntimeEnabledNow: false,
  sendRuntimeEnabledNow: false,
  walletMutationEnabledNow: false,
  actualAnimationPlaybackRuntimeEnabledNow: false,
  actualSoundAutoplayRuntimeEnabledNow: false,
  randomWinRuntimeEnabledNow: false,
} as const;

export function getStreamPremiumGiftReceiptHistoryLocalPreview194A(
  assetId: string,
  options: StreamPremiumGiftReceiptHistoryLocalPreview194AOptions,
): StreamPremiumGiftReceiptHistoryLocalPreview194A {
  const qa = getStreamPremiumGiftSendComposerFinalQa193C(assetId, options);
  const safeQuantity = Math.max(1, Math.min(99, Math.trunc(options.quantity || 1)));
  const safeDraftCount = Math.max(0, Math.min(99, Math.trunc(options.draftCount || 0)));
  const safePreparedTotal = Math.max(0, Math.min(999, Math.trunc(options.preparedQuantityTotal || 0)));

  return {
    assetId: qa.assetId,
    displayNameRu: qa.displayNameRu,
    displayName: qa.displayName,
    receiptTitleRu: `${qa.displayNameRu} · локальный чек`,
    historyTitleRu: `${qa.displayNameRu} · preview истории`,
    receiptStatusRu: `${options.latestStatusLabel} · чек не создан на сервере`,
    receiverLineRu: `Кому: ${options.recipientLabel} · ${options.recipientMeta}`,
    quantityLineRu: `Количество: ${safeQuantity}× · всего подготовлено ${safePreparedTotal}×`,
    messageLineRu: `Сообщение: ${options.moodLabel} · ${options.moodNote}`,
    ledgerPreviewRu: `Drafts: ${safeDraftCount} · ${options.composerMeta} · no ledger write`,
    timelineRowsRu: [
      `Draft: ${qa.localPreviewQaRu}`,
      `Composer: ${qa.interactionQaRu}`,
      `Confirm gate: ${qa.confirmGateQaRu}`,
      `Receipt: local preview only, no backend receipt id`,
    ],
    receiptRowsRu: [
      `Gift: ${qa.displayNameRu}`,
      `Receiver: ${options.recipientLabel}`,
      `Quantity: ${safeQuantity}×`,
      `Status: ${options.latestStatusLabel}`,
      "Payment: no charge in mobile preview",
      "Send: real send locked",
    ],
    historyRowsRu: [
      "History row is local preview only",
      "No DB read, no DB write, no server receipt",
      "No Wallet mutation and no provider payment",
      "Real receipt/history will require backend foundation later",
    ],
    receiptChipsRu: ["receipt", "history", "local", "no DB", "no charge", "no send", "safe"],
    safetyCopyRu: "194A показывает только локальный чек и preview истории подарка: без backend read/write, без оплаты, без provider, без Wallet mutation, без payout и без реальной отправки.",
    userFacingOnly: true,
    receiptPreviewOnly: true,
    historyPreviewOnly: true,
    sourceRuntimeChangedNow: false,
    backendRuntimeEnabledNow: false,
    dbReadRuntimeEnabledNow: false,
    dbWriteRuntimeEnabledNow: false,
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
