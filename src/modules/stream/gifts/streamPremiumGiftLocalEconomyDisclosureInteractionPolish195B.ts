import {
  getStreamPremiumGiftLocalEconomyDisclosurePolish195A,
  streamPremiumGiftLocalEconomyDisclosureRows195A,
  streamPremiumGiftLocalEconomyDisclosureSummary195A,
  type StreamPremiumGiftLocalEconomyDisclosurePolish195AOptions,
} from "./streamPremiumGiftLocalEconomyDisclosurePolish195A";

export type StreamPremiumGiftLocalEconomyDisclosureModeKey195B = "demoPoints" | "giftOnly" | "noCashout" | "officialCreator";

export type StreamPremiumGiftLocalEconomyDisclosureMode195B = {
  key: StreamPremiumGiftLocalEconomyDisclosureModeKey195B;
  labelRu: string;
  metaRu: string;
  iconRu: string;
};

export const streamPremiumGiftLocalEconomyDisclosureModes195B: readonly StreamPremiumGiftLocalEconomyDisclosureMode195B[] = [
  {
    key: "demoPoints",
    labelRu: "Демо-баллы",
    metaRu: "Не деньги · нет депозита · нет вывода",
    iconRu: "DEMO",
  },
  {
    key: "giftOnly",
    labelRu: "Только подарки",
    metaRu: "Демо-выигрыш можно показать только как gift-only spending",
    iconRu: "GIFT",
  },
  {
    key: "noCashout",
    labelRu: "Нет cash-out",
    metaRu: "Обычный пользователь не выводит баллы, подарок или выигрыш",
    iconRu: "LOCK",
  },
  {
    key: "officialCreator",
    labelRu: "Official creator",
    metaRu: "Будущие выплаты только verified creators через compliance/Admin gates",
    iconRu: "KYC",
  },
] as const;

export const streamPremiumGiftLocalEconomyDisclosureInteractionModes195B = streamPremiumGiftLocalEconomyDisclosureModes195B;

export type StreamPremiumGiftLocalEconomyDisclosureInteractionPolish195BOptions = StreamPremiumGiftLocalEconomyDisclosurePolish195AOptions & {
  activeMode: StreamPremiumGiftLocalEconomyDisclosureModeKey195B;
};

export type StreamPremiumGiftLocalEconomyDisclosureInteractionPolish195B = {
  assetId: string;
  displayNameRu: string;
  displayName: string;
  interactionTitleRu: string;
  interactionMetaRu: string;
  activeModeKey: StreamPremiumGiftLocalEconomyDisclosureModeKey195B;
  activeModeLabelRu: string;
  activeModeMetaRu: string;
  activeModeIconRu: string;
  expandedDisclosureTitleRu: string;
  expandedDisclosureBodyRu: string;
  modeRowsRu: readonly string[];
  confirmationChecklistRu: readonly string[];
  interactionChipsRu: readonly string[];
  safetyCopyRu: string;
  userFacingOnly: true;
  localInteractionOnly: true;
  localDisclosureOnly: true;
  demoPointsOnlyNow: true;
  giftOnlySpendingOnlyNow: true;
  cashOutEnabledForRegularUsersNow: false;
  officialCreatorPayoutRuntimeEnabledNow: false;
  realSendRuntimeEnabledNow: false;
  backendRuntimeEnabledNow: false;
  dbReadRuntimeEnabledNow: false;
  dbWriteRuntimeEnabledNow: false;
  paymentRuntimeEnabledNow: false;
  providerRuntimeEnabledNow: false;
  payoutRuntimeEnabledNow: false;
  walletMutationEnabledNow: false;
  actualAnimationPlaybackRuntimeEnabledNow: false;
  actualSoundAutoplayRuntimeEnabledNow: false;
  randomWinRuntimeEnabledNow: false;
};

export const streamPremiumGiftLocalEconomyDisclosureInteractionRows195B = streamPremiumGiftLocalEconomyDisclosureRows195A.map((gift) => ({
  assetId: gift.assetId,
  displayNameRu: gift.displayNameRu,
  displayName: gift.displayName,
  disclosureInteractionReady: true as const,
  modeCount: streamPremiumGiftLocalEconomyDisclosureModes195B.length,
  demoPointsModeReady: true as const,
  giftOnlyModeReady: true as const,
  noCashoutModeReady: true as const,
  officialCreatorModeReady: true as const,
  userFacingOnly: true as const,
  localInteractionOnly: true as const,
  localDisclosureOnly: true as const,
  realSendRuntimeEnabledNow: false as const,
  backendRuntimeEnabledNow: false as const,
  dbReadRuntimeEnabledNow: false as const,
  dbWriteRuntimeEnabledNow: false as const,
  paymentRuntimeEnabledNow: false as const,
  providerRuntimeEnabledNow: false as const,
  payoutRuntimeEnabledNow: false as const,
  walletMutationEnabledNow: false as const,
}));

