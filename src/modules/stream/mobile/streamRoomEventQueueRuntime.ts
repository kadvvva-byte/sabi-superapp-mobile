import type { StreamRoomRuntimeState } from "./streamRoomRuntime";

export type StreamRoomEventKind =
  | "room_lifecycle"
  | "participant"
  | "comment"
  | "moderation"
  | "cohost"
  | "battle"
  | "broadcast_source"
  | "stage"
  | "layout"
  | "provider_handoff_request";

export type StreamRoomEventPriority = "low" | "normal" | "high" | "critical";
export type StreamRoomEventStatus =
  | "queued_local"
  | "acked_local"
  | "retry_scheduled_local"
  | "blocked_provider_required"
  | "dropped_local";

export type StreamRoomEventQueueBlockerCode =
  | "room_required"
  | "event_payload_required"
  | "local_queue_empty"
  | "backend_realtime_contract_required"
  | "socket_provider_required"
  | "event_persistence_required"
  | "admin_audit_sink_required"
  | "provider_flush_blocked"
  | "fake_realtime_forbidden";

export type StreamRoomEventPayloadValue = string | number | boolean | null;
export type StreamRoomEventPayload = Readonly<Record<string, StreamRoomEventPayloadValue>>;

export type StreamRoomEventQueueItem = {
  readonly id: string;
  readonly kind: StreamRoomEventKind;
  readonly label: string;
  readonly status: StreamRoomEventStatus;
  readonly priority: StreamRoomEventPriority;
  readonly roomId: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly attempts: number;
  readonly payload: StreamRoomEventPayload;
  readonly blockers: readonly StreamRoomEventQueueBlockerCode[];
  readonly localOnly: true;
  readonly deliveredToProvider: false;
};

export type StreamRoomEventQueueIntegration = {
  readonly backendRealtimeContract: "not_connected" | "connected";
  readonly socketProvider: "not_configured" | "configured";
  readonly eventPersistence: "local_memory_only" | "durable_connected";
  readonly adminAuditSink: "not_connected" | "connected";
  readonly fakeRealtimeDeliveryAllowed: false;
  readonly fakeBackendAckAllowed: false;
  readonly fakeProviderFlushAllowed: false;
};

export type StreamRoomEventQueueRuntimeState = {
  readonly version: "STREAM-109E";
  readonly queueId: string;
  readonly roomId: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly events: readonly StreamRoomEventQueueItem[];
  readonly lastAckedEventId: string | null;
  readonly providerFlushRequestedLocal: boolean;
  readonly offlineModeLocal: true;
  readonly integration: StreamRoomEventQueueIntegration;
};

export type StreamRoomEventQueueEvidenceSnapshot = {
  readonly version: "STREAM-109E";
  readonly queueId: string;
  readonly roomId: string;
  readonly totalEvents: number;
  readonly queuedEvents: number;
  readonly ackedLocalEvents: number;
  readonly retryScheduledEvents: number;
  readonly blockedProviderEvents: number;
  readonly droppedLocalEvents: number;
  readonly criticalEvents: number;
  readonly lastEventKind: StreamRoomEventKind | "none";
  readonly lastAckedEventId: string | null;
  readonly providerFlushRequestedLocal: boolean;
  readonly localBlockers: readonly StreamRoomEventQueueBlockerCode[];
  readonly providerBlockers: readonly StreamRoomEventQueueBlockerCode[];
  readonly backendRealtimeContract: StreamRoomEventQueueIntegration["backendRealtimeContract"];
  readonly socketProvider: StreamRoomEventQueueIntegration["socketProvider"];
  readonly eventPersistence: StreamRoomEventQueueIntegration["eventPersistence"];
  readonly adminAuditSink: StreamRoomEventQueueIntegration["adminAuditSink"];
  readonly fakeRealtimeDeliveryAllowed: false;
  readonly fakeBackendAckAllowed: false;
  readonly fakeProviderFlushAllowed: false;
  readonly readyForBackendUnion: boolean;
};

const MAX_EVENTS = 80;

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

