import { openMessengerRoom } from "../navigation/messengerRoomNavigation";
import { registerPersistedChatRoom } from "../chat-room/services/chatRoomRealtime";
import {
  joinSabiPublicGroup,
  startSabiPublicBot,
  subscribeSabiPublicChannel,
} from "./publicDirectoryActionsClient";
import {
  canShowSabiPublicDirectoryItem,
  fetchSabiPublicDirectoryRuntime,
  forgetSabiPublicDirectoryBlockedItem,
  rememberSabiPublicDirectoryBlockedItem,
  type SabiPublicDirectoryItem,
  type SabiPublicDirectoryRuntimeSnapshot,
} from "./publicDirectoryClient";

type OpenResult = {
  ok: boolean;
  kind: "GROUP" | "CHANNEL" | "BOT";
  id: string;
  error?: string | null;
  code?: string | null;
  status?: number;
  blocked?: boolean;
  shouldRefreshList?: boolean;
};


function buildSabiDirectoryBlockedOpenResult(kind: "GROUP" | "CHANNEL" | "BOT", id: string, error = "public_directory_item_not_visible"): OpenResult {
  rememberSabiPublicDirectoryBlockedItem(kind, id);

  return {
    ok: false,
    kind,
    id,
    error,
    code: error,
    status: 403,
    blocked: true,
    shouldRefreshList: true,
  };
}

function buildSabiDirectoryActionOpenError(
  kind: "GROUP" | "CHANNEL" | "BOT",
  id: string,
  result: { error?: string | null; code?: string | null; status?: number; blocked?: boolean },
  fallback: string,
): OpenResult {
  const code = result.code || result.error || fallback;
  const blocked = result.blocked === true || result.status === 403 || code === "public_directory_item_not_visible";

  if (blocked) {
    rememberSabiPublicDirectoryBlockedItem(kind, id);
  }

  return {
    ok: false,
    kind,
    id,
    error: result.error || code,
    code,
    status: result.status || (blocked ? 403 : 0),
    blocked,
    shouldRefreshList: blocked,
  };
}

function mergeSabiDirectoryConfirmedItem(
  item: SabiPublicDirectoryItem,
  data: unknown,
  kind: "GROUP" | "CHANNEL" | "BOT",
): SabiPublicDirectoryItem {
  return {
    ...item,
    ...(data && typeof data === "object" ? data : {}),
    kind,
    type: kind,
  } as SabiPublicDirectoryItem;
}

function mergeSabiDirectoryRuntimeIntoItem(
  item: SabiPublicDirectoryItem,
  runtime: SabiPublicDirectoryRuntimeSnapshot | null | undefined,
): SabiPublicDirectoryItem {
  if (!runtime) return item;

  return {
    ...item,
    runtime,
    membershipStatus: runtime.membershipStatus,
    joinedByCurrentUser: runtime.joinedByCurrentUser,
    subscribedByCurrentUser: runtime.subscribedByCurrentUser,
    startedByCurrentUser: runtime.startedByCurrentUser,
    canSendMessages: runtime.canSendMessages,
    canInvite: runtime.canInvite,
    inviteAvailable: runtime.inviteAvailable,
    inviteLink: runtime.inviteLink || (item as any).inviteLink,
    shareText: runtime.shareText || (item as any).shareText,
    memberUserIds: runtime.memberUserIds,
    subscriberUserIds: runtime.subscriberUserIds,
    startedUserIds: runtime.startedUserIds,
    membersCount: runtime.membersCount,
    subscribersCount: runtime.subscribersCount,
    startedCount: runtime.startedCount,
  } as SabiPublicDirectoryItem;
}

async function hydrateSabiDirectoryRuntimeForOpen(
  item: SabiPublicDirectoryItem,
  kind: "GROUP" | "CHANNEL" | "BOT",
  id: string,
): Promise<SabiPublicDirectoryItem> {
  const initialRuntime = (item as any).runtime && typeof (item as any).runtime === "object"
    ? (item as any).runtime as SabiPublicDirectoryRuntimeSnapshot
    : null;
  let nextItem = mergeSabiDirectoryRuntimeIntoItem(item, initialRuntime);

  try {
    const runtimeResult = await fetchSabiPublicDirectoryRuntime({ kind, id });

    if (runtimeResult.ok && runtimeResult.runtime) {
      nextItem = mergeSabiDirectoryRuntimeIntoItem(
        {
          ...nextItem,
          ...(runtimeResult.item && typeof runtimeResult.item === "object" ? runtimeResult.item : {}),
          kind,
          type: kind,
        } as SabiPublicDirectoryItem,
        runtimeResult.runtime,
      );
    }
  } catch {}

  return nextItem;
}

