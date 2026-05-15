import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  ImageBackground,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
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
  BriefcaseBusiness,
  ChevronDown,
  ChevronUp,
  MessageCircleMore,
  Pause,
  Pin,
  Play,
  Plus,
  Save,
  ShoppingBag,
  ShieldCheck,
  Store,
  Trash2,
  Truck,
  Volume2,
  VolumeX,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react-native";

import { useI18n } from "../../../src/shared/i18n";
import { openMessengerRoom } from "../../../src/modules/messenger/navigation/messengerRoomNavigation";
import {
  createOrUpdateMessengerBot,
  getMessengerBotById,
  setMessengerBotDeleted,
  setMessengerBotMuted,
  setMessengerBotPinned,
  setMessengerBotStatus,
  type BotKind,
  type BotModule,
  type MessengerBot,
} from "../../../src/modules/messenger/bots/botsRuntime";
import {
  createOrUpdateBotCommand,
  deleteBotCommand,
  listBotCommands,
  moveBotCommand,
  type BotCommandItem,
} from "../../../src/modules/messenger/bots/botCommandsRuntime";
import {
  getMessengerThemePalette,
  getMessengerThemeState,
  hydrateMessengerThemeState,
  type MessengerThemePalette,
  type MessengerThemeState,
} from "../../../src/modules/messenger/theme/messengerThemeRuntime";

type RouteParams = {
  id?: string;
  botId?: string;
  userId?: string;
};

const TEXT_MAIN = "#F8FBFF";
const TEXT_SECONDARY = "rgba(236,244,255,0.76)";
const DEFAULT_BOT_MODULES: BotModule[] = ["market"];

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

function normalizeHandle(value?: string | null) {
  const raw = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/^@+/, "")
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return raw ? `@${raw}` : "";
}

function normalizeCommand(value?: string | null) {
  const raw = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/^\/+/, "")
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return raw ? `/${raw}` : "";
}

function getBotRouteRoomType(kind: BotKind): "direct" | "business" {
  return kind === "business" ? "business" : "direct";
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

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  palette,
  raisedColors,
  multiline = false,
  keyboardType = "default",
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  palette: MessengerThemePalette;
  raisedColors: [string, string];
  multiline?: boolean;
  keyboardType?: "default" | "numeric";
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={[styles.fieldLabel, { color: palette.textMain || TEXT_MAIN }]}>
        {label}
      </Text>

      <LinearGradient
        colors={raisedColors}
        style={[
          styles.fieldCard,
          { borderColor: withAlpha(palette.textMain || TEXT_MAIN, 0.08) },
        ]}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={withAlpha(
            palette.textSecondary || TEXT_SECONDARY,
            0.48,
          )}
          style={[
            styles.fieldInput,
            { color: palette.textMain || TEXT_MAIN },
            multiline && styles.fieldInputMultiline,
          ]}
          multiline={multiline}
          keyboardType={keyboardType}
          textAlignVertical={multiline ? "top" : "center"}
        />
      </LinearGradient>
    </View>
  );
}

function StatCard({
  title,
  value,
  palette,
  raisedColors,
}: {
  title: string;
  value: string;
  palette: MessengerThemePalette;
  raisedColors: [string, string];
}) {
  return (
    <LinearGradient
      colors={raisedColors}
      style={[
        styles.statCard,
        { borderColor: withAlpha(palette.textMain || TEXT_MAIN, 0.08) },
      ]}
    >
      <Text
        style={[
          styles.statLabel,
          { color: withAlpha(palette.textSecondary || TEXT_SECONDARY, 0.74) },
        ]}
      >
        {title}
      </Text>
      <Text style={[styles.statValue, { color: palette.textMain || TEXT_MAIN }]}>
        {value}
      </Text>
    </LinearGradient>
  );
}

function ActionCard({
  title,
  subtitle,
  icon: Icon,
  onPress,
  palette,
  colors,
  accent = false,
}: {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  onPress: () => void;
  palette: MessengerThemePalette;
  colors: [string, string];
  accent?: boolean;
}) {
  const iconBg = accent
    ? withAlpha(palette.accentSoft || "#8FD8FF", 0.14)
    : withAlpha(palette.textMain || TEXT_MAIN, 0.08);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.actionCardWrap, pressed && styles.pressed]}
    >
      <LinearGradient
        colors={colors}
        style={[
          styles.actionCard,
          { borderColor: withAlpha(palette.textMain || TEXT_MAIN, 0.08) },
        ]}
      >
        <View style={[styles.actionIcon, { backgroundColor: iconBg }]}>
          <Icon size={18} color={palette.textMain || TEXT_MAIN} strokeWidth={2.3} />
        </View>
        <Text style={[styles.actionTitle, { color: palette.textMain || TEXT_MAIN }]}>
          {title}
        </Text>
        <Text
          style={[
            styles.actionSubtitle,
            { color: withAlpha(palette.textSecondary || TEXT_SECONDARY, 0.82) },
          ]}
        >
          {subtitle}
        </Text>
      </LinearGradient>
    </Pressable>
  );
}

function ModuleToggle({
  label,
  active,
  icon: Icon,
  onPress,
  palette,
  accentAlt,
  raisedColors,
}: {
  label: string;
  active: boolean;
  icon: LucideIcon;
  onPress: () => void;
  palette: MessengerThemePalette;
  accentAlt: string;
  raisedColors: [string, string];
}) {
  return (
    <Pressable onPress={onPress} style={styles.moduleToggleWrap}>
      <LinearGradient
        colors={active ? [palette.accent, accentAlt] : raisedColors}
        style={[
          styles.moduleToggle,
          { borderColor: withAlpha(palette.textMain || TEXT_MAIN, 0.08) },
        ]}
      >
        <Icon
          size={14}
          color={active ? "#071711" : palette.textMain || TEXT_MAIN}
          strokeWidth={2.3}
        />
        <Text
          style={[
            styles.moduleToggleText,
            { color: active ? "#071711" : palette.textMain || TEXT_MAIN },
          ]}
        >
          {label}
        </Text>
      </LinearGradient>
    </Pressable>
  );
}

