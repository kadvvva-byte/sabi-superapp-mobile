import type { StreamRoomRuntimeState } from "./streamRoomRuntime";
import type { StreamRoomStageRuntimeState } from "./streamRoomStageRuntime";
import type { StreamRoomRecoveryRuntimeState } from "./streamRoomRecoveryRuntime";
import { enqueueLocalStreamRoomEvent, type StreamRoomEventQueueRuntimeState } from "./streamRoomEventQueueRuntime";

export type StreamHostControlId =
  | "host_connection"
  | "host_camera"
  | "host_microphone"
  | "comments"
  | "participants"
  | "cohost"
  | "battle"
  | "broadcast_source"
  | "stage_layout"
  | "recovery";

export type StreamHostControlStatus =
  | "healthy_local"
  | "warning_local"
  | "degraded_local"
  | "critical_local"
  | "recovered_local"
  | "provider_recovery_blocked";

export type StreamHostRoomSafetyState = "normal_local" | "safe_pause_local" | "resume_requested_local" | "provider_recovery_blocked";

export type StreamHostControlsBlockerCode =
  | "host_room_required"
  | "host_participant_required"
  | "host_connection_unstable"
  | "host_camera_degraded"
  | "host_microphone_degraded"
  | "comments_interaction_degraded"
  | "participant_presence_degraded"
  | "cohost_stage_degraded"
  | "battle_flow_degraded"
  | "broadcast_source_degraded"
  | "stage_layout_degraded"
  | "recovery_sequence_required"
  | "host_control_event_queue_required"
  | "backend_host_control_contract_required"
  | "realtime_host_control_provider_required"
  | "admin_host_control_audit_required"
  | "fake_host_recovery_forbidden";

export type StreamHostControlRecord = {
  readonly id: StreamHostControlId;
  readonly label: string;
  readonly status: StreamHostControlStatus;
  readonly lastCheckedAt: string;
  readonly recoveredAt: string | null;
  readonly localBlockers: readonly StreamHostControlsBlockerCode[];
  readonly providerBlockers: readonly StreamHostControlsBlockerCode[];
  readonly localOnly: true;
  readonly deliveredToProvider: false;
};

export type StreamHostControlsIntegration = {
  readonly backendHostControlContract: "not_connected" | "connected";
  readonly realtimeHostControlProvider: "not_configured" | "configured";
  readonly adminHostControlAudit: "not_connected" | "connected";
  readonly fakeHostRecoveryAllowed: false;
  readonly fakeProviderControlAllowed: false;
  readonly fakeOnAirAllowed: false;
};

export type StreamHostControlsRuntimeState = {
  readonly version: "STREAM-109J";
  readonly roomId: string;
  readonly selectedControlId: StreamHostControlId;
  readonly safetyState: StreamHostRoomSafetyState;
  readonly hostRecoveryRequestedLocal: boolean;
  readonly providerRecoveryRequestedLocal: boolean;
  readonly controls: readonly StreamHostControlRecord[];
  readonly queuedHostControlEvents: number;
  readonly integration: StreamHostControlsIntegration;
  readonly updatedAt: string;
};

export type StreamHostControlsEvidenceSnapshot = {
  readonly version: "STREAM-109J";
  readonly roomId: string;
  readonly safetyState: StreamHostRoomSafetyState;
  readonly selectedControlId: StreamHostControlId;
  readonly totalControls: number;
  readonly healthyControls: number;
  readonly warningControls: number;
  readonly degradedControls: number;
  readonly criticalControls: number;
  readonly recoveredControls: number;
  readonly providerBlockedControls: number;
  readonly queuedHostControlEvents: number;
  readonly hostRecoveryRequestedLocal: boolean;
  readonly providerRecoveryRequestedLocal: boolean;
  readonly localBlockers: readonly StreamHostControlsBlockerCode[];
  readonly providerBlockers: readonly StreamHostControlsBlockerCode[];
  readonly backendHostControlContract: StreamHostControlsIntegration["backendHostControlContract"];
  readonly realtimeHostControlProvider: StreamHostControlsIntegration["realtimeHostControlProvider"];
  readonly adminHostControlAudit: StreamHostControlsIntegration["adminHostControlAudit"];
  readonly fakeHostRecoveryAllowed: false;
  readonly fakeProviderControlAllowed: false;
  readonly fakeOnAirAllowed: false;
  readonly readyForBackendUnion: boolean;
};

