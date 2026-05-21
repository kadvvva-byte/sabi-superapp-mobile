import {
  getMessengerKernelState,
  patchMessengerKernelRoomLocalState,
  removeMessengerKernelMessages,
  setMessengerKernelPresence,
  setMessengerKernelRealtimeStatus,
  setMessengerKernelTypingEntry,
  upsertMessengerKernelMessages,
} from "../core/store";
import type {
  MessengerKernelMessageRecord,
  MessengerKernelPresenceEntry,
  MessengerKernelTypingEntry,
  MessengerRealtimeStatus,
} from "../core/types";
import {
  getMessengerKernelSession,
  resolveMessengerKernelSession,
} from "../session/service";

import {
  incrementPrivateChatUnread,
  markPrivateChatRead,
  upsertPrivateChatProfile,
} from "../../../../modules/messenger/private/privateChatRuntime";
import {
  connectMessengerRealtimeSocket,
  disconnectMessengerRealtimeSocket,
  emitMessengerRealtimeSocketEvent,
  getMessengerRealtimeSocket,
} from "./socket-adapter";
import type {
  MessengerRealtimeClientEventInput,
  MessengerRealtimeConnectionSnapshot,
  MessengerRealtimeDiagnosticsSnapshot,
  MessengerRealtimeJournalEntry,
  MessengerRealtimeServiceEvent,
  MessengerRealtimeServiceListener,
  MessengerRealtimeTwoDeviceCheckInput,
  MessengerRealtimeTwoDeviceCheckResult,
} from "./types";

const listeners = new Set<MessengerRealtimeServiceListener>();
const MAX_JOURNAL_ENTRIES = 80;
const SABI_PRESENCE_HEARTBEAT_MS = 25_000;

let journalSeq = 0;
let inboundCount = 0;
let outboundCount = 0;
let localOnlyCount = 0;
let lastInboundAt: string | null = null;
let lastOutboundAt: string | null = null;
let eventJournal: MessengerRealtimeJournalEntry[] = [];

let connectionSnapshot: MessengerRealtimeConnectionSnapshot = {
  status: "idle",
  connected: false,
  socketId: null,
  userId: null,
  updatedAt: new Date().toISOString(),
};

let messengerPresenceActive = false;
let lastPresenceStatusSent: "online" | "offline" | null = null;
let lastPresenceStatusSentAt: string | null = null;
let presenceHeartbeatTimer: ReturnType<typeof setInterval> | null = null;
let lastPresenceHeartbeatSentAt: string | null = null;

function nowIso() {
  return new Date().toISOString();
}

function normalizeString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function normalizeNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

const SABI_REACTION_CONTROL_PREFIX = "__SABI_REACTION_V1__:";

function isHiddenReactionControlText(value: unknown) {
  return String(value ?? "").trim().startsWith(SABI_REACTION_CONTROL_PREFIX);
}

function resolveCurrentUserIdForRealtime() {
  const state = getMessengerKernelState();
  try {
    const session = getMessengerKernelSession();
    return normalizeString(session.currentUserId) ?? normalizeString(state.currentUserId);
  } catch {
    return normalizeString(state.currentUserId);
  }
}

function isMessageFromCurrentUser(message: MessengerKernelMessageRecord) {
  const currentUserId = resolveCurrentUserIdForRealtime();
  const senderUserId =
    normalizeString(message.userId) ??
    normalizeString((message as Record<string, unknown>).senderId) ??
    normalizeString((message as Record<string, unknown>).authorId) ??
    normalizeString((message as Record<string, unknown>).fromUserId);

  return Boolean(currentUserId && senderUserId && currentUserId === senderUserId);
}

function isUnreadCountableMessage(message: MessengerKernelMessageRecord) {
  if (isMessageFromCurrentUser(message)) return false;
  if (isHiddenReactionControlText(message.content)) return false;
  if (isHiddenReactionControlText(message.text)) return false;
  if (isHiddenReactionControlText((message as Record<string, unknown>).previewTitle)) return false;
  return true;
}

function pickIncomingChatName(message: MessengerKernelMessageRecord) {
  const record = message as Record<string, unknown>;
  return (
    normalizeString(record.senderName) ??
    normalizeString(record.authorName) ??
    normalizeString(record.displayName) ??
    normalizeString(record.name) ??
    normalizeString(record.username) ??
    normalizeString(record.phone) ??
    normalizeString(message.userId) ??
    normalizeString(message.chatId) ??
    "Chat"
  );
}

function pickIncomingPeerUserId(message: MessengerKernelMessageRecord) {
  const record = message as Record<string, unknown>;
  const currentUserId = resolveCurrentUserIdForRealtime();
  const candidates = [
    normalizeString(message.userId),
    normalizeString(record.senderId),
    normalizeString(record.authorId),
    normalizeString(record.fromUserId),
    normalizeString(record.peerUserId),
  ].filter((value): value is string => Boolean(value));

  return candidates.find((value) => !currentUserId || value !== currentUserId) ?? null;
}


// SABI_UNREAD_DEDUPE_BY_REAL_MESSAGE
const SABI_UNREAD_DEDUPE_TTL_MS = 90_000;
const sabiAppliedUnreadFingerprints = new Map<string, number>();

function cleanSabiUnreadPart(value: unknown): string {
  return String(value ?? "").trim();
}

function normalizeSabiUnreadPart(value: unknown): string {
  return cleanSabiUnreadPart(value).toLowerCase();
}

function getSabiUnreadMessageAliases(message: MessengerKernelMessageRecord): string[] {
  const record = message as Record<string, unknown>;

  return Array.from(
    new Set(
      [
        message.id,
        record.messageId,
        message.clientId,
        record.clientMessageId,
        record.localId,
        record.tempId,
      ]
        .map((value) => normalizeSabiUnreadPart(value))
        .filter(Boolean),
    ),
  );
}

function getSabiUnreadMessageSender(message: MessengerKernelMessageRecord): string {
  const record = message as Record<string, unknown>;

  return (
    normalizeSabiUnreadPart(message.userId) ||
    normalizeSabiUnreadPart(record.senderId) ||
    normalizeSabiUnreadPart(record.authorId) ||
    normalizeSabiUnreadPart(record.fromUserId)
  );
}

