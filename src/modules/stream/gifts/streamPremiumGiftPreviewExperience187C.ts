export type StreamPremiumGiftPreviewQuality187C = "lite" | "standard" | "ultra";

export type StreamPremiumGiftPreviewExperience187C = {
  assetId: string;
  stageLightingLabel: string;
  motionQualityLabel: string;
  soundPreviewLabel: string;
  hapticPreviewLabel: string;
  liveSceneCopyRu: string;
  safeModeCopyRu: string;
  screenReaderHintRu: string;
  phaseChips: readonly string[];
  qualityBadges: readonly string[];
  defaultQuality: StreamPremiumGiftPreviewQuality187C;
  localPreviewUiReadyNow: true;
  actualSoundPlaybackRuntimeEnabledNow: false;
  realSendRuntimeEnabledNow: false;
  backendRuntimeEnabledNow: false;
  paymentRuntimeEnabledNow: false;
  payoutRuntimeEnabledNow: false;
};

export const streamPremiumGiftPreviewQualityOptions187C: Array<{ key: StreamPremiumGiftPreviewQuality187C; label: string; meta: string }> = [
  { key: "lite", label: "Lite", meta: "low motion" },
  { key: "standard", label: "Standard", meta: "poster + glow" },
  { key: "ultra", label: "Ultra", meta: "full preview" },
];

