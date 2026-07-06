import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

type IconName = keyof typeof Ionicons.glyphMap;
type RouteVariant = "live" | "shorts" | "business" | "profile";

type StreamControlSurfaceUiStartPanelProps = {
  readonly version?: "124A" | string;
  readonly variant: RouteVariant;
  readonly compact?: boolean;
  readonly style?: StyleProp<ViewStyle>;
};

const routeCopy: Record<RouteVariant, { icon: IconName; title: string; body: string; lock: string }> = {
  live: {
    icon: "radio-outline",
    title: "Контроль эфира: старт",
    body: "Управление ведущего остаётся простым: запуск, камера, микрофон и настройка комнаты читаются, а реальный провайдер запуска пока закрыт.",
    lock: "запуск провайдера закрыт",
  },
  shorts: {
    icon: "play-circle-outline",
    title: "Контроль шортов: старт",
    body: "Действия зрителя, вход в редактор, эффекты и путь черновика остаются спокойными, а публикация и загрузка закрыты до реального этапа запуска.",
    lock: "публикация закрыта",
  },
  business: {
    icon: "storefront-outline",
    title: "Контроль бизнеса: старт",
    body: "Действия продавца, путь каталога, доверительные заметки и вход в коммерцию остаются понятными, а KYB, оплата и заказы закрыты.",
    lock: "коммерция закрыта",
  },
  profile: {
    icon: "person-circle-outline",
    title: "Контроль профиля: старт",
    body: "Действия автора, идентичность, настройка профиля и путь проверки остаются читаемыми, а заработок, подарки и выплаты закрыты.",
    lock: "заработок закрыт",
  },
};

const controlRows = [
  "главное действие видно",
  "вторичные действия спокойные",
  "закрытые состояния честные",
  "граница kernel сохранена",
] as const;

export function StreamControlSurfaceUiStartPanel({
  version = "124A",
  variant,
  compact = false,
  style,
}: StreamControlSurfaceUiStartPanelProps) {
  const route = routeCopy[variant];

  return (
    <View style={[styles.wrapper, compact ? styles.wrapperCompact : null, style]}>
      <LinearGradient
        colors={["rgba(242,199,91,0.11)", "rgba(255,255,255,0.032)"]}
        style={[styles.card, compact ? styles.cardCompact : null]}
      >
        <View style={styles.headerRow}>
          <View style={styles.iconBadge}>
            <Ionicons name={route.icon} size={compact ? 14 : 16} color="#0B0810" />
          </View>
          <View style={styles.titleWrap}>
            <Text style={styles.kicker} numberOfLines={1}>{version} · UI панели управления</Text>
            <Text style={styles.title} numberOfLines={1}>{route.title}</Text>
          </View>
          <View style={styles.uiPill}>
            <Ionicons name="phone-portrait-outline" size={12} color="#0B0810" />
            <Text style={styles.uiText}>экран</Text>
          </View>
        </View>

        <Text style={styles.body} numberOfLines={compact ? 2 : 3}>{route.body}</Text>

        <View style={styles.boundaryRow}>
          <View style={styles.boundaryPill}>
            <Ionicons name="lock-closed-outline" size={12} color="#F2C75B" />
            <Text style={styles.boundaryText} numberOfLines={1}>{route.lock}</Text>
          </View>
          <View style={styles.boundaryPill}>
            <Ionicons name="shield-checkmark-outline" size={12} color="#F2C75B" />
            <Text style={styles.boundaryText} numberOfLines={1}>только интерфейс маршрута</Text>
          </View>
        </View>

        <View style={styles.controlGrid}>
          {controlRows.map((row) => (
            <View key={row} style={styles.controlPill}>
              <Ionicons name="checkmark-circle-outline" size={12} color="#F2C75B" />
              <Text style={styles.controlText} numberOfLines={1}>{row}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 10 },
  wrapperCompact: { marginBottom: 7 },
  card: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(242,199,91,0.14)",
    paddingHorizontal: 12,
    paddingVertical: 11,
    gap: 9,
  },
  cardCompact: { paddingHorizontal: 10, paddingVertical: 8, gap: 7 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 9 },
  iconBadge: {
    width: 34,
    height: 34,
    borderRadius: 15,
    backgroundColor: "#F2C75B",
    alignItems: "center",
    justifyContent: "center",
  },
  titleWrap: { flex: 1, minWidth: 0 },
  kicker: { color: "#F2C75B", fontSize: 10, fontWeight: "900", letterSpacing: 0.3, textTransform: "uppercase" },
  title: { color: "#FFFFFF", fontSize: 13, fontWeight: "900", marginTop: 2 },
  uiPill: {
    minHeight: 28,
    borderRadius: 14,
    paddingHorizontal: 8,
    backgroundColor: "#F2C75B",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  uiText: { color: "#0B0810", fontSize: 9, fontWeight: "900", textTransform: "uppercase" },
  body: { color: "#DDD7E8", fontSize: 11, fontWeight: "800", lineHeight: 16 },
  boundaryRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  boundaryPill: {
    minHeight: 27,
    borderRadius: 14,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(11,8,16,0.42)",
    borderWidth: 1,
    borderColor: "rgba(242,199,91,0.14)",
  },
  boundaryText: { color: "#FFFFFF", fontSize: 10, fontWeight: "900" },
  controlGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  controlPill: {
    minHeight: 27,
    borderRadius: 14,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.055)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  controlText: { color: "#FFFFFF", fontSize: 10, fontWeight: "800" },
});
