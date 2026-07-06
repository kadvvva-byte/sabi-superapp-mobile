export const stream113dLiveRoomPhoneUiCleanupPlan = {
  version: "STREAM-113D",
  title: "Live room clean phone UI/UX cleanup",
  scope: "mobile-stream-live-room-uiux-only",
  goals: [
    "make clean phone mode the default live room settings experience",
    "hide QA/evidence/status/smoke panels from the main UX unless opened manually",
    "keep 112N/113A/113B/113C checks available behind technical review",
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
