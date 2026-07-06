import type { StreamPremiumGiftAsset187A } from "./streamPremiumGiftPack187A";
import type { StreamPremiumGiftEffectProfile187B, StreamGiftHapticImpactStyle187B } from "./streamPremiumGiftEffects187B";
import type { StreamPremiumGiftPreviewExperience187C } from "./streamPremiumGiftPreviewExperience187C";
import type { StreamPremiumGiftFinalPolish187D } from "./streamPremiumGiftFinalPolish187D";
import type { StreamPremiumGiftAppearanceProfile188G } from "./streamPremiumGiftAppearanceEngine188G";
import type { StreamPremiumGiftVisualFxProfile188H } from "./streamPremiumGiftVisualFxPack188H";
import type { StreamPremiumGiftFinalScreenPolish188I } from "./streamPremiumGiftFinalScreenPolish188I";
import { streamPremiumGiftDiamondTopUpPolicy197C } from "./streamPremiumGiftPack197C";

export type StreamPremiumGiftDiamondPriceTier197D = "micro" | "rare" | "epic" | "legendary" | "mythic" | "ultra_mythic";

export type StreamPremiumGiftAsset197D = StreamPremiumGiftAsset187A & {
  diamondPrice: number;
  priceTier197D: StreamPremiumGiftDiamondPriceTier197D;
  coinTopUpDisclosureRu: string;
  qualityPromiseRu: string;
};

export const streamPremiumGiftPack197DBasePath = "assets/stream/gifts/197d-pack-6-royal-mythic" as const;

