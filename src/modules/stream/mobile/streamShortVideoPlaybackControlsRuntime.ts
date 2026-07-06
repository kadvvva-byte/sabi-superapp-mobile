import type { StreamShortVideoFeedDraftRecord, StreamShortVideoFeedDraftRuntimeState } from "./streamShortVideoFeedDraftListRuntime";

export type StreamShortVideoPlaybackControlStatus =
  | "idle_local"
  | "ready_local"
  | "playing_local"
  | "paused_local"
  | "seeking_local"
  | "ended_local"
  | "blocked_local"
  | "provider_playback_blocked";

export type StreamShortVideoPlaybackQualityPreset = "auto_local" | "low_data_local" | "balanced_local" | "hd_local";
export type StreamShortVideoPlaybackSpeed = 0.5 | 1 | 1.5 | 2;

export type StreamShortVideoPlaybackControlBlockerCode =
  | "feed_draft_required"
  | "feed_draft_local_blocked"
  | "playback_manifest_required"
  | "cdn_provider_required"
  | "backend_playback_session_required"
  | "admin_playback_review_required";

export type StreamShortVideoPlaybackControlEventKind =
  | "short_playback_controls_synced_local"
  | "short_playback_play_requested_local"
  | "short_playback_pause_requested_local"
  | "short_playback_seek_requested_local"
  | "short_playback_quality_changed_local"
  | "short_playback_provider_blocked";

export type StreamShortVideoPlaybackControlEvent = {
  readonly eventId: string;
  readonly kind: StreamShortVideoPlaybackControlEventKind;
  readonly draftId: string | null;
  readonly createdAt: string;
  readonly deliveredToProvider: false;
  readonly payload: {
    readonly status: StreamShortVideoPlaybackControlStatus;
    readonly positionMsLocal: number;
    readonly durationMsLocal: number;
    readonly qualityPreset: StreamShortVideoPlaybackQualityPreset;
    readonly speed: StreamShortVideoPlaybackSpeed;
    readonly mutedLocal: boolean;
    readonly loopLocal: boolean;
    readonly localBlockers: readonly StreamShortVideoPlaybackControlBlockerCode[];
    readonly providerBlockers: readonly StreamShortVideoPlaybackControlBlockerCode[];
  };
};

export type StreamShortVideoPlaybackControlsEvidence = {
  readonly selectedDraftId: string | null;
  readonly selectedTitle: string;
  readonly status: StreamShortVideoPlaybackControlStatus;
  readonly positionMsLocal: number;
  readonly durationMsLocal: number;
  readonly progressPercentLocal: number;
  readonly qualityPreset: StreamShortVideoPlaybackQualityPreset;
  readonly speed: StreamShortVideoPlaybackSpeed;
  readonly mutedLocal: boolean;
  readonly loopLocal: boolean;
  readonly queuedPlaybackEvents: number;
  readonly localBlockers: readonly StreamShortVideoPlaybackControlBlockerCode[];
  readonly providerBlockers: readonly StreamShortVideoPlaybackControlBlockerCode[];
  readonly backendPlaybackSessionContract: "not_connected";
  readonly playbackManifestProvider: "not_configured";
  readonly cdnProvider: "not_configured";
  readonly adminPlaybackReview: "not_connected";
  readonly fakePlaybackAllowed: false;
  readonly fakeProviderPlaybackAllowed: false;
  readonly fakePublishAllowed: false;
  readonly paymentsAllowedNow: false;
  readonly giftsAllowedNow: false;
  readonly monetizationAllowedNow: false;
  readonly walletBridgeRequiredNow: false;
};

export type StreamShortVideoPlaybackControlsRuntimeState = {
  readonly status: StreamShortVideoPlaybackControlStatus;
  readonly selectedDraftId: string | null;
  readonly selectedTitle: string;
  readonly positionMsLocal: number;
  readonly durationMsLocal: number;
  readonly qualityPreset: StreamShortVideoPlaybackQualityPreset;
  readonly speed: StreamShortVideoPlaybackSpeed;
  readonly mutedLocal: boolean;
  readonly loopLocal: boolean;
  readonly events: readonly StreamShortVideoPlaybackControlEvent[];
  readonly evidence: StreamShortVideoPlaybackControlsEvidence;
  readonly updatedAt: string;
};

const nowIso = () => new Date().toISOString();
const makeEventId = (kind: StreamShortVideoPlaybackControlEventKind, draftId: string | null) => `${kind}-${draftId ?? "none"}-${Date.now()}`;

function providerBlockers(): readonly StreamShortVideoPlaybackControlBlockerCode[] {
  return ["playback_manifest_required", "cdn_provider_required", "backend_playback_session_required", "admin_playback_review_required"];
}

