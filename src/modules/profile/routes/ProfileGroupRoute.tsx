/* eslint-disable react/no-unescaped-entities */
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Ban,
  Camera,
  ChevronLeft,
  Gift,
  Globe2,
  Heart,
  History,
  ImagePlus,
  Link2,
  Lock,
  Megaphone,
  MessageCircleMore,
  Plus,
  Save,
  Settings2,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users,
  Video,
} from "lucide-react-native";

import { profileKernelFacade } from "../../../core/kernel/profile";
import { getAuthSessionState } from "../../../core/kernel/auth/session.store";
import { messengerKernelFacade } from "../../../core/kernel/messenger/facade";
import { useI18n } from "../../../shared/i18n";
import { openMessengerRoom } from "../../messenger/navigation/messengerRoomNavigation";
import { syncSabiProfileGroupToPublicDirectory, syncSabiProfileGroupsCollectionToPublicDirectory } from "../../messenger/public-directory/profileDirectoryBridge";
import {
  getGroupPublicProfileSnapshot,
  hydrateAllGroupPublicProfiles,
  hydrateGroupPublicProfileStorage,
  saveGroupPublicProfile,
  subscribeGroupPublicProfiles,
  type GroupPublicMediaItem,
  type GroupPublicProfileSnapshot,
} from "../../messenger/groups/groupPublicProfileRuntime";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { uploadUserPublicProfileMediaFile } from "../../../shared/api/user-profile-api";

type I18nHookValue =
  | ((key: string, params?: Record<string, unknown>) => string)
  | {
      t?: (key: string, params?: Record<string, unknown>) => string;
    };

type RouteParams = {
  selectedUserId?: string | string[];
  selectedUserName?: string | string[];
  selectedUserRole?: string | string[];
  selectedUserPhone?: string | string[];
  invitedUserId?: string | string[];
  invitedUserName?: string | string[];
  invitedUserRole?: string | string[];
  invitedUserPhone?: string | string[];
  contactId?: string | string[];
  contactName?: string | string[];
  contactRole?: string | string[];
  contactPhone?: string | string[];
  userId?: string | string[];
  selfId?: string | string[];
  source?: string | string[];
};

type GroupAdmin = {
  id: string;
  name: string;
  role: string;
};

type GroupMember = {
  id: string;
  name: string;
  role: string;
};

type GroupBlacklistEntry = {
  id: string;
  name: string;
  reason: string;
};

type GroupJoinRequest = {
  id: string;
  userId: string;
  name: string;
  requestedAt: number;
};

type GroupMediaItem = {
  id: string;
  uri: string;
  type: "photo" | "video";
  createdAt: number;
  mediaUri?: string;
  thumbnailUri?: string;
  mimeType?: string;
  durationMs?: number;
};

type GroupHistoryEntry = {
  id: string;
  title: string;
  subtitle: string;
  kind: "identity" | "publication" | "community" | "control" | "gift";
  createdAt: number;
};

type GroupProfileState = {
  created: boolean;
  groupId: string;
  groupName: string;
  username: string;
  description: string;

  avatarUri: string;
  coverUri: string;

  ownerName: string;
  ownerUserId: string;
  ownerRole: string;
  ownerPhone: string;
  ownerEmail: string;

  isPublic: boolean;
  isPublished: boolean;
  showInProfile: boolean;
  searchableInDirectory: boolean;
  previewEnabled: boolean;

  allowJoinRequests: boolean;
  allowMemberInvites: boolean;
  onlyAdminsCanPost: boolean;
  onlyAdminsCanEdit: boolean;
  commentsEnabled: boolean;
  memberListVisible: boolean;
  slowModeEnabled: boolean;
  messageApprovalRequired: boolean;
  mediaApprovalRequired: boolean;

  linkedChatId: string;
  linkedPublicationId: string;
  linkedBotId: string;
  inviteLink: string;

  publicationTitle: string;
  publicationSubtitle: string;
  publicationSlug: string;
  publicationTags: string;
  publicationSummary: string;

  publicationPhotos: GroupMediaItem[];
  publicationVideos: GroupMediaItem[];
  likesCount: number;
  publicGiftsCount: number;
  lastUpdatedAt: number;

  members: GroupMember[];
  admins: GroupAdmin[];
  joinRequests: GroupJoinRequest[];
  blacklist: GroupBlacklistEntry[];
  history: GroupHistoryEntry[];
};


type GroupCollectionState = {
  groups: GroupProfileState[];
  selectedGroupId: string | null;
};

const DEFAULT_GROUP_COLLECTION: GroupCollectionState = {
  groups: [],
  selectedGroupId: null,
};

type DraftAdmin = {
  id: string;
  name: string;
  role: string;
};

type DraftMember = {
  id: string;
  name: string;
  role: string;
};

type DraftBlacklist = {
  id: string;
  name: string;
  reason: string;
};

type TabKey = "overview" | "public" | "members" | "control" | "history";


const BG_TOP = "#08111F";
const BG_MID = "#0D1830";
const BG_BOTTOM = "#111F3F";
const TEXT = "#F3F7FF";
const MUTED = "#B8C6E3";
const MUTED_2 = "#8FA4CB";
const CARD = "rgba(14, 23, 43, 0.78)";
const CARD_STRONG = "rgba(17, 28, 52, 0.92)";
const CARD_BORDER = "rgba(132, 168, 255, 0.18)";
const CHIP = "rgba(255,255,255,0.08)";
const BLUE = "#6F9CFF";
const BLUE_2 = "#8D82FF";
const MINT = "#54E1C1";
const GOLD = "#FFC96B";
const PINK = "#FF7FBC";
const RED = "#FF8080";

const DEFAULT_GROUP_STATE: GroupProfileState = {
  created: false,
  groupId: "",
  groupName: "",
  username: "",
  description: "",

  avatarUri: "",
  coverUri: "",

  ownerName: "",
  ownerUserId: "",
  ownerRole: "",
  ownerPhone: "",
  ownerEmail: "",

  isPublic: false,
  isPublished: false,
  showInProfile: false,
  searchableInDirectory: false,
  previewEnabled: true,

  allowJoinRequests: true,
  allowMemberInvites: false,
  onlyAdminsCanPost: false,
  onlyAdminsCanEdit: true,
  commentsEnabled: true,
  memberListVisible: true,
  slowModeEnabled: false,
  messageApprovalRequired: false,
  mediaApprovalRequired: false,

  linkedChatId: "",
  linkedPublicationId: "",
  linkedBotId: "",
  inviteLink: "",

  publicationTitle: "",
  publicationSubtitle: "",
  publicationSlug: "",
  publicationTags: "",
  publicationSummary: "",

  publicationPhotos: [],
  publicationVideos: [],
  likesCount: 0,
  publicGiftsCount: 0,
  lastUpdatedAt: 0,

  members: [],
  admins: [],
  joinRequests: [],
  blacklist: [],
  history: [],
};

function buildId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

function sanitizeUsername(value: string) {
  return value
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 32);
}

function sanitizeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "")
    .replace(/-+/g, "-")
    .replace(/^[-_]+|[-_]+$/g, "")
    .slice(0, 48);
}

function buildInviteLink(username: string, groupId: string) {
  const clean = sanitizeUsername(username);
  if (clean) return `sabi://group/${clean}`;
  return `sabi://group/${groupId}`;
}

function buildPublicationId(groupId: string) {
  return `pub_${groupId}`;
}

function buildDefaultPublicationSlug(groupName: string, username: string, groupId: string) {
  const fromName = sanitizeSlug(groupName);
  if (fromName) return fromName;

  const fromUsername = sanitizeSlug(username);
  if (fromUsername) return fromUsername;

  return sanitizeSlug(groupId);
}

function readParamValue(value?: string | string[]) {
  if (Array.isArray(value)) return String(value[0] ?? "").trim();
  return String(value ?? "").trim();
}

function extractSelectedMemberFromParams(params: RouteParams): GroupMember | null {
  const id =
    readParamValue(params.selectedUserId) ||
    readParamValue(params.invitedUserId) ||
    readParamValue(params.contactId);

  if (!id) return null;

  const name =
    readParamValue(params.selectedUserName) ||
    readParamValue(params.invitedUserName) ||
    readParamValue(params.contactName) ||
    id;

  const role =
    readParamValue(params.selectedUserRole) ||
    readParamValue(params.invitedUserRole) ||
    readParamValue(params.contactRole) ||
    "AвЂ™zo";

  const phone =
    readParamValue(params.selectedUserPhone) ||
    readParamValue(params.invitedUserPhone) ||
    readParamValue(params.contactPhone);

  return {
    id,
    name: phone ? `${name}` : name,
    role,
  };
}

function resolveCurrentUserId(params: RouteParams) {
  const fromRoute = readParamValue(params.userId) || readParamValue(params.selfId);
  if (fromRoute) return fromRoute;

  const fromGlobal =
    typeof globalThis !== "undefined" &&
    typeof (globalThis as { __SABI_USER_ID__?: string }).__SABI_USER_ID__ === "string"
      ? String((globalThis as { __SABI_USER_ID__?: string }).__SABI_USER_ID__ || "").trim()
      : "";

  return fromGlobal;
}

function buildMessengerChatId(state: GroupProfileState) {
  const linked = state.linkedChatId.trim();
  if (linked) return linked;

  const groupId = state.groupId.trim();
  if (groupId) return `group:${groupId}`;

  const username = sanitizeUsername(state.username || state.groupName);
  if (username) return `group:${username}`;

  return `group:${buildId("grpchat")}`;
}

function countMessengerParticipants(state: GroupProfileState) {
  const ids = new Set<string>();
  const ownerId = state.ownerUserId.trim();
  if (ownerId) ids.add(ownerId);
  state.admins.forEach((item) => item.id && ids.add(item.id));
  state.members.forEach((item) => item.id && ids.add(item.id));
  return Math.max(1, ids.size || 1);
}

function buildMessengerRoomSubtitle(state: GroupProfileState) {
  const membersLabel = `${countMessengerParticipants(state)} members`;
  const description = state.description.trim();
  if (description) return `${membersLabel} В· ${description}`;
  return membersLabel;
}



// SABI_PROFILE_GROUP_BACKEND_DIRECTORY_SYNC
async function sabiSyncProfileGroupToBackendDirectory(state: GroupProfileState, linkedChatId: string) {
  try {
    const auth = getAuthSessionState();

    if (
      auth.status !== "authenticated" ||
      !auth.apiBaseUrl ||
      !auth.accessToken ||
      !auth.currentUserId
    ) {
      return;
    }

    await fetch(`${auth.apiBaseUrl}/api/v2/messenger/groups/profile-sync`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${auth.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chatId: linkedChatId,
        groupId: linkedChatId,
        title: state.groupName,
        name: state.groupName,
        groupName: state.groupName,
        avatarUrl: state.avatarUri || null,
        isPublic: true,
        searchableInDirectory: true,
      }),
    });
  } catch {
    // Local Profile save must not fail if backend directory is temporarily unavailable.
  }
}

async function persistGroupMessengerRoomSnapshot(state: GroupProfileState) {
  if (!state.created || !state.groupName.trim()) return;

  const linkedChatId = buildMessengerChatId(state);
  const groupName = state.groupName.trim();
  const username = sanitizeUsername(state.username);
  const ownerUserId = state.ownerUserId.trim();
  const ownerName = state.ownerName.trim();
  const memberIds = Array.from(
    new Set(
      [
        ownerUserId,
        ...state.admins.map((item) => item.id.trim()),
        ...state.members.map((item) => item.id.trim()),
      ].filter(Boolean),
    ),
  );

  const adminIds = Array.from(
    new Set(
      [
        ownerUserId,
        ...state.admins.map((item) => item.id.trim()),
      ].filter(Boolean),
    ),
  );

  try {
    await messengerKernelFacade.ensureRoomSnapshot({
      chatId: linkedChatId,
      roomId: linkedChatId,
      id: linkedChatId,

      roomType: "group",
      type: "group",
      category: "group",

      groupId: state.groupId,
      groupName,
      name: groupName,
      title: groupName,
      username,

      subtitle: buildMessengerRoomSubtitle(state),
      description: state.description.trim(),
      publicationSubtitle: state.publicationSubtitle.trim(),
      publicationSummary: state.publicationSummary.trim(),

      avatarLetter: (groupName.charAt(0) || "G").toUpperCase(),
      avatarUri: state.avatarUri || undefined,
      avatarUrl: state.avatarUri || undefined,
      photoUrl: state.avatarUri || undefined,
      coverUri: state.coverUri || undefined,
      coverUrl: state.coverUri || undefined,

      ownerUserId,
      ownerName,
      ownerRole: state.ownerRole.trim(),
      ownerPhone: state.ownerPhone.trim(),
      ownerEmail: state.ownerEmail.trim(),

      memberIds: JSON.stringify(memberIds),
      adminIds: JSON.stringify(adminIds),
      members: JSON.stringify(state.members),
      admins: JSON.stringify(state.admins),
      membersCount: countMessengerParticipants(state),

      isPublic: state.isPublic ? "1" : "0",
      isPublished: state.isPublished ? "1" : "0",
      searchableInDirectory: state.searchableInDirectory ? "1" : "0",
      allowMemberInvites: state.allowMemberInvites ? "1" : "0",
      allowJoinRequests: state.allowJoinRequests ? "1" : "0",
      onlyAdminsCanPost: state.onlyAdminsCanPost ? "1" : "0",
      memberListVisible: state.memberListVisible ? "1" : "0",

      inviteLink: state.inviteLink,
      linkedChatId,
      linkedPublicationId: state.linkedPublicationId,

      membershipStatus: "member",
      groupAccess: "member",
      canSendMessages: "1",

      likesCount: state.likesCount,
      publicGiftsCount: state.publicGiftsCount,
      publicPhotos: JSON.stringify(mapGroupMediaItemsForPublicSurface(state.publicationPhotos, "photo")),
      publicVideos: JSON.stringify(mapGroupMediaItemsForPublicSurface(state.publicationVideos, "video")),
      publicationPhotos: JSON.stringify(mapGroupMediaItemsForPublicSurface(state.publicationPhotos, "photo")),
      publicationVideos: JSON.stringify(mapGroupMediaItemsForPublicSurface(state.publicationVideos, "video")),

      updatedAt: new Date(state.lastUpdatedAt || Date.now()).toISOString(),
    } as any);
  } catch {}
}

async function bindGroupToMessengerRuntime(state: GroupProfileState): Promise<GroupProfileState> {
  if (!state.created || !state.groupName.trim()) return state;

  const linkedChatId = buildMessengerChatId(state);
  const nextState =
    state.linkedChatId === linkedChatId
      ? state
      : {
          ...state,
          linkedChatId,
        };

  await persistGroupMessengerRoomSnapshot(nextState);

  return nextState;
}
async function bindGroupsToMessengerRuntime(groups: GroupProfileState[]) {
  const boundGroups: GroupProfileState[] = [];

  for (const group of groups) {
    boundGroups.push(await bindGroupToMessengerRuntime(group));
  }

  return boundGroups;
}

function normalizeAdminList(value: unknown): GroupAdmin[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      const raw = item as Partial<GroupAdmin>;
      return {
        id: String(raw?.id ?? "").trim(),
        name: String(raw?.name ?? "").trim(),
        role: String(raw?.role ?? "").trim(),
      };
    })
    .filter((item) => item.id);
}

function normalizeMemberList(value: unknown): GroupMember[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      const raw = item as Partial<GroupMember>;
      return {
        id: String(raw?.id ?? "").trim(),
        name: String(raw?.name ?? "").trim(),
        role: String(raw?.role ?? "").trim(),
      };
    })
    .filter((item) => item.id);
}

function normalizeBlacklist(value: unknown): GroupBlacklistEntry[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      const raw = item as Partial<GroupBlacklistEntry>;
      return {
        id: String(raw?.id ?? "").trim(),
        name: String(raw?.name ?? "").trim(),
        reason: String(raw?.reason ?? "").trim(),
      };
    })
    .filter((item) => item.id);
}

function normalizeJoinRequests(value: unknown): GroupJoinRequest[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      const raw = item as Partial<GroupJoinRequest>;
      const userId = String(raw?.userId ?? raw?.id ?? "").trim();
      return {
        id: String(raw?.id ?? userId).trim() || buildId("join"),
        userId,
        name: String(raw?.name ?? userId).trim(),
        requestedAt: Number(raw?.requestedAt ?? Date.now()),
      };
    })
    .filter((item) => item.userId)
    .sort((a, b) => b.requestedAt - a.requestedAt);
}


