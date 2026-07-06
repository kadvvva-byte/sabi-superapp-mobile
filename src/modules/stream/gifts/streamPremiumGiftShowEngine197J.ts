import {
  calculateStreamGiftReceiverMonetization197I,
  getStreamPremiumGiftSendReceiveWowFx197I,
  streamGiftMonetizationPolicy197I,
  streamPremiumGiftSendReceiveWowFxRows197I,
  streamPremiumGiftSendReceiveWowFxSummary197I,
  type StreamGiftWowFxBand197I,
} from "./streamPremiumGiftSendReceiveWowFxMonetization197I";

export type StreamGiftShowLane197J = "micro_toast" | "premium_stage" | "legendary_hero" | "ultra_royal" | "emperor_takeover";
export type StreamGiftQueueMode197J = "single_hero_then_stack" | "merge_same_asset" | "defer_low_priority" | "reduce_motion_static";
export type StreamGiftBalanceRevealPhase197J = "hidden_until_verified" | "pending_delta_chip" | "settlement_badge";

const DIAMOND_MICROS_197J = 1_000_000;
const MAX_QUEUE_PREVIEW_197J = 8;

export type StreamGiftShowEngineInput197J = {
  assetId: string;
  quantity?: number;
  createdOrder?: number;
  receiverIsOfficialCreator?: boolean;
};

export type StreamGiftShowEngineProfile197J = {
  version: "STREAM-GAME-GIFTS-197J";
  assetId: string;
  displayNameRu: string;
  diamondPrice: number;
  quantity: number;
  totalDiamonds: number;
  totalDiamondMicros: number;
  fxBand: StreamGiftWowFxBand197I;
  showLane: StreamGiftShowLane197J;
  priorityScore: number;
  scheduledDurationMs: number;
  heroHoldMs: number;
  balanceRevealDelayMs: number;
  cleanupDelayMs: number;
  queueMode: StreamGiftQueueMode197J;
  balanceRevealPhase: StreamGiftBalanceRevealPhase197J;
  senderStageRu: string;
  receiverStageRu: string;
  balanceRevealRu: string;
  concurrencyPolicyRu: string;
  queuePolicyRu: string;
  mergePolicyRu: string;
  premiumLayerStackRu: readonly string[];
  timelineRu: readonly string[];
  safetyChecklistRu: readonly string[];
  exactPriorityFormulaRu: string;
  receiverPendingDiamondMicros: number;
  receiverPendingLabelRu: string;
  settlementLabelRu: string;
  reduceMotionFallbackRu: string;
  userFacingPreviewOnlyNow: true;
  actualAnimationRuntimeEnabledNow: false;
  actualSoundAutoplayEnabledNow: false;
  realSendRuntimeEnabledNow: false;
  backendLedgerSettlementRequired: true;
  paymentRuntimeEnabledNow: false;
  providerRuntimeEnabledNow: false;
  walletMutationEnabledNow: false;
  payoutRuntimeEnabledNow: false;
};

export type StreamGiftShowQueuePreview197J = {
  version: "STREAM-GAME-GIFTS-197J";
  queueItemCount: number;
  visiblePreviewCount: number;
  totalSenderDebitDiamonds: number;
  totalReceiverPendingDiamondMicros: number;
  queueSummaryRu: string;
  displayOrder: readonly StreamGiftShowEngineProfile197J[];
  queueRulesRu: readonly string[];
  userFacingPreviewOnlyNow: true;
  realSendRuntimeEnabledNow: false;
  paymentRuntimeEnabledNow: false;
  providerRuntimeEnabledNow: false;
  walletMutationEnabledNow: false;
  payoutRuntimeEnabledNow: false;
};

function clampQuantity197J(quantity?: number): number {
  if (!Number.isFinite(quantity ?? 1)) return 1;
  return Math.max(1, Math.min(99, Math.trunc(quantity ?? 1)));
}

function showLane197J(price: number): StreamGiftShowLane197J {
  if (price >= 10000) return "emperor_takeover";
  if (price >= 5000) return "ultra_royal";
  if (price >= 1000) return "legendary_hero";
  if (price >= 100) return "premium_stage";
  return "micro_toast";
}

function queueMode197J(lane: StreamGiftShowLane197J): StreamGiftQueueMode197J {
  switch (lane) {
    case "emperor_takeover": return "single_hero_then_stack";
    case "ultra_royal": return "single_hero_then_stack";
    case "legendary_hero": return "defer_low_priority";
    case "premium_stage": return "merge_same_asset";
    default: return "merge_same_asset";
  }
}

function baseDuration197J(lane: StreamGiftShowLane197J): number {
  switch (lane) {
    case "emperor_takeover": return 5600;
    case "ultra_royal": return 5100;
    case "legendary_hero": return 4300;
    case "premium_stage": return 3200;
    default: return 2100;
  }
}

function priorityScore197J(price: number, quantity: number, createdOrder: number): number {
  const valueScore = Math.min(10000, price * quantity);
  const queueAgeBoost = Math.max(0, Math.min(250, 250 - createdOrder * 25));
  const topTierBoost = price >= 10000 ? 2000 : price >= 5000 ? 1200 : price >= 1000 ? 650 : price >= 100 ? 240 : 50;
  return valueScore + topTierBoost + queueAgeBoost;
}

