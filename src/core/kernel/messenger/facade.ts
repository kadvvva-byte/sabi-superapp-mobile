import { createMessengerKernelEventBus } from "./core/event-bus";
import {
  selectMessengerAccessToken,
  selectMessengerApiBaseUrl,
  selectMessengerAuthScheme,
  selectMessengerCurrentUserId,
  selectMessengerIsUserOnline,
  selectMessengerLastError,
  selectMessengerMessageById,
  selectMessengerMessagesByRoomId,
  selectMessengerParticipantsByRoomId,
  selectMessengerPresenceByUserId,
  selectMessengerRealtimeStatus,
  selectMessengerRoomById,
  selectMessengerRoomSummary,
  selectMessengerRooms,
  selectMessengerChats,
  selectMessengerGroups,
  selectMessengerChannels,
  selectMessengerBots,
  selectMessengerRuntimeStatus,
  selectMessengerSession,
  selectMessengerSocketPath,
  selectMessengerSocketUrl,
  selectMessengerTypingByChatId,
  selectMessengerTypingUserIds,
} from "./core/selectors";
import {
  bindMessengerKernelRuntime,
  clearMessengerKernelRoomMessagesLocalState,
  getMessengerKernelState,
  removeMessengerKernelMessages,
  patchMessengerKernelRoomLocalState,
  setMessengerKernelPresence,
  setMessengerKernelRealtimeStatus,
  setMessengerKernelTypingEntry,
  subscribeMessengerKernelStore,
  upsertMessengerKernelMessages,
  upsertMessengerKernelRooms,
} from "./core/store";
import type {
  MessengerKernelEventMap,
  MessengerKernelMessageRecord,
  MessengerKernelRoomRecord,
  MessengerKernelStoreListener,
  MessengerKernelTypingEntry,
} from "./core/types";
import {
  connectMessengerRealtime,
  disconnectMessengerRealtime,
  reconnectMessengerRealtime,
  sendMessengerRealtimeClientEvent,
  setMessengerRealtimePresenceActive,
  subscribeMessengerRealtimeService,
  type MessengerRealtimeMessageAckPayload,
  type MessengerRealtimeTypingPayload,
} from "./realtime";
import {
  createMessengerKernelRuntime,
  type MessengerKernelDeleteMessageInput,
  type MessengerKernelHydrateRoomGraphInput,
  type MessengerKernelRuntimeConfig,
  type MessengerKernelSendMessageInput,
  type MessengerKernelUpdateMessageInput,
  type MessengerKernelUploadMediaInput,
} from "./runtime";
import {
  configureMessengerKernelSession,
  resetMessengerKernelSession,
  resolveMessengerKernelSession,
  type MessengerKernelSessionConfig,
} from "./session";

import {
} from "../../../modules/calls/callEventsRuntime";

import {
  getPrivateChatProfileMap,
  incrementPrivateChatUnread,
  isChatBlocked,
  isChatDeleted,
  isChatHiddenFromMain,
  markPrivateChatRead,
  markPrivateChatUnread,
  setPrivateChatBlocked,
  setPrivateChatDeleted,
  setPrivateChatHiddenFromMain,
  setPrivateChatMuted,
  setPrivateChatPinned,
  upsertPrivateChatProfile,
  type PrivateChatProfile,
} from "../../../modules/messenger/private/privateChatRuntime";

function normalizeString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}


function isSabiOpaqueIdentifier(value: string | null | undefined): boolean {
  const normalized = normalizeString(value);
  if (!normalized) return false;

  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(normalized)) {
    return true;
  }

  if (/^(chat|room|private|direct|user|peer|contact)[:_-]/i.test(normalized)) {
    return true;
  }

  if (/^[a-z0-9_-]{18,}$/i.test(normalized) && !normalized.includes("@") && !normalized.startsWith("+")) {
    return true;
  }

  return false;
}

function isVisiblePhoneCandidate(value: string | null | undefined): boolean {
  const normalized = normalizeString(value);
  if (!normalized) return false;
  return /^\+?\d[\d\s().-]{5,}$/.test(normalized);
}

function chooseHumanMessengerTitle(
  candidates: Array<string | null | undefined>,
  fallback: string,
): string {
  const normalized = candidates
    .map((value) => normalizeString(value))
    .filter((value): value is string => Boolean(value));

  const humanName = normalized.find((value) => !isSabiOpaqueIdentifier(value) && !isVisiblePhoneCandidate(value));
  if (humanName) return humanName;

  const phone = normalized.find((value) => isVisiblePhoneCandidate(value));
  if (phone) return phone;

  const visible = normalized.find((value) => !isSabiOpaqueIdentifier(value));
  if (visible) return visible;

  return fallback;
}

function normalizeOccurredAt(value?: string | null) {
  return normalizeString(value) ?? new Date().toISOString();
}

const SABI_REACTION_CONTROL_PREFIX = "__SABI_REACTION_V1__:";

function isSabiReactionControlText(value?: string | null) {
  return String(value ?? "").trim().startsWith(SABI_REACTION_CONTROL_PREFIX);
}

function isSabiReactionControlPreview(message?: MessengerKernelPreviewMessage | null) {
  if (!message) return false;
  return isSabiReactionControlText(message.text) || isSabiReactionControlText(message.previewTitle);
}

function adjustUnreadForHiddenReactions(value: number | undefined, hiddenTailCount: number) {
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
  return Math.max(0, Math.floor(value) - Math.max(0, Math.floor(hiddenTailCount || 0)));
}

function countHiddenReactionControlTailForChat(chatId?: string | null) {
  const normalizedChatId = normalizeString(chatId);
  if (!normalizedChatId) return 0;

  const messages = selectMessengerMessagesByRoomId(getMessengerKernelState(), normalizedChatId)
    .map(mapMessageRecordToPreview)
    .sort((a, b) => String(a.time || "").localeCompare(String(b.time || "")));

  let count = 0;
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    if (!isSabiReactionControlPreview(messages[index])) break;
    count += 1;
  }
  return count;
}

