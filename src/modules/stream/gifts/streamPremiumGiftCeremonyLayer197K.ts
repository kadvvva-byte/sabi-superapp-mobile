import {
  buildStreamPremiumGiftShowQueuePreview197J,
  getStreamPremiumGiftShowEngine197J,
  streamPremiumGiftShowEngineRows197J,
  streamPremiumGiftShowEngineSummary197J,
  type StreamGiftShowEngineInput197J,
  type StreamGiftShowEngineProfile197J,
  type StreamGiftShowLane197J,
} from "./streamPremiumGiftShowEngine197J";
import {
  calculateStreamGiftReceiverMonetization197I,
  streamGiftMonetizationPolicy197I,
} from "./streamPremiumGiftSendReceiveWowFxMonetization197I";

export type StreamGiftCeremonyTier197K = "micro_blessing" | "premium_spotlight" | "legendary_ceremony" | "ultra_coronation" | "emperor_coronation";
export type StreamGiftCeremonyCadence197K = "instant_clean" | "spotlight_held" | "hero_ceremony" | "royal_takeover" | "emperor_takeover";
export type StreamGiftComboPolicy197K = "single_arrival" | "merge_same_sender_batch" | "milestone_combo_badge" | "stream_wide_ceremony_lock";

const BASIS_POINTS_197K = 10_000;
const DIAMOND_MICROS_197K = 1_000_000;

function ceremonyTier197K(price: number): StreamGiftCeremonyTier197K {
  if (price >= 10000) return "emperor_coronation";
  if (price >= 5000) return "ultra_coronation";
  if (price >= 1000) return "legendary_ceremony";
  if (price >= 100) return "premium_spotlight";
  return "micro_blessing";
}

function ceremonyCadence197K(tier: StreamGiftCeremonyTier197K): StreamGiftCeremonyCadence197K {
  switch (tier) {
    case "emperor_coronation": return "emperor_takeover";
    case "ultra_coronation": return "royal_takeover";
    case "legendary_ceremony": return "hero_ceremony";
    case "premium_spotlight": return "spotlight_held";
    default: return "instant_clean";
  }
}

function comboPolicy197K(tier: StreamGiftCeremonyTier197K, quantity: number): StreamGiftComboPolicy197K {
  if (tier === "emperor_coronation" || tier === "ultra_coronation") return "stream_wide_ceremony_lock";
  if (quantity >= 5) return "milestone_combo_badge";
  if (quantity >= 2) return "merge_same_sender_batch";
  return "single_arrival";
}

function tierLabel197K(tier: StreamGiftCeremonyTier197K): string {
  switch (tier) {
    case "emperor_coronation": return "EMPEROR CORONATION";
    case "ultra_coronation": return "ULTRA CORONATION";
    case "legendary_ceremony": return "LEGENDARY CEREMONY";
    case "premium_spotlight": return "PREMIUM SPOTLIGHT";
    default: return "MICRO BLESSING";
  }
}

function ceremonyTitle197K(tier: StreamGiftCeremonyTier197K, showLane: StreamGiftShowLane197J): string {
  switch (tier) {
    case "emperor_coronation": return `${tierLabel197K(tier)} · full stream crown stage · ${showLane}`;
    case "ultra_coronation": return `${tierLabel197K(tier)} · royal stage lock · ${showLane}`;
    case "legendary_ceremony": return `${tierLabel197K(tier)} · hero spotlight ceremony · ${showLane}`;
    case "premium_spotlight": return `${tierLabel197K(tier)} · clean premium reveal · ${showLane}`;
    default: return `${tierLabel197K(tier)} · compact premium toast · ${showLane}`;
  }
}

function ceremonyBoostMs197K(tier: StreamGiftCeremonyTier197K): number {
  switch (tier) {
    case "emperor_coronation": return 1100;
    case "ultra_coronation": return 850;
    case "legendary_ceremony": return 520;
    case "premium_spotlight": return 260;
    default: return 120;
  }
}

function ceremonyScore197K(price: number, quantity: number, tier: StreamGiftCeremonyTier197K): number {
  const valueBoost = Math.min(10, Math.trunc((price * quantity) / 1000));
  const tierBase = tier === "emperor_coronation" ? 100 : tier === "ultra_coronation" ? 98 : tier === "legendary_ceremony" ? 96 : tier === "premium_spotlight" ? 94 : 91;
  return Math.min(100, tierBase + valueBoost);
}

