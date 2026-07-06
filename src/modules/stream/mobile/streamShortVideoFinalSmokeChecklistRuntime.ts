import type { StreamShortVideoDraftRuntimeState } from "./streamShortVideoDraftRuntime";
import type { StreamShortVideoTimelineRuntimeState } from "./streamShortVideoEditorTimelineRuntime";
import type { StreamShortVideoSourceRuntimeState } from "./streamShortVideoSourceIntentRuntime";
import type { StreamShortVideoReviewRuntimeState } from "./streamShortVideoCoverCaptionReviewRuntime";
import type { StreamShortVideoPublishReadinessRuntimeState } from "./streamShortVideoPublishReadinessRuntime";
import type { StreamShortVideoFeedDraftRuntimeState } from "./streamShortVideoFeedDraftListRuntime";
import type { StreamShortVideoPlaybackControlsRuntimeState } from "./streamShortVideoPlaybackControlsRuntime";
import type { StreamShortVideoEngagementRuntimeState } from "./streamShortVideoEngagementRuntime";
import type { StreamShortVideoFeedAcceptanceRuntimeState } from "./streamShortVideoFeedAcceptanceRuntime";

export type StreamShortVideoFinalSmokeCheckId =
  | "draft_metadata"
  | "source_intent"
  | "timeline_editor"
  | "cover_captions_review"
  | "publish_readiness_gate"
  | "feed_acceptance_gate"
  | "feed_draft_list"
  | "playback_controls"
  | "engagement_states"
  | "local_event_evidence"
  | "profile_setup_handoff"
  | "provider_admin_handoff";

export type StreamShortVideoFinalSmokeStatus =
  | "pending_local"
  | "reviewed_local"
  | "ready_local"
  | "blocked_local"
  | "provider_blocked";

export type StreamShortVideoFinalSmokeBlockerCode =
  | "draft_metadata_required"
  | "source_intent_required"
  | "timeline_editor_required"
  | "cover_caption_review_required"
  | "publish_readiness_required"
  | "feed_acceptance_required"
  | "feed_draft_required"
  | "playback_controls_required"
  | "engagement_state_required"
  | "local_event_evidence_required"
  | "streamer_profile_setup_required_next"
  | "backend_shorts_contract_required"
  | "media_storage_cdn_required"
  | "playback_manifest_required"
  | "analytics_engagement_required"
  | "admin_shorts_review_required";

export type StreamShortVideoFinalSmokeCheck = {
  readonly id: StreamShortVideoFinalSmokeCheckId;
  readonly title: string;
  readonly purpose: string;
  readonly status: StreamShortVideoFinalSmokeStatus;
  readonly reviewedLocal: boolean;
  readonly localBlockers: readonly StreamShortVideoFinalSmokeBlockerCode[];
  readonly providerBlockers: readonly StreamShortVideoFinalSmokeBlockerCode[];
  readonly deliveredToBackend: false;
  readonly updatedAt: string;
};

export type StreamShortVideoFinalSmokeEventKind =
  | "shorts_final_smoke_review_local"
  | "shorts_final_smoke_run_local"
  | "shorts_profile_setup_handoff_reviewed_local"
  | "shorts_final_smoke_provider_blocked";

export type StreamShortVideoFinalSmokeEvent = {
  readonly eventId: string;
  readonly kind: StreamShortVideoFinalSmokeEventKind;
  readonly checkId: StreamShortVideoFinalSmokeCheckId;
  readonly createdAt: string;
  readonly deliveredToProvider: false;
  readonly payload: {
    readonly status: StreamShortVideoFinalSmokeStatus;
    readonly draftId: string;
    readonly title: string;
    readonly selectedDraftId: string | null;
    readonly selectedPlaybackDraftId: string | null;
    readonly readyLocalChecks: number;
    readonly blockedLocalChecks: number;
    readonly providerBlockedChecks: number;
    readonly localBlockers: readonly StreamShortVideoFinalSmokeBlockerCode[];
    readonly providerBlockers: readonly StreamShortVideoFinalSmokeBlockerCode[];
  };
};

