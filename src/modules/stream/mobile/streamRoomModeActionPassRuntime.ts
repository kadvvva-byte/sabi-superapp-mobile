import type { StreamLaunchMode } from "./streamActionRuntime";
import type { StreamBroadcastSource, StreamRoomRuntimeState } from "./streamRoomRuntime";
import type { StreamRoomLayoutState, StreamRoomStageRuntimeState } from "./streamRoomStageRuntime";
import type { StreamMediaDevicePreviewQualityPresetId, StreamMediaDevicePreviewRuntimeState } from "./streamMediaDevicePreviewRuntime";
import type { StreamRoomModerationRuntimeState } from "./streamRoomModerationRuntime";
import type { StreamParticipantManagementRuntimeState } from "./streamRoomParticipantRuntime";

export type StreamRoomModeActionPassStatus =
  | "idle_local"
  | "mode_action_selected_local"
  | "local_actions_applied"
  | "local_blockers_visible"
  | "provider_handoff_blocked";

export type StreamRoomModeActionPassBlockerCode =
  | "action_room_title_required"
  | "action_room_topic_required"
  | "action_source_not_selected"
  | "action_required_source_mismatch"
  | "action_required_layout_mismatch"
  | "action_preview_quality_mismatch"
  | "action_media_diagnostics_required"
  | "action_local_preview_required"
  | "action_group_cohost_required"
  | "action_audio_microphone_required"
  | "action_comments_runtime_required"
  | "action_business_visibility_required"
  | "action_backend_room_contract_required"
  | "action_realtime_provider_required"
  | "action_media_provider_required"
  | "action_admin_launch_approval_required"
  | "action_source_provider_required";

export type StreamRoomModeActionPassPlan = {
  readonly mode: StreamLaunchMode;
  readonly title: string;
  readonly purpose: string;
  readonly requiredSource: StreamBroadcastSource;
  readonly requiredLayout: StreamRoomLayoutState;
  readonly qualityPreset: StreamMediaDevicePreviewQualityPresetId;
  readonly minimumParticipants: number;
  readonly minimumCohosts: number;
  readonly commentsRequired: boolean;
  readonly battleAllowed: boolean;
  readonly businessToolsAllowed: boolean;
  readonly localActions: readonly string[];
  readonly providerActions: readonly string[];
  readonly noPaymentOrGiftInThisPhase: true;
};

export type StreamRoomModeActionPassIntegrationState = {
  readonly backendRoomContract: "not_connected" | "connected";
  readonly realtimeProvider: "not_configured" | "configured";
  readonly mediaProvider: "not_configured" | "configured";
  readonly sourceProvider: "not_configured" | "configured";
  readonly adminLaunchApproval: "not_submitted" | "pending" | "approved" | "rejected";
  readonly fakeOnAirAllowed: false;
  readonly fakeProviderAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftAllowed: false;
  readonly fakeLaunchCompleteAllowed: false;
};

export type StreamRoomModeActionPassLogEntry = {
  readonly id: string;
  readonly action: string;
  readonly status: StreamRoomModeActionPassStatus;
  readonly createdAt: string;
  readonly blockers: readonly StreamRoomModeActionPassBlockerCode[];
};

export type StreamRoomModeActionPassRuntimeState = {
  readonly version: "STREAM-109C";
  readonly roomId: string;
  readonly mode: StreamLaunchMode;
  readonly status: StreamRoomModeActionPassStatus;
  readonly selectedPlan: StreamRoomModeActionPassPlan;
  readonly lastAppliedAt: string | null;
  readonly integration: StreamRoomModeActionPassIntegrationState;
  readonly actionLog: readonly StreamRoomModeActionPassLogEntry[];
};

