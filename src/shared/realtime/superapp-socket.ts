import { io, type Socket } from "socket.io-client";
import { resolveSabiApiBaseUrl } from "../api/apiBaseUrl";

const SOCKET_BASE_URL = resolveSabiApiBaseUrl(undefined, { port: "4001" }).replace(/\/+$/, "");

const SOCKET_PATH =
  (process.env.EXPO_PUBLIC_SOCKET_PATH || "/socket.io").trim() || "/socket.io";

let socket: Socket | null = null;
let activeUserId: string | null = null;

const joinedChats = new Set<string>();
const joinedRealtimeChannels = new Set<string>();
const joinedWalletCoreChannels = new Set<string>();
const joinedVideoCallRooms = new Set<string>();

export type SuperAppVideoCallSignalPayload<T = unknown> = {
  chatId: string;
  peerId?: string | null;
  fromUserId?: string | null;
  targetUserId?: string | null;
  message: T;
};

export type SuperAppSocketConnectionState = {
  connected: boolean;
  connecting: boolean;
  active: boolean;
  userId: string | null;
  baseUrl: string;
  path: string;
};

type SocketEventHandler = (...args: unknown[]) => void;
type SocketWithMutableInternals = Socket & {
  auth?: Record<string, string>;
  io?: {
    opts?: {
      query?: Record<string, string>;
    };
  };
  active?: boolean;
};

function normalizeString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized ? normalized : null;
}

function uniqueEventNames(eventNames: string[]) {
  return Array.from(new Set(eventNames.filter(Boolean)));
}

function buildAuth(userId?: string | null): Record<string, string> {
  const resolvedUserId = normalizeString(userId) ?? activeUserId ?? null;
  return resolvedUserId ? { userId: resolvedUserId } : {};
}

function buildQuery(userId?: string | null): Record<string, string> | undefined {
  const resolvedUserId = normalizeString(userId) ?? activeUserId ?? null;
  return resolvedUserId ? { userId: resolvedUserId } : undefined;
}

function getSocketInternal(target: Socket | null): SocketWithMutableInternals | null {
  return target as SocketWithMutableInternals | null;
}

function isSocketActive(target: Socket | null) {
  const internal = getSocketInternal(target);
  return Boolean(internal?.active || target?.connected);
}

function ensureSocket(userId?: string | null) {
  const resolvedUserId = normalizeString(userId);
  if (resolvedUserId) {
    activeUserId = resolvedUserId;
  }

  if (!socket) {
    socket = io(SOCKET_BASE_URL, {
      autoConnect: false,
      path: SOCKET_PATH,
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 300,
      reconnectionDelayMax: 2500,
      timeout: 5000,
      auth: buildAuth(resolvedUserId),
      query: buildQuery(resolvedUserId),
    });

    socket.on("connect", () => {
      flushTransportSubscriptions();
    });

    socket.on("reconnect", () => {
      flushTransportSubscriptions();
    });
  }

  const nextAuth = buildAuth(resolvedUserId);
  const nextQuery = buildQuery(resolvedUserId);
  const internalSocket = getSocketInternal(socket);

  if (internalSocket) {
    internalSocket.auth = nextAuth;

    if (internalSocket.io?.opts) {
      internalSocket.io.opts.query = nextQuery;
    }
  }

  return socket;
}

function emitPresence(target: Socket, userId: string, online: boolean) {
  const at = new Date().toISOString();
  const status = online ? "online" : "offline";

  const payload = {
    userId,
    online,
    status,
    presence: status,
    state: status,
    at,
    updatedAt: at,
    lastSeenAt: online ? null : at,
  };

  uniqueEventNames([
    online ? "presence:online" : "presence:offline",
    online ? "presence.online" : "presence.offline",
    online ? "chat:presence:online" : "chat:presence:offline",
    online ? "chat_presence_online" : "chat_presence_offline",
    online ? "user_online" : "user_offline",
  ]).forEach((eventName) => {
    target.emit(eventName, payload);
  });
}

function emitEventIfConnected(
  eventNames: string[],
  payload: Record<string, unknown>,
  userId?: string | null,
) {
  const target = ensureSocket(userId);
  if (!target.connected) return false;

  uniqueEventNames(eventNames).forEach((eventName) => {
    target.emit(eventName, payload);
  });

  return true;
}

