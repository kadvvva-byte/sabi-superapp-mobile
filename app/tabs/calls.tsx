import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  BadgeCheck,
  Grid2x2,
  Phone,
  PhoneCall,
  PhoneMissed,
  Search,
  X,
} from "lucide-react-native";

import { useI18n } from "../../src/shared/i18n";
import { messengerKernelFacade, type MessengerKernelRoomSnapshot } from "../../src/core/kernel/messenger/facade";
import { hydrateGroupPublicProfile } from "../../src/modules/messenger/groups/groupPublicProfileRuntime";
import {
  hydratePublicProfileStorage,
  resolvePublicProfileAvatarUri,
  subscribePublicProfiles,
} from "../../src/modules/messenger/public/publicProfileRuntime";
import {
  getMessengerThemePalette,
  getMessengerThemeState,
  hydrateMessengerThemeState,
  type MessengerThemePalette,
  type MessengerThemeState,
} from "../../src/modules/messenger/theme/messengerThemeRuntime";
import {
  hydrateMessengerCallEvents,
  recordMessengerCallRealtimeEvent,
  subscribeMessengerCallEvents,
  type MessengerCallHistoryItem,
} from "../../src/modules/calls/callEventsRuntime";
import {
  getAuthSessionState,
  subscribeAuthSessionState,
} from "../../src/core/kernel/auth/session.store";

type CallType = "voice" | "video";
type CallDirection = "incoming" | "outgoing" | "missed";
type FilterKey = "all" | "missed" | "voice";

type CallItem = {
  id: string;
  name: string;
  time: string;
  dateLabel: string;
  duration: string;
  type: CallType;
  direction: CallDirection;
  unread?: boolean;
  verified?: boolean;
  online?: boolean;
  avatarUrl?: string;
  createdAt?: string;
  chatId?: string;
  callId?: string;
  peerUserId?: string;
};

type IncomingCallEvent = Partial<{
  id: string;
  name: string;
  title: string;
  time: string;
  duration: string;
  type: string;
  kind: string;
  callKind: string;
  callType: string;
  mediaKind: string;
  callMediaKind: string;
  direction: string;
  status: string;
  verified: boolean;
  online: boolean;
  unread: boolean;
  createdAt: string;
  avatarUrl: string;
  avatarUri: string;
  photoUrl: string;
  chatId: string;
  callId: string;
  peerUserId: string;
  userId: string;
  fromUserId: string;
  targetUserId: string;
}>;

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

  const rgbaMatch = value.match(/^rgba\(\s*(\d+),\s*(\d+),\s*(\d+),\s*([0-9.]+)\s*\)$/i);
  if (rgbaMatch) {
    return `rgba(${rgbaMatch[1]}, ${rgbaMatch[2]}, ${rgbaMatch[3]}, ${safeAlpha})`;
  }

  return value;
}

function formatTimeLabel(dateInput?: string, locale?: string) {
  const date = dateInput ? new Date(dateInput) : new Date();
  if (Number.isNaN(date.getTime())) return "";

  try {
    return new Intl.DateTimeFormat(locale || undefined, {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    const hh = `${date.getHours()}`.padStart(2, "0");
    const mm = `${date.getMinutes()}`.padStart(2, "0");
    return `${hh}:${mm}`;
  }
}

function formatDateLabel(
  dateInput: string | undefined,
  fallbackToday: string,
  fallbackYesterday: string,
  locale?: string,
) {
  const date = dateInput ? new Date(dateInput) : new Date();
  if (Number.isNaN(date.getTime())) return fallbackToday;

  const dayKey = (value: Date) =>
    [value.getFullYear(), value.getMonth(), value.getDate()].join("-");

  const now = new Date();
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  const inputDay = dayKey(date);
  const nowDay = dayKey(now);

  if (inputDay === nowDay) return fallbackToday;

  // Calls can arrive from backend as UTC timestamps while the UI clock is shown in the
  // device locale. If the call is very recent, the calls list must not mark it as
  // yesterday just because of a timezone/day-boundary mismatch.
  const ageMs = now.getTime() - date.getTime();
  if (ageMs >= -5 * 60 * 1000 && ageMs < 24 * 60 * 60 * 1000) {
    return fallbackToday;
  }

  if (inputDay === dayKey(yesterday)) return fallbackYesterday;

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.floor(
    (startOfToday.getTime() - startOfDate.getTime()) / 86400000,
  );

  try {
    if (diffDays >= 0 && diffDays < 7) {
      return date.toLocaleDateString(locale || undefined, { weekday: "short" });
    }
    return date.toLocaleDateString(locale || undefined, {
      day: "2-digit",
      month: "short",
    });
  } catch {
    if (diffDays >= 0 && diffDays < 7) return date.toDateString().slice(0, 3);
    return date.toDateString().slice(4, 10);
  }
}

const CALL_TYPE_FIELD_NAMES = new Set([
  "type",
  "kind",
  "calltype",
  "callkind",
  "mediakind",
  "callmediakind",
  "mediatype",
  "callmode",
  "mode",
  "routekind",
  "routetype",
  "routepath",
  "pathname",
  "path",
  "screen",
  "href",
  "url",
]);

function collectCallTypeCandidates(
  value: unknown,
  output: unknown[] = [],
  depth = 0,
  seen = new Set<object>(),
): unknown[] {
  if (depth > 5 || value == null) return output;

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    const raw = String(value).toLowerCase();
    if (raw.includes("/calls/video") || raw.includes("calls/video") || raw.includes("video_call") || raw.includes("video-call")) {
      output.push(value);
    }
    if (raw.includes("/calls/audio") || raw.includes("calls/audio") || raw.includes("audio_call") || raw.includes("audio-call")) {
      output.push(value);
    }
    return output;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => collectCallTypeCandidates(item, output, depth + 1, seen));
    return output;
  }

  if (typeof value !== "object") return output;
  if (seen.has(value)) return output;
  seen.add(value);

  Object.entries(value as Record<string, unknown>).forEach(([key, nested]) => {
    const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (CALL_TYPE_FIELD_NAMES.has(normalizedKey)) {
      output.push(nested);
    }
    collectCallTypeCandidates(nested, output, depth + 1, seen);
  });

  return output;
}

