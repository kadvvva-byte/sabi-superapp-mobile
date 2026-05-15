import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  BellOff,
  Lock,
  Pin,
  Trash2,
  BookCheck,
  BookMarked,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react-native";

import { useI18n } from "../src/shared/i18n";
import {
  getPrivateChatProfile,
  markPrivateChatRead,
  markPrivateChatUnread,
  setPrivateChatDeleted,
  setPrivateChatHiddenFromMain,
  setPrivateChatMuted,
  setPrivateChatPinned,
  upsertPrivateChatProfile,
} from "../src/modules/messenger/private/privateChatRuntime";

type RouteParams = {
  chatId?: string;
  chatName?: string;
  roomType?: string;
  phone?: string;
  username?: string;
  avatarLetter?: string;
  verified?: string;
  userId?: string;
};

type SettingRowProps = {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  action?: React.ReactNode;
  onPress?: () => void;
  danger?: boolean;
};

function SettingRow({
  title,
  subtitle,
  icon,
  action,
  onPress,
  danger,
}: SettingRowProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.rowWrap, pressed && styles.pressed]}>
      <LinearGradient
        colors={
          danger
            ? ["rgba(118,28,40,0.92)", "rgba(62,17,26,0.90)"]
            : ["rgba(18,28,45,0.90)", "rgba(9,16,28,0.88)"]
        }
        style={[styles.rowCard, danger && styles.rowCardDanger]}
      >
        <View style={[styles.rowIconWrap, danger && styles.rowIconWrapDanger]}>{icon}</View>

        <View style={styles.rowBody}>
          <Text style={[styles.rowTitle, danger && styles.rowTitleDanger]}>{title}</Text>
          {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
        </View>

        {action ? <View style={styles.rowAction}>{action}</View> : null}
      </LinearGradient>
    </Pressable>
  );
}

