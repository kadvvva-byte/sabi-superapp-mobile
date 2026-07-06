import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

type StreamShortsDraftFlowClarityPanelProps = {
  readonly version?: "126C" | string;
  readonly compact?: boolean;
  readonly style?: StyleProp<ViewStyle>;
};

const flowRows = [
  { label: "вход в черновик", value: "ясно", icon: "create-outline" },
  { label: "действие редактора", value: "видно", icon: "cut-outline" },
  { label: "переход к зрителю", value: "стабильно", icon: "phone-portrait-outline" },
] as const;

export function StreamShortsDraftFlowClarityPanel({
  version = "126C",
  compact = false,
  style,
}: StreamShortsDraftFlowClarityPanelProps) {
  return (
    <View style={[styles.wrapper, compact ? styles.wrapperCompact : null, style]}>
      <LinearGradient
        colors={["rgba(242,199,91,0.12)", "rgba(255,255,255,0.045)"]}
        style={[styles.card, compact ? styles.cardCompact : null]}
      >
        <View style={styles.headerRow}>
          <View style={styles.iconBadge}>
            <Ionicons name="film-outline" size={compact ? 14 : 16} color="#0B0810" />
          </View>
          <View style={styles.titleWrap}>
            <Text style={styles.kicker} numberOfLines={1}>{version} · Путь черновика Shorts</Text>
            <Text style={styles.title} numberOfLines={1}>Путь черновика Shorts остаётся понятным</Text>
          </View>
          <View style={styles.lockPill}>
            <Ionicons name="lock-closed-outline" size={12} color="#0B0810" />
            <Text style={styles.lockText}>загрузка заблокирована</Text>
          </View>
        </View>

        <Text style={styles.body} numberOfLines={compact ? 2 : 3}>
          Shorts-маршрут понятно показывает вход в черновик, действие редактора, переход к зрителю и границу реальной загрузки; provider-публикация остаётся отключена до готовности kernel-потока.
        </Text>

        <View style={styles.flowGrid}>
          {flowRows.map((item) => (
            <View key={item.label} style={styles.flowItem}>
              <Ionicons name={item.icon} size={15} color="#F2C75B" />
              <View style={styles.flowTextWrap}>
                <Text style={styles.flowLabel} numberOfLines={1}>{item.label}</Text>
                <Text style={styles.flowValue} numberOfLines={1}>{item.value}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.boundaryRow}>
          <Ionicons name="shield-checkmark-outline" size={14} color="#F2C75B" />
          <Text style={styles.boundaryText} numberOfLines={1}>Только мобильный UI · настоящий publish-provider позже</Text>
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
    borderColor: "rgba(242,199,91,0.16)",
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
    backgroundColor: "#F2C75B",
    alignItems: "center",
    justifyContent: "center",
  },
  titleWrap: { flex: 1, minWidth: 0 },
  kicker: { color: "#F2C75B", fontSize: 10, fontWeight: "900", letterSpacing: 0.3, textTransform: "uppercase" },
  title: { color: "#FFFFFF", fontSize: 13, fontWeight: "900", marginTop: 2 },
  lockPill: {
    minHeight: 28,
    borderRadius: 14,
    paddingHorizontal: 8,
    backgroundColor: "#F2C75B",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  lockText: { color: "#0B0810", fontSize: 9, fontWeight: "900", textTransform: "uppercase" },
  body: { color: "#DDD7E8", fontSize: 11, fontWeight: "800", lineHeight: 16 },
  flowGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  flowItem: {
    minHeight: 32,
    borderRadius: 16,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  flowTextWrap: { minWidth: 82 },
  flowLabel: { color: "#FFFFFF", fontSize: 10, fontWeight: "900" },
  flowValue: { color: "#F2C75B", fontSize: 9, fontWeight: "900", textTransform: "uppercase", marginTop: 1 },
  boundaryRow: {
    minHeight: 28,
    borderRadius: 14,
    paddingHorizontal: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(242,199,91,0.08)",
    borderWidth: 1,
    borderColor: "rgba(242,199,91,0.14)",
  },
  boundaryText: { color: "#F6E7B0", fontSize: 10, fontWeight: "900", flex: 1 },
});