function normalizeCallType(...values: unknown[]): CallType {
  const directValues = values
    .flatMap((value) => Array.isArray(value) ? value : [value])
    .map((value) => String(value ?? "").trim().toLowerCase())
    .filter(Boolean);

  for (const value of directValues) {
    if (value === "audio" || value === "voice" || value === "audio-call" || value === "audio_call") return "voice";
    if (value === "video" || value === "video-call" || value === "video_call") return "video";
    if (value.includes("/calls/audio") || value.includes("calls/audio")) return "voice";
    if (value.includes("/calls/video") || value.includes("calls/video")) return "video";
  }

  const candidates: unknown[] = [];

  values.forEach((value) => {
    if (Array.isArray(value)) {
      value.forEach((item) => collectCallTypeCandidates(item, candidates));
    } else {
      collectCallTypeCandidates(value, candidates);
    }
  });

  const nestedValues = candidates
    .flatMap((value) => Array.isArray(value) ? value : [value])
    .map((value) => String(value ?? "").trim().toLowerCase())
    .filter(Boolean);

  for (const value of nestedValues) {
    if (value === "audio" || value === "voice" || value === "audio-call" || value === "audio_call") return "voice";
    if (value === "video" || value === "video-call" || value === "video_call") return "video";
    if (value.includes("/calls/audio") || value.includes("calls/audio")) return "voice";
    if (value.includes("/calls/video") || value.includes("calls/video")) return "video";
  }

  const raw = nestedValues.join(" ");
  if (raw.includes("audio") || raw.includes("voice")) return "voice";
  if (raw.includes("video")) return "video";

  return "voice";
}

function extractPeerFromCallRouteId(value: unknown, currentUserId?: string) {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  const parts = raw.split(":").filter(Boolean);

  if (parts[0] === "call" && parts.length >= 5) {
    const from = parts[2] || "";
    const to = parts[3] || "";
    if (from && from !== currentUserId) return from;
    if (to && to !== currentUserId) return to;
  }

  if (parts[0] === "direct" && parts.length >= 3) {
    const peer = parts.slice(1).find((part) => part && part !== currentUserId);
    return peer || "";
  }

  return "";
}

function normalizeDirection(value?: string, status?: string): CallDirection {
  const normalized = String(value).toLowerCase();
  const normalizedStatus = String(status).toLowerCase();

  if (normalized === "missed" || normalizedStatus === "missed") return "missed";
  if (normalized === "outgoing") return "outgoing";
  return "incoming";
}

function normalizeSearchValue(value?: string | null) {
  return String(value ?? "").trim().toLowerCase();
}

function resolveAvatarLetter(name?: string | null) {
  const raw = String(name ?? "")
    .trim()
    .replace(/^\+/, "");
  const hit = raw.match(/[\p{L}\p{N}]/u);
  return String(hit?.[0] || raw[0] || "S").toUpperCase();
}

function getAvatarUriFromUnknownProfile(value: unknown) {
  if (!value || typeof value !== "object") return "";
  const record = value as Record<string, unknown>;
  const candidates = [record.avatarUri, record.avatarUrl, record.photoUrl, record.imageUri];

  for (const item of candidates) {
    if (typeof item === "string" && item.trim()) return item.trim();
  }

  return "";
}

function buildCallDedupKey(item: CallItem) {
  const callId = String(item.callId || "").trim();
  if (callId) return `call:${callId}`;

  const id = String(item.id || "").trim();
  if (id) return `id:${id}`;

  return [
    String(item.peerUserId || "").trim(),
    String(item.createdAt || item.time || "").trim(),
    String(item.direction || "").trim(),
    String(item.type || "").trim(),
    normalizeSearchValue(item.name),
  ].join("|");
}

function mergeCallItems(existing: CallItem, next: CallItem): CallItem {
  const resolvedType: CallType = next.type || existing.type;
  return {
    ...existing,
    ...next,
    type: resolvedType,
    peerUserId: next.peerUserId || existing.peerUserId,
    callId: next.callId || existing.callId,
    chatId: next.chatId || existing.chatId,
    avatarUrl: next.avatarUrl || existing.avatarUrl,
  };
}

function dedupeCallItems(items: CallItem[]) {
  const byKey = new Map<string, CallItem>();
  const order: string[] = [];

  items.forEach((item) => {
    const key = buildCallDedupKey(item);
    const existing = byKey.get(key);
    if (existing) {
      byKey.set(key, mergeCallItems(existing, item));
      return;
    }

    byKey.set(key, item);
    order.push(key);
  });

  return order.map((key) => byKey.get(key)).filter((item): item is CallItem => Boolean(item));
}

function buildCallRenderKey(item: CallItem, index: number) {
  const base = buildCallDedupKey(item) || `call-${index}`;
  return `${base}|row-${index}`;
}

function getCallPresenceLookupId(item: Pick<CallItem, "peerUserId" | "chatId" | "callId" | "id">) {
  return (
    String(item.peerUserId ?? "").trim() ||
    extractPeerFromCallRouteId(item.callId, undefined) ||
    String(item.chatId ?? "").trim() ||
    String(item.id ?? "").trim()
  );
}

