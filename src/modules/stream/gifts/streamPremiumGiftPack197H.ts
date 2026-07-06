import type { StreamPremiumGiftAsset187A } from "./streamPremiumGiftPack187A";
import type { StreamPremiumGiftEffectProfile187B, StreamGiftHapticImpactStyle187B } from "./streamPremiumGiftEffects187B";
import type { StreamPremiumGiftPreviewExperience187C } from "./streamPremiumGiftPreviewExperience187C";
import type { StreamPremiumGiftFinalPolish187D } from "./streamPremiumGiftFinalPolish187D";
import type { StreamPremiumGiftAppearanceProfile188G } from "./streamPremiumGiftAppearanceEngine188G";
import type { StreamPremiumGiftVisualFxProfile188H } from "./streamPremiumGiftVisualFxPack188H";
import type { StreamPremiumGiftFinalScreenPolish188I } from "./streamPremiumGiftFinalScreenPolish188I";
import { streamPremiumGiftDiamondTopUpPolicy197C } from "./streamPremiumGiftPack197C";

export type StreamPremiumGiftDiamondPriceTier197H = "micro" | "rare" | "epic" | "legendary" | "mythic" | "ultra_mythic";

export type StreamPremiumGiftAsset197H = StreamPremiumGiftAsset187A & {
  diamondPrice: number;
  priceTier197H: StreamPremiumGiftDiamondPriceTier197H;
  coinTopUpDisclosureRu: string;
  qualityPromiseRu: string;
};

export const streamPremiumGiftPack197HBasePath = "assets/stream/gifts/197h-pack-10-legendary-sky-empire" as const;

