import type { StreamRoomRuntimeState } from "./streamRoomRuntime";
import type { StreamRoomStageRuntimeState } from "./streamRoomStageRuntime";
import type { StreamRoomJoinLeaveRuntimeState } from "./streamRoomJoinLeaveRuntime";
import type { StreamViewerSessionReconnectRuntimeState } from "./streamViewerSessionReconnectRuntime";
import {
  enqueueLocalStreamRoomEvent,
  type StreamRoomEventQueueRuntimeState,
} from "./streamRoomEventQueueRuntime";

export type StreamRoomRecoveryStatus =
  | "stable_local"
  | "recovery_required_local"
  | "host_reconnect_required_local"
  | "viewer_reconnect_required_local"
  | "ending_local"
  | "ended_consistent_local"
  | "provider_recovery_blocked";

export type StreamRoomRecoveryCheckpointId =
  | "room_snapshot"
  | "host_session"
  | "viewer_sessions"
  | "presence_events"
  | "event_queue"
  | "stage_consistency"
  | "room_end_consistency"
  | "provider_recovery";

export type StreamRoomRecoveryCheckpointStatus =
  | "pending_local"
  | "verified_local"
  | "needs_action_local"
  | "blocked_provider_required";

export type StreamRoomRecoveryBlockerCode =
  | "recovery_room_required"
  | "recovery_host_session_required"
  | "recovery_viewer_session_required"
  | "recovery_presence_event_required"
  | "recovery_event_queue_required"
  | "recovery_stage_end_required"
  | "recovery_room_end_required"
  | "recovery_reconnect_sequence_required"
  | "recovery_backend_contract_required"
  | "recovery_realtime_provider_required"
  | "recovery_durable_store_required"
  | "recovery_admin_audit_required"
  | "recovery_fake_recovery_forbidden";

export type StreamRoomRecoveryCheckpoint = {
  readonly id: StreamRoomRecoveryCheckpointId;
  readonly label: string;
  readonly status: StreamRoomRecoveryCheckpointStatus;
  readonly blockers: readonly StreamRoomRecoveryBlockerCode[];
  readonly eventQueuedLocal: boolean;
  readonly verifiedAt: string | null;
  readonly localOnly: true;
};

export type StreamRoomRecoveryRuntimeState = {
  readonly version: "STREAM-109I";
  readonly roomId: string;
  readonly checkedAt: string;
  readonly status: StreamRoomRecoveryStatus;
  readonly selectedCheckpointId: StreamRoomRecoveryCheckpointId;
  readonly hostReconnectRequestedLocal: boolean;
  readonly viewerReconnectRequestedLocal: boolean;
  readonly endingRequestedLocal: boolean;
  readonly endStateConfirmedLocal: boolean;
  readonly providerRecoveryRequestedLocal: boolean;
  readonly recoveryEventsQueuedLocal: boolean;
  readonly checkpoints: readonly StreamRoomRecoveryCheckpoint[];
  readonly integration: {
    readonly backendRecoveryContract: "not_connected" | "connected";
    readonly realtimeRecoveryProvider: "not_configured" | "configured";
    readonly durableRecoveryStore: "local_memory_only" | "durable_connected";
    readonly adminAudit: "not_connected" | "connected";
    readonly fakeRoomRecoveryAllowed: false;
    readonly fakeEndStateAllowed: false;
    readonly fakeProviderRecoveryAllowed: false;
  };
};