function milestoneLabel197K(totalDiamonds: number, quantity: number, displayNameRu: string): string {
  if (totalDiamonds >= 50000) return `${displayNameRu}: stream-wide milestone · ${totalDiamonds} diamonds total · crown queue lock.`;
  if (totalDiamonds >= 10000) return `${displayNameRu}: royal milestone · ${totalDiamonds} diamonds total · отдельная церемония и balance reveal.`;
  if (totalDiamonds >= 1000) return `${displayNameRu}: legendary milestone · ${quantity}× combo presentation без хаоса.`;
  if (quantity >= 5) return `${displayNameRu}: combo x${quantity} · компактный stack и точный pending balance.`;
  return `${displayNameRu}: single premium arrival · clean timing and readable pending delta.`;
}

function formatDiamondMicros197K(micros: number): string {
  const safe = Math.max(0, Math.trunc(micros));
  const whole = Math.trunc(safe / DIAMOND_MICROS_197K);
  const fraction = Math.trunc((safe % DIAMOND_MICROS_197K) / 10_000);
  return `${whole}.${String(fraction).padStart(2, "0")} алмаза`;
}

export type StreamGiftCeremonyLayerProfile197K = {
  version: "STREAM-GAME-GIFTS-197K";
  assetId: string;
  displayNameRu: string;
  diamondPrice: number;
  quantity: number;
  totalDiamonds: number;
  ceremonyTier: StreamGiftCeremonyTier197K;
  ceremonyCadence: StreamGiftCeremonyCadence197K;
  comboPolicy: StreamGiftComboPolicy197K;
  ceremonyScore: number;
  ceremonyTitleRu: string;
  ceremonyMilestoneRu: string;
  ceremonyComboRu: string;
  ceremonyCadenceRu: string;
  ceremonyStageDirectionRu: string;
  ceremonyBalancePresentationRu: string;
  ceremonyFinaleRu: string;
  ceremonyAntiSpamRu: string;
  ceremonyQueueLockRu: string;
  ceremonyLayerStackRu: readonly string[];
  ceremonyTimelineRu: readonly string[];
  ceremonySafetyChecklistRu: readonly string[];
  exactCalculationRu: string;
  showEngine: StreamGiftShowEngineProfile197J;
  receiverPendingDiamondMicros: number;
  receiverPendingLabelRu: string;
  platformFeeDiamondMicros: number;
  platformFeeLabelRu: string;
  settlementLabelRu: string;
  userFacingPreviewOnlyNow: true;
  actualCeremonyRuntimeEnabledNow: false;
  actualAnimationRuntimeEnabledNow: false;
  actualSoundAutoplayEnabledNow: false;
  realSendRuntimeEnabledNow: false;
  backendLedgerSettlementRequired: true;
  paymentRuntimeEnabledNow: false;
  providerRuntimeEnabledNow: false;
  walletMutationEnabledNow: false;
  payoutRuntimeEnabledNow: false;
};

export type StreamGiftCeremonyQueuePreview197K = {
  version: "STREAM-GAME-GIFTS-197K";
  queueItemCount: number;
  visiblePreviewCount: number;
  totalDiamonds: number;
  totalReceiverPendingDiamondMicros: number;
  ceremonySummaryRu: string;
  displayOrder: readonly StreamGiftCeremonyLayerProfile197K[];
  queueRulesRu: readonly string[];
  userFacingPreviewOnlyNow: true;
  actualCeremonyRuntimeEnabledNow: false;
  realSendRuntimeEnabledNow: false;
  paymentRuntimeEnabledNow: false;
  providerRuntimeEnabledNow: false;
  walletMutationEnabledNow: false;
  payoutRuntimeEnabledNow: false;
};

