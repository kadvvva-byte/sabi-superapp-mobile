export type StreamShortVideoRecordUploadSourceKind = "camera_record" | "library_video" | "document_video";

export type StreamShortVideoRecordUploadSourceStatus =
  | "idle_local"
  | "source_selected_local"
  | "permission_requested_local"
  | "picker_opened_local"
  | "asset_selected_local"
  | "source_ready_local"
  | "cancelled_local"
  | "permission_blocked_local"
  | "provider_handoff_blocked";

export type StreamShortVideoRecordUploadSourceBlockerCode =
  | "real_source_required"
  | "camera_permission_required"
  | "library_permission_required"
  | "native_picker_required"
  | "local_uri_required"
  | "timeline_clip_binding_required"
  | "media_storage_provider_required"
  | "cdn_provider_required"
  | "backend_asset_contract_required"
  | "admin_media_review_required";

export type StreamShortVideoRecordUploadSourceEventKind =
  | "short_record_source_selected_local"
  | "short_upload_source_selected_local"
  | "short_video_document_selected_local"
  | "short_source_picker_opened_local"
  | "short_source_permission_blocked_local"
  | "short_source_cancelled_local"
  | "short_source_asset_bound_local"
  | "short_source_provider_handoff_blocked";

export type StreamShortVideoPickedLocalAssetInput = {
  readonly kind: StreamShortVideoRecordUploadSourceKind;
  readonly uri: string;
  readonly fileName?: string | null;
  readonly mimeType?: string | null;
  readonly durationMs?: number | null;
  readonly width?: number | null;
  readonly height?: number | null;
  readonly size?: number | null;
};

export type StreamShortVideoRecordUploadAsset = {
  readonly assetId: string;
  readonly kind: StreamShortVideoRecordUploadSourceKind;
  readonly title: string;
  readonly uri: string;
  readonly mimeType: string | null;
  readonly durationMsLocal: number | null;
  readonly width: number | null;
  readonly height: number | null;
  readonly sizeBytes: number | null;
  readonly localOnly: true;
  readonly providerAssetId: null;
  readonly deliveredToStorage: false;
  readonly timelineClipBoundLocal: boolean;
  readonly createdAt: string;
};

export type StreamShortVideoRecordUploadSourceEvent = {
  readonly eventId: string;
  readonly kind: StreamShortVideoRecordUploadSourceEventKind;
  readonly sourceKind: StreamShortVideoRecordUploadSourceKind;
  readonly createdAt: string;
  readonly deliveredToProvider: false;
  readonly payload: {
    readonly status: StreamShortVideoRecordUploadSourceStatus;
    readonly selectedAssetId: string | null;
    readonly localUriPresent: boolean;
    readonly localBlockers: readonly StreamShortVideoRecordUploadSourceBlockerCode[];
    readonly providerBlockers: readonly StreamShortVideoRecordUploadSourceBlockerCode[];
  };
};

export type StreamShortVideoRecordUploadSourceEvidence = {
  readonly selectedSourceKind: StreamShortVideoRecordUploadSourceKind;
  readonly selectedAssetId: string | null;
  readonly selectedAssetTitle: string | null;
  readonly selectedAssetUriPresent: boolean;
  readonly selectedAssetDurationMsLocal: number | null;
  readonly selectedAssetSizeBytes: number | null;
  readonly cameraAssetSelectedLocal: boolean;
  readonly libraryAssetSelectedLocal: boolean;
  readonly documentAssetSelectedLocal: boolean;
  readonly sourceClipReadyLocal: boolean;
  readonly timelineClipBoundLocal: boolean;
  readonly queuedSourceFlowEvents: number;
  readonly localBlockers: readonly StreamShortVideoRecordUploadSourceBlockerCode[];
  readonly providerBlockers: readonly StreamShortVideoRecordUploadSourceBlockerCode[];
  readonly mediaStorageProvider: "not_configured";
  readonly cdnProvider: "not_configured";
  readonly backendAssetContract: "local_only_not_connected";
  readonly adminMediaReview: "not_connected";
  readonly fakeCameraCaptureAllowed: false;
  readonly fakeUploadAllowed: false;
  readonly fakeProviderAssetAllowed: false;
  readonly fakePublishAllowed: false;
};

export type StreamShortVideoRecordUploadSourceFlowState = {
  readonly status: StreamShortVideoRecordUploadSourceStatus;
  readonly selectedSourceKind: StreamShortVideoRecordUploadSourceKind;
  readonly selectedAssetId: string | null;
  readonly assets: readonly StreamShortVideoRecordUploadAsset[];
  readonly events: readonly StreamShortVideoRecordUploadSourceEvent[];
  readonly evidence: StreamShortVideoRecordUploadSourceEvidence;
  readonly updatedAt: string;
};

const nowIso = () => new Date().toISOString();
const makeId = (prefix: string) => `${prefix}-${Date.now()}-${Math.round(Math.random() * 10000)}`;

