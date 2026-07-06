import {
  buildStreamPremiumGiftCeremonyQueuePreview197K,
  getStreamPremiumGiftCeremonyLayer197K,
  streamPremiumGiftCeremonyLayerRows197K,
  streamPremiumGiftCeremonyLayerSummary197K,
  type StreamGiftCeremonyLayerProfile197K,
} from "./streamPremiumGiftCeremonyLayer197K";
import {
  calculateStreamGiftReceiverMonetization197I,
  streamGiftMonetizationPolicy197I,
} from "./streamPremiumGiftSendReceiveWowFxMonetization197I";
import type { StreamGiftShowEngineInput197J } from "./streamPremiumGiftShowEngine197J";

export type StreamGiftCeremonyQualityGrade197L = "clean" | "premium" | "legendary" | "royal" | "emperor";
export type StreamGiftReceiverEarningsState197L = "pending_after_verified_ledger" | "spend_only_pending_after_verified_ledger";
export type StreamGiftCeremonyOverlapPolicy197L = "toast_stack_only" | "single_premium_stage" | "protected_hero_lock" | "exclusive_stream_takeover";

const BASIS_POINTS_197L = 10_000;
const DIAMOND_MICROS_197L = 1_000_000;

function clampQuantity197L(quantityInput: number): number {
  if (!Number.isFinite(quantityInput)) return 1;
  return Math.max(1, Math.min(99, Math.trunc(quantityInput)));
}

function formatDiamondMicros197L(micros: number): string {
  const safe = Math.max(0, Math.trunc(micros));
  const whole = Math.trunc(safe / DIAMOND_MICROS_197L);
  const fraction = Math.trunc((safe % DIAMOND_MICROS_197L) / 10_000);
  return `${whole}.${String(fraction).padStart(2, "0")} алмаза`;
}

function qualityGrade197L(ceremony: StreamGiftCeremonyLayerProfile197K): StreamGiftCeremonyQualityGrade197L {
  if (ceremony.diamondPrice >= 10000) return "emperor";
  if (ceremony.diamondPrice >= 5000) return "royal";
  if (ceremony.diamondPrice >= 1000) return "legendary";
  if (ceremony.diamondPrice >= 100) return "premium";
  return "clean";
}

function overlapPolicy197L(grade: StreamGiftCeremonyQualityGrade197L): StreamGiftCeremonyOverlapPolicy197L {
  switch (grade) {
    case "emperor": return "exclusive_stream_takeover";
    case "royal": return "protected_hero_lock";
    case "legendary": return "protected_hero_lock";
    case "premium": return "single_premium_stage";
    default: return "toast_stack_only";
  }
}

function qualityScore197L(ceremony: StreamGiftCeremonyLayerProfile197K, quantity: number): number {
  const grade = qualityGrade197L(ceremony);
  const base = grade === "emperor" ? 100 : grade === "royal" ? 98 : grade === "legendary" ? 96 : grade === "premium" ? 94 : 91;
  const quantityBoost = Math.min(2, Math.trunc(quantity / 5));
  const ceremonyBoost = ceremony.ceremonyScore >= 98 ? 1 : 0;
  return Math.min(100, base + quantityBoost + ceremonyBoost);
}

function earningsState197L(receiverIsOfficialCreator: boolean): StreamGiftReceiverEarningsState197L {
  return receiverIsOfficialCreator ? "pending_after_verified_ledger" : "spend_only_pending_after_verified_ledger";
}

function qualityTitle197L(grade: StreamGiftCeremonyQualityGrade197L, displayName: string): string {
  switch (grade) {
    case "emperor": return `${displayName}: emperor-grade receiver ceremony + exact pending balance`;
    case "royal": return `${displayName}: royal-grade protected hero ceremony + exact pending balance`;
    case "legendary": return `${displayName}: legendary-grade hero ceremony + exact pending balance`;
    case "premium": return `${displayName}: premium-grade spotlight + exact pending balance`;
    default: return `${displayName}: clean-grade compact premium arrival + exact pending balance`;
  }
}

