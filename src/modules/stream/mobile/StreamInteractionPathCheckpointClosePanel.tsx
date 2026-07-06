import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

type IconName = keyof typeof Ionicons.glyphMap;
type RouteVariant = "live" | "shorts" | "business" | "profile";

type StreamInteractionPathCheckpointClosePanelProps = {
  readonly version?: "123H" | string;
  readonly variant: RouteVariant;
  readonly compact?: boolean;
  readonly style?: StyleProp<ViewStyle>;
};

const routeCopy: Record<RouteVariant, { icon: IconName; title: string; body: string; boundary: string }> = {
  live: {
    icon: "radio-outline",
    title: "Контрольная точка пути эфира закрыта",
    body: "Вход ведущего, выбор камеры и настройка комнаты читаются как один спокойный мобильный путь, а реальный запуск остаётся закрытым.",
    boundary: "реальный запуск закрыт",
  },
  shorts: {
    icon: "play-circle-outline",
    title: "Контрольная точка пути шортов закрыта",
    body: "Путь зрителя, редактора и публикации остаётся понятным для мобильного режима, а загрузка и рантайм-провайдер пока закрыты.",
    boundary: "публикация закрыта",
  },
  business: {
    icon: "storefront-outline",
    title: "Контрольная точка бизнес-пути закрыта",
    body: "Вход продавца и путь каталога остаются читаемыми, а KYB, платежи, заказы и выплаты закрыты.",
    boundary: "коммерция закрыта",
  },
  profile: {
    icon: "person-circle-outline",
    title: "Контрольная точка пути профиля закрыта",
    body: "Идентичность автора и путь верификации остаются честными, а подарки, заработок, Wallet и выплаты закрыты.",
    boundary: "заработок закрыт",
  },
};

const checkpointRows = [
  "путь взаимодействия закрыт",
  "путь нажатий ясен",
  "текст закреплён",
  "граница kernel сохранена",
] as const;

export function StreamInteractionPathCheckpointClosePanel({
  version = "123H",
  variant,
  compact = false,
  style,
}: StreamInteractionPathCheckpointClosePanelProps) {
  const route = routeCopy[variant];

  return (
    <View style={[styles.wrapper, compact ? styles.wrapperCompact : null, style]}>
      <LinearGradient
        colors={["rgba(242,199,91,0.12)", "rgba(255,255,255,0.035)"]}
        style={[styles.card, compact ? styles.cardCompact : null]}
      >
        <View style={styles.headerRow}>
          <View style={styles.iconBadge}>
            <Ionicons name={route.icon} size={compact ? 14 : 16} color="#0B0810" />
          </View>
          <View style={styles.titleWrap}>
            <Text style={styles.kicker} numberOfLines={1}>{version} · закрытие контрольной точки пути взаимодействия</Text>
            <Text style={styles.title} numberOfLines={1}>{route.title}</Text>
          </View>
          <View style={styles.closePill}>
            <Ionicons name="checkmark-done-outline" size={12} color="#0B0810" />
            <Text style={styles.closeText}>закрыто</Text>
          </View>
        </View>

        <Text style={styles.body} numberOfLines={compact ? 2 : 3}>{route.body}</Text>

        <View style={styles.boundaryRow}>
          <View style={styles.boundaryPill}>
            <Ionicons name="lock-closed-outline" size={12} color="#F2C75B" />
            <Text style={styles.boundaryText} numberOfLines={1}>{route.boundary}</Text>
          </View>
          <View style={styles.boundaryPill}>
            <Ionicons name="phone-portrait-outline" size={12} color="#F2C75B" />
            <Text style={styles.boundaryText} numberOfLines={1}>только мобильный UI</Text>
          </View>
        </View>

        <View style={styles.checkpointGrid}>
          {checkpointRows.map((row) => (
            <View key={row} style={styles.checkpointPill}>
              <Ionicons name="checkmark-circle-outline" size={12} color="#F2C75B" />
              <Text style={styles.checkpointText} numberOfLines={1}>{row}</Text>
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
    borderColor: "rgba(242,199,91,0.16)",
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
  closePill: {
    minHeight: 28,
    borderRadius: 14,
    paddingHorizontal: 8,
    backgroundColor: "#F2C75B",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  closeText: { color: "#0B0810", fontSize: 9, fontWeight: "900", textTransform: "uppercase" },
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
  checkpointGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  checkpointPill: {
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
  checkpointText: { color: "#FFFFFF", fontSize: 10, fontWeight: "800" },
});
