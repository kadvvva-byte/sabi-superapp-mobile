import type { StreamBroadcastSource, StreamRoomRuntimeState } from "./streamRoomRuntime";
import type { StreamRoomLayoutState, StreamRoomStageRuntimeState } from "./streamRoomStageRuntime";
import type { StreamMediaDevicePreviewRuntimeState } from "./streamMediaDevicePreviewRuntime";
import type { StreamHostControlsRuntimeState } from "./streamHostControlsRuntime";
import { enqueueLocalStreamRoomEvent, type StreamRoomEventQueueRuntimeState } from "./streamRoomEventQueueRuntime";
import type { StreamRoomScenarioId, StreamRoomScenarioQaRuntimeState, StreamRoomScenarioRecord } from "./streamRoomScenarioQaRuntime";

export type StreamScenarioAcceptanceStatus =
  | "not_started_local"
  | "local_actions_required"
  | "local_actions_ready"
  | "queued_local"
  | "provider_acceptance_blocked";

export type StreamScenarioAcceptanceActionId =
  | "set_title"
  | "set_topic"
  | "select_required_source"
  | "select_required_layout"
  | "run_preview_diagnostics"
  | "enable_local_preview"
  | "open_comments_rail"
  | "open_participants_rail"
  | "open_moderation_rail"
  | "add_group_cohost"
  | "prepare_audio_microphone"
  | "prepare_game_capture"
  | "attach_video_file"
  | "set_business_visibility"
  | "run_host_controls_check"
  | "run_scenario_qa"
  | "queue_scenario_acceptance_event"
  | "connect_backend_room_contract"
  | "connect_realtime_provider"
  | "connect_media_provider"
  | "connect_admin_acceptance_audit";

export type StreamScenarioAcceptanceHintStatus =
  | "pending_local"
  | "reviewed_local"
  | "ready_local"
  | "provider_required";

export type StreamScenarioAcceptanceHint = {
  readonly id: StreamScenarioAcceptanceActionId;
  readonly label: string;
  readonly details: string;
  readonly status: StreamScenarioAcceptanceHintStatus;
  readonly scenarioId: StreamRoomScenarioId;
  readonly localOnly: boolean;
  readonly deliveredToProvider: false;
};

export type StreamScenarioAcceptanceIntegration = {
  readonly backendRoomContract: "not_connected" | "connected";
  readonly realtimeProvider: "not_configured" | "configured";
  readonly mediaProvider: "not_configured" | "configured";
  readonly adminAcceptanceAudit: "not_connected" | "connected";
  readonly fakeScenarioAcceptanceAllowed: false;
  readonly fakeOnAirAllowed: false;
  readonly fakeProviderAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftAllowed: false;
};

export type StreamScenarioAcceptanceRuntimeState = {
  readonly version: "STREAM-109L";
  readonly roomId: string;
  readonly selectedScenarioId: StreamRoomScenarioId;
  readonly status: StreamScenarioAcceptanceStatus;
  readonly selectedActionId: StreamScenarioAcceptanceActionId;
  readonly hints: readonly StreamScenarioAcceptanceHint[];
  readonly queuedAcceptanceEvents: number;
  readonly providerAcceptanceRequestedLocal: boolean;
  readonly localAcceptanceReviewedAt: string | null;
  readonly integration: StreamScenarioAcceptanceIntegration;
  readonly updatedAt: string;
};

export type StreamScenarioAcceptanceEvidenceSnapshot = {
  readonly version: "STREAM-109L";
  readonly roomId: string;
  readonly selectedScenarioId: StreamRoomScenarioId;
  readonly status: StreamScenarioAcceptanceStatus;
  readonly selectedActionId: StreamScenarioAcceptanceActionId;
  readonly selectedActionLabel: string;
  readonly hintsTotal: number;
  readonly readyHints: number;
  readonly pendingLocalHints: number;
  readonly reviewedLocalHints: number;
  readonly providerRequiredHints: number;
  readonly queuedAcceptanceEvents: number;
  readonly providerAcceptanceRequestedLocal: boolean;
  readonly localAcceptanceReviewedAt: string | null;
  readonly requiredSource: StreamBroadcastSource;
  readonly actualSource: StreamBroadcastSource | null;
  readonly requiredLayout: StreamRoomLayoutState;
  readonly actualLayout: StreamRoomLayoutState;
  readonly localActionsReady: boolean;
  readonly providerAcceptanceBlocked: boolean;
  readonly backendRoomContract: StreamScenarioAcceptanceIntegration["backendRoomContract"];
  readonly realtimeProvider: StreamScenarioAcceptanceIntegration["realtimeProvider"];
  readonly mediaProvider: StreamScenarioAcceptanceIntegration["mediaProvider"];
  readonly adminAcceptanceAudit: StreamScenarioAcceptanceIntegration["adminAcceptanceAudit"];
  readonly fakeScenarioAcceptanceAllowed: false;
  readonly fakeOnAirAllowed: false;
  readonly fakeProviderAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftAllowed: false;
  readonly readyForBackendUnion: boolean;
};

