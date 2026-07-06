import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import {
  streamMobileUiFinalAcceptanceAreas197V,
  streamMobileUiFinalAcceptanceSummary197V,
} from "./streamMobileUiFinalAcceptanceLock197V";

type Props = {
  compact?: boolean;
};

export function StreamMobileUiFinalAcceptanceLockPanel197V({ compact = false }: Props) {
  return (
    <LinearGradient
      colors={["rgba(16,34,30,0.96)", "rgba(6,18,16,0.96)"]}
      style={[styles.card, compact ? styles.cardCompact : null]}
    >
      <View style={styles.headerRow}>
        <View style={styles.iconWrap}>
          <Ionicons name="lock-closed-outline" size={18} color="#9EF5D0" />
        </View>
        <View style={styles.headerTextWrap}>
          <Text style={styles.eyebrow}>197V FINAL ACCEPTANCE LOCK</Text>
          <Text style={styles.title}>Stream Mobile UI locked at 100%</Text>
          <Text style={styles.subtitle}>
            UI is frozen as ready. Backend, provider, ledger, Wallet and payout move to the foundation stage without fake success.
          </Text>
        </View>
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metricPill}>
          <Text style={styles.metricValue}>{streamMobileUiFinalAcceptanceSummary197V.streamMobileUiReadinessPercent}%</Text>
          <Text style={styles.metricLabel}>UI ready</Text>
        </View>
        <View style={styles.metricPill}>
          <Text style={styles.metricValue}>{streamMobileUiFinalAcceptanceSummary197V.userFacingBlockerCount}</Text>
          <Text style={styles.metricLabel}>blockers</Text>
        </View>
        <View style={styles.metricPill}>
          <Text style={styles.metricValue}>{streamMobileUiFinalAcceptanceSummary197V.fakeSuccessCount}</Text>
          <Text style={styles.metricLabel}>fake success</Text>
        </View>
      </View>

      {streamMobileUiFinalAcceptanceAreas197V.map((area) => (
        <View key={area.id} style={styles.areaRow}>
          <View style={styles.areaDot} />
          <View style={styles.areaTextWrap}>
            <Text style={styles.areaTitle}>{area.title}</Text>
            <Text style={styles.areaNote}>{area.notesRu}</Text>
          </View>
          <Text style={styles.areaStatus}>
            {area.status === "locked_100_percent_ui_ready" ? "LOCKED" : "FOUNDATION"}
          </Text>
        </View>
      ))}

      <View style={styles.footerBox}>
        <Text style={styles.footerText}>
          Next: {streamMobileUiFinalAcceptanceSummary197V.nextStage}. Mobile UI stays stable; real gift ledger and receiver balance are backend-only.
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(158,245,208,0.20)",
    padding: 14,
    marginHorizontal: 14,
    marginTop: 12,
    overflow: "hidden",
  },
  cardCompact: {
    padding: 12,
    marginHorizontal: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(158,245,208,0.10)",
    borderWidth: 1,
    borderColor: "rgba(158,245,208,0.20)",
  },
  headerTextWrap: { flex: 1 },
  eyebrow: { color: "rgba(158,245,208,0.88)", fontSize: 10, fontWeight: "900", letterSpacing: 1 },
  title: { color: "#F6FFF9", fontSize: 16, fontWeight: "900", marginTop: 4 },
  subtitle: { color: "rgba(232,255,246,0.68)", fontSize: 12, lineHeight: 17, marginTop: 5 },
  metricsRow: { flexDirection: "row", gap: 8, marginTop: 12 },
  metricPill: { flex: 1, borderRadius: 16, paddingVertical: 10, paddingHorizontal: 8, backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.10)" },
  metricValue: { color: "#F6FFF9", fontSize: 16, fontWeight: "900" },
  metricLabel: { color: "rgba(232,255,246,0.60)", fontSize: 10, fontWeight: "700", marginTop: 2 },
  areaRow: { flexDirection: "row", alignItems: "center", gap: 9, marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.07)" },
  areaDot: { width: 7, height: 7, borderRadius: 7, backgroundColor: "#9EF5D0" },
  areaTextWrap: { flex: 1 },
  areaTitle: { color: "#F6FFF9", fontSize: 12, fontWeight: "900" },
  areaNote: { color: "rgba(232,255,246,0.60)", fontSize: 10, lineHeight: 14, marginTop: 2 },
  areaStatus: { color: "rgba(158,245,208,0.90)", fontSize: 10, fontWeight: "900" },
  footerBox: { marginTop: 12, borderRadius: 16, padding: 10, backgroundColor: "rgba(158,245,208,0.08)", borderWidth: 1, borderColor: "rgba(158,245,208,0.14)" },
  footerText: { color: "rgba(232,255,246,0.78)", fontSize: 11, lineHeight: 16, fontWeight: "700" },
});
