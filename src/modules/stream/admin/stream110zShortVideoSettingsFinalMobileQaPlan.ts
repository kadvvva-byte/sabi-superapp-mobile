export const stream110zShortVideoSettingsFinalMobileQaPlan = {
  version: "110Z",
  title: "Shorts Settings final mobile visual QA",
  scope: "mobile-stream-shorts-only",
  screenRules: {
    mainShortsScreen: [
      "show video/preview area",
      "show right rail Settings / Like / Comments / Share / Save",
      "do not show Record/Upload/Edit/Text/Overlays/Effects/MP3 tools outside Settings",
      "do not show debug smoke/viewer cards on the main Shorts screen"
    ],
    settingsModal: [
      "use user-facing copy, not debug/provider/smoke wording in the default view",
      "keep production flow order Video → Edit → Text → Overlays → Effects → MP3 → Review",
      "keep extra tools behind More/Less controls",
      "keep publish unavailable until real backend/provider integration exists"
    ]
  },
  safety: {
    walletTouched: false,
    messengerTouched: false,
    callsTouched: false,
    backendTouched: false,
    fakePublishSuccessAdded: false,
    fakeProviderSuccessAdded: false,
    fakeUploadSuccessAdded: false,
    decorativeStarsAllowed: false
  }
} as const;