export type StreamGiftCeremonyQualityControlProfile197L = {
  version: "STREAM-GAME-GIFTS-197L";
  assetId: string;
  displayNameRu: string;
  diamondPrice: number;
  quantity: number;
  totalDiamonds: number;
  qualityGrade: StreamGiftCeremonyQualityGrade197L;
  ceremonyOverlapPolicy: StreamGiftCeremonyOverlapPolicy197L;
  receiverEarningsState: StreamGiftReceiverEarningsState197L;
  qualityScore: number;
  qualityTitleRu: string;
  earningsPendingLabelRu: string;
  earningsSettlementLabelRu: string;
  earningsAuditLabelRu: string;
  earningsFormulaRu: string;
  noOverlapRuleRu: string;
  balanceDisplayRuleRu: string;
  settlementStepsRu: readonly string[];
  ceremonyQualityChecklistRu: readonly string[];
  receiverBalanceChipsRu: readonly string[];
  qualityRiskGuardsRu: readonly string[];
  ceremony: StreamGiftCeremonyLayerProfile197K;
  receiverPendingDiamondMicros: number;
  platformFeeDiamondMicros: number;
  senderDebitDiamondMicros: number;
  exactIntegerMathOnly: true;
  backendLedgerSettlementRequired: true;
  receiverAvailableBalanceNow: false;
  userFacingPreviewOnlyNow: true;
  actualCeremonyRuntimeEnabledNow: false;
  actualBalanceMutationRuntimeEnabledNow: false;
  realSendRuntimeEnabledNow: false;
  paymentRuntimeEnabledNow: false;
  providerRuntimeEnabledNow: false;
  walletMutationEnabledNow: false;
  payoutRuntimeEnabledNow: false;
};

export type StreamGiftCeremonyQualityQueuePreview197L = {
  version: "STREAM-GAME-GIFTS-197L";
  queueItemCount: number;
  visiblePreviewCount: number;
  totalDiamonds: number;
  totalReceiverPendingDiamondMicros: number;
  totalPlatformFeeDiamondMicros: number;
  qualitySummaryRu: string;
  displayOrder: readonly StreamGiftCeremonyQualityControlProfile197L[];
  queueQualityRulesRu: readonly string[];
  exactIntegerMathOnly: true;
  backendLedgerSettlementRequired: true;
  userFacingPreviewOnlyNow: true;
  actualBalanceMutationRuntimeEnabledNow: false;
  realSendRuntimeEnabledNow: false;
  paymentRuntimeEnabledNow: false;
  providerRuntimeEnabledNow: false;
  walletMutationEnabledNow: false;
  payoutRuntimeEnabledNow: false;
};

