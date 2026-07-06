export const stream110tFix2ShortsSettingsButtonVisiblePlan = {
  version: "110T-FIX2",
  scope: "shorts_settings_button_visible_and_tools_gated",
  changedArea: "src/modules/stream/mobile/StreamShortVideoDraftPanel.tsx",
  guarantees: {
    viewerSettingsButtonVisible: true,
    viewerSocialActionsStayOutsideSettings: true,
    toolsOpenOnlyAfterSettingsTab: true,
    noFakeRenderSuccess: true,
    noFakeUploadSuccess: true,
    noFakePublishSuccess: true,
    walletMessengerCallsBackendUntouched: true,
  },
  viewerRailOrder: ["Settings", "Like", "Comments", "Share", "Save"],
  settingsTabs: ["Video", "Edit", "Text", "Overlays", "Effects", "MP3", "Review"],
} as const;
