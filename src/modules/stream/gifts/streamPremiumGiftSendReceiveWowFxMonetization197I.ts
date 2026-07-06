import {
  getStreamPremiumGiftDiamondEconomy197H,
  streamPremiumGiftDiamondEconomyRows197H,
  streamPremiumGiftDiamondEconomySummary197H,
} from "./streamPremiumGiftDiamondEconomy197H";

export type StreamGiftWowFxBand197I = "micro_clean" | "premium_bloom" | "legendary_stage" | "ultra_cinematic" | "maximum_emperor";
export type StreamGiftReceiverBalanceKind197I = "pending_creator_earnings" | "pending_spend_only_gift_balance";

const DIAMOND_MICROS_197I = 1_000_000;
const BASIS_POINTS_197I = 10_000;

export const streamGiftMonetizationPolicy197I = {
  version: "STREAM-GAME-GIFTS-197I",
  diamondsPerCoin: 100,
  coinUsdCents: 100,
  diamondUsdCents: 1,
  minimumTopUpCoins: 10,
  minimumTopUpUsdCents: 1000,
  giftPriceMinDiamonds: 1,
  giftPriceMaxDiamonds: 10000,
  receiverShareBps: 7000,
  platformFeeBps: 3000,
  receiverBalanceKindForOfficialCreator: "pending_creator_earnings" as StreamGiftReceiverBalanceKind197I,
  receiverBalanceKindForRegularUser: "pending_spend_only_gift_balance" as StreamGiftReceiverBalanceKind197I,
  precisionUnit: "diamond_micros",
  exactIntegerMathOnly: true,
  backendLedgerSettlementRequired: true,
  receiverAvailableBalanceRequiresSettlement: true,
  cashOutRequiresOfficialCreatorKycAmlTaxApproval: true,
  userFacingPreviewOnlyNow: true,
  realSendRuntimeEnabledNow: false,
  realTopUpRuntimeEnabledNow: false,
  paymentRuntimeEnabledNow: false,
  providerRuntimeEnabledNow: false,
  walletMutationEnabledNow: false,
  payoutRuntimeEnabledNow: false,
} as const;

export type StreamGiftReceiverMonetizationCalculation197I = {
  assetId: string;
  displayNameRu: string;
  quantity: number;
  diamondPrice: number;
  senderDebitDiamonds: number;
  senderDebitDiamondMicros: number;
  grossUsdCentMicros: number;
  receiverShareBps: number;
  platformFeeBps: number;
  receiverPendingDiamondMicros: number;
  platformFeeDiamondMicros: number;
  receiverPendingUsdCentMicros: number;
  platformFeeUsdCentMicros: number;
  receiverBalanceKind: StreamGiftReceiverBalanceKind197I;
  senderDebitLabelRu: string;
  grossUsdLabelRu: string;
  receiverPendingLabelRu: string;
  platformFeeLabelRu: string;
  balanceArrivalLabelRu: string;
  settlementLabelRu: string;
  exactFormulaRu: string;
  calculationChecklistRu: readonly string[];
  backendLedgerSettlementRequired: true;
  receiverAvailableBalanceNow: false;
  userFacingPreviewOnlyNow: true;
  realSendRuntimeEnabledNow: false;
  paymentRuntimeEnabledNow: false;
  providerRuntimeEnabledNow: false;
  walletMutationEnabledNow: false;
  payoutRuntimeEnabledNow: false;
};

export type StreamGiftSendReceiveWowFxProfile197I = {
  assetId: string;
  displayNameRu: string;
  diamondPrice: number;
  fxBand: StreamGiftWowFxBand197I;
  wowScore: number;
  totalDurationMs: number;
  stageLabelRu: string;
  sendEntranceRu: string;
  receiveEntranceRu: string;
  receiverBalanceRevealRu: string;
  finaleRu: string;
  safeAreaLayerRu: string;
  particleDisciplineRu: string;
  glowAuraTrailRu: string;
  timingRu: readonly string[];
  renderLayersRu: readonly string[];
  reduceMotionFallbackRu: string;
  monetization: StreamGiftReceiverMonetizationCalculation197I;
  qualityChecklistRu: readonly string[];
  userFacingPreviewOnlyNow: true;
  actualAnimationRuntimeEnabledNow: false;
  actualSoundAutoplayEnabledNow: false;
  realSendRuntimeEnabledNow: false;
  paymentRuntimeEnabledNow: false;
  providerRuntimeEnabledNow: false;
  walletMutationEnabledNow: false;
  payoutRuntimeEnabledNow: false;
};

