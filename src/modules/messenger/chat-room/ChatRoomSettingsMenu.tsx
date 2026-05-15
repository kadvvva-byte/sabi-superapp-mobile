import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ArrowLeft,
  BadgePlus,
  BellOff,
  BellRing,
  Bot,
  ChevronRight,
  ContactRound,
  Flag,
  Megaphone,
  MessageSquarePlus,
  MoonStar,
  Palette,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserMinus,
  UserRoundPlus,
  X,
} from "lucide-react-native";

import { useI18n } from "../../../shared/i18n";
import type { ChatBackgroundPreset } from "./types";

type MenuActionId =
  | "add_contact"
  | "add_to_list"
  | "mute"
  | "disappearing"
  | "theme"
  | "ai"
  | "editor"
  | "report"
  | "block"
  | "clear_chat"
  | "hide_conversation"
  | "add_to_home"
  | "group_add_member"
  | "group_invite"
  | "group_share"
  | "channel_add_to_chats"
  | "channel_share"
  | "channel_recommend"
  | "channel_open_bot";

type MenuSelectableActionId = Exclude<MenuActionId, "theme">;

type Props = {
  visible: boolean;
  accent: string;
  selectedPreset: ChatBackgroundPreset;
  menuState?: {
    roomType?: "direct" | "group" | "channel" | "business";
    canAddContact?: boolean;
    isAddedToList?: boolean;
    isMuted?: boolean;
    isDisappearingEnabled?: boolean;
    isBlocked?: boolean;
    hasSystemContact?: boolean;
    canInviteToGroup?: boolean;
    inviteLink?: string;
    channelInviteLink?: string;
    channelBotId?: string;
    channelBotHandle?: string;
    linkedBotId?: string;
    linkedBotHandle?: string;
    canAddChannelToChats?: boolean;

    isBot?: boolean;
    botId?: string;
    botHandle?: string;
    isBotOwnedByMe?: boolean;
  };
  onClose: () => void;
  onOpenTheme: () => void;
  onSelect: (toolId: MenuSelectableActionId) => void;
};

type MenuRow = {
  id: MenuActionId | "more";
  title: string;
  subtitle?: string;
  destructive?: boolean;
  hasChevron?: boolean;
  disabled?: boolean;
  icon:
    | typeof ContactRound
    | typeof UserRoundPlus
    | typeof UserMinus
    | typeof BellOff
    | typeof BellRing
    | typeof MoonStar
    | typeof Palette
    | typeof MessageSquarePlus
    | typeof Megaphone
    | typeof Flag
    | typeof ShieldAlert
    | typeof ShieldCheck
    | typeof Trash2
    | typeof BadgePlus
    | typeof Bot
    | typeof Sparkles;
  iconTint: string;
  iconColors: [string, string] | [string, string, string];
};

const TEXT_MAIN = "#F5FBFF";
const TEXT_SECONDARY = "rgba(245,251,255,0.76)";
const TEXT_MUTED = "rgba(168,195,215,0.82)";
const CARD_BG_TOP = "rgba(11,24,40,0.78)";
const CARD_BG_BOTTOM = "rgba(14,28,45,0.84)";
const SURFACE_BORDER_STRONG = "rgba(214, 243, 255, 0.22)";

function normalizeBotHandle(value?: string | null) {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  return raw.startsWith("@") ? raw : `@${raw.replace(/^@+/, "")}`;
}

function GlassCircleButton({
  icon: Icon,
  onPress,
  colors,
  iconColor,
  animated = false,
  style,
  iconSize = 16,
}: {
  icon: MenuRow["icon"] | typeof ArrowLeft | typeof X;
  onPress: () => void;
  colors: [string, string] | [string, string, string];
  iconColor: string;
  animated?: boolean;
  style?: object;
  iconSize?: number;
}) {
  const pulse = useRef(new Animated.Value(0.92)).current;
  const shimmer = useRef(new Animated.Value(0)).current;
  const pressScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!animated) return;

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.12,
          duration: 1500,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.92,
          duration: 1500,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );

    const shimmerLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 2100,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );

    pulseLoop.start();
    shimmerLoop.start();

    return () => {
      pulseLoop.stop();
      shimmerLoop.stop();
    };
  }, [animated, pulse, shimmer]);

  const onPressIn = () => {
    Animated.spring(pressScale, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 32,
      bounciness: 5,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(pressScale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 28,
      bounciness: 6,
    }).start();
  };

  const shimmerTranslate = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-26, 26],
  });

  const pulseOpacity = pulse.interpolate({
    inputRange: [0.92, 1.12],
    outputRange: [0.12, 0.03],
  });

  return (
    <Animated.View
      style={[
        styles.glassButtonOuter,
        style,
        {
          transform: [{ scale: pressScale }],
        },
      ]}
    >
      {animated ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.glassButtonPulse,
            {
              opacity: pulseOpacity,
              transform: [{ scale: pulse }],
            },
          ]}
        />
      ) : null}

      <Pressable
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={styles.glassButtonPressable}
      >
        <LinearGradient colors={colors} style={styles.roundButton}>
          <View style={styles.roundButtonEdge} />
          <View style={styles.buttonGloss} />
          {animated ? (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.buttonShimmer,
                {
                  transform: [{ translateX: shimmerTranslate }, { rotate: "18deg" }],
                },
              ]}
            />
          ) : null}
          <Icon size={iconSize} strokeWidth={2.3} color={iconColor} />
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

