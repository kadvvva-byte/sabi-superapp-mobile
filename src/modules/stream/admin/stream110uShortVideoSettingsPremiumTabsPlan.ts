export const stream110uShortVideoSettingsPremiumTabsPlan = {
  stage: "110U",
  title: "Shorts Settings Premium Tabs Visual Clean",
  scope: "mobile_stream_shorts_only",
  changedRuntime: false,
  changedVisualLayout: true,
  mainShortsScreenClean: true,
  settingsButtonVisibleOnViewerRail: true,
  toolsInsideSettingsOnly: true,
  tabs: ["Video", "Edit", "Text", "Overlays", "Effects", "MP3", "Review"],
  hiddenFromMainViewer: ["Record", "Upload", "Preview", "Trim", "Text overlay", "Useful overlays", "Effects", "MP3", "Smoke", "debug cards"],
  viewerActionsRemainOutsideSettings: ["Like", "Comments", "Share", "Save"],
  forbidden: ["wallet_touch", "messenger_touch", "calls_touch", "backend_touch", "payments", "gifts", "monetization", "fake_publish", "fake_upload", "fake_render_success", "decorative_only_ui"],
} as const;
