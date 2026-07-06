import type { StreamShortVideoDraftRuntimeState } from "./streamShortVideoDraftRuntime";
import type { StreamShortVideoTimelineRuntimeState } from "./streamShortVideoEditorTimelineRuntime";
import type { StreamShortVideoSourceRuntimeState } from "./streamShortVideoSourceIntentRuntime";
import type { StreamShortVideoReviewRuntimeState } from "./streamShortVideoCoverCaptionReviewRuntime";

export type StreamShortVideoPublishReadinessCheckId =
  | "draft_metadata"
  | "source_intent"
  | "timeline_editor"
  | "cover_captions_review"
  | "content_policy_review"
  | "local_event_evidence"
  | "publish_handoff_review"
  | "provider_admin_handoff";

export type StreamShortVideoPublishReadinessStatus =
  | "pending_local"
  | "reviewed_local"
  | "ready_local"
  | "blocked_local"
  | "provider_blocked";

export type StreamShortVideoPublishReadinessBlockerCode =
  | "draft_title_required"
  | "draft_category_required"
  | "source_intent_required"
  | "source_asset_intent_required"
  | "timeline_ready_required"
  | "cover_review_required"
  | "caption_review_required"
  | "content_policy_review_required"
  | "media_review_required"
  | "publish_handoff_review_required"
  | "local_event_evidence_required"
  | "media_storage_provider_required"
  | "cdn_provider_required"
  | "backend_shorts_publish_contract_required"
  | "admin_shorts_publish_review_required";

export type StreamShortVideoPublishReadinessCheck = {
  readonly id: StreamShortVideoPublishReadinessCheckId;
  readonly title: string;
  readonly purpose: string;
  readonly status: StreamShortVideoPublishReadinessStatus;
  readonly reviewedLocal: boolean;
  readonly localBlockers: readonly StreamShortVideoPublishReadinessBlockerCode[];
  readonly providerBlockers: readonly StreamShortVideoPublishReadinessBlockerCode[];
  readonly deliveredToBackend: false;
  readonly updatedAt: string;
};

export type StreamShortVideoPublishReadinessEventKind =
  | "short_publish_readiness_review_local"
  | "short_publish_readiness_gate_run_local"
  | "short_publish_handoff_blocked";

export type StreamShortVideoPublishReadinessEvent = {
  readonly eventId: string;
  readonly kind: StreamShortVideoPublishReadinessEventKind;
  readonly checkId: StreamShortVideoPublishReadinessCheckId;
  readonly createdAt: string;
  readonly deliveredToProvider: false;
  readonly payload: {
    readonly status: StreamShortVideoPublishReadinessStatus;
    readonly reviewedLocal: boolean;
    readonly localBlockers: readonly StreamShortVideoPublishReadinessBlockerCode[];
    readonly providerBlockers: readonly StreamShortVideoPublishReadinessBlockerCode[];
    readonly draftId: string;
    readonly title: string;
    readonly sourceIntent: string;
    readonly timelineClips: number;
  };
};

export type StreamShortVideoPublishReadinessEvidence = {
  readonly selectedCheckId: StreamShortVideoPublishReadinessCheckId | null;
  readonly selectedStatus: StreamShortVideoPublishReadinessStatus;
  readonly readyLocalChecks: number;
  readonly blockedLocalChecks: number;
  readonly providerBlockedChecks: number;
  readonly reviewedLocalChecks: number;
  readonly queuedPublishReadinessEvents: number;
  readonly draftReadyLocal: boolean;
  readonly sourceReadyLocal: boolean;
  readonly timelineReadyLocal: boolean;
  readonly coverCaptionsReviewedLocal: boolean;
  readonly contentPolicyReviewedLocal: boolean;
  readonly localEvidenceReady: boolean;
  readonly publishHandoffReviewedLocal: boolean;
  readonly publishReadyLocal: boolean;
  readonly localBlockers: readonly StreamShortVideoPublishReadinessBlockerCode[];
  readonly providerBlockers: readonly StreamShortVideoPublishReadinessBlockerCode[];
  readonly mediaStorageProvider: "not_configured";
  readonly cdnProvider: "not_configured";
  readonly backendShortsPublishContract: "not_connected";
  readonly adminShortsPublishReview: "not_connected";
  readonly fakePublishAllowed: false;
  readonly fakeUploadAllowed: false;
  readonly fakeProviderSuccessAllowed: false;
  readonly paymentsAllowedNow: false;
  readonly giftsAllowedNow: false;
  readonly monetizationAllowedNow: false;
  readonly walletBridgeRequiredNow: false;
};