function clampQuantity197I(quantity: number): number {
  if (!Number.isFinite(quantity)) return 1;
  return Math.max(1, Math.min(99, Math.trunc(quantity)));
}

function formatDiamondMicros197I(micros: number): string {
  const sign = micros < 0 ? "-" : "";
  const safe = Math.abs(Math.trunc(micros));
  const whole = Math.trunc(safe / DIAMOND_MICROS_197I);
  const cents = Math.trunc((safe % DIAMOND_MICROS_197I) / 10_000);
  return `${sign}${whole}.${String(cents).padStart(2, "0")} алмаза`;
}

function formatUsdCentMicros197I(centMicros: number): string {
  const sign = centMicros < 0 ? "-" : "";
  const safe = Math.abs(Math.trunc(centMicros));
  const wholeCents = Math.trunc(safe / DIAMOND_MICROS_197I);
  const centFraction = Math.trunc((safe % DIAMOND_MICROS_197I) / 10_000);
  const dollars = Math.trunc(wholeCents / 100);
  const cents = wholeCents % 100;
  const base = `${sign}$${dollars}.${String(cents).padStart(2, "0")}`;
  return centFraction > 0 ? `${base} + 0.${String(centFraction).padStart(2, "0")}¢` : base;
}

function fxBand197I(price: number): StreamGiftWowFxBand197I {
  if (price >= 10000) return "maximum_emperor";
  if (price >= 5000) return "ultra_cinematic";
  if (price >= 1000) return "legendary_stage";
  if (price >= 100) return "premium_bloom";
  return "micro_clean";
}

function totalDuration197I(band: StreamGiftWowFxBand197I): number {
  switch (band) {
    case "maximum_emperor": return 4800;
    case "ultra_cinematic": return 4300;
    case "legendary_stage": return 3600;
    case "premium_bloom": return 2800;
    default: return 1900;
  }
}

function wowScore197I(price: number): number {
  if (price >= 10000) return 100;
  if (price >= 5000) return 98;
  if (price >= 1000) return 96;
  if (price >= 100) return 94;
  return 91;
}

function stageLabel197I(band: StreamGiftWowFxBand197I): string {
  switch (band) {
    case "maximum_emperor": return "MAXIMUM EMPEROR · full-screen royal cinematic arrival";
    case "ultra_cinematic": return "ULTRA CINEMATIC · palace-scale gift entrance";
    case "legendary_stage": return "LEGENDARY STAGE · spotlight + aura + premium finale";
    case "premium_bloom": return "PREMIUM BLOOM · polished spotlight gift entrance";
    default: return "MICRO CLEAN · small price, still premium and clean";
  }
}

function sendEntrance197I(band: StreamGiftWowFxBand197I, nameRu: string): string {
  switch (band) {
    case "maximum_emperor": return `${nameRu}: тёмная сцена, золотой spotlight, crown gate, медленный hero-reveal и мощный controlled finale.`;
    case "ultra_cinematic": return `${nameRu}: full-screen aura, palace trail, layered particles, дорогой glow без шума.`;
    case "legendary_stage": return `${nameRu}: spotlight open, ribbon trail, premium burst, readable title.`;
    case "premium_bloom": return `${nameRu}: soft bloom, clean trail, compact finale, заметно лучше обычной карточки.`;
    default: return `${nameRu}: быстрый clean sparkle, мягкий glow, не выглядит дешево даже за низкую цену.`;
  }
}

function receiveEntrance197I(band: StreamGiftWowFxBand197I, nameRu: string): string {
  switch (band) {
    case "maximum_emperor": return `${nameRu}: у получателя появляется royal receive-stage, имя отправителя, подарок, pending balance delta и settlement badge.`;
    case "ultra_cinematic": return `${nameRu}: receive overlay открывает подарок, затем баланс получателя подсвечивается premium delta-chip.`;
    case "legendary_stage": return `${nameRu}: получатель видит gift arrival + pending balance reveal в одном clean блоке.`;
    case "premium_bloom": return `${nameRu}: gift arrival показывает сумму pending balance без fake зачисления.`;
    default: return `${nameRu}: лёгкий receive toast + точный pending balance delta.`;
  }
}

