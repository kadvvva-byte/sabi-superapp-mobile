import type { StreamShortVideoDraftRuntimeState, StreamShortVideoVisibility } from "./streamShortVideoDraftRuntime";
import type { StreamShortVideoTimelineRuntimeState } from "./streamShortVideoEditorTimelineRuntime";
import type { StreamShortVideoSourceRuntimeState } from "./streamShortVideoSourceIntentRuntime";
import type { StreamShortVideoReviewRuntimeState } from "./streamShortVideoCoverCaptionReviewRuntime";
import type { StreamShortVideoPublishReadinessRuntimeState } from "./streamShortVideoPublishReadinessRuntime";

export type StreamShortVideoFeedDraftStatus =
  | "draft_synced_local"
  | "ready_for_local_playback_shell"
  | "playback_shell_active_local"
  | "playback_shell_paused_local"
  | "blocked_local"
  | "provider_feed_blocked";

export type StreamShortVideoPlaybackShellStatus = "idle_local" | "ready_local" | "active_local" | "paused_local" | "stopped_local" | "provider_playback_blocked";

export type StreamShortVideoFeedDraftBlockerCode =
  | "draft_title_required"
  | "draft_category_required"
  | "source_intent_required"
  | "timeline_clip_required"
  | "cover_review_required"
  | "captions_review_required"
  | "publish_gate_required"
  | "selected_draft_required"
  | "feed_backend_contract_required"
  | "playback_manifest_provider_required"
  | "cdn_provider_required"
  | "admin_feed_review_required";

export type StreamShortVideoFeedDraftRecord = {
  readonly draftId: string;
  readonly title: string;
  readonly caption: string;
  readonly category: string;
  readonly tags: readonly string[];
  readonly visibility: StreamShortVideoVisibility;
  readonly sourceIntent: string;
  readonly clipCount: number;
  readonly durationMsLocal: number;
  readonly coverReadyLocal: boolean;
  readonly captionsReadyLocal: boolean;
  readonly publishReadyLocal: boolean;
  readonly status: StreamShortVideoFeedDraftStatus;
  readonly localBlockers: readonly StreamShortVideoFeedDraftBlockerCode[];
  readonly providerBlockers: readonly StreamShortVideoFeedDraftBlockerCode[];
  readonly deliveredToFeedBackend: false;
  readonly published: false;
  readonly updatedAt: string;
};

export type StreamShortVideoFeedDraftEventKind =
  | "short_feed_draft_synced_local"
  | "short_feed_local_playback_shell_requested"
  | "short_feed_local_playback_paused"
  | "short_feed_provider_blocked";

export type StreamShortVideoFeedDraftEvent = {
  readonly eventId: string;
  readonly kind: StreamShortVideoFeedDraftEventKind;
  readonly draftId: string;
  readonly createdAt: string;
  readonly deliveredToProvider: false;
  readonly payload: {
    readonly title: string;
    readonly status: StreamShortVideoFeedDraftStatus;
    readonly playbackShellStatus: StreamShortVideoPlaybackShellStatus;
    readonly clipCount: number;
    readonly durationMsLocal: number;
    readonly localBlockers: readonly StreamShortVideoFeedDraftBlockerCode[];
    readonly providerBlockers: readonly StreamShortVideoFeedDraftBlockerCode[];
  };
};

export type StreamShortVideoFeedDraftEvidence = {
  readonly selectedDraftId: string | null;
  readonly selectedStatus: StreamShortVideoFeedDraftStatus;
  readonly playbackShellStatus: StreamShortVideoPlaybackShellStatus;
  readonly draftCount: number;
  readonly locallyPlayableDrafts: number;
  readonly blockedLocalDrafts: number;
  readonly queuedFeedDraftEvents: number;
  readonly localBlockers: readonly StreamShortVideoFeedDraftBlockerCode[];
  readonly providerBlockers: readonly StreamShortVideoFeedDraftBlockerCode[];
  readonly backendShortsFeedContract: "not_connected";
  readonly playbackManifestProvider: "not_configured";
  readonly cdnProvider: "not_configured";
  readonly adminShortsFeedReview: "not_connected";
  readonly fakeFeedPublishAllowed: false;
  readonly fakePlaybackAllowed: false;
  readonly fakeProviderSuccessAllowed: false;
  readonly paymentsAllowedNow: false;
  readonly giftsAllowedNow: false;
  readonly monetizationAllowedNow: false;
  readonly walletBridgeRequiredNow: false;
};