function readMessagePayloadFromRuntimeResult(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;

  if (record.message && typeof record.message === "object" && !Array.isArray(record.message)) {
    return record.message as Record<string, unknown>;
  }

  if (record.data && typeof record.data === "object" && !Array.isArray(record.data)) {
    const data = record.data as Record<string, unknown>;
    if (data.message && typeof data.message === "object" && !Array.isArray(data.message)) {
      return data.message as Record<string, unknown>;
    }
    return data;
  }

  return record;
}

const runtime = createMessengerKernelRuntime();
const eventBus = createMessengerKernelEventBus();
let booted = false;
let messengerPresenceActive = false;
let activeMessengerRoomId: string | null = null;

subscribeMessengerKernelStore(() => {
  eventBus.emit("change", getMessengerKernelState());
});

subscribeMessengerRealtimeService((event) => {
  eventBus.emit("realtimeEvent", event);
});

function emitRoomSnapshot(chatId: string) {
  eventBus.emit("roomSnapshot", { chatId });
}

async function refreshSessionBinding() {
  const session = await resolveMessengerKernelSession();
  bindMessengerKernelRuntime(session);
  return session;
}

function sendFacadeRealtimeEvent(
  eventName: string,
  payload: Record<string, unknown>,
  occurredAt?: string | null,
) {
  return sendMessengerRealtimeClientEvent({
    eventName: eventName as any,
    payload: {
      ...payload,
      at: normalizeOccurredAt(occurredAt),
    } as Record<string, unknown>,
  } as any);
}

function resolveCurrentUserId(explicitUserId?: string | null) {
  return (
    normalizeString(explicitUserId) ??
    normalizeString(selectMessengerCurrentUserId(getMessengerKernelState()))
  );
}

export type MessengerKernelRoomSnapshot = {
  chatId: string;
  name: string;
  subtitle?: string | null;
  roomType?: string | null;
  verified?: boolean;
  avatarLetter?: string | null;
  phone?: string | null;
  username?: string | null;
  avatarUrl?: string | null;
  photoUrl?: string | null;
  currentUserId?: string | null;
  peerUserId?: string | null;
  updatedAt: string;
  unread?: number;
  unreadCount?: number;
};

export type MessengerKernelPreviewMessage = {
  id?: string;
  text?: string;
  time?: string;
  previewTitle?: string;
  kind?: string;
};

function normalizeRoomType(room: Partial<MessengerKernelRoomRecord> | MessengerKernelRoomSnapshot) {
  return (
    normalizeString((room as any).roomType) ??
    normalizeString((room as any).type) ??
    "direct"
  );
}

function normalizeRoomUpdatedAt(room: Partial<MessengerKernelRoomRecord>) {
  return (
    normalizeString((room as any).updatedAt) ??
    normalizeString((room as any).occurredAt) ??
    normalizeString((room as any).hydratedAt) ??
    new Date().toISOString()
  );
}

function mapRoomRecordToSnapshot(room: MessengerKernelRoomRecord): MessengerKernelRoomSnapshot {
  const chatId = normalizeString(room.chatId) ?? room.id;
  const subtitle =
    normalizeString((room as any).subtitle) ??
    normalizeString((room as any).handle) ??
    normalizeString((room as any).username) ??
    normalizeString((room as any).phone) ??
    null;
  const hiddenReactionTailCount = countHiddenReactionControlTailForChat(chatId);

  return {
    chatId,
    name: chooseHumanMessengerTitle(
      [
        (room as any).name,
        (room as any).title,
        (room as any).displayName,
        (room as any).phone,
        (room as any).partnerPhone,
        (room as any).peerPhone,
        (room as any).username,
        (room as any).subtitle,
      ],
      chatId,
    ),
    subtitle,
    roomType: normalizeRoomType(room),
    verified: Boolean((room as any).verified),
    avatarLetter:
      normalizeString((room as any).avatarLetter) ??
      normalizeString((room as any).avatar_label) ??
      null,
    phone: normalizeString((room as any).phone),
    username: normalizeString((room as any).username),
    avatarUrl: normalizeString((room as any).avatarUrl),
    photoUrl: normalizeString((room as any).photoUrl),
    currentUserId: normalizeString((room as any).currentUserId),
    peerUserId: normalizeString((room as any).peerUserId),
    updatedAt: normalizeRoomUpdatedAt(room),
    unread:
      typeof (room as any).unread === "number" && Number.isFinite((room as any).unread)
        ? adjustUnreadForHiddenReactions((room as any).unread, hiddenReactionTailCount)
        : undefined,
    unreadCount:
      typeof (room as any).unreadCount === "number" && Number.isFinite((room as any).unreadCount)
        ? adjustUnreadForHiddenReactions((room as any).unreadCount, hiddenReactionTailCount)
        : undefined,
  };
}

function mapMessageRecordToPreview(message: MessengerKernelMessageRecord): MessengerKernelPreviewMessage {
  const createdAt =
    normalizeString(message.createdAt) ??
    normalizeString(message.sentAt) ??
    normalizeString(message.occurredAt) ??
    new Date().toISOString();

  return {
    id: message.id,
    text:
      normalizeString(message.text) ??
      normalizeString(message.content) ??
      normalizeString(message.body) ??
      undefined,
    time: createdAt,
    previewTitle:
      normalizeString(message.previewTitle) ??
      normalizeString(message.title) ??
      normalizeString(message.previewSubtitle) ??
      normalizeString(message.subtitle) ??
      undefined,
    kind: normalizeString(message.type)?.toLowerCase() ?? undefined,
  };
}

async function syncDirectRoomProfile(snapshot: MessengerKernelRoomSnapshot) {
  if (normalizeRoomType(snapshot) !== "direct") return;

  await upsertPrivateChatProfile({
    chatId: snapshot.chatId,
    roomType: snapshot.roomType ?? undefined,
    name: snapshot.name,
    avatarLetter: snapshot.avatarLetter ?? undefined,
    phone: normalizeString(snapshot.phone) ?? undefined,
    username: normalizeString(snapshot.username) ?? undefined,
    verified: Boolean(snapshot.verified),
    currentUserId: normalizeString(snapshot.currentUserId) ?? undefined,
    peerUserId: normalizeString(snapshot.peerUserId) ?? undefined,
    avatarUrl: normalizeString(snapshot.avatarUrl) ?? normalizeString(snapshot.photoUrl) ?? undefined,
    photoUrl: normalizeString(snapshot.photoUrl) ?? normalizeString(snapshot.avatarUrl) ?? undefined,
    updatedAt: snapshot.updatedAt,
  });
}

