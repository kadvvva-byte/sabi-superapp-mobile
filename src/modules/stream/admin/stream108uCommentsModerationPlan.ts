export const stream108uCommentsModerationPlan = {
  version: "STREAM-108U",
  title: "Real comments and moderation depth for Stream live rooms",
  scope: "stream-only-mobile-source",
  walletTouched: false,
  messengerTouched: false,
  callsTouched: false,
  serverTouched: false,
  backendFinanceTouched: false,
  paymentsTouched: false,
  giftsTouched: false,
  monetizationTouched: false,
  fakeOnAirAllowed: false,
  fakeProviderAllowed: false,
  fakePaymentAllowed: false,
  fakeGiftAllowed: false,
  fakeAutoModerationAllowed: false,
  fakeBackendReportDeliveryAllowed: false,
  delivered: [
    "Added a typed local moderation runtime for Stream comments, report queue drafts, participant controls, and moderation evidence",
    "Added pinned comment, hide/restore comment, local report queue, review report, comments lock, and slow-mode controls inside the real room runtime UI",
    "Connected mute/unmute/block/unblock actions to local participant moderation evidence without provider/backend fake delivery",
    "Kept backend moderation queue as not_connected and Admin review as local_draft_only until real backend/Admin contracts are connected",
    "Kept payments, Wallet, gifts, monetization, server, foundation, Messenger, Calls, and backend finance untouched",
  ],
  nextRecommendedStep: "STREAM-108V: co-host invite depth and room participant management, including speaker seats, pending invites, host handoff, and blocked-state visibility; no payments/gifts/Wallet/server",
} as const;

export type Stream108uCommentsModerationPlan = typeof stream108uCommentsModerationPlan;