export type StreamShortVideoFinalSmokeEvidence = {
  readonly selectedCheckId: StreamShortVideoFinalSmokeCheckId | null;
  readonly selectedStatus: StreamShortVideoFinalSmokeStatus;
  readonly readyLocalChecks: number;
  readonly blockedLocalChecks: number;
  readonly providerBlockedChecks: number;
  readonly reviewedLocalChecks: number;
  readonly queuedSmokeEvents: number;
  readonly draftReadyLocal: boolean;
  readonly sourceReadyLocal: boolean;
  readonly timelineReadyLocal: boolean;
  readonly coverCaptionsReviewedLocal: boolean;
  readonly publishGateReadyLocal: boolean;
  readonly feedAcceptanceReadyLocal: boolean;
  readonly feedDraftReadyLocal: boolean;
  readonly playbackControlsReadyLocal: boolean;
  readonly engagementReadyLocal: boolean;
  readonly localEventEvidenceReady: boolean;
  readonly profileSetupHandoffReviewedLocal: boolean;
  readonly shortsFinalSmokeReadyLocal: boolean;
  readonly localBlockers: readonly StreamShortVideoFinalSmokeBlockerCode[];
  readonly providerBlockers: readonly StreamShortVideoFinalSmokeBlockerCode[];
  readonly backendShortsContract: "not_connected";
  readonly mediaStorageCdnProvider: "not_configured";
  readonly playbackManifestProvider: "not_configured";
  readonly analyticsEngagementProvider: "not_configured";
  readonly adminShortsReview: "not_connected";
  readonly nextPhase: "streamer_profile_setup";
  readonly fakeFinalSmokeAllowed: false;
  readonly fakePublishAllowed: false;
  readonly fakePlaybackAllowed: false;
  readonly fakeEngagementAllowed: false;
  readonly fakeProviderAllowed: false;
  readonly paymentsAllowedNow: false;
  readonly giftsAllowedNow: false;
  readonly monetizationAllowedNow: false;
  readonly walletBridgeRequiredNow: false;
};

export type StreamShortVideoFinalSmokeRuntimeState = {
  readonly status: StreamShortVideoFinalSmokeStatus;
  readonly selectedCheckId: StreamShortVideoFinalSmokeCheckId | null;
  readonly profileSetupHandoffReviewedLocal: boolean;
  readonly checks: readonly StreamShortVideoFinalSmokeCheck[];
  readonly events: readonly StreamShortVideoFinalSmokeEvent[];
  readonly evidence: StreamShortVideoFinalSmokeEvidence;
  readonly updatedAt: string;
};

const nowIso = () => new Date().toISOString();
const makeEventId = (kind: StreamShortVideoFinalSmokeEventKind, checkId: StreamShortVideoFinalSmokeCheckId) => `${kind}-${checkId}-${Date.now()}`;

const providerBlockers = (): readonly StreamShortVideoFinalSmokeBlockerCode[] => [
  "backend_shorts_contract_required",
  "media_storage_cdn_required",
  "playback_manifest_required",
  "analytics_engagement_required",
  "admin_shorts_review_required",
];

