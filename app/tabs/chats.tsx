import React, { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import {
  Alert,
  Animated,
  Easing,
  Image,
  ImageBackground,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "@react-navigation/native";
import { router, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  BadgeCheck,
  BellOff,
  BookCheck,
  BookMarked,
  Bot,
  Feather,
  Lock,
  Palette,
  PanelRightClose,
  PanelRightOpen,
  Pin,
  Search,
  Settings2,
  Trash2,
  Volume2,
  VolumeX,
} from "lucide-react-native";

import { useI18n } from "../../src/shared/i18n";
import { getAuthSessionState } from "../../src/core/kernel/auth/session.store";
import { profileKernelFacade } from "../../src/core/kernel/profile";
import {
  getMessengerKernelRoomMessages,
  messengerKernelFacade,
  type MessengerKernelRoomSnapshot,
} from "../../src/core/kernel/messenger/facade";
import {
  getMessengerThemePalette,
  getMessengerThemeState,
  hydrateMessengerThemeState,
  type MessengerThemePalette,
  type MessengerThemeState,
} from "../../src/modules/messenger/theme/messengerThemeRuntime";
import { hydrateGroupPublicProfile, saveGroupPublicProfile } from "../../src/modules/messenger/groups/groupPublicProfileRuntime";
import {
  hydratePublicProfileStorage,
  resolvePublicProfileAvatarUri,
  subscribePublicProfiles,
} from "../../src/modules/messenger/public/publicProfileRuntime";
import { openMessengerRoom } from "../../src/modules/messenger/navigation/messengerRoomNavigation";
import { listPersistedChatRooms, markPersistedChatRoomRead } from "../../src/modules/messenger/chat-room/services/chatRoomRealtime";
import { openSabiPublicDirectoryItem, searchSabiPublicDirectory, type SabiPublicDirectoryItem } from "../../src/modules/messenger/public-directory";
import { getMessengerKernelState, subscribeMessengerKernelStore } from "../../src/core/kernel/messenger/core/store";
import type { MessengerKernelPresenceEntry } from "../../src/core/kernel/messenger/core/types";

type RoomType = "direct" | "group" | "channel" | "business";
type ChatCategory = "official" | "service" | "direct" | "bot";

type ChatItem = {
  id: string;
  name: string;
  preview: string;
  time: string;
  unread: number;
  unreadCount?: number;
  verified?: boolean;
  official?: boolean;
  username?: string;
  phone?: string;
  avatarLetter?: string;
  avatarUri?: string;
  currentUserId?: string;
  peerUserId?: string;
  roomType: RoomType;
  category: ChatCategory;
  updatedAt?: string;
  muted?: boolean;
  pinned?: boolean;
  hiddenFromMain?: boolean;
  hiddenReactionTailCount?: number;
  online?: boolean;
  presenceStatus?: string | null;
  lastSeenAt?: string | null;
  isBot?: boolean;
  botId?: string;
  botHandle?: string;
  publicDirectoryItem?: SabiPublicDirectoryItem;
  publicationPhotos?: unknown;
  publicationVideos?: unknown;
  publicPhotos?: unknown;
  publicVideos?: unknown;
  likesCount?: string;
  publicGiftsCount?: string;
  inviteLink?: string;
  linkedBotHandle?: string;
  linkedBotId?: string;
  channelBotHandle?: string;
  channelBotId?: string;
  channelInviteLink?: string;
  channelRole?: string;
  channelAccess?: string;
  ownerUserId?: string;
  channelOwnerUserId?: string;
  isChannelOwner?: string;
  isChannelAdmin?: string;
  canSendMessages?: string;
  canSendText?: string;
  canSendMedia?: string;
  onlyAdminsCanPost?: string;
};

type PersistedUiMessage = {
  id?: string;
  text?: string;
  time?: string;
  previewTitle?: string;
  kind?: string;
};


type ChatRoomMetaSnapshot = MessengerKernelRoomSnapshot;
const TEXT_MAIN = "#F8FBFF";
const TEXT_SECONDARY = "rgba(236,244,255,0.76)";
const TEXT_MUTED = "rgba(214,226,244,0.56)";
const GLASS_BORDER = "rgba(255,255,255,0.10)";
const BOT_ID_PREFIX_REGEX = /^(bot:|assistant:|storebot:|deliverybot:|shopbot:)/i;

function normalizePhone(value?: string | null) {
  return String(value ?? "").replace(/\D/g, "");
}

function normalizeString(value?: string | null) {
  const normalized = String(value ?? "").trim();
  return normalized.length > 0 ? normalized : "";
}

function isPhoneLikeMainChatValue(value?: string | null) {
  const raw = String(value ?? "").trim();
  if (!raw) return false;
  const digits = raw.replace(/\D/g, "");
  const onlyPhoneChars = raw.replace(/[+\d\s().-]/g, "") === "";
  return raw.startsWith("+") || (onlyPhoneChars && digits.length >= 7);
}

function getMainChatDedupeKey(item: ChatItem) {
  if (item.isBot) return "bot:" + String(item.peerUserId || item.botId || item.id || "");
  if (item.roomType !== "direct") return "room:" + String(item.id || "");

  const peerUserId = normalizeString(item.peerUserId);
  if (peerUserId && !isPhoneLikeMainChatValue(peerUserId)) return "peer:" + peerUserId;

  const phone = normalizePhone(item.phone);
  if (phone) return "phone:" + phone;

  const username = normalizeString(item.username || item.botHandle).toLowerCase();
  if (username) return "username:" + username;

  return "room:" + String(item.id || "");
}

function mainChatNameScore(item: ChatItem) {
  const name = normalizeString(item.name);
  if (!name) return 0;
  if (isPhoneLikeMainChatValue(name)) return 1;
  return 5;
}

function mainChatQualityScore(item: ChatItem) {
  return (
    mainChatNameScore(item) +
    (item.peerUserId && !isPhoneLikeMainChatValue(item.peerUserId) ? 4 : 0) +
    (item.avatarUri ? 2 : 0) +
    (item.phone ? 1 : 0) +
    (item.username ? 1 : 0) +
    (item.preview ? 1 : 0)
  );
}

function roomSnapshotNameScore(room: ChatRoomMetaSnapshot) {
  const name = normalizeString(room.name);
  if (!name) return 0;
  if (isPhoneLikeMainChatValue(name)) return 1;
  if (name === normalizeString(room.chatId)) return 1;
  return 5;
}

function roomSnapshotQualityScore(room: ChatRoomMetaSnapshot) {
  return (
    roomSnapshotNameScore(room) +
    (room.peerUserId && !isPhoneLikeMainChatValue(room.peerUserId) ? 4 : 0) +
    (room.avatarUrl || room.photoUrl ? 2 : 0) +
    (room.phone ? 1 : 0) +
    (room.username ? 1 : 0) +
    (room.subtitle ? 1 : 0)
  );
}

function mergeRoomSnapshot(left: ChatRoomMetaSnapshot, right: ChatRoomMetaSnapshot): ChatRoomMetaSnapshot {
  const primary = roomSnapshotQualityScore(right) >= roomSnapshotQualityScore(left) ? right : left;
  const secondary = primary === right ? left : right;
  const leftUpdatedAt = normalizeString(left.updatedAt);
  const rightUpdatedAt = normalizeString(right.updatedAt);
  const updatedAt =
    rightUpdatedAt && (!leftUpdatedAt || rightUpdatedAt.localeCompare(leftUpdatedAt) >= 0)
      ? rightUpdatedAt
      : leftUpdatedAt || rightUpdatedAt || new Date().toISOString();
  const unread = Math.max(Number(left.unread ?? 0) || 0, Number(right.unread ?? 0) || 0);
  const unreadCount = Math.max(Number(left.unreadCount ?? 0) || 0, Number(right.unreadCount ?? 0) || 0);

  return {
    ...secondary,
    ...primary,
    chatId: primary.chatId || secondary.chatId,
    name:
      roomSnapshotNameScore(primary) >= roomSnapshotNameScore(secondary)
        ? primary.name
        : secondary.name,
    subtitle: primary.subtitle || secondary.subtitle || null,
    roomType: primary.roomType || secondary.roomType || "direct",
    phone: primary.phone || secondary.phone || null,
    username: primary.username || secondary.username || null,
    currentUserId: primary.currentUserId || secondary.currentUserId || null,
    peerUserId: primary.peerUserId || secondary.peerUserId || null,
    avatarUrl: primary.avatarUrl || secondary.avatarUrl || null,
    photoUrl: primary.photoUrl || secondary.photoUrl || primary.avatarUrl || secondary.avatarUrl || null,
    updatedAt,
    unread,
    unreadCount,
  };
}

function mergeChatRoomSnapshots(rooms: ChatRoomMetaSnapshot[]) {
  const byChatId = new Map<string, ChatRoomMetaSnapshot>();

  rooms.forEach((room) => {
    const chatId = normalizeString(room.chatId);
    if (!chatId) return;

    const normalizedRoom: ChatRoomMetaSnapshot = {
      ...room,
      chatId,
      name: normalizeString(room.name) || chatId,
      updatedAt: normalizeString(room.updatedAt) || new Date().toISOString(),
    };
    const current = byChatId.get(chatId);
    byChatId.set(chatId, current ? mergeRoomSnapshot(current, normalizedRoom) : normalizedRoom);
  });

  return Array.from(byChatId.values()).sort((a, b) =>
    String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")),
  );
}

function mergeMainChatDuplicate(left: ChatItem, right: ChatItem): ChatItem {
  const primary = mainChatQualityScore(right) > mainChatQualityScore(left) ? right : left;
  const secondary = primary === right ? left : right;

  return {
    ...secondary,
    ...primary,
    id: primary.id || secondary.id,
    name:
      mainChatNameScore(primary) >= mainChatNameScore(secondary)
        ? primary.name
        : secondary.name,
    preview: primary.preview || secondary.preview,
    time: primary.time || secondary.time,
    unread: Math.max(primary.unread || 0, secondary.unread || 0),
    muted: Boolean(primary.muted || secondary.muted),
    pinned: Boolean(primary.pinned || secondary.pinned),
    hiddenFromMain: Boolean(primary.hiddenFromMain || secondary.hiddenFromMain),
    phone: primary.phone || secondary.phone,
    username: primary.username || secondary.username,
    peerUserId: primary.peerUserId || secondary.peerUserId,
    currentUserId: primary.currentUserId || secondary.currentUserId,
    avatarUri: primary.avatarUri || secondary.avatarUri,
    avatarLetter: primary.avatarLetter || secondary.avatarLetter,
    // SABI_CHATLAR_MERGE_PUBLIC_PROFILE_MEDIA
    publicDirectoryItem: primary.publicDirectoryItem || secondary.publicDirectoryItem,
    publicationPhotos: pickSabiPublicDirectoryPayload(primary.publicationPhotos, secondary.publicationPhotos),
    publicationVideos: pickSabiPublicDirectoryPayload(primary.publicationVideos, secondary.publicationVideos),
    publicPhotos: pickSabiPublicDirectoryPayload(primary.publicPhotos, secondary.publicPhotos),
    publicVideos: pickSabiPublicDirectoryPayload(primary.publicVideos, secondary.publicVideos),
    likesCount: primary.likesCount || secondary.likesCount,
    publicGiftsCount: primary.publicGiftsCount || secondary.publicGiftsCount,
    inviteLink: primary.inviteLink || secondary.inviteLink,
    channelInviteLink: primary.channelInviteLink || secondary.channelInviteLink,
    channelBotId: primary.channelBotId || secondary.channelBotId,
    channelBotHandle: primary.channelBotHandle || secondary.channelBotHandle,
    linkedBotId: primary.linkedBotId || secondary.linkedBotId,
    linkedBotHandle: primary.linkedBotHandle || secondary.linkedBotHandle,
  };
}

function getMainChatRenderKey(item: ChatItem, index: number) {
  const safeDedupeKey = getMainChatDedupeKey(item).replace(/\s+/g, "-");
  const safeId = String(item.id || "").trim() || "chat";
  return [safeDedupeKey, safeId, String(index)].join(":");
}

function dedupeMainChatItems(items: ChatItem[]) {
  const map = new Map<string, ChatItem>();

  for (const item of items) {
    const key = getMainChatDedupeKey(item);
    const existing = map.get(key);
    map.set(key, existing ? mergeMainChatDuplicate(existing, item) : item);
  }

  return Array.from(map.values());
}

function formatTime(value?: string | null, language?: string) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return "";

  try {
    return new Intl.DateTimeFormat(language || undefined, {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return `${String(date.getHours()).padStart(2, "0")}:${String(
      date.getMinutes(),
    ).padStart(2, "0")}`;
  }
}

function getAvatarLetter(name?: string | null, phone?: string | null) {
  const source = String(name ?? "").trim();
  const fromName = source.replace(/^[^\p{L}\p{N}]+/u, "").charAt(0);
  if (fromName) return fromName.toUpperCase();

  const digits = normalizePhone(phone);
  if (digits) return digits.charAt(0);
  return "•";
}


// SABI_CHATLAR_PROFILE_GROUP_SEARCH_FIX
function sabiReadProfileGroupText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function sabiReadProfileGroupNumber(value: unknown) {
  const next = Number(value);
  return Number.isFinite(next) ? Math.max(0, Math.floor(next)) : 0;
}

function parseSabiProfileGroupMediaRows(value: unknown): unknown[] {
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

function normalizeSabiProfileGroupMediaPayload(value: unknown, kind: "photo" | "video") {
  return parseSabiProfileGroupMediaRows(value)
    .map((raw, index) => {
      const record: Record<string, unknown> = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : { uri: raw };
      const mediaUri = String(record.mediaUri || record.uri || record.url || record.fileUrl || "").trim();
      const thumbnailUri = String(record.thumbnailUri || record.previewUri || record.coverUri || "").trim();
      const uri = kind === "video"
        ? thumbnailUri || mediaUri || String(record.uri || "").trim()
        : String(record.uri || "").trim() || mediaUri || thumbnailUri;
      const openUri = mediaUri || uri || thumbnailUri;

      if (!uri && !openUri) return null;

      return {
        ...record,
        id: String(record.id || `${kind}-${index}`),
        uri: uri || openUri,
        mediaUri: openUri || uri,
        thumbnailUri: thumbnailUri || undefined,
        mimeType: typeof record.mimeType === "string" ? record.mimeType : undefined,
        durationMs: typeof record.durationMs === "number" ? record.durationMs : undefined,
        kind,
        mediaKind: kind,
        type: kind,
        liked: typeof record.liked === "boolean" ? record.liked : undefined,
      };
    })
    .filter(Boolean);
}

function readSabiProfileGroupPublicMedia(group: Record<string, unknown>, kind: "photo" | "video") {
  const primary = kind === "photo"
    ? pickSabiPublicDirectoryPayload(group.publicationPhotos, group.publicPhotos)
    : pickSabiPublicDirectoryPayload(group.publicationVideos, group.publicVideos);
  return normalizeSabiProfileGroupMediaPayload(primary, kind);
}

function stringifySabiProfileGroupPublicMedia(group: Record<string, unknown>, kind: "photo" | "video") {
  const rows = readSabiProfileGroupPublicMedia(group, kind);
  return rows.length ? JSON.stringify(rows) : undefined;
}

function rememberSabiProfileGroupPublicSurface(chatId: string, group: Record<string, unknown>) {
  if (!chatId) return;

  const publicationPhotos = readSabiProfileGroupPublicMedia(group, "photo");
  const publicationVideos = readSabiProfileGroupPublicMedia(group, "video");
  const avatarUri = sabiReadProfileGroupText(group.avatarUri) || sabiReadProfileGroupText(group.avatarUrl);
  const coverUri = sabiReadProfileGroupText(group.coverUri) || sabiReadProfileGroupText(group.coverUrl);

  if (!avatarUri && !coverUri && !publicationPhotos.length && !publicationVideos.length) return;

  const username = sabiReadProfileGroupText(group.username).replace(/^@+/, "");
  const aliases = Array.from(
    new Set(
      [
        chatId,
        group.groupId,
        group.id,
        group.linkedChatId,
        username,
        username ? `@${username}` : "",
        group.groupName,
        group.name,
      ]
        .map((value) => String(value || "").trim())
        .filter(Boolean),
    ),
  );

  try {
    saveGroupPublicProfile(
      chatId,
      {
        chatId,
        avatarUri,
        coverUri,
        publicationPhotos: publicationPhotos as any,
        publicationVideos: publicationVideos as any,
        likesCount: sabiReadProfileGroupNumber(group.likesCount),
        publicGiftsCount: sabiReadProfileGroupNumber(group.publicGiftsCount),
        aliases,
      } as any,
      aliases,
    );
  } catch {}
}

function sabiBuildProfileGroupChatId(group: Record<string, unknown>) {
  const linkedChatId = sabiReadProfileGroupText(group.linkedChatId);
  if (linkedChatId) return linkedChatId;

  const groupId = sabiReadProfileGroupText(group.groupId) || sabiReadProfileGroupText(group.id);
  if (groupId) return `group:${groupId}`;

  const username = sabiReadProfileGroupText(group.username);
  if (username) return `group:${username.replace(/^@+/, "")}`;

  const name = sabiReadProfileGroupText(group.groupName) || sabiReadProfileGroupText(group.name);
  const slug = name
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");

  return slug ? `group:${slug}` : "";
}

async function sabiLoadProfileGroupsForChatlar(currentUserId?: string): Promise<ChatRoomMetaSnapshot[]> {
  try {
    await profileKernelFacade.boot();
    const collection = profileKernelFacade.selectors.groupProfiles();
    const items = Array.isArray((collection as any)?.items) ? (collection as any).items : [];

    const rooms: ChatRoomMetaSnapshot[] = [];

    for (const raw of items) {
      if (!raw || typeof raw !== "object") continue;

      const group = raw as Record<string, unknown>;
      if (group.created !== true) continue;

      const name = sabiReadProfileGroupText(group.groupName) || sabiReadProfileGroupText(group.name);
      if (!name) continue;

      const chatId = sabiBuildProfileGroupChatId(group);
      if (!chatId) continue;

      const ownerUserId =
        sabiReadProfileGroupText(group.ownerUserId) ||
        sabiReadProfileGroupText(currentUserId);

      const memberIds = Array.isArray(group.members)
        ? group.members
            .map((item) => {
              const record = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
              return sabiReadProfileGroupText(record.userId) || sabiReadProfileGroupText(record.id);
            })
            .filter(Boolean)
        : [];

      const adminIds = Array.isArray(group.admins)
        ? group.admins
            .map((item) => {
              const record = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
              return sabiReadProfileGroupText(record.userId) || sabiReadProfileGroupText(record.id);
            })
            .filter(Boolean)
        : [];

      const publicationPhotos = stringifySabiProfileGroupPublicMedia(group, "photo");
      const publicationVideos = stringifySabiProfileGroupPublicMedia(group, "video");
      rememberSabiProfileGroupPublicSurface(chatId, group);

      rooms.push({
        chatId,
        roomId: chatId,
        id: chatId,
        name,
        title: name,
        subtitle: sabiReadProfileGroupText(group.description) || "Group",
        roomType: "group",
        type: "group",
        verified: Boolean(group.isPublished || group.verified),
        avatarLetter: getAvatarLetter(name),
        avatarUrl: sabiReadProfileGroupText(group.avatarUri) || undefined,
        photoUrl: sabiReadProfileGroupText(group.avatarUri) || undefined,
        coverUrl: sabiReadProfileGroupText(group.coverUri) || undefined,
        currentUserId: currentUserId || ownerUserId || undefined,
        ownerUserId: ownerUserId || undefined,
        username: sabiReadProfileGroupText(group.username) || undefined,
        searchableInDirectory: true,
        localProfileGroupOwner: true,
        memberIds: JSON.stringify(Array.from(new Set([currentUserId, ownerUserId, ...memberIds].filter(Boolean)))),
        adminIds: JSON.stringify(Array.from(new Set([currentUserId, ownerUserId, ...adminIds].filter(Boolean)))),
        membershipStatus: "member",
        canSendMessages: "1",
        groupAccess: "member",
        publicPhotos: publicationPhotos,
        publicVideos: publicationVideos,
        publicationPhotos,
        publicationVideos,
        likesCount: String(sabiReadProfileGroupNumber(group.likesCount)),
        publicGiftsCount: String(sabiReadProfileGroupNumber(group.publicGiftsCount)),
        inviteLink: sabiReadProfileGroupText(group.inviteLink) || undefined,
        updatedAt: new Date().toISOString(),
      } as any);
    }

    return rooms;
  } catch {
    return [];
  }
}


// SABI_CHATLAR_GROUP_SEARCH_EXACT
function sabiChatlarGroupText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function sabiChatlarGroupId(group: Record<string, unknown>) {
  const linked = sabiChatlarGroupText(group.linkedChatId);
  if (linked) return linked;

  const id = sabiChatlarGroupText(group.groupId) || sabiChatlarGroupText(group.id);
  if (id) return `group:${id}`;

  const username = sabiChatlarGroupText(group.username).replace(/^@+/, "");
  if (username) return `group:${username}`;

  const name = sabiChatlarGroupText(group.groupName) || sabiChatlarGroupText(group.name);
  const slug = name.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-+|-+$/g, "");
  return slug ? `group:${slug}` : "";
}

async function sabiChatlarProfileGroupRooms(currentUserId?: string): Promise<ChatRoomMetaSnapshot[]> {
  try {
    await profileKernelFacade.boot();
    const collection = profileKernelFacade.selectors.groupProfiles();
    const items = Array.isArray((collection as any)?.items) ? (collection as any).items : [];
    const rooms: ChatRoomMetaSnapshot[] = [];

    for (const raw of items) {
      if (!raw || typeof raw !== "object") continue;
      const group = raw as Record<string, unknown>;
      if (group.created !== true) continue;

      const name = sabiChatlarGroupText(group.groupName) || sabiChatlarGroupText(group.name);
      const chatId = sabiChatlarGroupId(group);
      if (!name || !chatId) continue;

      const ownerUserId = sabiChatlarGroupText(group.ownerUserId) || currentUserId || "";
      const publicationPhotos = stringifySabiProfileGroupPublicMedia(group, "photo");
      const publicationVideos = stringifySabiProfileGroupPublicMedia(group, "video");
      rememberSabiProfileGroupPublicSurface(chatId, group);

      rooms.push({
        chatId,
        roomId: chatId,
        id: chatId,
        name,
        title: name,
        subtitle: sabiChatlarGroupText(group.description) || "Group",
        roomType: "group",
        type: "group",
        verified: Boolean(group.isPublished || group.verified),
        avatarLetter: getAvatarLetter(name),
        avatarUrl: sabiChatlarGroupText(group.avatarUri) || undefined,
        photoUrl: sabiChatlarGroupText(group.avatarUri) || undefined,
        coverUrl: sabiChatlarGroupText(group.coverUri) || undefined,
        currentUserId: currentUserId || ownerUserId || undefined,
        ownerUserId: ownerUserId || undefined,
        username: sabiChatlarGroupText(group.username) || undefined,
        searchableInDirectory: true,
        localProfileGroupOwner: true,
        memberIds: JSON.stringify(Array.from(new Set([currentUserId, ownerUserId].filter(Boolean)))),
        adminIds: JSON.stringify(Array.from(new Set([currentUserId, ownerUserId].filter(Boolean)))),
        membershipStatus: "member",
        canSendMessages: "1",
        groupAccess: "member",
        publicPhotos: publicationPhotos,
        publicVideos: publicationVideos,
        publicationPhotos,
        publicationVideos,
        likesCount: String(sabiReadProfileGroupNumber(group.likesCount)),
        publicGiftsCount: String(sabiReadProfileGroupNumber(group.publicGiftsCount)),
        inviteLink: sabiReadProfileGroupText(group.inviteLink) || undefined,
        updatedAt: new Date().toISOString(),
      } as any);
    }

    return rooms;
  } catch {
    return [];
  }
}

function normalizeHandle(value?: string | null) {
  const raw = String(value ?? "").trim().replace(/\s+/g, "");
  if (!raw) return "";
  return raw.startsWith("@") ? raw : `@${raw.replace(/^@+/, "")}`;
}

function getAvatarUriFromUnknownProfile(value: unknown) {
  if (!value || typeof value !== "object") return "";
  const record = value as Record<string, unknown>;
  const candidates = [
    record.avatarUri,
    record.avatarUrl,
    record.photoUrl,
    record.imageUri,
  ];

  for (const item of candidates) {
    if (typeof item === "string" && item.trim()) return item.trim();
  }

  return "";
}

const SABI_REACTION_CONTROL_PREFIX = "__SABI_REACTION_V1__:";

function isSabiReactionControlText(value?: string | null) {
  return String(value ?? "").trim().startsWith(SABI_REACTION_CONTROL_PREFIX);
}

function isSabiReactionPreviewMessage(message?: PersistedUiMessage | null) {
  if (!message) return false;
  return isSabiReactionControlText(message.text) || isSabiReactionControlText(message.previewTitle);
}

function countHiddenReactionTail(messages: PersistedUiMessage[]) {
  let count = 0;
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    if (!isSabiReactionPreviewMessage(messages[index])) break;
    count += 1;
  }
  return count;
}

function getLastVisiblePreviewMessage(messages: PersistedUiMessage[]) {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const item = messages[index];
    if (!isSabiReactionPreviewMessage(item)) return item;
  }
  return undefined;
}

function sanitizeMessagePreviewText(value?: string | null) {
  const normalized = String(value ?? "").trim();
  if (!normalized || isSabiReactionControlText(normalized)) return "";
  return normalized;
}

function getPresenceLookupId(item: { peerUserId?: string; id?: string; roomType?: string }) {
  const peerUserId = String(item.peerUserId ?? "").trim();
  if (peerUserId) return peerUserId;
  if (item.roomType === "direct") return String(item.id ?? "").trim();
  return "";
}

function getMessengerPresenceMapSnapshot() {
  return getMessengerKernelState().presenceByUserId;
}

function useMessengerPresenceMapSnapshot() {
  return useSyncExternalStore(
    subscribeMessengerKernelStore,
    getMessengerPresenceMapSnapshot,
    getMessengerPresenceMapSnapshot,
  );
}

function readMessengerPeerPresence(
  item: { peerUserId?: string; id?: string; roomType?: string },
  presenceByUserId?: Record<string, MessengerKernelPresenceEntry>,
) {
  const presenceId = getPresenceLookupId(item);
  return presenceId ? presenceByUserId?.[presenceId] ?? null : null;
}

function isMessengerPresenceOnline(entry?: MessengerKernelPresenceEntry | null) {
  if (!entry) return false;
  if (entry.status === "online") return true;
  if (entry.status === "offline") return false;
  return entry.isOnline === true;
}

function readMessengerPresenceLastSeen(entry?: MessengerKernelPresenceEntry | null) {
  const lastSeenAt = String(entry?.lastSeenAt ?? "").trim();
  if (lastSeenAt) return lastSeenAt;
  if (entry?.status === "offline") {
    const updatedAt = String(entry?.updatedAt ?? "").trim();
    if (updatedAt) return updatedAt;
  }
  return "";
}

function isMessengerPeerOnline(
  item: { peerUserId?: string; id?: string; roomType?: string; online?: boolean },
  presenceByUserId?: Record<string, MessengerKernelPresenceEntry>,
) {
  const entry = readMessengerPeerPresence(item, presenceByUserId);
  if (entry) return isMessengerPresenceOnline(entry);
  if (item.online) return true;
  const presenceId = getPresenceLookupId(item);
  return presenceId ? messengerKernelFacade.selectors.isUserOnline(presenceId) : false;
}

function getMessagePreview(
  message: PersistedUiMessage | undefined,
  fallback: string,
  labels: Record<string, string>,
) {
  if (!message) return fallback;
  const text = sanitizeMessagePreviewText(message.text);
  if (text) return text;
  const title = sanitizeMessagePreviewText(message.previewTitle);
  if (title) return title;
  return labels[message.kind || ""] || fallback;
}

function resolveBotRoomMeta(
  room: Pick<ChatRoomMetaSnapshot, "chatId" | "name" | "subtitle" | "roomType">,
) {
  const chatId = String(room.chatId ?? "").trim();
  const name = String(room.name ?? "").trim();
  const subtitle = String(room.subtitle ?? "").trim();

  const lowerChatId = chatId.toLowerCase();
  const lowerName = name.toLowerCase();
  const lowerSubtitle = subtitle.toLowerCase();

  const isBot =
    BOT_ID_PREFIX_REGEX.test(chatId) ||
    lowerSubtitle.startsWith("@bot") ||
    lowerSubtitle.startsWith("bot:") ||
    lowerSubtitle.startsWith("assistant:") ||
    lowerName.includes("[bot]") ||
    lowerName.endsWith(" bot");

  if (!isBot) {
    return {
      isBot: false,
      botId: undefined,
      botHandle: undefined,
    };
  }

  const cleanBotId = chatId.replace(BOT_ID_PREFIX_REGEX, "").trim() || chatId;
  const handleSource =
    subtitle.startsWith("@") ? subtitle : subtitle || cleanBotId || name;

  return {
    isBot: true,
    botId: cleanBotId,
    botHandle: normalizeHandle(handleSource || cleanBotId || name),
  };
}

function readRealtimePayloadRecord(payload: unknown): Record<string, unknown> {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return {};
  const source = payload as Record<string, unknown>;
  const nested =
    source.message && typeof source.message === "object" && !Array.isArray(source.message)
      ? (source.message as Record<string, unknown>)
      : source.payload && typeof source.payload === "object" && !Array.isArray(source.payload)
        ? (source.payload as Record<string, unknown>)
        : source.data && typeof source.data === "object" && !Array.isArray(source.data)
          ? (source.data as Record<string, unknown>)
          : null;

  return nested ? { ...source, ...nested } : source;
}

function pickRealtimeChatId(payload: unknown) {
  const record = readRealtimePayloadRecord(payload);
  return (
    normalizeString(record.chatId as string | null | undefined) ||
    normalizeString(record.roomId as string | null | undefined) ||
    normalizeString(record.conversationId as string | null | undefined) ||
    ""
  );
}

function pickRealtimeMessageId(payload: unknown) {
  const record = readRealtimePayloadRecord(payload);
  return (
    normalizeString(record.messageId as string | null | undefined) ||
    normalizeString(record.id as string | null | undefined) ||
    normalizeString(record.clientId as string | null | undefined) ||
    ""
  );
}

function pickRealtimeUserId(payload: unknown) {
  const record = readRealtimePayloadRecord(payload);
  return (
    normalizeString(record.userId as string | null | undefined) ||
    normalizeString(record.senderId as string | null | undefined) ||
    normalizeString(record.authorId as string | null | undefined) ||
    normalizeString(record.fromUserId as string | null | undefined) ||
    ""
  );
}

function pickRealtimeAt(payload: unknown) {
  const record = readRealtimePayloadRecord(payload);
  return (
    normalizeString(record.at as string | null | undefined) ||
    normalizeString(record.createdAt as string | null | undefined) ||
    normalizeString(record.sentAt as string | null | undefined) ||
    normalizeString(record.updatedAt as string | null | undefined) ||
    ""
  );
}

function isRealtimeReadEventName(eventName: string) {
  const lower = eventName.toLowerCase();
  return lower.includes("read") || lower.includes("seen");
}

function isRealtimeDeliveredEventName(eventName: string) {
  const lower = eventName.toLowerCase();
  return lower.includes("delivered") || lower.includes("received");
}

function isRealtimeMessageCreateEventName(eventName: string) {
  const lower = eventName.toLowerCase();
  if (isRealtimeReadEventName(lower) || isRealtimeDeliveredEventName(lower)) return false;
  if (lower.includes("deleted") || lower.includes("remove")) return false;
  return (
    lower === "message:new" ||
    lower === "new_message" ||
    lower === "channel:post" ||
    lower === "chat:message" ||
    lower === "chat:message:new" ||
    lower.includes("message:created") ||
    lower.includes("message.created")
  );
}


// SABI_TABS_CHATS_UNREAD_REAL_COUNTER
function readSabiTabsUnreadNumber(value: unknown): number {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : 0;
}

function readSabiTabsUnreadText(value: unknown): string {
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function getSabiTabsRoomRawUnread(room: Record<string, unknown>): number {
  return Math.max(
    readSabiTabsUnreadNumber(room.unreadCount),
    readSabiTabsUnreadNumber(room.unread),
  );
}

function getSabiTabsMessageTimeMs(message: Record<string, unknown>): number {
  const raw =
    readSabiTabsUnreadText(message.createdAt) ||
    readSabiTabsUnreadText(message.sentAt) ||
    readSabiTabsUnreadText(message.occurredAt) ||
    readSabiTabsUnreadText(message.at) ||
    readSabiTabsUnreadText(message.updatedAt);

  const parsed = Date.parse(raw);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getSabiTabsMessageSenderId(message: Record<string, unknown>): string {
  return (
    readSabiTabsUnreadText(message.userId) ||
    readSabiTabsUnreadText(message.senderId) ||
    readSabiTabsUnreadText(message.authorId) ||
    readSabiTabsUnreadText(message.fromUserId)
  );
}

function isSabiTabsMessageFromCurrentUser(message: Record<string, unknown>, room: Record<string, unknown>) {
  const sender = getSabiTabsMessageSenderId(message);
  const currentUserId =
    readSabiTabsUnreadText(room.currentUserId) ||
    readSabiTabsUnreadText((message as Record<string, unknown>).currentUserId);

  return Boolean(sender && currentUserId && sender === currentUserId);
}

function getSabiTabsMessageBodyKey(message: Record<string, unknown>): string {
  return (
    readSabiTabsUnreadText(message.content) ||
    readSabiTabsUnreadText(message.text) ||
    readSabiTabsUnreadText(message.body) ||
    readSabiTabsUnreadText(message.previewTitle) ||
    readSabiTabsUnreadText(message.fileName) ||
    readSabiTabsUnreadText(message.mediaUri) ||
    readSabiTabsUnreadText(message.url)
  );
}

function getSabiTabsMessageFingerprint(message: Record<string, unknown>) {
  const explicitId =
    readSabiTabsUnreadText(message.messageId) ||
    readSabiTabsUnreadText(message.id) ||
    readSabiTabsUnreadText(message.clientMessageId) ||
    readSabiTabsUnreadText(message.clientId);

  const sender = getSabiTabsMessageSenderId(message);
  const timeBucket = Math.floor(getSabiTabsMessageTimeMs(message) / 1000);
  const body = getSabiTabsMessageBodyKey(message);
  const kind =
    readSabiTabsUnreadText(message.kind) ||
    readSabiTabsUnreadText(message.type) ||
    readSabiTabsUnreadText(message.messageType);

  if (sender || timeBucket || body || kind) {
    return [sender, timeBucket, kind.toLowerCase(), body].join("|");
  }

  return explicitId;
}

function isSabiTabsUnreadCountableMessage(
  message: Record<string, unknown>,
  room: Record<string, unknown>,
) {
  if (!message || typeof message !== "object") return false;
  if (message.deletedAt || message.isDeleted || message.deletedForEveryone) return false;
  if (message.readAt || message.seenAt) return false;
  if (isSabiTabsMessageFromCurrentUser(message, room)) return false;

  const text = getSabiTabsMessageBodyKey(message);
  if (isSabiReactionControlText(text)) return false;

  const lastReadAt = readSabiTabsUnreadText(room.lastReadAt);
  if (lastReadAt) {
    const lastReadMs = Date.parse(lastReadAt);
    const messageMs = getSabiTabsMessageTimeMs(message);

    if (Number.isFinite(lastReadMs) && messageMs && messageMs <= lastReadMs) {
      return false;
    }
  }

  return true;
}

function countSabiTabsUniqueUnreadMessages(
  room: Record<string, unknown>,
  messages: Record<string, unknown>[],
) {
  const seen = new Set<string>();

  for (const message of messages) {
    if (!isSabiTabsUnreadCountableMessage(message, room)) continue;

    const key = getSabiTabsMessageFingerprint(message);
    if (key) seen.add(key);
  }

  return seen.size;
}

function computeSabiTabsRoomVisibleUnread(
  room: Record<string, unknown>,
  messages: Record<string, unknown>[],
  hiddenReactionTailCount: number,
) {
  const readClearedAt =
    readSabiTabsUnreadText(room.sabiUnreadClearedAt) ||
    readSabiTabsUnreadText(room.lastReadAt);

  if (readClearedAt) {
    const readClearedMs = Date.parse(readClearedAt);
    const latestMessageMs = messages.reduce(
      (max, message) => Math.max(max, getSabiTabsMessageTimeMs(message)),
      0,
    );

    if (Number.isFinite(readClearedMs) && (!latestMessageMs || latestMessageMs <= readClearedMs)) {
      return 0;
    }
  }

  const rawUnread = Math.max(0, getSabiTabsRoomRawUnread(room) - Math.max(0, hiddenReactionTailCount || 0));
  if (rawUnread <= 0) return 0;

  const uniqueUnreadMessages = countSabiTabsUniqueUnreadMessages(room, messages);

  if (uniqueUnreadMessages > 0) {
    return Math.min(rawUnread, uniqueUnreadMessages);
  }

  if (readClearedAt) return 0;

  return rawUnread;
}



// SABI_TABS_CHATS_PERSISTENT_MARK_READ
async function clearSabiTabsChatUnreadEverywhere(
  chatId: string,
  currentUserId?: string | null,
): Promise<void> {
  const targetChatId = String(chatId || "").trim();
  if (!targetChatId) return;

  await Promise.allSettled([
    messengerKernelFacade.rooms.markRead(targetChatId),
    markPersistedChatRoomRead(targetChatId, currentUserId || undefined),
  ]);
}

async function buildPersistedChatItems(
  rooms: ChatRoomMetaSnapshot[],
  language: string | undefined,
  texts: Record<string, string>,
): Promise<ChatItem[]> {
  const mapped = await Promise.all(
    rooms.map(async (room) => {
      const rawRoomMessages = getMessengerKernelRoomMessages(room.chatId) as Record<string, unknown>[];
      const messages = await messengerKernelFacade.listRoomPreviewMessages(
        room.chatId,
      );
      const lastMessage = getLastVisiblePreviewMessage(messages);
      const hiddenReactionTailCount = countHiddenReactionTail(messages);
      const visibleUnreadCount = computeSabiTabsRoomVisibleUnread(
        room as Record<string, unknown>,
        rawRoomMessages.length ? rawRoomMessages : (messages as Record<string, unknown>[]),
        hiddenReactionTailCount,
      );
      const botMeta = resolveBotRoomMeta(room);

      const previewFallback = botMeta.isBot
        ? texts.botPreview
        : room.roomType === "channel"
          ? texts.channelPreview
          : room.roomType === "business"
            ? texts.businessPreview
            : texts.directPreview;

      const category: ChatCategory = botMeta.isBot
        ? "bot"
        : room.roomType === "channel"
          ? "official"
          : room.roomType === "business"
            ? "service"
            : "direct";

      return {
        id: room.chatId,
        name: room.name,
        preview: getMessagePreview(lastMessage, previewFallback, {
          photo: texts.photo,
          video: texts.video,
          document: texts.document,
          contact: texts.contact,
          location: texts.location,
          gift: texts.gift,
          audio: texts.voice,
        }),
        time: lastMessage?.time || formatTime(room.updatedAt, language),
        unread: visibleUnreadCount,
        unreadCount: visibleUnreadCount,
        hiddenReactionTailCount,
        verified: Boolean(room.verified),
        official: room.roomType === "channel",
        roomType: (room.roomType as RoomType) || "direct",
        category,
        avatarLetter: room.avatarLetter || getAvatarLetter(room.name),
        updatedAt: room.updatedAt,
        phone: room.phone || (room.subtitle?.startsWith("+") ? room.subtitle : undefined),
        username: room.username || (room.subtitle?.startsWith("@") ? room.subtitle : undefined),
        isBot: botMeta.isBot,
        botId: botMeta.botId,
        botHandle: botMeta.botHandle,
        avatarUri: room.avatarUrl || room.photoUrl || undefined,
        currentUserId: room.currentUserId || undefined,
        peerUserId: room.peerUserId || undefined,
        channelInviteLink: (room as any).channelInviteLink || (room as any).inviteLink || undefined,
        channelBotId: (room as any).channelBotId || (room as any).linkedBotId || undefined,
        channelBotHandle: (room as any).channelBotHandle || (room as any).linkedBotHandle || undefined,
        linkedBotId: (room as any).linkedBotId || (room as any).channelBotId || undefined,
        linkedBotHandle: (room as any).linkedBotHandle || (room as any).channelBotHandle || undefined,
      };
    }),
  );

  return mapped;
}


// SABI_CHATLAR_CONTACT_NAME_UNREAD_AUDIT_HELPERS
type SabiMainChatProfileRecord = Record<string, any> | null | undefined;

function readSabiChatText(value: unknown): string {
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function readSabiChatNumberOrNull(value: unknown): number | null {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : null;
}

function cleanSabiChatComparable(value: unknown): string {
  return String(value ?? "").trim().replace(/^@+/, "").toLowerCase();
}

function isSabiLikelyTechnicalChatId(value: unknown): boolean {
  const raw = String(value ?? "").trim();
  if (!raw) return true;

  const lower = raw.toLowerCase();
  const digits = raw.replace(/\D/g, "");

  if (isPhoneLikeMainChatValue(raw)) return true;
  if (lower === "direct" || lower === "private" || lower === "unknown") return true;
  if (/^(chat|room|direct|private|user|peer|msg|message|group|channel|bot)[:_-]/i.test(raw)) return true;
  if (/^[a-f0-9]{16,}$/i.test(raw)) return true;
  if (/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(raw)) return true;
  if (digits.length >= 7 && digits.length >= raw.replace(/\s/g, "").length - 2) return true;

  return false;
}

function isSabiUsefulChatDisplayName(value: unknown, blockedValues: unknown[] = []): boolean {
  const text = readSabiChatText(value);
  if (!text) return false;

  const comparable = cleanSabiChatComparable(text);
  if (!comparable) return false;

  if (blockedValues.map(cleanSabiChatComparable).filter(Boolean).includes(comparable)) return false;
  if (isSabiLikelyTechnicalChatId(text)) return false;

  return /[\p{L}]/u.test(text) || text.length >= 2;
}

function buildSabiProfileFullName(profile: SabiMainChatProfileRecord): string {
  if (!profile || typeof profile !== "object") return "";

  const first = readSabiChatText(profile.firstName || profile.firstname || profile.givenName);
  const last = readSabiChatText(profile.lastName || profile.lastname || profile.familyName || profile.surname);

  return [first, last].filter(Boolean).join(" ").trim();
}

function pickSabiProfileDisplayName(profile: SabiMainChatProfileRecord, blockedValues: unknown[]): string {
  if (!profile || typeof profile !== "object") return "";

  const candidates = [
    profile.displayName,
    profile.fullName,
    buildSabiProfileFullName(profile),
    profile.name,
    profile.title,
    profile.contactName,
    profile.savedName,
    profile.nickname,
    profile.username ? "@" + String(profile.username).replace(/^@+/, "") : "",
  ];

  for (const candidate of candidates) {
    if (isSabiUsefulChatDisplayName(candidate, blockedValues)) return readSabiChatText(candidate);
  }

  return "";
}

function resolveSabiMainChatDisplayName(item: ChatItem, profile: SabiMainChatProfileRecord): string {
  if (item.roomType !== "direct" || item.isBot) {
    return readSabiChatText(item.name) || readSabiChatText(item.username) || item.id;
  }

  const blockedValues = [
    item.id,
    item.peerUserId,
    item.currentUserId,
    item.phone,
    profile?.id,
    profile?.chatId,
    profile?.roomId,
    profile?.peerUserId,
    profile?.currentUserId,
    profile?.userId,
    profile?.phone,
  ];

  const profileName = pickSabiProfileDisplayName(profile, blockedValues);
  if (profileName) return profileName;

  if (isSabiUsefulChatDisplayName(item.name, blockedValues)) return readSabiChatText(item.name);
  if (isSabiUsefulChatDisplayName(item.username, blockedValues)) return "@" + String(item.username).replace(/^@+/, "");
  if (readSabiChatText(item.phone)) return readSabiChatText(item.phone);

  return readSabiChatText(item.name) || readSabiChatText(item.peerUserId) || item.id;
}

function collectSabiChatProfileKeys(values: unknown[]): string[] {
  const keys = new Set<string>();

  values.forEach((value) => {
    const text = readSabiChatText(value);
    if (!text) return;

    const normalized = cleanSabiChatComparable(text);
    if (normalized) keys.add(normalized);

    const phone = normalizePhone(text);
    if (phone) keys.add("phone:" + phone);
  });

  return Array.from(keys);
}

function collectSabiChatItemProfileKeys(item: ChatItem): string[] {
  return collectSabiChatProfileKeys([
    item.id,
    item.peerUserId,
    item.currentUserId,
    item.phone,
    item.username,
    item.botHandle,
    item.name,
  ]);
}

function collectSabiProfileRecordKeys(profile: SabiMainChatProfileRecord): string[] {
  if (!profile || typeof profile !== "object") return [];

  return collectSabiChatProfileKeys([
    profile.id,
    profile.chatId,
    profile.roomId,
    profile.userId,
    profile.accountId,
    profile.profileId,
    profile.peerUserId,
    profile.currentUserId,
    profile.phone,
    profile.phoneNumber,
    profile.username,
    profile.handle,
    profile.name,
    profile.displayName,
  ]);
}

function getSabiProfileForMainChatItem(profiles: Record<string, any>, item: ChatItem) {
  const direct = profiles[item.id];
  if (direct) return direct;

  const itemKeys = new Set(collectSabiChatItemProfileKeys(item));
  if (!itemKeys.size) return null;

  return (
    Object.values(profiles).find((profile: any) =>
      collectSabiProfileRecordKeys(profile).some((key) => itemKeys.has(key)),
    ) || null
  );
}

function computeSabiMainChatVisibleUnread(item: ChatItem, profile: SabiMainChatProfileRecord): number {
  const itemUnread = readSabiChatNumberOrNull((item as any).unreadCount ?? item.unread) ?? 0;
  const profileUnread = readSabiChatNumberOrNull(profile?.unreadCount ?? profile?.unread);

  // tabs/chats must trust the room/kernel unread first.
  // Profile unread can be stale and was causing old messages to return.
  if (itemUnread <= 0) return 0;
  if (profileUnread !== null && profileUnread > 0) return Math.min(itemUnread, profileUnread);

  return itemUnread;
}


function getProfileForChatItem(
  profiles: Record<string, any>,
  item: ChatItem,
) {
  return getSabiProfileForMainChatItem(profiles, item);
}

function DecorativeBackground({
  children,
  themeState,
  palette,
}: {
  children: React.ReactNode;
  themeState: MessengerThemeState;
  palette: MessengerThemePalette;
}) {
  if (themeState.wallpaperUri) {
    return (
      <ImageBackground
        source={{ uri: themeState.wallpaperUri }}
        style={styles.background}
        resizeMode="cover"
      >
        <LinearGradient
          colors={["rgba(6,8,14,0.06)", "rgba(6,8,14,0.10)", "rgba(6,8,14,0.14)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        {children}
      </ImageBackground>
    );
  }

  return (
    <View style={styles.background}>
      <LinearGradient colors={palette.background} style={StyleSheet.absoluteFill} />
      <View style={styles.textureGrid} />
      {children}
    </View>
  );
}

function useFabAnimation() {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    floatLoop.start();
    glowLoop.start();

    return () => {
      floatLoop.stop();
      glowLoop.stop();
    };
  }, [floatAnim, glowAnim]);

  return {
    fabLiftStyle: {
      transform: [
        {
          translateY: floatAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -6],
          }),
        },
        {
          scale: floatAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 1.03],
          }),
        },
      ],
    } as const,
    fabGlowStyle: {
      opacity: glowAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.28, 0.48],
      }),
      transform: [
        {
          scale: glowAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 1.16],
          }),
        },
      ],
    } as const,
  };
}

