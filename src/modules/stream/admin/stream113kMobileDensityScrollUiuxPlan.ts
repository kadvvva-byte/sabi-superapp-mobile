export type Stream113KMobileDensityScrollUiuxPlan = {
  readonly version: "STREAM-113K";
  readonly title: string;
  readonly scope: readonly string[];
  readonly forbidden: readonly string[];
  readonly doneDefinition: readonly string[];
};

export const stream113kMobileDensityScrollUiuxPlan: Stream113KMobileDensityScrollUiuxPlan = {
  version: "STREAM-113K",
  title: "Live room mobile density / scroll-order UI/UX cleanup",
  scope: [
    "tighten phone-first live settings density",
    "keep main Stream live settings clean and product-like",
    "fold QA/evidence/smoke panels behind an explicit technical review action",
    "preserve one-thumb flow for host and viewer actions",
  ],
  forbidden: [
    "fake live",
    "fake realtime",
    "fake provider",
    "fake payments",
    "Wallet/Messenger/AI changes",
    "cinema/series/anime mixing into Stream live room",
  ],
  doneDefinition: [
    "first screen has one clear live-room priority",
    "cards are compact enough for small phones",
    "scroll order starts from product UX and moves to details",
    "action buttons are grouped by user journey",
    "technical panels stay hidden by default",
  ],
};
