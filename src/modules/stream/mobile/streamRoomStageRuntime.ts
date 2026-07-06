import type { StreamLaunchMode } from "./streamActionRuntime";
import type { StreamBroadcastSource, StreamRoomRuntimeState } from "./streamRoomRuntime";

export type StreamRoomStageStatus =
  | "idle_local"
  | "lobby_local"
  | "prelive_check_local"
  | "room_ready_local"
  | "layout_preview_local"
  | "broadcast_handoff_blocked"
  | "ended_local";

export type StreamRoomLayoutState = "single" | "grid" | "stage" | "game_overlay" | "cinema" | "business_showcase";

export type StreamRoomStageActionStatus =
  | "stage_initialized"
  | "lobby_opened"
  | "prelive_check_updated"
  | "room_ready_local"
  | "layout_preview_updated"
  | "broadcast_handoff_blocked"
  | "stage_ended";

export type StreamRoomStageBlockerCode =
  | "stage_room_required"
  | "stage_title_required"
  | "stage_topic_required"
  | "stage_host_required"
  | "stage_broadcast_source_required"
  | "stage_camera_permission_required"
  | "stage_microphone_permission_required"
  | "stage_group_cohost_required"
  | "stage_audio_microphone_required"
  | "stage_game_source_provider_required"
  | "stage_video_source_provider_required"
  | "stage_business_admin_contract_required"
  | "stage_backend_room_contract_required"
  | "stage_realtime_provider_required"
  | "stage_media_provider_required"
  | "stage_admin_launch_approval_required";

export type StreamRoomStageIntegrationState = {
  readonly backendRoomContract: "not_connected" | "connected";
  readonly realtimeProvider: "not_configured" | "configured";
  readonly mediaProvider: "not_configured" | "configured";
  readonly adminLaunchApproval: "not_submitted" | "pending" | "approved" | "rejected";
  readonly businessAdminContract: "not_connected" | "connected";
  readonly gameCaptureProvider: "not_configured" | "configured";
  readonly videoStorageProvider: "not_configured" | "configured";
  readonly fakeOnAirAllowed: false;
  readonly fakeProviderAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftAllowed: false;
  readonly fakeLaunchCompleteAllowed: false;
};

export type StreamRoomStageRuntimeState = {
  readonly version: "STREAM-108X";
  readonly roomId: string;
  readonly mode: StreamLaunchMode;
  readonly status: StreamRoomStageStatus;
  readonly layout: StreamRoomLayoutState;
  readonly requestedSource: StreamBroadcastSource | null;
  readonly hostReady: boolean;
  readonly commentsVisible: boolean;
  readonly participantsVisible: boolean;
  readonly cohostRailVisible: boolean;
  readonly battleOverlayVisible: boolean;
  readonly moderationRailVisible: boolean;
  readonly providerHandoffRequested: boolean;
  readonly integration: StreamRoomStageIntegrationState;
  readonly actionLog: readonly StreamRoomStageActionLogEntry[];
};

export type StreamRoomStageActionLogEntry = {
  readonly id: string;
  readonly action: string;
  readonly status: StreamRoomStageActionStatus;
  readonly createdAt: string;
  readonly blockers: readonly StreamRoomStageBlockerCode[];
};

export type StreamRoomStageActionResult = {
  readonly status: StreamRoomStageActionStatus;
  readonly state: StreamRoomStageRuntimeState;
  readonly localBlockers: readonly StreamRoomStageBlockerCode[];
  readonly providerBlockers: readonly StreamRoomStageBlockerCode[];
  readonly canShowLocalStage: boolean;
  readonly providerHandoffAllowed: false;
};