function laneLabel197J(lane: StreamGiftShowLane197J): string {
  switch (lane) {
    case "emperor_takeover": return "EMPEROR TAKEOVER";
    case "ultra_royal": return "ULTRA ROYAL";
    case "legendary_hero": return "LEGENDARY HERO";
    case "premium_stage": return "PREMIUM STAGE";
    default: return "MICRO TOAST";
  }
}

export function getStreamPremiumGiftShowEngine197J(
  assetId: string,
  quantityInput = 1,
  createdOrder = 0,
  receiverIsOfficialCreator = true,
): StreamGiftShowEngineProfile197J {
  const fx = getStreamPremiumGiftSendReceiveWowFx197I(assetId, quantityInput, receiverIsOfficialCreator);
  const quantity = clampQuantity197J(quantityInput);
  const monetization = calculateStreamGiftReceiverMonetization197I(assetId, quantity, receiverIsOfficialCreator);
  const lane = showLane197J(fx.diamondPrice);
  const scheduledDurationMs = baseDuration197J(lane);
  const heroHoldMs = Math.trunc(scheduledDurationMs * (lane === "emperor_takeover" ? 0.44 : lane === "ultra_royal" ? 0.39 : 0.32));
  const balanceRevealDelayMs = Math.trunc(scheduledDurationMs * 0.58);
  const cleanupDelayMs = scheduledDurationMs + 420;
  const totalDiamonds = fx.diamondPrice * quantity;
  const totalDiamondMicros = totalDiamonds * DIAMOND_MICROS_197J;
  const priorityScore = priorityScore197J(fx.diamondPrice, quantity, createdOrder);
  const laneLabel = laneLabel197J(lane);
  return {
    version: "STREAM-GAME-GIFTS-197J",
    assetId,
    displayNameRu: fx.displayNameRu,
    diamondPrice: fx.diamondPrice,
    quantity,
    totalDiamonds,
    totalDiamondMicros,
    fxBand: fx.fxBand,
    showLane: lane,
    priorityScore,
    scheduledDurationMs,
    heroHoldMs,
    balanceRevealDelayMs,
    cleanupDelayMs,
    queueMode: queueMode197J(lane),
    balanceRevealPhase: "pending_delta_chip",
    senderStageRu: `${laneLabel}: отправитель видит premium confirmation, затем gift hero-stage без списания до backend approval.`,
    receiverStageRu: `${laneLabel}: получатель видит чистый cinematic arrival, имя отправителя, подарок и pending balance delta.`,
    balanceRevealRu: `${monetization.receiverPendingLabelRu} показывается только как pending после verified ledger event; available не рисуем фейком.`,
    concurrencyPolicyRu: lane === "emperor_takeover"
      ? "Только один emperor gift на hero stage; остальные подарки ждут в premium queue, чтобы дорогой подарок не потерял ценность."
      : lane === "ultra_royal"
        ? "Ultra gift получает отдельный hero slot; micro/premium gifts складываются в нижний stack."
        : "Подарки можно группировать в stack, но hero-stage не перегружается частицами и текстом.",
    queuePolicyRu: "Очередь сортируется детерминированно: total diamonds + tier boost + created order; без случайного выбора и без хаотичного перекрытия.",
    mergePolicyRu: "Одинаковые подарки от одного отправителя можно объединять в xN batch, но расчёт pending balance остаётся по integer diamond_micros.",
    premiumLayerStackRu: [
      "layer 1 · safe dim + spotlight, не закрывает чат полностью на low-tier gifts",
      "layer 2 · poster-first hero asset, future MP4/WebP hook без autoplay сейчас",
      "layer 3 · aura/trails/particles по цене, density capped для читаемости",
      "layer 4 · sender + receiver labels in safe-area, no clipped UI",
      "layer 5 · pending balance delta + settlement badge, no fake available balance",
      "layer 6 · clean fade-out and queue handoff to next gift",
    ],
    timelineRu: [
      `0-${Math.trunc(scheduledDurationMs * 0.18)}ms · pre-glow + queue lock`,
      `${Math.trunc(scheduledDurationMs * 0.18)}-${Math.trunc(scheduledDurationMs * 0.42)}ms · gift hero entrance`,
      `${Math.trunc(scheduledDurationMs * 0.42)}-${balanceRevealDelayMs}ms · receive stage and sender label`,
      `${balanceRevealDelayMs}-${scheduledDurationMs}ms · pending balance reveal + premium finale`,
      `${scheduledDurationMs}-${cleanupDelayMs}ms · soft cleanup + next queued gift handoff`,
    ],
    safetyChecklistRu: [
      "show engine is UI contract only; it does not send gifts",
      "backend ledger event is required before receiver pending balance can be trusted",
      "available/cash-out balance is never shown as available in this mobile patch",
      "premium gifts get exclusive timing, so expensive gifts feel expensive",
      "reduce-motion keeps readable poster + delta instead of heavy particles",
    ],
    exactPriorityFormulaRu: "priorityScore=min(10000, diamondPrice*quantity)+tierBoost+queueAgeBoost; deterministic integer math only.",
    receiverPendingDiamondMicros: monetization.receiverPendingDiamondMicros,
    receiverPendingLabelRu: monetization.receiverPendingLabelRu,
    settlementLabelRu: monetization.settlementLabelRu,
    reduceMotionFallbackRu: "reduce-motion: static premium poster, one glow pulse, pending delta text, no sound autoplay, no particle wall.",
    userFacingPreviewOnlyNow: true,
    actualAnimationRuntimeEnabledNow: false,
    actualSoundAutoplayEnabledNow: false,
    realSendRuntimeEnabledNow: false,
    backendLedgerSettlementRequired: true,
    paymentRuntimeEnabledNow: false,
    providerRuntimeEnabledNow: false,
    walletMutationEnabledNow: false,
    payoutRuntimeEnabledNow: false,
  };
}

