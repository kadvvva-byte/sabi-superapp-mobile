import type { StreamRoomParticipant, StreamRoomRuntimeState } from "./streamRoomRuntime";
import { enqueueLocalStreamRoomEvent, type StreamRoomEventQueueRuntimeState } from "./streamRoomEventQueueRuntime";

export type StreamViewerSessionStatus =
  | "connected_local"
  | "backgrounded_local"
  | "heartbeat_missing_local"
  | "reconnecting_local"
  | "reconnected_local"
  | "disconnected_local"
  | "provider_sync_blocked";

export type StreamViewerSessionReconnectBlockerCode =
  | "viewer_session_room_required"
  | "viewer_session_host_required"
  | "viewer_session_viewer_required"
  | "viewer_session_heartbeat_required"
  | "viewer_session_reconnect_event_missing"
  | "viewer_session_backend_session_required"
  | "viewer_session_realtime_session_provider_required"
  | "viewer_session_durable_session_required"
  | "viewer_session_admin_audit_required"
  | "viewer_session_fake_reconnect_forbidden";

export type StreamViewerSessionRecord = {
  readonly sessionId: string;
  readonly participantId: string;
  readonly displayName: string;
  readonly role: StreamRoomParticipant["role"];
  readonly status: StreamViewerSessionStatus;
  readonly joinedAt: string;
  readonly lastHeartbeatAt: string | null;
  readonly backgroundedAt: string | null;
  readonly disconnectedAt: string | null;
  readonly reconnectAttemptsLocal: number;
  readonly eventQueuedLocal: boolean;
  readonly localOnly: true;
  readonly deliveredToProvider: false;
};

export type StreamViewerSessionReconnectRuntimeState = {
  readonly version: "STREAM-109H";
  readonly roomId: string;
  readonly checkedAt: string;
  readonly heartbeatIntervalMs: number;
  readonly selectedSessionId: string | null;
  readonly providerSyncRequestedLocal: boolean;
  readonly sessions: readonly StreamViewerSessionRecord[];
  readonly integration: {
    readonly backendViewerSessionContract: "not_connected" | "connected";
    readonly realtimeSessionProvider: "not_configured" | "configured";
    readonly durableSessionStore: "local_memory_only" | "durable_connected";
    readonly adminAudit: "not_connected" | "connected";
    readonly fakeReconnectAllowed: false;
    readonly fakeViewerCountAllowed: false;
    readonly fakeProviderSessionAllowed: false;
  };
};

export type StreamViewerSessionReconnectEvidenceSnapshot = {
  readonly version: "STREAM-109H";
  readonly roomId: string;
  readonly checkedAt: string;
  readonly selectedSessionId: string | null;
  readonly totalSessions: number;
  readonly connectedLocal: number;
  readonly backgroundedLocal: number;
  readonly heartbeatMissingLocal: number;
  readonly reconnectingLocal: number;
  readonly reconnectedLocal: number;
  readonly disconnectedLocal: number;
  readonly queuedSessionEvents: number;
  readonly missingSessionEvents: number;
  readonly totalReconnectAttemptsLocal: number;
  readonly providerSyncRequestedLocal: boolean;
  readonly heartbeatIntervalMs: number;
  readonly localBlockers: readonly StreamViewerSessionReconnectBlockerCode[];
  readonly providerBlockers: readonly StreamViewerSessionReconnectBlockerCode[];
  readonly backendViewerSessionContract: StreamViewerSessionReconnectRuntimeState["integration"]["backendViewerSessionContract"];
  readonly realtimeSessionProvider: StreamViewerSessionReconnectRuntimeState["integration"]["realtimeSessionProvider"];
  readonly durableSessionStore: StreamViewerSessionReconnectRuntimeState["integration"]["durableSessionStore"];
  readonly adminAudit: StreamViewerSessionReconnectRuntimeState["integration"]["adminAudit"];
  readonly fakeReconnectAllowed: false;
  readonly fakeViewerCountAllowed: false;
  readonly fakeProviderSessionAllowed: false;
  readonly readyForBackendUnion: boolean;
};

const DEFAULT_HEARTBEAT_INTERVAL_MS = 15_000;

function nowIso(now?: Date | string | number): string {
  if (now instanceof Date) return now.toISOString();
  if (typeof now === "string") return new Date(now).toISOString();
  if (typeof now === "number") return new Date(now).toISOString();
  return new Date().toISOString();
}

function sessionIdForParticipant(participantId: string): string {
  return `viewer-session-${participantId}`;
}