export type StreamShortVideoPublishReadinessRuntimeState = {
  readonly status: StreamShortVideoPublishReadinessStatus;
  readonly selectedCheckId: StreamShortVideoPublishReadinessCheckId | null;
  readonly checks: readonly StreamShortVideoPublishReadinessCheck[];
  readonly events: readonly StreamShortVideoPublishReadinessEvent[];
  readonly evidence: StreamShortVideoPublishReadinessEvidence;
  readonly updatedAt: string;
};

const nowIso = () => new Date().toISOString();
const makeId = (prefix: string) => `${prefix}-${Date.now()}-${Math.round(Math.random() * 10000)}`;

const providerBlockers = (): readonly StreamShortVideoPublishReadinessBlockerCode[] => [
  "media_storage_provider_required",
  "cdn_provider_required",
  "backend_shorts_publish_contract_required",
  "admin_shorts_publish_review_required",
];

const checkSeed: readonly Pick<StreamShortVideoPublishReadinessCheck, "id" | "title" | "purpose">[] = [
  { id: "draft_metadata", title: "Метаданные черновика", purpose: "Название, категория, подпись и видимость должны быть готовы перед передачей публикации." },
  { id: "source_intent", title: "Источник видео", purpose: "Источник камера/загрузка/редактор должен быть подготовлен локально." },
  { id: "timeline_editor", title: "Монтажная линия", purpose: "Клипы, обрезка, порядок, обложка и подписи должны быть готовы локально." },
  { id: "cover_captions_review", title: "Обложка и подписи", purpose: "Проверка обложки и подписей должна быть завершена локально." },
  { id: "content_policy_review", title: "Правила контента", purpose: "Проверка правил, медиа и языка должна быть подтверждена локально." },
  { id: "local_event_evidence", title: "Локальные события", purpose: "События черновика, источника, таймлайна и проверки должны существовать перед передачей провайдеру." },
  { id: "publish_handoff_review", title: "Передача публикации", purpose: "Проверка передачи публикации должна быть завершена без имитации публикации." },
  { id: "provider_admin_handoff", title: "Передача провайдер/админ", purpose: "Для реальной публикации нужны storage, CDN, backend-контракт публикации и Admin-проверка." },
];

function localBlockersForCheck(
  id: StreamShortVideoPublishReadinessCheckId,
  draft: StreamShortVideoDraftRuntimeState,
  timeline: StreamShortVideoTimelineRuntimeState,
  source: StreamShortVideoSourceRuntimeState,
  review: StreamShortVideoReviewRuntimeState,
): readonly StreamShortVideoPublishReadinessBlockerCode[] {
  const blockers: StreamShortVideoPublishReadinessBlockerCode[] = [];
  if (id === "draft_metadata") {
    if (!draft.draft.title.trim()) blockers.push("draft_title_required");
    if (!draft.draft.category.trim()) blockers.push("draft_category_required");
  }
  if (id === "source_intent") {
    if (!draft.draft.sourceIntent) blockers.push("source_intent_required");
    if (!source.evidence.selectedReadyLocal) blockers.push("source_asset_intent_required");
  }
  if (id === "timeline_editor" && !timeline.evidence.timelineReadyLocal) blockers.push("timeline_ready_required");
  if (id === "cover_captions_review") {
    if (!review.evidence.coverFrameReadyLocal) blockers.push("cover_review_required");
    if (!review.evidence.captionsReadyLocal) blockers.push("caption_review_required");
  }
  if (id === "content_policy_review") {
    if (!draft.draft.contentPolicyAck || !review.evidence.contentPolicyReadyLocal) blockers.push("content_policy_review_required");
    if (!review.evidence.mediaReviewReadyLocal) blockers.push("media_review_required");
  }
  if (id === "local_event_evidence") {
    const totalEvents = draft.events.length + timeline.events.length + source.events.length + review.events.length;
    if (totalEvents < 3) blockers.push("local_event_evidence_required");
  }
  if (id === "publish_handoff_review" && !review.evidence.publishHandoffReviewedLocal) blockers.push("publish_handoff_review_required");
  return blockers;
}

