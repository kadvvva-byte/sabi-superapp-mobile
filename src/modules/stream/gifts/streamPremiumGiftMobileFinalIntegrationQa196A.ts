import {
  streamPremiumGiftLivePreviewFinalQaRows191D,
  streamPremiumGiftLivePreviewFinalQaSummary191D,
} from "./streamPremiumGiftLivePreviewFinalQa191D";
import {
  streamPremiumGiftCatalogFinalQaRows192C,
  streamPremiumGiftCatalogFinalQaSummary192C,
} from "./streamPremiumGiftCatalogFinalQa192C";
import {
  streamPremiumGiftSendComposerFinalQaBaseRows193C,
  streamPremiumGiftSendComposerFinalQaSummary193C,
} from "./streamPremiumGiftSendComposerFinalQa193C";
import {
  streamPremiumGiftReceiptHistoryFinalHandoffRows194D,
  streamPremiumGiftReceiptHistoryFinalHandoffSummary194D,
} from "./streamPremiumGiftReceiptHistoryFinalHandoff194D";
import {
  streamPremiumGiftLocalEconomyDisclosureFinalHandoffRows195D,
  streamPremiumGiftLocalEconomyDisclosureFinalHandoffSummary195D,
} from "./streamPremiumGiftLocalEconomyDisclosureFinalHandoff195D";

export type StreamPremiumGiftMobileFinalIntegrationQa196A = {
  assetId: string;
  displayNameRu: string;
  displayName: string;
  integrationTitleRu: string;
  integrationMetaRu: string;
  qaStatusRu: string;
  catalogReady: boolean;
  livePreviewReady: boolean;
  sendComposerReady: boolean;
  receiptHistoryReady: boolean;
  economyDisclosureReady: boolean;
  integratedCoverageCount: number;
  qaRowsRu: readonly string[];
  qaChecklistRu: readonly string[];
  qaChipsRu: readonly string[];
  safetyCopyRu: string;
  userFacingOnly: true;
  finalIntegrationQaOnly: true;
  sourceRuntimeChangedNow: false;
  realSendRuntimeEnabledNow: false;
  backendRuntimeEnabledNow: false;
  dbReadRuntimeEnabledNow: false;
  dbWriteRuntimeEnabledNow: false;
  paymentRuntimeEnabledNow: false;
  providerRuntimeEnabledNow: false;
  payoutRuntimeEnabledNow: false;
  walletMutationEnabledNow: false;
  actualAnimationPlaybackRuntimeEnabledNow: false;
  actualMediaPlaybackRuntimeEnabledNow: false;
  actualSoundAutoplayRuntimeEnabledNow: false;
  randomWinRuntimeEnabledNow: false;
};

const catalogByAssetId196A = new Map(streamPremiumGiftCatalogFinalQaRows192C.map((row) => [row.assetId, row] as const));
const livePreviewByAssetId196A = new Map(streamPremiumGiftLivePreviewFinalQaRows191D.map((row) => [row.assetId, row] as const));
const composerByAssetId196A = new Map(streamPremiumGiftSendComposerFinalQaBaseRows193C.map((row) => [row.assetId, row] as const));
const receiptHistoryByAssetId196A = new Map(streamPremiumGiftReceiptHistoryFinalHandoffRows194D.map((row) => [row.assetId, row] as const));

