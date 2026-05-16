import { upsertPrivateChatProfile } from "../../private/privateChatRuntime";
import { appStorage } from "../../../shared/storage/app-storage";

export type RealtimeMessageType =
  | "TEXT"
  | "VOICE"
  | "IMAGE"
  | "VIDEO"
  | "DOCUMENT"
  | "CONTACT"
  | "LOCATION"
  | "GIFT"
  | "ANIMATED_REACTION"
  | "ANIMATED_EMOJI";

export type RealtimeAnimatedPayload = {
  id?: string;
  emoji?: string;
  title?: string;
  subtitle?: string;
  durationMs?: number;
  kind?: "reaction" | "emoji" | "gift";
  premium?: boolean;
};

export type RealtimeIncomingMessage = {
  id: string;
  clientId?: string | null;
  chatId: string;
  userId: string;
  type: RealtimeMessageType;
  content?: string | null;
  createdAt: string;
  deliveredAt?: string | null;
  readAt?: string | null;
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

export type RealtimePresencePayload = {
  chatId: string;
  userId: string;
  at?: string | null;
  lastSeenAt?: string | null;
};

export type RealtimeMessageAckPayload = {
  chatId: string;
  messageId: string;
  userId: string;
  at: string;
};

export type PersistedChatPresenceState = Record<
  string,
  {
    online: boolean;
    updatedAt: string;
    lastSeenAt: string | null;
  }
>;

export type PersistedCallType = "voice" | "video";
export type PersistedCallDirection = "incoming" | "outgoing" | "missed";

export type PersistedCallSnapshot = {
  id: string;
  chatId?: string | null;
  name: string;
  duration?: string | null;
  type: PersistedCallType;
  direction: PersistedCallDirection;
  verified?: boolean;
  online?: boolean;
  unread?: boolean;
  handle?: string | null;
  phone?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ChatRoomMetaSnapshot = {
  chatId: string;
  name: string;
  subtitle?: string | null;
  roomType?: string | null;
  verified?: boolean;
  avatarLetter?: string | null;
  phone?: string | null;
  username?: string | null;
  currentUserId?: string | null;
  peerUserId?: string | null;
  avatarUrl?: string | null;
  photoUrl?: string | null;
  updatedAt: string;
  unread?: number | null;
  unreadCount?: number | null;
  hiddenFromMain?: boolean | null;
  deleted?: boolean | null;
  forceVisibleInMain?: boolean | null;
  lastReadAt?: string | null;
  sabiUnreadClearedAt?: string | null;
  markRead?: boolean | null;
  clearUnread?: boolean | null;
};

const STORAGE_PREFIX = "sabi.messenger.realtime";
const ROOMS_KEY = `${STORAGE_PREFIX}.rooms`;
const UI_MESSAGES_PREFIX = `${STORAGE_PREFIX}.ui.messages.`;
const SERVER_MESSAGES_PREFIX = `${STORAGE_PREFIX}.server.messages.`;
const PRESENCE_PREFIX = `${STORAGE_PREFIX}.presence.`;
const CALLS_KEY = `${STORAGE_PREFIX}.calls`;
const CLEAR_HIDDEN_IDS_PREFIX = STORAGE_PREFIX + ".clearHiddenIds.";
const CLEAR_AT_PREFIX = STORAGE_PREFIX + ".clearAt.";

function roomMessagesKey(chatId: string) {
  return `${SERVER_MESSAGES_PREFIX}${chatId}`;
}

function roomUiMessagesKey(chatId: string) {
  return `${UI_MESSAGES_PREFIX}${chatId}`;
}

function roomPresenceKey(chatId: string) {
  return `${PRESENCE_PREFIX}${chatId}`;
}

function roomClearHiddenIdsKey(chatId: string, userId?: string | null) {
  const owner = String(userId || "local").trim() || "local";
  return CLEAR_HIDDEN_IDS_PREFIX + chatId + "." + owner;
}

function roomClearAtKey(chatId: string, userId?: string | null) {
  const owner = String(userId || "local").trim() || "local";
  return CLEAR_AT_PREFIX + chatId + "." + owner;
}

function safeParse<T>(raw: string | undefined | null, fallback: T): T {
  if (!raw) return fallback;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    return safeParse<T>(await Promise.resolve(appStorage.getString(key)), fallback);
  } catch {
    return fallback;
  }
}

async function writeJson(key: string, value: unknown): Promise<void> {
  try {
    await Promise.resolve(appStorage.setString(key, JSON.stringify(value)));
  } catch {
    // no-op
  }
}

function nowIso() {
  return new Date().toISOString();
}

function collectPersistedMessageIdentity(value: unknown): string[] {
  if (!value || typeof value !== "object") return [];
  const record = value as Record<string, unknown>;
  return [record.id, record.messageId, record.clientId, record.localId]
    .map((item) => String(item ?? "").trim())
    .filter(Boolean);
}

function filterPersistedMessagesByHiddenIds<T>(messages: T[], hiddenIds: Set<string>) {
  return messages.filter((message) =>
    !collectPersistedMessageIdentity(message).some((id) => hiddenIds.has(id)),
  );
}

function normalizePhone(value?: string | null) {
  const digits = String(value ?? "").replace(/[^\d+]/g, "").trim();
  return digits || "";
}

function normalizeUsername(value?: string | null) {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  return raw.startsWith("@") ? raw : `@${raw}`;
}

function parseRoomContact(value?: string | null) {
  const raw = String(value ?? "").trim();
  if (!raw) {
    return { phone: undefined, username: undefined };
  }

  if (raw.startsWith("@")) {
    const username = normalizeUsername(raw);
    return { phone: undefined, username: username || undefined };
  }

  const phone = normalizePhone(raw);
  return { phone: phone || undefined, username: undefined };
}

function normalizeRoomType(value?: string | null) {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (normalized === "group" || normalized === "channel" || normalized === "business" || normalized === "bot") {
    return normalized;
  }
  return "direct";
}

function normalizeRoomId(value?: string | null) {
  const normalized = String(value ?? "").trim();
  return normalized || "";
}

function roomDedupeKey(snapshot: Partial<ChatRoomMetaSnapshot>) {
  const roomType = normalizeRoomType(snapshot.roomType);
  if (roomType !== "direct") return `room:${normalizeRoomId(snapshot.chatId)}`;

  const peerUserId = normalizeRoomId(snapshot.peerUserId);
  if (peerUserId) return `peer:${peerUserId}`;

  const phone = normalizePhone(snapshot.phone ?? snapshot.subtitle);
  if (phone) return `phone:${phone}`;

  const username = normalizeUsername(snapshot.username ?? (String(snapshot.subtitle ?? "").startsWith("@") ? snapshot.subtitle : ""));
  if (username) return `username:${username.toLowerCase()}`;

  return `room:${normalizeRoomId(snapshot.chatId)}`;
}

function hasBetterRoomName(snapshot: Partial<ChatRoomMetaSnapshot>) {
  const name = String(snapshot.name ?? "").trim();
  if (!name) return false;
  const chatId = String(snapshot.chatId ?? "").trim();
  if (chatId && name === chatId) return false;
  if (/^\+?\d[\d\s().-]{5,}$/.test(name)) return false;
  return true;
}

function mergeRoomMetaSnapshot(
  previous: ChatRoomMetaSnapshot,
  incoming: ChatRoomMetaSnapshot,
): ChatRoomMetaSnapshot {
  const previousUpdatedAt = String(previous.updatedAt || "");
  const incomingUpdatedAt = String(incoming.updatedAt || "");
  const updatedAt =
    incomingUpdatedAt && (!previousUpdatedAt || incomingUpdatedAt.localeCompare(previousUpdatedAt) >= 0)
      ? incomingUpdatedAt
      : previousUpdatedAt || incomingUpdatedAt || nowIso();
  const incomingReadAt =
    String((incoming as Record<string, unknown>).lastReadAt || "") ||
    String((incoming as Record<string, unknown>).sabiUnreadClearedAt || "");
  const previousReadAt =
    String((previous as Record<string, unknown>).lastReadAt || "") ||
    String((previous as Record<string, unknown>).sabiUnreadClearedAt || "");

  const incomingClearsUnread = Boolean(
    (incoming as Record<string, unknown>).markRead === true ||
      (incoming as Record<string, unknown>).clearUnread === true ||
      (Number(incoming.unreadCount ?? incoming.unread ?? 0) === 0 && incomingReadAt)
  );

  const unread = incomingClearsUnread
    ? 0
    : Math.max(
        0,
        Number(previous.unreadCount ?? previous.unread ?? 0) || 0,
        Number(incoming.unreadCount ?? incoming.unread ?? 0) || 0,
      );

  const readAt = incomingClearsUnread ? incomingReadAt || nowIso() : incomingReadAt || previousReadAt || null;

  return {
    ...previous,
    ...incoming,
    chatId: incoming.chatId || previous.chatId,
    name: hasBetterRoomName(incoming) ? incoming.name : previous.name || incoming.name,
    subtitle: incoming.subtitle || previous.subtitle || null,
    roomType: incoming.roomType || previous.roomType || "direct",
    phone: incoming.phone || previous.phone || null,
    username: incoming.username || previous.username || null,
    currentUserId: incoming.currentUserId || previous.currentUserId || null,
    peerUserId: incoming.peerUserId || previous.peerUserId || null,
    avatarUrl: incoming.avatarUrl || previous.avatarUrl || incoming.photoUrl || previous.photoUrl || null,
    photoUrl: incoming.photoUrl || previous.photoUrl || incoming.avatarUrl || previous.avatarUrl || null,
    updatedAt,
    unread,
    unreadCount: unread,
    lastReadAt: readAt,
    sabiUnreadClearedAt: readAt,
    hiddenFromMain:
      typeof incoming.hiddenFromMain === "boolean" ? incoming.hiddenFromMain : previous.hiddenFromMain ?? null,
    deleted:
      typeof incoming.deleted === "boolean" ? incoming.deleted : previous.deleted ?? null,
    forceVisibleInMain: Boolean(incoming.forceVisibleInMain || previous.forceVisibleInMain),
  };
}

async function registerRoomMeta(snapshot: ChatRoomMetaSnapshot) {
  const current = await readJson<ChatRoomMetaSnapshot[]>(ROOMS_KEY, []);
  const incomingKey = roomDedupeKey(snapshot);
  let mergedSnapshot = snapshot;
  const kept: ChatRoomMetaSnapshot[] = [];

  current.forEach((item) => {
    const sameChatId = item.chatId === snapshot.chatId;
    const sameIdentity = incomingKey && incomingKey === roomDedupeKey(item);

    if (sameChatId || sameIdentity) {
      mergedSnapshot = mergeRoomMetaSnapshot(item, mergedSnapshot);
      return;
    }

    kept.push(item);
  });

  const next = [mergedSnapshot, ...kept].sort((a, b) =>
    String(b.updatedAt).localeCompare(String(a.updatedAt)),
  );

  await writeJson(ROOMS_KEY, next);
}

export async function registerPersistedChatRoom(
  snapshot: Omit<ChatRoomMetaSnapshot, "updatedAt">,
) {
  const parsedFromSubtitle = parseRoomContact(snapshot.subtitle);
  const normalizedPhone =
    normalizePhone(snapshot.phone ?? parsedFromSubtitle.phone) || undefined;
  const normalizedUsername =
    normalizeUsername(snapshot.username ?? parsedFromSubtitle.username) || undefined;

  const currentRooms = await readJson<ChatRoomMetaSnapshot[]>(ROOMS_KEY, []);
  const existingRoom = currentRooms.find(
    (item) => item.chatId === snapshot.chatId || roomDedupeKey(item) === roomDedupeKey(snapshot),
  );
  const existingUnread = Math.max(
    0,
    Number(existingRoom?.unreadCount ?? existingRoom?.unread ?? 0) || 0,
  );
  const incomingUnread = Math.max(
    0,
    Number(snapshot.unreadCount ?? snapshot.unread ?? 0) || 0,
  );
  const shouldClearUnread = Boolean(
    (snapshot as Record<string, unknown>).markRead === true ||
      (snapshot as Record<string, unknown>).clearUnread === true ||
      (Number(snapshot.unreadCount ?? snapshot.unread ?? 0) === 0 &&
        Boolean(
          (snapshot as Record<string, unknown>).lastReadAt ||
            (snapshot as Record<string, unknown>).sabiUnreadClearedAt,
        ))
  );
  const readAt = shouldClearUnread
    ? String(
        (snapshot as Record<string, unknown>).lastReadAt ||
          (snapshot as Record<string, unknown>).sabiUnreadClearedAt ||
          nowIso(),
      )
    : String(
        (existingRoom as Record<string, unknown> | undefined)?.lastReadAt ||
          (existingRoom as Record<string, unknown> | undefined)?.sabiUnreadClearedAt ||
          "",
      ) || null;
  const nextUnread = shouldClearUnread ? 0 : Math.max(existingUnread, incomingUnread);
  const forceVisibleInMain = Boolean(snapshot.forceVisibleInMain || snapshot.hiddenFromMain === false || snapshot.deleted === false);
  const nextHiddenFromMain =
    typeof snapshot.hiddenFromMain === "boolean"
      ? snapshot.hiddenFromMain
      : forceVisibleInMain
        ? false
        : undefined;
  const nextDeleted =
    typeof snapshot.deleted === "boolean"
      ? snapshot.deleted
      : forceVisibleInMain
        ? false
        : undefined;

  const nextSnapshot: ChatRoomMetaSnapshot = {
    ...snapshot,
    phone: normalizedPhone,
    username: normalizedUsername,
    currentUserId: snapshot.currentUserId || undefined,
    peerUserId: snapshot.peerUserId || undefined,
    avatarUrl: snapshot.avatarUrl || snapshot.photoUrl || undefined,
    photoUrl: snapshot.photoUrl || snapshot.avatarUrl || undefined,
    unread: nextUnread,
    unreadCount: nextUnread,
    hiddenFromMain: nextHiddenFromMain ?? null,
    deleted: nextDeleted ?? null,
    forceVisibleInMain,
    updatedAt: nowIso(),
  };

  await registerRoomMeta(nextSnapshot);

  if (String(snapshot.roomType ?? "").trim().toLowerCase() === "direct") {
    await upsertPrivateChatProfile({
      chatId: snapshot.chatId,
      roomType: snapshot.roomType ?? undefined,
      name: snapshot.name,
      avatarLetter: snapshot.avatarLetter ?? undefined,
      phone: normalizedPhone,
      username: normalizedUsername,
      verified: Boolean(snapshot.verified),
      currentUserId: nextSnapshot.currentUserId || undefined,
      peerUserId: nextSnapshot.peerUserId || undefined,
      avatarUrl: nextSnapshot.avatarUrl || undefined,
      photoUrl: nextSnapshot.photoUrl || undefined,
      unreadCount: nextUnread,
      hiddenFromMain: nextHiddenFromMain,
      deleted: nextDeleted,
      deletedAt: nextDeleted === false ? null : undefined,
      updatedAt: nextSnapshot.updatedAt,
    });
  }
}

export async function hydratePersistedChatMessages<T = unknown>(
  chatId: string,
): Promise<T[]> {
  return readJson<T[]>(roomUiMessagesKey(chatId), []);
}

export async function persistChatRoomMessages<T = unknown>(
  chatId: string,
  messages: T[],
): Promise<void> {
  await writeJson(roomUiMessagesKey(chatId), messages);
}

export async function hydratePersistedRealtimeMessages(
  chatId: string,
): Promise<RealtimeIncomingMessage[]> {
  return readJson<RealtimeIncomingMessage[]>(roomMessagesKey(chatId), []);
}

export async function persistRealtimeMessagesSnapshot(
  chatId: string,
  messages: RealtimeIncomingMessage[],
): Promise<void> {
  await writeJson(roomMessagesKey(chatId), messages);
}

export async function hydratePersistedChatClearAt(chatId: string, userId?: string | null): Promise<number> {
  const value = await readJson<number>(roomClearAtKey(chatId, userId), 0);
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

export async function clearPersistedChatMessagesForUser(
  chatId: string,
  userId?: string | null,
  clearAtMs = Date.now(),
): Promise<number> {
  await writeJson(roomClearAtKey(chatId, userId), clearAtMs);
  await persistChatRoomMessages(chatId, []);
  await persistRealtimeMessagesSnapshot(chatId, []);
  return clearAtMs;
}

export async function listPersistedChatRooms(ownerUserId?: string | null) {
  const rooms = await readJson<ChatRoomMetaSnapshot[]>(ROOMS_KEY, []);

  // SABI_OWNER_SCOPED_PERSISTED_ROOMS:
  // Contacts must never show another user's saved chat rooms.
  // Legacy records without currentUserId/ownerUserId are hidden when ownerUserId is provided.
  const normalizedOwnerUserId = typeof ownerUserId === "string" ? ownerUserId.trim() : "";
  if (!normalizedOwnerUserId) {
    return rooms;
  }

  return rooms.filter((room: any) => {
    const roomOwnerUserId =
      typeof room?.currentUserId === "string"
        ? room.currentUserId.trim()
        : typeof room?.ownerUserId === "string"
          ? room.ownerUserId.trim()
          : "";

    return roomOwnerUserId === normalizedOwnerUserId;
  });
}

export async function hydratePersistedChatPresence(chatId: string) {
  return readJson<PersistedChatPresenceState>(roomPresenceKey(chatId), {});
}

export async function persistChatPresenceSnapshot(
  chatId: string,
  snapshot: PersistedChatPresenceState,
): Promise<void> {
  await writeJson(roomPresenceKey(chatId), snapshot);
}

export async function listPersistedCalls() {
  const current = await readJson<PersistedCallSnapshot[]>(CALLS_KEY, []);
  return current.sort((a, b) =>
    String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")),
  );
}

export async function registerPersistedCall(
  snapshot: Omit<PersistedCallSnapshot, "updatedAt"> & { updatedAt?: string },
) {
  const current = await readJson<PersistedCallSnapshot[]>(CALLS_KEY, []);
  const nextItem: PersistedCallSnapshot = {
    ...snapshot,
    createdAt: snapshot.createdAt || nowIso(),
    updatedAt: snapshot.updatedAt || snapshot.createdAt || nowIso(),
  };

  const next = [
    nextItem,
    ...current.filter((item) => item.id !== nextItem.id),
  ].sort((a, b) =>
    String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")),
  );

  await writeJson(CALLS_KEY, next);
  return nextItem;
}

export async function removePersistedCall(callId: string) {
  const current = await readJson<PersistedCallSnapshot[]>(CALLS_KEY, []);
  const next = current.filter((item) => item.id !== callId);
  await writeJson(CALLS_KEY, next);
}


export async function markPersistedChatRoomRead(
  chatId: string,
  userId?: string | null,
): Promise<void> {
  const normalizedChatId = normalizeRoomId(chatId);
  if (!normalizedChatId) return;

  const readAt = nowIso();
  const current = await readJson<ChatRoomMetaSnapshot[]>(ROOMS_KEY, []);
  let matchedRoom: ChatRoomMetaSnapshot | null = null;

  const next = current.map((item) => {
    if (normalizeRoomId(item.chatId) !== normalizedChatId) return item;

    matchedRoom = {
      ...item,
      unread: 0,
      unreadCount: 0,
      lastReadAt: readAt,
      sabiUnreadClearedAt: readAt,
      updatedAt: item.updatedAt || readAt,
    };

    return matchedRoom;
  });

  await writeJson(ROOMS_KEY, next);

  const matchedRoomForProfile = matchedRoom as ChatRoomMetaSnapshot | null;

  if (matchedRoomForProfile && String(matchedRoomForProfile.roomType ?? "").trim().toLowerCase() === "direct") {
    await upsertPrivateChatProfile({
      chatId: matchedRoomForProfile.chatId,
      roomType: matchedRoomForProfile.roomType ?? undefined,
      name: matchedRoomForProfile.name,
      avatarLetter: matchedRoomForProfile.avatarLetter ?? undefined,
      phone: matchedRoomForProfile.phone ?? undefined,
      username: matchedRoomForProfile.username ?? undefined,
      verified: Boolean(matchedRoomForProfile.verified),
      currentUserId: matchedRoomForProfile.currentUserId || userId || undefined,
      peerUserId: matchedRoomForProfile.peerUserId || undefined,
      avatarUrl: matchedRoomForProfile.avatarUrl || undefined,
      photoUrl: matchedRoomForProfile.photoUrl || undefined,
      unreadCount: 0,
      hiddenFromMain: matchedRoomForProfile.hiddenFromMain ?? undefined,
      deleted: matchedRoomForProfile.deleted ?? undefined,
      deletedAt: matchedRoomForProfile.deleted === false ? null : undefined,
      updatedAt: matchedRoomForProfile.updatedAt || readAt,
    });
  }
}

export async function removePersistedChatRoom(chatId: string) {
  const current = await readJson<ChatRoomMetaSnapshot[]>(ROOMS_KEY, []);
  const next = current.filter((item) => item.chatId !== chatId);
  await writeJson(ROOMS_KEY, next);
}
export async function hydratePersistedChatHiddenMessageIds(chatId: string, userId?: string | null): Promise<string[]> {
  const value = await readJson<string[]>(roomClearHiddenIdsKey(chatId, userId), []);
  return Array.isArray(value) ? value.map((item) => String(item || "").trim()).filter(Boolean) : [];
}

export async function persistClearedChatHiddenMessageIds(
  chatId: string,
  userId: string | null | undefined,
  messageIds: string[],
): Promise<string[]> {
  const current = await hydratePersistedChatHiddenMessageIds(chatId, userId);
  const next = Array.from(new Set([...current, ...messageIds.map((item) => String(item || "").trim()).filter(Boolean)]));
  await writeJson(roomClearHiddenIdsKey(chatId, userId), next);
  return next;
}

export async function hidePersistedChatMessagesForUser(
  chatId: string,
  userId: string | null | undefined,
  messageIds: string[],
): Promise<string[]> {
  const normalizedIds = messageIds
    .map((item) => String(item ?? "").trim())
    .filter(Boolean);

  if (!normalizedIds.length) {
    return hydratePersistedChatHiddenMessageIds(chatId, userId);
  }

  const nextHiddenIds = await persistClearedChatHiddenMessageIds(chatId, userId, normalizedIds);
  const hiddenIdSet = new Set(nextHiddenIds);

  const uiMessages = await hydratePersistedChatMessages<unknown>(chatId);
  await persistChatRoomMessages(chatId, filterPersistedMessagesByHiddenIds(uiMessages, hiddenIdSet));

  const realtimeMessages = await hydratePersistedRealtimeMessages(chatId);
  await persistRealtimeMessagesSnapshot(chatId, filterPersistedMessagesByHiddenIds(realtimeMessages, hiddenIdSet));

  return nextHiddenIds;
}

