import { useMemo, useSyncExternalStore } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Bell, Bot, CalendarDays, MessageCircle, Phone, ShieldCheck, WalletCards } from "lucide-react-native";

import type { HomeMobileText } from "../../../shared/i18n/home-mobile-translations";
import { useHomeFoundation } from "../foundation/useHomeFoundation";
import {
  getAppOverlayNotificationState,
  subscribeAppOverlayNotificationState,
} from "../../notifications/overlay/app-notification-overlay-store";

function formatCount(value: number | null | undefined): string {
  if (typeof value !== "number") return "0";
  return String(Math.max(0, value));
}

function useOverlayDigest() {
  return useSyncExternalStore(
    subscribeAppOverlayNotificationState,
    getAppOverlayNotificationState,
    getAppOverlayNotificationState,
  );
}

export default function HomeFoundationStrip({
  text,
  borderColor,
}: {
  text: HomeMobileText;
  borderColor: string;
  transparentMode?: boolean;
}) {
  const { manifest } = useHomeFoundation();
  const digest = manifest.notificationDigest;
  const overlayDigest = useOverlayDigest();

  const items = useMemo(() => [
    {
      key: "calls",
      label: text.calls,
      value: formatCount((digest.missedCalls || 0) + overlayDigest.missedCalls),
      icon: Phone,
    },
    {
      key: "messages",
      label: text.messages,
      value: formatCount((digest.unreadMessages || 0) + overlayDigest.unreadMessages),
      icon: MessageCircle,
    },
    {
      key: "wallet",
      label: "Wallet",
      value: formatCount(overlayDigest.moneyEvents),
      icon: WalletCards,
    },
    {
      key: "events",
      label: text.events,
      value: formatCount(digest.events),
      icon: CalendarDays,
    },
    {
      key: "ai",
      label: text.ai,
      value: formatCount(digest.aiAlerts),
      icon: Bot,
    },
    {
      key: "security",
      label: text.security,
      value: formatCount((digest.securityAlerts || 0) + overlayDigest.criticalEvents),
      icon: ShieldCheck,
    },
  ], [
    digest.aiAlerts,
    digest.events,
    digest.missedCalls,
    digest.securityAlerts,
    digest.unreadMessages,
    overlayDigest.criticalEvents,
    overlayDigest.missedCalls,
    overlayDigest.moneyEvents,
    overlayDigest.unreadMessages,
    text.ai,
    text.calls,
    text.events,
    text.messages,
    text.security,
  ]);

  return (
    <Pressable style={[styles.card, { borderColor }]} onPress={() => router.push("/notifications" as never)}>
      <View style={styles.headerRow}>
        <View style={styles.titleWrap}>
          <Bell size={17} color="#FFFFFF" strokeWidth={2.4} />
          <Text style={styles.title}>{text.alertsTitle}</Text>
        </View>
      </View>

      <View style={styles.metricsRow}>
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <View key={item.key} style={styles.metricCard}>
              <Icon size={15} color="#FFFFFF" strokeWidth={2.4} />
              <Text style={styles.metricValue}>{item.value}</Text>
              <Text style={styles.metricLabel} numberOfLines={1}>{item.label}</Text>
            </View>
          );
        })}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 12,
    marginBottom: 4,
    overflow: "hidden",
    backgroundColor: "rgba(9,17,26,0.98)",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 10,
  },
  titleWrap: { flexDirection: "row", alignItems: "center", gap: 9, flex: 1 },
  title: { color: "#FFFFFF", fontSize: 14, fontWeight: "900" },
  metricsRow: { flexDirection: "row", gap: 6 },
  metricCard: {
    flex: 1,
    minHeight: 60,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.09)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: 4,
  },
  metricValue: { color: "#FFFFFF", fontSize: 14, fontWeight: "900", marginTop: 4 },
  metricLabel: { color: "rgba(255,255,255,0.72)", fontSize: 9, fontWeight: "800", marginTop: 2 },
});
