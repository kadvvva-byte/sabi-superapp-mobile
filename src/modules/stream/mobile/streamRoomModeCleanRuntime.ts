import type { StreamLaunchMode } from "./streamActionRuntime";
import type { StreamBroadcastSource, StreamRoomRuntimeState } from "./streamRoomRuntime";
import type { StreamMediaDevicePreviewRuntimeState } from "./streamMediaDevicePreviewRuntime";
import type { StreamRoomLayoutState, StreamRoomStageRuntimeState } from "./streamRoomStageRuntime";

export type StreamRoomModeCleanStatus =
  | "pending_local"
  | "clean_pass_ready_local"
  | "clean_pass_blocked_local"
  | "provider_handoff_blocked";

export type StreamRoomModeCleanBlockerCode =
  | "mode_title_required"
  | "mode_topic_required"
  | "mode_host_required"
  | "mode_source_required"
  | "mode_layout_required"
  | "mode_preview_diagnostics_required"
  | "mode_local_preview_required"
  | "mode_group_cohost_required"
  | "mode_audio_microphone_required"
  | "mode_game_capture_required"
  | "mode_cinema_video_required"
  | "mode_business_visibility_required"
  | "mode_business_layout_required"
  | "mode_backend_room_contract_required"
  | "mode_realtime_provider_required"
  | "mode_media_provider_required"
  | "mode_admin_launch_approval_required";

export type StreamRoomModeCleanActionStatus =
  | "mode_clean_initialized"
  | "mode_clean_synced"
  | "mode_clean_pass_ran"
  | "mode_clean_provider_handoff_blocked";

export type StreamRoomModePolicy = {
  readonly mode: StreamLaunchMode;
  readonly label: string;
  readonly requiredSource: StreamBroadcastSource;
  readonly recommendedLayout: StreamRoomLayoutState;
  readonly minCohosts: number;
  readonly commentsRequired: boolean;
  readonly moderationRequired: boolean;
  readonly battleAllowed: boolean;
  readonly businessOnly: boolean;
  readonly providerContract: "direct_live" | "group_live" | "audio_room" | "game_broadcast" | "video_broadcast" | "business_stream";
};

export type StreamRoomModeCleanIntegrationState = {
  readonly backendRoomContract: "not_connected" | "connected";
  readonly realtimeProvider: "not_configured" | "configured";
  readonly mediaProvider: "not_configured" | "configured";
  readonly adminLaunchApproval: "not_submitted" | "pending" | "approved" | "rejected";
  readonly fakeModeReadyAllowed: false;
  readonly fakeOnAirAllowed: false;
  readonly fakeProviderAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftAllowed: false;
  readonly fakeLaunchCompleteAllowed: false;
};

export type StreamRoomModeCleanActionLogEntry = {
  readonly id: string;
  readonly action: string;
  readonly status: StreamRoomModeCleanActionStatus;
  readonly createdAt: string;
  readonly blockers: readonly StreamRoomModeCleanBlockerCode[];
};

export type StreamRoomModeCleanRuntimeState = {
  readonly version: "STREAM-109A";
  readonly roomId: string;
  readonly mode: StreamLaunchMode;
  readonly status: StreamRoomModeCleanStatus;
  readonly policy: StreamRoomModePolicy;
  readonly lastCleanPassAt: string | null;
  readonly integration: StreamRoomModeCleanIntegrationState;
  readonly actionLog: readonly StreamRoomModeCleanActionLogEntry[];
};