export const streamPremiumGiftPack197H: StreamPremiumGiftAsset197H[] = [
  {
    id: "emerald-clover-six", displayName: "Emerald Clover Six", displayNameRu: "Изумрудный Клевер", iconName: "leaf-outline", legacyTitleKey: "giftTierPremium", catalogSegment: "anime",
    previewRu: "изумрудный клевер даёт clean lucky glow без дешёвого шума", localCostLabel: "6 алмазов · fair gift price", effectLabel: "emerald clover lucky glow", qualityLabel: "Pack 10 emerald clover poster + cue ready", loopLabel: "1.0 сек loop план", visualTone: "emerald sky", safetyBadge: "diamond price · preview only", rarityLabel: "Lucky Starter", motionSpec: "clover sparkle, small sky arc, readable diamond badge", posterFile: "emerald-clover-six.svg", posterFallbackReady: true, mp4LoopPlanned: true, providerRuntimeReadyNow: false, paymentReadyNow: false, payoutReadyNow: false, sendRuntimeReadyNow: false,
    diamondPrice: 6, priceTier197H: "micro", coinTopUpDisclosureRu: "Минимум пополнения: 10 coins = $10; покупка выключена до backend/provider approval.", qualityPromiseRu: "Цена соответствует качеству: clean poster, controlled FX, readable safe-area, no fake expensive."
  },
  {
    id: "ruby-fox-twenty-two", displayName: "Ruby Fox Twenty Two", displayNameRu: "Рубиновый Лис", iconName: "flame-outline", legacyTitleKey: "giftTierPremium", catalogSegment: "anime",
    previewRu: "рубиновый лис проходит мягким premium flame trail", localCostLabel: "22 алмаза · fair gift price", effectLabel: "ruby fox flame trail", qualityLabel: "Pack 10 ruby fox poster + cue ready", loopLabel: "1.2 сек loop план", visualTone: "ruby fox", safetyBadge: "diamond price · preview only", rarityLabel: "Rare Fox", motionSpec: "fox silhouette, ruby tail, controlled spark line", posterFile: "ruby-fox-twenty-two.svg", posterFallbackReady: true, mp4LoopPlanned: true, providerRuntimeReadyNow: false, paymentReadyNow: false, payoutReadyNow: false, sendRuntimeReadyNow: false,
    diamondPrice: 22, priceTier197H: "rare", coinTopUpDisclosureRu: "Минимум пополнения: 10 coins = $10; покупка выключена до backend/provider approval.", qualityPromiseRu: "Цена соответствует качеству: clean poster, controlled FX, readable safe-area, no fake expensive."
  },
  {
    id: "silver-koi-ninety", displayName: "Silver Koi Ninety", displayNameRu: "Серебряный Кои", iconName: "fish-outline", legacyTitleKey: "giftTierPremium", catalogSegment: "anime",
    previewRu: "серебряный кои рисует чистый sky-water shimmer", localCostLabel: "90 алмазов · fair gift price", effectLabel: "silver koi sky shimmer", qualityLabel: "Pack 10 silver koi poster + cue ready", loopLabel: "1.4 сек loop план", visualTone: "silver koi", safetyBadge: "diamond price · preview only", rarityLabel: "Rare Koi", motionSpec: "koi arc, silver droplets, calm premium shimmer", posterFile: "silver-koi-ninety.svg", posterFallbackReady: true, mp4LoopPlanned: true, providerRuntimeReadyNow: false, paymentReadyNow: false, payoutReadyNow: false, sendRuntimeReadyNow: false,
    diamondPrice: 90, priceTier197H: "rare", coinTopUpDisclosureRu: "Минимум пополнения: 10 coins = $10; покупка выключена до backend/provider approval.", qualityPromiseRu: "Цена соответствует качеству: clean poster, controlled FX, readable safe-area, no fake expensive."
  },
  {
    id: "golden-phoenix-six-hundred", displayName: "Golden Phoenix Six Hundred", displayNameRu: "Золотой Феникс", iconName: "flame-outline", legacyTitleKey: "giftTierPremium", catalogSegment: "premium",
    previewRu: "золотой феникс раскрывает cinematic wing flare", localCostLabel: "600 алмазов · fair gift price", effectLabel: "golden phoenix wing flare", qualityLabel: "Pack 10 golden phoenix poster + cue ready", loopLabel: "1.8 сек loop план", visualTone: "gold phoenix", safetyBadge: "diamond price · preview only", rarityLabel: "Epic Phoenix", motionSpec: "phoenix wings, gold ring, controlled finale sparks", posterFile: "golden-phoenix-six-hundred.svg", posterFallbackReady: true, mp4LoopPlanned: true, providerRuntimeReadyNow: false, paymentReadyNow: false, payoutReadyNow: false, sendRuntimeReadyNow: false,
    diamondPrice: 600, priceTier197H: "epic", coinTopUpDisclosureRu: "Минимум пополнения: 10 coins = $10; покупка выключена до backend/provider approval.", qualityPromiseRu: "Цена соответствует качеству: clean poster, controlled FX, readable safe-area, no fake expensive."
  },
  {
    id: "royal-airship-twelve-hundred", displayName: "Royal Airship Twelve Hundred", displayNameRu: "Королевский Дирижабль", iconName: "airplane-outline", legacyTitleKey: "giftTierPremium", catalogSegment: "premium",
    previewRu: "королевский дирижабль проходит sky-stage light beams", localCostLabel: "1200 алмазов · fair gift price", effectLabel: "royal airship sky beams", qualityLabel: "Pack 10 royal airship poster + cue ready", loopLabel: "2.1 сек loop план", visualTone: "royal airship", safetyBadge: "diamond price · preview only", rarityLabel: "Legendary Airship", motionSpec: "airship glide, clouds split, royal beam layer", posterFile: "royal-airship-twelve-hundred.svg", posterFallbackReady: true, mp4LoopPlanned: true, providerRuntimeReadyNow: false, paymentReadyNow: false, payoutReadyNow: false, sendRuntimeReadyNow: false,
    diamondPrice: 1200, priceTier197H: "legendary", coinTopUpDisclosureRu: "Минимум пополнения: 10 coins = $10; покупка выключена до backend/provider approval.", qualityPromiseRu: "Цена соответствует качеству: clean poster, controlled FX, readable safe-area, no fake expensive."
  },
  {
    id: "diamond-tiger-forty-five-hundred", displayName: "Diamond Tiger Forty Five Hundred", displayNameRu: "Алмазный Тигр", iconName: "flash-outline", legacyTitleKey: "giftTierPremium", catalogSegment: "premium",
    previewRu: "алмазный тигр делает mythic sky roar без fake win слов", localCostLabel: "4500 алмазов · fair gift price", effectLabel: "diamond tiger mythic roar", qualityLabel: "Pack 10 diamond tiger poster + cue ready", loopLabel: "2.5 сек loop план", visualTone: "diamond tiger", safetyBadge: "diamond price · preview only", rarityLabel: "Mythic Tiger", motionSpec: "tiger crown, diamond roar ring, safe-area impact", posterFile: "diamond-tiger-forty-five-hundred.svg", posterFallbackReady: true, mp4LoopPlanned: true, providerRuntimeReadyNow: false, paymentReadyNow: false, payoutReadyNow: false, sendRuntimeReadyNow: false,
    diamondPrice: 4500, priceTier197H: "mythic", coinTopUpDisclosureRu: "Минимум пополнения: 10 coins = $10; покупка выключена до backend/provider approval.", qualityPromiseRu: "Цена соответствует качеству: clean poster, controlled FX, readable safe-area, no fake expensive."
  },
  {
    id: "crystal-planet-nine-five-hundred", displayName: "Crystal Planet Nine Five Hundred", displayNameRu: "Кристальная Планета", iconName: "planet-outline", legacyTitleKey: "giftTierPremium", catalogSegment: "premium",
    previewRu: "кристальная планета открывает ultra orbit scene", localCostLabel: "9500 алмазов · fair gift price", effectLabel: "crystal planet ultra orbit", qualityLabel: "Pack 10 crystal planet poster + cue ready", loopLabel: "2.9 сек loop план", visualTone: "crystal planet", safetyBadge: "diamond price · preview only", rarityLabel: "Ultra Planet", motionSpec: "planet orbit, crystal rings, ultra controlled glow", posterFile: "crystal-planet-nine-five-hundred.svg", posterFallbackReady: true, mp4LoopPlanned: true, providerRuntimeReadyNow: false, paymentReadyNow: false, payoutReadyNow: false, sendRuntimeReadyNow: false,
    diamondPrice: 9500, priceTier197H: "ultra_mythic", coinTopUpDisclosureRu: "Минимум пополнения: 10 coins = $10; покупка выключена до backend/provider approval.", qualityPromiseRu: "Цена соответствует качеству: clean poster, controlled FX, readable safe-area, no fake expensive."
  },
  {
    id: "immortal-dragon-ten-thousand", displayName: "Immortal Dragon Ten Thousand", displayNameRu: "Бессмертный Дракон", iconName: "star-outline", legacyTitleKey: "giftTierPremium", catalogSegment: "premium",
    previewRu: "бессмертный дракон открывает maximum top-tier sky finale за 10000 алмазов", localCostLabel: "10000 алмазов · fair gift price", effectLabel: "immortal dragon top tier finale", qualityLabel: "Pack 10 immortal dragon poster + cue ready", loopLabel: "3.3 сек loop план", visualTone: "immortal dragon", safetyBadge: "diamond price · preview only", rarityLabel: "Ultra Top Dragon", motionSpec: "dragon spiral, sky gate, clean top-tier crown finale", posterFile: "immortal-dragon-ten-thousand.svg", posterFallbackReady: true, mp4LoopPlanned: true, providerRuntimeReadyNow: false, paymentReadyNow: false, payoutReadyNow: false, sendRuntimeReadyNow: false,
    diamondPrice: 10000, priceTier197H: "ultra_mythic", coinTopUpDisclosureRu: "Минимум пополнения: 10 coins = $10; покупка выключена до backend/provider approval.", qualityPromiseRu: "Цена соответствует качеству: clean poster, controlled FX, readable safe-area, no fake expensive."
  }
];

