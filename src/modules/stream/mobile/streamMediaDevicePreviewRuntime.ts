import type { StreamBroadcastSource, StreamRoomRuntimeState } from "./streamRoomRuntime";

export type StreamMediaDevicePreviewStatus =
  | "idle_local"
  | "device_selected_local"
  | "diagnostics_ready_local"
  | "quality_profile_ready_local"
  | "local_preview_ready"
  | "local_preview_muted"
  | "local_preview_blocked"
  | "provider_handoff_blocked";

export type StreamMediaDevicePreviewBlockerCode =
  | "broadcast_source_required"
  | "camera_permission_required"
  | "microphone_permission_required"
  | "screen_capture_provider_required"
  | "game_capture_provider_required"
  | "video_storage_provider_required"
  | "rtmp_ingest_provider_required"
  | "preview_quality_required"
  | "backend_room_contract_required"
  | "realtime_provider_required"
  | "media_provider_required"
  | "admin_launch_approval_required";

export type StreamMediaDevicePreviewQualityPresetId =
  | "low_data"
  | "mobile_balanced"
  | "hd_preview"
  | "game_low_latency"
  | "cinema_upload_ready";

export type StreamMediaDevicePreviewQualityPreset = {
  readonly id: StreamMediaDevicePreviewQualityPresetId;
  readonly label: string;
  readonly resolution: "360p" | "540p" | "720p" | "1080p";
  readonly fps: 15 | 24 | 30 | 60;
  readonly bitrateKbps: number;
  readonly audioBitrateKbps: number;
  readonly intent: "data_saver" | "balanced_mobile" | "hd_local_preview" | "low_latency_game" | "cinema_video";
};

export type StreamMediaDevicePreviewDiagnostics = {
  readonly deviceListCheckedLocal: boolean;
  readonly cameraDiagnosticCheckedLocal: boolean;
  readonly microphoneDiagnosticCheckedLocal: boolean;
  readonly networkDiagnosticCheckedLocal: boolean;
  readonly selectedSourceCheckedAt: string | null;
};

export type StreamMediaDevicePreviewControls = {
  readonly previewEnabledLocal: boolean;
  readonly previewAudioMutedLocal: boolean;
  readonly mirrorCameraLocal: boolean;
  readonly torchRequestedLocal: boolean;
  readonly orientation: "portrait" | "landscape";
  readonly localOnly: true;
};

export type StreamMediaDevicePreviewIntegrationState = {
  readonly backendRoomContract: "not_connected" | "connected";
  readonly realtimeProvider: "not_configured" | "configured";
  readonly mediaProvider: "not_configured" | "configured";
  readonly screenCaptureProvider: "not_configured" | "configured";
  readonly gameCaptureProvider: "not_configured" | "configured";
  readonly videoStorageProvider: "not_connected" | "connected";
  readonly rtmpIngestProvider: "not_configured" | "configured";
  readonly adminLaunchApproval: "not_submitted" | "pending" | "approved" | "rejected";
  readonly fakeDeviceProviderAllowed: false;
  readonly fakeMediaPreviewAllowed: false;
  readonly fakeOnAirAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftAllowed: false;
  readonly fakeLaunchCompleteAllowed: false;
};

export type StreamMediaDevicePreviewRuntimeState = {
  readonly version: "STREAM-108Z";
  readonly roomId: string;
  readonly selectedSource: StreamBroadcastSource | null;
  readonly status: StreamMediaDevicePreviewStatus;
  readonly selectedQualityPreset: StreamMediaDevicePreviewQualityPresetId;
  readonly quality: StreamMediaDevicePreviewQualityPreset;
  readonly diagnostics: StreamMediaDevicePreviewDiagnostics;
  readonly controls: StreamMediaDevicePreviewControls;
  readonly integration: StreamMediaDevicePreviewIntegrationState;
  readonly providerHandoffRequested: boolean;
  readonly actionLog: readonly StreamMediaDevicePreviewActionLogEntry[];
};

