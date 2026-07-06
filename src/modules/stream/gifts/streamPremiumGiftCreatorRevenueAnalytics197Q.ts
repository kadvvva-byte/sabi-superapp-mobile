import {
  buildStreamPremiumGiftCreatorRevenueReportBook197P,
  getStreamPremiumGiftCreatorRevenueReport197P,
  streamPremiumGiftCreatorRevenueReportRows197P,
  streamPremiumGiftCreatorRevenueReportSummary197P,
  type StreamGiftCreatorRevenueReportProfile197P,
} from "./streamPremiumGiftCreatorRevenueReports197P";
import { streamGiftMonetizationPolicy197I } from "./streamPremiumGiftSendReceiveWowFxMonetization197I";
import type { StreamGiftShowEngineInput197J } from "./streamPremiumGiftShowEngine197J";

export type StreamGiftCreatorRevenueAnalyticsSegment197Q =
  | "micro_accessible"
  | "premium_growth"
  | "legendary_revenue"
  | "ultra_whale_control"
  | "emperor_compliance_focus";

export type StreamGiftCreatorRevenueAnalyticsStatus197Q =
  | "analytics_preview_pending"
  | "creator_growth_hint_ready"
  | "high_value_watch_visible"
  | "settlement_backend_only_locked";

const DIAMOND_MICROS_197Q = 1_000_000;
const BASIS_POINTS_197Q = 10_000;

function formatDiamondMicros197Q(microsInput: number): string {
  const micros = Math.max(0, Math.trunc(microsInput));
  const whole = Math.trunc(micros / DIAMOND_MICROS_197Q);
  const fraction = Math.trunc((micros % DIAMOND_MICROS_197Q) / 10_000);
  return `${whole}.${String(fraction).padStart(2, "0")} алмаза`;
}

function analyticsSegment197Q(totalDiamonds: number): StreamGiftCreatorRevenueAnalyticsSegment197Q {
  if (totalDiamonds >= 10000) return "emperor_compliance_focus";
  if (totalDiamonds >= 5000) return "ultra_whale_control";
  if (totalDiamonds >= 1000) return "legendary_revenue";
  if (totalDiamonds >= 100) return "premium_growth";
  return "micro_accessible";
}

function analyticsStatus197Q(report: StreamGiftCreatorRevenueReportProfile197P): StreamGiftCreatorRevenueAnalyticsStatus197Q {
  if (report.backendLedgerSettlementRequired) return report.totalDiamonds >= 1000 ? "settlement_backend_only_locked" : "analytics_preview_pending";
  if (report.totalDiamonds >= 5000) return "high_value_watch_visible";
  return "creator_growth_hint_ready";
}

function analyticsScore197Q(report: StreamGiftCreatorRevenueReportProfile197P): number {
  const mathScore = report.exactIntegerMathOnly ? 20 : 0;
  const noFakeScore = report.receiverAvailableBalanceNow ? 0 : 20;
  const settlementScore = report.backendLedgerSettlementRequired ? 18 : 0;
  const valueScore = Math.min(24, Math.trunc(report.totalDiamonds / 420));
  const reportScore = Math.min(18, Math.trunc(report.reportScore / 6));
  return Math.min(100, mathScore + noFakeScore + settlementScore + valueScore + reportScore);
}

function conversionHint197Q(segment: StreamGiftCreatorRevenueAnalyticsSegment197Q, report: StreamGiftCreatorRevenueReportProfile197P): string {
  if (segment === "emperor_compliance_focus") {
    return "Creator insight: emperor gift should trigger calm hero ceremony, visible compliance hold and clear pending balance; never show instant cash-out.";
  }
  if (segment === "ultra_whale_control") {
    return "Creator insight: ultra gift should stay protected in the show queue with dedicated thank-you copy and backend-only settlement labels.";
  }
  if (segment === "legendary_revenue") {
    return "Creator insight: legendary gift is strong revenue signal; show milestone gratitude and keep the pending/fee split readable.";
  }
  if (segment === "premium_growth") {
    return "Creator insight: premium gift can encourage clean combos without spam; keep the overlay compact and settlement text visible.";
  }
  return `Creator insight: accessible gift supports frequent engagement; ${report.quantity}× combo should remain lightweight and never cover the stream.`;
}

