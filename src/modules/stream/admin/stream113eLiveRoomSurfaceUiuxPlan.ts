export const stream113eLiveRoomSurfaceUiuxPlan = {
  version: "STREAM-113E",
  title: "Live room main surface UI/UX polish",
  scope: "mobile-stream-live-room-uiux-only",
  goals: [
    "make the main live room surface feel like a premium product screen, not a QA/debug sheet",
    "polish top live status, video canvas, side actions, bottom chat and audience rail",
    "keep technical panels hidden behind the 113D review switch",
    "preserve honest provider/realtime/payment blockers without fake live",
  ],
  forbidden: [
    "wallet-change",
    "messenger-change",
    "ai-change",
    "cinema-series-anime-mixing",
    "fake-live",
    "fake-realtime",
    "fake-provider",
    "fake-payments",
  ],
} as const;
