export type StreamShortVideoCommentStatus = "local_only" | "pinned_local" | "reported_local" | "hidden_local";

export type StreamShortVideoSocialProviderBlockerCode =
  | "backend_comments_contract_required"
  | "realtime_comments_provider_required"
  | "backend_engagement_contract_required"
  | "share_provider_contract_required"
  | "moderation_review_queue_required"
  | "admin_comment_review_required";

export type StreamShortVideoLocalComment = {
  readonly id: string;
  readonly author: string;
  readonly text: string;
  readonly status: StreamShortVideoCommentStatus;
  readonly likedLocal: boolean;
  readonly replyDraftLocal: boolean;
  readonly replyToCommentIdLocal?: string | null;
  readonly replyToTextLocal?: string | null;
  readonly createdAt: string;
  readonly deliveredToProvider: false;
};

export type StreamShortVideoSocialCommentsEvidence = {
  readonly likedLocal: boolean;
  readonly savedLocal: boolean;
  readonly shareDraftPreparedLocal: boolean;
  readonly commentsOpenLocal: boolean;
  readonly commentsCountLocal: number;
  readonly pinnedCommentsLocal: number;
  readonly reportedCommentsLocal: number;
  readonly hiddenCommentsLocal: number;
  readonly queuedCommentEventsLocal: number;
  readonly queuedSocialEventsLocal: number;
  readonly providerBlockers: readonly StreamShortVideoSocialProviderBlockerCode[];
  readonly fakeLikeAllowed: false;
  readonly fakeCommentDeliveryAllowed: false;
  readonly fakeShareDeliveryAllowed: false;
  readonly fakeSaveProviderAllowed: false;
};

export type StreamShortVideoSocialCommentsState = {
  readonly comments: readonly StreamShortVideoLocalComment[];
  readonly selectedCommentId: string | null;
  readonly likedLocal: boolean;
  readonly savedLocal: boolean;
  readonly shareDraftPreparedLocal: boolean;
  readonly commentsOpenLocal: boolean;
  readonly queuedCommentEventsLocal: number;
  readonly queuedSocialEventsLocal: number;
  readonly lastQueuedCommentFingerprintLocal: string | null;
  readonly lastQueuedSocialFingerprintLocal: string | null;
  readonly evidence: StreamShortVideoSocialCommentsEvidence;
  readonly updatedAt: string;
};

const MAX_USABLE_LOCAL_COMMENTS = 50;

const providerBlockers: readonly StreamShortVideoSocialProviderBlockerCode[] = [
  "backend_comments_contract_required",
  "realtime_comments_provider_required",
  "backend_engagement_contract_required",
  "share_provider_contract_required",
  "moderation_review_queue_required",
  "admin_comment_review_required",
];

function nowIso(): string {
  return new Date().toISOString();
}

function buildCommentsFingerprint(comments: readonly StreamShortVideoLocalComment[]): string {
  return comments
    .map((comment) =>
      [
        comment.id,
        comment.status,
        comment.text,
        comment.replyToCommentIdLocal ?? "no_reply_parent",
        comment.replyToTextLocal ?? "no_reply_text",
        comment.likedLocal ? "liked" : "not_liked",
      ].join(":"),
    )
    .join("|");
}

function buildSocialFingerprint(state: Pick<StreamShortVideoSocialCommentsState, "likedLocal" | "savedLocal" | "shareDraftPreparedLocal">): string {
  return [
    state.likedLocal ? "liked" : "not_liked",
    state.savedLocal ? "saved" : "not_saved",
    state.shareDraftPreparedLocal ? "share_draft" : "no_share_draft",
  ].join("|");
}

function hasAnySocialDraft(state: Pick<StreamShortVideoSocialCommentsState, "likedLocal" | "savedLocal" | "shareDraftPreparedLocal">): boolean {
  return state.likedLocal || state.savedLocal || state.shareDraftPreparedLocal;
}