function normalizeMedia(value: unknown, type: "photo" | "video"): GroupMediaItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      const raw = item as Partial<GroupMediaItem> & Record<string, unknown>;
      const mediaUri = String(raw?.mediaUri ?? "").trim();
      const thumbnailUri = String(raw?.thumbnailUri ?? "").trim();
      const uri = String(raw?.uri ?? "").trim() || (type === "video" ? thumbnailUri || mediaUri : mediaUri || thumbnailUri);
      return {
        id: String(raw?.id ?? "").trim() || buildId(type),
        uri,
        type,
        createdAt: Number(raw?.createdAt ?? Date.now()),
        mediaUri: mediaUri || undefined,
        thumbnailUri: thumbnailUri || undefined,
        mimeType: typeof raw?.mimeType === "string" && raw.mimeType.trim() ? raw.mimeType.trim() : undefined,
        durationMs: typeof raw?.durationMs === "number" && Number.isFinite(raw.durationMs) ? Math.max(0, Math.floor(raw.durationMs)) : undefined,
      };
    })
    .filter((item) => item.uri);
}

function normalizeHistory(value: unknown): GroupHistoryEntry[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      const raw = item as Partial<GroupHistoryEntry>;
      const kind = String(raw?.kind ?? "control") as GroupHistoryEntry["kind"];
      return {
        id: String(raw?.id ?? "").trim() || buildId("hist"),
        title: String(raw?.title ?? "").trim(),
        subtitle: String(raw?.subtitle ?? "").trim(),
        kind,
        createdAt: Number(raw?.createdAt ?? Date.now()),
      };
    })
    .filter((item) => item.title)
    .sort((a, b) => b.createdAt - a.createdAt);
}

function normalizeGroupState(raw?: Partial<GroupProfileState> | null): GroupProfileState {
  const merged: GroupProfileState = {
    ...DEFAULT_GROUP_STATE,
    ...(raw ?? {}),
    publicationPhotos: normalizeMedia(raw?.publicationPhotos, "photo"),
    publicationVideos: normalizeMedia(raw?.publicationVideos, "video"),
    members: normalizeMemberList(raw?.members),
    admins: normalizeAdminList(raw?.admins),
    joinRequests: normalizeJoinRequests(raw?.joinRequests),
    blacklist: normalizeBlacklist(raw?.blacklist),
    history: normalizeHistory(raw?.history),
    likesCount: Number(raw?.likesCount ?? 0),
    publicGiftsCount: Number(raw?.publicGiftsCount ?? 0),
    lastUpdatedAt: Number(raw?.lastUpdatedAt ?? 0),
  };

  if (merged.username) {
    merged.username = sanitizeUsername(merged.username);
  }

  if (merged.groupId && !merged.inviteLink) {
    merged.inviteLink = buildInviteLink(merged.username, merged.groupId);
  }

  if (merged.groupId && !merged.linkedPublicationId) {
    merged.linkedPublicationId = buildPublicationId(merged.groupId);
  }

  if (!merged.isPublic) {
    merged.isPublished = false;
    merged.showInProfile = false;
    merged.allowJoinRequests = true;
  }

  if (merged.created) {
    merged.searchableInDirectory = true;
  }

  return merged;
}

function normalizeGroupCollection(raw?: unknown): GroupCollectionState {
  const source = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : null;

  if (source && Array.isArray(source.groups)) {
    const groups = source.groups
      .map((item) => normalizeGroupState(item as Partial<GroupProfileState>))
      .filter((item) => item.groupId || item.groupName.trim());

    const requestedSelectedId =
      typeof source.selectedGroupId === "string" && source.selectedGroupId.trim()
        ? source.selectedGroupId.trim()
        : null;

    const selectedGroupId =
      requestedSelectedId && groups.some((item) => item.groupId === requestedSelectedId)
        ? requestedSelectedId
        : groups[0]?.groupId || null;

    return { groups, selectedGroupId };
  }

  const legacy = normalizeGroupState(source as Partial<GroupProfileState> | null | undefined);
  if (legacy.groupId || legacy.groupName.trim() || legacy.username.trim()) {
    if (legacy.created || legacy.groupId) {
      return {
        groups: [legacy],
        selectedGroupId: legacy.groupId || null,
      };
    }
  }

  return DEFAULT_GROUP_COLLECTION;
}

function pushHistory(
  state: GroupProfileState,
  entry: Omit<GroupHistoryEntry, "id" | "createdAt">,
): GroupProfileState {
  const nextEntry: GroupHistoryEntry = {
    id: buildId("hist"),
    createdAt: Date.now(),
    ...entry,
  };

  return {
    ...state,
    history: [nextEntry, ...state.history].slice(0, 40),
  };
}

function ensureOwnerAdmin(state: GroupProfileState, ownerFallbackRole: string): GroupProfileState {
  const ownerId = state.ownerUserId.trim();
  if (!ownerId) return state;

  const ownerName = state.ownerName.trim() || "Egasi";
  const ownerRole = state.ownerRole.trim() || ownerFallbackRole;
  const blacklistIds = new Set(state.blacklist.map((item) => item.id));

  const filteredAdmins = state.admins.filter(
    (item) => item.id && item.id !== ownerId && !blacklistIds.has(item.id),
  );

  return {
    ...state,
    admins: [
      {
        id: ownerId,
        name: ownerName,
        role: ownerRole,
      },
      ...filteredAdmins,
    ],
    blacklist: state.blacklist.filter((item) => item.id !== ownerId),
  };
}

function formatRelativeTime(timestamp: number) {
  const diff = Date.now() - timestamp;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < hour) {
    const value = Math.max(1, Math.round(diff / minute));
    return `${value} min oldin`;
  }

  if (diff < day) {
    const value = Math.max(1, Math.round(diff / hour));
    return `${value} soat oldin`;
  }

  const value = Math.max(1, Math.round(diff / day));
  return `${value} kun oldin`;
}


function mapGroupMediaItemsForPublicSurface(items: GroupMediaItem[], kind: "photo" | "video"): GroupPublicMediaItem[] {
  const publicItems: GroupPublicMediaItem[] = [];

  (Array.isArray(items) ? items : []).forEach((item, index) => {
    const mediaUri = String(item?.mediaUri || item?.uri || "").trim();
    const thumbnailUri = String(item?.thumbnailUri || "").trim();
    const uri = kind === "video" ? thumbnailUri || mediaUri : String(item?.uri || mediaUri || thumbnailUri || "").trim();
    const openUri = mediaUri || uri || thumbnailUri;

    if (!uri && !openUri) return;

    publicItems.push({
      id: String(item.id || `${kind}-${index}`),
      uri: uri || openUri,
      mediaUri: openUri || undefined,
      thumbnailUri: thumbnailUri || undefined,
      mimeType: item.mimeType || undefined,
      durationMs: typeof item.durationMs === "number" && Number.isFinite(item.durationMs) ? item.durationMs : undefined,
      kind,
    });
  });

  return publicItems;
}

function normalizeGroupPublicMetricAlias(value: unknown) {
  return String(value || "")
    .trim()
    .replace(/^@+/, "")
    .toLowerCase();
}

function expandGroupPublicMetricAliases(values: unknown[]) {
  const aliases: string[] = [];
  const seen = new Set<string>();

  const push = (value: unknown) => {
    const raw = String(value || "").trim();
    if (!raw) return;

    const variants = [raw];
    const withoutAt = raw.replace(/^@+/, "");
    if (withoutAt && withoutAt !== raw) variants.push(withoutAt);

    if (withoutAt.startsWith("group:")) {
      const withoutPrefix = withoutAt.slice("group:".length).trim();
      if (withoutPrefix) variants.push(withoutPrefix);
    } else if (/^(grp|group)[_-]/i.test(withoutAt)) {
      variants.push(`group:${withoutAt}`);
    }

    variants.forEach((variant) => {
      const normalized = normalizeGroupPublicMetricAlias(variant);
      if (!normalized || seen.has(normalized)) return;
      seen.add(normalized);
      aliases.push(String(variant).trim());
    });
  };

  values.forEach(push);
  return aliases;
}

function buildGroupPublicProfileAliases(group: GroupProfileState) {
  return expandGroupPublicMetricAliases([
    group.groupId,
    group.groupId ? `group:${group.groupId}` : "",
    group.linkedChatId,
    group.linkedPublicationId,
    group.username,
    group.username ? `@${group.username}` : "",
    group.groupName,
    group.inviteLink,
  ]);
}

function mapGroupToPublicProfileSnapshot(group: GroupProfileState): Partial<GroupPublicProfileSnapshot> {
  return {
    chatId: group.linkedChatId || group.groupId || "",
    avatarUri: group.avatarUri || "",
    coverUri: group.coverUri || "",
    publicationPhotos: mapGroupMediaItemsForPublicSurface(group.publicationPhotos, "photo"),
    publicationVideos: mapGroupMediaItemsForPublicSurface(group.publicationVideos, "video"),
    likesCount: Number(group.likesCount || 0),
    publicGiftsCount: Number(group.publicGiftsCount || 0),
    aliases: buildGroupPublicProfileAliases(group),
    updatedAt: Number(group.lastUpdatedAt || Date.now()),
  };
}

function countLikedGroupPublicMedia(snapshot: GroupPublicProfileSnapshot): number {
  const photos = Array.isArray(snapshot.publicationPhotos) ? snapshot.publicationPhotos : [];
  const videos = Array.isArray(snapshot.publicationVideos) ? snapshot.publicationVideos : [];
  return [...photos, ...videos].filter((item) => Boolean(item?.liked)).length;
}

function findGroupPublicMetricSnapshot(group: GroupProfileState): GroupPublicProfileSnapshot | null {
  const identifiers = buildGroupPublicProfileAliases(group);
  const normalizedIdentifiers = new Set(identifiers.map(normalizeGroupPublicMetricAlias).filter(Boolean));

  for (const identifier of identifiers) {
    const snapshot = getGroupPublicProfileSnapshot(identifier);
    if (snapshot?.chatId && (snapshot.likesCount > 0 || snapshot.publicGiftsCount > 0 || countLikedGroupPublicMedia(snapshot) > 0)) {
      return snapshot;
    }
  }

  const allSnapshots = hydrateAllGroupPublicProfiles();
  for (const snapshot of allSnapshots) {
    const snapshotAliases = expandGroupPublicMetricAliases([snapshot.chatId, ...(snapshot.aliases || [])]);
    const hasSharedAlias = snapshotAliases.some((alias) => normalizedIdentifiers.has(normalizeGroupPublicMetricAlias(alias)));
    if (hasSharedAlias) return snapshot;
  }

  return null;
}

function mergeGroupStateWithPublicMetrics(group: GroupProfileState): GroupProfileState {
  const identifiers = buildGroupPublicProfileAliases(group);
  let maxLikes = Number(group.likesCount || 0);
  let maxGifts = Number(group.publicGiftsCount || 0);
  let maxUpdatedAt = Number(group.lastUpdatedAt || 0);

  identifiers.forEach((identifier) => {
    const snapshot = getGroupPublicProfileSnapshot(identifier);
    if (!snapshot?.chatId) return;

    maxLikes = Math.max(maxLikes, Number(snapshot.likesCount || 0), countLikedGroupPublicMedia(snapshot));
    maxGifts = Math.max(maxGifts, Number(snapshot.publicGiftsCount || 0));
    maxUpdatedAt = Math.max(maxUpdatedAt, Number(snapshot.updatedAt || 0));
  });

  const fallbackSnapshot = findGroupPublicMetricSnapshot(group);
  if (fallbackSnapshot?.chatId) {
    maxLikes = Math.max(maxLikes, Number(fallbackSnapshot.likesCount || 0), countLikedGroupPublicMedia(fallbackSnapshot));
    maxGifts = Math.max(maxGifts, Number(fallbackSnapshot.publicGiftsCount || 0));
    maxUpdatedAt = Math.max(maxUpdatedAt, Number(fallbackSnapshot.updatedAt || 0));
  }

  if (maxLikes === Number(group.likesCount || 0) && maxGifts === Number(group.publicGiftsCount || 0)) {
    return group;
  }

  return {
    ...group,
    likesCount: maxLikes,
    publicGiftsCount: maxGifts,
    lastUpdatedAt: maxUpdatedAt || group.lastUpdatedAt || Date.now(),
  };
}



async function mergeGroupStateWithBackendPublicMetrics(group: GroupProfileState): Promise<GroupProfileState> {
  const localMerged = mergeGroupStateWithPublicMetrics(group);
  const identifier = String(localMerged.linkedChatId || localMerged.groupId || "").trim();
  if (!identifier) return localMerged;

  try {
    const auth = getAuthSessionState();
    const apiBaseUrl = String(auth.apiBaseUrl || "").replace(/\/+$/, "");
    if (!apiBaseUrl) return localMerged;

    const headers: Record<string, string> = {};
    if (auth.accessToken) headers.Authorization = "Bearer " + auth.accessToken;
    if (auth.currentUserId) headers["X-User-ID"] = auth.currentUserId;

    const response = await fetch(
      apiBaseUrl + "/api/v2/messenger/groups/" + encodeURIComponent(identifier) + "/public-profile",
      { method: "GET", headers },
    );

    if (!response.ok) return localMerged;

    const payload = await response.json();
    const surface = payload?.data || payload;
    if (!surface || typeof surface !== "object") return localMerged;

    const aliases = expandGroupPublicMetricAliases([
      identifier,
      localMerged.groupId,
      localMerged.linkedChatId,
      localMerged.linkedPublicationId,
      localMerged.username,
      localMerged.groupName,
      ...((Array.isArray((surface as { aliases?: unknown[] }).aliases)
        ? ((surface as { aliases?: unknown[] }).aliases || [])
        : []) as unknown[]),
    ]);

    saveGroupPublicProfile(
      String((surface as { chatId?: string }).chatId || identifier),
      surface as Partial<GroupPublicProfileSnapshot>,
      aliases,
    );

    return mergeGroupStateWithPublicMetrics(localMerged);
  } catch {
    return localMerged;
  }
}

function collectGroupDisplayMediaKeys(items: Array<Partial<GroupMediaItem | GroupPublicMediaItem>>) {
  const keys = new Set<string>();

  items.forEach((item) => {
    [
      item?.id,
      item?.uri,
      item?.mediaUri,
      item?.thumbnailUri,
    ].forEach((value) => {
      const key = String(value || "").trim().toLowerCase();
      if (key) keys.add(key);
    });
  });

  return keys;
}

function groupPublicSnapshotMatchesGroupMedia(group: GroupProfileState, snapshot: GroupPublicProfileSnapshot) {
  const groupKeys = collectGroupDisplayMediaKeys([...group.publicationPhotos, ...group.publicationVideos]);
  if (!groupKeys.size) return false;

  const publicKeys = collectGroupDisplayMediaKeys([
    ...(Array.isArray(snapshot.publicationPhotos) ? snapshot.publicationPhotos : []),
    ...(Array.isArray(snapshot.publicationVideos) ? snapshot.publicationVideos : []),
  ]);

  for (const key of publicKeys) {
    if (groupKeys.has(key)) return true;
  }

  return false;
}

function groupPublicSnapshotMatchesGroupAliases(group: GroupProfileState, snapshot: GroupPublicProfileSnapshot) {
  const identifiers = new Set(buildGroupPublicProfileAliases(group).map(normalizeGroupPublicMetricAlias).filter(Boolean));
  const snapshotAliases = expandGroupPublicMetricAliases([snapshot.chatId, ...(snapshot.aliases || [])]);

  return snapshotAliases.some((alias) => identifiers.has(normalizeGroupPublicMetricAlias(alias)));
}

function getGroupPublicDisplayLikes(group: GroupProfileState): number {
  let likes = Number(group.likesCount || 0);

  const identifiers = buildGroupPublicProfileAliases(group);
  identifiers.forEach((identifier) => {
    const snapshot = getGroupPublicProfileSnapshot(identifier);
    if (!snapshot?.chatId) return;
    likes = Math.max(likes, Number(snapshot.likesCount || 0), countLikedGroupPublicMedia(snapshot));
  });

  hydrateAllGroupPublicProfiles().forEach((snapshot) => {
    if (!snapshot?.chatId) return;

    const matchesByAlias = groupPublicSnapshotMatchesGroupAliases(group, snapshot);
    const matchesByMedia = groupPublicSnapshotMatchesGroupMedia(group, snapshot);

    if (!matchesByAlias && !matchesByMedia) return;

    likes = Math.max(likes, Number(snapshot.likesCount || 0), countLikedGroupPublicMedia(snapshot));
  });

  return likes;
}


const SABI_GROUP_PROFILE_LOCAL_COLLECTION_STORAGE_KEY = "sabi.profile.groups.collection.v1";

// SABI_GROUP_PROFILE_LOCAL_COLLECTION_STORAGE
async function readSabiLocalGroupCollection(): Promise<GroupCollectionState> {
  try {
    const raw = await AsyncStorage.getItem(SABI_GROUP_PROFILE_LOCAL_COLLECTION_STORAGE_KEY);
    if (!raw) return DEFAULT_GROUP_COLLECTION;

    const parsed = JSON.parse(raw);
    return normalizeGroupCollection(parsed);
  } catch {
    return DEFAULT_GROUP_COLLECTION;
  }
}

