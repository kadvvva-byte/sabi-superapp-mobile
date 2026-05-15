import type {
  MessengerKernelAuthScheme,
  MessengerKernelMessageRecord,
  MessengerKernelParticipantRecord,
  MessengerKernelPresenceEntry,
  MessengerKernelRoomRecord,
  MessengerKernelSessionSnapshot,
  MessengerKernelState,
  MessengerKernelStoreListener,
  MessengerKernelTypingEntry,
  MessengerRealtimeStatus,
  MessengerRuntimeStatus,
} from "./types";

function normalizeString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function normalizeRecord(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object") return {};

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .map(([key, raw]) => [key.trim(), normalizeString(raw)])
      .filter((entry): entry is [string, string] => Boolean(entry[0] && entry[1])),
  );
}

function normalizeAuthScheme(value: unknown): MessengerKernelAuthScheme {
  return value === "raw" ? "raw" : "Bearer";
}

function uniqueIds(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value))));
}

function createInitialSessionState(): MessengerKernelSessionSnapshot {
  return {
    apiBaseUrl: null,
    accessToken: null,
    currentUserId: null,
    socketUrl: null,
    socketPath: "/socket.io",
    authScheme: "Bearer",
    query: {},
    headers: {},
  };
}

function createInitialState(): MessengerKernelState {
  const session = createInitialSessionState();

  return {
    runtimeStatus: "idle",
    realtimeStatus: "idle",
    currentUserId: session.currentUserId,
    apiBaseUrl: session.apiBaseUrl,
    accessToken: session.accessToken,
    socketUrl: session.socketUrl ?? null,
    socketPath: session.socketPath ?? null,
    authScheme: session.authScheme,
    query: session.query,
    headers: session.headers,
    lastError: null,
    roomsById: {},
    messagesById: {},
    participantsById: {},
    roomMessageIds: {},
    roomParticipantIds: {},
    presenceByUserId: {},
    typingByChatId: {},
  };
}

export type MessengerKernelStore = {
  getState(): MessengerKernelState;
  subscribe(listener: MessengerKernelStoreListener): () => void;
  patch(updater: (state: MessengerKernelState) => MessengerKernelState): void;
  reset(): void;
};