export type StreamGiftCreatorRevenueAnalyticsProfile197Q = {
  version: "STREAM-GAME-GIFTS-197Q";
  assetId: string;
  displayNameRu: string;
  diamondPrice: number;
  quantity: number;
  totalDiamonds: number;
  grossDiamondMicros: number;
  receiverPendingDiamondMicros: number;
  platformFeeDiamondMicros: number;
  analyticsSegment: StreamGiftCreatorRevenueAnalyticsSegment197Q;
  analyticsStatus: StreamGiftCreatorRevenueAnalyticsStatus197Q;
  analyticsScore: number;
  analyticsHeadlineRu: string;
  analyticsTopGiftLabelRu: string;
  analyticsHighValueLabelRu: string;
  analyticsPendingMixLabelRu: string;
  analyticsFeeMixLabelRu: string;
  analyticsConversionHintRu: string;
  analyticsSettlementHintRu: string;
  analyticsExactMathLabelRu: string;
  analyticsRowsRu: readonly string[];
  analyticsChipsRu: readonly string[];
  revenueReport: StreamGiftCreatorRevenueReportProfile197P;
  exactIntegerMathOnly: true;
  backendLedgerSettlementRequired: true;
  receiverAvailableBalanceNow: false;
  creatorPayoutRuntimeEnabledNow: false;
  userFacingPreviewOnlyNow: true;
  actualLedgerRuntimeEnabledNow: false;
  actualBalanceMutationRuntimeEnabledNow: false;
  realSendRuntimeEnabledNow: false;
  paymentRuntimeEnabledNow: false;
  providerRuntimeEnabledNow: false;
  walletMutationEnabledNow: false;
  payoutRuntimeEnabledNow: false;
};

export type StreamGiftCreatorRevenueAnalyticsBook197Q = {
  version: "STREAM-GAME-GIFTS-197Q";
  queueItemCount: number;
  visiblePreviewCount: number;
  totalGrossDiamondMicros: number;
  totalReceiverPendingDiamondMicros: number;
  totalPlatformFeeDiamondMicros: number;
  topGiftAssetId: string | null;
  topGiftLabelRu: string;
  analyticsSummaryRu: string;
  displayOrder: readonly StreamGiftCreatorRevenueAnalyticsProfile197Q[];
  analyticsRulesRu: readonly string[];
  exactIntegerMathOnly: true;
  backendLedgerSettlementRequired: true;
  receiverAvailableBalanceNow: false;
  creatorPayoutRuntimeEnabledNow: false;
  userFacingPreviewOnlyNow: true;
  actualLedgerRuntimeEnabledNow: false;
  actualBalanceMutationRuntimeEnabledNow: false;
  realSendRuntimeEnabledNow: false;
  paymentRuntimeEnabledNow: false;
  providerRuntimeEnabledNow: false;
  walletMutationEnabledNow: false;
  payoutRuntimeEnabledNow: false;
};