type AcceptanceContext = {
  readonly room: StreamRoomRuntimeState;
  readonly stage: StreamRoomStageRuntimeState;
  readonly media: StreamMediaDevicePreviewRuntimeState;
  readonly queue: StreamRoomEventQueueRuntimeState;
  readonly hostControls: StreamHostControlsRuntimeState;
  readonly scenarioQa: StreamRoomScenarioQaRuntimeState;
};

function nowIso(now?: Date | string | number): string {
  if (now instanceof Date) return now.toISOString();
  if (typeof now === "string") return new Date(now).toISOString();
  if (typeof now === "number") return new Date(now).toISOString();
  return new Date().toISOString();
}

function defaultIntegration(): StreamScenarioAcceptanceIntegration {
  return {
    backendRoomContract: "not_connected",
    realtimeProvider: "not_configured",
    mediaProvider: "not_configured",
    adminAcceptanceAudit: "not_connected",
    fakeScenarioAcceptanceAllowed: false,
    fakeOnAirAllowed: false,
    fakeProviderAllowed: false,
    fakePaymentAllowed: false,
    fakeGiftAllowed: false,
  };
}

function selectedScenario(state: StreamRoomScenarioQaRuntimeState): StreamRoomScenarioRecord {
  return state.scenarios.find((scenario) => scenario.id === state.selectedScenarioId) ?? state.scenarios[0];
}

function hint(
  id: StreamScenarioAcceptanceActionId,
  label: string,
  details: string,
  ready: boolean,
  scenarioId: StreamRoomScenarioId,
  reviewedActionIds: readonly StreamScenarioAcceptanceActionId[],
): StreamScenarioAcceptanceHint {
  const reviewed = reviewedActionIds.includes(id);
  return {
    id,
    label,
    details,
    status: ready ? "ready_local" : reviewed ? "reviewed_local" : "pending_local",
    scenarioId,
    localOnly: true,
    deliveredToProvider: false,
  };
}

function providerHint(id: StreamScenarioAcceptanceActionId, label: string, details: string, scenarioId: StreamRoomScenarioId): StreamScenarioAcceptanceHint {
  return {
    id,
    label,
    details,
    status: "provider_required",
    scenarioId,
    localOnly: false,
    deliveredToProvider: false,
  };
}

function keepReviewedActionIds(current?: StreamScenarioAcceptanceRuntimeState): readonly StreamScenarioAcceptanceActionId[] {
  return current?.hints.filter((item) => item.status === "reviewed_local").map((item) => item.id) ?? [];
}

function modeSpecificHints(
  scenario: StreamRoomScenarioRecord,
  context: AcceptanceContext,
  reviewed: readonly StreamScenarioAcceptanceActionId[],
): readonly StreamScenarioAcceptanceHint[] {
  const { room } = context;
  const cohostCount = room.participants.filter((participant) => participant.role === "cohost" && !participant.blocked).length;
  if (scenario.id === "group_live_scenario") {
    return [hint("add_group_cohost", "Add one co-host before group live", "Group live requires at least one local co-host seat before provider handoff.", cohostCount > 0, scenario.id, reviewed)];
  }
  if (scenario.id === "audio_room_scenario") {
    return [hint("prepare_audio_microphone", "Prepare microphone source", "Audio room must use microphone source and microphone-enabled local preview.", room.broadcast.source === "microphone" && room.broadcast.microphoneEnabled, scenario.id, reviewed)];
  }
  if (scenario.id === "game_broadcast_scenario") {
    return [hint("prepare_game_capture", "Prepare game capture intent", "Game broadcast must use game_capture source and a game capture intent. Provider capture is still required later.", room.broadcast.source === "game_capture" && room.broadcast.gameCaptureIntent, scenario.id, reviewed)];
  }
  if (scenario.id === "video_broadcast_scenario") {
    return [hint("attach_video_file", "Attach video-file intent", "Video broadcast must use video_file source and a local video-file intent. Upload/storage provider is still required later.", room.broadcast.source === "video_file" && room.broadcast.videoFileIntent, scenario.id, reviewed)];
  }
  if (scenario.id === "business_stream_scenario") {
    return [hint("set_business_visibility", "Use Business Stream visibility", "Business Stream must remain business-only/showcase-oriented here; payments and gifts are not part of this stage.", room.visibility === "business_only", scenario.id, reviewed)];
  }
  return [];
}

