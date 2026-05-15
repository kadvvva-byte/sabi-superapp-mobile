import React, { useMemo, useState, useSyncExternalStore } from "react";
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Bell, Pin, ShieldAlert } from "lucide-react-native";

import {
  NOTIFICATION_TABS,
  QUICK_FILTERS,
  INITIAL_NOTIFICATIONS,
} from "../src/modules/notifications/data/notifications";
import type {
  AppNotification,
  NotificationModule,
  NotificationQuickFilter,
} from "../src/modules/notifications/types";
import {
  normalizeRuntimeLanguage,
  pickRuntimeDictionary,
  useRuntimeLanguage,
} from "../src/shared/i18n/runtime-language";
import { openSabiHome } from "../src/modules/home/navigation/homeRoutes";

import {
  getAppOverlayNotificationState,
  subscribeAppOverlayNotificationState,
  type AppOverlayNotification,
} from "../src/modules/notifications/overlay/app-notification-overlay-store";

const BG_TOP = "#05140D";
const BG_MID = "#062018";
const BG_BOTTOM = "#08261E";
const CARD = "rgba(16, 31, 48, 0.82)";
const CARD_SOFT = "rgba(26, 44, 64, 0.82)";
const CARD_BORDER = "rgba(120, 220, 160, 0.12)";
const TEXT = "#F5FBFF";
const MUTED = "#A8C3D7";
const GREEN = "#77E28C";
const BLUE = "#63A8FF";
const GOLD = "#FFCC66";
const FAIL = "#FB7185";
const CRITICAL = "#F97316";

const LOCAL_AUTO_CURRENCIES = new Set(["UZS", "KZT", "TJS", "KGS", "TMT", "RUB"]);

const SCREEN_TEXTS = {
  en: {
    home: "Home",
    prefs: "Prefs",
    title: "Notifications",
    unread: "Unread",
    critical: "Critical",
    balance: "Balance",
    markVisibleRead: "Mark visible read",
    noItems: "No notifications",
    markRead: "Read",
    markUnread: "Unread",
    pin: "Pin",
    unpin: "Unpin",
    itemsWord: "items",
    priority: "Priority",
    counterparty: "Counterparty",
    ref: "Ref",
    modeLocal: "Local",
    modeInternationalUsd: "International USD",
    modeInternational: "International",
    tabs: {
      all: "All",
      balance: "Balance",
      wallet: "Wallet",
      business: "Business",
      merchant: "Merchant",
      messenger: "Messenger",
      marketplace: "Marketplace",
      stream: "Stream",
      security: "Security",
      system: "System",
      ai: "AI",
    },
    filters: {
      all: "All",
      unread: "Unread",
      critical: "Critical",
      incoming: "Incoming",
      outgoing: "Outgoing",
      failed: "Failed",
      balance_changed: "Balance",
    },
  },
  ru: {
    home: "Домой",
    prefs: "Настр.",
    title: "Уведомления",
    unread: "Новые",
    critical: "Критич.",
    balance: "Баланс",
    markVisibleRead: "Отметить прочитанными",
    noItems: "Нет уведомлений",
    markRead: "Прочитано",
    markUnread: "Не прочитано",
    pin: "Закрепить",
    unpin: "Открепить",
    itemsWord: "элементов",
    priority: "Приоритет",
    counterparty: "Сторона",
    ref: "Ref",
    modeLocal: "Локальная",
    modeInternationalUsd: "Международная USD",
    modeInternational: "Международная",
    tabs: {
      all: "Все",
      balance: "Баланс",
      wallet: "Кошелёк",
      business: "Бизнес",
      merchant: "Мерчант",
      messenger: "Messenger",
      marketplace: "Marketplace",
      stream: "Stream",
      security: "Безопасность",
      system: "Система",
      ai: "AI",
    },
    filters: {
      all: "Все",
      unread: "Новые",
      critical: "Критич.",
      incoming: "Входящие",
      outgoing: "Исходящие",
      failed: "Ошибка",
      balance_changed: "Баланс",
    },
  },
  uz: {
    home: "Bosh sahifa",
    prefs: "Sozlam.",
    title: "Bildirishnomalar",
    unread: "Yangi",
    critical: "Muhim",
    balance: "Balans",
    markVisibleRead: "O‘qilgan qilish",
    noItems: "Bildirishnoma yo‘q",
    markRead: "O‘qilgan",
    markUnread: "O‘qilmagan",
    pin: "Mahkamlash",
    unpin: "Olib tashlash",
    itemsWord: "ta",
    priority: "Daraja",
    counterparty: "Tomon",
    ref: "Ref",
    modeLocal: "Mahalliy",
    modeInternationalUsd: "Xalqaro USD",
    modeInternational: "Xalqaro",
    tabs: {
      all: "Barchasi",
      balance: "Balans",
      wallet: "Hamyon",
      business: "Biznes",
      merchant: "Merchant",
      messenger: "Messenger",
      marketplace: "Marketplace",
      stream: "Stream",
      security: "Xavfsizlik",
      system: "Tizim",
      ai: "AI",
    },
    filters: {
      all: "Barchasi",
      unread: "Yangi",
      critical: "Muhim",
      incoming: "Kirim",
      outgoing: "Chiqim",
      failed: "Xato",
      balance_changed: "Balans",
    },
  },
} as const;