function providerBlockers(): readonly StreamViewerSessionReconnectBlockerCode[] {
  return [
    "viewer_session_backend_session_required",
    "viewer_session_realtime_session_provider_required",
    "viewer_session_durable_session_required",
    "viewer_session_admin_audit_required",
    "viewer_session_fake_reconnect_forbidden",
  ];
}

function unique(values: readonly StreamViewerSessionReconnectBlockerCode[]): readonly StreamViewerSessionReconnectBlockerCode[] {
  return Array.from(new Set(values));
}

function sessionFromParticipant(
  participant: StreamRoomParticipant,
  now: string,
  existing?: StreamViewerSessionRecord,
): StreamViewerSessionRecord {
  const blockedOrMuted = participant.blocked;
  const existingStatus = existing?.status;
  const status: StreamViewerSessionStatus = blockedOrMuted
    ? "disconnected_local"
    : existingStatus === "disconnected_local" || existingStatus === "reconnecting_local" || existingStatus === "heartbeat_missing_local"
      ? "reconnected_local"
      : existingStatus ?? "connected_local";
  return {
    sessionId: existing?.sessionId ?? sessionIdForParticipant(participant.id),
    participantId: participant.id,
    displayName: participant.displayName,
    role: participant.role,
    status,
    joinedAt: existing?.joinedAt ?? participant.joinedAt,
    lastHeartbeatAt: existing?.lastHeartbeatAt ?? now,
    backgroundedAt: status === "backgrounded_local" ? existing?.backgroundedAt ?? now : existing?.backgroundedAt ?? null,
    disconnectedAt: status === "disconnected_local" ? existing?.disconnectedAt ?? now : existing?.disconnectedAt ?? null,
    reconnectAttemptsLocal: existing?.reconnectAttemptsLocal ?? 0,
    eventQueuedLocal: existing?.eventQueuedLocal ?? false,
    localOnly: true,
    deliveredToProvider: false,
  };
}

function syncSessions(
  sessions: readonly StreamViewerSessionRecord[],
  room: StreamRoomRuntimeState,
  now: string,
): readonly StreamViewerSessionRecord[] {
  const byParticipantId = new Map(sessions.map((session) => [session.participantId, session]));
  const active = room.participants.map((participant) => sessionFromParticipant(participant, now, byParticipantId.get(participant.id)));
  const activeIds = new Set(room.participants.map((participant) => participant.id));
  const departed = sessions
    .filter((session) => !activeIds.has(session.participantId))
    .map((session) => session.status === "disconnected_local" ? session : { ...session, status: "disconnected_local" as const, disconnectedAt: now, eventQueuedLocal: false });
  return [...active, ...departed].slice(0, 128);
}

export function createInitialStreamViewerSessionReconnectState(
  room: StreamRoomRuntimeState,
  now?: Date | string | number,
): StreamViewerSessionReconnectRuntimeState {
  const checkedAt = nowIso(now);
  const sessions = syncSessions([], room, checkedAt);
  return {
    version: "STREAM-109H",
    roomId: room.roomId,
    checkedAt,
    heartbeatIntervalMs: DEFAULT_HEARTBEAT_INTERVAL_MS,
    selectedSessionId: sessions.find((session) => session.role === "viewer")?.sessionId ?? sessions[0]?.sessionId ?? null,
    providerSyncRequestedLocal: false,
    sessions,
    integration: {
      backendViewerSessionContract: "not_connected",
      realtimeSessionProvider: "not_configured",
      durableSessionStore: "local_memory_only",
      adminAudit: "not_connected",
      fakeReconnectAllowed: false,
      fakeViewerCountAllowed: false,
      fakeProviderSessionAllowed: false,
    },
  };
}

export function syncStreamViewerSessionReconnectState(
  state: StreamViewerSessionReconnectRuntimeState,
  room: StreamRoomRuntimeState,
  now?: Date | string | number,
): StreamViewerSessionReconnectRuntimeState {
  const checkedAt = nowIso(now);
  const sessions = syncSessions(state.sessions, room, checkedAt);
  const selectedStillExists = state.selectedSessionId ? sessions.some((session) => session.sessionId === state.selectedSessionId) : false;
  return {
    ...state,
    roomId: room.roomId,
    checkedAt,
    selectedSessionId: selectedStillExists ? state.selectedSessionId : sessions.find((session) => session.role === "viewer")?.sessionId ?? sessions[0]?.sessionId ?? null,
    sessions,
  };
}

