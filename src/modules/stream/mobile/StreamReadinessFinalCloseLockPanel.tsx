import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export type StreamReadinessFinalCloseLockVariant = "live" | "shorts" | "business" | "profile";

type StreamReadinessFinalCloseLockPanelProps = {
  readonly version?: "127K" | string;
  readonly variant: StreamReadinessFinalCloseLockVariant;
  readonly compact?: boolean;
  readonly style?: StyleProp<ViewStyle>;
};

type RouteCopy = {
  readonly icon: keyof typeof Ionicons.glyphMap;
  readonly title: string;
  readonly body: string;
  readonly lock: string;
  readonly checks: readonly string[];
};

const routeCopy: Record<StreamReadinessFinalCloseLockVariant, RouteCopy> = {
  live: {
    icon: "radio-outline",
    title: "Финальный замок готовности эфира",
    body: "Готовность эфира закрыта для мобильного UI-слоя: вход ведущего, доверие комнаты и граница провайдера остаются честными перед следующей зоной.",
    lock: "готовность эфира закрыта",
    checks: ["вход ведущего", "доверие комнаты", "провайдер закрыт"],
  },
  shorts: {
    icon: "film-outline",
    title: "Финальный замок готовности шортов",
    body: "Готовность шортов закрыта для мобильного UI-слоя: вход черновика, доверие редактора и граница публикации остаются честными перед следующей зоной.",
    lock: "готовность шортов закрыта",
    checks: ["вход черновика", "доверие редактора", "публикация закрыта"],
  },
  business: {
    icon: "storefront-outline",
    title: "Финальный замок готовности бизнеса",
    body: "Готовность бизнеса закрыта для мобильного UI-слоя: вход продавца, доверие каталога и граница мерчанта остаются честными перед следующей зоной.",
    lock: "готовность бизнеса закрыта",
    checks: ["вход продавца", "доверие каталога", "мерчант закрыт"],
  },
  profile: {
    icon: "person-circle-outline",
    title: "Финальный замок готовности профиля",
    body: "Готовность профиля закрыта для мобильного UI-слоя: вход автора, доверие профиля и граница проверки остаются честными перед следующей зоной.",
    lock: "готовность профиля закрыта",
    checks: ["вход автора", "доверие профиля", "проверка закрыта"],
  },
};

export function StreamReadinessFinalCloseLockPanel({
  version = "127K",
  variant,
  compact = false,
  style,
}: StreamReadinessFinalCloseLockPanelProps) {
  const copy = routeCopy[variant];

  return (
    <View style={[styles.wrapper, compact ? styles.wrapperCompact : null, style]}>
      <LinearGradient
        colors={["rgba(255,218,128,0.13)", "rgba(255,255,255,0.045)"]}
        style={[styles.card, compact ? styles.cardCompact : null]}
      >
        <View style={styles.headerRow}>
          <View style={styles.iconBadge}>
            <Ionicons name={copy.icon} size={compact ? 13 : 15} color="#061018" />
          </View>
          <View style={styles.titleWrap}>
            <Text style={styles.kicker} numberOfLines={1}>{version} · Закрытие готовности</Text>
            <Text style={styles.title} numberOfLines={1}>{copy.title}</Text>
          </View>
          <View style={styles.lockBadge}>
            <Ionicons name="lock-closed-outline" size={12} color="#FFDA80" />
          </View>
        </View>

        <Text style={styles.body} numberOfLines={compact ? 2 : 3}>{copy.body}</Text>

        <View style={styles.lockRow}>
          <Ionicons name="shield-checkmark-outline" size={14} color="#FFDA80" />
          <Text style={styles.lockText} numberOfLines={1}>{copy.lock}</Text>
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
  lockRow: {
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
  lockText: { color: "#FFF7E3", fontSize: 10, fontWeight: "900", flex: 1 },
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