export function calculateStreamGiftReceiverMonetization197I(
  assetId: string,
  quantityInput = 1,
  receiverIsOfficialCreator = true,
): StreamGiftReceiverMonetizationCalculation197I {
  const row = getStreamPremiumGiftDiamondEconomy197H(assetId);
  const quantity = clampQuantity197I(quantityInput);
  const senderDebitDiamonds = row.diamondPrice * quantity;
  const senderDebitDiamondMicros = senderDebitDiamonds * DIAMOND_MICROS_197I;
  const receiverPendingDiamondMicros = Math.trunc(senderDebitDiamondMicros * streamGiftMonetizationPolicy197I.receiverShareBps / BASIS_POINTS_197I);
  const platformFeeDiamondMicros = senderDebitDiamondMicros - receiverPendingDiamondMicros;
  const receiverBalanceKind = receiverIsOfficialCreator
    ? streamGiftMonetizationPolicy197I.receiverBalanceKindForOfficialCreator
    : streamGiftMonetizationPolicy197I.receiverBalanceKindForRegularUser;
  const receiverPendingLabelRu = `Получателю pending: ${formatDiamondMicros197I(receiverPendingDiamondMicros)} (${streamGiftMonetizationPolicy197I.receiverShareBps / 100}%)`;
  const platformFeeLabelRu = `Платформа/комиссия: ${formatDiamondMicros197I(platformFeeDiamondMicros)} (${streamGiftMonetizationPolicy197I.platformFeeBps / 100}%)`;
  return {
    assetId,
    displayNameRu: row.displayNameRu,
    quantity,
    diamondPrice: row.diamondPrice,
    senderDebitDiamonds,
    senderDebitDiamondMicros,
    grossUsdCentMicros: senderDebitDiamondMicros,
    receiverShareBps: streamGiftMonetizationPolicy197I.receiverShareBps,
    platformFeeBps: streamGiftMonetizationPolicy197I.platformFeeBps,
    receiverPendingDiamondMicros,
    platformFeeDiamondMicros,
    receiverPendingUsdCentMicros: receiverPendingDiamondMicros,
    platformFeeUsdCentMicros: platformFeeDiamondMicros,
    receiverBalanceKind,
    senderDebitLabelRu: `Списать с отправителя после backend approval: ${senderDebitDiamonds} алмазов · ${quantity}×`,
    grossUsdLabelRu: `Эквивалент gifts: ${formatUsdCentMicros197I(senderDebitDiamondMicros)} при 100 diamonds = 1 coin = $1`,
    receiverPendingLabelRu,
    platformFeeLabelRu,
    balanceArrivalLabelRu: receiverIsOfficialCreator
      ? `${receiverPendingLabelRu} появляется у получателя как pending creator balance после verified gift ledger event.`
      : `${receiverPendingLabelRu} появляется у получателя как spend-only gift balance после verified gift ledger event; cash-out disabled.`,
    settlementLabelRu: "Available balance не рисуем фейком: unlock только после backend ledger settlement, fraud/risk/tax checks and admin/compliance gates.",
    exactFormulaRu: `senderDebitDiamondMicros=${senderDebitDiamonds}*1_000_000; receiverPending=senderDebitDiamondMicros*7000/10000; fee=remainder; no float math.`,
    calculationChecklistRu: [
      "all money-like values are represented as integer diamond_micros",
      "1 coin = 100 diamonds = $1; minimum top-up = 10 coins = $10",
      "receiver pending balance appears only after backend verified gift ledger event",
      "available/cash-out balance is not shown as available until settlement passes",
      "official creator payout requires KYC/KYB/AML/tax/admin approval; regular users cash-out disabled",
    ],
    backendLedgerSettlementRequired: true,
    receiverAvailableBalanceNow: false,
    userFacingPreviewOnlyNow: true,
    realSendRuntimeEnabledNow: false,
    paymentRuntimeEnabledNow: false,
    providerRuntimeEnabledNow: false,
    walletMutationEnabledNow: false,
    payoutRuntimeEnabledNow: false,
  };
}

