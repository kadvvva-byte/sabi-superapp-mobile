import type { StreamLaunchMode, StreamVisibility } from "./streamActionRuntime";

export type StreamRoomParticipantRole = "host" | "viewer" | "cohost" | "moderator";
export type StreamRoomLifecycleStatus =
  | "draft"
  | "local_room_ready"
  | "local_preview_active"
  | "provider_handoff_blocked"
  | "ended";
export type StreamBroadcastSource = "camera" | "microphone" | "screen_share" | "game_capture" | "video_file" | "external_rtmp";
export type StreamRoomCommentStatus = "local_only" | "moderation_blocked" | "provider_delivery_pending";
export type StreamBattleStatus = "none" | "draft" | "invite_ready" | "invite_blocked" | "accepted_local" | "declined_local";
export type StreamCohostInviteStatus = "draft" | "invite_ready" | "accepted_local" | "declined_local" | "provider_blocked";
export type StreamRoomModerationAction = "mute" | "unmute" | "block" | "unblock" | "report";

export type StreamRoomBlockerCode =
  | "room_title_required"
  | "room_topic_required"
  | "host_participant_required"
  | "broadcast_source_required"
  | "camera_permission_required"
  | "microphone_permission_required"
  | "screen_or_game_provider_required"
  | "video_file_provider_required"
  | "external_rtmp_provider_required"
  | "stream_provider_not_configured"
  | "backend_room_contract_not_connected"
  | "admin_launch_approval_required";

export type StreamRoomParticipant = {
  readonly id: string;
  readonly displayName: string;
  readonly role: StreamRoomParticipantRole;
  readonly joinedAt: string;
  readonly muted: boolean;
  readonly blocked: boolean;
  readonly localOnly: true;
};

export type StreamRoomComment = {
  readonly id: string;
  readonly participantId: string;
  readonly text: string;
  readonly status: StreamRoomCommentStatus;
  readonly createdAt: string;
  readonly localOnly: true;
  readonly deliveredToProvider: false;
};

export type StreamCohostInvite = {
  readonly id: string;
  readonly participantId: string;
  readonly displayName: string;
  readonly status: StreamCohostInviteStatus;
  readonly createdAt: string;
  readonly localOnly: true;
};

export type StreamBattleDraft = {
  readonly id: string;
  readonly opponentName: string;
  readonly topic: string;
  readonly status: StreamBattleStatus;
  readonly createdAt: string;
  readonly scoreHost: number;
  readonly scoreOpponent: number;
  readonly fakeWinnerAllowed: false;
  readonly localOnly: true;
};

export type StreamBroadcastSnapshot = {
  readonly source: StreamBroadcastSource | null;
  readonly cameraEnabled: boolean;
  readonly microphoneEnabled: boolean;
  readonly screenShareIntent: boolean;
  readonly gameCaptureIntent: boolean;
  readonly videoFileIntent: boolean;
  readonly externalRtmpIntent: boolean;
};

export type StreamRoomIntegrationSnapshot = {
  readonly backendRoomContract: "not_connected" | "connected";
  readonly realtimeProvider: "not_configured" | "configured";
  readonly mediaProvider: "not_configured" | "configured";
  readonly adminLaunchApproval: "not_submitted" | "pending" | "approved" | "rejected";
  readonly fakeOnAirAllowed: false;
  readonly fakeProviderAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeLaunchCompleteAllowed: false;
};

export type StreamRoomRuntimeState = {
  readonly roomId: string;
  readonly mode: StreamLaunchMode;
  readonly title: string;
  readonly topic: string;
  readonly visibility: StreamVisibility;
  readonly status: StreamRoomLifecycleStatus;
  readonly createdAt: string;
  readonly endedAt: string | null;
  readonly hostId: string;
  readonly participants: readonly StreamRoomParticipant[];
  readonly comments: readonly StreamRoomComment[];
  readonly cohostInvites: readonly StreamCohostInvite[];
  readonly battle: StreamBattleDraft | null;
  readonly broadcast: StreamBroadcastSnapshot;
  readonly integration: StreamRoomIntegrationSnapshot;
  readonly actionLog: readonly StreamRoomActionLogEntry[];
};

export type StreamRoomActionStatus =
  | "room_draft_updated"
  | "local_room_ready"
  | "local_preview_active"
  | "participant_joined"
  | "participant_updated"
  | "comment_added"
  | "comment_blocked"
  | "cohost_invite_updated"
  | "battle_updated"
  | "provider_handoff_blocked"
  | "room_ended";