export type StreamRoomModeActionPassEvidenceSnapshot = {
  readonly version: "STREAM-109C";
  readonly roomId: string;
  readonly mode: StreamLaunchMode;
  readonly status: StreamRoomModeActionPassStatus;
  readonly selectedPlanTitle: string;
  readonly purpose: string;
  readonly requiredSource: StreamBroadcastSource;
  readonly actualSource: StreamBroadcastSource | null;
  readonly requiredLayout: StreamRoomLayoutState;
  readonly actualLayout: StreamRoomLayoutState;
  readonly qualityPreset: StreamMediaDevicePreviewQualityPresetId;
  readonly actualQualityPreset: StreamMediaDevicePreviewQualityPresetId;
  readonly minimumParticipants: number;
  readonly actualParticipants: number;
  readonly minimumCohosts: number;
  readonly actualCohosts: number;
  readonly commentsRequired: boolean;
  readonly commentsLocked: boolean;
  readonly battleAllowed: boolean;
  readonly businessToolsAllowed: boolean;
  readonly localActions: readonly string[];
  readonly providerActions: readonly string[];
  readonly localBlockers: readonly StreamRoomModeActionPassBlockerCode[];
  readonly providerBlockers: readonly StreamRoomModeActionPassBlockerCode[];
  readonly backendRoomContract: StreamRoomModeActionPassIntegrationState["backendRoomContract"];
  readonly realtimeProvider: StreamRoomModeActionPassIntegrationState["realtimeProvider"];
  readonly mediaProvider: StreamRoomModeActionPassIntegrationState["mediaProvider"];
  readonly sourceProvider: StreamRoomModeActionPassIntegrationState["sourceProvider"];
  readonly adminLaunchApproval: StreamRoomModeActionPassIntegrationState["adminLaunchApproval"];
  readonly fakeOnAirAllowed: false;
  readonly fakeProviderAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftAllowed: false;
  readonly fakeLaunchCompleteAllowed: false;
  readonly readyForBackendUnion: boolean;
  readonly readyForProviderHandoff: false;
};

const MAX_ACTION_PASS_LOG = 50;