function buildHints(context: AcceptanceContext, current?: StreamScenarioAcceptanceRuntimeState): readonly StreamScenarioAcceptanceHint[] {
  const scenario = selectedScenario(context.scenarioQa);
  const { room, stage, media, hostControls, queue } = context;
  const reviewed = keepReviewedActionIds(current);
  const scenarioEventQueued = queue.events.some((event) => event.payload.acceptanceScenarioId === scenario.id && event.status !== "dropped_local");
  const localHints: StreamScenarioAcceptanceHint[] = [
    hint("set_title", "Set stream title", "A room cannot pass local acceptance without a non-empty title.", room.title.trim().length > 0, scenario.id, reviewed),
    hint("set_topic", "Set stream topic", "A room cannot pass local acceptance without a topic/category.", room.topic.trim().length > 0, scenario.id, reviewed),
    hint("select_required_source", `Select ${scenario.requiredSource} source`, `Selected source must match the scenario requirement: ${scenario.requiredSource}.`, room.broadcast.source === scenario.requiredSource, scenario.id, reviewed),
    hint("select_required_layout", `Use ${scenario.expectedLayout} layout`, `Layout must match the scenario requirement: ${scenario.expectedLayout}.`, stage.layout === scenario.expectedLayout, scenario.id, reviewed),
    hint("run_preview_diagnostics", "Run preview diagnostics", "Device list and network diagnostics must be checked locally before provider handoff.", media.diagnostics.deviceListCheckedLocal && media.diagnostics.networkDiagnosticCheckedLocal, scenario.id, reviewed),
    hint("enable_local_preview", "Enable local preview", "Local preview must be active before the room is accepted for provider/backend union.", media.controls.previewEnabledLocal || room.status === "local_preview_active", scenario.id, reviewed),
    hint("open_comments_rail", "Open comments rail", "Comments rail must be visible for room interaction checks.", stage.commentsVisible, scenario.id, reviewed),
    hint("open_participants_rail", "Open participants rail", "Participants rail must be visible for host/moderator checks.", stage.participantsVisible, scenario.id, reviewed),
    hint("open_moderation_rail", "Open moderation rail", "Moderation rail must be visible before local acceptance.", stage.moderationRailVisible, scenario.id, reviewed),
    hint("run_host_controls_check", "Run host controls check", "Host controls should be checked so degraded states are visible before handoff.", hostControls.controls.some((control) => control.status !== "healthy_local") || hostControls.queuedHostControlEvents > 0 || hostControls.providerRecoveryRequestedLocal, scenario.id, reviewed),
    hint("run_scenario_qa", "Run scenario QA", "Scenario QA must be run for the selected room mode.", scenario.ranAt !== null, scenario.id, reviewed),
    hint("queue_scenario_acceptance_event", "Queue scenario acceptance event", "Acceptance evidence must be queued locally; provider delivery stays blocked until real backend/realtime/Admin.", scenarioEventQueued, scenario.id, reviewed),
    ...modeSpecificHints(scenario, context, reviewed),
  ];
  return [
    ...localHints,
    providerHint("connect_backend_room_contract", "Connect backend room contract", "Required later for real room creation, persistence, and recovery.", scenario.id),
    providerHint("connect_realtime_provider", "Connect realtime provider", "Required later for real comments, participant presence, co-host, battle, and room events.", scenario.id),
    providerHint("connect_media_provider", "Connect media provider", "Required later for real camera/audio/screen/game/video/RTMP delivery.", scenario.id),
    providerHint("connect_admin_acceptance_audit", "Connect Admin acceptance audit", "Required later for Admin launch approval and acceptance history.", scenario.id),
  ];
}

