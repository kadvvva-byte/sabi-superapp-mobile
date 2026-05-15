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
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Camera,
  ChevronLeft,
  Gift,
  Globe2,
  Hash,
  Heart,
  History,
  ImagePlus,
  Link2,
  Lock,
  Megaphone,
  MessageCircleMore,
  Plus,
  Radio,
  Save,
  Settings2,
  Video,
} from "lucide-react-native";

import { profileKernelFacade } from "../../../core/kernel/profile";
import { getAuthSessionState } from "../../../core/kernel/auth/session.store";
import { messengerKernelFacade } from "../../../core/kernel/messenger/facade";
import { useI18n } from "../../../shared/i18n";
import { uploadUserPublicProfileMediaFile } from "../../../shared/api/user-profile-api";
import { openMessengerRoom } from "../../messenger/navigation/messengerRoomNavigation";
import {
  hydrateChannelPublicProfile,
  hydrateChannelPublicProfileStorage,
  saveChannelPublicProfile,
  subscribeChannelPublicProfiles,
} from "../../messenger/channels/channelPublicProfileRuntime";
import { syncSabiProfileChannelToPublicDirectory, syncSabiProfileChannelsCollectionToPublicDirectory } from "../../messenger/public-directory/profileDirectoryBridge";

type I18nHookValue =
  | ((key: string, params?: Record<string, unknown>) => string)
  | {
      t?: (key: string, params?: Record<string, unknown>) => string;
    };

type RouteParams = {
  userId?: string | string[];
  selfId?: string | string[];
  source?: string | string[];
};

type ChannelMediaItem = {
  id: string;
  uri: string;
  type: "photo" | "video";
  createdAt: number;
  mediaUri?: string;
  thumbnailUri?: string;
  mimeType?: string;
  durationMs?: number;
};

type ChannelHistoryEntry = {
  id: string;
  title: string;
  subtitle: string;
  kind: "identity" | "publication" | "control" | "media";
  createdAt: number;
};

type ChannelProfileState = {
  created: boolean;
  channelId: string;
  channelName: string;
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
  visibleInDiscovery: boolean;
  approveSubscribers: boolean;
  onlyAdminsCanPost: boolean;
  onlyAdminsCanEdit: boolean;
  commentsEnabled: boolean;
  reactionsEnabled: boolean;
  linkedChatId: string;
  linkedPublicationId: string;
  linkedBotId: string;
  inviteLink: string;
  publicationTitle: string;
  publicationSubtitle: string;
  publicationSlug: string;
  publicationTags: string;
  publicationSummary: string;
  publicationPhotos: ChannelMediaItem[];
  publicationVideos: ChannelMediaItem[];
  likesCount: number;
  publicGiftsCount: number;
  subscribersCount: number;
  lastUpdatedAt: number;
  history: ChannelHistoryEntry[];
};

type TabKey = "overview" | "public" | "control" | "history";

type KernelCollectionState<T = Record<string, unknown>> = {
  items: T[];
  selectedId: string | null;
};

type ChannelCollectionState = {
  channels: ChannelProfileState[];
  selectedChannelId: string | null;
};

const BG_TOP = "#08111F";
const BG_MID = "#0D1830";
const BG_BOTTOM = "#111F3F";
const TEXT = "#F3F7FF";
const MUTED = "#B8C6E3";
const CARD = "rgba(14, 23, 43, 0.78)";
const CARD_STRONG = "rgba(17, 28, 52, 0.92)";
const CARD_BORDER = "rgba(132, 168, 255, 0.18)";
const BLUE = "#6F9CFF";
const BLUE_2 = "#8D82FF";
const MINT = "#54E1C1";
const GOLD = "#FFC96B";
const PINK = "#FF7FBC";

const DEFAULT_CHANNEL_COLLECTION: ChannelCollectionState = {
  channels: [],
  selectedChannelId: null,
};

const SABI_CHANNEL_PROFILE_LOCAL_COLLECTION_STORAGE_KEY = "sabi.profile.channel.settings.v1";

const DEFAULT_CHANNEL_STATE: ChannelProfileState = {
  created: false,
  channelId: "",
  channelName: "",
  username: "",
  description: "",
  avatarUri: "",
  coverUri: "",
  ownerName: "",
  ownerUserId: "",
  ownerRole: "",
  ownerPhone: "",
  ownerEmail: "",
  isPublic: true,
  isPublished: true,
  showInProfile: true,
  searchableInDirectory: true,
  previewEnabled: true,
  visibleInDiscovery: true,
  approveSubscribers: false,
  onlyAdminsCanPost: true,
  onlyAdminsCanEdit: true,
  commentsEnabled: false,
  reactionsEnabled: true,
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
  subscribersCount: 0,
  lastUpdatedAt: 0,
  history: [],
};

function buildId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
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

function buildInviteLink(username: string, channelId: string) {
  const clean = sanitizeUsername(username);
  return clean ? `sabi://channel/${clean}` : `sabi://channel/${channelId}`;
}

function buildPublicationId(channelId: string) {
  return `pub_channel_${channelId}`;
}

function buildDefaultPublicationSlug(channelName: string, username: string, channelId: string) {
  const fromName = sanitizeSlug(channelName);
  if (fromName) return fromName;
  const fromUsername = sanitizeSlug(username);
  if (fromUsername) return fromUsername;
  return sanitizeSlug(channelId);
}

function readParamValue(value?: string | string[]) {
  if (Array.isArray(value)) return String(value[0] ?? "").trim();
  return String(value ?? "").trim();
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

function normalizeMedia(value: unknown, type: "photo" | "video"): ChannelMediaItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      const raw = item as Partial<ChannelMediaItem>;
      const mediaUri = String((raw as any)?.mediaUri ?? "").trim();
      const thumbnailUri = String((raw as any)?.thumbnailUri ?? "").trim();
      const uri = String(raw?.uri ?? "").trim() || (type === "video" ? thumbnailUri || mediaUri : mediaUri || thumbnailUri);

      return {
        id: String(raw?.id ?? "").trim() || buildId(type),
        uri,
        type,
        createdAt: Number(raw?.createdAt ?? Date.now()),
        mediaUri: mediaUri || undefined,
        thumbnailUri: thumbnailUri || undefined,
        mimeType: typeof (raw as any)?.mimeType === "string" && (raw as any).mimeType.trim() ? (raw as any).mimeType.trim() : undefined,
        durationMs: typeof (raw as any)?.durationMs === "number" && Number.isFinite((raw as any).durationMs) ? Math.max(0, Math.floor((raw as any).durationMs)) : undefined,
      };
    })
    .filter((item) => item.uri);
}

function normalizeHistory(value: unknown): ChannelHistoryEntry[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      const raw = item as Partial<ChannelHistoryEntry>;
      const kind = String(raw?.kind ?? "control") as ChannelHistoryEntry["kind"];
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

function normalizeChannelState(raw?: Partial<ChannelProfileState> | null): ChannelProfileState {
  const merged: ChannelProfileState = {
    ...DEFAULT_CHANNEL_STATE,
    ...(raw ?? {}),
    publicationPhotos: normalizeMedia(raw?.publicationPhotos, "photo"),
    publicationVideos: normalizeMedia(raw?.publicationVideos, "video"),
    history: normalizeHistory(raw?.history),
    likesCount: Number(raw?.likesCount ?? 0),
    publicGiftsCount: Number(raw?.publicGiftsCount ?? 0),
    subscribersCount: Number(raw?.subscribersCount ?? 0),
    lastUpdatedAt: Number(raw?.lastUpdatedAt ?? 0),
  };

  if (merged.username) merged.username = sanitizeUsername(merged.username);
  if (merged.channelId && !merged.inviteLink) merged.inviteLink = buildInviteLink(merged.username, merged.channelId);
  if (merged.channelId && !merged.linkedPublicationId) merged.linkedPublicationId = buildPublicationId(merged.channelId);
  if (!merged.isPublic) {
    merged.isPublished = false;
    merged.showInProfile = false;
    merged.searchableInDirectory = false;
    merged.visibleInDiscovery = false;
  }
  return merged;
}


function normalizeChannelCollection(raw: unknown): ChannelCollectionState {
  if (!raw || typeof raw !== "object") return DEFAULT_CHANNEL_COLLECTION;

  const record = raw as Record<string, unknown>;
  const channels = Array.isArray(record.channels)
    ? record.channels.map((item) => normalizeChannelState(item as Partial<ChannelProfileState>))
    : Array.isArray(record.items)
      ? record.items.map((item) => normalizeChannelState(item as Partial<ChannelProfileState>))
      : [];

  const selectedChannelId =
    String(record.selectedChannelId || record.selectedId || "").trim() ||
    channels[0]?.channelId ||
    null;

  return { channels, selectedChannelId };
}

async function readSabiLocalChannelCollection(): Promise<ChannelCollectionState> {
  try {
    const raw = await AsyncStorage.getItem(SABI_CHANNEL_PROFILE_LOCAL_COLLECTION_STORAGE_KEY);
    if (!raw) return DEFAULT_CHANNEL_COLLECTION;
    return normalizeChannelCollection(JSON.parse(raw));
  } catch {
    return DEFAULT_CHANNEL_COLLECTION;
  }
}

async function saveSabiLocalChannelCollection(collection: ChannelCollectionState): Promise<void> {
  try {
    await AsyncStorage.setItem(
      SABI_CHANNEL_PROFILE_LOCAL_COLLECTION_STORAGE_KEY,
      JSON.stringify({
        channels: collection.channels,
        selectedChannelId: collection.selectedChannelId,
        updatedAt: Date.now(),
      }),
    );
  } catch {}
}

function mergeSabiChannelCollections(
  localChannels: ChannelProfileState[],
  kernelChannels: ChannelProfileState[],
): ChannelProfileState[] {
  const map = new Map<string, ChannelProfileState>();

  for (const source of [...localChannels, ...kernelChannels]) {
    const item = normalizeChannelState(source as Partial<ChannelProfileState>);
    const key = item.channelId || item.linkedChatId || item.username || item.channelName.trim();
    if (!key) continue;

    const existing = map.get(key);
    if (!existing || Number(item.lastUpdatedAt || 0) >= Number(existing.lastUpdatedAt || 0)) {
      map.set(key, item);
    }
  }

  return Array.from(map.values()).sort((a, b) => Number(b.lastUpdatedAt || 0) - Number(a.lastUpdatedAt || 0));
}

function mapChannelMediaItemsForPublicSurface(items: ChannelMediaItem[], kind: "photo" | "video") {
  return (Array.isArray(items) ? items : [])
    .filter((item) => item && typeof item.uri === "string" && item.uri.trim())
    .map((item) => ({
      id: item.id,
      uri: item.uri,
      mediaUri: item.uri,
      kind,
      type: kind,
      createdAt: item.createdAt,
    }));
}

function buildChannelPublicDirectoryPayload(state: ChannelProfileState) {
  const linkedChatId = state.linkedChatId || (state.channelId ? `channel:${state.channelId}` : "");
  const channelName = state.channelName.trim();
  const publicationPhotos = mapChannelMediaItemsForPublicSurface(state.publicationPhotos, "photo");
  const publicationVideos = mapChannelMediaItemsForPublicSurface(state.publicationVideos, "video");

  return {
    ...state,
    id: linkedChatId || state.channelId,
    chatId: linkedChatId || state.channelId,
    roomId: linkedChatId || state.channelId,
    channelId: linkedChatId || state.channelId,
    linkedChatId: linkedChatId || state.channelId,
    type: "CHANNEL",
    kind: "CHANNEL",
    roomType: "channel",
    title: channelName,
    name: channelName,
    channelName,
    username: sanitizeUsername(state.username),
    description: state.description.trim() || state.publicationSummary.trim() || state.publicationSubtitle.trim(),
    avatarUri: state.avatarUri,
    avatarUrl: state.avatarUri,
    photoUrl: state.avatarUri,
    coverUri: state.coverUri,
    coverUrl: state.coverUri,
    publicationPhotos,
    publicationVideos,
    publicPhotos: publicationPhotos,
    publicVideos: publicationVideos,
    likesCount: state.likesCount || 0,
    publicGiftsCount: state.publicGiftsCount || 0,
    subscribersCount: state.subscribersCount || 0,
    inviteLink: state.inviteLink,
    isPublic: true,
    isPublished: true,
    searchableInDirectory: true,
    updatedAt: new Date(state.lastUpdatedAt || Date.now()).toISOString(),
  };
}

async function persistChannelMessengerRoomSnapshot(state: ChannelProfileState) {
  if (!state.created || !state.channelName.trim()) return;

  const payload = buildChannelPublicDirectoryPayload(state);

  try {
    await messengerKernelFacade.ensureRoomSnapshot({
      ...payload,
      avatarLetter: (state.channelName.trim().charAt(0) || "C").toUpperCase(),
      subtitle: state.publicationSubtitle || state.description || state.channelName,
      membershipStatus: "subscriber",
      channelRole: "owner",
      canSendMessages: "1",
      canSendText: "1",
      canSendMedia: "1",

      onlyAdminsCanPost: state.onlyAdminsCanPost ? "1" : "0",
      commentsEnabled: state.commentsEnabled ? "1" : "0",
      reactionsEnabled: state.reactionsEnabled ? "1" : "0",
      visibleInDiscovery: state.visibleInDiscovery ? "1" : "0",
    } as any);
  } catch {}
}

async function syncSabiChannelToPublicDirectory(state: ChannelProfileState) {
  if (!state.created || !state.channelName.trim()) return;

  try {
    await syncSabiProfileChannelToPublicDirectory(buildChannelPublicDirectoryPayload(state));
  } catch {}
}

function pushHistory(state: ChannelProfileState, entry: Omit<ChannelHistoryEntry, "id" | "createdAt">): ChannelProfileState {
  return {
    ...state,
    history: [{ id: buildId("hist"), createdAt: Date.now(), ...entry }, ...state.history].slice(0, 40),
  };
}

function formatRelativeTime(timestamp: number) {
  const diff = Date.now() - timestamp;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (diff < hour) return `${Math.max(1, Math.round(diff / minute))} min ago`;
  if (diff < day) return `${Math.max(1, Math.round(diff / hour))} h ago`;
  return `${Math.max(1, Math.round(diff / day))} d ago`;
}


function isSabiChannelRemoteMediaUri(uri: string) {
  return /^https?:\/\//i.test(uri) || /^sabi:\/\//i.test(uri);
}

function isSabiChannelUploadableLocalMediaUri(uri: string) {
  return /^(file|content|ph|assets-library|blob):/i.test(uri);
}

function inferSabiChannelMediaMimeType(uri: string, fallbackKind: "photo" | "video") {
  const lower = uri.toLowerCase();

  if (lower.includes("image/png") || lower.endsWith(".png")) return "image/png";
  if (lower.includes("image/webp") || lower.endsWith(".webp")) return "image/webp";
  if (lower.includes("image/heic") || lower.endsWith(".heic")) return "image/heic";
  if (lower.includes("video/quicktime") || lower.endsWith(".mov")) return "video/quicktime";
  if (lower.includes("video/mp4") || lower.endsWith(".mp4")) return "video/mp4";

  return fallbackKind === "video" ? "video/mp4" : "image/jpeg";
}

function inferSabiChannelMediaName(uri: string, fallbackKind: "photo" | "video") {
  const clean = uri.split("?")[0] || "";
  const last = clean.split("/").pop();

  if (last && last.includes(".")) return last;

  return `sabi-channel-${fallbackKind}-${Date.now()}${fallbackKind === "video" ? ".mp4" : ".jpg"}`;
}

// SABI_CHANNEL_PUBLIC_MEDIA_UPLOAD
async function uploadSabiChannelPublicMediaUri(
  uri: string,
  fallbackKind: "photo" | "video",
): Promise<string> {
  const cleanUri = typeof uri === "string" ? uri.trim() : "";

  if (!cleanUri) return "";
  if (isSabiChannelRemoteMediaUri(cleanUri)) return cleanUri;
  if (!isSabiChannelUploadableLocalMediaUri(cleanUri)) return cleanUri;

  const session = getAuthSessionState();
  const fileName = inferSabiChannelMediaName(cleanUri, fallbackKind);
  const mimeType = inferSabiChannelMediaMimeType(cleanUri, fallbackKind);

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
    console.warn("[sabi-profile-channel] media_upload_failed", error);
    return "";
  }
}