export type StreamRoomRecoveryEvidenceSnapshot = {
  readonly version: "STREAM-109I";
  readonly roomId: string;
  readonly checkedAt: string;
  readonly status: StreamRoomRecoveryStatus;
  readonly selectedCheckpointId: StreamRoomRecoveryCheckpointId;
  readonly checkpointsTotal: number;
  readonly verifiedLocal: number;
  readonly needsActionLocal: number;
  readonly providerBlocked: number;
  readonly queuedRecoveryEvents: number;
  readonly missingRecoveryEvents: number;
  readonly hostReconnectRequestedLocal: boolean;
  readonly viewerReconnectRequestedLocal: boolean;
  readonly endingRequestedLocal: boolean;
  readonly endStateConfirmedLocal: boolean;
  readonly providerRecoveryRequestedLocal: boolean;
  readonly hostSessionStable: boolean;
  readonly viewerSessionsStable: boolean;
  readonly roomEndConsistent: boolean;
  readonly localBlockers: readonly StreamRoomRecoveryBlockerCode[];
  readonly providerBlockers: readonly StreamRoomRecoveryBlockerCode[];
  readonly backendRecoveryContract: StreamRoomRecoveryRuntimeState["integration"]["backendRecoveryContract"];
  readonly realtimeRecoveryProvider: StreamRoomRecoveryRuntimeState["integration"]["realtimeRecoveryProvider"];
  readonly durableRecoveryStore: StreamRoomRecoveryRuntimeState["integration"]["durableRecoveryStore"];
  readonly adminAudit: StreamRoomRecoveryRuntimeState["integration"]["adminAudit"];
  readonly fakeRoomRecoveryAllowed: false;
  readonly fakeEndStateAllowed: false;
  readonly fakeProviderRecoveryAllowed: false;
  readonly readyForBackendUnion: boolean;
};

function nowIso(now?: Date | string | number): string {
  if (now instanceof Date) return now.toISOString();
  if (typeof now === "string") return new Date(now).toISOString();
  if (typeof now === "number") return new Date(now).toISOString();
  return new Date().toISOString();
}

function unique(values: readonly StreamRoomRecoveryBlockerCode[]): readonly StreamRoomRecoveryBlockerCode[] {
  return Array.from(new Set(values));
}

function providerBlockers(): readonly StreamRoomRecoveryBlockerCode[] {
  return [
    "recovery_backend_contract_required",
    "recovery_realtime_provider_required",
    "recovery_durable_store_required",
    "recovery_admin_audit_required",
    "recovery_fake_recovery_forbidden",
  ];
}

function hasRecoveryEvent(eventQueue: StreamRoomEventQueueRuntimeState, checkpointId: StreamRoomRecoveryCheckpointId): boolean {
  return eventQueue.events.some((event) => event.payload.recoveryCheckpointId === checkpointId && event.status !== "dropped_local");
}

function hostSessionStable(viewerSession: StreamViewerSessionReconnectRuntimeState): boolean {
  return viewerSession.sessions.some((session) => session.role === "host" && (session.status === "connected_local" || session.status === "reconnected_local" || session.status === "backgrounded_local"));
}

function viewerSessionsStable(viewerSession: StreamViewerSessionReconnectRuntimeState): boolean {
  const nonHostSessions = viewerSession.sessions.filter((session) => session.role !== "host");
  if (nonHostSessions.length === 0) return false;
  return nonHostSessions.every((session) => session.status === "connected_local" || session.status === "reconnected_local" || session.status === "backgrounded_local");
}

function viewerRecoveryRequired(viewerSession: StreamViewerSessionReconnectRuntimeState): boolean {
  return viewerSession.sessions.some((session) => session.status === "heartbeat_missing_local" || session.status === "reconnecting_local" || session.status === "disconnected_local");
}

function missingPresenceEvents(joinLeave: StreamRoomJoinLeaveRuntimeState): number {
  return joinLeave.records.filter((record) => !record.eventQueuedLocal).length;
}

function localBlockersFor(
  room: StreamRoomRuntimeState,
  eventQueue: StreamRoomEventQueueRuntimeState,
  viewerSession: StreamViewerSessionReconnectRuntimeState,
  joinLeave: StreamRoomJoinLeaveRuntimeState,
  stage: StreamRoomStageRuntimeState,
  state?: Pick<StreamRoomRecoveryRuntimeState, "endingRequestedLocal" | "endStateConfirmedLocal">,
): readonly StreamRoomRecoveryBlockerCode[] {
  const blockers: StreamRoomRecoveryBlockerCode[] = [];
  if (!room.roomId) blockers.push("recovery_room_required");
  if (!hostSessionStable(viewerSession)) blockers.push("recovery_host_session_required");
  if (!viewerSessionsStable(viewerSession)) blockers.push("recovery_viewer_session_required");
  if (missingPresenceEvents(joinLeave) > 0) blockers.push("recovery_presence_event_required");
  if (eventQueue.events.length === 0) blockers.push("recovery_event_queue_required");
  if (room.status === "ended" && stage.status !== "ended_local") blockers.push("recovery_stage_end_required");
  if (state?.endingRequestedLocal && room.status !== "ended") blockers.push("recovery_room_end_required");
  if (viewerRecoveryRequired(viewerSession)) blockers.push("recovery_reconnect_sequence_required");
  return unique(blockers);
}

