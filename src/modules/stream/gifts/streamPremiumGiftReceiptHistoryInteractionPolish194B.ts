import {
  getStreamPremiumGiftReceiptHistoryLocalPreview194A,
  streamPremiumGiftReceiptHistoryLocalPreviewBaseRows194A,
  streamPremiumGiftReceiptHistoryLocalPreviewSummary194A,
  type StreamPremiumGiftReceiptHistoryLocalPreview194AOptions,
} from "./streamPremiumGiftReceiptHistoryLocalPreview194A";

export type StreamPremiumGiftReceiptHistoryFilterKey194B = "all" | "sent" | "received" | "drafts";

export type StreamPremiumGiftReceiptHistoryFilterOption194B = {
  key: StreamPremiumGiftReceiptHistoryFilterKey194B;
  labelRu: string;
  label: string;
  iconLabelRu: string;
  emptyStateRu: string;
};

export const streamPremiumGiftReceiptHistoryFilterOptions194B: readonly StreamPremiumGiftReceiptHistoryFilterOption194B[] = [
  {
    key: "all",
    labelRu: "Все",
    label: "All",
    iconLabelRu: "вся локальная история",
    emptyStateRu: "Показываем все локальные preview-чеки без обращения к серверу.",
  },
  {
    key: "sent",
    labelRu: "Отправлено",
    label: "Sent",
    iconLabelRu: "отправленные preview",
    emptyStateRu: "Реальные отправки выключены; здесь только локальный макет будущей строки.",
  },
  {
    key: "received",
    labelRu: "Получено",
    label: "Received",
    iconLabelRu: "полученные preview",
    emptyStateRu: "Полученные подарки будут приходить из backend позже; сейчас это безопасный preview.",
  },
  {
    key: "drafts",
    labelRu: "Черновики",
    label: "Drafts",
    iconLabelRu: "черновики подарков",
    emptyStateRu: "Черновики живут локально в composer preview и не создают server receipt.",
  },
] as const;

export type StreamPremiumGiftReceiptHistoryInteractionPolish194BOptions = StreamPremiumGiftReceiptHistoryLocalPreview194AOptions & {
  activeFilter: StreamPremiumGiftReceiptHistoryFilterKey194B;
};

export type StreamPremiumGiftReceiptHistoryInteractionPolish194B = {
  assetId: string;
  displayNameRu: string;
  displayName: string;
  activeFilter: StreamPremiumGiftReceiptHistoryFilterKey194B;
  activeFilterLabelRu: string;
  filterDeckTitleRu: string;
  filterDeckMetaRu: string;
  emptyStateRu: string;
  filterRowsRu: readonly string[];
  auditTrailPreviewRowsRu: readonly string[];
  controlChecklistRu: readonly string[];
  controlChipsRu: readonly string[];
  safetyCopyRu: string;
  userFacingOnly: true;
  localHistoryFiltersOnly: true;
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

export const streamPremiumGiftReceiptHistoryInteractionBaseRows194B = streamPremiumGiftReceiptHistoryLocalPreviewBaseRows194A.map((gift) => ({
  assetId: gift.assetId,
  displayNameRu: gift.displayNameRu,
  displayName: gift.displayName,
  receiptPreviewReady: gift.receiptPreviewReady,
  historyPreviewReady: gift.historyPreviewReady,
  timelinePreviewReady: gift.timelinePreviewReady,
  localHistoryFiltersReady: true as const,
  userFacingOnly: true as const,
  localHistoryFiltersOnly: true as const,
  backendRuntimeEnabledNow: false as const,
  dbReadRuntimeEnabledNow: false as const,
  dbWriteRuntimeEnabledNow: false as const,
  paymentRuntimeEnabledNow: false as const,
  providerRuntimeEnabledNow: false as const,
  payoutRuntimeEnabledNow: false as const,
  sendRuntimeEnabledNow: false as const,
  walletMutationEnabledNow: false as const,
}));

export const streamPremiumGiftReceiptHistoryInteractionSummary194B = {
  version: "STREAM-GAME-GIFTS-194B",
  giftCount: streamPremiumGiftReceiptHistoryInteractionBaseRows194B.length,
  receiptPreviewCoverage: streamPremiumGiftReceiptHistoryLocalPreviewSummary194A.receiptPreviewCoverage,
  historyPreviewCoverage: streamPremiumGiftReceiptHistoryLocalPreviewSummary194A.historyPreviewCoverage,
  localHistoryFilterCoverage: streamPremiumGiftReceiptHistoryInteractionBaseRows194B.length,
  filterCount: streamPremiumGiftReceiptHistoryFilterOptions194B.length,
  userFacingOnly: true,
  localHistoryFiltersOnly: true,
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

export function getStreamPremiumGiftReceiptHistoryInteractionPolish194B(
  assetId: string,
  options: StreamPremiumGiftReceiptHistoryInteractionPolish194BOptions,
): StreamPremiumGiftReceiptHistoryInteractionPolish194B {
  const receipt = getStreamPremiumGiftReceiptHistoryLocalPreview194A(assetId, options);
  const activeFilterOption = streamPremiumGiftReceiptHistoryFilterOptions194B.find((filter) => filter.key === options.activeFilter) ?? streamPremiumGiftReceiptHistoryFilterOptions194B[0];
  const safeDraftCount = Math.max(0, Math.min(99, Math.trunc(options.draftCount || 0)));
  const safePreparedTotal = Math.max(0, Math.min(999, Math.trunc(options.preparedQuantityTotal || 0)));

  return {
    assetId: receipt.assetId,
    displayNameRu: receipt.displayNameRu,
    displayName: receipt.displayName,
    activeFilter: activeFilterOption.key,
    activeFilterLabelRu: activeFilterOption.labelRu,
    filterDeckTitleRu: `${receipt.displayNameRu} · ${activeFilterOption.labelRu}`,
    filterDeckMetaRu: `${activeFilterOption.iconLabelRu} · ${safeDraftCount} drafts · ${safePreparedTotal}× prepared`,
    emptyStateRu: activeFilterOption.emptyStateRu,
    filterRowsRu: [
      `Фильтр: ${activeFilterOption.labelRu}`,
      `Receiver: ${options.recipientLabel}`,
      `Status: ${options.latestStatusLabel}`,
      `Ledger: no DB read/write, no server receipt`,
    ],
    auditTrailPreviewRowsRu: [
      `Receipt preview: ${receipt.receiptTitleRu}`,
      `History row: ${receipt.historyTitleRu}`,
      `Timeline: ${receipt.timelineRowsRu.length} local rows`,
      `Filter deck: ${activeFilterOption.label} local only`,
    ],
    controlChecklistRu: [
      "All/Sent/Received/Drafts работают как локальные UI-фильтры",
      "Фильтр не читает backend и не пишет в DB",
      "Чек не получает server receipt id в mobile preview",
      "Оплата, Wallet mutation и payout остаются выключены",
    ],
    controlChipsRu: [activeFilterOption.labelRu, "local filter", "receipt", "history", "no DB", "no send", "safe"],
    safetyCopyRu: "194B добавляет только локальные фильтры preview истории подарков: без backend read/write, без оплаты, без provider, без Wallet mutation, без payout и без реальной отправки.",
    userFacingOnly: true,
    localHistoryFiltersOnly: true,
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