function statusForCheck(
  id: StreamShortVideoPublishReadinessCheckId,
  reviewedLocal: boolean,
  localBlockers: readonly StreamShortVideoPublishReadinessBlockerCode[],
): StreamShortVideoPublishReadinessStatus {
  if (id === "provider_admin_handoff") return "provider_blocked";
  if (localBlockers.length > 0) return "blocked_local";
  return reviewedLocal ? "ready_local" : "reviewed_local";
}

function rebuildChecks(
  state: Pick<StreamShortVideoPublishReadinessRuntimeState, "checks">,
  draft: StreamShortVideoDraftRuntimeState,
  timeline: StreamShortVideoTimelineRuntimeState,
  source: StreamShortVideoSourceRuntimeState,
  review: StreamShortVideoReviewRuntimeState,
): readonly StreamShortVideoPublishReadinessCheck[] {
  const updatedAt = nowIso();
  return state.checks.map((check): StreamShortVideoPublishReadinessCheck => {
    const localBlockers = localBlockersForCheck(check.id, draft, timeline, source, review);
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
  state: Pick<StreamShortVideoPublishReadinessRuntimeState, "selectedCheckId" | "checks" | "events">,
  draft: StreamShortVideoDraftRuntimeState,
  timeline: StreamShortVideoTimelineRuntimeState,
  source: StreamShortVideoSourceRuntimeState,
  review: StreamShortVideoReviewRuntimeState,
): StreamShortVideoPublishReadinessEvidence {
  const selected = state.checks.find((check) => check.id === state.selectedCheckId) ?? null;
  const localBlockers = Array.from(new Set(state.checks.flatMap((check) => check.localBlockers)));
  const publishReadyLocal = state.checks.every((check) => check.id === "provider_admin_handoff" || check.localBlockers.length === 0);
  return {
    selectedCheckId: selected?.id ?? null,
    selectedStatus: selected?.status ?? "pending_local",
    readyLocalChecks: state.checks.filter((check) => check.status === "ready_local" || check.status === "reviewed_local").length,
    blockedLocalChecks: state.checks.filter((check) => check.status === "blocked_local").length,
    providerBlockedChecks: state.checks.filter((check) => check.status === "provider_blocked").length,
    reviewedLocalChecks: state.checks.filter((check) => check.reviewedLocal).length,
    queuedPublishReadinessEvents: state.events.length,
    draftReadyLocal: Boolean(draft.draft.title.trim() && draft.draft.category.trim()),
    sourceReadyLocal: Boolean(draft.draft.sourceIntent && source.evidence.selectedReadyLocal),
    timelineReadyLocal: timeline.evidence.timelineReadyLocal,
    coverCaptionsReviewedLocal: review.evidence.coverFrameReadyLocal && review.evidence.captionsReadyLocal,
    contentPolicyReviewedLocal: draft.draft.contentPolicyAck && review.evidence.contentPolicyReadyLocal && review.evidence.mediaReviewReadyLocal,
    localEvidenceReady: draft.events.length + timeline.events.length + source.events.length + review.events.length >= 3,
    publishHandoffReviewedLocal: review.evidence.publishHandoffReviewedLocal,
    publishReadyLocal,
    localBlockers,
    providerBlockers: providerBlockers(),
    mediaStorageProvider: "not_configured",
    cdnProvider: "not_configured",
    backendShortsPublishContract: "not_connected",
    adminShortsPublishReview: "not_connected",
    fakePublishAllowed: false,
    fakeUploadAllowed: false,
    fakeProviderSuccessAllowed: false,
    paymentsAllowedNow: false,
    giftsAllowedNow: false,
    monetizationAllowedNow: false,
    walletBridgeRequiredNow: false,
  };
}

function rebuild(
  state: StreamShortVideoPublishReadinessRuntimeState,
  draft: StreamShortVideoDraftRuntimeState,
  timeline: StreamShortVideoTimelineRuntimeState,
  source: StreamShortVideoSourceRuntimeState,
  review: StreamShortVideoReviewRuntimeState,
  patch: Partial<Pick<StreamShortVideoPublishReadinessRuntimeState, "selectedCheckId" | "events">> = {},
): StreamShortVideoPublishReadinessRuntimeState {
  const base = { ...state, ...patch };
  const checks = rebuildChecks(base, draft, timeline, source, review);
  const evidence = buildEvidence({ selectedCheckId: base.selectedCheckId, checks, events: base.events }, draft, timeline, source, review);
  const status: StreamShortVideoPublishReadinessStatus = evidence.publishReadyLocal ? "provider_blocked" : evidence.blockedLocalChecks > 0 ? "blocked_local" : "reviewed_local";
  return { ...base, checks, evidence, status, updatedAt: nowIso() };
}

export function createInitialStreamShortVideoPublishReadinessState(
  draft: StreamShortVideoDraftRuntimeState,
  timeline: StreamShortVideoTimelineRuntimeState,
  source: StreamShortVideoSourceRuntimeState,
  review: StreamShortVideoReviewRuntimeState,
): StreamShortVideoPublishReadinessRuntimeState {
  const updatedAt = nowIso();
  const checks: readonly StreamShortVideoPublishReadinessCheck[] = checkSeed.map((check) => ({
    ...check,
    status: "pending_local",
    reviewedLocal: false,
    localBlockers: [],
    providerBlockers: check.id === "provider_admin_handoff" ? providerBlockers() : [],
    deliveredToBackend: false,
    updatedAt,
  }));
  const state: StreamShortVideoPublishReadinessRuntimeState = {
    status: "pending_local",
    selectedCheckId: null,
    checks,
    events: [],
    evidence: {
      selectedCheckId: null,
      selectedStatus: "pending_local",
      readyLocalChecks: 0,
      blockedLocalChecks: 0,
      providerBlockedChecks: 1,
      reviewedLocalChecks: 0,
      queuedPublishReadinessEvents: 0,
      draftReadyLocal: false,
      sourceReadyLocal: false,
      timelineReadyLocal: false,
      coverCaptionsReviewedLocal: false,
      contentPolicyReviewedLocal: false,
      localEvidenceReady: false,
      publishHandoffReviewedLocal: false,
      publishReadyLocal: false,
      localBlockers: [],
      providerBlockers: providerBlockers(),
      mediaStorageProvider: "not_configured",
      cdnProvider: "not_configured",
      backendShortsPublishContract: "not_connected",
      adminShortsPublishReview: "not_connected",
      fakePublishAllowed: false,
      fakeUploadAllowed: false,
      fakeProviderSuccessAllowed: false,
      paymentsAllowedNow: false,
      giftsAllowedNow: false,
      monetizationAllowedNow: false,
      walletBridgeRequiredNow: false,
    },
    updatedAt,
  };
  return rebuild(state, draft, timeline, source, review);
}

export function selectStreamShortVideoPublishReadinessCheck(
  state: StreamShortVideoPublishReadinessRuntimeState,
  checkId: StreamShortVideoPublishReadinessCheckId,
): StreamShortVideoPublishReadinessRuntimeState {
  return { ...state, selectedCheckId: checkId, evidence: { ...state.evidence, selectedCheckId: checkId }, updatedAt: nowIso() };
}

export function reviewSelectedStreamShortVideoPublishReadinessCheck(
  state: StreamShortVideoPublishReadinessRuntimeState,
  draft: StreamShortVideoDraftRuntimeState,
  timeline: StreamShortVideoTimelineRuntimeState,
  source: StreamShortVideoSourceRuntimeState,
  review: StreamShortVideoReviewRuntimeState,
): StreamShortVideoPublishReadinessRuntimeState {
  if (!state.selectedCheckId) return rebuild(state, draft, timeline, source, review);
  const checks: readonly StreamShortVideoPublishReadinessCheck[] = state.checks.map((check): StreamShortVideoPublishReadinessCheck => (
    check.id === state.selectedCheckId ? { ...check, reviewedLocal: true, updatedAt: nowIso() } : check
  ));
  return rebuild({ ...state, checks }, draft, timeline, source, review);
}

export function runStreamShortVideoPublishReadinessGate(
  state: StreamShortVideoPublishReadinessRuntimeState,
  draft: StreamShortVideoDraftRuntimeState,
  timeline: StreamShortVideoTimelineRuntimeState,
  source: StreamShortVideoSourceRuntimeState,
  review: StreamShortVideoReviewRuntimeState,
): StreamShortVideoPublishReadinessRuntimeState {
  return rebuild(state, draft, timeline, source, review);
}

export function queueStreamShortVideoPublishReadinessEvent(
  state: StreamShortVideoPublishReadinessRuntimeState,
  draft: StreamShortVideoDraftRuntimeState,
  timeline: StreamShortVideoTimelineRuntimeState,
  source: StreamShortVideoSourceRuntimeState,
  review: StreamShortVideoReviewRuntimeState,
  kind: StreamShortVideoPublishReadinessEventKind = "short_publish_readiness_review_local",
): StreamShortVideoPublishReadinessRuntimeState {
  const synced = rebuild(state, draft, timeline, source, review);
  const selected = synced.checks.find((check) => check.id === synced.selectedCheckId) ?? null;
  if (!selected) return synced;
  const event: StreamShortVideoPublishReadinessEvent = {
    eventId: makeId(kind),
    kind,
    checkId: selected.id,
    createdAt: nowIso(),
    deliveredToProvider: false,
    payload: {
      status: selected.status,
      reviewedLocal: selected.reviewedLocal,
      localBlockers: selected.localBlockers,
      providerBlockers: selected.providerBlockers.length > 0 ? selected.providerBlockers : providerBlockers(),
      draftId: draft.draft.draftId,
      title: draft.draft.title,
      sourceIntent: draft.draft.sourceIntent ?? "none",
      timelineClips: timeline.evidence.clipCount,
    },
  };
  return rebuild({ ...synced, events: [event, ...synced.events].slice(0, 14) }, draft, timeline, source, review);
}

export function requestStreamShortVideoPublishProviderBlocked(
  state: StreamShortVideoPublishReadinessRuntimeState,
  draft: StreamShortVideoDraftRuntimeState,
  timeline: StreamShortVideoTimelineRuntimeState,
  source: StreamShortVideoSourceRuntimeState,
  review: StreamShortVideoReviewRuntimeState,
): StreamShortVideoPublishReadinessRuntimeState {
  const selectedProviderState = selectStreamShortVideoPublishReadinessCheck(state, "provider_admin_handoff");
  return queueStreamShortVideoPublishReadinessEvent(selectedProviderState, draft, timeline, source, review, "short_publish_handoff_blocked");
}