export const streamPremiumGiftLocalEconomyDisclosureInteractionSummary195B = {
  version: "STREAM-GAME-GIFTS-195B",
  giftCount: streamPremiumGiftLocalEconomyDisclosureInteractionRows195B.length,
  totalCatalogGifts: streamPremiumGiftLocalEconomyDisclosureSummary195A.giftCount,
  interactionModeCount: streamPremiumGiftLocalEconomyDisclosureModes195B.length,
  disclosureInteractionCoverage: streamPremiumGiftLocalEconomyDisclosureInteractionRows195B.filter((row) => row.disclosureInteractionReady).length,
  demoPointsModeCoverage: streamPremiumGiftLocalEconomyDisclosureInteractionRows195B.filter((row) => row.demoPointsModeReady).length,
  giftOnlyModeCoverage: streamPremiumGiftLocalEconomyDisclosureInteractionRows195B.filter((row) => row.giftOnlyModeReady).length,
  noCashoutModeCoverage: streamPremiumGiftLocalEconomyDisclosureInteractionRows195B.filter((row) => row.noCashoutModeReady).length,
  officialCreatorModeCoverage: streamPremiumGiftLocalEconomyDisclosureInteractionRows195B.filter((row) => row.officialCreatorModeReady).length,
  userFacingOnly: true,
  localInteractionOnly: true,
  localDisclosureOnly: true,
  demoPointsOnlyNow: true,
  giftOnlySpendingOnlyNow: true,
  cashOutEnabledForRegularUsersNow: false,
  officialCreatorPayoutRuntimeEnabledNow: false,
  realSendRuntimeEnabledNow: false,
  backendRuntimeEnabledNow: false,
  dbReadRuntimeEnabledNow: false,
  dbWriteRuntimeEnabledNow: false,
  paymentRuntimeEnabledNow: false,
  providerRuntimeEnabledNow: false,
  payoutRuntimeEnabledNow: false,
  walletMutationEnabledNow: false,
  actualAnimationPlaybackRuntimeEnabledNow: false,
  actualSoundAutoplayRuntimeEnabledNow: false,
  randomWinRuntimeEnabledNow: false,
} as const;

function getMode(modeKey: StreamPremiumGiftLocalEconomyDisclosureModeKey195B): StreamPremiumGiftLocalEconomyDisclosureMode195B {
  return streamPremiumGiftLocalEconomyDisclosureModes195B.find((mode) => mode.key === modeKey) ?? streamPremiumGiftLocalEconomyDisclosureModes195B[0];
}

export function getStreamPremiumGiftLocalEconomyDisclosureInteractionPolish195B(
  assetId: string,
  options: StreamPremiumGiftLocalEconomyDisclosureInteractionPolish195BOptions,
): StreamPremiumGiftLocalEconomyDisclosureInteractionPolish195B {
  const base = getStreamPremiumGiftLocalEconomyDisclosurePolish195A(assetId, options);
  const mode = getMode(options.activeMode);
  const expandedBodyByMode: Record<StreamPremiumGiftLocalEconomyDisclosureModeKey195B, string> = {
    demoPoints: base.demoPointsDisclosureRu,
    giftOnly: base.giftOnlySpendDisclosureRu,
    noCashout: base.noCashoutDisclosureRu,
    officialCreator: base.officialCreatorBoundaryRu,
  };
  return {
    assetId: base.assetId,
    displayNameRu: base.displayNameRu,
    displayName: base.displayName,
    interactionTitleRu: `${base.displayNameRu} · disclosure controls`,
    interactionMetaRu: `${mode.labelRu} · ${streamPremiumGiftLocalEconomyDisclosureInteractionSummary195B.interactionModeCount} modes · local only`,
    activeModeKey: mode.key,
    activeModeLabelRu: mode.labelRu,
    activeModeMetaRu: mode.metaRu,
    activeModeIconRu: mode.iconRu,
    expandedDisclosureTitleRu: `${mode.labelRu} · expanded explanation`,
    expandedDisclosureBodyRu: expandedBodyByMode[mode.key],
    modeRowsRu: [
      `Демо-баллы: ${base.demoPointsDisclosureRu}`,
      `Gift-only: ${base.giftOnlySpendDisclosureRu}`,
      `No cash-out: ${base.noCashoutDisclosureRu}`,
      `Official creator: ${base.officialCreatorBoundaryRu}`,
    ],
    confirmationChecklistRu: [
      "Пользователь видит, что demo-points не имеют денежной стоимости",
      "Пользователь видит, что spending сейчас только gift preview",
      "Обычный пользователь видит no-cashout boundary",
      "Official creator payout указан как future backend/compliance/Admin flow",
      "Нет backend/DB/payment/provider/payout/Wallet mutation в mobile UI",
    ],
    interactionChipsRu: ["tap-to-read", "demo", "gift-only", "no cash-out", "official", "KYC/KYB", "AML", "Admin", "safe-disabled"],
    safetyCopyRu: "195B добавляет только локальные disclosure controls: переключатели объясняют demo-points, gift-only spending, no cash-out и official creator boundary. Реальная отправка, backend/DB, payment/provider/payout и Wallet mutation выключены.",
    userFacingOnly: true,
    localInteractionOnly: true,
    localDisclosureOnly: true,
    demoPointsOnlyNow: true,
    giftOnlySpendingOnlyNow: true,
    cashOutEnabledForRegularUsersNow: false,
    officialCreatorPayoutRuntimeEnabledNow: false,
    realSendRuntimeEnabledNow: false,
    backendRuntimeEnabledNow: false,
    dbReadRuntimeEnabledNow: false,
    dbWriteRuntimeEnabledNow: false,
    paymentRuntimeEnabledNow: false,
    providerRuntimeEnabledNow: false,
    payoutRuntimeEnabledNow: false,
    walletMutationEnabledNow: false,
    actualAnimationPlaybackRuntimeEnabledNow: false,
    actualSoundAutoplayRuntimeEnabledNow: false,
    randomWinRuntimeEnabledNow: false,
  };
}
