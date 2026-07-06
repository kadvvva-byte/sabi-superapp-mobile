import type { StreamPremiumGiftAsset187A } from "./streamPremiumGiftPack187A";
import type { StreamPremiumGiftEffectProfile187B, StreamGiftHapticImpactStyle187B } from "./streamPremiumGiftEffects187B";
import type { StreamPremiumGiftPreviewExperience187C } from "./streamPremiumGiftPreviewExperience187C";
import type { StreamPremiumGiftFinalPolish187D } from "./streamPremiumGiftFinalPolish187D";
import type { StreamPremiumGiftAppearanceProfile188G } from "./streamPremiumGiftAppearanceEngine188G";
import type { StreamPremiumGiftVisualFxProfile188H } from "./streamPremiumGiftVisualFxPack188H";
import type { StreamPremiumGiftFinalScreenPolish188I } from "./streamPremiumGiftFinalScreenPolish188I";
import { streamPremiumGiftDiamondTopUpPolicy197C } from "./streamPremiumGiftPack197C";

export type StreamPremiumGiftDiamondPriceTier197E = "micro" | "rare" | "epic" | "legendary" | "mythic" | "ultra_mythic";

export type StreamPremiumGiftAsset197E = StreamPremiumGiftAsset187A & {
  diamondPrice: number;
  priceTier197E: StreamPremiumGiftDiamondPriceTier197E;
  coinTopUpDisclosureRu: string;
  qualityPromiseRu: string;
};

export const streamPremiumGiftPack197EBasePath = "assets/stream/gifts/197e-pack-7-celestial-dynasty" as const;