function mapPrivateProfileToRoomSnapshot(profile: PrivateChatProfile): MessengerKernelRoomSnapshot | null {
  const chatId = normalizeString(profile.chatId);
  if (!chatId) return null;

  const name =
    normalizeString(profile.name) ??
    normalizeString(profile.username) ??
    normalizeString(profile.phone) ??
    chatId;
  const subtitle =
    normalizeString(profile.username) ??
    normalizeString(profile.phone) ??
    null;
  const updatedAt = normalizeString(profile.updatedAt) ?? new Date().toISOString();
  const hiddenReactionTailCount = countHiddenReactionControlTailForChat(chatId);
  const unreadCount =
    typeof profile.unreadCount === "number" && Number.isFinite(profile.unreadCount)
      ? adjustUnreadForHiddenReactions(profile.unreadCount, hiddenReactionTailCount) ?? 0
      : 0;

  return {
    chatId,
    name,
    subtitle,
    roomType: normalizeString(profile.roomType) ?? "direct",
    verified: Boolean(profile.verified),
    avatarLetter: normalizeString(profile.avatarLetter) ?? null,
    phone: normalizeString(profile.phone),
    username: normalizeString(profile.username),
    avatarUrl: normalizeString(profile.avatarUrl),
    photoUrl: normalizeString(profile.photoUrl),
    currentUserId: normalizeString(profile.currentUserId),
    peerUserId: normalizeString(profile.peerUserId),
    updatedAt,
    unread: unreadCount,
    unreadCount,
  };
}

export async function listMessengerKernelRoomSnapshots() {
  const byChatId = new Map<string, MessengerKernelRoomSnapshot>();

  selectMessengerRooms(getMessengerKernelState())
    .map(mapRoomRecordToSnapshot)
    .forEach((room) => {
      byChatId.set(room.chatId, room);
    });

  const profiles = await getPrivateChatProfileMap();
  Object.values(profiles).forEach((profile) => {
    const persisted = mapPrivateProfileToRoomSnapshot(profile);
    if (!persisted) return;

    const current = byChatId.get(persisted.chatId);
    const currentName = normalizeString(current?.name);
    const currentSubtitle = normalizeString(current?.subtitle);
    const currentRoomType = normalizeString(current?.roomType);
    const currentPhone = normalizeString(current?.phone);
    const currentUsername = normalizeString(current?.username);
    const currentAvatarUrl = normalizeString(current?.avatarUrl);
    const currentPhotoUrl = normalizeString(current?.photoUrl);
    const currentCurrentUserId = normalizeString(current?.currentUserId);
    const currentPeerUserId = normalizeString(current?.peerUserId);
    const currentUpdatedAt = normalizeString(current?.updatedAt);

    byChatId.set(persisted.chatId, {
      ...persisted,
      ...(current ?? {}),
      chatId: persisted.chatId,
      name: currentName && currentName !== persisted.chatId ? currentName : persisted.name,
      subtitle: currentSubtitle ?? persisted.subtitle,
      roomType: currentRoomType ?? persisted.roomType,
      phone: currentPhone ?? persisted.phone,
      username: currentUsername ?? persisted.username,
      avatarUrl: currentAvatarUrl ?? persisted.avatarUrl,
      photoUrl: currentPhotoUrl ?? persisted.photoUrl,
      currentUserId: currentCurrentUserId ?? persisted.currentUserId,
      peerUserId: currentPeerUserId ?? persisted.peerUserId,
      unread: typeof current?.unread === "number" ? current.unread : persisted.unread,
      unreadCount: typeof current?.unreadCount === "number" ? current.unreadCount : persisted.unreadCount,
      updatedAt:
        String(currentUpdatedAt ?? "").localeCompare(persisted.updatedAt) >= 0
          ? currentUpdatedAt ?? persisted.updatedAt
          : persisted.updatedAt,
    });
  });

  return Array.from(byChatId.values()).sort((a, b) =>
    String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")),
  );
}

export async function listMessengerKernelRoomPreviewMessages(chatId: string) {
  return selectMessengerMessagesByRoomId(getMessengerKernelState(), chatId)
    .map(mapMessageRecordToPreview)
    .filter((message) => !isSabiReactionControlPreview(message))
    .sort((a, b) => String(a.time || "").localeCompare(String(b.time || "")));
}

export async function ensureMessengerKernelRoomSnapshot(
  snapshot: Omit<MessengerKernelRoomSnapshot, "updatedAt"> & { updatedAt?: string | null },
) {
  const chatId = normalizeString(snapshot.chatId);
  const name = normalizeString(snapshot.name);
  if (!chatId || !name) return null;

  const current = selectMessengerRoomById(getMessengerKernelState(), chatId);
  const nextSnapshot: MessengerKernelRoomSnapshot = {
    chatId,
    name,
    subtitle: normalizeString(snapshot.subtitle) ?? null,
    roomType: normalizeString(snapshot.roomType) ?? "direct",
    verified: Boolean(snapshot.verified),
    avatarLetter: normalizeString(snapshot.avatarLetter) ?? null,
    phone: normalizeString(snapshot.phone),
    username: normalizeString(snapshot.username),
    avatarUrl: normalizeString(snapshot.avatarUrl),
    photoUrl: normalizeString(snapshot.photoUrl),
    currentUserId: normalizeString(snapshot.currentUserId),
    peerUserId: normalizeString(snapshot.peerUserId),
    updatedAt: normalizeString(snapshot.updatedAt) ?? new Date().toISOString(),
  };

  const nextRoom: MessengerKernelRoomRecord = {
    ...(current ?? { messageIds: [], participantIds: [] }),
    ...(current ?? {}),
    id: chatId,
    chatId,
    name: nextSnapshot.name,
    title: nextSnapshot.name,
    subtitle: nextSnapshot.subtitle,
    type: nextSnapshot.roomType,
    roomType: nextSnapshot.roomType,
    verified: nextSnapshot.verified,
    avatarLetter: nextSnapshot.avatarLetter,
    phone: nextSnapshot.phone,
    username: nextSnapshot.username,
    avatarUrl: nextSnapshot.avatarUrl,
    photoUrl: nextSnapshot.photoUrl,
    currentUserId: nextSnapshot.currentUserId,
    peerUserId: nextSnapshot.peerUserId,
    updatedAt: nextSnapshot.updatedAt,
    messageIds: current?.messageIds ?? [],
    participantIds: current?.participantIds ?? [],
  };

  upsertMessengerKernelRooms([nextRoom]);
  await syncDirectRoomProfile(nextSnapshot);
  emitRoomSnapshot(chatId);
  return nextRoom;
}

