import type { StreamRoomParticipant, StreamRoomRuntimeState } from "./streamRoomRuntime";
import { enqueueLocalStreamRoomEvent, type StreamRoomEventQueueRuntimeState } from "./streamRoomEventQueueRuntime";

export type StreamRoomJoinLeavePresenceStatus =
  | "present_local"
  | "left_local"
  | "rejoined_local"
  | "kicked_local"
  | "blocked_local"
  | "provider_sync_blocked";

export type StreamRoomJoinLeaveBlockerCode =
  | "join_leave_room_required"
  | "join_leave_host_required"
  | "join_leave_participant_required"
  | "join_leave_event_missing"
  | "join_leave_backend_presence_required"
  | "join_leave_realtime_presence_provider_required"
  | "join_leave_durable_presence_required"
  | "join_leave_admin_audit_required"
  | "join_leave_fake_presence_forbidden";

export type StreamRoomParticipantPresenceRecord = {
  readonly participantId: string;
  readonly displayName: string;
  readonly role: StreamRoomParticipant["role"];
  readonly status: StreamRoomJoinLeavePresenceStatus;
  readonly joinedAt: string;
  readonly lastSeenAt: string;
  readonly leftAt: string | null;
  readonly eventQueuedLocal: boolean;
  readonly localOnly: true;
  readonly deliveredToProvider: false;
};

export type StreamRoomJoinLeaveRuntimeState = {
  readonly version: "STREAM-109G";
  readonly roomId: string;
  readonly checkedAt: string;
  readonly selectedParticipantId: string | null;
  readonly providerSyncRequestedLocal: boolean;
  readonly records: readonly StreamRoomParticipantPresenceRecord[];
  readonly integration: {
    readonly backendPresenceContract: "not_connected" | "connected";
    readonly realtimePresenceProvider: "not_configured" | "configured";
    readonly durablePresenceStore: "local_memory_only" | "durable_connected";
    readonly adminAudit: "not_connected" | "connected";
    readonly fakePresenceAllowed: false;
    readonly fakeJoinAllowed: false;
    readonly fakeLeaveAllowed: false;
  };
};

export type StreamRoomJoinLeaveEvidenceSnapshot = {
  readonly version: "STREAM-109G";
  readonly roomId: string;
  readonly checkedAt: string;
  readonly selectedParticipantId: string | null;
  readonly totalRecords: number;
  readonly presentLocal: number;
  readonly leftLocal: number;
  readonly rejoinedLocal: number;
  readonly kickedLocal: number;
  readonly blockedLocal: number;
  readonly queuedPresenceEvents: number;
  readonly missingPresenceEvents: number;
  readonly providerSyncRequestedLocal: boolean;
  readonly localBlockers: readonly StreamRoomJoinLeaveBlockerCode[];
  readonly providerBlockers: readonly StreamRoomJoinLeaveBlockerCode[];
  readonly backendPresenceContract: StreamRoomJoinLeaveRuntimeState["integration"]["backendPresenceContract"];
  readonly realtimePresenceProvider: StreamRoomJoinLeaveRuntimeState["integration"]["realtimePresenceProvider"];
  readonly durablePresenceStore: StreamRoomJoinLeaveRuntimeState["integration"]["durablePresenceStore"];
  readonly adminAudit: StreamRoomJoinLeaveRuntimeState["integration"]["adminAudit"];
  readonly fakePresenceAllowed: false;
  readonly fakeJoinAllowed: false;
  readonly fakeLeaveAllowed: false;
  readonly readyForBackendUnion: boolean;
};

function nowIso(now?: Date | string | number): string {
  if (now instanceof Date) return now.toISOString();
  if (typeof now === "string") return new Date(now).toISOString();
  if (typeof now === "number") return new Date(now).toISOString();
  return new Date().toISOString();
}

function providerBlockers(): readonly StreamRoomJoinLeaveBlockerCode[] {
  return [
    "join_leave_backend_presence_required",
    "join_leave_realtime_presence_provider_required",
    "join_leave_durable_presence_required",
    "join_leave_admin_audit_required",
    "join_leave_fake_presence_forbidden",
  ];
}

function unique(values: readonly StreamRoomJoinLeaveBlockerCode[]): readonly StreamRoomJoinLeaveBlockerCode[] {
  return Array.from(new Set(values));
}

function recordFromParticipant(participant: StreamRoomParticipant, now: string, existing?: StreamRoomParticipantPresenceRecord): StreamRoomParticipantPresenceRecord {
  const blockedStatus: StreamRoomJoinLeavePresenceStatus = participant.blocked ? "blocked_local" : existing?.status === "left_local" ? "rejoined_local" : existing?.status ?? "present_local";
  return {
    participantId: participant.id,
    displayName: participant.displayName,
    role: participant.role,
    status: blockedStatus,
    joinedAt: existing?.joinedAt ?? participant.joinedAt,
    lastSeenAt: now,
    leftAt: blockedStatus === "present_local" || blockedStatus === "rejoined_local" ? null : existing?.leftAt ?? null,
    eventQueuedLocal: existing?.eventQueuedLocal ?? false,
    localOnly: true,
    deliveredToProvider: false,
  };
}

