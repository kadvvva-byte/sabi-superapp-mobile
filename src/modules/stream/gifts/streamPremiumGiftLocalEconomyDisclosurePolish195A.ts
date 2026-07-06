import {
  getStreamPremiumGiftCatalogFinalQa192C,
  streamPremiumGiftCatalogFinalQaRows192C,
  streamPremiumGiftCatalogFinalQaSummary192C,
} from "./streamPremiumGiftCatalogFinalQa192C";

export type StreamPremiumGiftLocalEconomyDisclosurePolish195AOptions = {
  quantity: number;
  recipientLabel: string;
  recipientMeta: string;
  moodLabel: string;
  moodNote: string;
  draftCount: number;
  preparedQuantityTotal: number;
};

export type StreamPremiumGiftLocalEconomyDisclosurePolish195A = {
  assetId: string;
  displayNameRu: string;
  displayName: string;
  disclosureTitleRu: string;
  disclosureMetaRu: string;
  demoPointsDisclosureRu: string;
  giftOnlySpendDisclosureRu: string;
  noCashoutDisclosureRu: string;
  officialCreatorBoundaryRu: string;
  regularUserBoundaryRu: string;
  payoutBoundaryRu: string;
  quantityBoundaryRu: string;
  recipientBoundaryRu: string;
  disclosureRowsRu: readonly string[];
  disclosureChecklistRu: readonly string[];
  disclosureChipsRu: readonly string[];
  safetyCopyRu: string;
  userFacingOnly: true;
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

export const streamPremiumGiftLocalEconomyDisclosureRows195A = streamPremiumGiftCatalogFinalQaRows192C.map((gift) => ({
  assetId: gift.assetId,
  displayNameRu: gift.displayNameRu,
  displayName: gift.displayName,
  catalogQaReady: true as const,
  demoPointsDisclosureReady: true as const,
  giftOnlySpendDisclosureReady: true as const,
  noCashoutDisclosureReady: true as const,
  officialCreatorBoundaryReady: true as const,
  regularUserBoundaryReady: true as const,
  userFacingOnly: true as const,
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

export const streamPremiumGiftLocalEconomyDisclosureSummary195A = {
  version: "STREAM-GAME-GIFTS-195A",
  giftCount: streamPremiumGiftLocalEconomyDisclosureRows195A.length,
  totalCatalogGifts: streamPremiumGiftCatalogFinalQaSummary192C.giftCount,
  demoPointsDisclosureCoverage: streamPremiumGiftLocalEconomyDisclosureRows195A.filter((row) => row.demoPointsDisclosureReady).length,
  giftOnlySpendDisclosureCoverage: streamPremiumGiftLocalEconomyDisclosureRows195A.filter((row) => row.giftOnlySpendDisclosureReady).length,
  noCashoutDisclosureCoverage: streamPremiumGiftLocalEconomyDisclosureRows195A.filter((row) => row.noCashoutDisclosureReady).length,
  officialCreatorBoundaryCoverage: streamPremiumGiftLocalEconomyDisclosureRows195A.filter((row) => row.officialCreatorBoundaryReady).length,
  regularUserBoundaryCoverage: streamPremiumGiftLocalEconomyDisclosureRows195A.filter((row) => row.regularUserBoundaryReady).length,
  userFacingOnly: true,
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

export function getStreamPremiumGiftLocalEconomyDisclosurePolish195A(
  assetId: string,
  options: StreamPremiumGiftLocalEconomyDisclosurePolish195AOptions,
): StreamPremiumGiftLocalEconomyDisclosurePolish195A {
  const gift = getStreamPremiumGiftCatalogFinalQa192C(assetId);
  const safeQuantity = Math.max(1, Math.min(99, Math.trunc(options.quantity || 1)));
  return {
    assetId: gift.assetId,
    displayNameRu: gift.displayNameRu,
    displayName: gift.displayName,
    disclosureTitleRu: `${gift.displayNameRu} · экономика подарка`,
    disclosureMetaRu: `Demo-points + gift-only spending · ${streamPremiumGiftLocalEconomyDisclosureSummary195A.giftCount} gifts`,
    demoPointsDisclosureRu: "Игровые демо-баллы используются только как локальный entertainment preview и не являются деньгами.",
    giftOnlySpendDisclosureRu: "Демо-выигрыш можно показывать только как gift-only spending: купить/отправить виртуальный подарок в preview.",
    noCashoutDisclosureRu: "Обычный пользователь не может вывести демо-баллы, подарок или выигрыш в деньги.",
    officialCreatorBoundaryRu: "Будущий cash-out возможен только для official verified creator/streamer после договора, KYC/KYB/AML, tax/fraud checks и Admin approval.",
    regularUserBoundaryRu: `${options.recipientLabel} · ${options.recipientMeta} · regular users stay no-cashout`,
    payoutBoundaryRu: "Creator payout boundary is disclosure-only here: no payout runtime, no provider, no Wallet mutation.",
    quantityBoundaryRu: `${safeQuantity}× preview · prepared total ${options.preparedQuantityTotal} · draft count ${options.draftCount}`,
    recipientBoundaryRu: `${options.moodLabel} · ${options.moodNote} · recipient line is local preview only`,
    disclosureRowsRu: [
      "Demo-points: no deposit, no cash-out, no real-money value",
      "Gift-only spending: preview explains that demo winnings can only become virtual gifts",
      "Regular users: never cash-out from games or gifts",
      "Official creators: future payout requires agreement + KYC/KYB/AML + Admin approval",
      "Current mobile state: no backend, no payment, no provider, no Wallet mutation",
    ],
    disclosureChecklistRu: [
      "No fake money movement and no fake payout success",
      "No real send while backend gift intent is not enabled",
      "No provider call and no payment runtime in mobile UI",
      "No DB read/write and no server receipt creation in this preview",
    ],
    disclosureChipsRu: ["demo-points", "gift-only", "no cash-out", "official only", "KYC/KYB", "AML", "Admin gate", "safe"],
    safetyCopyRu: "195A объясняет локальную экономику подарков: демо-баллы не деньги, обычный пользователь не выводит средства, будущие выплаты только official creators через compliance/Admin/backend gates. Сейчас runtime оплаты, backend, provider, payout и Wallet mutation выключены.",
    userFacingOnly: true,
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