function deriveStatus(hints: readonly StreamScenarioAcceptanceHint[], queuedAcceptanceEvents: number, providerAcceptanceRequestedLocal: boolean): StreamScenarioAcceptanceStatus {
  if (providerAcceptanceRequestedLocal) return "provider_acceptance_blocked";
  if (queuedAcceptanceEvents > 0) return "queued_local";
  const unresolvedLocal = hints.some((item) => item.status === "pending_local" || item.status === "reviewed_local");
  return unresolvedLocal ? "local_actions_required" : "local_actions_ready";
}

function firstUnresolvedAction(hints: readonly StreamScenarioAcceptanceHint[]): StreamScenarioAcceptanceActionId {
  return (hints.find((item) => item.status === "pending_local" || item.status === "reviewed_local") ?? hints.find((item) => item.status === "provider_required") ?? hints[0]).id;
}

export function createInitialStreamScenarioAcceptanceState(
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  media: StreamMediaDevicePreviewRuntimeState,
  queue: StreamRoomEventQueueRuntimeState,
  hostControls: StreamHostControlsRuntimeState,
  scenarioQa: StreamRoomScenarioQaRuntimeState,
  now?: Date | string | number,
): StreamScenarioAcceptanceRuntimeState {
  const updatedAt = nowIso(now);
  const context = { room, stage, media, queue, hostControls, scenarioQa };
  const hints = buildHints(context);
  return {
    version: "STREAM-109L",
    roomId: room.roomId,
    selectedScenarioId: scenarioQa.selectedScenarioId,
    status: deriveStatus(hints, 0, false),
    selectedActionId: firstUnresolvedAction(hints),
    hints,
    queuedAcceptanceEvents: 0,
    providerAcceptanceRequestedLocal: false,
    localAcceptanceReviewedAt: null,
    integration: defaultIntegration(),
    updatedAt,
  };
}

export function syncStreamScenarioAcceptanceState(
  state: StreamScenarioAcceptanceRuntimeState,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  media: StreamMediaDevicePreviewRuntimeState,
  queue: StreamRoomEventQueueRuntimeState,
  hostControls: StreamHostControlsRuntimeState,
  scenarioQa: StreamRoomScenarioQaRuntimeState,
  now?: Date | string | number,
): StreamScenarioAcceptanceRuntimeState {
  const updatedAt = nowIso(now);
  const hints = buildHints({ room, stage, media, queue, hostControls, scenarioQa }, state);
  const selectedActionStillExists = hints.some((item) => item.id === state.selectedActionId);
  return {
    ...state,
    roomId: room.roomId,
    selectedScenarioId: scenarioQa.selectedScenarioId,
    selectedActionId: selectedActionStillExists ? state.selectedActionId : firstUnresolvedAction(hints),
    hints,
    status: deriveStatus(hints, state.queuedAcceptanceEvents, state.providerAcceptanceRequestedLocal),
    updatedAt,
  };
}

export function selectNextStreamScenarioAcceptanceAction(state: StreamScenarioAcceptanceRuntimeState, now?: Date | string | number): StreamScenarioAcceptanceRuntimeState {
  const actionIds = state.hints.map((item) => item.id);
  const currentIndex = actionIds.indexOf(state.selectedActionId);
  const selectedActionId = actionIds[(currentIndex + 1) % actionIds.length] ?? state.selectedActionId;
  return { ...state, selectedActionId, updatedAt: nowIso(now) };
}

export function reviewSelectedStreamScenarioAcceptanceActionLocal(state: StreamScenarioAcceptanceRuntimeState, now?: Date | string | number): StreamScenarioAcceptanceRuntimeState {
  const updatedAt = nowIso(now);
  const hints = state.hints.map((item) => {
    if (item.id !== state.selectedActionId || item.status !== "pending_local") return item;
    return { ...item, status: "reviewed_local" as const };
  });
  return {
    ...state,
    hints,
    status: deriveStatus(hints, state.queuedAcceptanceEvents, state.providerAcceptanceRequestedLocal),
    localAcceptanceReviewedAt: updatedAt,
    updatedAt,
  };
}