export type StreamShortVideoFeedDraftRuntimeState = {
  readonly status: StreamShortVideoFeedDraftStatus;
  readonly selectedDraftId: string | null;
  readonly playbackShellStatus: StreamShortVideoPlaybackShellStatus;
  readonly drafts: readonly StreamShortVideoFeedDraftRecord[];
  readonly events: readonly StreamShortVideoFeedDraftEvent[];
  readonly evidence: StreamShortVideoFeedDraftEvidence;
  readonly updatedAt: string;
};

const nowIso = () => new Date().toISOString();
const makeEventId = (kind: StreamShortVideoFeedDraftEventKind, draftId: string) => `${kind}-${draftId}-${Date.now()}`;

function providerBlockers(): readonly StreamShortVideoFeedDraftBlockerCode[] {
  return ["feed_backend_contract_required", "playback_manifest_provider_required", "cdn_provider_required", "admin_feed_review_required"];
}

function localBlockersForSnapshot(
  draft: StreamShortVideoDraftRuntimeState,
  timeline: StreamShortVideoTimelineRuntimeState,
  review: StreamShortVideoReviewRuntimeState,
  publishReadiness: StreamShortVideoPublishReadinessRuntimeState,
): readonly StreamShortVideoFeedDraftBlockerCode[] {
  const blockers: StreamShortVideoFeedDraftBlockerCode[] = [];
  if (!draft.draft.title.trim()) blockers.push("draft_title_required");
  if (!draft.draft.category.trim()) blockers.push("draft_category_required");
  if (!draft.draft.sourceIntent) blockers.push("source_intent_required");
  if (timeline.evidence.clipCount <= 0) blockers.push("timeline_clip_required");
  if (!review.evidence.coverFrameReadyLocal) blockers.push("cover_review_required");
  if (!review.evidence.captionsReadyLocal) blockers.push("captions_review_required");
  if (!publishReadiness.evidence.publishReadyLocal) blockers.push("publish_gate_required");
  return blockers;
}

function makeSnapshot(
  draft: StreamShortVideoDraftRuntimeState,
  timeline: StreamShortVideoTimelineRuntimeState,
  review: StreamShortVideoReviewRuntimeState,
  publishReadiness: StreamShortVideoPublishReadinessRuntimeState,
): StreamShortVideoFeedDraftRecord {
  const localBlockers = localBlockersForSnapshot(draft, timeline, review, publishReadiness);
  const status: StreamShortVideoFeedDraftStatus = localBlockers.length > 0 ? "blocked_local" : "ready_for_local_playback_shell";
  const updatedAt = nowIso();
  return {
    draftId: draft.draft.draftId,
    title: draft.draft.title.trim() || "Локальный шорт без названия",
    caption: draft.draft.caption,
    category: draft.draft.category.trim() || "general",
    tags: draft.draft.tags,
    visibility: draft.draft.visibility,
    sourceIntent: draft.draft.sourceIntent ?? "not_selected",
    clipCount: timeline.evidence.clipCount,
    durationMsLocal: timeline.evidence.totalDurationMsLocal,
    coverReadyLocal: review.evidence.coverFrameReadyLocal,
    captionsReadyLocal: review.evidence.captionsReadyLocal,
    publishReadyLocal: publishReadiness.evidence.publishReadyLocal,
    status,
    localBlockers,
    providerBlockers: providerBlockers(),
    deliveredToFeedBackend: false,
    published: false,
    updatedAt,
  };
}

