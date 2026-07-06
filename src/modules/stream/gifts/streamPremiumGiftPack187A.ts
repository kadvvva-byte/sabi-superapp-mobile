export type StreamPremiumGiftCatalogSegment187A = "anime" | "sound" | "premium";

export type StreamPremiumGiftAsset187A = {
  id: string;
  displayName: string;
  displayNameRu: string;
  iconName: string;
  legacyTitleKey: string;
  catalogSegment: StreamPremiumGiftCatalogSegment187A;
  previewRu: string;
  localCostLabel: string;
  effectLabel: string;
  qualityLabel: string;
  loopLabel: string;
  visualTone: string;
  safetyBadge: string;
  rarityLabel: string;
  motionSpec: string;
  posterFile: string;
  posterFallbackReady: boolean;
  mp4LoopPlanned: boolean;
  providerRuntimeReadyNow: false;
  paymentReadyNow: false;
  payoutReadyNow: false;
  sendRuntimeReadyNow: false;
};

export const streamPremiumGiftPack187AAssetBasePath = "assets/stream/gifts/187a-premium-pack" as const;

export const streamPremiumGiftPack187A: StreamPremiumGiftAsset187A[] = [
  {"id": "sakura-heart-burst", "displayName": "Sakura Heart Burst", "displayNameRu": "Сакура Сердце", "iconName": "heart-circle-outline", "legacyTitleKey": "giftTierBasic", "catalogSegment": "anime", "previewRu": "сердце из лепестков сакуры", "localCostLabel": "18 алмазов позже", "effectLabel": "anime petal burst", "qualityLabel": "poster SVG ready", "loopLabel": "1.2 сек loop план", "visualTone": "sakura glow", "safetyBadge": "safe-area", "rarityLabel": "Common Anime", "motionSpec": "petals expand, heart pulse, soft fade", "posterFile": "sakura-heart-burst.svg", "posterFallbackReady": true, "mp4LoopPlanned": true, "providerRuntimeReadyNow": false, "paymentReadyNow": false, "payoutReadyNow": false, "sendRuntimeReadyNow": false},
  {"id": "koi-luck-splash", "displayName": "Koi Luck Splash", "displayNameRu": "Карп Удачи", "iconName": "fish-outline", "legacyTitleKey": "giftTierEffect", "catalogSegment": "anime", "previewRu": "кои-рыбка и водный всплеск", "localCostLabel": "28 алмазов позже", "effectLabel": "water splash overlay", "qualityLabel": "poster SVG ready", "loopLabel": "1.4 сек loop план", "visualTone": "aqua luck", "safetyBadge": "moderated", "rarityLabel": "Rare Anime", "motionSpec": "koi arc, water rings, shine trail", "posterFile": "koi-luck-splash.svg", "posterFallbackReady": true, "mp4LoopPlanned": true, "providerRuntimeReadyNow": false, "paymentReadyNow": false, "payoutReadyNow": false, "sendRuntimeReadyNow": false},
  {"id": "neon-fox-tail", "displayName": "Neon Fox Tail", "displayNameRu": "Неоновый Лис", "iconName": "flame-outline", "legacyTitleKey": "giftTierPremium", "catalogSegment": "anime", "previewRu": "хвост лиса и неоновый след", "localCostLabel": "55 алмазов позже", "effectLabel": "fox tail neon loop", "qualityLabel": "poster SVG ready", "loopLabel": "1.8 сек loop план", "visualTone": "neon fox", "safetyBadge": "poster first", "rarityLabel": "Epic Anime", "motionSpec": "tail swipe, star sparks, neon echo", "posterFile": "neon-fox-tail.svg", "posterFallbackReady": true, "mp4LoopPlanned": true, "providerRuntimeReadyNow": false, "paymentReadyNow": false, "payoutReadyNow": false, "sendRuntimeReadyNow": false},
  {"id": "moon-cat-guard", "displayName": "Moon Cat Guard", "displayNameRu": "Лунный Кот", "iconName": "moon-outline", "legacyTitleKey": "giftTierUltra", "catalogSegment": "anime", "previewRu": "лунный кот-защитник", "localCostLabel": "75 алмазов позже", "effectLabel": "moon guardian scene", "qualityLabel": "poster SVG ready", "loopLabel": "2.0 сек loop план", "visualTone": "moon anime", "safetyBadge": "review", "rarityLabel": "Epic Anime", "motionSpec": "moon rise, cat blink, shield shimmer", "posterFile": "moon-cat-guard.svg", "posterFallbackReady": true, "mp4LoopPlanned": true, "providerRuntimeReadyNow": false, "paymentReadyNow": false, "payoutReadyNow": false, "sendRuntimeReadyNow": false},
  {"id": "dj-star-drop", "displayName": "DJ Star Drop", "displayNameRu": "DJ Звезда", "iconName": "musical-notes-outline", "legacyTitleKey": "giftTierAudio", "catalogSegment": "sound", "previewRu": "звезда и мягкий sound-cue", "localCostLabel": "42 алмазов позже", "effectLabel": "muted-safe sound poster", "qualityLabel": "audio muted safe", "loopLabel": "1.6 сек loop план", "visualTone": "sound cue", "safetyBadge": "muted safe", "rarityLabel": "Rare Sound", "motionSpec": "star drop, wave rings, muted cue badge", "posterFile": "dj-star-drop.svg", "posterFallbackReady": true, "mp4LoopPlanned": true, "providerRuntimeReadyNow": false, "paymentReadyNow": false, "payoutReadyNow": false, "sendRuntimeReadyNow": false},
  {"id": "golden-lion-roar", "displayName": "Golden Lion Roar", "displayNameRu": "Золотой Лев", "iconName": "shield-checkmark-outline", "legacyTitleKey": "giftTierPremium", "catalogSegment": "premium", "previewRu": "золотой лев и сцена поддержки", "localCostLabel": "120 алмазов позже", "effectLabel": "premium roar scene", "qualityLabel": "poster SVG ready", "loopLabel": "2.2 сек loop план", "visualTone": "gold premium", "safetyBadge": "moderated", "rarityLabel": "Legendary", "motionSpec": "lion crest, gold rays, soft roar badge", "posterFile": "golden-lion-roar.svg", "posterFallbackReady": true, "mp4LoopPlanned": true, "providerRuntimeReadyNow": false, "paymentReadyNow": false, "payoutReadyNow": false, "sendRuntimeReadyNow": false},
  {"id": "royal-rose-stage", "displayName": "Royal Rose Stage", "displayNameRu": "Королевская Роза", "iconName": "rose-outline", "legacyTitleKey": "giftTierPremium", "catalogSegment": "premium", "previewRu": "королевская роза на сцене", "localCostLabel": "150 алмазов позже", "effectLabel": "rose stage bloom", "qualityLabel": "poster SVG ready", "loopLabel": "2.4 сек loop план", "visualTone": "royal bloom", "safetyBadge": "poster first", "rarityLabel": "Legendary", "motionSpec": "rose bloom, crown flare, curtain fade", "posterFile": "royal-rose-stage.svg", "posterFallbackReady": true, "mp4LoopPlanned": true, "providerRuntimeReadyNow": false, "paymentReadyNow": false, "payoutReadyNow": false, "sendRuntimeReadyNow": false},
  {"id": "cosmic-dragon-gate", "displayName": "Cosmic Dragon Gate", "displayNameRu": "Космический Дракон", "iconName": "planet-outline", "legacyTitleKey": "giftTierUltra", "catalogSegment": "premium", "previewRu": "дракон и космические ворота", "localCostLabel": "220 алмазов позже", "effectLabel": "cosmic dragon gate", "qualityLabel": "poster SVG ready", "loopLabel": "3.0 сек loop план", "visualTone": "cosmic gate", "safetyBadge": "review", "rarityLabel": "Mythic", "motionSpec": "dragon silhouette, portal glow, comet sweep", "posterFile": "cosmic-dragon-gate.svg", "posterFallbackReady": true, "mp4LoopPlanned": true, "providerRuntimeReadyNow": false, "paymentReadyNow": false, "payoutReadyNow": false, "sendRuntimeReadyNow": false},
];

export const streamPremiumGiftPack187ASafety = {
  userFacingOnly: true,
  posterFallbackReady: true,
  mp4LoopRuntimeIncludedNow: false,
  sendRuntimeIncludedNow: false,
  backendRuntimeIncludedNow: false,
  paymentRuntimeIncludedNow: false,
  payoutRuntimeIncludedNow: false,
  cashOutIncludedNow: false,
  randomWinRuntimeIncludedNow: false,
} as const;
