export type Stream109BRoomUiStateCleanupPlan = {
  readonly step: "109B";
  readonly title: "Room UI state cleanup + mode-specific room details";
  readonly scope: "stream_mobile_only";
  readonly touchesWallet: false;
  readonly touchesMessenger: false;
  readonly touchesCalls: false;
  readonly touchesServerFoundation: false;
  readonly touchesBackendFinance: false;
  readonly enablesPayments: false;
  readonly enablesGifts: false;
  readonly enablesMonetization: false;
  readonly fakeLiveAllowed: false;
  readonly fakeProviderAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftAllowed: false;
  readonly fakeLaunchCompleteAllowed: false;
  readonly realLocalActions: readonly string[];
  readonly providerReadyContracts: readonly string[];
};

export const STREAM_109B_ROOM_UI_STATE_CLEANUP_PLAN: Stream109BRoomUiStateCleanupPlan = {
  step: "109B",
  title: "Room UI state cleanup + mode-specific room details",
  scope: "stream_mobile_only",
  touchesWallet: false,
  touchesMessenger: false,
  touchesCalls: false,
  touchesServerFoundation: false,
  touchesBackendFinance: false,
  enablesPayments: false,
  enablesGifts: false,
  enablesMonetization: false,
  fakeLiveAllowed: false,
  fakeProviderAllowed: false,
  fakePaymentAllowed: false,
  fakeGiftAllowed: false,
  fakeLaunchCompleteAllowed: false,
  realLocalActions: [
    "apply mode-specific room UI details",
    "select visible room rail",
    "show primary next local action",
    "show per-mode source/layout/checklist rules",
    "show local blockers and provider blockers without fake success",
  ],
  providerReadyContracts: [
    "backend room contract",
    "realtime provider",
    "media provider",
    "Admin launch approval",
  ],
};
