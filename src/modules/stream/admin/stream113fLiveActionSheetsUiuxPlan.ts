export type Stream113FLiveActionSheetsUiuxPlan = {
  readonly version: "STREAM-113F";
  readonly title: string;
  readonly scope: readonly string[];
  readonly checks: readonly string[];
  readonly forbidden: readonly string[];
  readonly next: string;
};

export const STREAM_113F_LIVE_ACTION_SHEETS_UIUX_PLAN: Stream113FLiveActionSheetsUiuxPlan = {
  version: "STREAM-113F",
  title: "Live room action sheets UI/UX polish",
  scope: [
    "premium bottom sheet layer for chat, people, co-host, battle, share",
    "one-hand dock path for main live actions",
    "clean phone mode remains default",
    "safe provider/realtime/payment boundary stays visible without fake success",
  ],
  checks: [
    "chat sheet opens as bottom live action",
    "people sheet opens audience rail without covering video canvas",
    "co-host sheet is presented as stage flow",
    "battle sheet opens without fake winner/provider",
    "share sheet uses native share and does not claim provider readiness",
    "technical panels stay hidden unless explicitly requested",
  ],
  forbidden: [
    "fake live",
    "fake realtime",
    "fake provider",
    "fake payments",
    "cinema/series/anime mixing with Stream",
    "Wallet/Messenger/AI changes",
  ],
  next: "STREAM-113G pre-live/on-air viewer UI/UX polish",
};
