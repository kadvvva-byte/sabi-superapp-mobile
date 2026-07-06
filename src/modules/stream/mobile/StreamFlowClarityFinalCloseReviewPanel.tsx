import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export type StreamFlowClarityFinalCloseReviewVariant = "live" | "shorts" | "business" | "profile";

type StreamFlowClarityFinalCloseReviewPanelProps = {
  readonly version?: "126J" | string;
  readonly variant: StreamFlowClarityFinalCloseReviewVariant;
  readonly compact?: boolean;
  readonly style?: StyleProp<ViewStyle>;
};

const routeCopy: Record<StreamFlowClarityFinalCloseReviewVariant, {
  readonly icon: keyof typeof Ionicons.glyphMap;
  readonly title: string;
  readonly body: string;
  readonly review: readonly string[];
}> = {
  live: {
    icon: "radio-outline",
    title: "Ревью закрытия пути эфира",
    body: "Путь эфира держит вход, действие ведущего, путь зрителя и блокировку реального эфира понятной перед следующим шагом блокировки мобильного интерфейса.",
    review: ["вход читается", "путь ведущего понятен", "реальная работа закрыта"],
  },
  shorts: {
    icon: "film-outline",
    title: "Ревью закрытия пути шортов",
    body: "Путь шортов держит вход в черновик, путь редактирования, путь зрителя и блокировка публикации понятными без заявлений о загрузке.",
    review: ["черновик читается", "путь редактирования понятен", "публикация закрыта"],
  },
  business: {
    icon: "storefront-outline",
    title: "Ревью закрытия бизнес-пути",
    body: "Бизнес-путь держит вход продавца, путь каталога, путь покупателя и границу мерчанта понятной, пока работа провайдера остаётся на потом.",
    review: ["продавец читается", "путь каталога понятен", "мерчант закрыт"],
  },
  profile: {
    icon: "person-circle-outline",
    title: "Ревью закрытия пути профиля",
    body: "Путь профиля держит вход автора, путь профиля, путь зрителя и границу верификации понятной для будущего реального слоя.",
    review: ["автор читается", "путь профиля понятен", "верификация закрыта"],
  },
};

export function StreamFlowClarityFinalCloseReviewPanel({
  version = "126J",
  variant,
  compact = false,
  style,
}: StreamFlowClarityFinalCloseReviewPanelProps) {
  const copy = routeCopy[variant];

  return (
    <View style={[styles.wrapper, compact ? styles.wrapperCompact : null, style]}>
      <LinearGradient
        colors={["rgba(124,230,196,0.13)", "rgba(255,255,255,0.04)"]}
        style={[styles.card, compact ? styles.cardCompact : null]}
      >
        <View style={styles.headerRow}>
          <View style={styles.iconBadge}>
            <Ionicons name={copy.icon} size={compact ? 14 : 16} color="#06120F" />
          </View>
          <View style={styles.titleWrap}>
            <Text style={styles.kicker} numberOfLines={1}>{version} · Чёткость пути: ревью закрытия</Text>
            <Text style={styles.title} numberOfLines={1}>{copy.title}</Text>
          </View>
          <View style={styles.reviewBadge}>
            <Ionicons name="shield-checkmark-outline" size={12} color="#06120F" />
            <Text style={styles.reviewBadgeText}>ревью</Text>
          </View>
        </View>

        <Text style={styles.body} numberOfLines={compact ? 2 : 3}>
          {copy.body}
        </Text>

        <View style={styles.reviewGrid}>
          {copy.review.map((item) => (
            <View key={item} style={styles.reviewPill}>
              <Ionicons name="checkmark-circle-outline" size={10} color="#7CE6C4" />
              <Text style={styles.reviewText} numberOfLines={1}>{item}</Text>
            </View>
          ))}
        </View>

        <View style={styles.boundaryRow}>
          <Ionicons name="lock-closed-outline" size={14} color="#7CE6C4" />
          <Text style={styles.boundaryText} numberOfLines={1}>Ревью закрытия · только мобильный интерфейс · реальная работа остаётся закрытой</Text>
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
    borderColor: "rgba(124,230,196,0.16)",
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
  reviewBadge: {
    minHeight: 28,
    borderRadius: 14,
    paddingHorizontal: 8,
    backgroundColor: "#7CE6C4",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  reviewBadgeText: { color: "#06120F", fontSize: 9, fontWeight: "900", textTransform: "uppercase" },
  body: { color: "#E6FFF7", fontSize: 11, fontWeight: "800", lineHeight: 16 },
  reviewGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  reviewPill: {
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
  reviewText: { color: "#FFFFFF", fontSize: 10, fontWeight: "800" },
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
