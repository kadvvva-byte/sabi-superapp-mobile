import type { StreamLaunchMode } from "./streamActionRuntime";
import type { StreamBroadcastSource, StreamRoomRuntimeState } from "./streamRoomRuntime";
import type { StreamRoomLayoutState, StreamRoomStageRuntimeState } from "./streamRoomStageRuntime";
import type { StreamMediaDevicePreviewRuntimeState } from "./streamMediaDevicePreviewRuntime";
import type { StreamHostControlsRuntimeState } from "./streamHostControlsRuntime";
import { enqueueLocalStreamRoomEvent, type StreamRoomEventQueueRuntimeState } from "./streamRoomEventQueueRuntime";

export type StreamRoomScenarioId =
  | "ordinary_live_scenario"
  | "group_live_scenario"
  | "audio_room_scenario"
  | "game_broadcast_scenario"
  | "video_broadcast_scenario"
  | "business_stream_scenario";

export type StreamRoomScenarioQaStatus =
  | "not_started_local"
  | "checking_local"
  | "blocked_local"
  | "ready_local"
  | "queued_local"
  | "provider_blocked";

export type StreamRoomScenarioQaBlockerCode =
  | "qa_room_required"
  | "qa_room_not_ready"
  | "qa_wrong_mode"
  | "qa_title_required"
  | "qa_topic_required"
  | "qa_required_source_missing"
  | "qa_required_source_mismatch"
  | "qa_layout_not_prepared"
  | "qa_preview_diagnostics_required"
  | "qa_local_preview_required"
  | "qa_comments_rail_required"
  | "qa_participants_rail_required"
  | "qa_moderation_rail_required"
  | "qa_group_cohost_required"
  | "qa_audio_microphone_required"
  | "qa_game_capture_required"
  | "qa_video_file_required"
  | "qa_business_visibility_required"
  | "qa_host_controls_required"
  | "qa_event_queue_required"
  | "qa_backend_room_contract_required"
  | "qa_realtime_provider_required"
  | "qa_media_provider_required"
  | "qa_admin_qa_audit_required"
  | "qa_fake_scenario_pass_forbidden";

export type StreamRoomScenarioStepStatus = "pending_local" | "passed_local" | "blocked_local" | "provider_required";

export type StreamRoomScenarioStep = {
  readonly id: string;
  readonly label: string;
  readonly status: StreamRoomScenarioStepStatus;
  readonly blockers: readonly StreamRoomScenarioQaBlockerCode[];
};

export type StreamRoomScenarioDefinition = {
  readonly id: StreamRoomScenarioId;
  readonly mode: StreamLaunchMode;
  readonly title: string;
  readonly purpose: string;
  readonly requiredSource: StreamBroadcastSource;
  readonly expectedLayout: StreamRoomLayoutState;
  readonly requiredRails: readonly ("comments" | "participants" | "moderation" | "cohost" | "battle")[];
};

export type StreamRoomScenarioRecord = StreamRoomScenarioDefinition & {
  readonly status: StreamRoomScenarioQaStatus;
  readonly ranAt: string | null;
  readonly queuedEventLocal: boolean;
  readonly localBlockers: readonly StreamRoomScenarioQaBlockerCode[];
  readonly providerBlockers: readonly StreamRoomScenarioQaBlockerCode[];
  readonly steps: readonly StreamRoomScenarioStep[];
  readonly localOnly: true;
  readonly deliveredToProvider: false;
};

export type StreamRoomScenarioQaIntegration = {
  readonly backendScenarioRunner: "not_connected" | "connected";
  readonly realtimeScenarioProvider: "not_configured" | "configured";
  readonly mediaScenarioProvider: "not_configured" | "configured";
  readonly adminQaAudit: "not_connected" | "connected";
  readonly fakeScenarioPassAllowed: false;
  readonly fakeProviderQaAllowed: false;
  readonly fakeOnAirAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftAllowed: false;
};

export type StreamRoomScenarioQaRuntimeState = {
  readonly version: "STREAM-109K";
  readonly roomId: string;
  readonly selectedScenarioId: StreamRoomScenarioId;
  readonly status: StreamRoomScenarioQaStatus;
  readonly scenarios: readonly StreamRoomScenarioRecord[];
  readonly queuedScenarioEvents: number;
  readonly providerHandoffRequestedLocal: boolean;
  readonly integration: StreamRoomScenarioQaIntegration;
  readonly updatedAt: string;
};

