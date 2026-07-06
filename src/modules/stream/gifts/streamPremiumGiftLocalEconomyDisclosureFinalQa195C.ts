import {
  streamPremiumGiftLocalEconomyDisclosureRows195A,
  streamPremiumGiftLocalEconomyDisclosureSummary195A,
} from "./streamPremiumGiftLocalEconomyDisclosurePolish195A";
import {
  streamPremiumGiftLocalEconomyDisclosureInteractionModes195B,
  streamPremiumGiftLocalEconomyDisclosureInteractionRows195B,
  streamPremiumGiftLocalEconomyDisclosureInteractionSummary195B,
  type StreamPremiumGiftLocalEconomyDisclosureMode195B,
  type StreamPremiumGiftLocalEconomyDisclosureModeKey195B,
} from "./streamPremiumGiftLocalEconomyDisclosureInteractionPolish195B";

export type StreamPremiumGiftLocalEconomyDisclosureFinalQa195COptions = {
  activeMode: StreamPremiumGiftLocalEconomyDisclosureModeKey195B;
};

export type StreamPremiumGiftLocalEconomyDisclosureFinalQa195C = {
  assetId: string;
  displayNameRu: string;
  displayName: string;
  qaTitleRu: string;
  qaMetaRu: string;
  activeModeLabelRu: string;
  activeModeMetaRu: string;
  activeModeIconRu: string;
  qaStatusRu: string;
  qaRowsRu: readonly string[];
  qaChecklistRu: readonly string[];
  qaChipsRu: readonly string[];
  safetyCopyRu: string;
  userFacingOnly: true;
  finalQaOnly: true;
  localDisclosureOnly: true;
  localInteractionOnly: true;
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

export const streamPremiumGiftLocalEconomyDisclosureFinalQaRows195C = streamPremiumGiftLocalEconomyDisclosureInteractionRows195B.map((gift) => ({
  assetId: gift.assetId,
  displayNameRu: gift.displayNameRu,
  displayName: gift.displayName,
  localDisclosureReady: true as const,
  interactionDisclosureReady: gift.disclosureInteractionReady,
  demoPointsReady: gift.demoPointsModeReady,
  giftOnlySpendingReady: gift.giftOnlyModeReady,
  noCashoutReady: gift.noCashoutModeReady,
  officialCreatorBoundaryReady: gift.officialCreatorModeReady,
  finalQaReady: true as const,
  userFacingOnly: true as const,
  finalQaOnly: true as const,
  localDisclosureOnly: true as const,
  localInteractionOnly: true as const,
  realSendRuntimeEnabledNow: false as const,
  backendRuntimeEnabledNow: false as const,
  dbReadRuntimeEnabledNow: false as const,
  dbWriteRuntimeEnabledNow: false as const,
  paymentRuntimeEnabledNow: false as const,
  providerRuntimeEnabledNow: false as const,
  payoutRuntimeEnabledNow: false as const,
  walletMutationEnabledNow: false as const,
}));

export const streamPremiumGiftLocalEconomyDisclosureFinalQaSummary195C = {
  version: "STREAM-GAME-GIFTS-195C",
  giftCount: streamPremiumGiftLocalEconomyDisclosureFinalQaRows195C.length,
  totalCatalogGifts: streamPremiumGiftLocalEconomyDisclosureSummary195A.giftCount,
  localDisclosureCoverage: streamPremiumGiftLocalEconomyDisclosureFinalQaRows195C.filter((row) => row.localDisclosureReady).length,
  interactionDisclosureCoverage: streamPremiumGiftLocalEconomyDisclosureFinalQaRows195C.filter((row) => row.interactionDisclosureReady).length,
  demoPointsCoverage: streamPremiumGiftLocalEconomyDisclosureFinalQaRows195C.filter((row) => row.demoPointsReady).length,
  giftOnlySpendingCoverage: streamPremiumGiftLocalEconomyDisclosureFinalQaRows195C.filter((row) => row.giftOnlySpendingReady).length,
  noCashoutCoverage: streamPremiumGiftLocalEconomyDisclosureFinalQaRows195C.filter((row) => row.noCashoutReady).length,
  officialCreatorBoundaryCoverage: streamPremiumGiftLocalEconomyDisclosureFinalQaRows195C.filter((row) => row.officialCreatorBoundaryReady).length,
  finalQaCoverage: streamPremiumGiftLocalEconomyDisclosureFinalQaRows195C.filter((row) => row.finalQaReady).length,
  interactionModeCount: streamPremiumGiftLocalEconomyDisclosureInteractionSummary195B.interactionModeCount,
  userFacingOnly: true,
  finalQaOnly: true,
  localDisclosureOnly: true,
  localInteractionOnly: true,
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
  return streamPremiumGiftLocalEconomyDisclosureInteractionModes195B.find((mode) => mode.key === modeKey) ?? streamPremiumGiftLocalEconomyDisclosureInteractionModes195B[0];
}

export function getStreamPremiumGiftLocalEconomyDisclosureFinalQa195C(
  assetId: string,
  options: StreamPremiumGiftLocalEconomyDisclosureFinalQa195COptions,
): StreamPremiumGiftLocalEconomyDisclosureFinalQa195C {
  const row = streamPremiumGiftLocalEconomyDisclosureFinalQaRows195C.find((item) => item.assetId === assetId) ?? streamPremiumGiftLocalEconomyDisclosureFinalQaRows195C[0];
  const mode = getMode(options.activeMode);
  return {
    assetId: row.assetId,
    displayNameRu: row.displayNameRu,
    displayName: row.displayName,
    qaTitleRu: `${row.displayNameRu} · финальная проверка экономики`,
    qaMetaRu: `${streamPremiumGiftLocalEconomyDisclosureFinalQaSummary195C.giftCount} gifts · ${mode.labelRu} · final QA`,
    activeModeLabelRu: mode.labelRu,
    activeModeMetaRu: mode.metaRu,
    activeModeIconRu: mode.iconRu,
    qaStatusRu: "195A/195B disclosure QA passed",
    qaRowsRu: [
      "Demo-points disclosure: local entertainment only, no money value, no deposit, no cash-out",
      "Gift-only spending disclosure: demo winnings can only be explained as virtual gifts preview",
      "Regular user boundary: no cash-out from games, gifts, demo points, receipt, or history preview",
      "Official creator boundary: future payout requires agreement, KYC/KYB/AML, tax/fraud checks and Admin approval",
      "Runtime boundary: no backend/DB read-write, no payment/provider/payout and no Wallet mutation in mobile UI",
    ],
    qaChecklistRu: [
      "195A base disclosure exists for this gift",
      "195B interaction disclosure modes exist for this gift",
      "All four modes are covered: demo-points, gift-only, no cash-out, official creator",
      "No fake money movement and no fake payout success copy is allowed",
      "Final QA remains user-facing only and local-preview only",
    ],
    qaChipsRu: ["195A", "195B", "32 gifts", "demo-points", "gift-only", "no cash-out", "official boundary", "safe-disabled", "final QA"],
    safetyCopyRu: "195C финально проверяет economy disclosures: demo-points не являются деньгами, обычные пользователи не выводят средства, gift-only spending остаётся virtual gift preview, а future payout возможен только для official creators через backend/compliance/Admin gates. Сейчас real send, backend/DB, payment/provider/payout и Wallet mutation выключены.",
    userFacingOnly: true,
    finalQaOnly: true,
    localDisclosureOnly: true,
    localInteractionOnly: true,
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