function readItemId(item: SabiPublicDirectoryItem) {
  return String(item.chatId || item.roomId || item.botId || item.id || "").trim();
}

function readItemName(item: SabiPublicDirectoryItem) {
  return String(item.title || item.name || "").trim();
}

function readItemKind(item: SabiPublicDirectoryItem): "GROUP" | "CHANNEL" | "BOT" {
  const kind = String(item.kind || item.type || "").toUpperCase();

  if (kind === "CHANNEL") return "CHANNEL";
  if (kind === "BOT") return "BOT";

  return "GROUP";
}

function readAvatarUrl(item: SabiPublicDirectoryItem) {
  const avatarUrl = String((item as any).avatarUrl || (item as any).avatarUri || (item as any).photoUrl || "").trim();
  return avatarUrl || undefined;
}

function readUsername(item: SabiPublicDirectoryItem) {
  return typeof item.username === "string" && item.username.trim()
    ? item.username.trim()
    : undefined;
}

function hasSabiDirectoryRichMedia(value: unknown): boolean {
  if (Array.isArray(value)) return value.length > 0;

  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.length > 0 : value.trim() !== "[]";
    } catch {
      return value.trim() !== "[]";
    }
  }

  return false;
}

function pickSabiDirectoryRichMedia(primary: unknown, fallback: unknown) {
  return hasSabiDirectoryRichMedia(primary) ? primary : fallback;
}

function stringifySabiDirectoryPayload(value: unknown) {
  if (!value) return undefined;
  if (typeof value === "string") return value;

  try {
    return JSON.stringify(value);
  } catch {
    return undefined;
  }
}

function readSabiDirectoryCount(value: unknown) {
  const next = Number(value);
  return Number.isFinite(next) ? String(Math.max(0, Math.floor(next))) : "0";
}


function parseSabiDirectoryMediaPayload(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;

  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return [];
}

function normalizeSabiGroupPublicMedia(value: unknown, kind: "photo" | "video") {
  return parseSabiDirectoryMediaPayload(value)
    .map((item, index) => {
      const record = (item ?? {}) as Record<string, unknown>;
      const mediaUri = String(record.mediaUri || record.uri || record.url || "").trim();
      const thumbnailUri = String(record.thumbnailUri || record.previewUri || record.coverUri || "").trim();
      const uri = kind === "video" ? (thumbnailUri || mediaUri) : (mediaUri || thumbnailUri);
      const openUri = mediaUri || uri || thumbnailUri;

      if (!uri && !openUri) return null;

      return {
        ...record,
        id: String(record.id || `${kind}-${index}`),
        uri: uri || openUri,
        mediaUri: openUri || uri,
        thumbnailUri: thumbnailUri || undefined,
        kind,
        mediaKind: kind,
        type: kind,
        liked: Boolean(record.liked),
      };
    })
    .filter(Boolean);
}

function buildGroupPublicProfileSnapshot(item: SabiPublicDirectoryItem, currentUserId?: string | null) {
  const id = readItemId(item);
  const name = readItemName(item);
  const avatarUrl = readAvatarUrl(item) || "";
  const publicPhotos = normalizeSabiGroupPublicMedia(
    pickSabiDirectoryRichMedia((item as any).publicPhotos, (item as any).publicationPhotos),
    "photo",
  );
  const publicVideos = normalizeSabiGroupPublicMedia(
    pickSabiDirectoryRichMedia((item as any).publicVideos, (item as any).publicationVideos),
    "video",
  );
  const username = readUsername(item);
  const aliases = Array.from(
    new Set(
      [
        id,
        (item as any).chatId,
        (item as any).roomId,
        (item as any).groupId,
        username,
        username ? `@${username}` : "",
        name,
      ]
        .map((value) => String(value || "").trim())
        .filter(Boolean),
    ),
  );

  return {
    id,
    chatId: id,
    roomId: id,
    groupId: id,
    userId: id,
    title: name,
    name,
    publicName: name,
    username,
    publicUsername: username,
    avatarUri: avatarUrl,
    avatarUrl,
    photoUrl: avatarUrl,
    coverUri: String((item as any).coverUri || (item as any).coverUrl || "").trim(),
    coverUrl: String((item as any).coverUrl || (item as any).coverUri || "").trim(),
    publicationPhotos: publicPhotos,
    publicationVideos: publicVideos,
    publicPhotos,
    publicVideos,
    likesCount: Number((item as any).likesCount || 0),
    publicGiftsCount: Number((item as any).publicGiftsCount || 0),
    aliases,
    ownerUserId: item.ownerUserId || item.createdBy || currentUserId || undefined,
    updatedAt: Date.now(),
  };
}