export function getStreamPremiumGiftCeremonyQualityControl197L(
  assetId: string,
  quantityInput = 1,
  createdOrder = 0,
  receiverIsOfficialCreator = true,
): StreamGiftCeremonyQualityControlProfile197L {
  const quantity = clampQuantity197L(quantityInput);
  const ceremony = getStreamPremiumGiftCeremonyLayer197K(assetId, quantity, createdOrder, receiverIsOfficialCreator);
  const monetization = calculateStreamGiftReceiverMonetization197I(assetId, quantity, receiverIsOfficialCreator);
  const grade = qualityGrade197L(ceremony);
  const overlap = overlapPolicy197L(grade);
  const score = qualityScore197L(ceremony, quantity);
  const receiverState = earningsState197L(receiverIsOfficialCreator);
  const receiverShareBps = streamGiftMonetizationPolicy197I.receiverShareBps;
  const platformFeeBps = streamGiftMonetizationPolicy197I.platformFeeBps;
  const senderDebitDiamondMicros = monetization.senderDebitDiamondMicros;
  const receiverPendingDiamondMicros = monetization.receiverPendingDiamondMicros;
  const platformFeeDiamondMicros = monetization.platformFeeDiamondMicros;
  return {
    version: "STREAM-GAME-GIFTS-197L",
    assetId,
    displayNameRu: ceremony.displayNameRu,
    diamondPrice: ceremony.diamondPrice,
    quantity,
    totalDiamonds: ceremony.totalDiamonds,
    qualityGrade: grade,
    ceremonyOverlapPolicy: overlap,
    receiverEarningsState: receiverState,
    qualityScore: score,
    qualityTitleRu: qualityTitle197L(grade, ceremony.displayNameRu),
    earningsPendingLabelRu: `${formatDiamondMicros197L(receiverPendingDiamondMicros)} pending получателю · ${receiverShareBps / 100}% share · только после verified ledger event`,
    earningsSettlementLabelRu: receiverIsOfficialCreator
      ? "Official creator: pending balance visible, available unlock only after ledger settlement + risk/tax/compliance gates."
      : "Regular receiver: spend-only pending gift balance; cash-out disabled and never shown as available money.",
    earningsAuditLabelRu: `gross=${formatDiamondMicros197L(senderDebitDiamondMicros)} · receiver=${formatDiamondMicros197L(receiverPendingDiamondMicros)} · platform/compliance=${formatDiamondMicros197L(platformFeeDiamondMicros)} · bps ${receiverShareBps}/${platformFeeBps}`,
    earningsFormulaRu: `senderDebitDiamondMicros=${ceremony.diamondPrice}*${quantity}*1_000_000; receiverPending=senderDebitDiamondMicros*${receiverShareBps}/${BASIS_POINTS_197L}; fee=senderDebitDiamondMicros-receiverPending; no float balance display.`,
    noOverlapRuleRu: overlap === "exclusive_stream_takeover"
      ? "No-overlap: emperor gift owns the stream stage; every other gift waits until balance reveal and finale finish."
      : overlap === "protected_hero_lock"
        ? "No-overlap: royal/legendary gift uses protected hero lock; micro gifts move to safe toast stack."
        : overlap === "single_premium_stage"
          ? "No-overlap: premium gift uses single stage slot; same asset may merge visually with exact ledger math."
          : "No-overlap: clean gifts stay in compact toast stack and never cover pending balance chips.",
    balanceDisplayRuleRu: "Receiver balance display: show pending delta only, never fake available balance, never fake cash-out readiness, never fake provider success.",
    settlementStepsRu: [
      "1 · backend receives verified gift ledger event",
      "2 · sender debit/authorization is confirmed by real provider/Wallet layer later",
      "3 · receiver pending balance is created with integer diamond_micros",
      "4 · platform/compliance fee is reserved as exact remainder",
      "5 · risk/fraud/tax/compliance checks decide settlement status",
      "6 · available balance/cash-out unlocks only for official verified creators after approval",
    ],
    ceremonyQualityChecklistRu: [
      `quality score ${score}/100; grade ${grade}; overlap ${overlap}`,
      "ceremony text must stay readable above particles/glow",
      "balance chip must stay visible after receiver reveal",
      "expensive gifts cannot be interrupted by cheaper gifts",
      "combo is visual only; calculation remains per gift unit",
      "reduce-motion fallback keeps poster + pending balance text",
    ],
    receiverBalanceChipsRu: [
      monetization.receiverPendingLabelRu,
      monetization.platformFeeLabelRu,
      monetization.settlementLabelRu,
      receiverIsOfficialCreator ? "cash-out path: official creator only after KYC/KYB/AML/tax/admin gates" : "cash-out path: disabled for regular user",
    ],
    qualityRiskGuardsRu: [
      "no fake available balance",
      "no fake successful payment",
      "no fake provider confirmation",
      "no Wallet mutation in mobile patch",
      "no payout runtime in mobile patch",
      "no autoplay sound/media runtime in this patch",
    ],
    ceremony,
    receiverPendingDiamondMicros,
    platformFeeDiamondMicros,
    senderDebitDiamondMicros,
    exactIntegerMathOnly: true,
    backendLedgerSettlementRequired: true,
    receiverAvailableBalanceNow: false,
    userFacingPreviewOnlyNow: true,
    actualCeremonyRuntimeEnabledNow: false,
    actualBalanceMutationRuntimeEnabledNow: false,
    realSendRuntimeEnabledNow: false,
    paymentRuntimeEnabledNow: false,
    providerRuntimeEnabledNow: false,
    walletMutationEnabledNow: false,
    payoutRuntimeEnabledNow: false,
  };
}