const checkSeed: readonly Pick<StreamShortVideoFinalSmokeCheck, "id" | "title" | "purpose">[] = [
  { id: "draft_metadata", title: "Метаданные черновика", purpose: "Название, категория, подпись, видимость и теги должны быть готовы локально." },
  { id: "source_intent", title: "Источник видео", purpose: "Источник камера/загрузка/редактор/обложка/подпись должен быть подготовлен локально." },
  { id: "timeline_editor", title: "Монтажная линия", purpose: "Клипы, обрезка/разделение/порядок, обложка и подписи должны быть готовы локально." },
  { id: "cover_captions_review", title: "Проверка обложки/подписей", purpose: "Обложка, подписи, язык, медиа и правила контента должны быть проверены локально." },
  { id: "publish_readiness_gate", title: "Готовность публикации", purpose: "Локальная готовность публикации должна пройти без имитации публикации." },
  { id: "feed_acceptance_gate", title: "Приёмка ленты", purpose: "Локальная приёмка ленты шортов, плеера и действий должна быть завершена." },
  { id: "feed_draft_list", title: "Черновики ленты", purpose: "Текущий шорт должен быть синхронизирован в локальный список черновиков ленты." },
  { id: "playback_controls", title: "Управление плеером", purpose: "Локальные кнопки плеера должны быть синхронизированы с выбранным черновиком." },
  { id: "engagement_states", title: "Действия зрителя", purpose: "Локальные состояния просмотр/лайк/сохранение/поделиться/жалоба должны быть подготовлены без фейковой активности." },
  { id: "local_event_evidence", title: "Локальные события", purpose: "События черновика, таймлайна, источника, проверки, публикации, ленты, плеера и действий должны существовать." },
  { id: "profile_setup_handoff", title: "Передача профиля", purpose: "Шорт должен быть готов к передаче в настройку стримера/профиля на следующей фазе." },
  { id: "provider_admin_handoff", title: "Передача провайдер/админ", purpose: "Для реальной публикации, ленты, плеера, CDN/хранилища, аналитики и админ-проверки всё ещё нужна основа." },
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
  acceptance: StreamShortVideoFeedAcceptanceRuntimeState,
): number {
  return draft.events.length + timeline.events.length + source.events.length + review.events.length + publish.events.length + feed.events.length + playback.events.length + engagement.events.length + acceptance.events.length;
}

function localBlockersForCheck(
  id: StreamShortVideoFinalSmokeCheckId,
  state: StreamShortVideoFinalSmokeRuntimeState,
  draft: StreamShortVideoDraftRuntimeState,
  timeline: StreamShortVideoTimelineRuntimeState,
  source: StreamShortVideoSourceRuntimeState,
  review: StreamShortVideoReviewRuntimeState,
  publish: StreamShortVideoPublishReadinessRuntimeState,
  feed: StreamShortVideoFeedDraftRuntimeState,
  playback: StreamShortVideoPlaybackControlsRuntimeState,
  engagement: StreamShortVideoEngagementRuntimeState,
  acceptance: StreamShortVideoFeedAcceptanceRuntimeState,
): readonly StreamShortVideoFinalSmokeBlockerCode[] {
  const blockers: StreamShortVideoFinalSmokeBlockerCode[] = [];
  if (id === "draft_metadata" && (!draft.evidence.draftReadyLocal || draft.evidence.localBlockers.length > 0)) blockers.push("draft_metadata_required");
  if (id === "source_intent" && (!draft.evidence.sourceIntentReady || !source.evidence.selectedReadyLocal)) blockers.push("source_intent_required");
  if (id === "timeline_editor" && !timeline.evidence.timelineReadyLocal) blockers.push("timeline_editor_required");
  if (id === "cover_captions_review" && !review.evidence.reviewReadyLocal) blockers.push("cover_caption_review_required");
  if (id === "publish_readiness_gate" && !publish.evidence.publishReadyLocal) blockers.push("publish_readiness_required");
  if (id === "feed_acceptance_gate" && !acceptance.evidence.shortsFeedAcceptanceReadyLocal) blockers.push("feed_acceptance_required");
  if (id === "feed_draft_list" && (!feed.selectedDraftId || feed.evidence.localBlockers.length > 0)) blockers.push("feed_draft_required");
  if (id === "playback_controls" && (!playback.selectedDraftId || playback.evidence.localBlockers.length > 0)) blockers.push("playback_controls_required");
  if (id === "engagement_states" && (!engagement.selectedDraftId || engagement.evidence.localBlockers.length > 0)) blockers.push("engagement_state_required");
  if (id === "local_event_evidence" && totalLocalEvents(draft, timeline, source, review, publish, feed, playback, engagement, acceptance) < 6) blockers.push("local_event_evidence_required");
  if (id === "profile_setup_handoff" && !state.profileSetupHandoffReviewedLocal) blockers.push("streamer_profile_setup_required_next");
  return blockers;
}

