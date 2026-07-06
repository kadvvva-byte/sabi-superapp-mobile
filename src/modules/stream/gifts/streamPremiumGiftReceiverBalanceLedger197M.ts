import {
  buildStreamPremiumGiftCeremonyQualityQueue197L,
  getStreamPremiumGiftCeremonyQualityControl197L,
  streamPremiumGiftCeremonyQualityRows197L,
  streamPremiumGiftCeremonyQualitySummary197L,
  type StreamGiftCeremonyQualityControlProfile197L,
} from "./streamPremiumGiftCeremonyQualityControl197L";
import { streamGiftMonetizationPolicy197I } from "./streamPremiumGiftSendReceiveWowFxMonetization197I";
import type { StreamGiftShowEngineInput197J } from "./streamPremiumGiftShowEngine197J";

export type StreamGiftReceiverLedgerStatus197M =
  | "awaiting_verified_ledger"
  | "pending_receiver_book"
  | "creator_eligible_review"
  | "regular_spend_only_locked";

export type StreamGiftReceiverLedgerCashOutGate197M =
  | "official_creator_only_after_kyc_kyb_aml_tax_admin"
  | "regular_user_cashout_disabled";

const DIAMOND_MICROS_197M = 1_000_000;
const DOLLAR_DIAMOND_MICROS_197M = 100 * DIAMOND_MICROS_197M;
const BASIS_POINTS_197M = 10_000;

function formatDiamondMicros197M(microsInput: number): string {
  const micros = Math.max(0, Math.trunc(microsInput));
  const whole = Math.trunc(micros / DIAMOND_MICROS_197M);
  const fraction = Math.trunc((micros % DIAMOND_MICROS_197M) / 10_000);
  return `${whole}.${String(fraction).padStart(2, "0")} алмаза`;
}

function formatDollarPreview197M(diamondMicrosInput: number): string {
  const diamondMicros = Math.max(0, Math.trunc(diamondMicrosInput));
  const dollarMicros = Math.trunc((diamondMicros * 1_000_000) / DOLLAR_DIAMOND_MICROS_197M);
  const whole = Math.trunc(dollarMicros / 1_000_000);
  const fraction = dollarMicros % 1_000_000;
  return `$${whole}.${String(fraction).padStart(6, "0")}`;
}

function receiverLedgerStatus197M(
  quality: StreamGiftCeremonyQualityControlProfile197L,
  receiverIsOfficialCreator: boolean,
): StreamGiftReceiverLedgerStatus197M {
  if (!receiverIsOfficialCreator) return "regular_spend_only_locked";
  if (quality.totalDiamonds >= 1000) return "creator_eligible_review";
  if (quality.receiverPendingDiamondMicros > 0) return "pending_receiver_book";
  return "awaiting_verified_ledger";
}

function ledgerStatusTitle197M(status: StreamGiftReceiverLedgerStatus197M): string {
  switch (status) {
    case "creator_eligible_review": return "creator pending book + settlement review";
    case "regular_spend_only_locked": return "regular receiver spend-only pending book";
    case "pending_receiver_book": return "receiver pending book after verified ledger";
    default: return "awaiting verified backend ledger event";
  }
}

function cashOutGate197M(receiverIsOfficialCreator: boolean): StreamGiftReceiverLedgerCashOutGate197M {
  return receiverIsOfficialCreator
    ? "official_creator_only_after_kyc_kyb_aml_tax_admin"
    : "regular_user_cashout_disabled";
}

function ledgerConfidenceScore197M(quality: StreamGiftCeremonyQualityControlProfile197L, receiverIsOfficialCreator: boolean): number {
  const base = quality.qualityScore;
  const officialBoost = receiverIsOfficialCreator ? 1 : 0;
  const exactMathBoost = quality.exactIntegerMathOnly ? 1 : 0;
  return Math.min(100, base + officialBoost + exactMathBoost);
}

