export const stream111kShortsPreviewPlaybackPolishPlan = {
  stage: "111K",
  title: "Shorts preview/playback polish",
  scope: "mobile-stream-shorts-only",
  changedFiles: [
    "src/modules/stream/mobile/StreamShortVideoDraftPanel.tsx",
    "src/modules/stream/admin/stream111kShortsPreviewPlaybackPolishPlan.ts",
    "src/modules/stream/index.ts",
  ],
  userVisibleResult: [
    "Main Shorts screen stays clean with Settings / Like / Comments / Share / Save on the right rail.",
    "When a local recorded/uploaded video exists, the Shorts screen shows it as the preview surface instead of only inside Settings.",
    "Preview playback has local play/pause, restart, sound/mute and progress binding.",
  ],
  safety: {
    walletTouched: false,
    messengerTouched: false,
    callsTouched: false,
    backendTouched: false,
    paymentsTouched: false,
    giftsTouched: false,
    monetizationTouched: false,
    fakeUploadSuccess: false,
    fakePublishSuccess: false,
    fakeProviderSuccess: false,
    systemCameraUsedForRecord: false,
  },
} as const;
