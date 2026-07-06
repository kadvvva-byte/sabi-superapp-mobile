import type { StreamBroadcastSource, StreamRoomRuntimeState } from "./streamRoomRuntime";

export type StreamBroadcastSourceReadinessStatus =
  | "not_selected"
  | "local_source_selected"
  | "permission_path_required"
  | "local_device_ready"
  | "local_media_intent_ready"
  | "provider_handoff_blocked";

export type StreamBroadcastSourceReadinessBlockerCode =
  | "broadcast_source_required"
  | "camera_permission_required"
  | "microphone_permission_required"
  | "screen_capture_provider_required"
  | "game_capture_provider_required"
  | "video_file_intent_required"
  | "video_storage_provider_required"
  | "rtmp_url_required"
  | "rtmp_ingest_provider_required"
  | "backend_room_contract_required"
  | "realtime_provider_required"
  | "media_provider_required"
  | "admin_launch_approval_required";

export type StreamBroadcastSourceContractStatus = "not_connected" | "not_configured" | "configured" | "approved" | "not_submitted";

export type StreamBroadcastSourceDeviceState = {
  readonly cameraPermissionPathRequested: boolean;
  readonly microphonePermissionPathRequested: boolean;
  readonly screenCaptureIntent: boolean;
  readonly gameCaptureIntent: boolean;
  readonly videoFileIntent: string | null;
  readonly externalRtmpUrlIntent: string | null;
  readonly localOnly: true;
};

export type StreamBroadcastSourceIntegrationState = {
  readonly backendRoomContract: "not_connected" | "connected";
  readonly realtimeProvider: "not_configured" | "configured";
  readonly mediaProvider: "not_configured" | "configured";
  readonly screenCaptureProvider: "not_configured" | "configured";
  readonly gameCaptureProvider: "not_configured" | "configured";
  readonly videoStorageProvider: "not_connected" | "connected";
  readonly rtmpIngestProvider: "not_configured" | "configured";
  readonly adminLaunchApproval: "not_submitted" | "pending" | "approved" | "rejected";
  readonly fakeSourceProviderAllowed: false;
  readonly fakeOnAirAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftAllowed: false;
  readonly fakeLaunchCompleteAllowed: false;
};

export type StreamBroadcastSourceReadinessRuntimeState = {
  readonly version: "STREAM-108Y";
  readonly roomId: string;
  readonly selectedSource: StreamBroadcastSource | null;
  readonly status: StreamBroadcastSourceReadinessStatus;
  readonly device: StreamBroadcastSourceDeviceState;
  readonly integration: StreamBroadcastSourceIntegrationState;
  readonly providerHandoffRequested: boolean;
  readonly actionLog: readonly StreamBroadcastSourceReadinessActionLogEntry[];
};

export type StreamBroadcastSourceReadinessActionStatus =
  | "source_readiness_initialized"
  | "source_selected_local"
  | "permission_path_recorded"
  | "media_intent_recorded"
  | "provider_handoff_blocked";

export type StreamBroadcastSourceReadinessActionLogEntry = {
  readonly id: string;
  readonly action: string;
  readonly status: StreamBroadcastSourceReadinessActionStatus;
  readonly createdAt: string;
  readonly blockers: readonly StreamBroadcastSourceReadinessBlockerCode[];
};

export type StreamBroadcastSourceReadinessEvidenceSnapshot = {
  readonly version: "STREAM-108Y";
  readonly roomId: string;
  readonly selectedSource: StreamBroadcastSource | null;
  readonly status: StreamBroadcastSourceReadinessStatus;
  readonly cameraPermissionPathRequested: boolean;
  readonly microphonePermissionPathRequested: boolean;
  readonly screenCaptureIntent: boolean;
  readonly gameCaptureIntent: boolean;
  readonly videoFileIntent: string | null;
  readonly externalRtmpUrlIntent: string | null;
  readonly providerHandoffRequested: boolean;
  readonly localBlockers: readonly StreamBroadcastSourceReadinessBlockerCode[];
  readonly providerBlockers: readonly StreamBroadcastSourceReadinessBlockerCode[];
  readonly backendRoomContract: StreamBroadcastSourceIntegrationState["backendRoomContract"];
  readonly realtimeProvider: StreamBroadcastSourceIntegrationState["realtimeProvider"];
  readonly mediaProvider: StreamBroadcastSourceIntegrationState["mediaProvider"];
  readonly screenCaptureProvider: StreamBroadcastSourceIntegrationState["screenCaptureProvider"];
  readonly gameCaptureProvider: StreamBroadcastSourceIntegrationState["gameCaptureProvider"];
  readonly videoStorageProvider: StreamBroadcastSourceIntegrationState["videoStorageProvider"];
  readonly rtmpIngestProvider: StreamBroadcastSourceIntegrationState["rtmpIngestProvider"];
  readonly adminLaunchApproval: StreamBroadcastSourceIntegrationState["adminLaunchApproval"];
  readonly fakeSourceProviderAllowed: false;
  readonly fakeOnAirAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftAllowed: false;
  readonly fakeLaunchCompleteAllowed: false;
  readonly readyForProviderHandoff: false;
  readonly readyForBackendUnion: boolean;
};