async function prepareSabiChannelPublicMediaForSync(
  state: ChannelProfileState,
): Promise<ChannelProfileState> {
  const next: ChannelProfileState = {
    ...state,
    publicationPhotos: Array.isArray(state.publicationPhotos) ? [...state.publicationPhotos] : [],
    publicationVideos: Array.isArray(state.publicationVideos) ? [...state.publicationVideos] : [],
  };

  if (next.avatarUri) {
    next.avatarUri = await uploadSabiChannelPublicMediaUri(next.avatarUri, "photo");
  }

  if (next.coverUri) {
    next.coverUri = await uploadSabiChannelPublicMediaUri(next.coverUri, "photo");
  }

  const uploadedPublicationPhotos = await Promise.all(
    next.publicationPhotos.map(async (item): Promise<ChannelMediaItem | null> => {
      const uploadedUri = await uploadSabiChannelPublicMediaUri(String(item.mediaUri || item.uri || ""), "photo");
      if (!uploadedUri) return null;

      return {
        ...item,
        uri: uploadedUri,
        mediaUri: uploadedUri,
        thumbnailUri: undefined,
      };
    }),
  );

  next.publicationPhotos = uploadedPublicationPhotos.filter((item): item is ChannelMediaItem => item !== null);

  const uploadedPublicationVideos = await Promise.all(
    next.publicationVideos.map(async (item): Promise<ChannelMediaItem | null> => {
      const uploadedUri = await uploadSabiChannelPublicMediaUri(String(item.mediaUri || item.uri || ""), "video");
      if (!uploadedUri) return null;

      return {
        ...item,
        uri: item.thumbnailUri || uploadedUri,
        mediaUri: uploadedUri,
      };
    }),
  );

  next.publicationVideos = uploadedPublicationVideos.filter((item): item is ChannelMediaItem => item !== null);

  return next;
}

function mapSabiChannelMediaItemsForPublicSurface(items: ChannelMediaItem[], kind: "photo" | "video") {
  return (Array.isArray(items) ? items : [])
    .filter((item) => item && typeof item.uri === "string" && item.uri.trim())
    .map((item) => ({
      id: item.id,
      uri: item.uri,
      mediaUri: item.mediaUri || item.uri,
      thumbnailUri: item.thumbnailUri,
      kind,
      type: kind,
      createdAt: item.createdAt,
      mimeType: item.mimeType,
      durationMs: item.durationMs,
    }));
}

function buildSabiChannelPublicSurface(state: ChannelProfileState) {
  const linkedChatId = state.linkedChatId || (state.channelId ? `channel:${state.channelId}` : "");
  const channelName = state.channelName.trim();
  const publicationPhotos = mapSabiChannelMediaItemsForPublicSurface(state.publicationPhotos, "photo");
  const publicationVideos = mapSabiChannelMediaItemsForPublicSurface(state.publicationVideos, "video");

  return {
    ...state,
    id: linkedChatId || state.channelId,
    chatId: linkedChatId || state.channelId,
    roomId: linkedChatId || state.channelId,
    channelId: linkedChatId || state.channelId,
    linkedChatId: linkedChatId || state.channelId,
    type: "CHANNEL",
    kind: "CHANNEL",
    roomType: "channel",
    title: channelName,
    name: channelName,
    channelName,
    username: sanitizeUsername(state.username),
    description: state.description.trim() || state.publicationSummary.trim() || state.publicationSubtitle.trim(),
    avatarUri: state.avatarUri,
    avatarUrl: state.avatarUri,
    photoUrl: state.avatarUri,
    coverUri: state.coverUri,
    coverUrl: state.coverUri,
    publicationPhotos,
    publicationVideos,
    publicPhotos: publicationPhotos,
    publicVideos: publicationVideos,
    likesCount: state.likesCount || 0,
    publicGiftsCount: state.publicGiftsCount || 0,
    subscribersCount: state.subscribersCount || 0,
    inviteLink: state.inviteLink,
    isPublic: true,
    isPublished: true,
    searchableInDirectory: true,
    updatedAt: new Date(state.lastUpdatedAt || Date.now()).toISOString(),
  };
}

async function syncSabiChannelPublicationPublicSurface(state: ChannelProfileState) {
  if (!state.created || !state.channelName.trim()) return;

  const surface = buildSabiChannelPublicSurface(state);
  const chatId = String(surface.chatId || surface.channelId || "").trim();
  if (!chatId) return;

  const aliases = [
    chatId,
    state.channelId,
    state.linkedChatId,
    state.linkedPublicationId,
    state.username,
    state.channelName,
    state.inviteLink,
  ]
    .map((value) => String(value || "").trim())
    .filter(Boolean);

  saveChannelPublicProfile(chatId, surface as any, aliases);

  try {
    await syncSabiProfileChannelToPublicDirectory(surface);
  } catch {}

  try {
    const auth = getAuthSessionState();
    const apiBaseUrl = String(auth.apiBaseUrl || "").replace(/\/+$/, "");
    if (!apiBaseUrl) return;

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (auth.accessToken) headers.Authorization = "Bearer " + auth.accessToken;
    if (auth.currentUserId) headers["X-User-ID"] = auth.currentUserId;

    const response = await fetch(
      apiBaseUrl + "/api/v2/messenger/channels/" + encodeURIComponent(chatId) + "/public-profile",
      {
        method: "POST",
        headers,
        body: JSON.stringify(surface),
      },
    );

    if (!response.ok) return;

    const payload = await response.json();
    const data = payload?.data || payload;

    if (data && typeof data === "object") {
      saveChannelPublicProfile(String((data as any).chatId || chatId), data as any, [
        ...aliases,
        ...((Array.isArray((data as any).aliases) ? (data as any).aliases : []) as string[]),
      ]);
    }
  } catch {}
}


// SABI_CHANNEL_PROFILE_LIKES_METRICS_SYNC
function sabiChannelMetricText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function sabiChannelMetricNumber(value: unknown): number {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : 0;
}

function sabiChannelMetricIdentifiers(state: ChannelProfileState): string[] {
  const raw = [
    state.linkedChatId,
    state.channelId,
    state.channelId ? `channel:${state.channelId}` : "",
    state.linkedPublicationId,
    state.username,
    state.channelName,
    state.inviteLink,
  ]
    .map((value) => sabiChannelMetricText(value).replace(/^@+/, ""))
    .filter(Boolean);

  return Array.from(new Set(raw));
}

function sabiChannelMetricSurfaceLikeCount(surface: unknown): number {
  if (!surface || typeof surface !== "object" || Array.isArray(surface)) return 0;

  const record = surface as Record<string, unknown>;
  const direct = sabiChannelMetricNumber(record.likesCount);
  const photos = Array.isArray(record.publicationPhotos)
    ? record.publicationPhotos
    : Array.isArray(record.publicPhotos)
      ? record.publicPhotos
      : [];
  const videos = Array.isArray(record.publicationVideos)
    ? record.publicationVideos
    : Array.isArray(record.publicVideos)
      ? record.publicVideos
      : [];

  const mediaLiked = [...photos, ...videos].reduce((total, item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return total;

    const media = item as Record<string, unknown>;
    const likedUsers = Array.isArray(media.likedByUserIds) ? media.likedByUserIds.length : 0;
    return total + Math.max(likedUsers, media.liked === true ? 1 : 0);
  }, 0);

  return Math.max(direct, mediaLiked);
}