export const streamPremiumGiftPack197E: StreamPremiumGiftAsset197E[] = [
  {
    id: "diamond-drop-one", displayName: "Diamond Drop One", displayNameRu: "Алмазная Капля", iconName: "diamond-outline", legacyTitleKey: "giftTierPremium", catalogSegment: "premium",
    previewRu: "одна чистая алмазная капля появляется как аккуратный premium micro gift", localCostLabel: "1 алмаз · fair gift price", effectLabel: "micro diamond drop clean sparkle", qualityLabel: "Pack 7 clean micro poster + cue ready", loopLabel: "0.8 сек loop план", visualTone: "diamond clean", safetyBadge: "diamond price · preview only", rarityLabel: "Micro Premium", motionSpec: "single diamond drop, soft glow, readable price badge, no cheap-looking clutter", posterFile: "diamond-drop-one.svg", posterFallbackReady: true, mp4LoopPlanned: true, providerRuntimeReadyNow: false, paymentReadyNow: false, payoutReadyNow: false, sendRuntimeReadyNow: false,
    diamondPrice: 1, priceTier197E: "micro", coinTopUpDisclosureRu: "Минимум пополнения: 10 coins = $10; покупка выключена до backend/provider approval.", qualityPromiseRu: "Цена соответствует качеству: clean poster, controlled FX, readable safe-area, no fake expensive."
  },
  {
    id: "neon-jasmine-eight", displayName: "Neon Jasmine Eight", displayNameRu: "Неоновый Жасмин", iconName: "flower-outline", legacyTitleKey: "giftTierPremium", catalogSegment: "anime",
    previewRu: "неоновый жасмин раскрывается лёгким цветочным свечением", localCostLabel: "8 алмазов · fair gift price", effectLabel: "neon jasmine soft bloom", qualityLabel: "Pack 7 floral poster + cue ready", loopLabel: "1.0 сек loop план", visualTone: "neon jasmine", safetyBadge: "diamond price · preview only", rarityLabel: "Clean Starter", motionSpec: "jasmine petals open in a controlled arc, glow stays below chat text", posterFile: "neon-jasmine-eight.svg", posterFallbackReady: true, mp4LoopPlanned: true, providerRuntimeReadyNow: false, paymentReadyNow: false, payoutReadyNow: false, sendRuntimeReadyNow: false,
    diamondPrice: 8, priceTier197E: "micro", coinTopUpDisclosureRu: "Минимум пополнения: 10 coins = $10; покупка выключена до backend/provider approval.", qualityPromiseRu: "Цена соответствует качеству: clean poster, controlled FX, readable safe-area, no fake expensive."
  },
  {
    id: "crystal-butterfly-thirty-five", displayName: "Crystal Butterfly Thirty Five", displayNameRu: "Кристальная Бабочка", iconName: "sparkles-outline", legacyTitleKey: "giftTierPremium", catalogSegment: "anime",
    previewRu: "кристальная бабочка делает мягкий крылатый trail", localCostLabel: "35 алмазов · fair gift price", effectLabel: "crystal butterfly wing trail", qualityLabel: "Pack 7 anime crystal poster + cue ready", loopLabel: "1.2 сек loop план", visualTone: "crystal butterfly", safetyBadge: "diamond price · preview only", rarityLabel: "Rare Crystal", motionSpec: "butterfly wing shimmer, compact aura, soft finale", posterFile: "crystal-butterfly-thirty-five.svg", posterFallbackReady: true, mp4LoopPlanned: true, providerRuntimeReadyNow: false, paymentReadyNow: false, payoutReadyNow: false, sendRuntimeReadyNow: false,
    diamondPrice: 35, priceTier197E: "rare", coinTopUpDisclosureRu: "Минимум пополнения: 10 coins = $10; покупка выключена до backend/provider approval.", qualityPromiseRu: "Цена соответствует качеству: clean poster, controlled FX, readable safe-area, no fake expensive."
  },
  {
    id: "royal-lantern-one-twenty", displayName: "Royal Lantern One Twenty", displayNameRu: "Королевский Фонарь", iconName: "flame-outline", legacyTitleKey: "giftTierPremium", catalogSegment: "premium",
    previewRu: "королевский фонарь поднимается золотым светом без шумного огня", localCostLabel: "120 алмазов · fair gift price", effectLabel: "royal lantern golden lift", qualityLabel: "Pack 7 epic light poster + cue ready", loopLabel: "1.5 сек loop план", visualTone: "royal lantern", safetyBadge: "diamond price · preview only", rarityLabel: "Epic Light", motionSpec: "lantern lift, warm safe-area glow, controlled sparkle dust", posterFile: "royal-lantern-one-twenty.svg", posterFallbackReady: true, mp4LoopPlanned: true, providerRuntimeReadyNow: false, paymentReadyNow: false, payoutReadyNow: false, sendRuntimeReadyNow: false,
    diamondPrice: 120, priceTier197E: "epic", coinTopUpDisclosureRu: "Минимум пополнения: 10 coins = $10; покупка выключена до backend/provider approval.", qualityPromiseRu: "Цена соответствует качеству: clean poster, controlled FX, readable safe-area, no fake expensive."
  },
  {
    id: "dragon-pearl-seven-seven-seven", displayName: "Dragon Pearl Seven Seven Seven", displayNameRu: "Жемчуг Дракона", iconName: "ellipse-outline", legacyTitleKey: "giftTierPremium", catalogSegment: "premium",
    previewRu: "жемчуг дракона вращается в premium aura без casino win языка", localCostLabel: "777 алмазов · fair gift price", effectLabel: "dragon pearl orbit aura", qualityLabel: "Pack 7 legendary pearl poster + cue ready", loopLabel: "1.9 сек loop план", visualTone: "dragon pearl", safetyBadge: "diamond price · preview only", rarityLabel: "Legendary Pearl", motionSpec: "pearl orbit, dragon trace, premium finale, no win/cash-out copy", posterFile: "dragon-pearl-seven-seven-seven.svg", posterFallbackReady: true, mp4LoopPlanned: true, providerRuntimeReadyNow: false, paymentReadyNow: false, payoutReadyNow: false, sendRuntimeReadyNow: false,
    diamondPrice: 777, priceTier197E: "legendary", coinTopUpDisclosureRu: "Минимум пополнения: 10 coins = $10; покупка выключена до backend/provider approval.", qualityPromiseRu: "Цена соответствует качеству: clean poster, controlled FX, readable safe-area, no fake expensive."
  },
  {
    id: "silk-road-caravan-two-five-zero-zero", displayName: "Silk Road Caravan Two Five Zero Zero", displayNameRu: "Шёлковый Караван", iconName: "trail-sign-outline", legacyTitleKey: "giftTierPremium", catalogSegment: "premium",
    previewRu: "шёлковый караван проходит как дорогая cinematic сцена", localCostLabel: "2500 алмазов · fair gift price", effectLabel: "silk road caravan cinematic pass", qualityLabel: "Pack 7 mythic caravan poster + cue ready", loopLabel: "2.3 сек loop план", visualTone: "silk road gold", safetyBadge: "diamond price · preview only", rarityLabel: "Mythic Caravan", motionSpec: "gold caravan silhouette, silk trail, luxury particles, recipient remains readable", posterFile: "silk-road-caravan-two-five-zero-zero.svg", posterFallbackReady: true, mp4LoopPlanned: true, providerRuntimeReadyNow: false, paymentReadyNow: false, payoutReadyNow: false, sendRuntimeReadyNow: false,
    diamondPrice: 2500, priceTier197E: "mythic", coinTopUpDisclosureRu: "Минимум пополнения: 10 coins = $10; покупка выключена до backend/provider approval.", qualityPromiseRu: "Цена соответствует качеству: clean poster, controlled FX, readable safe-area, no fake expensive."
  },
  {
    id: "aurora-palace-seven-five-zero-zero", displayName: "Aurora Palace Seven Five Zero Zero", displayNameRu: "Дворец Авроры", iconName: "business-outline", legacyTitleKey: "giftTierPremium", catalogSegment: "premium",
    previewRu: "дворец авроры раскрывается большим, но чистым mythic слоем", localCostLabel: "7500 алмазов · fair gift price", effectLabel: "aurora palace mythic reveal", qualityLabel: "Pack 7 ultra mythic palace poster + cue ready", loopLabel: "2.7 сек loop план", visualTone: "aurora palace", safetyBadge: "diamond price · preview only", rarityLabel: "Ultra Mythic Palace", motionSpec: "aurora curtain, palace reveal, orbit sparkle, no noisy spam", posterFile: "aurora-palace-seven-five-zero-zero.svg", posterFallbackReady: true, mp4LoopPlanned: true, providerRuntimeReadyNow: false, paymentReadyNow: false, payoutReadyNow: false, sendRuntimeReadyNow: false,
    diamondPrice: 7500, priceTier197E: "ultra_mythic", coinTopUpDisclosureRu: "Минимум пополнения: 10 coins = $10; покупка выключена до backend/provider approval.", qualityPromiseRu: "Цена соответствует качеству: clean poster, controlled FX, readable safe-area, no fake expensive."
  },
  {
    id: "celestial-emperor-ten-thousand", displayName: "Celestial Emperor Ten Thousand", displayNameRu: "Небесный Император", iconName: "star-outline", legacyTitleKey: "giftTierPremium", catalogSegment: "premium",
    previewRu: "небесный император открывает самый дорогой чистый финал за 10000 алмазов", localCostLabel: "10000 алмазов · fair gift price", effectLabel: "celestial emperor top tier finale", qualityLabel: "Pack 7 top-tier emperor poster + cue ready", loopLabel: "3.1 сек loop план", visualTone: "celestial emperor", safetyBadge: "diamond price · preview only", rarityLabel: "Ultra Top Emperor", motionSpec: "emperor crest, galaxy silk curtain, crown orbit, clean top-tier fade", posterFile: "celestial-emperor-ten-thousand.svg", posterFallbackReady: true, mp4LoopPlanned: true, providerRuntimeReadyNow: false, paymentReadyNow: false, payoutReadyNow: false, sendRuntimeReadyNow: false,
    diamondPrice: 10000, priceTier197E: "ultra_mythic", coinTopUpDisclosureRu: "Минимум пополнения: 10 coins = $10; покупка выключена до backend/provider approval.", qualityPromiseRu: "Цена соответствует качеству: clean poster, controlled FX, readable safe-area, no fake expensive."
  }
];