function checkpoint(
  id: StreamRoomRecoveryCheckpointId,
  label: string,
  verified: boolean,
  blockers: readonly StreamRoomRecoveryBlockerCode[],
  eventQueuedLocal: boolean,
  checkedAt: string,
  providerOnly = false,
): StreamRoomRecoveryCheckpoint {
  const status: StreamRoomRecoveryCheckpointStatus = providerOnly
    ? "blocked_provider_required"
    : verified
      ? "verified_local"
      : blockers.length > 0
        ? "needs_action_local"
        : "pending_local";
  return {
    id,
    label,
    status,
    blockers,
    eventQueuedLocal,
    verifiedAt: status === "verified_local" ? checkedAt : null,
    localOnly: true,
  };
}

function buildCheckpoints(
  room: StreamRoomRuntimeState,
  eventQueue: StreamRoomEventQueueRuntimeState,
  viewerSession: StreamViewerSessionReconnectRuntimeState,
  joinLeave: StreamRoomJoinLeaveRuntimeState,
  stage: StreamRoomStageRuntimeState,
  state: Pick<StreamRoomRecoveryRuntimeState, "endStateConfirmedLocal"> | null,
  checkedAt: string,
): readonly StreamRoomRecoveryCheckpoint[] {
  const hostStable = hostSessionStable(viewerSession);
  const viewersStable = viewerSessionsStable(viewerSession);
  const presenceMissing = missingPresenceEvents(joinLeave);
  const roomEnded = room.status === "ended";
  return [
    checkpoint("room_snapshot", "Room snapshot is available", Boolean(room.roomId), room.roomId ? [] : ["recovery_room_required"], hasRecoveryEvent(eventQueue, "room_snapshot"), checkedAt),
    checkpoint("host_session", "Host session is stable locally", hostStable, hostStable ? [] : ["recovery_host_session_required"], hasRecoveryEvent(eventQueue, "host_session"), checkedAt),
    checkpoint("viewer_sessions", "Viewer sessions are stable locally", viewersStable, viewersStable ? [] : ["recovery_viewer_session_required", ...(viewerRecoveryRequired(viewerSession) ? ["recovery_reconnect_sequence_required" as const] : [])], hasRecoveryEvent(eventQueue, "viewer_sessions"), checkedAt),
    checkpoint("presence_events", "Join/leave presence events are queued", presenceMissing === 0, presenceMissing === 0 ? [] : ["recovery_presence_event_required"], hasRecoveryEvent(eventQueue, "presence_events"), checkedAt),
    checkpoint("event_queue", "Room event queue has recovery/lifecycle evidence", eventQueue.events.length > 0, eventQueue.events.length > 0 ? [] : ["recovery_event_queue_required"], hasRecoveryEvent(eventQueue, "event_queue"), checkedAt),
    checkpoint("stage_consistency", "Room stage is consistent with room status", !roomEnded || stage.status === "ended_local", !roomEnded || stage.status === "ended_local" ? [] : ["recovery_stage_end_required"], hasRecoveryEvent(eventQueue, "stage_consistency"), checkedAt),
    checkpoint("room_end_consistency", "End-state is explicit and consistent", !roomEnded || Boolean(state?.endStateConfirmedLocal), !roomEnded || Boolean(state?.endStateConfirmedLocal) ? [] : ["recovery_room_end_required"], hasRecoveryEvent(eventQueue, "room_end_consistency"), checkedAt),
    checkpoint("provider_recovery", "Provider recovery handoff requires backend/realtime/durable/Admin contracts", false, providerBlockers(), hasRecoveryEvent(eventQueue, "provider_recovery"), checkedAt, true),
  ];
}