function syncRecords(records: readonly StreamRoomParticipantPresenceRecord[], room: StreamRoomRuntimeState, now: string): readonly StreamRoomParticipantPresenceRecord[] {
  const byId = new Map(records.map((record) => [record.participantId, record]));
  const activeRecords = room.participants.map((participant) => recordFromParticipant(participant, now, byId.get(participant.id)));
  const activeIds = new Set(room.participants.map((participant) => participant.id));
  const departedRecords = records
    .filter((record) => !activeIds.has(record.participantId))
    .map((record) => record.status === "left_local" || record.status === "kicked_local" ? record : { ...record, status: "left_local" as const, leftAt: now, lastSeenAt: now });
  return [...activeRecords, ...departedRecords].slice(0, 96);
}

export function createInitialStreamRoomJoinLeaveState(room: StreamRoomRuntimeState, now?: Date | string | number): StreamRoomJoinLeaveRuntimeState {
  const checkedAt = nowIso(now);
  return {
    version: "STREAM-109G",
    roomId: room.roomId,
    checkedAt,
    selectedParticipantId: room.participants.find((participant) => participant.role !== "host")?.id ?? room.hostId ?? null,
    providerSyncRequestedLocal: false,
    records: syncRecords([], room, checkedAt),
    integration: {
      backendPresenceContract: "not_connected",
      realtimePresenceProvider: "not_configured",
      durablePresenceStore: "local_memory_only",
      adminAudit: "not_connected",
      fakePresenceAllowed: false,
      fakeJoinAllowed: false,
      fakeLeaveAllowed: false,
    },
  };
}

export function syncStreamRoomJoinLeaveState(
  state: StreamRoomJoinLeaveRuntimeState,
  room: StreamRoomRuntimeState,
  now?: Date | string | number,
): StreamRoomJoinLeaveRuntimeState {
  const checkedAt = nowIso(now);
  const records = syncRecords(state.records, room, checkedAt);
  const selectedStillExists = state.selectedParticipantId ? records.some((record) => record.participantId === state.selectedParticipantId) : false;
  return {
    ...state,
    roomId: room.roomId,
    checkedAt,
    selectedParticipantId: selectedStillExists ? state.selectedParticipantId : records.find((record) => record.role !== "host")?.participantId ?? room.hostId ?? null,
    records,
  };
}

export function selectStreamRoomJoinLeaveParticipant(state: StreamRoomJoinLeaveRuntimeState, participantId: string | null): StreamRoomJoinLeaveRuntimeState {
  return { ...state, selectedParticipantId: participantId };
}

export function markStreamRoomParticipantPresentLocal(
  state: StreamRoomJoinLeaveRuntimeState,
  room: StreamRoomRuntimeState,
  participantId: string | null = state.selectedParticipantId,
  now?: Date | string | number,
): StreamRoomJoinLeaveRuntimeState {
  const checkedAt = nowIso(now);
  const targetId = participantId ?? room.hostId;
  const participant = room.participants.find((item) => item.id === targetId) ?? room.participants[0];
  if (!participant) return syncStreamRoomJoinLeaveState(state, room, now);
  const records = syncRecords(state.records, room, checkedAt).map((record) => {
    if (record.participantId !== participant.id) return record;
    return {
      ...record,
      status: record.status === "left_local" ? "rejoined_local" as const : participant.blocked ? "blocked_local" as const : "present_local" as const,
      lastSeenAt: checkedAt,
      leftAt: null,
      eventQueuedLocal: false,
    };
  });
  return { ...state, roomId: room.roomId, checkedAt, selectedParticipantId: participant.id, records };
}

export function markStreamRoomParticipantLeftLocal(
  state: StreamRoomJoinLeaveRuntimeState,
  room: StreamRoomRuntimeState,
  participantId: string | null = state.selectedParticipantId,
  now?: Date | string | number,
): StreamRoomJoinLeaveRuntimeState {
  const checkedAt = nowIso(now);
  const targetId = participantId ?? state.selectedParticipantId ?? room.participants.find((item) => item.role !== "host")?.id ?? null;
  if (!targetId || targetId === room.hostId) return syncStreamRoomJoinLeaveState(state, room, now);
  const records = syncRecords(state.records, room, checkedAt).map((record) => record.participantId === targetId ? { ...record, status: "left_local" as const, leftAt: checkedAt, lastSeenAt: checkedAt, eventQueuedLocal: false } : record);
  return { ...state, roomId: room.roomId, checkedAt, selectedParticipantId: targetId, records };
}