export const streamPremiumGiftPack197EIds = new Set(streamPremiumGiftPack197E.map((gift) => gift.id));

function diamondLabel197E(price: number): string {
  return price === 1 ? "1 алмаз" : `${price} алмазов`;
}

function diamondTierLabel197E(gift: StreamPremiumGiftAsset197E): string {
  return `${diamondLabel197E(gift.diamondPrice)} · ${gift.priceTier197E} · честная цена по качеству`;
}

function durationByPrice197E(price: number): number {
  if (price >= 7500) return 3200;
  if (price >= 2500) return 2600;
  if (price >= 777) return 2100;
  if (price >= 120) return 1600;
  return 900;
}

function hapticByPrice197E(price: number): StreamGiftHapticImpactStyle187B {
  if (price >= 2500) return "finale";
  if (price >= 120) return "medium";
  return "light";
}

export const streamPremiumGiftPack197EEffectProfiles: StreamPremiumGiftEffectProfile187B[] = streamPremiumGiftPack197E.map((gift, index) => ({
  assetId: gift.id,
  liveEffectLabel: `${gift.visualTone} · Pack 7 celestial dynasty reveal`,
  intensityLabel: diamondTierLabel197E(gift),
  soundCueLabel: `${gift.id} cue`,
  soundCueLabelRu: `${gift.displayNameRu} cue`,
  soundCueFile: `${streamPremiumGiftPack197EBasePath}/sound-cues/${gift.id}-cue.wav`,
  soundCueDurationMs: durationByPrice197E(gift.diamondPrice),
  hapticLabel: gift.diamondPrice >= 2500 ? "finale luxury impact" : gift.diamondPrice >= 777 ? "strong premium impact" : gift.diamondPrice >= 120 ? "medium premium impact" : "soft clean impact",
  hapticImpactStyle: hapticByPrice197E(gift.diamondPrice),
  colorA: ["#E0F2FE", "#F9A8D4", "#C4B5FD", "#FDE68A", "#FACC15", "#FBBF24", "#93C5FD", "#FDE68A"][index] ?? "#FDE68A",
  colorB: ["#38BDF8", "#22D3EE", "#67E8F9", "#F97316", "#16A34A", "#7C2D12", "#D946EF", "#6366F1"][index] ?? "#6366F1",
  phases: ["diamond price entrance", "celestial premium loop", "clean finale without fake win"],
  visualFx: ["safe-area glow", "controlled particles", "poster-first diamond badge", "celestial dynasty aura"],
  reducedMotionFallback: "poster-first fallback + diamond price label, no heavy playback",
  localSoundAssetReady: true,
  localHapticMetadataReady: true,
  livePreviewRuntimeReadyNow: true,
  soundPlaybackRuntimeEnabledNow: false,
  backendRuntimeReadyNow: false,
  paymentRuntimeReadyNow: false,
  payoutRuntimeReadyNow: false,
  realSendRuntimeReadyNow: false,
}));

