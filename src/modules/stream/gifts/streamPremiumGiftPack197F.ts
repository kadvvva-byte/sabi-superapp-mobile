import type { StreamPremiumGiftAsset187A } from "./streamPremiumGiftPack187A";
import type { StreamPremiumGiftEffectProfile187B, StreamGiftHapticImpactStyle187B } from "./streamPremiumGiftEffects187B";
import type { StreamPremiumGiftPreviewExperience187C } from "./streamPremiumGiftPreviewExperience187C";
import type { StreamPremiumGiftFinalPolish187D } from "./streamPremiumGiftFinalPolish187D";
import type { StreamPremiumGiftAppearanceProfile188G } from "./streamPremiumGiftAppearanceEngine188G";
import type { StreamPremiumGiftVisualFxProfile188H } from "./streamPremiumGiftVisualFxPack188H";
import type { StreamPremiumGiftFinalScreenPolish188I } from "./streamPremiumGiftFinalScreenPolish188I";
import { streamPremiumGiftDiamondTopUpPolicy197C } from "./streamPremiumGiftPack197C";

export type StreamPremiumGiftDiamondPriceTier197F = "micro" | "rare" | "epic" | "legendary" | "mythic" | "ultra_mythic";

export type StreamPremiumGiftAsset197F = StreamPremiumGiftAsset187A & {
  diamondPrice: number;
  priceTier197F: StreamPremiumGiftDiamondPriceTier197F;
  coinTopUpDisclosureRu: string;
  qualityPromiseRu: string;
};

export const streamPremiumGiftPack197FBasePath = "assets/stream/gifts/197f-pack-8-imperial-galaxy" as const;