export const streamPremiumGiftPack197D: StreamPremiumGiftAsset197D[] = [
  {
    id: "jade-like-spark", displayName: "Jade Like Spark", displayNameRu: "Нефритовый Лайк", iconName: "thumbs-up-outline", legacyTitleKey: "giftTierPremium", catalogSegment: "premium",
    previewRu: "нефритовый лайк вспыхивает чистым premium sparkle", localCostLabel: "2 алмаза · fair gift price", effectLabel: "jade micro premium sparkle", qualityLabel: "Pack 6 clean poster + cue ready", loopLabel: "0.9 сек loop план", visualTone: "jade clean", safetyBadge: "diamond price · preview only", rarityLabel: "Micro Clean", motionSpec: "нефритовый badge появляется, sparkle держит safe-area, soft fade", posterFile: "jade-like-spark.svg", posterFallbackReady: true, mp4LoopPlanned: true, providerRuntimeReadyNow: false, paymentReadyNow: false, payoutReadyNow: false, sendRuntimeReadyNow: false,
    diamondPrice: 2, priceTier197D: "micro", coinTopUpDisclosureRu: "Минимум пополнения: 10 coins = $10; покупка выключена до backend/provider approval.", qualityPromiseRu: "Цена соответствует качеству: clean poster, controlled FX, readable safe-area, no fake expensive."
  },
  {
    id: "sakura-melody-shell", displayName: "Sakura Melody Shell", displayNameRu: "Сакура Мелодия", iconName: "musical-note-outline", legacyTitleKey: "giftTierPremium", catalogSegment: "sound",
    previewRu: "сакура-ноты раскрываются лёгкой музыкальной волной", localCostLabel: "15 алмазов · fair gift price", effectLabel: "sakura melody premium cue", qualityLabel: "Pack 6 anime sound poster + cue ready", loopLabel: "1.1 сек loop план", visualTone: "sakura melody", safetyBadge: "diamond price · preview only", rarityLabel: "Clean Rare", motionSpec: "лепестки идут по нотной дуге, glow не закрывает чат, clean finale", posterFile: "sakura-melody-shell.svg", posterFallbackReady: true, mp4LoopPlanned: true, providerRuntimeReadyNow: false, paymentReadyNow: false, payoutReadyNow: false, sendRuntimeReadyNow: false,
    diamondPrice: 15, priceTier197D: "rare", coinTopUpDisclosureRu: "Минимум пополнения: 10 coins = $10; покупка выключена до backend/provider approval.", qualityPromiseRu: "Цена соответствует качеству: clean poster, controlled FX, readable safe-area, no fake expensive."
  },
  {
    id: "moon-bunny-crown", displayName: "Moon Bunny Crown", displayNameRu: "Лунный Зайчик", iconName: "moon-outline", legacyTitleKey: "giftTierPremium", catalogSegment: "anime",
    previewRu: "лунный зайчик поднимает маленькую premium crown", localCostLabel: "50 алмазов · fair gift price", effectLabel: "moon bunny crown effect", qualityLabel: "Pack 6 anime poster + cue ready", loopLabel: "1.3 сек loop план", visualTone: "moon bunny", safetyBadge: "diamond price · preview only", rarityLabel: "Rare Anime", motionSpec: "moon halo, bunny blink, crown twinkle, soft recipient focus", posterFile: "moon-bunny-crown.svg", posterFallbackReady: true, mp4LoopPlanned: true, providerRuntimeReadyNow: false, paymentReadyNow: false, payoutReadyNow: false, sendRuntimeReadyNow: false,
    diamondPrice: 50, priceTier197D: "rare", coinTopUpDisclosureRu: "Минимум пополнения: 10 coins = $10; покупка выключена до backend/provider approval.", qualityPromiseRu: "Цена соответствует качеству: clean poster, controlled FX, readable safe-area, no fake expensive."
  },
  {
    id: "amber-phoenix-wing", displayName: "Amber Phoenix Wing", displayNameRu: "Янтарный Феникс", iconName: "flame-outline", legacyTitleKey: "giftTierPremium", catalogSegment: "anime",
    previewRu: "янтарный феникс открывает крыло без шумного огня", localCostLabel: "150 алмазов · fair gift price", effectLabel: "amber phoenix wing premium effect", qualityLabel: "Pack 6 epic poster + cue ready", loopLabel: "1.6 сек loop план", visualTone: "amber phoenix", safetyBadge: "diamond price · preview only", rarityLabel: "Epic Premium", motionSpec: "amber wing reveal, controlled fire dust, royal fade", posterFile: "amber-phoenix-wing.svg", posterFallbackReady: true, mp4LoopPlanned: true, providerRuntimeReadyNow: false, paymentReadyNow: false, payoutReadyNow: false, sendRuntimeReadyNow: false,
    diamondPrice: 150, priceTier197D: "epic", coinTopUpDisclosureRu: "Минимум пополнения: 10 coins = $10; покупка выключена до backend/provider approval.", qualityPromiseRu: "Цена соответствует качеству: clean poster, controlled FX, readable safe-area, no fake expensive."
  },
  {
    id: "emerald-supercar-glide", displayName: "Emerald Supercar Glide", displayNameRu: "Изумрудный Автомобиль", iconName: "car-sport-outline", legacyTitleKey: "giftTierPremium", catalogSegment: "premium",
    previewRu: "изумрудный суперкар проходит cinematic glide по нижней сцене", localCostLabel: "500 алмазов · fair gift price", effectLabel: "emerald supercar cinematic glide", qualityLabel: "Pack 6 legendary motion poster + cue ready", loopLabel: "1.9 сек loop план", visualTone: "emerald supercar", safetyBadge: "diamond price · preview only", rarityLabel: "Legendary Motion", motionSpec: "car glide, neon road trace, recipient remains readable", posterFile: "emerald-supercar-glide.svg", posterFallbackReady: true, mp4LoopPlanned: true, providerRuntimeReadyNow: false, paymentReadyNow: false, payoutReadyNow: false, sendRuntimeReadyNow: false,
    diamondPrice: 500, priceTier197D: "legendary", coinTopUpDisclosureRu: "Минимум пополнения: 10 coins = $10; покупка выключена до backend/provider approval.", qualityPromiseRu: "Цена соответствует качеству: clean poster, controlled FX, readable safe-area, no fake expensive."
  },
  {
    id: "atlantis-crown-wave", displayName: "Atlantis Crown Wave", displayNameRu: "Корона Атлантиды", iconName: "water-outline", legacyTitleKey: "giftTierPremium", catalogSegment: "premium",
    previewRu: "корона Атлантиды раскрывается через ocean luxury wave", localCostLabel: "1500 алмазов · fair gift price", effectLabel: "atlantis crown ocean luxury effect", qualityLabel: "Pack 6 mythic poster + cue ready", loopLabel: "2.2 сек loop план", visualTone: "atlantis crown", safetyBadge: "diamond price · preview only", rarityLabel: "Mythic Ocean", motionSpec: "ocean gate opens, crown rises, pearl light fades clean", posterFile: "atlantis-crown-wave.svg", posterFallbackReady: true, mp4LoopPlanned: true, providerRuntimeReadyNow: false, paymentReadyNow: false, payoutReadyNow: false, sendRuntimeReadyNow: false,
    diamondPrice: 1500, priceTier197D: "mythic", coinTopUpDisclosureRu: "Минимум пополнения: 10 coins = $10; покупка выключена до backend/provider approval.", qualityPromiseRu: "Цена соответствует качеству: clean poster, controlled FX, readable safe-area, no fake expensive."
  },
  {
    id: "cosmic-castle-orbit", displayName: "Cosmic Castle Orbit", displayNameRu: "Космический Замок", iconName: "planet-outline", legacyTitleKey: "giftTierPremium", catalogSegment: "premium",
    previewRu: "космический замок строит орбиту вокруг safe-area сцены", localCostLabel: "5000 алмазов · fair gift price", effectLabel: "cosmic castle orbit mythic effect", qualityLabel: "Pack 6 ultra mythic poster + cue ready", loopLabel: "2.6 сек loop план", visualTone: "cosmic castle", safetyBadge: "diamond price · preview only", rarityLabel: "Ultra Mythic", motionSpec: "castle reveal, orbit rings, comet accents, no noisy spam", posterFile: "cosmic-castle-orbit.svg", posterFallbackReady: true, mp4LoopPlanned: true, providerRuntimeReadyNow: false, paymentReadyNow: false, payoutReadyNow: false, sendRuntimeReadyNow: false,
    diamondPrice: 5000, priceTier197D: "ultra_mythic", coinTopUpDisclosureRu: "Минимум пополнения: 10 coins = $10; покупка выключена до backend/provider approval.", qualityPromiseRu: "Цена соответствует качеству: clean poster, controlled FX, readable safe-area, no fake expensive."
  },
  {
    id: "sultan-universe-throne", displayName: "Sultan Universe Throne", displayNameRu: "Султанская Вселенная", iconName: "sparkles-outline", legacyTitleKey: "giftTierPremium", catalogSegment: "premium",
    previewRu: "султанский трон открывает вселенную ultra-premium финалом", localCostLabel: "9999 алмазов · fair gift price", effectLabel: "sultan universe ultra premium finale", qualityLabel: "Pack 6 top-tier poster + cue ready", loopLabel: "3.0 сек loop план", visualTone: "sultan universe", safetyBadge: "diamond price · preview only", rarityLabel: "Ultra Top Mythic", motionSpec: "throne reveal, galaxy curtain, gold orbit, clean finale", posterFile: "sultan-universe-throne.svg", posterFallbackReady: true, mp4LoopPlanned: true, providerRuntimeReadyNow: false, paymentReadyNow: false, payoutReadyNow: false, sendRuntimeReadyNow: false,
    diamondPrice: 9999, priceTier197D: "ultra_mythic", coinTopUpDisclosureRu: "Минимум пополнения: 10 coins = $10; покупка выключена до backend/provider approval.", qualityPromiseRu: "Цена соответствует качеству: clean poster, controlled FX, readable safe-area, no fake expensive."
  }
];

