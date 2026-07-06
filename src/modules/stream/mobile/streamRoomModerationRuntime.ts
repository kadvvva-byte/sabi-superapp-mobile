import type { StreamRoomRuntimeState } from "./streamRoomRuntime";

export type StreamCommentModerationAction = "pin" | "unpin" | "hide" | "restore" | "report" | "approve_report" | "dismiss_report";
export type StreamParticipantModerationAction = "mute" | "unmute" | "block" | "unblock" | "promote_moderator" | "demote_moderator";
export type StreamLocalReportStatus = "pending_local" | "reviewed_local" | "dismissed_local";

export type StreamLocalCommentReport = {
  readonly id: string;
  readonly commentId: string;
  readonly participantId: string;
  readonly reason: "spam" | "abuse" | "unsafe_content" | "manual_review";
  readonly status: StreamLocalReportStatus;
  readonly createdAt: string;
  readonly reviewedAt: string | null;
  readonly localOnly: true;
  readonly deliveredToBackend: false;
};

export type StreamParticipantModerationRecord = {
  readonly participantId: string;
  readonly muted: boolean;
  readonly blocked: boolean;
  readonly moderator: boolean;
  readonly updatedAt: string;
  readonly localOnly: true;
};

export type StreamRoomModerationActionLogEntry = {
  readonly id: string;
  readonly action: StreamCommentModerationAction | StreamParticipantModerationAction | "policy_updated" | "moderation_synced";
  readonly targetId: string;
  readonly createdAt: string;
  readonly backendDelivered: false;
};

export type StreamRoomModerationRuntimeState = {
  readonly version: "STREAM-108U";
  readonly roomId: string;
  readonly commentsLocked: boolean;
  readonly slowModeSeconds: number;
  readonly blockedTerms: readonly string[];
  readonly pinnedCommentId: string | null;
  readonly hiddenCommentIds: readonly string[];
  readonly approvedCommentIds: readonly string[];
  readonly reportQueue: readonly StreamLocalCommentReport[];
  readonly participantControls: readonly StreamParticipantModerationRecord[];
  readonly actionLog: readonly StreamRoomModerationActionLogEntry[];
  readonly backendModerationQueue: "not_connected";
  readonly adminReviewQueue: "local_draft_only";
  readonly fakeAutoModerationAllowed: false;
  readonly fakeBackendReportDeliveryAllowed: false;
  readonly fakeCommentDeliveryAllowed: false;
};

export type StreamRoomModerationEvidenceSnapshot = {
  readonly version: "STREAM-108U";
  readonly roomId: string;
  readonly totalComments: number;
  readonly visibleComments: number;
  readonly pinnedCommentId: string | null;
  readonly hiddenComments: number;
  readonly reportsTotal: number;
  readonly reportsPending: number;
  readonly mutedParticipants: number;
  readonly blockedParticipants: number;
  readonly localModerators: number;
  readonly commentsLocked: boolean;
  readonly slowModeSeconds: number;
  readonly backendModerationQueue: "not_connected";
  readonly adminReviewQueue: "local_draft_only";
  readonly readyForBackendUnion: boolean;
  readonly fakeAutoModerationAllowed: false;
  readonly fakeBackendReportDeliveryAllowed: false;
  readonly fakeCommentDeliveryAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftAllowed: false;
};

const MAX_ACTION_LOG = 60;
const MAX_REPORT_QUEUE = 80;
const MAX_BLOCKED_TERMS = 24;

function nowIso(now?: Date | string | number): string {
  if (now instanceof Date) return now.toISOString();
  if (typeof now === "string") return new Date(now).toISOString();
  if (typeof now === "number") return new Date(now).toISOString();
  return new Date().toISOString();
}

function createId(prefix: string, now?: Date | string | number): string {
  const stamp = nowIso(now).replace(/[^0-9]/g, "").slice(0, 17);
  return `${prefix}-${stamp}`;
}

function uniqueList(items: readonly string[]): readonly string[] {
  return Array.from(new Set(items.filter(Boolean)));
}

