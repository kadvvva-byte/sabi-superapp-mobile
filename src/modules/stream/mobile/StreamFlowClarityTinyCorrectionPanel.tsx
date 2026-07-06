import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export type StreamFlowClarityTinyCorrectionVariant = "live" | "shorts" | "business" | "profile";

type StreamFlowClarityTinyCorrectionPanelProps = {
  readonly version?: "126G" | string;
  readonly variant: StreamFlowClarityTinyCorrectionVariant;
  readonly compact?: boolean;
  readonly style?: StyleProp<ViewStyle>;
};

const routeCopy: Record<StreamFlowClarityTinyCorrectionVariant, {
  readonly icon: keyof typeof Ionicons.glyphMap;
  readonly title: string;
  readonly body: string;
  readonly checks: readonly string[];
}> = {
  live: {
    icon: "radio-outline",
    title: "Коррекция пути эфира",
    body: "Маленькая коррекция пути эфира держит вход, действие ведущего, передачу зрителю и границу реального эфира в спокойном порядке чтения для следующего базового этапа.",
    checks: ["порядок входа", "действие ведущего", "реальная работа закрыта"],
  },
  shorts: {
    icon: "film-outline",
    title: "Коррекция пути шортов",
    body: "Маленькая коррекция пути шортов держит вход в черновик, действие редактирования, передачу зрителю и границу публикации понятными без заявления о подключённой загрузке.",
    checks: ["порядок черновика", "действие редактирования", "публикация закрыта"],
  },
  business: {
    icon: "storefront-outline",
    title: "Коррекция бизнес-пути",
    body: "Маленькая коррекция бизнес-пути держит вход продавца, действие каталога, передачу покупателю и границу мерчанта понятными, пока активация закрыта.",
    checks: ["порядок продавца", "действие каталога", "мерчант закрыт"],
  },
  profile: {
    icon: "person-circle-outline",
    title: "Коррекция пути профиля",
    body: "Маленькая коррекция пути профиля держит вход автора, действие профиля, передачу зрителю и границу верификации понятными для будущей реальной работы.",
    checks: ["порядок профиля", "действие автора", "реальная работа закрыта"],
  },
};

export function StreamFlowClarityTinyCorrectionPanel({
  version = "126G",
  variant,
  compact = false,
  style,
}: StreamFlowClarityTinyCorrectionPanelProps) {
  const copy = routeCopy[variant];

  return (
    <View style={[styles.wrapper, compact ? styles.wrapperCompact : null, style]}>
      <LinearGradient
        colors={["rgba(124,230,196,0.14)", "rgba(255,255,255,0.045)"]}
        style={[styles.card, compact ? styles.cardCompact : null]}
      >
        <View style={styles.headerRow}>
          <View style={styles.iconBadge}>
            <Ionicons name={copy.icon} size={compact ? 14 : 16} color="#06120F" />
          </View>
          <View style={styles.titleWrap}>
            <Text style={styles.kicker} numberOfLines={1}>{version} · Чёткость пути: коррекция</Text>
            <Text style={styles.title} numberOfLines={1}>{copy.title}</Text>
          </View>
          <View style={styles.lockPill}>
            <Ionicons name="lock-closed-outline" size={12} color="#06120F" />
            <Text style={styles.lockText}>закрыто</Text>
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
          <Ionicons name="shield-checkmark-outline" size={14} color="#7CE6C4" />
          <Text style={styles.boundaryText} numberOfLines={1}>Только мобильный интерфейс · реальная работа позже</Text>
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
    borderColor: "rgba(124,230,196,0.17)",
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
  lockPill: {
    minHeight: 28,
    borderRadius: 14,
    paddingHorizontal: 8,
    backgroundColor: "#7CE6C4",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  lockText: { color: "#06120F", fontSize: 9, fontWeight: "900", textTransform: "uppercase" },
  body: { color: "#E6FFF7", fontSize: 11, fontWeight: "800", lineHeight: 16 },
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
  checkIndex: { color: "#7CE6C4", fontSize: 10, fontWeight: "900" },
  checkText: { color: "#FFFFFF", fontSize: 10, fontWeight: "800" },
  boundaryRow: {
    minHeight: 28,
    borderRadius: 14,
    paddingHorizontal: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(124,230,196,0.09)",
    borderWidth: 1,
    borderColor: "rgba(124,230,196,0.16)",
  },
  boundaryText: { color: "#E6FFF7", fontSize: 10, fontWeight: "900", flex: 1 },
});
