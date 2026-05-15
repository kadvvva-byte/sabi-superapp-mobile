
import React, { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import {
  Alert,
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
  Lock,
  PanelRightOpen,
  Pin,
  Search,
  Trash2,
  Volume2,
  VolumeX,
} from "lucide-react-native";

import { useI18n } from "../src/shared/i18n";
import {
  messengerKernelFacade,
  type MessengerKernelRoomSnapshot,
} from "../src/core/kernel/messenger/facade";
import {
  getMessengerThemePalette,
  getMessengerThemeState,
  hydrateMessengerThemeState,
  type MessengerThemePalette,
  type MessengerThemeState,
} from "../src/modules/messenger/theme/messengerThemeRuntime";
import { openMessengerRoom } from "../src/modules/messenger/navigation/messengerRoomNavigation";
import { getMessengerKernelState, subscribeMessengerKernelStore } from "../src/core/kernel/messenger/core/store";
import type { MessengerKernelPresenceEntry } from "../src/core/kernel/messenger/core/types";

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
  peerUserId?: string;
  currentUserId?: string;
  avatarUri?: string;
  avatarLetter?: string;
  roomType: RoomType;
  category: ChatCategory;
  updatedAt?: string;
  muted?: boolean;
  pinned?: boolean;
  hiddenFromMain?: boolean;
  online?: boolean;
  presenceStatus?: string | null;
  lastSeenAt?: string | null;
};

type PersistedUiMessage = {
  id?: string;
  text?: string;
  time?: string;
  previewTitle?: string;
  kind?: string;
};

type ChatRoomMetaSnapshot = MessengerKernelRoomSnapshot;

const TEXT_MAIN = "#F7FBFF";
const TEXT_SECONDARY = "rgba(236,244,255,0.76)";
const TEXT_MUTED = "rgba(214,226,244,0.56)";
const GLASS_BORDER = "rgba(255,255,255,0.10)";

function getPrivateChatsPresenceMapSnapshot() {
  return getMessengerKernelState().presenceByUserId;
}

function usePrivateChatsPresenceMapSnapshot() {
  return useSyncExternalStore(
    subscribeMessengerKernelStore,
    getPrivateChatsPresenceMapSnapshot,
    getPrivateChatsPresenceMapSnapshot,
  );
}

function readPrivateChatPresence(
  item: { peerUserId?: string; id?: string; roomType?: string },
  presenceByUserId?: Record<string, MessengerKernelPresenceEntry>,
) {
  const peerId = String(item.peerUserId ?? "").trim() || (item.roomType === "direct" ? String(item.id ?? "").trim() : "");
  return peerId ? presenceByUserId?.[peerId] ?? null : null;
}

function isPrivateChatPresenceOnline(entry?: MessengerKernelPresenceEntry | null) {
  if (!entry) return false;
  if (entry.status === "online") return true;
  if (entry.status === "offline") return false;
  return entry.isOnline === true;
}

function readPrivateChatPresenceLastSeen(entry?: MessengerKernelPresenceEntry | null) {
  const lastSeenAt = String(entry?.lastSeenAt ?? "").trim();
  if (lastSeenAt) return lastSeenAt;
  if (entry?.status === "offline") {
    const updatedAt = String(entry?.updatedAt ?? "").trim();
    if (updatedAt) return updatedAt;
  }
  return "";
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
  return source ? source.charAt(0).toUpperCase() : "•";
}

function getMessagePreview(
  message: PersistedUiMessage | undefined,
  fallback: string,
  labels: Record<string, string>,
) {
  if (!message) return fallback;
  if (typeof message.text === "string" && message.text.trim()) {
    return message.text.trim();
  }
  if (typeof message.previewTitle === "string" && message.previewTitle.trim()) {
    return message.previewTitle.trim();
  }
  return labels[message.kind || ""] || fallback;
}

