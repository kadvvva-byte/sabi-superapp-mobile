export type Stream113GHostJourneyUiuxPlan = {
  readonly version: "STREAM-113G";
  readonly title: string;
  readonly scope: readonly string[];
  readonly checks: readonly string[];
  readonly forbidden: readonly string[];
  readonly next: string;
};

export const STREAM_113G_HOST_JOURNEY_UIUX_PLAN: Stream113GHostJourneyUiuxPlan = {
  version: "STREAM-113G",
  title: "Live room host journey UI/UX polish",
  scope: [
    "single premium host journey from prepare to summary",
    "clean product-first phone UI without QA/debug panels by default",
    "connected path across lifecycle, surface, action sheets, people/co-host, battle/share",
    "honest provider/realtime/payment boundary remains visible without fake success",
  ],
  checks: [
    "prepare room step is understandable before going live",
    "main live surface explains top status, video canvas, bottom chat and side actions",
    "quick actions are presented as premium bottom sheets",
    "people/co-host/battle/share are one coherent host path",
    "ending the room leads to summary and does not fake provider readiness",
  ],
  forbidden: [
    "fake live",
    "fake realtime",
    "fake provider",
    "fake payments",
    "cinema/series/anime mixing with Stream",
    "Wallet/Messenger/AI changes",
  ],
  next: "STREAM-113H viewer-side live room UI/UX polish",
};