export const streamPremiumGiftPreviewExperiences187C: StreamPremiumGiftPreviewExperience187C[] = [
  {
    assetId: "sakura-heart-burst",
    stageLightingLabel: "pink sakura stage glow",
    motionQualityLabel: "petal bloom preview",
    soundPreviewLabel: "sound label: soft sakura chime",
    hapticPreviewLabel: "haptic label: soft pulse",
    liveSceneCopyRu: "Сердце из сакуры раскрывается мягким bloom, лепестки летят вокруг сцены и закрываются gentle glow.",
    safeModeCopyRu: "Preview только локальный: звук не проигрывается автоматически, haptic запускается только по кнопке vibe.",
    screenReaderHintRu: "Сакура Сердце, мягкий визуальный preview с poster fallback, без оплаты и без отправки.",
    phaseChips: ["entrance petals", "heart glow", "sparkle fade"],
    qualityBadges: ["anime poster", "soft glow", "safe haptic"],
    defaultQuality: "ultra",
    localPreviewUiReadyNow: true,
    actualSoundPlaybackRuntimeEnabledNow: false,
    realSendRuntimeEnabledNow: false,
    backendRuntimeEnabledNow: false,
    paymentRuntimeEnabledNow: false,
    payoutRuntimeEnabledNow: false,
  },
  {
    assetId: "koi-luck-splash",
    stageLightingLabel: "aqua ripple stage",
    motionQualityLabel: "water ring preview",
    soundPreviewLabel: "sound label: water bell splash",
    hapticPreviewLabel: "haptic label: wave pulse",
    liveSceneCopyRu: "Карп удачи делает водную дугу, вокруг аватара расходятся aqua rings и luck sparkle.",
    safeModeCopyRu: "В preview нет расчёта выигрыша: это только visual gift effect для стрима.",
    screenReaderHintRu: "Карп Удачи, водный preview с волнами и poster fallback, без оплаты и вывода.",
    phaseChips: ["koi arc", "water rings", "luck sparkle"],
    qualityBadges: ["aqua FX", "poster first", "lite safe"],
    defaultQuality: "ultra",
    localPreviewUiReadyNow: true,
    actualSoundPlaybackRuntimeEnabledNow: false,
    realSendRuntimeEnabledNow: false,
    backendRuntimeEnabledNow: false,
    paymentRuntimeEnabledNow: false,
    payoutRuntimeEnabledNow: false,
  },
  {
    assetId: "neon-fox-tail",
    stageLightingLabel: "neon club glow",
    motionQualityLabel: "fox tail streak preview",
    soundPreviewLabel: "sound label: synth snap",
    hapticPreviewLabel: "haptic label: snap impact",
    liveSceneCopyRu: "Неоновый лис оставляет electric tail trail и flash вокруг подарка без real send.",
    safeModeCopyRu: "Neon effect можно показать как poster + glow на слабом устройстве.",
    screenReaderHintRu: "Неоновый Лис, яркий neon preview, haptic доступен только локально.",
    phaseChips: ["fox flash", "tail sweep", "electric snap"],
    qualityBadges: ["neon trail", "high contrast", "no charge"],
    defaultQuality: "ultra",
    localPreviewUiReadyNow: true,
    actualSoundPlaybackRuntimeEnabledNow: false,
    realSendRuntimeEnabledNow: false,
    backendRuntimeEnabledNow: false,
    paymentRuntimeEnabledNow: false,
    payoutRuntimeEnabledNow: false,
  },
  {
    assetId: "moon-cat-guard",
    stageLightingLabel: "calm moon halo",
    motionQualityLabel: "star orbit preview",
    soundPreviewLabel: "sound label: night bell cue",
    hapticPreviewLabel: "haptic label: gentle tap",
    liveSceneCopyRu: "Лунный кот появляется на спокойном halo, star dust медленно вращается вокруг сцены.",
    safeModeCopyRu: "Reduce motion режим оставляет moon poster и один мягкий shimmer.",
    screenReaderHintRu: "Лунный Кот, спокойный moon halo preview без оплаты и без отправки.",
    phaseChips: ["moon halo", "cat blink", "star orbit"],
    qualityBadges: ["calm motion", "reader safe", "poster glow"],
    defaultQuality: "standard",
    localPreviewUiReadyNow: true,
    actualSoundPlaybackRuntimeEnabledNow: false,
    realSendRuntimeEnabledNow: false,
    backendRuntimeEnabledNow: false,
    paymentRuntimeEnabledNow: false,
    payoutRuntimeEnabledNow: false,
  },
  {
    assetId: "dj-star-drop",
    stageLightingLabel: "beat pulse stage",
    motionQualityLabel: "equalizer preview",
    soundPreviewLabel: "sound label: EDM star hit",
    hapticPreviewLabel: "haptic label: beat pulse",
    liveSceneCopyRu: "DJ звезда падает в центр, equalizer rings пульсируют как club beat preview.",
    safeModeCopyRu: "Sound cue отображается как label; audio playback runtime ещё выключен.",
    screenReaderHintRu: "DJ Звезда, rhythmic visual preview, звук только как metadata label.",
    phaseChips: ["star drop", "beat rings", "flash badge"],
    qualityBadges: ["sound cue", "muted safe", "beat haptic"],
    defaultQuality: "ultra",
    localPreviewUiReadyNow: true,
    actualSoundPlaybackRuntimeEnabledNow: false,
    realSendRuntimeEnabledNow: false,
    backendRuntimeEnabledNow: false,
    paymentRuntimeEnabledNow: false,
    payoutRuntimeEnabledNow: false,
  },
  {
    assetId: "golden-lion-roar",
    stageLightingLabel: "royal gold flare",
    motionQualityLabel: "crown burst preview",
    soundPreviewLabel: "sound label: soft lion roar cue",
    hapticPreviewLabel: "haptic label: strong impact",
    liveSceneCopyRu: "Золотой лев поднимает crown rays и royal aura, finale выглядит дорогим, но остаётся preview-only.",
    safeModeCopyRu: "Strong haptic запускается только по vibe; backend/send/payment закрыты.",
    screenReaderHintRu: "Золотой Лев, royal impact preview с crown burst, без реального отправления.",
    phaseChips: ["gold flare", "crown rays", "royal fade"],
    qualityBadges: ["ultra aura", "impact haptic", "safe locked"],
    defaultQuality: "ultra",
    localPreviewUiReadyNow: true,
    actualSoundPlaybackRuntimeEnabledNow: false,
    realSendRuntimeEnabledNow: false,
    backendRuntimeEnabledNow: false,
    paymentRuntimeEnabledNow: false,
    payoutRuntimeEnabledNow: false,
  },
  {
    assetId: "royal-rose-stage",
    stageLightingLabel: "velvet rose stage",
    motionQualityLabel: "petal curtain preview",
    soundPreviewLabel: "sound label: romantic sting",
    hapticPreviewLabel: "haptic label: elegant tap",
    liveSceneCopyRu: "Королевская роза раскрывается как сценический занавес, petals формируют мягкую ауру.",
    safeModeCopyRu: "Preview не создаёт покупку: это локальный poster/effect UI.",
    screenReaderHintRu: "Королевская Роза, petal bloom preview, no charge no send.",
    phaseChips: ["rose curtain", "velvet aura", "petal sparkle"],
    qualityBadges: ["romantic FX", "poster fallback", "elegant haptic"],
    defaultQuality: "standard",
    localPreviewUiReadyNow: true,
    actualSoundPlaybackRuntimeEnabledNow: false,
    realSendRuntimeEnabledNow: false,
    backendRuntimeEnabledNow: false,
    paymentRuntimeEnabledNow: false,
    payoutRuntimeEnabledNow: false,
  },
  {
    assetId: "cosmic-dragon-gate",
    stageLightingLabel: "cosmic portal stage",
    motionQualityLabel: "dragon finale preview",
    soundPreviewLabel: "sound label: deep cosmic hit",
    hapticPreviewLabel: "haptic label: finale impact",
    liveSceneCopyRu: "Космический дракон открывает портал, comet trail пересекает сцену и закрывается mythic finale.",
    safeModeCopyRu: "Ultra preview можно заменить lite portal poster на слабом устройстве; payout/payment отсутствуют.",
    screenReaderHintRu: "Космический Дракон, mythic portal preview, без выигрыша, оплаты и вывода.",
    phaseChips: ["portal open", "dragon pass", "comet finale"],
    qualityBadges: ["mythic FX", "finale haptic", "lite fallback"],
    defaultQuality: "ultra",
    localPreviewUiReadyNow: true,
    actualSoundPlaybackRuntimeEnabledNow: false,
    realSendRuntimeEnabledNow: false,
    backendRuntimeEnabledNow: false,
    paymentRuntimeEnabledNow: false,
    payoutRuntimeEnabledNow: false,
  },
];

export const getStreamPremiumGiftPreviewExperience187C = (assetId: string): StreamPremiumGiftPreviewExperience187C => {
  return streamPremiumGiftPreviewExperiences187C.find((experience) => experience.assetId === assetId) ?? streamPremiumGiftPreviewExperiences187C[0];
};

export const streamPremiumGiftPreviewExperience187CSafety = {
  userFacingOnly: true,
  localPreviewUiReady: true,
  soundToggleIsMetadataOnly: true,
  hapticPreviewIsLocalOnly: true,
  actualSoundPlaybackRuntimeEnabledNow: false,
  realSendRuntimeEnabledNow: false,
  backendRuntimeEnabledNow: false,
  paymentRuntimeEnabledNow: false,
  payoutRuntimeEnabledNow: false,
  providerRuntimeEnabledNow: false,
} as const;