type ScreenTexts = (typeof SCREEN_TEXTS)[keyof typeof SCREEN_TEXTS];

function getStatusColor(item: AppNotification) {
  if (item.isCritical) return CRITICAL;
  if (item.status === "success") return GREEN;
  if (item.status === "failed") return FAIL;
  if (item.status === "pending") return GOLD;
  return BLUE;
}

function matchesQuickFilter(item: AppNotification, quickFilter: NotificationQuickFilter) {
  switch (quickFilter) {
    case "unread":
      return !item.isRead;
    case "critical":
      return item.isCritical || item.priority === "critical";
    case "incoming":
      return item.balanceChange?.direction === "in";
    case "outgoing":
      return item.balanceChange?.direction === "out";
    case "failed":
      return item.status === "failed";
    case "balance_changed":
      return item.hasBalanceImpact;
    case "all":
    default:
      return true;
  }
}

function getCurrencyMode(item: AppNotification, texts: ScreenTexts) {
  const raw = item.balanceChange?.currency?.trim().toUpperCase();
  if (!raw || LOCAL_AUTO_CURRENCIES.has(raw)) return texts.modeLocal;
  if (raw === "USD") return texts.modeInternationalUsd;
  return `${texts.modeInternational} ${raw}`;
}

function formatMoney(item: AppNotification) {
  if (!item.balanceChange) return null;
  const sign = item.balanceChange.direction === "out" ? "-" : item.balanceChange.direction === "in" ? "+" : "";
  const raw = item.balanceChange.currency?.trim().toUpperCase();
  const suffix = raw && !LOCAL_AUTO_CURRENCIES.has(raw) ? ` ${raw}` : "";
  return `${sign}${item.balanceChange.amount.toLocaleString()}${suffix}`;
}

