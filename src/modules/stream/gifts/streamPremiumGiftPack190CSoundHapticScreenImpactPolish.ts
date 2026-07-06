import { streamPremiumGiftPack190A, streamPremiumGiftPack190AIds, streamPremiumGiftPack190ASummary } from "./streamPremiumGiftPack190A";
import type { StreamGiftHapticImpactStyle187B } from "./streamPremiumGiftEffects187B";

export type StreamPremiumGiftPack190CSoundHapticScreenImpactPolish = {
  assetId: string;
  displayNameRu: string;
  packLabel: "Pack 3";
  soundImpactTitleRu: string;
  soundSignatureRu: string;
  soundLayerStackRu: string;
  soundCueFile: string;
  soundCueDurationMs: number;
  hapticImpactStyle: StreamGiftHapticImpactStyle187B;
  hapticSignatureRu: string;
  hapticSequenceRu: string;
  screenImpactTimingRu: string;
  finaleScreenHitRu: string;
  recipientFocusRu: string;
  crowdMomentRu: string;
  silenceFallbackRu: string;
  hapticFallbackRu: string;
  impactJsonFile: string;
  safetyCopyRu: string;
  actualSoundAutoplayRuntimeEnabledNow: false;
  actualMediaPlaybackRuntimeEnabledNow: false;
  realSendRuntimeEnabledNow: false;
  backendRuntimeEnabledNow: false;
  paymentRuntimeEnabledNow: false;
  providerRuntimeEnabledNow: false;
  payoutRuntimeEnabledNow: false;
};

const packThreeImpactDetails = [
  { title: "самурайский screen hit", sound: "sharp blade hit + gold shimmer tail", stack: "blade transient, low cinematic thump, gold sparkle tail", haptic: "strong slash → short rigid finale", style: "strong", timing: "120ms pre-glow, 420ms blade hit, 980ms gold tail", finale: "солнечный клинок закрывает сцену золотой печатью", focus: "камера фиксирует получателя в золотом контуре", crowd: "chat sparkle wave без результата и без оплаты" },
  { title: "жемчужный wave hit", sound: "water bell + pearl shimmer swell", stack: "soft water bell, bubble shimmer, ocean pad tail", haptic: "soft pulse → medium pearl bloom", style: "medium", timing: "160ms aqua inhale, 520ms pearl wave, 1100ms mist tail", finale: "жемчужная волна исчезает мягкой короной", focus: "получатель подсвечен aqua halo", crowd: "bubble sparkle wave preview-only" },
  { title: "лунный wolf impact", sound: "deep night bell + wolf aura swell", stack: "night bell, moon bass, silver dust tail", haptic: "medium moon pulse → rigid ring", style: "medium", timing: "180ms moon open, 560ms howl hit, 1180ms silver tail", finale: "лунное кольцо закрывает сцену", focus: "получатель в silver moon spotlight", crowd: "star dust ripple без выигрыша" },
  { title: "candy pop impact", sound: "bright candy pop + bubble click tail", stack: "pop transient, sugar click, playful synth tail", haptic: "light tap → soft bubble pulse", style: "light", timing: "90ms sugar flash, 320ms pop hit, 760ms bubble tail", finale: "конфетная планета делает сладкий burst", focus: "получатель в pink candy glow", crowd: "confetti dots preview-only" },
  { title: "royal peacock fan hit", sound: "luxury shimmer + jewel fan sweep", stack: "jewel transient, silk fan sweep, gold shimmer tail", haptic: "medium elegant impact → soft fan pulse", style: "medium", timing: "220ms jewel pre-light, 640ms fan reveal, 1240ms royal tail", finale: "павлиний веер закрывается королевским блеском", focus: "получатель в emerald-gold frame", crowd: "jewel sparks without payment" },
  { title: "neon shark surge hit", sound: "neon wave bass + aqua laser snap", stack: "bass surge, aqua laser, water spark tail", haptic: "strong surge → short snap", style: "strong", timing: "130ms wave tunnel, 460ms shark snap, 1020ms neon trail", finale: "акула прорезает экран финальной волной", focus: "получатель в aqua laser ring", crowd: "neon water ripple preview-only" },
  { title: "angel harp chord hit", sound: "harp chord + gold halo resonance", stack: "harp pluck, angel chord, soft halo tail", haptic: "soft harmonic pulse", style: "soft", timing: "200ms halo rise, 620ms chord hit, 1320ms light tail", finale: "арфа растворяется в золотом ореоле", focus: "получатель в warm angel spotlight", crowd: "light note orbit without send runtime" },
  { title: "volcano dragon finale hit", sound: "deep fire impact + dragon ember roar", stack: "lava sub hit, ember roar, fire trail tail", haptic: "finale heavy impact → rigid close", style: "finale", timing: "180ms lava gate, 520ms dragon hit, 1280ms ember storm", finale: "дракон закрывает сцену вулканическим flare", focus: "получатель в lava crown spotlight", crowd: "ember storm preview-only" },
] as const;

