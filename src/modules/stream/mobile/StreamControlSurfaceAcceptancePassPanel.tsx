import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export type StreamControlSurfaceAcceptanceVariant = "live" | "shorts" | "business" | "profile";

type StreamControlSurfaceAcceptancePassPanelProps = {
  readonly version?: "124F" | string;
  readonly variant: StreamControlSurfaceAcceptanceVariant;
  readonly compact?: boolean;
  readonly style?: StyleProp<ViewStyle>;
};

const routeCopy: Record<StreamControlSurfaceAcceptanceVariant, {
  readonly icon: keyof typeof Ionicons.glyphMap;
  readonly title: string;
  readonly body: string;
  readonly checks: readonly string[];
}> = {
  live: {
    icon: "radio-outline",
    title: "Контроль эфира принят",
    body: "Маршрут эфира держит действие ведущего, камеру и микрофон понятными, а реальный запуск провайдера честно закрытым.",
    checks: ["действие ведущего первым", "путь камеры понятен", "провайдер закрыт"],
  },
  shorts: {
    icon: "film-outline",
    title: "Контроль шортов принят",
    body: "Маршрут шортов держит действия зрителя и редактор читаемыми, а публикацию и загрузку закрытыми до подключения реального runtime.",
    checks: ["зритель первым", "редактор понятен", "публикация закрыта"],
  },
  business: {
    icon: "storefront-outline",
    title: "Контроль бизнеса принят",
    body: "Бизнес-маршрут держит управление продавца и каталог спокойными, а KYB, платежи и заказы закрытыми без фейковой коммерции.",
    checks: ["продавец первым", "каталог понятен", "оплата закрыта"],
  },
  profile: {
    icon: "person-circle-outline",
    title: "Контроль профиля принят",
    body: "Маршрут профиля держит действия автора и управление профилем понятными, а проверку, заработок и выплаты закрытыми.",
    checks: ["автор первым", "профиль понятен", "заработок закрыт"],
  },
};

export function StreamControlSurfaceAcceptancePassPanel({
  version = "124F",
  variant,
  compact = false,
  style,
}: StreamControlSurfaceAcceptancePassPanelProps) {
  const copy = routeCopy[variant];

  return (
    <View style={[styles.wrapper, compact ? styles.wrapperCompact : null, style]}>
      <LinearGradient
        colors={["rgba(242,199,91,0.14)", "rgba(255,255,255,0.045)"]}
        style={[styles.card, compact ? styles.cardCompact : null]}
      >
        <View style={styles.headerRow}>
          <View style={styles.iconBadge}>
            <Ionicons name={copy.icon} size={compact ? 14 : 16} color="#0B0810" />
          </View>
          <View style={styles.titleWrap}>
            <Text style={styles.kicker} numberOfLines={1}>{version} · приёмка панели управления</Text>
            <Text style={styles.title} numberOfLines={1}>{copy.title}</Text>
          </View>
          <View style={styles.acceptPill}>
            <Ionicons name="checkmark-circle-outline" size={12} color="#0B0810" />
            <Text style={styles.acceptText}>принято</Text>
          </View>
        </View>

        <Text style={styles.body} numberOfLines={compact ? 2 : 3}>
          {copy.body}
        </Text>

        <View style={styles.checkRow}>
          {copy.checks.map((item, index) => (
            <View key={item} style={styles.checkPill}>
              <Text style={styles.checkIndex}>{index + 1}</Text>
              <Text style={styles.checkText} numberOfLines={1}>{item}</Text>
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
  acceptPill: {
    minHeight: 28,
    borderRadius: 14,
    paddingHorizontal: 8,
    backgroundColor: "#F2C75B",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  acceptText: { color: "#0B0810", fontSize: 9, fontWeight: "900", textTransform: "uppercase" },
  body: { color: "#DDD7E8", fontSize: 11, fontWeight: "800", lineHeight: 16 },
  checkRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  checkPill: {
    minHeight: 28,
    borderRadius: 14,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  checkIndex: { color: "#F2C75B", fontSize: 10, fontWeight: "900" },
  checkText: { color: "#FFFFFF", fontSize: 10, fontWeight: "800" },
});
