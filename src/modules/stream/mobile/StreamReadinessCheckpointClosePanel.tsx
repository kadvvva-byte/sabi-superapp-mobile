import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export type StreamReadinessCheckpointCloseVariant = "live" | "shorts" | "business" | "profile";

type StreamReadinessCheckpointClosePanelProps = {
  readonly version?: "127H" | string;
  readonly variant: StreamReadinessCheckpointCloseVariant;
  readonly compact?: boolean;
  readonly style?: StyleProp<ViewStyle>;
};

type RouteCopy = {
  readonly icon: keyof typeof Ionicons.glyphMap;
  readonly title: string;
  readonly body: string;
  readonly checkpoint: string;
  readonly checks: readonly string[];
};

const routeCopy: Record<StreamReadinessCheckpointCloseVariant, RouteCopy> = {
  live: {
    icon: "radio-outline",
    title: "Контрольная точка готовности эфира",
    body: "Эфир сохраняет вход ведущего, состояние комнаты, уверенность зрителя и честное описание закрытого провайдера для контрольной точки интерфейса.",
    checkpoint: "контрольная точка готовности эфира закрыта",
    checks: ["вход ведущего", "состояние комнаты", "запуск закрыт"],
  },
  shorts: {
    icon: "film-outline",
    title: "Контрольная точка готовности шортов",
    body: "Шорты сохраняют вход черновика, состояние редактора, действие зрителя и честное описание закрытой публикации для контрольной точки интерфейса.",
    checkpoint: "контрольная точка готовности шортов закрыта",
    checks: ["вход черновика", "состояние редактора", "публикация закрыта"],
  },
  business: {
    icon: "storefront-outline",
    title: "Контрольная точка готовности бизнеса",
    body: "Бизнес сохраняет вход продавца, состояние каталога, уверенность покупателя и честное описание закрытого мерчанта для контрольной точки интерфейса.",
    checkpoint: "контрольная точка готовности бизнеса закрыта",
    checks: ["вход продавца", "состояние каталога", "провайдер закрыт"],
  },
  profile: {
    icon: "person-circle-outline",
    title: "Контрольная точка готовности профиля",
    body: "Профиль сохраняет вход автора, состояние публичного профиля, уверенность зрителя и честное описание закрытой проверки для контрольной точки интерфейса.",
    checkpoint: "контрольная точка готовности профиля закрыта",
    checks: ["вход автора", "состояние профиля", "проверка закрыта"],
  },
};

export function StreamReadinessCheckpointClosePanel({
  version = "127H",
  variant,
  compact = false,
  style,
}: StreamReadinessCheckpointClosePanelProps) {
  const copy = routeCopy[variant];

  return (
    <View style={[styles.wrapper, compact ? styles.wrapperCompact : null, style]}>
      <LinearGradient
        colors={["rgba(158,232,255,0.12)", "rgba(255,255,255,0.045)"]}
        style={[styles.card, compact ? styles.cardCompact : null]}
      >
        <View style={styles.headerRow}>
          <View style={styles.iconBadge}>
            <Ionicons name={copy.icon} size={compact ? 13 : 15} color="#061018" />
          </View>
          <View style={styles.titleWrap}>
            <Text style={styles.kicker} numberOfLines={1}>{version} · Readiness checkpoint</Text>
            <Text style={styles.title} numberOfLines={1}>{copy.title}</Text>
          </View>
          <View style={styles.lockBadge}>
            <Ionicons name="shield-checkmark-outline" size={12} color="#9EE8FF" />
          </View>
        </View>

        <Text style={styles.body} numberOfLines={compact ? 2 : 3}>{copy.body}</Text>

        <View style={styles.checkpointRow}>
          <Ionicons name="checkmark-circle-outline" size={14} color="#9EE8FF" />
          <Text style={styles.checkpointText} numberOfLines={1}>{copy.checkpoint}</Text>
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
    borderColor: "rgba(158,232,255,0.17)",
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
    backgroundColor: "#9EE8FF",
    alignItems: "center",
    justifyContent: "center",
  },
  titleWrap: { flex: 1, minWidth: 0 },
  kicker: { color: "#9EE8FF", fontSize: 10, fontWeight: "900", letterSpacing: 0.28, textTransform: "uppercase" },
  title: { color: "#FFFFFF", fontSize: 13, fontWeight: "900", marginTop: 2 },
  lockBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(158,232,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(158,232,255,0.16)",
  },
  body: { color: "#EAFBFF", fontSize: 11, fontWeight: "800", lineHeight: 16 },
  checkpointRow: {
    minHeight: 28,
    borderRadius: 14,
    paddingHorizontal: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(158,232,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(158,232,255,0.14)",
  },
  checkpointText: { color: "#EAFBFF", fontSize: 10, fontWeight: "900", flex: 1 },
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
