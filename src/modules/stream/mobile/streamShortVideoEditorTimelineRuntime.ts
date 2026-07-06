import type { StreamShortVideoDraftEventKind } from "./streamShortVideoDraftRuntime";

export type StreamShortVideoTimelineClipKind =
  | "camera_segment"
  | "uploaded_segment"
  | "text_overlay"
  | "caption_track"
  | "cover_frame"
  | "audio_note";

export type StreamShortVideoTimelineClipStatus =
  | "draft_local"
  | "trim_ready_local"
  | "split_ready_local"
  | "ordered_local"
  | "reviewed_local"
  | "provider_required";

export type StreamShortVideoTimelineStatus =
  | "empty_local"
  | "drafting_local"
  | "timeline_ready_local"
  | "provider_handoff_blocked";

export type StreamShortVideoTimelineBlockerCode =
  | "clip_required"
  | "trim_required"
  | "cover_frame_required"
  | "caption_track_required"
  | "timeline_policy_review_required"
  | "media_storage_provider_required"
  | "cdn_provider_required"
  | "backend_timeline_contract_required"
  | "admin_editor_review_required";

export type StreamShortVideoTimelineClip = {
  readonly clipId: string;
  readonly kind: StreamShortVideoTimelineClipKind;
  readonly label: string;
  readonly order: number;
  readonly durationMsLocal: number;
  readonly trimStartMsLocal: number;
  readonly trimEndMsLocal: number;
  readonly splitMarkersLocal: readonly number[];
  readonly status: StreamShortVideoTimelineClipStatus;
  readonly providerAssetId: null;
  readonly deliveredToStorage: false;
  readonly updatedAt: string;
};

export type StreamShortVideoTimelineEventKind =
  | "short_timeline_clip_added_local"
  | "short_timeline_clip_trimmed_local"
  | "short_timeline_clip_split_local"
  | "short_timeline_reordered_local"
  | "short_timeline_reviewed_local"
  | "short_timeline_handoff_blocked";

export type StreamShortVideoTimelineEvent = {
  readonly eventId: string;
  readonly kind: StreamShortVideoTimelineEventKind;
  readonly draftId: string;
  readonly selectedClipId: string | null;
  readonly createdAt: string;
  readonly deliveredToProvider: false;
  readonly payload: {
    readonly clipCount: number;
    readonly selectedClipKind: StreamShortVideoTimelineClipKind | null;
    readonly localBlockers: readonly StreamShortVideoTimelineBlockerCode[];
    readonly providerBlockers: readonly StreamShortVideoTimelineBlockerCode[];
  };
};

export type StreamShortVideoTimelineEvidence = {
  readonly clipCount: number;
  readonly selectedClipId: string | null;
  readonly totalDurationMsLocal: number;
  readonly timelineReadyLocal: boolean;
  readonly trimReadyLocal: boolean;
  readonly coverReadyLocal: boolean;
  readonly captionsReadyLocal: boolean;
  readonly policyReviewReadyLocal: boolean;
  readonly queuedTimelineEvents: number;
  readonly localBlockers: readonly StreamShortVideoTimelineBlockerCode[];
  readonly providerBlockers: readonly StreamShortVideoTimelineBlockerCode[];
  readonly backendTimelineContract: "local_only_not_connected";
  readonly mediaStorageProvider: "not_configured";
  readonly cdnProvider: "not_configured";
  readonly adminEditorReview: "not_connected";
  readonly fakeTrimAllowed: false;
  readonly fakeUploadAllowed: false;
  readonly fakePublishAllowed: false;
  readonly paymentsAllowedNow: false;
  readonly giftsAllowedNow: false;
  readonly monetizationAllowedNow: false;
};

export type StreamShortVideoTimelineRuntimeState = {
  readonly status: StreamShortVideoTimelineStatus;
  readonly draftId: string;
  readonly selectedClipId: string | null;
  readonly clips: readonly StreamShortVideoTimelineClip[];
  readonly coverClipId: string | null;
  readonly captionTrackReady: boolean;
  readonly policyReviewReady: boolean;
  readonly events: readonly StreamShortVideoTimelineEvent[];
  readonly evidence: StreamShortVideoTimelineEvidence;
  readonly updatedAt: string;
};

const nowIso = () => new Date().toISOString();
const makeId = (prefix: string) => `${prefix}-${Date.now()}-${Math.round(Math.random() * 10000)}`;

const defaultDurationByKind: Record<StreamShortVideoTimelineClipKind, number> = {
  camera_segment: 7000,
  uploaded_segment: 9000,
  text_overlay: 3000,
  caption_track: 3000,
  cover_frame: 1500,
  audio_note: 4000,
};