export const streamPremiumGiftMobileFinalIntegrationQaRows196A: readonly StreamPremiumGiftMobileFinalIntegrationQa196A[] = streamPremiumGiftLocalEconomyDisclosureFinalHandoffRows195D.map((gift) => {
  const catalog = catalogByAssetId196A.get(gift.assetId);
  const livePreview = livePreviewByAssetId196A.get(gift.assetId);
  const composer = composerByAssetId196A.get(gift.assetId);
  const receiptHistory = receiptHistoryByAssetId196A.get(gift.assetId);
  const catalogReady = Boolean(catalog);
  const livePreviewReady = Boolean(livePreview);
  const sendComposerReady = Boolean(composer);
  const receiptHistoryReady = Boolean(receiptHistory);
  const economyDisclosureReady = gift.finalHandoffReady;
  const integratedCoverageCount = [catalogReady, livePreviewReady, sendComposerReady, receiptHistoryReady, economyDisclosureReady].filter(Boolean).length;
  return {
    assetId: gift.assetId,
    displayNameRu: gift.displayNameRu,
    displayName: gift.displayName,
    integrationTitleRu: `${gift.displayNameRu} · mobile gift integration QA`,
    integrationMetaRu: `${integratedCoverageCount}/5 blocks · catalog + preview + composer + history + economy`,
    qaStatusRu: integratedCoverageCount === 5 ? "196A integration QA passed" : "196A integration QA needs review",
    catalogReady,
    livePreviewReady,
    sendComposerReady,
    receiptHistoryReady,
    economyDisclosureReady,
    integratedCoverageCount,
    qaRowsRu: [
      `Catalog 192C: ${catalogReady ? "ready" : "missing"}`,
      `Live preview 191D: ${livePreviewReady ? "ready" : "missing"}`,
      `Composer 193C: ${sendComposerReady ? "ready" : "missing"}`,
      `Receipt/history 194D: ${receiptHistoryReady ? "ready" : "missing"}`,
      `Economy disclosure 195D: ${economyDisclosureReady ? "ready" : "missing"}`,
    ],
    qaChecklistRu: [
      "32 gifts remain visible through the final catalog",
      "Local preview shell/overlay/controls remain preview-only",
      "Composer remains local draft/confirm-gate preview only",
      "Receipt/history remains local preview with no DB read/write",
      "Economy disclosures keep demo-points, gift-only spending and no-cashout copy visible",
      "No real send, backend/payment/provider/payout, Wallet mutation, autoplay, media playback or random win runtime is enabled",
    ],
    qaChipsRu: ["196A", "32 gifts", "catalog", "preview", "composer", "history", "economy", "safe-disabled", "mobile QA"],
    safetyCopyRu: "196A объединяет mobile gift UI QA only: catalog, live preview, composer, receipt/history and economy disclosures are local/user-facing. Real send, backend/DB read-write, payment/provider/payout, Wallet mutation, media playback, sound autoplay and random win runtime remain disabled.",
    userFacingOnly: true,
    finalIntegrationQaOnly: true,
    sourceRuntimeChangedNow: false,
    realSendRuntimeEnabledNow: false,
    backendRuntimeEnabledNow: false,
    dbReadRuntimeEnabledNow: false,
    dbWriteRuntimeEnabledNow: false,
    paymentRuntimeEnabledNow: false,
    providerRuntimeEnabledNow: false,
    payoutRuntimeEnabledNow: false,
    walletMutationEnabledNow: false,
    actualAnimationPlaybackRuntimeEnabledNow: false,
    actualMediaPlaybackRuntimeEnabledNow: false,
    actualSoundAutoplayRuntimeEnabledNow: false,
    randomWinRuntimeEnabledNow: false,
  };
});

export const streamPremiumGiftMobileFinalIntegrationQaSummary196A = {
  version: "STREAM-GAME-GIFTS-196A",
  status: "mobile_final_integration_qa_passed_user_facing_only",
  giftCount: streamPremiumGiftMobileFinalIntegrationQaRows196A.length,
  catalogCoverage: streamPremiumGiftMobileFinalIntegrationQaRows196A.filter((row) => row.catalogReady).length,
  livePreviewCoverage: streamPremiumGiftMobileFinalIntegrationQaRows196A.filter((row) => row.livePreviewReady).length,
  sendComposerCoverage: streamPremiumGiftMobileFinalIntegrationQaRows196A.filter((row) => row.sendComposerReady).length,
  receiptHistoryCoverage: streamPremiumGiftMobileFinalIntegrationQaRows196A.filter((row) => row.receiptHistoryReady).length,
  economyDisclosureCoverage: streamPremiumGiftMobileFinalIntegrationQaRows196A.filter((row) => row.economyDisclosureReady).length,
  finalIntegrationQaCoverage: streamPremiumGiftMobileFinalIntegrationQaRows196A.filter((row) => row.integratedCoverageCount === 5).length,
  catalogSummaryGiftCount: streamPremiumGiftCatalogFinalQaSummary192C.giftCount,
  livePreviewSummaryGiftCount: streamPremiumGiftLivePreviewFinalQaSummary191D.giftCount,
  sendComposerSummaryGiftCount: streamPremiumGiftSendComposerFinalQaSummary193C.giftCount,
  receiptHistorySummaryGiftCount: streamPremiumGiftReceiptHistoryFinalHandoffSummary194D.giftCount,
  economyDisclosureSummaryGiftCount: streamPremiumGiftLocalEconomyDisclosureFinalHandoffSummary195D.giftCount,
  userFacingOnly: true,
  finalIntegrationQaOnly: true,
  catalogClosed: true,
  livePreviewClosed: true,
  composerClosed: true,
  receiptHistoryClosed: true,
  economyDisclosureClosed: true,
  realSendRuntimeEnabledNow: false,
  backendRuntimeEnabledNow: false,
  dbReadRuntimeEnabledNow: false,
  dbWriteRuntimeEnabledNow: false,
  paymentRuntimeEnabledNow: false,
  providerRuntimeEnabledNow: false,
  payoutRuntimeEnabledNow: false,
  walletMutationEnabledNow: false,
  actualAnimationPlaybackRuntimeEnabledNow: false,
  actualMediaPlaybackRuntimeEnabledNow: false,
  actualSoundAutoplayRuntimeEnabledNow: false,
  randomWinRuntimeEnabledNow: false,
} as const;

export function getStreamPremiumGiftMobileFinalIntegrationQa196A(assetId: string): StreamPremiumGiftMobileFinalIntegrationQa196A {
  return streamPremiumGiftMobileFinalIntegrationQaRows196A.find((row) => row.assetId === assetId) ?? streamPremiumGiftMobileFinalIntegrationQaRows196A[0];
}
