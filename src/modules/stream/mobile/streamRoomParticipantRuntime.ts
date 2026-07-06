import type {
  StreamRoomComment,
  StreamRoomParticipant,
  StreamRoomParticipantRole,
  StreamRoomRuntimeState,
} from "./streamRoomRuntime";

export type StreamSpeakerSeatKind = "main_host" | "cohost" | "speaker" | "moderator";
export type StreamSpeakerSeatStatus = "empty" | "occupied_local" | "pending_invite_local" | "backend_handoff_required";
export type StreamHostHandoffStatus = "none" | "draft_local" | "accepted_local_backend_required" | "cancelled_local" | "declined_local";
export type StreamParticipantVisibility = "visible" | "muted" | "blocked" | "kicked_local";
export type StreamParticipantManagementAction =
  | "participant_management_synced"
  | "speaker_seat_assigned"
  | "speaker_seat_cleared"
  | "participant_role_changed"
  | "participant_kicked"
  | "host_handoff_drafted"
  | "host_handoff_accepted_local"
  | "host_handoff_declined_local"
  | "host_handoff_cancelled_local";

export type StreamSpeakerSeat = {
  readonly id: string;
  readonly kind: StreamSpeakerSeatKind;
  readonly participantId: string | null;
  readonly label: string;
  readonly status: StreamSpeakerSeatStatus;
  readonly localOnly: true;
};

export type StreamHostHandoffDraft = {
  readonly id: string;
  readonly fromHostId: string;
  readonly targetParticipantId: string;
  readonly targetDisplayName: string;
  readonly status: StreamHostHandoffStatus;
  readonly createdAt: string;
  readonly backendRoomContractRequired: true;
  readonly providerHandoffRequired: true;
  readonly fakeHostTransferAllowed: false;
  readonly localOnly: true;
};

export type StreamParticipantVisibilityRecord = {
  readonly participantId: string;
  readonly visibility: StreamParticipantVisibility;
  readonly updatedAt: string;
  readonly localOnly: true;
};

export type StreamParticipantManagementActionLogEntry = {
  readonly id: string;
  readonly action: StreamParticipantManagementAction;
  readonly targetId: string;
  readonly createdAt: string;
  readonly backendDelivered: false;
};

export type StreamParticipantManagementRuntimeState = {
  readonly version: "STREAM-108V";
  readonly roomId: string;
  readonly speakerSeats: readonly StreamSpeakerSeat[];
  readonly visibilityRecords: readonly StreamParticipantVisibilityRecord[];
  readonly hostHandoffDraft: StreamHostHandoffDraft | null;
  readonly actionLog: readonly StreamParticipantManagementActionLogEntry[];
  readonly backendParticipantContract: "not_connected";
  readonly backendHostHandoffContract: "not_connected";
  readonly fakeParticipantJoinAllowed: false;
  readonly fakeHostTransferAllowed: false;
  readonly fakeProviderDeliveryAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftAllowed: false;
};

export type StreamParticipantManagementEvidenceSnapshot = {
  readonly version: "STREAM-108V";
  readonly roomId: string;
  readonly participantsTotal: number;
  readonly hostCount: number;
  readonly viewers: number;
  readonly cohosts: number;
  readonly moderators: number;
  readonly occupiedSpeakerSeats: number;
  readonly emptySpeakerSeats: number;
  readonly kickedLocalParticipants: number;
  readonly hostHandoffStatus: StreamHostHandoffStatus;
  readonly backendParticipantContract: "not_connected";
  readonly backendHostHandoffContract: "not_connected";
  readonly readyForBackendUnion: boolean;
  readonly fakeParticipantJoinAllowed: false;
  readonly fakeHostTransferAllowed: false;
  readonly fakeProviderDeliveryAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftAllowed: false;
};

const MAX_ACTION_LOG = 80;
const MAX_VISIBILITY_RECORDS = 120;

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

function normalizeText(value: string | null | undefined): string {
  return String(value ?? "").trim().replace(/\s+/g, " ");
}