export type StreamRoomActionLogEntry = {
  readonly id: string;
  readonly action: string;
  readonly status: StreamRoomActionStatus;
  readonly createdAt: string;
  readonly blockers: readonly StreamRoomBlockerCode[];
};

export type StreamRoomActionResult = {
  readonly status: StreamRoomActionStatus;
  readonly state: StreamRoomRuntimeState;
  readonly localBlockers: readonly StreamRoomBlockerCode[];
  readonly providerBlockers: readonly StreamRoomBlockerCode[];
  readonly canCreateLocalRoom: boolean;
  readonly canRequestProviderHandoff: false;
};

export type StreamRoomEvidenceSnapshot = {
  readonly version: "STREAM-108S";
  readonly roomId: string;
  readonly mode: StreamLaunchMode;
  readonly status: StreamRoomLifecycleStatus;
  readonly participants: number;
  readonly viewers: number;
  readonly cohosts: number;
  readonly comments: number;
  readonly cohostInvites: number;
  readonly battleStatus: StreamBattleStatus;
  readonly localBlockers: readonly StreamRoomBlockerCode[];
  readonly providerBlockers: readonly StreamRoomBlockerCode[];
  readonly fakeOnAirAllowed: false;
  readonly fakeProviderAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeLaunchCompleteAllowed: false;
  readonly readyForBackendUnion: boolean;
};

const MAX_COMMENTS = 80;
const MAX_LOG = 48;
const MAX_PARTICIPANTS = 64;
const DEFAULT_HOST_ID = "local-host";

function normalizeText(value: string | null | undefined): string {
  return String(value ?? "").trim().replace(/\s+/g, " ");
}

function nowIso(now?: Date | string | number): string {
  if (now instanceof Date) return now.toISOString();
  if (typeof now === "string") return new Date(now).toISOString();
  if (typeof now === "number") return new Date(now).toISOString();
  return new Date().toISOString();
}

function createId(prefix: string, now?: Date | string | number): string {
  const stamp = nowIso(now).replace(/[^0-9]/g, "").slice(0, 17);
  return `${prefix}-${stamp}`;
}

function appendLog(
  state: StreamRoomRuntimeState,
  action: string,
  status: StreamRoomActionStatus,
  blockers: readonly StreamRoomBlockerCode[] = [],
  now?: Date | string | number,
): StreamRoomRuntimeState {
  const createdAt = nowIso(now);
  return {
    ...state,
    actionLog: [{ id: `${action}-${createdAt}`, action, status, createdAt, blockers }, ...state.actionLog].slice(0, MAX_LOG),
  };
}

function defaultSourceForMode(mode: StreamLaunchMode): StreamBroadcastSource {
  if (mode === "audioLive") return "microphone";
  if (mode === "gameLive") return "game_capture";
  if (mode === "cinemaLive") return "video_file";
  return "camera";
}

function normalizeVisibility(mode: StreamLaunchMode, visibility?: StreamVisibility): StreamVisibility {
  if (mode === "businessLive") return "business_only";
  return visibility === "business_only" ? "public" : visibility ?? "public";
}

function hostParticipant(displayName: string, now?: Date | string | number): StreamRoomParticipant {
  return {
    id: DEFAULT_HOST_ID,
    displayName: normalizeText(displayName) || "Local host",
    role: "host",
    joinedAt: nowIso(now),
    muted: false,
    blocked: false,
    localOnly: true,
  };
}

export function createInitialStreamRoomRuntimeState(params: {
  readonly roomId?: string;
  readonly mode?: StreamLaunchMode;
  readonly title?: string;
  readonly topic?: string;
  readonly visibility?: StreamVisibility;
  readonly hostName?: string;
  readonly cameraGranted?: boolean;
  readonly microphoneGranted?: boolean;
  readonly now?: Date | string | number;
} = {}): StreamRoomRuntimeState {
  const mode = params.mode ?? "soloLive";
  const createdAt = nowIso(params.now);
  const source = defaultSourceForMode(mode);
  const broadcast: StreamBroadcastSnapshot = {
    source,
    cameraEnabled: source === "camera" && Boolean(params.cameraGranted),
    microphoneEnabled: Boolean(params.microphoneGranted),
    screenShareIntent: source === "screen_share",
    gameCaptureIntent: source === "game_capture",
    videoFileIntent: source === "video_file",
    externalRtmpIntent: source === "external_rtmp",
  };

  const state: StreamRoomRuntimeState = {
    roomId: params.roomId ?? createId("stream-local-room", params.now),
    mode,
    title: normalizeText(params.title),
    topic: normalizeText(params.topic),
    visibility: normalizeVisibility(mode, params.visibility),
    status: "draft",
    createdAt,
    endedAt: null,
    hostId: DEFAULT_HOST_ID,
    participants: [hostParticipant(params.hostName ?? "Local host", params.now)],
    comments: [],
    cohostInvites: [],
    battle: null,
    broadcast,
    integration: {
      backendRoomContract: "not_connected",
      realtimeProvider: "not_configured",
      mediaProvider: "not_configured",
      adminLaunchApproval: "not_submitted",
      fakeOnAirAllowed: false,
      fakeProviderAllowed: false,
      fakePaymentAllowed: false,
      fakeLaunchCompleteAllowed: false,
    },
    actionLog: [],
  };

  return appendLog(state, "room_runtime_initialized", "room_draft_updated", [], params.now);
}

