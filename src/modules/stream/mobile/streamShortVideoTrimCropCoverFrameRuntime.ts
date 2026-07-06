import type { StreamShortVideoRecordUploadAsset } from "./streamShortVideoRecordUploadSourceFlowRuntime";

export type StreamShortVideoTrimCropCoverFrameStatus =
  | "idle_local"
  | "source_bound_local"
  | "trim_ready_local"
  | "crop_ready_local"
  | "cover_ready_local"
  | "timeline_review_bound_local"
  | "provider_editor_blocked";

export type StreamShortVideoTrimCropCoverFrameBlockerCode =
  | "source_asset_required"
  | "local_uri_required"
  | "trim_selection_required"
  | "crop_selection_required"
  | "cover_frame_required"
  | "timeline_binding_required"
  | "review_binding_required"
  | "media_storage_provider_required"
  | "cdn_provider_required"
  | "backend_editor_contract_required"
  | "admin_editor_review_required";

export type StreamShortVideoTrimCropCoverFrameEventKind =
  | "short_trim_crop_source_bound_local"
  | "short_trim_range_changed_local"
  | "short_crop_changed_local"
  | "short_cover_frame_changed_local"
  | "short_trim_crop_timeline_bound_local"
  | "short_trim_crop_review_bound_local"
  | "short_trim_crop_provider_blocked";

export type StreamShortVideoCropPreset = "original" | "portrait_9_16" | "square_1_1" | "feed_4_5" | "cinematic_16_9";

export type StreamShortVideoTrimCropCoverFrameAsset = {
  readonly assetId: string;
  readonly sourceKind: StreamShortVideoRecordUploadAsset["kind"];
  readonly title: string;
  readonly uri: string;
  readonly durationMsLocal: number;
  readonly width: number | null;
  readonly height: number | null;
  readonly localOnly: true;
  readonly deliveredToStorage: false;
};

export type StreamShortVideoTrimCropCoverFrameEvent = {
  readonly eventId: string;
  readonly kind: StreamShortVideoTrimCropCoverFrameEventKind;
  readonly assetId: string | null;
  readonly createdAt: string;
  readonly deliveredToProvider: false;
  readonly payload: {
    readonly status: StreamShortVideoTrimCropCoverFrameStatus;
    readonly trimStartMsLocal: number;
    readonly trimEndMsLocal: number;
    readonly cropPresetLocal: StreamShortVideoCropPreset;
    readonly coverFrameMsLocal: number | null;
    readonly timelineBoundLocal: boolean;
    readonly reviewCoverBoundLocal: boolean;
    readonly localBlockers: readonly StreamShortVideoTrimCropCoverFrameBlockerCode[];
    readonly providerBlockers: readonly StreamShortVideoTrimCropCoverFrameBlockerCode[];
  };
};

export type StreamShortVideoTrimCropCoverFrameEvidence = {
  readonly selectedAssetId: string | null;
  readonly selectedAssetTitle: string | null;
  readonly selectedAssetUriPresent: boolean;
  readonly durationMsLocal: number | null;
  readonly trimStartMsLocal: number;
  readonly trimEndMsLocal: number;
  readonly trimDurationMsLocal: number;
  readonly trimReadyLocal: boolean;
  readonly cropPresetLocal: StreamShortVideoCropPreset;
  readonly cropReadyLocal: boolean;
  readonly cropXPercentLocal: number;
  readonly cropYPercentLocal: number;
  readonly cropZoomPercentLocal: number;
  readonly coverFrameMsLocal: number | null;
  readonly coverFrameReadyLocal: boolean;
  readonly timelineBoundLocal: boolean;
  readonly reviewCoverBoundLocal: boolean;
  readonly editorReadyLocal: boolean;
  readonly queuedEditorEvents: number;
  readonly localBlockers: readonly StreamShortVideoTrimCropCoverFrameBlockerCode[];
  readonly providerBlockers: readonly StreamShortVideoTrimCropCoverFrameBlockerCode[];
  readonly nativeEditMode: "local_metadata_binding_only";
  readonly mediaStorageProvider: "not_configured";
  readonly cdnProvider: "not_configured";
  readonly backendEditorContract: "local_only_not_connected";
  readonly adminEditorReview: "not_connected";
  readonly fakeTrimAllowed: false;
  readonly fakeCropAllowed: false;
  readonly fakeCoverGeneratedAllowed: false;
  readonly fakeRenderAllowed: false;
  readonly fakeUploadAllowed: false;
  readonly fakePublishAllowed: false;
};

