export const stream111aShortVideoRealMobileInteractionQaPlan = {
  version: "111A",
  title: "Shorts real mobile interaction QA",
  scope: "mobile-stream-shorts-only",
  goals: [
    "verify Settings / Like / Comments / Share / Save are visible on the Shorts viewer rail",
    "verify viewer actions change local state when tapped",
    "verify Record / Upload / MP3 / Effects remain inside Settings and change local editor state",
    "keep the main Shorts screen clean without debug cards or creation tools outside Settings"
  ],
  interactionChecks: {
    viewer: ["Settings", "Like", "Comments", "Share", "Save"],
    settings: ["Record video", "Upload video", "MP3 / Audio", "Effects"],
    hiddenFromMainScreen: ["Record", "Upload", "Edit", "Text", "Overlays", "Effects", "MP3"]
  },
  safety: {
    walletTouched: false,
    messengerTouched: false,
    callsTouched: false,
    backendTouched: false,
    serverTouched: false,
    paymentsTouched: false,
    giftsTouched: false,
    monetizationTouched: false,
    fakePublishSuccessAdded: false,
    fakeProviderSuccessAdded: false,
    fakeUploadSuccessAdded: false,
    fakeMp3SuccessAdded: false,
    decorativeStarsAllowed: false
  }
} as const;
