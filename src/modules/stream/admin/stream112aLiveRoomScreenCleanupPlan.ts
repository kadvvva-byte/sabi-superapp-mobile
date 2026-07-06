export const stream112aLiveRoomScreenCleanupPlan = {
  version: "112A",
  title: "Live room screen cleanup / real local controls pass",
  scope: "mobile-stream-only",
  changedArea: "Stream live room viewer",
  rules: {
    noCinemaMixing: true,
    noWalletTouch: true,
    noMessengerTouch: true,
    noCallsTouch: true,
    noBackendTouch: true,
    noPaymentsTouch: true,
    noFakeProviderSuccess: true,
  },
  viewerLayout: {
    mainScreen: ["video canvas", "right action rail", "local chat composer"],
    movedInsideSettings: ["host controls", "health", "security", "commerce shelf", "translation", "clips", "playback options"],
    noClutter: true,
  },
  localActions: [
    "play/pause viewer state",
    "mute/unmute viewer state",
    "follow local toggle",
    "request to join local toggle",
    "local chat draft/send",
    "settings hub checks",
  ],
  providerBoundaries: {
    liveMediaProvider: "not_faked",
    realtimeChatProvider: "not_faked",
    commerceProvider: "not_faked",
    giftsProvider: "not_faked",
  },
} as const;

export type Stream112aLiveRoomScreenCleanupPlan = typeof stream112aLiveRoomScreenCleanupPlan;