const MAX_SOURCE_LOG = 40;

function nowIso(now?: Date | string | number): string {
  if (now instanceof Date) return now.toISOString();
  if (typeof now === "string") return new Date(now).toISOString();
  if (typeof now === "number") return new Date(now).toISOString();
  return new Date().toISOString();
}

function defaultIntegration(): StreamBroadcastSourceIntegrationState {
  return {
    backendRoomContract: "not_connected",
    realtimeProvider: "not_configured",
    mediaProvider: "not_configured",
    screenCaptureProvider: "not_configured",
    gameCaptureProvider: "not_configured",
    videoStorageProvider: "not_connected",
    rtmpIngestProvider: "not_configured",
    adminLaunchApproval: "not_submitted",
    fakeSourceProviderAllowed: false,
    fakeOnAirAllowed: false,
    fakePaymentAllowed: false,
    fakeGiftAllowed: false,
    fakeLaunchCompleteAllowed: false,
  };
}

function emptyDevice(): StreamBroadcastSourceDeviceState {
  return {
    cameraPermissionPathRequested: false,
    microphonePermissionPathRequested: false,
    screenCaptureIntent: false,
    gameCaptureIntent: false,
    videoFileIntent: null,
    externalRtmpUrlIntent: null,
    localOnly: true,
  };
}

function appendSourceLog(
  state: StreamBroadcastSourceReadinessRuntimeState,
  action: string,
  status: StreamBroadcastSourceReadinessActionStatus,
  blockers: readonly StreamBroadcastSourceReadinessBlockerCode[] = [],
  now?: Date | string | number,
): StreamBroadcastSourceReadinessRuntimeState {
  const createdAt = nowIso(now);
  return {
    ...state,
    actionLog: [{ id: `${action}-${createdAt}`, action, status, createdAt, blockers }, ...state.actionLog].slice(0, MAX_SOURCE_LOG),
  };
}

function normalizeOptionalText(value: string | null | undefined): string | null {
  const normalized = String(value ?? "").trim().replace(/\s+/g, " ");
  return normalized.length > 0 ? normalized : null;
}

function localBlockersFor(state: StreamBroadcastSourceReadinessRuntimeState, room: StreamRoomRuntimeState): readonly StreamBroadcastSourceReadinessBlockerCode[] {
  const blockers: StreamBroadcastSourceReadinessBlockerCode[] = [];
  const source = state.selectedSource ?? room.broadcast.source;
  if (!source) blockers.push("broadcast_source_required");
  if (source === "camera" && !room.broadcast.cameraEnabled) blockers.push("camera_permission_required");
  if ((source === "microphone" || room.mode === "audioLive") && !room.broadcast.microphoneEnabled) blockers.push("microphone_permission_required");
  if (source === "video_file" && !state.device.videoFileIntent) blockers.push("video_file_intent_required");
  if (source === "external_rtmp" && !state.device.externalRtmpUrlIntent) blockers.push("rtmp_url_required");
  return Array.from(new Set(blockers));
}

function providerBlockersFor(state: StreamBroadcastSourceReadinessRuntimeState): readonly StreamBroadcastSourceReadinessBlockerCode[] {
  const blockers: StreamBroadcastSourceReadinessBlockerCode[] = [];
  if (state.integration.backendRoomContract !== "connected") blockers.push("backend_room_contract_required");
  if (state.integration.realtimeProvider !== "configured") blockers.push("realtime_provider_required");
  if (state.integration.mediaProvider !== "configured") blockers.push("media_provider_required");
  if (state.integration.adminLaunchApproval !== "approved") blockers.push("admin_launch_approval_required");
  if (state.selectedSource === "screen_share" && state.integration.screenCaptureProvider !== "configured") blockers.push("screen_capture_provider_required");
  if (state.selectedSource === "game_capture" && state.integration.gameCaptureProvider !== "configured") blockers.push("game_capture_provider_required");
  if (state.selectedSource === "video_file" && state.integration.videoStorageProvider !== "connected") blockers.push("video_storage_provider_required");
  if (state.selectedSource === "external_rtmp" && state.integration.rtmpIngestProvider !== "configured") blockers.push("rtmp_ingest_provider_required");
  return Array.from(new Set(blockers));
}

