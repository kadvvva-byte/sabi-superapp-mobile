import type { StreamRoomRuntimeState } from "./streamRoomRuntime";
import {
  enqueueLocalStreamRoomEvent,
  enqueueStreamBattleEvent,
  enqueueStreamBroadcastSourceEvent,
  enqueueStreamCommentEvent,
  enqueueStreamParticipantEvent,
  enqueueStreamRoomLifecycleEvent,
  type StreamRoomEventKind,
  type StreamRoomEventQueueRuntimeState,
} from "./streamRoomEventQueueRuntime";

export type StreamRoomLifecycleWiringStepId =
  | "room_create"
  | "host_join"
  | "viewer_join"
  | "comment_add"
  | "cohost_invite"
  | "battle_prepare"
  | "source_select"
  | "room_end";

export type StreamRoomLifecycleWiringStepStatus =
  | "not_applicable_local"
  | "waiting_local_action"
  | "event_missing_local"
  | "event_queued_local"
  | "provider_blocked";

export type StreamRoomLifecycleWiringBlockerCode =
  | "room_contract_required"
  | "host_required"
  | "viewer_required"
  | "comment_required"
  | "cohost_invite_required"
  | "battle_draft_required"
  | "broadcast_source_required"
  | "end_state_required"
  | "local_event_missing"
  | "backend_room_lifecycle_required"
  | "realtime_event_contract_required"
  | "provider_room_state_required"
  | "admin_audit_required"
  | "fake_lifecycle_success_forbidden";

export type StreamRoomLifecycleWiringStep = {
  readonly id: StreamRoomLifecycleWiringStepId;
  readonly label: string;
  readonly expectedEventKind: StreamRoomEventKind;
  readonly status: StreamRoomLifecycleWiringStepStatus;
  readonly blockers: readonly StreamRoomLifecycleWiringBlockerCode[];
  readonly readyLocal: boolean;
  readonly queuedLocal: boolean;
  readonly providerRequired: true;
};

export type StreamRoomLifecycleWiringRuntimeState = {
  readonly version: "STREAM-109F";
  readonly roomId: string;
  readonly checkedAt: string;
  readonly providerHandoffRequestedLocal: boolean;
  readonly sequence: readonly StreamRoomLifecycleWiringStep[];
  readonly integration: {
    readonly backendRoomLifecycle: "not_connected" | "connected";
    readonly realtimeEventContract: "not_connected" | "connected";
    readonly providerRoomState: "not_configured" | "configured";
    readonly adminAudit: "not_connected" | "connected";
    readonly fakeLifecycleSuccessAllowed: false;
    readonly fakeOnAirAllowed: false;
    readonly fakeProviderAckAllowed: false;
  };
};

export type StreamRoomLifecycleWiringEvidenceSnapshot = {
  readonly version: "STREAM-109F";
  readonly roomId: string;
  readonly checkedAt: string;
  readonly stepsTotal: number;
  readonly readyLocalSteps: number;
  readonly queuedLocalSteps: number;
  readonly missingLocalEvents: number;
  readonly waitingLocalActions: number;
  readonly providerBlockedSteps: number;
  readonly expectedSequence: readonly StreamRoomLifecycleWiringStepId[];
  readonly missingStepIds: readonly StreamRoomLifecycleWiringStepId[];
  readonly queuedStepIds: readonly StreamRoomLifecycleWiringStepId[];
  readonly localBlockers: readonly StreamRoomLifecycleWiringBlockerCode[];
  readonly providerBlockers: readonly StreamRoomLifecycleWiringBlockerCode[];
  readonly backendRoomLifecycle: "not_connected" | "connected";
  readonly realtimeEventContract: "not_connected" | "connected";
  readonly providerRoomState: "not_configured" | "configured";
  readonly adminAudit: "not_connected" | "connected";
  readonly fakeLifecycleSuccessAllowed: false;
  readonly fakeOnAirAllowed: false;
  readonly fakeProviderAckAllowed: false;
  readonly readyForBackendUnion: boolean;
};

function nowIso(now?: Date | string | number): string {
  if (now instanceof Date) return now.toISOString();
  if (typeof now === "string") return new Date(now).toISOString();
  if (typeof now === "number") return new Date(now).toISOString();
  return new Date().toISOString();
}

function providerBlockers(): readonly StreamRoomLifecycleWiringBlockerCode[] {
  return [
    "backend_room_lifecycle_required",
    "realtime_event_contract_required",
    "provider_room_state_required",
    "admin_audit_required",
    "fake_lifecycle_success_forbidden",
  ];
}

function queueHas(queue: StreamRoomEventQueueRuntimeState, kind: StreamRoomEventKind, predicate?: (payload: Readonly<Record<string, string | number | boolean | null>>) => boolean): boolean {
  return queue.events.some((event) => event.kind === kind && event.status !== "dropped_local" && (!predicate || predicate(event.payload)));
}

function unique(values: readonly StreamRoomLifecycleWiringBlockerCode[]): readonly StreamRoomLifecycleWiringBlockerCode[] {
  return Array.from(new Set(values));
}