function QuickActionRow({
  title,
  subtitle,
  icon,
  onPress,
  danger = false,
}: {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.popupItemWrap, pressed && styles.rowPressed]}>
      <LinearGradient
        colors={
          danger
            ? ["rgba(109,24,38,0.96)", "rgba(62,15,24,0.94)"]
            : ["rgba(255,255,255,0.08)", "rgba(255,255,255,0.03)"]
        }
        style={styles.popupItem}
      >
        <View style={[styles.popupIcon, danger && styles.popupIconDanger]}>{icon}</View>
        <View style={styles.popupTextWrap}>
          <Text style={[styles.popupTitle, danger && styles.popupTitleDanger]}>{title}</Text>
          {subtitle ? <Text style={styles.popupSubtitle}>{subtitle}</Text> : null}
        </View>
      </LinearGradient>
    </Pressable>
  );
}


// SABI_CHATLAR_PROFILE_GROUP_SEARCH_FINAL
function sabiChatlarText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function sabiChatlarProfileGroupChatId(group: Record<string, unknown>) {
  const linkedChatId = sabiChatlarText(group.linkedChatId);
  if (linkedChatId) return linkedChatId;

  const groupId = sabiChatlarText(group.groupId) || sabiChatlarText(group.id);
  if (groupId) return `group:${groupId}`;

  const username = sabiChatlarText(group.username).replace(/^@+/, "");
  if (username) return `group:${username}`;

  const name = sabiChatlarText(group.groupName) || sabiChatlarText(group.name);
  const slug = name
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");

  return slug ? `group:${slug}` : "";
}