export const STREAM_ROOM_MODE_ACTION_PASS_PLANS: Record<StreamLaunchMode, StreamRoomModeActionPassPlan> = {
  soloLive: {
    mode: "soloLive",
    title: "Ordinary direct live",
    purpose: "Single-host camera live with comments, participants and local preview readiness.",
    requiredSource: "camera",
    requiredLayout: "single",
    qualityPreset: "mobile_balanced",
    minimumParticipants: 1,
    minimumCohosts: 0,
    commentsRequired: true,
    battleAllowed: true,
    businessToolsAllowed: false,
    localActions: ["select camera source", "single layout", "mobile balanced preview", "comments rail", "moderation rail"],
    providerActions: ["backend live room", "realtime comments", "media provider", "Admin launch approval"],
    noPaymentOrGiftInThisPhase: true,
  },
  groupLive: {
    mode: "groupLive",
    title: "Group live room",
    purpose: "Multi-host live room with co-host seats, grid layout, comments and moderation.",
    requiredSource: "camera",
    requiredLayout: "grid",
    qualityPreset: "mobile_balanced",
    minimumParticipants: 2,
    minimumCohosts: 1,
    commentsRequired: true,
    battleAllowed: true,
    businessToolsAllowed: false,
    localActions: ["select camera source", "grid layout", "co-host seat required", "participants rail", "comments rail"],
    providerActions: ["backend group room", "realtime co-host signaling", "media provider", "Admin launch approval"],
    noPaymentOrGiftInThisPhase: true,
  },
  audioLive: {
    mode: "audioLive",
    title: "Audio room",
    purpose: "Microphone-only stage room with speaker seats, comments and participant moderation.",
    requiredSource: "microphone",
    requiredLayout: "stage",
    qualityPreset: "low_data",
    minimumParticipants: 1,
    minimumCohosts: 0,
    commentsRequired: true,
    battleAllowed: false,
    businessToolsAllowed: false,
    localActions: ["select microphone source", "stage layout", "low data audio preset", "speaker seats", "moderation rail"],
    providerActions: ["backend audio room", "realtime audio stage", "media provider", "Admin launch approval"],
    noPaymentOrGiftInThisPhase: true,
  },
  gameLive: {
    mode: "gameLive",
    title: "Game broadcast",
    purpose: "Game/source capture room with low-latency preview, game overlay and chat moderation.",
    requiredSource: "game_capture",
    requiredLayout: "game_overlay",
    qualityPreset: "game_low_latency",
    minimumParticipants: 1,
    minimumCohosts: 0,
    commentsRequired: true,
    battleAllowed: true,
    businessToolsAllowed: false,
    localActions: ["select game capture source", "game overlay layout", "game low latency preset", "comments rail", "battle overlay optional"],
    providerActions: ["game capture provider", "backend room", "realtime comments", "media provider", "Admin launch approval"],
    noPaymentOrGiftInThisPhase: true,
  },
  cinemaLive: {
    mode: "cinemaLive",
    title: "Video broadcast",
    purpose: "Video-file broadcast room prepared for storage/CDN handoff and cinema layout.",
    requiredSource: "video_file",
    requiredLayout: "cinema",
    qualityPreset: "cinema_upload_ready",
    minimumParticipants: 1,
    minimumCohosts: 0,
    commentsRequired: true,
    battleAllowed: false,
    businessToolsAllowed: false,
    localActions: ["select video file source", "cinema layout", "cinema/video preset", "comments rail", "moderation rail"],
    providerActions: ["video storage provider", "CDN/media provider", "backend room", "Admin launch approval"],
    noPaymentOrGiftInThisPhase: true,
  },
  businessLive: {
    mode: "businessLive",
    title: "Business Stream room",
    purpose: "Business showcase stream room with presentation layout, comments and moderation, without payments yet.",
    requiredSource: "camera",
    requiredLayout: "business_showcase",
    qualityPreset: "hd_preview",
    minimumParticipants: 1,
    minimumCohosts: 0,
    commentsRequired: true,
    battleAllowed: false,
    businessToolsAllowed: true,
    localActions: ["select camera source", "business showcase layout", "HD preview", "comments rail", "moderation rail"],
    providerActions: ["backend business room", "business/Admin approval", "realtime provider", "media provider", "Admin launch approval"],
    noPaymentOrGiftInThisPhase: true,
  },
};

function nowIso(now?: Date | string | number): string {
  if (now instanceof Date) return now.toISOString();
  if (typeof now === "string") return new Date(now).toISOString();
  if (typeof now === "number") return new Date(now).toISOString();
  return new Date().toISOString();
}

function defaultIntegration(): StreamRoomModeActionPassIntegrationState {
  return {
    backendRoomContract: "not_connected",
    realtimeProvider: "not_configured",
    mediaProvider: "not_configured",
    sourceProvider: "not_configured",
    adminLaunchApproval: "not_submitted",
    fakeOnAirAllowed: false,
    fakeProviderAllowed: false,
    fakePaymentAllowed: false,
    fakeGiftAllowed: false,
    fakeLaunchCompleteAllowed: false,
  };
}

function appendLog(
  state: StreamRoomModeActionPassRuntimeState,
  action: string,
  status: StreamRoomModeActionPassStatus,
  blockers: readonly StreamRoomModeActionPassBlockerCode[] = [],
  now?: Date | string | number,
): StreamRoomModeActionPassRuntimeState {
  const createdAt = nowIso(now);
  return {
    ...state,
    actionLog: [{ id: `${action}-${createdAt}`, action, status, createdAt, blockers }, ...state.actionLog].slice(0, MAX_ACTION_PASS_LOG),
  };
}

function unique<T extends string>(items: readonly T[]): readonly T[] {
  return Array.from(new Set(items));
}

export function getStreamRoomModeActionPassPlan(mode: StreamLaunchMode): StreamRoomModeActionPassPlan {
  return STREAM_ROOM_MODE_ACTION_PASS_PLANS[mode];
}

