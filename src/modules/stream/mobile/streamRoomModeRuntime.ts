import type { StreamLaunchMode } from "./streamActionRuntime";
import type { StreamBroadcastSource } from "./streamRoomRuntime";

export type StreamRoomModeCategory = "ordinary" | "group" | "audio" | "game" | "video" | "business";
export type StreamModeReadinessStatus = "local_ready" | "local_blocked" | "provider_required";
export type StreamModeActionStatus =
  | "mode_runtime_initialized"
  | "mode_selected"
  | "seat_plan_updated"
  | "source_intent_updated"
  | "layout_updated"
  | "comments_policy_updated"
  | "mode_local_ready"
  | "provider_handoff_blocked";

export type StreamRoomModeBlockerCode =
  | "camera_required_for_ordinary_live"
  | "microphone_required_for_audio_live"
  | "group_capacity_required"
  | "cohost_seat_limit_required"
  | "game_source_provider_required"
  | "video_source_provider_required"
  | "screen_share_provider_required"
  | "rtmp_provider_required"
  | "business_admin_contract_required"
  | "backend_room_contract_required"
  | "realtime_provider_required"
  | "media_provider_required"
  | "admin_launch_approval_required";

export type StreamRoomModeCapability = {
  readonly mode: StreamLaunchMode;
  readonly category: StreamRoomModeCategory;
  readonly title: string;
  readonly description: string;
  readonly defaultSource: StreamBroadcastSource;
  readonly minParticipants: number;
  readonly maxParticipants: number;
  readonly maxCohosts: number;
  readonly commentsEnabledByDefault: boolean;
  readonly battlesAllowed: boolean;
  readonly screenShareAllowed: boolean;
  readonly gameCaptureAllowed: boolean;
  readonly videoFileAllowed: boolean;
  readonly businessToolsAllowed: boolean;
};

export type StreamRoomModeIntegrationState = {
  readonly backendRoomContract: "not_connected" | "connected";
  readonly realtimeProvider: "not_configured" | "configured";
  readonly mediaProvider: "not_configured" | "configured";
  readonly adminLaunchApproval: "not_submitted" | "pending" | "approved" | "rejected";
  readonly businessAdminContract: "not_connected" | "connected";
  readonly gameCaptureProvider: "not_configured" | "configured";
  readonly videoStorageProvider: "not_configured" | "configured";
  readonly screenShareProvider: "not_configured" | "configured";
  readonly rtmpProvider: "not_configured" | "configured";
};

export type StreamRoomModeState = {
  readonly version: "STREAM-108T";
  readonly selectedMode: StreamLaunchMode;
  readonly capabilities: readonly StreamRoomModeCapability[];
  readonly selectedCapability: StreamRoomModeCapability;
  readonly requestedSource: StreamBroadcastSource;
  readonly participantCapacity: number;
  readonly cohostSeatLimit: number;
  readonly commentsEnabled: boolean;
  readonly battlesEnabled: boolean;
  readonly layout: "single" | "grid" | "stage" | "game_overlay" | "cinema" | "business_showcase";
  readonly integration: StreamRoomModeIntegrationState;
  readonly fakeOnAirAllowed: false;
  readonly fakeProviderAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftAllowed: false;
  readonly actionLog: readonly StreamRoomModeActionLogEntry[];
};

export type StreamRoomModeActionLogEntry = {
  readonly id: string;
  readonly action: string;
  readonly status: StreamModeActionStatus;
  readonly createdAt: string;
  readonly blockers: readonly StreamRoomModeBlockerCode[];
};

export type StreamRoomModeActionResult = {
  readonly status: StreamModeActionStatus;
  readonly state: StreamRoomModeState;
  readonly localBlockers: readonly StreamRoomModeBlockerCode[];
  readonly providerBlockers: readonly StreamRoomModeBlockerCode[];
  readonly localReady: boolean;
  readonly providerHandoffAllowed: false;
};

export type StreamRoomModeEvidenceSnapshot = {
  readonly version: "STREAM-108T";
  readonly selectedMode: StreamLaunchMode;
  readonly category: StreamRoomModeCategory;
  readonly requestedSource: StreamBroadcastSource;
  readonly participantCapacity: number;
  readonly cohostSeatLimit: number;
  readonly commentsEnabled: boolean;
  readonly battlesEnabled: boolean;
  readonly layout: StreamRoomModeState["layout"];
  readonly localBlockers: readonly StreamRoomModeBlockerCode[];
  readonly providerBlockers: readonly StreamRoomModeBlockerCode[];
  readonly fakeOnAirAllowed: false;
  readonly fakeProviderAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftAllowed: false;
  readonly readyForBackendUnion: boolean;
};

