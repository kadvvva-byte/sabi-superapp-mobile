import type { StreamShortVideoDraftRuntimeState } from "./streamShortVideoDraftRuntime";
import type { StreamShortVideoTimelineRuntimeState } from "./streamShortVideoEditorTimelineRuntime";
import type { StreamShortVideoSourceRuntimeState } from "./streamShortVideoSourceIntentRuntime";
import type { StreamShortVideoReviewRuntimeState } from "./streamShortVideoCoverCaptionReviewRuntime";
import type { StreamShortVideoPublishReadinessRuntimeState } from "./streamShortVideoPublishReadinessRuntime";
import type { StreamShortVideoFeedDraftRuntimeState } from "./streamShortVideoFeedDraftListRuntime";
import type { StreamShortVideoPlaybackControlsRuntimeState } from "./streamShortVideoPlaybackControlsRuntime";
import type { StreamShortVideoEngagementRuntimeState } from "./streamShortVideoEngagementRuntime";

export type StreamShortVideoFeedAcceptanceCheckId =
  | "draft_metadata"
  | "source_intent"
  | "timeline_editor"
  | "cover_captions_review"
  | "publish_readiness_gate"
  | "feed_draft_list"
  | "playback_shell"
  | "engagement_states"
  | "local_event_evidence"
  | "provider_admin_handoff";

export type StreamShortVideoFeedAcceptanceStatus =
  | "pending_local"
  | "reviewed_local"
  | "ready_local"
  | "blocked_local"
  | "provider_blocked";

export type StreamShortVideoFeedAcceptanceBlockerCode =
  | "draft_metadata_required"
  | "source_intent_required"
  | "source_asset_required"
  | "timeline_editor_required"
  | "cover_caption_review_required"
  | "publish_readiness_required"
  | "feed_draft_required"
  | "feed_draft_local_blocked"
  | "playback_shell_required"
  | "engagement_state_required"
  | "local_event_evidence_required"
  | "backend_shorts_feed_contract_required"
  | "backend_playback_session_required"
  | "backend_engagement_contract_required"
  | "media_storage_cdn_required"
  | "admin_shorts_acceptance_required";

export type StreamShortVideoFeedAcceptanceCheck = {
  readonly id: StreamShortVideoFeedAcceptanceCheckId;
  readonly title: string;
  readonly purpose: string;
  readonly status: StreamShortVideoFeedAcceptanceStatus;
  readonly reviewedLocal: boolean;
  readonly localBlockers: readonly StreamShortVideoFeedAcceptanceBlockerCode[];
  readonly providerBlockers: readonly StreamShortVideoFeedAcceptanceBlockerCode[];
  readonly deliveredToBackend: false;
  readonly updatedAt: string;
};

export type StreamShortVideoFeedAcceptanceEventKind =
  | "short_feed_acceptance_review_local"
  | "short_feed_acceptance_gate_run_local"
  | "short_feed_acceptance_provider_blocked";

export type StreamShortVideoFeedAcceptanceEvent = {
  readonly eventId: string;
  readonly kind: StreamShortVideoFeedAcceptanceEventKind;
  readonly checkId: StreamShortVideoFeedAcceptanceCheckId;
  readonly createdAt: string;
  readonly deliveredToProvider: false;
  readonly payload: {
    readonly status: StreamShortVideoFeedAcceptanceStatus;
    readonly draftId: string;
    readonly title: string;
    readonly selectedDraftId: string | null;
    readonly selectedPlaybackDraftId: string | null;
    readonly localBlockers: readonly StreamShortVideoFeedAcceptanceBlockerCode[];
    readonly providerBlockers: readonly StreamShortVideoFeedAcceptanceBlockerCode[];
    readonly queuedEvidenceEvents: number;
  };
};