function cleanLabel(value: string | null | undefined, fallback: string): string {
  const normalized = String(value ?? "").trim().replace(/\s+/g, " ");
  return normalized || fallback;
}

function normalizePayload(payload: StreamRoomEventPayload | null | undefined): StreamRoomEventPayload {
  const safePayload: Record<string, StreamRoomEventPayloadValue> = {};
  Object.entries(payload ?? {}).forEach(([key, value]) => {
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean" || value === null) {
      safePayload[key] = value;
    }
  });
  return safePayload;
}

function localBlockersForEvent(room: StreamRoomRuntimeState, payload: StreamRoomEventPayload): readonly StreamRoomEventQueueBlockerCode[] {
  const blockers: StreamRoomEventQueueBlockerCode[] = [];
  if (!room.roomId) blockers.push("room_required");
  if (Object.keys(payload).length === 0) blockers.push("event_payload_required");
  return blockers;
}

function providerBlockers(): readonly StreamRoomEventQueueBlockerCode[] {
  return [
    "backend_realtime_contract_required",
    "socket_provider_required",
    "event_persistence_required",
    "admin_audit_sink_required",
    "provider_flush_blocked",
    "fake_realtime_forbidden",
  ];
}

function defaultIntegration(): StreamRoomEventQueueIntegration {
  return {
    backendRealtimeContract: "not_connected",
    socketProvider: "not_configured",
    eventPersistence: "local_memory_only",
    adminAuditSink: "not_connected",
    fakeRealtimeDeliveryAllowed: false,
    fakeBackendAckAllowed: false,
    fakeProviderFlushAllowed: false,
  };
}

export function createInitialStreamRoomEventQueueState(room: StreamRoomRuntimeState, now?: Date | string | number): StreamRoomEventQueueRuntimeState {
  const createdAt = nowIso(now);
  return {
    version: "STREAM-109E",
    queueId: createId("stream-event-queue", now),
    roomId: room.roomId,
    createdAt,
    updatedAt: createdAt,
    events: [],
    lastAckedEventId: null,
    providerFlushRequestedLocal: false,
    offlineModeLocal: true,
    integration: defaultIntegration(),
  };
}

export function syncStreamRoomEventQueueState(
  state: StreamRoomEventQueueRuntimeState,
  room: StreamRoomRuntimeState,
  now?: Date | string | number,
): StreamRoomEventQueueRuntimeState {
  if (state.roomId === room.roomId) return state;
  return {
    ...state,
    roomId: room.roomId,
    updatedAt: nowIso(now),
    events: state.events.map((event) => ({ ...event, roomId: room.roomId })),
  };
}

export function enqueueLocalStreamRoomEvent(
  state: StreamRoomEventQueueRuntimeState,
  room: StreamRoomRuntimeState,
  event: {
    readonly kind: StreamRoomEventKind;
    readonly label: string;
    readonly priority?: StreamRoomEventPriority;
    readonly payload: StreamRoomEventPayload;
  },
  now?: Date | string | number,
): StreamRoomEventQueueRuntimeState {
  const createdAt = nowIso(now);
  const payload = normalizePayload(event.payload);
  const localBlockers = localBlockersForEvent(room, payload);
  const item: StreamRoomEventQueueItem = {
    id: createId(`stream-${event.kind}`, now),
    kind: event.kind,
    label: cleanLabel(event.label, event.kind),
    status: localBlockers.length > 0 ? "blocked_provider_required" : "queued_local",
    priority: event.priority ?? "normal",
    roomId: room.roomId,
    createdAt,
    updatedAt: createdAt,
    attempts: 0,
    payload,
    blockers: localBlockers.length > 0 ? [...localBlockers, ...providerBlockers()] : providerBlockers(),
    localOnly: true,
    deliveredToProvider: false,
  };
  return {
    ...state,
    roomId: room.roomId,
    updatedAt: createdAt,
    events: [item, ...state.events].slice(0, MAX_EVENTS),
  };
}

