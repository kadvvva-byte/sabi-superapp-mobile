type SocketLike = {
  connected?: boolean;
  connect?: () => void;
  emit: (eventName: string, payload?: unknown) => void;
};

type CallInvitePayload = Record<string, unknown>;

function text(value: unknown): string {
  if (Array.isArray(value)) return text(value[0]);
  return typeof value === "string" ? value.trim() : "";
}

function callKind(payload: CallInvitePayload): "audio" | "video" {
  const raw = text(payload.kind ?? payload.type ?? payload.callKind ?? payload.callType).toLowerCase();
  return raw.includes("video") ? "video" : "audio";
}

function truthy(value: unknown): boolean {
  return value === true || value === "1" || value === "true";
}

export function buildSabiIncomingCallInvitePayload(payload: CallInvitePayload): CallInvitePayload | null {
  const kind = callKind(payload);
  const fromUserId =
    text(payload.fromUserId) ||
    text(payload.callerId) ||
    text(payload.userId) ||
    text(payload.selfId);

  const toUserId =
    text(payload.toUserId) ||
    text(payload.targetUserId) ||
    text(payload.receiverUserId) ||
    text(payload.peerId) ||
    text(payload.peerUserId);

  const chatId = text(payload.chatId) || text(payload.roomId) || text(payload.conversationId) || text(payload.id);
  const roomId = text(payload.roomId) || chatId;
  const callId = text(payload.callId) || text(payload.id) || (chatId ? `call:${chatId}:${fromUserId}:${toUserId}` : "");

  if (!fromUserId || !toUserId || fromUserId === toUserId || !chatId || !callId) {
    return null;
  }

  const name =
    text(payload.callerName) ||
    text(payload.fromName) ||
    text(payload.senderName) ||
    text(payload.callerDisplayName) ||
    text(payload.contactName) ||
    text(payload.name) ||
    (kind === "video" ? "Video call" : "Audio call");
  const avatarLetter =
    text(payload.callerAvatarLetter) ||
    text(payload.avatarLetter) ||
    name.replace(/^\+/, "").match(/[A-Za-z\u0410-\u042F\u0430-\u044F\u0401\u04510-9]/u)?.[0]?.toUpperCase() ||
    "S";

  const avatarUrl =
    text(payload.callerAvatarUrl) ||
    text(payload.avatarUrl) ||
    text(payload.photoUrl) ||
    text(payload.imageUrl);

  return {
    ...payload,
    id: callId,
    callId,
    chatId,
    roomId,
    kind,
    type: kind,
    event: "incoming",
    relayEvent: "call:incoming",
    direction: "incoming",
    phase: "ringing",
    status: "ringing",
    signalState: "ringing",
    fromUserId,
    callerId: fromUserId,
    senderUserId: fromUserId,
    toUserId,
    targetUserId: toUserId,
    receiverUserId: toUserId,
    currentUserId: toUserId,
    userId: toUserId,
    peerId: fromUserId,
    peerUserId: fromUserId,
    contactName: name,
    name,
    callerName: name,
    avatarLetter,
    avatarUrl: avatarUrl || undefined,
    photoUrl: avatarUrl || undefined,
    verified: truthy(payload.verified),
    roomType: text(payload.roomType) || "direct",
    createdAt: new Date().toISOString(),
    at: new Date().toISOString(),
  };
}

export function isOwnIncomingCallPayload(payload: CallInvitePayload, currentUserId?: string | null): boolean {
  const current = text(currentUserId);
  if (!current) return false;

  const fromUserId = text(payload.fromUserId) || text(payload.callerId) || text(payload.senderUserId) || text(payload.peerId);
  const toUserId = text(payload.toUserId) || text(payload.targetUserId) || text(payload.receiverUserId) || text(payload.currentUserId) || text(payload.userId);

  if (fromUserId && fromUserId === current) return true;
  if (toUserId && toUserId !== current) return true;

  return false;
}

export function emitSabiOutgoingCallInvite(socket: SocketLike, payload: CallInvitePayload): boolean {
  const incoming = buildSabiIncomingCallInvitePayload(payload);
  if (!incoming) return false;

  if (!socket.connected) socket.connect?.();

  const kind = callKind(incoming);
  const targetUserId = text(incoming.targetUserId);

  const events = [
    "call:start",
    "call:incoming",
    "call_incoming",
    "call:ringing",
    "sabi-call:incoming",
    "sabi-call:ringing",
    kind === "video" ? "video-call:incoming" : "audio-call:incoming",
    kind === "video" ? "video_call_incoming" : "audio_call_incoming",
    kind === "video" ? "video-call:ringing" : "audio-call:ringing",
  ];

  for (const eventName of events) {
    try { socket.emit(eventName, incoming); } catch {}
  }

  const envelope = {
    eventName: "call:incoming",
    name: "call:incoming",
    event: "call:incoming",
    type: "sabi_call_event",
    payload: incoming,
    data: incoming,
    message: incoming,
    callId: text(incoming.callId),
    chatId: text(incoming.chatId),
    roomId: text(incoming.roomId),
    fromUserId: text(incoming.fromUserId),
    senderUserId: text(incoming.fromUserId),
    toUserId: targetUserId,
    targetUserId,
    receiverUserId: targetUserId,
    userId: targetUserId,
    channel: targetUserId ? `user:${targetUserId}` : undefined,
    callChannel: text(incoming.callId) ? `call:${text(incoming.callId)}` : undefined,
    at: new Date().toISOString(),
  };

  for (const eventName of ["realtime:event", "messenger:realtime:event", "sabi:realtime:event", "user:realtime:event"]) {
    try { socket.emit(eventName, envelope); } catch {}
  }

  return true;
}
