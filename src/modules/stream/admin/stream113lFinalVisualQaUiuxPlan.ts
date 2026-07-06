export type Stream113LFinalVisualQaUiuxPlan = {
  readonly version: "STREAM-113L";
  readonly title: string;
  readonly scope: readonly string[];
  readonly forbidden: readonly string[];
  readonly doneDefinition: readonly string[];
};

export const stream113lFinalVisualQaUiuxPlan: Stream113LFinalVisualQaUiuxPlan = {
  version: "STREAM-113L",
  title: "Live room final visual QA / premium phone UI cleanup",
  scope: [
    "lock final phone visual hierarchy for live room settings",
    "verify premium block order and compact phone readability",
    "keep QA/evidence/smoke panels folded outside the main user path",
    "make buttons and copy feel like product UX, not debug output",
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
    "main live settings opens with a clean product hero",
    "phone mock and primary actions are visible before technical panels",
    "tap targets and chips do not visually overlap on a small phone",
    "copy avoids QA/debug language on the main path",
    "safe provider boundary remains honest and visible",
  ],
};
