import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
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
  BookCheck,
  BookMarked,
  Bot,
  Lock,
  MessageCircleMore,
  Palette,
  PanelRightClose,
  PanelRightOpen,
  Pause,
  Pin,
  Play,
  Search,
  Settings2,
  Volume2,
  VolumeX,
  X,
} from "lucide-react-native";

import { useI18n } from "../../src/shared/i18n";
import { messengerKernelFacade } from "../../src/core/kernel/messenger/facade";
import { openMessengerRoom } from "../../src/modules/messenger/navigation/messengerRoomNavigation";
import {
  compareSabiPublicDirectoryPromotion,
  listSabiPublicDirectory,
  openSabiPublicDirectoryItem,
  searchSabiPublicDirectory,
  type SabiPublicDirectoryItem,
} from "../../src/modules/messenger/public-directory";
import {
  incrementMessengerBotUnread,
  listAllMessengerBots,
  listMessengerBots,
  markMessengerBotRead,
  markMessengerBotUnread,
  searchMessengerBots,
  setMessengerBotHiddenFromMain,
  setMessengerBotMuted,
  setMessengerBotPinned,
  setMessengerBotPreview,
  type BotKind,
  type FilterMode,
  type MessengerBot,
} from "../../src/modules/messenger/bots/botsRuntime";
import {
  getMessengerThemePalette,
  getMessengerThemeState,
  hydrateMessengerThemeState,
  type MessengerThemePalette,
  type MessengerThemeState,
} from "../../src/modules/messenger/theme/messengerThemeRuntime";

type RouteParams = {
  userId?: string;
  mode?: string;
  source?: string;
};

const TEXT_MAIN = "#F8FBFF";
const TEXT_SECONDARY = "rgba(236,244,255,0.76)";

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

function getBotRouteRoomType(_kind: BotKind): "bot" {
  return "bot";
}

type SabiDirectoryMessengerBot = MessengerBot & { publicDirectoryItem?: SabiPublicDirectoryItem };

function formatSabiBotClock(value?: string | null) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return "";
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function mapSabiDirectoryBotItem(item: SabiPublicDirectoryItem): SabiDirectoryMessengerBot | null {
  const id = String(item.botId || item.id || "").trim();
  const name = String(item.title || item.name || "").trim();
  if (!id || !name) return null;

  const updatedAt = typeof item.updatedAt === "string" && item.updatedAt.trim() ? item.updatedAt.trim() : new Date().toISOString();
  const username = typeof item.username === "string" && item.username.trim() ? item.username.trim() : id;
  const handle = username.startsWith("@") ? username : `@${username.replace(/[^a-z0-9_]+/gi, "_").toLowerCase()}`;
  const description = typeof item.description === "string" && item.description.trim() ? item.description.trim() : name;

  return {
    id,
    name,
    username: handle,
    description,
    avatarLetter: String(name.charAt(0) || "B").toUpperCase(),
    kind: "assistant",
    verified: Boolean((item as any).verified || item.recommended || item.promotionPlacement === "featured"),
    official: false,
    builtIn: false,
    status: "active",
    commandsCount: 0,
    unread: 0,
    preview: description,
    time: formatSabiBotClock(updatedAt),
    updatedAt,
    muted: false,
    pinned: false,
    hiddenFromMain: false,
    deleted: false,
    linkedModules: [],
    publicDirectoryItem: item,
  };
}

function mergeSabiDirectoryBots(localItems: MessengerBot[], directoryItems: SabiDirectoryMessengerBot[]) {
  const byId = new Map<string, SabiDirectoryMessengerBot>();
  for (const item of directoryItems) byId.set(item.id, item);
  for (const item of localItems) byId.set(item.id, { ...byId.get(item.id), ...item, publicDirectoryItem: (item as SabiDirectoryMessengerBot).publicDirectoryItem || byId.get(item.id)?.publicDirectoryItem });
  return Array.from(byId.values()).sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;

    const promotionOrder = compareSabiPublicDirectoryPromotion(
      (a as SabiDirectoryMessengerBot).publicDirectoryItem,
      (b as SabiDirectoryMessengerBot).publicDirectoryItem,
    );
    if (promotionOrder !== 0) return promotionOrder;

    if (a.official && !b.official) return -1;
    if (!a.official && b.official) return 1;
    return String(b.updatedAt).localeCompare(String(a.updatedAt));
  });
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
            withAlpha(palette.background[0] || "#06080E", 0.3),
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
  palette,
  colors,
  danger = false,
}: {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  onPress: () => void;
  palette: MessengerThemePalette;
  colors: [string, string];
  danger?: boolean;
}) {
  const mainText = palette.textMain || TEXT_MAIN;
  const secondaryText = palette.textSecondary || TEXT_SECONDARY;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [pressed && styles.rowPressed]}>
      <LinearGradient
        colors={colors}
        style={[
          styles.popupItem,
          { borderColor: withAlpha(mainText, 0.08) },
        ]}
      >
        <View
          style={[
            styles.popupIcon,
            {
              backgroundColor: danger
                ? "rgba(255,255,255,0.08)"
                : withAlpha(mainText, 0.06),
            },
          ]}
        >
          {icon}
        </View>

        <View style={styles.popupTextWrap}>
          <Text
            style={[
              styles.popupTitle,
              { color: danger ? "#FFE9ED" : mainText },
            ]}
          >
            {title}
          </Text>
          {subtitle ? (
            <Text
              style={[
                styles.popupSubtitle,
                { color: withAlpha(secondaryText, 0.82) },
              ]}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>
      </LinearGradient>
    </Pressable>
  );
}