export type StreamShortVideoFeedAcceptanceEvidence = {
  readonly selectedCheckId: StreamShortVideoFeedAcceptanceCheckId | null;
  readonly selectedStatus: StreamShortVideoFeedAcceptanceStatus;
  readonly readyLocalChecks: number;
  readonly blockedLocalChecks: number;
  readonly providerBlockedChecks: number;
  readonly reviewedLocalChecks: number;
  readonly queuedAcceptanceEvents: number;
  readonly draftReadyLocal: boolean;
  readonly sourceReadyLocal: boolean;
  readonly timelineReadyLocal: boolean;
  readonly coverCaptionsReviewedLocal: boolean;
  readonly publishGateReadyLocal: boolean;
  readonly feedDraftListReadyLocal: boolean;
  readonly playbackShellReadyLocal: boolean;
  readonly engagementReadyLocal: boolean;
  readonly localEventEvidenceReady: boolean;
  readonly shortsFeedAcceptanceReadyLocal: boolean;
  readonly localBlockers: readonly StreamShortVideoFeedAcceptanceBlockerCode[];
  readonly providerBlockers: readonly StreamShortVideoFeedAcceptanceBlockerCode[];
  readonly backendShortsFeedContract: "not_connected";
  readonly backendPlaybackSessionContract: "not_connected";
  readonly backendEngagementContract: "not_connected";
  readonly mediaStorageCdnProvider: "not_configured";
  readonly adminShortsAcceptanceReview: "not_connected";
  readonly fakeFeedAcceptanceAllowed: false;
  readonly fakePlaybackAllowed: false;
  readonly fakeEngagementAllowed: false;
  readonly fakePublishAllowed: false;
  readonly paymentsAllowedNow: false;
  readonly giftsAllowedNow: false;
  readonly monetizationAllowedNow: false;
  readonly walletBridgeRequiredNow: false;
};

export type StreamShortVideoFeedAcceptanceRuntimeState = {
  readonly status: StreamShortVideoFeedAcceptanceStatus;
  readonly selectedCheckId: StreamShortVideoFeedAcceptanceCheckId | null;
  readonly checks: readonly StreamShortVideoFeedAcceptanceCheck[];
  readonly events: readonly StreamShortVideoFeedAcceptanceEvent[];
  readonly evidence: StreamShortVideoFeedAcceptanceEvidence;
  readonly updatedAt: string;
};

const nowIso = () => new Date().toISOString();
const makeEventId = (kind: StreamShortVideoFeedAcceptanceEventKind, checkId: StreamShortVideoFeedAcceptanceCheckId) => `${kind}-${checkId}-${Date.now()}`;

const providerBlockers = (): readonly StreamShortVideoFeedAcceptanceBlockerCode[] => [
  "backend_shorts_feed_contract_required",
  "backend_playback_session_required",
  "backend_engagement_contract_required",
  "media_storage_cdn_required",
  "admin_shorts_acceptance_required",
];

const checkSeed: readonly Pick<StreamShortVideoFeedAcceptanceCheck, "id" | "title" | "purpose">[] = [
  { id: "draft_metadata", title: "Метаданные черновика", purpose: "Название, категория, подпись и видимость должны быть готовы перед приёмкой ленты." },
  { id: "source_intent", title: "Источник видео", purpose: "Источник камера/загрузка/редактор должен быть подготовлен локально." },
  { id: "timeline_editor", title: "Монтажная линия", purpose: "Клипы, обрезка, обложка и подписи должны быть готовы локально." },
  { id: "cover_captions_review", title: "Проверка обложки/подписей", purpose: "Обложка, подписи, язык, медиа и правила должны быть проверены локально." },
  { id: "publish_readiness_gate", title: "Готовность публикации", purpose: "Локальная готовность публикации должна пройти без имитации публикации." },
  { id: "feed_draft_list", title: "Черновики ленты", purpose: "Текущий черновик должен быть синхронизирован в локальный список шортов." },
  { id: "playback_shell", title: "Плеер", purpose: "Локальный плеер должен быть синхронизирован с выбранным черновиком ленты." },
  { id: "engagement_states", title: "Действия зрителя", purpose: "Локальные состояния просмотр/лайк/сохранение/поделиться/жалоба должны быть синхронизированы." },
  { id: "local_event_evidence", title: "Локальные события", purpose: "События черновика, источника, таймлайна, проверки, ленты, плеера и действий должны существовать перед передачей провайдеру." },
  { id: "provider_admin_handoff", title: "Передача провайдер/админ", purpose: "Для реальной ленты, плеера, действий, хранилища/CDN и админ-проверки всё ещё нужна основа." },
];