function makeChecks(
  state: StreamShortVideoFinalSmokeRuntimeState,
  draft: StreamShortVideoDraftRuntimeState,
  timeline: StreamShortVideoTimelineRuntimeState,
  source: StreamShortVideoSourceRuntimeState,
  review: StreamShortVideoReviewRuntimeState,
  publish: StreamShortVideoPublishReadinessRuntimeState,
  feed: StreamShortVideoFeedDraftRuntimeState,
  playback: StreamShortVideoPlaybackControlsRuntimeState,
  engagement: StreamShortVideoEngagementRuntimeState,
  acceptance: StreamShortVideoFeedAcceptanceRuntimeState,
  updatedAt: string,
): readonly StreamShortVideoFinalSmokeCheck[] {
  return checkSeed.map((seed): StreamShortVideoFinalSmokeCheck => {
    const previous = state.checks.find((check) => check.id === seed.id);
    const localBlockers = localBlockersForCheck(seed.id, state, draft, timeline, source, review, publish, feed, playback, engagement, acceptance);
    const provider = seed.id === "provider_admin_handoff" ? providerBlockers() : [];
    const reviewedLocal = previous?.reviewedLocal ?? false;
    const status: StreamShortVideoFinalSmokeStatus = provider.length > 0
      ? "provider_blocked"
      : localBlockers.length > 0
        ? "blocked_local"
        : reviewedLocal
          ? "ready_local"
          : "reviewed_local";
    return {
      ...seed,
      status,
      reviewedLocal,
      localBlockers,
      providerBlockers: provider,
      deliveredToBackend: false,
      updatedAt,
    };
  });
}

function makeEvidence(state: StreamShortVideoFinalSmokeRuntimeState): StreamShortVideoFinalSmokeEvidence {
  const selected = state.checks.find((check) => check.id === state.selectedCheckId) ?? null;
  const localBlockers = state.checks.flatMap((check) => check.localBlockers);
  const provider = providerBlockers();
  const readyLocalChecks = state.checks.filter((check) => check.status === "ready_local").length;
  const blockedLocalChecks = state.checks.filter((check) => check.status === "blocked_local").length;
  const providerBlockedChecks = state.checks.filter((check) => check.status === "provider_blocked").length;
  const reviewedLocalChecks = state.checks.filter((check) => check.reviewedLocal).length;
  const hasLocalBlocking = localBlockers.length > 0;
  return {
    selectedCheckId: selected?.id ?? null,
    selectedStatus: selected?.status ?? "pending_local",
    readyLocalChecks,
    blockedLocalChecks,
    providerBlockedChecks,
    reviewedLocalChecks,
    queuedSmokeEvents: state.events.length,
    draftReadyLocal: !state.checks.find((check) => check.id === "draft_metadata")?.localBlockers.length,
    sourceReadyLocal: !state.checks.find((check) => check.id === "source_intent")?.localBlockers.length,
    timelineReadyLocal: !state.checks.find((check) => check.id === "timeline_editor")?.localBlockers.length,
    coverCaptionsReviewedLocal: !state.checks.find((check) => check.id === "cover_captions_review")?.localBlockers.length,
    publishGateReadyLocal: !state.checks.find((check) => check.id === "publish_readiness_gate")?.localBlockers.length,
    feedAcceptanceReadyLocal: !state.checks.find((check) => check.id === "feed_acceptance_gate")?.localBlockers.length,
    feedDraftReadyLocal: !state.checks.find((check) => check.id === "feed_draft_list")?.localBlockers.length,
    playbackControlsReadyLocal: !state.checks.find((check) => check.id === "playback_controls")?.localBlockers.length,
    engagementReadyLocal: !state.checks.find((check) => check.id === "engagement_states")?.localBlockers.length,
    localEventEvidenceReady: !state.checks.find((check) => check.id === "local_event_evidence")?.localBlockers.length,
    profileSetupHandoffReviewedLocal: state.profileSetupHandoffReviewedLocal,
    shortsFinalSmokeReadyLocal: !hasLocalBlocking && state.profileSetupHandoffReviewedLocal,
    localBlockers,
    providerBlockers: provider,
    backendShortsContract: "not_connected",
    mediaStorageCdnProvider: "not_configured",
    playbackManifestProvider: "not_configured",
    analyticsEngagementProvider: "not_configured",
    adminShortsReview: "not_connected",
    nextPhase: "streamer_profile_setup",
    fakeFinalSmokeAllowed: false,
    fakePublishAllowed: false,
    fakePlaybackAllowed: false,
    fakeEngagementAllowed: false,
    fakeProviderAllowed: false,
    paymentsAllowedNow: false,
    giftsAllowedNow: false,
    monetizationAllowedNow: false,
    walletBridgeRequiredNow: false,
  };
}

