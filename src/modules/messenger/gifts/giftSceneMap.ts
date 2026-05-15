import type { AVPlaybackSource } from "expo-av";

/**
 * IMPORTANT:
 * This file expects a real dragon mp4 here:
 * src/modules/messenger/gifts/assets/scenes/gift_galaxy_dragon_supreme.mp4
 *
 * No mp4 is bundled in this clean code pack.
 */
const GIFT_SCENE_SOURCES: Record<string, AVPlaybackSource> = {
  gift_galaxy_dragon_supreme: require("./assets/scenes/gift_galaxy_dragon_supreme.mp4"),
};

export function getGiftSceneSource(id: string): AVPlaybackSource | null {
  return GIFT_SCENE_SOURCES[id] ?? null;
}

export function hasGiftSceneSource(id: string) {
  return Boolean(GIFT_SCENE_SOURCES[id]);
}