function selectedDraft(feed: StreamShortVideoFeedDraftRuntimeState): StreamShortVideoFeedDraftRecord | null {
  return feed.selectedDraftId ? feed.drafts.find((draft) => draft.draftId === feed.selectedDraftId) ?? null : null;
}

function localBlockersForDraft(draft: StreamShortVideoFeedDraftRecord | null): readonly StreamShortVideoPlaybackControlBlockerCode[] {
  if (!draft) return ["feed_draft_required"];
  return draft.localBlockers.length > 0 ? ["feed_draft_local_blocked"] : [];
}

function clampPosition(positionMsLocal: number, durationMsLocal: number): number {
  if (!Number.isFinite(positionMsLocal) || positionMsLocal < 0) return 0;
  if (!Number.isFinite(durationMsLocal) || durationMsLocal <= 0) return 0;
  return Math.min(Math.max(0, Math.round(positionMsLocal)), durationMsLocal);
}

function nextQualityPreset(current: StreamShortVideoPlaybackQualityPreset): StreamShortVideoPlaybackQualityPreset {
  if (current === "auto_local") return "low_data_local";
  if (current === "low_data_local") return "balanced_local";
  if (current === "balanced_local") return "hd_local";
  return "auto_local";
}

function nextSpeed(current: StreamShortVideoPlaybackSpeed): StreamShortVideoPlaybackSpeed {
  if (current === 0.5) return 1;
  if (current === 1) return 1.5;
  if (current === 1.5) return 2;
  return 0.5;
}

function buildEvidence(state: Omit<StreamShortVideoPlaybackControlsRuntimeState, "evidence" | "updatedAt">, localBlockers: readonly StreamShortVideoPlaybackControlBlockerCode[]): StreamShortVideoPlaybackControlsEvidence {
  const durationMsLocal = Math.max(0, state.durationMsLocal);
  const progressPercentLocal = durationMsLocal > 0 ? Math.round((state.positionMsLocal / durationMsLocal) * 100) : 0;
  return {
    selectedDraftId: state.selectedDraftId,
    selectedTitle: state.selectedTitle,
    status: state.status,
    positionMsLocal: state.positionMsLocal,
    durationMsLocal,
    progressPercentLocal,
    qualityPreset: state.qualityPreset,
    speed: state.speed,
    mutedLocal: state.mutedLocal,
    loopLocal: state.loopLocal,
    queuedPlaybackEvents: state.events.length,
    localBlockers,
    providerBlockers: providerBlockers(),
    backendPlaybackSessionContract: "not_connected",
    playbackManifestProvider: "not_configured",
    cdnProvider: "not_configured",
    adminPlaybackReview: "not_connected",
    fakePlaybackAllowed: false,
    fakeProviderPlaybackAllowed: false,
    fakePublishAllowed: false,
    paymentsAllowedNow: false,
    giftsAllowedNow: false,
    monetizationAllowedNow: false,
    walletBridgeRequiredNow: false,
  };
}

function rebuild(state: Omit<StreamShortVideoPlaybackControlsRuntimeState, "evidence" | "updatedAt">, localBlockers: readonly StreamShortVideoPlaybackControlBlockerCode[] = []): StreamShortVideoPlaybackControlsRuntimeState {
  return {
    ...state,
    positionMsLocal: clampPosition(state.positionMsLocal, state.durationMsLocal),
    evidence: buildEvidence({ ...state, positionMsLocal: clampPosition(state.positionMsLocal, state.durationMsLocal) }, localBlockers),
    updatedAt: nowIso(),
  };
}

export function createInitialStreamShortVideoPlaybackControlsState(feed: StreamShortVideoFeedDraftRuntimeState): StreamShortVideoPlaybackControlsRuntimeState {
  const draft = selectedDraft(feed);
  const localBlockers = localBlockersForDraft(draft);
  const status: StreamShortVideoPlaybackControlStatus = draft && localBlockers.length === 0 ? "ready_local" : "blocked_local";
  return rebuild({
    status,
    selectedDraftId: draft?.draftId ?? null,
    selectedTitle: draft?.title ?? "Локальный шорт не выбран",
    positionMsLocal: 0,
    durationMsLocal: draft?.durationMsLocal ?? 0,
    qualityPreset: "auto_local",
    speed: 1,
    mutedLocal: false,
    loopLocal: false,
    events: [],
  }, localBlockers);
}