const MAX_MODE_LOG = 36;

export const STREAM_ROOM_MODE_CAPABILITIES: readonly StreamRoomModeCapability[] = [
  {
    mode: "soloLive",
    category: "ordinary",
    title: "Ordinary live",
    description: "Direct host camera broadcast room with comments and optional battle draft.",
    defaultSource: "camera",
    minParticipants: 1,
    maxParticipants: 1200,
    maxCohosts: 1,
    commentsEnabledByDefault: true,
    battlesAllowed: true,
    screenShareAllowed: false,
    gameCaptureAllowed: false,
    videoFileAllowed: false,
    businessToolsAllowed: false,
  },
  {
    mode: "groupLive",
    category: "group",
    title: "Group live",
    description: "Multi-host room with viewers, co-host seats, comments, and moderation controls.",
    defaultSource: "camera",
    minParticipants: 2,
    maxParticipants: 2000,
    maxCohosts: 8,
    commentsEnabledByDefault: true,
    battlesAllowed: true,
    screenShareAllowed: true,
    gameCaptureAllowed: false,
    videoFileAllowed: false,
    businessToolsAllowed: false,
  },
  {
    mode: "audioLive",
    category: "audio",
    title: "Audio room",
    description: "Voice-first stage room with speakers, listeners, comments, and moderation.",
    defaultSource: "microphone",
    minParticipants: 1,
    maxParticipants: 5000,
    maxCohosts: 12,
    commentsEnabledByDefault: true,
    battlesAllowed: false,
    screenShareAllowed: false,
    gameCaptureAllowed: false,
    videoFileAllowed: false,
    businessToolsAllowed: false,
  },
  {
    mode: "gameLive",
    category: "game",
    title: "Game broadcast",
    description: "Game/screen broadcast room with camera overlay, comments, and co-host support.",
    defaultSource: "game_capture",
    minParticipants: 1,
    maxParticipants: 2500,
    maxCohosts: 4,
    commentsEnabledByDefault: true,
    battlesAllowed: true,
    screenShareAllowed: true,
    gameCaptureAllowed: true,
    videoFileAllowed: false,
    businessToolsAllowed: false,
  },
  {
    mode: "cinemaLive",
    category: "video",
    title: "Video broadcast",
    description: "Prepared video/source broadcast room with chat and provider storage handoff.",
    defaultSource: "video_file",
    minParticipants: 1,
    maxParticipants: 2500,
    maxCohosts: 2,
    commentsEnabledByDefault: true,
    battlesAllowed: false,
    screenShareAllowed: false,
    gameCaptureAllowed: false,
    videoFileAllowed: true,
    businessToolsAllowed: false,
  },
  {
    mode: "businessLive",
    category: "business",
    title: "Business Stream",
    description: "Business presentation room without payments, gifts, or monetization in this phase.",
    defaultSource: "camera",
    minParticipants: 1,
    maxParticipants: 3000,
    maxCohosts: 4,
    commentsEnabledByDefault: true,
    battlesAllowed: false,
    screenShareAllowed: true,
    gameCaptureAllowed: false,
    videoFileAllowed: true,
    businessToolsAllowed: true,
  },
] as const;

function nowIso(now?: Date | string | number): string {
  if (now instanceof Date) return now.toISOString();
  if (typeof now === "string") return new Date(now).toISOString();
  if (typeof now === "number") return new Date(now).toISOString();
  return new Date().toISOString();
}

function modeCapability(mode: StreamLaunchMode): StreamRoomModeCapability {
  return STREAM_ROOM_MODE_CAPABILITIES.find((item) => item.mode === mode) ?? STREAM_ROOM_MODE_CAPABILITIES[0];
}

function defaultLayout(capability: StreamRoomModeCapability): StreamRoomModeState["layout"] {
  if (capability.mode === "groupLive") return "grid";
  if (capability.mode === "audioLive") return "stage";
  if (capability.mode === "gameLive") return "game_overlay";
  if (capability.mode === "cinemaLive") return "cinema";
  if (capability.mode === "businessLive") return "business_showcase";
  return "single";
}

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, Math.floor(value)));
}

