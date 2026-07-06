import type { StreamLaunchMode } from "./streamActionRuntime";
import type { StreamRoomRuntimeState, StreamBroadcastSource } from "./streamRoomRuntime";
import type { StreamRoomLayoutState, StreamRoomStageRuntimeState } from "./streamRoomStageRuntime";
import type { StreamBroadcastSourceReadinessRuntimeState } from "./streamBroadcastSourceReadinessRuntime";
import type { StreamMediaDevicePreviewRuntimeState } from "./streamMediaDevicePreviewRuntime";
import type { StreamRoomModeCleanRuntimeState } from "./streamRoomModeCleanRuntime";

export type StreamRoomUiStatus =
  | "idle_local"
  | "mode_details_applied_local"
  | "local_blockers_visible"
  | "provider_handoff_blocked"
  | "ended_local";

export type StreamRoomUiRail =
  | "overview"
  | "comments"
  | "participants"
  | "cohost"
  | "battle"
  | "moderation"
  | "source"
  | "quality";

export type StreamRoomUiPrimaryAction =
  | "create_local_room"
  | "open_local_lobby"
  | "run_prelive_check"
  | "fix_local_blockers"
  | "open_local_preview"
  | "request_provider_handoff_blocked"
  | "ended_no_action";

export type StreamRoomUiBlockerCode =
  | "ui_room_title_required"
  | "ui_room_topic_required"
  | "ui_source_required"
  | "ui_layout_required"
  | "ui_local_preview_required"
  | "ui_diagnostics_required"
  | "ui_group_cohost_required"
  | "ui_provider_backend_required"
  | "ui_provider_realtime_required"
  | "ui_provider_media_required"
  | "ui_admin_launch_required";

export type StreamRoomUiModeDetails = {
  readonly mode: StreamLaunchMode;
  readonly title: string;
  readonly purpose: string;
  readonly requiredSource: StreamBroadcastSource;
  readonly recommendedLayout: StreamRoomLayoutState;
  readonly primaryRail: StreamRoomUiRail;
  readonly visibleRails: readonly StreamRoomUiRail[];
  readonly localChecklist: readonly string[];
  readonly providerChecklist: readonly string[];
  readonly noPaymentOrGiftInThisPhase: true;
};

export type StreamRoomUiIntegrationState = {
  readonly backendRoomContract: "not_connected" | "connected";
  readonly realtimeProvider: "not_configured" | "configured";
  readonly mediaProvider: "not_configured" | "configured";
  readonly adminLaunchApproval: "not_submitted" | "pending" | "approved" | "rejected";
  readonly fakeUiReadyAllowed: false;
  readonly fakeOnAirAllowed: false;
  readonly fakeProviderAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftAllowed: false;
  readonly fakeLaunchCompleteAllowed: false;
};

export type StreamRoomUiActionLogEntry = {
  readonly id: string;
  readonly action: string;
  readonly createdAt: string;
  readonly status: StreamRoomUiStatus;
  readonly selectedRail: StreamRoomUiRail;
  readonly blockers: readonly StreamRoomUiBlockerCode[];
};

export type StreamRoomUiStateRuntimeState = {
  readonly version: "STREAM-109B";
  readonly roomId: string;
  readonly mode: StreamLaunchMode;
  readonly status: StreamRoomUiStatus;
  readonly selectedRail: StreamRoomUiRail;
  readonly appliedDetailsAt: string | null;
  readonly details: StreamRoomUiModeDetails;
  readonly integration: StreamRoomUiIntegrationState;
  readonly actionLog: readonly StreamRoomUiActionLogEntry[];
};

export type StreamRoomUiStateEvidenceSnapshot = {
  readonly version: "STREAM-109B";
  readonly roomId: string;
  readonly mode: StreamLaunchMode;
  readonly status: StreamRoomUiStatus;
  readonly roomLifecycleStatus: StreamRoomRuntimeState["status"];
  readonly selectedRail: StreamRoomUiRail;
  readonly primaryAction: StreamRoomUiPrimaryAction;
  readonly modeTitle: string;
  readonly modePurpose: string;
  readonly requiredSource: StreamBroadcastSource;
  readonly actualSource: StreamBroadcastSource | null;
  readonly recommendedLayout: StreamRoomLayoutState;
  readonly actualLayout: StreamRoomLayoutState;
  readonly visibleRails: readonly StreamRoomUiRail[];
  readonly localChecklist: readonly string[];
  readonly providerChecklist: readonly string[];
  readonly localBlockers: readonly StreamRoomUiBlockerCode[];
  readonly providerBlockers: readonly StreamRoomUiBlockerCode[];
  readonly diagnosticsReady: boolean;
  readonly localPreviewEnabled: boolean;
  readonly sourceReadinessStatus: StreamBroadcastSourceReadinessRuntimeState["status"];
  readonly mediaPreviewStatus: StreamMediaDevicePreviewRuntimeState["status"];
  readonly modeCleanStatus: StreamRoomModeCleanRuntimeState["status"];
  readonly backendRoomContract: StreamRoomUiIntegrationState["backendRoomContract"];
  readonly realtimeProvider: StreamRoomUiIntegrationState["realtimeProvider"];
  readonly mediaProvider: StreamRoomUiIntegrationState["mediaProvider"];
  readonly adminLaunchApproval: StreamRoomUiIntegrationState["adminLaunchApproval"];
  readonly fakeUiReadyAllowed: false;
  readonly fakeOnAirAllowed: false;
  readonly fakeProviderAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftAllowed: false;
  readonly fakeLaunchCompleteAllowed: false;
  readonly readyForBackendUnion: boolean;
};

