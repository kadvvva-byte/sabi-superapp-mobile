import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

type StreamProfileCreatorIdentityClarityPanelProps = {
  readonly version?: "125E" | string;
  readonly compact?: boolean;
  readonly style?: StyleProp<ViewStyle>;
};

const creatorRows = [
  { label: "профиль автора", value: "видно", icon: "person-circle-outline" },
  { label: "имя профиля", value: "ясно", icon: "id-card-outline" },
  { label: "статус проверки", value: "заблокировано", icon: "shield-checkmark-outline" },
] as const;

export function StreamProfileCreatorIdentityClarityPanel({
  version = "125E",
  compact = false,
  style,
}: StreamProfileCreatorIdentityClarityPanelProps) {
  return (
    <View style={[styles.wrapper, compact ? styles.wrapperCompact : null, style]}>
      <LinearGradient
        colors={["rgba(181,140,255,0.16)", "rgba(255,255,255,0.045)"]}
        style={[styles.card, compact ? styles.cardCompact : null]}
      >
        <View style={styles.headerRow}>
          <View style={styles.iconBadge}>
            <Ionicons name="person-circle-outline" size={compact ? 14 : 16} color="#10071F" />
          </View>
          <View style={styles.titleWrap}>
            <Text style={styles.kicker} numberOfLines={1}>{version} · Профиль автора</Text>
            <Text style={styles.title} numberOfLines={1}>Профиль автора остаётся понятным</Text>
          </View>
          <View style={styles.lockPill}>
            <Ionicons name="lock-closed-outline" size={12} color="#10071F" />
            <Text style={styles.lockText}>заработок заблокирован</Text>
          </View>
        </View>

        <Text style={styles.body} numberOfLines={compact ? 2 : 3}>
          Profile-маршрут понятно показывает профиль автора, имя профиля, статус проверки и границу заработка; реальная проверка автора и payout-runtime остаются заблокированы до backend и Admin этапа.
        </Text>

        <View style={styles.creatorGrid}>
          {creatorRows.map((item) => (
            <View key={item.label} style={styles.creatorItem}>
              <Ionicons name={item.icon} size={15} color="#B58CFF" />
              <View style={styles.creatorTextWrap}>
                <Text style={styles.creatorLabel} numberOfLines={1}>{item.label}</Text>
                <Text style={styles.creatorValue} numberOfLines={1}>{item.value}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.boundaryRow}>
          <Ionicons name="shield-checkmark-outline" size={14} color="#B58CFF" />
          <Text style={styles.boundaryText} numberOfLines={1}>Только мобильный UI · настоящий creator-runtime позже</Text>
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
    borderColor: "rgba(181,140,255,0.18)",
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
    backgroundColor: "#B58CFF",
    alignItems: "center",
    justifyContent: "center",
  },
  titleWrap: { flex: 1, minWidth: 0 },
  kicker: { color: "#B58CFF", fontSize: 10, fontWeight: "900", letterSpacing: 0.3, textTransform: "uppercase" },
  title: { color: "#FFFFFF", fontSize: 13, fontWeight: "900", marginTop: 2 },
  lockPill: {
    minHeight: 28,
    borderRadius: 14,
    paddingHorizontal: 8,
    backgroundColor: "#B58CFF",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  lockText: { color: "#10071F", fontSize: 9, fontWeight: "900", textTransform: "uppercase" },
  body: { color: "#EBDFFF", fontSize: 11, fontWeight: "800", lineHeight: 16 },
  creatorGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  creatorItem: {
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
  creatorTextWrap: { minWidth: 82 },
  creatorLabel: { color: "#FFFFFF", fontSize: 10, fontWeight: "900" },
  creatorValue: { color: "#B58CFF", fontSize: 9, fontWeight: "900", textTransform: "uppercase", marginTop: 1 },
  boundaryRow: {
    minHeight: 28,
    borderRadius: 14,
    paddingHorizontal: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(181,140,255,0.09)",
    borderWidth: 1,
    borderColor: "rgba(181,140,255,0.16)",
  },
  boundaryText: { color: "#EBDFFF", fontSize: 10, fontWeight: "900", flex: 1 },
});
