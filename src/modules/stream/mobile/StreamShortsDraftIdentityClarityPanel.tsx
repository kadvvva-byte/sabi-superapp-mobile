import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

type StreamShortsDraftIdentityClarityPanelProps = {
  readonly version?: "125C" | string;
  readonly compact?: boolean;
  readonly style?: StyleProp<ViewStyle>;
};

const draftRows = [
  { label: "профиль автора", value: "видно", icon: "person-outline" },
  { label: "название черновика", value: "ясно", icon: "film-outline" },
  { label: "статус редактора", value: "сохранено локально", icon: "create-outline" },
] as const;

export function StreamShortsDraftIdentityClarityPanel({
  version = "125C",
  compact = false,
  style,
}: StreamShortsDraftIdentityClarityPanelProps) {
  return (
    <View style={[styles.wrapper, compact ? styles.wrapperCompact : null, style]}>
      <LinearGradient
        colors={["rgba(111,226,170,0.14)", "rgba(255,255,255,0.045)"]}
        style={[styles.card, compact ? styles.cardCompact : null]}
      >
        <View style={styles.headerRow}>
          <View style={styles.iconBadge}>
            <Ionicons name="videocam-outline" size={compact ? 14 : 16} color="#06140D" />
          </View>
          <View style={styles.titleWrap}>
            <Text style={styles.kicker} numberOfLines={1}>{version} · Профиль черновика Shorts</Text>
            <Text style={styles.title} numberOfLines={1}>Автор и черновик остаются понятными</Text>
          </View>
          <View style={styles.lockPill}>
            <Ionicons name="lock-closed-outline" size={12} color="#06140D" />
            <Text style={styles.lockText}>публикация заблокирована</Text>
          </View>
        </View>

        <Text style={styles.body} numberOfLines={compact ? 2 : 3}>
          Shorts-маршрут понятно показывает имя автора, название черновика, статус редактора и границу публикации; реальная загрузка и модерация остаются provider-ready на следующий этап.
        </Text>

        <View style={styles.draftGrid}>
          {draftRows.map((item) => (
            <View key={item.label} style={styles.draftItem}>
              <Ionicons name={item.icon} size={15} color="#6FE2AA" />
              <View style={styles.draftTextWrap}>
                <Text style={styles.draftLabel} numberOfLines={1}>{item.label}</Text>
                <Text style={styles.draftValue} numberOfLines={1}>{item.value}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.boundaryRow}>
          <Ionicons name="shield-checkmark-outline" size={14} color="#6FE2AA" />
          <Text style={styles.boundaryText} numberOfLines={1}>Только мобильный UI · настоящий upload-runtime позже</Text>
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
    borderColor: "rgba(111,226,170,0.16)",
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
    backgroundColor: "#6FE2AA",
    alignItems: "center",
    justifyContent: "center",
  },
  titleWrap: { flex: 1, minWidth: 0 },
  kicker: { color: "#6FE2AA", fontSize: 10, fontWeight: "900", letterSpacing: 0.3, textTransform: "uppercase" },
  title: { color: "#FFFFFF", fontSize: 13, fontWeight: "900", marginTop: 2 },
  lockPill: {
    minHeight: 28,
    borderRadius: 14,
    paddingHorizontal: 8,
    backgroundColor: "#6FE2AA",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  lockText: { color: "#06140D", fontSize: 9, fontWeight: "900", textTransform: "uppercase" },
  body: { color: "#D9F2E7", fontSize: 11, fontWeight: "800", lineHeight: 16 },
  draftGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  draftItem: {
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
  draftTextWrap: { minWidth: 82 },
  draftLabel: { color: "#FFFFFF", fontSize: 10, fontWeight: "900" },
  draftValue: { color: "#6FE2AA", fontSize: 9, fontWeight: "900", textTransform: "uppercase", marginTop: 1 },
  boundaryRow: {
    minHeight: 28,
    borderRadius: 14,
    paddingHorizontal: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(111,226,170,0.08)",
    borderWidth: 1,
    borderColor: "rgba(111,226,170,0.14)",
  },
  boundaryText: { color: "#C9FFE4", fontSize: 10, fontWeight: "900", flex: 1 },
});
