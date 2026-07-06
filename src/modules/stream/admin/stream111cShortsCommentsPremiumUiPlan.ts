export const stream111cShortsCommentsPremiumUiPlan = {
  id: "STREAM-111C-SHORTS-COMMENTS-PREMIUM-UI",
  title: "Shorts comments premium UI pass",
  status: "mobile_local_ready",
  scope: "Shorts comments modal visual polish only",
  guarantees: [
    "main Shorts viewer remains clean: video plus Settings, Like, Comments, Share, Save",
    "comments modal uses premium mobile layout with header, count badge, summary pills, clean rows, and composer",
    "send comment still writes to local comments state and updates the viewer counter",
    "comment like, reply, pin, report, hide remain local actions",
    "no fake realtime delivery, no fake backend sync, no fake publish success",
    "Sabi in-app camera remains the record flow; native phone camera is not called",
  ],
  untouched: [
    "Wallet",
    "Messenger",
    "Calls",
    "backend/server",
    "payments",
    "gifts",
    "monetization",
  ],
} as const;
