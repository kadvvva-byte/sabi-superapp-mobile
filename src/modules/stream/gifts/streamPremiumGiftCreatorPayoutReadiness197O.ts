import {
  buildStreamPremiumGiftCreatorEarningsStatementBook197N,
  getStreamPremiumGiftCreatorEarningsStatement197N,
  streamPremiumGiftCreatorEarningsStatementRows197N,
  streamPremiumGiftCreatorEarningsStatementSummary197N,
  type StreamGiftCreatorEarningsStatementProfile197N,
} from "./streamPremiumGiftCreatorEarningsStatement197N";
import { streamGiftMonetizationPolicy197I } from "./streamPremiumGiftSendReceiveWowFxMonetization197I";
import type { StreamGiftShowEngineInput197J } from "./streamPremiumGiftShowEngine197J";

export type StreamGiftCreatorPayoutReadinessStatus197O =
  | "regular_receiver_cashout_disabled"
  | "pending_ledger_confirmation"
  | "creator_compliance_review_required"
  | "payout_backend_only_locked";

export type StreamGiftCreatorPayoutReadinessGate197O =
  | "verified_gift_ledger_required"
  | "official_creator_required"
  | "kyc_kyb_aml_required"
  | "tax_withholding_required"
  | "risk_fraud_review_required"
  | "admin_payout_approval_required"
  | "provider_settlement_required"
  | "wallet_payout_runtime_disabled_on_mobile";

const DIAMOND_MICROS_197O = 1_000_000;
const DOLLAR_DIAMOND_MICROS_197O = 100 * DIAMOND_MICROS_197O;
const BASIS_POINTS_197O = 10_000;

function formatDiamondMicros197O(microsInput: number): string {
  const micros = Math.max(0, Math.trunc(microsInput));
  const whole = Math.trunc(micros / DIAMOND_MICROS_197O);
  const fraction = Math.trunc((micros % DIAMOND_MICROS_197O) / 10_000);
  return `${whole}.${String(fraction).padStart(2, "0")} алмаза`;
}

function formatDollarPreview197O(diamondMicrosInput: number): string {
  const diamondMicros = Math.max(0, Math.trunc(diamondMicrosInput));
  const dollarMicros = Math.trunc((diamondMicros * 1_000_000) / DOLLAR_DIAMOND_MICROS_197O);
  const whole = Math.trunc(dollarMicros / 1_000_000);
  const fraction = dollarMicros % 1_000_000;
  return `$${whole}.${String(fraction).padStart(6, "0")}`;
}

function readinessStatus197O(
  statement: StreamGiftCreatorEarningsStatementProfile197N,
  receiverIsOfficialCreator: boolean,
): StreamGiftCreatorPayoutReadinessStatus197O {
  if (!receiverIsOfficialCreator || statement.statementStatus === "regular_receiver_spend_only") {
    return "regular_receiver_cashout_disabled";
  }
  if (statement.statementStatus === "awaiting_verified_gift_ledger") {
    return "pending_ledger_confirmation";
  }
  if (statement.totalDiamonds >= 1000 || statement.statementHold !== "no_available_balance_until_backend_settlement") {
    return "creator_compliance_review_required";
  }
  return "payout_backend_only_locked";
}

function readinessGates197O(
  statement: StreamGiftCreatorEarningsStatementProfile197N,
  receiverIsOfficialCreator: boolean,
): readonly StreamGiftCreatorPayoutReadinessGate197O[] {
  const common: StreamGiftCreatorPayoutReadinessGate197O[] = [
    "verified_gift_ledger_required",
    "provider_settlement_required",
    "wallet_payout_runtime_disabled_on_mobile",
  ];
  if (!receiverIsOfficialCreator) {
    return ["official_creator_required", ...common];
  }
  if (statement.totalDiamonds >= 5000) {
    return [
      ...common,
      "kyc_kyb_aml_required",
      "tax_withholding_required",
      "risk_fraud_review_required",
      "admin_payout_approval_required",
    ];
  }
  if (statement.totalDiamonds >= 1000) {
    return [
      ...common,
      "kyc_kyb_aml_required",
      "tax_withholding_required",
      "admin_payout_approval_required",
    ];
  }
  return [...common, "kyc_kyb_aml_required", "admin_payout_approval_required"];
}

function readinessScore197O(
  statement: StreamGiftCreatorEarningsStatementProfile197N,
  receiverIsOfficialCreator: boolean,
): number {
  const officialScore = receiverIsOfficialCreator ? 18 : 0;
  const mathScore = statement.exactIntegerMathOnly ? 18 : 0;
  const noFakeScore = statement.receiverAvailableBalanceNow ? 0 : 18;
  const ledgerScore = statement.backendLedgerSettlementRequired ? 16 : 0;
  const payoutLockScore = statement.creatorPayoutRuntimeEnabledNow ? 0 : 16;
  const statementScore = Math.min(14, Math.max(0, Math.trunc(statement.dashboardScore / 8)));
  return Math.min(100, officialScore + mathScore + noFakeScore + ledgerScore + payoutLockScore + statementScore);
}

