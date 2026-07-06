import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export type StreamIdentityClarityAcceptanceVariant = "live" | "shorts" | "business" | "profile";

type StreamIdentityClarityAcceptancePassPanelProps = {
  readonly version?: "125F" | string;
  readonly variant: StreamIdentityClarityAcceptanceVariant;
  readonly compact?: boolean;
  readonly style?: StyleProp<ViewStyle>;
};

const routeCopy: Record<StreamIdentityClarityAcceptanceVariant, {
  readonly icon: keyof typeof Ionicons.glyphMap;
  readonly title: string;
  readonly body: string;
  readonly checks: readonly string[];
}> = {
  live: {
    icon: "radio-outline",
    title: "Идентичность эфира принята",
    body: "Маршрут эфира показывает ведущего, название комнаты и доверие зрителей; настоящий запуск трансляции остаётся закрыт до следующего фундаментного этапа.",
    checks: ["ведущий виден", "название комнаты ясно", "запуск закрыт"],
  },
  shorts: {
    icon: "film-outline",
    title: "Идентичность черновика шорта принята",
    body: "Маршрут шортов показывает автора, название черновика и состояние редактирования без имитации загрузки или настоящей публикации.",
    checks: ["автор виден", "черновик ясен", "публикация закрыта"],
  },
  business: {
    icon: "storefront-outline",
    title: "Идентичность продавца Business Stream принята",
    body: "Маршрут Business Stream показывает продавца, магазин и доверие каталога; проверка бизнеса, торговая активация и продажи остаются закрыты.",
    checks: ["продавец виден", "магазин ясен", "проверка бизнеса закрыта"],
  },
  profile: {
    icon: "person-circle-outline",
    title: "Идентичность автора профиля принята",
    body: "Маршрут профиля показывает автора, имя профиля и статус проверки; заработок и выплаты остаются закрыты.",
    checks: ["автор виден", "профиль ясен", "выплаты закрыты"],
  },
};

export function StreamIdentityClarityAcceptancePassPanel({
  version = "125F",
  variant,
  compact = false,
  style,
}: StreamIdentityClarityAcceptancePassPanelProps) {
  const copy = routeCopy[variant];

  return (
    <View style={[styles.wrapper, compact ? styles.wrapperCompact : null, style]}>
      <LinearGradient
        colors={["rgba(109,221,191,0.15)", "rgba(255,255,255,0.045)"]}
        style={[styles.card, compact ? styles.cardCompact : null]}
      >
        <View style={styles.headerRow}>
          <View style={styles.iconBadge}>
            <Ionicons name={copy.icon} size={compact ? 14 : 16} color="#06110F" />
          </View>
          <View style={styles.titleWrap}>
            <Text style={styles.kicker} numberOfLines={1}>{version} · приёмка ясности идентичности</Text>
            <Text style={styles.title} numberOfLines={1}>{copy.title}</Text>
          </View>
          <View style={styles.acceptPill}>
            <Ionicons name="checkmark-circle-outline" size={12} color="#06110F" />
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
          <Ionicons name="shield-checkmark-outline" size={14} color="#6DDDBF" />
          <Text style={styles.boundaryText} numberOfLines={1}>только мобильный интерфейс · подключение идентичности позже</Text>
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
    borderColor: "rgba(109,221,191,0.17)",
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
    backgroundColor: "#6DDDBF",
    alignItems: "center",
    justifyContent: "center",
  },
  titleWrap: { flex: 1, minWidth: 0 },
  kicker: { color: "#6DDDBF", fontSize: 10, fontWeight: "900", letterSpacing: 0.3, textTransform: "uppercase" },
  title: { color: "#FFFFFF", fontSize: 13, fontWeight: "900", marginTop: 2 },
  acceptPill: {
    minHeight: 28,
    borderRadius: 14,
    paddingHorizontal: 8,
    backgroundColor: "#6DDDBF",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  acceptText: { color: "#06110F", fontSize: 9, fontWeight: "900", textTransform: "uppercase" },
  body: { color: "#DDF8F1", fontSize: 11, fontWeight: "800", lineHeight: 16 },
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
  checkIndex: { color: "#6DDDBF", fontSize: 10, fontWeight: "900" },
  checkText: { color: "#FFFFFF", fontSize: 10, fontWeight: "800" },
  boundaryRow: {
    minHeight: 28,
    borderRadius: 14,
    paddingHorizontal: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(109,221,191,0.09)",
    borderWidth: 1,
    borderColor: "rgba(109,221,191,0.16)",
  },
  boundaryText: { color: "#DDF8F1", fontSize: 10, fontWeight: "900", flex: 1 },
});