function cohostCount(room: StreamRoomRuntimeState): number {
  return room.participants.filter((participant) => participant.role === "cohost" && !participant.blocked).length;
}

function localBlockersFor(
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  moderation: StreamRoomModerationRuntimeState,
  participants: StreamParticipantManagementRuntimeState,
  media: StreamMediaDevicePreviewRuntimeState,
  plan: StreamRoomModeActionPassPlan,
): readonly StreamRoomModeActionPassBlockerCode[] {
  void participants;
  const blockers: StreamRoomModeActionPassBlockerCode[] = [];
  if (!room.title.trim()) blockers.push("action_room_title_required");
  if (!room.topic.trim()) blockers.push("action_room_topic_required");
  if (!room.broadcast.source) blockers.push("action_source_not_selected");
  if (room.broadcast.source !== plan.requiredSource) blockers.push("action_required_source_mismatch");
  if (stage.layout !== plan.requiredLayout) blockers.push("action_required_layout_mismatch");
  if (media.selectedQualityPreset !== plan.qualityPreset) blockers.push("action_preview_quality_mismatch");
  if (!media.diagnostics.deviceListCheckedLocal || !media.diagnostics.networkDiagnosticCheckedLocal) blockers.push("action_media_diagnostics_required");
  if (!media.controls.previewEnabledLocal) blockers.push("action_local_preview_required");
  if (plan.mode === "groupLive" && cohostCount(room) < plan.minimumCohosts) blockers.push("action_group_cohost_required");
  if (plan.mode === "audioLive" && room.broadcast.source !== "microphone") blockers.push("action_audio_microphone_required");
  if (plan.commentsRequired && moderation.commentsLocked) blockers.push("action_comments_runtime_required");
  if (plan.mode === "businessLive" && room.visibility !== "business_only") blockers.push("action_business_visibility_required");
  return unique(blockers);
}

function sourceNeedsProvider(source: StreamBroadcastSource): boolean {
  return source === "screen_share" || source === "game_capture" || source === "video_file" || source === "external_rtmp";
}

function providerBlockersFor(
  integration: StreamRoomModeActionPassIntegrationState,
  source: StreamBroadcastSource | null,
): readonly StreamRoomModeActionPassBlockerCode[] {
  const blockers: StreamRoomModeActionPassBlockerCode[] = [];
  if (integration.backendRoomContract !== "connected") blockers.push("action_backend_room_contract_required");
  if (integration.realtimeProvider !== "configured") blockers.push("action_realtime_provider_required");
  if (integration.mediaProvider !== "configured") blockers.push("action_media_provider_required");
  if (source && sourceNeedsProvider(source) && integration.sourceProvider !== "configured") blockers.push("action_source_provider_required");
  if (integration.adminLaunchApproval !== "approved") blockers.push("action_admin_launch_approval_required");
  return blockers;
}

function deriveStatus(
  local: readonly StreamRoomModeActionPassBlockerCode[],
  provider: readonly StreamRoomModeActionPassBlockerCode[],
  hadAppliedAt: string | null,
): StreamRoomModeActionPassStatus {
  if (local.length > 0) return "local_blockers_visible";
  if (provider.length > 0) return "provider_handoff_blocked";
  return hadAppliedAt ? "local_actions_applied" : "mode_action_selected_local";
}

export function createInitialStreamRoomModeActionPassState(room: StreamRoomRuntimeState): StreamRoomModeActionPassRuntimeState {
  const initial: StreamRoomModeActionPassRuntimeState = {
    version: "STREAM-109C",
    roomId: room.roomId,
    mode: room.mode,
    status: "idle_local",
    selectedPlan: getStreamRoomModeActionPassPlan(room.mode),
    lastAppliedAt: null,
    integration: defaultIntegration(),
    actionLog: [],
  };
  return appendLog(initial, "mode_action_pass_initialized", "idle_local");
}

