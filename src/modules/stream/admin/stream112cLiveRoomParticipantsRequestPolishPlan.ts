export const STREAM_112C_LIVE_ROOM_PARTICIPANTS_REQUEST_POLISH_PLAN = {
  stage: "112C",
  title: "Live room participants / request-to-join local polish",
  scope: "mobile_stream_only",
  changes: [
    "participants panel is now a local premium room state instead of locked tiles",
    "request-to-join has local pending/accepted/declined states",
    "side mic action and participants panel share the same local request state",
    "host/viewer participant rows show local speaking/muted state",
    "no fake realtime participants, fake invite delivery, or fake provider success",
  ],
  untouched: ["Wallet", "Messenger", "Calls", "backend", "payments", "cinema/watch"],
  providerPolicy: {
    realtimeProviderConfigured: false,
    fakeParticipantsAllowed: false,
    fakeJoinDeliveryAllowed: false,
  },
} as const;
