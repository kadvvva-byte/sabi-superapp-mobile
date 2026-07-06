import type { StreamPremiumGiftAsset187A } from "./streamPremiumGiftPack187A";
import type { StreamPremiumGiftEffectProfile187B, StreamGiftHapticImpactStyle187B } from "./streamPremiumGiftEffects187B";
import type { StreamPremiumGiftPreviewExperience187C } from "./streamPremiumGiftPreviewExperience187C";
import type { StreamPremiumGiftFinalPolish187D } from "./streamPremiumGiftFinalPolish187D";
import type { StreamPremiumGiftAppearanceProfile188G } from "./streamPremiumGiftAppearanceEngine188G";
import type { StreamPremiumGiftVisualFxProfile188H } from "./streamPremiumGiftVisualFxPack188H";
import type { StreamPremiumGiftFinalScreenPolish188I } from "./streamPremiumGiftFinalScreenPolish188I";

export type StreamPremiumGiftDiamondPriceTier197C = "micro" | "starter" | "rare" | "epic" | "legendary" | "mythic" | "ultra_mythic";

export type StreamPremiumGiftAsset197C = StreamPremiumGiftAsset187A & {
  diamondPrice: number;
  priceTier197C: StreamPremiumGiftDiamondPriceTier197C;
  coinTopUpDisclosureRu: string;
};

export const streamPremiumGiftPack197CBasePath = "assets/stream/gifts/197c-pack-5-diamond-range" as const;

export const streamPremiumGiftDiamondTopUpPolicy197C = {
  minimumTopUpCoins: 10,
  minimumTopUpUsd: 10,
  usdPerCoin: 1,
  giftPriceMinDiamonds: 1,
  giftPriceMaxDiamonds: 10000,
  disclosureRu: "Цены подарков показываются в алмазах: от 1 до 10000 алмазов. Минимум пополнения баланса: 10 coins = $10. Сейчас это mobile-facing disclosure only: без реального списания, оплаты, provider, Wallet mutation и payout.",
  userFacingOnly: true,
  paymentRuntimeEnabledNow: false,
  providerRuntimeEnabledNow: false,
  walletMutationEnabledNow: false,
  realSendRuntimeEnabledNow: false,
} as const;