export function markStreamRoomParticipantKickedLocal(
  state: StreamRoomJoinLeaveRuntimeState,
  room: StreamRoomRuntimeState,
  participantId: string | null = state.selectedParticipantId,
  now?: Date | string | number,
): StreamRoomJoinLeaveRuntimeState {
  const checkedAt = nowIso(now);
  const targetId = participantId ?? state.selectedParticipantId ?? null;
  if (!targetId || targetId === room.hostId) return syncStreamRoomJoinLeaveState(state, room, now);
  const records = syncRecords(state.records, room, checkedAt).map((record) => record.participantId === targetId ? { ...record, status: "kicked_local" as const, leftAt: checkedAt, lastSeenAt: checkedAt, eventQueuedLocal: false } : record);
  return { ...state, roomId: room.roomId, checkedAt, selectedParticipantId: targetId, records };
}

export function queueStreamRoomJoinLeavePresenceEvents(
  state: StreamRoomJoinLeaveRuntimeState,
  eventQueue: StreamRoomEventQueueRuntimeState,
  room: StreamRoomRuntimeState,
  now?: Date | string | number,
): { readonly state: StreamRoomJoinLeaveRuntimeState; readonly eventQueue: StreamRoomEventQueueRuntimeState } {
  const checkedAt = nowIso(now);
  let nextQueue = eventQueue;
  const nextRecords = syncRecords(state.records, room, checkedAt).map((record) => {
    if (record.eventQueuedLocal) return record;
    nextQueue = enqueueLocalStreamRoomEvent(nextQueue, room, {
      kind: "participant",
      label: `Presence ${record.status}: ${record.displayName}`,
      priority: record.status === "left_local" || record.status === "kicked_local" || record.status === "blocked_local" ? "high" : "normal",
      payload: {
        participantId: record.participantId,
        displayName: record.displayName,
        role: record.role,
        presenceStatus: record.status,
        joinedAt: record.joinedAt,
        leftAt: record.leftAt,
        deliveredToProvider: false,
        fakePresenceAllowed: false,
      },
    }, checkedAt);
    return { ...record, eventQueuedLocal: true };
  });
  return {
    eventQueue: nextQueue,
    state: { ...state, roomId: room.roomId, checkedAt, records: nextRecords },
  };
}

export function requestStreamRoomJoinLeaveProviderSyncBlocked(
  state: StreamRoomJoinLeaveRuntimeState,
  room: StreamRoomRuntimeState,
  now?: Date | string | number,
): StreamRoomJoinLeaveRuntimeState {
  const checkedAt = nowIso(now);
  return {
    ...syncStreamRoomJoinLeaveState(state, room, now),
    checkedAt,
    providerSyncRequestedLocal: true,
    records: syncRecords(state.records, room, checkedAt).map((record) => record.eventQueuedLocal ? { ...record, status: record.status } : record),
  };
}

export function buildStreamRoomJoinLeaveEvidenceSnapshot(state: StreamRoomJoinLeaveRuntimeState): StreamRoomJoinLeaveEvidenceSnapshot {
  const localBlockers: StreamRoomJoinLeaveBlockerCode[] = [];
  if (!state.roomId) localBlockers.push("join_leave_room_required");
  if (!state.records.some((record) => record.role === "host")) localBlockers.push("join_leave_host_required");
  if (state.records.length <= 1) localBlockers.push("join_leave_participant_required");
  const missingPresenceEvents = state.records.filter((record) => !record.eventQueuedLocal).length;
  if (missingPresenceEvents > 0) localBlockers.push("join_leave_event_missing");
  const presentLocal = state.records.filter((record) => record.status === "present_local").length;
  const leftLocal = state.records.filter((record) => record.status === "left_local").length;
  const rejoinedLocal = state.records.filter((record) => record.status === "rejoined_local").length;
  const kickedLocal = state.records.filter((record) => record.status === "kicked_local").length;
  const blockedLocal = state.records.filter((record) => record.status === "blocked_local").length;
  return {
    version: "STREAM-109G",
    roomId: state.roomId,
    checkedAt: state.checkedAt,
    selectedParticipantId: state.selectedParticipantId,
    totalRecords: state.records.length,
    presentLocal,
    leftLocal,
    rejoinedLocal,
    kickedLocal,
    blockedLocal,
    queuedPresenceEvents: state.records.filter((record) => record.eventQueuedLocal).length,
    missingPresenceEvents,
    providerSyncRequestedLocal: state.providerSyncRequestedLocal,
    localBlockers: unique(localBlockers),
    providerBlockers: providerBlockers(),
    backendPresenceContract: state.integration.backendPresenceContract,
    realtimePresenceProvider: state.integration.realtimePresenceProvider,
    durablePresenceStore: state.integration.durablePresenceStore,
    adminAudit: state.integration.adminAudit,
    fakePresenceAllowed: false,
    fakeJoinAllowed: false,
    fakeLeaveAllowed: false,
    readyForBackendUnion: state.records.length > 0,
  };
}