function totalLocalEvents(
  draft: StreamShortVideoDraftRuntimeState,
  timeline: StreamShortVideoTimelineRuntimeState,
  source: StreamShortVideoSourceRuntimeState,
  review: StreamShortVideoReviewRuntimeState,
  publish: StreamShortVideoPublishReadinessRuntimeState,
  feed: StreamShortVideoFeedDraftRuntimeState,
  playback: StreamShortVideoPlaybackControlsRuntimeState,
  engagement: StreamShortVideoEngagementRuntimeState,
): number {
  return draft.events.length + timeline.events.length + source.events.length + review.events.length + publish.events.length + feed.events.length + playback.events.length + engagement.events.length;
}

function localBlockersForCheck(
  id: StreamShortVideoFeedAcceptanceCheckId,
  draft: StreamShortVideoDraftRuntimeState,
  timeline: StreamShortVideoTimelineRuntimeState,
  source: StreamShortVideoSourceRuntimeState,
  review: StreamShortVideoReviewRuntimeState,
  publish: StreamShortVideoPublishReadinessRuntimeState,
  feed: StreamShortVideoFeedDraftRuntimeState,
  playback: StreamShortVideoPlaybackControlsRuntimeState,
  engagement: StreamShortVideoEngagementRuntimeState,
): readonly StreamShortVideoFeedAcceptanceBlockerCode[] {
  const blockers: StreamShortVideoFeedAcceptanceBlockerCode[] = [];
  if (id === "draft_metadata" && (!draft.evidence.draftReadyLocal || draft.evidence.localBlockers.length > 0)) blockers.push("draft_metadata_required");
  if (id === "source_intent") {
    if (!draft.evidence.sourceIntentReady) blockers.push("source_intent_required");
    if (!source.evidence.selectedReadyLocal) blockers.push("source_asset_required");
  }
  if (id === "timeline_editor" && !timeline.evidence.timelineReadyLocal) blockers.push("timeline_editor_required");
  if (id === "cover_captions_review" && !review.evidence.reviewReadyLocal) blockers.push("cover_caption_review_required");
  if (id === "publish_readiness_gate" && !publish.evidence.publishReadyLocal) blockers.push("publish_readiness_required");
  if (id === "feed_draft_list") {
    if (!feed.selectedDraftId || feed.evidence.draftCount <= 0) blockers.push("feed_draft_required");
    if (feed.evidence.localBlockers.length > 0 || feed.evidence.blockedLocalDrafts > 0) blockers.push("feed_draft_local_blocked");
  }
  if (id === "playback_shell") {
    if (!playback.selectedDraftId || playback.evidence.localBlockers.length > 0) blockers.push("playback_shell_required");
  }
  if (id === "engagement_states") {
    if (!engagement.selectedDraftId || engagement.evidence.localBlockers.length > 0) blockers.push("engagement_state_required");
  }
  if (id === "local_event_evidence" && totalLocalEvents(draft, timeline, source, review, publish, feed, playback, engagement) < 6) blockers.push("local_event_evidence_required");
  return blockers;
}

function statusForCheck(id: StreamShortVideoFeedAcceptanceCheckId, reviewedLocal: boolean, localBlockers: readonly StreamShortVideoFeedAcceptanceBlockerCode[]): StreamShortVideoFeedAcceptanceStatus {
  if (id === "provider_admin_handoff") return "provider_blocked";
  if (localBlockers.length > 0) return "blocked_local";
  return reviewedLocal ? "ready_local" : "reviewed_local";
}

