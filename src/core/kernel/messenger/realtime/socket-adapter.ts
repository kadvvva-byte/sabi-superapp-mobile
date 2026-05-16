import { io, type Socket } from "socket.io-client";

import type {
  MessengerRealtimeClientEventInput,
  MessengerRealtimeSocketConfig,
} from "./types";

type AdapterHandlers = {
  onConnect?: (socketId: string | null) => void;
  onDisconnect?: (reason: string) => void;
  onConnectError?: (error: unknown) => void;
  onEvent?: (eventName: string, payload: unknown) => void;
};

const SERVER_TO_CLIENT_EVENTS = [
  "realtime:event",

  "presence:online",
  "presence:offline",
  "presence:update",
  "presence:snapshot",
  "presence.snapshot",
  "presence:state",
  "presence:state:response",
  "presence.snapshot.response",
  "presence_state",
  "presence.online",
  "presence.offline",
  "chat:presence:online",
  "chat_presence_online",
  "chat:presence:offline",
  "chat_presence_offline",
  "chat:presence:snapshot",
  "chat_presence_snapshot",
  "user.online",
  "user.offline",
  "user_online",
  "user_offline",

  "typing:start",
  "typing_start",
  "typing.start",
  "typing",
  "user_typing",
  "chat:typing:start",
  "typing:changed",
  "typing:stop",
  "typing_stop",
  "typing.stop",
  "stop_typing",
  "user_stop_typing",
  "chat:typing:stop",

  "chat:created",
  "chat.created",
  "room:upserted",
  "rooms:upserted",
  "chat:room:upserted",
  "room.upserted",
  "rooms.upserted",

  "message.created",
  "message.sent",
  "message:new",
  "new_message",
  "chat:message",
  "chat:message:new",
  "message:edited",
  "message_edited",
  "message:deleted",
  "message_deleted",
  "message:delivered",
  "message_delivered",
  "chat:message:delivered",
  "message:read",
  "message_read",
  "chat:message:read",

  "chat:join",
  "chat.join",
  "join_chat",
  "room:join",
  "room.join",
  "messenger:room:join",
  "chat:leave",
  "chat.leave",
  "leave_chat",
  "room:leave",
  "room.leave",
  "messenger:room:leave",
  "chat:room:joined",
  "chat:room:left",

  "realtime:channel:join",
  "realtime.channel.join",
  "channel:join",
  "channel.join",
  "realtime:channel:leave",
  "realtime.channel.leave",
  "channel:leave",
  "channel.leave",

  "call:incoming",
  "call:accepted",
  "call:declined",
  "call:ended",
  "audio:call:signal",
  "audio.call.signal",
  "audio_call_signal",
  "video:call:join",
  "video.call.join",
  "video_call_join",
  "call:room:join",
  "call.room.join",
  "video:call:leave",
  "video.call.leave",
  "video_call_leave",
  "call:room:leave",
  "call.room.leave",
  "video:call:signal",
  "video.call.signal",
  "video_call_signal",
  "call:signal",
  "call.signal",
  "video-call:signal",
  "video_call:signal",
  "webrtc:signal",
  "video-call:peer-joined",
  "video_call:peer_joined",
  "video-call:peer-left",
  "video_call:peer_left",
  "video-call:screen-share-started",
  "video_call:screen_share_started",
  "video-call:screen-share-stopped",
  "video_call:screen_share_stopped",
  "video-call:screen-share-failed",
  "video_call:screen_share_failed",

  "messenger:error",
] as const;

const SERVER_TO_CLIENT_EVENT_SET = new Set<string>(SERVER_TO_CLIENT_EVENTS);

