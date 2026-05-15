import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  ImageBackground,
  Modal,
  Pressable,
  ScrollView,
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
  Lock,
  MessageCircleMore,
  Palette,
  PanelRightClose,
  PanelRightOpen,
  Pin,
  Search,
  Settings2,
  Trash2,
  Users,
  Volume2,
  VolumeX,
  X,
} from "lucide-react-native";

import { useI18n } from "../../src/shared/i18n";
import { profileKernelFacade } from "../../src/core/kernel/profile";
import { messengerKernelFacade, type MessengerKernelRoomSnapshot } from "../../src/core/kernel/messenger/facade";
import {
  getMessengerThemePalette,
  getMessengerThemeState,
  hydrateMessengerThemeState,
  type MessengerThemePalette,
  type MessengerThemeState,
} from "../../src/modules/messenger/theme/messengerThemeRuntime";
import { hydrateGroupPublicProfile } from "../../src/modules/messenger/groups/groupPublicProfileRuntime";
import { openMessengerRoom } from "../../src/modules/messenger/navigation/messengerRoomNavigation";
import {
  compareSabiPublicDirectoryPromotion,
  listSabiPublicDirectory,
  openSabiPublicDirectoryItem,
  searchSabiPublicDirectory,
  type SabiPublicDirectoryItem,
} from "../../src/modules/messenger/public-directory";

type RouteParams = {
  userId?: string;
  source?: string;
};

type GroupItem = {
  id: string;
  name: string;
  preview: string;
  time: string;
  unread: number;
  verified?: boolean;
  subtitle?: string;
  avatarLetter?: string;
  avatarUrl?: string;
  updatedAt?: string;
  muted?: boolean;
  pinned?: boolean;
  hiddenFromMain?: boolean;
  membersCount?: number;
  ownerUserId?: string;
  ownerName?: string;
  joinMode?: "open" | "request";
  isMember?: boolean;
  isOwner?: boolean;
  isAdmin?: boolean;
  hasPendingJoinRequest?: boolean;
  localProfileGroupOwner?: boolean;
  publicDirectoryItem?: SabiPublicDirectoryItem;
};

type PersistedUiMessage = {
  id?: string;
  text?: string;
  time?: string;
  previewTitle?: string;
  kind?: string;
};

function mapSabiDirectoryGroupItem(
  item: SabiPublicDirectoryItem,
  language: string,
  labels: { groupPreview: string; members: string },
): GroupItem | null {
  const id = String(item.chatId || item.roomId || item.groupId || item.id || "").trim();
  const name = String(item.title || item.name || "").trim();
  if (!id || !name) return null;

  const updatedAt = typeof item.updatedAt === "string" && item.updatedAt.trim() ? item.updatedAt.trim() : new Date().toISOString();
  const memberCount = Number((item as any).memberCount || (item as any).membersCount || 0);
  const description = typeof item.description === "string" ? item.description.trim() : "";
  const subtitle = memberCount > 0 ? `${memberCount} ${labels.members}${description ? ` · ${description}` : ""}` : description || labels.groupPreview;

  return {
    id,
    name,
    preview: description || labels.groupPreview,
    time: formatTime(updatedAt, language),
    unread: 0,
    verified: Boolean((item as any).verified || item.recommended || item.promotionPlacement === "featured"),
    subtitle,
    avatarLetter: getAvatarLetter(name),
    avatarUrl: item.avatarUrl || item.avatarUri || item.photoUrl || undefined,
    updatedAt,
    membersCount: Number.isFinite(memberCount) && memberCount > 0 ? memberCount : undefined,
    ownerUserId: item.ownerUserId || item.createdBy || undefined,
    joinMode: item.joinMode === "request" ? "request" : "open",
    isMember: false,
    isOwner: false,
    isAdmin: false,
    localProfileGroupOwner: false,
    publicDirectoryItem: item,
  };
}

function mergeSabiDirectoryGroups(localItems: GroupItem[], directoryItems: GroupItem[]) {
  const byId = new Map<string, GroupItem>();
  for (const item of directoryItems) byId.set(item.id, item);
  for (const item of localItems) byId.set(item.id, { ...byId.get(item.id), ...item, publicDirectoryItem: item.publicDirectoryItem || byId.get(item.id)?.publicDirectoryItem });
  return Array.from(byId.values()).sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;

    const promotionOrder = compareSabiPublicDirectoryPromotion(a.publicDirectoryItem, b.publicDirectoryItem);
    if (promotionOrder !== 0) return promotionOrder;

    return String(b.updatedAt ?? "").localeCompare(String(a.updatedAt ?? ""));
  });
}


