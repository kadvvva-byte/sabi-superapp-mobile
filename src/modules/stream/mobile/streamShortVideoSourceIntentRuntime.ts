import type { StreamShortVideoSourceIntent } from "./streamShortVideoDraftRuntime";

export type StreamShortVideoSourceId = "camera_capture" | "library_upload" | "editor_workspace" | "cover_picker" | "caption_track";

export type StreamShortVideoSourceStatus =
  | "idle_local"
  | "intent_selected_local"
  | "permission_requested_local"
  | "asset_intent_ready_local"
  | "source_ready_local"
  | "provider_handoff_blocked";

export type StreamShortVideoSourceBlockerCode =
  | "source_intent_required"
  | "camera_permission_required"
  | "library_permission_required"
  | "asset_intent_required"
  | "cover_source_required"
  | "caption_source_required"
  | "source_policy_ack_required"
  | "media_storage_provider_required"
  | "cdn_provider_required"
  | "backend_asset_contract_required"
  | "admin_media_review_required";

export type StreamShortVideoSourceEventKind =
  | "short_source_selected_local"
  | "short_source_permission_requested_local"
  | "short_source_asset_intent_ready_local"
  | "short_source_reviewed_local"
  | "short_source_provider_handoff_blocked";

export type StreamShortVideoSourceRecord = {
  readonly sourceId: StreamShortVideoSourceId;
  readonly draftIntent: StreamShortVideoSourceIntent;
  readonly label: string;
  readonly purpose: string;
  readonly status: StreamShortVideoSourceStatus;
  readonly permissionRequestedLocal: boolean;
  readonly assetIntentReadyLocal: boolean;
  readonly coverIntentReadyLocal: boolean;
  readonly captionIntentReadyLocal: boolean;
  readonly policyReviewedLocal: boolean;
  readonly providerAssetId: null;
  readonly deliveredToStorage: false;
  readonly updatedAt: string;
};

export type StreamShortVideoSourceEvent = {
  readonly eventId: string;
  readonly kind: StreamShortVideoSourceEventKind;
  readonly sourceId: StreamShortVideoSourceId;
  readonly draftIntent: StreamShortVideoSourceIntent;
  readonly createdAt: string;
  readonly deliveredToProvider: false;
  readonly payload: {
    readonly sourceStatus: StreamShortVideoSourceStatus;
    readonly permissionRequestedLocal: boolean;
    readonly assetIntentReadyLocal: boolean;
    readonly localBlockers: readonly StreamShortVideoSourceBlockerCode[];
    readonly providerBlockers: readonly StreamShortVideoSourceBlockerCode[];
  };
};

export type StreamShortVideoSourceEvidence = {
  readonly selectedSourceId: StreamShortVideoSourceId | null;
  readonly selectedDraftIntent: StreamShortVideoSourceIntent | null;
  readonly selectedStatus: StreamShortVideoSourceStatus;
  readonly selectedReadyLocal: boolean;
  readonly cameraReadyLocal: boolean;
  readonly uploadReadyLocal: boolean;
  readonly editorReadyLocal: boolean;
  readonly coverReadyLocal: boolean;
  readonly captionsReadyLocal: boolean;
  readonly queuedSourceEvents: number;
  readonly localBlockers: readonly StreamShortVideoSourceBlockerCode[];
  readonly providerBlockers: readonly StreamShortVideoSourceBlockerCode[];
  readonly backendShortsAssetContract: "local_only_not_connected";
  readonly mediaStorageProvider: "not_configured";
  readonly cdnProvider: "not_configured";
  readonly adminMediaReview: "not_connected";
  readonly fakeCameraCaptureAllowed: false;
  readonly fakeUploadAllowed: false;
  readonly fakeProviderAssetAllowed: false;
  readonly fakePublishAllowed: false;
  readonly paymentsAllowedNow: false;
  readonly giftsAllowedNow: false;
  readonly monetizationAllowedNow: false;
};