export type StreamRoomStageEvidenceSnapshot = {
  readonly version: "STREAM-108X";
  readonly roomId: string;
  readonly mode: StreamLaunchMode;
  readonly status: StreamRoomStageStatus;
  readonly layout: StreamRoomLayoutState;
  readonly requestedSource: StreamBroadcastSource | null;
  readonly hostReady: boolean;
  readonly commentsVisible: boolean;
  readonly participantsVisible: boolean;
  readonly cohostRailVisible: boolean;
  readonly battleOverlayVisible: boolean;
  readonly moderationRailVisible: boolean;
  readonly providerHandoffRequested: boolean;
  readonly localBlockers: readonly StreamRoomStageBlockerCode[];
  readonly providerBlockers: readonly StreamRoomStageBlockerCode[];
  readonly backendRoomContract: StreamRoomStageIntegrationState["backendRoomContract"];
  readonly realtimeProvider: StreamRoomStageIntegrationState["realtimeProvider"];
  readonly mediaProvider: StreamRoomStageIntegrationState["mediaProvider"];
  readonly adminLaunchApproval: StreamRoomStageIntegrationState["adminLaunchApproval"];
  readonly businessAdminContract: StreamRoomStageIntegrationState["businessAdminContract"];
  readonly fakeOnAirAllowed: false;
  readonly fakeProviderAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftAllowed: false;
  readonly fakeLaunchCompleteAllowed: false;
  readonly readyForBackendUnion: boolean;
};

const MAX_STAGE_LOG = 40;

function nowIso(now?: Date | string | number): string {
  if (now instanceof Date) return now.toISOString();
  if (typeof now === "string") return new Date(now).toISOString();
  if (typeof now === "number") return new Date(now).toISOString();
  return new Date().toISOString();
}

function defaultLayout(mode: StreamLaunchMode): StreamRoomLayoutState {
  if (mode === "groupLive") return "grid";
  if (mode === "audioLive") return "stage";
  if (mode === "gameLive") return "game_overlay";
  if (mode === "cinemaLive") return "cinema";
  if (mode === "businessLive") return "business_showcase";
  return "single";
}

function defaultIntegration(): StreamRoomStageIntegrationState {
  return {
    backendRoomContract: "not_connected",
    realtimeProvider: "not_configured",
    mediaProvider: "not_configured",
    adminLaunchApproval: "not_submitted",
    businessAdminContract: "not_connected",
    gameCaptureProvider: "not_configured",
    videoStorageProvider: "not_configured",
    fakeOnAirAllowed: false,
    fakeProviderAllowed: false,
    fakePaymentAllowed: false,
    fakeGiftAllowed: false,
    fakeLaunchCompleteAllowed: false,
  };
}

function appendStageLog(
  state: StreamRoomStageRuntimeState,
  action: string,
  status: StreamRoomStageActionStatus,
  blockers: readonly StreamRoomStageBlockerCode[] = [],
  now?: Date | string | number,
): StreamRoomStageRuntimeState {
  const createdAt = nowIso(now);
  return {
    ...state,
    actionLog: [{ id: `${action}-${createdAt}`, action, status, createdAt, blockers }, ...state.actionLog].slice(0, MAX_STAGE_LOG),
  };
}

function hasHost(room: StreamRoomRuntimeState): boolean {
  return room.participants.some((participant) => participant.role === "host" && !participant.blocked);
}

function localBlockersFor(room: StreamRoomRuntimeState, state: StreamRoomStageRuntimeState): readonly StreamRoomStageBlockerCode[] {
  const blockers: StreamRoomStageBlockerCode[] = [];
  if (!room.roomId) blockers.push("stage_room_required");
  if (!room.title.trim()) blockers.push("stage_title_required");
  if (!room.topic.trim()) blockers.push("stage_topic_required");
  if (!hasHost(room)) blockers.push("stage_host_required");
  if (!state.requestedSource) blockers.push("stage_broadcast_source_required");
  if (state.requestedSource === "camera" && !room.broadcast.cameraEnabled) blockers.push("stage_camera_permission_required");
  if ((state.requestedSource === "microphone" || state.mode === "audioLive") && !room.broadcast.microphoneEnabled) blockers.push("stage_microphone_permission_required");
  if (state.mode === "groupLive" && room.participants.filter((participant) => participant.role === "cohost" && !participant.blocked).length < 1) blockers.push("stage_group_cohost_required");
  if (state.mode === "audioLive" && state.requestedSource !== "microphone") blockers.push("stage_audio_microphone_required");
  return Array.from(new Set(blockers));
}