export function selectStreamViewerSession(
  state: StreamViewerSessionReconnectRuntimeState,
  sessionId: string | null,
): StreamViewerSessionReconnectRuntimeState {
  return { ...state, selectedSessionId: sessionId };
}

function updateSelectedSession(
  state: StreamViewerSessionReconnectRuntimeState,
  room: StreamRoomRuntimeState,
  updater: (session: StreamViewerSessionRecord, checkedAt: string) => StreamViewerSessionRecord,
  now?: Date | string | number,
): StreamViewerSessionReconnectRuntimeState {
  const checkedAt = nowIso(now);
  const synced = syncStreamViewerSessionReconnectState(state, room, checkedAt);
  const targetSessionId = synced.selectedSessionId ?? synced.sessions.find((session) => session.role === "viewer")?.sessionId ?? synced.sessions[0]?.sessionId ?? null;
  if (!targetSessionId) return synced;
  return {
    ...synced,
    checkedAt,
    selectedSessionId: targetSessionId,
    sessions: synced.sessions.map((session) => session.sessionId === targetSessionId ? updater(session, checkedAt) : session),
  };
}

export function markStreamViewerHeartbeatLocal(
  state: StreamViewerSessionReconnectRuntimeState,
  room: StreamRoomRuntimeState,
  now?: Date | string | number,
): StreamViewerSessionReconnectRuntimeState {
  return updateSelectedSession(state, room, (session, checkedAt) => ({
    ...session,
    status: session.status === "disconnected_local" ? "reconnected_local" : "connected_local",
    lastHeartbeatAt: checkedAt,
    disconnectedAt: null,
    eventQueuedLocal: false,
  }), now);
}

export function markStreamViewerBackgroundedLocal(
  state: StreamViewerSessionReconnectRuntimeState,
  room: StreamRoomRuntimeState,
  now?: Date | string | number,
): StreamViewerSessionReconnectRuntimeState {
  return updateSelectedSession(state, room, (session, checkedAt) => ({
    ...session,
    status: "backgrounded_local",
    backgroundedAt: checkedAt,
    lastHeartbeatAt: session.lastHeartbeatAt ?? checkedAt,
    eventQueuedLocal: false,
  }), now);
}

export function markStreamViewerHeartbeatMissingLocal(
  state: StreamViewerSessionReconnectRuntimeState,
  room: StreamRoomRuntimeState,
  now?: Date | string | number,
): StreamViewerSessionReconnectRuntimeState {
  return updateSelectedSession(state, room, (session) => ({
    ...session,
    status: "heartbeat_missing_local",
    eventQueuedLocal: false,
  }), now);
}

export function requestStreamViewerReconnectLocal(
  state: StreamViewerSessionReconnectRuntimeState,
  room: StreamRoomRuntimeState,
  now?: Date | string | number,
): StreamViewerSessionReconnectRuntimeState {
  return updateSelectedSession(state, room, (session, checkedAt) => ({
    ...session,
    status: "reconnecting_local",
    reconnectAttemptsLocal: session.reconnectAttemptsLocal + 1,
    lastHeartbeatAt: session.lastHeartbeatAt ?? checkedAt,
    eventQueuedLocal: false,
  }), now);
}

export function markStreamViewerReconnectedLocal(
  state: StreamViewerSessionReconnectRuntimeState,
  room: StreamRoomRuntimeState,
  now?: Date | string | number,
): StreamViewerSessionReconnectRuntimeState {
  return updateSelectedSession(state, room, (session, checkedAt) => ({
    ...session,
    status: "reconnected_local",
    lastHeartbeatAt: checkedAt,
    disconnectedAt: null,
    eventQueuedLocal: false,
  }), now);
}

export function markStreamViewerDisconnectedLocal(
  state: StreamViewerSessionReconnectRuntimeState,
  room: StreamRoomRuntimeState,
  now?: Date | string | number,
): StreamViewerSessionReconnectRuntimeState {
  return updateSelectedSession(state, room, (session, checkedAt) => ({
    ...session,
    status: "disconnected_local",
    disconnectedAt: checkedAt,
    eventQueuedLocal: false,
  }), now);
}

