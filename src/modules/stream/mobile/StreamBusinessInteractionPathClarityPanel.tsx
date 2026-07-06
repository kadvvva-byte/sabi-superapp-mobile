import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

type StreamBusinessInteractionPathClarityPanelProps = {
  readonly version?: "123D" | string;
  readonly compact?: boolean;
  readonly style?: StyleProp<ViewStyle>;
};

const businessPathSteps = [
  "путь продавца понятен",
  "каталог спокойно",
  "оплата закрыта",
] as const;

export function StreamBusinessInteractionPathClarityPanel({
  version = "123D",
  compact = false,
  style,
}: StreamBusinessInteractionPathClarityPanelProps) {
  return (
    <View style={[styles.wrapper, compact ? styles.wrapperCompact : null, style]}>
      <LinearGradient
        colors={["rgba(242,199,91,0.15)", "rgba(255,255,255,0.05)"]}
        style={[styles.card, compact ? styles.cardCompact : null]}
      >
        <View style={styles.headerRow}>
          <View style={styles.iconBadge}>
            <Ionicons name="briefcase-outline" size={compact ? 14 : 16} color="#0B0810" />
          </View>
          <View style={styles.titleWrap}>
            <Text style={styles.kicker} numberOfLines={1}>{version} · путь взаимодействия бизнеса</Text>
            <Text style={styles.title} numberOfLines={1}>Путь бизнеса понятнее</Text>
          </View>
          <View style={styles.lockPill}>
            <Ionicons name="lock-closed-outline" size={12} color="#0B0810" />
            <Text style={styles.lockText}>закрыто</Text>
          </View>
        </View>

        <Text style={styles.body} numberOfLines={compact ? 2 : 3}>
          Путь бизнеса оставляет настройку продавца понятной, каталог спокойным, а оплату, KYB, заказы и выплаты закрытыми до реальной торговой активации.
        </Text>

        <View style={styles.stepRow}>
          {businessPathSteps.map((step, index) => (
            <View key={step} style={styles.stepPill}>
              <Text style={styles.stepIndex}>{index + 1}</Text>
              <Text style={styles.stepText} numberOfLines={1}>{step}</Text>
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
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(242,199,91,0.17)",
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
  stepRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  stepPill: {
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
  stepIndex: { color: "#F2C75B", fontSize: 10, fontWeight: "900" },
  stepText: { color: "#FFFFFF", fontSize: 10, fontWeight: "800" },
});