async function patchRoomFlags(chatId: string, patch: Record<string, unknown>) {
  const normalizedChatId = normalizeString(chatId);
  if (!normalizedChatId) return null;
  const current = selectMessengerRoomById(getMessengerKernelState(), normalizedChatId);
  const nextRoom: MessengerKernelRoomRecord = {
    ...(current ?? { id: normalizedChatId, chatId: normalizedChatId, messageIds: [], participantIds: [] }),
    ...(current ?? {}),
    ...patch,
    id: normalizedChatId,
    chatId: normalizedChatId,
    updatedAt: new Date().toISOString(),
    messageIds: current?.messageIds ?? [],
    participantIds: current?.participantIds ?? [],
  };
  upsertMessengerKernelRooms([nextRoom]);
  emitRoomSnapshot(normalizedChatId);
  return nextRoom;
}


export type MessengerKernelGroupRoomInput = {
  groupId?: string | null;
  linkedChatId?: string | null;
  groupName: string;
  description?: string | null;
  verified?: boolean;
  avatarLetter?: string | null;
  username?: string | null;
  memberCount?: number | null;
};

export type MessengerKernelChannelRoomInput = {
  channelId?: string | null;
  linkedChatId?: string | null;
  channelName: string;
  description?: string | null;
  verified?: boolean;
  avatarLetter?: string | null;
  username?: string | null;
};

function buildGroupRoomSubtitle(input: MessengerKernelGroupRoomInput) {
  const memberCount = Math.max(1, Number(input.memberCount ?? 0) || 0);
  const membersLabel = `${memberCount} members`;
  const description = normalizeString(input.description);
  return description ? `${membersLabel} В· ${description}` : membersLabel;
}

function buildChannelRoomSubtitle(input: MessengerKernelChannelRoomInput) {
  const handle = normalizeString(input.username);
  if (handle) {
    return handle.startsWith("@") ? handle : `@${handle}`;
  }
  return normalizeString(input.description) ?? input.channelName.trim();
}

export async function syncMessengerKernelGroupRoom(input: MessengerKernelGroupRoomInput) {
  const groupName = normalizeString(input.groupName);
  if (!groupName) return null;

  const normalizedGroupId = normalizeString(input.groupId);
  const chatId =
    normalizeString(input.linkedChatId) ??
    (normalizedGroupId ? `group:${normalizedGroupId}` : null) ??
    `group:${groupName.toLowerCase().replace(/\s+/g, "_")}`;

  return ensureMessengerKernelRoomSnapshot({
    chatId,
    name: groupName,
    subtitle: buildGroupRoomSubtitle(input),
    roomType: "group",
    verified: Boolean(input.verified),
    avatarLetter: normalizeString(input.avatarLetter) ?? (groupName.charAt(0) || "G").toUpperCase(),
    username: normalizeString(input.username),
  });
}

export async function syncMessengerKernelChannelRoom(input: MessengerKernelChannelRoomInput) {
  const channelName = normalizeString(input.channelName);
  if (!channelName) return null;

  const normalizedChannelId = normalizeString(input.channelId);
  const chatId =
    normalizeString(input.linkedChatId) ??
    (normalizedChannelId ? `channel:${normalizedChannelId}` : null) ??
    `channel:${channelName.toLowerCase().replace(/\s+/g, "_")}`;

  return ensureMessengerKernelRoomSnapshot({
    chatId,
    name: channelName,
    subtitle: buildChannelRoomSubtitle(input),
    roomType: "channel",
    verified: Boolean(input.verified),
    avatarLetter: normalizeString(input.avatarLetter) ?? (channelName.charAt(0) || "C").toUpperCase(),
    username: normalizeString(input.username),
  });
}


export async function setMessengerKernelPresenceActive(
  active: boolean,
  options?: { roomId?: string | null; reason?: string | null; force?: boolean },
) {
  messengerPresenceActive = Boolean(active);
  activeMessengerRoomId = messengerPresenceActive ? normalizeString(options?.roomId) : null;

  return setMessengerRealtimePresenceActive(messengerPresenceActive, {
    reason:
      options?.reason ??
      (messengerPresenceActive ? "messenger_route_active" : "messenger_route_inactive"),
    force: options?.force,
  });
}

export function getMessengerKernelPresenceScope() {
  return {
    active: messengerPresenceActive,
    roomId: activeMessengerRoomId,
  };
}
export async function bootMessengerKernel() {
  if (booted) {
    return messengerKernelFacade;
  }

  const session = await refreshSessionBinding();
  await connectMessengerRealtime();

  const currentUserId = resolveCurrentUserId(session.currentUserId);
  if (currentUserId) {
    sendFacadeRealtimeEvent("presence:snapshot:request", { userId: currentUserId });
  }

  booted = true;
  return messengerKernelFacade;
}

export async function shutdownMessengerKernel() {
  await disconnectMessengerRealtime();
  booted = false;
}

export function configureMessengerRuntime(config: MessengerKernelRuntimeConfig) {
  runtime.configure(config);
}

export function configureMessengerSession(config: MessengerKernelSessionConfig) {
  configureMessengerKernelSession(config);
}

export function resetMessengerKernelFacade() {
  booted = false;
  resetMessengerKernelSession();
  setMessengerKernelRealtimeStatus("idle");
}

export function resolveMessengerKernelCurrentUserId() {
  return selectMessengerCurrentUserId(getMessengerKernelState());
}