function isVisibleComment(comment: StreamShortVideoLocalComment): boolean {
  return comment.status !== "hidden_local";
}

function canUseCommentAction(comment: StreamShortVideoLocalComment): boolean {
  return comment.status !== "hidden_local" && comment.status !== "reported_local";
}

function isSelectableComment(comment: StreamShortVideoLocalComment): boolean {
  return canUseCommentAction(comment);
}

function canUseOpenCommentsAction(state: Pick<StreamShortVideoSocialCommentsState, "commentsOpenLocal">): boolean {
  return state.commentsOpenLocal;
}

function cleanShortVideoCommentText(text: string): string {
  return text.replace(/\s+/g, " ").trim().slice(0, 240);
}

function resolveActiveReplyDraftCommentLocal(
  comments: readonly StreamShortVideoLocalComment[],
): StreamShortVideoLocalComment | null {
  return comments.find((comment) => comment.replyDraftLocal && canUseCommentAction(comment)) ?? null;
}

function hasDuplicateUsableLocalComment(
  comments: readonly StreamShortVideoLocalComment[],
  cleanText: string,
  replyToCommentIdLocal: string | null,
): boolean {
  const normalizedText = cleanText.toLowerCase();
  return comments.some(
    (comment) =>
      canUseCommentAction(comment) &&
      comment.text.trim().toLowerCase() === normalizedText &&
      (comment.replyToCommentIdLocal ?? null) === replyToCommentIdLocal,
  );
}

export function canAddStreamShortVideoCommentLocal(
  state: Pick<StreamShortVideoSocialCommentsState, "comments">,
  text: string,
  replyToCommentIdLocal: string | null = null,
): boolean {
  const cleanText = cleanShortVideoCommentText(text);
  return Boolean(cleanText) && !hasDuplicateUsableLocalComment(state.comments, cleanText, replyToCommentIdLocal);
}

export function canSendStreamShortVideoCommentDraftLocal(
  state: Pick<StreamShortVideoSocialCommentsState, "comments" | "commentsOpenLocal">,
  text: string,
): boolean {
  const activeReplyDraftComment = resolveActiveReplyDraftCommentLocal(state.comments);
  return canUseOpenCommentsAction(state) && canAddStreamShortVideoCommentLocal(state, text, activeReplyDraftComment?.id ?? null);
}

function isModerationEvidenceComment(comment: StreamShortVideoLocalComment): boolean {
  return comment.status === "reported_local" || comment.status === "hidden_local";
}

function limitShortVideoLocalCommentsForModerationEvidence(
  comments: readonly StreamShortVideoLocalComment[],
): readonly StreamShortVideoLocalComment[] {
  const keptUsableIds = new Set(
    comments
      .filter((comment) => !isModerationEvidenceComment(comment))
      .slice(0, MAX_USABLE_LOCAL_COMMENTS)
      .map((comment) => comment.id),
  );
  const keptEvidenceIds = new Set(comments.filter(isModerationEvidenceComment).map((comment) => comment.id));

  return comments.filter((comment) => keptUsableIds.has(comment.id) || keptEvidenceIds.has(comment.id));
}

function createShortVideoLocalCommentId(comments: readonly StreamShortVideoLocalComment[]): string {
  const existingIds = new Set(comments.map((comment) => comment.id));
  const baseId = `short-local-comment-${Date.now()}`;
  if (!existingIds.has(baseId)) {
    return baseId;
  }

  for (let index = 1; index <= 100; index += 1) {
    const candidateId = `${baseId}-${index}`;
    if (!existingIds.has(candidateId)) {
      return candidateId;
    }
  }

  return `short-local-comment-${Date.now()}-${comments.length + 1}`;
}

function resolveSelectedCommentId(
  comments: readonly StreamShortVideoLocalComment[],
  preferredCommentId: string | null,
): string | null {
  const preferred = comments.find((comment) => comment.id === preferredCommentId);
  if (preferred && isSelectableComment(preferred)) {
    return preferred.id;
  }

  return comments.find(isSelectableComment)?.id ?? null;
}

