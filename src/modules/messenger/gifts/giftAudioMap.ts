import type { AVPlaybackSource } from "expo-av";

const GIFT_AUDIO_SOURCES: Record<string, AVPlaybackSource> = {
  gift_galaxy_dragon_supreme: require("./assets/audio/gift_galaxy_dragon_supreme_theme.wav"),
};

export function getGiftAudioSource(id: string): AVPlaybackSource | null {
  return GIFT_AUDIO_SOURCES[id] ?? null;
}