export type StreamRoomScenarioQaEvidenceSnapshot = {
  readonly version: "STREAM-109K";
  readonly roomId: string;
  readonly selectedScenarioId: StreamRoomScenarioId;
  readonly status: StreamRoomScenarioQaStatus;
  readonly scenariosTotal: number;
  readonly readyScenarios: number;
  readonly blockedScenarios: number;
  readonly queuedScenarios: number;
  readonly providerBlockedScenarios: number;
  readonly currentMode: StreamLaunchMode;
  readonly requiredSource: StreamBroadcastSource;
  readonly actualSource: StreamBroadcastSource | null;
  readonly expectedLayout: StreamRoomLayoutState;
  readonly actualLayout: StreamRoomLayoutState;
  readonly selectedStepsPassed: number;
  readonly selectedStepsBlocked: number;
  readonly queuedScenarioEvents: number;
  readonly providerHandoffRequestedLocal: boolean;
  readonly localBlockers: readonly StreamRoomScenarioQaBlockerCode[];
  readonly providerBlockers: readonly StreamRoomScenarioQaBlockerCode[];
  readonly backendScenarioRunner: StreamRoomScenarioQaIntegration["backendScenarioRunner"];
  readonly realtimeScenarioProvider: StreamRoomScenarioQaIntegration["realtimeScenarioProvider"];
  readonly mediaScenarioProvider: StreamRoomScenarioQaIntegration["mediaScenarioProvider"];
  readonly adminQaAudit: StreamRoomScenarioQaIntegration["adminQaAudit"];
  readonly fakeScenarioPassAllowed: false;
  readonly fakeProviderQaAllowed: false;
  readonly fakeOnAirAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftAllowed: false;
  readonly readyForBackendUnion: boolean;
};

type ScenarioContext = {
  readonly room: StreamRoomRuntimeState;
  readonly stage: StreamRoomStageRuntimeState;
  readonly media: StreamMediaDevicePreviewRuntimeState;
  readonly queue: StreamRoomEventQueueRuntimeState;
  readonly hostControls: StreamHostControlsRuntimeState;
};

const SCENARIOS: readonly StreamRoomScenarioDefinition[] = [
  {
    id: "ordinary_live_scenario",
    mode: "soloLive",
    title: "Ordinary direct live",
    purpose: "Host direct camera room with comments, participants, moderation, local preview, and provider blockers visible.",
    requiredSource: "camera",
    expectedLayout: "single",
    requiredRails: ["comments", "participants", "moderation"],
  },
  {
    id: "group_live_scenario",
    mode: "groupLive",
    title: "Group live room",
    purpose: "Host plus co-host stage with comments, participants, moderation, co-host rail, and provider blockers visible.",
    requiredSource: "camera",
    expectedLayout: "grid",
    requiredRails: ["comments", "participants", "moderation", "cohost"],
  },
  {
    id: "audio_room_scenario",
    mode: "audioLive",
    title: "Audio room",
    purpose: "Microphone/stage room with comments, participants, moderation, and provider blockers visible.",
    requiredSource: "microphone",
    expectedLayout: "stage",
    requiredRails: ["comments", "participants", "moderation"],
  },
  {
    id: "game_broadcast_scenario",
    mode: "gameLive",
    title: "Game broadcast",
    purpose: "Game capture room with game overlay, comments, participants, moderation, and provider blockers visible.",
    requiredSource: "game_capture",
    expectedLayout: "game_overlay",
    requiredRails: ["comments", "participants", "moderation"],
  },
  {
    id: "video_broadcast_scenario",
    mode: "cinemaLive",
    title: "Video broadcast",
    purpose: "Video-file broadcast with cinema layout, comments, participants, moderation, and storage/provider blockers visible.",
    requiredSource: "video_file",
    expectedLayout: "cinema",
    requiredRails: ["comments", "participants", "moderation"],
  },
  {
    id: "business_stream_scenario",
    mode: "businessLive",
    title: "Business Stream room",
    purpose: "Business showcase room with camera source, business-only visibility, comments, participants, moderation, and Admin/provider blockers visible. No payments or gifts.",
    requiredSource: "camera",
    expectedLayout: "business_showcase",
    requiredRails: ["comments", "participants", "moderation", "cohost"],
  },
];

function nowIso(now?: Date | string | number): string {
  if (now instanceof Date) return now.toISOString();
  if (typeof now === "string") return new Date(now).toISOString();
  if (typeof now === "number") return new Date(now).toISOString();
  return new Date().toISOString();
}

function defaultIntegration(): StreamRoomScenarioQaIntegration {
  return {
    backendScenarioRunner: "not_connected",
    realtimeScenarioProvider: "not_configured",
    mediaScenarioProvider: "not_configured",
    adminQaAudit: "not_connected",
    fakeScenarioPassAllowed: false,
    fakeProviderQaAllowed: false,
    fakeOnAirAllowed: false,
    fakePaymentAllowed: false,
    fakeGiftAllowed: false,
  };
}

