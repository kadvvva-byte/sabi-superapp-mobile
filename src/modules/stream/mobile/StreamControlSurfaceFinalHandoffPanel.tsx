import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export type StreamControlSurfaceFinalHandoffVariant = "live" | "shorts" | "business" | "profile";

type StreamControlSurfaceFinalHandoffPanelProps = {
  readonly version?: "124I" | string;
  readonly variant: StreamControlSurfaceFinalHandoffVariant;
  readonly compact?: boolean;
  readonly style?: StyleProp<ViewStyle>;
};

const routeCopy: Record<StreamControlSurfaceFinalHandoffVariant, {
  readonly icon: keyof typeof Ionicons.glyphMap;
  readonly title: string;
  readonly body: string;
  readonly checks: readonly string[];
}> = {
  live: {
    icon: "radio-outline",
    title: "Контроль эфира передан",
    body: "Эфир держит действие ведущего первым, камеру и микрофон читаемыми, а реальный запуск провайдера честно закрытым до следующего фундаментного этапа.",
    checks: ["ведущий первым", "управление понятно", "провайдер закрыт"],
  },
  shorts: {
    icon: "film-outline",
    title: "Контроль шортов передан",
    body: "Шорты держат действие зрителя первым, управление редактором читаемым, а публикацию и загрузку честно закрытыми до реального этапа запуска.",
    checks: ["зритель первым", "редактор понятен", "публикация закрыта"],
  },
  business: {
    icon: "storefront-outline",
    title: "Контроль бизнеса передан",
    body: "Бизнес держит действие продавца первым, каталог читаемым, а KYB/оплату честно закрытыми без фейковой коммерции.",
    checks: ["продавец первым", "каталог понятен", "оплата закрыта"],
  },
  profile: {
    icon: "person-circle-outline",
    title: "Контроль профиля передан",
    body: "Профиль держит действие автора первым, управление профилем читаемым, а проверку и заработок честно закрытыми до реального процесса проверки.",
    checks: ["автор первым", "профиль понятен", "заработок закрыт"],
  },
};

export function StreamControlSurfaceFinalHandoffPanel({
  version = "124I",
  variant,
  compact = false,
  style,
}: StreamControlSurfaceFinalHandoffPanelProps) {
  const copy = routeCopy[variant];

  return (
    <View style={[styles.wrapper, compact ? styles.wrapperCompact : null, style]}>
      <LinearGradient
        colors={["rgba(242,199,91,0.14)", "rgba(255,255,255,0.045)"]}
        style={[styles.card, compact ? styles.cardCompact : null]}
      >
        <View style={styles.headerRow}>
          <View style={styles.iconBadge}>
            <Ionicons name={copy.icon} size={compact ? 13 : 15} color="#0B0810" />
          </View>
          <View style={styles.titleWrap}>
            <Text style={styles.kicker} numberOfLines={1}>{version} · финальная передача управления</Text>
            <Text style={styles.title} numberOfLines={1}>{copy.title}</Text>
          </View>
          <View style={styles.handoffPill}>
            <Ionicons name="checkmark-circle-outline" size={12} color="#F2C75B" />
            <Text style={styles.handoffText}>передача</Text>
          </View>
        </View>

        <Text style={styles.body} numberOfLines={compact ? 2 : 3}>
          {copy.body}
        </Text>

        <View style={styles.checkRow}>
          {copy.checks.map((item) => (
            <View key={item} style={styles.checkPill}>
              <Ionicons name="ellipse" size={5} color="#F2C75B" />
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
    gap: 8,
  },
  cardCompact: { paddingHorizontal: 10, paddingVertical: 8, gap: 7 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 9 },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 14,
    backgroundColor: "#F2C75B",
    alignItems: "center",
    justifyContent: "center",
  },
  titleWrap: { flex: 1, minWidth: 0 },
  kicker: { color: "#F2C75B", fontSize: 10, fontWeight: "900", letterSpacing: 0.3, textTransform: "uppercase" },
  title: { color: "#FFFFFF", fontSize: 13, fontWeight: "900", marginTop: 2 },
  handoffPill: {
    minHeight: 27,
    borderRadius: 14,
    paddingHorizontal: 8,
    backgroundColor: "rgba(242,199,91,0.10)",
    borderWidth: 1,
    borderColor: "rgba(242,199,91,0.18)",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  handoffText: { color: "#F2C75B", fontSize: 9, fontWeight: "900", textTransform: "uppercase" },
  body: { color: "#DDD7E8", fontSize: 11, fontWeight: "800", lineHeight: 16 },
  checkRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  checkPill: {
    minHeight: 27,
    borderRadius: 14,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.055)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  checkText: { color: "#FFFFFF", fontSize: 10, fontWeight: "800" },
});