export type StreamShortVideoTrimCropCoverFrameState = {
  readonly status: StreamShortVideoTrimCropCoverFrameStatus;
  readonly asset: StreamShortVideoTrimCropCoverFrameAsset | null;
  readonly trimStartMsLocal: number;
  readonly trimEndMsLocal: number;
  readonly cropPresetLocal: StreamShortVideoCropPreset;
  readonly cropXPercentLocal: number;
  readonly cropYPercentLocal: number;
  readonly cropZoomPercentLocal: number;
  readonly coverFrameMsLocal: number | null;
  readonly timelineBoundLocal: boolean;
  readonly reviewCoverBoundLocal: boolean;
  readonly events: readonly StreamShortVideoTrimCropCoverFrameEvent[];
  readonly evidence: StreamShortVideoTrimCropCoverFrameEvidence;
  readonly updatedAt: string;
};

const nowIso = () => new Date().toISOString();
const makeEventId = (kind: StreamShortVideoTrimCropCoverFrameEventKind) => `${kind}-${Date.now()}-${Math.round(Math.random() * 10000)}`;
const cropPresets: readonly StreamShortVideoCropPreset[] = ["original", "portrait_9_16", "square_1_1", "feed_4_5", "cinematic_16_9"];

function providerBlockers(): readonly StreamShortVideoTrimCropCoverFrameBlockerCode[] {
  return ["media_storage_provider_required", "cdn_provider_required", "backend_editor_contract_required", "admin_editor_review_required"];
}

function fallbackDurationMs(asset: StreamShortVideoRecordUploadAsset | null | undefined): number {
  const duration = asset?.durationMsLocal;
  return typeof duration === "number" && Number.isFinite(duration) && duration > 0 ? Math.round(duration) : 9000;
}

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, Math.round(value)));
}

function trimDuration(state: Pick<StreamShortVideoTrimCropCoverFrameState, "trimStartMsLocal" | "trimEndMsLocal">): number {
  return Math.max(0, state.trimEndMsLocal - state.trimStartMsLocal);
}

function localBlockers(state: Pick<StreamShortVideoTrimCropCoverFrameState, "asset" | "trimStartMsLocal" | "trimEndMsLocal" | "cropPresetLocal" | "coverFrameMsLocal" | "timelineBoundLocal" | "reviewCoverBoundLocal">): readonly StreamShortVideoTrimCropCoverFrameBlockerCode[] {
  const blockers: StreamShortVideoTrimCropCoverFrameBlockerCode[] = [];
  if (!state.asset) blockers.push("source_asset_required");
  if (state.asset && !state.asset.uri) blockers.push("local_uri_required");
  if (!state.asset || trimDuration(state) < 1000) blockers.push("trim_selection_required");
  if (!state.cropPresetLocal) blockers.push("crop_selection_required");
  if (state.coverFrameMsLocal === null || state.coverFrameMsLocal < state.trimStartMsLocal || state.coverFrameMsLocal > state.trimEndMsLocal) blockers.push("cover_frame_required");
  if (!state.timelineBoundLocal) blockers.push("timeline_binding_required");
  if (!state.reviewCoverBoundLocal) blockers.push("review_binding_required");
  return blockers;
}

function computeStatus(state: Pick<StreamShortVideoTrimCropCoverFrameState, "asset" | "status" | "trimStartMsLocal" | "trimEndMsLocal" | "cropPresetLocal" | "coverFrameMsLocal" | "timelineBoundLocal" | "reviewCoverBoundLocal">): StreamShortVideoTrimCropCoverFrameStatus {
  if (state.status === "provider_editor_blocked") return state.status;
  if (!state.asset) return "idle_local";
  if (state.timelineBoundLocal && state.reviewCoverBoundLocal && localBlockers(state).length === 0) return "timeline_review_bound_local";
  if (state.coverFrameMsLocal !== null && state.coverFrameMsLocal >= state.trimStartMsLocal && state.coverFrameMsLocal <= state.trimEndMsLocal) return "cover_ready_local";
  if (state.cropPresetLocal) return "crop_ready_local";
  if (trimDuration(state) >= 1000) return "trim_ready_local";
  return "source_bound_local";
}