type SourceContext = {
  readonly room: StreamRoomRuntimeState;
  readonly stage: StreamRoomStageRuntimeState;
  readonly recovery: StreamRoomRecoveryRuntimeState;
};

const CONTROL_LABELS: Record<StreamHostControlId, string> = {
  host_connection: "Host connection",
  host_camera: "Host camera",
  host_microphone: "Host microphone",
  comments: "Comments",
  participants: "Participants",
  cohost: "Co-host stage",
  battle: "Battle flow",
  broadcast_source: "Broadcast source",
  stage_layout: "Stage layout",
  recovery: "Recovery",
};

const CONTROL_IDS: readonly StreamHostControlId[] = [
  "host_connection",
  "host_camera",
  "host_microphone",
  "comments",
  "participants",
  "cohost",
  "battle",
  "broadcast_source",
  "stage_layout",
  "recovery",
];

function nowIso(now?: Date | string | number): string {
  if (now instanceof Date) return now.toISOString();
  if (typeof now === "string") return new Date(now).toISOString();
  if (typeof now === "number") return new Date(now).toISOString();
  return new Date().toISOString();
}

function defaultIntegration(): StreamHostControlsIntegration {
  return {
    backendHostControlContract: "not_connected",
    realtimeHostControlProvider: "not_configured",
    adminHostControlAudit: "not_connected",
    fakeHostRecoveryAllowed: false,
    fakeProviderControlAllowed: false,
    fakeOnAirAllowed: false,
  };
}

function providerBlockers(): readonly StreamHostControlsBlockerCode[] {
  return [
    "backend_host_control_contract_required",
    "realtime_host_control_provider_required",
    "admin_host_control_audit_required",
    "fake_host_recovery_forbidden",
  ];
}

function hostExists(room: StreamRoomRuntimeState): boolean {
  return room.participants.some((participant) => participant.role === "host" && !participant.blocked);
}

function blockersForControl(id: StreamHostControlId, context: SourceContext): readonly StreamHostControlsBlockerCode[] {
  const blockers: StreamHostControlsBlockerCode[] = [];
  const { room, stage, recovery } = context;
  if (!room.roomId) blockers.push("host_room_required");
  if (!hostExists(room)) blockers.push("host_participant_required");
  if (id === "host_connection" && recovery.hostReconnectRequestedLocal && recovery.checkpoints.some((checkpoint) => checkpoint.id === "host_session" && checkpoint.status !== "verified_local")) blockers.push("host_connection_unstable");
  if (id === "host_camera" && room.broadcast.source === "camera" && !room.broadcast.cameraEnabled) blockers.push("host_camera_degraded");
  if (id === "host_microphone" && (room.broadcast.source === "microphone" || room.mode === "audioLive") && !room.broadcast.microphoneEnabled) blockers.push("host_microphone_degraded");
  if (id === "comments" && !stage.commentsVisible) blockers.push("comments_interaction_degraded");
  if (id === "participants" && !stage.participantsVisible) blockers.push("participant_presence_degraded");
  if (id === "cohost" && room.mode === "groupLive" && room.participants.filter((participant) => participant.role === "cohost" && !participant.blocked).length < 1) blockers.push("cohost_stage_degraded");
  if (id === "battle" && Boolean(room.battle) && !stage.battleOverlayVisible) blockers.push("battle_flow_degraded");
  if (id === "broadcast_source" && !room.broadcast.source) blockers.push("broadcast_source_degraded");
  if (id === "stage_layout" && (stage.status === "idle_local" || stage.status === "ended_local")) blockers.push("stage_layout_degraded");
  if (id === "recovery" && recovery.checkpoints.some((checkpoint) => checkpoint.blockers.length > 0)) blockers.push("recovery_sequence_required");
  return Array.from(new Set(blockers));
}

