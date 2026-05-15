import { Gift } from "../types";

export function shouldPlayAudio(gift: Gift): boolean {
  return Boolean(gift.audio?.src) && (gift.tier === "t3" || gift.tier === "t4" || gift.tier === "t5");
}

export function getGiftPlaybackDurationMs(gift: Gift): number {
  if (gift.audio?.duration && gift.audio.duration > 0) {
    return Math.round(gift.audio.duration * 1000);
  }

  switch (gift.tier) {
    case "t1":
      return 1400;
    case "t2":
      return 2400;
    case "t3":
      return 4000;
    case "t4":
      return 6500;
    case "t5":
      return 8500;
    default:
      return 2500;
  }
}

export function getGiftScaleForTier(gift: Gift): number {
  switch (gift.tier) {
    case "t1":
      return 0.9;
    case "t2":
      return 1;
    case "t3":
      return 1.08;
    case "t4":
      return 1.16;
    case "t5":
      return 1.24;
    default:
      return 1;
  }
}

export function getGiftOverlayIntensity(gift: Gift): "soft" | "medium" | "rich" {
  switch (gift.tier) {
    case "t1":
    case "t2":
      return "soft";
    case "t3":
      return "medium";
    case "t4":
    case "t5":
      return "rich";
    default:
      return "soft";
  }
}