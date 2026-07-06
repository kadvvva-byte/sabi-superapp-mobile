import {
  buildStreamPremiumGiftCreatorPayoutReadinessBook197O,
  getStreamPremiumGiftCreatorPayoutReadiness197O,
  streamPremiumGiftCreatorPayoutReadinessRows197O,
  streamPremiumGiftCreatorPayoutReadinessSummary197O,
  type StreamGiftCreatorPayoutReadinessProfile197O,
} from "./streamPremiumGiftCreatorPayoutReadiness197O";
import { streamGiftMonetizationPolicy197I } from "./streamPremiumGiftSendReceiveWowFxMonetization197I";
import type { StreamGiftShowEngineInput197J } from "./streamPremiumGiftShowEngine197J";

export type StreamGiftCreatorRevenueReportStatus197P =
  | "daily_preview_pending"
  | "monthly_statement_preview_ready"
  | "compliance_hold_visible"
  | "backend_export_locked";

export type StreamGiftCreatorRevenueReportExportGate197P =
  | "backend_ledger_rows_required"
  | "creator_identity_required"
  | "tax_profile_required"
  | "admin_statement_approval_required"
  | "provider_settlement_required"
  | "mobile_export_preview_only";

const DIAMOND_MICROS_197P = 1_000_000;
const DOLLAR_DIAMOND_MICROS_197P = 100 * DIAMOND_MICROS_197P;
const BASIS_POINTS_197P = 10_000;

function formatDiamondMicros197P(microsInput: number): string {
  const micros = Math.max(0, Math.trunc(microsInput));
  const whole = Math.trunc(micros / DIAMOND_MICROS_197P);
  const fraction = Math.trunc((micros % DIAMOND_MICROS_197P) / 10_000);
  return `${whole}.${String(fraction).padStart(2, "0")} алмаза`;
}

function formatDollarPreview197P(diamondMicrosInput: number): string {
  const diamondMicros = Math.max(0, Math.trunc(diamondMicrosInput));
  const dollarMicros = Math.trunc((diamondMicros * 1_000_000) / DOLLAR_DIAMOND_MICROS_197P);
  const whole = Math.trunc(dollarMicros / 1_000_000);
  const fraction = dollarMicros % 1_000_000;
  return `$${whole}.${String(fraction).padStart(6, "0")}`;
}

function reportStatus197P(profile: StreamGiftCreatorPayoutReadinessProfile197O): StreamGiftCreatorRevenueReportStatus197P {
  if (profile.readinessStatus === "creator_compliance_review_required") return "compliance_hold_visible";
  if (profile.totalDiamonds >= 1000) return "monthly_statement_preview_ready";
  if (profile.readinessStatus === "payout_backend_only_locked") return "backend_export_locked";
  return "daily_preview_pending";
}

function reportExportGates197P(profile: StreamGiftCreatorPayoutReadinessProfile197O): readonly StreamGiftCreatorRevenueReportExportGate197P[] {
  const gates: StreamGiftCreatorRevenueReportExportGate197P[] = [
    "backend_ledger_rows_required",
    "provider_settlement_required",
    "mobile_export_preview_only",
  ];
  if (profile.totalDiamonds >= 1000) {
    gates.push("creator_identity_required", "tax_profile_required", "admin_statement_approval_required");
  } else {
    gates.push("creator_identity_required");
  }
  return gates;
}

function reportScore197P(profile: StreamGiftCreatorPayoutReadinessProfile197O): number {
  const mathScore = profile.exactIntegerMathOnly ? 20 : 0;
  const noFakeScore = profile.receiverAvailableBalanceNow ? 0 : 20;
  const ledgerScore = profile.backendLedgerSettlementRequired ? 18 : 0;
  const payoutLockScore = profile.creatorPayoutRuntimeEnabledNow ? 0 : 18;
  const readinessScore = Math.min(24, Math.max(0, Math.trunc(profile.readinessScore / 5)));
  return Math.min(100, mathScore + noFakeScore + ledgerScore + payoutLockScore + readinessScore);
}

