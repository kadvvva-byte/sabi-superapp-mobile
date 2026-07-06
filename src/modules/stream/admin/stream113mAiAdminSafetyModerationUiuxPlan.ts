export type Stream113MAiAdminSafetyModerationUiuxPlan = {
  readonly version: "STREAM-113M";
  readonly title: string;
  readonly scope: readonly string[];
  readonly forbidden: readonly string[];
  readonly doneDefinition: readonly string[];
};

export const stream113mAiAdminSafetyModerationUiuxPlan: Stream113MAiAdminSafetyModerationUiuxPlan = {
  version: "STREAM-113M",
  title: "AI admin / 18+ / profanity and insult moderation UI/UX",
  scope: [
    "show Sabi AI as an admin/controller safety layer for live room UI",
    "make 18+ gate, profanity guard and insult guard visible as premium product controls",
    "route unsafe chat/participant signals into a review queue without fake permanent bans",
    "keep host override and safe boundary clear for provider/backend handoff",
  ],
  forbidden: [
    "fake automatic bans",
    "fake legal/compliance approval",
    "fake provider moderation",
    "fake live/realtime/provider/payments",
    "Wallet/Messenger/AI module changes outside Stream UI",
    "cinema/series/anime mixing into Stream live room",
  ],
  doneDefinition: [
    "18+ gate is visible as a clear age safety checkpoint",
    "profanity and insult controls are readable as moderation UI, not debug text",
    "AI admin queue shows review/hold/mute/escalate decisions safely",
    "host can see what AI would control and what still requires backend/provider",
    "safe boundary stays honest: no fake auto-ban, no fake provider, no fake payments",
  ],
};