export function patchStreamRoomDraft(
  state: StreamRoomRuntimeState,
  patch: {
    readonly mode?: StreamLaunchMode;
    readonly title?: string;
    readonly topic?: string;
    readonly visibility?: StreamVisibility;
    readonly hostName?: string;
    readonly cameraGranted?: boolean;
    readonly microphoneGranted?: boolean;
    readonly source?: StreamBroadcastSource;
  },
  now?: Date | string | number,
): StreamRoomActionResult {
  const mode = patch.mode ?? state.mode;
  const source = patch.source ?? (patch.mode && patch.mode !== state.mode ? defaultSourceForMode(mode) : state.broadcast.source);
  const participants = patch.hostName
    ? state.participants.map((item) => (item.id === state.hostId ? { ...item, displayName: normalizeText(patch.hostName) || item.displayName } : item))
    : state.participants;
  const next: StreamRoomRuntimeState = {
    ...state,
    mode,
    title: patch.title === undefined ? state.title : normalizeText(patch.title),
    topic: patch.topic === undefined ? state.topic : normalizeText(patch.topic),
    visibility: normalizeVisibility(mode, patch.visibility ?? state.visibility),
    participants,
    broadcast: {
      source,
      cameraEnabled: patch.cameraGranted ?? state.broadcast.cameraEnabled,
      microphoneEnabled: patch.microphoneGranted ?? state.broadcast.microphoneEnabled,
      screenShareIntent: source === "screen_share",
      gameCaptureIntent: source === "game_capture",
      videoFileIntent: source === "video_file",
      externalRtmpIntent: source === "external_rtmp",
    },
  };
  return buildResult("room_draft_updated", appendLog(next, "room_draft_updated", "room_draft_updated", [], now));
}

export function getStreamRoomLocalBlockers(state: StreamRoomRuntimeState): readonly StreamRoomBlockerCode[] {
  const blockers: StreamRoomBlockerCode[] = [];
  if (normalizeText(state.title).length < 3) blockers.push("room_title_required");
  if (normalizeText(state.topic).length < 2) blockers.push("room_topic_required");
  if (!state.participants.some((item) => item.role === "host" && !item.blocked)) blockers.push("host_participant_required");
  if (!state.broadcast.source) blockers.push("broadcast_source_required");
  if (state.broadcast.source === "camera" && !state.broadcast.cameraEnabled) blockers.push("camera_permission_required");
  if ((state.broadcast.source === "camera" || state.broadcast.source === "microphone") && !state.broadcast.microphoneEnabled) blockers.push("microphone_permission_required");
  return blockers;
}

export function getStreamRoomProviderBlockers(state: StreamRoomRuntimeState): readonly StreamRoomBlockerCode[] {
  const blockers: StreamRoomBlockerCode[] = [];
  if (state.integration.backendRoomContract !== "connected") blockers.push("backend_room_contract_not_connected");
  if (state.integration.realtimeProvider !== "configured" || state.integration.mediaProvider !== "configured") blockers.push("stream_provider_not_configured");
  if (state.integration.adminLaunchApproval !== "approved") blockers.push("admin_launch_approval_required");
  if (state.broadcast.source === "screen_share" || state.broadcast.source === "game_capture") blockers.push("screen_or_game_provider_required");
  if (state.broadcast.source === "video_file") blockers.push("video_file_provider_required");
  if (state.broadcast.source === "external_rtmp") blockers.push("external_rtmp_provider_required");
  return blockers;
}

function buildResult(status: StreamRoomActionStatus, state: StreamRoomRuntimeState): StreamRoomActionResult {
  const localBlockers = getStreamRoomLocalBlockers(state);
  const providerBlockers = getStreamRoomProviderBlockers(state);
  return {
    status,
    state,
    localBlockers,
    providerBlockers,
    canCreateLocalRoom: localBlockers.length === 0,
    canRequestProviderHandoff: false,
  };
}