function refreshState(
  state: StreamShortVideoFinalSmokeRuntimeState,
  draft: StreamShortVideoDraftRuntimeState,
  timeline: StreamShortVideoTimelineRuntimeState,
  source: StreamShortVideoSourceRuntimeState,
  review: StreamShortVideoReviewRuntimeState,
  publish: StreamShortVideoPublishReadinessRuntimeState,
  feed: StreamShortVideoFeedDraftRuntimeState,
  playback: StreamShortVideoPlaybackControlsRuntimeState,
  engagement: StreamShortVideoEngagementRuntimeState,
  acceptance: StreamShortVideoFeedAcceptanceRuntimeState,
): StreamShortVideoFinalSmokeRuntimeState {
  const updatedAt = nowIso();
  const checks = makeChecks(state, draft, timeline, source, review, publish, feed, playback, engagement, acceptance, updatedAt);
  const interim: StreamShortVideoFinalSmokeRuntimeState = { ...state, checks, updatedAt };
  const evidence = makeEvidence(interim);
  const status: StreamShortVideoFinalSmokeStatus = evidence.localBlockers.length > 0 ? "blocked_local" : "ready_local";
  return { ...interim, status, evidence };
}

export function createInitialStreamShortVideoFinalSmokeState(
  draft: StreamShortVideoDraftRuntimeState,
  timeline: StreamShortVideoTimelineRuntimeState,
  source: StreamShortVideoSourceRuntimeState,
  review: StreamShortVideoReviewRuntimeState,
  publish: StreamShortVideoPublishReadinessRuntimeState,
  feed: StreamShortVideoFeedDraftRuntimeState,
  playback: StreamShortVideoPlaybackControlsRuntimeState,
  engagement: StreamShortVideoEngagementRuntimeState,
  acceptance: StreamShortVideoFeedAcceptanceRuntimeState,
): StreamShortVideoFinalSmokeRuntimeState {
  const updatedAt = nowIso();
  const baseChecks: readonly StreamShortVideoFinalSmokeCheck[] = checkSeed.map((seed): StreamShortVideoFinalSmokeCheck => ({
    ...seed,
    status: "pending_local",
    reviewedLocal: false,
    localBlockers: [],
    providerBlockers: seed.id === "provider_admin_handoff" ? providerBlockers() : [],
    deliveredToBackend: false,
    updatedAt,
  }));
  const base: StreamShortVideoFinalSmokeRuntimeState = {
    status: "pending_local",
    selectedCheckId: null,
    profileSetupHandoffReviewedLocal: false,
    checks: baseChecks,
    events: [],
    evidence: {
      selectedCheckId: null,
      selectedStatus: "pending_local",
      readyLocalChecks: 0,
      blockedLocalChecks: 0,
      providerBlockedChecks: 1,
      reviewedLocalChecks: 0,
      queuedSmokeEvents: 0,
      draftReadyLocal: false,
      sourceReadyLocal: false,
      timelineReadyLocal: false,
      coverCaptionsReviewedLocal: false,
      publishGateReadyLocal: false,
      feedAcceptanceReadyLocal: false,
      feedDraftReadyLocal: false,
      playbackControlsReadyLocal: false,
      engagementReadyLocal: false,
      localEventEvidenceReady: false,
      profileSetupHandoffReviewedLocal: false,
      shortsFinalSmokeReadyLocal: false,
      localBlockers: [],
      providerBlockers: providerBlockers(),
      backendShortsContract: "not_connected",
      mediaStorageCdnProvider: "not_configured",
      playbackManifestProvider: "not_configured",
      analyticsEngagementProvider: "not_configured",
      adminShortsReview: "not_connected",
      nextPhase: "streamer_profile_setup",
      fakeFinalSmokeAllowed: false,
      fakePublishAllowed: false,
      fakePlaybackAllowed: false,
      fakeEngagementAllowed: false,
      fakeProviderAllowed: false,
      paymentsAllowedNow: false,
      giftsAllowedNow: false,
      monetizationAllowedNow: false,
      walletBridgeRequiredNow: false,
    },
    updatedAt,
  };
  return refreshState(base, draft, timeline, source, review, publish, feed, playback, engagement, acceptance);
}