export type StreamGiftCreatorPayoutReadinessProfile197O = {
  version: "STREAM-GAME-GIFTS-197O";
  assetId: string;
  displayNameRu: string;
  diamondPrice: number;
  quantity: number;
  totalDiamonds: number;
  senderGrossDiamondMicros: number;
  receiverPendingDiamondMicros: number;
  platformFeeDiamondMicros: number;
  projectedAvailableAfterSettlementDiamondMicros: number;
  receiverShareBps: number;
  platformFeeBps: number;
  readinessStatus: StreamGiftCreatorPayoutReadinessStatus197O;
  readinessGates: readonly StreamGiftCreatorPayoutReadinessGate197O[];
  readinessScore: number;
  payoutReadinessHeadlineRu: string;
  payoutGateSummaryRu: string;
  payoutComplianceLabelRu: string;
  payoutSettlementTimelineRu: string;
  payoutAvailableRuleRu: string;
  payoutProviderRuleRu: string;
  payoutExactMathLabelRu: string;
  payoutChipsRu: readonly string[];
  payoutTimelineRu: readonly string[];
  statement: StreamGiftCreatorEarningsStatementProfile197N;
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

export type StreamGiftCreatorPayoutReadinessBook197O = {
  version: "STREAM-GAME-GIFTS-197O";
  queueItemCount: number;
  visiblePreviewCount: number;
  totalProjectedPendingDiamondMicros: number;
  totalProjectedAvailableAfterSettlementDiamondMicros: number;
  payoutReadinessSummaryRu: string;
  displayOrder: readonly StreamGiftCreatorPayoutReadinessProfile197O[];
  payoutReadinessRulesRu: readonly string[];
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

export function getStreamPremiumGiftCreatorPayoutReadiness197O(
  assetId: string,
  quantityInput = 1,
  createdOrder = 0,
  receiverIsOfficialCreator = true,
): StreamGiftCreatorPayoutReadinessProfile197O {
  const statement = getStreamPremiumGiftCreatorEarningsStatement197N(assetId, quantityInput, createdOrder, receiverIsOfficialCreator);
  const status = readinessStatus197O(statement, receiverIsOfficialCreator);
  const gates = readinessGates197O(statement, receiverIsOfficialCreator);
  const score = readinessScore197O(statement, receiverIsOfficialCreator);
  const pendingDiamond = formatDiamondMicros197O(statement.receiverPendingDiamondMicros);
  const pendingDollar = formatDollarPreview197O(statement.receiverPendingDiamondMicros);
  const feeDiamond = formatDiamondMicros197O(statement.platformFeeDiamondMicros);
  const projectedAvailable = statement.receiverPendingDiamondMicros;
  const projectedAvailableDiamond = formatDiamondMicros197O(projectedAvailable);
  const gateSummary = gates.join(" · ");
  const compliance = receiverIsOfficialCreator
    ? "Compliance gates: official creator profile, KYC/KYB/AML, tax/withholding, fraud/risk, admin approval and payout schedule must pass before available unlock."
    : "Compliance gates: regular receiver cannot cash out; payout controls stay hidden and spend-only policy remains visible.";
  const settlement = "Settlement timeline: mobile preview → verified backend gift ledger → provider settlement → compliance review → pending may become available only by backend ledger event.";
  const availableRule = `Available rule: ${projectedAvailableDiamond} (${pendingDollar}) is only projected after settlement; mobile never creates available balance now.`;
  return {
    version: "STREAM-GAME-GIFTS-197O",
    assetId,
    displayNameRu: statement.displayNameRu,
    diamondPrice: statement.diamondPrice,
    quantity: statement.quantity,
    totalDiamonds: statement.totalDiamonds,
    senderGrossDiamondMicros: statement.senderGrossDiamondMicros,
    receiverPendingDiamondMicros: statement.receiverPendingDiamondMicros,
    platformFeeDiamondMicros: statement.platformFeeDiamondMicros,
    projectedAvailableAfterSettlementDiamondMicros: projectedAvailable,
    receiverShareBps: statement.receiverShareBps,
    platformFeeBps: statement.platformFeeBps,
    readinessStatus: status,
    readinessGates: gates,
    readinessScore: score,
    payoutReadinessHeadlineRu: `${statement.displayNameRu}: payout readiness · ${status} · available backend-only`,
    payoutGateSummaryRu: `Required gates: ${gateSummary}`,
    payoutComplianceLabelRu: compliance,
    payoutSettlementTimelineRu: settlement,
    payoutAvailableRuleRu: availableRule,
    payoutProviderRuleRu: "Provider/Wallet/payout runtime is disabled on mobile; payout execution requires backend/admin/provider controlled settlement.",
    payoutExactMathLabelRu: `Exact payout readiness math: pending=${statement.senderGrossDiamondMicros}*${statement.receiverShareBps}/${BASIS_POINTS_197O}; fee=${feeDiamond}; availableAfterSettlement=pending only after backend unlock.`,
    payoutChipsRu: [
      `status: ${status}`,
      `pending: ${pendingDiamond}`,
      `projected available: backend-only`,
      `receiver: ${statement.receiverShareBps / 100}%`,
      `fee: ${statement.platformFeeBps / 100}%`,
      `gates: ${gates.length}`,
    ],
    payoutTimelineRu: [
      "1 · gift ceremony and creator statement stay user-facing preview only",
      "2 · sender debit and gift receipt must be confirmed by backend ledger",
      "3 · receiver pending stays locked while provider settlement is checked",
      "4 · compliance, risk, tax and admin gates decide available unlock",
      "5 · payout schedule can run only from backend/admin, never from mobile UI",
      "6 · regular users never receive cash-out UI; official creator gates are required",
    ],
    statement,
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

export function buildStreamPremiumGiftCreatorPayoutReadinessBook197O(
  items: readonly StreamGiftShowEngineInput197J[],
): StreamGiftCreatorPayoutReadinessBook197O {
  const statementBook = buildStreamPremiumGiftCreatorEarningsStatementBook197N(items);
  const displayOrder = statementBook.displayOrder.map((item, index) => getStreamPremiumGiftCreatorPayoutReadiness197O(
    item.assetId,
    item.quantity,
    index,
    true,
  ));
  const totalProjectedPendingDiamondMicros = displayOrder.reduce((sum, item) => sum + item.receiverPendingDiamondMicros, 0);
  const totalProjectedAvailableAfterSettlementDiamondMicros = displayOrder.reduce((sum, item) => sum + item.projectedAvailableAfterSettlementDiamondMicros, 0);
  const first = displayOrder[0];
  return {
    version: "STREAM-GAME-GIFTS-197O",
    queueItemCount: statementBook.queueItemCount,
    visiblePreviewCount: displayOrder.length,
    totalProjectedPendingDiamondMicros,
    totalProjectedAvailableAfterSettlementDiamondMicros,
    payoutReadinessSummaryRu: first
      ? `Payout readiness: first ${first.displayNameRu} · ${first.readinessStatus} · projected ${formatDiamondMicros197O(first.projectedAvailableAfterSettlementDiamondMicros)} backend-only.`
      : "Payout readiness empty: waiting for creator statement rows.",
    displayOrder,
    payoutReadinessRulesRu: [
      "payout readiness is a user-facing preview until backend ledger settlement",
      "available balance is projected only and never created by mobile UI",
      "official creator, KYC/KYB/AML, tax, fraud and admin gates are required",
      "provider/Wallet/payout execution remains backend/admin controlled",
      "regular receivers cannot cash out and must never see fake payout success",
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

export const streamPremiumGiftCreatorPayoutReadinessRows197O: readonly StreamGiftCreatorPayoutReadinessProfile197O[] = streamPremiumGiftCreatorEarningsStatementRows197N.map((row, index) => getStreamPremiumGiftCreatorPayoutReadiness197O(row.assetId, 1, index, true));

export const streamPremiumGiftCreatorPayoutReadinessSummary197O = {
  version: "STREAM-GAME-GIFTS-197O",
  totalGiftCount: streamPremiumGiftCreatorPayoutReadinessRows197O.length,
  cumulativeGiftCount: streamPremiumGiftCreatorEarningsStatementSummary197N.totalGiftCount,
  receiverShareBps: streamGiftMonetizationPolicy197I.receiverShareBps,
  platformFeeBps: streamGiftMonetizationPolicy197I.platformFeeBps,
  diamondPriceMin: streamGiftMonetizationPolicy197I.giftPriceMinDiamonds,
  diamondPriceMax: streamGiftMonetizationPolicy197I.giftPriceMaxDiamonds,
  minimumTopUpCoins: streamGiftMonetizationPolicy197I.minimumTopUpCoins,
  minimumTopUpUsdCents: streamGiftMonetizationPolicy197I.minimumTopUpUsdCents,
  payoutReadinessPreviewAdded: true,
  officialCreatorGateLabelsAdded: true,
  complianceGateLabelsAdded: true,
  projectedAvailableBackendOnlyAdded: true,
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