function formatTime(value: string) {
  const date = new Date(value);
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getNotificationModuleFromOverlay(item: AppOverlayNotification): Exclude<NotificationModule, "all"> {
  if (item.kind === "message") return "messenger";
  if (item.kind === "missed_call") return "messenger";
  if (item.kind === "wallet") return "wallet";
  if (item.kind === "security") return "security";
  if (item.kind === "ai") return "ai";
  return "system";
}

function getNotificationEventTypeFromOverlay(item: AppOverlayNotification): AppNotification["eventType"] {
  if (item.kind === "message") return "message_received";
  if (item.kind === "missed_call") return "missed_call";
  if (item.kind === "wallet") return "transfer_received";
  if (item.kind === "security") return "security_sensitive_action";
  if (item.kind === "ai") return "ai_alert";
  return "system_update";
}

function overlayItemToNotification(item: AppOverlayNotification): AppNotification {
  const isWallet = item.kind === "wallet";
  const isCritical = item.priority === "critical";

  return {
    id: `overlay:${item.id}`,
    module: getNotificationModuleFromOverlay(item),
    eventType: getNotificationEventTypeFromOverlay(item),
    title: item.title,
    message: item.message,
    status: "success",
    priority: item.priority || (isWallet ? "high" : "medium"),
    createdAt: item.createdAt,
    isRead: false,
    isPinned: false,
    isCritical,
    hasBalanceImpact: isWallet,
    balanceChange: isWallet && typeof item.amount === "number"
      ? { amount: item.amount, currency: item.currency || "", direction: "in" }
      : undefined,
    counterparty: item.counterparty,
    referenceId: item.referenceId,
    tags: [item.kind],
  };
}

export default function NotificationsScreen() {
  const language = useRuntimeLanguage();
  const texts = pickRuntimeDictionary(normalizeRuntimeLanguage(language), SCREEN_TEXTS);
  const [selectedTab, setSelectedTab] = useState<NotificationModule>("all");
  const [quickFilter, setQuickFilter] = useState<NotificationQuickFilter>("all");
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const overlayState = useSyncExternalStore(
    subscribeAppOverlayNotificationState,
    getAppOverlayNotificationState,
    getAppOverlayNotificationState,
  );

  const liveNotifications = useMemo(() => {
    return overlayState.items.map(overlayItemToNotification);
  }, [overlayState.items]);

  const allNotifications = useMemo(() => {
    const localIds = new Set(notifications.map((item) => item.id));
    return [
      ...liveNotifications.filter((item) => !localIds.has(item.id)),
      ...notifications,
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [liveNotifications, notifications]);

  const filtered = useMemo(() => {
    return allNotifications.filter((item) => {
      const moduleMatch = selectedTab === "all" || item.module === selectedTab;
      return moduleMatch && matchesQuickFilter(item, quickFilter);
    });
  }, [allNotifications, quickFilter, selectedTab]);

  const unreadCount = useMemo(() => allNotifications.filter((item) => !item.isRead).length, [allNotifications]);
  const criticalCount = useMemo(() => allNotifications.filter((item) => item.isCritical || item.priority === "critical").length, [allNotifications]);
  const balanceCount = useMemo(() => allNotifications.filter((item) => item.hasBalanceImpact).length, [allNotifications]);

  const markVisibleRead = () => {
    const visibleIds = new Set(filtered.map((item) => item.id));
    setNotifications((prev) => prev.map((item) => visibleIds.has(item.id) ? { ...item, isRead: true } : item));
  };

  const toggleRead = (id: string) => {
    setNotifications((prev) => prev.map((item) => item.id === id ? { ...item, isRead: !item.isRead } : item));
  };

  const togglePin = (id: string) => {
    setNotifications((prev) => prev.map((item) => item.id === id ? { ...item, isPinned: !item.isPinned } : item));
  };

  return (
    <LinearGradient colors={[BG_TOP, BG_MID, BG_BOTTOM]} style={styles.gradient}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right", "bottom"]}>
        <View style={styles.backgroundOrbTop} />
        <View style={styles.backgroundOrbBottom} />

        <View style={styles.container}>
          <View style={styles.fixedButtonsRow}>
            <Pressable onPress={() => router.push("/notification-preferences" as never)} style={styles.headerButton}>
              <Text style={styles.headerButtonText}>{texts.prefs}</Text>
            </Pressable>
            <Pressable onPress={() => openSabiHome()} style={styles.headerButton}>
              <Text style={styles.headerButtonText}>{texts.home}</Text>
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <View style={styles.headerBlock}>
              <View style={styles.titleRow}>
                <View style={styles.titleIconWrap}>
                  <Bell size={20} color={GREEN} strokeWidth={2.4} />
                </View>
                <Text style={styles.title}>{texts.title}</Text>
              </View>
            </View>

            <View style={styles.summaryRow}>
              <SummaryCard title={texts.unread} value={`${unreadCount}`} accent={GREEN} />
              <SummaryCard title={texts.critical} value={`${criticalCount}`} accent={CRITICAL} />
              <SummaryCard title={texts.balance} value={`${balanceCount}`} accent={BLUE} />
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
              {NOTIFICATION_TABS.map((tab) => {
                const active = selectedTab === tab.key;
                return (
                  <Pressable key={tab.key} onPress={() => setSelectedTab(tab.key)} style={[styles.tabChip, active && styles.tabChipActive]}>
                    <Text style={[styles.tabChipText, active && styles.tabChipTextActive]}>{texts.tabs[tab.key]}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
              {QUICK_FILTERS.map((filter) => {
                const active = quickFilter === filter.key;
                return (
                  <Pressable key={filter.key} onPress={() => setQuickFilter(filter.key)} style={[styles.filterChip, active && styles.filterChipActive]}>
                    <Text style={[styles.filterText, active && styles.filterTextActive]}>{texts.filters[filter.key]}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <View style={styles.listHeaderRow}>
              <Text style={styles.listCount}>{filtered.length} {texts.itemsWord}</Text>
              {filtered.length > 0 ? (
                <Pressable onPress={markVisibleRead} style={styles.markVisibleButton}>
                  <Text style={styles.markVisibleText}>{texts.markVisibleRead}</Text>
                </Pressable>
              ) : null}
            </View>

            <View style={styles.listWrap}>
              {filtered.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Bell size={24} color={MUTED} strokeWidth={2.4} />
                  <Text style={styles.emptyTitle}>{texts.noItems}</Text>
                </View>
              ) : (
                filtered.map((item) => {
                  const statusColor = getStatusColor(item);
                  const money = formatMoney(item);
                  return (
                    <View key={item.id} style={[styles.notificationCard, !item.isRead && styles.unreadCard]}>
                      <View style={styles.notificationTopRow}>
                        <View style={styles.notificationTitleWrap}>
                          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                          <Text style={styles.notificationTitle}>{item.title}</Text>
                        </View>
                        {item.isCritical ? <ShieldAlert size={18} color={CRITICAL} strokeWidth={2.4} /> : null}
                      </View>

                      {item.message ? <Text style={styles.notificationMessage}>{item.message}</Text> : null}

                      <View style={styles.metaRow}>
                        <Text style={styles.metaText}>{texts.tabs[item.module]}</Text>
                        <Text style={styles.metaText}>{formatTime(item.createdAt)}</Text>
                      </View>

                      {money ? (
                        <View style={styles.balanceRow}>
                          <Text style={[styles.balanceAmount, { color: statusColor }]}>{money}</Text>
                          <Text style={styles.balanceMode}>{getCurrencyMode(item, texts)}</Text>
                        </View>
                      ) : null}

                      <View style={styles.detailsGrid}>
                        {item.counterparty ? <Detail label={texts.counterparty} value={item.counterparty} /> : null}
                        {item.referenceId ? <Detail label={texts.ref} value={item.referenceId} /> : null}
                        <Detail label={texts.priority} value={item.priority.toUpperCase()} />
                      </View>

                      <View style={styles.cardActionsRow}>
                        <Pressable onPress={() => toggleRead(item.id)} style={styles.cardActionButton}>
                          <Text style={styles.cardActionText}>{item.isRead ? texts.markUnread : texts.markRead}</Text>
                        </Pressable>
                        <Pressable onPress={() => togglePin(item.id)} style={styles.cardActionButton}>
                          <Pin size={13} color={item.isPinned ? GOLD : MUTED} strokeWidth={2.4} />
                          <Text style={styles.cardActionText}>{item.isPinned ? texts.unpin : texts.pin}</Text>
                        </Pressable>
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

function SummaryCard({ title, value, accent }: { title: string; value: string; accent: string }) {
  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={[styles.summaryLabel, { color: accent }]}>{title}</Text>
    </View>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailItem}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safeArea: { flex: 1 },
  backgroundOrbTop: { position: "absolute", top: -110, right: -70, width: 240, height: 240, borderRadius: 240, backgroundColor: "rgba(119,226,140,0.13)" },
  backgroundOrbBottom: { position: "absolute", bottom: -120, left: -70, width: 280, height: 280, borderRadius: 280, backgroundColor: "rgba(99,168,255,0.11)" },
  container: { flex: 1, paddingHorizontal: 16 },
  fixedButtonsRow: { flexDirection: "row", justifyContent: "flex-end", gap: 10, paddingTop: 8, paddingBottom: 10 },
  headerButton: { borderRadius: 999, paddingHorizontal: 14, paddingVertical: 9, backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: CARD_BORDER },
  headerButtonText: { color: TEXT, fontSize: 12, fontWeight: "900" },
  scrollContent: { paddingBottom: 28, gap: 14 },
  headerBlock: { borderRadius: 28, padding: 18, backgroundColor: CARD, borderWidth: 1, borderColor: CARD_BORDER },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  titleIconWrap: { width: 42, height: 42, borderRadius: 17, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(119,226,140,0.13)", borderWidth: 1, borderColor: "rgba(119,226,140,0.24)" },
  title: { color: TEXT, fontSize: 28, fontWeight: "900", letterSpacing: -0.5 },
  summaryRow: { flexDirection: "row", gap: 10 },
  summaryCard: { flex: 1, minHeight: 78, borderRadius: 22, padding: 14, backgroundColor: CARD_SOFT, borderWidth: 1, borderColor: CARD_BORDER, justifyContent: "center" },
  summaryValue: { color: TEXT, fontSize: 24, fontWeight: "900" },
  summaryLabel: { marginTop: 3, fontSize: 11, fontWeight: "900" },
  tabsRow: { gap: 8, paddingRight: 20 },
  tabChip: { borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10, backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: CARD_BORDER },
  tabChipActive: { backgroundColor: GREEN, borderColor: GREEN },
  tabChipText: { color: MUTED, fontSize: 12, fontWeight: "900" },
  tabChipTextActive: { color: "#07130B" },
  filterRow: { gap: 8, paddingRight: 20 },
  filterChip: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: CARD_BORDER },
  filterChipActive: { backgroundColor: "rgba(99,168,255,0.2)", borderColor: "rgba(99,168,255,0.46)" },
  filterText: { color: MUTED, fontSize: 11, fontWeight: "900" },
  filterTextActive: { color: TEXT },
  listHeaderRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  listCount: { color: MUTED, fontSize: 12, fontWeight: "900" },
  markVisibleButton: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: "rgba(119,226,140,0.13)", borderWidth: 1, borderColor: "rgba(119,226,140,0.26)" },
  markVisibleText: { color: GREEN, fontSize: 11, fontWeight: "900" },
  listWrap: { gap: 10 },
  emptyCard: { minHeight: 160, borderRadius: 26, alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: CARD, borderWidth: 1, borderColor: CARD_BORDER },
  emptyTitle: { color: MUTED, fontSize: 14, fontWeight: "900" },
  notificationCard: { borderRadius: 24, padding: 15, backgroundColor: CARD, borderWidth: 1, borderColor: CARD_BORDER, gap: 10 },
  unreadCard: { borderColor: "rgba(119,226,140,0.34)", backgroundColor: "rgba(18, 42, 44, 0.84)" },
  notificationTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  notificationTitleWrap: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 },
  statusDot: { width: 9, height: 9, borderRadius: 999 },
  notificationTitle: { flex: 1, color: TEXT, fontSize: 15, lineHeight: 20, fontWeight: "900" },
  notificationMessage: { color: MUTED, fontSize: 13, lineHeight: 18, fontWeight: "600" },
  metaRow: { flexDirection: "row", justifyContent: "space-between", gap: 10 },
  metaText: { color: MUTED, fontSize: 11, fontWeight: "800" },
  balanceRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10, borderRadius: 18, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: "rgba(255,255,255,0.05)" },
  balanceAmount: { fontSize: 17, fontWeight: "900" },
  balanceMode: { color: MUTED, fontSize: 11, fontWeight: "800" },
  detailsGrid: { gap: 7 },
  detailItem: { flexDirection: "row", justifyContent: "space-between", gap: 10 },
  detailLabel: { color: MUTED, fontSize: 11, fontWeight: "800" },
  detailValue: { flex: 1, color: TEXT, fontSize: 11, fontWeight: "900", textAlign: "right" },
  cardActionsRow: { flexDirection: "row", gap: 8, marginTop: 2 },
  cardActionButton: { flex: 1, minHeight: 40, borderRadius: 15, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: CARD_BORDER },
  cardActionText: { color: TEXT, fontSize: 12, fontWeight: "900" },
});