export function createMessengerKernelStore(
  initialState?: Partial<MessengerKernelState>,
): MessengerKernelStore {
  let state: MessengerKernelState = { ...createInitialState(), ...initialState };
  const listeners = new Set<MessengerKernelStoreListener>();

  const notify = () => {
    listeners.forEach((listener) => listener());
  };

  return {
    getState() {
      return state;
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    patch(updater) {
      state = updater(state);
      notify();
    },
    reset() {
      state = createInitialState();
      notify();
    },
  };
}

const store = createMessengerKernelStore();

export function getMessengerKernelState() {
  return store.getState();
}

export function subscribeMessengerKernelStore(listener: MessengerKernelStoreListener) {
  return store.subscribe(listener);
}

export function resetMessengerKernelStore() {
  store.reset();
}

export function setMessengerKernelRuntimeStatus(status: MessengerRuntimeStatus) {
  store.patch((state) => ({ ...state, runtimeStatus: status }));
}

export function setMessengerKernelRealtimeStatus(status: MessengerRealtimeStatus) {
  store.patch((state) => ({ ...state, realtimeStatus: status }));
}

export function setMessengerKernelError(message: string | null) {
  store.patch((state) => ({ ...state, lastError: message }));
}

export function bindMessengerKernelRuntime(snapshot: Partial<MessengerKernelSessionSnapshot>) {
  const currentUserId = normalizeString(snapshot.currentUserId) ?? null;
  const apiBaseUrl = normalizeString(snapshot.apiBaseUrl) ?? null;
  const accessToken = normalizeString(snapshot.accessToken) ?? null;
  const socketUrl = normalizeString(snapshot.socketUrl) ?? apiBaseUrl;
  const socketPath = normalizeString(snapshot.socketPath) ?? "/socket.io";
  const authScheme = normalizeAuthScheme(snapshot.authScheme);
  const query = normalizeRecord(snapshot.query);
  const headers = normalizeRecord(snapshot.headers);

  store.patch((state) => ({
    ...state,
    currentUserId,
    apiBaseUrl,
    accessToken,
    socketUrl,
    socketPath,
    authScheme,
    query,
    headers,
  }));
}

export function upsertMessengerKernelRooms(rooms: MessengerKernelRoomRecord[]) {
  if (!rooms.length) return;

  store.patch((state) => {
    const nextRoomsById = { ...state.roomsById };
    const nextRoomMessageIds = { ...state.roomMessageIds };
    const nextRoomParticipantIds = { ...state.roomParticipantIds };

    rooms.forEach((room) => {
      const roomId = normalizeString(room.id);
      if (!roomId) return;
      const previous = nextRoomsById[roomId];
      const messageIds = uniqueIds([
        ...(room.messageIds ?? []),
        ...(previous?.messageIds ?? []),
        ...(state.roomMessageIds[roomId] ?? []),
      ]);
      const participantIds = uniqueIds([
        ...(room.participantIds ?? []),
        ...(previous?.participantIds ?? []),
        ...(state.roomParticipantIds[roomId] ?? []),
      ]);

      nextRoomsById[roomId] = {
        ...previous,
        ...room,
        id: roomId,
        messageIds,
        participantIds,
      };
      nextRoomMessageIds[roomId] = messageIds;
      nextRoomParticipantIds[roomId] = participantIds;
    });

    return {
      ...state,
      roomsById: nextRoomsById,
      roomMessageIds: nextRoomMessageIds,
      roomParticipantIds: nextRoomParticipantIds,
    };
  });
}

export function removeMessengerKernelRooms(roomIds: string[]) {
  if (!roomIds.length) return;

  store.patch((state) => {
    const nextRoomsById = { ...state.roomsById };
    const nextRoomMessageIds = { ...state.roomMessageIds };
    const nextRoomParticipantIds = { ...state.roomParticipantIds };

    roomIds.forEach((value) => {
      const roomId = normalizeString(value);
      if (!roomId) return;
      delete nextRoomsById[roomId];
      delete nextRoomMessageIds[roomId];
      delete nextRoomParticipantIds[roomId];
    });

    return {
      ...state,
      roomsById: nextRoomsById,
      roomMessageIds: nextRoomMessageIds,
      roomParticipantIds: nextRoomParticipantIds,
    };
  });
}

export function upsertMessengerKernelMessages(messages: MessengerKernelMessageRecord[]) {
  if (!messages.length) return;

  store.patch((state) => {
    const nextMessagesById = { ...state.messagesById };
    const nextRoomMessageIds = { ...state.roomMessageIds };
    const nextRoomsById = { ...state.roomsById };

    messages.forEach((message) => {
      const messageId = normalizeString(message.id);
      const chatId = normalizeString(message.chatId ?? message.roomId);
      if (!messageId || !chatId) return;

      const previousMessage = nextMessagesById[messageId];
      const createdAt =
        normalizeString(message.createdAt) ??
        normalizeString(message.sentAt) ??
        normalizeString(message.occurredAt) ??
        normalizeString((message as Record<string, unknown>).updatedAt) ??
        normalizeString(previousMessage?.createdAt) ??
        normalizeString(previousMessage?.sentAt) ??
        normalizeString(previousMessage?.occurredAt) ??
        new Date().toISOString();

      nextMessagesById[messageId] = {
        ...previousMessage,
        ...message,
        id: messageId,
        chatId,
        createdAt,
        deliveredAt:
          normalizeString(message.deliveredAt) ??
          normalizeString(previousMessage?.deliveredAt),
        receivedAt:
          normalizeString(message.receivedAt) ??
          normalizeString(previousMessage?.receivedAt),
        readAt:
          normalizeString(message.readAt) ??
          normalizeString(previousMessage?.readAt),
        seenAt:
          normalizeString(message.seenAt) ??
          normalizeString(previousMessage?.seenAt),
        editedAt:
          normalizeString(message.editedAt) ??
          normalizeString(message.updatedAt) ??
          normalizeString(previousMessage?.editedAt) ??
          normalizeString(previousMessage?.updatedAt),
        updatedAt:
          normalizeString(message.updatedAt) ??
          normalizeString(message.editedAt) ??
          normalizeString(previousMessage?.updatedAt) ??
          normalizeString(previousMessage?.editedAt),
        deletedAt:
          normalizeString(message.deletedAt) ??
          normalizeString(previousMessage?.deletedAt),
        deletedByUserId:
          normalizeString(message.deletedByUserId) ??
          normalizeString(previousMessage?.deletedByUserId),
        deletedForEveryone:
          typeof message.deletedForEveryone === "boolean"
            ? message.deletedForEveryone
            : typeof previousMessage?.deletedForEveryone === "boolean"
              ? previousMessage.deletedForEveryone
              : undefined,
        isDeleted:
          typeof message.isDeleted === "boolean"
            ? message.isDeleted
            : typeof previousMessage?.isDeleted === "boolean"
              ? previousMessage.isDeleted
              : undefined,
        forwardedFromMessageId:
          normalizeString(message.forwardedFromMessageId) ??
          normalizeString(previousMessage?.forwardedFromMessageId),
        forwardedFromChatId:
          normalizeString(message.forwardedFromChatId) ??
          normalizeString(previousMessage?.forwardedFromChatId),
        forwardedFromUserId:
          normalizeString(message.forwardedFromUserId) ??
          normalizeString(previousMessage?.forwardedFromUserId),
        forwardedFromLabel:
          normalizeString(message.forwardedFromLabel) ??
          normalizeString(previousMessage?.forwardedFromLabel),
        originalMessageId:
          normalizeString(message.originalMessageId) ??
          normalizeString(previousMessage?.originalMessageId),
        previewTitle:
          normalizeString(message.previewTitle) ??
          normalizeString(message.title) ??
          normalizeString(previousMessage?.previewTitle) ??
          normalizeString(previousMessage?.title),
        previewSubtitle:
          normalizeString(message.previewSubtitle) ??
          normalizeString(message.subtitle) ??
          normalizeString(previousMessage?.previewSubtitle) ??
          normalizeString(previousMessage?.subtitle),
        fileLabel:
          normalizeString(message.fileLabel) ??
          normalizeString(message.label) ??
          normalizeString(message.fileName) ??
          normalizeString(previousMessage?.fileLabel) ??
          normalizeString(previousMessage?.label) ??
          normalizeString(previousMessage?.fileName),
        mimeType:
          normalizeString(message.mimeType) ??
          normalizeString(message.contentType) ??
          normalizeString(previousMessage?.mimeType) ??
          normalizeString(previousMessage?.contentType),
        mediaUri:
          normalizeString(message.mediaUri) ??
          normalizeString(message.mediaUrl) ??
          normalizeString(message.remoteUri) ??
          normalizeString(message.uri) ??
          normalizeString(message.url) ??
          normalizeString(message.fileUrl) ??
          normalizeString(message.attachmentUrl) ??
          normalizeString(message.assetUrl) ??
          normalizeString(message.downloadUrl) ??
          normalizeString(previousMessage?.mediaUri) ??
          normalizeString(previousMessage?.mediaUrl) ??
          normalizeString(previousMessage?.remoteUri) ??
          normalizeString(previousMessage?.uri) ??
          normalizeString(previousMessage?.url) ??
          normalizeString(previousMessage?.fileUrl) ??
          normalizeString(previousMessage?.attachmentUrl) ??
          normalizeString(previousMessage?.assetUrl) ??
          normalizeString(previousMessage?.downloadUrl),
        remoteUri:
          normalizeString(message.remoteUri) ??
          normalizeString(message.mediaUri) ??
          normalizeString(message.mediaUrl) ??
          normalizeString(message.url) ??
          normalizeString(message.fileUrl) ??
          normalizeString(message.downloadUrl) ??
          normalizeString(previousMessage?.remoteUri) ??
          normalizeString(previousMessage?.mediaUri) ??
          normalizeString(previousMessage?.mediaUrl) ??
          normalizeString(previousMessage?.url) ??
          normalizeString(previousMessage?.fileUrl) ??
          normalizeString(previousMessage?.downloadUrl),
        thumbnailUri:
          normalizeString(message.thumbnailUri) ??
          normalizeString(message.thumbUri) ??
          normalizeString(message.thumbnailUrl) ??
          normalizeString(previousMessage?.thumbnailUri) ??
          normalizeString(previousMessage?.thumbUri) ??
          normalizeString(previousMessage?.thumbnailUrl),
        fileName:
          normalizeString(message.fileName) ??
          normalizeString(message.name) ??
          normalizeString(previousMessage?.fileName) ??
          normalizeString(previousMessage?.name),
        fileSizeLabel:
          normalizeString(message.fileSizeLabel) ??
          normalizeString(message.sizeLabel) ??
          normalizeString(previousMessage?.fileSizeLabel) ??
          normalizeString(previousMessage?.sizeLabel),
        durationMs:
          typeof message.durationMs === "number" && Number.isFinite(message.durationMs)
            ? message.durationMs
            : typeof previousMessage?.durationMs === "number" && Number.isFinite(previousMessage.durationMs)
              ? previousMessage.durationMs
              : undefined,
        durationLabel:
          normalizeString(message.durationLabel) ??
          normalizeString(previousMessage?.durationLabel),
        latitude:
          typeof message.latitude === "number" && Number.isFinite(message.latitude)
            ? message.latitude
            : typeof previousMessage?.latitude === "number" && Number.isFinite(previousMessage.latitude)
              ? previousMessage.latitude
              : undefined,
        longitude:
          typeof message.longitude === "number" && Number.isFinite(message.longitude)
            ? message.longitude
            : typeof previousMessage?.longitude === "number" && Number.isFinite(previousMessage.longitude)
              ? previousMessage.longitude
              : undefined,
        animatedPayload:
          message.animatedPayload ?? previousMessage?.animatedPayload,
      };

      nextRoomMessageIds[chatId] = uniqueIds([
        ...(nextRoomMessageIds[chatId] ?? []),
        messageId,
      ]);

      const room = nextRoomsById[chatId] ?? {
        id: chatId,
        chatId,
        messageIds: [],
        participantIds: [],
      };

      const previousUpdatedAt = normalizeString((room as Record<string, unknown>).updatedAt);
      const previousLastMessageId = normalizeString((room as Record<string, unknown>).lastMessageId);
      const shouldPromoteLastMessage =
        !previousLastMessageId ||
        !previousUpdatedAt ||
        String(createdAt).localeCompare(previousUpdatedAt) >= 0;
      const nextUpdatedAt = shouldPromoteLastMessage ? createdAt : previousUpdatedAt;

      nextRoomsById[chatId] = {
        ...room,
        id: chatId,
        chatId: normalizeString(room.chatId) ?? chatId,
        messageIds: nextRoomMessageIds[chatId],
        updatedAt: nextUpdatedAt,
        lastMessageId: shouldPromoteLastMessage ? messageId : previousLastMessageId,
      };
    });

    return {
      ...state,
      messagesById: nextMessagesById,
      roomMessageIds: nextRoomMessageIds,
      roomsById: nextRoomsById,
    };
  });
}

export function patchMessengerKernelMessageLocalState(
  messageId: string,
  patch: Partial<MessengerKernelMessageRecord>,
) {
  const normalizedMessageId = normalizeString(messageId);
  if (!normalizedMessageId) return;

  store.patch((state) => {
    const current = state.messagesById[normalizedMessageId];
    if (!current) return state;

    return {
      ...state,
      messagesById: {
        ...state.messagesById,
        [normalizedMessageId]: {
          ...current,
          ...patch,
          id: normalizedMessageId,
          chatId: normalizeString(patch.chatId ?? current.chatId ?? current.roomId) ?? current.chatId,
        },
      },
    };
  });
}

export function removeMessengerKernelMessages(messageIds: string[]) {
  if (!messageIds.length) return;

  store.patch((state) => {
    const nextMessagesById = { ...state.messagesById };
    const nextRoomMessageIds = { ...state.roomMessageIds };
    const idsToRemove = new Set(
      messageIds.map((value) => normalizeString(value)).filter((value): value is string => Boolean(value)),
    );

    idsToRemove.forEach((messageId) => {
      delete nextMessagesById[messageId];
    });

    const nextRoomsById = { ...state.roomsById };

    Object.keys(nextRoomMessageIds).forEach((roomId) => {
      const remainingIds = (nextRoomMessageIds[roomId] ?? []).filter(
        (messageId) => !idsToRemove.has(messageId),
      );
      nextRoomMessageIds[roomId] = remainingIds;

      const room = nextRoomsById[roomId];
      const lastMessageId = normalizeString((room as Record<string, unknown> | undefined)?.lastMessageId);
      if (room && lastMessageId && idsToRemove.has(lastMessageId)) {
        const fallbackLastId = remainingIds[remainingIds.length - 1] ?? null;
        const fallbackLastMessage = fallbackLastId ? nextMessagesById[fallbackLastId] : null;
        nextRoomsById[roomId] = {
          ...room,
          messageIds: remainingIds,
          lastMessageId: fallbackLastId,
          updatedAt:
            normalizeString(fallbackLastMessage?.createdAt) ??
            normalizeString(fallbackLastMessage?.sentAt) ??
            normalizeString(fallbackLastMessage?.occurredAt) ??
            normalizeString((room as Record<string, unknown>).updatedAt),
        };
      }
    });

    return {
      ...state,
      messagesById: nextMessagesById,
      roomMessageIds: nextRoomMessageIds,
      roomsById: nextRoomsById,
    };
  });
}

export function upsertMessengerKernelParticipants(
  participants: MessengerKernelParticipantRecord[],
) {
  if (!participants.length) return;

  store.patch((state) => {
    const nextParticipantsById = { ...state.participantsById };
    const nextRoomParticipantIds = { ...state.roomParticipantIds };
    const nextRoomsById = { ...state.roomsById };

    participants.forEach((participant) => {
      const participantId = normalizeString(participant.id);
      const chatId = normalizeString(participant.chatId ?? participant.roomId);
      if (!participantId || !chatId) return;

      nextParticipantsById[participantId] = {
        ...nextParticipantsById[participantId],
        ...participant,
        id: participantId,
        chatId,
      };

      nextRoomParticipantIds[chatId] = uniqueIds([
        ...(nextRoomParticipantIds[chatId] ?? []),
        participantId,
      ]);

      const room = nextRoomsById[chatId] ?? {
        id: chatId,
        messageIds: [],
        participantIds: [],
      };

      nextRoomsById[chatId] = {
        ...room,
        participantIds: nextRoomParticipantIds[chatId],
      };
    });

    return {
      ...state,
      participantsById: nextParticipantsById,
      roomParticipantIds: nextRoomParticipantIds,
      roomsById: nextRoomsById,
    };
  });
}

export function removeMessengerKernelParticipants(participantIds: string[]) {
  if (!participantIds.length) return;

  store.patch((state) => {
    const nextParticipantsById = { ...state.participantsById };
    const nextRoomParticipantIds = { ...state.roomParticipantIds };
    const idsToRemove = new Set(
      participantIds
        .map((value) => normalizeString(value))
        .filter((value): value is string => Boolean(value)),
    );

    idsToRemove.forEach((participantId) => {
      delete nextParticipantsById[participantId];
    });

    Object.keys(nextRoomParticipantIds).forEach((roomId) => {
      nextRoomParticipantIds[roomId] = (nextRoomParticipantIds[roomId] ?? []).filter(
        (participantId) => !idsToRemove.has(participantId),
      );
    });

    return {
      ...state,
      participantsById: nextParticipantsById,
      roomParticipantIds: nextRoomParticipantIds,
    };
  });
}

export function setMessengerKernelPresence(entry: MessengerKernelPresenceEntry) {
  const userId = normalizeString(entry.userId);
  if (!userId) return;

  store.patch((state) => {
    const current = state.presenceByUserId[userId];
    const nextEntry = {
      ...entry,
      userId,
      status: entry.status,
      lastSeenAt: normalizeString(entry.lastSeenAt) ?? null,
      updatedAt: normalizeString(entry.updatedAt) ?? new Date().toISOString(),
    };

    if (
      current &&
      current.status === nextEntry.status &&
      (current.lastSeenAt ?? null) === (nextEntry.lastSeenAt ?? null)
    ) {
      return state;
    }

    return {
      ...state,
      presenceByUserId: {
        ...state.presenceByUserId,
        [userId]: nextEntry,
      },
    };
  });
}

export function setMessengerKernelTypingEntry(entry: MessengerKernelTypingEntry) {
  const chatId = normalizeString(entry.chatId);
  const userId = normalizeString(entry.userId);
  if (!chatId || !userId) return;

  store.patch((state) => {
    const current = state.typingByChatId[chatId] ?? [];
    const existing = current.find((item) => item.userId === userId);
    const nextEntries = current.filter((item) => item.userId !== userId);
    if (entry.isTyping) {
      nextEntries.push({ ...entry, chatId, userId });
    }

    const currentUserIds = current.map((item) => item.userId).sort().join("|");
    const nextUserIds = nextEntries.map((item) => item.userId).sort().join("|");
    if (currentUserIds === nextUserIds && Boolean(existing?.isTyping) === Boolean(entry.isTyping)) {
      return state;
    }

    return {
      ...state,
      typingByChatId: {
        ...state.typingByChatId,
        [chatId]: nextEntries,
      },
    };
  });
}

export function clearMessengerKernelTypingChat(chatId: string) {
  const normalizedChatId = normalizeString(chatId);
  if (!normalizedChatId) return;
  store.patch((state) => ({
    ...state,
    typingByChatId: {
      ...state.typingByChatId,
      [normalizedChatId]: [],
    },
  }));
}

export function patchMessengerKernelRoomLocalState(
  chatId: string,
  patch: Record<string, unknown>,
) {
  const normalizedChatId = normalizeString(chatId);
  if (!normalizedChatId) return;

  store.patch((state) => {
    const current = state.roomsById[normalizedChatId] ?? {
      id: normalizedChatId,
      chatId: normalizedChatId,
      messageIds: state.roomMessageIds[normalizedChatId] ?? [],
      participantIds: state.roomParticipantIds[normalizedChatId] ?? [],
    };

    return {
      ...state,
      roomsById: {
        ...state.roomsById,
        [normalizedChatId]: {
          ...current,
          ...patch,
          id: normalizedChatId,
          chatId: normalizeString(current.chatId) ?? normalizedChatId,
          messageIds: current.messageIds ?? state.roomMessageIds[normalizedChatId] ?? [],
          participantIds:
            current.participantIds ?? state.roomParticipantIds[normalizedChatId] ?? [],
        },
      },
    };
  });
}


export function clearMessengerKernelRoomMessagesLocalState(chatId: string) {
  const normalizedChatId = normalizeString(chatId);
  if (!normalizedChatId) return;

  const state = store.getState();
  removeMessengerKernelMessages(state.roomMessageIds[normalizedChatId] ?? []);
  clearMessengerKernelTypingChat(normalizedChatId);
}

export function removeMessengerKernelRoomLocalState(chatId: string) {
  const normalizedChatId = normalizeString(chatId);
  if (!normalizedChatId) return;

  const state = store.getState();
  removeMessengerKernelMessages(state.roomMessageIds[normalizedChatId] ?? []);
  removeMessengerKernelParticipants(state.roomParticipantIds[normalizedChatId] ?? []);
  removeMessengerKernelRooms([normalizedChatId]);
  clearMessengerKernelTypingChat(normalizedChatId);
}