export function getMessengerKernelRoomMessages(chatId: string) {
  return selectMessengerMessagesByRoomId(getMessengerKernelState(), chatId);
}

export function getMessengerKernelRoomParticipants(chatId: string) {
  return selectMessengerParticipantsByRoomId(getMessengerKernelState(), chatId);
}

export async function hydrateMessengerKernelRoomGraph(
  chatId: string,
  params: Omit<MessengerKernelHydrateRoomGraphInput, "chatId"> = {},
) {
  const result = await runtime.hydrateRoomGraph({ chatId, ...params });
  emitRoomSnapshot(chatId);
  return result;
}

export function subscribeMessengerKernelRoom(
  chatId: string,
  callbacks?: {
    onSnapshot?: () => void;
  },
  options?: { currentUserId?: string | null },
) {
  const normalizedChatId = normalizeString(chatId);
  const currentUserId = resolveCurrentUserId(options?.currentUserId);

  if (normalizedChatId && currentUserId) {
    sendFacadeRealtimeEvent("chat:join", {
      chatId: normalizedChatId,
      userId: currentUserId,
    });
    sendFacadeRealtimeEvent("presence:snapshot:request", {
      chatId: normalizedChatId,
      userId: currentUserId,
    });
  }

  const buildSnapshotSignature = () => {
    if (!normalizedChatId) return "";
    const state = getMessengerKernelState();
    const messages = selectMessengerMessagesByRoomId(state, normalizedChatId);
    const participants = selectMessengerParticipantsByRoomId(state, normalizedChatId);
    const room = selectMessengerRoomById(state, normalizedChatId);
    const messageIds = messages.map((message) => `${message.id}:${message.updatedAt ?? message.editedAt ?? message.readAt ?? message.deliveredAt ?? message.deletedAt ?? message.createdAt ?? ""}`).join("|");
    const participantIds = participants.map((participant) => `${participant.id}:${participant.userId ?? participant.participantUserId ?? ""}:${participant.updatedAt ?? participant.state ?? participant.role ?? ""}`).join("|");
    return `${normalizedChatId}:${room?.updatedAt ?? ""}:m:${messages.length}:${messageIds}:p:${participants.length}:${participantIds}`;
  };

  let snapshotSignature = buildSnapshotSignature();
  const emitSnapshotIfChanged = (force = false) => {
    const nextSignature = buildSnapshotSignature();
    if (!force && nextSignature === snapshotSignature) return;
    snapshotSignature = nextSignature;
    callbacks?.onSnapshot?.();
  };

  const unsubscribeStore = subscribeMessengerKernelStore(() => {
    emitSnapshotIfChanged(false);
  });

  emitSnapshotIfChanged(true);

  return () => {
    unsubscribeStore();

    if (normalizedChatId && currentUserId) {
      sendFacadeRealtimeEvent("chat:leave", {
        chatId: normalizedChatId,
        userId: currentUserId,
      });
    }
  };
}

export async function sendMessengerKernelMessage(
  payload: MessengerKernelSendMessageInput,
) {
  const result = await runtime.sendMessage(payload);
  const resultMessage = readMessagePayloadFromRuntimeResult(result);
  const chatId =
    normalizeString(resultMessage?.chatId) ??
    normalizeString(resultMessage?.roomId) ??
    normalizeString(payload.chatId);
  const localChatId = normalizeString(payload.chatId);

  if (chatId) {
    const roomMessages = selectMessengerMessagesByRoomId(getMessengerKernelState(), chatId);
    const latestMessage = roomMessages[roomMessages.length - 1] ?? null;

    if (latestMessage) {
      sendFacadeRealtimeEvent(
        normalizeString(latestMessage.forwardedFromMessageId) ? "message:forwarded" : "message:new",
        {
          ...latestMessage,
          chatId,
          roomId: chatId,
          localChatId,
          messageId: latestMessage.id,
          userId: normalizeString(latestMessage.userId) ?? normalizeString(payload.userId),
        },
        normalizeString(latestMessage.createdAt) ?? normalizeString(latestMessage.sentAt),
      );
    }

    emitRoomSnapshot(chatId);

    if (localChatId && localChatId !== chatId) {
      emitRoomSnapshot(localChatId);
    }
  }

  return result;
}

export async function updateMessengerKernelMessage(
  payload: MessengerKernelUpdateMessageInput,
) {
  const result = await runtime.updateMessage(payload);
  const messageId = normalizeString(payload.id) ?? normalizeString(payload.messageId);
  const current = messageId
    ? selectMessengerMessageById(getMessengerKernelState(), messageId)
    : null;
  const chatId = normalizeString(payload.chatId) ?? normalizeString(current?.chatId);
  const editedAt = new Date().toISOString();

  if (current && messageId) {
    upsertMessengerKernelMessages([
      {
        ...current,
        id: current.id,
        chatId: current.chatId,
        content:
          normalizeString(payload.content) ??
          normalizeString(payload.text) ??
          current.content ??
          null,
        text:
          normalizeString(payload.text) ??
          normalizeString(payload.content) ??
          current.text ??
          null,
        editedAt: normalizeString((payload as Record<string, unknown>).editedAt) ?? editedAt,
        updatedAt: normalizeString((payload as Record<string, unknown>).editedAt) ?? editedAt,
      },
    ]);
  }

  if (chatId && messageId) {
    sendFacadeRealtimeEvent(
      "message:updated",
      {
        ...payload,
        chatId,
        roomId: chatId,
        messageId,
        id: messageId,
        userId: normalizeString(payload.userId) ?? resolveMessengerKernelCurrentUserId(),
        content: normalizeString(payload.content) ?? normalizeString(payload.text),
        text: normalizeString(payload.text) ?? normalizeString(payload.content),
        editedAt,
        updatedAt: editedAt,
      },
      editedAt,
    );
    emitRoomSnapshot(chatId);
  }
  return result;
}

