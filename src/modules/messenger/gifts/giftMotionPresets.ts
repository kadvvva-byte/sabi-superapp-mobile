import {
  GIFT_MASTER_CATALOG,
  type GiftMasterItem,
} from "./giftMasterCatalog";

export type GiftPlaybackMode =
  | "bubble"
  | "bubble_trail"
  | "near_fullscreen"
  | "fullscreen"
  | "ultra_fullscreen";

export type GiftMenuIdlePreset =
  | "soft_float"
  | "soft_pulse"
  | "sparkle"
  | "orbital"
  | "royal_glow"
  | "cosmic_drift";

export type GiftEntryEffect =
  | "bloom"
  | "petal_burst"
  | "pulse_pop"
  | "trail_rise"
  | "spark_burst"
  | "ring_open"
  | "wing_open"
  | "portal_open"
  | "crown_drop"
  | "throne_drop"
  | "dragon_sweep"
  | "car_drive_in"
  | "gift_box_open"
  | "diamond_rain"
  | "castle_reveal"
  | "universe_gate";

export type GiftParticleEffect =
  | "none"
  | "petals"
  | "hearts"
  | "sparkles"
  | "diamonds"
  | "embers"
  | "stars"
  | "mist"
  | "confetti"
  | "wings"
  | "royal_dust"
  | "cosmic";

export type GiftAudioPreset =
  | "none"
  | "soft_chime"
  | "soft_heart"
  | "soft_magic"
  | "luxury_hit"
  | "royal_hit"
  | "engine_sweep"
  | "dragon_roar"
  | "cosmic_rise"
  | "diamond_shine";

export type GiftMotionPreset = {
  id: string;
  playbackMode: GiftPlaybackMode;
  menuIdle: GiftMenuIdlePreset;
  entryEffect: GiftEntryEffect;
  particleEffect: GiftParticleEffect;
  audioPreset: GiftAudioPreset;
  durationMs: number;
  intensity: 1 | 2 | 3 | 4 | 5;
  hasLoop: boolean;
  usesFullscreen: boolean;
  cameraShake: boolean;
};

function resolveIntensity(item: GiftMasterItem): 1 | 2 | 3 | 4 | 5 {
  switch (item.tier) {
    case "micro":
      return 1;
    case "basic":
      return 1;
    case "enhanced":
      return 2;
    case "audio":
      return 3;
    case "near_fullscreen":
      return 4;
    case "premium":
      return 4;
    case "ultra":
      return 5;
    default:
      return 2;
  }
}

function mapMasterToMotionPreset(item: GiftMasterItem): GiftMotionPreset {
  const intensity = resolveIntensity(item);

  return {
    id: item.id,
    playbackMode: "ultra_fullscreen",
    menuIdle: "cosmic_drift",
    entryEffect: "dragon_sweep",
    particleEffect: "cosmic",
    audioPreset: "dragon_roar",
    durationMs: item.durationMs,
    intensity,
    hasLoop: false,
    usesFullscreen: true,
    cameraShake: true,
  };
}

export const GIFT_MOTION_PRESETS: Record<string, GiftMotionPreset> =
  Object.fromEntries(
    GIFT_MASTER_CATALOG.map((item) => [item.id, mapMasterToMotionPreset(item)]),
  );

export function getGiftMotionPreset(id: string) {
  return GIFT_MOTION_PRESETS[id] ?? null;
}

export function getGiftMotionPresetsByIds(ids: string[]) {
  return ids
    .map((id) => GIFT_MOTION_PRESETS[id])
    .filter(Boolean) as GiftMotionPreset[];
}