export type StreamShortVideoSourceRuntimeState = {
  readonly status: StreamShortVideoSourceStatus;
  readonly selectedSourceId: StreamShortVideoSourceId | null;
  readonly sources: readonly StreamShortVideoSourceRecord[];
  readonly events: readonly StreamShortVideoSourceEvent[];
  readonly evidence: StreamShortVideoSourceEvidence;
  readonly updatedAt: string;
};

const nowIso = () => new Date().toISOString();
const makeId = (prefix: string) => `${prefix}-${Date.now()}-${Math.round(Math.random() * 10000)}`;

const sourceSeed: readonly Omit<StreamShortVideoSourceRecord, "status" | "permissionRequestedLocal" | "assetIntentReadyLocal" | "coverIntentReadyLocal" | "captionIntentReadyLocal" | "policyReviewedLocal" | "providerAssetId" | "deliveredToStorage" | "updatedAt">[] = [
  { sourceId: "camera_capture", draftIntent: "camera", label: "Камера Sabi", purpose: "Записать новый короткий клип с камеры телефона." },
  { sourceId: "library_upload", draftIntent: "upload", label: "Видео из галереи", purpose: "Выбрать готовый видеофайл для черновика шорта." },
  { sourceId: "editor_workspace", draftIntent: "editor", label: "Монтажный стол", purpose: "Собрать клипы в локальном монтажном редакторе." },
  { sourceId: "cover_picker", draftIntent: "cover", label: "Выбор обложки", purpose: "Подготовить кадр обложки перед передачей на публикацию." },
  { sourceId: "caption_track", draftIntent: "captions", label: "Дорожка текста", purpose: "Подготовить субтитры/текст перед передачей на публикацию." },
];

function createRecord(seed: (typeof sourceSeed)[number], updatedAt: string): StreamShortVideoSourceRecord {
  return {
    ...seed,
    status: "idle_local",
    permissionRequestedLocal: false,
    assetIntentReadyLocal: false,
    coverIntentReadyLocal: false,
    captionIntentReadyLocal: false,
    policyReviewedLocal: false,
    providerAssetId: null,
    deliveredToStorage: false,
    updatedAt,
  };
}

function providerBlockers(): readonly StreamShortVideoSourceBlockerCode[] {
  return [
    "media_storage_provider_required",
    "cdn_provider_required",
    "backend_asset_contract_required",
    "admin_media_review_required",
  ];
}

function selectedSource(state: Pick<StreamShortVideoSourceRuntimeState, "sources" | "selectedSourceId">): StreamShortVideoSourceRecord | null {
  return state.selectedSourceId ? state.sources.find((source) => source.sourceId === state.selectedSourceId) ?? null : null;
}

function sourceLocalBlockers(source: StreamShortVideoSourceRecord): readonly StreamShortVideoSourceBlockerCode[] {
  const blockers: StreamShortVideoSourceBlockerCode[] = [];
  if (!source.draftIntent) blockers.push("source_intent_required");
  if (source.sourceId === "camera_capture" && !source.permissionRequestedLocal) blockers.push("camera_permission_required");
  if (source.sourceId === "library_upload" && !source.permissionRequestedLocal) blockers.push("library_permission_required");
  if ((source.sourceId === "camera_capture" || source.sourceId === "library_upload" || source.sourceId === "editor_workspace") && !source.assetIntentReadyLocal) blockers.push("asset_intent_required");
  if (source.sourceId === "cover_picker" && !source.coverIntentReadyLocal) blockers.push("cover_source_required");
  if (source.sourceId === "caption_track" && !source.captionIntentReadyLocal) blockers.push("caption_source_required");
  if (!source.policyReviewedLocal) blockers.push("source_policy_ack_required");
  return blockers;
}

function isSourceReady(source: StreamShortVideoSourceRecord): boolean {
  return sourceLocalBlockers(source).length === 0;
}