function emitJoinChat(roomId: string, userId?: string | null) {
  const resolvedUserId = normalizeString(userId) ?? activeUserId;
  if (!roomId.trim() || !resolvedUserId) return false;

  const payload = {
    roomId,
    chatId: roomId,
    userId: resolvedUserId,
  };

  return emitEventIfConnected(
    [
      "chat:join",
      "chat.join",
      "join_chat",
      "room:join",
      "room.join",
      "messenger:room:join",
    ],
    payload,
    resolvedUserId,
  );
}

function emitLeaveChat(roomId: string, userId?: string | null) {
  const resolvedUserId = normalizeString(userId) ?? activeUserId;
  if (!roomId.trim() || !resolvedUserId) return false;

  const payload = {
    roomId,
    chatId: roomId,
    userId: resolvedUserId,
  };

  return emitEventIfConnected(
    [
      "chat:leave",
      "chat.leave",
      "leave_chat",
      "room:leave",
      "room.leave",
      "messenger:room:leave",
    ],
    payload,
    resolvedUserId,
  );
}

function emitJoinRealtimeChannel(channel: string, userId?: string | null) {
  const resolvedUserId = normalizeString(userId) ?? activeUserId;
  if (!channel.trim() || !resolvedUserId) return false;

  const payload = {
    channel,
    userId: resolvedUserId,
  };

  return emitEventIfConnected(
    [
      "realtime:channel:join",
      "realtime.channel.join",
      "channel:join",
      "channel.join",
    ],
    payload,
    resolvedUserId,
  );
}

function emitLeaveRealtimeChannel(channel: string, userId?: string | null) {
  const resolvedUserId = normalizeString(userId) ?? activeUserId;
  if (!channel.trim() || !resolvedUserId) return false;

  const payload = {
    channel,
    userId: resolvedUserId,
  };

  return emitEventIfConnected(
    [
      "realtime:channel:leave",
      "realtime.channel.leave",
      "channel:leave",
      "channel.leave",
    ],
    payload,
    resolvedUserId,
  );
}

function emitJoinWalletCoreChannel(channel: string, userId?: string | null) {
  const resolvedUserId = normalizeString(userId) ?? activeUserId;
  if (!channel.trim() || !resolvedUserId) return false;

  const payload = {
    channel,
    userId: resolvedUserId,
  };

  return emitEventIfConnected(
    [
      "wallet:core:join",
      "wallet.core.join",
      "wallet_channel_join",
    ],
    payload,
    resolvedUserId,
  );
}

function emitLeaveWalletCoreChannel(channel: string, userId?: string | null) {
  const resolvedUserId = normalizeString(userId) ?? activeUserId;
  if (!channel.trim() || !resolvedUserId) return false;

  const payload = {
    channel,
    userId: resolvedUserId,
  };

  return emitEventIfConnected(
    [
      "wallet:core:leave",
      "wallet.core.leave",
      "wallet_channel_leave",
    ],
    payload,
    resolvedUserId,
  );
}

function emitJoinVideoCallRoom(roomId: string, userId?: string | null) {
  const resolvedUserId = normalizeString(userId) ?? activeUserId;
  if (!roomId.trim() || !resolvedUserId) return false;

  const payload = {
    roomId,
    chatId: roomId,
    userId: resolvedUserId,
  };

  return emitEventIfConnected(
    [
      "video:call:join",
      "video.call.join",
      "video_call_join",
      "call:room:join",
      "call.room.join",
    ],
    payload,
    resolvedUserId,
  );
}

function emitLeaveVideoCallRoom(roomId: string, userId?: string | null) {
  const resolvedUserId = normalizeString(userId) ?? activeUserId;
  if (!roomId.trim() || !resolvedUserId) return false;

  const payload = {
    roomId,
    chatId: roomId,
    userId: resolvedUserId,
  };

  return emitEventIfConnected(
    [
      "video:call:leave",
      "video.call.leave",
      "video_call_leave",
      "call:room:leave",
      "call.room.leave",
    ],
    payload,
    resolvedUserId,
  );
}

function flushTransportSubscriptions() {
  const resolvedUserId = activeUserId;
  if (!resolvedUserId || !socket?.connected) return;

  joinedChats.forEach((roomId) => {
    emitJoinChat(roomId, resolvedUserId);
  });

  joinedRealtimeChannels.forEach((channel) => {
    emitJoinRealtimeChannel(channel, resolvedUserId);
  });

  joinedWalletCoreChannels.forEach((channel) => {
    emitJoinWalletCoreChannel(channel, resolvedUserId);
  });

  joinedVideoCallRooms.forEach((roomId) => {
    emitJoinVideoCallRoom(roomId, resolvedUserId);
  });
}