export function buildStreamPremiumGiftShowQueuePreview197J(
  items: readonly StreamGiftShowEngineInput197J[],
): StreamGiftShowQueuePreview197J {
  const safeItems = items.length > 0 ? items : [{ assetId: streamPremiumGiftSendReceiveWowFxRows197I[0]?.assetId ?? "gift-unknown", quantity: 1, createdOrder: 0 }];
  const profiles = safeItems.map((item, index) => getStreamPremiumGiftShowEngine197J(
    item.assetId,
    item.quantity ?? 1,
    item.createdOrder ?? index,
    item.receiverIsOfficialCreator ?? true,
  ));
  const displayOrder = [...profiles].sort((a, b) => b.priorityScore - a.priorityScore || a.displayNameRu.localeCompare(b.displayNameRu)).slice(0, MAX_QUEUE_PREVIEW_197J);
  const totalSenderDebitDiamonds = profiles.reduce((total, item) => total + item.totalDiamonds, 0);
  const totalReceiverPendingDiamondMicros = profiles.reduce((total, item) => total + item.receiverPendingDiamondMicros, 0);
  const first = displayOrder[0];
  return {
    version: "STREAM-GAME-GIFTS-197J",
    queueItemCount: profiles.length,
    visiblePreviewCount: displayOrder.length,
    totalSenderDebitDiamonds,
    totalReceiverPendingDiamondMicros,
    queueSummaryRu: first
      ? `Первым показываем ${first.displayNameRu} · ${first.showLane} · priority ${first.priorityScore}; total queue ${totalSenderDebitDiamonds} diamonds.`
      : "Очередь пустая: show engine ждёт verified gift event.",
    displayOrder,
    queueRulesRu: [
      "one hero gift at a time for premium/ultra/emperor tiers",
      "micro gifts may stack as clean toast, but never cover balance delta",
      "same asset may merge into xN visual batch while ledger calculation remains exact",
      "pending balance reveal waits for backend verified ledger event",
      "no real send, payment, provider, wallet mutation or payout runtime in this mobile patch",
    ],
    userFacingPreviewOnlyNow: true,
    realSendRuntimeEnabledNow: false,
    paymentRuntimeEnabledNow: false,
    providerRuntimeEnabledNow: false,
    walletMutationEnabledNow: false,
    payoutRuntimeEnabledNow: false,
  };
}

export const streamPremiumGiftShowEngineRows197J: readonly StreamGiftShowEngineProfile197J[] = streamPremiumGiftSendReceiveWowFxRows197I.map((row, index) => getStreamPremiumGiftShowEngine197J(row.assetId, 1, index));

export const streamPremiumGiftShowEngineSummary197J = {
  version: "STREAM-GAME-GIFTS-197J",
  totalGiftCount: streamPremiumGiftShowEngineRows197J.length,
  cumulativeGiftCount: streamPremiumGiftSendReceiveWowFxSummary197I.totalGiftCount,
  maxQueuePreview: MAX_QUEUE_PREVIEW_197J,
  maxHeroGiftsAtOnce: 1,
  diamondPriceMin: streamGiftMonetizationPolicy197I.giftPriceMinDiamonds,
  diamondPriceMax: streamGiftMonetizationPolicy197I.giftPriceMaxDiamonds,
  minimumTopUpCoins: streamGiftMonetizationPolicy197I.minimumTopUpCoins,
  minimumTopUpUsdCents: streamGiftMonetizationPolicy197I.minimumTopUpUsdCents,
  receiverShareBps: streamGiftMonetizationPolicy197I.receiverShareBps,
  deterministicQueue: true,
  exactIntegerMathOnly: true,
  backendLedgerSettlementRequired: true,
  userFacingPreviewOnlyNow: true,
  actualAnimationRuntimeEnabledNow: false,
  actualSoundAutoplayEnabledNow: false,
  realSendRuntimeEnabledNow: false,
  paymentRuntimeEnabledNow: false,
  providerRuntimeEnabledNow: false,
  walletMutationEnabledNow: false,
  payoutRuntimeEnabledNow: false,
} as const;
