
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  BadgeCheck,
  BellOff,
  BookCheck,
  BookMarked,
  Bot,
  ChevronRight,
  Lock,
  MessageCircleMore,
  Palette,
  PanelRightClose,
  PanelRightOpen,
  Phone,
  Pin,
  Radio,
  Settings2,
  Trash2,
  Users,
  Volume2,
  VolumeX,
  X,
  type LucideIcon,
} from "lucide-react-native";
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
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getAuthSessionState } from "../../src/core/kernel/auth/session.store";
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
  subscribeMessengerCallEvents,
  type MessengerCallHistoryItem,
} from "../../src/modules/calls/callEventsRuntime";
import { useI18n } from "../../src/shared/i18n";

type QuickCardId =
  | "chats"
  | "calls"
  | "contacts"
  | "groups"
  | "bots"
  | "channels";

type QuickCard = {
  id: QuickCardId;
  route: string;
  icon: LucideIcon;
};

type RoomType = "direct" | "group" | "channel" | "business";
type ChatCategory = "official" | "service" | "direct";

type ChatItem = {
  id: string;
  name: string;
  preview: string;
  time: string;
  unread: number;
  verified?: boolean;
  official?: boolean;
  username?: string;
  phone?: string;
  avatarLetter?: string;
  avatarUrl?: string;
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
};

type PersistedUiMessage = {
  id?: string;
  text?: string;
  time?: string;
  previewTitle?: string;
  kind?: string;
};


type ChatRoomMetaSnapshot = MessengerKernelRoomSnapshot;
const QUICK_ACCESS: QuickCard[] = [
  { id: "chats", route: "/tabs/chats", icon: MessageCircleMore },
  { id: "calls", route: "/tabs/calls", icon: Phone },
  { id: "contacts", route: "/tabs/contacts", icon: Users },
  { id: "groups", route: "/tabs/groups", icon: Users },
  { id: "bots", route: "/tabs/bots", icon: Bot },
  { id: "channels", route: "/tabs/channels", icon: Radio },
];


const OFFICIAL_CHANNEL_BASE: Omit<
  ChatItem,
  "preview" | "time" | "updatedAt" | "muted" | "pinned" | "hiddenFromMain"
> = {
  id: "sabi-info",
  name: "Sabi info",
  unread: 1,
  verified: true,
  official: true,
  roomType: "channel",
  category: "official",
  avatarLetter: "S",
};

const TEXT_MAIN = "#F8FBFF";
const TEXT_SECONDARY = "rgba(236,244,255,0.76)";
const TEXT_MUTED = "rgba(214,226,244,0.56)";
const GLASS_BORDER = "rgba(255,255,255,0.10)";

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

function normalizePhone(value?: string | null) {
  return String(value ?? "").replace(/\D/g, "");
}