export const streamPremiumGiftPack197C: StreamPremiumGiftAsset197C[] = [
  {
    id: "diamond-spark-one", displayName: "Diamond Spark One", displayNameRu: "Алмазная Искра", iconName: "diamond-outline", legacyTitleKey: "giftTierPremium", catalogSegment: "premium",
    previewRu: "микро-искра алмаза с чистым glow", localCostLabel: "1 алмаз · fair gift price", effectLabel: "clean diamond white premium effect", qualityLabel: "Pack 5 premium poster + cue ready", loopLabel: "0.8 сек loop план", visualTone: "clean diamond white", safetyBadge: "diamond price · preview only", rarityLabel: "Micro Premium", motionSpec: "микро-искра алмаза с чистым glow, controlled glow, clean finale", posterFile: "diamond-spark-one.svg", posterFallbackReady: true, mp4LoopPlanned: true, providerRuntimeReadyNow: false, paymentReadyNow: false, payoutReadyNow: false, sendRuntimeReadyNow: false,
    diamondPrice: 1, priceTier197C: "micro", coinTopUpDisclosureRu: "Минимум пополнения: 10 coins = $10; покупка выключена до backend/provider approval."
  },
  {
    id: "aurora-heart-five", displayName: "Aurora Heart Five", displayNameRu: "Аврора Сердце", iconName: "heart-circle-outline", legacyTitleKey: "giftTierPremium", catalogSegment: "anime",
    previewRu: "сердце авроры раскрывается мягким сиянием", localCostLabel: "5 алмазов · fair gift price", effectLabel: "aurora heart premium effect", qualityLabel: "Pack 5 premium poster + cue ready", loopLabel: "1.0 сек loop план", visualTone: "aurora heart", safetyBadge: "diamond price · preview only", rarityLabel: "Starter Anime", motionSpec: "сердце авроры раскрывается мягким сиянием, controlled glow, clean finale", posterFile: "aurora-heart-five.svg", posterFallbackReady: true, mp4LoopPlanned: true, providerRuntimeReadyNow: false, paymentReadyNow: false, payoutReadyNow: false, sendRuntimeReadyNow: false,
    diamondPrice: 5, priceTier197C: "starter", coinTopUpDisclosureRu: "Минимум пополнения: 10 coins = $10; покупка выключена до backend/provider approval."
  },
  {
    id: "silver-rose-ten", displayName: "Silver Rose Ten", displayNameRu: "Серебряная Роза", iconName: "rose-outline", legacyTitleKey: "giftTierPremium", catalogSegment: "premium",
    previewRu: "серебряная роза открывается без шумных частиц", localCostLabel: "10 алмазов · fair gift price", effectLabel: "silver rose premium effect", qualityLabel: "Pack 5 premium poster + cue ready", loopLabel: "1.1 сек loop план", visualTone: "silver rose", safetyBadge: "diamond price · preview only", rarityLabel: "Clean Rare", motionSpec: "серебряная роза открывается без шумных частиц, controlled glow, clean finale", posterFile: "silver-rose-ten.svg", posterFallbackReady: true, mp4LoopPlanned: true, providerRuntimeReadyNow: false, paymentReadyNow: false, payoutReadyNow: false, sendRuntimeReadyNow: false,
    diamondPrice: 10, priceTier197C: "rare", coinTopUpDisclosureRu: "Минимум пополнения: 10 coins = $10; покупка выключена до backend/provider approval."
  },
  {
    id: "crystal-cat-twenty-five", displayName: "Crystal Cat Twenty Five", displayNameRu: "Кристальный Кот", iconName: "sparkles-outline", legacyTitleKey: "giftTierPremium", catalogSegment: "anime",
    previewRu: "кристальный кот подмигивает через clean halo", localCostLabel: "25 алмазов · fair gift price", effectLabel: "crystal cat premium effect", qualityLabel: "Pack 5 premium poster + cue ready", loopLabel: "1.3 сек loop план", visualTone: "crystal cat", safetyBadge: "diamond price · preview only", rarityLabel: "Rare Anime", motionSpec: "кристальный кот подмигивает через clean halo, controlled glow, clean finale", posterFile: "crystal-cat-twenty-five.svg", posterFallbackReady: true, mp4LoopPlanned: true, providerRuntimeReadyNow: false, paymentReadyNow: false, payoutReadyNow: false, sendRuntimeReadyNow: false,
    diamondPrice: 25, priceTier197C: "rare", coinTopUpDisclosureRu: "Минимум пополнения: 10 coins = $10; покупка выключена до backend/provider approval."
  },
  {
    id: "royal-pegasus-seventy-five", displayName: "Royal Pegasus Seventy Five", displayNameRu: "Королевский Пегас", iconName: "flash-outline", legacyTitleKey: "giftTierPremium", catalogSegment: "anime",
    previewRu: "пегас открывает royal wing trail", localCostLabel: "75 алмазов · fair gift price", effectLabel: "royal pegasus premium effect", qualityLabel: "Pack 5 premium poster + cue ready", loopLabel: "1.5 сек loop план", visualTone: "royal pegasus", safetyBadge: "diamond price · preview only", rarityLabel: "Epic Premium", motionSpec: "пегас открывает royal wing trail, controlled glow, clean finale", posterFile: "royal-pegasus-seventy-five.svg", posterFallbackReady: true, mp4LoopPlanned: true, providerRuntimeReadyNow: false, paymentReadyNow: false, payoutReadyNow: false, sendRuntimeReadyNow: false,
    diamondPrice: 75, priceTier197C: "epic", coinTopUpDisclosureRu: "Минимум пополнения: 10 coins = $10; покупка выключена до backend/provider approval."
  },
  {
    id: "stellar-train-two-fifty", displayName: "Stellar Train Two Fifty", displayNameRu: "Звёздный Поезд", iconName: "train-outline", legacyTitleKey: "giftTierPremium", catalogSegment: "premium",
    previewRu: "звёздный поезд проходит по нижней safe-area сцене", localCostLabel: "250 алмазов · fair gift price", effectLabel: "stellar rail premium effect", qualityLabel: "Pack 5 premium poster + cue ready", loopLabel: "1.8 сек loop план", visualTone: "stellar rail", safetyBadge: "diamond price · preview only", rarityLabel: "Legendary Motion", motionSpec: "звёздный поезд проходит по нижней safe-area сцене, controlled glow, clean finale", posterFile: "stellar-train-two-fifty.svg", posterFallbackReady: true, mp4LoopPlanned: true, providerRuntimeReadyNow: false, paymentReadyNow: false, payoutReadyNow: false, sendRuntimeReadyNow: false,
    diamondPrice: 250, priceTier197C: "legendary", coinTopUpDisclosureRu: "Минимум пополнения: 10 coins = $10; покупка выключена до backend/provider approval."
  },
  {
    id: "sky-palace-one-thousand", displayName: "Sky Palace One Thousand", displayNameRu: "Небесный Дворец", iconName: "business-outline", legacyTitleKey: "giftTierPremium", catalogSegment: "premium",
    previewRu: "небесный дворец раскрывает золотые ворота", localCostLabel: "1000 алмазов · fair gift price", effectLabel: "sky palace gold premium effect", qualityLabel: "Pack 5 premium poster + cue ready", loopLabel: "2.2 сек loop план", visualTone: "sky palace gold", safetyBadge: "diamond price · preview only", rarityLabel: "Mythic Palace", motionSpec: "небесный дворец раскрывает золотые ворота, controlled glow, clean finale", posterFile: "sky-palace-one-thousand.svg", posterFallbackReady: true, mp4LoopPlanned: true, providerRuntimeReadyNow: false, paymentReadyNow: false, payoutReadyNow: false, sendRuntimeReadyNow: false,
    diamondPrice: 1000, priceTier197C: "mythic", coinTopUpDisclosureRu: "Минимум пополнения: 10 coins = $10; покупка выключена до backend/provider approval."
  },
  {
    id: "imperial-galaxy-ten-thousand", displayName: "Imperial Galaxy Ten Thousand", displayNameRu: "Императорская Галактика", iconName: "planet-outline", legacyTitleKey: "giftTierPremium", catalogSegment: "premium",
    previewRu: "императорская галактика закрывает эфир ultra-premium финалом", localCostLabel: "10000 алмазов · fair gift price", effectLabel: "imperial galaxy premium effect", qualityLabel: "Pack 5 premium poster + cue ready", loopLabel: "3.0 сек loop план", visualTone: "imperial galaxy", safetyBadge: "diamond price · preview only", rarityLabel: "Ultra Mythic Galaxy", motionSpec: "императорская галактика закрывает эфир ultra-premium финалом, controlled glow, clean finale", posterFile: "imperial-galaxy-ten-thousand.svg", posterFallbackReady: true, mp4LoopPlanned: true, providerRuntimeReadyNow: false, paymentReadyNow: false, payoutReadyNow: false, sendRuntimeReadyNow: false,
    diamondPrice: 10000, priceTier197C: "ultra_mythic", coinTopUpDisclosureRu: "Минимум пополнения: 10 coins = $10; покупка выключена до backend/provider approval."
  }
];

