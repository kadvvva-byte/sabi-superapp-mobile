import React, { useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, ChevronRight } from "lucide-react-native";

import { useI18n } from "../src/shared/i18n";
import {
  getRoomSettingsState,
  setChatBlocked,
} from "../src/modules/messenger/chat-room/data";

type ToolKind =
  | "disappearing"
  | "report"
  | "clear_chat"
  | "export_chat"
  | "add_to_home"
  | "more";

type DisappearingTimerId =
  | "off"
  | "30_seconds"
  | "1_minute"
  | "5_minutes"
  | "1_hour"
  | "1_day"
  | "7_days";

function tx(t: (key: string) => string, keys: string[], fallback: string) {
  for (const key of keys) {
    const value = t(key);
    if (value && value !== key) return value;
  }
  return fallback;
}

function Row({
  title,
  subtitle,
  onPress,
  destructive = false,
  activeBadge,
  rightChevron = true,
}: {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  destructive?: boolean;
  activeBadge?: string;
  rightChevron?: boolean;
}) {
  const accent = destructive ? "#FF9AAE" : "#8EF6E0";

  return (
    <Pressable onPress={onPress} disabled={!onPress} style={styles.rowPressable}>
      {({ pressed }) => (
        <View style={[styles.rowShadowWrap, pressed && styles.pressed]}>
          <View style={styles.rowShadow} />
          <LinearGradient
            colors={[
              "rgba(255,255,255,0.15)",
              "rgba(255,255,255,0.05)",
              "rgba(255,255,255,0.02)",
            ]}
            style={styles.rowCard}
          >
            <View style={styles.rowGloss} />
            <View style={styles.rowTextWrap}>
              <Text style={[styles.rowTitle, destructive && styles.rowTitleDanger]}>
                {title}
              </Text>
              {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
            </View>
            {activeBadge ? (
              <View
                style={[
                  styles.badge,
                  {
                    borderColor: `${accent}38`,
                    backgroundColor: `${accent}12`,
                  },
                ]}
              >
                <Text style={[styles.badgeText, { color: accent }]}>{activeBadge}</Text>
              </View>
            ) : null}
            {rightChevron ? (
              <ChevronRight size={18} color="rgba(244,251,255,0.58)" strokeWidth={2.4} />
            ) : null}
          </LinearGradient>
        </View>
      )}
    </Pressable>
  );
}

export default function ChatToolScreen() {
  const { t } = useI18n();
  const params = useLocalSearchParams<{
    chatId?: string;
    tool?: string;
    fallbackName?: string;
  }>();

  const chatId =
    typeof params.chatId === "string" && params.chatId.trim() ? params.chatId.trim() : "1";
  const tool = typeof params.tool === "string" ? (params.tool as ToolKind) : "more";
  const fallbackName =
    typeof params.fallbackName === "string" && params.fallbackName.trim()
      ? params.fallbackName.trim()
      : undefined;

  const [version, setVersion] = useState(0);
  const [selectedDisappearingTimer, setSelectedDisappearingTimer] =
    useState<DisappearingTimerId>("off");
  const [wasReported, setWasReported] = useState(false);
  const [wasExported, setWasExported] = useState(false);
  const [wasHomeRequested, setWasHomeRequested] = useState(false);

  const refresh = () => setVersion((current) => current + 1);

  const roomState = useMemo(
    () => getRoomSettingsState(chatId, fallbackName),
    [chatId, fallbackName, version],
  );

  const title =
    tool === "disappearing"
      ? tx(t, ["messenger.disappearingMessages"], "Исчезающие сообщения")
      : tool === "report"
        ? tx(t, ["messenger.report"], "Пожаловаться")
        : tool === "clear_chat"
          ? tx(t, ["messenger.clearChat"], "Очистить чат")
          : tool === "export_chat"
            ? tx(t, ["messenger.exportChat"], "Экспорт чата")
            : tool === "add_to_home"
              ? tx(t, ["messenger.addIconToHome"], "Добавить иконку на экран")
              : tx(t, ["common.more"], "Ещё");

  const activeTimer =
    (roomState.privacy?.disappearingTimer as DisappearingTimerId | undefined) ||
    selectedDisappearingTimer;

  const disappearingOptions: { id: DisappearingTimerId; label: string }[] = [
    { id: "off", label: tx(t, ["common.off"], "Выкл") },
    { id: "30_seconds", label: "30 сек" },
    { id: "1_minute", label: "1 мин" },
    { id: "5_minutes", label: "5 мин" },
    { id: "1_hour", label: "1 час" },
    { id: "1_day", label: "1 день" },
    { id: "7_days", label: "7 дней" },
  ];

  const handleExport = async () => {
    const exportText = [
      fallbackName || `Chat ${chatId}`,
      tx(t, ["messenger.exportChatSubtitle"], "Экспорт истории чата подготовлен."),
    ].join("\n\n");

    await Share.share({ message: exportText });
    setWasExported(true);
    refresh();
  };

  const handleAddHomeIconFoundation = async () => {
    setWasHomeRequested(true);
    refresh();

    await Share.share({
      message: `sabi://chat/${chatId}`,
    });
  };

  const handleReport = () => {
    setWasReported(true);
    refresh();
    Alert.alert(
      tx(t, ["messenger.report"], "Пожаловаться"),
      tx(t, ["messenger.reportSubtitle"], "Жалоба подготовлена."),
    );
  };

  const handleClearChat = () => {
    Alert.alert(
      tx(t, ["messenger.clearChat"], "Очистить чат"),
      tx(t, ["messenger.clearChatConfirm"], "Удалить все сообщения в этом чате?"),
      [
        {
          text: tx(t, ["common.cancel"], "Отмена"),
          style: "cancel",
        },
        {
          text: tx(t, ["common.delete"], "Удалить"),
          style: "destructive",
          onPress: () => {
            router.back();
          },
        },
      ],
    );
  };

  return (
    <LinearGradient colors={["#07131D", "#0A1825", "#0F2131", "#102838"]} style={styles.gradient}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={20} color="#F7FBFF" strokeWidth={2.5} />
          </Pressable>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {title}
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {tool === "disappearing" ? (
            <>
              {disappearingOptions.map((item) => (
                <Row
                  key={item.id}
                  title={item.label}
                  subtitle={
                    item.id === "off"
                      ? tx(
                          t,
                          ["messenger.disappearingMessagesOffSubtitle"],
                          "Сообщения не будут удаляться автоматически",
                        )
                      : tx(
                          t,
                          ["messenger.disappearingMessagesOnSubtitle"],
                          "Таймер будет применён к новым сообщениям",
                        )
                  }
                  activeBadge={
                    activeTimer === item.id ? tx(t, ["common.active"], "Активно") : undefined
                  }
                  onPress={() => {
                    setSelectedDisappearingTimer(item.id);
                    refresh();
                  }}
                />
              ))}
            </>
          ) : null}

          {(tool === "more" || tool === "report") ? (
            <>
              <Row
                title={tx(t, ["messenger.report"], "Пожаловаться")}
                subtitle={tx(t, ["messenger.reportSubtitle"], "Отправить жалобу на этот чат")}
                activeBadge={wasReported ? tx(t, ["common.sent"], "Отправлено") : undefined}
                onPress={handleReport}
              />
            </>
          ) : null}

          {(tool === "more" || tool === "clear_chat") ? (
            <>
              <Row
                title={
                  roomState.block.isBlocked
                    ? tx(t, ["messenger.unblock", "common.unblock"], "Разблокировать")
                    : tx(t, ["messenger.block", "common.block"], "Заблокировать")
                }
                subtitle={
                  roomState.block.isBlocked
                    ? tx(t, ["messenger.blockSubtitleActive"], "Пользователь уже заблокирован")
                    : tx(t, ["messenger.blockSubtitle"], "Заблокировать этот чат")
                }
                activeBadge={
                  roomState.block.isBlocked ? tx(t, ["common.enabled"], "Вкл") : undefined
                }
                onPress={() => {
                  setChatBlocked(chatId, !roomState.block.isBlocked);
                  refresh();
                }}
              />

              <Row
                title={tx(t, ["messenger.clearChat"], "Очистить чат")}
                subtitle={tx(
                  t,
                  ["messenger.clearChatSubtitle"],
                  "Удалить историю сообщений в этом чате",
                )}
                destructive
                onPress={handleClearChat}
              />
            </>
          ) : null}

          {(tool === "more" || tool === "export_chat") ? (
            <>
              <Row
                title={tx(t, ["messenger.exportChat"], "Экспорт чата")}
                subtitle={tx(
                  t,
                  ["messenger.exportChatSubtitle"],
                  "Подготовить и поделиться текстовой историей чата",
                )}
                activeBadge={wasExported ? tx(t, ["common.ready"], "Готово") : undefined}
                onPress={() => {
                  void handleExport();
                }}
              />
            </>
          ) : null}

          {(tool === "more" || tool === "add_to_home") ? (
            <>
              <Row
                title={tx(t, ["messenger.addIconToHome"], "Добавить иконку на экран")}
                subtitle={tx(
                  t,
                  ["messenger.addIconToHomeSubtitle"],
                  "Подготовить ярлык чата для системного pin/share",
                )}
                activeBadge={wasHomeRequested ? tx(t, ["common.ready"], "Готово") : undefined}
                onPress={() => {
                  void handleAddHomeIconFoundation();
                }}
              />
            </>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
    marginHorizontal: 12,
  },
  headerSpacer: { width: 42 },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  rowPressable: { marginBottom: 10 },
  rowShadowWrap: { position: "relative" },
  rowShadow: {
    position: "absolute",
    top: 8,
    left: 10,
    right: 10,
    bottom: -3,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.14)",
  },
  rowCard: {
    minHeight: 74,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 14,
    paddingVertical: 11,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
  },
  rowGloss: {
    position: "absolute",
    top: 6,
    left: 12,
    right: 12,
    height: 16,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  rowTextWrap: {
    flex: 1,
    minWidth: 0,
    paddingRight: 10,
  },
  rowTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },
  rowTitleDanger: {
    color: "#FFD7DD",
  },
  rowSubtitle: {
    marginTop: 4,
    color: "rgba(230,240,255,0.70)",
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 16,
  },
  badge: {
    minHeight: 26,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 9,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "900",
  },
  pressed: {
    opacity: 0.95,
    transform: [{ scale: 0.988 }],
  },
});