function computeStatus(source: StreamShortVideoSourceRecord): StreamShortVideoSourceStatus {
  if (source.status === "provider_handoff_blocked") return "provider_handoff_blocked";
  if (isSourceReady(source)) return "source_ready_local";
  if (source.assetIntentReadyLocal || source.coverIntentReadyLocal || source.captionIntentReadyLocal) return "asset_intent_ready_local";
  if (source.permissionRequestedLocal) return "permission_requested_local";
  return source.status === "idle_local" ? "intent_selected_local" : source.status;
}

function buildEvidence(state: Pick<StreamShortVideoSourceRuntimeState, "sources" | "selectedSourceId" | "events">): StreamShortVideoSourceEvidence {
  const selected = selectedSource(state);
  const selectedStatus: StreamShortVideoSourceStatus = selected ? computeStatus(selected) : "idle_local";
  const localBlockers = selected ? sourceLocalBlockers(selected) : ["source_intent_required"] as const;
  const ready = (id: StreamShortVideoSourceId) => {
    const source = state.sources.find((item) => item.sourceId === id);
    return Boolean(source && isSourceReady(source));
  };
  return {
    selectedSourceId: selected?.sourceId ?? null,
    selectedDraftIntent: selected?.draftIntent ?? null,
    selectedStatus,
    selectedReadyLocal: localBlockers.length === 0,
    cameraReadyLocal: ready("camera_capture"),
    uploadReadyLocal: ready("library_upload"),
    editorReadyLocal: ready("editor_workspace"),
    coverReadyLocal: ready("cover_picker"),
    captionsReadyLocal: ready("caption_track"),
    queuedSourceEvents: state.events.length,
    localBlockers,
    providerBlockers: providerBlockers(),
    backendShortsAssetContract: "local_only_not_connected",
    mediaStorageProvider: "not_configured",
    cdnProvider: "not_configured",
    adminMediaReview: "not_connected",
    fakeCameraCaptureAllowed: false,
    fakeUploadAllowed: false,
    fakeProviderAssetAllowed: false,
    fakePublishAllowed: false,
    paymentsAllowedNow: false,
    giftsAllowedNow: false,
    monetizationAllowedNow: false,
  };
}

function rebuild(
  state: StreamShortVideoSourceRuntimeState,
  patch: Partial<Omit<StreamShortVideoSourceRuntimeState, "evidence" | "status" | "updatedAt">>,
): StreamShortVideoSourceRuntimeState {
  const updatedAt = nowIso();
  const nextBase = { ...state, ...patch, updatedAt };
  const selected = selectedSource(nextBase);
  const status: StreamShortVideoSourceStatus = selected ? computeStatus(selected) : "idle_local";
  return {
    ...nextBase,
    status,
    evidence: buildEvidence(nextBase),
  };
}

function mapSelectedSource(
  state: StreamShortVideoSourceRuntimeState,
  mapper: (source: StreamShortVideoSourceRecord) => StreamShortVideoSourceRecord,
): StreamShortVideoSourceRuntimeState {
  if (!state.selectedSourceId) return state;
  const sources = state.sources.map((source) => (source.sourceId === state.selectedSourceId ? mapper(source) : source));
  return rebuild(state, { sources });
}

export function createInitialStreamShortVideoSourceIntentState(): StreamShortVideoSourceRuntimeState {
  const updatedAt = nowIso();
  const sources = sourceSeed.map((seed) => createRecord(seed, updatedAt));
  const base: Omit<StreamShortVideoSourceRuntimeState, "status" | "evidence"> = {
    selectedSourceId: null,
    sources,
    events: [],
    updatedAt,
  };
  return {
    ...base,
    status: "idle_local",
    evidence: buildEvidence(base),
  };
}

export function selectStreamShortVideoSource(
  state: StreamShortVideoSourceRuntimeState,
  sourceId: StreamShortVideoSourceId,
): StreamShortVideoSourceRuntimeState {
  const exists = state.sources.some((source) => source.sourceId === sourceId);
  if (!exists) return state;
  return rebuild(state, { selectedSourceId: sourceId });
}

