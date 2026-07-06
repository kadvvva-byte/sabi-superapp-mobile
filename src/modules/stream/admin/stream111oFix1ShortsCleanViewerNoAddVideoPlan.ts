export const STREAM_111O_FIX1_SHORTS_CLEAN_VIEWER_NO_ADD_VIDEO_PLAN = {
  version: "111O-FIX1",
  scope: "mobile_stream_shorts_viewer_only",
  summary: "Keep the Shorts viewer clean: no Add video card, no visible English labels on the viewer rail, all creator tools stay inside Settings.",
  changed: {
    emptyViewerCardVisible: false,
    viewerAddVideoTextVisible: false,
    viewerSocialLabelsVisible: false,
    viewerSocialActionsStillAvailable: ["settings", "like", "comments", "share", "save"],
    toolsInsideSettings: ["video", "edit", "text", "overlays", "effects", "mp3", "review"],
  },
  untouched: {
    wallet: true,
    messenger: true,
    calls: true,
    backend: true,
    payments: true,
    gifts: true,
    monetization: true,
  },
  safety: {
    fakeUploadSuccess: false,
    fakePublishSuccess: false,
    fakeProviderSuccess: false,
    systemCameraLaunchAllowed: false,
    recordUsesSabiInAppCamera: true,
  },
} as const;
