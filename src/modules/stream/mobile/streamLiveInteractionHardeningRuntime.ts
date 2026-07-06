import type { StreamRoomRuntimeState } from "./streamRoomRuntime";
import type { StreamRoomModerationRuntimeState } from "./streamRoomModerationRuntime";
import type { StreamParticipantManagementRuntimeState } from "./streamRoomParticipantRuntime";
import type { StreamRoomStageRuntimeState } from "./streamRoomStageRuntime";

export type StreamLiveInteractionHardeningStatus =
  | "idle_local"
  | "synced_local"
  | "comment_guard_ready_local"
  | "interaction_checked_local"
  | "moderation_attention_required"
  | "provider_delivery_blocked";

export type StreamLiveInteractionHardeningBlockerCode =
  | "interaction_room_required"
  | "interaction_host_required"
  | "interaction_comment_text_required"
  | "interaction_comments_locked"
  | "interaction_blocked_term_detected"
  | "interaction_comments_rail_hidden"
  | "interaction_participants_rail_hidden"
  | "interaction_moderation_rail_hidden"
  | "interaction_pending_report_review_required"
  | "interaction_blocked_participant_selected"
  | "interaction_kicked_participant_selected"
  | "interaction_backend_comment_contract_required"
  | "interaction_realtime_comment_provider_required"
  | "interaction_backend_moderation_queue_required"
  | "interaction_admin_review_queue_required";

export type StreamLiveInteractionHardeningActionLogEntry = {
  readonly id: string;
  readonly action: string;
  readonly status: StreamLiveInteractionHardeningStatus;
  readonly createdAt: string;
  readonly blockers: readonly StreamLiveInteractionHardeningBlockerCode[];
  readonly backendDelivered: false;
};

export type StreamLiveInteractionHardeningRuntimeState = {
  readonly version: "STREAM-109D";
  readonly roomId: string;
  readonly status: StreamLiveInteractionHardeningStatus;
  readonly commentDraft: string;
  readonly selectedParticipantId: string | null;
  readonly selectedCommentId: string | null;
  readonly policyAcknowledgedLocal: boolean;
  readonly commentGuardCheckedLocal: boolean;
  readonly interactionCheckRanLocal: boolean;
  readonly providerDeliveryRequestedLocal: boolean;
  readonly backendCommentContract: "not_connected";
  readonly realtimeCommentProvider: "not_configured";
  readonly backendModerationQueue: "not_connected";
  readonly adminReviewQueue: "local_draft_only";
  readonly fakeCommentDeliveryAllowed: false;
  readonly fakeRealtimeAllowed: false;
  readonly fakeBackendModerationAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftAllowed: false;
  readonly actionLog: readonly StreamLiveInteractionHardeningActionLogEntry[];
};

export type StreamLiveInteractionEvidenceSnapshot = {
  readonly version: "STREAM-109D";
  readonly roomId: string;
  readonly status: StreamLiveInteractionHardeningStatus;
  readonly commentDraftReady: boolean;
  readonly selectedParticipantId: string | null;
  readonly selectedCommentId: string | null;
  readonly policyAcknowledgedLocal: boolean;
  readonly commentGuardCheckedLocal: boolean;
  readonly interactionCheckRanLocal: boolean;
  readonly providerDeliveryRequestedLocal: boolean;
  readonly commentsRailVisible: boolean;
  readonly participantsRailVisible: boolean;
  readonly moderationRailVisible: boolean;
  readonly totalComments: number;
  readonly visibleComments: number;
  readonly totalParticipants: number;
  readonly pendingReports: number;
  readonly mutedParticipants: number;
  readonly blockedParticipants: number;
  readonly localBlockers: readonly StreamLiveInteractionHardeningBlockerCode[];
  readonly providerBlockers: readonly StreamLiveInteractionHardeningBlockerCode[];
  readonly backendCommentContract: "not_connected";
  readonly realtimeCommentProvider: "not_configured";
  readonly backendModerationQueue: "not_connected";
  readonly adminReviewQueue: "local_draft_only";
  readonly readyForBackendUnion: boolean;
  readonly readyForProviderDelivery: false;
  readonly fakeCommentDeliveryAllowed: false;
  readonly fakeRealtimeAllowed: false;
  readonly fakeBackendModerationAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftAllowed: false;
};

const MAX_INTERACTION_LOG = 60;

function nowIso(now?: Date | string | number): string {
  if (now instanceof Date) return now.toISOString();
  if (typeof now === "string") return new Date(now).toISOString();
  if (typeof now === "number") return new Date(now).toISOString();
  return new Date().toISOString();
}