const providerBlockers = (): readonly StreamShortVideoRecordUploadSourceBlockerCode[] => [
  "media_storage_provider_required",
  "cdn_provider_required",
  "backend_asset_contract_required",
  "admin_media_review_required",
];

function selectedAsset(state: Pick<StreamShortVideoRecordUploadSourceFlowState, "assets" | "selectedAssetId">): StreamShortVideoRecordUploadAsset | null {
  return state.assets.find((asset) => asset.assetId === state.selectedAssetId) ?? null;
}

function localBlockers(state: Pick<StreamShortVideoRecordUploadSourceFlowState, "selectedSourceKind" | "status" | "assets" | "selectedAssetId">): readonly StreamShortVideoRecordUploadSourceBlockerCode[] {
  const asset = selectedAsset(state);
  const blockers: StreamShortVideoRecordUploadSourceBlockerCode[] = [];
  if (!asset) blockers.push("real_source_required");
  if (state.status === "idle_local" || state.status === "source_selected_local") blockers.push("native_picker_required");
  if (state.selectedSourceKind === "camera_record" && state.status === "permission_blocked_local") blockers.push("camera_permission_required");
  if ((state.selectedSourceKind === "library_video" || state.selectedSourceKind === "document_video") && state.status === "permission_blocked_local") blockers.push("library_permission_required");
  if (asset && !asset.uri) blockers.push("local_uri_required");
  if (asset && !asset.timelineClipBoundLocal) blockers.push("timeline_clip_binding_required");
  return blockers;
}

function computeStatus(state: Pick<StreamShortVideoRecordUploadSourceFlowState, "selectedSourceKind" | "status" | "assets" | "selectedAssetId">): StreamShortVideoRecordUploadSourceStatus {
  if (state.status === "provider_handoff_blocked" || state.status === "permission_blocked_local" || state.status === "cancelled_local") return state.status;
  const asset = selectedAsset(state);
  if (asset?.timelineClipBoundLocal && localBlockers(state).length === 0) return "source_ready_local";
  if (asset?.uri) return "asset_selected_local";
  return state.status;
}

function buildEvidence(state: Pick<StreamShortVideoRecordUploadSourceFlowState, "selectedSourceKind" | "status" | "selectedAssetId" | "assets" | "events">): StreamShortVideoRecordUploadSourceEvidence {
  const asset = selectedAsset(state);
  const blockers = localBlockers(state);
  return {
    selectedSourceKind: state.selectedSourceKind,
    selectedAssetId: asset?.assetId ?? null,
    selectedAssetTitle: asset?.title ?? null,
    selectedAssetUriPresent: Boolean(asset?.uri),
    selectedAssetDurationMsLocal: asset?.durationMsLocal ?? null,
    selectedAssetSizeBytes: asset?.sizeBytes ?? null,
    cameraAssetSelectedLocal: state.assets.some((item) => item.kind === "camera_record"),
    libraryAssetSelectedLocal: state.assets.some((item) => item.kind === "library_video"),
    documentAssetSelectedLocal: state.assets.some((item) => item.kind === "document_video"),
    sourceClipReadyLocal: blockers.length === 0,
    timelineClipBoundLocal: Boolean(asset?.timelineClipBoundLocal),
    queuedSourceFlowEvents: state.events.length,
    localBlockers: blockers,
    providerBlockers: providerBlockers(),
    mediaStorageProvider: "not_configured",
    cdnProvider: "not_configured",
    backendAssetContract: "local_only_not_connected",
    adminMediaReview: "not_connected",
    fakeCameraCaptureAllowed: false,
    fakeUploadAllowed: false,
    fakeProviderAssetAllowed: false,
    fakePublishAllowed: false,
  };
}

function rebuild(
  state: StreamShortVideoRecordUploadSourceFlowState,
  patch: Partial<Omit<StreamShortVideoRecordUploadSourceFlowState, "evidence" | "updatedAt">>,
): StreamShortVideoRecordUploadSourceFlowState {
  const updatedAt = nowIso();
  const base = { ...state, ...patch, updatedAt };
  const status = computeStatus(base);
  const withStatus = { ...base, status };
  return { ...withStatus, evidence: buildEvidence(withStatus) };
}

function queueEvent(
  state: StreamShortVideoRecordUploadSourceFlowState,
  kind: StreamShortVideoRecordUploadSourceEventKind,
): StreamShortVideoRecordUploadSourceFlowState {
  const asset = selectedAsset(state);
  const event: StreamShortVideoRecordUploadSourceEvent = {
    eventId: makeId(kind),
    kind,
    sourceKind: state.selectedSourceKind,
    createdAt: nowIso(),
    deliveredToProvider: false,
    payload: {
      status: computeStatus(state),
      selectedAssetId: asset?.assetId ?? null,
      localUriPresent: Boolean(asset?.uri),
      localBlockers: localBlockers(state),
      providerBlockers: providerBlockers(),
    },
  };
  return rebuild(state, { events: [event, ...state.events].slice(0, 16) });
}

