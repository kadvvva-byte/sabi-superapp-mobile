export type Stream108VParticipantManagementPlan = {
  readonly stage: "108V";
  readonly title: "Co-host invite depth and participant management";
  readonly scope: "stream_mobile_only";
  readonly implemented: readonly string[];
  readonly blockedUntilBackendProvider: readonly string[];
  readonly forbidden: readonly string[];
  readonly nextStage: "108W";
};

export const STREAM_108V_PARTICIPANT_MANAGEMENT_PLAN: Stream108VParticipantManagementPlan = {
  stage: "108V",
  title: "Co-host invite depth and participant management",
  scope: "stream_mobile_only",
  implemented: [
    "speaker seat runtime for host/co-host/speaker/moderator seats",
    "participant role actions for viewer/co-host/moderator local state",
    "local participant kick action with comments moved to moderation_blocked",
    "host handoff draft/accept/decline/cancel contract without fake host transfer",
    "participant management evidence snapshot for future backend/Admin union",
  ],
  blockedUntilBackendProvider: [
    "real host transfer",
    "realtime participant delivery",
    "server authoritative participant roster",
    "provider speaker-seat sync",
    "Admin host handoff approval",
  ],
  forbidden: [
    "fake participant join success from provider",
    "fake host transfer",
    "fake on-air",
    "fake provider",
    "fake payment",
    "fake gift",
    "Wallet/Messenger/Calls/backend finance changes",
  ],
  nextStage: "108W",
};
