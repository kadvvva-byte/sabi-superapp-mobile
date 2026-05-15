export * from "./chatRoomPersistence";

import type {
  RealtimeIncomingMessage,
  RealtimeMessageType,
  RealtimeAnimatedPayload,
  PersistedChatPresenceState,
} from "./chatRoomPersistence";
import {
  hydratePersistedRealtimeMessages,
  persistRealtimeMessagesSnapshot,
  persistChatPresenceSnapshot,
} from "./chatRoomPersistence";

export type RealtimeConnectionState =
  | "connecting"
  | "connected"
  | "reconnecting"
  | "disconnected";

export type RealtimeSendPayload = {
  clientId?: string | null;
  chatId: string;
  userId: string;
  type: RealtimeMessageType;
  content?: string | null;
  replyToMessageId?: string | null;
  previewTitle?: string | null;
  previewSubtitle?: string | null;
  fileLabel?: string | null;
  mimeType?: string | null;
  mediaUri?: string | null;
  durationMs?: number | null;
  durationLabel?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  animatedPayload?: RealtimeAnimatedPayload | null;
};

type ConnectParams = {
  chatId: string;
  userId: string;
  peerUserId?: string | null;
  roomType?: string | null;
  callbacks: {
    onMessageNew?: (message: RealtimeIncomingMessage) => void;
    onMessageDelivered?: (payload: {
      messageId: string;
      userId: string;
      at: string;
    }) => void;
    onMessageRead?: (payload: {
      messageId: string;
      userId: string;
      at: string;
    }) => void;
    onTypingStart?: (payload: { userId: string }) => void;
    onTypingStop?: (payload: { userId: string }) => void;
    onPresenceOnline?: (payload: {
      userId: string;
      at?: string | null;
      lastSeenAt?: string | null;
    }) => void;
    onPresenceOffline?: (payload: {
      userId: string;
      at?: string | null;
      lastSeenAt?: string | null;
    }) => void;
    onConnectionState?: (state: RealtimeConnectionState) => void;
  };
};

export type RealtimeCallSignalPayload<T = unknown> = {
  chatId: string;
  peerId?: string | null;
  fromUserId?: string | null;
  targetUserId?: string | null;
  message: T;
};

export type RealtimeUploadMediaPayload = {
  chatId: string;
  userId?: string | null;
  uri: string;
  name: string;
  mimeType: string;
  replyToMessageId?: string | null;
  type: "VOICE" | "VIDEO" | "IMAGE" | "DOCUMENT";
};

type RoomMessageIdMaps = {
  exposedToServer: Map<string, string>;
  serverToExposed: Map<string, string>;
};

const ROOM_MESSAGE_ID_MAPS = new Map<string, RoomMessageIdMaps>();

function warnLegacy(message: string) {
  console.warn(`[chatRoomRealtime][legacy-disabled] ${message}`);
}

function nowIso() {
  return new Date().toISOString();
}

function randomId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function getRoomMessageIdMaps(chatId: string): RoomMessageIdMaps {
  const existing = ROOM_MESSAGE_ID_MAPS.get(chatId);
  if (existing) return existing;

  const created: RoomMessageIdMaps = {
    exposedToServer: new Map<string, string>(),
    serverToExposed: new Map<string, string>(),
  };

  ROOM_MESSAGE_ID_MAPS.set(chatId, created);
  return created;
}

function normalizeRealtimeMessageType(value: unknown): RealtimeMessageType {
  const normalized = String(value ?? "").trim().toUpperCase();

  switch (normalized) {
    case "VOICE":
    case "IMAGE":
    case "VIDEO":
    case "DOCUMENT":
    case "CONTACT":
    case "LOCATION":
    case "GIFT":
    case "ANIMATED_REACTION":
    case "ANIMATED_EMOJI":
      return normalized;
    default:
      return "TEXT";
  }
}

function resolveServerMessageId(chatId: string, messageId: string) {
  const maps = getRoomMessageIdMaps(chatId);
  return maps.exposedToServer.get(messageId) ?? messageId;
}

/**
 * Legacy export kept only for compatibility.
 * Current user id must now come directly from kernel in ChatRoomScreen.
 */
export function resolveRealtimeCurrentUserId() {
  return "";
}

/**
 * Legacy upload shim is intentionally disabled.
 * ChatRoomScreen must upload media through kernel directly.
 */
export async function uploadRealtimeMedia(_payload: RealtimeUploadMediaPayload) {
  warnLegacy("uploadRealtimeMedia is disabled. Use kernel directly from ChatRoomScreen.");
  throw new Error(
    "chatRoomRealtime.ts no longer uploads media. Use messenger kernel directly.",
  );
}

/**
 * Legacy connection shim is intentionally detached from kernel/UI main flow.
 * ChatRoomScreen must subscribe to kernel directly.
 */
export function connectChatRealtime(params: ConnectParams) {
  params.callbacks.onConnectionState?.("disconnected");
  warnLegacy("connectChatRealtime is disabled. ChatRoomScreen must connect to kernel directly.");
  return () => {};
}

/**
 * Legacy send shim.
 * Keeps optimistic local persistence only, without any kernel/realtime delivery.
 * ChatRoomScreen must send messages through kernel directly.
 */