function rebuildChecks(
  checks: readonly StreamShortVideoFeedAcceptanceCheck[],
  draft: StreamShortVideoDraftRuntimeState,
  timeline: StreamShortVideoTimelineRuntimeState,
  source: StreamShortVideoSourceRuntimeState,
  review: StreamShortVideoReviewRuntimeState,
  publish: StreamShortVideoPublishReadinessRuntimeState,
  feed: StreamShortVideoFeedDraftRuntimeState,
  playback: StreamShortVideoPlaybackControlsRuntimeState,
  engagement: StreamShortVideoEngagementRuntimeState,
): readonly StreamShortVideoFeedAcceptanceCheck[] {
  const updatedAt = nowIso();
  return checks.map((check): StreamShortVideoFeedAcceptanceCheck => {
    const localBlockers = localBlockersForCheck(check.id, draft, timeline, source, review, publish, feed, playback, engagement);
    const provider = check.id === "provider_admin_handoff" ? providerBlockers() : [];
    return {
      ...check,
      status: statusForCheck(check.id, check.reviewedLocal, localBlockers),
      localBlockers,
      providerBlockers: provider,
      updatedAt,
    };
  });
}

function buildEvidence(
  state: Pick<StreamShortVideoFeedAcceptanceRuntimeState, "selectedCheckId" | "checks" | "events">,
  draft: StreamShortVideoDraftRuntimeState,
  timeline: StreamShortVideoTimelineRuntimeState,
  source: StreamShortVideoSourceRuntimeState,
  review: StreamShortVideoReviewRuntimeState,
  publish: StreamShortVideoPublishReadinessRuntimeState,
  feed: StreamShortVideoFeedDraftRuntimeState,
  playback: StreamShortVideoPlaybackControlsRuntimeState,
  engagement: StreamShortVideoEngagementRuntimeState,
): StreamShortVideoFeedAcceptanceEvidence {
  const selected = state.checks.find((check) => check.id === state.selectedCheckId) ?? null;
  const localBlockers = Array.from(new Set(state.checks.flatMap((check) => check.localBlockers)));
  const allProviderBlockers = providerBlockers();
  const nonProviderChecks = state.checks.filter((check) => check.id !== "provider_admin_handoff");
  const readyLocalChecks = state.checks.filter((check) => check.status === "ready_local").length;
  const blockedLocalChecks = state.checks.filter((check) => check.status === "blocked_local").length;
  const providerBlockedChecks = state.checks.filter((check) => check.status === "provider_blocked").length;
  const reviewedLocalChecks = state.checks.filter((check) => check.reviewedLocal).length;
  return {
    selectedCheckId: selected?.id ?? null,
    selectedStatus: selected?.status ?? "pending_local",
    readyLocalChecks,
    blockedLocalChecks,
    providerBlockedChecks,
    reviewedLocalChecks,
    queuedAcceptanceEvents: state.events.length,
    draftReadyLocal: draft.evidence.draftReadyLocal && draft.evidence.localBlockers.length === 0,
    sourceReadyLocal: draft.evidence.sourceIntentReady && source.evidence.selectedReadyLocal,
    timelineReadyLocal: timeline.evidence.timelineReadyLocal,
    coverCaptionsReviewedLocal: review.evidence.reviewReadyLocal,
    publishGateReadyLocal: publish.evidence.publishReadyLocal,
    feedDraftListReadyLocal: Boolean(feed.selectedDraftId) && feed.evidence.localBlockers.length === 0,
    playbackShellReadyLocal: Boolean(playback.selectedDraftId) && playback.evidence.localBlockers.length === 0,
    engagementReadyLocal: Boolean(engagement.selectedDraftId) && engagement.evidence.localBlockers.length === 0,
    localEventEvidenceReady: totalLocalEvents(draft, timeline, source, review, publish, feed, playback, engagement) >= 6,
    shortsFeedAcceptanceReadyLocal: blockedLocalChecks === 0 && nonProviderChecks.every((check) => check.reviewedLocal),
    localBlockers,
    providerBlockers: allProviderBlockers,
    backendShortsFeedContract: "not_connected",
    backendPlaybackSessionContract: "not_connected",
    backendEngagementContract: "not_connected",
    mediaStorageCdnProvider: "not_configured",
    adminShortsAcceptanceReview: "not_connected",
    fakeFeedAcceptanceAllowed: false,
    fakePlaybackAllowed: false,
    fakeEngagementAllowed: false,
    fakePublishAllowed: false,
    paymentsAllowedNow: false,
    giftsAllowedNow: false,
    monetizationAllowedNow: false,
    walletBridgeRequiredNow: false,
  };
}