function resolveSelectedCommentIdOrClear(
  comments: readonly StreamShortVideoLocalComment[],
  preferredCommentId: string | null,
): string | null {
  const preferred = comments.find((comment) => comment.id === preferredCommentId);
  return preferred && isSelectableComment(preferred) ? preferred.id : null;
}

function buildEvidence(state: Omit<StreamShortVideoSocialCommentsState, "evidence">): StreamShortVideoSocialCommentsEvidence {
  return {
    likedLocal: state.likedLocal,
    savedLocal: state.savedLocal,
    shareDraftPreparedLocal: state.shareDraftPreparedLocal,
    commentsOpenLocal: state.commentsOpenLocal,
    commentsCountLocal: state.comments.filter(isVisibleComment).length,
    pinnedCommentsLocal: state.comments.filter((comment) => comment.status === "pinned_local").length,
    reportedCommentsLocal: state.comments.filter((comment) => comment.status === "reported_local").length,
    hiddenCommentsLocal: state.comments.filter((comment) => comment.status === "hidden_local").length,
    queuedCommentEventsLocal: state.queuedCommentEventsLocal,
    queuedSocialEventsLocal: state.queuedSocialEventsLocal,
    providerBlockers,
    fakeLikeAllowed: false,
    fakeCommentDeliveryAllowed: false,
    fakeShareDeliveryAllowed: false,
    fakeSaveProviderAllowed: false,
  };
}

function withEvidence(state: Omit<StreamShortVideoSocialCommentsState, "evidence">): StreamShortVideoSocialCommentsState {
  return { ...state, evidence: buildEvidence(state) };
}

export function createInitialStreamShortVideoSocialCommentsState(): StreamShortVideoSocialCommentsState {
  return withEvidence({
    comments: [],
    selectedCommentId: null,
    likedLocal: false,
    savedLocal: false,
    shareDraftPreparedLocal: false,
    commentsOpenLocal: false,
    queuedCommentEventsLocal: 0,
    queuedSocialEventsLocal: 0,
    lastQueuedCommentFingerprintLocal: null,
    lastQueuedSocialFingerprintLocal: null,
    updatedAt: nowIso(),
  });
}

export function openStreamShortVideoCommentsLocal(state: StreamShortVideoSocialCommentsState): StreamShortVideoSocialCommentsState {
  const selectedCommentId = resolveSelectedCommentIdOrClear(state.comments, state.selectedCommentId);
  if (state.commentsOpenLocal && state.selectedCommentId === selectedCommentId) {
    return state;
  }

  return withEvidence({ ...state, commentsOpenLocal: true, selectedCommentId, updatedAt: nowIso() });
}

function clearShortVideoCommentReplyDrafts(
  comments: readonly StreamShortVideoLocalComment[],
): { readonly comments: readonly StreamShortVideoLocalComment[]; readonly changed: boolean } {
  let changed = false;
  const nextComments = comments.map((comment) => {
    if (!comment.replyDraftLocal) {
      return comment;
    }

    changed = true;
    return { ...comment, replyDraftLocal: false };
  });

  return { comments: changed ? nextComments : comments, changed };
}

export function closeStreamShortVideoCommentsLocal(state: StreamShortVideoSocialCommentsState): StreamShortVideoSocialCommentsState {
  const replyDraftCleanup = clearShortVideoCommentReplyDrafts(state.comments);
  if (!state.commentsOpenLocal && state.selectedCommentId === null && !replyDraftCleanup.changed) {
    return state;
  }

  const comments = replyDraftCleanup.comments;
  return withEvidence({
    ...state,
    comments,
    commentsOpenLocal: false,
    selectedCommentId: null,
    queuedCommentEventsLocal: state.queuedCommentEventsLocal,
    lastQueuedCommentFingerprintLocal: replyDraftCleanup.changed ? buildCommentsFingerprint(comments) : state.lastQueuedCommentFingerprintLocal,
    updatedAt: nowIso(),
  });
}

