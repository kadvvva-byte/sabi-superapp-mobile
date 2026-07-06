import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

type StreamProfileReadinessClarityPanelProps = {
  readonly version?: "127E" | string;
  readonly compact?: boolean;
  readonly style?: StyleProp<ViewStyle>;
};

const readinessSteps = [
  { icon: "person-circle-outline", label: "сигнал автора", value: "личность профиля читается" },
  { icon: "images-outline", label: "медиа-линия", value: "фото и видео ясные" },
  { icon: "shield-checkmark-outline", label: "линия проверки", value: "граница проверки честная" },
] as const;

export function StreamProfileReadinessClarityPanel({
  version = "127E",
  compact = false,
  style,
}: StreamProfileReadinessClarityPanelProps) {
  return (
    <View style={[styles.wrapper, compact ? styles.wrapperCompact : null, style]}>
      <LinearGradient
        colors={["rgba(255,255,255,0.08)", "rgba(242,199,91,0.10)"]}
        style={[styles.card, compact ? styles.cardCompact : null]}
      >
        <View style={styles.headerRow}>
          <View style={styles.iconBadge}>
            <Ionicons name="person-circle-outline" size={compact ? 14 : 16} color="#161106" />
          </View>
          <View style={styles.titleWrap}>
            <Text style={styles.kicker} numberOfLines={1}>{version} · готовность профиля</Text>
            <Text style={styles.title} numberOfLines={1}>ясность готовности профиля</Text>
          </View>
          <View style={styles.statusBadge}>
            <Ionicons name="lock-closed-outline" size={12} color="#161106" />
            <Text style={styles.statusText}>проверка закрыта</Text>
          </View>
        </View>

        <Text style={styles.body} numberOfLines={compact ? 2 : 3}>
          Готовность профиля читается до реальной проверки и привязки провайдера: сигнал автора, медиа-линия, линия проверки и публичное доверие ясны без заявления об активации.
        </Text>

        <View style={styles.stepGrid}>
          {readinessSteps.map((step) => (
            <View key={step.label} style={styles.stepCard}>
              <Ionicons name={step.icon} size={13} color="#F2C75B" />
              <View style={styles.stepTextWrap}>
                <Text style={styles.stepLabel} numberOfLines={1}>{step.label}</Text>
                <Text style={styles.stepValue} numberOfLines={1}>{step.value}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.boundaryRow}>
          <Ionicons name="shield-checkmark-outline" size={14} color="#F2C75B" />
          <Text style={styles.boundaryText} numberOfLines={1}>только мобильный интерфейс · реальная проверка автора остаётся закрытой</Text>
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
    borderColor: "rgba(242,199,91,0.18)",
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
  statusBadge: {
    minHeight: 28,
    borderRadius: 14,
    paddingHorizontal: 8,
    backgroundColor: "#F2C75B",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statusText: { color: "#161106", fontSize: 9, fontWeight: "900", textTransform: "uppercase" },
  body: { color: "#FFF5DC", fontSize: 11, fontWeight: "800", lineHeight: 16 },
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
  stepValue: { color: "#F6DFA5", fontSize: 9, fontWeight: "800", marginTop: 2 },
  boundaryRow: {
    minHeight: 28,
    borderRadius: 14,
    paddingHorizontal: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(242,199,91,0.08)",
    borderWidth: 1,
    borderColor: "rgba(242,199,91,0.15)",
  },
  boundaryText: { color: "#FFF5DC", fontSize: 10, fontWeight: "900", flex: 1 },
});