function rebuild(
  state: Pick<StreamShortVideoFeedAcceptanceRuntimeState, "status" | "selectedCheckId" | "checks" | "events">,
  draft: StreamShortVideoDraftRuntimeState,
  timeline: StreamShortVideoTimelineRuntimeState,
  source: StreamShortVideoSourceRuntimeState,
  review: StreamShortVideoReviewRuntimeState,
  publish: StreamShortVideoPublishReadinessRuntimeState,
  feed: StreamShortVideoFeedDraftRuntimeState,
  playback: StreamShortVideoPlaybackControlsRuntimeState,
  engagement: StreamShortVideoEngagementRuntimeState,
): StreamShortVideoFeedAcceptanceRuntimeState {
  const checks = rebuildChecks(state.checks, draft, timeline, source, review, publish, feed, playback, engagement);
  const evidence = buildEvidence({ selectedCheckId: state.selectedCheckId, checks, events: state.events }, draft, timeline, source, review, publish, feed, playback, engagement);
  const status: StreamShortVideoFeedAcceptanceStatus = evidence.shortsFeedAcceptanceReadyLocal ? "ready_local" : evidence.localBlockers.length > 0 ? "blocked_local" : state.status;
  return { ...state, status, checks, evidence, updatedAt: nowIso() };
}

export function createInitialStreamShortVideoFeedAcceptanceState(
  draft: StreamShortVideoDraftRuntimeState,
  timeline: StreamShortVideoTimelineRuntimeState,
  source: StreamShortVideoSourceRuntimeState,
  review: StreamShortVideoReviewRuntimeState,
  publish: StreamShortVideoPublishReadinessRuntimeState,
  feed: StreamShortVideoFeedDraftRuntimeState,
  playback: StreamShortVideoPlaybackControlsRuntimeState,
  engagement: StreamShortVideoEngagementRuntimeState,
): StreamShortVideoFeedAcceptanceRuntimeState {
  const updatedAt = nowIso();
  const checks: readonly StreamShortVideoFeedAcceptanceCheck[] = checkSeed.map((seed): StreamShortVideoFeedAcceptanceCheck => ({
    ...seed,
    status: "pending_local",
    reviewedLocal: false,
    localBlockers: [],
    providerBlockers: seed.id === "provider_admin_handoff" ? providerBlockers() : [],
    deliveredToBackend: false,
    updatedAt,
  }));
  return rebuild({ status: "pending_local", selectedCheckId: null, checks, events: [] }, draft, timeline, source, review, publish, feed, playback, engagement);
}

export function selectStreamShortVideoFeedAcceptanceCheck(state: StreamShortVideoFeedAcceptanceRuntimeState): StreamShortVideoFeedAcceptanceRuntimeState {
  const currentIndex = state.selectedCheckId ? state.checks.findIndex((check) => check.id === state.selectedCheckId) : -1;
  const next = state.checks[(currentIndex + 1) % state.checks.length] ?? state.checks[0];
  return { ...state, selectedCheckId: next.id, evidence: { ...state.evidence, selectedCheckId: next.id, selectedStatus: next.status }, updatedAt: nowIso() };
}

export function reviewSelectedStreamShortVideoFeedAcceptanceCheck(
  state: StreamShortVideoFeedAcceptanceRuntimeState,
  draft: StreamShortVideoDraftRuntimeState,
  timeline: StreamShortVideoTimelineRuntimeState,
  source: StreamShortVideoSourceRuntimeState,
  review: StreamShortVideoReviewRuntimeState,
  publish: StreamShortVideoPublishReadinessRuntimeState,
  feed: StreamShortVideoFeedDraftRuntimeState,
  playback: StreamShortVideoPlaybackControlsRuntimeState,
  engagement: StreamShortVideoEngagementRuntimeState,
): StreamShortVideoFeedAcceptanceRuntimeState {
  if (!state.selectedCheckId) return rebuild(state, draft, timeline, source, review, publish, feed, playback, engagement);
  const checks: readonly StreamShortVideoFeedAcceptanceCheck[] = state.checks.map((check): StreamShortVideoFeedAcceptanceCheck => check.id === state.selectedCheckId ? { ...check, reviewedLocal: true, updatedAt: nowIso() } : check);
  return rebuild({ ...state, checks, status: "reviewed_local" }, draft, timeline, source, review, publish, feed, playback, engagement);
}

