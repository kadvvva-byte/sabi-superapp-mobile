import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export type StreamReadinessFinalHandoffVariant = "live" | "shorts" | "business" | "profile";

type StreamReadinessFinalHandoffPanelProps = {
  readonly version?: "127I" | string;
  readonly variant: StreamReadinessFinalHandoffVariant;
  readonly compact?: boolean;
  readonly style?: StyleProp<ViewStyle>;
};

type RouteCopy = {
  readonly icon: keyof typeof Ionicons.glyphMap;
  readonly title: string;
  readonly body: string;
  readonly handoff: string;
  readonly checks: readonly string[];
};

const routeCopy: Record<StreamReadinessFinalHandoffVariant, RouteCopy> = {
  live: {
    icon: "radio-outline",
    title: "Передача готовности эфира",
    body: "Готовность эфира передана с входом ведущего, потоком комнаты, доверием зрителя и стабильным описанием закрытого провайдера для UI-слоя.",
    handoff: "готовность UI эфира передана",
    checks: ["ведущий готов", "комната понятна", "провайдер закрыт"],
  },
  shorts: {
    icon: "film-outline",
    title: "Передача готовности шортов",
    body: "Готовность шортов передана с входом черновика, потоком редактора, действием зрителя и стабильным описанием закрытой публикации для UI-слоя.",
    handoff: "готовность UI шортов передана",
    checks: ["черновик готов", "редактор понятен", "публикация закрыта"],
  },
  business: {
    icon: "storefront-outline",
    title: "Передача готовности бизнеса",
    body: "Готовность бизнеса передана с входом продавца, потоком каталога, доверием покупателя и стабильным описанием закрытого мерчанта для UI-слоя.",
    handoff: "готовность UI бизнеса передана",
    checks: ["продавец готов", "каталог понятен", "мерчант закрыт"],
  },
  profile: {
    icon: "person-circle-outline",
    title: "Передача готовности профиля",
    body: "Готовность профиля передана с входом автора, потоком профиля, доверием зрителя и стабильным описанием закрытой проверки для UI-слоя.",
    handoff: "готовность UI профиля передана",
    checks: ["автор готов", "профиль понятен", "проверка закрыта"],
  },
};

export function StreamReadinessFinalHandoffPanel({
  version = "127I",
  variant,
  compact = false,
  style,
}: StreamReadinessFinalHandoffPanelProps) {
  const copy = routeCopy[variant];

  return (
    <View style={[styles.wrapper, compact ? styles.wrapperCompact : null, style]}>
      <LinearGradient
        colors={["rgba(170,245,216,0.13)", "rgba(255,255,255,0.045)"]}
        style={[styles.card, compact ? styles.cardCompact : null]}
      >
        <View style={styles.headerRow}>
          <View style={styles.iconBadge}>
            <Ionicons name={copy.icon} size={compact ? 13 : 15} color="#061018" />
          </View>
          <View style={styles.titleWrap}>
            <Text style={styles.kicker} numberOfLines={1}>{version} · Readiness final handoff</Text>
            <Text style={styles.title} numberOfLines={1}>{copy.title}</Text>
          </View>
          <View style={styles.lockBadge}>
            <Ionicons name="shield-checkmark-outline" size={12} color="#AAF5D8" />
          </View>
        </View>

        <Text style={styles.body} numberOfLines={compact ? 2 : 3}>{copy.body}</Text>

        <View style={styles.handoffRow}>
          <Ionicons name="checkmark-done-outline" size={14} color="#AAF5D8" />
          <Text style={styles.handoffText} numberOfLines={1}>{copy.handoff}</Text>
        </View>

        <View style={styles.checkRow}>
          {copy.checks.map((item) => (
            <View key={item} style={styles.checkPill}>
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
    borderRadius: 21,
    borderWidth: 1,
    borderColor: "rgba(170,245,216,0.17)",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  cardCompact: { paddingHorizontal: 10, paddingVertical: 8, gap: 7 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 9 },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 14,
    backgroundColor: "#AAF5D8",
    alignItems: "center",
    justifyContent: "center",
  },
  titleWrap: { flex: 1, minWidth: 0 },
  kicker: { color: "#AAF5D8", fontSize: 10, fontWeight: "900", letterSpacing: 0.28, textTransform: "uppercase" },
  title: { color: "#FFFFFF", fontSize: 13, fontWeight: "900", marginTop: 2 },
  lockBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(170,245,216,0.08)",
    borderWidth: 1,
    borderColor: "rgba(170,245,216,0.16)",
  },
  body: { color: "#EDFFF8", fontSize: 11, fontWeight: "800", lineHeight: 16 },
  handoffRow: {
    minHeight: 28,
    borderRadius: 14,
    paddingHorizontal: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(170,245,216,0.08)",
    borderWidth: 1,
    borderColor: "rgba(170,245,216,0.14)",
  },
  handoffText: { color: "#EDFFF8", fontSize: 10, fontWeight: "900", flex: 1 },
  checkRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  checkPill: {
    minHeight: 26,
    borderRadius: 13,
    paddingHorizontal: 8,
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.055)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  checkText: { color: "#FFFFFF", fontSize: 10, fontWeight: "800" },
});