export function queueStreamViewerSessionReconnectEvents(
  state: StreamViewerSessionReconnectRuntimeState,
  eventQueue: StreamRoomEventQueueRuntimeState,
  room: StreamRoomRuntimeState,
  now?: Date | string | number,
): { readonly state: StreamViewerSessionReconnectRuntimeState; readonly eventQueue: StreamRoomEventQueueRuntimeState } {
  const checkedAt = nowIso(now);
  const synced = syncStreamViewerSessionReconnectState(state, room, checkedAt);
  let nextQueue = eventQueue;
  const nextSessions = synced.sessions.map((session) => {
    if (session.eventQueuedLocal) return session;
    nextQueue = enqueueLocalStreamRoomEvent(nextQueue, room, {
      kind: "participant",
      label: `Viewer session ${session.status}: ${session.displayName}`,
      priority: session.status === "disconnected_local" || session.status === "heartbeat_missing_local" ? "high" : "normal",
      payload: {
        sessionId: session.sessionId,
        participantId: session.participantId,
        role: session.role,
        sessionStatus: session.status,
        lastHeartbeatAt: session.lastHeartbeatAt,
        reconnectAttemptsLocal: session.reconnectAttemptsLocal,
        deliveredToProvider: false,
        fakeReconnectAllowed: false,
      },
    }, checkedAt);
    return { ...session, eventQueuedLocal: true };
  });
  return {
    eventQueue: nextQueue,
    state: { ...synced, checkedAt, sessions: nextSessions },
  };
}

export function requestStreamViewerSessionProviderSyncBlocked(
  state: StreamViewerSessionReconnectRuntimeState,
  room: StreamRoomRuntimeState,
  now?: Date | string | number,
): StreamViewerSessionReconnectRuntimeState {
  const checkedAt = nowIso(now);
  return {
    ...syncStreamViewerSessionReconnectState(state, room, now),
    checkedAt,
    providerSyncRequestedLocal: true,
    sessions: syncSessions(state.sessions, room, checkedAt).map((session) => session.eventQueuedLocal ? { ...session, status: "provider_sync_blocked" as const } : session),
  };
}

export function buildStreamViewerSessionReconnectEvidenceSnapshot(
  state: StreamViewerSessionReconnectRuntimeState,
): StreamViewerSessionReconnectEvidenceSnapshot {
  const localBlockers: StreamViewerSessionReconnectBlockerCode[] = [];
  if (!state.roomId) localBlockers.push("viewer_session_room_required");
  if (!state.sessions.some((session) => session.role === "host")) localBlockers.push("viewer_session_host_required");
  if (!state.sessions.some((session) => session.role !== "host")) localBlockers.push("viewer_session_viewer_required");
  if (!state.sessions.some((session) => session.lastHeartbeatAt)) localBlockers.push("viewer_session_heartbeat_required");
  const missingSessionEvents = state.sessions.filter((session) => !session.eventQueuedLocal).length;
  if (missingSessionEvents > 0) localBlockers.push("viewer_session_reconnect_event_missing");
  const connectedLocal = state.sessions.filter((session) => session.status === "connected_local").length;
  const backgroundedLocal = state.sessions.filter((session) => session.status === "backgrounded_local").length;
  const heartbeatMissingLocal = state.sessions.filter((session) => session.status === "heartbeat_missing_local").length;
  const reconnectingLocal = state.sessions.filter((session) => session.status === "reconnecting_local").length;
  const reconnectedLocal = state.sessions.filter((session) => session.status === "reconnected_local").length;
  const disconnectedLocal = state.sessions.filter((session) => session.status === "disconnected_local").length;
  return {
    version: "STREAM-109H",
    roomId: state.roomId,
    checkedAt: state.checkedAt,
    selectedSessionId: state.selectedSessionId,
    totalSessions: state.sessions.length,
    connectedLocal,
    backgroundedLocal,
    heartbeatMissingLocal,
    reconnectingLocal,
    reconnectedLocal,
    disconnectedLocal,
    queuedSessionEvents: state.sessions.filter((session) => session.eventQueuedLocal).length,
    missingSessionEvents,
    totalReconnectAttemptsLocal: state.sessions.reduce((sum, session) => sum + session.reconnectAttemptsLocal, 0),
    providerSyncRequestedLocal: state.providerSyncRequestedLocal,
    heartbeatIntervalMs: state.heartbeatIntervalMs,
    localBlockers: unique(localBlockers),
    providerBlockers: providerBlockers(),
    backendViewerSessionContract: state.integration.backendViewerSessionContract,
    realtimeSessionProvider: state.integration.realtimeSessionProvider,
    durableSessionStore: state.integration.durableSessionStore,
    adminAudit: state.integration.adminAudit,
    fakeReconnectAllowed: false,
    fakeViewerCountAllowed: false,
    fakeProviderSessionAllowed: false,
    readyForBackendUnion: state.sessions.length > 0,
  };
}