export function getStreamPremiumGiftCeremonyLayer197K(
  assetId: string,
  quantityInput = 1,
  createdOrder = 0,
  receiverIsOfficialCreator = true,
): StreamGiftCeremonyLayerProfile197K {
  const showEngine = getStreamPremiumGiftShowEngine197J(assetId, quantityInput, createdOrder, receiverIsOfficialCreator);
  const monetization = calculateStreamGiftReceiverMonetization197I(assetId, showEngine.quantity, receiverIsOfficialCreator);
  const tier = ceremonyTier197K(showEngine.diamondPrice);
  const cadence = ceremonyCadence197K(tier);
  const comboPolicy = comboPolicy197K(tier, showEngine.quantity);
  const ceremonyDurationMs = showEngine.scheduledDurationMs + ceremonyBoostMs197K(tier);
  const balanceMomentMs = Math.trunc(ceremonyDurationMs * 0.64);
  const finaleStartMs = Math.trunc(ceremonyDurationMs * 0.82);
  const totalDiamonds = showEngine.totalDiamonds;
  const ceremonyTitle = ceremonyTitle197K(tier, showEngine.showLane);
  const milestone = milestoneLabel197K(totalDiamonds, showEngine.quantity, showEngine.displayNameRu);
  return {
    version: "STREAM-GAME-GIFTS-197K",
    assetId,
    displayNameRu: showEngine.displayNameRu,
    diamondPrice: showEngine.diamondPrice,
    quantity: showEngine.quantity,
    totalDiamonds,
    ceremonyTier: tier,
    ceremonyCadence: cadence,
    comboPolicy,
    ceremonyScore: ceremonyScore197K(showEngine.diamondPrice, showEngine.quantity, tier),
    ceremonyTitleRu: ceremonyTitle,
    ceremonyMilestoneRu: milestone,
    ceremonyComboRu: comboPolicy === "stream_wide_ceremony_lock"
      ? "Top-tier gift locks hero ceremony; low-tier gifts wait in clean queue and cannot cover the crown moment."
      : comboPolicy === "milestone_combo_badge"
        ? `Combo x${showEngine.quantity}: same sender/gift may merge visually, but ledger math remains per unit.`
        : comboPolicy === "merge_same_sender_batch"
          ? `Batch x${showEngine.quantity}: one polished arrival, one exact pending balance delta.`
          : "Single gift: one clean ceremony without artificial inflation.",
    ceremonyCadenceRu: `${cadence}: entrance ${Math.trunc(ceremonyDurationMs * 0.2)}ms · hero ${Math.trunc(ceremonyDurationMs * 0.44)}ms · balance ${balanceMomentMs}ms · finale ${finaleStartMs}ms.`,
    ceremonyStageDirectionRu: tier === "emperor_coronation"
      ? "Stage direction: dim stream, golden crown gate, center hero poster, royal aura, sender badge, receiver pending delta, no cheap confetti."
      : tier === "ultra_coronation"
        ? "Stage direction: palace spotlight, layered aura, controlled trails, receiver balance chip, clean fade."
        : tier === "legendary_ceremony"
          ? "Stage direction: hero spotlight, premium aura, readable sender/receiver labels, no UI clipping."
          : tier === "premium_spotlight"
            ? "Stage direction: compact spotlight, premium bloom, short trail, balance chip after ledger verification."
            : "Stage direction: fast clean sparkle, small safe toast, still premium and readable.",
    ceremonyBalancePresentationRu: `${monetization.receiverPendingLabelRu} · ${formatDiamondMicros197K(monetization.platformFeeDiamondMicros)} fee · pending only after verified ledger event.`,
    ceremonyFinaleRu: tier === "emperor_coronation"
      ? "Finale: crown seal, slow gold fade, balance pulse, queue unlock after cleanup; no autoplay sound in this patch."
      : tier === "ultra_coronation"
        ? "Finale: royal seal, crystal fade, balance pulse, next gift handoff."
        : "Finale: soft shine, pending chip remains readable, next gift handoff without visual noise.",
    ceremonyAntiSpamRu: "Anti-spam cadence: micro gifts can stack, premium gifts merge by same asset, legendary+ gifts get hero lock, emperor gifts cannot be interrupted.",
    ceremonyQueueLockRu: showEngine.showLane === "emperor_takeover"
      ? "Queue lock: emperor ceremony is exclusive; one hero on screen, all other gifts defer."
      : showEngine.showLane === "ultra_royal"
        ? "Queue lock: ultra ceremony is protected; micro gifts move to toast stack."
        : "Queue lock: readable stage, capped particles, clean balance reveal before next item.",
    ceremonyLayerStackRu: [
      "ceremony layer 1 · safe dim + premium stage frame",
      "ceremony layer 2 · poster-first hero gift, future media hook without autoplay now",
      "ceremony layer 3 · tier-based aura, trails and controlled particles",
      "ceremony layer 4 · sender/receiver identity labels in safe area",
      "ceremony layer 5 · pending balance delta and settlement badge",
      "ceremony layer 6 · combo/milestone badge when quantity or value deserves it",
      "ceremony layer 7 · finale seal + queue handoff",
    ],
    ceremonyTimelineRu: [
      `0-${Math.trunc(ceremonyDurationMs * 0.2)}ms · ceremony stage opens and queue locks`,
      `${Math.trunc(ceremonyDurationMs * 0.2)}-${Math.trunc(ceremonyDurationMs * 0.44)}ms · gift hero reveal + tier aura`,
      `${Math.trunc(ceremonyDurationMs * 0.44)}-${balanceMomentMs}ms · sender/receiver labels + combo badge`,
      `${balanceMomentMs}-${finaleStartMs}ms · pending balance delta + settlement badge`,
      `${finaleStartMs}-${ceremonyDurationMs}ms · finale seal + clean fade + next queue handoff`,
    ],
    ceremonySafetyChecklistRu: [
      "ceremony layer is user-facing preview/contract only",
      "real send must still come from backend-approved gift ledger event",
      "receiver pending balance is calculated exactly with integer diamond_micros",
      "available balance and cash-out are not shown as available in this mobile patch",
      "regular users cannot cash out; official creator payout requires compliance gates",
      "no fake payment, provider call, wallet mutation, payout or autoplay runtime is enabled",
    ],
    exactCalculationRu: `senderDebit=${showEngine.diamondPrice}*${showEngine.quantity}=${totalDiamonds} diamonds; receiverPending=senderDebitDiamondMicros*${streamGiftMonetizationPolicy197I.receiverShareBps}/${BASIS_POINTS_197K}; fee=remainder; integer math only.`,
    showEngine,
    receiverPendingDiamondMicros: monetization.receiverPendingDiamondMicros,
    receiverPendingLabelRu: monetization.receiverPendingLabelRu,
    platformFeeDiamondMicros: monetization.platformFeeDiamondMicros,
    platformFeeLabelRu: monetization.platformFeeLabelRu,
    settlementLabelRu: monetization.settlementLabelRu,
    userFacingPreviewOnlyNow: true,
    actualCeremonyRuntimeEnabledNow: false,
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

export function buildStreamPremiumGiftCeremonyQueuePreview197K(
  items: readonly StreamGiftShowEngineInput197J[],
): StreamGiftCeremonyQueuePreview197K {
  const showQueue = buildStreamPremiumGiftShowQueuePreview197J(items);
  const ceremonies = showQueue.displayOrder.map((item, index) => getStreamPremiumGiftCeremonyLayer197K(
    item.assetId,
    item.quantity,
    index,
    true,
  ));
  const totalDiamonds = ceremonies.reduce((sum, item) => sum + item.totalDiamonds, 0);
  const totalReceiverPendingDiamondMicros = ceremonies.reduce((sum, item) => sum + item.receiverPendingDiamondMicros, 0);
  const first = ceremonies[0];
  return {
    version: "STREAM-GAME-GIFTS-197K",
    queueItemCount: showQueue.queueItemCount,
    visiblePreviewCount: ceremonies.length,
    totalDiamonds,
    totalReceiverPendingDiamondMicros,
    ceremonySummaryRu: first
      ? `Ceremony queue: first ${first.displayNameRu} · ${first.ceremonyTier} · score ${first.ceremonyScore}; total ${totalDiamonds} diamonds.`
      : "Ceremony queue empty: waiting for verified gift event.",
    displayOrder: ceremonies,
    queueRulesRu: [
      "emperor and ultra gifts receive protected ceremony lock",
      "legendary gifts show hero ceremony before lower-priority gifts",
      "micro gifts stack cleanly and never cover receiver balance delta",
      "combo badges are visual only; ledger calculation remains exact per gift",
      "pending balance display waits for backend verified ledger event",
    ],
    userFacingPreviewOnlyNow: true,
    actualCeremonyRuntimeEnabledNow: false,
    realSendRuntimeEnabledNow: false,
    paymentRuntimeEnabledNow: false,
    providerRuntimeEnabledNow: false,
    walletMutationEnabledNow: false,
    payoutRuntimeEnabledNow: false,
  };
}

export const streamPremiumGiftCeremonyLayerRows197K: readonly StreamGiftCeremonyLayerProfile197K[] = streamPremiumGiftShowEngineRows197J.map((row, index) => getStreamPremiumGiftCeremonyLayer197K(row.assetId, 1, index));

export const streamPremiumGiftCeremonyLayerSummary197K = {
  version: "STREAM-GAME-GIFTS-197K",
  totalGiftCount: streamPremiumGiftCeremonyLayerRows197K.length,
  cumulativeGiftCount: streamPremiumGiftShowEngineSummary197J.totalGiftCount,
  ceremonyTierCount: 5,
  maxHeroCeremoniesAtOnce: 1,
  diamondPriceMin: streamGiftMonetizationPolicy197I.giftPriceMinDiamonds,
  diamondPriceMax: streamGiftMonetizationPolicy197I.giftPriceMaxDiamonds,
  minimumTopUpCoins: streamGiftMonetizationPolicy197I.minimumTopUpCoins,
  minimumTopUpUsdCents: streamGiftMonetizationPolicy197I.minimumTopUpUsdCents,
  receiverShareBps: streamGiftMonetizationPolicy197I.receiverShareBps,
  platformFeeBps: streamGiftMonetizationPolicy197I.platformFeeBps,
  exactIntegerMathOnly: true,
  backendLedgerSettlementRequired: true,
  userFacingPreviewOnlyNow: true,
  actualCeremonyRuntimeEnabledNow: false,
  actualAnimationRuntimeEnabledNow: false,
  actualSoundAutoplayEnabledNow: false,
  realSendRuntimeEnabledNow: false,
  paymentRuntimeEnabledNow: false,
  providerRuntimeEnabledNow: false,
  walletMutationEnabledNow: false,
  payoutRuntimeEnabledNow: false,
} as const;