function MenuItemRow({
  item,
  onPress,
}: {
  item: MenuRow;
  onPress: () => void;
}) {
  return (
    <Pressable disabled={item.disabled} onPress={onPress} style={styles.itemPressable}>
      {({ pressed }) => (
        <View
          style={[
            styles.itemCardWrap,
            pressed && !item.disabled ? styles.pressed : undefined,
            item.disabled ? styles.itemDisabled : undefined,
          ]}
        >
          <View style={styles.itemCardShadow} />
          <View style={styles.itemCard}>
            <LinearGradient
              colors={
                item.destructive
                  ? ["rgba(61,22,31,0.88)", "rgba(30,12,18,0.82)", "rgba(20,10,15,0.78)"]
                  : [CARD_BG_TOP, CARD_BG_BOTTOM]
              }
              style={styles.itemCardFill}
            >
              <View style={styles.itemGlass} />
              <View style={styles.itemInnerBorder} />

              <GlassCircleButton
                icon={item.icon}
                onPress={onPress}
                colors={item.iconColors}
                iconColor={item.iconTint}
                animated={!item.disabled && !item.destructive && !item.hasChevron}
                iconSize={16}
                style={styles.itemActionIcon}
              />

              <View style={styles.itemTextWrap}>
                <Text
                  style={[
                    styles.itemTitle,
                    item.destructive ? styles.itemTitleDanger : undefined,
                  ]}
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
                {item.subtitle ? (
                  <Text style={styles.itemSubtitle} numberOfLines={2}>
                    {item.subtitle}
                  </Text>
                ) : null}
              </View>

              {item.hasChevron ? (
                <ChevronRight
                  size={16}
                  color="rgba(245,251,255,0.72)"
                  strokeWidth={2.5}
                />
              ) : null}
            </LinearGradient>
          </View>
        </View>
      )}
    </Pressable>
  );
}