function statusFor(
  room: StreamRoomRuntimeState,
  viewerSession: StreamViewerSessionReconnectRuntimeState,
  checkpoints: readonly StreamRoomRecoveryCheckpoint[],
  state: Pick<StreamRoomRecoveryRuntimeState, "endingRequestedLocal" | "endStateConfirmedLocal" | "providerRecoveryRequestedLocal">,
): StreamRoomRecoveryStatus {
  if (state.providerRecoveryRequestedLocal) return "provider_recovery_blocked";
  if (room.status === "ended" && state.endStateConfirmedLocal) return "ended_consistent_local";
  if (state.endingRequestedLocal) return "ending_local";
  if (!hostSessionStable(viewerSession)) return "host_reconnect_required_local";
  if (viewerRecoveryRequired(viewerSession)) return "viewer_reconnect_required_local";
  return checkpoints.some((item) => item.status === "needs_action_local") ? "recovery_required_local" : "stable_local";
}

function defaultIntegration(): StreamRoomRecoveryRuntimeState["integration"] {
  return {
    backendRecoveryContract: "not_connected",
    realtimeRecoveryProvider: "not_configured",
    durableRecoveryStore: "local_memory_only",
    adminAudit: "not_connected",
    fakeRoomRecoveryAllowed: false,
    fakeEndStateAllowed: false,
    fakeProviderRecoveryAllowed: false,
  };
}

export function createInitialStreamRoomRecoveryState(
  room: StreamRoomRuntimeState,
  eventQueue: StreamRoomEventQueueRuntimeState,
  viewerSession: StreamViewerSessionReconnectRuntimeState,
  joinLeave: StreamRoomJoinLeaveRuntimeState,
  stage: StreamRoomStageRuntimeState,
  now?: Date | string | number,
): StreamRoomRecoveryRuntimeState {
  const checkedAt = nowIso(now);
  const base = {
    endingRequestedLocal: false,
    endStateConfirmedLocal: false,
    providerRecoveryRequestedLocal: false,
  };
  const checkpoints = buildCheckpoints(room, eventQueue, viewerSession, joinLeave, stage, base, checkedAt);
  return {
    version: "STREAM-109I",
    roomId: room.roomId,
    checkedAt,
    status: statusFor(room, viewerSession, checkpoints, base),
    selectedCheckpointId: checkpoints.find((item) => item.status === "needs_action_local")?.id ?? "room_snapshot",
    hostReconnectRequestedLocal: false,
    viewerReconnectRequestedLocal: false,
    endingRequestedLocal: false,
    endStateConfirmedLocal: false,
    providerRecoveryRequestedLocal: false,
    recoveryEventsQueuedLocal: false,
    checkpoints,
    integration: defaultIntegration(),
  };
}

export function syncStreamRoomRecoveryState(
  state: StreamRoomRecoveryRuntimeState,
  room: StreamRoomRuntimeState,
  eventQueue: StreamRoomEventQueueRuntimeState,
  viewerSession: StreamViewerSessionReconnectRuntimeState,
  joinLeave: StreamRoomJoinLeaveRuntimeState,
  stage: StreamRoomStageRuntimeState,
  now?: Date | string | number,
): StreamRoomRecoveryRuntimeState {
  const checkedAt = nowIso(now);
  const checkpoints = buildCheckpoints(room, eventQueue, viewerSession, joinLeave, stage, state, checkedAt);
  const selectedExists = checkpoints.some((item) => item.id === state.selectedCheckpointId);
  const next = {
    ...state,
    roomId: room.roomId,
    checkedAt,
    selectedCheckpointId: selectedExists ? state.selectedCheckpointId : checkpoints.find((item) => item.status === "needs_action_local")?.id ?? "room_snapshot",
    checkpoints,
  };
  return {
    ...next,
    status: statusFor(room, viewerSession, checkpoints, next),
    recoveryEventsQueuedLocal: checkpoints.some((item) => item.eventQueuedLocal),
  };
}

export function selectStreamRoomRecoveryCheckpoint(
  state: StreamRoomRecoveryRuntimeState,
  checkpointId: StreamRoomRecoveryCheckpointId,
): StreamRoomRecoveryRuntimeState {
  return { ...state, selectedCheckpointId: checkpointId };
}

