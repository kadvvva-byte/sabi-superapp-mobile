import type {
  MessengerKernelMessageRecord,
  MessengerKernelParticipantRecord,
  MessengerKernelPresenceEntry,
  MessengerKernelRoomRecord,
  MessengerKernelSessionSnapshot,
  MessengerKernelState,
  MessengerRealtimeStatus,
  MessengerRuntimeStatus,
} from "./types";

function normalizeString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

export function selectMessengerRealtimeStatus(
  state: MessengerKernelState,
): MessengerRealtimeStatus {
  return state.realtimeStatus;
}

export function selectMessengerRuntimeStatus(
  state: MessengerKernelState,
): MessengerRuntimeStatus {
  return state.runtimeStatus;
}

export function selectMessengerCurrentUserId(
  state: MessengerKernelState,
): string | null {
  return state.currentUserId;
}

export function selectMessengerAccessToken(
  state: MessengerKernelState,
): string | null {
  return state.accessToken;
}

export function selectMessengerApiBaseUrl(
  state: MessengerKernelState,
): string | null {
  return state.apiBaseUrl;
}

export function selectMessengerSocketUrl(
  state: MessengerKernelState,
): string | null {
  return state.socketUrl;
}

export function selectMessengerSocketPath(
  state: MessengerKernelState,
): string | null {
  return state.socketPath;
}

export function selectMessengerAuthScheme(state: MessengerKernelState) {
  return state.authScheme;
}

export function selectMessengerSession(
  state: MessengerKernelState,
): MessengerKernelSessionSnapshot {
  return {
    apiBaseUrl: state.apiBaseUrl,
    accessToken: state.accessToken,
    currentUserId: state.currentUserId,
    socketUrl: state.socketUrl,
    socketPath: state.socketPath,
    authScheme: state.authScheme,
    query: { ...state.query },
    headers: { ...state.headers },
  };
}

export function selectMessengerLastError(
  state: MessengerKernelState,
): string | null {
  return state.lastError;
}

export function selectMessengerRoomById(
  state: MessengerKernelState,
  roomId: string,
): MessengerKernelRoomRecord | null {
  return state.roomsById[roomId] ?? null;
}

export function selectMessengerRooms(
  state: MessengerKernelState,
): MessengerKernelRoomRecord[] {
  return Object.values(state.roomsById);
}

export function selectMessengerMessageById(
  state: MessengerKernelState,
  messageId: string,
): MessengerKernelMessageRecord | null {
  return state.messagesById[messageId] ?? null;
}

export function selectMessengerMessagesByRoomId(
  state: MessengerKernelState,
  roomId: string,
): MessengerKernelMessageRecord[] {
  const ids = state.roomMessageIds[roomId] ?? [];
  return ids
    .map((id) => state.messagesById[id])
    .filter((value): value is MessengerKernelMessageRecord => Boolean(value));
}

export function selectMessengerParticipantsByRoomId(
  state: MessengerKernelState,
  roomId: string,
): MessengerKernelParticipantRecord[] {
  const ids = state.roomParticipantIds[roomId] ?? [];
  return ids
    .map((id) => state.participantsById[id])
    .filter((value): value is MessengerKernelParticipantRecord => Boolean(value));
}

export function selectMessengerPresenceByUserId(
  state: MessengerKernelState,
  userId: string,
): MessengerKernelPresenceEntry | null {
  return state.presenceByUserId[userId] ?? null;
}

export function selectMessengerIsUserOnline(
  state: MessengerKernelState,
  userId: string,
): boolean {
  return state.presenceByUserId[userId]?.status === "online";
}

export function selectMessengerTypingByChatId(
  state: MessengerKernelState,
  chatId: string,
): { chatId: string; userIds: string[] } {
  const entries = state.typingByChatId[chatId] ?? [];
  return {
    chatId,
    userIds: entries.filter((entry) => entry.isTyping).map((entry) => entry.userId),
  };
}

export function selectMessengerTypingUserIds(
  state: MessengerKernelState,
  chatId: string,
): string[] {
  return selectMessengerTypingByChatId(state, chatId).userIds;
}

