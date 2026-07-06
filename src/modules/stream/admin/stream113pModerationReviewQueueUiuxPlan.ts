export const STREAM_113P_MODERATION_REVIEW_QUEUE_UIUX_PLAN = {
  version: "STREAM-113P",
  title: "Moderation review queue / appeals / evidence UI/UX polish",
  scope: "Stream live-room UI/UX only",
  goals: [
    "Make report intake, evidence preview and AI review queue clear for the host.",
    "Show host decision, moderator notes and appeal path without fake backend enforcement.",
    "Keep Sabi AI as a controller/reviewer, not as fake judge or fake permanent-ban executor.",
    "Preserve clean phone mode and keep technical/debug panels folded by default.",
  ],
  safeBoundaries: {
    walletTouched: false,
    messengerTouched: false,
    coreAiTouched: false,
    fakeLiveAllowed: false,
    fakeRealtimeAllowed: false,
    fakeProviderAllowed: false,
    fakePaymentsAllowed: false,
    fakeAutoBanAllowed: false,
    fakePermanentSanctionAllowed: false,
    fakeLegalAgeProofAllowed: false,
    cinemaOrAnimeMixedIntoStream: false,
  },
} as const;
