import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import { messengerUnifiedGiftRuntimePolicy197V } from "./messengerUnifiedStreamGifts197V";

type Props = {
  compact?: boolean;
  accent?: string;
};

export function MessengerUnifiedGiftsReadinessPanel197V({ compact = false, accent = "#9EF5D0" }: Props) {
  return (
    <LinearGradient
      colors={["rgba(18,32,29,0.94)", "rgba(8,17,15,0.94)"]}
      style={[styles.card, compact ? styles.cardCompact : null, { borderColor: `${accent}30` }]}
    >
      <View style={styles.row}>
        <View style={[styles.iconWrap, { borderColor: `${accent}30` }]}>
          <Ionicons name="git-merge-outline" size={17} color={accent} />
        </View>
        <View style={styles.textWrap}>
          <Text style={[styles.eyebrow, { color: accent }]}>197V UNIFIED GIFTS</Text>
          <Text style={styles.title}>Stream gifts are available in Messenger UI</Text>
          <Text style={styles.subtitle}>
            {messengerUnifiedGiftRuntimePolicy197V.giftCount} Stream gifts are mapped into the Messenger catalog. Real send, payment, Wallet mutation and payout remain backend-ledger only.
          </Text>
        </View>
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metricPill}>
          <Text style={styles.metricValue}>{messengerUnifiedGiftRuntimePolicy197V.giftCount}</Text>
          <Text style={styles.metricLabel}>unified gifts</Text>
        </View>
        <View style={styles.metricPill}>
          <Text style={styles.metricValue}>{messengerUnifiedGiftRuntimePolicy197V.minDiamondPrice}-{messengerUnifiedGiftRuntimePolicy197V.maxDiamondPrice}</Text>
          <Text style={styles.metricLabel}>diamonds</Text>
        </View>
        <View style={styles.metricPill}>
          <Text style={styles.metricValue}>$10</Text>
          <Text style={styles.metricLabel}>min top-up</Text>
        </View>
      </View>

      <Text style={styles.footerText}>
        No fake send: sender charge, receiver pending balance and available balance must come from backend gift ledger event.
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 20, borderWidth: 1, padding: 12, marginBottom: 12 },
  cardCompact: { padding: 10 },
  row: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  iconWrap: { width: 34, height: 34, borderRadius: 13, borderWidth: 1, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.06)" },
  textWrap: { flex: 1 },
  eyebrow: { fontSize: 10, fontWeight: "900", letterSpacing: 1 },
  title: { color: "#F6FFF9", fontSize: 14, fontWeight: "900", marginTop: 3 },
  subtitle: { color: "rgba(232,255,246,0.66)", fontSize: 11, lineHeight: 16, marginTop: 4 },
  metricsRow: { flexDirection: "row", gap: 8, marginTop: 10 },
  metricPill: { flex: 1, borderRadius: 14, padding: 8, backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.09)" },
  metricValue: { color: "#F6FFF9", fontSize: 13, fontWeight: "900" },
  metricLabel: { color: "rgba(232,255,246,0.58)", fontSize: 9, fontWeight: "800", marginTop: 2 },
  footerText: { color: "rgba(232,255,246,0.76)", fontSize: 10, lineHeight: 15, marginTop: 10, fontWeight: "700" },
});