export function syncStreamRoomModeActionPassState(
  state: StreamRoomModeActionPassRuntimeState,
  room: StreamRoomRuntimeState,
): StreamRoomModeActionPassRuntimeState {
  if (state.roomId === room.roomId && state.mode === room.mode) return state;
  const next: StreamRoomModeActionPassRuntimeState = {
    ...state,
    roomId: room.roomId,
    mode: room.mode,
    status: "idle_local",
    selectedPlan: getStreamRoomModeActionPassPlan(room.mode),
    lastAppliedAt: null,
  };
  return appendLog(next, "mode_action_pass_synced", "idle_local");
}

export function runStreamRoomModeActionPassLocal(
  state: StreamRoomModeActionPassRuntimeState,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  moderation: StreamRoomModerationRuntimeState,
  participants: StreamParticipantManagementRuntimeState,
  media: StreamMediaDevicePreviewRuntimeState,
  now?: Date | string | number,
): StreamRoomModeActionPassRuntimeState {
  const plan = getStreamRoomModeActionPassPlan(room.mode);
  const local = localBlockersFor(room, stage, moderation, participants, media, plan);
  const provider = providerBlockersFor(state.integration, room.broadcast.source);
  const appliedAt = nowIso(now);
  const next: StreamRoomModeActionPassRuntimeState = {
    ...state,
    roomId: room.roomId,
    mode: room.mode,
    selectedPlan: plan,
    lastAppliedAt: appliedAt,
    status: deriveStatus(local, provider, appliedAt),
  };
  return appendLog(next, `mode_action_pass:${room.mode}`, next.status, [...local, ...provider], now);
}

export function buildStreamRoomModeActionPassEvidenceSnapshot(
  state: StreamRoomModeActionPassRuntimeState,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  moderation: StreamRoomModerationRuntimeState,
  participants: StreamParticipantManagementRuntimeState,
  media: StreamMediaDevicePreviewRuntimeState,
): StreamRoomModeActionPassEvidenceSnapshot {
  const plan = getStreamRoomModeActionPassPlan(room.mode);
  const local = localBlockersFor(room, stage, moderation, participants, media, plan);
  const provider = providerBlockersFor(state.integration, room.broadcast.source);
  const status = deriveStatus(local, provider, state.lastAppliedAt);
  return {
    version: "STREAM-109C",
    roomId: room.roomId,
    mode: room.mode,
    status,
    selectedPlanTitle: plan.title,
    purpose: plan.purpose,
    requiredSource: plan.requiredSource,
    actualSource: room.broadcast.source,
    requiredLayout: plan.requiredLayout,
    actualLayout: stage.layout,
    qualityPreset: plan.qualityPreset,
    actualQualityPreset: media.selectedQualityPreset,
    minimumParticipants: plan.minimumParticipants,
    actualParticipants: room.participants.filter((participant) => !participant.blocked).length,
    minimumCohosts: plan.minimumCohosts,
    actualCohosts: cohostCount(room),
    commentsRequired: plan.commentsRequired,
    commentsLocked: moderation.commentsLocked,
    battleAllowed: plan.battleAllowed,
    businessToolsAllowed: plan.businessToolsAllowed,
    localActions: plan.localActions,
    providerActions: plan.providerActions,
    localBlockers: local,
    providerBlockers: provider,
    backendRoomContract: state.integration.backendRoomContract,
    realtimeProvider: state.integration.realtimeProvider,
    mediaProvider: state.integration.mediaProvider,
    sourceProvider: state.integration.sourceProvider,
    adminLaunchApproval: state.integration.adminLaunchApproval,
    fakeOnAirAllowed: false,
    fakeProviderAllowed: false,
    fakePaymentAllowed: false,
    fakeGiftAllowed: false,
    fakeLaunchCompleteAllowed: false,
    readyForBackendUnion: local.length === 0,
    readyForProviderHandoff: false,
  };
}