const CLIENT_EVENT_ALIASES: Record<string, string[]> = {
  "presence:online": [
    "presence.online",
    "chat:presence:online",
    "chat_presence_online",
    "user_online",
  ],
  "presence:offline": [
    "presence.offline",
    "chat:presence:offline",
    "chat_presence_offline",
    "user_offline",
  ],
  "presence:snapshot:request": [
    "presence.snapshot.request",
    "presence:state:request",
    "chat:presence:snapshot:request",
    "presence_snapshot_request",
    "presence:request",
  ],
  "typing:start": ["typing.start", "typing_start", "typing", "chat:typing:start"],
  "typing:stop": ["typing.stop", "typing_stop", "stop_typing", "chat:typing:stop"],
  "message:delivered": ["message.delivered", "message_delivered", "chat:message:delivered"],
  "message:read": ["message.read", "message_read", "chat:message:read"],
  "message:new": ["new_message", "chat:message", "chat:message:new"],
  "message:edited": ["message_edited"],
  "message:deleted": ["message_deleted"],
  "chat:join": ["chat.join", "join_chat", "room:join", "room.join", "messenger:room:join"],
  "chat:leave": ["chat.leave", "leave_chat", "room:leave", "room.leave", "messenger:room:leave"],
  "realtime:channel:join": ["realtime.channel.join", "channel:join", "channel.join"],
  "realtime:channel:leave": ["realtime.channel.leave", "channel:leave", "channel.leave"],
  "video:call:join": ["video.call.join", "video_call_join", "call:room:join", "call.room.join"],
  "video:call:leave": ["video.call.leave", "video_call_leave", "call:room:leave", "call.room.leave"],
  "video:call:signal": ["video.call.signal", "video_call_signal", "call:signal", "call.signal"],
  "video-call:signal": ["video_call:signal", "webrtc:signal", "video:call:signal"],
};

let socket: Socket | null = null;

function normalizePath(value?: string | null) {
  const normalized = typeof value === "string" && value.trim() ? value.trim() : "/socket.io";
  return normalized.startsWith("/") ? normalized : `/${normalized}`;
}

function normalizeUrl(value: string) {
  return value.replace(/\/+$/, "");
}

function uniqueEventNames(eventName: string) {
  return Array.from(new Set([eventName, ...(CLIENT_EVENT_ALIASES[eventName] ?? [])]));
}

export function getMessengerRealtimeSocket() {
  return socket;
}

export function isMessengerRealtimeSocketConnected() {
  return Boolean(socket?.connected);
}

export function connectMessengerRealtimeSocket(
  config: MessengerRealtimeSocketConfig,
  handlers: AdapterHandlers,
) {
  const nextUrl = normalizeUrl(config.socketUrl ?? "");
  const nextPath = normalizePath(config.socketPath);

  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }

  socket = io(nextUrl, {
    path: nextPath,
    transports: ["websocket"],
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 300,
    reconnectionDelayMax: 2500,
    timeout: 5000,
    auth: {
      userId: config.auth.userId,
      token: config.auth.token ?? config.auth.accessToken ?? undefined,
      accessToken: config.auth.accessToken ?? config.auth.token ?? undefined,
    },
    query: {
      ...(config.query ?? {}),
      userId: config.auth.userId,
    },
    extraHeaders: config.headers ?? undefined,
  });

  socket.on("connect", () => {
    handlers.onConnect?.(socket?.id ?? null);
  });

  socket.on("disconnect", (reason: string) => {
    handlers.onDisconnect?.(reason);
  });

  socket.on("connect_error", (error: unknown) => {
    handlers.onConnectError?.(error);
  });

  SERVER_TO_CLIENT_EVENTS.forEach((eventName) => {
    socket?.on(eventName, (payload: unknown) => {
      handlers.onEvent?.(eventName, payload);
    });
  });

  const socketWithAny = socket as Socket & {
    onAny?: (listener: (eventName: string, ...args: unknown[]) => void) => void;
  };

  if (typeof socketWithAny.onAny === "function") {
    socketWithAny.onAny((eventName: string, ...args: unknown[]) => {
      if (SERVER_TO_CLIENT_EVENT_SET.has(eventName)) return;
      handlers.onEvent?.(eventName, args.length > 1 ? args : args[0]);
    });
  }

  socket.connect();
  return socket;
}

export function disconnectMessengerRealtimeSocket() {
  if (!socket) return;
  socket.removeAllListeners();
  socket.disconnect();
  socket = null;
}

export function emitMessengerRealtimeSocketEvent(input: MessengerRealtimeClientEventInput) {
  if (!socket?.connected) {
    return false;
  }

  const payload = input.payload ?? {};
  const eventNames = uniqueEventNames(input.eventName);

  eventNames.forEach((eventName, index) => {
    if (index === 0 && input.ack) {
      socket?.emit(eventName, payload, input.ack);
      return;
    }

    socket?.emit(eventName, payload);
  });

  return true;
}



