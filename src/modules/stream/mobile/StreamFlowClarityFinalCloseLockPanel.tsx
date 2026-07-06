import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export type StreamFlowClarityFinalCloseLockVariant = "live" | "shorts" | "business" | "profile";

type StreamFlowClarityFinalCloseLockPanelProps = {
  readonly version?: "126K" | string;
  readonly variant: StreamFlowClarityFinalCloseLockVariant;
  readonly compact?: boolean;
  readonly style?: StyleProp<ViewStyle>;
};

const routeCopy: Record<StreamFlowClarityFinalCloseLockVariant, {
  readonly icon: keyof typeof Ionicons.glyphMap;
  readonly title: string;
  readonly body: string;
  readonly locks: readonly string[];
}> = {
  live: {
    icon: "radio-outline",
    title: "Финальное закрытие пути эфира",
    body: "Путь эфира закрыт для мобильного интерфейса: вход, действие ведущего, передача зрителю и граница провайдера остаются понятными.",
    locks: ["вход закрыт", "путь ведущего понятен", "реальный эфир позже"],
  },
  shorts: {
    icon: "film-outline",
    title: "Финальное закрытие пути шортов",
    body: "Путь шортов закрыт для мобильного интерфейса: вход в черновик, действие редактирования, передача зрителю и граница публикации остаются понятными.",
    locks: ["черновик закрыт", "путь редактирования понятен", "публикация позже"],
  },
  business: {
    icon: "storefront-outline",
    title: "Финальное закрытие бизнес-пути",
    body: "Бизнес-путь закрыт для мобильного интерфейса: вход продавца, действие каталога, передача покупателю и граница мерчанта остаются понятными.",
    locks: ["продавец закрыт", "каталог понятен", "мерчант позже"],
  },
  profile: {
    icon: "person-circle-outline",
    title: "Финальное закрытие пути профиля",
    body: "Путь профиля закрыт для мобильного интерфейса: вход автора, действие профиля, передача зрителю и граница верификации остаются понятными.",
    locks: ["автор закрыт", "профиль понятен", "верификация позже"],
  },
};

export function StreamFlowClarityFinalCloseLockPanel({
  version = "126K",
  variant,
  compact = false,
  style,
}: StreamFlowClarityFinalCloseLockPanelProps) {
  const copy = routeCopy[variant];

  return (
    <View style={[styles.wrapper, compact ? styles.wrapperCompact : null, style]}>
      <LinearGradient
        colors={["rgba(124,230,196,0.14)", "rgba(255,255,255,0.04)"]}
        style={[styles.card, compact ? styles.cardCompact : null]}
      >
        <View style={styles.headerRow}>
          <View style={styles.iconBadge}>
            <Ionicons name={copy.icon} size={compact ? 14 : 16} color="#06120F" />
          </View>
          <View style={styles.titleWrap}>
            <Text style={styles.kicker} numberOfLines={1}>{version} · Чёткость пути: финальное закрытие</Text>
            <Text style={styles.title} numberOfLines={1}>{copy.title}</Text>
          </View>
          <View style={styles.lockBadge}>
            <Ionicons name="lock-closed-outline" size={12} color="#06120F" />
            <Text style={styles.lockBadgeText}>закрыто</Text>
          </View>
        </View>

        <Text style={styles.body} numberOfLines={compact ? 2 : 3}>
          {copy.body}
        </Text>

        <View style={styles.lockGrid}>
          {copy.locks.map((item) => (
            <View key={item} style={styles.lockPill}>
              <Ionicons name="checkmark-circle-outline" size={10} color="#7CE6C4" />
              <Text style={styles.lockText} numberOfLines={1}>{item}</Text>
            </View>
          ))}
        </View>

        <View style={styles.boundaryRow}>
          <Ionicons name="shield-checkmark-outline" size={14} color="#7CE6C4" />
          <Text style={styles.boundaryText} numberOfLines={1}>Финальное закрытие · только мобильный интерфейс · реальный реальный эфир позже</Text>
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
    borderColor: "rgba(124,230,196,0.18)",
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
    backgroundColor: "#7CE6C4",
    alignItems: "center",
    justifyContent: "center",
  },
  titleWrap: { flex: 1, minWidth: 0 },
  kicker: { color: "#7CE6C4", fontSize: 10, fontWeight: "900", letterSpacing: 0.3, textTransform: "uppercase" },
  title: { color: "#FFFFFF", fontSize: 13, fontWeight: "900", marginTop: 2 },
  lockBadge: {
    minHeight: 28,
    borderRadius: 14,
    paddingHorizontal: 8,
    backgroundColor: "#7CE6C4",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  lockBadgeText: { color: "#06120F", fontSize: 9, fontWeight: "900", textTransform: "uppercase" },
  body: { color: "#E6FFF7", fontSize: 11, fontWeight: "800", lineHeight: 16 },
  lockGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  lockPill: {
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
  lockText: { color: "#FFFFFF", fontSize: 10, fontWeight: "800" },
  boundaryRow: {
    minHeight: 28,
    borderRadius: 14,
    paddingHorizontal: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(124,230,196,0.08)",
    borderWidth: 1,
    borderColor: "rgba(124,230,196,0.15)",
  },
  boundaryText: { color: "#E6FFF7", fontSize: 10, fontWeight: "900", flex: 1 },
});