export const streamPremiumGiftPack197EPreviewExperiences: StreamPremiumGiftPreviewExperience187C[] = streamPremiumGiftPack197E.map((gift) => ({
  assetId: gift.id,
  stageLightingLabel: `${gift.visualTone} celestial stage`,
  motionQualityLabel: `${gift.displayNameRu} · ${diamondLabel197E(gift.diamondPrice)} · clean premium preview`,
  soundPreviewLabel: `sound label only: ${gift.displayNameRu} cue`,
  hapticPreviewLabel: `haptic label only: ${gift.priceTier197E}`,
  liveSceneCopyRu: `${gift.displayNameRu} появляется как качественный подарок: ${gift.previewRu}. Цена ${diamondLabel197E(gift.diamondPrice)} показана честно, без fake expensive.`,
  safeModeCopyRu: "Preview локальный: звук не autoplay, haptic только metadata, real send/payment disabled.",
  screenReaderHintRu: `${gift.displayNameRu}, цена ${diamondLabel197E(gift.diamondPrice)}, premium preview only, без оплаты и без отправки.`,
  phaseChips: ["diamond price", "celestial poster", "clean finale"],
  qualityBadges: [gift.priceTier197E, "fair price", "no fake payment"],
  defaultQuality: gift.diamondPrice >= 120 ? "ultra" : "standard",
  localPreviewUiReadyNow: true,
  actualSoundPlaybackRuntimeEnabledNow: false,
  realSendRuntimeEnabledNow: false,
  backendRuntimeEnabledNow: false,
  paymentRuntimeEnabledNow: false,
  payoutRuntimeEnabledNow: false,
}));