function normalizeText(value: string | null | undefined): string {
  return String(value ?? "").trim().replace(/\s+/g, " ");
}

function appendInteractionLog(
  state: StreamLiveInteractionHardeningRuntimeState,
  action: string,
  status: StreamLiveInteractionHardeningStatus,
  blockers: readonly StreamLiveInteractionHardeningBlockerCode[] = [],
  now?: Date | string | number,
): StreamLiveInteractionHardeningRuntimeState {
  const createdAt = nowIso(now);
  return {
    ...state,
    status,
    actionLog: [
      { id: `${action}-${createdAt}`, action, status, createdAt, blockers, backendDelivered: false as const },
      ...state.actionLog,
    ].slice(0, MAX_INTERACTION_LOG),
  };
}

function hasHost(room: StreamRoomRuntimeState): boolean {
  return room.participants.some((participant) => participant.role === "host" && !participant.blocked);
}

function selectedParticipantBlocked(
  state: StreamLiveInteractionHardeningRuntimeState,
  room: StreamRoomRuntimeState,
  moderation: StreamRoomModerationRuntimeState,
): boolean {
  if (!state.selectedParticipantId) return false;
  const participant = room.participants.find((item) => item.id === state.selectedParticipantId);
  const control = moderation.participantControls.find((item) => item.participantId === state.selectedParticipantId);
  return Boolean(participant?.blocked || control?.blocked);
}

function selectedParticipantKicked(
  state: StreamLiveInteractionHardeningRuntimeState,
  participants: StreamParticipantManagementRuntimeState,
): boolean {
  if (!state.selectedParticipantId) return false;
  return participants.visibilityRecords.some((item) => item.participantId === state.selectedParticipantId && item.visibility === "kicked_local");
}

function localBlockersFor(
  state: StreamLiveInteractionHardeningRuntimeState,
  room: StreamRoomRuntimeState,
  moderation: StreamRoomModerationRuntimeState,
  participants: StreamParticipantManagementRuntimeState,
  stage: StreamRoomStageRuntimeState,
): readonly StreamLiveInteractionHardeningBlockerCode[] {
  const blockers: StreamLiveInteractionHardeningBlockerCode[] = [];
  const commentDraft = normalizeText(state.commentDraft);
  const commentDraftLower = commentDraft.toLowerCase();
  if (!room.roomId) blockers.push("interaction_room_required");
  if (!hasHost(room)) blockers.push("interaction_host_required");
  if (!commentDraft) blockers.push("interaction_comment_text_required");
  if (moderation.commentsLocked) blockers.push("interaction_comments_locked");
  if (commentDraft && moderation.blockedTerms.some((term) => commentDraftLower.includes(term))) blockers.push("interaction_blocked_term_detected");
  if (!stage.commentsVisible) blockers.push("interaction_comments_rail_hidden");
  if (!stage.participantsVisible) blockers.push("interaction_participants_rail_hidden");
  if (!stage.moderationRailVisible) blockers.push("interaction_moderation_rail_hidden");
  if (moderation.reportQueue.some((report) => report.status === "pending_local")) blockers.push("interaction_pending_report_review_required");
  if (selectedParticipantBlocked(state, room, moderation)) blockers.push("interaction_blocked_participant_selected");
  if (selectedParticipantKicked(state, participants)) blockers.push("interaction_kicked_participant_selected");
  return Array.from(new Set(blockers));
}

function providerBlockersFor(): readonly StreamLiveInteractionHardeningBlockerCode[] {
  return [
    "interaction_backend_comment_contract_required",
    "interaction_realtime_comment_provider_required",
    "interaction_backend_moderation_queue_required",
    "interaction_admin_review_queue_required",
  ];
}

function visibleCommentCount(room: StreamRoomRuntimeState, moderation: StreamRoomModerationRuntimeState): number {
  return room.comments.filter((comment) => !moderation.hiddenCommentIds.includes(comment.id)).length;
}

function blockedParticipantCount(room: StreamRoomRuntimeState, moderation: StreamRoomModerationRuntimeState): number {
  const blockedIds = new Set<string>();
  room.participants.forEach((participant) => { if (participant.blocked) blockedIds.add(participant.id); });
  moderation.participantControls.forEach((record) => { if (record.blocked) blockedIds.add(record.participantId); });
  return blockedIds.size;
}