function normalizeTerm(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function appendAction(
  state: StreamRoomModerationRuntimeState,
  action: StreamRoomModerationActionLogEntry["action"],
  targetId: string,
  now?: Date | string | number,
): StreamRoomModerationRuntimeState {
  const createdAt = nowIso(now);
  return {
    ...state,
    actionLog: [
      { id: `${action}-${targetId}-${createdAt}`, action, targetId, createdAt, backendDelivered: false as const },
      ...state.actionLog,
    ].slice(0, MAX_ACTION_LOG),
  };
}

function upsertParticipantControl(
  state: StreamRoomModerationRuntimeState,
  participantId: string,
  patch: Partial<Omit<StreamParticipantModerationRecord, "participantId" | "updatedAt" | "localOnly">>,
  now?: Date | string | number,
): StreamRoomModerationRuntimeState {
  const updatedAt = nowIso(now);
  const existing = state.participantControls.find((item) => item.participantId === participantId);
  const nextRecord: StreamParticipantModerationRecord = {
    participantId,
    muted: patch.muted ?? existing?.muted ?? false,
    blocked: patch.blocked ?? existing?.blocked ?? false,
    moderator: patch.moderator ?? existing?.moderator ?? false,
    updatedAt,
    localOnly: true,
  };
  const participantControls = existing
    ? state.participantControls.map((item) => (item.participantId === participantId ? nextRecord : item))
    : [nextRecord, ...state.participantControls];
  return { ...state, participantControls };
}

export function createInitialStreamRoomModerationState(roomId: string, now?: Date | string | number): StreamRoomModerationRuntimeState {
  const state: StreamRoomModerationRuntimeState = {
    version: "STREAM-108U",
    roomId,
    commentsLocked: false,
    slowModeSeconds: 0,
    blockedTerms: [],
    pinnedCommentId: null,
    hiddenCommentIds: [],
    approvedCommentIds: [],
    reportQueue: [],
    participantControls: [],
    actionLog: [],
    backendModerationQueue: "not_connected",
    adminReviewQueue: "local_draft_only",
    fakeAutoModerationAllowed: false,
    fakeBackendReportDeliveryAllowed: false,
    fakeCommentDeliveryAllowed: false,
  };
  return appendAction(state, "moderation_synced", roomId, now);
}

export function syncStreamRoomModerationState(
  state: StreamRoomModerationRuntimeState,
  room: StreamRoomRuntimeState,
  now?: Date | string | number,
): StreamRoomModerationRuntimeState {
  const commentIds = new Set(room.comments.map((comment) => comment.id));
  const participantIds = new Set(room.participants.map((participant) => participant.id));
  const pinnedCommentId = state.pinnedCommentId && commentIds.has(state.pinnedCommentId) ? state.pinnedCommentId : null;
  const hiddenCommentIds = state.hiddenCommentIds.filter((id) => commentIds.has(id));
  const approvedCommentIds = state.approvedCommentIds.filter((id) => commentIds.has(id));
  const reportQueue = state.reportQueue.filter((report) => commentIds.has(report.commentId));
  const participantControls = state.participantControls.filter((record) => participantIds.has(record.participantId));
  const next = { ...state, roomId: room.roomId, pinnedCommentId, hiddenCommentIds, approvedCommentIds, reportQueue, participantControls };
  if (next === state) return state;
  return appendAction(next, "moderation_synced", room.roomId, now);
}

export function setLocalStreamCommentPolicy(
  state: StreamRoomModerationRuntimeState,
  patch: { readonly commentsLocked?: boolean; readonly slowModeSeconds?: number; readonly blockedTerms?: readonly string[] },
  now?: Date | string | number,
): StreamRoomModerationRuntimeState {
  const blockedTerms = patch.blockedTerms
    ? uniqueList(patch.blockedTerms.map(normalizeTerm)).slice(0, MAX_BLOCKED_TERMS)
    : state.blockedTerms;
  const slowModeSeconds = Math.max(0, Math.min(120, Math.floor(patch.slowModeSeconds ?? state.slowModeSeconds)));
  return appendAction(
    { ...state, commentsLocked: patch.commentsLocked ?? state.commentsLocked, slowModeSeconds, blockedTerms },
    "policy_updated",
    state.roomId,
    now,
  );
}

export function pinLocalStreamComment(
  state: StreamRoomModerationRuntimeState,
  room: StreamRoomRuntimeState,
  commentId: string,
  now?: Date | string | number,
): StreamRoomModerationRuntimeState {
  if (!room.comments.some((comment) => comment.id === commentId)) return appendAction(state, "pin", commentId, now);
  return appendAction({ ...state, pinnedCommentId: commentId, hiddenCommentIds: state.hiddenCommentIds.filter((id) => id !== commentId) }, "pin", commentId, now);
}

export function unpinLocalStreamComment(state: StreamRoomModerationRuntimeState, commentId: string, now?: Date | string | number): StreamRoomModerationRuntimeState {
  return appendAction({ ...state, pinnedCommentId: state.pinnedCommentId === commentId ? null : state.pinnedCommentId }, "unpin", commentId, now);
}

export function hideLocalStreamComment(
  state: StreamRoomModerationRuntimeState,
  room: StreamRoomRuntimeState,
  commentId: string,
  now?: Date | string | number,
): StreamRoomModerationRuntimeState {
  if (!room.comments.some((comment) => comment.id === commentId)) return appendAction(state, "hide", commentId, now);
  return appendAction(
    { ...state, hiddenCommentIds: uniqueList([commentId, ...state.hiddenCommentIds]), pinnedCommentId: state.pinnedCommentId === commentId ? null : state.pinnedCommentId },
    "hide",
    commentId,
    now,
  );
}

export function restoreLocalStreamComment(state: StreamRoomModerationRuntimeState, commentId: string, now?: Date | string | number): StreamRoomModerationRuntimeState {
  return appendAction({ ...state, hiddenCommentIds: state.hiddenCommentIds.filter((id) => id !== commentId) }, "restore", commentId, now);
}

export function reportLocalStreamComment(
  state: StreamRoomModerationRuntimeState,
  room: StreamRoomRuntimeState,
  commentId: string,
  reason: StreamLocalCommentReport["reason"] = "manual_review",
  now?: Date | string | number,
): StreamRoomModerationRuntimeState {
  const comment = room.comments.find((item) => item.id === commentId);
  if (!comment) return appendAction(state, "report", commentId, now);
  const createdAt = nowIso(now);
  const report: StreamLocalCommentReport = {
    id: createId("local-comment-report", now),
    commentId,
    participantId: comment.participantId,
    reason,
    status: "pending_local",
    createdAt,
    reviewedAt: null,
    localOnly: true,
    deliveredToBackend: false,
  };
  return appendAction({ ...state, reportQueue: [report, ...state.reportQueue].slice(0, MAX_REPORT_QUEUE) }, "report", commentId, now);
}

export function reviewLocalStreamCommentReport(
  state: StreamRoomModerationRuntimeState,
  reportId: string,
  decision: "approve" | "dismiss",
  now?: Date | string | number,
): StreamRoomModerationRuntimeState {
  const reviewedAt = nowIso(now);
  const report = state.reportQueue.find((item) => item.id === reportId);
  const reportQueue = state.reportQueue.map((item) =>
    item.id === reportId
      ? { ...item, status: (decision === "approve" ? "reviewed_local" : "dismissed_local") as StreamLocalReportStatus, reviewedAt }
      : item,
  );
  const approvedCommentIds = decision === "approve" && report ? uniqueList([report.commentId, ...state.approvedCommentIds]) : state.approvedCommentIds;
  return appendAction({ ...state, reportQueue, approvedCommentIds }, decision === "approve" ? "approve_report" : "dismiss_report", reportId, now);
}

export function applyLocalParticipantModeration(
  state: StreamRoomModerationRuntimeState,
  participantId: string,
  action: StreamParticipantModerationAction,
  now?: Date | string | number,
): StreamRoomModerationRuntimeState {
  const existing = state.participantControls.find((item) => item.participantId === participantId);
  let next = state;
  if (action === "mute") next = upsertParticipantControl(state, participantId, { muted: true }, now);
  if (action === "unmute") next = upsertParticipantControl(state, participantId, { muted: false }, now);
  if (action === "block") next = upsertParticipantControl(state, participantId, { blocked: true, muted: true }, now);
  if (action === "unblock") next = upsertParticipantControl(state, participantId, { blocked: false }, now);
  if (action === "promote_moderator") next = upsertParticipantControl(state, participantId, { moderator: true }, now);
  if (action === "demote_moderator") next = upsertParticipantControl(state, participantId, { moderator: false }, now);
  if (next === state && !existing) next = upsertParticipantControl(state, participantId, {}, now);
  return appendAction(next, action, participantId, now);
}

export function isLocalStreamCommentPinned(state: StreamRoomModerationRuntimeState, commentId: string): boolean {
  return state.pinnedCommentId === commentId;
}

export function isLocalStreamCommentHidden(state: StreamRoomModerationRuntimeState, commentId: string): boolean {
  return state.hiddenCommentIds.includes(commentId);
}

export function buildStreamRoomModerationEvidenceSnapshot(
  state: StreamRoomModerationRuntimeState,
  room: StreamRoomRuntimeState,
): StreamRoomModerationEvidenceSnapshot {
  const hidden = new Set(state.hiddenCommentIds);
  const visibleComments = room.comments.filter((comment) => !hidden.has(comment.id)).length;
  const reportsPending = state.reportQueue.filter((report) => report.status === "pending_local").length;
  return {
    version: "STREAM-108U",
    roomId: room.roomId,
    totalComments: room.comments.length,
    visibleComments,
    pinnedCommentId: state.pinnedCommentId,
    hiddenComments: state.hiddenCommentIds.length,
    reportsTotal: state.reportQueue.length,
    reportsPending,
    mutedParticipants: state.participantControls.filter((item) => item.muted).length,
    blockedParticipants: state.participantControls.filter((item) => item.blocked).length,
    localModerators: state.participantControls.filter((item) => item.moderator).length,
    commentsLocked: state.commentsLocked,
    slowModeSeconds: state.slowModeSeconds,
    backendModerationQueue: "not_connected",
    adminReviewQueue: "local_draft_only",
    readyForBackendUnion: true,
    fakeAutoModerationAllowed: false,
    fakeBackendReportDeliveryAllowed: false,
    fakeCommentDeliveryAllowed: false,
    fakePaymentAllowed: false,
    fakeGiftAllowed: false,
  };
}