function resolveDirectCallPeerId(item: Pick<CallItem, "peerUserId" | "chatId" | "callId" | "id">, currentUserId?: string) {
  const direct = String(item.peerUserId || "").trim();
  if (direct && direct !== currentUserId) return direct;

  const callRoutePeer = extractPeerFromCallRouteId(item.callId, currentUserId);
  if (callRoutePeer) return callRoutePeer;

  const candidates = [String(item.chatId || ""), String(item.id || "")];
  for (const value of candidates) {
    const parts = value.split(":").filter(Boolean);
    if (parts[0] === "call" && parts.length >= 6) {
      const from = parts[2] || "";
      const to = parts[3] || "";
      if (from && currentUserId && from !== currentUserId) return from;
      if (to && currentUserId && to !== currentUserId) return to;
    }
    if (parts[0] === "direct" && parts.length >= 3) {
      const users = parts.slice(1).filter((part) => part && part !== currentUserId);
      if (users[0]) return users[0];
    }
  }

  return "";
}

function buildDirectCallId(chatId: string, userId: string, peerId: string) {
  const safeChatId = String(chatId || "direct").replace(/:/g, "_");
  return ["call", safeChatId, userId, peerId, Date.now(), Math.random().toString(36).slice(2, 10)].join(":");
}

function isCallPeerOnline(item: Pick<CallItem, "peerUserId" | "chatId" | "callId" | "id" | "online">) {
  if (item.online) return true;
  const userId = getCallPresenceLookupId(item);
  return userId ? messengerKernelFacade.selectors.isUserOnline(userId) : false;
}

type CallAvatarLookup = {
  byId: Record<string, string>;
  byName: Record<string, string>;
};

async function buildCallAvatarLookup(): Promise<CallAvatarLookup> {
  const [rooms, privateProfiles] = await Promise.all([
    messengerKernelFacade.listRoomSnapshots(),
    messengerKernelFacade.listRoomProfiles(),
  ]);

  const byId: Record<string, string> = {};
  const byName: Record<string, string> = {};

  (rooms as any[]).forEach((room) => {
    const roomId = String(room.chatId ?? "").trim();
    const roomName = String(room.name ?? "").trim();
    const privateProfileAvatar = getAvatarUriFromUnknownProfile(
      roomId ? (privateProfiles as Record<string, unknown>)[roomId] : undefined,
    );
    const groupAvatar =
      room.roomType === "group"
        ? (() => {
            const shared = hydrateGroupPublicProfile(roomId);
            return typeof shared?.avatarUri === "string" && shared.avatarUri.trim()
              ? shared.avatarUri.trim()
              : "";
          })()
        : "";
    const publicAvatar =
      room.roomType === "channel" || room.roomType === "business" || room.roomType === "direct"
        ? resolvePublicProfileAvatarUri([
            room.peerUserId,
            room.peerId,
            room.participantId,
            roomId,
            room.phone,
            room.username,
            room.subtitle,
            roomName,
          ])
        : "";

    const avatarUrl = privateProfileAvatar || groupAvatar || publicAvatar;
    if (!avatarUrl) return;

    if (roomId) byId[roomId] = avatarUrl;
    if (roomName) byName[normalizeSearchValue(roomName)] = avatarUrl;
  });

  return { byId, byName };
}

function mapEventToCallItem(
  event: IncomingCallEvent,
  todayLabel: string,
  yesterdayLabel: string,
  locale?: string,
  avatarFallback?: string,
): CallItem | null {
  const id = String(event.id ?? "").trim();
  if (!id) return null;

  const createdAt = typeof event.createdAt === "string" ? event.createdAt : undefined;

  return {
    id,
    name: String(event.name || event.title || "").trim() || "Sabi",
    time: event.time || formatTimeLabel(createdAt, locale),
    dateLabel: formatDateLabel(createdAt, todayLabel, yesterdayLabel, locale),
    duration: String(event.duration || "—"),
    type: normalizeCallType(event.kind, event.callKind, event.callType, event.mediaKind, event.callMediaKind, event.type, event),
    direction: normalizeDirection(event.direction, event.status),
    verified: Boolean(event.verified),
    online: Boolean(event.online),
    unread: Boolean(event.unread),
    avatarUrl: getAvatarUriFromUnknownProfile(event) || avatarFallback || "",
    createdAt,
    chatId: String(event.chatId || "").trim() || undefined,
    callId: String(event.callId || event.id || "").trim() || undefined,
    peerUserId:
      String(event.peerUserId || event.targetUserId || event.fromUserId || event.userId || "").trim() ||
      undefined,
  };
}

function mapHistoryItemToCallItem(
  item: MessengerCallHistoryItem,
  todayLabel: string,
  yesterdayLabel: string,
  locale?: string,
  avatarFallback?: string,
): CallItem {
  const createdAt = item.endedAt || item.answeredAt || item.startedAt || new Date().toISOString();
  const id =
    String(item.id ?? item.callId ?? item.chatId ?? item.peerId ?? "").trim() ||
    `call:${String(item.userId ?? "unknown")}:${createdAt}`;

  return {
    id,
    name: item.counterpartyName || "Sabi",
    time: formatTimeLabel(createdAt, locale),
    dateLabel: formatDateLabel(createdAt, todayLabel, yesterdayLabel, locale),
    duration: item.durationLabel || (item.durationSeconds ? `${item.durationSeconds}s` : "—"),
    type: item.kind === "video" ? "video" : "voice",
    direction: item.direction,
    verified: Boolean(item.verified),
    online: false,
    unread: Boolean(item.unread),
    avatarUrl: item.avatarUrl || avatarFallback || "",
    createdAt,
    chatId: item.chatId || undefined,
    callId: item.callId || undefined,
    peerUserId: item.peerId || extractPeerFromCallRouteId(item.callId, item.userId || undefined) || undefined,
  };
}