function buildEvidence(state: Pick<StreamShortVideoTrimCropCoverFrameState, "asset" | "status" | "trimStartMsLocal" | "trimEndMsLocal" | "cropPresetLocal" | "cropXPercentLocal" | "cropYPercentLocal" | "cropZoomPercentLocal" | "coverFrameMsLocal" | "timelineBoundLocal" | "reviewCoverBoundLocal" | "events">): StreamShortVideoTrimCropCoverFrameEvidence {
  const blockers = localBlockers(state);
  const duration = trimDuration(state);
  return {
    selectedAssetId: state.asset?.assetId ?? null,
    selectedAssetTitle: state.asset?.title ?? null,
    selectedAssetUriPresent: Boolean(state.asset?.uri),
    durationMsLocal: state.asset?.durationMsLocal ?? null,
    trimStartMsLocal: state.trimStartMsLocal,
    trimEndMsLocal: state.trimEndMsLocal,
    trimDurationMsLocal: duration,
    trimReadyLocal: Boolean(state.asset?.uri) && duration >= 1000,
    cropPresetLocal: state.cropPresetLocal,
    cropReadyLocal: Boolean(state.cropPresetLocal),
    cropXPercentLocal: state.cropXPercentLocal,
    cropYPercentLocal: state.cropYPercentLocal,
    cropZoomPercentLocal: state.cropZoomPercentLocal,
    coverFrameMsLocal: state.coverFrameMsLocal,
    coverFrameReadyLocal: state.coverFrameMsLocal !== null && state.coverFrameMsLocal >= state.trimStartMsLocal && state.coverFrameMsLocal <= state.trimEndMsLocal,
    timelineBoundLocal: state.timelineBoundLocal,
    reviewCoverBoundLocal: state.reviewCoverBoundLocal,
    editorReadyLocal: blockers.length === 0,
    queuedEditorEvents: state.events.length,
    localBlockers: blockers,
    providerBlockers: providerBlockers(),
    nativeEditMode: "local_metadata_binding_only",
    mediaStorageProvider: "not_configured",
    cdnProvider: "not_configured",
    backendEditorContract: "local_only_not_connected",
    adminEditorReview: "not_connected",
    fakeTrimAllowed: false,
    fakeCropAllowed: false,
    fakeCoverGeneratedAllowed: false,
    fakeRenderAllowed: false,
    fakeUploadAllowed: false,
    fakePublishAllowed: false,
  };
}

function rebuild(
  state: StreamShortVideoTrimCropCoverFrameState,
  patch: Partial<Omit<StreamShortVideoTrimCropCoverFrameState, "evidence" | "updatedAt">>,
): StreamShortVideoTrimCropCoverFrameState {
  const nextBase = { ...state, ...patch, updatedAt: nowIso() };
  return {
    ...nextBase,
    status: computeStatus(nextBase),
    evidence: buildEvidence(nextBase),
  };
}

export function createInitialStreamShortVideoTrimCropCoverFrameState(): StreamShortVideoTrimCropCoverFrameState {
  const updatedAt = nowIso();
  const base: Omit<StreamShortVideoTrimCropCoverFrameState, "evidence"> = {
    status: "idle_local",
    asset: null,
    trimStartMsLocal: 0,
    trimEndMsLocal: 0,
    cropPresetLocal: "portrait_9_16",
    cropXPercentLocal: 50,
    cropYPercentLocal: 50,
    cropZoomPercentLocal: 100,
    coverFrameMsLocal: null,
    timelineBoundLocal: false,
    reviewCoverBoundLocal: false,
    events: [],
    updatedAt,
  };
  return { ...base, evidence: buildEvidence(base) };
}

