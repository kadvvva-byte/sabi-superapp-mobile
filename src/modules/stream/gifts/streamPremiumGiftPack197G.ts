import type { StreamPremiumGiftAsset187A } from "./streamPremiumGiftPack187A";
import type { StreamPremiumGiftEffectProfile187B, StreamGiftHapticImpactStyle187B } from "./streamPremiumGiftEffects187B";
import type { StreamPremiumGiftPreviewExperience187C } from "./streamPremiumGiftPreviewExperience187C";
import type { StreamPremiumGiftFinalPolish187D } from "./streamPremiumGiftFinalPolish187D";
import type { StreamPremiumGiftAppearanceProfile188G } from "./streamPremiumGiftAppearanceEngine188G";
import type { StreamPremiumGiftVisualFxProfile188H } from "./streamPremiumGiftVisualFxPack188H";
import type { StreamPremiumGiftFinalScreenPolish188I } from "./streamPremiumGiftFinalScreenPolish188I";
import { streamPremiumGiftDiamondTopUpPolicy197C } from "./streamPremiumGiftPack197C";

export type StreamPremiumGiftDiamondPriceTier197G = "micro" | "rare" | "epic" | "legendary" | "mythic" | "ultra_mythic";

export type StreamPremiumGiftAsset197G = StreamPremiumGiftAsset187A & {
  diamondPrice: number;
  priceTier197G: StreamPremiumGiftDiamondPriceTier197G;
  coinTopUpDisclosureRu: string;
  qualityPromiseRu: string;
};

export const streamPremiumGiftPack197GBasePath = "assets/stream/gifts/197g-pack-9-royal-ocean-legends" as const;