export function selectMessengerRoomSummary(
  state: MessengerKernelState,
  roomId: string,
) {
  const room = selectMessengerRoomById(state, roomId);
  const messages = selectMessengerMessagesByRoomId(state, roomId);
  const participants = selectMessengerParticipantsByRoomId(state, roomId);

  return {
    room,
    messages,
    participants,
    lastMessage: messages.length ? messages[messages.length - 1] : null,
  };
}

export function selectMessengerPeerPresenceByRoomId(
  state: MessengerKernelState,
  roomId: string,
): MessengerKernelPresenceEntry | null {
  const room = selectMessengerRoomById(state, roomId);
  const peerUserId = normalizeString(room?.peerUserId);

  if (peerUserId) {
    return state.presenceByUserId[peerUserId] ?? null;
  }

  const currentUserId = normalizeString(state.currentUserId);
  const participants = selectMessengerParticipantsByRoomId(state, roomId);

  for (const participant of participants) {
    const userId =
      normalizeString(participant.userId) ??
      normalizeString(participant.participantUserId) ??
      normalizeString(participant.memberUserId) ??
      normalizeString(participant.peerId);

    if (userId && userId !== currentUserId) {
      return state.presenceByUserId[userId] ?? null;
    }
  }

  return null;
}

export const selectMessengerKernelCurrentUserId = selectMessengerCurrentUserId;
export const selectMessengerKernelMessagesByRoomId = selectMessengerMessagesByRoomId;
export const selectMessengerKernelMessageById = selectMessengerMessageById;
export const selectMessengerKernelParticipantsByRoomId =
  selectMessengerParticipantsByRoomId;
export const selectMessengerKernelPeerPresenceByRoomId =
  selectMessengerPeerPresenceByRoomId;
export const selectMessengerKernelRealtimeStatus = selectMessengerRealtimeStatus;
export const selectMessengerKernelRoomById = selectMessengerRoomById;
export const selectMessengerKernelRoomSummary = selectMessengerRoomSummary;
export const selectMessengerKernelRooms = selectMessengerRooms;


function resolveRoomKind(room: MessengerKernelRoomRecord | null | undefined) {
  const kind =
    normalizeString((room as any)?.roomType) ??
    normalizeString((room as any)?.type) ??
    "direct";
  return kind.toLowerCase();
}

function isBotRoom(room: MessengerKernelRoomRecord | null | undefined) {
  const kind = resolveRoomKind(room);
  if (kind === "bot") return true;

  const id = (normalizeString(room?.chatId ?? room?.id) ?? "").toLowerCase();
  const title = (normalizeString((room as any)?.title) ?? "").toLowerCase();
  const subtitle = (normalizeString((room as any)?.subtitle) ?? "").toLowerCase();

  return (
    id.startsWith("bot:") ||
    id.startsWith("bot_") ||
    subtitle.startsWith("@bot") ||
    subtitle.startsWith("bot:") ||
    subtitle.startsWith("assistant:") ||
    title.endsWith(" bot") ||
    title.includes("[bot]")
  );
}

export function selectMessengerChats(state: MessengerKernelState) {
  return selectMessengerRooms(state).filter((room) => {
    const kind = resolveRoomKind(room);
    return kind === "direct" || kind === "business" || isBotRoom(room);
  });
}

export function selectMessengerGroups(state: MessengerKernelState) {
  return selectMessengerRooms(state).filter((room) => resolveRoomKind(room) === "group");
}

export function selectMessengerChannels(state: MessengerKernelState) {
  return selectMessengerRooms(state).filter((room) => resolveRoomKind(room) === "channel");
}

export function selectMessengerBots(state: MessengerKernelState) {
  return selectMessengerRooms(state).filter((room) => isBotRoom(room));
}


export const selectMessengerKernelChats = selectMessengerChats;
export const selectMessengerKernelGroups = selectMessengerGroups;
export const selectMessengerKernelChannels = selectMessengerChannels;
export const selectMessengerKernelBots = selectMessengerBots;
