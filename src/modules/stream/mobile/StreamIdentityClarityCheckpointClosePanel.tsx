import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export type StreamIdentityClarityCheckpointCloseVariant = "live" | "shorts" | "business" | "profile";

type StreamIdentityClarityCheckpointClosePanelProps = {
  readonly version?: "125H" | string;
  readonly variant: StreamIdentityClarityCheckpointCloseVariant;
  readonly compact?: boolean;
  readonly style?: StyleProp<ViewStyle>;
};

const copyByVariant: Record<StreamIdentityClarityCheckpointCloseVariant, {
  readonly icon: keyof typeof Ionicons.glyphMap;
  readonly title: string;
  readonly body: string;
  readonly checks: readonly string[];
}> = {
  live: {
    icon: "radio-outline",
    title: "Контроль идентичности эфира закрыт",
    body: "Эфир теперь держит ведущего, название комнаты и доверие зрителей в одной понятной линии; настоящий запуск трансляции закрыт.",
    checks: ["ведущий ясен", "комната ясна", "запуск закрыт"],
  },
  shorts: {
    icon: "film-outline",
    title: "Контроль идентичности черновика шорта закрыт",
    body: "Шорты теперь показывают автора, название черновика и состояние редактирования, пока реальная загрузка и публикация закрыты.",
    checks: ["автор ясен", "черновик ясен", "загрузка закрыта"],
  },
  business: {
    icon: "storefront-outline",
    title: "Контроль идентичности продавца закрыт",
    body: "Business Stream теперь показывает продавца, магазин и доверие каталога; проверка бизнеса и торговая активация закрыты.",
    checks: ["продавец ясен", "магазин ясен", "проверка бизнеса закрыта"],
  },
  profile: {
    icon: "person-circle-outline",
    title: "Контроль идентичности автора профиля закрыт",
    body: "Профиль Stream теперь показывает автора, публичное имя профиля и статус проверки; заработок закрыт.",
    checks: ["автор ясен", "профиль ясен", "заработок закрыт"],
  },
};

export function StreamIdentityClarityCheckpointClosePanel({
  version = "125H",
  variant,
  compact = false,
  style,
}: StreamIdentityClarityCheckpointClosePanelProps) {
  const copy = copyByVariant[variant];

  return (
    <View style={[styles.wrapper, compact ? styles.wrapperCompact : null, style]}>
      <LinearGradient
        colors={["rgba(109,221,191,0.13)", "rgba(255,255,255,0.04)"]}
        style={[styles.card, compact ? styles.cardCompact : null]}
      >
        <View style={styles.headerRow}>
          <View style={styles.iconBadge}>
            <Ionicons name={copy.icon} size={compact ? 13 : 15} color="#06110F" />
          </View>
          <View style={styles.titleWrap}>
            <Text style={styles.kicker} numberOfLines={1}>{version} · контроль ясности идентичности</Text>
            <Text style={styles.title} numberOfLines={1}>{copy.title}</Text>
          </View>
          <View style={styles.closedPill}>
            <Ionicons name="shield-checkmark-outline" size={11} color="#6DDDBF" />
            <Text style={styles.closedText}>закрыто</Text>
          </View>
        </View>

        <Text style={styles.body} numberOfLines={compact ? 2 : 3}>{copy.body}</Text>

        <View style={styles.checkRow}>
          {copy.checks.map((check) => (
            <View key={check} style={styles.checkPill}>
              <Ionicons name="checkmark-circle-outline" size={12} color="#6DDDBF" />
              <Text style={styles.checkText} numberOfLines={1}>{check}</Text>
            </View>
          ))}
        </View>

        <View style={styles.footerRow}>
          <Ionicons name="lock-closed-outline" size={13} color="#6DDDBF" />
          <Text style={styles.footerText} numberOfLines={1}>только контроль мобильного интерфейса · синхронизация позже</Text>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 10 },
  wrapperCompact: { marginBottom: 7 },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(109,221,191,0.16)",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  cardCompact: { paddingHorizontal: 10, paddingVertical: 8, gap: 7 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  iconBadge: {
    width: 31,
    height: 31,
    borderRadius: 14,
    backgroundColor: "#6DDDBF",
    alignItems: "center",
    justifyContent: "center",
  },
  titleWrap: { flex: 1, minWidth: 0 },
  kicker: { color: "#6DDDBF", fontSize: 9, fontWeight: "900", letterSpacing: 0.28, textTransform: "uppercase" },
  title: { color: "#FFFFFF", fontSize: 12, fontWeight: "900", marginTop: 2 },
  closedPill: {
    minHeight: 25,
    borderRadius: 13,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(109,221,191,0.08)",
    borderWidth: 1,
    borderColor: "rgba(109,221,191,0.17)",
  },
  closedText: { color: "#6DDDBF", fontSize: 9, fontWeight: "900", textTransform: "uppercase" },
  body: { color: "#DDF8F1", fontSize: 11, fontWeight: "800", lineHeight: 16 },
  checkRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  checkPill: {
    minHeight: 27,
    borderRadius: 14,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.055)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  checkText: { color: "#FFFFFF", fontSize: 10, fontWeight: "800" },
  footerRow: {
    minHeight: 27,
    borderRadius: 14,
    paddingHorizontal: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(109,221,191,0.08)",
    borderWidth: 1,
    borderColor: "rgba(109,221,191,0.14)",
  },
  footerText: { color: "#DDF8F1", fontSize: 10, fontWeight: "900", flex: 1 },
});