export function getStreamPremiumGiftCreatorRevenueAnalytics197Q(
  assetId: string,
  quantityInput = 1,
  createdOrder = 0,
  receiverIsOfficialCreator = true,
): StreamGiftCreatorRevenueAnalyticsProfile197Q {
  const revenueReport = getStreamPremiumGiftCreatorRevenueReport197P(assetId, quantityInput, createdOrder, receiverIsOfficialCreator);
  const segment = analyticsSegment197Q(revenueReport.totalDiamonds);
  const status = analyticsStatus197Q(revenueReport);
  const score = analyticsScore197Q(revenueReport);
  const gross = formatDiamondMicros197Q(revenueReport.grossDiamondMicros);
  const pending = formatDiamondMicros197Q(revenueReport.receiverPendingDiamondMicros);
  const fee = formatDiamondMicros197Q(revenueReport.platformFeeDiamondMicros);
  return {
    version: "STREAM-GAME-GIFTS-197Q",
    assetId,
    displayNameRu: revenueReport.displayNameRu,
    diamondPrice: revenueReport.diamondPrice,
    quantity: revenueReport.quantity,
    totalDiamonds: revenueReport.totalDiamonds,
    grossDiamondMicros: revenueReport.grossDiamondMicros,
    receiverPendingDiamondMicros: revenueReport.receiverPendingDiamondMicros,
    platformFeeDiamondMicros: revenueReport.platformFeeDiamondMicros,
    analyticsSegment: segment,
    analyticsStatus: status,
    analyticsScore: score,
    analyticsHeadlineRu: `${revenueReport.displayNameRu}: creator insight · ${segment} · score ${score} · backend settlement required`,
    analyticsTopGiftLabelRu: `Top gift signal: ${revenueReport.displayNameRu} · ${revenueReport.totalDiamonds} diamonds total · quantity ${revenueReport.quantity}×.`,
    analyticsHighValueLabelRu: revenueReport.totalDiamonds >= 1000
      ? `High-value watch: ${gross} gross requires readable hold, compliance copy and protected ceremony lane.`
      : `Accessible engagement: ${gross} gross stays lightweight and should not interrupt premium stream flow.`,
    analyticsPendingMixLabelRu: `Pending mix: ${pending} receiver share (${revenueReport.receiverShareBps / 100}%) remains pending until verified backend ledger settlement.`,
    analyticsFeeMixLabelRu: `Fee mix: ${fee} platform/compliance fee (${revenueReport.platformFeeBps / 100}%) is shown for transparency, not charged by mobile runtime.`,
    analyticsConversionHintRu: conversionHint197Q(segment, revenueReport),
    analyticsSettlementHintRu: "Analytics hint: insights are preview-only; real aggregation, export, available balance and payout must come from backend ledger rows.",
    analyticsExactMathLabelRu: `Exact analytics math: gross=${revenueReport.grossDiamondMicros} diamond_micros; pending=gross*${revenueReport.receiverShareBps}/${BASIS_POINTS_197Q}; fee=gross-pending; no float money mutation.`,
    analyticsRowsRu: [
      `segment: ${segment}`,
      `gross: ${gross}`,
      `pending receiver: ${pending}`,
      `fee: ${fee}`,
      `status: ${status}`,
    ],
    analyticsChipsRu: [
      `segment: ${segment}`,
      `score: ${score}`,
      `diamonds: ${revenueReport.totalDiamonds}`,
      `pending: ${pending}`,
      "available: backend-only",
      "export: backend-only",
    ],
    revenueReport,
    exactIntegerMathOnly: true,
    backendLedgerSettlementRequired: true,
    receiverAvailableBalanceNow: false,
    creatorPayoutRuntimeEnabledNow: false,
    userFacingPreviewOnlyNow: true,
    actualLedgerRuntimeEnabledNow: false,
    actualBalanceMutationRuntimeEnabledNow: false,
    realSendRuntimeEnabledNow: false,
    paymentRuntimeEnabledNow: false,
    providerRuntimeEnabledNow: false,
    walletMutationEnabledNow: false,
    payoutRuntimeEnabledNow: false,
  };
}

