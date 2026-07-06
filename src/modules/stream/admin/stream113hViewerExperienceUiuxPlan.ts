export const STREAM_113H_VIEWER_EXPERIENCE_UIUX_PLAN = {
  version: "STREAM-113H",
  title: "Viewer experience UI/UX polish",
  scope: "Stream live room mobile UI only",
  goals: [
    "Make the viewer-side path feel like a premium product experience, not a QA/debug checklist.",
    "Polish visible viewer states for watch surface, bottom chat, audience rail, reactions, co-host/battle context, and safe share.",
    "Keep technical evidence hidden behind clean phone mode and preserve honest provider/realtime boundary."
  ],
  forbidden: [
    "fake live",
    "fake realtime",
    "fake provider",
    "fake payments",
    "cinema/series/anime mixing",
    "Wallet/Messenger/AI changes"
  ],
  mobileFiles: [
    "src/modules/stream/mobile/StreamRoomRuntimePanel.tsx",
    "src/modules/stream/mobile/stream113hViewerExperienceUiuxRuntime.ts"
  ],
  cumulativeFrom: ["112N", "113A", "113B", "113C", "113D", "113E", "113F", "113G"]
} as const;
