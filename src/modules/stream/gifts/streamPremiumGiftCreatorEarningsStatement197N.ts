import {
  buildStreamPremiumGiftReceiverBalanceLedgerBook197M,
  getStreamPremiumGiftReceiverBalanceLedger197M,
  streamPremiumGiftReceiverBalanceLedgerRows197M,
  streamPremiumGiftReceiverBalanceLedgerSummary197M,
  type StreamGiftReceiverBalanceLedgerProfile197M,
} from "./streamPremiumGiftReceiverBalanceLedger197M";
import { streamGiftMonetizationPolicy197I } from "./streamPremiumGiftSendReceiveWowFxMonetization197I";
import type { StreamGiftShowEngineInput197J } from "./streamPremiumGiftShowEngine197J";

export type StreamGiftCreatorEarningsStatementStatus197N =
  | "awaiting_verified_gift_ledger"
  | "pending_statement_ready"
  | "creator_settlement_review"
  | "regular_receiver_spend_only";

export type StreamGiftCreatorEarningsStatementHold197N =
  | "no_available_balance_until_backend_settlement"
  | "premium_risk_tax_compliance_hold"
  | "official_creator_payout_gate_hold"
  | "regular_user_cashout_disabled_hold";

const DIAMOND_MICROS_197N = 1_000_000;
const DOLLAR_DIAMOND_MICROS_197N = 100 * DIAMOND_MICROS_197N;
const BASIS_POINTS_197N = 10_000;

function formatDiamondMicros197N(microsInput: number): string {
  const micros = Math.max(0, Math.trunc(microsInput));
  const whole = Math.trunc(micros / DIAMOND_MICROS_197N);
  const fraction = Math.trunc((micros % DIAMOND_MICROS_197N) / 10_000);
  return `${whole}.${String(fraction).padStart(2, "0")} алмаза`;
}

function formatDollarPreview197N(diamondMicrosInput: number): string {
  const diamondMicros = Math.max(0, Math.trunc(diamondMicrosInput));
  const dollarMicros = Math.trunc((diamondMicros * 1_000_000) / DOLLAR_DIAMOND_MICROS_197N);
  const whole = Math.trunc(dollarMicros / 1_000_000);
  const fraction = dollarMicros % 1_000_000;
  return `$${whole}.${String(fraction).padStart(6, "0")}`;
}

function statementStatus197N(ledger: StreamGiftReceiverBalanceLedgerProfile197M): StreamGiftCreatorEarningsStatementStatus197N {
  if (ledger.cashOutGate === "regular_user_cashout_disabled") return "regular_receiver_spend_only";
  if (ledger.totalDiamonds >= 1000) return "creator_settlement_review";
  if (ledger.receiverPendingDiamondMicros > 0) return "pending_statement_ready";
  return "awaiting_verified_gift_ledger";
}

function holdStatus197N(ledger: StreamGiftReceiverBalanceLedgerProfile197M): StreamGiftCreatorEarningsStatementHold197N {
  if (ledger.cashOutGate === "regular_user_cashout_disabled") return "regular_user_cashout_disabled_hold";
  if (ledger.totalDiamonds >= 5000) return "premium_risk_tax_compliance_hold";
  if (ledger.totalDiamonds >= 1000) return "official_creator_payout_gate_hold";
  return "no_available_balance_until_backend_settlement";
}

function dashboardScore197N(ledger: StreamGiftReceiverBalanceLedgerProfile197M): number {
  const highValueDiscipline = ledger.totalDiamonds >= 1000 ? 2 : 1;
  const mathDiscipline = ledger.exactIntegerMathOnly ? 2 : 0;
  const noFakeAvailable = ledger.receiverAvailableBalanceNow ? 0 : 2;
  return Math.min(100, ledger.ledgerConfidenceScore + highValueDiscipline + mathDiscipline + noFakeAvailable);
}