function selectedDraft(state: Pick<StreamShortVideoFeedDraftRuntimeState, "drafts" | "selectedDraftId">): StreamShortVideoFeedDraftRecord | null {
  return state.selectedDraftId ? state.drafts.find((draft) => draft.draftId === state.selectedDraftId) ?? null : null;
}

function buildEvidence(state: Pick<StreamShortVideoFeedDraftRuntimeState, "selectedDraftId" | "drafts" | "events" | "playbackShellStatus">): StreamShortVideoFeedDraftEvidence {
  const selected = selectedDraft(state);
  const localBlockers: readonly StreamShortVideoFeedDraftBlockerCode[] = selected ? selected.localBlockers : ["selected_draft_required"];
  return {
    selectedDraftId: selected?.draftId ?? null,
    selectedStatus: selected?.status ?? "blocked_local",
    playbackShellStatus: state.playbackShellStatus,
    draftCount: state.drafts.length,
    locallyPlayableDrafts: state.drafts.filter((draft) => draft.localBlockers.length === 0).length,
    blockedLocalDrafts: state.drafts.filter((draft) => draft.localBlockers.length > 0).length,
    queuedFeedDraftEvents: state.events.length,
    localBlockers,
    providerBlockers: providerBlockers(),
    backendShortsFeedContract: "not_connected",
    playbackManifestProvider: "not_configured",
    cdnProvider: "not_configured",
    adminShortsFeedReview: "not_connected",
    fakeFeedPublishAllowed: false,
    fakePlaybackAllowed: false,
    fakeProviderSuccessAllowed: false,
    paymentsAllowedNow: false,
    giftsAllowedNow: false,
    monetizationAllowedNow: false,
    walletBridgeRequiredNow: false,
  };
}

function rebuild(state: Omit<StreamShortVideoFeedDraftRuntimeState, "evidence" | "status" | "updatedAt">): StreamShortVideoFeedDraftRuntimeState {
  const selected = selectedDraft(state);
  const playbackStatus = state.playbackShellStatus;
  const status: StreamShortVideoFeedDraftStatus = playbackStatus === "active_local"
    ? "playback_shell_active_local"
    : playbackStatus === "paused_local"
      ? "playback_shell_paused_local"
      : selected?.status ?? "blocked_local";
  const next: StreamShortVideoFeedDraftRuntimeState = {
    ...state,
    status,
    evidence: buildEvidence(state),
    updatedAt: nowIso(),
  };
  return next;
}

export function createInitialStreamShortVideoFeedDraftListState(
  draft: StreamShortVideoDraftRuntimeState,
  timeline: StreamShortVideoTimelineRuntimeState,
  _source: StreamShortVideoSourceRuntimeState,
  review: StreamShortVideoReviewRuntimeState,
  publishReadiness: StreamShortVideoPublishReadinessRuntimeState,
): StreamShortVideoFeedDraftRuntimeState {
  const snapshot = makeSnapshot(draft, timeline, review, publishReadiness);
  return rebuild({
    selectedDraftId: null,
    playbackShellStatus: "idle_local",
    drafts: [snapshot],
    events: [],
  });
}

export function syncCurrentShortVideoDraftToFeedList(
  state: StreamShortVideoFeedDraftRuntimeState,
  draft: StreamShortVideoDraftRuntimeState,
  timeline: StreamShortVideoTimelineRuntimeState,
  source: StreamShortVideoSourceRuntimeState,
  review: StreamShortVideoReviewRuntimeState,
  publishReadiness: StreamShortVideoPublishReadinessRuntimeState,
): StreamShortVideoFeedDraftRuntimeState {
  void source;
  const snapshot = { ...makeSnapshot(draft, timeline, review, publishReadiness), status: "draft_synced_local" as StreamShortVideoFeedDraftStatus };
  const others = state.drafts.filter((item) => item.draftId !== snapshot.draftId);
  return rebuild({
    ...state,
    selectedDraftId: null,
    playbackShellStatus: "idle_local",
    drafts: [snapshot, ...others].slice(0, 8),
  });
}