function CommandCard({
  item,
  onEdit,
  onMoveUp,
  onMoveDown,
  onDelete,
  palette,
  raisedColors,
}: {
  item: BotCommandItem;
  onEdit: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  palette: MessengerThemePalette;
  raisedColors: [string, string];
}) {
  return (
    <LinearGradient
      colors={raisedColors}
      style={[
        styles.commandCard,
        { borderColor: withAlpha(palette.textMain || TEXT_MAIN, 0.08) },
      ]}
    >
      <Pressable onPress={onEdit} style={({ pressed }) => [pressed && styles.pressed]}>
        <View style={styles.commandTopRow}>
          <View
            style={[
              styles.commandHandlePill,
              {
                backgroundColor: withAlpha(palette.accentSoft || "#8FD8FF", 0.16),
                borderColor: withAlpha(palette.accentSoft || "#8FD8FF", 0.18),
              },
            ]}
          >
            <Text style={[styles.commandHandleText, { color: palette.textMain || TEXT_MAIN }]}>
              {item.command}
            </Text>
          </View>

          <View
            style={[
              styles.commandStatePill,
              {
                backgroundColor: withAlpha(palette.textMain || TEXT_MAIN, 0.06),
                borderColor: withAlpha(palette.textMain || TEXT_MAIN, 0.08),
              },
            ]}
          >
            <Text style={[styles.commandStateText, { color: palette.textMain || TEXT_MAIN }]}>
              {item.enabled ? "Yoqilgan" : "O‘chirilgan"}
            </Text>
          </View>
        </View>

        <Text style={[styles.commandTitle, { color: palette.textMain || TEXT_MAIN }]}>
          {item.title}
        </Text>
        <Text
          style={[
            styles.commandDescription,
            { color: withAlpha(palette.textSecondary || TEXT_SECONDARY, 0.82) },
          ]}
        >
          {item.description || "—"}
        </Text>
      </Pressable>

      <View style={styles.commandActionsRow}>
        <Pressable
          onPress={onMoveUp}
          style={[
            styles.commandMiniButton,
            {
              backgroundColor: withAlpha(palette.textMain || TEXT_MAIN, 0.06),
              borderColor: withAlpha(palette.textMain || TEXT_MAIN, 0.08),
            },
          ]}
        >
          <ChevronUp size={16} color={palette.textMain || TEXT_MAIN} strokeWidth={2.4} />
        </Pressable>

        <Pressable
          onPress={onMoveDown}
          style={[
            styles.commandMiniButton,
            {
              backgroundColor: withAlpha(palette.textMain || TEXT_MAIN, 0.06),
              borderColor: withAlpha(palette.textMain || TEXT_MAIN, 0.08),
            },
          ]}
        >
          <ChevronDown size={16} color={palette.textMain || TEXT_MAIN} strokeWidth={2.4} />
        </Pressable>

        <Pressable
          onPress={onEdit}
          style={[
            styles.commandMiniButton,
            {
              backgroundColor: withAlpha(palette.textMain || TEXT_MAIN, 0.06),
              borderColor: withAlpha(palette.textMain || TEXT_MAIN, 0.08),
            },
          ]}
        >
          <Save size={14} color={palette.textMain || TEXT_MAIN} strokeWidth={2.4} />
        </Pressable>

        <Pressable
          onPress={onDelete}
          style={[
            styles.commandMiniButton,
            styles.commandMiniDanger,
            {
              backgroundColor: "rgba(109,24,38,0.32)",
              borderColor: "rgba(255,184,196,0.18)",
            },
          ]}
        >
          <Trash2 size={15} color="#FFE9ED" strokeWidth={2.4} />
        </Pressable>
      </View>
    </LinearGradient>
  );
}

