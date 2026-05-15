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
  BookMarked,
  Hash,
  Lock,
  Palette,
  PanelRightClose,
  PanelRightOpen,
  Pin,
  Radio,
  Search,
  Settings2,
  Trash2,
  Volume2,
  VolumeX,
  X,
} from "lucide-react-native";

import { useI18n } from "../../src/shared/i18n";
import { messengerKernelFacade, type MessengerKernelRoomSnapshot } from "../../src/core/kernel/messenger/facade";
import {
  getMessengerThemePalette,
  getMessengerThemeState,
  hydrateMessengerThemeState,
  type MessengerThemePalette,
  type MessengerThemeState,
} from "../../src/modules/messenger/theme/messengerThemeRuntime";
import { hydratePublicProfile } from "../../src/modules/messenger/public/publicProfileRuntime";
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
  mode?: string;
  source?: string;
};

type ChannelItem = {
  id: string;
  name: string;
  preview: string;
  time: string;
  unread: number;
  verified?: boolean;
  official?: boolean;
  handle?: string;
  avatarLetter?: string;
  avatarUri?: string;
  updatedAt?: string;
  muted?: boolean;
  pinned?: boolean;
  hiddenFromMain?: boolean;
  publicDirectoryItem?: SabiPublicDirectoryItem;
};

type PersistedUiMessage = {
  id?: string;
  text?: string;
  time?: string;
  previewTitle?: string;
  kind?: string;
};

function mapSabiDirectoryChannelItem(
  item: SabiPublicDirectoryItem,
  language: string,
  labels: { channelPreview: string },
): ChannelItem | null {
  const id = String(item.chatId || item.roomId || item.channelId || item.id || "").trim();
  const name = String(item.title || item.name || "").trim();
  if (!id || !name) return null;

  const updatedAt = typeof item.updatedAt === "string" && item.updatedAt.trim() ? item.updatedAt.trim() : new Date().toISOString();
  const description = typeof item.description === "string" ? item.description.trim() : "";
  const username = typeof item.username === "string" && item.username.trim() ? item.username.trim() : "";

  return {
    id,
    name,
    preview: description || labels.channelPreview,
    time: formatTime(updatedAt, language),
    unread: 0,
    verified: Boolean((item as any).verified || item.recommended || item.promotionPlacement === "featured"),
    official: false,
    handle: username ? normalizeHandle(username) : undefined,
    avatarLetter: getAvatarLetter(name),
    avatarUri: item.avatarUrl || item.avatarUri || item.photoUrl || undefined,
    updatedAt,
    hiddenFromMain: false,
    publicDirectoryItem: item,
  };
}

function mergeSabiDirectoryChannels(localItems: ChannelItem[], directoryItems: ChannelItem[]) {
  const byId = new Map<string, ChannelItem>();
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
const TEXT_MAIN = "#F8FBFF";
const TEXT_SECONDARY = "rgba(236,244,255,0.76)";
const TEXT_MUTED = "rgba(214,226,244,0.56)";
const GLASS_BORDER = "rgba(255,255,255,0.10)";

const OFFICIAL_CHANNEL_BASE: Omit<
  ChannelItem,
  "preview" | "time" | "updatedAt" | "muted" | "pinned" | "hiddenFromMain"
> = {
  id: "sabi-info",
  name: "Sabi info",
  unread: 1,
  verified: true,
  official: true,
  handle: "@sabi_info",
  avatarLetter: "S",
};

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

function formatLocalTime(language?: string) {
  return formatTime(new Date().toISOString(), language);
}

function normalizeHandle(value?: string | null) {
  const raw = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/^@+/, "")
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return raw ? `@${raw}` : "";
}