export function markStreamRoomRecoveryCheckpointVerifiedLocal(
  state: StreamRoomRecoveryRuntimeState,
  checkpointId: StreamRoomRecoveryCheckpointId = state.selectedCheckpointId,
  now?: Date | string | number,
): StreamRoomRecoveryRuntimeState {
  const checkedAt = nowIso(now);
  const checkpoints = state.checkpoints.map((item) => item.id === checkpointId && item.status !== "blocked_provider_required"
    ? { ...item, status: "verified_local" as const, verifiedAt: checkedAt, blockers: [] }
    : item);
  return { ...state, checkedAt, selectedCheckpointId: checkpointId, checkpoints };
}

export function requestStreamHostReconnectSequenceLocal(
  state: StreamRoomRecoveryRuntimeState,
  room: StreamRoomRuntimeState,
  viewerSession: StreamViewerSessionReconnectRuntimeState,
  now?: Date | string | number,
): StreamRoomRecoveryRuntimeState {
  const checkedAt = nowIso(now);
  return {
    ...state,
    roomId: room.roomId,
    checkedAt,
    selectedCheckpointId: "host_session",
    hostReconnectRequestedLocal: true,
    status: hostSessionStable(viewerSession) ? state.status : "host_reconnect_required_local",
  };
}

export function requestStreamViewerReconnectSequenceLocal(
  state: StreamRoomRecoveryRuntimeState,
  room: StreamRoomRuntimeState,
  viewerSession: StreamViewerSessionReconnectRuntimeState,
  now?: Date | string | number,
): StreamRoomRecoveryRuntimeState {
  const checkedAt = nowIso(now);
  return {
    ...state,
    roomId: room.roomId,
    checkedAt,
    selectedCheckpointId: "viewer_sessions",
    viewerReconnectRequestedLocal: true,
    status: viewerRecoveryRequired(viewerSession) || !viewerSessionsStable(viewerSession) ? "viewer_reconnect_required_local" : state.status,
  };
}

export function beginStreamRoomEndingConsistencyLocal(
  state: StreamRoomRecoveryRuntimeState,
  room: StreamRoomRuntimeState,
  now?: Date | string | number,
): StreamRoomRecoveryRuntimeState {
  const checkedAt = nowIso(now);
  return {
    ...state,
    roomId: room.roomId,
    checkedAt,
    selectedCheckpointId: "room_end_consistency",
    endingRequestedLocal: true,
    endStateConfirmedLocal: false,
    status: "ending_local",
  };
}

export function markStreamRoomEndedConsistentLocal(
  state: StreamRoomRecoveryRuntimeState,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  now?: Date | string | number,
): StreamRoomRecoveryRuntimeState {
  const checkedAt = nowIso(now);
  const canConfirm = room.status === "ended" && stage.status === "ended_local";
  const checkpoints = state.checkpoints.map((item) => item.id === "room_end_consistency" && canConfirm
    ? { ...item, status: "verified_local" as const, verifiedAt: checkedAt, blockers: [] }
    : item);
  return {
    ...state,
    checkedAt,
    selectedCheckpointId: "room_end_consistency",
    endingRequestedLocal: !canConfirm,
    endStateConfirmedLocal: canConfirm,
    status: canConfirm ? "ended_consistent_local" : "ending_local",
    checkpoints,
  };
}