export function buildStreamPremiumGiftCeremonyQualityQueue197L(
  items: readonly StreamGiftShowEngineInput197J[],
): StreamGiftCeremonyQualityQueuePreview197L {
  const ceremonyQueue = buildStreamPremiumGiftCeremonyQueuePreview197K(items);
  const displayOrder = ceremonyQueue.displayOrder.map((item, index) => getStreamPremiumGiftCeremonyQualityControl197L(
    item.assetId,
    item.quantity,
    index,
    true,
  ));
  const totalDiamonds = displayOrder.reduce((sum, item) => sum + item.totalDiamonds, 0);
  const totalReceiverPendingDiamondMicros = displayOrder.reduce((sum, item) => sum + item.receiverPendingDiamondMicros, 0);
  const totalPlatformFeeDiamondMicros = displayOrder.reduce((sum, item) => sum + item.platformFeeDiamondMicros, 0);
  const first = displayOrder[0];
  return {
    version: "STREAM-GAME-GIFTS-197L",
    queueItemCount: ceremonyQueue.queueItemCount,
    visiblePreviewCount: displayOrder.length,
    totalDiamonds,
    totalReceiverPendingDiamondMicros,
    totalPlatformFeeDiamondMicros,
    qualitySummaryRu: first
      ? `Quality queue: first ${first.displayNameRu} · ${first.qualityGrade} · ${first.qualityScore}/100 · pending ${formatDiamondMicros197L(first.receiverPendingDiamondMicros)}.`
      : "Quality queue empty: waiting for verified gift ledger event.",
    displayOrder,
    queueQualityRulesRu: [
      "expensive gifts hold protected stage until pending balance reveal is complete",
      "lower gifts can stack only in safe toast lane",
      "receiver pending balance chip is never hidden by particles, combo badges, or next gift",
      "available balance remains hidden until backend settlement state says it is available",
      "calculation uses diamond_micros + basis points only",
    ],
    exactIntegerMathOnly: true,
    backendLedgerSettlementRequired: true,
    userFacingPreviewOnlyNow: true,
    actualBalanceMutationRuntimeEnabledNow: false,
    realSendRuntimeEnabledNow: false,
    paymentRuntimeEnabledNow: false,
    providerRuntimeEnabledNow: false,
    walletMutationEnabledNow: false,
    payoutRuntimeEnabledNow: false,
  };
}

export const streamPremiumGiftCeremonyQualityRows197L: readonly StreamGiftCeremonyQualityControlProfile197L[] = streamPremiumGiftCeremonyLayerRows197K.map((row, index) => getStreamPremiumGiftCeremonyQualityControl197L(row.assetId, 1, index, true));

export const streamPremiumGiftCeremonyQualitySummary197L = {
  version: "STREAM-GAME-GIFTS-197L",
  totalGiftCount: streamPremiumGiftCeremonyQualityRows197L.length,
  cumulativeGiftCount: streamPremiumGiftCeremonyLayerSummary197K.totalGiftCount,
  qualityGradeCount: 5,
  maxHeroCeremoniesAtOnce: streamPremiumGiftCeremonyLayerSummary197K.maxHeroCeremoniesAtOnce,
  receiverShareBps: streamGiftMonetizationPolicy197I.receiverShareBps,
  platformFeeBps: streamGiftMonetizationPolicy197I.platformFeeBps,
  diamondPriceMin: streamGiftMonetizationPolicy197I.giftPriceMinDiamonds,
  diamondPriceMax: streamGiftMonetizationPolicy197I.giftPriceMaxDiamonds,
  minimumTopUpCoins: streamGiftMonetizationPolicy197I.minimumTopUpCoins,
  minimumTopUpUsdCents: streamGiftMonetizationPolicy197I.minimumTopUpUsdCents,
  exactIntegerMathOnly: true,
  receiverPendingOnlyUntilLedgerSettlement: true,
  availableBalanceFakeDisplayBlocked: true,
  backendLedgerSettlementRequired: true,
  userFacingPreviewOnlyNow: true,
  actualBalanceMutationRuntimeEnabledNow: false,
  realSendRuntimeEnabledNow: false,
  paymentRuntimeEnabledNow: false,
  providerRuntimeEnabledNow: false,
  walletMutationEnabledNow: false,
  payoutRuntimeEnabledNow: false,
} as const;
