import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export type StreamFlowClarityCheckpointCloseVariant = "live" | "shorts" | "business" | "profile";

type StreamFlowClarityCheckpointClosePanelProps = {
  readonly version?: "126H" | string;
  readonly variant: StreamFlowClarityCheckpointCloseVariant;
  readonly compact?: boolean;
  readonly style?: StyleProp<ViewStyle>;
};

const routeCopy: Record<StreamFlowClarityCheckpointCloseVariant, {
  readonly icon: keyof typeof Ionicons.glyphMap;
  readonly title: string;
  readonly body: string;
  readonly checkpoint: readonly string[];
}> = {
  live: {
    icon: "radio-outline",
    title: "Контрольная точка пути эфира",
    body: "Контрольная точка пути эфира держит вход в комнату, действие ведущего, передачу зрителю и границу реального эфира понятной до начала базового этапа.",
    checkpoint: ["вход в комнату", "действие ведущего", "реальная работа закрыта"],
  },
  shorts: {
    icon: "film-outline",
    title: "Контрольная точка пути шортов",
    body: "Контрольная точка пути шортов держит вход в черновик, действие редактирования, передачу зрителю и границу публикации понятными без заявлений о загрузке.",
    checkpoint: ["вход в черновик", "действие редактирования", "публикация закрыта"],
  },
  business: {
    icon: "storefront-outline",
    title: "Контрольная точка бизнес-пути",
    body: "Контрольная точка бизнес-пути держит вход продавца, действие каталога, передачу покупателю и границу мерчанта понятными, пока активация закрыта.",
    checkpoint: ["вход продавца", "действие каталога", "мерчант закрыт"],
  },
  profile: {
    icon: "person-circle-outline",
    title: "Контрольная точка пути профиля",
    body: "Контрольная точка пути профиля держит вход автора, действие профиля, передачу зрителю и границу верификации понятными для будущей реальной работы.",
    checkpoint: ["вход профиля", "действие автора", "верификация закрыта"],
  },
};

export function StreamFlowClarityCheckpointClosePanel({
  version = "126H",
  variant,
  compact = false,
  style,
}: StreamFlowClarityCheckpointClosePanelProps) {
  const copy = routeCopy[variant];

  return (
    <View style={[styles.wrapper, compact ? styles.wrapperCompact : null, style]}>
      <LinearGradient
        colors={["rgba(124,230,196,0.13)", "rgba(255,255,255,0.04)"]}
        style={[styles.card, compact ? styles.cardCompact : null]}
      >
        <View style={styles.headerRow}>
          <View style={styles.iconBadge}>
            <Ionicons name={copy.icon} size={compact ? 14 : 16} color="#06120F" />
          </View>
          <View style={styles.titleWrap}>
            <Text style={styles.kicker} numberOfLines={1}>{version} · Чёткость пути: контроль</Text>
            <Text style={styles.title} numberOfLines={1}>{copy.title}</Text>
          </View>
          <View style={styles.checkBadge}>
            <Ionicons name="checkmark-circle-outline" size={12} color="#06120F" />
            <Text style={styles.checkBadgeText}>закрыто</Text>
          </View>
        </View>

        <Text style={styles.body} numberOfLines={compact ? 2 : 3}>
          {copy.body}
        </Text>

        <View style={styles.checkpointGrid}>
          {copy.checkpoint.map((item) => (
            <View key={item} style={styles.checkpointPill}>
              <Ionicons name="ellipse-outline" size={10} color="#7CE6C4" />
              <Text style={styles.checkpointText} numberOfLines={1}>{item}</Text>
            </View>
          ))}
        </View>

        <View style={styles.boundaryRow}>
          <Ionicons name="shield-checkmark-outline" size={14} color="#7CE6C4" />
          <Text style={styles.boundaryText} numberOfLines={1}>Контроль закрыт · только мобильный интерфейс · граница ядра сохранена</Text>
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
    borderColor: "rgba(124,230,196,0.16)",
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
    backgroundColor: "#7CE6C4",
    alignItems: "center",
    justifyContent: "center",
  },
  titleWrap: { flex: 1, minWidth: 0 },
  kicker: { color: "#7CE6C4", fontSize: 10, fontWeight: "900", letterSpacing: 0.3, textTransform: "uppercase" },
  title: { color: "#FFFFFF", fontSize: 13, fontWeight: "900", marginTop: 2 },
  checkBadge: {
    minHeight: 28,
    borderRadius: 14,
    paddingHorizontal: 8,
    backgroundColor: "#7CE6C4",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  checkBadgeText: { color: "#06120F", fontSize: 9, fontWeight: "900", textTransform: "uppercase" },
  body: { color: "#E6FFF7", fontSize: 11, fontWeight: "800", lineHeight: 16 },
  checkpointGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  checkpointPill: {
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
  checkpointText: { color: "#FFFFFF", fontSize: 10, fontWeight: "800" },
  boundaryRow: {
    minHeight: 28,
    borderRadius: 14,
    paddingHorizontal: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(124,230,196,0.08)",
    borderWidth: 1,
    borderColor: "rgba(124,230,196,0.15)",
  },
  boundaryText: { color: "#E6FFF7", fontSize: 10, fontWeight: "900", flex: 1 },
});
