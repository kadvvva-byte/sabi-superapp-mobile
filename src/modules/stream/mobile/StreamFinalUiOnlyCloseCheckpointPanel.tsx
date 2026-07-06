import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

type IconName = keyof typeof Ionicons.glyphMap;
type RouteVariant = "live" | "shorts" | "business" | "profile";

type StreamFinalUiOnlyCloseCheckpointPanelProps = {
  readonly version?: "121J" | string;
  readonly variant: RouteVariant;
  readonly compact?: boolean;
  readonly style?: StyleProp<ViewStyle>;
};

const routeCopy: Record<RouteVariant, { icon: IconName; title: string; body: string }> = {
  live: {
    icon: "radio-outline",
    title: "Закрывающий контроль эфира",
    body: "Вход ведущего, понятная настройка и граница эфира закрыты для этого прохода только UI.",
  },
  shorts: {
    icon: "play-circle-outline",
    title: "Закрывающий контроль шортов",
    body: "Вход зрителя, путь редактора и граница публикации закрыты без симуляции provider.",
  },
  business: {
    icon: "storefront-outline",
    title: "Закрывающий контроль Business",
    body: "Доверие merchant, граница каталога и блокировка оплаты закрыты без симуляции commerce.",
  },
  profile: {
    icon: "person-circle-outline",
    title: "Закрывающий контроль профиля",
    body: "Идентичность автора, граница проверки и блокировка заработка закрыты без симуляции статуса.",
  },
};

const checkpointRows: readonly { icon: IconName; title: string }[] = [
  { icon: "phone-portrait-outline", title: "мобильный UI закрыт" },
  { icon: "layers-outline", title: "порядок маршрутов закрыт" },
  { icon: "lock-closed-outline", title: "закрытые состояния закрыты" },
  { icon: "shield-checkmark-outline", title: "граница kernel закрыта" },
];

export function StreamFinalUiOnlyCloseCheckpointPanel({
  version = "121J",
  variant,
  compact = false,
  style,
}: StreamFinalUiOnlyCloseCheckpointPanelProps) {
  const route = routeCopy[variant];

  return (
    <View style={[styles.wrapper, compact ? styles.wrapperCompact : null, style]}>
      <LinearGradient
        colors={["rgba(242,199,91,0.10)", "rgba(255,255,255,0.035)"]}
        style={[styles.card, compact ? styles.cardCompact : null]}
      >
        <View style={styles.headerRow}>
          <View style={styles.iconBadge}>
            <Ionicons name={route.icon} size={compact ? 14 : 16} color="#0B0810" />
          </View>
          <View style={styles.titleWrap}>
            <Text style={styles.kicker} numberOfLines={1}>{version} · Закрывающий контроль только UI</Text>
            <Text style={styles.title} numberOfLines={1}>{route.title}</Text>
          </View>
          <View style={styles.closedPill}>
            <Ionicons name="checkmark-done-circle-outline" size={13} color="#0B0810" />
            <Text style={styles.closedText}>закрыто</Text>
          </View>
        </View>

        <Text style={styles.body} numberOfLines={compact ? 2 : 3}>{route.body}</Text>

        <View style={styles.rowsWrap}>
          {checkpointRows.map((item) => (
            <View key={`${variant}-${item.title}`} style={styles.rowPill}>
              <Ionicons name={item.icon} size={12} color="#F2C75B" />
              <Text style={styles.rowText} numberOfLines={1}>{item.title}</Text>
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
    borderColor: "rgba(242,199,91,0.15)",
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
  closedPill: {
    height: 28,
    borderRadius: 14,
    paddingHorizontal: 8,
    backgroundColor: "#F2C75B",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  closedText: { color: "#0B0810", fontSize: 10, fontWeight: "900", textTransform: "uppercase" },
  body: { color: "#DAD3E5", fontSize: 11, fontWeight: "800", lineHeight: 16 },
  rowsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  rowPill: {
    minHeight: 26,
    borderRadius: 13,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  rowText: { color: "#FFFFFF", fontSize: 10, fontWeight: "800" },
});