export function buildStreamPremiumGiftCreatorRevenueAnalyticsBook197Q(
  items: readonly StreamGiftShowEngineInput197J[],
): StreamGiftCreatorRevenueAnalyticsBook197Q {
  const revenueBook = buildStreamPremiumGiftCreatorRevenueReportBook197P(items);
  const displayOrder = revenueBook.displayOrder.map((item, index) => getStreamPremiumGiftCreatorRevenueAnalytics197Q(
    item.assetId,
    item.quantity,
    index,
    true,
  ));
  const totalGrossDiamondMicros = displayOrder.reduce((sum, item) => sum + item.grossDiamondMicros, 0);
  const totalReceiverPendingDiamondMicros = displayOrder.reduce((sum, item) => sum + item.receiverPendingDiamondMicros, 0);
  const totalPlatformFeeDiamondMicros = displayOrder.reduce((sum, item) => sum + item.platformFeeDiamondMicros, 0);
  const topGift = displayOrder.reduce<StreamGiftCreatorRevenueAnalyticsProfile197Q | null>((current, item) => {
    if (!current) return item;
    if (item.grossDiamondMicros > current.grossDiamondMicros) return item;
    if (item.grossDiamondMicros === current.grossDiamondMicros && item.analyticsScore > current.analyticsScore) return item;
    return current;
  }, null);
  return {
    version: "STREAM-GAME-GIFTS-197Q",
    queueItemCount: revenueBook.queueItemCount,
    visiblePreviewCount: displayOrder.length,
    totalGrossDiamondMicros,
    totalReceiverPendingDiamondMicros,
    totalPlatformFeeDiamondMicros,
    topGiftAssetId: topGift ? topGift.assetId : null,
    topGiftLabelRu: topGift ? `Top analytics gift: ${topGift.displayNameRu} · ${topGift.totalDiamonds} diamonds · ${topGift.analyticsSegment}.` : "Top analytics gift: waiting for local gift preview rows.",
    analyticsSummaryRu: topGift
      ? `Analytics preview: ${displayOrder.length} rows · top ${topGift.displayNameRu} · pending ${formatDiamondMicros197Q(totalReceiverPendingDiamondMicros)} · backend-only aggregation.`
      : "Analytics preview empty: choose gift to see creator insight labels.",
    displayOrder,
    analyticsRulesRu: [
      "analytics is user-facing preview only and must not mutate balance",
      "top gift, pending mix and fee mix use integer diamond_micros math",
      "mobile never performs real aggregation, export, payout, Wallet mutation or provider settlement",
      "available balance remains backend-only after verified ledger settlement",
      "creator insights must stay readable and should not encourage spammy gift overlays",
    ],
    exactIntegerMathOnly: true,
    backendLedgerSettlementRequired: true,
    receiverAvailableBalanceNow: false,
    creatorPayoutRuntimeEnabledNow: false,
    userFacingPreviewOnlyNow: true,
    actualLedgerRuntimeEnabledNow: false,
    actualBalanceMutationRuntimeEnabledNow: false,
    realSendRuntimeEnabledNow: false,
    paymentRuntimeEnabledNow: false,
    providerRuntimeEnabledNow: false,
    walletMutationEnabledNow: false,
    payoutRuntimeEnabledNow: false,
  };
}

export const streamPremiumGiftCreatorRevenueAnalyticsRows197Q: readonly StreamGiftCreatorRevenueAnalyticsProfile197Q[] = streamPremiumGiftCreatorRevenueReportRows197P.map((row, index) => getStreamPremiumGiftCreatorRevenueAnalytics197Q(row.assetId, 1, index, true));

export const streamPremiumGiftCreatorRevenueAnalyticsSummary197Q = {
  version: "STREAM-GAME-GIFTS-197Q",
  totalGiftCount: streamPremiumGiftCreatorRevenueAnalyticsRows197Q.length,
  cumulativeGiftCount: streamPremiumGiftCreatorRevenueReportSummary197P.totalGiftCount,
  receiverShareBps: streamGiftMonetizationPolicy197I.receiverShareBps,
  platformFeeBps: streamGiftMonetizationPolicy197I.platformFeeBps,
  diamondPriceMin: streamGiftMonetizationPolicy197I.giftPriceMinDiamonds,
  diamondPriceMax: streamGiftMonetizationPolicy197I.giftPriceMaxDiamonds,
  minimumTopUpCoins: streamGiftMonetizationPolicy197I.minimumTopUpCoins,
  minimumTopUpUsdCents: streamGiftMonetizationPolicy197I.minimumTopUpUsdCents,
  analyticsInsightsAdded: true,
  topGiftSignalAdded: true,
  highValueWatchAdded: true,
  pendingFeeMixAdded: true,
  conversionHintsAdded: true,
  exactIntegerMathOnly: true,
  backendLedgerSettlementRequired: true,
  receiverAvailableBalanceNow: false,
  creatorPayoutRuntimeEnabledNow: false,
  userFacingPreviewOnlyNow: true,
  actualLedgerRuntimeEnabledNow: false,
  actualBalanceMutationRuntimeEnabledNow: false,
  realSendRuntimeEnabledNow: false,
  paymentRuntimeEnabledNow: false,
  providerRuntimeEnabledNow: false,
  walletMutationEnabledNow: false,
  payoutRuntimeEnabledNow: false,
} as const;