function providerBlockers(): readonly StreamRoomScenarioQaBlockerCode[] {
  return [
    "qa_backend_room_contract_required",
    "qa_realtime_provider_required",
    "qa_media_provider_required",
    "qa_admin_qa_audit_required",
    "qa_fake_scenario_pass_forbidden",
  ];
}

function selectedScenario(state: StreamRoomScenarioQaRuntimeState): StreamRoomScenarioRecord {
  return state.scenarios.find((scenario) => scenario.id === state.selectedScenarioId) ?? state.scenarios[0];
}

function scenarioForRoomMode(mode: StreamLaunchMode): StreamRoomScenarioId {
  return SCENARIOS.find((scenario) => scenario.mode === mode)?.id ?? "ordinary_live_scenario";
}

function step(id: string, label: string, passed: boolean, blockers: readonly StreamRoomScenarioQaBlockerCode[]): StreamRoomScenarioStep {
  return { id, label, status: passed ? "passed_local" : "blocked_local", blockers: passed ? [] : blockers };
}

function buildSteps(definition: StreamRoomScenarioDefinition, context: ScenarioContext): readonly StreamRoomScenarioStep[] {
  const { room, stage, media, queue, hostControls } = context;
  const cohosts = room.participants.filter((participant) => participant.role === "cohost" && !participant.blocked).length;
  const eventQueuedForScenario = queue.events.some((event) => event.payload.scenarioId === definition.id && event.status !== "dropped_local");
  return [
    step("room_exists", "Room exists locally", Boolean(room.roomId), ["qa_room_required"]),
    step("mode_matches", "Room mode matches scenario", room.mode === definition.mode, ["qa_wrong_mode"]),
    step("title_ready", "Title is present", room.title.trim().length > 0, ["qa_title_required"]),
    step("topic_ready", "Topic is present", room.topic.trim().length > 0, ["qa_topic_required"]),
    step("room_ready", "Room is ready for local preview/check", room.status !== "draft", ["qa_room_not_ready"]),
    step("source_matches", "Required source is selected", room.broadcast.source === definition.requiredSource, [room.broadcast.source ? "qa_required_source_mismatch" : "qa_required_source_missing"]),
    step("layout_matches", "Expected layout is prepared", stage.layout === definition.expectedLayout, ["qa_layout_not_prepared"]),
    step("preview_diagnostics", "Preview diagnostics checked", media.diagnostics.deviceListCheckedLocal && media.diagnostics.networkDiagnosticCheckedLocal, ["qa_preview_diagnostics_required"]),
    step("local_preview", "Local preview is enabled", media.controls.previewEnabledLocal || room.status === "local_preview_active", ["qa_local_preview_required"]),
    step("comments_rail", "Comments rail visible", !definition.requiredRails.includes("comments") || stage.commentsVisible, ["qa_comments_rail_required"]),
    step("participants_rail", "Participants rail visible", !definition.requiredRails.includes("participants") || stage.participantsVisible, ["qa_participants_rail_required"]),
    step("moderation_rail", "Moderation rail visible", !definition.requiredRails.includes("moderation") || stage.moderationRailVisible, ["qa_moderation_rail_required"]),
    step("cohost_requirement", "Co-host requirement satisfied when needed", definition.mode !== "groupLive" || cohosts > 0, ["qa_group_cohost_required"]),
    step("audio_source", "Audio room uses microphone source", definition.mode !== "audioLive" || room.broadcast.source === "microphone", ["qa_audio_microphone_required"]),
    step("game_source", "Game broadcast uses game capture", definition.mode !== "gameLive" || room.broadcast.source === "game_capture", ["qa_game_capture_required"]),
    step("video_source", "Video broadcast uses video file", definition.mode !== "cinemaLive" || room.broadcast.source === "video_file", ["qa_video_file_required"]),
    step("business_visibility", "Business Stream uses business visibility", definition.mode !== "businessLive" || room.visibility === "business_only", ["qa_business_visibility_required"]),
    step("host_controls", "Host controls checked", hostControls.controls.length > 0 && hostControls.controls.some((control) => control.lastCheckedAt), ["qa_host_controls_required"]),
    step("event_queue", "Scenario event queued locally", eventQueuedForScenario, ["qa_event_queue_required"]),
  ];
}

function blockersFromSteps(steps: readonly StreamRoomScenarioStep[]): readonly StreamRoomScenarioQaBlockerCode[] {
  return Array.from(new Set(steps.flatMap((item) => item.blockers)));
}

