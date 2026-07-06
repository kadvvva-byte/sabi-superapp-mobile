import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export type StreamNextMobileUiArea129Variant = "live" | "shorts" | "business" | "profile";

type StreamNextMobileUiArea129StartPanelProps = {
  readonly version?: "129A" | string;
  readonly variant: StreamNextMobileUiArea129Variant;
  readonly compact?: boolean;
  readonly style?: StyleProp<ViewStyle>;
};

type RouteCopy = {
  readonly icon: keyof typeof Ionicons.glyphMap;
  readonly title: string;
  readonly body: string;
  readonly status: string;
  readonly checks: readonly string[];
};

const routeCopy: Record<StreamNextMobileUiArea129Variant, RouteCopy> = {
  live: {
    icon: "pulse-outline",
    title: "Зона сигнала эфира",
    body: "Следующая мобильная зона интерфейса начинается с ясности сигнала: состояние ведущего, передача комнаты и лимиты провайдера видны до реальной связки.",
    status: "сигнал эфира виден",
    checks: ["сигнал ведущего", "передача комнаты", "провайдер закрыт"],
  },
  shorts: {
    icon: "cellular-outline",
    title: "Зона сигнала шортов",
    body: "Сигнал шортов остаётся читаемым: состояние черновика, передача в редактор и лимиты публикации чистые, пока загрузка через провайдера закрыта.",
    status: "сигнал шортов виден",
    checks: ["сигнал черновика", "передача в редактор", "публикация закрыта"],
  },
  business: {
    icon: "analytics-outline",
    title: "Зона сигнала бизнеса",
    body: "Сигнал бизнеса остаётся читаемым: состояние продавца, передача каталога и мерчант-лимиты чистые, пока платёжный провайдер закрыт.",
    status: "сигнал бизнеса виден",
    checks: ["сигнал продавца", "передача каталога", "мерчант закрыт"],
  },
  profile: {
    icon: "radio-button-on-outline",
    title: "Зона сигнала профиля",
    body: "Сигнал профиля остаётся читаемым: состояние автора, передача зрителю и лимиты проверки чистые, пока заработок закрыт.",
    status: "сигнал профиля виден",
    checks: ["сигнал автора", "передача зрителю", "проверка закрыта"],
  },
};

export function StreamNextMobileUiArea129StartPanel({
  version = "129A",
  variant,
  compact = false,
  style,
}: StreamNextMobileUiArea129StartPanelProps) {
  const copy = routeCopy[variant];

  return (
    <View style={[styles.wrapper, compact ? styles.wrapperCompact : null, style]}>
      <LinearGradient
        colors={["rgba(255,218,128,0.14)", "rgba(255,255,255,0.045)"]}
        style={[styles.card, compact ? styles.cardCompact : null]}
      >
        <View style={styles.headerRow}>
          <View style={styles.iconBadge}>
            <Ionicons name={copy.icon} size={compact ? 13 : 15} color="#061018" />
          </View>
          <View style={styles.titleWrap}>
            <Text style={styles.kicker} numberOfLines={1}>{version} · зона сигнала</Text>
            <Text style={styles.title} numberOfLines={1}>{copy.title}</Text>
          </View>
          <View style={styles.lockBadge}>
            <Ionicons name="lock-closed-outline" size={12} color="#FFDA80" />
          </View>
        </View>

        <Text style={styles.body} numberOfLines={compact ? 2 : 3}>{copy.body}</Text>

        <View style={styles.statusRow}>
          <Ionicons name="shield-checkmark-outline" size={14} color="#FFDA80" />
          <Text style={styles.statusText} numberOfLines={1}>{copy.status}</Text>
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
    borderColor: "rgba(255,218,128,0.17)",
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
    backgroundColor: "#FFDA80",
    alignItems: "center",
    justifyContent: "center",
  },
  titleWrap: { flex: 1, minWidth: 0 },
  kicker: { color: "#FFDA80", fontSize: 10, fontWeight: "900", letterSpacing: 0.28, textTransform: "uppercase" },
  title: { color: "#FFFFFF", fontSize: 13, fontWeight: "900", marginTop: 2 },
  lockBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,218,128,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,218,128,0.16)",
  },
  body: { color: "#FFF7E3", fontSize: 11, fontWeight: "800", lineHeight: 16 },
  statusRow: {
    minHeight: 28,
    borderRadius: 14,
    paddingHorizontal: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,218,128,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,218,128,0.14)",
  },
  statusText: { color: "#FFF7E3", fontSize: 10, fontWeight: "900", flex: 1 },
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
