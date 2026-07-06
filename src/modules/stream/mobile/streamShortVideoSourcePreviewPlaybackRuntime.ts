import type { StreamShortVideoRecordUploadAsset } from "./streamShortVideoRecordUploadSourceFlowRuntime";

export type StreamShortVideoSourcePreviewPlaybackStatus =
  | "idle_local"
  | "source_bound_local"
  | "preview_ready_local"
  | "playing_local"
  | "paused_local"
  | "restarted_local"
  | "provider_playback_blocked";

export type StreamShortVideoSourcePreviewPlaybackBlockerCode =
  | "source_asset_required"
  | "local_uri_required"
  | "native_preview_required"
  | "playback_status_required"
  | "media_storage_provider_required"
  | "cdn_provider_required"
  | "playback_manifest_provider_required"
  | "admin_media_review_required";

export type StreamShortVideoSourcePreviewPlaybackEventKind =
  | "short_source_preview_asset_bound_local"
  | "short_source_preview_ready_local"
  | "short_source_preview_play_local"
  | "short_source_preview_pause_local"
  | "short_source_preview_restart_local"
  | "short_source_preview_toggle_mute_local"
  | "short_source_preview_toggle_loop_local"
  | "short_source_preview_speed_local"
  | "short_source_preview_status_synced_local"
  | "short_source_preview_provider_blocked";

export type StreamShortVideoSourcePreviewPlaybackAsset = {
  readonly assetId: string;
  readonly sourceKind: StreamShortVideoRecordUploadAsset["kind"];
  readonly title: string;
  readonly uri: string;
  readonly mimeType: string | null;
  readonly durationMsLocal: number | null;
  readonly width: number | null;
  readonly height: number | null;
  readonly localOnly: true;
  readonly deliveredToStorage: false;
};

export type StreamShortVideoSourcePreviewPlaybackEvent = {
  readonly eventId: string;
  readonly kind: StreamShortVideoSourcePreviewPlaybackEventKind;
  readonly assetId: string | null;
  readonly createdAt: string;
  readonly deliveredToProvider: false;
  readonly payload: {
    readonly status: StreamShortVideoSourcePreviewPlaybackStatus;
    readonly assetUriPresent: boolean;
    readonly isPlayingLocal: boolean;
    readonly progressPercentLocal: number;
    readonly localBlockers: readonly StreamShortVideoSourcePreviewPlaybackBlockerCode[];
    readonly providerBlockers: readonly StreamShortVideoSourcePreviewPlaybackBlockerCode[];
  };
};

export type StreamShortVideoSourcePreviewPlaybackEvidence = {
  readonly selectedAssetId: string | null;
  readonly selectedAssetTitle: string | null;
  readonly selectedAssetUriPresent: boolean;
  readonly sourceKind: StreamShortVideoRecordUploadAsset["kind"] | null;
  readonly previewReadyLocal: boolean;
  readonly playbackBoundLocal: boolean;
  readonly isPlayingLocal: boolean;
  readonly mutedLocal: boolean;
  readonly loopLocal: boolean;
  readonly playbackRateLocal: number;
  readonly progressPercentLocal: number;
  readonly positionMsLocal: number;
  readonly durationMsLocal: number | null;
  readonly queuedPreviewEvents: number;
  readonly localBlockers: readonly StreamShortVideoSourcePreviewPlaybackBlockerCode[];
  readonly providerBlockers: readonly StreamShortVideoSourcePreviewPlaybackBlockerCode[];
  readonly nativePreviewEngine: "expo_av_local_video";
  readonly mediaStorageProvider: "not_configured";
  readonly cdnProvider: "not_configured";
  readonly playbackManifestProvider: "not_configured";
  readonly adminMediaReview: "not_connected";
  readonly fakeVideoPreviewAllowed: false;
  readonly fakePlaybackAllowed: false;
  readonly fakeProviderSuccessAllowed: false;
  readonly fakeUploadAllowed: false;
  readonly fakePublishAllowed: false;
};