function makeStep(input: {
  readonly id: StreamRoomLifecycleWiringStepId;
  readonly label: string;
  readonly expectedEventKind: StreamRoomEventKind;
  readonly readyLocal: boolean;
  readonly queuedLocal: boolean;
  readonly waitingBlocker: StreamRoomLifecycleWiringBlockerCode;
  readonly providerHandoffRequestedLocal: boolean;
}): StreamRoomLifecycleWiringStep {
  const localBlockers: StreamRoomLifecycleWiringBlockerCode[] = [];
  if (!input.readyLocal) localBlockers.push(input.waitingBlocker);
  if (input.readyLocal && !input.queuedLocal) localBlockers.push("local_event_missing");
  const status: StreamRoomLifecycleWiringStepStatus = !input.readyLocal
    ? "waiting_local_action"
    : input.providerHandoffRequestedLocal
      ? "provider_blocked"
      : input.queuedLocal
        ? "event_queued_local"
        : "event_missing_local";
  return {
    id: input.id,
    label: input.label,
    expectedEventKind: input.expectedEventKind,
    status,
    blockers: unique([...localBlockers, ...providerBlockers()]),
    readyLocal: input.readyLocal,
    queuedLocal: input.queuedLocal,
    providerRequired: true,
  };
}

export function createInitialStreamRoomLifecycleWiringState(
  room: StreamRoomRuntimeState,
  queue: StreamRoomEventQueueRuntimeState,
  now?: Date | string | number,
): StreamRoomLifecycleWiringRuntimeState {
  return syncStreamRoomLifecycleWiringState({
    version: "STREAM-109F",
    roomId: room.roomId,
    checkedAt: nowIso(now),
    providerHandoffRequestedLocal: false,
    sequence: [],
    integration: {
      backendRoomLifecycle: "not_connected",
      realtimeEventContract: "not_connected",
      providerRoomState: "not_configured",
      adminAudit: "not_connected",
      fakeLifecycleSuccessAllowed: false,
      fakeOnAirAllowed: false,
      fakeProviderAckAllowed: false,
    },
  }, room, queue, now);
}

export function syncStreamRoomLifecycleWiringState(
  state: StreamRoomLifecycleWiringRuntimeState,
  room: StreamRoomRuntimeState,
  queue: StreamRoomEventQueueRuntimeState,
  now?: Date | string | number,
): StreamRoomLifecycleWiringRuntimeState {
  const hasRoomEvent = queueHas(queue, "room_lifecycle");
  const hasHostEvent = queueHas(queue, "participant", (payload) => payload.role === "host");
  const hasViewerEvent = queueHas(queue, "participant", (payload) => payload.role === "viewer" || payload.role === "cohost" || payload.role === "moderator");
  const hasCommentEvent = queueHas(queue, "comment");
  const hasCohostEvent = queueHas(queue, "cohost") || queueHas(queue, "participant", (payload) => payload.role === "cohost");
  const hasBattleEvent = queueHas(queue, "battle");
  const hasSourceEvent = queueHas(queue, "broadcast_source");
  const hasEndEvent = queueHas(queue, "room_lifecycle", (payload) => payload.status === "ended");
  const hasViewer = room.participants.some((participant) => participant.role === "viewer" || participant.role === "cohost" || participant.role === "moderator");
  const hasCohost = room.cohostInvites.length > 0 || room.participants.some((participant) => participant.role === "cohost");
  const sequence: StreamRoomLifecycleWiringStep[] = [
    makeStep({ id: "room_create", label: "Create local room", expectedEventKind: "room_lifecycle", readyLocal: room.status !== "draft", queuedLocal: hasRoomEvent, waitingBlocker: "room_contract_required", providerHandoffRequestedLocal: state.providerHandoffRequestedLocal }),
    makeStep({ id: "host_join", label: "Host participant ready", expectedEventKind: "participant", readyLocal: Boolean(room.hostId), queuedLocal: hasHostEvent, waitingBlocker: "host_required", providerHandoffRequestedLocal: state.providerHandoffRequestedLocal }),
    makeStep({ id: "viewer_join", label: "Viewer/co-host participant ready", expectedEventKind: "participant", readyLocal: hasViewer, queuedLocal: hasViewerEvent, waitingBlocker: "viewer_required", providerHandoffRequestedLocal: state.providerHandoffRequestedLocal }),
    makeStep({ id: "comment_add", label: "Comment action ready", expectedEventKind: "comment", readyLocal: room.comments.length > 0, queuedLocal: hasCommentEvent, waitingBlocker: "comment_required", providerHandoffRequestedLocal: state.providerHandoffRequestedLocal }),
    makeStep({ id: "cohost_invite", label: "Co-host invite action ready", expectedEventKind: "cohost", readyLocal: hasCohost, queuedLocal: hasCohostEvent, waitingBlocker: "cohost_invite_required", providerHandoffRequestedLocal: state.providerHandoffRequestedLocal }),
    makeStep({ id: "battle_prepare", label: "Battle draft action ready", expectedEventKind: "battle", readyLocal: Boolean(room.battle), queuedLocal: hasBattleEvent, waitingBlocker: "battle_draft_required", providerHandoffRequestedLocal: state.providerHandoffRequestedLocal }),
    makeStep({ id: "source_select", label: "Broadcast source selected", expectedEventKind: "broadcast_source", readyLocal: Boolean(room.broadcast.source), queuedLocal: hasSourceEvent, waitingBlocker: "broadcast_source_required", providerHandoffRequestedLocal: state.providerHandoffRequestedLocal }),
    makeStep({ id: "room_end", label: "Room end action recorded", expectedEventKind: "room_lifecycle", readyLocal: room.status === "ended", queuedLocal: hasEndEvent, waitingBlocker: "end_state_required", providerHandoffRequestedLocal: state.providerHandoffRequestedLocal }),
  ];
  return {
    ...state,
    roomId: room.roomId,
    checkedAt: nowIso(now),
    sequence,
  };
}