function statusFor(blockers: readonly StreamHostControlsBlockerCode[], id: StreamHostControlId, context: SourceContext): StreamHostControlStatus {
  if (blockers.length === 0) return "healthy_local";
  if (id === "recovery" || id === "host_connection") return "critical_local";
  if (context.room.status === "provider_handoff_blocked" || context.stage.status === "broadcast_handoff_blocked") return "degraded_local";
  return "warning_local";
}

function buildControls(context: SourceContext, previous: readonly StreamHostControlRecord[] = [], now?: Date | string | number): readonly StreamHostControlRecord[] {
  const checkedAt = nowIso(now);
  return CONTROL_IDS.map((id) => {
    const prior = previous.find((item) => item.id === id);
    const blockers = blockersForControl(id, context);
    const status = prior?.status === "recovered_local" && blockers.length === 0 ? "recovered_local" : statusFor(blockers, id, context);
    return {
      id,
      label: CONTROL_LABELS[id],
      status,
      lastCheckedAt: checkedAt,
      recoveredAt: status === "recovered_local" ? prior?.recoveredAt ?? checkedAt : null,
      localBlockers: blockers,
      providerBlockers: providerBlockers(),
      localOnly: true,
      deliveredToProvider: false,
    };
  });
}

function selectedControl(state: StreamHostControlsRuntimeState): StreamHostControlRecord {
  return state.controls.find((control) => control.id === state.selectedControlId) ?? state.controls[0];
}

export function createInitialStreamHostControlsState(
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  recovery: StreamRoomRecoveryRuntimeState,
  now?: Date | string | number,
): StreamHostControlsRuntimeState {
  const controls = buildControls({ room, stage, recovery }, [], now);
  return {
    version: "STREAM-109J",
    roomId: room.roomId,
    selectedControlId: "host_connection",
    safetyState: "normal_local",
    hostRecoveryRequestedLocal: false,
    providerRecoveryRequestedLocal: false,
    controls,
    queuedHostControlEvents: 0,
    integration: defaultIntegration(),
    updatedAt: nowIso(now),
  };
}

export function syncStreamHostControlsState(
  state: StreamHostControlsRuntimeState,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  recovery: StreamRoomRecoveryRuntimeState,
): StreamHostControlsRuntimeState {
  const controls = buildControls({ room, stage, recovery }, state.controls);
  return {
    ...state,
    roomId: room.roomId,
    controls,
    updatedAt: nowIso(),
  };
}

export function selectStreamHostControl(state: StreamHostControlsRuntimeState, controlId: StreamHostControlId): StreamHostControlsRuntimeState {
  return { ...state, selectedControlId: controlId, updatedAt: nowIso() };
}

export function runStreamHostDegradedStateCheck(
  state: StreamHostControlsRuntimeState,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  recovery: StreamRoomRecoveryRuntimeState,
): StreamHostControlsRuntimeState {
  const controls = buildControls({ room, stage, recovery }, state.controls);
  const critical = controls.some((control) => control.status === "critical_local");
  const degraded = controls.some((control) => control.status === "degraded_local" || control.status === "warning_local");
  return {
    ...state,
    roomId: room.roomId,
    controls,
    safetyState: critical ? "safe_pause_local" : degraded ? "normal_local" : state.safetyState === "safe_pause_local" ? "resume_requested_local" : state.safetyState,
    updatedAt: nowIso(),
  };
}

export function requestStreamHostSafePauseLocal(state: StreamHostControlsRuntimeState): StreamHostControlsRuntimeState {
  return { ...state, safetyState: "safe_pause_local", hostRecoveryRequestedLocal: true, updatedAt: nowIso() };
}

export function requestStreamHostResumeLocal(state: StreamHostControlsRuntimeState): StreamHostControlsRuntimeState {
  return { ...state, safetyState: "resume_requested_local", updatedAt: nowIso() };
}