export const streamPremiumGiftPack197F: StreamPremiumGiftAsset197F[] = [
  {
    id: "azure-like-three", displayName: "Azure Like Three", displayNameRu: "Лазурный Лайк", iconName: "thumbs-up-outline", legacyTitleKey: "giftTierPremium", catalogSegment: "premium",
    previewRu: "маленький лазурный лайк вспыхивает чистым premium glow", localCostLabel: "3 алмаза · fair gift price", effectLabel: "azure like clean sparkle", qualityLabel: "Pack 8 clean micro poster + cue ready", loopLabel: "0.9 сек loop план", visualTone: "azure clean", safetyBadge: "diamond price · preview only", rarityLabel: "Micro Premium", motionSpec: "single like badge, soft blue shimmer, readable diamond price", posterFile: "azure-like-three.svg", posterFallbackReady: true, mp4LoopPlanned: true, providerRuntimeReadyNow: false, paymentReadyNow: false, payoutReadyNow: false, sendRuntimeReadyNow: false,
    diamondPrice: 3, priceTier197F: "micro", coinTopUpDisclosureRu: "Минимум пополнения: 10 coins = $10; покупка выключена до backend/provider approval.", qualityPromiseRu: "Цена соответствует качеству: clean poster, controlled FX, readable safe-area, no fake expensive."
  },
  {
    id: "ruby-heart-twelve", displayName: "Ruby Heart Twelve", displayNameRu: "Рубиновое Сердце", iconName: "heart-outline", legacyTitleKey: "giftTierPremium", catalogSegment: "anime",
    previewRu: "рубиновое сердце открывается аккуратным anime shine", localCostLabel: "12 алмазов · fair gift price", effectLabel: "ruby heart controlled shine", qualityLabel: "Pack 8 heart poster + cue ready", loopLabel: "1.1 сек loop план", visualTone: "ruby heart", safetyBadge: "diamond price · preview only", rarityLabel: "Clean Starter", motionSpec: "heart pulse, two spark arcs, no cheap clutter", posterFile: "ruby-heart-twelve.svg", posterFallbackReady: true, mp4LoopPlanned: true, providerRuntimeReadyNow: false, paymentReadyNow: false, payoutReadyNow: false, sendRuntimeReadyNow: false,
    diamondPrice: 12, priceTier197F: "rare", coinTopUpDisclosureRu: "Минимум пополнения: 10 coins = $10; покупка выключена до backend/provider approval.", qualityPromiseRu: "Цена соответствует качеству: clean poster, controlled FX, readable safe-area, no fake expensive."
  },
  {
    id: "crystal-unicorn-sixty", displayName: "Crystal Unicorn Sixty", displayNameRu: "Хрустальный Единорог", iconName: "sparkles-outline", legacyTitleKey: "giftTierPremium", catalogSegment: "anime",
    previewRu: "хрустальный единорог делает мягкий magical trail", localCostLabel: "60 алмазов · fair gift price", effectLabel: "crystal unicorn magical trail", qualityLabel: "Pack 8 anime crystal poster + cue ready", loopLabel: "1.4 сек loop план", visualTone: "crystal unicorn", safetyBadge: "diamond price · preview only", rarityLabel: "Rare Crystal", motionSpec: "unicorn silhouette, crystal hoof trail, soft finale", posterFile: "crystal-unicorn-sixty.svg", posterFallbackReady: true, mp4LoopPlanned: true, providerRuntimeReadyNow: false, paymentReadyNow: false, payoutReadyNow: false, sendRuntimeReadyNow: false,
    diamondPrice: 60, priceTier197F: "rare", coinTopUpDisclosureRu: "Минимум пополнения: 10 coins = $10; покупка выключена до backend/provider approval.", qualityPromiseRu: "Цена соответствует качеству: clean poster, controlled FX, readable safe-area, no fake expensive."
  },
  {
    id: "golden-meteor-three-hundred", displayName: "Golden Meteor Three Hundred", displayNameRu: "Золотой Метеор", iconName: "planet-outline", legacyTitleKey: "giftTierPremium", catalogSegment: "premium",
    previewRu: "золотой метеор проходит cinematic дугой без casino wording", localCostLabel: "300 алмазов · fair gift price", effectLabel: "golden meteor premium arc", qualityLabel: "Pack 8 epic meteor poster + cue ready", loopLabel: "1.7 сек loop план", visualTone: "golden meteor", safetyBadge: "diamond price · preview only", rarityLabel: "Epic Meteor", motionSpec: "meteor arc, gold dust, controlled screen impact", posterFile: "golden-meteor-three-hundred.svg", posterFallbackReady: true, mp4LoopPlanned: true, providerRuntimeReadyNow: false, paymentReadyNow: false, payoutReadyNow: false, sendRuntimeReadyNow: false,
    diamondPrice: 300, priceTier197F: "epic", coinTopUpDisclosureRu: "Минимум пополнения: 10 coins = $10; покупка выключена до backend/provider approval.", qualityPromiseRu: "Цена соответствует качеству: clean poster, controlled FX, readable safe-area, no fake expensive."
  },
  {
    id: "imperial-lily-eight-eight-eight", displayName: "Imperial Lily Eight Eight Eight", displayNameRu: "Имперская Лилия", iconName: "flower-outline", legacyTitleKey: "giftTierPremium", catalogSegment: "premium",
    previewRu: "имперская лилия раскрывается как дорогой clean floral gift", localCostLabel: "888 алмазов · fair gift price", effectLabel: "imperial lily luxury bloom", qualityLabel: "Pack 8 legendary floral poster + cue ready", loopLabel: "2.0 сек loop план", visualTone: "imperial lily", safetyBadge: "diamond price · preview only", rarityLabel: "Legendary Lily", motionSpec: "lily bloom, pearl aura, restrained luxury particles", posterFile: "imperial-lily-eight-eight-eight.svg", posterFallbackReady: true, mp4LoopPlanned: true, providerRuntimeReadyNow: false, paymentReadyNow: false, payoutReadyNow: false, sendRuntimeReadyNow: false,
    diamondPrice: 888, priceTier197F: "legendary", coinTopUpDisclosureRu: "Минимум пополнения: 10 coins = $10; покупка выключена до backend/provider approval.", qualityPromiseRu: "Цена соответствует качеству: clean poster, controlled FX, readable safe-area, no fake expensive."
  },
  {
    id: "galactic-lion-three-thousand", displayName: "Galactic Lion Three Thousand", displayNameRu: "Галактический Лев", iconName: "shield-checkmark-outline", legacyTitleKey: "giftTierPremium", catalogSegment: "premium",
    previewRu: "галактический лев появляется как mythic royal support scene", localCostLabel: "3000 алмазов · fair gift price", effectLabel: "galactic lion royal reveal", qualityLabel: "Pack 8 mythic lion poster + cue ready", loopLabel: "2.4 сек loop план", visualTone: "galactic lion", safetyBadge: "diamond price · preview only", rarityLabel: "Mythic Lion", motionSpec: "lion crest, galaxy mane, royal safe-area aura", posterFile: "galactic-lion-three-thousand.svg", posterFallbackReady: true, mp4LoopPlanned: true, providerRuntimeReadyNow: false, paymentReadyNow: false, payoutReadyNow: false, sendRuntimeReadyNow: false,
    diamondPrice: 3000, priceTier197F: "mythic", coinTopUpDisclosureRu: "Минимум пополнения: 10 coins = $10; покупка выключена до backend/provider approval.", qualityPromiseRu: "Цена соответствует качеству: clean poster, controlled FX, readable safe-area, no fake expensive."
  },
  {
    id: "diamond-jet-eight-eight-zero-zero", displayName: "Diamond Jet Eight Eight Zero Zero", displayNameRu: "Алмазный Самолёт", iconName: "airplane-outline", legacyTitleKey: "giftTierPremium", catalogSegment: "premium",
    previewRu: "алмазный самолёт делает ultra clean flyover над сценой", localCostLabel: "8800 алмазов · fair gift price", effectLabel: "diamond jet ultra flyover", qualityLabel: "Pack 8 ultra mythic jet poster + cue ready", loopLabel: "2.8 сек loop план", visualTone: "diamond jet", safetyBadge: "diamond price · preview only", rarityLabel: "Ultra Mythic Jet", motionSpec: "jet flyover, diamond trail, cinematic but readable chat layer", posterFile: "diamond-jet-eight-eight-zero-zero.svg", posterFallbackReady: true, mp4LoopPlanned: true, providerRuntimeReadyNow: false, paymentReadyNow: false, payoutReadyNow: false, sendRuntimeReadyNow: false,
    diamondPrice: 8800, priceTier197F: "ultra_mythic", coinTopUpDisclosureRu: "Минимум пополнения: 10 coins = $10; покупка выключена до backend/provider approval.", qualityPromiseRu: "Цена соответствует качеству: clean poster, controlled FX, readable safe-area, no fake expensive."
  },
  {
    id: "universe-crown-ten-thousand", displayName: "Universe Crown Ten Thousand", displayNameRu: "Корона Вселенной", iconName: "star-outline", legacyTitleKey: "giftTierPremium", catalogSegment: "premium",
    previewRu: "корона вселенной открывает top-tier финал за 10000 алмазов", localCostLabel: "10000 алмазов · fair gift price", effectLabel: "universe crown top tier finale", qualityLabel: "Pack 8 top-tier crown poster + cue ready", loopLabel: "3.2 сек loop план", visualTone: "universe crown", safetyBadge: "diamond price · preview only", rarityLabel: "Ultra Top Crown", motionSpec: "crown orbit, cosmic silk curtain, clean premium finale", posterFile: "universe-crown-ten-thousand.svg", posterFallbackReady: true, mp4LoopPlanned: true, providerRuntimeReadyNow: false, paymentReadyNow: false, payoutReadyNow: false, sendRuntimeReadyNow: false,
    diamondPrice: 10000, priceTier197F: "ultra_mythic", coinTopUpDisclosureRu: "Минимум пополнения: 10 coins = $10; покупка выключена до backend/provider approval.", qualityPromiseRu: "Цена соответствует качеству: clean poster, controlled FX, readable safe-area, no fake expensive."
  }
];