async function sabiBuildProfileGroupChatlarItems(
  currentUserId: string | undefined,
  language: string | undefined,
  texts: Record<string, string>,
): Promise<ChatItem[]> {
  try {
    await profileKernelFacade.boot();

    const collection = profileKernelFacade.selectors.groupProfiles();
    const items = Array.isArray((collection as any)?.items) ? (collection as any).items : [];

    const result: ChatItem[] = [];

    for (const raw of items) {
      if (!raw || typeof raw !== "object") continue;

      const group = raw as Record<string, unknown>;
      if (group.created !== true) continue;

      const name = sabiChatlarText(group.groupName) || sabiChatlarText(group.name);
      const chatId = sabiChatlarProfileGroupChatId(group);

      if (!name || !chatId) continue;

      const ownerUserId = sabiChatlarText(group.ownerUserId) || currentUserId || "";
      const username = sabiChatlarText(group.username);
      const avatarUri = sabiChatlarText(group.avatarUri) || sabiChatlarText(group.avatarUrl);
      const coverUri = sabiChatlarText(group.coverUri) || sabiChatlarText(group.coverUrl);
      const publicationPhotos = stringifySabiProfileGroupPublicMedia(group, "photo");
      const publicationVideos = stringifySabiProfileGroupPublicMedia(group, "video");
      rememberSabiProfileGroupPublicSurface(chatId, group);
      const updatedAt =
        typeof group.lastUpdatedAt === "number"
          ? new Date(group.lastUpdatedAt).toISOString()
          : sabiChatlarText(group.updatedAt) || new Date().toISOString();

      const snapshot = {
        chatId,
        roomId: chatId,
        id: chatId,
        name,
        title: name,
        subtitle: sabiChatlarText(group.description) || "Group",
        roomType: "group",
        type: "group",
        verified: Boolean(group.isPublished || group.verified),
        avatarLetter: getAvatarLetter(name),
        avatarUrl: avatarUri || undefined,
        photoUrl: avatarUri || undefined,
        coverUrl: coverUri || undefined,
        publicPhotos: publicationPhotos,
        publicVideos: publicationVideos,
        publicationPhotos,
        publicationVideos,
        likesCount: String(sabiReadProfileGroupNumber(group.likesCount)),
        publicGiftsCount: String(sabiReadProfileGroupNumber(group.publicGiftsCount)),
        inviteLink: sabiReadProfileGroupText(group.inviteLink) || undefined,
        currentUserId: currentUserId || ownerUserId || undefined,
        ownerUserId: ownerUserId || undefined,
        username: username || undefined,
        searchableInDirectory: true,
        localProfileGroupOwner: true,
        memberIds: JSON.stringify(Array.from(new Set([currentUserId, ownerUserId].filter(Boolean)))),
        adminIds: JSON.stringify(Array.from(new Set([currentUserId, ownerUserId].filter(Boolean)))),
        membershipStatus: "member",
        canSendMessages: "1",
        groupAccess: "member",
        updatedAt,
      } as any;

      try {
        await messengerKernelFacade.ensureRoomSnapshot(snapshot);
      } catch {}

      result.push({
        id: chatId,
        name,
        preview: sabiChatlarText(group.description) || "Group",
        time: formatTime(updatedAt, language),
        unread: 0,
        verified: Boolean(group.isPublished || group.verified),
        username: username || undefined,
        avatarLetter: getAvatarLetter(name),
        avatarUri: avatarUri || undefined,
        publicPhotos: publicationPhotos,
        publicVideos: publicationVideos,
        publicationPhotos,
        publicationVideos,
        likesCount: String(sabiReadProfileGroupNumber(group.likesCount)),
        publicGiftsCount: String(sabiReadProfileGroupNumber(group.publicGiftsCount)),
        inviteLink: sabiReadProfileGroupText(group.inviteLink) || undefined,
        currentUserId: currentUserId || ownerUserId || undefined,
        peerUserId: undefined,
        roomType: "group",
        category: "direct",
        updatedAt,
        muted: false,
        pinned: false,
        hiddenFromMain: false,
        hiddenReactionTailCount: 0,
        online: false,
        isBot: false,
      } as ChatItem);
    }

    return result;
  } catch {
    return [];
  }
}