async function fetchSabiChannelPublicMetricSurfaceFromBackend(state: ChannelProfileState) {
  try {
    const auth = getAuthSessionState();
    const apiBaseUrl = String(auth.apiBaseUrl || "").replace(/\/+$/, "");
    if (!apiBaseUrl) return null;

    const identifiers = sabiChannelMetricIdentifiers(state);
    if (!identifiers.length) return null;

    const headers: Record<string, string> = {};
    if (auth.accessToken) headers.Authorization = "Bearer " + auth.accessToken;
    if (auth.currentUserId) headers["X-User-ID"] = auth.currentUserId;

    for (const identifier of identifiers) {
      const response = await fetch(
        apiBaseUrl + "/api/v2/messenger/channels/" + encodeURIComponent(identifier) + "/public-profile",
        { method: "GET", headers },
      );

      if (!response.ok) continue;

      const payload = await response.json();
      const data = payload?.data || payload;
      if (data && typeof data === "object") return data as Record<string, unknown>;
    }
  } catch {}

  return null;
}

async function loadSabiChannelPublicMetrics(state: ChannelProfileState) {
  await hydrateChannelPublicProfileStorage();

  const identifiers = sabiChannelMetricIdentifiers(state);
  let likesCount = sabiChannelMetricNumber(state.likesCount);
  let publicGiftsCount = sabiChannelMetricNumber(state.publicGiftsCount);
  let subscribersCount = sabiChannelMetricNumber(state.subscribersCount);

  for (const identifier of identifiers) {
    const surface = hydrateChannelPublicProfile(identifier) as unknown as Record<string, unknown>;
    if (!surface || typeof surface !== "object") continue;

    likesCount = Math.max(likesCount, sabiChannelMetricSurfaceLikeCount(surface));
    publicGiftsCount = Math.max(publicGiftsCount, sabiChannelMetricNumber(surface.publicGiftsCount));
    subscribersCount = Math.max(subscribersCount, sabiChannelMetricNumber(surface.subscribersCount));
  }

  const backendSurface = await fetchSabiChannelPublicMetricSurfaceFromBackend(state);
  if (backendSurface) {
    likesCount = Math.max(likesCount, sabiChannelMetricSurfaceLikeCount(backendSurface));
    publicGiftsCount = Math.max(publicGiftsCount, sabiChannelMetricNumber(backendSurface.publicGiftsCount));
    subscribersCount = Math.max(subscribersCount, sabiChannelMetricNumber(backendSurface.subscribersCount));

    const chatId =
      sabiChannelMetricText(backendSurface.chatId) ||
      sabiChannelMetricText(backendSurface.channelId) ||
      state.linkedChatId ||
      state.channelId;

    if (chatId) {
      saveChannelPublicProfile(chatId, backendSurface as any, identifiers);
    }
  }

  return { likesCount, publicGiftsCount, subscribersCount };
}

function sameSabiChannelMetricTarget(a: ChannelProfileState, b: ChannelProfileState): boolean {
  const aKeys = new Set(sabiChannelMetricIdentifiers(a).map((item) => item.toLowerCase()));
  return sabiChannelMetricIdentifiers(b).some((item) => aKeys.has(item.toLowerCase()));
}

async function persistSabiChannelMetricsIntoProfileCollection(nextState: ChannelProfileState) {
  try {
    const raw = (profileKernelFacade.selectors as any).channelProfiles?.() as KernelCollectionState | undefined;
    const items = Array.isArray(raw?.items)
      ? raw.items.map((item) => normalizeChannelState(item as Partial<ChannelProfileState>))
      : [];

    const nextItems = items.length
      ? items.map((item) => (sameSabiChannelMetricTarget(item, nextState) ? nextState : item))
      : [nextState];

    const exists = nextItems.some((item) => sameSabiChannelMetricTarget(item, nextState));
    const finalItems = exists ? nextItems : [nextState, ...nextItems];

    await (profileKernelFacade as any).saveChannelProfiles({
      items: finalItems as unknown as Record<string, unknown>[],
      selectedId: nextState.channelId || raw?.selectedId || null,
    });
  } catch {}

  try {
    const storageModule = await import("@react-native-async-storage/async-storage");
    const AsyncStorage = storageModule.default;
    const storageKey = "sabi.profile.channel.settings.v1";
    const raw = await AsyncStorage.getItem(storageKey);
    if (!raw) return;

    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const sourceItems = Array.isArray(parsed.channels)
      ? parsed.channels
      : Array.isArray(parsed.items)
        ? parsed.items
        : [];

    if (!sourceItems.length) return;

    const channels = sourceItems.map((item) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) return item;

      const normalized = normalizeChannelState(item as Partial<ChannelProfileState>);
      if (!sameSabiChannelMetricTarget(normalized, nextState)) return item;

      return {
        ...(item as Record<string, unknown>),
        likesCount: nextState.likesCount,
        publicGiftsCount: nextState.publicGiftsCount,
        subscribersCount: nextState.subscribersCount,
        lastUpdatedAt: Date.now(),
      };
    });

    await AsyncStorage.setItem(
      storageKey,
      JSON.stringify({
        ...parsed,
        channels,
        items: channels,
        selectedChannelId: nextState.channelId || parsed.selectedChannelId || null,
        selectedId: nextState.channelId || parsed.selectedId || null,
        updatedAt: Date.now(),
      }),
    );
  } catch {}
}