export default function BotOwnerManagementScreen() {
  const params = useLocalSearchParams<RouteParams>();
  const { t } = useI18n();

  const botId =
    typeof params.id === "string" && params.id.trim()
      ? params.id.trim()
      : typeof params.botId === "string" && params.botId.trim()
        ? params.botId.trim()
        : "";

  const currentUserId =
    typeof params.userId === "string" && params.userId.trim()
      ? params.userId.trim()
      : undefined;

  const [themeState, setThemeState] = useState<MessengerThemeState>(
    getMessengerThemeState(),
  );
  const [bot, setBot] = useState<MessengerBot | null>(null);
  const [commands, setCommands] = useState<BotCommandItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [commandModalVisible, setCommandModalVisible] = useState(false);
  const [editingCommandId, setEditingCommandId] = useState<string | null>(null);
  const [commandValue, setCommandValue] = useState("");
  const [commandTitle, setCommandTitle] = useState("");
  const [commandDescription, setCommandDescription] = useState("");
  const [commandEnabled, setCommandEnabled] = useState(true);

  const [formName, setFormName] = useState("");
  const [formHandle, setFormHandle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formCommands, setFormCommands] = useState("1");
  const [formKind, setFormKind] = useState<BotKind>("assistant");
  const [formVerified, setFormVerified] = useState(false);
  const [formPrivate, setFormPrivate] = useState(false);
  const [formModules, setFormModules] = useState<BotModule[]>(DEFAULT_BOT_MODULES);

  const palette = useMemo<MessengerThemePalette>(
    () => getMessengerThemePalette(themeState.themeId),
    [themeState.themeId],
  );

  const hasWallpaper = Boolean(themeState.wallpaperUri);
  const accentAlt =
    typeof (palette as MessengerThemePalette & { accentAlt?: string }).accentAlt ===
    "string"
      ? (palette as MessengerThemePalette & { accentAlt?: string }).accentAlt!
      : palette.accentSoft;

  const cardColors: [string, string] = hasWallpaper
    ? ["rgba(10,15,24,0.28)", "rgba(10,15,24,0.16)"]
    : palette.surface;

  const raisedColors: [string, string] = hasWallpaper
    ? ["rgba(255,255,255,0.06)", "rgba(255,255,255,0.02)"]
    : palette.surfaceRaised;

  const accentCardColors: [string, string] = [
    withAlpha(palette.accent || "#5ED9B5", hasWallpaper ? 0.22 : 0.2),
    withAlpha(accentAlt || palette.accentSoft || "#7BC8FF", hasWallpaper ? 0.14 : 0.12),
  ];

  const txAny = React.useCallback(
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
      title: txAny(["messenger.botOwnerPanel"], "Bot egasi paneli"),
      subtitle: txAny(
        ["messenger.botOwnerPanelSubtitle"],
        "Bot profili, holati, modullari va yo‘nalishlarini boshqarish paneli.",
      ),
      openChat: txAny(["common.open", "messenger.chats"], "Chatni ochish"),
      save: txAny(["common.save"], "Saqlash"),
      delete: txAny(["common.delete"], "O‘chirish"),
      cancel: txAny(["common.cancel", "messenger.cancelAction"], "Bekor qilish"),
      active: txAny(["status.active", "common.enabled"], "Faol"),
      paused: txAny(["common.pause"], "To‘xtatilgan"),
      draft: txAny(["status.draft", "common.draft"], "Qoralama"),
      name: txAny(["common.name"], "Nomi"),
      username: txAny(["common.username"], "Foydalanuvchi nomi"),
      description: txAny(["common.description"], "Tavsif"),
      commands: txAny(["common.commands", "common.count"], "Buyruqlar"),
      verified: txAny(["common.verified"], "Tasdiqlangan"),
      privateMode: txAny(["common.private"], "Yopiq"),
      assistant: txAny(["common.ai"], "Yordamchi"),
      service: txAny(["common.service"], "Xizmat"),
      business: txAny(["common.business"], "Biznes"),
      market: txAny(["common.market"], "Bozor"),
      delivery: txAny(["common.delivery"], "Yetkazish"),
      store: txAny(["common.store"], "Do‘kon"),
      support: txAny(["common.support"], "Yordam"),
      walletRouting: txAny(["messenger.walletRouting"], "Hamyon yo‘nalishi"),
      sabiWallet: txAny(["messenger.sabiWalletRoute"], "SABI hamyon"),
      businessRouting: txAny(
        ["messenger.businessRoutingLayer"],
        "Biznes yo‘nalish qatlami",
      ),
      businessComing: txAny(
        ["messenger.businessWalletComingSoon"],
        "Biznes hamyon keyin qo‘shiladi",
      ),
      tradeHint: txAny(
        ["messenger.botTradeRouteHint"],
        "Savdo va tijorat bot tushumlari SABI hamyonga boradi.",
      ),
      businessHint: txAny(
        ["messenger.botBusinessRouteHint"],
        "Biznes hamyon ishga tushguncha biznes bot tushumlari biznes yo‘nalish qatlamidan o‘tadi.",
      ),
      statusHint: txAny(
        ["messenger.botStatusHint"],
        "Botni o‘chirmasdan to‘xtatish yoki qayta faollashtirish.",
      ),
      commandsUnit: txAny(["common.commands", "common.count"], "buyruqlar"),
      unread: txAny(["messenger.unread", "common.unread"], "O‘qilmagan"),
      status: txAny(["common.status", "messenger.status"], "Holat"),
      modules: txAny(["common.modules"], "Modullar"),
      addCommand: txAny(["messenger.addCommand"], "Buyruq qo‘shish"),
      editCommand: txAny(["messenger.editCommand"], "Buyruqni tahrirlash"),
      commandName: txAny(["messenger.commandName"], "Buyruq"),
      commandTitle: txAny(["messenger.commandTitle"], "Buyruq sarlavhasi"),
      commandDescription: txAny(
        ["messenger.commandDescription"],
        "Buyruq tavsifi",
      ),
      commandEnabled: txAny(["messenger.commandEnabled"], "Yoqilgan"),
      commandSaved: txAny(["messenger.commandSaved"], "Buyruq saqlandi"),
      commandDeleted: txAny(["messenger.commandDeleted"], "Buyruq o‘chirildi"),
      commandConfigSubtitle: txAny(
        ["messenger.commandConfigSubtitle"],
        "Tanlangan bot uchun haqiqiy buyruqni sozlang.",
      ),
      commandTitlePlaceholder: txAny(
        ["messenger.commandTitlePlaceholder"],
        "Boshlash",
      ),
      commandDescriptionPlaceholder: txAny(
        ["messenger.commandDescriptionPlaceholder"],
        "Bu buyruq nima qiladi",
      ),
      commandAndTitleRequired: txAny(
        ["messenger.commandAndTitleRequired"],
        "Buyruq va sarlavha majburiy.",
      ),
      saved: txAny(["messenger.botUpdated"], "Bot yangilandi"),
      removed: txAny(["messenger.botRemoved"], "Bot olib tashlandi"),
      missing: txAny(["messenger.botMissing"], "Bot topilmadi"),
      loading: txAny(["messenger.botLoading"], "Bot yuklanmoqda..."),
      botProfile: txAny(["messenger.botProfile"], "Bot profili"),
      noCommandsYet: txAny(["messenger.noCommandsYet"], "Hozircha buyruqlar yo‘q"),
      noCommandsYetSubtitle: txAny(
        ["messenger.noCommandsYetSubtitle"],
        "Bu bot uchun birinchi buyruqni egasi panelidan qo‘shing.",
      ),
      quickOwnerControls: txAny(
        ["messenger.quickOwnerControls"],
        "Tezkor egasi boshqaruvi",
      ),
      openBotChatInMessenger: txAny(
        ["messenger.openBotChatInMessenger"],
        "Bot chatini messenjerda ochish",
      ),
      removeBotFromOwnerList: txAny(
        ["messenger.removeBotFromOwnerList"],
        "Botni egasi ro‘yxatidan olib tashlash",
      ),
      openRoute: txAny(["messenger.openRoute"], "Yo‘nalishni ochish"),
      businessPath: txAny(["messenger.businessPath"], "Biznes yo‘li"),
      sabiPath: txAny(["messenger.sabiPath"], "SABI yo‘li"),
      muteBot: txAny(["messenger.muteBot"], "Ovozsiz qilish"),
      unmuteBot: txAny(["messenger.unmuteBot"], "Ovozini yoqish"),
      pinBot: txAny(["messenger.pinBot"], "Mahkamlash"),
      unpinBot: txAny(["messenger.unpinBot"], "Mahkamdan olish"),
      savingNow: txAny(["common.saving", "messenger.savingNow"], "Saqlanmoqda..."),
      nameAndUsernameRequired: txAny(
        ["messenger.nameAndUsernameRequired"],
        "Nom va username majburiy.",
      ),
    }),
    [txAny],
  );

  const syncCommandCount = useCallback(
    async (nextCommands: BotCommandItem[], targetBot: MessengerBot) => {
      await createOrUpdateMessengerBot({
        id: targetBot.id,
        name: formName.trim() || targetBot.name,
        username: normalizeHandle(formHandle) || targetBot.username,
        description: formDescription.trim() || targetBot.description,
        kind: formKind,
        commandsCount: nextCommands.length,
        verified: formVerified,
        hiddenFromMain: formPrivate,
        linkedModules: formModules.length ? [...formModules] : [...DEFAULT_BOT_MODULES],
      });
    },
    [formDescription, formHandle, formKind, formModules, formName, formPrivate, formVerified],
  );

  const loadBot = useCallback(async () => {
    setLoading(true);

    const nextTheme = await hydrateMessengerThemeState();
    setThemeState(nextTheme);

    const nextBot = botId ? await getMessengerBotById(botId) : null;
    const nextCommands = botId ? await listBotCommands(botId) : [];

    setBot(nextBot);
    setCommands(nextCommands);

    if (nextBot) {
      setFormName(nextBot.name);
      setFormHandle(nextBot.username);
      setFormDescription(nextBot.description);
      setFormCommands(String(nextCommands.length || nextBot.commandsCount));
      setFormKind(nextBot.kind);
      setFormVerified(nextBot.verified);
      setFormPrivate(nextBot.hiddenFromMain);
      setFormModules(
        nextBot.linkedModules.length ? nextBot.linkedModules : DEFAULT_BOT_MODULES,
      );
    }

    setLoading(false);
  }, [botId]);

  useFocusEffect(
    useCallback(() => {
      void loadBot();
    }, [loadBot]),
  );

  const resetCommandComposer = useCallback(() => {
    setEditingCommandId(null);
    setCommandValue("");
    setCommandTitle("");
    setCommandDescription("");
    setCommandEnabled(true);
    setCommandModalVisible(false);
  }, []);

  const openNewCommandComposer = useCallback(() => {
    setEditingCommandId(null);
    setCommandValue("");
    setCommandTitle("");
    setCommandDescription("");
    setCommandEnabled(true);
    setCommandModalVisible(true);
  }, []);

  const openEditCommandComposer = useCallback((item: BotCommandItem) => {
    setEditingCommandId(item.id);
    setCommandValue(item.command);
    setCommandTitle(item.title);
    setCommandDescription(item.description);
    setCommandEnabled(item.enabled);
    setCommandModalVisible(true);
  }, []);

  const saveCommand = useCallback(async () => {
    if (!bot) return;

    const normalizedCommand = normalizeCommand(commandValue);
    const normalizedTitle = commandTitle.trim();

    if (!normalizedCommand || !normalizedTitle) {
      Alert.alert(texts.title, texts.commandAndTitleRequired);
      return;
    }

    await createOrUpdateBotCommand({
      id: editingCommandId || undefined,
      botId: bot.id,
      command: normalizedCommand,
      title: normalizedTitle,
      description: commandDescription.trim(),
      enabled: commandEnabled,
    });

    const nextCommands = await listBotCommands(bot.id);
    await syncCommandCount(nextCommands, bot);
    await loadBot();
    resetCommandComposer();
    Alert.alert(texts.title, texts.commandSaved);
  }, [
    bot,
    commandDescription,
    commandEnabled,
    commandTitle,
    commandValue,
    editingCommandId,
    loadBot,
    resetCommandComposer,
    syncCommandCount,
    texts.commandAndTitleRequired,
    texts.commandSaved,
    texts.title,
  ]);

  const removeCommand = useCallback(
    async (item: BotCommandItem) => {
      if (!bot) return;

      await deleteBotCommand(item.id);
      const nextCommands = await listBotCommands(bot.id);
      await syncCommandCount(nextCommands, bot);
      await loadBot();
      Alert.alert(texts.title, texts.commandDeleted);
    },
    [bot, loadBot, syncCommandCount, texts.commandDeleted, texts.title],
  );

  const moveCommandRelative = useCallback(
    async (item: BotCommandItem, direction: "up" | "down") => {
      await moveBotCommand(item.id, direction);
      await loadBot();
    },
    [loadBot],
  );

  const openBotChat = useCallback(async () => {
    if (!bot) return;

    const nextRoomType = getBotRouteRoomType(bot.kind);

    await openMessengerRoom({
      chatId: bot.id,
      name: bot.name,
      subtitle: bot.username,
      roomType: nextRoomType,
      verified: Boolean(bot.verified),
      avatarLetter: bot.avatarLetter,
      handle: bot.username,
      username: bot.username,
      currentUserId: currentUserId || undefined,
      peerUserId: bot.id,
      isBot: "1",
      botId: bot.id,
      botHandle: bot.username,
      botKind: bot.kind,
      isBotOwnedByMe: "1",
      markRead: false,
    });
  }, [bot, currentUserId]);

  const openWalletRoute = useCallback(() => {
    if (!bot) return;

    if (formKind === "business") {
      router.push({
        pathname: "/wallet/business-pay",
        params: {
          source: "bot_owner",
          botId: bot.id,
          botName: bot.name,
          botHandle: bot.username,
          destination: "business_route",
        },
      } as never);
      return;
    }

    router.push({
      pathname: "/wallet",
      params: {
        source: "bot_owner",
        botId: bot.id,
        botName: bot.name,
        botHandle: bot.username,
        destination: "sabi_wallet",
      },
    } as never);
  }, [bot, formKind]);

  const toggleModule = useCallback((module: BotModule) => {
    setFormModules((current) =>
      current.includes(module)
        ? current.filter((item) => item !== module)
        : [...current, module],
    );
  }, []);

  const toggleStatus = useCallback(async () => {
    if (!bot) return;

    const nextStatus = bot.status === "active" ? "paused" : "active";
    await setMessengerBotStatus(bot.id, nextStatus);
    await loadBot();
  }, [bot, loadBot]);

  const saveBot = useCallback(async () => {
    if (!bot) return;

    const name = formName.trim();
    const username = normalizeHandle(formHandle);
    const commandsCount = Math.max(commands.length, Number(formCommands || "0") || 0);
    const linkedModules: BotModule[] = formModules.length
      ? [...formModules]
      : [...DEFAULT_BOT_MODULES];

    if (!name || !username) {
      Alert.alert(texts.title, texts.nameAndUsernameRequired);
      return;
    }

    setSaving(true);

    try {
      await createOrUpdateMessengerBot({
        id: bot.id,
        name,
        username,
        description: formDescription.trim(),
        kind: formKind,
        commandsCount,
        verified: formVerified,
        hiddenFromMain: formPrivate,
        linkedModules,
      });

      await loadBot();
      Alert.alert(texts.title, texts.saved);
    } finally {
      setSaving(false);
    }
  }, [
    bot,
    commands.length,
    formCommands,
    formDescription,
    formHandle,
    formKind,
    formModules,
    formName,
    formPrivate,
    formVerified,
    loadBot,
    texts.nameAndUsernameRequired,
    texts.saved,
    texts.title,
  ]);

  const toggleMuted = useCallback(async () => {
    if (!bot) return;
    await setMessengerBotMuted(bot.id, !bot.muted);
    await loadBot();
  }, [bot, loadBot]);

  const togglePinned = useCallback(async () => {
    if (!bot) return;
    await setMessengerBotPinned(bot.id, !bot.pinned);
    await loadBot();
  }, [bot, loadBot]);

  const removeBot = useCallback(async () => {
    if (!bot) return;

    Alert.alert(texts.delete, bot.name, [
      { text: texts.cancel, style: "cancel" },
      {
        text: texts.delete,
        style: "destructive",
        onPress: () => {
          void (async () => {
            await setMessengerBotDeleted(bot.id, true);
            Alert.alert(texts.title, texts.removed);
            router.back();
          })();
        },
      },
    ]);
  }, [bot, texts.cancel, texts.delete, texts.removed, texts.title]);

  const moduleDefs = useMemo(
    () => [
      { key: "market" as const, label: texts.market, icon: ShoppingBag },
      { key: "delivery" as const, label: texts.delivery, icon: Truck },
      { key: "store" as const, label: texts.store, icon: Store },
      { key: "support" as const, label: texts.support, icon: MessageCircleMore },
    ],
    [texts.delivery, texts.market, texts.store, texts.support],
  );

  const routeTitle =
    formKind === "business" ? texts.businessRouting : texts.sabiWallet;
  const routeHint = formKind === "business" ? texts.businessHint : texts.tradeHint;

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
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Pressable style={styles.headerButtonWrap} onPress={() => router.back()}>
              {({ pressed }) => (
                <View style={[styles.headerButtonOuter, pressed && styles.pressed]}>
                  <View style={styles.headerButtonShadow} />
                  <LinearGradient
                    colors={raisedColors}
                    style={[
                      styles.headerButtonFill,
                      {
                        borderColor: withAlpha(
                          palette.textMain || TEXT_MAIN,
                          0.10,
                        ),
                      },
                    ]}
                  >
                    <ArrowLeft
                      size={20}
                      strokeWidth={2.3}
                      color={palette.textMain || TEXT_MAIN}
                    />
                  </LinearGradient>
                </View>
              )}
            </Pressable>

            <View style={styles.headerTextWrap}>
              <Text
                style={[
                  styles.headerEyebrow,
                  { color: withAlpha(palette.textSecondary || TEXT_SECONDARY, 0.78) },
                ]}
              >
                Sabi Messenger
              </Text>
              <Text style={[styles.headerTitle, { color: palette.textMain || TEXT_MAIN }]}>
                {texts.title}
              </Text>
            </View>
          </View>

          {loading ? (
            <LinearGradient
              colors={cardColors}
              style={[
                styles.loadingCard,
                { borderColor: withAlpha(palette.textMain || TEXT_MAIN, 0.08) },
              ]}
            >
              <Text style={[styles.loadingText, { color: palette.textMain || TEXT_MAIN }]}>
                {texts.loading}
              </Text>
            </LinearGradient>
          ) : !bot ? (
            <LinearGradient
              colors={cardColors}
              style={[
                styles.loadingCard,
                { borderColor: withAlpha(palette.textMain || TEXT_MAIN, 0.08) },
              ]}
            >
              <Text style={[styles.loadingText, { color: palette.textMain || TEXT_MAIN }]}>
                {texts.missing}
              </Text>
            </LinearGradient>
          ) : (
            <>
              <View style={styles.heroWrap}>
                <View style={styles.heroShadow} />
                <LinearGradient
                  colors={cardColors}
                  style={[
                    styles.heroCard,
                    { borderColor: withAlpha(palette.textMain || TEXT_MAIN, 0.08) },
                  ]}
                >
                  <View
                    style={[
                      styles.heroGlow,
                      { backgroundColor: withAlpha(palette.textMain || TEXT_MAIN, 0.05) },
                    ]}
                  />

                  <LinearGradient
                    colors={[palette.accent, accentAlt, palette.accentSoft]}
                    style={styles.heroAvatar}
                  >
                    <Text style={styles.heroAvatarText}>{bot.avatarLetter}</Text>
                  </LinearGradient>

                  <View style={styles.heroTextWrap}>
                    <View style={styles.heroTitleRow}>
                      <Text
                        style={[styles.heroTitle, { color: palette.textMain || TEXT_MAIN }]}
                      >
                        {bot.name}
                      </Text>
                      {bot.verified ? (
                        <BadgeCheck
                          size={16}
                          strokeWidth={2.3}
                          color={palette.accentSoft}
                        />
                      ) : null}
                    </View>
                    <Text style={[styles.heroHandle, { color: palette.accentSoft }]}>
                      {bot.username}
                    </Text>
                    <Text
                      style={[
                        styles.heroSubtitle,
                        { color: withAlpha(palette.textSecondary || TEXT_SECONDARY, 0.82) },
                      ]}
                    >
                      {texts.subtitle}
                    </Text>
                  </View>
                </LinearGradient>
              </View>

              <View style={styles.statsRow}>
                <StatCard
                  title={texts.commandsUnit}
                  value={String(commands.length)}
                  palette={palette}
                  raisedColors={raisedColors}
                />
                <StatCard
                  title={texts.unread}
                  value={String(bot.unread)}
                  palette={palette}
                  raisedColors={raisedColors}
                />
                <StatCard
                  title={texts.status}
                  value={
                    bot.status === "paused"
                      ? texts.paused
                      : bot.status === "draft"
                        ? texts.draft
                        : texts.active
                  }
                  palette={palette}
                  raisedColors={raisedColors}
                />
              </View>

              <View style={styles.actionsGrid}>
                <ActionCard
                  title={texts.openChat}
                  subtitle={texts.openBotChatInMessenger}
                  icon={MessageCircleMore}
                  onPress={() => void openBotChat()}
                  palette={palette}
                  colors={accentCardColors}
                  accent
                />
                <ActionCard
                  title={texts.walletRouting}
                  subtitle={routeTitle}
                  icon={formKind === "business" ? BriefcaseBusiness : Wallet}
                  onPress={openWalletRoute}
                  palette={palette}
                  colors={raisedColors}
                />
                <ActionCard
                  title={bot.status === "active" ? texts.paused : texts.active}
                  subtitle={texts.statusHint}
                  icon={bot.status === "active" ? Pause : Play}
                  onPress={() => void toggleStatus()}
                  palette={palette}
                  colors={raisedColors}
                />
                <ActionCard
                  title={texts.delete}
                  subtitle={texts.removeBotFromOwnerList}
                  icon={Trash2}
                  onPress={() => void removeBot()}
                  palette={palette}
                  colors={raisedColors}
                />
              </View>

              <LinearGradient
                colors={cardColors}
                style={[
                  styles.sectionCard,
                  { borderColor: withAlpha(palette.textMain || TEXT_MAIN, 0.08) },
                ]}
              >
                <Text style={[styles.sectionTitle, { color: palette.textMain || TEXT_MAIN }]}>
                  {texts.botProfile}
                </Text>

                <Field
                  label={texts.name}
                  value={formName}
                  onChangeText={setFormName}
                  placeholder={texts.name}
                  palette={palette}
                  raisedColors={raisedColors}
                />
                <Field
                  label={texts.username}
                  value={formHandle}
                  onChangeText={setFormHandle}
                  placeholder="@my_bot"
                  palette={palette}
                  raisedColors={raisedColors}
                />
                <Field
                  label={texts.description}
                  value={formDescription}
                  onChangeText={setFormDescription}
                  placeholder={texts.description}
                  multiline
                  palette={palette}
                  raisedColors={raisedColors}
                />
                <Field
                  label={texts.commands}
                  value={formCommands}
                  onChangeText={setFormCommands}
                  placeholder="1"
                  keyboardType="numeric"
                  palette={palette}
                  raisedColors={raisedColors}
                />

                <View style={styles.kindRow}>
                  {(["assistant", "service", "business"] as BotKind[]).map((kind) => {
                    const active = formKind === kind;
                    const label =
                      kind === "assistant"
                        ? texts.assistant
                        : kind === "service"
                          ? texts.service
                          : texts.business;

                    return (
                      <Pressable
                        key={kind}
                        onPress={() => setFormKind(kind)}
                        style={styles.kindWrap}
                      >
                        <LinearGradient
                          colors={active ? [palette.accent, accentAlt] : raisedColors}
                          style={[
                            styles.kindButton,
                            {
                              borderColor: withAlpha(
                                palette.textMain || TEXT_MAIN,
                                0.08,
                              ),
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.kindButtonText,
                              { color: active ? "#071711" : palette.textMain || TEXT_MAIN },
                            ]}
                          >
                            {label}
                          </Text>
                        </LinearGradient>
                      </Pressable>
                    );
                  })}
                </View>

                <LinearGradient
                  colors={raisedColors}
                  style={[
                    styles.switchRow,
                    { borderColor: withAlpha(palette.textMain || TEXT_MAIN, 0.08) },
                  ]}
                >
                  <View style={styles.switchTextWrap}>
                    <Text
                      style={[styles.switchTitle, { color: palette.textMain || TEXT_MAIN }]}
                    >
                      {texts.verified}
                    </Text>
                  </View>
                  <Switch value={formVerified} onValueChange={setFormVerified} />
                </LinearGradient>

                <LinearGradient
                  colors={raisedColors}
                  style={[
                    styles.switchRow,
                    { borderColor: withAlpha(palette.textMain || TEXT_MAIN, 0.08) },
                  ]}
                >
                  <View style={styles.switchTextWrap}>
                    <Text
                      style={[styles.switchTitle, { color: palette.textMain || TEXT_MAIN }]}
                    >
                      {texts.privateMode}
                    </Text>
                  </View>
                  <Switch value={formPrivate} onValueChange={setFormPrivate} />
                </LinearGradient>
              </LinearGradient>

              <LinearGradient
                colors={cardColors}
                style={[
                  styles.sectionCard,
                  { borderColor: withAlpha(palette.textMain || TEXT_MAIN, 0.08) },
                ]}
              >
                <View style={styles.sectionHeadRow}>
                  <Text style={[styles.sectionTitle, { color: palette.textMain || TEXT_MAIN }]}>
                    {texts.modules}
                  </Text>
                </View>

                <View style={styles.modulesRow}>
                  {moduleDefs.map((item) => (
                    <ModuleToggle
                      key={item.key}
                      label={item.label}
                      active={formModules.includes(item.key)}
                      icon={item.icon}
                      onPress={() => toggleModule(item.key)}
                      palette={palette}
                      accentAlt={accentAlt}
                      raisedColors={raisedColors}
                    />
                  ))}
                </View>
              </LinearGradient>

              <LinearGradient
                colors={cardColors}
                style={[
                  styles.sectionCard,
                  { borderColor: withAlpha(palette.textMain || TEXT_MAIN, 0.08) },
                ]}
              >
                <View style={styles.sectionHeadRow}>
                  <Text style={[styles.sectionTitle, { color: palette.textMain || TEXT_MAIN }]}>
                    {texts.commands}
                  </Text>

                  <Pressable onPress={openNewCommandComposer} style={styles.commandAddWrap}>
                    <LinearGradient
                      colors={[palette.accent, accentAlt]}
                      style={styles.commandAddButton}
                    >
                      <Plus size={15} color="#071711" strokeWidth={2.6} />
                      <Text style={styles.commandAddText}>{texts.addCommand}</Text>
                    </LinearGradient>
                  </Pressable>
                </View>

                {commands.length === 0 ? (
                  <LinearGradient
                    colors={raisedColors}
                    style={[
                      styles.commandsEmpty,
                      { borderColor: withAlpha(palette.textMain || TEXT_MAIN, 0.08) },
                    ]}
                  >
                    <Text
                      style={[styles.commandsEmptyTitle, { color: palette.textMain || TEXT_MAIN }]}
                    >
                      {texts.noCommandsYet}
                    </Text>
                    <Text
                      style={[
                        styles.commandsEmptySubtitle,
                        {
                          color: withAlpha(
                            palette.textSecondary || TEXT_SECONDARY,
                            0.82,
                          ),
                        },
                      ]}
                    >
                      {texts.noCommandsYetSubtitle}
                    </Text>
                  </LinearGradient>
                ) : (
                  commands.map((item) => (
                    <CommandCard
                      key={item.id}
                      item={item}
                      onEdit={() => openEditCommandComposer(item)}
                      onMoveUp={() => void moveCommandRelative(item, "up")}
                      onMoveDown={() => void moveCommandRelative(item, "down")}
                      onDelete={() => void removeCommand(item)}
                      palette={palette}
                      raisedColors={raisedColors}
                    />
                  ))
                )}
              </LinearGradient>

              <LinearGradient
                colors={cardColors}
                style={[
                  styles.sectionCard,
                  { borderColor: withAlpha(palette.textMain || TEXT_MAIN, 0.08) },
                ]}
              >
                <Text style={[styles.sectionTitle, { color: palette.textMain || TEXT_MAIN }]}>
                  {texts.walletRouting}
                </Text>

                <LinearGradient
                  colors={raisedColors}
                  style={[
                    styles.routeCard,
                    { borderColor: withAlpha(palette.textMain || TEXT_MAIN, 0.08) },
                  ]}
                >
                  <View style={styles.routeHeader}>
                    <View
                      style={[
                        styles.routeIconWrap,
                        {
                          backgroundColor: withAlpha(
                            palette.textMain || TEXT_MAIN,
                            0.08,
                          ),
                        },
                      ]}
                    >
                      {formKind === "business" ? (
                        <BriefcaseBusiness
                          size={18}
                          color={palette.textMain || TEXT_MAIN}
                        />
                      ) : (
                        <Wallet size={18} color={palette.textMain || TEXT_MAIN} />
                      )}
                    </View>

                    <View style={styles.routeTextWrap}>
                      <Text style={[styles.routeTitle, { color: palette.textMain || TEXT_MAIN }]}>
                        {routeTitle}
                      </Text>
                      <Text
                        style={[
                          styles.routeHint,
                          {
                            color: withAlpha(
                              palette.textSecondary || TEXT_SECONDARY,
                              0.82,
                            ),
                          },
                        ]}
                      >
                        {routeHint}
                      </Text>
                      {formKind === "business" ? (
                        <Text style={styles.routeSoon}>{texts.businessComing}</Text>
                      ) : null}
                    </View>
                  </View>

                  <View style={styles.routeMiniActions}>
                    <Pressable onPress={openWalletRoute} style={styles.routeButtonWrap}>
                      <LinearGradient
                        colors={[palette.accent, accentAlt]}
                        style={styles.routePrimaryButton}
                      >
                        <Text style={styles.routePrimaryButtonText}>{texts.openRoute}</Text>
                      </LinearGradient>
                    </Pressable>

                    <View style={styles.routeFlags}>
                      <View
                        style={[
                          styles.routeFlag,
                          {
                            backgroundColor: withAlpha(
                              palette.textMain || TEXT_MAIN,
                              0.06,
                            ),
                            borderColor: withAlpha(
                              palette.textMain || TEXT_MAIN,
                              0.08,
                            ),
                          },
                        ]}
                      >
                        <ShieldCheck
                          size={13}
                          color={palette.textMain || TEXT_MAIN}
                          strokeWidth={2.2}
                        />
                        <Text
                          style={[
                            styles.routeFlagText,
                            { color: palette.textMain || TEXT_MAIN },
                          ]}
                        >
                          {formKind === "business"
                            ? texts.businessPath
                            : texts.sabiPath}
                        </Text>
                      </View>
                    </View>
                  </View>
                </LinearGradient>
              </LinearGradient>

              <LinearGradient
                colors={cardColors}
                style={[
                  styles.sectionCard,
                  { borderColor: withAlpha(palette.textMain || TEXT_MAIN, 0.08) },
                ]}
              >
                <Text style={[styles.sectionTitle, { color: palette.textMain || TEXT_MAIN }]}>
                  {texts.quickOwnerControls}
                </Text>

                <View style={styles.ownerRow}>
                  <Pressable onPress={() => void toggleMuted()} style={styles.ownerMiniWrap}>
                    <LinearGradient
                      colors={raisedColors}
                      style={[
                        styles.ownerMiniCard,
                        {
                          borderColor: withAlpha(
                            palette.textMain || TEXT_MAIN,
                            0.08,
                          ),
                        },
                      ]}
                    >
                      {bot.muted ? (
                        <Volume2
                          size={16}
                          color={palette.textMain || TEXT_MAIN}
                          strokeWidth={2.3}
                        />
                      ) : (
                        <VolumeX
                          size={16}
                          color={palette.textMain || TEXT_MAIN}
                          strokeWidth={2.3}
                        />
                      )}
                      <Text
                        style={[styles.ownerMiniText, { color: palette.textMain || TEXT_MAIN }]}
                      >
                        {bot.muted ? texts.unmuteBot : texts.muteBot}
                      </Text>
                    </LinearGradient>
                  </Pressable>

                  <Pressable onPress={() => void togglePinned()} style={styles.ownerMiniWrap}>
                    <LinearGradient
                      colors={raisedColors}
                      style={[
                        styles.ownerMiniCard,
                        {
                          borderColor: withAlpha(
                            palette.textMain || TEXT_MAIN,
                            0.08,
                          ),
                        },
                      ]}
                    >
                      <Pin
                        size={16}
                        color={palette.textMain || TEXT_MAIN}
                        strokeWidth={2.3}
                      />
                      <Text
                        style={[styles.ownerMiniText, { color: palette.textMain || TEXT_MAIN }]}
                      >
                        {bot.pinned ? texts.unpinBot : texts.pinBot}
                      </Text>
                    </LinearGradient>
                  </Pressable>
                </View>

                <Pressable onPress={() => void saveBot()} style={styles.saveButtonWrap}>
                  <LinearGradient
                    colors={[palette.accent, accentAlt]}
                    style={styles.saveButton}
                  >
                    <Save size={18} color="#071711" strokeWidth={2.4} />
                    <Text style={styles.saveButtonText}>
                      {saving ? texts.savingNow : texts.save}
                    </Text>
                  </LinearGradient>
                </Pressable>
              </LinearGradient>
            </>
          )}
        </ScrollView>

        <Modal
          visible={commandModalVisible}
          transparent
          animationType="fade"
          onRequestClose={resetCommandComposer}
        >
          <View style={styles.overlayBase}>
            <LinearGradient colors={palette.background} style={StyleSheet.absoluteFill} />
            <Pressable style={StyleSheet.absoluteFill} onPress={resetCommandComposer} />

            <View style={styles.sheetWrap}>
              <View style={styles.popupShadow} />
              <LinearGradient
                colors={cardColors}
                style={[
                  styles.sheetCard,
                  { borderColor: withAlpha(palette.textMain || TEXT_MAIN, 0.10) },
                ]}
              >
                <View style={styles.modalHeaderRow}>
                  <View style={styles.modalHeaderTextWrap}>
                    <Text style={[styles.modalTitle, { color: palette.textMain || TEXT_MAIN }]}>
                      {editingCommandId ? texts.editCommand : texts.addCommand}
                    </Text>
                    <Text
                      style={[
                        styles.modalSubtitle,
                        {
                          color: withAlpha(
                            palette.textSecondary || TEXT_SECONDARY,
                            0.82,
                          ),
                        },
                      ]}
                    >
                      {texts.commandConfigSubtitle}
                    </Text>
                  </View>

                  <Pressable onPress={resetCommandComposer} style={styles.modalCloseButton}>
                    <View
                      style={[
                        styles.modalCloseButtonInner,
                        {
                          borderColor: withAlpha(
                            palette.textMain || TEXT_MAIN,
                            0.10,
                          ),
                          backgroundColor: withAlpha(
                            palette.textMain || TEXT_MAIN,
                            0.04,
                          ),
                        },
                      ]}
                    >
                      <X size={16} color={palette.textMain || TEXT_MAIN} strokeWidth={2.3} />
                    </View>
                  </Pressable>
                </View>

                <Field
                  label={texts.commandName}
                  value={commandValue}
                  onChangeText={setCommandValue}
                  placeholder="/start"
                  palette={palette}
                  raisedColors={raisedColors}
                />
                <Field
                  label={texts.commandTitle}
                  value={commandTitle}
                  onChangeText={setCommandTitle}
                  placeholder={texts.commandTitlePlaceholder}
                  palette={palette}
                  raisedColors={raisedColors}
                />
                <Field
                  label={texts.commandDescription}
                  value={commandDescription}
                  onChangeText={setCommandDescription}
                  placeholder={texts.commandDescriptionPlaceholder}
                  multiline
                  palette={palette}
                  raisedColors={raisedColors}
                />

                <LinearGradient
                  colors={raisedColors}
                  style={[
                    styles.switchRow,
                    { borderColor: withAlpha(palette.textMain || TEXT_MAIN, 0.08) },
                  ]}
                >
                  <View style={styles.switchTextWrap}>
                    <Text
                      style={[styles.switchTitle, { color: palette.textMain || TEXT_MAIN }]}
                    >
                      {texts.commandEnabled}
                    </Text>
                  </View>
                  <Switch value={commandEnabled} onValueChange={setCommandEnabled} />
                </LinearGradient>

                <View style={styles.modalActionsRow}>
                  <Pressable onPress={resetCommandComposer} style={styles.modalActionWrap}>
                    <LinearGradient
                      colors={raisedColors}
                      style={[
                        styles.modalSecondaryAction,
                        { borderColor: withAlpha(palette.textMain || TEXT_MAIN, 0.08) },
                      ]}
                    >
                      <Text
                        style={[
                          styles.modalSecondaryActionText,
                          { color: palette.textMain || TEXT_MAIN },
                        ]}
                      >
                        {texts.cancel}
                      </Text>
                    </LinearGradient>
                  </Pressable>

                  <Pressable onPress={() => void saveCommand()} style={styles.modalActionWrap}>
                    <LinearGradient
                      colors={[palette.accent, accentAlt]}
                      style={styles.modalPrimaryAction}
                    >
                      <Text style={styles.modalPrimaryActionText}>{texts.save}</Text>
                    </LinearGradient>
                  </Pressable>
                </View>
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
  headerTextWrap: {
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
    fontSize: 28,
    fontWeight: "900",
    marginTop: 2,
  },
  loadingCard: {
    minHeight: 140,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "800",
  },
  heroWrap: {
    borderRadius: 28,
    marginBottom: 14,
  },
  heroShadow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 28,
    backgroundColor: "rgba(0,0,0,0.22)",
    transform: [{ translateY: 10 }, { scaleX: 0.96 }],
  },
  heroCard: {
    borderRadius: 28,
    borderWidth: 1,
    overflow: "hidden",
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
  },
  heroGlow: {
    position: "absolute",
    top: -30,
    right: -10,
    width: 150,
    height: 120,
    borderRadius: 120,
  },
  heroAvatar: {
    width: 62,
    height: 62,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  heroAvatarText: {
    color: "#071711",
    fontSize: 22,
    fontWeight: "900",
  },
  heroTextWrap: {
    flex: 1,
  },
  heroTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "900",
  },
  heroHandle: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: "800",
  },
  heroSubtitle: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
    paddingRight: 12,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  statCard: {
    flex: 1,
    minHeight: 84,
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
    justifyContent: "space-between",
    overflow: "hidden",
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "900",
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  actionCardWrap: {
    width: "48.5%",
    borderRadius: 22,
    marginBottom: 10,
  },
  actionCard: {
    minHeight: 132,
    borderRadius: 22,
    padding: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: "900",
  },
  actionSubtitle: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
  },
  sectionCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 14,
    marginBottom: 14,
    overflow: "hidden",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 10,
  },
  sectionHeadRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  fieldWrap: {
    marginTop: 10,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 6,
  },
  fieldCard: {
    minHeight: 48,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 12,
    justifyContent: "center",
    overflow: "hidden",
  },
  fieldInput: {
    fontSize: 14,
    fontWeight: "600",
    paddingVertical: 0,
  },
  fieldInputMultiline: {
    minHeight: 72,
    paddingTop: 12,
    paddingBottom: 12,
  },
  kindRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  kindWrap: {
    flex: 1,
  },
  kindButton: {
    minHeight: 40,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  kindButtonText: {
    fontSize: 12,
    fontWeight: "900",
  },
  switchRow: {
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 12,
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    overflow: "hidden",
  },
  switchTextWrap: {
    flex: 1,
    paddingRight: 10,
  },
  switchTitle: {
    fontSize: 13,
    fontWeight: "800",
  },
  modulesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  moduleToggleWrap: {
    width: "48.5%",
  },
  moduleToggle: {
    minHeight: 44,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    overflow: "hidden",
  },
  moduleToggleText: {
    fontSize: 12,
    fontWeight: "900",
  },
  commandAddWrap: {
    borderRadius: 14,
  },
  commandAddButton: {
    minHeight: 36,
    paddingHorizontal: 12,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  commandAddText: {
    color: "#071711",
    fontSize: 12,
    fontWeight: "900",
  },
  commandsEmpty: {
    minHeight: 96,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    justifyContent: "center",
    overflow: "hidden",
  },
  commandsEmptyTitle: {
    fontSize: 15,
    fontWeight: "900",
  },
  commandsEmptySubtitle: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
  },
  commandCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 12,
    marginTop: 10,
    overflow: "hidden",
  },
  commandTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  commandHandlePill: {
    minHeight: 26,
    paddingHorizontal: 10,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  commandHandleText: {
    fontSize: 11,
    fontWeight: "900",
  },
  commandStatePill: {
    minHeight: 24,
    paddingHorizontal: 8,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  commandStateText: {
    fontSize: 10,
    fontWeight: "900",
  },
  commandTitle: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: "900",
  },
  commandDescription: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
  },
  commandActionsRow: {
    flexDirection: "row",
    marginTop: 12,
    gap: 8,
  },
  commandMiniButton: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  commandMiniDanger: {},
  routeCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 12,
    overflow: "hidden",
  },
  routeHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  routeIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  routeTextWrap: {
    flex: 1,
  },
  routeTitle: {
    fontSize: 15,
    fontWeight: "900",
  },
  routeHint: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
  },
  routeSoon: {
    marginTop: 6,
    color: "#FFE8A5",
    fontSize: 11,
    fontWeight: "800",
  },
  routeMiniActions: {
    marginTop: 12,
  },
  routeButtonWrap: {
    borderRadius: 16,
  },
  routePrimaryButton: {
    minHeight: 46,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  routePrimaryButtonText: {
    color: "#071711",
    fontSize: 13,
    fontWeight: "900",
  },
  routeFlags: {
    marginTop: 10,
  },
  routeFlag: {
    minHeight: 28,
    borderRadius: 999,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    borderWidth: 1,
  },
  routeFlagText: {
    fontSize: 11,
    fontWeight: "800",
  },
  ownerRow: {
    flexDirection: "row",
    gap: 10,
  },
  ownerMiniWrap: {
    flex: 1,
  },
  ownerMiniCard: {
    minHeight: 48,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    flexDirection: "row",
    overflow: "hidden",
  },
  ownerMiniText: {
    fontSize: 13,
    fontWeight: "900",
  },
  saveButtonWrap: {
    borderRadius: 18,
    marginTop: 14,
  },
  saveButton: {
    minHeight: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  saveButtonText: {
    color: "#071711",
    fontSize: 14,
    fontWeight: "900",
  },
  overlayBase: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: "transparent",
  },
  sheetWrap: {
    justifyContent: "center",
  },
  popupShadow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
    backgroundColor: "rgba(0,0,0,0.26)",
    transform: [{ translateY: 10 }, { scaleX: 0.96 }],
  },
  sheetCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 14,
    overflow: "hidden",
  },
  modalHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  modalHeaderTextWrap: {
    flex: 1,
    paddingRight: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "900",
  },
  modalSubtitle: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
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
  modalActionsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  modalActionWrap: {
    flex: 1,
  },
  modalSecondaryAction: {
    minHeight: 48,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  modalSecondaryActionText: {
    fontSize: 13,
    fontWeight: "900",
  },
  modalPrimaryAction: {
    minHeight: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  modalPrimaryActionText: {
    color: "#062019",
    fontSize: 13,
    fontWeight: "900",
  },
  pressed: {
    transform: [{ scale: 0.986 }],
  },
});