function deriveStatus(state: StreamBroadcastSourceReadinessRuntimeState, room: StreamRoomRuntimeState): StreamBroadcastSourceReadinessStatus {
  const localBlockers = localBlockersFor(state, room);
  if (!state.selectedSource && !room.broadcast.source) return "not_selected";
  if (state.providerHandoffRequested) return "provider_handoff_blocked";
  if (localBlockers.includes("camera_permission_required") || localBlockers.includes("microphone_permission_required")) return "permission_path_required";
  if (state.selectedSource === "video_file" || state.selectedSource === "external_rtmp") return localBlockers.length === 0 ? "local_media_intent_ready" : "local_source_selected";
  if (state.selectedSource === "screen_share" || state.selectedSource === "game_capture") return "local_source_selected";
  return localBlockers.length === 0 ? "local_device_ready" : "local_source_selected";
}

export function createInitialStreamBroadcastSourceReadinessState(room: StreamRoomRuntimeState): StreamBroadcastSourceReadinessRuntimeState {
  const initial: StreamBroadcastSourceReadinessRuntimeState = {
    version: "STREAM-108Y",
    roomId: room.roomId,
    selectedSource: room.broadcast.source,
    status: "not_selected",
    device: {
      ...emptyDevice(),
      cameraPermissionPathRequested: room.broadcast.source === "camera",
      microphonePermissionPathRequested: room.broadcast.source === "microphone" || room.mode === "audioLive",
      screenCaptureIntent: room.broadcast.source === "screen_share",
      gameCaptureIntent: room.broadcast.source === "game_capture",
    },
    integration: defaultIntegration(),
    providerHandoffRequested: false,
    actionLog: [],
  };
  const status = deriveStatus(initial, room);
  return appendSourceLog({ ...initial, status }, "source_readiness_initialized", "source_readiness_initialized");
}

export function syncStreamBroadcastSourceReadinessState(
  current: StreamBroadcastSourceReadinessRuntimeState,
  room: StreamRoomRuntimeState,
): StreamBroadcastSourceReadinessRuntimeState {
  const selectedSource = current.selectedSource ?? room.broadcast.source;
  const synced: StreamBroadcastSourceReadinessRuntimeState = {
    ...current,
    roomId: room.roomId,
    selectedSource,
    device: {
      ...current.device,
      cameraPermissionPathRequested: current.device.cameraPermissionPathRequested || selectedSource === "camera",
      microphonePermissionPathRequested: current.device.microphonePermissionPathRequested || selectedSource === "microphone" || room.mode === "audioLive",
      screenCaptureIntent: current.device.screenCaptureIntent || selectedSource === "screen_share",
      gameCaptureIntent: current.device.gameCaptureIntent || selectedSource === "game_capture",
    },
  };
  return { ...synced, status: deriveStatus(synced, room) };
}

export function selectLocalBroadcastSourceReadiness(
  current: StreamBroadcastSourceReadinessRuntimeState,
  room: StreamRoomRuntimeState,
  source: StreamBroadcastSource,
): StreamBroadcastSourceReadinessRuntimeState {
  const next: StreamBroadcastSourceReadinessRuntimeState = {
    ...current,
    roomId: room.roomId,
    selectedSource: source,
    providerHandoffRequested: false,
    device: {
      ...current.device,
      cameraPermissionPathRequested: current.device.cameraPermissionPathRequested || source === "camera",
      microphonePermissionPathRequested: current.device.microphonePermissionPathRequested || source === "microphone" || room.mode === "audioLive",
      screenCaptureIntent: current.device.screenCaptureIntent || source === "screen_share",
      gameCaptureIntent: current.device.gameCaptureIntent || source === "game_capture",
    },
  };
  const status = deriveStatus(next, room);
  const blockers = [...localBlockersFor(next, room), ...providerBlockersFor(next)];
  return appendSourceLog({ ...next, status }, "source_selected_local", "source_selected_local", blockers);
}

export function markLocalCameraPermissionPath(
  current: StreamBroadcastSourceReadinessRuntimeState,
  room: StreamRoomRuntimeState,
): StreamBroadcastSourceReadinessRuntimeState {
  const next = { ...current, device: { ...current.device, cameraPermissionPathRequested: true } };
  const status = deriveStatus(next, room);
  return appendSourceLog({ ...next, status }, "camera_permission_path_recorded", "permission_path_recorded", localBlockersFor(next, room));
}

export function markLocalMicrophonePermissionPath(
  current: StreamBroadcastSourceReadinessRuntimeState,
  room: StreamRoomRuntimeState,
): StreamBroadcastSourceReadinessRuntimeState {
  const next = { ...current, device: { ...current.device, microphonePermissionPathRequested: true } };
  const status = deriveStatus(next, room);
  return appendSourceLog({ ...next, status }, "microphone_permission_path_recorded", "permission_path_recorded", localBlockersFor(next, room));
}

