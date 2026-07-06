import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

type IconName = keyof typeof Ionicons.glyphMap;
type RouteVariant = "live" | "shorts" | "business" | "profile";

type StreamFinalUiOnlyHandoffReviewPanelProps = {
  readonly version?: "121K" | string;
  readonly variant: RouteVariant;
  readonly compact?: boolean;
  readonly style?: StyleProp<ViewStyle>;
};

const routeCopy: Record<RouteVariant, { icon: IconName; title: string; body: string }> = {
  live: {
    icon: "radio-outline",
    title: "Handoff-проверка эфира",
    body: "Вход ведущего, flow настройки и граница эфира готовы к следующей проверке только UI.",
  },
  shorts: {
    icon: "play-circle-outline",
    title: "Handoff-проверка шортов",
    body: "Flow зрителя, вход в редактор и граница публикации готовы без симуляции provider.",
  },
  business: {
    icon: "storefront-outline",
    title: "Handoff-проверка Business",
    body: "Вход merchant, доверие каталога и блокировка оплаты готовы без симуляции commerce.",
  },
  profile: {
    icon: "person-circle-outline",
    title: "Handoff-проверка профиля",
    body: "Идентичность автора, блокировка проверки и граница заработка готовы без fake-статуса.",
  },
};

const reviewRows: readonly { icon: IconName; title: string }[] = [
  { icon: "phone-portrait-outline", title: "маршрутный UI готов" },
  { icon: "text-outline", title: "текст готов" },
  { icon: "hand-left-outline", title: "путь касаний готов" },
  { icon: "lock-closed-outline", title: "блокировки честные" },
];

export function StreamFinalUiOnlyHandoffReviewPanel({
  version = "121K",
  variant,
  compact = false,
  style,
}: StreamFinalUiOnlyHandoffReviewPanelProps) {
  const route = routeCopy[variant];

  return (
    <View style={[styles.wrapper, compact ? styles.wrapperCompact : null, style]}>
      <LinearGradient
        colors={["rgba(242,199,91,0.11)", "rgba(255,255,255,0.04)"]}
        style={[styles.card, compact ? styles.cardCompact : null]}
      >
        <View style={styles.headerRow}>
          <View style={styles.iconBadge}>
            <Ionicons name={route.icon} size={compact ? 14 : 16} color="#0B0810" />
          </View>
          <View style={styles.titleWrap}>
            <Text style={styles.kicker} numberOfLines={1}>{version} · Handoff-проверка только UI</Text>
            <Text style={styles.title} numberOfLines={1}>{route.title}</Text>
          </View>
          <View style={styles.readyPill}>
            <Ionicons name="checkmark-circle-outline" size={13} color="#0B0810" />
            <Text style={styles.readyText}>готово</Text>
          </View>
        </View>

        <Text style={styles.body} numberOfLines={compact ? 2 : 3}>{route.body}</Text>

        <View style={styles.rowsWrap}>
          {reviewRows.map((item) => (
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
  readyPill: {
    height: 28,
    borderRadius: 14,
    paddingHorizontal: 8,
    backgroundColor: "#F2C75B",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  readyText: { color: "#0B0810", fontSize: 10, fontWeight: "900", textTransform: "uppercase" },
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
