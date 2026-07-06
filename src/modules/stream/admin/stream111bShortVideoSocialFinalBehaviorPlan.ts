export const stream111bShortVideoSocialFinalBehaviorPlan = {
  version: "111B",
  title: "Shorts comments, share and save final behavior polish",
  scope: "mobile_stream_shorts_only",
  mainScreen: {
    cleanViewerActions: ["settings", "like", "comments", "share", "save"],
    creatorToolsInsideSettings: true,
    debugBlocksOnViewer: false,
  },
  socialBehavior: {
    likeBoundToLocalState: true,
    commentsModalUserFacing: true,
    commentSendBoundToLocalState: true,
    shareUsesNativeShareIntent: true,
    saveBoundToLocalState: true,
    finalBehaviorEvidenceVisibleInReview: true,
  },
  blockedUntilProvider: [
    "backend comment sync",
    "realtime comment delivery",
    "provider engagement counters",
    "external share analytics",
    "cross-device saved library sync",
    "moderation/Admin queue",
  ],
  untouched: ["wallet", "messenger", "calls", "backend", "payments", "gifts", "monetization"],
  fakeSuccessAllowed: false,
} as const;