export function queueStreamRoomRecoveryEvents(
  state: StreamRoomRecoveryRuntimeState,
  eventQueue: StreamRoomEventQueueRuntimeState,
  room: StreamRoomRuntimeState,
  now?: Date | string | number,
): { readonly state: StreamRoomRecoveryRuntimeState; readonly eventQueue: StreamRoomEventQueueRuntimeState } {
  const checkedAt = nowIso(now);
  const targets = state.checkpoints.filter((checkpoint) => checkpoint.id !== "provider_recovery" && !checkpoint.eventQueuedLocal);
  let nextQueue = eventQueue;
  targets.forEach((checkpoint) => {
    nextQueue = enqueueLocalStreamRoomEvent(nextQueue, room, {
      kind: "room_lifecycle",
      label: `Recovery checkpoint: ${checkpoint.id}`,
      priority: checkpoint.status === "needs_action_local" ? "high" : "normal",
      payload: {
        roomId: room.roomId,
        recoveryCheckpointId: checkpoint.id,
        recoveryCheckpointStatus: checkpoint.status,
        roomStatus: room.status,
        fakeRoomRecoveryAllowed: false,
        fakeEndStateAllowed: false,
      },
    }, checkedAt);
  });
  return {
    eventQueue: nextQueue,
    state: {
      ...state,
      checkedAt,
      recoveryEventsQueuedLocal: true,
      checkpoints: state.checkpoints.map((checkpoint) => checkpoint.id !== "provider_recovery" ? { ...checkpoint, eventQueuedLocal: true } : checkpoint),
    },
  };
}

export function requestStreamRoomRecoveryProviderBlocked(
  state: StreamRoomRecoveryRuntimeState,
  now?: Date | string | number,
): StreamRoomRecoveryRuntimeState {
  return {
    ...state,
    checkedAt: nowIso(now),
    selectedCheckpointId: "provider_recovery",
    providerRecoveryRequestedLocal: true,
    status: "provider_recovery_blocked",
    checkpoints: state.checkpoints.map((checkpoint) => checkpoint.id === "provider_recovery" ? { ...checkpoint, status: "blocked_provider_required" as const, blockers: providerBlockers() } : checkpoint),
  };
}

export function buildStreamRoomRecoveryEvidenceSnapshot(
  state: StreamRoomRecoveryRuntimeState,
  room: StreamRoomRuntimeState,
  eventQueue: StreamRoomEventQueueRuntimeState,
  viewerSession: StreamViewerSessionReconnectRuntimeState,
  joinLeave: StreamRoomJoinLeaveRuntimeState,
  stage: StreamRoomStageRuntimeState,
): StreamRoomRecoveryEvidenceSnapshot {
  const localBlockers = localBlockersFor(room, eventQueue, viewerSession, joinLeave, stage, state);
  const verifiedLocal = state.checkpoints.filter((item) => item.status === "verified_local").length;
  const needsActionLocal = state.checkpoints.filter((item) => item.status === "needs_action_local" || item.status === "pending_local").length;
  const providerBlocked = state.checkpoints.filter((item) => item.status === "blocked_provider_required").length;
  const queuedRecoveryEvents = state.checkpoints.filter((item) => item.eventQueuedLocal).length;
  return {
    version: "STREAM-109I",
    roomId: state.roomId,
    checkedAt: state.checkedAt,
    status: state.status,
    selectedCheckpointId: state.selectedCheckpointId,
    checkpointsTotal: state.checkpoints.length,
    verifiedLocal,
    needsActionLocal,
    providerBlocked,
    queuedRecoveryEvents,
    missingRecoveryEvents: state.checkpoints.filter((item) => item.id !== "provider_recovery" && !item.eventQueuedLocal).length,
    hostReconnectRequestedLocal: state.hostReconnectRequestedLocal,
    viewerReconnectRequestedLocal: state.viewerReconnectRequestedLocal,
    endingRequestedLocal: state.endingRequestedLocal,
    endStateConfirmedLocal: state.endStateConfirmedLocal,
    providerRecoveryRequestedLocal: state.providerRecoveryRequestedLocal,
    hostSessionStable: hostSessionStable(viewerSession),
    viewerSessionsStable: viewerSessionsStable(viewerSession),
    roomEndConsistent: room.status !== "ended" || (state.endStateConfirmedLocal && stage.status === "ended_local"),
    localBlockers,
    providerBlockers: providerBlockers(),
    backendRecoveryContract: state.integration.backendRecoveryContract,
    realtimeRecoveryProvider: state.integration.realtimeRecoveryProvider,
    durableRecoveryStore: state.integration.durableRecoveryStore,
    adminAudit: state.integration.adminAudit,
    fakeRoomRecoveryAllowed: false,
    fakeEndStateAllowed: false,
    fakeProviderRecoveryAllowed: false,
    readyForBackendUnion: queuedRecoveryEvents > 0 && localBlockers.length === 0,
  };
}
