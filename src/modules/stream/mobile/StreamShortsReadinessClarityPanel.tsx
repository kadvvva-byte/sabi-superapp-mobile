import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

type StreamShortsReadinessClarityPanelProps = {
  readonly version?: "127C" | string;
  readonly compact?: boolean;
  readonly style?: StyleProp<ViewStyle>;
};

const readinessSteps = [
  { icon: "videocam-outline", label: "сигнал черновика", value: "состояние клипа читается" },
  { icon: "create-outline", label: "линия редактора", value: "инструменты сгруппированы" },
  { icon: "eye-outline", label: "предпросмотр зрителя", value: "передача спокойная" },
] as const;

export function StreamShortsReadinessClarityPanel({
  version = "127C",
  compact = false,
  style,
}: StreamShortsReadinessClarityPanelProps) {
  return (
    <View style={[styles.wrapper, compact ? styles.wrapperCompact : null, style]}>
      <LinearGradient
        colors={["rgba(255,255,255,0.08)", "rgba(124,230,196,0.10)"]}
        style={[styles.card, compact ? styles.cardCompact : null]}
      >
        <View style={styles.headerRow}>
          <View style={styles.iconBadge}>
            <Ionicons name="videocam-outline" size={compact ? 14 : 16} color="#06120F" />
          </View>
          <View style={styles.titleWrap}>
            <Text style={styles.kicker} numberOfLines={1}>{version} · готовность шортов</Text>
            <Text style={styles.title} numberOfLines={1}>ясность готовности шортов</Text>
          </View>
          <View style={styles.statusBadge}>
            <Ionicons name="lock-closed-outline" size={12} color="#06120F" />
            <Text style={styles.statusText}>публикация закрыта</Text>
          </View>
        </View>

        <Text style={styles.body} numberOfLines={compact ? 2 : 3}>
          Готовность шортов остаётся ясной до реальной привязки медиа-провайдера: сигнал черновика, линия редактора, предпросмотр зрителя и граница публикации читаются без заявления об успешной загрузке.
        </Text>

        <View style={styles.stepGrid}>
          {readinessSteps.map((step) => (
            <View key={step.label} style={styles.stepCard}>
              <Ionicons name={step.icon} size={13} color="#7CE6C4" />
              <View style={styles.stepTextWrap}>
                <Text style={styles.stepLabel} numberOfLines={1}>{step.label}</Text>
                <Text style={styles.stepValue} numberOfLines={1}>{step.value}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.boundaryRow}>
          <Ionicons name="shield-checkmark-outline" size={14} color="#7CE6C4" />
          <Text style={styles.boundaryText} numberOfLines={1}>только мобильный интерфейс · реальный провайдер загрузки остаётся закрытым</Text>
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
    borderColor: "rgba(124,230,196,0.18)",
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
  statusBadge: {
    minHeight: 28,
    borderRadius: 14,
    paddingHorizontal: 8,
    backgroundColor: "#7CE6C4",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statusText: { color: "#06120F", fontSize: 9, fontWeight: "900", textTransform: "uppercase" },
  body: { color: "#E6FFF7", fontSize: 11, fontWeight: "800", lineHeight: 16 },
  stepGrid: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  stepCard: {
    minHeight: 34,
    flexGrow: 1,
    flexBasis: "30%",
    borderRadius: 15,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  stepTextWrap: { flex: 1, minWidth: 0 },
  stepLabel: { color: "#FFFFFF", fontSize: 10, fontWeight: "900", textTransform: "uppercase" },
  stepValue: { color: "#BEEFE1", fontSize: 9, fontWeight: "800", marginTop: 2 },
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