export function runStreamShortVideoFeedAcceptanceGate(
  state: StreamShortVideoFeedAcceptanceRuntimeState,
  draft: StreamShortVideoDraftRuntimeState,
  timeline: StreamShortVideoTimelineRuntimeState,
  source: StreamShortVideoSourceRuntimeState,
  review: StreamShortVideoReviewRuntimeState,
  publish: StreamShortVideoPublishReadinessRuntimeState,
  feed: StreamShortVideoFeedDraftRuntimeState,
  playback: StreamShortVideoPlaybackControlsRuntimeState,
  engagement: StreamShortVideoEngagementRuntimeState,
): StreamShortVideoFeedAcceptanceRuntimeState {
  return rebuild({ ...state, status: "reviewed_local" }, draft, timeline, source, review, publish, feed, playback, engagement);
}

export function queueStreamShortVideoFeedAcceptanceEvent(
  state: StreamShortVideoFeedAcceptanceRuntimeState,
  draft: StreamShortVideoDraftRuntimeState,
  feed?: StreamShortVideoFeedDraftRuntimeState,
  playback?: StreamShortVideoPlaybackControlsRuntimeState,
): StreamShortVideoFeedAcceptanceRuntimeState {
  const selected = state.checks.find((check) => check.id === state.selectedCheckId) ?? null;
  if (!selected) return state;
  const event: StreamShortVideoFeedAcceptanceEvent = {
    eventId: makeEventId("short_feed_acceptance_review_local", selected.id),
    kind: "short_feed_acceptance_review_local",
    checkId: selected.id,
    createdAt: nowIso(),
    deliveredToProvider: false,
    payload: {
      status: selected.status,
      draftId: draft.draft.draftId,
      title: draft.draft.title.trim() || "Локальный шорт без названия",
      selectedDraftId: feed?.selectedDraftId ?? null,
      selectedPlaybackDraftId: playback?.selectedDraftId ?? null,
      localBlockers: selected.localBlockers,
      providerBlockers: state.evidence.providerBlockers,
      queuedEvidenceEvents: state.events.length + 1,
    },
  };
  return { ...state, events: [...state.events, event], updatedAt: nowIso(), evidence: { ...state.evidence, queuedAcceptanceEvents: state.events.length + 1 } };
}

export function requestStreamShortVideoFeedAcceptanceProviderBlocked(state: StreamShortVideoFeedAcceptanceRuntimeState): StreamShortVideoFeedAcceptanceRuntimeState {
  const checks: readonly StreamShortVideoFeedAcceptanceCheck[] = state.checks.map((check): StreamShortVideoFeedAcceptanceCheck => check.id === "provider_admin_handoff" ? { ...check, status: "provider_blocked", providerBlockers: providerBlockers(), reviewedLocal: true, updatedAt: nowIso() } : check);
  const event: StreamShortVideoFeedAcceptanceEvent = {
    eventId: makeEventId("short_feed_acceptance_provider_blocked", "provider_admin_handoff"),
    kind: "short_feed_acceptance_provider_blocked",
    checkId: "provider_admin_handoff",
    createdAt: nowIso(),
    deliveredToProvider: false,
    payload: {
      status: "provider_blocked",
      draftId: "local_short_draft",
      title: "Передача шортов провайдер/админ закрыта",
      selectedDraftId: null,
      selectedPlaybackDraftId: null,
      localBlockers: state.evidence.localBlockers,
      providerBlockers: providerBlockers(),
      queuedEvidenceEvents: state.events.length + 1,
    },
  };
  return { ...state, status: "provider_blocked", selectedCheckId: "provider_admin_handoff", checks, events: [...state.events, event], evidence: { ...state.evidence, selectedCheckId: "provider_admin_handoff", selectedStatus: "provider_blocked", providerBlockedChecks: checks.filter((check) => check.status === "provider_blocked").length, queuedAcceptanceEvents: state.events.length + 1 }, updatedAt: nowIso() };
}