type ChatRoomMetaSnapshot = MessengerKernelRoomSnapshot;
function withAlpha(color: string, alpha: number) {
  const safeAlpha = Math.max(0, Math.min(1, alpha));
  const value = String(color || "").trim();

  if (value.startsWith("#")) {
    let hex = value.slice(1);

    if (hex.length === 3 || hex.length === 4) {
      hex = hex
        .slice(0, 3)
        .split("")
        .map((char) => char + char)
        .join("");
    } else if (hex.length === 8) {
      hex = hex.slice(0, 6);
    }

    if (hex.length === 6) {
      const r = Number.parseInt(hex.slice(0, 2), 16);
      const g = Number.parseInt(hex.slice(2, 4), 16);
      const b = Number.parseInt(hex.slice(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${safeAlpha})`;
    }
  }

  const rgbMatch = value.match(/^rgb\(\s*(\d+),\s*(\d+),\s*(\d+)\s*\)$/i);
  if (rgbMatch) {
    return `rgba(${rgbMatch[1]}, ${rgbMatch[2]}, ${rgbMatch[3]}, ${safeAlpha})`;
  }

  const rgbaMatch = value.match(
    /^rgba\(\s*(\d+),\s*(\d+),\s*(\d+),\s*([0-9.]+)\s*\)$/i,
  );
  if (rgbaMatch) {
    return `rgba(${rgbaMatch[1]}, ${rgbaMatch[2]}, ${rgbaMatch[3]}, ${safeAlpha})`;
  }

  return value;
}


// SABI_GROUPS_PROFILE_ROOM_SYNC
function sabiGroupText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function sabiGroupChatId(group: Record<string, unknown>) {
  const linked = sabiGroupText(group.linkedChatId);
  if (linked) return linked;

  const id = sabiGroupText(group.groupId) || sabiGroupText(group.id);
  if (id) return `group:${id}`;

  const username = sabiGroupText(group.username).replace(/^@+/, "");
  if (username) return `group:${username}`;

  const name = sabiGroupText(group.groupName) || sabiGroupText(group.name);
  const slug = name.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-+|-+$/g, "");
  return slug ? `group:${slug}` : "";
}

async function sabiSyncProfileGroupsToRooms(currentUserId?: string): Promise<ChatRoomMetaSnapshot[]> {
  try {
    await profileKernelFacade.boot();
    const collection = profileKernelFacade.selectors.groupProfiles();
    const items = Array.isArray((collection as any)?.items) ? (collection as any).items : [];
    const rooms: ChatRoomMetaSnapshot[] = [];

    for (const raw of items) {
      if (!raw || typeof raw !== "object") continue;
      const group = raw as Record<string, unknown>;
      if (group.created !== true) continue;

      const name = sabiGroupText(group.groupName) || sabiGroupText(group.name);
      const chatId = sabiGroupChatId(group);
      if (!name || !chatId) continue;

      const ownerUserId = sabiGroupText(group.ownerUserId) || currentUserId || "";
      const memberIds = Array.from(new Set([currentUserId, ownerUserId].filter(Boolean)));
      const room = {
        chatId,
        roomId: chatId,
        id: chatId,
        name,
        title: name,
        subtitle: sabiGroupText(group.description) || "Group",
        roomType: "group",
        type: "group",
        verified: Boolean(group.isPublished || group.verified),
        avatarLetter: getAvatarLetter(name),
        avatarUrl: sabiGroupText(group.avatarUri) || undefined,
        photoUrl: sabiGroupText(group.avatarUri) || undefined,
        coverUrl: sabiGroupText(group.coverUri) || undefined,
        currentUserId: currentUserId || ownerUserId || undefined,
        ownerUserId: ownerUserId || undefined,
        username: sabiGroupText(group.username) || undefined,
        searchableInDirectory: true,
        localProfileGroupOwner: true,
        memberIds: JSON.stringify(memberIds),
        adminIds: JSON.stringify(Array.from(new Set([currentUserId, ownerUserId].filter(Boolean)))),
        membershipStatus: "member",
        canSendMessages: "1",
        groupAccess: "member",
        joinMode: group.allowJoinRequests === true ? "request" : "open",
        updatedAt: new Date().toISOString(),
      } as any;

      rooms.push(room);
      try { await messengerKernelFacade.ensureRoomSnapshot(room); } catch {}
    }

    return rooms;
  } catch {
    return [];
  }
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

function getAvatarLetter(name?: string | null) {
  const source = String(name ?? "").trim();
  const match = source.replace(/^[^\p{L}\p{N}]+/u, "").charAt(0);
  return String(match || "G").toUpperCase();
}

function getMessagePreview(
  message: PersistedUiMessage | undefined,
  fallback: string,
  labels: Record<string, string>,
) {
  if (!message) return fallback;
  if (typeof message.text === "string" && message.text.trim()) return message.text.trim();
  if (typeof message.previewTitle === "string" && message.previewTitle.trim()) {
    return message.previewTitle.trim();
  }
  return labels[message.kind || ""] || fallback;
}

function parseMembersCount(subtitle?: string | null) {
  const raw = String(subtitle ?? "");
  const match = raw.match(/(\d{1,5})/);
  return match ? Number.parseInt(match[1], 10) : undefined;
}

function buildGroupSubtitle(description: string, membersCount: number, membersLabel: string) {
  const countPart = `${membersCount} ${membersLabel}`;
  if (description.trim()) return `${countPart} В· ${description.trim()}`;
  return countPart;
}

type ProfileGroupRuntimeState = {
  created?: boolean;
  groupId?: string;
  groupName?: string;
  username?: string;
  description?: string;
  ownerUserId?: string;
  ownerName?: string;
  linkedChatId?: string;
  isPublished?: boolean;
  isPublic?: boolean;
  searchableInDirectory?: boolean;
  allowJoinRequests?: boolean;
  avatarUri?: string;
  coverUri?: string;
  admins?: unknown[];
  members?: unknown[];
  joinRequests?: unknown[];
  blacklist?: unknown[];
};

function readProfileGroupString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function readProfileGroupBoolean(value: unknown, fallback = false) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "1", "yes", "open"].includes(normalized)) return true;
    if (["false", "0", "no", "request"].includes(normalized)) return false;
  }
  return fallback;
}

function readProfileGroupArray(value: unknown) {
  return Array.isArray(value) ? value : [];
}

function readProfileEntityId(value: unknown) {
  const record = value && typeof value === "object" ? (value as Record<string, unknown>) : null;
  return readProfileGroupString(record?.userId) || readProfileGroupString(record?.id);
}

function getProfileGroupJoinMode(group: ProfileGroupRuntimeState): "open" | "request" {
  const isPublic = readProfileGroupBoolean(group.isPublic, false);
  const allowJoinRequests = readProfileGroupBoolean(group.allowJoinRequests, !isPublic);
  return isPublic && !allowJoinRequests ? "open" : "request";
}

function getProfileGroupMemberIds(group: ProfileGroupRuntimeState) {
  return readProfileGroupArray(group.members).map(readProfileEntityId).filter(Boolean);
}

function getProfileGroupAdminIds(group: ProfileGroupRuntimeState) {
  return readProfileGroupArray(group.admins).map(readProfileEntityId).filter(Boolean);
}

function getProfileGroupJoinRequestIds(group: ProfileGroupRuntimeState) {
  return readProfileGroupArray(group.joinRequests).map(readProfileEntityId).filter(Boolean);
}

function getCurrentUserDisplayName(userId: string) {
  const trimmed = String(userId || "").trim();
  if (!trimmed) return "User";
  return trimmed;
}

function resolveCurrentGroupsUserId(paramUserId?: string) {
  const routeUserId = String(paramUserId || "").trim();
  if (routeUserId) return routeUserId;

  const globalUserId =
    typeof globalThis !== "undefined" &&
    typeof (globalThis as { __SABI_USER_ID__?: string }).__SABI_USER_ID__ === "string"
      ? String((globalThis as { __SABI_USER_ID__?: string }).__SABI_USER_ID__ || "").trim()
      : "";
  if (globalUserId) return globalUserId;

  try {
    return messengerKernelFacade.selectors.currentUserId() || "";
  } catch {
    return "";
  }
}


function normalizeProfileGroupHandle(value: string) {
  const raw = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/^@+/, "")
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return raw;
}

function buildProfileGroupChatId(group: ProfileGroupRuntimeState) {
  const linkedChatId = readProfileGroupString(group.linkedChatId);
  if (linkedChatId) return linkedChatId;

  const groupId = readProfileGroupString(group.groupId);
  if (groupId) return `group:${groupId}`;

  const username = normalizeProfileGroupHandle(readProfileGroupString(group.username || group.groupName));
  if (username) return `group:${username}`;

  return "";
}

function countProfileGroupParticipants(group: ProfileGroupRuntimeState) {
  const ids = new Set<string>();
  const ownerUserId = readProfileGroupString(group.ownerUserId) || resolveCurrentGroupsUserId();
  if (ownerUserId) ids.add(ownerUserId);

  const collect = (items: unknown[] | undefined) => {
    if (!Array.isArray(items)) return;
    items.forEach((item) => {
      const record = item && typeof item === "object" ? (item as Record<string, unknown>) : null;
      const id = readProfileGroupString(record?.id);
      if (id) ids.add(id);
    });
  };

  collect(group.admins);
  collect(group.members);

  return Math.max(1, ids.size || 1);
}

async function syncProfileGroupsToMessengerRuntime(membersLabel: string, currentUserId?: string) {
  try {
    await profileKernelFacade.boot();
    const collection = profileKernelFacade.selectors.groupProfiles();
    const items = Array.isArray(collection?.items)
      ? (collection.items as ProfileGroupRuntimeState[])
      : [];

    for (const group of items) {
      const name = readProfileGroupString(group.groupName);
      if (!group?.created || !name) continue;

      const chatId = buildProfileGroupChatId(group);
      if (!chatId) continue;

      const description = readProfileGroupString(group.description);
      const membersCount = countProfileGroupParticipants(group);
      await messengerKernelFacade.ensureRoomSnapshot({
        chatId,
        name,
        subtitle: buildGroupSubtitle(description, membersCount, membersLabel),
        roomType: "group",
        verified: Boolean(group.isPublished),
        avatarLetter: getAvatarLetter(name),
        avatarUrl: readProfileGroupString(group.avatarUri) || undefined,
        photoUrl: readProfileGroupString(group.avatarUri) || undefined,
        coverUrl: readProfileGroupString(group.coverUri) || undefined,
        currentUserId: resolveCurrentGroupsUserId(currentUserId) || readProfileGroupString(group.ownerUserId) || undefined,
        ownerUserId: readProfileGroupString(group.ownerUserId) || resolveCurrentGroupsUserId(currentUserId) || undefined,
        ownerName: readProfileGroupString(group.ownerName) || undefined,
localProfileGroupOwner: true,
memberIds: JSON.stringify(Array.from(new Set([readProfileGroupString(group.ownerUserId), currentUserId, ...getProfileGroupMemberIds(group)].filter(Boolean)))),
adminIds: JSON.stringify(Array.from(new Set([readProfileGroupString(group.ownerUserId), currentUserId, ...getProfileGroupAdminIds(group)].filter(Boolean)))),
        isPublic: readProfileGroupBoolean(group.isPublic, false),
        searchableInDirectory: true,
        allowJoinRequests: getProfileGroupJoinMode(group) === "request",
        joinMode: getProfileGroupJoinMode(group),
        
        
        joinRequestIds: JSON.stringify(getProfileGroupJoinRequestIds(group)),
        messagePolicy: getProfileGroupJoinMode(group) === "open" ? "members" : "members",
        antiAdModeration: true,
      } as any);
    }
  } catch {
    // The list screen must still open even if the profile runtime is not hydrated yet.
  }
}

function parseStringList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((item) => String(item || "").trim()).filter(Boolean);
  if (typeof value !== "string" || !value.trim()) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map((item) => String(item || "").trim()).filter(Boolean) : [];
  } catch {
    return value.split(",").map((item) => item.trim()).filter(Boolean);
  }
}

function getRoomJoinMode(room: ChatRoomMetaSnapshot): "open" | "request" {
  const raw = String((room as Record<string, unknown>).joinMode || "").trim();
  if (raw === "open" || raw === "request") return raw;
  const isPublic = readProfileGroupBoolean((room as Record<string, unknown>).isPublic, false);
  const allowJoinRequests = readProfileGroupBoolean(
    (room as Record<string, unknown>).allowJoinRequests,
    !isPublic,
  );
  return isPublic && !allowJoinRequests ? "open" : "request";
}

async function buildPersistedGroupItems(
  rooms: ChatRoomMetaSnapshot[],
  language: string | undefined,
  texts: Record<string, string>,
  currentUserId?: string,
): Promise<GroupItem[]> {
  const groupRooms = rooms.filter((room) => room.roomType === "group");

  const mapped = await Promise.all(
    groupRooms.map(async (room) => {
      const messages = await messengerKernelFacade.listRoomPreviewMessages(room.chatId);
      const lastMessage = messages[messages.length - 1];

      const sharedProfile = hydrateGroupPublicProfile(room.chatId);
      const avatarUrl =
        typeof sharedProfile?.avatarUri === "string" && sharedProfile.avatarUri.trim()
          ? sharedProfile.avatarUri.trim()
          : "";

      const roomRecord = room as Record<string, unknown>;
      const ownerUserId = readProfileGroupString(roomRecord.ownerUserId);
      const ownerName = readProfileGroupString(roomRecord.ownerName);
      const memberIds = parseStringList(roomRecord.memberIds);
      const adminIds = parseStringList(roomRecord.adminIds);
      const joinRequestIds = parseStringList(roomRecord.joinRequestIds);
      const resolvedCurrentUserId = readProfileGroupString(currentUserId);
      const isLocalProfileGroupOwner = readProfileGroupBoolean(roomRecord.localProfileGroupOwner, false);
      const isOwner = Boolean(isLocalProfileGroupOwner || (ownerUserId && resolvedCurrentUserId && ownerUserId === resolvedCurrentUserId));
      const isAdmin = Boolean(resolvedCurrentUserId && adminIds.includes(resolvedCurrentUserId));
      const isMember = Boolean(isLocalProfileGroupOwner || isOwner || isAdmin || (resolvedCurrentUserId && memberIds.includes(resolvedCurrentUserId)));

      return {
        id: room.chatId,
        name: room.name,
        preview: getMessagePreview(lastMessage, texts.groupPreview, {
          photo: texts.photo,
          video: texts.video,
          document: texts.document,
          contact: texts.contact,
          location: texts.location,
          gift: texts.gift,
          audio: texts.voice,
        }),
        time: lastMessage?.time || formatTime(room.updatedAt, language),
        unread: 0,
        verified: Boolean(room.verified),
        subtitle: room.subtitle ?? undefined,
        avatarLetter: room.avatarLetter || getAvatarLetter(room.name),
        avatarUrl,
        updatedAt: room.updatedAt,
        membersCount: parseMembersCount(room.subtitle),
        ownerUserId,
        ownerName,
        joinMode: getRoomJoinMode(room),
        isOwner,
        isAdmin,
        isMember,
        localProfileGroupOwner: isLocalProfileGroupOwner,
        hasPendingJoinRequest: Boolean(resolvedCurrentUserId && joinRequestIds.includes(resolvedCurrentUserId)),
      } satisfies GroupItem;
    }),
  );

  return mapped;
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
          colors={[
            withAlpha(palette.background[0] || "#06080E", 0.18),
            withAlpha(palette.background[1] || "#06080E", 0.24),
            withAlpha(palette.background[0] || "#06080E", 0.30),
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.absoluteFill}
        />
        {children}
      </ImageBackground>
    );
  }

  return (
    <View style={styles.background}>
      <LinearGradient colors={palette.background} style={styles.absoluteFill} />
      <View style={styles.textureGrid} />
      {children}
    </View>
  );
}

function QuickActionRow({
  title,
  subtitle,
  icon,
  onPress,
  danger = false,
  colors,
}: {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  onPress: () => void;
  danger?: boolean;
  colors: {
    surfaceBorder: string;
    mainText: string;
    secondaryText: string;
    raisedColors: [string, string];
  };
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [pressed ? styles.rowPressed : undefined]}>
      <LinearGradient
        colors={
          danger
            ? ["rgba(109,24,38,0.96)", "rgba(62,15,24,0.94)"]
            : colors.raisedColors
        }
        style={[
          styles.popupItem,
          { borderColor: danger ? "rgba(255,184,196,0.18)" : colors.surfaceBorder },
        ]}
      >
        <View
          style={[
            styles.popupIcon,
            {
              backgroundColor: danger
                ? "rgba(255,255,255,0.08)"
                : withAlpha(colors.mainText, 0.06),
            },
          ]}
        >
          {icon}
        </View>
        <View style={styles.popupTextWrap}>
          <Text style={[styles.popupTitle, { color: danger ? "#FFE9ED" : colors.mainText }]}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={[styles.popupSubtitle, { color: withAlpha(colors.secondaryText, 0.82) }]}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </LinearGradient>
    </Pressable>
  );
}

export default function GroupsScreen() {
  const params = useLocalSearchParams<RouteParams>();
  const { language, t } = useI18n();

  const currentUserId = resolveCurrentGroupsUserId(
    typeof params.userId === "string" ? params.userId : undefined,
  );

  const [themeState, setThemeState] = useState<MessengerThemeState>(getMessengerThemeState());
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [quickMenuGroup, setQuickMenuGroup] = useState<GroupItem | null>(null);
  const [connected, setConnected] = useState(false);
  const [query, setQuery] = useState("");
  const [groups, setGroups] = useState<GroupItem[]>([]);

  const palette = useMemo<MessengerThemePalette>(
    () => getMessengerThemePalette(themeState.themeId),
    [themeState.themeId],
  );

  const hasWallpaper = Boolean(themeState.wallpaperUri);

  const mainText = palette.textMain || "#F8FBFF";
  const secondaryText = palette.textSecondary || "rgba(236,244,255,0.76)";
  const glassBorder = withAlpha(mainText, 0.10);
  const softBorder = withAlpha(mainText, 0.08);

  const cardColors: [string, string] = hasWallpaper
    ? [
        withAlpha(palette.background[0] || "#08111A", 0.42),
        withAlpha(palette.background[1] || "#08111A", 0.28),
      ]
    : palette.surface;

  const raisedColors: [string, string] = hasWallpaper
    ? [withAlpha(mainText, 0.08), withAlpha(mainText, 0.03)]
    : palette.surfaceRaised;

  const sheetColors: [string, string] = hasWallpaper
    ? [
        withAlpha(palette.background[0] || "#07110F", 0.94),
        withAlpha(palette.background[1] || "#07110F", 0.90),
      ]
    : palette.surface;

  const modalBackdropColors: [string, string] = hasWallpaper
    ? [
        withAlpha(palette.background[0] || "#07110F", 0.99),
        withAlpha(palette.background[1] || "#07110F", 0.98),
      ]
    : [
        palette.background[0] || "#07110F",
        palette.background[1] || palette.background[0] || "#07110F",
      ];

  const accentSoftBg = withAlpha(palette.accent, hasWallpaper ? 0.14 : 0.18);
  const accentBorder = withAlpha(palette.accentAlt || palette.accentSoft, hasWallpaper ? 0.18 : 0.26);

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

  const texts = useMemo(
    () => ({
      title: txAny(["messenger.groups", "common.groups"], "Guruhlar"),
      eyebrow: "Sabi Messenger",
      linkedHint: txAny(
        ["messenger.groupsLinkedHint"],
        "Profilda yaratilgan guruhlar shu yerda ko‘rinadi va Messenger xonasida ochiladi.",
      ),
      settings: txAny(["settings.title", "common.settings"], "Sozlamalar"),
      themeWallpaper: txAny(["messenger.themeWallpaper", "common.theme"], "Mavzu va fon rasmi"),
      privateGroups: txAny(["messenger.privateGroups", "common.private"], "Shaxsiy guruhlar"),
      online: txAny(["common.online", "messenger.online"], "Onlayn"),
      connecting: txAny(["common.connecting"], "Ulanmoqda"),
      search: txAny(["common.search"], "Qidirish"),
      emptyTitle: txAny(["messenger.emptyGroupsTitle"], "Hozircha guruhlar yo‘q"),
      emptySubtitle: txAny(
        ["messenger.emptyGroupsSubtitle"],
        "Guruhlarni guruh profilidan yarating, ular shu yerda avtomatik ko‘rinadi.",
      ),
      groupPreview: txAny(["messenger.chat.groupRoom", "common.groups"], "Guruh"),
      photo: txAny(["messenger.chat.photoTitle", "messenger.photo"], "Rasm"),
      video: txAny(["messenger.chat.videoTitle", "messenger.video"], "Video"),
      document: txAny(["messenger.chat.documentTitle", "messenger.document"], "Hujjat"),
      contact: txAny(["messenger.chat.contactTitle", "messenger.contact"], "Kontakt"),
      location: txAny(["messenger.chat.locationTitle", "messenger.location"], "Joylashuv"),
      gift: txAny(["gifts.title"], "Sovg‘a"),
      voice: txAny(["messenger.chat.voiceTitle", "messenger.voiceMessage"], "Ovozli xabar"),
      close: txAny(["common.close"], "Yopish"),
      openGroup: txAny(["messenger.openGroup", "common.open"], "Guruhni ochish"),
      joinGroup: txAny(["messenger.joinGroup"], "Guruhga kirish"),
      requestJoin: txAny(["messenger.requestJoinGroup"], "Ruxsat so‘rash"),
      requestSent: txAny(["messenger.requestSent"], "So‘rov yuborildi"),
      requestSentMessage: txAny(["messenger.requestSentMessage"], "So‘rovni egasi yoki guruh admini tasdiqlashi kerak."),
      missingUser: txAny(["messenger.missingUser"], "Foydalanuvchi ID kerak."),
      directoryUnavailable: txAny(["messenger.directoryUnavailable", "common.unavailable"], "Hozir ochib bo‘lmaydi"),
      directoryUnavailableMessage: txAny(
        ["messenger.directoryUnavailableMessage"],
        "Bu yozuv hozir yopilgan yoki admin tekshiruvida.",
      ),
      members: txAny(["common.members", "messenger.members"], "a’zolar"),
      mute: txAny(["messenger.menu.mute", "messenger.muteChat"], "Ovozsiz qilish"),
      unmute: txAny(["messenger.menu.unmute", "messenger.unmuteChat"], "Ovozni yoqish"),
      pin: txAny(["messenger.pinChat"], "Mahkamlash"),
      unpin: txAny(["messenger.unpinChat"], "Mahkamlashni olib tashlash"),
      markRead: txAny(["status.read"], "O‘qilgan deb belgilash"),
      markUnread: txAny(["status.unread"], "O‘qilmagan deb belgilash"),
      movePrivate: txAny(["messenger.privateGroups", "common.private"], "Shaxsiyga ko‘chirish"),
      moveMain: txAny(["messenger.chats"], "Asosiy ro‘yxatga qaytarish"),
      deleteGroup: txAny(["messenger.deleteGroup", "common.delete"], "Guruhni o‘chirish"),
      workspace: txAny(["messenger.workspace"], "Ish maydoni"),
      profileSourceNote: txAny(
        ["messenger.profileSourceNote"],
        "Yaratish profil ichida bajariladi. Bu ekran faqat guruhlarni ko‘rsatadi va ochadi.",
      ),
    }),
    [txAny],
  );

  const loadGroups = useCallback(async () => {
    const readText = (record: Record<string, unknown>, keys: string[]) => {
      for (const key of keys) {
        const value = record[key];
        if (typeof value === "string" && value.trim()) return value.trim();
      }
      return "";
    };

    const buildProfileRoom = (value: unknown): ChatRoomMetaSnapshot | null => {
      if (!value || typeof value !== "object") return null;

      const record = value as Record<string, unknown>;
      const name = readText(record, ["groupName", "name", "title"]);
      if (!name) return null;

      const groupId = readText(record, ["groupId", "id"]);
      const username = readText(record, ["username"]);
      const linkedChatId = readText(record, ["linkedChatId", "chatId", "roomId"]);

      const safeSlug =
        username ||
        groupId ||
        name
          .toLowerCase()
          .trim()
          .replace(/[^\p{L}\p{N}]+/gu, "-")
          .replace(/^-+|-+$/g, "");

      const chatId = linkedChatId || `group:${safeSlug || Date.now()}`;

      const members = Array.isArray(record.members) ? record.members : [];
      const admins = Array.isArray(record.admins) ? record.admins : [];
      const ownerUserId = readText(record, ["ownerUserId", "ownerId"]);
      const ids = new Set<string>();
      if (ownerUserId) ids.add(ownerUserId);
      members.forEach((item) => {
        if (item && typeof item === "object") {
          const id = readText(item as Record<string, unknown>, ["id", "userId"]);
          if (id) ids.add(id);
        }
      });
      admins.forEach((item) => {
        if (item && typeof item === "object") {
          const id = readText(item as Record<string, unknown>, ["id", "userId"]);
          if (id) ids.add(id);
        }
      });

      const membersCount = Math.max(1, ids.size || 1);
      const description = readText(record, ["description", "publicationSubtitle", "publicationSummary"]);
      const avatarUri = readText(record, ["avatarUri", "avatarUrl", "photoUrl"]);
      const coverUri = readText(record, ["coverUri", "coverUrl"]);

      const rawUpdated = record.lastUpdatedAt || record.updatedAt;
      const updatedAt =
        typeof rawUpdated === "number"
          ? new Date(rawUpdated).toISOString()
          : typeof rawUpdated === "string" && rawUpdated.trim()
            ? rawUpdated.trim()
            : new Date().toISOString();

      return {
        chatId,
        roomId: chatId,
        id: chatId,
        name,
        title: name,
        subtitle: buildGroupSubtitle(description, membersCount, texts.members),
        roomType: "group",
        type: "group",
        verified: Boolean(record.isPublished || record.verified),
        avatarLetter: getAvatarLetter(name),
        avatarUrl: avatarUri || undefined,
        photoUrl: avatarUri || undefined,
        coverUrl: coverUri || undefined,
        currentUserId: ownerUserId || undefined,
        ownerUserId: ownerUserId || undefined,
        username: username || undefined,
        searchableInDirectory: true,
        joinMode: record.allowJoinRequests === true ? "request" : "open",
        membersCount,
        updatedAt,
      } as any;
    };

    const profileRooms: ChatRoomMetaSnapshot[] = [];

    try {
      await profileKernelFacade.boot();
      const collection = profileKernelFacade.selectors.groupProfiles();
      const items = Array.isArray(collection?.items) ? collection.items : [];

      for (const item of items) {
        const room = buildProfileRoom(item);
        if (!room) continue;

        profileRooms.push(room);

        try {
          await messengerKernelFacade.ensureRoomSnapshot(room as any);
        } catch {
          // Groups screen must continue even if local runtime sync is not ready.
        }
      }
    } catch {
      // Profile groups are optional for this screen; Messenger rooms still load below.
    }

    const syncedProfileRooms = await sabiSyncProfileGroupsToRooms(currentUserId);
    const rooms = [...(await messengerKernelFacade.listRoomSnapshots()), ...profileRooms, ...syncedProfileRooms];
    const profiles = await messengerKernelFacade.listRoomProfiles();

    const mergedRoomsById = new Map<string, ChatRoomMetaSnapshot>();

    [...rooms, ...profileRooms].forEach((room) => {
      const chatId = String((room as any).chatId ?? (room as any).roomId ?? "").trim();
      if (!chatId) return;

      const previous = mergedRoomsById.get(chatId);
      mergedRoomsById.set(chatId, {
        ...(previous || {}),
        ...(room as any),
        chatId,
        roomId: chatId,
        roomType: "group",
        type: "group",
      } as ChatRoomMetaSnapshot);
    });

    const mapped = await buildPersistedGroupItems(Array.from(mergedRoomsById.values()), language, {
      groupPreview: texts.groupPreview,
      photo: texts.photo,
      video: texts.video,
      document: texts.document,
      contact: texts.contact,
      location: texts.location,
      gift: texts.gift,
      voice: texts.voice,
    });

    const visible = mapped
      .map((item) => {
        const profile = profiles[item.id];
        return {
          ...item,
          unread: typeof profile?.unreadCount === "number" ? profile.unreadCount : item.unread,
          muted: Boolean(profile?.muted),
          pinned: Boolean(profile?.pinned),
          hiddenFromMain: Boolean(profile?.hiddenFromMain),
        } satisfies GroupItem;
      })
      .filter((item) => {
        const profile = profiles[item.id];
        if (profile?.deleted) return false;
        return !messengerKernelFacade.isRoomHidden(profile);
      })
      .sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return String(b.updatedAt ?? "").localeCompare(String(a.updatedAt ?? ""));
      });

    const directoryQuery = query.trim();
    const directoryGroups = (await (directoryQuery
      ? searchSabiPublicDirectory({ kind: "GROUP", query: directoryQuery })
      : listSabiPublicDirectory({ kind: "GROUP", limit: 80 })))
      .map((item: SabiPublicDirectoryItem) => mapSabiDirectoryGroupItem(item, language, { groupPreview: texts.groupPreview, members: texts.members }))
      .filter((item: GroupItem | null): item is GroupItem => Boolean(item));

    const sabiVisibleGroups = mergeSabiDirectoryGroups(visible, directoryGroups).map((item: any) => {
      const fromPublicDirectory = Boolean(item.publicDirectoryItem);

      return {
        ...item,
        isMember: fromPublicDirectory ? Boolean(item.isMember) : true,
        isOwner: fromPublicDirectory ? Boolean(item.isOwner) : true,
        isAdmin: fromPublicDirectory ? Boolean(item.isAdmin) : true,
        localProfileGroupOwner: fromPublicDirectory ? false : true,
        ownerUserId: item.ownerUserId || (fromPublicDirectory ? undefined : currentUserId),
        preview: String(item.preview ?? "").toLowerCase().includes("request") ? texts.groupPreview : item.preview,
      };
    });

    for (const item of sabiVisibleGroups) {
      if ((item as any).publicDirectoryItem) continue;

      try {
        await messengerKernelFacade.ensureRoomSnapshot({
          chatId: item.id,
          roomId: item.id,
          id: item.id,
          name: item.name,
          title: item.name,
          subtitle: item.subtitle || item.preview || texts.groupPreview,
          roomType: "group",
          type: "group",
          verified: Boolean(item.verified),
          avatarLetter: item.avatarLetter || getAvatarLetter(item.name),
          avatarUrl: item.avatarUrl || undefined,
          photoUrl: item.avatarUrl || undefined,
          currentUserId: currentUserId || item.ownerUserId || undefined,
          ownerUserId: item.ownerUserId || currentUserId || undefined,
          searchableInDirectory: true,
          localProfileGroupOwner: true,
          memberIds: JSON.stringify(Array.from(new Set([currentUserId, item.ownerUserId].filter(Boolean)))),
          adminIds: JSON.stringify(Array.from(new Set([currentUserId, item.ownerUserId].filter(Boolean)))),
          membershipStatus: "member",
          canSendMessages: "1",
          groupAccess: "member",
          updatedAt: item.updatedAt || new Date().toISOString(),
        } as any);
      } catch {}
    }

    setGroups(sabiVisibleGroups as any);
  }, [language, query, texts.contact, texts.document, texts.gift, texts.groupPreview, texts.location, texts.members, texts.photo, texts.video, texts.voice]);

  const refreshTheme = useCallback(async () => {
    const next = await hydrateMessengerThemeState();
    setThemeState(next);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refreshTheme();
      void loadGroups();
    }, [refreshTheme, loadGroups]),
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadGroups();
    }, 250);

    return () => clearTimeout(timer);
  }, [loadGroups, query]);

  const realtimeChannel = useMemo(
    () => (currentUserId ? `messenger:groups:${currentUserId}` : "messenger:groups:public"),
    [currentUserId],
  );

  const handleRealtimeEvent = useCallback(
    (eventName: string, payload: unknown) => {
      if (
        eventName !== "group:message" &&
        eventName !== "group:created" &&
        eventName !== "message:new" &&
        eventName !== "realtime:test"
      ) {
        return;
      }

      const record =
        payload && typeof payload === "object"
          ? (payload as Record<string, unknown>)
          : undefined;

      const chatId =
        (typeof record?.chatId === "string" && record.chatId.trim()) ||
        (typeof record?.id === "string" && record.id.trim()) ||
        "";

      if (eventName === "group:created" && chatId) {
        const name = (typeof record?.name === "string" && record.name.trim()) || "Group";
        const membersCount =
          typeof record?.membersCount === "number" && record.membersCount > 0
            ? record.membersCount
            : 3;
        const description =
          (typeof record?.description === "string" && record.description.trim()) || "";

        void (async () => {
          await messengerKernelFacade.ensureRoomSnapshot({
            chatId,
            name,
            subtitle: buildGroupSubtitle(description, membersCount, texts.members),
            roomType: "group",
            verified: Boolean(record?.verified),
            avatarLetter: getAvatarLetter(name),
          });
          await loadGroups();
        })();

        return;
      }

      if (chatId) {
        void messengerKernelFacade.rooms.incrementUnread(chatId, 1);
      }

      void loadGroups();
    },
    [loadGroups, texts.members],
  );

  useEffect(() => {
    const syncConnection = () => {
      setConnected(messengerKernelFacade.selectors.realtimeStatus() === "connected");
    };

    syncConnection();

    const unsubscribeStore = messengerKernelFacade.subscribe(syncConnection);
    const unsubscribeRealtime = messengerKernelFacade.on("realtimeEvent", (event) => {
      if (event.type === "connection") {
        syncConnection();
        return;
      }

      if (event.type === "custom") {
        if (typeof event.eventName === "string" && event.eventName.length > 0) { if (typeof event.eventName === "string" && event.eventName.length > 0) { handleRealtimeEvent(event.eventName, event.payload); } }
      }
    });

    return () => {
      unsubscribeRealtime();
      unsubscribeStore();
    };
  }, [handleRealtimeEvent]);

  const updateProfileGroupMembership = useCallback(
    async (group: GroupItem, mode: "join" | "request") => {
      const userId = readProfileGroupString(currentUserId);
      if (!userId) {
        Alert.alert(texts.missingUser);
        return false;
      }

      await profileKernelFacade.boot();
      const collection = profileKernelFacade.selectors.groupProfiles();
      const items = Array.isArray(collection?.items)
        ? (collection.items as ProfileGroupRuntimeState[])
        : [];

      const nextItems = items.map((item) => {
        const chatId = buildProfileGroupChatId(item);
        if (chatId !== group.id) return item;

        const members = readProfileGroupArray(item.members);
        const joinRequests = readProfileGroupArray(item.joinRequests);
        const alreadyMember =
          readProfileGroupString(item.ownerUserId) === userId ||
          readProfileGroupArray(item.admins).some((admin) => readProfileEntityId(admin) === userId) ||
          members.some((member) => readProfileEntityId(member) === userId);

        if (alreadyMember) return item;

        if (mode === "join") {
          return {
            ...item,
            members: [
              ...members,
              {
                id: userId,
                name: getCurrentUserDisplayName(userId),
                role: texts.members,
              },
            ],
            joinRequests: joinRequests.filter((request) => readProfileEntityId(request) !== userId),
            lastUpdatedAt: Date.now(),
          };
        }

        const alreadyRequested = joinRequests.some((request) => readProfileEntityId(request) === userId);
        if (alreadyRequested) return item;

        return {
          ...item,
          joinRequests: [
            ...joinRequests,
            {
              id: userId,
              userId,
              name: getCurrentUserDisplayName(userId),
              requestedAt: Date.now(),
            },
          ],
          lastUpdatedAt: Date.now(),
        };
      });

      await (profileKernelFacade as any).saveGroupProfiles({
        items: nextItems as unknown as Record<string, unknown>[],
        selectedId:
          typeof collection?.selectedId === "string" ? collection.selectedId : null,
      });

      await syncProfileGroupsToMessengerRuntime(texts.members, currentUserId);
      await loadGroups();
      return true;
    },
    [currentUserId, loadGroups, texts.members, texts.missingUser],
  );

  const openGroup = useCallback(
    async (group: GroupItem) => {
      if (group.publicDirectoryItem) {
        const result = await openSabiPublicDirectoryItem(group.publicDirectoryItem, currentUserId);
        if (!result.ok) {
          await loadGroups();
          Alert.alert(
            result.blocked || result.status === 403 ? texts.directoryUnavailable : texts.requestSent,
            result.blocked || result.status === 403 ? texts.directoryUnavailableMessage : texts.requestSentMessage,
          );
          return;
        }
        await loadGroups();
        return;
      }

      if (false) {
        if (group.joinMode === "open") {
          const joined = await updateProfileGroupMembership(group, "join");
          if (!joined) return;
        } else {
          if (!group.hasPendingJoinRequest) {
            await updateProfileGroupMembership(group, "request");
          }
          Alert.alert(texts.requestSent, texts.requestSentMessage);
          return;
        }
      }

      const sharedProfile = await hydrateGroupPublicProfile(group.id);

      const avatarUri =
        typeof sharedProfile?.avatarUri === "string" && sharedProfile.avatarUri.trim()
          ? sharedProfile.avatarUri.trim()
          : "";

      const coverUri =
        typeof sharedProfile?.coverUri === "string" && sharedProfile.coverUri.trim()
          ? sharedProfile.coverUri.trim()
          : "";

      await openMessengerRoom({
        chatId: group.id,
        name: group.name,
        subtitle: group.subtitle || texts.groupPreview,
        roomType: "group",
        verified: Boolean(group.verified),
        avatarLetter: group.avatarLetter || getAvatarLetter(group.name),
        avatarUrl: avatarUri || undefined,
        photoUrl: avatarUri || undefined,
        coverUrl: coverUri || undefined,
        currentUserId: currentUserId || group.ownerUserId || undefined,
ownerUserId: group.ownerUserId || currentUserId || undefined,
memberIds: JSON.stringify(Array.from(new Set([currentUserId, group.ownerUserId].filter(Boolean)))),
adminIds: JSON.stringify(Array.from(new Set([group.ownerUserId].filter(Boolean)))),
membershipStatus: "member",
canSendMessages: "1",
groupAccess: "member",
        publicPhotos: JSON.stringify(
          Array.isArray(sharedProfile?.publicationPhotos)
            ? sharedProfile.publicationPhotos.map((item) => ({
                id: item.id,
                uri: item.uri,
                kind: "photo" as const,
              }))
            : [],
        ),
        publicVideos: JSON.stringify(
          Array.isArray(sharedProfile?.publicationVideos)
            ? sharedProfile.publicationVideos.map((item) => ({
                id: item.id,
                uri: item.uri,
                kind: "video" as const,
              }))
            : [],
        ),
        likesCount: String(
          typeof sharedProfile?.likesCount === "number" ? sharedProfile.likesCount : 0,
        ),
        publicGiftsCount: String(
          typeof sharedProfile?.publicGiftsCount === "number" ? sharedProfile.publicGiftsCount : 0,
        ),
        // SABI_GROUP_ROOM_MEMBER_FLAGS
        localProfileGroupOwner: true,
        markRead: true,
      });

      await loadGroups();
    },
    [currentUserId, loadGroups, texts.directoryUnavailable, texts.directoryUnavailableMessage, texts.groupPreview, texts.requestSent, texts.requestSentMessage, updateProfileGroupMembership],
  );

  const runQuickAction = useCallback(
    async (action: () => Promise<unknown>) => {
      await action();
      setQuickMenuGroup(null);
      await loadGroups();
    },
    [loadGroups],
  );

  const filteredGroups = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return groups.filter((item) => {
      if (!normalized) return true;
      return (
        item.name.toLowerCase().includes(normalized) ||
        item.preview.toLowerCase().includes(normalized) ||
        (item.subtitle ?? "").toLowerCase().includes(normalized)
      );
    });
  }, [groups, query]);

  const modalActionColors = {
    surfaceBorder: softBorder,
    mainText,
    secondaryText,
    raisedColors,
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: palette.background[0] || "#03110E" }]}
      edges={["top", "left", "right", "bottom"]}
    >
      <DecorativeBackground themeState={themeState} palette={palette}>
        {!hasWallpaper ? (
          <>
            <View style={[styles.topGlow, { backgroundColor: withAlpha(palette.accent, 0.18) }]} />
            <View
              style={[styles.sideGlow, { backgroundColor: withAlpha(palette.accentAlt || palette.accentSoft, 0.14) }]}
            />
            <View
              style={[styles.bottomGlow, { backgroundColor: withAlpha(palette.accentSoft, 0.12) }]}
            />
          </>
        ) : null}

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Pressable style={styles.headerButtonWrap} onPress={() => router.back()}>
              {({ pressed }) => (
                <View style={[styles.headerButtonOuter, pressed ? styles.pressed : undefined]}>
                  <View style={styles.headerButtonShadow} />
                  <LinearGradient colors={raisedColors} style={[styles.headerButtonFill, { borderColor: glassBorder }]}>
                    <ArrowLeft size={20} strokeWidth={2.3} color={mainText} />
                  </LinearGradient>
                </View>
              )}
            </Pressable>

            <View style={styles.headerTitleWrap}>
              <Text style={[styles.headerEyebrow, { color: withAlpha(secondaryText, 0.78) }]}>{texts.eyebrow}</Text>
              <Text style={[styles.headerTitle, { color: mainText }]}>{texts.title}</Text>
            </View>

            <Pressable style={styles.headerButtonWrap} onPress={() => setSettingsVisible(true)}>
              {({ pressed }) => (
                <View style={[styles.headerButtonOuter, pressed ? styles.pressed : undefined]}>
                  <View style={styles.headerButtonShadow} />
                  <LinearGradient colors={raisedColors} style={[styles.headerButtonFill, { borderColor: glassBorder }]}> 
                    <Settings2 size={19} strokeWidth={2.3} color={mainText} />
                  </LinearGradient>
                </View>
              )}
            </Pressable>
          </View>

          <View style={styles.heroCardWrap}>
            <View style={styles.heroShadow} />
            <LinearGradient colors={cardColors} style={[styles.heroCard, { borderColor: glassBorder }]}>
              <View style={[styles.cardGlass, { backgroundColor: withAlpha(mainText, 0.03) }]} />
              <View style={styles.heroTopRow}>
                <View style={styles.heroLeft}>
                  <LinearGradient
                    colors={[palette.accent, palette.accentAlt || palette.accentSoft, palette.accentSoft]}
                    style={styles.heroSticker}
                  >
                    <Users size={24} strokeWidth={2.3} color="#071711" />
                  </LinearGradient>
                  <View style={styles.heroTextWrap}>
                    <Text style={[styles.heroTitle, { color: mainText }]}>{texts.title}</Text>
                    <Text style={[styles.heroSubtitle, { color: withAlpha(secondaryText, 0.82) }]}>
                      {texts.linkedHint}
                    </Text>
                  </View>
                </View>

                <View style={styles.liveWrap}>
                  <View
                    style={[
                      styles.liveDot,
                      { backgroundColor: connected ? palette.accent : "#FF8C8C" },
                    ]}
                  />
                  <Text style={[styles.liveText, { color: withAlpha(secondaryText, 0.76) }]}>
                    {connected ? texts.online : texts.connecting}
                  </Text>
                </View>
              </View>

              <View style={styles.profileNoteCard}>
                <LinearGradient colors={raisedColors} style={styles.profileNoteFill}>
                  <Text style={[styles.profileNoteText, { color: withAlpha(secondaryText, 0.90) }]}>
                    {texts.profileSourceNote}
                  </Text>
                </LinearGradient>
              </View>
            </LinearGradient>
          </View>

          <View style={styles.searchCardWrap}>
            <View style={styles.searchShadow} />
            <LinearGradient colors={cardColors} style={[styles.searchCard, { borderColor: glassBorder }]}>
              <View style={[styles.cardGlass, { backgroundColor: withAlpha(mainText, 0.03) }]} />
              <View style={styles.searchRow}>
                <View
                  style={[
                    styles.searchIconWrap,
                    {
                      backgroundColor: accentSoftBg,
                      borderColor: accentBorder,
                    },
                  ]}
                >
                  <Search size={18} strokeWidth={2.3} color={palette.accentSoft} />
                </View>

                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder={texts.search}
                  placeholderTextColor={withAlpha(secondaryText, 0.56)}
                  style={[styles.searchInput, { color: mainText }]}
                />
              </View>
            </LinearGradient>
          </View>

          <View style={styles.listWrap}>
            {filteredGroups.length === 0 ? (
              <View style={styles.emptyWrap}>
                <View style={styles.emptyShadow} />
                <LinearGradient colors={cardColors} style={[styles.emptyCard, { borderColor: glassBorder }]}> 
                  <View style={[styles.cardGlass, { backgroundColor: withAlpha(mainText, 0.03) }]} />
                  <Text style={[styles.emptyTitle, { color: mainText }]}>{texts.emptyTitle}</Text>
                  <Text style={[styles.emptySubtitle, { color: withAlpha(secondaryText, 0.82) }]}>
                    {texts.emptySubtitle}
                  </Text>
                </LinearGradient>
              </View>
            ) : (
              filteredGroups.map((group) => (
                <Pressable
                  key={group.id}
                  onPress={() => void openGroup(group)}
                  onLongPress={() => setQuickMenuGroup(group)}
                  delayLongPress={220}
                  style={({ pressed }) => [
                    styles.channelCardWrap,
                    pressed ? styles.rowPressed : undefined,
                  ]}
                >
                  <View style={styles.channelCardShadow} />
                  <LinearGradient colors={cardColors} style={[styles.channelCard, { borderColor: glassBorder }]}> 
                    <View style={[styles.cardGlass, { backgroundColor: withAlpha(mainText, 0.03) }]} />
                    <View style={[styles.channelAccentRail, { backgroundColor: palette.accent }]} />

                    <View style={styles.channelAvatar}>
                      {group.avatarUrl ? (
                        <Image source={{ uri: group.avatarUrl }} style={styles.channelAvatarImage} resizeMode="cover" />
                      ) : (
                        <LinearGradient
                          colors={[palette.accent, palette.accentAlt || palette.accentSoft, palette.accentSoft]}
                          style={styles.channelAvatarFallback}
                        >
                          <Text style={styles.channelAvatarText}>{group.avatarLetter || "G"}</Text>
                        </LinearGradient>
                      )}
                    </View>

                    <View style={styles.channelBody}>
                      <View style={styles.channelTopRow}>
                        <View style={styles.channelTitleRow}>
                          <Text style={[styles.channelName, { color: mainText }]} numberOfLines={1}>
                            {group.name}
                          </Text>
                          {group.verified ? (
                            <BadgeCheck
                              size={15}
                              strokeWidth={2.3}
                              color={palette.accentSoft}
                              style={styles.verifiedIcon}
                            />
                          ) : null}
                        </View>

                        <Text style={[styles.channelTime, { color: withAlpha(secondaryText, 0.76) }]}>{group.time}</Text>
                      </View>

                      <Text style={[styles.channelHandle, { color: palette.accentSoft }]} numberOfLines={1}>
                        {group.subtitle || `${group.membersCount || 0} ${texts.members}`}
                      </Text>

                      <Text style={[styles.channelPreview, { color: withAlpha(secondaryText, 0.82) }]} numberOfLines={2}>
                        {(group.isMember || group.isOwner || group.isAdmin) ? group.preview : group.hasPendingJoinRequest ? texts.requestSent : group.joinMode === "open" ? texts.joinGroup : texts.requestJoin}
                      </Text>

                      <View style={styles.channelBottomRow}>
                        <View style={styles.channelMetaRow}>
                          {group.muted ? (
                            <BellOff
                              size={13}
                              strokeWidth={2.4}
                              color={withAlpha(secondaryText, 0.9)}
                              style={styles.metaIcon}
                            />
                          ) : null}
                          {group.pinned ? (
                            <Pin
                              size={13}
                              strokeWidth={2.4}
                              color="#FFE6A6"
                              style={styles.metaIcon}
                            />
                          ) : null}
                          {group.hiddenFromMain ? (
                            <Lock
                              size={13}
                              strokeWidth={2.4}
                              color="#EFE2FF"
                              style={styles.metaIcon}
                            />
                          ) : null}
                        </View>

                        {group.unread > 0 ? (
                          <LinearGradient
                            colors={[palette.accent, palette.accentAlt || palette.accentSoft]}
                            style={styles.unreadBadge}
                          >
                            <Text style={styles.unreadBadgeText}>{group.unread}</Text>
                          </LinearGradient>
                        ) : null}
                      </View>
                    </View>
                  </LinearGradient>
                </Pressable>
              ))
            )}
          </View>
        </ScrollView>

        <Modal
          visible={settingsVisible}
          transparent={false}
          animationType="fade"
          onRequestClose={() => setSettingsVisible(false)}
        >
          <View style={[styles.overlayBase, { backgroundColor: palette.background[0] || "#07110F" }]}> 
            <LinearGradient colors={modalBackdropColors} style={styles.modalBackdrop} />
            <Pressable style={styles.absoluteFill} onPress={() => setSettingsVisible(false)} />
            <View style={styles.settingsPanelWrap}>
              <View style={styles.popupShadow} />
              <LinearGradient colors={sheetColors} style={[styles.settingsPanel, { borderColor: glassBorder }]}> 
                <View style={styles.settingsHeaderRow}>
                  <Text style={[styles.settingsHeaderTitle, { color: mainText }]}>{texts.settings}</Text>
                  <Pressable onPress={() => setSettingsVisible(false)} style={styles.modalCloseButton}>
                    <View
                      style={[
                        styles.modalCloseButtonInner,
                        {
                          borderColor: softBorder,
                          backgroundColor: withAlpha(mainText, 0.04),
                        },
                      ]}
                    >
                      <X size={16} color={mainText} strokeWidth={2.3} />
                    </View>
                  </Pressable>
                </View>

                <QuickActionRow
                  title={texts.themeWallpaper}
                  subtitle={texts.settings}
                  icon={<Palette size={17} color={palette.accentSoft} strokeWidth={2.4} />}
                  onPress={() => {
                    setSettingsVisible(false);
                    router.push("/messenger-theme" as never);
                  }}
                  colors={modalActionColors}
                />
                <QuickActionRow
                  title={texts.privateGroups}
                  subtitle={texts.settings}
                  icon={<Lock size={17} color="#E8DEFF" strokeWidth={2.4} />}
                  onPress={() => setSettingsVisible(false)}
                  colors={modalActionColors}
                />
              </LinearGradient>
            </View>
          </View>
        </Modal>

        <Modal
          visible={Boolean(quickMenuGroup)}
          transparent={false}
          animationType="fade"
          onRequestClose={() => setQuickMenuGroup(null)}
        >
          <View style={[styles.overlayBase, { backgroundColor: palette.background[0] || "#07110F" }]}> 
            <LinearGradient colors={modalBackdropColors} style={styles.modalBackdrop} />
            <Pressable style={styles.absoluteFill} onPress={() => setQuickMenuGroup(null)} />
            <View style={styles.settingsPanelWrap}>
              <View style={styles.popupShadow} />
              <LinearGradient colors={sheetColors} style={[styles.settingsPanel, { borderColor: glassBorder }]}> 
                {quickMenuGroup ? (
                  <>
                    <View style={styles.settingsHeaderRow}>
                      <Text style={[styles.settingsHeaderTitle, { color: mainText }]} numberOfLines={1}>
                        {quickMenuGroup.name}
                      </Text>
                      <Pressable onPress={() => setQuickMenuGroup(null)} style={styles.modalCloseButton}>
                        <View
                          style={[
                            styles.modalCloseButtonInner,
                            {
                              borderColor: softBorder,
                              backgroundColor: withAlpha(mainText, 0.04),
                            },
                          ]}
                        >
                          <X size={16} color={mainText} strokeWidth={2.3} />
                        </View>
                      </Pressable>
                    </View>

                    <QuickActionRow
                      title={(quickMenuGroup.isMember || quickMenuGroup.isOwner || quickMenuGroup.isAdmin) ? texts.openGroup : quickMenuGroup.joinMode === "open" ? texts.joinGroup : texts.requestJoin}
                      subtitle={quickMenuGroup.name}
                      icon={<Users size={17} color={mainText} strokeWidth={2.4} />}
                      onPress={() => {
                        setQuickMenuGroup(null);
                        void openGroup(quickMenuGroup);
                      }}
                      colors={modalActionColors}
                    />

                    <QuickActionRow
                      title={quickMenuGroup.muted ? texts.unmute : texts.mute}
                      subtitle={texts.settings}
                      icon={
                        quickMenuGroup.muted ? (
                          <Volume2 size={17} color={mainText} strokeWidth={2.4} />
                        ) : (
                          <VolumeX size={17} color={mainText} strokeWidth={2.4} />
                        )
                      }
                      onPress={() =>
                        void runQuickAction(async () => {
                          await messengerKernelFacade.rooms.setMuted(quickMenuGroup.id, !quickMenuGroup.muted);
                        })
                      }
                      colors={modalActionColors}
                    />

                    <QuickActionRow
                      title={quickMenuGroup.pinned ? texts.unpin : texts.pin}
                      subtitle={texts.settings}
                      icon={<Pin size={17} color="#FFE7A9" strokeWidth={2.4} />}
                      onPress={() =>
                        void runQuickAction(async () => {
                          await messengerKernelFacade.rooms.setPinned(quickMenuGroup.id, !quickMenuGroup.pinned);
                        })
                      }
                      colors={modalActionColors}
                    />

                    <QuickActionRow
                      title={quickMenuGroup.unread > 0 ? texts.markRead : texts.markUnread}
                      subtitle={
                        quickMenuGroup.unread > 0
                          ? String(quickMenuGroup.unread)
                          : texts.workspace
                      }
                      icon={
                        quickMenuGroup.unread > 0 ? (
                          <BookCheck size={17} color={mainText} strokeWidth={2.4} />
                        ) : (
                          <MessageCircleMore size={17} color={mainText} strokeWidth={2.4} />
                        )
                      }
                      onPress={() =>
                        void runQuickAction(async () => {
                          if (quickMenuGroup.unread > 0) {
                            await messengerKernelFacade.rooms.markRead(quickMenuGroup.id);
                          } else {
                            await messengerKernelFacade.rooms.markUnread(quickMenuGroup.id, 1);
                          }
                        })
                      }
                      colors={modalActionColors}
                    />

                    <QuickActionRow
                      title={quickMenuGroup.hiddenFromMain ? texts.moveMain : texts.movePrivate}
                      subtitle={texts.settings}
                      icon={
                        quickMenuGroup.hiddenFromMain ? (
                          <PanelRightOpen size={17} color="#E7DDFF" strokeWidth={2.4} />
                        ) : (
                          <PanelRightClose size={17} color="#E7DDFF" strokeWidth={2.4} />
                        )
                      }
                      onPress={() =>
                        void runQuickAction(async () => {
                          await messengerKernelFacade.rooms.setHidden(
                            quickMenuGroup.id,
                            !quickMenuGroup.hiddenFromMain,
                          );
                        })
                      }
                      colors={modalActionColors}
                    />

                    <QuickActionRow
                      title={texts.deleteGroup}
                      subtitle={quickMenuGroup.name}
                      icon={<Trash2 size={17} color="#FFB8C4" strokeWidth={2.4} />}
                      danger
                      onPress={() =>
                        Alert.alert(texts.deleteGroup, quickMenuGroup.name, [
                          { text: texts.close, style: "cancel" },
                          {
                            text: texts.deleteGroup,
                            style: "destructive",
                            onPress: () => {
                              void runQuickAction(async () => {
                                await messengerKernelFacade.rooms.setDeleted(quickMenuGroup.id, true);
                              });
                            },
                          },
                        ])
                      }
                      colors={modalActionColors}
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
  safeArea: { flex: 1 },
  absoluteFill: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0 },
  modalBackdrop: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  background: { flex: 1 },
  textureGrid: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
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
  },
  sideGlow: {
    position: "absolute",
    top: 170,
    right: -90,
    width: 260,
    height: 260,
    borderRadius: 260,
  },
  bottomGlow: {
    position: "absolute",
    bottom: -90,
    left: -70,
    width: 260,
    height: 260,
    borderRadius: 260,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 120,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  headerButtonWrap: {
    width: 44,
    height: 44,
  },
  headerButtonOuter: {
    flex: 1,
    borderRadius: 22,
  },
  headerButtonShadow: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.22)",
    transform: [{ translateY: 7 }, { scaleX: 0.92 }],
  },
  headerButtonFill: {
    flex: 1,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    overflow: "hidden",
  },
  headerTitleWrap: {
    flex: 1,
    paddingHorizontal: 12,
  },
  headerEyebrow: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: "900",
    marginTop: 2,
  },
  heroCardWrap: { borderRadius: 26, marginBottom: 14 },
  heroShadow: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: 26,
    backgroundColor: "rgba(0,0,0,0.22)",
    transform: [{ translateY: 10 }, { scaleX: 0.96 }],
  },
  heroCard: {
    borderRadius: 26,
    padding: 16,
    overflow: "hidden",
    borderWidth: 1,
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  heroLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 12,
  },
  heroSticker: {
    width: 56,
    height: 56,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  heroTextWrap: {
    flex: 1,
    marginLeft: 12,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: "900",
  },
  heroSubtitle: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
  },
  liveWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  liveText: {
    fontSize: 12,
    fontWeight: "700",
  },
  profileNoteCard: {
    marginTop: 14,
    borderRadius: 18,
    overflow: "hidden",
  },
  profileNoteFill: {
    minHeight: 56,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    justifyContent: "center",
  },
  profileNoteText: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
  },
  searchCardWrap: {
    borderRadius: 24,
    marginBottom: 14,
  },
  searchShadow: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: 24,
    backgroundColor: "rgba(0,0,0,0.22)",
    transform: [{ translateY: 9 }, { scaleX: 0.96 }],
  },
  searchCard: {
    borderRadius: 24,
    padding: 12,
    overflow: "hidden",
    borderWidth: 1,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  searchIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    fontWeight: "500",
  },
  listWrap: {
    paddingBottom: 18,
  },
  emptyWrap: {
    borderRadius: 24,
  },
  emptyShadow: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: 24,
    backgroundColor: "rgba(0,0,0,0.22)",
    transform: [{ translateY: 9 }, { scaleX: 0.96 }],
  },
  emptyCard: {
    borderRadius: 24,
    padding: 22,
    alignItems: "center",
    borderWidth: 1,
    overflow: "hidden",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "900",
  },
  emptySubtitle: {
    marginTop: 8,
    textAlign: "center",
    fontSize: 14,
    lineHeight: 19,
  },
  channelCardWrap: {
    borderRadius: 26,
    marginBottom: 12,
  },
  channelCardShadow: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: 26,
    backgroundColor: "rgba(0,0,0,0.22)",
    transform: [{ translateY: 9 }, { scaleX: 0.96 }],
  },
  channelCard: {
    minHeight: 128,
    borderRadius: 26,
    borderWidth: 1,
    overflow: "hidden",
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  channelAccentRail: {
    position: "absolute",
    left: 0,
    top: 18,
    bottom: 18,
    width: 5,
    borderTopRightRadius: 999,
    borderBottomRightRadius: 999,
  },
  channelAvatar: {
    width: 50,
    height: 50,
    borderRadius: 18,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  channelAvatarImage: {
    width: "100%",
    height: "100%",
  },
  channelAvatarFallback: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  channelAvatarText: {
    color: "#071711",
    fontSize: 18,
    fontWeight: "900",
  },
  channelBody: {
    flex: 1,
    minWidth: 0,
  },
  channelTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  channelTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 8,
  },
  channelName: {
    fontSize: 17,
    fontWeight: "900",
    maxWidth: "78%",
  },
  verifiedIcon: {
    marginLeft: 6,
  },
  channelTime: {
    fontSize: 11,
    fontWeight: "800",
  },
  channelHandle: {
    marginTop: 5,
    fontSize: 12,
    fontWeight: "800",
  },
  channelPreview: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
  },
  channelBottomRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  channelMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    flex: 1,
    paddingRight: 10,
  },
  metaIcon: {
    marginRight: 6,
  },
  unreadBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    paddingHorizontal: 7,
    alignItems: "center",
    justifyContent: "center",
  },
  unreadBadgeText: {
    color: "#071711",
    fontSize: 11,
    fontWeight: "900",
  },
  overlayBase: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  settingsPanelWrap: {
    justifyContent: "center",
  },
  popupShadow: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: 24,
    backgroundColor: "rgba(0,0,0,0.26)",
    transform: [{ translateY: 10 }, { scaleX: 0.96 }],
  },
  settingsPanel: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 10,
    overflow: "hidden",
  },
  settingsHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 2,
    paddingBottom: 4,
  },
  settingsHeaderTitle: {
    fontSize: 17,
    fontWeight: "900",
    flex: 1,
    paddingRight: 10,
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 14,
    overflow: "hidden",
  },
  modalCloseButtonInner: {
    flex: 1,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  popupItem: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    overflow: "hidden",
  },
  popupIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  popupTextWrap: {
    flex: 1,
  },
  popupTitle: {
    fontSize: 14,
    fontWeight: "900",
  },
  popupSubtitle: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: "700",
  },
  cardGlass: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  pressed: {
    transform: [{ scale: 0.986 }],
  },
  rowPressed: {
    transform: [{ scale: 0.988 }],
  },
});