function providerBlockersFor(state: StreamRoomStageRuntimeState): readonly StreamRoomStageBlockerCode[] {
  const blockers: StreamRoomStageBlockerCode[] = [];
  if (state.integration.backendRoomContract !== "connected") blockers.push("stage_backend_room_contract_required");
  if (state.integration.realtimeProvider !== "configured") blockers.push("stage_realtime_provider_required");
  if (state.integration.mediaProvider !== "configured") blockers.push("stage_media_provider_required");
  if (state.integration.adminLaunchApproval !== "approved") blockers.push("stage_admin_launch_approval_required");
  if (state.mode === "gameLive" && state.integration.gameCaptureProvider !== "configured") blockers.push("stage_game_source_provider_required");
  if (state.mode === "cinemaLive" && state.integration.videoStorageProvider !== "configured") blockers.push("stage_video_source_provider_required");
  if (state.mode === "businessLive" && state.integration.businessAdminContract !== "connected") blockers.push("stage_business_admin_contract_required");
  return Array.from(new Set(blockers));
}

export function createInitialStreamRoomStageRuntimeState(room: StreamRoomRuntimeState): StreamRoomStageRuntimeState {
  const initial: StreamRoomStageRuntimeState = {
    version: "STREAM-108X",
    roomId: room.roomId,
    mode: room.mode,
    status: "idle_local",
    layout: defaultLayout(room.mode),
    requestedSource: room.broadcast.source,
    hostReady: hasHost(room),
    commentsVisible: true,
    participantsVisible: true,
    cohostRailVisible: room.mode === "groupLive" || room.mode === "businessLive",
    battleOverlayVisible: false,
    moderationRailVisible: true,
    providerHandoffRequested: false,
    integration: defaultIntegration(),
    actionLog: [],
  };
  return appendStageLog(initial, "stage_initialized", "stage_initialized");
}

export function syncStreamRoomStageRuntimeState(state: StreamRoomStageRuntimeState, room: StreamRoomRuntimeState): StreamRoomStageRuntimeState {
  if (state.roomId === room.roomId && state.mode === room.mode && state.requestedSource === room.broadcast.source) {
    return { ...state, hostReady: hasHost(room) };
  }
  return appendStageLog({
    ...state,
    roomId: room.roomId,
    mode: room.mode,
    requestedSource: room.broadcast.source,
    layout: state.mode === room.mode ? state.layout : defaultLayout(room.mode),
    hostReady: hasHost(room),
    cohostRailVisible: room.mode === "groupLive" || room.mode === "businessLive",
    battleOverlayVisible: room.battle?.status === "accepted_local" ? state.battleOverlayVisible : false,
  }, "stage_synced_from_room", "stage_initialized");
}

export function openLocalRoomLobby(state: StreamRoomStageRuntimeState, room: StreamRoomRuntimeState, now?: Date | string | number): StreamRoomStageActionResult {
  const next = appendStageLog({ ...state, status: "lobby_local", providerHandoffRequested: false }, "stage_lobby_opened", "lobby_opened", [], now);
  return buildStreamRoomStageActionResult("lobby_opened", next, room);
}

export function runLocalPreliveStageCheck(state: StreamRoomStageRuntimeState, room: StreamRoomRuntimeState, now?: Date | string | number): StreamRoomStageActionResult {
  const blockers = localBlockersFor(room, state);
  const nextStatus: StreamRoomStageStatus = blockers.length === 0 ? "room_ready_local" : "prelive_check_local";
  const next = appendStageLog({ ...state, status: nextStatus, hostReady: hasHost(room) }, "stage_prelive_check", blockers.length === 0 ? "room_ready_local" : "prelive_check_updated", blockers, now);
  return buildStreamRoomStageActionResult(blockers.length === 0 ? "room_ready_local" : "prelive_check_updated", next, room);
}

