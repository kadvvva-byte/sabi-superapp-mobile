import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

type StreamLiveProofClarityPanelProps = {
  readonly version?: "128B" | string;
  readonly compact?: boolean;
  readonly style?: StyleProp<ViewStyle>;
};

const proofItems = [
  { label: "сигнал ведущего", value: "видно" },
  { label: "доверие комнаты", value: "ясно" },
  { label: "путь зрителя", value: "стабильно" },
] as const;

export function StreamLiveProofClarityPanel({
  version = "128B",
  compact = false,
  style,
}: StreamLiveProofClarityPanelProps) {
  return (
    <View style={[styles.wrapper, compact ? styles.wrapperCompact : null, style]}>
      <LinearGradient
        colors={["rgba(255,218,128,0.15)", "rgba(255,255,255,0.045)"]}
        style={[styles.card, compact ? styles.cardCompact : null]}
      >
        <View style={styles.headerRow}>
          <View style={styles.iconBadge}>
            <Ionicons name="radio-outline" size={compact ? 13 : 15} color="#061018" />
          </View>
          <View style={styles.titleWrap}>
            <Text style={styles.kicker} numberOfLines={1}>{version} · доказательство эфира</Text>
            <Text style={styles.title} numberOfLines={1}>ясность доказательства эфира</Text>
          </View>
          <View style={styles.lockBadge}>
            <Ionicons name="shield-checkmark-outline" size={12} color="#FFDA80" />
          </View>
        </View>

        <Text style={styles.body} numberOfLines={compact ? 2 : 3}>
          Доказательство комнаты эфира читается до этапа запуска: сигнал ведущего, доверие комнаты, путь зрителя и ограничения провайдера остаются ясными.
        </Text>

        <View style={styles.proofRow}>
          {proofItems.map((item) => (
            <View key={item.label} style={styles.proofPill}>
              <Text style={styles.proofLabel} numberOfLines={1}>{item.label}</Text>
              <Text style={styles.proofValue} numberOfLines={1}>{item.value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.boundaryRow}>
          <Ionicons name="lock-closed-outline" size={13} color="#FFDA80" />
          <Text style={styles.boundaryText} numberOfLines={1}>реальный провайдер эфира закрыт до фундаментного этапа</Text>
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
  proofRow: { flexDirection: "row", gap: 6 },
  proofPill: {
    flex: 1,
    minHeight: 40,
    borderRadius: 15,
    paddingHorizontal: 8,
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.055)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  proofLabel: { color: "#FFDA80", fontSize: 9, fontWeight: "900", textTransform: "uppercase" },
  proofValue: { color: "#FFFFFF", fontSize: 11, fontWeight: "900", marginTop: 2 },
  boundaryRow: {
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
  boundaryText: { color: "#FFF7E3", fontSize: 10, fontWeight: "900", flex: 1 },
});