export const streamPremiumGiftPack197FIds = new Set(streamPremiumGiftPack197F.map((gift) => gift.id));

function diamondLabel197F(price: number): string {
  return price === 1 ? "1 алмаз" : `${price} алмазов`;
}

function diamondTierLabel197F(gift: StreamPremiumGiftAsset197F): string {
  return `${diamondLabel197F(gift.diamondPrice)} · ${gift.priceTier197F} · честная цена по качеству`;
}

function durationByPrice197F(price: number): number {
  if (price >= 7500) return 3200;
  if (price >= 2500) return 2600;
  if (price >= 777) return 2100;
  if (price >= 120) return 1600;
  return 900;
}

function hapticByPrice197F(price: number): StreamGiftHapticImpactStyle187B {
  if (price >= 2500) return "finale";
  if (price >= 120) return "medium";
  return "light";
}

export const streamPremiumGiftPack197FEffectProfiles: StreamPremiumGiftEffectProfile187B[] = streamPremiumGiftPack197F.map((gift, index) => ({
  assetId: gift.id,
  liveEffectLabel: `${gift.visualTone} · Pack 8 imperial galaxy reveal`,
  intensityLabel: diamondTierLabel197F(gift),
  soundCueLabel: `${gift.id} cue`,
  soundCueLabelRu: `${gift.displayNameRu} cue`,
  soundCueFile: `${streamPremiumGiftPack197FBasePath}/sound-cues/${gift.id}-cue.wav`,
  soundCueDurationMs: durationByPrice197F(gift.diamondPrice),
  hapticLabel: gift.diamondPrice >= 2500 ? "finale luxury impact" : gift.diamondPrice >= 777 ? "strong premium impact" : gift.diamondPrice >= 120 ? "medium premium impact" : "soft clean impact",
  hapticImpactStyle: hapticByPrice197F(gift.diamondPrice),
  colorA: ["#E0F2FE", "#F9A8D4", "#C4B5FD", "#FDE68A", "#FACC15", "#FBBF24", "#93C5FD", "#FDE68A"][index] ?? "#FDE68A",
  colorB: ["#38BDF8", "#22D3EE", "#67E8F9", "#F97316", "#16A34A", "#7C2D12", "#D946EF", "#6366F1"][index] ?? "#6366F1",
  phases: ["diamond price entrance", "imperial galaxy premium loop", "clean finale without fake win"],
  visualFx: ["safe-area glow", "controlled particles", "poster-first diamond badge", "imperial galaxy aura"],
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

export const streamPremiumGiftPack197FPreviewExperiences: StreamPremiumGiftPreviewExperience187C[] = streamPremiumGiftPack197F.map((gift) => ({
  assetId: gift.id,
  stageLightingLabel: `${gift.visualTone} celestial stage`,
  motionQualityLabel: `${gift.displayNameRu} · ${diamondLabel197F(gift.diamondPrice)} · clean premium preview`,
  soundPreviewLabel: `sound label only: ${gift.displayNameRu} cue`,
  hapticPreviewLabel: `haptic label only: ${gift.priceTier197F}`,
  liveSceneCopyRu: `${gift.displayNameRu} появляется как качественный подарок: ${gift.previewRu}. Цена ${diamondLabel197F(gift.diamondPrice)} показана честно, без fake expensive.`,
  safeModeCopyRu: "Preview локальный: звук не autoplay, haptic только metadata, real send/payment disabled.",
  screenReaderHintRu: `${gift.displayNameRu}, цена ${diamondLabel197F(gift.diamondPrice)}, premium preview only, без оплаты и без отправки.`,
  phaseChips: ["diamond price", "imperial galaxy poster", "clean finale"],
  qualityBadges: [gift.priceTier197F, "fair price", "no fake payment"],
  defaultQuality: gift.diamondPrice >= 120 ? "ultra" : "standard",
  localPreviewUiReadyNow: true,
  actualSoundPlaybackRuntimeEnabledNow: false,
  realSendRuntimeEnabledNow: false,
  backendRuntimeEnabledNow: false,
  paymentRuntimeEnabledNow: false,
  payoutRuntimeEnabledNow: false,
}));

export const streamPremiumGiftPack197FFinalPolishProfiles: StreamPremiumGiftFinalPolish187D[] = streamPremiumGiftPack197F.map((gift) => ({
  assetId: gift.id,
  heroPosterFile: `${streamPremiumGiftPack197FBasePath}/posters/${gift.posterFile}`,
  animeStyleLabel: `${gift.visualTone} imperial galaxy gift`,
  premiumBadge: `${gift.diamondPrice} diamonds · ${gift.priceTier197F}`,
  catalogHeroCopyRu: `${gift.displayNameRu} держит качество на цене ${diamondLabel197F(gift.diamondPrice)}: clean poster, controlled glow, readable layer.`,
  stageAuraCopyRu: `${gift.visualTone} aura · safe-area recipient focus · no noisy spam`,
  visualSignature: `${gift.effectLabel} · controlled particles`,
  soundSignature: `cue metadata only · no autoplay · ${gift.id}-cue.wav`,
  hapticSignature: `haptic metadata only · ${gift.priceTier197F}`,
  posterDetailChips: ["diamond price", "imperial galaxy poster", "safe-area"],
  polishBadgeChips: ["197F", gift.priceTier197F, `${gift.diamondPrice} diamonds`],
  finalSafetyCopyRu: "197F only displays diamond pricing and premium preview metadata. It does not top up coins, charge money, send gifts, mutate Wallet, call provider or enable payout.",
  finalPolishReadyNow: true,
  posterFallbackReadyNow: true,
  localPreviewOnlyNow: true,
  backendRuntimeEnabledNow: false,
  paymentRuntimeEnabledNow: false,
  realSendRuntimeEnabledNow: false,
  payoutRuntimeEnabledNow: false,
}));

export const streamPremiumGiftPack197FAppearanceProfiles: StreamPremiumGiftAppearanceProfile188G[] = streamPremiumGiftPack197F.map((gift) => ({
  assetId: gift.id,
  packLabelRu: "Pack 8 · Imperial Galaxy",
  appearanceTitleRu: `${gift.displayNameRu} · imperial galaxy diamond appearance`,
  fullScreenLayerRu: `clean safe-area layer with ${diamondLabel197F(gift.diamondPrice)} badge`,
  entranceRu: `${gift.visualTone} entrance · ${gift.previewRu}`,
  loopRu: "imperial galaxy premium loop with restrained particles and readable recipient focus",
  finaleRu: "soft fade finale, no fake win and no casino wording",
  entranceDurationMs: gift.diamondPrice >= 2500 ? 600 : 380,
  loopDurationMs: gift.diamondPrice >= 7500 ? 2800 : gift.diamondPrice >= 2500 ? 2300 : gift.diamondPrice >= 777 ? 1880 : 1240,
  finaleDurationMs: gift.diamondPrice >= 2500 ? 820 : 540,
  stageLightingRu: `${gift.visualTone} luxury lighting`,
  backgroundDimRu: "background dim keeps chat readable",
  particleSystemRu: "controlled imperial diamonds / sparkles only, no noisy spam",
  motionTrailRu: gift.motionSpec,
  recipientFocusRu: "recipient stays clear in safe-area glow",
  soundHitRu: "cue metadata only; autoplay disabled",
  hapticHitRu: "haptic metadata only; no automatic device impact",
  luxuryMoodRu: `${gift.priceTier197F} quality · fair diamond price`,
  appearanceChipsRu: ["197F", "Pack 8", "diamond price", "poster-first"],
  fallbackCopyRu: "reduce-motion: static poster + diamond price badge + readable label",
  safetyCopyRu: "No backend/payment/provider/Wallet/payout/send/autoplay/random-win runtime in 197F.",
  userFacingOnly: true,
  previewOnlyNow: true,
  backendRuntimeEnabledNow: false,
  paymentRuntimeEnabledNow: false,
  providerRuntimeEnabledNow: false,
  payoutRuntimeEnabledNow: false,
  sendRuntimeEnabledNow: false,
  randomWinRuntimeEnabledNow: false,
}));

export const streamPremiumGiftPack197FVisualFxProfiles: StreamPremiumGiftVisualFxProfile188H[] = streamPremiumGiftPack197F.map((gift, index) => ({
  assetId: gift.id,
  visualFxTitleRu: `${gift.displayNameRu} · Pack 8 Imperial Galaxy FX`,
  primaryGlowRu: `${gift.visualTone} primary glow`,
  particleBurstRu: `imperial galaxy diamond particles scaled to ${gift.priceTier197F}`,
  motionTrailRu: gift.motionSpec,
  auraRu: `${gift.displayNameRu} recipient aura`,
  screenImpactRu: gift.diamondPrice >= 2500 ? "cinematic full-screen impact with safe-area discipline" : "clean compact premium impact",
  finaleBurstRu: "soft imperial galaxy finale, no fake win language",
  luxuryLightingRu: `${gift.visualTone} premium lighting`,
  overlayDepthRu: "poster layer + glow layer + particle layer + diamond label layer",
  particleDensityLabel: gift.diamondPrice >= 2500 ? "ultra controlled" : gift.diamondPrice >= 120 ? "premium controlled" : "clean light",
  glowIntensityLabel: gift.diamondPrice >= 2500 ? "ultra" : gift.diamondPrice >= 120 ? "premium" : "soft",
  burstScaleLabel: gift.diamondPrice >= 2500 ? "full cinematic" : gift.diamondPrice >= 120 ? "wide clean" : "compact",
  trailDurationMs: gift.diamondPrice >= 2500 ? 2500 : gift.diamondPrice >= 777 ? 1900 : 1040,
  auraPulseMs: gift.diamondPrice >= 2500 ? 1300 : 760,
  premiumFxScore: Math.min(100, 92 + index + (gift.diamondPrice >= 7500 ? 2 : 0)),
  fxChipsRu: ["diamonds", gift.priceTier197F, "imperial galaxy FX"],
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

export const streamPremiumGiftPack197FFinalScreenPolishProfiles: StreamPremiumGiftFinalScreenPolish188I[] = streamPremiumGiftPack197F.map((gift) => ({
  assetId: gift.id,
  finalScreenTitleRu: `${gift.displayNameRu} · ${diamondLabel197F(gift.diamondPrice)} · clean finale`,
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

export const streamPremiumGiftPack197FSummary = {
  version: "STREAM-GAME-GIFTS-197F",
  pack8Count: streamPremiumGiftPack197F.length,
  addedGiftCount: streamPremiumGiftPack197F.length,
  cumulativeGiftCountAfter197F: 64,
  diamondPriceMin: Math.min(...streamPremiumGiftPack197F.map((gift) => gift.diamondPrice)),
  diamondPriceMax: Math.max(...streamPremiumGiftPack197F.map((gift) => gift.diamondPrice)),
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

export function getStreamPremiumGiftEffectProfile197F(assetId: string): StreamPremiumGiftEffectProfile187B {
  return streamPremiumGiftPack197FEffectProfiles.find((profile) => profile.assetId === assetId) ?? streamPremiumGiftPack197FEffectProfiles[0];
}

export function getStreamPremiumGiftPreviewExperience197F(assetId: string): StreamPremiumGiftPreviewExperience187C {
  return streamPremiumGiftPack197FPreviewExperiences.find((row) => row.assetId === assetId) ?? streamPremiumGiftPack197FPreviewExperiences[0];
}

export function getStreamPremiumGiftFinalPolish197F(assetId: string): StreamPremiumGiftFinalPolish187D {
  return streamPremiumGiftPack197FFinalPolishProfiles.find((row) => row.assetId === assetId) ?? streamPremiumGiftPack197FFinalPolishProfiles[0];
}

export function getStreamPremiumGiftAppearanceProfile197F(assetId: string): StreamPremiumGiftAppearanceProfile188G {
  return streamPremiumGiftPack197FAppearanceProfiles.find((row) => row.assetId === assetId) ?? streamPremiumGiftPack197FAppearanceProfiles[0];
}

export function getStreamPremiumGiftVisualFxProfile197F(assetId: string): StreamPremiumGiftVisualFxProfile188H {
  return streamPremiumGiftPack197FVisualFxProfiles.find((row) => row.assetId === assetId) ?? streamPremiumGiftPack197FVisualFxProfiles[0];
}

export function getStreamPremiumGiftFinalScreenPolish197F(assetId: string): StreamPremiumGiftFinalScreenPolish188I {
  return streamPremiumGiftPack197FFinalScreenPolishProfiles.find((row) => row.assetId === assetId) ?? streamPremiumGiftPack197FFinalScreenPolishProfiles[0];
}