export type StreamGiftReceiverBalanceLedgerProfile197M = {
  version: "STREAM-GAME-GIFTS-197M";
  assetId: string;
  displayNameRu: string;
  diamondPrice: number;
  quantity: number;
  totalDiamonds: number;
  senderDebitDiamondMicros: number;
  receiverPendingDiamondMicros: number;
  platformFeeDiamondMicros: number;
  receiverShareBps: number;
  platformFeeBps: number;
  ledgerStatus: StreamGiftReceiverLedgerStatus197M;
  cashOutGate: StreamGiftReceiverLedgerCashOutGate197M;
  ledgerConfidenceScore: number;
  ledgerTimelineLabelRu: string;
  ledgerPendingBookLabelRu: string;
  ledgerEligibilityLabelRu: string;
  ledgerRiskHoldLabelRu: string;
  ledgerAvailableRuleLabelRu: string;
  ledgerStatementLabelRu: string;
  ledgerReceiverSummaryLabelRu: string;
  ledgerExactMathLabelRu: string;
  ledgerChipsRu: readonly string[];
  settlementTimelineRu: readonly string[];
  receiverBookRowsRu: readonly string[];
  auditTrailRu: readonly string[];
  quality: StreamGiftCeremonyQualityControlProfile197L;
  exactIntegerMathOnly: true;
  backendLedgerSettlementRequired: true;
  receiverAvailableBalanceNow: false;
  userFacingPreviewOnlyNow: true;
  actualLedgerRuntimeEnabledNow: false;
  actualBalanceMutationRuntimeEnabledNow: false;
  realSendRuntimeEnabledNow: false;
  paymentRuntimeEnabledNow: false;
  providerRuntimeEnabledNow: false;
  walletMutationEnabledNow: false;
  payoutRuntimeEnabledNow: false;
};

export type StreamGiftReceiverBalanceLedgerBookPreview197M = {
  version: "STREAM-GAME-GIFTS-197M";
  queueItemCount: number;
  visiblePreviewCount: number;
  totalDiamonds: number;
  totalSenderDebitDiamondMicros: number;
  totalReceiverPendingDiamondMicros: number;
  totalPlatformFeeDiamondMicros: number;
  ledgerBookSummaryRu: string;
  displayOrder: readonly StreamGiftReceiverBalanceLedgerProfile197M[];
  ledgerBookRulesRu: readonly string[];
  exactIntegerMathOnly: true;
  backendLedgerSettlementRequired: true;
  receiverAvailableBalanceNow: false;
  userFacingPreviewOnlyNow: true;
  actualLedgerRuntimeEnabledNow: false;
  actualBalanceMutationRuntimeEnabledNow: false;
  realSendRuntimeEnabledNow: false;
  paymentRuntimeEnabledNow: false;
  providerRuntimeEnabledNow: false;
  walletMutationEnabledNow: false;
  payoutRuntimeEnabledNow: false;
};