export const streamPremiumGiftPack197EFinalPolishProfiles: StreamPremiumGiftFinalPolish187D[] = streamPremiumGiftPack197E.map((gift) => ({
  assetId: gift.id,
  heroPosterFile: `${streamPremiumGiftPack197EBasePath}/posters/${gift.posterFile}`,
  animeStyleLabel: `${gift.visualTone} celestial dynasty gift`,
  premiumBadge: `${gift.diamondPrice} diamonds · ${gift.priceTier197E}`,
  catalogHeroCopyRu: `${gift.displayNameRu} держит качество на цене ${diamondLabel197E(gift.diamondPrice)}: clean poster, controlled glow, readable layer.`,
  stageAuraCopyRu: `${gift.visualTone} aura · safe-area recipient focus · no noisy spam`,
  visualSignature: `${gift.effectLabel} · controlled particles`,
  soundSignature: `cue metadata only · no autoplay · ${gift.id}-cue.wav`,
  hapticSignature: `haptic metadata only · ${gift.priceTier197E}`,
  posterDetailChips: ["diamond price", "celestial poster", "safe-area"],
  polishBadgeChips: ["197E", gift.priceTier197E, `${gift.diamondPrice} diamonds`],
  finalSafetyCopyRu: "197E only displays diamond pricing and premium preview metadata. It does not top up coins, charge money, send gifts, mutate Wallet, call provider or enable payout.",
  finalPolishReadyNow: true,
  posterFallbackReadyNow: true,
  localPreviewOnlyNow: true,
  backendRuntimeEnabledNow: false,
  paymentRuntimeEnabledNow: false,
  realSendRuntimeEnabledNow: false,
  payoutRuntimeEnabledNow: false,
}));

export const streamPremiumGiftPack197EAppearanceProfiles: StreamPremiumGiftAppearanceProfile188G[] = streamPremiumGiftPack197E.map((gift) => ({
  assetId: gift.id,
  packLabelRu: "Pack 7 · Celestial Dynasty",
  appearanceTitleRu: `${gift.displayNameRu} · celestial dynasty diamond appearance`,
  fullScreenLayerRu: `clean safe-area layer with ${diamondLabel197E(gift.diamondPrice)} badge`,
  entranceRu: `${gift.visualTone} entrance · ${gift.previewRu}`,
  loopRu: "celestial premium loop with restrained particles and readable recipient focus",
  finaleRu: "soft fade finale, no fake win and no casino wording",
  entranceDurationMs: gift.diamondPrice >= 2500 ? 600 : 380,
  loopDurationMs: gift.diamondPrice >= 7500 ? 2800 : gift.diamondPrice >= 2500 ? 2300 : gift.diamondPrice >= 777 ? 1880 : 1240,
  finaleDurationMs: gift.diamondPrice >= 2500 ? 820 : 540,
  stageLightingRu: `${gift.visualTone} luxury lighting`,
  backgroundDimRu: "background dim keeps chat readable",
  particleSystemRu: "controlled celestial diamonds / sparkles only, no noisy spam",
  motionTrailRu: gift.motionSpec,
  recipientFocusRu: "recipient stays clear in safe-area glow",
  soundHitRu: "cue metadata only; autoplay disabled",
  hapticHitRu: "haptic metadata only; no automatic device impact",
  luxuryMoodRu: `${gift.priceTier197E} quality · fair diamond price`,
  appearanceChipsRu: ["197E", "Pack 7", "diamond price", "poster-first"],
  fallbackCopyRu: "reduce-motion: static poster + diamond price badge + readable label",
  safetyCopyRu: "No backend/payment/provider/Wallet/payout/send/autoplay/random-win runtime in 197E.",
  userFacingOnly: true,
  previewOnlyNow: true,
  backendRuntimeEnabledNow: false,
  paymentRuntimeEnabledNow: false,
  providerRuntimeEnabledNow: false,
  payoutRuntimeEnabledNow: false,
  sendRuntimeEnabledNow: false,
  randomWinRuntimeEnabledNow: false,
}));

