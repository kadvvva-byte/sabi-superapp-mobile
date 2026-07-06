export const STREAM_109Y_SHORT_VIDEO_SOURCE_INTENT_PLAN = {
  stage: "109Y",
  title: "Short Video Capture / Upload Source Intent Depth",
  scope: "stream-mobile-source-only",
  status: "locked_local_source_intent_ready",
  touchedModules: ["src/modules/stream"],
  untouchedModules: ["Wallet", "Messenger", "Calls", "server", "foundation", "backend finance"],
  implemented: [
    "camera capture source intent runtime",
    "library upload source intent runtime",
    "editor workspace source intent runtime",
    "cover picker source intent runtime",
    "caption track source intent runtime",
    "permission request local state",
    "asset intent local state",
    "source policy local acknowledgement",
    "source event local queue",
    "storage/CDN/backend/Admin provider blockers",
  ],
  blockedUntilRealIntegration: [
    "media storage provider",
    "CDN provider",
    "backend shorts asset contract",
    "Admin media review",
  ],
  forbidden: {
    fakeCameraCapture: true,
    fakeUploadSuccess: true,
    fakeProviderAsset: true,
    fakePublish: true,
    payments: true,
    gifts: true,
    walletBridge: true,
    monetization: true,
  },
} as const;

export type Stream109YShortVideoSourceIntentPlan = typeof STREAM_109Y_SHORT_VIDEO_SOURCE_INTENT_PLAN;