export default function MessengerBotsScreen() {
  const params = useLocalSearchParams<RouteParams>();
  const { t } = useI18n();

  const currentUserId =
    typeof params.userId === "string" && params.userId.trim().length > 0
      ? params.userId.trim()
      : undefined;

  const [themeState, setThemeState] = useState<MessengerThemeState>(
    getMessengerThemeState(),
  );
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [quickMenuBot, setQuickMenuBot] = useState<MessengerBot | null>(null);
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [query, setQuery] = useState("");
  const [connected, setConnected] = useState(false);

  const [bots, setBots] = useState<MessengerBot[]>([]);
  const [totalBots, setTotalBots] = useState(0);
  const [officialBots, setOfficialBots] = useState(0);
  const [customBots, setCustomBots] = useState(0);

  const palette = useMemo<MessengerThemePalette>(
    () => getMessengerThemePalette(themeState.themeId),
    [themeState.themeId],
  );

  const hasWallpaper = Boolean(themeState.wallpaperUri);
  const mainText = palette.textMain || TEXT_MAIN;
  const secondaryText = palette.textSecondary || TEXT_SECONDARY;

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

  const popupColors: [string, string] = hasWallpaper
    ? ["rgba(12,18,28,0.92)", "rgba(10,16,26,0.90)"]
    : palette.surfaceRaised;


  const accentSoftBg = withAlpha(palette.accent, hasWallpaper ? 0.14 : 0.18);
  const accentBorder = withAlpha(accentAlt, hasWallpaper ? 0.18 : 0.26);
  const surfaceBorder = withAlpha(mainText, 0.08);

  const txAny = useCallback(
    (keys: string[], fallback: string) => {
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
      title: txAny(["messenger.bots"], "Botlar"),
      eyebrow: "Sabi Messenger",
      settings: txAny(["settings.title", "common.settings"], "Sozlamalar"),
      all: txAny(["common.all"], "Hammasi"),
      privateBots: txAny(["messenger.privateBots"], "Shaxsiy botlar"),
      search: txAny(["messenger.searchBots", "common.search"], "Botlarni qidirish"),
      openChat: txAny(["common.open", "messenger.chats"], "Chatni ochish"),
      themeWallpaper: txAny(["common.theme"], "Mavzu va fon rasmi"),
      profile: txAny(["profile.title", "common.profile"], "Profil"),
      myBots: txAny(["messenger.myBots", "messenger.bots"], "Mening botlarim"),
      active: txAny(["status.active", "common.enabled"], "Faol"),
      paused: txAny(["common.pause", "status.paused"], "To‘xtatilgan"),
      draft: txAny(["status.draft"], "Qoralama"),
      mute: txAny(["messenger.muteBot", "messenger.menu.mute", "messenger.muteChat"], "Ovozsiz qilish"),
      unmute: txAny(
        ["messenger.unmuteBot", "messenger.menu.unmute", "messenger.unmuteChat"],
        "Ovozni yoqish",
      ),
      pin: txAny(["messenger.pinBot", "messenger.pinChat"], "Mahkamlash"),
      unpin: txAny(["messenger.unpinBot", "messenger.unpinChat"], "Mahkamlashni olib tashlash"),
      markRead: txAny(["status.read"], "O‘qilgan deb belgilash"),
      markUnread: txAny(["status.unread"], "O‘qilmagan deb belgilash"),
      movePrivate: txAny(["messenger.privateBots"], "Shaxsiyga ko‘chirish"),
      moveMain: txAny(["messenger.chats"], "Asosiy ro‘yxatga qaytarish"),
      close: txAny(["common.close"], "Yopish"),
      total: txAny(["common.total"], "Jami"),
      official: txAny(["common.verified", "status.verified"], "Rasmiy"),
      custom: txAny(["common.custom"], "Maxsus"),
      market: txAny(["common.market"], "Bozor"),
      delivery: txAny(["common.delivery"], "Yetkazib berish"),
      store: txAny(["common.store"], "Do‘kon"),
      support: txAny(["common.support"], "Yordam"),
      emptyTitle: txAny(["messenger.emptyBotsTitle"], "Hozircha botlar yo‘q"),
      emptySubtitle: txAny(
        ["messenger.emptyBotsSubtitle"],
        "Profildagi botlar shu yerda ko‘rinadi.",
      ),
      botChatSubtitle: txAny(["messenger.botWorkspace"], "Bot ish maydoni"),
      directoryUnavailable: txAny(["messenger.directoryUnavailable", "common.unavailable"], "Hozir ochib bo‘lmaydi"),
      directoryUnavailableMessage: txAny(
        ["messenger.directoryUnavailableMessage"],
        "Bu yozuv hozir yopilgan yoki admin tekshiruvida.",
      ),
      online: txAny(["common.online", "messenger.online"], "Onlayn"),
      connecting: txAny(["common.connecting"], "Ulanmoqda"),
      commandsUnit: txAny(["common.commands", "common.count"], "buyruqlar"),
    }),
    [txAny],
  );

  const loadBots = useCallback(async () => {
    const visible = query.trim()
      ? await searchMessengerBots(query, filterMode)
      : await listMessengerBots(filterMode);

    const all = await listAllMessengerBots();
    const directoryQuery = query.trim();
    const directoryBots = filterMode === "private"
      ? []
      : (await (directoryQuery
          ? searchSabiPublicDirectory({ kind: "BOT", query: directoryQuery })
          : listSabiPublicDirectory({ kind: "BOT", limit: 80 })))
          .map((item: SabiPublicDirectoryItem) => mapSabiDirectoryBotItem(item))
          .filter((item: SabiDirectoryMessengerBot | null): item is SabiDirectoryMessengerBot => Boolean(item));
    const mergedVisible = mergeSabiDirectoryBots(visible, directoryBots);
    const mergedAll = mergeSabiDirectoryBots(all, directoryBots);

    setBots(mergedVisible);
    setTotalBots(mergedAll.length);
    setOfficialBots(mergedAll.filter((item) => item.official).length);
    setCustomBots(mergedAll.filter((item) => !item.official).length);
  }, [filterMode, query]);

  const refreshAll = useCallback(async () => {
    await loadBots();
  }, [loadBots]);


  useFocusEffect(
    useCallback(() => {
      void hydrateMessengerThemeState().then((next) => setThemeState(next));
      void refreshAll();
    }, [refreshAll]),
  );

  useEffect(() => {
    void refreshAll();
  }, [refreshAll]);


  const handleRealtimeEvent = useCallback(
    (eventName: string, payload: unknown) => {
      const record =
        payload && typeof payload === "object"
          ? (payload as Record<string, unknown>)
          : undefined;

      const botId =
        (typeof record?.botId === "string" && record.botId.trim()) ||
        (typeof record?.id === "string" && record.id.trim()) ||
        "";

      void (async () => {

        if (!botId) return;

        const nextPreview =
          (typeof record?.preview === "string" && record.preview.trim()) ||
          (typeof record?.text === "string" && record.text.trim()) ||
          (typeof record?.title === "string" && record.title.trim()) ||
          "";

        if (eventName === "bot:status") {
          await setMessengerBotPreview(botId, nextPreview);
          await refreshAll();
          return;
        }

        if (eventName === "bot:message" || eventName === "realtime:test") {
          await setMessengerBotPreview(botId, nextPreview);
          await incrementMessengerBotUnread(botId, 1);
          await refreshAll();
        }
      })();
    },
    [refreshAll],
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

  const openBotChat = useCallback(
    async (bot: MessengerBot) => {
      const directoryItem = (bot as SabiDirectoryMessengerBot).publicDirectoryItem;
      if (directoryItem) {
        const result = await openSabiPublicDirectoryItem(directoryItem, currentUserId);
        await refreshAll();
        if (result.ok) {
          return;
        }

        Alert.alert(texts.directoryUnavailable, texts.directoryUnavailableMessage);
        return;
      }

      const nextRoomType = getBotRouteRoomType(bot.kind);

      await messengerKernelFacade.ensureRoomSnapshot({
        chatId: bot.id,
        name: bot.name,
        subtitle: bot.username || texts.botChatSubtitle,
        roomType: nextRoomType,
        verified: Boolean(bot.verified),
        avatarLetter: bot.avatarLetter,
      });

      if (bot.unread > 0) {
        await markMessengerBotRead(bot.id);
        await refreshAll();
      }

      await openMessengerRoom({
        chatId: bot.id,
        name: bot.name,
        subtitle: texts.botChatSubtitle,
        roomType: nextRoomType,
        avatarLetter: bot.avatarLetter,
        handle: bot.username,
        username: bot.username,
        isBot: "1",
        botId: bot.id,
        botHandle: bot.username,
        botKind: bot.kind,
        isBotOwnedByMe: bot.official ? "0" : "1",
        verified: Boolean(bot.verified),
        currentUserId: currentUserId || undefined,
        peerUserId: bot.id,
        markRead: true,
      });
    },
    [currentUserId, refreshAll, texts.botChatSubtitle, texts.directoryUnavailable, texts.directoryUnavailableMessage],
  );

  const runQuickAction = useCallback(
    async (action: () => Promise<unknown>) => {
      await action();
      setQuickMenuBot(null);
      await refreshAll();
    },
    [refreshAll],
  );

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: palette.background[0] || "#03110E" }]}
      edges={["top", "left", "right", "bottom"]}
    >
      <DecorativeBackground themeState={themeState} palette={palette}>
        {!hasWallpaper ? (
          <>
            <View
              style={[styles.topGlow, { backgroundColor: withAlpha(palette.accent, 0.18) }]}
            />
            <View
              style={[styles.sideGlow, { backgroundColor: withAlpha(accentAlt, 0.14) }]}
            />
            <View
              style={[
                styles.bottomGlow,
                { backgroundColor: withAlpha(palette.accentSoft, 0.12) },
              ]}
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
                <View style={[styles.headerButtonOuter, pressed && styles.pressed]}>
                  <View style={styles.headerButtonShadow} />
                  <LinearGradient
                    colors={raisedColors}
                    style={[styles.headerButtonFill, { borderColor: surfaceBorder }]}
                  >
                    <ArrowLeft size={20} strokeWidth={2.3} color={mainText} />
                  </LinearGradient>
                </View>
              )}
            </Pressable>

            <View style={styles.headerTitleWrap}>
              <Text
                style={[
                  styles.headerEyebrow,
                  { color: withAlpha(secondaryText, 0.78) },
                ]}
              >
                {texts.eyebrow}
              </Text>
              <Text style={[styles.headerTitle, { color: mainText }]}>{texts.title}</Text>
            </View>

            <Pressable style={styles.headerButtonWrap} onPress={() => setSettingsVisible(true)}>
              {({ pressed }) => (
                <View style={[styles.headerButtonOuter, pressed && styles.pressed]}>
                  <View style={styles.headerButtonShadow} />
                  <LinearGradient
                    colors={raisedColors}
                    style={[styles.headerButtonFill, { borderColor: surfaceBorder }]}
                  >
                    <Settings2 size={19} strokeWidth={2.3} color={mainText} />
                  </LinearGradient>
                </View>
              )}
            </Pressable>
          </View>

          <View style={styles.heroCardWrap}>
            <View style={styles.heroShadow} />
            <LinearGradient
              colors={cardColors}
              style={[styles.heroCard, { borderColor: surfaceBorder }]}
            >
              <View style={styles.cardGlass} />

              <View style={styles.heroTopRow}>
                <View style={styles.heroBrandWrap}>
                  <LinearGradient
                    colors={[palette.accent, accentAlt, palette.accentSoft]}
                    style={styles.heroSticker}
                  >
                    <Bot size={24} strokeWidth={2.3} color="#071711" />
                  </LinearGradient>

                  <View style={styles.heroTextWrap}>
                    <Text style={[styles.heroTitle, { color: mainText }]}>
                      {texts.title}
                    </Text>
                    <Text
                      style={[
                        styles.heroSubtitle,
                        { color: withAlpha(secondaryText, 0.82) },
                      ]}
                    >
                      {texts.botChatSubtitle}
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
                  <Text
                    style={[
                      styles.liveText,
                      { color: withAlpha(secondaryText, 0.76) },
                    ]}
                  >
                    {connected ? texts.online : texts.connecting}
                  </Text>
                </View>
              </View>

              <View style={styles.statsRow}>
                <LinearGradient
                  colors={raisedColors}
                  style={[styles.statCard, { borderColor: surfaceBorder }]}
                >
                  <Text style={[styles.statValue, { color: mainText }]}>{totalBots}</Text>
                  <Text
                    style={[
                      styles.statLabel,
                      { color: withAlpha(secondaryText, 0.82) },
                    ]}
                  >
                    {texts.total}
                  </Text>
                </LinearGradient>

                <LinearGradient
                  colors={raisedColors}
                  style={[styles.statCard, { borderColor: surfaceBorder }]}
                >
                  <Text style={[styles.statValue, { color: mainText }]}>{officialBots}</Text>
                  <Text
                    style={[
                      styles.statLabel,
                      { color: withAlpha(secondaryText, 0.82) },
                    ]}
                  >
                    {texts.official}
                  </Text>
                </LinearGradient>

                <LinearGradient
                  colors={raisedColors}
                  style={[styles.statCard, { borderColor: surfaceBorder }]}
                >
                  <Text style={[styles.statValue, { color: mainText }]}>{customBots}</Text>
                  <Text
                    style={[
                      styles.statLabel,
                      { color: withAlpha(secondaryText, 0.82) },
                    ]}
                  >
                    {texts.custom}
                  </Text>
                </LinearGradient>
              </View>
            </LinearGradient>
          </View>

          <View style={styles.searchCardWrap}>
            <View style={styles.searchShadow} />
            <LinearGradient
              colors={cardColors}
              style={[styles.searchCard, { borderColor: surfaceBorder }]}
            >
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
                  placeholderTextColor={withAlpha(secondaryText, 0.56)}
                  style={[styles.searchInput, { color: mainText }]}
                />
              </View>

              <View style={styles.segmentRow}>
                <Pressable onPress={() => setFilterMode("all")} style={styles.segmentWrap}>
                  <LinearGradient
                    colors={filterMode === "all" ? raisedColors : cardColors}
                    style={[
                      styles.segmentButton,
                      {
                        borderColor:
                          filterMode === "all" ? accentBorder : surfaceBorder,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.segmentText,
                        {
                          color:
                            filterMode === "all"
                              ? palette.accentSoft
                              : secondaryText,
                        },
                      ]}
                    >
                      {texts.all}
                    </Text>
                  </LinearGradient>
                </Pressable>

                <Pressable
                  onPress={() => setFilterMode("private")}
                  style={styles.segmentWrap}
                >
                  <LinearGradient
                    colors={filterMode === "private" ? raisedColors : cardColors}
                    style={[
                      styles.segmentButton,
                      {
                        borderColor:
                          filterMode === "private" ? accentBorder : surfaceBorder,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.segmentText,
                        {
                          color:
                            filterMode === "private"
                              ? palette.accentSoft
                              : secondaryText,
                        },
                      ]}
                    >
                      {texts.privateBots}
                    </Text>
                  </LinearGradient>
                </Pressable>
              </View>
            </LinearGradient>
          </View>

          <View style={styles.listWrap}>
            {bots.length === 0 ? (
              <View style={styles.emptyWrap}>
                <View style={styles.emptyShadow} />
                <LinearGradient
                  colors={cardColors}
                  style={[styles.emptyCard, { borderColor: surfaceBorder }]}
                >
                  <View style={styles.cardGlass} />
                  <Text style={[styles.emptyTitle, { color: mainText }]}>
                    {texts.emptyTitle}
                  </Text>
                  <Text
                    style={[
                      styles.emptySubtitle,
                      { color: withAlpha(secondaryText, 0.82) },
                    ]}
                  >
                    {texts.emptySubtitle}
                  </Text>
                </LinearGradient>
              </View>
            ) : (
              bots.map((bot) => (
                <Pressable
                  key={bot.id}
                  onPress={() => void openBotChat(bot)}
                  onLongPress={() => setQuickMenuBot(bot)}
                  delayLongPress={220}
                  style={({ pressed }) => [styles.botCardWrap, pressed && styles.rowPressed]}
                >
                  <View style={styles.botCardShadow} />
                  <LinearGradient
                    colors={cardColors}
                    style={[styles.botCard, { borderColor: surfaceBorder }]}
                  >
                    <View style={styles.cardGlass} />

                    <View
                      style={[
                        styles.botAccentRail,
                        {
                          backgroundColor:
                            bot.kind === "business"
                              ? "#FFCC66"
                              : bot.kind === "service"
                                ? "#88C9FF"
                                : palette.accent,
                        },
                      ]}
                    />

                    <LinearGradient
                      colors={
                        bot.kind === "business"
                          ? ["#7A5A15", "#D8A532", "#FFE7A1"]
                          : bot.kind === "service"
                            ? ["#24539A", "#4F9FFF", "#C5E1FF"]
                            : [palette.accent, accentAlt, palette.accentSoft]
                      }
                      style={styles.botAvatar}
                    >
                      <Text style={styles.botAvatarText}>{bot.avatarLetter}</Text>
                    </LinearGradient>

                    <View style={styles.botBody}>
                      <View style={styles.botTopRow}>
                        <View style={styles.botTitleRow}>
                          <Text style={[styles.botName, { color: mainText }]} numberOfLines={1}>
                            {bot.name}
                          </Text>

                          {bot.verified ? (
                            <BadgeCheck
                              size={15}
                              strokeWidth={2.3}
                              color={palette.accentSoft}
                              style={styles.verifiedIcon}
                            />
                          ) : null}

                          {bot.official ? (
                            <View
                              style={[
                                styles.officialPill,
                                {
                                  backgroundColor: withAlpha(mainText, 0.06),
                                  borderColor: withAlpha(mainText, 0.10),
                                },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.officialPillText,
                                  { color: mainText },
                                ]}
                              >
                                {texts.official}
                              </Text>
                            </View>
                          ) : null}
                        </View>

                        <Text
                          style={[
                            styles.botTime,
                            { color: withAlpha(secondaryText, 0.72) },
                          ]}
                        >
                          {bot.time}
                        </Text>
                      </View>

                      <Text
                        style={[styles.botHandle, { color: palette.accentSoft }]}
                        numberOfLines={1}
                      >
                        {bot.username}
                      </Text>

                      <Text
                        style={[
                          styles.botDescription,
                          { color: withAlpha(secondaryText, 0.82) },
                        ]}
                        numberOfLines={2}
                      >
                        {bot.description || bot.preview}
                      </Text>

                      <View style={styles.moduleRow}>
                        {bot.linkedModules.map((module) => {
                          const label =
                            module === "market"
                              ? texts.market
                              : module === "delivery"
                                ? texts.delivery
                                : module === "store"
                                  ? texts.store
                                  : texts.support;

                          return (
                            <View
                              key={`${bot.id}-${module}`}
                              style={[
                                styles.moduleChip,
                                {
                                  backgroundColor: withAlpha(mainText, 0.06),
                                  borderColor: withAlpha(mainText, 0.08),
                                },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.moduleChipText,
                                  { color: mainText },
                                ]}
                              >
                                {label}
                              </Text>
                            </View>
                          );
                        })}
                      </View>

                      <View style={styles.botBottomRow}>
                        <View style={styles.botMetaRow}>
                          <View
                            style={[
                              styles.statusPill,
                              {
                                backgroundColor: withAlpha(mainText, 0.06),
                                borderColor: withAlpha(mainText, 0.10),
                              },
                            ]}
                          >
                            {bot.status === "paused" ? (
                              <Pause size={11} strokeWidth={2.3} color="#FFEAB3" />
                            ) : bot.status === "draft" ? (
                              <Settings2 size={11} strokeWidth={2.3} color="#D7F2FF" />
                            ) : (
                              <Play size={11} strokeWidth={2.3} color="#C9FFE9" />
                            )}

                            <Text
                              style={[
                                styles.statusPillText,
                                { color: mainText },
                              ]}
                            >
                              {bot.status === "paused"
                                ? texts.paused
                                : bot.status === "draft"
                                  ? texts.draft
                                  : texts.active}
                            </Text>
                          </View>

                          <Text
                            style={[
                              styles.commandsText,
                              { color: withAlpha(secondaryText, 0.76) },
                            ]}
                          >
                            {bot.commandsCount} {texts.commandsUnit}
                          </Text>

                          {bot.muted ? (
                            <VolumeX
                              size={13}
                              strokeWidth={2.4}
                              color="#D4DBE7"
                              style={styles.metaIcon}
                            />
                          ) : null}
                          {bot.pinned ? (
                            <Pin
                              size={13}
                              strokeWidth={2.4}
                              color="#FFE6A6"
                              style={styles.metaIcon}
                            />
                          ) : null}
                          {bot.hiddenFromMain ? (
                            <Lock
                              size={13}
                              strokeWidth={2.4}
                              color="#EFE2FF"
                              style={styles.metaIcon}
                            />
                          ) : null}
                        </View>

                        {bot.unread > 0 ? (
                          <LinearGradient
                            colors={[palette.accent, accentAlt]}
                            style={styles.unreadBadge}
                          >
                            <Text style={styles.unreadBadgeText}>{bot.unread}</Text>
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
            <LinearGradient colors={palette.background} style={StyleSheet.absoluteFill} />
            <Pressable style={StyleSheet.absoluteFill} onPress={() => setSettingsVisible(false)} />

            <View style={styles.settingsPanelWrap}>
              <View style={styles.popupShadow} />
              <LinearGradient
                colors={popupColors}
                style={[styles.settingsPanel, { borderColor: withAlpha(mainText, 0.10) }]}
              >
                <QuickActionRow
                  title={texts.themeWallpaper}
                  subtitle={texts.settings}
                  icon={<Palette size={17} color={palette.accentSoft} strokeWidth={2.4} />}
                  onPress={() => {
                    setSettingsVisible(false);
                    router.push("/messenger-theme" as never);
                  }}
                  palette={palette}
                  colors={raisedColors}
                />

                <QuickActionRow
                  title={filterMode === "private" ? texts.myBots : texts.privateBots}
                  subtitle={texts.settings}
                  icon={
                    filterMode === "private" ? (
                      <PanelRightOpen size={17} color="#E7DDFF" strokeWidth={2.4} />
                    ) : (
                      <PanelRightClose size={17} color="#E7DDFF" strokeWidth={2.4} />
                    )
                  }
                  onPress={() => {
                    setSettingsVisible(false);
                    setFilterMode((current) => (current === "private" ? "all" : "private"));
                  }}
                  palette={palette}
                  colors={raisedColors}
                />

                <QuickActionRow
                  title={texts.profile}
                  subtitle={texts.settings}
                  icon={<Settings2 size={17} color="#D6FFF0" strokeWidth={2.4} />}
                  onPress={() => {
                    setSettingsVisible(false);
                    router.push("/profile" as never);
                  }}
                  palette={palette}
                  colors={raisedColors}
                />

                <Pressable onPress={() => setSettingsVisible(false)} style={styles.closeWrap}>
                  {({ pressed }) => (
                    <LinearGradient
                      colors={raisedColors}
                      style={[
                        styles.closeCard,
                        { borderColor: surfaceBorder },
                        pressed && styles.pressed,
                      ]}
                    >
                      <View
                        style={[
                          styles.closeIcon,
                          { backgroundColor: withAlpha(mainText, 0.06) },
                        ]}
                      >
                        <X size={16} color={mainText} strokeWidth={2.4} />
                      </View>
                      <Text style={[styles.closeText, { color: mainText }]}>
                        {texts.close}
                      </Text>
                    </LinearGradient>
                  )}
                </Pressable>
              </LinearGradient>
            </View>
          </View>
        </Modal>


        <Modal
          visible={Boolean(quickMenuBot)}
          transparent
          animationType="fade"
          onRequestClose={() => setQuickMenuBot(null)}
        >
          <View style={styles.overlayBase}>
            <LinearGradient colors={palette.background} style={StyleSheet.absoluteFill} />
            <Pressable style={StyleSheet.absoluteFill} onPress={() => setQuickMenuBot(null)} />

            <View style={styles.quickMenuWrap}>
              <View style={styles.popupShadow} />
              <LinearGradient
                colors={popupColors}
                style={[styles.quickMenuCard, { borderColor: withAlpha(mainText, 0.10) }]}
              >
                {quickMenuBot ? (
                  <>
                    <QuickActionRow
                      title={texts.openChat}
                      subtitle={quickMenuBot.name}
                      icon={<MessageCircleMore size={17} color="#D6FFF0" strokeWidth={2.4} />}
                      onPress={() => {
                        setQuickMenuBot(null);
                        void openBotChat(quickMenuBot);
                      }}
                      palette={palette}
                      colors={raisedColors}
                    />

                    <QuickActionRow
                      title={quickMenuBot.muted ? texts.unmute : texts.mute}
                      subtitle={texts.settings}
                      icon={
                        quickMenuBot.muted ? (
                          <Volume2 size={17} color="#D6FFF0" strokeWidth={2.4} />
                        ) : (
                          <VolumeX size={17} color="#D6FFF0" strokeWidth={2.4} />
                        )
                      }
                      onPress={() =>
                        void runQuickAction(() =>
                          setMessengerBotMuted(quickMenuBot.id, !quickMenuBot.muted),
                        )
                      }
                      palette={palette}
                      colors={raisedColors}
                    />

                    <QuickActionRow
                      title={quickMenuBot.pinned ? texts.unpin : texts.pin}
                      subtitle={texts.settings}
                      icon={<Pin size={17} color="#FFE7A9" strokeWidth={2.4} />}
                      onPress={() =>
                        void runQuickAction(() =>
                          setMessengerBotPinned(quickMenuBot.id, !quickMenuBot.pinned),
                        )
                      }
                      palette={palette}
                      colors={raisedColors}
                    />

                    <QuickActionRow
                      title={quickMenuBot.unread > 0 ? texts.markRead : texts.markUnread}
                      subtitle={
                        quickMenuBot.unread > 0
                          ? String(quickMenuBot.unread)
                          : texts.active
                      }
                      icon={
                        quickMenuBot.unread > 0 ? (
                          <BookCheck size={17} color="#C8FFE8" strokeWidth={2.4} />
                        ) : (
                          <BookMarked size={17} color="#C8FFE8" strokeWidth={2.4} />
                        )
                      }
                      onPress={() =>
                        void runQuickAction(() =>
                          quickMenuBot.unread > 0
                            ? markMessengerBotRead(quickMenuBot.id)
                            : markMessengerBotUnread(quickMenuBot.id, 1),
                        )
                      }
                      palette={palette}
                      colors={raisedColors}
                    />

                    <QuickActionRow
                      title={quickMenuBot.hiddenFromMain ? texts.moveMain : texts.movePrivate}
                      subtitle={texts.settings}
                      icon={
                        quickMenuBot.hiddenFromMain ? (
                          <PanelRightOpen size={17} color="#E7DDFF" strokeWidth={2.4} />
                        ) : (
                          <PanelRightClose size={17} color="#E7DDFF" strokeWidth={2.4} />
                        )
                      }
                      onPress={() =>
                        void runQuickAction(() =>
                          setMessengerBotHiddenFromMain(
                            quickMenuBot.id,
                            !quickMenuBot.hiddenFromMain,
                          ),
                        )
                      }
                      palette={palette}
                      colors={raisedColors}
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

const styles: any = StyleSheet.create({
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
  heroCardWrap: { borderRadius: 26, marginBottom: 14 },
  heroShadow: {
    ...StyleSheet.absoluteFillObject,
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
  heroBrandWrap: {
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
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 16,
  },
  statCard: {
    flex: 1,
    minHeight: 70,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  statValue: {
    fontSize: 22,
    fontWeight: "900",
  },
  statLabel: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "700",
  },
  searchCardWrap: {
    borderRadius: 24,
    marginBottom: 14,
  },
  searchShadow: {
    ...StyleSheet.absoluteFillObject,
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
  segmentRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  segmentWrap: {
    flex: 1,
  },
  segmentButton: {
    minHeight: 38,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  segmentText: {
    fontSize: 13,
    fontWeight: "800",
  },
  listWrap: {
    paddingBottom: 18,
  },
  emptyWrap: {
    borderRadius: 24,
  },
  emptyShadow: {
    ...StyleSheet.absoluteFillObject,
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
  botCardWrap: {
    borderRadius: 26,
    marginBottom: 12,
  },
  botCardShadow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 26,
    backgroundColor: "rgba(0,0,0,0.22)",
    transform: [{ translateY: 9 }, { scaleX: 0.96 }],
  },
  botCard: {
    minHeight: 136,
    borderRadius: 26,
    borderWidth: 1,
    overflow: "hidden",
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  botAccentRail: {
    position: "absolute",
    left: 0,
    top: 18,
    bottom: 18,
    width: 5,
    borderTopRightRadius: 999,
    borderBottomRightRadius: 999,
  },
  botAvatar: {
    width: 50,
    height: 50,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  botAvatarText: {
    color: "#071711",
    fontSize: 18,
    fontWeight: "900",
  },
  botBody: {
    flex: 1,
    minWidth: 0,
  },
  botTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  botTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 8,
  },
  botName: {
    fontSize: 17,
    fontWeight: "900",
    maxWidth: "68%",
  },
  verifiedIcon: {
    marginLeft: 6,
  },
  officialPill: {
    marginLeft: 8,
    minHeight: 20,
    borderRadius: 999,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  officialPillText: {
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  botTime: {
    fontSize: 11,
    fontWeight: "800",
  },
  botHandle: {
    marginTop: 5,
    fontSize: 12,
    fontWeight: "800",
  },
  botDescription: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
  },
  moduleRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 9,
  },
  moduleChip: {
    minHeight: 22,
    borderRadius: 999,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  moduleChipText: {
    fontSize: 10,
    fontWeight: "800",
  },
  botBottomRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  botMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    flex: 1,
    paddingRight: 10,
  },
  statusPill: {
    minHeight: 24,
    borderRadius: 999,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    marginRight: 8,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: "900",
  },
  commandsText: {
    fontSize: 11,
    fontWeight: "800",
    marginRight: 8,
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
    backgroundColor: "transparent",
  },
  settingsPanelWrap: {
    justifyContent: "center",
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
    borderRadius: 24,
    borderWidth: 1,
    padding: 10,
    overflow: "hidden",
  },
  quickMenuCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 10,
    overflow: "hidden",
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
  closeWrap: {
    borderRadius: 16,
    marginTop: 10,
  },
  closeCard: {
    borderRadius: 16,
    borderWidth: 1,
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
  },
  closeText: {
    fontSize: 14,
    fontWeight: "900",
  },
  cardGlass: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  pressed: {
    transform: [{ scale: 0.986 }],
  },
  rowPressed: {
    transform: [{ scale: 0.988 }],
  },
});