export const streamPremiumGiftPack197EVisualFxProfiles: StreamPremiumGiftVisualFxProfile188H[] = streamPremiumGiftPack197E.map((gift, index) => ({
  assetId: gift.id,
  visualFxTitleRu: `${gift.displayNameRu} · Pack 7 Celestial Dynasty FX`,
  primaryGlowRu: `${gift.visualTone} primary glow`,
  particleBurstRu: `celestial diamond particles scaled to ${gift.priceTier197E}`,
  motionTrailRu: gift.motionSpec,
  auraRu: `${gift.displayNameRu} recipient aura`,
  screenImpactRu: gift.diamondPrice >= 2500 ? "cinematic full-screen impact with safe-area discipline" : "clean compact premium impact",
  finaleBurstRu: "soft celestial finale, no fake win language",
  luxuryLightingRu: `${gift.visualTone} premium lighting`,
  overlayDepthRu: "poster layer + glow layer + particle layer + diamond label layer",
  particleDensityLabel: gift.diamondPrice >= 2500 ? "ultra controlled" : gift.diamondPrice >= 120 ? "premium controlled" : "clean light",
  glowIntensityLabel: gift.diamondPrice >= 2500 ? "ultra" : gift.diamondPrice >= 120 ? "premium" : "soft",
  burstScaleLabel: gift.diamondPrice >= 2500 ? "full cinematic" : gift.diamondPrice >= 120 ? "wide clean" : "compact",
  trailDurationMs: gift.diamondPrice >= 2500 ? 2500 : gift.diamondPrice >= 777 ? 1900 : 1040,
  auraPulseMs: gift.diamondPrice >= 2500 ? 1300 : 760,
  premiumFxScore: Math.min(100, 92 + index + (gift.diamondPrice >= 7500 ? 2 : 0)),
  fxChipsRu: ["diamonds", gift.priceTier197E, "celestial FX"],
  fallbackCopyRu: "lite: poster + price badge, animation/audio disabled",
  safetyCopyRu: "FX metadata only: actual animation playback/autoplay/payment/send/provider disabled.",
  userFacingOnly: true,
  previewOnlyNow: true,
  backendRuntimeEnabledNow: false,
  paymentRuntimeEnabledNow: false,
  providerRuntimeEnabledNow: false,
  payoutRuntimeEnabledNow: false,
  sendRuntimeEnabledNow: false,
  actualAnimationRuntimeEnabledNow: false,
  actualSoundAutoplayEnabledNow: false,
  randomWinRuntimeEnabledNow: false,
}));

