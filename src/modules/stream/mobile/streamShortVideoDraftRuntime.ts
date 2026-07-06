export type StreamShortVideoSourceIntent = "camera" | "upload" | "editor" | "cover" | "captions" | "privacy" | "publish_handoff";
export type StreamShortVideoVisibility = "public" | "followers" | "private" | "business_only";
export type StreamShortVideoDraftStatus = "draft_local" | "source_intent_ready" | "editor_ready_local" | "storage_handoff_blocked" | "publish_blocked_provider_required";
export type StreamShortVideoBlockerCode =
  | "title_required"
  | "source_intent_required"
  | "editor_timeline_required"
  | "cover_intent_required"
  | "caption_review_required"
  | "content_policy_ack_required"
  | "media_storage_provider_required"
  | "cdn_provider_required"
  | "backend_publish_contract_required"
  | "admin_content_review_required";

export type StreamShortVideoDraftEventKind =
  | "short_draft_updated_local"
  | "short_source_intent_local"
  | "short_editor_check_local"
  | "short_storage_handoff_blocked";

export type StreamShortVideoDraft = {
  readonly draftId: string;
  readonly title: string;
  readonly caption: string;
  readonly category: string;
  readonly tags: readonly string[];
  readonly visibility: StreamShortVideoVisibility;
  readonly sourceIntent: StreamShortVideoSourceIntent | null;
  readonly coverIntentReady: boolean;
  readonly captionReviewReady: boolean;
  readonly editorTimelineReady: boolean;
  readonly contentPolicyAck: boolean;
  readonly updatedAt: string;
  readonly deliveredToStorage: false;
  readonly published: false;
};

export type StreamShortVideoDraftEvent = {
  readonly eventId: string;
  readonly kind: StreamShortVideoDraftEventKind;
  readonly draftId: string;
  readonly createdAt: string;
  readonly deliveredToProvider: false;
  readonly payload: {
    readonly title: string;
    readonly sourceIntent: StreamShortVideoSourceIntent | null;
    readonly visibility: StreamShortVideoVisibility;
    readonly localBlockers: readonly StreamShortVideoBlockerCode[];
    readonly providerBlockers: readonly StreamShortVideoBlockerCode[];
  };
};

export type StreamShortVideoDraftEvidence = {
  readonly draftReadyLocal: boolean;
  readonly sourceIntentReady: boolean;
  readonly editorReadyLocal: boolean;
  readonly localBlockers: readonly StreamShortVideoBlockerCode[];
  readonly providerBlockers: readonly StreamShortVideoBlockerCode[];
  readonly queuedLocalEvents: number;
  readonly backendShortsDraftContract: "local_only_not_connected";
  readonly mediaStorageProvider: "not_configured";
  readonly cdnProvider: "not_configured";
  readonly adminContentReview: "not_connected";
  readonly fakeUploadAllowed: false;
  readonly fakePublishAllowed: false;
  readonly fakeProviderSuccessAllowed: false;
  readonly paymentsAllowedNow: false;
  readonly giftsAllowedNow: false;
  readonly monetizationAllowedNow: false;
};

export type StreamShortVideoDraftRuntimeState = {
  readonly status: StreamShortVideoDraftStatus;
  readonly draft: StreamShortVideoDraft;
  readonly selectedSourceIntent: StreamShortVideoSourceIntent;
  readonly events: readonly StreamShortVideoDraftEvent[];
  readonly evidence: StreamShortVideoDraftEvidence;
  readonly updatedAt: string;
};

const nowIso = () => new Date().toISOString();
const eventId = (kind: StreamShortVideoDraftEventKind, draftId: string) => `${kind}-${draftId}-${Date.now()}`;