function defaultIntegration(): StreamRoomModeIntegrationState {
  return {
    backendRoomContract: "not_connected",
    realtimeProvider: "not_configured",
    mediaProvider: "not_configured",
    adminLaunchApproval: "not_submitted",
    businessAdminContract: "not_connected",
    gameCaptureProvider: "not_configured",
    videoStorageProvider: "not_configured",
    screenShareProvider: "not_configured",
    rtmpProvider: "not_configured",
  };
}

function appendModeLog(
  state: StreamRoomModeState,
  action: string,
  status: StreamModeActionStatus,
  blockers: readonly StreamRoomModeBlockerCode[] = [],
  now?: Date | string | number,
): StreamRoomModeState {
  const createdAt = nowIso(now);
  return {
    ...state,
    actionLog: [{ id: `${action}-${createdAt}`, action, status, createdAt, blockers }, ...state.actionLog].slice(0, MAX_MODE_LOG),
  };
}

export function createInitialStreamRoomModeState(params: {
  readonly mode?: StreamLaunchMode;
  readonly integration?: Partial<StreamRoomModeIntegrationState>;
  readonly now?: Date | string | number;
} = {}): StreamRoomModeState {
  const capability = modeCapability(params.mode ?? "soloLive");
  const state: StreamRoomModeState = {
    version: "STREAM-108T",
    selectedMode: capability.mode,
    capabilities: STREAM_ROOM_MODE_CAPABILITIES,
    selectedCapability: capability,
    requestedSource: capability.defaultSource,
    participantCapacity: capability.maxParticipants,
    cohostSeatLimit: capability.maxCohosts,
    commentsEnabled: capability.commentsEnabledByDefault,
    battlesEnabled: capability.battlesAllowed,
    layout: defaultLayout(capability),
    integration: { ...defaultIntegration(), ...params.integration },
    fakeOnAirAllowed: false,
    fakeProviderAllowed: false,
    fakePaymentAllowed: false,
    fakeGiftAllowed: false,
    actionLog: [],
  };
  return appendModeLog(state, "mode_runtime_initialized", "mode_runtime_initialized", [], params.now);
}

export function getStreamRoomModeLocalBlockers(state: StreamRoomModeState): readonly StreamRoomModeBlockerCode[] {
  const blockers: StreamRoomModeBlockerCode[] = [];
  const capability = state.selectedCapability;

  if ((capability.mode === "soloLive" || capability.mode === "groupLive" || capability.mode === "businessLive") && state.requestedSource !== "camera" && state.requestedSource !== "screen_share" && state.requestedSource !== "video_file") {
    blockers.push("camera_required_for_ordinary_live");
  }
  if (capability.mode === "audioLive" && state.requestedSource !== "microphone") blockers.push("microphone_required_for_audio_live");
  if (capability.mode === "groupLive" && state.participantCapacity < 2) blockers.push("group_capacity_required");
  if ((capability.mode === "groupLive" || capability.mode === "audioLive") && state.cohostSeatLimit < 1) blockers.push("cohost_seat_limit_required");

  return blockers;
}

export function getStreamRoomModeProviderBlockers(state: StreamRoomModeState): readonly StreamRoomModeBlockerCode[] {
  const blockers: StreamRoomModeBlockerCode[] = [];
  if (state.integration.backendRoomContract !== "connected") blockers.push("backend_room_contract_required");
  if (state.integration.realtimeProvider !== "configured") blockers.push("realtime_provider_required");
  if (state.integration.mediaProvider !== "configured") blockers.push("media_provider_required");
  if (state.integration.adminLaunchApproval !== "approved") blockers.push("admin_launch_approval_required");
  if (state.selectedMode === "businessLive" && state.integration.businessAdminContract !== "connected") blockers.push("business_admin_contract_required");
  if (state.requestedSource === "game_capture" && state.integration.gameCaptureProvider !== "configured") blockers.push("game_source_provider_required");
  if (state.requestedSource === "video_file" && state.integration.videoStorageProvider !== "configured") blockers.push("video_source_provider_required");
  if (state.requestedSource === "screen_share" && state.integration.screenShareProvider !== "configured") blockers.push("screen_share_provider_required");
  if (state.requestedSource === "external_rtmp" && state.integration.rtmpProvider !== "configured") blockers.push("rtmp_provider_required");
  return blockers;
}