export const streamPremiumGiftPack197EFinalScreenPolishProfiles: StreamPremiumGiftFinalScreenPolish188I[] = streamPremiumGiftPack197E.map((gift) => ({
  assetId: gift.id,
  finalScreenTitleRu: `${gift.displayNameRu} · ${diamondLabel197E(gift.diamondPrice)} · clean finale`,
  premiumImpactRu: `${gift.previewRu} with fair diamond-price badge and safe recipient focus`,
  soundSignatureRu: "sound cue metadata only, no autoplay",
  hapticSignatureRu: "haptic metadata only, no automatic haptic",
  timingSignatureRu: gift.diamondPrice >= 2500 ? "0.60s entrance · 2.30s+ loop · 0.82s finale" : "0.38s entrance · 1.24s loop · 0.54s finale",
  finaleCloseRu: "premium soft fade without fake win, cash-out or gambling wording",
  recipientFocusRu: "recipient highlight remains readable and not covered by particles",
  crowdMomentRu: `chat sees fair diamond gift price: ${gift.diamondPrice} diamonds`,
  reduceMotionFallbackRu: "static poster + diamond price badge + no-motion glow",
  soundPreviewRuntimeEnabledNow: false,
  realGiftSendRuntimeEnabledNow: false,
  paymentRuntimeEnabledNow: false,
  payoutRuntimeEnabledNow: false,
  backendRuntimeEnabledNow: false,
}));

export const streamPremiumGiftPack197ESummary = {
  version: "STREAM-GAME-GIFTS-197E",
  pack7Count: streamPremiumGiftPack197E.length,
  addedGiftCount: streamPremiumGiftPack197E.length,
  cumulativeGiftCountAfter197E: 56,
  diamondPriceMin: Math.min(...streamPremiumGiftPack197E.map((gift) => gift.diamondPrice)),
  diamondPriceMax: Math.max(...streamPremiumGiftPack197E.map((gift) => gift.diamondPrice)),
  totalDiamondRangeMin: streamPremiumGiftDiamondTopUpPolicy197C.giftPriceMinDiamonds,
  totalDiamondRangeMax: streamPremiumGiftDiamondTopUpPolicy197C.giftPriceMaxDiamonds,
  minimumTopUpCoins: streamPremiumGiftDiamondTopUpPolicy197C.minimumTopUpCoins,
  minimumTopUpUsd: streamPremiumGiftDiamondTopUpPolicy197C.minimumTopUpUsd,
  userFacingOnly: true,
  sourceOnly: true,
  backendRuntimeEnabledNow: false,
  paymentRuntimeEnabledNow: false,
  providerRuntimeEnabledNow: false,
  payoutRuntimeEnabledNow: false,
  walletMutationEnabledNow: false,
  realSendRuntimeEnabledNow: false,
  actualSoundAutoplayRuntimeEnabledNow: false,
} as const;

export function getStreamPremiumGiftEffectProfile197E(assetId: string): StreamPremiumGiftEffectProfile187B {
  return streamPremiumGiftPack197EEffectProfiles.find((profile) => profile.assetId === assetId) ?? streamPremiumGiftPack197EEffectProfiles[0];
}

export function getStreamPremiumGiftPreviewExperience197E(assetId: string): StreamPremiumGiftPreviewExperience187C {
  return streamPremiumGiftPack197EPreviewExperiences.find((row) => row.assetId === assetId) ?? streamPremiumGiftPack197EPreviewExperiences[0];
}

export function getStreamPremiumGiftFinalPolish197E(assetId: string): StreamPremiumGiftFinalPolish187D {
  return streamPremiumGiftPack197EFinalPolishProfiles.find((row) => row.assetId === assetId) ?? streamPremiumGiftPack197EFinalPolishProfiles[0];
}

export function getStreamPremiumGiftAppearanceProfile197E(assetId: string): StreamPremiumGiftAppearanceProfile188G {
  return streamPremiumGiftPack197EAppearanceProfiles.find((row) => row.assetId === assetId) ?? streamPremiumGiftPack197EAppearanceProfiles[0];
}

export function getStreamPremiumGiftVisualFxProfile197E(assetId: string): StreamPremiumGiftVisualFxProfile188H {
  return streamPremiumGiftPack197EVisualFxProfiles.find((row) => row.assetId === assetId) ?? streamPremiumGiftPack197EVisualFxProfiles[0];
}

export function getStreamPremiumGiftFinalScreenPolish197E(assetId: string): StreamPremiumGiftFinalScreenPolish188I {
  return streamPremiumGiftPack197EFinalScreenPolishProfiles.find((row) => row.assetId === assetId) ?? streamPremiumGiftPack197EFinalScreenPolishProfiles[0];
}
