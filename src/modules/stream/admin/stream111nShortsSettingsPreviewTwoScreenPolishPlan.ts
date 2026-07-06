export const stream111nShortsSettingsPreviewTwoScreenPolishPlan = {
  version: "111N",
  title: "Shorts Settings / Preview two-screen polish",
  scope: "mobile_stream_shorts_only",
  viewerScreen: {
    keepsMainSurfaceClean: true,
    visibleActions: ["Settings", "Like", "Comments", "Share", "Save"],
    selectedVideoPreviewStaysBehindActions: true,
    emptyStateOpensSettingsVideoStep: true,
  },
  settingsScreen: {
    opensAsSeparatePremiumEditorSurface: true,
    raisedAboveViewerPreview: true,
    scrollableTools: true,
    orderedTabs: ["Video", "Edit", "Text", "Overlays", "Effects", "MP3", "Review"],
  },
  safety: {
    walletTouched: false,
    messengerTouched: false,
    callsTouched: false,
    backendTouched: false,
    fakeUploadSuccess: false,
    fakePublishSuccess: false,
    fakeProviderSuccess: false,
    systemCameraLaunchAllowed: false,
  },
} as const;
