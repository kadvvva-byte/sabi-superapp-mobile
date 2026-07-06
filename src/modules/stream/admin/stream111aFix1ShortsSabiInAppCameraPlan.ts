export const stream111aFix1ShortsSabiInAppCameraPlan = {
  version: "111A-FIX1",
  title: "Shorts Sabi in-app camera fix",
  scope: "mobile_stream_only",
  changes: [
    "Record video opens the in-app Sabi camera modal instead of the device/native camera app.",
    "Sabi camera uses expo-camera CameraView with local recordAsync/stopRecording.",
    "Recorded local URI is bound back into the Shorts source flow, preview, timeline, captions and overlays.",
    "Gallery upload and document video selection remain separate source actions.",
  ],
  safety: {
    walletTouched: false,
    messengerTouched: false,
    callsTouched: false,
    backendTouched: false,
    nativeExternalCameraLaunchAllowed: false,
    fakeUploadSuccess: false,
    fakePublishSuccess: false,
    providerSuccess: false,
  },
} as const;
