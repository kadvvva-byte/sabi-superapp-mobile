import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export type StreamFlowClarityAcceptanceVariant = "live" | "shorts" | "business" | "profile";

type StreamFlowClarityAcceptancePassPanelProps = {
  readonly version?: "126F" | string;
  readonly variant: StreamFlowClarityAcceptanceVariant;
  readonly compact?: boolean;
  readonly style?: StyleProp<ViewStyle>;
};

const routeCopy: Record<StreamFlowClarityAcceptanceVariant, {
  readonly icon: keyof typeof Ionicons.glyphMap;
  readonly title: string;
  readonly body: string;
  readonly checks: readonly string[];
}> = {
  live: {
    icon: "radio-outline",
    title: "Путь эфира принят",
    body: "Путь эфира сохраняет вход в комнату, действие ведущего, передачу зрителю и границу провайдера понятными, пока реальная трансляция остаётся закрытой до базового этапа.",
    checks: ["вход понятен", "действие ведущего", "реальная работа закрыта"],
  },
  shorts: {
    icon: "film-outline",
    title: "Путь шортов принят",
    body: "Путь шортов сохраняет вход в черновик, действие редактирования, передачу зрителю и границу публикации понятными без заявления, что загрузка или публикация подключены.",
    checks: ["черновик понятен", "действие редактирования", "публикация закрыта"],
  },
  business: {
    icon: "storefront-outline",
    title: "Бизнес-путь принят",
    body: "Бизнес-путь сохраняет вход продавца, действие каталога, передачу покупателю и границу мерчанта понятными, пока платёжная активация закрыта.",
    checks: ["продавец понятен", "действие каталога", "провайдер закрыт"],
  },
  profile: {
    icon: "person-circle-outline",
    title: "Путь профиля принят",
    body: "Путь профиля сохраняет вход автора, действие профиля, передачу зрителю и границу верификации понятными, пока реальная активация закрыта.",
    checks: ["профиль понятен", "действие автора", "реальная работа закрыта"],
  },
};

export function StreamFlowClarityAcceptancePassPanel({
  version = "126F",
  variant,
  compact = false,
  style,
}: StreamFlowClarityAcceptancePassPanelProps) {
  const copy = routeCopy[variant];

  return (
    <View style={[styles.wrapper, compact ? styles.wrapperCompact : null, style]}>
      <LinearGradient
        colors={["rgba(112,210,255,0.14)", "rgba(255,255,255,0.045)"]}
        style={[styles.card, compact ? styles.cardCompact : null]}
      >
        <View style={styles.headerRow}>
          <View style={styles.iconBadge}>
            <Ionicons name={copy.icon} size={compact ? 14 : 16} color="#051017" />
          </View>
          <View style={styles.titleWrap}>
            <Text style={styles.kicker} numberOfLines={1}>{version} · Чёткость пути: приёмка</Text>
            <Text style={styles.title} numberOfLines={1}>{copy.title}</Text>
          </View>
          <View style={styles.acceptPill}>
            <Ionicons name="checkmark-circle-outline" size={12} color="#051017" />
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

        <View style={styles.boundaryRow}>
          <Ionicons name="shield-checkmark-outline" size={14} color="#70D2FF" />
          <Text style={styles.boundaryText} numberOfLines={1}>Только мобильный интерфейс · реальная работа пути позже</Text>
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
    borderColor: "rgba(112,210,255,0.17)",
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
    backgroundColor: "#70D2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  titleWrap: { flex: 1, minWidth: 0 },
  kicker: { color: "#70D2FF", fontSize: 10, fontWeight: "900", letterSpacing: 0.3, textTransform: "uppercase" },
  title: { color: "#FFFFFF", fontSize: 13, fontWeight: "900", marginTop: 2 },
  acceptPill: {
    minHeight: 28,
    borderRadius: 14,
    paddingHorizontal: 8,
    backgroundColor: "#70D2FF",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  acceptText: { color: "#051017", fontSize: 9, fontWeight: "900", textTransform: "uppercase" },
  body: { color: "#E4F7FF", fontSize: 11, fontWeight: "800", lineHeight: 16 },
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
  checkIndex: { color: "#70D2FF", fontSize: 10, fontWeight: "900" },
  checkText: { color: "#FFFFFF", fontSize: 10, fontWeight: "800" },
  boundaryRow: {
    minHeight: 28,
    borderRadius: 14,
    paddingHorizontal: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(112,210,255,0.09)",
    borderWidth: 1,
    borderColor: "rgba(112,210,255,0.16)",
  },
  boundaryText: { color: "#E4F7FF", fontSize: 10, fontWeight: "900", flex: 1 },
});