async function saveSabiLocalGroupCollection(collection: GroupCollectionState): Promise<void> {
  try {
    await AsyncStorage.setItem(
      SABI_GROUP_PROFILE_LOCAL_COLLECTION_STORAGE_KEY,
      JSON.stringify({
        groups: collection.groups,
        selectedGroupId: collection.selectedGroupId,
        updatedAt: Date.now(),
      }),
    );
  } catch {}
}

function mergeSabiGroupCollections(
  localGroups: GroupProfileState[],
  kernelGroups: GroupProfileState[],
): GroupProfileState[] {
  const map = new Map<string, GroupProfileState>();

  for (const source of [...localGroups, ...kernelGroups]) {
    const item = normalizeGroupState(source as Partial<GroupProfileState>);
    const key = item.groupId || item.linkedChatId || item.groupName.trim();

    if (!key) continue;

    const existing = map.get(key);

    if (!existing || Number(item.lastUpdatedAt || 0) >= Number(existing.lastUpdatedAt || 0)) {
      map.set(key, item);
    }
  }

  return Array.from(map.values()).sort((a, b) =>
    Number(b.lastUpdatedAt || 0) - Number(a.lastUpdatedAt || 0),
  );
}

function isSabiRemoteMediaUri(value: string) {
  const uri = value.trim();
  return /^https?:\/\//i.test(uri) || uri.startsWith("/");
}

function isSabiUploadableLocalMediaUri(value: string) {
  const uri = value.trim();
  return /^file:/i.test(uri) || /^content:/i.test(uri) || /^data:/i.test(uri) || /^asset:/i.test(uri) || /^blob:/i.test(uri);
}

function inferSabiGroupMediaMimeType(uri: string, fallbackKind: "photo" | "video") {
  const lower = uri.toLowerCase();

  if (lower.includes("image/png") || lower.endsWith(".png")) return "image/png";
  if (lower.includes("image/webp") || lower.endsWith(".webp")) return "image/webp";
  if (lower.includes("image/heic") || lower.endsWith(".heic")) return "image/heic";
  if (lower.includes("video/quicktime") || lower.endsWith(".mov")) return "video/quicktime";
  if (lower.includes("video/mp4") || lower.endsWith(".mp4")) return "video/mp4";

  return fallbackKind === "video" ? "video/mp4" : "image/jpeg";
}

function inferSabiGroupMediaName(uri: string, fallbackKind: "photo" | "video") {
  const clean = uri.split("?")[0] || "";
  const last = clean.split("/").pop();

  if (last && last.includes(".")) return last;

  return `sabi-group-${fallbackKind}-${Date.now()}${fallbackKind === "video" ? ".mp4" : ".jpg"}`;
}

// SABI_GROUP_PUBLIC_MEDIA_UPLOAD
async function uploadSabiGroupPublicMediaUri(
  uri: string,
  fallbackKind: "photo" | "video",
): Promise<string> {
  const cleanUri = typeof uri === "string" ? uri.trim() : "";

  if (!cleanUri) return "";
  if (isSabiRemoteMediaUri(cleanUri)) return cleanUri;
  if (!isSabiUploadableLocalMediaUri(cleanUri)) return cleanUri;

  const session = getAuthSessionState();
  const fileName = inferSabiGroupMediaName(cleanUri, fallbackKind);
  const mimeType = inferSabiGroupMediaMimeType(cleanUri, fallbackKind);

  try {
    const uploadedUri = await uploadUserPublicProfileMediaFile(
      {
        uri: cleanUri,
        name: fileName,
        fileName,
        mimeType,
        type: mimeType,
      },
      session,
    );

    return uploadedUri || "";
  } catch (error) {
    console.warn("[sabi-profile-group] media_upload_failed", error);
    return "";
  }
}