function actionLogEntry(action: StreamParticipantManagementAction, targetId: string, now?: Date | string | number): StreamParticipantManagementActionLogEntry {
  const createdAt = nowIso(now);
  return { id: `${action}-${targetId}-${createdAt}`, action, targetId, createdAt, backendDelivered: false };
}

function appendAction(
  state: StreamParticipantManagementRuntimeState,
  action: StreamParticipantManagementAction,
  targetId: string,
  now?: Date | string | number,
): StreamParticipantManagementRuntimeState {
  return {
    ...state,
    actionLog: [actionLogEntry(action, targetId, now), ...state.actionLog].slice(0, MAX_ACTION_LOG),
  };
}

function createDefaultSpeakerSeats(room: StreamRoomRuntimeState): readonly StreamSpeakerSeat[] {
  const host = room.participants.find((participant) => participant.id === room.hostId) ?? room.participants.find((participant) => participant.role === "host");
  return [
    {
      id: "main-host-seat",
      kind: "main_host",
      participantId: host?.id ?? null,
      label: "Main host",
      status: host ? "occupied_local" : "empty",
      localOnly: true,
    },
    { id: "cohost-seat-1", kind: "cohost", participantId: null, label: "Co-host 1", status: "empty", localOnly: true },
    { id: "cohost-seat-2", kind: "cohost", participantId: null, label: "Co-host 2", status: "empty", localOnly: true },
    { id: "speaker-seat-1", kind: "speaker", participantId: null, label: "Speaker 1", status: "empty", localOnly: true },
    { id: "moderator-seat-1", kind: "moderator", participantId: null, label: "Moderator", status: "empty", localOnly: true },
  ];
}

function participantExists(room: StreamRoomRuntimeState, participantId: string | null): boolean {
  if (!participantId) return false;
  return room.participants.some((participant) => participant.id === participantId);
}

function participantVisibility(participant: StreamRoomParticipant): StreamParticipantVisibility {
  if (participant.blocked) return "blocked";
  if (participant.muted) return "muted";
  return "visible";
}

function upsertVisibilityRecord(
  state: StreamParticipantManagementRuntimeState,
  participantId: string,
  visibility: StreamParticipantVisibility,
  now?: Date | string | number,
): StreamParticipantManagementRuntimeState {
  const updatedAt = nowIso(now);
  const nextRecord: StreamParticipantVisibilityRecord = { participantId, visibility, updatedAt, localOnly: true };
  const exists = state.visibilityRecords.some((record) => record.participantId === participantId);
  const visibilityRecords = exists
    ? state.visibilityRecords.map((record) => (record.participantId === participantId ? nextRecord : record))
    : [nextRecord, ...state.visibilityRecords].slice(0, MAX_VISIBILITY_RECORDS);
  return { ...state, visibilityRecords };
}

export function createInitialStreamParticipantManagementState(
  room: StreamRoomRuntimeState,
  now?: Date | string | number,
): StreamParticipantManagementRuntimeState {
  const state: StreamParticipantManagementRuntimeState = {
    version: "STREAM-108V",
    roomId: room.roomId,
    speakerSeats: createDefaultSpeakerSeats(room),
    visibilityRecords: room.participants.map((participant) => ({
      participantId: participant.id,
      visibility: participantVisibility(participant),
      updatedAt: nowIso(now),
      localOnly: true,
    })),
    hostHandoffDraft: null,
    actionLog: [],
    backendParticipantContract: "not_connected",
    backendHostHandoffContract: "not_connected",
    fakeParticipantJoinAllowed: false,
    fakeHostTransferAllowed: false,
    fakeProviderDeliveryAllowed: false,
    fakePaymentAllowed: false,
    fakeGiftAllowed: false,
  };
  return appendAction(state, "participant_management_synced", room.roomId, now);
}

