import type { StreamShortVideoFeedDraftRecord, StreamShortVideoFeedDraftRuntimeState } from "./streamShortVideoFeedDraftListRuntime";
import type { StreamShortVideoPlaybackControlsRuntimeState } from "./streamShortVideoPlaybackControlsRuntime";

export type StreamShortVideoEngagementStatus =
  | "idle_local"
  | "ready_local"
  | "viewing_local"
  | "liked_local"
  | "saved_local"
  | "share_draft_local"
  | "reported_local"
  | "blocked_local"
  | "provider_engagement_blocked";

export type StreamShortVideoEngagementBlockerCode =
  | "feed_draft_required"
  | "feed_draft_local_blocked"
  | "playback_ready_required"
  | "shorts_engagement_backend_required"
  | "realtime_engagement_provider_required"
  | "analytics_provider_required"
  | "admin_report_review_required";

export type StreamShortVideoEngagementEventKind =
  | "short_engagement_synced_local"
  | "short_view_progress_local"
  | "short_like_toggled_local"
  | "short_save_toggled_local"
  | "short_share_draft_prepared_local"
  | "short_report_draft_created_local"
  | "short_engagement_provider_blocked";

export type StreamShortVideoEngagementEvent = {
  readonly eventId: string;
  readonly kind: StreamShortVideoEngagementEventKind;
  readonly draftId: string | null;
  readonly createdAt: string;
  readonly deliveredToProvider: false;
  readonly payload: {
    readonly status: StreamShortVideoEngagementStatus;
    readonly viewProgressPercentLocal: number;
    readonly viewCompleteLocal: boolean;
    readonly likedLocal: boolean;
    readonly savedLocal: boolean;
    readonly shareDraftPrepared: boolean;
    readonly reportDraftPrepared: boolean;
    readonly reportReason: string;
    readonly localBlockers: readonly StreamShortVideoEngagementBlockerCode[];
    readonly providerBlockers: readonly StreamShortVideoEngagementBlockerCode[];
  };
};

export type StreamShortVideoEngagementEvidence = {
  readonly selectedDraftId: string | null;
  readonly selectedTitle: string;
  readonly status: StreamShortVideoEngagementStatus;
  readonly viewProgressPercentLocal: number;
  readonly viewCompleteLocal: boolean;
  readonly likedLocal: boolean;
  readonly savedLocal: boolean;
  readonly shareDraftPrepared: boolean;
  readonly reportDraftPrepared: boolean;
  readonly reportReason: string;
  readonly queuedEngagementEvents: number;
  readonly localBlockers: readonly StreamShortVideoEngagementBlockerCode[];
  readonly providerBlockers: readonly StreamShortVideoEngagementBlockerCode[];
  readonly backendShortsEngagementContract: "not_connected";
  readonly realtimeEngagementProvider: "not_configured";
  readonly analyticsProvider: "not_configured";
  readonly adminReportReview: "not_connected";
  readonly fakeLikeAllowed: false;
  readonly fakeViewAllowed: false;
  readonly fakeShareAllowed: false;
  readonly fakeReportDeliveryAllowed: false;
  readonly fakeProviderEngagementAllowed: false;
  readonly fakePublishAllowed: false;
  readonly paymentsAllowedNow: false;
  readonly giftsAllowedNow: false;
  readonly monetizationAllowedNow: false;
  readonly walletBridgeRequiredNow: false;
};

export type StreamShortVideoEngagementRuntimeState = {
  readonly status: StreamShortVideoEngagementStatus;
  readonly selectedDraftId: string | null;
  readonly selectedTitle: string;
  readonly viewProgressPercentLocal: number;
  readonly viewCompleteLocal: boolean;
  readonly likedLocal: boolean;
  readonly savedLocal: boolean;
  readonly shareDraftPrepared: boolean;
  readonly reportDraftPrepared: boolean;
  readonly reportReason: string;
  readonly events: readonly StreamShortVideoEngagementEvent[];
  readonly evidence: StreamShortVideoEngagementEvidence;
  readonly updatedAt: string;
};

const nowIso = () => new Date().toISOString();
const makeEventId = (kind: StreamShortVideoEngagementEventKind, draftId: string | null) => `${kind}-${draftId ?? "none"}-${Date.now()}`;

function providerBlockers(): readonly StreamShortVideoEngagementBlockerCode[] {
  return [
    "shorts_engagement_backend_required",
    "realtime_engagement_provider_required",
    "analytics_provider_required",
    "admin_report_review_required",
  ];
}

