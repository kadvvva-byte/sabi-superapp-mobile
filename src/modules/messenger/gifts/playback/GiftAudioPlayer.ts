import { Gift } from "../types";
import { shouldPlayAudio } from "./GiftPlaybackRules";

let currentAudio: HTMLAudioElement | null = null;

function stopCurrentAudio() {
  if (!currentAudio) return;
  try {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  } catch {}
  currentAudio = null;
}

export function stopGiftAudio() {
  stopCurrentAudio();
}

export async function playGiftAudio(gift: Gift): Promise<void> {
  if (!shouldPlayAudio(gift) || !gift.audio?.src) return;

  stopCurrentAudio();

  if (typeof Audio === "undefined") return;

  try {
    const audio = new Audio(gift.audio.src);
    audio.volume = gift.tier === "t5" ? 0.65 : 0.5;
    currentAudio = audio;
    await audio.play();
  } catch {
    currentAudio = null;
  }
}