const MAX_UI_LOG = 40;

export const STREAM_ROOM_UI_MODE_DETAILS: Record<StreamLaunchMode, StreamRoomUiModeDetails> = {
  soloLive: {
    mode: "soloLive",
    title: "Direct live room",
    purpose: "Host camera stream with comments, moderation and battle-ready local controls.",
    requiredSource: "camera",
    recommendedLayout: "single",
    primaryRail: "overview",
    visibleRails: ["overview", "source", "quality", "comments", "participants", "battle", "moderation"],
    localChecklist: ["title", "topic", "camera source", "local diagnostics", "local preview", "comments policy", "moderation rail"],
    providerChecklist: ["backend room", "realtime provider", "media provider", "Admin launch approval"],
    noPaymentOrGiftInThisPhase: true,
  },
  groupLive: {
    mode: "groupLive",
    title: "Group live room",
    purpose: "Multi-host room with co-host seats, participants, comments and moderation depth.",
    requiredSource: "camera",
    recommendedLayout: "grid",
    primaryRail: "cohost",
    visibleRails: ["overview", "source", "quality", "participants", "cohost", "comments", "battle", "moderation"],
    localChecklist: ["title", "topic", "camera source", "one co-host", "speaker seats", "grid layout", "local preview"],
    providerChecklist: ["backend participant contract", "realtime provider", "media provider", "Admin launch approval"],
    noPaymentOrGiftInThisPhase: true,
  },
  audioLive: {
    mode: "audioLive",
    title: "Audio room",
    purpose: "Microphone-first stage room with speakers, listeners, comments and moderation.",
    requiredSource: "microphone",
    recommendedLayout: "stage",
    primaryRail: "participants",
    visibleRails: ["overview", "source", "quality", "participants", "cohost", "comments", "moderation"],
    localChecklist: ["title", "topic", "microphone source", "stage layout", "speaker seats", "audio diagnostics"],
    providerChecklist: ["backend audio room", "realtime audio provider", "media provider", "Admin launch approval"],
    noPaymentOrGiftInThisPhase: true,
  },
  gameLive: {
    mode: "gameLive",
    title: "Game broadcast room",
    purpose: "Game/source capture room with game overlay, low latency preview and chat moderation.",
    requiredSource: "game_capture",
    recommendedLayout: "game_overlay",
    primaryRail: "source",
    visibleRails: ["overview", "source", "quality", "comments", "participants", "battle", "moderation"],
    localChecklist: ["title", "topic", "game capture intent", "game overlay layout", "low latency quality", "local preview"],
    providerChecklist: ["game capture provider", "backend room", "realtime provider", "media provider", "Admin launch approval"],
    noPaymentOrGiftInThisPhase: true,
  },
  cinemaLive: {
    mode: "cinemaLive",
    title: "Video broadcast room",
    purpose: "Video-file broadcast room prepared for storage/CDN provider handoff.",
    requiredSource: "video_file",
    recommendedLayout: "cinema",
    primaryRail: "source",
    visibleRails: ["overview", "source", "quality", "comments", "participants", "moderation"],
    localChecklist: ["title", "topic", "video file intent", "cinema layout", "preview quality", "moderation rail"],
    providerChecklist: ["video storage provider", "CDN/media provider", "backend room", "Admin launch approval"],
    noPaymentOrGiftInThisPhase: true,
  },
  businessLive: {
    mode: "businessLive",
    title: "Business Stream room",
    purpose: "Business showcase room prepared for business content and moderation, without payments yet.",
    requiredSource: "camera",
    recommendedLayout: "business_showcase",
    primaryRail: "overview",
    visibleRails: ["overview", "source", "quality", "comments", "participants", "moderation"],
    localChecklist: ["title", "topic", "business visibility", "business showcase layout", "camera source", "local preview"],
    providerChecklist: ["backend business room", "realtime provider", "media provider", "Admin launch approval"],
    noPaymentOrGiftInThisPhase: true,
  },
};