function getSabiUnreadMessageBody(message: MessengerKernelMessageRecord): string {
  const record = message as Record<string, unknown>;

  return (
    cleanSabiUnreadPart(message.content) ||
    cleanSabiUnreadPart(message.text) ||
    cleanSabiUnreadPart(record.body) ||
    cleanSabiUnreadPart(record.previewTitle) ||
    cleanSabiUnreadPart(record.fileName) ||
    cleanSabiUnreadPart(record.mediaUri) ||
    cleanSabiUnreadPart(record.url)
  );
}

function getSabiUnreadMessageTimeKey(message: MessengerKernelMessageRecord): string {
  const record = message as Record<string, unknown>;
  const raw =
    cleanSabiUnreadPart(message.createdAt) ||
    cleanSabiUnreadPart(record.sentAt) ||
    cleanSabiUnreadPart(record.occurredAt) ||
    cleanSabiUnreadPart(record.at) ||
    cleanSabiUnreadPart(record.updatedAt);

  if (!raw) return "";

  const parsed = Date.parse(raw);
  if (!Number.isFinite(parsed)) return raw;

  return String(Math.floor(parsed / 1000));
}

function buildSabiUnreadFingerprint(chatId: string, message: MessengerKernelMessageRecord): string {
  const aliases = getSabiUnreadMessageAliases(message);
  if (aliases.length) return `id:${chatId}:${aliases.join("|")}`;

  return [
    "body",
    chatId,
    getSabiUnreadMessageSender(message),
    getSabiUnreadMessageTimeKey(message),
    normalizeSabiUnreadPart((message as Record<string, unknown>).type),
    normalizeSabiUnreadPart(getSabiUnreadMessageBody(message)),
  ].join(":");
}

function consumeSabiUnreadFingerprint(fingerprint: string): boolean {
  const now = Date.now();

  for (const [key, at] of sabiAppliedUnreadFingerprints) {
    if (now - at > SABI_UNREAD_DEDUPE_TTL_MS) {
      sabiAppliedUnreadFingerprints.delete(key);
    }
  }

  const previous = sabiAppliedUnreadFingerprints.get(fingerprint);
  if (previous && now - previous <= SABI_UNREAD_DEDUPE_TTL_MS) {
    return true;
  }

  sabiAppliedUnreadFingerprints.set(fingerprint, now);
  return false;
}

function hasSabiUnreadMessageAlreadyInStore(
  state: ReturnType<typeof getMessengerKernelState>,
  message: MessengerKernelMessageRecord,
): boolean {
  const aliases = getSabiUnreadMessageAliases(message);

  return aliases.some((id) => Boolean(state.messagesById[id]));
}

function applyUnreadForIncomingMessage(message: MessengerKernelMessageRecord) {
  const chatId = normalizeString(message.chatId ?? (message as Record<string, unknown>).roomId);
  const messageId = normalizeString(message.id);
  if (!chatId || !messageId || !isUnreadCountableMessage(message)) return;

  const state = getMessengerKernelState();
  if (state.messagesById[messageId]) return;
  if (hasSabiUnreadMessageAlreadyInStore(state, message)) return;

  const unreadFingerprint = buildSabiUnreadFingerprint(chatId, message);
  if (consumeSabiUnreadFingerprint(unreadFingerprint)) return;

  const room = state.roomsById[chatId] as Record<string, unknown> | undefined;
  const currentUnread = normalizeNumber(room?.unreadCount) ?? normalizeNumber(room?.unread) ?? 0;
  const nextUnread = Math.max(0, Math.floor(currentUnread)) + 1;
  const updatedAt =
    normalizeString(message.createdAt) ??
    normalizeString((message as Record<string, unknown>).sentAt) ??
    normalizeString((message as Record<string, unknown>).occurredAt) ??
    nowIso();

  patchMessengerKernelRoomLocalState(chatId, {
    unread: nextUnread,
    unreadCount: nextUnread,
    updatedAt,
  });

  void incrementPrivateChatUnread(chatId, 1).then((profile) => {
    const record = message as Record<string, unknown>;
    const peerUserId = pickIncomingPeerUserId(message);
    return upsertPrivateChatProfile({
      chatId,
      roomType: normalizeString(record.roomType) ?? "direct",
      name: normalizeString(profile?.name) ?? pickIncomingChatName(message),
      avatarLetter: normalizeString(profile?.avatarLetter) ?? undefined,
      phone: normalizeString(profile?.phone) ?? normalizeString(record.phone) ?? normalizeString(record.senderPhone) ?? undefined,
      username: normalizeString(profile?.username) ?? normalizeString(record.username) ?? normalizeString(record.senderUsername) ?? undefined,
      verified: Boolean(profile?.verified ?? record.verified),
      currentUserId: resolveCurrentUserIdForRealtime() ?? undefined,
      peerUserId: normalizeString(profile?.peerUserId) ?? peerUserId ?? undefined,
      avatarUrl:
        normalizeString(profile?.avatarUrl) ??
        normalizeString(record.avatarUrl) ??
        normalizeString(record.photoUrl) ??
        undefined,
      photoUrl:
        normalizeString(profile?.photoUrl) ??
        normalizeString(record.photoUrl) ??
        normalizeString(record.avatarUrl) ??
        undefined,
      unreadCount: Math.max(
        nextUnread,
        typeof profile?.unreadCount === "number" && Number.isFinite(profile.unreadCount)
          ? profile.unreadCount
          : 0,
      ),
      deleted: false,
      deletedAt: null,
      hiddenFromMain: profile?.hiddenFromMain,
      updatedAt,
    });
  }).catch(() => undefined);
}


// SABI_READ_ACK_ACTOR_SCOPE_FIX
function toSabiAckRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function pickSabiAckExplicitActor(record: Record<string, unknown>): string | null {
  return (
    normalizeString(record.__sabiAckActorUserId) ??
    normalizeString(record.__sabiAckUserId) ??
    normalizeString(record.ackUserId) ??
    normalizeString(record.actorUserId) ??
    normalizeString(record.readerUserId) ??
    normalizeString(record.readByUserId) ??
    normalizeString(record.seenByUserId) ??
    normalizeString(record.deliveredByUserId) ??
    normalizeString(record.recipientUserId) ??
    normalizeString(record.receiverUserId) ??
    normalizeString(record.targetUserId) ??
    normalizeString(record.participantUserId) ??
    normalizeString(record.currentUserId)
  );
}

