export const stream110tFix1ShortsSettingsToolsHiddenPlan = {
  version: "110T-FIX1",
  title: "Shorts Settings tools hidden from viewer screen",
  scope: "mobile Stream/Shorts only",
  viewerScreen: {
    socialActionsStayVisible: ["Like", "Comments", "Share", "Save"],
    studioToolsHiddenUntilSettingsTab: ["Video", "Edit", "Text", "Overlays", "Effects", "MP3", "Review"],
  },
  safety: {
    fakePublishSuccess: false,
    fakeUploadSuccess: false,
    fakeRenderSuccess: false,
    backendTouched: false,
    walletTouched: false,
    messengerTouched: false,
    callsTouched: false,
  },
} as const;