export const streamPremiumGiftPack190CSoundHapticScreenImpactPolishProfiles: StreamPremiumGiftPack190CSoundHapticScreenImpactPolish[] = streamPremiumGiftPack190A.map((gift, index) => {
  const detail = packThreeImpactDetails[index] ?? packThreeImpactDetails[0];
  return {
    assetId: gift.id,
    displayNameRu: gift.displayNameRu,
    packLabel: "Pack 3",
    soundImpactTitleRu: detail.title,
    soundSignatureRu: detail.sound,
    soundLayerStackRu: detail.stack,
    soundCueFile: `assets/stream/gifts/190a-premium-pack/sound-cues/${gift.id}-cue.wav`,
    soundCueDurationMs: 1160 + index * 80,
    hapticImpactStyle: detail.style as StreamGiftHapticImpactStyle187B,
    hapticSignatureRu: detail.haptic,
    hapticSequenceRu: `${detail.haptic} · local haptic preview only`,
    screenImpactTimingRu: detail.timing,
    finaleScreenHitRu: detail.finale,
    recipientFocusRu: detail.focus,
    crowdMomentRu: detail.crowd,
    silenceFallbackRu: "sound off: show sound label only, no autoplay, no hidden playback",
    hapticFallbackRu: "haptic off or unsupported: visual pulse remains, no blocking state",
    impactJsonFile: `assets/stream/gifts/190c-sound-haptic-impact/${gift.id}-screen-impact-polish.json`,
    safetyCopyRu: "Preview-only: no real send, no payment, no payout, no provider, no backend runtime.",
    actualSoundAutoplayRuntimeEnabledNow: false,
    actualMediaPlaybackRuntimeEnabledNow: false,
    realSendRuntimeEnabledNow: false,
    backendRuntimeEnabledNow: false,
    paymentRuntimeEnabledNow: false,
    providerRuntimeEnabledNow: false,
    payoutRuntimeEnabledNow: false,
  };
});

export const streamPremiumGiftPack190CSoundHapticScreenImpactSummary = {
  version: "STREAM-GAME-GIFTS-190C",
  giftCount: streamPremiumGiftPack190CSoundHapticScreenImpactPolishProfiles.length,
  cumulativeGiftCount: streamPremiumGiftPack190ASummary.cumulativeGiftCountAfter190A,
  packThreeOnly: true,
  soundImpactProfilesReady: true,
  hapticImpactProfilesReady: true,
  screenImpactPolishReady: true,
  actualSoundAutoplayRuntimeEnabledNow: false,
  actualMediaPlaybackRuntimeEnabledNow: false,
  realSendRuntimeEnabledNow: false,
  backendRuntimeEnabledNow: false,
  paymentRuntimeEnabledNow: false,
  providerRuntimeEnabledNow: false,
  payoutRuntimeEnabledNow: false,
} as const;

export function getStreamPremiumGiftPack190CSoundHapticScreenImpactPolish(assetId: string): StreamPremiumGiftPack190CSoundHapticScreenImpactPolish {
  if (!streamPremiumGiftPack190AIds.has(assetId)) {
    return streamPremiumGiftPack190CSoundHapticScreenImpactPolishProfiles[0];
  }
  return streamPremiumGiftPack190CSoundHapticScreenImpactPolishProfiles.find((profile) => profile.assetId === assetId) ?? streamPremiumGiftPack190CSoundHapticScreenImpactPolishProfiles[0];
}