async function buildRows(
  rooms: ChatRoomMetaSnapshot[],
  language: string | undefined,
  texts: Record<string, string>,
): Promise<ChatItem[]> {
  const mapped = await Promise.all(
    rooms.map(async (room) => {
      const messages = await messengerKernelFacade.listRoomPreviewMessages(room.chatId);
      const lastMessage = messages[messages.length - 1];

      const category: ChatCategory =
        room.roomType === "channel"
          ? "official"
          : room.roomType === "business"
            ? "service"
            : "direct";

      return {
        id: room.chatId,
        name: room.name,
        preview: getMessagePreview(lastMessage, texts.directPreview, {
          audio: texts.voice,
          image: texts.photo,
          video: texts.video,
          document: texts.document,
          contact: texts.contact,
          location: texts.location,
          gift: texts.gift,
        }),
        time: lastMessage?.time || formatTime(room.updatedAt, language),
        unread: 0,
        verified: Boolean(room.verified),
        official: room.roomType === "channel",
        roomType: (room.roomType as RoomType) || "direct",
        category,
        avatarLetter: room.avatarLetter || getAvatarLetter(room.name),
        updatedAt: room.updatedAt,
        phone: room.phone || (room.subtitle?.startsWith("+") ? room.subtitle : undefined),
        username: room.username || (room.subtitle?.startsWith("@") ? room.subtitle : undefined),
        peerUserId: room.peerUserId || undefined,
        currentUserId: room.currentUserId || undefined,
        avatarUri: room.avatarUrl || room.photoUrl || undefined,
      };
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
            "rgba(6,8,14,0.18)",
            "rgba(6,8,14,0.26)",
            "rgba(6,8,14,0.34)",
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
      style={({ pressed }) => [styles.popupItemWrap, pressed && styles.scalePressed]}
    >
      <LinearGradient
        colors={
          danger
            ? ["rgba(109,24,38,0.96)", "rgba(62,15,24,0.94)"]
            : ["rgba(255,255,255,0.08)", "rgba(255,255,255,0.03)"]
        }
        style={styles.popupItem}
      >
        <View style={[styles.popupIcon, danger && styles.popupIconDanger]}>
          {icon}
        </View>
        <View style={styles.popupTextWrap}>
          <Text style={[styles.popupTitle, danger && styles.popupTitleDanger]}>
            {title}
          </Text>
          {subtitle ? <Text style={styles.popupSubtitle}>{subtitle}</Text> : null}
        </View>
      </LinearGradient>
    </Pressable>
  );
}

export default function PrivateChatsScreen() {
  const params = useLocalSearchParams<{ userId?: string }>();
  const { language, t } = useI18n();

  const txAny = useCallback(
    (keys: string[], fallback = "") => {
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

  const currentUserId =
    typeof params.userId === "string" && params.userId.trim().length > 0
      ? params.userId.trim()
      : undefined;

  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<ChatItem[]>([]);
  const presenceByUserId = usePrivateChatsPresenceMapSnapshot();
  const [quickMenuChat, setQuickMenuChat] = useState<ChatItem | null>(null);
  const [themeState, setThemeState] = useState<MessengerThemeState>(
    getMessengerThemeState(),
  );

  const palette = useMemo<MessengerThemePalette>(
    () => getMessengerThemePalette(themeState.themeId),
    [themeState.themeId],
  );

  const hasWallpaper = Boolean(themeState.wallpaperUri);
  const cardColors: [string, string] = hasWallpaper
    ? ["rgba(10,15,24,0.42)", "rgba(10,15,24,0.26)"]
    : (palette.surface as [string, string]);
  const accentColors: [string, string] = [palette.accent, palette.accentSoft];
  const raisedColors: [string, string] = hasWallpaper
    ? ["rgba(255,255,255,0.08)", "rgba(255,255,255,0.03)"]
    : (palette.surfaceRaised as [string, string]);

  const texts = useMemo(
    () => ({
      title: txAny(["messenger.privateChats", "common.private"], "Private chats"),
      subtitle: txAny(["messenger.privateChatsSubtitle", "messenger.chat.hiddenChat"], "Hidden chats stay locked and private"),
      search: txAny(["messenger.searchChats", "search.chatPlaceholder", "search.placeholder"], "Chatlarda qidirish"),
      emptyTitle: txAny(["common.empty"], "No private chats"),
      emptySubtitle: txAny(
        ["messenger.chat.conversationPlaceholder"],
        "Conversation will appear here.",
      ),
      mute: txAny(["messenger.menu.mute", "messenger.muteChat"], "Mute"),
      unmute: txAny(["messenger.menu.unmute", "messenger.unmuteChat"], "Unmute"),
      pin: txAny(["messenger.pinChat"], "Pin"),
      unpin: txAny(["messenger.unpinChat"], "Unpin"),
      markRead: txAny(["status.read"], "Mark as read"),
      markUnread: txAny(["status.unread"], "Mark as unread"),
      returnToMain: txAny(["messenger.returnToChats", "common.open"], "Return to chats"),
      deleteChat: `${txAny(["common.delete"], "Delete")} ${txAny(
        ["messenger.chats", "tabs.chats"],
        "Chats",
      )}`.trim(),
      close: txAny(["common.close"], "Close"),
      settingsHint: txAny(["settings.chatSettings", "settings.title"], "Chat settings"),
      directPreview: txAny(["messenger.chat.directRoom", "tabs.chats"], "Start dialog"),
      online: txAny(["status.connected", "common.online", "messenger.chat.online"], "Online"),
      photo: txAny(["messenger.chat.photoTitle", "messenger.photo"], "Photo"),
      video: txAny(["messenger.chat.videoTitle", "messenger.video"], "Video"),
      document: txAny(["messenger.chat.documentTitle", "messenger.document"], "Document"),
      contact: txAny(["messenger.chat.contactTitle", "messenger.contact"], "Contact"),
      location: txAny(["messenger.chat.locationTitle", "messenger.location"], "Location"),
      gift: txAny(["gifts.title"], "Gift"),
      voice: txAny(["messenger.chat.voiceTitle", "messenger.voiceMessage"], "Voice"),
      hiddenTag: txAny(["messenger.privateChats", "common.private"], "Private"),
    }),
    [txAny],
  );

  const refresh = useCallback(async () => {
    const [nextTheme, rooms, profiles] = await Promise.all([
      hydrateMessengerThemeState(),
      messengerKernelFacade.listRoomSnapshots(),
      messengerKernelFacade.listRoomProfiles(),
    ]);

    setThemeState(nextTheme);

    const mapped = await buildRows(rooms, language, texts);

    const nextRows = mapped
      .map((item) => {
        const profile = profiles[item.id];
        return {
          ...item,
          unread:
            typeof profile?.unreadCount === "number"
              ? profile.unreadCount
              : item.unread,
          muted: Boolean(profile?.muted),
          pinned: Boolean(profile?.pinned),
          hiddenFromMain: Boolean(profile?.hiddenFromMain),
          phone: profile?.phone || item.phone,
          username: profile?.username || item.username,
          peerUserId: profile?.peerUserId || item.peerUserId,
          currentUserId: profile?.currentUserId || item.currentUserId,
          avatarUri: profile?.avatarUrl || profile?.photoUrl || item.avatarUri,
        };
      })
      .filter((item) => {
        const profile = profiles[item.id];
        if (profile?.deleted) return false;
        return messengerKernelFacade.isRoomHidden(profile);
      })
      .sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return String(b.updatedAt ?? "").localeCompare(String(a.updatedAt ?? ""));
      });

    setRows(nextRows);
  }, [language, texts]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return rows.filter(
      (item) =>
        !normalized ||
        item.name.toLowerCase().includes(normalized) ||
        item.preview.toLowerCase().includes(normalized) ||
        (item.username ?? "").toLowerCase().includes(normalized) ||
        (item.phone ?? "").toLowerCase().includes(normalized),
    );
  }, [query, rows]);

  const openChat = async (chat: ChatItem) => {
    const peerPresence = readPrivateChatPresence(chat, presenceByUserId);
    const peerOnline = isPrivateChatPresenceOnline(peerPresence) || chat.online === true;
    const peerLastSeenAt = readPrivateChatPresenceLastSeen(peerPresence) || chat.lastSeenAt || "";

    await openMessengerRoom({
      chatId: chat.id,
      name: chat.name,
      subtitle: chat.phone || chat.username || texts.directPreview,
      roomType: chat.roomType,
      verified: Boolean(chat.verified),
      avatarLetter: chat.avatarLetter,
      phone: chat.phone || undefined,
      username: chat.username || undefined,
      handle: chat.username || undefined,
      currentUserId: currentUserId || undefined,
      peerUserId: chat.roomType === "direct" ? chat.peerUserId || undefined : undefined,
      hiddenFromMain: true,
      status: peerOnline ? texts.online : undefined,
      presenceOnline: chat.roomType === "direct" ? (peerOnline ? "1" : "0") : undefined,
      lastSeenAt: chat.roomType === "direct" && peerLastSeenAt ? peerLastSeenAt : undefined,
      markRead: true,
    });
    await refresh();
  };

  const runQuickAction = async (action: () => Promise<void>) => {
    await action();
    setQuickMenuChat(null);
    await refresh();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right", "bottom"]}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <DecorativeBackground themeState={themeState} palette={palette}>
        {!hasWallpaper ? (
          <>
            <View style={styles.topGlow} />
            <View style={styles.bottomGlow} />
          </>
        ) : null}

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.headerRow}>
            <Pressable style={styles.headerButton} onPress={() => router.back()}>
              <View style={styles.headerButtonShadow} />
              <LinearGradient
                colors={raisedColors}
                style={styles.headerButtonFill}
              >
                <ArrowLeft size={20} color={TEXT_MAIN} strokeWidth={2.3} />
              </LinearGradient>
            </Pressable>

            <View style={styles.headerTextWrap}>
              <Text style={styles.headerTitle}>{texts.title}</Text>
              <Text style={styles.headerSubtitle}>{texts.subtitle}</Text>
            </View>

            <View style={styles.hiddenPill}>
              <Lock size={12} color={palette.accentSoft} strokeWidth={2.4} />
              <Text style={styles.hiddenPillText}>{texts.hiddenTag}</Text>
            </View>
          </View>

          <View style={styles.searchWrap}>
            <View style={styles.cardShadow} />
            <LinearGradient colors={cardColors} style={styles.searchCard}>
              <View style={styles.searchGlass} />
              <View style={styles.searchLight} />
              <Search size={18} color={TEXT_SECONDARY} strokeWidth={2.3} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder={texts.search}
                placeholderTextColor="rgba(232,255,246,0.42)"
                style={styles.searchInput}
              />
            </LinearGradient>
          </View>

          {filtered.length === 0 ? (
            <View style={styles.emptyWrap}>
              <View style={styles.cardShadow} />
              <LinearGradient colors={cardColors} style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>{texts.emptyTitle}</Text>
                <Text style={styles.emptySubtitle}>{texts.emptySubtitle}</Text>
              </LinearGradient>
            </View>
          ) : (
            filtered.map((chat) => (
              <Pressable
                key={chat.id}
                onPress={() => void openChat(chat)}
                onLongPress={() => setQuickMenuChat(chat)}
                delayLongPress={220}
                style={({ pressed }) => [styles.cardWrap, pressed && styles.scalePressed]}
              >
                <View style={styles.cardShadow} />
                {!hasWallpaper ? (
                  <View
                    style={[
                      styles.cardGlow,
                      {
                        backgroundColor: "rgba(255,255,255,0.04)",
                      },
                    ]}
                  />
                ) : null}

                <LinearGradient colors={cardColors} style={styles.card}>
                  <View style={styles.cardGlass} />
                  <View style={styles.cardShine} />
                  <View style={styles.cardTopLine} />

                  <View style={styles.accentWrap}>
                    <LinearGradient
                      colors={accentColors}
                      style={styles.accentRail}
                    />
                  </View>

                  <View style={styles.avatarWrap}>
                    <View
                      style={[
                        styles.avatarGlow,
                        {
                          backgroundColor: "rgba(255,255,255,0.10)",
                        },
                      ]}
                    />
                    <LinearGradient
                      colors={[palette.accent, palette.accentAlt, palette.accentSoft]}
                      style={styles.avatar}
                    >
                      <Text style={styles.avatarText}>{chat.avatarLetter || "•"}</Text>
                    </LinearGradient>
                  </View>

                  <View style={styles.cardBody}>
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
                              color="#FFE8A8"
                              strokeWidth={2.4}
                              style={styles.metaIcon}
                            />
                          ) : null}
                          {chat.muted ? (
                            <BellOff
                              size={13}
                              color="#D2DAE2"
                              strokeWidth={2.4}
                              style={styles.metaIcon}
                            />
                          ) : null}
                          <Lock size={13} color={palette.accentSoft} strokeWidth={2.4} />
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
            ))
          )}
        </ScrollView>

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
                      subtitle={texts.settingsHint}
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
                      subtitle={texts.settingsHint}
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
                        quickMenuChat.unread > 0
                          ? texts.markRead
                          : texts.markUnread
                      }
                      subtitle={texts.settingsHint}
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
                      title={texts.returnToMain}
                      subtitle={texts.title}
                      icon={<PanelRightOpen size={17} color="#E7DDFF" strokeWidth={2.4} />}
                      onPress={() =>
                        void runQuickAction(async () => {
                          await messengerKernelFacade.rooms.setHidden(quickMenuChat.id, false);
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
    top: -80,
    right: -40,
    width: 260,
    height: 260,
    borderRadius: 260,
    backgroundColor: "rgba(80,165,255,0.10)",
  },
  bottomGlow: {
    position: "absolute",
    bottom: -100,
    left: -80,
    width: 280,
    height: 280,
    borderRadius: 280,
    backgroundColor: "rgba(72,136,255,0.10)",
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 28,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
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
  },
  headerTextWrap: {
    flex: 1,
    paddingHorizontal: 10,
  },
  headerTitle: {
    color: TEXT_MAIN,
    fontSize: 24,
    fontWeight: "900",
  },
  headerSubtitle: {
    marginTop: 4,
    color: TEXT_SECONDARY,
    fontSize: 12,
    fontWeight: "700",
  },
  hiddenPill: {
    minHeight: 32,
    borderRadius: 999,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    backgroundColor: "rgba(255,255,255,0.06)",
    flexDirection: "row",
    alignItems: "center",
  },
  hiddenPillText: {
    marginLeft: 6,
    color: TEXT_MAIN,
    fontSize: 12,
    fontWeight: "900",
  },
  searchWrap: {
    marginTop: 14,
    borderRadius: 22,
  },
  cardShadow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 26,
    backgroundColor: "rgba(0,0,0,0.22)",
    transform: [{ translateY: 10 }, { scaleX: 0.96 }],
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
  searchGlass: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.018)",
  },
  searchLight: {
    position: "absolute",
    top: -18,
    right: -12,
    width: 100,
    height: 68,
    borderRadius: 68,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: TEXT_MAIN,
    fontSize: 15,
    fontWeight: "700",
  },
  emptyWrap: {
    marginTop: 18,
    borderRadius: 26,
  },
  emptyCard: {
    borderRadius: 26,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    paddingHorizontal: 18,
    paddingVertical: 24,
    overflow: "hidden",
    backgroundColor: "transparent",
  },
  emptyTitle: {
    color: TEXT_MAIN,
    fontSize: 16,
    fontWeight: "900",
    textAlign: "center",
  },
  emptySubtitle: {
    marginTop: 8,
    color: TEXT_SECONDARY,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  cardWrap: {
    marginTop: 12,
    borderRadius: 26,
  },
  scalePressed: {
    transform: [{ scale: 0.988 }],
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
  cardGlass: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.016)",
  },
  cardShine: {
    position: "absolute",
    top: -24,
    right: -14,
    width: 96,
    height: 62,
    borderRadius: 62,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  cardTopLine: {
    position: "absolute",
    left: 14,
    right: 14,
    top: 0,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  accentWrap: {
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
  avatarText: {
    color: "#F7FFFC",
    fontSize: 18,
    fontWeight: "900",
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
  },
  title: {
    color: TEXT_MAIN,
    fontSize: 16,
    fontWeight: "900",
    maxWidth: "76%",
  },
  verifiedIcon: {
    marginLeft: 6,
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
  overlayBase: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: "rgba(2,8,13,0.40)",
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
