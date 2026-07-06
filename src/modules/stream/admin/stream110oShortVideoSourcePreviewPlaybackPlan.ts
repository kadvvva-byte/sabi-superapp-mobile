export const stream110oShortVideoSourcePreviewPlaybackPlan = {
  version: "110O",
  scope: "Shorts source preview + local playback binding",
  mobileOnly: true,
  changedAreas: [
    "src/modules/stream/mobile/StreamShortVideoDraftPanel.tsx",
    "src/modules/stream/mobile/streamShortVideoSourcePreviewPlaybackRuntime.ts",
  ],
  localPreviewFlow: {
    source: "selected record/upload local uri from 110N",
    previewEngine: "expo-av Video local preview",
    playbackControls: ["play", "pause", "restart", "mute", "loop", "speed", "status sync"],
    localStateBound: true,
    timelineProgressBound: true,
  },
  lockedUntilProviderIntegration: [
    "media storage provider",
    "CDN provider",
    "playback manifest provider",
    "backend asset contract",
    "Admin media review",
    "publish handoff",
  ],
  forbidden: {
    fakeVideoPreview: false,
    fakePlaybackSuccess: false,
    fakeUploadSuccess: false,
    fakePublishSuccess: false,
    walletTouched: false,
    messengerTouched: false,
    callsTouched: false,
    backendTouched: false,
    paymentsTouched: false,
    giftsTouched: false,
    monetizationTouched: false,
  },
} as const;

export type Stream110oShortVideoSourcePreviewPlaybackPlan = typeof stream110oShortVideoSourcePreviewPlaybackPlan;