async function persistSabiGroupPublicProfileFromDirectory(
  item: SabiPublicDirectoryItem,
  currentUserId?: string | null,
) {
  const snapshot = buildGroupPublicProfileSnapshot(item, currentUserId);

  if (!snapshot.publicationPhotos.length && !snapshot.publicationVideos.length && !snapshot.avatarUri) {
    return;
  }

  try {
    const runtime = await import("../groups/groupPublicProfileRuntime");
    const save =
      (runtime as any).saveGroupPublicProfile ||
      (runtime as any).upsertGroupPublicProfile ||
      (runtime as any).setGroupPublicProfile ||
      (runtime as any).rememberGroupPublicProfile;

    if (typeof save !== "function") return;

    try {
      await save(snapshot.chatId, snapshot, snapshot.aliases);
      return;
    } catch {}

    try {
      await save(snapshot.chatId, snapshot);
      return;
    } catch {}

    try {
      await save({ ...snapshot, aliases: snapshot.aliases });
    } catch {}
  } catch {}
}


function readSabiDirectoryBoolean(value: unknown): boolean | null {
  const raw = String(value ?? "").trim().toLowerCase();

  if (["1", "true", "yes", "owner", "admin", "allowed", "enabled"].includes(raw)) return true;
  if (["0", "false", "no", "subscriber", "readonly", "blocked", "disabled"].includes(raw)) return false;

  return null;
}

function normalizeSabiDirectoryChannelRole(value: unknown): "" | "owner" | "admin" | "subscriber" | "viewer" {
  const raw = String(value ?? "").trim().toLowerCase();

  if (raw === "owner" || raw === "creator") return "owner";
  if (raw === "admin" || raw === "moderator") return "admin";
  if (raw === "subscriber" || raw === "member") return "subscriber";
  if (raw === "viewer" || raw === "guest") return "viewer";

  return "";
}

function canSabiDirectoryChannelPost(item: SabiPublicDirectoryItem, currentUserId?: string | null): boolean {
  const record = item as Record<string, unknown>;
  const role = normalizeSabiDirectoryChannelRole(record.channelRole || record.channelAccess);
  if (role === "owner" || role === "admin") return true;

  if (readSabiDirectoryBoolean(record.isChannelOwner) === true) return true;
  if (readSabiDirectoryBoolean(record.isChannelAdmin) === true) return true;
  if (readSabiDirectoryBoolean(record.canSendMessages) === true) return true;
  if (readSabiDirectoryBoolean(record.canSendText) === true) return true;
  if (readSabiDirectoryBoolean(record.canSendMedia) === true) return true;

  const actor = String(currentUserId || "").trim();
  const owner = String(record.ownerUserId || record.channelOwnerUserId || record.createdBy || "").trim();

  if (actor && owner && actor === owner) return true;

  const adminIds = Array.isArray(record.adminIds)
    ? record.adminIds.map((item) => String(item || "").trim()).filter(Boolean)
    : typeof record.adminIds === "string" && record.adminIds.trim()
      ? (() => {
          try {
            const parsed = JSON.parse(record.adminIds);
            return Array.isArray(parsed) ? parsed.map((item) => String(item || "").trim()).filter(Boolean) : [];
          } catch {
            return [];
          }
        })()
      : [];

  return Boolean(actor && adminIds.includes(actor));
}

function readSabiDirectoryStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((item) => String(item || "").trim()).filter(Boolean);
  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.map((item) => String(item || "").trim()).filter(Boolean) : [];
    } catch {
      return [];
    }
  }

  return [];
}

