export const STREAM_108S_REAL_ROOM_RUNTIME_PLAN = {
  stage: "108S",
  title: "Real Stream Room Runtime + Room UI Foundation",
  scope: "stream_mobile_only",
  sourceOnly: true,
  touchedModules: ["src/modules/stream"],
  untouchedModules: ["Wallet", "Messenger", "Calls", "server", "foundation", "backend finance"],
  runtime: {
    localRoomLifecycle: true,
    localRoomCreateReady: true,
    localPreviewLifecycle: true,
    hostViewerCohostRoles: true,
    participantModeration: true,
    localComments: true,
    battleDraftInviteAcceptDecline: true,
    broadcastSourceState: true,
    evidenceSnapshot: true,
  },
  providerReadyContracts: {
    backendRoomContract: "not_connected_until_future_server_stage",
    realtimeProvider: "not_configured_until_future_provider_stage",
    mediaProvider: "not_configured_until_future_provider_stage",
    adminLaunchApproval: "required_before_on_air",
  },
  fakeSafety: {
    fakeOnAirAllowed: false,
    fakeProviderAllowed: false,
    fakePaymentAllowed: false,
    fakeLaunchCompleteAllowed: false,
    fakeViewerProviderDeliveryAllowed: false,
    fakeBattleWinnerAllowed: false,
  },
  monetizationPolicy: {
    paymentsTouched: false,
    walletTouched: false,
    giftsTouched: false,
    monetizationDeferredUntilCoreStreamBusinessShortsProfileDone: true,
  },
} as const;

export type Stream108sRealRoomRuntimePlan = typeof STREAM_108S_REAL_ROOM_RUNTIME_PLAN;