export function selectStreamShortVideoSourceByDraftIntent(
  state: StreamShortVideoSourceRuntimeState,
  draftIntent: StreamShortVideoSourceIntent,
): StreamShortVideoSourceRuntimeState {
  const source = state.sources.find((item) => item.draftIntent === draftIntent);
  return source ? selectStreamShortVideoSource(state, source.sourceId) : state;
}

export function requestSelectedStreamShortVideoSourcePermission(state: StreamShortVideoSourceRuntimeState): StreamShortVideoSourceRuntimeState {
  return mapSelectedSource(state, (source) => ({ ...source, permissionRequestedLocal: true, status: "permission_requested_local", updatedAt: nowIso() }));
}

export function markSelectedStreamShortVideoSourceAssetIntent(state: StreamShortVideoSourceRuntimeState): StreamShortVideoSourceRuntimeState {
  return mapSelectedSource(state, (source) => ({ ...source, assetIntentReadyLocal: true, status: "asset_intent_ready_local", updatedAt: nowIso() }));
}

export function markSelectedStreamShortVideoSourceCoverIntent(state: StreamShortVideoSourceRuntimeState): StreamShortVideoSourceRuntimeState {
  return mapSelectedSource(state, (source) => ({ ...source, coverIntentReadyLocal: true, status: "asset_intent_ready_local", updatedAt: nowIso() }));
}

export function markSelectedStreamShortVideoSourceCaptionIntent(state: StreamShortVideoSourceRuntimeState): StreamShortVideoSourceRuntimeState {
  return mapSelectedSource(state, (source) => ({ ...source, captionIntentReadyLocal: true, status: "asset_intent_ready_local", updatedAt: nowIso() }));
}

export function acknowledgeSelectedStreamShortVideoSourcePolicy(state: StreamShortVideoSourceRuntimeState): StreamShortVideoSourceRuntimeState {
  return mapSelectedSource(state, (source) => ({ ...source, policyReviewedLocal: true, updatedAt: nowIso() }));
}

export function runStreamShortVideoSourceReadinessCheck(state: StreamShortVideoSourceRuntimeState): StreamShortVideoSourceRuntimeState {
  return rebuild(state, {});
}

export function queueStreamShortVideoSourceLocalEvent(
  state: StreamShortVideoSourceRuntimeState,
  kind: StreamShortVideoSourceEventKind = "short_source_reviewed_local",
): StreamShortVideoSourceRuntimeState {
  const selected = selectedSource(state);
  if (!selected) return state;
  const event: StreamShortVideoSourceEvent = {
    eventId: makeId(kind),
    kind,
    sourceId: selected.sourceId,
    draftIntent: selected.draftIntent,
    createdAt: nowIso(),
    deliveredToProvider: false,
    payload: {
      sourceStatus: computeStatus(selected),
      permissionRequestedLocal: selected.permissionRequestedLocal,
      assetIntentReadyLocal: selected.assetIntentReadyLocal || selected.coverIntentReadyLocal || selected.captionIntentReadyLocal,
      localBlockers: sourceLocalBlockers(selected),
      providerBlockers: providerBlockers(),
    },
  };
  return rebuild(state, { events: [event, ...state.events].slice(0, 14) });
}

export function requestStreamShortVideoSourceProviderHandoffBlocked(state: StreamShortVideoSourceRuntimeState): StreamShortVideoSourceRuntimeState {
  const queued = queueStreamShortVideoSourceLocalEvent(state, "short_source_provider_handoff_blocked");
  return mapSelectedSource(queued, (source) => ({ ...source, status: "provider_handoff_blocked", updatedAt: nowIso() }));
}

export function getStreamShortVideoSourceDraftIntent(state: StreamShortVideoSourceRuntimeState): StreamShortVideoSourceIntent | null {
  return selectedSource(state)?.draftIntent ?? null;
}