function looksLikeSabiNestedMessageRecord(record: Record<string, unknown>): boolean {
  return Boolean(
    record.content ||
      record.text ||
      record.body ||
      record.createdAt ||
      record.sentAt ||
      record.occurredAt ||
      record.senderId ||
      record.authorId ||
      record.fromUserId ||
      record.previewTitle ||
      record.mediaUri ||
      record.fileName,
  );
}

function pickSabiAckActorFromRecord(
  record: Record<string, unknown>,
  allowGenericUserId: boolean,
): string | null {
  const explicit = pickSabiAckExplicitActor(record);
  if (explicit) return explicit;

  if (allowGenericUserId && !looksLikeSabiNestedMessageRecord(record)) {
    return normalizeString(record.userId);
  }

  return null;
}

function pickSabiMessageAckActorUserId(
  payload: unknown,
  nestedSource?: Record<string, unknown>,
): string | null {
  const root = toSabiAckRecord(payload);
  const rootPayload = toSabiAckRecord(root.payload);
  const rootData = toSabiAckRecord(root.data);
  const rootAck = toSabiAckRecord(root.ack);
  const rootReceipt = toSabiAckRecord(root.receipt);

  for (const record of [root, rootPayload, rootData, rootAck, rootReceipt]) {
    const actor = pickSabiAckActorFromRecord(record, true);
    if (actor) return actor;
  }

  const source =
    nestedSource && Object.keys(nestedSource).length
      ? nestedSource
      : toSabiAckRecord(root.message ?? root.payload ?? root.data);

  // Important: do NOT use senderId/authorId/fromUserId here.
  // For read receipts those fields usually belong to the original sender,
  // not to the user who opened/read the chat.
  return pickSabiAckActorFromRecord(source, false);
}

function applyReadAckToRoom(payload: Record<string, unknown>, fallbackChatId?: string | null) {
  const chatId = resolveChatId(payload) ?? normalizeString(fallbackChatId);
  if (!chatId) return;

  const ackUserId = pickSabiMessageAckActorUserId(payload);
  const currentUserId = resolveCurrentUserIdForRealtime();
  if (!ackUserId || !currentUserId || ackUserId !== currentUserId) return;

  const at =
    normalizeString(payload.at) ??
    normalizeString(payload.updatedAt) ??
    normalizeString(payload.readAt) ??
    normalizeString(payload.seenAt) ??
    nowIso();

  patchMessengerKernelRoomLocalState(chatId, {
    unread: 0,
    unreadCount: 0,
    lastReadAt: at,
  });

  void markPrivateChatRead(chatId).catch(() => undefined);
}