export type StreamShortVideoSourcePreviewPlaybackState = {
  readonly status: StreamShortVideoSourcePreviewPlaybackStatus;
  readonly asset: StreamShortVideoSourcePreviewPlaybackAsset | null;
  readonly isPlayingLocal: boolean;
  readonly mutedLocal: boolean;
  readonly loopLocal: boolean;
  readonly playbackRateLocal: number;
  readonly positionMsLocal: number;
  readonly durationMsLocal: number | null;
  readonly events: readonly StreamShortVideoSourcePreviewPlaybackEvent[];
  readonly evidence: StreamShortVideoSourcePreviewPlaybackEvidence;
  readonly updatedAt: string;
};

export type StreamShortVideoSourcePreviewPlaybackStatusInput = {
  readonly isLoaded?: boolean;
  readonly isPlaying?: boolean;
  readonly positionMillis?: number | null;
  readonly durationMillis?: number | null;
};

const nowIso = () => new Date().toISOString();
const makeEventId = (kind: StreamShortVideoSourcePreviewPlaybackEventKind) => `${kind}-${Date.now()}-${Math.round(Math.random() * 10000)}`;
const playbackRates = [0.5, 1, 1.25, 1.5, 2] as const;

function providerBlockers(): readonly StreamShortVideoSourcePreviewPlaybackBlockerCode[] {
  return ["media_storage_provider_required", "cdn_provider_required", "playback_manifest_provider_required", "admin_media_review_required"];
}