export function getSuperAppSocket(userId?: string | null) {
  return ensureSocket(userId);
}

export function getActiveSocketUserId() {
  return activeUserId;
}

export function getSuperAppSocketConnectionState(): SuperAppSocketConnectionState {
  const target = ensureSocket();
  return {
    connected: target.connected,
    connecting: isSocketActive(target) && !target.connected,
    active: isSocketActive(target),
    userId: activeUserId,
    baseUrl: SOCKET_BASE_URL,
    path: SOCKET_PATH,
  };
}

export function connectSuperAppSocket(userId?: string | null) {
  const target = ensureSocket(userId);
  if (!target.connected && !isSocketActive(target)) {
    target.connect();
  }
  return target;
}

export function disconnectSuperAppSocket(options?: {
  preserveTransportState?: boolean;
  emitOffline?: boolean;
}) {
  if (!socket) return;

  const preserveTransportState = options?.preserveTransportState ?? true;
  const emitOffline = options?.emitOffline ?? false;

  if (emitOffline && socket.connected && activeUserId) {
    emitPresence(socket, activeUserId, false);
  }

  socket.disconnect();

  if (!preserveTransportState) {
    joinedChats.clear();
    joinedRealtimeChannels.clear();
    joinedWalletCoreChannels.clear();
    joinedVideoCallRooms.clear();
  }
}

export function resetSuperAppSocketTransportState() {
  joinedChats.clear();
  joinedRealtimeChannels.clear();
  joinedWalletCoreChannels.clear();
  joinedVideoCallRooms.clear();
}

export function onSocketEvent(
  eventName: string,
  handler: SocketEventHandler,
  userId?: string | null,
) {
  const target = ensureSocket(userId);
  const wrapped = (...args: unknown[]) => {
    handler(...args);
  };

  target.on(eventName, wrapped);
  return () => {
    target.off(eventName, wrapped);
  };
}

export function joinChat(roomId: string, userId?: string | null) {
  const normalizedRoomId = normalizeString(roomId);
  if (!normalizedRoomId) return;

  joinedChats.add(normalizedRoomId);
  emitJoinChat(normalizedRoomId, userId);
}

export function leaveChat(roomId: string, userId?: string | null) {
  const normalizedRoomId = normalizeString(roomId);
  if (!normalizedRoomId) return;

  joinedChats.delete(normalizedRoomId);
  emitLeaveChat(normalizedRoomId, userId);
}

export function joinRealtimeChannel(channel: string, userId?: string | null) {
  const normalizedChannel = normalizeString(channel);
  if (!normalizedChannel) return;

  joinedRealtimeChannels.add(normalizedChannel);
  emitJoinRealtimeChannel(normalizedChannel, userId);
}

export function leaveRealtimeChannel(channel: string, userId?: string | null) {
  const normalizedChannel = normalizeString(channel);
  if (!normalizedChannel) return;

  joinedRealtimeChannels.delete(normalizedChannel);
  emitLeaveRealtimeChannel(normalizedChannel, userId);
}

export function joinWalletCoreChannel(channel: string, userId?: string | null) {
  const normalizedChannel = normalizeString(channel);
  if (!normalizedChannel) return;

  joinedWalletCoreChannels.add(normalizedChannel);
  emitJoinWalletCoreChannel(normalizedChannel, userId);
}

export function leaveWalletCoreChannel(channel: string, userId?: string | null) {
  const normalizedChannel = normalizeString(channel);
  if (!normalizedChannel) return;

  joinedWalletCoreChannels.delete(normalizedChannel);
  emitLeaveWalletCoreChannel(normalizedChannel, userId);
}

export function joinVideoCallRoom(roomId: string, userId?: string | null) {
  const normalizedRoomId = normalizeString(roomId);
  if (!normalizedRoomId) return;

  joinedVideoCallRooms.add(normalizedRoomId);
  emitJoinVideoCallRoom(normalizedRoomId, userId);
}

export function leaveVideoCallRoom(roomId: string, userId?: string | null) {
  const normalizedRoomId = normalizeString(roomId);
  if (!normalizedRoomId) return;

  joinedVideoCallRooms.delete(normalizedRoomId);
  emitLeaveVideoCallRoom(normalizedRoomId, userId);
}