function readSabiDirectoryRuntimeRecord(item: SabiPublicDirectoryItem): Record<string, unknown> {
  const runtime = (item as Record<string, unknown>).runtime;
  return runtime && typeof runtime === "object" && !Array.isArray(runtime)
    ? runtime as Record<string, unknown>
    : {};
}

function readSabiDirectoryRuntimeUsers(
  item: SabiPublicDirectoryItem,
  key: "memberUserIds" | "subscriberUserIds" | "startedUserIds",
): string[] {
  const runtime = readSabiDirectoryRuntimeRecord(item);
  return readSabiDirectoryStringArray(runtime[key]).length
    ? readSabiDirectoryStringArray(runtime[key])
    : readSabiDirectoryStringArray((item as Record<string, unknown>)[key]);
}

function readSabiDirectoryRuntimeText(
  item: SabiPublicDirectoryItem,
  key: "membershipStatus" | "inviteLink" | "shareText",
): string | undefined {
  const runtime = readSabiDirectoryRuntimeRecord(item);
  const runtimeValue = String(runtime[key] || "").trim();
  if (runtimeValue) return runtimeValue;
  const itemValue = String((item as Record<string, unknown>)[key] || "").trim();
  return itemValue || undefined;
}

function readSabiDirectoryRuntimeBoolean(
  item: SabiPublicDirectoryItem,
  key: "canSendMessages" | "canInvite" | "inviteAvailable",
): boolean | null {
  const runtime = readSabiDirectoryRuntimeRecord(item);
  const runtimeValue = readSabiDirectoryBoolean(runtime[key]);
  if (runtimeValue !== null) return runtimeValue;
  return readSabiDirectoryBoolean((item as Record<string, unknown>)[key]);
}