export function ChatRoomSettingsMenu({
  visible,
  accent,
  selectedPreset,
  menuState,
  onClose,
  onOpenTheme,
  onSelect,
}: Props) {
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  const [moreVisible, setMoreVisible] = useState(false);

  useEffect(() => {
    if (!visible) {
      setMoreVisible(false);
    }
  }, [visible]);

  const state = {
    roomType: menuState?.roomType ?? "direct",
    canAddContact: menuState?.canAddContact ?? true,
    isAddedToList: menuState?.isAddedToList ?? false,
    isMuted: menuState?.isMuted ?? false,
    isDisappearingEnabled: menuState?.isDisappearingEnabled ?? false,
    isBlocked: menuState?.isBlocked ?? false,
    hasSystemContact: menuState?.hasSystemContact ?? false,
    canInviteToGroup: menuState?.canInviteToGroup ?? false,
    inviteLink: String(menuState?.inviteLink ?? "").trim(),
    channelInviteLink: String(menuState?.channelInviteLink ?? menuState?.inviteLink ?? "").trim(),
    channelBotId: String(menuState?.channelBotId ?? menuState?.linkedBotId ?? "").trim(),
    channelBotHandle: normalizeBotHandle(menuState?.channelBotHandle ?? menuState?.linkedBotHandle),
    canAddChannelToChats: menuState?.canAddChannelToChats ?? true,

    isBot: menuState?.isBot ?? false,
    botId: String(menuState?.botId ?? "").trim(),
    botHandle: normalizeBotHandle(menuState?.botHandle),
    isBotOwnedByMe: menuState?.isBotOwnedByMe ?? false,
  };

  const tx = useMemo(
    () => (keys: string[], fallback: string) => {
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
      title: state.isBot
        ? tx(["messenger.roomSettings.botTitle"], "Bot settings")
        : tx(["messenger.roomSettings.title"], "Chat settings"),

      subtitle: state.isBot
        ? tx(["messenger.roomSettings.botSubtitle"], "Connected bot")
        : tx(["messenger.roomSettings.subtitle"], "Conversation controls"),

      back: tx(["common.back"], "Back"),

      addContact: tx(["messenger.menu.addContact"], "Добавить контакт"),
      addContactSubtitle: tx(
        ["messenger.menu.addContactSubtitle"],
        "Save this person in system contacts",
      ),
      contactSaved: tx(["messenger.menu.contactSaved"], "Saved in contacts"),
      contactSavedSubtitle: tx(
        ["messenger.menu.contactSavedSubtitle"],
        "This chat is already linked to a system contact",
      ),
      contactUnavailable: tx(
        ["messenger.menu.contactUnavailable"],
        "Contact creation is not available",
      ),

      addToList: state.isBot
        ? tx(["messenger.menu.addBotToList"], "Add bot to favorites")
        : tx(["messenger.menu.addToList"], "Add to list"),

      addToListSubtitle: state.isBot
        ? tx(
            ["messenger.menu.addBotToListSubtitle"],
            "Keep this bot in your quick bot list",
          )
        : tx(["messenger.menu.addToListSubtitle"], "Keep this chat in your quick list"),

      removeFromList: state.isBot
        ? tx(["messenger.menu.removeBotFromList"], "Remove bot from favorites")
        : tx(["messenger.menu.removeFromList"], "Remove from list"),

      removeFromListSubtitle: state.isBot
        ? tx(
            ["messenger.menu.removeBotFromListSubtitle"],
            "Hide this bot from your quick bot list",
          )
        : tx(
            ["messenger.menu.removeFromListSubtitle"],
            "Remove this chat from your quick list",
          ),

      mute: state.isBot
        ? tx(["messenger.menu.muteBot"], "Mute bot")
        : tx(["messenger.menu.mute"], "Mute"),

      muteSubtitle: state.isBot
        ? tx(
            ["messenger.menu.muteBotSubtitle"],
            "Disable bot notifications and automated responses",
          )
        : tx(["messenger.menu.muteSubtitle"], "Disable notifications for this chat"),

      unmute: state.isBot
        ? tx(["messenger.menu.unmuteBot"], "Unmute bot")
        : tx(["messenger.menu.unmute"], "Unmute"),

      unmuteSubtitle: state.isBot
        ? tx(
            ["messenger.menu.unmuteBotSubtitle"],
            "Enable bot notifications and automated responses again",
          )
        : tx(["messenger.menu.unmuteSubtitle"], "Enable notifications for this chat"),

      disappearing: tx(["messenger.menu.disappearing"], "Disappearing messages"),
      disappearingSubtitle: tx(
        ["messenger.menu.disappearingSubtitle"],
        "Enable auto-delete for new messages",
      ),
      disableDisappearing: tx(
        ["messenger.menu.disableDisappearing"],
        "Disable disappearing messages",
      ),
      disableDisappearingSubtitle: tx(
        ["messenger.menu.disableDisappearingSubtitle"],
        "Keep future messages in the chat history",
      ),

      theme: tx(["messenger.menu.theme"], "Theme & wallpaper"),
      themeSubtitle: tx(
        ["messenger.menu.themeSubtitle"],
        "Change colors, wallpaper and visual style",
      ),

      ai: tx(["messenger.menu.ai"], "AI"),
      aiSubtitle: state.isBot
        ? tx(
            ["messenger.menu.aiBotSubtitle"],
            "Open AI tools for this bot and conversation",
          )
        : tx(
            ["messenger.menu.aiSubtitle"],
            "Open AI tools for this conversation",
          ),

      editor: state.isBot
        ? state.isBotOwnedByMe
          ? tx(["messenger.menu.manageBot"], "Manage bot")
          : tx(["messenger.menu.botTools"], "Bot tools")
        : tx(["messenger.menu.editor"], "Editor"),

      editorSubtitle: state.isBot
        ? state.isBotOwnedByMe
          ? tx(
              ["messenger.menu.manageBotSubtitle"],
              "Open your bot control panel and management tools",
            )
          : tx(
              ["messenger.menu.botToolsSubtitle"],
              "Open bot actions, commands and related tools",
            )
        : tx(
            ["messenger.menu.editorSubtitle"],
            "Open quick tools and composer-related actions",
          ),

      more: tx(["messenger.menu.more"], "More"),
      moreSubtitle: state.isBot
        ? tx(
            ["messenger.menu.moreBotSubtitle"],
            "Advanced moderation and bot actions",
          )
        : tx(["messenger.menu.moreSubtitle"], "Advanced chat actions"),

      report: tx(["messenger.menu.report"], "Report"),
      reportSubtitle: state.isBot
        ? tx(
            ["messenger.menu.reportBotSubtitle"],
            "Report spam, fraud or unsafe bot behavior",
          )
        : tx(
            ["messenger.menu.reportSubtitle"],
            "Report this profile or conversation",
          ),

      block: state.isBot
        ? tx(["messenger.menu.blockBot"], "Block bot")
        : tx(["messenger.menu.block"], "Block"),

      blockSubtitle: state.isBot
        ? tx(
            ["messenger.menu.blockBotSubtitle"],
            "Stop this bot from sending messages or automation",
          )
        : tx(
            ["messenger.menu.blockSubtitle"],
            "Stop this profile from contacting you",
          ),

      unblock: state.isBot
        ? tx(["messenger.menu.unblockBot"], "Unblock bot")
        : tx(["messenger.menu.unblock"], "Unblock"),

      unblockSubtitle: state.isBot
        ? tx(
            ["messenger.menu.unblockBotSubtitle"],
            "Allow this bot to send messages and automation again",
          )
        : tx(
            ["messenger.menu.unblockSubtitle"],
            "Allow this profile to contact you again",
          ),

      clearChat: tx(["messenger.menu.clearChat"], "Clear chat"),
      clearChatSubtitle: state.isBot
        ? tx(
            ["messenger.menu.clearBotChatSubtitle"],
            "Remove messages and bot interaction history from this dialog",
          )
        : tx(
            ["messenger.menu.clearChatSubtitle"],
            "Remove messages from this conversation",
          ),

      hideConversation: tx(["messenger.menu.hideConversation"], "Yozishmani yashirish"),
      hideConversationSubtitle: tx(
        ["messenger.menu.hideConversationSubtitle"],
        "Chat qoladi, eski xabarlar shu xonadan yashiriladi",
      ),

      addToHome: state.isBot
        ? tx(["messenger.menu.addBotToHome"], "Add bot to home")
        : tx(["messenger.menu.addToHome"], "Add to home"),

      addToHomeSubtitle: state.isBot
        ? tx(
            ["messenger.menu.addBotToHomeSubtitle"],
            "Pin a quick shortcut for this bot on the home screen",
          )
        : tx(
            ["messenger.menu.addToHomeSubtitle"],
            "Pin a quick shortcut for this chat on the home screen",
          ),

      botCardTitle: tx(["messenger.botCard.cardTitle"], "Connected bot"),
      botUnknownHandle: tx(["messenger.botCard.unknownHandle"], "@bot"),
      botConnected: tx(["messenger.botCard.connected"], "Connected"),
      botOwner: tx(["messenger.botCard.owner"], "Owner"),
      botIdLabel: tx(["messenger.botCard.idLabel"], "Bot ID"),
      botNoId: tx(["messenger.botCard.noId"], "ID not set"),
      groupAddMember: tx(["sabiMessengerGroupMenu.groupAddMember"], t("common.add")),
      groupAddMemberSubtitle: tx(["sabiMessengerGroupMenu.groupAddMemberSubtitle"], ""),
      groupInvite: tx(["sabiMessengerGroupMenu.groupInvite"], t("common.open")),
      groupInviteSubtitle: tx(["sabiMessengerGroupMenu.groupInviteSubtitle"], ""),
      groupShare: tx(["sabiMessengerGroupMenu.groupShare"], t("common.share")),
      groupShareSubtitle: tx(["sabiMessengerGroupMenu.groupShareSubtitle"], ""),

      channelAddToChats: tx(["sabiMessengerChannelMenu.channelAddToChats"], t("common.add")),
      channelAddToChatsSubtitle: tx(["sabiMessengerChannelMenu.channelAddToChatsSubtitle"], ""),
      channelShare: tx(["sabiMessengerChannelMenu.channelShare"], t("common.share")),
      channelShareSubtitle: tx(["sabiMessengerChannelMenu.channelShareSubtitle"], ""),
      channelRecommend: tx(["sabiMessengerChannelMenu.channelRecommend"], t("common.share")),
      channelRecommendSubtitle: tx(["sabiMessengerChannelMenu.channelRecommendSubtitle"], ""),
      channelOpenBot: tx(["sabiMessengerChannelMenu.channelOpenBot"], t("common.open")),
      channelOpenBotSubtitle: tx(["sabiMessengerChannelMenu.channelOpenBotSubtitle"], ""),
    }),
    [state.isBot, state.isBotOwnedByMe, tx],
  );

  const mainRows = useMemo<MenuRow[]>(() => {
    if (state.isBot) {
      return [
        state.isAddedToList
          ? {
              id: "add_to_list",
              title: texts.removeFromList,
              subtitle: texts.removeFromListSubtitle,
              icon: UserMinus,
              iconTint: "#FFCC66",
              iconColors: ["rgba(255,204,102,0.98)", "rgba(109,76,21,0.90)"],
            }
          : {
              id: "add_to_list",
              title: texts.addToList,
              subtitle: texts.addToListSubtitle,
              icon: UserRoundPlus,
              iconTint: "#8FF8E1",
              iconColors: ["rgba(143,248,225,0.98)", "rgba(42,102,92,0.90)"],
            },
        state.isMuted
          ? {
              id: "mute",
              title: texts.unmute,
              subtitle: texts.unmuteSubtitle,
              icon: BellRing,
              iconTint: "#FF88CA",
              iconColors: ["rgba(255,136,202,0.98)", "rgba(108,43,79,0.90)"],
            }
          : {
              id: "mute",
              title: texts.mute,
              subtitle: texts.muteSubtitle,
              icon: BellOff,
              iconTint: "#B588FF",
              iconColors: ["rgba(181,136,255,0.98)", "rgba(71,46,117,0.90)"],
            },
        {
          id: "theme",
          title: texts.theme,
          subtitle: texts.themeSubtitle,
          icon: Palette,
          iconTint: "#FFCC66",
          iconColors: ["rgba(255,204,102,0.98)", "rgba(109,76,21,0.90)"],
        },
        {
          id: "ai",
          title: texts.ai,
          subtitle: texts.aiSubtitle,
          icon: Sparkles,
          iconTint: "#FFE28A",
          iconColors: ["rgba(255,226,138,0.98)", "rgba(115,86,24,0.90)"],
        },
        {
          id: "editor",
          title: texts.editor,
          subtitle: texts.editorSubtitle,
          icon: Bot,
          iconTint: "#7DD7FF",
          iconColors: ["rgba(125,215,255,0.98)", "rgba(45,92,122,0.90)"],
        },
        {
          id: "more",
          title: texts.more,
          subtitle: texts.moreSubtitle,
          icon: BadgePlus,
          hasChevron: true,
          iconTint: "#8FF8E1",
          iconColors: ["rgba(143,248,225,0.98)", "rgba(42,102,92,0.90)"],
        },
      ];
    }

    if (state.roomType === "channel") {
      const rows: MenuRow[] = [
        {
          id: "channel_add_to_chats",
          title: texts.channelAddToChats,
          subtitle: texts.channelAddToChatsSubtitle,
          icon: BadgePlus,
          disabled: !state.canAddChannelToChats,
          iconTint: "#8FF8E1",
          iconColors: ["rgba(143,248,225,0.98)", "rgba(42,102,92,0.90)"],
        },
        {
          id: "channel_share",
          title: texts.channelShare,
          subtitle: texts.channelShareSubtitle,
          icon: MessageSquarePlus,
          iconTint: "#58D5C9",
          iconColors: ["rgba(88,213,201,0.96)", "rgba(31,82,76,0.88)"],
        },
        {
          id: "channel_recommend",
          title: texts.channelRecommend,
          subtitle: texts.channelRecommendSubtitle,
          icon: Megaphone,
          iconTint: "#FFCC66",
          iconColors: ["rgba(255,204,102,0.98)", "rgba(109,76,21,0.90)"],
        },
      ];

      if (state.channelBotId) {
        rows.push({
          id: "channel_open_bot",
          title: texts.channelOpenBot,
          subtitle: texts.channelOpenBotSubtitle || state.channelBotHandle,
          icon: Bot,
          iconTint: "#7DD7FF",
          iconColors: ["rgba(125,215,255,0.98)", "rgba(45,92,122,0.90)"],
        });
      }

      rows.push(
        state.isMuted
          ? {
              id: "mute",
              title: texts.unmute,
              subtitle: texts.unmuteSubtitle,
              icon: BellRing,
              iconTint: "#FF88CA",
              iconColors: ["rgba(255,136,202,0.98)", "rgba(108,43,79,0.90)"],
            }
          : {
              id: "mute",
              title: texts.mute,
              subtitle: texts.muteSubtitle,
              icon: BellOff,
              iconTint: "#B588FF",
              iconColors: ["rgba(181,136,255,0.98)", "rgba(71,46,117,0.90)"],
            },
        {
          id: "theme",
          title: texts.theme,
          subtitle: texts.themeSubtitle,
          icon: Palette,
          iconTint: "#FFCC66",
          iconColors: ["rgba(255,204,102,0.98)", "rgba(109,76,21,0.90)"],
        },
        {
          id: "ai",
          title: texts.ai,
          subtitle: texts.aiSubtitle,
          icon: Sparkles,
          iconTint: "#FFE28A",
          iconColors: ["rgba(255,226,138,0.98)", "rgba(115,86,24,0.90)"],
        },
        {
          id: "editor",
          title: texts.editor,
          subtitle: texts.editorSubtitle,
          icon: MessageSquarePlus,
          iconTint: "#58D5C9",
          iconColors: ["rgba(88,213,201,0.96)", "rgba(31,82,76,0.88)"],
        },
        {
          id: "more",
          title: texts.more,
          subtitle: texts.moreSubtitle,
          icon: BadgePlus,
          hasChevron: true,
          iconTint: "#8FF8E1",
          iconColors: ["rgba(143,248,225,0.98)", "rgba(42,102,92,0.90)"],
        },
      );

      return rows;
    }

    if (state.roomType === "group") {
      return [
        {
          id: "group_add_member",
          title: texts.groupAddMember,
          subtitle: texts.groupAddMemberSubtitle,
          icon: UserRoundPlus,
          disabled: !state.canInviteToGroup,
          iconTint: "#8FF8E1",
          iconColors: ["rgba(143,248,225,0.98)", "rgba(42,102,92,0.90)"],
        },
        {
          id: "group_invite",
          title: texts.groupInvite,
          subtitle: texts.groupInviteSubtitle,
          icon: BadgePlus,
          iconTint: "#FFCC66",
          iconColors: ["rgba(255,204,102,0.98)", "rgba(109,76,21,0.90)"],
        },
        {
          id: "group_share",
          title: texts.groupShare,
          subtitle: texts.groupShareSubtitle,
          icon: MessageSquarePlus,
          iconTint: "#58D5C9",
          iconColors: ["rgba(88,213,201,0.96)", "rgba(31,82,76,0.88)"],
        },
        state.isMuted
          ? {
              id: "mute",
              title: texts.unmute,
              subtitle: texts.unmuteSubtitle,
              icon: BellRing,
              iconTint: "#FF88CA",
              iconColors: ["rgba(255,136,202,0.98)", "rgba(108,43,79,0.90)"],
            }
          : {
              id: "mute",
              title: texts.mute,
              subtitle: texts.muteSubtitle,
              icon: BellOff,
              iconTint: "#B588FF",
              iconColors: ["rgba(181,136,255,0.98)", "rgba(71,46,117,0.90)"],
            },
        {
          id: "theme",
          title: texts.theme,
          subtitle: texts.themeSubtitle,
          icon: Palette,
          iconTint: "#FFCC66",
          iconColors: ["rgba(255,204,102,0.98)", "rgba(109,76,21,0.90)"],
        },
        {
          id: "ai",
          title: texts.ai,
          subtitle: texts.aiSubtitle,
          icon: Sparkles,
          iconTint: "#FFE28A",
          iconColors: ["rgba(255,226,138,0.98)", "rgba(115,86,24,0.90)"],
        },
        {
          id: "editor",
          title: texts.editor,
          subtitle: texts.editorSubtitle,
          icon: MessageSquarePlus,
          iconTint: "#58D5C9",
          iconColors: ["rgba(88,213,201,0.96)", "rgba(31,82,76,0.88)"],
        },
        {
          id: "more",
          title: texts.more,
          subtitle: texts.moreSubtitle,
          icon: BadgePlus,
          hasChevron: true,
          iconTint: "#8FF8E1",
          iconColors: ["rgba(143,248,225,0.98)", "rgba(42,102,92,0.90)"],
        },
      ];
    }

    return [
      state.hasSystemContact
        ? {
            id: "add_contact",
            title: texts.contactSaved,
            subtitle: texts.contactSavedSubtitle,
            icon: ContactRound,
            disabled: true,
            iconTint: "#58D5C9",
            iconColors: ["rgba(88,213,201,0.96)", "rgba(31,82,76,0.88)"],
          }
        : {
            id: "add_contact",
            title: texts.addContact,
            subtitle: state.canAddContact ? texts.addContactSubtitle : texts.contactUnavailable,
            icon: ContactRound,
            disabled: !state.canAddContact,
            iconTint: "#58D5C9",
            iconColors: ["rgba(88,213,201,0.96)", "rgba(31,82,76,0.88)"],
          },
      state.isAddedToList
        ? {
            id: "add_to_list",
            title: texts.removeFromList,
            subtitle: texts.removeFromListSubtitle,
            icon: UserMinus,
            iconTint: "#FFCC66",
            iconColors: ["rgba(255,204,102,0.98)", "rgba(109,76,21,0.90)"],
          }
        : {
            id: "add_to_list",
            title: texts.addToList,
            subtitle: texts.addToListSubtitle,
            icon: UserRoundPlus,
            iconTint: "#8FF8E1",
            iconColors: ["rgba(143,248,225,0.98)", "rgba(42,102,92,0.90)"],
          },
      state.isMuted
        ? {
            id: "mute",
            title: texts.unmute,
            subtitle: texts.unmuteSubtitle,
            icon: BellRing,
            iconTint: "#FF88CA",
            iconColors: ["rgba(255,136,202,0.98)", "rgba(108,43,79,0.90)"],
          }
        : {
            id: "mute",
            title: texts.mute,
            subtitle: texts.muteSubtitle,
            icon: BellOff,
            iconTint: "#B588FF",
            iconColors: ["rgba(181,136,255,0.98)", "rgba(71,46,117,0.90)"],
          },
      state.isDisappearingEnabled
        ? {
            id: "disappearing",
            title: texts.disableDisappearing,
            subtitle: texts.disableDisappearingSubtitle,
            icon: MoonStar,
            iconTint: "#58D5C9",
            iconColors: ["rgba(88,213,201,0.96)", "rgba(31,82,76,0.88)"],
          }
        : {
            id: "disappearing",
            title: texts.disappearing,
            subtitle: texts.disappearingSubtitle,
            icon: MoonStar,
            iconTint: "#B588FF",
            iconColors: ["rgba(181,136,255,0.98)", "rgba(71,46,117,0.90)"],
          },
      {
        id: "theme",
        title: texts.theme,
        subtitle: texts.themeSubtitle,
        icon: Palette,
        iconTint: "#FFCC66",
        iconColors: ["rgba(255,204,102,0.98)", "rgba(109,76,21,0.90)"],
      },
      {
        id: "ai",
        title: texts.ai,
        subtitle: texts.aiSubtitle,
        icon: Sparkles,
        iconTint: "#FFE28A",
        iconColors: ["rgba(255,226,138,0.98)", "rgba(115,86,24,0.90)"],
      },
      {
        id: "editor",
        title: texts.editor,
        subtitle: texts.editorSubtitle,
        icon: MessageSquarePlus,
        iconTint: "#58D5C9",
        iconColors: ["rgba(88,213,201,0.96)", "rgba(31,82,76,0.88)"],
      },
      {
        id: "more",
        title: texts.more,
        subtitle: texts.moreSubtitle,
        icon: BadgePlus,
        hasChevron: true,
        iconTint: "#8FF8E1",
        iconColors: ["rgba(143,248,225,0.98)", "rgba(42,102,92,0.90)"],
      },
    ];
  }, [state, texts]);

  const moreRows = useMemo<MenuRow[]>(
    () => [
      {
        id: "report",
        title: texts.report,
        subtitle: texts.reportSubtitle,
        icon: Flag,
        iconTint: "#FF88CA",
        iconColors: ["rgba(255,136,202,0.98)", "rgba(108,43,79,0.90)"],
      },
      state.isBlocked
        ? {
            id: "block",
            title: texts.unblock,
            subtitle: texts.unblockSubtitle,
            icon: ShieldCheck,
            iconTint: "#58D5C9",
            iconColors: ["rgba(88,213,201,0.96)", "rgba(31,82,76,0.88)"],
          }
        : {
            id: "block",
            title: texts.block,
            subtitle: texts.blockSubtitle,
            icon: ShieldAlert,
            destructive: true,
            iconTint: "#FF9AA5",
            iconColors: ["rgba(255,154,165,0.98)", "rgba(98,39,46,0.90)"],
          },
      {
        id: "hide_conversation",
        title: texts.hideConversation,
        subtitle: texts.hideConversationSubtitle,
        icon: MoonStar,
        destructive: false,
        iconTint: "#8FF8E1",
        iconColors: ["rgba(143,248,225,0.98)", "rgba(42,102,92,0.90)"],
      },
      {
        id: "clear_chat",
        title: texts.clearChat,
        subtitle: texts.clearChatSubtitle,
        icon: Trash2,
        destructive: true,
        iconTint: "#FF9AA5",
        iconColors: ["rgba(255,154,165,0.98)", "rgba(98,39,46,0.90)"],
      },
      {
        id: "add_to_home",
        title: texts.addToHome,
        subtitle: texts.addToHomeSubtitle,
        icon: BadgePlus,
        iconTint: "#FFCC66",
        iconColors: ["rgba(255,204,102,0.98)", "rgba(109,76,21,0.90)"],
      },
    ],
    [state.isBlocked, texts],
  );

  const handleMainPress = (id: MenuRow["id"]) => {
    if (id === "more") {
      setMoreVisible(true);
      return;
    }

    if (id === "theme") {
      onClose();
      onOpenTheme();
      return;
    }

    onClose();
    onSelect(id as MenuSelectableActionId);
  };

  const handleMorePress = (id: MenuSelectableActionId) => {
    setMoreVisible(false);
    onClose();
    onSelect(id);
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View
          style={[
            styles.sheetWrap,
            {
              paddingTop: Math.max(insets.top + 6, 14),
              paddingBottom: Math.max(insets.bottom + 8, 10),
            },
          ]}
        >
          <View style={styles.sheetCardWrap}>
            <View style={styles.sheetCardShadow} />
            <View style={styles.sheetCard}>
              <LinearGradient
                colors={selectedPreset.cardGradient}
                style={[styles.sheetCardFill, { borderColor: `${accent}16` }]}
              >
                <View style={styles.sheetGlow} />
                <View style={styles.sheetBorder} />

                {!moreVisible ? (
                  <>
                    <View style={styles.header}>
                      <View style={styles.headerTextWrap}>
                        <Text style={styles.headerTitle}>{texts.title}</Text>
                        <Text style={styles.headerSubtitle} numberOfLines={1}>
                          {texts.subtitle}
                        </Text>
                      </View>

                      <GlassCircleButton
                        icon={X}
                        onPress={onClose}
                        colors={["rgba(63,103,91,0.92)", "rgba(19,38,33,0.82)"]}
                        iconColor="#F6FFF9"
                        style={styles.headerButton}
                        iconSize={16}
                      />
                    </View>

                    {state.isBot ? (
                      <View style={styles.botHeroWrap}>
                        <View style={styles.botHeroShadow} />
                        <LinearGradient
                          colors={[
                            "rgba(18,34,58,0.94)",
                            "rgba(16,27,48,0.90)",
                            "rgba(10,20,38,0.88)",
                          ]}
                          style={styles.botHeroCard}
                        >
                          <View style={styles.botHeroGlass} />
                          <View style={styles.botHeroBorder} />

                          <View style={styles.botHeroIconWrap}>
                            <LinearGradient
                              colors={[
                                "rgba(120,216,255,0.96)",
                                "rgba(79,142,255,0.90)",
                              ]}
                              style={styles.botHeroIcon}
                            >
                              <Bot size={20} color="#EEF9FF" strokeWidth={2.5} />
                            </LinearGradient>
                          </View>

                          <View style={styles.botHeroTextWrap}>
                            <Text style={styles.botHeroTitle}>{texts.botCardTitle}</Text>
                            <Text style={styles.botHeroHandle} numberOfLines={1}>
                              {state.botHandle || texts.botUnknownHandle}
                            </Text>

                            <View style={styles.botMetaRow}>
                              <View style={styles.botMetaChip}>
                                <Text style={styles.botMetaChipLabel}>
                                  {texts.botIdLabel}
                                </Text>
                                <Text style={styles.botMetaChipValue} numberOfLines={1}>
                                  {state.botId || texts.botNoId}
                                </Text>
                              </View>

                              <View style={styles.botStatusChip}>
                                <View style={styles.botStatusDot} />
                                <Text style={styles.botStatusText}>
                                  {state.isBotOwnedByMe
                                    ? texts.botOwner
                                    : texts.botConnected}
                                </Text>
                              </View>
                            </View>
                          </View>
                        </LinearGradient>
                      </View>
                    ) : null}

                    <ScrollView keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled"
                      showsVerticalScrollIndicator={false}
                      contentContainerStyle={styles.scrollContent}
                    >
                      {mainRows.map((item) => (
                        <MenuItemRow
                          key={item.id}
                          item={item}
                          onPress={() => handleMainPress(item.id)}
                        />
                      ))}
                    </ScrollView>
                  </>
                ) : (
                  <>
                    <View style={styles.header}>
                      <GlassCircleButton
                        icon={ArrowLeft}
                        onPress={() => setMoreVisible(false)}
                        colors={["rgba(63,103,91,0.92)", "rgba(19,38,33,0.82)"]}
                        iconColor="#F6FFF9"
                        style={styles.headerButtonLeft}
                        iconSize={16}
                      />

                      <View style={styles.headerTextWrap}>
                        <Text style={styles.headerTitle}>{texts.more}</Text>
                        <Text style={styles.headerSubtitle} numberOfLines={1}>
                          {state.isBot
                            ? state.botHandle || texts.back
                            : texts.back}
                        </Text>
                      </View>

                      <View style={styles.headerGhost} />
                    </View>

                    <ScrollView keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled"
                      showsVerticalScrollIndicator={false}
                      contentContainerStyle={styles.scrollContent}
                    >
                      {moreRows.map((item) => (
                        <MenuItemRow
                          key={item.id}
                          item={item}
                          onPress={() => handleMorePress(item.id as MenuSelectableActionId)}
                        />
                      ))}
                    </ScrollView>
                  </>
                )}
              </LinearGradient>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.26)",
  },

  sheetWrap: {
    flex: 1,
    paddingHorizontal: 10,
    justifyContent: "flex-start",
    alignItems: "flex-end",
  },

  sheetCardWrap: {
    width: 300,
    position: "relative",
  },

  sheetCardShadow: {
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    bottom: -4,
    borderRadius: 28,
    backgroundColor: "rgba(0,0,0,0.14)",
  },

  sheetCard: {
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOpacity: 0.24,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },

  sheetCardFill: {
    minHeight: 0,
    maxHeight: 548,
    borderRadius: 24,
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 8,
    overflow: "hidden",
    borderWidth: 1,
  },

  sheetGlow: {
    position: "absolute",
    top: -32,
    right: -18,
    width: 150,
    height: 108,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.05)",
  },

  sheetBorder: {
    position: "absolute",
    top: 1,
    left: 1,
    right: 1,
    bottom: 1,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.04)",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },

  headerTextWrap: {
    flex: 1,
    minWidth: 0,
  },

  headerTitle: {
    color: TEXT_MAIN,
    fontSize: 16,
    fontWeight: "900",
  },

  headerSubtitle: {
    color: TEXT_MUTED,
    fontSize: 11,
    marginTop: 2,
    fontWeight: "700",
  },

  headerButton: {
    marginLeft: 8,
  },

  headerButtonLeft: {
    marginRight: 8,
  },

  headerGhost: {
    width: 48,
    height: 48,
    marginLeft: 8,
  },

  botHeroWrap: {
    marginTop: 4,
    marginBottom: 10,
    borderRadius: 22,
  },

  botHeroShadow: {
    ...StyleSheet.absoluteFillObject,
    top: 8,
    left: 8,
    right: 8,
    bottom: -4,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.14)",
  },

  botHeroCard: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "rgba(168,226,255,0.14)",
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
  },

  botHeroGlass: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.03)",
  },

  botHeroBorder: {
    position: "absolute",
    inset: 1,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },

  botHeroIconWrap: {
    marginRight: 12,
  },

  botHeroIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.20)",
  },

  botHeroTextWrap: {
    flex: 1,
    minWidth: 0,
  },

  botHeroTitle: {
    color: TEXT_SECONDARY,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  botHeroHandle: {
    color: TEXT_MAIN,
    fontSize: 16,
    fontWeight: "900",
    marginTop: 2,
  },

  botMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },

  botMetaChip: {
    flex: 1,
    minWidth: 0,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    marginRight: 8,
  },

  botMetaChipLabel: {
    color: TEXT_MUTED,
    fontSize: 9,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  botMetaChipValue: {
    color: TEXT_MAIN,
    fontSize: 11,
    fontWeight: "800",
    marginTop: 2,
  },

  botStatusChip: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "rgba(103,211,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(103,211,255,0.16)",
  },

  botStatusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#72D7FF",
    marginRight: 6,
  },

  botStatusText: {
    color: "#DFF6FF",
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
  },

  scrollContent: {
    paddingTop: 2,
    paddingBottom: 4,
  },

  glassButtonOuter: {
    width: 48,
    height: 48,
    borderRadius: 24,
    position: "relative",
  },

  glassButtonPulse: {
    position: "absolute",
    top: -7,
    left: -7,
    right: -7,
    bottom: -7,
    borderRadius: 32,
    backgroundColor: "rgba(222,255,248,0.9)",
  },

  glassButtonPressable: {
    flex: 1,
  },

  roundButton: {
    flex: 1,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.20)",
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOpacity: 0.26,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 11,
  },

  roundButtonEdge: {
    position: "absolute",
    inset: 1,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },

  buttonGloss: {
    position: "absolute",
    top: 3,
    left: 5,
    right: 5,
    height: 16,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.22)",
  },

  buttonShimmer: {
    position: "absolute",
    top: -8,
    bottom: -8,
    width: 18,
    backgroundColor: "rgba(255,255,255,0.28)",
    opacity: 0.22,
    borderRadius: 20,
  },

  itemPressable: {
    borderRadius: 22,
    marginBottom: 8,
  },

  itemCardWrap: {
    position: "relative",
  },

  itemCardShadow: {
    position: "absolute",
    top: 8,
    left: 8,
    right: 8,
    bottom: -4,
    borderRadius: 24,
    backgroundColor: "rgba(0,0,0,0.14)",
  },

  itemCard: {
    borderRadius: 22,
    overflow: "hidden",
  },

  itemCardFill: {
    minHeight: 70,
    borderRadius: 22,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: SURFACE_BORDER_STRONG,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
  },

  itemGlass: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.02)",
  },

  itemInnerBorder: {
    position: "absolute",
    top: 1,
    left: 1,
    right: 1,
    bottom: 1,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },

  itemActionIcon: {
    marginRight: 10,
  },

  itemTextWrap: {
    flex: 1,
    minWidth: 0,
    marginRight: 6,
  },

  itemTitle: {
    color: TEXT_MAIN,
    fontSize: 14,
    fontWeight: "900",
  },

  itemTitleDanger: {
    color: "#FFECEF",
  },

  itemSubtitle: {
    color: TEXT_SECONDARY,
    fontSize: 11,
    lineHeight: 14,
    marginTop: 3,
    fontWeight: "700",
  },

  pressed: {
    transform: [{ scale: 0.988 }],
    opacity: 0.96,
  },

  itemDisabled: {
    opacity: 0.52,
  },
});

export default ChatRoomSettingsMenu;