export function enqueueStreamRoomLifecycleEvent(
  state: StreamRoomEventQueueRuntimeState,
  room: StreamRoomRuntimeState,
): StreamRoomEventQueueRuntimeState {
  return enqueueLocalStreamRoomEvent(state, room, {
    kind: "room_lifecycle",
    label: `Room lifecycle: ${room.status}`,
    priority: room.status === "provider_handoff_blocked" ? "critical" : "high",
    payload: {
      roomId: room.roomId,
      status: room.status,
      mode: room.mode,
      title: room.title,
      topic: room.topic,
      fakeOnAirAllowed: false,
    },
  });
}

export function enqueueStreamParticipantEvent(
  state: StreamRoomEventQueueRuntimeState,
  room: StreamRoomRuntimeState,
  participantId: string | null,
): StreamRoomEventQueueRuntimeState {
  const participant = room.participants.find((item) => item.id === participantId) ?? room.participants[0];
  return enqueueLocalStreamRoomEvent(state, room, {
    kind: "participant",
    label: participant ? `Participant ${participant.role}: ${participant.displayName}` : "Participant event",
    priority: "normal",
    payload: {
      participantId: participant?.id ?? null,
      displayName: participant?.displayName ?? null,
      role: participant?.role ?? null,
      muted: participant?.muted ?? false,
      blocked: participant?.blocked ?? false,
    },
  });
}

export function enqueueStreamCommentEvent(
  state: StreamRoomEventQueueRuntimeState,
  room: StreamRoomRuntimeState,
  commentId: string | null,
): StreamRoomEventQueueRuntimeState {
  const comment = room.comments.find((item) => item.id === commentId) ?? room.comments[0];
  return enqueueLocalStreamRoomEvent(state, room, {
    kind: "comment",
    label: comment ? `Comment: ${comment.text.slice(0, 36)}` : "Comment event",
    priority: comment?.status === "moderation_blocked" ? "high" : "normal",
    payload: {
      commentId: comment?.id ?? null,
      participantId: comment?.participantId ?? null,
      status: comment?.status ?? null,
      textLength: comment?.text.length ?? 0,
      deliveredToProvider: false,
    },
  });
}

export function enqueueStreamBattleEvent(
  state: StreamRoomEventQueueRuntimeState,
  room: StreamRoomRuntimeState,
): StreamRoomEventQueueRuntimeState {
  return enqueueLocalStreamRoomEvent(state, room, {
    kind: "battle",
    label: room.battle ? `Battle: ${room.battle.topic}` : "Battle event",
    priority: "high",
    payload: {
      battleId: room.battle?.id ?? null,
      opponentName: room.battle?.opponentName ?? null,
      battleStatus: room.battle?.status ?? "none",
      scoreHost: room.battle?.scoreHost ?? 0,
      scoreOpponent: room.battle?.scoreOpponent ?? 0,
      fakeWinnerAllowed: false,
    },
  });
}

export function enqueueStreamBroadcastSourceEvent(
  state: StreamRoomEventQueueRuntimeState,
  room: StreamRoomRuntimeState,
): StreamRoomEventQueueRuntimeState {
  return enqueueLocalStreamRoomEvent(state, room, {
    kind: "broadcast_source",
    label: `Broadcast source: ${room.broadcast.source ?? "none"}`,
    priority: "normal",
    payload: {
      source: room.broadcast.source,
      cameraEnabled: room.broadcast.cameraEnabled,
      microphoneEnabled: room.broadcast.microphoneEnabled,
      screenShareIntent: room.broadcast.screenShareIntent,
      gameCaptureIntent: room.broadcast.gameCaptureIntent,
      videoFileIntent: room.broadcast.videoFileIntent,
      externalRtmpIntent: room.broadcast.externalRtmpIntent,
    },
  });
}

function updateEvent(
  state: StreamRoomEventQueueRuntimeState,
  eventId: string | null,
  updater: (event: StreamRoomEventQueueItem, now: string) => StreamRoomEventQueueItem,
): StreamRoomEventQueueRuntimeState {
  const targetId = eventId ?? state.events.find((event) => event.status === "queued_local" || event.status === "retry_scheduled_local")?.id ?? state.events[0]?.id ?? null;
  if (!targetId) return state;
  const updatedAt = nowIso();
  return {
    ...state,
    updatedAt,
    events: state.events.map((event) => event.id === targetId ? updater(event, updatedAt) : event),
  };
}