function hasSabiPublicDirectoryPayload(value: unknown) {
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value !== "string") return false;
  const text = value.trim();
  if (!text || text === "[]") return false;
  try {
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed.length > 0 : Boolean(text);
  } catch {
    return Boolean(text);
  }
}

function pickSabiPublicDirectoryPayload(primary: unknown, fallback: unknown) {
  return hasSabiPublicDirectoryPayload(primary) ? primary : fallback;
}

function stringifySabiPublicDirectoryPayload(value: unknown) {
  if (!value) return undefined;
  if (typeof value === "string") return value;

  try {
    return JSON.stringify(value);
  } catch {
    return undefined;
  }
}

function readSabiPublicDirectoryCount(value: unknown) {
  const next = Number(value);
  return Number.isFinite(next) ? String(Math.max(0, Math.floor(next))) : "0";
}
// SABI_CHATLAR_PUBLIC_DIRECTORY_MAPPER
function mapPublicDirectoryItemToChatItem(
  item: SabiPublicDirectoryItem,
  language: string | undefined,
  texts: Record<string, string>,
  currentUserId?: string,
): ChatItem | null {
  const id = String(item.chatId || item.roomId || item.botId || item.id || "").trim();
  const name = String(item.title || item.name || "").trim();

  if (!id || !name) return null;

  const kind = String(item.kind || item.type || "").toUpperCase();
  const updatedAt = String(item.updatedAt || new Date().toISOString());
  const avatarUrl = typeof item.avatarUrl === "string" && item.avatarUrl.trim() ? item.avatarUrl.trim() : undefined;
  const username = typeof item.username === "string" && item.username.trim() ? item.username.trim() : undefined;

  const isBot = kind === "BOT";
  const roomType: RoomType =
    kind === "GROUP" ? "group" : kind === "CHANNEL" ? "channel" : "direct";

  const preview =
    kind === "GROUP"
      ? String(item.description || "Guruh")
      : kind === "CHANNEL"
        ? String(item.description || texts.channelPreview || "Kanal")
        : String(item.description || texts.botPreview || "Bot");

  return {
    id,
    name,
    preview,
    time: formatTime(updatedAt, language),
    unread: 0,
    verified: false,
    username,
    avatarLetter: getAvatarLetter(name),
    avatarUri: avatarUrl,
    currentUserId,
    peerUserId: isBot ? id : undefined,
    roomType,
    category: isBot ? "bot" : "direct",
    updatedAt,
    muted: false,
    pinned: false,
    hiddenFromMain: false,
    hiddenReactionTailCount: 0,
    online: false,
    isBot,
    botId: isBot ? id : undefined,
    botHandle: isBot ? username : undefined,
    publicDirectoryItem: item,
    publicationPhotos: pickSabiPublicDirectoryPayload((item as any).publicationPhotos, (item as any).publicPhotos),
    publicationVideos: pickSabiPublicDirectoryPayload((item as any).publicationVideos, (item as any).publicVideos),
    publicPhotos: pickSabiPublicDirectoryPayload((item as any).publicPhotos, (item as any).publicationPhotos),
    publicVideos: pickSabiPublicDirectoryPayload((item as any).publicVideos, (item as any).publicationVideos),
    likesCount: readSabiPublicDirectoryCount((item as any).likesCount),
    publicGiftsCount: readSabiPublicDirectoryCount((item as any).publicGiftsCount),
    inviteLink: (item as any).inviteLink || undefined,
    channelInviteLink: (item as any).channelInviteLink || (item as any).inviteLink || undefined,
    channelBotId: (item as any).channelBotId || (item as any).linkedBotId || (item as any).connectedBotId || undefined,
    channelBotHandle: (item as any).channelBotHandle || (item as any).linkedBotHandle || (item as any).connectedBotHandle || undefined,
    linkedBotId: (item as any).linkedBotId || (item as any).channelBotId || (item as any).connectedBotId || undefined,
    linkedBotHandle: (item as any).linkedBotHandle || (item as any).channelBotHandle || (item as any).connectedBotHandle || undefined,
    channelRole: (item as any).channelRole || undefined,
    channelAccess: (item as any).channelAccess || undefined,
    ownerUserId: (item as any).ownerUserId || (item as any).createdBy || undefined,
    channelOwnerUserId: (item as any).channelOwnerUserId || (item as any).ownerUserId || (item as any).createdBy || undefined,
    isChannelOwner: (item as any).isChannelOwner || undefined,
    isChannelAdmin: (item as any).isChannelAdmin || undefined,
    canSendMessages: (item as any).canSendMessages || undefined,
    canSendText: (item as any).canSendText || undefined,
    canSendMedia: (item as any).canSendMedia || undefined,
    onlyAdminsCanPost: (item as any).onlyAdminsCanPost || undefined,
  };
}