export default function PrivateChatSettingsScreen() {
  const params = useLocalSearchParams<RouteParams>();
  const { t } = useI18n();

  const txAny = useCallback(
    (keys: string[]) => {
      for (const key of keys) {
        const value = t(key);
        if (typeof value === "string" && value.trim() && value !== key) {
          return value;
        }
      }
      return "";
    },
    [t],
  );

  const chatId =
    typeof params.chatId === "string" && params.chatId.trim() ? params.chatId.trim() : "";
  const chatName =
    typeof params.chatName === "string" && params.chatName.trim() ? params.chatName.trim() : "Chat";
  const roomType =
    typeof params.roomType === "string" && params.roomType.trim() ? params.roomType.trim() : "direct";
  const phone =
    typeof params.phone === "string" && params.phone.trim() ? params.phone.trim() : undefined;
  const username =
    typeof params.username === "string" && params.username.trim() ? params.username.trim() : undefined;
  const avatarLetter =
    typeof params.avatarLetter === "string" && params.avatarLetter.trim()
      ? params.avatarLetter.trim()
      : chatName.slice(0, 1).toUpperCase();
  const verified = String(params.verified ?? "") === "1";
  const userId =
    typeof params.userId === "string" && params.userId.trim() ? params.userId.trim() : undefined;

  const texts = useMemo(() => {
    const privateWord = txAny(["common.private"]);
    const chatsWord = txAny(["messenger.chats", "tabs.chats"]);
    return {
      title: txAny(["settings.chatSettings", "settings.title"]),
      subtitle: chatName,
      mute: txAny(["messenger.menu.mute", "messenger.muteChat"]),
      unmute: txAny(["messenger.menu.unmute", "messenger.unmuteChat"]),
      notifications: txAny(["settings.notifications", "common.notifications"]),
      pin: txAny(["messenger.pinChat"]),
      unpin: txAny(["messenger.unpinChat"]),
      markRead: txAny(["status.read"]),
      markUnread: txAny(["status.unread"]),
      deleteChat: [txAny(["common.delete"]), chatsWord].filter(Boolean).join(" ").trim(),
      moveToPrivate: [txAny(["common.private"]), chatsWord].filter(Boolean).join(" ").trim(),
      returnToChats: [txAny(["common.open"]), chatsWord].filter(Boolean).join(" ").trim(),
      active: txAny(["status.active", "common.enabled"]),
      hidden: privateWord,
    };
  }, [chatName, txAny]);

  const [muted, setMuted] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [hiddenFromMain, setHiddenFromMain] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const syncProfile = useCallback(async () => {
    if (!chatId) return;

    await upsertPrivateChatProfile({
      chatId,
      name: chatName,
      roomType,
      avatarLetter,
      phone,
      username,
      verified,
    });

    const profile = await getPrivateChatProfile(chatId);
    setMuted(Boolean(profile?.muted));
    setPinned(Boolean(profile?.pinned));
    setHiddenFromMain(Boolean(profile?.hiddenFromMain));
    setUnreadCount(typeof profile?.unreadCount === "number" ? profile.unreadCount : 0);
  }, [avatarLetter, chatId, chatName, phone, roomType, username, verified]);

  useFocusEffect(
    useCallback(() => {
      void syncProfile();
    }, [syncProfile]),
  );

  const goBackAfterDelete = () => {
    if (userId) {
      router.replace({ pathname: "/tabs/chats", params: { userId } } as never);
      return;
    }
    router.replace("/tabs/chats" as never);
  };

  const toggleMute = async () => {
    await setPrivateChatMuted(chatId, !muted);
    setMuted((current) => !current);
  };

  const togglePin = async () => {
    await setPrivateChatPinned(chatId, !pinned);
    setPinned((current) => !current);
  };

  const togglePrivate = async () => {
    await setPrivateChatHiddenFromMain(chatId, !hiddenFromMain);
    setHiddenFromMain((current) => !current);
  };

  const toggleRead = async () => {
    if (unreadCount > 0) {
      await markPrivateChatRead(chatId);
      setUnreadCount(0);
      return;
    }

    await markPrivateChatUnread(chatId, 1);
    setUnreadCount(1);
  };

  const deleteChat = async () => {
    Alert.alert(texts.deleteChat, chatName, [
      {
        text: txAny(["common.cancel"]),
        style: "cancel",
      },
      {
        text: txAny(["common.delete"]),
        style: "destructive",
        onPress: async () => {
          await setPrivateChatDeleted(chatId, true);
          goBackAfterDelete();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right", "bottom"]}>
      <LinearGradient
        colors={["#070D18", "#101728", "#12112F", "#0A1020"]}
        style={styles.background}
      >
        <View style={styles.glowA} />
        <View style={styles.glowB} />

        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.headerButton}>
            <ArrowLeft size={20} strokeWidth={2.4} color="#F6FFF9" />
          </Pressable>

          <View style={styles.headerTextWrap}>
            <Text style={styles.headerTitle}>{texts.title}</Text>
            <Text style={styles.headerSubtitle}>{texts.subtitle}</Text>
          </View>

          <View style={styles.headerButtonGhost} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <LinearGradient
            colors={["rgba(72,52,150,0.88)", "rgba(22,20,47,0.94)"]}
            style={styles.heroCard}
          >
            <View style={styles.heroAvatar}>
              <Text style={styles.heroAvatarText}>{avatarLetter}</Text>
            </View>

            <View style={styles.heroBody}>
              <Text style={styles.heroTitle}>{chatName}</Text>
              <Text style={styles.heroSubtitle}>{texts.hidden}</Text>
            </View>

            <Lock size={18} strokeWidth={2.4} color="#EFE7FF" />
          </LinearGradient>

          <View style={styles.section}>
            <SettingRow
              title={muted ? texts.unmute : texts.mute}
              subtitle={texts.notifications}
              icon={<BellOff size={18} strokeWidth={2.4} color="#E6F7FF" />}
              action={
                <Switch
                  value={muted}
                  onValueChange={() => void toggleMute()}
                />
              }
            />

            <SettingRow
              title={pinned ? texts.unpin : texts.pin}
              subtitle={texts.active}
              icon={<Pin size={18} strokeWidth={2.4} color="#FFE7A9" />}
              action={
                <Switch
                  value={pinned}
                  onValueChange={() => void togglePin()}
                />
              }
            />

            <SettingRow
              title={unreadCount > 0 ? texts.markRead : texts.markUnread}
              subtitle={unreadCount > 0 ? String(unreadCount) : texts.active}
              icon={
                unreadCount > 0 ? (
                  <BookCheck size={18} strokeWidth={2.4} color="#B8FFE7" />
                ) : (
                  <BookMarked size={18} strokeWidth={2.4} color="#B8FFE7" />
                )
              }
              onPress={() => void toggleRead()}
            />

            <SettingRow
              title={hiddenFromMain ? texts.returnToChats : texts.moveToPrivate}
              subtitle={texts.hidden}
              icon={
                hiddenFromMain ? (
                  <PanelRightOpen size={18} strokeWidth={2.4} color="#E7DDFF" />
                ) : (
                  <PanelRightClose size={18} strokeWidth={2.4} color="#E7DDFF" />
                )
              }
              onPress={() => void togglePrivate()}
            />

            <SettingRow
              title={texts.deleteChat}
              subtitle={chatName}
              icon={<Trash2 size={18} strokeWidth={2.4} color="#FFB4C0" />}
              onPress={() => void deleteChat()}
              danger
            />
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  background: { flex: 1 },
  glowA: {
    position: "absolute",
    top: -80,
    right: -60,
    width: 240,
    height: 240,
    borderRadius: 240,
    backgroundColor: "rgba(143,108,255,0.20)",
  },
  glowB: {
    position: "absolute",
    bottom: -90,
    left: -80,
    width: 260,
    height: 260,
    borderRadius: 260,
    backgroundColor: "rgba(89,65,255,0.14)",
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  headerTextWrap: {
    flex: 1,
    paddingHorizontal: 10,
  },
  headerTitle: {
    color: "#F6FFF9",
    fontSize: 24,
    fontWeight: "900",
  },
  headerSubtitle: {
    marginTop: 4,
    color: "rgba(232,255,246,0.74)",
    fontSize: 12,
    fontWeight: "700",
  },
  headerButtonGhost: { width: 44, height: 44 },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 28 },
  heroCard: {
    borderRadius: 28,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "rgba(231,223,255,0.14)",
    flexDirection: "row",
    alignItems: "center",
  },
  heroAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.10)",
    marginRight: 12,
  },
  heroAvatarText: {
    color: "#F6FFF9",
    fontSize: 20,
    fontWeight: "900",
  },
  heroBody: { flex: 1, minWidth: 0 },
  heroTitle: {
    color: "#F6FFF9",
    fontSize: 18,
    fontWeight: "900",
  },
  heroSubtitle: {
    marginTop: 4,
    color: "rgba(239,231,255,0.78)",
    fontSize: 12,
    fontWeight: "700",
  },
  section: { marginTop: 16 },
  rowWrap: { borderRadius: 22, marginBottom: 12 },
  rowCard: {
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    flexDirection: "row",
    alignItems: "center",
  },
  rowCardDanger: {
    borderColor: "rgba(255,165,182,0.20)",
  },
  rowIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    marginRight: 12,
  },
  rowIconWrapDanger: {
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  rowBody: { flex: 1, minWidth: 0 },
  rowTitle: {
    color: "#F6FFF9",
    fontSize: 15,
    fontWeight: "900",
  },
  rowTitleDanger: {
    color: "#FFE8ED",
  },
  rowSubtitle: {
    marginTop: 5,
    color: "rgba(232,255,246,0.70)",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
  },
  rowAction: { marginLeft: 12 },
  pressed: { transform: [{ scale: 0.985 }] },
});