export type StreamRoomModeCleanEvidenceSnapshot = {
  readonly version: "STREAM-109A";
  readonly roomId: string;
  readonly mode: StreamLaunchMode;
  readonly status: StreamRoomModeCleanStatus;
  readonly policyLabel: string;
  readonly requiredSource: StreamBroadcastSource;
  readonly actualSource: StreamBroadcastSource | null;
  readonly recommendedLayout: StreamRoomLayoutState;
  readonly actualLayout: StreamRoomLayoutState;
  readonly providerContract: StreamRoomModePolicy["providerContract"];
  readonly participants: number;
  readonly cohosts: number;
  readonly comments: number;
  readonly localPreviewEnabled: boolean;
  readonly diagnosticsReady: boolean;
  readonly commentsRequired: boolean;
  readonly moderationRequired: boolean;
  readonly battleAllowed: boolean;
  readonly businessOnly: boolean;
  readonly localBlockers: readonly StreamRoomModeCleanBlockerCode[];
  readonly providerBlockers: readonly StreamRoomModeCleanBlockerCode[];
  readonly backendRoomContract: StreamRoomModeCleanIntegrationState["backendRoomContract"];
  readonly realtimeProvider: StreamRoomModeCleanIntegrationState["realtimeProvider"];
  readonly mediaProvider: StreamRoomModeCleanIntegrationState["mediaProvider"];
  readonly adminLaunchApproval: StreamRoomModeCleanIntegrationState["adminLaunchApproval"];
  readonly fakeModeReadyAllowed: false;
  readonly fakeOnAirAllowed: false;
  readonly fakeProviderAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftAllowed: false;
  readonly fakeLaunchCompleteAllowed: false;
  readonly readyForProviderHandoff: false;
  readonly readyForBackendUnion: boolean;
};

export const STREAM_ROOM_MODE_POLICIES: Record<StreamLaunchMode, StreamRoomModePolicy> = {
  soloLive: {
    mode: "soloLive",
    label: "Direct live",
    requiredSource: "camera",
    recommendedLayout: "single",
    minCohosts: 0,
    commentsRequired: true,
    moderationRequired: true,
    battleAllowed: true,
    businessOnly: false,
    providerContract: "direct_live",
  },
  groupLive: {
    mode: "groupLive",
    label: "Group live room",
    requiredSource: "camera",
    recommendedLayout: "grid",
    minCohosts: 1,
    commentsRequired: true,
    moderationRequired: true,
    battleAllowed: true,
    businessOnly: false,
    providerContract: "group_live",
  },
  audioLive: {
    mode: "audioLive",
    label: "Audio room",
    requiredSource: "microphone",
    recommendedLayout: "stage",
    minCohosts: 0,
    commentsRequired: true,
    moderationRequired: true,
    battleAllowed: false,
    businessOnly: false,
    providerContract: "audio_room",
  },
  gameLive: {
    mode: "gameLive",
    label: "Game broadcast",
    requiredSource: "game_capture",
    recommendedLayout: "game_overlay",
    minCohosts: 0,
    commentsRequired: true,
    moderationRequired: true,
    battleAllowed: true,
    businessOnly: false,
    providerContract: "game_broadcast",
  },
  cinemaLive: {
    mode: "cinemaLive",
    label: "Video broadcast",
    requiredSource: "video_file",
    recommendedLayout: "cinema",
    minCohosts: 0,
    commentsRequired: true,
    moderationRequired: true,
    battleAllowed: false,
    businessOnly: false,
    providerContract: "video_broadcast",
  },
  businessLive: {
    mode: "businessLive",
    label: "Business Stream",
    requiredSource: "camera",
    recommendedLayout: "business_showcase",
    minCohosts: 0,
    commentsRequired: true,
    moderationRequired: true,
    battleAllowed: false,
    businessOnly: true,
    providerContract: "business_stream",
  },
};

const MAX_MODE_CLEAN_LOG = 40;

function nowIso(now?: Date | string | number): string {
  if (now instanceof Date) return now.toISOString();
  if (typeof now === "string") return new Date(now).toISOString();
  if (typeof now === "number") return new Date(now).toISOString();
  return new Date().toISOString();
}