export const streamPremiumGiftPack197DIds = new Set(streamPremiumGiftPack197D.map((gift) => gift.id));

function diamondLabel197D(price: number): string {
  return price === 1 ? "1 алмаз" : `${price} алмазов`;
}

function diamondTierLabel197D(gift: StreamPremiumGiftAsset197D): string {
  return `${diamondLabel197D(gift.diamondPrice)} · ${gift.priceTier197D} · честная цена по качеству`;
}

function durationByPrice197D(price: number): number {
  if (price >= 5000) return 2920;
  if (price >= 1500) return 2380;
  if (price >= 500) return 1900;
  if (price >= 150) return 1580;
  if (price >= 50) return 1320;
  return 960;
}

function hapticByPrice197D(price: number): StreamGiftHapticImpactStyle187B {
  if (price >= 1500) return "finale";
  if (price >= 500) return "strong";
  if (price >= 150) return "medium";
  if (price >= 15) return "light";
  return "soft";
}

export const streamPremiumGiftPack197DEffectProfiles: StreamPremiumGiftEffectProfile187B[] = streamPremiumGiftPack197D.map((gift, index) => ({
  assetId: gift.id,
  liveEffectLabel: `${gift.visualTone} · Pack 6 royal mythic reveal`,
  intensityLabel: diamondTierLabel197D(gift),
  soundCueLabel: `${gift.id} cue`,
  soundCueLabelRu: `${gift.displayNameRu} cue`,
  soundCueFile: `${streamPremiumGiftPack197DBasePath}/sound-cues/${gift.id}-cue.wav`,
  soundCueDurationMs: durationByPrice197D(gift.diamondPrice),
  hapticLabel: gift.diamondPrice >= 1500 ? "finale luxury impact" : gift.diamondPrice >= 500 ? "strong premium impact" : gift.diamondPrice >= 150 ? "medium premium impact" : "soft clean impact",
  hapticImpactStyle: hapticByPrice197D(gift.diamondPrice),
  colorA: ["#B8FFE1", "#FF9DCD", "#D9E4FF", "#FFB347", "#34D399", "#67E8F9", "#818CF8", "#FFD76B"][index] ?? "#FFD76B",
  colorB: ["#39D98A", "#FFE08A", "#A78BFA", "#FF6B35", "#0EA5E9", "#2563EB", "#F0ABFC", "#B28DFF"][index] ?? "#B28DFF",
  phases: ["diamond badge entrance", "royal premium loop", "clean finale without fake win"],
  visualFx: ["safe-area glow", "controlled particles", "poster-first diamond badge", "royal mythic aura"],
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

export const streamPremiumGiftPack197DPreviewExperiences: StreamPremiumGiftPreviewExperience187C[] = streamPremiumGiftPack197D.map((gift) => ({
  assetId: gift.id,
  stageLightingLabel: `${gift.visualTone} royal stage`,
  motionQualityLabel: `${gift.displayNameRu} · ${diamondLabel197D(gift.diamondPrice)} · clean premium preview`,
  soundPreviewLabel: `sound label only: ${gift.displayNameRu} cue`,
  hapticPreviewLabel: `haptic label only: ${gift.priceTier197D}`,
  liveSceneCopyRu: `${gift.displayNameRu} появляется как качественный дорогой подарок: ${gift.previewRu}. Цена ${diamondLabel197D(gift.diamondPrice)} показана честно, без fake expensive.`,
  safeModeCopyRu: "Preview локальный: звук не autoplay, haptic только metadata, real send/payment disabled.",
  screenReaderHintRu: `${gift.displayNameRu}, цена ${diamondLabel197D(gift.diamondPrice)}, premium preview only, без оплаты и без отправки.`,
  phaseChips: ["diamond price", "royal poster", "clean finale"],
  qualityBadges: [gift.priceTier197D, "fair price", "no fake payment"],
  defaultQuality: gift.diamondPrice >= 150 ? "ultra" : "standard",
  localPreviewUiReadyNow: true,
  actualSoundPlaybackRuntimeEnabledNow: false,
  realSendRuntimeEnabledNow: false,
  backendRuntimeEnabledNow: false,
  paymentRuntimeEnabledNow: false,
  payoutRuntimeEnabledNow: false,
}));

export const streamPremiumGiftPack197DFinalPolishProfiles: StreamPremiumGiftFinalPolish187D[] = streamPremiumGiftPack197D.map((gift) => ({
  assetId: gift.id,
  heroPosterFile: `${streamPremiumGiftPack197DBasePath}/posters/${gift.posterFile}`,
  animeStyleLabel: `${gift.visualTone} royal mythic gift`,
  premiumBadge: `${gift.diamondPrice} diamonds · ${gift.priceTier197D}`,
  catalogHeroCopyRu: `${gift.displayNameRu} держит качество на цене ${diamondLabel197D(gift.diamondPrice)}: clean poster, controlled glow, readable layer.`,
  stageAuraCopyRu: `${gift.visualTone} aura · safe-area recipient focus · no noisy spam`,
  visualSignature: `${gift.effectLabel} · controlled particles`,
  soundSignature: `cue metadata only · no autoplay · ${gift.id}-cue.wav`,
  hapticSignature: `haptic metadata only · ${gift.priceTier197D}`,
  posterDetailChips: ["diamond price", "royal poster", "safe-area"],
  polishBadgeChips: ["197D", gift.priceTier197D, `${gift.diamondPrice} diamonds`],
  finalSafetyCopyRu: "197D only displays diamond pricing and premium preview metadata. It does not top up coins, charge money, send gifts, mutate Wallet, call provider or enable payout.",
  finalPolishReadyNow: true,
  posterFallbackReadyNow: true,
  localPreviewOnlyNow: true,
  backendRuntimeEnabledNow: false,
  paymentRuntimeEnabledNow: false,
  realSendRuntimeEnabledNow: false,
  payoutRuntimeEnabledNow: false,
}));

export const streamPremiumGiftPack197DAppearanceProfiles: StreamPremiumGiftAppearanceProfile188G[] = streamPremiumGiftPack197D.map((gift) => ({
  assetId: gift.id,
  packLabelRu: "Pack 6 · Royal Mythic",
  appearanceTitleRu: `${gift.displayNameRu} · royal mythic diamond appearance`,
  fullScreenLayerRu: `clean safe-area layer with ${diamondLabel197D(gift.diamondPrice)} badge`,
  entranceRu: `${gift.visualTone} entrance · ${gift.previewRu}`,
  loopRu: "royal premium loop with restrained particles and readable recipient focus",
  finaleRu: "soft fade finale, no fake win and no casino wording",
  entranceDurationMs: gift.diamondPrice >= 1500 ? 560 : 380,
  loopDurationMs: gift.diamondPrice >= 5000 ? 2600 : gift.diamondPrice >= 1500 ? 2200 : gift.diamondPrice >= 500 ? 1840 : 1320,
  finaleDurationMs: gift.diamondPrice >= 1500 ? 780 : 540,
  stageLightingRu: `${gift.visualTone} luxury lighting`,
  backgroundDimRu: "background dim keeps chat readable",
  particleSystemRu: "controlled royal diamonds / sparkles only, no noisy spam",
  motionTrailRu: gift.motionSpec,
  recipientFocusRu: "recipient stays clear in safe-area glow",
  soundHitRu: "cue metadata only; autoplay disabled",
  hapticHitRu: "haptic metadata only; no automatic device impact",
  luxuryMoodRu: `${gift.priceTier197D} quality · fair diamond price`,
  appearanceChipsRu: ["197D", "Pack 6", "diamond price", "poster-first"],
  fallbackCopyRu: "reduce-motion: static poster + diamond price badge + readable label",
  safetyCopyRu: "No backend/payment/provider/Wallet/payout/send/autoplay/random-win runtime in 197D.",
  userFacingOnly: true,
  previewOnlyNow: true,
  backendRuntimeEnabledNow: false,
  paymentRuntimeEnabledNow: false,
  providerRuntimeEnabledNow: false,
  payoutRuntimeEnabledNow: false,
  sendRuntimeEnabledNow: false,
  randomWinRuntimeEnabledNow: false,
}));

export const streamPremiumGiftPack197DVisualFxProfiles: StreamPremiumGiftVisualFxProfile188H[] = streamPremiumGiftPack197D.map((gift, index) => ({
  assetId: gift.id,
  visualFxTitleRu: `${gift.displayNameRu} · Pack 6 Royal Mythic FX`,
  primaryGlowRu: `${gift.visualTone} primary glow`,
  particleBurstRu: `royal diamond particles scaled to ${gift.priceTier197D}`,
  motionTrailRu: gift.motionSpec,
  auraRu: `${gift.displayNameRu} recipient aura`,
  screenImpactRu: gift.diamondPrice >= 1500 ? "cinematic full-screen impact with safe-area discipline" : "clean compact premium impact",
  finaleBurstRu: "soft royal finale, no fake win language",
  luxuryLightingRu: `${gift.visualTone} premium lighting`,
  overlayDepthRu: "poster layer + glow layer + particle layer + diamond label layer",
  particleDensityLabel: gift.diamondPrice >= 1500 ? "ultra controlled" : gift.diamondPrice >= 150 ? "premium controlled" : "clean light",
  glowIntensityLabel: gift.diamondPrice >= 1500 ? "ultra" : gift.diamondPrice >= 150 ? "premium" : "soft",
  burstScaleLabel: gift.diamondPrice >= 1500 ? "full cinematic" : gift.diamondPrice >= 150 ? "wide clean" : "compact",
  trailDurationMs: gift.diamondPrice >= 1500 ? 2400 : gift.diamondPrice >= 500 ? 1800 : 1040,
  auraPulseMs: gift.diamondPrice >= 1500 ? 1280 : 760,
  premiumFxScore: Math.min(100, 91 + index + (gift.diamondPrice >= 5000 ? 2 : 0)),
  fxChipsRu: ["diamonds", gift.priceTier197D, "royal FX"],
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

export const streamPremiumGiftPack197DFinalScreenPolishProfiles: StreamPremiumGiftFinalScreenPolish188I[] = streamPremiumGiftPack197D.map((gift) => ({
  assetId: gift.id,
  finalScreenTitleRu: `${gift.displayNameRu} · ${diamondLabel197D(gift.diamondPrice)} · clean finale`,
  premiumImpactRu: `${gift.previewRu} with fair diamond-price badge and safe recipient focus`,
  soundSignatureRu: "sound cue metadata only, no autoplay",
  hapticSignatureRu: "haptic metadata only, no automatic haptic",
  timingSignatureRu: gift.diamondPrice >= 1500 ? "0.56s entrance · 2.20s+ loop · 0.78s finale" : "0.38s entrance · 1.32s loop · 0.54s finale",
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

export const streamPremiumGiftPack197DSummary = {
  version: "STREAM-GAME-GIFTS-197D",
  pack6Count: streamPremiumGiftPack197D.length,
  addedGiftCount: streamPremiumGiftPack197D.length,
  cumulativeGiftCountAfter197D: 48,
  diamondPriceMin: Math.min(...streamPremiumGiftPack197D.map((gift) => gift.diamondPrice)),
  diamondPriceMax: Math.max(...streamPremiumGiftPack197D.map((gift) => gift.diamondPrice)),
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

export function getStreamPremiumGiftEffectProfile197D(assetId: string): StreamPremiumGiftEffectProfile187B {
  return streamPremiumGiftPack197DEffectProfiles.find((profile) => profile.assetId === assetId) ?? streamPremiumGiftPack197DEffectProfiles[0];
}

export function getStreamPremiumGiftPreviewExperience197D(assetId: string): StreamPremiumGiftPreviewExperience187C {
  return streamPremiumGiftPack197DPreviewExperiences.find((row) => row.assetId === assetId) ?? streamPremiumGiftPack197DPreviewExperiences[0];
}

export function getStreamPremiumGiftFinalPolish197D(assetId: string): StreamPremiumGiftFinalPolish187D {
  return streamPremiumGiftPack197DFinalPolishProfiles.find((row) => row.assetId === assetId) ?? streamPremiumGiftPack197DFinalPolishProfiles[0];
}

export function getStreamPremiumGiftAppearanceProfile197D(assetId: string): StreamPremiumGiftAppearanceProfile188G {
  return streamPremiumGiftPack197DAppearanceProfiles.find((row) => row.assetId === assetId) ?? streamPremiumGiftPack197DAppearanceProfiles[0];
}

export function getStreamPremiumGiftVisualFxProfile197D(assetId: string): StreamPremiumGiftVisualFxProfile188H {
  return streamPremiumGiftPack197DVisualFxProfiles.find((row) => row.assetId === assetId) ?? streamPremiumGiftPack197DVisualFxProfiles[0];
}

export function getStreamPremiumGiftFinalScreenPolish197D(assetId: string): StreamPremiumGiftFinalScreenPolish188I {
  return streamPremiumGiftPack197DFinalScreenPolishProfiles.find((row) => row.assetId === assetId) ?? streamPremiumGiftPack197DFinalScreenPolishProfiles[0];
}