export type StreamGiftCreatorRevenueReportProfile197P = {
  version: "STREAM-GAME-GIFTS-197P";
  assetId: string;
  displayNameRu: string;
  diamondPrice: number;
  quantity: number;
  totalDiamonds: number;
  grossDiamondMicros: number;
  receiverPendingDiamondMicros: number;
  platformFeeDiamondMicros: number;
  heldForSettlementDiamondMicros: number;
  projectedAvailableAfterSettlementDiamondMicros: number;
  receiverShareBps: number;
  platformFeeBps: number;
  reportStatus: StreamGiftCreatorRevenueReportStatus197P;
  exportGates: readonly StreamGiftCreatorRevenueReportExportGate197P[];
  reportScore: number;
  reportHeadlineRu: string;
  reportGrossLabelRu: string;
  reportPendingLabelRu: string;
  reportFeeLabelRu: string;
  reportHoldLabelRu: string;
  reportExportLabelRu: string;
  reportSettlementLabelRu: string;
  reportComplianceLabelRu: string;
  reportExactMathLabelRu: string;
  reportRowsRu: readonly string[];
  reportChipsRu: readonly string[];
  payoutReadiness: StreamGiftCreatorPayoutReadinessProfile197O;
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

export type StreamGiftCreatorRevenueReportBook197P = {
  version: "STREAM-GAME-GIFTS-197P";
  queueItemCount: number;
  visiblePreviewCount: number;
  totalGrossDiamondMicros: number;
  totalReceiverPendingDiamondMicros: number;
  totalPlatformFeeDiamondMicros: number;
  totalHeldForSettlementDiamondMicros: number;
  reportSummaryRu: string;
  displayOrder: readonly StreamGiftCreatorRevenueReportProfile197P[];
  reportRulesRu: readonly string[];
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

export function getStreamPremiumGiftCreatorRevenueReport197P(
  assetId: string,
  quantityInput = 1,
  createdOrder = 0,
  receiverIsOfficialCreator = true,
): StreamGiftCreatorRevenueReportProfile197P {
  const payoutReadiness = getStreamPremiumGiftCreatorPayoutReadiness197O(assetId, quantityInput, createdOrder, receiverIsOfficialCreator);
  const status = reportStatus197P(payoutReadiness);
  const gates = reportExportGates197P(payoutReadiness);
  const score = reportScore197P(payoutReadiness);
  const grossDiamond = formatDiamondMicros197P(payoutReadiness.senderGrossDiamondMicros);
  const pendingDiamond = formatDiamondMicros197P(payoutReadiness.receiverPendingDiamondMicros);
  const feeDiamond = formatDiamondMicros197P(payoutReadiness.platformFeeDiamondMicros);
  const heldDiamond = formatDiamondMicros197P(payoutReadiness.receiverPendingDiamondMicros);
  const grossDollar = formatDollarPreview197P(payoutReadiness.senderGrossDiamondMicros);
  const pendingDollar = formatDollarPreview197P(payoutReadiness.receiverPendingDiamondMicros);
  const feeDollar = formatDollarPreview197P(payoutReadiness.platformFeeDiamondMicros);
  const gateText = gates.join(" · ");
  return {
    version: "STREAM-GAME-GIFTS-197P",
    assetId,
    displayNameRu: payoutReadiness.displayNameRu,
    diamondPrice: payoutReadiness.diamondPrice,
    quantity: payoutReadiness.quantity,
    totalDiamonds: payoutReadiness.totalDiamonds,
    grossDiamondMicros: payoutReadiness.senderGrossDiamondMicros,
    receiverPendingDiamondMicros: payoutReadiness.receiverPendingDiamondMicros,
    platformFeeDiamondMicros: payoutReadiness.platformFeeDiamondMicros,
    heldForSettlementDiamondMicros: payoutReadiness.receiverPendingDiamondMicros,
    projectedAvailableAfterSettlementDiamondMicros: payoutReadiness.projectedAvailableAfterSettlementDiamondMicros,
    receiverShareBps: payoutReadiness.receiverShareBps,
    platformFeeBps: payoutReadiness.platformFeeBps,
    reportStatus: status,
    exportGates: gates,
    reportScore: score,
    reportHeadlineRu: `${payoutReadiness.displayNameRu}: creator revenue report · ${status} · export backend-only`,
    reportGrossLabelRu: `Report gross: ${grossDiamond} (${grossDollar}) · gift value before receiver share and fee.`,
    reportPendingLabelRu: `Report pending: ${pendingDiamond} (${pendingDollar}) · ${payoutReadiness.receiverShareBps / 100}% receiver share · not available yet.`,
    reportFeeLabelRu: `Report fee: ${feeDiamond} (${feeDollar}) · ${payoutReadiness.platformFeeBps / 100}% platform/compliance fee.`,
    reportHoldLabelRu: `Report hold: ${heldDiamond} stays pending/held until backend ledger, risk/tax/compliance and provider settlement complete.`,
    reportExportLabelRu: `Export gates: ${gateText}. Mobile shows preview labels only; real CSV/PDF export must use backend ledger rows.`,
    reportSettlementLabelRu: "Settlement report: pending gift row → verified ledger row → provider settlement → tax/compliance review → backend available unlock only.",
    reportComplianceLabelRu: receiverIsOfficialCreator
      ? "Compliance report: official creator statement requires identity, KYC/KYB/AML, tax profile, admin approval and payout schedule."
      : "Compliance report: regular receiver remains spend-only; no cash-out/export payout report is shown.",
    reportExactMathLabelRu: `Exact report math: gross=${payoutReadiness.senderGrossDiamondMicros} diamond_micros; pending=gross*${payoutReadiness.receiverShareBps}/${BASIS_POINTS_197P}; fee=gross-pending; available=backend-only.`,
    reportRowsRu: [
      `gross row: ${grossDiamond} (${grossDollar})`,
      `receiver pending row: ${pendingDiamond} (${pendingDollar})`,
      `platform/compliance fee row: ${feeDiamond} (${feeDollar})`,
      `settlement hold row: ${heldDiamond} · backend-only available unlock`,
    ],
    reportChipsRu: [
      `status: ${status}`,
      `score: ${score}`,
      `pending: ${pendingDiamond}`,
      `fee: ${feeDiamond}`,
      `gates: ${gates.length}`,
      "export: backend-only",
    ],
    payoutReadiness,
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

export function buildStreamPremiumGiftCreatorRevenueReportBook197P(
  items: readonly StreamGiftShowEngineInput197J[],
): StreamGiftCreatorRevenueReportBook197P {
  const payoutBook = buildStreamPremiumGiftCreatorPayoutReadinessBook197O(items);
  const displayOrder = payoutBook.displayOrder.map((item, index) => getStreamPremiumGiftCreatorRevenueReport197P(
    item.assetId,
    item.quantity,
    index,
    true,
  ));
  const totalGrossDiamondMicros = displayOrder.reduce((sum, item) => sum + item.grossDiamondMicros, 0);
  const totalReceiverPendingDiamondMicros = displayOrder.reduce((sum, item) => sum + item.receiverPendingDiamondMicros, 0);
  const totalPlatformFeeDiamondMicros = displayOrder.reduce((sum, item) => sum + item.platformFeeDiamondMicros, 0);
  const totalHeldForSettlementDiamondMicros = displayOrder.reduce((sum, item) => sum + item.heldForSettlementDiamondMicros, 0);
  const first = displayOrder[0];
  return {
    version: "STREAM-GAME-GIFTS-197P",
    queueItemCount: payoutBook.queueItemCount,
    visiblePreviewCount: displayOrder.length,
    totalGrossDiamondMicros,
    totalReceiverPendingDiamondMicros,
    totalPlatformFeeDiamondMicros,
    totalHeldForSettlementDiamondMicros,
    reportSummaryRu: first
      ? `Revenue report: first ${first.displayNameRu} · pending ${formatDiamondMicros197P(first.receiverPendingDiamondMicros)} · export backend-only.`
      : "Revenue report empty: waiting for verified gift ledger preview rows.",
    displayOrder,
    reportRulesRu: [
      "creator revenue reports are user-facing preview only until backend ledger rows exist",
      "gross, pending, fee and hold values use integer diamond_micros math",
      "mobile never creates available balance, payout, CSV/PDF export or provider settlement",
      "official creator compliance and tax gates are visible before payout readiness",
      "regular receivers must never see fake cash-out or available money reports",
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

export const streamPremiumGiftCreatorRevenueReportRows197P: readonly StreamGiftCreatorRevenueReportProfile197P[] = streamPremiumGiftCreatorPayoutReadinessRows197O.map((row, index) => getStreamPremiumGiftCreatorRevenueReport197P(row.assetId, 1, index, true));

export const streamPremiumGiftCreatorRevenueReportSummary197P = {
  version: "STREAM-GAME-GIFTS-197P",
  totalGiftCount: streamPremiumGiftCreatorRevenueReportRows197P.length,
  cumulativeGiftCount: streamPremiumGiftCreatorPayoutReadinessSummary197O.totalGiftCount,
  receiverShareBps: streamGiftMonetizationPolicy197I.receiverShareBps,
  platformFeeBps: streamGiftMonetizationPolicy197I.platformFeeBps,
  diamondPriceMin: streamGiftMonetizationPolicy197I.giftPriceMinDiamonds,
  diamondPriceMax: streamGiftMonetizationPolicy197I.giftPriceMaxDiamonds,
  minimumTopUpCoins: streamGiftMonetizationPolicy197I.minimumTopUpCoins,
  minimumTopUpUsdCents: streamGiftMonetizationPolicy197I.minimumTopUpUsdCents,
  creatorRevenueReportsAdded: true,
  monthlyStatementPreviewAdded: true,
  exportBackendOnlyLabelsAdded: true,
  taxComplianceReportLabelsAdded: true,
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