function formatLocalTime(language?: string) {
  try {
    return new Intl.DateTimeFormat(language || undefined, {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date());
  } catch {
    return new Intl.DateTimeFormat(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date());
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

function getAvatarLetter(name?: string | null, phone?: string | null) {
  const source = String(name ?? "").trim();
  const fromName = source.replace(/^[^\p{L}\p{N}]+/u, "").charAt(0);
  if (fromName) return fromName.toUpperCase();

  const digits = normalizePhone(phone);
  if (digits) return digits.charAt(0);
  return "•";
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

function isMessengerPeerOnline(item: { peerUserId?: string; id?: string; roomType?: string; online?: boolean }) {
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

function resolveSharedAvatarUrl(
  roomType: RoomType,
  identifiers: Array<string | null | undefined>,
): string {
  const compactIdentifiers = identifiers
    .map((value) => String(value ?? "").trim())
    .filter(Boolean);

  if (!compactIdentifiers.length) return "";

  if (roomType === "group") {
    const chatId = compactIdentifiers[0] || "";
    const shared = hydrateGroupPublicProfile(chatId);
    return typeof shared?.avatarUri === "string" ? shared.avatarUri.trim() : "";
  }

  return resolvePublicProfileAvatarUri(compactIdentifiers);
}

async function buildPersistedChatItems(
  rooms: ChatRoomMetaSnapshot[],
  language: string | undefined,
  texts: Record<string, string>,
): Promise<ChatItem[]> {
  const mapped = await Promise.all(
    rooms.map(async (room) => {
      const messages = await messengerKernelFacade.listRoomPreviewMessages(
        room.chatId,
      );
      const lastMessage = getLastVisiblePreviewMessage(messages);
      const hiddenReactionTailCount = countHiddenReactionTail(messages);
      const previewFallback =
        room.roomType === "channel"
          ? texts.channelPreview
          : room.roomType === "business"
            ? texts.businessPreview
            : texts.directPreview;

      const category: ChatCategory =
        room.roomType === "channel"
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
        unread: 0,
        hiddenReactionTailCount,
        verified: Boolean(room.verified),
        official: room.roomType === "channel",
        roomType: (room.roomType as RoomType) || "direct",
        category,
        avatarLetter: room.avatarLetter || getAvatarLetter(room.name),
        avatarUrl: resolveSharedAvatarUrl((room.roomType as RoomType) || "direct", [
          (room as { peerUserId?: string | null }).peerUserId,
          room.chatId,
          room.subtitle,
          room.name,
        ]),
        currentUserId: (room as { currentUserId?: string | null }).currentUserId || undefined,
        peerUserId: (room as { peerUserId?: string | null }).peerUserId || undefined,
        updatedAt: room.updatedAt,
        phone: room.subtitle?.startsWith("+") ? room.subtitle : undefined,
        username: room.subtitle?.startsWith("@") ? room.subtitle : undefined,
      } satisfies ChatItem;
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
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.popupItemWrap, pressed && styles.rowPressed]}
    >
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

export default function MessengerHubScreen() {
  const params = useLocalSearchParams<{ userId?: string }>();
  const { language, t } = useI18n();

  const authSession = getAuthSessionState();
  const currentUserId =
    typeof params.userId === "string" && params.userId.trim().length > 0
      ? params.userId.trim()
      : typeof authSession.currentUserId === "string" && authSession.currentUserId.trim().length > 0
        ? authSession.currentUserId.trim()
        : undefined;

  const [connected, setConnected] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [quickMenuChat, setQuickMenuChat] = useState<ChatItem | null>(null);
  const [officialPreview, setOfficialPreview] = useState("");
  const [officialTime, setOfficialTime] = useState("");
  const [officialUnread, setOfficialUnread] = useState(1);
  const [persistedChats, setPersistedChats] = useState<ChatItem[]>([]);
  const [callHistory, setCallHistory] = useState<MessengerCallHistoryItem[]>([]);
  const [themeState, setThemeState] = useState<MessengerThemeState>(
    getMessengerThemeState(),
  );

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

  const accentSoftBg = withAlpha(palette.accent, hasWallpaper ? 0.14 : 0.18);
  const accentBorder = withAlpha(palette.accentAlt, hasWallpaper ? 0.18 : 0.26);

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
      brand: "Sabi Messenger",
      eyebrow: "Sabi Messenger",
      title: txAny(["messenger.title", "common.open"], "Messenjer"),
      quickAccess: txAny(["messenger.quickAccess", "common.openAll", "common.open"], "Tezkor kirish"),
      quickAccessMeta: txAny(["messenger.quickAccessMeta", "common.more"], "Asosiy bo‘limlar"),
      chatsTitle: txAny(["messenger.chats", "tabs.chats"], "Chatlar"),
      chatsMeta: txAny(["messenger.chatsMeta", "common.history"], "So‘nggi suhbatlar"),
      officialName: txAny(["messenger.officialName"], "Sabi ma’lumotlari"),
      officialBadge: txAny(["status.verified", "common.verified"], "Tasdiqlangan"),
      officialPreview: txAny(
        ["messenger.officialPreview", "messenger.channels", "messenger.title"],
        "Sabi Messenger yangiliklari va rasmiy xabarlari.",
      ),
      officialNow: txAny(["common.now", "common.today"], "Hozir"),
      online: txAny(["status.connected", "common.online"], "Onlayn"),
      connecting: txAny(["common.connecting", "status.disconnected"], "Ulanmoqda"),
      emptyTitle: txAny(["common.empty"], "Chatlar yo‘q"),
      emptySubtitle: txAny(
        ["messenger.chat.conversationPlaceholder"],
        "Suhbat shu yerda ko‘rinadi.",
      ),
      settings: txAny(["settings.title", "common.settings"], "Sozlamalar"),
      settingsHint: txAny(["settings.chatSettings", "settings.title"], "Messenger sozlamalari"),
      privateChats: txAny(["messenger.privateChats", "messenger.chats"], "Shaxsiy chatlar"),
      themeWallpaper: txAny(["messenger.themeWallpaper", "common.theme"], "Mavzu va fon rasmi"),
      profile: txAny(["profile.title", "common.profile"], "Profil"),
      openBots: txAny(["messenger.openBots", "messenger.bots", "common.open"], "Botlarni ochish"),
      openChannels: txAny(["messenger.openChannels", "messenger.channels", "common.open"], "Kanallarni ochish"),
      titles: {
        chats: txAny(["messenger.chats"], "Chatlar"),
        calls: txAny(["messenger.calls", "calls.title"], "Qo‘ng‘iroqlar"),
        contacts: txAny(["contacts.title"], "Kontaktlar"),
        groups: txAny(["messenger.groups", "common.groups"], "Guruhlar"),
        bots: txAny(["messenger.bots"], "Botlar"),
        channels: txAny(["messenger.channels"], "Kanallar"),
      } as Record<QuickCardId, string>,
      subtitles: {
        chats: txAny(["messenger.unreadMessages", "common.history"], "Suhbatlar va tarix"),
        calls: txAny(["messenger.callsSubtitle", "calls.videoCall", "calls.voiceCall"], "Ovoz va video"),
        contacts: txAny(["messenger.contactsSubtitle", "contacts.syncContacts", "common.people"], "Odamlar va telefon kitobi"),
        groups: txAny(["messenger.groupsSubtitle", "messenger.groups", "common.groups"], "Jamoalar va shaxsiy xonalar"),
        bots: txAny(["messenger.botsSubtitle", "messenger.bots"], "Avtomatika va yordamchilar"),
        channels: txAny(["messenger.channelsSubtitle", "messenger.channels"], "Rasmiy lentalar"),
      } as Record<QuickCardId, string>,
      channelPreview: txAny(["messenger.chat.channelRoom", "messenger.channels"], "Kanal"),
      businessPreview: txAny(["messenger.chat.businessRoom", "common.business"], "Biznes"),
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
      mainChats: txAny(["messenger.chats", "tabs.chats"], "Chatlar"),
      deleteChat: `${txAny(["common.delete"], "O‘chirish")} ${txAny(
        ["messenger.chats", "tabs.chats"],
        "Chatlar",
      )}`.trim(),
      close: txAny(["common.close"], "Yopish"),
      active: txAny(["status.active", "common.enabled"], "Faol"),
    }),
    [txAny],
  );

  const refreshTheme = useCallback(async () => {
    const next = await hydrateMessengerThemeState();
    setThemeState(next);
  }, []);

  const loadChats = useCallback(async () => {
    const rooms = await messengerKernelFacade.listRoomSnapshots();
    const profiles = await messengerKernelFacade.listRoomProfiles();
    const mapped = await buildPersistedChatItems(
      rooms,
      language,
      texts as unknown as Record<string, string>,
    );

    const visible = mapped
      .map((item) => {
        const profile = profiles[item.id];
        const privateAvatar =
          typeof (profile as { avatarUri?: unknown } | undefined)?.avatarUri === "string"
            ? String((profile as { avatarUri?: unknown }).avatarUri).trim()
            : "";
        const groupAvatar =
          item.roomType === "group"
            ? resolveSharedAvatarUrl("group", [item.id])
            : "";
        const publicAvatar =
          item.roomType !== "group"
            ? resolvePublicProfileAvatarUri([
                (profile as { peerUserId?: string | null } | undefined)?.peerUserId,
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
          unread: Math.max(
            0,
            (typeof profile?.unreadCount === "number" ? profile.unreadCount : item.unread) -
              (item.hiddenReactionTailCount ?? 0),
          ),
          online: isMessengerPeerOnline({
            ...item,
            peerUserId: (profile as { peerUserId?: string | null } | undefined)?.peerUserId || item.peerUserId,
          }),
          muted: Boolean(profile?.muted),
          pinned: Boolean(profile?.pinned),
          hiddenFromMain: Boolean(profile?.hiddenFromMain),
          phone: profile?.phone || item.phone,
          username: profile?.username || item.username,
          currentUserId: (profile as { currentUserId?: string | null } | undefined)?.currentUserId || item.currentUserId,
          peerUserId: (profile as { peerUserId?: string | null } | undefined)?.peerUserId || item.peerUserId,
          avatarUrl: privateAvatar || groupAvatar || publicAvatar || item.avatarUrl || "",
        };
      })
      .filter((item) => {
        const profile = profiles[item.id];
        if (item.id === OFFICIAL_CHANNEL_BASE.id) return false;
        if (profile?.deleted) return false;
        return !messengerKernelFacade.isRoomHidden(profile);
      })
      .sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return String(b.updatedAt ?? "").localeCompare(String(a.updatedAt ?? ""));
      });

    setPersistedChats(visible);
  }, [language, texts]);

  useEffect(() => {
    setOfficialPreview(texts.officialPreview);
    setOfficialTime(texts.officialNow);
  }, [texts.officialNow, texts.officialPreview]);

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
    const applyCallHistory = (items: MessengerCallHistoryItem[]) => {
      setCallHistory(items);
    };

    const unsubscribe = subscribeMessengerCallEvents(applyCallHistory);
    void hydrateMessengerCallEvents().then(applyCallHistory);

    return unsubscribe;
  }, []);

  const realtimeChannel = useMemo(
    () =>
      currentUserId
        ? `messenger:channels:${currentUserId}`
        : "messenger:channels:public",
    [currentUserId],
  );

  const handleRealtimeEvent = useCallback(
    (eventName: string, payload: unknown) => {
      if (
        eventName !== "channel:post" &&
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

      const isHiddenReactionControl =
        isSabiReactionControlText(record?.content as string | null | undefined) ||
        isSabiReactionControlText(record?.text as string | null | undefined) ||
        isSabiReactionControlText(record?.preview as string | null | undefined) ||
        isSabiReactionControlText(record?.previewTitle as string | null | undefined);

      if (chatId && chatId !== OFFICIAL_CHANNEL_BASE.id && !isHiddenReactionControl) {
        void messengerKernelFacade.rooms.incrementUnread(chatId, 1);
      }

      const nextPreview = isHiddenReactionControl
        ? officialPreview || texts.officialPreview
        : (sanitizeMessagePreviewText(record?.preview as string | null | undefined) ||
          sanitizeMessagePreviewText(record?.text as string | null | undefined) ||
          sanitizeMessagePreviewText(record?.title as string | null | undefined) ||
          texts.officialPreview);

      setOfficialPreview(nextPreview);
      setOfficialTime(formatLocalTime(language));
      setOfficialUnread((current) => Math.min(current + 1, 99));
      void loadChats();
    },
    [language, loadChats, officialPreview, texts.officialPreview],
  );

  useEffect(() => {
    const syncConnection = () => {
      setConnected(messengerKernelFacade.selectors.realtimeStatus() === "connected");
    };

    syncConnection();

    const unsubscribeStore = messengerKernelFacade.subscribe(() => {
      syncConnection();
      void loadChats();
    });
    const unsubscribeRealtime = messengerKernelFacade.on("realtimeEvent", (event) => {
      if (event.type === "connection") {
        syncConnection();
        return;
      }

      if (event.type === "custom") {
        if (typeof event.eventName === "string" && event.eventName.length > 0) { handleRealtimeEvent(event.eventName, event.payload); }
      }
    });

    return () => {
      unsubscribeRealtime();
      unsubscribeStore();
    };
  }, [handleRealtimeEvent, loadChats]);

  const pushWithUser = useCallback(
    (route: string, extraParams?: Record<string, string>) => {
      router.push({
        pathname: route as never,
        params: {
          ...(currentUserId ? { userId: currentUserId } : {}),
          ...(extraParams || {}),
        },
      } as never);
    },
    [currentUserId],
  );


  const chats = useMemo<ChatItem[]>(() => {
    const officialChannel: ChatItem = {
      ...OFFICIAL_CHANNEL_BASE,
      preview: officialPreview || texts.officialPreview,
      time: officialTime || texts.officialNow,
      unread: officialUnread,
      muted: false,
      pinned: false,
      hiddenFromMain: false,
      avatarUrl: "",
    };

    const merged = new Map<string, ChatItem>();
    merged.set(officialChannel.id, officialChannel);
    persistedChats.forEach((item) => merged.set(item.id, item));

    return Array.from(merged.values()).sort((a, b) => {
      if (a.id === OFFICIAL_CHANNEL_BASE.id) return -1;
      if (b.id === OFFICIAL_CHANNEL_BASE.id) return 1;
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return String(b.updatedAt ?? "").localeCompare(String(a.updatedAt ?? ""));
    });
  }, [
    officialPreview,
    officialTime,
    officialUnread,
    persistedChats,
    texts.officialNow,
    texts.officialPreview,
  ]);

  const unreadMessagesTotal = useMemo(
    () => chats.reduce((sum, item) => sum + Math.max(0, Number(item.unread || 0) || 0), 0),
    [chats],
  );

  const missedCallsTotal = useMemo(
    () =>
      callHistory.filter(
        (item) => item.direction === "missed" && (item.unread || item.status === "missed"),
      ).length,
    [callHistory],
  );

  const quickBadges = useMemo(
    () => ({
      chats: unreadMessagesTotal,
      calls: missedCallsTotal,
      contacts: 0,
      groups: 0,
      bots: 0,
      channels: 0,
    } as Record<QuickCardId, number>),
    [missedCallsTotal, unreadMessagesTotal],
  );

  const openChat = useCallback(
    async (chat: ChatItem) => {
      await messengerKernelFacade.ensureRoomSnapshot({
        chatId: chat.id,
        name: chat.name,
        subtitle: chat.phone || chat.username || texts.directPreview,
        roomType: chat.roomType,
        verified: Boolean(chat.verified),
        avatarLetter: chat.avatarLetter || getAvatarLetter(chat.name, chat.phone),
      });

      if (chat.id !== OFFICIAL_CHANNEL_BASE.id) {
        await messengerKernelFacade.rooms.markRead(chat.id);
        await loadChats();
      }

      const nextParams: Record<string, string> = {
        id: chat.id,
        chatId: chat.id,
        name: chat.name,
        roomType: chat.roomType,
      };

      if (chat.username) nextParams.handle = chat.username;
      if (chat.phone) nextParams.phone = chat.phone;
      if (chat.avatarLetter) nextParams.avatarLetter = chat.avatarLetter;
      if (chat.avatarUrl) {
        nextParams.avatarUrl = chat.avatarUrl;
        nextParams.photoUrl = chat.avatarUrl;
      }
      if (chat.verified) nextParams.verified = "1";
      if (currentUserId) {
        nextParams.userId = currentUserId;
        nextParams.currentUserId = currentUserId;
      }
      if (chat.roomType === "direct") {
        const peerId = chat.peerUserId || chat.id;
        nextParams.peerUserId = peerId;
        nextParams.peerId = peerId;
        nextParams.targetUserId = peerId;
      }

      router.push({
        pathname: "/tabs/chat/[id]",
        params: nextParams,
      } as never);
    },
    [currentUserId, loadChats, texts.directPreview],
  );

  const runQuickAction = async (action: () => Promise<void>) => {
    await action();
    setQuickMenuChat(null);
    await loadChats();
  };

  const renderAvatar = (chat: ChatItem) => {
    if (chat.avatarUrl && chat.avatarUrl.trim().length) {
      return (
        <View style={styles.avatarPhotoFrame}>
          <Image source={{ uri: chat.avatarUrl }} style={styles.avatarImage} />
        </View>
      );
    }

    return (
      <LinearGradient
        colors={[
          chat.hiddenFromMain ? "#6A4DE1" : palette.accent,
          chat.hiddenFromMain ? "#8C69FF" : palette.accentAlt,
          chat.hiddenFromMain ? "#C39DFF" : palette.accentSoft,
        ]}
        style={styles.avatar}
      >
        <Text style={styles.avatarText}>{chat.avatarLetter || "S"}</Text>
      </LinearGradient>
    );
  };

  const renderChatCard = (chat: ChatItem) => (
    <Pressable
      key={chat.id}
      onPress={() => void openChat(chat)}
      onLongPress={
        chat.id === OFFICIAL_CHANNEL_BASE.id ? undefined : () => setQuickMenuChat(chat)
      }
      delayLongPress={220}
      style={({ pressed }) => [styles.chatCardWrap, pressed && styles.rowPressed]}
    >
      <View style={styles.chatCardShadow} />
      {!hasWallpaper ? (
        <View
          style={[
            styles.chatCardGlow,
            {
              backgroundColor: chat.hiddenFromMain
                ? "rgba(139,105,255,0.14)"
                : "rgba(96,170,255,0.08)",
            },
          ]}
        />
      ) : null}
      <LinearGradient colors={cardColors} style={styles.chatCard}>
        <View style={[styles.cardGlass, hasWallpaper && styles.wallpaperGlassMuted]} />
        {!hasWallpaper ? <View style={styles.cardShineBlob} /> : null}
        <View
          style={[
            styles.cardHighlightLine,
            hasWallpaper && styles.wallpaperHighlightSoft,
          ]}
        />

        <View style={styles.accentRailWrap}>
          <LinearGradient
            colors={
              chat.hiddenFromMain
                ? ["rgba(195,157,255,1)", "rgba(140,105,255,0.32)"]
                : [palette.accent, palette.accentSoft]
            }
            style={styles.accentRail}
          />
        </View>

        <View style={styles.avatarWrap}>
          <View
            style={[
              styles.avatarGlow,
              {
                backgroundColor: chat.hiddenFromMain
                  ? "rgba(140,105,255,0.20)"
                  : "rgba(116,167,255,0.14)",
              },
            ]}
          />
          {renderAvatar(chat)}
          {isMessengerPeerOnline(chat) && !chat.official ? (
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

        <View style={styles.chatCardBody}>
          <View style={styles.topRow}>
            <View style={styles.titleRow}>
              <Text style={styles.title} numberOfLines={1}>
                {chat.name}
              </Text>
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

          <Text style={styles.preview} numberOfLines={2}>
            {chat.preview}
          </Text>

          <View style={styles.bottomRow}>
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
      </LinearGradient>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right", "bottom"]}>
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
              <Text style={styles.headerTitle}>{texts.brand}</Text>
            </View>

            <Pressable style={styles.headerButton} onPress={() => setSettingsVisible(true)}>
              <View style={styles.headerButtonShadow} />
              <LinearGradient colors={raisedColors} style={styles.headerButtonFill}>
                <Settings2 size={19} color={palette.textMain} strokeWidth={2.3} />
              </LinearGradient>
            </Pressable>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>{texts.quickAccess}</Text>
                <Text style={styles.sectionMetaSub}>{texts.quickAccessMeta}</Text>
              </View>

              <View style={styles.sectionMetaLiveWrap}>
                <View
                  style={[
                    styles.liveDot,
                    { backgroundColor: connected ? palette.accent : "#FF8C8C" },
                  ]}
                />
                <Text style={styles.sectionMeta}>
                  {connected ? texts.online : texts.connecting}
                </Text>
              </View>
            </View>

            <View style={styles.quickGrid}>
              {QUICK_ACCESS.map((item) => {
                const Icon = item.icon;
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => pushWithUser(item.route)}
                    style={({ pressed }) => [
                      styles.quickCardWrap,
                      pressed && styles.cardPressed,
                    ]}
                  >
                    <View style={styles.quickCardShadow} />
                    <LinearGradient
                      colors={cardColors}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.quickCard}
                    >
                      <View style={styles.cardGlass} />
                      <LinearGradient
                        colors={["rgba(255,255,255,0.10)", "rgba(255,255,255,0.00)"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.cardShine}
                      />

                      <View
                        style={[
                          styles.quickIconWrap,
                          {
                            backgroundColor: accentSoftBg,
                            borderColor: accentBorder,
                          },
                        ]}
                      >
                        <Icon size={19} strokeWidth={2.3} color={palette.accentSoft} />
                      </View>

                      {quickBadges[item.id] > 0 ? (
                        <View style={styles.quickBadgeWrap}>
                          <Text style={styles.quickBadgeText}>
                            {quickBadges[item.id] > 99 ? "99+" : quickBadges[item.id]}
                          </Text>
                        </View>
                      ) : null}

                      <View style={styles.quickTextBlock}>
                        <Text style={styles.quickTitle} numberOfLines={2}>
                          {texts.titles[item.id]}
                        </Text>
                        <Text style={styles.quickSubtitle} numberOfLines={2}>
                          {texts.subtitles[item.id]}
                        </Text>
                      </View>

                      <View style={styles.quickArrowWrap}>
                        <ChevronRight
                          size={16}
                          strokeWidth={2.3}
                          color={palette.accentSoft}
                        />
                      </View>
                    </LinearGradient>
                  </Pressable>
                );
              })}
            </View>
          </View>


          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>{texts.chatsTitle}</Text>
                <Text style={styles.sectionMetaSub}>{texts.chatsMeta}</Text>
              </View>

              <View style={styles.sectionMetaLiveWrap}>
                <View
                  style={[
                    styles.liveDot,
                    { backgroundColor: connected ? palette.accent : "#FF8C8C" },
                  ]}
                />
                <Text style={styles.sectionMeta}>
                  {connected ? texts.online : texts.connecting}
                </Text>
              </View>
            </View>

            {chats.length === 0 ? (
              <View style={styles.emptyWrap}>
                <View style={styles.chatCardShadow} />
                <LinearGradient colors={cardColors} style={styles.emptyCard}>
                  <View style={styles.cardGlass} />
                  <Text style={styles.emptyTitle}>{texts.emptyTitle}</Text>
                  <Text style={styles.emptySubtitle}>{texts.emptySubtitle}</Text>
                </LinearGradient>
              </View>
            ) : (
              chats.map(renderChatCard)
            )}
          </View>
        </ScrollView>

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
                <QuickActionRow
                  title={texts.profile}
                  subtitle={texts.settingsHint}
                  icon={<Settings2 size={17} color="#D6FFF0" strokeWidth={2.4} />}
                  onPress={() => {
                    setSettingsVisible(false);
                    router.push("/profile" as never);
                  }}
                />

                <Pressable
                  onPress={() => setSettingsVisible(false)}
                  style={({ pressed }) => [styles.closeWrap, pressed && styles.rowPressed]}
                >
                  <LinearGradient
                    colors={["rgba(255,255,255,0.08)", "rgba(255,255,255,0.03)"]}
                    style={styles.closeCard}
                  >
                    <View style={styles.closeIcon}>
                      <X size={16} color={TEXT_MAIN} strokeWidth={2.4} />
                    </View>
                    <Text style={styles.closeText}>{texts.close}</Text>
                  </LinearGradient>
                </Pressable>
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

  section: {
    marginTop: 18,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    color: TEXT_MAIN,
    fontSize: 20,
    fontWeight: "900",
  },
  sectionMetaSub: {
    color: TEXT_MUTED,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 3,
  },
  sectionMeta: {
    color: TEXT_MUTED,
    fontSize: 13,
    fontWeight: "700",
  },
  sectionMetaLiveWrap: {
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
  sparkWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  quickCardWrap: {
    width: "31.8%",
    borderRadius: 26,
    marginBottom: 12,
  },
  quickCardShadow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 26,
    backgroundColor: "rgba(0,0,0,0.22)",
    transform: [{ translateY: 9 }, { scaleX: 0.96 }],
  },
  quickCard: {
    minHeight: 148,
    borderRadius: 26,
    padding: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: GLASS_BORDER,
  },
  quickBadgeWrap: {
    position: "absolute",
    top: 12,
    right: 12,
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    paddingHorizontal: 7,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF4D67",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.24)",
  },
  quickBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
  },

  createGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  createCardWrap: {
    flex: 1,
    borderRadius: 24,
  },
  createCardShadow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
    backgroundColor: "rgba(0,0,0,0.22)",
    transform: [{ translateY: 8 }, { scaleX: 0.96 }],
  },
  createCard: {
    minHeight: 146,
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    overflow: "hidden",
  },

  quickIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    marginBottom: 14,
  },
  createIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    marginBottom: 12,
  },

  quickTextBlock: {
    minHeight: 52,
  },
  quickTitle: {
    color: TEXT_MAIN,
    fontSize: 16,
    fontWeight: "900",
    minHeight: 38,
  },
  quickSubtitle: {
    color: TEXT_SECONDARY,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
    paddingRight: 4,
    minHeight: 32,
  },
  createTextBlock: {
    minHeight: 74,
  },
  createTitle: {
    color: TEXT_MAIN,
    fontSize: 15,
    fontWeight: "900",
    minHeight: 38,
  },
  createSubtitle: {
    marginTop: 4,
    color: TEXT_SECONDARY,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
    minHeight: 48,
  },

  quickArrowWrap: {
    marginTop: "auto",
    alignSelf: "flex-end",
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
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

  chatCardWrap: {
    marginBottom: 12,
    borderRadius: 26,
  },
  chatCardShadow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 26,
    backgroundColor: "rgba(0,0,0,0.22)",
    transform: [{ translateY: 10 }, { scaleX: 0.96 }],
  },
  chatCardGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 26,
  },
  chatCard: {
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
  cardGlass: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.016)",
  },
  wallpaperGlassMuted: {
    backgroundColor: "rgba(255,255,255,0.006)",
  },
  wallpaperHighlightSoft: {
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  cardShine: {
    ...StyleSheet.absoluteFillObject,
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
    alignItems: "center",
    justifyContent: "center",
  },
  avatarPhotoFrame: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarText: {
    color: "#F7FFFC",
    fontSize: 18,
    fontWeight: "900",
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

  chatCardBody: {
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
  },
  title: {
    color: TEXT_MAIN,
    fontSize: 16,
    fontWeight: "900",
    maxWidth: "72%",
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
  preview: {
    marginTop: 7,
    color: TEXT_SECONDARY,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
  },
  bottomRow: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
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
  quickMenuWrap: {
    justifyContent: "center",
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

  closeWrap: {
    borderRadius: 16,
    marginTop: 10,
  },
  closeCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  closeIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  closeText: {
    color: TEXT_MAIN,
    fontSize: 14,
    fontWeight: "900",
  },

  rowPressed: {
    transform: [{ scale: 0.988 }],
  },
  cardPressed: {
    transform: [{ scale: 0.986 }],
  },
});


