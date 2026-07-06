export const stream113nModerationActionsUiuxPlan = {
  version: "STREAM-113N",
  title: "Moderation actions UI/UX polish",
  scope: "Stream live room only",
  goals: [
    "Make report, warning, mute, remove preview, AI hold review and audit log feel like premium mobile moderation actions.",
    "Keep Sabi AI as admin/controller while preserving host override and honest provider/backend boundaries.",
    "Prevent fake permanent bans, fake legal approval, fake provider enforcement, fake realtime sanctions and fake payments.",
  ],
  notTouched: ["Wallet", "Messenger", "main AI module", "payments", "cinema", "series", "anime"],
  safety: {
    fakeLiveAllowed: false,
    fakeRealtimeAllowed: false,
    fakeProviderAllowed: false,
    fakePaymentsAllowed: false,
    fakePermanentBanAllowed: false,
    fakeLegalApprovalAllowed: false,
  },
} as const;