export function markSelectedStreamHostControlRecoveredLocal(state: StreamHostControlsRuntimeState): StreamHostControlsRuntimeState {
  const updatedAt = nowIso();
  return {
    ...state,
    updatedAt,
    controls: state.controls.map((control) => control.id === state.selectedControlId ? { ...control, status: "recovered_local", recoveredAt: updatedAt, lastCheckedAt: updatedAt } : control),
  };
}

export function requestStreamHostProviderRecoveryBlocked(state: StreamHostControlsRuntimeState): StreamHostControlsRuntimeState {
  const updatedAt = nowIso();
  return {
    ...state,
    safetyState: "provider_recovery_blocked",
    providerRecoveryRequestedLocal: true,
    updatedAt,
    controls: state.controls.map((control) => control.id === state.selectedControlId ? { ...control, status: "provider_recovery_blocked", lastCheckedAt: updatedAt } : control),
  };
}

export function queueStreamHostControlEvent(
  state: StreamHostControlsRuntimeState,
  queue: StreamRoomEventQueueRuntimeState,
  room: StreamRoomRuntimeState,
): { readonly state: StreamHostControlsRuntimeState; readonly queue: StreamRoomEventQueueRuntimeState } {
  const control = selectedControl(state);
  const nextQueue = enqueueLocalStreamRoomEvent(queue, room, {
    kind: "stage",
    label: `Host control: ${control.id} ${control.status}`,
    priority: control.status === "critical_local" || control.status === "provider_recovery_blocked" ? "critical" : "high",
    payload: {
      controlId: control.id,
      controlStatus: control.status,
      safetyState: state.safetyState,
      localBlockers: control.localBlockers.length,
      providerBlockers: control.providerBlockers.length,
      fakeHostRecoveryAllowed: false,
      fakeProviderControlAllowed: false,
      fakeOnAirAllowed: false,
    },
  });
  return {
    state: { ...state, queuedHostControlEvents: state.queuedHostControlEvents + 1, updatedAt: nowIso() },
    queue: nextQueue,
  };
}

export function buildStreamHostControlsEvidenceSnapshot(state: StreamHostControlsRuntimeState): StreamHostControlsEvidenceSnapshot {
  const localBlockers = Array.from(new Set(state.controls.flatMap((control) => control.localBlockers)));
  if (state.queuedHostControlEvents === 0) localBlockers.push("host_control_event_queue_required");
  const provider = providerBlockers();
  return {
    version: "STREAM-109J",
    roomId: state.roomId,
    safetyState: state.safetyState,
    selectedControlId: state.selectedControlId,
    totalControls: state.controls.length,
    healthyControls: state.controls.filter((control) => control.status === "healthy_local").length,
    warningControls: state.controls.filter((control) => control.status === "warning_local").length,
    degradedControls: state.controls.filter((control) => control.status === "degraded_local").length,
    criticalControls: state.controls.filter((control) => control.status === "critical_local").length,
    recoveredControls: state.controls.filter((control) => control.status === "recovered_local").length,
    providerBlockedControls: state.controls.filter((control) => control.status === "provider_recovery_blocked").length,
    queuedHostControlEvents: state.queuedHostControlEvents,
    hostRecoveryRequestedLocal: state.hostRecoveryRequestedLocal,
    providerRecoveryRequestedLocal: state.providerRecoveryRequestedLocal,
    localBlockers: Array.from(new Set(localBlockers)),
    providerBlockers: provider,
    backendHostControlContract: state.integration.backendHostControlContract,
    realtimeHostControlProvider: state.integration.realtimeHostControlProvider,
    adminHostControlAudit: state.integration.adminHostControlAudit,
    fakeHostRecoveryAllowed: state.integration.fakeHostRecoveryAllowed,
    fakeProviderControlAllowed: state.integration.fakeProviderControlAllowed,
    fakeOnAirAllowed: state.integration.fakeOnAirAllowed,
    readyForBackendUnion: false,
  };
}