function withQueuedSocialSnapshot(state: Omit<StreamShortVideoSocialCommentsState, "evidence">): StreamShortVideoSocialCommentsState {
  const socialFingerprint = buildSocialFingerprint(state);
  if (!hasAnySocialDraft(state)) {
    return withEvidence({ ...state, lastQueuedSocialFingerprintLocal: null });
  }

  if (state.lastQueuedSocialFingerprintLocal === socialFingerprint) {
    return withEvidence(state);
  }

  return withEvidence({
    ...state,
    queuedSocialEventsLocal: state.queuedSocialEventsLocal + 1,
    lastQueuedSocialFingerprintLocal: socialFingerprint,
  });
}

export function toggleStreamShortVideoSocialLikeLocal(state: StreamShortVideoSocialCommentsState): StreamShortVideoSocialCommentsState {
  return withQueuedSocialSnapshot({ ...state, likedLocal: !state.likedLocal, updatedAt: nowIso() });
}

export function toggleStreamShortVideoSocialSaveLocal(state: StreamShortVideoSocialCommentsState): StreamShortVideoSocialCommentsState {
  return withQueuedSocialSnapshot({ ...state, savedLocal: !state.savedLocal, updatedAt: nowIso() });
}

export function prepareStreamShortVideoSocialShareDraftLocal(state: StreamShortVideoSocialCommentsState): StreamShortVideoSocialCommentsState {
  if (state.shareDraftPreparedLocal) {
    return state;
  }

  return withQueuedSocialSnapshot({ ...state, shareDraftPreparedLocal: true, updatedAt: nowIso() });
}

export function clearStreamShortVideoSocialShareDraftLocal(state: StreamShortVideoSocialCommentsState): StreamShortVideoSocialCommentsState {
  if (!state.shareDraftPreparedLocal) {
    return state;
  }

  return withQueuedSocialSnapshot({ ...state, shareDraftPreparedLocal: false, updatedAt: nowIso() });
}

export function queueStreamShortVideoSocialLocalEvent(state: StreamShortVideoSocialCommentsState): StreamShortVideoSocialCommentsState {
  const socialFingerprint = buildSocialFingerprint(state);
  if (!hasAnySocialDraft(state)) {
    if (state.lastQueuedSocialFingerprintLocal === null) {
      return state;
    }

    return withEvidence({
      ...state,
      lastQueuedSocialFingerprintLocal: null,
      updatedAt: nowIso(),
    });
  }

  if (state.lastQueuedSocialFingerprintLocal === socialFingerprint) {
    return state;
  }

  return withEvidence({
    ...state,
    queuedSocialEventsLocal: state.queuedSocialEventsLocal + 1,
    lastQueuedSocialFingerprintLocal: socialFingerprint,
    updatedAt: nowIso(),
  });
}

export function addStreamShortVideoCommentLocal(state: StreamShortVideoSocialCommentsState, text: string): StreamShortVideoSocialCommentsState {
  if (!canUseOpenCommentsAction(state)) {
    return state;
  }

  const cleanText = cleanShortVideoCommentText(text);
  const activeReplyDraftComment = resolveActiveReplyDraftCommentLocal(state.comments);
  if (!cleanText || !canAddStreamShortVideoCommentLocal(state, cleanText, activeReplyDraftComment?.id ?? null)) {
    return state;
  }

  const comment: StreamShortVideoLocalComment = {
    id: createShortVideoLocalCommentId(state.comments),
    author: "Вы",
    text: cleanText,
    status: "local_only",
    likedLocal: false,
    replyDraftLocal: false,
    replyToCommentIdLocal: activeReplyDraftComment?.id ?? null,
    replyToTextLocal: activeReplyDraftComment?.text ?? null,
    createdAt: nowIso(),
    deliveredToProvider: false,
  };
  const commentsWithConsumedReplyDraft = state.comments.map((existingComment) => {
    if (!existingComment.replyDraftLocal) {
      return existingComment;
    }

    return { ...existingComment, replyDraftLocal: false };
  });
  const comments = limitShortVideoLocalCommentsForModerationEvidence([comment, ...commentsWithConsumedReplyDraft]);
  return withEvidence({
    ...state,
    comments,
    commentsOpenLocal: true,
    selectedCommentId: null,
    queuedCommentEventsLocal: state.queuedCommentEventsLocal + 1,
    lastQueuedCommentFingerprintLocal: buildCommentsFingerprint(comments),
    updatedAt: nowIso(),
  });
}