export type StreamMediaDevicePreviewActionStatus =
  | "media_preview_initialized"
  | "media_device_selected_local"
  | "diagnostics_checked_local"
  | "quality_profile_selected_local"
  | "preview_control_changed_local"
  | "provider_handoff_blocked";

export type StreamMediaDevicePreviewActionLogEntry = {
  readonly id: string;
  readonly action: string;
  readonly status: StreamMediaDevicePreviewActionStatus;
  readonly createdAt: string;
  readonly blockers: readonly StreamMediaDevicePreviewBlockerCode[];
};

export type StreamMediaDevicePreviewEvidenceSnapshot = {
  readonly version: "STREAM-108Z";
  readonly roomId: string;
  readonly selectedSource: StreamBroadcastSource | null;
  readonly status: StreamMediaDevicePreviewStatus;
  readonly selectedQualityPreset: StreamMediaDevicePreviewQualityPresetId;
  readonly resolution: StreamMediaDevicePreviewQualityPreset["resolution"];
  readonly fps: StreamMediaDevicePreviewQualityPreset["fps"];
  readonly bitrateKbps: number;
  readonly audioBitrateKbps: number;
  readonly previewEnabledLocal: boolean;
  readonly previewAudioMutedLocal: boolean;
  readonly mirrorCameraLocal: boolean;
  readonly torchRequestedLocal: boolean;
  readonly orientation: StreamMediaDevicePreviewControls["orientation"];
  readonly deviceListCheckedLocal: boolean;
  readonly cameraDiagnosticCheckedLocal: boolean;
  readonly microphoneDiagnosticCheckedLocal: boolean;
  readonly networkDiagnosticCheckedLocal: boolean;
  readonly localBlockers: readonly StreamMediaDevicePreviewBlockerCode[];
  readonly providerBlockers: readonly StreamMediaDevicePreviewBlockerCode[];
  readonly backendRoomContract: StreamMediaDevicePreviewIntegrationState["backendRoomContract"];
  readonly realtimeProvider: StreamMediaDevicePreviewIntegrationState["realtimeProvider"];
  readonly mediaProvider: StreamMediaDevicePreviewIntegrationState["mediaProvider"];
  readonly screenCaptureProvider: StreamMediaDevicePreviewIntegrationState["screenCaptureProvider"];
  readonly gameCaptureProvider: StreamMediaDevicePreviewIntegrationState["gameCaptureProvider"];
  readonly videoStorageProvider: StreamMediaDevicePreviewIntegrationState["videoStorageProvider"];
  readonly rtmpIngestProvider: StreamMediaDevicePreviewIntegrationState["rtmpIngestProvider"];
  readonly adminLaunchApproval: StreamMediaDevicePreviewIntegrationState["adminLaunchApproval"];
  readonly providerHandoffRequested: boolean;
  readonly fakeDeviceProviderAllowed: false;
  readonly fakeMediaPreviewAllowed: false;
  readonly fakeOnAirAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftAllowed: false;
  readonly fakeLaunchCompleteAllowed: false;
  readonly readyForProviderHandoff: false;
  readonly readyForBackendUnion: boolean;
};

export const STREAM_MEDIA_DEVICE_PREVIEW_QUALITY_PRESETS: readonly StreamMediaDevicePreviewQualityPreset[] = [
  { id: "low_data", label: "Low data", resolution: "360p", fps: 15, bitrateKbps: 450, audioBitrateKbps: 48, intent: "data_saver" },
  { id: "mobile_balanced", label: "Mobile balanced", resolution: "540p", fps: 30, bitrateKbps: 1200, audioBitrateKbps: 96, intent: "balanced_mobile" },
  { id: "hd_preview", label: "HD preview", resolution: "720p", fps: 30, bitrateKbps: 2500, audioBitrateKbps: 128, intent: "hd_local_preview" },
  { id: "game_low_latency", label: "Game low latency", resolution: "720p", fps: 60, bitrateKbps: 3500, audioBitrateKbps: 128, intent: "low_latency_game" },
  { id: "cinema_upload_ready", label: "Cinema/video", resolution: "1080p", fps: 30, bitrateKbps: 5000, audioBitrateKbps: 160, intent: "cinema_video" },
];