export function getStreamPremiumGiftReceiverBalanceLedger197M(
  assetId: string,
  quantityInput = 1,
  createdOrder = 0,
  receiverIsOfficialCreator = true,
): StreamGiftReceiverBalanceLedgerProfile197M {
  const quality = getStreamPremiumGiftCeremonyQualityControl197L(assetId, quantityInput, createdOrder, receiverIsOfficialCreator);
  const status = receiverLedgerStatus197M(quality, receiverIsOfficialCreator);
  const gate = cashOutGate197M(receiverIsOfficialCreator);
  const score = ledgerConfidenceScore197M(quality, receiverIsOfficialCreator);
  const receiverShareBps = streamGiftMonetizationPolicy197I.receiverShareBps;
  const platformFeeBps = streamGiftMonetizationPolicy197I.platformFeeBps;
  const pendingDiamond = formatDiamondMicros197M(quality.receiverPendingDiamondMicros);
  const feeDiamond = formatDiamondMicros197M(quality.platformFeeDiamondMicros);
  const grossDiamond = formatDiamondMicros197M(quality.senderDebitDiamondMicros);
  const pendingDollar = formatDollarPreview197M(quality.receiverPendingDiamondMicros);
  const grossDollar = formatDollarPreview197M(quality.senderDebitDiamondMicros);
  const statusTitle = ledgerStatusTitle197M(status);
  const eligibility = receiverIsOfficialCreator
    ? "Official creator path: pending appears after verified gift ledger; available/cash-out waits for KYC/KYB/AML/tax/admin settlement gates."
    : "Regular receiver path: gift value can stay spend-only pending; cash-out and available money labels remain disabled.";
  const riskHold = quality.totalDiamonds >= 5000
    ? "High-value hold: risk/fraud/tax review label remains visible before any available balance unlock."
    : quality.totalDiamonds >= 1000
      ? "Premium hold: settlement review badge appears after pending book entry."
      : "Clean hold: compact pending book entry; no available balance shown without ledger settlement.";
  return {
    version: "STREAM-GAME-GIFTS-197M",
    assetId,
    displayNameRu: quality.displayNameRu,
    diamondPrice: quality.diamondPrice,
    quantity: quality.quantity,
    totalDiamonds: quality.totalDiamonds,
    senderDebitDiamondMicros: quality.senderDebitDiamondMicros,
    receiverPendingDiamondMicros: quality.receiverPendingDiamondMicros,
    platformFeeDiamondMicros: quality.platformFeeDiamondMicros,
    receiverShareBps,
    platformFeeBps,
    ledgerStatus: status,
    cashOutGate: gate,
    ledgerConfidenceScore: score,
    ledgerTimelineLabelRu: `${quality.displayNameRu}: ${statusTitle} · pending reveal → settlement review → available only after backend ledger approval`,
    ledgerPendingBookLabelRu: `Receiver pending book: ${pendingDiamond} (${pendingDollar} preview) · ${receiverShareBps / 100}% receiver share · source gross ${grossDiamond}.`,
    ledgerEligibilityLabelRu: eligibility,
    ledgerRiskHoldLabelRu: riskHold,
    ledgerAvailableRuleLabelRu: "Available balance is never produced by mobile UI; only verified backend ledger settlement may unlock available balance.",
    ledgerStatementLabelRu: `Statement row: gross ${grossDiamond} (${grossDollar}) · pending ${pendingDiamond} · platform/compliance ${feeDiamond} · bps ${receiverShareBps}/${platformFeeBps}.`,
    ledgerReceiverSummaryLabelRu: receiverIsOfficialCreator
      ? `Creator receiver summary: ${pendingDiamond} pending, available locked until settlement and compliance gates pass.`
      : `Regular receiver summary: ${pendingDiamond} spend-only pending, cash-out hidden.` ,
    ledgerExactMathLabelRu: `Exact math: senderDebit=${quality.diamondPrice}*${quality.quantity}*1_000_000; receiverPending=senderDebit*${receiverShareBps}/${BASIS_POINTS_197M}; fee=senderDebit-receiverPending; no float rounding.`,
    ledgerChipsRu: [
      `status: ${status}`,
      `pending: ${pendingDiamond}`,
      `fee: ${feeDiamond}`,
      receiverIsOfficialCreator ? "creator: settlement eligible" : "regular: spend-only",
      "available: backend-only",
    ],
    settlementTimelineRu: [
      "1 · gift send intent is visual-only in mobile preview",
      "2 · real backend later receives verified gift ledger event",
      "3 · sender debit and provider/Wallet confirmation are validated server-side",
      "4 · receiver pending book entry is created in integer diamond_micros",
      "5 · risk/fraud/tax/compliance gates decide settlement status",
      "6 · available balance unlocks only for official verified creator after approval",
    ],
    receiverBookRowsRu: [
      `gross debit row · ${grossDiamond}`,
      `receiver pending row · ${pendingDiamond}`,
      `platform/compliance fee row · ${feeDiamond}`,
      receiverIsOfficialCreator ? "creator eligibility row · official creator gates required" : "regular receiver row · cash-out disabled",
    ],
    auditTrailRu: [
      "audit: no fake payment success",
      "audit: no fake available balance",
      "audit: no mobile Wallet mutation",
      "audit: no payout runtime",
      "audit: no random ledger math",
    ],
    quality,
    exactIntegerMathOnly: true,
    backendLedgerSettlementRequired: true,
    receiverAvailableBalanceNow: false,
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

export function buildStreamPremiumGiftReceiverBalanceLedgerBook197M(
  items: readonly StreamGiftShowEngineInput197J[],
): StreamGiftReceiverBalanceLedgerBookPreview197M {
  const qualityQueue = buildStreamPremiumGiftCeremonyQualityQueue197L(items);
  const displayOrder = qualityQueue.displayOrder.map((item, index) => getStreamPremiumGiftReceiverBalanceLedger197M(
    item.assetId,
    item.quantity,
    index,
    true,
  ));
  const totalDiamonds = displayOrder.reduce((sum, item) => sum + item.totalDiamonds, 0);
  const totalSenderDebitDiamondMicros = displayOrder.reduce((sum, item) => sum + item.senderDebitDiamondMicros, 0);
  const totalReceiverPendingDiamondMicros = displayOrder.reduce((sum, item) => sum + item.receiverPendingDiamondMicros, 0);
  const totalPlatformFeeDiamondMicros = displayOrder.reduce((sum, item) => sum + item.platformFeeDiamondMicros, 0);
  const first = displayOrder[0];
  return {
    version: "STREAM-GAME-GIFTS-197M",
    queueItemCount: qualityQueue.queueItemCount,
    visiblePreviewCount: displayOrder.length,
    totalDiamonds,
    totalSenderDebitDiamondMicros,
    totalReceiverPendingDiamondMicros,
    totalPlatformFeeDiamondMicros,
    ledgerBookSummaryRu: first
      ? `Ledger book: first ${first.displayNameRu} · ${first.ledgerStatus} · pending ${formatDiamondMicros197M(first.receiverPendingDiamondMicros)} · available backend-only.`
      : "Ledger book empty: waiting for verified backend gift ledger event.",
    displayOrder,
    ledgerBookRulesRu: [
      "pending book rows may be previewed on mobile, but available balance is backend-only",
      "receiver share and platform fee are stored as integer diamond_micros",
      "official creator payout requires KYC/KYB/AML/tax/admin gates",
      "regular receivers never see cash-out as available money",
      "expensive gifts keep settlement timeline visible after ceremony finale",
    ],
    exactIntegerMathOnly: true,
    backendLedgerSettlementRequired: true,
    receiverAvailableBalanceNow: false,
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

export const streamPremiumGiftReceiverBalanceLedgerRows197M: readonly StreamGiftReceiverBalanceLedgerProfile197M[] = streamPremiumGiftCeremonyQualityRows197L.map((row, index) => getStreamPremiumGiftReceiverBalanceLedger197M(row.assetId, 1, index, true));

export const streamPremiumGiftReceiverBalanceLedgerSummary197M = {
  version: "STREAM-GAME-GIFTS-197M",
  totalGiftCount: streamPremiumGiftReceiverBalanceLedgerRows197M.length,
  cumulativeGiftCount: streamPremiumGiftCeremonyQualitySummary197L.totalGiftCount,
  receiverShareBps: streamGiftMonetizationPolicy197I.receiverShareBps,
  platformFeeBps: streamGiftMonetizationPolicy197I.platformFeeBps,
  diamondPriceMin: streamGiftMonetizationPolicy197I.giftPriceMinDiamonds,
  diamondPriceMax: streamGiftMonetizationPolicy197I.giftPriceMaxDiamonds,
  minimumTopUpCoins: streamGiftMonetizationPolicy197I.minimumTopUpCoins,
  minimumTopUpUsdCents: streamGiftMonetizationPolicy197I.minimumTopUpUsdCents,
  exactIntegerMathOnly: true,
  ledgerTimelinePreviewAdded: true,
  receiverPendingBookAdded: true,
  availableBalanceFakeDisplayBlocked: true,
  backendLedgerSettlementRequired: true,
  userFacingPreviewOnlyNow: true,
  actualLedgerRuntimeEnabledNow: false,
  actualBalanceMutationRuntimeEnabledNow: false,
  realSendRuntimeEnabledNow: false,
  paymentRuntimeEnabledNow: false,
  providerRuntimeEnabledNow: false,
  walletMutationEnabledNow: false,
  payoutRuntimeEnabledNow: false,
} as const;