async function withSabiChannelSaveTimeout<T>(
  promise: Promise<T>,
  fallback: T,
  timeoutMs = 10000,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | null = null;

  try {
    return await Promise.race([
      promise.catch(() => fallback),
      new Promise<T>((resolve) => {
        timer = setTimeout(() => resolve(fallback), timeoutMs);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export default function ChannelProfileScreen() {
  const params = useLocalSearchParams<RouteParams>();
  const i18n = useI18n() as I18nHookValue;
  const { width } = useWindowDimensions();
  const safeInsets = useSafeAreaInsets();
  const bottomBarSafeOffset = Math.max(22, safeInsets.bottom);
  const currentUserId = useMemo(() => resolveCurrentUserId(params), [params]);

  const [form, setForm] = useState<ChannelProfileState>(DEFAULT_CHANNEL_STATE);
  const bottomSpacerHeight = form.created ? 150 + bottomBarSafeOffset : 120;
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const sabiChannelSaveWatchdogRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopSabiChannelSaveWatchdog = useCallback(() => {
    if (sabiChannelSaveWatchdogRef.current) {
      clearTimeout(sabiChannelSaveWatchdogRef.current);
      sabiChannelSaveWatchdogRef.current = null;
    }

    setIsSaving(false);
  }, []);

  const startSabiChannelSaveWatchdog = useCallback(() => {
    if (sabiChannelSaveWatchdogRef.current) {
      clearTimeout(sabiChannelSaveWatchdogRef.current);
    }

    setIsSaving(true);

    sabiChannelSaveWatchdogRef.current = setTimeout(() => {
      sabiChannelSaveWatchdogRef.current = null;
      setIsSaving(false);
    }, 12000);
  }, []);

  useEffect(
    () => () => {
      if (sabiChannelSaveWatchdogRef.current) {
        clearTimeout(sabiChannelSaveWatchdogRef.current);
      }
    },
    [],
  );
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [tick, setTick] = useState(0);

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

  useEffect(() => {
    let mounted = true;

    void (async () => {
      try {
        await profileKernelFacade.boot();

        const kernelCollection = (profileKernelFacade.selectors as any).channelProfiles?.() as KernelCollectionState | undefined;
        const kernelChannels = Array.isArray(kernelCollection?.items)
          ? kernelCollection.items.map((item) => normalizeChannelState(item as Partial<ChannelProfileState>))
          : [];
        const kernelSelected = typeof kernelCollection?.selectedId === "string" && kernelCollection.selectedId.trim()
          ? kernelCollection.selectedId.trim()
          : null;

        const localCollection = await readSabiLocalChannelCollection();
        const localChannels = Array.isArray(localCollection.channels)
          ? localCollection.channels.map((item) => normalizeChannelState(item as Partial<ChannelProfileState>))
          : [];
        const localSelected = typeof localCollection.selectedChannelId === "string" && localCollection.selectedChannelId.trim()
          ? localCollection.selectedChannelId.trim()
          : null;

        const mergedChannels = mergeSabiChannelCollections(localChannels, kernelChannels);
        const selected =
          (kernelSelected && mergedChannels.some((item) => item.channelId === kernelSelected) ? kernelSelected : null) ||
          (localSelected && mergedChannels.some((item) => item.channelId === localSelected) ? localSelected : null) ||
          mergedChannels[0]?.channelId ||
          null;

        if (mergedChannels.length) {
          await saveSabiLocalChannelCollection({ channels: mergedChannels, selectedChannelId: selected });
          await (profileKernelFacade as any).saveChannelProfiles({ items: mergedChannels as unknown as Record<string, unknown>[], selectedId: selected });
        }

        if (mounted) {
          setSelectedChannelId(selected);
          setForm(mergedChannels.find((item) => item.channelId === selected) || mergedChannels[0] || DEFAULT_CHANNEL_STATE);
        }
      } finally {
        if (mounted) setIsReady(true);
      }
    })();

    const unsub = profileKernelFacade.subscribe(() => setTick((v) => v + 1));
    return () => {
      mounted = false;
      unsub();
    };
  }, []);

  const channelCollection = useMemo(() => {
    const raw = (profileKernelFacade.selectors as any).channelProfiles?.() as KernelCollectionState | undefined;
    return raw ?? { items: [], selectedId: null };
  }, [tick]);

  const channels = useMemo(
    () => (Array.isArray(channelCollection.items) ? channelCollection.items.map((item) => normalizeChannelState(item as Partial<ChannelProfileState>)) : []),
    [channelCollection.items],
  );

  useEffect(() => {
    const selectedId = selectedChannelId ?? channelCollection.selectedId ?? null;
    const nextActive = channels.find((item) => item.channelId === selectedId) ?? (selectedId ? null : null);
    if (nextActive) {
      setForm(nextActive);
      return;
    }
    if (!selectedId && channels.length === 0) {
      setForm(DEFAULT_CHANNEL_STATE);
    }
  }, [channels, channelCollection.selectedId, selectedChannelId]);

  const activeStoredChannel = useMemo(
    () => channels.find((item) => item.channelId === (selectedChannelId ?? channelCollection.selectedId ?? null)) || null,
    [channels, selectedChannelId, channelCollection.selectedId],
  );

  const channelMetricsSyncKey = useMemo(
    () =>
      [
        form.created ? "1" : "0",
        form.channelId,
        form.linkedChatId,
        form.linkedPublicationId,
        form.username,
        form.channelName,
        form.likesCount,
        form.publicGiftsCount,
        form.subscribersCount,
      ].join("|"),
    [
      form.created,
      form.channelId,
      form.linkedChatId,
      form.linkedPublicationId,
      form.username,
      form.channelName,
      form.likesCount,
      form.publicGiftsCount,
      form.subscribersCount,
    ],
  );

  useEffect(() => {
    // SABI_CHANNEL_PROFILE_LIKES_COUNTER_EFFECT:
    // Do not touch publications. Only pull shared channel public metrics into the owner profile screen.
    if (!form.created) return;

    let cancelled = false;

    const applyMetrics = async () => {
      const metrics = await loadSabiChannelPublicMetrics(form);
      if (cancelled) return;

      const nextLikesCount = Math.max(sabiChannelMetricNumber(form.likesCount), metrics.likesCount);
      const nextPublicGiftsCount = Math.max(sabiChannelMetricNumber(form.publicGiftsCount), metrics.publicGiftsCount);
      const nextSubscribersCount = Math.max(sabiChannelMetricNumber(form.subscribersCount), metrics.subscribersCount);

      if (
        nextLikesCount === sabiChannelMetricNumber(form.likesCount) &&
        nextPublicGiftsCount === sabiChannelMetricNumber(form.publicGiftsCount) &&
        nextSubscribersCount === sabiChannelMetricNumber(form.subscribersCount)
      ) {
        return;
      }

      const nextState = normalizeChannelState({
        ...form,
        likesCount: nextLikesCount,
        publicGiftsCount: nextPublicGiftsCount,
        subscribersCount: nextSubscribersCount,
        lastUpdatedAt: Date.now(),
      });

      setForm((prev) => (sameSabiChannelMetricTarget(prev, nextState) ? nextState : prev));
      await persistSabiChannelMetricsIntoProfileCollection(nextState);
    };

    void applyMetrics();

    const unsubscribe = subscribeChannelPublicProfiles(() => {
      void applyMetrics();
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [channelMetricsSyncKey]);

  const listCardWidth = useMemo(() => Math.max(140, Math.floor((width - 32 - 32 - 10) / 2)), [width]);
  const heroCardWidth = listCardWidth;
  const shelfCardWidth = useMemo(() => Math.max(148, Math.floor((width - 32 - 32 - 10) / 2)), [width]);
  const infoChipWidth = useMemo(() => Math.max(148, listCardWidth), [listCardWidth]);
  const channelInitial = useMemo(() => (form.channelName.trim().charAt(0) || "C").toUpperCase(), [form.channelName]);

  const beginNewChannel = useCallback(() => {
    setSelectedChannelId(null);
    setForm(DEFAULT_CHANNEL_STATE);
    setActiveTab("overview");
  }, []);

  const openStoredChannel = useCallback(
    (channelId: string) => {
      const target = channels.find((item) => item.channelId === channelId);
      if (!target) return;
      setSelectedChannelId(channelId);
      setForm(target);
      setActiveTab("overview");
    },
    [channels],
  );

  const saveCollection = useCallback(
    async (nextItems: ChannelProfileState[], nextSelectedId: string | null, nextForm: ChannelProfileState, alertTitle?: string, alertMessage?: string) => {
      try {
        startSabiChannelSaveWatchdog();
        // SABI_CHANNEL_PUBLICATION_UPLOAD_SYNC
        const uploadedNextForm = await withSabiChannelSaveTimeout(prepareSabiChannelPublicMediaForSync(nextForm), nextForm, 10000);
        const sourceItems = nextItems.map((item) =>
          item.channelId === uploadedNextForm.channelId ? uploadedNextForm : item,
        );
        const finalized = sourceItems.map((item) => normalizeChannelState({ ...item, lastUpdatedAt: item.lastUpdatedAt || Date.now() }));
        const finalizedActive =
          finalized.find((item) => item.channelId === nextSelectedId) ||
          finalized.find((item) => item.channelId === uploadedNextForm.channelId) ||
          uploadedNextForm;
        await saveSabiLocalChannelCollection({
          channels: finalized,
          selectedChannelId: nextSelectedId,
        });
        await (profileKernelFacade as any).saveChannelProfiles({ items: finalized, selectedId: nextSelectedId });
        await profileKernelFacade.saveChannelPreview(
          finalizedActive
            ? ({
                created: Boolean(finalizedActive.created),
                channelId: finalizedActive.channelId,
                channelName: finalizedActive.channelName,
                username: finalizedActive.username,
                isPublic: Boolean(finalizedActive.isPublic),
                isPublished: Boolean(finalizedActive.isPublished),
                ownerUserId: finalizedActive.ownerUserId,
                linkedPublicationId: finalizedActive.linkedPublicationId,
                linkedChatId: finalizedActive.linkedChatId,
              } as any)
            : null,
        );
        await persistChannelMessengerRoomSnapshot(finalizedActive);
        await syncSabiProfileChannelsCollectionToPublicDirectory(finalized as any[]);
        await syncSabiChannelToPublicDirectory(finalizedActive);
        void syncSabiChannelPublicationPublicSurface(finalizedActive).catch(() => undefined);
        setSelectedChannelId(nextSelectedId);
        setForm(finalizedActive);
        if (alertTitle && alertMessage) Alert.alert(alertTitle, alertMessage);
      } catch {
        Alert.alert(tt("profile.channelScreen.alerts.error.title", "Ошибка"), tt("profile.channelScreen.alerts.error.saveFailed", "Не удалось сохранить настройки канала."));
      } finally {
        stopSabiChannelSaveWatchdog();
      }
    },
    [tt],
  );

  const setField = useCallback((key: keyof ChannelProfileState, value: ChannelProfileState[keyof ChannelProfileState]) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value } as ChannelProfileState;
      if (key === "username") {
        const clean = sanitizeUsername(String(value));
        next.username = clean;
        if (next.channelId) next.inviteLink = buildInviteLink(clean, next.channelId);
        if (!next.publicationSlug.trim()) next.publicationSlug = buildDefaultPublicationSlug(next.channelName, clean, next.channelId);
      }
      if (key === "channelName") {
        const channelName = String(value);
        if (!next.publicationTitle.trim()) next.publicationTitle = channelName;
        if (!next.publicationSlug.trim()) next.publicationSlug = buildDefaultPublicationSlug(channelName, next.username, next.channelId);
      }
      if (key === "publicationSlug") next.publicationSlug = sanitizeSlug(String(value));
      if (key === "isPublic" && value === false) {
        next.isPublished = false;
        next.showInProfile = false;
        next.searchableInDirectory = false;
        next.visibleInDiscovery = false;
      }
      return next;
    });
  }, []);

  const buildCreatedState = useCallback(
    (source: ChannelProfileState) => {
      const channelName = source.channelName.trim();
      if (!channelName) return null;
      const channelId = source.channelId.trim() || buildId("channel");
      const username = sanitizeUsername(source.username || channelName);
      const ownerUserId = source.ownerUserId.trim() || currentUserId || buildId("owner");
      const ownerName = source.ownerName.trim() || "Владелец";
      const ownerRole = source.ownerRole.trim() || "Владелец";
      const inviteLink = buildInviteLink(username, channelId);
      const publicationSlug = source.publicationSlug.trim() || buildDefaultPublicationSlug(channelName, username, channelId);
      return {
        ...source,
        created: true,
        channelId,
        channelName,
        username,
        ownerUserId,
        ownerName,
        ownerRole,
        inviteLink,
        linkedChatId: source.linkedChatId.trim() || `channel:${channelId}`,
        linkedPublicationId: source.linkedPublicationId.trim() || buildPublicationId(channelId),
        publicationTitle: source.publicationTitle.trim() || channelName,
        publicationSlug,
        isPublished: source.isPublic ? true : false,
        showInProfile: source.isPublic ? true : false,
        searchableInDirectory: source.isPublic ? true : false,
        visibleInDiscovery: source.isPublic ? true : false,
      } satisfies ChannelProfileState;
    },
    [currentUserId],
  );

  const handleCreateChannel = useCallback(async () => {
    if (!form.channelName.trim()) {
      Alert.alert(tt("profile.channelScreen.alerts.validation.nameTitle", "Введите название канала"), tt("profile.channelScreen.alerts.validation.nameMessage", "Перед созданием укажите название канала."));
      return;
    }
    const createdState = buildCreatedState(form);
    if (!createdState) return;
    const nextState = { ...pushHistory(createdState, { kind: "identity", title: tt("profile.channelScreen.actions.create", "Создать канал"), subtitle: tt("profile.channelScreen.alerts.success.created", "Канал создан") }), lastUpdatedAt: Date.now() };
    const nextChannels = [nextState, ...channels.filter((item) => item.channelId !== nextState.channelId)];
    await saveCollection(nextChannels, nextState.channelId, nextState, tt("profile.channelScreen.alerts.success.title", "Готово"), tt("profile.channelScreen.alerts.success.created", "Канал создан"));
  }, [buildCreatedState, channels, form, saveCollection, tt]);

  const handleSaveChanges = useCallback(async () => {
    if (!form.channelName.trim()) {
      Alert.alert(tt("profile.channelScreen.alerts.validation.nameTitle", "Введите название канала"), tt("profile.channelScreen.alerts.validation.nameMessage", "Перед сохранением укажите название канала."));
      return;
    }
    const baseState = buildCreatedState(form);
    if (!baseState) return;
    const nextState = { ...pushHistory(baseState, { kind: "control", title: tt("profile.channelScreen.actions.save", "Сохранить"), subtitle: tt("profile.channelScreen.alerts.success.saved", "Настройки канала сохранены") }), lastUpdatedAt: Date.now() };
    const nextChannels = channels.some((item) => item.channelId === nextState.channelId)
      ? channels.map((item) => (item.channelId === nextState.channelId ? nextState : item))
      : [nextState, ...channels];
    await saveCollection(nextChannels, nextState.channelId, nextState, tt("profile.channelScreen.alerts.success.title", "Готово"), tt("profile.channelScreen.alerts.success.saved", "Настройки канала сохранены"));
  }, [buildCreatedState, channels, form, saveCollection, tt]);

  const handleResetChannel = useCallback(() => {
    Alert.alert(
      tt("profile.channelScreen.alerts.resetConfirm.title", "Сбросить канал"),
      tt("profile.channelScreen.alerts.resetConfirm.message", "Канал будет убран с этого экрана, откроется режим создания."),
      [
        { text: tt("profile.channelScreen.alerts.resetConfirm.cancel", "Отмена"), style: "cancel" },
        {
          text: tt("profile.channelScreen.alerts.resetConfirm.confirm", "Сбросить"),
          style: "destructive",
          onPress: async () => {
            const currentId = selectedChannelId || form.channelId || null;
            if (!currentId) {
              beginNewChannel();
              return;
            }
            const remaining = channels.filter((item) => item.channelId !== currentId);
            const nextSelected = remaining[0]?.channelId || null;
            const nextForm = remaining[0] || DEFAULT_CHANNEL_STATE;
            await saveCollection(remaining, nextSelected, nextForm, tt("profile.channelScreen.alerts.success.title", "Готово"), tt("profile.channelScreen.alerts.success.reset", "Канал удалён"));
            setActiveTab("overview");
          },
        },
      ],
    );
  }, [beginNewChannel, channels, form.channelId, saveCollection, selectedChannelId, tt]);

  const openPicker = useCallback(
    async (mode: "avatar" | "cover" | "photo" | "video") => {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(tt("common.error", "Нужно разрешение"), tt("profile.photosScreen.alerts.permissionMessage", "Разрешите доступ к галерее."));
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: mode === "video" ? ImagePicker.MediaTypeOptions.Videos : ImagePicker.MediaTypeOptions.Images,
        allowsEditing: mode !== "video",
        quality: 0.92,
      });
      if (result.canceled || !result.assets.length) return;
      const asset = result.assets[0];
      setForm((prev) => {
        let next = { ...prev };
        if (mode === "avatar") {
          next.avatarUri = asset.uri;
          next = pushHistory(next, { kind: "identity", title: tt("profile.channelScreen.media.avatar", "Аватар"), subtitle: tt("common.update", "Обновлено") });
        }
        if (mode === "cover") {
          next.coverUri = asset.uri;
          next = pushHistory(next, { kind: "publication", title: tt("profile.channelScreen.media.cover", "Обложка"), subtitle: tt("common.update", "Обновлено") });
        }
        if (mode === "photo") {
          const nextPhoto: ChannelMediaItem = { id: buildId("photo"), type: "photo", uri: asset.uri, createdAt: Date.now() };
          next.publicationPhotos = [nextPhoto, ...prev.publicationPhotos].slice(0, 12);
          next = pushHistory(next, { kind: "media", title: tt("profile.channelScreen.media.photos", "Фото"), subtitle: tt("common.add", "Добавлено") });
        }
        if (mode === "video") {
          const nextVideo: ChannelMediaItem = { id: buildId("video"), type: "video", uri: asset.uri, createdAt: Date.now() };
          next.publicationVideos = [nextVideo, ...prev.publicationVideos].slice(0, 12);
          next = pushHistory(next, { kind: "media", title: tt("profile.channelScreen.media.videos", "Видео"), subtitle: tt("common.add", "Добавлено") });
        }
        return next;
      });
    },
    [tt],
  );

  const handleRemoveMedia = useCallback((id: string, type: "photo" | "video") => {
    setForm((prev) => {
      const next = {
        ...prev,
        publicationPhotos: type === "photo" ? prev.publicationPhotos.filter((item) => item.id !== id) : prev.publicationPhotos,
        publicationVideos: type === "video" ? prev.publicationVideos.filter((item) => item.id !== id) : prev.publicationVideos,
      };
      return pushHistory(next, { kind: "media", title: tt("common.remove", "Удалено"), subtitle: type === "photo" ? tt("profile.channelScreen.media.photos", "Фото") : tt("profile.channelScreen.media.videos", "Видео") });
    });
  }, [tt]);

  const openCurrentChannelChat = useCallback(async () => {
    if (!form.created || !form.linkedChatId.trim()) {
      Alert.alert(tt("profile.channelScreen.alerts.validation.nameTitle", "Введите название канала"), tt("profile.channelScreen.readonly.notice", "Сначала создайте канал"));
      return;
    }

    await openMessengerRoom({
      chatId: form.linkedChatId,
      name: form.channelName.trim() || "Новый канал",
      roomType: "channel",
      handle: form.username ? `@${form.username}` : undefined,
      username: form.username ? `@${form.username}` : undefined,
      subtitle: form.publicationSubtitle || form.description || form.channelName,
      avatarLetter: (form.channelName.trim().charAt(0) || "C").toUpperCase(),
      avatarUrl: form.avatarUri || undefined,
      photoUrl: form.avatarUri || undefined,
      coverUrl: form.coverUri || undefined,
      publicPhotos: JSON.stringify(form.publicationPhotos.map((item) => ({ id: item.id, uri: item.uri, mediaUri: item.mediaUri || item.uri, thumbnailUri: item.thumbnailUri, kind: "photo" as const, type: "photo" as const }))),
      publicVideos: JSON.stringify(form.publicationVideos.map((item) => ({ id: item.id, uri: item.uri, mediaUri: item.mediaUri || item.uri, thumbnailUri: item.thumbnailUri, kind: "video" as const, type: "video" as const }))),
      likesCount: String(form.likesCount || 0),
      publicGiftsCount: String(form.publicGiftsCount || 0),
      verified: form.isPublished ? "1" : undefined,
      currentUserId: currentUserId || form.ownerUserId || undefined,
      markRead: false,
    });
  }, [currentUserId, form, tt]);

  const overviewCards = useMemo(
    () => [
      { key: "photos", label: tt("profile.channelScreen.media.photos", "Фото"), value: String(form.publicationPhotos.length), accent: ["#6AE1C7", "#5D9CFF"] as [string, string] },
      { key: "videos", label: tt("profile.channelScreen.media.videos", "Видео"), value: String(form.publicationVideos.length), accent: ["#88A8FF", "#B688FF"] as [string, string] },
      { key: "likes", label: tt("profile.surface.likes.title", "Лайки"), value: String(form.likesCount), accent: ["#FF9F87", "#FF6FA1"] as [string, string] },
      { key: "gifts", label: tt("profile.giftsScreen.header.title", "Подарки"), value: String(form.publicGiftsCount), accent: ["#FFD76B", "#FF9E5D"] as [string, string] },
    ],
    [form.likesCount, form.publicationPhotos.length, form.publicationVideos.length, form.publicGiftsCount, tt],
  );

  const tabs = useMemo(
    () => [
      { key: "overview" as TabKey, label: tt("profile.channelScreen.tabs.overview", "Профиль") },
      { key: "public" as TabKey, label: tt("profile.channelScreen.tabs.public", "Публично") },
      { key: "control" as TabKey, label: tt("profile.channelScreen.tabs.control", "Настройки") },
      { key: "history" as TabKey, label: tt("profile.channelScreen.tabs.history", "История") },
    ],
    [tt],
  );

  if (!isReady) {
    return (
      <LinearGradient colors={[BG_TOP, BG_MID, BG_BOTTOM]} style={styles.root}>
        <SafeAreaView style={styles.safeArea}>
          <StatusBar barStyle="light-content" />
          <View style={styles.loadingWrap}>
            <Text style={styles.loadingText}>{tt("profile.channelScreen.loading", "Загрузка канала...")}</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={[BG_TOP, BG_MID, BG_BOTTOM]} style={styles.root}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />

        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft size={20} color={TEXT} />
          </Pressable>
          <View style={styles.headerTextWrap}>
            <Text style={styles.headerEyebrow}>ВЛАДЕЛЕЦ КАНАЛА</Text>
            <Text style={styles.headerTitle}>{tt("profile.channelScreen.header.title", "Управление каналом")}</Text>
          </View>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>
              {form.created ? `${tt("profile.channelScreen.header.active", "Активен")} · ${channels.length}` : `${tt("profile.channelScreen.header.create", "Создать")} · ${channels.length}`}
            </Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.sectionCard}>
            <View style={styles.rowBetween}>
              <View>
                <Text style={styles.sectionTitle}>{tt("profile.channelScreen.shelf.title", "Мои каналы")}</Text>
                <Text style={styles.sectionSubtitle}>
                  {activeStoredChannel
                    ? `${channels.length} ${tt("profile.channelScreen.shelf.countLabel", "каналов")} · ${activeStoredChannel.channelName}`
                    : `${channels.length} ${tt("profile.channelScreen.shelf.countLabel", "каналов")}`}
                </Text>
              </View>
              <Pressable style={styles.smallButton} onPress={beginNewChannel}>
                <Plus size={16} color="#fff" />
                <Text style={styles.smallButtonText}>{tt("common.new", "Новый")}</Text>
              </Pressable>
            </View>
            {channels.length ? (
              <View style={styles.gridWrap}>
                {channels.map((item) => (
                  <Pressable key={item.channelId} style={[styles.shelfItem, { width: shelfCardWidth }, item.channelId === (selectedChannelId ?? channelCollection.selectedId ?? null) && styles.shelfItemActive]} onPress={() => openStoredChannel(item.channelId)}>
                    <View style={styles.shelfAvatar}><Text style={styles.shelfAvatarText}>{(item.channelName.trim().charAt(0) || "C").toUpperCase()}</Text></View>
                    <View style={styles.flex1}>
                      <Text style={styles.shelfTitle} numberOfLines={1}>{item.channelName || tt("profile.channelScreen.defaults.channelName", "Новый канал")}</Text>
                      <Text style={styles.shelfSubtitle} numberOfLines={1}>{item.username ? `@${item.username}` : item.inviteLink || item.channelId}</Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            ) : (
              <EmptyState title={tt("profile.channelScreen.shelf.empty", "Каналов пока нет. Создайте первый канал здесь.")} description="" />
            )}
          </View>

          {!form.created ? (
            <View style={styles.sectionCard}>
              <View style={styles.rowStart}>
                <View style={styles.iconBubble}><Radio size={18} color={BLUE} /></View>
                <View style={styles.flex1}>
                  <Text style={styles.sectionTitle}>{tt("profile.channelScreen.actions.create", "Создать канал")}</Text>
                  <Text style={styles.sectionSubtitle}>{tt("profile.channelScreen.createFlow.subtitle", "Введите название канала. ID владельца и ссылка создаются автоматически.")}</Text>
                </View>
              </View>
              <CompactInput label={tt("profile.channelScreen.main.channelName.label", "Название канала")} value={form.channelName} onChangeText={(value) => setField("channelName", value)} placeholder={tt("profile.channelScreen.main.channelName.placeholder", "Введите название канала")} />
              <CompactInput label={tt("profile.channelScreen.main.username.label", "Имя канала")} value={form.username} onChangeText={(value) => setField("username", sanitizeUsername(value))} placeholder={tt("profile.channelScreen.main.username.placeholder", "sabi_kanal")} prefix="@" />
              <CompactInput label={tt("profile.channelScreen.main.description.label", "Описание")} value={form.description} onChangeText={(value) => setField("description", value)} placeholder={tt("profile.channelScreen.main.description.placeholder", "Описание канала")} multiline />
              <View style={styles.gridWrap}>
                <InfoChip width={infoChipWidth} icon={<Hash size={14} color={MINT} />} label={tt("profile.channelScreen.createFlow.ownerAuto", "ID владельца и привязка чата создаются автоматически")} />
                <InfoChip width={infoChipWidth} icon={<Link2 size={14} color={BLUE_2} />} label={tt("profile.channelScreen.createFlow.inviteAuto", "Ссылка и ID публикации создаются автоматически")} />
              </View>
              <PrimaryAction disabled={isSaving} onPress={handleCreateChannel} label={isSaving ? tt("profile.channelScreen.actions.creating", "Создание...") : tt("profile.channelScreen.actions.create", "Создать канал")} />
            </View>
          ) : null}

          <View style={styles.heroCard}>
            <View style={styles.heroCoverWrap}>
              {form.coverUri ? <Image source={{ uri: form.coverUri }} style={styles.heroCoverImage} /> : <LinearGradient colors={["rgba(84,225,193,0.72)", "rgba(111,156,255,0.78)", "rgba(141,130,255,0.70)"]} style={styles.heroCoverFallback} />}
              <Pressable style={styles.coverAction} onPress={() => void openPicker("cover")}>
                <Camera size={14} color="#FFFFFF" />
                <Text style={styles.coverActionText}>{tt("profile.channelScreen.media.cover", "Обложка")}</Text>
              </Pressable>
            </View>
            <View style={styles.heroMainRow}>
              <View style={styles.avatarWrap}>
                <LinearGradient colors={["#72E4CB", "#689AFF"]} style={styles.avatarRing}>
                  {form.avatarUri ? <Image source={{ uri: form.avatarUri }} style={styles.avatarImage} /> : <View style={styles.avatarFallback}><Text style={styles.avatarText}>{channelInitial}</Text></View>}
                </LinearGradient>
                <Pressable style={styles.avatarAction} onPress={() => void openPicker("avatar")}>
                  <Camera size={13} color="#FFFFFF" />
                </Pressable>
              </View>
              <View style={styles.flex1}>
                <Text style={styles.heroTitle}>{form.channelName.trim() || tt("profile.channelScreen.defaults.channelName", "Новый канал")}</Text>
                <Text style={styles.heroSubtitle}>{form.username ? `@${form.username}` : tt("profile.channelScreen.defaults.username", "Имя канала не задано")}</Text>
                <Text style={styles.heroDescription} numberOfLines={2}>{form.description.trim() || tt("profile.channelScreen.defaults.description", "Название, имя канала и описание.")}</Text>
              </View>
            </View>
            <View style={styles.gridWrap}>
              <HeroChip width={listCardWidth} label={tt("profile.channelScreen.stats.subscribers", "Подписчики")} value={String(form.subscribersCount)} tone="blue" />
              <HeroChip width={listCardWidth} label={tt("profile.channelScreen.stats.photos", "Фото")} value={String(form.publicationPhotos.length)} tone="mint" />
              <HeroChip width={listCardWidth} label={tt("profile.channelScreen.stats.gifts", "Подарки")} value={String(form.publicGiftsCount)} tone="gold" />
              <HeroChip width={listCardWidth} label={tt("profile.channelScreen.stats.history", "История")} value={String(form.history.length)} tone="pink" />
            </View>
            <View style={styles.gridWrap}>
              <QuickActionCard width={heroCardWidth} icon={<ImagePlus size={18} color={BLUE} />} title={tt("profile.channelScreen.media.photos", "Фото")} subtitle={tt("profile.channelScreen.media.photosSubtitle", "Публичные фото")} onPress={() => { setActiveTab("public"); void openPicker("photo"); }} />
              <QuickActionCard width={heroCardWidth} icon={<Video size={18} color={MINT} />} title={tt("profile.channelScreen.media.videos", "Видео")} subtitle={tt("profile.channelScreen.media.videosSubtitle", "Публичные видео")} onPress={() => { setActiveTab("public"); void openPicker("video"); }} />
              <QuickActionCard width={heroCardWidth} icon={<Megaphone size={18} color={BLUE_2} />} title={tt("profile.channelScreen.quick.public", "Публичный слой")} subtitle={tt("profile.channelScreen.quick.publicSubtitle", "Данные публикации и видимость")} onPress={() => setActiveTab("public")} />
              <QuickActionCard width={heroCardWidth} icon={<Settings2 size={18} color={PINK} />} title={tt("profile.channelScreen.quick.settings", "Настройки")} subtitle={tt("profile.channelScreen.quick.settingsSubtitle", "Права и управление каналом")} onPress={() => setActiveTab("control")} />
            </View>
            {form.created ? (
              <Pressable style={styles.focusCard} onPress={openCurrentChannelChat}>
                <View style={styles.rowStart}>
                  <View style={styles.inlineActionIcon}><MessageCircleMore size={18} color={BLUE} /></View>
                  <View>
                    <Text style={styles.focusCardTitle}>{tt("profile.channelScreen.openChat.title", "Открыть чат канала")}</Text>
                    <Text style={styles.focusCardSubtitle}>{tt("profile.channelScreen.openChat.subtitle", "Перейти в комнату канала")}</Text>
                  </View>
                </View>
                <Text style={styles.focusCardArrow}>→</Text>
              </Pressable>
            ) : null}
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
            {tabs.map((tab) => {
              const active = activeTab === tab.key;
              return <Pressable key={tab.key} onPress={() => setActiveTab(tab.key)} style={[styles.tabButton, active && styles.tabButtonActive]}><Text style={[styles.tabButtonText, active && styles.tabButtonTextActive]}>{tab.label}</Text></Pressable>;
            })}
          </ScrollView>

          {activeTab === "overview" ? (
            <>
              <GlassSection title={tt("profile.channelScreen.sections.identity.title", "Данные канала")} subtitle={tt("profile.channelScreen.sections.identity.subtitle", "Основной публичный блок канала.")}>
                <View style={styles.gridWrap}>{overviewCards.map((item) => <StatCard key={item.key} width={listCardWidth} label={item.label} value={item.value} accent={item.accent} />)}</View>
              </GlassSection>
              <GlassSection title={tt("profile.channelScreen.sections.activity.title", "Активность")} subtitle={tt("profile.channelScreen.sections.activity.subtitle", "Лайки и подарки приходят от пользователей.")}>
                <View style={styles.gridWrap}>
                  <ReadOnlyCounterCard width={listCardWidth} icon={<Heart size={16} color={PINK} />} title={tt("profile.surface.likes.title", "Лайки")} value={`${form.likesCount}`} subtitle={tt("profile.channelScreen.readonly.likes", "Лайки приходят от пользователей.")} />
                  <ReadOnlyCounterCard width={listCardWidth} icon={<Gift size={16} color={GOLD} />} title={tt("profile.giftsScreen.header.title", "Подарки")} value={`${form.publicGiftsCount}`} subtitle={tt("profile.channelScreen.readonly.gifts", "Подарки приходят от пользователей.")} />
                </View>
              </GlassSection>
              <GlassSection title={tt("profile.channelScreen.sections.publication.title", "Публикация и видимость")} subtitle={tt("profile.channelScreen.sections.publication.subtitle", "Публичные данные и правила видимости канала.")}>
                <View style={styles.chipsWrap}>
                  <InfoChip icon={<Globe2 size={14} color={BLUE} />} label={form.isPublic ? tt("profile.channelScreen.flags.public", "Публично") : tt("profile.channelScreen.flags.private", "Личный")} />
                  <InfoChip icon={<Megaphone size={14} color={MINT} />} label={form.isPublished ? tt("profile.channelScreen.flags.published", "Опубликован") : tt("profile.channelScreen.flags.preview", "Предпросмотр")} />
                  <InfoChip icon={<Link2 size={14} color={BLUE_2} />} label={form.showInProfile ? tt("profile.channelScreen.flags.profileVisible", "Виден в профиле") : tt("profile.channelScreen.flags.profileHidden", "Скрыт из профиля")} />
                </View>
                <Pressable style={styles.focusCard} onPress={() => setActiveTab("public")}>
                  <View>
                    <Text style={styles.focusCardTitle}>{tt("common.open", "Открыть")}</Text>
                    <Text style={styles.focusCardSubtitle}>{tt("profile.channelScreen.focus.public", "Управление публичными данными и медиа")}</Text>
                  </View>
                  <Text style={styles.focusCardArrow}>→</Text>
                </Pressable>
              </GlassSection>
            </>
          ) : null}

          {activeTab === "public" ? (
            <>
              <GlassSection title={tt("profile.channelScreen.sections.public.title", "Публично")} subtitle={tt("profile.channelScreen.sections.public.subtitle", "Фото, видео и видимость публикации.")}>
                <View style={styles.gridWrap}>
                  <StatCard width={listCardWidth} label={tt("profile.channelScreen.media.photos", "Фото")} value={String(form.publicationPhotos.length)} accent={["#72E4CB", "#689AFF"]} />
                  <StatCard width={listCardWidth} label={tt("profile.channelScreen.media.videos", "Видео")} value={String(form.publicationVideos.length)} accent={["#9A8DFF", "#689AFF"]} />
                  <StatCard width={listCardWidth} label={tt("profile.surface.likes.title", "Лайки")} value={String(form.likesCount)} accent={["#FF9C88", "#FF6FA1"]} />
                  <StatCard width={listCardWidth} label={tt("profile.giftsScreen.header.title", "Подарки")} value={String(form.publicGiftsCount)} accent={["#FFD66A", "#F3A93B"]} />
                </View>
                <View style={styles.gridWrap}>
                  <InlineActionButton width={listCardWidth} icon={<ImagePlus size={16} color={BLUE} />} title={tt("profile.channelScreen.media.addPhoto", "Добавить фото")} value={tt("profile.channelScreen.media.gallery", "Галерея")} onPress={() => void openPicker("photo")} />
                  <InlineActionButton width={listCardWidth} icon={<Video size={16} color={MINT} />} title={tt("profile.channelScreen.media.addVideo", "Добавить видео")} value={tt("profile.channelScreen.media.gallery", "Галерея")} onPress={() => void openPicker("video")} />
                </View>
              </GlassSection>
              <GlassSection title={tt("profile.channelScreen.media.photos", "Фото")} subtitle={tt("profile.channelScreen.media.photosSubtitle", "Публичные фото в профиле канала.")}>
                <MediaStrip items={form.publicationPhotos} type="photo" emptyTitle={tt("profile.channelScreen.media.emptyPhotosTitle", "Фото пока нет")} emptyDescription={tt("profile.channelScreen.media.emptyPhotosSubtitle", "Добавьте первое фото.")} onAdd={() => void openPicker("photo")} onRemove={(id) => handleRemoveMedia(id, "photo")} />
              </GlassSection>
              <GlassSection title={tt("profile.channelScreen.media.videos", "Видео")} subtitle={tt("profile.channelScreen.media.videosSubtitle", "Публичные видео в профиле канала.")}>
                <MediaStrip items={form.publicationVideos} type="video" emptyTitle={tt("profile.channelScreen.media.emptyVideosTitle", "Видео пока нет")} emptyDescription={tt("profile.channelScreen.media.emptyVideosSubtitle", "Добавьте первое видео.")} onAdd={() => void openPicker("video")} onRemove={(id) => handleRemoveMedia(id, "video")} />
              </GlassSection>
            </>
          ) : null}

          {activeTab === "control" ? (
            <>
              <GlassSection title={tt("profile.channelScreen.sections.owner.title", "Данные владельца")} subtitle={tt("profile.channelScreen.sections.owner.subtitle", "ID владельца создаётся автоматически, если поле пустое.")}>
                <CompactInput label={tt("profile.channelScreen.owner.name", "Имя владельца")} value={form.ownerName} onChangeText={(value) => setField("ownerName", value)} placeholder={tt("profile.channelScreen.owner.namePlaceholder", "Владелец")} />
                <CompactInput label={tt("profile.channelScreen.owner.userId", "ID владельца")} value={form.ownerUserId} onChangeText={(value) => setField("ownerUserId", value)} placeholder={tt("profile.channelScreen.owner.userIdPlaceholder", "Создаётся автоматически")} />
                <View style={styles.formGrid}>
                  <CompactInput label={tt("profile.channelScreen.owner.role", "Роль владельца")} value={form.ownerRole} onChangeText={(value) => setField("ownerRole", value)} placeholder={tt("profile.channelScreen.owner.rolePlaceholder", "Владелец")} />
                  <CompactInput label={tt("profile.channelScreen.owner.phone", "Телефон владельца")} value={form.ownerPhone} onChangeText={(value) => setField("ownerPhone", value)} placeholder="+998..." />
                </View>
                <CompactInput label={tt("profile.channelScreen.owner.email", "Почта владельца")} value={form.ownerEmail} onChangeText={(value) => setField("ownerEmail", value)} placeholder="sabi@sabi.app" />
              </GlassSection>
              <GlassSection title={tt("profile.channelScreen.sections.main.title", "Основные данные")} subtitle={tt("profile.channelScreen.sections.main.subtitle", "Для создания нужно только название канала.")}>
                <CompactInput label={tt("profile.channelScreen.main.channelName.label", "Название канала")} value={form.channelName} onChangeText={(value) => setField("channelName", value)} placeholder={tt("profile.channelScreen.main.channelName.placeholder", "Введите название канала")} />
                <CompactInput label={tt("profile.channelScreen.main.username.label", "Имя канала")} value={form.username} onChangeText={(value) => setField("username", sanitizeUsername(value))} placeholder={tt("profile.channelScreen.main.username.placeholder", "sabi_kanal")} prefix="@" />
                <CompactInput label={tt("profile.channelScreen.main.description.label", "Описание")} value={form.description} onChangeText={(value) => setField("description", value)} placeholder={tt("profile.channelScreen.main.description.placeholder", "Описание канала")} multiline />
                {!!form.created ? <View style={styles.formGrid}><CompactInput label={tt("profile.channelScreen.main.channelId", "ID канала")} value={form.channelId} onChangeText={(value) => setField("channelId", value)} placeholder={tt("profile.channelScreen.main.channelIdPlaceholder", "Создаётся автоматически")} /><CompactInput label={tt("profile.channelScreen.main.inviteLink", "Ссылка-приглашение")} value={form.inviteLink} onChangeText={(value) => setField("inviteLink", value)} placeholder="sabi://channel/..." /></View> : null}
              </GlassSection>
              <GlassSection title={tt("profile.channelScreen.sections.publication.title", "Публикация и видимость")} subtitle={tt("profile.channelScreen.sections.publication.subtitle", "Публичный режим и правила публикации.")}>
                <ToggleRow icon={<Globe2 size={18} color={BLUE} />} title={tt("profile.channelScreen.toggles.public", "Публичный канал")} subtitle={tt("profile.channelScreen.toggles.publicSubtitle", "Использовать канал в публичном режиме.")} value={form.isPublic} onValueChange={(value) => setField("isPublic", value)} />
                <ToggleRow icon={<Megaphone size={18} color={MINT} />} title={tt("profile.channelScreen.toggles.published", "Публикация включена")} subtitle={tt("profile.channelScreen.toggles.publishedSubtitle", "Включить публичный слой публикации.")} value={form.isPublished} onValueChange={(value) => setField("isPublished", value)} disabled={!form.isPublic} />
                <ToggleRow icon={<Link2 size={18} color={BLUE_2} />} title={tt("profile.channelScreen.toggles.showInProfile", "Показывать в профиле")} subtitle={tt("profile.channelScreen.toggles.showInProfileSubtitle", "Показывать канал в профиле.")} value={form.showInProfile} onValueChange={(value) => setField("showInProfile", value)} disabled={!form.isPublic} />
                <ToggleRow icon={<Globe2 size={18} color={BLUE} />} title={tt("profile.channelScreen.toggles.searchable", "Доступен в поиске")} subtitle={tt("profile.channelScreen.toggles.searchableSubtitle", "Разрешить поиск в каталоге.")} value={form.searchableInDirectory} onValueChange={(value) => setField("searchableInDirectory", value)} disabled={!form.isPublic} />
                <ToggleRow icon={<Link2 size={18} color={BLUE_2} />} title={tt("profile.channelScreen.toggles.preview", "Предпросмотр включён")} subtitle={tt("profile.channelScreen.toggles.previewSubtitle", "Показывать предпросмотр в профиле и ссылках.")} value={form.previewEnabled} onValueChange={(value) => setField("previewEnabled", value)} />
                <ToggleRow icon={<Globe2 size={18} color={MINT} />} title={tt("profile.channelScreen.toggles.discovery", "Виден в поиске")} subtitle={tt("profile.channelScreen.toggles.discoverySubtitle", "Разрешить публичное отображение.")} value={form.visibleInDiscovery} onValueChange={(value) => setField("visibleInDiscovery", value)} disabled={!form.isPublic} />
                <CompactInput label={tt("profile.channelScreen.publication.publicationId", "ID публикации")} value={form.linkedPublicationId} onChangeText={(value) => setField("linkedPublicationId", value)} placeholder="pub_channel_..." />
                <CompactInput label={tt("profile.channelScreen.publication.title", "Заголовок публикации")} value={form.publicationTitle} onChangeText={(value) => setField("publicationTitle", value)} placeholder={tt("profile.channelScreen.publication.titlePlaceholder", "Публичный заголовок")} />
                <CompactInput label={tt("profile.channelScreen.publication.subtitle", "Подзаголовок публикации")} value={form.publicationSubtitle} onChangeText={(value) => setField("publicationSubtitle", value)} placeholder={tt("profile.channelScreen.publication.subtitlePlaceholder", "Краткое публичное описание")} />
                <View style={styles.formGrid}>
                  <CompactInput label={tt("profile.channelScreen.publication.slug", "Код публикации")} value={form.publicationSlug} onChangeText={(value) => setField("publicationSlug", sanitizeSlug(value))} placeholder="kanal" />
                  <CompactInput label={tt("profile.channelScreen.publication.tags", "Теги")} value={form.publicationTags} onChangeText={(value) => setField("publicationTags", value)} placeholder="новости, обновления" />
                </View>
                <CompactInput label={tt("profile.channelScreen.publication.summary", "Описание публикации")} value={form.publicationSummary} onChangeText={(value) => setField("publicationSummary", value)} placeholder={tt("profile.channelScreen.publication.summaryPlaceholder", "Краткое описание для публичной карточки")} multiline />
              </GlassSection>
              <GlassSection title={tt("profile.channelScreen.sections.permissions.title", "Права и модерация")} subtitle={tt("profile.channelScreen.sections.permissions.subtitle", "Подписчики и правила публикации.")}>
                <ToggleRow icon={<Hash size={18} color={BLUE} />} title={tt("profile.channelScreen.toggles.approveSubscribers", "Одобрять подписчиков")} subtitle={tt("profile.channelScreen.toggles.approveSubscribersSubtitle", "Требовать ручное одобрение подписки.")} value={form.approveSubscribers} onValueChange={(value) => setField("approveSubscribers", value)} />
                <ToggleRow icon={<Megaphone size={18} color={PINK} />} title={tt("profile.channelScreen.toggles.onlyAdminsCanPost", "Публиковать могут только админы")} subtitle={tt("profile.channelScreen.toggles.onlyAdminsCanPostSubtitle", "Публикация доступна владельцу и админам.")} value={form.onlyAdminsCanPost} onValueChange={(value) => setField("onlyAdminsCanPost", value)} />
                <ToggleRow icon={<Lock size={18} color={BLUE_2} />} title={tt("profile.channelScreen.toggles.onlyAdminsCanEdit", "Редактировать могут только админы")} subtitle={tt("profile.channelScreen.toggles.onlyAdminsCanEditSubtitle", "Данные канала могут менять только админы.")} value={form.onlyAdminsCanEdit} onValueChange={(value) => setField("onlyAdminsCanEdit", value)} />
                <ToggleRow icon={<History size={18} color={GOLD} />} title={tt("profile.channelScreen.toggles.commentsEnabled", "Комментарии включены")} subtitle={tt("profile.channelScreen.toggles.commentsEnabledSubtitle", "Разрешить комментарии под постами.")} value={form.commentsEnabled} onValueChange={(value) => setField("commentsEnabled", value)} />
                <ToggleRow icon={<Heart size={18} color={MINT} />} title={tt("profile.channelScreen.toggles.reactionsEnabled", "Реакции включены")} subtitle={tt("profile.channelScreen.toggles.reactionsEnabledSubtitle", "Разрешить реакции на посты канала.")} value={form.reactionsEnabled} onValueChange={(value) => setField("reactionsEnabled", value)} />
              </GlassSection>
              <GlassSection title={tt("profile.channelScreen.sections.links.title", "Привязки")} subtitle={tt("profile.channelScreen.sections.links.subtitle", "Привязка чата, публикации и бота.")}>
                <CompactInput label={tt("profile.channelScreen.links.chatId", "ID связанного чата")} value={form.linkedChatId} onChangeText={(value) => setField("linkedChatId", value)} placeholder="channel:..." />
                <CompactInput label={tt("profile.channelScreen.links.botId", "ID связанного бота")} value={form.linkedBotId} onChangeText={(value) => setField("linkedBotId", value)} placeholder="bot_..." />
                <CompactInput label={tt("profile.channelScreen.links.subscribers", "Количество подписчиков")} value={String(form.subscribersCount || 0)} onChangeText={(value) => setField("subscribersCount", Number(value.replace(/[^0-9]/g, "") || 0))} placeholder="0" />
              </GlassSection>
            </>
          ) : null}

          {activeTab === "history" ? (
            <GlassSection title={tt("profile.channelScreen.tabs.history", "История")} subtitle={tt("profile.channelScreen.history.subtitle", "Последние действия владельца и публичного слоя.")}>
              {form.history.length ? (
                <View style={styles.timelineWrap}>{form.history.map((item, index) => <View key={item.id} style={[styles.timelineItem, index !== form.history.length - 1 && styles.timelineDivider]}><View style={styles.timelineDotWrap}><View style={[styles.timelineDot, timelineColor(item.kind)]} /></View><View style={styles.flex1}><Text style={styles.timelineTitle}>{item.title}</Text><Text style={styles.timelineSubtitle}>{item.subtitle}</Text></View><Text style={styles.timelineTime}>{formatRelativeTime(item.createdAt)}</Text></View>)}</View>
              ) : (
                <EmptyState title={tt("profile.channelScreen.history.emptyTitle", "Пока пусто")} description={tt("profile.channelScreen.history.emptySubtitle", "История появится после действий.")} />
              )}
            </GlassSection>
          ) : null}

          <View style={{ height: bottomSpacerHeight }} />
        </ScrollView>

        {form.created ? (
          <View style={[styles.bottomBar, { bottom: bottomBarSafeOffset }]}>
            <View style={styles.bottomActionsRow}>
              <Pressable style={[styles.secondaryButton, isSaving && styles.buttonDisabled]} disabled={isSaving} onPress={handleResetChannel}><Text style={styles.secondaryButtonText}>{tt("profile.channelScreen.actions.reset", "Сбросить")}</Text></Pressable>
              <Pressable style={[styles.primaryButton, styles.flex1, isSaving && styles.buttonDisabled]} disabled={isSaving} onPress={handleSaveChanges}>
                <LinearGradient colors={[BLUE, BLUE_2]} style={styles.primaryButtonGradient}><Save size={18} color="#FFFFFF" /><Text style={styles.primaryButtonText}>{isSaving ? tt("profile.channelScreen.actions.saving", "Сохранение...") : tt("profile.channelScreen.actions.save", "Сохранить")}</Text></LinearGradient>
              </Pressable>
            </View>
          </View>
        ) : null}
      </SafeAreaView>
    </LinearGradient>
  );
}

function GlassSection(props: { title: string; subtitle?: string; children: React.ReactNode }) {
  return <View style={styles.sectionCard}><Text style={styles.sectionTitle}>{props.title}</Text>{props.subtitle ? <Text style={styles.sectionSubtitle}>{props.subtitle}</Text> : null}{props.children}</View>;
}

function CompactInput(props: { label: string; value: string; onChangeText: (value: string) => void; placeholder?: string; prefix?: string; multiline?: boolean }) {
  return (
    <View style={styles.inputWrap}>
      <Text style={styles.inputLabel}>{props.label}</Text>
      <View style={[styles.inputShell, props.multiline && styles.inputShellMultiline]}>
        {props.prefix ? <Text style={styles.inputPrefix}>{props.prefix}</Text> : null}
        <TextInput value={props.value} onChangeText={props.onChangeText} placeholder={props.placeholder} placeholderTextColor="rgba(184,198,227,0.45)" style={[styles.input, props.multiline && styles.inputMultiline]} multiline={props.multiline} />
      </View>
    </View>
  );
}

function ToggleRow(props: { icon: React.ReactNode; title: string; subtitle: string; value: boolean; onValueChange: (value: boolean) => void; disabled?: boolean }) {
  return <View style={[styles.toggleRow, props.disabled && { opacity: 0.5 }]}><View style={styles.rowStart}>{props.icon}<View style={{ marginLeft: 10, flex: 1 }}><Text style={styles.toggleTitle}>{props.title}</Text><Text style={styles.toggleSubtitle}>{props.subtitle}</Text></View></View><Switch value={props.value} onValueChange={props.onValueChange} disabled={props.disabled} /></View>;
}

function InfoChip(props: { icon: React.ReactNode; label: string; width?: number }) {
  return <View style={[styles.infoChip, props.width ? { width: props.width } : null]}><View>{props.icon}</View><Text style={styles.infoChipText}>{props.label}</Text></View>;
}

function EmptyState(props: { title: string; description: string }) {
  return <View style={styles.emptyWrap}><Text style={styles.emptyTitle}>{props.title}</Text>{props.description ? <Text style={styles.emptyDescription}>{props.description}</Text> : null}</View>;
}

function HeroChip(props: { width?: number; label: string; value: string; tone: "blue" | "mint" | "gold" | "pink" }) {
  const toneStyles = {
    blue: { backgroundColor: "rgba(58,113,255,0.10)", borderColor: "rgba(58,113,255,0.16)" },
    mint: { backgroundColor: "rgba(56,199,177,0.10)", borderColor: "rgba(56,199,177,0.16)" },
    gold: { backgroundColor: "rgba(243,169,59,0.10)", borderColor: "rgba(243,169,59,0.16)" },
    pink: { backgroundColor: "rgba(255,111,161,0.10)", borderColor: "rgba(255,111,161,0.16)" },
  }[props.tone];
  return <View style={[styles.heroChip, props.width ? { width: props.width } : null, toneStyles]}><Text style={styles.heroChipValue}>{props.value}</Text><Text style={styles.heroChipLabel}>{props.label}</Text></View>;
}

function QuickActionCard(props: { width: number; icon: React.ReactNode; title: string; subtitle: string; onPress: () => void }) {
  return <Pressable style={[styles.quickActionCard, { width: props.width }]} onPress={props.onPress}><View style={styles.iconBubble}>{props.icon}</View><Text style={styles.quickTitle}>{props.title}</Text><Text style={styles.quickSubtitle}>{props.subtitle}</Text></Pressable>;
}

function StatCard(props: { width: number; label: string; value: string; accent: [string, string] }) {
  return <LinearGradient colors={props.accent} style={[styles.statCardWrap, { width: props.width }]}><View style={styles.statCardInner}><Text style={styles.statCardValue}>{props.value}</Text><Text style={styles.statCardLabel}>{props.label}</Text></View></LinearGradient>;
}

function ReadOnlyCounterCard(props: { width: number; icon: React.ReactNode; title: string; value: string; subtitle: string }) {
  return <View style={[styles.readOnlyCard, { width: props.width }]}><View style={styles.rowStart}>{props.icon}<Text style={styles.readOnlyTitle}>{props.title}</Text></View><Text style={styles.readOnlyValue}>{props.value}</Text><Text style={styles.readOnlySubtitle}>{props.subtitle}</Text></View>;
}

function InlineActionButton(props: { width: number; icon: React.ReactNode; title: string; value: string; onPress: () => void }) {
  return <Pressable style={[styles.inlineButton, { width: props.width }]} onPress={props.onPress}><View style={styles.rowStart}><View style={styles.inlineActionIcon}>{props.icon}</View><View><Text style={styles.inlineActionTitle}>{props.title}</Text><Text style={styles.inlineActionValue}>{props.value}</Text></View></View></Pressable>;
}

function MediaStrip(props: { items: ChannelMediaItem[]; type: "photo" | "video"; emptyTitle: string; emptyDescription: string; onAdd: () => void; onRemove: (id: string) => void }) {
  if (!props.items.length) {
    return <EmptyState title={props.emptyTitle} description={props.emptyDescription} />;
  }
  return <View style={styles.gridWrap}>{props.items.map((item) => <View key={item.id} style={styles.mediaCard}><Image source={{ uri: item.uri }} style={styles.mediaImage} /><View style={styles.mediaFooter}><Text style={styles.mediaType}>{props.type === "photo" ? "Фото" : "Видео"}</Text><Pressable onPress={() => props.onRemove(item.id)}><Text style={styles.removeText}>Remove</Text></Pressable></View></View>)}<Pressable style={styles.addMediaCard} onPress={props.onAdd}><Plus size={18} color={TEXT} /><Text style={styles.addMediaText}>Add</Text></Pressable></View>;
}

function PrimaryAction(props: { label: string; disabled?: boolean; onPress: () => void }) {
  return <Pressable style={[styles.primaryActionShell, props.disabled && styles.buttonDisabled]} disabled={props.disabled} onPress={props.onPress}><LinearGradient colors={[BLUE, BLUE_2]} style={styles.createEntryButtonGradient}><Plus size={18} color="#FFFFFF" /><Text style={styles.createEntryButtonText}>{props.label}</Text></LinearGradient></Pressable>;
}

function timelineColor(kind: ChannelHistoryEntry["kind"]) {
  switch (kind) {
    case "identity":
      return { backgroundColor: BLUE };
    case "publication":
      return { backgroundColor: MINT };
    case "media":
      return { backgroundColor: GOLD };
    default:
      return { backgroundColor: PINK };
  }
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safeArea: { flex: 1 },
  loadingWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  loadingText: { color: TEXT, fontSize: 16 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  backButton: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: CARD_BORDER },
  headerTextWrap: { flex: 1, marginLeft: 12 },
  headerEyebrow: { color: MUTED, fontSize: 11, letterSpacing: 1.5 },
  headerTitle: { color: TEXT, fontSize: 20, fontWeight: "800" },
  headerBadge: { backgroundColor: "rgba(255,255,255,0.08)", borderColor: CARD_BORDER, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 14 },
  headerBadgeText: { color: TEXT, fontSize: 12, fontWeight: "700" },
  content: { padding: 16, gap: 14 },
  sectionCard: { backgroundColor: CARD, borderColor: CARD_BORDER, borderWidth: 1, borderRadius: 22, padding: 16, gap: 12 },
  sectionTitle: { color: TEXT, fontSize: 17, fontWeight: "800" },
  sectionSubtitle: { color: MUTED, fontSize: 13, lineHeight: 18 },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  rowStart: { flexDirection: "row", alignItems: "center" },
  flex1: { flex: 1 },
  smallButton: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: BLUE, borderRadius: 14 },
  smallButtonText: { color: "#fff", fontWeight: "700" },
  gridWrap: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  shelfItem: { flexDirection: "row", alignItems: "center", backgroundColor: CARD_STRONG, borderRadius: 18, borderWidth: 1, borderColor: CARD_BORDER, padding: 12, gap: 10 },
  shelfItemActive: { borderColor: BLUE },
  shelfAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.10)", alignItems: "center", justifyContent: "center" },
  shelfAvatarText: { color: TEXT, fontWeight: "800" },
  shelfTitle: { color: TEXT, fontSize: 14, fontWeight: "700" },
  shelfSubtitle: { color: MUTED, fontSize: 12 },
  heroCard: { backgroundColor: CARD_STRONG, borderColor: CARD_BORDER, borderWidth: 1, borderRadius: 24, overflow: "hidden", paddingBottom: 16 },
  heroCoverWrap: { height: 180, position: "relative" },
  heroCoverImage: { width: "100%", height: "100%" },
  heroCoverFallback: { width: "100%", height: "100%" },
  coverAction: { position: "absolute", right: 12, bottom: 12, flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(0,0,0,0.35)", paddingHorizontal: 10, paddingVertical: 8, borderRadius: 12 },
  coverActionText: { color: "#fff", fontWeight: "700" },
  heroMainRow: { flexDirection: "row", gap: 14, paddingHorizontal: 16, marginTop: -28 },
  avatarWrap: { position: "relative" },
  avatarRing: { width: 88, height: 88, borderRadius: 44, padding: 3, alignItems: "center", justifyContent: "center" },
  avatarImage: { width: 82, height: 82, borderRadius: 41 },
  avatarFallback: { width: 82, height: 82, borderRadius: 41, backgroundColor: "rgba(12,20,38,0.95)", alignItems: "center", justifyContent: "center" },
  avatarText: { color: TEXT, fontSize: 28, fontWeight: "900" },
  avatarAction: { position: "absolute", right: -2, bottom: -2, width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: BLUE_2 },
  heroTitle: { color: TEXT, fontSize: 22, fontWeight: "900", marginTop: 20 },
  heroSubtitle: { color: MUTED, fontSize: 14, marginTop: 2 },
  heroDescription: { color: MUTED, fontSize: 13, lineHeight: 18, marginTop: 8 },
  heroChip: { padding: 12, borderWidth: 1, borderRadius: 16 },
  heroChipValue: { color: TEXT, fontSize: 18, fontWeight: "900" },
  heroChipLabel: { color: MUTED, fontSize: 12, marginTop: 4 },
  tabsRow: { paddingVertical: 4, gap: 10 },
  tabButton: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: CARD_BORDER },
  tabButtonActive: { backgroundColor: BLUE },
  tabButtonText: { color: TEXT, fontWeight: "700" },
  tabButtonTextActive: { color: "#fff" },
  inputWrap: { gap: 8 },
  inputLabel: { color: TEXT, fontSize: 13, fontWeight: "700" },
  inputShell: { minHeight: 52, borderRadius: 16, borderWidth: 1, borderColor: CARD_BORDER, backgroundColor: "rgba(255,255,255,0.06)", paddingHorizontal: 12, flexDirection: "row", alignItems: "center" },
  inputShellMultiline: { alignItems: "flex-start", paddingVertical: 12 },
  inputPrefix: { color: MUTED, marginRight: 6 },
  input: { flex: 1, color: TEXT, fontSize: 14, paddingVertical: 0 },
  inputMultiline: { minHeight: 88, textAlignVertical: "top" },
  formGrid: { flexDirection: "row", gap: 10 },
  infoChip: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 14, borderWidth: 1, borderColor: CARD_BORDER, paddingHorizontal: 12, paddingVertical: 10 },
  infoChipText: { color: MUTED, fontSize: 12, flex: 1 },
  emptyWrap: { paddingVertical: 20, alignItems: "center", justifyContent: "center" },
  emptyTitle: { color: TEXT, fontSize: 15, fontWeight: "700", textAlign: "center" },
  emptyDescription: { color: MUTED, fontSize: 13, textAlign: "center", marginTop: 6 },
  iconBubble: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.08)", marginRight: 10 },
  quickActionCard: { backgroundColor: CARD, borderColor: CARD_BORDER, borderWidth: 1, borderRadius: 18, padding: 14, minHeight: 120 },
  quickTitle: { color: TEXT, fontSize: 14, fontWeight: "800", marginTop: 10 },
  quickSubtitle: { color: MUTED, fontSize: 12, lineHeight: 16, marginTop: 6 },
  statCardWrap: { borderRadius: 18, padding: 1 },
  statCardInner: { borderRadius: 17, backgroundColor: "rgba(7,12,24,0.94)", padding: 14 },
  statCardValue: { color: TEXT, fontSize: 20, fontWeight: "900" },
  statCardLabel: { color: MUTED, fontSize: 12, marginTop: 4 },
  readOnlyCard: { backgroundColor: CARD, borderWidth: 1, borderColor: CARD_BORDER, borderRadius: 18, padding: 14, gap: 8 },
  readOnlyTitle: { color: TEXT, fontSize: 14, fontWeight: "800", marginLeft: 8 },
  readOnlyValue: { color: TEXT, fontSize: 24, fontWeight: "900" },
  readOnlySubtitle: { color: MUTED, fontSize: 12, lineHeight: 16 },
  inlineButton: { backgroundColor: CARD, borderWidth: 1, borderColor: CARD_BORDER, borderRadius: 18, padding: 14 },
  inlineActionIcon: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.08)", marginRight: 10 },
  inlineActionTitle: { color: TEXT, fontSize: 14, fontWeight: "800" },
  inlineActionValue: { color: MUTED, fontSize: 12, marginTop: 3 },
  mediaCard: { width: 150, backgroundColor: CARD, borderWidth: 1, borderColor: CARD_BORDER, borderRadius: 16, overflow: "hidden" },
  mediaImage: { width: "100%", height: 130 },
  mediaFooter: { padding: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  mediaType: { color: TEXT, fontSize: 12, fontWeight: "700" },
  removeText: { color: PINK, fontSize: 12, fontWeight: "800" },
  addMediaCard: { width: 150, height: 178, borderRadius: 16, borderWidth: 1, borderStyle: "dashed", borderColor: CARD_BORDER, alignItems: "center", justifyContent: "center", gap: 8 },
  addMediaText: { color: TEXT, fontWeight: "700" },
  focusCard: { backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: CARD_BORDER, borderRadius: 16, padding: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 4 },
  focusCardTitle: { color: TEXT, fontSize: 14, fontWeight: "800" },
  focusCardSubtitle: { color: MUTED, fontSize: 12, marginTop: 4, maxWidth: 250 },
  focusCardArrow: { color: TEXT, fontSize: 18, fontWeight: "900" },
  toggleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 16, borderWidth: 1, borderColor: CARD_BORDER, padding: 12 },
  toggleTitle: { color: TEXT, fontSize: 14, fontWeight: "800" },
  toggleSubtitle: { color: MUTED, fontSize: 12, lineHeight: 16, marginTop: 2 },
  chipsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  timelineWrap: { gap: 0 },
  timelineItem: { flexDirection: "row", alignItems: "center", paddingVertical: 12 },
  timelineDivider: { borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.06)" },
  timelineDotWrap: { width: 24, alignItems: "center" },
  timelineDot: { width: 10, height: 10, borderRadius: 5 },
  timelineTitle: { color: TEXT, fontSize: 14, fontWeight: "700" },
  timelineSubtitle: { color: MUTED, fontSize: 12, marginTop: 2 },
  timelineTime: { color: MUTED, fontSize: 12, marginLeft: 10 },
  bottomBar: { position: "absolute", left: 0, right: 0, bottom: 0, padding: 16, backgroundColor: "rgba(8,12,22,0.94)", borderTopWidth: 1, borderTopColor: CARD_BORDER },
  bottomActionsRow: { flexDirection: "row", gap: 10 },
  secondaryButton: { minWidth: 110, borderRadius: 16, borderWidth: 1, borderColor: CARD_BORDER, alignItems: "center", justifyContent: "center", paddingHorizontal: 16, paddingVertical: 14, backgroundColor: "rgba(255,255,255,0.06)" },
  secondaryButtonText: { color: TEXT, fontWeight: "800" },
  primaryButton: { borderRadius: 16, overflow: "hidden" },
  primaryButtonGradient: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingHorizontal: 16, paddingVertical: 14 },
  primaryButtonText: { color: "#fff", fontWeight: "800" },
  createEntryButtonGradient: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingHorizontal: 16, paddingVertical: 14, borderRadius: 16 },
  createEntryButtonText: { color: "#fff", fontWeight: "800" },
  primaryActionShell: { borderRadius: 16, overflow: "hidden" },
  buttonDisabled: { opacity: 0.55 },
});