const MAX_MEDIA_DEVICE_LOG = 50;

function nowIso(now?: Date | string | number): string {
  if (now instanceof Date) return now.toISOString();
  if (typeof now === "string") return new Date(now).toISOString();
  if (typeof now === "number") return new Date(now).toISOString();
  return new Date().toISOString();
}

function presetById(id: StreamMediaDevicePreviewQualityPresetId): StreamMediaDevicePreviewQualityPreset {
  return STREAM_MEDIA_DEVICE_PREVIEW_QUALITY_PRESETS.find((preset) => preset.id === id) ?? STREAM_MEDIA_DEVICE_PREVIEW_QUALITY_PRESETS[1];
}

function defaultIntegration(): StreamMediaDevicePreviewIntegrationState {
  return {
    backendRoomContract: "not_connected",
    realtimeProvider: "not_configured",
    mediaProvider: "not_configured",
    screenCaptureProvider: "not_configured",
    gameCaptureProvider: "not_configured",
    videoStorageProvider: "not_connected",
    rtmpIngestProvider: "not_configured",
    adminLaunchApproval: "not_submitted",
    fakeDeviceProviderAllowed: false,
    fakeMediaPreviewAllowed: false,
    fakeOnAirAllowed: false,
    fakePaymentAllowed: false,
    fakeGiftAllowed: false,
    fakeLaunchCompleteAllowed: false,
  };
}

function emptyDiagnostics(): StreamMediaDevicePreviewDiagnostics {
  return {
    deviceListCheckedLocal: false,
    cameraDiagnosticCheckedLocal: false,
    microphoneDiagnosticCheckedLocal: false,
    networkDiagnosticCheckedLocal: false,
    selectedSourceCheckedAt: null,
  };
}

function emptyControls(): StreamMediaDevicePreviewControls {
  return {
    previewEnabledLocal: false,
    previewAudioMutedLocal: false,
    mirrorCameraLocal: true,
    torchRequestedLocal: false,
    orientation: "portrait",
    localOnly: true,
  };
}

function effectiveSource(state: StreamMediaDevicePreviewRuntimeState, room: StreamRoomRuntimeState): StreamBroadcastSource | null {
  return state.selectedSource ?? room.broadcast.source;
}

function appendLog(
  state: StreamMediaDevicePreviewRuntimeState,
  action: string,
  status: StreamMediaDevicePreviewActionStatus,
  blockers: readonly StreamMediaDevicePreviewBlockerCode[] = [],
  now?: Date | string | number,
): StreamMediaDevicePreviewRuntimeState {
  const createdAt = nowIso(now);
  return {
    ...state,
    actionLog: [{ id: `${action}-${createdAt}`, action, status, createdAt, blockers }, ...state.actionLog].slice(0, MAX_MEDIA_DEVICE_LOG),
  };
}

export function streamMediaDeviceLocalBlockersFor(
  state: StreamMediaDevicePreviewRuntimeState,
  room: StreamRoomRuntimeState,
): readonly StreamMediaDevicePreviewBlockerCode[] {
  const blockers: StreamMediaDevicePreviewBlockerCode[] = [];
  const source = effectiveSource(state, room);
  if (!source) blockers.push("broadcast_source_required");
  if (source === "camera" && !room.broadcast.cameraEnabled) blockers.push("camera_permission_required");
  if ((source === "microphone" || room.mode === "audioLive") && !room.broadcast.microphoneEnabled) blockers.push("microphone_permission_required");
  if (!state.quality) blockers.push("preview_quality_required");
  return Array.from(new Set(blockers));
}

