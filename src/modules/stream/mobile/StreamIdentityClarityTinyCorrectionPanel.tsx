import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export type StreamIdentityClarityTinyCorrectionVariant = "live" | "shorts" | "business" | "profile";

type StreamIdentityClarityTinyCorrectionPanelProps = {
  readonly version?: "125G" | string;
  readonly variant: StreamIdentityClarityTinyCorrectionVariant;
  readonly compact?: boolean;
  readonly style?: StyleProp<ViewStyle>;
};

const copyByVariant: Record<StreamIdentityClarityTinyCorrectionVariant, {
  readonly icon: keyof typeof Ionicons.glyphMap;
  readonly title: string;
  readonly body: string;
  readonly points: readonly string[];
}> = {
  live: {
    icon: "radio-outline",
    title: "малое исправление идентичности эфира",
    body: "Малое исправление маршрута эфира показывает имя ведущего, метку комнаты и доверие зрителей без открытия реального runtime трансляции.",
    points: ["линия ведущего", "линия комнаты", "runtime закрыт"],
  },
  shorts: {
    icon: "film-outline",
    title: "малое исправление идентичности шорта",
    body: "Малое исправление маршрута шортов показывает имя автора, метку черновика и состояние редактора, пока реальная загрузка закрыта.",
    points: ["линия автора", "линия черновика", "загрузка закрыта"],
  },
  business: {
    icon: "storefront-outline",
    title: "малое исправление идентичности бизнеса",
    body: "Малое исправление маршрута Business показывает продавца, метку магазина и доверие каталога, пока KYB и merchant-активация закрыты.",
    points: ["линия продавца", "линия магазина", "KYB закрыт"],
  },
  profile: {
    icon: "person-circle-outline",
    title: "малое исправление идентичности профиля",
    body: "Малое исправление маршрута профиля показывает имя автора, метку профиля и статус проверки, пока runtime заработка закрыт.",
    points: ["линия автора", "линия профиля", "заработок закрыт"],
  },
};

export function StreamIdentityClarityTinyCorrectionPanel({
  version = "125G",
  variant,
  compact = false,
  style,
}: StreamIdentityClarityTinyCorrectionPanelProps) {
  const copy = copyByVariant[variant];

  return (
    <View style={[styles.wrapper, compact ? styles.wrapperCompact : null, style]}>
      <LinearGradient
        colors={["rgba(109,221,191,0.12)", "rgba(255,255,255,0.035)"]}
        style={[styles.card, compact ? styles.cardCompact : null]}
      >
        <View style={styles.headerRow}>
          <View style={styles.iconBadge}>
            <Ionicons name={copy.icon} size={compact ? 13 : 15} color="#06110F" />
          </View>
          <View style={styles.titleWrap}>
            <Text style={styles.kicker} numberOfLines={1}>{version} · исправление ясности идентичности</Text>
            <Text style={styles.title} numberOfLines={1}>{copy.title}</Text>
          </View>
          <View style={styles.lockPill}>
            <Ionicons name="lock-closed-outline" size={11} color="#6DDDBF" />
            <Text style={styles.lockText}>закрыто</Text>
          </View>
        </View>

        <Text style={styles.body} numberOfLines={compact ? 2 : 3}>{copy.body}</Text>

        <View style={styles.pointRow}>
          {copy.points.map((point) => (
            <View key={point} style={styles.pointPill}>
              <Ionicons name="checkmark-circle-outline" size={12} color="#6DDDBF" />
              <Text style={styles.pointText} numberOfLines={1}>{point}</Text>
            </View>
          ))}
        </View>

        <View style={styles.footerRow}>
          <Ionicons name="shield-checkmark-outline" size={13} color="#6DDDBF" />
          <Text style={styles.footerText} numberOfLines={1}>только kernel-safe мобильный UI · реальная синхронизация идентичности позже</Text>
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
    borderColor: "rgba(109,221,191,0.15)",
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
  lockPill: {
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
  lockText: { color: "#6DDDBF", fontSize: 9, fontWeight: "900", textTransform: "uppercase" },
  body: { color: "#DDF8F1", fontSize: 11, fontWeight: "800", lineHeight: 16 },
  pointRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  pointPill: {
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
  pointText: { color: "#FFFFFF", fontSize: 10, fontWeight: "800" },
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
