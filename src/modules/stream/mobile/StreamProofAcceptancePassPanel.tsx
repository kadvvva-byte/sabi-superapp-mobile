import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export type StreamProofAcceptanceVariant = "live" | "shorts" | "business" | "profile";

type StreamProofAcceptancePassPanelProps = {
  readonly version?: "128F" | string;
  readonly variant: StreamProofAcceptanceVariant;
  readonly compact?: boolean;
  readonly style?: StyleProp<ViewStyle>;
};

type RouteCopy = {
  readonly icon: keyof typeof Ionicons.glyphMap;
  readonly title: string;
  readonly body: string;
  readonly checks: readonly string[];
  readonly boundary: string;
};

const routeCopy: Record<StreamProofAcceptanceVariant, RouteCopy> = {
  live: {
    icon: "radio-outline",
    title: "Доказательства эфира приняты",
    body: "Маршрут эфира честно показывает доказательства комнаты, контекст ведущего, доверие зрителей и границу провайдера до подключения реального запуска трансляции.",
    checks: ["доказательство комнаты", "контекст ведущего", "запуск закрыт"],
    boundary: "реальный запуск эфира остаётся закрытым",
  },
  shorts: {
    icon: "film-outline",
    title: "Доказательства шортов приняты",
    body: "Маршрут шортов честно показывает доказательства черновика, контекст автора, действия зрителя и границу публикации без заявления о подключённой загрузке.",
    checks: ["доказательство черновика", "контекст автора", "публикация закрыта"],
    boundary: "реальный запуск загрузки остаётся закрытым",
  },
  business: {
    icon: "storefront-outline",
    title: "Доказательства бизнеса приняты",
    body: "Бизнес-маршрут честно показывает доказательства продавца, контекст каталога, доверие покупателя и границу мерчанта до подключения платёжного провайдера.",
    checks: ["доказательство продавца", "контекст каталога", "провайдер закрыт"],
    boundary: "платежи и KYB остаются закрытыми",
  },
  profile: {
    icon: "person-circle-outline",
    title: "Доказательства профиля приняты",
    body: "Маршрут профиля честно показывает доказательства автора, контекст публичного профиля, доверие зрителя и границу проверки до активации запуска.",
    checks: ["доказательство автора", "контекст профиля", "проверка закрыта"],
    boundary: "проверка и выплаты остаются закрытыми",
  },
};

export function StreamProofAcceptancePassPanel({
  version = "128F",
  variant,
  compact = false,
  style,
}: StreamProofAcceptancePassPanelProps) {
  const copy = routeCopy[variant];

  return (
    <View style={[styles.wrapper, compact ? styles.wrapperCompact : null, style]}>
      <LinearGradient
        colors={["rgba(180,235,255,0.13)", "rgba(255,255,255,0.045)"]}
        style={[styles.card, compact ? styles.cardCompact : null]}
      >
        <View style={styles.headerRow}>
          <View style={styles.iconBadge}>
            <Ionicons name={copy.icon} size={compact ? 14 : 16} color="#061018" />
          </View>
          <View style={styles.titleWrap}>
            <Text style={styles.kicker} numberOfLines={1}>{version} · Приёмка доказательств</Text>
            <Text style={styles.title} numberOfLines={1}>{copy.title}</Text>
          </View>
          <View style={styles.statusBadge}>
            <Ionicons name="checkmark-circle-outline" size={12} color="#061018" />
            <Text style={styles.statusText}>принято</Text>
          </View>
        </View>

        <Text style={styles.body} numberOfLines={compact ? 2 : 3}>{copy.body}</Text>

        <View style={styles.checkRow}>
          {copy.checks.map((item, index) => (
            <View key={item} style={styles.checkPill}>
              <Text style={styles.checkIndex}>{index + 1}</Text>
              <Text style={styles.checkText} numberOfLines={1}>{item}</Text>
            </View>
          ))}
        </View>

        <View style={styles.boundaryRow}>
          <Ionicons name="lock-closed-outline" size={14} color="#B4EBFF" />
          <Text style={styles.boundaryText} numberOfLines={1}>{copy.boundary} · только мобильный интерфейс</Text>
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
    borderColor: "rgba(180,235,255,0.18)",
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
    backgroundColor: "#B4EBFF",
    alignItems: "center",
    justifyContent: "center",
  },
  titleWrap: { flex: 1, minWidth: 0 },
  kicker: { color: "#B4EBFF", fontSize: 10, fontWeight: "900", letterSpacing: 0.3, textTransform: "uppercase" },
  title: { color: "#FFFFFF", fontSize: 13, fontWeight: "900", marginTop: 2 },
  statusBadge: {
    minHeight: 28,
    borderRadius: 14,
    paddingHorizontal: 8,
    backgroundColor: "#B4EBFF",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statusText: { color: "#061018", fontSize: 9, fontWeight: "900", textTransform: "uppercase" },
  body: { color: "#EAFBFF", fontSize: 11, fontWeight: "800", lineHeight: 16 },
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
  checkIndex: { color: "#B4EBFF", fontSize: 10, fontWeight: "900" },
  checkText: { color: "#FFFFFF", fontSize: 10, fontWeight: "800" },
  boundaryRow: {
    minHeight: 28,
    borderRadius: 14,
    paddingHorizontal: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(180,235,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(180,235,255,0.15)",
  },
  boundaryText: { color: "#EAFBFF", fontSize: 10, fontWeight: "900", flex: 1 },
});