function readObject(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function pickNestedPayload(value: unknown) {
  const source = readObject(value);
  const nested = readObject(source.message ?? source.payload ?? source.data ?? value);
  return Object.keys(nested).length ? nested : source;
}

function pickUserId(source: Record<string, unknown>) {
  return (
    normalizeString(source.userId) ??
    normalizeString(source.senderId) ??
    normalizeString(source.authorId) ??
    normalizeString(source.fromUserId) ??
    normalizeString(source.participantUserId) ??
    normalizeString(source.id)
  );
}

function pickMessageId(source: Record<string, unknown>) {
  return (
    normalizeString(source.messageId) ??
    normalizeString(source.id) ??
    normalizeString(source.clientId)
  );
}

function pushJournal(entry: Omit<MessengerRealtimeJournalEntry, "id" | "at" | "chatId" | "userId" | "messageId"> & {
  at?: string | null;
  chatId?: string | null;
  userId?: string | null;
  messageId?: string | null;
}) {
  const at = normalizeString(entry.at) ?? nowIso();
  const payloadRecord = pickNestedPayload(entry.payload);
  const nextEntry: MessengerRealtimeJournalEntry = {
    id: `rt-${++journalSeq}`,
    direction: entry.direction,
    eventName: entry.eventName,
    at,
    chatId: normalizeString(entry.chatId) ?? resolveChatId(payloadRecord),
    userId: normalizeString(entry.userId) ?? pickUserId(payloadRecord),
    messageId: normalizeString(entry.messageId) ?? pickMessageId(payloadRecord),
    payload: entry.payload,
    deliveredToSocket: entry.deliveredToSocket,
  };

  if (nextEntry.direction === "in") {
    inboundCount += 1;
    lastInboundAt = at;
  } else if (nextEntry.direction === "out") {
    outboundCount += 1;
    lastOutboundAt = at;
  } else {
    localOnlyCount += 1;
  }

  eventJournal = [nextEntry, ...eventJournal].slice(0, MAX_JOURNAL_ENTRIES);
  return nextEntry;
}


function updateConnection(
  status: MessengerRealtimeStatus,
  options?: {
    socketId?: string | null;
    error?: unknown;
  },
) {
  const state = getMessengerKernelState();
  connectionSnapshot = {
    status,
    connected: status === "connected",
    socketId: options?.socketId ?? getMessengerRealtimeSocket()?.id ?? null,
    userId: normalizeString(state.currentUserId),
    updatedAt: nowIso(),
  };

  setMessengerKernelRealtimeStatus(status);
  notify({
    type: "connection",
    status,
    at: connectionSnapshot.updatedAt,
    error: options?.error,
  });
}

function notify(event: MessengerRealtimeServiceEvent) {
  listeners.forEach((listener) => listener(event));
}

function emitCurrentUserPresence(status: "online" | "offline", options?: { reason?: string | null; force?: boolean }) {
  const session = getMessengerKernelSession();
  const state = getMessengerKernelState();
  const userId = normalizeString(session.currentUserId) ?? normalizeString(state.currentUserId);
  if (!userId) return false;

  const at = nowIso();
  const lastSeenAt = status === "offline" ? at : null;

  setMessengerKernelPresence({
    userId,
    status,
    lastSeenAt,
    updatedAt: at,
  });

  if (!options?.force && lastPresenceStatusSent === status && connectionSnapshot.connected) {
    return true;
  }

  const sent = sendMessengerRealtimeClientEvent({
    eventName: status === "online" ? "presence:online" : "presence:offline",
    payload: {
      userId,
      status,
      online: status === "online",
      activeProgram: status === "online" ? "messenger" : "background",
      presenceScope: status === "online" ? "messenger_screen" : "not_messenger",
      reason: options?.reason ?? "messenger_presence_scope",
      lastSeenAt,
      at,
    },
  });

  if (sent) {
    lastPresenceStatusSent = status;
    lastPresenceStatusSentAt = at;
  }

  return sent;
}

function emitCurrentUserPresenceHeartbeat(reason = "messenger_presence_heartbeat") {
  if (!messengerPresenceActive || !connectionSnapshot.connected) return false;

  const session = getMessengerKernelSession();
  const state = getMessengerKernelState();
  const userId = normalizeString(session.currentUserId) ?? normalizeString(state.currentUserId);
  if (!userId) return false;

  const at = nowIso();

  setMessengerKernelPresence({
    userId,
    status: "online",
    lastSeenAt: null,
    updatedAt: at,
  });

  const sent = sendMessengerRealtimeClientEvent({
    eventName: "presence:heartbeat",
    payload: {
      userId,
      status: "online",
      online: true,
      activeProgram: "messenger",
      presenceScope: "messenger_screen",
      reason,
      at,
    },
  });

  if (sent) {
    lastPresenceHeartbeatSentAt = at;
  }

  return sent;
}

function stopPresenceHeartbeat() {
  if (!presenceHeartbeatTimer) return;

  clearInterval(presenceHeartbeatTimer);
  presenceHeartbeatTimer = null;
}

function startPresenceHeartbeat() {
  if (presenceHeartbeatTimer || !messengerPresenceActive || !connectionSnapshot.connected) return;

  presenceHeartbeatTimer = setInterval(() => {
    emitCurrentUserPresenceHeartbeat();
  }, SABI_PRESENCE_HEARTBEAT_MS);
}

function emitLocalCustom(eventName: string, payload: unknown) {
  pushJournal({
    direction: "local",
    eventName,
    payload,
  });

  notify({
    type: "custom",
    eventName,
    payload,
  });
}

function resolveChatId(source: Record<string, unknown>) {
  return (
    normalizeString(source.chatId) ??
    normalizeString(source.roomId) ??
    normalizeString(source.conversationId)
  );
}

function eventLooksEdited(source: Record<string, unknown>) {
  const value = normalizeString(source.sourceEventName) ?? normalizeString(source.eventName) ?? normalizeString(source.event);
  if (!value) return false;
  const lower = value.toLowerCase();
  return lower.includes("edited") || lower.includes("updated") || lower.includes("message:update");
}

function normalizeMessage(payload: unknown): MessengerKernelMessageRecord | null {
  const source = readObject(payload);
  const messageSource = readObject(source.message ?? source.payload ?? payload);
  const id =
    normalizeString(messageSource.id) ??
    normalizeString(messageSource.messageId) ??
    normalizeString(messageSource.clientId);
  const chatId = resolveChatId(messageSource) ?? resolveChatId(source);

  if (!id || !chatId) return null;

  const content =
    normalizeString(messageSource.content) ??
    normalizeString(messageSource.text) ??
    normalizeString(messageSource.body);
  const messageMeta =
    messageSource.meta && typeof messageSource.meta === "object"
      ? (messageSource.meta as Record<string, unknown>)
      : {};
  const messageAttachment =
    messageSource.attachment && typeof messageSource.attachment === "object"
      ? (messageSource.attachment as Record<string, unknown>)
      : {};
  const messageFile =
    messageSource.file && typeof messageSource.file === "object"
      ? (messageSource.file as Record<string, unknown>)
      : {};
  const messageSender =
    messageSource.sender && typeof messageSource.sender === "object"
      ? (messageSource.sender as Record<string, unknown>)
      : messageSource.author && typeof messageSource.author === "object"
        ? (messageSource.author as Record<string, unknown>)
        : messageSource.from && typeof messageSource.from === "object"
          ? (messageSource.from as Record<string, unknown>)
          : {};
  const messageRecipient =
    messageSource.recipient && typeof messageSource.recipient === "object"
      ? (messageSource.recipient as Record<string, unknown>)
      : messageSource.receiver && typeof messageSource.receiver === "object"
        ? (messageSource.receiver as Record<string, unknown>)
        : messageSource.to && typeof messageSource.to === "object"
          ? (messageSource.to as Record<string, unknown>)
          : {};

  const mediaUri =
    normalizeString(messageSource.mediaUri) ??
    normalizeString(messageSource.remoteUri) ??
    normalizeString(messageSource.mediaUrl) ??
    normalizeString(messageSource.url) ??
    normalizeString(messageSource.fileUrl) ??
    normalizeString(messageSource.attachmentUrl) ??
    normalizeString(messageSource.assetUrl) ??
    normalizeString(messageSource.downloadUrl) ??
    normalizeString(messageSource.uploadedUri) ??
    normalizeString(messageSource.cdnUrl) ??
    normalizeString(messageAttachment.mediaUri) ??
    normalizeString(messageAttachment.url) ??
    normalizeString(messageAttachment.fileUrl) ??
    normalizeString(messageAttachment.downloadUrl) ??
    normalizeString(messageFile.mediaUri) ??
    normalizeString(messageFile.url) ??
    normalizeString(messageFile.fileUrl) ??
    normalizeString(messageFile.downloadUrl) ??
    normalizeString(messageMeta.mediaUri) ??
    normalizeString(messageMeta.url);

  return {
    ...messageSource,
    id,
    chatId,
    roomId: normalizeString(messageSource.roomId) ?? chatId,
    userId:
      normalizeString(messageSource.userId) ??
      normalizeString(messageSource.senderId) ??
      normalizeString(messageSource.authorId) ??
      normalizeString(messageSource.fromUserId),
    senderId:
      normalizeString(messageSource.senderId) ??
      normalizeString(messageSource.authorId) ??
      normalizeString(messageSource.fromUserId) ??
      normalizeString(messageSource.userId) ??
      normalizeString(messageSender.userId) ??
      normalizeString(messageSender.id),
    authorId:
      normalizeString(messageSource.authorId) ??
      normalizeString(messageSource.senderId) ??
      normalizeString(messageSource.fromUserId) ??
      normalizeString(messageSource.userId) ??
      normalizeString(messageSender.userId) ??
      normalizeString(messageSender.id),
    fromUserId:
      normalizeString(messageSource.fromUserId) ??
      normalizeString(messageSource.senderId) ??
      normalizeString(messageSource.authorId) ??
      normalizeString(messageSource.userId) ??
      normalizeString(messageSender.userId) ??
      normalizeString(messageSender.id),
    recipientUserId:
      normalizeString(messageSource.recipientUserId) ??
      normalizeString(messageSource.receiverUserId) ??
      normalizeString(messageSource.toUserId) ??
      normalizeString(messageSource.targetUserId) ??
      normalizeString(messageRecipient.userId) ??
      normalizeString(messageRecipient.id),
    receiverUserId:
      normalizeString(messageSource.receiverUserId) ??
      normalizeString(messageSource.recipientUserId) ??
      normalizeString(messageSource.toUserId) ??
      normalizeString(messageSource.targetUserId) ??
      normalizeString(messageRecipient.userId) ??
      normalizeString(messageRecipient.id),
    toUserId:
      normalizeString(messageSource.toUserId) ??
      normalizeString(messageSource.recipientUserId) ??
      normalizeString(messageSource.receiverUserId) ??
      normalizeString(messageSource.targetUserId) ??
      normalizeString(messageRecipient.userId) ??
      normalizeString(messageRecipient.id),
    senderName:
      normalizeString(messageSource.senderName) ??
      normalizeString(messageSource.authorName) ??
      normalizeString(messageSource.fromName) ??
      normalizeString(messageSource.displayName) ??
      normalizeString(messageSender.name) ??
      normalizeString(messageSender.displayName) ??
      normalizeString(messageSender.fullName) ??
      normalizeString(messageSender.username),
    senderPhone:
      normalizeString(messageSource.senderPhone) ??
      normalizeString(messageSource.authorPhone) ??
      normalizeString(messageSource.fromPhone) ??
      normalizeString(messageSource.phone) ??
      normalizeString(messageSender.phone) ??
      normalizeString(messageSender.phoneNumber) ??
      normalizeString(messageSender.msisdn),
    type: normalizeString(messageSource.type)?.toUpperCase() ?? "TEXT",
    content,
    text: content,
    createdAt:
      normalizeString(messageSource.createdAt) ??
      normalizeString(messageSource.sentAt) ??
      normalizeString(messageSource.occurredAt) ??
      nowIso(),
    deliveredAt: normalizeString(messageSource.deliveredAt),
    receivedAt: normalizeString(messageSource.receivedAt),
    readAt: normalizeString(messageSource.readAt),
    seenAt: normalizeString(messageSource.seenAt),
    editedAt:
      normalizeString(messageSource.editedAt) ??
      normalizeString(messageSource.updatedAt) ??
      (eventLooksEdited(readObject(source)) ? nowIso() : null),
    updatedAt:
      normalizeString(messageSource.updatedAt) ??
      normalizeString(messageSource.editedAt),
    deletedAt: normalizeString(messageSource.deletedAt),
    deletedByUserId: normalizeString(messageSource.deletedByUserId),
    deletedForEveryone:
      typeof messageSource.deletedForEveryone === "boolean"
        ? messageSource.deletedForEveryone
        : undefined,
    isDeleted:
      typeof messageSource.isDeleted === "boolean"
        ? messageSource.isDeleted
        : undefined,
    replyToMessageId: normalizeString(messageSource.replyToMessageId),
    forwardedFromMessageId:
      normalizeString(messageSource.forwardedFromMessageId) ??
      normalizeString(messageSource.originalMessageId),
    forwardedFromChatId: normalizeString(messageSource.forwardedFromChatId),
    forwardedFromUserId: normalizeString(messageSource.forwardedFromUserId),
    forwardedFromLabel: normalizeString(messageSource.forwardedFromLabel),
    originalMessageId:
      normalizeString(messageSource.originalMessageId) ??
      normalizeString(messageSource.forwardedFromMessageId),
    previewTitle:
      normalizeString(messageSource.previewTitle) ??
      normalizeString(messageSource.title) ??
      normalizeString(messageSource.contactName) ??
      normalizeString(messageSource.fileName) ??
      normalizeString(messageAttachment.fileName) ??
      normalizeString(messageFile.fileName),
    previewSubtitle:
      normalizeString(messageSource.previewSubtitle) ??
      normalizeString(messageSource.subtitle) ??
      normalizeString(messageSource.contactPhone) ??
      normalizeString(messageSource.sizeLabel) ??
      normalizeString(messageAttachment.sizeLabel) ??
      normalizeString(messageFile.sizeLabel),
    fileLabel:
      normalizeString(messageSource.fileLabel) ??
      normalizeString(messageSource.label) ??
      normalizeString(messageSource.fileName) ??
      normalizeString(messageAttachment.fileName) ??
      normalizeString(messageFile.fileName),
    mimeType:
      normalizeString(messageSource.mimeType) ??
      normalizeString(messageSource.contentType) ??
      normalizeString(messageAttachment.mimeType) ??
      normalizeString(messageFile.mimeType),
    mediaUri,
    remoteUri: mediaUri,
    uri: mediaUri,
    url: mediaUri,
    fileUrl: mediaUri,
    thumbnailUri:
      normalizeString(messageSource.thumbnailUri) ??
      normalizeString(messageSource.thumbUri) ??
      normalizeString(messageSource.thumbnailUrl) ??
      normalizeString(messageAttachment.thumbnailUri) ??
      normalizeString(messageAttachment.thumbnailUrl),
    fileName:
      normalizeString(messageSource.fileName) ??
      normalizeString(messageSource.name) ??
      normalizeString(messageAttachment.fileName) ??
      normalizeString(messageFile.fileName),
    fileSizeLabel:
      normalizeString(messageSource.fileSizeLabel) ??
      normalizeString(messageSource.sizeLabel) ??
      normalizeString(messageAttachment.fileSizeLabel) ??
      normalizeString(messageFile.fileSizeLabel),
    latitude: normalizeNumber(messageSource.latitude),
    longitude: normalizeNumber(messageSource.longitude),
    durationMs: normalizeNumber(messageSource.durationMs),
    durationLabel: normalizeString(messageSource.durationLabel),
  };
}

function normalizePresenceStatus(source: Record<string, unknown>, fallbackOnline?: boolean) {
  const status = normalizeString(source.status)?.toLowerCase();

  if (status === "offline") return "offline";
  if (status === "online") return "online";

  if (typeof source.online === "boolean") {
    return source.online ? "online" : "offline";
  }

  if (typeof fallbackOnline === "boolean") {
    return fallbackOnline ? "online" : "offline";
  }

  return "online";
}

function upsertPresenceEntry(entry: MessengerKernelPresenceEntry) {
  const current = getMessengerKernelState().presenceByUserId[entry.userId];
  if (
    current &&
    current.status === entry.status &&
    (current.lastSeenAt ?? null) === (entry.lastSeenAt ?? null)
  ) {
    return;
  }

  setMessengerKernelPresence(entry);
  notify({ type: "presence", payload: entry });
}

function buildPresenceEntry(params: {
  userId: string;
  source: Record<string, unknown>;
  fallbackOnline?: boolean;
  forceStatus?: "online" | "offline" | null;
}): MessengerKernelPresenceEntry {
  const status = params.forceStatus ?? normalizePresenceStatus(params.source, params.fallbackOnline);
  const updatedAt =
    normalizeString(params.source.updatedAt) ??
    normalizeString(params.source.at) ??
    nowIso();

  return {
    userId: params.userId,
    status,
    lastSeenAt:
      normalizeString(params.source.lastSeenAt) ??
      (status === "offline" ? updatedAt : null),
    updatedAt,
  };
}

function handlePresenceSnapshot(payload: unknown) {
  const source = readObject(payload);
  const snapshotSource = source.presence ?? source.state ?? source.users ?? source.snapshot;
  const snapshot = readObject(snapshotSource);
  const entries: MessengerKernelPresenceEntry[] = [];

  Object.entries(snapshot).forEach(([rawUserId, rawEntry]) => {
    const userId = normalizeString(rawUserId);
    if (!userId) return;

    const sourceEntry = readObject(rawEntry);
    entries.push(
      buildPresenceEntry({
        userId,
        source: sourceEntry,
        fallbackOnline:
          typeof rawEntry === "boolean"
            ? rawEntry
            : typeof sourceEntry.online === "boolean"
              ? sourceEntry.online
              : undefined,
      }),
    );
  });

  if (!entries.length && Array.isArray(snapshotSource)) {
    snapshotSource.forEach((rawEntry) => {
      const sourceEntry = readObject(rawEntry);
      const userId =
        normalizeString(sourceEntry.userId) ??
        normalizeString(sourceEntry.id) ??
        normalizeString(sourceEntry.participantUserId);
      if (!userId) return;
      entries.push(buildPresenceEntry({ userId, source: sourceEntry }));
    });
  }

  entries.forEach(upsertPresenceEntry);
  return entries.length > 0;
}

function handlePresenceEvent(eventName: string, payload: unknown) {
  const normalizedEventName = eventName.toLowerCase();

  if (
    normalizedEventName.includes("snapshot") ||
    normalizedEventName.includes("presence:state") ||
    normalizedEventName.includes("presence_state")
  ) {
    if (handlePresenceSnapshot(payload)) return true;
  }

  const source = readObject(payload);
  const nested = readObject(source.presence ?? source.user ?? payload);
  const userId =
    normalizeString(nested.userId) ??
    normalizeString(nested.id) ??
    normalizeString(source.userId) ??
    normalizeString(source.id);

  if (!userId) {
    return handlePresenceSnapshot(payload);
  }

  const forceStatus =
    normalizedEventName.includes("offline") || normalizedEventName.includes("user_offline")
      ? "offline"
      : normalizedEventName.includes("online") || normalizedEventName.includes("user_online")
        ? "online"
        : null;

  const entry = buildPresenceEntry({
    userId,
    source: { ...source, ...nested },
    forceStatus,
  });

  upsertPresenceEntry(entry);
  return true;
}

function handleTypingEvent(eventName: string, payload: unknown) {
  const source = readObject(payload);
  const chatId = resolveChatId(source);
  const userId = normalizeString(source.userId) ?? normalizeString(source.senderId);

  if (!chatId || !userId) return false;

  const lowerEvent = eventName.toLowerCase();
  const isTyping =
    lowerEvent.includes("stop") || lowerEvent.includes("user_stop")
      ? false
      : typeof source.isTyping === "boolean"
        ? source.isTyping
        : typeof source.typing === "boolean"
          ? source.typing
          : true;

  const entry: MessengerKernelTypingEntry = {
    chatId,
    userId,
    isTyping,
    updatedAt: normalizeString(source.at) ?? normalizeString(source.updatedAt) ?? nowIso(),
  };

  setMessengerKernelTypingEntry(entry);

  const currentEntries = getMessengerKernelState().typingByChatId[chatId] ?? [];
  notify({
    type: "typing",
    payload: {
      chatId,
      entry,
      userIds: currentEntries.map((item) => item.userId),
    },
  });
  return true;
}

function resolveKnownMessageId(source: Record<string, unknown>) {
  const directId = pickMessageId(source);
  const state = getMessengerKernelState();

  if (directId && state.messagesById[directId]) {
    return directId;
  }

  const clientId = normalizeString(source.clientId);
  const serverId = normalizeString(source.serverId);
  const candidates = [directId, clientId, serverId].filter((value): value is string => Boolean(value));

  if (!candidates.length) return null;

  const match = Object.values(state.messagesById).find((message) => {
    const messageCandidates = [
      normalizeString(message.id),
      normalizeString(message.clientId),
      normalizeString((message as Record<string, unknown>).serverId),
    ].filter((value): value is string => Boolean(value));

    return candidates.some((candidate) => messageCandidates.includes(candidate));
  });

  return match?.id ?? null;
}

function handleMessageAck(eventName: string, payload: unknown) {
  const source = pickNestedPayload(payload);
  const ackActorUserId = pickSabiMessageAckActorUserId(payload, source);
  const lowerEvent = eventName.toLowerCase();
  const ackKind = lowerEvent.includes("read") ? "read" : "delivered";
  const knownMessageId = resolveKnownMessageId(source);
  const rawMessageId = pickMessageId(source);
  const messageId = knownMessageId ?? rawMessageId;
  const state = getMessengerKernelState();
  const current = messageId ? state.messagesById[messageId] : null;
  const chatId =
    resolveChatId(source) ??
    normalizeString(current?.chatId) ??
    normalizeString(current?.roomId);

  if (!messageId && !chatId) return false;

  const at =
    normalizeString(source.at) ??
    normalizeString(source.updatedAt) ??
    normalizeString(source.deliveredAt) ??
    normalizeString(source.readAt) ??
    normalizeString(source.seenAt) ??
    nowIso();

  if (current && messageId) {
    upsertMessengerKernelMessages([
      {
        ...current,
        id: current.id,
        chatId: current.chatId,
        deliveredAt:
          ackKind === "delivered"
            ? current.deliveredAt ?? at
            : current.deliveredAt,
        receivedAt:
          ackKind === "delivered"
            ? current.receivedAt ?? at
            : current.receivedAt,
        readAt: ackKind === "read" ? current.readAt ?? at : current.readAt,
        seenAt: ackKind === "read" ? current.seenAt ?? at : current.seenAt,
      },
    ]);
  }

  emitLocalCustom(`message:${ackKind}`, {
    ...source,
    sourceEventName: eventName,
    messageId: messageId ?? null,
    chatId: chatId ?? null,
    roomId: chatId ?? null,
    userId: ackActorUserId ?? null,
    ackUserId: ackActorUserId ?? null,
    readerUserId: ackKind === "read" ? ackActorUserId ?? null : undefined,
    deliveredByUserId: ackKind === "delivered" ? ackActorUserId ?? null : undefined,
    senderId: null,
    authorId: null,
    fromUserId: null,
    at,
  });

  if (ackKind === "read") {
    applyReadAckToRoom(
      {
        ...source,
        __sabiAckActorUserId: ackActorUserId,
        userId: ackActorUserId ?? null,
        senderId: null,
        authorId: null,
        fromUserId: null,
      },
      chatId,
    );
  }

  return true;
}

function handleRealtimeEnvelope(payload: unknown) {
  const source = readObject(payload);
  const eventName =
    normalizeString(source.eventName) ??
    normalizeString(source.event) ??
    normalizeString(source.type);

  if (!eventName || eventName === "realtime:event") return false;

  const nestedPayload = source.payload ?? source.data ?? payload;
  handleSocketEvent(eventName, nestedPayload);
  return true;
}

function handleSocketEvent(eventName: string, payload: unknown) {
  pushJournal({
    direction: "in",
    eventName,
    payload,
  });

  const lowerEvent = eventName.toLowerCase();

  if (lowerEvent === "realtime:event") {
    if (handleRealtimeEnvelope(payload)) return;
  }

  if (
    lowerEvent.includes("presence") ||
    lowerEvent.includes("user.online") ||
    lowerEvent.includes("user_offline") ||
    lowerEvent.includes("user_online") ||
    lowerEvent.includes("user.offline")
  ) {
    if (handlePresenceEvent(eventName, payload)) return;
  }

  if (lowerEvent.includes("typing") || lowerEvent.includes("stop_typing")) {
    if (handleTypingEvent(eventName, payload)) return;
  }

  if (lowerEvent.includes("delivered") || lowerEvent.includes("read")) {
    if (handleMessageAck(eventName, payload)) return;
  }

  if (lowerEvent.includes("deleted") || lowerEvent.includes("removed") || lowerEvent.includes("message:delete")) {
    const source = pickNestedPayload(payload);
    const messageId = pickMessageId(source);
    if (messageId) {
      removeMessengerKernelMessages([messageId]);
      emitLocalCustom("message:deleted", {
        ...source,
        sourceEventName: eventName,
        messageId,
        chatId: resolveChatId(source) ?? null,
        roomId: resolveChatId(source) ?? null,
        deletedAt:
          normalizeString(source.deletedAt) ??
          normalizeString(source.at) ??
          normalizeString(source.updatedAt) ??
          nowIso(),
      });
      return;
    }
  }

  if (
    lowerEvent.includes("edited") ||
    lowerEvent.includes("updated") ||
    lowerEvent.includes("message:update") ||
    lowerEvent.includes("message:edit")
  ) {
    const source = pickNestedPayload(payload);
    const message = normalizeMessage({
      ...source,
      sourceEventName: eventName,
      editedAt:
        normalizeString(source.editedAt) ??
        normalizeString(source.updatedAt) ??
        normalizeString(source.at) ??
        nowIso(),
    });
    if (message) {
      upsertMessengerKernelMessages([message]);
      emitLocalCustom("message:updated", {
        ...message,
        sourceEventName: eventName,
      });
      return;
    }
  }

  if (
    lowerEvent.includes("forward") ||
    lowerEvent.includes("message") ||
    lowerEvent === "new_message" ||
    lowerEvent === "channel:post"
  ) {
    const message = normalizeMessage(payload);
    if (message) {
      try {
        applyUnreadForIncomingMessage(message);
      } catch (error) {
        const messageText = error instanceof Error ? error.message : String(error ?? "unknown");
        if (messageText !== "Messenger kernel session is not resolved yet") {
          console.warn("[messenger-realtime] unread apply skipped", messageText);
        }
      }
      upsertMessengerKernelMessages([message]);
      emitLocalCustom("message:new", {
        ...message,
        sourceEventName: eventName,
      });
      return;
    }
  }

  emitLocalCustom(eventName, payload);
}

export function subscribeMessengerRealtimeService(listener: MessengerRealtimeServiceListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getMessengerRealtimeConnectionSnapshot() {
  return { ...connectionSnapshot };
}

export function getMessengerRealtimeDiagnosticsSnapshot(): MessengerRealtimeDiagnosticsSnapshot {
  return {
    connection: getMessengerRealtimeConnectionSnapshot(),
    lastEvents: eventJournal.map((entry) => ({ ...entry })),
    inboundCount,
    outboundCount,
    localOnlyCount,
    lastInboundAt,
    lastOutboundAt,
    presenceHeartbeat: {
      active: Boolean(presenceHeartbeatTimer),
      lastSentAt: lastPresenceHeartbeatSentAt,
      intervalMs: SABI_PRESENCE_HEARTBEAT_MS,
    },
  };
}

export async function connectMessengerRealtime() {
  const session = await resolveMessengerKernelSession();
  const socketUrl = normalizeString(session.socketUrl) ?? normalizeString(session.apiBaseUrl);
  const userId = normalizeString(session.currentUserId);

  if (!socketUrl || !userId) {
    updateConnection("disconnected");
    throw new Error("Messenger realtime requires socketUrl/apiBaseUrl and currentUserId.");
  }

  updateConnection("connecting");

  connectMessengerRealtimeSocket(
    {
      socketUrl,
      socketPath: session.socketPath,
      auth: {
        userId,
        token: normalizeString(session.accessToken),
        accessToken: normalizeString(session.accessToken),
      },
      query: session.query,
      headers: session.headers,
    },
    {
      onConnect(socketId) {
        updateConnection("connected", { socketId });
        lastPresenceStatusSent = null;
        sendMessengerRealtimeClientEvent({
          eventName: "messenger:session:join",
          payload: {
            userId,
            at: nowIso(),
            activeProgram: messengerPresenceActive ? "messenger" : "background",
          },
        });
        if (messengerPresenceActive) {
          emitCurrentUserPresence("online", { reason: "messenger_socket_connected", force: true });
          emitCurrentUserPresenceHeartbeat("messenger_socket_connected_heartbeat");
          startPresenceHeartbeat();
        }
      },
      onDisconnect() {
        stopPresenceHeartbeat();
        updateConnection("disconnected");
      },
      onConnectError(error) {
        updateConnection("error", { error });
      },
      onEvent: handleSocketEvent,
    },
  );
}

export async function disconnectMessengerRealtime() {
  stopPresenceHeartbeat();

  const session = getMessengerKernelSession();
  const userId = normalizeString(session.currentUserId);

  if (userId) {
    const at = nowIso();
    sendMessengerRealtimeClientEvent({
      eventName: "presence:offline",
      payload: {
        userId,
        status: "offline",
        online: false,
        activeProgram: "background",
        presenceScope: "not_messenger",
        reason: "messenger_realtime_disconnect",
        lastSeenAt: at,
        at,
      },
    });
  }

  disconnectMessengerRealtimeSocket();
  lastPresenceStatusSent = userId ? "offline" : null;
  updateConnection("disconnected");
}

export async function reconnectMessengerRealtime() {
  await disconnectMessengerRealtime();
  updateConnection("reconnecting");
  return connectMessengerRealtime();
}

export function getMessengerRealtimePresenceActive() {
  return messengerPresenceActive;
}

export function getMessengerRealtimeLastPresenceStatus() {
  return {
    active: messengerPresenceActive,
    status: lastPresenceStatusSent,
    at: lastPresenceStatusSentAt,
    heartbeatAt: lastPresenceHeartbeatSentAt,
    heartbeatActive: Boolean(presenceHeartbeatTimer),
  };
}

export function setMessengerRealtimePresenceActive(
  active: boolean,
  options?: { reason?: string | null; force?: boolean },
) {
  const nextActive = Boolean(active);
  const changed = messengerPresenceActive !== nextActive;
  messengerPresenceActive = nextActive;

  const status = messengerPresenceActive ? "online" : "offline";

  if (!messengerPresenceActive) {
    stopPresenceHeartbeat();
  }

  if (!changed && !options?.force && lastPresenceStatusSent === status) {
    if (messengerPresenceActive) {
      startPresenceHeartbeat();
    }
    return true;
  }

  const sent = emitCurrentUserPresence(status, {
    reason: options?.reason ?? (messengerPresenceActive ? "messenger_screen_active" : "messenger_screen_inactive"),
    force: options?.force ?? changed,
  });

  if (messengerPresenceActive) {
    emitCurrentUserPresenceHeartbeat("messenger_screen_active_heartbeat");
    startPresenceHeartbeat();
  }

  return sent;
}

export function sendMessengerRealtimeClientEvent(input: MessengerRealtimeClientEventInput) {
  const payload = input.payload ?? {};
  const sent = emitMessengerRealtimeSocketEvent(input);

  pushJournal({
    direction: sent ? "out" : "local",
    eventName: input.eventName,
    payload,
    deliveredToSocket: sent,
  });

  if (!sent) {
    emitLocalCustom(input.eventName, {
      ...payload,
      localOnly: true,
      reason: "messenger_realtime_socket_not_connected",
    });
  }

  return sent;
}

export function runMessengerRealtimeTwoDeviceCheck(
  input: MessengerRealtimeTwoDeviceCheckInput = {},
): MessengerRealtimeTwoDeviceCheckResult {
  const session = getMessengerKernelSession();
  const state = getMessengerKernelState();
  const userId =
    normalizeString(input.userId) ??
    normalizeString(session.currentUserId) ??
    normalizeString(state.currentUserId);
  const chatId = normalizeString(input.chatId);
  const hasSocketTarget = Boolean(normalizeString(session.socketUrl) ?? normalizeString(session.apiBaseUrl));
  const connection = getMessengerRealtimeConnectionSnapshot();
  const emitted: string[] = [];

  if (userId) {
    const sent = sendMessengerRealtimeClientEvent({
      eventName: "presence:snapshot:request",
      payload: {
        ...(chatId ? { chatId, roomId: chatId } : {}),
        userId,
        requesterUserId: userId,
        peerUserId: normalizeString(input.peerUserId),
        at: nowIso(),
      },
    });

    emitted.push(sent ? "presence:snapshot:request" : "presence:snapshot:request:local");
  }

  if (userId && chatId) {
    const joinSent = sendMessengerRealtimeClientEvent({
      eventName: "chat:join",
      payload: { chatId, roomId: chatId, userId, at: nowIso() },
    });
    emitted.push(joinSent ? "chat:join" : "chat:join:local");

    const typingSent = sendMessengerRealtimeClientEvent({
      eventName: "typing:stop",
      payload: { chatId, roomId: chatId, userId, isTyping: false, at: nowIso() },
    });
    emitted.push(typingSent ? "typing:stop" : "typing:stop:local");
  }

  const checks = {
    hasUserId: Boolean(userId),
    hasSocketTarget,
    connected: connection.connected,
    canRequestPresence: Boolean(userId && hasSocketTarget),
    canJoinChat: Boolean(userId && chatId && hasSocketTarget),
    canEmitTyping: Boolean(userId && chatId && hasSocketTarget),
  };

  return {
    ready:
      checks.hasUserId &&
      checks.hasSocketTarget &&
      checks.connected &&
      checks.canRequestPresence &&
      (!chatId || (checks.canJoinChat && checks.canEmitTyping)),
    connection,
    userId: userId ?? null,
    chatId: chatId ?? null,
    checks,
    emitted,
  };
}