function updateComment(
  state: StreamShortVideoSocialCommentsState,
  commentId: string,
  updater: (comment: StreamShortVideoLocalComment) => StreamShortVideoLocalComment,
): StreamShortVideoSocialCommentsState {
  const target = state.comments.find((comment) => comment.id === commentId);
  if (!target) {
    return state;
  }

  const updatedTarget = updater(target);
  if (updatedTarget === target) {
    return state;
  }

  const comments = state.comments.map((comment) => (comment.id === commentId ? updatedTarget : comment));
  const selectedCommentId = resolveSelectedCommentIdOrClear(comments, state.selectedCommentId);
  return withEvidence({
    ...state,
    comments,
    selectedCommentId,
    queuedCommentEventsLocal: state.queuedCommentEventsLocal + 1,
    lastQueuedCommentFingerprintLocal: buildCommentsFingerprint(comments),
    updatedAt: nowIso(),
  });
}

export function selectStreamShortVideoCommentLocal(state: StreamShortVideoSocialCommentsState, commentId: string): StreamShortVideoSocialCommentsState {
  if (
    !canUseOpenCommentsAction(state) ||
    state.selectedCommentId === commentId ||
    !state.comments.some((comment) => comment.id === commentId && isSelectableComment(comment))
  ) {
    return state;
  }

  return withEvidence({ ...state, selectedCommentId: commentId, updatedAt: nowIso() });
}

export function toggleStreamShortVideoCommentLikeLocal(state: StreamShortVideoSocialCommentsState, commentId: string): StreamShortVideoSocialCommentsState {
  if (!canUseOpenCommentsAction(state)) {
    return state;
  }

  return updateComment(state, commentId, (comment) => {
    if (!canUseCommentAction(comment)) {
      return comment;
    }

    return { ...comment, likedLocal: !comment.likedLocal };
  });
}

export function markStreamShortVideoCommentReplyDraftLocal(state: StreamShortVideoSocialCommentsState, commentId: string): StreamShortVideoSocialCommentsState {
  if (!canUseOpenCommentsAction(state)) {
    return state;
  }

  const target = state.comments.find((comment) => comment.id === commentId);
  if (!target || !canUseCommentAction(target)) {
    return state;
  }

  let changed = false;
  const comments = state.comments.map((comment) => {
    if (!canUseCommentAction(comment)) {
      if (!comment.replyDraftLocal) {
        return comment;
      }

      changed = true;
      return { ...comment, replyDraftLocal: false };
    }

    if (comment.id === commentId) {
      if (comment.replyDraftLocal) {
        return comment;
      }

      changed = true;
      return { ...comment, replyDraftLocal: true };
    }

    if (!comment.replyDraftLocal) {
      return comment;
    }

    changed = true;
    return { ...comment, replyDraftLocal: false };
  });

  if (!changed) {
    return state;
  }

  return withEvidence({
    ...state,
    comments,
    selectedCommentId: resolveSelectedCommentIdOrClear(comments, state.selectedCommentId),
    queuedCommentEventsLocal: state.queuedCommentEventsLocal,
    lastQueuedCommentFingerprintLocal: buildCommentsFingerprint(comments),
    updatedAt: nowIso(),
  });
}