export function streamMediaDeviceProviderBlockersFor(
  state: StreamMediaDevicePreviewRuntimeState,
  room?: StreamRoomRuntimeState,
): readonly StreamMediaDevicePreviewBlockerCode[] {
  const blockers: StreamMediaDevicePreviewBlockerCode[] = [];
  const source = room ? effectiveSource(state, room) : state.selectedSource;
  if (state.integration.backendRoomContract !== "connected") blockers.push("backend_room_contract_required");
  if (state.integration.realtimeProvider !== "configured") blockers.push("realtime_provider_required");
  if (state.integration.mediaProvider !== "configured") blockers.push("media_provider_required");
  if (state.integration.adminLaunchApproval !== "approved") blockers.push("admin_launch_approval_required");
  if (source === "screen_share" && state.integration.screenCaptureProvider !== "configured") blockers.push("screen_capture_provider_required");
  if (source === "game_capture" && state.integration.gameCaptureProvider !== "configured") blockers.push("game_capture_provider_required");
  if (source === "video_file" && state.integration.videoStorageProvider !== "connected") blockers.push("video_storage_provider_required");
  if (source === "external_rtmp" && state.integration.rtmpIngestProvider !== "configured") blockers.push("rtmp_ingest_provider_required");
  return Array.from(new Set(blockers));
}

function deriveStatus(state: StreamMediaDevicePreviewRuntimeState, room: StreamRoomRuntimeState): StreamMediaDevicePreviewStatus {
  if (state.providerHandoffRequested) return "provider_handoff_blocked";
  if (streamMediaDeviceLocalBlockersFor(state, room).length > 0 && state.controls.previewEnabledLocal) return "local_preview_blocked";
  if (state.controls.previewEnabledLocal && state.controls.previewAudioMutedLocal) return "local_preview_muted";
  if (state.controls.previewEnabledLocal) return "local_preview_ready";
  if (state.diagnostics.deviceListCheckedLocal || state.diagnostics.cameraDiagnosticCheckedLocal || state.diagnostics.microphoneDiagnosticCheckedLocal || state.diagnostics.networkDiagnosticCheckedLocal) {
    return "diagnostics_ready_local";
  }
  if (state.selectedQualityPreset) return "quality_profile_ready_local";
  if (effectiveSource(state, room)) return "device_selected_local";
  return "idle_local";
}

export function createInitialStreamMediaDevicePreviewState(room: StreamRoomRuntimeState): StreamMediaDevicePreviewRuntimeState {
  const selectedQualityPreset: StreamMediaDevicePreviewQualityPresetId = room.mode === "gameLive" ? "game_low_latency" : room.mode === "cinemaLive" ? "cinema_upload_ready" : "mobile_balanced";
  const initial: StreamMediaDevicePreviewRuntimeState = {
    version: "STREAM-108Z",
    roomId: room.roomId,
    selectedSource: room.broadcast.source,
    status: "idle_local",
    selectedQualityPreset,
    quality: presetById(selectedQualityPreset),
    diagnostics: emptyDiagnostics(),
    controls: emptyControls(),
    integration: defaultIntegration(),
    providerHandoffRequested: false,
    actionLog: [],
  };
  const withStatus = { ...initial, status: deriveStatus(initial, room) };
  return appendLog(withStatus, "media_preview_initialized", "media_preview_initialized");
}

export function syncStreamMediaDevicePreviewState(
  state: StreamMediaDevicePreviewRuntimeState,
  room: StreamRoomRuntimeState,
): StreamMediaDevicePreviewRuntimeState {
  const next = {
    ...state,
    roomId: room.roomId,
    selectedSource: state.selectedSource ?? room.broadcast.source,
  };
  return { ...next, status: deriveStatus(next, room) };
}

export function selectLocalStreamMediaDevice(
  state: StreamMediaDevicePreviewRuntimeState,
  room: StreamRoomRuntimeState,
  selectedSource: StreamBroadcastSource,
): StreamMediaDevicePreviewRuntimeState {
  const next = {
    ...state,
    roomId: room.roomId,
    selectedSource,
    providerHandoffRequested: false,
  };
  const withStatus = { ...next, status: deriveStatus(next, room) };
  return appendLog(withStatus, `media_device_selected:${selectedSource}`, "media_device_selected_local", streamMediaDeviceLocalBlockersFor(withStatus, room));
}

