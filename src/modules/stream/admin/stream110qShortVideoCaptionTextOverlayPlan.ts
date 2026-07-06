export type Stream110qShortVideoCaptionTextOverlayPlan = {
  readonly stage: "110Q_SHORTS_CAPTION_TEXT_OVERLAY_PREMIUM_DEPTH";
  readonly scope: readonly string[];
  readonly localActions: readonly string[];
  readonly blockedUntilProvider: readonly string[];
  readonly untouchedModules: readonly string[];
  readonly fakeSuccessForbidden: true;
};

export const stream110qShortVideoCaptionTextOverlayPlan: Stream110qShortVideoCaptionTextOverlayPlan = {
  stage: "110Q_SHORTS_CAPTION_TEXT_OVERLAY_PREMIUM_DEPTH",
  scope: [
    "Shorts caption/text overlay local editor state",
    "caption text input binding",
    "overlay placement/style/timing controls",
    "timeline binding",
    "review binding",
    "provider-blocked render/export guard",
  ],
  localActions: [
    "add/remove/select overlay",
    "edit overlay text",
    "nudge X/Y placement",
    "cycle placement/font/color/backdrop/alignment",
    "shift caption start/end timing",
    "bind caption overlay to timeline text_overlay clip",
    "bind caption overlay to review caption checks",
    "queue caption local event",
  ],
  blockedUntilProvider: [
    "burned-in caption render",
    "caption export artifact",
    "storage/CDN upload",
    "backend editor contract persistence",
    "Admin publish approval",
    "public publish success",
  ],
  untouchedModules: ["Wallet", "Messenger", "Calls", "backend/server", "payments", "gifts", "monetization"],
  fakeSuccessForbidden: true,
};