export function createLocalStreamRoom(state: StreamRoomRuntimeState, now?: Date | string | number): StreamRoomActionResult {
  const localBlockers = getStreamRoomLocalBlockers(state);
  if (localBlockers.length > 0) {
    return buildResult("room_draft_updated", appendLog(state, "create_local_room_blocked", "room_draft_updated", localBlockers, now));
  }
  const next = appendLog({ ...state, status: "local_room_ready" }, "create_local_room", "local_room_ready", [], now);
  return buildResult("local_room_ready", next);
}

export function activateLocalStreamPreview(state: StreamRoomRuntimeState, now?: Date | string | number): StreamRoomActionResult {
  const localBlockers = getStreamRoomLocalBlockers(state);
  if (localBlockers.length > 0) {
    return buildResult("room_draft_updated", appendLog(state, "activate_local_preview_blocked", "room_draft_updated", localBlockers, now));
  }
  const next = appendLog({ ...state, status: "local_preview_active" }, "activate_local_preview", "local_preview_active", [], now);
  return buildResult("local_preview_active", next);
}

export function requestStreamRoomProviderHandoff(state: StreamRoomRuntimeState, now?: Date | string | number): StreamRoomActionResult {
  const blockers = [...getStreamRoomLocalBlockers(state), ...getStreamRoomProviderBlockers(state)];
  const next = appendLog({ ...state, status: "provider_handoff_blocked" }, "request_provider_handoff", "provider_handoff_blocked", blockers, now);
  return buildResult("provider_handoff_blocked", next);
}

export function joinLocalStreamRoom(
  state: StreamRoomRuntimeState,
  participant: { readonly displayName: string; readonly role?: Exclude<StreamRoomParticipantRole, "host">; readonly participantId?: string },
  now?: Date | string | number,
): StreamRoomActionResult {
  const displayName = normalizeText(participant.displayName);
  if (!displayName) {
    return buildResult("participant_updated", appendLog(state, "join_participant_blocked", "participant_updated", [], now));
  }
  const id = participant.participantId ?? createId("local-participant", now);
  const exists = state.participants.some((item) => item.id === id);
  const nextParticipant: StreamRoomParticipant = {
    id,
    displayName,
    role: participant.role ?? "viewer",
    joinedAt: nowIso(now),
    muted: false,
    blocked: false,
    localOnly: true,
  };
  const nextParticipants = exists
    ? state.participants.map((item) => (item.id === id ? { ...item, ...nextParticipant, joinedAt: item.joinedAt } : item))
    : [...state.participants, nextParticipant].slice(0, MAX_PARTICIPANTS);
  return buildResult("participant_joined", appendLog({ ...state, participants: nextParticipants }, "participant_joined", "participant_joined", [], now));
}

export function moderateLocalStreamParticipant(
  state: StreamRoomRuntimeState,
  participantId: string,
  action: StreamRoomModerationAction,
  now?: Date | string | number,
): StreamRoomActionResult {
  const participants = state.participants.map((item) => {
    if (item.id !== participantId || item.role === "host") return item;
    if (action === "mute") return { ...item, muted: true };
    if (action === "unmute") return { ...item, muted: false };
    if (action === "block") return { ...item, blocked: true, muted: true };
    if (action === "unblock") return { ...item, blocked: false };
    return item;
  });
  return buildResult("participant_updated", appendLog({ ...state, participants }, `participant_${action}`, "participant_updated", [], now));
}

export function addLocalStreamComment(
  state: StreamRoomRuntimeState,
  params: { readonly participantId?: string; readonly text: string },
  now?: Date | string | number,
): StreamRoomActionResult {
  const text = normalizeText(params.text).slice(0, 280);
  const participantId = params.participantId ?? state.hostId;
  const participant = state.participants.find((item) => item.id === participantId);
  if (!text || !participant || participant.blocked || participant.muted) {
    const blockedComment: StreamRoomComment = {
      id: createId("local-comment-blocked", now),
      participantId,
      text: text || "",
      status: "moderation_blocked",
      createdAt: nowIso(now),
      localOnly: true,
      deliveredToProvider: false,
    };
    return buildResult("comment_blocked", appendLog({ ...state, comments: [blockedComment, ...state.comments].slice(0, MAX_COMMENTS) }, "comment_blocked", "comment_blocked", [], now));
  }
  const comment: StreamRoomComment = {
    id: createId("local-comment", now),
    participantId,
    text,
    status: state.integration.realtimeProvider === "configured" ? "provider_delivery_pending" : "local_only",
    createdAt: nowIso(now),
    localOnly: true,
    deliveredToProvider: false,
  };
  return buildResult("comment_added", appendLog({ ...state, comments: [comment, ...state.comments].slice(0, MAX_COMMENTS) }, "comment_added", "comment_added", [], now));
}

