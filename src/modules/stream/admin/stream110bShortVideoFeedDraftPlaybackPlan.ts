export const stream110bShortVideoFeedDraftPlaybackPlan = {
  version: "STREAM-110B",
  title: "Short video feed/draft list readiness + local playback shell",
  scope: "Stream-only Shorts feed draft list and local playback shell. No Wallet, payments, gifts, monetization, server, foundation, or provider calls.",
  streamOnly: true,
  touchedModules: ["src/modules/stream"],
  walletTouched: false,
  messengerTouched: false,
  callsTouched: false,
  serverTouched: false,
  backendFinanceTouched: false,
  paymentsTouched: false,
  giftsTouched: false,
  monetizationTouched: false,
  fakeFeedPublishAllowed: false,
  fakePlaybackAllowed: false,
  fakeProviderSuccessAllowed: false,
  localRuntime: [
    "sync current Shorts draft into a local feed draft list",
    "select previous/next local feed draft without backend/provider calls",
    "request local playback shell only when local draft blockers are clear",
    "pause/stop local playback shell without pretending real CDN playback",
    "queue local feed draft events for future backend/provider handoff",
    "keep storage/CDN/feed backend/Admin review blockers visible",
  ],
  providerBlockers: [
    "backendShortsFeedContract:not_connected",
    "playbackManifestProvider:not_configured",
    "cdnProvider:not_configured",
    "adminShortsFeedReview:not_connected",
  ],
} as const;

export type Stream110bShortVideoFeedDraftPlaybackPlan = typeof stream110bShortVideoFeedDraftPlaybackPlan;