export function ackLocalStreamRoomEvent(state: StreamRoomEventQueueRuntimeState, eventId: string | null = null): StreamRoomEventQueueRuntimeState {
  let ackedId = state.lastAckedEventId;
  const next = updateEvent(state, eventId, (event, updatedAt) => {
    ackedId = event.id;
    return { ...event, status: "acked_local", updatedAt, attempts: event.attempts + 1 };
  });
  return { ...next, lastAckedEventId: ackedId };
}

export function retryLocalStreamRoomEvent(state: StreamRoomEventQueueRuntimeState, eventId: string | null = null): StreamRoomEventQueueRuntimeState {
  return updateEvent(state, eventId, (event, updatedAt) => ({ ...event, status: "retry_scheduled_local", updatedAt, attempts: event.attempts + 1 }));
}

export function dropLocalStreamRoomEvent(state: StreamRoomEventQueueRuntimeState, eventId: string | null = null): StreamRoomEventQueueRuntimeState {
  return updateEvent(state, eventId, (event, updatedAt) => ({ ...event, status: "dropped_local", updatedAt }));
}

export function requestStreamRoomEventProviderFlushBlocked(state: StreamRoomEventQueueRuntimeState): StreamRoomEventQueueRuntimeState {
  const updatedAt = nowIso();
  return {
    ...state,
    updatedAt,
    providerFlushRequestedLocal: true,
    events: state.events.map((event) =>
      event.status === "queued_local" || event.status === "retry_scheduled_local"
        ? { ...event, status: "blocked_provider_required", updatedAt, blockers: Array.from(new Set([...event.blockers, ...providerBlockers()])) }
        : event,
    ),
  };
}

function unique(values: readonly StreamRoomEventQueueBlockerCode[]): readonly StreamRoomEventQueueBlockerCode[] {
  return Array.from(new Set(values));
}

export function buildStreamRoomEventQueueEvidenceSnapshot(state: StreamRoomEventQueueRuntimeState): StreamRoomEventQueueEvidenceSnapshot {
  const localBlockers: StreamRoomEventQueueBlockerCode[] = [];
  if (state.events.length === 0) localBlockers.push("local_queue_empty");
  const provider = providerBlockers();
  const queuedEvents = state.events.filter((event) => event.status === "queued_local").length;
  const ackedLocalEvents = state.events.filter((event) => event.status === "acked_local").length;
  const retryScheduledEvents = state.events.filter((event) => event.status === "retry_scheduled_local").length;
  const blockedProviderEvents = state.events.filter((event) => event.status === "blocked_provider_required").length;
  const droppedLocalEvents = state.events.filter((event) => event.status === "dropped_local").length;
  return {
    version: "STREAM-109E",
    queueId: state.queueId,
    roomId: state.roomId,
    totalEvents: state.events.length,
    queuedEvents,
    ackedLocalEvents,
    retryScheduledEvents,
    blockedProviderEvents,
    droppedLocalEvents,
    criticalEvents: state.events.filter((event) => event.priority === "critical").length,
    lastEventKind: state.events[0]?.kind ?? "none",
    lastAckedEventId: state.lastAckedEventId,
    providerFlushRequestedLocal: state.providerFlushRequestedLocal,
    localBlockers: unique(localBlockers),
    providerBlockers: unique(provider),
    backendRealtimeContract: state.integration.backendRealtimeContract,
    socketProvider: state.integration.socketProvider,
    eventPersistence: state.integration.eventPersistence,
    adminAuditSink: state.integration.adminAuditSink,
    fakeRealtimeDeliveryAllowed: false,
    fakeBackendAckAllowed: false,
    fakeProviderFlushAllowed: false,
    readyForBackendUnion: state.events.length > 0 && provider.length > 0,
  };
}