export const streamPremiumGiftPack197G: StreamPremiumGiftAsset197G[] = [
  {
    id: "pearl-like-four", displayName: "Pearl Like Four", displayNameRu: "Жемчужный Лайк", iconName: "thumbs-up-outline", legacyTitleKey: "giftTierPremium", catalogSegment: "premium",
    previewRu: "жемчужный лайк вспыхивает мягким clean glow без дешёвого шума", localCostLabel: "4 алмаза · fair gift price", effectLabel: "pearl like soft glow", qualityLabel: "Pack 9 micro pearl poster + cue ready", loopLabel: "0.9 сек loop план", visualTone: "pearl ocean", safetyBadge: "diamond price · preview only", rarityLabel: "Micro Pearl", motionSpec: "single pearl like badge, tiny wave shimmer, readable diamond price", posterFile: "pearl-like-four.svg", posterFallbackReady: true, mp4LoopPlanned: true, providerRuntimeReadyNow: false, paymentReadyNow: false, payoutReadyNow: false, sendRuntimeReadyNow: false,
    diamondPrice: 4, priceTier197G: "micro", coinTopUpDisclosureRu: "Минимум пополнения: 10 coins = $10; покупка выключена до backend/provider approval.", qualityPromiseRu: "Цена соответствует качеству: clean poster, controlled FX, readable safe-area, no fake expensive."
  },
  {
    id: "coral-heart-eighteen", displayName: "Coral Heart Eighteen", displayNameRu: "Коралловое Сердце", iconName: "heart-outline", legacyTitleKey: "giftTierPremium", catalogSegment: "anime",
    previewRu: "коралловое сердце раскрывается тёплой ocean-аурой", localCostLabel: "18 алмазов · fair gift price", effectLabel: "coral heart warm aura", qualityLabel: "Pack 9 coral heart poster + cue ready", loopLabel: "1.1 сек loop план", visualTone: "coral heart", safetyBadge: "diamond price · preview only", rarityLabel: "Rare Coral", motionSpec: "heart pulse, coral particles, no clutter", posterFile: "coral-heart-eighteen.svg", posterFallbackReady: true, mp4LoopPlanned: true, providerRuntimeReadyNow: false, paymentReadyNow: false, payoutReadyNow: false, sendRuntimeReadyNow: false,
    diamondPrice: 18, priceTier197G: "rare", coinTopUpDisclosureRu: "Минимум пополнения: 10 coins = $10; покупка выключена до backend/provider approval.", qualityPromiseRu: "Цена соответствует качеству: clean poster, controlled FX, readable safe-area, no fake expensive."
  },
  {
    id: "aqua-dolphin-eighty", displayName: "Aqua Dolphin Eighty", displayNameRu: "Аква Дельфин", iconName: "water-outline", legacyTitleKey: "giftTierPremium", catalogSegment: "anime",
    previewRu: "аква дельфин делает лёгкий premium wave trail", localCostLabel: "80 алмазов · fair gift price", effectLabel: "aqua dolphin wave trail", qualityLabel: "Pack 9 dolphin poster + cue ready", loopLabel: "1.4 сек loop план", visualTone: "aqua dolphin", safetyBadge: "diamond price · preview only", rarityLabel: "Rare Ocean", motionSpec: "dolphin arc, water trail, soft splash finale", posterFile: "aqua-dolphin-eighty.svg", posterFallbackReady: true, mp4LoopPlanned: true, providerRuntimeReadyNow: false, paymentReadyNow: false, payoutReadyNow: false, sendRuntimeReadyNow: false,
    diamondPrice: 80, priceTier197G: "rare", coinTopUpDisclosureRu: "Минимум пополнения: 10 coins = $10; покупка выключена до backend/provider approval.", qualityPromiseRu: "Цена соответствует качеству: clean poster, controlled FX, readable safe-area, no fake expensive."
  },
  {
    id: "golden-anchor-four-fifty", displayName: "Golden Anchor Four Fifty", displayNameRu: "Золотой Якорь", iconName: "boat-outline", legacyTitleKey: "giftTierPremium", catalogSegment: "premium",
    previewRu: "золотой якорь падает как чистый luxury ocean impact", localCostLabel: "450 алмазов · fair gift price", effectLabel: "golden anchor luxury impact", qualityLabel: "Pack 9 epic anchor poster + cue ready", loopLabel: "1.7 сек loop план", visualTone: "golden anchor", safetyBadge: "diamond price · preview only", rarityLabel: "Epic Anchor", motionSpec: "anchor drop, gold water ring, controlled safe-area impact", posterFile: "golden-anchor-four-fifty.svg", posterFallbackReady: true, mp4LoopPlanned: true, providerRuntimeReadyNow: false, paymentReadyNow: false, payoutReadyNow: false, sendRuntimeReadyNow: false,
    diamondPrice: 450, priceTier197G: "epic", coinTopUpDisclosureRu: "Минимум пополнения: 10 coins = $10; покупка выключена до backend/provider approval.", qualityPromiseRu: "Цена соответствует качеству: clean poster, controlled FX, readable safe-area, no fake expensive."
  },
  {
    id: "emerald-mermaid-nine-ninety", displayName: "Emerald Mermaid Nine Ninety", displayNameRu: "Изумрудная Русалка", iconName: "sparkles-outline", legacyTitleKey: "giftTierPremium", catalogSegment: "anime",
    previewRu: "изумрудная русалка открывает premium underwater bloom", localCostLabel: "990 алмазов · fair gift price", effectLabel: "emerald mermaid underwater bloom", qualityLabel: "Pack 9 legendary mermaid poster + cue ready", loopLabel: "2.0 сек loop план", visualTone: "emerald mermaid", safetyBadge: "diamond price · preview only", rarityLabel: "Legendary Mermaid", motionSpec: "mermaid silhouette, pearl wave, restrained luxury bloom", posterFile: "emerald-mermaid-nine-ninety.svg", posterFallbackReady: true, mp4LoopPlanned: true, providerRuntimeReadyNow: false, paymentReadyNow: false, payoutReadyNow: false, sendRuntimeReadyNow: false,
    diamondPrice: 990, priceTier197G: "legendary", coinTopUpDisclosureRu: "Минимум пополнения: 10 coins = $10; покупка выключена до backend/provider approval.", qualityPromiseRu: "Цена соответствует качеству: clean poster, controlled FX, readable safe-area, no fake expensive."
  },
  {
    id: "royal-submarine-four-thousand", displayName: "Royal Submarine Four Thousand", displayNameRu: "Королевская Субмарина", iconName: "rocket-outline", legacyTitleKey: "giftTierPremium", catalogSegment: "premium",
    previewRu: "королевская субмарина проходит cinematic океанским светом", localCostLabel: "4000 алмазов · fair gift price", effectLabel: "royal submarine cinematic glide", qualityLabel: "Pack 9 mythic submarine poster + cue ready", loopLabel: "2.4 сек loop план", visualTone: "royal submarine", safetyBadge: "diamond price · preview only", rarityLabel: "Mythic Submarine", motionSpec: "submarine glide, deep light beams, royal safe-area aura", posterFile: "royal-submarine-four-thousand.svg", posterFallbackReady: true, mp4LoopPlanned: true, providerRuntimeReadyNow: false, paymentReadyNow: false, payoutReadyNow: false, sendRuntimeReadyNow: false,
    diamondPrice: 4000, priceTier197G: "mythic", coinTopUpDisclosureRu: "Минимум пополнения: 10 coins = $10; покупка выключена до backend/provider approval.", qualityPromiseRu: "Цена соответствует качеству: clean poster, controlled FX, readable safe-area, no fake expensive."
  },
  {
    id: "atlantic-palace-nine-thousand", displayName: "Atlantic Palace Nine Thousand", displayNameRu: "Атлантический Дворец", iconName: "business-outline", legacyTitleKey: "giftTierPremium", catalogSegment: "premium",
    previewRu: "атлантический дворец появляется как ultra palace reveal", localCostLabel: "9000 алмазов · fair gift price", effectLabel: "atlantic palace ultra reveal", qualityLabel: "Pack 9 ultra palace poster + cue ready", loopLabel: "2.8 сек loop план", visualTone: "atlantic palace", safetyBadge: "diamond price · preview only", rarityLabel: "Ultra Ocean Palace", motionSpec: "palace rise, diamond waves, cinematic but chat-readable", posterFile: "atlantic-palace-nine-thousand.svg", posterFallbackReady: true, mp4LoopPlanned: true, providerRuntimeReadyNow: false, paymentReadyNow: false, payoutReadyNow: false, sendRuntimeReadyNow: false,
    diamondPrice: 9000, priceTier197G: "ultra_mythic", coinTopUpDisclosureRu: "Минимум пополнения: 10 coins = $10; покупка выключена до backend/provider approval.", qualityPromiseRu: "Цена соответствует качеству: clean poster, controlled FX, readable safe-area, no fake expensive."
  },
  {
    id: "ocean-emperor-ten-thousand", displayName: "Ocean Emperor Ten Thousand", displayNameRu: "Океанский Император", iconName: "star-outline", legacyTitleKey: "giftTierPremium", catalogSegment: "premium",
    previewRu: "океанский император открывает top-tier crown finale за 10000 алмазов", localCostLabel: "10000 алмазов · fair gift price", effectLabel: "ocean emperor top tier finale", qualityLabel: "Pack 9 top-tier emperor poster + cue ready", loopLabel: "3.2 сек loop план", visualTone: "ocean emperor", safetyBadge: "diamond price · preview only", rarityLabel: "Ultra Top Emperor", motionSpec: "emperor crown, ocean orbit, clean premium finale", posterFile: "ocean-emperor-ten-thousand.svg", posterFallbackReady: true, mp4LoopPlanned: true, providerRuntimeReadyNow: false, paymentReadyNow: false, payoutReadyNow: false, sendRuntimeReadyNow: false,
    diamondPrice: 10000, priceTier197G: "ultra_mythic", coinTopUpDisclosureRu: "Минимум пополнения: 10 coins = $10; покупка выключена до backend/provider approval.", qualityPromiseRu: "Цена соответствует качеству: clean poster, controlled FX, readable safe-area, no fake expensive."
  }
];