export function queueStreamScenarioAcceptanceEvent(
  state: StreamScenarioAcceptanceRuntimeState,
  queue: StreamRoomEventQueueRuntimeState,
  room: StreamRoomRuntimeState,
  now?: Date | string | number,
): { readonly state: StreamScenarioAcceptanceRuntimeState; readonly queue: StreamRoomEventQueueRuntimeState } {
  const updatedAt = nowIso(now);
  const unresolvedLocal = state.hints.filter((item) => item.status === "pending_local" || item.status === "reviewed_local");
  const nextQueue = enqueueLocalStreamRoomEvent(queue, room, {
    kind: "provider_handoff_request",
    label: `Scenario acceptance local evidence: ${state.selectedScenarioId}`,
    priority: unresolvedLocal.length > 0 ? "normal" : "high",
    payload: {
      acceptanceScenarioId: state.selectedScenarioId,
      selectedActionId: state.selectedActionId,
      localActionsReady: unresolvedLocal.length === 0,
      unresolvedLocalActions: unresolvedLocal.length,
      providerAcceptanceRequired: true,
      fakeAcceptanceAllowed: false,
      fakeOnAirAllowed: false,
      fakePaymentAllowed: false,
      fakeGiftAllowed: false,
    },
  }, now);
  const nextState = {
    ...state,
    queuedAcceptanceEvents: state.queuedAcceptanceEvents + 1,
    status: "queued_local" as const,
    updatedAt,
  };
  return { state: nextState, queue: nextQueue };
}

export function requestStreamScenarioAcceptanceProviderBlocked(state: StreamScenarioAcceptanceRuntimeState, now?: Date | string | number): StreamScenarioAcceptanceRuntimeState {
  return {
    ...state,
    status: "provider_acceptance_blocked",
    providerAcceptanceRequestedLocal: true,
    updatedAt: nowIso(now),
  };
}

export function buildStreamScenarioAcceptanceEvidenceSnapshot(
  state: StreamScenarioAcceptanceRuntimeState,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  scenarioQa: StreamRoomScenarioQaRuntimeState,
): StreamScenarioAcceptanceEvidenceSnapshot {
  const scenario = selectedScenario(scenarioQa);
  const selected = state.hints.find((item) => item.id === state.selectedActionId) ?? state.hints[0];
  const pendingLocalHints = state.hints.filter((item) => item.status === "pending_local").length;
  const reviewedLocalHints = state.hints.filter((item) => item.status === "reviewed_local").length;
  const providerRequiredHints = state.hints.filter((item) => item.status === "provider_required").length;
  const readyHints = state.hints.filter((item) => item.status === "ready_local").length;
  const localActionsReady = pendingLocalHints === 0 && reviewedLocalHints === 0;
  return {
    version: "STREAM-109L",
    roomId: state.roomId,
    selectedScenarioId: state.selectedScenarioId,
    status: state.status,
    selectedActionId: state.selectedActionId,
    selectedActionLabel: selected?.label ?? state.selectedActionId,
    hintsTotal: state.hints.length,
    readyHints,
    pendingLocalHints,
    reviewedLocalHints,
    providerRequiredHints,
    queuedAcceptanceEvents: state.queuedAcceptanceEvents,
    providerAcceptanceRequestedLocal: state.providerAcceptanceRequestedLocal,
    localAcceptanceReviewedAt: state.localAcceptanceReviewedAt,
    requiredSource: scenario.requiredSource,
    actualSource: room.broadcast.source,
    requiredLayout: scenario.expectedLayout,
    actualLayout: stage.layout,
    localActionsReady,
    providerAcceptanceBlocked: true,
    backendRoomContract: state.integration.backendRoomContract,
    realtimeProvider: state.integration.realtimeProvider,
    mediaProvider: state.integration.mediaProvider,
    adminAcceptanceAudit: state.integration.adminAcceptanceAudit,
    fakeScenarioAcceptanceAllowed: false,
    fakeOnAirAllowed: false,
    fakeProviderAllowed: false,
    fakePaymentAllowed: false,
    fakeGiftAllowed: false,
    readyForBackendUnion: localActionsReady && state.queuedAcceptanceEvents > 0,
  };
}