export function queueMissingStreamRoomLifecycleWireEvents(
  state: StreamRoomLifecycleWiringRuntimeState,
  queue: StreamRoomEventQueueRuntimeState,
  room: StreamRoomRuntimeState,
): { readonly state: StreamRoomLifecycleWiringRuntimeState; readonly eventQueue: StreamRoomEventQueueRuntimeState } {
  const synced = syncStreamRoomLifecycleWiringState(state, room, queue);
  let nextQueue = queue;
  synced.sequence.forEach((step) => {
    if (!step.readyLocal || step.queuedLocal) return;
    if (step.id === "room_create" || step.id === "room_end") nextQueue = enqueueStreamRoomLifecycleEvent(nextQueue, room);
    if (step.id === "host_join") nextQueue = enqueueStreamParticipantEvent(nextQueue, room, room.hostId);
    if (step.id === "viewer_join") nextQueue = enqueueStreamParticipantEvent(nextQueue, room, room.participants.find((participant) => participant.role !== "host")?.id ?? null);
    if (step.id === "comment_add") nextQueue = enqueueStreamCommentEvent(nextQueue, room, room.comments[0]?.id ?? null);
    if (step.id === "cohost_invite") nextQueue = enqueueLocalStreamRoomEvent(nextQueue, room, {
      kind: "cohost",
      label: "Co-host lifecycle wire",
      priority: "normal",
      payload: {
        cohostInvites: room.cohostInvites.length,
        cohosts: room.participants.filter((participant) => participant.role === "cohost").length,
        providerRequired: true,
      },
    });
    if (step.id === "battle_prepare") nextQueue = enqueueStreamBattleEvent(nextQueue, room);
    if (step.id === "source_select") nextQueue = enqueueStreamBroadcastSourceEvent(nextQueue, room);
  });
  return {
    eventQueue: nextQueue,
    state: syncStreamRoomLifecycleWiringState(synced, room, nextQueue),
  };
}

export function requestStreamRoomLifecycleWiringProviderBlocked(
  state: StreamRoomLifecycleWiringRuntimeState,
  room: StreamRoomRuntimeState,
  queue: StreamRoomEventQueueRuntimeState,
): StreamRoomLifecycleWiringRuntimeState {
  return syncStreamRoomLifecycleWiringState({ ...state, providerHandoffRequestedLocal: true }, room, queue);
}

export function buildStreamRoomLifecycleWiringEvidenceSnapshot(state: StreamRoomLifecycleWiringRuntimeState): StreamRoomLifecycleWiringEvidenceSnapshot {
  const localBlockers = unique(state.sequence.flatMap((step) => step.blockers.filter((blocker) => !providerBlockers().includes(blocker))));
  const provider = providerBlockers();
  const missingStepIds = state.sequence.filter((step) => step.readyLocal && !step.queuedLocal).map((step) => step.id);
  const queuedStepIds = state.sequence.filter((step) => step.queuedLocal).map((step) => step.id);
  return {
    version: "STREAM-109F",
    roomId: state.roomId,
    checkedAt: state.checkedAt,
    stepsTotal: state.sequence.length,
    readyLocalSteps: state.sequence.filter((step) => step.readyLocal).length,
    queuedLocalSteps: queuedStepIds.length,
    missingLocalEvents: missingStepIds.length,
    waitingLocalActions: state.sequence.filter((step) => step.status === "waiting_local_action").length,
    providerBlockedSteps: state.sequence.filter((step) => step.status === "provider_blocked").length,
    expectedSequence: state.sequence.map((step) => step.id),
    missingStepIds,
    queuedStepIds,
    localBlockers,
    providerBlockers: provider,
    backendRoomLifecycle: state.integration.backendRoomLifecycle,
    realtimeEventContract: state.integration.realtimeEventContract,
    providerRoomState: state.integration.providerRoomState,
    adminAudit: state.integration.adminAudit,
    fakeLifecycleSuccessAllowed: false,
    fakeOnAirAllowed: false,
    fakeProviderAckAllowed: false,
    readyForBackendUnion: state.sequence.some((step) => step.queuedLocal) && provider.length > 0,
  };
}