function statusFromSteps(steps: readonly StreamRoomScenarioStep[], previouslyQueued: boolean): StreamRoomScenarioQaStatus {
  const blockers = blockersFromSteps(steps);
  if (previouslyQueued) return blockers.length === 0 ? "queued_local" : "blocked_local";
  return blockers.length === 0 ? "ready_local" : "blocked_local";
}

function buildScenarioRecords(
  context: ScenarioContext,
  previous: readonly StreamRoomScenarioRecord[] = [],
  now?: Date | string | number,
): readonly StreamRoomScenarioRecord[] {
  const stamp = nowIso(now);
  return SCENARIOS.map((definition) => {
    const prior = previous.find((scenario) => scenario.id === definition.id);
    const steps = buildSteps(definition, context);
    const localBlockers = blockersFromSteps(steps);
    const queuedEventLocal = prior?.queuedEventLocal ?? context.queue.events.some((event) => event.payload.scenarioId === definition.id && event.status !== "dropped_local");
    return {
      ...definition,
      status: prior?.status === "provider_blocked" ? "provider_blocked" : statusFromSteps(steps, queuedEventLocal),
      ranAt: prior?.ranAt ?? null,
      queuedEventLocal,
      localBlockers,
      providerBlockers: providerBlockers(),
      steps,
      localOnly: true,
      deliveredToProvider: false,
    };
  });
}

export function createInitialStreamRoomScenarioQaState(
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  media: StreamMediaDevicePreviewRuntimeState,
  queue: StreamRoomEventQueueRuntimeState,
  hostControls: StreamHostControlsRuntimeState,
  now?: Date | string | number,
): StreamRoomScenarioQaRuntimeState {
  const scenarios = buildScenarioRecords({ room, stage, media, queue, hostControls }, [], now);
  const selectedScenarioId = scenarioForRoomMode(room.mode);
  const selected = scenarios.find((scenario) => scenario.id === selectedScenarioId) ?? scenarios[0];
  return {
    version: "STREAM-109K",
    roomId: room.roomId,
    selectedScenarioId,
    status: selected.status,
    scenarios,
    queuedScenarioEvents: scenarios.filter((scenario) => scenario.queuedEventLocal).length,
    providerHandoffRequestedLocal: false,
    integration: defaultIntegration(),
    updatedAt: nowIso(now),
  };
}

export function syncStreamRoomScenarioQaState(
  state: StreamRoomScenarioQaRuntimeState,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  media: StreamMediaDevicePreviewRuntimeState,
  queue: StreamRoomEventQueueRuntimeState,
  hostControls: StreamHostControlsRuntimeState,
): StreamRoomScenarioQaRuntimeState {
  const selectedScenarioId = state.selectedScenarioId || scenarioForRoomMode(room.mode);
  const scenarios = buildScenarioRecords({ room, stage, media, queue, hostControls }, state.scenarios);
  const selected = scenarios.find((scenario) => scenario.id === selectedScenarioId) ?? scenarios[0];
  return {
    ...state,
    roomId: room.roomId,
    selectedScenarioId: selected.id,
    status: selected.status,
    scenarios,
    queuedScenarioEvents: scenarios.filter((scenario) => scenario.queuedEventLocal).length,
    updatedAt: nowIso(),
  };
}

export function selectStreamRoomScenario(state: StreamRoomScenarioQaRuntimeState, scenarioId: StreamRoomScenarioId): StreamRoomScenarioQaRuntimeState {
  const selected = state.scenarios.find((scenario) => scenario.id === scenarioId) ?? selectedScenario(state);
  return { ...state, selectedScenarioId: selected.id, status: selected.status, updatedAt: nowIso() };
}

export function runStreamRoomScenarioQaLocal(
  state: StreamRoomScenarioQaRuntimeState,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  media: StreamMediaDevicePreviewRuntimeState,
  queue: StreamRoomEventQueueRuntimeState,
  hostControls: StreamHostControlsRuntimeState,
): StreamRoomScenarioQaRuntimeState {
  const updatedAt = nowIso();
  const scenarios: readonly StreamRoomScenarioRecord[] = buildScenarioRecords({ room, stage, media, queue, hostControls }, state.scenarios, updatedAt).map((scenario): StreamRoomScenarioRecord => scenario.id === state.selectedScenarioId ? { ...scenario, status: scenario.localBlockers.length === 0 ? "ready_local" : "blocked_local", ranAt: updatedAt } : scenario);
  const selected = scenarios.find((scenario) => scenario.id === state.selectedScenarioId) ?? scenarios[0];
  return { ...state, roomId: room.roomId, scenarios, status: selected.status, updatedAt };
}