export async function deleteMessengerKernelMessageForMe(
  idOrPayload: string | MessengerKernelDeleteMessageInput,
) {
  const payload: MessengerKernelDeleteMessageInput =
    typeof idOrPayload === "string"
      ? { id: idOrPayload, messageId: idOrPayload }
      : idOrPayload;

  const messageId = normalizeString(payload.id) ?? normalizeString(payload.messageId);
  const chatId =
    normalizeString(payload.chatId) ??
    (messageId
      ? normalizeString(
          selectMessengerMessageById(getMessengerKernelState(), messageId)?.chatId,
        )
      : null);

  if (messageId) {
    removeMessengerKernelMessages([messageId]);
  }

  if (chatId) {
    emitRoomSnapshot(chatId);
  }

  return {
    id: messageId,
    messageId,
    chatId,
    deletedForMe: true,
  };
}

export async function deleteMessengerKernelMessage(
  idOrPayload: string | MessengerKernelDeleteMessageInput,
) {
  const payload: MessengerKernelDeleteMessageInput =
    typeof idOrPayload === "string"
      ? { id: idOrPayload, messageId: idOrPayload }
      : idOrPayload;

  const deleteScope = normalizeString((payload as Record<string, unknown>).scope);
  const deleteForMeOnly =
    deleteScope === "me" ||
    (payload as Record<string, unknown>).deleteForMe === true ||
    (payload as Record<string, unknown>).forMe === true;

  if (deleteForMeOnly) {
    return deleteMessengerKernelMessageForMe(payload);
  }

  const messageId = normalizeString(payload.id) ?? normalizeString(payload.messageId);

  const chatId =
    normalizeString(payload.chatId) ??
    (messageId
      ? normalizeString(
          selectMessengerMessageById(getMessengerKernelState(), messageId)?.chatId,
        )
      : null);

  const result = await runtime.deleteMessage(payload);
  const deletedAt = new Date().toISOString();

  if (messageId) {
    removeMessengerKernelMessages([messageId]);
  }

  if (chatId && messageId) {
    sendFacadeRealtimeEvent(
      "message:deleted",
      {
        ...payload,
        chatId,
        roomId: chatId,
        messageId,
        id: messageId,
        userId: resolveMessengerKernelCurrentUserId(),
        deletedAt,
        deletedForEveryone: true,
      },
      deletedAt,
    );
    emitRoomSnapshot(chatId);
  }

  return result;
}

export async function uploadMessengerKernelMedia(
  payload: MessengerKernelUploadMediaInput,
) {
  return runtime.uploadMedia(payload);
}

export async function markMessengerKernelMessageRead(messageId: string) {
  const normalizedMessageId = normalizeString(messageId);
  if (!normalizedMessageId) return null;

  const current = selectMessengerMessageById(
    getMessengerKernelState(),
    normalizedMessageId,
  );
  const readAt = new Date().toISOString();
  const currentUserId = resolveMessengerKernelCurrentUserId();

  if (current) {
    upsertMessengerKernelMessages([
      {
        ...current,
        id: current.id,
        chatId: current.chatId,
        readAt: current.readAt ?? readAt,
        seenAt: current.seenAt ?? readAt,
      },
    ]);
    current.chatId && patchMessengerKernelRoomLocalState(current.chatId, {
      unread: 0,
      unreadCount: 0,
      lastReadAt: readAt,
    });
    if (current.chatId) void markPrivateChatRead(current.chatId).catch(() => {});
    if (current.chatId) emitRoomSnapshot(current.chatId);

    if (currentUserId) {
      sendFacadeRealtimeEvent(
        "message:read",
        {
          chatId: current.chatId,
          roomId: current.chatId,
          messageId: normalizedMessageId,
          userId: currentUserId,
        },
        readAt,
      );
    }
  }

  return runtime.markMessageRead(normalizedMessageId);
}

export function emitMessengerKernelTyping(payload: MessengerRealtimeTypingPayload) {
  const entry: MessengerKernelTypingEntry = {
    chatId: payload.chatId ?? "",
    userId: normalizeString(payload.userId) ?? resolveMessengerKernelCurrentUserId() ?? "",
    isTyping: Boolean(payload.isTyping),
    updatedAt: normalizeString(payload.at) ?? new Date().toISOString(),
  };

  if (entry.userId) {
    setMessengerKernelTypingEntry(entry);
  }

  return sendFacadeRealtimeEvent(
    payload.isTyping ? "typing:start" : "typing:stop",
    {
      chatId: payload.chatId ?? "",
      userId: entry.userId,
    },
    payload.at ?? null,
  );
}

export function emitMessengerKernelTypingStop(
  chatIdOrPayload: string | Omit<MessengerRealtimeTypingPayload, "isTyping">,
) {
  if (typeof chatIdOrPayload === "string") {
    return emitMessengerKernelTyping({
      chatId: chatIdOrPayload,
      isTyping: false,
    });
  }

  return emitMessengerKernelTyping({
    ...chatIdOrPayload,
    isTyping: false,
  });
}

export function emitMessengerKernelPresenceUpdate(payload: {
  userId: string;
  status: "online" | "offline";
  lastSeenAt?: string | null;
}) {
  const entry = {
    userId: payload.userId,
    status: payload.status,
    lastSeenAt: payload.lastSeenAt ?? null,
    updatedAt: new Date().toISOString(),
  } as const;

  setMessengerKernelPresence(entry);

  return sendFacadeRealtimeEvent(
    payload.status === "online" ? "presence:online" : "presence:offline",
    {
      userId: payload.userId,
      lastSeenAt: payload.lastSeenAt ?? null,
    },
  );
}

export function emitMessengerKernelRoomPresenceHandshake(payload: {
  chatId: string;
  userId: string;
  peerUserId?: string | null;
}) {
  const chatId = normalizeString(payload.chatId);
  const userId = resolveCurrentUserId(payload.userId);
  const peerUserId = normalizeString(payload.peerUserId);
  const at = new Date().toISOString();

  if (!chatId || !userId) return false;

  setMessengerKernelPresence({
    userId,
    status: "online",
    lastSeenAt: null,
    updatedAt: at,
  });

  const basePayload = {
    chatId,
    roomId: chatId,
    conversationId: chatId,
    userId,
    currentUserId: userId,
    requesterUserId: userId,
    ...(peerUserId ? { peerUserId, targetUserId: peerUserId } : {}),
  };

  const joined = sendFacadeRealtimeEvent("chat:join", basePayload, at);
  const roomJoined = sendFacadeRealtimeEvent("room.join", basePayload, at);
  const online = sendFacadeRealtimeEvent("presence:online", basePayload, at);
  const snapshot = sendFacadeRealtimeEvent("presence:snapshot:request", basePayload, at);

  return Boolean(joined || roomJoined || online || snapshot);
}