function buildRoomPayload(item: SabiPublicDirectoryItem, currentUserId?: string | null) {
  const id = readItemId(item);
  const name = readItemName(item);
  const kind = readItemKind(item);
  const roomType = kind === "GROUP" ? "group" : kind === "CHANNEL" ? "channel" : "bot";
  const runtimeCanSend = readSabiDirectoryRuntimeBoolean(item, "canSendMessages");
  const channelCanPost = kind === "CHANNEL" && (runtimeCanSend === true || canSabiDirectoryChannelPost(item, currentUserId));
  const runtimeMemberIds = readSabiDirectoryRuntimeUsers(item, "memberUserIds");
  const runtimeSubscriberIds = readSabiDirectoryRuntimeUsers(item, "subscriberUserIds");
  const runtimeStartedIds = readSabiDirectoryRuntimeUsers(item, "startedUserIds");
  const runtimeInviteLink = readSabiDirectoryRuntimeText(item, "inviteLink");
  const runtimeShareText = readSabiDirectoryRuntimeText(item, "shareText");
  const runtimeMembershipStatus = readSabiDirectoryRuntimeText(item, "membershipStatus");
  const runtimeCanInvite = readSabiDirectoryRuntimeBoolean(item, "canInvite");
  const runtimeInviteAvailable = readSabiDirectoryRuntimeBoolean(item, "inviteAvailable");
  const channelRole =
    kind === "CHANNEL"
      ? channelCanPost
        ? "owner"
        : normalizeSabiDirectoryChannelRole((item as Record<string, unknown>).channelRole || (item as Record<string, unknown>).channelAccess) || "subscriber"
      : undefined;
  const avatarUrl = readAvatarUrl(item);
  const username = readUsername(item);
  const description =
    typeof item.description === "string" && item.description.trim()
      ? item.description.trim()
      : kind === "GROUP"
        ? "Group"
        : kind === "CHANNEL"
          ? "Channel"
          : "Bot";

  return {
    chatId: id,
    roomId: id,
    id,
    name,
    title: name,
    subtitle: description,
    roomType,
    type: roomType,
    verified: false,
    avatarLetter: name.charAt(0).toUpperCase() || "S",
    avatarUrl,
    photoUrl: avatarUrl,
    username,
    handle: username,
    currentUserId: currentUserId || undefined,
    peerUserId: kind === "BOT" ? id : undefined,
    isPublic: item.isPublic === false ? "0" : "1",
    searchableInDirectory: item.searchableInDirectory === false ? "0" : "1",
    adminControlled: item.adminControlled ? "1" : undefined,
    adminVisibilitySource: item.adminVisibilitySource || undefined,
    approvalStatus: item.approvalStatus || undefined,
    listingStatus: item.listingStatus || undefined,
    visibilityStatus: item.visibilityStatus || item.visibility || undefined,
    hidden: item.hidden || item.isHidden ? "1" : undefined,
    isHidden: item.hidden || item.isHidden ? "1" : undefined,
    isBot: kind === "BOT" ? "1" : undefined,
    botId: kind === "BOT" ? id : undefined,
    botHandle: kind === "BOT" ? username : undefined,
    ownerUserId: item.ownerUserId || item.createdBy || undefined,
    memberIds:
      kind === "GROUP"
        ? JSON.stringify(Array.from(new Set([...(runtimeMemberIds.length ? runtimeMemberIds : []), currentUserId, item.ownerUserId, item.createdBy].filter(Boolean))))
        : undefined,
    subscriberIds:
      kind === "CHANNEL"
        ? JSON.stringify(Array.from(new Set([...(runtimeSubscriberIds.length ? runtimeSubscriberIds : []), currentUserId, item.ownerUserId, item.createdBy].filter(Boolean))))
        : undefined,
    startedUserIds:
      kind === "BOT"
        ? JSON.stringify(Array.from(new Set([...(runtimeStartedIds.length ? runtimeStartedIds : []), currentUserId].filter(Boolean))))
        : undefined,
    adminIds:
      kind === "GROUP" || kind === "CHANNEL"
        ? JSON.stringify(Array.from(new Set([item.ownerUserId, item.createdBy].filter(Boolean))))
        : undefined,
    membershipStatus: runtimeMembershipStatus || (kind === "GROUP" ? "member" : kind === "CHANNEL" ? "subscriber" : kind === "BOT" ? "started" : undefined),
    canSendMessages: kind === "GROUP" ? (runtimeCanSend === false ? "0" : "1") : kind === "CHANNEL" ? (channelCanPost ? "1" : "0") : undefined,
    canInvite: kind === "GROUP" || kind === "CHANNEL" ? (runtimeCanInvite === false ? "0" : "1") : undefined,
    inviteAvailable: kind === "GROUP" || kind === "CHANNEL" ? (runtimeInviteAvailable === false ? "0" : "1") : undefined,
    canSendText: kind === "CHANNEL" ? (channelCanPost ? "1" : "0") : undefined,
    canSendMedia: kind === "CHANNEL" ? (channelCanPost ? "1" : "0") : undefined,
    channelRole,
    isChannelOwner: kind === "CHANNEL" && channelCanPost ? "1" : undefined,
    isChannelAdmin: kind === "CHANNEL" && channelCanPost ? "1" : undefined,
    groupAccess: kind === "GROUP" ? "member" : undefined,
    channelAccess: kind === "CHANNEL" ? "subscriber" : undefined,
    publicPhotos: stringifySabiDirectoryPayload(pickSabiDirectoryRichMedia((item as any).publicPhotos, (item as any).publicationPhotos)),
    publicVideos: stringifySabiDirectoryPayload(pickSabiDirectoryRichMedia((item as any).publicVideos, (item as any).publicationVideos)),
    publicationPhotos: stringifySabiDirectoryPayload(pickSabiDirectoryRichMedia((item as any).publicationPhotos, (item as any).publicPhotos)),
    publicationVideos: stringifySabiDirectoryPayload(pickSabiDirectoryRichMedia((item as any).publicationVideos, (item as any).publicVideos)),
    likesCount: readSabiDirectoryCount((item as any).likesCount),
    publicGiftsCount: readSabiDirectoryCount((item as any).publicGiftsCount),
    inviteLink: runtimeInviteLink || (item as any).inviteLink || undefined,
    shareText: runtimeShareText || (item as any).shareText || undefined,
    channelInviteLink: runtimeInviteLink || (item as any).channelInviteLink || (item as any).inviteLink || undefined,
    channelBotId: (item as any).channelBotId || (item as any).linkedBotId || (item as any).connectedBotId || undefined,
    channelBotHandle: (item as any).channelBotHandle || (item as any).linkedBotHandle || (item as any).connectedBotHandle || undefined,
    linkedBotId: (item as any).linkedBotId || (item as any).channelBotId || (item as any).connectedBotId || undefined,
    linkedBotHandle: (item as any).linkedBotHandle || (item as any).channelBotHandle || (item as any).connectedBotHandle || undefined,
    hiddenFromMain: false,
    deleted: false,
    forceVisibleInMain: true,
    updatedAt: item.updatedAt || new Date().toISOString(),
  };
}