export function queueStreamRoomScenarioQaEvent(
  state: StreamRoomScenarioQaRuntimeState,
  queue: StreamRoomEventQueueRuntimeState,
  room: StreamRoomRuntimeState,
): { readonly state: StreamRoomScenarioQaRuntimeState; readonly queue: StreamRoomEventQueueRuntimeState } {
  const selected = selectedScenario(state);
  const nextQueue = enqueueLocalStreamRoomEvent(queue, room, {
    kind: "room_lifecycle",
    label: `Scenario QA: ${selected.title}`,
    priority: selected.localBlockers.length > 0 ? "high" : "normal",
    payload: {
      scenarioId: selected.id,
      mode: selected.mode,
      status: selected.status,
      localBlockers: selected.localBlockers.length,
      providerBlockers: selected.providerBlockers.length,
      fakeScenarioPassAllowed: false,
      fakeOnAirAllowed: false,
      fakePaymentAllowed: false,
      fakeGiftAllowed: false,
    },
  });
  const updatedAt = nowIso();
  const scenarios: readonly StreamRoomScenarioRecord[] = state.scenarios.map((scenario): StreamRoomScenarioRecord => scenario.id === selected.id ? { ...scenario, queuedEventLocal: true, status: scenario.localBlockers.length === 0 ? "queued_local" : "blocked_local", ranAt: scenario.ranAt ?? updatedAt } : scenario);
  const nextSelected = scenarios.find((scenario) => scenario.id === selected.id) ?? selected;
  return {
    state: { ...state, scenarios, status: nextSelected.status, queuedScenarioEvents: scenarios.filter((scenario) => scenario.queuedEventLocal).length, updatedAt },
    queue: nextQueue,
  };
}

export function requestStreamRoomScenarioProviderBlocked(state: StreamRoomScenarioQaRuntimeState): StreamRoomScenarioQaRuntimeState {
  const updatedAt = nowIso();
  const scenarios: readonly StreamRoomScenarioRecord[] = state.scenarios.map((scenario): StreamRoomScenarioRecord => scenario.id === state.selectedScenarioId ? { ...scenario, status: "provider_blocked", providerBlockers: providerBlockers() } : scenario);
  return {
    ...state,
    status: "provider_blocked",
    scenarios,
    providerHandoffRequestedLocal: true,
    updatedAt,
  };
}

export function buildStreamRoomScenarioQaEvidenceSnapshot(
  state: StreamRoomScenarioQaRuntimeState,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
): StreamRoomScenarioQaEvidenceSnapshot {
  const selected = selectedScenario(state);
  return {
    version: "STREAM-109K",
    roomId: state.roomId,
    selectedScenarioId: selected.id,
    status: state.status,
    scenariosTotal: state.scenarios.length,
    readyScenarios: state.scenarios.filter((scenario) => scenario.status === "ready_local" || scenario.status === "queued_local").length,
    blockedScenarios: state.scenarios.filter((scenario) => scenario.status === "blocked_local").length,
    queuedScenarios: state.scenarios.filter((scenario) => scenario.queuedEventLocal).length,
    providerBlockedScenarios: state.scenarios.filter((scenario) => scenario.status === "provider_blocked").length,
    currentMode: room.mode,
    requiredSource: selected.requiredSource,
    actualSource: room.broadcast.source,
    expectedLayout: selected.expectedLayout,
    actualLayout: stage.layout,
    selectedStepsPassed: selected.steps.filter((item) => item.status === "passed_local").length,
    selectedStepsBlocked: selected.steps.filter((item) => item.status === "blocked_local").length,
    queuedScenarioEvents: state.queuedScenarioEvents,
    providerHandoffRequestedLocal: state.providerHandoffRequestedLocal,
    localBlockers: selected.localBlockers,
    providerBlockers: selected.providerBlockers,
    backendScenarioRunner: state.integration.backendScenarioRunner,
    realtimeScenarioProvider: state.integration.realtimeScenarioProvider,
    mediaScenarioProvider: state.integration.mediaScenarioProvider,
    adminQaAudit: state.integration.adminQaAudit,
    fakeScenarioPassAllowed: state.integration.fakeScenarioPassAllowed,
    fakeProviderQaAllowed: state.integration.fakeProviderQaAllowed,
    fakeOnAirAllowed: state.integration.fakeOnAirAllowed,
    fakePaymentAllowed: state.integration.fakePaymentAllowed,
    fakeGiftAllowed: state.integration.fakeGiftAllowed,
    readyForBackendUnion: false,
  };
}