export function createInitialStreamShortVideoRecordUploadSourceFlowState(): StreamShortVideoRecordUploadSourceFlowState {
  const updatedAt = nowIso();
  const base: Omit<StreamShortVideoRecordUploadSourceFlowState, "evidence"> = {
    status: "idle_local",
    selectedSourceKind: "camera_record",
    selectedAssetId: null,
    assets: [],
    events: [],
    updatedAt,
  };
  return { ...base, evidence: buildEvidence(base) };
}

export function selectStreamShortVideoRecordUploadSourceFlow(
  state: StreamShortVideoRecordUploadSourceFlowState,
  sourceKind: StreamShortVideoRecordUploadSourceKind,
): StreamShortVideoRecordUploadSourceFlowState {
  const kind: StreamShortVideoRecordUploadSourceEventKind =
    sourceKind === "camera_record" ? "short_record_source_selected_local" : sourceKind === "library_video" ? "short_upload_source_selected_local" : "short_video_document_selected_local";
  return queueEvent(rebuild(state, { selectedSourceKind: sourceKind, status: "source_selected_local" }), kind);
}

export function markStreamShortVideoRecordUploadPermissionRequested(
  state: StreamShortVideoRecordUploadSourceFlowState,
): StreamShortVideoRecordUploadSourceFlowState {
  return rebuild(state, { status: "permission_requested_local" });
}

export function markStreamShortVideoRecordUploadPickerOpened(
  state: StreamShortVideoRecordUploadSourceFlowState,
): StreamShortVideoRecordUploadSourceFlowState {
  return queueEvent(rebuild(state, { status: "picker_opened_local" }), "short_source_picker_opened_local");
}

export function markStreamShortVideoRecordUploadPermissionBlocked(
  state: StreamShortVideoRecordUploadSourceFlowState,
): StreamShortVideoRecordUploadSourceFlowState {
  return queueEvent(rebuild(state, { status: "permission_blocked_local" }), "short_source_permission_blocked_local");
}

export function markStreamShortVideoRecordUploadCancelled(
  state: StreamShortVideoRecordUploadSourceFlowState,
): StreamShortVideoRecordUploadSourceFlowState {
  return queueEvent(rebuild(state, { status: "cancelled_local" }), "short_source_cancelled_local");
}

export function commitStreamShortVideoPickedLocalAsset(
  state: StreamShortVideoRecordUploadSourceFlowState,
  input: StreamShortVideoPickedLocalAssetInput,
): StreamShortVideoRecordUploadSourceFlowState {
  if (!input.uri) return state;
  const createdAt = nowIso();
  const asset: StreamShortVideoRecordUploadAsset = {
    assetId: makeId(`short-source-${input.kind}`),
    kind: input.kind,
    title: input.fileName?.trim() || (input.kind === "camera_record" ? "Записанное видео Sabi" : input.kind === "library_video" ? "Видео из галереи" : "Выбранный видеофайл"),
    uri: input.uri,
    mimeType: input.mimeType ?? null,
    durationMsLocal: typeof input.durationMs === "number" && Number.isFinite(input.durationMs) ? Math.max(0, Math.round(input.durationMs)) : null,
    width: typeof input.width === "number" && Number.isFinite(input.width) ? Math.round(input.width) : null,
    height: typeof input.height === "number" && Number.isFinite(input.height) ? Math.round(input.height) : null,
    sizeBytes: typeof input.size === "number" && Number.isFinite(input.size) ? Math.round(input.size) : null,
    localOnly: true,
    providerAssetId: null,
    deliveredToStorage: false,
    timelineClipBoundLocal: false,
    createdAt,
  };
  return queueEvent(rebuild(state, {
    selectedSourceKind: input.kind,
    selectedAssetId: asset.assetId,
    assets: [asset, ...state.assets].slice(0, 8),
    status: "asset_selected_local",
  }), "short_source_asset_bound_local");
}

export function markStreamShortVideoPickedAssetTimelineBound(
  state: StreamShortVideoRecordUploadSourceFlowState,
): StreamShortVideoRecordUploadSourceFlowState {
  const asset = selectedAsset(state);
  if (!asset) return state;
  const assets = state.assets.map((item) => (item.assetId === asset.assetId ? { ...item, timelineClipBoundLocal: true } : item));
  return queueEvent(rebuild(state, { assets, status: "source_ready_local" }), "short_source_asset_bound_local");
}

export function queueStreamShortVideoRecordUploadSourceFlowEvent(
  state: StreamShortVideoRecordUploadSourceFlowState,
): StreamShortVideoRecordUploadSourceFlowState {
  return queueEvent(state, "short_source_asset_bound_local");
}

export function requestStreamShortVideoRecordUploadSourceProviderBlocked(
  state: StreamShortVideoRecordUploadSourceFlowState,
): StreamShortVideoRecordUploadSourceFlowState {
  return queueEvent(rebuild(state, { status: "provider_handoff_blocked" }), "short_source_provider_handoff_blocked");
}

export function runStreamShortVideoRecordUploadSourceFlowCheck(
  state: StreamShortVideoRecordUploadSourceFlowState,
): StreamShortVideoRecordUploadSourceFlowState {
  return rebuild(state, {});
}