export function selectStreamShortVideoFinalSmokeCheck(state: StreamShortVideoFinalSmokeRuntimeState): StreamShortVideoFinalSmokeRuntimeState {
  const index = state.selectedCheckId ? state.checks.findIndex((check) => check.id === state.selectedCheckId) : -1;
  const next = state.checks[(index + 1) % state.checks.length] ?? state.checks[0];
  return { ...state, selectedCheckId: next.id, evidence: makeEvidence({ ...state, selectedCheckId: next.id }), updatedAt: nowIso() };
}

export function reviewSelectedStreamShortVideoFinalSmokeCheck(
  state: StreamShortVideoFinalSmokeRuntimeState,
  draft: StreamShortVideoDraftRuntimeState,
  timeline: StreamShortVideoTimelineRuntimeState,
  source: StreamShortVideoSourceRuntimeState,
  review: StreamShortVideoReviewRuntimeState,
  publish: StreamShortVideoPublishReadinessRuntimeState,
  feed: StreamShortVideoFeedDraftRuntimeState,
  playback: StreamShortVideoPlaybackControlsRuntimeState,
  engagement: StreamShortVideoEngagementRuntimeState,
  acceptance: StreamShortVideoFeedAcceptanceRuntimeState,
): StreamShortVideoFinalSmokeRuntimeState {
  if (!state.selectedCheckId) return refreshState(state, draft, timeline, source, review, publish, feed, playback, engagement, acceptance);
  const checks = state.checks.map((check): StreamShortVideoFinalSmokeCheck => check.id === state.selectedCheckId ? { ...check, reviewedLocal: true, updatedAt: nowIso() } : check);
  const next = refreshState({ ...state, checks }, draft, timeline, source, review, publish, feed, playback, engagement, acceptance);
  return appendEvent(next, "shorts_final_smoke_review_local");
}