async function persistSabiDirectoryRoomPayload(payload: Record<string, unknown>) {
  try {
    const chatId = String(payload.chatId || payload.roomId || payload.id || "").trim();
    const name = String(payload.name || payload.title || chatId).trim();

    if (!chatId || !name) return;

    await registerPersistedChatRoom({
      ...payload,
      chatId,
      roomId: chatId,
      id: chatId,
      name,
      title: name,
      hiddenFromMain: false,
      deleted: false,
      forceVisibleInMain: true,
    } as any);
  } catch {}
}

export async function openSabiPublicDirectoryItem(
  item: SabiPublicDirectoryItem,
  currentUserId?: string | null,
): Promise<OpenResult> {
  const id = readItemId(item);
  const kind = readItemKind(item);

  if (!id) {
    return {
      ok: false,
      kind,
      id,
      error: "directory_item_id_required",
      code: "directory_item_id_required",
      status: 0,
      blocked: false,
      shouldRefreshList: false,
    };
  }

  if (!canShowSabiPublicDirectoryItem(item)) {
    return buildSabiDirectoryBlockedOpenResult(kind, id, "directory_item_not_allowed");
  }

  if (kind === "GROUP") {
    const result = await joinSabiPublicGroup(id);

    if (!result.ok) {
      return buildSabiDirectoryActionOpenError(kind, id, result, "group_join_failed");
    }

    const confirmedItem = await hydrateSabiDirectoryRuntimeForOpen(
      mergeSabiDirectoryConfirmedItem(item, result.data, kind),
      kind,
      id,
    );

    if (!canShowSabiPublicDirectoryItem(confirmedItem)) {
      return buildSabiDirectoryBlockedOpenResult(kind, id);
    }

    const roomPayload = buildRoomPayload(confirmedItem, currentUserId) as any;

    await persistSabiGroupPublicProfileFromDirectory(confirmedItem, currentUserId);
    await persistSabiDirectoryRoomPayload(roomPayload);
    await openMessengerRoom(roomPayload);
    forgetSabiPublicDirectoryBlockedItem(kind, id);

    return {
      ok: true,
      kind,
      id,
      error: null,
      code: null,
      status: 200,
      blocked: false,
      shouldRefreshList: true,
    };
  }

  if (kind === "CHANNEL") {
    const result = await subscribeSabiPublicChannel(id);

    if (!result.ok) {
      return buildSabiDirectoryActionOpenError(kind, id, result, "channel_subscribe_failed");
    }

    const confirmedItem = await hydrateSabiDirectoryRuntimeForOpen(
      mergeSabiDirectoryConfirmedItem(item, result.data, kind),
      kind,
      id,
    );

    if (!canShowSabiPublicDirectoryItem(confirmedItem)) {
      return buildSabiDirectoryBlockedOpenResult(kind, id);
    }

    const roomPayload = buildRoomPayload(confirmedItem, currentUserId) as any;

    await persistSabiDirectoryRoomPayload(roomPayload);
    await openMessengerRoom(roomPayload);
    forgetSabiPublicDirectoryBlockedItem(kind, id);

    return {
      ok: true,
      kind,
      id,
      error: null,
      code: null,
      status: 200,
      blocked: false,
      shouldRefreshList: true,
    };
  }

  const result = await startSabiPublicBot(id);

  if (!result.ok) {
    return buildSabiDirectoryActionOpenError(kind, id, result, "bot_start_failed");
  }

  const confirmedItem = await hydrateSabiDirectoryRuntimeForOpen(
    mergeSabiDirectoryConfirmedItem(item, result.data, kind),
    kind,
    id,
  );

  if (!canShowSabiPublicDirectoryItem(confirmedItem)) {
    return buildSabiDirectoryBlockedOpenResult(kind, id);
  }

  const roomPayload = buildRoomPayload(confirmedItem, currentUserId) as any;

  await persistSabiDirectoryRoomPayload(roomPayload);
  await openMessengerRoom(roomPayload);
  forgetSabiPublicDirectoryBlockedItem(kind, id);

  return {
    ok: true,
    kind,
    id,
    error: null,
    code: null,
    status: 200,
    blocked: false,
    shouldRefreshList: true,
  };
}