function nowIso(now?: Date | string | number): string {
  if (now instanceof Date) return now.toISOString();
  if (typeof now === "string") return new Date(now).toISOString();
  if (typeof now === "number") return new Date(now).toISOString();
  return new Date().toISOString();
}

function integrationDefaults(): StreamRoomUiIntegrationState {
  return {
    backendRoomContract: "not_connected",
    realtimeProvider: "not_configured",
    mediaProvider: "not_configured",
    adminLaunchApproval: "not_submitted",
    fakeUiReadyAllowed: false,
    fakeOnAirAllowed: false,
    fakeProviderAllowed: false,
    fakePaymentAllowed: false,
    fakeGiftAllowed: false,
    fakeLaunchCompleteAllowed: false,
  };
}

function appendLog(
  state: StreamRoomUiStateRuntimeState,
  action: string,
  status: StreamRoomUiStatus,
  selectedRail: StreamRoomUiRail,
  blockers: readonly StreamRoomUiBlockerCode[] = [],
  now?: Date | string | number,
): StreamRoomUiStateRuntimeState {
  const createdAt = nowIso(now);
  return {
    ...state,
    actionLog: [{ id: `${action}-${createdAt}`, action, createdAt, status, selectedRail, blockers }, ...state.actionLog].slice(0, MAX_UI_LOG),
  };
}

function unique<T extends string>(items: readonly T[]): readonly T[] {
  return Array.from(new Set(items));
}

function localBlockers(
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  media: StreamMediaDevicePreviewRuntimeState,
  details: StreamRoomUiModeDetails,
): readonly StreamRoomUiBlockerCode[] {
  const blockers: StreamRoomUiBlockerCode[] = [];
  if (!room.title.trim()) blockers.push("ui_room_title_required");
  if (!room.topic.trim()) blockers.push("ui_room_topic_required");
  if (!room.broadcast.source) blockers.push("ui_source_required");
  if (room.broadcast.source !== details.requiredSource) blockers.push("ui_source_required");
  if (stage.layout !== details.recommendedLayout) blockers.push("ui_layout_required");
  if (!media.diagnostics.deviceListCheckedLocal || !media.diagnostics.networkDiagnosticCheckedLocal) blockers.push("ui_diagnostics_required");
  if (!media.controls.previewEnabledLocal) blockers.push("ui_local_preview_required");
  if (room.mode === "groupLive" && room.participants.filter((participant) => participant.role === "cohost" && !participant.blocked).length < 1) blockers.push("ui_group_cohost_required");
  return unique(blockers);
}

function providerBlockers(integration: StreamRoomUiIntegrationState): readonly StreamRoomUiBlockerCode[] {
  const blockers: StreamRoomUiBlockerCode[] = [];
  if (integration.backendRoomContract !== "connected") blockers.push("ui_provider_backend_required");
  if (integration.realtimeProvider !== "configured") blockers.push("ui_provider_realtime_required");
  if (integration.mediaProvider !== "configured") blockers.push("ui_provider_media_required");
  if (integration.adminLaunchApproval !== "approved") blockers.push("ui_admin_launch_required");
  return blockers;
}

function primaryAction(
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  media: StreamMediaDevicePreviewRuntimeState,
  details: StreamRoomUiModeDetails,
  integration: StreamRoomUiIntegrationState,
): StreamRoomUiPrimaryAction {
  if (room.status === "ended") return "ended_no_action";
  if (room.status === "draft") return "create_local_room";
  if (stage.status === "idle_local") return "open_local_lobby";
  if (stage.status === "lobby_local") return "run_prelive_check";
  if (localBlockers(room, stage, media, details).length > 0) return "fix_local_blockers";
  if (room.status !== "local_preview_active" && !media.controls.previewEnabledLocal) return "open_local_preview";
  return providerBlockers(integration).length > 0 ? "request_provider_handoff_blocked" : "request_provider_handoff_blocked";
}

function statusFor(
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  media: StreamMediaDevicePreviewRuntimeState,
  details: StreamRoomUiModeDetails,
  integration: StreamRoomUiIntegrationState,
): StreamRoomUiStatus {
  if (room.status === "ended") return "ended_local";
  if (localBlockers(room, stage, media, details).length > 0) return "local_blockers_visible";
  if (providerBlockers(integration).length > 0) return "provider_handoff_blocked";
  return "mode_details_applied_local";
}