export function syncStreamShortVideoPlaybackControlsWithFeed(state: StreamShortVideoPlaybackControlsRuntimeState, feed: StreamShortVideoFeedDraftRuntimeState): StreamShortVideoPlaybackControlsRuntimeState {
  const draft = selectedDraft(feed);
  const localBlockers = localBlockersForDraft(draft);
  const status: StreamShortVideoPlaybackControlStatus = draft && localBlockers.length === 0 ? "ready_local" : "blocked_local";
  return rebuild({
    ...state,
    status,
    selectedDraftId: draft?.draftId ?? null,
    selectedTitle: draft?.title ?? "Локальный шорт не выбран",
    positionMsLocal: 0,
    durationMsLocal: draft?.durationMsLocal ?? 0,
  }, localBlockers);
}

export function playStreamShortVideoPlaybackLocal(state: StreamShortVideoPlaybackControlsRuntimeState): StreamShortVideoPlaybackControlsRuntimeState {
  if (state.evidence.localBlockers.length > 0 || !state.selectedDraftId) return rebuild({ ...state, status: "blocked_local" }, state.evidence.localBlockers);
  return rebuild({ ...state, status: "playing_local" }, []);
}

export function pauseStreamShortVideoPlaybackLocal(state: StreamShortVideoPlaybackControlsRuntimeState): StreamShortVideoPlaybackControlsRuntimeState {
  return rebuild({ ...state, status: state.status === "playing_local" || state.status === "seeking_local" ? "paused_local" : state.status }, state.evidence.localBlockers);
}

export function stopStreamShortVideoPlaybackLocal(state: StreamShortVideoPlaybackControlsRuntimeState): StreamShortVideoPlaybackControlsRuntimeState {
  return rebuild({ ...state, status: "ended_local", positionMsLocal: 0 }, state.evidence.localBlockers);
}

export function seekStreamShortVideoPlaybackLocal(state: StreamShortVideoPlaybackControlsRuntimeState, direction: "back" | "forward"): StreamShortVideoPlaybackControlsRuntimeState {
  const delta = direction === "forward" ? 3000 : -3000;
  return rebuild({ ...state, status: "seeking_local", positionMsLocal: clampPosition(state.positionMsLocal + delta, state.durationMsLocal) }, state.evidence.localBlockers);
}

export function toggleStreamShortVideoPlaybackMuteLocal(state: StreamShortVideoPlaybackControlsRuntimeState): StreamShortVideoPlaybackControlsRuntimeState {
  return rebuild({ ...state, mutedLocal: !state.mutedLocal }, state.evidence.localBlockers);
}

export function toggleStreamShortVideoPlaybackLoopLocal(state: StreamShortVideoPlaybackControlsRuntimeState): StreamShortVideoPlaybackControlsRuntimeState {
  return rebuild({ ...state, loopLocal: !state.loopLocal }, state.evidence.localBlockers);
}

export function cycleStreamShortVideoPlaybackQualityLocal(state: StreamShortVideoPlaybackControlsRuntimeState): StreamShortVideoPlaybackControlsRuntimeState {
  return rebuild({ ...state, qualityPreset: nextQualityPreset(state.qualityPreset) }, state.evidence.localBlockers);
}

export function cycleStreamShortVideoPlaybackSpeedLocal(state: StreamShortVideoPlaybackControlsRuntimeState): StreamShortVideoPlaybackControlsRuntimeState {
  return rebuild({ ...state, speed: nextSpeed(state.speed) }, state.evidence.localBlockers);
}

export function queueStreamShortVideoPlaybackControlsEvent(state: StreamShortVideoPlaybackControlsRuntimeState, kind: StreamShortVideoPlaybackControlEventKind = "short_playback_controls_synced_local"): StreamShortVideoPlaybackControlsRuntimeState {
  const event: StreamShortVideoPlaybackControlEvent = {
    eventId: makeEventId(kind, state.selectedDraftId),
    kind,
    draftId: state.selectedDraftId,
    createdAt: nowIso(),
    deliveredToProvider: false,
    payload: {
      status: state.status,
      positionMsLocal: state.positionMsLocal,
      durationMsLocal: state.durationMsLocal,
      qualityPreset: state.qualityPreset,
      speed: state.speed,
      mutedLocal: state.mutedLocal,
      loopLocal: state.loopLocal,
      localBlockers: state.evidence.localBlockers,
      providerBlockers: state.evidence.providerBlockers,
    },
  };
  return rebuild({ ...state, events: [event, ...state.events].slice(0, 12) }, state.evidence.localBlockers);
}

export function requestStreamShortVideoPlaybackProviderBlocked(state: StreamShortVideoPlaybackControlsRuntimeState): StreamShortVideoPlaybackControlsRuntimeState {
  const queued = queueStreamShortVideoPlaybackControlsEvent(state, "short_playback_provider_blocked");
  return rebuild({ ...queued, status: "provider_playback_blocked" }, queued.evidence.localBlockers);
}