export function clearStreamShortVideoCommentReplyDraftLocal(state: StreamShortVideoSocialCommentsState, commentId: string): StreamShortVideoSocialCommentsState {
  if (!canUseOpenCommentsAction(state)) {
    return state;
  }

  const target = state.comments.find((comment) => comment.id === commentId);
  if (!target || !canUseCommentAction(target) || !target.replyDraftLocal) {
    return state;
  }

  const comments = state.comments.map((comment) => (comment.id === commentId ? { ...comment, replyDraftLocal: false } : comment));
  return withEvidence({
    ...state,
    comments,
    selectedCommentId: resolveSelectedCommentIdOrClear(comments, state.selectedCommentId),
    queuedCommentEventsLocal: state.queuedCommentEventsLocal,
    lastQueuedCommentFingerprintLocal: buildCommentsFingerprint(comments),
    updatedAt: nowIso(),
  });
}

export function pinStreamShortVideoCommentLocal(state: StreamShortVideoSocialCommentsState, commentId: string): StreamShortVideoSocialCommentsState {
  if (!canUseOpenCommentsAction(state)) {
    return state;
  }

  const target = state.comments.find((comment) => comment.id === commentId);
  if (!target || target.status === "pinned_local" || !canUseCommentAction(target)) {
    return state;
  }

  const comments = state.comments.map((comment) => {
    if (comment.id === commentId) {
      return { ...comment, status: "pinned_local" as const };
    }

    if (comment.status === "pinned_local") {
      return { ...comment, status: "local_only" as const };
    }

    return comment;
  });

  return withEvidence({
    ...state,
    comments,
    selectedCommentId: resolveSelectedCommentIdOrClear(comments, state.selectedCommentId),
    queuedCommentEventsLocal: state.queuedCommentEventsLocal + 1,
    lastQueuedCommentFingerprintLocal: buildCommentsFingerprint(comments),
    updatedAt: nowIso(),
  });
}

function canReportCommentLocal(comment: StreamShortVideoLocalComment): boolean {
  return comment.status === "local_only" || comment.status === "pinned_local";
}

export function reportStreamShortVideoCommentLocal(state: StreamShortVideoSocialCommentsState, commentId: string): StreamShortVideoSocialCommentsState {
  if (!canUseOpenCommentsAction(state)) {
    return state;
  }

  return updateComment(state, commentId, (comment) => {
    if (!canReportCommentLocal(comment)) {
      return comment;
    }

    return {
      ...comment,
      status: "reported_local",
      likedLocal: false,
      replyDraftLocal: false,
    };
  });
}

function canHideCommentLocal(comment: StreamShortVideoLocalComment): boolean {
  return comment.status === "local_only" || comment.status === "pinned_local";
}

export function hideStreamShortVideoCommentLocal(state: StreamShortVideoSocialCommentsState, commentId: string): StreamShortVideoSocialCommentsState {
  if (!canUseOpenCommentsAction(state)) {
    return state;
  }

  return updateComment(state, commentId, (comment) => {
    if (!canHideCommentLocal(comment)) {
      return comment;
    }

    return {
      ...comment,
      status: "hidden_local",
      likedLocal: false,
      replyDraftLocal: false,
    };
  });
}

export function queueStreamShortVideoCommentsLocalEvent(state: StreamShortVideoSocialCommentsState): StreamShortVideoSocialCommentsState {
  if (!canUseOpenCommentsAction(state) || state.comments.length === 0) {
    return state;
  }

  const commentFingerprint = buildCommentsFingerprint(state.comments);
  if (state.lastQueuedCommentFingerprintLocal === commentFingerprint) {
    return state;
  }

  return withEvidence({
    ...state,
    queuedCommentEventsLocal: state.queuedCommentEventsLocal + 1,
    lastQueuedCommentFingerprintLocal: commentFingerprint,
    updatedAt: nowIso(),
  });
}

export function requestStreamShortVideoCommentsProviderBlocked(state: StreamShortVideoSocialCommentsState): StreamShortVideoSocialCommentsState {
  return state;
}