export function createInitialStreamRoomUiState(room: StreamRoomRuntimeState): StreamRoomUiStateRuntimeState {
  const initial: StreamRoomUiStateRuntimeState = {
    version: "STREAM-109B",
    roomId: room.roomId,
    mode: room.mode,
    status: "idle_local",
    selectedRail: STREAM_ROOM_UI_MODE_DETAILS[room.mode].primaryRail,
    appliedDetailsAt: null,
    details: STREAM_ROOM_UI_MODE_DETAILS[room.mode],
    integration: integrationDefaults(),
    actionLog: [],
  };
  return appendLog(initial, "ui_state_initialized", "idle_local", initial.selectedRail);
}

export function syncStreamRoomUiState(current: StreamRoomUiStateRuntimeState, room: StreamRoomRuntimeState): StreamRoomUiStateRuntimeState {
  if (current.roomId === room.roomId && current.mode === room.mode) return current;
  const details = STREAM_ROOM_UI_MODE_DETAILS[room.mode];
  const next: StreamRoomUiStateRuntimeState = {
    ...current,
    roomId: room.roomId,
    mode: room.mode,
    status: room.status === "ended" ? "ended_local" : "idle_local",
    selectedRail: details.primaryRail,
    details,
    appliedDetailsAt: null,
  };
  return appendLog(next, "ui_state_synced", next.status, next.selectedRail);
}

export function selectStreamRoomUiRail(current: StreamRoomUiStateRuntimeState, rail: StreamRoomUiRail, now?: Date | string | number): StreamRoomUiStateRuntimeState {
  const selectedRail = current.details.visibleRails.includes(rail) ? rail : current.details.primaryRail;
  return appendLog({ ...current, selectedRail }, "ui_rail_selected", current.status, selectedRail, [], now);
}

export function applyStreamRoomModeUiDetailsLocal(
  current: StreamRoomUiStateRuntimeState,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  source: StreamBroadcastSourceReadinessRuntimeState,
  media: StreamMediaDevicePreviewRuntimeState,
  modeClean: StreamRoomModeCleanRuntimeState,
  now?: Date | string | number,
): StreamRoomUiStateRuntimeState {
  void source;
  void modeClean;
  const details = STREAM_ROOM_UI_MODE_DETAILS[room.mode];
  const blockers = [...localBlockers(room, stage, media, details), ...providerBlockers(current.integration)];
  const nextStatus = statusFor(room, stage, media, details, current.integration);
  const next: StreamRoomUiStateRuntimeState = {
    ...current,
    roomId: room.roomId,
    mode: room.mode,
    details,
    status: nextStatus,
    selectedRail: current.details.mode === room.mode && details.visibleRails.includes(current.selectedRail) ? current.selectedRail : details.primaryRail,
    appliedDetailsAt: nowIso(now),
  };
  return appendLog(next, "ui_mode_details_applied", nextStatus, next.selectedRail, blockers, now);
}

export function buildStreamRoomUiStateEvidenceSnapshot(
  state: StreamRoomUiStateRuntimeState,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  source: StreamBroadcastSourceReadinessRuntimeState,
  media: StreamMediaDevicePreviewRuntimeState,
  modeClean: StreamRoomModeCleanRuntimeState,
): StreamRoomUiStateEvidenceSnapshot {
  const details = STREAM_ROOM_UI_MODE_DETAILS[room.mode];
  const local = localBlockers(room, stage, media, details);
  const provider = providerBlockers(state.integration);
  const status = statusFor(room, stage, media, details, state.integration);
  const diagnosticsReady = media.diagnostics.deviceListCheckedLocal && media.diagnostics.networkDiagnosticCheckedLocal;
  return {
    version: "STREAM-109B",
    roomId: room.roomId,
    mode: room.mode,
    status,
    roomLifecycleStatus: room.status,
    selectedRail: state.selectedRail,
    primaryAction: primaryAction(room, stage, media, details, state.integration),
    modeTitle: details.title,
    modePurpose: details.purpose,
    requiredSource: details.requiredSource,
    actualSource: room.broadcast.source,
    recommendedLayout: details.recommendedLayout,
    actualLayout: stage.layout,
    visibleRails: details.visibleRails,
    localChecklist: details.localChecklist,
    providerChecklist: details.providerChecklist,
    localBlockers: local,
    providerBlockers: provider,
    diagnosticsReady,
    localPreviewEnabled: media.controls.previewEnabledLocal,
    sourceReadinessStatus: source.status,
    mediaPreviewStatus: media.status,
    modeCleanStatus: modeClean.status,
    backendRoomContract: state.integration.backendRoomContract,
    realtimeProvider: state.integration.realtimeProvider,
    mediaProvider: state.integration.mediaProvider,
    adminLaunchApproval: state.integration.adminLaunchApproval,
    fakeUiReadyAllowed: false,
    fakeOnAirAllowed: false,
    fakeProviderAllowed: false,
    fakePaymentAllowed: false,
    fakeGiftAllowed: false,
    fakeLaunchCompleteAllowed: false,
    readyForBackendUnion: local.length === 0,
  };
}