async function prepareSabiGroupPublicMediaForSync(
  state: GroupProfileState,
): Promise<GroupProfileState> {
  const next: GroupProfileState = {
    ...state,
    publicationPhotos: Array.isArray(state.publicationPhotos) ? [...state.publicationPhotos] : [],
    publicationVideos: Array.isArray(state.publicationVideos) ? [...state.publicationVideos] : [],
  };

  if (next.avatarUri) {
    next.avatarUri = await uploadSabiGroupPublicMediaUri(next.avatarUri, "photo");
  }

  if (next.coverUri) {
    next.coverUri = await uploadSabiGroupPublicMediaUri(next.coverUri, "photo");
  }

  const uploadedPublicationPhotos = await Promise.all(
    next.publicationPhotos.map(async (item): Promise<GroupMediaItem | null> => {
      const uploadedUri = await uploadSabiGroupPublicMediaUri(String(item.mediaUri || item.uri || ""), "photo");
      if (!uploadedUri) return null;

      return {
        ...item,
        uri: uploadedUri,
        mediaUri: uploadedUri,
        thumbnailUri: undefined,
      };
    }),
  );

  next.publicationPhotos = uploadedPublicationPhotos.filter((item): item is GroupMediaItem => item !== null);

  const uploadedPublicationVideos = await Promise.all(
    next.publicationVideos.map(async (item): Promise<GroupMediaItem | null> => {
      const uploadedUri = await uploadSabiGroupPublicMediaUri(String(item.mediaUri || item.uri || ""), "video");
      if (!uploadedUri) return null;

      return {
        ...item,
        uri: item.thumbnailUri || uploadedUri,
        mediaUri: uploadedUri,
      };
    }),
  );

  next.publicationVideos = uploadedPublicationVideos.filter((item): item is GroupMediaItem => item !== null);

  return next;
}
export default function GroupProfileScreen() {
  const params = useLocalSearchParams<RouteParams>();
  const i18n = useI18n() as I18nHookValue;
  const { width } = useWindowDimensions();
  const currentUserId = useMemo(() => resolveCurrentUserId(params), [params]);
  const realtimeChannel = useMemo(
    () => (currentUserId ? `messenger:groups:${currentUserId}` : "messenger:groups:public"),
    [currentUserId],
  );

  const [form, setForm] = useState<GroupProfileState>(DEFAULT_GROUP_STATE);
  const [groups, setGroups] = useState<GroupProfileState[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const realtimeMutationRef = useRef<string>("");

  const [adminDraft, setAdminDraft] = useState<DraftAdmin>({ id: "", name: "", role: "" });
  const [memberDraft, setMemberDraft] = useState<DraftMember>({ id: "", name: "", role: "" });
  const [blacklistDraft, setBlacklistDraft] = useState<DraftBlacklist>({
    id: "",
    name: "",
    reason: "",
  });
  const consumedSelectedMemberRef = useRef<string>("");

  const t = useCallback(
    (key: string, params?: Record<string, unknown>) => {
      if (typeof i18n === "function") {
        const value = i18n(key, params);
        return typeof value === "string" && value.length ? value : key;
      }

      if (i18n && typeof i18n.t === "function") {
        const value = i18n.t(key, params);
        return typeof value === "string" && value.length ? value : key;
      }

      return key;
    },
    [i18n],
  );

  const tt = useCallback(
    (key: string, fallback: string, params?: Record<string, unknown>) => {
      const value = t(key, params);
      return value === key ? fallback : value;
    },
    [t],
  );

  const listCardWidth = useMemo(() => {
    const outer = 16 * 2;
    const sectionPadding = 16 * 2;
    const gap = 10;
    const value = (width - outer - sectionPadding - gap) / 2;
    return Math.max(140, Math.floor(value));
  }, [width]);

  const heroCardWidth = useMemo(() => {
    const outer = 16 * 2;
    const sectionPadding = 16 * 2;
    const gap = 10;
    const value = (width - outer - sectionPadding - gap) / 2;
    return Math.max(140, Math.floor(value));
  }, [width]);

  const shelfCardWidth = useMemo(() => {
    const outer = 16 * 2;
    const cardPadding = 16 * 2;
    const gap = 10;
    const value = (width - outer - cardPadding - gap) / 2;
    return Math.max(148, Math.floor(value));
  }, [width]);

  const infoChipWidth = useMemo(() => {
    return Math.max(148, listCardWidth);
  }, [listCardWidth]);

  const groupDisplayLikesCount = useMemo(() => getGroupPublicDisplayLikes(form), [form]);


  
const loadData = useCallback(async () => {
  try {
    await profileKernelFacade.boot();
    await hydrateGroupPublicProfileStorage();

    const collection = profileKernelFacade.selectors.groupProfiles();

    const kernelGroups = Array.isArray(collection?.items)
      ? collection.items
          .map((item) => normalizeGroupState(item as Partial<GroupProfileState>))
          .map(mergeGroupStateWithPublicMetrics)
      : [];

    const kernelSelected =
      typeof collection?.selectedId === "string" && collection.selectedId.trim()
        ? collection.selectedId.trim()
        : null;

    const localCollection = await readSabiLocalGroupCollection();
    const localGroups = Array.isArray(localCollection.groups)
      ? localCollection.groups
          .map((item: GroupProfileState) => normalizeGroupState(item as Partial<GroupProfileState>))
          .map(mergeGroupStateWithPublicMetrics)
      : [];

    const localSelected =
      typeof localCollection.selectedGroupId === "string" && localCollection.selectedGroupId.trim()
        ? localCollection.selectedGroupId.trim()
        : null;

    const runtimeMergedGroups = (
      await bindGroupsToMessengerRuntime(
        mergeSabiGroupCollections(localGroups, kernelGroups),
      )
    ).map(mergeGroupStateWithPublicMetrics);

    const mergedGroups = await Promise.all(
      runtimeMergedGroups.map(mergeGroupStateWithBackendPublicMetrics),
    );

    const selected =
      (kernelSelected && mergedGroups.some((item) => item.groupId === kernelSelected)
        ? kernelSelected
        : null) ||
      (localSelected && mergedGroups.some((item) => item.groupId === localSelected)
        ? localSelected
        : null) ||
      mergedGroups[0]?.groupId ||
      null;

    setGroups(mergedGroups);
    setSelectedGroupId(selected);
    setForm(mergedGroups.find((item) => item.groupId === selected) || mergedGroups[0] || DEFAULT_GROUP_STATE);

    if (mergedGroups.length) {
      await saveSabiLocalGroupCollection({
        groups: mergedGroups,
        selectedGroupId: selected,
      });
    }
  } catch {
    try {
      await hydrateGroupPublicProfileStorage();
    } catch {}

    const localCollection = await readSabiLocalGroupCollection();
    const localGroups = Array.isArray(localCollection.groups)
      ? localCollection.groups
          .map((item: GroupProfileState) => normalizeGroupState(item as Partial<GroupProfileState>))
          .map(mergeGroupStateWithPublicMetrics)
      : [];

    const backendMergedLocalGroups = await Promise.all(
      localGroups.map(mergeGroupStateWithBackendPublicMetrics),
    );

    setGroups(backendMergedLocalGroups);
    setSelectedGroupId(localCollection.selectedGroupId);
    setForm(
      backendMergedLocalGroups.find((item: GroupProfileState) => item.groupId === localCollection.selectedGroupId) ||
        backendMergedLocalGroups[0] ||
        DEFAULT_GROUP_STATE,
    );
  } finally {
    setIsReady(true);
  }
}, []);

  useFocusEffect(
    useCallback(() => {
      void loadData();
      return undefined;
    }, [loadData]),
  );

  useEffect(() => {
    return subscribeGroupPublicProfiles(() => {
      setGroups((current) => current.map(mergeGroupStateWithPublicMetrics));
      setForm((current) => mergeGroupStateWithPublicMetrics(current));
    });
  }, []);

  const ownerRoleText = form.ownerRole.trim() || "Egasi";

  const groupInitial = useMemo(() => {
    return (form.groupName.trim().charAt(0) || "G").toUpperCase();
  }, [form.groupName]);

  const activeStoredGroup = useMemo(
    () => groups.find((item) => item.groupId === selectedGroupId) || null,
    [groups, selectedGroupId],
  );

  const beginNewGroup = useCallback(() => {
    setSelectedGroupId(null);
    setForm(DEFAULT_GROUP_STATE);
    setAdminDraft({ id: "", name: "", role: "" });
    setMemberDraft({ id: "", name: "", role: "" });
    setBlacklistDraft({ id: "", name: "", reason: "" });
    setActiveTab("overview");
  }, []);

  const openStoredGroup = useCallback((groupId: string) => {
    const target = groups.find((item) => item.groupId === groupId);
    if (!target) return;
    setSelectedGroupId(groupId);
    setForm(target);
    setAdminDraft({ id: "", name: "", role: "" });
    setMemberDraft({ id: "", name: "", role: "" });
    setBlacklistDraft({ id: "", name: "", reason: "" });
    setActiveTab("overview");
  }, [groups]);

  const persistCollection = useCallback(
    async (
      nextGroups: GroupProfileState[],
      nextSelectedGroupId: string | null,
      nextForm: GroupProfileState,
      successTitle?: string,
      successMessage?: string,
      _realtimeEvent?: {
        type: "group:created" | "group:updated" | "group:deleted" | "group:members";
        payload: Partial<GroupProfileState> & { groupId?: string; linkedChatId?: string; deletedGroupId?: string };
      },
    ) => {
      try {
        setIsSaving(true);
        // SABI_GROUP_PUBLIC_MEDIA_UPLOAD_BEFORE_SAVE
        const mediaReadyGroups = await Promise.all(
          nextGroups.map((item) =>
            prepareSabiGroupPublicMediaForSync({
              ...item,
              lastUpdatedAt: item.lastUpdatedAt || Date.now(),
            }),
          ),
        );

        const finalizedGroups = await bindGroupsToMessengerRuntime(mediaReadyGroups);
        const payload: GroupCollectionState = {
          groups: finalizedGroups,
          selectedGroupId: nextSelectedGroupId,
        };
        // SABI_PROFILE_GROUP_LOCAL_SAVE_COLLECTION
        await saveSabiLocalGroupCollection(payload);

        try {
          await profileKernelFacade.saveGroupProfiles({
            items: payload.groups as unknown as Record<string, unknown>[],
            selectedId: payload.selectedGroupId,
          });
        } catch (error) {
          console.warn("[sabi-profile-group] kernel_save_skipped", error);
        }

        setGroups(finalizedGroups);
        setSelectedGroupId(nextSelectedGroupId);
        const persistedActive =
          finalizedGroups.find((item) => item.groupId === nextSelectedGroupId) ||
          finalizedGroups.find((item) => item.groupId === nextForm.groupId) ||
          nextForm;
        saveGroupPublicProfile(
          persistedActive.linkedChatId || persistedActive.groupId,
          mapGroupToPublicProfileSnapshot(persistedActive),
          buildGroupPublicProfileAliases(persistedActive),
        );

        await profileKernelFacade.saveGroupPreview(persistedActive ? {
          ...(persistedActive as any),
          created: Boolean(persistedActive.created),
          groupId: persistedActive.groupId,
          groupName: persistedActive.groupName,
          name: persistedActive.groupName,
          title: persistedActive.groupName,
          username: persistedActive.username,
          description: persistedActive.description,
          avatarUri: persistedActive.avatarUri,
          avatarUrl: persistedActive.avatarUri,
          photoUrl: persistedActive.avatarUri,
          coverUri: persistedActive.coverUri,
          coverUrl: persistedActive.coverUri,
          isPublic: Boolean(persistedActive.isPublic),
          isPublished: Boolean(persistedActive.isPublished),
          showInProfile: Boolean(persistedActive.showInProfile),
          searchableInDirectory: Boolean(persistedActive.searchableInDirectory),
          ownerUserId: persistedActive.ownerUserId,
          ownerName: persistedActive.ownerName,
          ownerRole: persistedActive.ownerRole,
          ownerPhone: persistedActive.ownerPhone,
          ownerEmail: persistedActive.ownerEmail,
          linkedPublicationId: persistedActive.linkedPublicationId,
          linkedChatId: persistedActive.linkedChatId,
          inviteLink: persistedActive.inviteLink,
          members: persistedActive.members,
          admins: persistedActive.admins,
          membersCount: countMessengerParticipants(persistedActive),
          // SABI_GROUP_PREVIEW_PUBLIC_PROFILE_MEDIA
          publicPhotos: mapGroupMediaItemsForPublicSurface(persistedActive.publicationPhotos, "photo"),
          publicVideos: mapGroupMediaItemsForPublicSurface(persistedActive.publicationVideos, "video"),
          publicationPhotos: mapGroupMediaItemsForPublicSurface(persistedActive.publicationPhotos, "photo"),
          publicationVideos: mapGroupMediaItemsForPublicSurface(persistedActive.publicationVideos, "video"),
          likesCount: persistedActive.likesCount,
          publicGiftsCount: persistedActive.publicGiftsCount,
          roomType: "group",
          type: "group",
          updatedAt: new Date(persistedActive.lastUpdatedAt || Date.now()).toISOString(),
        } as any : null);
        await persistGroupMessengerRoomSnapshot(persistedActive);
// SABI_PROFILE_GROUP_PUBLIC_DIRECTORY_SYNC
        await syncSabiProfileGroupsCollectionToPublicDirectory(finalizedGroups as any[]);
        await syncSabiProfileGroupToPublicDirectory(persistedActive as any);
setForm(persistedActive);
        if (successTitle && successMessage) {
          Alert.alert(successTitle, successMessage);
        }
      } catch {
        Alert.alert(
          tt("profile.groupScreen.alerts.error.title", "Xato"),
          tt("profile.groupScreen.alerts.error.saveFailed", "Guruh ma'lumotlarini saqlab bo'lmadi."),
        );
      } finally {
        setIsSaving(false);
      }
    },
    [tt],
  );

  const persistDraftRealtimeState = useCallback(
    (nextState: GroupProfileState, eventType: "group:updated" | "group:members" = "group:updated") => {
      if (!nextState.created || !nextState.groupId) return;

      const finalized = {
        ...nextState,
        lastUpdatedAt: Date.now(),
      };

      const nextGroups = (() => {
        const exists = groups.some((item) => item.groupId === finalized.groupId);
        if (!exists) return [finalized, ...groups];
        return groups.map((item) => (item.groupId === finalized.groupId ? finalized : item));
      })();

      void persistCollection(
        nextGroups,
        finalized.groupId,
        finalized,
        undefined,
        undefined,
        {
          type: eventType,
          payload: finalized,
        },
      );
    },
    [groups, persistCollection],
  );

  const syncedForm = useMemo(() => ensureOwnerAdmin(form, ownerRoleText), [form, ownerRoleText]);

  const totalParticipants = useMemo(() => {
    const ids = new Set<string>();
    if (form.ownerUserId.trim()) ids.add(form.ownerUserId.trim());
    form.admins.forEach((item) => item.id && ids.add(item.id));
    form.members.forEach((item) => item.id && ids.add(item.id));
    return ids.size;
  }, [form.admins, form.members, form.ownerUserId]);

  const setField = useCallback(
    (
      key: keyof GroupProfileState,
      value: GroupProfileState[keyof GroupProfileState],
      persistEventType?: "group:updated" | "group:members",
    ) => {
      let persistedState: GroupProfileState | null = null;

      setForm((prev) => {
        const next = { ...prev, [key]: value } as GroupProfileState;

        if (key === "username") {
          const clean = sanitizeUsername(String(value));
          next.username = clean;
          if (next.groupId) {
            next.inviteLink = buildInviteLink(clean, next.groupId);
          }
          if (!next.publicationSlug.trim()) {
            next.publicationSlug = buildDefaultPublicationSlug(next.groupName, clean, next.groupId);
          }
        }

        if (key === "groupName") {
          const groupName = String(value);
          if (!next.publicationTitle.trim()) {
            next.publicationTitle = groupName;
          }
          if (!next.publicationSlug.trim()) {
            next.publicationSlug = buildDefaultPublicationSlug(groupName, next.username, next.groupId);
          }
        }

        if (key === "publicationSlug") {
          next.publicationSlug = sanitizeSlug(String(value));
        }

        if (key === "isPublic") {
          next.searchableInDirectory = true;
          if (value === true) {
            next.allowJoinRequests = false;
            next.onlyAdminsCanPost = false;
            next.allowMemberInvites = false;
            next.messageApprovalRequired = true;
            next.mediaApprovalRequired = true;
          } else {
            next.isPublished = false;
            next.showInProfile = false;
            next.allowJoinRequests = true;
          }
        }

        const finalState =
          key === "ownerUserId" || key === "ownerName" || key === "ownerRole"
            ? ensureOwnerAdmin(next, ownerRoleText)
            : next;

        persistedState = finalState;
        return finalState;
      });

      if (persistEventType && persistedState) {
        persistDraftRealtimeState(persistedState, persistEventType);
      }
    },
    [ownerRoleText, persistDraftRealtimeState],
  );


  const buildCreatedState = useCallback(
    (source: GroupProfileState) => {
      const groupName = source.groupName.trim();
      if (!groupName) return null;

      const groupId = source.groupId.trim() || buildId("grp");
      const username = sanitizeUsername(source.username);
      const ownerUserId = source.ownerUserId.trim() || currentUserId || buildId("owner");
      const ownerName = source.ownerName.trim() || "Egasi";
      const ownerRole = source.ownerRole.trim() || "Egasi";
      const inviteLink = buildInviteLink(username, groupId);
      const publicationSlug =
        source.publicationSlug.trim() || buildDefaultPublicationSlug(groupName, username, groupId);

      let nextState: GroupProfileState = {
        ...source,
        created: true,
        groupId,
        groupName,
        username,
        ownerUserId,
        ownerName,
        ownerRole,
        inviteLink,
        linkedChatId: source.linkedChatId.trim() || `group:${groupId}`,
        linkedPublicationId: source.linkedPublicationId.trim() || buildPublicationId(groupId),
        publicationTitle: source.publicationTitle.trim() || groupName,
        publicationSlug,
        isPublished: source.isPublic ? source.isPublished : false,
        showInProfile: source.isPublic ? source.showInProfile : false,
        searchableInDirectory: true,
        allowJoinRequests: source.isPublic ? false : true,
        onlyAdminsCanPost: source.isPublic ? false : source.onlyAdminsCanPost,
        messageApprovalRequired: true,
        mediaApprovalRequired: true,
      };

      nextState = ensureOwnerAdmin(nextState, ownerRole);
      return nextState;
    },
    [],
  );

  const handleCreateGroup = useCallback(async () => {
    if (!form.groupName.trim()) {
      Alert.alert(
        tt("profile.groupScreen.alerts.validation.nameTitle", "Guruh nomi kerak"),
        tt(
          "profile.groupScreen.alerts.validation.nameMessage",
          "Guruh yaratish uchun guruh nomini kiriting.",
        ),
      );
      return;
    }

    const createdState = buildCreatedState(form);
    if (!createdState) return;

    const nextState = {
      ...pushHistory(createdState, {
        kind: "identity",
        title: tt("profile.groupScreen.actions.create", "Guruh yaratish"),
        subtitle: tt("profile.groupScreen.alerts.success.created", "Guruh yaratildi"),
      }),
      lastUpdatedAt: Date.now(),
    };

    const nextGroups = [
      nextState,
      ...groups.filter((item) => item.groupId !== nextState.groupId),
    ];

    await persistCollection(
      nextGroups,
      nextState.groupId,
      nextState,
      tt("profile.groupScreen.alerts.success.title", "Tayyor"),
      tt("profile.groupScreen.alerts.success.created", "Guruh yaratildi"),
      {
        type: "group:created",
        payload: nextState,
      },
    );
  }, [buildCreatedState, form, groups, persistCollection, tt]);

  const handleSaveChanges = useCallback(async () => {
    if (!form.groupName.trim()) {
      Alert.alert(
        tt("profile.groupScreen.alerts.validation.nameTitle", "Guruh nomi kerak"),
        tt(
          "profile.groupScreen.alerts.validation.nameMessage",
          "Guruh yaratish uchun guruh nomini kiriting.",
        ),
      );
      return;
    }

    const baseState = buildCreatedState(form);
    if (!baseState) return;

    const nextState = {
      ...pushHistory(baseState, {
        kind: "control",
        title: tt("profile.groupScreen.actions.save", "Saqlash"),
        subtitle: tt("profile.groupScreen.alerts.success.saved", "Guruh sozlamalari saqlandi"),
      }),
      lastUpdatedAt: Date.now(),
    };

    const nextGroups = (() => {
      const targetId = nextState.groupId;
      if (!targetId) return [nextState, ...groups];
      const exists = groups.some((item) => item.groupId === targetId);
      if (!exists) return [nextState, ...groups];
      return groups.map((item) => (item.groupId === targetId ? nextState : item));
    })();

    await persistCollection(
      nextGroups,
      nextState.groupId,
      nextState,
      tt("profile.groupScreen.alerts.success.title", "Tayyor"),
      tt("profile.groupScreen.alerts.success.saved", "Guruh sozlamalari saqlandi"),
      {
        type: "group:updated",
        payload: nextState,
      },
    );
  }, [buildCreatedState, form, groups, persistCollection, tt]);

  const handleResetGroup = useCallback(() => {
    Alert.alert(
      tt("profile.groupScreen.alerts.resetConfirm.title", "Guruhni tiklash"),
      tt(
        "profile.groupScreen.alerts.resetConfirm.message",
        "Joriy guruh shu ekrandan olib tashlanadi va yaratish rejimiga qaytasiz.",
      ),
      [
        {
          text: tt("profile.groupScreen.alerts.resetConfirm.cancel", "Bekor qilish"),
          style: "cancel",
        },
        {
          text: tt("profile.groupScreen.alerts.resetConfirm.confirm", "Tiklash"),
          style: "destructive",
          onPress: async () => {
            const currentId = selectedGroupId || form.groupId || null;
            if (!currentId) {
              beginNewGroup();
              return;
            }

            const remainingGroups = groups.filter((item) => item.groupId !== currentId);
            const nextSelected = remainingGroups[0]?.groupId || null;
            const nextForm = remainingGroups[0] || DEFAULT_GROUP_STATE;

            await persistCollection(
              remainingGroups,
              nextSelected,
              nextForm,
              tt("profile.groupScreen.alerts.success.title", "Tayyor"),
              tt("profile.groupScreen.alerts.success.reset", "Guruh ma'lumotlari tiklandi"),
              {
                type: "group:deleted",
                payload: {
                  deletedGroupId: currentId,
                  groupId: currentId,
                  linkedChatId: form.linkedChatId,
                  groupName: form.groupName,
                },
              },
            );

            setAdminDraft({ id: "", name: "", role: "" });
            setMemberDraft({ id: "", name: "", role: "" });
            setBlacklistDraft({ id: "", name: "", reason: "" });
            setActiveTab("overview");
          },
        },
      ],
    );
  }, [beginNewGroup, form.groupId, groups, persistCollection, selectedGroupId, tt]);

  const openPicker = useCallback(
    async (mode: "avatar" | "cover" | "photo" | "video") => {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          tt("common.error", "Ruxsat kerak"),
          tt("profile.photosScreen.alerts.permissionMessage", "Galereyangizga kirishga ruxsat bering."),
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes:
          mode === "video"
            ? ImagePicker.MediaTypeOptions.Videos
            : ImagePicker.MediaTypeOptions.Images,
        allowsEditing: mode !== "video",
        quality: 0.92,
      });

      if (result.canceled || !result.assets.length) return;
      const asset = result.assets[0];
      const publicUri = await uploadSabiGroupPublicMediaUri(
        asset.uri,
        mode === "video" ? "video" : "photo",
      );

      if (!publicUri) return;

      let persistedState: GroupProfileState | null = null;
      setForm((prev) => {
        let next = { ...prev };

        if (mode === "avatar") {
          next.avatarUri = publicUri;
          next = pushHistory(next, {
            kind: "identity",
            title: tt("profile.photosScreen.header.title", "Rasmlar"),
            subtitle: tt("profile.editScreen.hero.changeAvatarAction", "Avatarni almashtirish"),
          });
        }

        if (mode === "cover") {
          next.coverUri = publicUri;
          next = pushHistory(next, {
            kind: "publication",
            title: tt("profile.groupScreen.sections.publication.title", "Nashr va ommaviy qatlam"),
            subtitle: tt("common.update", "Yangilash"),
          });
        }

        if (mode === "photo") {
          const nextPhoto: GroupMediaItem = {
            id: buildId("photo"),
            type: "photo",
            uri: publicUri,
            mediaUri: publicUri,
            mimeType: typeof asset.mimeType === "string" ? asset.mimeType : undefined,
            createdAt: Date.now(),
          };

          next.publicationPhotos = [nextPhoto, ...prev.publicationPhotos].slice(0, 12);
          next = pushHistory(next, {
            kind: "publication",
            title: tt("profile.photosScreen.header.title", "Rasmlar"),
            subtitle: tt("common.add", "QoвЂshish"),
          });
        }

        if (mode === "video") {
          const nextVideo: GroupMediaItem = {
            id: buildId("video"),
            type: "video",
            uri: publicUri,
            mediaUri: publicUri,
            mimeType: typeof asset.mimeType === "string" ? asset.mimeType : undefined,
            durationMs: typeof asset.duration === "number" ? asset.duration : undefined,
            createdAt: Date.now(),
          };

          next.publicationVideos = [nextVideo, ...prev.publicationVideos].slice(0, 12);
          next = pushHistory(next, {
            kind: "publication",
            title: tt("profile.shortVideosScreen.header.title", "Qisqa videolar"),
            subtitle: tt("common.add", "QoвЂshish"),
          });
        }

        persistedState = next;
        return next;
      });

      if (persistedState) {
        persistDraftRealtimeState(persistedState, "group:updated");
      }
    },
    [persistDraftRealtimeState, tt],
  );

  const handleRemoveMedia = useCallback(
    (id: string, type: "photo" | "video") => {
      let persistedState: GroupProfileState | null = null;
      setForm((prev) => {
        const next = {
          ...prev,
          publicationPhotos:
            type === "photo"
              ? prev.publicationPhotos.filter((item) => item.id !== id)
              : prev.publicationPhotos,
          publicationVideos:
            type === "video"
              ? prev.publicationVideos.filter((item) => item.id !== id)
              : prev.publicationVideos,
        };

        const historyState = pushHistory(next, {
          kind: "publication",
          title: tt("common.remove", "Olib tashlash"),
          subtitle:
            type === "photo"
              ? tt("profile.photosScreen.header.title", "Rasmlar")
              : tt("profile.shortVideosScreen.header.title", "Qisqa videolar"),
        });
        persistedState = historyState;
        return historyState;
      });

      if (persistedState) {
        persistDraftRealtimeState(persistedState, "group:updated");
      }
    },
    [persistDraftRealtimeState, tt],
  );


  const openCurrentGroupChat = useCallback(async () => {
    if (!form.created || !form.linkedChatId.trim()) {
      Alert.alert(
        tt("profile.groupScreen.alerts.validation.nameTitle", "Guruh nomi kerak"),
        tt("profile.groupScreen.readonly.notice", "Avval guruhni yarating"),
      );
      return;
    }

    await openMessengerRoom({
      chatId: form.linkedChatId,
      name: form.groupName.trim() || "Yangi guruh",
      roomType: "group",
      subtitle: `${countMessengerParticipants(form)} a'zolar`,
      avatarLetter: (form.groupName.trim().charAt(0) || "G").toUpperCase(),
      avatarUrl: form.avatarUri || undefined,
      photoUrl: form.avatarUri || undefined,
      coverUrl: form.coverUri || undefined,
      publicPhotos: JSON.stringify(mapGroupMediaItemsForPublicSurface(form.publicationPhotos, "photo")),
      publicVideos: JSON.stringify(mapGroupMediaItemsForPublicSurface(form.publicationVideos, "video")),
      publicationPhotos: JSON.stringify(mapGroupMediaItemsForPublicSurface(form.publicationPhotos, "photo")),
      publicationVideos: JSON.stringify(mapGroupMediaItemsForPublicSurface(form.publicationVideos, "video")),
      likesCount: String(groupDisplayLikesCount || 0),
      publicGiftsCount: String(form.publicGiftsCount || 0),
      verified: form.isPublished ? "1" : undefined,
      currentUserId: currentUserId || form.ownerUserId || undefined,
ownerUserId: form.ownerUserId || currentUserId || undefined,
memberIds: JSON.stringify(Array.from(new Set([currentUserId, form.ownerUserId, ...form.members.map((item) => item.id)].filter(Boolean)))),
adminIds: JSON.stringify(Array.from(new Set([form.ownerUserId, ...form.admins.map((item) => item.id)].filter(Boolean)))),
membershipStatus: "member",
canSendMessages: "1",
groupAccess: "member",
      markRead: false,
    });
  }, [currentUserId, form, tt]);

  const upsertMember = useCallback(
    (member: GroupMember, origin: "manual" | "contact") => {
      const id = member.id.trim();
      const name = member.name.trim();
      const role = member.role.trim() || tt("common.member", "AвЂ™zo");

      if (!id || !name) {
        Alert.alert(
          tt("common.required", "Majburiy"),
          tt("profile.groupScreen.alerts.validation.adminMessage", "Foydalanuvchi ID va ismni kiriting."),
        );
        return false;
      }

      if (form.blacklist.some((item) => item.id === id)) {
        Alert.alert(
          tt("profile.groupScreen.alerts.validation.blacklistConflictTitle", "Blok ro'yxatida bor"),
          tt(
            "profile.groupScreen.alerts.validation.blacklistConflictMessage",
            "Blok ro'yxatidagi foydalanuvchini admin qilib bo'lmaydi.",
          ),
        );
        return false;
      }

      let persistedState: GroupProfileState | null = null;

      setForm((prev) => {
        const next = pushHistory(
          {
            ...prev,
            members: [...prev.members.filter((item) => item.id !== id), { id, name, role }],
          },
          {
            kind: "community",
            title:
              origin === "contact"
                ? tt("messenger.addMembers", "Kontakt qoвЂshish")
                : tt("messenger.addMember", "AвЂ™zo qoвЂshish"),
            subtitle: `${name} В· ${role}`,
          },
        );

        persistedState = next;
        return next;
      });

      if (persistedState) {
        persistDraftRealtimeState(persistedState, "group:members");
      }

      return true;
    },
    [form.blacklist, persistDraftRealtimeState, tt],
  );

  const handleOpenContactsForMemberAdd = useCallback(() => {
    const provisionalGroupId = form.groupId.trim() || selectedGroupId || buildId("grp");
    const provisionalChatId = form.linkedChatId.trim() || provisionalGroupId;
    const ownerSeed = form.ownerUserId.trim() || buildId("owner");

    router.push({
      pathname: "/tabs/contacts",
      params: {
        userId: ownerSeed,
        groupId: provisionalGroupId,
        linkedChatId: provisionalChatId,
        mode: "invite_to_group",
        source: "group_profile",
        returnTo: "group_profile",
        selectedGroupId: selectedGroupId || provisionalGroupId,
        groupName: form.groupName.trim() || "Yangi guruh",
      },
    } as never);
  }, [form.groupId, form.groupName, form.linkedChatId, form.ownerUserId, selectedGroupId]);

  const handleAddMember = useCallback(() => {
    const added = upsertMember(
      {
        id: memberDraft.id,
        name: memberDraft.name,
        role: memberDraft.role,
      },
      "manual",
    );

    if (added) {
      setMemberDraft({ id: "", name: "", role: "" });
    }
  }, [memberDraft, upsertMember]);

  const handleRemoveMember = useCallback(
    (id: string) => {
      let persistedState: GroupProfileState | null = null;
      setForm((prev) => {
        const member = prev.members.find((item) => item.id === id);
        const next = pushHistory(
          { ...prev, members: prev.members.filter((item) => item.id !== id) },
          {
            kind: "community",
            title: tt("messenger.removeMember", "A'zoni olib tashlash"),
            subtitle: member?.name || id,
          },
        );
        persistedState = next;
        return next;
      });
      if (persistedState) {
        persistDraftRealtimeState(persistedState, "group:members");
      }
    },
    [persistDraftRealtimeState, tt],
  );

  const handleApproveJoinRequest = useCallback(
    (requestUserId: string) => {
      let persistedState: GroupProfileState | null = null;

      setForm((prev) => {
        const request = prev.joinRequests.find((item) => item.userId === requestUserId);
        if (!request) return prev;

        const role = tt("common.member", "AвЂ™zo");
        const nextMembers = prev.members.some((item) => item.id === request.userId)
          ? prev.members
          : [
              ...prev.members,
              { id: request.userId, name: request.name || request.userId, role },
            ];

        const next = pushHistory(
          {
            ...prev,
            members: nextMembers,
            joinRequests: prev.joinRequests.filter((item) => item.userId !== request.userId),
          },
          {
            kind: "community",
            title: tt("profile.groupScreen.joinRequest.approved", "So'rov tasdiqlandi"),
            subtitle: request.name || request.userId,
          },
        );

        persistedState = next;
        return next;
      });

      if (persistedState) {
        persistDraftRealtimeState(persistedState, "group:members");
      }
    },
    [persistDraftRealtimeState, tt],
  );

  const handleRejectJoinRequest = useCallback(
    (requestUserId: string) => {
      let persistedState: GroupProfileState | null = null;

      setForm((prev) => {
        const request = prev.joinRequests.find((item) => item.userId === requestUserId);
        if (!request) return prev;

        const next = pushHistory(
          {
            ...prev,
            joinRequests: prev.joinRequests.filter((item) => item.userId !== request.userId),
          },
          {
            kind: "community",
            title: tt("profile.groupScreen.joinRequest.rejected", "So'rov rad etildi"),
            subtitle: request.name || request.userId,
          },
        );

        persistedState = next;
        return next;
      });

      if (persistedState) {
        persistDraftRealtimeState(persistedState, "group:members");
      }
    },
    [persistDraftRealtimeState, tt],
  );

  const selectedRouteMember = useMemo(() => extractSelectedMemberFromParams(params), [params]);

  useEffect(() => {
    if (!selectedRouteMember?.id) return;
    if (consumedSelectedMemberRef.current === selectedRouteMember.id) return;

    const added = upsertMember(selectedRouteMember, "contact");
    if (!added) return;

    consumedSelectedMemberRef.current = selectedRouteMember.id;
    setActiveTab("members");
    Alert.alert(
      tt("messenger.addMembers", "Kontakt qoвЂshish"),
      `${selectedRouteMember.name} ${tt("common.add", "QoвЂshish")}`,
    );
  }, [selectedRouteMember, tt, upsertMember]);

  const handleAddAdmin = useCallback(() => {
    const id = adminDraft.id.trim();
    const name = adminDraft.name.trim();
    const role = adminDraft.role.trim() || "Admin";

    if (!id || !name) {
      Alert.alert(
        tt("profile.groupScreen.alerts.validation.adminTitle", "Admin ma'lumoti kerak"),
        tt(
          "profile.groupScreen.alerts.validation.adminMessage",
          "Admin qoвЂshish uchun foydalanuvchi ID va ismni kiriting.",
        ),
      );
      return;
    }

    if (form.blacklist.some((item) => item.id === id)) {
      Alert.alert(
        tt("profile.groupScreen.alerts.validation.blacklistConflictTitle", "Blok ro'yxatida bor"),
        tt(
          "profile.groupScreen.alerts.validation.blacklistConflictMessage",
          "Blok ro'yxatidagi foydalanuvchini admin qilib bo'lmaydi.",
        ),
      );
      return;
    }

    let persistedState: GroupProfileState | null = null;
    setForm((prev) => {
      let next = {
        ...prev,
        admins: [...prev.admins.filter((item) => item.id !== id), { id, name, role }],
      };
      next = ensureOwnerAdmin(next, ownerRoleText);
      const historyState = pushHistory(next, {
        kind: "community",
        title: tt("profile.groupScreen.admins.actions.add", "Admin qoвЂshish"),
        subtitle: `${name} В· ${role}`,
      });
      persistedState = historyState;
      return historyState;
    });

    if (persistedState) {
      persistDraftRealtimeState(persistedState, "group:members");
    }

    setAdminDraft({ id: "", name: "", role: "" });
  }, [adminDraft, form.blacklist, ownerRoleText, persistDraftRealtimeState, tt]);

  const handleRemoveAdmin = useCallback(
    (id: string) => {
      if (id === form.ownerUserId.trim()) {
        Alert.alert(
          tt("profile.groupScreen.alerts.validation.ownerProtectedTitle", "Egasi himoyalangan"),
          tt(
            "profile.groupScreen.alerts.validation.ownerProtectedMessage",
            "Egasi admin roвЂyxatidan olib tashlanmaydi.",
          ),
        );
        return;
      }

      let persistedState: GroupProfileState | null = null;
      setForm((prev) => {
        const admin = prev.admins.find((item) => item.id === id);
        const next = pushHistory(
          { ...prev, admins: prev.admins.filter((item) => item.id !== id) },
          {
            kind: "community",
            title: tt("profile.groupScreen.admins.actions.remove", "Olib tashlash"),
            subtitle: admin?.name || id,
          },
        );
        persistedState = next;
        return next;
      });
      if (persistedState) {
        persistDraftRealtimeState(persistedState, "group:members");
      }
    },
    [form.ownerUserId, persistDraftRealtimeState, tt],
  );

  const handleAddBlacklist = useCallback(() => {
    const id = blacklistDraft.id.trim();
    const name = blacklistDraft.name.trim();
    const reason = blacklistDraft.reason.trim() || "Cheklangan";

    if (!id || !name) {
      Alert.alert(
        tt("profile.groupScreen.alerts.validation.blacklistTitle", "Qora ro'yxat ma'lumoti kerak"),
        tt(
          "profile.groupScreen.alerts.validation.blacklistMessage",
          "Qora roвЂyxatga qoвЂshish uchun foydalanuvchi ID va ismni kiriting.",
        ),
      );
      return;
    }

    if (id === form.ownerUserId.trim()) {
      Alert.alert(
        tt("profile.groupScreen.alerts.validation.ownerProtectedTitle", "Egasi himoyalangan"),
        tt("profile.groupScreen.alerts.validation.ownerBlacklistMessage", "Egasi qora roвЂyxatga qoвЂshilmaydi."),
      );
      return;
    }

    let persistedState: GroupProfileState | null = null;
    setForm((prev) => {
      const next = pushHistory(
        {
          ...prev,
          blacklist: [...prev.blacklist.filter((item) => item.id !== id), { id, name, reason }],
          admins: prev.admins.filter((item) => item.id !== id),
          members: prev.members.filter((item) => item.id !== id),
        },
        {
          kind: "community",
          title: tt("profile.groupScreen.blacklist.actions.add", "Qora ro'yxatga qo'shish"),
          subtitle: `${name} В· ${reason}`,
        },
      );
      persistedState = next;
      return next;
    });

    if (persistedState) {
      persistDraftRealtimeState(persistedState, "group:members");
    }

    setBlacklistDraft({ id: "", name: "", reason: "" });
  }, [blacklistDraft, form.ownerUserId, persistDraftRealtimeState, tt]);

  const handleRemoveBlacklist = useCallback(
    (id: string) => {
      let persistedState: GroupProfileState | null = null;
      setForm((prev) => {
        const blocked = prev.blacklist.find((item) => item.id === id);
        const next = pushHistory(
          { ...prev, blacklist: prev.blacklist.filter((item) => item.id !== id) },
          {
            kind: "community",
            title: tt("profile.groupScreen.blacklist.actions.remove", "Olib tashlash"),
            subtitle: blocked?.name || id,
          },
        );
        persistedState = next;
        return next;
      });
      if (persistedState) {
        persistDraftRealtimeState(persistedState, "group:members");
      }
    },
    [persistDraftRealtimeState, tt],
  );

  const overviewCards = useMemo(
    () => [
      {
        key: "photos",
        label: tt("profile.photosScreen.header.title", "Rasmlar"),
        value: String(form.publicationPhotos.length),
        accent: ["#6AE1C7", "#5D9CFF"] as [string, string],
      },
      {
        key: "videos",
        label: tt("profile.shortVideosScreen.header.title", "Qisqa videolar"),
        value: String(form.publicationVideos.length),
        accent: ["#88A8FF", "#B688FF"] as [string, string],
      },
      {
        key: "likes",
        label: tt("profile.surface.likes.title", "Layklar"),
        value: String(groupDisplayLikesCount),
        accent: ["#FF9F87", "#FF6FA1"] as [string, string],
      },
      {
        key: "gifts",
        label: tt("profile.giftsScreen.header.title", "Sovg'alar"),
        value: String(form.publicGiftsCount),
        accent: ["#FFD76B", "#FF9E5D"] as [string, string],
      },
    ],
    [groupDisplayLikesCount, form.publicationPhotos.length, form.publicationVideos.length, form.publicGiftsCount, tt],
  );

  const tabs = useMemo(
    () => [
      { key: "overview" as TabKey, label: "Profil" },
      { key: "public" as TabKey, label: "Ommaviy" },
      { key: "members" as TabKey, label: "AвЂ™zolar" },
      { key: "control" as TabKey, label: "Sozlamalar" },
      { key: "history" as TabKey, label: "Tarix" },
    ],
    [],
  );

  if (!isReady) {
    return (
      <LinearGradient colors={[BG_TOP, BG_MID, BG_BOTTOM]} style={styles.root}>
        <SafeAreaView style={styles.safeArea}>
          <StatusBar barStyle="light-content" />
          <View style={styles.loadingWrap}>
            <Text style={styles.loadingText}>{tt("profile.groupScreen.loading", "Guruh yuklanmoqda...")}</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={[BG_TOP, BG_MID, BG_BOTTOM]} style={styles.root}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />

        <View style={styles.backgroundOrbOne} />
        <View style={styles.backgroundOrbTwo} />

        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft size={20} color={TEXT} />
          </Pressable>

          <View style={styles.headerTextWrap}>
            <Text style={styles.headerEyebrow}>GURUH EGASI</Text>
            <Text style={styles.headerTitle}>{tt("profile.groupScreen.header.title", "Guruh boshqaruvi")}</Text>
          </View>

          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>{form.created ? `Faol В· ${groups.length}` : `Yaratish В· ${groups.length}`}</Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.groupShelfCard}>
            <View style={styles.groupShelfHeader}>
              <View style={styles.groupShelfTitleWrap}>
                <Text style={styles.groupShelfTitle}>Mening guruhlarim</Text>
                <Text style={styles.groupShelfSubtitle}>{activeStoredGroup ? `${groups.length} ta guruh В· ${activeStoredGroup.groupName}` : `${groups.length} ta guruh В· bir nechta guruh saqlanadi`}</Text>
              </View>

              <Pressable style={styles.groupShelfCreateButton} onPress={beginNewGroup}>
                <Plus size={16} color="#FFFFFF" />
                <Text style={styles.groupShelfCreateButtonText}>Yangi</Text>
              </Pressable>
            </View>

            {groups.length ? (
              <View style={styles.groupShelfGrid}>
                {groups.map((item) => {
                  const active = item.groupId === selectedGroupId;
                  return (
                    <Pressable
                      key={item.groupId}
                      style={[
                        styles.groupShelfItem,
                        { width: shelfCardWidth },
                        active && styles.groupShelfItemActive,
                      ]}
                      onPress={() => openStoredGroup(item.groupId)}
                    >
                      <View style={styles.groupShelfAvatar}>
                        <Text style={styles.groupShelfAvatarText}>{(item.groupName.trim().charAt(0) || "G").toUpperCase()}</Text>
                      </View>
                      <View style={styles.groupShelfTextWrap}>
                        <Text style={styles.groupShelfItemTitle} numberOfLines={1}>{item.groupName || "Yangi guruh"}</Text>
                        <Text style={styles.groupShelfItemSubtitle} numberOfLines={1}>{item.username ? `@${item.username}` : item.inviteLink || item.groupId}</Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            ) : (
              <View style={styles.groupShelfEmpty}>
                <Text style={styles.groupShelfEmptyText}>Hali guruhlar yo'q. Birinchi guruhni shu yerda yarating.</Text>
              </View>
            )}
          </View>

          {!form.created ? (
            <View style={styles.createEntryCard}>
              <View style={styles.createEntryHeader}>
                <View style={styles.createEntryIconWrap}>
                  <Users size={18} color={BLUE} />
                </View>
                <View style={styles.createEntryTextWrap}>
                  <Text style={styles.createEntryTitle}>
                    {tt("profile.groupScreen.actions.create", "Guruh yaratish")}
                  </Text>
                  <Text style={styles.createEntrySubtitle}>
                    {tt(
                      "profile.groupScreen.createFlow.subtitle",
                      "Avval guruh nomini kiriting. Egasi ID avtomatik yaratiladi.",
                    )}
                  </Text>
                </View>
              </View>

              <CompactInput
                label={tt("profile.groupScreen.main.groupName.label", "Guruh nomi")}
                value={form.groupName}
                onChangeText={(value) => setField("groupName", value)}
                placeholder={tt(
                  "profile.groupScreen.main.groupName.placeholder",
                  "Guruh nomini kiriting",
                )}
              />

              <CompactInput
                label={tt("profile.groupScreen.main.username.label", "Foydalanuvchi nomi")}
                value={form.username}
                onChangeText={(value) => setField("username", sanitizeUsername(value))}
                placeholder={tt(
                  "profile.groupScreen.main.username.placeholder",
                  "guruh_nomi",
                )}
                prefix="@"
              />

              <CompactInput
                label={tt("profile.groupScreen.main.description.label", "Tavsif")}
                value={form.description}
                onChangeText={(value) => setField("description", value)}
                placeholder={tt(
                  "profile.groupScreen.main.description.placeholder",
                  "Guruh tavsifini yozing",
                )}
                multiline
              />

              <View style={styles.createEntryInfoRow}>
                <InfoChip
                  width={infoChipWidth}
                  icon={<Users size={14} color={MINT} />}
                  label={tt(
                    "profile.groupScreen.createFlow.ownerAuto",
                    "Egasi ID avtomatik yaratiladi",
                  )}
                />
                <InfoChip
                  width={infoChipWidth}
                  icon={<Link2 size={14} color={BLUE_2} />}
                  label={tt(
                    "profile.groupScreen.createFlow.inviteAuto",
                    "Taklif havolasi avtomatik yaratiladi",
                  )}
                />
              </View>

              <Pressable
                style={[styles.createEntryButton, isSaving && styles.buttonDisabled]}
                disabled={isSaving}
                onPress={handleCreateGroup}
              >
                <LinearGradient colors={[BLUE, BLUE_2]} style={styles.createEntryButtonGradient}>
                  <Plus size={18} color="#FFFFFF" />
                  <Text style={styles.createEntryButtonText}>
                    {isSaving
                      ? tt("profile.groupScreen.actions.creating", "Yaratilmoqda...")
                      : tt("profile.groupScreen.actions.create", "Guruh yaratish")}
                  </Text>
                </LinearGradient>
              </Pressable>
            </View>
          ) : null}

          <View style={styles.heroCard}>
            <View style={styles.heroCoverWrap}>
              {form.coverUri ? (
                <Image source={{ uri: form.coverUri }} style={styles.heroCoverImage} />
              ) : (
                <LinearGradient
                  colors={["rgba(84, 225, 193, 0.72)", "rgba(111, 156, 255, 0.78)", "rgba(141, 130, 255, 0.70)"]}
                  style={styles.heroCoverFallback}
                />
              )}

              <LinearGradient
                colors={["rgba(3,8,18,0.00)", "rgba(3,8,18,0.28)", "rgba(3,8,18,0.62)"]}
                style={styles.heroCoverShade}
              />

              <Pressable style={styles.coverAction} onPress={() => void openPicker("cover")}>
                <Camera size={14} color="#FFFFFF" />
                <Text style={styles.coverActionText}>Muqova</Text>
              </Pressable>
            </View>

            <View style={styles.heroMainRow}>
              <View style={styles.avatarWrap}>
                <LinearGradient colors={["#72E4CB", "#689AFF"]} style={styles.avatarRing}>
                  {form.avatarUri ? (
                    <Image source={{ uri: form.avatarUri }} style={styles.avatarImage} />
                  ) : (
                    <View style={styles.avatarFallback}>
                      <Text style={styles.avatarText}>{groupInitial}</Text>
                    </View>
                  )}
                </LinearGradient>

                <Pressable style={styles.avatarAction} onPress={() => void openPicker("avatar")}>
                  <Camera size={13} color="#FFFFFF" />
                </Pressable>
              </View>

              <View style={styles.heroBody}>
                <Text style={styles.heroTitle}>{form.groupName.trim() || "Yangi guruh"}</Text>
                <Text style={styles.heroSubtitle}>{form.username ? `@${form.username}` : "Username hali o'rnatilmagan"}</Text>
                <Text style={styles.heroDescription} numberOfLines={2}>
                  {form.description.trim() || "Guruh nomi, username, tavsif va asosiy identifikatorlar."}
                </Text>
              </View>
            </View>

            <View style={styles.heroStatsRow}>
              <HeroChip width={listCardWidth} label="AвЂ™zolar" value={String(totalParticipants)} tone="blue" />
              <HeroChip width={listCardWidth} label="Admin" value={String(syncedForm.admins.length)} tone="mint" />
              <HeroChip width={listCardWidth} label="Sovg'alar" value={String(form.publicGiftsCount)} tone="gold" />
              <HeroChip width={listCardWidth} label="Tarix" value={String(form.history.length)} tone="pink" />
            </View>

            <View style={styles.gridWrap}>
              <QuickActionCard
                width={heroCardWidth}
                icon={<ImagePlus size={18} color={BLUE} />}
                title="Rasmlar"
                subtitle="Profil rasmlarini yuklash va boshqarish"
                onPress={() => {
                  setActiveTab("public");
                  void openPicker("photo");
                }}
              />
              <QuickActionCard
                width={heroCardWidth}
                icon={<Video size={18} color={MINT} />}
                title="Qisqa videolar"
                subtitle="Haqiqiy qisqa videolarni boshqarish"
                onPress={() => {
                  setActiveTab("public");
                  void openPicker("video");
                }}
              />
              <QuickActionCard
                width={heroCardWidth}
                icon={<Users size={18} color={BLUE_2} />}
                title="AвЂ™zolar"
                subtitle="Guruh profili va a'zolarni boshqarish"
                onPress={() => setActiveTab("members")}
              />
              <QuickActionCard
                width={heroCardWidth}
                icon={<Settings2 size={18} color={PINK} />}
                title="Sozlamalar"
                subtitle="Kirish va moderation qoidalari"
                onPress={() => setActiveTab("control")}
              />
            </View>

            {form.created ? (
              <Pressable style={styles.focusCard} onPress={openCurrentGroupChat}>
                <View style={styles.inlineActionLeft}>
                  <View style={styles.inlineActionIcon}>
                    <MessageCircleMore size={18} color={BLUE} />
                  </View>
                  <View style={styles.inlineTextWrap}>
                    <Text style={styles.focusCardTitle}>Chatni ochish</Text>
                    <Text style={styles.focusCardSubtitle}>Guruh chatiga o'tish</Text>
                  </View>
                </View>
                <Text style={styles.focusCardArrow}>в†’</Text>
              </Pressable>
            ) : null}
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsRow}
          >
            {tabs.map((tab) => {
              const active = activeTab === tab.key;
              return (
                <Pressable
                  key={tab.key}
                  onPress={() => setActiveTab(tab.key)}
                  style={[styles.tabButton, active && styles.tabButtonActive]}
                >
                  <Text style={[styles.tabButtonText, active && styles.tabButtonTextActive]}>{tab.label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {activeTab === "overview" ? (
            <>
              <GlassSection title="Identitet qatlamlari" subtitle="Guruhning asosiy ochiq identitet bloki.">
                <View style={styles.gridWrap}>
                  {overviewCards.map((item) => (
                    <StatCard key={item.key} width={listCardWidth} label={item.label} value={item.value} accent={item.accent} />
                  ))}
                </View>
              </GlassSection>
            </>
          ) : null}

          {activeTab === "public" ? (
            <>
              <GlassSection title="Ommaviy" subtitle="Rasmlar va videolar.">
                <View style={styles.gridWrap}>
                  <StatCard width={listCardWidth} label="Rasmlar" value={String(form.publicationPhotos.length)} accent={["#72E4CB", "#689AFF"]} />
                  <StatCard width={listCardWidth} label="Qisqa videolar" value={String(form.publicationVideos.length)} accent={["#9A8DFF", "#689AFF"]} />
                  <StatCard width={listCardWidth} label="Layklar" value={String(groupDisplayLikesCount)} accent={["#FF9C88", "#FF6FA1"]} />
                  <StatCard width={listCardWidth} label="Sovg'alar" value={String(form.publicGiftsCount)} accent={["#FFD66A", "#F3A93B"]} />
                </View>

                <View style={styles.gridWrap}>
                  <InlineActionButton
                    width={listCardWidth}
                    icon={<ImagePlus size={16} color={BLUE} />}
                    title="Rasm qo'shish"
                    value="Galereya"
                    onPress={() => void openPicker("photo")}
                  />
                  <InlineActionButton
                    width={listCardWidth}
                    icon={<Video size={16} color={MINT} />}
                    title="Video qo'shish"
                    value="Galereya"
                    onPress={() => void openPicker("video")}
                  />
                </View>
              </GlassSection>

              <GlassSection title="Rasmlar" subtitle="Profil rasmlarini yuklash va boshqarish.">
                <MediaStrip
                  items={form.publicationPhotos}
                  type="photo"
                  emptyTitle="Hali rasmlar yoвЂq"
                  emptyDescription="Birinchi rasmni qoвЂshing."
                  onAdd={() => void openPicker("photo")}
                  onRemove={(id) => handleRemoveMedia(id, "photo")}
                />
              </GlassSection>

              <GlassSection title="Qisqa videolar" subtitle="Haqiqiy qisqa videolarni boshqarish.">
                <MediaStrip
                  items={form.publicationVideos}
                  type="video"
                  emptyTitle="Hali qisqa videolar yo'q"
                  emptyDescription="Birinchi videoni qo'shing."
                  onAdd={() => void openPicker("video")}
                  onRemove={(id) => handleRemoveMedia(id, "video")}
                />
              </GlassSection>
            </>
          ) : null}

          {activeTab === "members" ? (
            <>
              <GlassSection title="AвЂ™zolar" subtitle="AвЂ™zolar, adminlar va qora roвЂyxat boshqaruvi.">
                <View style={styles.gridWrap}>
                  <StatCard width={listCardWidth} label="AвЂ™zolar" value={String(totalParticipants)} accent={["#72E4CB", "#689AFF"]} />
                  <StatCard width={listCardWidth} label="Admin" value={String(syncedForm.admins.length)} accent={["#9A8DFF", "#689AFF"]} />
                  <StatCard width={listCardWidth} label="Egasi" value={form.ownerUserId.trim() ? "1" : "0"} accent={["#FFD66A", "#F3A93B"]} />
                  <StatCard width={listCardWidth} label="So'rovlar" value={String(form.joinRequests.length)} accent={["#8FDBFF", "#689AFF"]} />
                  <StatCard width={listCardWidth} label="Qora roвЂyxat" value={String(form.blacklist.length)} accent={["#FFA08D", "#FF6D6D"]} />
                </View>
              </GlassSection>

              <GlassSection title="AвЂ™zo qoвЂshish" subtitle="Kontaktlardan yoki qo'lda yangi ishtirokchini qo'shing.">
                <View style={styles.gridWrap}>
                  <InlineActionButton
                    width={listCardWidth}
                    icon={<UserPlus size={16} color={BLUE} />}
                    title="Kontakt qoвЂshish"
                    value="Kontaktlar"
                    onPress={handleOpenContactsForMemberAdd}
                  />
                  <InlineActionButton
                    width={listCardWidth}
                    icon={<Users size={16} color={MINT} />}
                    title="QoвЂlda qoвЂshish"
                    value="Foydalanuvchi ID"
                    onPress={() => {}}
                  />
                </View>

                <View style={styles.membersHintCard}>
                  <Text style={styles.membersHintTitle}>Kontakt qoвЂshish oqimi</Text>
                  <Text style={styles.membersHintText}>
                    Kontakt tanlash uchun kontaktlar ekranini oching. Qaytib kelganda tanlangan foydalanuvchi shu guruhga a'zo sifatida qo'shiladi.
                  </Text>
                </View>

                <View style={styles.formGrid}>
                  <CompactInput
                    label="Foydalanuvchi ID"
                    value={memberDraft.id}
                    onChangeText={(value) => setMemberDraft((prev) => ({ ...prev, id: value }))}
                    placeholder="foydalanuvchi_id"
                  />
                  <CompactInput
                    label="Ism"
                    value={memberDraft.name}
                    onChangeText={(value) => setMemberDraft((prev) => ({ ...prev, name: value }))}
                    placeholder="AвЂ™zo ismi"
                  />
                </View>
                <CompactInput
                  label="Roli"
                  value={memberDraft.role}
                  onChangeText={(value) => setMemberDraft((prev) => ({ ...prev, role: value }))}
                  placeholder="AвЂ™zo"
                />
                <Pressable style={styles.softButton} onPress={handleAddMember}>
                  <UserPlus size={16} color={BLUE} />
                  <Text style={styles.softButtonText}>A'zo qo'shish</Text>
                </Pressable>

                <StackList
                  items={form.members.map((item) => ({
                    id: item.id,
                    title: item.name || item.id,
                    subtitle: `${item.id} В· ${item.role || "AвЂ™zo"}`,
                    icon: <Users size={16} color={BLUE} />,
                    actionText: "Olib tashlash",
                    onAction: () => handleRemoveMember(item.id),
                    tone: "default" as const,
                  }))}
                  emptyTitle="Hozircha aвЂ™zolar yoвЂq"
                  emptyDescription="Birinchi ishtirokchini qoвЂshing."
                />
              </GlassSection>

              <GlassSection title="Adminlar" subtitle="Owner asosiy admin bo'lib qoladi. Qo'shimcha adminlarni boshqaring.">
                <View style={styles.formGrid}>
                  <CompactInput
                    label="Foydalanuvchi ID"
                    value={adminDraft.id}
                    onChangeText={(value) => setAdminDraft((prev) => ({ ...prev, id: value }))}
                    placeholder="admin_id"
                  />
                  <CompactInput
                    label="Ism"
                    value={adminDraft.name}
                    onChangeText={(value) => setAdminDraft((prev) => ({ ...prev, name: value }))}
                    placeholder="Admin ismi"
                  />
                </View>
                <CompactInput
                  label="Roli"
                  value={adminDraft.role}
                  onChangeText={(value) => setAdminDraft((prev) => ({ ...prev, role: value }))}
                  placeholder="Admin / Moderator"
                />
                <Pressable style={styles.softButton} onPress={handleAddAdmin}>
                  <Plus size={16} color={MINT} />
                  <Text style={styles.softButtonText}>Admin qo'shish</Text>
                </Pressable>

                <StackList
                  items={syncedForm.admins.map((item) => {
                    const isOwner = item.id === form.ownerUserId.trim();
                    return {
                      id: item.id,
                      title: item.name || item.id,
                      subtitle: `${item.id} В· ${item.role || "Admin"}`,
                      icon: <ShieldCheck size={16} color={MINT} />,
                      badge: isOwner ? "Egasi" : undefined,
                      actionText: isOwner ? undefined : "Olib tashlash",
                      onAction: isOwner ? undefined : () => handleRemoveAdmin(item.id),
                      tone: isOwner ? ("good" as const) : ("default" as const),
                    };
                  })}
                  emptyTitle="Hozircha adminlar yoвЂq"
                  emptyDescription="Adminlarni shu yerda boshqaring."
                />
              </GlassSection>

              <GlassSection title="Qora roвЂyxat" subtitle="Cheklangan foydalanuvchilar ro'yxati.">
                <View style={styles.formGrid}>
                  <CompactInput
                    label="Foydalanuvchi ID"
                    value={blacklistDraft.id}
                    onChangeText={(value) => setBlacklistDraft((prev) => ({ ...prev, id: value }))}
                    placeholder="bloklangan_id"
                  />
                  <CompactInput
                    label="Ism"
                    value={blacklistDraft.name}
                    onChangeText={(value) => setBlacklistDraft((prev) => ({ ...prev, name: value }))}
                    placeholder="Foydalanuvchi ismi"
                  />
                </View>
                <CompactInput
                  label="Sabab"
                  value={blacklistDraft.reason}
                  onChangeText={(value) => setBlacklistDraft((prev) => ({ ...prev, reason: value }))}
                  placeholder="Spam, suisteвЂ™mol, firibgarlik va hokazo"
                />
                <Pressable style={styles.softButton} onPress={handleAddBlacklist}>
                  <Ban size={16} color={RED} />
                  <Text style={styles.softButtonText}>Qora roвЂyxatga qoвЂshish</Text>
                </Pressable>

                <StackList
                  items={form.blacklist.map((item) => ({
                    id: item.id,
                    title: item.name || item.id,
                    subtitle: `${item.id} В· ${item.reason || "Cheklangan"}`,
                    icon: <Ban size={16} color={RED} />,
                    actionText: "Olib tashlash",
                    onAction: () => handleRemoveBlacklist(item.id),
                    tone: "danger" as const,
                  }))}
                  emptyTitle="Qora roвЂyxat boвЂsh"
                  emptyDescription="Cheklangan foydalanuvchilar hozircha yoвЂq."
                />
              </GlassSection>
            </>
          ) : null}

          {activeTab === "control" ? (
            <>
              <GlassSection title="Egasi maвЂ™lumotlari" subtitle="Egasi ID boвЂsh boвЂlsa, yaratish vaqtida avtomatik yaratiladi.">
                <CompactInput
                  label="Egasi ismi"
                  value={form.ownerName}
                  onChangeText={(value) => setField("ownerName", value)}
                  placeholder="Egasi"
                />
                <CompactInput
                  label="Egasi ID"
                  value={form.ownerUserId}
                  onChangeText={(value) => setField("ownerUserId", value)}
                  placeholder="Avtomatik yaratiladi"
                />
                <View style={styles.formGrid}>
                  <CompactInput
                    label="Egasi roli"
                    value={form.ownerRole}
                    onChangeText={(value) => setField("ownerRole", value)}
                    placeholder="Egasi"
                  />
                  <CompactInput
                    label="Egasi telefoni"
                    value={form.ownerPhone}
                    onChangeText={(value) => setField("ownerPhone", value)}
                    placeholder="+998..."
                  />
                </View>
                <CompactInput
                  label="Egasi emaili"
                  value={form.ownerEmail}
                  onChangeText={(value) => setField("ownerEmail", value)}
                  placeholder="owner@sabi.app"
                />
              </GlassSection>

              <GlassSection title="Asosiy ma'lumotlar" subtitle="Guruh yaratish uchun faqat guruh nomi majburiy.">
                <CompactInput
                  label="Guruh nomi"
                  value={form.groupName}
                  onChangeText={(value) => setField("groupName", value)}
                  placeholder="Guruh nomini kiriting"
                />
                <CompactInput
                  label="Foydalanuvchi nomi"
                  value={form.username}
                  onChangeText={(value) => setField("username", sanitizeUsername(value))}
                  placeholder="guruh_nomi"
                  prefix="@"
                />
                <CompactInput
                  label="Tavsif"
                  value={form.description}
                  onChangeText={(value) => setField("description", value)}
                  placeholder="Guruh tavsifini yozing"
                  multiline
                />
                {!!form.created ? (
                  <View style={styles.formGrid}>
                    <CompactInput
                      label="Guruh ID"
                      value={form.groupId}
                      onChangeText={(value) => setField("groupId", value)}
                      placeholder="Avtomatik yaratiladi"
                    />
                    <CompactInput
                      label="Taklif havolasi"
                      value={form.inviteLink}
                      onChangeText={(value) => setField("inviteLink", value)}
                      placeholder="sabi://group/..."
                    />
                  </View>
                ) : null}
              </GlassSection>

              <GlassSection title="Nashr va ommaviy qatlam" subtitle="Ommaviy va yopiq ko'rinish qoidalari.">
                <ToggleRow
                  icon={<Globe2 size={18} color={BLUE} />}
                  title={form.isPublic ? "Ochiq guruh" : "Cheklangan guruh"}
                  subtitle="Ochiq: hamma darhol kiradi. Cheklangan: kirish so'rov bilan."
                  value={form.isPublic}
                  onValueChange={(value) => setField("isPublic", value, "group:updated")}
                />
                <ToggleRow
                  icon={<Megaphone size={18} color={MINT} />}
                  title="Nashr yoqilgan"
                  subtitle="Ommaviy guruh nashrini faollashtirish."
                  value={form.isPublished}
                  onValueChange={(value) => setField("isPublished", value, "group:updated")}
                  disabled={!form.isPublic}
                />
                <ToggleRow
                  icon={<Link2 size={18} color={BLUE_2} />}
                  title="Profilda ko'rsatish"
                  subtitle="Guruh boвЂlimini profil ichida koвЂrsatish."
                  value={form.showInProfile}
                  onValueChange={(value) => setField("showInProfile", value, "group:updated")}
                  disabled={!form.isPublic}
                />
                <ToggleRow
                  icon={<Link2 size={18} color={BLUE_2} />}
                  title="Ko'rib chiqish yoqilgan"
                  subtitle="Havola va profil koвЂrib chiqish kartalarini koвЂrsatish."
                  value={form.previewEnabled}
                  onValueChange={(value) => setField("previewEnabled", value, "group:updated")}
                />

                <CompactInput
                  label="Nashr ID"
                  value={form.linkedPublicationId}
                  onChangeText={(value) => setField("linkedPublicationId", value)}
                  placeholder="pub_..."
                />
                <CompactInput
                  label="Nashr sarlavhasi"
                  value={form.publicationTitle}
                  onChangeText={(value) => setField("publicationTitle", value)}
                  placeholder="Ommaviy koвЂrinish sarlavhasi"
                />
                <CompactInput
                  label="Nashr subtitri"
                  value={form.publicationSubtitle}
                  onChangeText={(value) => setField("publicationSubtitle", value)}
                  placeholder="Qisqa ommaviy tavsif"
                />
                <View style={styles.formGrid}>
                  <CompactInput
                    label="Nashr manzili"
                    value={form.publicationSlug}
                    onChangeText={(value) => setField("publicationSlug", sanitizeSlug(value))}
                    placeholder="guruh-nashr"
                  />
                  <CompactInput
                    label="Kalit soвЂzlar"
                    value={form.publicationTags}
                    onChangeText={(value) => setField("publicationTags", value)}
                    placeholder="hamjamiyat, ommaviy"
                  />
                </View>
                <CompactInput
                  label="Nashr xulosasi"
                  value={form.publicationSummary}
                  onChangeText={(value) => setField("publicationSummary", value)}
                  placeholder="Ommaviy koвЂrinish uchun qisqa xulosa"
                  multiline
                />
              </GlassSection>

              <GlassSection title="Kirish va moderatsiya" subtitle="AвЂ™zolar, yozish va moderatsiya qoidalari.">
                <ToggleRow
                  icon={<Users size={18} color={BLUE} />}
                  title="Kirish so'rovi"
                  subtitle="Cheklangan guruhda yangi foydalanuvchi avval so'rov yuboradi."
                  value={form.allowJoinRequests}
                  onValueChange={(value) => setField("allowJoinRequests", value, "group:updated")}
                  disabled={form.isPublic}
                />
                <ToggleRow
                  icon={<Link2 size={18} color={MINT} />}
                  title="A'zolar taklif yubora oladi"
                  subtitle="Admin tasdig'isiz oddiy a'zolar odam qo'sha olmaydi."
                  value={form.allowMemberInvites}
                  onValueChange={(value) => setField("allowMemberInvites", value, "group:updated")}
                />
                <ToggleRow
                  icon={<Megaphone size={18} color={PINK} />}
                  title="Faqat adminlar yozadi"
                  subtitle="Guruhda xabar yozish faqat adminlarga ruxsat."
                  value={form.onlyAdminsCanPost}
                  onValueChange={(value) => setField("onlyAdminsCanPost", value, "group:updated")}
                />
                <ToggleRow
                  icon={<Lock size={18} color={BLUE_2} />}
                  title="Faqat adminlar tahrirlaydi"
                  subtitle="Guruh ma'lumotlarini faqat adminlar tahrirlaydi."
                  value={form.onlyAdminsCanEdit}
                  onValueChange={(value) => setField("onlyAdminsCanEdit", value, "group:updated")}
                />
                <ToggleRow
                  icon={<History size={18} color={GOLD} />}
                  title="Izohlar yoqilgan"
                  subtitle="Postlar va muhokamalarda izohlarga ruxsat berish."
                  value={form.commentsEnabled}
                  onValueChange={(value) => setField("commentsEnabled", value, "group:updated")}
                />
                <ToggleRow
                  icon={<ShieldCheck size={18} color={MINT} />}
                  title="Media tasdiqlash"
                  subtitle="Media yuborish moderatsiya tasdigвЂidan oвЂtsin."
                  value={form.mediaApprovalRequired}
                  onValueChange={(value) => setField("mediaApprovalRequired", value, "group:updated")}
                />
              </GlassSection>

              <GlassSection title="Bog'lanishlar" subtitle="Chat va bot bogвЂlanishlari.">
                <CompactInput
                  label="BogвЂlangan chat ID"
                  value={form.linkedChatId}
                  onChangeText={(value) => setField("linkedChatId", value)}
                  placeholder="chat_..."
                />
                <CompactInput
                  label="BogвЂlangan bot ID"
                  value={form.linkedBotId}
                  onChangeText={(value) => setField("linkedBotId", value)}
                  placeholder="bot_..."
                />
              </GlassSection>
            </>
          ) : null}

          {activeTab === "history" ? (
            <>
              <GlassSection title="Tarix" subtitle="Guruhdagi o'zgarishlar tarixi.">
                <View style={styles.gridWrap}>
                  <StatCard width={listCardWidth} label="Tarix" value={String(form.history.length)} accent={["#72E4CB", "#689AFF"]} />
                  <StatCard width={listCardWidth} label="Rasmlar" value={String(form.publicationPhotos.length)} accent={["#9A8DFF", "#689AFF"]} />
                  <StatCard width={listCardWidth} label="Layklar" value={String(groupDisplayLikesCount)} accent={["#FF9C88", "#FF6FA1"]} />
                  <StatCard width={listCardWidth} label="Sovg'alar" value={String(form.publicGiftsCount)} accent={["#FFD66A", "#F3A93B"]} />
                </View>
              </GlassSection>

              <GlassSection title="Tarix" subtitle="Oxirgi o'zgarishlar.">
                {form.history.length ? (
                  <View style={styles.timelineWrap}>
                    {form.history.map((item, index) => (
                      <View
                        key={item.id}
                        style={[styles.timelineItem, index !== form.history.length - 1 && styles.timelineDivider]}
                      >
                        <View style={styles.timelineDotWrap}>
                          <View style={[styles.timelineDot, timelineColor(item.kind)]} />
                        </View>
                        <View style={styles.timelineTextWrap}>
                          <Text style={styles.timelineTitle}>{item.title}</Text>
                          <Text style={styles.timelineSubtitle}>{item.subtitle}</Text>
                        </View>
                        <Text style={styles.timelineTime}>{formatRelativeTime(item.createdAt)}</Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <EmptyState
                    title="Hozircha bu yerda hech narsa yo'q"
                    description="Harakatlar paydo boвЂlganda bu yerda tarix yigвЂiladi."
                  />
                )}
              </GlassSection>
            </>
          ) : null}

          <View style={styles.bottomSpace} />
        </ScrollView>

        {form.created ? (
          <View style={styles.bottomBar}>
            <View style={styles.bottomActionsRow}>
              <Pressable
                style={[styles.secondaryButton, isSaving && styles.buttonDisabled]}
                disabled={isSaving}
                onPress={handleResetGroup}
              >
                <Text style={styles.secondaryButtonText}>Tiklash</Text>
              </Pressable>

              <Pressable
                style={[styles.primaryButton, styles.flexButton, isSaving && styles.buttonDisabled]}
                disabled={isSaving}
                onPress={handleSaveChanges}
              >
                <LinearGradient colors={[BLUE, BLUE_2]} style={styles.primaryButtonGradient}>
                  <Save size={18} color="#FFFFFF" />
                  <Text style={styles.primaryButtonText}>{isSaving ? "Saqlanmoqda..." : "Saqlash"}</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        ) : null}
      </SafeAreaView>
    </LinearGradient>
  );
}

function HeroChip(props: { width?: number; label: string; value: string; tone: "blue" | "mint" | "gold" | "pink" }) {
  const toneStyles = {
    blue: { backgroundColor: "rgba(58,113,255,0.10)", borderColor: "rgba(58,113,255,0.16)" },
    mint: { backgroundColor: "rgba(56,199,177,0.10)", borderColor: "rgba(56,199,177,0.16)" },
    gold: { backgroundColor: "rgba(243,169,59,0.10)", borderColor: "rgba(243,169,59,0.16)" },
    pink: { backgroundColor: "rgba(255,111,161,0.10)", borderColor: "rgba(255,111,161,0.16)" },
  }[props.tone];

  return (
    <View style={[styles.heroChip, props.width ? { width: props.width } : null, toneStyles]}>
      <Text style={styles.heroChipValue}>{props.value}</Text>
      <Text style={styles.heroChipLabel}>{props.label}</Text>
    </View>
  );
}

function QuickActionCard(props: {
  width: number;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={[styles.quickActionCard, { width: props.width }]} onPress={props.onPress}>
      <View style={styles.quickActionIcon}>{props.icon}</View>
      <Text style={styles.quickActionTitle}>{props.title}</Text>
      <Text style={styles.quickActionSubtitle}>{props.subtitle}</Text>
    </Pressable>
  );
}

function GlassSection(props: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>{props.title}</Text>
        {!!props.subtitle ? <Text style={styles.sectionSubtitle}>{props.subtitle}</Text> : null}
      </View>
      {props.children}
    </View>
  );
}

function StatCard(props: { width: number; label: string; value: string; accent: [string, string] }) {
  return (
    <LinearGradient colors={props.accent} style={[styles.statCardWrap, { width: props.width }]}>
      <View style={styles.statCardInner}>
        <Text style={styles.statCardValue}>{props.value}</Text>
        <Text style={styles.statCardLabel}>{props.label}</Text>
      </View>
    </LinearGradient>
  );
}

function InlineActionButton(props: {
  width: number;
  icon: React.ReactNode;
  title: string;
  value: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={[styles.inlineActionButton, { width: props.width }]} onPress={props.onPress}>
      <View style={styles.inlineActionLeft}>
        <View style={styles.inlineActionIcon}>{props.icon}</View>
        <View style={styles.inlineTextWrap}>
          <Text style={styles.inlineActionTitle}>{props.title}</Text>
          <Text style={styles.inlineActionValue}>{props.value}</Text>
        </View>
      </View>
    </Pressable>
  );
}

function ReadOnlyCounterCard(props: {
  width: number;
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle: string;
}) {
  return (
    <View style={[styles.readOnlyCard, { width: props.width }]}> 
      <View style={styles.inlineActionLeft}>
        <View style={styles.inlineActionIcon}>{props.icon}</View>
        <View style={styles.inlineTextWrap}>
          <Text style={styles.inlineActionTitle}>{props.title}</Text>
          <Text style={styles.readOnlyValue}>{props.value}</Text>
          <Text style={styles.inlineActionValue}>{props.subtitle}</Text>
        </View>
      </View>
    </View>
  );
}

function InfoChip(props: { width?: number; icon: React.ReactNode; label: string }) {
  return (
    <View style={[styles.infoChip, props.width ? { width: props.width } : null]}>
      {props.icon}
      <Text style={styles.infoChipText}>{props.label}</Text>
    </View>
  );
}

function CompactInput(props: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  prefix?: string;
}) {
  return (
    <View style={styles.inputBlock}>
      <Text style={styles.inputLabel}>{props.label}</Text>
      <View style={[styles.inputWrap, props.multiline && styles.inputWrapMultiline]}>
        {props.prefix ? <Text style={styles.inputPrefix}>{props.prefix}</Text> : null}
        <TextInput
          value={props.value}
          onChangeText={props.onChangeText}
          placeholder={props.placeholder}
          placeholderTextColor="rgba(143,164,203,0.58)"
          style={[styles.input, props.multiline && styles.inputMultiline]}
          multiline={props.multiline}
          textAlignVertical={props.multiline ? "top" : "center"}
        />
      </View>
    </View>
  );
}

function ToggleRow(props: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <View style={[styles.toggleRow, props.disabled && styles.toggleRowDisabled]}>
      <View style={styles.toggleLeft}>
        <View style={styles.toggleIcon}>{props.icon}</View>
        <View style={styles.toggleTextWrap}>
          <Text style={styles.toggleTitle}>{props.title}</Text>
          <Text style={styles.toggleSubtitle}>{props.subtitle}</Text>
        </View>
      </View>
      <Switch
        value={props.value}
        onValueChange={props.onValueChange}
        disabled={props.disabled}
        trackColor={{ false: "rgba(97,112,137,0.22)", true: BLUE }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}

function StackList(props: {
  items: Array<{
    id: string;
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    badge?: string;
    actionText?: string;
    onAction?: () => void;
    tone?: "default" | "good" | "danger";
  }>;
  emptyTitle: string;
  emptyDescription: string;
}) {
  if (!props.items.length) {
    return <EmptyState title={props.emptyTitle} description={props.emptyDescription} />;
  }

  return (
    <View style={styles.stackList}>
      {props.items.map((item, index) => (
        <View
          key={`${item.id}_${index}`}
          style={[styles.stackRow, index !== props.items.length - 1 && styles.stackRowDivider]}
        >
          <View style={styles.stackLeft}>
            <View style={styles.stackIcon}>{item.icon}</View>
            <View style={styles.stackTextWrap}>
              <Text style={styles.stackTitle}>{item.title}</Text>
              <Text style={styles.stackSubtitle}>{item.subtitle}</Text>
            </View>
          </View>

          <View style={styles.stackRight}>
            {item.badge ? <Badge tone={item.tone ?? "default"} text={item.badge} /> : null}
            {item.actionText && item.onAction ? (
              <Pressable style={styles.rowGhostAction} onPress={item.onAction}>
                <Text style={styles.rowGhostActionText}>{item.actionText}</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      ))}
    </View>
  );
}

function EmptyState(props: { title: string; description: string }) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>{props.title}</Text>
      <Text style={styles.emptyDescription}>{props.description}</Text>
    </View>
  );
}

function MediaStrip(props: {
  items: GroupMediaItem[];
  type: "photo" | "video";
  emptyTitle: string;
  emptyDescription: string;
  onAdd: () => void;
  onRemove: (id: string) => void;
}) {
  if (!props.items.length) {
    return <EmptyState title={props.emptyTitle} description={props.emptyDescription} />;
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mediaStrip}>
      <Pressable style={styles.mediaAddCard} onPress={props.onAdd}>
        <Plus size={18} color={BLUE} />
        <Text style={styles.mediaAddText}>{props.type === "photo" ? "Foto" : "Video"}</Text>
      </Pressable>

      {props.items.map((item) => (
        <View key={item.id} style={styles.mediaCard}>
          {props.type === "photo" ? (
            <Image source={{ uri: item.uri }} style={styles.mediaImage} />
          ) : (
            <LinearGradient colors={["#9A8DFF", "#689AFF"]} style={styles.videoCardFallback}>
              <Video size={22} color="#FFFFFF" />
              <Text style={styles.videoCardText}>Video</Text>
            </LinearGradient>
          )}

          <Pressable style={styles.mediaRemoveButton} onPress={() => props.onRemove(item.id)}>
            <Trash2 size={14} color="#FFFFFF" />
          </Pressable>
        </View>
      ))}
    </ScrollView>
  );
}

function Badge(props: { text: string; tone: "default" | "good" | "danger" }) {
  const toneStyle = {
    default: { backgroundColor: "rgba(58,113,255,0.12)", color: BLUE },
    good: { backgroundColor: "rgba(56,199,177,0.12)", color: MINT },
    danger: { backgroundColor: "rgba(255,109,109,0.12)", color: RED },
  }[props.tone];

  return (
    <View style={[styles.badge, { backgroundColor: toneStyle.backgroundColor }]}>
      <Text style={[styles.badgeText, { color: toneStyle.color }]}>{props.text}</Text>
    </View>
  );
}

function timelineColor(kind: GroupHistoryEntry["kind"]) {
  switch (kind) {
    case "identity":
      return { backgroundColor: BLUE };
    case "publication":
      return { backgroundColor: MINT };
    case "community":
      return { backgroundColor: GOLD };
    case "gift":
      return { backgroundColor: PINK };
    default:
      return { backgroundColor: BLUE_2 };
  }
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG_MID },
  safeArea: { flex: 1 },
  backgroundOrbOne: {
    position: "absolute",
    top: -90,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 220,
    backgroundColor: "rgba(84, 225, 193, 0.16)",
  },
  backgroundOrbTwo: {
    position: "absolute",
    bottom: -80,
    left: -50,
    width: 220,
    height: 220,
    borderRadius: 220,
    backgroundColor: "rgba(111, 156, 255, 0.14)",
  },
  createEntryCard: {
    marginTop: 4,
    marginBottom: 14,
    borderRadius: 28,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    padding: 16,
    shadowColor: "#000000",
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  createEntryHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 14,
  },
  createEntryIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: "rgba(17, 28, 52, 0.78)",
    borderWidth: 1,
    borderColor: "rgba(66,112,180,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  createEntryTextWrap: { flex: 1 },
  createEntryTitle: {
    color: TEXT,
    fontSize: 18,
    fontWeight: "900",
  },
  createEntrySubtitle: {
    color: MUTED,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
    marginTop: 4,
  },
  createEntryInfoRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 2,
    marginBottom: 14,
  },
  createEntryButton: {
    borderRadius: 20,
    overflow: "hidden",
  },
  createEntryButtonGradient: {
    minHeight: 54,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  createEntryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },

  groupShelfCard: {
    marginTop: 4,
    marginBottom: 14,
    borderRadius: 28,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    padding: 16,
    shadowColor: "#000000",
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  groupShelfHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 14,
  },
  groupShelfTitleWrap: { flex: 1 },
  groupShelfTitle: { color: TEXT, fontSize: 18, fontWeight: "900" },
  groupShelfSubtitle: { color: MUTED, fontSize: 12, lineHeight: 18, fontWeight: "700", marginTop: 4 },
  groupShelfCreateButton: {
    minHeight: 42,
    borderRadius: 999,
    paddingHorizontal: 16,
    backgroundColor: BLUE,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
    paddingVertical: 8,
  },
  groupShelfCreateButtonText: { color: "#FFFFFF", fontSize: 13, fontWeight: "900" },
  groupShelfGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  groupShelfItem: {
    minHeight: 84,
    borderRadius: 20,
    backgroundColor: "rgba(17, 28, 52, 0.72)",
    borderWidth: 1,
    borderColor: "rgba(66,112,180,0.10)",
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  groupShelfItemActive: {
    borderColor: BLUE,
    backgroundColor: "rgba(34, 58, 108, 0.76)",
  },
  groupShelfAvatar: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: "rgba(111,156,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  groupShelfAvatarText: { color: TEXT, fontSize: 18, fontWeight: "900" },
  groupShelfTextWrap: { flex: 1 },
  groupShelfItemTitle: { color: TEXT, fontSize: 14, fontWeight: "800" },
  groupShelfItemSubtitle: { color: MUTED, fontSize: 12, lineHeight: 17, fontWeight: "700", marginTop: 3 },
  groupShelfEmpty: {
    borderRadius: 20,
    backgroundColor: "rgba(17, 28, 52, 0.72)",
    borderWidth: 1,
    borderColor: "rgba(66,112,180,0.10)",
    paddingHorizontal: 14,
    paddingVertical: 16,
  },
  groupShelfEmptyText: { color: MUTED, fontSize: 12, lineHeight: 18, fontWeight: "700" },
  loadingWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  loadingText: { color: TEXT, fontSize: 16, fontWeight: "800" },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: CARD_STRONG,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTextWrap: { flex: 1, paddingHorizontal: 12 },
  headerEyebrow: {
    color: MUTED_2,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.9,
    marginBottom: 2,
  },
  headerTitle: { color: TEXT, fontSize: 21, fontWeight: "900" },
  headerBadge: {
    minWidth: 76,
    minHeight: 36,
    borderRadius: 999,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(111,156,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(132,168,255,0.20)",
  },
  headerBadgeText: { color: BLUE, fontSize: 11, fontWeight: "900" },
  content: { paddingHorizontal: 16, paddingBottom: 28, paddingTop: 2 },
  heroCard: {
    marginTop: 4,
    marginBottom: 14,
    borderRadius: 30,
    overflow: "hidden",
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    shadowColor: "#000000",
    shadowOpacity: 0.28,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 14 },
    elevation: 14,
  },
  heroCoverWrap: { height: 156, position: "relative" },
  heroCoverImage: { width: "100%", height: "100%" },
  heroCoverFallback: { ...StyleSheet.absoluteFillObject },
  heroCoverShade: { ...StyleSheet.absoluteFillObject },
  coverAction: {
    position: "absolute",
    right: 12,
    top: 12,
    minHeight: 34,
    borderRadius: 999,
    paddingHorizontal: 12,
    backgroundColor: "rgba(6, 12, 24, 0.46)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  coverActionText: { color: "#FFFFFF", fontSize: 12, fontWeight: "800" },
  heroMainRow: {
    paddingHorizontal: 16,
    marginTop: -34,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 12,
  },
  avatarWrap: { width: 90, height: 90, position: "relative" },
  avatarRing: {
    width: 90,
    height: 90,
    borderRadius: 28,
    padding: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: { width: 84, height: 84, borderRadius: 24 },
  avatarFallback: {
    width: 84,
    height: 84,
    borderRadius: 24,
    backgroundColor: "rgba(10, 18, 36, 0.92)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: TEXT, fontSize: 34, fontWeight: "900" },
  avatarAction: {
    position: "absolute",
    right: -2,
    bottom: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: BLUE,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(8, 14, 28, 0.92)",
  },
  heroBody: { flex: 1, paddingBottom: 8 },
  heroTitle: { color: TEXT, fontSize: 24, fontWeight: "900" },
  heroSubtitle: { color: MUTED, fontSize: 14, fontWeight: "700", marginTop: 4 },
  heroDescription: { color: MUTED_2, fontSize: 13, lineHeight: 18, fontWeight: "600", marginTop: 6 },
  heroStatsRow: {
    paddingHorizontal: 16,
    paddingTop: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  heroChip: {
    minHeight: 46,
    borderRadius: 16,
    paddingHorizontal: 12,
    borderWidth: 1,
    justifyContent: "center",
  },
  heroChipValue: { color: TEXT, fontSize: 15, fontWeight: "900" },
  heroChipLabel: { color: MUTED, fontSize: 11, fontWeight: "700", marginTop: 1 },
  gridWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  quickActionCard: {
    borderRadius: 22,
    backgroundColor: "rgba(17, 28, 52, 0.72)",
    borderWidth: 1,
    borderColor: "rgba(66, 112, 180, 0.10)",
    padding: 14,
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: CHIP,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  quickActionTitle: { color: TEXT, fontSize: 14, fontWeight: "800" },
  quickActionSubtitle: { color: MUTED, fontSize: 12, lineHeight: 17, fontWeight: "600", marginTop: 4 },
  tabsRow: { gap: 8, paddingRight: 8, paddingBottom: 2, marginBottom: 14 },
  tabButton: {
    minHeight: 40,
    borderRadius: 999,
    paddingHorizontal: 14,
    backgroundColor: CARD_STRONG,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    alignItems: "center",
    justifyContent: "center",
  },
  tabButtonActive: {
    backgroundColor: BLUE,
    borderColor: BLUE,
  },
  tabButtonText: { color: MUTED, fontSize: 13, fontWeight: "800" },
  tabButtonTextActive: { color: "#FFFFFF" },
  sectionCard: {
    marginBottom: 14,
    borderRadius: 28,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    padding: 16,
    shadowColor: "#000000",
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  sectionHeaderRow: { marginBottom: 14 },
  sectionTitle: { color: TEXT, fontSize: 19, fontWeight: "900" },
  sectionSubtitle: { color: MUTED, fontSize: 13, lineHeight: 19, fontWeight: "600", marginTop: 5 },
  statCardWrap: {
    borderRadius: 22,
    padding: 1,
  },
  statCardInner: {
    minHeight: 88,
    borderRadius: 21,
    backgroundColor: "rgba(10, 18, 36, 0.84)",
    paddingHorizontal: 14,
    paddingVertical: 14,
    justifyContent: "space-between",
  },
  statCardValue: { color: TEXT, fontSize: 24, fontWeight: "900" },
  statCardLabel: { color: MUTED, fontSize: 12, lineHeight: 17, fontWeight: "700" },
  inlineActionButton: {
    minHeight: 84,
    borderRadius: 20,
    backgroundColor: "rgba(17, 28, 52, 0.72)",
    borderWidth: 1,
    borderColor: "rgba(66,112,180,0.10)",
    paddingHorizontal: 14,
    paddingVertical: 14,
    justifyContent: "center",
  },
  readOnlyCard: {
    minHeight: 104,
    borderRadius: 20,
    backgroundColor: "rgba(17, 28, 52, 0.72)",
    borderWidth: 1,
    borderColor: "rgba(66,112,180,0.10)",
    paddingHorizontal: 14,
    paddingVertical: 14,
    justifyContent: "center",
  },
  inlineActionLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  inlineActionIcon: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: CHIP,
    alignItems: "center",
    justifyContent: "center",
  },
  inlineTextWrap: { flex: 1 },
  inlineActionTitle: { color: TEXT, fontSize: 14, fontWeight: "800" },
  inlineActionValue: { color: MUTED, fontSize: 12, lineHeight: 17, fontWeight: "700", marginTop: 4 },
  readOnlyValue: { color: TEXT, fontSize: 22, fontWeight: "900", marginTop: 4 },
  chipsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 14 },
  infoChip: {
    minHeight: 42,
    borderRadius: 999,
    paddingHorizontal: 12,
    backgroundColor: "rgba(17, 28, 52, 0.72)",
    borderWidth: 1,
    borderColor: "rgba(66,112,180,0.10)",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  infoChipText: { color: TEXT, fontSize: 12, fontWeight: "800" },
  focusCard: {
    minHeight: 72,
    borderRadius: 22,
    paddingHorizontal: 14,
    backgroundColor: "rgba(17, 28, 52, 0.76)",
    borderWidth: 1,
    borderColor: "rgba(66,112,180,0.10)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  focusCardTitle: { color: MUTED, fontSize: 12, fontWeight: "800" },
  focusCardSubtitle: { color: TEXT, fontSize: 15, fontWeight: "900", marginTop: 4 },
  focusCardArrow: { color: BLUE, fontSize: 24, fontWeight: "900" },
  mediaStrip: { gap: 10, paddingRight: 10 },
  mediaAddCard: {
    width: 92,
    height: 124,
    borderRadius: 22,
    backgroundColor: "rgba(17, 28, 52, 0.76)",
    borderWidth: 1,
    borderColor: "rgba(66,112,180,0.10)",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  mediaAddText: { color: BLUE, fontSize: 13, fontWeight: "800" },
  mediaCard: {
    width: 140,
    height: 124,
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: "rgba(17, 28, 52, 0.76)",
    borderWidth: 1,
    borderColor: "rgba(66,112,180,0.10)",
  },
  mediaImage: { width: "100%", height: "100%" },
  videoCardFallback: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  videoCardText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
  mediaRemoveButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(6, 12, 24, 0.72)",
    alignItems: "center",
    justifyContent: "center",
  },
  formGrid: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  inputBlock: { marginBottom: 12, flex: 1 },
  inputLabel: { color: TEXT, fontSize: 13, fontWeight: "800", marginBottom: 8 },
  inputWrap: {
    minHeight: 52,
    borderRadius: 18,
    backgroundColor: "rgba(17, 28, 52, 0.78)",
    borderWidth: 1,
    borderColor: "rgba(66,112,180,0.10)",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  inputWrapMultiline: { minHeight: 102, paddingTop: 14, alignItems: "flex-start" },
  inputPrefix: { color: MUTED_2, fontSize: 16, fontWeight: "800", marginRight: 4 },
  input: { flex: 1, color: TEXT, fontSize: 15, fontWeight: "700" },
  inputMultiline: { minHeight: 72 },
  toggleRow: {
    minHeight: 72,
    borderRadius: 22,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "rgba(17, 28, 52, 0.72)",
    borderWidth: 1,
    borderColor: "rgba(66,112,180,0.10)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 10,
  },
  toggleRowDisabled: { opacity: 0.48 },
  toggleLeft: { flex: 1, flexDirection: "row", alignItems: "center" },
  toggleIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: CHIP,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  toggleTextWrap: { flex: 1 },
  toggleTitle: { color: TEXT, fontSize: 14, fontWeight: "800", marginBottom: 4 },
  toggleSubtitle: { color: MUTED, fontSize: 12, lineHeight: 17, fontWeight: "600" },
  softButton: {
    minHeight: 46,
    borderRadius: 18,
    paddingHorizontal: 14,
    backgroundColor: "rgba(17, 28, 52, 0.76)",
    borderWidth: 1,
    borderColor: "rgba(66,112,180,0.10)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 12,
  },
  softButtonText: { color: TEXT, fontSize: 14, fontWeight: "800" },
  stackList: {
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: "rgba(14, 23, 43, 0.74)",
    borderWidth: 1,
    borderColor: "rgba(66,112,180,0.10)",
  },
  stackRow: {
    minHeight: 78,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  stackRowDivider: { borderBottomWidth: 1, borderBottomColor: "rgba(66,112,180,0.08)" },
  stackLeft: { flex: 1, flexDirection: "row", alignItems: "center" },
  stackIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: CHIP,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  stackTextWrap: { flex: 1 },
  stackTitle: { color: TEXT, fontSize: 14, fontWeight: "800" },
  stackSubtitle: { color: MUTED, fontSize: 12, lineHeight: 17, fontWeight: "600", marginTop: 3 },
  stackRight: { alignItems: "flex-end", gap: 8 },
  badge: { minHeight: 28, paddingHorizontal: 10, borderRadius: 999, alignItems: "center", justifyContent: "center" },
  badgeText: { fontSize: 11, fontWeight: "900" },
  rowGhostAction: {
    minHeight: 32,
    borderRadius: 999,
    paddingHorizontal: 12,
    backgroundColor: CHIP,
    alignItems: "center",
    justifyContent: "center",
  },
  rowGhostActionText: { color: TEXT, fontSize: 12, fontWeight: "800" },
  emptyState: {
    borderRadius: 22,
    backgroundColor: "rgba(14, 23, 43, 0.74)",
    borderWidth: 1,
    borderColor: "rgba(66,112,180,0.10)",
    paddingHorizontal: 14,
    paddingVertical: 16,
  },
  emptyTitle: { color: TEXT, fontSize: 14, fontWeight: "800", marginBottom: 6 },
  emptyDescription: { color: MUTED, fontSize: 12, lineHeight: 18, fontWeight: "600" },
  timelineWrap: {
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: "rgba(14, 23, 43, 0.74)",
    borderWidth: 1,
    borderColor: "rgba(66,112,180,0.10)",
  },
  timelineItem: {
    minHeight: 74,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  timelineDivider: { borderBottomWidth: 1, borderBottomColor: "rgba(66,112,180,0.08)" },
  timelineDotWrap: { paddingTop: 4 },
  timelineDot: { width: 12, height: 12, borderRadius: 6 },
  timelineTextWrap: { flex: 1 },
  timelineTitle: { color: TEXT, fontSize: 14, fontWeight: "800" },
  timelineSubtitle: { color: MUTED, fontSize: 12, lineHeight: 17, fontWeight: "600", marginTop: 4 },
  timelineTime: { color: MUTED_2, fontSize: 11, fontWeight: "700", paddingTop: 2 },
  membersHintCard: {
    marginTop: 10,
    marginBottom: 12,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "rgba(17, 28, 52, 0.72)",
    borderWidth: 1,
    borderColor: "rgba(66,112,180,0.10)",
  },
  membersHintTitle: { color: TEXT, fontSize: 13, fontWeight: "800", marginBottom: 6 },
  membersHintText: { color: MUTED, fontSize: 12, lineHeight: 18, fontWeight: "600" },
  bottomSpace: { height: 110 },
  bottomBar: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 14,
    backgroundColor: "rgba(17, 28, 52, 0.76)",
    borderTopWidth: 1,
    borderTopColor: "rgba(66,112,180,0.10)",
  },
  bottomActionsRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  primaryButton: { borderRadius: 22, overflow: "hidden" },
  flexButton: { flex: 1 },
  primaryButtonGradient: {
    minHeight: 56,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "900" },
  secondaryButton: {
    minWidth: 110,
    minHeight: 56,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    backgroundColor: "rgba(17, 28, 52, 0.86)",
    borderWidth: 1,
    borderColor: "rgba(66,112,180,0.10)",
  },
  secondaryButtonText: { color: TEXT, fontSize: 15, fontWeight: "800" },
  buttonDisabled: { opacity: 0.65 },
});






