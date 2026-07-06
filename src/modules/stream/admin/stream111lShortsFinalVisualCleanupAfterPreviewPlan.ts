export const stream111lShortsFinalVisualCleanupAfterPreviewPlan = {
  step: "111L",
  title: "Shorts final visual cleanup after preview",
  scope: "mobile-stream-shorts-only",
  changes: [
    "Keep the main Shorts viewer clean after local preview/playback is enabled",
    "Show play hint only when preview is paused",
    "Collapse playback controls while video is playing",
    "Move the social rail to a stable right-side position so it does not collide with preview controls",
    "Add a small clean Add video card when no local source is selected"
  ],
  safety: {
    touchesWallet: false,
    touchesMessenger: false,
    touchesCalls: false,
    touchesBackend: false,
    fakeUploadSuccess: false,
    fakePublishSuccess: false,
    fakeProviderSuccess: false
  }
} as const;