function selectedDraft(feed: StreamShortVideoFeedDraftRuntimeState): StreamShortVideoFeedDraftRecord | null {
  return feed.selectedDraftId ? feed.drafts.find((draft) => draft.draftId === feed.selectedDraftId) ?? null : null;
}

function localBlockersFor(draft: StreamShortVideoFeedDraftRecord | null, playback: StreamShortVideoPlaybackControlsRuntimeState): readonly StreamShortVideoEngagementBlockerCode[] {
  const blockers: StreamShortVideoEngagementBlockerCode[] = [];
  if (!draft) {
    blockers.push("feed_draft_required");
    return blockers;
  }
  if (draft.localBlockers.length > 0) blockers.push("feed_draft_local_blocked");
  if (playback.selectedDraftId !== draft.draftId || playback.evidence.localBlockers.length > 0) blockers.push("playback_ready_required");
  return blockers;
}

function clampProgress(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value)));
}

function buildEvidence(state: Omit<StreamShortVideoEngagementRuntimeState, "evidence" | "updatedAt">, localBlockers: readonly StreamShortVideoEngagementBlockerCode[]): StreamShortVideoEngagementEvidence {
  return {
    selectedDraftId: state.selectedDraftId,
    selectedTitle: state.selectedTitle,
    status: state.status,
    viewProgressPercentLocal: clampProgress(state.viewProgressPercentLocal),
    viewCompleteLocal: state.viewCompleteLocal,
    likedLocal: state.likedLocal,
    savedLocal: state.savedLocal,
    shareDraftPrepared: state.shareDraftPrepared,
    reportDraftPrepared: state.reportDraftPrepared,
    reportReason: state.reportReason,
    queuedEngagementEvents: state.events.length,
    localBlockers,
    providerBlockers: providerBlockers(),
    backendShortsEngagementContract: "not_connected",
    realtimeEngagementProvider: "not_configured",
    analyticsProvider: "not_configured",
    adminReportReview: "not_connected",
    fakeLikeAllowed: false,
    fakeViewAllowed: false,
    fakeShareAllowed: false,
    fakeReportDeliveryAllowed: false,
    fakeProviderEngagementAllowed: false,
    fakePublishAllowed: false,
    paymentsAllowedNow: false,
    giftsAllowedNow: false,
    monetizationAllowedNow: false,
    walletBridgeRequiredNow: false,
  };
}

function rebuild(state: Omit<StreamShortVideoEngagementRuntimeState, "evidence" | "updatedAt">, localBlockers: readonly StreamShortVideoEngagementBlockerCode[]): StreamShortVideoEngagementRuntimeState {
  const next = { ...state, viewProgressPercentLocal: clampProgress(state.viewProgressPercentLocal) };
  return {
    ...next,
    evidence: buildEvidence(next, localBlockers),
    updatedAt: nowIso(),
  };
}

export function createInitialStreamShortVideoEngagementState(feed: StreamShortVideoFeedDraftRuntimeState, playback: StreamShortVideoPlaybackControlsRuntimeState): StreamShortVideoEngagementRuntimeState {
  const draft = selectedDraft(feed);
  const localBlockers = localBlockersFor(draft, playback);
  const status: StreamShortVideoEngagementStatus = draft && localBlockers.length === 0 ? "ready_local" : "blocked_local";
  return rebuild({
    status,
    selectedDraftId: draft?.draftId ?? null,
    selectedTitle: draft?.title ?? "Локальный шорт не выбран",
    viewProgressPercentLocal: 0,
    viewCompleteLocal: false,
    likedLocal: false,
    savedLocal: false,
    shareDraftPrepared: false,
    reportDraftPrepared: false,
    reportReason: "",
    events: [],
  }, localBlockers);
}

export function syncStreamShortVideoEngagementWithFeedAndPlayback(
  state: StreamShortVideoEngagementRuntimeState,
  feed: StreamShortVideoFeedDraftRuntimeState,
  playback: StreamShortVideoPlaybackControlsRuntimeState,
): StreamShortVideoEngagementRuntimeState {
  const draft = selectedDraft(feed);
  const localBlockers = localBlockersFor(draft, playback);
  const sameDraft = state.selectedDraftId === (draft?.draftId ?? null);
  const status: StreamShortVideoEngagementStatus = draft && localBlockers.length === 0 ? "ready_local" : "blocked_local";
  return rebuild({
    ...state,
    status,
    selectedDraftId: draft?.draftId ?? null,
    selectedTitle: draft?.title ?? "Локальный шорт не выбран",
    viewProgressPercentLocal: sameDraft ? state.viewProgressPercentLocal : 0,
    viewCompleteLocal: sameDraft ? state.viewCompleteLocal : false,
    likedLocal: sameDraft ? state.likedLocal : false,
    savedLocal: sameDraft ? state.savedLocal : false,
    shareDraftPrepared: sameDraft ? state.shareDraftPrepared : false,
    reportDraftPrepared: sameDraft ? state.reportDraftPrepared : false,
    reportReason: sameDraft ? state.reportReason : "",
  }, localBlockers);
}