export const streamPremiumGiftPack197GIds = new Set(streamPremiumGiftPack197G.map((gift) => gift.id));

function diamondLabel197G(price: number): string {
  return price === 1 ? "1 алмаз" : `${price} алмазов`;
}

function diamondTierLabel197G(gift: StreamPremiumGiftAsset197G): string {
  return `${diamondLabel197G(gift.diamondPrice)} · ${gift.priceTier197G} · честная цена по качеству`;
}

function durationByPrice197G(price: number): number {
  if (price >= 9000) return 3300;
  if (price >= 4000) return 2700;
  if (price >= 990) return 2150;
  if (price >= 450) return 1700;
  return 950;
}

function hapticByPrice197G(price: number): StreamGiftHapticImpactStyle187B {
  if (price >= 4000) return "finale";
  if (price >= 450) return "medium";
  return "light";
}

export const streamPremiumGiftPack197GEffectProfiles: StreamPremiumGiftEffectProfile187B[] = streamPremiumGiftPack197G.map((gift, index) => ({
  assetId: gift.id,
  liveEffectLabel: `${gift.visualTone} · Pack 9 royal ocean legends reveal`,
  intensityLabel: diamondTierLabel197G(gift),
  soundCueLabel: `${gift.id} cue`,
  soundCueLabelRu: `${gift.displayNameRu} cue`,
  soundCueFile: `${streamPremiumGiftPack197GBasePath}/sound-cues/${gift.id}-cue.wav`,
  soundCueDurationMs: durationByPrice197G(gift.diamondPrice),
  hapticLabel: gift.diamondPrice >= 4000 ? "finale ocean luxury impact" : gift.diamondPrice >= 990 ? "strong premium ocean impact" : gift.diamondPrice >= 450 ? "medium premium ocean impact" : "soft clean ocean impact",
  hapticImpactStyle: hapticByPrice197G(gift.diamondPrice),
  colorA: ["#E0F2FE", "#FDA4AF", "#A7F3D0", "#FDE68A", "#BBF7D0", "#93C5FD", "#C4B5FD", "#FDE68A"][index] ?? "#E0F2FE",
  colorB: ["#0E7490", "#F97316", "#0284C7", "#B45309", "#047857", "#1E3A8A", "#312E81", "#0369A1"][index] ?? "#0369A1",
  phases: ["diamond price entrance", "royal ocean premium loop", "clean finale without fake win"],
  visualFx: ["safe-area ocean glow", "controlled pearl particles", "poster-first diamond badge", "royal wave aura"],
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

export const streamPremiumGiftPack197GPreviewExperiences: StreamPremiumGiftPreviewExperience187C[] = streamPremiumGiftPack197G.map((gift) => ({
  assetId: gift.id,
  stageLightingLabel: `${gift.visualTone} royal ocean stage`,
  motionQualityLabel: `${gift.displayNameRu} · ${diamondLabel197G(gift.diamondPrice)} · clean premium preview`,
  soundPreviewLabel: `sound label only: ${gift.displayNameRu} cue`,
  hapticPreviewLabel: `haptic label only: ${gift.priceTier197G}`,
  liveSceneCopyRu: `${gift.displayNameRu} появляется как качественный подарок: ${gift.previewRu}. Цена ${diamondLabel197G(gift.diamondPrice)} показана честно, без fake expensive.`,
  safeModeCopyRu: "Preview локальный: звук не autoplay, haptic только metadata, real send/payment disabled.",
  screenReaderHintRu: `${gift.displayNameRu}, цена ${diamondLabel197G(gift.diamondPrice)}, premium preview only, без оплаты и без отправки.`,
  phaseChips: ["diamond price", "royal ocean poster", "clean finale"],
  qualityBadges: [gift.priceTier197G, "fair price", "no fake payment"],
  defaultQuality: gift.diamondPrice >= 450 ? "ultra" : "standard",
  localPreviewUiReadyNow: true,
  actualSoundPlaybackRuntimeEnabledNow: false,
  realSendRuntimeEnabledNow: false,
  backendRuntimeEnabledNow: false,
  paymentRuntimeEnabledNow: false,
  payoutRuntimeEnabledNow: false,
}));

export const streamPremiumGiftPack197GFinalPolishProfiles: StreamPremiumGiftFinalPolish187D[] = streamPremiumGiftPack197G.map((gift) => ({
  assetId: gift.id,
  heroPosterFile: `${streamPremiumGiftPack197GBasePath}/posters/${gift.posterFile}`,
  animeStyleLabel: `${gift.visualTone} royal ocean gift`,
  premiumBadge: `${gift.diamondPrice} diamonds · ${gift.priceTier197G}`,
  catalogHeroCopyRu: `${gift.displayNameRu} держит качество на цене ${diamondLabel197G(gift.diamondPrice)}: clean poster, controlled glow, readable layer.`,
  stageAuraCopyRu: `${gift.visualTone} aura · safe-area recipient focus · no noisy spam`,
  visualSignature: `${gift.effectLabel} · controlled particles`,
  soundSignature: `cue metadata only · no autoplay · ${gift.id}-cue.wav`,
  hapticSignature: `haptic metadata only · ${gift.priceTier197G}`,
  posterDetailChips: ["diamond price", "royal ocean poster", "safe-area"],
  polishBadgeChips: ["197G", gift.priceTier197G, `${gift.diamondPrice} diamonds`],
  finalSafetyCopyRu: "197G only displays diamond pricing and premium preview metadata. It does not top up coins, charge money, send gifts, mutate Wallet, call provider or enable payout.",
  finalPolishReadyNow: true,
  posterFallbackReadyNow: true,
  localPreviewOnlyNow: true,
  backendRuntimeEnabledNow: false,
  paymentRuntimeEnabledNow: false,
  realSendRuntimeEnabledNow: false,
  payoutRuntimeEnabledNow: false,
}));

export const streamPremiumGiftPack197GAppearanceProfiles: StreamPremiumGiftAppearanceProfile188G[] = streamPremiumGiftPack197G.map((gift) => ({
  assetId: gift.id,
  packLabelRu: "Pack 9 · Royal Ocean Legends",
  appearanceTitleRu: `${gift.displayNameRu} · royal ocean diamond appearance`,
  fullScreenLayerRu: `clean safe-area layer with ${diamondLabel197G(gift.diamondPrice)} badge`,
  entranceRu: `${gift.visualTone} entrance · ${gift.previewRu}`,
  loopRu: "royal ocean premium loop with restrained pearl particles and readable recipient focus",
  finaleRu: "soft ocean fade finale, no fake win and no casino wording",
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
  luxuryMoodRu: `${gift.priceTier197G} quality · fair diamond price`,
  appearanceChipsRu: ["197G", "Pack 9", "diamond price", "poster-first"],
  fallbackCopyRu: "reduce-motion: static poster + diamond price badge + readable label",
  safetyCopyRu: "No backend/payment/provider/Wallet/payout/send/autoplay/random-win runtime in 197G.",
  userFacingOnly: true,
  previewOnlyNow: true,
  backendRuntimeEnabledNow: false,
  paymentRuntimeEnabledNow: false,
  providerRuntimeEnabledNow: false,
  payoutRuntimeEnabledNow: false,
  sendRuntimeEnabledNow: false,
  randomWinRuntimeEnabledNow: false,
}));

export const streamPremiumGiftPack197GVisualFxProfiles: StreamPremiumGiftVisualFxProfile188H[] = streamPremiumGiftPack197G.map((gift, index) => ({
  assetId: gift.id,
  visualFxTitleRu: `${gift.displayNameRu} · Pack 9 Royal Ocean Legends FX`,
  primaryGlowRu: `${gift.visualTone} primary glow`,
  particleBurstRu: `royal ocean pearl particles scaled to ${gift.priceTier197G}`,
  motionTrailRu: gift.motionSpec,
  auraRu: `${gift.displayNameRu} recipient aura`,
  screenImpactRu: gift.diamondPrice >= 4000 ? "cinematic full-screen ocean impact with safe-area discipline" : "clean compact premium ocean impact",
  finaleBurstRu: "soft royal ocean finale, no fake win language",
  luxuryLightingRu: `${gift.visualTone} premium lighting`,
  overlayDepthRu: "poster layer + wave glow layer + particle layer + diamond label layer",
  particleDensityLabel: gift.diamondPrice >= 4000 ? "ultra controlled" : gift.diamondPrice >= 450 ? "premium controlled" : "clean light",
  glowIntensityLabel: gift.diamondPrice >= 4000 ? "ultra" : gift.diamondPrice >= 450 ? "premium" : "soft",
  burstScaleLabel: gift.diamondPrice >= 4000 ? "full cinematic" : gift.diamondPrice >= 450 ? "wide clean" : "compact",
  trailDurationMs: gift.diamondPrice >= 4000 ? 2600 : gift.diamondPrice >= 990 ? 1900 : 1080,
  auraPulseMs: gift.diamondPrice >= 4000 ? 1340 : 780,
  premiumFxScore: Math.min(100, 92 + index + (gift.diamondPrice >= 9000 ? 2 : 0)),
  fxChipsRu: ["diamonds", gift.priceTier197G, "royal ocean FX"],
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

export const streamPremiumGiftPack197GFinalScreenPolishProfiles: StreamPremiumGiftFinalScreenPolish188I[] = streamPremiumGiftPack197G.map((gift) => ({
  assetId: gift.id,
  finalScreenTitleRu: `${gift.displayNameRu} · ${diamondLabel197G(gift.diamondPrice)} · clean finale`,
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

export const streamPremiumGiftPack197GSummary = {
  version: "STREAM-GAME-GIFTS-197G",
  pack9Count: streamPremiumGiftPack197G.length,
  addedGiftCount: streamPremiumGiftPack197G.length,
  cumulativeGiftCountAfter197G: 72,
  diamondPriceMin: Math.min(...streamPremiumGiftPack197G.map((gift) => gift.diamondPrice)),
  diamondPriceMax: Math.max(...streamPremiumGiftPack197G.map((gift) => gift.diamondPrice)),
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

export function getStreamPremiumGiftEffectProfile197G(assetId: string): StreamPremiumGiftEffectProfile187B {
  return streamPremiumGiftPack197GEffectProfiles.find((profile) => profile.assetId === assetId) ?? streamPremiumGiftPack197GEffectProfiles[0];
}

export function getStreamPremiumGiftPreviewExperience197G(assetId: string): StreamPremiumGiftPreviewExperience187C {
  return streamPremiumGiftPack197GPreviewExperiences.find((row) => row.assetId === assetId) ?? streamPremiumGiftPack197GPreviewExperiences[0];
}

export function getStreamPremiumGiftFinalPolish197G(assetId: string): StreamPremiumGiftFinalPolish187D {
  return streamPremiumGiftPack197GFinalPolishProfiles.find((row) => row.assetId === assetId) ?? streamPremiumGiftPack197GFinalPolishProfiles[0];
}

export function getStreamPremiumGiftAppearanceProfile197G(assetId: string): StreamPremiumGiftAppearanceProfile188G {
  return streamPremiumGiftPack197GAppearanceProfiles.find((row) => row.assetId === assetId) ?? streamPremiumGiftPack197GAppearanceProfiles[0];
}

export function getStreamPremiumGiftVisualFxProfile197G(assetId: string): StreamPremiumGiftVisualFxProfile188H {
  return streamPremiumGiftPack197GVisualFxProfiles.find((row) => row.assetId === assetId) ?? streamPremiumGiftPack197GVisualFxProfiles[0];
}

export function getStreamPremiumGiftFinalScreenPolish197G(assetId: string): StreamPremiumGiftFinalScreenPolish188I {
  return streamPremiumGiftPack197GFinalScreenPolishProfiles.find((row) => row.assetId === assetId) ?? streamPremiumGiftPack197GFinalScreenPolishProfiles[0];
}
