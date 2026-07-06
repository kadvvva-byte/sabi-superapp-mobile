import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

type IconName = keyof typeof Ionicons.glyphMap;
type RouteVariant = "live" | "shorts" | "business" | "profile";

type StreamInteractionPathAcceptancePassPanelProps = {
  readonly version?: "123F" | string;
  readonly variant: RouteVariant;
  readonly compact?: boolean;
  readonly style?: StyleProp<ViewStyle>;
};

const routeCopy: Record<RouteVariant, { icon: IconName; title: string; body: string; lock: string }> = {
  live: {
    icon: "radio-outline",
    title: "Путь взаимодействия эфира принят",
    body: "Путь ведущего остаётся первым, камера и микрофон остаются спокойными, а реальный запуск эфира закрыт до готовности рантайм-провайдера.",
    lock: "реальный эфир закрыт",
  },
  shorts: {
    icon: "play-circle-outline",
    title: "Путь взаимодействия шортов принят",
    body: "Путь зрителя остаётся первым, вход в редактор читаемый, а публикация и загрузка закрыты до появления реального рантайма.",
    lock: "публикация закрыта",
  },
  business: {
    icon: "storefront-outline",
    title: "Путь бизнес-взаимодействия принят",
    body: "Путь продавца остаётся понятным, вход в каталог спокойный, а оплата, KYB и заказы закрыты до готовности реальных бизнес-слоёв.",
    lock: "коммерция закрыта",
  },
  profile: {
    icon: "person-circle-outline",
    title: "Путь взаимодействия профиля принят",
    body: "Идентичность автора остаётся первой, официальная верификация честная, а подарки, заработок, Wallet и выплаты закрыты.",
    lock: "заработок закрыт",
  },
};

const acceptedRows = [
  "путь взаимодействия понятен",
  "касание по пути удобное",
  "текст короткий и честный",
  "граница kernel сохранена",
] as const;

export function StreamInteractionPathAcceptancePassPanel({
  version = "123F",
  variant,
  compact = false,
  style,
}: StreamInteractionPathAcceptancePassPanelProps) {
  const route = routeCopy[variant];

  return (
    <View style={[styles.wrapper, compact ? styles.wrapperCompact : null, style]}>
      <LinearGradient
        colors={["rgba(242,199,91,0.13)", "rgba(255,255,255,0.04)"]}
        style={[styles.card, compact ? styles.cardCompact : null]}
      >
        <View style={styles.headerRow}>
          <View style={styles.iconBadge}>
            <Ionicons name={route.icon} size={compact ? 14 : 16} color="#0B0810" />
          </View>
          <View style={styles.titleWrap}>
            <Text style={styles.kicker} numberOfLines={1}>{version} · приёмка пути взаимодействия</Text>
            <Text style={styles.title} numberOfLines={1}>{route.title}</Text>
          </View>
          <View style={styles.lockPill}>
            <Ionicons name="shield-checkmark-outline" size={12} color="#0B0810" />
            <Text style={styles.lockText}>принято</Text>
          </View>
        </View>

        <Text style={styles.body} numberOfLines={compact ? 2 : 3}>{route.body}</Text>

        <View style={styles.routeRow}>
          <View style={styles.boundaryPill}>
            <Ionicons name="lock-closed-outline" size={12} color="#F2C75B" />
            <Text style={styles.boundaryText} numberOfLines={1}>{route.lock}</Text>
          </View>
          <View style={styles.boundaryPill}>
            <Ionicons name="git-branch-outline" size={12} color="#F2C75B" />
            <Text style={styles.boundaryText} numberOfLines={1}>только UI</Text>
          </View>
        </View>

        <View style={styles.acceptedGrid}>
          {acceptedRows.map((row) => (
            <View key={row} style={styles.acceptedPill}>
              <Ionicons name="checkmark-circle-outline" size={12} color="#F2C75B" />
              <Text style={styles.acceptedText} numberOfLines={1}>{row}</Text>
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
    borderColor: "rgba(242,199,91,0.17)",
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
  lockPill: {
    minHeight: 28,
    borderRadius: 14,
    paddingHorizontal: 8,
    backgroundColor: "#F2C75B",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  lockText: { color: "#0B0810", fontSize: 9, fontWeight: "900", textTransform: "uppercase" },
  body: { color: "#DDD7E8", fontSize: 11, fontWeight: "800", lineHeight: 16 },
  routeRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
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
  acceptedGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  acceptedPill: {
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
  acceptedText: { color: "#FFFFFF", fontSize: 10, fontWeight: "800" },
});