export type StreamGiftCreatorEarningsStatementProfile197N = {
  version: "STREAM-GAME-GIFTS-197N";
  assetId: string;
  displayNameRu: string;
  diamondPrice: number;
  quantity: number;
  totalDiamonds: number;
  senderGrossDiamondMicros: number;
  receiverPendingDiamondMicros: number;
  platformFeeDiamondMicros: number;
  settlementLockedDiamondMicros: number;
  receiverShareBps: number;
  platformFeeBps: number;
  statementStatus: StreamGiftCreatorEarningsStatementStatus197N;
  statementHold: StreamGiftCreatorEarningsStatementHold197N;
  dashboardScore: number;
  statementHeadlineRu: string;
  statementGrossLabelRu: string;
  statementPendingLabelRu: string;
  statementFeeLabelRu: string;
  statementHoldLabelRu: string;
  statementEligibilityLabelRu: string;
  statementPayoutRuleLabelRu: string;
  statementExactMathLabelRu: string;
  statementRowsRu: readonly string[];
  statementChipsRu: readonly string[];
  creatorDashboardTimelineRu: readonly string[];
  ledger: StreamGiftReceiverBalanceLedgerProfile197M;
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

export type StreamGiftCreatorEarningsStatementBook197N = {
  version: "STREAM-GAME-GIFTS-197N";
  queueItemCount: number;
  visiblePreviewCount: number;
  totalGrossDiamondMicros: number;
  totalReceiverPendingDiamondMicros: number;
  totalPlatformFeeDiamondMicros: number;
  totalSettlementLockedDiamondMicros: number;
  dashboardSummaryRu: string;
  displayOrder: readonly StreamGiftCreatorEarningsStatementProfile197N[];
  dashboardRulesRu: readonly string[];
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

export function getStreamPremiumGiftCreatorEarningsStatement197N(
  assetId: string,
  quantityInput = 1,
  createdOrder = 0,
  receiverIsOfficialCreator = true,
): StreamGiftCreatorEarningsStatementProfile197N {
  const ledger = getStreamPremiumGiftReceiverBalanceLedger197M(assetId, quantityInput, createdOrder, receiverIsOfficialCreator);
  const status = statementStatus197N(ledger);
  const hold = holdStatus197N(ledger);
  const score = dashboardScore197N(ledger);
  const grossDiamond = formatDiamondMicros197N(ledger.senderDebitDiamondMicros);
  const pendingDiamond = formatDiamondMicros197N(ledger.receiverPendingDiamondMicros);
  const feeDiamond = formatDiamondMicros197N(ledger.platformFeeDiamondMicros);
  const grossDollar = formatDollarPreview197N(ledger.senderDebitDiamondMicros);
  const pendingDollar = formatDollarPreview197N(ledger.receiverPendingDiamondMicros);
  const feeDollar = formatDollarPreview197N(ledger.platformFeeDiamondMicros);
  const payoutRule = receiverIsOfficialCreator
    ? "Payout rule: official creator only, after KYC/KYB/AML/tax/admin approval and backend ledger settlement."
    : "Payout rule: regular receiver cannot cash out; gift value remains spend-only pending where allowed.";
  const eligibility = receiverIsOfficialCreator
    ? "Eligibility: creator statement is visible, but available balance and payout stay locked until verified settlement."
    : "Eligibility: regular receiver statement hides cash-out and available money language.";
  const holdText = hold === "premium_risk_tax_compliance_hold"
    ? "Hold: high-value gift keeps risk/fraud/tax/compliance review visible before available unlock."
    : hold === "official_creator_payout_gate_hold"
      ? "Hold: official creator payout gate review remains visible for premium gifts."
      : hold === "regular_user_cashout_disabled_hold"
        ? "Hold: regular receiver cash-out disabled; no available balance badge is shown."
        : "Hold: pending is locked until backend ledger settlement confirms the row.";
  return {
    version: "STREAM-GAME-GIFTS-197N",
    assetId,
    displayNameRu: ledger.displayNameRu,
    diamondPrice: ledger.diamondPrice,
    quantity: ledger.quantity,
    totalDiamonds: ledger.totalDiamonds,
    senderGrossDiamondMicros: ledger.senderDebitDiamondMicros,
    receiverPendingDiamondMicros: ledger.receiverPendingDiamondMicros,
    platformFeeDiamondMicros: ledger.platformFeeDiamondMicros,
    settlementLockedDiamondMicros: ledger.receiverPendingDiamondMicros,
    receiverShareBps: ledger.receiverShareBps,
    platformFeeBps: ledger.platformFeeBps,
    statementStatus: status,
    statementHold: hold,
    dashboardScore: score,
    statementHeadlineRu: `${ledger.displayNameRu}: creator earnings statement · ${status} · pending backend-only`,
    statementGrossLabelRu: `Gross gift value: ${grossDiamond} (${grossDollar}) before receiver share and platform/compliance fee.`,
    statementPendingLabelRu: `Receiver pending: ${pendingDiamond} (${pendingDollar}) · ${ledger.receiverShareBps / 100}% share · not available yet.`,
    statementFeeLabelRu: `Platform/compliance fee: ${feeDiamond} (${feeDollar}) · ${ledger.platformFeeBps / 100}% · exact remainder after receiver pending.`,
    statementHoldLabelRu: holdText,
    statementEligibilityLabelRu: eligibility,
    statementPayoutRuleLabelRu: payoutRule,
    statementExactMathLabelRu: `Exact statement math: gross=${ledger.diamondPrice}*${ledger.quantity}*1_000_000; pending=gross*${ledger.receiverShareBps}/${BASIS_POINTS_197N}; fee=gross-pending; locked=pending until backend settlement.`,
    statementRowsRu: [
      `gross row · ${grossDiamond} · ${grossDollar}`,
      `receiver pending row · ${pendingDiamond} · ${pendingDollar}`,
      `platform/compliance row · ${feeDiamond} · ${feeDollar}`,
      `settlement locked row · ${pendingDiamond} · backend-only available unlock`,
    ],
    statementChipsRu: [
      `status: ${status}`,
      `hold: ${hold}`,
      `receiver: ${ledger.receiverShareBps / 100}%`,
      `fee: ${ledger.platformFeeBps / 100}%`,
      "available: backend-only",
    ],
    creatorDashboardTimelineRu: [
      "1 · mobile shows premium gift ceremony and pending statement preview",
      "2 · backend later verifies gift ledger event and sender debit",
      "3 · creator pending row is created using integer diamond_micros",
      "4 · fraud/risk/tax/compliance review keeps settlement lock visible",
      "5 · available balance may unlock only after official creator gates pass",
      "6 · payout execution remains backend/admin/provider controlled, never mobile-faked",
    ],
    ledger,
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

export function buildStreamPremiumGiftCreatorEarningsStatementBook197N(
  items: readonly StreamGiftShowEngineInput197J[],
): StreamGiftCreatorEarningsStatementBook197N {
  const ledgerBook = buildStreamPremiumGiftReceiverBalanceLedgerBook197M(items);
  const displayOrder = ledgerBook.displayOrder.map((item, index) => getStreamPremiumGiftCreatorEarningsStatement197N(
    item.assetId,
    item.quantity,
    index,
    true,
  ));
  const totalGrossDiamondMicros = displayOrder.reduce((sum, item) => sum + item.senderGrossDiamondMicros, 0);
  const totalReceiverPendingDiamondMicros = displayOrder.reduce((sum, item) => sum + item.receiverPendingDiamondMicros, 0);
  const totalPlatformFeeDiamondMicros = displayOrder.reduce((sum, item) => sum + item.platformFeeDiamondMicros, 0);
  const totalSettlementLockedDiamondMicros = displayOrder.reduce((sum, item) => sum + item.settlementLockedDiamondMicros, 0);
  const first = displayOrder[0];
  return {
    version: "STREAM-GAME-GIFTS-197N",
    queueItemCount: ledgerBook.queueItemCount,
    visiblePreviewCount: displayOrder.length,
    totalGrossDiamondMicros,
    totalReceiverPendingDiamondMicros,
    totalPlatformFeeDiamondMicros,
    totalSettlementLockedDiamondMicros,
    dashboardSummaryRu: first
      ? `Creator statement: first ${first.displayNameRu} · pending ${formatDiamondMicros197N(first.receiverPendingDiamondMicros)} · available backend-only.`
      : "Creator statement empty: waiting for verified gift ledger rows.",
    displayOrder,
    dashboardRulesRu: [
      "creator statement is a user-facing preview until backend ledger settlement",
      "gross, receiver pending and fee rows use integer diamond_micros only",
      "available balance is never created by mobile UI",
      "payout is locked to official verified creator + KYC/KYB/AML/tax/admin gates",
      "regular receivers keep cash-out hidden and never see fake money movement",
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

export const streamPremiumGiftCreatorEarningsStatementRows197N: readonly StreamGiftCreatorEarningsStatementProfile197N[] = streamPremiumGiftReceiverBalanceLedgerRows197M.map((row, index) => getStreamPremiumGiftCreatorEarningsStatement197N(row.assetId, 1, index, true));

export const streamPremiumGiftCreatorEarningsStatementSummary197N = {
  version: "STREAM-GAME-GIFTS-197N",
  totalGiftCount: streamPremiumGiftCreatorEarningsStatementRows197N.length,
  cumulativeGiftCount: streamPremiumGiftReceiverBalanceLedgerSummary197M.totalGiftCount,
  receiverShareBps: streamGiftMonetizationPolicy197I.receiverShareBps,
  platformFeeBps: streamGiftMonetizationPolicy197I.platformFeeBps,
  diamondPriceMin: streamGiftMonetizationPolicy197I.giftPriceMinDiamonds,
  diamondPriceMax: streamGiftMonetizationPolicy197I.giftPriceMaxDiamonds,
  minimumTopUpCoins: streamGiftMonetizationPolicy197I.minimumTopUpCoins,
  minimumTopUpUsdCents: streamGiftMonetizationPolicy197I.minimumTopUpUsdCents,
  creatorStatementPreviewAdded: true,
  pendingStatementRowsAdded: true,
  payoutGateLabelsAdded: true,
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