export function reviewStreamShortVideoProfileSetupHandoff(
  state: StreamShortVideoFinalSmokeRuntimeState,
  draft: StreamShortVideoDraftRuntimeState,
  timeline: StreamShortVideoTimelineRuntimeState,
  source: StreamShortVideoSourceRuntimeState,
  review: StreamShortVideoReviewRuntimeState,
  publish: StreamShortVideoPublishReadinessRuntimeState,
  feed: StreamShortVideoFeedDraftRuntimeState,
  playback: StreamShortVideoPlaybackControlsRuntimeState,
  engagement: StreamShortVideoEngagementRuntimeState,
  acceptance: StreamShortVideoFeedAcceptanceRuntimeState,
): StreamShortVideoFinalSmokeRuntimeState {
  const next = refreshState({ ...state, profileSetupHandoffReviewedLocal: true, selectedCheckId: "profile_setup_handoff" }, draft, timeline, source, review, publish, feed, playback, engagement, acceptance);
  return appendEvent(next, "shorts_profile_setup_handoff_reviewed_local");
}

export function runStreamShortVideoFinalSmokeChecklist(
  state: StreamShortVideoFinalSmokeRuntimeState,
  draft: StreamShortVideoDraftRuntimeState,
  timeline: StreamShortVideoTimelineRuntimeState,
  source: StreamShortVideoSourceRuntimeState,
  review: StreamShortVideoReviewRuntimeState,
  publish: StreamShortVideoPublishReadinessRuntimeState,
  feed: StreamShortVideoFeedDraftRuntimeState,
  playback: StreamShortVideoPlaybackControlsRuntimeState,
  engagement: StreamShortVideoEngagementRuntimeState,
  acceptance: StreamShortVideoFeedAcceptanceRuntimeState,
): StreamShortVideoFinalSmokeRuntimeState {
  const next = refreshState(state, draft, timeline, source, review, publish, feed, playback, engagement, acceptance);
  return appendEvent(next, "shorts_final_smoke_run_local");
}

export function requestStreamShortVideoFinalSmokeProviderBlocked(state: StreamShortVideoFinalSmokeRuntimeState): StreamShortVideoFinalSmokeRuntimeState {
  const updatedAt = nowIso();
  const checks = state.checks.map((check): StreamShortVideoFinalSmokeCheck => check.id === "provider_admin_handoff" ? { ...check, status: "provider_blocked", providerBlockers: providerBlockers(), updatedAt } : check);
  const next: StreamShortVideoFinalSmokeRuntimeState = { ...state, checks, selectedCheckId: "provider_admin_handoff", updatedAt };
  return appendEvent({ ...next, evidence: makeEvidence(next) }, "shorts_final_smoke_provider_blocked");
}

export function queueStreamShortVideoFinalSmokeEvent(state: StreamShortVideoFinalSmokeRuntimeState): StreamShortVideoFinalSmokeRuntimeState {
  return appendEvent(state, "shorts_final_smoke_review_local");
}

function appendEvent(state: StreamShortVideoFinalSmokeRuntimeState, kind: StreamShortVideoFinalSmokeEventKind): StreamShortVideoFinalSmokeRuntimeState {
  const selected = state.checks.find((check) => check.id === state.selectedCheckId) ?? null;
  if (!selected) return { ...state, evidence: makeEvidence(state), updatedAt: nowIso() };
  const createdAt = nowIso();
  const event: StreamShortVideoFinalSmokeEvent = {
    eventId: makeEventId(kind, selected.id),
    kind,
    checkId: selected.id,
    createdAt,
    deliveredToProvider: false,
    payload: {
      status: selected.status,
      draftId: "local_short_draft",
      title: selected.title,
      selectedDraftId: null,
      selectedPlaybackDraftId: null,
      readyLocalChecks: state.evidence.readyLocalChecks,
      blockedLocalChecks: state.evidence.blockedLocalChecks,
      providerBlockedChecks: state.evidence.providerBlockedChecks,
      localBlockers: selected.localBlockers,
      providerBlockers: selected.providerBlockers,
    },
  };
  const next: StreamShortVideoFinalSmokeRuntimeState = { ...state, events: [...state.events, event], updatedAt: createdAt };
  return { ...next, evidence: makeEvidence(next) };
}