const labelByKind: Record<StreamShortVideoTimelineClipKind, string> = {
  camera_segment: "Клип камеры",
  uploaded_segment: "Загруженный клип",
  text_overlay: "Текстовый слой",
  caption_track: "Субтитры",
  cover_frame: "Кадр обложки",
  audio_note: "Аудиозаметка",
};

function providerBlockers(): readonly StreamShortVideoTimelineBlockerCode[] {
  return [
    "media_storage_provider_required",
    "cdn_provider_required",
    "backend_timeline_contract_required",
    "admin_editor_review_required",
  ];
}

function localBlockers(state: Pick<StreamShortVideoTimelineRuntimeState, "clips" | "coverClipId" | "captionTrackReady" | "policyReviewReady">): readonly StreamShortVideoTimelineBlockerCode[] {
  const blockers: StreamShortVideoTimelineBlockerCode[] = [];
  if (state.clips.length === 0) blockers.push("clip_required");
  if (state.clips.some((clip) => clip.status === "draft_local")) blockers.push("trim_required");
  if (!state.coverClipId) blockers.push("cover_frame_required");
  if (!state.captionTrackReady) blockers.push("caption_track_required");
  if (!state.policyReviewReady) blockers.push("timeline_policy_review_required");
  return blockers;
}

function computeStatus(state: Pick<StreamShortVideoTimelineRuntimeState, "clips" | "coverClipId" | "captionTrackReady" | "policyReviewReady">): StreamShortVideoTimelineStatus {
  if (state.clips.length === 0) return "empty_local";
  return localBlockers(state).length === 0 ? "timeline_ready_local" : "drafting_local";
}

function buildEvidence(state: Pick<StreamShortVideoTimelineRuntimeState, "clips" | "selectedClipId" | "coverClipId" | "captionTrackReady" | "policyReviewReady" | "events">): StreamShortVideoTimelineEvidence {
  const local = localBlockers(state);
  const totalDurationMsLocal = state.clips.reduce((sum, clip) => sum + Math.max(0, clip.trimEndMsLocal - clip.trimStartMsLocal), 0);
  return {
    clipCount: state.clips.length,
    selectedClipId: state.selectedClipId,
    totalDurationMsLocal,
    timelineReadyLocal: local.length === 0,
    trimReadyLocal: state.clips.length > 0 && !state.clips.some((clip) => clip.status === "draft_local"),
    coverReadyLocal: Boolean(state.coverClipId),
    captionsReadyLocal: state.captionTrackReady,
    policyReviewReadyLocal: state.policyReviewReady,
    queuedTimelineEvents: state.events.length,
    localBlockers: local,
    providerBlockers: providerBlockers(),
    backendTimelineContract: "local_only_not_connected",
    mediaStorageProvider: "not_configured",
    cdnProvider: "not_configured",
    adminEditorReview: "not_connected",
    fakeTrimAllowed: false,
    fakeUploadAllowed: false,
    fakePublishAllowed: false,
    paymentsAllowedNow: false,
    giftsAllowedNow: false,
    monetizationAllowedNow: false,
  };
}

function rebuild(state: StreamShortVideoTimelineRuntimeState, patch: Partial<Omit<StreamShortVideoTimelineRuntimeState, "evidence" | "status" | "updatedAt">>): StreamShortVideoTimelineRuntimeState {
  const nextBase = { ...state, ...patch, updatedAt: nowIso() };
  return {
    ...nextBase,
    status: computeStatus(nextBase),
    evidence: buildEvidence(nextBase),
  };
}

export function createInitialStreamShortVideoTimelineState(draftId = "short-draft-local-001"): StreamShortVideoTimelineRuntimeState {
  const updatedAt = nowIso();
  const base: Omit<StreamShortVideoTimelineRuntimeState, "evidence"> = {
    status: "empty_local",
    draftId,
    selectedClipId: null,
    clips: [],
    coverClipId: null,
    captionTrackReady: false,
    policyReviewReady: false,
    events: [],
    updatedAt,
  };
  return { ...base, evidence: buildEvidence(base) };
}

export function addStreamShortVideoTimelineClip(
  state: StreamShortVideoTimelineRuntimeState,
  kind: StreamShortVideoTimelineClipKind,
): StreamShortVideoTimelineRuntimeState {
  const updatedAt = nowIso();
  const clip: StreamShortVideoTimelineClip = {
    clipId: makeId(`short-clip-${kind}`),
    kind,
    label: labelByKind[kind],
    order: state.clips.length + 1,
    durationMsLocal: defaultDurationByKind[kind],
    trimStartMsLocal: 0,
    trimEndMsLocal: defaultDurationByKind[kind],
    splitMarkersLocal: [],
    status: "draft_local",
    providerAssetId: null,
    deliveredToStorage: false,
    updatedAt,
  };
  return rebuild(state, { clips: [...state.clips, clip], selectedClipId: null });
}