export function markLocalScreenCaptureIntent(
  current: StreamBroadcastSourceReadinessRuntimeState,
  room: StreamRoomRuntimeState,
): StreamBroadcastSourceReadinessRuntimeState {
  const next = { ...current, selectedSource: "screen_share" as const, device: { ...current.device, screenCaptureIntent: true } };
  const status = deriveStatus(next, room);
  return appendSourceLog({ ...next, status }, "screen_capture_intent_recorded", "media_intent_recorded", providerBlockersFor(next));
}

export function markLocalGameCaptureIntent(
  current: StreamBroadcastSourceReadinessRuntimeState,
  room: StreamRoomRuntimeState,
): StreamBroadcastSourceReadinessRuntimeState {
  const next = { ...current, selectedSource: "game_capture" as const, device: { ...current.device, gameCaptureIntent: true } };
  const status = deriveStatus(next, room);
  return appendSourceLog({ ...next, status }, "game_capture_intent_recorded", "media_intent_recorded", providerBlockersFor(next));
}

export function attachLocalVideoFileIntent(
  current: StreamBroadcastSourceReadinessRuntimeState,
  room: StreamRoomRuntimeState,
  fileName: string,
): StreamBroadcastSourceReadinessRuntimeState {
  const next = { ...current, selectedSource: "video_file" as const, device: { ...current.device, videoFileIntent: normalizeOptionalText(fileName) } };
  const status = deriveStatus(next, room);
  return appendSourceLog({ ...next, status }, "video_file_intent_recorded", "media_intent_recorded", [...localBlockersFor(next, room), ...providerBlockersFor(next)]);
}

export function attachLocalExternalRtmpIntent(
  current: StreamBroadcastSourceReadinessRuntimeState,
  room: StreamRoomRuntimeState,
  url: string,
): StreamBroadcastSourceReadinessRuntimeState {
  const next = { ...current, selectedSource: "external_rtmp" as const, device: { ...current.device, externalRtmpUrlIntent: normalizeOptionalText(url) } };
  const status = deriveStatus(next, room);
  return appendSourceLog({ ...next, status }, "external_rtmp_intent_recorded", "media_intent_recorded", [...localBlockersFor(next, room), ...providerBlockersFor(next)]);
}

export function requestBroadcastSourceProviderHandoffBlocked(
  current: StreamBroadcastSourceReadinessRuntimeState,
  room: StreamRoomRuntimeState,
): StreamBroadcastSourceReadinessRuntimeState {
  const next = { ...current, providerHandoffRequested: true };
  const blockers = [...localBlockersFor(next, room), ...providerBlockersFor(next)];
  return appendSourceLog({ ...next, status: "provider_handoff_blocked" }, "provider_handoff_blocked", "provider_handoff_blocked", blockers);
}

export function buildStreamBroadcastSourceReadinessEvidenceSnapshot(
  state: StreamBroadcastSourceReadinessRuntimeState,
  room: StreamRoomRuntimeState,
): StreamBroadcastSourceReadinessEvidenceSnapshot {
  const synced = syncStreamBroadcastSourceReadinessState(state, room);
  const localBlockers = localBlockersFor(synced, room);
  const providerBlockers = providerBlockersFor(synced);
  return {
    version: "STREAM-108Y",
    roomId: synced.roomId,
    selectedSource: synced.selectedSource,
    status: synced.status,
    cameraPermissionPathRequested: synced.device.cameraPermissionPathRequested,
    microphonePermissionPathRequested: synced.device.microphonePermissionPathRequested,
    screenCaptureIntent: synced.device.screenCaptureIntent,
    gameCaptureIntent: synced.device.gameCaptureIntent,
    videoFileIntent: synced.device.videoFileIntent,
    externalRtmpUrlIntent: synced.device.externalRtmpUrlIntent,
    providerHandoffRequested: synced.providerHandoffRequested,
    localBlockers,
    providerBlockers,
    backendRoomContract: synced.integration.backendRoomContract,
    realtimeProvider: synced.integration.realtimeProvider,
    mediaProvider: synced.integration.mediaProvider,
    screenCaptureProvider: synced.integration.screenCaptureProvider,
    gameCaptureProvider: synced.integration.gameCaptureProvider,
    videoStorageProvider: synced.integration.videoStorageProvider,
    rtmpIngestProvider: synced.integration.rtmpIngestProvider,
    adminLaunchApproval: synced.integration.adminLaunchApproval,
    fakeSourceProviderAllowed: false,
    fakeOnAirAllowed: false,
    fakePaymentAllowed: false,
    fakeGiftAllowed: false,
    fakeLaunchCompleteAllowed: false,
    readyForProviderHandoff: false,
    readyForBackendUnion: true,
  };
}
