export const stream111oShortsNoClutterViewerLayoutPlan = {
  stage: "111O",
  title: "Shorts no-clutter viewer layout guard",
  scope: "mobile-stream-only",
  rules: {
    mainViewerAllowed: ["video preview", "right-side Settings/Like/Comments/Share/Save rail", "minimal progress line"],
    toolsMustStayInsideSettings: ["record", "upload", "file picker", "trim", "crop", "cover", "text", "overlays", "effects", "mp3", "review", "publish gate"],
    forbiddenOnMainViewer: ["technical cards", "debug smoke", "record/upload controls", "preview dock", "developer status blocks", "publish/provider blocks"],
    systemCameraAllowed: false,
    fakeProviderSuccessAllowed: false,
    backendTouched: false,
    walletTouched: false,
    messengerTouched: false,
    callsTouched: false,
  },
  status: "viewer_clean_settings_only_guard_ready",
} as const;