export function selectNextShortVideoFeedDraft(state: StreamShortVideoFeedDraftRuntimeState): StreamShortVideoFeedDraftRuntimeState {
  if (state.drafts.length === 0) return state;
  const index = state.selectedDraftId ? state.drafts.findIndex((draft) => draft.draftId === state.selectedDraftId) : -1;
  const next = index < 0 ? state.drafts[0] : state.drafts[(index + 1) % state.drafts.length];
  return rebuild({ ...state, selectedDraftId: next.draftId, playbackShellStatus: "idle_local" });
}

export function selectPreviousShortVideoFeedDraft(state: StreamShortVideoFeedDraftRuntimeState): StreamShortVideoFeedDraftRuntimeState {
  if (state.drafts.length === 0) return state;
  const index = state.selectedDraftId ? state.drafts.findIndex((draft) => draft.draftId === state.selectedDraftId) : -1;
  const next = index < 0 ? state.drafts[0] : state.drafts[(index - 1 + state.drafts.length) % state.drafts.length];
  return rebuild({ ...state, selectedDraftId: next.draftId, playbackShellStatus: "idle_local" });
}

export function requestShortVideoLocalPlaybackShell(state: StreamShortVideoFeedDraftRuntimeState): StreamShortVideoFeedDraftRuntimeState {
  const selected = selectedDraft(state);
  if (!selected || selected.localBlockers.length > 0) {
    return rebuild({ ...state, playbackShellStatus: "idle_local" });
  }
  return rebuild({ ...state, playbackShellStatus: "active_local" });
}

export function pauseShortVideoLocalPlaybackShell(state: StreamShortVideoFeedDraftRuntimeState): StreamShortVideoFeedDraftRuntimeState {
  return rebuild({ ...state, playbackShellStatus: state.playbackShellStatus === "active_local" ? "paused_local" : state.playbackShellStatus });
}

export function stopShortVideoLocalPlaybackShell(state: StreamShortVideoFeedDraftRuntimeState): StreamShortVideoFeedDraftRuntimeState {
  return rebuild({ ...state, playbackShellStatus: "stopped_local" });
}

export function queueShortVideoFeedDraftLocalEvent(state: StreamShortVideoFeedDraftRuntimeState, kind: StreamShortVideoFeedDraftEventKind = "short_feed_draft_synced_local"): StreamShortVideoFeedDraftRuntimeState {
  const selected = selectedDraft(state);
  if (!selected) return state;
  const createdAt = nowIso();
  const event: StreamShortVideoFeedDraftEvent = {
    eventId: makeEventId(kind, selected.draftId),
    kind,
    draftId: selected.draftId,
    createdAt,
    deliveredToProvider: false,
    payload: {
      title: selected.title,
      status: selected.status,
      playbackShellStatus: state.playbackShellStatus,
      clipCount: selected.clipCount,
      durationMsLocal: selected.durationMsLocal,
      localBlockers: selected.localBlockers,
      providerBlockers: selected.providerBlockers,
    },
  };
  return rebuild({ ...state, events: [event, ...state.events].slice(0, 12) });
}

export function runShortVideoFeedDraftListReadinessCheck(state: StreamShortVideoFeedDraftRuntimeState): StreamShortVideoFeedDraftRuntimeState {
  return rebuild({ ...state });
}

export function requestShortVideoFeedProviderBlocked(state: StreamShortVideoFeedDraftRuntimeState): StreamShortVideoFeedDraftRuntimeState {
  const queued = queueShortVideoFeedDraftLocalEvent(state, "short_feed_provider_blocked");
  return rebuild({ ...queued, playbackShellStatus: "provider_playback_blocked" });
}