export function createLocalCohostInvite(
  state: StreamRoomRuntimeState,
  params: { readonly participantId: string; readonly displayName: string },
  now?: Date | string | number,
): StreamRoomActionResult {
  const displayName = normalizeText(params.displayName);
  const invite: StreamCohostInvite = {
    id: createId("local-cohost", now),
    participantId: params.participantId,
    displayName,
    status: displayName ? "invite_ready" : "draft",
    createdAt: nowIso(now),
    localOnly: true,
  };
  return buildResult("cohost_invite_updated", appendLog({ ...state, cohostInvites: [invite, ...state.cohostInvites].slice(0, 24) }, "cohost_invite_created", "cohost_invite_updated", [], now));
}

export function answerLocalCohostInvite(
  state: StreamRoomRuntimeState,
  inviteId: string,
  answer: "accept" | "decline",
  now?: Date | string | number,
): StreamRoomActionResult {
  const invite = state.cohostInvites.find((item) => item.id === inviteId);
  if (!invite) {
    return buildResult("cohost_invite_updated", appendLog(state, "cohost_invite_missing", "cohost_invite_updated", [], now));
  }
  const cohostStatus: StreamCohostInviteStatus = answer === "accept" ? "accepted_local" : "declined_local";
  const cohostInvites = state.cohostInvites.map((item) => (item.id === inviteId ? { ...item, status: cohostStatus } : item));
  const participants = answer === "accept"
    ? state.participants.map((item) => (item.id === invite.participantId ? { ...item, role: "cohost" as const } : item))
    : state.participants;
  return buildResult("cohost_invite_updated", appendLog({ ...state, cohostInvites, participants }, `cohost_invite_${answer}`, "cohost_invite_updated", [], now));
}

export function createLocalBattleDraft(
  state: StreamRoomRuntimeState,
  params: { readonly opponentName: string; readonly topic: string },
  now?: Date | string | number,
): StreamRoomActionResult {
  const opponentName = normalizeText(params.opponentName);
  const topic = normalizeText(params.topic);
  const battle: StreamBattleDraft = {
    id: createId("local-battle", now),
    opponentName,
    topic,
    status: opponentName && topic ? "invite_ready" : "draft",
    createdAt: nowIso(now),
    scoreHost: 0,
    scoreOpponent: 0,
    fakeWinnerAllowed: false,
    localOnly: true,
  };
  return buildResult("battle_updated", appendLog({ ...state, battle }, "battle_draft_updated", "battle_updated", [], now));
}

export function answerLocalBattleDraft(
  state: StreamRoomRuntimeState,
  answer: "accept" | "decline",
  now?: Date | string | number,
): StreamRoomActionResult {
  if (!state.battle) {
    return buildResult("battle_updated", appendLog(state, "battle_missing", "battle_updated", [], now));
  }
  const battle: StreamBattleDraft = { ...state.battle, status: answer === "accept" ? "accepted_local" : "declined_local" };
  return buildResult("battle_updated", appendLog({ ...state, battle }, `battle_${answer}`, "battle_updated", [], now));
}

export function endLocalStreamRoom(state: StreamRoomRuntimeState, now?: Date | string | number): StreamRoomActionResult {
  const next = appendLog({ ...state, status: "ended", endedAt: nowIso(now) }, "end_local_room", "room_ended", [], now);
  return buildResult("room_ended", next);
}

export function buildStreamRoomEvidenceSnapshot(state: StreamRoomRuntimeState): StreamRoomEvidenceSnapshot {
  const localBlockers = getStreamRoomLocalBlockers(state);
  const providerBlockers = getStreamRoomProviderBlockers(state);
  const viewers = state.participants.filter((item) => item.role === "viewer" && !item.blocked).length;
  const cohosts = state.participants.filter((item) => item.role === "cohost" && !item.blocked).length;
  return {
    version: "STREAM-108S",
    roomId: state.roomId,
    mode: state.mode,
    status: state.status,
    participants: state.participants.length,
    viewers,
    cohosts,
    comments: state.comments.length,
    cohostInvites: state.cohostInvites.length,
    battleStatus: state.battle?.status ?? "none",
    localBlockers,
    providerBlockers,
    fakeOnAirAllowed: false,
    fakeProviderAllowed: false,
    fakePaymentAllowed: false,
    fakeLaunchCompleteAllowed: false,
    readyForBackendUnion: true,
  };
}