export function selectLocalRoomLayout(state: StreamRoomStageRuntimeState, layout: StreamRoomLayoutState, now?: Date | string | number): StreamRoomStageRuntimeState {
  return appendStageLog({ ...state, layout, status: "layout_preview_local" }, "stage_layout_selected", "layout_preview_updated", [], now);
}

export function setLocalRoomStageRails(
  state: StreamRoomStageRuntimeState,
  patch: {
    readonly commentsVisible?: boolean;
    readonly participantsVisible?: boolean;
    readonly cohostRailVisible?: boolean;
    readonly battleOverlayVisible?: boolean;
    readonly moderationRailVisible?: boolean;
  },
  now?: Date | string | number,
): StreamRoomStageRuntimeState {
  return appendStageLog({
    ...state,
    commentsVisible: patch.commentsVisible ?? state.commentsVisible,
    participantsVisible: patch.participantsVisible ?? state.participantsVisible,
    cohostRailVisible: patch.cohostRailVisible ?? state.cohostRailVisible,
    battleOverlayVisible: patch.battleOverlayVisible ?? state.battleOverlayVisible,
    moderationRailVisible: patch.moderationRailVisible ?? state.moderationRailVisible,
    status: "layout_preview_local",
  }, "stage_rails_updated", "layout_preview_updated", [], now);
}

export function requestLocalRoomBroadcastHandoffBlocked(state: StreamRoomStageRuntimeState, room: StreamRoomRuntimeState, now?: Date | string | number): StreamRoomStageActionResult {
  const blockers = [...localBlockersFor(room, state), ...providerBlockersFor(state)] as const;
  const next = appendStageLog({ ...state, status: "broadcast_handoff_blocked", providerHandoffRequested: true }, "stage_provider_handoff_blocked", "broadcast_handoff_blocked", blockers, now);
  return buildStreamRoomStageActionResult("broadcast_handoff_blocked", next, room);
}

export function endLocalRoomStage(state: StreamRoomStageRuntimeState, now?: Date | string | number): StreamRoomStageRuntimeState {
  return appendStageLog({ ...state, status: "ended_local", providerHandoffRequested: false }, "stage_ended_local", "stage_ended", [], now);
}

export function buildStreamRoomStageActionResult(
  status: StreamRoomStageActionStatus,
  state: StreamRoomStageRuntimeState,
  room: StreamRoomRuntimeState,
): StreamRoomStageActionResult {
  const localBlockers = localBlockersFor(room, state);
  const providerBlockers = providerBlockersFor(state);
  return {
    status,
    state,
    localBlockers,
    providerBlockers,
    canShowLocalStage: localBlockers.length === 0,
    providerHandoffAllowed: false,
  };
}

export function buildStreamRoomStageEvidenceSnapshot(state: StreamRoomStageRuntimeState, room: StreamRoomRuntimeState): StreamRoomStageEvidenceSnapshot {
  const localBlockers = localBlockersFor(room, state);
  const providerBlockers = providerBlockersFor(state);
  return {
    version: "STREAM-108X",
    roomId: state.roomId,
    mode: state.mode,
    status: state.status,
    layout: state.layout,
    requestedSource: state.requestedSource,
    hostReady: state.hostReady,
    commentsVisible: state.commentsVisible,
    participantsVisible: state.participantsVisible,
    cohostRailVisible: state.cohostRailVisible,
    battleOverlayVisible: state.battleOverlayVisible,
    moderationRailVisible: state.moderationRailVisible,
    providerHandoffRequested: state.providerHandoffRequested,
    localBlockers,
    providerBlockers,
    backendRoomContract: state.integration.backendRoomContract,
    realtimeProvider: state.integration.realtimeProvider,
    mediaProvider: state.integration.mediaProvider,
    adminLaunchApproval: state.integration.adminLaunchApproval,
    businessAdminContract: state.integration.businessAdminContract,
    fakeOnAirAllowed: false,
    fakeProviderAllowed: false,
    fakePaymentAllowed: false,
    fakeGiftAllowed: false,
    fakeLaunchCompleteAllowed: false,
    readyForBackendUnion: localBlockers.length === 0 && providerBlockers.length === 0,
  };
}