function mutedParticipantCount(room: StreamRoomRuntimeState, moderation: StreamRoomModerationRuntimeState): number {
  const mutedIds = new Set<string>();
  room.participants.forEach((participant) => { if (participant.muted) mutedIds.add(participant.id); });
  moderation.participantControls.forEach((record) => { if (record.muted) mutedIds.add(record.participantId); });
  return mutedIds.size;
}

export function createInitialStreamLiveInteractionHardeningState(room: StreamRoomRuntimeState, now?: Date | string | number): StreamLiveInteractionHardeningRuntimeState {
  const state: StreamLiveInteractionHardeningRuntimeState = {
    version: "STREAM-109D",
    roomId: room.roomId,
    status: "idle_local",
    commentDraft: "",
    selectedParticipantId: room.participants.find((item) => item.role !== "host")?.id ?? room.hostId ?? null,
    selectedCommentId: room.comments[0]?.id ?? null,
    policyAcknowledgedLocal: false,
    commentGuardCheckedLocal: false,
    interactionCheckRanLocal: false,
    providerDeliveryRequestedLocal: false,
    backendCommentContract: "not_connected",
    realtimeCommentProvider: "not_configured",
    backendModerationQueue: "not_connected",
    adminReviewQueue: "local_draft_only",
    fakeCommentDeliveryAllowed: false,
    fakeRealtimeAllowed: false,
    fakeBackendModerationAllowed: false,
    fakePaymentAllowed: false,
    fakeGiftAllowed: false,
    actionLog: [],
  };
  return appendInteractionLog(state, "interaction_initialized", "idle_local", [], now);
}

export function syncStreamLiveInteractionHardeningState(
  current: StreamLiveInteractionHardeningRuntimeState,
  room: StreamRoomRuntimeState,
  moderation: StreamRoomModerationRuntimeState,
  participants: StreamParticipantManagementRuntimeState,
  stage: StreamRoomStageRuntimeState,
  now?: Date | string | number,
): StreamLiveInteractionHardeningRuntimeState {
  const participantIds = new Set(room.participants.map((item) => item.id));
  const commentIds = new Set(room.comments.map((item) => item.id));
  const selectedParticipantId = current.selectedParticipantId && participantIds.has(current.selectedParticipantId)
    ? current.selectedParticipantId
    : room.participants.find((item) => item.role !== "host" && !item.blocked)?.id ?? room.hostId ?? null;
  const selectedCommentId = current.selectedCommentId && commentIds.has(current.selectedCommentId)
    ? current.selectedCommentId
    : room.comments.find((item) => !moderation.hiddenCommentIds.includes(item.id))?.id ?? room.comments[0]?.id ?? null;
  const localBlockers = localBlockersFor({ ...current, selectedParticipantId, selectedCommentId }, room, moderation, participants, stage);
  const status: StreamLiveInteractionHardeningStatus = localBlockers.includes("interaction_pending_report_review_required")
    || localBlockers.includes("interaction_blocked_participant_selected")
    || localBlockers.includes("interaction_kicked_participant_selected")
      ? "moderation_attention_required"
      : "synced_local";
  return appendInteractionLog({ ...current, roomId: room.roomId, selectedParticipantId, selectedCommentId }, "interaction_synced", status, localBlockers, now);
}

export function setLocalStreamInteractionCommentDraft(
  state: StreamLiveInteractionHardeningRuntimeState,
  commentDraft: string,
  now?: Date | string | number,
): StreamLiveInteractionHardeningRuntimeState {
  const next = { ...state, commentDraft: normalizeText(commentDraft), commentGuardCheckedLocal: false };
  return appendInteractionLog(next, "comment_draft_updated", "comment_guard_ready_local", [], now);
}

export function selectLocalStreamInteractionParticipant(
  state: StreamLiveInteractionHardeningRuntimeState,
  participantId: string | null,
  now?: Date | string | number,
): StreamLiveInteractionHardeningRuntimeState {
  return appendInteractionLog({ ...state, selectedParticipantId: participantId }, "participant_selected", "synced_local", [], now);
}

export function selectLocalStreamInteractionComment(
  state: StreamLiveInteractionHardeningRuntimeState,
  commentId: string | null,
  now?: Date | string | number,
): StreamLiveInteractionHardeningRuntimeState {
  return appendInteractionLog({ ...state, selectedCommentId: commentId }, "comment_selected", "synced_local", [], now);
}

