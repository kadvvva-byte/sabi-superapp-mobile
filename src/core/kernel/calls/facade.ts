import { router } from "expo-router";

import { connectSuperAppSocket, getSuperAppSocket } from "../../../shared/realtime/superapp-socket";
import { emitSabiOutgoingCallInvite } from "./inviteRuntime";

type OpenCallArgs = {
  chatId?: string | null;
  callId?: string | null;
  id?: string | null;
  userId?: string | null;
  selfId?: string | null;
  currentUserId?: string | null;
  peerId?: string | null;
  peerUserId?: string | null;
  partnerId?: string | null;
  targetUserId?: string | null;
  roomId?: string | null;
  roomType?: string | null;
  name?: string | null;
  roomTitle?: string | null;
  avatarLetter?: string | null;
  avatarUrl?: string | null;
  photoUrl?: string | null;
  verified?: boolean | string | null;
  status?: string | null;
  subtitle?: string | null;
  participants?: unknown;
  [key: string]: unknown;
};

type NormalizedCallParams = OpenCallArgs & {
  id: string;
  chatId: string;
  roomId: string;
  callId: string;
  userId: string;
  selfId: string;
  currentUserId: string;
  fromUserId: string;
  peerId: string;
  peerUserId: string;
  partnerId: string;
  targetUserId: string;
  toUserId: string;
  roomType: string;
  name: string;
  roomTitle: string;
  avatarLetter: string;
  kind: "audio" | "video";
  type: "audio" | "video";
  direction: "outgoing";
  action: "start";
  event: "start";
  incoming: "0";
  incomingCall: "0";
  cameraEnabled: "0" | "1";
  videoEnabled: "0" | "1";
  mediaKind: "audio" | "video";
};

function text(value: unknown): string {
  if (Array.isArray(value)) return text(value[0]);
  return typeof value === "string" ? value.trim() : "";
}

function safeRoomType(value: unknown): string {
  const raw = text(value).toLowerCase();
  if (raw === "group" || raw === "channel" || raw === "bot" || raw === "group_call") return raw;
  return "direct";
}

function warnInvalidCallRoute(reason: string, args: OpenCallArgs) {
  try {
    console.warn("[sabi-call:kernel-route-blocked]", reason, {
      chatId: text(args.chatId) || text(args.id) || text(args.roomId),
      userId: text(args.userId) || text(args.selfId) || text(args.currentUserId),
      peerId: text(args.peerId) || text(args.peerUserId) || text(args.partnerId) || text(args.targetUserId),
      roomType: text(args.roomType),
    });
  } catch {}
}

function normalizeParams(args: OpenCallArgs, kind: "audio" | "video"): NormalizedCallParams | null {
  const chatId = text(args.chatId) || text(args.id) || text(args.roomId);
  const userId = text(args.userId) || text(args.selfId) || text(args.currentUserId);
  const peerId = text(args.peerId) || text(args.peerUserId) || text(args.partnerId) || text(args.targetUserId);

  if (!chatId) {
    warnInvalidCallRoute("missing_chat_id", args);
    return null;
  }

  if (!userId) {
    warnInvalidCallRoute("missing_current_user_id", args);
    return null;
  }

  if (!peerId) {
    warnInvalidCallRoute("missing_peer_user_id", args);
    return null;
  }

  if (userId === peerId) {
    warnInvalidCallRoute("self_call_blocked", args);
    return null;
  }

  // CALL-AV-123.1_FRESH_OUTGOING_CALL_ID:
  // Every new outgoing audio/video call must have a unique callId.
  // Reusing args.callId lets stale offer/answer/ice/ended events from an older
  // attempt close or poison the next call.
  const callNonce = Math.random().toString(36).slice(2, 10);
  const callId = `call:${chatId}:${userId}:${peerId}:${Date.now()}:${callNonce}`;
  const name = text(args.name) || text(args.roomTitle) || (kind === "video" ? "Video call" : "Audio call");
  const videoEnabled = kind === "video" ? "1" : "0";

  return {
    ...args,
    id: chatId,
    chatId,
    roomId: text(args.roomId) || chatId,
    callId,
    userId,
    selfId: userId,
    currentUserId: userId,
    fromUserId: userId,
    peerId,
    peerUserId: peerId,
    partnerId: peerId,
    targetUserId: peerId,
    toUserId: peerId,
    roomType: safeRoomType(args.roomType),
    name,
    roomTitle: name,
    avatarLetter: text(args.avatarLetter) || name.slice(0, 1).toUpperCase() || "S",
    avatarUrl: text(args.avatarUrl) || text(args.photoUrl) || undefined,
    photoUrl: text(args.photoUrl) || text(args.avatarUrl) || undefined,
    verified: args.verified === true || args.verified === "1" || args.verified === "true" ? "1" : "0",
    kind,
    type: kind,
    direction: "outgoing",
    action: "start",
    event: "start",
    incoming: "0",
    incomingCall: "0",
    cameraEnabled: videoEnabled,
    videoEnabled,
    mediaKind: kind,
  };
}

export async function bootCallsKernel(userId?: string | null) {
  const resolvedUserId = text(userId);
  if (resolvedUserId) connectSuperAppSocket(resolvedUserId);
}

export async function shutdownCallsKernel() {}

export function openSabiAudioCallFromKernel(args: OpenCallArgs) {
  const params = normalizeParams(args, "audio");
  if (!params) return false;

  const socket = getSuperAppSocket(params.userId || undefined);
  emitSabiOutgoingCallInvite(socket, params);

  router.push({
    pathname: "/calls/audio" as never,
    params: params as never,
  });

  return true;
}

export function openSabiVideoCallFromKernel(args: OpenCallArgs) {
  const params = normalizeParams(args, "video");
  if (!params) return false;

  const socket = getSuperAppSocket(params.userId || undefined);
  emitSabiOutgoingCallInvite(socket, params);

  router.push({
    pathname: "/calls/video" as never,
    params: params as never,
  });

  return true;
}