export function markLocalStreamMediaDeviceDiagnosticsChecked(
  state: StreamMediaDevicePreviewRuntimeState,
  room: StreamRoomRuntimeState,
  flags: Partial<Omit<StreamMediaDevicePreviewDiagnostics, "selectedSourceCheckedAt">> = {},
  now?: Date | string | number,
): StreamMediaDevicePreviewRuntimeState {
  const checkedAt = nowIso(now);
  const next = {
    ...state,
    roomId: room.roomId,
    selectedSource: state.selectedSource ?? room.broadcast.source,
    diagnostics: {
      ...state.diagnostics,
      deviceListCheckedLocal: flags.deviceListCheckedLocal ?? true,
      cameraDiagnosticCheckedLocal: flags.cameraDiagnosticCheckedLocal ?? state.diagnostics.cameraDiagnosticCheckedLocal,
      microphoneDiagnosticCheckedLocal: flags.microphoneDiagnosticCheckedLocal ?? state.diagnostics.microphoneDiagnosticCheckedLocal,
      networkDiagnosticCheckedLocal: flags.networkDiagnosticCheckedLocal ?? true,
      selectedSourceCheckedAt: checkedAt,
    },
  };
  const withStatus = { ...next, status: deriveStatus(next, room) };
  return appendLog(withStatus, "diagnostics_checked", "diagnostics_checked_local", streamMediaDeviceLocalBlockersFor(withStatus, room), checkedAt);
}

export function setLocalStreamPreviewQualityPreset(
  state: StreamMediaDevicePreviewRuntimeState,
  room: StreamRoomRuntimeState,
  presetId: StreamMediaDevicePreviewQualityPresetId,
): StreamMediaDevicePreviewRuntimeState {
  const next = {
    ...state,
    roomId: room.roomId,
    selectedSource: state.selectedSource ?? room.broadcast.source,
    selectedQualityPreset: presetId,
    quality: presetById(presetId),
  };
  const withStatus = { ...next, status: deriveStatus(next, room) };
  return appendLog(withStatus, `quality_profile:${presetId}`, "quality_profile_selected_local", streamMediaDeviceLocalBlockersFor(withStatus, room));
}

export function setLocalStreamPreviewEnabled(
  state: StreamMediaDevicePreviewRuntimeState,
  room: StreamRoomRuntimeState,
  enabled: boolean,
): StreamMediaDevicePreviewRuntimeState {
  const tentative = {
    ...state,
    roomId: room.roomId,
    selectedSource: state.selectedSource ?? room.broadcast.source,
    controls: { ...state.controls, previewEnabledLocal: enabled && streamMediaDeviceLocalBlockersFor(state, room).length === 0 },
  };
  const blockers = streamMediaDeviceLocalBlockersFor(tentative, room);
  const next = {
    ...tentative,
    controls: { ...tentative.controls, previewEnabledLocal: enabled && blockers.length === 0 },
  };
  const withStatus = { ...next, status: deriveStatus(next, room) };
  return appendLog(withStatus, enabled ? "preview_enable_local" : "preview_disable_local", "preview_control_changed_local", blockers);
}

export function setLocalStreamPreviewAudioMuted(
  state: StreamMediaDevicePreviewRuntimeState,
  room: StreamRoomRuntimeState,
  muted: boolean,
): StreamMediaDevicePreviewRuntimeState {
  const next = {
    ...state,
    roomId: room.roomId,
    selectedSource: state.selectedSource ?? room.broadcast.source,
    controls: { ...state.controls, previewAudioMutedLocal: muted },
  };
  const withStatus = { ...next, status: deriveStatus(next, room) };
  return appendLog(withStatus, muted ? "preview_audio_mute_local" : "preview_audio_unmute_local", "preview_control_changed_local", streamMediaDeviceLocalBlockersFor(withStatus, room));
}

export function setLocalStreamPreviewOrientation(
  state: StreamMediaDevicePreviewRuntimeState,
  room: StreamRoomRuntimeState,
  orientation: StreamMediaDevicePreviewControls["orientation"],
): StreamMediaDevicePreviewRuntimeState {
  const next = {
    ...state,
    roomId: room.roomId,
    selectedSource: state.selectedSource ?? room.broadcast.source,
    controls: { ...state.controls, orientation },
  };
  const withStatus = { ...next, status: deriveStatus(next, room) };
  return appendLog(withStatus, `preview_orientation:${orientation}`, "preview_control_changed_local", streamMediaDeviceLocalBlockersFor(withStatus, room));
}