export function selectStreamShortVideoTimelineClip(state: StreamShortVideoTimelineRuntimeState, clipId: string): StreamShortVideoTimelineRuntimeState {
  return rebuild(state, { selectedClipId: clipId });
}

function mapSelectedClip(
  state: StreamShortVideoTimelineRuntimeState,
  mapper: (clip: StreamShortVideoTimelineClip) => StreamShortVideoTimelineClip,
): StreamShortVideoTimelineRuntimeState {
  if (!state.selectedClipId) return state;
  const clips = state.clips.map((clip) => (clip.clipId === state.selectedClipId ? mapper(clip) : clip));
  return rebuild(state, { clips });
}

export function trimSelectedStreamShortVideoTimelineClip(state: StreamShortVideoTimelineRuntimeState): StreamShortVideoTimelineRuntimeState {
  return mapSelectedClip(state, (clip) => {
    const trimEndMsLocal = Math.max(1000, clip.durationMsLocal - 500);
    return { ...clip, trimStartMsLocal: 250, trimEndMsLocal, status: "trim_ready_local", updatedAt: nowIso() };
  });
}

export function splitSelectedStreamShortVideoTimelineClip(state: StreamShortVideoTimelineRuntimeState): StreamShortVideoTimelineRuntimeState {
  return mapSelectedClip(state, (clip) => {
    const middle = Math.round((clip.trimStartMsLocal + clip.trimEndMsLocal) / 2);
    const splitMarkersLocal = Array.from(new Set([...clip.splitMarkersLocal, middle])).sort((a, b) => a - b);
    return { ...clip, splitMarkersLocal, status: "split_ready_local", updatedAt: nowIso() };
  });
}

export function moveSelectedStreamShortVideoTimelineClip(state: StreamShortVideoTimelineRuntimeState, direction: "up" | "down"): StreamShortVideoTimelineRuntimeState {
  if (!state.selectedClipId) return state;
  const index = state.clips.findIndex((clip) => clip.clipId === state.selectedClipId);
  if (index < 0) return state;
  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= state.clips.length) return state;
  const clips = [...state.clips];
  const [selected] = clips.splice(index, 1);
  clips.splice(targetIndex, 0, selected);
  const reordered = clips.map((clip, orderIndex) => ({ ...clip, order: orderIndex + 1, status: clip.status === "draft_local" ? "ordered_local" : clip.status, updatedAt: nowIso() }));
  return rebuild(state, { clips: reordered });
}

export function markSelectedStreamShortVideoTimelineClipAsCover(state: StreamShortVideoTimelineRuntimeState): StreamShortVideoTimelineRuntimeState {
  if (!state.selectedClipId) return state;
  return rebuild(state, { coverClipId: state.selectedClipId });
}

export function markStreamShortVideoTimelineCaptionsReady(state: StreamShortVideoTimelineRuntimeState): StreamShortVideoTimelineRuntimeState {
  return rebuild(state, { captionTrackReady: true });
}

export function acknowledgeStreamShortVideoTimelinePolicyReview(state: StreamShortVideoTimelineRuntimeState): StreamShortVideoTimelineRuntimeState {
  return rebuild(state, { policyReviewReady: true });
}

export function runStreamShortVideoTimelineReadinessCheck(state: StreamShortVideoTimelineRuntimeState): StreamShortVideoTimelineRuntimeState {
  return rebuild(state, {});
}

export function queueStreamShortVideoTimelineLocalEvent(
  state: StreamShortVideoTimelineRuntimeState,
  kind: StreamShortVideoTimelineEventKind = "short_timeline_reviewed_local",
): StreamShortVideoTimelineRuntimeState {
  const selectedClip = state.clips.find((clip) => clip.clipId === state.selectedClipId) ?? null;
  const event: StreamShortVideoTimelineEvent = {
    eventId: makeId(kind),
    kind,
    draftId: state.draftId,
    selectedClipId: state.selectedClipId,
    createdAt: nowIso(),
    deliveredToProvider: false,
    payload: {
      clipCount: state.clips.length,
      selectedClipKind: selectedClip?.kind ?? null,
      localBlockers: state.evidence.localBlockers,
      providerBlockers: state.evidence.providerBlockers,
    },
  };
  return rebuild(state, { events: [event, ...state.events].slice(0, 16) });
}

export function requestStreamShortVideoTimelineProviderHandoffBlocked(state: StreamShortVideoTimelineRuntimeState): StreamShortVideoTimelineRuntimeState {
  const queued = queueStreamShortVideoTimelineLocalEvent(state, "short_timeline_handoff_blocked");
  return { ...queued, status: "provider_handoff_blocked", evidence: buildEvidence(queued) };
}

export const STREAM_SHORT_VIDEO_TIMELINE_DRAFT_EVENT_KIND: StreamShortVideoDraftEventKind = "short_editor_check_local";
