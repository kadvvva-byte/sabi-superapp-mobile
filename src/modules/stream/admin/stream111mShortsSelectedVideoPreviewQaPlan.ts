export const stream111mShortsSelectedVideoPreviewQaPlan = {
  id: "STREAM-111M-SHORTS-SELECTED-VIDEO-PREVIEW-QA",
  title: "Shorts selected video preview QA",
  scope: "mobile-stream-shorts-only",
  status: "implemented_local_preview_qa",
  goals: [
    "verify selected or recorded video appears on the Shorts viewer surface",
    "verify Settings opens above the preview without exposing editor tools on the main screen",
    "verify Settings / Like / Comments / Share / Save remain visible as viewer actions",
    "verify Sabi in-app camera is the only record path and system camera launch stays blocked",
  ],
  safety: {
    walletTouched: false,
    messengerTouched: false,
    callsTouched: false,
    backendTouched: false,
    paymentsTouched: false,
    monetizationTouched: false,
    fakeUploadSuccessAllowed: false,
    fakePublishSuccessAllowed: false,
    fakeProviderSuccessAllowed: false,
  },
} as const;