function integrationDefaults(): StreamRoomModeCleanIntegrationState {
  return {
    backendRoomContract: "not_connected",
    realtimeProvider: "not_configured",
    mediaProvider: "not_configured",
    adminLaunchApproval: "not_submitted",
    fakeModeReadyAllowed: false,
    fakeOnAirAllowed: false,
    fakeProviderAllowed: false,
    fakePaymentAllowed: false,
    fakeGiftAllowed: false,
    fakeLaunchCompleteAllowed: false,
  };
}

function appendLog(
  state: StreamRoomModeCleanRuntimeState,
  action: string,
  status: StreamRoomModeCleanActionStatus,
  blockers: readonly StreamRoomModeCleanBlockerCode[] = [],
  now?: Date | string | number,
): StreamRoomModeCleanRuntimeState {
  const createdAt = nowIso(now);
  return {
    ...state,
    actionLog: [{ id: `${action}-${createdAt}`, action, status, createdAt, blockers }, ...state.actionLog].slice(0, MAX_MODE_CLEAN_LOG),
  };
}

function unique<T extends string>(items: readonly T[]): readonly T[] {
  return Array.from(new Set(items));
}

function localBlockers(
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  media: StreamMediaDevicePreviewRuntimeState,
  policy: StreamRoomModePolicy,
): readonly StreamRoomModeCleanBlockerCode[] {
  const blockers: StreamRoomModeCleanBlockerCode[] = [];
  if (!room.title.trim()) blockers.push("mode_title_required");
  if (!room.topic.trim()) blockers.push("mode_topic_required");
  if (!room.participants.some((participant) => participant.role === "host" && !participant.blocked)) blockers.push("mode_host_required");
  if (!room.broadcast.source) blockers.push("mode_source_required");
  if (room.broadcast.source !== policy.requiredSource) blockers.push(sourceBlockerForPolicy(policy));
  if (stage.layout !== policy.recommendedLayout) blockers.push("mode_layout_required");
  if (!media.diagnostics.deviceListCheckedLocal || !media.diagnostics.networkDiagnosticCheckedLocal) blockers.push("mode_preview_diagnostics_required");
  if (!media.controls.previewEnabledLocal) blockers.push("mode_local_preview_required");
  if (policy.minCohosts > 0 && room.participants.filter((participant) => participant.role === "cohost" && !participant.blocked).length < policy.minCohosts) blockers.push("mode_group_cohost_required");
  if (policy.businessOnly && room.visibility !== "business_only") blockers.push("mode_business_visibility_required");
  if (policy.businessOnly && stage.layout !== "business_showcase") blockers.push("mode_business_layout_required");
  return unique(blockers);
}

function sourceBlockerForPolicy(policy: StreamRoomModePolicy): StreamRoomModeCleanBlockerCode {
  if (policy.mode === "audioLive") return "mode_audio_microphone_required";
  if (policy.mode === "gameLive") return "mode_game_capture_required";
  if (policy.mode === "cinemaLive") return "mode_cinema_video_required";
  return "mode_source_required";
}

function providerBlockers(integration: StreamRoomModeCleanIntegrationState): readonly StreamRoomModeCleanBlockerCode[] {
  const blockers: StreamRoomModeCleanBlockerCode[] = [];
  if (integration.backendRoomContract !== "connected") blockers.push("mode_backend_room_contract_required");
  if (integration.realtimeProvider !== "configured") blockers.push("mode_realtime_provider_required");
  if (integration.mediaProvider !== "configured") blockers.push("mode_media_provider_required");
  if (integration.adminLaunchApproval !== "approved") blockers.push("mode_admin_launch_approval_required");
  return blockers;
}

function nextStatus(
  state: StreamRoomModeCleanRuntimeState,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  media: StreamMediaDevicePreviewRuntimeState,
): StreamRoomModeCleanStatus {
  const local = localBlockers(room, stage, media, state.policy);
  if (local.length > 0) return "clean_pass_blocked_local";
  return providerBlockers(state.integration).length > 0 ? "provider_handoff_blocked" : "clean_pass_ready_local";
}