export function emitMessengerKernelPresenceSnapshotRequest(
  chatId?: string | null,
  userId?: string | null,
) {
  const resolvedUserId = resolveCurrentUserId(userId);
  if (!resolvedUserId) return null;

  return sendFacadeRealtimeEvent("presence:snapshot:request", {
    ...(normalizeString(chatId) ? { chatId: normalizeString(chatId) } : {}),
    userId: resolvedUserId,
  });
}

export function emitMessengerKernelMessageDelivered(
  payload: MessengerRealtimeMessageAckPayload,
) {
  const messageId = normalizeString(payload.messageId);
  const current = messageId
    ? selectMessengerMessageById(getMessengerKernelState(), messageId)
    : null;
  const chatId = normalizeString(payload.chatId) ?? normalizeString(current?.chatId);
  const at = normalizeString(payload.at) ?? new Date().toISOString();
  const userId = resolveCurrentUserId(payload.userId);

  if (messageId && current) {
    upsertMessengerKernelMessages([
      {
        ...current,
        id: current.id,
        chatId: current.chatId,
        deliveredAt: current.deliveredAt ?? at,
        receivedAt: current.receivedAt ?? at,
      },
    ]);
    if (current.chatId) emitRoomSnapshot(current.chatId);
  }

  return sendMessengerRealtimeClientEvent({
    eventName: "message:delivered",
    payload: {
      ...payload,
      messageId: messageId ?? payload.messageId,
      chatId: chatId ?? payload.chatId ?? null,
      roomId: chatId ?? payload.chatId ?? null,
      userId: userId ?? payload.userId ?? null,
      at,
    },
  });
}

export function emitMessengerKernelMessageRead(
  payload: MessengerRealtimeMessageAckPayload,
) {
  const messageId = normalizeString(payload.messageId);
  const current = messageId
    ? selectMessengerMessageById(getMessengerKernelState(), messageId)
    : null;
  const chatId = normalizeString(payload.chatId) ?? normalizeString(current?.chatId);
  const at = normalizeString(payload.at) ?? new Date().toISOString();
  const userId = resolveCurrentUserId(payload.userId);
  const currentUserId = resolveMessengerKernelCurrentUserId();

  if (messageId && current) {
    upsertMessengerKernelMessages([
      {
        ...current,
        id: current.id,
        chatId: current.chatId,
        readAt: current.readAt ?? at,
        seenAt: current.seenAt ?? at,
      },
    ]);

    if (userId && currentUserId && userId === currentUserId) {
      current.chatId && patchMessengerKernelRoomLocalState(current.chatId, {
        unread: 0,
        unreadCount: 0,
        lastReadAt: at,
      });
      if (current.chatId) void markPrivateChatRead(current.chatId).catch(() => {});
    }

    if (current.chatId) emitRoomSnapshot(current.chatId);
  }

  return sendMessengerRealtimeClientEvent({
    eventName: "message:read",
    payload: {
      ...payload,
      messageId: messageId ?? payload.messageId,
      chatId: chatId ?? payload.chatId ?? null,
      roomId: chatId ?? payload.chatId ?? null,
      userId: userId ?? payload.userId ?? null,
      at,
    },
  });
}

export async function listMessengerKernelRoomProfiles() {
  return getPrivateChatProfileMap();
}

export function isMessengerKernelRoomHidden(profile?: Partial<PrivateChatProfile> | null) {
  return isChatHiddenFromMain(profile);
}

export function isMessengerKernelRoomDeleted(profile?: Partial<PrivateChatProfile> | null) {
  return isChatDeleted(profile);
}

export function isMessengerKernelRoomBlocked(profile?: Partial<PrivateChatProfile> | null) {
  return isChatBlocked(profile);
}

export async function markMessengerKernelRoomRead(chatId: string) {
  await markPrivateChatRead(chatId);
  await patchRoomFlags(chatId, { unread: 0, unreadCount: 0, lastReadAt: new Date().toISOString() });
  return true;
}

export async function markMessengerKernelRoomUnread(chatId: string, unreadCount = 1) {
  const nextUnread = Math.max(1, Math.floor(unreadCount || 1));
  await markPrivateChatUnread(chatId, nextUnread);
  await patchRoomFlags(chatId, { unread: nextUnread, unreadCount: nextUnread });
  return true;
}

export async function incrementMessengerKernelRoomUnread(chatId: string, amount = 1) {
  const room = selectMessengerRoomById(getMessengerKernelState(), chatId);
  const nextUnread = Math.max(0, Number((room as any)?.unread ?? 0) + Math.max(0, Math.floor(amount || 0)));
  await incrementPrivateChatUnread(chatId, amount);
  await patchRoomFlags(chatId, { unread: nextUnread, unreadCount: nextUnread });
  return true;
}

export async function setMessengerKernelRoomMuted(chatId: string, muted: boolean) {
  await setPrivateChatMuted(chatId, muted);
  await patchRoomFlags(chatId, { muted: Boolean(muted) });
  return true;
}

export async function setMessengerKernelRoomPinned(chatId: string, pinned: boolean) {
  await setPrivateChatPinned(chatId, pinned);
  await patchRoomFlags(chatId, { pinned: Boolean(pinned) });
  return true;
}

export async function setMessengerKernelRoomHidden(chatId: string, hiddenFromMain: boolean) {
  const profile = await setPrivateChatHiddenFromMain(chatId, hiddenFromMain);
  await patchRoomFlags(chatId, {
    hiddenFromMain: Boolean(hiddenFromMain),
    hiddenAt: profile?.hiddenAt ?? null,
    requireUnlockOnOpen: profile?.requireUnlockOnOpen ?? Boolean(hiddenFromMain),
  });
  return true;
}