export const streamPremiumGiftPack197HIds = new Set(streamPremiumGiftPack197H.map((gift) => gift.id));

function diamondLabel197H(price: number): string {
  return price === 1 ? "1 алмаз" : `${price} алмазов`;
}

function diamondTierLabel197H(gift: StreamPremiumGiftAsset197H): string {
  return `${diamondLabel197H(gift.diamondPrice)} · ${gift.priceTier197H} · честная цена по качеству`;
}

function durationByPrice197H(price: number): number {
  if (price >= 9000) return 3300;
  if (price >= 4000) return 2700;
  if (price >= 990) return 2150;
  if (price >= 450) return 1700;
  return 950;
}

function hapticByPrice197H(price: number): StreamGiftHapticImpactStyle187B {
  if (price >= 4000) return "finale";
  if (price >= 450) return "medium";
  return "light";
}

export const streamPremiumGiftPack197HEffectProfiles: StreamPremiumGiftEffectProfile187B[] = streamPremiumGiftPack197H.map((gift, index) => ({
  assetId: gift.id,
  liveEffectLabel: `${gift.visualTone} · Pack 10 legendary sky empire reveal`,
  intensityLabel: diamondTierLabel197H(gift),
  soundCueLabel: `${gift.id} cue`,
  soundCueLabelRu: `${gift.displayNameRu} cue`,
  soundCueFile: `${streamPremiumGiftPack197HBasePath}/sound-cues/${gift.id}-cue.wav`,
  soundCueDurationMs: durationByPrice197H(gift.diamondPrice),
  hapticLabel: gift.diamondPrice >= 4000 ? "finale sky luxury impact" : gift.diamondPrice >= 990 ? "strong premium sky impact" : gift.diamondPrice >= 450 ? "medium premium sky impact" : "soft clean sky impact",
  hapticImpactStyle: hapticByPrice197H(gift.diamondPrice),
  colorA: ["#E0F2FE", "#FDA4AF", "#A7F3D0", "#FDE68A", "#BBF7D0", "#93C5FD", "#C4B5FD", "#FDE68A"][index] ?? "#E0F2FE",
  colorB: ["#0E7490", "#F97316", "#0284C7", "#B45309", "#047857", "#1E3A8A", "#312E81", "#0369A1"][index] ?? "#0369A1",
  phases: ["diamond price entrance", "legendary sky premium loop", "clean finale without fake win"],
  visualFx: ["safe-area sky glow", "controlled pearl particles", "poster-first diamond badge", "royal wave aura"],
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

export const streamPremiumGiftPack197HPreviewExperiences: StreamPremiumGiftPreviewExperience187C[] = streamPremiumGiftPack197H.map((gift) => ({
  assetId: gift.id,
  stageLightingLabel: `${gift.visualTone} legendary sky stage`,
  motionQualityLabel: `${gift.displayNameRu} · ${diamondLabel197H(gift.diamondPrice)} · clean premium preview`,
  soundPreviewLabel: `sound label only: ${gift.displayNameRu} cue`,
  hapticPreviewLabel: `haptic label only: ${gift.priceTier197H}`,
  liveSceneCopyRu: `${gift.displayNameRu} появляется как качественный подарок: ${gift.previewRu}. Цена ${diamondLabel197H(gift.diamondPrice)} показана честно, без fake expensive.`,
  safeModeCopyRu: "Preview локальный: звук не autoplay, haptic только metadata, real send/payment disabled.",
  screenReaderHintRu: `${gift.displayNameRu}, цена ${diamondLabel197H(gift.diamondPrice)}, premium preview only, без оплаты и без отправки.`,
  phaseChips: ["diamond price", "legendary sky poster", "clean finale"],
  qualityBadges: [gift.priceTier197H, "fair price", "no fake payment"],
  defaultQuality: gift.diamondPrice >= 450 ? "ultra" : "standard",
  localPreviewUiReadyNow: true,
  actualSoundPlaybackRuntimeEnabledNow: false,
  realSendRuntimeEnabledNow: false,
  backendRuntimeEnabledNow: false,
  paymentRuntimeEnabledNow: false,
  payoutRuntimeEnabledNow: false,
}));

export const streamPremiumGiftPack197HFinalPolishProfiles: StreamPremiumGiftFinalPolish187D[] = streamPremiumGiftPack197H.map((gift) => ({
  assetId: gift.id,
  heroPosterFile: `${streamPremiumGiftPack197HBasePath}/posters/${gift.posterFile}`,
  animeStyleLabel: `${gift.visualTone} legendary sky gift`,
  premiumBadge: `${gift.diamondPrice} diamonds · ${gift.priceTier197H}`,
  catalogHeroCopyRu: `${gift.displayNameRu} держит качество на цене ${diamondLabel197H(gift.diamondPrice)}: clean poster, controlled glow, readable layer.`,
  stageAuraCopyRu: `${gift.visualTone} aura · safe-area recipient focus · no noisy spam`,
  visualSignature: `${gift.effectLabel} · controlled particles`,
  soundSignature: `cue metadata only · no autoplay · ${gift.id}-cue.wav`,
  hapticSignature: `haptic metadata only · ${gift.priceTier197H}`,
  posterDetailChips: ["diamond price", "legendary sky poster", "safe-area"],
  polishBadgeChips: ["197H", gift.priceTier197H, `${gift.diamondPrice} diamonds`],
  finalSafetyCopyRu: "197H only displays diamond pricing and premium preview metadata. It does not top up coins, charge money, send gifts, mutate Wallet, call provider or enable payout.",
  finalPolishReadyNow: true,
  posterFallbackReadyNow: true,
  localPreviewOnlyNow: true,
  backendRuntimeEnabledNow: false,
  paymentRuntimeEnabledNow: false,
  realSendRuntimeEnabledNow: false,
  payoutRuntimeEnabledNow: false,
}));

export const streamPremiumGiftPack197HAppearanceProfiles: StreamPremiumGiftAppearanceProfile188G[] = streamPremiumGiftPack197H.map((gift) => ({
  assetId: gift.id,
  packLabelRu: "Pack 10 · Legendary Sky Empire",
  appearanceTitleRu: `${gift.displayNameRu} · legendary sky diamond appearance`,
  fullScreenLayerRu: `clean safe-area layer with ${diamondLabel197H(gift.diamondPrice)} badge`,
  entranceRu: `${gift.visualTone} entrance · ${gift.previewRu}`,
  loopRu: "legendary sky premium loop with restrained pearl particles and readable recipient focus",
  finaleRu: "soft sky fade finale, no fake win and no casino wording",
  entranceDurationMs: gift.diamondPrice >= 4000 ? 620 : 390,
  loopDurationMs: gift.diamondPrice >= 9000 ? 2900 : gift.diamondPrice >= 4000 ? 2400 : gift.diamondPrice >= 990 ? 1900 : 1260,
  finaleDurationMs: gift.diamondPrice >= 4000 ? 840 : 560,
  stageLightingRu: `${gift.visualTone} luxury lighting`,
  backgroundDimRu: "background dim keeps chat readable",
  particleSystemRu: "controlled pearls / wave sparkles only, no noisy spam",
  motionTrailRu: gift.motionSpec,
  recipientFocusRu: "recipient stays clear in safe-area glow",
  soundHitRu: "cue metadata only; autoplay disabled",
  hapticHitRu: "haptic metadata only; no automatic device impact",
  luxuryMoodRu: `${gift.priceTier197H} quality · fair diamond price`,
  appearanceChipsRu: ["197H", "Pack 10", "diamond price", "poster-first"],
  fallbackCopyRu: "reduce-motion: static poster + diamond price badge + readable label",
  safetyCopyRu: "No backend/payment/provider/Wallet/payout/send/autoplay/random-win runtime in 197H.",
  userFacingOnly: true,
  previewOnlyNow: true,
  backendRuntimeEnabledNow: false,
  paymentRuntimeEnabledNow: false,
  providerRuntimeEnabledNow: false,
  payoutRuntimeEnabledNow: false,
  sendRuntimeEnabledNow: false,
  randomWinRuntimeEnabledNow: false,
}));

export const streamPremiumGiftPack197HVisualFxProfiles: StreamPremiumGiftVisualFxProfile188H[] = streamPremiumGiftPack197H.map((gift, index) => ({
  assetId: gift.id,
  visualFxTitleRu: `${gift.displayNameRu} · Pack 10 Legendary Sky Empire FX`,
  primaryGlowRu: `${gift.visualTone} primary glow`,
  particleBurstRu: `legendary sky pearl particles scaled to ${gift.priceTier197H}`,
  motionTrailRu: gift.motionSpec,
  auraRu: `${gift.displayNameRu} recipient aura`,
  screenImpactRu: gift.diamondPrice >= 4000 ? "cinematic full-screen sky impact with safe-area discipline" : "clean compact premium sky impact",
  finaleBurstRu: "soft legendary sky finale, no fake win language",
  luxuryLightingRu: `${gift.visualTone} premium lighting`,
  overlayDepthRu: "poster layer + wave glow layer + particle layer + diamond label layer",
  particleDensityLabel: gift.diamondPrice >= 4000 ? "ultra controlled" : gift.diamondPrice >= 450 ? "premium controlled" : "clean light",
  glowIntensityLabel: gift.diamondPrice >= 4000 ? "ultra" : gift.diamondPrice >= 450 ? "premium" : "soft",
  burstScaleLabel: gift.diamondPrice >= 4000 ? "full cinematic" : gift.diamondPrice >= 450 ? "wide clean" : "compact",
  trailDurationMs: gift.diamondPrice >= 4000 ? 2600 : gift.diamondPrice >= 990 ? 1900 : 1080,
  auraPulseMs: gift.diamondPrice >= 4000 ? 1340 : 780,
  premiumFxScore: Math.min(100, 92 + index + (gift.diamondPrice >= 9000 ? 2 : 0)),
  fxChipsRu: ["diamonds", gift.priceTier197H, "legendary sky FX"],
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

export const streamPremiumGiftPack197HFinalScreenPolishProfiles: StreamPremiumGiftFinalScreenPolish188I[] = streamPremiumGiftPack197H.map((gift) => ({
  assetId: gift.id,
  finalScreenTitleRu: `${gift.displayNameRu} · ${diamondLabel197H(gift.diamondPrice)} · clean finale`,
  premiumImpactRu: `${gift.previewRu} with fair diamond-price badge and safe recipient focus`,
  soundSignatureRu: "sound cue metadata only, no autoplay",
  hapticSignatureRu: "haptic metadata only, no automatic haptic",
  timingSignatureRu: gift.diamondPrice >= 4000 ? "0.62s entrance · 2.40s+ loop · 0.84s finale" : "0.39s entrance · 1.26s loop · 0.56s finale",
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

export const streamPremiumGiftPack197HSummary = {
  version: "STREAM-GAME-GIFTS-197H",
  pack10Count: streamPremiumGiftPack197H.length,
  addedGiftCount: streamPremiumGiftPack197H.length,
  cumulativeGiftCountAfter197H: 80,
  diamondPriceMin: Math.min(...streamPremiumGiftPack197H.map((gift) => gift.diamondPrice)),
  diamondPriceMax: Math.max(...streamPremiumGiftPack197H.map((gift) => gift.diamondPrice)),
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

export function getStreamPremiumGiftEffectProfile197H(assetId: string): StreamPremiumGiftEffectProfile187B {
  return streamPremiumGiftPack197HEffectProfiles.find((profile) => profile.assetId === assetId) ?? streamPremiumGiftPack197HEffectProfiles[0];
}

export function getStreamPremiumGiftPreviewExperience197H(assetId: string): StreamPremiumGiftPreviewExperience187C {
  return streamPremiumGiftPack197HPreviewExperiences.find((row) => row.assetId === assetId) ?? streamPremiumGiftPack197HPreviewExperiences[0];
}

export function getStreamPremiumGiftFinalPolish197H(assetId: string): StreamPremiumGiftFinalPolish187D {
  return streamPremiumGiftPack197HFinalPolishProfiles.find((row) => row.assetId === assetId) ?? streamPremiumGiftPack197HFinalPolishProfiles[0];
}

export function getStreamPremiumGiftAppearanceProfile197H(assetId: string): StreamPremiumGiftAppearanceProfile188G {
  return streamPremiumGiftPack197HAppearanceProfiles.find((row) => row.assetId === assetId) ?? streamPremiumGiftPack197HAppearanceProfiles[0];
}

export function getStreamPremiumGiftVisualFxProfile197H(assetId: string): StreamPremiumGiftVisualFxProfile188H {
  return streamPremiumGiftPack197HVisualFxProfiles.find((row) => row.assetId === assetId) ?? streamPremiumGiftPack197HVisualFxProfiles[0];
}

export function getStreamPremiumGiftFinalScreenPolish197H(assetId: string): StreamPremiumGiftFinalScreenPolish188I {
  return streamPremiumGiftPack197HFinalScreenPolishProfiles.find((row) => row.assetId === assetId) ?? streamPremiumGiftPack197HFinalScreenPolishProfiles[0];
}
