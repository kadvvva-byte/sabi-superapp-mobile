import { streamPremiumGiftPack190A, streamPremiumGiftPack190AIds, streamPremiumGiftPack190ASummary } from "./streamPremiumGiftPack190A";

export type StreamPremiumGiftPack190BVisualAnimationPolish = {
  assetId: string;
  displayNameRu: string;
  packLabel: "Pack 3";
  heroEntranceRu: string;
  premiumMotionSignatureRu: string;
  screenChoreographyRu: string;
  animeCameraMoveRu: string;
  glowStackRu: string;
  particleStackRu: string;
  trailStackRu: string;
  finaleBurstRu: string;
  soundImpactRu: string;
  hapticImpactRu: string;
  qualityBadgeRu: string;
  posterPolishFile: string;
  entranceDurationMs: number;
  loopDurationMs: number;
  finaleDurationMs: number;
  safeAreaPolicyRu: string;
  reduceMotionFallbackRu: string;
  actualAnimationPlaybackRuntimeEnabledNow: false;
  actualSoundAutoplayRuntimeEnabledNow: false;
  realSendRuntimeEnabledNow: false;
  backendRuntimeEnabledNow: false;
};

const packThreePolishDetails = [
  { hero: "солнечный разрез по диагонали экрана", motion: "katana flash + gold cape sweep", camera: "anime speed-in + freeze impact", glow: "gold rim light + orange blade bloom", particles: "sun shards + spark rain", trail: "two blade trails with afterimage", finale: "samurai seal burst", sound: "sharp cinematic blade hit", haptic: "strong slash impact" },
  { hero: "жемчужная волна открывает сцену", motion: "pearl bloom + water ribbon loop", camera: "soft push-in through ocean mist", glow: "aqua pearl glow + white caustics", particles: "bubble pearls + sea glitter", trail: "curved water silk trail", finale: "pearl halo splash", sound: "water chime impact", haptic: "soft wave pulse" },
  { hero: "лунный портал раскрывает силуэт волка", motion: "moon howl aura + silver run loop", camera: "moon zoom + dramatic silhouette", glow: "blue moon glow + silver outline", particles: "star dust + frost sparks", trail: "silver paw aftertrail", finale: "moon ring burst", sound: "deep night bell hit", haptic: "medium moon pulse" },
  { hero: "конфетная планета подпрыгивает в pop-вспышке", motion: "bubble orbit + candy confetti loop", camera: "playful bounce-in + pop shake", glow: "pink candy glow + sugar shine", particles: "candy dots + bubble pops", trail: "gum ribbon trail", finale: "sweet pop burst", sound: "bright pop candy hit", haptic: "light pop tap" },
  { hero: "павлин раскрывает драгоценный веер", motion: "royal feather fan + jewel shimmer loop", camera: "slow luxury reveal + center hold", glow: "emerald gold glow + jewel rays", particles: "gem sparks + feather dust", trail: "fan feather trail", finale: "royal jewel burst", sound: "luxury shimmer hit", haptic: "elegant medium impact" },
  { hero: "неоновая акула прорезает экран волной", motion: "aqua tunnel surge + neon fin loop", camera: "fast side sweep + wave shake", glow: "cyan neon glow + blue laser edge", particles: "water sparks + neon bubbles", trail: "aqua laser trail", finale: "wave tunnel burst", sound: "neon wave bass hit", haptic: "sharp surge pulse" },
  { hero: "арфа запускает золотой световой аккорд", motion: "light note orbit + halo loop", camera: "gentle rise + angelic spotlight", glow: "soft gold glow + ivory halo", particles: "music notes + light dust", trail: "gold soundwave trail", finale: "angel chord flare", sound: "harp chord impact", haptic: "gentle harmonic pulse" },
  { hero: "вулканический портал выпускает дракона", motion: "lava gate + dragon flare loop", camera: "heavy zoom-in + ember shake", glow: "lava orange glow + red hot rim", particles: "embers + ash sparks", trail: "fire dragon trail", finale: "volcano dragon burst", sound: "deep fire impact", haptic: "strong finale impact" },
] as const;

export const streamPremiumGiftPack190BVisualAnimationPolishProfiles: StreamPremiumGiftPack190BVisualAnimationPolish[] = streamPremiumGiftPack190A.map((gift, index) => {
  const detail = packThreePolishDetails[index] ?? packThreePolishDetails[0];
  return {
    assetId: gift.id,
    displayNameRu: gift.displayNameRu,
    packLabel: "Pack 3",
    heroEntranceRu: detail.hero,
    premiumMotionSignatureRu: detail.motion,
    screenChoreographyRu: `${gift.displayNameRu}: entrance → premium loop → finale burst, preview-only`,
    animeCameraMoveRu: detail.camera,
    glowStackRu: detail.glow,
    particleStackRu: detail.particles,
    trailStackRu: detail.trail,
    finaleBurstRu: detail.finale,
    soundImpactRu: detail.sound,
    hapticImpactRu: detail.haptic,
    qualityBadgeRu: "Ultra premium screen polish",
    posterPolishFile: `assets/stream/gifts/190b-visual-animation-polish/${gift.id}-visual-animation-polish.svg`,
    entranceDurationMs: 780 + index * 20,
    loopDurationMs: 1880 + index * 40,
    finaleDurationMs: 820 + index * 25,
    safeAreaPolicyRu: "center-safe overlay, no chat/input overlap, poster-first fallback",
    reduceMotionFallbackRu: "one premium poster pulse, no fast sweep, sound label only",
    actualAnimationPlaybackRuntimeEnabledNow: false,
    actualSoundAutoplayRuntimeEnabledNow: false,
    realSendRuntimeEnabledNow: false,
    backendRuntimeEnabledNow: false,
  };
});

export const streamPremiumGiftPack190BVisualAnimationPolishSummary = {
  version: "STREAM-GAME-GIFTS-190B",
  giftCount: streamPremiumGiftPack190BVisualAnimationPolishProfiles.length,
  cumulativeGiftCount: streamPremiumGiftPack190ASummary.cumulativeGiftCountAfter190A,
  packThreeOnly: true,
  visualAnimationPolishReady: true,
  actualAnimationPlaybackRuntimeEnabledNow: false,
  actualSoundAutoplayRuntimeEnabledNow: false,
  realSendRuntimeEnabledNow: false,
  backendRuntimeEnabledNow: false,
} as const;

export function getStreamPremiumGiftPack190BVisualAnimationPolish(assetId: string): StreamPremiumGiftPack190BVisualAnimationPolish {
  if (!streamPremiumGiftPack190AIds.has(assetId)) {
    return streamPremiumGiftPack190BVisualAnimationPolishProfiles[0];
  }
  return streamPremiumGiftPack190BVisualAnimationPolishProfiles.find((profile) => profile.assetId === assetId) ?? streamPremiumGiftPack190BVisualAnimationPolishProfiles[0];
}
