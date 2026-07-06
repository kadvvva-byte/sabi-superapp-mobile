export type StreamGiftHapticImpactStyle187B = "soft" | "light" | "medium" | "strong" | "finale";

export type StreamPremiumGiftEffectProfile187B = {
  assetId: string;
  liveEffectLabel: string;
  intensityLabel: string;
  soundCueLabel: string;
  soundCueLabelRu: string;
  soundCueFile: string;
  soundCueDurationMs: number;
  hapticLabel: string;
  hapticImpactStyle: StreamGiftHapticImpactStyle187B;
  colorA: string;
  colorB: string;
  phases: readonly string[];
  visualFx: readonly string[];
  reducedMotionFallback: string;
  localSoundAssetReady: true;
  localHapticMetadataReady: true;
  livePreviewRuntimeReadyNow: true;
  soundPlaybackRuntimeEnabledNow: false;
  backendRuntimeReadyNow: false;
  paymentRuntimeReadyNow: false;
  payoutRuntimeReadyNow: false;
  realSendRuntimeReadyNow: false;
};

export const streamPremiumGiftEffects187BBasePath = "assets/stream/gifts/187b-sound-cues" as const;

export const streamPremiumGiftEffects187B: StreamPremiumGiftEffectProfile187B[] = [
  {"assetId": "sakura-heart-burst", "liveEffectLabel": "живое сердце из сакуры", "intensityLabel": "Soft bloom", "soundCueLabel": "soft sakura chime", "soundCueLabelRu": "мягкий звон сакуры", "soundCueFile": "assets/stream/gifts/187b-sound-cues/sakura-heart-burst-soft-chime.wav", "soundCueDurationMs": 1180, "hapticLabel": "soft pulse", "hapticImpactStyle": "soft", "colorA": "#FF8BCB", "colorB": "#F2C75B", "phases": ["лепестки собираются в сердце", "сердце пульсирует розовым glow", "мягкий fade с sparkles"], "visualFx": ["petal burst", "heart glow", "soft sparkle trail"], "reducedMotionFallback": "reduce-motion: static sakura heart poster + gentle glow only", "localSoundAssetReady": true, "localHapticMetadataReady": true, "livePreviewRuntimeReadyNow": true, "soundPlaybackRuntimeEnabledNow": false, "backendRuntimeReadyNow": false, "paymentRuntimeReadyNow": false, "payoutRuntimeReadyNow": false, "realSendRuntimeReadyNow": false},
  {"assetId": "koi-luck-splash", "liveEffectLabel": "водный всплеск удачи", "intensityLabel": "Aqua pulse", "soundCueLabel": "water bell splash", "soundCueLabelRu": "водный колокольчик", "soundCueFile": "assets/stream/gifts/187b-sound-cues/koi-luck-splash-water-bell.wav", "soundCueDurationMs": 1360, "hapticLabel": "wave pulse", "hapticImpactStyle": "light", "colorA": "#51D6FF", "colorB": "#7CFFD9", "phases": ["кои делает дугу над сценой", "водные кольца расходятся вокруг аватара", "luck sparkle закрывает loop"], "visualFx": ["water rings", "aqua shine", "koi trail"], "reducedMotionFallback": "lite-device: poster + 2 water rings, no heavy particles", "localSoundAssetReady": true, "localHapticMetadataReady": true, "livePreviewRuntimeReadyNow": true, "soundPlaybackRuntimeEnabledNow": false, "backendRuntimeReadyNow": false, "paymentRuntimeReadyNow": false, "payoutRuntimeReadyNow": false, "realSendRuntimeReadyNow": false},
  {"assetId": "neon-fox-tail", "liveEffectLabel": "неоновый хвост лиса", "intensityLabel": "Neon snap", "soundCueLabel": "short synth snap", "soundCueLabelRu": "короткий synth snap", "soundCueFile": "assets/stream/gifts/187b-sound-cues/neon-fox-tail-synth-snap.wav", "soundCueDurationMs": 1550, "hapticLabel": "snap impact", "hapticImpactStyle": "medium", "colorA": "#9B5CFF", "colorB": "#00F5FF", "phases": ["fox silhouette flashes in neon", "tail swipe leaves electric trail", "star sparks snap into badge"], "visualFx": ["neon trail", "tail swipe", "electric sparks"], "reducedMotionFallback": "reduce-motion: neon outline poster + static tail glow", "localSoundAssetReady": true, "localHapticMetadataReady": true, "livePreviewRuntimeReadyNow": true, "soundPlaybackRuntimeEnabledNow": false, "backendRuntimeReadyNow": false, "paymentRuntimeReadyNow": false, "payoutRuntimeReadyNow": false, "realSendRuntimeReadyNow": false},
  {"assetId": "moon-cat-guard", "liveEffectLabel": "лунный кот-защитник", "intensityLabel": "Calm orbit", "soundCueLabel": "night bell cue", "soundCueLabelRu": "ночной колокольчик", "soundCueFile": "assets/stream/gifts/187b-sound-cues/moon-cat-guard-night-bell.wav", "soundCueDurationMs": 1880, "hapticLabel": "gentle tap", "hapticImpactStyle": "soft", "colorA": "#A6B7FF", "colorB": "#F2F7FF", "phases": ["moon halo opens behind cat", "cat blink appears on poster", "star dust orbits gently"], "visualFx": ["moon halo", "star dust", "guardian shimmer"], "reducedMotionFallback": "low-power: halo poster + single star shimmer", "localSoundAssetReady": true, "localHapticMetadataReady": true, "livePreviewRuntimeReadyNow": true, "soundPlaybackRuntimeEnabledNow": false, "backendRuntimeReadyNow": false, "paymentRuntimeReadyNow": false, "payoutRuntimeReadyNow": false, "realSendRuntimeReadyNow": false},
  {"assetId": "dj-star-drop", "liveEffectLabel": "beat-пульс DJ звезды", "intensityLabel": "Beat pulse", "soundCueLabel": "edm star hit", "soundCueLabelRu": "короткий EDM hit", "soundCueFile": "assets/stream/gifts/187b-sound-cues/dj-star-drop-edm-hit.wav", "soundCueDurationMs": 1280, "hapticLabel": "beat haptic", "hapticImpactStyle": "medium", "colorA": "#FFCC33", "colorB": "#FF4FD8", "phases": ["star drops from top", "equalizer rings pulse twice", "muted-safe sound badge flashes"], "visualFx": ["equalizer burst", "star drop", "rhythm flash"], "reducedMotionFallback": "sound-off: visual equalizer only, sound cue muted", "localSoundAssetReady": true, "localHapticMetadataReady": true, "livePreviewRuntimeReadyNow": true, "soundPlaybackRuntimeEnabledNow": false, "backendRuntimeReadyNow": false, "paymentRuntimeReadyNow": false, "payoutRuntimeReadyNow": false, "realSendRuntimeReadyNow": false},
  {"assetId": "golden-lion-roar", "liveEffectLabel": "золотая аура льва", "intensityLabel": "Royal impact", "soundCueLabel": "soft lion roar cue", "soundCueLabelRu": "мягкий roar cue", "soundCueFile": "assets/stream/gifts/187b-sound-cues/golden-lion-roar-soft-roar.wav", "soundCueDurationMs": 2050, "hapticLabel": "strong impact", "hapticImpactStyle": "strong", "colorA": "#FFD76B", "colorB": "#FF8F1F", "phases": ["lion crest rises from gold flare", "crown rays open outward", "soft roar aura fades into shine"], "visualFx": ["gold flare", "crown burst", "royal aura"], "reducedMotionFallback": "lite-device: crest poster + crown rays, no heavy flare", "localSoundAssetReady": true, "localHapticMetadataReady": true, "livePreviewRuntimeReadyNow": true, "soundPlaybackRuntimeEnabledNow": false, "backendRuntimeReadyNow": false, "paymentRuntimeReadyNow": false, "payoutRuntimeReadyNow": false, "realSendRuntimeReadyNow": false},
  {"assetId": "royal-rose-stage", "liveEffectLabel": "королевское раскрытие розы", "intensityLabel": "Velvet bloom", "soundCueLabel": "romantic sting", "soundCueLabelRu": "романтический sting", "soundCueFile": "assets/stream/gifts/187b-sound-cues/royal-rose-stage-romantic-sting.wav", "soundCueDurationMs": 2260, "hapticLabel": "elegant tap", "hapticImpactStyle": "light", "colorA": "#FF4F73", "colorB": "#F2C75B", "phases": ["rose petals open like stage curtain", "royal glow wraps recipient", "petal bloom fades with sparkle"], "visualFx": ["petal bloom", "velvet aura", "royal sparkle"], "reducedMotionFallback": "reduce-motion: rose poster + small crown glow", "localSoundAssetReady": true, "localHapticMetadataReady": true, "livePreviewRuntimeReadyNow": true, "soundPlaybackRuntimeEnabledNow": false, "backendRuntimeReadyNow": false, "paymentRuntimeReadyNow": false, "payoutRuntimeReadyNow": false, "realSendRuntimeReadyNow": false},
  {"assetId": "cosmic-dragon-gate", "liveEffectLabel": "космические ворота дракона", "intensityLabel": "Mythic finale", "soundCueLabel": "deep cosmic hit", "soundCueLabelRu": "глубокий cosmic hit", "soundCueFile": "assets/stream/gifts/187b-sound-cues/cosmic-dragon-gate-cosmic-hit.wav", "soundCueDurationMs": 2950, "hapticLabel": "finale impact", "hapticImpactStyle": "finale", "colorA": "#6B7CFF", "colorB": "#19F0C8", "phases": ["portal opens with comet sweep", "dragon silhouette crosses the gate", "finale burst closes into cosmic ring"], "visualFx": ["portal glow", "dragon trail", "comet finale"], "reducedMotionFallback": "low-power: portal poster + 1 comet trail, finale particles disabled", "localSoundAssetReady": true, "localHapticMetadataReady": true, "livePreviewRuntimeReadyNow": true, "soundPlaybackRuntimeEnabledNow": false, "backendRuntimeReadyNow": false, "paymentRuntimeReadyNow": false, "payoutRuntimeReadyNow": false, "realSendRuntimeReadyNow": false},
];

export const getStreamPremiumGiftEffectProfile187B = (assetId: string): StreamPremiumGiftEffectProfile187B => {
  return streamPremiumGiftEffects187B.find((profile) => profile.assetId === assetId) ?? streamPremiumGiftEffects187B[0];
};

export const streamPremiumGiftEffects187BSafety = {
  userFacingOnly: true,
  livePreviewMetadataReady: true,
  localSoundCueAssetsReady: true,
  localHapticMetadataReady: true,
  actualSoundPlaybackRuntimeEnabledNow: false,
  backendRuntimeReadyNow: false,
  paymentRuntimeReadyNow: false,
  payoutRuntimeReadyNow: false,
  cashOutReadyNow: false,
  randomWinRuntimeReadyNow: false,
  providerRuntimeReadyNow: false,
} as const;