export function getStreamPremiumGiftSendReceiveWowFx197I(
  assetId: string,
  quantityInput = 1,
  receiverIsOfficialCreator = true,
): StreamGiftSendReceiveWowFxProfile197I {
  const row = getStreamPremiumGiftDiamondEconomy197H(assetId);
  const band = fxBand197I(row.diamondPrice);
  const monetization = calculateStreamGiftReceiverMonetization197I(assetId, quantityInput, receiverIsOfficialCreator);
  const duration = totalDuration197I(band);
  return {
    assetId,
    displayNameRu: row.displayNameRu,
    diamondPrice: row.diamondPrice,
    fxBand: band,
    wowScore: wowScore197I(row.diamondPrice),
    totalDurationMs: duration,
    stageLabelRu: stageLabel197I(band),
    sendEntranceRu: sendEntrance197I(band, row.displayNameRu),
    receiveEntranceRu: receiveEntrance197I(band, row.displayNameRu),
    receiverBalanceRevealRu: monetization.balanceArrivalLabelRu,
    finaleRu: band === "maximum_emperor" ? "clean royal crown finale + soft fade + receiver balance pulse" : "premium finale + soft fade + balance delta pulse",
    safeAreaLayerRu: "full-screen safe-area layer: gift center, sender label top-safe, receiver balance delta bottom-safe, no clipped UI",
    particleDisciplineRu: "controlled particles only: no random noise, no cheap confetti wall, density scales by price tier",
    glowAuraTrailRu: "premium glow + aura + trail: intensity follows diamond price but text stays readable",
    timingRu: [
      `0-${Math.trunc(duration * 0.18)}ms pre-glow and sender confirmation`,
      `${Math.trunc(duration * 0.18)}-${Math.trunc(duration * 0.48)}ms hero gift entrance`,
      `${Math.trunc(duration * 0.48)}-${Math.trunc(duration * 0.72)}ms receiver arrival and balance delta reveal`,
      `${Math.trunc(duration * 0.72)}-${duration}ms finale, soft fade, ledger pending badge`,
    ],
    renderLayersRu: [
      "background dim + spotlight",
      "poster-first hero asset with MP4/WebP future hook",
      "aura/trail/particles by price band",
      "receiver pending balance delta chip",
      "settlement-required badge, never fake available cash-out",
    ],
    reduceMotionFallbackRu: "reduce-motion: poster card + one glow pulse + balance delta text; no autoplay sound.",
    monetization,
    qualityChecklistRu: [
      "wow premium entrance is required for every price tier",
      "expensive gifts must have larger stage, longer timing, stronger aura, and cleaner finale",
      "receiver sees balance delta as pending after verified gift ledger event",
      "all calculations use integer micros and basis points, no floating money math",
      "real send/payment/provider/payout stays disabled in this mobile patch",
    ],
    userFacingPreviewOnlyNow: true,
    actualAnimationRuntimeEnabledNow: false,
    actualSoundAutoplayEnabledNow: false,
    realSendRuntimeEnabledNow: false,
    paymentRuntimeEnabledNow: false,
    providerRuntimeEnabledNow: false,
    walletMutationEnabledNow: false,
    payoutRuntimeEnabledNow: false,
  };
}

export const streamPremiumGiftSendReceiveWowFxRows197I: readonly StreamGiftSendReceiveWowFxProfile197I[] = streamPremiumGiftDiamondEconomyRows197H.map((row) => getStreamPremiumGiftSendReceiveWowFx197I(row.assetId));

export const streamPremiumGiftSendReceiveWowFxSummary197I = {
  version: "STREAM-GAME-GIFTS-197I",
  totalGiftCount: streamPremiumGiftSendReceiveWowFxRows197I.length,
  cumulativeGiftCount: streamPremiumGiftDiamondEconomySummary197H.totalGiftCount,
  diamondPriceMin: streamGiftMonetizationPolicy197I.giftPriceMinDiamonds,
  diamondPriceMax: streamGiftMonetizationPolicy197I.giftPriceMaxDiamonds,
  minimumTopUpCoins: streamGiftMonetizationPolicy197I.minimumTopUpCoins,
  minimumTopUpUsdCents: streamGiftMonetizationPolicy197I.minimumTopUpUsdCents,
  receiverShareBps: streamGiftMonetizationPolicy197I.receiverShareBps,
  platformFeeBps: streamGiftMonetizationPolicy197I.platformFeeBps,
  precisionUnit: streamGiftMonetizationPolicy197I.precisionUnit,
  exactIntegerMathOnly: true,
  wowFxBands: ["micro_clean", "premium_bloom", "legendary_stage", "ultra_cinematic", "maximum_emperor"] as const,
  userFacingPreviewOnlyNow: true,
  backendLedgerSettlementRequired: true,
  realSendRuntimeEnabledNow: false,
  paymentRuntimeEnabledNow: false,
  providerRuntimeEnabledNow: false,
  walletMutationEnabledNow: false,
  payoutRuntimeEnabledNow: false,
} as const;
