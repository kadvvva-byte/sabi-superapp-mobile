import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export type StreamReadinessFinalCloseReviewVariant = "live" | "shorts" | "business" | "profile";

type StreamReadinessFinalCloseReviewPanelProps = {
  readonly version?: "127J" | string;
  readonly variant: StreamReadinessFinalCloseReviewVariant;
  readonly compact?: boolean;
  readonly style?: StyleProp<ViewStyle>;
};

type RouteCopy = {
  readonly icon: keyof typeof Ionicons.glyphMap;
  readonly title: string;
  readonly body: string;
  readonly review: string;
  readonly checks: readonly string[];
};

const routeCopy: Record<StreamReadinessFinalCloseReviewVariant, RouteCopy> = {
  live: {
    icon: "radio-outline",
    title: "Финальная проверка готовности эфира",
    body: "Финальная проверка готовности эфира сохраняет вход ведущего, состояние комнаты, доверие зрителя и стабильное описание закрытого провайдера перед следующей зоной интерфейса.",
    review: "готовность эфира проверена",
    checks: ["вход ведущего", "доверие комнаты", "провайдер закрыт"],
  },
  shorts: {
    icon: "film-outline",
    title: "Финальная проверка готовности шортов",
    body: "Финальная проверка готовности шортов сохраняет вход черновика, состояние редактора, действие зрителя и стабильное описание закрытой публикации перед следующей зоной интерфейса.",
    review: "готовность шортов проверена",
    checks: ["вход черновика", "доверие редактора", "публикация закрыта"],
  },
  business: {
    icon: "storefront-outline",
    title: "Финальная проверка готовности бизнеса",
    body: "Финальная проверка готовности бизнеса сохраняет вход продавца, состояние каталога, доверие покупателя и стабильное описание закрытого мерчанта перед следующей зоной интерфейса.",
    review: "готовность бизнеса проверена",
    checks: ["вход продавца", "доверие каталога", "мерчант закрыт"],
  },
  profile: {
    icon: "person-circle-outline",
    title: "Финальная проверка готовности профиля",
    body: "Финальная проверка готовности профиля сохраняет вход автора, состояние профиля, доверие зрителя и стабильное описание закрытой проверки перед следующей зоной интерфейса.",
    review: "готовность профиля проверена",
    checks: ["вход автора", "доверие профиля", "проверка закрыта"],
  },
};

export function StreamReadinessFinalCloseReviewPanel({
  version = "127J",
  variant,
  compact = false,
  style,
}: StreamReadinessFinalCloseReviewPanelProps) {
  const copy = routeCopy[variant];

  return (
    <View style={[styles.wrapper, compact ? styles.wrapperCompact : null, style]}>
      <LinearGradient
        colors={["rgba(236,214,255,0.13)", "rgba(255,255,255,0.045)"]}
        style={[styles.card, compact ? styles.cardCompact : null]}
      >
        <View style={styles.headerRow}>
          <View style={styles.iconBadge}>
            <Ionicons name={copy.icon} size={compact ? 13 : 15} color="#061018" />
          </View>
          <View style={styles.titleWrap}>
            <Text style={styles.kicker} numberOfLines={1}>{version} · Проверка готовности</Text>
            <Text style={styles.title} numberOfLines={1}>{copy.title}</Text>
          </View>
          <View style={styles.lockBadge}>
            <Ionicons name="shield-checkmark-outline" size={12} color="#ECD6FF" />
          </View>
        </View>

        <Text style={styles.body} numberOfLines={compact ? 2 : 3}>{copy.body}</Text>

        <View style={styles.reviewRow}>
          <Ionicons name="checkmark-done-circle-outline" size={14} color="#ECD6FF" />
          <Text style={styles.reviewText} numberOfLines={1}>{copy.review}</Text>
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
    borderColor: "rgba(236,214,255,0.17)",
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
    backgroundColor: "#ECD6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  titleWrap: { flex: 1, minWidth: 0 },
  kicker: { color: "#ECD6FF", fontSize: 10, fontWeight: "900", letterSpacing: 0.28, textTransform: "uppercase" },
  title: { color: "#FFFFFF", fontSize: 13, fontWeight: "900", marginTop: 2 },
  lockBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(236,214,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(236,214,255,0.16)",
  },
  body: { color: "#FBF2FF", fontSize: 11, fontWeight: "800", lineHeight: 16 },
  reviewRow: {
    minHeight: 28,
    borderRadius: 14,
    paddingHorizontal: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(236,214,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(236,214,255,0.14)",
  },
  reviewText: { color: "#FBF2FF", fontSize: 10, fontWeight: "900", flex: 1 },
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