export function syncStreamParticipantManagementState(
  state: StreamParticipantManagementRuntimeState,
  room: StreamRoomRuntimeState,
  now?: Date | string | number,
): StreamParticipantManagementRuntimeState {
  const roomParticipantIds = new Set(room.participants.map((participant) => participant.id));
  const speakerSeats = state.speakerSeats.map((seat) => {
    if (!seat.participantId || roomParticipantIds.has(seat.participantId)) return seat;
    return { ...seat, participantId: null, status: "empty" as const };
  });
  const syncedSeats = speakerSeats.some((seat) => seat.kind === "main_host") ? speakerSeats : createDefaultSpeakerSeats(room);
  const visibilityFromRoom = room.participants.map((participant) => ({
    participantId: participant.id,
    visibility: participantVisibility(participant),
    updatedAt: nowIso(now),
    localOnly: true as const,
  }));
  const existingKickedRecords = state.visibilityRecords.filter((record) => record.visibility === "kicked_local" && !roomParticipantIds.has(record.participantId));
  const hostHandoffDraft = state.hostHandoffDraft && roomParticipantIds.has(state.hostHandoffDraft.targetParticipantId) ? state.hostHandoffDraft : null;
  return appendAction(
    {
      ...state,
      roomId: room.roomId,
      speakerSeats: syncedSeats,
      visibilityRecords: [...visibilityFromRoom, ...existingKickedRecords].slice(0, MAX_VISIBILITY_RECORDS),
      hostHandoffDraft,
    },
    "participant_management_synced",
    room.roomId,
    now,
  );
}

export function assignLocalSpeakerSeat(
  state: StreamParticipantManagementRuntimeState,
  room: StreamRoomRuntimeState,
  seatId: string,
  participantId: string | null,
  now?: Date | string | number,
): StreamParticipantManagementRuntimeState {
  const validParticipantId = participantExists(room, participantId) ? participantId : null;
  const speakerSeats = state.speakerSeats.map((seat) => {
    if (seat.id !== seatId) return validParticipantId && seat.participantId === validParticipantId ? { ...seat, participantId: null, status: "empty" as const } : seat;
    return {
      ...seat,
      participantId: validParticipantId,
      status: validParticipantId ? "occupied_local" as const : "empty" as const,
    };
  });
  return appendAction({ ...state, speakerSeats }, validParticipantId ? "speaker_seat_assigned" : "speaker_seat_cleared", seatId, now);
}

export function changeLocalParticipantRole(
  room: StreamRoomRuntimeState,
  participantId: string,
  role: Exclude<StreamRoomParticipantRole, "host">,
  now?: Date | string | number,
): StreamRoomRuntimeState {
  const participants = room.participants.map((participant) => {
    if (participant.id !== participantId || participant.role === "host") return participant;
    return { ...participant, role };
  });
  return {
    ...room,
    participants,
    actionLog: [
      {
        id: `participant_role_changed-${participantId}-${nowIso(now)}`,
        action: `participant_role_changed:${role}`,
        status: "participant_updated" as const,
        createdAt: nowIso(now),
        blockers: [],
      },
      ...room.actionLog,
    ].slice(0, 48),
  };
}

export function kickLocalStreamParticipant(
  room: StreamRoomRuntimeState,
  participantId: string,
  now?: Date | string | number,
): StreamRoomRuntimeState {
  const target = room.participants.find((participant) => participant.id === participantId);
  if (!target || target.role === "host") return room;
  const participants = room.participants.filter((participant) => participant.id !== participantId);
  const comments: readonly StreamRoomComment[] = room.comments.map((comment) => {
    if (comment.participantId !== participantId) return comment;
    return { ...comment, status: "moderation_blocked" };
  });
  return {
    ...room,
    participants,
    comments,
    cohostInvites: room.cohostInvites.map((invite) =>
      invite.participantId === participantId && invite.status === "invite_ready" ? { ...invite, status: "declined_local" as const } : invite,
    ),
    actionLog: [
      {
        id: `participant_kicked-${participantId}-${nowIso(now)}`,
        action: "participant_kicked_local",
        status: "participant_updated" as const,
        createdAt: nowIso(now),
        blockers: [],
      },
      ...room.actionLog,
    ].slice(0, 48),
  };
}

export function markParticipantKickedLocal(
  state: StreamParticipantManagementRuntimeState,
  participantId: string,
  now?: Date | string | number,
): StreamParticipantManagementRuntimeState {
  return appendAction(upsertVisibilityRecord(state, participantId, "kicked_local", now), "participant_kicked", participantId, now);
}