function useEnterAnimation(delay = 0) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  const scale = useRef(new Animated.Value(0.985)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 420,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 480,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        delay,
        speed: 14,
        bounciness: 5,
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay, opacity, scale, translateY]);

  return {
    opacity,
    transform: [{ translateY }, { scale }],
  } as any;
}

function useFabAnimation() {
  const loop = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(loop, {
          toValue: 1,
          duration: 1700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(loop, {
          toValue: 0,
          duration: 1700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();
    return () => animation.stop();
  }, [loop]);

  return {
    fabAnimatedStyle: {
      transform: [
        {
          translateY: loop.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -6],
          }),
        },
        {
          scale: loop.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 1.045],
          }),
        },
      ],
    } as any,
    haloAnimatedStyle: {
      opacity: loop.interpolate({
        inputRange: [0, 1],
        outputRange: [0.18, 0.34],
      }),
      transform: [
        {
          scale: loop.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 1.18],
          }),
        },
      ],
    } as any,
  };
}

function getDirectionIcon(direction: CallDirection) {
  switch (direction) {
    case "incoming":
      return ArrowDownLeft;
    case "outgoing":
      return ArrowUpRight;
    case "missed":
      return X;
    default:
      return ArrowDownLeft;
  }
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

export default function CallsScreen() {
  const params = useLocalSearchParams<{ userId?: string }>();
  const { language, t } = useI18n();

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [calls, setCalls] = useState<CallItem[]>([]);
  const [themeState, setThemeState] = useState<MessengerThemeState>(getMessengerThemeState());
  const avatarLookupRef = useRef<CallAvatarLookup>({ byId: {}, byName: {} });
  const invalidRouteWarnedRef = useRef<Set<string>>(new Set());

  const palette = useMemo<MessengerThemePalette>(
    () => getMessengerThemePalette(themeState.themeId),
    [themeState.themeId],
  );

  const hasWallpaper = Boolean(themeState.wallpaperUri);

  const cardColors: [string, string] = hasWallpaper
    ? [
        withAlpha(palette.background[0] || "#0A0F18", 0.34),
        withAlpha(palette.background[1] || "#0A0F18", 0.22),
      ]
    : palette.surface;

  const raisedColors: [string, string] = hasWallpaper
    ? [withAlpha(palette.textMain, 0.08), withAlpha(palette.textMain, 0.03)]
    : palette.surfaceRaised;

  const panelColors: [string, string] = hasWallpaper
    ? [
        withAlpha(palette.background[0] || "#0A0F18", 0.76),
        withAlpha(palette.background[1] || "#0A0F18", 0.64),
      ]
    : palette.surfaceRaised;

  const flatGlassBorder = hasWallpaper
    ? withAlpha(palette.textMain, 0.10)
    : withAlpha(palette.textMain, 0.12);

  const softGlassColor = hasWallpaper
    ? withAlpha(palette.textMain, 0.04)
    : withAlpha(palette.textMain, 0.05);

  const accentSoftBg = withAlpha(palette.accent, hasWallpaper ? 0.14 : 0.18);
  const accentBorder = withAlpha(palette.accentAlt, hasWallpaper ? 0.18 : 0.26);

  const txAny = useCallback(
    (keys: string[], fallback: string) => {
      for (const key of keys) {
        const value = t(key);
        if (typeof value === "string" && value.trim() && value !== key) {
          return value;
        }
      }
      return fallback;
    },
    [t],
  );

  const texts = useMemo(
    () => ({
      title: txAny(["calls.title", "messenger.calls"], "Calls"),
      eyebrow: txAny(["calls.callHistory", "common.history"], "Call history"),
      searchPlaceholder: txAny(
        ["search.placeholder"],
        "Search calls and contacts",
      ),
      recentCalls: txAny(["calls.callHistory", "common.history"], "Recent calls"),
      noCallsTitle: txAny(["calls.noCalls"], "No calls yet"),
      noCallsSubtitle: txAny(["common.empty"], "Nothing here yet"),
      all: txAny(["common.all"], "All"),
      missed: txAny(["calls.missedCall"], "Missed"),
      video: txAny(["calls.videoCall", "messenger.videoCall"], "Video"),
      voice: txAny(["calls.voiceCall", "messenger.audioCall"], "Voice"),
      today: txAny(["common.today"], "Today"),
      yesterday: txAny(["common.yesterday"], "Yesterday"),
      live: txAny(["common.online", "messenger.online"], "Online"),
      contacts: txAny(["contacts.title", "messenger.contacts"], "Contacts"),
      durationFallback: txAny(["common.more"], "No answer"),
    }),
    [txAny],
  );

  const filters = useMemo(
    () => [
      { key: "all" as const, label: texts.all },
      { key: "missed" as const, label: texts.missed },
      { key: "voice" as const, label: texts.voice },
    ],
    [texts],
  );

  const searchAnim = useEnterAnimation(0);
  const listAnim = useEnterAnimation(80);
  const { fabAnimatedStyle, haloAnimatedStyle } = useFabAnimation();

  const loadAvatarLookup = useCallback(async () => {
    await hydratePublicProfileStorage();
    const lookup = await buildCallAvatarLookup();
    avatarLookupRef.current = lookup;
    setCalls((current) =>
      current.map((item) => {
        if (item.avatarUrl) return item;
        const fallback =
          lookup.byId[item.id] || lookup.byName[normalizeSearchValue(item.name)] || "";
        return fallback ? { ...item, avatarUrl: fallback } : item;
      }),
    );
  }, []);

  useEffect(() => {
    const unsubscribe = subscribePublicProfiles(() => {
      void loadAvatarLookup();
    });

    return unsubscribe;
  }, [loadAvatarLookup]);

  const applyCallHistory = useCallback(
    (history: MessengerCallHistoryItem[]) => {
      const lookup = avatarLookupRef.current;
      setCalls(
        history.map((item) => {
          const fallback =
            lookup.byId[item.chatId || ""] ||
            lookup.byId[item.peerId || ""] ||
            lookup.byName[normalizeSearchValue(item.counterpartyName)] ||
            "";
          return mapHistoryItemToCallItem(
            item,
            texts.today,
            texts.yesterday,
            language,
            fallback,
          );
        }),
      );
    },
    [language, texts.today, texts.yesterday],
  );

  useEffect(() => {
    const unsubscribe = subscribeMessengerCallEvents(applyCallHistory);
    void hydrateMessengerCallEvents().then(applyCallHistory);
    return () => {
      unsubscribe();
    };
  }, [applyCallHistory]);

  useFocusEffect(
    useCallback(() => {
      void hydrateMessengerThemeState().then((next) => setThemeState(next));
      void loadAvatarLookup();
      void hydrateMessengerCallEvents().then(applyCallHistory);
    }, [applyCallHistory, loadAvatarLookup]),
  );

  const missedCount = useMemo(
    () => calls.filter((item) => item.direction === "missed").length,
    [calls],
  );

  const filteredCalls = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return dedupeCallItems(calls)
      .map((item) => ({ ...item, online: isCallPeerOnline(item) }))
      .filter((item) => {
        const matchesQuery =
          normalized.length === 0 ||
          item.name.toLowerCase().includes(normalized) ||
          item.dateLabel.toLowerCase().includes(normalized);

        if (!matchesQuery) return false;

        switch (filter) {
          case "missed":
            return item.direction === "missed";
          case "voice":
            return item.type === "voice";
          default:
            return true;
        }
      })
      .sort((a, b) => {
        const aTime = new Date(a.createdAt || 0).getTime();
        const bTime = new Date(b.createdAt || 0).getTime();
        return bTime - aTime;
      });
  }, [calls, filter, query]);

  const [authUserId, setAuthUserId] = useState(() =>
    String(getAuthSessionState().currentUserId || "").trim(),
  );

  useEffect(() => {
    setAuthUserId(String(getAuthSessionState().currentUserId || "").trim());

    return subscribeAuthSessionState((state) => {
      setAuthUserId(String(state.currentUserId || "").trim());
    });
  }, []);

  const userId =
    typeof params.userId === "string" && params.userId.trim()
      ? params.userId.trim()
      : authUserId || undefined;

  const realtimeChannel = userId
    ? `messenger:calls:${userId}`
    : "messenger:calls:public";

  const handleRealtimeEvent = useCallback(
    (eventName: string, payload: unknown) => {
      void recordMessengerCallRealtimeEvent(eventName, payload, {
        currentUserId: userId || null,
      }).catch(() => undefined);
    },
    [userId],
  );

  useEffect(() => {
    const unsubscribeStore = messengerKernelFacade.subscribe(() => {
      setCalls((current) => current.map((item) => ({ ...item, online: isCallPeerOnline(item) })));
    });

    const unsubscribeRealtime = messengerKernelFacade.on("realtimeEvent", (event) => {
      if (
        event.type === "custom" &&
        (event.eventName === "call:history" ||
          event.eventName === "call:ended" ||
          event.eventName === "call:missed" ||
          event.eventName === "call:connected")
      ) {
        handleRealtimeEvent(event.eventName, event.payload);
      }
    });

    return () => {
      unsubscribeRealtime();
      unsubscribeStore();
    };
  }, [handleRealtimeEvent]);

  const openCall = (item: CallItem) => {
    const peerId = resolveDirectCallPeerId(item, userId);
    const chatIdForCall = String(item.chatId || item.id || ["direct", userId || "self", peerId || "peer"].join(":")).trim();

    if (!userId || !peerId || peerId === userId) {
      const warnKey = [userId || "", peerId || "", item.callId || item.id || ""].join("|");
      if (!invalidRouteWarnedRef.current.has(warnKey)) {
        invalidRouteWarnedRef.current.add(warnKey);
        console.warn("[sabi-tabs-calls] call blocked: invalid route identity", {
          userId: userId || "",
          peerId,
          callId: item.callId || item.id || "",
        });
      }
      return;
    }

    const resolvedCallKind = item.type === "video" ? "video" : "audio";
    const callId = buildDirectCallId(chatIdForCall, userId, peerId);
    const callRouteParams = {
      id: chatIdForCall,
      chatId: chatIdForCall,
      callId,
      userId,
      selfId: userId,
      fromUserId: userId,
      peerId,
      peerUserId: peerId,
      partnerId: peerId,
      targetUserId: peerId,
      toUserId: peerId,
      receiverUserId: peerId,
      roomType: "direct",
      kind: resolvedCallKind,
      type: resolvedCallKind,
      callKind: resolvedCallKind,
      callType: resolvedCallKind,
      name: item.name,
      avatarLetter: resolveAvatarLetter(item.name),
      avatarUrl: item.avatarUrl || undefined,
      photoUrl: item.avatarUrl || undefined,
      verified: item.verified ? "1" : "0",
      status: item.online ? texts.live : item.dateLabel,
      subtitle: item.online ? texts.live : item.dateLabel,
    };

    router.push({
      pathname: resolvedCallKind === "video" ? "/calls/video" : "/calls/audio",
      params: callRouteParams,
    } as never);
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
              style={[styles.sideGlow, { backgroundColor: withAlpha(palette.accentAlt, 0.14) }]}
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
                <View style={[styles.headerButtonOuter, pressed && styles.pressedScale]}>
                  <View
                    style={[
                      styles.headerButtonShadow,
                      { backgroundColor: withAlpha(palette.background[0] || "#000", 0.22) },
                    ]}
                  />
                  <LinearGradient
                    colors={raisedColors}
                    style={[styles.headerButtonFill, { borderColor: flatGlassBorder }]}
                  >
                    <View style={[styles.headerButtonGlass, { backgroundColor: softGlassColor }]} />
                    <ArrowLeft size={20} strokeWidth={2.3} color={palette.textMain} />
                  </LinearGradient>
                </View>
              )}
            </Pressable>

            <View style={styles.headerTitleWrap}>
              <Text style={[styles.headerEyebrow, { color: withAlpha(palette.textSecondary, 0.78) }]}>
                {texts.eyebrow}
              </Text>
              <Text style={[styles.headerTitle, { color: palette.textMain }]}>{texts.title}</Text>
            </View>

            <Pressable
              style={styles.headerButtonWrap}
              onPress={() => router.push("/tabs" as never)}
            >
              {({ pressed }) => (
                <View style={[styles.headerButtonOuter, pressed && styles.pressedScale]}>
                  <View
                    style={[
                      styles.headerButtonShadow,
                      { backgroundColor: withAlpha(palette.background[0] || "#000", 0.22) },
                    ]}
                  />
                  <LinearGradient
                    colors={raisedColors}
                    style={[styles.headerButtonFill, { borderColor: flatGlassBorder }]}
                  >
                    <View style={[styles.headerButtonGlass, { backgroundColor: softGlassColor }]} />
                    <Grid2x2 size={19} strokeWidth={2.3} color={palette.textMain} />
                  </LinearGradient>
                </View>
              )}
            </Pressable>
          </View>

          <Animated.View style={searchAnim}>
            <View style={styles.searchCardWrap}>
              <View
                style={[
                  styles.searchShadow,
                  { backgroundColor: withAlpha(palette.background[0] || "#000", 0.22) },
                ]}
              />
              <LinearGradient
                colors={cardColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.searchCard, { borderColor: flatGlassBorder }]}
              >
                <View style={[styles.glassFill, { backgroundColor: softGlassColor }]} />
                <LinearGradient
                  colors={[withAlpha(palette.textMain, 0.10), "rgba(255,255,255,0.00)"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.shineFill}
                />

                <View
                  style={[
                    styles.searchWrap,
                    {
                      backgroundColor: softGlassColor,
                      borderColor: flatGlassBorder,
                    },
                  ]}
                >
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
                    placeholder={texts.searchPlaceholder}
                    placeholderTextColor={withAlpha(palette.textSecondary, 0.56)}
                    style={[styles.searchInput, { color: palette.textMain }]}
                  />

                  {query.length > 0 ? (
                    <Pressable onPress={() => setQuery("")} hitSlop={10}>
                      <X size={18} strokeWidth={2.4} color={withAlpha(palette.textSecondary, 0.72)} />
                    </Pressable>
                  ) : null}
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.filtersRow}
                >
                  {filters.map((item) => {
                    const active = item.key === filter;
                    return (
                      <Pressable
                        key={item.key}
                        style={({ pressed }) => [
                          styles.filterChipWrap,
                          pressed && styles.pressedScale,
                        ]}
                        onPress={() => setFilter(item.key)}
                      >
                        <LinearGradient
                          colors={active ? raisedColors : panelColors}
                          style={[
                            styles.filterChip,
                            {
                              borderColor: active ? accentBorder : flatGlassBorder,
                            },
                          ]}
                        >
                          <View
                            style={[
                              styles.filterChipGlass,
                              {
                                backgroundColor: active ? accentSoftBg : softGlassColor,
                              },
                            ]}
                          />
                          <Text
                            style={[
                              styles.filterText,
                              {
                                color: active ? palette.accentSoft : palette.textSecondary,
                              },
                            ]}
                          >
                            {item.label}
                          </Text>
                        </LinearGradient>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </LinearGradient>
            </View>
          </Animated.View>

          <Animated.View style={listAnim}>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: palette.textMain }]}>
                  {texts.recentCalls}
                </Text>
                <Text style={[styles.sectionMeta, { color: withAlpha(palette.textSecondary, 0.76) }]}>
                  {filteredCalls.length} • {missedCount}
                </Text>
              </View>

              <View style={styles.callList}>
                {filteredCalls.length === 0 ? (
                  <View style={styles.emptyCardWrap}>
                    <View
                      style={[
                        styles.emptyShadow,
                        { backgroundColor: withAlpha(palette.background[0] || "#000", 0.22) },
                      ]}
                    />
                    <LinearGradient
                      colors={cardColors}
                      style={[styles.emptyCard, { borderColor: flatGlassBorder }]}
                    >
                      <View style={[styles.glassFill, { backgroundColor: softGlassColor }]} />
                      <PhoneCall size={24} strokeWidth={2.3} color={palette.accentSoft} />
                      <Text style={[styles.emptyTitle, { color: palette.textMain }]}>
                        {texts.noCallsTitle}
                      </Text>
                      <Text style={[styles.emptySubtitle, { color: palette.textSecondary }]}>
                        {texts.noCallsSubtitle}
                      </Text>
                    </LinearGradient>
                  </View>
                ) : (
                  filteredCalls.map((call, callIndex) => {
                    const DirectionIcon = getDirectionIcon(call.direction);
                    const isMissed = call.direction === "missed";

                    return (
                      <Pressable
                        key={buildCallRenderKey(call, callIndex)}
                        onPress={() => openCall(call)}
                        style={({ pressed }) => [
                          styles.callCardWrap,
                          pressed && styles.pressedScale,
                        ]}
                      >
                        <View
                          style={[
                            styles.callCardShadow,
                            { backgroundColor: withAlpha(palette.background[0] || "#000", 0.22) },
                          ]}
                        />
                        <LinearGradient
                          colors={cardColors}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={[styles.callCard, { borderColor: flatGlassBorder }]}
                        >
                          <View style={[styles.glassFill, { backgroundColor: softGlassColor }]} />
                          <LinearGradient
                            colors={[withAlpha(palette.textMain, 0.08), "rgba(255,255,255,0.00)"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.shineFill}
                          />

                          <View style={styles.avatarWrap}>
                            <View
                              style={[
                                styles.avatarGlow,
                                { backgroundColor: withAlpha(palette.accent, 0.18) },
                              ]}
                            />
                            <View style={styles.avatar}>
                              {call.avatarUrl ? (
                                <Image
                                  source={{ uri: call.avatarUrl }}
                                  style={styles.avatarImage}
                                  resizeMode="cover"
                                />
                              ) : (
                                <LinearGradient
                                  colors={[palette.accent, palette.accentAlt, palette.accentSoft]}
                                  start={{ x: 0, y: 0 }}
                                  end={{ x: 1, y: 1 }}
                                  style={styles.avatarFallback}
                                >
                                  <Text style={styles.avatarText}>
                                    {call.name.slice(0, 1)}
                                  </Text>
                                </LinearGradient>
                              )}
                            </View>

                            {call.online ? (
                              <View
                                style={[
                                  styles.onlineDot,
                                  {
                                    backgroundColor: palette.accent,
                                    borderColor: palette.background[0] || "#0B231D",
                                  },
                                ]}
                              />
                            ) : null}
                          </View>

                          <View style={styles.callContent}>
                            <View style={styles.callTopRow}>
                              <View style={styles.nameRow}>
                                <Text style={[styles.callName, { color: palette.textMain }]} numberOfLines={1}>
                                  {call.name}
                                </Text>

                                {call.verified ? (
                                  <BadgeCheck
                                    size={15}
                                    strokeWidth={2.2}
                                    color={palette.accentSoft}
                                    style={styles.verifiedIcon}
                                  />
                                ) : null}
                              </View>

                              <Text style={[styles.callTime, { color: withAlpha(palette.textSecondary, 0.72) }]}>
                                {call.time}
                              </Text>
                            </View>

                            <View style={styles.callBottomRow}>
                              <View style={styles.callMetaRow}>
                                <View
                                  style={[
                                    styles.directionBadge,
                                    {
                                      backgroundColor: isMissed
                                        ? withAlpha("#FF5A5A", 0.14)
                                        : softGlassColor,
                                      borderColor: isMissed
                                        ? withAlpha("#FF8C8C", 0.22)
                                        : flatGlassBorder,
                                    },
                                  ]}
                                >
                                  <DirectionIcon
                                    size={12}
                                    strokeWidth={2.4}
                                    color={
                                      isMissed
                                        ? "#FFB7B7"
                                        : palette.textSecondary
                                    }
                                  />
                                </View>

                                <View
                                  style={[
                                    styles.typePill,
                                    {
                                      backgroundColor: accentSoftBg,
                                      borderColor: accentBorder,
                                    },
                                  ]}
                                >
                                  <Phone size={12} strokeWidth={2.3} color={palette.accentSoft} />
                                  <Text style={[styles.typePillText, { color: palette.accentSoft }]}>
                                    {call.type === "video" ? texts.video : texts.voice}
                                  </Text>
                                </View>

                                <Text
                                  style={[
                                    styles.durationText,
                                    {
                                      color: isMissed ? "#FFBCBC" : palette.textSecondary,
                                    },
                                  ]}
                                >
                                  {isMissed
                                    ? texts.missed
                                    : `${call.duration || texts.durationFallback} • ${call.dateLabel}`}
                                </Text>
                              </View>

                              <View style={styles.trailingActions}>
                                {call.unread ? (
                                  <View
                                    style={[
                                      styles.unreadDot,
                                      { backgroundColor: palette.accent },
                                    ]}
                                  />
                                ) : null}

                                <Pressable
                                  style={[
                                    styles.iconAction,
                                    {
                                      backgroundColor: softGlassColor,
                                      borderColor: flatGlassBorder,
                                    },
                                  ]}
                                  onPress={() => openCall(call)}
                                >
                                  {isMissed ? (
                                    <PhoneMissed size={16} strokeWidth={2.3} color={palette.accentSoft} />
                                  ) : (
                                    <Phone size={16} strokeWidth={2.3} color={palette.accentSoft} />
                                  )}
                                </Pressable>
                              </View>
                            </View>
                          </View>
                        </LinearGradient>
                      </Pressable>
                    );
                  })
                )}
              </View>
            </View>
          </Animated.View>
        </ScrollView>

        <Animated.View style={[styles.fabHaloWrap, haloAnimatedStyle]} pointerEvents="none">
          <View style={[styles.fabHalo, { backgroundColor: withAlpha(palette.accent, 0.18) }]} />
        </Animated.View>

        <Animated.View style={[styles.fabWrap, fabAnimatedStyle]}>
          <Pressable
            style={({ pressed }) => [pressed && styles.pressedScale]}
            onPress={() => router.push("/tabs/contacts" as never)}
          >
            <LinearGradient
              colors={[palette.accent, palette.accentAlt, palette.accentSoft]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.fab, { borderColor: withAlpha(palette.textMain, 0.28) }]}
            >
              <View
                style={[
                  styles.fabDepth,
                  { backgroundColor: withAlpha(palette.background[0] || "#062119", 0.40) },
                ]}
              />
              <View
                style={[
                  styles.fabInnerGlow,
                  { backgroundColor: withAlpha(palette.textMain, 0.18) },
                ]}
              />
              <LinearGradient
                colors={[withAlpha(palette.textMain, 0.30), "rgba(255,255,255,0.00)"]}
                start={{ x: 0.18, y: 0 }}
                end={{ x: 0.85, y: 1 }}
                style={styles.fabShine}
              />
              <PhoneCall
                size={22}
                strokeWidth={2.4}
                color={palette.background[0] || "#062119"}
              />
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </DecorativeBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create<any>({
  safeArea: { flex: 1 },
  background: { flex: 1 },
  textureGrid: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.04,
    backgroundColor: "transparent",
  },

  topGlow: {
    position: "absolute",
    top: -90,
    right: -30,
    width: 220,
    height: 220,
    borderRadius: 220,
  },
  sideGlow: {
    position: "absolute",
    top: 180,
    left: -90,
    width: 240,
    height: 240,
    borderRadius: 240,
  },
  bottomGlow: {
    position: "absolute",
    bottom: 60,
    right: -100,
    width: 280,
    height: 280,
    borderRadius: 280,
  },

  content: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 150 },

  header: { flexDirection: "row", alignItems: "center", marginBottom: 18 },
  headerTitleWrap: { flex: 1, paddingHorizontal: 12 },
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

  headerButtonWrap: {
    width: 44,
    height: 44,
  },
  headerButtonOuter: {
    flex: 1,
    borderRadius: 22,
  },
  headerButtonShadow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 22,
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
  headerButtonGlass: {
    ...StyleSheet.absoluteFillObject,
  },

  searchCardWrap: {
    borderRadius: 24,
    marginBottom: 8,
  },
  searchShadow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
    transform: [{ translateY: 9 }, { scaleX: 0.97 }],
  },
  searchCard: {
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    padding: 12,
  },
  glassFill: {
    ...StyleSheet.absoluteFillObject,
  },
  shineFill: {
    ...StyleSheet.absoluteFillObject,
  },
  searchWrap: {
    minHeight: 56,
    borderRadius: 18,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
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

  filtersRow: {
    gap: 10,
    paddingTop: 12,
    paddingBottom: 4,
  },
  filterChipWrap: {
    borderRadius: 999,
  },
  filterChip: {
    minHeight: 38,
    borderRadius: 999,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 1,
  },
  filterChipGlass: {
    ...StyleSheet.absoluteFillObject,
  },
  filterText: {
    fontSize: 13,
    fontWeight: "700",
  },

  section: { marginTop: 12, marginBottom: 8 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  sectionTitle: { fontSize: 20, fontWeight: "900" },
  sectionMeta: { fontSize: 13, fontWeight: "700" },

  callList: { gap: 12 },
  callCardWrap: { borderRadius: 24 },
  callCardShadow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
    transform: [{ translateY: 9 }, { scaleX: 0.96 }],
  },
  callCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 14,
    overflow: "hidden",
    borderWidth: 1,
  },

  avatarWrap: {
    width: 46,
    height: 46,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarGlow: {
    position: "absolute",
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
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
  avatarText: { color: "#F7FFFC", fontSize: 16, fontWeight: "900" },
  onlineDot: {
    position: "absolute",
    right: 2,
    bottom: 3,
    width: 10,
    height: 10,
    borderRadius: 999,
    borderWidth: 2,
  },

  callContent: { flex: 1 },
  callTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 8,
  },
  verifiedIcon: { marginLeft: 6 },
  callName: { fontSize: 17, fontWeight: "800", maxWidth: "82%" },
  callTime: { fontSize: 13, fontWeight: "600", marginLeft: 8 },

  callBottomRow: { flexDirection: "row", alignItems: "center" },
  callMetaRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    paddingRight: 10,
  },
  directionBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  typePill: {
    minHeight: 24,
    borderRadius: 999,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
  },
  typePillText: { fontSize: 12, fontWeight: "800" },
  durationText: { fontSize: 13, fontWeight: "600" },

  trailingActions: { flexDirection: "row", alignItems: "center", gap: 10 },
  unreadDot: { width: 9, height: 9, borderRadius: 999 },
  iconAction: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },

  emptyCardWrap: { borderRadius: 24 },
  emptyShadow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
    transform: [{ translateY: 9 }, { scaleX: 0.96 }],
  },
  emptyCard: {
    borderRadius: 24,
    padding: 22,
    alignItems: "center",
    overflow: "hidden",
    borderWidth: 1,
  },
  emptyTitle: { fontSize: 18, fontWeight: "900", marginTop: 12 },
  emptySubtitle: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 8,
  },

  fabHaloWrap: {
    position: "absolute",
    right: 10,
    bottom: 18,
    width: 76,
    height: 76,
    alignItems: "center",
    justifyContent: "center",
  },
  fabHalo: {
    width: 76,
    height: 76,
    borderRadius: 38,
  },
  fabWrap: {
    position: "absolute",
    right: 18,
    bottom: 28,
    borderRadius: 30,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 1,
  },
  fabDepth: {
    position: "absolute",
    left: 8,
    right: 8,
    bottom: 2,
    height: 16,
    borderRadius: 16,
  },
  fabInnerGlow: {
    position: "absolute",
    top: -10,
    right: -6,
    width: 38,
    height: 38,
    borderRadius: 38,
  },
  fabShine: { ...StyleSheet.absoluteFillObject },

  pressedScale: { transform: [{ scale: 0.986 }] },
});