function getAvatarLetter(name?: string | null) {
  const source = String(name ?? "").trim();
  const match = source.replace(/^[^\p{L}\p{N}]+/u, "").charAt(0);
  return String(match || "C").toUpperCase();
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

async function buildPersistedChannelItems(
  rooms: ChatRoomMetaSnapshot[],
  language: string | undefined,
  texts: Record<string, string>,
): Promise<ChannelItem[]> {
  const channelRooms = rooms.filter((room) => room.roomType === "channel");

  const mapped = await Promise.all(
    channelRooms.map(async (room) => {
      const messages = await messengerKernelFacade.listRoomPreviewMessages(room.chatId);
      const lastMessage = messages[messages.length - 1];
      const handle = room.subtitle?.startsWith("@") ? room.subtitle : undefined;
      const sharedProfile = hydratePublicProfile(room.chatId);
      const avatarUri =
        typeof sharedProfile?.avatarUri === "string" && sharedProfile.avatarUri.trim().length
          ? sharedProfile.avatarUri.trim()
          : "";

      return {
        id: room.chatId,
        name: room.name,
        preview: getMessagePreview(lastMessage, texts.channelPreview, {
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
        official: room.chatId === OFFICIAL_CHANNEL_BASE.id || Boolean(room.verified),
        handle,
        avatarLetter: room.avatarLetter || getAvatarLetter(room.name),
        avatarUri,
        updatedAt: room.updatedAt,
      } satisfies ChannelItem;
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
}: {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [pressed ? styles.rowPressed : undefined]}>
      <LinearGradient
        colors={
          danger
            ? ["rgba(109,24,38,0.96)", "rgba(62,15,24,0.94)"]
            : ["rgba(255,255,255,0.08)", "rgba(255,255,255,0.03)"]
        }
        style={styles.popupItem}
      >
        <View style={[styles.popupIcon, danger ? styles.popupIconDanger : undefined]}>{icon}</View>
        <View style={styles.popupTextWrap}>
          <Text style={[styles.popupTitle, danger ? styles.popupTitleDanger : undefined]}>
            {title}
          </Text>
          {subtitle ? <Text style={styles.popupSubtitle}>{subtitle}</Text> : null}
        </View>
      </LinearGradient>
    </Pressable>
  );
}

export default function ChannelsScreen() {
  const params = useLocalSearchParams<RouteParams>();
  const { language, t } = useI18n();

  const currentUserId =
    typeof params.userId === "string" && params.userId.trim().length > 0
      ? params.userId.trim()
      : undefined;

  const [themeState, setThemeState] = useState<MessengerThemeState>(getMessengerThemeState());
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [quickMenuChannel, setQuickMenuChannel] = useState<ChannelItem | null>(null);
  const [connected, setConnected] = useState(false);
  const [query, setQuery] = useState("");
  const [officialPreview, setOfficialPreview] = useState("");
  const [officialTime, setOfficialTime] = useState("");
  const [officialUnread, setOfficialUnread] = useState(1);
  const [channels, setChannels] = useState<ChannelItem[]>([]);

  const palette = useMemo<MessengerThemePalette>(
    () => getMessengerThemePalette(themeState.themeId),
    [themeState.themeId],
  );

  const hasWallpaper = Boolean(themeState.wallpaperUri);
  const accentAlt =
    typeof (palette as MessengerThemePalette & { accentAlt?: string }).accentAlt === "string"
      ? (palette as MessengerThemePalette & { accentAlt?: string }).accentAlt!
      : palette.accentSoft;

  const cardColors: [string, string] = hasWallpaper
    ? ["rgba(10,15,24,0.26)", "rgba(10,15,24,0.14)"]
    : palette.surface;

  const raisedColors: [string, string] = hasWallpaper
    ? ["rgba(255,255,255,0.06)", "rgba(255,255,255,0.02)"]
    : palette.surfaceRaised;

  const accentSoftBg = withAlpha(palette.accent, hasWallpaper ? 0.14 : 0.18);
  const accentBorder = withAlpha(accentAlt, hasWallpaper ? 0.18 : 0.26);

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
      title: txAny(["messenger.channels"], "Kanallar"),
      eyebrow: "Sabi Messenger",
      linkedHint: txAny(
        ["messenger.channelsLinkedHint"],
        "Profilda yaratilgan kanallar shu yerda ko‘rinadi va Messenger xonasida ochiladi.",
      ),
      settings: txAny(["settings.title", "common.settings"], "Sozlamalar"),
      themeWallpaper: txAny(["messenger.themeWallpaper", "common.theme"], "Mavzu va fon rasmi"),
      privateChannels: txAny(["messenger.privateChats"], "Shaxsiy kanallar"),
      online: txAny(["common.online", "messenger.online"], "Onlayn"),
      connecting: txAny(["common.connecting"], "Ulanmoqda"),
      search: txAny(["common.search"], "Qidirish"),
      emptyTitle: txAny(["messenger.emptyChannelsTitle"], "Hozircha kanallar yo‘q"),
      emptySubtitle: txAny(
        ["messenger.emptyChannelsSubtitle"],
        "Kanal profilidan yaratilgan kanallar shu yerda avtomatik ko‘rinadi.",
      ),
      officialBadge: txAny(["status.verified", "common.verified"], "Tasdiqlangan"),
      officialPreview: txAny(
        ["messenger.channels", "messenger.title"],
        "Sabi Messenger yangiliklari va rasmiy xabarlari.",
      ),
      officialNow: txAny(["common.now", "common.today"], "Hozir"),
      channelPreview: txAny(["messenger.chat.channelRoom", "messenger.channels"], "Kanal"),
      directoryUnavailable: txAny(["messenger.directoryUnavailable", "common.unavailable"], "Hozir ochib bo‘lmaydi"),
      directoryUnavailableMessage: txAny(
        ["messenger.directoryUnavailableMessage"],
        "Bu yozuv hozir yopilgan yoki admin tekshiruvida.",
      ),
      photo: txAny(["messenger.chat.photoTitle", "messenger.photo"], "Rasm"),
      video: txAny(["messenger.chat.videoTitle", "messenger.video"], "Video"),
      document: txAny(["messenger.chat.documentTitle", "messenger.document"], "Hujjat"),
      contact: txAny(["messenger.chat.contactTitle", "messenger.contact"], "Kontakt"),
      location: txAny(["messenger.chat.locationTitle", "messenger.location"], "Joylashuv"),
      gift: txAny(["gifts.title"], "Sovg‘a"),
      voice: txAny(["messenger.chat.voiceTitle", "messenger.voiceMessage"], "Ovozli xabar"),
      close: txAny(["common.close"], "Yopish"),
      mute: txAny(["messenger.menu.mute", "messenger.muteChat"], "Ovozsiz qilish"),
      unmute: txAny(["messenger.menu.unmute", "messenger.unmuteChat"], "Ovozni yoqish"),
      pin: txAny(["messenger.pinChat"], "Mahkamlash"),
      unpin: txAny(["messenger.unpinChat"], "Mahkamlashni olib tashlash"),
      markRead: txAny(["status.read"], "O‘qilgan deb belgilash"),
      markUnread: txAny(["status.unread"], "O‘qilmagan deb belgilash"),
      movePrivate: txAny(["messenger.privateChats"], "Shaxsiyga ko‘chirish"),
      moveMain: txAny(["messenger.chats"], "Asosiy ro‘yxatga qaytarish"),
      deleteChannel: `${txAny(["common.delete"], "O‘chirish")} ${txAny(
        ["messenger.channels"],
        "Kanallar",
      )}`.trim(),
      workspace: txAny(["messenger.workspace"], "Ish maydoni"),
      profileSourceNote: txAny(
        ["messenger.profileSourceNote"],
        "Kanal yaratish va egasi sozlamalari profil ichida. Bu ekran faqat kanallarni ko‘rsatadi va ochadi.",
      ),
    }),
    [txAny],
  );

  const loadChannels = useCallback(async () => {
    const rooms = await messengerKernelFacade.listRoomSnapshots();
    const profiles = await messengerKernelFacade.listRoomProfiles();
    const mapped = await buildPersistedChannelItems(rooms, language, {
      channelPreview: texts.channelPreview,
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
        } satisfies ChannelItem;
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

    const directoryQuery = query.trim();
    const directoryChannels = (await (directoryQuery
      ? searchSabiPublicDirectory({ kind: "CHANNEL", query: directoryQuery })
      : listSabiPublicDirectory({ kind: "CHANNEL", limit: 80 })))
      .map((item: SabiPublicDirectoryItem) => mapSabiDirectoryChannelItem(item, language, { channelPreview: texts.channelPreview }))
      .filter((item: ChannelItem | null): item is ChannelItem => Boolean(item));

    setChannels(mergeSabiDirectoryChannels(visible, directoryChannels));
  }, [
    language,
    query,
    texts.channelPreview,
    texts.contact,
    texts.document,
    texts.gift,
    texts.location,
    texts.photo,
    texts.video,
    texts.voice,
  ]);

  const refreshTheme = useCallback(async () => {
    const next = await hydrateMessengerThemeState();
    setThemeState(next);
  }, []);

  useEffect(() => {
    setOfficialPreview(texts.officialPreview);
    setOfficialTime(texts.officialNow);
  }, [texts.officialNow, texts.officialPreview]);

  useFocusEffect(
    useCallback(() => {
      void refreshTheme();
      void loadChannels();
    }, [refreshTheme, loadChannels]),
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadChannels();
    }, 250);

    return () => clearTimeout(timer);
  }, [loadChannels, query]);

  const realtimeChannel = useMemo(
    () => (currentUserId ? `messenger:channels:${currentUserId}` : "messenger:channels:public"),
    [currentUserId],
  );

  const handleRealtimeEvent = useCallback(
    (eventName: string, payload: unknown) => {
      if (
        eventName !== "channel:post" &&
        eventName !== "channel:created" &&
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

      if (eventName === "channel:created" && chatId) {
        const name = (typeof record?.name === "string" && record.name.trim()) || "Channel";
        const handle =
          (typeof record?.handle === "string" && record.handle.trim()) ||
          (typeof record?.username === "string" && record.username.trim()) ||
          "";

        void (async () => {
          await messengerKernelFacade.ensureRoomSnapshot({
            chatId,
            name,
            subtitle: normalizeHandle(handle),
            roomType: "channel",
            verified: Boolean(record?.verified),
            avatarLetter: getAvatarLetter(name),
          });
          await loadChannels();
        })();

        return;
      }

      if (chatId && chatId !== OFFICIAL_CHANNEL_BASE.id) {
        void messengerKernelFacade.rooms.incrementUnread(chatId, 1);
      }

      const nextPreview =
        (typeof record?.preview === "string" && record.preview.trim()) ||
        (typeof record?.text === "string" && record.text.trim()) ||
        (typeof record?.title === "string" && record.title.trim()) ||
        texts.officialPreview;

      setOfficialPreview(nextPreview);
      setOfficialTime(formatLocalTime(language));
      setOfficialUnread((current) => Math.min(current + 1, 99));
      void loadChannels();
    },
    [language, loadChannels, texts.officialPreview],
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
        if (typeof event.eventName === "string" && event.eventName.length > 0) { handleRealtimeEvent(event.eventName, event.payload); }
      }
    });

    return () => {
      unsubscribeRealtime();
      unsubscribeStore();
    };
  }, [handleRealtimeEvent]);

  const openChannel = useCallback(
    async (channel: ChannelItem) => {
      if (channel.publicDirectoryItem) {
        const result = await openSabiPublicDirectoryItem(channel.publicDirectoryItem, currentUserId);
        if (!result.ok) {
          await loadChannels();
          Alert.alert(texts.directoryUnavailable, texts.directoryUnavailableMessage);
          return;
        }
        await loadChannels();
        return;
      }

      await openMessengerRoom({
        chatId: channel.id,
        name: channel.name,
        subtitle: channel.handle || texts.channelPreview,
        roomType: "channel",
        verified: Boolean(channel.verified),
        avatarLetter: channel.avatarLetter || getAvatarLetter(channel.name),
        handle: channel.handle || undefined,
        username: channel.handle || undefined,
        avatarUrl: channel.avatarUri || undefined,
        photoUrl: channel.avatarUri || undefined,
        currentUserId: currentUserId || undefined,
        markRead: channel.id !== OFFICIAL_CHANNEL_BASE.id,
      });

      if (channel.id !== OFFICIAL_CHANNEL_BASE.id) {
        await loadChannels();
      }
    },
    [currentUserId, loadChannels, texts.channelPreview, texts.directoryUnavailable, texts.directoryUnavailableMessage],
  );

  const runQuickAction = useCallback(
    async (action: () => Promise<unknown>) => {
      await action();
      setQuickMenuChannel(null);
      await loadChannels();
    },
    [loadChannels],
  );

  const mergedChannels = useMemo<ChannelItem[]>(() => {
    const officialChannel: ChannelItem = {
      ...OFFICIAL_CHANNEL_BASE,
      preview: officialPreview || texts.officialPreview,
      time: officialTime || texts.officialNow,
      unread: officialUnread,
      muted: false,
      pinned: false,
      hiddenFromMain: false,
      updatedAt: new Date().toISOString(),
    };

    const merged = new Map<string, ChannelItem>();
    merged.set(officialChannel.id, officialChannel);
    channels.forEach((item) => merged.set(item.id, item));

    return Array.from(merged.values()).sort((a, b) => {
      if (a.id === OFFICIAL_CHANNEL_BASE.id) return -1;
      if (b.id === OFFICIAL_CHANNEL_BASE.id) return 1;
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return String(b.updatedAt ?? "").localeCompare(String(a.updatedAt ?? ""));
    });
  }, [channels, officialPreview, officialTime, officialUnread, texts.officialNow, texts.officialPreview]);

  const filteredChannels = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return mergedChannels.filter((item) => {
      if (!normalized) return true;
      return (
        item.name.toLowerCase().includes(normalized) ||
        item.preview.toLowerCase().includes(normalized) ||
        (item.handle ?? "").toLowerCase().includes(normalized)
      );
    });
  }, [mergedChannels, query]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right", "bottom"]}>
      <DecorativeBackground themeState={themeState} palette={palette}>
        {!hasWallpaper ? (
          <>
            <View style={styles.topGlow} />
            <View style={styles.sideGlow} />
            <View style={styles.bottomGlow} />
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
                  <LinearGradient colors={raisedColors} style={styles.headerButtonFill}>
                    <ArrowLeft size={20} strokeWidth={2.3} color={palette.textMain} />
                  </LinearGradient>
                </View>
              )}
            </Pressable>

            <View style={styles.headerTitleWrap}>
              <Text style={styles.headerEyebrow}>{texts.eyebrow}</Text>
              <Text style={styles.headerTitle}>{texts.title}</Text>
            </View>

            <Pressable style={styles.headerButtonWrap} onPress={() => setSettingsVisible(true)}>
              {({ pressed }) => (
                <View style={[styles.headerButtonOuter, pressed ? styles.pressed : undefined]}>
                  <View style={styles.headerButtonShadow} />
                  <LinearGradient colors={raisedColors} style={styles.headerButtonFill}>
                    <Settings2 size={19} strokeWidth={2.3} color={palette.textMain} />
                  </LinearGradient>
                </View>
              )}
            </Pressable>
          </View>

          <View style={styles.heroCardWrap}>
            <View style={styles.heroShadow} />
            <LinearGradient colors={cardColors} style={styles.heroCard}>
              <View style={styles.cardGlass} />
              <View style={styles.heroTopRow}>
                <View style={styles.heroLeft}>
                  <LinearGradient
                    colors={[palette.accent, accentAlt, palette.accentSoft]}
                    style={styles.heroSticker}
                  >
                    <Radio size={24} strokeWidth={2.3} color="#071711" />
                  </LinearGradient>
                  <View style={styles.heroTextWrap}>
                    <Text style={styles.heroTitle}>{texts.title}</Text>
                    <Text style={styles.heroSubtitle}>{texts.linkedHint}</Text>
                  </View>
                </View>

                <View style={styles.liveWrap}>
                  <View
                    style={[
                      styles.liveDot,
                      { backgroundColor: connected ? palette.accent : "#FF8C8C" },
                    ]}
                  />
                  <Text style={styles.liveText}>{connected ? texts.online : texts.connecting}</Text>
                </View>
              </View>

              <View style={styles.profileNoteCard}>
                <LinearGradient colors={raisedColors} style={styles.profileNoteFill}>
                  <Text style={styles.profileNoteText}>{texts.profileSourceNote}</Text>
                </LinearGradient>
              </View>
            </LinearGradient>
          </View>

          <View style={styles.searchCardWrap}>
            <View style={styles.searchShadow} />
            <LinearGradient colors={cardColors} style={styles.searchCard}>
              <View style={styles.cardGlass} />
              <View style={styles.searchRow}>
                <View
                  style={[
                    styles.searchIconWrap,
                    { backgroundColor: accentSoftBg, borderColor: accentBorder },
                  ]}
                >
                  <Search size={18} strokeWidth={2.3} color={palette.accentSoft} />
                </View>

                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder={texts.search}
                  placeholderTextColor={withAlpha(palette.textSecondary, 0.56)}
                  style={styles.searchInput}
                />
              </View>
            </LinearGradient>
          </View>

          <View style={styles.listWrap}>
            {filteredChannels.length === 0 ? (
              <View style={styles.emptyWrap}>
                <View style={styles.emptyShadow} />
                <LinearGradient colors={cardColors} style={styles.emptyCard}>
                  <View style={styles.cardGlass} />
                  <Text style={styles.emptyTitle}>{texts.emptyTitle}</Text>
                  <Text style={styles.emptySubtitle}>{texts.emptySubtitle}</Text>
                </LinearGradient>
              </View>
            ) : (
              filteredChannels.map((channel) => (
                <Pressable
                  key={channel.id}
                  onPress={() => void openChannel(channel)}
                  onLongPress={
                    channel.id === OFFICIAL_CHANNEL_BASE.id
                      ? undefined
                      : () => setQuickMenuChannel(channel)
                  }
                  delayLongPress={220}
                  style={({ pressed }) => [
                    styles.channelCardWrap,
                    pressed ? styles.rowPressed : undefined,
                  ]}
                >
                  <View style={styles.channelCardShadow} />
                  <LinearGradient colors={cardColors} style={styles.channelCard}>
                    <View style={styles.cardGlass} />
                    <View style={styles.channelAccentRail} />

                    {channel.avatarUri ? (
                      <Image source={{ uri: channel.avatarUri }} style={styles.channelAvatarImage} />
                    ) : (
                      <LinearGradient
                        colors={[palette.accent, accentAlt, palette.accentSoft]}
                        style={styles.channelAvatar}
                      >
                        <Text style={styles.channelAvatarText}>{channel.avatarLetter || "C"}</Text>
                      </LinearGradient>
                    )}

                    <View style={styles.channelBody}>
                      <View style={styles.channelTopRow}>
                        <View style={styles.channelTitleRow}>
                          <Text style={styles.channelName} numberOfLines={1}>
                            {channel.name}
                          </Text>
                          {channel.verified ? (
                            <BadgeCheck
                              size={15}
                              strokeWidth={2.3}
                              color={palette.accentSoft}
                              style={styles.verifiedIcon}
                            />
                          ) : null}
                          {channel.official ? (
                            <View style={styles.officialBadge}>
                              <Text style={styles.officialBadgeText}>{texts.officialBadge}</Text>
                            </View>
                          ) : null}
                        </View>

                        <Text style={styles.channelTime}>{channel.time}</Text>
                      </View>

                      {channel.handle ? (
                        <Text style={styles.channelHandle} numberOfLines={1}>
                          {channel.handle}
                        </Text>
                      ) : null}

                      <Text style={styles.channelPreview} numberOfLines={2}>
                        {channel.preview}
                      </Text>

                      <View style={styles.channelBottomRow}>
                        <View style={styles.channelMetaRow}>
                          {channel.muted ? (
                            <BellOff
                              size={13}
                              strokeWidth={2.4}
                              color="#D4DBE7"
                              style={styles.metaIcon}
                            />
                          ) : null}
                          {channel.pinned ? (
                            <Pin
                              size={13}
                              strokeWidth={2.4}
                              color="#FFE6A6"
                              style={styles.metaIcon}
                            />
                          ) : null}
                          {channel.hiddenFromMain ? (
                            <Lock
                              size={13}
                              strokeWidth={2.4}
                              color="#EFE2FF"
                              style={styles.metaIcon}
                            />
                          ) : null}
                        </View>

                        {channel.unread > 0 ? (
                          <LinearGradient
                            colors={[palette.accent, accentAlt]}
                            style={styles.unreadBadge}
                          >
                            <Text style={styles.unreadBadgeText}>{channel.unread}</Text>
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
          transparent
          animationType="fade"
          onRequestClose={() => setSettingsVisible(false)}
        >
          <View style={styles.overlayBase}>
            <Pressable style={styles.absoluteFill} onPress={() => setSettingsVisible(false)} />
            <View style={styles.settingsPanelWrap}>
              <View style={styles.popupShadow} />
              <LinearGradient
                colors={["rgba(10,18,30,0.98)", "rgba(8,16,26,0.97)"]}
                style={styles.settingsPanel}
              >
                <QuickActionRow
                  title={texts.themeWallpaper}
                  subtitle={texts.settings}
                  icon={<Palette size={17} color={palette.accentSoft} strokeWidth={2.4} />}
                  onPress={() => {
                    setSettingsVisible(false);
                    router.push("/messenger-theme" as never);
                  }}
                />
                <QuickActionRow
                  title={texts.privateChannels}
                  subtitle={texts.settings}
                  icon={<Lock size={17} color="#E8DEFF" strokeWidth={2.4} />}
                  onPress={() => setSettingsVisible(false)}
                />
              </LinearGradient>
            </View>
          </View>
        </Modal>

        <Modal
          visible={Boolean(quickMenuChannel)}
          transparent
          animationType="fade"
          onRequestClose={() => setQuickMenuChannel(null)}
        >
          <View style={styles.overlayBase}>
            <Pressable style={styles.absoluteFill} onPress={() => setQuickMenuChannel(null)} />
            <View style={styles.quickMenuWrap}>
              <View style={styles.popupShadow} />
              <LinearGradient
                colors={["rgba(10,18,30,0.98)", "rgba(8,16,26,0.97)"]}
                style={styles.quickMenuCard}
              >
                {quickMenuChannel ? (
                  <>
                    <QuickActionRow
                      title={quickMenuChannel.muted ? texts.unmute : texts.mute}
                      subtitle={texts.settings}
                      icon={
                        quickMenuChannel.muted ? (
                          <Volume2 size={17} color="#D6FFF0" strokeWidth={2.4} />
                        ) : (
                          <VolumeX size={17} color="#D6FFF0" strokeWidth={2.4} />
                        )
                      }
                      onPress={() =>
                        void runQuickAction(() =>
                          messengerKernelFacade.rooms.setMuted(quickMenuChannel.id, !quickMenuChannel.muted),
                        )
                      }
                    />
                    <QuickActionRow
                      title={quickMenuChannel.pinned ? texts.unpin : texts.pin}
                      subtitle={texts.settings}
                      icon={<Pin size={17} color="#FFE7A9" strokeWidth={2.4} />}
                      onPress={() =>
                        void runQuickAction(() =>
                          messengerKernelFacade.rooms.setPinned(quickMenuChannel.id, !quickMenuChannel.pinned),
                        )
                      }
                    />
                    <QuickActionRow
                      title={quickMenuChannel.unread > 0 ? texts.markRead : texts.markUnread}
                      subtitle={
                        quickMenuChannel.unread > 0
                          ? String(quickMenuChannel.unread)
                          : texts.workspace
                      }
                      icon={
                        quickMenuChannel.unread > 0 ? (
                          <BookCheck size={17} color="#C8FFE8" strokeWidth={2.4} />
                        ) : (
                          <BookMarked size={17} color="#C8FFE8" strokeWidth={2.4} />
                        )
                      }
                      onPress={() =>
                        void runQuickAction(() =>
                          quickMenuChannel.unread > 0
                            ? messengerKernelFacade.rooms.markRead(quickMenuChannel.id)
                            : messengerKernelFacade.rooms.markUnread(quickMenuChannel.id, 1),
                        )
                      }
                    />
                    <QuickActionRow
                      title={quickMenuChannel.hiddenFromMain ? texts.moveMain : texts.movePrivate}
                      subtitle={texts.settings}
                      icon={
                        quickMenuChannel.hiddenFromMain ? (
                          <PanelRightOpen size={17} color="#E7DDFF" strokeWidth={2.4} />
                        ) : (
                          <PanelRightClose size={17} color="#E7DDFF" strokeWidth={2.4} />
                        )
                      }
                      onPress={() =>
                        void runQuickAction(() =>
                          messengerKernelFacade.rooms.setHidden(
                            quickMenuChannel.id,
                            !quickMenuChannel.hiddenFromMain,
                          ),
                        )
                      }
                    />
                    <QuickActionRow
                      title={texts.deleteChannel}
                      subtitle={quickMenuChannel.name}
                      icon={<Trash2 size={17} color="#FFB8C4" strokeWidth={2.4} />}
                      danger
                      onPress={() =>
                        Alert.alert(texts.deleteChannel, quickMenuChannel.name, [
                          { text: texts.close, style: "cancel" },
                          {
                            text: texts.deleteChannel,
                            style: "destructive",
                            onPress: () => {
                              void runQuickAction(() =>
                                messengerKernelFacade.rooms.setDeleted(quickMenuChannel.id, true),
                              );
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
  absoluteFill: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },

  safeArea: {
    flex: 1,
    backgroundColor: "#03110E",
  },
  background: {
    flex: 1,
  },
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
    backgroundColor: "rgba(80,165,255,0.12)",
  },
  sideGlow: {
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

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  headerTitleWrap: {
    flex: 1,
    paddingHorizontal: 12,
  },
  headerEyebrow: {
    color: TEXT_SECONDARY,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  headerTitle: {
    color: TEXT_MAIN,
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
    borderColor: GLASS_BORDER,
    overflow: "hidden",
  },

  heroCardWrap: {
    borderRadius: 26,
    marginBottom: 14,
  },
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
    borderColor: GLASS_BORDER,
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
    color: TEXT_MAIN,
    fontSize: 18,
    fontWeight: "900",
  },
  heroSubtitle: {
    marginTop: 4,
    color: TEXT_SECONDARY,
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
    color: TEXT_MUTED,
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
    color: TEXT_SECONDARY,
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
    borderColor: GLASS_BORDER,
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
    color: TEXT_MAIN,
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
    borderColor: GLASS_BORDER,
    overflow: "hidden",
  },
  emptyTitle: {
    color: TEXT_MAIN,
    fontSize: 18,
    fontWeight: "900",
  },
  emptySubtitle: {
    marginTop: 8,
    color: TEXT_SECONDARY,
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
    minHeight: 126,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
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
    backgroundColor: "rgba(129,203,255,0.85)",
  },
  channelAvatar: {
    width: 50,
    height: 50,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  channelAvatarImage: {
    width: 50,
    height: 50,
    borderRadius: 18,
    marginRight: 12,
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
    color: TEXT_MAIN,
    fontSize: 17,
    fontWeight: "900",
    maxWidth: "68%",
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
  channelTime: {
    color: TEXT_MUTED,
    fontSize: 11,
    fontWeight: "800",
  },
  channelHandle: {
    marginTop: 5,
    color: "#A5FFD6",
    fontSize: 12,
    fontWeight: "800",
  },
  channelPreview: {
    marginTop: 6,
    color: TEXT_SECONDARY,
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
    backgroundColor: "rgba(2,8,13,0.40)",
  },
  settingsPanelWrap: {
    justifyContent: "center",
  },
  quickMenuWrap: {
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

  popupItem: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
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

  rowPressed: {
    transform: [{ scale: 0.988 }],
  },
  pressed: {
    transform: [{ scale: 0.986 }],
  },
  cardGlass: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(255,255,255,0.03)",
  },
});