function clampProgress(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function localBlockers(state: Pick<StreamShortVideoSourcePreviewPlaybackState, "asset" | "status" | "durationMsLocal">): readonly StreamShortVideoSourcePreviewPlaybackBlockerCode[] {
  const blockers: StreamShortVideoSourcePreviewPlaybackBlockerCode[] = [];
  if (!state.asset) blockers.push("source_asset_required");
  if (state.asset && !state.asset.uri) blockers.push("local_uri_required");
  if (state.status === "idle_local") blockers.push("native_preview_required");
  if (state.asset && state.status === "source_bound_local") blockers.push("playback_status_required");
  return blockers;
}

function progressPercent(state: Pick<StreamShortVideoSourcePreviewPlaybackState, "positionMsLocal" | "durationMsLocal">): number {
  if (!state.durationMsLocal || state.durationMsLocal <= 0) return 0;
  return clampProgress((state.positionMsLocal / state.durationMsLocal) * 100);
}

function computeStatus(state: Pick<StreamShortVideoSourcePreviewPlaybackState, "asset" | "status" | "isPlayingLocal">): StreamShortVideoSourcePreviewPlaybackStatus {
  if (state.status === "provider_playback_blocked") return state.status;
  if (!state.asset) return "idle_local";
  if (state.isPlayingLocal) return "playing_local";
  if (state.status === "paused_local" || state.status === "restarted_local") return state.status;
  return "preview_ready_local";
}

function buildEvidence(state: Pick<StreamShortVideoSourcePreviewPlaybackState, "asset" | "status" | "isPlayingLocal" | "mutedLocal" | "loopLocal" | "playbackRateLocal" | "positionMsLocal" | "durationMsLocal" | "events">): StreamShortVideoSourcePreviewPlaybackEvidence {
  const blockers = localBlockers(state);
  const progress = progressPercent(state);
  return {
    selectedAssetId: state.asset?.assetId ?? null,
    selectedAssetTitle: state.asset?.title ?? null,
    selectedAssetUriPresent: Boolean(state.asset?.uri),
    sourceKind: state.asset?.sourceKind ?? null,
    previewReadyLocal: Boolean(state.asset?.uri) && blockers.length === 0,
    playbackBoundLocal: Boolean(state.asset?.uri) && state.status !== "idle_local",
    isPlayingLocal: state.isPlayingLocal,
    mutedLocal: state.mutedLocal,
    loopLocal: state.loopLocal,
    playbackRateLocal: state.playbackRateLocal,
    progressPercentLocal: progress,
    positionMsLocal: state.positionMsLocal,
    durationMsLocal: state.durationMsLocal,
    queuedPreviewEvents: state.events.length,
    localBlockers: blockers,
    providerBlockers: providerBlockers(),
    nativePreviewEngine: "expo_av_local_video",
    mediaStorageProvider: "not_configured",
    cdnProvider: "not_configured",
    playbackManifestProvider: "not_configured",
    adminMediaReview: "not_connected",
    fakeVideoPreviewAllowed: false,
    fakePlaybackAllowed: false,
    fakeProviderSuccessAllowed: false,
    fakeUploadAllowed: false,
    fakePublishAllowed: false,
  };
}

function rebuild(
  state: StreamShortVideoSourcePreviewPlaybackState,
  patch: Partial<Omit<StreamShortVideoSourcePreviewPlaybackState, "evidence" | "updatedAt">>,
): StreamShortVideoSourcePreviewPlaybackState {
  const updatedAt = nowIso();
  const base = { ...state, ...patch, updatedAt };
  const status = computeStatus(base);
  const withStatus = { ...base, status };
  return { ...withStatus, evidence: buildEvidence(withStatus) };
}

function queueEvent(
  state: StreamShortVideoSourcePreviewPlaybackState,
  kind: StreamShortVideoSourcePreviewPlaybackEventKind,
): StreamShortVideoSourcePreviewPlaybackState {
  const event: StreamShortVideoSourcePreviewPlaybackEvent = {
    eventId: makeEventId(kind),
    kind,
    assetId: state.asset?.assetId ?? null,
    createdAt: nowIso(),
    deliveredToProvider: false,
    payload: {
      status: state.status,
      assetUriPresent: Boolean(state.asset?.uri),
      isPlayingLocal: state.isPlayingLocal,
      progressPercentLocal: progressPercent(state),
      localBlockers: localBlockers(state),
      providerBlockers: providerBlockers(),
    },
  };
  return rebuild(state, { events: [event, ...state.events].slice(0, 18) });
}

export function createInitialStreamShortVideoSourcePreviewPlaybackState(): StreamShortVideoSourcePreviewPlaybackState {
  const updatedAt = nowIso();
  const base: Omit<StreamShortVideoSourcePreviewPlaybackState, "evidence"> = {
    status: "idle_local",
    asset: null,
    isPlayingLocal: false,
    mutedLocal: false,
    loopLocal: false,
    playbackRateLocal: 1,
    positionMsLocal: 0,
    durationMsLocal: null,
    events: [],
    updatedAt,
  };
  return { ...base, evidence: buildEvidence(base) };
}

export function bindStreamShortVideoSourcePreviewPlaybackAssetLocal(
  state: StreamShortVideoSourcePreviewPlaybackState,
  asset: StreamShortVideoRecordUploadAsset | null,
): StreamShortVideoSourcePreviewPlaybackState {
  if (!asset?.uri) return state;
  const previewAsset: StreamShortVideoSourcePreviewPlaybackAsset = {
    assetId: asset.assetId,
    sourceKind: asset.kind,
    title: asset.title,
    uri: asset.uri,
    mimeType: asset.mimeType,
    durationMsLocal: asset.durationMsLocal,
    width: asset.width,
    height: asset.height,
    localOnly: true,
    deliveredToStorage: false,
  };
  return queueEvent(rebuild(state, {
    asset: previewAsset,
    isPlayingLocal: false,
    positionMsLocal: 0,
    durationMsLocal: asset.durationMsLocal,
    status: "source_bound_local",
  }), "short_source_preview_asset_bound_local");
}

export function markStreamShortVideoSourcePreviewReadyLocal(state: StreamShortVideoSourcePreviewPlaybackState): StreamShortVideoSourcePreviewPlaybackState {
  if (!state.asset?.uri) return state;
  return queueEvent(rebuild(state, { status: "preview_ready_local" }), "short_source_preview_ready_local");
}

export function playStreamShortVideoSourcePreviewLocal(state: StreamShortVideoSourcePreviewPlaybackState): StreamShortVideoSourcePreviewPlaybackState {
  if (!state.asset?.uri) return state;
  return queueEvent(rebuild(state, { isPlayingLocal: true, status: "playing_local" }), "short_source_preview_play_local");
}

export function pauseStreamShortVideoSourcePreviewLocal(state: StreamShortVideoSourcePreviewPlaybackState): StreamShortVideoSourcePreviewPlaybackState {
  if (!state.asset?.uri) return state;
  return queueEvent(rebuild(state, { isPlayingLocal: false, status: "paused_local" }), "short_source_preview_pause_local");
}

export function restartStreamShortVideoSourcePreviewLocal(state: StreamShortVideoSourcePreviewPlaybackState): StreamShortVideoSourcePreviewPlaybackState {
  if (!state.asset?.uri) return state;
  return queueEvent(rebuild(state, { isPlayingLocal: true, positionMsLocal: 0, status: "restarted_local" }), "short_source_preview_restart_local");
}

export function toggleStreamShortVideoSourcePreviewMuteLocal(state: StreamShortVideoSourcePreviewPlaybackState): StreamShortVideoSourcePreviewPlaybackState {
  return queueEvent(rebuild(state, { mutedLocal: !state.mutedLocal }), "short_source_preview_toggle_mute_local");
}

export function toggleStreamShortVideoSourcePreviewLoopLocal(state: StreamShortVideoSourcePreviewPlaybackState): StreamShortVideoSourcePreviewPlaybackState {
  return queueEvent(rebuild(state, { loopLocal: !state.loopLocal }), "short_source_preview_toggle_loop_local");
}

export function cycleStreamShortVideoSourcePreviewSpeedLocal(state: StreamShortVideoSourcePreviewPlaybackState): StreamShortVideoSourcePreviewPlaybackState {
  const currentIndex = playbackRates.findIndex((rate) => rate === state.playbackRateLocal);
  const nextRate = playbackRates[(currentIndex + 1) % playbackRates.length] ?? 1;
  return queueEvent(rebuild(state, { playbackRateLocal: nextRate }), "short_source_preview_speed_local");
}

export function syncStreamShortVideoSourcePreviewPlaybackStatusLocal(
  state: StreamShortVideoSourcePreviewPlaybackState,
  status: StreamShortVideoSourcePreviewPlaybackStatusInput,
): StreamShortVideoSourcePreviewPlaybackState {
  if (!state.asset?.uri || status.isLoaded === false) return state;
  const durationMs = typeof status.durationMillis === "number" && Number.isFinite(status.durationMillis)
    ? Math.max(0, Math.round(status.durationMillis))
    : state.durationMsLocal;
  const positionMs = typeof status.positionMillis === "number" && Number.isFinite(status.positionMillis)
    ? Math.max(0, Math.round(status.positionMillis))
    : state.positionMsLocal;
  const isPlaying = typeof status.isPlaying === "boolean" ? status.isPlaying : state.isPlayingLocal;
  const next = rebuild(state, {
    isPlayingLocal: isPlaying,
    positionMsLocal: positionMs,
    durationMsLocal: durationMs,
    status: isPlaying ? "playing_local" : "preview_ready_local",
  });
  return next;
}

export function queueStreamShortVideoSourcePreviewPlaybackEvent(
  state: StreamShortVideoSourcePreviewPlaybackState,
): StreamShortVideoSourcePreviewPlaybackState {
  return queueEvent(state, "short_source_preview_status_synced_local");
}

export function requestStreamShortVideoSourcePreviewProviderBlocked(
  state: StreamShortVideoSourcePreviewPlaybackState,
): StreamShortVideoSourcePreviewPlaybackState {
  return queueEvent(rebuild(state, { isPlayingLocal: false, status: "provider_playback_blocked" }), "short_source_preview_provider_blocked");
}

export function runStreamShortVideoSourcePreviewPlaybackCheck(
  state: StreamShortVideoSourcePreviewPlaybackState,
): StreamShortVideoSourcePreviewPlaybackState {
  return rebuild(state, {});
}