export function createInitialStreamRoomModeCleanState(room: StreamRoomRuntimeState): StreamRoomModeCleanRuntimeState {
  const initial: StreamRoomModeCleanRuntimeState = {
    version: "STREAM-109A",
    roomId: room.roomId,
    mode: room.mode,
    status: "pending_local",
    policy: STREAM_ROOM_MODE_POLICIES[room.mode],
    lastCleanPassAt: null,
    integration: integrationDefaults(),
    actionLog: [],
  };
  return appendLog(initial, "mode_clean_initialized", "mode_clean_initialized");
}

export function syncStreamRoomModeCleanState(current: StreamRoomModeCleanRuntimeState, room: StreamRoomRuntimeState): StreamRoomModeCleanRuntimeState {
  if (current.roomId === room.roomId && current.mode === room.mode) return current;
  return appendLog(
    {
      ...current,
      roomId: room.roomId,
      mode: room.mode,
      policy: STREAM_ROOM_MODE_POLICIES[room.mode],
      status: "pending_local",
    },
    "mode_clean_synced",
    "mode_clean_synced",
  );
}

export function runStreamRoomModeCleanPass(
  current: StreamRoomModeCleanRuntimeState,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  media: StreamMediaDevicePreviewRuntimeState,
  now?: Date | string | number,
): StreamRoomModeCleanRuntimeState {
  const local = localBlockers(room, stage, media, current.policy);
  const provider = providerBlockers(current.integration);
  const status = local.length > 0 ? "mode_clean_pass_ran" : provider.length > 0 ? "mode_clean_provider_handoff_blocked" : "mode_clean_pass_ran";
  const next: StreamRoomModeCleanRuntimeState = {
    ...current,
    status: nextStatus(current, room, stage, media),
    lastCleanPassAt: nowIso(now),
  };
  return appendLog(next, "mode_clean_pass_ran", status, [...local, ...provider], now);
}

export function buildStreamRoomModeCleanEvidenceSnapshot(
  state: StreamRoomModeCleanRuntimeState,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  media: StreamMediaDevicePreviewRuntimeState,
): StreamRoomModeCleanEvidenceSnapshot {
  const local = localBlockers(room, stage, media, state.policy);
  const provider = providerBlockers(state.integration);
  const cohosts = room.participants.filter((participant) => participant.role === "cohost" && !participant.blocked).length;
  return {
    version: "STREAM-109A",
    roomId: room.roomId,
    mode: room.mode,
    status: state.status,
    policyLabel: state.policy.label,
    requiredSource: state.policy.requiredSource,
    actualSource: room.broadcast.source,
    recommendedLayout: state.policy.recommendedLayout,
    actualLayout: stage.layout,
    providerContract: state.policy.providerContract,
    participants: room.participants.length,
    cohosts,
    comments: room.comments.length,
    localPreviewEnabled: media.controls.previewEnabledLocal,
    diagnosticsReady: media.diagnostics.deviceListCheckedLocal && media.diagnostics.networkDiagnosticCheckedLocal,
    commentsRequired: state.policy.commentsRequired,
    moderationRequired: state.policy.moderationRequired,
    battleAllowed: state.policy.battleAllowed,
    businessOnly: state.policy.businessOnly,
    localBlockers: local,
    providerBlockers: provider,
    backendRoomContract: state.integration.backendRoomContract,
    realtimeProvider: state.integration.realtimeProvider,
    mediaProvider: state.integration.mediaProvider,
    adminLaunchApproval: state.integration.adminLaunchApproval,
    fakeModeReadyAllowed: false,
    fakeOnAirAllowed: false,
    fakeProviderAllowed: false,
    fakePaymentAllowed: false,
    fakeGiftAllowed: false,
    fakeLaunchCompleteAllowed: false,
    readyForProviderHandoff: false,
    readyForBackendUnion: local.length === 0,
  };
}