export const streamPremiumGiftPack197CIds = new Set(streamPremiumGiftPack197C.map((gift) => gift.id));

function diamondTierLabel197C(gift: StreamPremiumGiftAsset197C): string {
  return `${gift.diamondPrice} алмазов · ${gift.priceTier197C} · честная цена по качеству`;
}

export const streamPremiumGiftPack197CEffectProfiles: StreamPremiumGiftEffectProfile187B[] = streamPremiumGiftPack197C.map((gift, index) => ({
  assetId: gift.id,
  liveEffectLabel: `${gift.visualTone} · diamond gift reveal`,
  intensityLabel: diamondTierLabel197C(gift),
  soundCueLabel: `${gift.id} cue`,
  soundCueLabelRu: `${gift.displayNameRu} cue`,
  soundCueFile: `${streamPremiumGiftPack197CBasePath}/sound-cues/${gift.id}-cue.wav`,
  soundCueDurationMs: [820, 980, 1120, 1260, 1480, 1760, 2200, 2950][index] ?? 1200,
  hapticLabel: gift.diamondPrice >= 1000 ? "finale premium impact" : gift.diamondPrice >= 250 ? "strong premium impact" : gift.diamondPrice >= 75 ? "medium premium impact" : "soft clean impact",
  hapticImpactStyle: (gift.diamondPrice >= 1000 ? "finale" : gift.diamondPrice >= 250 ? "strong" : gift.diamondPrice >= 75 ? "medium" : gift.diamondPrice >= 10 ? "light" : "soft") as StreamGiftHapticImpactStyle187B,
  colorA: ["#EAF7FF", "#FF8CD8", "#DDE8FF", "#A9F5FF", "#FFD76B", "#71B8FF", "#FFE08A", "#B28DFF"][index] ?? "#FFD76B",
  colorB: ["#8FD8FF", "#7CE7FF", "#F7D2FF", "#D3B6FF", "#B7A3FF", "#FFE47A", "#92E7FF", "#FFD76B"][index] ?? "#B28DFF",
  phases: ["diamond price badge entrance", "premium clean loop", "soft finale without fake win"],
  visualFx: ["safe-area glow", "controlled particles", "poster-first diamond badge"],
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

export const streamPremiumGiftPack197CPreviewExperiences: StreamPremiumGiftPreviewExperience187C[] = streamPremiumGiftPack197C.map((gift) => ({
  assetId: gift.id,
  stageLightingLabel: `${gift.visualTone} stage`,
  motionQualityLabel: `${gift.displayNameRu} · ${gift.diamondPrice} алмазов · clean premium preview`,
  soundPreviewLabel: `sound label only: ${gift.displayNameRu} cue`,
  hapticPreviewLabel: `haptic label only: ${gift.priceTier197C}`,
  liveSceneCopyRu: `${gift.displayNameRu} появляется как дорогой clean gift: ${gift.previewRu}. Цена ${gift.diamondPrice} алмазов показана честно, без fake expensive.`,
  safeModeCopyRu: "Preview локальный: звук не autoplay, haptic только metadata, real send/payment disabled.",
  screenReaderHintRu: `${gift.displayNameRu}, цена ${gift.diamondPrice} алмазов, premium preview only, без оплаты и без отправки.`,
  phaseChips: ["diamond price", "premium poster", "clean finale"],
  qualityBadges: [gift.priceTier197C, "fair price", "no fake payment"],
  defaultQuality: gift.diamondPrice >= 75 ? "ultra" : "standard",
  localPreviewUiReadyNow: true,
  actualSoundPlaybackRuntimeEnabledNow: false,
  realSendRuntimeEnabledNow: false,
  backendRuntimeEnabledNow: false,
  paymentRuntimeEnabledNow: false,
  payoutRuntimeEnabledNow: false,
}));

export const streamPremiumGiftPack197CFinalPolishProfiles: StreamPremiumGiftFinalPolish187D[] = streamPremiumGiftPack197C.map((gift) => ({
  assetId: gift.id,
  heroPosterFile: `${streamPremiumGiftPack197CBasePath}/posters/${gift.posterFile}`,
  animeStyleLabel: `${gift.visualTone} diamond gift`,
  premiumBadge: `${gift.diamondPrice} diamonds · ${gift.priceTier197C}`,
  catalogHeroCopyRu: `${gift.displayNameRu} держит качество даже на цене ${gift.diamondPrice} алмазов: clean poster, glow, readable layer.`,
  stageAuraCopyRu: `${gift.visualTone} aura · safe-area recipient focus · no noisy spam`,
  visualSignature: `${gift.effectLabel} · controlled particles`,
  soundSignature: `cue metadata only · no autoplay · ${gift.id}-cue.wav`,
  hapticSignature: `haptic metadata only · ${gift.priceTier197C}`,
  posterDetailChips: ["diamond price", "premium poster", "safe-area"],
  polishBadgeChips: ["197C", gift.priceTier197C, `${gift.diamondPrice} diamonds`],
  finalSafetyCopyRu: "197C only displays diamond pricing and premium preview metadata. It does not top up coins, charge money, send gifts, mutate Wallet, call provider or enable payout.",
  finalPolishReadyNow: true,
  posterFallbackReadyNow: true,
  localPreviewOnlyNow: true,
  backendRuntimeEnabledNow: false,
  paymentRuntimeEnabledNow: false,
  realSendRuntimeEnabledNow: false,
  payoutRuntimeEnabledNow: false,
}));

export const streamPremiumGiftPack197CAppearanceProfiles: StreamPremiumGiftAppearanceProfile188G[] = streamPremiumGiftPack197C.map((gift) => ({
  assetId: gift.id,
  packLabelRu: "Pack 5 · Diamond Range",
  appearanceTitleRu: `${gift.displayNameRu} · diamond-priced premium appearance`,
  fullScreenLayerRu: `clean safe-area layer with ${gift.diamondPrice} diamond badge`,
  entranceRu: `${gift.visualTone} entrance · ${gift.previewRu}`,
  loopRu: "premium loop with restrained particles and readable recipient focus",
  finaleRu: "soft fade finale, no fake win and no casino wording",
  entranceDurationMs: gift.diamondPrice >= 1000 ? 520 : 360,
  loopDurationMs: gift.diamondPrice >= 1000 ? 2200 : gift.diamondPrice >= 250 ? 1760 : 1260,
  finaleDurationMs: gift.diamondPrice >= 1000 ? 760 : 520,
  stageLightingRu: `${gift.visualTone} luxury lighting`,
  backgroundDimRu: "background dim keeps chat readable",
  particleSystemRu: "controlled diamonds / sparkles only, no noisy spam",
  motionTrailRu: gift.motionSpec,
  recipientFocusRu: "recipient stays clear in safe-area glow",
  soundHitRu: "cue metadata only; autoplay disabled",
  hapticHitRu: "haptic metadata only; no automatic device impact",
  luxuryMoodRu: `${gift.priceTier197C} quality · fair diamond price`,
  appearanceChipsRu: ["197C", "diamond price", "fair", "poster-first"],
  fallbackCopyRu: "reduce-motion: static poster + diamond price badge + readable label",
  safetyCopyRu: "No backend/payment/provider/Wallet/payout/send/autoplay/random-win runtime in 197C.",
  userFacingOnly: true,
  previewOnlyNow: true,
  backendRuntimeEnabledNow: false,
  paymentRuntimeEnabledNow: false,
  providerRuntimeEnabledNow: false,
  payoutRuntimeEnabledNow: false,
  sendRuntimeEnabledNow: false,
  randomWinRuntimeEnabledNow: false,
}));

export const streamPremiumGiftPack197CVisualFxProfiles: StreamPremiumGiftVisualFxProfile188H[] = streamPremiumGiftPack197C.map((gift) => ({
  assetId: gift.id,
  visualFxTitleRu: `${gift.displayNameRu} · Pack 5 Diamond FX`,
  primaryGlowRu: `${gift.visualTone} primary glow`,
  particleBurstRu: `diamond particles scaled to ${gift.priceTier197C}`,
  motionTrailRu: gift.motionSpec,
  auraRu: `${gift.displayNameRu} recipient aura`,
  screenImpactRu: gift.diamondPrice >= 1000 ? "cinematic full-screen impact with safe-area discipline" : "clean compact premium impact",
  finaleBurstRu: "soft diamond finale, no fake win language",
  luxuryLightingRu: `${gift.visualTone} premium lighting`,
  overlayDepthRu: "poster layer + glow layer + particle layer + label layer",
  particleDensityLabel: gift.diamondPrice >= 1000 ? "ultra controlled" : gift.diamondPrice >= 75 ? "premium controlled" : "clean light",
  glowIntensityLabel: gift.diamondPrice >= 1000 ? "ultra" : gift.diamondPrice >= 75 ? "premium" : "soft",
  burstScaleLabel: gift.diamondPrice >= 1000 ? "full cinematic" : gift.diamondPrice >= 75 ? "wide clean" : "compact",
  trailDurationMs: gift.diamondPrice >= 1000 ? 2400 : gift.diamondPrice >= 250 ? 1700 : 1000,
  auraPulseMs: gift.diamondPrice >= 1000 ? 1200 : 760,
  premiumFxScore: Math.min(100, 90 + streamPremiumGiftPack197C.indexOf(gift) + (gift.diamondPrice >= 10000 ? 3 : 0)),
  fxChipsRu: ["diamonds", gift.priceTier197C, "clean FX"],
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

export const streamPremiumGiftPack197CFinalScreenPolishProfiles: StreamPremiumGiftFinalScreenPolish188I[] = streamPremiumGiftPack197C.map((gift) => ({
  assetId: gift.id,
  finalScreenTitleRu: `${gift.displayNameRu} · ${gift.diamondPrice} алмазов · clean finale`,
  premiumImpactRu: `${gift.previewRu} with fair diamond-price badge and safe recipient focus`,
  soundSignatureRu: "sound cue metadata only, no autoplay",
  hapticSignatureRu: "haptic metadata only, no automatic haptic",
  timingSignatureRu: gift.diamondPrice >= 1000 ? "0.52s entrance · 2.20s loop · 0.76s finale" : "0.36s entrance · 1.26s loop · 0.52s finale",
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

export const streamPremiumGiftPack197CSummary = {
  version: "STREAM-GAME-GIFTS-197C",
  pack5Count: streamPremiumGiftPack197C.length,
  addedGiftCount: streamPremiumGiftPack197C.length,
  diamondPriceMin: Math.min(...streamPremiumGiftPack197C.map((gift) => gift.diamondPrice)),
  diamondPriceMax: Math.max(...streamPremiumGiftPack197C.map((gift) => gift.diamondPrice)),
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

export function getStreamPremiumGiftEffectProfile197C(assetId: string): StreamPremiumGiftEffectProfile187B {
  return streamPremiumGiftPack197CEffectProfiles.find((profile) => profile.assetId === assetId) ?? streamPremiumGiftPack197CEffectProfiles[0];
}

export function getStreamPremiumGiftPreviewExperience197C(assetId: string): StreamPremiumGiftPreviewExperience187C {
  return streamPremiumGiftPack197CPreviewExperiences.find((row) => row.assetId === assetId) ?? streamPremiumGiftPack197CPreviewExperiences[0];
}

export function getStreamPremiumGiftFinalPolish197C(assetId: string): StreamPremiumGiftFinalPolish187D {
  return streamPremiumGiftPack197CFinalPolishProfiles.find((row) => row.assetId === assetId) ?? streamPremiumGiftPack197CFinalPolishProfiles[0];
}

export function getStreamPremiumGiftAppearanceProfile197C(assetId: string): StreamPremiumGiftAppearanceProfile188G {
  return streamPremiumGiftPack197CAppearanceProfiles.find((row) => row.assetId === assetId) ?? streamPremiumGiftPack197CAppearanceProfiles[0];
}

export function getStreamPremiumGiftVisualFxProfile197C(assetId: string): StreamPremiumGiftVisualFxProfile188H {
  return streamPremiumGiftPack197CVisualFxProfiles.find((row) => row.assetId === assetId) ?? streamPremiumGiftPack197CVisualFxProfiles[0];
}

export function getStreamPremiumGiftFinalScreenPolish197C(assetId: string): StreamPremiumGiftFinalScreenPolish188I {
  return streamPremiumGiftPack197CFinalScreenPolishProfiles.find((row) => row.assetId === assetId) ?? streamPremiumGiftPack197CFinalScreenPolishProfiles[0];
}