export function bindStreamShortVideoTrimCropCoverFrameAssetLocal(
  state: StreamShortVideoTrimCropCoverFrameState,
  asset: StreamShortVideoRecordUploadAsset | null,
): StreamShortVideoTrimCropCoverFrameState {
  if (!asset?.uri) return state;
  const durationMsLocal = fallbackDurationMs(asset);
  const nextAsset: StreamShortVideoTrimCropCoverFrameAsset = {
    assetId: asset.assetId,
    sourceKind: asset.kind,
    title: asset.title,
    uri: asset.uri,
    durationMsLocal,
    width: asset.width,
    height: asset.height,
    localOnly: true,
    deliveredToStorage: false,
  };
  const trimEndMsLocal = Math.max(1000, Math.min(durationMsLocal, 15000));
  return queueStreamShortVideoTrimCropCoverFrameEvent(rebuild(state, {
    asset: nextAsset,
    trimStartMsLocal: 0,
    trimEndMsLocal,
    cropPresetLocal: "portrait_9_16",
    cropXPercentLocal: 50,
    cropYPercentLocal: 50,
    cropZoomPercentLocal: 100,
    coverFrameMsLocal: Math.round(trimEndMsLocal / 2),
    timelineBoundLocal: false,
    reviewCoverBoundLocal: false,
    status: "source_bound_local",
  }), "short_trim_crop_source_bound_local");
}

export function nudgeStreamShortVideoTrimStartLocal(state: StreamShortVideoTrimCropCoverFrameState, direction: "back" | "forward"): StreamShortVideoTrimCropCoverFrameState {
  if (!state.asset) return state;
  const delta = direction === "forward" ? 250 : -250;
  const maxStart = Math.max(0, state.trimEndMsLocal - 1000);
  const trimStartMsLocal = clamp(state.trimStartMsLocal + delta, 0, maxStart);
  const coverFrameMsLocal = state.coverFrameMsLocal === null ? Math.round((trimStartMsLocal + state.trimEndMsLocal) / 2) : clamp(state.coverFrameMsLocal, trimStartMsLocal, state.trimEndMsLocal);
  return queueStreamShortVideoTrimCropCoverFrameEvent(rebuild(state, { trimStartMsLocal, coverFrameMsLocal, timelineBoundLocal: false, reviewCoverBoundLocal: false }), "short_trim_range_changed_local");
}

export function nudgeStreamShortVideoTrimEndLocal(state: StreamShortVideoTrimCropCoverFrameState, direction: "back" | "forward"): StreamShortVideoTrimCropCoverFrameState {
  if (!state.asset) return state;
  const delta = direction === "forward" ? 250 : -250;
  const minEnd = state.trimStartMsLocal + 1000;
  const maxEnd = state.asset.durationMsLocal;
  const trimEndMsLocal = clamp(state.trimEndMsLocal + delta, minEnd, maxEnd);
  const coverFrameMsLocal = state.coverFrameMsLocal === null ? Math.round((state.trimStartMsLocal + trimEndMsLocal) / 2) : clamp(state.coverFrameMsLocal, state.trimStartMsLocal, trimEndMsLocal);
  return queueStreamShortVideoTrimCropCoverFrameEvent(rebuild(state, { trimEndMsLocal, coverFrameMsLocal, timelineBoundLocal: false, reviewCoverBoundLocal: false }), "short_trim_range_changed_local");
}

export function resetStreamShortVideoTrimLocal(state: StreamShortVideoTrimCropCoverFrameState): StreamShortVideoTrimCropCoverFrameState {
  if (!state.asset) return state;
  const trimEndMsLocal = Math.max(1000, Math.min(state.asset.durationMsLocal, 15000));
  return queueStreamShortVideoTrimCropCoverFrameEvent(rebuild(state, {
    trimStartMsLocal: 0,
    trimEndMsLocal,
    coverFrameMsLocal: Math.round(trimEndMsLocal / 2),
    timelineBoundLocal: false,
    reviewCoverBoundLocal: false,
  }), "short_trim_range_changed_local");
}

export function cycleStreamShortVideoCropPresetLocal(state: StreamShortVideoTrimCropCoverFrameState): StreamShortVideoTrimCropCoverFrameState {
  const currentIndex = cropPresets.indexOf(state.cropPresetLocal);
  const cropPresetLocal = cropPresets[(currentIndex + 1) % cropPresets.length] ?? "portrait_9_16";
  return queueStreamShortVideoTrimCropCoverFrameEvent(rebuild(state, { cropPresetLocal, timelineBoundLocal: false }), "short_crop_changed_local");
}

export function nudgeStreamShortVideoCropXLocal(state: StreamShortVideoTrimCropCoverFrameState, direction: "left" | "right"): StreamShortVideoTrimCropCoverFrameState {
  const cropXPercentLocal = clamp(state.cropXPercentLocal + (direction === "right" ? 5 : -5), 0, 100);
  return queueStreamShortVideoTrimCropCoverFrameEvent(rebuild(state, { cropXPercentLocal, timelineBoundLocal: false }), "short_crop_changed_local");
}