export function markStreamShortVideoViewProgressLocal(state: StreamShortVideoEngagementRuntimeState): StreamShortVideoEngagementRuntimeState {
  if (state.evidence.localBlockers.length > 0 || !state.selectedDraftId) return rebuild({ ...state, status: "blocked_local" }, state.evidence.localBlockers);
  const progress = clampProgress(state.viewProgressPercentLocal + 15);
  return rebuild({
    ...state,
    status: "viewing_local",
    viewProgressPercentLocal: progress,
    viewCompleteLocal: progress >= 95,
  }, []);
}

export function toggleStreamShortVideoLikeLocal(state: StreamShortVideoEngagementRuntimeState): StreamShortVideoEngagementRuntimeState {
  if (state.evidence.localBlockers.length > 0 || !state.selectedDraftId) return rebuild({ ...state, status: "blocked_local" }, state.evidence.localBlockers);
  const likedLocal = !state.likedLocal;
  return rebuild({ ...state, likedLocal, status: likedLocal ? "liked_local" : "ready_local" }, []);
}

export function toggleStreamShortVideoSaveLocal(state: StreamShortVideoEngagementRuntimeState): StreamShortVideoEngagementRuntimeState {
  if (state.evidence.localBlockers.length > 0 || !state.selectedDraftId) return rebuild({ ...state, status: "blocked_local" }, state.evidence.localBlockers);
  const savedLocal = !state.savedLocal;
  return rebuild({ ...state, savedLocal, status: savedLocal ? "saved_local" : "ready_local" }, []);
}

export function prepareStreamShortVideoShareDraftLocal(state: StreamShortVideoEngagementRuntimeState): StreamShortVideoEngagementRuntimeState {
  if (state.evidence.localBlockers.length > 0 || !state.selectedDraftId) return rebuild({ ...state, status: "blocked_local" }, state.evidence.localBlockers);
  return rebuild({ ...state, shareDraftPrepared: true, status: "share_draft_local" }, []);
}

export function prepareStreamShortVideoReportDraftLocal(state: StreamShortVideoEngagementRuntimeState, reason = "local_review_required"): StreamShortVideoEngagementRuntimeState {
  if (!state.selectedDraftId) return rebuild({ ...state, status: "blocked_local" }, ["feed_draft_required"]);
  return rebuild({
    ...state,
    reportDraftPrepared: true,
    reportReason: reason.trim() || "local_review_required",
    status: "reported_local",
  }, state.evidence.localBlockers.filter((blocker) => blocker !== "playback_ready_required"));
}

export function queueStreamShortVideoEngagementLocalEvent(state: StreamShortVideoEngagementRuntimeState, kind: StreamShortVideoEngagementEventKind = "short_engagement_synced_local"): StreamShortVideoEngagementRuntimeState {
  const event: StreamShortVideoEngagementEvent = {
    eventId: makeEventId(kind, state.selectedDraftId),
    kind,
    draftId: state.selectedDraftId,
    createdAt: nowIso(),
    deliveredToProvider: false,
    payload: {
      status: state.status,
      viewProgressPercentLocal: state.viewProgressPercentLocal,
      viewCompleteLocal: state.viewCompleteLocal,
      likedLocal: state.likedLocal,
      savedLocal: state.savedLocal,
      shareDraftPrepared: state.shareDraftPrepared,
      reportDraftPrepared: state.reportDraftPrepared,
      reportReason: state.reportReason,
      localBlockers: state.evidence.localBlockers,
      providerBlockers: state.evidence.providerBlockers,
    },
  };
  return rebuild({ ...state, events: [event, ...state.events].slice(0, 12) }, state.evidence.localBlockers);
}

export function requestStreamShortVideoEngagementProviderBlocked(state: StreamShortVideoEngagementRuntimeState): StreamShortVideoEngagementRuntimeState {
  const queued = queueStreamShortVideoEngagementLocalEvent(state, "short_engagement_provider_blocked");
  return rebuild({ ...queued, status: "provider_engagement_blocked" }, queued.evidence.localBlockers);
}