function normalizeTags(value: string): readonly string[] {
  return value
    .split(/[#,\s]+/)
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 6);
}

function computeLocalBlockers(draft: StreamShortVideoDraft): readonly StreamShortVideoBlockerCode[] {
  const blockers: StreamShortVideoBlockerCode[] = [];
  if (!draft.title.trim()) blockers.push("title_required");
  if (!draft.sourceIntent) blockers.push("source_intent_required");
  if (!draft.editorTimelineReady) blockers.push("editor_timeline_required");
  if (!draft.coverIntentReady) blockers.push("cover_intent_required");
  if (!draft.captionReviewReady) blockers.push("caption_review_required");
  if (!draft.contentPolicyAck) blockers.push("content_policy_ack_required");
  return blockers;
}

function computeProviderBlockers(): readonly StreamShortVideoBlockerCode[] {
  return [
    "media_storage_provider_required",
    "cdn_provider_required",
    "backend_publish_contract_required",
    "admin_content_review_required",
  ];
}

function computeStatus(draft: StreamShortVideoDraft): StreamShortVideoDraftStatus {
  const localBlockers = computeLocalBlockers(draft);
  if (localBlockers.length > 0) {
    return draft.sourceIntent ? "source_intent_ready" : "draft_local";
  }
  return "publish_blocked_provider_required";
}

function buildEvidence(draft: StreamShortVideoDraft, events: readonly StreamShortVideoDraftEvent[]): StreamShortVideoDraftEvidence {
  const localBlockers = computeLocalBlockers(draft);
  const providerBlockers = computeProviderBlockers();
  return {
    draftReadyLocal: Boolean(draft.title.trim()),
    sourceIntentReady: Boolean(draft.sourceIntent),
    editorReadyLocal: localBlockers.length === 0,
    localBlockers,
    providerBlockers,
    queuedLocalEvents: events.length,
    backendShortsDraftContract: "local_only_not_connected",
    mediaStorageProvider: "not_configured",
    cdnProvider: "not_configured",
    adminContentReview: "not_connected",
    fakeUploadAllowed: false,
    fakePublishAllowed: false,
    fakeProviderSuccessAllowed: false,
    paymentsAllowedNow: false,
    giftsAllowedNow: false,
    monetizationAllowedNow: false,
  };
}

function rebuild(state: StreamShortVideoDraftRuntimeState, draft: StreamShortVideoDraft, events = state.events): StreamShortVideoDraftRuntimeState {
  const updatedAt = nowIso();
  return {
    ...state,
    status: computeStatus(draft),
    draft,
    selectedSourceIntent: draft.sourceIntent ?? state.selectedSourceIntent,
    events,
    evidence: buildEvidence(draft, events),
    updatedAt,
  };
}

export function createInitialStreamShortVideoDraftState(): StreamShortVideoDraftRuntimeState {
  const updatedAt = nowIso();
  const draft: StreamShortVideoDraft = {
    draftId: "short-draft-local-001",
    title: "",
    caption: "",
    category: "general",
    tags: [],
    visibility: "public",
    sourceIntent: null,
    coverIntentReady: false,
    captionReviewReady: false,
    editorTimelineReady: false,
    contentPolicyAck: false,
    updatedAt,
    deliveredToStorage: false,
    published: false,
  };
  return {
    status: "draft_local",
    draft,
    selectedSourceIntent: "camera",
    events: [],
    evidence: buildEvidence(draft, []),
    updatedAt,
  };
}

export function updateStreamShortVideoDraftText(
  state: StreamShortVideoDraftRuntimeState,
  patch: { readonly title?: string; readonly caption?: string; readonly category?: string; readonly tagsText?: string },
): StreamShortVideoDraftRuntimeState {
  const draft: StreamShortVideoDraft = {
    ...state.draft,
    title: patch.title ?? state.draft.title,
    caption: patch.caption ?? state.draft.caption,
    category: patch.category ?? state.draft.category,
    tags: typeof patch.tagsText === "string" ? normalizeTags(patch.tagsText) : state.draft.tags,
    updatedAt: nowIso(),
  };
  return rebuild(state, draft);
}

export function setStreamShortVideoSourceIntent(
  state: StreamShortVideoDraftRuntimeState,
  sourceIntent: StreamShortVideoSourceIntent,
): StreamShortVideoDraftRuntimeState {
  const draft: StreamShortVideoDraft = { ...state.draft, sourceIntent, updatedAt: nowIso() };
  return rebuild(state, draft);
}

export function setStreamShortVideoVisibility(
  state: StreamShortVideoDraftRuntimeState,
  visibility: StreamShortVideoVisibility,
): StreamShortVideoDraftRuntimeState {
  const draft: StreamShortVideoDraft = { ...state.draft, visibility, updatedAt: nowIso() };
  return rebuild(state, draft);
}

export function markStreamShortVideoCoverIntent(state: StreamShortVideoDraftRuntimeState): StreamShortVideoDraftRuntimeState {
  return rebuild(state, { ...state.draft, coverIntentReady: true, updatedAt: nowIso() });
}

export function markStreamShortVideoCaptionReview(state: StreamShortVideoDraftRuntimeState): StreamShortVideoDraftRuntimeState {
  return rebuild(state, { ...state.draft, captionReviewReady: true, updatedAt: nowIso() });
}

export function markStreamShortVideoEditorTimeline(state: StreamShortVideoDraftRuntimeState): StreamShortVideoDraftRuntimeState {
  return rebuild(state, { ...state.draft, editorTimelineReady: true, updatedAt: nowIso() });
}

export function acknowledgeStreamShortVideoContentPolicy(state: StreamShortVideoDraftRuntimeState): StreamShortVideoDraftRuntimeState {
  return rebuild(state, { ...state.draft, contentPolicyAck: true, updatedAt: nowIso() });
}

export function runStreamShortVideoDraftReadinessCheck(state: StreamShortVideoDraftRuntimeState): StreamShortVideoDraftRuntimeState {
  return rebuild(state, { ...state.draft, updatedAt: nowIso() });
}

export function queueStreamShortVideoDraftLocalEvent(
  state: StreamShortVideoDraftRuntimeState,
  kind: StreamShortVideoDraftEventKind = "short_draft_updated_local",
): StreamShortVideoDraftRuntimeState {
  const createdAt = nowIso();
  const event: StreamShortVideoDraftEvent = {
    eventId: eventId(kind, state.draft.draftId),
    kind,
    draftId: state.draft.draftId,
    createdAt,
    deliveredToProvider: false,
    payload: {
      title: state.draft.title,
      sourceIntent: state.draft.sourceIntent,
      visibility: state.draft.visibility,
      localBlockers: state.evidence.localBlockers,
      providerBlockers: state.evidence.providerBlockers,
    },
  };
  return rebuild(state, state.draft, [event, ...state.events].slice(0, 12));
}

export function requestStreamShortVideoStorageHandoffBlocked(state: StreamShortVideoDraftRuntimeState): StreamShortVideoDraftRuntimeState {
  const queued = queueStreamShortVideoDraftLocalEvent(state, "short_storage_handoff_blocked");
  return { ...queued, status: "storage_handoff_blocked", evidence: buildEvidence(queued.draft, queued.events) };
}