export function toggleLocalStreamCameraMirror(
  state: StreamMediaDevicePreviewRuntimeState,
  room: StreamRoomRuntimeState,
): StreamMediaDevicePreviewRuntimeState {
  const next = {
    ...state,
    roomId: room.roomId,
    selectedSource: state.selectedSource ?? room.broadcast.source,
    controls: { ...state.controls, mirrorCameraLocal: !state.controls.mirrorCameraLocal },
  };
  const withStatus = { ...next, status: deriveStatus(next, room) };
  return appendLog(withStatus, "camera_mirror_toggle_local", "preview_control_changed_local", streamMediaDeviceLocalBlockersFor(withStatus, room));
}

export function requestMediaDeviceProviderHandoffBlocked(
  state: StreamMediaDevicePreviewRuntimeState,
  room: StreamRoomRuntimeState,
): StreamMediaDevicePreviewRuntimeState {
  const localBlockers = streamMediaDeviceLocalBlockersFor(state, room);
  const providerBlockers = streamMediaDeviceProviderBlockersFor(state, room);
  const next = {
    ...state,
    roomId: room.roomId,
    selectedSource: state.selectedSource ?? room.broadcast.source,
    providerHandoffRequested: true,
    status: "provider_handoff_blocked" as const,
  };
  return appendLog(next, "media_device_provider_handoff_blocked", "provider_handoff_blocked", [...localBlockers, ...providerBlockers]);
}

export function buildStreamMediaDevicePreviewEvidenceSnapshot(
  state: StreamMediaDevicePreviewRuntimeState,
  room: StreamRoomRuntimeState,
): StreamMediaDevicePreviewEvidenceSnapshot {
  const localBlockers = streamMediaDeviceLocalBlockersFor(state, room);
  const providerBlockers = streamMediaDeviceProviderBlockersFor(state, room);
  return {
    version: "STREAM-108Z",
    roomId: state.roomId,
    selectedSource: effectiveSource(state, room),
    status: deriveStatus(state, room),
    selectedQualityPreset: state.selectedQualityPreset,
    resolution: state.quality.resolution,
    fps: state.quality.fps,
    bitrateKbps: state.quality.bitrateKbps,
    audioBitrateKbps: state.quality.audioBitrateKbps,
    previewEnabledLocal: state.controls.previewEnabledLocal,
    previewAudioMutedLocal: state.controls.previewAudioMutedLocal,
    mirrorCameraLocal: state.controls.mirrorCameraLocal,
    torchRequestedLocal: state.controls.torchRequestedLocal,
    orientation: state.controls.orientation,
    deviceListCheckedLocal: state.diagnostics.deviceListCheckedLocal,
    cameraDiagnosticCheckedLocal: state.diagnostics.cameraDiagnosticCheckedLocal,
    microphoneDiagnosticCheckedLocal: state.diagnostics.microphoneDiagnosticCheckedLocal,
    networkDiagnosticCheckedLocal: state.diagnostics.networkDiagnosticCheckedLocal,
    localBlockers,
    providerBlockers,
    backendRoomContract: state.integration.backendRoomContract,
    realtimeProvider: state.integration.realtimeProvider,
    mediaProvider: state.integration.mediaProvider,
    screenCaptureProvider: state.integration.screenCaptureProvider,
    gameCaptureProvider: state.integration.gameCaptureProvider,
    videoStorageProvider: state.integration.videoStorageProvider,
    rtmpIngestProvider: state.integration.rtmpIngestProvider,
    adminLaunchApproval: state.integration.adminLaunchApproval,
    providerHandoffRequested: state.providerHandoffRequested,
    fakeDeviceProviderAllowed: false,
    fakeMediaPreviewAllowed: false,
    fakeOnAirAllowed: false,
    fakePaymentAllowed: false,
    fakeGiftAllowed: false,
    fakeLaunchCompleteAllowed: false,
    readyForProviderHandoff: false,
    readyForBackendUnion: true,
  };
}