export function acknowledgeLocalStreamInteractionPolicy(
  state: StreamLiveInteractionHardeningRuntimeState,
  now?: Date | string | number,
): StreamLiveInteractionHardeningRuntimeState {
  return appendInteractionLog({ ...state, policyAcknowledgedLocal: true }, "interaction_policy_acknowledged", "synced_local", [], now);
}

export function runLocalStreamCommentGuard(
  state: StreamLiveInteractionHardeningRuntimeState,
  room: StreamRoomRuntimeState,
  moderation: StreamRoomModerationRuntimeState,
  participants: StreamParticipantManagementRuntimeState,
  stage: StreamRoomStageRuntimeState,
  now?: Date | string | number,
): StreamLiveInteractionHardeningRuntimeState {
  const localBlockers = localBlockersFor(state, room, moderation, participants, stage);
  const status: StreamLiveInteractionHardeningStatus = localBlockers.length > 0 ? "moderation_attention_required" : "comment_guard_ready_local";
  return appendInteractionLog({ ...state, commentGuardCheckedLocal: true }, "comment_guard_checked", status, localBlockers, now);
}

export function runLocalStreamInteractionCheck(
  state: StreamLiveInteractionHardeningRuntimeState,
  room: StreamRoomRuntimeState,
  moderation: StreamRoomModerationRuntimeState,
  participants: StreamParticipantManagementRuntimeState,
  stage: StreamRoomStageRuntimeState,
  now?: Date | string | number,
): StreamLiveInteractionHardeningRuntimeState {
  const localBlockers = localBlockersFor(state, room, moderation, participants, stage);
  const status: StreamLiveInteractionHardeningStatus = localBlockers.length > 0 ? "moderation_attention_required" : "interaction_checked_local";
  return appendInteractionLog({ ...state, interactionCheckRanLocal: true }, "interaction_checked", status, localBlockers, now);
}

export function requestLocalStreamCommentProviderDeliveryBlocked(
  state: StreamLiveInteractionHardeningRuntimeState,
  now?: Date | string | number,
): StreamLiveInteractionHardeningRuntimeState {
  return appendInteractionLog(
    { ...state, providerDeliveryRequestedLocal: true },
    "comment_provider_delivery_requested_blocked",
    "provider_delivery_blocked",
    providerBlockersFor(),
    now,
  );
}

export function buildStreamLiveInteractionEvidenceSnapshot(
  state: StreamLiveInteractionHardeningRuntimeState,
  room: StreamRoomRuntimeState,
  moderation: StreamRoomModerationRuntimeState,
  participants: StreamParticipantManagementRuntimeState,
  stage: StreamRoomStageRuntimeState,
): StreamLiveInteractionEvidenceSnapshot {
  const localBlockers = localBlockersFor(state, room, moderation, participants, stage);
  const providerBlockers = providerBlockersFor();
  return {
    version: "STREAM-109D",
    roomId: room.roomId,
    status: state.status,
    commentDraftReady: normalizeText(state.commentDraft).length > 0 && !localBlockers.includes("interaction_comment_text_required"),
    selectedParticipantId: state.selectedParticipantId,
    selectedCommentId: state.selectedCommentId,
    policyAcknowledgedLocal: state.policyAcknowledgedLocal,
    commentGuardCheckedLocal: state.commentGuardCheckedLocal,
    interactionCheckRanLocal: state.interactionCheckRanLocal,
    providerDeliveryRequestedLocal: state.providerDeliveryRequestedLocal,
    commentsRailVisible: stage.commentsVisible,
    participantsRailVisible: stage.participantsVisible,
    moderationRailVisible: stage.moderationRailVisible,
    totalComments: room.comments.length,
    visibleComments: visibleCommentCount(room, moderation),
    totalParticipants: room.participants.length,
    pendingReports: moderation.reportQueue.filter((report) => report.status === "pending_local").length,
    mutedParticipants: mutedParticipantCount(room, moderation),
    blockedParticipants: blockedParticipantCount(room, moderation),
    localBlockers,
    providerBlockers,
    backendCommentContract: state.backendCommentContract,
    realtimeCommentProvider: state.realtimeCommentProvider,
    backendModerationQueue: state.backendModerationQueue,
    adminReviewQueue: state.adminReviewQueue,
    readyForBackendUnion: localBlockers.length === 0,
    readyForProviderDelivery: false,
    fakeCommentDeliveryAllowed: false,
    fakeRealtimeAllowed: false,
    fakeBackendModerationAllowed: false,
    fakePaymentAllowed: false,
    fakeGiftAllowed: false,
  };
}