export function emitTypingStart(roomId: string, userId?: string | null) {
  const resolvedUserId = normalizeString(userId) ?? activeUserId;
  if (!roomId.trim() || !resolvedUserId) return;

  emitEventIfConnected(
    ["typing:start", "typing.start", "typing_start", "typing"],
    {
      roomId,
      chatId: roomId,
      userId: resolvedUserId,
      at: new Date().toISOString(),
    },
    resolvedUserId,
  );
}

export function emitTypingStop(roomId: string, userId?: string | null) {
  const resolvedUserId = normalizeString(userId) ?? activeUserId;
  if (!roomId.trim() || !resolvedUserId) return;

  emitEventIfConnected(
    ["typing:stop", "typing.stop", "typing_stop", "stop_typing"],
    {
      roomId,
      chatId: roomId,
      userId: resolvedUserId,
      at: new Date().toISOString(),
    },
    resolvedUserId,
  );
}

export function emitMessageDelivered(
  roomId: string,
  messageId: string,
  userId?: string | null,
) {
  const resolvedUserId = normalizeString(userId) ?? activeUserId;
  const normalizedMessageId = normalizeString(messageId);
  if (!roomId.trim() || !normalizedMessageId || !resolvedUserId) return;

  emitEventIfConnected(
    ["message:delivered", "message.delivered", "message_delivered"],
    {
      roomId,
      chatId: roomId,
      messageId: normalizedMessageId,
      userId: resolvedUserId,
      at: new Date().toISOString(),
    },
    resolvedUserId,
  );
}

export function emitMessageRead(
  roomId: string,
  messageId: string,
  userId?: string | null,
) {
  const resolvedUserId = normalizeString(userId) ?? activeUserId;
  const normalizedMessageId = normalizeString(messageId);
  if (!roomId.trim() || !normalizedMessageId || !resolvedUserId) return;

  emitEventIfConnected(
    ["message:read", "message.read", "message_read"],
    {
      roomId,
      chatId: roomId,
      messageId: normalizedMessageId,
      userId: resolvedUserId,
      at: new Date().toISOString(),
    },
    resolvedUserId,
  );
}

export function emitPresenceOnline(userId?: string | null) {
  const resolvedUserId = normalizeString(userId) ?? activeUserId;
  if (!resolvedUserId) return;

  const target = ensureSocket(resolvedUserId);
  if (!target.connected) return;
  emitPresence(target, resolvedUserId, true);
}

export function emitPresenceOffline(userId?: string | null) {
  const resolvedUserId = normalizeString(userId) ?? activeUserId;
  if (!resolvedUserId) return;

  const target = ensureSocket(resolvedUserId);
  if (!target.connected) return;
  emitPresence(target, resolvedUserId, false);
}

export function requestPresenceSnapshot(roomId?: string | null, userId?: string | null) {
  const resolvedUserId = normalizeString(userId) ?? activeUserId;
  if (!resolvedUserId) return;

  const normalizedRoomId = normalizeString(roomId);

  emitEventIfConnected(
    [
      "presence:snapshot:request",
      "presence.snapshot.request",
      "presence:state:request",
      "chat:presence:snapshot:request",
      "presence_snapshot_request",
      "presence:request",
    ],
    {
      roomId: normalizedRoomId,
      chatId: normalizedRoomId,
      userId: resolvedUserId,
      requesterUserId: resolvedUserId,
      at: new Date().toISOString(),
    },
    resolvedUserId,
  );
}

export function emitVideoCallSignal<T = unknown>(
  payload: SuperAppVideoCallSignalPayload<T>,
  userId?: string | null,
) {
  const resolvedUserId =
    normalizeString(userId) ??
    normalizeString(payload.fromUserId) ??
    activeUserId;

  const roomId = normalizeString(payload.chatId);
  if (!roomId || !resolvedUserId) return;

  emitEventIfConnected(
    [
      "video:call:signal",
      "video.call.signal",
      "video_call_signal",
      "call:signal",
      "call.signal",
    ],
    {
      chatId: roomId,
      roomId,
      peerId: normalizeString(payload.peerId),
      fromUserId: resolvedUserId,
      targetUserId: normalizeString(payload.targetUserId),
      message: payload.message,
      at: new Date().toISOString(),
    },
    resolvedUserId,
  );
}