function buildModeResult(status: StreamModeActionStatus, state: StreamRoomModeState): StreamRoomModeActionResult {
  const localBlockers = getStreamRoomModeLocalBlockers(state);
  const providerBlockers = getStreamRoomModeProviderBlockers(state);
  return {
    status,
    state,
    localBlockers,
    providerBlockers,
    localReady: localBlockers.length === 0,
    providerHandoffAllowed: false,
  };
}

export function selectStreamRoomMode(state: StreamRoomModeState, mode: StreamLaunchMode, now?: Date | string | number): StreamRoomModeActionResult {
  const capability = modeCapability(mode);
  const next: StreamRoomModeState = {
    ...state,
    selectedMode: capability.mode,
    selectedCapability: capability,
    requestedSource: capability.defaultSource,
    participantCapacity: capability.maxParticipants,
    cohostSeatLimit: capability.maxCohosts,
    commentsEnabled: capability.commentsEnabledByDefault,
    battlesEnabled: capability.battlesAllowed,
    layout: defaultLayout(capability),
  };
  return buildModeResult("mode_selected", appendModeLog(next, "mode_selected", "mode_selected", [], now));
}

export function updateStreamRoomSeatPlan(
  state: StreamRoomModeState,
  patch: { readonly participantCapacity?: number; readonly cohostSeatLimit?: number },
  now?: Date | string | number,
): StreamRoomModeActionResult {
  const capability = state.selectedCapability;
  const next: StreamRoomModeState = {
    ...state,
    participantCapacity: patch.participantCapacity === undefined ? state.participantCapacity : clamp(patch.participantCapacity, capability.minParticipants, capability.maxParticipants),
    cohostSeatLimit: patch.cohostSeatLimit === undefined ? state.cohostSeatLimit : clamp(patch.cohostSeatLimit, 0, capability.maxCohosts),
  };
  return buildModeResult("seat_plan_updated", appendModeLog(next, "seat_plan_updated", "seat_plan_updated", getStreamRoomModeLocalBlockers(next), now));
}

export function updateStreamRoomSourceIntent(state: StreamRoomModeState, source: StreamBroadcastSource, now?: Date | string | number): StreamRoomModeActionResult {
  const next = { ...state, requestedSource: source };
  return buildModeResult("source_intent_updated", appendModeLog(next, "source_intent_updated", "source_intent_updated", getStreamRoomModeProviderBlockers(next), now));
}

export function updateStreamRoomLayout(state: StreamRoomModeState, layout: StreamRoomModeState["layout"], now?: Date | string | number): StreamRoomModeActionResult {
  const next = { ...state, layout };
  return buildModeResult("layout_updated", appendModeLog(next, "layout_updated", "layout_updated", [], now));
}

export function updateStreamRoomCommentsPolicy(state: StreamRoomModeState, enabled: boolean, now?: Date | string | number): StreamRoomModeActionResult {
  const next = { ...state, commentsEnabled: enabled };
  return buildModeResult("comments_policy_updated", appendModeLog(next, "comments_policy_updated", "comments_policy_updated", [], now));
}

export function requestStreamRoomModeProviderHandoff(state: StreamRoomModeState, now?: Date | string | number): StreamRoomModeActionResult {
  const blockers = [...getStreamRoomModeLocalBlockers(state), ...getStreamRoomModeProviderBlockers(state)];
  return buildModeResult("provider_handoff_blocked", appendModeLog(state, "mode_provider_handoff_blocked", "provider_handoff_blocked", blockers, now));
}

export function buildStreamRoomModeEvidenceSnapshot(state: StreamRoomModeState): StreamRoomModeEvidenceSnapshot {
  const localBlockers = getStreamRoomModeLocalBlockers(state);
  const providerBlockers = getStreamRoomModeProviderBlockers(state);
  return {
    version: "STREAM-108T",
    selectedMode: state.selectedMode,
    category: state.selectedCapability.category,
    requestedSource: state.requestedSource,
    participantCapacity: state.participantCapacity,
    cohostSeatLimit: state.cohostSeatLimit,
    commentsEnabled: state.commentsEnabled,
    battlesEnabled: state.battlesEnabled,
    layout: state.layout,
    localBlockers,
    providerBlockers,
    fakeOnAirAllowed: false,
    fakeProviderAllowed: false,
    fakePaymentAllowed: false,
    fakeGiftAllowed: false,
    readyForBackendUnion: true,
  };
}