export function nudgeStreamShortVideoCropYLocal(state: StreamShortVideoTrimCropCoverFrameState, direction: "up" | "down"): StreamShortVideoTrimCropCoverFrameState {
  const cropYPercentLocal = clamp(state.cropYPercentLocal + (direction === "down" ? 5 : -5), 0, 100);
  return queueStreamShortVideoTrimCropCoverFrameEvent(rebuild(state, { cropYPercentLocal, timelineBoundLocal: false }), "short_crop_changed_local");
}

export function cycleStreamShortVideoCropZoomLocal(state: StreamShortVideoTrimCropCoverFrameState): StreamShortVideoTrimCropCoverFrameState {
  const next = state.cropZoomPercentLocal >= 150 ? 100 : state.cropZoomPercentLocal + 10;
  return queueStreamShortVideoTrimCropCoverFrameEvent(rebuild(state, { cropZoomPercentLocal: next, timelineBoundLocal: false }), "short_crop_changed_local");
}

export function nudgeStreamShortVideoCoverFrameLocal(state: StreamShortVideoTrimCropCoverFrameState, direction: "back" | "forward"): StreamShortVideoTrimCropCoverFrameState {
  if (!state.asset) return state;
  const current = state.coverFrameMsLocal ?? Math.round((state.trimStartMsLocal + state.trimEndMsLocal) / 2);
  const coverFrameMsLocal = clamp(current + (direction === "forward" ? 250 : -250), state.trimStartMsLocal, state.trimEndMsLocal);
  return queueStreamShortVideoTrimCropCoverFrameEvent(rebuild(state, { coverFrameMsLocal, reviewCoverBoundLocal: false }), "short_cover_frame_changed_local");
}

export function markStreamShortVideoTrimCropTimelineBoundLocal(state: StreamShortVideoTrimCropCoverFrameState): StreamShortVideoTrimCropCoverFrameState {
  return queueStreamShortVideoTrimCropCoverFrameEvent(rebuild(state, { timelineBoundLocal: Boolean(state.asset?.uri) }), "short_trim_crop_timeline_bound_local");
}

export function markStreamShortVideoTrimCropReviewCoverBoundLocal(state: StreamShortVideoTrimCropCoverFrameState): StreamShortVideoTrimCropCoverFrameState {
  return queueStreamShortVideoTrimCropCoverFrameEvent(rebuild(state, { reviewCoverBoundLocal: Boolean(state.asset?.uri) }), "short_trim_crop_review_bound_local");
}

export function runStreamShortVideoTrimCropCoverFrameCheck(state: StreamShortVideoTrimCropCoverFrameState): StreamShortVideoTrimCropCoverFrameState {
  return rebuild(state, {});
}

export function queueStreamShortVideoTrimCropCoverFrameEvent(
  state: StreamShortVideoTrimCropCoverFrameState,
  kind: StreamShortVideoTrimCropCoverFrameEventKind = "short_trim_range_changed_local",
): StreamShortVideoTrimCropCoverFrameState {
  const event: StreamShortVideoTrimCropCoverFrameEvent = {
    eventId: makeEventId(kind),
    kind,
    assetId: state.asset?.assetId ?? null,
    createdAt: nowIso(),
    deliveredToProvider: false,
    payload: {
      status: state.status,
      trimStartMsLocal: state.trimStartMsLocal,
      trimEndMsLocal: state.trimEndMsLocal,
      cropPresetLocal: state.cropPresetLocal,
      coverFrameMsLocal: state.coverFrameMsLocal,
      timelineBoundLocal: state.timelineBoundLocal,
      reviewCoverBoundLocal: state.reviewCoverBoundLocal,
      localBlockers: state.evidence.localBlockers,
      providerBlockers: state.evidence.providerBlockers,
    },
  };
  return rebuild(state, { events: [event, ...state.events].slice(0, 18) });
}

export function requestStreamShortVideoTrimCropCoverFrameProviderBlocked(state: StreamShortVideoTrimCropCoverFrameState): StreamShortVideoTrimCropCoverFrameState {
  const queued = queueStreamShortVideoTrimCropCoverFrameEvent(state, "short_trim_crop_provider_blocked");
  return { ...queued, status: "provider_editor_blocked", evidence: buildEvidence(queued) };
}