export function createLocalHostHandoffDraft(
  state: StreamParticipantManagementRuntimeState,
  room: StreamRoomRuntimeState,
  targetParticipantId: string,
  now?: Date | string | number,
): StreamParticipantManagementRuntimeState {
  const target = room.participants.find((participant) => participant.id === targetParticipantId && participant.role !== "host" && !participant.blocked);
  if (!target) return appendAction(state, "host_handoff_drafted", targetParticipantId, now);
  const draft: StreamHostHandoffDraft = {
    id: createId("local-host-handoff", now),
    fromHostId: room.hostId,
    targetParticipantId,
    targetDisplayName: normalizeText(target.displayName) || "Participant",
    status: "draft_local",
    createdAt: nowIso(now),
    backendRoomContractRequired: true,
    providerHandoffRequired: true,
    fakeHostTransferAllowed: false,
    localOnly: true,
  };
  const speakerSeats = state.speakerSeats.map((seat) =>
    seat.id === "main-host-seat" ? { ...seat, status: "backend_handoff_required" as const } : seat,
  );
  return appendAction({ ...state, hostHandoffDraft: draft, speakerSeats }, "host_handoff_drafted", targetParticipantId, now);
}

export function answerLocalHostHandoffDraft(
  state: StreamParticipantManagementRuntimeState,
  answer: "accept" | "decline" | "cancel",
  now?: Date | string | number,
): StreamParticipantManagementRuntimeState {
  if (!state.hostHandoffDraft) return appendAction(state, answer === "accept" ? "host_handoff_accepted_local" : answer === "decline" ? "host_handoff_declined_local" : "host_handoff_cancelled_local", "missing", now);
  const status: StreamHostHandoffStatus = answer === "accept" ? "accepted_local_backend_required" : answer === "decline" ? "declined_local" : "cancelled_local";
  const hostHandoffDraft: StreamHostHandoffDraft = { ...state.hostHandoffDraft, status };
  const speakerSeats = state.speakerSeats.map((seat) =>
    seat.id === "main-host-seat" && answer !== "accept" ? { ...seat, status: seat.participantId ? "occupied_local" as const : "empty" as const } : seat,
  );
  const action: StreamParticipantManagementAction = answer === "accept" ? "host_handoff_accepted_local" : answer === "decline" ? "host_handoff_declined_local" : "host_handoff_cancelled_local";
  return appendAction({ ...state, hostHandoffDraft, speakerSeats }, action, state.hostHandoffDraft.targetParticipantId, now);
}

export function buildStreamParticipantManagementEvidenceSnapshot(
  state: StreamParticipantManagementRuntimeState,
  room: StreamRoomRuntimeState,
): StreamParticipantManagementEvidenceSnapshot {
  const participantsTotal = room.participants.length;
  const hostCount = room.participants.filter((participant) => participant.role === "host" && !participant.blocked).length;
  const viewers = room.participants.filter((participant) => participant.role === "viewer" && !participant.blocked).length;
  const cohosts = room.participants.filter((participant) => participant.role === "cohost" && !participant.blocked).length;
  const moderators = room.participants.filter((participant) => participant.role === "moderator" && !participant.blocked).length;
  const occupiedSpeakerSeats = state.speakerSeats.filter((seat) => Boolean(seat.participantId)).length;
  const emptySpeakerSeats = state.speakerSeats.filter((seat) => !seat.participantId).length;
  const kickedLocalParticipants = state.visibilityRecords.filter((record) => record.visibility === "kicked_local").length;
  return {
    version: "STREAM-108V",
    roomId: room.roomId,
    participantsTotal,
    hostCount,
    viewers,
    cohosts,
    moderators,
    occupiedSpeakerSeats,
    emptySpeakerSeats,
    kickedLocalParticipants,
    hostHandoffStatus: state.hostHandoffDraft?.status ?? "none",
    backendParticipantContract: state.backendParticipantContract,
    backendHostHandoffContract: state.backendHostHandoffContract,
    readyForBackendUnion: true,
    fakeParticipantJoinAllowed: false,
    fakeHostTransferAllowed: false,
    fakeProviderDeliveryAllowed: false,
    fakePaymentAllowed: false,
    fakeGiftAllowed: false,
  };
}