export async function sendRealtimeMessage(
  payload: RealtimeSendPayload,
): Promise<RealtimeIncomingMessage> {
  warnLegacy("sendRealtimeMessage is legacy-only. Use kernel directly from ChatRoomScreen.");

  const clientId = payload.clientId?.trim() || randomId("local");
  const createdAt = nowIso();

  const optimistic: RealtimeIncomingMessage = {
    id: clientId,
    clientId,
    chatId: payload.chatId,
    userId: payload.userId,
    type: normalizeRealtimeMessageType(payload.type),
    content: payload.content ?? "",
    createdAt,
    deliveredAt: null,
    readAt: null,
    replyToMessageId: payload.replyToMessageId ?? null,
    previewTitle: payload.previewTitle ?? null,
    previewSubtitle: payload.previewSubtitle ?? null,
    fileLabel: payload.fileLabel ?? null,
    mimeType: payload.mimeType ?? null,
    mediaUri: payload.mediaUri ?? null,
    durationMs: payload.durationMs ?? null,
    durationLabel: payload.durationLabel ?? null,
    latitude: payload.latitude ?? null,
    longitude: payload.longitude ?? null,
    animatedPayload: payload.animatedPayload ?? null,
  };

  const maps = getRoomMessageIdMaps(payload.chatId);
  maps.exposedToServer.set(clientId, clientId);
  maps.serverToExposed.set(clientId, clientId);

  const current = await hydratePersistedRealtimeMessages(payload.chatId);
  const next = [...current.filter((item) => item.id !== optimistic.id), optimistic].sort(
    (a, b) => String(a.createdAt).localeCompare(String(b.createdAt)),
  );

  await persistRealtimeMessagesSnapshot(payload.chatId, next);

  return optimistic;
}

export async function sendTextMessageRealtime(payload: {
  clientId?: string | null;
  chatId: string;
  userId: string;
  content: string;
  replyToMessageId?: string | null;
}) {
  return sendRealtimeMessage({
    clientId: payload.clientId,
    chatId: payload.chatId,
    userId: payload.userId,
    type: "TEXT",
    content: payload.content,
    replyToMessageId: payload.replyToMessageId ?? null,
  });
}

export async function sendLocationMessageRealtime(payload: {
  clientId?: string | null;
  chatId: string;
  userId: string;
  title: string;
  latitude: number;
  longitude: number;
  replyToMessageId?: string | null;
}) {
  return sendRealtimeMessage({
    clientId: payload.clientId,
    chatId: payload.chatId,
    userId: payload.userId,
    type: "LOCATION",
    content: payload.title,
    latitude: payload.latitude,
    longitude: payload.longitude,
    replyToMessageId: payload.replyToMessageId ?? null,
    previewTitle: payload.title,
    previewSubtitle: `${payload.latitude.toFixed(5)}, ${payload.longitude.toFixed(5)}`,
  });
}

export async function emitMessageDelivered(
  chatId: string,
  messageId: string,
  _userId: string,
) {
  const serverMessageId = resolveServerMessageId(chatId, messageId);
  void serverMessageId;
  warnLegacy("emitMessageDelivered is disabled. Use kernel directly from ChatRoomScreen.");
}

export async function emitMessageRead(
  chatId: string,
  messageId: string,
  _userId: string,
) {
  const serverMessageId = resolveServerMessageId(chatId, messageId);
  void serverMessageId;
  warnLegacy("emitMessageRead is disabled. Use kernel directly from ChatRoomScreen.");
}

export function emitTypingStart(_chatId: string, _userId: string) {
  warnLegacy("emitTypingStart is disabled. Use messengerKernelFacade.emitTyping().");
}

export function emitTypingStop(_chatId: string, _userId: string) {
  warnLegacy("emitTypingStop is disabled. Use messengerKernelFacade.emitTyping().");
}

export function joinRealtimeCallRoom(_chatId: string, _userId?: string) {
  warnLegacy("joinRealtimeCallRoom is disabled here. Use kernel/call runtime directly.");
}

export function leaveRealtimeCallRoom(_chatId: string) {
  warnLegacy("leaveRealtimeCallRoom is disabled here. Use kernel/call runtime directly.");
}

export function emitRealtimeCallSignal<T = unknown>(
  _payload: RealtimeCallSignalPayload<T>,
  _userId?: string,
) {
  warnLegacy("emitRealtimeCallSignal is disabled here. Use kernel/call runtime directly.");
}

export function onRealtimeCallSignal<T = unknown>(
  _handler: (payload: RealtimeCallSignalPayload<T>) => void,
  _userId?: string,
) {
  warnLegacy("onRealtimeCallSignal is disabled here. Use kernel/call runtime directly.");
  return () => {};
}

export function onRealtimeCallPeerJoined<T = { chatId: string; peerId?: string }>(
  _handler: (payload: T) => void,
  _userId?: string,
) {
  warnLegacy("onRealtimeCallPeerJoined is disabled here. Use kernel/call runtime directly.");
  return () => {};
}

export function onRealtimeCallPeerLeft<T = { chatId: string; peerId?: string }>(
  _handler: (payload: T) => void,
  _userId?: string,
) {
  warnLegacy("onRealtimeCallPeerLeft is disabled here. Use kernel/call runtime directly.");
  return () => {};
}

export async function persistLegacyChatPresenceSnapshot(
  chatId: string,
  snapshot: PersistedChatPresenceState,
): Promise<void> {
  await persistChatPresenceSnapshot(chatId, snapshot);
}