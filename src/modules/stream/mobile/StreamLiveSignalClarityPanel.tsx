import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

type StreamLiveSignalClarityPanelProps = {
  readonly version?: "129B" | string;
  readonly compact?: boolean;
  readonly style?: StyleProp<ViewStyle>;
};

type SignalItem = {
  readonly icon: keyof typeof Ionicons.glyphMap;
  readonly label: string;
  readonly value: string;
};

const signalItems: readonly SignalItem[] = [
  { icon: "pulse-outline", label: "сигнал ведущего", value: "состояние видно" },
  { icon: "radio-outline", label: "передача комнаты", value: "путь понятен" },
  { icon: "cellular-outline", label: "граница выполнения", value: "провайдер закрыт" },
] as const;

export function StreamLiveSignalClarityPanel({
  version = "129B",
  compact = false,
  style,
}: StreamLiveSignalClarityPanelProps) {
  return (
    <View style={[styles.wrapper, compact ? styles.wrapperCompact : null, style]}>
      <LinearGradient
        colors={["rgba(255,218,128,0.16)", "rgba(124,230,196,0.075)"]}
        style={[styles.card, compact ? styles.cardCompact : null]}
      >
        <View style={styles.headerRow}>
          <View style={styles.iconBadge}>
            <Ionicons name="pulse-outline" size={compact ? 13 : 15} color="#061018" />
          </View>
          <View style={styles.titleWrap}>
            <Text style={styles.kicker} numberOfLines={1}>{version} · сигнал эфира</Text>
            <Text style={styles.title} numberOfLines={1}>Ясность сигнала эфира</Text>
          </View>
          <View style={styles.statusBadge}>
            <Ionicons name="lock-closed-outline" size={12} color="#FFDA80" />
          </View>
        </View>

        <Text style={styles.body} numberOfLines={compact ? 2 : 3}>
          Сигнал эфира остаётся понятным до подключения провайдера: состояние ведущего, передача комнаты и граница выполнения видны без имитации подключённого эфира.
        </Text>

        <View style={styles.signalGrid}>
          {signalItems.map((item) => (
            <View key={item.label} style={styles.signalCard}>
              <Ionicons name={item.icon} size={13} color="#FFDA80" />
              <View style={styles.signalTextWrap}>
                <Text style={styles.signalLabel} numberOfLines={1}>{item.label}</Text>
                <Text style={styles.signalValue} numberOfLines={1}>{item.value}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.boundaryRow}>
          <Ionicons name="shield-checkmark-outline" size={14} color="#7CE6C4" />
          <Text style={styles.boundaryText} numberOfLines={1}>Только мобильный интерфейс · реальный эфирный провайдер закрыт</Text>
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
  statusBadge: {
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
  signalGrid: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  signalCard: {
    minHeight: 34,
    flexGrow: 1,
    flexBasis: "30%",
    borderRadius: 15,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "rgba(255,255,255,0.055)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  signalTextWrap: { flex: 1, minWidth: 0 },
  signalLabel: { color: "#FFFFFF", fontSize: 10, fontWeight: "900", textTransform: "uppercase" },
  signalValue: { color: "#FFE8A7", fontSize: 9, fontWeight: "800", marginTop: 2 },
  boundaryRow: {
    minHeight: 28,
    borderRadius: 14,
    paddingHorizontal: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(124,230,196,0.075)",
    borderWidth: 1,
    borderColor: "rgba(124,230,196,0.14)",
  },
  boundaryText: { color: "#E6FFF7", fontSize: 10, fontWeight: "900", flex: 1 },
});
