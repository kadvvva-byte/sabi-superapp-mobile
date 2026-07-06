import React, { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { getStreamMobileUiRuntimeFreeFinalQaSnapshot197U } from "./streamMobileUiRuntimeFreeFinalQa197U";

type IconName = keyof typeof Ionicons.glyphMap;

type StreamMobileUiRuntimeFreeFinalQaPanel197UProps = {
  readonly compact?: boolean;
  readonly style?: StyleProp<ViewStyle>;
};

const laneIconMap: Record<string, IconName> = {
  navigation_acceptance: "compass-outline",
  live_room_ui: "radio-outline",
  business_live_ui: "briefcase-outline",
  shorts_ui: "play-circle-outline",
  gift_ui: "gift-outline",
  gift_monetization_ui: "diamond-outline",
  games_demo_ui: "game-controller-outline",
  safety_ui: "shield-checkmark-outline",
  degraded_states: "warning-outline",
  release_guardrails: "checkmark-done-circle-outline",
};

export function StreamMobileUiRuntimeFreeFinalQaPanel197U({ compact = false, style }: StreamMobileUiRuntimeFreeFinalQaPanel197UProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const snapshot = useMemo(() => getStreamMobileUiRuntimeFreeFinalQaSnapshot197U(), []);
  const visibleLanes = compact ? snapshot.lanes.slice(0, 4) : snapshot.lanes.slice(0, 6);

  return (
    <View style={[styles.card, compact && styles.cardCompact, style]}>
      <LinearGradient colors={["rgba(30, 41, 59, 0.98)", "rgba(8, 13, 28, 0.99)"]} style={styles.gradient}>
        <View style={styles.headerRow}>
          <View style={styles.iconShell}>
            <Ionicons name="shield-checkmark-outline" size={23} color="#C4B5FD" />
          </View>
          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>197U · Runtime-free final QA</Text>
            <Text style={styles.title} numberOfLines={2}>{snapshot.titleRu}</Text>
            <Text style={styles.subtitle} numberOfLines={compact ? 2 : 3}>{snapshot.summaryRu}</Text>
          </View>
          <View style={styles.percentPill}>
            <Text style={styles.percentText}>{snapshot.mobileUiReadinessPercent}%</Text>
            <Text style={styles.percentCaption}>UI QA</Text>
          </View>
        </View>

        <View style={styles.metricsRow}>
          <View style={styles.metricPill}>
            <Text style={styles.metricValue}>{snapshot.userBlockerCount}</Text>
            <Text style={styles.metricLabel}>blockers</Text>
          </View>
          <View style={styles.metricPill}>
            <Text style={styles.metricValue}>{snapshot.fakeSuccessCount}</Text>
            <Text style={styles.metricLabel}>fake success</Text>
          </View>
          <View style={styles.metricPill}>
            <Text style={styles.metricValue}>{snapshot.rawDebugCopyCount}</Text>
            <Text style={styles.metricLabel}>debug copy</Text>
          </View>
        </View>

        <View style={styles.laneGrid}>
          {visibleLanes.map((lane) => (
            <View key={lane.key} style={styles.laneCard}>
              <View style={styles.laneIconRow}>
                <Ionicons name={laneIconMap[lane.key] ?? "checkmark-circle-outline"} size={16} color={lane.status === "passed" ? "#C4B5FD" : "#BAE6FD"} />
                <Text style={styles.laneStatus}>{lane.status === "passed" ? "passed" : "handoff"}</Text>
              </View>
              <Text style={styles.laneTitle} numberOfLines={2}>{lane.titleRu}</Text>
              <Text style={styles.laneText} numberOfLines={2}>{lane.acceptanceRu}</Text>
            </View>
          ))}
        </View>

        <View style={styles.boundaryBox}>
          <Ionicons name="server-outline" size={16} color="#C4B5FD" />
          <Text style={styles.boundaryText}>UI готов; real send, Wallet, provider, payout и available balance остаются только backend-ledger событиями.</Text>
        </View>

        <Pressable style={styles.detailsButton} onPress={() => setDetailsOpen(true)} accessibilityRole="button">
          <Ionicons name="clipboard-outline" size={17} color="#C4B5FD" />
          <Text style={styles.detailsButtonText}>Открыть final QA checklist</Text>
        </Pressable>
      </LinearGradient>

      <Modal visible={detailsOpen} transparent animationType="fade" onRequestClose={() => setDetailsOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderCopy}>
                <Text style={styles.modalEyebrow}>197U · Stream Mobile UI</Text>
                <Text style={styles.modalTitle}>Final runtime-free QA</Text>
              </View>
              <Pressable style={styles.closeButton} onPress={() => setDetailsOpen(false)} accessibilityRole="button">
                <Ionicons name="close" size={20} color="#FFFFFF" />
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalContent}>
              <Text style={styles.modalSummary}>{snapshot.scopeRu}</Text>

              {snapshot.lanes.map((lane) => (
                <View key={lane.key} style={styles.modalLaneCard}>
                  <View style={styles.modalLaneHeader}>
                    <Ionicons name={laneIconMap[lane.key] ?? "checkmark-circle-outline"} size={18} color={lane.status === "passed" ? "#C4B5FD" : "#BAE6FD"} />
                    <Text style={styles.modalLaneTitle}>{lane.titleRu}</Text>
                    <Text style={styles.modalLaneStatus}>{lane.status === "passed" ? "PASSED" : "HANDOFF"}</Text>
                  </View>
                  <Text style={styles.modalLaneText}>{lane.acceptanceRu}</Text>
                  <Text style={styles.modalLaneBoundary}>{lane.backendBoundaryRu}</Text>
                </View>
              ))}

              <Text style={styles.sectionTitle}>Guardrails</Text>
              {snapshot.guardrails.map((guardrail) => (
                <View key={guardrail.key} style={styles.guardrailRow}>
                  <Ionicons name="checkmark-circle-outline" size={18} color="#C4B5FD" />
                  <View style={styles.guardrailCopy}>
                    <Text style={styles.guardrailTitle}>{guardrail.titleRu}</Text>
                    <Text style={styles.guardrailText}>{guardrail.detailRu}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(196, 181, 253, 0.28)",
    backgroundColor: "rgba(15, 23, 42, 0.95)",
  },
  cardCompact: {
    marginHorizontal: 12,
    marginTop: 10,
    borderRadius: 20,
  },
  gradient: {
    padding: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  iconShell: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(196, 181, 253, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(196, 181, 253, 0.3)",
  },
  headerCopy: {
    flex: 1,
  },
  eyebrow: {
    color: "#C4B5FD",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },
  title: {
    marginTop: 3,
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "900",
  },
  subtitle: {
    marginTop: 6,
    color: "rgba(255,255,255,0.74)",
    fontSize: 12,
    lineHeight: 17,
  },
  percentPill: {
    minWidth: 70,
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 16,
    backgroundColor: "rgba(124, 58, 237, 0.16)",
    borderWidth: 1,
    borderColor: "rgba(196, 181, 253, 0.38)",
  },
  percentText: {
    color: "#EDE9FE",
    fontSize: 17,
    fontWeight: "900",
  },
  percentCaption: {
    color: "rgba(237,233,254,0.74)",
    fontSize: 9,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  metricsRow: {
    marginTop: 14,
    flexDirection: "row",
    gap: 8,
  },
  metricPill: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  metricValue: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },
  metricLabel: {
    marginTop: 2,
    color: "rgba(255,255,255,0.62)",
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  laneGrid: {
    marginTop: 14,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  laneCard: {
    width: "48%",
    minHeight: 112,
    borderRadius: 18,
    padding: 11,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.11)",
  },
  laneIconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  laneStatus: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  laneTitle: {
    marginTop: 8,
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
    lineHeight: 16,
  },
  laneText: {
    marginTop: 6,
    color: "rgba(255,255,255,0.65)",
    fontSize: 11,
    lineHeight: 15,
  },
  boundaryBox: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    borderRadius: 16,
    padding: 12,
    backgroundColor: "rgba(196, 181, 253, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(196, 181, 253, 0.22)",
  },
  boundaryText: {
    flex: 1,
    color: "rgba(255,255,255,0.76)",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
  },
  detailsButton: {
    marginTop: 12,
    minHeight: 42,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(196, 181, 253, 0.14)",
    borderWidth: 1,
    borderColor: "rgba(196, 181, 253, 0.28)",
  },
  detailsButtonText: {
    color: "#EDE9FE",
    fontSize: 12,
    fontWeight: "900",
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "center",
    padding: 18,
    backgroundColor: "rgba(2, 6, 23, 0.74)",
  },
  modalCard: {
    maxHeight: "86%",
    borderRadius: 26,
    overflow: "hidden",
    backgroundColor: "#0F172A",
    borderWidth: 1,
    borderColor: "rgba(196, 181, 253, 0.25)",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "rgba(30, 41, 59, 0.98)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  modalHeaderCopy: {
    flex: 1,
  },
  modalEyebrow: {
    color: "#C4B5FD",
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  modalTitle: {
    marginTop: 4,
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  modalContent: {
    padding: 16,
    paddingBottom: 24,
  },
  modalSummary: {
    color: "rgba(255,255,255,0.76)",
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
  },
  modalLaneCard: {
    marginTop: 12,
    borderRadius: 18,
    padding: 13,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  modalLaneHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  modalLaneTitle: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
  },
  modalLaneStatus: {
    color: "#C4B5FD",
    fontSize: 10,
    fontWeight: "900",
  },
  modalLaneText: {
    marginTop: 9,
    color: "rgba(255,255,255,0.76)",
    fontSize: 12,
    lineHeight: 17,
  },
  modalLaneBoundary: {
    marginTop: 7,
    color: "rgba(196,181,253,0.88)",
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "800",
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 8,
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },
  guardrailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.07)",
  },
  guardrailCopy: {
    flex: 1,
  },
  guardrailTitle: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },
  guardrailText: {
    marginTop: 4,
    color: "rgba(255,255,255,0.68)",
    fontSize: 11,
    lineHeight: 16,
  },
});