export default function ChatsScreen() {
  const params = useLocalSearchParams<{ userId?: string }>();
  const { language, t } = useI18n();

  const txAny = useCallback(
    (keys: string[], fallback = "") => {
      for (const key of keys) {
        const value = t(key);
        if (typeof value === "string" && value.trim() && value !== key) return value;
      }
      return fallback;
    },
    [t],
  );

  const currentUserId =
    typeof params.userId === "string" && params.userId.trim().length > 0
      ? params.userId.trim()
      : messengerKernelFacade.selectors.currentUserId() ?? undefined;

  const [query, setQuery] = useState("");
  const [connected, setConnected] = useState(false);
  const [persistedChats, setPersistedChats] = useState<ChatItem[]>([]);
  const [directorySearchChats, setDirectorySearchChats] = useState<ChatItem[]>([]);
  const [sabiDirectoryGroupChats, setSabiDirectoryGroupChats] = useState<ChatItem[]>([]);
  const [quickMenuChat, setQuickMenuChat] = useState<ChatItem | null>(null);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [themeState, setThemeState] = useState<MessengerThemeState>(getMessengerThemeState());
  const presenceByUserId = useMessengerPresenceMapSnapshot();
  const processedInboundMessageKeysRef = useRef<Set<string>>(new Set());
  const reloadChatsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { fabLiftStyle, fabGlowStyle } = useFabAnimation();

  const palette = useMemo<MessengerThemePalette>(
    () => getMessengerThemePalette(themeState.themeId),
    [themeState.themeId],
  );

  const hasWallpaper = Boolean(themeState.wallpaperUri);

  const cardColors: [string, string] = hasWallpaper
    ? ["rgba(10,15,24,0.26)", "rgba(10,15,24,0.14)"]
    : palette.surface;

  const raisedColors: [string, string] = hasWallpaper
    ? ["rgba(255,255,255,0.06)", "rgba(255,255,255,0.02)"]
    : palette.surfaceRaised;

  const texts = useMemo(
    () => ({
      eyebrow: "Sabi Messenger",
      title: txAny(["messenger.chats", "tabs.chats"], "Chatlar"),
      searchPlaceholder: txAny(["messenger.searchChats", "search.chatPlaceholder", "search.placeholder"], "Chatlarda qidirish"),
      online: txAny(["status.connected", "common.online"], "Onlayn"),
      connecting: txAny(["common.connecting", "status.disconnected"], "Ulanmoqda"),
      emptyTitle: txAny(["common.empty"], "Chatlar yo‘q"),
      emptySubtitle: txAny(["messenger.chat.conversationPlaceholder"], "Suhbat shu yerda ko‘rinadi."),
      officialBadge: txAny(["status.verified", "common.verified"], "Tasdiqlangan"),
      botBadge: txAny(["messenger.bot", "common.bot"], "BOT"),
      channelPreview: txAny(["messenger.chat.channelRoom", "messenger.channels"], "Kanal"),
      businessPreview: txAny(["messenger.chat.businessRoom", "common.business"], "Biznes"),
      botPreview: txAny(["messenger.botConversation", "messenger.bot"], "Bot chati"),
      directPreview: txAny(["messenger.chat.directRoom", "tabs.chats"], "Suhbatni boshlash"),
      photo: txAny(["messenger.chat.photoTitle", "messenger.photo"], "Rasm"),
      video: txAny(["messenger.chat.videoTitle", "messenger.video"], "Video"),
      document: txAny(["messenger.chat.documentTitle", "messenger.document"], "Hujjat"),
      contact: txAny(["messenger.chat.contactTitle", "messenger.contact"], "Kontakt"),
      location: txAny(["messenger.chat.locationTitle", "messenger.location"], "Joylashuv"),
      gift: txAny(["gifts.title"], "Sovg‘a"),
      voice: txAny(["messenger.chat.voiceTitle", "messenger.voiceMessage"], "Ovozli xabar"),
      mute: txAny(["messenger.menu.mute", "messenger.muteChat"], "Ovozsiz qilish"),
      unmute: txAny(["messenger.menu.unmute", "messenger.unmuteChat"], "Ovozni yoqish"),
      pin: txAny(["messenger.pinChat"], "Mahkamlash"),
      unpin: txAny(["messenger.unpinChat"], "Mahkamlashni olib tashlash"),
      markRead: txAny(["status.read"], "O‘qilgan deb belgilash"),
      markUnread: txAny(["status.unread"], "O‘qilmagan deb belgilash"),
      privateChats: txAny(["messenger.privateChats", "common.private"], "Shaxsiy chatlar"),
      themeWallpaper: txAny(["messenger.themeWallpaper", "common.theme"], "Mavzu va fon rasmi"),
      deleteChat: `${txAny(["common.delete"], "O‘chirish")} ${txAny(
        ["messenger.chats", "tabs.chats"],
        "Chatlar",
      )}`.trim(),
      close: txAny(["common.close"], "Yopish"),
      settingsHint: txAny(["settings.chatSettings", "settings.title"], "Chat sozlamalari"),
      active: txAny(["status.active", "common.enabled"], "Faol"),
      newChat: txAny(["messenger.newChat", "common.create"], "Yangi chat"),
      mainChats: txAny(["messenger.chats", "tabs.chats"], "Chatlar"),
    }),
    [txAny],
  );

  const refreshTheme = useCallback(async () => {
    const next = await hydrateMessengerThemeState();
    setThemeState(next);
  }, []);

  const loadChats = useCallback(async () => {
    try {
      await profileKernelFacade.boot();
      const collection = profileKernelFacade.selectors.groupProfiles();
      const items = Array.isArray((collection as any)?.items) ? (collection as any).items : [];

      for (const raw of items) {
        if (!raw || typeof raw !== "object") continue;
        const group = raw as Record<string, any>;
        if (!group.created) continue;

        const name = String(group.groupName || group.name || "").trim();
        if (!name) continue;

        const linkedChatId = String(group.linkedChatId || "").trim();
        const groupId = String(group.groupId || group.id || "").trim();
        const username = String(group.username || "").trim();
        const chatId =
          linkedChatId ||
          (groupId ? `group:${groupId}` : username ? `group:${username}` : "");

        if (!chatId) continue;

        const ownerUserId = String(group.ownerUserId || currentUserId || "").trim();
        const memberIds = Array.isArray(group.members)
          ? group.members.map((item: any) => String(item?.id || item?.userId || "").trim()).filter(Boolean)
          : [];
        const adminIds = Array.isArray(group.admins)
          ? group.admins.map((item: any) => String(item?.id || item?.userId || "").trim()).filter(Boolean)
          : [];

        await messengerKernelFacade.ensureRoomSnapshot({
          chatId,
          roomId: chatId,
          id: chatId,
          name,
          title: name,
          subtitle: String(group.description || group.publicationSubtitle || "").trim() || "Group",
          roomType: "group",
          type: "group",
          verified: Boolean(group.isPublished || group.verified),
          avatarLetter: (name.charAt(0) || "G").toUpperCase(),
          avatarUrl: String(group.avatarUri || "").trim() || undefined,
          photoUrl: String(group.avatarUri || "").trim() || undefined,
          coverUrl: String(group.coverUri || "").trim() || undefined,
          currentUserId: currentUserId || ownerUserId || undefined,
          ownerUserId: ownerUserId || undefined,
          username: username || undefined,
          searchableInDirectory: true,
          localProfileGroupOwner: Boolean(ownerUserId && currentUserId && ownerUserId === currentUserId),
          memberIds: JSON.stringify(Array.from(new Set([ownerUserId, currentUserId, ...memberIds].filter(Boolean)))),
          adminIds: JSON.stringify(Array.from(new Set([ownerUserId, ...adminIds].filter(Boolean)))),
          joinMode: group.allowJoinRequests === true ? "request" : "open",
          canSendMessages: "1",
          membershipStatus: "member",
          updatedAt: new Date().toISOString(),
        } as any);
      }
    } catch {
      // Chats list must continue even if profile groups are not hydrated yet.
    }
    const [kernelRooms, persistedRooms] = await Promise.all([
      messengerKernelFacade.listRoomSnapshots(),
      listPersistedChatRooms(),
    ]);

    const profileGroupRooms = await sabiLoadProfileGroupsForChatlar(currentUserId);

    for (const room of profileGroupRooms) {
      try {
        await messengerKernelFacade.ensureRoomSnapshot(room as any);
      } catch {}
    }

    const rooms = mergeChatRoomSnapshots([
      ...(persistedRooms as ChatRoomMetaSnapshot[]),
      ...(kernelRooms as ChatRoomMetaSnapshot[]),
      ...(profileGroupRooms as ChatRoomMetaSnapshot[]),
    ]);
    const profiles = await messengerKernelFacade.listRoomProfiles();
    const mapped = await buildPersistedChatItems(rooms, language, texts as Record<string, string>);

    const visible = await Promise.all(
      mapped.map(async (item) => {
        const profile = getProfileForChatItem(profiles, item);
        const profileAvatarUri = getAvatarUriFromUnknownProfile(profile);
        const groupAvatarUri =
          item.roomType === "group"
            ? (() => {
                const shared = hydrateGroupPublicProfile(item.id);
                return typeof shared?.avatarUri === "string" && shared.avatarUri.trim()
                  ? shared.avatarUri.trim()
                  : "";
              })()
            : "";
        const sharedAvatarUri =
          item.roomType !== "group"
            ? resolvePublicProfileAvatarUri([
                profile?.peerUserId,
                item.peerUserId,
                item.id,
                profile?.phone,
                item.phone,
                profile?.username,
                item.username,
                item.name,
              ])
            : "";

        return {
          ...item,
          name: resolveSabiMainChatDisplayName(item, profile),
          unread: computeSabiMainChatVisibleUnread(item, profile),
          unreadCount: computeSabiMainChatVisibleUnread(item, profile),
          muted: Boolean(profile?.muted),
          pinned: Boolean(profile?.pinned),
          hiddenFromMain: Boolean(profile?.hiddenFromMain),
          phone: profile?.phone || item.phone,
          username: profile?.username || item.username,
          botHandle: profile?.username || item.botHandle || item.username,
          currentUserId: profile?.currentUserId || item.currentUserId,
          peerUserId: profile?.peerUserId || item.peerUserId,
          avatarUri: profileAvatarUri || groupAvatarUri || sharedAvatarUri || item.avatarUri,
        };
      }),
    );

    const filteredVisible = dedupeMainChatItems(visible)
      .filter((item) => {
        const profile = getProfileForChatItem(profiles, item);
        if (messengerKernelFacade.isRoomDeleted(profile)) return false;
        return !messengerKernelFacade.isRoomHidden(profile);
      })
      .sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return String(b.updatedAt ?? "").localeCompare(String(a.updatedAt ?? ""));
      });

    const profileGroupChatItems = await sabiBuildProfileGroupChatlarItems(
      currentUserId,
      language,
      texts as Record<string, string>,
    );

    setPersistedChats(
      dedupeMainChatItems([...filteredVisible, ...profileGroupChatItems]).sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return String(b.updatedAt ?? "").localeCompare(String(a.updatedAt ?? ""));
      }),
    );
  }, [language, texts]);

  useFocusEffect(
    useCallback(() => {
      void refreshTheme();
      void hydratePublicProfileStorage().finally(() => {
        void loadChats();
      });
    }, [refreshTheme, loadChats]),
  );

  useEffect(() => {
    const unsubscribe = subscribePublicProfiles(() => {
      void loadChats();
    });

    return unsubscribe;
  }, [loadChats]);

  useEffect(() => {
    const scheduleLoadChats = () => {
      if (reloadChatsTimerRef.current) {
        clearTimeout(reloadChatsTimerRef.current);
      }

      reloadChatsTimerRef.current = setTimeout(() => {
        reloadChatsTimerRef.current = null;
        void loadChats();
      }, 80);
    };

    const syncConnection = () => {
      setConnected(messengerKernelFacade.selectors.realtimeStatus() === "connected");
    };

    const resolveActiveUserId = () =>
      normalizeString(currentUserId) || messengerKernelFacade.selectors.currentUserId() || "";

    const onIncomingMessage = async (payload: unknown) => {
      const chatId = pickRealtimeChatId(payload);
      const messageId = pickRealtimeMessageId(payload);
      const senderId = pickRealtimeUserId(payload);
      const activeUserId = resolveActiveUserId();
      const isOwnMessage = Boolean(senderId && activeUserId && senderId === activeUserId);
      const record = readRealtimePayloadRecord(payload);
      const isHiddenReactionControl =
        isSabiReactionControlText(record.content as string | null | undefined) ||
        isSabiReactionControlText(record.text as string | null | undefined) ||
        isSabiReactionControlText(record.previewTitle as string | null | undefined);

      if (chatId && !isOwnMessage && !isHiddenReactionControl) {
        const dedupeKey =
          messageId || `${chatId}:${senderId || "unknown"}:${pickRealtimeAt(payload) || Date.now()}`;

        if (!processedInboundMessageKeysRef.current.has(dedupeKey)) {
          processedInboundMessageKeysRef.current.add(dedupeKey);
        }
      }

      scheduleLoadChats();
    };

    const onMessageAck = async (payload: unknown, kind: "read" | "delivered") => {
      const chatId = pickRealtimeChatId(payload);
      const ackUserId = pickRealtimeUserId(payload);
      const activeUserId = resolveActiveUserId();

      if (kind === "read" && chatId && ackUserId && activeUserId && ackUserId === activeUserId) {
        await messengerKernelFacade.rooms.markRead(chatId);
                            await markPersistedChatRoomRead(chatId, currentUserId);
      }

      scheduleLoadChats();
    };

    syncConnection();

    const unsubscribeStore = messengerKernelFacade.subscribe(() => {
      syncConnection();
      scheduleLoadChats();
    });

    const unsubscribeRealtime = messengerKernelFacade.on("realtimeEvent", (event) => {
      if (event.type === "connection") {
        syncConnection();
        scheduleLoadChats();
        return;
      }

      if (event.type !== "custom") return;

      if (typeof event.eventName === "string" && isRealtimeReadEventName(event.eventName)) {
        void onMessageAck(event.payload, "read");
        return;
      }

      if (typeof event.eventName === "string" && isRealtimeDeliveredEventName(event.eventName)) {
        void onMessageAck(event.payload, "delivered");
        return;
      }

      if (typeof event.eventName === "string" && isRealtimeMessageCreateEventName(event.eventName)) {
        void onIncomingMessage(event.payload);
        return;
      }

      if (typeof event.eventName === "string" && event.eventName.toLowerCase().includes("deleted")) {
        scheduleLoadChats();
      }
    });

    return () => {
      if (reloadChatsTimerRef.current) {
        clearTimeout(reloadChatsTimerRef.current);
        reloadChatsTimerRef.current = null;
      }
      unsubscribeRealtime();
      unsubscribeStore();
    };
  }, [currentUserId, loadChats]);

  
  // SABI_CHATLAR_BACKEND_GROUP_SEARCH_EFFECT
  useEffect(() => {
    let cancelled = false;

    async function searchBackendGroups() {
      const normalized = query.trim();

      if (!normalized) {
        setSabiDirectoryGroupChats([]);
        return;
      }

      try {
        const auth = getAuthSessionState();

        if (
          auth.status !== "authenticated" ||
          !auth.apiBaseUrl ||
          !auth.accessToken
        ) {
          setSabiDirectoryGroupChats([]);
          return;
        }

        const response = await fetch(
          `${auth.apiBaseUrl}/api/v2/messenger/groups/search?query=${encodeURIComponent(normalized)}`,
          {
            headers: {
              Authorization: `Bearer ${auth.accessToken}`,
            },
          },
        );

        const payload = await response.json().catch(() => null);
        const rows = Array.isArray(payload?.data) ? payload.data : [];

        const items: ChatItem[] = rows
          .map((row: any) => {
            const chatId = String(row.chatId || row.id || "").trim();
            const name = String(row.title || row.name || "").trim();

            if (!chatId || !name) return null;

            const updatedAt = String(row.updatedAt || new Date().toISOString());

            return {
              id: chatId,
              name,
              preview: "Group",
              time: formatTime(updatedAt, language),
              unread: 0,
              verified: Boolean(row.verified),
              username: typeof row.username === "string" ? row.username : undefined,
              avatarLetter: getAvatarLetter(name),
              avatarUri: typeof row.avatarUrl === "string" ? row.avatarUrl : undefined,
              currentUserId: currentUserId || undefined,
              peerUserId: undefined,
              roomType: "group",
              category: "direct",
              updatedAt,
              muted: false,
              pinned: false,
              hiddenFromMain: false,
              hiddenReactionTailCount: 0,
              online: false,
              isBot: false,
              publicationPhotos: stringifySabiPublicDirectoryPayload(pickSabiPublicDirectoryPayload((row as any).publicationPhotos, (row as any).publicPhotos)),
              publicationVideos: stringifySabiPublicDirectoryPayload(pickSabiPublicDirectoryPayload((row as any).publicationVideos, (row as any).publicVideos)),
              publicPhotos: stringifySabiPublicDirectoryPayload(pickSabiPublicDirectoryPayload((row as any).publicPhotos, (row as any).publicationPhotos)),
              publicVideos: stringifySabiPublicDirectoryPayload(pickSabiPublicDirectoryPayload((row as any).publicVideos, (row as any).publicationVideos)),
              likesCount: readSabiPublicDirectoryCount((row as any).likesCount),
              publicGiftsCount: readSabiPublicDirectoryCount((row as any).publicGiftsCount),
              inviteLink: (row as any).inviteLink || undefined,
            } as ChatItem;
          })
          .filter(Boolean) as ChatItem[];

        for (const item of items) {
          try {
            await messengerKernelFacade.ensureRoomSnapshot({
              chatId: item.id,
              roomId: item.id,
              id: item.id,
              name: item.name,
              title: item.name,
              subtitle: "Group",
              roomType: "group",
              type: "group",
              avatarLetter: item.avatarLetter,
              avatarUrl: item.avatarUri || undefined,
              photoUrl: item.avatarUri || undefined,
              currentUserId: currentUserId || undefined,
              searchableInDirectory: true,
              joinMode: "request",
              updatedAt: item.updatedAt || new Date().toISOString(),
            publicationPhotos: stringifySabiPublicDirectoryPayload(pickSabiPublicDirectoryPayload((item as any).publicationPhotos, (item as any).publicPhotos)),
            publicationVideos: stringifySabiPublicDirectoryPayload(pickSabiPublicDirectoryPayload((item as any).publicationVideos, (item as any).publicVideos)),
            publicPhotos: stringifySabiPublicDirectoryPayload(pickSabiPublicDirectoryPayload((item as any).publicPhotos, (item as any).publicationPhotos)),
            publicVideos: stringifySabiPublicDirectoryPayload(pickSabiPublicDirectoryPayload((item as any).publicVideos, (item as any).publicationVideos)),
            likesCount: readSabiPublicDirectoryCount((item as any).likesCount),
            publicGiftsCount: readSabiPublicDirectoryCount((item as any).publicGiftsCount),
            inviteLink: (item as any).inviteLink || undefined,
    channelInviteLink: (item as any).channelInviteLink || (item as any).inviteLink || undefined,
    channelBotId: (item as any).channelBotId || (item as any).linkedBotId || (item as any).connectedBotId || undefined,
    channelBotHandle: (item as any).channelBotHandle || (item as any).linkedBotHandle || (item as any).connectedBotHandle || undefined,
    linkedBotId: (item as any).linkedBotId || (item as any).channelBotId || (item as any).connectedBotId || undefined,
    linkedBotHandle: (item as any).linkedBotHandle || (item as any).channelBotHandle || (item as any).connectedBotHandle || undefined,
    channelRole: (item as any).channelRole || undefined,
    channelAccess: (item as any).channelAccess || undefined,
    ownerUserId: (item as any).ownerUserId || (item as any).createdBy || undefined,
    channelOwnerUserId: (item as any).channelOwnerUserId || (item as any).ownerUserId || (item as any).createdBy || undefined,
    isChannelOwner: (item as any).isChannelOwner || undefined,
    isChannelAdmin: (item as any).isChannelAdmin || undefined,
    canSendMessages: (item as any).canSendMessages || undefined,
    canSendText: (item as any).canSendText || undefined,
    canSendMedia: (item as any).canSendMedia || undefined,
    onlyAdminsCanPost: (item as any).onlyAdminsCanPost || undefined,
            } as any);
          } catch {}
        }

        if (!cancelled) setSabiDirectoryGroupChats(items);
      } catch {
        if (!cancelled) setSabiDirectoryGroupChats([]);
      }
    }

    const timer = setTimeout(() => {
      void searchBackendGroups();
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [currentUserId, language, query]);


  // SABI_CHATLAR_PUBLIC_DIRECTORY_SEARCH_EFFECT
  useEffect(() => {
    let cancelled = false;

    async function runPublicDirectorySearch() {
      const normalized = query.trim();

      if (!normalized) {
        setDirectorySearchChats([]);
        return;
      }

      const rows = await searchSabiPublicDirectory({
        query: normalized,
        kind: "ALL",
      });

      if (cancelled) return;

      const mapped = rows
        .map((item) =>
          mapPublicDirectoryItemToChatItem(
            item,
            language,
            texts as Record<string, string>,
            currentUserId,
          ),
        )
        .filter(Boolean) as ChatItem[];

      for (const item of mapped) {
        try {
          await messengerKernelFacade.ensureRoomSnapshot({
            chatId: item.id,
            roomId: item.id,
            id: item.id,
            name: item.name,
            title: item.name,
            subtitle: item.preview,
            roomType: item.roomType,
            type: item.roomType,
            verified: Boolean(item.verified),
            avatarLetter: item.avatarLetter,
            avatarUrl: item.avatarUri || undefined,
            photoUrl: item.avatarUri || undefined,
            username: item.username || undefined,
            currentUserId: currentUserId || undefined,
            peerUserId: item.peerUserId || undefined,
            searchableInDirectory: true,
            isBot: item.isBot ? "1" : undefined,
            botId: item.botId || undefined,
            botHandle: item.botHandle || undefined,
            updatedAt: item.updatedAt || new Date().toISOString(),
            publicationPhotos: stringifySabiPublicDirectoryPayload(pickSabiPublicDirectoryPayload((item as any).publicationPhotos, (item as any).publicPhotos)),
            publicationVideos: stringifySabiPublicDirectoryPayload(pickSabiPublicDirectoryPayload((item as any).publicationVideos, (item as any).publicVideos)),
            publicPhotos: stringifySabiPublicDirectoryPayload(pickSabiPublicDirectoryPayload((item as any).publicPhotos, (item as any).publicationPhotos)),
            publicVideos: stringifySabiPublicDirectoryPayload(pickSabiPublicDirectoryPayload((item as any).publicVideos, (item as any).publicationVideos)),
            likesCount: readSabiPublicDirectoryCount((item as any).likesCount),
            publicGiftsCount: readSabiPublicDirectoryCount((item as any).publicGiftsCount),
            inviteLink: (item as any).inviteLink || undefined,
    channelInviteLink: (item as any).channelInviteLink || (item as any).inviteLink || undefined,
    channelBotId: (item as any).channelBotId || (item as any).linkedBotId || (item as any).connectedBotId || undefined,
    channelBotHandle: (item as any).channelBotHandle || (item as any).linkedBotHandle || (item as any).connectedBotHandle || undefined,
    linkedBotId: (item as any).linkedBotId || (item as any).channelBotId || (item as any).connectedBotId || undefined,
    linkedBotHandle: (item as any).linkedBotHandle || (item as any).channelBotHandle || (item as any).connectedBotHandle || undefined,
    channelRole: (item as any).channelRole || undefined,
    channelAccess: (item as any).channelAccess || undefined,
    ownerUserId: (item as any).ownerUserId || (item as any).createdBy || undefined,
    channelOwnerUserId: (item as any).channelOwnerUserId || (item as any).ownerUserId || (item as any).createdBy || undefined,
    isChannelOwner: (item as any).isChannelOwner || undefined,
    isChannelAdmin: (item as any).isChannelAdmin || undefined,
    canSendMessages: (item as any).canSendMessages || undefined,
    canSendText: (item as any).canSendText || undefined,
    canSendMedia: (item as any).canSendMedia || undefined,
    onlyAdminsCanPost: (item as any).onlyAdminsCanPost || undefined,
          } as any);
        } catch {}
      }

      if (!cancelled) {
        setDirectorySearchChats(mapped);
      }
    }

    const timer = setTimeout(() => {
      void runPublicDirectorySearch();
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [currentUserId, language, query, texts]);

  const chats = useMemo<ChatItem[]>(() => {
    return dedupeMainChatItems([...persistedChats, ...directorySearchChats, ...sabiDirectoryGroupChats]).sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return String(b.updatedAt ?? "").localeCompare(String(a.updatedAt ?? ""));
    });
  }, [persistedChats, directorySearchChats, sabiDirectoryGroupChats]);

  const filteredChats = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return dedupeMainChatItems(chats.filter(
      (item) =>
        !normalized ||
        item.name.toLowerCase().includes(normalized) ||
        item.preview.toLowerCase().includes(normalized) ||
        (item.username ?? "").toLowerCase().includes(normalized) ||
        (item.botHandle ?? "").toLowerCase().includes(normalized) ||
        (item.phone ?? "").toLowerCase().includes(normalized),
    ));
  }, [chats, query]);

  const openChat = useCallback(
    async (chat: ChatItem) => {
      // SABI_TABS_CHATS_CLEAR_ON_OPEN:
      // Clear unread in memory and persisted storage before opening.
      if ((chat.unread || (chat as any).unreadCount || 0) > 0) {
        await clearSabiTabsChatUnreadEverywhere(chat.id, currentUserId);
        setPersistedChats((current) =>
          current.map((item) =>
            item.id === chat.id ? { ...item, unread: 0, unreadCount: 0 } : item,
          ),
        );
      }

      // SABI_CHATLAR_OPEN_DIRECTORY_PUBLIC_PROFILE_MEDIA
      const directoryItem = (chat as any).publicDirectoryItem as SabiPublicDirectoryItem | undefined;
      if (directoryItem) {
        const result = await openSabiPublicDirectoryItem(directoryItem, currentUserId);
        if (!result.ok) {
          Alert.alert("Sabi", result.error || "open_failed");
          return;
        }
        await loadChats();
        return;
      }

      const persistedSubtitle =
        chat.phone ||
        chat.botHandle ||
        chat.username ||
        texts.directPreview;
      const peerPresence = readMessengerPeerPresence(chat, presenceByUserId);
      const peerOnline = isMessengerPeerOnline(chat, presenceByUserId);
      const peerLastSeenAt = readMessengerPresenceLastSeen(peerPresence) || chat.lastSeenAt || "";

      await openMessengerRoom({
        chatId: chat.id,
        name: chat.name,
        subtitle: persistedSubtitle,
        roomType: chat.isBot ? "bot" : chat.roomType,
        verified: Boolean(chat.verified),
        avatarLetter: chat.avatarLetter || getAvatarLetter(chat.name, chat.phone),
        phone: chat.phone || undefined,
        username: chat.username || undefined,
        handle: chat.username || undefined,
        avatarUrl: chat.avatarUri || undefined,
        photoUrl: chat.avatarUri || undefined,
        currentUserId: currentUserId || chat.currentUserId || undefined,
        peerUserId:
          chat.isBot
            ? chat.peerUserId || chat.botId || chat.id
            : chat.roomType === "direct"
              ? chat.peerUserId || chat.id || undefined
              : undefined,
        isBot: chat.isBot ? "1" : undefined,
        botId: chat.isBot ? chat.botId || chat.id : undefined,
        botHandle: chat.isBot
          ? chat.botHandle || chat.username || normalizeHandle(chat.name)
          : undefined,
        hiddenFromMain: false,
        forceVisibleInMain: true,
        status: peerOnline ? texts.online : undefined,
        presenceOnline: chat.roomType === "direct" && !chat.isBot ? (peerOnline ? "1" : "0") : undefined,
        lastSeenAt: chat.roomType === "direct" && !chat.isBot && peerLastSeenAt ? peerLastSeenAt : undefined,
        // SABI_CHATLAR_OPEN_PUBLIC_PROFILE_MEDIA_PARAMS
        publicPhotos: stringifySabiPublicDirectoryPayload(pickSabiPublicDirectoryPayload((chat as any).publicPhotos, (chat as any).publicationPhotos)),
        publicVideos: stringifySabiPublicDirectoryPayload(pickSabiPublicDirectoryPayload((chat as any).publicVideos, (chat as any).publicationVideos)),
        publicationPhotos: stringifySabiPublicDirectoryPayload(pickSabiPublicDirectoryPayload((chat as any).publicationPhotos, (chat as any).publicPhotos)),
        publicationVideos: stringifySabiPublicDirectoryPayload(pickSabiPublicDirectoryPayload((chat as any).publicationVideos, (chat as any).publicVideos)),
        likesCount: String((chat as any).likesCount || "0"),
        publicGiftsCount: String((chat as any).publicGiftsCount || "0"),
        inviteLink: (chat as any).inviteLink || undefined,
        channelInviteLink: (chat as any).channelInviteLink || (chat as any).inviteLink || undefined,
        channelBotId: (chat as any).channelBotId || (chat as any).linkedBotId || undefined,
        channelBotHandle: (chat as any).channelBotHandle || (chat as any).linkedBotHandle || undefined,
        linkedBotId: (chat as any).linkedBotId || (chat as any).channelBotId || undefined,
        linkedBotHandle: (chat as any).linkedBotHandle || (chat as any).channelBotHandle || undefined,
        channelRole: (chat as any).channelRole || undefined,
        channelAccess: (chat as any).channelAccess || undefined,
        ownerUserId: (chat as any).ownerUserId || undefined,
        channelOwnerUserId: (chat as any).channelOwnerUserId || (chat as any).ownerUserId || undefined,
        isChannelOwner: (chat as any).isChannelOwner || undefined,
        isChannelAdmin: (chat as any).isChannelAdmin || undefined,
        canSendMessages: (chat as any).canSendMessages || undefined,
        canSendText: (chat as any).canSendText || undefined,
        canSendMedia: (chat as any).canSendMedia || undefined,
        onlyAdminsCanPost: (chat as any).onlyAdminsCanPost || undefined,
        markRead: true,
      });

      // SABI_CHATLAR_MARK_READ_AFTER_OPEN
      if (chat.unread > 0) {
        await messengerKernelFacade.rooms.markRead(chat.id);
                            await markPersistedChatRoomRead(chat.id, currentUserId);
        setPersistedChats((current) =>
          current.map((item) =>
            item.id === chat.id ? { ...item, unread: 0, unreadCount: 0 } : item,
          ),
        );
      }

      await loadChats();
    },
    [currentUserId, loadChats, presenceByUserId, texts.directPreview, texts.online],
  );

  const runQuickAction = async (action: () => Promise<void>) => {
    await action();
    setQuickMenuChat(null);
    await loadChats();
  };

  const renderCard = (chat: ChatItem, index: number) => {
    const avatarColors: [string, string, string] = chat.isBot
      ? ["#4D7CFF", "#63B8FF", "#A7ECFF"]
      : chat.hiddenFromMain
        ? ["#6A4DE1", "#8C69FF", "#C39DFF"]
        : [palette.accent, palette.accentAlt, palette.accentSoft];

    const railColors: [string, string] = chat.isBot
      ? ["#63B8FF", "rgba(77,124,255,0.30)"]
      : chat.hiddenFromMain
        ? ["rgba(195,157,255,1)", "rgba(140,105,255,0.32)"]
        : [palette.accent, palette.accentSoft];

    const cardGlowColor = chat.isBot
      ? "rgba(99,184,255,0.10)"
      : chat.hiddenFromMain
        ? "rgba(139,105,255,0.14)"
        : "rgba(96,170,255,0.08)";

    const avatarGlowColor = chat.isBot
      ? "rgba(99,184,255,0.18)"
      : chat.hiddenFromMain
        ? "rgba(140,105,255,0.20)"
        : "rgba(116,167,255,0.14)";

    const peerOnline = isMessengerPeerOnline(chat, presenceByUserId);

    return (
      <Pressable
        key={getMainChatRenderKey(chat, index)}
        onPress={() => void openChat(chat)}
        onLongPress={() => setQuickMenuChat(chat)}
        delayLongPress={220}
        style={({ pressed }) => [styles.cardWrap, pressed && styles.rowPressed]}
      >
        <View style={styles.cardShadow} />
        {!hasWallpaper ? (
          <View
            style={[
              styles.cardGlow,
              {
                backgroundColor: cardGlowColor,
              },
            ]}
          />
        ) : null}

        <LinearGradient colors={cardColors} style={styles.card}>
          <View style={[styles.cardGlassLayer, hasWallpaper && styles.wallpaperGlassMuted]} />
          {!hasWallpaper ? <View style={styles.cardShineBlob} /> : null}
          <View
            style={[
              styles.cardHighlightLine,
              hasWallpaper && styles.wallpaperHighlightSoft,
            ]}
          />

          <View style={styles.accentRailWrap}>
            <LinearGradient colors={railColors} style={styles.accentRail} />
          </View>

          <View style={styles.avatarWrap}>
            <View
              style={[
                styles.avatarGlow,
                {
                  backgroundColor: avatarGlowColor,
                },
              ]}
            />
            <View style={styles.avatar}>
              {chat.avatarUri ? (
                <Image source={{ uri: chat.avatarUri }} style={styles.avatarImage} resizeMode="cover" />
              ) : (
                <LinearGradient colors={avatarColors} style={styles.avatarFallback}>
                  <Text style={styles.avatarText}>{chat.avatarLetter || "S"}</Text>
                </LinearGradient>
              )}
            </View>

            {chat.isBot ? (
              <View style={styles.botCornerChip}>
                <Bot size={10} color="#EAF8FF" strokeWidth={2.5} />
              </View>
            ) : null}

            {peerOnline && !chat.isBot ? (
              <View
                style={[
                  styles.onlineDot,
                  {
                    backgroundColor: palette.accent,
                    borderColor: hasWallpaper ? "rgba(4,12,18,0.82)" : "#08231D",
                  },
                ]}
              />
            ) : null}
          </View>

          <View style={styles.cardBody}>
            <View style={styles.topRow}>
              <View style={styles.titleRow}>
                <Text style={styles.title} numberOfLines={1}>
                  {chat.name}
                </Text>

                {chat.isBot ? (
                  <View style={styles.botBadge}>
                    <Bot size={11} color="#DAF2FF" strokeWidth={2.4} />
                    <Text style={styles.botBadgeText}>{texts.botBadge}</Text>
                  </View>
                ) : null}

                {chat.verified ? (
                  <BadgeCheck
                    size={15}
                    color={palette.accentSoft}
                    strokeWidth={2.3}
                    style={styles.verifiedIcon}
                  />
                ) : null}

                {chat.official ? (
                  <View style={styles.officialBadge}>
                    <Text style={styles.officialBadgeText}>{texts.officialBadge}</Text>
                  </View>
                ) : null}
              </View>

              <Text style={styles.time}>{chat.time}</Text>
            </View>

            <View style={styles.bottomRow}>
              <Text style={styles.preview} numberOfLines={2}>
                {chat.preview}
              </Text>

              <View style={styles.trailing}>
                <View style={styles.metaRow}>
                  {chat.pinned ? (
                    <Pin
                      size={13}
                      strokeWidth={2.4}
                      color="#FFE6A6"
                      style={styles.metaIcon}
                    />
                  ) : null}
                  {chat.muted ? (
                    <BellOff
                      size={13}
                      strokeWidth={2.4}
                      color="#D4DBE7"
                      style={styles.metaIcon}
                    />
                  ) : null}
                  {chat.hiddenFromMain ? (
                    <Lock size={13} strokeWidth={2.4} color="#EFE2FF" />
                  ) : null}
                </View>

                {chat.unread > 0 ? (
                  <View style={styles.badgeShadow}>
                    <LinearGradient
                      colors={[palette.accent, palette.accentAlt]}
                      style={styles.badge}
                    >
                      <Text style={styles.badgeText}>{chat.unread}</Text>
                    </LinearGradient>
                  </View>
                ) : null}
              </View>
            </View>
          </View>
        </LinearGradient>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right", "bottom"]}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <DecorativeBackground themeState={themeState} palette={palette}>
        {!hasWallpaper ? (
          <>
            <View style={styles.topGlow} />
            <View style={styles.rightGlow} />
            <View style={styles.bottomGlow} />
          </>
        ) : null}

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.headerRow}>
            <Pressable style={styles.headerButton} onPress={() => router.back()}>
              <View style={styles.headerButtonShadow} />
              <LinearGradient colors={raisedColors} style={styles.headerButtonFill}>
                <ArrowLeft size={20} color={palette.textMain} strokeWidth={2.3} />
              </LinearGradient>
            </Pressable>

            <View style={styles.headerTextWrap}>
              <Text style={styles.headerEyebrow}>{texts.eyebrow}</Text>
              <Text style={styles.headerTitle}>{texts.title}</Text>
            </View>

            <Pressable style={styles.headerButton} onPress={() => setSettingsVisible(true)}>
              <View style={styles.headerButtonShadow} />
              <LinearGradient colors={raisedColors} style={styles.headerButtonFill}>
                <Settings2 size={19} color={palette.textMain} strokeWidth={2.3} />
              </LinearGradient>
            </Pressable>
          </View>

          <View style={styles.searchWrap}>
            <View style={styles.searchShadow} />
            <LinearGradient colors={cardColors} style={styles.searchCard}>
              <View style={[styles.searchGlassLayer, hasWallpaper && styles.wallpaperGlassMuted]} />
              {!hasWallpaper ? <View style={styles.searchInnerGlow} /> : null}
              <View style={styles.searchIconWrap}>
                <Search size={18} color={palette.textSecondary} strokeWidth={2.3} />
              </View>
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder={texts.searchPlaceholder}
                placeholderTextColor="rgba(232,255,246,0.42)"
                style={styles.searchInput}
              />
            </LinearGradient>
          </View>

          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>{texts.title}</Text>

            <View style={styles.statusPillWrap}>
              <View style={styles.statusPillShadow} />
              <View style={styles.statusPill}>
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor: connected
                        ? palette.accent
                        : "rgba(255,255,255,0.36)",
                    },
                  ]}
                />
                <Text style={styles.statusText}>
                  {connected ? texts.online : texts.connecting}
                </Text>
              </View>
            </View>
          </View>

          {filteredChats.length === 0 ? (
            <View style={styles.emptyWrap}>
              <View style={styles.cardShadow} />
              <LinearGradient colors={cardColors} style={styles.emptyCard}>
                <View style={styles.cardGlassLayer} />
                <Text style={styles.emptyTitle}>{texts.emptyTitle}</Text>
                <Text style={styles.emptySubtitle}>{texts.emptySubtitle}</Text>
              </LinearGradient>
            </View>
          ) : (
            filteredChats.map((chat, index) => renderCard(chat, index))
          )}
        </ScrollView>

        <View style={styles.fabZone}>
          <Animated.View
            style={[
              styles.fabGlow,
              fabGlowStyle,
              { backgroundColor: palette.accent },
            ]}
          />
          <Animated.View style={[styles.fabFloat, fabLiftStyle]}>
            <View style={styles.fabShadow} />
            <Pressable
              onPress={() => router.push("/tabs/contacts" as never)}
              style={styles.fabPress}
            >
              <LinearGradient
                colors={[palette.accent, palette.accentAlt]}
                style={styles.fabButton}
              >
                <View style={styles.fabInnerLight} />
                <Feather size={21} color="#061E19" strokeWidth={2.6} />
              </LinearGradient>
            </Pressable>
          </Animated.View>
          <Text style={styles.fabText}>{texts.newChat}</Text>
        </View>

        <Modal
          visible={settingsVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setSettingsVisible(false)}
        >
          <View style={styles.overlayBase}>
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={() => setSettingsVisible(false)}
            />
            <View style={styles.settingsPanelWrap}>
              <View style={styles.popupShadow} />
              <LinearGradient
                colors={["rgba(10,18,30,0.98)", "rgba(8,16,26,0.97)"]}
                style={styles.settingsPanel}
              >
                <QuickActionRow
                  title={texts.privateChats}
                  subtitle={texts.settingsHint}
                  icon={<Lock size={17} color="#E8DEFF" strokeWidth={2.4} />}
                  onPress={() => {
                    setSettingsVisible(false);
                    router.push({
                      pathname: "/private-chats",
                      params: currentUserId ? { userId: currentUserId } : {},
                    } as never);
                  }}
                />
                <QuickActionRow
                  title={texts.themeWallpaper}
                  subtitle={texts.settingsHint}
                  icon={<Palette size={17} color={palette.accentSoft} strokeWidth={2.4} />}
                  onPress={() => {
                    setSettingsVisible(false);
                    router.push("/messenger-theme" as never);
                  }}
                />
              </LinearGradient>
            </View>
          </View>
        </Modal>

        <Modal
          visible={Boolean(quickMenuChat)}
          transparent
          animationType="fade"
          onRequestClose={() => setQuickMenuChat(null)}
        >
          <View style={styles.overlayBase}>
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={() => setQuickMenuChat(null)}
            />
            <View style={styles.quickMenuWrap}>
              <View style={styles.popupShadow} />
              <LinearGradient
                colors={["rgba(10,18,30,0.98)", "rgba(8,16,26,0.97)"]}
                style={styles.quickMenuCard}
              >
                {quickMenuChat ? (
                  <>
                    <QuickActionRow
                      title={quickMenuChat.muted ? texts.unmute : texts.mute}
                      subtitle={texts.active}
                      icon={
                        quickMenuChat.muted ? (
                          <Volume2 size={17} color="#D6FFF0" strokeWidth={2.4} />
                        ) : (
                          <VolumeX size={17} color="#D6FFF0" strokeWidth={2.4} />
                        )
                      }
                      onPress={() =>
                        void runQuickAction(async () => {
                          await messengerKernelFacade.rooms.setMuted(
                            quickMenuChat.id,
                            !quickMenuChat.muted,
                          );
                        })
                      }
                    />
                    <QuickActionRow
                      title={quickMenuChat.pinned ? texts.unpin : texts.pin}
                      subtitle={texts.active}
                      icon={<Pin size={17} color="#FFE7A9" strokeWidth={2.4} />}
                      onPress={() =>
                        void runQuickAction(async () => {
                          await messengerKernelFacade.rooms.setPinned(
                            quickMenuChat.id,
                            !quickMenuChat.pinned,
                          );
                        })
                      }
                    />
                    <QuickActionRow
                      title={
                        quickMenuChat.unread > 0 ? texts.markRead : texts.markUnread
                      }
                      subtitle={
                        quickMenuChat.unread > 0
                          ? String(quickMenuChat.unread)
                          : texts.active
                      }
                      icon={
                        quickMenuChat.unread > 0 ? (
                          <BookCheck size={17} color="#C8FFE8" strokeWidth={2.4} />
                        ) : (
                          <BookMarked size={17} color="#C8FFE8" strokeWidth={2.4} />
                        )
                      }
                      onPress={() =>
                        void runQuickAction(async () => {
                          if (quickMenuChat.unread > 0) {
                            await messengerKernelFacade.rooms.markRead(quickMenuChat.id);
                            await markPersistedChatRoomRead(quickMenuChat.id, currentUserId);
                          } else {
                            await messengerKernelFacade.rooms.markUnread(quickMenuChat.id, 1);
                          }
                        })
                      }
                    />
                    <QuickActionRow
                      title={
                        quickMenuChat.hiddenFromMain
                          ? texts.mainChats
                          : texts.privateChats
                      }
                      subtitle={texts.settingsHint}
                      icon={
                        quickMenuChat.hiddenFromMain ? (
                          <PanelRightOpen
                            size={17}
                            color="#E7DDFF"
                            strokeWidth={2.4}
                          />
                        ) : (
                          <PanelRightClose
                            size={17}
                            color="#E7DDFF"
                            strokeWidth={2.4}
                          />
                        )
                      }
                      onPress={() =>
                        void runQuickAction(async () => {
                          await messengerKernelFacade.rooms.setHidden(
                            quickMenuChat.id,
                            !quickMenuChat.hiddenFromMain,
                          );
                        })
                      }
                    />
                    <QuickActionRow
                      title={texts.deleteChat}
                      subtitle={quickMenuChat.name}
                      icon={<Trash2 size={17} color="#FFB8C4" strokeWidth={2.4} />}
                      danger
                      onPress={() =>
                        Alert.alert(texts.deleteChat, quickMenuChat.name, [
                          { text: texts.close, style: "cancel" },
                          {
                            text: texts.deleteChat,
                            style: "destructive",
                            onPress: () => {
                              void runQuickAction(async () => {
                                await messengerKernelFacade.rooms.setDeleted(quickMenuChat.id, true);
                              });
                            },
                          },
                        ])
                      }
                    />
                  </>
                ) : null}
              </LinearGradient>
            </View>
          </View>
        </Modal>
      </DecorativeBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create<any>({
  safeArea: {
    flex: 1,
    backgroundColor: "#03110E",
  },
  background: {
    flex: 1,
  },
  textureGrid: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.04,
    backgroundColor: "transparent",
  },
  topGlow: {
    position: "absolute",
    top: -90,
    right: -30,
    width: 260,
    height: 260,
    borderRadius: 260,
    backgroundColor: "rgba(80,165,255,0.12)",
  },
  rightGlow: {
    position: "absolute",
    top: 170,
    right: -90,
    width: 260,
    height: 260,
    borderRadius: 260,
    backgroundColor: "rgba(140,105,255,0.14)",
  },
  bottomGlow: {
    position: "absolute",
    bottom: -90,
    left: -70,
    width: 260,
    height: 260,
    borderRadius: 260,
    backgroundColor: "rgba(72,136,255,0.12)",
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 126,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerButton: {
    width: 48,
    height: 48,
  },
  headerButtonShadow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.22)",
    transform: [{ translateY: 7 }, { scaleX: 0.92 }],
  },
  headerButtonFill: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  headerTextWrap: {
    flex: 1,
    paddingHorizontal: 10,
  },
  headerEyebrow: {
    color: TEXT_SECONDARY,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  headerTitle: {
    color: TEXT_MAIN,
    fontSize: 27,
    fontWeight: "900",
    marginTop: 3,
  },
  searchWrap: {
    marginTop: 14,
    borderRadius: 22,
  },
  searchShadow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.22)",
    transform: [{ translateY: 9 }, { scaleX: 0.97 }],
  },
  searchCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    paddingHorizontal: 14,
    paddingVertical: 12,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
  },
  searchGlassLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.018)",
  },
  searchInnerGlow: {
    position: "absolute",
    top: -18,
    right: -10,
    width: 120,
    height: 80,
    borderRadius: 80,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  searchIconWrap: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: TEXT_MAIN,
    fontSize: 15,
    fontWeight: "700",
  },
  sectionRow: {
    marginTop: 18,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: TEXT_MAIN,
    fontSize: 20,
    fontWeight: "900",
  },
  statusPillWrap: {
    position: "relative",
  },
  statusPillShadow: {
    position: "absolute",
    right: 0,
    width: 128,
    height: 32,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.22)",
    transform: [{ translateY: 7 }, { scaleX: 0.95 }],
  },
  statusPill: {
    minHeight: 32,
    minWidth: 128,
    borderRadius: 999,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    backgroundColor: "rgba(255,255,255,0.05)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 8,
    marginRight: 7,
  },
  statusText: {
    color: TEXT_SECONDARY,
    fontSize: 12,
    fontWeight: "800",
  },
  emptyWrap: {
    borderRadius: 26,
  },
  emptyCard: {
    borderRadius: 26,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    overflow: "hidden",
    paddingHorizontal: 18,
    paddingVertical: 24,
    alignItems: "center",
  },
  emptyTitle: {
    color: TEXT_MAIN,
    fontSize: 16,
    fontWeight: "900",
    marginTop: 2,
  },
  emptySubtitle: {
    marginTop: 8,
    color: TEXT_SECONDARY,
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
    fontWeight: "700",
  },
  cardWrap: {
    marginBottom: 12,
    borderRadius: 26,
  },
  rowPressed: {
    transform: [{ scale: 0.988 }],
  },
  cardShadow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 26,
    backgroundColor: "rgba(0,0,0,0.22)",
    transform: [{ translateY: 10 }, { scaleX: 0.96 }],
  },
  cardGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 26,
  },
  card: {
    borderRadius: 26,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    paddingHorizontal: 14,
    paddingVertical: 14,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  cardGlassLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.016)",
  },
  wallpaperGlassMuted: {
    backgroundColor: "rgba(255,255,255,0.006)",
  },
  wallpaperHighlightSoft: {
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  cardShineBlob: {
    position: "absolute",
    top: -24,
    right: -14,
    width: 104,
    height: 66,
    borderRadius: 66,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  cardHighlightLine: {
    position: "absolute",
    left: 14,
    right: 14,
    top: 0,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  accentRailWrap: {
    position: "absolute",
    left: 0,
    top: 18,
    bottom: 18,
    width: 5,
    justifyContent: "center",
  },
  accentRail: {
    flex: 1,
    borderTopRightRadius: 999,
    borderBottomRightRadius: 999,
  },
  avatarWrap: {
    width: 54,
    height: 54,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarGlow: {
    position: "absolute",
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarFallback: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#F7FFFC",
    fontSize: 18,
    fontWeight: "900",
  },
  botCornerChip: {
    position: "absolute",
    right: 1,
    bottom: 1,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "rgba(55,111,255,0.92)",
    borderWidth: 1,
    borderColor: "rgba(235,246,255,0.34)",
    alignItems: "center",
    justifyContent: "center",
  },
  onlineDot: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 13,
    height: 13,
    borderRadius: 999,
    borderWidth: 2.5,
    shadowColor: "#50F2A6",
    shadowOpacity: 0.42,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  cardBody: {
    flex: 1,
    minWidth: 0,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 8,
    flexWrap: "wrap",
  },
  title: {
    color: TEXT_MAIN,
    fontSize: 16,
    fontWeight: "900",
    maxWidth: "72%",
  },
  botBadge: {
    marginLeft: 8,
    minHeight: 20,
    borderRadius: 999,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(88,154,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(160,220,255,0.20)",
    flexDirection: "row",
    gap: 4,
  },
  botBadgeText: {
    color: "#DDF4FF",
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  verifiedIcon: {
    marginLeft: 6,
  },
  officialBadge: {
    marginLeft: 8,
    minHeight: 20,
    borderRadius: 999,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  officialBadgeText: {
    color: TEXT_MAIN,
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  time: {
    color: TEXT_MUTED,
    fontSize: 11,
    fontWeight: "800",
  },
  bottomRow: {
    marginTop: 7,
    flexDirection: "row",
    alignItems: "flex-end",
  },
  preview: {
    flex: 1,
    paddingRight: 12,
    color: TEXT_SECONDARY,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
  },
  trailing: {
    alignItems: "flex-end",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  metaIcon: {
    marginRight: 6,
  },
  badgeShadow: {
    shadowColor: "#39BDF8",
    shadowOpacity: 0.24,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  badge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    paddingHorizontal: 7,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "#051917",
    fontSize: 11,
    fontWeight: "900",
  },
  fabZone: {
    position: "absolute",
    right: 18,
    bottom: 16,
    alignItems: "center",
  },
  fabGlow: {
    position: "absolute",
    width: 76,
    height: 76,
    borderRadius: 38,
    bottom: 22,
  },
  fabFloat: {
    position: "relative",
  },
  fabShadow: {
    position: "absolute",
    left: 2,
    right: 2,
    top: 8,
    bottom: -2,
    borderRadius: 32,
    backgroundColor: "rgba(0,0,0,0.26)",
    transform: [{ scaleX: 0.88 }],
  },
  fabPress: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: "hidden",
  },
  fabButton: {
    flex: 1,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  fabInnerLight: {
    position: "absolute",
    top: 2,
    left: 10,
    right: 10,
    height: 18,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  fabText: {
    marginTop: 8,
    color: TEXT_MAIN,
    fontSize: 12,
    fontWeight: "900",
  },
  overlayBase: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: "rgba(2,8,13,0.40)",
  },
  settingsPanelWrap: {
    alignItems: "flex-end",
    marginTop: 90,
    justifyContent: "flex-start",
  },
  popupShadow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
    backgroundColor: "rgba(0,0,0,0.26)",
    transform: [{ translateY: 10 }, { scaleX: 0.96 }],
  },
  settingsPanel: {
    width: 260,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(214,231,255,0.10)",
    padding: 10,
    overflow: "hidden",
  },
  quickMenuWrap: {
    justifyContent: "center",
  },
  quickMenuCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(214,231,255,0.10)",
    padding: 10,
    overflow: "hidden",
  },
  popupItemWrap: {
    borderRadius: 16,
    marginTop: 8,
  },
  popupItem: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  popupIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  popupIconDanger: {
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  popupTextWrap: {
    flex: 1,
  },
  popupTitle: {
    color: TEXT_MAIN,
    fontSize: 14,
    fontWeight: "900",
  },
  popupTitleDanger: {
    color: "#FFE9ED",
  },
  popupSubtitle: {
    marginTop: 4,
    color: TEXT_SECONDARY,
    fontSize: 11,
    fontWeight: "700",
  },
});











