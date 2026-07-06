import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export type StreamProofFinalCloseLockVariant = "live" | "shorts" | "business" | "profile";

type StreamProofFinalCloseLockPanelProps = {
  readonly version?: "128K" | string;
  readonly variant: StreamProofFinalCloseLockVariant;
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

const routeCopy: Record<StreamProofFinalCloseLockVariant, RouteCopy> = {
  live: {
    icon: "radio-outline",
    title: "Финальный замок доказательств эфира",
    body: "Доказательства эфира закрыты с доказательством ведущего, контекстом комнаты, доверием зрителей и честным описанием провайдера для следующей мобильной зоны.",
    lock: "доказательства эфира закрыты",
    checks: ["доказательство ведущего", "доверие зрителя", "провайдер закрыт"],
  },
  shorts: {
    icon: "film-outline",
    title: "Финальный замок доказательств шортов",
    body: "Доказательства шортов закрыты с доказательством черновика, контекстом автора, состоянием редактирования и честным описанием публикации для следующей мобильной зоны.",
    lock: "доказательства шортов закрыты",
    checks: ["доказательство черновика", "доверие к редактору", "публикация закрыта"],
  },
  business: {
    icon: "storefront-outline",
    title: "Финальный замок доказательств бизнеса",
    body: "Доказательства бизнеса закрыты с доказательством продавца, контекстом каталога, доверием покупателя и честным описанием мерчанта для следующей мобильной зоны.",
    lock: "доказательства бизнеса закрыты",
    checks: ["доказательство продавца", "доверие покупателя", "мерчант закрыт"],
  },
  profile: {
    icon: "person-circle-outline",
    title: "Финальный замок доказательств профиля",
    body: "Доказательства профиля закрыты с доказательством автора, контекстом профиля, доверием зрителя и честным описанием проверки для следующей мобильной зоны.",
    lock: "доказательства профиля закрыты",
    checks: ["доказательство автора", "доверие профиля", "проверка закрыта"],
  },
};

export function StreamProofFinalCloseLockPanel({
  version = "128K",
  variant,
  compact = false,
  style,
}: StreamProofFinalCloseLockPanelProps) {
  const copy = routeCopy[variant];

  return (
    <View style={[styles.wrapper, compact ? styles.wrapperCompact : null, style]}>
      <LinearGradient
        colors={["rgba(178,236,255,0.13)", "rgba(255,255,255,0.035)"]}
        style={[styles.card, compact ? styles.cardCompact : null]}
      >
        <View style={styles.headerRow}>
          <View style={styles.iconBadge}>
            <Ionicons name={copy.icon} size={compact ? 13 : 15} color="#061018" />
          </View>
          <View style={styles.titleWrap}>
            <Text style={styles.kicker} numberOfLines={1}>{version} · Закрытие доказательств</Text>
            <Text style={styles.title} numberOfLines={1}>{copy.title}</Text>
          </View>
          <View style={styles.lockBadge}>
            <Ionicons name="lock-closed-outline" size={12} color="#B2ECFF" />
          </View>
        </View>

        <Text style={styles.body} numberOfLines={compact ? 2 : 3}>{copy.body}</Text>

        <View style={styles.lockRow}>
          <Ionicons name="shield-checkmark-outline" size={14} color="#B2ECFF" />
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
    borderColor: "rgba(178,236,255,0.16)",
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
    backgroundColor: "#B2ECFF",
    alignItems: "center",
    justifyContent: "center",
  },
  titleWrap: { flex: 1, minWidth: 0 },
  kicker: { color: "#B2ECFF", fontSize: 10, fontWeight: "900", letterSpacing: 0.28, textTransform: "uppercase" },
  title: { color: "#FFFFFF", fontSize: 13, fontWeight: "900", marginTop: 2 },
  lockBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(178,236,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(178,236,255,0.16)",
  },
  body: { color: "#EAFBFF", fontSize: 11, fontWeight: "800", lineHeight: 16 },
  lockRow: {
    minHeight: 28,
    borderRadius: 14,
    paddingHorizontal: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(178,236,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(178,236,255,0.14)",
  },
  lockText: { color: "#EAFBFF", fontSize: 10, fontWeight: "900", flex: 1 },
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