export async function setMessengerKernelRoomBlocked(
  chatId: string,
  isBlocked: boolean,
  blockedByUserId?: string | null,
) {
  const profile = await setPrivateChatBlocked(chatId, isBlocked, blockedByUserId);
  await patchRoomFlags(chatId, {
    isBlocked: Boolean(isBlocked),
    blocked: Boolean(isBlocked),
    blockedAt: profile?.blockedAt ?? null,
    blockedByUserId: profile?.blockedByUserId ?? null,
    muted: profile?.muted ?? Boolean(isBlocked),
  });
  return true;
}

export async function setMessengerKernelRoomDeleted(chatId: string, deleted: boolean) {
  await setPrivateChatDeleted(chatId, deleted);
  await patchRoomFlags(chatId, { deleted: Boolean(deleted) });
  return true;
}

export async function openMessengerKernelRoom(chatId: string) {
  const normalizedChatId = normalizeString(chatId);
  if (!normalizedChatId) return null;
  await markMessengerKernelRoomRead(normalizedChatId);
  return selectMessengerRoomById(getMessengerKernelState(), normalizedChatId);
}

export const messengerKernelFacade = {
  subscribe(listener: MessengerKernelStoreListener) {
    return subscribeMessengerKernelStore(listener);
  },

  on<K extends keyof MessengerKernelEventMap>(
    eventName: K,
    handler: (payload: MessengerKernelEventMap[K]) => void,
  ) {
    return eventBus.on(eventName, handler);
  },

  async boot() {
    return bootMessengerKernel();
  },

  async shutdown() {
    return shutdownMessengerKernel();
  },

  async reconnectRealtime() {
    return reconnectMessengerRealtime();
  },

  async emitTyping(payload: MessengerRealtimeTypingPayload) {
    return emitMessengerKernelTyping(payload);
  },

  async setPresence(payload: {
    userId: string;
    status: "online" | "offline";
    lastSeenAt?: string | null;
  }) {
    return emitMessengerKernelPresenceUpdate(payload);
  },

  selectors: {
    realtimeStatus: () => selectMessengerRealtimeStatus(getMessengerKernelState()),
    runtimeStatus: () => selectMessengerRuntimeStatus(getMessengerKernelState()),
    currentUserId: () => selectMessengerCurrentUserId(getMessengerKernelState()),
    accessToken: () => selectMessengerAccessToken(getMessengerKernelState()),
    apiBaseUrl: () => selectMessengerApiBaseUrl(getMessengerKernelState()),
    socketUrl: () => selectMessengerSocketUrl(getMessengerKernelState()),
    socketPath: () => selectMessengerSocketPath(getMessengerKernelState()),
    authScheme: () => selectMessengerAuthScheme(getMessengerKernelState()),
    session: () => selectMessengerSession(getMessengerKernelState()),
    lastError: () => selectMessengerLastError(getMessengerKernelState()),
    rooms: () => selectMessengerRooms(getMessengerKernelState()),
    chats: () => selectMessengerChats(getMessengerKernelState()),
    groups: () => selectMessengerGroups(getMessengerKernelState()),
    channels: () => selectMessengerChannels(getMessengerKernelState()),
    bots: () => selectMessengerBots(getMessengerKernelState()),
    roomById: (roomId: string) => selectMessengerRoomById(getMessengerKernelState(), roomId),
    roomSummary: (roomId: string) =>
      selectMessengerRoomSummary(getMessengerKernelState(), roomId),
    roomMessages: (roomId: string) =>
      selectMessengerMessagesByRoomId(getMessengerKernelState(), roomId),
    roomParticipants: (roomId: string) =>
      selectMessengerParticipantsByRoomId(getMessengerKernelState(), roomId),
    presenceByUserId: (userId: string) =>
      selectMessengerPresenceByUserId(getMessengerKernelState(), userId),
    isUserOnline: (userId: string) =>
      selectMessengerIsUserOnline(getMessengerKernelState(), userId),
    typingByChatId: (chatId: string) =>
      selectMessengerTypingByChatId(getMessengerKernelState(), chatId),
    typingUserIds: (chatId: string) =>
      selectMessengerTypingUserIds(getMessengerKernelState(), chatId),
  },

  async listRoomSnapshots() {
    return listMessengerKernelRoomSnapshots();
  },

  async listRoomPreviewMessages(chatId: string) {
    return listMessengerKernelRoomPreviewMessages(chatId);
  },

  async ensureRoomSnapshot(snapshot: Omit<MessengerKernelRoomSnapshot, "updatedAt"> & { updatedAt?: string | null }) {
    return ensureMessengerKernelRoomSnapshot(snapshot);
  },

  async listRoomProfiles() {
    return listMessengerKernelRoomProfiles();
  },

  isRoomHidden(profile?: Partial<PrivateChatProfile> | null) {
    return isMessengerKernelRoomHidden(profile);
  },

  isRoomDeleted(profile?: Partial<PrivateChatProfile> | null) {
    return isMessengerKernelRoomDeleted(profile);
  },

  isRoomBlocked(profile?: Partial<PrivateChatProfile> | null) {
    return isMessengerKernelRoomBlocked(profile);
  },

  rooms: {
    open: openMessengerKernelRoom,
    markRead: markMessengerKernelRoomRead,
    markUnread: markMessengerKernelRoomUnread,
    incrementUnread: incrementMessengerKernelRoomUnread,
    setMuted: setMessengerKernelRoomMuted,
    setPinned: setMessengerKernelRoomPinned,
    setHidden: setMessengerKernelRoomHidden,
    setBlocked: setMessengerKernelRoomBlocked,
    setDeleted: setMessengerKernelRoomDeleted,
  },

  groups: {
    syncProfileRoom: syncMessengerKernelGroupRoom,
    openProfileRoom: openMessengerKernelRoom,
  },

  channels: {
    syncProfileRoom: syncMessengerKernelChannelRoom,
    openProfileRoom: openMessengerKernelRoom,
  },
};

export function clearMessengerKernelRoomMessagesForMe(chatId: string) {
  clearMessengerKernelRoomMessagesLocalState(chatId);
  emitRoomSnapshot(chatId);
}

export function clearMessengerKernelRoomState(chatId: string) {
  clearMessengerKernelRoomMessagesForMe(chatId);
}





